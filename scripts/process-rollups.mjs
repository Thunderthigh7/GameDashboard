import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { gzipSync, gunzipSync } from "node:zlib";
import { loadLocalEnv } from "../lib/env.mjs";
import { getObjectStorageClient, getObjectStorageConfig } from "../lib/object-storage.mjs";

loadLocalEnv();

const LOOKBACK_HOURS = cleanPositiveInteger(process.env.ROLLUP_LOOKBACK_HOURS, 24);
const MAX_RAW_OBJECTS = cleanPositiveInteger(process.env.ROLLUP_MAX_RAW_OBJECTS, 5000);
const MAX_CHAT_LOGS = cleanPositiveInteger(process.env.ROLLUP_MAX_CHAT_LOGS, 2500);
const MAX_EVENT_SAMPLES = cleanPositiveInteger(process.env.ROLLUP_MAX_EVENT_SAMPLES, 5000);
const MAX_MOVEMENT_CELLS = cleanPositiveInteger(process.env.ROLLUP_MAX_MOVEMENT_CELLS, 5000);
const MOVEMENT_GRID_SIZE = cleanPositiveInteger(process.env.ROLLUP_MOVEMENT_GRID_SIZE, 12);
const UNIVERSE_IDS = parseUniverseIds(process.env.ROLLUP_UNIVERSE_IDS || "");

const objectStorageConfig = getObjectStorageConfig();
const objectStorageClient = await getObjectStorageClient();
const sinceMs = Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000;
const rawObjectKeys = await listRecentRawObjectKeys();
const rollupsByUniverseId = new Map();

for (const objectKey of rawObjectKeys) {
  const body = await readGzipObject(objectKey);
  ingestJsonLines(body, objectKey);
}

for (const rollup of rollupsByUniverseId.values()) {
  finalizeRollup(rollup);
  await writeRollup(rollup);
}

console.log(JSON.stringify({
  ok: true,
  rawObjectCount: rawObjectKeys.length,
  universeCount: rollupsByUniverseId.size,
  lookbackHours: LOOKBACK_HOURS,
  universes: [...rollupsByUniverseId.values()].map((rollup) => ({
    universeId: rollup.universeId,
    rawObjectCount: rollup.rawObjectCount,
    chatLogCount: rollup.chatLogs.length,
    movementSampleCount: rollup.movement.samples.length,
    deathSampleCount: rollup.deaths.samples.length,
    leaveSampleCount: rollup.leaves.samples.length,
    latestObjectKey: `rollups/${rollup.universeId}/latest.json`,
  })),
}, null, 2));

async function listRecentRawObjectKeys() {
  const prefixes = UNIVERSE_IDS.length
    ? UNIVERSE_IDS.map((universeId) => `raw/${universeId}/`)
    : ["raw/"];
  const keys = [];

  for (const prefix of prefixes) {
    let ContinuationToken;
    do {
      const response = await objectStorageClient.send(new ListObjectsV2Command({
        Bucket: objectStorageConfig.bucketName,
        Prefix: prefix,
        ContinuationToken,
        MaxKeys: 1000,
      }));

      for (const object of response.Contents || []) {
        if (!object.Key || !object.Key.endsWith(".jsonl.gz")) continue;
        if (object.LastModified && object.LastModified.getTime() < sinceMs) continue;

        keys.push(object.Key);
        if (keys.length >= MAX_RAW_OBJECTS) return keys;
      }

      ContinuationToken = response.NextContinuationToken;
    } while (ContinuationToken);
  }

  return keys;
}

async function readGzipObject(objectKey) {
  const response = await objectStorageClient.send(new GetObjectCommand({
    Bucket: objectStorageConfig.bucketName,
    Key: objectKey,
  }));
  const buffer = await streamToBuffer(response.Body);
  return gunzipSync(buffer).toString("utf8");
}

function ingestJsonLines(text, objectKey) {
  const lines = String(text || "").split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;

    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }

    const universeId = cleanPositiveInteger(event.universeId, 0);
    if (universeId <= 0) continue;
    if (UNIVERSE_IDS.length && !UNIVERSE_IDS.includes(universeId)) continue;

    const rollup = getUniverseRollup(universeId);
    rollup.rawObjectKeys.add(objectKey);
    rollup.lastSeenAt = Math.max(rollup.lastSeenAt, cleanTimestamp(event.receivedAt) || cleanTimestamp(event.sampledAt) || 0);

    if (event.type === "batch") {
      rollup.batchCount += 1;
      rollup.playerPeak = Math.max(rollup.playerPeak, cleanPositiveInteger(event.playerCount, 0));
      rollup.lastSeenAt = Math.max(rollup.lastSeenAt, cleanTimestamp(event.receivedAt));
    } else if (event.type === "chat") {
      addChatEvent(rollup, event);
    } else if (event.type === "movement") {
      addMovementEvent(rollup, event);
    } else if (event.type === "movement_rollup") {
      addMovementRollupEvent(rollup, event);
    } else if (event.type === "death") {
      addEventSample(rollup.deaths, event, "diedAt");
    } else if (event.type === "leave") {
      addEventSample(rollup.leaves, event, "leftAt");
    }
  }
}

function getUniverseRollup(universeId) {
  const key = String(universeId);
  let rollup = rollupsByUniverseId.get(key);
  if (!rollup) {
    rollup = {
      schemaVersion: 1,
      universeId,
      generatedAt: Date.now(),
      window: {
        from: sinceMs,
        to: Date.now(),
        lookbackHours: LOOKBACK_HOURS,
      },
      rawObjectKeys: new Set(),
      rawObjectCount: 0,
      batchCount: 0,
      playerPeak: 0,
      lastSeenAt: 0,
      chatLogs: [],
      movement: {
        source: "rollups",
        sampleCount: 0,
        cells: new Map(),
        samples: [],
      },
      deaths: {
        sampleCount: 0,
        samples: [],
      },
      leaves: {
        sampleCount: 0,
        samples: [],
      },
    };
    rollupsByUniverseId.set(key, rollup);
  }

  return rollup;
}

function addChatEvent(rollup, event) {
  rollup.chatLogs.push({
    id: cleanString(event.id, 180) || `${event.jobId || "job"}:${event.userId || 0}:${event.sentAt || event.receivedAt || Date.now()}`,
    universeId: rollup.universeId,
    placeId: cleanPositiveInteger(event.placeId, 0),
    jobId: cleanString(event.jobId, 128),
    userId: cleanPositiveInteger(event.userId, 0),
    username: cleanString(event.username, 64),
    displayName: cleanString(event.displayName, 64),
    message: cleanString(event.message, 500),
    x: cleanFiniteNumberOrNull(event.x),
    y: cleanFiniteNumberOrNull(event.y),
    z: cleanFiniteNumberOrNull(event.z),
    sentAt: cleanTimestamp(event.sentAt) || cleanTimestamp(event.receivedAt),
    sampledAt: cleanTimestamp(event.sentAt) || cleanTimestamp(event.receivedAt),
    receivedAt: cleanTimestamp(event.receivedAt),
  });
}

function addMovementEvent(rollup, event) {
  const x = cleanFiniteNumberOrNull(event.x);
  const y = cleanFiniteNumberOrNull(event.y);
  const z = cleanFiniteNumberOrNull(event.z);
  if (x === null || y === null || z === null) return;

  addMovementCell(rollup, {
    x,
    y,
    z,
    count: 1,
    sampledAt: cleanTimestamp(event.sampledAt) || cleanTimestamp(event.receivedAt),
    receivedAt: cleanTimestamp(event.receivedAt),
  });
}

function addMovementRollupEvent(rollup, event) {
  const x = cleanFiniteNumberOrNull(event.x);
  const y = cleanFiniteNumberOrNull(event.y);
  const z = cleanFiniteNumberOrNull(event.z);
  if (x === null || y === null || z === null) return;

  addMovementCell(rollup, {
    x,
    y,
    z,
    count: cleanPositiveInteger(event.movementCount, 0) || cleanPositiveInteger(event.sampleCount, 0) || 1,
    sampledAt: cleanTimestamp(event.sampledAt) || cleanTimestamp(event.bucketEnd) || cleanTimestamp(event.receivedAt),
    receivedAt: cleanTimestamp(event.receivedAt),
  });
}

function addMovementCell(rollup, event) {
  const gridX = Math.round(event.x / MOVEMENT_GRID_SIZE);
  const gridZ = Math.round(event.z / MOVEMENT_GRID_SIZE);
  const key = `${gridX}:${gridZ}`;
  const existing = rollup.movement.cells.get(key) || {
    id: `rollup:${rollup.universeId}:${MOVEMENT_GRID_SIZE}:${gridX}:${gridZ}`,
    universeId: rollup.universeId,
    placeId: 0,
    jobId: "b2-rollup",
    userId: 0,
    username: "Movement rollup",
    displayName: "Movement rollup",
    gridSize: MOVEMENT_GRID_SIZE,
    gridX,
    gridZ,
    x: 0,
    y: 0,
    z: 0,
    movementCount: 0,
    sampleCount: 0,
    count: 0,
    sampledAt: 0,
    receivedAt: 0,
  };

  const nextCount = existing.movementCount + event.count;
  existing.x = ((existing.x * existing.movementCount) + (event.x * event.count)) / nextCount;
  existing.y = ((existing.y * existing.movementCount) + (event.y * event.count)) / nextCount;
  existing.z = ((existing.z * existing.movementCount) + (event.z * event.count)) / nextCount;
  existing.movementCount = nextCount;
  existing.sampleCount = nextCount;
  existing.count = nextCount;
  existing.sampledAt = Math.max(existing.sampledAt, event.sampledAt);
  existing.receivedAt = Math.max(existing.receivedAt, event.receivedAt);
  rollup.movement.sampleCount += event.count;
  rollup.movement.cells.set(key, existing);
}

function addEventSample(target, event, timestampField) {
  const x = cleanFiniteNumberOrNull(event.x);
  const y = cleanFiniteNumberOrNull(event.y);
  const z = cleanFiniteNumberOrNull(event.z);
  if (x === null || y === null || z === null) return;

  target.sampleCount += 1;
  target.samples.push({
    id: cleanString(event.id, 180) || `${event.jobId || "job"}:${event.userId || 0}:${event[timestampField] || event.sampledAt || Date.now()}`,
    universeId: cleanPositiveInteger(event.universeId, 0),
    placeId: cleanPositiveInteger(event.placeId, 0),
    jobId: cleanString(event.jobId, 128),
    userId: cleanPositiveInteger(event.userId, 0),
    username: cleanString(event.username, 64),
    displayName: cleanString(event.displayName, 64),
    x,
    y,
    z,
    [timestampField]: cleanTimestamp(event[timestampField]) || cleanTimestamp(event.sampledAt) || cleanTimestamp(event.receivedAt),
    sampledAt: cleanTimestamp(event.sampledAt) || cleanTimestamp(event[timestampField]) || cleanTimestamp(event.receivedAt),
    receivedAt: cleanTimestamp(event.receivedAt),
  });
}

function finalizeRollup(rollup) {
  rollup.rawObjectCount = rollup.rawObjectKeys.size;
  rollup.rawObjectKeys = [...rollup.rawObjectKeys].sort();
  rollup.chatLogs.sort((a, b) => b.sentAt - a.sentAt || b.receivedAt - a.receivedAt);
  rollup.chatLogs = rollup.chatLogs.slice(0, MAX_CHAT_LOGS);
  rollup.movement.samples = [...rollup.movement.cells.values()]
    .sort((a, b) => b.movementCount - a.movementCount || b.sampledAt - a.sampledAt)
    .slice(0, MAX_MOVEMENT_CELLS);
  delete rollup.movement.cells;
  rollup.deaths.samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  rollup.leaves.samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  rollup.deaths.samples = rollup.deaths.samples.slice(0, MAX_EVENT_SAMPLES);
  rollup.leaves.samples = rollup.leaves.samples.slice(0, MAX_EVENT_SAMPLES);
}

async function writeRollup(rollup) {
  const date = new Date(rollup.generatedAt);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const versionedKey = `rollups/${rollup.universeId}/${year}/${month}/${day}/${hour}.json.gz`;
  const latestKey = `rollups/${rollup.universeId}/latest.json`;
  const json = JSON.stringify(rollup);

  await objectStorageClient.send(new PutObjectCommand({
    Bucket: objectStorageConfig.bucketName,
    Key: versionedKey,
    Body: gzipSync(Buffer.from(json, "utf8")),
    ContentType: "application/json",
    ContentEncoding: "gzip",
  }));

  await objectStorageClient.send(new PutObjectCommand({
    Bucket: objectStorageConfig.bucketName,
    Key: latestKey,
    Body: json,
    ContentType: "application/json",
  }));
}

async function streamToBuffer(stream) {
  if (!stream) return Buffer.alloc(0);
  if (Buffer.isBuffer(stream)) return stream;

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function parseUniverseIds(value) {
  return String(value || "")
    .split(",")
    .map((item) => cleanPositiveInteger(item, 0))
    .filter((item) => item > 0);
}

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanPositiveInteger(value, fallback = 1) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function cleanFiniteNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanTimestamp(value) {
  const number = cleanPositiveInteger(value, 0);
  if (number <= 0) return 0;
  return number < 10_000_000_000 ? number * 1000 : number;
}


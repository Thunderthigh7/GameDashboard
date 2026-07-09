import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { gzipSync, gunzipSync } from "node:zlib";
import { loadLocalEnv } from "../lib/env.mjs";
import { getObjectStorageClient, getObjectStorageConfig } from "../lib/object-storage.mjs";

loadLocalEnv();

const RETENTION_DAYS = cleanPositiveInteger(
  process.env.B2_MAINTENANCE_RETENTION_DAYS || process.env.B2_RAW_ANALYTICS_RETENTION_DAYS,
  14,
);
const LOOKBACK_HOURS = cleanPositiveInteger(
  process.env.B2_MAINTENANCE_LOOKBACK_HOURS || process.env.ROLLUP_LOOKBACK_HOURS,
  24,
);
const MAX_RAW_OBJECTS = cleanPositiveInteger(
  process.env.B2_MAINTENANCE_MAX_RAW_OBJECTS || process.env.ROLLUP_MAX_RAW_OBJECTS,
  10000,
);
const MAX_DELETE_OBJECTS = cleanPositiveInteger(process.env.B2_MAINTENANCE_MAX_DELETE_OBJECTS, 5000);
const MAX_CHAT_LOGS = cleanPositiveInteger(process.env.ROLLUP_MAX_CHAT_LOGS, 2500);
const MAX_EVENT_SAMPLES = cleanPositiveInteger(process.env.ROLLUP_MAX_EVENT_SAMPLES, 5000);
const MAX_MOVEMENT_CELLS = cleanPositiveInteger(process.env.ROLLUP_MAX_MOVEMENT_CELLS, 5000);
const MOVEMENT_GRID_SIZE = cleanPositiveInteger(process.env.ROLLUP_MOVEMENT_GRID_SIZE, 12);
const B2_STORAGE_USD_PER_TB_MONTH = cleanFiniteNumber(process.env.B2_STORAGE_USD_PER_TB_MONTH, 6.95);
const UNIVERSE_IDS = parseUniverseIds(process.env.B2_MAINTENANCE_UNIVERSE_IDS || process.env.ROLLUP_UNIVERSE_IDS || "");
const DRY_RUN = cleanBoolean(process.env.B2_MAINTENANCE_DRY_RUN);

const objectStorageConfig = getObjectStorageConfig();
const objectStorageClient = await getObjectStorageClient();
const startedAt = Date.now();
const sinceMs = startedAt - LOOKBACK_HOURS * 60 * 60 * 1000;
const retentionCutoffMs = startedAt - RETENTION_DAYS * 24 * 60 * 60 * 1000;
const rollupsByUniverseId = new Map();
const statsByUniverseId = new Map();
const errors = [];

const rawScan = await listRawObjects();
const expiredRawObjects = [];
const recentRawObjects = [];

for (const object of rawScan.objects) {
  const universeId = getRawUniverseId(object.Key);
  if (universeId <= 0) continue;

  const stats = getUniverseStats(universeId);
  const size = cleanPositiveInteger(object.Size, 0);
  const lastModifiedMs = object.LastModified ? object.LastModified.getTime() : 0;
  stats.rawObjectCount += 1;
  stats.rawBytes += size;
  stats.latestRawObjectAt = Math.max(stats.latestRawObjectAt, lastModifiedMs);

  if (lastModifiedMs > 0 && lastModifiedMs < retentionCutoffMs) {
    expiredRawObjects.push(object);
    stats.expiredRawObjectCount += 1;
    stats.expiredRawBytes += size;
    continue;
  }

  stats.retainedRawObjectCount += 1;
  stats.retainedRawBytes += size;

  if (!object.Key.endsWith(".jsonl.gz")) continue;
  if (lastModifiedMs > 0 && lastModifiedMs < sinceMs) continue;
  recentRawObjects.push(object);
  stats.rollupSourceObjectCount += 1;
}

const deleted = await deleteExpiredRawObjects(expiredRawObjects);

for (const object of recentRawObjects) {
  try {
    const body = await readGzipObject(object.Key);
    ingestJsonLines(body, object.Key);
  } catch (error) {
    errors.push({
      objectKey: object.Key,
      error: error.message || String(error),
    });
  }
}

for (const rollup of rollupsByUniverseId.values()) {
  finalizeRollup(rollup);
  try {
    const writeResult = await writeRollup(rollup);
    const stats = getUniverseStats(rollup.universeId);
    stats.rollupWritten = true;
    stats.rollupLatestKey = writeResult.latestKey;
    stats.rollupVersionedKey = writeResult.versionedKey;
    stats.rollupBytesWritten += writeResult.latestBytes + writeResult.versionedBytes;
    stats.chatLogCount = rollup.chatLogs.length;
    stats.movementSampleCount = rollup.movement.samples.length;
    stats.deathSampleCount = rollup.deaths.samples.length;
    stats.leaveSampleCount = rollup.leaves.samples.length;
  } catch (error) {
    errors.push({
      universeId: rollup.universeId,
      error: error.message || String(error),
    });
  }
}

await attachRollupStorageStats();

for (const stats of statsByUniverseId.values()) {
  stats.projectedMonthlyB2StorageCostUsd = roundMoney(
    ((stats.retainedRawBytes + stats.rollupBytes) / 1_000_000_000_000) * B2_STORAGE_USD_PER_TB_MONTH,
  );
}

const report = buildMaintenanceReport(rawScan, deleted);
await writeMaintenanceReport(report);
console.log(JSON.stringify(report, null, 2));

if (!report.ok) {
  process.exitCode = 1;
}

async function listRawObjects() {
  const prefixes = UNIVERSE_IDS.length
    ? UNIVERSE_IDS.map((universeId) => `raw/${universeId}/`)
    : ["raw/"];
  const objects = [];
  let truncated = false;

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
        if (!object.Key) continue;
        objects.push({
          Key: object.Key,
          Size: cleanPositiveInteger(object.Size, 0),
          LastModified: object.LastModified || null,
        });

        if (objects.length >= MAX_RAW_OBJECTS) {
          truncated = Boolean(response.NextContinuationToken) || true;
          return { objects, truncated };
        }
      }

      ContinuationToken = response.NextContinuationToken;
    } while (ContinuationToken);
  }

  return { objects, truncated };
}

async function deleteExpiredRawObjects(objects) {
  const summary = {
    requestedObjectCount: objects.length,
    requestedBytes: objects.reduce((total, object) => total + cleanPositiveInteger(object.Size, 0), 0),
    deletedObjectCount: 0,
    deletedBytes: 0,
    skippedObjectCount: Math.max(0, objects.length - MAX_DELETE_OBJECTS),
    dryRun: DRY_RUN,
  };
  const candidates = objects.slice(0, MAX_DELETE_OBJECTS);
  if (!candidates.length || DRY_RUN) return summary;

  for (let index = 0; index < candidates.length; index += 1000) {
    const batch = candidates.slice(index, index + 1000);
    await objectStorageClient.send(new DeleteObjectsCommand({
      Bucket: objectStorageConfig.bucketName,
      Delete: {
        Objects: batch.map((object) => ({ Key: object.Key })),
        Quiet: true,
      },
    }));

    summary.deletedObjectCount += batch.length;
    summary.deletedBytes += batch.reduce((total, object) => total + cleanPositiveInteger(object.Size, 0), 0);
  }

  return summary;
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
      generatedAt: startedAt,
      window: {
        from: sinceMs,
        to: startedAt,
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
  const gzipped = gzipSync(Buffer.from(json, "utf8"));

  await objectStorageClient.send(new PutObjectCommand({
    Bucket: objectStorageConfig.bucketName,
    Key: versionedKey,
    Body: gzipped,
    ContentType: "application/json",
    ContentEncoding: "gzip",
  }));

  await objectStorageClient.send(new PutObjectCommand({
    Bucket: objectStorageConfig.bucketName,
    Key: latestKey,
    Body: json,
    ContentType: "application/json",
  }));

  return {
    latestKey,
    versionedKey,
    latestBytes: Buffer.byteLength(json, "utf8"),
    versionedBytes: gzipped.length,
  };
}

async function attachRollupStorageStats() {
  const universeIds = [...statsByUniverseId.keys()];
  for (const universeId of universeIds) {
    let ContinuationToken;
    do {
      const response = await objectStorageClient.send(new ListObjectsV2Command({
        Bucket: objectStorageConfig.bucketName,
        Prefix: `rollups/${universeId}/`,
        ContinuationToken,
        MaxKeys: 1000,
      }));

      const stats = getUniverseStats(universeId);
      for (const object of response.Contents || []) {
        if (!object.Key) continue;
        stats.rollupObjectCount += 1;
        stats.rollupBytes += cleanPositiveInteger(object.Size, 0);
      }

      ContinuationToken = response.NextContinuationToken;
    } while (ContinuationToken);
  }
}

function buildMaintenanceReport(rawScan, deleted) {
  const universes = [...statsByUniverseId.values()]
    .sort((a, b) => b.retainedRawBytes - a.retainedRawBytes || Number(a.universeId) - Number(b.universeId));
  const totals = universes.reduce((summary, stats) => ({
    rawObjectCount: summary.rawObjectCount + stats.rawObjectCount,
    rawBytes: summary.rawBytes + stats.rawBytes,
    retainedRawObjectCount: summary.retainedRawObjectCount + stats.retainedRawObjectCount,
    retainedRawBytes: summary.retainedRawBytes + stats.retainedRawBytes,
    expiredRawObjectCount: summary.expiredRawObjectCount + stats.expiredRawObjectCount,
    expiredRawBytes: summary.expiredRawBytes + stats.expiredRawBytes,
    rollupObjectCount: summary.rollupObjectCount + stats.rollupObjectCount,
    rollupBytes: summary.rollupBytes + stats.rollupBytes,
    rollupBytesWritten: summary.rollupBytesWritten + stats.rollupBytesWritten,
    projectedMonthlyB2StorageCostUsd: roundMoney(summary.projectedMonthlyB2StorageCostUsd + stats.projectedMonthlyB2StorageCostUsd),
  }), {
    rawObjectCount: 0,
    rawBytes: 0,
    retainedRawObjectCount: 0,
    retainedRawBytes: 0,
    expiredRawObjectCount: 0,
    expiredRawBytes: 0,
    rollupObjectCount: 0,
    rollupBytes: 0,
    rollupBytesWritten: 0,
    projectedMonthlyB2StorageCostUsd: 0,
  });
  const ok = !rawScan.truncated && deleted.skippedObjectCount === 0 && errors.length === 0;

  return {
    ok,
    dryRun: DRY_RUN,
    generatedAt: startedAt,
    finishedAt: Date.now(),
    durationMs: Date.now() - startedAt,
    bucket: objectStorageConfig.bucketName,
    retentionDays: RETENTION_DAYS,
    retentionCutoffMs,
    lookbackHours: LOOKBACK_HOURS,
    sinceMs,
    maxRawObjects: MAX_RAW_OBJECTS,
    rawScanTruncated: rawScan.truncated,
    deleted,
    totals,
    universeCount: universes.length,
    universes,
    errors,
  };
}

async function writeMaintenanceReport(report) {
  const body = JSON.stringify(report);
  const date = new Date(report.generatedAt);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const versionedKey = `maintenance/b2/${year}/${month}/${day}/${hour}-${report.generatedAt}.json`;
  const latestKey = "maintenance/b2/latest.json";

  await objectStorageClient.send(new PutObjectCommand({
    Bucket: objectStorageConfig.bucketName,
    Key: versionedKey,
    Body: body,
    ContentType: "application/json",
  }));

  await objectStorageClient.send(new PutObjectCommand({
    Bucket: objectStorageConfig.bucketName,
    Key: latestKey,
    Body: body,
    ContentType: "application/json",
  }));
}

function getUniverseStats(universeId) {
  const key = String(universeId);
  let stats = statsByUniverseId.get(key);
  if (!stats) {
    stats = {
      universeId,
      rawObjectCount: 0,
      rawBytes: 0,
      retainedRawObjectCount: 0,
      retainedRawBytes: 0,
      expiredRawObjectCount: 0,
      expiredRawBytes: 0,
      rollupSourceObjectCount: 0,
      rollupWritten: false,
      rollupLatestKey: null,
      rollupVersionedKey: null,
      rollupObjectCount: 0,
      rollupBytes: 0,
      rollupBytesWritten: 0,
      chatLogCount: 0,
      movementSampleCount: 0,
      deathSampleCount: 0,
      leaveSampleCount: 0,
      latestRawObjectAt: 0,
      projectedMonthlyB2StorageCostUsd: 0,
    };
    statsByUniverseId.set(key, stats);
  }

  return stats;
}

function getRawUniverseId(objectKey) {
  const match = String(objectKey || "").match(/^raw\/(\d+)\//);
  return cleanPositiveInteger(match?.[1], 0);
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

function cleanFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
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

function cleanBoolean(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 10000) / 10000;
}

import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { gzipSync, gunzipSync } from "node:zlib";
import { loadLocalEnv } from "../lib/env.mjs";
import {
  destroyObjectStorageClient,
  getObjectStorageClient,
  getObjectStorageConfig,
} from "../lib/object-storage.mjs";

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
const MAX_VERSION_ROLLUPS = cleanPositiveInteger(process.env.ROLLUP_MAX_VERSIONS, 50);
const MOVEMENT_GRID_SIZE = cleanPositiveInteger(process.env.ROLLUP_MOVEMENT_GRID_SIZE, 12);
const READ_CONCURRENCY = cleanBoundedInteger(process.env.B2_MAINTENANCE_READ_CONCURRENCY, 8, 1, 32);
const B2_STORAGE_USD_PER_TB_MONTH = cleanFiniteNumber(process.env.B2_STORAGE_USD_PER_TB_MONTH, 6.95);
const UNIVERSE_IDS = parseUniverseIds(process.env.B2_MAINTENANCE_UNIVERSE_IDS || process.env.ROLLUP_UNIVERSE_IDS || "");
const DRY_RUN = cleanBoolean(process.env.B2_MAINTENANCE_DRY_RUN);

const objectStorageConfig = getObjectStorageConfig();
const objectStorageClient = await getObjectStorageClient();
process.once("exit", destroyObjectStorageClient);
const startedAt = Date.now();
const sinceMs = startedAt - LOOKBACK_HOURS * 60 * 60 * 1000;
const retentionCutoffMs = startedAt - RETENTION_DAYS * 24 * 60 * 60 * 1000;
const rollupsByUniverseId = new Map();
const statsByUniverseId = new Map();
const errors = [];
const failedRawObjectUniverseIds = new Set();
let skipAllRollupWrites = false;

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

for (let startIndex = 0; startIndex < recentRawObjects.length; startIndex += READ_CONCURRENCY) {
  const batch = recentRawObjects.slice(startIndex, startIndex + READ_CONCURRENCY);
  const batchResults = await Promise.all(batch.map(async (object) => {
    try {
      return { objectKey: object.Key, body: await readGzipObject(object.Key) };
    } catch (error) {
      const failedUniverseId = getRawUniverseId(object.Key);
      if (failedUniverseId > 0) {
        failedRawObjectUniverseIds.add(failedUniverseId);
      } else {
        skipAllRollupWrites = true;
      }
      errors.push({
        objectKey: object.Key,
        error: error.message || String(error),
      });
      return null;
    }
  }));

  for (const result of batchResults) {
    if (result) ingestJsonLines(result.body, result.objectKey);
  }
}

const rollups = [...rollupsByUniverseId.values()];
for (const rollup of rollups) {
  finalizeRollup(rollup);
}

await forEachWithConcurrency(rollups, Math.min(READ_CONCURRENCY, 8), async (rollup) => {
  const stats = getUniverseStats(rollup.universeId);
  if (skipAllRollupWrites || failedRawObjectUniverseIds.has(rollup.universeId)) {
    stats.rollupWriteSkipped = true;
    stats.rollupWriteSkipReason = skipAllRollupWrites
      ? "unparseable_failed_raw_object_key"
      : "failed_raw_object";
    return;
  }

  try {
    const writeResult = await writeRollup(rollup);
    stats.rollupWritten = true;
    stats.rollupLatestKey = writeResult.latestKey;
    stats.rollupVersionedKey = writeResult.versionedKey;
    stats.rollupBytesWritten += writeResult.latestBytes + writeResult.versionedBytes;
    stats.chatLogCount = rollup.chatLogs.length;
    stats.movementSampleCount = rollup.movement.samples.length;
    stats.deathSampleCount = rollup.deaths.samples.length;
    stats.leaveSampleCount = rollup.leaves.samples.length;
    stats.customEventCount = rollup.customEvents.samples.length;
    stats.versionCount = rollup.versions.length;
  } catch (error) {
    errors.push({
      universeId: rollup.universeId,
      error: error.message || String(error),
    });
  }
});

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

destroyObjectStorageClient();

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
    ingestRollupEvent(rollup, event, objectKey);
    const versionRollup = getVersionRollup(rollup, event);
    if (versionRollup) ingestRollupEvent(versionRollup, event, objectKey);
  }
}

function ingestRollupEvent(rollup, event, objectKey) {
  rollup.rawObjectKeys.add(objectKey);
  const observedAt = cleanTimestamp(event.occurredAt)
    || cleanTimestamp(event.sentAt)
    || cleanTimestamp(event.diedAt)
    || cleanTimestamp(event.leftAt)
    || cleanTimestamp(event.sampledAt)
    || cleanTimestamp(event.receivedAt)
    || 0;
  rollup.firstSeenAt = observedAt > 0 && rollup.firstSeenAt > 0 ? Math.min(rollup.firstSeenAt, observedAt) : Math.max(rollup.firstSeenAt, observedAt);
  rollup.lastSeenAt = Math.max(rollup.lastSeenAt, observedAt);
  const sessionId = cleanString(event.sessionId, 180);
  if (sessionId) rollup.sessionIds.add(sessionId);

  if (event.type === "batch") {
    rollup.batchCount += 1;
    rollup.playerPeak = Math.max(rollup.playerPeak, cleanPositiveInteger(event.playerCount, 0));
    rollup.lastSeenAt = Math.max(rollup.lastSeenAt, cleanTimestamp(event.receivedAt));
    for (const player of Array.isArray(event.players) ? event.players : []) {
      const userId = cleanPositiveInteger(player?.userId, 0);
      if (userId <= 0) continue;
      rollup.sessionIds.add(`${cleanString(event.jobId, 128) || "job"}:${userId}:${cleanTimestamp(player?.joinedAt) || 0}`);
    }
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
  } else if (event.type === "custom_event") {
    addCustomEvent(rollup, event);
  }
}

function getUniverseRollup(universeId) {
  const key = String(universeId);
  let rollup = rollupsByUniverseId.get(key);
  if (!rollup) {
    rollup = {
      schemaVersion: 3,
      universeId,
      generatedAt: startedAt,
      window: {
        from: sinceMs,
        to: startedAt,
        lookbackHours: LOOKBACK_HOURS,
      },
      ...createRollupAccumulator(),
      versionRollups: new Map(),
      droppedVersionKeys: new Set(),
    };
    rollupsByUniverseId.set(key, rollup);
  }

  return rollup;
}

function createRollupAccumulator() {
  return {
    rawObjectKeys: new Set(),
    rawObjectCount: 0,
    batchCount: 0,
    playerPeak: 0,
    sessionIds: new Set(),
    sessionCount: 0,
    firstSeenAt: 0,
    lastSeenAt: 0,
    chatLogs: [],
    movement: { source: "rollups", sampleCount: 0, cells: new Map(), samples: [] },
    deaths: { sampleCount: 0, samples: [] },
    leaves: { sampleCount: 0, samples: [] },
    customEvents: { sampleCount: 0, samples: [] },
  };
}

function getVersionRollup(rollup, event) {
  const placeId = cleanPositiveInteger(event.placeId, 0);
  const placeVersion = cleanNonNegativeInteger(event.placeVersion, 0);
  const environment = cleanAnalyticsEnvironment(event.environment, placeVersion);
  const key = `${placeId}:${placeVersion}:${environment}`;
  let versionRollup = rollup.versionRollups.get(key);
  if (!versionRollup && rollup.versionRollups.size < MAX_VERSION_ROLLUPS) {
    versionRollup = {
      schemaVersion: 1,
      universeId: rollup.universeId,
      placeId,
      placeVersion,
      environment,
      ...createRollupAccumulator(),
    };
    rollup.versionRollups.set(key, versionRollup);
  } else if (!versionRollup) {
    rollup.droppedVersionKeys.add(key);
  }
  return versionRollup || null;
}

function addChatEvent(rollup, event) {
  rollup.chatLogs.push({
    id: cleanString(event.id, 180) || `${event.jobId || "job"}:${event.userId || 0}:${event.sentAt || event.receivedAt || Date.now()}`,
    universeId: rollup.universeId,
    placeId: cleanPositiveInteger(event.placeId, 0),
    placeVersion: cleanNonNegativeInteger(event.placeVersion, 0),
    environment: cleanAnalyticsEnvironment(event.environment, event.placeVersion),
    jobId: cleanString(event.jobId, 128),
    userId: cleanPositiveInteger(event.userId, 0),
    username: cleanString(event.username, 64),
    displayName: cleanString(event.displayName, 64),
    sessionId: cleanString(event.sessionId, 180),
    message: cleanString(event.message, 500),
    x: cleanFiniteNumberOrNull(event.x),
    y: cleanFiniteNumberOrNull(event.y),
    z: cleanFiniteNumberOrNull(event.z),
    sentAt: cleanTimestamp(event.sentAt) || cleanTimestamp(event.receivedAt),
    sampledAt: cleanTimestamp(event.sentAt) || cleanTimestamp(event.receivedAt),
    receivedAt: cleanTimestamp(event.receivedAt),
  });
  trimNewestSamples(rollup.chatLogs, MAX_CHAT_LOGS, compareChatSamples);
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
    id: `rollup:${rollup.universeId}:${cleanPositiveInteger(rollup.placeId, 0)}:${cleanNonNegativeInteger(rollup.placeVersion, 0)}:${MOVEMENT_GRID_SIZE}:${gridX}:${gridZ}`,
    universeId: rollup.universeId,
    placeId: cleanPositiveInteger(rollup.placeId, 0),
    placeVersion: cleanNonNegativeInteger(rollup.placeVersion, 0),
    environment: rollup.environment || "mixed",
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
    placeVersion: cleanNonNegativeInteger(event.placeVersion, 0),
    environment: cleanAnalyticsEnvironment(event.environment, event.placeVersion),
    jobId: cleanString(event.jobId, 128),
    userId: cleanPositiveInteger(event.userId, 0),
    username: cleanString(event.username, 64),
    displayName: cleanString(event.displayName, 64),
    sessionId: cleanString(event.sessionId, 180),
    x,
    y,
    z,
    [timestampField]: cleanTimestamp(event[timestampField]) || cleanTimestamp(event.sampledAt) || cleanTimestamp(event.receivedAt),
    sampledAt: cleanTimestamp(event.sampledAt) || cleanTimestamp(event[timestampField]) || cleanTimestamp(event.receivedAt),
    receivedAt: cleanTimestamp(event.receivedAt),
  });
  trimNewestSamples(target.samples, MAX_EVENT_SAMPLES, compareEventSamples);
}

function addCustomEvent(rollup, event) {
  const eventName = cleanString(event.eventName, 64).toLowerCase();
  if (!/^[a-z][a-z0-9_.:-]{0,63}$/.test(eventName)) return;

  rollup.customEvents.sampleCount += 1;
  rollup.customEvents.samples.push({
    id: cleanString(event.id, 180) || `${event.jobId || "job"}:${eventName}:${event.userId || 0}:${event.occurredAt || event.receivedAt || Date.now()}`,
    universeId: rollup.universeId,
    placeId: cleanPositiveInteger(event.placeId, 0),
    placeVersion: cleanNonNegativeInteger(event.placeVersion, 0),
    environment: cleanAnalyticsEnvironment(event.environment, event.placeVersion),
    jobId: cleanString(event.jobId, 128),
    eventName,
    userId: cleanPositiveInteger(event.userId, 0) || null,
    username: cleanString(event.username, 64),
    displayName: cleanString(event.displayName, 64),
    sessionId: cleanString(event.sessionId, 180),
    value: typeof event.value === "number" ? cleanFiniteNumberOrNull(event.value) : null,
    properties: cleanCustomEventProperties(event.properties),
    propertiesTruncated: Boolean(event.propertiesTruncated),
    x: cleanFiniteNumberOrNull(event.x),
    y: cleanFiniteNumberOrNull(event.y),
    z: cleanFiniteNumberOrNull(event.z),
    occurredAt: cleanTimestamp(event.occurredAt) || cleanTimestamp(event.receivedAt),
    receivedAt: cleanTimestamp(event.receivedAt),
  });
  trimNewestSamples(rollup.customEvents.samples, MAX_EVENT_SAMPLES, compareCustomEvents);
}

function cleanCustomEventProperties(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const properties = {};
  for (const [key, entry] of Object.entries(value).sort(([left], [right]) => left.localeCompare(right))) {
    if (Object.keys(properties).length >= 20) break;
    const isCanonicalPath = /^[A-Za-z][A-Za-z0-9_:-]*(?:\[\])?(?:\.[A-Za-z][A-Za-z0-9_:-]*(?:\[\])?)*$/.test(key);
    const isLegacyFlatKey = key.length <= 48 && /^[A-Za-z][A-Za-z0-9_.:-]{0,47}$/.test(key);
    if (key.length > 96 || (!isCanonicalPath && !isLegacyFlatKey)) continue;
    const observations = (Array.isArray(entry) ? entry : [entry])
      .slice(0, 40)
      .filter((item) => typeof item === "string" || typeof item === "boolean" || (typeof item === "number" && Number.isFinite(item)))
      .map((item) => typeof item === "string" ? item.slice(0, 240) : item);
    if (observations.length) properties[key] = observations.length === 1 ? observations[0] : observations;
  }
  return properties;
}

function compareCustomEvents(left, right) {
  return (cleanTimestamp(right.occurredAt) || cleanTimestamp(right.receivedAt))
    - (cleanTimestamp(left.occurredAt) || cleanTimestamp(left.receivedAt));
}

function finalizeRollup(rollup) {
  const versions = [...rollup.versionRollups.values()];
  for (const versionRollup of versions) finalizeRollupData(versionRollup);
  rollup.versions = versions
    .sort((left, right) => right.lastSeenAt - left.lastSeenAt || right.placeVersion - left.placeVersion);
  rollup.versionRollupLimit = MAX_VERSION_ROLLUPS;
  rollup.versionRollupsTruncated = rollup.droppedVersionKeys.size > 0;
  rollup.droppedVersionCount = rollup.droppedVersionKeys.size;
  delete rollup.versionRollups;
  delete rollup.droppedVersionKeys;
  finalizeRollupData(rollup);
}

function finalizeRollupData(rollup) {
  rollup.rawObjectCount = rollup.rawObjectKeys.size;
  rollup.rawObjectKeys = [...rollup.rawObjectKeys].sort();
  rollup.sessionCount = rollup.sessionIds.size;
  delete rollup.sessionIds;
  rollup.chatLogs.sort(compareChatSamples);
  rollup.chatLogs = rollup.chatLogs.slice(0, MAX_CHAT_LOGS);
  rollup.movement.samples = [...rollup.movement.cells.values()]
    .sort((a, b) => b.movementCount - a.movementCount || b.sampledAt - a.sampledAt)
    .slice(0, MAX_MOVEMENT_CELLS);
  delete rollup.movement.cells;
  rollup.deaths.samples.sort(compareEventSamples);
  rollup.leaves.samples.sort(compareEventSamples);
  rollup.customEvents.samples.sort(compareCustomEvents);
  rollup.deaths.samples = rollup.deaths.samples.slice(0, MAX_EVENT_SAMPLES);
  rollup.leaves.samples = rollup.leaves.samples.slice(0, MAX_EVENT_SAMPLES);
  rollup.customEvents.samples = rollup.customEvents.samples.slice(0, MAX_EVENT_SAMPLES);
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
  await forEachWithConcurrency(universeIds, Math.min(READ_CONCURRENCY, 8), async (universeId) => {
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
  });
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
    failedRawObjectUniverseIds: [...failedRawObjectUniverseIds].sort((a, b) => a - b),
    skipAllRollupWrites,
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
      rollupWriteSkipped: false,
      rollupWriteSkipReason: null,
      rollupLatestKey: null,
      rollupVersionedKey: null,
      rollupObjectCount: 0,
      rollupBytes: 0,
      rollupBytesWritten: 0,
      chatLogCount: 0,
      movementSampleCount: 0,
      deathSampleCount: 0,
      leaveSampleCount: 0,
      customEventCount: 0,
      versionCount: 0,
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

function cleanNonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

function cleanAnalyticsEnvironment(value, placeVersion = 0) {
  const environment = cleanString(value, 32).toLowerCase();
  if (environment === "production" || environment === "studio") return environment;
  return cleanNonNegativeInteger(placeVersion, 0) > 0 ? "production" : "unversioned";
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

function cleanBoundedInteger(value, fallback, minimum, maximum) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

function compareChatSamples(a, b) {
  return b.sentAt - a.sentAt || b.receivedAt - a.receivedAt;
}

function compareEventSamples(a, b) {
  return b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt;
}

function trimNewestSamples(samples, maximum, compare) {
  if (samples.length <= maximum * 2) return;
  samples.sort(compare);
  samples.length = maximum;
}

async function forEachWithConcurrency(items, concurrency, callback) {
  let nextIndex = 0;
  const workerCount = Math.min(items.length, concurrency);
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await callback(items[index], index);
    }
  });
  await Promise.all(workers);
}

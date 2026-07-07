import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const mapSnapshotDir = path.join(__dirname, "data", "map-snapshots");

loadLocalEnv();

const port = Number(process.env.PORT || 3000);
const localBaseUrl = `http://localhost:${port}`;
const appBaseUrl = cleanBaseUrl(process.env.PUBLIC_BASE_URL || localBaseUrl);

const DASHBOARD_PASSWORD = getRequiredEnv("DASHBOARD_PASSWORD");
const PRESENCE_SECRET = getRequiredEnv("PRESENCE_SECRET");
const MAX_PRESENCE_BODY_BYTES = 256 * 1024;
const MAX_MAP_SNAPSHOT_BODY_BYTES = 192 * 1024;
const MAX_PLAYERS_PER_SERVER = 100;
const MAX_CHAT_LOGS_PER_PAYLOAD = 200;
const MAX_CHAT_LOGS_PER_UNIVERSE = 2500;
const MAX_CHAT_MESSAGES_FOR_INSIGHTS = 500;
const MAX_AI_CHAT_MESSAGES_FOR_INSIGHTS = 200;
const MAX_COMMON_QUESTIONS_RESPONSE = 5;
const MAX_MOVEMENT_SAMPLES_PER_PAYLOAD = 500;
const MAX_MOVEMENT_SAMPLES_PER_UNIVERSE = 10_000;
const MAX_MOVEMENT_SAMPLES_RESPONSE = 5000;
const MAX_MOVEMENT_ROLLUPS_PER_PAYLOAD = 500;
const MAX_MOVEMENT_ROLLUPS_PER_UNIVERSE = 10_000;
const MAX_DEATH_SAMPLES_PER_PAYLOAD = 200;
const MAX_DEATH_SAMPLES_PER_UNIVERSE = 10_000;
const MAX_DEATH_SAMPLES_RESPONSE = 5000;
const MAX_LEAVE_SAMPLES_PER_PAYLOAD = 200;
const MAX_LEAVE_SAMPLES_PER_UNIVERSE = 10_000;
const MAX_LEAVE_SAMPLES_RESPONSE = 5000;
const MAX_ROBLOX_HEATMAP_POINTS = 700;
const MAX_AI_ANALYSIS_AREAS = 5;
const AI_ANALYSIS_CLUSTER_RADIUS = 44;
const AI_AREA_OUTCOME_WINDOW_MS = 60 * 1000;
const MAX_MAP_PARTS_PER_CHUNK = 1000;
const MAX_MAP_PARTS_PER_UNIVERSE = 50_000;
const MAP_SNAPSHOT_PARTS_PER_MONGO_CHUNK = 750;
const ROBLOX_HEATMAP_BIN_SIZE = 8;
const DASHBOARD_AUTH_COOKIE = "dashboard_auth";
const DASHBOARD_AUTH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_CHAT_INSIGHTS_MODEL = process.env.OPENAI_CHAT_INSIGHTS_MODEL || "gpt-5.5";
const OPENAI_AREA_INSIGHTS_MODEL = process.env.OPENAI_AREA_INSIGHTS_MODEL || OPENAI_CHAT_INSIGHTS_MODEL;
const ANALYTICS_STORAGE_MODE = cleanAnalyticsStorageMode(process.env.ANALYTICS_STORAGE_MODE || "");
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || "";
const DB_NAME = process.env.DB_NAME || process.env.MONGODB_DB || "roanalytics";
const MONGO_HYDRATE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || "";
const B2_ENDPOINT = cleanObjectStorageEndpoint(process.env.B2_ENDPOINT || process.env.B2_S3_ENDPOINT || "");
const B2_KEY_ID = process.env.B2_KEY_ID || "";
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY || "";
const B2_REGION = process.env.B2_REGION || getRegionFromB2Endpoint(B2_ENDPOINT) || "us-west-000";
const OBJECT_STORAGE_CONFIGURED = Boolean(B2_BUCKET_NAME && B2_ENDPOINT && B2_KEY_ID && B2_APPLICATION_KEY);
const MONGO_ANALYTICS_ENABLED = ANALYTICS_STORAGE_MODE !== "b2" && Boolean(MONGODB_URI);
const ANALYTICS_COLLECTION_RETENTION_MS = {
  chat_logs: 14 * 24 * 60 * 60 * 1000,
  movement_samples: 24 * 60 * 60 * 1000,
  movement_rollups: 14 * 24 * 60 * 60 * 1000,
  death_samples: 14 * 24 * 60 * 60 * 1000,
  leave_samples: 14 * 24 * 60 * 60 * 1000,
};

const chatLogsByUniverseId = new Map();
const chatLogIdsByUniverseId = new Map();
const movementSamplesByUniverseId = new Map();
const movementSampleIdsByUniverseId = new Map();
const movementRollupsByUniverseId = new Map();
const movementRollupIdsByUniverseId = new Map();
const deathSamplesByUniverseId = new Map();
const deathSampleIdsByUniverseId = new Map();
const leaveSamplesByUniverseId = new Map();
const leaveSampleIdsByUniverseId = new Map();
const mapSnapshotsByUniverseId = new Map();
const mapUploadSessions = new Map();
const chatInsightsByScope = new Map();
const areaInsightsByScope = new Map();
let mongoClientPromise = null;
let b2S3ClientPromise = null;
const mongoStatus = {
  configured: Boolean(MONGODB_URI),
  analyticsEnabled: MONGO_ANALYTICS_ENABLED,
  connected: false,
  hydrated: false,
  lastError: "",
};
const objectStorageStatus = {
  configured: OBJECT_STORAGE_CONFIGURED,
  connected: false,
  lastError: "",
  lastWriteAt: 0,
  lastObjectKey: "",
};
const objectStorageRollupCache = new Map();
const OBJECT_STORAGE_ROLLUP_CACHE_MS = 60 * 1000;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", appBaseUrl);

    if (url.pathname === "/api/auth/status" && req.method === "GET") {
      return sendJson(res, 200, { authenticated: isDashboardAuthenticated(req) });
    }

    if (url.pathname === "/api/health" && req.method === "GET") {
      return sendJson(res, 200, getHealthStatus());
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      return handleDashboardLogin(req, res);
    }

    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      clearDashboardAuthCookie(res);
      return sendJson(res, 200, { ok: true });
    }

    if (url.pathname === "/api/roblox/presence" && req.method === "POST") {
      return handlePresenceHeartbeat(req, res);
    }

    if (url.pathname === "/api/roblox/map-snapshot" && req.method === "POST") {
      return handleMapSnapshotUpload(req, res);
    }

    if (url.pathname === "/api/roblox/heatmap" && req.method === "GET") {
      if (!isValidDashboardToolSecret(req)) {
        return sendJson(res, 401, { error: "Invalid dashboard secret" });
      }

      return sendJson(res, 200, await getRobloxHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname.startsWith("/api/") && !isDashboardAuthenticated(req)) {
      return sendJson(res, 401, { error: "Enter the dashboard password first" });
    }

    if (url.pathname === "/api/universes" && req.method === "GET") {
      return sendJson(res, 200, await getUniverseSummaries());
    }

    if (url.pathname === "/api/chat-logs" && req.method === "GET") {
      return sendJson(res, 200, await getChatLogsFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/chat-insights" && req.method === "GET") {
      return sendJson(res, 200, getStoredChatInsights({
        universeId: url.searchParams.get("universeId"),
      }));
    }

    if (url.pathname === "/api/ai-insights/analyze" && req.method === "POST") {
      try {
        return sendJson(res, 200, await analyzeAllAiInsights({
          universeId: url.searchParams.get("universeId"),
          from: url.searchParams.get("from"),
          to: url.searchParams.get("to"),
          target: url.searchParams.get("target") || url.searchParams.get("player"),
        }));
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (url.pathname === "/api/chat-insights/analyze" && req.method === "POST") {
      try {
        return sendJson(res, 200, await analyzeChatInsights({
          universeId: url.searchParams.get("universeId"),
        }));
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (url.pathname === "/api/movement-heatmap" && req.method === "GET") {
      return sendJson(res, 200, await getMovementHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/death-heatmap" && req.method === "GET") {
      return sendJson(res, 200, await getDeathHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/leave-heatmap" && req.method === "GET") {
      return sendJson(res, 200, await getLeaveHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/ai-area-analysis" && req.method === "GET") {
      return sendJson(res, 200, await getAiAreaAnalysisFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/ai-area-analysis/analyze" && req.method === "POST") {
      try {
        return sendJson(res, 200, await analyzeAiAreaInsights({
          universeId: url.searchParams.get("universeId"),
          from: url.searchParams.get("from"),
          to: url.searchParams.get("to"),
          target: url.searchParams.get("target") || url.searchParams.get("player"),
        }));
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (url.pathname === "/api/map-snapshot" && req.method === "GET") {
      return sendJson(res, 200, await getMapSnapshot({
        universeId: url.searchParams.get("universeId"),
      }));
    }

    if (url.pathname.startsWith("/api/")) {
      return sendJson(res, 404, { error: "Not found" });
    }

    if (req.method !== "GET") {
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    return serveStatic(res, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`Dashboard running on ${appBaseUrl}`);
  console.log(`Roblox presence endpoint: ${appBaseUrl}/api/roblox/presence`);
});

if (MONGO_ANALYTICS_ENABLED) {
  void initializeMongoStorage();
}

function getHealthStatus() {
  const counts = getRuntimeDataCounts();
  const storageMode = ANALYTICS_STORAGE_MODE === "b2"
    ? (objectStorageStatus.configured ? "b2" : "memory")
    : (mongoStatus.connected ? "mongodb" : "memory");

  return {
    ok: true,
    app: "RoAnalytics",
    now: Date.now(),
    storage: {
      mode: storageMode,
      analyticsStorageMode: ANALYTICS_STORAGE_MODE,
      mongodbConfigured: mongoStatus.configured,
      mongodbAnalyticsEnabled: mongoStatus.analyticsEnabled,
      mongodbConnected: mongoStatus.connected,
      hydrated: mongoStatus.hydrated,
      dbName: mongoStatus.configured ? DB_NAME : null,
      objectStorageConfigured: objectStorageStatus.configured,
      objectStorageConnected: objectStorageStatus.connected,
      objectStorageBucket: objectStorageStatus.configured ? B2_BUCKET_NAME : null,
      objectStorageLastWriteAt: objectStorageStatus.lastWriteAt || null,
      objectStorageLastObjectKey: objectStorageStatus.lastObjectKey || null,
      objectStorageLastError: objectStorageStatus.lastError || null,
      lastError: mongoStatus.lastError || null,
      note: getStorageHealthNote(storageMode),
    },
    counts,
  };
}

function getStorageHealthNote(storageMode) {
  if (storageMode === "b2") {
    return "B2 analytics mode is active. Incoming analytics are uploaded as raw compressed batches and dashboard reads prefer B2 rollups.";
  }

  if (mongoStatus.connected) {
    return "MongoDB is connected. Incoming analytics are being written to collections and recent data hydrates on boot.";
  }

  return "MongoDB analytics storage is not active, so this process is using memory plus any available B2 rollups.";
}

function getRuntimeDataCounts() {
  return {
    universes: new Set([
      ...chatLogsByUniverseId.keys(),
      ...movementSamplesByUniverseId.keys(),
      ...movementRollupsByUniverseId.keys(),
      ...deathSamplesByUniverseId.keys(),
      ...leaveSamplesByUniverseId.keys(),
      ...mapSnapshotsByUniverseId.keys(),
    ]).size,
    chatLogs: countMapEntries(chatLogsByUniverseId),
    movementSamples: countMapEntries(movementSamplesByUniverseId),
    movementRollups: countMapEntries(movementRollupsByUniverseId),
    deathSamples: countMapEntries(deathSamplesByUniverseId),
    leaveSamples: countMapEntries(leaveSamplesByUniverseId),
  };
}

function countMapEntries(map) {
  let count = 0;
  for (const entries of map.values()) {
    count += Array.isArray(entries) ? entries.length : 1;
  }
  return count;
}

async function initializeMongoStorage() {
  if (!MONGO_ANALYTICS_ENABLED) return;

  try {
    const db = await getMongoDb();
    if (!db) return;

    await ensureMongoIndexes(db);
    await pruneExpiredAnalyticsDocuments(db);
    await hydrateRuntimeFromMongo(db);
    mongoStatus.connected = true;
    mongoStatus.hydrated = true;
    mongoStatus.lastError = "";
    console.log(`MongoDB analytics storage connected: ${DB_NAME}`);
  } catch (error) {
    mongoStatus.connected = false;
    mongoStatus.lastError = error.message || String(error);
    console.warn("MongoDB analytics storage unavailable:", mongoStatus.lastError);
  }
}

async function getMongoDb() {
  if (!MONGODB_URI) return null;

  if (!mongoClientPromise) {
    mongoClientPromise = import("mongodb")
      .then(({ MongoClient }) => {
        const client = new MongoClient(MONGODB_URI, {
          maxPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
        });
        return client.connect();
      })
      .catch((error) => {
        mongoClientPromise = null;
        throw error;
      });
  }

  const client = await mongoClientPromise;
  mongoStatus.connected = true;
  return client.db(DB_NAME);
}

async function ensureMongoIndexes(db) {
  await Promise.all([
    ensureAnalyticsIndexes(db, "chat_logs", "sentAt"),
    ensureAnalyticsIndexes(db, "movement_samples", "sampledAt"),
    ensureAnalyticsIndexes(db, "movement_rollups", "sampledAt"),
    ensureAnalyticsIndexes(db, "death_samples", "sampledAt"),
    ensureAnalyticsIndexes(db, "leave_samples", "sampledAt"),
    db.collection("map_snapshots").createIndex({ universeId: 1 }, { unique: true }),
    db.collection("map_snapshot_chunks").createIndex({ universeId: 1, chunkIndex: 1 }, { unique: true }),
  ]);
}

async function ensureAnalyticsIndexes(db, collectionName, timeField) {
  const collection = db.collection(collectionName);
  await Promise.all([
    collection.createIndex({ id: 1 }, { unique: true }),
    collection.createIndex({ universeId: 1, [timeField]: -1 }),
    collection.createIndex({ receivedAt: -1 }),
    collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

async function pruneExpiredAnalyticsDocuments(db) {
  const now = Date.now();
  await Promise.all(Object.entries(ANALYTICS_COLLECTION_RETENTION_MS).map(([collectionName, retentionMs]) => (
    db.collection(collectionName).deleteMany({
      $or: [
        { expiresAt: { $lte: new Date(now) } },
        { expiresAt: { $exists: false }, receivedAt: { $lt: now - retentionMs } },
      ],
    })
  )));
}

async function hydrateRuntimeFromMongo(db) {
  const since = Date.now() - MONGO_HYDRATE_WINDOW_MS;
  await Promise.all([
    hydrateAnalyticsCollection(db, "chat_logs", chatLogsByUniverseId, chatLogIdsByUniverseId, MAX_CHAT_LOGS_PER_UNIVERSE, since),
    hydrateAnalyticsCollection(db, "movement_samples", movementSamplesByUniverseId, movementSampleIdsByUniverseId, MAX_MOVEMENT_SAMPLES_PER_UNIVERSE, since),
    hydrateAnalyticsCollection(db, "movement_rollups", movementRollupsByUniverseId, movementRollupIdsByUniverseId, MAX_MOVEMENT_ROLLUPS_PER_UNIVERSE, since),
    hydrateAnalyticsCollection(db, "death_samples", deathSamplesByUniverseId, deathSampleIdsByUniverseId, MAX_DEATH_SAMPLES_PER_UNIVERSE, since),
    hydrateAnalyticsCollection(db, "leave_samples", leaveSamplesByUniverseId, leaveSampleIdsByUniverseId, MAX_LEAVE_SAMPLES_PER_UNIVERSE, since),
  ]);
}

async function hydrateAnalyticsCollection(db, collectionName, targetMap, idMap, maxPerUniverse, since) {
  const documents = await db.collection(collectionName)
    .find({ receivedAt: { $gte: since } })
    .sort({ receivedAt: -1 })
    .limit(maxPerUniverse * 10)
    .toArray();

  for (const document of documents.reverse()) {
    const { _id, ...entry } = document;
    const universeId = cleanInteger(entry.universeId);
    const id = cleanString(entry.id, 180);
    if (universeId <= 0 || !id) continue;

    const universeKey = String(universeId);
    const entries = targetMap.get(universeKey) || [];
    const ids = idMap.get(universeKey) || new Set();
    if (ids.has(id)) continue;

    ids.add(id);
    entries.push(entry);

    while (entries.length > maxPerUniverse) {
      const removed = entries.shift();
      if (removed?.id) ids.delete(removed.id);
    }

    targetMap.set(universeKey, entries);
    idMap.set(universeKey, ids);
  }
}

async function persistPresenceToMongo(presence) {
  if (!MONGO_ANALYTICS_ENABLED) return;

  try {
    const db = await getMongoDb();
    if (!db) return;

    await Promise.all([
      upsertAnalyticsDocuments(db, "chat_logs", presence.chatLogs),
      upsertAnalyticsDocuments(db, "movement_samples", presence.movementSamples),
      upsertAnalyticsDocuments(db, "movement_rollups", presence.movementRollups),
      upsertAnalyticsDocuments(db, "death_samples", presence.deathSamples),
      upsertAnalyticsDocuments(db, "leave_samples", presence.leaveSamples),
    ]);

    mongoStatus.connected = true;
    mongoStatus.lastError = "";
  } catch (error) {
    mongoStatus.connected = false;
    mongoStatus.lastError = error.message || String(error);
    console.warn("MongoDB analytics write failed:", mongoStatus.lastError);
  }
}

async function upsertAnalyticsDocuments(db, collectionName, documents) {
  if (!Array.isArray(documents) || !documents.length) return;

  const retentionMs = ANALYTICS_COLLECTION_RETENTION_MS[collectionName] || MONGO_HYDRATE_WINDOW_MS;
  const storedAt = new Date();
  const operations = documents
    .filter((document) => cleanString(document?.id, 180))
    .map((document) => ({
      updateOne: {
        filter: { id: document.id },
        update: {
          $setOnInsert: {
            ...document,
            storedAt,
            expiresAt: new Date((cleanInteger(document.receivedAt) || Date.now()) + retentionMs),
          },
        },
        upsert: true,
      },
    }));

  if (!operations.length) return;
  await db.collection(collectionName).bulkWrite(operations, { ordered: false });
}

async function persistPresenceToObjectStorage(presence) {
  if (!OBJECT_STORAGE_CONFIGURED) return;

  try {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getB2S3Client();
    const objectKey = getPresenceBatchObjectKey(presence);
    const body = gzipSync(Buffer.from(createPresenceJsonLines(presence), "utf8"));

    await client.send(new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: objectKey,
      Body: body,
      ContentType: "application/x-ndjson",
      ContentEncoding: "gzip",
      Metadata: {
        universeid: String(presence.universeId),
        placeid: String(presence.placeId),
        jobid: presence.jobId,
        receivedat: String(presence.receivedAt),
      },
    }));

    objectStorageStatus.connected = true;
    objectStorageStatus.lastError = "";
    objectStorageStatus.lastWriteAt = Date.now();
    objectStorageStatus.lastObjectKey = objectKey;
  } catch (error) {
    objectStorageStatus.connected = false;
    objectStorageStatus.lastError = error.message || String(error);
    console.warn("B2 analytics batch write failed:", objectStorageStatus.lastError);
  }
}

async function getB2S3Client() {
  if (!b2S3ClientPromise) {
    b2S3ClientPromise = import("@aws-sdk/client-s3")
      .then(({ S3Client }) => new S3Client({
        endpoint: B2_ENDPOINT,
        region: B2_REGION,
        forcePathStyle: true,
        credentials: {
          accessKeyId: B2_KEY_ID,
          secretAccessKey: B2_APPLICATION_KEY,
        },
      }))
      .catch((error) => {
        b2S3ClientPromise = null;
        throw error;
      });
  }

  return b2S3ClientPromise;
}

async function getObjectStorageRollupUniverseIds() {
  if (!OBJECT_STORAGE_CONFIGURED) return [];

  try {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const client = await getB2S3Client();
    const universeIds = new Set();
    let ContinuationToken;

    do {
      const response = await client.send(new ListObjectsV2Command({
        Bucket: B2_BUCKET_NAME,
        Prefix: "rollups/",
        ContinuationToken,
        MaxKeys: 1000,
      }));

      for (const object of response.Contents || []) {
        const match = String(object.Key || "").match(/^rollups\/(\d+)\/latest[.]json$/);
        if (match) universeIds.add(match[1]);
      }

      ContinuationToken = response.NextContinuationToken;
    } while (ContinuationToken);

    return [...universeIds].map((id) => cleanInteger(id)).filter((id) => id > 0);
  } catch (error) {
    objectStorageStatus.lastError = error.message || String(error);
    return [];
  }
}

async function getObjectStorageRollup(universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (!OBJECT_STORAGE_CONFIGURED || cleanUniverseId <= 0) return null;

  const cacheKey = String(cleanUniverseId);
  const cached = objectStorageRollupCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < OBJECT_STORAGE_ROLLUP_CACHE_MS) {
    return cached.rollup;
  }

  try {
    const rollup = await readObjectStorageJson(`rollups/${cleanUniverseId}/latest.json`);
    if (!rollup || cleanInteger(rollup.universeId) !== cleanUniverseId) return null;

    objectStorageRollupCache.set(cacheKey, {
      cachedAt: Date.now(),
      rollup,
    });
    objectStorageStatus.connected = true;
    objectStorageStatus.lastError = "";
    return rollup;
  } catch (error) {
    if (error?.name !== "NoSuchKey" && error?.$metadata?.httpStatusCode !== 404) {
      objectStorageStatus.lastError = error.message || String(error);
    }
    return null;
  }
}

async function readObjectStorageJson(objectKey) {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  const response = await client.send(new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: objectKey,
  }));
  const buffer = await streamToBuffer(response.Body);
  return JSON.parse(buffer.toString("utf8"));
}

async function readObjectStorageGzipJson(objectKey) {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  const response = await client.send(new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: objectKey,
  }));
  const buffer = await streamToBuffer(response.Body);
  return JSON.parse(gunzipSync(buffer).toString("utf8"));
}

function createPresenceJsonLines(presence) {
  const lines = [
    {
      type: "batch",
      universeId: presence.universeId,
      placeId: presence.placeId,
      jobId: presence.jobId,
      serverStartedAt: presence.serverStartedAt,
      updatedAt: presence.updatedAt,
      receivedAt: presence.receivedAt,
      playerCount: presence.playerCount,
      players: presence.players,
      counts: {
        chatLogs: presence.chatLogs.length,
        movementSamples: presence.movementSamples.length,
        movementRollups: presence.movementRollups.length,
        deathSamples: presence.deathSamples.length,
        leaveSamples: presence.leaveSamples.length,
      },
    },
    ...presence.chatLogs.map((event) => ({ type: "chat", ...event })),
    ...presence.movementSamples.map((event) => ({ type: "movement", ...event })),
    ...presence.movementRollups.map((event) => ({ type: "movement_rollup", ...event })),
    ...presence.deathSamples.map((event) => ({ type: "death", ...event })),
    ...presence.leaveSamples.map((event) => ({ type: "leave", ...event })),
  ];

  return lines.map((line) => JSON.stringify(line)).join("\n") + "\n";
}

function getPresenceBatchObjectKey(presence) {
  const receivedDate = new Date(presence.receivedAt);
  const year = String(receivedDate.getUTCFullYear());
  const month = String(receivedDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(receivedDate.getUTCDate()).padStart(2, "0");
  const hour = String(receivedDate.getUTCHours()).padStart(2, "0");
  const safeJobId = getSafeObjectKeySegment(presence.jobId || "server");
  const batchId = crypto.randomUUID();

  return [
    "raw",
    String(presence.universeId),
    year,
    month,
    day,
    hour,
    `${safeJobId}-${presence.receivedAt}-${batchId}.jsonl.gz`,
  ].join("/");
}

function getSafeObjectKeySegment(value) {
  return String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "server";
}

async function handleDashboardLogin(req, res) {
  let body;
  try {
    body = await readJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!isMatchingSecret(password, DASHBOARD_PASSWORD)) {
    return sendJson(res, 401, { error: "Incorrect dashboard password" });
  }

  setDashboardAuthCookie(res);
  return sendJson(res, 200, { ok: true, authenticated: true });
}

async function handlePresenceHeartbeat(req, res) {
  if (!isValidPresenceSecret(req)) {
    return sendJson(res, 401, { error: "Invalid presence secret" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_PRESENCE_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const presence = normalizePresence(body);

  if (!presence.ok) {
    return sendJson(res, 400, { error: presence.error });
  }

  const savedChatCount = saveChatLogs(presence.value);
  const savedMovementCount = saveMovementSamples(presence.value);
  const savedMovementRollupCount = saveMovementRollups(presence.value);
  const savedDeathCount = saveDeathSamples(presence.value);
  const savedLeaveCount = saveLeaveSamples(presence.value);
  await persistPresenceToMongo(presence.value);
  await persistPresenceToObjectStorage(presence.value);

  return sendJson(res, 200, {
    ok: true,
    receivedAt: presence.value.receivedAt,
    objectStorage: {
      configured: objectStorageStatus.configured,
      connected: objectStorageStatus.connected,
      objectKey: objectStorageStatus.lastObjectKey || null,
      lastError: objectStorageStatus.lastError || null,
    },
    savedChatCount,
    savedMovementCount,
    savedMovementRollupCount,
    savedDeathCount,
    savedLeaveCount,
    heatmap: getRobloxHeatmap(presence.value.universeId),
  });
}

async function handleMapSnapshotUpload(req, res) {
  if (!isValidDashboardToolSecret(req)) {
    return sendJson(res, 401, { error: "Invalid dashboard secret" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_MAP_SNAPSHOT_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const chunk = normalizeMapSnapshotChunk(body);
  if (!chunk.ok) {
    return sendJson(res, 400, { error: chunk.error });
  }

  const result = await saveMapSnapshotChunk(chunk.value);
  return sendJson(res, result.ok === false ? 400 : 200, result);
}

function isValidPresenceSecret(req) {
  const secret = req.headers["x-dashboard-secret"];
  return isMatchingSecret(secret, PRESENCE_SECRET);
}

function isValidDashboardToolSecret(req) {
  const secret = req.headers["x-dashboard-secret"];
  return isMatchingSecret(secret, PRESENCE_SECRET) || isMatchingSecret(secret, DASHBOARD_PASSWORD);
}

function isMatchingSecret(value, expectedValue) {
  if (typeof value !== "string" || !value || !expectedValue) return false;

  const expected = Buffer.from(expectedValue);
  const provided = Buffer.from(value);
  if (expected.length !== provided.length) return false;

  return crypto.timingSafeEqual(expected, provided);
}

function normalizePresence(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Expected JSON object" };
  }

  const jobId = cleanString(body.jobId, 128);
  if (!jobId) {
    return { ok: false, error: "Missing jobId" };
  }

  const players = Array.isArray(body.players) ? body.players : [];
  const cleanPlayers = players.slice(0, MAX_PLAYERS_PER_SERVER).map((player) => ({
    userId: cleanInteger(player?.userId),
    username: cleanString(player?.username || player?.name, 64),
    displayName: cleanString(player?.displayName, 64),
    joinedAt: cleanTimestampMs(player?.joinedAt),
  })).filter((player) => player.userId > 0 && player.username);

  const receivedAt = Date.now();
  const updatedAt = cleanInteger(body.updatedAt) || Math.floor(receivedAt / 1000);
  const serverStartedAt = cleanTimestampMs(body.serverStartedAt);
  const chatLogs = normalizeChatLogs(body.chatLogs, {
    universeId: cleanInteger(body.universeId),
    placeId: cleanInteger(body.placeId),
    jobId,
    receivedAt,
  });
  const movementSamples = normalizeMovementSamples(body.movementSamples, {
    universeId: cleanInteger(body.universeId),
    placeId: cleanInteger(body.placeId),
    jobId,
    receivedAt,
  });
  const movementRollups = normalizeMovementRollups(body.movementRollups, {
    universeId: cleanInteger(body.universeId),
    placeId: cleanInteger(body.placeId),
    jobId,
    receivedAt,
  });
  const deathSamples = normalizeDeathSamples(body.deathSamples, {
    universeId: cleanInteger(body.universeId),
    placeId: cleanInteger(body.placeId),
    jobId,
    receivedAt,
  });
  const leaveSamples = normalizeLeaveSamples(body.leaveSamples, {
    universeId: cleanInteger(body.universeId),
    placeId: cleanInteger(body.placeId),
    jobId,
    receivedAt,
  });

  return {
    ok: true,
    value: {
      universeId: cleanInteger(body.universeId),
      placeId: cleanInteger(body.placeId),
      jobId,
      serverStartedAt: serverStartedAt || receivedAt,
      updatedAt,
      receivedAt,
      playerCount: Math.max(cleanInteger(body.playerCount), cleanPlayers.length),
      players: cleanPlayers,
      chatLogs,
      movementSamples,
      movementRollups,
      deathSamples,
      leaveSamples,
    },
  };
}

function normalizeChatLogs(value, context) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_CHAT_LOGS_PER_PAYLOAD).map((entry) => {
    const x = cleanFiniteNumber(entry?.x);
    const y = cleanFiniteNumber(entry?.y);
    const z = cleanFiniteNumber(entry?.z);

    return {
      id: cleanString(entry?.id, 160),
      universeId: context.universeId,
      placeId: context.placeId,
      jobId: context.jobId,
      userId: cleanInteger(entry?.userId),
      username: cleanString(entry?.username || entry?.name, 64),
      displayName: cleanString(entry?.displayName, 64),
      message: cleanString(entry?.message, 500),
      x: Number.isFinite(x) ? x : null,
      y: Number.isFinite(y) ? y : null,
      z: Number.isFinite(z) ? z : null,
      sentAt: cleanTimestampMs(entry?.sentAt) || context.receivedAt,
      receivedAt: context.receivedAt,
    };
  }).filter((entry) => entry.userId > 0 && entry.username && entry.message);
}

function saveChatLogs(presence) {
  if (!presence.chatLogs?.length || presence.universeId <= 0) return 0;

  const universeKey = String(presence.universeId);
  const logs = chatLogsByUniverseId.get(universeKey) || [];
  const ids = chatLogIdsByUniverseId.get(universeKey) || new Set();
  let savedCount = 0;

  for (const log of presence.chatLogs) {
    const logId = log.id || `${log.jobId}:${log.userId}:${log.sentAt}:${crypto.createHash("sha1").update(log.message).digest("hex").slice(0, 12)}`;
    if (ids.has(logId)) continue;

    ids.add(logId);
    logs.push({
      ...log,
      id: logId,
    });
    savedCount += 1;
  }

  while (logs.length > MAX_CHAT_LOGS_PER_UNIVERSE) {
    const removed = logs.shift();
    if (removed?.id) ids.delete(removed.id);
  }

  chatLogsByUniverseId.set(universeKey, logs);
  chatLogIdsByUniverseId.set(universeKey, ids);
  return savedCount;
}

function normalizeMovementSamples(value, context) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_MOVEMENT_SAMPLES_PER_PAYLOAD).map((entry) => ({
    id: cleanString(entry?.id, 160),
    universeId: context.universeId,
    placeId: context.placeId,
    jobId: context.jobId,
    userId: cleanInteger(entry?.userId),
    username: cleanString(entry?.username || entry?.name, 64),
    displayName: cleanString(entry?.displayName, 64),
    x: cleanFiniteNumber(entry?.x),
    y: cleanFiniteNumber(entry?.y),
    z: cleanFiniteNumber(entry?.z),
    sampledAt: cleanTimestampMs(entry?.sampledAt) || context.receivedAt,
    receivedAt: context.receivedAt,
  })).filter((entry) => (
    entry.userId > 0
    && entry.username
    && Number.isFinite(entry.x)
    && Number.isFinite(entry.y)
    && Number.isFinite(entry.z)
  ));
}

function normalizeMovementRollups(value, context) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_MOVEMENT_ROLLUPS_PER_PAYLOAD).map((entry) => {
    const rawBucketSizeSeconds = cleanInteger(entry?.bucketSizeSeconds);
    const rawGridSize = cleanInteger(entry?.gridSize);
    const bucketSizeSeconds = rawBucketSizeSeconds > 0 ? clampNumber(rawBucketSizeSeconds, 1, 24 * 60 * 60, 60) : 60;
    const gridSize = rawGridSize > 0 ? rawGridSize : 12;
    const bucketStart = cleanTimestampMs(entry?.bucketStart);
    const sampledAt = cleanTimestampMs(entry?.sampledAt) || (bucketStart ? bucketStart + bucketSizeSeconds * 1000 : context.receivedAt);
    const movementCount = Math.max(cleanInteger(entry?.movementCount) || cleanInteger(entry?.sampleCount), 1);

    return {
      id: cleanString(entry?.id, 180),
      universeId: context.universeId,
      placeId: context.placeId,
      jobId: context.jobId,
      bucketStart,
      bucketEnd: bucketStart ? bucketStart + bucketSizeSeconds * 1000 : sampledAt,
      bucketSizeSeconds,
      gridSize,
      gridX: cleanInteger(entry?.gridX),
      gridZ: cleanInteger(entry?.gridZ),
      x: cleanFiniteNumber(entry?.x),
      y: cleanFiniteNumber(entry?.y),
      z: cleanFiniteNumber(entry?.z),
      movementCount,
      sampleCount: movementCount,
      uniquePlayerCount: Math.max(cleanInteger(entry?.uniquePlayerCount), 0),
      sampledAt,
      receivedAt: context.receivedAt,
    };
  }).filter((entry) => (
    Number.isFinite(entry.x)
    && Number.isFinite(entry.y)
    && Number.isFinite(entry.z)
    && entry.movementCount > 0
    && entry.sampledAt > 0
  ));
}

function normalizeDeathSamples(value, context) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_DEATH_SAMPLES_PER_PAYLOAD).map((entry) => ({
    id: cleanString(entry?.id, 160),
    universeId: context.universeId,
    placeId: context.placeId,
    jobId: context.jobId,
    userId: cleanInteger(entry?.userId),
    username: cleanString(entry?.username || entry?.name, 64),
    displayName: cleanString(entry?.displayName, 64),
    x: cleanFiniteNumber(entry?.x),
    y: cleanFiniteNumber(entry?.y),
    z: cleanFiniteNumber(entry?.z),
    diedAt: cleanTimestampMs(entry?.diedAt) || cleanTimestampMs(entry?.sampledAt) || context.receivedAt,
    sampledAt: cleanTimestampMs(entry?.diedAt) || cleanTimestampMs(entry?.sampledAt) || context.receivedAt,
    receivedAt: context.receivedAt,
  })).filter((entry) => (
    entry.userId > 0
    && entry.username
    && Number.isFinite(entry.x)
    && Number.isFinite(entry.y)
    && Number.isFinite(entry.z)
  ));
}

function normalizeLeaveSamples(value, context) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_LEAVE_SAMPLES_PER_PAYLOAD).map((entry) => ({
    id: cleanString(entry?.id, 160),
    universeId: context.universeId,
    placeId: context.placeId,
    jobId: context.jobId,
    userId: cleanInteger(entry?.userId),
    username: cleanString(entry?.username || entry?.name, 64),
    displayName: cleanString(entry?.displayName, 64),
    x: cleanFiniteNumber(entry?.x),
    y: cleanFiniteNumber(entry?.y),
    z: cleanFiniteNumber(entry?.z),
    leftAt: cleanTimestampMs(entry?.leftAt) || cleanTimestampMs(entry?.sampledAt) || context.receivedAt,
    sampledAt: cleanTimestampMs(entry?.leftAt) || cleanTimestampMs(entry?.sampledAt) || context.receivedAt,
    receivedAt: context.receivedAt,
  })).filter((entry) => (
    entry.userId > 0
    && entry.username
    && Number.isFinite(entry.x)
    && Number.isFinite(entry.y)
    && Number.isFinite(entry.z)
  ));
}

function saveMovementSamples(presence) {
  if (!presence.movementSamples?.length || presence.universeId <= 0) return 0;

  const universeKey = String(presence.universeId);
  const samples = movementSamplesByUniverseId.get(universeKey) || [];
  const ids = movementSampleIdsByUniverseId.get(universeKey) || new Set();
  let savedCount = 0;

  for (const sample of presence.movementSamples) {
    const sampleId = sample.id || `${sample.jobId}:${sample.userId}:${sample.sampledAt}:${sample.x}:${sample.y}:${sample.z}`;
    if (ids.has(sampleId)) continue;

    ids.add(sampleId);
    samples.push({
      ...sample,
      id: sampleId,
    });
    savedCount += 1;
  }

  while (samples.length > MAX_MOVEMENT_SAMPLES_PER_UNIVERSE) {
    const removed = samples.shift();
    if (removed?.id) ids.delete(removed.id);
  }

  movementSamplesByUniverseId.set(universeKey, samples);
  movementSampleIdsByUniverseId.set(universeKey, ids);
  return savedCount;
}

function saveMovementRollups(presence) {
  if (!presence.movementRollups?.length || presence.universeId <= 0) return 0;

  const universeKey = String(presence.universeId);
  const rollups = movementRollupsByUniverseId.get(universeKey) || [];
  const ids = movementRollupIdsByUniverseId.get(universeKey) || new Set();
  let savedCount = 0;

  for (const rollup of presence.movementRollups) {
    const rollupId = rollup.id || `${rollup.jobId}:${rollup.bucketStart}:${rollup.gridSize}:${rollup.gridX}:${rollup.gridZ}`;
    if (ids.has(rollupId)) continue;

    ids.add(rollupId);
    rollups.push({
      ...rollup,
      id: rollupId,
    });
    savedCount += 1;
  }

  while (rollups.length > MAX_MOVEMENT_ROLLUPS_PER_UNIVERSE) {
    const removed = rollups.shift();
    if (removed?.id) ids.delete(removed.id);
  }

  movementRollupsByUniverseId.set(universeKey, rollups);
  movementRollupIdsByUniverseId.set(universeKey, ids);
  return savedCount;
}

function saveDeathSamples(presence) {
  if (!presence.deathSamples?.length || presence.universeId <= 0) return 0;

  const universeKey = String(presence.universeId);
  const samples = deathSamplesByUniverseId.get(universeKey) || [];
  const ids = deathSampleIdsByUniverseId.get(universeKey) || new Set();
  let savedCount = 0;

  for (const sample of presence.deathSamples) {
    const sampleId = sample.id || `${sample.jobId}:${sample.userId}:${sample.diedAt}:${sample.x}:${sample.y}:${sample.z}`;
    if (ids.has(sampleId)) continue;

    ids.add(sampleId);
    samples.push({
      ...sample,
      id: sampleId,
    });
    savedCount += 1;
  }

  while (samples.length > MAX_DEATH_SAMPLES_PER_UNIVERSE) {
    const removed = samples.shift();
    if (removed?.id) ids.delete(removed.id);
  }

  deathSamplesByUniverseId.set(universeKey, samples);
  deathSampleIdsByUniverseId.set(universeKey, ids);
  return savedCount;
}

function saveLeaveSamples(presence) {
  if (!presence.leaveSamples?.length || presence.universeId <= 0) return 0;

  const universeKey = String(presence.universeId);
  const samples = leaveSamplesByUniverseId.get(universeKey) || [];
  const ids = leaveSampleIdsByUniverseId.get(universeKey) || new Set();
  let savedCount = 0;

  for (const sample of presence.leaveSamples) {
    const sampleId = sample.id || `${sample.jobId}:${sample.userId}:${sample.leftAt}:${sample.x}:${sample.y}:${sample.z}`;
    if (ids.has(sampleId)) continue;

    ids.add(sampleId);
    samples.push({
      ...sample,
      id: sampleId,
    });
    savedCount += 1;
  }

  while (samples.length > MAX_LEAVE_SAMPLES_PER_UNIVERSE) {
    const removed = samples.shift();
    if (removed?.id) ids.delete(removed.id);
  }

  leaveSamplesByUniverseId.set(universeKey, samples);
  leaveSampleIdsByUniverseId.set(universeKey, ids);
  return savedCount;
}

function normalizeMapSnapshotChunk(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Expected JSON object" };
  }

  const universeId = cleanInteger(body.universeId);
  const uploadId = cleanString(body.uploadId, 128);
  const chunkIndex = Number(body.chunkIndex);
  const chunkCount = Number(body.chunkCount);
  const rawParts = Array.isArray(body.parts) ? body.parts : [];

  if (universeId <= 0) return { ok: false, error: "Missing universeId" };
  if (!uploadId) return { ok: false, error: "Missing uploadId" };
  if (!Number.isSafeInteger(chunkIndex) || chunkIndex < 1) return { ok: false, error: "Invalid chunkIndex" };
  if (!Number.isSafeInteger(chunkCount) || chunkCount < 1 || chunkCount > 500) return { ok: false, error: "Invalid chunkCount" };
  if (chunkIndex > chunkCount) return { ok: false, error: "chunkIndex cannot exceed chunkCount" };
  if (rawParts.length > MAX_MAP_PARTS_PER_CHUNK) return { ok: false, error: `Too many parts in chunk; max ${MAX_MAP_PARTS_PER_CHUNK}` };

  const parts = rawParts.map(normalizeMapPart).filter(Boolean);
  return {
    ok: true,
    value: {
      uploadId,
      universeId,
      placeId: cleanInteger(body.placeId),
      rootName: cleanString(body.rootName, 128) || "Workspace",
      exportedAt: cleanFlexibleTimestampMs(body.exportedAt) || Date.now(),
      totalParts: cleanInteger(body.totalParts) || parts.length,
      chunkIndex,
      chunkCount,
      parts,
    },
  };
}

function normalizeMapPart(part) {
  if (!part || typeof part !== "object" || Array.isArray(part)) return null;

  const cframe = cleanNumberArray(part.cframe, 12);
  const size = cleanNumberArray(part.size, 3);
  if (!cframe || !size) return null;

  return {
    path: cleanString(part.path, 256),
    name: cleanString(part.name, 128),
    className: cleanString(part.className, 64),
    shape: cleanString(part.shape, 64),
    material: cleanString(part.material, 64),
    color: cleanNumberArray(part.color, 3) || [160, 168, 180],
    transparency: clampNumber(cleanFiniteNumber(part.transparency), 0, 1, 0),
    cframe,
    size,
    meshId: cleanString(part.meshId, 256),
    textureId: cleanString(part.textureId, 256),
  };
}

async function saveMapSnapshotChunk(chunk) {
  const universeKey = String(chunk.universeId);
  const sessionKey = `${universeKey}:${chunk.uploadId}`;

  if (chunk.chunkCount === 1) {
    const snapshot = buildMapSnapshot(chunk, chunk.parts);
    mapSnapshotsByUniverseId.set(universeKey, snapshot);
    await persistMapSnapshot(snapshot);
    mapUploadSessions.delete(sessionKey);
    return {
      ok: true,
      complete: true,
      universeId: chunk.universeId,
      partCount: snapshot.partCount,
      receivedChunks: 1,
      chunkCount: 1,
    };
  }

  let session = mapUploadSessions.get(sessionKey);
  if (!session) {
    session = {
      uploadId: chunk.uploadId,
      universeId: chunk.universeId,
      placeId: chunk.placeId,
      rootName: chunk.rootName,
      exportedAt: chunk.exportedAt,
      totalParts: chunk.totalParts,
      chunkCount: chunk.chunkCount,
      chunks: new Map(),
      startedAt: Date.now(),
    };
    mapUploadSessions.set(sessionKey, session);
  }

  if (session.chunkCount !== chunk.chunkCount) {
    return { ok: false, complete: false, error: "Chunk count changed for active upload" };
  }

  session.chunks.set(chunk.chunkIndex, chunk.parts);

  if (session.chunks.size < session.chunkCount) {
    return {
      ok: true,
      complete: false,
      universeId: chunk.universeId,
      receivedChunks: session.chunks.size,
      chunkCount: session.chunkCount,
    };
  }

  const parts = [];
  for (let index = 1; index <= session.chunkCount; index += 1) {
    parts.push(...(session.chunks.get(index) || []));
  }

  const snapshot = buildMapSnapshot(session, parts);
  mapSnapshotsByUniverseId.set(universeKey, snapshot);
  await persistMapSnapshot(snapshot);
  mapUploadSessions.delete(sessionKey);

  return {
    ok: true,
    complete: true,
    universeId: chunk.universeId,
    partCount: snapshot.partCount,
    receivedChunks: session.chunkCount,
    chunkCount: session.chunkCount,
  };
}

function buildMapSnapshot(metadata, parts) {
  const limitedParts = parts.slice(0, MAX_MAP_PARTS_PER_UNIVERSE);
  return {
    version: 1,
    uploadId: metadata.uploadId,
    universeId: metadata.universeId,
    placeId: metadata.placeId,
    rootName: metadata.rootName,
    exportedAt: metadata.exportedAt,
    receivedAt: Date.now(),
    partCount: limitedParts.length,
    totalParts: metadata.totalParts,
    maxPartsPerUniverse: MAX_MAP_PARTS_PER_UNIVERSE,
    bounds: getMapBounds(limitedParts),
    parts: limitedParts,
  };
}

async function getMapSnapshot(filters = {}) {
  const universeId = cleanInteger(filters.universeId);
  if (universeId <= 0) {
    return { ok: true, universeId: null, snapshot: null };
  }

  const universeKey = String(universeId);
  const snapshot = mapSnapshotsByUniverseId.get(universeKey) || await readPersistedMapSnapshot(universeId);
  if (snapshot) {
    mapSnapshotsByUniverseId.set(universeKey, snapshot);
  }

  return {
    ok: true,
    universeId,
    snapshot: snapshot || null,
  };
}

async function persistMapSnapshot(snapshot) {
  if (OBJECT_STORAGE_CONFIGURED) {
    try {
      await persistMapSnapshotToObjectStorage(snapshot);
      return;
    } catch (error) {
      objectStorageStatus.lastError = error.message || String(error);
      console.warn("B2 map snapshot write failed:", objectStorageStatus.lastError);
    }
  }

  if (MONGODB_URI) {
    try {
      const db = await getMongoDb();
      if (db) {
        const { parts, ...metadata } = snapshot;
        const partChunks = chunkArray(parts, MAP_SNAPSHOT_PARTS_PER_MONGO_CHUNK);
        await db.collection("map_snapshots").replaceOne(
          { universeId: snapshot.universeId },
          {
            ...metadata,
            partChunkCount: partChunks.length,
            storedAt: new Date(),
          },
          { upsert: true },
        );
        await db.collection("map_snapshot_chunks").deleteMany({ universeId: snapshot.universeId });
        if (partChunks.length) {
          await db.collection("map_snapshot_chunks").insertMany(partChunks.map((chunkParts, index) => ({
            universeId: snapshot.universeId,
            chunkIndex: index,
            parts: chunkParts,
            storedAt: new Date(),
          })));
        }
        return;
      }
    } catch (error) {
      mongoStatus.lastError = error.message || String(error);
      console.warn("MongoDB map snapshot write failed:", mongoStatus.lastError);
    }
  }

  await fs.mkdir(mapSnapshotDir, { recursive: true });
  await fs.writeFile(getMapSnapshotPath(snapshot.universeId), JSON.stringify(snapshot), "utf8");
}

async function readPersistedMapSnapshot(universeId) {
  const objectStorageSnapshot = await readObjectStorageMapSnapshot(universeId);
  if (objectStorageSnapshot) return objectStorageSnapshot;

  const mongoSnapshot = await readMongoMapSnapshot(universeId);
  if (mongoSnapshot) return mongoSnapshot;

  try {
    const text = await fs.readFile(getMapSnapshotPath(universeId), "utf8");
    const snapshot = JSON.parse(text);
    if (cleanInteger(snapshot?.universeId) !== universeId || !Array.isArray(snapshot?.parts)) {
      return null;
    }

    if (MONGODB_URI) {
      await persistMapSnapshot(snapshot);
    }

    return snapshot;
  } catch {
    return null;
  }
}

async function persistMapSnapshotToObjectStorage(snapshot) {
  const latestKey = getObjectStorageMapSnapshotKey(snapshot.universeId);
  const versionedKey = getObjectStorageMapSnapshotVersionKey(snapshot);
  const body = gzipSync(Buffer.from(JSON.stringify(snapshot), "utf8"));

  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  const putOptions = {
    Bucket: B2_BUCKET_NAME,
    Body: body,
    ContentType: "application/json",
    ContentEncoding: "gzip",
    Metadata: {
      universeid: String(snapshot.universeId),
      placeid: String(snapshot.placeId || 0),
      receivedat: String(snapshot.receivedAt || Date.now()),
      partcount: String(snapshot.partCount || 0),
    },
  };

  await client.send(new PutObjectCommand({
    ...putOptions,
    Key: latestKey,
  }));
  await client.send(new PutObjectCommand({
    ...putOptions,
    Key: versionedKey,
  }));

  objectStorageStatus.connected = true;
  objectStorageStatus.lastError = "";
  objectStorageStatus.lastWriteAt = Date.now();
  objectStorageStatus.lastObjectKey = latestKey;
}

async function readObjectStorageMapSnapshot(universeId) {
  if (!OBJECT_STORAGE_CONFIGURED) return null;

  try {
    const snapshot = await readObjectStorageGzipJson(getObjectStorageMapSnapshotKey(universeId));
    if (cleanInteger(snapshot?.universeId) !== universeId || !Array.isArray(snapshot?.parts)) {
      return null;
    }

    objectStorageStatus.connected = true;
    objectStorageStatus.lastError = "";
    return snapshot;
  } catch (error) {
    if (error?.name !== "NoSuchKey" && error?.$metadata?.httpStatusCode !== 404) {
      objectStorageStatus.lastError = error.message || String(error);
      console.warn("B2 map snapshot read failed:", objectStorageStatus.lastError);
    }
    return null;
  }
}

async function readMongoMapSnapshot(universeId) {
  if (!MONGODB_URI) return null;

  try {
    const db = await getMongoDb();
    if (!db) return null;

    const document = await db.collection("map_snapshots").findOne({ universeId });
    if (!document) return null;

    const chunks = await db.collection("map_snapshot_chunks")
      .find({ universeId })
      .sort({ chunkIndex: 1 })
      .toArray();
    const { _id, storedAt, partChunkCount, parts: legacyParts, ...snapshot } = document;
    const parts = chunks.length
      ? chunks.flatMap((chunk) => (Array.isArray(chunk.parts) ? chunk.parts : []))
      : (Array.isArray(legacyParts) ? legacyParts : []);
    if (cleanInteger(snapshot?.universeId) !== universeId || !Array.isArray(parts)) {
      return null;
    }

    return {
      ...snapshot,
      parts,
    };
  } catch (error) {
    mongoStatus.lastError = error.message || String(error);
    console.warn("MongoDB map snapshot read failed:", mongoStatus.lastError);
    return null;
  }
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function getMapSnapshotPath(universeId) {
  return path.join(mapSnapshotDir, `${cleanInteger(universeId)}.json`);
}

function getObjectStorageMapSnapshotKey(universeId) {
  return `maps/${cleanInteger(universeId)}/latest.json.gz`;
}

function getObjectStorageMapSnapshotVersionKey(snapshot) {
  const receivedAt = cleanInteger(snapshot.receivedAt) || Date.now();
  return `maps/${cleanInteger(snapshot.universeId)}/${receivedAt}.json.gz`;
}

async function getUniverseSummaries() {
  const universeIds = new Set();
  addUniverseKeys(universeIds, chatLogsByUniverseId);
  addUniverseKeys(universeIds, movementSamplesByUniverseId);
  addUniverseKeys(universeIds, movementRollupsByUniverseId);
  addUniverseKeys(universeIds, deathSamplesByUniverseId);
  addUniverseKeys(universeIds, leaveSamplesByUniverseId);
  addUniverseKeys(universeIds, mapSnapshotsByUniverseId);

  const persistedMapUniverseIds = new Set((await getPersistedMapUniverseIds()).map(String));
  for (const universeId of persistedMapUniverseIds) {
    universeIds.add(String(universeId));
  }

  const objectStorageUniverseIds = new Set((await getObjectStorageRollupUniverseIds()).map(String));
  for (const universeId of objectStorageUniverseIds) {
    universeIds.add(String(universeId));
  }

  const universes = [];
  for (const id of universeIds) {
    const universeId = cleanInteger(id);
    if (universeId <= 0) continue;

    const summary = buildUniverseSummary(universeId, persistedMapUniverseIds.has(String(universeId)));
    const rollup = await getObjectStorageRollup(universeId);
    if (rollup && rollupTotalSamples(rollup) > summary.totalSamples) {
      universes.push(buildUniverseSummaryFromRollup(rollup, summary.hasMapSnapshot));
    } else {
      universes.push(summary);
    }
  }

  universes.sort((a, b) => b.totalSamples - a.totalSamples || b.lastSeenAt - a.lastSeenAt || b.id - a.id);

  return {
    universes,
  };
}

function addUniverseKeys(target, sourceMap) {
  for (const key of sourceMap.keys()) {
    if (cleanInteger(key) > 0) {
      target.add(String(cleanInteger(key)));
    }
  }
}

async function getPersistedMapUniverseIds() {
  const universeIds = new Set(await getPersistedMongoMapUniverseIds());
  for (const universeId of await getPersistedObjectStorageMapUniverseIds()) {
    universeIds.add(universeId);
  }

  try {
    const entries = await fs.readdir(mapSnapshotDir);
    for (const universeId of entries
      .map((name) => cleanInteger(String(name).replace(/\.json$/i, "")))
      .filter((universeId) => universeId > 0)) {
      universeIds.add(universeId);
    }
  } catch {
    // The filesystem fallback is optional on Render.
  }

  return [...universeIds];
}

async function getPersistedObjectStorageMapUniverseIds() {
  if (!OBJECT_STORAGE_CONFIGURED) return [];

  try {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const client = await getB2S3Client();
    const universeIds = new Set();
    let ContinuationToken;

    do {
      const response = await client.send(new ListObjectsV2Command({
        Bucket: B2_BUCKET_NAME,
        Prefix: "maps/",
        ContinuationToken,
        MaxKeys: 1000,
      }));

      for (const object of response.Contents || []) {
        const match = String(object.Key || "").match(/^maps\/(\d+)\/latest[.]json[.]gz$/);
        if (match) universeIds.add(cleanInteger(match[1]));
      }

      ContinuationToken = response.NextContinuationToken;
    } while (ContinuationToken);

    return [...universeIds].filter((universeId) => universeId > 0);
  } catch (error) {
    objectStorageStatus.lastError = error.message || String(error);
    return [];
  }
}

async function getPersistedMongoMapUniverseIds() {
  if (!MONGODB_URI) return [];

  try {
    const db = await getMongoDb();
    if (!db) return [];

    const documents = await db.collection("map_snapshots")
      .find({}, { projection: { universeId: 1 } })
      .toArray();
    return documents
      .map((document) => cleanInteger(document.universeId))
      .filter((universeId) => universeId > 0);
  } catch (error) {
    mongoStatus.lastError = error.message || String(error);
    console.warn("MongoDB map snapshot list failed:", mongoStatus.lastError);
    return [];
  }
}

function buildUniverseSummary(universeId, hasPersistedMapSnapshot = false) {
  const key = String(universeId);
  const chatLogs = chatLogsByUniverseId.get(key) || [];
  const movementSamples = movementSamplesByUniverseId.get(key) || [];
  const movementRollups = movementRollupsByUniverseId.get(key) || [];
  const deathSamples = deathSamplesByUniverseId.get(key) || [];
  const leaveSamples = leaveSamplesByUniverseId.get(key) || [];
  const mapSnapshot = mapSnapshotsByUniverseId.get(key);
  const lastSeenAt = Math.max(
    getLastTimestamp(chatLogs, "receivedAt"),
    getLastTimestamp(movementSamples, "receivedAt"),
    getLastTimestamp(movementRollups, "receivedAt"),
    getLastTimestamp(deathSamples, "receivedAt"),
    getLastTimestamp(leaveSamples, "receivedAt"),
    cleanInteger(mapSnapshot?.receivedAt),
  );

  return {
    id: universeId,
    chatLogCount: chatLogs.length,
    movementSampleCount: movementSamples.length,
    movementRollupCount: movementRollups.length,
    deathSampleCount: deathSamples.length,
    leaveSampleCount: leaveSamples.length,
    totalSamples: chatLogs.length + movementSamples.length + movementRollups.reduce((sum, rollup) => sum + getSampleWeight(rollup), 0) + deathSamples.length + leaveSamples.length,
    hasMapSnapshot: Boolean(mapSnapshot) || hasPersistedMapSnapshot,
    lastSeenAt,
  };
}

function buildUniverseSummaryFromRollup(rollup, hasPersistedMapSnapshot = false) {
  const totalSamples = rollupTotalSamples(rollup);

  return {
    id: cleanInteger(rollup.universeId),
    chatLogCount: Array.isArray(rollup.chatLogs) ? rollup.chatLogs.length : 0,
    movementSampleCount: cleanInteger(rollup.movement?.sampleCount),
    movementRollupCount: Array.isArray(rollup.movement?.samples) ? rollup.movement.samples.length : 0,
    deathSampleCount: cleanInteger(rollup.deaths?.sampleCount),
    leaveSampleCount: cleanInteger(rollup.leaves?.sampleCount),
    totalSamples,
    hasMapSnapshot: hasPersistedMapSnapshot,
    lastSeenAt: cleanInteger(rollup.lastSeenAt) || cleanInteger(rollup.generatedAt),
  };
}

function rollupTotalSamples(rollup) {
  return (Array.isArray(rollup?.chatLogs) ? rollup.chatLogs.length : 0)
    + cleanInteger(rollup?.movement?.sampleCount)
    + cleanInteger(rollup?.deaths?.sampleCount)
    + cleanInteger(rollup?.leaves?.sampleCount);
}

function getLastTimestamp(entries, field) {
  return entries.reduce((max, entry) => Math.max(max, cleanInteger(entry?.[field])), 0);
}

function getMapBounds(parts) {
  if (!parts.length) return null;

  const bounds = parts.reduce((box, part) => {
    const position = getCFramePosition(part.cframe);
    const half = {
      x: Math.abs(part.size[0]) / 2,
      y: Math.abs(part.size[1]) / 2,
      z: Math.abs(part.size[2]) / 2,
    };

    return {
      minX: Math.min(box.minX, position.x - half.x),
      maxX: Math.max(box.maxX, position.x + half.x),
      minY: Math.min(box.minY, position.y - half.y),
      maxY: Math.max(box.maxY, position.y + half.y),
      minZ: Math.min(box.minZ, position.z - half.z),
      maxZ: Math.max(box.maxZ, position.z + half.z),
    };
  }, {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  });

  return {
    ...bounds,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    depth: bounds.maxZ - bounds.minZ,
    center: {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      z: (bounds.minZ + bounds.maxZ) / 2,
    },
  };
}

function getCFramePosition(cframe) {
  return {
    x: Number(cframe?.[0]) || 0,
    y: Number(cframe?.[1]) || 0,
    z: Number(cframe?.[2]) || 0,
  };
}

async function getMovementHeatmapFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });
  const rollup = await getObjectStorageRollup(filters.universeId);
  if (rollup) return getMovementHeatmapFromRollup(rollup, filters);

  return getMovementHeatmap(filters);
}

async function getDeathHeatmapFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });
  const rollup = await getObjectStorageRollup(filters.universeId);
  if (rollup) return getDeathHeatmapFromRollup(rollup, filters);

  return getDeathHeatmap(filters);
}

async function getLeaveHeatmapFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });
  const rollup = await getObjectStorageRollup(filters.universeId);
  if (rollup) return getLeaveHeatmapFromRollup(rollup, filters);

  return getLeaveHeatmap(filters);
}

async function getChatLogsFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });
  const rollup = await getObjectStorageRollup(filters.universeId);
  if (rollup) return getChatLogsFromRollup(rollup, filters);

  return getChatLogs(filters);
}

async function getAiAreaAnalysisFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });

  return getAiAreaAnalysis(filters);
}

async function getRobloxHeatmapFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });

  return getRobloxHeatmap(filters.universeId, filters);
}

async function normalizeMovementFilters(rawFilters = {}) {
  const target = cleanString(rawFilters.target, 160);
  const resolvedTargets = target ? await resolveUserTargets(target) : { userIds: [], resolved: [], unresolved: [] };

  return {
    universeId: cleanInteger(rawFilters.universeId),
    fromMs: cleanFlexibleTimestampMs(rawFilters.from),
    toMs: cleanFlexibleTimestampMs(rawFilters.to),
    userIds: new Set(resolvedTargets.userIds),
    resolvedTargets: resolvedTargets.resolved,
    unresolvedTargets: resolvedTargets.unresolved,
  };
}

function getMovementSamplesForFilters(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const samples = [];

  if (universeIdFilter > 0) {
    samples.push(...(movementSamplesByUniverseId.get(String(universeIdFilter)) || []));
  } else {
    for (const universeSamples of movementSamplesByUniverseId.values()) {
      samples.push(...universeSamples);
    }
  }

  return samples.filter((sample) => {
    if (filters.fromMs > 0 && sample.sampledAt < filters.fromMs) return false;
    if (filters.toMs > 0 && sample.sampledAt > filters.toMs) return false;
    if (filters.userIds?.size && !filters.userIds.has(sample.userId)) return false;
    return true;
  });
}

function getMovementRollupsForFilters(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  if (filters.userIds?.size) return [];

  const rollups = [];

  if (universeIdFilter > 0) {
    rollups.push(...(movementRollupsByUniverseId.get(String(universeIdFilter)) || []));
  } else {
    for (const universeRollups of movementRollupsByUniverseId.values()) {
      rollups.push(...universeRollups);
    }
  }

  return rollups.filter((rollup) => {
    if (filters.fromMs > 0 && rollup.sampledAt < filters.fromMs) return false;
    if (filters.toMs > 0 && rollup.sampledAt > filters.toMs) return false;
    return true;
  });
}

function getMovementAnalysisSamplesForFilters(filters = {}) {
  const rollups = getMovementRollupsForFilters(filters);
  if (rollups.length) return rollups.map(movementRollupToSample);
  return getMovementSamplesForFilters(filters);
}

function movementRollupToSample(rollup) {
  return {
    ...rollup,
    userId: 0,
    username: "Movement rollup",
    displayName: "Movement rollup",
    count: getSampleWeight(rollup),
  };
}

function getSampleWeight(sample) {
  return Math.max(cleanInteger(sample?.count) || cleanInteger(sample?.movementCount) || cleanInteger(sample?.sampleCount), 1);
}

function getDeathSamplesForFilters(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const samples = [];

  if (universeIdFilter > 0) {
    samples.push(...(deathSamplesByUniverseId.get(String(universeIdFilter)) || []));
  } else {
    for (const universeSamples of deathSamplesByUniverseId.values()) {
      samples.push(...universeSamples);
    }
  }

  return samples.filter((sample) => {
    if (filters.fromMs > 0 && sample.sampledAt < filters.fromMs) return false;
    if (filters.toMs > 0 && sample.sampledAt > filters.toMs) return false;
    if (filters.userIds?.size && !filters.userIds.has(sample.userId)) return false;
    return true;
  });
}

function getLeaveSamplesForFilters(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const samples = [];

  if (universeIdFilter > 0) {
    samples.push(...(leaveSamplesByUniverseId.get(String(universeIdFilter)) || []));
  } else {
    for (const universeSamples of leaveSamplesByUniverseId.values()) {
      samples.push(...universeSamples);
    }
  }

  return samples.filter((sample) => {
    if (filters.fromMs > 0 && sample.sampledAt < filters.fromMs) return false;
    if (filters.toMs > 0 && sample.sampledAt > filters.toMs) return false;
    if (filters.userIds?.size && !filters.userIds.has(sample.userId)) return false;
    return true;
  });
}

function getMovementHeatmap(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const rollups = getMovementRollupsForFilters(filters);
  const samples = rollups.length
    ? rollups.map(movementRollupToSample)
    : getMovementSamplesForFilters(filters);

  samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  const limitedSamples = samples.slice(0, MAX_MOVEMENT_SAMPLES_RESPONSE);
  const sampleCount = samples.reduce((sum, sample) => sum + getSampleWeight(sample), 0);

  return {
    universeId: universeIdFilter || null,
    sampleCount,
    returnedCount: limitedSamples.length,
    maxSamplesPerUniverse: MAX_MOVEMENT_SAMPLES_PER_UNIVERSE,
    source: rollups.length ? "rollups" : "samples",
    filters: getMovementFilterSummary(filters),
    samples: limitedSamples,
  };
}

function getMovementHeatmapFromRollup(rollup, filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId) || cleanInteger(rollup.universeId);
  const samples = getRollupSamplesForFilters(rollup.movement?.samples || [], filters, { allowUserFilter: false });
  samples.sort((a, b) => getSampleWeight(b) - getSampleWeight(a) || b.sampledAt - a.sampledAt);
  const limitedSamples = samples.slice(0, MAX_MOVEMENT_SAMPLES_RESPONSE);
  const sampleCount = cleanInteger(rollup.movement?.sampleCount) || samples.reduce((sum, sample) => sum + getSampleWeight(sample), 0);

  return {
    universeId: universeIdFilter || null,
    sampleCount,
    returnedCount: limitedSamples.length,
    maxSamplesPerUniverse: MAX_MOVEMENT_SAMPLES_PER_UNIVERSE,
    source: "b2-rollup",
    filters: getMovementFilterSummary(filters),
    samples: limitedSamples,
  };
}

function getDeathHeatmap(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const samples = getDeathSamplesForFilters(filters);

  samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  const limitedSamples = samples.slice(0, MAX_DEATH_SAMPLES_RESPONSE);

  return {
    universeId: universeIdFilter || null,
    sampleCount: samples.length,
    returnedCount: limitedSamples.length,
    maxSamplesPerUniverse: MAX_DEATH_SAMPLES_PER_UNIVERSE,
    filters: getMovementFilterSummary(filters),
    samples: limitedSamples,
  };
}

function getDeathHeatmapFromRollup(rollup, filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId) || cleanInteger(rollup.universeId);
  const samples = getRollupSamplesForFilters(rollup.deaths?.samples || [], filters);
  samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  const limitedSamples = samples.slice(0, MAX_DEATH_SAMPLES_RESPONSE);

  return {
    universeId: universeIdFilter || null,
    sampleCount: cleanInteger(rollup.deaths?.sampleCount) || samples.length,
    returnedCount: limitedSamples.length,
    maxSamplesPerUniverse: MAX_DEATH_SAMPLES_PER_UNIVERSE,
    source: "b2-rollup",
    filters: getMovementFilterSummary(filters),
    samples: limitedSamples,
  };
}

function getLeaveHeatmap(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const samples = getLeaveSamplesForFilters(filters);

  samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  const limitedSamples = samples.slice(0, MAX_LEAVE_SAMPLES_RESPONSE);

  return {
    universeId: universeIdFilter || null,
    sampleCount: samples.length,
    returnedCount: limitedSamples.length,
    maxSamplesPerUniverse: MAX_LEAVE_SAMPLES_PER_UNIVERSE,
    filters: getMovementFilterSummary(filters),
    samples: limitedSamples,
  };
}

function getLeaveHeatmapFromRollup(rollup, filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId) || cleanInteger(rollup.universeId);
  const samples = getRollupSamplesForFilters(rollup.leaves?.samples || [], filters);
  samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  const limitedSamples = samples.slice(0, MAX_LEAVE_SAMPLES_RESPONSE);

  return {
    universeId: universeIdFilter || null,
    sampleCount: cleanInteger(rollup.leaves?.sampleCount) || samples.length,
    returnedCount: limitedSamples.length,
    maxSamplesPerUniverse: MAX_LEAVE_SAMPLES_PER_UNIVERSE,
    source: "b2-rollup",
    filters: getMovementFilterSummary(filters),
    samples: limitedSamples,
  };
}

function getAiAreaAnalysis(filters = {}) {
  return applyStoredAiAreaInsights(getAiAreaAnalysisWithoutStoredInsights(filters));
}

async function analyzeAiAreaInsights(rawFilters = {}) {
  const filters = await normalizeMovementFilters(rawFilters);
  const basePayload = getAiAreaAnalysisWithoutStoredInsights(filters);

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!basePayload.areas.length) {
    throw new Error("No map areas are available to analyze.");
  }

  try {
    const aiPayload = await getAiAreaInsights(basePayload);
    areaInsightsByScope.set(getAreaInsightsScopeKey(basePayload.universeId), aiPayload);
    return applyStoredAiAreaInsights(basePayload);
  } catch (error) {
    console.warn("AI area analysis failed:", error.message);
    throw error;
  }
}

function getAiAreaAnalysisWithoutStoredInsights(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const events = getAiAnalysisEvents(filters);
  const clusters = clusterAiAnalysisEvents(events, AI_ANALYSIS_CLUSTER_RADIUS);
  const topClusters = scoreAiAnalysisClusters(clusters)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_AI_ANALYSIS_AREAS);
  const maxScore = topClusters.reduce((max, cluster) => Math.max(max, cluster.score), 1);

  return {
    universeId: universeIdFilter || null,
    mode: "algorithm",
    radius: AI_ANALYSIS_CLUSTER_RADIUS,
    eventCount: events.length,
    areaCount: topClusters.length,
    filters: getMovementFilterSummary(filters),
    areas: topClusters.map((cluster, index) => ({
      id: `area${index + 1}`,
      label: `Area ${index + 1}`,
      rank: index + 1,
      x: cluster.x,
      y: cluster.y,
      z: cluster.z,
      score: maxScore > 0 ? cluster.score / maxScore : 0,
      sampleCount: cluster.sampleCount,
      movementCount: cluster.typeCounts.movement || 0,
      deathCount: cluster.typeCounts.death || 0,
      leaveCount: cluster.typeCounts.leave || 0,
      chatCount: cluster.typeCounts.chat || 0,
      topMessages: cluster.topMessages,
      evidence: cluster.evidence,
    })),
  };
}

function applyStoredAiAreaInsights(payload) {
  const stored = areaInsightsByScope.get(getAreaInsightsScopeKey(payload.universeId));
  if (!stored?.areas?.length) return payload;

  const storedById = new Map(stored.areas.map((area) => [area.id, area]));
  const areas = payload.areas.map((area) => {
    const storedArea = storedById.get(area.id);
    if (!storedArea) return area;

    return {
      ...area,
      label: storedArea.title || area.label,
      summary: storedArea.summary || "",
      insightType: storedArea.insightType || "",
      recommendation: storedArea.recommendation || "",
      confidence: storedArea.confidence,
    };
  });

  return {
    ...payload,
    mode: "ai",
    generatedAt: stored.generatedAt,
    model: stored.model,
    areas,
  };
}

function getAiAnalysisEvents(filters = {}) {
  const events = [];

  for (const sample of getMovementAnalysisSamplesForFilters(filters)) {
    events.push(createAiAnalysisEvent("movement", sample, Math.max(1, Math.sqrt(getSampleWeight(sample)))));
  }

  for (const sample of getDeathSamplesForFilters(filters)) {
    events.push(createAiAnalysisEvent("death", sample, 4));
  }

  for (const sample of getLeaveSamplesForFilters(filters)) {
    events.push(createAiAnalysisEvent("leave", sample, 5));
  }

  for (const log of getChatLogs(filters).logs) {
    if (!Number.isFinite(Number(log.x)) || !Number.isFinite(Number(log.y)) || !Number.isFinite(Number(log.z))) continue;
    events.push(createAiAnalysisEvent("chat", log, isQuestionLikeMessage(log.message) ? 3 : 1.5));
  }

  return events.filter(Boolean);
}

function createAiAnalysisEvent(type, sample, weight) {
  const x = Number(sample.x);
  const y = Number(sample.y);
  const z = Number(sample.z);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;

  return {
    type,
    x,
    y,
    z,
    weight,
    userId: cleanInteger(sample.userId),
    message: sample.message || "",
    timestamp: sample.sampledAt || sample.sentAt || sample.receivedAt || 0,
  };
}

function clusterAiAnalysisEvents(events, radius) {
  const clusters = [];
  const radiusSq = radius * radius;

  for (const event of events) {
    let closestCluster = null;
    let closestDistanceSq = Infinity;

    for (const cluster of clusters) {
      const dx = event.x - cluster.x;
      const dz = event.z - cluster.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq <= radiusSq && distanceSq < closestDistanceSq) {
        closestCluster = cluster;
        closestDistanceSq = distanceSq;
      }
    }

    if (closestCluster) {
      addEventToAiAnalysisCluster(closestCluster, event);
    } else {
      clusters.push(createAiAnalysisCluster(event));
    }
  }

  return clusters;
}

function createAiAnalysisCluster(event) {
  const cluster = {
    x: event.x,
    y: event.y,
    z: event.z,
    weight: 0,
    sampleCount: 0,
    typeCounts: {},
    messages: [],
    events: [],
  };
  addEventToAiAnalysisCluster(cluster, event);
  return cluster;
}

function addEventToAiAnalysisCluster(cluster, event) {
  const nextWeight = cluster.weight + event.weight;
  cluster.x = (cluster.x * cluster.weight + event.x * event.weight) / nextWeight;
  cluster.y = (cluster.y * cluster.weight + event.y * event.weight) / nextWeight;
  cluster.z = (cluster.z * cluster.weight + event.z * event.weight) / nextWeight;
  cluster.weight = nextWeight;
  cluster.sampleCount += 1;
  cluster.typeCounts[event.type] = (cluster.typeCounts[event.type] || 0) + 1;
  cluster.events.push({
    type: event.type,
    userId: event.userId || 0,
    message: event.message || "",
    timestamp: event.timestamp || 0,
  });

  if (event.message) {
    cluster.messages.push({
      message: event.message,
      userId: event.userId || 0,
      timestamp: event.timestamp,
    });
  }
}

function scoreAiAnalysisClusters(clusters) {
  return clusters.map((cluster) => {
    const movementCount = cluster.typeCounts.movement || 0;
    const deathCount = cluster.typeCounts.death || 0;
    const leaveCount = cluster.typeCounts.leave || 0;
    const chatCount = cluster.typeCounts.chat || 0;
    const frictionScore = deathCount * 4 + leaveCount * 5 + chatCount * 2.5;
    const trafficScore = Math.sqrt(movementCount);
    const evidence = buildAiAreaEvidence(cluster.events, cluster.typeCounts);

    return {
      ...cluster,
      score: trafficScore + frictionScore + evidence.outcomeChatCount * 2,
      topMessages: evidence.topMessages,
      evidence,
    };
  });
}

function buildAiAreaEvidence(events, typeCounts = {}) {
  const cleanEvents = events
    .filter((event) => event.timestamp > 0)
    .sort((a, b) => a.timestamp - b.timestamp);
  const chatEvents = cleanEvents.filter((event) => event.type === "chat" && cleanString(event.message, 180));
  const deathEvents = cleanEvents.filter((event) => event.type === "death");
  const leaveEvents = cleanEvents.filter((event) => event.type === "leave");
  const topMessages = getTopAiAnalysisMessages(chatEvents, deathEvents, leaveEvents);
  const firstSeenAt = cleanEvents[0]?.timestamp || 0;
  const lastSeenAt = cleanEvents[cleanEvents.length - 1]?.timestamp || 0;
  const chatBeforeDeathCount = countChatsBeforeOutcomes(chatEvents, deathEvents);
  const chatBeforeLeaveCount = countChatsBeforeOutcomes(chatEvents, leaveEvents);
  const notes = [];

  if (chatBeforeLeaveCount > 0) {
    notes.push(`${chatBeforeLeaveCount} local chat message${chatBeforeLeaveCount === 1 ? "" : "s"} happened within ${Math.round(AI_AREA_OUTCOME_WINDOW_MS / 1000)} seconds before a leave.`);
  }

  if (chatBeforeDeathCount > 0) {
    notes.push(`${chatBeforeDeathCount} local chat message${chatBeforeDeathCount === 1 ? "" : "s"} happened within ${Math.round(AI_AREA_OUTCOME_WINDOW_MS / 1000)} seconds before a death.`);
  }

  if ((typeCounts.leave || 0) > 0) {
    notes.push(`${typeCounts.leave} leave sample${typeCounts.leave === 1 ? "" : "s"} occurred in this area.`);
  }

  if ((typeCounts.death || 0) > 0) {
    notes.push(`${typeCounts.death} death sample${typeCounts.death === 1 ? "" : "s"} occurred in this area.`);
  }

  if ((typeCounts.movement || 0) > 0 && !(typeCounts.leave || 0) && !(typeCounts.death || 0)) {
    notes.push(`${typeCounts.movement} movement sample${typeCounts.movement === 1 ? "" : "s"} indicate traffic without a matching failure signal yet.`);
  }

  return {
    firstSeenAt: firstSeenAt || null,
    lastSeenAt: lastSeenAt || null,
    chatBeforeLeaveCount,
    chatBeforeDeathCount,
    outcomeChatCount: chatBeforeLeaveCount + chatBeforeDeathCount,
    topMessages,
    notes: notes.slice(0, 5),
  };
}

function countChatsBeforeOutcomes(chatEvents, outcomeEvents) {
  let count = 0;
  for (const chat of chatEvents) {
    if (hasOutcomeAfterChat(chat, outcomeEvents)) count += 1;
  }

  return count;
}

function hasOutcomeAfterChat(chat, outcomeEvents) {
  return outcomeEvents.some((outcome) => {
    if (outcome.timestamp <= chat.timestamp) return false;
    if (outcome.timestamp - chat.timestamp > AI_AREA_OUTCOME_WINDOW_MS) return false;
    if (chat.userId > 0 && outcome.userId > 0 && chat.userId !== outcome.userId) return false;
    return true;
  });
}

function getTopAiAnalysisMessages(messages, deathEvents = [], leaveEvents = []) {
  const counts = new Map();
  for (const entry of messages) {
    const text = cleanString(entry.message, 180);
    if (!text) continue;
    const existing = counts.get(text) || {
      message: text,
      count: 0,
      latestAt: 0,
      beforeDeathCount: 0,
      beforeLeaveCount: 0,
    };
    existing.count += 1;
    existing.latestAt = Math.max(existing.latestAt, entry.timestamp || 0);
    if (hasOutcomeAfterChat(entry, deathEvents)) existing.beforeDeathCount += 1;
    if (hasOutcomeAfterChat(entry, leaveEvents)) existing.beforeLeaveCount += 1;
    counts.set(text, existing);
  }

  return [...counts.values()]
    .sort((a, b) => (
      (b.beforeDeathCount + b.beforeLeaveCount) - (a.beforeDeathCount + a.beforeLeaveCount)
      || b.count - a.count
      || b.latestAt - a.latestAt
    ))
    .slice(0, 3);
}

function getRobloxHeatmap(universeId, filters = {}) {
  const cleanUniverseId = cleanInteger(universeId);
  const samples = getMovementAnalysisSamplesForFilters({
    ...filters,
    universeId: cleanUniverseId,
  });
  const bins = new Map();

  for (const sample of samples) {
    const sampleWeight = getSampleWeight(sample);
    const x = Math.round(sample.x / ROBLOX_HEATMAP_BIN_SIZE) * ROBLOX_HEATMAP_BIN_SIZE;
    const y = Math.round(sample.y / ROBLOX_HEATMAP_BIN_SIZE) * ROBLOX_HEATMAP_BIN_SIZE;
    const z = Math.round(sample.z / ROBLOX_HEATMAP_BIN_SIZE) * ROBLOX_HEATMAP_BIN_SIZE;
    const key = `${x}:${y}:${z}`;
    const existing = bins.get(key);

    if (existing) {
      existing.count += sampleWeight;
    } else {
      bins.set(key, { x, y, z, count: sampleWeight });
    }
  }

  const points = [...bins.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_ROBLOX_HEATMAP_POINTS);
  const maxCount = points.reduce((max, point) => Math.max(max, point.count), 1);

  return {
    binSize: ROBLOX_HEATMAP_BIN_SIZE,
    universeId: cleanUniverseId || null,
    sampleCount: samples.reduce((sum, sample) => sum + getSampleWeight(sample), 0),
    pointCount: points.length,
    maxCount,
    filters: getMovementFilterSummary(filters),
    points: points.map((point) => ({
      ...point,
      intensity: point.count / maxCount,
    })),
  };
}

function getMovementFilterSummary(filters = {}) {
  return {
    from: filters.fromMs || null,
    to: filters.toMs || null,
    userIds: filters.userIds ? [...filters.userIds] : [],
    resolvedTargets: filters.resolvedTargets || [],
    unresolvedTargets: filters.unresolvedTargets || [],
  };
}

function getChatLogs(filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId);
  const logs = [];

  if (universeIdFilter > 0) {
    logs.push(...(chatLogsByUniverseId.get(String(universeIdFilter)) || []));
  } else {
    for (const universeLogs of chatLogsByUniverseId.values()) {
      logs.push(...universeLogs);
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (filters.fromMs > 0 && log.sentAt < filters.fromMs) return false;
    if (filters.toMs > 0 && log.sentAt > filters.toMs) return false;
    if (filters.userIds?.size && !filters.userIds.has(log.userId)) return false;
    return true;
  });

  filteredLogs.sort((a, b) => b.sentAt - a.sentAt || b.receivedAt - a.receivedAt);

  return {
    universeId: universeIdFilter || null,
    logCount: filteredLogs.length,
    maxLogsPerUniverse: MAX_CHAT_LOGS_PER_UNIVERSE,
    filters: getMovementFilterSummary(filters),
    logs: filteredLogs.slice(0, MAX_CHAT_LOGS_PER_UNIVERSE),
  };
}

function getChatLogsFromRollup(rollup, filters = {}) {
  const universeIdFilter = cleanInteger(filters.universeId) || cleanInteger(rollup.universeId);
  const filteredLogs = getRollupSamplesForFilters(rollup.chatLogs || [], filters);
  filteredLogs.sort((a, b) => b.sentAt - a.sentAt || b.receivedAt - a.receivedAt);

  return {
    universeId: universeIdFilter || null,
    logCount: filteredLogs.length,
    maxLogsPerUniverse: MAX_CHAT_LOGS_PER_UNIVERSE,
    source: "b2-rollup",
    filters: getMovementFilterSummary(filters),
    logs: filteredLogs.slice(0, MAX_CHAT_LOGS_PER_UNIVERSE),
  };
}

function getRollupSamplesForFilters(samples, filters = {}, options = {}) {
  if (!Array.isArray(samples)) return [];

  return samples.filter((sample) => {
    const timestamp = cleanInteger(sample.sampledAt) || cleanInteger(sample.sentAt) || cleanInteger(sample.receivedAt);
    if (filters.fromMs > 0 && timestamp < filters.fromMs) return false;
    if (filters.toMs > 0 && timestamp > filters.toMs) return false;
    if (options.allowUserFilter !== false && filters.userIds?.size && !filters.userIds.has(cleanInteger(sample.userId))) return false;
    return true;
  });
}

function getStoredChatInsights(filters = {}) {
  const chatPayload = getChatLogs(filters);
  const candidateLogs = chatPayload.logs
    .slice(0, MAX_CHAT_MESSAGES_FOR_INSIGHTS)
    .filter((log) => isQuestionLikeMessage(log.message));
  const stored = chatInsightsByScope.get(getChatInsightsScopeKey(chatPayload.universeId));

  if (stored) {
    return {
      ...stored,
      sourceLogCount: chatPayload.logCount,
      analyzedCount: Math.min(chatPayload.logs.length, MAX_CHAT_MESSAGES_FOR_INSIGHTS),
      questionLikeCount: candidateLogs.length,
    };
  }

  return {
    universeId: chatPayload.universeId,
    sourceLogCount: chatPayload.logCount,
    analyzedCount: Math.min(chatPayload.logs.length, MAX_CHAT_MESSAGES_FOR_INSIGHTS),
    questionLikeCount: candidateLogs.length,
    maxMessagesAnalyzed: MAX_CHAT_MESSAGES_FOR_INSIGHTS,
    generatedAt: null,
    mode: "none",
    questions: [],
  };
}

async function analyzeChatInsights(filters = {}) {
  const chatPayload = getChatLogs(filters);
  const candidateLogs = chatPayload.logs
    .slice(0, MAX_CHAT_MESSAGES_FOR_INSIGHTS)
    .filter((log) => isQuestionLikeMessage(log.message));

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (candidateLogs.length === 0) {
    throw new Error("No question-like chat messages are available to analyze.");
  }

  try {
    const aiInsights = await getAiChatInsights(chatPayload, candidateLogs);
    chatInsightsByScope.set(getChatInsightsScopeKey(chatPayload.universeId), aiInsights);
    return aiInsights;
  } catch (error) {
    console.warn("Chat insights AI failed:", error.message);
    throw error;
  }
}

async function analyzeAllAiInsights(rawFilters = {}) {
  const filters = await normalizeMovementFilters(rawFilters);
  const [chatResult, areaResult] = await Promise.allSettled([
    analyzeChatInsights(filters),
    analyzeAiAreaInsights(filters),
  ]);
  const errors = [];

  if (chatResult.status === "rejected") {
    errors.push({
      area: "chatQuestions",
      message: chatResult.reason?.message || "Chat question AI failed.",
    });
  }

  if (areaResult.status === "rejected") {
    errors.push({
      area: "mapAreas",
      message: areaResult.reason?.message || "Map area AI failed.",
    });
  }

  if (chatResult.status === "rejected" && areaResult.status === "rejected") {
    throw new Error(errors.map((error) => error.message).join(" "));
  }

  return {
    universeId: cleanInteger(filters.universeId) || null,
    generatedAt: Date.now(),
    mode: errors.length ? "partial" : "ai",
    jobs: {
      chatQuestions: chatResult.status,
      mapAreas: areaResult.status,
    },
    errors,
    chatInsights: chatResult.status === "fulfilled" ? chatResult.value : null,
    areaAnalysis: areaResult.status === "fulfilled" ? areaResult.value : null,
  };
}

async function getAiChatInsights(chatPayload, candidateLogs) {
  const candidateMessages = candidateLogs.slice(0, MAX_AI_CHAT_MESSAGES_FOR_INSIGHTS).map((log, index) => ({
    id: `m${index}`,
    message: log.message,
    username: log.username,
    sentAt: log.sentAt,
    userId: log.userId,
  }));
  const logById = new Map(candidateMessages.map((entry) => [entry.id, candidateLogs[Number(entry.id.slice(1))]]));
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_INSIGHTS_MODEL,
      store: false,
      reasoning: { effort: "low" },
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "chat_question_insights",
          strict: true,
          schema: getChatInsightsJsonSchema(),
        },
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Group Roblox player chat into the top repeated semantic questions. Treat typos, shorthand, pronouns, and different wording as the same question when the intent is the same. Do not invent questions unsupported by the messages. Return concise canonical player-facing questions.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Return the top 5 common player questions.",
                rules: [
                  "Use only the provided message ids.",
                  "Group messages by meaning, not by exact words.",
                  "Examples: 'when do i get ugc', 'how do get ugc', and 'where do i get it' can be one question if they refer to getting UGC.",
                  "Ignore greetings, spam, and messages that are not questions or player confusion.",
                  "Canonical titles should be grammatical, short, and end with a question mark.",
                ],
                messages: candidateMessages,
              }),
            },
          ],
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.error || `OpenAI request failed with ${response.status}`);
  }

  const parsed = parseOpenAiJsonResponse(payload);
  const questions = normalizeAiInsightQuestions(parsed.questions, logById);
  if (!questions.length) {
    throw new Error("AI returned no usable question groups");
  }

  return {
    universeId: chatPayload.universeId,
    sourceLogCount: chatPayload.logCount,
    analyzedCount: Math.min(chatPayload.logs.length, MAX_CHAT_MESSAGES_FOR_INSIGHTS),
    maxMessagesAnalyzed: MAX_CHAT_MESSAGES_FOR_INSIGHTS,
    generatedAt: Date.now(),
    mode: "ai",
    model: OPENAI_CHAT_INSIGHTS_MODEL,
    questionLikeCount: candidateLogs.length,
    questions,
  };
}

async function getAiAreaInsights(areaPayload) {
  const candidateAreas = areaPayload.areas.map((area) => ({
    id: area.id,
    fallbackLabel: area.label,
    rank: area.rank,
    movementCount: area.movementCount,
    deathCount: area.deathCount,
    leaveCount: area.leaveCount,
    chatCount: area.chatCount,
    score: area.score,
    topMessages: area.topMessages,
    evidence: area.evidence,
  }));

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_AREA_INSIGHTS_MODEL,
      store: false,
      reasoning: { effort: "low" },
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "map_area_insights",
          strict: true,
          schema: getAreaInsightsJsonSchema(),
        },
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Name and summarize Roblox map analytics areas. Use only the provided counts and messages. Do not invent map-specific place names unless the chat text supports them. Prefer concise product analytics language.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task: "Return player-facing area insights for the provided clustered map areas.",
                rules: [
                  "Keep titles short, 2 to 5 words.",
                  "Use neutral names like Spawn Path or Confusing Corner when no specific place name is supported.",
                  "summary should explain what the signals suggest.",
                  "recommendation should be a concrete design or analytics follow-up.",
                  "Use evidence.chatBeforeLeaveCount and evidence.chatBeforeDeathCount when explaining likely causes.",
                  "If evidence shows chat shortly before a leave or death, treat that as stronger than generic nearby traffic.",
                  "Use evidence.notes as the compact explanation of supporting signals.",
                  "Use topMessages as player testimony, especially messages with beforeLeaveCount or beforeDeathCount.",
                  "Mention timing only when the evidence fields support it.",
                  "insightType must be one of traffic, dropoff, danger, confusion, mixed.",
                ],
                areas: candidateAreas,
              }),
            },
          ],
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.error || `OpenAI request failed with ${response.status}`);
  }

  const parsed = parseOpenAiJsonResponse(payload);
  const areas = normalizeAiAreaInsights(parsed.areas, new Set(candidateAreas.map((area) => area.id)));
  if (!areas.length) {
    throw new Error("AI returned no usable map area insights");
  }

  return {
    universeId: areaPayload.universeId,
    generatedAt: Date.now(),
    mode: "ai",
    model: OPENAI_AREA_INSIGHTS_MODEL,
    areas,
  };
}

function getAreaInsightsJsonSchema() {
  return {
    type: "object",
    properties: {
      areas: {
        type: "array",
        maxItems: MAX_AI_ANALYSIS_AREAS,
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            insightType: {
              type: "string",
              enum: ["traffic", "dropoff", "danger", "confusion", "mixed"],
            },
            recommendation: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["id", "title", "summary", "insightType", "recommendation", "confidence"],
          additionalProperties: false,
        },
      },
    },
    required: ["areas"],
    additionalProperties: false,
  };
}

function getChatInsightsJsonSchema() {
  return {
    type: "object",
    properties: {
      questions: {
        type: "array",
        maxItems: MAX_COMMON_QUESTIONS_RESPONSE,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            messageIds: {
              type: "array",
              items: { type: "string" },
            },
            confidence: { type: "number" },
          },
          required: ["title", "messageIds", "confidence"],
          additionalProperties: false,
        },
      },
    },
    required: ["questions"],
    additionalProperties: false,
  };
}

function parseOpenAiJsonResponse(payload) {
  const text = payload.output_text || getOpenAiOutputText(payload);
  if (!text) throw new Error("OpenAI response did not include text output");

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("OpenAI response was not valid JSON");
  }
}

function getOpenAiOutputText(payload) {
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") return content.text;
    }
  }

  return "";
}

function normalizeAiInsightQuestions(rawQuestions, logById) {
  if (!Array.isArray(rawQuestions)) return [];

  return rawQuestions.map((question, index) => {
    const logs = [...new Set(Array.isArray(question.messageIds) ? question.messageIds : [])]
      .map((id) => logById.get(id))
      .filter(Boolean);
    if (!logs.length) return null;

    const players = new Set(logs.map((log) => log.userId).filter((userId) => userId > 0));
    logs.sort((a, b) => b.sentAt - a.sentAt || b.receivedAt - a.receivedAt);

    return {
      id: `ai:${index}:${crypto.createHash("sha1").update(String(question.title || "")).digest("hex").slice(0, 10)}`,
      title: normalizeAiQuestionTitle(question.title),
      mentions: logs.length,
      playerCount: players.size,
      confidence: clampNumber(cleanFiniteNumber(question.confidence), 0, 1, 0),
      examples: logs.slice(0, 3).map((log) => ({
        message: log.message,
        username: log.username,
        sentAt: log.sentAt,
      })),
      firstSeenAt: logs.reduce((min, log) => Math.min(min, log.sentAt), logs[0].sentAt),
      lastSeenAt: logs.reduce((max, log) => Math.max(max, log.sentAt), logs[0].sentAt),
    };
  }).filter(Boolean)
    .sort((a, b) => b.mentions - a.mentions || b.confidence - a.confidence)
    .slice(0, MAX_COMMON_QUESTIONS_RESPONSE);
}

function normalizeAiAreaInsights(rawAreas, validAreaIds) {
  if (!Array.isArray(rawAreas)) return [];

  const allowedTypes = new Set(["traffic", "dropoff", "danger", "confusion", "mixed"]);
  return rawAreas.map((area) => {
    const id = cleanString(area?.id, 40);
    if (!validAreaIds.has(id)) return null;

    const title = cleanString(area.title, 60).replace(/\s+/g, " ").trim();
    const summary = cleanString(area.summary, 220).replace(/\s+/g, " ").trim();
    const recommendation = cleanString(area.recommendation, 220).replace(/\s+/g, " ").trim();
    const insightType = allowedTypes.has(area.insightType) ? area.insightType : "mixed";

    return {
      id,
      title: title || id,
      summary: summary || "Player behavior is concentrated in this area.",
      insightType,
      recommendation: recommendation || "Review this area in Studio and compare against player intent.",
      confidence: clampNumber(cleanFiniteNumber(area.confidence), 0, 1, 0),
    };
  }).filter(Boolean);
}

function normalizeAiQuestionTitle(value) {
  const title = cleanString(value, 120).replace(/\s+/g, " ").trim();
  if (!title) return "Unclear question?";
  return title.endsWith("?") ? title : `${title}?`;
}

function getChatInsightsScopeKey(universeId) {
  return cleanInteger(universeId) > 0 ? String(cleanInteger(universeId)) : "all";
}

function getAreaInsightsScopeKey(universeId) {
  return cleanInteger(universeId) > 0 ? String(cleanInteger(universeId)) : "all";
}

function isQuestionLikeMessage(message) {
  const text = String(message || "").trim().toLowerCase();
  if (!text) return false;
  if (text.includes("?")) return true;
  if (/^(where|how|what|why|when|who|can|do|does|did|is|are|will|should)\b/.test(text)) return true;
  return /\b(help|stuck|lost|confused|cant|can't|cannot|wheres|where's|find|exit)\b/.test(text);
}

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function cleanFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function cleanNumberArray(value, length) {
  if (!Array.isArray(value) || value.length < length) return null;

  const numbers = value.slice(0, length).map((item) => cleanFiniteNumber(item));
  return numbers.every(Number.isFinite) ? numbers : null;
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function cleanTimestampMs(value) {
  const timestamp = cleanInteger(value);
  if (timestamp <= 0) return 0;

  return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
}

function cleanFlexibleTimestampMs(value) {
  if (typeof value !== "string" && typeof value !== "number") return 0;
  const text = String(value).trim();
  if (!text) return 0;

  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric < 10_000_000_000 ? Math.floor(numeric * 1000) : Math.floor(numeric);
  }

  const parsed = Date.parse(text);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

async function resolveUserTargets(value) {
  const tokens = parseTargetTokens(value);
  const userIds = [];
  const resolved = [];
  const unresolved = [];
  const usernames = [];

  for (const token of tokens) {
    const userId = cleanInteger(token);
    if (userId > 0) {
      userIds.push(userId);
      resolved.push({ input: token, userId });
    } else {
      usernames.push(token);
    }
  }

  if (usernames.length) {
    const lookup = await fetchUserIdsByUsernames(usernames);
    for (const username of usernames) {
      const match = lookup.get(username.toLowerCase());
      if (match) {
        userIds.push(match.id);
        resolved.push({
          input: username,
          userId: match.id,
          username: match.name,
          displayName: match.displayName,
        });
      } else {
        unresolved.push(username);
      }
    }
  }

  return {
    userIds: [...new Set(userIds)],
    resolved,
    unresolved,
  };
}

function parseTargetTokens(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanString(item, 64).replace(/^@+/, "")).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  return value
    .split(/[\s,]+/)
    .map((token) => cleanString(token, 64).replace(/^@+/, ""))
    .filter(Boolean);
}

async function fetchUserIdsByUsernames(usernames) {
  const uniqueUsernames = [...new Set(usernames.map((username) => username.trim()).filter(Boolean))].slice(0, 100);
  const results = new Map();
  if (!uniqueUsernames.length) return results;

  const response = await fetch("https://users.roblox.com/v1/usernames/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usernames: uniqueUsernames,
      excludeBannedUsers: false,
    }),
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || payload.message || "Failed to resolve Roblox usernames");
  }

  for (const user of payload.data || []) {
    if (user?.name && cleanInteger(user.id) > 0) {
      results.set(String(user.name).toLowerCase(), {
        id: cleanInteger(user.id),
        name: String(user.name),
        displayName: String(user.displayName || ""),
      });
    }
  }

  return results;
}

async function parseRobloxResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function readJsonBody(req, maxBytes) {
  let body = "";

  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > maxBytes) {
      throw new Error("Request body too large");
    }
  }

  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function isDashboardAuthenticated(req) {
  const value = getCookieValue(req, DASHBOARD_AUTH_COOKIE);
  if (!value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = signDashboardValue(payload);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  try {
    const auth = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const issuedAt = Number(auth?.issuedAt || 0);
    return Boolean(issuedAt && Date.now() - issuedAt <= DASHBOARD_AUTH_MAX_AGE_MS);
  } catch {
    return false;
  }
}

function setDashboardAuthCookie(res) {
  const payload = Buffer.from(JSON.stringify({ issuedAt: Date.now() })).toString("base64url");
  const cookieValue = `${payload}.${signDashboardValue(payload)}`;
  appendSetCookie(res, `${DASHBOARD_AUTH_COOKIE}=${encodeURIComponent(cookieValue)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.ceil(DASHBOARD_AUTH_MAX_AGE_MS / 1000)}`);
}

function clearDashboardAuthCookie(res) {
  appendSetCookie(res, `${DASHBOARD_AUTH_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function signDashboardValue(value) {
  return crypto.createHmac("sha256", DASHBOARD_PASSWORD).update(value).digest("base64url");
}

function getCookieValue(req, name) {
  const cookies = String(req.headers.cookie || "").split(/;\s*/);
  for (const cookie of cookies) {
    const equalsIndex = cookie.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = cookie.slice(0, equalsIndex);
    if (key !== name) continue;

    return decodeURIComponent(cookie.slice(equalsIndex + 1));
  }

  return "";
}

function appendSetCookie(res, cookie) {
  const existing = res.getHeader("Set-Cookie");
  if (!existing) {
    res.setHeader("Set-Cookie", cookie);
  } else if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing, cookie]);
  } else {
    res.setHeader("Set-Cookie", [existing, cookie]);
  }
}

async function serveStatic(res, relativePath) {
  const filePath = path.normalize(path.join(publicDir, relativePath));
  if (!filePath.startsWith(publicDir)) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = value;
  }
}

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function cleanBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function cleanObjectStorageEndpoint(value) {
  const endpoint = String(value || "").trim().replace(/\/+$/, "");
  if (!endpoint) return "";
  return /^https?:\/\//i.test(endpoint) ? endpoint : `https://${endpoint}`;
}

function getRegionFromB2Endpoint(endpoint) {
  const match = String(endpoint || "").match(/s3[.]([a-z0-9-]+)[.]backblazeb2[.]com/i);
  return match ? match[1] : "";
}

function cleanAnalyticsStorageMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  if (mode === "b2" || mode === "mongodb") return mode;
  return "mongodb";
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

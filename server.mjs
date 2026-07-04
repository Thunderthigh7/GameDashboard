import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const mapSnapshotDir = path.join(__dirname, "data", "map-snapshots");

loadLocalEnv();

const port = Number(process.env.PORT || 3000);
const localBaseUrl = `http://localhost:${port}`;
const appBaseUrl = cleanBaseUrl(process.env.PUBLIC_BASE_URL || localBaseUrl);

const ROBLOX_OAUTH_CLIENT_ID = getRequiredEnv("ROBLOX_OAUTH_CLIENT_ID");
const ROBLOX_OAUTH_CLIENT_SECRET = getRequiredEnv("ROBLOX_OAUTH_CLIENT_SECRET");
const ROBLOX_API_KEY = getRequiredEnv("ROBLOX_API_KEY");
const SESSION_SECRET = getRequiredEnv("SESSION_SECRET");
const PRESENCE_SECRET = getRequiredEnv("PRESENCE_SECRET");
const PRESENCE_STALE_MS = 75_000;
const MAX_PRESENCE_BODY_BYTES = 256 * 1024;
const MAX_MAP_SNAPSHOT_BODY_BYTES = 192 * 1024;
const MAX_COMMAND_BODY_BYTES = 16 * 1024;
const MAX_DATASTORE_BODY_BYTES = 2 * 1024 * 1024;
const MAX_PLAYERS_PER_SERVER = 100;
const MAX_CHAT_LOGS_PER_PAYLOAD = 200;
const MAX_CHAT_LOGS_PER_UNIVERSE = 2500;
const MAX_CHAT_MESSAGES_FOR_INSIGHTS = 500;
const MAX_COMMON_QUESTIONS_RESPONSE = 8;
const MAX_MOVEMENT_SAMPLES_PER_PAYLOAD = 500;
const MAX_MOVEMENT_SAMPLES_PER_UNIVERSE = 10_000;
const MAX_MOVEMENT_SAMPLES_RESPONSE = 5000;
const MAX_DEATH_SAMPLES_PER_PAYLOAD = 200;
const MAX_DEATH_SAMPLES_PER_UNIVERSE = 10_000;
const MAX_DEATH_SAMPLES_RESPONSE = 5000;
const MAX_LEAVE_SAMPLES_PER_PAYLOAD = 200;
const MAX_LEAVE_SAMPLES_PER_UNIVERSE = 10_000;
const MAX_LEAVE_SAMPLES_RESPONSE = 5000;
const MAX_ROBLOX_HEATMAP_POINTS = 700;
const MAX_MAP_PARTS_PER_CHUNK = 1000;
const MAX_MAP_PARTS_PER_UNIVERSE = 50_000;
const ROBLOX_HEATMAP_BIN_SIZE = 8;
const MAX_COMMANDS_PER_HEARTBEAT = 20;
const PLAYER_DATA_SAMPLE_LIMIT = 3;
const DASHBOARD_COMMAND_TOPIC_PREFIX = "dashboard-command-";
const KICK_COMMAND_TOPIC = "kick";
const GLOBAL_ANNOUNCEMENT_TOPIC = "dashboard-global-announcement";
const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

const redirectUri = `${appBaseUrl}/auth/roblox/callback`;
const oauthScope = "openid universe:read universe-messaging-service:publish universe.user-restriction:write";
const sessions = new Map();
const serverPresence = new Map();
const playerPresenceStartedAt = new Map();
const pendingCommandsByJobId = new Map();
const chatLogsByUniverseId = new Map();
const chatLogIdsByUniverseId = new Map();
const movementSamplesByUniverseId = new Map();
const movementSampleIdsByUniverseId = new Map();
const deathSamplesByUniverseId = new Map();
const deathSampleIdsByUniverseId = new Map();
const leaveSamplesByUniverseId = new Map();
const leaveSampleIdsByUniverseId = new Map();
const mapSnapshotsByUniverseId = new Map();
const mapUploadSessions = new Map();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", appBaseUrl);

    if (req.method === "GET" && url.pathname === "/auth/roblox/start") {
      return startRobloxAuth(req, res);
    }

    if (req.method === "GET" && url.pathname === "/auth/roblox/callback") {
      return handleRobloxCallback(req, res, url);
    }

    if (url.pathname === "/api/me" && req.method === "GET") {
      return sendJson(res, 200, { account: getCurrentAccount(req) });
    }

    if (url.pathname === "/api/experiences" && req.method === "GET") {
      return sendJson(res, 200, await getExperiences(req));
    }

    if (url.pathname === "/api/servers" && req.method === "GET") {
      return sendJson(res, 200, getLiveServers({
        universeId: url.searchParams.get("universeId"),
      }));
    }

    if (url.pathname === "/api/chat-logs" && req.method === "GET") {
      return sendJson(res, 200, getChatLogs({
        universeId: url.searchParams.get("universeId"),
      }));
    }

    if (url.pathname === "/api/chat-insights" && req.method === "GET") {
      return sendJson(res, 200, getChatInsights({
        universeId: url.searchParams.get("universeId"),
      }));
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

    if (url.pathname === "/api/map-snapshot" && req.method === "GET") {
      return sendJson(res, 200, await getMapSnapshot({
        universeId: url.searchParams.get("universeId"),
      }));
    }

    if (url.pathname === "/api/roblox/heatmap" && req.method === "GET") {
      return sendJson(res, 200, await getRobloxHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/datastores" && req.method === "GET") {
      return handleDataStoresList(req, res, url);
    }

    if (url.pathname === "/api/datastore/entries" && req.method === "GET") {
      return handleDataStoreEntriesList(req, res, url);
    }

    if (url.pathname === "/api/datastore/read" && req.method === "POST") {
      return handleDataStoreRead(req, res);
    }

    if (url.pathname === "/api/datastore/write" && req.method === "POST") {
      return handleDataStoreWrite(req, res);
    }

    if (url.pathname === "/api/player-data/read" && req.method === "POST") {
      return handlePlayerDataRead(req, res);
    }

    if (url.pathname === "/api/player-data/write" && req.method === "POST") {
      return handlePlayerDataWrite(req, res);
    }

    if (url.pathname === "/api/roblox/presence" && req.method === "POST") {
      return handlePresenceHeartbeat(req, res);
    }

    if (url.pathname === "/api/roblox/map-snapshot" && req.method === "POST") {
      return handleMapSnapshotUpload(req, res);
    }

    if (url.pathname === "/api/commands/teleport" && req.method === "POST") {
      return handleTeleportCommand(req, res);
    }

    if (url.pathname === "/api/commands/moderation" && req.method === "POST") {
      return handleModerationCommand(req, res);
    }

    if (url.pathname === "/api/commands/announcement" && req.method === "POST") {
      return handleAnnouncementCommand(req, res);
    }

    if (url.pathname === "/api/logout" && req.method === "POST") {
      const sessionId = getSessionId(req);
      if (sessionId) sessions.delete(sessionId);
      clearSessionCookie(res);
      return sendJson(res, 200, { ok: true });
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
  console.log(`Roblox redirect URL: ${redirectUri}`);
  console.log(`Roblox presence endpoint: ${appBaseUrl}/api/roblox/presence`);
});

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

  serverPresence.set(presence.value.jobId, applyPlayerDurations(presence.value));
  const savedChatCount = saveChatLogs(presence.value);
  const savedMovementCount = saveMovementSamples(presence.value);
  const savedDeathCount = saveDeathSamples(presence.value);
  const savedLeaveCount = saveLeaveSamples(presence.value);
  const commands = consumePendingCommands(presence.value.jobId);

  return sendJson(res, 200, {
    ok: true,
    receivedAt: presence.value.receivedAt,
    liveServers: getLiveServers().servers.length,
    savedChatCount,
    savedMovementCount,
    savedDeathCount,
    savedLeaveCount,
    heatmap: getRobloxHeatmap(presence.value.universeId),
    commands,
  });
}

async function handleMapSnapshotUpload(req, res) {
  if (!isValidPresenceSecret(req)) {
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

async function handleDataStoresList(req, res, url) {
  if (!getCurrentAccount(req)) {
    return sendJson(res, 401, { error: "Sign in before listing DataStores" });
  }

  const universeId = cleanInteger(url.searchParams.get("universeId"));
  const prefix = cleanString(url.searchParams.get("prefix"), 128);
  const cursor = cleanString(url.searchParams.get("cursor"), 512);

  if (universeId <= 0) {
    return sendJson(res, 400, { error: "Select an experience first" });
  }

  const result = await listDataStores({ universeId, prefix, cursor });
  return sendJson(res, result.ok ? 200 : result.status || 500, result);
}

async function handleDataStoreEntriesList(req, res, url) {
  if (!getCurrentAccount(req)) {
    return sendJson(res, 401, { error: "Sign in before listing DataStore entries" });
  }

  const universeId = cleanInteger(url.searchParams.get("universeId"));
  const datastoreName = cleanString(url.searchParams.get("datastoreName"), 128);
  const scope = cleanString(url.searchParams.get("scope"), 128) || "global";
  const prefix = cleanString(url.searchParams.get("prefix"), 128);
  const cursor = cleanString(url.searchParams.get("cursor"), 512);

  if (universeId <= 0) {
    return sendJson(res, 400, { error: "Select an experience first" });
  }

  if (!datastoreName) {
    return sendJson(res, 400, { error: "Enter a DataStore name before listing entries" });
  }

  const result = await listDataStoreEntries({ universeId, datastoreName, scope, prefix, cursor });
  return sendJson(res, result.ok ? 200 : result.status || 500, result);
}

async function handleDataStoreRead(req, res) {
  if (!getCurrentAccount(req)) {
    return sendJson(res, 401, { error: "Sign in before reading player data" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_DATASTORE_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  let requestInfo;
  try {
    requestInfo = await normalizeDataStoreRequest(body);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const result = await readDataStoreEntry(requestInfo);
  return sendJson(res, result.ok ? 200 : result.status || 500, result);
}

async function handleDataStoreWrite(req, res) {
  if (!getCurrentAccount(req)) {
    return sendJson(res, 401, { error: "Sign in before editing player data" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_DATASTORE_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  let requestInfo;
  try {
    requestInfo = await normalizeDataStoreRequest(body);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  if (!Object.prototype.hasOwnProperty.call(body, "value")) {
    return sendJson(res, 400, { error: "Missing value" });
  }

  const result = await writeDataStoreEntry(requestInfo, body.value);
  return sendJson(res, result.ok ? 200 : result.status || 500, result);
}

async function handlePlayerDataRead(req, res) {
  if (!getCurrentAccount(req)) {
    return sendJson(res, 401, { error: "Sign in before reading player data" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_DATASTORE_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  let requestInfo;
  try {
    requestInfo = await normalizePlayerDataRequest(body);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const result = await readPlayerDataEntry(requestInfo);
  return sendJson(res, result.ok ? 200 : result.status || 500, result);
}

async function handlePlayerDataWrite(req, res) {
  if (!getCurrentAccount(req)) {
    return sendJson(res, 401, { error: "Sign in before editing player data" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_DATASTORE_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  let requestInfo;
  try {
    requestInfo = await normalizePlayerDataRequest(body);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  if (!Object.prototype.hasOwnProperty.call(body, "value")) {
    return sendJson(res, 400, { error: "Missing value" });
  }

  const result = requestInfo.entryKey
    ? await writeDataStoreEntry(requestInfo, body.value)
    : await writePlayerDataEntry(requestInfo, body.value);
  return sendJson(res, result.ok ? 200 : result.status || 500, result);
}

async function listDataStores(options) {
  const url = new URL(`https://apis.roblox.com/datastores/v1/universes/${encodeURIComponent(options.universeId)}/standard-datastores`);
  url.searchParams.set("limit", "100");
  if (options.prefix) url.searchParams.set("prefix", options.prefix);
  if (options.cursor) url.searchParams.set("cursor", options.cursor);

  const response = await fetch(url, {
    headers: {
      "x-api-key": ROBLOX_API_KEY,
    },
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) {
    const error = response.status === 401
      ? "Roblox rejected the API key with 401. Confirm server.mjs has the current API key string, the key is enabled for this universe, IP restrictions allow this machine, and the key has universe-datastores.control:list."
      : getRobloxErrorMessage(payload, `DataStore list failed with ${response.status}`);

    return {
      ok: false,
      status: response.status,
      error,
      payload,
    };
  }

  const datastores = Array.isArray(payload.datastores)
    ? payload.datastores.map(normalizeListedDataStore).filter((store) => store.name)
    : [];

  return {
    ok: true,
    universeId: options.universeId,
    datastores,
    nextPageCursor: cleanString(payload.nextPageCursor, 512),
    raw: payload,
  };
}

async function listDataStoreEntries(options) {
  const url = new URL(`https://apis.roblox.com/datastores/v1/universes/${encodeURIComponent(options.universeId)}/standard-datastores/datastore/entries`);
  url.searchParams.set("datastoreName", options.datastoreName);
  url.searchParams.set("scope", options.scope);
  url.searchParams.set("limit", String(Math.max(1, Math.min(cleanInteger(options.limit) || 100, 100))));
  if (options.prefix) url.searchParams.set("prefix", options.prefix);
  if (options.cursor) url.searchParams.set("cursor", options.cursor);

  const response = await fetch(url, {
    headers: {
      "x-api-key": ROBLOX_API_KEY,
    },
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) {
    const error = response.status === 401
      ? "Roblox rejected the API key with 401. Confirm server.mjs has the current API key string, the key is enabled for this universe, IP restrictions allow this machine, and the key has universe-datastores.objects:list."
      : getRobloxErrorMessage(payload, `DataStore entry list failed with ${response.status}`);

    return {
      ok: false,
      status: response.status,
      error,
      payload,
    };
  }

  const entries = Array.isArray(payload.keys)
    ? payload.keys.map(normalizeListedDataStoreEntry).filter((entry) => entry.key)
    : [];

  return {
    ok: true,
    universeId: options.universeId,
    datastoreName: options.datastoreName,
    scope: options.scope,
    entries,
    nextPageCursor: cleanString(payload.nextPageCursor, 512),
    raw: payload,
  };
}

function normalizeListedDataStore(store) {
  return {
    name: cleanString(store?.name, 128),
    createdTime: cleanString(store?.createdTime, 64),
  };
}

function normalizeListedDataStoreEntry(entry) {
  return {
    key: cleanString(entry?.key || entry?.keyName || entry?.name, 256),
    createdTime: cleanString(entry?.createdTime, 64),
    updatedTime: cleanString(entry?.updatedTime, 64),
    version: cleanString(entry?.version, 128),
  };
}

async function normalizeDataStoreRequest(body) {
  const universeId = cleanInteger(body?.universeId);
  const datastoreName = cleanString(body?.datastoreName, 128);
  const scope = cleanString(body?.scope, 128) || "global";
  const target = cleanString(body?.target ?? body?.entryKey, 256);
  const keyPrefix = cleanString(body?.keyPrefix, 128);
  const exactKey = Boolean(body?.exactKey);

  if (universeId <= 0) throw new Error("Select an experience first");
  if (!datastoreName) throw new Error("Enter a DataStore name");
  if (!target) throw new Error("Enter a player username/userId or exact entry key");

  const resolvedKey = await resolveDataStoreEntryKey({ target, keyPrefix, exactKey });

  return {
    universeId,
    datastoreName,
    scope,
    target,
    keyPrefix,
    exactKey,
    ...resolvedKey,
  };
}

async function normalizePlayerDataRequest(body) {
  const universeId = cleanInteger(body?.universeId);
  const datastoreName = cleanString(body?.datastoreName, 128);
  const scope = cleanString(body?.scope, 128) || "global";
  const target = cleanString(body?.target, 256);
  const entryKey = cleanString(body?.entryKey, 256);

  if (universeId <= 0) throw new Error("Select an experience first");
  if (!datastoreName) throw new Error("Select a DataStore first");
  if (!target) throw new Error("Enter a player username or user ID");

  const resolvedUser = await resolvePlayerTarget(target);

  return {
    universeId,
    datastoreName,
    scope,
    target,
    keyPrefix: "",
    exactKey: Boolean(entryKey),
    entryKey,
    resolvedUser,
  };
}

async function resolvePlayerTarget(target) {
  const targetUserId = cleanInteger(target);
  if (targetUserId > 0) {
    return {
      userId: targetUserId,
    };
  }

  const resolvedTargets = await resolveUserTargets(target);
  const match = resolvedTargets.resolved[0];
  if (!match?.userId) {
    throw new Error(`Could not resolve Roblox username: ${target}`);
  }

  return {
    userId: match.userId,
    username: match.username || match.input,
    displayName: match.displayName || "",
  };
}

async function resolveDataStoreEntryKey(options) {
  if (options.exactKey) {
    return {
      entryKey: options.target,
      resolvedUser: null,
    };
  }

  const targetUserId = cleanInteger(options.target);
  if (targetUserId > 0) {
    return {
      entryKey: `${options.keyPrefix}${targetUserId}`,
      resolvedUser: {
        userId: targetUserId,
      },
    };
  }

  const resolvedTargets = await resolveUserTargets(options.target);
  const match = resolvedTargets.resolved[0];
  if (!match?.userId) {
    throw new Error(`Could not resolve Roblox username: ${options.target}`);
  }

  return {
    entryKey: `${options.keyPrefix}${match.userId}`,
    resolvedUser: {
      userId: match.userId,
      username: match.username || match.input,
      displayName: match.displayName || "",
    },
  };
}

async function readDataStoreEntry(options) {
  const response = await fetch(getDataStoreEntryUrl(options), {
    headers: {
      "x-api-key": ROBLOX_API_KEY,
    },
  });

  const payload = await parseDataStoreEntryResponse(response);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: getRobloxErrorMessage(payload, `DataStore read failed with ${response.status}`),
      payload,
      request: getSafeDataStoreRequest(options),
    };
  }

  return {
    ok: true,
    request: getSafeDataStoreRequest(options),
    value: payload.value,
    rawText: payload.rawText,
    version: response.headers.get("roblox-entry-version") || "",
    createdTime: response.headers.get("roblox-entry-created-time") || "",
    updatedTime: response.headers.get("roblox-entry-version-created-time") || "",
    attributes: response.headers.get("roblox-entry-attributes") || "",
    userIds: response.headers.get("roblox-entry-userids") || "",
  };
}

async function readPlayerDataEntry(options) {
  const candidates = await getPlayerDataEntryCandidates(options);
  let lastResult = null;

  for (const candidate of candidates) {
    const result = await readDataStoreEntry({
      ...options,
      keyPrefix: candidate.prefix,
      entryKey: candidate.entryKey,
    });

    if (result.ok) {
      return {
        ...result,
        inferred: {
          keyPrefix: candidate.prefix,
          candidatesTried: candidates.map((item) => item.entryKey),
          sampleKeys: candidate.sampleKeys,
        },
      };
    }

    lastResult = result;
    if (result.status && result.status !== 404) {
      return result;
    }
  }

  return lastResult || {
    ok: false,
    status: 404,
    error: "No player data entry found for that user",
    request: getSafeDataStoreRequest(options),
  };
}

async function writeDataStoreEntry(options, value) {
  const response = await fetch(getDataStoreEntryUrl(options), {
    method: "POST",
    headers: {
      "x-api-key": ROBLOX_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });

  const payload = await parseDataStoreEntryResponse(response);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: getRobloxErrorMessage(payload, `DataStore write failed with ${response.status}`),
      payload,
      request: getSafeDataStoreRequest(options),
    };
  }

  return {
    ok: true,
    status: response.status,
    request: getSafeDataStoreRequest(options),
    value,
    version: response.headers.get("roblox-entry-version") || "",
    payload,
  };
}

async function writePlayerDataEntry(options, value) {
  const existing = await readPlayerDataEntry(options);
  if (!existing.ok) return existing;

  return writeDataStoreEntry(existing.request, value);
}

function getDataStoreEntryUrl(options) {
  const url = new URL(`https://apis.roblox.com/datastores/v1/universes/${encodeURIComponent(options.universeId)}/standard-datastores/datastore/entries/entry`);
  url.searchParams.set("datastoreName", options.datastoreName);
  url.searchParams.set("entryKey", options.entryKey);
  url.searchParams.set("scope", options.scope);
  return url;
}

async function getPlayerDataEntryCandidates(options) {
  const userId = options.resolvedUser?.userId;
  if (!userId) return [];

  const samples = await listDataStoreEntries({
    universeId: options.universeId,
    datastoreName: options.datastoreName,
    scope: options.scope,
    limit: PLAYER_DATA_SAMPLE_LIMIT,
  });

  const sampleKeys = samples.ok
    ? samples.entries.map((entry) => entry.key).filter(Boolean)
    : [];
  const prefixes = inferPlayerDataKeyPrefixes(sampleKeys);

  prefixes.unshift("", "Player_");

  return [...new Set(prefixes)].map((prefix) => ({
    prefix,
    entryKey: `${prefix}${userId}`,
    sampleKeys,
  }));
}

function inferPlayerDataKeyPrefixes(keys) {
  const prefixes = [];

  for (const key of keys) {
    const match = String(key).match(/^(.*?)(\d+)$/);
    if (!match) continue;

    const prefix = match[1] || "";
    if (!prefixes.includes(prefix)) {
      prefixes.push(prefix);
    }
  }

  return prefixes;
}

function getSafeDataStoreRequest(options) {
  return {
    universeId: options.universeId,
    datastoreName: options.datastoreName,
    scope: options.scope,
    target: options.target,
    exactKey: options.exactKey,
    keyPrefix: options.keyPrefix,
    entryKey: options.entryKey,
    resolvedUser: options.resolvedUser,
  };
}

async function parseDataStoreEntryResponse(response) {
  const rawText = await response.text();
  if (!rawText) {
    return {
      value: null,
      rawText: "",
    };
  }

  try {
    return {
      value: JSON.parse(rawText),
      rawText,
    };
  } catch {
    return {
      value: rawText,
      rawText,
      error: rawText,
    };
  }
}

async function handleTeleportCommand(req, res) {
  const sessionId = getSessionId(req);
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) {
    return sendJson(res, 401, { error: "Sign in before sending commands" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_COMMAND_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const selectedTargetUserId = cleanInteger(body.targetUserId);
  const resolvedTarget = await resolveUserTargets(body.target ?? body.targetUser ?? body.targetPlayer);
  const targetUserId = selectedTargetUserId > 0
    ? selectedTargetUserId
    : resolvedTarget.userIds[0] || 0;
  const selectedPlayerUserIds = Array.isArray(body.playerUserIds)
    ? [...new Set(body.playerUserIds.map(cleanInteger).filter((userId) => userId > 0))]
    : [];
  const resolvedPlayers = await resolveUserTargets(body.manualTargets ?? body.manualUserIds);
  const playerUserIds = [...new Set([...selectedPlayerUserIds, ...resolvedPlayers.userIds])];

  if (targetUserId <= 0) {
    return sendJson(res, 400, { error: "Enter a valid target player username or user ID" });
  }

  if (!playerUserIds.length) {
    return sendJson(res, 400, { error: "Enter or select at least one player to teleport" });
  }

  const target = findLivePlayer(targetUserId);
  if (!target) {
    return sendJson(res, 404, { error: "Target player is not in a live server" });
  }

  const selectedPlayers = playerUserIds.map(findLivePlayer).filter(Boolean);
  const missingCount = playerUserIds.length - selectedPlayers.length;
  const commandsBySourceJobId = new Map();

  for (const selected of selectedPlayers) {
    if (selected.jobId === target.jobId) {
      continue;
    }

    const existing = commandsBySourceJobId.get(selected.jobId) || [];
    existing.push(selected.userId);
    commandsBySourceJobId.set(selected.jobId, existing);
  }

  if (!commandsBySourceJobId.size) {
    return sendJson(res, 400, { error: "Selected players are already in the target server or are no longer live" });
  }

  const queuedCommands = [];
  let immediateCount = 0;
  for (const [sourceJobId, sourcePlayerUserIds] of commandsBySourceJobId) {
    const command = {
      id: randomBase64Url(12),
      type: "teleportPlayersToServer",
      createdAt: Date.now(),
      requestedBy: session.robloxUserId,
      target: {
        userId: target.userId,
        username: target.username,
        displayName: target.displayName,
        universeId: target.universeId,
        placeId: target.placeId,
        jobId: target.jobId,
      },
      playerUserIds: sourcePlayerUserIds,
    };

    const delivery = await publishCommandToServer(session, target.universeId, sourceJobId, command);
    if (delivery.ok) {
      immediateCount += sourcePlayerUserIds.length;
    } else {
      queueCommand(sourceJobId, command);
    }

    queuedCommands.push({
      sourceJobId,
      playerUserIds: sourcePlayerUserIds,
      commandId: command.id,
      delivery: delivery.ok ? "published" : "heartbeat-fallback",
      error: delivery.ok ? undefined : delivery.error,
    });
  }

  return sendJson(res, 200, {
    ok: true,
    target,
    queuedCommands,
    immediateCount,
    missingCount,
    resolvedTargets: resolvedPlayers.resolved,
    unresolvedTargets: [...resolvedTarget.unresolved, ...resolvedPlayers.unresolved],
  });
}

async function handleModerationCommand(req, res) {
  const sessionId = getSessionId(req);
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) {
    return sendJson(res, 401, { error: "Sign in before sending commands" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_COMMAND_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const action = cleanString(body.action, 24);
  const allowedActions = new Set(["kick", "ban", "unban"]);
  if (!allowedActions.has(action)) {
    return sendJson(res, 400, { error: "Invalid moderation action" });
  }

  const playerUserIds = Array.isArray(body.playerUserIds)
    ? body.playerUserIds.map(cleanInteger).filter((userId) => userId > 0)
    : [];
  const resolvedTargets = await resolveUserTargets(body.manualTargets ?? body.manualUserIds);
  const userIds = [...new Set([...playerUserIds, ...resolvedTargets.userIds])];

  if (!userIds.length) {
    return sendJson(res, 400, { error: "Select or enter at least one valid user ID or username" });
  }

  const reason = cleanString(body.reason, 400);
  const durationSeconds = normalizeBanDuration(body.durationSeconds);
  const universeId = cleanInteger(body.universeId) || findFirstUserUniverseId(userIds);

  if ((action === "ban" || action === "unban") && universeId <= 0) {
    return sendJson(res, 400, { error: "Select an experience before banning or unbanning" });
  }

  if (action === "kick") {
    if (universeId <= 0) {
      return sendJson(res, 400, { error: "Select an experience before kicking" });
    }

    const command = {
      id: randomBase64Url(12),
      type: "kickPlayers",
      createdAt: Date.now(),
      requestedBy: session.robloxUserId,
      userIds,
      reason,
    };
    const delivery = await publishKickCommand(session, universeId, command);
    const deliveries = [{
      universeId,
      topic: KICK_COMMAND_TOPIC,
      userIds,
      commandId: command.id,
      delivery: delivery.ok ? "published" : "failed",
      ...delivery,
    }];

    const publishedCount = deliveries.filter((result) => result.ok).length;
    return sendJson(res, 200, {
      ok: publishedCount > 0,
      action,
      userIds,
      resolvedTargets: resolvedTargets.resolved,
      unresolvedTargets: resolvedTargets.unresolved,
      universeId,
      publishedCount,
      deliveries,
    });
  }

  const results = await updateUserRestrictions(session, {
    action,
    universeId,
    userIds,
    reason,
    durationSeconds,
  });
  const updatedCount = results.filter((result) => result.ok).length;
  let kickDelivery = null;

  if (action === "ban" && updatedCount > 0) {
    const command = {
      id: randomBase64Url(12),
      type: "kickPlayers",
      createdAt: Date.now(),
      requestedBy: session.robloxUserId,
      userIds: results.filter((result) => result.ok).map((result) => result.userId),
      reason: reason || "Banned by an administrator.",
    };
    const delivery = await publishKickCommand(session, universeId, command);
    kickDelivery = {
      universeId,
      topic: KICK_COMMAND_TOPIC,
      userIds: command.userIds,
      commandId: command.id,
      delivery: delivery.ok ? "published" : "failed",
      ...delivery,
    };
  }

  return sendJson(res, 200, {
    ok: updatedCount > 0,
    action,
    userIds,
    resolvedTargets: resolvedTargets.resolved,
    unresolvedTargets: resolvedTargets.unresolved,
    universeId,
    updatedCount,
    publishedCount: updatedCount,
    kickPublishedCount: kickDelivery?.ok ? 1 : 0,
    kickDeliveries: kickDelivery ? [kickDelivery] : [],
    results,
  });
}

async function handleAnnouncementCommand(req, res) {
  const sessionId = getSessionId(req);
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) {
    return sendJson(res, 401, { error: "Sign in before sending commands" });
  }

  let body;
  try {
    body = await readJsonBody(req, MAX_COMMAND_BODY_BYTES);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const scope = cleanString(body.scope, 24) || "global";
  const universeId = cleanInteger(body.universeId);
  const message = cleanString(body.message, 240);
  const durationSeconds = Math.min(Math.max(cleanInteger(body.durationSeconds) || 6, 3), 20);

  if (!["global", "server", "player"].includes(scope)) {
    return sendJson(res, 400, { error: "Invalid announcement scope" });
  }

  if (universeId <= 0) {
    return sendJson(res, 400, { error: "Select an experience before sending a message" });
  }

  if (!message) {
    return sendJson(res, 400, { error: "Enter a message first" });
  }

  const command = {
    id: randomBase64Url(12),
    type: "globalAnnouncement",
    createdAt: Date.now(),
    requestedBy: session.robloxUserId,
    message,
    durationSeconds,
  };

  if (scope === "global") {
    const delivery = await publishAnnouncementCommand(session, universeId, command);
    return sendJson(res, delivery.ok ? 200 : 502, {
      ok: delivery.ok,
      scope,
      universeId,
      topic: GLOBAL_ANNOUNCEMENT_TOPIC,
      commandId: command.id,
      delivery: delivery.ok ? "published" : "failed",
      ...delivery,
    });
  }

  if (scope === "server") {
    const selectedUserId = cleanInteger(body.targetUserId);
    const resolvedTargets = await resolveUserTargets(body.serverTarget ?? body.manualTargets);
    const userIds = [...new Set([
      ...(selectedUserId > 0 ? [selectedUserId] : []),
      ...resolvedTargets.userIds,
    ])];

    if (!userIds.length) {
      return sendJson(res, 400, { error: "Enter a player username or user ID for the server to find" });
    }

    const delivery = await publishAnnouncementCommand(session, universeId, {
      ...command,
      targetServerUserIds: userIds,
    });

    return sendJson(res, delivery.ok ? 200 : 502, {
      ok: delivery.ok,
      scope,
      universeId,
      topic: GLOBAL_ANNOUNCEMENT_TOPIC,
      commandId: command.id,
      userIds,
      resolvedTargets: resolvedTargets.resolved,
      unresolvedTargets: resolvedTargets.unresolved,
      delivery: delivery.ok ? "published-server-lookup" : "failed",
      ...delivery,
    });
  }

  const selectedUserIds = Array.isArray(body.playerUserIds)
    ? body.playerUserIds.map(cleanInteger).filter((userId) => userId > 0)
    : [];
  const resolvedTargets = await resolveUserTargets(body.manualTargets ?? body.manualUserIds);
  const userIds = [...new Set([...selectedUserIds, ...resolvedTargets.userIds])];
  if (!userIds.length) {
    return sendJson(res, 400, { error: "Select or enter at least one player username or user ID" });
  }

  const delivery = await publishAnnouncementCommand(session, universeId, {
    ...command,
    playerUserIds: userIds,
  });

  return sendJson(res, delivery.ok ? 200 : 502, {
    ok: delivery.ok,
    scope,
    universeId,
    topic: GLOBAL_ANNOUNCEMENT_TOPIC,
    commandId: command.id,
    userIds,
    resolvedTargets: resolvedTargets.resolved,
    unresolvedTargets: resolvedTargets.unresolved,
    delivery: delivery.ok ? "published-player-lookup" : "failed",
    ...delivery,
  });
}

async function publishCommandToServer(session, universeId, jobId, command) {
  return publishCommandToTopic(session, universeId, getServerCommandTopic(jobId), command);
}

async function publishKickCommand(session, universeId, command) {
  return publishCommandToTopic(session, universeId, KICK_COMMAND_TOPIC, command);
}

async function publishAnnouncementCommand(session, universeId, command) {
  return publishCommandToTopic(session, universeId, GLOBAL_ANNOUNCEMENT_TOPIC, command);
}

async function publishCommandToTopic(session, universeId, topic, command) {
  try {
    const accessToken = await refreshAccessToken(session);
    console.log("[MessagingService] Publishing command", {
      type: command.type,
      universeId,
      topic,
      userIds: command.userIds || command.playerUserIds || [],
    });

    const response = await fetch(`https://apis.roblox.com/messaging-service/v1/universes/${encodeURIComponent(universeId)}/topics/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: JSON.stringify(command),
      }),
    });

    const payload = await parseRobloxResponse(response);
    if (!response.ok) {
      console.warn("[MessagingService] Publish failed", {
        status: response.status,
        topic,
        payload,
      });

      return {
        ok: false,
        status: response.status,
        topic,
        payload,
        error: payload.error_description || payload.error || payload.message || `Publish failed with ${response.status}`,
      };
    }

    console.log("[MessagingService] Publish accepted", {
      status: response.status,
      topic,
      payload,
    });

    return {
      ok: true,
      status: response.status,
      topic,
      payload,
    };
  } catch (error) {
    console.warn("[MessagingService] Publish crashed", {
      topic,
      error: error.message,
    });

    return {
      ok: false,
      topic,
      error: error.message,
    };
  }
}

async function updateUserRestrictions(session, options) {
  const accessToken = await refreshAccessToken(session);
  const results = [];

  for (const userId of options.userIds) {
    results.push(await updateUserRestriction(accessToken, {
      action: options.action,
      universeId: options.universeId,
      userId,
      reason: options.reason,
      durationSeconds: options.durationSeconds,
    }));
  }

  return results;
}

async function updateUserRestriction(accessToken, options) {
  const url = new URL(`https://apis.roblox.com/cloud/v2/universes/${encodeURIComponent(options.universeId)}/user-restrictions/${encodeURIComponent(options.userId)}`);
  url.searchParams.set("updateMask", "game_join_restriction");
  url.searchParams.set("idempotencyKey.key", randomBase64Url(16));
  url.searchParams.set("idempotencyKey.firstSent", new Date().toISOString());

  const body = {
    user: `users/${options.userId}`,
    gameJoinRestriction: buildGameJoinRestriction(options),
  };

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await parseRobloxResponse(response);
    if (!response.ok) {
      return {
        ok: false,
        userId: options.userId,
        error: payload.error_description || payload.error || payload.message || `Restriction update failed with ${response.status}`,
      };
    }

    return {
      ok: true,
      userId: options.userId,
      restriction: payload,
    };
  } catch (error) {
    return {
      ok: false,
      userId: options.userId,
      error: error.message,
    };
  }
}

function buildGameJoinRestriction(options) {
  if (options.action === "unban") {
    return { active: false };
  }

  const reason = options.reason || "Banned by an administrator.";
  const restriction = {
    active: true,
    privateReason: reason,
    displayReason: reason,
    excludeAltAccounts: false,
  };

  if (options.durationSeconds > 0) {
    restriction.duration = `${options.durationSeconds}s`;
  }

  return restriction;
}

function isValidPresenceSecret(req) {
  const secret = req.headers["x-dashboard-secret"];
  if (typeof secret !== "string" || !secret || !PRESENCE_SECRET) return false;

  const expected = Buffer.from(PRESENCE_SECRET);
  const provided = Buffer.from(secret);
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
      deathSamples,
      leaveSamples,
    },
  };
}

function normalizeChatLogs(value, context) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_CHAT_LOGS_PER_PAYLOAD).map((entry) => ({
    id: cleanString(entry?.id, 160),
    universeId: context.universeId,
    placeId: context.placeId,
    jobId: context.jobId,
    userId: cleanInteger(entry?.userId),
    username: cleanString(entry?.username || entry?.name, 64),
    displayName: cleanString(entry?.displayName, 64),
    message: cleanString(entry?.message, 500),
    sentAt: cleanTimestampMs(entry?.sentAt) || context.receivedAt,
    receivedAt: context.receivedAt,
  })).filter((entry) => entry.userId > 0 && entry.username && entry.message);
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
  await fs.mkdir(mapSnapshotDir, { recursive: true });
  await fs.writeFile(getMapSnapshotPath(snapshot.universeId), JSON.stringify(snapshot), "utf8");
}

async function readPersistedMapSnapshot(universeId) {
  try {
    const text = await fs.readFile(getMapSnapshotPath(universeId), "utf8");
    const snapshot = JSON.parse(text);
    if (cleanInteger(snapshot?.universeId) !== universeId || !Array.isArray(snapshot?.parts)) {
      return null;
    }

    return snapshot;
  } catch {
    return null;
  }
}

function getMapSnapshotPath(universeId) {
  return path.join(mapSnapshotDir, `${cleanInteger(universeId)}.json`);
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

  return getMovementHeatmap(filters);
}

async function getDeathHeatmapFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });

  return getDeathHeatmap(filters);
}

async function getLeaveHeatmapFromQuery(searchParams) {
  const filters = await normalizeMovementFilters({
    universeId: searchParams.get("universeId"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    target: searchParams.get("target") || searchParams.get("player"),
  });

  return getLeaveHeatmap(filters);
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
  const samples = getMovementSamplesForFilters(filters);

  samples.sort((a, b) => b.sampledAt - a.sampledAt || b.receivedAt - a.receivedAt);
  const limitedSamples = samples.slice(0, MAX_MOVEMENT_SAMPLES_RESPONSE);

  return {
    universeId: universeIdFilter || null,
    sampleCount: samples.length,
    returnedCount: limitedSamples.length,
    maxSamplesPerUniverse: MAX_MOVEMENT_SAMPLES_PER_UNIVERSE,
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

function getRobloxHeatmap(universeId, filters = {}) {
  const cleanUniverseId = cleanInteger(universeId);
  const samples = getMovementSamplesForFilters({
    ...filters,
    universeId: cleanUniverseId,
  });
  const bins = new Map();

  for (const sample of samples) {
    const x = Math.round(sample.x / ROBLOX_HEATMAP_BIN_SIZE) * ROBLOX_HEATMAP_BIN_SIZE;
    const y = Math.round(sample.y / ROBLOX_HEATMAP_BIN_SIZE) * ROBLOX_HEATMAP_BIN_SIZE;
    const z = Math.round(sample.z / ROBLOX_HEATMAP_BIN_SIZE) * ROBLOX_HEATMAP_BIN_SIZE;
    const key = `${x}:${y}:${z}`;
    const existing = bins.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      bins.set(key, { x, y, z, count: 1 });
    }
  }

  const points = [...bins.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_ROBLOX_HEATMAP_POINTS);
  const maxCount = points.reduce((max, point) => Math.max(max, point.count), 1);

  return {
    binSize: ROBLOX_HEATMAP_BIN_SIZE,
    universeId: cleanUniverseId || null,
    sampleCount: samples.length,
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

  logs.sort((a, b) => b.sentAt - a.sentAt || b.receivedAt - a.receivedAt);

  return {
    universeId: universeIdFilter || null,
    logCount: logs.length,
    maxLogsPerUniverse: MAX_CHAT_LOGS_PER_UNIVERSE,
    logs: logs.slice(0, MAX_CHAT_LOGS_PER_UNIVERSE),
  };
}

function getChatInsights(filters = {}) {
  const chatPayload = getChatLogs(filters);
  const candidateLogs = chatPayload.logs
    .slice(0, MAX_CHAT_MESSAGES_FOR_INSIGHTS)
    .filter((log) => isQuestionLikeMessage(log.message));
  const groups = new Map();

  for (const log of candidateLogs) {
    const normalized = normalizeChatQuestion(log.message);
    if (!normalized.key) continue;

    const existing = groups.get(normalized.key) || {
      id: normalized.key,
      title: normalized.title,
      mentions: 0,
      examples: [],
      firstSeenAt: log.sentAt,
      lastSeenAt: log.sentAt,
      players: new Set(),
    };

    existing.mentions += 1;
    existing.firstSeenAt = Math.min(existing.firstSeenAt || log.sentAt, log.sentAt);
    existing.lastSeenAt = Math.max(existing.lastSeenAt || log.sentAt, log.sentAt);
    if (log.userId > 0) existing.players.add(log.userId);

    if (existing.examples.length < 3 && !existing.examples.some((example) => example.message === log.message)) {
      existing.examples.push({
        message: log.message,
        username: log.username,
        sentAt: log.sentAt,
      });
    }

    groups.set(normalized.key, existing);
  }

  const questions = [...groups.values()]
    .sort((a, b) => b.mentions - a.mentions || b.lastSeenAt - a.lastSeenAt)
    .slice(0, MAX_COMMON_QUESTIONS_RESPONSE)
    .map((group) => ({
      id: group.id,
      title: group.title,
      mentions: group.mentions,
      playerCount: group.players.size,
      examples: group.examples,
      firstSeenAt: group.firstSeenAt,
      lastSeenAt: group.lastSeenAt,
    }));

  return {
    universeId: chatPayload.universeId,
    sourceLogCount: chatPayload.logCount,
    analyzedCount: Math.min(chatPayload.logs.length, MAX_CHAT_MESSAGES_FOR_INSIGHTS),
    questionLikeCount: candidateLogs.length,
    maxMessagesAnalyzed: MAX_CHAT_MESSAGES_FOR_INSIGHTS,
    generatedAt: Date.now(),
    mode: "local",
    questions,
  };
}

function isQuestionLikeMessage(message) {
  const text = String(message || "").trim().toLowerCase();
  if (!text) return false;
  if (text.includes("?")) return true;
  if (/^(where|how|what|why|when|who|can|do|does|did|is|are|will|should)\b/.test(text)) return true;
  return /\b(help|stuck|lost|confused|cant|can't|cannot|wheres|where's|find|exit)\b/.test(text);
}

function normalizeChatQuestion(message) {
  const rawText = String(message || "").trim();
  const normalizedText = rawText
    .toLowerCase()
    .replace(/can't/g, "cant")
    .replace(/where's/g, "where is")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedText) return { key: "", title: "" };

  const tokens = normalizedText.split(" ").filter(Boolean);
  const tokenSet = new Set(tokens);
  let intent = "question";

  if (tokenSet.has("where") || tokenSet.has("wheres") || tokenSet.has("find")) {
    intent = "where";
  } else if (tokenSet.has("how")) {
    intent = "how";
  } else if (tokenSet.has("what")) {
    intent = "what";
  } else if (tokenSet.has("why")) {
    intent = "why";
  } else if (["help", "stuck", "lost", "confused", "cant", "cannot", "exit"].some((word) => tokenSet.has(word))) {
    intent = "help";
  }

  const stopWords = new Set([
    "a", "an", "and", "are", "at", "bro", "can", "cant", "cannot", "did", "do", "does",
    "find", "for", "get", "guys", "help", "how", "i", "in", "is", "it", "me", "my", "of",
    "on", "please", "pls", "someone", "the", "this", "to", "u", "where", "wheres", "with",
  ]);
  const keywordTokens = tokens
    .filter((token) => !stopWords.has(token))
    .map((token) => normalizeQuestionToken(token))
    .filter(Boolean);
  const uniqueKeywords = [...new Set(keywordTokens)].slice(0, 6);
  const keyText = uniqueKeywords.join(" ") || tokens.slice(0, 6).join(" ");
  const key = `${intent}:${keyText}`;

  return {
    key,
    title: buildQuestionTitle(intent, uniqueKeywords, rawText),
  };
}

function normalizeQuestionToken(token) {
  if (token === "swords") return "sword";
  if (token === "exits") return "exit";
  if (token === "quests") return "quest";
  if (token === "bosses") return "boss";
  if (token === "doors") return "door";
  return token;
}

function buildQuestionTitle(intent, keywords, fallback) {
  const topic = titleCaseWords(keywords.join(" "));
  if (!topic) {
    const cleanFallback = cleanString(fallback, 80).replace(/\s+/g, " ").trim();
    return cleanFallback.endsWith("?") ? cleanFallback : `${cleanFallback}?`;
  }

  if (intent === "where") return `Where is ${topic}?`;
  if (intent === "how") return `How do I ${topic}?`;
  if (intent === "what") return `What is ${topic}?`;
  if (intent === "why") return `Why ${topic}?`;
  if (intent === "help") return `Players need help with ${topic}`;
  return `${topic}?`;
}

function titleCaseWords(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.length <= 2 ? word : `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function getLiveServers(filters = {}) {
  const now = Date.now();
  const servers = [];
  const universeIdFilter = cleanInteger(filters.universeId);

  for (const [jobId, presence] of serverPresence) {
    const ageMs = now - presence.receivedAt;
    if (ageMs > PRESENCE_STALE_MS) {
      serverPresence.delete(jobId);
      clearPlayerPresenceForServer(jobId);
      continue;
    }

    if (universeIdFilter > 0 && presence.universeId !== universeIdFilter) {
      continue;
    }

    servers.push({
      ...presence,
      ageSeconds: Math.floor(ageMs / 1000),
      uptimeSeconds: Math.max(0, Math.floor((now - presence.serverStartedAt) / 1000)),
      players: presence.players.map((player) => ({
        ...player,
        durationSeconds: Math.max(0, Math.floor((now - player.joinedAt) / 1000)),
      })),
    });
  }

  servers.sort((a, b) => b.playerCount - a.playerCount || b.receivedAt - a.receivedAt);

  return {
    staleAfterSeconds: Math.floor(PRESENCE_STALE_MS / 1000),
    serverCount: servers.length,
    playerCount: servers.reduce((total, serverInfo) => total + serverInfo.playerCount, 0),
    servers,
  };
}

function findLivePlayer(userId) {
  for (const serverInfo of getLiveServers().servers) {
    const player = serverInfo.players.find((candidate) => candidate.userId === userId);
    if (!player) continue;

    return {
      ...player,
      universeId: serverInfo.universeId,
      placeId: serverInfo.placeId,
      jobId: serverInfo.jobId,
    };
  }

  return null;
}

function findFirstUserUniverseId(userIds) {
  for (const userId of userIds) {
    const player = findLivePlayer(userId);
    if (player) return player.universeId;
  }

  return 0;
}

function queueCommand(jobId, command) {
  const commands = pendingCommandsByJobId.get(jobId) || [];
  commands.push(command);
  pendingCommandsByJobId.set(jobId, commands.slice(-MAX_COMMANDS_PER_HEARTBEAT));
}

function consumePendingCommands(jobId) {
  const commands = pendingCommandsByJobId.get(jobId) || [];
  pendingCommandsByJobId.delete(jobId);
  return commands.slice(0, MAX_COMMANDS_PER_HEARTBEAT);
}

function getServerCommandTopic(jobId) {
  return `${DASHBOARD_COMMAND_TOPIC_PREFIX}${jobId}`;
}

function applyPlayerDurations(presence) {
  const now = Date.now();
  const activePlayerKeys = new Set();

  const players = presence.players.map((player) => {
    const key = getPlayerPresenceKey(presence.jobId, player.userId);
    activePlayerKeys.add(key);

    const reportedJoinedAt = cleanTimestampMs(player.joinedAt);
    if (reportedJoinedAt > 0) {
      playerPresenceStartedAt.set(key, reportedJoinedAt);
    } else if (!playerPresenceStartedAt.has(key)) {
      playerPresenceStartedAt.set(key, now);
    }

    const joinedAt = playerPresenceStartedAt.get(key);
    return {
      ...player,
      joinedAt,
      durationSeconds: Math.max(0, Math.floor((now - joinedAt) / 1000)),
    };
  });

  for (const key of playerPresenceStartedAt.keys()) {
    if (key.startsWith(`${presence.jobId}:`) && !activePlayerKeys.has(key)) {
      playerPresenceStartedAt.delete(key);
    }
  }

  return {
    ...presence,
    players,
  };
}

function clearPlayerPresenceForServer(jobId) {
  for (const key of playerPresenceStartedAt.keys()) {
    if (key.startsWith(`${jobId}:`)) {
      playerPresenceStartedAt.delete(key);
    }
  }
}

function getPlayerPresenceKey(jobId, userId) {
  return `${jobId}:${userId}`;
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

function normalizeBanDuration(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return -1;
  if (seconds <= 0) return -1;

  return Math.max(60, Math.min(Math.floor(seconds), 31_536_000));
}

function startRobloxAuth(req, res) {
  const state = randomBase64Url(32);
  const nonce = randomBase64Url(24);
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = base64Url(crypto.createHash("sha256").update(codeVerifier).digest());

  setOAuthStateCookie(res, {
    state,
    nonce,
    codeVerifier,
    createdAt: Date.now(),
  });

  const authUrl = new URL("https://apis.roblox.com/oauth/v1/authorize");
  authUrl.searchParams.set("client_id", ROBLOX_OAUTH_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", oauthScope);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("prompt", "login consent select_account");
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  redirect(res, authUrl.toString());
}

async function handleRobloxCallback(req, res, url) {
  const error = url.searchParams.get("error");
  if (error) {
    clearOAuthStateCookie(res);
    const description = url.searchParams.get("error_description") || error;
    return redirect(res, `/?auth_error=${encodeURIComponent(description)}`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const authState = getOAuthState(req);

  if (!code || !state || !authState || authState.state !== state) {
    clearOAuthStateCookie(res);
    return redirect(res, "/?auth_error=Invalid OAuth callback state");
  }

  clearOAuthStateCookie(res);

  const tokens = await exchangeCodeForTokens(code, authState.codeVerifier);
  const userInfo = await fetchUserInfo(tokens.access_token);
  const sessionId = randomBase64Url(32);

  sessions.set(sessionId, {
    robloxUserId: userInfo.sub,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    scope: tokens.scope || oauthScope,
    expiresAt: Date.now() + Number(tokens.expires_in || 899) * 1000,
    signedInAt: new Date().toISOString(),
  });

  setSessionCookie(res, sessionId);
  redirect(res, "/");
}

async function exchangeCodeForTokens(code, codeVerifier) {
  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("code_verifier", codeVerifier);
  params.set("client_id", ROBLOX_OAUTH_CLIENT_ID);
  params.set("client_secret", ROBLOX_OAUTH_CLIENT_SECRET);

  const response = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) throw new Error(payload.error_description || payload.error || "Token exchange failed");
  return payload;
}

async function refreshAccessToken(session) {
  if (Date.now() < Number(session.expiresAt || 0) - 60_000) {
    return session.accessToken;
  }

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", session.refreshToken);
  params.set("client_id", ROBLOX_OAUTH_CLIENT_ID);
  params.set("client_secret", ROBLOX_OAUTH_CLIENT_SECRET);

  const response = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) throw new Error(payload.error_description || payload.error || "Token refresh failed");

  session.accessToken = payload.access_token;
  session.refreshToken = payload.refresh_token;
  session.scope = payload.scope || session.scope;
  session.expiresAt = Date.now() + Number(payload.expires_in || 899) * 1000;

  return session.accessToken;
}

async function getExperiences(req) {
  const sessionId = getSessionId(req);
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) return { signedIn: false, experiences: [] };

  const accessToken = await refreshAccessToken(session);
  const resources = await fetchAuthorizedResources(accessToken);
  const universeIds = getAuthorizedUniverseIds(resources);
  const experiences = await Promise.all(universeIds.map((universeId) => fetchUniverse(accessToken, universeId)));

  return {
    signedIn: true,
    universeIds,
    experiences,
    resources,
  };
}

async function fetchAuthorizedResources(accessToken) {
  const params = new URLSearchParams();
  params.set("token", accessToken);
  params.set("client_id", ROBLOX_OAUTH_CLIENT_ID);
  params.set("client_secret", ROBLOX_OAUTH_CLIENT_SECRET);

  const response = await fetch("https://apis.roblox.com/oauth/v1/token/resources", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) throw new Error(payload.error_description || payload.error || "Failed to fetch authorized resources");
  return payload;
}

function getAuthorizedUniverseIds(resourcesPayload) {
  const ids = [];
  for (const resourceInfo of resourcesPayload.resource_infos || []) {
    const universeIds = resourceInfo.resources?.universe?.ids || [];
    for (const universeId of universeIds) {
      if (/^\d+$/.test(String(universeId)) && !ids.includes(String(universeId))) {
        ids.push(String(universeId));
      }
    }
  }
  return ids;
}

async function fetchUniverse(accessToken, universeId) {
  const response = await fetch(`https://apis.roblox.com/cloud/v2/universes/${encodeURIComponent(universeId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) {
    return {
      id: universeId,
      error: payload.error_description || payload.error || payload.message || "Failed to fetch universe",
    };
  }
  return payload;
}

async function fetchUserInfo(accessToken) {
  const response = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const payload = await parseRobloxResponse(response);
  if (!response.ok) throw new Error(payload.error_description || payload.error || "Failed to fetch user info");
  return payload;
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

function getRobloxErrorMessage(payload, fallback) {
  const nestedError = Array.isArray(payload?.value?.errors)
    ? payload.value.errors.map((error) => error.message || error.code).filter(Boolean).join("; ")
    : "";

  return payload?.error_description
    || payload?.error
    || payload?.message
    || payload?.value?.error_description
    || payload?.value?.error
    || payload?.value?.message
    || nestedError
    || payload?.rawText
    || fallback;
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

function getCurrentAccount(req) {
  const sessionId = getSessionId(req);
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) return null;

  return {
    robloxUserId: session.robloxUserId,
    scope: session.scope,
    signedInAt: session.signedInAt,
  };
}

function getSessionId(req) {
  const value = getCookieValue(req, "session");
  if (!value) return null;

  const [sessionId, signature] = value.split(".");
  if (!sessionId || !signature) return null;

  const expected = sign(sessionId);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? sessionId : null;
}

function setSessionCookie(res, sessionId) {
  appendSetCookie(res, `session=${encodeURIComponent(`${sessionId}.${sign(sessionId)}`)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=7776000`);
}

function clearSessionCookie(res) {
  appendSetCookie(res, "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
}

function sign(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function setOAuthStateCookie(res, value) {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  const cookieValue = `${payload}.${sign(payload)}`;
  appendSetCookie(res, `${OAUTH_STATE_COOKIE}=${encodeURIComponent(cookieValue)}; HttpOnly; SameSite=Lax; Path=/auth/roblox; Max-Age=${Math.ceil(OAUTH_STATE_MAX_AGE_MS / 1000)}`);
}

function getOAuthState(req) {
  const value = getCookieValue(req, OAUTH_STATE_COOKIE);
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const createdAt = Number(state?.createdAt || 0);
    if (!state?.state || !state?.nonce || !state?.codeVerifier) return null;
    if (!createdAt || Date.now() - createdAt > OAUTH_STATE_MAX_AGE_MS) return null;
    return state;
  } catch {
    return null;
  }
}

function clearOAuthStateCookie(res) {
  appendSetCookie(res, `${OAUTH_STATE_COOKIE}=; HttpOnly; SameSite=Lax; Path=/auth/roblox; Max-Age=0`);
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

function randomBase64Url(bytes) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function base64Url(buffer) {
  return Buffer.from(buffer).toString("base64url");
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

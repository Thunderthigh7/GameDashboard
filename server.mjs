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
const userStorePath = path.join(__dirname, "data", "users.json");
const projectStorePath = path.join(__dirname, "data", "projects.json");
const usageStorePath = path.join(__dirname, "data", "usage-events.json");
const monthlyUserUsageStorePath = path.join(__dirname, "data", "monthly-user-usage.json");
const objectStorageObjectStorePath = path.join(__dirname, "data", "object-storage-objects.json");
const reconciliationStorePath = path.join(__dirname, "data", "reconciliations.json");

loadLocalEnv();

const port = Number(process.env.PORT || 3000);
const localBaseUrl = `http://localhost:${port}`;
const appBaseUrl = cleanBaseUrl(process.env.PUBLIC_BASE_URL || localBaseUrl);

const DASHBOARD_PASSWORD = getRequiredEnv("DASHBOARD_PASSWORD");
const PRESENCE_SECRET = getRequiredEnv("PRESENCE_SECRET");
const ADMIN_USERNAMES = parseAdminUsernames(process.env.ADMIN_USERNAMES || process.env.ADMIN_USERNAME || "");
const ROBLOX_OAUTH_CLIENT_ID = process.env.ROBLOX_OAUTH_CLIENT_ID || "";
const ROBLOX_OAUTH_CLIENT_SECRET = process.env.ROBLOX_OAUTH_CLIENT_SECRET || "";
const ROBLOX_OAUTH_REDIRECT_URI = process.env.ROBLOX_OAUTH_REDIRECT_URI || `${appBaseUrl}/api/roblox/oauth/callback`;
const ROBLOX_OAUTH_SCOPES = process.env.ROBLOX_OAUTH_SCOPES || "openid profile";
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
const ROBLOX_OAUTH_STATE_COOKIE = "roblox_oauth_state";
const DASHBOARD_AUTH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const ROBLOX_OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const DEFAULT_OPENAI_INSIGHTS_MODEL = "gpt-5.4-mini";
const OPENAI_CHAT_INSIGHTS_MODEL = process.env.OPENAI_CHAT_INSIGHTS_MODEL || DEFAULT_OPENAI_INSIGHTS_MODEL;
const OPENAI_AREA_INSIGHTS_MODEL = process.env.OPENAI_AREA_INSIGHTS_MODEL || OPENAI_CHAT_INSIGHTS_MODEL;
const USAGE_LIMITS = {
  aiRequestsPerMonth: cleanEnvInteger("USAGE_AI_REQUESTS_PER_MONTH", 25),
  openAiTokensPerMonth: cleanEnvInteger("USAGE_OPENAI_TOKENS_PER_MONTH", 500_000),
  mapUploadsPerMonth: cleanEnvInteger("USAGE_MAP_UPLOADS_PER_MONTH", 200),
  backblazeStoredBytes: cleanEnvInteger("USAGE_B2_STORAGE_BYTES", 1_000_000_000),
  backblazeUploadedBytesPerMonth: cleanEnvInteger("USAGE_B2_UPLOAD_BYTES_PER_MONTH", 2_000_000_000),
  backblazeDownloadedBytesPerMonth: cleanEnvInteger("USAGE_B2_DOWNLOAD_BYTES_PER_MONTH", 5_000_000_000),
};
const OPENAI_INPUT_USD_PER_1M = cleanEnvNumber("OPENAI_INPUT_USD_PER_1M", 0.75);
const OPENAI_CACHED_INPUT_USD_PER_1M = cleanEnvNumber("OPENAI_CACHED_INPUT_USD_PER_1M", 0.075);
const OPENAI_OUTPUT_USD_PER_1M = cleanEnvNumber("OPENAI_OUTPUT_USD_PER_1M", 4.5);
const OPENAI_MODEL_PRICING = {
  "gpt-5.4-mini": {
    approved: true,
    inputUsdPer1M: 0.75,
    cachedInputUsdPer1M: 0.075,
    outputUsdPer1M: 4.5,
    notes: "Default low-cost AI insights model.",
  },
  "gpt-5.4 mini": {
    approved: true,
    canonicalModel: "gpt-5.4-mini",
    inputUsdPer1M: 0.75,
    cachedInputUsdPer1M: 0.075,
    outputUsdPer1M: 4.5,
    notes: "Human-readable alias for gpt-5.4-mini.",
  },
  "gpt-5.5": {
    approved: false,
    inputUsdPer1M: 5,
    cachedInputUsdPer1M: 0.5,
    outputUsdPer1M: 30,
    notes: "Expensive fallback guard. Do not use for default scheduled insights.",
  },
};
const DEFAULT_PLAN_KEY = "free";
const PLAN_CONFIG = {
  free: createPlanDefinition({
    key: "free",
    name: "Free",
    priceUsd: 0,
    description: "Try RoAnalytics on one game with conservative monthly limits.",
    highlights: ["1 connected game", "Basic analytics", "Manual AI testing"],
    limits: {
      connectedGames: cleanEnvInteger("PLAN_FREE_CONNECTED_GAMES", 1),
      aiRequestsPerMonth: cleanEnvInteger("PLAN_FREE_AI_REQUESTS_PER_MONTH", 25),
      openAiTokensPerMonth: cleanEnvInteger("PLAN_FREE_OPENAI_TOKENS_PER_MONTH", 500_000),
      mapUploadsPerMonth: cleanEnvInteger("PLAN_FREE_MAP_UPLOADS_PER_MONTH", 25),
      backblazeStoredBytes: cleanEnvInteger("PLAN_FREE_RAW_STORAGE_BYTES", 1_000_000_000),
      backblazeUploadedBytesPerMonth: cleanEnvInteger("PLAN_FREE_RAW_UPLOAD_BYTES_PER_MONTH", 2_000_000_000),
      backblazeDownloadedBytesPerMonth: cleanEnvInteger("PLAN_FREE_RAW_READ_BYTES_PER_MONTH", 5_000_000_000),
      rawRetentionDays: cleanEnvInteger("PLAN_FREE_RAW_RETENTION_DAYS", 7),
    },
  }),
  starter: createPlanDefinition({
    key: "starter",
    name: "Starter",
    priceUsd: 0,
    description: "For small live games that need regular dashboard checks.",
    highlights: ["3 connected games", "More raw history", "More AI runs"],
    limits: {
      connectedGames: cleanEnvInteger("PLAN_STARTER_CONNECTED_GAMES", 3),
      aiRequestsPerMonth: cleanEnvInteger("PLAN_STARTER_AI_REQUESTS_PER_MONTH", 100),
      openAiTokensPerMonth: cleanEnvInteger("PLAN_STARTER_OPENAI_TOKENS_PER_MONTH", 2_000_000),
      mapUploadsPerMonth: cleanEnvInteger("PLAN_STARTER_MAP_UPLOADS_PER_MONTH", 100),
      backblazeStoredBytes: cleanEnvInteger("PLAN_STARTER_RAW_STORAGE_BYTES", 5_000_000_000),
      backblazeUploadedBytesPerMonth: cleanEnvInteger("PLAN_STARTER_RAW_UPLOAD_BYTES_PER_MONTH", 20_000_000_000),
      backblazeDownloadedBytesPerMonth: cleanEnvInteger("PLAN_STARTER_RAW_READ_BYTES_PER_MONTH", 50_000_000_000),
      rawRetentionDays: cleanEnvInteger("PLAN_STARTER_RAW_RETENTION_DAYS", 14),
    },
  }),
  pro: createPlanDefinition({
    key: "pro",
    name: "Pro",
    priceUsd: 0,
    description: "For serious live games with steady traffic and weekly analysis.",
    highlights: ["10 connected games", "High raw history", "Saved AI workflow"],
    limits: {
      connectedGames: cleanEnvInteger("PLAN_PRO_CONNECTED_GAMES", 10),
      aiRequestsPerMonth: cleanEnvInteger("PLAN_PRO_AI_REQUESTS_PER_MONTH", 500),
      openAiTokensPerMonth: cleanEnvInteger("PLAN_PRO_OPENAI_TOKENS_PER_MONTH", 10_000_000),
      mapUploadsPerMonth: cleanEnvInteger("PLAN_PRO_MAP_UPLOADS_PER_MONTH", 500),
      backblazeStoredBytes: cleanEnvInteger("PLAN_PRO_RAW_STORAGE_BYTES", 25_000_000_000),
      backblazeUploadedBytesPerMonth: cleanEnvInteger("PLAN_PRO_RAW_UPLOAD_BYTES_PER_MONTH", 150_000_000_000),
      backblazeDownloadedBytesPerMonth: cleanEnvInteger("PLAN_PRO_RAW_READ_BYTES_PER_MONTH", 300_000_000_000),
      rawRetentionDays: cleanEnvInteger("PLAN_PRO_RAW_RETENTION_DAYS", 30),
    },
  }),
  studio: createPlanDefinition({
    key: "studio",
    name: "Studio",
    priceUsd: 0,
    description: "For teams running multiple active Roblox experiences.",
    highlights: ["25 connected games", "Team-scale analytics", "Longer raw history"],
    limits: {
      connectedGames: cleanEnvInteger("PLAN_STUDIO_CONNECTED_GAMES", 25),
      aiRequestsPerMonth: cleanEnvInteger("PLAN_STUDIO_AI_REQUESTS_PER_MONTH", 1500),
      openAiTokensPerMonth: cleanEnvInteger("PLAN_STUDIO_OPENAI_TOKENS_PER_MONTH", 30_000_000),
      mapUploadsPerMonth: cleanEnvInteger("PLAN_STUDIO_MAP_UPLOADS_PER_MONTH", 1500),
      backblazeStoredBytes: cleanEnvInteger("PLAN_STUDIO_RAW_STORAGE_BYTES", 100_000_000_000),
      backblazeUploadedBytesPerMonth: cleanEnvInteger("PLAN_STUDIO_RAW_UPLOAD_BYTES_PER_MONTH", 750_000_000_000),
      backblazeDownloadedBytesPerMonth: cleanEnvInteger("PLAN_STUDIO_RAW_READ_BYTES_PER_MONTH", 1_500_000_000_000),
      rawRetentionDays: cleanEnvInteger("PLAN_STUDIO_RAW_RETENTION_DAYS", 60),
    },
  }),
};
const B2_STORAGE_USD_PER_TB_MONTH = cleanEnvNumber("B2_STORAGE_USD_PER_TB_MONTH", 6.95);
const B2_EGRESS_OVERAGE_USD_PER_GB = cleanEnvNumber("B2_EGRESS_OVERAGE_USD_PER_GB", 0.01);
const B2_FREE_EGRESS_MULTIPLIER = cleanEnvNumber("B2_FREE_EGRESS_MULTIPLIER", 3);
const B2_RAW_ANALYTICS_RETENTION_DAYS = cleanEnvInteger("B2_RAW_ANALYTICS_RETENTION_DAYS", 14);
const B2_RAW_ANALYTICS_CLEANUP_INTERVAL_MS = cleanEnvInteger("B2_RAW_ANALYTICS_CLEANUP_INTERVAL_MS", 6 * 60 * 60 * 1000);
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
const aiAutomationSettingsCache = new Map();
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
const rawObjectStorageCleanupByUniverse = new Map();
const OBJECT_STORAGE_ROLLUP_CACHE_MS = 60 * 1000;
const DEFAULT_AI_AUTOMATION_SETTINGS = {
  mode: "auto",
  intervalHours: 1,
  updatedAt: null,
  updatedBy: "default",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", appBaseUrl);

    if (url.pathname === "/api/auth/status" && req.method === "GET") {
      const auth = getDashboardAuth(req);
      const user = auth ? await findUserById(auth.userId) : null;
      return sendJson(res, 200, {
        authenticated: Boolean(auth && user),
        user: auth && user ? { username: user.username || auth.username, isAdmin: isAdminUser(user) } : null,
      });
    }

    if (url.pathname === "/api/health" && req.method === "GET") {
      return sendJson(res, 200, getHealthStatus());
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      return handleDashboardLogin(req, res);
    }

    if (url.pathname === "/api/auth/signup" && req.method === "POST") {
      return handleDashboardSignup(req, res);
    }

    if (url.pathname === "/api/auth/roblox/start" && req.method === "GET") {
      return handleRobloxLoginStart(req, res);
    }

    if (url.pathname === "/api/roblox/oauth/callback" && req.method === "GET") {
      return handleRobloxOAuthCallback(req, res, getDashboardAuth(req), url.searchParams);
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

    if (url.pathname === "/api/ai-insights/auto-run" && req.method === "POST") {
      return handleScheduledAiInsightsRun(req, res);
    }

    if (url.pathname === "/api/roblox/heatmap" && req.method === "GET") {
      const project = await getProjectFromRequestSecret(req, url.searchParams.get("universeId"));
      if (!project && !isValidDashboardToolSecret(req)) {
        return sendJson(res, 401, { error: "Invalid dashboard secret" });
      }

      return sendJson(res, 200, await getRobloxHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname.startsWith("/api/") && !isDashboardAuthenticated(req)) {
      return sendJson(res, 401, { error: "Sign in first" });
    }

    const auth = getDashboardAuth(req);

    if (url.pathname === "/api/health/admin" && req.method === "GET") {
      const user = await findUserById(auth.userId);
      if (!user || !isAdminUser(user)) return sendJson(res, 403, { error: "Admin access required" });
      return sendJson(res, 200, getAdminHealthStatus());
    }

    if (url.pathname === "/api/projects" && req.method === "GET") {
      return sendJson(res, 200, { projects: await getUserProjects(auth.userId) });
    }

    if (url.pathname === "/api/projects" && req.method === "POST") {
      return handleProjectCreate(req, res, auth);
    }

    const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (projectMatch && req.method === "DELETE") {
      return handleProjectUnlink(req, res, auth, projectMatch[1]);
    }

    const projectSecretMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/secret$/);
    if (projectSecretMatch && req.method === "POST") {
      return handleProjectSecretRegenerate(req, res, auth, projectSecretMatch[1]);
    }

    if (url.pathname === "/api/roblox/oauth/start" && req.method === "GET") {
      return handleRobloxOAuthStart(req, res, auth, url.searchParams);
    }

    if (url.pathname === "/api/roblox/owned-games" && req.method === "GET") {
      return handleOwnedRobloxGames(req, res, auth);
    }

    if (url.pathname === "/api/account/usage" && req.method === "GET") {
      return sendJson(res, 200, await getAccountUsageSummary(auth.userId));
    }

    if (url.pathname === "/api/account/plan" && req.method === "POST") {
      return handleAccountPlanUpdate(req, res, auth);
    }

    if (url.pathname === "/api/admin/users" && req.method === "GET") {
      const user = await findUserById(auth.userId);
      if (!isAdminUser(user)) {
        return sendJson(res, 403, { error: "Admin access required" });
      }

      return sendJson(res, 200, await getAdminUserSummaries());
    }

    if (url.pathname === "/api/admin/reconciliations" && req.method === "GET") {
      const user = await findUserById(auth.userId);
      if (!isAdminUser(user)) {
        return sendJson(res, 403, { error: "Admin access required" });
      }

      return sendJson(res, 200, await getAdminReconciliations());
    }

    if (url.pathname === "/api/admin/reconciliations" && req.method === "POST") {
      const user = await findUserById(auth.userId);
      if (!isAdminUser(user)) {
        return sendJson(res, 403, { error: "Admin access required" });
      }

      let body;
      try {
        body = await readJsonBody(req, 16 * 1024);
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }

      try {
        return sendJson(res, 200, await saveAdminReconciliation(body, user));
      } catch (error) {
        return sendJson(res, 400, { error: error.message || "Could not save reconciliation." });
      }
    }

    const reconciliationMatch = url.pathname.match(/^\/api\/admin\/reconciliations\/([^/]+)$/);
    if (reconciliationMatch && req.method === "DELETE") {
      const user = await findUserById(auth.userId);
      if (!isAdminUser(user)) {
        return sendJson(res, 403, { error: "Admin access required" });
      }

      const deleted = await deleteAdminReconciliation(reconciliationMatch[1]);
      if (!deleted) return sendJson(res, 404, { error: "Reconciliation record not found" });
      return sendJson(res, 200, await getAdminReconciliations());
    }

    if (url.pathname === "/api/admin/usage/reset" && req.method === "POST") {
      const user = await findUserById(auth.userId);
      if (!isAdminUser(user)) {
        return sendJson(res, 403, { error: "Admin access required" });
      }

      let body;
      try {
        body = await readJsonBody(req);
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }

      const targetUser = await findUserById(cleanString(body?.userId, 120));
      if (!targetUser) {
        return sendJson(res, 404, { error: "User not found" });
      }

      const reset = await resetStoredUsageEventsForUser(targetUser, user);
      return sendJson(res, 200, {
        ...await getAdminUserSummaries(),
        reset,
      });
    }

    if (url.pathname === "/api/universes" && req.method === "GET") {
      return sendJson(res, 200, await getUniverseSummaries(auth.userId));
    }

    if (url.pathname === "/api/chat-logs" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getChatLogsFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/chat-insights" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getStoredChatInsights({
        universeId: url.searchParams.get("universeId"),
      }));
    }

    if (url.pathname === "/api/ai-insights/reports" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getAiInsightReportsFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/ai-insights/report" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getAiInsightReportFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/ai-insights/settings" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getAiAutomationSettings(url.searchParams.get("universeId")));
    }

    if (url.pathname === "/api/ai-insights/settings" && req.method === "POST") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return handleAiAutomationSettingsUpdate(req, res, url.searchParams);
    }

    if (url.pathname === "/api/ai-insights/analyze" && req.method === "POST") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      try {
        const usageContext = await getUsageContextForUniverse(auth.userId, url.searchParams.get("universeId"));
        await assertUsageAvailable(usageContext, "aiRequests", 2);
        await assertUsageAvailable(usageContext, "openAiTokens", 1);
        return sendJson(res, 200, await analyzeAllAiInsights({
          universeId: url.searchParams.get("universeId"),
          from: url.searchParams.get("from"),
          to: url.searchParams.get("to"),
          target: url.searchParams.get("target") || url.searchParams.get("player"),
        }, usageContext));
      } catch (error) {
        if (error.code === "USAGE_LIMIT") return sendUsageLimitError(res, error);
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (url.pathname === "/api/chat-insights/analyze" && req.method === "POST") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      try {
        const usageContext = await getUsageContextForUniverse(auth.userId, url.searchParams.get("universeId"));
        await assertUsageAvailable(usageContext, "aiRequests", 1);
        await assertUsageAvailable(usageContext, "openAiTokens", 1);
        return sendJson(res, 200, await analyzeChatInsights({
          universeId: url.searchParams.get("universeId"),
        }, usageContext));
      } catch (error) {
        if (error.code === "USAGE_LIMIT") return sendUsageLimitError(res, error);
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (url.pathname === "/api/movement-heatmap" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getMovementHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/death-heatmap" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getDeathHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/leave-heatmap" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getLeaveHeatmapFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/ai-area-analysis" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      return sendJson(res, 200, await getAiAreaAnalysisFromQuery(url.searchParams));
    }

    if (url.pathname === "/api/ai-area-analysis/analyze" && req.method === "POST") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
      try {
        const usageContext = await getUsageContextForUniverse(auth.userId, url.searchParams.get("universeId"));
        await assertUsageAvailable(usageContext, "aiRequests", 1);
        await assertUsageAvailable(usageContext, "openAiTokens", 1);
        return sendJson(res, 200, await analyzeAiAreaInsights({
          universeId: url.searchParams.get("universeId"),
          from: url.searchParams.get("from"),
          to: url.searchParams.get("to"),
          target: url.searchParams.get("target") || url.searchParams.get("player"),
        }, usageContext));
      } catch (error) {
        if (error.code === "USAGE_LIMIT") return sendUsageLimitError(res, error);
        return sendJson(res, 400, { error: error.message });
      }
    }

    if (url.pathname === "/api/map-snapshot" && req.method === "GET") {
      if (!await canAccessUniverseFromQuery(auth.userId, url.searchParams)) return sendJson(res, 403, { error: "You do not have access to this universe" });
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

function getAdminHealthStatus() {
  return {
    ...getHealthStatus(),
    ai: getAiHealthStatus(),
  };
}

function getAiHealthStatus() {
  return {
    openAiConfigured: Boolean(OPENAI_API_KEY),
    defaultModel: DEFAULT_OPENAI_INSIGHTS_MODEL,
    chatInsights: getOpenAiModelHealth(OPENAI_CHAT_INSIGHTS_MODEL),
    areaInsights: getOpenAiModelHealth(OPENAI_AREA_INSIGHTS_MODEL),
    approvedModels: Object.entries(OPENAI_MODEL_PRICING)
      .filter(([, pricing]) => pricing.approved)
      .map(([model, pricing]) => ({
        model,
        canonicalModel: pricing.canonicalModel || model,
        pricing: getOpenAiPricingPublic(pricing),
      })),
    envPricingFallback: {
      inputUsdPer1M: OPENAI_INPUT_USD_PER_1M,
      cachedInputUsdPer1M: OPENAI_CACHED_INPUT_USD_PER_1M,
      outputUsdPer1M: OPENAI_OUTPUT_USD_PER_1M,
    },
  };
}

function getOpenAiModelHealth(model) {
  const pricing = getOpenAiPricingForModel(model);
  return {
    model: pricing.model,
    canonicalModel: pricing.canonicalModel,
    approved: pricing.approved,
    pricingSource: pricing.source,
    pricing: getOpenAiPricingPublic(pricing),
    warning: pricing.approved ? null : "Model is not in the approved low-cost AI pricing table.",
  };
}

function getOpenAiPricingPublic(pricing) {
  return {
    inputUsdPer1M: pricing.inputUsdPer1M,
    cachedInputUsdPer1M: pricing.cachedInputUsdPer1M,
    outputUsdPer1M: pricing.outputUsdPer1M,
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

function createPlanDefinition(plan) {
  const limits = normalizePlanLimits(plan.limits);
  return {
    key: cleanPlanKey(plan.key) || DEFAULT_PLAN_KEY,
    name: cleanString(plan.name, 80) || "Plan",
    priceUsd: roundMoney(plan.priceUsd),
    description: cleanString(plan.description, 240),
    highlights: Array.isArray(plan.highlights)
      ? plan.highlights.map((highlight) => cleanString(highlight, 80)).filter(Boolean).slice(0, 4)
      : [],
    limits,
  };
}

function normalizePlanLimits(limits = {}) {
  return {
    connectedGames: cleanFiniteInteger(limits.connectedGames),
    aiRequestsPerMonth: cleanFiniteInteger(limits.aiRequestsPerMonth),
    openAiTokensPerMonth: cleanFiniteInteger(limits.openAiTokensPerMonth),
    mapUploadsPerMonth: cleanFiniteInteger(limits.mapUploadsPerMonth),
    backblazeStoredBytes: cleanFiniteInteger(limits.backblazeStoredBytes),
    backblazeUploadedBytesPerMonth: cleanFiniteInteger(limits.backblazeUploadedBytesPerMonth),
    backblazeDownloadedBytesPerMonth: cleanFiniteInteger(limits.backblazeDownloadedBytesPerMonth),
    rawRetentionDays: cleanFiniteInteger(limits.rawRetentionDays),
  };
}

function getPlanByKey(planKey) {
  return PLAN_CONFIG[cleanPlanKey(planKey)] || null;
}

function getUserPlan(user) {
  return getPlanByKey(user?.planKey) || PLAN_CONFIG[DEFAULT_PLAN_KEY];
}

async function getUserPlanLimits(userId) {
  const user = userId ? await findUserById(userId) : null;
  return { ...getUserPlan(user).limits };
}

function cleanPlanKey(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "");
}

function serializePlan(plan, selectedPlanKey = "") {
  return {
    key: plan.key,
    name: plan.name,
    priceUsd: plan.priceUsd,
    priceLabel: plan.priceUsd > 0 ? `$${plan.priceUsd}/mo` : "Free for now",
    description: plan.description,
    highlights: plan.highlights,
    selected: plan.key === selectedPlanKey,
    limits: { ...plan.limits },
    limitSummary: getPlanLimitSummary(plan.limits),
  };
}

function getPlanLimitSummary(limits = {}) {
  return [
    `${formatUsageNumber(limits.connectedGames)} connected game${limits.connectedGames === 1 ? "" : "s"}`,
    `${formatUsageNumber(limits.aiRequestsPerMonth)} AI run${limits.aiRequestsPerMonth === 1 ? "" : "s"}/month`,
    `${formatBytesForDisplay(limits.backblazeStoredBytes)} raw analytics history`,
    `${formatBytesForDisplay(limits.backblazeUploadedBytesPerMonth)} raw upload/month`,
    `${formatUsageNumber(limits.rawRetentionDays)} day raw data retention`,
  ];
}

function getPlanOptionsForUser(user) {
  const selectedPlanKey = getUserPlan(user).key;
  return Object.values(PLAN_CONFIG).map((plan) => serializePlan(plan, selectedPlanKey));
}

function applyPlanToUsageSummary(summary, user) {
  const plan = getUserPlan(user);
  return {
    ...summary,
    planKey: plan.key,
    limits: { ...plan.limits },
  };
}

async function getConnectedGameLimitStatus(userId) {
  const [user, projects] = await Promise.all([
    findUserById(userId),
    getUserProjects(userId),
  ]);
  const plan = getUserPlan(user);
  const limit = cleanFiniteInteger(plan.limits.connectedGames);
  const used = projects.length;
  return {
    allowed: limit <= 0 || used + 1 <= limit,
    used,
    limit,
    planKey: plan.key,
    planName: plan.name,
  };
}

function formatBytesForDisplay(value) {
  const bytes = cleanFiniteInteger(value);
  if (bytes <= 0) return "Unlimited";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1000 && unitIndex < units.length - 1) {
    size /= 1000;
    unitIndex += 1;
  }
  const rounded = size >= 10 || unitIndex === 0 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${rounded} ${units[unitIndex]}`;
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
    db.collection("users").createIndex({ usernameLower: 1 }, { unique: true }),
    db.collection("users").createIndex({ robloxUserId: 1 }, { unique: true, sparse: true }),
    db.collection("projects").createIndex({ universeId: 1 }, { unique: true }),
    db.collection("projects").createIndex({ ownerUserId: 1 }),
    db.collection("projects").createIndex({ secretHash: 1 }, { unique: true }),
    db.collection("usage_events").createIndex({ userId: 1, month: 1 }),
    db.collection("usage_events").createIndex({ projectId: 1, month: 1 }),
    db.collection("usage_events").createIndex({ universeId: 1, month: 1 }),
    db.collection("usage_events").createIndex({ createdAt: -1 }),
    db.collection("monthly_user_usage").createIndex({ userId: 1, month: 1 }, { unique: true }),
    db.collection("monthly_user_usage").createIndex({ month: 1 }),
    db.collection("object_storage_objects").createIndex({ objectKey: 1 }, { unique: true }),
    db.collection("object_storage_objects").createIndex({ userId: 1 }),
    db.collection("object_storage_objects").createIndex({ universeId: 1 }),
    db.collection("reconciliations").createIndex({ month: 1 }, { unique: true }),
    db.collection("reconciliations").createIndex({ updatedAt: -1 }),
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

async function persistPresenceToObjectStorage(presence, usageContext = {}) {
  if (!OBJECT_STORAGE_CONFIGURED) return { ok: true, skipped: false, reason: "not_configured" };

  try {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getB2S3Client();
    const objectKey = getPresenceBatchObjectKey(presence);
    const body = gzipSync(Buffer.from(createPresenceJsonLines(presence), "utf8"));
    const storageCheck = await canWriteRawAnalyticsToObjectStorage(usageContext, body.length);
    if (!storageCheck.allowed) {
      await recordRawAnalyticsStorageCapSkip(usageContext, body.length, storageCheck);
      objectStorageStatus.connected = true;
      objectStorageStatus.lastError = "";
      return {
        ok: true,
        skipped: true,
        reason: storageCheck.reason,
        limit: createUsageLimitDetails(
          storageCheck.reason === "upload" ? "backblazeUploadedBytes" : "backblazeStoredBytes",
          storageCheck.reason === "upload" ? storageCheck.uploadUsedBytes : storageCheck.storedBytes,
          storageCheck.reason === "upload" ? storageCheck.uploadLimitBytes : storageCheck.limitBytes,
          storageCheck.requestedBytes,
        ),
      };
    }

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
    await recordObjectStorageWrite({
      usageContext,
      objectKey,
      byteLength: body.length,
      feature: "presence_batch",
      contentType: "application/x-ndjson",
    });

    objectStorageStatus.connected = true;
    objectStorageStatus.lastError = "";
    objectStorageStatus.lastWriteAt = Date.now();
    objectStorageStatus.lastObjectKey = objectKey;
    await cleanupRawObjectStorageForUniverse(presence.universeId);
    return { ok: true, skipped: false, objectKey };
  } catch (error) {
    objectStorageStatus.connected = false;
    objectStorageStatus.lastError = error.message || String(error);
    await recordUsageFailure(usageContext, "raw_analytics_ingest_failed", objectStorageStatus.lastError, {
      universeId: presence?.universeId,
      placeId: presence?.placeId,
      jobId: presence?.jobId,
    });
    console.warn("B2 analytics batch write failed:", objectStorageStatus.lastError);
    return { ok: false, skipped: false, error: objectStorageStatus.lastError };
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

async function deleteObjectStoragePrefix(prefix) {
  if (!OBJECT_STORAGE_CONFIGURED || !prefix) return 0;

  const { DeleteObjectsCommand, ListObjectsV2Command } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  let ContinuationToken;
  let deletedCount = 0;

  do {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: B2_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken,
      MaxKeys: 1000,
    }));
    const objects = (response.Contents || [])
      .map((object) => ({ Key: object.Key }))
      .filter((object) => object.Key);

    if (objects.length) {
      await client.send(new DeleteObjectsCommand({
        Bucket: B2_BUCKET_NAME,
        Delete: {
          Objects: objects,
          Quiet: true,
        },
      }));
      await deleteObjectStorageObjectRecords(objects.map((object) => object.Key));
      deletedCount += objects.length;
    }

    ContinuationToken = response.NextContinuationToken;
  } while (ContinuationToken);

  return deletedCount;
}

async function deleteObjectStoragePrefixOlderThan(prefix, cutoffMs) {
  if (!OBJECT_STORAGE_CONFIGURED || !prefix || cleanInteger(cutoffMs) <= 0) return 0;

  const { DeleteObjectsCommand, ListObjectsV2Command } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  let ContinuationToken;
  let deletedCount = 0;

  do {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: B2_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken,
      MaxKeys: 1000,
    }));
    const objects = (response.Contents || [])
      .filter((object) => object.Key && new Date(object.LastModified || 0).getTime() < cutoffMs)
      .map((object) => ({ Key: object.Key }));

    if (objects.length) {
      await client.send(new DeleteObjectsCommand({
        Bucket: B2_BUCKET_NAME,
        Delete: {
          Objects: objects,
          Quiet: true,
        },
      }));
      await deleteObjectStorageObjectRecords(objects.map((object) => object.Key));
      deletedCount += objects.length;
    }

    ContinuationToken = response.NextContinuationToken;
  } while (ContinuationToken);

  return deletedCount;
}

async function deleteObjectStorageKey(objectKey) {
  if (!OBJECT_STORAGE_CONFIGURED || !objectKey) return 0;

  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  try {
    await client.send(new DeleteObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: objectKey,
    }));
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) return 0;
    throw error;
  }
  await deleteObjectStorageObjectRecords(objectKey);
  return 1;
}

async function readObjectStorageJson(objectKey) {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  const response = await client.send(new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: objectKey,
  }));
  const buffer = await streamToBuffer(response.Body);
  await recordObjectStorageRead(objectKey, buffer.length);
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
  await recordObjectStorageRead(objectKey, buffer.length);
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

  const username = cleanUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return sendJson(res, 400, { error: "Enter your username and password" });
  }

  const users = await readUsers();
  const user = users.find((entry) => entry.usernameLower === username.toLowerCase());
  if (!user || !verifyPassword(password, user.password)) {
    return sendJson(res, 401, { error: "Incorrect username or password" });
  }

  const lastLoginAt = Date.now();
  await updateUserLogin(user.id, lastLoginAt);
  user.lastLoginAt = lastLoginAt;
  setDashboardAuthCookie(res, user);
  return sendJson(res, 200, {
    ok: true,
    authenticated: true,
    user: { username: user.username, isAdmin: isAdminUser(user) },
  });
}

async function handleDashboardSignup(req, res) {
  let body;
  try {
    body = await readJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const username = cleanUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const validationError = getSignupValidationError(username, password);
  if (validationError) {
    return sendJson(res, 400, { error: validationError });
  }

  const users = await readUsers();
  if (users.some((entry) => entry.usernameLower === username.toLowerCase())) {
    return sendJson(res, 409, { error: "That username is already taken" });
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    usernameLower: username.toLowerCase(),
    password: hashPassword(password),
    planKey: DEFAULT_PLAN_KEY,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };
  try {
    await createUser(user);
  } catch (error) {
    if (error.code === 11000) {
      return sendJson(res, 409, { error: "That username is already taken" });
    }

    throw error;
  }

  setDashboardAuthCookie(res, user);
  return sendJson(res, 201, {
    ok: true,
    authenticated: true,
    user: { username: user.username, isAdmin: isAdminUser(user) },
  });
}

async function handleAccountPlanUpdate(req, res, auth) {
  let body;
  try {
    body = await readJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const planKey = cleanPlanKey(body?.planKey || body?.plan);
  const plan = getPlanByKey(planKey);
  if (!plan) {
    return sendJson(res, 400, { error: "Pick a valid plan." });
  }

  const updated = await updateUserPlan(auth.userId, plan.key);
  if (!updated) return sendJson(res, 404, { error: "Account not found." });

  return sendJson(res, 200, await getAccountUsageSummary(auth.userId));
}

async function handleProjectCreate(req, res, auth) {
  let body;
  try {
    body = await readJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const universeId = cleanInteger(body.universeId);
  if (universeId <= 0) return sendJson(res, 400, { error: "Pick a Roblox game to connect." });

  const user = await findUserById(auth.userId);
  const robloxUserId = cleanInteger(user?.robloxUserId);
  if (robloxUserId <= 0) {
    return sendJson(res, 400, { error: "Log in with Roblox before connecting a universe." });
  }

  if (await getProjectByUniverseId(universeId)) {
    return sendJson(res, 409, { error: "This universe is already connected to an account." });
  }

  const gameLimit = await getConnectedGameLimitStatus(auth.userId);
  if (!gameLimit.allowed) {
    return sendJson(res, 403, {
      error: `Your ${gameLimit.planName} plan includes ${gameLimit.limit} connected game${gameLimit.limit === 1 ? "" : "s"}. Change plans before adding another game.`,
      code: "USAGE_LIMIT",
      metric: "connectedGames",
      used: gameLimit.used,
      limit: gameLimit.limit,
      requested: 1,
    });
  }

  const ownership = await verifyRobloxUniverseOwnership(universeId, robloxUserId);
  if (!ownership.ok) {
    return sendJson(res, 403, { error: ownership.reason || "The logged-in Roblox account does not own this universe." });
  }

  const projectSecret = `roa_${crypto.randomBytes(24).toString("base64url")}`;
  const project = {
    id: crypto.randomUUID(),
    ownerUserId: auth.userId,
    universeId,
    name: ownership.universeName || `Universe ${universeId}`,
    secretHash: hashProjectSecret(projectSecret),
    createdAt: Date.now(),
    ownershipVerifiedAt: Date.now(),
    ownershipMethod: "roblox-login",
    robloxUserId,
    robloxUsername: cleanString(user.robloxUsername || user.username, 80),
    creatorType: ownership.creatorType,
    creatorId: ownership.creatorId,
    creatorName: ownership.creatorName,
  };

  try {
    await createProject(project);
  } catch (error) {
    if (error.code === 11000) {
      return sendJson(res, 409, { error: "This universe is already connected to an account." });
    }

    throw error;
  }

  return sendJson(res, 201, {
    ok: true,
    project: serializeProject(project),
    secret: projectSecret,
  });
}

async function handleProjectSecretRegenerate(req, res, auth, projectId) {
  const cleanProjectId = cleanString(projectId, 120);
  if (!cleanProjectId) return sendJson(res, 400, { error: "Missing project ID." });

  const projects = await readProjects();
  const project = projects.find((entry) => entry.id === cleanProjectId && entry.ownerUserId === auth.userId);
  if (!project) return sendJson(res, 404, { error: "Connected game not found." });

  const projectSecret = `roa_${crypto.randomBytes(24).toString("base64url")}`;
  const updatedAt = Date.now();
  await updateProjectSecretHash(project.id, auth.userId, hashProjectSecret(projectSecret), updatedAt);

  return sendJson(res, 200, {
    ok: true,
    projectId: project.id,
    universeId: cleanInteger(project.universeId),
    name: project.name || `Universe ${cleanInteger(project.universeId)}`,
    regeneratedAt: updatedAt,
    secret: projectSecret,
  });
}

async function handleProjectUnlink(req, res, auth, projectId) {
  const cleanProjectId = cleanString(projectId, 120);
  if (!cleanProjectId) return sendJson(res, 400, { error: "Missing project ID." });

  const project = await getProjectByIdForOwner(cleanProjectId, auth.userId);
  if (!project) return sendJson(res, 404, { error: "Connected game not found." });
  const deletedData = await deleteUniverseAnalyticsData(project.universeId);
  await deleteProject(cleanProjectId, auth.userId);

  return sendJson(res, 200, {
    ok: true,
    project: serializeProject(project),
    deletedData,
  });
}

async function handleRobloxLoginStart(req, res) {
  if (!isRobloxOAuthConfigured()) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Roblox OAuth is not configured",
      message: "Add ROBLOX_OAUTH_CLIENT_ID, ROBLOX_OAUTH_CLIENT_SECRET, and ROBLOX_OAUTH_REDIRECT_URI on Render, then redeploy.",
    });
  }

  const state = crypto.randomBytes(24).toString("base64url");
  const nonce = crypto.randomBytes(24).toString("base64url");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  setRobloxOAuthStateCookie(res, {
    purpose: "login",
    state,
    nonce,
    codeVerifier,
    createdAt: Date.now(),
  });

  return redirect(res, getRobloxAuthorizeUrl({
    state,
    nonce,
    codeChallenge,
  }));
}

async function handleRobloxOAuthStart(req, res, auth, searchParams) {
  if (!isRobloxOAuthConfigured()) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Roblox OAuth is not configured",
      message: "Add ROBLOX_OAUTH_CLIENT_ID, ROBLOX_OAUTH_CLIENT_SECRET, and ROBLOX_OAUTH_REDIRECT_URI on Render, then redeploy.",
    });
  }

  const universeId = cleanInteger(searchParams.get("universeId"));
  if (universeId <= 0) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Invalid universe ID",
      message: "Go back to the dashboard and enter a valid Roblox universe ID.",
    });
  }

  if (await getProjectByUniverseId(universeId)) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Universe already connected",
      message: "This universe is already connected to an account.",
    });
  }

  const state = crypto.randomBytes(24).toString("base64url");
  const nonce = crypto.randomBytes(24).toString("base64url");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  setRobloxOAuthStateCookie(res, {
    purpose: "project",
    state,
    nonce,
    codeVerifier,
    universeId,
    name: cleanString(searchParams.get("name"), 80),
    userId: auth.userId,
    createdAt: Date.now(),
  });

  return redirect(res, getRobloxAuthorizeUrl({
    state,
    nonce,
    codeChallenge,
  }));
}

async function handleOwnedRobloxGames(req, res, auth) {
  const user = await findUserById(auth.userId);
  const robloxUserId = cleanInteger(user?.robloxUserId);
  if (robloxUserId <= 0) {
    return sendJson(res, 400, { error: "Log in with Roblox before connecting a universe." });
  }

  const [games, projects] = await Promise.all([
    getOwnedRobloxGames(robloxUserId),
    readProjects(),
  ]);
  const connectedUniverseIds = new Set(projects.map((project) => String(cleanInteger(project.universeId))).filter((id) => id !== "0"));

  return sendJson(res, 200, {
    games: games.map((game) => ({
      ...game,
      connected: connectedUniverseIds.has(String(cleanInteger(game.id))),
    })),
  });
}

async function handleRobloxOAuthCallback(req, res, auth, searchParams) {
  clearRobloxOAuthStateCookie(res);

  const oauthState = getRobloxOAuthState(req);
  if (!oauthState) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Roblox verification expired",
      message: "Start the universe connection again from the dashboard.",
    });
  }

  if (Date.now() - cleanInteger(oauthState.createdAt) > ROBLOX_OAUTH_STATE_MAX_AGE_MS) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Roblox verification expired",
      message: "Start the universe connection again from the dashboard.",
    });
  }

  const error = cleanString(searchParams.get("error_description") || searchParams.get("error"), 240);
  if (error) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Roblox verification was cancelled",
      message: error,
    });
  }

  const state = cleanString(searchParams.get("state"), 128);
  const code = cleanString(searchParams.get("code"), 2048);
  if (!code || state !== oauthState.state) {
    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Roblox verification failed",
      message: "The OAuth state did not match. Start again from the dashboard.",
    });
  }

  try {
    const tokens = await exchangeRobloxOAuthCode(code, oauthState.codeVerifier);
    const robloxUser = await getRobloxOAuthUser(tokens.access_token);

    if (oauthState.purpose === "login") {
      const user = await findOrCreateRobloxUser(robloxUser);
      const lastLoginAt = Date.now();
      await updateUserLogin(user.id, lastLoginAt);
      user.lastLoginAt = lastLoginAt;
      setDashboardAuthCookie(res, user);
      return redirect(res, "/");
    }

    if (oauthState.purpose !== "project" || !auth || oauthState.userId !== auth.userId) {
      return sendRobloxOAuthResult(res, {
        ok: false,
        title: "Roblox verification expired",
        message: "Start the universe connection again from the dashboard.",
      });
    }

    const universeId = cleanInteger(oauthState.universeId);
    if (universeId <= 0) {
      return sendRobloxOAuthResult(res, {
        ok: false,
        title: "Invalid universe",
        message: "Start the universe connection again with a valid universe ID.",
      });
    }

    const gameLimit = await getConnectedGameLimitStatus(auth.userId);
    if (!gameLimit.allowed) {
      return sendRobloxOAuthResult(res, {
        ok: false,
        title: "Plan limit reached",
        message: `Your ${gameLimit.planName} plan includes ${gameLimit.limit} connected game${gameLimit.limit === 1 ? "" : "s"}. Change plans before adding another game.`,
      });
    }

    const ownership = await verifyRobloxUniverseOwnership(universeId, cleanInteger(robloxUser.sub));
    if (!ownership.ok) {
      return sendRobloxOAuthResult(res, {
        ok: false,
        title: "Universe ownership not verified",
        message: ownership.reason || "The Roblox account you connected does not own this universe.",
      });
    }

    const projectSecret = `roa_${crypto.randomBytes(24).toString("base64url")}`;
    const project = {
      id: crypto.randomUUID(),
      ownerUserId: auth.userId,
      universeId,
      name: cleanString(oauthState.name, 80) || ownership.universeName || `Universe ${universeId}`,
      secretHash: hashProjectSecret(projectSecret),
      createdAt: Date.now(),
      ownershipVerifiedAt: Date.now(),
      ownershipMethod: "roblox-oauth",
      robloxUserId: cleanInteger(robloxUser.sub),
      robloxUsername: cleanString(robloxUser.preferred_username || robloxUser.name || robloxUser.nickname, 80),
      creatorType: ownership.creatorType,
      creatorId: ownership.creatorId,
      creatorName: ownership.creatorName,
    };

    await createProject(project);
    return sendRobloxOAuthResult(res, {
      ok: true,
      title: "Universe connected",
      message: "Copy this Roblox secret now. It is shown once.",
      secret: projectSecret,
      universeId,
      universeName: project.name,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendRobloxOAuthResult(res, {
        ok: false,
        title: "Universe already connected",
        message: "This universe is already connected to an account.",
      });
    }

    return sendRobloxOAuthResult(res, {
      ok: false,
      title: "Roblox verification failed",
      message: error.message || String(error),
    });
  }
}

async function handlePresenceHeartbeat(req, res) {
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

  const project = await getProjectFromRequestSecret(req, presence.value.universeId);
  if (!project && !isValidPresenceSecret(req)) {
    return sendJson(res, 401, { error: "Invalid presence secret" });
  }

  if (project) {
    presence.value.ownerUserId = project.ownerUserId;
    presence.value.projectId = project.id;
  }

  const usageContext = getUsageContextFromProject(project, presence.value.universeId);
  const eventCount = getPresenceUsageEventCount(presence.value);
  const savedChatCount = saveChatLogs(presence.value);
  const savedMovementCount = saveMovementSamples(presence.value);
  const savedMovementRollupCount = saveMovementRollups(presence.value);
  const savedDeathCount = saveDeathSamples(presence.value);
  const savedLeaveCount = saveLeaveSamples(presence.value);
  await persistPresenceToMongo(presence.value);
  const objectStorageResult = await persistPresenceToObjectStorage(presence.value, usageContext);
  if (usageContext.userId && eventCount > 0) {
    await recordUsage({
      ...usageContext,
      provider: "internal",
      feature: "presence_ingest",
      quantity: eventCount,
      unit: "events",
      estimatedCostUsd: 0,
      metadata: {
        savedChatCount,
        savedMovementCount,
        savedMovementRollupCount,
        savedDeathCount,
        savedLeaveCount,
      },
    });
  }

  return sendJson(res, 200, {
    ok: true,
    receivedAt: presence.value.receivedAt,
    objectStorage: {
      configured: objectStorageStatus.configured,
      connected: objectStorageStatus.connected,
      objectKey: objectStorageStatus.lastObjectKey || null,
      lastError: objectStorageStatus.lastError || null,
      skipped: Boolean(objectStorageResult?.skipped),
      limit: objectStorageResult?.limit || null,
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

  const project = await getProjectFromRequestSecret(req, chunk.value.universeId);
  if (!project && !isValidDashboardToolSecret(req)) {
    return sendJson(res, 401, { error: "Invalid dashboard secret" });
  }

  const usageContext = getUsageContextFromProject(project, chunk.value.universeId);
  if (usageContext.userId) {
    try {
      await assertUsageAvailable(usageContext, "mapUploads", 1);
    } catch (error) {
      if (error.code === "USAGE_LIMIT") return sendUsageLimitError(res, error);
      throw error;
    }
  }

  let result;
  try {
    result = await saveMapSnapshotChunk(chunk.value, usageContext);
  } catch (error) {
    if (error.code === "USAGE_LIMIT") return sendUsageLimitError(res, error);
    throw error;
  }
  if (usageContext.userId && result.ok !== false) {
    await recordUsage({
      ...usageContext,
      provider: "backblaze",
      feature: "map_snapshot_upload",
      quantity: 1,
      unit: "upload",
      estimatedCostUsd: 0,
      metadata: {
        chunkIndex: chunk.value.chunkIndex,
        totalChunks: chunk.value.totalChunks,
        partCount: Array.isArray(chunk.value.parts) ? chunk.value.parts.length : 0,
      },
    });
  }
  return sendJson(res, result.ok === false ? 400 : 200, result);
}

async function handleScheduledAiInsightsRun(req, res) {
  if (!isValidDashboardToolSecret(req)) {
    return sendJson(res, 401, { error: "Invalid dashboard secret" });
  }

  try {
    const result = await runScheduledAiInsights();
    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function handleAiAutomationSettingsUpdate(req, res, searchParams) {
  let body;
  try {
    body = await readJsonBody(req, 8 * 1024);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const mode = cleanString(body.mode, 24).toLowerCase();
  if (mode !== "auto" && mode !== "manual") {
    return sendJson(res, 400, { error: "mode must be auto or manual" });
  }

  const universeId = cleanInteger(searchParams.get("universeId"));
  if (universeId <= 0) {
    return sendJson(res, 400, { error: "Enter a valid universe ID" });
  }

  const settings = await saveAiAutomationSettings({
    universeId,
    mode,
    intervalHours: 1,
    updatedAt: Date.now(),
    updatedBy: "dashboard",
  });

  return sendJson(res, 200, settings);
}

function isValidPresenceSecret(req) {
  const secret = req.headers["x-dashboard-secret"];
  return isMatchingSecret(secret, PRESENCE_SECRET);
}

function isValidDashboardToolSecret(req) {
  const secret = req.headers["x-dashboard-secret"];
  return isMatchingSecret(secret, PRESENCE_SECRET) || isMatchingSecret(secret, DASHBOARD_PASSWORD);
}

function isRobloxOAuthConfigured() {
  return Boolean(ROBLOX_OAUTH_CLIENT_ID && ROBLOX_OAUTH_CLIENT_SECRET && ROBLOX_OAUTH_REDIRECT_URI);
}

function getRobloxAuthorizeUrl({ state, nonce, codeChallenge }) {
  const authorizeUrl = new URL("https://apis.roblox.com/oauth/v1/authorize");
  authorizeUrl.searchParams.set("client_id", ROBLOX_OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", ROBLOX_OAUTH_REDIRECT_URI);
  authorizeUrl.searchParams.set("scope", ROBLOX_OAUTH_SCOPES);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("nonce", nonce);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  return authorizeUrl.toString();
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

async function saveMapSnapshotChunk(chunk, usageContext = {}) {
  const universeKey = String(chunk.universeId);
  const sessionKey = `${universeKey}:${chunk.uploadId}`;

  if (chunk.chunkCount === 1) {
    const snapshot = buildMapSnapshot(chunk, chunk.parts);
    await persistMapSnapshot(snapshot, usageContext);
    mapSnapshotsByUniverseId.set(universeKey, snapshot);
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
  await persistMapSnapshot(snapshot, usageContext);
  mapSnapshotsByUniverseId.set(universeKey, snapshot);
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

async function persistMapSnapshot(snapshot, usageContext = {}) {
  if (OBJECT_STORAGE_CONFIGURED) {
    try {
      await persistMapSnapshotToObjectStorage(snapshot, usageContext);
      return;
    } catch (error) {
      if (error.code === "USAGE_LIMIT") throw error;
      objectStorageStatus.lastError = error.message || String(error);
      await recordUsageFailure(usageContext, "map_snapshot_storage_failed", objectStorageStatus.lastError, {
        universeId: snapshot?.universeId,
        placeId: snapshot?.placeId,
      });
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

async function persistMapSnapshotToObjectStorage(snapshot, usageContext = {}) {
  const latestKey = getObjectStorageMapSnapshotKey(snapshot.universeId);
  const versionedKey = getObjectStorageMapSnapshotVersionKey(snapshot);
  const body = gzipSync(Buffer.from(JSON.stringify(snapshot), "utf8"));
  await assertObjectStorageWriteAvailable(usageContext, [
    { objectKey: latestKey, byteLength: body.length },
    { objectKey: versionedKey, byteLength: body.length },
  ]);

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
  await recordObjectStorageWrite({
    usageContext,
    objectKey: latestKey,
    byteLength: body.length,
    feature: "map_snapshot_latest",
    contentType: "application/json",
  });
  await client.send(new PutObjectCommand({
    ...putOptions,
    Key: versionedKey,
  }));
  await recordObjectStorageWrite({
    usageContext,
    objectKey: versionedKey,
    byteLength: body.length,
    feature: "map_snapshot_version",
    contentType: "application/json",
  });

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

async function getUniverseSummaries(ownerUserId = null) {
  const projects = ownerUserId ? await getUserProjects(ownerUserId) : (await readProjects()).map(serializeProject);
  const projectsByUniverseId = new Map(projects.map((project) => [String(project.universeId), project]));
  const universeIds = new Set(projects.map((project) => String(project.universeId)));
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
    const project = projectsByUniverseId.get(String(universeId));
    if (!project) continue;

    const summary = buildUniverseSummary(universeId, persistedMapUniverseIds.has(String(universeId)));
    const rollup = await getObjectStorageRollup(universeId);
    if (rollup && rollupTotalSamples(rollup) > summary.totalSamples) {
      universes.push({
        ...buildUniverseSummaryFromRollup(rollup, summary.hasMapSnapshot),
        projectId: project.id,
        name: project.name,
      });
    } else {
      universes.push({
        ...summary,
        projectId: project.id,
        name: project.name,
      });
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
  const storedReport = await readObjectStorageAiReport(filters.universeId);
  if (storedReport?.areaAnalysis) {
    return storedReport.areaAnalysis;
  }

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

async function analyzeAiAreaInsights(rawFilters = {}, usageContext = {}) {
  const filters = await normalizeMovementFilters(rawFilters);
  const basePayload = getAiAreaAnalysisWithoutStoredInsights(filters);

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!basePayload.areas.length) {
    throw new Error("No map areas are available to analyze.");
  }

  try {
    const aiPayload = await getAiAreaInsights(basePayload, usageContext);
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

async function getStoredChatInsights(filters = {}) {
  const chatPayload = getChatLogs(filters);
  const candidateLogs = chatPayload.logs
    .slice(0, MAX_CHAT_MESSAGES_FOR_INSIGHTS)
    .filter((log) => isQuestionLikeMessage(log.message));
  const stored = chatInsightsByScope.get(getChatInsightsScopeKey(chatPayload.universeId));
  const storedReport = await readObjectStorageAiReport(chatPayload.universeId);
  const durableStored = storedReport?.chatInsights || null;

  if (stored || durableStored) {
    const insight = stored || durableStored;
    return {
      ...insight,
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

async function analyzeChatInsights(filters = {}, usageContext = {}) {
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
    const aiInsights = await getAiChatInsights(chatPayload, candidateLogs, usageContext);
    chatInsightsByScope.set(getChatInsightsScopeKey(chatPayload.universeId), aiInsights);
    return aiInsights;
  } catch (error) {
    console.warn("Chat insights AI failed:", error.message);
    throw error;
  }
}

async function analyzeAllAiInsights(rawFilters = {}, usageContext = {}) {
  const filters = await normalizeMovementFilters(rawFilters);
  const [chatResult, areaResult] = await Promise.allSettled([
    analyzeChatInsights(filters, usageContext),
    analyzeAiAreaInsights(filters, usageContext),
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

  const report = {
    universeId: cleanInteger(filters.universeId) || null,
    generatedAt: Date.now(),
    mode: errors.length ? "partial" : "ai",
    source: cleanString(rawFilters.source, 32) || "manual",
    jobs: {
      chatQuestions: chatResult.status,
      mapAreas: areaResult.status,
    },
    errors,
    chatInsights: chatResult.status === "fulfilled" ? chatResult.value : null,
    areaAnalysis: areaResult.status === "fulfilled" ? areaResult.value : null,
  };

  await persistAiInsightsReport(report);
  return report;
}

async function runScheduledAiInsights() {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const summaries = await getUniverseSummaries();
  const results = [];

  for (const universe of summaries.universes || []) {
    const universeId = cleanInteger(universe.id);
    if (universeId <= 0 || cleanInteger(universe.totalSamples) <= 0) continue;

    try {
      const settings = await getAiAutomationSettings(universeId);
      if (settings.mode !== "auto") {
        results.push({
          universeId,
          ok: true,
          skipped: true,
          reason: "AI automation is set to manual.",
        });
        continue;
      }

      const usageContext = await getUsageContextForUniverse(null, universeId);
      await assertUsageAvailable(usageContext, "aiRequests", 2);
      await assertUsageAvailable(usageContext, "openAiTokens", 1);
      const report = await analyzeAllAiInsights({ universeId, source: "auto" }, usageContext);
      results.push({
        universeId,
        ok: true,
        mode: report.mode,
        generatedAt: report.generatedAt,
        reportKey: getObjectStorageAiReportKey(universeId),
      });
    } catch (error) {
      results.push({
        universeId,
        ok: false,
        error: error.message || String(error),
      });
    }
  }

  return {
    ok: true,
    skipped: false,
    universeCount: results.length,
    results,
  };
}

async function getAiInsightReportsFromQuery(searchParams) {
  const universeId = cleanInteger(searchParams.get("universeId"));
  if (universeId <= 0) {
    return { universeId: null, reports: [] };
  }

  return {
    universeId,
    reports: await readAiReportManifest(universeId),
  };
}

async function getAiInsightReportFromQuery(searchParams) {
  const universeId = cleanInteger(searchParams.get("universeId"));
  const generatedAt = cleanInteger(searchParams.get("generatedAt"));
  if (universeId <= 0) {
    return { universeId: null, report: null };
  }

  const report = generatedAt > 0
    ? await readObjectStorageAiReportVersion(universeId, generatedAt)
    : await readObjectStorageAiReport(universeId);

  return {
    universeId,
    generatedAt: generatedAt || cleanInteger(report?.generatedAt) || null,
    report,
  };
}

async function persistAiInsightsReport(report) {
  const universeId = cleanInteger(report?.universeId);
  if (!OBJECT_STORAGE_CONFIGURED || universeId <= 0) return;
  const usageContext = await getUsageContextForUniverse(null, universeId);

  const latestKey = getObjectStorageAiReportKey(universeId);
  const versionedKey = getObjectStorageAiReportVersionKey(report);
  const body = JSON.stringify(report);
  const byteLength = Buffer.byteLength(body, "utf8");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  const putOptions = {
    Bucket: B2_BUCKET_NAME,
    Body: body,
    ContentType: "application/json",
    Metadata: {
      universeid: String(universeId),
      generatedat: String(report.generatedAt || Date.now()),
      mode: cleanString(report.mode, 32),
    },
  };

  await client.send(new PutObjectCommand({
    ...putOptions,
    Key: latestKey,
  }));
  await recordObjectStorageWrite({
    usageContext,
    objectKey: latestKey,
    byteLength,
    feature: "ai_report_latest",
    contentType: "application/json",
  });
  await client.send(new PutObjectCommand({
    ...putOptions,
    Key: versionedKey,
  }));
  await recordObjectStorageWrite({
    usageContext,
    objectKey: versionedKey,
    byteLength,
    feature: "ai_report_version",
    contentType: "application/json",
  });

  await appendAiReportManifest(universeId, {
    generatedAt: cleanInteger(report.generatedAt) || Date.now(),
    mode: cleanString(report.mode, 32),
    source: report.source || "manual",
    reportKey: versionedKey,
    chatQuestionCount: Array.isArray(report.chatInsights?.questions) ? report.chatInsights.questions.length : 0,
    areaCount: Array.isArray(report.areaAnalysis?.areas) ? report.areaAnalysis.areas.length : 0,
    errorCount: Array.isArray(report.errors) ? report.errors.length : 0,
  });
}

async function readObjectStorageAiReport(universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (!OBJECT_STORAGE_CONFIGURED || cleanUniverseId <= 0) return null;

  try {
    const report = await readObjectStorageJson(getObjectStorageAiReportKey(cleanUniverseId));
    if (cleanInteger(report?.universeId) !== cleanUniverseId) return null;
    if (report.chatInsights) {
      chatInsightsByScope.set(getChatInsightsScopeKey(cleanUniverseId), report.chatInsights);
    }
    if (report.areaAnalysis) {
      areaInsightsByScope.set(getAreaInsightsScopeKey(cleanUniverseId), report.areaAnalysis);
    }
    return report;
  } catch (error) {
    if (error?.name !== "NoSuchKey" && error?.$metadata?.httpStatusCode !== 404) {
      objectStorageStatus.lastError = error.message || String(error);
    }
    return null;
  }
}

async function readObjectStorageAiReportVersion(universeId, generatedAt) {
  const cleanUniverseId = cleanInteger(universeId);
  const cleanGeneratedAt = cleanInteger(generatedAt);
  if (!OBJECT_STORAGE_CONFIGURED || cleanUniverseId <= 0 || cleanGeneratedAt <= 0) return null;

  try {
    const report = await readObjectStorageJson(getObjectStorageAiReportVersionKey({
      universeId: cleanUniverseId,
      generatedAt: cleanGeneratedAt,
    }));
    if (cleanInteger(report?.universeId) !== cleanUniverseId) return null;
    return report;
  } catch (error) {
    if (error?.name !== "NoSuchKey" && error?.$metadata?.httpStatusCode !== 404) {
      objectStorageStatus.lastError = error.message || String(error);
    }
    return null;
  }
}

async function appendAiReportManifest(universeId, reportSummary) {
  const usageContext = await getUsageContextForUniverse(null, universeId);
  const reports = await readAiReportManifest(universeId);
  const byGeneratedAt = new Map(reports.map((entry) => [cleanInteger(entry.generatedAt), entry]));
  byGeneratedAt.set(cleanInteger(reportSummary.generatedAt), reportSummary);
  const nextReports = [...byGeneratedAt.values()]
    .filter((entry) => cleanInteger(entry.generatedAt) > 0)
    .sort((a, b) => cleanInteger(b.generatedAt) - cleanInteger(a.generatedAt))
    .slice(0, 250);

  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getB2S3Client();
  const body = JSON.stringify({
    universeId,
    updatedAt: Date.now(),
    reports: nextReports,
  });
  const objectKey = getObjectStorageAiReportManifestKey(universeId);
  await client.send(new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: objectKey,
    Body: body,
    ContentType: "application/json",
  }));
  await recordObjectStorageWrite({
    usageContext,
    objectKey,
    byteLength: Buffer.byteLength(body, "utf8"),
    feature: "ai_report_manifest",
    contentType: "application/json",
  });
}

async function readAiReportManifest(universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (!OBJECT_STORAGE_CONFIGURED || cleanUniverseId <= 0) return [];

  try {
    const manifest = await readObjectStorageJson(getObjectStorageAiReportManifestKey(cleanUniverseId));
    if (cleanInteger(manifest?.universeId) !== cleanUniverseId || !Array.isArray(manifest?.reports)) {
      return [];
    }

    return manifest.reports
      .map(normalizeAiReportSummary)
      .filter((entry) => entry.generatedAt > 0)
      .sort((a, b) => b.generatedAt - a.generatedAt);
  } catch (error) {
    if (error?.name !== "NoSuchKey" && error?.$metadata?.httpStatusCode !== 404) {
      objectStorageStatus.lastError = error.message || String(error);
    }
    return [];
  }
}

function normalizeAiReportSummary(value) {
  return {
    generatedAt: cleanInteger(value?.generatedAt),
    mode: cleanString(value?.mode, 32),
    source: cleanString(value?.source, 32) || "manual",
    reportKey: cleanString(value?.reportKey, 256),
    chatQuestionCount: cleanInteger(value?.chatQuestionCount),
    areaCount: cleanInteger(value?.areaCount),
    errorCount: cleanInteger(value?.errorCount),
  };
}

async function getAiAutomationSettings(universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (cleanUniverseId <= 0) return { ...DEFAULT_AI_AUTOMATION_SETTINGS };
  const cacheKey = String(cleanUniverseId);
  if (aiAutomationSettingsCache.has(cacheKey)) return aiAutomationSettingsCache.get(cacheKey);

  if (OBJECT_STORAGE_CONFIGURED) {
    try {
      const stored = await readObjectStorageJson(getObjectStorageAiAutomationSettingsKey(cleanUniverseId));
      const settings = normalizeAiAutomationSettings({ ...stored, universeId: cleanUniverseId });
      aiAutomationSettingsCache.set(cacheKey, settings);
      return settings;
    } catch (error) {
      if (error?.name !== "NoSuchKey" && error?.$metadata?.httpStatusCode !== 404) {
        objectStorageStatus.lastError = error.message || String(error);
      }
    }
  }

  const settings = { ...DEFAULT_AI_AUTOMATION_SETTINGS, universeId: cleanUniverseId };
  aiAutomationSettingsCache.set(cacheKey, settings);
  return settings;
}

async function saveAiAutomationSettings(settings) {
  const cleanUniverseId = cleanInteger(settings?.universeId);
  if (cleanUniverseId <= 0) throw new Error("Enter a valid universe ID");

  const normalized = normalizeAiAutomationSettings({ ...settings, universeId: cleanUniverseId });
  const cacheKey = String(cleanUniverseId);
  aiAutomationSettingsCache.set(cacheKey, normalized);

  if (OBJECT_STORAGE_CONFIGURED) {
    const usageContext = await getUsageContextForUniverse(null, cleanUniverseId);
    const body = JSON.stringify(normalized);
    const objectKey = getObjectStorageAiAutomationSettingsKey(cleanUniverseId);
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getB2S3Client();
    await client.send(new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: objectKey,
      Body: body,
      ContentType: "application/json",
    }));
    await recordObjectStorageWrite({
      usageContext,
      objectKey,
      byteLength: Buffer.byteLength(body, "utf8"),
      feature: "ai_automation_settings",
      contentType: "application/json",
    });
  }

  return normalized;
}

function normalizeAiAutomationSettings(value) {
  const mode = cleanString(value?.mode, 24).toLowerCase() === "manual" ? "manual" : "auto";
  return {
    universeId: cleanInteger(value?.universeId) || null,
    mode,
    intervalHours: 1,
    updatedAt: cleanInteger(value?.updatedAt) || null,
    updatedBy: cleanString(value?.updatedBy, 64) || "system",
  };
}

function getObjectStorageAiReportKey(universeId) {
  return `reports/${cleanInteger(universeId)}/latest.json`;
}

function getObjectStorageAiReportVersionKey(report) {
  return `reports/${cleanInteger(report.universeId)}/${cleanInteger(report.generatedAt) || Date.now()}.json`;
}

function getObjectStorageAiReportManifestKey(universeId) {
  return `reports/${cleanInteger(universeId)}/manifest.json`;
}

function getObjectStorageAiAutomationSettingsKey(universeId) {
  return `settings/ai-automation/${cleanInteger(universeId)}.json`;
}

async function getAiChatInsights(chatPayload, candidateLogs, usageContext = {}) {
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
  await recordOpenAiUsage({
    usageContext,
    feature: "chat_insights",
    model: OPENAI_CHAT_INSIGHTS_MODEL,
    payload,
  });

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

async function getAiAreaInsights(areaPayload, usageContext = {}) {
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
  await recordOpenAiUsage({
    usageContext,
    feature: "area_insights",
    model: OPENAI_AREA_INSIGHTS_MODEL,
    payload,
  });

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
  return Boolean(getDashboardAuth(req));
}

function getDashboardAuth(req) {
  const value = getCookieValue(req, DASHBOARD_AUTH_COOKIE);
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = signDashboardValue(payload);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const auth = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const issuedAt = Number(auth?.issuedAt || 0);
    const username = cleanUsername(auth?.username);
    const userId = typeof auth?.userId === "string" ? auth.userId : "";
    if (!issuedAt || Date.now() - issuedAt > DASHBOARD_AUTH_MAX_AGE_MS || !username || !userId) {
      return null;
    }

    return { username, userId, issuedAt };
  } catch {
    return null;
  }
}

function setDashboardAuthCookie(res, user) {
  const payload = Buffer.from(JSON.stringify({
    issuedAt: Date.now(),
    userId: user.id,
    username: user.username,
  })).toString("base64url");
  const cookieValue = `${payload}.${signDashboardValue(payload)}`;
  appendSetCookie(res, `${DASHBOARD_AUTH_COOKIE}=${encodeURIComponent(cookieValue)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.ceil(DASHBOARD_AUTH_MAX_AGE_MS / 1000)}`);
}

function clearDashboardAuthCookie(res) {
  appendSetCookie(res, `${DASHBOARD_AUTH_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function setRobloxOAuthStateCookie(res, state) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const cookieValue = `${payload}.${signDashboardValue(payload)}`;
  appendSetCookie(res, `${ROBLOX_OAUTH_STATE_COOKIE}=${encodeURIComponent(cookieValue)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.ceil(ROBLOX_OAUTH_STATE_MAX_AGE_MS / 1000)}`);
}

function getRobloxOAuthState(req) {
  const value = getCookieValue(req, ROBLOX_OAUTH_STATE_COOKIE);
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = signDashboardValue(payload);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function clearRobloxOAuthStateCookie(res) {
  appendSetCookie(res, `${ROBLOX_OAUTH_STATE_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function signDashboardValue(value) {
  return crypto.createHmac("sha256", DASHBOARD_PASSWORD).update(value).digest("base64url");
}

function cleanUsername(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function parseAdminUsernames(value) {
  return new Set(String(value || "")
    .split(",")
    .map((entry) => cleanUsername(entry).toLowerCase())
    .filter(Boolean));
}

function isAdminAuth(auth) {
  const username = cleanUsername(auth?.username).toLowerCase();
  return Boolean(username && ADMIN_USERNAMES.has(username));
}

function isAdminUser(user) {
  if (!user) return false;
  const dashboardUsername = cleanUsername(user.username).toLowerCase();
  const robloxUsername = cleanUsername(user.robloxUsername).toLowerCase();
  const robloxDisplayName = cleanUsername(user.robloxDisplayName).toLowerCase();
  const robloxUserId = cleanInteger(user.robloxUserId);
  return Boolean(
    (dashboardUsername && ADMIN_USERNAMES.has(dashboardUsername))
    || (robloxUsername && ADMIN_USERNAMES.has(robloxUsername))
    || (robloxDisplayName && ADMIN_USERNAMES.has(robloxDisplayName))
    || (robloxUserId > 0 && ADMIN_USERNAMES.has(String(robloxUserId)))
  );
}

function getSignupValidationError(username, password) {
  if (!username || !password) return "Enter a username and password";
  if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) {
    return "Username must be 3-24 letters, numbers, or underscores";
  }
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  return "";
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(password, salt, 64).toString("base64url");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, storedValue) {
  const [scheme, salt, hash] = String(storedValue || "").split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const candidate = crypto.scryptSync(password, salt, 64).toString("base64url");
  if (Buffer.byteLength(candidate) !== Buffer.byteLength(hash)) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

async function getUsageContextForUniverse(ownerUserId, universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  const project = cleanUniverseId > 0 ? await getProjectByUniverseId(cleanUniverseId) : null;
  return getUsageContextFromProject(project, cleanUniverseId, ownerUserId);
}

function getUsageContextFromProject(project, universeId, fallbackUserId = null) {
  return {
    userId: project?.ownerUserId || fallbackUserId || null,
    projectId: project?.id || null,
    universeId: cleanInteger(project?.universeId) || cleanInteger(universeId) || null,
  };
}

function getPresenceUsageEventCount(presence) {
  return Math.max(1,
    (Array.isArray(presence?.players) ? presence.players.length : 0)
    + (Array.isArray(presence?.chatLogs) ? presence.chatLogs.length : 0)
    + (Array.isArray(presence?.movementSamples) ? presence.movementSamples.length : 0)
    + (Array.isArray(presence?.movementRollups) ? presence.movementRollups.length : 0)
    + (Array.isArray(presence?.deathSamples) ? presence.deathSamples.length : 0)
    + (Array.isArray(presence?.leaveSamples) ? presence.leaveSamples.length : 0)
  );
}

async function assertUsageAvailable(context, metric, quantity = 1) {
  if (!context?.userId) return;

  const amount = Math.max(cleanInteger(quantity), 1);
  const usage = await getMonthlyUsage(context.userId);
  const limits = usage.limits || USAGE_LIMITS;
  const checks = {
    aiRequests: {
      used: usage.aiRequests,
      limit: limits.aiRequestsPerMonth,
      label: "AI requests",
    },
    openAiTokens: {
      used: usage.openAiTokens,
      limit: limits.openAiTokensPerMonth,
      label: "OpenAI tokens",
    },
    mapUploads: {
      used: usage.mapUploads,
      limit: limits.mapUploadsPerMonth,
      label: "map uploads",
    },
    backblazeStoredBytes: {
      used: usage.backblazeStoredBytes,
      limit: limits.backblazeStoredBytes,
      label: "raw analytics storage",
    },
    backblazeUploadedBytes: {
      used: usage.backblazeUploadedBytes,
      limit: limits.backblazeUploadedBytesPerMonth,
      label: "raw data uploads",
    },
    backblazeDownloadedBytes: {
      used: usage.backblazeDownloadedBytes,
      limit: limits.backblazeDownloadedBytesPerMonth,
      label: "raw data reads",
    },
  };
  const check = checks[metric];
  if (!check || check.limit <= 0) return;

  if (check.used + amount <= check.limit) return;

  const error = new Error(`${check.label} monthly usage limit reached.`);
  error.code = "USAGE_LIMIT";
  error.metric = metric;
  error.used = check.used;
  error.limit = check.limit;
  error.requested = amount;
  error.label = check.label;
  throw error;
}

function sendUsageLimitError(res, error) {
  const limit = createUsageLimitDetails(error.metric, error.used, error.limit, error.requested, error.label);
  return sendJson(res, 403, {
    error: limit.message,
    code: "USAGE_LIMIT",
    ...limit,
  });
}

function createUsageLimitDetails(metric, used, limit, requested = 1, label = "") {
  const cleanMetric = cleanString(metric, 64);
  const metricLabels = {
    aiRequests: "AI runs",
    openAiTokens: "OpenAI tokens",
    mapUploads: "map uploads",
    backblazeStoredBytes: "raw analytics storage",
    backblazeUploadedBytes: "raw data uploads",
    backblazeDownloadedBytes: "raw data reads",
  };
  const cleanLabel = label || metricLabels[cleanMetric] || "usage";
  const cleanUsed = cleanFiniteInteger(used);
  const cleanLimit = cleanFiniteInteger(limit);
  const cleanRequested = Math.max(cleanFiniteInteger(requested), 1);
  const remaining = cleanLimit > 0 ? Math.max(0, cleanLimit - cleanUsed) : null;
  return {
    metric: cleanMetric,
    label: cleanLabel,
    message: `${cleanLabel} monthly usage limit reached.`,
    used: cleanUsed,
    limit: cleanLimit,
    requested: cleanRequested,
    remaining,
    currentUsage: cleanUsed,
    planLimit: cleanLimit,
    whatStillWorks: getUsageLimitFallbacks(cleanMetric),
  };
}

function getUsageLimitFallbacks(metric) {
  if (metric === "aiRequests" || metric === "openAiTokens") {
    return "Existing dashboard data, saved reports, heatmaps, and non-AI analytics still work.";
  }
  if (metric === "mapUploads") {
    return "Existing map snapshots, live analytics, heatmaps, and AI reports still work.";
  }
  if (metric === "backblazeStoredBytes" || metric === "backblazeUploadedBytes") {
    return "Summarized dashboard rollups and in-memory live testing still work, but durable raw B2 history pauses until usage resets or the plan changes.";
  }
  if (metric === "backblazeDownloadedBytes") {
    return "Live dashboard data and writes still work, but raw-history reads for reports and rollups are paused.";
  }
  return "Other dashboard features continue to work if they do not use this limited resource.";
}

async function recordOpenAiUsage({ usageContext, feature, model, payload }) {
  if (!usageContext?.userId) return;

  const usage = payload?.usage || {};
  const inputTokens = cleanInteger(usage.input_tokens || usage.prompt_tokens);
  const cachedInputTokens = getOpenAiCachedInputTokens(usage, inputTokens);
  const outputTokens = cleanInteger(usage.output_tokens || usage.completion_tokens);
  const totalTokens = cleanInteger(usage.total_tokens) || inputTokens + outputTokens;
  const quantity = totalTokens > 0 ? totalTokens : 1;
  const unit = totalTokens > 0 ? "tokens" : "request";

  await recordUsage({
    ...usageContext,
    provider: "openai",
    feature,
    quantity,
    unit,
    estimatedCostUsd: estimateOpenAiCost(model, inputTokens, cachedInputTokens, outputTokens),
    metadata: {
      model,
      modelApproved: getOpenAiPricingForModel(model).approved,
      requestId: cleanString(payload?.id, 120),
      inputTokens,
      cachedInputTokens,
      outputTokens,
      totalTokens,
    },
  });
}

function getOpenAiCachedInputTokens(usage, inputTokens) {
  const details = usage?.input_tokens_details || usage?.prompt_tokens_details || {};
  const cachedTokens = cleanInteger(details.cached_tokens || details.cached_input_tokens);
  return Math.min(Math.max(cachedTokens, 0), Math.max(cleanInteger(inputTokens), 0));
}

function estimateOpenAiCost(model, inputTokens, cachedInputTokens, outputTokens) {
  const pricing = getOpenAiPricingForModel(model);
  const cleanInputTokens = Math.max(cleanInteger(inputTokens), 0);
  const cleanCachedInputTokens = Math.min(Math.max(cleanInteger(cachedInputTokens), 0), cleanInputTokens);
  const billableInputTokens = Math.max(cleanInputTokens - cleanCachedInputTokens, 0);
  const inputCost = (billableInputTokens / 1_000_000) * pricing.inputUsdPer1M;
  const cachedInputCost = (cleanCachedInputTokens / 1_000_000) * pricing.cachedInputUsdPer1M;
  const outputCost = (Math.max(cleanInteger(outputTokens), 0) / 1_000_000) * pricing.outputUsdPer1M;
  return roundMoney(inputCost + cachedInputCost + outputCost);
}

function getOpenAiPricingForModel(model) {
  const cleanModel = cleanOpenAiModelName(model);
  const configured = OPENAI_MODEL_PRICING[cleanModel];
  if (configured) {
    return {
      model: cleanModel,
      canonicalModel: configured.canonicalModel || cleanModel,
      approved: Boolean(configured.approved),
      source: "approved_model_config",
      inputUsdPer1M: Number(configured.inputUsdPer1M || 0),
      cachedInputUsdPer1M: Number(configured.cachedInputUsdPer1M || 0),
      outputUsdPer1M: Number(configured.outputUsdPer1M || 0),
      notes: configured.notes || "",
    };
  }

  return {
    model: cleanModel || "unknown",
    canonicalModel: cleanModel || "unknown",
    approved: false,
    source: "env_fallback",
    inputUsdPer1M: OPENAI_INPUT_USD_PER_1M,
    cachedInputUsdPer1M: OPENAI_CACHED_INPUT_USD_PER_1M,
    outputUsdPer1M: OPENAI_OUTPUT_USD_PER_1M,
    notes: "Model is not in OPENAI_MODEL_PRICING; env pricing fallback was used.",
  };
}

function cleanOpenAiModelName(model) {
  return String(model || "").trim().toLowerCase();
}

async function resetStoredUsageEventsForUser(targetUser, adminUser) {
  const userId = cleanString(targetUser?.id, 120);
  if (!userId) {
    return {
      resetAt: Date.now(),
      deletedEvents: 0,
      resetBy: getAdminResetLabel(adminUser),
      targetUserId: "",
      targetUsername: "",
    };
  }

  const resetAt = Date.now();
  const db = await getMongoDb();

  if (db) {
    const [eventResult, monthlyResult] = await Promise.all([
      db.collection("usage_events").deleteMany({ userId }),
      db.collection("monthly_user_usage").deleteMany({ userId }),
    ]);
    return {
      resetAt,
      deletedEvents: cleanFiniteInteger(eventResult.deletedCount),
      deletedMonthlyUsageRecords: cleanFiniteInteger(monthlyResult.deletedCount),
      resetBy: getAdminResetLabel(adminUser),
      targetUserId: userId,
      targetUsername: getAdminResetLabel(targetUser),
    };
  }

  const events = await readUsageEvents();
  const remainingEvents = events.filter((event) => event?.userId !== userId);
  await writeUsageEvents(remainingEvents);
  const monthlyRecords = await readMonthlyUserUsageRecords();
  const remainingMonthlyRecords = monthlyRecords.filter((record) => record?.userId !== userId);
  await writeMonthlyUserUsageRecords(remainingMonthlyRecords);

  return {
    resetAt,
    deletedEvents: events.length - remainingEvents.length,
    deletedMonthlyUsageRecords: monthlyRecords.length - remainingMonthlyRecords.length,
    resetBy: getAdminResetLabel(adminUser),
    targetUserId: userId,
    targetUsername: getAdminResetLabel(targetUser),
  };
}

function getAdminResetLabel(user) {
  return cleanString(user?.robloxUsername || user?.username || user?.robloxDisplayName || user?.id || "admin", 120);
}

async function recordObjectStorageWrite({ usageContext = {}, objectKey, byteLength, feature, contentType }) {
  const cleanObjectKey = cleanString(objectKey, 512);
  const cleanByteLength = cleanFiniteInteger(byteLength);
  if (!cleanObjectKey || cleanByteLength <= 0) return null;

  try {
    let context = usageContext?.userId ? usageContext : null;
    if (!context) {
      const universeId = getUniverseIdFromObjectStorageKey(cleanObjectKey);
      context = universeId > 0 ? await getUsageContextForUniverse(null, universeId) : {};
    }
    if (!context?.userId) return null;

    const previous = await getObjectStorageObject(cleanObjectKey);
    const now = Date.now();
    const record = {
      objectKey: cleanObjectKey,
      userId: context.userId,
      projectId: context.projectId || null,
      universeId: cleanInteger(context.universeId) || getUniverseIdFromObjectStorageKey(cleanObjectKey) || null,
      provider: "backblaze",
      feature: cleanString(feature, 64) || "object",
      contentType: cleanString(contentType, 120),
      byteLength: cleanByteLength,
      updatedAt: now,
      createdAt: cleanInteger(previous?.createdAt) || now,
    };

    await upsertObjectStorageObject(record);
    await recordUsage({
      ...context,
      provider: "backblaze",
      feature: "object_storage_upload",
      quantity: cleanByteLength,
      unit: "bytes",
      estimatedCostUsd: 0,
      metadata: {
        objectKey: cleanObjectKey,
        storageFeature: record.feature,
        byteLength: cleanByteLength,
        previousByteLength: cleanFiniteInteger(previous?.byteLength),
        contentType: record.contentType,
      },
    });
    return record;
  } catch (error) {
    console.warn("B2 usage tracking write failed:", error.message || String(error));
    return null;
  }
}

async function assertObjectStorageWriteAvailable(usageContext = {}, objects = []) {
  if (!usageContext?.userId) return;

  const requestedObjects = (Array.isArray(objects) ? objects : [objects])
    .map((object) => ({
      objectKey: cleanString(object?.objectKey, 512),
      byteLength: cleanFiniteInteger(object?.byteLength),
    }))
    .filter((object) => object.objectKey && object.byteLength > 0);
  if (!requestedObjects.length) return;

  let uploadedBytes = 0;
  let storedDeltaBytes = 0;
  for (const object of requestedObjects) {
    uploadedBytes += object.byteLength;
    const previous = await getObjectStorageObject(object.objectKey);
    storedDeltaBytes += Math.max(object.byteLength - cleanFiniteInteger(previous?.byteLength), 0);
  }

  if (uploadedBytes > 0) {
    await assertUsageAvailable(usageContext, "backblazeUploadedBytes", uploadedBytes);
  }
  if (storedDeltaBytes > 0) {
    await assertUsageAvailable(usageContext, "backblazeStoredBytes", storedDeltaBytes);
  }
}

async function recordObjectStorageRead(objectKey, byteLength) {
  const cleanObjectKey = cleanString(objectKey, 512);
  const cleanByteLength = cleanFiniteInteger(byteLength);
  if (!cleanObjectKey || cleanByteLength <= 0) return;

  try {
    const object = await getObjectStorageObject(cleanObjectKey);
    if (!object?.userId) return;

    await recordUsage({
      userId: object.userId,
      projectId: object.projectId || null,
      universeId: cleanInteger(object.universeId) || null,
      provider: "backblaze",
      feature: "object_storage_download",
      quantity: cleanByteLength,
      unit: "bytes",
      estimatedCostUsd: 0,
      metadata: {
        objectKey: cleanObjectKey,
        storageFeature: cleanString(object.feature, 64),
        byteLength: cleanByteLength,
      },
    });
  } catch (error) {
    console.warn("B2 usage tracking read failed:", error.message || String(error));
  }
}

async function canWriteRawAnalyticsToObjectStorage(usageContext = {}, incomingBytes = 0) {
  const limits = await getUserPlanLimits(usageContext?.userId);
  const requestedBytes = cleanFiniteInteger(incomingBytes);
  const storageLimitBytes = cleanFiniteInteger(limits.backblazeStoredBytes);
  const uploadLimitBytes = cleanFiniteInteger(limits.backblazeUploadedBytesPerMonth);

  if (!usageContext?.userId) {
    return {
      allowed: true,
      storageAllowed: true,
      uploadAllowed: true,
      storedBytes: 0,
      limitBytes: storageLimitBytes,
      uploadUsedBytes: 0,
      uploadLimitBytes,
      requestedBytes,
      reason: "",
    };
  }

  const [storageUsage, monthlyUsage] = await Promise.all([
    getObjectStorageUsageForUser(usageContext.userId),
    getMonthlyUsage(usageContext.userId),
  ]);
  const storedBytes = cleanFiniteInteger(storageUsage.storedBytes);
  const uploadUsedBytes = cleanFiniteInteger(monthlyUsage.backblazeUploadedBytes);
  const storageAllowed = storageLimitBytes <= 0 || storedBytes + requestedBytes <= storageLimitBytes;
  const uploadAllowed = uploadLimitBytes <= 0 || uploadUsedBytes + requestedBytes <= uploadLimitBytes;
  return {
    allowed: storageAllowed && uploadAllowed,
    storageAllowed,
    uploadAllowed,
    storedBytes,
    requestedBytes,
    limitBytes: storageLimitBytes,
    uploadUsedBytes,
    uploadLimitBytes,
    reason: storageAllowed && uploadAllowed ? "" : storageAllowed ? "upload" : "storage",
  };
}

async function recordRawAnalyticsStorageCapSkip(usageContext = {}, byteLength = 0, storageCheck = {}) {
  if (!usageContext?.userId) return;

  await recordUsage({
    ...usageContext,
    provider: "backblaze",
    feature: "raw_analytics_storage_cap_skip",
    quantity: Math.max(cleanFiniteInteger(byteLength), 1),
    unit: "bytes",
    estimatedCostUsd: 0,
    metadata: {
      requestedBytes: cleanFiniteInteger(byteLength),
      storedBytes: cleanFiniteInteger(storageCheck.storedBytes),
      limitBytes: cleanFiniteInteger(storageCheck.limitBytes),
      uploadUsedBytes: cleanFiniteInteger(storageCheck.uploadUsedBytes),
      uploadLimitBytes: cleanFiniteInteger(storageCheck.uploadLimitBytes),
      storageAllowed: storageCheck.storageAllowed !== false,
      uploadAllowed: storageCheck.uploadAllowed !== false,
      reason: cleanString(storageCheck.reason, 32),
    },
  });
}

async function recordUsageFailure(usageContext = {}, feature = "ingest_failed", reason = "", metadata = {}) {
  if (!usageContext?.userId) return;

  await recordUsage({
    ...usageContext,
    provider: "internal",
    feature,
    quantity: 1,
    unit: "failure",
    estimatedCostUsd: 0,
    metadata: {
      ...metadata,
      reason: cleanString(reason, 500),
    },
  });
}

async function cleanupRawObjectStorageForUniverse(universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (!OBJECT_STORAGE_CONFIGURED || cleanUniverseId <= 0 || B2_RAW_ANALYTICS_RETENTION_DAYS <= 0) return;

  const now = Date.now();
  const lastCleanupAt = cleanInteger(rawObjectStorageCleanupByUniverse.get(String(cleanUniverseId)));
  if (lastCleanupAt > 0 && now - lastCleanupAt < B2_RAW_ANALYTICS_CLEANUP_INTERVAL_MS) return;

  rawObjectStorageCleanupByUniverse.set(String(cleanUniverseId), now);
  const cutoffMs = now - (B2_RAW_ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  try {
    await deleteObjectStoragePrefixOlderThan(`raw/${cleanUniverseId}/`, cutoffMs);
  } catch (error) {
    objectStorageStatus.lastError = error.message || String(error);
    console.warn("B2 raw analytics retention cleanup failed:", objectStorageStatus.lastError);
  }
}

async function getObjectStorageObject(objectKey) {
  const cleanObjectKey = cleanString(objectKey, 512);
  if (!cleanObjectKey) return null;

  const db = await getMongoDb();
  if (db) {
    return db.collection("object_storage_objects").findOne({ objectKey: cleanObjectKey }, { projection: { _id: 0 } });
  }

  const objects = await readObjectStorageObjects();
  return objects.find((object) => object.objectKey === cleanObjectKey) || null;
}

async function upsertObjectStorageObject(record) {
  const db = await getMongoDb();
  if (db) {
    await db.collection("object_storage_objects").replaceOne(
      { objectKey: record.objectKey },
      record,
      { upsert: true },
    );
    return;
  }

  const objects = await readObjectStorageObjects();
  const nextObjects = objects.filter((object) => object.objectKey !== record.objectKey);
  nextObjects.push(record);
  await writeObjectStorageObjects(nextObjects);
}

async function deleteObjectStorageObjectRecords(objectKeys) {
  const keys = [...new Set((Array.isArray(objectKeys) ? objectKeys : [objectKeys])
    .map((key) => cleanString(key, 512))
    .filter(Boolean))];
  if (!keys.length) return;

  const db = await getMongoDb();
  if (db) {
    await db.collection("object_storage_objects").deleteMany({ objectKey: { $in: keys } });
    return;
  }

  const objects = await readObjectStorageObjects();
  await writeObjectStorageObjects(objects.filter((object) => !keys.includes(object.objectKey)));
}

async function readObjectStorageObjects() {
  try {
    const content = await fs.readFile(objectStorageObjectStorePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.objects) ? parsed.objects : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeObjectStorageObjects(objects) {
  await fs.mkdir(path.dirname(objectStorageObjectStorePath), { recursive: true });
  await fs.writeFile(objectStorageObjectStorePath, JSON.stringify({ objects }, null, 2));
}

function getUniverseIdFromObjectStorageKey(objectKey) {
  const key = String(objectKey || "");
  const match = key.match(/^(?:raw|maps|reports|rollups)\/(\d+)\//)
    || key.match(/^settings\/ai-automation\/(\d+)[.]json$/);
  return cleanInteger(match?.[1]);
}

async function recordUsage(entry) {
  const userId = typeof entry?.userId === "string" ? entry.userId : "";
  if (!userId) return null;

  const createdAt = cleanInteger(entry.createdAt) || Date.now();
  const event = {
    id: crypto.randomUUID(),
    userId,
    projectId: cleanString(entry.projectId || "", 120) || null,
    universeId: cleanInteger(entry.universeId) || null,
    provider: cleanString(entry.provider, 32) || "internal",
    feature: cleanString(entry.feature, 64) || "unknown",
    quantity: Math.max(cleanFiniteInteger(entry.quantity), 1),
    unit: cleanString(entry.unit, 24) || "unit",
    estimatedCostUsd: roundMoney(Number(entry.estimatedCostUsd || 0)),
    metadata: sanitizeUsageMetadata(entry.metadata),
    month: getUsageMonthKey(createdAt),
    createdAt,
  };

  const db = await getMongoDb();
  if (db) {
    await db.collection("usage_events").insertOne(event);
    await refreshMonthlyUserUsageSnapshot(userId, event.month);
    return event;
  }

  const events = await readUsageEvents();
  events.push(event);
  await writeUsageEvents(events);
  await refreshMonthlyUserUsageSnapshot(userId, event.month);
  return event;
}

async function getMonthlyUsage(userId, month = getUsageMonthKey(Date.now())) {
  const cleanUserId = typeof userId === "string" ? userId : "";
  if (!cleanUserId) return createEmptyUsageSummary(month);

  let summary;
  const user = await findUserById(cleanUserId);
  const db = await getMongoDb();
  if (db) {
    const events = await db.collection("usage_events")
      .find({ userId: cleanUserId, month })
      .project({ _id: 0 })
      .toArray();
    summary = aggregateUsageEvents(events, month);
  } else {
    const events = await readUsageEvents();
    summary = aggregateUsageEvents(events.filter((event) => event.userId === cleanUserId && event.month === month), month);
  }

  return applyPlanToUsageSummary(
    mergeObjectStorageUsage(summary, await getObjectStorageUsageForUser(cleanUserId)),
    user,
  );
}

async function getUsageSummaryByUserIds(userIds, month = getUsageMonthKey(Date.now())) {
  const ids = [...new Set(userIds.filter((id) => typeof id === "string" && id))];
  const summaries = new Map(ids.map((id) => [id, createEmptyUsageSummary(month)]));
  if (!ids.length) return summaries;

  const users = await readUsers();
  const usersById = new Map(users.filter((user) => ids.includes(user.id)).map((user) => [user.id, user]));
  const db = await getMongoDb();
  const events = db
    ? await db.collection("usage_events").find({ userId: { $in: ids }, month }).project({ _id: 0 }).toArray()
    : (await readUsageEvents()).filter((event) => ids.includes(event.userId) && event.month === month);

  const eventsByUser = new Map();
  for (const event of events) {
    const userEvents = eventsByUser.get(event.userId) || [];
    userEvents.push(event);
    eventsByUser.set(event.userId, userEvents);
  }

  for (const id of ids) {
    summaries.set(id, aggregateUsageEvents(eventsByUser.get(id) || [], month));
  }

  const storageByUser = await getObjectStorageUsageByUserIds(ids);
  for (const id of ids) {
    summaries.set(id, mergeObjectStorageUsage(
      summaries.get(id) || createEmptyUsageSummary(month),
      storageByUser.get(id) || createEmptyObjectStorageUsage(),
    ));
    summaries.set(id, applyPlanToUsageSummary(summaries.get(id), usersById.get(id)));
  }

  return summaries;
}

async function refreshMonthlyUserUsageSnapshot(userId, month = getUsageMonthKey(Date.now())) {
  const cleanUserId = typeof userId === "string" ? userId : "";
  const cleanMonth = cleanUsageMonth(month) || getUsageMonthKey(Date.now());
  if (!cleanUserId) return null;

  const usage = (await getUsageSummaryByUserIds([cleanUserId], cleanMonth)).get(cleanUserId)
    || createEmptyUsageSummary(cleanMonth);
  const record = {
    userId: cleanUserId,
    month: cleanMonth,
    usage,
    updatedAt: Date.now(),
  };

  const db = await getMongoDb();
  if (db) {
    await db.collection("monthly_user_usage").replaceOne(
      { userId: cleanUserId, month: cleanMonth },
      record,
      { upsert: true },
    );
    return record;
  }

  const records = await readMonthlyUserUsageRecords();
  const nextRecords = records.filter((entry) => !(entry.userId === cleanUserId && entry.month === cleanMonth));
  nextRecords.push(record);
  await writeMonthlyUserUsageRecords(nextRecords);
  return record;
}

async function ensureMonthlyUsageSnapshotsForUserIds(userIds, months = [getUsageMonthKey(Date.now())]) {
  const ids = [...new Set(userIds.filter((id) => typeof id === "string" && id))];
  const cleanMonths = [...new Set((Array.isArray(months) ? months : [months])
    .map((month) => cleanUsageMonth(month))
    .filter(Boolean))];
  if (!ids.length || !cleanMonths.length) return;

  for (const month of cleanMonths) {
    for (const userId of ids) {
      await refreshMonthlyUserUsageSnapshot(userId, month);
    }
  }
}

async function getMonthlyUsageSnapshotSummaryByUserIds(userIds, month = getUsageMonthKey(Date.now())) {
  const ids = [...new Set(userIds.filter((id) => typeof id === "string" && id))];
  const cleanMonth = cleanUsageMonth(month) || getUsageMonthKey(Date.now());
  const summaries = new Map(ids.map((id) => [id, createEmptyUsageSummary(cleanMonth)]));
  if (!ids.length) return summaries;

  const db = await getMongoDb();
  const records = db
    ? await db.collection("monthly_user_usage").find({ userId: { $in: ids }, month: cleanMonth }).project({ _id: 0 }).toArray()
    : (await readMonthlyUserUsageRecords()).filter((record) => ids.includes(record.userId) && record.month === cleanMonth);

  const users = await readUsers();
  const usersById = new Map(users.filter((user) => ids.includes(user.id)).map((user) => [user.id, user]));
  for (const record of records) {
    const userId = cleanString(record?.userId, 120);
    if (!ids.includes(userId)) continue;
    summaries.set(userId, applyPlanToUsageSummary(record.usage || createEmptyUsageSummary(cleanMonth), usersById.get(userId)));
  }

  return summaries;
}

async function getLifetimeUsageSummaryByUserIds(userIds) {
  const ids = [...new Set(userIds.filter((id) => typeof id === "string" && id))];
  const summaries = new Map(ids.map((id) => [id, createEmptyUsageSummary("lifetime")]));
  if (!ids.length) return summaries;

  const users = await readUsers();
  const usersById = new Map(users.filter((user) => ids.includes(user.id)).map((user) => [user.id, user]));
  const db = await getMongoDb();
  const events = db
    ? await db.collection("usage_events").find({ userId: { $in: ids } }).project({ _id: 0 }).toArray()
    : (await readUsageEvents()).filter((event) => ids.includes(event.userId));

  const eventsByUser = new Map();
  for (const event of events) {
    const userEvents = eventsByUser.get(event.userId) || [];
    userEvents.push(event);
    eventsByUser.set(event.userId, userEvents);
  }

  const storageByUser = await getObjectStorageUsageByUserIds(ids);
  for (const id of ids) {
    summaries.set(id, applyPlanToUsageSummary(
      mergeObjectStorageUsage(
        aggregateUsageEvents(eventsByUser.get(id) || [], "lifetime"),
        storageByUser.get(id) || createEmptyObjectStorageUsage(),
      ),
      usersById.get(id),
    ));
  }

  return summaries;
}

async function getAccountUsageSummary(userId) {
  const [usage, projects, user] = await Promise.all([
    getMonthlyUsage(userId),
    getUserProjects(userId),
    findUserById(userId),
  ]);
  const now = Date.now();
  const period = getUsagePeriod(now);
  const plan = getUserPlan(user);

  return {
    plan: plan.name,
    planKey: plan.key,
    planDetails: serializePlan(plan, plan.key),
    plans: getPlanOptionsForUser(user),
    period,
    usage,
    connectedGameCount: projects.length,
    connectedGames: projects.map((project) => ({
      id: project.universeId,
      name: project.name,
      createdAt: project.createdAt,
    })),
    metrics: getUsageMetrics(usage, projects.length),
    upgrade: {
      available: true,
      label: "Choose your plan",
      message: "Plans are free while pricing is being finalized. Changing plans updates your limits immediately.",
    },
  };
}

function getUsageMetrics(usage, connectedGameCount = 0) {
  const limits = usage?.limits || USAGE_LIMITS;
  const cachedInputTokens = cleanFiniteInteger(usage?.cachedOpenAiInputTokens);
  const openAiTokens = createUsageMetric(
    "openAiTokens",
    "AI token budget",
    cleanFiniteInteger(usage?.openAiTokens),
    cleanFiniteInteger(limits.openAiTokensPerMonth),
    "tokens",
  );
  openAiTokens.note = cachedInputTokens > 0
    ? `${formatUsageNumber(cachedInputTokens)} cached input tokens priced at cached rate`
    : "Backend safety budget for AI analysis size.";
  return [
    {
      ...createUsageMetric("connectedGames", "Connected games", connectedGameCount, cleanFiniteInteger(limits.connectedGames), "games"),
      note: "Each connected Roblox experience counts as one game.",
    },
    createUsageMetric("aiRequests", "AI runs", cleanFiniteInteger(usage?.aiRequests), cleanFiniteInteger(limits.aiRequestsPerMonth), "runs"),
    openAiTokens,
    {
      ...createUsageMetric(
        "backblazeStoredBytes",
        "Raw analytics history",
        cleanFiniteInteger(usage?.backblazeStoredBytes),
        cleanFiniteInteger(limits.backblazeStoredBytes),
        "bytes",
      ),
      note: `${formatUsageNumber(cleanFiniteInteger(usage?.backblazeObjectCount))} stored objects. Raw event history pauses at this cap; summarized dashboard rollups still work.`,
    },
    createUsageMetric(
      "backblazeUploadedBytes",
      "Raw data uploaded",
      cleanFiniteInteger(usage?.backblazeUploadedBytes),
      cleanFiniteInteger(limits.backblazeUploadedBytesPerMonth),
      "bytes",
    ),
    {
      ...createUsageMetric(
        "backblazeDownloadedBytes",
        "Raw data read",
        cleanFiniteInteger(usage?.backblazeDownloadedBytes),
        cleanFiniteInteger(limits.backblazeDownloadedBytesPerMonth),
        "bytes",
      ),
      note: "Internal reads for reports and rollups.",
    },
    createUsageMetric("mapUploads", "Map uploads", cleanFiniteInteger(usage?.mapUploads), cleanFiniteInteger(limits.mapUploadsPerMonth), "uploads"),
  ];
}

function createUsageMetric(key, label, used, limit, unit) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 1000) / 10) : 0;
  return {
    key,
    label,
    used,
    limit,
    unit,
    percent,
    remaining: limit > 0 ? Math.max(0, limit - used) : null,
    status: percent >= 100 ? "blocked" : percent >= 80 ? "warning" : "ok",
  };
}

function formatUsageNumber(value) {
  return new Intl.NumberFormat("en-US").format(cleanFiniteInteger(value));
}

function aggregateUsageEvents(events, month) {
  const summary = createEmptyUsageSummary(month);

  for (const event of events) {
    const quantity = Math.max(cleanFiniteInteger(event.quantity), 0);
    if (event.provider === "openai") {
      summary.aiRequests += 1;
      if (event.unit === "tokens") summary.openAiTokens += quantity;
      summary.cachedOpenAiInputTokens += cleanFiniteInteger(event.metadata?.cachedInputTokens);
      summary.aiEstimatedCostUsd = roundMoney(summary.aiEstimatedCostUsd + Number(event.estimatedCostUsd || 0));
      const model = cleanString(event.metadata?.model, 120);
      if (model) {
        summary.openAiModelUsage[model] = (summary.openAiModelUsage[model] || 0) + 1;
        summary.currentOpenAiModel = model;
      }
    }
    if (event.provider === "backblaze") {
      if (event.feature === "object_storage_upload" && event.unit === "bytes") summary.backblazeUploadedBytes += quantity;
      if (event.feature === "object_storage_download" && event.unit === "bytes") summary.backblazeDownloadedBytes += quantity;
      if (event.feature === "raw_analytics_storage_cap_skip" && event.unit === "bytes") summary.backblazeSkippedRawAnalyticsBytes += quantity;
    }
    if (event.feature === "presence_ingest" && event.unit === "events") summary.events += quantity;
    if (event.feature === "map_snapshot_upload") summary.mapUploads += quantity;
    if (event.unit === "failure" || String(event.feature || "").endsWith("_failed")) summary.failedIngests += quantity;
    summary.estimatedCostUsd = roundMoney(summary.estimatedCostUsd + Number(event.estimatedCostUsd || 0));
  }

  summary.limits = { ...USAGE_LIMITS };
  return summary;
}

function createEmptyUsageSummary(month) {
  return {
    month,
    aiRequests: 0,
    openAiTokens: 0,
    cachedOpenAiInputTokens: 0,
    aiEstimatedCostUsd: 0,
    backblazeStoredBytes: 0,
    backblazeObjectCount: 0,
    backblazeUploadedBytes: 0,
    backblazeDownloadedBytes: 0,
    backblazeSkippedRawAnalyticsBytes: 0,
    backblazeEstimatedMonthlyStorageCostUsd: 0,
    backblazeEstimatedEgressOverageCostUsd: 0,
    events: 0,
    failedIngests: 0,
    mapUploads: 0,
    currentOpenAiModel: "",
    openAiModelUsage: {},
    estimatedCostUsd: 0,
    limits: { ...USAGE_LIMITS },
  };
}

function aggregateUsageSummaries(summaries) {
  return summaries.reduce((total, summary) => ({
    month: summary.month || total.month,
    aiRequests: total.aiRequests + cleanFiniteInteger(summary.aiRequests),
    openAiTokens: total.openAiTokens + cleanFiniteInteger(summary.openAiTokens),
    cachedOpenAiInputTokens: total.cachedOpenAiInputTokens + cleanFiniteInteger(summary.cachedOpenAiInputTokens),
    aiEstimatedCostUsd: roundMoney(total.aiEstimatedCostUsd + Number(summary.aiEstimatedCostUsd || 0)),
    backblazeStoredBytes: total.backblazeStoredBytes + cleanFiniteInteger(summary.backblazeStoredBytes),
    backblazeObjectCount: total.backblazeObjectCount + cleanFiniteInteger(summary.backblazeObjectCount),
    backblazeUploadedBytes: total.backblazeUploadedBytes + cleanFiniteInteger(summary.backblazeUploadedBytes),
    backblazeDownloadedBytes: total.backblazeDownloadedBytes + cleanFiniteInteger(summary.backblazeDownloadedBytes),
    backblazeSkippedRawAnalyticsBytes: total.backblazeSkippedRawAnalyticsBytes + cleanFiniteInteger(summary.backblazeSkippedRawAnalyticsBytes),
    backblazeEstimatedMonthlyStorageCostUsd: roundMoney(total.backblazeEstimatedMonthlyStorageCostUsd + Number(summary.backblazeEstimatedMonthlyStorageCostUsd || 0)),
    backblazeEstimatedEgressOverageCostUsd: roundMoney(total.backblazeEstimatedEgressOverageCostUsd + Number(summary.backblazeEstimatedEgressOverageCostUsd || 0)),
    events: total.events + cleanFiniteInteger(summary.events),
    failedIngests: total.failedIngests + cleanFiniteInteger(summary.failedIngests),
    mapUploads: total.mapUploads + cleanFiniteInteger(summary.mapUploads),
    currentOpenAiModel: cleanString(summary.currentOpenAiModel, 120) || total.currentOpenAiModel,
    openAiModelUsage: mergeOpenAiModelUsage(total.openAiModelUsage, summary.openAiModelUsage),
    estimatedCostUsd: roundMoney(total.estimatedCostUsd + Number(summary.estimatedCostUsd || 0)),
    limits: { ...USAGE_LIMITS },
  }), createEmptyUsageSummary(getUsageMonthKey(Date.now())));
}

function mergeOpenAiModelUsage(...modelUsageObjects) {
  const merged = {};
  for (const modelUsage of modelUsageObjects) {
    for (const [model, count] of Object.entries(modelUsage || {})) {
      const cleanModel = cleanString(model, 120);
      if (!cleanModel) continue;
      merged[cleanModel] = (merged[cleanModel] || 0) + cleanFiniteInteger(count);
    }
  }
  return merged;
}

function mergeObjectStorageUsage(summary, storageUsage) {
  const next = {
    ...summary,
    backblazeStoredBytes: cleanFiniteInteger(storageUsage?.storedBytes),
    backblazeObjectCount: cleanFiniteInteger(storageUsage?.objectCount),
    backblazeEstimatedMonthlyStorageCostUsd: estimateBackblazeMonthlyStorageCost(storageUsage?.storedBytes),
    backblazeEstimatedEgressOverageCostUsd: estimateBackblazeEgressOverageCost(
      summary.backblazeDownloadedBytes,
      storageUsage?.storedBytes,
    ),
  };
  next.estimatedCostUsd = roundMoney(
    Number(summary.estimatedCostUsd || 0)
    + next.backblazeEstimatedMonthlyStorageCostUsd
    + next.backblazeEstimatedEgressOverageCostUsd,
  );
  return next;
}

function createEmptyObjectStorageUsage() {
  return {
    storedBytes: 0,
    objectCount: 0,
  };
}

async function getObjectStorageUsageForUser(userId) {
  const cleanUserId = cleanString(userId, 120);
  if (!cleanUserId) return createEmptyObjectStorageUsage();

  const db = await getMongoDb();
  if (db) {
    const rows = await db.collection("object_storage_objects").aggregate([
      { $match: { userId: cleanUserId } },
      { $group: { _id: "$userId", storedBytes: { $sum: "$byteLength" }, objectCount: { $sum: 1 } } },
    ]).toArray();
    return {
      storedBytes: cleanFiniteInteger(rows[0]?.storedBytes),
      objectCount: cleanFiniteInteger(rows[0]?.objectCount),
    };
  }

  const objects = await readObjectStorageObjects();
  return objects
    .filter((object) => object.userId === cleanUserId)
    .reduce((total, object) => ({
      storedBytes: total.storedBytes + cleanFiniteInteger(object.byteLength),
      objectCount: total.objectCount + 1,
    }), createEmptyObjectStorageUsage());
}

async function getObjectStorageUsageByUserIds(userIds) {
  const ids = [...new Set((Array.isArray(userIds) ? userIds : [])
    .map((id) => cleanString(id, 120))
    .filter(Boolean))];
  const summaries = new Map(ids.map((id) => [id, createEmptyObjectStorageUsage()]));
  if (!ids.length) return summaries;

  const db = await getMongoDb();
  if (db) {
    const rows = await db.collection("object_storage_objects").aggregate([
      { $match: { userId: { $in: ids } } },
      { $group: { _id: "$userId", storedBytes: { $sum: "$byteLength" }, objectCount: { $sum: 1 } } },
    ]).toArray();
    for (const row of rows) {
      summaries.set(row._id, {
        storedBytes: cleanFiniteInteger(row.storedBytes),
        objectCount: cleanFiniteInteger(row.objectCount),
      });
    }
    return summaries;
  }

  const objects = await readObjectStorageObjects();
  for (const object of objects) {
    if (!summaries.has(object.userId)) continue;
    const current = summaries.get(object.userId);
    current.storedBytes += cleanFiniteInteger(object.byteLength);
    current.objectCount += 1;
  }
  return summaries;
}

function estimateBackblazeMonthlyStorageCost(storedBytes) {
  const terabytes = cleanFiniteInteger(storedBytes) / 1_000_000_000_000;
  return roundMoney(terabytes * B2_STORAGE_USD_PER_TB_MONTH);
}

function estimateBackblazeEgressOverageCost(downloadedBytes, storedBytes) {
  const freeBytes = cleanFiniteInteger(storedBytes) * B2_FREE_EGRESS_MULTIPLIER;
  const overageBytes = Math.max(cleanFiniteInteger(downloadedBytes) - freeBytes, 0);
  const gigabytes = overageBytes / 1_000_000_000;
  return roundMoney(gigabytes * B2_EGRESS_OVERAGE_USD_PER_GB);
}

async function readUsageEvents() {
  try {
    const content = await fs.readFile(usageStorePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeUsageEvents(events) {
  await fs.mkdir(path.dirname(usageStorePath), { recursive: true });
  await fs.writeFile(usageStorePath, JSON.stringify({ events }, null, 2));
}

async function readMonthlyUserUsageRecords() {
  try {
    const content = await fs.readFile(monthlyUserUsageStorePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeMonthlyUserUsageRecords(records) {
  await fs.mkdir(path.dirname(monthlyUserUsageStorePath), { recursive: true });
  await fs.writeFile(monthlyUserUsageStorePath, JSON.stringify({ records }, null, 2));
}

function sanitizeUsageMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    const cleanKey = cleanString(key, 40);
    if (!cleanKey) continue;
    if (typeof item === "string") output[cleanKey] = cleanString(item, 240);
    else if (typeof item === "number" && Number.isFinite(item)) output[cleanKey] = item;
    else if (typeof item === "boolean") output[cleanKey] = item;
  }
  return output;
}

function getUsageMonthKey(timestamp) {
  const date = new Date(cleanInteger(timestamp) || Date.now());
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getUsagePeriod(timestamp) {
  const date = new Date(cleanInteger(timestamp) || Date.now());
  const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
  const resetAt = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  return {
    month: getUsageMonthKey(timestamp),
    startsAt: start,
    endsAt: resetAt - 1,
    resetsAt: resetAt,
  };
}

function cleanFiniteInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function cleanEnvInteger(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

function cleanEnvNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 1_000_000) / 1_000_000;
}

async function readUsers() {
  const db = await getMongoDb();
  if (db) {
    return db.collection("users")
      .find({})
      .project({ _id: 0 })
      .toArray();
  }

  try {
    const content = await fs.readFile(userStorePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(userStorePath), { recursive: true });
  const payload = JSON.stringify({ users }, null, 2);
  await fs.writeFile(userStorePath, payload);
}

async function createUser(user) {
  const db = await getMongoDb();
  if (db) {
    await db.collection("users").insertOne(user);
    return;
  }

  const users = await readUsers();
  if (users.some((entry) => entry.usernameLower === user.usernameLower)) {
    const error = new Error("Duplicate username");
    error.code = 11000;
    throw error;
  }

  const robloxUserId = cleanInteger(user.robloxUserId);
  if (robloxUserId > 0 && users.some((entry) => cleanInteger(entry.robloxUserId) === robloxUserId)) {
    const error = new Error("Duplicate Roblox user");
    error.code = 11000;
    throw error;
  }

  users.push(user);
  await writeUsers(users);
}

async function findOrCreateRobloxUser(robloxUser) {
  const robloxUserId = cleanInteger(robloxUser?.sub);
  if (robloxUserId <= 0) throw new Error("Roblox user lookup did not return a valid user ID.");

  const existing = await findUserByRobloxId(robloxUserId);
  if (existing) return existing;

  const username = await getAvailableRobloxDashboardUsername(robloxUser, robloxUserId);
  const user = {
    id: crypto.randomUUID(),
    username,
    usernameLower: username.toLowerCase(),
    password: "",
    authProvider: "roblox",
    planKey: DEFAULT_PLAN_KEY,
    robloxUserId,
    robloxUsername: cleanString(robloxUser.preferred_username || robloxUser.name || robloxUser.nickname, 80),
    robloxDisplayName: cleanString(robloxUser.name || robloxUser.nickname || robloxUser.preferred_username, 80),
    robloxProfile: cleanString(robloxUser.profile, 240),
    robloxPicture: cleanString(robloxUser.picture, 500),
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  try {
    await createUser(user);
    return user;
  } catch (error) {
    if (error.code === 11000) {
      const raceWinner = await findUserByRobloxId(robloxUserId);
      if (raceWinner) return raceWinner;
    }

    throw error;
  }
}

async function findUserByRobloxId(robloxUserId) {
  const cleanRobloxUserId = cleanInteger(robloxUserId);
  if (cleanRobloxUserId <= 0) return null;

  const db = await getMongoDb();
  if (db) {
    return db.collection("users").findOne({ robloxUserId: cleanRobloxUserId }, { projection: { _id: 0 } });
  }

  const users = await readUsers();
  return users.find((user) => cleanInteger(user.robloxUserId) === cleanRobloxUserId) || null;
}

async function findUserById(userId) {
  const cleanUserId = typeof userId === "string" ? userId : "";
  if (!cleanUserId) return null;

  const db = await getMongoDb();
  if (db) {
    return db.collection("users").findOne({ id: cleanUserId }, { projection: { _id: 0 } });
  }

  const users = await readUsers();
  return users.find((user) => user.id === cleanUserId) || null;
}

async function getAvailableRobloxDashboardUsername(robloxUser, robloxUserId) {
  const baseName = cleanUsername(robloxUser.preferred_username || robloxUser.name || robloxUser.nickname || `Roblox${robloxUserId}`)
    .replace(/[^A-Za-z0-9_]/g, "")
    .slice(0, 24) || `Roblox${robloxUserId}`;
  const users = await readUsers();
  const taken = new Set(users.map((user) => cleanUsername(user.username).toLowerCase()).filter(Boolean));

  if (!taken.has(baseName.toLowerCase())) return baseName;

  const suffix = String(robloxUserId).slice(-6);
  const maxBaseLength = Math.max(1, 24 - suffix.length - 1);
  const withSuffix = `${baseName.slice(0, maxBaseLength)}_${suffix}`;
  if (!taken.has(withSuffix.toLowerCase())) return withSuffix;

  return `Roblox${String(robloxUserId).slice(0, 18)}`;
}

async function updateUserLogin(userId, lastLoginAt) {
  const db = await getMongoDb();
  if (db) {
    await db.collection("users").updateOne(
      { id: userId },
      { $set: { lastLoginAt } }
    );
    return;
  }

  const users = await readUsers();
  const user = users.find((entry) => entry.id === userId);
  if (!user) return;

  user.lastLoginAt = lastLoginAt;
  await writeUsers(users);
}

async function updateUserPlan(userId, planKey) {
  const cleanUserId = typeof userId === "string" ? userId : "";
  const cleanKey = cleanPlanKey(planKey);
  if (!cleanUserId || !getPlanByKey(cleanKey)) return false;

  const updatedAt = Date.now();
  const db = await getMongoDb();
  if (db) {
    const result = await db.collection("users").updateOne(
      { id: cleanUserId },
      { $set: { planKey: cleanKey, planUpdatedAt: updatedAt } }
    );
    return result.matchedCount > 0;
  }

  const users = await readUsers();
  const user = users.find((entry) => entry.id === cleanUserId);
  if (!user) return false;

  user.planKey = cleanKey;
  user.planUpdatedAt = updatedAt;
  await writeUsers(users);
  return true;
}

async function getAdminUserSummaries() {
  const [users, projects] = await Promise.all([
    readUsers(),
    readProjects(),
  ]);
  await ensureMonthlyUsageSnapshotsForUserIds(users.map((user) => user.id));
  const usageByUser = await getUsageSummaryByUserIds(users.map((user) => user.id));
  const lifetimeUsageByUser = await getLifetimeUsageSummaryByUserIds(users.map((user) => user.id));
  const projectsByOwner = new Map();

  for (const project of projects) {
    const ownerUserId = project.ownerUserId || "";
    if (!ownerUserId) continue;

    const ownerProjects = projectsByOwner.get(ownerUserId) || [];
    ownerProjects.push(serializeProject(project));
    projectsByOwner.set(ownerUserId, ownerProjects);
  }

  const sanitizedUsers = users
    .map((user) => {
      const userProjects = projectsByOwner.get(user.id) || [];
      const usage = usageByUser.get(user.id) || createEmptyUsageSummary(getUsageMonthKey(Date.now()));
      const lifetimeUsage = lifetimeUsageByUser.get(user.id) || createEmptyUsageSummary("lifetime");
      const plan = getUserPlan(user);
      return {
        id: user.id,
        username: user.username,
        planKey: plan.key,
        planName: plan.name,
        authProvider: user.authProvider || (cleanInteger(user.robloxUserId) > 0 ? "roblox" : "legacy"),
        robloxUserId: cleanInteger(user.robloxUserId) || null,
        robloxUsername: user.robloxUsername || "",
        robloxDisplayName: user.robloxDisplayName || "",
        isAdmin: isAdminUser(user),
        createdAt: cleanInteger(user.createdAt),
        lastLoginAt: cleanInteger(user.lastLoginAt) || null,
        projectCount: userProjects.length,
        usage,
        lifetimeUsage,
        universes: userProjects.map((project) => ({
          id: project.universeId,
          name: project.name,
          createdAt: project.createdAt,
        })),
      };
    })
    .sort((a, b) => (
      Number(b.lifetimeUsage?.estimatedCostUsd || 0) - Number(a.lifetimeUsage?.estimatedCostUsd || 0)
      || Number(b.usage?.estimatedCostUsd || 0) - Number(a.usage?.estimatedCostUsd || 0)
      || cleanFiniteInteger(b.usage?.backblazeStoredBytes) - cleanFiniteInteger(a.usage?.backblazeStoredBytes)
      || (b.lastLoginAt || b.createdAt || 0) - (a.lastLoginAt || a.createdAt || 0)
    ));

  return {
    users: sanitizedUsers,
    totalUsers: sanitizedUsers.length,
    totalRobloxUsers: sanitizedUsers.filter((user) => cleanInteger(user.robloxUserId) > 0 || user.authProvider === "roblox").length,
    totalProjects: projects.length,
    usageTotals: aggregateUsageSummaries([...usageByUser.values()]),
    lifetimeUsageTotals: aggregateUsageSummaries([...lifetimeUsageByUser.values()]),
    passwordVisibility: "Roblox OAuth users are linked by Roblox user ID. Legacy passwords are hashed and cannot be viewed.",
  };
}

async function getAdminReconciliations() {
  const records = await readReconciliations();
  const currentMonth = getUsageMonthKey(Date.now());
  const currentEstimate = await getUsageEstimateForMonth(currentMonth);
  return {
    currentMonth,
    currentEstimate,
    records: records
      .map(serializeReconciliation)
      .sort((a, b) => String(b.month).localeCompare(String(a.month))),
  };
}

async function saveAdminReconciliation(input, adminUser) {
  const month = cleanUsageMonth(input?.month || getUsageMonthKey(Date.now()));
  if (!month) throw new Error("Enter a month like 2026-07.");

  const estimate = await getUsageEstimateForMonth(month);
  const actualOpenAiCostUsd = roundMoney(input?.actualOpenAiCostUsd);
  const actualBackblazeCostUsd = roundMoney(input?.actualBackblazeCostUsd);
  const actualRenderCostUsd = roundMoney(input?.actualRenderCostUsd);
  const actualOtherCostUsd = roundMoney(input?.actualOtherCostUsd);
  const actualTotalCostUsd = roundMoney(actualOpenAiCostUsd + actualBackblazeCostUsd + actualRenderCostUsd + actualOtherCostUsd);
  const estimatedTotalCostUsd = roundMoney(estimate.estimatedTotalCostUsd);
  const varianceUsd = roundMoney(actualTotalCostUsd - estimatedTotalCostUsd);
  const now = Date.now();

  const existing = await getReconciliationByMonth(month);
  const record = {
    id: existing?.id || crypto.randomUUID(),
    month,
    actualOpenAiCostUsd,
    actualBackblazeCostUsd,
    actualRenderCostUsd,
    actualOtherCostUsd,
    actualTotalCostUsd,
    estimatedOpenAiCostUsd: estimate.estimatedOpenAiCostUsd,
    estimatedBackblazeCostUsd: estimate.estimatedBackblazeCostUsd,
    estimatedTotalCostUsd,
    varianceUsd,
    variancePercent: estimatedTotalCostUsd > 0 ? Math.round((varianceUsd / estimatedTotalCostUsd) * 10_000) / 100 : null,
    activeUserCount: estimate.activeUserCount,
    notes: cleanString(input?.notes, 1000),
    updatedBy: getAdminResetLabel(adminUser),
    createdAt: cleanInteger(existing?.createdAt) || now,
    updatedAt: now,
  };

  await upsertReconciliation(record);
  return {
    ...await getAdminReconciliations(),
    record: serializeReconciliation(record),
  };
}

async function getUsageEstimateForMonth(month) {
  const cleanMonth = cleanUsageMonth(month) || getUsageMonthKey(Date.now());
  const users = await readUsers();
  await ensureMonthlyUsageSnapshotsForUserIds(users.map((user) => user.id), [cleanMonth]);
  const usageByUser = await getMonthlyUsageSnapshotSummaryByUserIds(users.map((user) => user.id), cleanMonth);
  const summaries = [...usageByUser.values()];
  const totals = aggregateUsageSummaries(summaries);
  return {
    month: cleanMonth,
    estimatedOpenAiCostUsd: roundMoney(totals.aiEstimatedCostUsd),
    estimatedBackblazeCostUsd: roundMoney(Number(totals.backblazeEstimatedMonthlyStorageCostUsd || 0) + Number(totals.backblazeEstimatedEgressOverageCostUsd || 0)),
    estimatedTotalCostUsd: roundMoney(totals.estimatedCostUsd),
    activeUserCount: summaries.filter((usage) => (
      Number(usage.estimatedCostUsd || 0) > 0
      || cleanFiniteInteger(usage.events) > 0
      || cleanFiniteInteger(usage.failedIngests) > 0
    )).length,
  };
}

function serializeReconciliation(record) {
  return {
    id: record.id,
    month: record.month,
    actualOpenAiCostUsd: roundMoney(record.actualOpenAiCostUsd),
    actualBackblazeCostUsd: roundMoney(record.actualBackblazeCostUsd),
    actualRenderCostUsd: roundMoney(record.actualRenderCostUsd),
    actualOtherCostUsd: roundMoney(record.actualOtherCostUsd),
    actualTotalCostUsd: roundMoney(record.actualTotalCostUsd),
    estimatedOpenAiCostUsd: roundMoney(record.estimatedOpenAiCostUsd),
    estimatedBackblazeCostUsd: roundMoney(record.estimatedBackblazeCostUsd),
    estimatedTotalCostUsd: roundMoney(record.estimatedTotalCostUsd),
    varianceUsd: roundMoney(record.varianceUsd),
    variancePercent: record.variancePercent === null ? null : Number(record.variancePercent),
    activeUserCount: cleanFiniteInteger(record.activeUserCount),
    notes: cleanString(record.notes, 1000),
    updatedBy: cleanString(record.updatedBy, 120),
    createdAt: cleanInteger(record.createdAt),
    updatedAt: cleanInteger(record.updatedAt),
  };
}

async function getReconciliationByMonth(month) {
  const cleanMonth = cleanUsageMonth(month);
  if (!cleanMonth) return null;

  const db = await getMongoDb();
  if (db) {
    return db.collection("reconciliations").findOne({ month: cleanMonth }, { projection: { _id: 0 } });
  }

  const records = await readReconciliations();
  return records.find((record) => record.month === cleanMonth) || null;
}

async function upsertReconciliation(record) {
  const db = await getMongoDb();
  if (db) {
    await db.collection("reconciliations").replaceOne({ month: record.month }, record, { upsert: true });
    return;
  }

  const records = await readReconciliations();
  const nextRecords = records.filter((item) => item.month !== record.month);
  nextRecords.push(record);
  await writeReconciliations(nextRecords);
}

async function deleteAdminReconciliation(month) {
  const cleanMonth = cleanUsageMonth(decodeURIComponent(String(month || "")));
  if (!cleanMonth) return false;

  const db = await getMongoDb();
  if (db) {
    const result = await db.collection("reconciliations").deleteOne({ month: cleanMonth });
    return result.deletedCount > 0;
  }

  const records = await readReconciliations();
  const nextRecords = records.filter((record) => record.month !== cleanMonth);
  if (nextRecords.length === records.length) return false;
  await writeReconciliations(nextRecords);
  return true;
}

async function readReconciliations() {
  const db = await getMongoDb();
  if (db) {
    return db.collection("reconciliations").find({}).project({ _id: 0 }).toArray();
  }

  try {
    const content = await fs.readFile(reconciliationStorePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeReconciliations(records) {
  await fs.mkdir(path.dirname(reconciliationStorePath), { recursive: true });
  await fs.writeFile(reconciliationStorePath, JSON.stringify({ records }, null, 2));
}

function cleanUsageMonth(value) {
  const match = String(value || "").trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) return "";
  const month = Number(match[2]);
  if (!Number.isInteger(month) || month < 1 || month > 12) return "";
  return `${match[1]}-${match[2]}`;
}

async function exchangeRobloxOAuthCode(code, codeVerifier) {
  const body = new URLSearchParams({
    client_id: ROBLOX_OAUTH_CLIENT_ID,
    client_secret: ROBLOX_OAUTH_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
    redirect_uri: ROBLOX_OAUTH_REDIRECT_URI,
  });
  const response = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Roblox token exchange failed");
  }

  if (!payload.access_token) {
    throw new Error("Roblox did not return an access token.");
  }

  return payload;
}

async function getRobloxOAuthUser(accessToken) {
  const response = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Roblox user lookup failed");
  }

  if (cleanInteger(payload.sub) <= 0) {
    throw new Error("Roblox user lookup did not return a valid user ID.");
  }

  return payload;
}

async function getOwnedRobloxGames(robloxUserId) {
  const cleanRobloxUserId = cleanInteger(robloxUserId);
  if (cleanRobloxUserId <= 0) return [];

  const gamesByUniverseId = new Map();
  const userGames = await getRobloxUserPublicGames(cleanRobloxUserId);
  for (const game of userGames) {
    addOwnedRobloxGame(gamesByUniverseId, {
      ...game,
      ownerType: "User",
      creatorId: cleanRobloxUserId,
    });
  }

  const groups = await getRobloxOwnedGroups(cleanRobloxUserId);
  for (const group of groups) {
    const groupGames = await getRobloxGroupPublicGames(group.id);
    for (const game of groupGames) {
      addOwnedRobloxGame(gamesByUniverseId, {
        ...game,
        ownerType: "Group",
        creatorId: group.id,
        creatorName: group.name,
      });
    }
  }

  return [...gamesByUniverseId.values()]
    .sort((a, b) => a.name.localeCompare(b.name) || cleanInteger(a.id) - cleanInteger(b.id));
}

function addOwnedRobloxGame(target, game) {
  const universeId = cleanInteger(game.id || game.universeId);
  if (universeId <= 0) return;

  target.set(String(universeId), {
    id: universeId,
    name: cleanString(game.name, 120) || `Universe ${universeId}`,
    description: cleanString(game.description, 240),
    rootPlaceId: cleanInteger(game.rootPlace?.id || game.rootPlaceId || game.placeId) || null,
    creatorType: game.ownerType || normalizeRobloxCreatorType(game.creator?.type),
    creatorId: cleanInteger(game.creatorId || game.creator?.id) || null,
    creatorName: cleanString(game.creatorName || game.creator?.name, 120),
  });
}

async function getRobloxUserPublicGames(robloxUserId) {
  const url = new URL(`https://games.roblox.com/v2/users/${encodeURIComponent(String(robloxUserId))}/games`);
  url.searchParams.set("accessFilter", "Public");
  url.searchParams.set("sortOrder", "Asc");
  url.searchParams.set("limit", "50");
  return fetchRobloxPagedData(url, 4);
}

async function getRobloxOwnedGroups(robloxUserId) {
  const url = new URL(`https://groups.roblox.com/v1/users/${encodeURIComponent(String(robloxUserId))}/groups/roles`);
  const groups = await fetchRobloxPagedData(url, 4);
  return groups
    .map((entry) => ({
      id: cleanInteger(entry.group?.id || entry.id),
      name: cleanString(entry.group?.name || entry.name, 120),
      rank: cleanInteger(entry.role?.rank || entry.rank),
    }))
    .filter((group) => group.id > 0 && group.rank >= 255);
}

async function getRobloxGroupPublicGames(groupId) {
  const cleanGroupId = cleanInteger(groupId);
  if (cleanGroupId <= 0) return [];

  const url = new URL(`https://games.roblox.com/v2/groups/${encodeURIComponent(String(cleanGroupId))}/games`);
  url.searchParams.set("accessFilter", "Public");
  url.searchParams.set("sortOrder", "Asc");
  url.searchParams.set("limit", "50");
  return fetchRobloxPagedData(url, 4);
}

async function fetchRobloxPagedData(baseUrl, maxPages = 4) {
  const items = [];
  let cursor = "";

  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL(baseUrl.toString());
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url);
    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(payload.errors?.[0]?.message || payload.error || "Roblox lookup failed");
    }

    if (Array.isArray(payload.data)) items.push(...payload.data);
    cursor = cleanString(payload.nextPageCursor, 256);
    if (!cursor) break;
  }

  return items;
}

async function verifyRobloxUniverseOwnership(universeId, robloxUserId) {
  if (universeId <= 0 || robloxUserId <= 0) {
    return { ok: false, reason: "Invalid Roblox verification data." };
  }

  const universe = await getRobloxUniverseDetails(universeId);
  if (!universe) {
    return { ok: false, reason: "Roblox could not find that universe." };
  }

  const creator = universe.creator || {};
  const creatorId = cleanInteger(creator.id);
  const creatorType = normalizeRobloxCreatorType(creator.type);
  const creatorName = cleanString(creator.name, 120);

  if (creatorType === "User") {
    return {
      ok: creatorId === robloxUserId,
      reason: creatorId === robloxUserId ? "" : "The connected Roblox account is not the owner of this user-owned universe.",
      universeName: cleanString(universe.name, 120),
      creatorType,
      creatorId,
      creatorName,
    };
  }

  if (creatorType === "Group") {
    const group = await getRobloxGroupDetails(creatorId);
    const ownerId = cleanInteger(group?.owner?.id || group?.owner?.userId);
    return {
      ok: ownerId === robloxUserId,
      reason: ownerId === robloxUserId ? "" : "The connected Roblox account is not the owner of the group that owns this universe.",
      universeName: cleanString(universe.name, 120),
      creatorType,
      creatorId,
      creatorName: creatorName || cleanString(group?.name, 120),
      groupOwnerId: ownerId,
    };
  }

  return { ok: false, reason: "Roblox returned an unknown universe creator type." };
}

async function getRobloxUniverseDetails(universeId) {
  const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${encodeURIComponent(String(universeId))}`);
  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.errors?.[0]?.message || payload.error || "Roblox universe lookup failed");
  }

  return (payload.data || []).find((entry) => cleanInteger(entry.id) === universeId) || null;
}

async function getRobloxGroupDetails(groupId) {
  if (groupId <= 0) return null;

  const response = await fetch(`https://groups.roblox.com/v2/groups?groupIds=${encodeURIComponent(String(groupId))}`);
  const payload = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(payload.errors?.[0]?.message || payload.error || "Roblox group lookup failed");
  }

  return (payload.data || []).find((entry) => cleanInteger(entry.id) === groupId) || null;
}

function normalizeRobloxCreatorType(value) {
  if (typeof value === "number") return value === 1 ? "Group" : "User";
  const normalized = cleanString(value, 32).toLowerCase();
  if (normalized === "group") return "Group";
  if (normalized === "user") return "User";
  return "";
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 240) };
  }
}

async function getProjectByUniverseId(universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (cleanUniverseId <= 0) return null;

  const projects = await readProjects();
  return projects.find((project) => cleanInteger(project.universeId) === cleanUniverseId) || null;
}

async function getProjectByIdForOwner(projectId, ownerUserId) {
  const cleanProjectId = cleanString(projectId, 120);
  if (!cleanProjectId || !ownerUserId) return null;

  const projects = await readProjects();
  return projects.find((project) => project.id === cleanProjectId && project.ownerUserId === ownerUserId) || null;
}

async function getUserProjects(ownerUserId) {
  const projects = await readProjects();
  return projects
    .filter((project) => project.ownerUserId === ownerUserId)
    .sort((a, b) => cleanInteger(b.createdAt) - cleanInteger(a.createdAt))
    .map(serializeProject);
}

function serializeProject(project) {
  return {
    id: project.id,
    universeId: cleanInteger(project.universeId),
    name: project.name || `Universe ${cleanInteger(project.universeId)}`,
    createdAt: cleanInteger(project.createdAt),
  };
}

async function canAccessUniverseFromQuery(ownerUserId, searchParams) {
  const universeId = cleanInteger(searchParams.get("universeId"));
  if (universeId <= 0) return false;
  return userOwnsUniverse(ownerUserId, universeId);
}

async function userOwnsUniverse(ownerUserId, universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (!ownerUserId || cleanUniverseId <= 0) return false;

  const projects = await readProjects();
  return projects.some((project) => (
    project.ownerUserId === ownerUserId
    && cleanInteger(project.universeId) === cleanUniverseId
  ));
}

async function getProjectFromRequestSecret(req, universeId) {
  const secret = req.headers["x-dashboard-secret"];
  if (typeof secret !== "string" || !secret) return null;

  const cleanUniverseId = cleanInteger(universeId);
  if (cleanUniverseId <= 0) return null;

  const projects = await readProjects();
  return projects.find((project) => (
    cleanInteger(project.universeId) === cleanUniverseId
    && verifyProjectSecret(secret, project.secretHash)
  )) || null;
}

function hashProjectSecret(secret) {
  return crypto.createHash("sha256").update(String(secret || "")).digest("base64url");
}

function verifyProjectSecret(secret, storedHash) {
  const candidate = hashProjectSecret(secret);
  if (Buffer.byteLength(candidate) !== Buffer.byteLength(String(storedHash || ""))) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(String(storedHash || "")));
}

async function readProjects() {
  const db = await getMongoDb();
  if (db) {
    return db.collection("projects")
      .find({})
      .project({ _id: 0 })
      .toArray();
  }

  try {
    const content = await fs.readFile(projectStorePath, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.projects) ? parsed.projects : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeProjects(projects) {
  await fs.mkdir(path.dirname(projectStorePath), { recursive: true });
  await fs.writeFile(projectStorePath, JSON.stringify({ projects }, null, 2));
}

async function createProject(project) {
  const db = await getMongoDb();
  if (db) {
    await db.collection("projects").insertOne(project);
    return;
  }

  const projects = await readProjects();
  if (projects.some((entry) => cleanInteger(entry.universeId) === cleanInteger(project.universeId))) {
    const error = new Error("Duplicate project");
    error.code = 11000;
    throw error;
  }

  projects.push(project);
  await writeProjects(projects);
}

async function updateProjectSecretHash(projectId, ownerUserId, secretHash, rotatedAt) {
  const db = await getMongoDb();
  if (db) {
    const result = await db.collection("projects").updateOne(
      { id: projectId, ownerUserId },
      { $set: { secretHash, secretRotatedAt: rotatedAt } }
    );
    if (!result.matchedCount) {
      const error = new Error("Project not found");
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }
    return;
  }

  const projects = await readProjects();
  const project = projects.find((entry) => entry.id === projectId && entry.ownerUserId === ownerUserId);
  if (!project) {
    const error = new Error("Project not found");
    error.code = "PROJECT_NOT_FOUND";
    throw error;
  }

  project.secretHash = secretHash;
  project.secretRotatedAt = rotatedAt;
  await writeProjects(projects);
}

async function deleteProject(projectId, ownerUserId) {
  const db = await getMongoDb();
  if (db) {
    const project = await db.collection("projects").findOneAndDelete(
      { id: projectId, ownerUserId },
      { projection: { _id: 0 } }
    );
    return project?.value || project || null;
  }

  const projects = await readProjects();
  const projectIndex = projects.findIndex((entry) => entry.id === projectId && entry.ownerUserId === ownerUserId);
  if (projectIndex === -1) return null;

  const [project] = projects.splice(projectIndex, 1);
  await writeProjects(projects);
  return project;
}

async function deleteUniverseAnalyticsData(universeId) {
  const cleanUniverseId = cleanInteger(universeId);
  if (cleanUniverseId <= 0) return { universeId: null, deleted: false };

  const universeKey = String(cleanUniverseId);
  const memoryDeleted = clearUniverseRuntimeData(universeKey);
  const [mongoDeleted, localDeleted, objectStorageDeleted] = await Promise.all([
    deleteMongoUniverseData(cleanUniverseId),
    deleteLocalUniverseData(cleanUniverseId),
    deleteObjectStorageUniverseData(cleanUniverseId),
  ]);

  return {
    universeId: cleanUniverseId,
    deleted: true,
    memoryDeleted,
    mongoDeleted,
    localDeleted,
    objectStorageDeleted,
  };
}

function clearUniverseRuntimeData(universeKey) {
  let deleted = 0;
  for (const map of [
    chatLogsByUniverseId,
    chatLogIdsByUniverseId,
    movementSamplesByUniverseId,
    movementSampleIdsByUniverseId,
    movementRollupsByUniverseId,
    movementRollupIdsByUniverseId,
    deathSamplesByUniverseId,
    deathSampleIdsByUniverseId,
    leaveSamplesByUniverseId,
    leaveSampleIdsByUniverseId,
    mapSnapshotsByUniverseId,
    chatInsightsByScope,
    areaInsightsByScope,
    aiAutomationSettingsCache,
    objectStorageRollupCache,
  ]) {
    if (map.delete(universeKey)) deleted += 1;
  }

  for (const sessionKey of [...mapUploadSessions.keys()]) {
    if (String(sessionKey).startsWith(`${universeKey}:`)) {
      mapUploadSessions.delete(sessionKey);
      deleted += 1;
    }
  }

  return deleted;
}

async function deleteMongoUniverseData(universeId) {
  const db = await getMongoDb();
  if (!db) return {};

  const result = {};
  for (const collectionName of [
    "chat_logs",
    "movement_samples",
    "movement_rollups",
    "death_samples",
    "leave_samples",
    "map_snapshots",
    "map_snapshot_chunks",
  ]) {
    const response = await db.collection(collectionName).deleteMany({ universeId });
    result[collectionName] = response.deletedCount || 0;
  }
  return result;
}

async function deleteLocalUniverseData(universeId) {
  try {
    await fs.unlink(getMapSnapshotPath(universeId));
    return { mapSnapshot: 1 };
  } catch (error) {
    if (error.code === "ENOENT") return { mapSnapshot: 0 };
    throw error;
  }
}

async function deleteObjectStorageUniverseData(universeId) {
  if (!OBJECT_STORAGE_CONFIGURED) return {};

  const result = {};
  for (const prefix of [
    `raw/${universeId}/`,
    `maps/${universeId}/`,
    `rollups/${universeId}/`,
    `reports/${universeId}/`,
  ]) {
    result[prefix] = await deleteObjectStoragePrefix(prefix);
  }
  result[getObjectStorageAiAutomationSettingsKey(universeId)] = await deleteObjectStorageKey(getObjectStorageAiAutomationSettingsKey(universeId));
  return result;
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

function sendHtml(res, status, html) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(html);
}

function sendRobloxOAuthResult(res, result) {
  const ok = Boolean(result.ok);
  const secretHtml = result.secret
    ? `<div class="secret"><span>Roblox secret</span><code>${escapeHtml(result.secret)}</code></div>`
    : "";
  const subtitle = result.universeName
    ? `<p class="muted">${escapeHtml(result.universeName)} (${escapeHtml(result.universeId)})</p>`
    : "";
  return sendHtml(res, ok ? 200 : 400, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(result.title || "Roblox verification")}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #020617; color: #f8fafc; font-family: Arial, sans-serif; }
      main { width: min(560px, calc(100% - 32px)); border: 1px solid #1e293b; border-radius: 10px; background: #0f172a; padding: 24px; }
      h1 { margin: 0 0 10px; font-size: 24px; }
      p { color: #cbd5e1; line-height: 1.5; }
      a { display: inline-block; margin-top: 18px; border-radius: 7px; background: #7c3aed; color: white; padding: 10px 14px; text-decoration: none; font-weight: 700; }
      .muted { color: #94a3b8; }
      .secret { display: grid; gap: 8px; margin-top: 16px; border: 1px solid #164e63; border-radius: 8px; background: rgba(34, 211, 238, 0.08); padding: 12px; }
      .secret span { color: #a5f3fc; font-size: 12px; font-weight: 800; text-transform: uppercase; }
      code { overflow-wrap: anywhere; border-radius: 6px; background: rgba(2, 6, 23, 0.75); color: #a5f3fc; padding: 10px; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(result.title || "Roblox verification")}</h1>
      ${subtitle}
      <p>${escapeHtml(result.message || "")}</p>
      ${secretHtml}
      <a href="/">Back to dashboard</a>
    </main>
  </body>
</html>`);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
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

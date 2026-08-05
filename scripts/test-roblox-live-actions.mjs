import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildRobloxLiveActionMessage,
  getRobloxOAuthTokenResources,
  normalizeRobloxActionKey,
  normalizeRobloxActionParameters,
  publishRobloxUniverseMessage,
  refreshRobloxOAuthTokens,
  ROBLOX_LIVE_ACTION_TOPIC,
} from "../lib/roblox-live-actions.mjs";
import {
  generateProjectSecret,
  hashProjectSecret,
  normalizeProjectSecret,
  verifyProjectSecret,
} from "../lib/project-secrets.mjs";
import { matchesPlayerKickSession } from "../lib/player-moderation.mjs";

const firstProjectSecret = generateProjectSecret();
const rotatedProjectSecret = generateProjectSecret();
const firstProjectSecretHash = hashProjectSecret(firstProjectSecret);
const rotatedProjectSecretHash = hashProjectSecret(rotatedProjectSecret);
assert.match(firstProjectSecret, /^roa_[A-Za-z0-9_-]{32}$/);
assert.notEqual(firstProjectSecret, rotatedProjectSecret);
assert.equal(normalizeProjectSecret(` \r\n${firstProjectSecret}\t`), firstProjectSecret);
assert.equal(verifyProjectSecret(firstProjectSecret, firstProjectSecretHash), true);
assert.equal(verifyProjectSecret(` ${firstProjectSecret}\n`, firstProjectSecretHash), true);
assert.equal(verifyProjectSecret(firstProjectSecret, rotatedProjectSecretHash), false);
assert.equal(verifyProjectSecret(rotatedProjectSecret, rotatedProjectSecretHash), true);

const targetedKick = {
  userId: 123456,
  targetJobId: "job-1",
  targetJoinedAt: 1_722_000_000_000,
  targetSessionId: "session-1",
};
assert.equal(matchesPlayerKickSession(targetedKick, {
  userId: 123456,
  joinedAt: 1_722_000_000,
  sessionId: "session-1",
}, "job-1"), true);
assert.equal(matchesPlayerKickSession(targetedKick, {
  userId: 123456,
  joinedAt: 1_722_000_030,
  sessionId: "session-2",
}, "job-1"), false, "a kick must not follow the player into a new join session");
assert.equal(matchesPlayerKickSession(targetedKick, {
  userId: 123456,
  joinedAt: 1_722_000_000,
  sessionId: "session-2",
}, "job-1"), false, "a same-second rejoin must still count as a new session");
assert.equal(matchesPlayerKickSession(targetedKick, {
  userId: 123456,
  joinedAt: 1_722_000_000,
  sessionId: "session-1",
}, "job-2"), false, "a kick must not follow the player into another server");
assert.equal(matchesPlayerKickSession({ userId: 123456 }, {
  userId: 123456,
  joinedAt: 1_722_000_000,
  sessionId: "session-1",
}, "job-1"), false, "legacy kicks without a captured session must not replay");

assert.equal(normalizeRobloxActionKey(" Hourly_Event.Start "), "hourly_event.start");
assert.throws(() => normalizeRobloxActionKey("1bad"), /start with a letter/);
assert.deepEqual(
  normalizeRobloxActionParameters({ eventId: "double_xp", tuning: { multiplier: 2 } }),
  { eventId: "double_xp", tuning: { multiplier: 2 } },
);
assert.throws(() => normalizeRobloxActionParameters({ values: [1, 2] }), /JSON objects/);

const built = buildRobloxLiveActionMessage({
  deliveryId: "delivery-1",
  universeId: 10544353786,
  ruleId: "rule-1",
  actionKey: "hourly_event.start",
  parameters: { eventId: "double_xp" },
  sentAt: Date.UTC(2026, 6, 26, 12),
  expiresInSeconds: 60,
  trigger: "schedule",
});
assert.equal(built.payload.type, "roanalytics.live_action");
assert.equal(built.payload.version, 1);
assert.equal(built.payload.actionKey, "hourly_event.start");
assert.equal(built.payload.expiresAt - built.payload.sentAt, 60);

const moderationMessage = buildRobloxLiveActionMessage({
  deliveryId: "moderation-1",
  universeId: 10544353786,
  ruleId: "moderation-1",
  actionKey: "roanalytics.moderation",
  parameters: {
    action: "ban",
    userId: 123456,
    reason: "Repeated exploit attempts",
    moderationId: "moderation-1",
  },
  expiresInSeconds: 120,
  trigger: "player_moderation",
});
assert.equal(moderationMessage.payload.actionKey, "roanalytics.moderation");
assert.equal(moderationMessage.payload.parameters.action, "ban");
assert.equal(moderationMessage.payload.parameters.userId, 123456);

let publishUrl = "";
let publishOptions = null;
await publishRobloxUniverseMessage({
  accessToken: "access-token",
  universeId: 10544353786,
  topic: ROBLOX_LIVE_ACTION_TOPIC,
  message: built.message,
  fetchImpl: async (url, options) => {
    publishUrl = url;
    publishOptions = options;
    return { ok: true, status: 200, async json() { return {}; } };
  },
});
assert.equal(
  publishUrl,
  "https://apis.roblox.com/cloud/v2/universes/10544353786:publishMessage",
);
assert.equal(publishOptions.method, "POST");
assert.equal(publishOptions.headers.Authorization, "Bearer access-token");
assert.deepEqual(JSON.parse(publishOptions.body), {
  topic: ROBLOX_LIVE_ACTION_TOPIC,
  message: built.message,
});

let refreshBody = null;
const refreshed = await refreshRobloxOAuthTokens({
  refreshToken: "refresh-1",
  clientId: "client-1",
  clientSecret: "secret-1",
  fetchImpl: async (_url, options) => {
    refreshBody = Object.fromEntries(options.body);
    return {
      ok: true,
      async json() {
        return {
          access_token: "access-2",
          refresh_token: "refresh-2",
          expires_in: 900,
          scope: "openid profile universe-messaging-service:publish",
        };
      },
    };
  },
});
assert.equal(refreshBody.grant_type, "refresh_token");
assert.equal(refreshBody.refresh_token, "refresh-1");
assert.equal(refreshed.refresh_token, "refresh-2");

const resources = await getRobloxOAuthTokenResources({
  accessToken: "access-2",
  clientId: "client-1",
  clientSecret: "secret-1",
  fetchImpl: async () => ({
    ok: true,
    async json() {
      return { resource_infos: [{ resources: { universe: { ids: ["10544353786"] } } }] };
    },
  }),
});
assert.equal(resources.resource_infos[0].resources.universe.ids[0], "10544353786");

const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const methodsSource = readFileSync(new URL("../RoAnalytics/Core/Methods.lua", import.meta.url), "utf8");
const apiSource = readFileSync(new URL("../RoAnalytics/API.lua", import.meta.url), "utf8");
const project = JSON.parse(readFileSync(new URL("../default.project.json", import.meta.url), "utf8"));

assert.match(serverSource, /ROBLOX_OAUTH_LIVE_ACTION_SCOPES[\s\S]*?universe-messaging-service:publish/);
assert.match(serverSource, /purpose:\s*"roblox-live"/);
assert.match(serverSource, /getRobloxOAuthTokenResources/);
assert.match(serverSource, /createCipheriv\("aes-256-gcm"/);
assert.match(serverSource, /db\.collection\("roblox_live_integrations"\)/);
assert.match(serverSource, /evaluateRobloxLiveEventRulesForPresence\(presence\.value, project\)/);
assert.match(serverSource, /evaluateScheduledRobloxLiveActions/);
assert.match(serverSource, /triggerType === "schedule_once"/);
assert.match(serverSource, /scheduleDeliveredAt/);
assert.match(serverSource, /ROBLOX_LIVE_SCHEDULE_RETRY_MS/);
assert.match(
  serverSource,
  /db\.collection\("roblox_live_integrations"\)[\s\S]*?triggerType:\s*\{\s*\$in:\s*\["schedule",\s*"schedule_once"\]\s*\}/,
);
assert.match(
  serverSource,
  /isOneTime[\s\S]*?deliverRobloxLiveAction[\s\S]*?"schedule_once"[\s\S]*?rule\.enabled = false/,
);
assert.match(serverSource, /code:\s*connectedProject \? "PROJECT_SECRET_MISMATCH" : "UNIVERSE_NOT_CONNECTED"/);
assert.match(serverSource, /const secret = normalizeProjectSecret\(req\.headers\["x-dashboard-secret"\]\)/);
assert.doesNotMatch(serverSource, /processRobloxLiveAcknowledgements|liveActionAcks|liveActionKeys|confirmationMessage|confirmedAt|lastNegativeAck/);
assert.match(serverSource, /MAX_ROBLOX_LIVE_SENDS_PER_WINDOW = 20/);
const alertEventCounterStart = serverSource.indexOf("function countDiscordAlertEvents(");
const alertEventCounterEnd = serverSource.indexOf("\nfunction formatDiscordAlertWindow(", alertEventCounterStart);
assert.ok(alertEventCounterStart >= 0 && alertEventCounterEnd > alertEventCounterStart);
const countAlertEvents = Function(
  `"use strict";
  const deathSamplesByUniverseId = new Map();
  const leaveSamplesByUniverseId = new Map();
  const customEventsByUniverseId = new Map();
  const chatLogsByUniverseId = new Map([["123", [
    { sentAt: 1_000 },
    { sentAt: 2_000 },
    { sentAt: 4_000 },
  ]]]);
  const normalizeCustomEventName = (value) => String(value || "").trim().toLowerCase();
  const cleanTimestampMs = (value) => Number(value) || 0;
  ${serverSource.slice(alertEventCounterStart, alertEventCounterEnd)}
  return countDiscordAlertEvents;`,
)();
assert.equal(
  countAlertEvents(123, "chat_message", 1_500, 4_000),
  2,
  "Roblox rules should count stored chat messages in their selected window",
);
const presenceHeartbeatSource = serverSource.match(
  /async function handlePresenceHeartbeat\(req, res\)([\s\S]*?)async function handleMapSnapshotUpload/,
)?.[1] || "";
assert.ok(presenceHeartbeatSource);
assert.doesNotMatch(
  presenceHeartbeatSource,
  /acknowledgedLiveActionCount|processRobloxLiveAcknowledgements/,
  "presence heartbeats should not process or return live-action confirmations",
);
assert.doesNotMatch(
  presenceHeartbeatSource,
  /getRobloxHeatmap|heatmap:/,
  "heartbeat responses should not calculate or return dashboard heatmap data",
);
assert.match(
  serverSource,
  /url\.pathname === "\/api\/roblox\/heatmap"[\s\S]*?getRobloxHeatmapFromQuery/,
  "the dedicated dashboard heatmap endpoint should remain available",
);
assert.equal(project.tree.ServerScriptService.RoAnalytics.$path, "RoAnalytics");
assert.equal(project.tree.ServerScriptService.Server, undefined, "RoAnalytics should be directly under ServerScriptService");
assert.match(indexSource, /data-dashboard-view="roblox-live"/);
assert.match(
  indexSource,
  /data-view-panel="roblox-live"[\s\S]*?id="robloxLiveAuthorization"[\s\S]*?id="robloxLiveAuthorizationAlert"[\s\S]*?id="robloxLiveAuthorizeButton"/,
);
assert.match(
  indexSource,
  /id="robloxLiveAuthorization"[\s\S]*?id="robloxLiveAuthorizationTitle"[\s\S]*?id="robloxLiveDisconnectButton"[\s\S]*?class="panel robloxLiveRulesPanel"/,
);
assert.doesNotMatch(indexSource, /robloxLiveConnectionHeader|robloxLiveConnectionBadge|>Roblox Open Cloud<|<h2>Live actions<\/h2>/);
assert.doesNotMatch(indexSource, /robloxLiveRuntimePanel|robloxLiveTestButton|robloxLiveServerCount|robloxLiveActionCount|>Live servers<|>Detected actions</);
assert.match(
  indexSource,
  /class="robloxLiveSectionHeader"[\s\S]*?class="robloxLiveRulesControls"[\s\S]*?id="robloxLiveRuleCount"[\s\S]*?id="robloxLiveNewRuleButton"/,
);
assert.match(
  indexSource,
  /class="robloxLiveRuleTableHeader"[\s\S]*?>Name<[\s\S]*?>Action key<[\s\S]*?>Condition<[\s\S]*?>Current<[\s\S]*?>Cooldown<[\s\S]*?>Actions</,
);
assert.match(
  indexSource,
  /class="robloxLiveDeliveryTableHeader"[\s\S]*?>Name<[\s\S]*?>Action key<[\s\S]*?>Trigger<[\s\S]*?>Sent<[\s\S]*?>Status</,
);
assert.doesNotMatch(indexSource, /Publish and first server confirmation|robloxLiveActionKeys/);
assert.doesNotMatch(indexSource, /robloxLiveMasterToggle|robloxLiveMasterState|>Live actions<\/b>|>Paused<\/small>/);
assert.match(indexSource, /id="robloxLiveRuleForm"[\s\S]*?id="robloxLiveRuleActionKey"[\s\S]*?id="robloxLiveRuleParameters"/);
assert.match(
  indexSource,
  /id="robloxLiveRuleTrigger"[\s\S]*?value="schedule_once">Scheduled once<[\s\S]*?id="robloxLiveScheduleOnceCondition"[\s\S]*?id="robloxLiveRuleScheduleDate"[\s\S]*?id="robloxLiveRuleScheduleTime"[\s\S]*?Eastern Standard Time/,
);
assert.match(
  indexSource,
  /class="discordRuleDialogCard robloxLiveRuleDialogCard"[\s\S]*?<header>[\s\S]*?class="discordWebhookBuilderBackButton discordRuleBackButton" id="robloxLiveRuleCloseButton"[\s\S]*?id="robloxLiveRuleDialogTitle"/,
);
assert.doesNotMatch(indexSource, /class="iconButton" id="robloxLiveRuleCloseButton"/);
assert.doesNotMatch(indexSource, /id="robloxLiveTopic"/);
assert.match(appSource, /function renderRobloxLiveIntegration\(\)/);
assert.match(appSource, /setRobloxLiveStatus\(error\.status === 403 \? "" : formatRequestError\(error\), "error"\)/);
assert.doesNotMatch(serverSource, /You do not have access to live actions for this universe/);
assert.doesNotMatch(appSource, /const robloxLiveTopic|robloxLiveTopic\.textContent/);
assert.match(
  appSource,
  /"roblox-live":\s*\{[\s\S]*?title:\s*"Roblox Live Actions"[\s\S]*?subtitle:\s*"Trigger pre-coded server actions from live analytics or a fixed schedule\."/,
);
assert.match(appSource, /robloxLiveAuthorizationAlert\.hidden = connected && !authorizationError/);
assert.match(appSource, /robloxLiveAuthorizeButton\.hidden = connected && !authorizationError/);
assert.match(appSource, /robloxLiveDisconnectButton\.hidden = !connected/);
assert.doesNotMatch(
  appSource,
  /testRobloxLiveActions|robloxLiveTestButton|robloxLiveServerCount|robloxLiveActionCount|robloxLiveMasterToggle|updateRobloxLiveMasterState/,
);
assert.doesNotMatch(appSource, /textContent = connected \? "Reauthorize"/);
assert.doesNotMatch(
  appSource,
  /Action rule (?:created|updated|deleted)\.|Action (?:enabled|paused)\.|Action published to live Roblox servers\.|Roblox live actions disconnected\./,
);
assert.match(appSource, /function formatRobloxLiveDeliveryStatus\(status\)/);
assert.match(appSource, /function getRobloxLiveScheduledInputTimestamp\(\)/);
assert.match(
  appSource,
  /robloxLiveRuleTrigger\?\.value === "schedule_once"[\s\S]*?Choose a future Eastern Time\./,
);
assert.doesNotMatch(appSource, /Confirmed by a live server|confirmation window|No confirmation|acknowledgedServers|runtime\.detectedActions/);
assert.match(appSource, /function startRobloxLiveRefresh\(\)[\s\S]*?loadRobloxLiveIntegration\(\{ background: true \}\)/);
assert.match(appSource, /const ROBLOX_LIVE_REFRESH_MS = 5000/);
const liveActionDeliveryRowSource = appSource.match(
  /function renderRobloxLiveDeliveryRow\(delivery\)([\s\S]*?)function formatRobloxLiveDeliveryStatus/,
)?.[1] || "";
assert.ok(liveActionDeliveryRowSource);
assert.match(liveActionDeliveryRowSource, /Manual[\s\S]*?Schedule[\s\S]*?Event/);
assert.match(liveActionDeliveryRowSource, /class="robloxLiveDeliveryCell"[\s\S]*?class="robloxLiveDeliveryKey"/);
assert.match(appSource, /\/api\/integrations\/roblox-live\/rules/);
assert.doesNotMatch(serverSource, /\/api\/integrations\/roblox-live\/test|handleRobloxLiveConnectionTest/);
assert.doesNotMatch(
  serverSource,
  /\/api\/integrations\/roblox-live\/settings|handleRobloxLiveSettingsUpdate|Roblox live actions are paused|integration\.enabled/,
);
assert.match(styleSource, /\.robloxLiveAuthorizationAlert\s*\{/);
assert.match(styleSource, /\.robloxLiveRuleTableHeader,\s*\.robloxLiveRuleRow\s*\{/);
assert.match(styleSource, /\.robloxLiveRuleRow\s*\{/);
assert.match(styleSource, /\.robloxLiveRuleToggle\s*\{[\s\S]*?width:\s*64px;[\s\S]*?min-width:\s*64px;/);
assert.match(styleSource, /\.robloxLiveDeliveryTableHeader,\s*\.robloxLiveDeliveryRow\s*\{/);
const liveActionRuleRowSource = appSource.match(
  /function renderRobloxLiveRuleRow\(rule\)([\s\S]*?)function renderRobloxLiveDeliveryRow/,
)?.[1] || "";
assert.ok(liveActionRuleRowSource);
assert.match(liveActionRuleRowSource, /class="robloxLiveRuleIdentity"[\s\S]*?rule\.name[\s\S]*?class="robloxLiveRuleTopic"[\s\S]*?rule\.actionKey/);
assert.match(liveActionRuleRowSource, /class="robloxLiveRuleMetric"[\s\S]*?rule\.currentCount/);
assert.doesNotMatch(liveActionRuleRowSource, /serverCount|detectedAction|live server|>Enabled<|>Paused</);
assert.match(methodsSource, /function Methods\.RegisterLiveAction\(actionKey, handler\)/);
assert.match(methodsSource, /return false, "A heartbeat is already in progress\.", nil/);
assert.match(methodsSource, /return false, getHeartbeatResponseError\(response\), tonumber\(response\.StatusCode\)/);
assert.match(methodsSource, /return true, nil, tonumber\(response\.StatusCode\)/);
assert.match(methodsSource, /\["X-Dashboard-Secret"\] = dashboardSecret/);
assert.match(methodsSource, /MessagingService:SubscribeAsync/);
assert.match(methodsSource, /payload\.type ~= "roanalytics\.live_action"/);
assert.match(methodsSource, /actionKey == "roanalytics\.moderation"/);
assert.match(methodsSource, /applyHeartbeatModeration\(response\)/);
assert.match(methodsSource, /player:Kick\(heading \.\. "\\nReason: " \.\. reason\)/);
assert.match(serverSource, /url\.pathname\.startsWith\("\/api\/admin\/"\)[\s\S]*?Admin access required/);
assert.match(serverSource, /url\.pathname === "\/api\/player-moderation"/);
assert.doesNotMatch(serverSource, /\/api\/admin\/player-moderation/);
assert.match(
  serverSource,
  /handlePlayerModerationGet[\s\S]*?getProjectByUniverseIdForOwner\(auth\.userId, universeId\)/,
  "moderation access should remain scoped to a universe owned by the signed-in dashboard user",
);
assert.match(serverSource, /db\.collection\("player_moderation_actions"\)/);
assert.match(serverSource, /db\.collection\("player_bans"\)/);
assert.match(serverSource, /getHeartbeatModerationCommands\(presence\.value, project\)/);
assert.match(indexSource, /data-dashboard-view="moderation"/);
assert.match(indexSource, /data-view-panel="moderation"[\s\S]*?id="moderationLivePlayerList"[\s\S]*?id="moderationActiveBanList"[\s\S]*?id="moderationHistoryList"/);
assert.match(indexSource, /id="playerModerationLookupInput"[\s\S]*?data-player-moderation-manual-action="kick"[\s\S]*?data-player-moderation-manual-action="ban"/);
assert.match(indexSource, /id="playerModerationSubmitButton" type="button"/);
assert.match(appSource, /function loadPlayerModeration\(options = \{\}\)/);
assert.match(appSource, /function savePlayerModerationAction\(\)/);
assert.match(appSource, /playerModerationSubmitButton\?\.addEventListener\("click", savePlayerModerationAction\)/);
assert.match(appSource, /target:\s*playerModerationTargetQuery\.value/);
assert.match(serverSource, /resolveUserTargets\(targetQuery\)/);
assert.doesNotMatch(serverSource, /actionType === "kick" && !player/);
assert.match(serverSource, /targetJobId:\s*actionType === "kick"/);
assert.match(serverSource, /targetJoinedAt:\s*actionType === "kick"/);
assert.match(serverSource, /targetSessionId:\s*actionType === "kick"/);
assert.match(serverSource, /matchesPlayerKickSession\(kick, player, presence\.jobId\)/);
assert.match(methodsSource, /sessionId = playerSessionIds\[player\.UserId\]/);
const manualActionOpenerSource = appSource.match(
  /function handlePlayerModerationManualAction\(event\)([\s\S]*?)function openPlayerModerationDialog/,
)?.[1] || "";
assert.ok(manualActionOpenerSource);
assert.doesNotMatch(manualActionOpenerSource, /request\(|savePlayerModerationAction\(/);
assert.ok(
  serverSource.indexOf("const publishPromise = actionType") < serverSource.indexOf("await savePlayerModerationAction(action)"),
  "moderation messaging should start before waiting for durable history storage",
);
assert.doesNotMatch(methodsSource, /pendingLiveActionAcks|liveActionAcks|getLiveActionAcksPayload|liveActionKeys|getRegisteredLiveActionKeys|queueLiveActionAck/);
assert.doesNotMatch(methodsSource, /roanalytics_test/);
const liveActionHandlerSource = methodsSource.match(
  /local function handleLiveActionMessage\(message\)([\s\S]*?)function Methods\.RegisterLiveAction/,
)?.[1] || "";
assert.ok(liveActionHandlerSource);
assert.doesNotMatch(
  liveActionHandlerSource,
  /SendHeartbeat|queueLiveActionAck/,
  "live actions should not add confirmation traffic to analytics heartbeats",
);
assert.match(apiSource, /function RoAnalytics\.RegisterLiveAction\(actionKey, handler\)/);
assert.doesNotMatch(`${apiSource}\n${methodsSource}`, /\bwarn\s*\(|debugWarn/, "RoAnalytics should not emit warning logs");
assert.doesNotMatch(methodsSource, /function Methods\.RegisterLiveAction[\s\S]*?function Methods\.Start\(\)[\s\S]*?function Methods\.RegisterLiveAction/);

console.log("Roblox live-action integration regression checks passed.");

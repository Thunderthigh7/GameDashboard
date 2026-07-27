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
assert.match(serverSource, /processRobloxLiveAcknowledgements\(presence\.value, project\)/);
assert.match(serverSource, /if \(!delivery \|\| delivery\.confirmation \|\| delivery\.status === "failed"\) continue/);
assert.match(serverSource, /delivery\.confirmation = normalizedAck[\s\S]*?delivery\.status = "confirmed"/);
assert.match(serverSource, /function getRobloxLiveDeliveryStatus\(delivery\)[\s\S]*?return "unconfirmed"/);
assert.match(serverSource, /MAX_ROBLOX_LIVE_SENDS_PER_WINDOW = 20/);
const presenceHeartbeatSource = serverSource.match(
  /async function handlePresenceHeartbeat\(req, res\)([\s\S]*?)async function handleMapSnapshotUpload/,
)?.[1] || "";
assert.ok(presenceHeartbeatSource);
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
assert.doesNotMatch(indexSource, /robloxLiveConnectionHeader|robloxLiveConnectionBadge|>Roblox Open Cloud<|<h2>Live actions<\/h2>/);
assert.match(
  indexSource,
  /class="robloxLiveSectionHeader"[\s\S]*?class="robloxLiveRulesControls"[\s\S]*?id="robloxLiveMasterToggle"[\s\S]*?id="robloxLiveRuleCount"[\s\S]*?id="robloxLiveNewRuleButton"/,
);
assert.match(indexSource, /id="robloxLiveRuleForm"[\s\S]*?id="robloxLiveRuleActionKey"[\s\S]*?id="robloxLiveRuleParameters"/);
assert.match(appSource, /function renderRobloxLiveIntegration\(\)/);
assert.match(
  appSource,
  /"roblox-live":\s*\{[\s\S]*?title:\s*"Roblox Live Actions"[\s\S]*?subtitle:\s*"Trigger pre-coded server actions from live analytics or a fixed schedule\."/,
);
assert.match(appSource, /robloxLiveAuthorizationAlert\.hidden = connected && !authorizationError/);
assert.match(appSource, /robloxLiveAuthorizeButton\.hidden = connected && !authorizationError/);
assert.doesNotMatch(appSource, /textContent = connected \? "Reauthorize"/);
assert.match(appSource, /function formatRobloxLiveDeliveryStatus\(status\)/);
assert.match(appSource, /Confirmed by a live server/);
assert.doesNotMatch(appSource, /acknowledgedServers/);
assert.match(appSource, /\/api\/integrations\/roblox-live\/rules/);
assert.match(styleSource, /\.robloxLiveAuthorizationAlert\s*\{/);
assert.match(styleSource, /\.robloxLiveRuleRow\s*\{/);
assert.match(methodsSource, /function Methods\.RegisterLiveAction\(actionKey, handler\)/);
assert.match(methodsSource, /MessagingService:SubscribeAsync/);
assert.match(methodsSource, /payload\.type ~= "roanalytics\.live_action"/);
assert.match(methodsSource, /liveActionKeys = getRegisteredLiveActionKeys\(\)/);
assert.match(methodsSource, /liveActionAcks = getLiveActionAcksPayload\(\)/);
const liveActionHandlerSource = methodsSource.match(
  /local function handleLiveActionMessage\(message\)([\s\S]*?)function Methods\.RegisterLiveAction/,
)?.[1] || "";
assert.ok(liveActionHandlerSource);
assert.doesNotMatch(
  liveActionHandlerSource,
  /SendHeartbeat/,
  "live-action acknowledgements should wait for the existing scheduled heartbeat",
);
assert.match(apiSource, /function RoAnalytics\.RegisterLiveAction\(actionKey, handler\)/);
assert.doesNotMatch(`${apiSource}\n${methodsSource}`, /\bwarn\s*\(|debugWarn/, "RoAnalytics should not emit warning logs");
assert.doesNotMatch(methodsSource, /function Methods\.RegisterLiveAction[\s\S]*?function Methods\.Start\(\)[\s\S]*?function Methods\.RegisterLiveAction/);

console.log("Roblox live-action integration regression checks passed.");

import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildRoAnalyticsInstallerPackage } from "../lib/roanalytics-installer.mjs";

const serverSource = fs.readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const stylesSource = fs.readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const pluginSource = fs.readFileSync(new URL("../roblox-plugin/RoAnalyticsInstaller.plugin.lua", import.meta.url), "utf8");
const apiSource = fs.readFileSync(new URL("../RoAnalytics/API.lua", import.meta.url), "utf8");
const methodsSource = fs.readFileSync(new URL("../RoAnalytics/Core/Methods.lua", import.meta.url), "utf8");
const settingsSource = fs.readFileSync(new URL("../RoAnalytics/Config/Settings.lua", import.meta.url), "utf8");

assert.equal(
  fs.existsSync(new URL("../roblox-plugin/DashboardHeatmap.plugin.lua", import.meta.url)),
  false,
  "The Studio heatmap plugin should be removed",
);
assert.doesNotMatch(pluginSource, /heatmap|map[-_ ]snapshot|GetDescendants\(\)|Workspace/i);
assert.match(pluginSource, /ScriptEditorService:UpdateSourceAsync/);
assert.match(pluginSource, /ChangeHistoryService:TryBeginRecording/);
assert.match(pluginSource, /\/api\/roblox\/studio-pairings/);
assert.match(pluginSource, /Pair & Install/);
assert.match(pluginSource, /Allow HTTP Requests/);
assert.match(pluginSource, /KEY STRING BEFORE USER ID/);
assert.match(pluginSource, /playerDataStoreName = playerDataStoreName/);
assert.match(pluginSource, /playerDataKeyPrefix = playerDataKeyPrefix/);
assert.match(pluginSource, /\/api\/roblox\/studio-player-data\/poll/);
assert.match(pluginSource, /RoAnalyticsRelayCredential_/);
assert.match(pluginSource, /DataStoreService:GetDataStore\(relayDataStoreName\)/);
assert.match(pluginSource, /dataStore:GetAsync\(key, options\)/);
assert.match(pluginSource, /dataStore:UpdateAsync\(key/);
assert.match(pluginSource, /valueType == "number"/);
assert.doesNotMatch(pluginSource, /must contain one JSON-compatible table/);
assert.match(pluginSource, /Studio Access to API Services/);

const secret = `roa_${"a".repeat(48)}`;
const installerPackage = await buildRoAnalyticsInstallerPackage({
  rootDir: fileURLToPath(new URL("../RoAnalytics", import.meta.url)),
  secret,
  playerDataStoreName: "PlayerData",
  playerDataKeyPrefix: "Player_",
  version: "test",
});
assert.equal(installerPackage.name, "RoAnalytics");
assert.deepEqual(
  installerPackage.files.map((file) => file.path),
  ["API.lua", "Config/Settings.lua", "Core/Methods.lua", "Start.server.lua"],
);
const installedSettings = installerPackage.files.find((file) => file.path === "Config/Settings.lua")?.source || "";
assert.match(installedSettings, new RegExp(`Settings\\.Secret = "${secret}"`));
assert.match(installedSettings, /Settings\.PlayerDataStoreName = "PlayerData"/);
assert.match(installedSettings, /Settings\.PlayerDataKeyPrefix = "Player_"/);
assert.doesNotMatch(installedSettings, /Settings\.Secret = "paste-project-roblox-secret-here"/);

assert.match(serverSource, /handleStudioPairingStart/);
assert.match(serverSource, /handleStudioPairingDecision/);
assert.match(serverSource, /handleStudioPairingClaim/);
assert.match(serverSource, /claimTokenHash: hashStudioPairingToken/);
assert.match(serverSource, /pairing\.secretEncrypted = encryptRobloxLiveOAuthToken/);
assert.match(serverSource, /normalizeStudioDataStoreSetting/);
assert.match(serverSource, /playerDataStoreName: pairing\.playerDataStoreName/);
assert.match(serverSource, /handleStudioPlayerDataPoll/);
assert.match(serverSource, /studioRelay: \{/);
assert.match(serverSource, /credential: installSecret/);
assert.match(serverSource, /mode: studioRelay[\s\S]*?"studio_plugin"/);
assert.match(serverSource, /studioPlayerDataRelaysByUniverseId/);
assert.match(serverSource, /installSecretHashes: \[\]/);
assert.ok(
  serverSource.indexOf('url.pathname === "/api/roblox/studio-pairings"')
    < serverSource.indexOf('url.pathname.startsWith("/api/") && !isDashboardAuthenticated(req)'),
  "Studio must claim its pairing before dashboard-session enforcement",
);
assert.ok(
  serverSource.indexOf('url.pathname === "/api/roblox/studio-player-data/poll"')
    < serverSource.indexOf('url.pathname.startsWith("/api/") && !isDashboardAuthenticated(req)'),
  "The authenticated Studio relay must poll before dashboard-session enforcement",
);

assert.match(htmlSource, /data-dashboard-view="player-data"/);
assert.match(htmlSource, /data-view-panel="player-data"/);
assert.match(htmlSource, /id="studioInstallerPanel"/);
assert.match(htmlSource, /id="playerDataJsonEditor"/);
assert.match(htmlSource, /RoAnalytics\.RegisterPlayerDataAdapter/);
assert.match(appSource, /async function requestPlayerDataRead/);
assert.match(appSource, /async function requestPlayerDataWrite/);
assert.match(appSource, /function pollPlayerDataRequest/);
assert.match(appSource, /Studio plugin ready/);
assert.match(appSource, /No live server is required/);
assert.match(appSource, /"object", "string", "number", "boolean"/);
assert.match(serverSource, /"object", "string", "number", "boolean"/);
assert.match(stylesSource, /\.playerDataBridgeBadge/);

assert.match(serverSource, /PLAYER_DATA_REQUEST_TTL_MS = 15 \* 60 \* 1000/);
assert.match(serverSource, /MAX_PLAYER_DATA_JSON_BYTES = 256 \* 1024/);
assert.match(serverSource, /encryptPlayerDataPayload/);
assert.match(serverSource, /consumePlayerDataReadRequest/);
assert.match(serverSource, /sourceRequest\.expiresAtMs <= Date\.now\(\)/);
assert.match(serverSource, /playerDataBridgeRegistered/);
assert.match(serverSource, /publishPlayerDataRequest/);
assert.ok(
  serverSource.indexOf("const robloxPlayerDataClaimMatch")
    < serverSource.indexOf('url.pathname.startsWith("/api/") && !isDashboardAuthenticated(req)'),
  "Live Roblox servers must authenticate player-data claims with the project credential",
);

assert.match(apiSource, /function RoAnalytics\.RegisterPlayerDataAdapter/);
assert.match(methodsSource, /function Methods\.RegisterPlayerDataAdapter/);
assert.match(methodsSource, /runtimeEnvironment ~= "production"/);
assert.match(methodsSource, /playerDataBridge = \{[\s\S]*?registered = registeredPlayerDataAdapter ~= nil/);
assert.match(methodsSource, /applyHeartbeatPlayerData\(response\)/);
assert.match(methodsSource, /DataStoreService:GetDataStore\(dataStoreName\)/);
assert.match(methodsSource, /DataStoreGetOptions/);
assert.match(methodsSource, /options\.UseCache = false/);
assert.match(methodsSource, /dataStore:UpdateAsync/);
assert.match(methodsSource, /currentKeyInfo:GetUserIds\(\)/);
assert.match(methodsSource, /currentKeyInfo:GetMetadata\(\)/);
assert.match(methodsSource, /This player is online/);
assert.match(methodsSource, /valueType == "number"/);
assert.match(settingsSource, /Settings\.PlayerDataBridgeEnabled = true/);
assert.match(settingsSource, /Settings\.PlayerDataStoreName = ""/);
assert.match(settingsSource, /Settings\.PlayerDataKeyPrefix = ""/);

console.log("Studio installer and player-data bridge tests passed.");

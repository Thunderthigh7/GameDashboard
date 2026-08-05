import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const envSource = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

assert.match(indexSource, /data-dashboard-view="publishing"/);
assert.match(indexSource, /data-view-panel="publishing"/);
assert.match(indexSource, /id="publishingApiKey"[^>]*type="password"/);
assert.match(indexSource, /id="publishingPlaceFile"[^>]*accept="\.rbxl,\.rbxlx"/);
assert.match(indexSource, /value="schedule"/);
assert.match(indexSource, /value="event"/);
assert.match(indexSource, /universe-places/);

assert.match(appSource, /UNIVERSE_SCOPED_VIEWS[^\n]*"publishing"/);
assert.match(appSource, /async function loadPlacePublishing/);
assert.match(appSource, /async function createPlacePublishJob/);
assert.match(appSource, /async function savePlacePublishingConnection/);
assert.match(appSource, /function syncPlacePublishingTriggerFields/);

assert.match(serverSource, /url\.pathname === "\/api\/place-publishing"/);
assert.match(serverSource, /async function handlePlacePublishJobCreate/);
assert.match(serverSource, /async function evaluateScheduledPlacePublishJobs/);
assert.match(serverSource, /async function evaluatePlacePublishEventTriggersForPresence/);
assert.match(serverSource, /https:\/\/apis\.roblox\.com\/universes\/v1\/\$\{encodeURIComponent\(String\(job\.universeId\)\)\}\/places\/\$\{encodeURIComponent\(String\(job\.placeId\)\)\}\/versions\?versionType=Published/);
assert.match(serverSource, /"x-api-key": apiKey/);
assert.match(serverSource, /encryptedApiKey: encryptRobloxLiveOAuthToken\(apiKey\)/);
assert.match(serverSource, /MAX_PLACE_FILE_BYTES = Math\.min\(100 \* 1024 \* 1024/);
assert.doesNotMatch(serverSource, /ROBLOX_OAUTH_PLACE/);

assert.match(styleSource, /\.publishingWorkspace/);
assert.match(styleSource, /\.publishingStateBadge\[data-state="published"\]/);
assert.match(envSource, /MAX_PLACE_FILE_BYTES=104857600/);

console.log("Scheduled and event-triggered Roblox place publishing checks passed.");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const envSource = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

assert.match(indexSource, /data-dashboard-view="assets"/);
assert.match(indexSource, /data-view-panel="assets"/);
assert.match(indexSource, /id="assetFileInput"[^>]*multiple/);
assert.match(indexSource, /id="assetPackList"/);
assert.match(indexSource, /id="assetSaveBatchButton"/);
assert.doesNotMatch(indexSource, /id="moderationOnlineCount"/);

assert.match(appSource, /const UNIVERSE_SCOPED_VIEWS = new Set\([^)]*"assets"/);
assert.match(appSource, /async function collectDroppedEntryFiles/);
assert.match(appSource, /Math\.min\(3, assetPendingFiles\.length\)/);
assert.match(appSource, /async function saveAssetBatch/);
assert.match(appSource, /async function publishAssetPack/);
assert.match(appSource, /function syncAssetOperationPolling/);

assert.match(serverSource, /ROBLOX_OAUTH_ASSET_SCOPES[\s\S]*?asset:read asset:write/);
assert.match(serverSource, /url\.pathname === "\/api\/assets\/drafts"/);
assert.match(serverSource, /assetPackPublishMatch/);
assert.match(serverSource, /async function saveAssetDraftBlob/);
assert.match(serverSource, /OBJECT_STORAGE_CONFIGURED[\s\S]*?PutObjectCommand/);
assert.match(serverSource, /async function createRobloxAsset/);
assert.match(serverSource, /https:\/\/apis\.roblox\.com\/assets\/v1\/assets/);
assert.match(serverSource, /creationContext: \{ creator \}/);
assert.match(serverSource, /MAX_ASSETS_PER_BATCH = Math\.min\(100/);
assert.match(serverSource, /async function readBinaryBody/);

assert.match(styleSource, /\.assetWorkspace/);
assert.match(styleSource, /\.assetDropZone\.isDragging/);
assert.match(styleSource, /\.assetStateBadge\[data-state="approved"\]/);
assert.match(envSource, /ROBLOX_OAUTH_ASSET_SCOPES=openid profile asset:read asset:write/);

console.log("Asset publishing page and bulk-save regression checks passed.");

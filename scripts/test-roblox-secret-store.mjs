import assert from "node:assert/strict";
import fs from "node:fs/promises";
import sodium from "libsodium-wrappers";
import {
  ROANALYTICS_SECRET_NAME,
  upsertRobloxUniverseSecret,
} from "../lib/roblox-secret-store.mjs";

await sodium.ready;

const keyPair = sodium.crypto_box_keypair();
const publicKey = sodium.to_base64(keyPair.publicKey, sodium.base64_variants.ORIGINAL);
const keyId = "1200590785272263122";
const secretValue = "roa_regression_secret";
const calls = [];
const fetchImpl = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url).endsWith("/public-key")) {
    return jsonResponse(200, {
      id: "public-key",
      secret: publicKey,
      key_id: keyId,
    });
  }
  if (options.method === "PATCH") return jsonResponse(404, { error: "Not found" });
  if (options.method === "POST") return jsonResponse(200, { id: ROANALYTICS_SECRET_NAME });
  throw new Error(`Unexpected request: ${options.method} ${url}`);
};

const created = await upsertRobloxUniverseSecret({
  accessToken: "oauth-access-token",
  universeId: 123456,
  secretValue,
  domain: "game-dashboard-zaya.onrender.com",
  fetchImpl,
});
assert.equal(created.operation, "created");
assert.equal(calls.length, 3);
assert.equal(calls[0].options.headers.Authorization, "Bearer oauth-access-token");
assert.equal(calls[1].options.method, "PATCH");
assert.equal(calls[2].options.method, "POST");

const createBody = JSON.parse(calls[2].options.body);
assert.equal(createBody.id, ROANALYTICS_SECRET_NAME);
assert.equal(createBody.key_id, keyId);
assert.equal(createBody.domain, "game-dashboard-zaya.onrender.com");
const encrypted = sodium.from_base64(createBody.secret, sodium.base64_variants.ORIGINAL);
const decrypted = sodium.crypto_box_seal_open(encrypted, keyPair.publicKey, keyPair.privateKey);
assert.equal(sodium.to_string(decrypted), secretValue);

const updateCalls = [];
const updated = await upsertRobloxUniverseSecret({
  accessToken: "oauth-access-token",
  universeId: 123456,
  secretValue: "roa_rotated_secret",
  domain: "game-dashboard-zaya.onrender.com",
  fetchImpl: async (url, options = {}) => {
    updateCalls.push({ url: String(url), options });
    if (String(url).endsWith("/public-key")) {
      return jsonResponse(200, { secret: publicKey, key_id: keyId });
    }
    return jsonResponse(200, { updated: "2026-07-26T00:00:00Z" });
  },
});
assert.equal(updated.operation, "updated");
assert.equal(updateCalls.length, 2);
assert.equal(updateCalls[1].options.method, "PATCH");

const [serverSource, settingsSource, methodsSource, appSource, indexSource] = await Promise.all([
  fs.readFile(new URL("../server.mjs", import.meta.url), "utf8"),
  fs.readFile(new URL("../RoAnalytics/Config/Settings.lua", import.meta.url), "utf8"),
  fs.readFile(new URL("../RoAnalytics/Core/Methods.lua", import.meta.url), "utf8"),
  fs.readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  fs.readFile(new URL("../public/index.html", import.meta.url), "utf8"),
]);

assert.match(serverSource, /universe[.]secret:read universe[.]secret:write/);
assert.match(serverSource, /pendingSecretHash/);
assert.match(serverSource, /upsertRobloxUniverseSecret/);
assert.match(serverSource, /secretSetupAuthorizationUrl: getProjectSecretAuthorizationUrl[(]project[)]/);
assert.doesNotMatch(settingsSource, /paste-project-roblox-secret-here|Settings[.]Secret\s*=/);
assert.match(settingsSource, /Settings[.]SecretName = "ROANALYTICS_SECRET"/);
assert.match(methodsSource, /HttpService:GetSecret[(]Settings[.]SecretName[)]/);
assert.match(appSource, /authorizationUrl/);
assert.match(appSource, /Game connected[.] Authorize key setup below/);
assert.match(indexSource, /installs it automatically/i);
assert.doesNotMatch(indexSource, /Paste the secret into <strong>Config\/Settings[.]lua<\/strong>/);

console.log("Roblox Secrets Store regression checks passed.");

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

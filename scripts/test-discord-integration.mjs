import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MAX_DISCORD_MESSAGE_LENGTH,
  normalizeDiscordMessage,
  normalizeDiscordWebhookUrl,
  sendDiscordWebhookMessage,
} from "../lib/discord-webhooks.mjs";

const webhookId = "123456789012345678";
const webhookToken = "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-1234567890";
const validWebhookUrl = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`;

assert.equal(
  normalizeDiscordWebhookUrl(validWebhookUrl),
  `${validWebhookUrl}?wait=true`,
);
assert.equal(
  normalizeDiscordWebhookUrl(
    `https://canary.discord.com/api/v10/webhooks/${webhookId}/${webhookToken}?wait=false`,
  ),
  `https://canary.discord.com/api/v10/webhooks/${webhookId}/${webhookToken}?wait=true`,
);

for (const invalidUrl of [
  "",
  `http://discord.com/api/webhooks/${webhookId}/${webhookToken}`,
  `https://discord.com.evil.example/api/webhooks/${webhookId}/${webhookToken}`,
  "https://discord.com/channels/example",
  `https://discord.com:8443/api/webhooks/${webhookId}/${webhookToken}`,
]) {
  assert.throws(() => normalizeDiscordWebhookUrl(invalidUrl));
}

assert.equal(normalizeDiscordMessage("Deployment complete."), "Deployment complete.");
assert.throws(() => normalizeDiscordMessage("   "), /Write a message/);
assert.throws(
  () => normalizeDiscordMessage("x".repeat(MAX_DISCORD_MESSAGE_LENGTH + 1)),
  /2,000 characters/,
);

let requestUrl = "";
let requestOptions = null;
const result = await sendDiscordWebhookMessage({
  webhookUrl: validWebhookUrl,
  message: "A test message",
  fetchImpl: async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return {
      ok: true,
      status: 200,
      async json() {
        return { id: "discord-message-1" };
      },
    };
  },
});

assert.equal(requestUrl, `${validWebhookUrl}?wait=true`);
assert.equal(requestOptions.method, "POST");
assert.equal(requestOptions.redirect, "error");
assert.deepEqual(JSON.parse(requestOptions.body), {
  content: "A test message",
  allowed_mentions: { parse: [] },
});
assert.equal(result.ok, true);
assert.equal(result.messageId, "discord-message-1");

await assert.rejects(
  sendDiscordWebhookMessage({
    webhookUrl: validWebhookUrl,
    message: "A test message",
    fetchImpl: async () => ({ ok: false, status: 404 }),
  }),
  (error) => error.statusCode === 400 && /invalid, expired/.test(error.message),
);

await assert.rejects(
  sendDiscordWebhookMessage({
    webhookUrl: validWebhookUrl,
    message: "A test message",
    fetchImpl: async () => ({ ok: false, status: 429 }),
  }),
  (error) => error.statusCode === 429 && /rate limiting/.test(error.message),
);

const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");

assert.match(indexSource, /id="discordWebhookUrl"[\s\S]*?type="password"[\s\S]*?maxlength="600"/);
assert.match(indexSource, /id="discordMessage"[\s\S]*?maxlength="2000"/);
assert.match(indexSource, /id="discordSendStatus"[^>]*aria-live="polite"/);
assert.match(indexSource, /id="discordSendButton"[^>]*type="submit"/);
assert.match(appSource, /request\("\/api\/integrations\/discord\/send"/);
assert.match(appSource, /discordSendStatus\.textContent = "Message sent to Discord\.";/);
assert.match(
  serverSource,
  /url\.pathname === "\/api\/integrations\/discord\/send"[\s\S]*?handleDiscordWebhookSend\(req, res, auth\)/,
);
assert.match(serverSource, /MAX_DISCORD_SENDS_PER_WINDOW = 10/);
assert.match(styleSource, /\.discordComposerPanel\s*\{/);
assert.match(styleSource, /\.discordSendStatus\[data-state="success"\]\s*\{/);

console.log("Discord integration regression checks passed.");

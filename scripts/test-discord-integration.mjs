import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MAX_DISCORD_MESSAGE_LENGTH,
  normalizeDiscordMessage,
  normalizeDiscordWebhookUrl,
  sendDiscordWebhookAlert,
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

let alertPayload = null;
await sendDiscordWebhookAlert({
  webhookUrl: validWebhookUrl,
  alert: {
    title: "Purchase spike",
    description: "Purchases reached 25 in 15 min.",
    color: 0x7c3cff,
    timestamp: Date.UTC(2026, 6, 25, 12),
    fields: [
      { name: "Universe", value: "Demo universe" },
      { name: "Observed", value: "25 / 15 min" },
    ],
  },
  fetchImpl: async (_url, options) => {
    alertPayload = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      async json() {
        return { id: "discord-alert-1" };
      },
    };
  },
});
assert.equal(alertPayload.content, undefined);
assert.equal(alertPayload.username, "RoAnalytics");
assert.deepEqual(alertPayload.allowed_mentions, { parse: [] });
assert.equal(alertPayload.embeds[0].title, "Purchase spike");
assert.equal(alertPayload.embeds[0].description, "Purchases reached 25 in 15 min.");
assert.equal(alertPayload.embeds[0].color, 0x7c3cff);
assert.equal(alertPayload.embeds[0].fields.length, 2);
assert.equal(alertPayload.embeds[0].footer.text, "RoAnalytics");

let titleOnlyAlertPayload = null;
await sendDiscordWebhookAlert({
  webhookUrl: validWebhookUrl,
  alert: { title: "Title only" },
  fetchImpl: async (_url, options) => {
    titleOnlyAlertPayload = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      async json() {
        return { id: "discord-alert-2" };
      },
    };
  },
});
assert.equal(Object.hasOwn(titleOnlyAlertPayload.embeds[0], "description"), false);

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

assert.match(indexSource, /id="discordConnectionForm"[\s\S]*?id="discordWebhookUrl"[\s\S]*?type="password"[\s\S]*?maxlength="600"/);
assert.match(indexSource, /id="discordNewWebhookButton"[\s\S]*?id="discordWebhookCatalog"[\s\S]*?id="discordWebhookEditorTitle"[\s\S]*?id="discordWebhookName"[\s\S]*?id="discordWebhookUrl"/);
assert.match(indexSource, /id="discordSendStatus"[^>]*aria-live="polite"/);
assert.match(indexSource, /id="discordTestButton"[^>]*type="button"/);
assert.match(indexSource, /id="discordNewRuleButton"[^>]*type="button"/);
assert.match(indexSource, /id="discordTopbarActions"[\s\S]*?id="discordTestButton"[\s\S]*?id="discordDisconnectButton"[\s\S]*?id="discordNewRuleButton"/);
assert.match(
  appSource,
  /discordTopbarActions\.hidden = activeView !== "discord" \|\| discordCreatingWebhook \|\| !selectedWebhook/,
);
assert.match(styleSource, /\.discordTopbarActions\s*\{[\s\S]*?display:\s*none/);
assert.match(
  styleSource,
  /body\[data-active-view="discord"\] \.discordTopbarActions:not\(\[hidden\]\)\s*\{[\s\S]*?display:\s*flex/,
);
assert.match(indexSource, /class="discordRuleTableHeader"[\s\S]*?>Name<[\s\S]*?>Condition<[\s\S]*?>Current<[\s\S]*?>Cooldown<[\s\S]*?>Actions</);
assert.doesNotMatch(indexSource, />Topic name</);
assert.doesNotMatch(indexSource, /Automatic monitoring|<h2>Alert rules<\/h2>/);
assert.match(indexSource, /id="discordRuleForm"[\s\S]*?id="discordRuleTriggerType"[\s\S]*?id="discordRuleEvent"[\s\S]*?id="discordRuleThreshold"[\s\S]*?id="discordRuleCooldown"[\s\S]*?id="discordRuleScheduleDate"[\s\S]*?id="discordRuleScheduleTime"/);
assert.match(indexSource, /class="discordWebhookBuilderBackButton discordRuleBackButton"[^>]*id="discordRuleCloseButton"[\s\S]*?<path d="m15 5-7 7 7 7"/);
assert.match(indexSource, />Eastern Standard Time</);
assert.match(indexSource, /class="discordMessagePreview"[\s\S]*?class="discordMessageMeta"[\s\S]*?>RoAnalytics<[\s\S]*?>APP<[\s\S]*?id="discordAlertPreviewEmbed"[\s\S]*?id="discordAlertPreviewFields"[\s\S]*?>RoAnalytics<[\s\S]*?id="discordPreviewEmbedTime"/);
assert.match(indexSource, /id="discordAlertPreviewMessage" hidden/);
assert.match(indexSource, /\{\{game\}\}[\s\S]*?\{\{event\}\}[\s\S]*?\{\{count\}\}[\s\S]*?\{\{threshold\}\}/);
assert.doesNotMatch(indexSource, /id="discordMessage"/);
assert.match(appSource, /request\(`\/api\/integrations\/discord\?universeId=/);
assert.match(appSource, /request\("\/api\/integrations\/discord\/connection"/);
assert.match(appSource, /request\("\/api\/integrations\/discord\/connection\/select"/);
assert.match(appSource, /request\("\/api\/integrations\/discord\/test"/);
assert.match(appSource, /request\(id[\s\S]*?"\/api\/integrations\/discord\/rules"/);
assert.match(appSource, /function renderDiscordRuleRow\(rule\)/);
assert.match(appSource, /function renderDiscordConnectionEditor\(\)/);
assert.match(appSource, /function startNewDiscordWebhook\(\)/);
assert.match(appSource, /data-discord-webhook-id=/);
assert.match(appSource, /webhookId:\s*getEditingDiscordWebhook\(\)\?\.id \|\| ""/);
assert.match(appSource, /function easternDateTimeInputToTimestamp\(value\)/);
assert.match(appSource, /function getDiscordPageHeading\(\)[\s\S]*?getEditingDiscordWebhook\(\)\?\.name/);
assert.match(appSource, /class="discordRuleCondition"[\s\S]*?class="discordRuleMetric"[\s\S]*?formatCompactNumber\(rule\.currentCount \|\| 0\)[\s\S]*?class="discordRuleMetric"[\s\S]*?formatDiscordAlertWindow\(rule\.cooldownMinutes\)/);
assert.doesNotMatch(appSource, /statusLabel} · \$\{lastSent}/);
assert.match(appSource, /function updateDiscordRulePreview\(\)[\s\S]*?name: "Universe"[\s\S]*?name: "Webhook"[\s\S]*?name: "Event"[\s\S]*?name: "Observed"[\s\S]*?name: "Rule"/);
assert.match(appSource, /name: "Scheduled time"[\s\S]*?Eastern Standard Time/);
assert.match(appSource, /discordAlertPreviewMessage\.hidden = !previewMessage/);
assert.match(
  serverSource,
  /url\.pathname === "\/api\/integrations\/discord"[\s\S]*?handleDiscordIntegrationGet\(req, res, auth, url\.searchParams\)/,
);
assert.match(serverSource, /url\.pathname === "\/api\/integrations\/discord\/connection"[\s\S]*?handleDiscordConnectionSave\(req, res, auth\)/);
assert.match(serverSource, /url\.pathname === "\/api\/integrations\/discord\/connection\/select"[\s\S]*?handleDiscordConnectionSelect\(req, res, auth\)/);
assert.match(serverSource, /url\.pathname === "\/api\/integrations\/discord\/test"[\s\S]*?handleDiscordConnectionTest\(req, res, auth\)/);
assert.match(serverSource, /function normalizeDiscordAlertRule\(value, existingRule = null, integration = null\)/);
assert.match(serverSource, /const MAX_DISCORD_WEBHOOKS_PER_UNIVERSE = 10/);
assert.match(serverSource, /function normalizeStoredDiscordIntegration\(integration\)/, "legacy single-webhook records should migrate to named webhooks");
assert.match(serverSource, /webhooks:\s*webhooks\.map\(\(webhook\) => \(\{/);
assert.match(serverSource, /rule\.webhookId === webhookId[\s\S]*?enabled:\s*false[\s\S]*?Select a delivery webhook/, "deleting a webhook should pause rather than silently reroute assigned rules");
assert.match(serverSource, /getStoredDiscordWebhookUrl\(integration, rule\.webhookId\)/, "each rule should deliver through its assigned webhook");
assert.match(serverSource, /createCipheriv\("aes-256-gcm"/, "saved webhook URLs should be encrypted at rest");
assert.match(serverSource, /evaluateDiscordAlertsForPresence\(presence\.value, project\)/, "incoming Roblox data should evaluate saved Discord alerts");
assert.match(serverSource, /countDiscordAlertEvents\(/, "rules should use actual stored analytics event counts");
assert.match(serverSource, /sendDiscordWebhookAlert\(\{[\s\S]*?Observed[\s\S]*?Rule/, "automatic deliveries should be structured analytics alerts");
assert.match(serverSource, /function renderDiscordAlertMessage[\s\S]*?if \(!template\) return "";/, "event alerts should omit automatic title subtext");
assert.match(serverSource, /function renderScheduledDiscordAlertMessage[\s\S]*?if \(!template\) return "";/, "scheduled alerts should omit automatic title subtext");
assert.match(serverSource, /function evaluateScheduledDiscordAlerts\(\)/, "scheduled Discord alerts should run independently of incoming analytics");
assert.match(serverSource, /scheduleDeliveredAt[\s\S]*?scheduled_alert/, "one-time schedules should persist completion and delivery history");
assert.match(serverSource, /timeZone:\s*"America\/New_York"/, "scheduled alerts should use Eastern Time");
assert.match(serverSource, /Scheduled time"[\s\S]*?Eastern Standard Time/, "the scheduled preview and delivered embed should use the same timezone copy");
assert.match(serverSource, /MAX_DISCORD_SENDS_PER_WINDOW = 10/);
assert.match(serverSource, /MAX_DISCORD_ALERT_RULES_PER_UNIVERSE = 20/);
assert.match(styleSource, /\.discordConnectionPanel,/);
assert.match(styleSource, /\.discordWebhookCatalogPanel\s*\{/);
assert.match(styleSource, /\.discordWorkspace\s*\{/);
assert.match(styleSource, /\.discordRuleTableHeader,/);
assert.match(styleSource, /\.discordRuleRow\s*\{/);
assert.match(styleSource, /\.discordRuleToggle\s*\{[\s\S]*?width:\s*64px;[\s\S]*?min-width:\s*64px;/);
assert.match(styleSource, /\.discordMessagePreview\s*\{/);
assert.match(styleSource, /\.discordMessageMeta\s*\{/);
assert.match(styleSource, /\.discordAlertPreviewFields\s*\{/);
assert.match(styleSource, /\.discordAlertPreview\s*\{/);
assert.match(styleSource, /\.discordSendStatus\[data-state="success"\]\s*\{/);

console.log("Discord integration regression checks passed.");

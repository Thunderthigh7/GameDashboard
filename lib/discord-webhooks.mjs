const DISCORD_WEBHOOK_HOSTS = new Set([
  "discord.com",
  "canary.discord.com",
  "ptb.discord.com",
  "discordapp.com",
  "canary.discordapp.com",
  "ptb.discordapp.com",
]);

const DISCORD_WEBHOOK_PATH_PATTERN =
  /^\/api(?:\/v\d{1,2})?\/webhooks\/\d{15,22}\/[A-Za-z0-9._-]{20,}\/?$/;

export const MAX_DISCORD_MESSAGE_LENGTH = 2000;

export function normalizeDiscordWebhookUrl(value) {
  const rawUrl = typeof value === "string" ? value.trim() : "";
  if (!rawUrl) throw createDiscordWebhookError("Enter a Discord webhook URL.", 400);
  if (rawUrl.length > 600) throw createDiscordWebhookError("That Discord webhook URL is too long.", 400);

  let webhookUrl;
  try {
    webhookUrl = new URL(rawUrl);
  } catch {
    throw createDiscordWebhookError("Enter a valid Discord webhook URL.", 400);
  }

  const hostname = webhookUrl.hostname.toLowerCase();
  if (webhookUrl.protocol !== "https:" || !DISCORD_WEBHOOK_HOSTS.has(hostname)) {
    throw createDiscordWebhookError("Use a webhook URL copied directly from Discord.", 400);
  }
  if (webhookUrl.username || webhookUrl.password || webhookUrl.hash || (webhookUrl.port && webhookUrl.port !== "443")) {
    throw createDiscordWebhookError("Use a webhook URL copied directly from Discord.", 400);
  }
  if (!DISCORD_WEBHOOK_PATH_PATTERN.test(webhookUrl.pathname)) {
    throw createDiscordWebhookError("That Discord webhook URL is not valid.", 400);
  }

  const normalizedUrl = new URL(`${webhookUrl.origin}${webhookUrl.pathname}`);
  normalizedUrl.searchParams.set("wait", "true");
  return normalizedUrl.toString();
}

export function normalizeDiscordMessage(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw createDiscordWebhookError("Write a message before sending.", 400);
  }
  if (value.length > MAX_DISCORD_MESSAGE_LENGTH) {
    throw createDiscordWebhookError(
      `Discord messages can contain up to ${MAX_DISCORD_MESSAGE_LENGTH.toLocaleString("en-US")} characters.`,
      400,
    );
  }
  return value;
}

export async function sendDiscordWebhookMessage({
  webhookUrl,
  message,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const content = normalizeDiscordMessage(message);
  return sendDiscordWebhookPayload({
    webhookUrl,
    payload: {
      content,
      allowed_mentions: { parse: [] },
    },
    fetchImpl,
    timeoutMs,
  });
}

export async function sendDiscordWebhookAlert({
  webhookUrl,
  alert,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const title = cleanDiscordText(alert?.title, 256) || "RoAnalytics alert";
  const description = cleanDiscordText(alert?.description, 2000) || "An analytics alert was triggered.";
  const fields = Array.isArray(alert?.fields)
    ? alert.fields.slice(0, 8).map((field) => ({
      name: cleanDiscordText(field?.name, 256) || "Metric",
      value: cleanDiscordText(field?.value, 1024) || "--",
      inline: field?.inline !== false,
    }))
    : [];
  const rawColor = Number(alert?.color);
  const color = Number.isSafeInteger(rawColor) && rawColor >= 0 && rawColor <= 0xffffff
    ? rawColor
    : 0x7c3cff;
  const timestampMs = Number(alert?.timestamp);

  return sendDiscordWebhookPayload({
    webhookUrl,
    payload: {
      embeds: [{
        title,
        description,
        color,
        fields,
        timestamp: new Date(Number.isFinite(timestampMs) && timestampMs > 0 ? timestampMs : Date.now()).toISOString(),
        footer: { text: "RoAnalytics" },
      }],
      allowed_mentions: { parse: [] },
    },
    fetchImpl,
    timeoutMs,
  });
}

async function sendDiscordWebhookPayload({
  webhookUrl,
  payload,
  fetchImpl,
  timeoutMs,
}) {
  const targetUrl = normalizeDiscordWebhookUrl(webhookUrl);
  let response;
  try {
    response = await fetchImpl(targetUrl, {
      method: "POST",
      redirect: "error",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "RoAnalytics-Discord-Integration/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw createDiscordWebhookError(
      timedOut
        ? "Discord took too long to respond. Try again."
        : "Could not reach Discord. Try again.",
      timedOut ? 504 : 502,
    );
  }

  if (!response.ok) {
    throw mapDiscordResponseError(response.status);
  }

  let messageId = "";
  try {
    const payload = await response.json();
    messageId = typeof payload?.id === "string" ? payload.id : "";
  } catch {
    // A successful webhook response does not need a body.
  }

  return {
    ok: true,
    sentAt: Date.now(),
    messageId,
  };
}

function cleanDiscordText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function mapDiscordResponseError(status) {
  if (status === 400) {
    return createDiscordWebhookError("Discord rejected this message. Check the message and try again.", 400);
  }
  if (status === 401 || status === 403 || status === 404) {
    return createDiscordWebhookError("This webhook is invalid, expired, or no longer has access.", 400);
  }
  if (status === 429) {
    return createDiscordWebhookError("Discord is rate limiting this webhook. Wait a moment and try again.", 429);
  }
  return createDiscordWebhookError("Discord could not send the message. Try again.", 502);
}

function createDiscordWebhookError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export const ROBLOX_LIVE_ACTION_TOPIC = "roanalytics-live-actions-v1";
export const ROBLOX_LIVE_ACTION_MESSAGE_TYPE = "roanalytics.live_action";
export const MAX_ROBLOX_MESSAGE_BYTES = 1024;
export const MAX_ROBLOX_ACTION_KEY_LENGTH = 64;
export const MAX_ROBLOX_ACTION_PARAMETER_BYTES = 512;

export function normalizeRobloxActionKey(value) {
  const actionKey = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[a-z][a-z0-9_.:-]{0,63}$/.test(actionKey)) {
    throw createRobloxLiveActionError(
      "Action keys must start with a letter and use only letters, numbers, _, ., :, or -.",
      400,
    );
  }
  return actionKey;
}

export function normalizeRobloxActionParameters(value) {
  if (value === undefined || value === null || value === "") return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createRobloxLiveActionError("Action parameters must be a JSON object.", 400);
  }

  const seen = new Set();
  let propertyCount = 0;
  const visit = (entry, depth) => {
    if (entry === null || typeof entry === "string" || typeof entry === "boolean") {
      if (typeof entry === "string" && entry.length > 240) {
        throw createRobloxLiveActionError("Parameter strings can contain up to 240 characters.", 400);
      }
      return entry;
    }
    if (typeof entry === "number") {
      if (!Number.isFinite(entry)) {
        throw createRobloxLiveActionError("Parameter numbers must be finite.", 400);
      }
      return entry;
    }
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw createRobloxLiveActionError(
        "Parameters support JSON objects with string, number, boolean, or null values.",
        400,
      );
    }
    if (depth >= 3 || seen.has(entry)) {
      throw createRobloxLiveActionError("Action parameters can be nested up to 3 levels.", 400);
    }
    seen.add(entry);
    const normalized = {};
    for (const [rawKey, rawValue] of Object.entries(entry)) {
      const key = String(rawKey || "").trim();
      if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key)) {
        throw createRobloxLiveActionError(
          "Parameter names must start with a letter and use only letters, numbers, or _.",
          400,
        );
      }
      propertyCount += 1;
      if (propertyCount > 20) {
        throw createRobloxLiveActionError("An action can contain up to 20 parameters.", 400);
      }
      normalized[key] = visit(rawValue, depth + 1);
    }
    seen.delete(entry);
    return normalized;
  };

  const normalized = visit(value, 0);
  if (Buffer.byteLength(JSON.stringify(normalized), "utf8") > MAX_ROBLOX_ACTION_PARAMETER_BYTES) {
    throw createRobloxLiveActionError(
      `Action parameters can contain up to ${MAX_ROBLOX_ACTION_PARAMETER_BYTES} bytes.`,
      400,
    );
  }
  return normalized;
}

export function buildRobloxLiveActionMessage({
  deliveryId,
  universeId,
  ruleId = "",
  actionKey,
  parameters = {},
  sentAt = Date.now(),
  expiresInSeconds = 60,
  trigger = "manual",
} = {}) {
  const cleanDeliveryId = typeof deliveryId === "string" ? deliveryId.trim().slice(0, 120) : "";
  const cleanUniverseId = Number(universeId);
  const cleanSentAt = Number(sentAt);
  const cleanExpiry = Number(expiresInSeconds);
  if (!cleanDeliveryId) throw createRobloxLiveActionError("A delivery ID is required.", 500);
  if (!Number.isSafeInteger(cleanUniverseId) || cleanUniverseId <= 0) {
    throw createRobloxLiveActionError("A valid universe ID is required.", 400);
  }
  if (!Number.isFinite(cleanSentAt) || cleanSentAt <= 0) {
    throw createRobloxLiveActionError("A valid send time is required.", 500);
  }
  if (!Number.isSafeInteger(cleanExpiry) || cleanExpiry < 15 || cleanExpiry > 900) {
    throw createRobloxLiveActionError("Message expiry must be between 15 seconds and 15 minutes.", 400);
  }

  const payload = {
    type: ROBLOX_LIVE_ACTION_MESSAGE_TYPE,
    version: 1,
    deliveryId: cleanDeliveryId,
    universeId: cleanUniverseId,
    ruleId: typeof ruleId === "string" ? ruleId.trim().slice(0, 120) : "",
    actionKey: normalizeRobloxActionKey(actionKey),
    parameters: normalizeRobloxActionParameters(parameters),
    trigger: typeof trigger === "string" ? trigger.trim().slice(0, 32) : "manual",
    sentAt: Math.floor(cleanSentAt / 1000),
    expiresAt: Math.floor(cleanSentAt / 1000) + cleanExpiry,
  };
  const message = JSON.stringify(payload);
  if (Buffer.byteLength(message, "utf8") > MAX_ROBLOX_MESSAGE_BYTES) {
    throw createRobloxLiveActionError(
      `Roblox messages can contain up to ${MAX_ROBLOX_MESSAGE_BYTES.toLocaleString("en-US")} bytes.`,
      400,
    );
  }
  return { message, payload };
}

export async function publishRobloxUniverseMessage({
  accessToken,
  universeId,
  topic = ROBLOX_LIVE_ACTION_TOPIC,
  message,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const cleanAccessToken = typeof accessToken === "string" ? accessToken.trim() : "";
  const cleanUniverseId = Number(universeId);
  const cleanTopic = typeof topic === "string" ? topic.trim() : "";
  const cleanMessage = typeof message === "string" ? message : "";
  if (!cleanAccessToken) throw createRobloxLiveActionError("Roblox live actions need authorization.", 401);
  if (!Number.isSafeInteger(cleanUniverseId) || cleanUniverseId <= 0) {
    throw createRobloxLiveActionError("A valid universe ID is required.", 400);
  }
  if (!/^[A-Za-z0-9._:-]{1,80}$/.test(cleanTopic)) {
    throw createRobloxLiveActionError("The Roblox messaging topic is invalid.", 500);
  }
  if (!cleanMessage || Buffer.byteLength(cleanMessage, "utf8") > MAX_ROBLOX_MESSAGE_BYTES) {
    throw createRobloxLiveActionError(
      `Roblox messages can contain up to ${MAX_ROBLOX_MESSAGE_BYTES.toLocaleString("en-US")} bytes.`,
      400,
    );
  }

  let response;
  try {
    response = await fetchImpl(
      `https://apis.roblox.com/cloud/v2/universes/${encodeURIComponent(String(cleanUniverseId))}:publishMessage`,
      {
        method: "POST",
        redirect: "error",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${cleanAccessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "RoAnalytics-Live-Actions/1.0",
        },
        body: JSON.stringify({ topic: cleanTopic, message: cleanMessage }),
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw createRobloxLiveActionError(
      timedOut ? "Roblox took too long to accept the action." : "Could not reach Roblox Open Cloud.",
      timedOut ? 504 : 502,
    );
  }

  if (!response.ok) {
    const payload = await readOptionalJson(response);
    const providerMessage = getRobloxErrorMessage(payload);
    if (response.status === 401 || response.status === 403) {
      throw createRobloxLiveActionError(
        providerMessage || "Roblox authorization expired or does not include this universe.",
        401,
      );
    }
    if (response.status === 429) {
      throw createRobloxLiveActionError("Roblox is rate limiting live actions. Try again shortly.", 429);
    }
    throw createRobloxLiveActionError(
      providerMessage || "Roblox did not accept the live action.",
      response.status >= 400 && response.status <= 599 ? response.status : 502,
    );
  }

  return { ok: true, publishedAt: Date.now() };
}

export async function refreshRobloxOAuthTokens({
  refreshToken,
  clientId,
  clientSecret,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  return requestRobloxOAuthToken({
    body: new URLSearchParams({
      client_id: String(clientId || ""),
      client_secret: String(clientSecret || ""),
      grant_type: "refresh_token",
      refresh_token: String(refreshToken || ""),
    }),
    fetchImpl,
    timeoutMs,
  });
}

export async function getRobloxOAuthTokenResources({
  accessToken,
  clientId,
  clientSecret,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const response = await fetchWithTimeout(
    "https://apis.roblox.com/oauth/v1/token/resources",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token: String(accessToken || ""),
        client_id: String(clientId || ""),
        client_secret: String(clientSecret || ""),
      }),
    },
    fetchImpl,
    timeoutMs,
  );
  const payload = await readOptionalJson(response);
  if (!response.ok) {
    throw createRobloxLiveActionError(
      getRobloxErrorMessage(payload) || "Could not verify the universes authorized for live actions.",
      response.status === 401 || response.status === 403 ? 401 : 502,
    );
  }
  return payload;
}

export async function revokeRobloxOAuthToken({
  token,
  clientId,
  clientSecret,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const response = await fetchWithTimeout(
    "https://apis.roblox.com/oauth/v1/token/revoke",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token: String(token || ""),
        client_id: String(clientId || ""),
        client_secret: String(clientSecret || ""),
      }),
    },
    fetchImpl,
    timeoutMs,
  );
  if (!response.ok) {
    const payload = await readOptionalJson(response);
    throw createRobloxLiveActionError(
      getRobloxErrorMessage(payload) || "Roblox authorization could not be revoked.",
      response.status === 401 || response.status === 403 ? 401 : 502,
    );
  }
  return { ok: true };
}

async function requestRobloxOAuthToken({ body, fetchImpl, timeoutMs }) {
  const response = await fetchWithTimeout(
    "https://apis.roblox.com/oauth/v1/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
    fetchImpl,
    timeoutMs,
  );
  const payload = await readOptionalJson(response);
  if (!response.ok) {
    throw createRobloxLiveActionError(
      getRobloxErrorMessage(payload) || "Roblox authorization could not be refreshed.",
      response.status === 400 || response.status === 401 ? 401 : 502,
    );
  }
  if (!payload?.access_token || !payload?.refresh_token) {
    throw createRobloxLiveActionError("Roblox did not return renewable authorization.", 502);
  }
  return payload;
}

async function fetchWithTimeout(url, options, fetchImpl, timeoutMs) {
  try {
    return await fetchImpl(url, {
      ...options,
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw createRobloxLiveActionError(
      timedOut ? "Roblox took too long to respond." : "Could not reach Roblox Open Cloud.",
      timedOut ? 504 : 502,
    );
  }
}

async function readOptionalJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getRobloxErrorMessage(payload) {
  return String(
    payload?.error_description
    || payload?.message
    || payload?.error?.message
    || payload?.error
    || "",
  ).trim().slice(0, 240);
}

function createRobloxLiveActionError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

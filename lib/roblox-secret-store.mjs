import sodium from "libsodium-wrappers";

export const ROANALYTICS_SECRET_NAME = "ROANALYTICS_SECRET";

export async function upsertRobloxUniverseSecret({
  accessToken,
  universeId,
  secretId = ROANALYTICS_SECRET_NAME,
  secretValue,
  domain,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const cleanAccessToken = normalizeAccessToken(accessToken);
  const cleanUniverseId = normalizeUniverseId(universeId);
  const cleanSecretId = normalizeSecretId(secretId);
  const cleanSecretValue = normalizeSecretValue(secretValue);
  const cleanDomain = normalizeSecretDomain(domain);
  const publicKey = await getRobloxUniverseSecretPublicKey({
    accessToken: cleanAccessToken,
    universeId: cleanUniverseId,
    fetchImpl,
    timeoutMs,
  });
  const encryptedSecret = await sealRobloxSecret(cleanSecretValue, publicKey.secret);
  const updatePayload = {
    secret: encryptedSecret,
    key_id: publicKey.keyId,
    domain: cleanDomain,
  };
  const secretUrl = getSecretUrl(cleanUniverseId, cleanSecretId);
  const updateResponse = await requestRobloxSecretStore(secretUrl, {
    method: "PATCH",
    accessToken: cleanAccessToken,
    body: updatePayload,
    fetchImpl,
    timeoutMs,
    allowNotFound: true,
  });

  if (updateResponse.response.ok) {
    return {
      ok: true,
      operation: "updated",
      secretId: cleanSecretId,
      domain: cleanDomain,
      provider: updateResponse.payload,
    };
  }

  const createResponse = await requestRobloxSecretStore(getSecretsUrl(cleanUniverseId), {
    method: "POST",
    accessToken: cleanAccessToken,
    body: {
      id: cleanSecretId,
      ...updatePayload,
    },
    fetchImpl,
    timeoutMs,
    allowConflict: true,
  });
  if (createResponse.response.ok) {
    return {
      ok: true,
      operation: "created",
      secretId: cleanSecretId,
      domain: cleanDomain,
      provider: createResponse.payload,
    };
  }

  // A concurrent setup may have created the fixed-name secret after our PATCH.
  const retryResponse = await requestRobloxSecretStore(secretUrl, {
    method: "PATCH",
    accessToken: cleanAccessToken,
    body: updatePayload,
    fetchImpl,
    timeoutMs,
  });
  return {
    ok: true,
    operation: "updated",
    secretId: cleanSecretId,
    domain: cleanDomain,
    provider: retryResponse.payload,
  };
}

export async function deleteRobloxUniverseSecret({
  accessToken,
  universeId,
  secretId = ROANALYTICS_SECRET_NAME,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const cleanAccessToken = normalizeAccessToken(accessToken);
  const cleanUniverseId = normalizeUniverseId(universeId);
  const cleanSecretId = normalizeSecretId(secretId);
  const result = await requestRobloxSecretStore(getSecretUrl(cleanUniverseId, cleanSecretId), {
    method: "DELETE",
    accessToken: cleanAccessToken,
    fetchImpl,
    timeoutMs,
    allowNotFound: true,
  });
  return {
    ok: result.response.ok || result.response.status === 404,
    deleted: result.response.ok,
    secretId: cleanSecretId,
  };
}

export async function getRobloxUniverseSecretPublicKey({
  accessToken,
  universeId,
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const cleanAccessToken = normalizeAccessToken(accessToken);
  const cleanUniverseId = normalizeUniverseId(universeId);
  const result = await requestRobloxSecretStore(
    `${getSecretsUrl(cleanUniverseId)}/public-key`,
    {
      method: "GET",
      accessToken: cleanAccessToken,
      fetchImpl,
      timeoutMs,
    },
  );
  const publicKey = typeof result.payload?.secret === "string" ? result.payload.secret.trim() : "";
  const keyId = String(result.payload?.key_id || "").trim();
  if (!publicKey || !keyId) {
    throw createRobloxSecretStoreError("Roblox returned an invalid Secrets Store public key.", 502);
  }
  return { secret: publicKey, keyId };
}

export async function sealRobloxSecret(secretValue, publicKeyBase64) {
  const cleanSecretValue = normalizeSecretValue(secretValue);
  const cleanPublicKey = typeof publicKeyBase64 === "string" ? publicKeyBase64.trim() : "";
  if (!cleanPublicKey) {
    throw createRobloxSecretStoreError("Roblox Secrets Store public key is missing.", 502);
  }

  try {
    await sodium.ready;
    const publicKey = sodium.from_base64(cleanPublicKey, sodium.base64_variants.ORIGINAL);
    const encrypted = sodium.crypto_box_seal(
      sodium.from_string(cleanSecretValue),
      publicKey,
    );
    return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
  } catch {
    throw createRobloxSecretStoreError("Could not encrypt the Roblox project secret.", 500);
  }
}

async function requestRobloxSecretStore(url, {
  method,
  accessToken,
  body,
  fetchImpl,
  timeoutMs,
  allowNotFound = false,
  allowConflict = false,
}) {
  let response;
  try {
    response = await fetchImpl(url, {
      method,
      redirect: "error",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
        "User-Agent": "RoAnalytics-Secret-Installer/1.0",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw createRobloxSecretStoreError(
      timedOut
        ? "Roblox took too long to install the project secret."
        : "Could not reach Roblox Secrets Store.",
      timedOut ? 504 : 502,
    );
  }

  const payload = await readOptionalJson(response);
  if (
    response.ok
    || (allowNotFound && response.status === 404)
    || (allowConflict && response.status === 409)
  ) {
    return { response, payload };
  }

  const providerMessage = getRobloxErrorMessage(payload);
  if (response.status === 401 || response.status === 403) {
    throw createRobloxSecretStoreError(
      providerMessage || "Roblox authorization expired or does not include Secrets Store access.",
      401,
    );
  }
  if (response.status === 429) {
    throw createRobloxSecretStoreError("Roblox is rate limiting secret setup. Try again shortly.", 429);
  }
  throw createRobloxSecretStoreError(
    providerMessage || "Roblox did not accept the project secret.",
    response.status >= 400 && response.status <= 599 ? response.status : 502,
  );
}

async function readOptionalJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 240) };
  }
}

function getRobloxErrorMessage(payload) {
  if (!payload || typeof payload !== "object") return "";
  if (typeof payload.message === "string") return payload.message.trim();
  if (typeof payload.error === "string") return payload.error.trim();
  if (typeof payload.error?.message === "string") return payload.error.message.trim();
  if (Array.isArray(payload.errors)) {
    const first = payload.errors.find((entry) => typeof entry?.message === "string");
    if (first) return first.message.trim();
  }
  return "";
}

function normalizeAccessToken(value) {
  const accessToken = typeof value === "string" ? value.trim() : "";
  if (!accessToken) throw createRobloxSecretStoreError("Roblox Secrets Store needs authorization.", 401);
  return accessToken;
}

function normalizeUniverseId(value) {
  const universeId = Number(value);
  if (!Number.isSafeInteger(universeId) || universeId <= 0) {
    throw createRobloxSecretStoreError("A valid Roblox universe ID is required.", 400);
  }
  return universeId;
}

function normalizeSecretId(value) {
  const secretId = typeof value === "string" ? value.trim() : "";
  if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(secretId)) {
    throw createRobloxSecretStoreError("The Roblox secret name is invalid.", 500);
  }
  return secretId;
}

function normalizeSecretValue(value) {
  const secretValue = typeof value === "string" ? value : "";
  if (!secretValue || Buffer.byteLength(secretValue, "utf8") > 1024) {
    throw createRobloxSecretStoreError("The Roblox project secret is invalid.", 500);
  }
  return secretValue;
}

function normalizeSecretDomain(value) {
  const domain = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!domain || domain.includes("://") || domain.includes("/") || domain.length > 253) {
    throw createRobloxSecretStoreError("The Roblox secret domain is invalid.", 500);
  }
  return domain;
}

function getSecretsUrl(universeId) {
  return `https://apis.roblox.com/cloud/v2/universes/${encodeURIComponent(String(universeId))}/secrets`;
}

function getSecretUrl(universeId, secretId) {
  return `${getSecretsUrl(universeId)}/${encodeURIComponent(secretId)}`;
}

function createRobloxSecretStoreError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

import crypto from "node:crypto";

const PROJECT_SECRET_PREFIX = "roa_";
const PROJECT_SECRET_BYTES = 24;

export function normalizeProjectSecret(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function generateProjectSecret() {
  return `${PROJECT_SECRET_PREFIX}${crypto.randomBytes(PROJECT_SECRET_BYTES).toString("base64url")}`;
}

export function hashProjectSecret(secret) {
  return crypto
    .createHash("sha256")
    .update(normalizeProjectSecret(secret))
    .digest("base64url");
}

export function verifyProjectSecret(secret, storedHash) {
  const candidate = hashProjectSecret(secret);
  const normalizedStoredHash = typeof storedHash === "string" ? storedHash : "";
  if (Buffer.byteLength(candidate) !== Buffer.byteLength(normalizedStoredHash)) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(normalizedStoredHash));
}

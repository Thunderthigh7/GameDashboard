import { S3Client } from "@aws-sdk/client-s3";

let s3Client = null;
let s3ClientConfigKey = "";

export function getObjectStorageConfig() {
  const bucketName = process.env.B2_BUCKET_NAME || "";
  const endpoint = cleanObjectStorageEndpoint(process.env.B2_ENDPOINT || process.env.B2_S3_ENDPOINT || "");
  const keyId = process.env.B2_KEY_ID || "";
  const applicationKey = process.env.B2_APPLICATION_KEY || "";
  const region = process.env.B2_REGION || getRegionFromB2Endpoint(endpoint) || "us-west-000";
  const connectionTimeoutMs = cleanBoundedInteger(process.env.B2_CONNECTION_TIMEOUT_MS, 5_000, 1_000, 60_000);
  const requestTimeoutMs = cleanBoundedInteger(process.env.B2_REQUEST_TIMEOUT_MS, 60_000, 5_000, 15 * 60_000);
  const socketTimeoutMs = cleanBoundedInteger(process.env.B2_SOCKET_TIMEOUT_MS, 30_000, 5_000, 15 * 60_000);
  const maxAttempts = cleanBoundedInteger(process.env.B2_MAX_ATTEMPTS, 3, 1, 10);

  return {
    bucketName,
    endpoint,
    keyId,
    applicationKey,
    region,
    connectionTimeoutMs,
    requestTimeoutMs,
    socketTimeoutMs,
    maxAttempts,
    configured: Boolean(bucketName && endpoint && keyId && applicationKey),
  };
}

export async function getObjectStorageClient() {
  const config = getObjectStorageConfig();
  if (!config.configured) {
    throw new Error("Backblaze B2 object storage is not configured. Set B2_BUCKET_NAME, B2_ENDPOINT, B2_KEY_ID, and B2_APPLICATION_KEY.");
  }

  const configKey = JSON.stringify([
    config.bucketName,
    config.endpoint,
    config.keyId,
    config.applicationKey,
    config.region,
    config.connectionTimeoutMs,
    config.requestTimeoutMs,
    config.socketTimeoutMs,
    config.maxAttempts,
  ]);

  if (!s3Client || s3ClientConfigKey !== configKey) {
    destroyObjectStorageClient();
    s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      maxAttempts: config.maxAttempts,
      requestHandler: {
        connectionTimeout: config.connectionTimeoutMs,
        requestTimeout: config.requestTimeoutMs,
        socketTimeout: config.socketTimeoutMs,
        throwOnRequestTimeout: true,
      },
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey,
      },
    });
    s3ClientConfigKey = configKey;
  }

  return s3Client;
}

export function destroyObjectStorageClient() {
  if (s3Client) {
    s3Client.destroy();
    s3Client = null;
  }
  s3ClientConfigKey = "";
}

export function cleanObjectStorageEndpoint(value) {
  const endpoint = String(value || "").trim().replace(/\/+$/, "");
  if (!endpoint) return "";
  return /^https?:\/\//i.test(endpoint) ? endpoint : `https://${endpoint}`;
}

export function getRegionFromB2Endpoint(endpoint) {
  const match = String(endpoint || "").match(/s3[.]([a-z0-9-]+)[.]backblazeb2[.]com/i);
  return match ? match[1] : "";
}

function cleanBoundedInteger(value, fallback, minimum, maximum) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

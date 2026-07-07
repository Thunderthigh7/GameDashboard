import { S3Client } from "@aws-sdk/client-s3";

let s3ClientPromise = null;

export function getObjectStorageConfig() {
  const bucketName = process.env.B2_BUCKET_NAME || "";
  const endpoint = cleanObjectStorageEndpoint(process.env.B2_ENDPOINT || process.env.B2_S3_ENDPOINT || "");
  const keyId = process.env.B2_KEY_ID || "";
  const applicationKey = process.env.B2_APPLICATION_KEY || "";
  const region = process.env.B2_REGION || getRegionFromB2Endpoint(endpoint) || "us-west-000";

  return {
    bucketName,
    endpoint,
    keyId,
    applicationKey,
    region,
    configured: Boolean(bucketName && endpoint && keyId && applicationKey),
  };
}

export async function getObjectStorageClient() {
  const config = getObjectStorageConfig();
  if (!config.configured) {
    throw new Error("Backblaze B2 object storage is not configured. Set B2_BUCKET_NAME, B2_ENDPOINT, B2_KEY_ID, and B2_APPLICATION_KEY.");
  }

  if (!s3ClientPromise) {
    s3ClientPromise = Promise.resolve(new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.keyId,
        secretAccessKey: config.applicationKey,
      },
    }));
  }

  return s3ClientPromise;
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


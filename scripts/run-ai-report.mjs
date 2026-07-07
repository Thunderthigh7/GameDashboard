import { loadLocalEnv } from "../lib/env.mjs";

loadLocalEnv();

const baseUrl = cleanBaseUrl(process.env.AI_REPORT_BASE_URL || process.env.PUBLIC_BASE_URL || "");
const secret = process.env.AI_REPORT_SECRET || process.env.PRESENCE_SECRET || process.env.DASHBOARD_PASSWORD || "";

if (!baseUrl) {
  throw new Error("Set AI_REPORT_BASE_URL or PUBLIC_BASE_URL to the dashboard URL.");
}

if (!secret) {
  throw new Error("Set AI_REPORT_SECRET or PRESENCE_SECRET for the scheduled AI report job.");
}

const response = await fetch(`${baseUrl}/api/ai-insights/auto-run`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Dashboard-Secret": secret,
  },
  body: JSON.stringify({ source: "cron" }),
});

const payload = await response.json().catch(() => ({}));
console.log(JSON.stringify(payload, null, 2));

if (!response.ok || payload.ok === false) {
  throw new Error(payload.error || `AI report job failed with ${response.status}`);
}

function cleanBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}


import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  normalizeEmailAddress,
  normalizeEmailSender,
  sendTransactionalEmail,
} from "../lib/email-delivery.mjs";

assert.equal(normalizeEmailAddress("Alerts+Live@Example.COM"), "Alerts+Live@example.com");
assert.equal(normalizeEmailSender("RoAnalytics <alerts@example.com>"), "RoAnalytics <alerts@example.com>");
for (const invalidAddress of ["", "missing-at.example.com", "a@localhost", "a b@example.com", "a@example.com\nBcc:x@example.com"]) {
  assert.throws(() => normalizeEmailAddress(invalidAddress), /email address/i);
}

let request = null;
const result = await sendTransactionalEmail({
  apiKey: "re_test",
  from: "RoAnalytics <alerts@example.com>",
  to: "owner@example.com",
  subject: "Purchase spike",
  message: "Purchases reached 100.",
  html: "<p>Purchases reached 100.</p>",
  idempotencyKey: "email-test-1",
  fetchImpl: async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "email-1" }),
    };
  },
});
assert.equal(request.url, "https://api.resend.com/emails");
assert.equal(request.options.headers.Authorization, "Bearer re_test");
assert.equal(request.options.headers["Idempotency-Key"], "email-test-1");
assert.deepEqual(JSON.parse(request.options.body), {
  from: "RoAnalytics <alerts@example.com>",
  to: ["owner@example.com"],
  subject: "Purchase spike",
  text: "Purchases reached 100.",
  html: "<p>Purchases reached 100.</p>",
});
assert.equal(result.emailId, "email-1");

await assert.rejects(
  sendTransactionalEmail({
    apiKey: "",
    from: "alerts@example.com",
    to: "owner@example.com",
    subject: "Test",
    message: "Test",
  }),
  /not configured/i,
);

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const envSource = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

assert.match(indexSource, /href="#email" data-dashboard-view="email"/);
assert.match(indexSource, /data-view-panel="email"/);
assert.match(indexSource, /id="emailConnectionForm"[\s\S]*?id="emailRecipientAddress"[\s\S]*?type="email"/);
assert.match(indexSource, /id="emailRuleForm"[\s\S]*?id="emailRuleRecipient"[\s\S]*?id="emailRuleSubject"[\s\S]*?id="emailRuleMessage"/);
assert.match(appSource, /request\(`\/api\/integrations\/email\?universeId=/);
assert.match(appSource, /request\("\/api\/integrations\/email\/recipient"/);
assert.match(appSource, /request\("\/api\/integrations\/email\/test"/);
assert.match(appSource, /function renderEmailRuleRow\(rule\)/);
assert.match(appSource, /subjectTemplate:\s*String\(emailRuleSubject\?\.value/);
assert.match(serverSource, /url\.pathname === "\/api\/integrations\/email"/);
assert.match(serverSource, /function encryptEmailRecipientAddress\(emailAddress\)/);
assert.match(serverSource, /createCipheriv\("aes-256-gcm"/);
assert.match(serverSource, /evaluateEmailAlertsForPresence\(presence\.value, project\)/);
assert.match(serverSource, /sendTransactionalEmail\(\{[\s\S]*?idempotencyKey:/);
assert.match(serverSource, /db\.collection\("email_integrations"\)/);
assert.match(styleSource, /\.emailComposerIcon\s*\{/);
assert.match(envSource, /RESEND_API_KEY=/);
assert.match(envSource, /EMAIL_FROM=RoAnalytics <alerts@example\.com>/);

console.log("Email integration regression checks passed.");

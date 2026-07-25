import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");

assert.match(indexSource, /data-dashboard-view="chat"[\s\S]*?<span>Chats<\/span>/);
assert.match(
  indexSource,
  /id="aiFeaturesNavLink"[\s\S]*?<span class="aiFeaturesNavLabel">AI Features<\/span>[\s\S]*?class="aiFeaturesAdminBadge"/,
);
assert.equal((indexSource.match(/id="commonQuestionList"/g) || []).length, 1);
assert.equal((indexSource.match(/id="aiChatMessages"/g) || []).length, 1);

const overviewStart = indexSource.indexOf('data-view-panel="overview"');
const aiRunsStart = indexSource.indexOf('data-view-panel="ai-runs"');
const eventsStart = indexSource.indexOf('data-view-panel="events"');
const chatsStart = indexSource.indexOf('data-view-panel="chat"');
const usageStart = indexSource.indexOf('data-view-panel="usage"');
const questionPanel = indexSource.indexOf("aiRunsQuestionPanel");

assert.ok(aiRunsStart >= 0 && questionPanel > aiRunsStart && questionPanel < eventsStart);
assert.ok(
  indexSource.indexOf("aiFeaturesChatPanel") > aiRunsStart
    && indexSource.indexOf("aiFeaturesChatPanel") < eventsStart,
  "AI chat should live inside AI Features",
);
assert.ok(
  !indexSource.slice(overviewStart, aiRunsStart).includes("chatBotPanel"),
  "Overview should no longer contain the AI chatbot",
);
assert.ok(!indexSource.slice(chatsStart, usageStart).includes("Top player questions"));
assert.match(appSource, /chat:\s*\{\s*title:\s*"Chats",\s*subtitle:\s*"",/);
assert.match(appSource, /"ai-runs":\s*\{\s*title:\s*"AI Features",/);
assert.match(appSource, /const ADMIN_ONLY_VIEWS = new Set\(\["ai-runs", "admin"\]\);/);
assert.match(
  appSource,
  /const lacksAdminAccess = ADMIN_ONLY_VIEWS\.has\(requestedView\) && !authenticatedUser\?\.isAdmin;[\s\S]*activeView = lacksAdminAccess \? "overview" : requestedView;/,
);
assert.match(
  appSource,
  /link\.dataset\.dashboardView === "ai-runs"[\s\S]*classList\.toggle\("isAdminLocked", isAdminLocked\)[\s\S]*setAttribute\("aria-disabled", String\(isAdminLocked\)\)/,
);
assert.match(appSource, /view === "ai-runs"[\s\S]*?loadSelectedAiReport\(\)/);
assert.match(appSource, /view === "chat"[\s\S]*?loadChatLogs\(\{ includeInsights: false \}\)/);
assert.match(
  serverSource,
  /const ADMIN_ONLY_AI_DASHBOARD_PATHS = new Set\(\[[\s\S]*?"\/api\/ai-chat"[\s\S]*?\]\);/,
);
assert.match(
  serverSource,
  /ADMIN_ONLY_AI_DASHBOARD_PATHS\.has\(url\.pathname\)[\s\S]*?findUserById\(auth\.userId\)[\s\S]*?Admin access required/,
);
assert.match(styleSource, /\.chatMetricGrid\s*\{\s*display:\s*flex;/);
assert.match(styleSource, /\.chatMetricCard[\s\S]*?width:\s*max-content;/);
assert.match(styleSource, /body\[data-active-view="chat"\] \.topbar\s*\{[\s\S]*?grid-template-columns:/);
assert.match(styleSource, /\.chatQuestionTableHeader,\s*\.chatLogTableHeader\s*\{[\s\S]*?font-size:\s*12px;/);
assert.match(
  styleSource,
  /\.overviewHeroGrid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);[^}]*gap:\s*0;/,
);
assert.match(
  styleSource,
  /\.aiFeaturesTopGrid\s*\{[^}]*grid-template-columns:\s*minmax\(280px, 380px\)\s+minmax\(420px, 1fr\);/,
);
assert.match(styleSource, /\.sideNav a\.aiFeaturesNavLink\.isAdminLocked\s*\{/);

console.log("Chat UI regression checks passed.");

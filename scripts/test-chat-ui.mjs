import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { paginateChatLogsPayload } from "../lib/chat-pagination.mjs";

const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const heatmapSource = readFileSync(new URL("../public/heatmap.js", import.meta.url), "utf8");

const chatPage = paginateChatLogsPayload({
  logCount: 61,
  logs: Array.from({ length: 61 }, (_, index) => ({ id: String(index + 1) })),
}, 25, 25);
assert.equal(chatPage.logs.length, 25);
assert.equal(chatPage.logs[0].id, "26");
assert.equal(chatPage.logs.at(-1).id, "50");
assert.equal(chatPage.paginationTotal, 61);
assert.equal(chatPage.hasPrevious, true);
assert.equal(chatPage.hasNext, true);

assert.match(indexSource, /data-dashboard-view="chat"[\s\S]*?<span>Chats<\/span>/);
assert.match(
  indexSource,
  /id="generalNavLabel">General<\/h2>[\s\S]*?data-dashboard-view="overview"[\s\S]*?data-dashboard-view="connect"/,
  "Overview and Connect Universe should share the General category",
);
assert.match(
  indexSource,
  /id="accountNavLabel">Account<\/h2>[\s\S]*?data-dashboard-view="usage"/,
  "Usage should live in the Account category",
);
assert.match(
  indexSource,
  /id="integrationsNavLabel">Integrations<\/h2>[\s\S]*?data-dashboard-view="discord"[\s\S]*?<span>Discord<\/span>/,
  "Discord should live in the Integrations category",
);
assert.match(
  indexSource,
  /id="analyticsNavLabel"[\s\S]*?id="integrationsNavLabel"[\s\S]*?id="accountNavLabel"/,
  "Integrations should sit between Analytics and Account",
);
assert.match(
  indexSource,
  /<section class="viewPage discordPage" data-view-panel="discord" hidden><\/section>/,
  "the Discord page should remain intentionally empty",
);
assert.match(
  indexSource,
  /id="adminNavGroup"[^>]*hidden[\s\S]*?id="adminNavLabel">Admin<\/h2>[\s\S]*?id="adminNavLink"/,
  "the complete Admin category should be hidden by default",
);
assert.doesNotMatch(indexSource, /id="setupNavLabel"|class="navGroup overviewNavGroup"/);
assert.match(
  indexSource,
  /id="aiFeaturesNavLink"[\s\S]*?<span class="aiFeaturesNavLabel">AI Features<\/span>[\s\S]*?class="aiFeaturesAdminBadge"/,
);
assert.equal((indexSource.match(/id="commonQuestionList"/g) || []).length, 1);
assert.equal((indexSource.match(/id="aiChatMessages"/g) || []).length, 1);
assert.match(indexSource, /id="chatPagination"[\s\S]*?id="chatPreviousPageButton"[\s\S]*?id="chatNextPageButton"/);
assert.match(indexSource, /data-admin-only-heatmap[\s\S]*?AI Analysis[\s\S]*?<small>Admin<\/small>/);
assert.doesNotMatch(indexSource, /data-heatmap-mode="movement"/);

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
assert.match(appSource, /discord:\s*\{\s*title:\s*"Discord Alerts",\s*subtitle:\s*"",/);
assert.match(appSource, /window\.location\.hash === "#discord"\) return "discord";/);
assert.match(appSource, /view === "discord"/);
assert.match(appSource, /"ai-runs":\s*\{\s*title:\s*"AI Features",/);
assert.match(appSource, /const ADMIN_ONLY_VIEWS = new Set\(\["ai-runs", "admin"\]\);/);
assert.match(appSource, /const adminNavGroup = document\.querySelector\("#adminNavGroup"\);/);
assert.match(appSource, /adminNavGroup\.hidden = !authenticatedUser\?\.isAdmin/);
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
assert.match(serverSource, /ADMIN_ONLY_AI_DASHBOARD_PATHS = new Set\(\[[\s\S]*?"\/api\/ai-area-analysis"/);
assert.match(serverSource, /ADMIN_ONLY_AI_DASHBOARD_PATHS = new Set\(\[[\s\S]*?"\/api\/ai-area-analysis\/analyze"/);
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
assert.match(styleSource, /\.aiFeaturesAdminBadge svg\s*\{[\s\S]*?width:\s*15px;[\s\S]*?height:\s*15px;/);
assert.match(styleSource, /\.chatLogItem time\s*\{[\s\S]*?font-size:\s*16px;[\s\S]*?font-weight:\s*850;/);
assert.match(styleSource, /\.chatPagination\s*\{/);
assert.match(appSource, /const CHAT_LOG_PAGE_SIZE = 25;/);
assert.match(appSource, /offset:\s*String\(chatLogOffset\)/);
assert.match(serverSource, /paginateChatLogsPayload\([\s\S]*?searchParams\.get\("offset"\)/);
assert.match(heatmapSource, /const MOVEMENT_EVENT_OPTION = "__movement__";/);
assert.match(heatmapSource, /function renderMovementDropdownOption\(\)/);
assert.match(heatmapSource, /if \(requestedMode === "ai-analysis" && !isAdminViewer\) requestedMode = "movement";/);

console.log("Chat UI regression checks passed.");

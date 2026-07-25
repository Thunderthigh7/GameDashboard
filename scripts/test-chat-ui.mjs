import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");

assert.match(indexSource, /data-dashboard-view="chat"[\s\S]*?<span>Chats<\/span>/);
assert.equal((indexSource.match(/id="commonQuestionList"/g) || []).length, 1);

const aiRunsStart = indexSource.indexOf('data-view-panel="ai-runs"');
const eventsStart = indexSource.indexOf('data-view-panel="events"');
const chatsStart = indexSource.indexOf('data-view-panel="chat"');
const usageStart = indexSource.indexOf('data-view-panel="usage"');
const questionPanel = indexSource.indexOf("aiRunsQuestionPanel");

assert.ok(aiRunsStart >= 0 && questionPanel > aiRunsStart && questionPanel < eventsStart);
assert.ok(!indexSource.slice(chatsStart, usageStart).includes("Top player questions"));
assert.match(appSource, /chat:\s*\{\s*title:\s*"Chats",\s*subtitle:\s*"",/);
assert.match(appSource, /view === "ai-runs"[\s\S]*?loadSelectedAiReport\(\)/);
assert.match(appSource, /view === "chat"[\s\S]*?loadChatLogs\(\{ includeInsights: false \}\)/);
assert.match(styleSource, /\.chatMetricGrid\s*\{\s*display:\s*flex;/);
assert.match(styleSource, /\.chatMetricCard[\s\S]*?width:\s*max-content;/);
assert.match(styleSource, /body\[data-active-view="chat"\] \.topbar\s*\{[\s\S]*?grid-template-columns:/);
assert.match(styleSource, /\.chatQuestionTableHeader,\s*\.chatLogTableHeader\s*\{[\s\S]*?font-size:\s*12px;/);

console.log("Chat UI regression checks passed.");

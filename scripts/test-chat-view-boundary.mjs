import fs from "node:fs/promises";

const index = await fs.readFile(new URL("../public/index.html", import.meta.url), "utf8");
const chat = await fs.readFile(new URL("../public/components/chat-view-template.js", import.meta.url), "utf8");

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

expect((index.match(/data-component-slot="chat-view"/g) || []).length === 1, "index should contain one Chat component slot");
expect(!index.includes('data-view-panel="chat"'), "Chat view should not remain duplicated in index.html");
expect(chat.includes('data-view-panel="chat"'), "Chat component should own the Chat view panel");

for (const id of ["chatMessageCount", "chatPlayerCount", "chatLiveBadge", "chatLogsStatus", "chatLogList", "chatPagination", "chatPreviousPageButton", "chatPageStatus", "chatNextPageButton"]) {
  expect(chat.includes(`id="${id}"`), `Chat component is missing #${id}`);
}

const templateIndex = index.indexOf('/components/chat-view-template.js');
const appIndex = index.indexOf('/assets/20260812-2/app.js');
expect(templateIndex >= 0, "Chat component script is missing");
expect(appIndex > templateIndex, "Chat component must mount before app.js");

if (failures.length) {
  console.error("Chat component boundary checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else console.log("Chat component boundary checks passed.");

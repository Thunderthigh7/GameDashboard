import fs from "node:fs/promises";

const indexUrl = new URL("../public/index.html", import.meta.url);
let html = await fs.readFile(indexUrl, "utf8");
const startMarker = '        <section class="viewPage chatAnalysisPage" data-view-panel="chat" hidden>';
const endMarker = '\n\n        <section class="viewPage discordPage" data-view-panel="discord" hidden>';
const slot = '        <div data-component-slot="chat-view"></div>';
const scriptTag = '    <script defer src="/components/chat-view-template.js"></script>';

if (!html.includes(slot)) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end <= start) throw new Error("View boundary not found");
  html = `${html.slice(0, start)}${slot}${html.slice(end)}`;
}

if (!html.includes(scriptTag)) {
  const after = '    <script defer src="/components/assets-view-template.js"></script>';
  if (!html.includes(after)) throw new Error("Component insertion point not found");
  html = html.replace(after, `${after}\n${scriptTag}`);
}

if ((html.match(/data-component-slot="chat-view"/g) || []).length !== 1) throw new Error("Slot invariant failed");
if ((html.match(/data-view-panel="chat"/g) || []).length !== 0) throw new Error("Inline panel remains");
if ((html.match(/\/components\/chat-view-template\.js/g) || []).length !== 1) throw new Error("Script invariant failed");
await fs.writeFile(indexUrl, html);

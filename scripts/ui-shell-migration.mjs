import fs from "node:fs/promises";

const indexUrl = new URL("../public/index.html", import.meta.url);
let html = await fs.readFile(indexUrl, "utf8");

const slot = '        <div data-component-slot="assets-view"></div>';
const scriptTag = '    <script defer src="/components/assets-view-template.js"></script>';

if (!html.includes('data-component-slot="assets-view"')) {
  const startMarker = '        <section class="viewPage assetsPage" data-view-panel="assets" hidden>';
  const endMarker = '\n\n        <section class="viewPage groupsPage" data-view-panel="groups" hidden>';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);

  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Could not find the exact Assets view boundary in public/index.html");
  }
  if (html.indexOf(startMarker, start + startMarker.length) >= 0) {
    throw new Error("Assets view boundary was not unique");
  }

  html = `${html.slice(0, start)}${slot}${html.slice(end)}`;
}

if (!html.includes(scriptTag)) {
  const connectScript = '    <script defer src="/components/connect-view-template.js"></script>';
  if (!html.includes(connectScript)) {
    throw new Error("Could not find the Connect component script insertion point");
  }
  html = html.replace(connectScript, `${connectScript}\n${scriptTag}`);
}

const slotCount = (html.match(/data-component-slot="assets-view"/g) || []).length;
const panelCount = (html.match(/data-view-panel="assets"/g) || []).length;
const scriptCount = (html.match(/\/components\/assets-view-template\.js/g) || []).length;
if (slotCount !== 1 || panelCount !== 0 || scriptCount !== 1) {
  throw new Error(`Assets migration invariant failed: slots=${slotCount}, inlinePanels=${panelCount}, scripts=${scriptCount}`);
}

await fs.writeFile(indexUrl, html);
console.log("Assets view extraction applied cleanly.");

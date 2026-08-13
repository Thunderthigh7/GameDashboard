import fs from "node:fs/promises";

const configUrl = new URL("./view-extraction-config.json", import.meta.url);
const indexUrl = new URL("../public/index.html", import.meta.url);
const config = JSON.parse(await fs.readFile(configUrl, "utf8"));
let html = await fs.readFile(indexUrl, "utf8");

const slotMarkup = `        <div data-component-slot="${config.slotName}"></div>`;
const scriptTag = `    <script defer src="${config.scriptSrc}"></script>`;

if (!html.includes(slotMarkup)) {
  const start = html.indexOf(config.startMarker);
  const end = html.indexOf(config.endMarker, start);
  if (start < 0 || end <= start) throw new Error("Configured view boundary not found");
  if (html.indexOf(config.startMarker, start + config.startMarker.length) >= 0) throw new Error("Configured start boundary is not unique");
  html = `${html.slice(0, start)}${slotMarkup}${html.slice(end)}`;
}

if (!html.includes(scriptTag)) {
  const afterTag = `    <script defer src="${config.afterScript}"></script>`;
  if (!html.includes(afterTag)) throw new Error("Configured script insertion point not found");
  html = html.replace(afterTag, `${afterTag}\n${scriptTag}`);
}

const slotPattern = new RegExp(`data-component-slot="${config.slotName}"`, "g");
const panelPattern = new RegExp(`data-view-panel="${config.viewName}"`, "g");
const scriptPattern = new RegExp(config.scriptSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
if ((html.match(slotPattern) || []).length !== 1) throw new Error("Slot invariant failed");
if ((html.match(panelPattern) || []).length !== 0) throw new Error("Inline panel remains");
if ((html.match(scriptPattern) || []).length !== 1) throw new Error("Script invariant failed");

await fs.writeFile(indexUrl, html);

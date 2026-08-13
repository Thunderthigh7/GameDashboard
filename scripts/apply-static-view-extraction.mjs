import fs from "node:fs/promises";

const indexUrl = new URL("../public/index.html", import.meta.url);
const componentsUrl = new URL("../public/components/", import.meta.url);
let html = await fs.readFile(indexUrl, "utf8");
const componentNames = (await fs.readdir(componentsUrl))
  .filter((name) => name.endsWith("-view-template.js"));
const candidates = componentNames.filter((name) => !html.includes(`/components/${name}`));
if (candidates.length !== 1) {
  throw new Error(`Expected exactly one unreferenced view component, found ${candidates.length}`);
}

const componentName = candidates[0];
const component = await fs.readFile(new URL(`../public/components/${componentName}`, import.meta.url), "utf8");
const viewName = component.match(/data-view-panel="([^"]+)"/)?.[1] || "";
const slotName = component.match(/mountHTML\('([^']+)'/)?.[1] || "";
if (!viewName || !slotName) throw new Error("Could not infer component view and slot names");

const panelToken = `data-view-panel="${viewName}"`;
const tokenIndex = html.indexOf(panelToken);
if (tokenIndex < 0 || html.indexOf(panelToken, tokenIndex + panelToken.length) >= 0) {
  throw new Error("Expected exactly one inline view panel");
}
const start = html.lastIndexOf('        <section class="viewPage', tokenIndex);
if (start < 0) throw new Error("Could not find inline view start");

const nextSection = html.indexOf('\n\n        <section class="viewPage', start + 1);
const nextSlot = html.indexOf('\n\n        <div data-component-slot=', start + 1);
const boundaries = [nextSection, nextSlot].filter((value) => value >= 0);
if (!boundaries.length) throw new Error("Could not find the next dashboard view boundary");
const end = Math.min(...boundaries);

const slotMarkup = `        <div data-component-slot="${slotName}"></div>`;
html = `${html.slice(0, start)}${slotMarkup}${html.slice(end)}`;

const scriptSrc = `/components/${componentName}`;
const scriptTag = `    <script defer src="${scriptSrc}"></script>`;
const appTag = '    <script defer src="/assets/20260812-2/app.js"></script>';
if (!html.includes(appTag)) throw new Error("Could not find app.js insertion point");
html = html.replace(appTag, `${scriptTag}\n${appTag}`);

if ((html.match(new RegExp(`data-component-slot="${slotName}"`, "g")) || []).length !== 1) throw new Error("Slot invariant failed");
if ((html.match(new RegExp(`data-view-panel="${viewName}"`, "g")) || []).length !== 0) throw new Error("Inline panel remains");
if ((html.match(new RegExp(scriptSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length !== 1) throw new Error("Script invariant failed");

await fs.writeFile(indexUrl, html);
console.log(`Extracted ${viewName} into ${componentName}.`);

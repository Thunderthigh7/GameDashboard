import fs from "node:fs/promises";

const index = await fs.readFile(new URL("../public/index.html", import.meta.url), "utf8");
const connect = await fs.readFile(new URL("../public/components/connect-view-template.js", import.meta.url), "utf8");
const runtime = await fs.readFile(new URL("../public/components/component-runtime.js", import.meta.url), "utf8");
const flowStyles = await fs.readFile(new URL("../public/components/product-flow.css", import.meta.url), "utf8");

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect((index.match(/data-component-slot="connect-view"/g) || []).length === 1, "index should contain exactly one Connect component slot");
expect(!index.includes('data-view-panel="connect"'), "Connect view markup should not remain duplicated in index.html");
expect(connect.includes('data-view-panel="connect"'), "Connect component should own the Connect view panel");

for (const id of [
  "connectNewGameButton",
  "connectedGameList",
  "studioPairingStatus",
  "studioPairingList",
  "setupChecklist",
  "setupProgressTrack",
  "connectRouteNotice",
  "connectGameDialog",
  "projectForm",
  "ownedGameSelect",
  "copyProjectSecretButton",
]) {
  expect(connect.includes(`id="${id}"`), `Connect component is missing #${id}`);
}

const componentRuntimeIndex = index.indexOf('/components/component-runtime.js');
const templateRuntimeIndex = index.indexOf('/components/template-runtime.js');
const connectTemplateIndex = index.indexOf('/components/connect-view-template.js');
const appIndex = index.indexOf('/assets/20260812-2/app.js');
expect(componentRuntimeIndex >= 0, "component runtime script is missing");
expect(templateRuntimeIndex > componentRuntimeIndex, "template runtime should load after component runtime");
expect(connectTemplateIndex > templateRuntimeIndex, "Connect template should load after template runtime");
expect(appIndex > connectTemplateIndex, "app.js must load after mounted component templates");

expect(runtime.includes("dashboard:analyticsReady"), "product flow should react to analytics readiness");
expect(runtime.includes("const gameRequiredViews = new Set"), "game-scoped navigation guard should be defined");
expect(runtime.includes("event.stopImmediatePropagation()"), "game-scoped navigation should stop invalid empty-state navigation");
expect(runtime.includes("['player-data', 'moderation', 'assets', 'groups']"), "Operate navigation order should remain explicit");
expect(runtime.includes("discord: 'Alerts'"), "Discord navigation should use the task label Alerts");
expect(runtime.includes("'roblox-live': 'Live Actions'"), "Roblox navigation should use the task label Live Actions");

expect(connect.includes('data-dashboard-view="overview"'), "Connect should offer Map as a guided next step");
expect(connect.includes('data-dashboard-view="events"'), "Connect should offer Events as a guided next step");
expect(connect.includes('data-dashboard-view="funnels"'), "Connect should offer Funnels as a guided next step");
expect(connect.includes('data-dashboard-view="player-data"'), "Connect should offer Player Data as a guided next step");

expect(flowStyles.includes('body[data-active-view="connect"] .topbar'), "Setup should suppress the duplicate global topbar");
expect(flowStyles.includes('body[data-active-view="player-data"] .topbar'), "Player Data should suppress the duplicate global topbar");
expect(flowStyles.includes('.connectRouteNotice'), "Setup redirect reason should have dedicated styling");

if (failures.length) {
  console.error("UI component boundary checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("UI component boundary checks passed.");
}

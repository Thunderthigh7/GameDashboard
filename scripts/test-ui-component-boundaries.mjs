import fs from "node:fs/promises";

const index = await fs.readFile(new URL("../public/index.html", import.meta.url), "utf8");
const connect = await fs.readFile(new URL("../public/components/connect-view-template.js", import.meta.url), "utf8");
const runtime = await fs.readFile(new URL("../public/components/component-runtime.js", import.meta.url), "utf8");
const flowStyles = await fs.readFile(new URL("../public/components/product-flow.css", import.meta.url), "utf8");

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

expect((index.match(/data-component-slot="connect-view"/g) || []).length === 1, "index should contain one Connect component slot");
expect(!index.includes('data-view-panel="connect"'), "Connect view should not remain duplicated in index.html");
expect(connect.includes('data-view-panel="connect"'), "Connect component should own the Connect view panel");

for (const id of ["connectNewGameButton", "connectedGameList", "studioPairingStatus", "studioPairingList", "setupChecklist", "setupProgressTrack", "connectRouteNotice", "connectGameDialog", "projectForm", "ownedGameSelect", "copyProjectSecretButton"]) {
  expect(connect.includes(`id="${id}"`), `Connect component is missing #${id}`);
}

const componentRuntimeIndex = index.indexOf('/components/component-runtime.js');
const templateRuntimeIndex = index.indexOf('/components/template-runtime.js');
const connectTemplateIndex = index.indexOf('/components/connect-view-template.js');
const appIndex = index.indexOf('/assets/20260812-2/app.js');
expect(componentRuntimeIndex >= 0, "component runtime script is missing");
expect(templateRuntimeIndex > componentRuntimeIndex, "template runtime should load after component runtime");
expect(connectTemplateIndex > templateRuntimeIndex, "Connect template should load after template runtime");
expect(appIndex > connectTemplateIndex, "app.js must load after mounted components");

expect(runtime.includes("const PRODUCT_VIEWS = Object.freeze"), "product view registry should be the flow source of truth");
expect(runtime.includes("const NAV_SECTIONS = Object.freeze"), "navigation sections should be declared centrally");
expect(runtime.includes("dashboard:analyticsReady"), "product flow should react to analytics readiness");
expect(runtime.includes("function viewRequiresGame"), "game requirements should derive from the registry");
expect(runtime.includes("function syncGameAvailability"), "navigation availability should react to connected-game state");
expect(runtime.includes("setupRequired = 'true'"), "game-scoped links should expose Setup-required state");
expect(runtime.includes("event.stopImmediatePropagation()"), "invalid empty-state navigation should be stopped");
expect(runtime.includes("views: ['player-data', 'moderation', 'assets', 'groups']"), "Operate navigation order should remain explicit");
expect(runtime.includes("label: 'Alerts'"), "Discord should use the task label Alerts");
expect(runtime.includes("label: 'Live Actions'"), "Roblox should use the task label Live Actions");
expect(runtime.includes("product-flow.css?v=20260813-3"), "product flow CSS should use the current cache version");
expect(runtime.includes("landing.css?v=20260813-1"), "landing CSS should use the current cache version");

for (const view of ["overview", "events", "funnels", "player-data"]) {
  expect(connect.includes(`data-dashboard-view="${view}"`), `Connect should offer ${view} as a guided next step`);
}

expect(flowStyles.includes('body[data-active-view="connect"] .topbar'), "Setup should suppress the duplicate global topbar");
expect(flowStyles.includes('body[data-active-view="player-data"] .topbar'), "Player Data should suppress the duplicate global topbar");
expect(flowStyles.includes('.connectRouteNotice'), "Setup redirect reason should have dedicated styling");
expect(flowStyles.includes('[data-setup-required="true"]'), "Setup-required navigation should have a visible state");

if (failures.length) {
  console.error("UI component boundary checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("UI component boundary checks passed.");
}

import assert from "node:assert/strict";
import {
  createDemoUniverseFixture,
  DEMO_SEED_VERSION,
} from "../lib/demo-universe.mjs";
import {
  calculateFunnelAnalytics,
  groupCustomEventsBySession,
} from "../lib/funnels.mjs";

const fixture = createDemoUniverseFixture({ referenceTime: Date.UTC(2026, 6, 19, 16, 0, 0) });
const eventsByName = new Map();
for (const event of fixture.customEvents) {
  const events = eventsByName.get(event.eventName) || [];
  events.push(event);
  eventsByName.set(event.eventName, events);
}

function propertyShare(eventName, propertyName, value) {
  const events = eventsByName.get(eventName) || [];
  assert.ok(events.length > 0, `${eventName} should have demo records`);
  const matches = events.filter((event) => event.properties?.[propertyName] === value).length;
  return matches / events.length;
}

function assertShareBetween(actual, minimum, maximum, label) {
  assert.ok(actual >= minimum && actual <= maximum, `${label} should be between ${minimum} and ${maximum}, got ${actual}`);
}

const requiredEvents = [
  "obby_run_started",
  "obby_failed",
  "obby_completed",
  "weapon_selected",
  "combat_death",
  "sword_selected",
  "sword_duel_defeat",
  "egg_hatched",
  "simulator_session_ended",
  "purchase_prompt_closed",
];
for (const eventName of requiredEvents) assert.ok(eventsByName.has(eventName), `${eventName} should be included in the demo`);

const primaryProperties = new Map([
  ["obby_failed", "obstacle"],
  ["weapon_selected", "weapon"],
  ["combat_death", "killedByWeapon"],
  ["sword_selected", "sword"],
  ["sword_duel_defeat", "defeatedBySword"],
  ["simulator_session_ended", "reason"],
  ["purchase_prompt_closed", "reason"],
]);
for (const [eventName, propertyName] of primaryProperties) {
  assert.equal(Object.keys(eventsByName.get(eventName)[0].properties)[0], propertyName, `${eventName} should open on its useful category`);
}

const genericContextProperties = ["cohort", "device", "region"];
for (const event of fixture.customEvents) {
  for (const propertyName of genericContextProperties) {
    assert.equal(
      Object.hasOwn(event.properties || {}, propertyName),
      false,
      `${event.eventName} should keep ${propertyName} out of its gameplay property breakdown`,
    );
  }
}

const laserFailureShare = propertyShare("obby_failed", "obstacle", "Laser Ladder");
const shotgunUsageShare = propertyShare("weapon_selected", "weapon", "Shotgun");
const shotgunDeathShare = propertyShare("combat_death", "killedByWeapon", "Shotgun");
const voidEdgeUsageShare = propertyShare("sword_selected", "sword", "Void Edge");
const voidEdgeDefeatShare = propertyShare("sword_duel_defeat", "defeatedBySword", "Void Edge");
const inventoryExitShare = propertyShare("simulator_session_ended", "reason", "Pet inventory full");
const priceObjectionShare = propertyShare("purchase_prompt_closed", "reason", "Too expensive");

assert.equal(DEMO_SEED_VERSION, 8);
assert.equal(eventsByName.get("session_started")?.length, fixture.counts.sessions);
assert.ok(fixture.customEvents.length >= 4_000, "the demo should contain enough event history for useful charts");
assertShareBetween(laserFailureShare, 0.55, 0.61, "Laser Ladder failure share");
assertShareBetween(shotgunUsageShare, 0.15, 0.21, "shotgun loadout share");
assertShareBetween(shotgunDeathShare, 0.53, 0.59, "shotgun combat death share");
assert.ok(shotgunDeathShare > shotgunUsageShare * 2.5, "shotgun deaths should clearly over-index versus selection");
assertShareBetween(voidEdgeUsageShare, 0.03, 0.07, "Void Edge selection share");
assertShareBetween(voidEdgeDefeatShare, 0.49, 0.55, "Void Edge defeat share");
assert.ok(voidEdgeDefeatShare > voidEdgeUsageShare * 8, "Void Edge defeats should clearly over-index versus selection");
assertShareBetween(inventoryExitShare, 0.58, 0.64, "inventory-full exit share");
assertShareBetween(priceObjectionShare, 0.51, 0.57, "too-expensive close share");

const laserHotspotDeaths = fixture.deathSamples.filter((sample) => (
  Math.hypot(Number(sample.x) + 32, Number(sample.z) - 52) <= 8
));
assert.ok(laserHotspotDeaths.length / fixture.deathSamples.length >= 0.45, "system deaths should form a visible Laser Ladder hotspot");

const mapPartNames = new Set(fixture.map.parts.map((part) => part.name));
for (const partName of ["LaserLadderLanding", "LaserHazard", "FpsCover", "SwordPedestal_VoidEdge", "StarterEggMachine"]) {
  assert.ok(mapPartNames.has(partName), `${partName} should be visible in the demo map`);
}

assert.deepEqual(fixture.funnels.map((funnel) => funnel.name), [
  "Obby completion",
  "FPS match completion",
  "Shop conversion",
]);

const demoSessions = groupCustomEventsBySession(fixture.customEvents);
const obbyFunnel = fixture.funnels.find((funnel) => funnel.name === "Obby completion");
const obbyAnalytics = calculateFunnelAnalytics(obbyFunnel, demoSessions);
const obbyStarts = eventsByName.get("obby_run_started")?.length || 0;
const obbyCompletions = eventsByName.get("obby_completed")?.length || 0;
assert.equal(obbyAnalytics.entrySessions, obbyStarts, "Obby funnel entries should reconcile with raw start events");
assert.equal(obbyAnalytics.completedSessions, obbyCompletions, "Obby funnel completions should reconcile with raw completion events");
assert.deepEqual(
  obbyAnalytics.steps.map((step) => step.sessions),
  [obbyStarts, obbyStarts, obbyCompletions],
  "every demo Obby run should reach the first checkpoint and only completed runs should reach the final step",
);
assert.equal(
  obbyAnalytics.overallConversion,
  Math.round((obbyCompletions / obbyStarts) * 1000) / 10,
  "the displayed Obby conversion should derive exactly from the raw session counts",
);

console.log("Demo universe analytics stories passed.", {
  seedVersion: DEMO_SEED_VERSION,
  customEvents: fixture.customEvents.length,
  mapParts: fixture.map.parts.length,
  laserFailurePercent: Math.round(laserFailureShare * 1_000) / 10,
  shotgunUsagePercent: Math.round(shotgunUsageShare * 1_000) / 10,
  shotgunDeathPercent: Math.round(shotgunDeathShare * 1_000) / 10,
  voidEdgeUsagePercent: Math.round(voidEdgeUsageShare * 1_000) / 10,
  voidEdgeDefeatPercent: Math.round(voidEdgeDefeatShare * 1_000) / 10,
  inventoryExitPercent: Math.round(inventoryExitShare * 1_000) / 10,
  priceObjectionPercent: Math.round(priceObjectionShare * 1_000) / 10,
  obbyCompletionPercent: obbyAnalytics.overallConversion,
});

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
  "session_started",
  "obby_checkpoint_reached",
  "obby_completed",
  "weapon_selected",
  "combat_death",
];
for (const eventName of requiredEvents) assert.ok(eventsByName.has(eventName), `${eventName} should be included in the demo`);

const primaryProperties = new Map([
  ["obby_checkpoint_reached", "checkpoint"],
  ["weapon_selected", "weapon"],
  ["combat_death", "killedByWeapon"],
]);
for (const [eventName, propertyName] of primaryProperties) {
  assert.equal(
    eventsByName.get(eventName)[0].properties?.[propertyName] !== undefined,
    true,
    `${eventName} should include ${propertyName} as a useful category`,
  );
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

const contextProperties = ["mapName", "gameMode", "mapId"];
for (const eventName of requiredEvents) {
  const event = eventsByName.get(eventName)?.[0];
  assert.ok(event, `missing event sample for ${eventName}`);
  for (const propertyName of contextProperties) {
    assert.equal(
      Object.hasOwn(event?.properties || {}, propertyName),
      true,
      `${eventName} should include ${propertyName}`,
    );
  }
}

const checkpointDropShare = propertyShare("obby_checkpoint_reached", "failureReason", "Clean");
const shotgunUsageShare = propertyShare("weapon_selected", "weapon", "Shotgun");
const shotgunDeathShare = propertyShare("combat_death", "killedByWeapon", "Shotgun");
const obbyStep1Share = propertyShare("obby_checkpoint_reached", "checkpointIndex", 1);
const obbyStep6Share = propertyShare("obby_checkpoint_reached", "checkpointIndex", 6);

assert.equal(DEMO_SEED_VERSION, 11);
assert.equal(eventsByName.get("session_started")?.length, fixture.counts.sessions);
assert.ok(fixture.customEvents.length >= 4_000, "the demo should contain enough event history for useful charts");
assertShareBetween(shotgunUsageShare, 0.15, 0.21, "shotgun loadout share");
assertShareBetween(shotgunDeathShare, 0.35, 0.70, "shotgun combat death share");
assert.ok(shotgunDeathShare > shotgunUsageShare * 2.5, "shotgun deaths should clearly over-index versus selection");
assertShareBetween(obbyStep1Share, 0.95, 1.0, "first checkpoint share");
assert.ok(checkpointDropShare < 1, "some obby runs should drop before the end");
assert.ok(obbyStep6Share > 0.15, "some runs should reach the final checkpoint");

const laserHotspotDeaths = fixture.deathSamples.filter((sample) => (
  Math.hypot(Number(sample.x) + 32, Number(sample.z) - 52) <= 8
));
assert.ok(laserHotspotDeaths.length / fixture.deathSamples.length >= 0.45, "system deaths should form a visible Laser Ladder hotspot");

const mapPartNames = new Set(fixture.map.parts.map((part) => part.name));
for (const partName of ["LaserLadderLanding", "LaserHazard", "FpsCover", "ShotgunHotspot"]) {
  assert.ok(mapPartNames.has(partName), `${partName} should be visible in the demo map`);
}

assert.deepEqual(fixture.funnels.map((funnel) => funnel.name), [
  "Obby checkpoint journey",
  "FPS lethal loadout",
]);

const demoSessions = groupCustomEventsBySession(fixture.customEvents);
const obbyFunnel = fixture.funnels.find((funnel) => funnel.name === "Obby checkpoint journey");
const obbyAnalytics = calculateFunnelAnalytics(obbyFunnel, demoSessions);
const allCheckpointEvents = eventsByName.get("obby_checkpoint_reached") || [];
const obbyStarts = allCheckpointEvents.filter((event) => event.properties?.checkpointIndex === 1).length;
const obbyCheckpoint2 = allCheckpointEvents.filter((event) => (event.properties?.checkpointIndex || 0) >= 2).length;
const obbyCheckpoint3 = allCheckpointEvents.filter((event) => (event.properties?.checkpointIndex || 0) >= 3).length;
const obbyCheckpoint4 = allCheckpointEvents.filter((event) => (event.properties?.checkpointIndex || 0) >= 4).length;
const obbyCheckpoint5 = allCheckpointEvents.filter((event) => (event.properties?.checkpointIndex || 0) >= 5).length;
const obbyCheckpoint6 = allCheckpointEvents.filter((event) => event.properties?.checkpointIndex === 6).length;
const obbyCompletions = eventsByName.get("obby_completed")?.length || 0;
assert.equal(obbyAnalytics.entrySessions, obbyStarts, "Obby funnel entries should reconcile with raw start events");
assert.equal(obbyAnalytics.completedSessions, obbyCompletions, "Obby funnel completions should reconcile with raw completion events");
assert.deepEqual(
  obbyAnalytics.steps.map((step) => step.sessions),
  [obbyStarts, obbyCheckpoint2, obbyCheckpoint3, obbyCheckpoint4, obbyCheckpoint5, obbyCheckpoint6, obbyCompletions],
  "obby funnel should preserve step order through six checkpoints and final completion",
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
  checkpointDropPercent: Math.round(checkpointDropShare * 1_000) / 10,
  shotgunUsagePercent: Math.round(shotgunUsageShare * 1_000) / 10,
  shotgunDeathPercent: Math.round(shotgunDeathShare * 1_000) / 10,
  obbyStep1Percent: Math.round(obbyStep1Share * 1_000) / 10,
  obbyStep6Percent: Math.round(obbyStep6Share * 1_000) / 10,
  obbyCompletionPercent: obbyAnalytics.overallConversion,
});

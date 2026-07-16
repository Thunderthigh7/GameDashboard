import assert from "node:assert/strict";
import { createDemoUniverseFixture } from "../lib/demo-universe.mjs";
import { buildReleaseComparison } from "../lib/release-comparisons.mjs";

const PLACE_ID = 24680;

function makeCohort(placeVersion, sessions, deaths) {
  return {
    placeId: PLACE_ID,
    placeVersion,
    sessionCount: sessions,
    meetsMinimumSessions: sessions >= 20,
    records: { customEvents: sessions, deaths, leaves: 0 },
  };
}

function makeSessionEvents({ placeVersion, userId, index, platform, died }) {
  const sessionId = `v${placeVersion}:session:${userId}`;
  const occurredAt = placeVersion * 1_000_000 + index * 1_000;
  const events = [{
    id: `${sessionId}:start`,
    placeId: PLACE_ID,
    placeVersion,
    environment: "production",
    eventName: "session_started",
    userId,
    sessionId,
    occurredAt,
    properties: { platform },
  }];
  if (died) {
    events.push({
      id: `${sessionId}:death`,
      placeId: PLACE_ID,
      placeVersion,
      environment: "production",
      eventName: "player_died",
      sourceType: "system",
      userId,
      sessionId,
      occurredAt: occurredAt + 500,
      platform,
    });
  }
  return events;
}

function buildFixture({ beforeDesktop, beforeMobile, afterDesktop, afterMobile, deathRule }) {
  const events = [];
  const addSide = (placeVersion, desktopCount, mobileCount, userOffset) => {
    const sessions = [
      ...Array.from({ length: desktopCount }, () => "Desktop"),
      ...Array.from({ length: mobileCount }, () => "Mobile"),
    ];
    sessions.forEach((platform, index) => {
      const userId = userOffset + index;
      events.push(...makeSessionEvents({ placeVersion: 1, userId, index, platform, died: false }));
      events.push(...makeSessionEvents({
        placeVersion,
        userId,
        index,
        platform,
        died: deathRule(placeVersion, platform, index),
      }));
    });
  };
  addSide(2, beforeDesktop, beforeMobile, 10_000);
  addSide(3, afterDesktop, afterMobile, 20_000);
  return events;
}

function compare(events) {
  const beforeDeaths = events.filter((event) => event.placeVersion === 2 && event.eventName === "player_died").length;
  const afterDeaths = events.filter((event) => event.placeVersion === 3 && event.eventName === "player_died").length;
  return buildReleaseComparison({
    placeId: PLACE_ID,
    before: makeCohort(2, 100, beforeDeaths),
    after: makeCohort(3, 100, afterDeaths),
    events,
    funnelDefinitions: [],
  });
}

const trafficMixOnly = compare(buildFixture({
  beforeDesktop: 80,
  beforeMobile: 20,
  afterDesktop: 20,
  afterMobile: 80,
  deathRule: (_placeVersion, platform) => platform === "Mobile",
}));

assert.equal(trafficMixOnly.rawFindings.regressions, 1, "raw cohorts should show the false regression");
assert.equal(trafficMixOnly.trafficAdjustment.status, "ready");
assert.equal(trafficMixOnly.trafficAdjustment.samples.before.sessions, 40);
assert.equal(trafficMixOnly.trafficAdjustment.samples.after.sessions, 40);
assert.equal(trafficMixOnly.trafficAdjustment.mixShiftPoints, 60);
assert.equal(trafficMixOnly.findings.basis, "traffic_matched");
assert.equal(trafficMixOnly.findings.regressions, 0, "matching should remove a platform-mix false alarm");

const realRegression = compare(buildFixture({
  beforeDesktop: 50,
  beforeMobile: 50,
  afterDesktop: 50,
  afterMobile: 50,
  deathRule: (placeVersion) => placeVersion === 3,
}));

assert.equal(realRegression.trafficAdjustment.samples.before.sessions, 100);
assert.equal(realRegression.findings.regressions, 1, "a within-segment regression must remain visible");
assert.equal(realRegression.findings.items[0]?.id, "death_session_rate");

const demo = createDemoUniverseFixture({ referenceTime: Date.UTC(2026, 6, 15, 16, 0, 0) });
const demoEvents = [
  ...demo.customEvents,
  ...demo.deathSamples.map((event) => ({ ...event, eventName: "player_died", sourceType: "system", occurredAt: event.diedAt })),
  ...demo.leaveSamples.map((event) => ({ ...event, eventName: "player_left", sourceType: "system", occurredAt: event.leftAt })),
  ...demo.chatLogs.map((event) => ({ ...event, eventName: "chat_message", sourceType: "system", occurredAt: event.sentAt })),
].map((event) => ({ ...event, placeId: demo.placeId }));
const demoVersions = [...new Set(demo.customEvents.map((event) => event.placeVersion))].sort((left, right) => left - right);
const demoCohort = (placeVersion) => {
  const matching = demoEvents.filter((event) => event.placeVersion === placeVersion);
  return {
    placeId: demo.placeId,
    placeVersion,
    sessionCount: new Set(matching.map((event) => event.sessionId)).size,
    meetsMinimumSessions: true,
    records: {
      customEvents: matching.filter((event) => event.sourceType !== "system").length,
      deaths: matching.filter((event) => event.eventName === "player_died").length,
      leaves: matching.filter((event) => event.eventName === "player_left").length,
    },
  };
};
const demoComparison = buildReleaseComparison({
  placeId: demo.placeId,
  before: demoCohort(demoVersions[0]),
  after: demoCohort(demoVersions[1]),
  events: demoEvents,
  funnelDefinitions: demo.funnels,
});

if (demoComparison.trafficAdjustment.status !== "ready") {
  console.log("Demo traffic matching diagnostic", {
    coverage: demoComparison.trafficAdjustment.coverage,
    samples: demoComparison.trafficAdjustment.samples,
    segments: demoComparison.trafficAdjustment.segments,
  });
}

assert.equal(demoComparison.status, "ready");
assert.equal(demoComparison.trafficAdjustment.status, "ready");
assert.equal(demoComparison.trafficAdjustment.coverage.before.platformPercent, 100);
assert.equal(demoComparison.trafficAdjustment.coverage.after.platformPercent, 100);
assert.ok(demoComparison.trafficAdjustment.samples.before.sessions >= 20);
assert.ok(demoComparison.findings.items.length > 0, "the demo should contain reviewable matched release findings");

console.log("Release comparison traffic-matching tests passed.", {
  demoMatchedSessions: demoComparison.trafficAdjustment.samples.before.sessions,
  demoMixShiftPoints: demoComparison.trafficAdjustment.mixShiftPoints,
  demoRegressions: demoComparison.findings.regressions,
  demoImprovements: demoComparison.findings.improvements,
  demoFindings: demoComparison.findings.items.map((finding) => finding.title),
});

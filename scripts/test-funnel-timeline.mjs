import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  calculateFunnelTimelineAnalytics,
  groupCustomEventsBySession,
} from "../lib/funnels.mjs";

const base = Date.UTC(2026, 6, 1, 0, 0, 0);
const hour = 60 * 60 * 1000;
const definition = {
  conversionWindowMinutes: 30,
  steps: ["round_started", "checkpoint_reached", "round_completed"],
};
const event = (userId, sessionId, eventName, offsetMs) => ({
  userId,
  sessionId,
  eventName,
  occurredAt: base + offsetMs,
});
const sessions = groupCustomEventsBySession([
  event(1, "a", "round_started", 5 * 60 * 1000),
  event(1, "a", "checkpoint_reached", 8 * 60 * 1000),
  event(1, "a", "round_completed", 12 * 60 * 1000),
  event(2, "b", "round_started", 20 * 60 * 1000),
  event(3, "c", "round_started", hour + 5 * 60 * 1000),
  event(3, "c", "checkpoint_reached", hour + 8 * 60 * 1000),
  event(3, "c", "round_completed", hour + 10 * 60 * 1000),
  event(4, "ignored", "checkpoint_reached", 2 * hour + 5 * 60 * 1000),
]);
const timeline = calculateFunnelTimelineAnalytics(definition, sessions, [
  { start: base, end: base + hour },
  { start: base + hour, end: base + 2 * hour },
  { start: base + 2 * hour, end: base + 3 * hour },
]);

assert.equal(timeline.length, 3, "the requested time buckets should be retained");
assert.equal(timeline[0].entrySessions, 2, "the first bucket should cohort sessions by first-step time");
assert.deepEqual(
  timeline[0].steps.map((step) => [step.sessions, step.percentage]),
  [[2, 100], [1, 50], [1, 50]],
  "the first cohort should report the percentage that reached each ordered step",
);
assert.deepEqual(
  timeline[1].steps.map((step) => [step.sessions, step.percentage]),
  [[1, 100], [1, 100], [1, 100]],
  "a completed second cohort should remain at 100 percent through every step",
);
assert.equal(timeline[2].entrySessions, 0, "sessions that never entered at step one should not create a cohort");
assert.ok(
  timeline[2].steps.every((step) => step.percentage === null),
  "empty cohorts should remain no-data instead of becoming a misleading zero-percent line",
);

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");

assert.match(indexSource, /id="funnelIntervalButton"[^>]*aria-haspopup="listbox"/, "Funnels should have a themed interval trigger");
assert.match(indexSource, /id="funnelTimelineStepPickerButton"/, "Funnels should have a step visibility control");
assert.match(indexSource, /id="funnelTimelineChart"/, "Funnels should include the step conversion line chart");
assert.match(appSource, /params\.set\("funnelId", selectedFunnelId\)/, "the selected Funnel should request its timeline");
assert.match(appSource, /params\.set\("interval", selectedFunnelInterval\)/, "Funnel interval changes should reach the API");
assert.match(appSource, /function renderFunnelTimeline\(funnel\)/, "the Funnel timeline renderer should be present");
assert.match(appSource, /const selectedFunnelTimelineSteps = new Map\(\)/, "step visibility should be retained independently by Funnel");
assert.match(serverSource, /calculateFunnelTimelineAnalytics\(\s*definition,\s*sessions,\s*timelineScaffold\.buckets,/s, "the API should calculate the selected Funnel timeline");
assert.match(styleSource, /\.funnelTimelinePanel\s*\{/, "the Funnel chart should use a dedicated themed panel");
assert.match(styleSource, /\.funnelTimelineStepMenu\s*\{/, "the step selector should use a themed menu");

console.log("Funnel timeline assertions passed.");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  calculateFunnelAnalytics,
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
  timeline[0].steps.map((step) => [step.sessions, step.percentage, step.conversionFromPrevious]),
  [[2, 100, 100], [1, 50, 50], [1, 50, 100]],
  "the first cohort should distinguish total reach from accurate previous-step conversion",
);
assert.deepEqual(
  timeline[1].steps.map((step) => [step.sessions, step.percentage, step.conversionFromPrevious]),
  [[1, 100, 100], [1, 100, 100], [1, 100, 100]],
  "a completed second cohort should remain at 100 percent through every step",
);
assert.equal(timeline[2].entrySessions, 0, "sessions that never entered at step one should not create a cohort");
assert.ok(
  timeline[2].steps.every((step) => step.percentage === null && step.conversionFromPrevious === null),
  "empty cohorts should remain no-data instead of becoming a misleading zero-percent line",
);
assert.equal(
  Math.round((
    timeline.reduce((total, bucket) => total + bucket.steps[1].sessions, 0)
    / timeline.reduce((total, bucket) => total + bucket.steps[0].sessions, 0)
  ) * 1000) / 10,
  66.7,
  "the weighted average should reconcile reached sessions against previous-step sessions",
);

const historicalRangeEnd = base + hour;
const historicalSessions = groupCustomEventsBySession([
  event(5, "edge", "round_started", hour - 5 * 60 * 1000),
  event(5, "edge", "checkpoint_reached", hour + 2 * 60 * 1000),
  event(5, "edge", "round_completed", hour + 10 * 60 * 1000),
  event(6, "after", "round_started", hour + 1 * 60 * 1000),
  event(6, "after", "checkpoint_reached", hour + 3 * 60 * 1000),
  event(6, "after", "round_completed", hour + 5 * 60 * 1000),
]);
const historicalAnalytics = calculateFunnelAnalytics(definition, historicalSessions, {
  entryFromMs: base,
  entryToMs: historicalRangeEnd,
  totalTrackedSessions: 2,
});
assert.equal(historicalAnalytics.entrySessions, 1, "only sessions entering inside the selected range should count");
assert.equal(
  historicalAnalytics.completedSessions,
  1,
  "a session entering before the range end should retain conversions completed afterward inside its conversion window",
);
assert.deepEqual(
  historicalAnalytics.steps.map((step) => step.sessions),
  [1, 1, 1],
  "lookahead events should reconcile every ordered step without admitting later entry cohorts",
);
const historicalTimeline = calculateFunnelTimelineAnalytics(definition, historicalSessions, [
  { start: base, end: historicalRangeEnd },
]);
assert.deepEqual(
  historicalTimeline[0].steps.map((step) => step.conversionFromPrevious),
  [100, 100, 100],
  "the entry-time bucket should include later conversions from the same mature cohort",
);

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");

assert.match(indexSource, /id="funnelIntervalButton"[^>]*aria-haspopup="listbox"/, "Funnels should have a themed interval trigger");
assert.match(indexSource, /id="funnelTimelineStepPickerButton"/, "Funnels should have a step visibility control");
assert.match(indexSource, /id="funnelManageColorsButton"[\s\S]*?>[\s\S]*?Manage colors/, "Funnels should have a color manager beside the timeline controls");
assert.match(indexSource, /id="funnelColorManagerDialog"/, "Funnels should include a dedicated step color manager");
assert.match(indexSource, /id="funnelTimelineChart"/, "Funnels should include the step conversion line chart");
assert.match(indexSource, /id="funnelStepChangesTable"/, "Funnels should include the step change comparison below the main table");
assert.match(indexSource, />Step-to-step conversion over time</, "the chart title should identify the same metric as the comparison");
assert.match(indexSource, />Step-to-step conversion</, "the comparison should retain its direct title");
assert.doesNotMatch(indexSource, /funnelStepChangesPeriod|change vs prior period|Mature cohorts only/, "the comparison should not include explanatory subtext or prior-period terminology");
assert.match(appSource, /params\.set\("funnelId", selectedFunnelId\)/, "the selected Funnel should request its timeline");
assert.match(appSource, /params\.set\("interval", selectedFunnelInterval\)/, "Funnel interval changes should reach the API");
assert.match(appSource, /function renderFunnelTimeline\(funnel\)/, "the Funnel timeline renderer should be present");
assert.match(appSource, /const rawPercentage = getFunnelBucketStepConversion\(bucket, stepIndex\)/, "the chart and table should use the same step-to-step conversion calculation");
assert.doesNotMatch(appSource, /const rawPercentage = point\?\.percentage/, "the chart should not plot the from-start percentage as step conversion");
assert.match(appSource, /function getCompletedFunnelTimelineBuckets\(funnel\)/, "the chart and table should share completed cohort filtering");
assert.match(appSource, /const buckets = getCompletedFunnelTimelineBuckets\(funnel\)/, "the chart should exclude unfinished conversion cohorts");
assert.match(indexSource, /Percent of sessions at the previous step that reached each selected step\./, "the chart should state its step-to-step denominator");
assert.match(indexSource, />Sessions entered</, "the Funnel summary should identify its session-based counting unit");
assert.match(indexSource, />Sessions completed</, "completed Funnel counts should not be mislabeled as players");
assert.match(indexSource, />For completed sessions</, "the Funnel timing summary should use the same counting unit");
assert.match(appSource, /<span>Sessions<\/span><span>Total conversion<\/span>/, "the main Funnel table should label session counts accurately");
assert.match(appSource, /function getFunnelStepColor\(funnel, stepIndex\)/, "saved Funnel step colors should drive the timeline");
assert.match(appSource, /async function saveFunnelStepColors\(\)/, "Funnel step color changes should persist");
assert.match(appSource, /document\.body\.append\(eventConfirmDialog\)/, "the shared discard confirmation should remain visible from the Funnels view");
assert.match(appSource, /data-funnel-step-color-text/, "the color manager should retain direct hex editing");
assert.doesNotMatch(appSource, /data-funnel-step-name/, "the color manager should not make Funnel step values editable");
assert.match(appSource, /function renderFunnelStepChanges\(funnel\)/, "the Funnel step comparison renderer should be present");
assert.match(appSource, /funnelStepChangeDelta">\(\$\{formatFunnelPercentagePointChange/, "the change should sit directly beside its current percentage");
assert.match(appSource, /<span>Average<\/span>/, "the step-to-step table should show an explicit average column");
assert.match(appSource, /function getFunnelAverageStepConversion\(buckets, stepIndex\)/, "the Funnel average should be weighted from completed timeline buckets");
assert.match(appSource, /function formatFunnelConversionFraction\(/, "the Funnel comparison should expose its numerator and denominator");
assert.match(appSource, /<small>End \$\{endCounts\} &middot; Start \$\{startCounts\}<\/small>/, "the start and end cohort counts should be directly auditable");
assert.doesNotMatch(appSource, /formatFunnelPercentage\(aggregateStep\?\.conversionFromStart\)/, "the Funnel legend should not display the aggregate percentage");
assert.match(appSource, /End \(change from start\)/, "the value column should make the start-to-end comparison explicit");
assert.match(appSource, /function getFunnelBucketStepConversion\(bucket, stepIndex\)/, "the comparison should calculate each bucket's step-to-step conversion");
assert.match(appSource, /const startBucket = completedBuckets\[0\]/, "the comparison should use the first completed populated timeline bucket");
assert.match(appSource, /const endBucket = completedBuckets\[completedBuckets\.length - 1\]/, "the comparison should use the last completed populated timeline bucket");
assert.match(appSource, /const selectedFunnelTimelineSteps = new Map\(\)/, "step visibility should be retained independently by Funnel");
assert.match(serverSource, /calculateFunnelTimelineAnalytics\(\s*definition,\s*sessions,\s*timelineScaffold\.buckets,/s, "the API should calculate the selected Funnel timeline");
assert.match(
  serverSource,
  /const analysisToMs = getFunnelAnalysisToMs\(toMs, definitions\);[\s\S]*?getAnalyticsEventRecords\(\{ universeId, fromMs, toMs: analysisToMs \}\)/,
  "the Funnel API should load through the conversion window after the selected range end",
);
assert.match(
  serverSource,
  /calculateFunnelAnalytics\(definition, sessions, \{[\s\S]*?entryFromMs: fromMs,[\s\S]*?entryToMs: toMs,/,
  "aggregate Funnel results should remain attributed to entry sessions inside the selected range",
);
assert.match(serverSource, /stepColors\.some\(\(color\) => color && !\/\^#\[0-9a-f\]\{6\}\$\/\.test\(color\)\)/, "the API should validate saved Funnel step colors");
assert.match(serverSource, /stepColors:\s*Array\.isArray\(funnel\?\.stepColors\)/, "the API should serialize saved Funnel step colors");
assert.match(serverSource, /body\?\.stepColors === undefined[\s\S]*?stepColors: existing\.stepColors/, "older Funnel saves should preserve existing step colors");
assert.doesNotMatch(serverSource, /calculateFunnelStepChanges|getFunnelStepChangesForRange/, "the API should not fetch or calculate a separate previous period");
assert.match(styleSource, /\.funnelTimelinePanel\s*\{/, "the Funnel chart should use a dedicated themed panel");
assert.match(styleSource, /\.funnelTimelineStepMenu\s*\{/, "the step selector should use a themed menu");
assert.match(styleSource, /\.funnelColorManagerRow\s*\{/, "the Funnel color manager should use themed step rows");
assert.match(styleSource, /body\[data-active-view="funnels"\] \.funnelTopbarFilters\s*\{[\s\S]*?column-gap:\s*20px/, "the Funnel interval should have clear space before the date range");
assert.match(styleSource, /\.funnelResultSteps\s*\{[\s\S]*?border:\s*1px solid[\s\S]*?border-radius:\s*12px/, "the main Funnel step table should use a themed container");
assert.match(styleSource, /\.funnelStepPlayerCount,[\s\S]*?\.funnelDropCell strong\s*\{[\s\S]*?font-size:\s*18px/, "the main Funnel table values should use the larger scannable number size");
assert.match(styleSource, /\.funnelStepChangesPanel\s*\{/, "the step changes should use a dedicated scannable panel");
assert.match(styleSource, /\.eventCatalog::-webkit-scrollbar,\s*\.funnelCatalog::-webkit-scrollbar\s*\{[\s\S]*?width:\s*6px/, "Events and Funnels should share the same thin themed catalog scrollbar");
assert.match(styleSource, /\.eventCatalog::-webkit-scrollbar-button,\s*\.funnelCatalog::-webkit-scrollbar-button\s*\{[\s\S]*?display:\s*none/, "catalog scrollbars should not show native arrow buttons");

console.log("Funnel timeline assertions passed.");

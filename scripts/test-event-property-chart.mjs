import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const intervalControlMatches = indexSource.match(/id="eventIntervalSelect"/g) || [];
const topbarFiltersIndex = indexSource.indexOf('<div class="topbarFilters"');
const intervalControlIndex = indexSource.indexOf('class="eventIntervalTopbarControl"');
const releaseControlsIndex = indexSource.indexOf('class="releaseTopbarControls"');
assert.equal(intervalControlMatches.length, 1, "the global event interval selector should exist exactly once");
assert.ok(
  topbarFiltersIndex >= 0 && intervalControlIndex > topbarFiltersIndex && intervalControlIndex < releaseControlsIndex,
  "the event interval selector should live in the shared topbar beside the date filters",
);
assert.doesNotMatch(indexSource, /class="eventChartActions"/, "the event chart card should not retain a duplicate interval action");
assert.doesNotMatch(appSource, /data-event-property-view/, "property cards should not include Timeline/Average tabs");
assert.match(
  appSource,
  /<\/header>\s*\$\{renderEventPropertyAverageLegend\(property\)\}\s*<div class="eventPropertyTimeline"/,
  "property cards should render the legend above the timeline",
);
assert.match(appSource, /class="eventPropertyAverageKey"/, "the average legend should retain the original colored key layout");
assert.match(
  appSource,
  /<small><b>AVG<\/b>\$\{formatEventNumber\(entry\.percent\)\}%<\/small>/,
  "each legend key should show its average below an AVG badge",
);
assert.doesNotMatch(appSource, /class="eventPropertyChartLegend"/, "property charts should not repeat the legend below the graph");
const timelineHelperStart = appSource.indexOf("function getEventChartSpanMs(");
const timelineHelperEnd = appSource.indexOf("\nfunction updateEventIntervalControl(", timelineHelperStart);
assert.ok(timelineHelperStart >= 0 && timelineHelperEnd > timelineHelperStart, "event timeline formatting helpers should remain available");

const timelineHelperSource = appSource.slice(timelineHelperStart, timelineHelperEnd);
const { formatEventChartLabel, getEventChartSpanMs, getEventChartWidth } = Function(
  `"use strict";\n${timelineHelperSource}\nreturn { formatEventChartLabel, getEventChartSpanMs, getEventChartWidth };`,
)();
const helperStart = appSource.indexOf("function buildRoundedEventPropertyPath(");
const helperEnd = appSource.indexOf("\nfunction getEventPropertyPriority(", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, "event property chart path helpers should remain available");

const helperSource = appSource.slice(helperStart, helperEnd);
const { buildRoundedEventPropertyPath } = Function(
  `"use strict";\n${helperSource}\nreturn { buildRoundedEventPropertyPath };`,
)();

const periodBucketCounts = new Map([
  ["1m", 240],
  ["5m", 180],
  ["15m", 120],
  ["1h", 72],
  ["6h", 40],
  ["12h", 30],
  ["1d", 30],
  ["7d", 12],
]);
const periodIntervals = new Map([
  ["1m", 60 * 1000],
  ["5m", 5 * 60 * 1000],
  ["15m", 15 * 60 * 1000],
  ["1h", 60 * 60 * 1000],
  ["6h", 6 * 60 * 60 * 1000],
  ["12h", 12 * 60 * 60 * 1000],
  ["1d", 24 * 60 * 60 * 1000],
  ["7d", 7 * 24 * 60 * 60 * 1000],
]);

for (const [period, bucketCount] of periodBucketCounts) {
  const points = Array.from({ length: bucketCount }, (_, index) => ({
    x: 54 + (index * 18),
    y: index > 0 && index % 29 === 0
      ? null
      : 18 + ((Math.sin(index / 4) + 1) * 111),
  }));
  const path = buildRoundedEventPropertyPath(points);
  assert.ok(path.startsWith("M"), `${period} should produce a visible path`);
  assert.ok(!/NaN|Infinity/.test(path), `${period} should not produce invalid coordinates`);
  assert.equal((path.match(/M/g) || []).length, 1, `${period} should keep one continuous trend across empty buckets`);
  assertPathCoordinatesStayBounded(path, 18, 240, period);

  const intervalMs = periodIntervals.get(period);
  const bucketStarts = Array.from({ length: bucketCount }, (_, index) => Date.UTC(2026, 5, 1, 18) + (index * intervalMs));
  const spanMs = getEventChartSpanMs(bucketStarts, intervalMs);
  const label = formatEventChartLabel(bucketStarts[0], intervalMs, spanMs);
  assert.notEqual(label, "--", `${period} should produce a valid axis label`);
  if (intervalMs < 24 * 60 * 60 * 1000 && spanMs >= 24 * 60 * 60 * 1000) {
    assert.notEqual(
      label,
      new Date(bucketStarts[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      `${period} should include the date when its buckets span multiple days`,
    );
  }
}

const sixHourMs = periodIntervals.get("6h");
const sixHourStarts = Array.from({ length: 120 }, (_, index) => Date.UTC(2026, 5, 1, 18) + (index * sixHourMs));
const sixHourSpanMs = getEventChartSpanMs(sixHourStarts, sixHourMs);
const sampledSixHourLabels = sixHourStarts
  .filter((_, index) => index === 0 || index === sixHourStarts.length - 1 || index % 12 === 0)
  .map((start) => formatEventChartLabel(start, sixHourMs, sixHourSpanMs));
assert.equal(
  new Set(sampledSixHourLabels).size,
  sampledSixHourLabels.length,
  "6h labels spanning 30 days should not repeat the same time-only label",
);
assert.equal(
  getEventChartWidth(1960, 120, 116, 10),
  1960,
  "a 6h property timeline should fit a wide card without an unnecessary scrollbar",
);
assert.ok(
  getEventChartWidth(760, 240, 116, 10) > 760,
  "dense timelines should retain horizontal scrolling when points would overlap",
);
assert.equal(formatEventChartLabel("invalid", sixHourMs, sixHourSpanMs), "--", "invalid timestamps should be safe");

assert.equal(buildRoundedEventPropertyPath([]), "", "an empty range should produce no path");
assert.equal(
  buildRoundedEventPropertyPath([{ x: 54, y: 100 }]),
  "M54.00 100.00",
  "a one-bucket range should remain valid",
);
assert.match(
  buildRoundedEventPropertyPath([
    { x: 54, y: 100 },
    { x: 72, y: 80 },
    { x: 90, y: 120 },
  ]),
  /C/,
  "three or more buckets should use rounded cubic segments",
);
assert.equal(
  (buildRoundedEventPropertyPath([
    { x: 54, y: 100 },
    { x: 72, y: 80 },
    { x: 90, y: null },
    { x: 108, y: 120 },
  ]).match(/M/g) || []).length,
  1,
  "empty buckets should preserve a continuous property trend instead of breaking the line",
);

console.log("Event property chart period tests passed.", {
  periods: [...periodBucketCounts.keys()],
});

function assertPathCoordinatesStayBounded(path, minY, maxY, label) {
  const commands = path.match(/[MLC][^MLC]*/g) || [];
  for (const command of commands) {
    const values = command.slice(1).trim().split(/\s+/).map(Number);
    assert.ok(values.every(Number.isFinite), `${label} should only contain finite coordinates`);
    const yCoordinates = command[0] === "C"
      ? [values[1], values[3], values[5]]
      : [values[1]];
    for (const y of yCoordinates) {
      assert.ok(y >= minY && y <= maxY, `${label} should not curve outside the 0–100% plot`);
    }
  }
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const intervalControlMatches = indexSource.match(/id="eventIntervalSelect"/g) || [];
const topbarFiltersIndex = indexSource.indexOf('<div class="topbarFilters"');
const intervalControlIndex = indexSource.indexOf('class="eventIntervalTopbarControl"');
const dateControlIndex = indexSource.indexOf('class="dateFilterCluster"');
const releaseControlsIndex = indexSource.indexOf('class="releaseTopbarControls"');
assert.equal(intervalControlMatches.length, 1, "the global event interval selector should exist exactly once");
assert.ok(
  topbarFiltersIndex >= 0
    && intervalControlIndex > topbarFiltersIndex
    && dateControlIndex > intervalControlIndex
    && dateControlIndex < releaseControlsIndex,
  "the event interval selector should precede the shared date filter cluster",
);
assert.doesNotMatch(indexSource, /allDataFilter|allDataToggle/, "the removed All data control should not remain in the topbar");
assert.doesNotMatch(
  indexSource,
  /class="eventIntervalTopbarControl"[^>]*>\s*<span>Interval<\/span>/,
  "the interval selector should not retain a redundant visible label",
);
assert.doesNotMatch(indexSource, /id="dateVersionPickerButton"/, "the standalone Versions button should be removed");
assert.match(indexSource, /id="movementFromPickerButton"/, "Start should open the themed date picker");
assert.match(indexSource, /id="movementToPickerButton"/, "End should open the themed date picker");
assert.match(indexSource, /id="dateRangePickerPanel"/, "Start and End should share the themed date and time panel");
assert.match(indexSource, /class="dateRangeCalendarGrid"/, "the themed picker should include its own calendar");
assert.match(indexSource, /class="dateRangeVersionSection"/, "the themed picker should include a dedicated Versions section");
assert.doesNotMatch(indexSource, /type="datetime-local"/, "the browser-native datetime picker should not remain");
assert.match(indexSource, /id="movementFromVersionIndicator"/, "Start should show a selected-version indicator");
assert.match(indexSource, /id="movementToVersionIndicator"/, "End should show a selected-version indicator");
assert.match(
  appSource,
  /request\(`\/api\/version-health\?universeId=\$\{encodeURIComponent\(cleanUniverseId\)\}`/,
  "the version panel should reuse the existing version-health endpoint",
);
assert.match(
  appSource,
  /selectedRelease\.inputValue === input\?\.value[\s\S]*return Number\(selectedRelease\.publishedAt\);/,
  "a selected version should preserve its exact recorded release timestamp in date-range requests",
);
assert.match(
  appSource,
  /input\.value = inputValue;[\s\S]*selectedDateReleaseVersions\[dateRangePickerSide\] = \{[\s\S]*publishedAt,/,
  "selecting a version should only set the chosen date boundary and its release metadata",
);
assert.doesNotMatch(appSource, /showDateFilterPicker/, "the removed native date picker should not retain event wiring");
assert.match(
  styleSource,
  /body\[data-active-view="events"\] \.eventIntervalTopbarControl\s*\{[^}]*order:\s*1;/,
  "the interval selector should be the first Events filter",
);
assert.doesNotMatch(indexSource, /eventActivitySection|id="eventChart"/, "the removed Event activity panel should not remain in the page");
assert.doesNotMatch(appSource, /renderCustomEventChart|querySelector\("#eventChart"\)/, "the removed Event activity renderer should not remain");
assert.doesNotMatch(
  styleSource,
  /\.eventActivitySection|\.eventChartHeader|\.eventChartLegend/,
  "the removed Event activity panel should not retain dedicated styling",
);
assert.doesNotMatch(indexSource, /class="eventChartActions"/, "the event chart card should not retain a duplicate interval action");
assert.doesNotMatch(appSource, /data-event-property-view/, "property cards should not include Timeline/Average tabs");
assert.match(
  appSource,
  /<div class="eventPropertyTimeline"[^>]*><\/div>\s*\$\{renderEventPropertyAverageLegend\(property\)\}/,
  "property cards should render the legend below the timeline",
);
assert.match(appSource, /class="eventPropertyAverageKey"/, "the average legend should retain the original colored key layout");
assert.doesNotMatch(appSource, /<small><b>AVG<\/b>/, "property legends should not render average badges");
assert.match(appSource, /class="eventPropertyRanked"/, "each property graph should include a ranked breakdown panel");
assert.match(appSource, /<span role="columnheader">% of Events<\/span>/, "ranked breakdowns should show event percentage");
assert.match(appSource, /<span role="columnheader">Change<\/span>/, "ranked breakdowns should label trend movement as Change");
assert.doesNotMatch(appSource, /<span role="columnheader">Events<\/span>/, "ranked breakdowns should not show raw event counts");
assert.match(
  styleSource,
  /\.eventPropertyBreakdown\s*\{[^}]*grid-template-columns:\s*minmax\(0, 3fr\) minmax\(320px, 2fr\);/,
  "property cards should reserve roughly 60 percent for the graph and 40 percent for the ranked panel",
);
assert.match(
  styleSource,
  /\.eventPropertyAverageKey strong\s*\{[^}]*font-size:\s*14px;/,
  "property legend names should remain large enough to scan",
);
assert.doesNotMatch(styleSource, /\.eventPropertyAverageItem > small/, "removed average rows should not retain styling");
assert.match(
  styleSource,
  /\.eventPropertyCardHeader h2\s*\{[^}]*font-size:\s*21px;/,
  "the Property breakdowns heading should remain prominent",
);
assert.match(
  styleSource,
  /\.eventPropertyBreakdownHeader h3\s*\{[^}]*font-size:\s*21px;/,
  "every property graph heading should remain prominent",
);
assert.doesNotMatch(
  appSource,
  /recorded values\s*·\s*\$\{formatEventNumber\(coverage\)\}% event coverage/,
  "property graph cards should not render the removed subtitle",
);
assert.doesNotMatch(appSource, /class="eventPropertyChartLegend"/, "property charts should not repeat the legend below the graph");
assert.doesNotMatch(
  appSource,
  /formatEventChartLabel\(index === bucketCount - 1 \? timelineEnd : start/,
  "the exact End label should not replace or crowd the final incremental axis label",
);
const changeHelperStart = appSource.indexOf("function getEventPropertySeriesChange(");
const changeHelperEnd = appSource.indexOf("\nfunction renderCustomEventPropertyChart(", changeHelperStart);
assert.ok(changeHelperStart >= 0 && changeHelperEnd > changeHelperStart, "ranked breakdown change helper should remain available");
const { getEventPropertySeriesChange } = Function(
  `"use strict";\n${appSource.slice(changeHelperStart, changeHelperEnd)}\nreturn { getEventPropertySeriesChange };`,
)();
assert.equal(
  getEventPropertySeriesChange([{ percent: 20 }, { percent: null }, { percent: 35 }]),
  15,
  "Change should compare the first and latest observed shares",
);
assert.equal(
  getEventPropertySeriesChange([{ percent: 35 }, { percent: 20 }]),
  -15,
  "Change should retain negative movement",
);
assert.equal(getEventPropertySeriesChange([{ percent: 35 }]), 0, "a single observed share should have neutral change");
const releaseMarkerHelperStart = appSource.indexOf("function buildEventPropertyReleaseMarkers(");
const releaseMarkerHelperEnd = appSource.indexOf("\nfunction buildRoundedEventPropertyPath(", releaseMarkerHelperStart);
assert.ok(
  releaseMarkerHelperStart >= 0 && releaseMarkerHelperEnd > releaseMarkerHelperStart,
  "property release marker renderer should remain available",
);
const { buildEventPropertyReleaseMarkers } = Function(
  `"use strict";
  const formatReleaseVersion = (value) => String(value);
  const escapeHtml = (value) => String(value);
  ${appSource.slice(releaseMarkerHelperStart, releaseMarkerHelperEnd)}
  return { buildEventPropertyReleaseMarkers };`,
)();
const releaseMarkerMarkup = buildEventPropertyReleaseMarkers({
  releaseMarkers: [
    { placeId: 1, placeVersion: 17, publishedAt: 2_000 },
    { placeId: 1, placeVersion: 18, publishedAt: 4_000 },
    { placeId: 1, placeVersion: 19, publishedAt: 5_000 },
  ],
  bucketStarts: [2_000, 3_000],
  bucketMs: 1_000,
  rangeStart: 2_000,
  rangeEnd: 4_000,
  chartWidth: 500,
  left: 50,
  right: 20,
  top: 58,
  plotBottom: 280,
});
assert.match(releaseMarkerMarkup, /Update v17/, "in-range release versions should render on property timelines");
assert.match(releaseMarkerMarkup, /Update v18/, "a release exactly at the selected End should render");
assert.match(releaseMarkerMarkup, /eventPropertyReleaseMarkerLine/, "release markers should include a vertical timeline line");
assert.match(
  releaseMarkerMarkup,
  /eventPropertyReleaseMarkerLine" x1="50\.00"/,
  "a release exactly at the selected Start should align to the graph's left edge",
);
assert.match(
  releaseMarkerMarkup,
  /eventPropertyReleaseMarkerLine" x1="480\.00"/,
  "a release exactly at the selected End should align to the graph's right edge",
);
assert.doesNotMatch(releaseMarkerMarkup, /Update v19/, "out-of-range releases should not render on a timeline");
assert.match(
  buildEventPropertyReleaseMarkers({
    releaseMarkers: [{ placeId: 1, placeVersion: 19, publishedAt: 1_500 }],
    bucketStarts: [1_000],
    bucketMs: 1_000,
    rangeStart: 1_000,
    rangeEnd: 2_000,
    chartWidth: 500,
    left: 50,
    right: 20,
    top: 58,
    plotBottom: 280,
  }),
  /eventPropertyReleaseMarkerLine" x1="265\.00"/,
  "single-bucket timelines should center their release markers",
);
const exactBucketHelperStart = serverSource.indexOf("function buildExactCustomEventBuckets(");
const exactBucketHelperEnd = serverSource.indexOf("\nfunction normalizeCustomEventInterval(", exactBucketHelperStart);
assert.ok(
  exactBucketHelperStart >= 0 && exactBucketHelperEnd > exactBucketHelperStart,
  "exact event-range bucket helpers should remain available",
);
const { buildExactCustomEventBuckets, getExactCustomEventBucketIndex } = Function(
  `"use strict";
  ${serverSource.slice(exactBucketHelperStart, exactBucketHelperEnd)}
  return { buildExactCustomEventBuckets, getExactCustomEventBucketIndex };`,
)();
const exactRangeStart = Date.UTC(2026, 5, 24, 6);
const exactRangeEnd = Date.UTC(2026, 6, 6, 6, 48);
const sevenDayMs = 7 * 24 * 60 * 60 * 1000;
const exactBuckets = buildExactCustomEventBuckets(exactRangeStart, exactRangeEnd, sevenDayMs);
assert.deepEqual(
  exactBuckets,
  [
    { start: exactRangeStart, end: exactRangeStart + sevenDayMs },
    { start: exactRangeStart + sevenDayMs, end: exactRangeEnd },
  ],
  "7d buckets should begin at the selected version time and retain a partial final bucket at the exact End",
);
assert.equal(
  getExactCustomEventBucketIndex(exactRangeStart, exactRangeStart, exactRangeEnd, sevenDayMs, exactBuckets.length),
  0,
  "the exact Start should belong to the first bucket",
);
assert.equal(
  getExactCustomEventBucketIndex(exactRangeEnd, exactRangeStart, exactRangeEnd, sevenDayMs, exactBuckets.length),
  1,
  "the exact End should remain in the final partial bucket",
);
assert.equal(
  getExactCustomEventBucketIndex(exactRangeStart - 1, exactRangeStart, exactRangeEnd, sevenDayMs, exactBuckets.length),
  -1,
  "data before the exact Start should never enter a chart bucket",
);
for (const intervalMs of [
  60 * 1000,
  5 * 60 * 1000,
  15 * 60 * 1000,
  60 * 60 * 1000,
  6 * 60 * 60 * 1000,
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  sevenDayMs,
]) {
  const rangeEnd = exactRangeStart + (intervalMs * 2) + 1_234;
  const buckets = buildExactCustomEventBuckets(exactRangeStart, rangeEnd, intervalMs);
  assert.equal(buckets[0].start, exactRangeStart, `${intervalMs}ms should preserve the exact Start`);
  assert.equal(buckets.at(-1).end, rangeEnd, `${intervalMs}ms should preserve the exact End`);
  assert.equal(buckets.length, 3, `${intervalMs}ms should retain its partial final bucket`);
}
assert.doesNotMatch(
  serverSource,
  /const bucketStart = Math\.floor\(fromMs \/ bucketMs\)/,
  "event timelines should not floor the selected Start to an interval boundary",
);
assert.match(
  serverSource,
  /releaseMarkers:\s*\(Array\.isArray\(filters\.releaseMarkers\)\s*\?\s*filters\.releaseMarkers\s*:\s*\[\]\)\s*\.filter\(/,
  "selected event payloads should expose production release markers filtered to relevant places",
);
assert.match(
  serverSource,
  /getVersionHealthFromQuery\(searchParams,\s*\{\s*includeMapSnapshot:\s*false\s*\}\)/,
  "Events should load release timestamps without fetching an unused map snapshot",
);
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
const { buildRoundedEventPropertyPath, completeEventPropertyPathPoints } = Function(
  `"use strict";\n${helperSource}\nreturn { buildRoundedEventPropertyPath, completeEventPropertyPathPoints };`,
)();
assert.deepEqual(
  completeEventPropertyPathPoints(
    [
      { x: 90, y: 100 },
      { x: 160, y: 80 },
    ],
    54,
    480,
  ).map((point) => ({ x: point.x, y: point.y })),
  [
    { x: 54, y: 100 },
    { x: 90, y: 100 },
    { x: 160, y: 80 },
    { x: 480, y: 80 },
  ],
  "a property line should extend its nearest observed values to both graph boundaries",
);

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

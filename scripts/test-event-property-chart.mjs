import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const intervalControlMatches = indexSource.match(/id="eventIntervalSelect"/g) || [];
const stylesheetAssetVersion = indexSource.match(/\/assets\/([^/"]+)\/styles\.css/)?.[1] || "";
const appAssetVersion = indexSource.match(/\/assets\/([^/"]+)\/app\.js/)?.[1] || "";
const topbarFiltersIndex = indexSource.indexOf('<div class="topbarFilters eventTopbarFilters"');
const intervalControlIndex = indexSource.indexOf('class="eventIntervalTopbarControl"');
const dateControlIndex = indexSource.indexOf('class="dateFilterCluster"');
const releaseControlsIndex = indexSource.indexOf('class="releaseTopbarControls"');
assert.equal(intervalControlMatches.length, 1, "the global event interval selector should exist exactly once");
assert.ok(stylesheetAssetVersion, "the dashboard stylesheet should have an explicit cache version");
assert.equal(appAssetVersion, stylesheetAssetVersion, "the interval markup, styles, and click behavior should deploy with one asset version");
assert.match(
  appSource,
  new RegExp(`const DASHBOARD_ASSET_VERSION = "${appAssetVersion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}";`),
  "the runtime asset version should match the HTML asset version",
);
assert.match(
  indexSource,
  /class="eventIntervalSelect eventIntervalButton"[^>]*id="eventIntervalButton"[^>]*aria-haspopup="listbox"/,
  "the interval control should use a themed listbox trigger with the previous selector as a styled fallback",
);
assert.match(
  indexSource,
  /id="eventIntervalButton"[\s\S]*?<svg[^>]*width="14"[^>]*height="14"/,
  "the interval chevron should retain safe intrinsic dimensions before the latest stylesheet loads",
);
assert.match(indexSource, /id="eventIntervalMenu"[^>]*role="listbox"/, "the interval control should include a themed options menu");
assert.match(indexSource, /id="eventIntervalSelect"[^>]*hidden/, "the native interval select should remain only as the hidden data source");
assert.match(
  appSource,
  /eventIntervalButton\?\.addEventListener\("click", toggleEventIntervalMenu\);/,
  "clicking the interval trigger should open its custom dropdown",
);
assert.ok(
  topbarFiltersIndex >= 0
    && intervalControlIndex > topbarFiltersIndex
    && dateControlIndex > intervalControlIndex,
  "the event interval selector should precede the shared date filter cluster",
);
assert.equal(releaseControlsIndex, -1, "the removed Releases page should not leave topbar controls behind");
assert.doesNotMatch(indexSource, /data-dashboard-view="releases"/, "the Releases navigation tab should be removed");
assert.doesNotMatch(indexSource, /data-view-panel="releases"/, "the Releases page panel should be removed");
assert.doesNotMatch(appSource, /window\.location\.hash === "#releases"/, "the removed Releases route should fall back to Overview");
assert.doesNotMatch(appSource, /function loadReleases\(/, "the removed Releases page loader should not remain");
assert.doesNotMatch(styleSource, /\.releaseTopbarControls/, "the removed Releases controls should not retain dead styles");
assert.doesNotMatch(indexSource, /allDataFilter|allDataToggle/, "the removed All data control should not remain in the topbar");
assert.doesNotMatch(
  indexSource,
  /class="eventIntervalTopbarControl"[^>]*>\s*<span>Interval<\/span>/,
  "the interval selector should not retain a redundant visible label",
);
assert.doesNotMatch(indexSource, /id="dateVersionPickerButton"/, "the standalone Versions button should be removed");
assert.match(indexSource, /id="movementFromPickerButton"/, "Start should open the themed date picker");
assert.match(indexSource, /id="movementToPickerButton"/, "End should open the themed date picker");
assert.match(indexSource, /id="funnelFromPickerButton"[^>]*data-date-range-context="funnels"/, "Funnels should have an independent Start picker");
assert.match(indexSource, /id="funnelToPickerButton"[^>]*data-date-range-context="funnels"/, "Funnels should have an independent End picker");
assert.equal((indexSource.match(/id="dateRangePickerPanel"/g) || []).length, 1, "Events and Funnels should reuse one themed picker panel");
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
  /input\.value = inputValue;[\s\S]*elements\.selectedReleases\[dateRangePickerSide\] = \{[\s\S]*publishedAt,/,
  "selecting a version should only set the chosen date boundary and its release metadata",
);
assert.match(
  appSource,
  /const selectedDateReleaseVersions = \{ from: null, to: null \};\s*const selectedFunnelDateReleaseVersions = \{ from: null, to: null \};/,
  "Events and Funnels should retain separate date-range release selections",
);
assert.match(
  appSource,
  /const from = getDashboardDateFilterMs\(funnelFromFilter\);\s*const to = getDashboardDateFilterMs\(funnelToFilter\);[\s\S]*request\(`\/api\/funnels\?/,
  "Funnel analytics should query with the Funnel-specific date range",
);
assert.match(
  appSource,
  /activeCluster\.append\(dateRangePickerPanel\);/,
  "the shared date picker should open beside the active Events or Funnels date control",
);
assert.match(indexSource, /id="funnelExitButton"[^>]*data-dashboard-view="overview"/, "the Funnel catalog should include a dashboard back button");
assert.match(indexSource, /class="eventCatalogTitle funnelCatalogTitle">Funnels</, "the Funnel catalog should replace the main sidebar title");
assert.match(
  indexSource,
  /class="funnelTopbarSelection"[\s\S]*id="funnelResultsTitle"[\s\S]*id="editFunnelButton"[\s\S]*id="funnelMoreButton"/,
  "the selected Funnel title, Edit steps, and overflow menu should share the topbar",
);
assert.doesNotMatch(indexSource, /class="funnelResultsHeader"/, "Funnel actions should no longer remain above the results");
assert.match(
  styleSource,
  /body\[data-active-view="funnels"\]:not\(\.isLocked\) \.sidebar\s*\{[^}]*display:\s*none;/,
  "entering Funnels should hide the main dashboard sidebar",
);
assert.doesNotMatch(appSource, /showDateFilterPicker/, "the removed native date picker should not retain event wiring");
assert.match(
  styleSource,
  /body\[data-active-view="events"\] \.eventIntervalTopbarControl\s*\{[^}]*order:\s*1;/,
  "the interval selector should be the first Events filter",
);
assert.match(
  styleSource,
  /body\[data-active-view="events"\] \.eventIntervalTopbarControl\s*\{[^}]*align-self:\s*flex-end;/,
  "the interval selector should align to the bottom of the date range",
);
assert.match(styleSource, /\.eventIntervalMenu\s*\{[^}]*background:\s*rgba\(9, 16, 33, 0\.99\);/, "the interval menu should use the dashboard theme");
assert.match(appSource, /function handleEventIntervalMenuClick\(/, "the custom interval menu should preserve interval selection behavior");
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
assert.match(appSource, /<span role="columnheader">Events<\/span>/, "ranked breakdowns should show raw event counts");
assert.match(appSource, /<span role="columnheader">% of Events<\/span>/, "event percentage should keep a direct header");
assert.match(appSource, /<span role="columnheader">% of Players<\/span>/, "player percentage should keep a direct header");
assert.match(appSource, /<span role="columnheader">Avg Player Share<\/span>/, "equal-player share should keep a direct header");
assert.doesNotMatch(appSource, /\((?:Activity|Reach|Preference)\)<\/span>/, "metric headers should remove explanatory parentheticals");
assert.doesNotMatch(appSource, /<span role="columnheader">Change<\/span>/, "ranked breakdowns should remove the confusing Change column");
assert.match(
  appSource,
  /const eventCount = Math\.max\(0, Math\.round\(Number\(entry\.count\) \|\| 0\)\);[\s\S]*class="eventPropertyRankedEvents"/,
  "ranked breakdown event totals should use the real series count",
);
assert.match(
  appSource,
  /const percentPlayers = Math\.max\([\s\S]*Number\(entry\.percentPlayers\)[\s\S]*const averagePlayerShare = Math\.max\([\s\S]*Number\(entry\.averagePlayerShare\)/,
  "ranked breakdowns should render backend-calculated player reach and average player share",
);
assert.match(
  appSource,
  /renderEventPropertyMetricChange\(entry\.points, "percent"[\s\S]*renderEventPropertyMetricChange\(entry\.points, "percentPlayers"[\s\S]*"averagePlayerShare"/,
  "each percentage should render its own timeline change",
);
assert.match(
  appSource,
  /class="eventPropertyMetricChange eventPropertyMetricChange-\$\{direction\}"[\s\S]*\(<span aria-hidden="true">\$\{arrow\}<\/span>\$\{changeText\}\)/,
  "inline changes should render in parentheses beside their percentage",
);
assert.match(appSource, /aria-colspan="6">No data yet/, "empty ranked breakdowns should span all six columns");
assert.match(
  styleSource,
  /\.eventPropertyRankedTableHeader,\s*\.eventPropertyRankedRow\s*\{[^}]*grid-template-columns:\s*42px\s+minmax\(220px, 1fr\)\s+minmax\(100px, 0\.18fr\)\s+minmax\(205px, 0\.34fr\)\s+minmax\(205px, 0\.34fr\)\s+minmax\(235px, 0\.4fr\);[^}]*gap:\s*18px;[^}]*min-width:\s*1120px;/,
  "full-width ranked breakdowns should reserve a clearly spaced six-column layout",
);
assert.match(
  styleSource,
  /\.eventPropertyRankedRow > b\s*\{[^}]*font-size:\s*15px;/,
  "ranked breakdown event and player metrics should remain prominent",
);
assert.doesNotMatch(styleSource, /\.eventPropertyChange/, "removed Change cells should not retain dead styling");
assert.match(styleSource, /\.eventPropertyMetricChange-positive\s*\{[^}]*color:\s*#48d597;/, "increases should render green");
assert.match(styleSource, /\.eventPropertyMetricChange-negative\s*\{[^}]*color:\s*#fb7185;/, "decreases should render red");
assert.match(
  serverSource,
  /\^\\\/assets\\\/\[A-Za-z0-9\._-\]\+\\\/\(app\\\.js\|styles\\\.css\|heatmap\\\.js\)\$/,
  "versioned dashboard asset paths should resolve only the approved static assets",
);
assert.match(
  styleSource,
  /\.eventPropertyBreakdown\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/,
  "the property graph and ranked breakdown should stack at full width",
);
assert.match(appSource, /function renderEventPropertyTabs\(/, "properties should render as a focused tab bar");
assert.match(appSource, /role="tablist"/, "the property navigation should expose tab semantics");
assert.match(appSource, /EVENT_PROPERTY_PRIMARY_TAB_LIMIT = 6;/, "large property sets should move excess tabs into More");
assert.match(appSource, /class="eventPropertyMoreMenu"/, "overflow properties should remain available from a More menu");
assert.match(
  appSource,
  /selectedEventPropertyName = selectedProperty\.name;[\s\S]*renderEventPropertyTabs\(visibleProperties, selectedProperty\.name,\s*\{[\s\S]*renderCustomEventPropertyCard\(selectedProperty, selectedPropertyIndex\)/,
  "the property workspace should render only the active property's graph and breakdown",
);
assert.match(
  appSource,
  /if \(selectedEventPropertyEventName !== nextSelectedEventName\) \{[\s\S]*selectedEventPropertyName = "";/,
  "property selection should reset only when the selected event changes",
);
assert.match(
  styleSource,
  /\.eventPropertyChartPane\s*\{[^}]*min-height:\s*450px;/,
  "the full-width property graph should use the larger chart height",
);
assert.match(indexSource, /id="eventValueManagerDialog"/, "custom properties should expose a value and color manager");
assert.match(
  appSource,
  /class="eventPropertyManageValuesButton"[\s\S]*Manage values &amp; colors/,
  "the value manager should sit beside the property tabs",
);
assert.match(
  appSource,
  /const EVENT_PROPERTY_VALUE_LIMIT = 8;/,
  "the selected property workspace should support up to eight readable values",
);
assert.match(
  appSource,
  /function getEventPropertySeriesColor\([\s\S]*savedColor[\s\S]*identity\.charCodeAt/,
  "saved colors should win while automatic values retain deterministic colors across rank changes",
);
assert.match(
  appSource,
  /Number\(entry\.count\) > 0 \|\| entry\.managed/,
  "manual values should remain visible before their first event arrives",
);
assert.match(
  appSource,
  /valueSettings:\s*result\.settings/,
  "saving the value manager should persist its names, colors, and deletions on the event definition",
);
assert.match(
  appSource,
  /data-event-value-display-name=/,
  "automatically discovered values should support editable display names",
);
assert.match(
  appSource,
  /<span>Display name<\/span>[\s\S]*<span>Roblox value<\/span>/,
  "managed values should keep separately labeled display and Roblox value fields visible",
);
assert.doesNotMatch(
  appSource,
  /eventValueManagerRawSummary|data-event-value-action="edit-raw"|\(N\/A\)/,
  "the value manager should not hide real values behind the removed parenthesized interaction",
);
assert.match(appSource, /data-event-value-input=/, "the real Roblox value editor should remain editable");
assert.match(
  appSource,
  /class="eventValueManagerColorWheel"[\s\S]*type="color"[\s\S]*class="eventValueManagerHexInput"/,
  "each managed value should provide both a visible color picker and an editable hex value",
);
assert.match(
  styleSource,
  /\.eventValueManagerColorWheel\s*\{[^}]*cursor:\s*pointer;/,
  "the native color picker should be presented as an obvious interactive control",
);
assert.match(
  appSource,
  /entry\.displayName[\s\S]*formatEventPropertyValue\(entry\.value\)/,
  "charts and breakdowns should prefer a saved display name while retaining the raw value",
);
const valueManagerHelperStart = appSource.indexOf("function getEventValueManagerDisplayName(");
const valueManagerHelperEnd = appSource.indexOf("\nfunction addEventValueManagerRow(", valueManagerHelperStart);
assert.ok(
  valueManagerHelperStart >= 0 && valueManagerHelperEnd > valueManagerHelperStart,
  "the display-name fallback helper should remain extractable",
);
const {
  getEventValueManagerDisplayName,
} = Function(
  `"use strict";
  const formatEventPropertyValue = (value) => String(value);
  ${appSource.slice(valueManagerHelperStart, valueManagerHelperEnd)}
  return { getEventValueManagerDisplayName };`,
)();
assert.equal(
  getEventValueManagerDisplayName({ value: "Shotgun", displayName: "" }),
  "Shotgun",
  "an unset display name should visibly fall back to the real Roblox value",
);
assert.match(
  serverSource,
  /filter\(\(observation\) => !hiddenValueKeys\.has\(getCustomEventPropertyValueKey\(observation\)\)\)/,
  "deleted automatic values should remain suppressed when new events contain them",
);
assert.match(
  serverSource,
  /color:\s*series\.color \|\| ""[\s\S]*managed:\s*Boolean\(series\.managed\)/,
  "saved value presentation should flow through the server timeline response",
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
assert.match(indexSource, /id="eventPropertyHeaderEventCount"/, "the Property breakdowns header should show an Events metric");
assert.match(indexSource, /id="eventPropertyHeaderPlayerCount"/, "the Property breakdowns header should show a Players metric");
assert.match(indexSource, /id="eventPropertyHeaderSessionCount"/, "the Property breakdowns header should show a Sessions metric");
assert.match(indexSource, /id="eventPropertyHeaderSessionCoverage"/, "the Property breakdowns header should show Session coverage");
assert.doesNotMatch(indexSource, /id="selectedEventSubtitle"/, "the selected event should not retain a subtitle");
assert.match(
  appSource,
  /eventPropertyHeaderEventCount\.textContent = loading[\s\S]*selectedEvent\?\.count/,
  "the Events header metric should use the selected event total",
);
assert.match(
  appSource,
  /eventPropertyHeaderPlayerCount\.textContent = loading[\s\S]*selectedEvent\?\.uniquePlayers/,
  "the Players header metric should use the selected event player total",
);
assert.match(
  appSource,
  /eventPropertyHeaderSessionCount\.textContent = loading[\s\S]*selectedEvent\?\.uniqueSessions/,
  "the Sessions header metric should use the selected event session total",
);
assert.match(
  appSource,
  /eventPropertyHeaderSessionCoverage\.textContent = loading \|\| sessionCoverage === null[\s\S]*formatEventNumber\(sessionCoverage\)/,
  "Session coverage should move into the Property breakdowns header",
);
assert.doesNotMatch(appSource, /selectedEventSubtitle/, "event subtitle rendering should be removed");
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
const metricChangeHelperStart = appSource.indexOf("function getEventPropertySeriesMetricChange(");
const metricChangeHelperEnd = appSource.indexOf("\nfunction renderEventPropertyMetricChange(", metricChangeHelperStart);
assert.ok(
  metricChangeHelperStart >= 0 && metricChangeHelperEnd > metricChangeHelperStart,
  "inline metric change helper should remain available",
);
const { getEventPropertySeriesMetricChange } = Function(
  `"use strict";\n${appSource.slice(metricChangeHelperStart, metricChangeHelperEnd)}\nreturn { getEventPropertySeriesMetricChange };`,
)();
const metricChangePoints = [
  { percent: 20, percentPlayers: 50, averagePlayerShare: 60 },
  { percent: null, percentPlayers: 75, averagePlayerShare: null },
  { percent: 35, percentPlayers: 40, averagePlayerShare: 25 },
];
assert.equal(getEventPropertySeriesMetricChange(metricChangePoints, "percent"), 15, "event share change should follow the timeline");
assert.equal(getEventPropertySeriesMetricChange(metricChangePoints, "percentPlayers"), -10, "player reach change should follow its own timeline");
assert.equal(
  getEventPropertySeriesMetricChange(metricChangePoints, "averagePlayerShare"),
  -35,
  "average player share change should follow its own timeline",
);
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

import { calculateFunnelAnalytics, groupCustomEventsBySession } from "./funnels.mjs";

const MIN_COHORT_SESSIONS = 20;
const MIN_AFFECTED_SESSIONS = 20;
const MIN_EVENT_PLAYERS = 100;
const SIGNIFICANT_Z_SCORE = 1.96;
const HIGH_CONFIDENCE_Z_SCORE = 2.58;
const MIN_RATE_CHANGE_POINTS = 2;
const MIN_FUNNEL_CHANGE_POINTS = 3;
const MIN_DURATION_CHANGE_PERCENT = 15;
const MIN_EVENT_CHANGE_PERCENT = 20;
const LEAVE_AREA_GRID_SIZE_STUDS = 48;
const MAX_EVENT_COMPARISONS = 8;
const MAX_LEAVE_AREA_COMPARISONS = 5;
const MAX_FINDINGS = 7;
const MIN_PLATFORM_COVERAGE_PERCENT = 70;
const MATERIAL_MIX_SHIFT_POINTS = 10;

const PURCHASE_EVENT_NAMES = new Set([
  "item_purchased",
  "product_purchased",
  "gamepass_purchased",
  "purchase_completed",
  "purchase_succeeded",
  "checkout_completed",
  "transaction_completed",
]);

export function buildReleaseComparison(options = {}) {
  const placeId = cleanInteger(options.placeId);
  const beforeCohort = options.before || null;
  const afterCohort = options.after || null;
  if (!beforeCohort || !afterCohort) return null;

  const funnelDefinitions = Array.isArray(options.funnelDefinitions) ? options.funnelDefinitions : [];
  const events = Array.isArray(options.events) ? options.events : [];
  const beforeEvents = events.filter((event) => eventMatchesVersion(event, placeId, beforeCohort.placeVersion));
  const afterEvents = events.filter((event) => eventMatchesVersion(event, placeId, afterCohort.placeVersion));
  const before = buildVersionMetricSnapshot(beforeCohort, beforeEvents, funnelDefinitions);
  const after = buildVersionMetricSnapshot(afterCohort, afterEvents, funnelDefinitions);
  const coreMetrics = buildCoreMetricComparisons(before, after);
  const funnels = buildFunnelComparisons(funnelDefinitions, before, after);
  const eventsByName = buildEventComparisons(before, after);
  const leaveAreas = buildLeaveAreaComparisons(before, after);
  const ready = beforeCohort.meetsMinimumSessions && afterCohort.meetsMinimumSessions;
  const partialData = hasPartialComparisonData(before) || hasPartialComparisonData(after);
  const rawFindingItems = ready
    ? buildDeterministicFindings({ coreMetrics, funnels, eventsByName, leaveAreas })
    : [];
  const trafficAdjustment = buildTrafficMatchedComparison({
    placeId,
    beforeCohort,
    afterCohort,
    events,
    funnelDefinitions,
    beforeRecordCoverage: before.recordCoverage,
    afterRecordCoverage: after.recordCoverage,
    ready,
  });
  const findingItems = trafficAdjustment.status === "ready" ? trafficAdjustment.findings.items : [];
  const findingsBasis = trafficAdjustment.status === "ready" ? "traffic_matched" : "suppressed_until_matched";

  return {
    status: ready ? "ready" : "collecting",
    generatedDeterministically: true,
    methodology: {
      cohort: "exact_place_version",
      significanceThresholdPercent: 95,
      minimumCohortSessions: MIN_COHORT_SESSIONS,
      minimumAffectedSessions: MIN_AFFECTED_SESSIONS,
      minimumPlayersForEventRateFinding: MIN_EVENT_PLAYERS,
      findingsBasis,
      note: "Raw values are always shown. Findings use deterministic exact-matched sessions by player lifecycle and observed platform, and are suppressed when the balanced sample is too small.",
    },
    samples: {
      before: serializeMetricSample(before),
      after: serializeMetricSample(after),
    },
    dataQuality: {
      partial: partialData,
      before: before.recordCoverage,
      after: after.recordCoverage,
      note: partialData
        ? "Some retained version samples are capped. Affected metric values are labeled partial and cannot produce findings."
        : "Required death, leave, and custom-event samples cover the stored version totals.",
    },
    coreMetrics,
    funnels,
    events: eventsByName,
    leaveAreas,
    trafficAdjustment,
    rawFindings: serializeFindings(rawFindingItems, "raw_exact_version"),
    findings: {
      basis: findingsBasis,
      regressions: findingItems.filter((finding) => finding.outcome === "regression").length,
      improvements: findingItems.filter((finding) => finding.outcome === "improvement").length,
      observations: findingItems.filter((finding) => finding.outcome === "observation").length,
      items: findingItems,
      note: trafficAdjustment.status === "ready"
        ? trafficAdjustment.findings.note
        : "No release conclusion is generated until at least 20 sessions per side remain after exact traffic matching.",
    },
  };
}

function buildVersionMetricSnapshot(cohort, events, funnelDefinitions, options = {}) {
  const playerIds = new Set();
  const customEvents = [];
  const deathEvents = [];
  const leaveEvents = [];
  const purchaseEvents = [];
  const sessionDurationSeconds = [];

  for (const event of events) {
    const userId = cleanInteger(event?.userId);
    if (userId > 0) playerIds.add(userId);
    const eventName = normalizeEventName(event?.eventName);
    if (event?.sourceType !== "system") customEvents.push(event);
    if (eventName === "player_died") deathEvents.push(event);
    if (eventName === "player_left") {
      leaveEvents.push(event);
      const duration = cleanFiniteNumber(event?.sessionDurationSeconds ?? event?.properties?.sessionDurationSeconds);
      if (duration !== null && duration >= 0) sessionDurationSeconds.push(duration);
    }
    if (event?.sourceType !== "system" && isPurchaseEventName(eventName)) purchaseEvents.push(event);
  }

  const sessions = groupCustomEventsBySession(events);
  const funnelAnalytics = new Map(funnelDefinitions.map((definition) => [
    String(definition.id || ""),
    calculateFunnelAnalytics(definition, sessions),
  ]));
  const recordCoverage = options.recordCoverage || {
    customEvents: buildRecordCoverage(customEvents.length, cohort?.records?.customEvents),
    deaths: buildRecordCoverage(deathEvents.length, cohort?.records?.deaths),
    leaves: buildRecordCoverage(leaveEvents.length, cohort?.records?.leaves),
  };

  return {
    cohort,
    events,
    sessions,
    sessionCount: options.sessionCount === undefined
      ? Math.max(cleanInteger(cohort.sessionCount), sessions.length)
      : Math.max(cleanInteger(options.sessionCount), 0),
    playerCount: playerIds.size,
    customEvents,
    deathEvents,
    deathSessionCount: countUniqueEventSessions(deathEvents),
    leaveEvents,
    leaveSessionCount: countUniqueEventSessions(leaveEvents),
    purchaseEvents,
    purchaseSessionCount: countUniqueEventSessions(purchaseEvents),
    sessionDurationSeconds,
    funnelAnalytics,
    recordCoverage,
  };
}

function serializeMetricSample(snapshot) {
  return {
    placeVersion: cleanInteger(snapshot.cohort?.placeVersion),
    sessions: snapshot.sessionCount,
    players: snapshot.playerCount,
    events: snapshot.events.length,
    customEvents: snapshot.customEvents.length,
    deaths: snapshot.deathEvents.length,
    leaves: snapshot.leaveEvents.length,
    purchases: snapshot.purchaseEvents.length,
    sessionDurationSamples: snapshot.sessionDurationSeconds.length,
    recordCoverage: snapshot.recordCoverage,
  };
}

function buildCoreMetricComparisons(before, after) {
  return [
    createProportionMetric({
      id: "death_session_rate",
      label: "Sessions with a death",
      description: "Share of tracked sessions containing at least one death.",
      betterDirection: "lower",
      beforeNumerator: before.deathSessionCount,
      beforeDenominator: before.sessionCount,
      afterNumerator: after.deathSessionCount,
      afterDenominator: after.sessionCount,
      dataComplete: before.recordCoverage.deaths.complete && after.recordCoverage.deaths.complete,
    }),
    createProportionMetric({
      id: "purchase_session_rate",
      label: "Purchase session rate",
      description: "Share of tracked sessions containing a completed purchase event.",
      betterDirection: "higher",
      beforeNumerator: before.purchaseSessionCount,
      beforeDenominator: before.sessionCount,
      afterNumerator: after.purchaseSessionCount,
      afterDenominator: after.sessionCount,
      dataComplete: before.recordCoverage.customEvents.complete && after.recordCoverage.customEvents.complete,
    }),
    createRateMetric({
      id: "custom_events_per_player",
      label: "Custom events per player",
      description: "Custom event volume divided by players observed in the cohort.",
      unit: "per_player",
      betterDirection: "contextual",
      beforeNumerator: before.customEvents.length,
      beforeDenominator: before.playerCount,
      afterNumerator: after.customEvents.length,
      afterDenominator: after.playerCount,
      dataComplete: before.recordCoverage.customEvents.complete && after.recordCoverage.customEvents.complete,
    }),
    createMedianMetric({
      id: "median_session_duration",
      label: "Median session duration",
      description: "Median duration from join until the recorded player leave.",
      unit: "minutes",
      betterDirection: "higher",
      beforeValues: before.sessionDurationSeconds.map((seconds) => seconds / 60),
      afterValues: after.sessionDurationSeconds.map((seconds) => seconds / 60),
      dataComplete: before.recordCoverage.leaves.complete && after.recordCoverage.leaves.complete,
    }),
  ];
}

function buildFunnelComparisons(definitions, before, after) {
  return definitions.map((definition) => {
    const id = String(definition.id || "");
    const beforeAnalytics = before.funnelAnalytics.get(id) || {};
    const afterAnalytics = after.funnelAnalytics.get(id) || {};
    return {
      id,
      name: cleanString(definition.name, 80) || "Funnel",
      steps: Array.isArray(definition.steps) ? definition.steps.map(normalizeEventName).filter(Boolean) : [],
      metric: createProportionMetric({
        id: `funnel:${id}`,
        label: cleanString(definition.name, 80) || "Funnel conversion",
        description: "Completed sessions divided by sessions entering the first funnel step.",
        betterDirection: "higher",
        beforeNumerator: beforeAnalytics.completedSessions,
        beforeDenominator: beforeAnalytics.entrySessions,
        afterNumerator: afterAnalytics.completedSessions,
        afterDenominator: afterAnalytics.entrySessions,
        dataComplete: before.recordCoverage.customEvents.complete && after.recordCoverage.customEvents.complete,
      }),
      before: {
        entrySessions: cleanInteger(beforeAnalytics.entrySessions),
        completedSessions: cleanInteger(beforeAnalytics.completedSessions),
        medianCompletionMs: cleanInteger(beforeAnalytics.medianCompletionMs),
      },
      after: {
        entrySessions: cleanInteger(afterAnalytics.entrySessions),
        completedSessions: cleanInteger(afterAnalytics.completedSessions),
        medianCompletionMs: cleanInteger(afterAnalytics.medianCompletionMs),
      },
    };
  });
}

function buildEventComparisons(before, after) {
  const beforeByName = summarizeEventsByName(before.customEvents);
  const afterByName = summarizeEventsByName(after.customEvents);
  const names = new Set([...beforeByName.keys(), ...afterByName.keys()]);
  return [...names].map((eventName) => {
    const beforeSummary = beforeByName.get(eventName) || { count: 0 };
    const afterSummary = afterByName.get(eventName) || { count: 0 };
    return {
      eventName,
      metric: createRateMetric({
        id: `event:${eventName}`,
        label: eventName,
        description: "Event occurrences divided by all observed players in the cohort.",
        unit: "per_player",
        betterDirection: "contextual",
        beforeNumerator: beforeSummary.count,
        beforeDenominator: before.playerCount,
        afterNumerator: afterSummary.count,
        afterDenominator: after.playerCount,
        dataComplete: before.recordCoverage.customEvents.complete && after.recordCoverage.customEvents.complete,
      }),
    };
  }).sort((left, right) => (
    Math.max(right.metric.before.numerator, right.metric.after.numerator)
    - Math.max(left.metric.before.numerator, left.metric.after.numerator)
    || left.eventName.localeCompare(right.eventName)
  )).slice(0, MAX_EVENT_COMPARISONS);
}

function summarizeEventsByName(events) {
  const summaries = new Map();
  for (const event of events) {
    const eventName = normalizeEventName(event?.eventName);
    if (!eventName) continue;
    const summary = summaries.get(eventName) || { count: 0 };
    summary.count += 1;
    summaries.set(eventName, summary);
  }
  return summaries;
}

function buildLeaveAreaComparisons(before, after) {
  const beforeAreas = groupLeaveAreas(before.leaveEvents);
  const afterAreas = groupLeaveAreas(after.leaveEvents);
  const keys = new Set([...beforeAreas.keys(), ...afterAreas.keys()]);
  return [...keys].map((key) => {
    const beforeArea = beforeAreas.get(key) || { count: 0, xTotal: 0, yTotal: 0, zTotal: 0 };
    const afterArea = afterAreas.get(key) || { count: 0, xTotal: 0, yTotal: 0, zTotal: 0 };
    const coordinateSource = afterArea.count ? afterArea : beforeArea;
    const x = coordinateSource.count ? coordinateSource.xTotal / coordinateSource.count : 0;
    const y = coordinateSource.count ? coordinateSource.yTotal / coordinateSource.count : 0;
    const z = coordinateSource.count ? coordinateSource.zTotal / coordinateSource.count : 0;
    const metric = createProportionMetric({
      id: `leave_area:${key}`,
      label: `Near X ${Math.round(x)}, Z ${Math.round(z)}`,
      description: "Share of all recorded leaves occurring in this map cell.",
      betterDirection: "lower",
      beforeNumerator: beforeArea.count,
      beforeDenominator: before.leaveEvents.length,
      afterNumerator: afterArea.count,
      afterDenominator: after.leaveEvents.length,
      dataComplete: before.recordCoverage.leaves.complete && after.recordCoverage.leaves.complete,
    });
    return {
      id: key,
      label: metric.label,
      x: roundNumber(x, 1),
      y: roundNumber(y, 1),
      z: roundNumber(z, 1),
      gridSizeStuds: LEAVE_AREA_GRID_SIZE_STUDS,
      metric,
    };
  }).sort((left, right) => (
    Math.abs(right.metric.delta) - Math.abs(left.metric.delta)
    || right.metric.after.numerator - left.metric.after.numerator
    || left.id.localeCompare(right.id)
  )).slice(0, MAX_LEAVE_AREA_COMPARISONS);
}

function groupLeaveAreas(events) {
  const areas = new Map();
  for (const event of events) {
    const x = cleanFiniteNumber(event?.x);
    const y = cleanFiniteNumber(event?.y);
    const z = cleanFiniteNumber(event?.z);
    if (x === null || y === null || z === null) continue;
    const gridX = Math.floor(x / LEAVE_AREA_GRID_SIZE_STUDS);
    const gridZ = Math.floor(z / LEAVE_AREA_GRID_SIZE_STUDS);
    const key = `${gridX}:${gridZ}`;
    const area = areas.get(key) || { count: 0, xTotal: 0, yTotal: 0, zTotal: 0 };
    area.count += 1;
    area.xTotal += x;
    area.yTotal += y;
    area.zTotal += z;
    areas.set(key, area);
  }
  return areas;
}

function buildTrafficMatchedComparison(context) {
  const sessionCatalog = buildReleaseSessionCatalog(context.events, context.placeId);
  const beforeSessions = sessionCatalog.filter((session) => session.placeVersion === cleanInteger(context.beforeCohort?.placeVersion));
  const afterSessions = sessionCatalog.filter((session) => session.placeVersion === cleanInteger(context.afterCohort?.placeVersion));
  const beforeCoverage = buildSessionContextCoverage(beforeSessions, context.beforeCohort?.sessionCount);
  const afterCoverage = buildSessionContextCoverage(afterSessions, context.afterCohort?.sessionCount);
  const strata = buildTrafficStrata(beforeSessions, afterSessions);
  const selectedBeforeIds = new Set();
  const selectedAfterIds = new Set();

  for (const stratum of strata) {
    const matchCount = Math.min(stratum.beforeSessions.length, stratum.afterSessions.length);
    stratum.matchedSessions = matchCount;
    selectStableMatchedSessions(stratum.beforeSessions, matchCount, `before:${stratum.key}`)
      .forEach((session) => selectedBeforeIds.add(session.id));
    selectStableMatchedSessions(stratum.afterSessions, matchCount, `after:${stratum.key}`)
      .forEach((session) => selectedAfterIds.add(session.id));
  }

  const matchedSessionCount = Math.min(selectedBeforeIds.size, selectedAfterIds.size);
  const status = context.ready && matchedSessionCount >= MIN_COHORT_SESSIONS ? "ready" : "insufficient_sample";
  const platformCoverageSufficient = beforeCoverage.platformPercent >= MIN_PLATFORM_COVERAGE_PERCENT
    && afterCoverage.platformPercent >= MIN_PLATFORM_COVERAGE_PERCENT;
  const mixShiftPoints = calculateTrafficMixShift(strata, beforeSessions.length, afterSessions.length);
  const segments = strata.map((stratum) => serializeTrafficStratum(
    stratum,
    beforeSessions.length,
    afterSessions.length,
  ));
  const emptyFindings = serializeFindings([], "traffic_matched");

  if (matchedSessionCount < 1) {
    return {
      status,
      method: "deterministic_exact_matching",
      dimensions: ["player_lifecycle", "platform"],
      platformCoverageSufficient,
      minimumPlatformCoveragePercent: MIN_PLATFORM_COVERAGE_PERCENT,
      materialMixShiftPoints: MATERIAL_MIX_SHIFT_POINTS,
      mixShiftPoints,
      materialMixShift: mixShiftPoints >= MATERIAL_MIX_SHIFT_POINTS,
      coverage: { before: beforeCoverage, after: afterCoverage },
      samples: { before: { sessions: 0 }, after: { sessions: 0 } },
      segments,
      coreMetrics: [],
      funnels: [],
      events: [],
      leaveAreas: [],
      findings: {
        ...emptyFindings,
        note: "There are no shared lifecycle and platform strata to compare yet.",
      },
    };
  }

  const beforeEvents = context.events.filter((event) => (
    eventMatchesVersion(event, context.placeId, context.beforeCohort?.placeVersion)
    && selectedBeforeIds.has(cleanString(event?.sessionId, 180))
  ));
  const afterEvents = context.events.filter((event) => (
    eventMatchesVersion(event, context.placeId, context.afterCohort?.placeVersion)
    && selectedAfterIds.has(cleanString(event?.sessionId, 180))
  ));
  const before = buildVersionMetricSnapshot(context.beforeCohort, beforeEvents, context.funnelDefinitions, {
    sessionCount: matchedSessionCount,
    recordCoverage: context.beforeRecordCoverage,
  });
  const after = buildVersionMetricSnapshot(context.afterCohort, afterEvents, context.funnelDefinitions, {
    sessionCount: matchedSessionCount,
    recordCoverage: context.afterRecordCoverage,
  });
  const coreMetrics = buildCoreMetricComparisons(before, after);
  const funnels = buildFunnelComparisons(context.funnelDefinitions, before, after);
  const events = buildEventComparisons(before, after);
  const leaveAreas = buildLeaveAreaComparisons(before, after);
  const rawFindingItems = status === "ready"
    ? buildDeterministicFindings({ coreMetrics, funnels, eventsByName: events, leaveAreas })
    : [];
  const findingItems = rawFindingItems.map((finding) => ({
    ...finding,
    confidence: platformCoverageSufficient ? finding.confidence : "directional",
    method: `Exact-matched by first-seen/returning status and observed platform. ${finding.method}${platformCoverageSufficient ? "" : " Platform coverage is below the recommended threshold, so confidence is directional."}`,
  }));

  return {
    status,
    method: "deterministic_exact_matching",
    dimensions: ["player_lifecycle", "platform"],
    lifecycleDefinition: "First-seen means the player's earliest session in retained PlayLens telemetry; later sessions are returning.",
    platformDefinition: "Platform comes from validated player context or event properties. Unknown platform remains a separate matched stratum.",
    platformCoverageSufficient,
    minimumPlatformCoveragePercent: MIN_PLATFORM_COVERAGE_PERCENT,
    materialMixShiftPoints: MATERIAL_MIX_SHIFT_POINTS,
    mixShiftPoints,
    materialMixShift: mixShiftPoints >= MATERIAL_MIX_SHIFT_POINTS,
    coverage: { before: beforeCoverage, after: afterCoverage },
    samples: {
      before: { ...serializeMetricSample(before), retainedPercent: percentOf(matchedSessionCount, beforeSessions.length) },
      after: { ...serializeMetricSample(after), retainedPercent: percentOf(matchedSessionCount, afterSessions.length) },
    },
    segments,
    mix: {
      lifecycle: summarizeTrafficDimension(segments, "lifecycle"),
      platform: summarizeTrafficDimension(segments, "platform"),
    },
    coreMetrics,
    funnels,
    events,
    leaveAreas,
    findings: {
      ...serializeFindings(findingItems, "traffic_matched"),
      note: platformCoverageSufficient
        ? "Findings use equal-sized exact matches inside every shared first-seen/returning and platform stratum."
        : `Findings are lifecycle-matched, but observed platform coverage is below ${MIN_PLATFORM_COVERAGE_PERCENT}% on at least one side and is labeled directional.`,
    },
  };
}

function buildReleaseSessionCatalog(events, placeId) {
  const sessionsById = new Map();
  for (const event of events) {
    if (cleanInteger(event?.placeId) !== cleanInteger(placeId)) continue;
    if (cleanInteger(event?.placeVersion) <= 0 || String(event?.environment || "production").toLowerCase() !== "production") continue;
    const id = cleanString(event?.sessionId, 180);
    const userId = cleanInteger(event?.userId);
    if (!id || userId <= 0) continue;
    const timestamp = getReleaseEventTimestamp(event);
    const existing = sessionsById.get(id) || {
      id,
      userId,
      placeVersion: cleanInteger(event?.placeVersion),
      firstObservedAt: timestamp,
      platform: "Unknown",
      lifecycle: "first_seen",
    };
    existing.firstObservedAt = existing.firstObservedAt > 0 && timestamp > 0
      ? Math.min(existing.firstObservedAt, timestamp)
      : Math.max(existing.firstObservedAt, timestamp);
    const platform = getReleaseEventPlatform(event);
    if (existing.platform === "Unknown" && platform !== "Unknown") existing.platform = platform;
    sessionsById.set(id, existing);
  }

  const sessionsByPlayer = new Map();
  for (const session of sessionsById.values()) {
    const playerSessions = sessionsByPlayer.get(session.userId) || [];
    playerSessions.push(session);
    sessionsByPlayer.set(session.userId, playerSessions);
  }
  for (const playerSessions of sessionsByPlayer.values()) {
    playerSessions.sort((left, right) => left.firstObservedAt - right.firstObservedAt || left.id.localeCompare(right.id));
    playerSessions.forEach((session, index) => { session.lifecycle = index === 0 ? "first_seen" : "returning"; });
  }
  return [...sessionsById.values()];
}

function buildSessionContextCoverage(sessions, expectedSessions) {
  const observedSessions = sessions.length;
  const platformSessions = sessions.filter((session) => session.platform !== "Unknown").length;
  const firstSeenSessions = sessions.filter((session) => session.lifecycle === "first_seen").length;
  return {
    expectedSessions: Math.max(cleanInteger(expectedSessions), observedSessions),
    eligibleSessions: observedSessions,
    eligiblePercent: percentOf(observedSessions, Math.max(cleanInteger(expectedSessions), observedSessions)),
    platformSessions,
    platformPercent: percentOf(platformSessions, observedSessions),
    firstSeenSessions,
    firstSeenPercent: percentOf(firstSeenSessions, observedSessions),
    returningSessions: Math.max(observedSessions - firstSeenSessions, 0),
  };
}

function buildTrafficStrata(beforeSessions, afterSessions) {
  const strata = new Map();
  const add = (session, side) => {
    const key = `${session.lifecycle}:${session.platform}`;
    const stratum = strata.get(key) || {
      key,
      lifecycle: session.lifecycle,
      platform: session.platform,
      beforeSessions: [],
      afterSessions: [],
      matchedSessions: 0,
    };
    stratum[side].push(session);
    strata.set(key, stratum);
  };
  beforeSessions.forEach((session) => add(session, "beforeSessions"));
  afterSessions.forEach((session) => add(session, "afterSessions"));
  return [...strata.values()].sort((left, right) => (
    Math.max(right.beforeSessions.length, right.afterSessions.length) - Math.max(left.beforeSessions.length, left.afterSessions.length)
    || left.key.localeCompare(right.key)
  ));
}

function selectStableMatchedSessions(sessions, count, salt) {
  return [...sessions].sort((left, right) => (
    stableHash(`${salt}:${left.id}`) - stableHash(`${salt}:${right.id}`)
    || left.id.localeCompare(right.id)
  )).slice(0, count);
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function serializeTrafficStratum(stratum, beforeTotal, afterTotal) {
  return {
    key: stratum.key,
    lifecycle: stratum.lifecycle,
    lifecycleLabel: stratum.lifecycle === "returning" ? "Returning" : "First seen",
    platform: stratum.platform,
    before: {
      sessions: stratum.beforeSessions.length,
      sharePercent: percentOf(stratum.beforeSessions.length, beforeTotal),
    },
    after: {
      sessions: stratum.afterSessions.length,
      sharePercent: percentOf(stratum.afterSessions.length, afterTotal),
    },
    matchedSessions: stratum.matchedSessions,
  };
}

function summarizeTrafficDimension(segments, dimension) {
  const summaries = new Map();
  for (const segment of segments) {
    const value = segment[dimension];
    const summary = summaries.get(value) || { value, beforeSessions: 0, afterSessions: 0, matchedSessions: 0 };
    summary.beforeSessions += segment.before.sessions;
    summary.afterSessions += segment.after.sessions;
    summary.matchedSessions += segment.matchedSessions;
    summaries.set(value, summary);
  }
  const beforeTotal = [...summaries.values()].reduce((total, item) => total + item.beforeSessions, 0);
  const afterTotal = [...summaries.values()].reduce((total, item) => total + item.afterSessions, 0);
  return [...summaries.values()].map((item) => ({
    ...item,
    label: dimension === "lifecycle" ? (item.value === "returning" ? "Returning" : "First seen") : item.value,
    beforeSharePercent: percentOf(item.beforeSessions, beforeTotal),
    afterSharePercent: percentOf(item.afterSessions, afterTotal),
  })).sort((left, right) => right.beforeSessions + right.afterSessions - left.beforeSessions - left.afterSessions);
}

function calculateTrafficMixShift(strata, beforeTotal, afterTotal) {
  if (beforeTotal <= 0 || afterTotal <= 0) return 0;
  const absoluteShift = strata.reduce((total, stratum) => total + Math.abs(
    (stratum.beforeSessions.length / beforeTotal) - (stratum.afterSessions.length / afterTotal)
  ), 0);
  return roundNumber((absoluteShift / 2) * 100, 2);
}

function getReleaseEventTimestamp(event) {
  return cleanInteger(event?.occurredAt)
    || cleanInteger(event?.sentAt)
    || cleanInteger(event?.diedAt)
    || cleanInteger(event?.leftAt)
    || cleanInteger(event?.sampledAt)
    || cleanInteger(event?.receivedAt);
}

function getReleaseEventPlatform(event) {
  const direct = normalizeReleasePlatform(event?.platform || event?.device);
  if (direct !== "Unknown") return direct;
  const properties = event?.properties && typeof event.properties === "object" ? event.properties : {};
  const platformEntry = Object.entries(properties).find(([key]) => (
    ["platform", "device", "roblox_device_type", "robloxdevicetype"].includes(String(key).toLowerCase())
  ));
  const value = Array.isArray(platformEntry?.[1]) ? platformEntry[1][0] : platformEntry?.[1];
  return normalizeReleasePlatform(value);
}

function normalizeReleasePlatform(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[^a-z]/g, "");
  if (["desktop", "computer", "pc", "windows", "mac"].includes(normalized)) return "Desktop";
  if (["mobile", "phone", "ios", "android"].includes(normalized)) return "Mobile";
  if (normalized === "tablet") return "Tablet";
  if (["console", "xbox", "playstation"].includes(normalized)) return "Console";
  if (normalized === "vr") return "VR";
  return "Unknown";
}

function percentOf(numerator, denominator) {
  return denominator > 0 ? roundNumber((numerator / denominator) * 100, 2) : 0;
}

function serializeFindings(items, basis) {
  return {
    basis,
    regressions: items.filter((finding) => finding.outcome === "regression").length,
    improvements: items.filter((finding) => finding.outcome === "improvement").length,
    observations: items.filter((finding) => finding.outcome === "observation").length,
    items,
  };
}

function buildDeterministicFindings(context) {
  const findings = [];
  for (const metric of context.coreMetrics) {
    if (metric.id === "death_session_rate" || metric.id === "purchase_session_rate") {
      const finding = createSignificantProportionFinding(metric, MIN_RATE_CHANGE_POINTS, "sessions");
      if (finding) findings.push(finding);
    } else if (metric.id === "median_session_duration") {
      const finding = createMedianFinding(metric);
      if (finding) findings.push(finding);
    }
  }

  for (const funnel of context.funnels) {
    const finding = createSignificantProportionFinding(funnel.metric, MIN_FUNNEL_CHANGE_POINTS, "funnel entries", {
      type: "funnel",
      titleSubject: funnel.name,
    });
    if (finding) findings.push(finding);
  }

  const eventFinding = context.eventsByName
    .map((event) => createEventRateFinding(event.metric))
    .filter(Boolean)
    .sort((left, right) => right.effectSize - left.effectSize)[0];
  if (eventFinding) findings.push(eventFinding);

  for (const area of context.leaveAreas) {
    const finding = createSignificantProportionFinding(area.metric, MIN_FUNNEL_CHANGE_POINTS, "recorded leaves", {
      type: "leave_area",
      titleSubject: area.label,
    });
    if (finding) findings.push(finding);
  }

  const outcomeOrder = { regression: 0, improvement: 1, observation: 2 };
  return findings.sort((left, right) => (
    outcomeOrder[left.outcome] - outcomeOrder[right.outcome]
    || right.effectSize - left.effectSize
    || left.title.localeCompare(right.title)
  )).slice(0, MAX_FINDINGS);
}

function createSignificantProportionFinding(metric, minimumPointChange, sampleLabel, options = {}) {
  if (!metric.available || !metric.dataComplete) return null;
  const before = metric.before;
  const after = metric.after;
  const affected = before.numerator + after.numerator;
  if (before.denominator < MIN_COHORT_SESSIONS || after.denominator < MIN_COHORT_SESSIONS) return null;
  if (affected < MIN_AFFECTED_SESSIONS || Math.abs(metric.delta) < minimumPointChange) return null;
  const zScore = twoProportionZScore(before.numerator, before.denominator, after.numerator, after.denominator);
  if (Math.abs(zScore) < SIGNIFICANT_Z_SCORE) return null;

  const increased = metric.delta > 0;
  const outcome = metric.betterDirection === "lower"
    ? (increased ? "regression" : "improvement")
    : (increased ? "improvement" : "regression");
  const titleSubject = options.titleSubject || metric.label;
  return {
    id: metric.id,
    type: options.type || "metric",
    outcome,
    confidence: getFindingConfidence(zScore, before.denominator, after.denominator),
    title: `${titleSubject} ${increased ? "increased" : "decreased"}`,
    summary: `${formatPercent(before.value)} to ${formatPercent(after.value)} (${formatSigned(metric.delta)} percentage points) across ${before.denominator} before and ${after.denominator} after ${sampleLabel}.`,
    method: "Two-proportion z-test at 95% confidence plus a minimum practical effect threshold.",
    effectSize: Math.abs(metric.delta),
    evidence: {
      before: { numerator: before.numerator, denominator: before.denominator, value: before.value },
      after: { numerator: after.numerator, denominator: after.denominator, value: after.value },
      zScore: roundNumber(zScore, 3),
    },
  };
}

function createMedianFinding(metric) {
  if (!metric.available || !metric.dataComplete) return null;
  if (metric.before.sampleSize < MIN_COHORT_SESSIONS || metric.after.sampleSize < MIN_COHORT_SESSIONS) return null;
  if (metric.relativeDeltaPercent === null || Math.abs(metric.relativeDeltaPercent) < MIN_DURATION_CHANGE_PERCENT) return null;
  const increased = metric.delta > 0;
  return {
    id: metric.id,
    type: "metric",
    outcome: increased ? "improvement" : "regression",
    confidence: Math.min(metric.before.sampleSize, metric.after.sampleSize) >= 100 ? "high" : "directional",
    title: `Median session duration ${increased ? "increased" : "decreased"}`,
    summary: `${formatMinutes(metric.before.value)} to ${formatMinutes(metric.after.value)} (${formatSigned(metric.relativeDeltaPercent)}%). Based on ${metric.before.sampleSize} before and ${metric.after.sampleSize} after completed-session samples.`,
    method: `Median changed by at least ${MIN_DURATION_CHANGE_PERCENT}%; no distribution-level significance claim is made.`,
    effectSize: Math.abs(metric.relativeDeltaPercent),
    evidence: {
      before: { sampleSize: metric.before.sampleSize, value: metric.before.value },
      after: { sampleSize: metric.after.sampleSize, value: metric.after.value },
    },
  };
}

function createEventRateFinding(metric) {
  if (!metric.available || !metric.dataComplete || metric.relativeDeltaPercent === null) return null;
  if (metric.before.denominator < MIN_EVENT_PLAYERS || metric.after.denominator < MIN_EVENT_PLAYERS) return null;
  if (metric.before.numerator + metric.after.numerator < MIN_AFFECTED_SESSIONS) return null;
  if (Math.abs(metric.relativeDeltaPercent) < MIN_EVENT_CHANGE_PERCENT) return null;
  const increased = metric.delta > 0;
  return {
    id: metric.id,
    type: "event",
    outcome: "observation",
    confidence: "directional",
    title: `${metric.label} rate ${increased ? "increased" : "decreased"}`,
    summary: `${formatNumber(metric.before.value)} to ${formatNumber(metric.after.value)} events per player (${formatSigned(metric.relativeDeltaPercent)}%) across ${metric.before.denominator} before and ${metric.after.denominator} after players.`,
    method: `Event rate changed by at least ${MIN_EVENT_CHANGE_PERCENT}% with at least ${MIN_EVENT_PLAYERS} observed players in each cohort. Event direction is contextual, not labeled good or bad.`,
    effectSize: Math.abs(metric.relativeDeltaPercent),
    evidence: {
      before: { numerator: metric.before.numerator, denominator: metric.before.denominator, value: metric.before.value },
      after: { numerator: metric.after.numerator, denominator: metric.after.denominator, value: metric.after.value },
    },
  };
}

function createProportionMetric(options) {
  return createRateMetric({ ...options, unit: "percent", multiplier: 100 });
}

function createRateMetric(options) {
  const multiplier = Number(options.multiplier) || 1;
  const beforeNumerator = cleanInteger(options.beforeNumerator);
  const beforeDenominator = cleanInteger(options.beforeDenominator);
  const afterNumerator = cleanInteger(options.afterNumerator);
  const afterDenominator = cleanInteger(options.afterDenominator);
  const beforeValue = beforeDenominator > 0 ? (beforeNumerator / beforeDenominator) * multiplier : null;
  const afterValue = afterDenominator > 0 ? (afterNumerator / afterDenominator) * multiplier : null;
  return finalizeMetric(options, {
    before: { value: beforeValue, numerator: beforeNumerator, denominator: beforeDenominator, sampleSize: beforeDenominator },
    after: { value: afterValue, numerator: afterNumerator, denominator: afterDenominator, sampleSize: afterDenominator },
  });
}

function createMedianMetric(options) {
  const beforeValues = options.beforeValues.filter(Number.isFinite).sort((left, right) => left - right);
  const afterValues = options.afterValues.filter(Number.isFinite).sort((left, right) => left - right);
  return finalizeMetric(options, {
    before: { value: median(beforeValues), numerator: null, denominator: null, sampleSize: beforeValues.length },
    after: { value: median(afterValues), numerator: null, denominator: null, sampleSize: afterValues.length },
  });
}

function finalizeMetric(options, values) {
  const beforeValue = values.before.value;
  const afterValue = values.after.value;
  const available = Number.isFinite(beforeValue) && Number.isFinite(afterValue);
  const delta = available ? afterValue - beforeValue : null;
  const relativeDeltaPercent = available && beforeValue !== 0
    ? (delta / Math.abs(beforeValue)) * 100
    : null;
  return {
    id: String(options.id || ""),
    label: cleanString(options.label, 100),
    description: cleanString(options.description, 240),
    unit: options.unit || "number",
    betterDirection: options.betterDirection || "contextual",
    dataComplete: options.dataComplete !== false,
    available,
    before: serializeMetricValue(values.before),
    after: serializeMetricValue(values.after),
    delta: delta === null ? null : roundNumber(delta, 2),
    relativeDeltaPercent: relativeDeltaPercent === null ? null : roundNumber(relativeDeltaPercent, 1),
    direction: !available || Math.abs(delta) < 0.0001 ? "neutral" : delta > 0 ? "up" : "down",
  };
}

function serializeMetricValue(value) {
  return {
    value: Number.isFinite(value.value) ? roundNumber(value.value, 2) : null,
    numerator: Number.isFinite(value.numerator) ? value.numerator : null,
    denominator: Number.isFinite(value.denominator) ? value.denominator : null,
    sampleSize: cleanInteger(value.sampleSize),
  };
}

function countUniqueEventSessions(events) {
  return new Set(events.map(getEventSessionKey).filter(Boolean)).size;
}

function buildRecordCoverage(observedCount, expectedCount) {
  const observed = cleanInteger(observedCount);
  const expected = cleanInteger(expectedCount);
  if (expected <= 0) {
    return { observed, expected, percent: 100, complete: true };
  }
  return {
    observed,
    expected,
    percent: roundNumber(Math.min(100, (observed / expected) * 100), 1),
    complete: observed >= expected,
  };
}

function hasPartialComparisonData(snapshot) {
  return Object.values(snapshot.recordCoverage || {}).some((coverage) => !coverage.complete);
}

function getEventSessionKey(event) {
  const sessionId = cleanString(event?.sessionId, 180);
  if (!sessionId) return "";
  const userId = cleanInteger(event?.userId);
  return `${userId}:${sessionId}`;
}

function eventMatchesVersion(event, placeId, placeVersion) {
  return cleanInteger(event?.placeId) === placeId
    && cleanInteger(event?.placeVersion) === cleanInteger(placeVersion)
    && String(event?.environment || "production").toLowerCase() === "production";
}

function isPurchaseEventName(eventName) {
  if (PURCHASE_EVENT_NAMES.has(eventName)) return true;
  if (/prompt|started|initiated|cancel|fail|declin|refund/.test(eventName)) return false;
  return /(^|[_.:-])(purchased|purchase_complete|purchase_success|checkout_complete|transaction_complete)([_.:-]|$)/.test(eventName);
}

function twoProportionZScore(beforeSuccesses, beforeTotal, afterSuccesses, afterTotal) {
  if (beforeTotal <= 0 || afterTotal <= 0) return 0;
  const pooled = (beforeSuccesses + afterSuccesses) / (beforeTotal + afterTotal);
  const standardError = Math.sqrt(pooled * (1 - pooled) * ((1 / beforeTotal) + (1 / afterTotal)));
  if (!Number.isFinite(standardError) || standardError <= 0) return 0;
  return ((afterSuccesses / afterTotal) - (beforeSuccesses / beforeTotal)) / standardError;
}

function getFindingConfidence(zScore, beforeTotal, afterTotal) {
  if (Math.abs(zScore) >= HIGH_CONFIDENCE_Z_SCORE && Math.min(beforeTotal, afterTotal) >= 100) return "high";
  if (Math.min(beforeTotal, afterTotal) >= 50) return "medium";
  return "provisional";
}

function median(values) {
  if (!values.length) return null;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

function normalizeEventName(value) {
  const eventName = cleanString(value, 64).toLowerCase();
  return /^[a-z][a-z0-9_.:-]{0,63}$/.test(eventName) ? eventName : "";
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function cleanFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundNumber(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function formatPercent(value) {
  return `${formatNumber(value)}%`;
}

function formatMinutes(value) {
  return `${formatNumber(value)} minutes`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Number(value) || 0);
}

function formatSigned(value) {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}${formatNumber(number)}`;
}

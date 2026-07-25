export function groupCustomEventsBySession(events) {
  const sessionsById = new Map();
  for (const event of Array.isArray(events) ? events : []) {
    const userId = cleanPositiveInteger(event?.userId);
    const sessionId = cleanString(event?.sessionId, 180);
    if (userId <= 0 || !sessionId) continue;
    const key = `${userId}:${sessionId}`;
    let session = sessionsById.get(key);
    if (!session) {
      session = { userId, sessionId, events: [] };
      sessionsById.set(key, session);
    }
    session.events.push(event);
  }
  for (const session of sessionsById.values()) {
    session.events.sort((left, right) => getEventTimestamp(left) - getEventTimestamp(right));
  }
  return [...sessionsById.values()];
}

export function calculateFunnelAnalytics(definition, sessions) {
  const eventNames = Array.isArray(definition?.steps) ? definition.steps.map(normalizeEventName).filter(Boolean) : [];
  const steps = eventNames.map((eventName) => ({
    eventName,
    sessions: 0,
    playerIds: new Set(),
    elapsedFromStartTotalMs: 0,
    elapsedFromPreviousTotalMs: 0,
    elapsedFromPreviousValuesMs: [],
    elapsedCount: 0,
  }));
  const completionDurations = [];
  const conversionWindowMs = Math.max(cleanPositiveInteger(definition?.conversionWindowMinutes), 1) * 60 * 1000;

  for (const session of Array.isArray(sessions) ? sessions : []) {
    let searchIndex = 0;
    let firstTimestamp = 0;
    let previousTimestamp = 0;
    let reached = 0;

    for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
      const expectedName = steps[stepIndex].eventName;
      let matchedTimestamp = 0;
      let matchedIndex = -1;
      for (let eventIndex = searchIndex; eventIndex < session.events.length; eventIndex += 1) {
        const event = session.events[eventIndex];
        const timestamp = getEventTimestamp(event);
        if (firstTimestamp && timestamp - firstTimestamp > conversionWindowMs) break;
        if (normalizeEventName(event?.eventName) !== expectedName) continue;
        matchedTimestamp = timestamp;
        matchedIndex = eventIndex;
        break;
      }
      if (matchedIndex < 0) break;

      if (!firstTimestamp) firstTimestamp = matchedTimestamp;
      const step = steps[stepIndex];
      step.sessions += 1;
      step.playerIds.add(session.userId);
      if (stepIndex > 0) {
        step.elapsedFromStartTotalMs += matchedTimestamp - firstTimestamp;
        step.elapsedFromPreviousTotalMs += matchedTimestamp - previousTimestamp;
        step.elapsedFromPreviousValuesMs.push(matchedTimestamp - previousTimestamp);
        step.elapsedCount += 1;
      }
      previousTimestamp = matchedTimestamp;
      searchIndex = matchedIndex + 1;
      reached = stepIndex + 1;
    }

    if (reached === steps.length && steps.length) completionDurations.push(previousTimestamp - firstTimestamp);
  }

  const entrySessions = steps[0]?.sessions || 0;
  const resultSteps = steps.map((step, index) => {
    const previousSessions = index > 0 ? steps[index - 1].sessions : step.sessions;
    const nextSessions = index < steps.length - 1 ? steps[index + 1].sessions : step.sessions;
    return {
      index: index + 1,
      eventName: step.eventName,
      sessions: step.sessions,
      uniquePlayers: step.playerIds.size,
      conversionFromStart: entrySessions ? roundPercentage(step.sessions / entrySessions) : 0,
      conversionFromPrevious: previousSessions ? roundPercentage(step.sessions / previousSessions) : 0,
      dropOffSessions: index < steps.length - 1 ? Math.max(step.sessions - nextSessions, 0) : 0,
      averageTimeFromStartMs: step.elapsedCount ? Math.round(step.elapsedFromStartTotalMs / step.elapsedCount) : 0,
      averageTimeFromPreviousMs: step.elapsedCount ? Math.round(step.elapsedFromPreviousTotalMs / step.elapsedCount) : 0,
      medianTimeFromPreviousMs: medianNumber(step.elapsedFromPreviousValuesMs),
    };
  });

  return {
    totalTrackedSessions: Array.isArray(sessions) ? sessions.length : 0,
    entrySessions,
    completedSessions: steps.at(-1)?.sessions || 0,
    overallConversion: entrySessions ? roundPercentage((steps.at(-1)?.sessions || 0) / entrySessions) : 0,
    medianCompletionMs: medianNumber(completionDurations),
    steps: resultSteps,
  };
}

export function calculateFunnelTimelineAnalytics(definition, sessions, buckets) {
  const eventNames = Array.isArray(definition?.steps) ? definition.steps.map(normalizeEventName).filter(Boolean) : [];
  const conversionWindowMs = Math.max(cleanPositiveInteger(definition?.conversionWindowMinutes), 1) * 60 * 1000;
  const cleanBuckets = (Array.isArray(buckets) ? buckets : [])
    .map((bucket) => ({
      start: cleanTimestampMs(bucket?.start),
      end: cleanTimestampMs(bucket?.end),
      entrySessions: 0,
      stepSessions: eventNames.map(() => 0),
    }))
    .filter((bucket) => bucket.start > 0 && bucket.end >= bucket.start);

  for (const session of Array.isArray(sessions) ? sessions : []) {
    const matchedEvents = matchFunnelSessionEvents(eventNames, session?.events, conversionWindowMs);
    const entryTimestamp = getEventTimestamp(matchedEvents[0]);
    if (!entryTimestamp) continue;
    const bucketIndex = cleanBuckets.findIndex((bucket, index) => (
      entryTimestamp >= bucket.start
      && (index === cleanBuckets.length - 1 ? entryTimestamp <= bucket.end : entryTimestamp < bucket.end)
    ));
    const bucket = cleanBuckets[bucketIndex];
    if (!bucket) continue;
    bucket.entrySessions += 1;
    for (let stepIndex = 0; stepIndex < matchedEvents.length; stepIndex += 1) {
      bucket.stepSessions[stepIndex] += 1;
    }
  }

  return cleanBuckets.map((bucket) => ({
    start: bucket.start,
    end: bucket.end,
    entrySessions: bucket.entrySessions,
    steps: eventNames.map((eventName, index) => ({
      index: index + 1,
      eventName,
      sessions: bucket.stepSessions[index],
      percentage: bucket.entrySessions ? roundPercentage(bucket.stepSessions[index] / bucket.entrySessions) : null,
    })),
  }));
}

export function calculateFunnelStepChanges(definition, sessions, ranges, options = {}) {
  const eventNames = Array.isArray(definition?.steps) ? definition.steps.map(normalizeEventName).filter(Boolean) : [];
  const conversionWindowMs = Math.max(cleanPositiveInteger(definition?.conversionWindowMinutes), 1) * 60 * 1000;
  const minimumEligibleSessions = Math.max(cleanPositiveInteger(options.minimumEligibleSessions), 30);
  const minimumDifferencePoints = Math.max(Number(options.minimumDifferencePoints) || 2, 0);
  const confidenceZ = Math.max(Number(options.confidenceZ) || 1.96, 0);
  const currentRange = normalizeFunnelCohortRange(ranges?.current);
  const previousRange = normalizeFunnelCohortRange(ranges?.previous);
  const currentCounts = countFunnelCohortSteps(eventNames, sessions, conversionWindowMs, currentRange);
  const previousCounts = countFunnelCohortSteps(eventNames, sessions, conversionWindowMs, previousRange);

  const steps = eventNames.map((eventName, index) => {
    const currentReachedSessions = currentCounts[index] || 0;
    const previousReachedSessions = previousCounts[index] || 0;
    const currentEligibleSessions = index > 0 ? currentCounts[index - 1] || 0 : currentReachedSessions;
    const previousEligibleSessions = index > 0 ? previousCounts[index - 1] || 0 : previousReachedSessions;
    const currentConversion = index === 0
      ? (currentReachedSessions ? 100 : null)
      : percentageOrNull(currentReachedSessions, currentEligibleSessions);
    const previousConversion = index === 0
      ? (previousReachedSessions ? 100 : null)
      : percentageOrNull(previousReachedSessions, previousEligibleSessions);
    const changePercentagePoints = currentConversion === null || previousConversion === null
      ? null
      : roundPercentagePoints(currentConversion - previousConversion);
    const hasEnoughData = currentEligibleSessions >= minimumEligibleSessions
      && previousEligibleSessions >= minimumEligibleSessions;
    const isMeaningful = index > 0
      && hasEnoughData
      && Math.abs(changePercentagePoints || 0) >= minimumDifferencePoints
      && hasSignificantProportionDifference(
        currentReachedSessions,
        currentEligibleSessions,
        previousReachedSessions,
        previousEligibleSessions,
        confidenceZ,
      );
    const signal = index === 0
      ? "baseline"
      : isMeaningful
        ? (changePercentagePoints > 0 ? "improved" : "declined")
        : "stable";

    return {
      index: index + 1,
      eventName,
      currentReachedSessions,
      currentEligibleSessions,
      currentConversion,
      previousReachedSessions,
      previousEligibleSessions,
      previousConversion,
      changePercentagePoints,
      signal,
    };
  });
  return {
    current: {
      start: currentRange.start,
      end: Math.max(currentRange.endExclusive - 1, currentRange.start),
      entrySessions: currentCounts[0] || 0,
    },
    previous: {
      start: previousRange.start,
      end: Math.max(previousRange.endExclusive - 1, previousRange.start),
      entrySessions: previousCounts[0] || 0,
    },
    minimumEligibleSessions,
    minimumDifferencePoints,
    steps,
  };
}

export function calculateFunnelMapSamples(definition, sessions, requestedStepIndex, requestedMode = "reached") {
  const eventNames = Array.isArray(definition?.steps) ? definition.steps.map(normalizeEventName).filter(Boolean) : [];
  const stepIndex = Math.max(0, Math.min(cleanPositiveInteger(requestedStepIndex) - 1, eventNames.length - 1));
  const mode = requestedMode === "dropped" && stepIndex < eventNames.length - 1 ? "dropped" : "reached";
  const conversionWindowMs = Math.max(cleanPositiveInteger(definition?.conversionWindowMinutes), 1) * 60 * 1000;
  const samples = [];
  let qualifyingSessions = 0;

  if (!eventNames.length) {
    return {
      stepIndex: 0,
      stepNumber: 0,
      stepEventName: "",
      nextStepEventName: "",
      mode,
      qualifyingSessions: 0,
      mappedSessions: 0,
      unmappedSessions: 0,
      samples,
    };
  }

  for (const session of Array.isArray(sessions) ? sessions : []) {
    const matchedEvents = matchFunnelSessionEvents(eventNames, session?.events, conversionWindowMs);
    const targetEvent = matchedEvents[stepIndex];
    if (!targetEvent) continue;

    const reachedNextStep = Boolean(matchedEvents[stepIndex + 1]);
    if (mode === "dropped" && reachedNextStep) continue;
    qualifyingSessions += 1;

    const mapEvent = mode === "dropped"
      ? getLastMappedEventAfterStep(session?.events, targetEvent, matchedEvents[0], conversionWindowMs)
      : targetEvent;
    if (!hasMappedPosition(mapEvent)) continue;

    samples.push({
      x: Number(mapEvent.x),
      y: Number(mapEvent.y),
      z: Number(mapEvent.z),
      occurredAt: getEventTimestamp(mapEvent),
    });
  }

  return {
    stepIndex,
    stepNumber: stepIndex + 1,
    stepEventName: eventNames[stepIndex] || "",
    nextStepEventName: eventNames[stepIndex + 1] || "",
    mode,
    qualifyingSessions,
    mappedSessions: samples.length,
    unmappedSessions: Math.max(qualifyingSessions - samples.length, 0),
    samples,
  };
}

function matchFunnelSessionEvents(eventNames, events, conversionWindowMs) {
  const matchedEvents = [];
  let searchIndex = 0;
  let firstTimestamp = 0;

  for (const expectedName of eventNames) {
    let matchedEvent = null;
    let matchedIndex = -1;
    for (let eventIndex = searchIndex; eventIndex < (events?.length || 0); eventIndex += 1) {
      const event = events[eventIndex];
      const timestamp = getEventTimestamp(event);
      if (firstTimestamp && timestamp - firstTimestamp > conversionWindowMs) break;
      if (normalizeEventName(event?.eventName) !== expectedName) continue;
      matchedEvent = event;
      matchedIndex = eventIndex;
      break;
    }
    if (matchedIndex < 0) break;
    if (!firstTimestamp) firstTimestamp = getEventTimestamp(matchedEvent);
    matchedEvents.push(matchedEvent);
    searchIndex = matchedIndex + 1;
  }

  return matchedEvents;
}

function countFunnelCohortSteps(eventNames, sessions, conversionWindowMs, range) {
  const counts = eventNames.map(() => 0);
  if (!eventNames.length || range.endExclusive <= range.start) return counts;

  for (const session of Array.isArray(sessions) ? sessions : []) {
    const matchedEvents = matchFunnelSessionEvents(eventNames, session?.events, conversionWindowMs);
    const entryTimestamp = getEventTimestamp(matchedEvents[0]);
    if (entryTimestamp < range.start || entryTimestamp >= range.endExclusive) continue;
    for (let index = 0; index < matchedEvents.length; index += 1) counts[index] += 1;
  }
  return counts;
}

function normalizeFunnelCohortRange(range) {
  const start = cleanTimestampMs(range?.start);
  const endExclusive = cleanTimestampMs(range?.endExclusive);
  return {
    start,
    endExclusive: Math.max(endExclusive, start),
  };
}

function percentageOrNull(numerator, denominator) {
  return denominator > 0 ? roundPercentage(numerator / denominator) : null;
}

function roundPercentagePoints(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function hasSignificantProportionDifference(
  currentSuccesses,
  currentTotal,
  previousSuccesses,
  previousTotal,
  confidenceZ,
) {
  if (currentTotal <= 0 || previousTotal <= 0) return false;
  const currentRate = currentSuccesses / currentTotal;
  const previousRate = previousSuccesses / previousTotal;
  const pooledRate = (currentSuccesses + previousSuccesses) / (currentTotal + previousTotal);
  const standardError = Math.sqrt(
    pooledRate * (1 - pooledRate) * ((1 / currentTotal) + (1 / previousTotal)),
  );
  if (!standardError) return currentRate !== previousRate;
  return Math.abs(currentRate - previousRate) / standardError >= confidenceZ;
}

function getLastMappedEventAfterStep(events, targetEvent, firstEvent, conversionWindowMs) {
  const targetTimestamp = getEventTimestamp(targetEvent);
  const windowEnd = getEventTimestamp(firstEvent) + conversionWindowMs;
  let lastMappedEvent = hasMappedPosition(targetEvent) ? targetEvent : null;

  for (const event of Array.isArray(events) ? events : []) {
    const timestamp = getEventTimestamp(event);
    if (timestamp < targetTimestamp || timestamp > windowEnd || !hasMappedPosition(event)) continue;
    if (!lastMappedEvent || timestamp >= getEventTimestamp(lastMappedEvent)) lastMappedEvent = event;
  }

  return lastMappedEvent;
}

function hasMappedPosition(event) {
  return [event?.x, event?.y, event?.z].every((value) => (
    value !== null
    && value !== undefined
    && value !== ""
    && Number.isFinite(Number(value))
  ));
}

function getEventTimestamp(event) {
  return cleanTimestampMs(event?.occurredAt) || cleanTimestampMs(event?.receivedAt);
}

function normalizeEventName(value) {
  const eventName = cleanString(value, 64).toLowerCase();
  return /^[a-z][a-z0-9_.:-]{0,63}$/.test(eventName) ? eventName : "";
}

function roundPercentage(value) {
  return Math.round(Math.max(0, Math.min(1, Number(value) || 0)) * 1000) / 10;
}

function medianNumber(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanPositiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function cleanTimestampMs(value) {
  const timestamp = cleanPositiveInteger(value);
  if (!timestamp) return 0;
  return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
}

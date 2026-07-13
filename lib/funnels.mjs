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

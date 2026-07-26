export function paginateChatLogsPayload(payload, requestedLimit, requestedOffset, maxLimit = 2500) {
  const availableLogs = Array.isArray(payload?.logs) ? payload.logs : [];
  const cleanMaxLimit = Math.max(cleanNonNegativeInteger(maxLimit), 1);
  const parsedLimit = cleanNonNegativeInteger(requestedLimit);
  const limit = parsedLimit > 0 ? Math.min(parsedLimit, cleanMaxLimit) : cleanMaxLimit;
  const offset = Math.min(cleanNonNegativeInteger(requestedOffset), availableLogs.length);
  const logs = availableLogs.slice(offset, offset + limit);

  return {
    ...payload,
    paginationTotal: availableLogs.length,
    returnedCount: logs.length,
    offset,
    limit,
    hasPrevious: offset > 0,
    hasNext: offset + logs.length < availableLogs.length,
    logs,
  };
}

function cleanNonNegativeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

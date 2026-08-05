function cleanPositiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function cleanTimestampMs(value) {
  const timestamp = cleanPositiveInteger(value);
  if (timestamp <= 0) return 0;
  return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp;
}

export function matchesPlayerKickSession(action, player, jobId) {
  const targetJobId = String(action?.targetJobId || "").trim();
  const currentJobId = String(jobId || "").trim();
  const targetSessionId = String(action?.targetSessionId || "").trim();
  const currentSessionId = String(player?.sessionId || "").trim();
  const targetJoinedAt = cleanTimestampMs(action?.targetJoinedAt);
  const currentJoinedAt = cleanTimestampMs(player?.joinedAt);
  const targetUserId = cleanPositiveInteger(action?.userId);
  const currentUserId = cleanPositiveInteger(player?.userId);

  return Boolean(
    targetJobId
    && targetJobId === currentJobId
    && targetSessionId
    && targetSessionId === currentSessionId
    && targetJoinedAt > 0
    && targetJoinedAt === currentJoinedAt
    && targetUserId > 0
    && targetUserId === currentUserId
  );
}

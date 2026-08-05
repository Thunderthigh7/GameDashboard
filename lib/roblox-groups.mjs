const ROBLOX_OPEN_CLOUD_BASE_URL = "https://apis.roblox.com";
const ROBLOX_USERS_BASE_URL = "https://users.roblox.com";
const ROBLOX_GROUP_REQUEST_TIMEOUT_MS = 15_000;

export async function listRobloxUserGroups(accessToken, robloxUserId) {
  const groupIds = await listRobloxUserGroupIds(accessToken, robloxUserId);
  if (!groupIds.length) return [];
  const groupsById = await getPublicRobloxGroupsByIds(groupIds);
  return groupIds.map((id) => {
    const group = groupsById.get(id);
    return {
      id,
      name: cleanText(group?.name || group?.displayName, 120) || `Group ${id}`,
      description: cleanText(group?.description, 500),
      memberCount: positiveInteger(group?.memberCount),
      verified: group?.hasVerifiedBadge === true || group?.verified === true,
    };
  });
}

export async function listRobloxUserGroupIds(accessToken, robloxUserId) {
  const userId = positiveInteger(robloxUserId);
  if (!userId) throw new Error("A valid Roblox user ID is required.");
  const url = new URL(`${ROBLOX_OPEN_CLOUD_BASE_URL}/cloud/v2/groups/-/memberships`);
  url.searchParams.set("maxPageSize", "100");
  url.searchParams.set("filter", `user in ['users/${userId}']`);
  const payload = await robloxGroupRequest(accessToken, `${url.pathname}${url.search}`);
  const memberships = getPayloadArray(payload, ["groupMemberships", "memberships"]);
  return [...new Set(memberships.map(membershipGroupId).filter(Boolean))];
}

export async function getRobloxGroup(accessToken, groupId) {
  return robloxGroupRequest(accessToken, `/cloud/v2/groups/${encodeResourceId(groupId)}`);
}

export async function listRobloxGroupRoles(accessToken, groupId) {
  return listAllPages(accessToken, `/cloud/v2/groups/${encodeResourceId(groupId)}/roles`, {
    arrayKeys: ["groupRoles", "roles"],
    maxPageSize: 20,
    maxPages: 10,
  });
}

export async function getRobloxGroupRole(accessToken, groupId, roleId) {
  return robloxGroupRequest(
    accessToken,
    `/cloud/v2/groups/${encodeResourceId(groupId)}/roles/${encodeResourceId(roleId)}`,
  );
}

export async function listRobloxGroupMemberships(accessToken, groupId, options = {}) {
  return listAllPages(accessToken, `/cloud/v2/groups/${encodeResourceId(groupId)}/memberships`, {
    arrayKeys: ["groupMemberships", "memberships"],
    maxPageSize: Math.min(100, Math.max(1, positiveInteger(options.maxPageSize) || 100)),
    maxPages: Math.min(10, Math.max(1, positiveInteger(options.maxPages) || 1)),
    filter: cleanText(options.filter, 500),
    pageToken: cleanText(options.pageToken, 1000),
  });
}

export async function listRobloxGroupJoinRequests(accessToken, groupId, options = {}) {
  return listAllPages(accessToken, `/cloud/v2/groups/${encodeResourceId(groupId)}/join-requests`, {
    arrayKeys: ["groupJoinRequests", "joinRequests", "requests"],
    maxPageSize: Math.min(100, Math.max(1, positiveInteger(options.maxPageSize) || 20)),
    maxPages: Math.min(5, Math.max(1, positiveInteger(options.maxPages) || 1)),
    pageToken: cleanText(options.pageToken, 1000),
  });
}

export async function acceptRobloxGroupJoinRequest(accessToken, groupId, joinRequestId) {
  return robloxGroupRequest(
    accessToken,
    `/cloud/v2/groups/${encodeResourceId(groupId)}/join-requests/${encodeResourceId(joinRequestId)}:accept`,
    { method: "POST", body: {} },
  );
}

export async function declineRobloxGroupJoinRequest(accessToken, groupId, joinRequestId) {
  return robloxGroupRequest(
    accessToken,
    `/cloud/v2/groups/${encodeResourceId(groupId)}/join-requests/${encodeResourceId(joinRequestId)}:decline`,
    { method: "POST", body: {} },
  );
}

export async function assignRobloxGroupRole(accessToken, groupId, membershipId, rolePath) {
  return robloxGroupRequest(
    accessToken,
    `/cloud/v2/groups/${encodeResourceId(groupId)}/memberships/${encodeResourceId(membershipId)}:assignRole`,
    { method: "POST", body: { role: normalizeRolePath(groupId, rolePath) } },
  );
}

export async function unassignRobloxGroupRole(accessToken, groupId, membershipId, rolePath) {
  return robloxGroupRequest(
    accessToken,
    `/cloud/v2/groups/${encodeResourceId(groupId)}/memberships/${encodeResourceId(membershipId)}:unassignRole`,
    { method: "POST", body: { role: normalizeRolePath(groupId, rolePath) } },
  );
}

export async function getRobloxUsersByIds(userIds) {
  const ids = [...new Set((Array.isArray(userIds) ? userIds : []).map(positiveInteger).filter(Boolean))].slice(0, 100);
  if (!ids.length) return new Map();
  const response = await fetch(`${ROBLOX_USERS_BASE_URL}/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds: ids, excludeBannedUsers: false }),
    signal: AbortSignal.timeout(ROBLOX_GROUP_REQUEST_TIMEOUT_MS),
  });
  const payload = await readJsonResponse(response);
  if (!response.ok) throw createRobloxGroupError(response.status, payload, "Could not load Roblox users.");
  return new Map(getPayloadArray(payload, ["data", "users"]).map((user) => [
    positiveInteger(user?.id),
    {
      id: positiveInteger(user?.id),
      username: cleanText(user?.name, 80),
      displayName: cleanText(user?.displayName, 80),
    },
  ]).filter(([id]) => id > 0));
}

export function resourceId(value) {
  const text = cleanText(value, 500);
  const match = text.match(/(?:^|\/)(\d+)$/);
  return match ? positiveInteger(match[1]) : positiveInteger(value);
}

export function membershipUserId(membership) {
  return resourceId(membership?.user || membership?.userPath || membership?.userId);
}

export function membershipGroupId(membership) {
  const match = cleanText(membership?.path, 500).match(/^groups\/(\d+)\/memberships\//);
  return match ? positiveInteger(match[1]) : positiveInteger(membership?.groupId);
}

export function membershipRolePaths(membership) {
  const roles = Array.isArray(membership?.roles)
    ? membership.roles
    : Array.isArray(membership?.rolePaths)
      ? membership.rolePaths
      : membership?.role
        ? [membership.role]
        : [];
  return [...new Set(roles.map((role) => cleanText(role?.path || role, 500)).filter(Boolean))];
}

export function rolePath(groupId, role) {
  const path = cleanText(role?.path || role?.name, 500);
  return path || `groups/${positiveInteger(groupId)}/roles/${resourceId(role?.id)}`;
}

export function roleRank(role) {
  const rank = Number(role?.rank);
  return Number.isFinite(rank) ? rank : 0;
}

export function roleDisplayName(role) {
  return cleanText(role?.displayName || role?.name, 120) || `Role ${resourceId(role?.path || role?.id)}`;
}

async function listAllPages(accessToken, endpointPath, options) {
  const entries = [];
  let pageToken = options.pageToken || "";
  let nextPageToken = "";
  for (let page = 0; page < options.maxPages; page += 1) {
    const url = new URL(`${ROBLOX_OPEN_CLOUD_BASE_URL}${endpointPath}`);
    url.searchParams.set("maxPageSize", String(options.maxPageSize));
    if (options.filter) url.searchParams.set("filter", options.filter);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const payload = await robloxGroupRequest(accessToken, `${url.pathname}${url.search}`);
    entries.push(...getPayloadArray(payload, options.arrayKeys));
    nextPageToken = cleanText(payload?.nextPageToken, 1000);
    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }
  return { entries, nextPageToken };
}

async function robloxGroupRequest(accessToken, endpointPath, options = {}) {
  const response = await fetch(`${ROBLOX_OPEN_CLOUD_BASE_URL}${endpointPath}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: AbortSignal.timeout(ROBLOX_GROUP_REQUEST_TIMEOUT_MS),
  });
  const payload = await readJsonResponse(response);
  if (!response.ok) throw createRobloxGroupError(response.status, payload, "Roblox rejected the group request.");
  return payload;
}

async function getPublicRobloxGroupsByIds(groupIds) {
  const groupsById = new Map();
  const chunks = [];
  for (let index = 0; index < groupIds.length; index += 50) chunks.push(groupIds.slice(index, index + 50));
  const results = await Promise.allSettled(chunks.map(async (chunk) => {
    const response = await fetch(`https://groups.roblox.com/v2/groups?groupIds=${encodeURIComponent(chunk.join(","))}`, {
      signal: AbortSignal.timeout(ROBLOX_GROUP_REQUEST_TIMEOUT_MS),
    });
    const payload = await readJsonResponse(response);
    if (!response.ok) throw createRobloxGroupError(response.status, payload, "Could not load Roblox group names.");
    return getPayloadArray(payload, ["data", "groups"]);
  }));
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const group of result.value) {
      const id = positiveInteger(group?.id);
      if (id) groupsById.set(id, group);
    }
  }
  return groupsById;
}

function normalizeRolePath(groupId, value) {
  const path = cleanText(value?.path || value, 500);
  const roleId = resourceId(path);
  if (!roleId) throw new Error("Pick a valid Roblox group role.");
  return `groups/${positiveInteger(groupId)}/roles/${roleId}`;
}

function encodeResourceId(value) {
  const id = resourceId(value);
  if (!id) throw new Error("A valid Roblox resource ID is required.");
  return encodeURIComponent(String(id));
}

function getPayloadArray(payload, keys) {
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function createRobloxGroupError(status, payload, fallback) {
  const detail = payload?.message
    || payload?.error?.message
    || payload?.error_description
    || (Array.isArray(payload?.errors) ? payload.errors[0]?.message : "")
    || fallback;
  const error = new Error(cleanText(detail, 300) || fallback);
  error.status = status;
  return error;
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

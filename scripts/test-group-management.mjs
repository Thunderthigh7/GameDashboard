import assert from "node:assert/strict";
import fs from "node:fs";
import {
  acceptRobloxGroupJoinRequest,
  assignRobloxGroupRole,
  listRobloxUserGroups,
  membershipGroupId,
  membershipUserId,
} from "../lib/roblox-groups.mjs";

const serverSource = fs.readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const groupClientSource = fs.readFileSync(new URL("../lib/roblox-groups.mjs", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const envSource = fs.readFileSync(new URL("../.env.example", import.meta.url), "utf8");

assert.match(serverSource, /ROBLOX_OAUTH_GROUP_SCOPES[\s\S]*?\["openid", "profile", "group:read", "group:write"\]/);
assert.match(envSource, /ROBLOX_OAUTH_GROUP_SCOPES=openid profile group:read group:write/);
assert.match(serverSource, /purpose: "groups"/);
assert.match(serverSource, /scopes: ROBLOX_OAUTH_GROUP_SCOPES/);
assert.match(serverSource, /backHref: "\/#groups"/);

assert.match(serverSource, /url\.pathname === "\/api\/groups"/);
assert.match(serverSource, /const groupJoinRequestMatch = url\.pathname\.match/);
assert.match(serverSource, /accept\|decline/);
assert.match(serverSource, /const groupRoleMatch = url\.pathname\.match/);
assert.match(serverSource, /assign\|unassign/);
assert.match(serverSource, /groupAutomationMatch/);

assert.match(groupClientSource, /\/cloud\/v2\/groups\/\$\{encodeResourceId\(groupId\)\}\/join-requests/);
assert.match(groupClientSource, /\/cloud\/v2\/groups\/-\/memberships/);
assert.match(groupClientSource, /user in \['users\/\$\{userId\}'\]/);
assert.doesNotMatch(groupClientSource, /legacy-develop/);
assert.match(groupClientSource, /:accept/);
assert.match(groupClientSource, /:decline/);
assert.match(groupClientSource, /:assignRole/);
assert.match(groupClientSource, /:unassignRole/);
assert.match(groupClientSource, /body: \{ role: normalizeRolePath/);

assert.match(serverSource, /Add at least one username or user ID before enabling auto-accept/);
assert.match(serverSource, /MAX_GROUP_AUTOMATION_ACCEPTS_PER_RUN = 10/);
assert.match(serverSource, /allowed\.has\(userId\)/);
assert.doesNotMatch(serverSource, /ROBLOX_GROUP_API_KEY/);
assert.doesNotMatch(htmlSource, /group.*api key/i);

assert.match(htmlSource, /data-dashboard-view="groups"/);
assert.match(htmlSource, /data-view-panel="groups"/);
assert.match(htmlSource, /id="groupJoinRequestList"/);
assert.match(htmlSource, /id="groupMemberList"/);
assert.match(htmlSource, /id="groupAutomationUsers"/);
assert.match(appSource, /window\.location\.hash === "#groups"/);
assert.match(appSource, /loadGroupManagement/);
assert.doesNotMatch(appSource, /UNIVERSE_SCOPED_VIEWS[^\n]*"groups"/);

const originalFetch = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url).includes("/cloud/v2/groups/-/memberships")) {
    return new Response(JSON.stringify({
      groupMemberships: [{
        path: "groups/42/memberships/77",
        user: "users/77",
        roles: ["groups/42/roles/9"],
      }],
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (String(url).includes("groups.roblox.com/v2/groups")) {
    return new Response(JSON.stringify({ data: [{ id: 42, name: "Builders", memberCount: 12 }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
};

try {
  const groups = await listRobloxUserGroups("oauth-token", 77);
  assert.deepEqual(groups.map((group) => ({ id: group.id, name: group.name })), [{ id: 42, name: "Builders" }]);
  assert.equal(membershipGroupId({ path: "groups/42/memberships/77" }), 42);
  assert.equal(membershipUserId({ user: "users/77" }), 77);
  const membershipCall = calls.find((call) => call.url.includes("groups/-/memberships"));
  assert.ok(membershipCall.url.includes("user+in+%5B%27users%2F77%27%5D"));
  assert.equal(membershipCall.options.headers.Authorization, "Bearer oauth-token");

  await acceptRobloxGroupJoinRequest("oauth-token", 42, 77);
  await assignRobloxGroupRole("oauth-token", 42, 77, "groups/42/roles/9");
  const acceptCall = calls.find((call) => call.url.endsWith("/join-requests/77:accept"));
  const assignCall = calls.find((call) => call.url.endsWith("/memberships/77:assignRole"));
  assert.equal(acceptCall.options.method, "POST");
  assert.deepEqual(JSON.parse(acceptCall.options.body), {});
  assert.deepEqual(JSON.parse(assignCall.options.body), { role: "groups/42/roles/9" });
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Roblox group management regression checks passed.");

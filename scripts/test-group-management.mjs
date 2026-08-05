import assert from "node:assert/strict";
import fs from "node:fs";
import {
  acceptRobloxGroupJoinRequest,
  assignRobloxGroupRole,
  listRobloxUserGroupIds,
  listRobloxUserGroups,
  membershipGroupId,
  membershipUserId,
} from "../lib/roblox-groups.mjs";

const serverSource = fs.readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
const groupClientSource = fs.readFileSync(new URL("../lib/roblox-groups.mjs", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const stylesSource = fs.readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const envSource = fs.readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const robloxApiSource = fs.readFileSync(new URL("../RoAnalytics/API.lua", import.meta.url), "utf8");
const robloxMethodsSource = fs.readFileSync(new URL("../RoAnalytics/Core/Methods.lua", import.meta.url), "utf8");
const robloxSettingsSource = fs.readFileSync(new URL("../RoAnalytics/Config/Settings.lua", import.meta.url), "utf8");
const robloxReadmeSource = fs.readFileSync(new URL("../RoAnalytics/README.md", import.meta.url), "utf8");

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
assert.match(serverSource, /groupRankRuleMatch/);
assert.match(serverSource, /url\.pathname === "\/api\/roblox\/group-rank"/);
assert.ok(
  serverSource.indexOf('url.pathname === "/api/roblox/group-rank"')
    < serverSource.indexOf('url.pathname.startsWith("/api/") && !isDashboardAuthenticated(req)'),
  "Roblox rank requests should authenticate with the project secret before dashboard-session enforcement",
);

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
assert.match(serverSource, /MAX_GROUP_RANK_RULES_PER_GROUP = 25/);
assert.match(serverSource, /db\.collection\("group_rank_rules"\)\.createIndex/);
assert.match(serverSource, /handleRobloxGroupRankRequest[\s\S]*?getProjectFromRequestSecret\(req, universeId\)/);
assert.match(serverSource, /environment !== "production"/);
assert.match(serverSource, /processGroupRankEventRule[\s\S]*?filter: `user == 'users\/\$\{request\.userId\}'`/);
assert.match(serverSource, /const member = memberResult\.entries\.find\(\(entry\) => membershipUserId\(entry\) === request\.userId\);/);
assert.doesNotMatch(serverSource, /processGroupRankEventRule[\s\S]*?memberResult\.entries\[0\]/);
assert.match(serverSource, /processGroupRankEventRule[\s\S]*?membershipRolePaths\(member\)\.includes\(role\.path\)/);
assert.match(serverSource, /processGroupRankEventRule[\s\S]*?assignRobloxGroupRole/);
assert.match(serverSource, /disableGroupRankRules\(auth\.userId\)/);
assert.doesNotMatch(serverSource, /ROBLOX_GROUP_API_KEY/);
assert.doesNotMatch(htmlSource, /group.*api key/i);

assert.match(htmlSource, /data-dashboard-view="groups"/);
assert.match(htmlSource, /data-view-panel="groups"/);
assert.match(htmlSource, /id="groupJoinRequestList"/);
assert.match(htmlSource, /id="groupMemberList"/);
assert.match(htmlSource, /id="groupAutomationUsers"/);
assert.match(htmlSource, /id="groupRankRulesPanel"[\s\S]*?id="groupRankEventKey"[\s\S]*?id="groupRankRole"/);
assert.match(htmlSource, /id="groupRankCode"[\s\S]*?RoAnalytics\.RequestGroupRank/);
assert.match(appSource, /window\.location\.hash === "#groups"/);
assert.match(appSource, /loadGroupManagement/);
assert.match(appSource, /saveGroupRankRule/);
assert.match(appSource, /\/rank-rules/);
assert.match(stylesSource, /\.groupRankRuleFields/);
assert.doesNotMatch(appSource, /UNIVERSE_SCOPED_VIEWS[^\n]*"groups"/);
assert.match(stylesSource, /body\[data-active-view="assets"\] \.topbarActions/);
assert.match(stylesSource, /body\[data-active-view="groups"\] \.topbarActions/);
assert.match(stylesSource, /body\[data-active-view="overview"\] \.topbarActions[\s\S]*?grid-column: 2/);
assert.match(robloxApiSource, /function RoAnalytics\.RequestGroupRank\(player, eventKey\)/);
assert.match(robloxMethodsSource, /function Methods\.RequestGroupRank\(player, eventKey\)/);
assert.match(robloxMethodsSource, /\["X-Dashboard-Secret"\] = dashboardSecret/);
assert.match(robloxMethodsSource, /environment = runtimeEnvironment/);
assert.match(robloxMethodsSource, /HttpService:GenerateGUID\(false\)/);
assert.match(robloxSettingsSource, /Settings\.GroupRankEndpoint = "https:\/\/game-dashboard-zaya\.onrender\.com\/api\/roblox\/group-rank"/);
assert.match(robloxReadmeSource, /RoAnalytics\.RequestGroupRank\(player, "vip_purchase"\)/);

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
  assert.deepEqual(await listRobloxUserGroupIds("oauth-token", 77), [42]);
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

  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes("/cloud/v2/groups/-/memberships")) {
      return new Response(JSON.stringify({
        groupMemberships: [{ path: "groups/42/memberships/77", user: "users/77" }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ message: "Temporarily unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  };
  const fallbackGroups = await listRobloxUserGroups("oauth-token", 77);
  assert.deepEqual(fallbackGroups.map((group) => ({ id: group.id, name: group.name })), [{ id: 42, name: "Group 42" }]);
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Roblox group management regression checks passed.");

window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.templates = window.RoSignalComponents.templates || {};
window.RoSignalComponents.templates.communityManagement = `
<section class="viewPage groupsPage" data-view-panel="groups" hidden>
  <section class="groupAuthorization panel" id="groupAuthorization">
    <div>
      <span class="groupEyebrow">Roblox OAuth</span>
      <h2 id="groupAuthorizationTitle">Connect Roblox groups</h2>
      <p id="groupAuthorizationCopy">Authorize group:read and group:write to manage requests and lower-ranked members.</p>
    </div>
    <div class="groupAuthorizationActions">
      <button class="button compact" id="groupAuthorizeButton" type="button">Authorize Roblox</button>
      <button class="button secondary compact" id="groupDisconnectButton" type="button" hidden>Disconnect</button>
    </div>
  </section>

  <section class="panel groupControlPanel">
    <div class="groupControlHeader">
      <label class="groupSelectField" for="groupSelect">
        <span>Your group</span>
        <select id="groupSelect"><option value="">Authorize Roblox to load groups</option></select>
      </label>
      <button class="button secondary compact" id="groupRefreshButton" type="button">Refresh</button>
    </div>
    <div class="groupPermissionSummary" id="groupPermissionSummary">
      <span>Select a managed group to see the actions your Roblox role allows.</span>
    </div>
    <p class="groupStatus" id="groupPageStatus" aria-live="polite"></p>
  </section>

  <div class="groupManagementGrid" id="groupManagementWorkspace" hidden>
    <section class="panel groupListPanel">
      <header class="groupSectionHeader">
        <div>
          <span class="groupEyebrow">Pending</span>
          <h2>Join requests</h2>
          <p>Accept or decline requests, with an optional role assigned immediately.</p>
        </div>
        <span class="groupCountBadge" id="groupRequestCount">0</span>
      </header>
      <div class="groupPeopleList" id="groupJoinRequestList"></div>
    </section>
    <section class="panel groupListPanel">
      <header class="groupSectionHeader">
        <div>
          <span class="groupEyebrow">Members below you</span>
          <h2>Role editor</h2>
          <p>Assign or remove roles that rank below your own highest role.</p>
        </div>
        <span class="groupCountBadge" id="groupMemberCount">0</span>
      </header>
      <div class="groupPeopleList" id="groupMemberList"></div>
    </section>
  </div>

  <section class="panel groupAutomationPanel" id="groupAutomationPanel" hidden>
    <header class="groupSectionHeader">
      <div>
        <span class="groupEyebrow">Preset automation</span>
        <h2>Auto-accept allowlist</h2>
        <p>Only the exact usernames or user IDs you save here can be accepted automatically.</p>
      </div>
      <label class="groupAutomationToggle">
        <input id="groupAutomationEnabled" type="checkbox">
        <span>Enabled</span>
      </label>
    </header>
    <div class="groupAutomationFields">
      <label for="groupAutomationRole">
        <span>Role after acceptance</span>
        <select id="groupAutomationRole"><option value="">Choose a role</option></select>
      </label>
      <label for="groupAutomationUsers">
        <span>Allowed usernames or user IDs</span>
        <textarea id="groupAutomationUsers" rows="3" maxlength="6400" placeholder="username, 123456789"></textarea>
        <small>Separate entries with commas, spaces, or new lines. Maximum 100 people.</small>
      </label>
    </div>
    <div class="groupAutomationFooter">
      <p class="groupStatus" id="groupAutomationStatus" aria-live="polite"></p>
      <button class="button compact" id="groupAutomationSaveButton" type="button">Save preset</button>
    </div>
    <div class="groupAutomationActivity" id="groupAutomationActivity"></div>
  </section>
</section>
`;
window.RoSignalComponents.mountHTML('groups-management-view', window.RoSignalComponents.templates.communityManagement);

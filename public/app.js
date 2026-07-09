const accountBox = document.querySelector("#accountBox");
const loginPanel = document.querySelector("#loginPanel");
const robloxLoginButton = document.querySelector("#robloxLoginButton");
const loginStatus = document.querySelector("#loginStatus");
const authFormTitle = document.querySelector("#authFormTitle");
const authFormSubtitle = document.querySelector("#authFormSubtitle");
const authControls = document.querySelector("#authControls");
const logoutButton = document.querySelector("#logoutButton");
const adminNavLink = document.querySelector("#adminNavLink");
const refreshAdminUsersButton = document.querySelector("#refreshAdminUsersButton");
const adminUserList = document.querySelector("#adminUserList");
const adminUsersStatus = document.querySelector("#adminUsersStatus");
const adminTotalUsers = document.querySelector("#adminTotalUsers");
const adminTotalProjects = document.querySelector("#adminTotalProjects");
const adminRobloxUsers = document.querySelector("#adminRobloxUsers");
const adminMonthlyAiRequests = document.querySelector("#adminMonthlyAiRequests");
const adminMonthlyEvents = document.querySelector("#adminMonthlyEvents");
const adminMonthlyCost = document.querySelector("#adminMonthlyCost");
const refreshUsageButton = document.querySelector("#refreshUsageButton");
const usagePlanName = document.querySelector("#usagePlanName");
const usageConnectedGames = document.querySelector("#usageConnectedGames");
const usageEstimatedCost = document.querySelector("#usageEstimatedCost");
const usageCachedInputTokens = document.querySelector("#usageCachedInputTokens");
const usageBackblazeStorage = document.querySelector("#usageBackblazeStorage");
const usageBackblazeCost = document.querySelector("#usageBackblazeCost");
const usageResetDate = document.querySelector("#usageResetDate");
const usageStatus = document.querySelector("#usageStatus");
const usageMetricGrid = document.querySelector("#usageMetricGrid");
const usageUpgradeTitle = document.querySelector("#usageUpgradeTitle");
const usageUpgradeMessage = document.querySelector("#usageUpgradeMessage");
const usageUpgradeButton = document.querySelector("#usageUpgradeButton");
const authError = document.querySelector("#authError");
const universesStatus = document.querySelector("#universesStatus");
const universeSelect = document.querySelector("#universeSelect");
const refreshUniversesButton = document.querySelector("#refreshUniversesButton");
const projectForm = document.querySelector("#projectForm");
const ownedGameSelect = document.querySelector("#ownedGameSelect");
const refreshOwnedGamesButton = document.querySelector("#refreshOwnedGamesButton");
const ownedGamesStatus = document.querySelector("#ownedGamesStatus");
const createProjectButton = document.querySelector("#createProjectButton");
const projectSecretBox = document.querySelector("#projectSecretBox");
const projectSecretValue = document.querySelector("#projectSecretValue");
const projectSecretTarget = document.querySelector("#projectSecretTarget");
const copyProjectSecretButton = document.querySelector("#copyProjectSecretButton");
const connectedGameList = document.querySelector("#connectedGameList");
const refreshChatLogsButton = document.querySelector("#refreshChatLogsButton");
const refreshMovementButton = document.querySelector("#refreshMovementButton");
const chatLogCount = document.querySelector("#chatLogCount");
const universeTotalMetric = document.querySelector("#universeTotalMetric");
const selectedUniverseLabel = document.querySelector("#selectedUniverseLabel");
const chatLogsStatus = document.querySelector("#chatLogsStatus");
const chatLogList = document.querySelector("#chatLogList");
const chatInsightsStatus = document.querySelector("#chatInsightsStatus");
const chatInsightsMode = document.querySelector("#chatInsightsMode");
const runChatInsightsButton = document.querySelector("#runChatInsightsButton");
const aiAutomationToggle = document.querySelector("#aiAutomationToggle");
const aiAutomationStatus = document.querySelector("#aiAutomationStatus");
const aiReportSelect = document.querySelector("#aiReportSelect");
const commonQuestionList = document.querySelector("#commonQuestionList");
const movementFromFilter = document.querySelector("#movementFromFilter");
const movementToFilter = document.querySelector("#movementToFilter");
const pageTitle = document.querySelector("#pageTitle");
const pageSubtitle = document.querySelector("#pageSubtitle");
const viewNavLinks = document.querySelectorAll("[data-dashboard-view]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const movementAreaList = document.querySelector("#movementAreaList");
const dropOffAreaList = document.querySelector("#dropOffAreaList");
const deathAreaList = document.querySelector("#deathAreaList");
const protectedDashboardPanels = document.querySelectorAll(
  ".sidebar, .topbar, #authControls, .viewPage"
);

let chatRefreshTimer;
let signalRefreshTimer;
let selectedUniverseId = "";
let selectedChatLogId = "";
let knownUniverses = [];
let ownedGames = [];
let authenticated = false;
let authenticatedUser = null;
let activeView = getViewFromHash();

window.getSelectedUniverseId = () => selectedUniverseId;
window.isDashboardAuthenticated = () => authenticated;

const CHAT_REFRESH_MS = 5000;
const SIGNAL_REFRESH_MS = 15000;
const SIGNAL_CLUSTER_RADIUS = 44;
const MAX_SIGNAL_AREAS = 5;

init();

async function init() {
  showAuthError();
  bindEvents();
  await checkAuth();
}

function bindEvents() {
  robloxLoginButton?.addEventListener("click", () => {
    if (loginStatus) loginStatus.textContent = "Opening Roblox...";
    robloxLoginButton.disabled = true;
    window.location.href = "/api/auth/roblox/start";
  });

  logoutButton.addEventListener("click", async () => {
    await request("/api/auth/logout", { method: "POST" });
    window.location.reload();
  });

  refreshUniversesButton.addEventListener("click", loadUniverses);
  refreshUsageButton?.addEventListener("click", loadAccountUsage);
  refreshOwnedGamesButton?.addEventListener("click", loadOwnedGames);
  projectForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    createProject();
  });
  copyProjectSecretButton?.addEventListener("click", copyProjectSecret);
  connectedGameList?.addEventListener("click", (event) => {
    const regenerateButton = event.target.closest("[data-regenerate-project-secret]");
    if (regenerateButton) {
      regenerateProjectSecret(regenerateButton.dataset.regenerateProjectSecret || "", regenerateButton);
      return;
    }

    const unlinkButton = event.target.closest("[data-unlink-project]");
    if (unlinkButton) {
      unlinkProject(unlinkButton.dataset.unlinkProject || "", unlinkButton);
    }
  });
  universeSelect.addEventListener("change", () => selectUniverse(universeSelect.value));
  refreshChatLogsButton.addEventListener("click", loadChatLogs);
  refreshMovementButton?.addEventListener("click", loadSignalAreaCards);
  runChatInsightsButton.addEventListener("click", runChatInsightsAnalysis);
  aiAutomationToggle?.addEventListener("change", saveAiAutomationSettings);
  aiReportSelect?.addEventListener("change", loadSelectedAiReport);
  refreshAdminUsersButton?.addEventListener("click", loadAdminUsers);
  adminUserList?.addEventListener("click", (event) => {
    const resetButton = event.target.closest("[data-reset-usage-user]");
    if (resetButton) resetAdminUsage(resetButton);
  });
  movementFromFilter?.addEventListener("change", loadSignalAreaCards);
  movementToFilter?.addEventListener("change", loadSignalAreaCards);

  for (const link of viewNavLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setActiveView(link.dataset.dashboardView || "overview", { updateHash: true });
    });
  }

  chatLogList.addEventListener("click", (event) => {
    const item = event.target.closest("[data-chat-log-id]");
    if (!item) return;

    selectChatLog(item.dataset.chatLogId || "", { notifyMap: true });
  });

  chatLogList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const item = event.target.closest("[data-chat-log-id]");
    if (!item) return;

    event.preventDefault();
    selectChatLog(item.dataset.chatLogId || "", { notifyMap: true });
  });

  for (const areaList of [movementAreaList, dropOffAreaList, deathAreaList]) {
    areaList?.addEventListener("click", (event) => {
      const item = event.target.closest("[data-signal-area-index]");
      if (!item) return;
      focusSignalAreaFromElement(item);
    });
  }

  dropOffAreaList?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const item = event.target.closest("[data-signal-area-index]");
    if (!item) return;
    event.preventDefault();
    focusSignalAreaFromElement(item);
  });

  deathAreaList?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const item = event.target.closest("[data-signal-area-index]");
    if (!item) return;
    event.preventDefault();
    focusSignalAreaFromElement(item);
  });

  movementAreaList?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const item = event.target.closest("[data-signal-area-index]");
    if (!item) return;
    event.preventDefault();
    focusSignalAreaFromElement(item);
  });

  window.addEventListener("dashboard:chatPointSelected", (event) => {
    selectChatLog(event.detail?.id || "", { scroll: true });
  });

  window.addEventListener("hashchange", () => {
    setActiveView(getViewFromHash(), { updateHash: false });
  });
}

async function checkAuth() {
  try {
    const data = await request("/api/auth/status");
    setAuthenticated(Boolean(data.authenticated), data.user || null);
  } catch {
    setAuthenticated(false, null);
  }
}

function setAuthenticated(value, user = null) {
  authenticated = value;
  authenticatedUser = authenticated ? user : null;
  document.body.classList.toggle("isLocked", !authenticated);
  accountBox.textContent = authenticatedUser?.username ? authenticatedUser.username : authenticated ? "Signed in" : "Signed out";
  if (adminNavLink) adminNavLink.hidden = !authenticatedUser?.isAdmin;
  loginPanel.hidden = authenticated;
  authControls.hidden = !authenticated;
  runChatInsightsButton.hidden = !authenticated;
  for (const panel of protectedDashboardPanels) {
    panel.hidden = !authenticated;
  }
  renderActiveView();

  window.dispatchEvent(new CustomEvent("dashboard:authChanged", {
    detail: { authenticated, user: authenticatedUser },
  }));

  if (!authenticated) {
    stopChatRefresh();
    stopSignalRefresh();
    chatLogList.innerHTML = "";
    commonQuestionList.innerHTML = "";
    if (aiReportSelect) {
      aiReportSelect.innerHTML = `<option value="">Latest saved report</option>`;
      aiReportSelect.disabled = true;
    }
    chatLogCount.textContent = "0";
    universeTotalMetric.textContent = "0";
    selectedUniverseId = "";
    selectedUniverseLabel.textContent = "No universe selected";
    universeSelect.innerHTML = `<option value="">Sign in to load universes</option>`;
    universeSelect.disabled = true;
    if (projectSecretBox) projectSecretBox.hidden = true;
    if (projectSecretValue) projectSecretValue.textContent = "";
    if (projectSecretTarget) projectSecretTarget.textContent = "";
    if (connectedGameList) connectedGameList.innerHTML = "";
    if (ownedGameSelect) {
      ownedGameSelect.innerHTML = `<option value="">Sign in to load games</option>`;
      ownedGameSelect.disabled = true;
    }
    if (ownedGamesStatus) ownedGamesStatus.textContent = "Sign in to load Roblox games.";
    chatLogsStatus.textContent = "Sign in to view chat logs.";
    chatInsightsStatus.textContent = "Sign in to view chat insights.";
    if (aiAutomationStatus) aiAutomationStatus.textContent = "";
    if (adminNavLink) adminNavLink.hidden = true;
    if (adminUserList) adminUserList.innerHTML = "";
    if (adminUsersStatus) adminUsersStatus.textContent = "Admin access required.";
    if (adminTotalUsers) adminTotalUsers.textContent = "0";
    if (adminTotalProjects) adminTotalProjects.textContent = "0";
    if (adminRobloxUsers) adminRobloxUsers.textContent = "0";
    if (adminMonthlyAiRequests) adminMonthlyAiRequests.textContent = "0";
    if (adminMonthlyEvents) adminMonthlyEvents.textContent = "0";
    if (adminMonthlyCost) adminMonthlyCost.textContent = "$0.00";
    resetUsageView();
    renderSignalAreas(movementAreaList, [], "movement");
    renderSignalAreas(dropOffAreaList, [], "leaves");
    renderSignalAreas(deathAreaList, [], "deaths");
    return;
  }

  loadDashboardData();
}

async function loadDashboardData() {
  await loadUniverses();
  await loadOwnedGames();
  await loadAccountUsage();
  await loadAiAutomationSettings();
  await loadChatLogs();
  await loadSignalAreaCards();
  if (authenticatedUser?.isAdmin) {
    await loadAdminUsers();
  }
  renderActiveView();
  startChatRefresh();
  startSignalRefresh();
  window.dispatchEvent(new CustomEvent("dashboard:analyticsReady", {
    detail: { universeId: selectedUniverseId },
  }));
  window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
    detail: { universeId: selectedUniverseId },
  }));
}

function getViewFromHash() {
  if (window.location.hash === "#chat") return "chat";
  if (window.location.hash === "#usage") return "usage";
  if (window.location.hash === "#connect") return "connect";
  if (window.location.hash === "#admin") return "admin";
  return "overview";
}

function setActiveView(view, options = {}) {
  const requestedView = view === "chat" || view === "usage" || view === "connect" || view === "admin" ? view : "overview";
  activeView = requestedView === "admin" && !authenticatedUser?.isAdmin ? "overview" : requestedView;
  if (options.updateHash) {
    const nextHash = activeView === "chat"
      ? "#chat"
      : activeView === "usage"
        ? "#usage"
        : activeView === "connect"
          ? "#connect"
          : activeView === "admin"
            ? "#admin"
            : "#overview";
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  renderActiveView();
}

function renderActiveView() {
  for (const panel of viewPanels) {
    panel.hidden = !authenticated || panel.dataset.viewPanel !== activeView;
  }

  for (const link of viewNavLinks) {
    if (link.dataset.dashboardView === "admin") {
      link.hidden = !authenticatedUser?.isAdmin;
    }
    const isActive = link.dataset.dashboardView === activeView;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  }

  const viewCopy = {
    overview: {
      title: "Overview",
      subtitle: "Roblox game analytics powered by live heartbeat data.",
    },
    chat: {
      title: "Chat Analysis",
      subtitle: "Player messages and grouped question insights.",
    },
    usage: {
      title: "Usage",
      subtitle: "Track monthly limits before paid plans go live.",
    },
    connect: {
      title: "Connect Universe",
      subtitle: "Add a Roblox game after verifying ownership with Roblox.",
    },
    admin: {
      title: "Admin",
      subtitle: "Monitor RoAnalytics accounts and connected universes.",
    },
  };
  pageTitle.textContent = viewCopy[activeView]?.title || viewCopy.overview.title;
  pageSubtitle.textContent = viewCopy[activeView]?.subtitle || viewCopy.overview.subtitle;

  if (authenticated && activeView === "overview") {
    window.dispatchEvent(new CustomEvent("dashboard:overviewShown", {
      detail: { universeId: selectedUniverseId },
    }));
  }

  if (authenticated && activeView === "admin" && authenticatedUser?.isAdmin) {
    loadAdminUsers();
  }

  if (authenticated && activeView === "usage") {
    loadAccountUsage();
  }

  if (authenticated && activeView === "connect") {
    loadOwnedGames();
  }
}

function startChatRefresh() {
  stopChatRefresh();
  chatRefreshTimer = window.setInterval(loadChatLogs, CHAT_REFRESH_MS);
}

function stopChatRefresh() {
  if (chatRefreshTimer) {
    window.clearInterval(chatRefreshTimer);
    chatRefreshTimer = null;
  }
}

function startSignalRefresh() {
  stopSignalRefresh();
  signalRefreshTimer = window.setInterval(loadSignalAreaCards, SIGNAL_REFRESH_MS);
}

function stopSignalRefresh() {
  if (signalRefreshTimer) {
    window.clearInterval(signalRefreshTimer);
    signalRefreshTimer = null;
  }
}

async function loadAdminUsers() {
  if (!authenticatedUser?.isAdmin || !adminUserList) return;

  adminUsersStatus.textContent = "Loading users...";
  setAdminButtonsDisabled(true);

  try {
    const data = await request("/api/admin/users");
    renderAdminUsers(data);
  } catch (error) {
    handleAuthError(error);
    adminUsersStatus.textContent = error.message;
    adminUserList.innerHTML = "";
  } finally {
    setAdminButtonsDisabled(false);
  }
}

async function resetAdminUsage(button) {
  if (!authenticatedUser?.isAdmin || !adminUserList) return;
  const userId = button?.dataset.resetUsageUser || "";
  const username = button?.dataset.resetUsageUsername || "this user";
  if (!userId) return;

  const confirmed = window.confirm(`Reset usage for ${username}? This clears that user's usage ledger and cannot be undone.`);
  if (!confirmed) return;

  adminUsersStatus.textContent = `Resetting usage for ${username}...`;
  setAdminButtonsDisabled(true);

  try {
    const data = await request("/api/admin/usage/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    renderAdminUsers(data);
    const deletedEvents = data.reset?.deletedEvents || 0;
    adminUsersStatus.textContent = `Usage reset for ${data.reset?.targetUsername || username}. Deleted ${formatCompactNumber(deletedEvents)} usage events.`;
    if (activeView === "usage") loadAccountUsage();
  } catch (error) {
    handleAuthError(error);
    adminUsersStatus.textContent = error.message;
  } finally {
    setAdminButtonsDisabled(false);
  }
}

function renderAdminUsers(data) {
  adminTotalUsers.textContent = String(data.totalUsers || 0);
  adminTotalProjects.textContent = String(data.totalProjects || 0);
  if (adminRobloxUsers) adminRobloxUsers.textContent = String(data.totalRobloxUsers || 0);
  if (adminMonthlyAiRequests) adminMonthlyAiRequests.textContent = formatCompactNumber(data.usageTotals?.aiRequests || 0);
  if (adminMonthlyEvents) adminMonthlyEvents.textContent = formatCompactNumber(data.usageTotals?.events || 0);
  if (adminMonthlyCost) adminMonthlyCost.textContent = formatCurrency(data.usageTotals?.estimatedCostUsd || 0);
  adminUsersStatus.textContent = data.passwordVisibility || "Passwords are hashed and cannot be viewed.";
  adminUserList.innerHTML = Array.isArray(data.users) && data.users.length
    ? data.users.map(renderAdminUser).join("")
    : `<p class="status">No users yet.</p>`;
}

function setAdminButtonsDisabled(disabled) {
  if (refreshAdminUsersButton) refreshAdminUsersButton.disabled = disabled;
  for (const button of document.querySelectorAll("[data-reset-usage-user]")) {
    button.disabled = disabled || !authenticatedUser?.isAdmin;
  }
}

async function loadAccountUsage() {
  if (!authenticated || !usageMetricGrid) return;

  usageStatus.textContent = "Loading usage...";
  if (refreshUsageButton) refreshUsageButton.disabled = true;

  try {
    const data = await request("/api/account/usage");
    renderAccountUsage(data);
  } catch (error) {
    handleAuthError(error);
    usageStatus.textContent = error.message;
    usageMetricGrid.innerHTML = "";
  } finally {
    if (refreshUsageButton) refreshUsageButton.disabled = false;
  }
}

function resetUsageView() {
  if (usagePlanName) usagePlanName.textContent = "Free";
  if (usageConnectedGames) usageConnectedGames.textContent = "0";
  if (usageEstimatedCost) usageEstimatedCost.textContent = "$0.00";
  if (usageCachedInputTokens) usageCachedInputTokens.textContent = "0";
  if (usageBackblazeStorage) usageBackblazeStorage.textContent = "0 B";
  if (usageBackblazeCost) usageBackblazeCost.textContent = "$0.00";
  if (usageResetDate) usageResetDate.textContent = "--";
  if (usageStatus) usageStatus.textContent = "Sign in to view usage.";
  if (usageMetricGrid) usageMetricGrid.innerHTML = "";
  if (usageUpgradeTitle) usageUpgradeTitle.textContent = "Upgrade plans coming soon";
  if (usageUpgradeMessage) usageUpgradeMessage.textContent = "Usage limits are active now. Paid plan controls will connect to this page next.";
  if (usageUpgradeButton) usageUpgradeButton.disabled = true;
}

function renderAccountUsage(data) {
  const usage = data.usage || {};
  const metrics = Array.isArray(data.metrics) ? data.metrics : [];
  const period = data.period || {};
  const upgrade = data.upgrade || {};

  if (usagePlanName) usagePlanName.textContent = data.plan || "Free";
  if (usageConnectedGames) usageConnectedGames.textContent = formatCompactNumber(data.connectedGameCount || 0);
  if (usageEstimatedCost) usageEstimatedCost.textContent = formatCurrency(usage.estimatedCostUsd || 0);
  if (usageCachedInputTokens) usageCachedInputTokens.textContent = formatCompactNumber(usage.cachedOpenAiInputTokens || 0);
  if (usageBackblazeStorage) usageBackblazeStorage.textContent = formatBytes(usage.backblazeStoredBytes || 0);
  if (usageBackblazeCost) usageBackblazeCost.textContent = formatCurrency(usage.backblazeEstimatedMonthlyStorageCostUsd || 0);
  if (usageResetDate) usageResetDate.textContent = formatShortDate(period.resetsAt);
  if (usageStatus) {
    usageStatus.textContent = `Current period: ${formatShortDate(period.startsAt)} to ${formatShortDate(period.endsAt)}.`;
  }
  if (usageMetricGrid) {
    usageMetricGrid.innerHTML = metrics.length
      ? metrics.map(renderUsageMetricCard).join("")
      : `<p class="status">No usage has been recorded this month.</p>`;
  }
  if (usageUpgradeTitle) usageUpgradeTitle.textContent = upgrade.label || "Upgrade plans coming soon";
  if (usageUpgradeMessage) usageUpgradeMessage.textContent = upgrade.message || "Paid plan controls will connect to this page next.";
  if (usageUpgradeButton) usageUpgradeButton.disabled = !upgrade.available;
}

function renderUsageMetricCard(metric) {
  const percent = clampPercent(metric.percent);
  const status = metric.status === "blocked" || metric.status === "warning" ? metric.status : "ok";
  const usedText = formatUsageMetricValue(metric.used || 0, metric.unit);
  const limitText = metric.limit > 0 ? formatUsageMetricValue(metric.limit, metric.unit) : "Unlimited";
  const remainingText = metric.remaining === null ? "Unlimited remaining" : `${formatUsageMetricValue(metric.remaining || 0, metric.unit)} remaining`;

  return `
    <article class="panel usageMetricCard ${escapeHtml(status)}">
      <div class="usageMetricHeader">
        <span>${escapeHtml(metric.label || "Usage")}</span>
        <strong>${escapeHtml(usedText)} / ${escapeHtml(limitText)}</strong>
      </div>
      <div class="usageProgress" aria-label="${escapeHtml(metric.label || "Usage")} usage">
        <span style="width: ${escapeHtml(String(percent))}%"></span>
      </div>
      <div class="usageMetricFooter">
        <span>${escapeHtml(String(percent))}% used</span>
        <span>${escapeHtml(remainingText)}</span>
      </div>
      ${metric.note ? `<p class="usageMetricNote">${escapeHtml(metric.note)}</p>` : ""}
    </article>
  `;
}

function renderAdminUser(user) {
  const robloxId = user.robloxUserId ? String(user.robloxUserId) : "";
  const robloxName = user.robloxUsername || user.robloxDisplayName || "";
  const provider = user.authProvider === "roblox" || robloxId ? "Roblox" : "Legacy";
  const usage = user.usage || {};
  const resetLabel = user.username || user.robloxUsername || user.id || "user";
  const universes = Array.isArray(user.universes) && user.universes.length
    ? user.universes.map((universe) => `
      <li>
        <span>${escapeHtml(universe.name || `Universe ${universe.id}`)}</span>
        <code>${escapeHtml(universe.id || "")}</code>
      </li>
    `).join("")
    : `<li><span>No connected universes</span></li>`;

  return `
    <article class="adminUserCard">
      <div class="adminUserHeader">
        <div>
          <strong>${escapeHtml(user.username || "Unknown user")}</strong>
          ${user.isAdmin ? `<span>Admin</span>` : ""}
          <span>${escapeHtml(provider)}</span>
        </div>
        <div class="adminUserActions">
          <code>${escapeHtml(user.id || "")}</code>
          <button
            class="miniButton danger"
            type="button"
            data-reset-usage-user="${escapeHtml(user.id || "")}"
            data-reset-usage-username="${escapeHtml(resetLabel)}"
          >Reset usage</button>
        </div>
      </div>
      <div class="adminUserMeta">
        <div><span>Created</span><strong>${escapeHtml(formatFullDate(user.createdAt))}</strong></div>
        <div><span>Last login</span><strong>${escapeHtml(formatFullDate(user.lastLoginAt))}</strong></div>
        <div><span>Games</span><strong>${escapeHtml(String(user.projectCount || 0))}</strong></div>
        <div><span>Roblox username</span><strong>${escapeHtml(robloxName || "Not linked")}</strong></div>
        <div><span>Roblox user ID</span><strong>${escapeHtml(robloxId || "Not linked")}</strong></div>
        <div><span>Provider</span><strong>${escapeHtml(provider)}</strong></div>
        <div><span>AI calls</span><strong>${escapeHtml(formatCompactNumber(usage.aiRequests || 0))}</strong></div>
        <div><span>Events</span><strong>${escapeHtml(formatCompactNumber(usage.events || 0))}</strong></div>
        <div><span>OpenAI tokens</span><strong>${escapeHtml(formatCompactNumber(usage.openAiTokens || 0))}</strong></div>
        <div><span>Cached input</span><strong>${escapeHtml(formatCompactNumber(usage.cachedOpenAiInputTokens || 0))}</strong></div>
        <div><span>B2 storage</span><strong>${escapeHtml(formatBytes(usage.backblazeStoredBytes || 0))}</strong></div>
        <div><span>B2 objects</span><strong>${escapeHtml(formatCompactNumber(usage.backblazeObjectCount || 0))}</strong></div>
        <div><span>B2 uploads</span><strong>${escapeHtml(formatBytes(usage.backblazeUploadedBytes || 0))}</strong></div>
        <div><span>B2 downloads</span><strong>${escapeHtml(formatBytes(usage.backblazeDownloadedBytes || 0))}</strong></div>
        <div><span>Raw skipped</span><strong>${escapeHtml(formatBytes(usage.backblazeSkippedRawAnalyticsBytes || 0))}</strong></div>
        <div><span>B2 monthly</span><strong>${escapeHtml(formatCurrency(usage.backblazeEstimatedMonthlyStorageCostUsd || 0))}</strong></div>
        <div><span>Est. cost</span><strong>${escapeHtml(formatCurrency(usage.estimatedCostUsd || 0))}</strong></div>
      </div>
      <ul class="adminUniverseList">${universes}</ul>
    </article>
  `;
}

async function loadUniverses() {
  universesStatus.textContent = "Loading universes...";

  try {
    const data = await request("/api/universes");
    knownUniverses = data.universes || [];
    universeTotalMetric.textContent = String(knownUniverses.length);

    if (!knownUniverses.length) {
      selectedUniverseId = "";
      universeSelect.disabled = true;
      universeSelect.innerHTML = `<option value="">Add your first game</option>`;
      universesStatus.textContent = "Add a universe ID to connect your Roblox game.";
      renderConnectedGames();
      updateSelectedUniverse();
      loadSignalAreaCards();
      return;
    }

    const availableIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
    const previousUniverseId = selectedUniverseId;
    if (!selectedUniverseId || !availableIds.has(selectedUniverseId)) {
      selectedUniverseId = String(knownUniverses[0].id || "");
    }

    universeSelect.disabled = false;
    universeSelect.innerHTML = knownUniverses.map(renderUniverseOption).join("");
    universesStatus.textContent = `${knownUniverses.length} connected game${knownUniverses.length === 1 ? "" : "s"}.`;
    renderConnectedGames();
    updateSelectedUniverse();

    if (previousUniverseId !== selectedUniverseId) {
      window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
        detail: { universeId: selectedUniverseId },
      }));
    }
  } catch (error) {
    universesStatus.textContent = error.message;
  }
}

async function createProject() {
  const universeId = ownedGameSelect?.value.trim() || "";
  if (!universeId) {
    if (ownedGamesStatus) ownedGamesStatus.textContent = "Pick a Roblox game to connect.";
    return;
  }

  createProjectButton.disabled = true;
  if (ownedGamesStatus) ownedGamesStatus.textContent = "Verifying ownership and connecting game...";
  clearProjectSecretBox();

  try {
    const data = await request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universeId }),
    });
    showProjectSecret(data.secret || "", data.project);
    if (ownedGamesStatus) ownedGamesStatus.textContent = "Game connected. Copy the Roblox secret now.";
    await loadUniverses();
    await loadOwnedGames();
  } catch (error) {
    handleAuthError(error);
    if (ownedGamesStatus) ownedGamesStatus.textContent = error.message;
  } finally {
    createProjectButton.disabled = !ownedGames.some((game) => !game.connected);
  }
}

async function regenerateProjectSecret(projectId, button) {
  if (!projectId) return;
  const universe = knownUniverses.find((entry) => String(entry.projectId || "") === String(projectId));

  const originalText = button?.textContent || "Regenerate secret";
  if (button) {
    button.disabled = true;
    button.textContent = "Regenerating...";
  }
  clearProjectSecretBox();

  try {
    const data = await request(`/api/projects/${encodeURIComponent(projectId)}/secret`, { method: "POST" });
    showProjectSecret(data.secret || "", {
      name: data.name || universe?.name,
      universeId: data.universeId || universe?.id,
    });
    if (ownedGamesStatus) ownedGamesStatus.textContent = `Secret regenerated for ${universe?.name || "this game"}. Update that Roblox config with this new key.`;
  } catch (error) {
    handleAuthError(error);
    if (ownedGamesStatus) ownedGamesStatus.textContent = error.message;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

async function unlinkProject(projectId, button) {
  if (!projectId) return;

  const universe = knownUniverses.find((entry) => String(entry.projectId || "") === String(projectId));
  const label = universe?.name || "this game";
  const confirmed = window.confirm(`Unlink ${label}? This will delete this game's stored analytics data from the dashboard and Roblox analytics requests using this game's secret will stop working.`);
  if (!confirmed) return;

  const originalText = button?.textContent || "Unlink";
  if (button) {
    button.disabled = true;
    button.textContent = "Unlinking...";
  }
  clearProjectSecretBox();

  try {
    await request(`/api/projects/${encodeURIComponent(projectId)}`, { method: "DELETE" });
    if (ownedGamesStatus) ownedGamesStatus.textContent = `${label} was unlinked and its stored analytics data was deleted.`;
    await loadUniverses();
    await loadOwnedGames();
  } catch (error) {
    handleAuthError(error);
    if (ownedGamesStatus) ownedGamesStatus.textContent = error.message;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

async function copyProjectSecret() {
  const secret = projectSecretValue?.textContent || "";
  if (!secret) return;

  try {
    await navigator.clipboard.writeText(secret);
    if (copyProjectSecretButton) copyProjectSecretButton.textContent = "Copied";
    window.setTimeout(() => {
      if (copyProjectSecretButton) copyProjectSecretButton.textContent = "Copy secret";
    }, 1400);
  } catch {
    if (ownedGamesStatus) ownedGamesStatus.textContent = "Copy failed. Select the secret text and copy it manually.";
  }
}

function clearProjectSecretBox() {
  if (projectSecretBox) projectSecretBox.hidden = true;
  if (projectSecretValue) projectSecretValue.textContent = "";
  if (projectSecretTarget) projectSecretTarget.textContent = "";
}

function showProjectSecret(secret, project) {
  if (projectSecretValue) projectSecretValue.textContent = secret || "";
  if (projectSecretTarget) {
    const universeId = project?.universeId || project?.id || "";
    const name = project?.name || (universeId ? `Universe ${universeId}` : "Selected game");
    projectSecretTarget.textContent = universeId
      ? `For: ${name} (Universe ${universeId})`
      : `For: ${name}`;
  }
  if (projectSecretBox) projectSecretBox.hidden = !secret;
}

async function loadOwnedGames() {
  if (!authenticated || !ownedGameSelect) return;

  ownedGameSelect.disabled = true;
  if (refreshOwnedGamesButton) refreshOwnedGamesButton.disabled = true;
  if (ownedGamesStatus) ownedGamesStatus.textContent = "Loading Roblox games you own...";

  try {
    const data = await request("/api/roblox/owned-games");
    ownedGames = Array.isArray(data.games) ? data.games : [];
    const connectableGames = ownedGames.filter((game) => !game.connected);
    ownedGameSelect.innerHTML = ownedGames.length
      ? [
        `<option value="">Pick a game...</option>`,
        ...ownedGames.map(renderOwnedGameOption),
      ].join("")
      : `<option value="">No owned public games found</option>`;
    ownedGameSelect.disabled = !connectableGames.length;
    if (createProjectButton) createProjectButton.disabled = !connectableGames.length;
    if (ownedGamesStatus) {
      ownedGamesStatus.textContent = connectableGames.length
        ? `${connectableGames.length} game${connectableGames.length === 1 ? "" : "s"} ready to connect.`
        : ownedGames.length
          ? "All owned public games found are already connected."
        : "No public user-owned or owner-group games were found for this Roblox account.";
    }
  } catch (error) {
    handleAuthError(error);
    ownedGameSelect.innerHTML = `<option value="">Unable to load games</option>`;
    if (ownedGamesStatus) ownedGamesStatus.textContent = error.message;
  } finally {
    if (refreshOwnedGamesButton) refreshOwnedGamesButton.disabled = false;
  }
}

function renderOwnedGameOption(game) {
  const id = String(game.id || "");
  const name = String(game.name || `Universe ${id}`);
  const creator = game.creatorName ? ` - ${game.creatorName}` : "";
  const status = game.connected ? " - already connected" : "";
  return `<option value="${escapeHtml(id)}"${game.connected ? " disabled" : ""}>${escapeHtml(name)} (${escapeHtml(id)})${escapeHtml(creator)}${escapeHtml(status)}</option>`;
}

function renderUniverseOption(universe) {
  const id = String(universe.id || "");
  const label = String(universe.name || `Universe ${id}`);
  const selected = id === selectedUniverseId ? " selected" : "";
  return `<option value="${escapeHtml(id)}"${selected}>${escapeHtml(label)}</option>`;
}

function renderConnectedGames() {
  if (!connectedGameList) return;
  connectedGameList.innerHTML = knownUniverses.length
    ? knownUniverses.map(renderConnectedGame).join("")
    : `<p class="status">No games connected yet.</p>`;
}

function renderConnectedGame(universe) {
  const id = String(universe.id || "");
  const projectId = String(universe.projectId || "");
  const name = String(universe.name || `Universe ${id}`);
  return `
    <article class="connectedGameItem">
      <div>
        <strong>${escapeHtml(name)}</strong>
        <span>Universe ${escapeHtml(id)}</span>
      </div>
      <div class="connectedGameActions">
        <button class="button secondary compact" type="button" data-regenerate-project-secret="${escapeHtml(projectId)}"${projectId ? "" : " disabled"}>Regenerate secret</button>
        <button class="button danger compact" type="button" data-unlink-project="${escapeHtml(projectId)}"${projectId ? "" : " disabled"}>Unlink</button>
      </div>
    </article>
  `;
}

function selectUniverse(value) {
  const cleanValue = String(value || "").trim();
  const knownIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
  selectedUniverseId = /^\d+$/.test(cleanValue) && knownIds.has(cleanValue) ? cleanValue : "";
  selectedChatLogId = "";
  updateSelectedUniverse();
  loadAiAutomationSettings();
  loadChatLogs();
  loadSignalAreaCards();
  window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
    detail: { universeId: selectedUniverseId },
  }));
}

async function loadSignalAreaCards() {
  if (!authenticated) return;

  if (!selectedUniverseId) {
    renderSignalAreas(movementAreaList, [], "movement");
    renderSignalAreas(dropOffAreaList, [], "leaves");
    renderSignalAreas(deathAreaList, [], "deaths");
    return;
  }

  renderSignalLoading(movementAreaList, "movement");
  renderSignalLoading(dropOffAreaList, "drop-off");
  renderSignalLoading(deathAreaList, "death");

  const query = buildSignalAreaQuery();
  const [movementResult, leaveResult, deathResult] = await Promise.allSettled([
    request(`/api/movement-heatmap${query}`),
    request(`/api/leave-heatmap${query}`),
    request(`/api/death-heatmap${query}`),
  ]);

  if (movementResult.status === "fulfilled") {
    renderSignalAreas(movementAreaList, clusterSignalSamples(movementResult.value.samples || []), "movement");
  } else {
    handleAuthError(movementResult.reason);
    renderSignalError(movementAreaList, movementResult.reason.message);
  }

  if (leaveResult.status === "fulfilled") {
    renderSignalAreas(dropOffAreaList, clusterSignalSamples(leaveResult.value.samples || []), "leaves");
  } else {
    handleAuthError(leaveResult.reason);
    renderSignalError(dropOffAreaList, leaveResult.reason.message);
  }

  if (deathResult.status === "fulfilled") {
    renderSignalAreas(deathAreaList, clusterSignalSamples(deathResult.value.samples || []), "deaths");
  } else {
    handleAuthError(deathResult.reason);
    renderSignalError(deathAreaList, deathResult.reason.message);
  }
}

function buildSignalAreaQuery() {
  const params = new URLSearchParams();
  params.set("universeId", selectedUniverseId);

  const from = getDateTimeMs(movementFromFilter?.value);
  if (from) params.set("from", String(from));

  const to = getDateTimeMs(movementToFilter?.value);
  if (to) params.set("to", String(to));

  const query = params.toString();
  return query ? `?${query}` : "";
}

function clusterSignalSamples(samples) {
  const clusters = [];
  const radiusSq = SIGNAL_CLUSTER_RADIUS * SIGNAL_CLUSTER_RADIUS;

  for (const sample of samples) {
    const x = Number(sample.x);
    const y = Number(sample.y);
    const z = Number(sample.z);
    const weight = getSampleWeight(sample);
    if (![x, y, z].every(Number.isFinite)) continue;

    let nearest = null;
    let nearestDistanceSq = Infinity;
    for (const cluster of clusters) {
      const dx = x - cluster.x;
      const dz = z - cluster.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq <= radiusSq && distanceSq < nearestDistanceSq) {
        nearest = cluster;
        nearestDistanceSq = distanceSq;
      }
    }

    if (nearest) {
      const nextCount = nearest.count + weight;
      nearest.x = (nearest.x * nearest.count + x * weight) / nextCount;
      nearest.y = (nearest.y * nearest.count + y * weight) / nextCount;
      nearest.z = (nearest.z * nearest.count + z * weight) / nextCount;
      nearest.count = nextCount;
    } else {
      clusters.push({ x, y, z, count: weight });
    }
  }

  return clusters
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SIGNAL_AREAS)
    .map((cluster, index) => ({ ...cluster, rank: index + 1 }));
}

function getSampleWeight(sample) {
  return Math.max(
    Number(sample?.count) || 0,
    Number(sample?.movementCount) || 0,
    Number(sample?.sampleCount) || 0,
    1,
  );
}

function renderSignalLoading(container, label) {
  if (!container) return;
  container.innerHTML = `<p class="status">Loading ${escapeHtml(label)} areas...</p>`;
}

function renderSignalError(container, message) {
  if (!container) return;
  container.innerHTML = `<p class="status">${escapeHtml(message)}</p>`;
}

function renderSignalAreas(container, areas, mode) {
  if (!container) return;

  const label = getSignalAreaTitleText(mode);
  const realRows = areas.slice(0, MAX_SIGNAL_AREAS);
  const rows = [
    ...realRows,
    ...getSignalPlaceholderAreas(mode, realRows.length, MAX_SIGNAL_AREAS),
  ];
  const totalCount = realRows.reduce((sum, area) => sum + Math.max(Number(area.count) || 0, 0), 0);

  container.innerHTML = rows.map((area) => renderSignalAreaRow({
    area,
    label,
    mode,
    percent: getSignalAreaPercent(area, totalCount),
    isPlaceholder: Boolean(area.placeholder),
  })).join("");
}

function renderSignalAreaRow({ area, label, mode, percent, isPlaceholder }) {
  const itemTag = isPlaceholder ? "div" : "button";
  const itemAttrs = isPlaceholder
    ? `aria-hidden="true"`
    : `type="button"
      data-signal-area-index="${escapeHtml(String(area.rank - 1))}"
      data-signal-mode="${escapeHtml(mode)}"
      data-signal-x="${escapeHtml(String(area.x))}"
      data-signal-y="${escapeHtml(String(area.y))}"
      data-signal-z="${escapeHtml(String(area.z))}"`;
  const areaName = area.name || `${label} area ${area.rank}`;

  return `
    <${itemTag} class="signalAreaItem ${getSignalAreaClass(mode)}${isPlaceholder ? " placeholderSignal" : ""}" ${itemAttrs}>
      <span class="signalRank">${escapeHtml(String(area.rank))}</span>
      <span class="signalName">${escapeHtml(areaName)}</span>
      <span class="signalBar" aria-hidden="true">
        <i style="width: ${escapeHtml(String(percent))}%"></i>
      </span>
      <b>${isPlaceholder ? "No data" : `${escapeHtml(String(percent))}%`}</b>
    </${itemTag}>
  `;
}

function getSignalAreaPercent(area, totalCount) {
  if (Number.isFinite(area.percent)) {
    return clampPercent(area.percent);
  }

  if (!totalCount) return 0;
  return clampPercent(Math.round((Math.max(Number(area.count) || 0, 0) / totalCount) * 100));
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function getSignalPlaceholderAreas(mode, filledCount, maxCount) {
  const label = getSignalAreaTitleText(mode);
  const rows = [];

  for (let index = filledCount; index < maxCount; index += 1) {
    rows.push({
      rank: index + 1,
      name: `${label} area ${index + 1}`,
      percent: 0,
      count: 0,
      placeholder: true,
    });
  }

  return rows;
}

function focusSignalAreaFromElement(item) {
  const mode = ["movement", "deaths", "leaves"].includes(item.dataset.signalMode)
    ? item.dataset.signalMode
    : "leaves";
  const x = Number(item.dataset.signalX);
  const y = Number(item.dataset.signalY);
  const z = Number(item.dataset.signalZ);
  if (![x, y, z].every(Number.isFinite)) return;

  window.dispatchEvent(new CustomEvent("dashboard:focusHeatmapArea", {
    detail: {
      mode,
      area: { x, y, z },
    },
  }));
}

function getSignalAreaTypeText(mode) {
  if (mode === "movement") return "movement";
  if (mode === "deaths") return "death";
  return "drop-off";
}

function getSignalAreaTitleText(mode) {
  if (mode === "movement") return "Movement";
  if (mode === "deaths") return "Death";
  return "Drop-off";
}

function getSignalAreaClass(mode) {
  if (mode === "movement") return "movementSignal";
  if (mode === "deaths") return "deathSignal";
  return "leaveSignal";
}

function updateSelectedUniverse() {
  if (selectedUniverseId) {
    const selectedUniverse = knownUniverses.find((universe) => String(universe.id || "") === selectedUniverseId);
    selectedUniverseLabel.textContent = selectedUniverse?.name || `Universe ${selectedUniverseId}`;
    universeSelect.value = selectedUniverseId;
  } else {
    selectedUniverseLabel.textContent = "No universe selected";
  }
}

async function loadChatLogs() {
  if (!authenticated) return;

  if (!selectedUniverseId) {
    chatLogCount.textContent = "0";
    chatLogsStatus.textContent = "Select a universe with data to view chat logs.";
    chatLogList.innerHTML = "";
    loadChatInsights();
    return;
  }

  try {
    const query = `?universeId=${encodeURIComponent(selectedUniverseId)}`;
    const data = await request(`/api/chat-logs${query}`);
    loadChatInsights();
    chatLogCount.textContent = String(data.logCount || 0);

    if (!data.logs.length) {
      chatLogsStatus.textContent = selectedUniverseId
        ? `No chat logs stored for universe ${selectedUniverseId} yet.`
        : "Select a universe with data to view chat logs.";
      chatLogList.innerHTML = "";
      return;
    }

    chatLogsStatus.textContent = selectedUniverseId
      ? `Showing stored chat logs for universe ${selectedUniverseId}.`
      : "Select a universe with data to view chat logs.";
    chatLogList.innerHTML = data.logs.map(renderChatLog).join("");
    highlightSelectedChatLog({ scroll: false });
  } catch (error) {
    handleAuthError(error);
    chatLogsStatus.textContent = error.message;
    loadChatInsights();
  }
}

async function loadChatInsights() {
  if (!authenticated) return;

  if (!selectedUniverseId) {
    chatInsightsStatus.textContent = "Select a universe with data to view chat insights.";
    commonQuestionList.innerHTML = "";
    renderAiReportHistory([]);
    return;
  }

  try {
    const query = `?universeId=${encodeURIComponent(selectedUniverseId)}`;
    const data = await request(`/api/chat-insights${query}`);
    renderChatInsights(data);
    await loadAiReportHistory();
  } catch (error) {
    handleAuthError(error);
    chatInsightsStatus.textContent = error.message;
    commonQuestionList.innerHTML = "";
    renderAiReportHistory([]);
  }
}

async function loadAiReportHistory() {
  if (!authenticated || !selectedUniverseId || !aiReportSelect) return;

  try {
    const query = `?universeId=${encodeURIComponent(selectedUniverseId)}`;
    const data = await request(`/api/ai-insights/reports${query}`);
    renderAiReportHistory(data.reports || []);
  } catch (error) {
    handleAuthError(error);
    renderAiReportHistory([]);
  }
}

function renderAiReportHistory(reports) {
  if (!aiReportSelect) return;

  const cleanReports = Array.isArray(reports) ? reports : [];
  aiReportSelect.disabled = !selectedUniverseId || !cleanReports.length;
  aiReportSelect.innerHTML = [
    `<option value="">Latest saved report</option>`,
    ...cleanReports.map((report) => {
      const generatedAt = String(report.generatedAt || "");
      const source = report.source === "auto" ? "Auto" : "Manual";
      const label = `${source} | ${formatDateTime(report.generatedAt)} | Q${report.chatQuestionCount || 0} A${report.areaCount || 0}`;
      return `<option value="${escapeHtml(generatedAt)}">${escapeHtml(label)}</option>`;
    }),
  ].join("");
}

async function loadSelectedAiReport() {
  if (!authenticated || !selectedUniverseId || !aiReportSelect) return;

  try {
    const params = new URLSearchParams();
    params.set("universeId", selectedUniverseId);
    if (aiReportSelect.value) params.set("generatedAt", aiReportSelect.value);

    const data = await request(`/api/ai-insights/report?${params.toString()}`);
    if (!data.report) {
      chatInsightsStatus.textContent = "Saved AI report was not found.";
      return;
    }

    renderAiReport(data.report);
  } catch (error) {
    handleAuthError(error);
    chatInsightsStatus.textContent = error.message;
  }
}

function renderAiReport(report) {
  if (report.chatInsights) {
    renderChatInsights(report.chatInsights);
  } else {
    chatInsightsMode.textContent = report.mode === "partial" ? "Partial AI" : "Not analyzed";
    commonQuestionList.innerHTML = "";
  }

  if (report.areaAnalysis) {
    window.dispatchEvent(new CustomEvent("dashboard:aiAreaAnalysisUpdated", {
      detail: { universeId: selectedUniverseId, analysis: report.areaAnalysis },
    }));
  }
}

async function loadAiAutomationSettings() {
  if (!authenticated || !aiAutomationToggle) return;
  if (!selectedUniverseId) {
    aiAutomationToggle.checked = false;
    aiAutomationStatus.textContent = "Select a game";
    return;
  }

  try {
    const data = await request(`/api/ai-insights/settings?universeId=${encodeURIComponent(selectedUniverseId)}`);
    const isAuto = data.mode !== "manual";
    aiAutomationToggle.checked = isAuto;
    aiAutomationStatus.textContent = isAuto
      ? "Runs every hour"
      : "Manual only";
  } catch (error) {
    handleAuthError(error);
    if (aiAutomationStatus) aiAutomationStatus.textContent = error.message;
  }
}

async function saveAiAutomationSettings() {
  if (!authenticated || !aiAutomationToggle) return;
  if (!selectedUniverseId) {
    aiAutomationToggle.checked = false;
    aiAutomationStatus.textContent = "Select a game";
    return;
  }

  aiAutomationToggle.disabled = true;
  aiAutomationStatus.textContent = "Saving...";

  try {
    const mode = aiAutomationToggle.checked ? "auto" : "manual";
    const data = await request(`/api/ai-insights/settings?universeId=${encodeURIComponent(selectedUniverseId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    aiAutomationStatus.textContent = data.mode === "manual"
      ? "Manual only"
      : "Runs every hour";
  } catch (error) {
    handleAuthError(error);
    aiAutomationToggle.checked = !aiAutomationToggle.checked;
    aiAutomationStatus.textContent = error.message;
  } finally {
    aiAutomationToggle.disabled = false;
  }
}

async function runChatInsightsAnalysis() {
  runChatInsightsButton.disabled = true;
  chatInsightsMode.textContent = "Running AI";
  chatInsightsStatus.textContent = "Running AI across chat questions and map areas...";

  try {
    if (!selectedUniverseId) {
      chatInsightsStatus.textContent = "Select a universe with data before running AI analysis.";
      chatInsightsMode.textContent = "Not analyzed";
      return;
    }

    const query = buildAiInsightsQuery();
    const data = await request(`/api/ai-insights/analyze${query}`, { method: "POST" });

    if (data.chatInsights) {
      renderChatInsights(data.chatInsights);
    } else {
      chatInsightsMode.textContent = "Partial AI";
      commonQuestionList.innerHTML = "";
    }

    if (data.areaAnalysis) {
      window.dispatchEvent(new CustomEvent("dashboard:aiAreaAnalysisUpdated", {
        detail: { universeId: selectedUniverseId, analysis: data.areaAnalysis },
      }));
    }

    if (data.errors?.length) {
      const errorText = data.errors.map((error) => error.message).join(" ");
      chatInsightsStatus.textContent = `${chatInsightsStatus.textContent} ${errorText}`.trim();
      chatInsightsMode.textContent = "Partial AI";
    }

    await loadAiReportHistory();
    if (aiReportSelect && data.generatedAt) {
      aiReportSelect.value = String(data.generatedAt);
    }
  } catch (error) {
    handleAuthError(error);
    chatInsightsStatus.textContent = error.message;
    chatInsightsMode.textContent = "AI failed";
  } finally {
    runChatInsightsButton.disabled = false;
  }
}

function buildAiInsightsQuery() {
  const params = new URLSearchParams();
  params.set("universeId", selectedUniverseId);

  const from = getDateTimeMs(movementFromFilter?.value);
  if (from) params.set("from", String(from));

  const to = getDateTimeMs(movementToFilter?.value);
  if (to) params.set("to", String(to));

  const query = params.toString();
  return query ? `?${query}` : "";
}

function getDateTimeMs(value) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function renderChatInsights(data) {
  chatInsightsMode.textContent = data.mode === "ai" ? "AI analysis" : "Not analyzed";

  if (!data.questions.length) {
    chatInsightsStatus.textContent = data.sourceLogCount
      ? `No AI analysis saved yet. ${data.questionLikeCount || 0} question-like messages are ready to send.`
      : "No chat data available for AI analysis yet.";
    commonQuestionList.innerHTML = "";
    return;
  }

  const generatedText = data.generatedAt ? ` Last run: ${formatDateTime(data.generatedAt)}.` : "";
  chatInsightsStatus.textContent = `AI grouped ${data.questions.length} question theme${data.questions.length === 1 ? "" : "s"} from ${data.questionLikeCount || 0} question-like messages.${generatedText}`;
  commonQuestionList.innerHTML = data.questions.map(renderCommonQuestion).join("");
}

function renderChatLog(log) {
  const displayName = log.displayName && log.displayName !== log.username
    ? ` <span>${escapeHtml(log.displayName)}</span>`
    : "";
  const locationText = formatChatLocation(log);
  const locationMeta = locationText ? ` | ${locationText}` : "";
  const isSelected = selectedChatLogId && log.id === selectedChatLogId ? " selected" : "";

  return `
    <article class="chatLogItem${isSelected}" data-chat-log-id="${escapeHtml(log.id)}" tabindex="0">
      <div class="chatLogHeader">
        <div>
          <strong>${escapeHtml(log.username)}</strong>${displayName}
          <small>${escapeHtml(formatDateTime(log.sentAt))} | ${escapeHtml(shortJobId(log.jobId))}${escapeHtml(locationMeta)}</small>
        </div>
        <code>${escapeHtml(log.userId)}</code>
      </div>
      <p>${escapeHtml(log.message)}</p>
    </article>
  `;
}

function selectChatLog(id, options = {}) {
  selectedChatLogId = id;
  highlightSelectedChatLog({ scroll: Boolean(options.scroll) });

  if (options.notifyMap && id) {
    window.dispatchEvent(new CustomEvent("dashboard:chatLogSelected", {
      detail: { id },
    }));
  }
}

function highlightSelectedChatLog(options = {}) {
  for (const item of chatLogList.querySelectorAll("[data-chat-log-id]")) {
    const selected = selectedChatLogId && item.dataset.chatLogId === selectedChatLogId;
    item.classList.toggle("selected", Boolean(selected));

    if (selected && options.scroll) {
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
}

function renderCommonQuestion(question, index) {
  const examples = Array.isArray(question.examples) && question.examples.length
    ? question.examples.map((example) => `
      <li>
        <span>${escapeHtml(example.message)}</span>
        <small>${escapeHtml(example.username || "Player")}</small>
      </li>
    `).join("")
    : `<li><span>No examples stored.</span></li>`;

  return `
    <article class="commonQuestionItem">
      <div class="questionRank">${escapeHtml(String(index + 1))}</div>
      <div class="questionBody">
        <div class="questionHeader">
          <strong>${escapeHtml(question.title)}</strong>
          <span>${escapeHtml(String(question.mentions || 0))} mention${question.mentions === 1 ? "" : "s"}</span>
        </div>
        <p>${escapeHtml(String(question.playerCount || 0))} player${question.playerCount === 1 ? "" : "s"} asked similar question-like messages.</p>
        <ul class="questionExamples">${examples}</ul>
      </div>
    </article>
  `;
}

function handleAuthError(error) {
  if (error.status === 401) {
    setAuthenticated(false);
  }
}

function formatDateTime(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatFullDate(timestamp) {
  const value = Number(timestamp || 0);
  if (!value) return "Never";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCompactNumber(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat(undefined, {
    notation: Math.abs(number) >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(number);
}

function formatBytes(value) {
  const bytes = Math.max(Number(value) || 0, 0);
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: size >= 10 ? 1 : 2,
  }).format(size)} ${units[unitIndex]}`;
}

function formatUsageMetricValue(value, unit) {
  return unit === "bytes" ? formatBytes(value) : formatCompactNumber(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(Number(value) || 0);
}

function formatShortDate(timestamp) {
  const value = Number(timestamp || 0);
  if (!value) return "--";

  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function formatChatLocation(log) {
  const x = Number(log.x);
  const y = Number(log.y);
  const z = Number(log.z);

  if (![x, y, z].every(Number.isFinite)) return "";
  return `Loc ${formatCoordinate(x)}, ${formatCoordinate(y)}, ${formatCoordinate(z)}`;
}

function formatCoordinate(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function shortJobId(jobId) {
  const value = String(jobId || "");
  return value.length > 12 ? `Server ${value.slice(0, 8)}` : `Server ${value}`;
}

function showAuthError() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("auth_error");
  if (!error) return;

  authError.hidden = false;
  authError.textContent = error;
  history.replaceState(null, "", "/");
}

async function request(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

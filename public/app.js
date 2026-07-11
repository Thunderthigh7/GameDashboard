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
const adminMonthlyFailedIngests = document.querySelector("#adminMonthlyFailedIngests");
const adminMonthlyCost = document.querySelector("#adminMonthlyCost");
const refreshReconciliationButton = document.querySelector("#refreshReconciliationButton");
const reconciliationForm = document.querySelector("#reconciliationForm");
const reconciliationMonth = document.querySelector("#reconciliationMonth");
const reconciliationOpenAi = document.querySelector("#reconciliationOpenAi");
const reconciliationBackblaze = document.querySelector("#reconciliationBackblaze");
const reconciliationRender = document.querySelector("#reconciliationRender");
const reconciliationOther = document.querySelector("#reconciliationOther");
const reconciliationNotes = document.querySelector("#reconciliationNotes");
const saveReconciliationButton = document.querySelector("#saveReconciliationButton");
const reconciliationStats = document.querySelector("#reconciliationStats");
const reconciliationList = document.querySelector("#reconciliationList");
const reconciliationStatus = document.querySelector("#reconciliationStatus");
const refreshUsageButton = document.querySelector("#refreshUsageButton");
const usagePlanName = document.querySelector("#usagePlanName");
const usageConnectedGames = document.querySelector("#usageConnectedGames");
const usageEstimatedCost = document.querySelector("#usageEstimatedCost");
const usageAiCost = document.querySelector("#usageAiCost");
const usageCachedInputTokens = document.querySelector("#usageCachedInputTokens");
const usageBackblazeStorage = document.querySelector("#usageBackblazeStorage");
const usageBackblazeCost = document.querySelector("#usageBackblazeCost");
const usageResetDate = document.querySelector("#usageResetDate");
const usageStatus = document.querySelector("#usageStatus");
const usageMetricGrid = document.querySelector("#usageMetricGrid");
const usageUpgradeTitle = document.querySelector("#usageUpgradeTitle");
const usageUpgradeMessage = document.querySelector("#usageUpgradeMessage");
const usageUpgradeButton = document.querySelector("#usageUpgradeButton");
const usagePlanOptions = document.querySelector("#usagePlanOptions");
const authError = document.querySelector("#authError");
const universesStatus = document.querySelector("#universesStatus");
const universeSelect = document.querySelector("#universeSelect");
const refreshUniversesButton = document.querySelector("#refreshUniversesButton");
const projectForm = document.querySelector("#projectForm");
const ownedGameSelect = document.querySelector("#ownedGameSelect");
const refreshOwnedGamesButton = document.querySelector("#refreshOwnedGamesButton");
const ownedGamesStatus = document.querySelector("#ownedGamesStatus");
const createProjectButton = document.querySelector("#createProjectButton");
const refreshIntegrationStatusButton = document.querySelector("#refreshIntegrationStatusButton");
const integrationStatusTitle = document.querySelector("#integrationStatusTitle");
const integrationStatusGrid = document.querySelector("#integrationStatusGrid");
const integrationSignalList = document.querySelector("#integrationSignalList");
const integrationStatusMessage = document.querySelector("#integrationStatusMessage");
const setupChecklist = document.querySelector("#setupChecklist");
const projectSecretBox = document.querySelector("#projectSecretBox");
const projectSecretValue = document.querySelector("#projectSecretValue");
const projectSecretTarget = document.querySelector("#projectSecretTarget");
const copyProjectSecretButton = document.querySelector("#copyProjectSecretButton");
const connectedGameList = document.querySelector("#connectedGameList");
const refreshChatLogsButton = document.querySelector("#refreshChatLogsButton");
const refreshMovementButton = document.querySelector("#refreshMovementButton");
const selectedUniverseLabel = document.querySelector("#selectedUniverseLabel");
const chatLogsStatus = document.querySelector("#chatLogsStatus");
const chatLogList = document.querySelector("#chatLogList");
const chatInsightsStatus = document.querySelector("#chatInsightsStatus");
const chatInsightsMode = document.querySelector("#chatInsightsMode");
const aiChatMessages = document.querySelector("#aiChatMessages");
const aiChatInput = document.querySelector("#aiChatInput");
const aiChatSendButton = document.querySelector("#aiChatSendButton");
const aiChatTyping = document.querySelector("#aiChatTyping");
const runChatInsightsButton = document.querySelector("#runChatInsightsButton");
const aiAutomationToggle = document.querySelector("#aiAutomationToggle");
const aiAutomationStatus = document.querySelector("#aiAutomationStatus");
const aiReportSelect = document.querySelector("#aiReportSelect");
const commonQuestionList = document.querySelector("#commonQuestionList");
const sidebarResizeHandle = document.querySelector("#sidebarResizeHandle");
const chatPanelResizeHandle = document.querySelector("#chatPanelResizeHandle");
const movementFromFilter = document.querySelector("#movementFromFilter");
const movementToFilter = document.querySelector("#movementToFilter");
const movementFromDisplay = document.querySelector("#movementFromDisplay");
const movementToDisplay = document.querySelector("#movementToDisplay");
const pageTitle = document.querySelector("#pageTitle");
const pageSubtitle = document.querySelector("#pageSubtitle");
const viewNavLinks = document.querySelectorAll("[data-dashboard-view]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const movementAreaList = document.querySelector("#movementAreaList");
const dropOffAreaList = document.querySelector("#dropOffAreaList");
const deathAreaList = document.querySelector("#deathAreaList");
const chatAreaList = document.querySelector("#chatAreaList");
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
let lastAdminPlans = [];
let activeView = getViewFromHash();
let aiChatBusy = false;
const loadedViews = new Set();

window.getSelectedUniverseId = () => selectedUniverseId;
window.isDashboardAuthenticated = () => authenticated;

const CHAT_REFRESH_MS = 5000;
const SIGNAL_REFRESH_MS = 15000;
const MAX_SIGNAL_AREAS = 5;
const UNIVERSE_SCOPED_VIEWS = new Set(["areas", "ai-runs", "chat"]);
const SIDEBAR_WIDTH_STORAGE_KEY = "roanalytics.sidebarWidth";
const CHAT_PANEL_WIDTH_STORAGE_KEY = "roanalytics.chatPanelWidth";
const SIDEBAR_WIDTH_MIN = 208;
const SIDEBAR_WIDTH_MAX = 360;
const CHAT_PANEL_WIDTH_MIN = 300;
const CHAT_PANEL_WIDTH_MAX = 560;

init();

async function init() {
  showAuthError();
  applyStoredLayoutSizes();
  bindEvents();
  syncDateFilterDisplays();
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

  refreshUniversesButton?.addEventListener("click", loadUniverses);
  refreshIntegrationStatusButton?.addEventListener("click", loadUniverses);
  refreshUsageButton?.addEventListener("click", loadAccountUsage);
  usagePlanOptions?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-plan]");
    if (button) selectPlan(button.dataset.selectPlan || "");
  });
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
  aiChatSendButton?.addEventListener("click", sendAiChatPrompt);
  aiChatInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    sendAiChatPrompt();
  });
  refreshMovementButton?.addEventListener("click", loadSignalAreaCards);
  runChatInsightsButton.addEventListener("click", runChatInsightsAnalysis);
  aiAutomationToggle?.addEventListener("change", saveAiAutomationSettings);
  aiReportSelect?.addEventListener("change", loadSelectedAiReport);
  refreshAdminUsersButton?.addEventListener("click", loadAdminUsers);
  refreshReconciliationButton?.addEventListener("click", loadReconciliations);
  reconciliationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveReconciliation();
  });
  reconciliationList?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-reconciliation]");
    if (deleteButton) deleteReconciliation(deleteButton);
  });
  bindLayoutResizer(sidebarResizeHandle, {
    storageKey: SIDEBAR_WIDTH_STORAGE_KEY,
    cssVariable: "--sidebar-width",
    min: SIDEBAR_WIDTH_MIN,
    max: SIDEBAR_WIDTH_MAX,
    getWidth: (event) => event.clientX,
  });
  bindLayoutResizer(chatPanelResizeHandle, {
    storageKey: CHAT_PANEL_WIDTH_STORAGE_KEY,
    cssVariable: "--chat-panel-width",
    min: CHAT_PANEL_WIDTH_MIN,
    max: CHAT_PANEL_WIDTH_MAX,
    getWidth: (event) => window.innerWidth - event.clientX,
  });
  adminUserList?.addEventListener("click", (event) => {
    const resetButton = event.target.closest("[data-reset-usage-user]");
    if (resetButton) {
      resetAdminUsage(resetButton);
      return;
    }

    const planButton = event.target.closest("[data-admin-save-plan-user]");
    if (planButton) saveAdminUserPlan(planButton);
  });
  movementFromFilter?.addEventListener("change", () => {
    syncDateFilterDisplays();
    loadSignalAreaCards();
  });
  movementToFilter?.addEventListener("change", () => {
    syncDateFilterDisplays();
    loadSignalAreaCards();
  });
  movementFromFilter?.addEventListener("input", syncDateFilterDisplays);
  movementToFilter?.addEventListener("input", syncDateFilterDisplays);

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

  for (const areaList of [movementAreaList, dropOffAreaList, deathAreaList, chatAreaList]) {
    areaList?.addEventListener("click", (event) => {
      const item = event.target.closest("[data-signal-area-index]");
      if (!item) return;
      focusSignalAreaFromElement(item);
    });
  }

  for (const areaList of [movementAreaList, dropOffAreaList, deathAreaList, chatAreaList]) {
    areaList?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const item = event.target.closest("[data-signal-area-index]");
      if (!item) return;
      event.preventDefault();
      focusSignalAreaFromElement(item);
    });
  }

  window.addEventListener("dashboard:chatPointSelected", (event) => {
    selectChatLog(event.detail?.id || "", { scroll: true });
  });

  window.addEventListener("dashboard:areaClustersLoaded", (event) => {
    renderSignalAreasFromComputedPayload(event.detail?.analysis);
  });

  window.addEventListener("hashchange", () => {
    setActiveView(getViewFromHash(), { updateHash: false });
  });
}

function applyStoredLayoutSizes() {
  applyStoredLayoutSize(SIDEBAR_WIDTH_STORAGE_KEY, "--sidebar-width", SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX);
  applyStoredLayoutSize(CHAT_PANEL_WIDTH_STORAGE_KEY, "--chat-panel-width", CHAT_PANEL_WIDTH_MIN, CHAT_PANEL_WIDTH_MAX);
}

function applyStoredLayoutSize(storageKey, cssVariable, min, max) {
  const stored = getStoredLayoutWidth(storageKey);
  if (!stored) return;
  setLayoutWidth(cssVariable, stored, min, max);
}

function bindLayoutResizer(handle, options) {
  if (!handle) return;

  handle.addEventListener("pointerdown", (event) => {
    if (window.matchMedia("(max-width: 860px)").matches) return;

    event.preventDefault();
    handle.setPointerCapture?.(event.pointerId);
    document.body.classList.add("isResizingLayout");

    const update = (nextEvent) => {
      const width = setLayoutWidth(options.cssVariable, options.getWidth(nextEvent), options.min, options.max);
      storeLayoutWidth(options.storageKey, width);
      window.dispatchEvent(new Event("resize"));
    };
    const stop = () => {
      document.body.classList.remove("isResizingLayout");
      handle.removeEventListener("pointermove", update);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
      window.dispatchEvent(new Event("resize"));
    };

    update(event);
    handle.addEventListener("pointermove", update);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  });
}

function setLayoutWidth(cssVariable, value, min, max) {
  const width = clampLayoutWidth(value, min, max);
  document.documentElement.style.setProperty(cssVariable, `${width}px`);
  return width;
}

function clampLayoutWidth(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(Math.round(number), min), max);
}

function getStoredLayoutWidth(storageKey) {
  try {
    return Number(window.localStorage.getItem(storageKey));
  } catch {
    return 0;
  }
}

function storeLayoutWidth(storageKey, width) {
  try {
    window.localStorage.setItem(storageKey, String(width));
  } catch {
    // Resizing still works for the current page if storage is unavailable.
  }
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
  loadedViews.clear();
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
    selectedUniverseId = "";
    selectedUniverseLabel.textContent = "No universe selected";
    universeSelect.innerHTML = `<option value="">Sign in to load universes</option>`;
    universeSelect.disabled = true;
    if (projectSecretBox) projectSecretBox.hidden = true;
    if (projectSecretValue) projectSecretValue.textContent = "";
    if (projectSecretTarget) projectSecretTarget.textContent = "";
    if (connectedGameList) connectedGameList.innerHTML = "";
    renderIntegrationStatusCard();
    renderSetupChecklist();
    if (ownedGameSelect) {
      ownedGameSelect.innerHTML = `<option value="">Sign in to load games</option>`;
      ownedGameSelect.disabled = true;
    }
    if (ownedGamesStatus) ownedGamesStatus.textContent = "Sign in to load Roblox games.";
    chatLogsStatus.textContent = "Sign in to view chat logs.";
    chatInsightsStatus.textContent = "Sign in to view chat insights.";
    setAiChatBusy(false);
    renderAiChatWelcome();
    if (aiAutomationStatus) aiAutomationStatus.textContent = "";
    if (adminNavLink) adminNavLink.hidden = true;
    if (adminUserList) adminUserList.innerHTML = "";
    if (adminUsersStatus) adminUsersStatus.textContent = "Admin access required.";
    if (adminTotalUsers) adminTotalUsers.textContent = "0";
    if (adminTotalProjects) adminTotalProjects.textContent = "0";
    if (adminRobloxUsers) adminRobloxUsers.textContent = "0";
    if (adminMonthlyAiRequests) adminMonthlyAiRequests.textContent = "0";
    if (adminMonthlyEvents) adminMonthlyEvents.textContent = "0";
    if (adminMonthlyFailedIngests) adminMonthlyFailedIngests.textContent = "0";
    if (adminMonthlyCost) adminMonthlyCost.textContent = "$0.00";
    resetReconciliationView();
    resetUsageView();
    renderSignalAreas(movementAreaList, [], "movement");
    renderSignalAreas(dropOffAreaList, [], "leaves");
    renderSignalAreas(deathAreaList, [], "deaths");
    return;
  }

  loadDashboardData();
}

async function loadDashboardData() {
  const didNotifyUniverseChange = await loadUniverses();
  renderActiveView({ suppressOverviewEvent: didNotifyUniverseChange });
  window.dispatchEvent(new CustomEvent("dashboard:analyticsReady", {
    detail: { universeId: selectedUniverseId },
  }));
}

function getViewFromHash() {
  if (window.location.hash === "#areas") return "areas";
  if (window.location.hash === "#ai-runs") return "ai-runs";
  if (window.location.hash === "#chat") return "chat";
  if (window.location.hash === "#usage") return "usage";
  if (window.location.hash === "#connect") return "connect";
  if (window.location.hash === "#admin") return "admin";
  return "overview";
}

function setActiveView(view, options = {}) {
  const requestedView = view === "areas" || view === "ai-runs" || view === "chat" || view === "usage" || view === "connect" || view === "admin" ? view : "overview";
  activeView = requestedView === "admin" && !authenticatedUser?.isAdmin ? "overview" : requestedView;
  if (options.updateHash) {
    const nextHash = activeView === "areas"
      ? "#areas"
      : activeView === "ai-runs"
        ? "#ai-runs"
        : activeView === "chat"
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

function renderActiveView(options = {}) {
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
    areas: {
      title: "Areas",
      subtitle: "Computed movement, drop-off, death, and chat hotspots.",
    },
    "ai-runs": {
      title: "AI Runs",
      subtitle: "Automation and saved analysis history.",
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
  updateViewRefreshTimers();
  window.dispatchEvent(new CustomEvent("dashboard:viewChanged", {
    detail: { view: activeView, universeId: selectedUniverseId },
  }));

  if (authenticated && activeView === "overview" && !options.suppressOverviewEvent) {
    window.dispatchEvent(new CustomEvent("dashboard:overviewShown", {
      detail: { universeId: selectedUniverseId },
    }));
  }

  loadActiveViewData(activeView);
}

function updateViewRefreshTimers() {
  if (!authenticated) {
    stopChatRefresh();
    stopSignalRefresh();
    return;
  }

  if (activeView === "chat" && selectedUniverseId) startChatRefresh();
  else stopChatRefresh();

  if (activeView === "areas" && selectedUniverseId) startSignalRefresh();
  else stopSignalRefresh();
}

function loadActiveViewData(view, options = {}) {
  if (!authenticated) return;
  if (!selectedUniverseId && UNIVERSE_SCOPED_VIEWS.has(view)) return;
  if (!options.force && loadedViews.has(view)) return;
  loadedViews.add(view);

  if (view === "areas") {
    loadSignalAreaCards();
  } else if (view === "ai-runs") {
    loadAiAutomationSettings();
    loadAiReportHistory();
  } else if (view === "chat") {
    loadChatLogs();
  } else if (view === "usage") {
    loadAccountUsage();
  } else if (view === "connect") {
    loadOwnedGames();
  } else if (view === "admin" && authenticatedUser?.isAdmin) {
    loadAdminUsers();
    loadReconciliations();
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

async function saveAdminUserPlan(button) {
  if (!authenticatedUser?.isAdmin || !adminUserList) return;

  const userId = button.dataset.adminSavePlanUser || "";
  const card = button.closest(".adminUserCard");
  const select = card?.querySelector("[data-admin-plan-user]");
  const planKey = select?.value || "";
  const username = button.dataset.adminPlanUsername || "user";
  if (!userId || !planKey) return;

  const controls = card?.querySelectorAll("[data-admin-plan-user], [data-admin-save-plan-user]") || [];
  for (const control of controls) control.disabled = true;
  adminUsersStatus.textContent = `Changing plan for ${username}...`;

  try {
    const data = await request("/api/admin/users/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, planKey }),
    });
    renderAdminUsers(data);
    adminUsersStatus.textContent = `${data.planChange?.targetUsername || username} is now on ${data.planChange?.planName || "the selected plan"}.`;
  } catch (error) {
    handleAuthError(error);
    adminUsersStatus.textContent = formatRequestError(error);
    for (const control of controls) control.disabled = false;
  }
}

function renderAdminUsers(data) {
  lastAdminPlans = Array.isArray(data.plans) ? data.plans : [];
  adminTotalUsers.textContent = String(data.totalUsers || 0);
  adminTotalProjects.textContent = String(data.totalProjects || 0);
  if (adminRobloxUsers) adminRobloxUsers.textContent = String(data.totalRobloxUsers || 0);
  if (adminMonthlyAiRequests) adminMonthlyAiRequests.textContent = formatCompactNumber(data.usageTotals?.aiRequests || 0);
  if (adminMonthlyEvents) adminMonthlyEvents.textContent = formatCompactNumber(data.usageTotals?.events || 0);
  if (adminMonthlyFailedIngests) adminMonthlyFailedIngests.textContent = formatCompactNumber(data.usageTotals?.failedIngests || 0);
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

async function loadReconciliations() {
  if (!authenticatedUser?.isAdmin || !reconciliationList) return;

  if (reconciliationStatus) reconciliationStatus.textContent = "Loading reconciliation...";
  setReconciliationFormDisabled(true);

  try {
    const data = await request("/api/admin/reconciliations");
    renderReconciliations(data);
  } catch (error) {
    handleAuthError(error);
    if (reconciliationStatus) reconciliationStatus.textContent = error.message;
    if (reconciliationStats) reconciliationStats.innerHTML = "";
    if (reconciliationList) reconciliationList.innerHTML = "";
  } finally {
    setReconciliationFormDisabled(false);
  }
}

async function saveReconciliation() {
  if (!authenticatedUser?.isAdmin) return;

  if (reconciliationStatus) reconciliationStatus.textContent = "Saving reconciliation...";
  setReconciliationFormDisabled(true);

  try {
    const data = await request("/api/admin/reconciliations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: reconciliationMonth?.value || "",
        actualOpenAiCostUsd: reconciliationOpenAi?.value || 0,
        actualBackblazeCostUsd: reconciliationBackblaze?.value || 0,
        actualRenderCostUsd: reconciliationRender?.value || 0,
        actualOtherCostUsd: reconciliationOther?.value || 0,
        notes: reconciliationNotes?.value || "",
      }),
    });
    renderReconciliations(data);
    if (reconciliationStatus) reconciliationStatus.textContent = "Reconciliation saved.";
  } catch (error) {
    handleAuthError(error);
    if (reconciliationStatus) reconciliationStatus.textContent = error.message;
  } finally {
    setReconciliationFormDisabled(false);
  }
}

async function deleteReconciliation(button) {
  if (!authenticatedUser?.isAdmin) return;
  const month = button?.dataset.deleteReconciliation || "";
  if (!month) return;
  const confirmed = window.confirm(`Delete reconciliation for ${month}?`);
  if (!confirmed) return;

  if (reconciliationStatus) reconciliationStatus.textContent = `Deleting ${month}...`;
  setReconciliationFormDisabled(true);

  try {
    const data = await request(`/api/admin/reconciliations/${encodeURIComponent(month)}`, { method: "DELETE" });
    renderReconciliations(data);
    if (reconciliationStatus) reconciliationStatus.textContent = `Deleted reconciliation for ${month}.`;
  } catch (error) {
    handleAuthError(error);
    if (reconciliationStatus) reconciliationStatus.textContent = error.message;
  } finally {
    setReconciliationFormDisabled(false);
  }
}

function resetReconciliationView() {
  if (reconciliationStats) reconciliationStats.innerHTML = "";
  if (reconciliationList) reconciliationList.innerHTML = "";
  if (reconciliationStatus) reconciliationStatus.textContent = "Admin access required.";
  if (reconciliationMonth) reconciliationMonth.value = "";
  if (reconciliationOpenAi) reconciliationOpenAi.value = "";
  if (reconciliationBackblaze) reconciliationBackblaze.value = "";
  if (reconciliationRender) reconciliationRender.value = "";
  if (reconciliationOther) reconciliationOther.value = "";
  if (reconciliationNotes) reconciliationNotes.value = "";
  setReconciliationFormDisabled(true);
}

function renderReconciliations(data) {
  const records = Array.isArray(data.records) ? data.records : [];
  const estimate = data.currentEstimate || {};
  if (reconciliationMonth && !reconciliationMonth.value) reconciliationMonth.value = data.currentMonth || estimate.month || "";

  if (reconciliationStats) {
    reconciliationStats.innerHTML = `
      <div><span>App AI estimate</span><strong>${escapeHtml(formatCurrency(estimate.estimatedOpenAiCostUsd || 0))}</strong></div>
      <div><span>App B2 estimate</span><strong>${escapeHtml(formatCurrency(estimate.estimatedBackblazeCostUsd || 0))}</strong></div>
      <div><span>App total estimate</span><strong>${escapeHtml(formatCurrency(estimate.estimatedTotalCostUsd || 0))}</strong></div>
      <div><span>Active cost users</span><strong>${escapeHtml(formatCompactNumber(estimate.activeUserCount || 0))}</strong></div>
    `;
  }

  if (reconciliationList) {
    reconciliationList.innerHTML = records.length
      ? records.map(renderReconciliationRecord).join("")
      : `<p class="status">No reconciliation records yet.</p>`;
  }
  if (reconciliationStatus) {
    reconciliationStatus.textContent = "Provider bills are the source of truth. App estimates are everyone combined for the selected month.";
  }
}

function renderReconciliationRecord(record) {
  const variance = Number(record.varianceUsd || 0);
  const varianceClass = variance > 0 ? "warning" : variance < 0 ? "ok" : "";
  const variancePercent = record.variancePercent === null || record.variancePercent === undefined
    ? ""
    : ` (${formatCompactNumber(record.variancePercent)}%)`;

  return `
    <article class="reconciliationRecord ${escapeHtml(varianceClass)}">
      <div class="reconciliationRecordHeader">
        <div>
          <strong>${escapeHtml(record.month || "")}</strong>
          <span>${escapeHtml(record.updatedBy ? `Updated by ${record.updatedBy}` : "Saved")}</span>
        </div>
        <button class="miniButton danger" type="button" data-delete-reconciliation="${escapeHtml(record.month || "")}">Delete</button>
      </div>
      <div class="reconciliationRecordGrid">
        <div><span>Actual OpenAI</span><strong>${escapeHtml(formatCurrency(record.actualOpenAiCostUsd || 0))}</strong></div>
        <div><span>Actual B2</span><strong>${escapeHtml(formatCurrency(record.actualBackblazeCostUsd || 0))}</strong></div>
        <div><span>Actual Render</span><strong>${escapeHtml(formatCurrency(record.actualRenderCostUsd || 0))}</strong></div>
        <div><span>Actual total</span><strong>${escapeHtml(formatCurrency(record.actualTotalCostUsd || 0))}</strong></div>
        <div><span>App month estimate</span><strong>${escapeHtml(formatCurrency(record.estimatedTotalCostUsd || 0))}</strong></div>
        <div><span>Variance</span><strong>${escapeHtml(formatCurrency(variance))}${escapeHtml(variancePercent)}</strong></div>
      </div>
      ${record.notes ? `<p>${escapeHtml(record.notes)}</p>` : ""}
    </article>
  `;
}

function setReconciliationFormDisabled(disabled) {
  for (const element of [
    refreshReconciliationButton,
    reconciliationMonth,
    reconciliationOpenAi,
    reconciliationBackblaze,
    reconciliationRender,
    reconciliationOther,
    reconciliationNotes,
    saveReconciliationButton,
  ]) {
    if (element) element.disabled = disabled || !authenticatedUser?.isAdmin;
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
    usageStatus.textContent = formatRequestError(error);
    usageMetricGrid.innerHTML = "";
  } finally {
    if (refreshUsageButton) refreshUsageButton.disabled = false;
  }
}

function resetUsageView() {
  if (usagePlanName) usagePlanName.textContent = "Free";
  if (usageConnectedGames) usageConnectedGames.textContent = "0";
  if (usageEstimatedCost) usageEstimatedCost.textContent = "$0.00";
  if (usageAiCost) usageAiCost.textContent = "$0.00";
  if (usageCachedInputTokens) usageCachedInputTokens.textContent = "0";
  if (usageBackblazeStorage) usageBackblazeStorage.textContent = "0 B";
  if (usageBackblazeCost) usageBackblazeCost.textContent = "$0.00";
  if (usageResetDate) usageResetDate.textContent = "--";
  if (usageStatus) usageStatus.textContent = "Sign in to view usage.";
  if (usageMetricGrid) usageMetricGrid.innerHTML = "";
  if (usageUpgradeTitle) usageUpgradeTitle.textContent = "Upgrade plans coming soon";
  if (usageUpgradeMessage) usageUpgradeMessage.textContent = "Usage limits are active now. Paid plan controls will connect to this page next.";
  if (usageUpgradeButton) usageUpgradeButton.disabled = true;
  if (usagePlanOptions) usagePlanOptions.innerHTML = "";
}

function renderAccountUsage(data) {
  const usage = data.usage || {};
  const metrics = Array.isArray(data.metrics) ? data.metrics : [];
  const period = data.period || {};
  const upgrade = data.upgrade || {};
  const plans = Array.isArray(data.plans) ? data.plans : [];

  if (usagePlanName) usagePlanName.textContent = data.plan || "Free";
  if (usageConnectedGames) usageConnectedGames.textContent = formatCompactNumber(data.connectedGameCount || 0);
  if (usageEstimatedCost) usageEstimatedCost.textContent = formatCurrency(usage.estimatedCostUsd || 0);
  if (usageAiCost) usageAiCost.textContent = formatCurrency(usage.aiEstimatedCostUsd || 0);
  if (usageCachedInputTokens) usageCachedInputTokens.textContent = formatCompactNumber(usage.cachedOpenAiInputTokens || 0);
  if (usageBackblazeStorage) usageBackblazeStorage.textContent = formatBytes(usage.backblazeStoredBytes || 0);
  if (usageBackblazeCost) usageBackblazeCost.textContent = formatCurrency(getBackblazeEstimatedCost(usage));
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
  if (usagePlanOptions) {
    usagePlanOptions.innerHTML = plans.length
      ? plans.map(renderPlanOption).join("")
      : `<p class="status">Plans are unavailable right now.</p>`;
  }
}

function renderPlanOption(plan) {
  const limits = Array.isArray(plan.limitSummary) ? plan.limitSummary : [];
  const selected = Boolean(plan.selected);
  return `
    <article class="planOptionCard${selected ? " selected" : ""}">
      <div class="planOptionHeader">
        <div>
          <strong>${escapeHtml(plan.name || "Plan")}</strong>
          <span>${escapeHtml(plan.priceLabel || "Free for now")}</span>
        </div>
      </div>
      <p>${escapeHtml(plan.description || "")}</p>
      <ul class="planLimitList">
        ${limits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <button
        class="miniButton${selected ? " active" : ""}"
        type="button"
        data-select-plan="${escapeHtml(plan.key || "")}"
        ${selected ? "disabled" : ""}
      >${selected ? "Current plan" : "Use this plan"}</button>
    </article>
  `;
}

async function selectPlan(planKey) {
  if (!planKey || !usagePlanOptions) return;

  const buttons = usagePlanOptions.querySelectorAll("[data-select-plan]");
  for (const button of buttons) button.disabled = true;
  if (usageStatus) usageStatus.textContent = "Updating plan...";

  try {
    const data = await request("/api/account/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    renderAccountUsage(data);
    if (usageStatus) usageStatus.textContent = `Plan changed to ${data.plan || "selected plan"}.`;
    await loadOwnedGames();
  } catch (error) {
    handleAuthError(error);
    if (usageStatus) usageStatus.textContent = formatRequestError(error);
    await loadAccountUsage();
  }
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
  const adminPlanOptions = getAdminPlanOptions(user.planKey);
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
        <div class="adminPlanControl">
          <span>Plan</span>
          <div>
            <select data-admin-plan-user="${escapeHtml(user.id || "")}" aria-label="Plan for ${escapeHtml(user.username || "user")}">
              ${adminPlanOptions}
            </select>
            <button
              class="miniButton"
              type="button"
              data-admin-save-plan-user="${escapeHtml(user.id || "")}"
              data-admin-plan-username="${escapeHtml(resetLabel)}"
            >Save</button>
          </div>
        </div>
        <div><span>Games</span><strong>${escapeHtml(String(user.projectCount || 0))}</strong></div>
        <div><span>Roblox username</span><strong>${escapeHtml(robloxName || "Not linked")}</strong></div>
        <div><span>Roblox user ID</span><strong>${escapeHtml(robloxId || "Not linked")}</strong></div>
        <div><span>Provider</span><strong>${escapeHtml(provider)}</strong></div>
        <div><span>AI calls</span><strong>${escapeHtml(formatCompactNumber(usage.aiRequests || 0))}</strong></div>
        <div><span>Current model</span><strong>${escapeHtml(usage.currentOpenAiModel || "None")}</strong></div>
        <div><span>Events</span><strong>${escapeHtml(formatCompactNumber(usage.events || 0))}</strong></div>
        <div><span>Failed ingests</span><strong>${escapeHtml(formatCompactNumber(usage.failedIngests || 0))}</strong></div>
        <div><span>OpenAI tokens</span><strong>${escapeHtml(formatCompactNumber(usage.openAiTokens || 0))}</strong></div>
        <div><span>Cached input</span><strong>${escapeHtml(formatCompactNumber(usage.cachedOpenAiInputTokens || 0))}</strong></div>
        <div><span>Raw history</span><strong>${escapeHtml(formatBytes(usage.backblazeStoredBytes || 0))}</strong></div>
        <div><span>B2 objects</span><strong>${escapeHtml(formatCompactNumber(usage.backblazeObjectCount || 0))}</strong></div>
        <div><span>Raw uploads</span><strong>${escapeHtml(formatBytes(usage.backblazeUploadedBytes || 0))}</strong></div>
        <div><span>Raw reads</span><strong>${escapeHtml(formatBytes(usage.backblazeDownloadedBytes || 0))}</strong></div>
        <div><span>Raw skipped</span><strong>${escapeHtml(formatBytes(usage.backblazeSkippedRawAnalyticsBytes || 0))}</strong></div>
        <div><span>AI cost</span><strong>${escapeHtml(formatCurrency(usage.aiEstimatedCostUsd || 0))}</strong></div>
        <div><span>B2 cost</span><strong>${escapeHtml(formatCurrency(getBackblazeEstimatedCost(usage)))}</strong></div>
        <div><span>Total cost</span><strong>${escapeHtml(formatCurrency(usage.estimatedCostUsd || 0))}</strong></div>
      </div>
      <ul class="adminUniverseList">${universes}</ul>
    </article>
  `;
}

function getAdminPlanOptions(selectedPlanKey) {
  const plans = Array.isArray(lastAdminPlans) ? lastAdminPlans : [];
  if (!plans.length) {
    return `<option value="${escapeHtml(selectedPlanKey || "free")}">${escapeHtml(selectedPlanKey || "Free")}</option>`;
  }

  return plans.map((plan) => `
    <option value="${escapeHtml(plan.key || "")}"${plan.key === selectedPlanKey ? " selected" : ""}>
      ${escapeHtml(plan.name || plan.key || "Plan")}
    </option>
  `).join("");
}

async function loadUniverses() {
  universesStatus.textContent = "Loading universes...";
  if (refreshIntegrationStatusButton) refreshIntegrationStatusButton.disabled = true;

  try {
    const data = await request("/api/universes");
    knownUniverses = data.universes || [];

    if (!knownUniverses.length) {
      selectedUniverseId = "";
      universeSelect.disabled = true;
      universeSelect.innerHTML = `<option value="">Add your first game</option>`;
      universesStatus.textContent = "Add a universe ID to connect your Roblox game.";
      renderConnectedGames();
      renderIntegrationStatusCard();
      renderSetupChecklist();
      updateSelectedUniverse();
      loadSignalAreaCards();
      return false;
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
    renderIntegrationStatusCard();
    renderSetupChecklist();
    updateSelectedUniverse();

    if (previousUniverseId !== selectedUniverseId) {
      window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
        detail: { universeId: selectedUniverseId },
      }));
      return true;
    }
    return false;
  } catch (error) {
    universesStatus.textContent = error.message;
    renderIntegrationStatusCard({ error: error.message });
    renderSetupChecklist();
    return false;
  } finally {
    if (refreshIntegrationStatusButton) refreshIntegrationStatusButton.disabled = false;
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
  renderSetupChecklist();
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
  renderSetupChecklist();
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
  const status = universe.integrationStatus || {};
  const failedIngests = Number(status.failedIngests24h || 0);
  const lastReceivedAt = Number(status.lastReceivedAt || universe.lastSeenAt || 0);
  const statusClass = failedIngests > 0 ? "warning" : lastReceivedAt ? "ok" : "waiting";
  const statusText = failedIngests > 0
    ? `${formatCompactNumber(failedIngests)} failed ingests`
    : lastReceivedAt
      ? `Last data ${formatRelativeTime(lastReceivedAt)}`
      : "Waiting for data";

  return `
    <article class="connectedGameItem">
      <div class="connectedGameInfo">
        <div>
          <strong>${escapeHtml(name)}</strong>
          <span>Universe ${escapeHtml(id)}</span>
        </div>
        <div class="connectedGameStatus ${escapeHtml(statusClass)}">
          <b>${escapeHtml(statusText)}</b>
          <span>${escapeHtml(status.mapUploaded || universe.hasMapSnapshot ? "Map uploaded" : "Map missing")}</span>
        </div>
        <div class="connectedGameSignals">
          ${renderIntegrationSignal("Movement", Boolean(status.signals?.movement), status.counts?.movement)}
          ${renderIntegrationSignal("Deaths", Boolean(status.signals?.deaths), status.counts?.deaths)}
          ${renderIntegrationSignal("Leaves", Boolean(status.signals?.leaves), status.counts?.leaves)}
          ${renderIntegrationSignal("Chat", Boolean(status.signals?.chat), status.counts?.chat)}
        </div>
      </div>
      <div class="connectedGameActions">
        <button class="button secondary compact" type="button" data-regenerate-project-secret="${escapeHtml(projectId)}"${projectId ? "" : " disabled"}>Regenerate secret</button>
        <button class="button danger compact" type="button" data-unlink-project="${escapeHtml(projectId)}"${projectId ? "" : " disabled"}>Unlink</button>
      </div>
    </article>
  `;
}

function renderIntegrationStatusCard(options = {}) {
  if (!integrationStatusTitle || !integrationStatusGrid || !integrationSignalList || !integrationStatusMessage) return;

  if (options.error) {
    integrationStatusTitle.textContent = "Unable to check status";
    integrationStatusGrid.innerHTML = renderIntegrationMetric("Connection", "Error")
      + renderIntegrationMetric("Last data", "--")
      + renderIntegrationMetric("Map", "--")
      + renderIntegrationMetric("Failed ingests", "--");
    integrationSignalList.innerHTML = "";
    integrationStatusMessage.textContent = options.error;
    renderSetupChecklist();
    return;
  }

  const selectedUniverse = selectedUniverseId
    ? knownUniverses.find((universe) => String(universe.id || "") === selectedUniverseId)
    : knownUniverses[0];

  if (!selectedUniverse) {
    integrationStatusTitle.textContent = "No game connected";
    integrationStatusGrid.innerHTML = renderIntegrationMetric("Connection", "Waiting")
      + renderIntegrationMetric("Last data", "--")
      + renderIntegrationMetric("Map", "--")
      + renderIntegrationMetric("Failed ingests", "--");
    integrationSignalList.innerHTML = renderIntegrationSignal("Movement", false)
      + renderIntegrationSignal("Deaths", false)
      + renderIntegrationSignal("Leaves", false)
      + renderIntegrationSignal("Chat", false);
    integrationStatusMessage.textContent = authenticated
      ? "Connect a Roblox game to start receiving analytics data."
      : "Sign in to check integration status.";
    renderSetupChecklist();
    return;
  }

  const status = selectedUniverse.integrationStatus || {};
  const signals = status.signals || {};
  const counts = status.counts || {};
  const name = String(selectedUniverse.name || `Universe ${selectedUniverse.id || ""}`);
  const lastReceivedAt = Number(status.lastReceivedAt || selectedUniverse.lastSeenAt || 0);
  const failedIngests = Number(status.failedIngests24h || 0);
  const hasAnyData = lastReceivedAt > 0 || Number(selectedUniverse.totalSamples || 0) > 0;

  integrationStatusTitle.textContent = name;
  integrationStatusGrid.innerHTML = renderIntegrationMetric("Connection", status.connected === false ? "Not connected" : "Connected")
    + renderIntegrationMetric("Last data", lastReceivedAt ? formatRelativeTime(lastReceivedAt) : "Waiting")
    + renderIntegrationMetric("Map", status.mapUploaded || selectedUniverse.hasMapSnapshot ? "Uploaded" : "Missing")
    + renderIntegrationMetric("Failed ingests", `${formatCompactNumber(failedIngests)} / 24h`, failedIngests > 0 ? "danger" : "ok");
  integrationSignalList.innerHTML = renderIntegrationSignal("Movement", Boolean(signals.movement), counts.movement)
    + renderIntegrationSignal("Deaths", Boolean(signals.deaths), counts.deaths)
    + renderIntegrationSignal("Leaves", Boolean(signals.leaves), counts.leaves)
    + renderIntegrationSignal("Chat", Boolean(signals.chat), counts.chat);

  if (failedIngests > 0) {
    integrationStatusMessage.textContent = "Data is coming in, but recent ingests failed. Check the game secret and server logs before a client test.";
  } else if (!hasAnyData) {
    integrationStatusMessage.textContent = "Connected, waiting for Roblox data. Paste the secret into Settings.Secret and start a live server.";
  } else if (!status.mapUploaded && !selectedUniverse.hasMapSnapshot) {
    integrationStatusMessage.textContent = "Live data is coming in. Upload a map snapshot to make heatmaps easier to read.";
  } else {
    integrationStatusMessage.textContent = "Integration is receiving Roblox analytics data.";
  }

  renderSetupChecklist(selectedUniverse);
}

function renderSetupChecklist(selectedUniverse = null) {
  if (!setupChecklist) return;

  const universe = selectedUniverse || (selectedUniverseId
    ? knownUniverses.find((entry) => String(entry.id || "") === selectedUniverseId)
    : knownUniverses[0]);
  const status = universe?.integrationStatus || {};
  const signals = status.signals || {};
  const hasAnySignal = Boolean(signals.movement || signals.deaths || signals.leaves || signals.chat);
  const hasData = Boolean(Number(status.lastReceivedAt || universe?.lastSeenAt || 0));
  const hasMap = Boolean(status.mapUploaded || universe?.hasMapSnapshot);
  const secretVisible = Boolean(projectSecretBox && !projectSecretBox.hidden && projectSecretValue?.textContent);

  const steps = [
    {
      title: "Sign in with Roblox",
      detail: authenticated ? "Signed in." : "Use the Roblox account that owns the game.",
      complete: authenticated,
    },
    {
      title: "Connect a game",
      detail: knownUniverses.length ? `${knownUniverses.length} connected game${knownUniverses.length === 1 ? "" : "s"}.` : "Pick one owned public game from the list.",
      complete: knownUniverses.length > 0,
    },
    {
      title: "Install the secret",
      detail: hasData ? "Roblox is sending data with the installed secret." : secretVisible ? "Copy the visible secret into Settings.Secret now." : "Regenerate the secret if you need to copy it again.",
      complete: hasData,
      current: Boolean(universe && !hasData),
    },
    {
      title: "Start a live server",
      detail: hasData ? `Last data ${formatRelativeTime(status.lastReceivedAt || universe?.lastSeenAt)}.` : "Join the game after installing the analytics script.",
      complete: hasData,
    },
    {
      title: "Confirm signals",
      detail: hasAnySignal ? getActiveSignalText(signals) : "Movement should activate first; deaths, leaves, and chat activate when those events happen.",
      complete: hasAnySignal,
    },
    {
      title: "Upload map",
      detail: hasMap ? "Map snapshot uploaded." : "Upload a map snapshot so heatmaps line up with the world.",
      complete: hasMap,
    },
  ];

  setupChecklist.innerHTML = steps.map((step) => `
    <li class="${step.complete ? "complete" : step.current ? "current" : ""}">
      <span aria-hidden="true"></span>
      <div>
        <strong>${escapeHtml(step.title)}</strong>
        <p>${escapeHtml(step.detail)}</p>
      </div>
    </li>
  `).join("");
}

function getActiveSignalText(signals = {}) {
  const active = [];
  if (signals.movement) active.push("movement");
  if (signals.deaths) active.push("deaths");
  if (signals.leaves) active.push("leaves");
  if (signals.chat) active.push("chat");
  return active.length ? `Active signals: ${active.join(", ")}.` : "No active signals yet.";
}

function renderIntegrationMetric(label, value, status = "") {
  const statusClass = status ? ` class="${escapeHtml(status)}"` : "";
  return `<div${statusClass}><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderIntegrationSignal(label, active, count = null) {
  const countText = count === null || count === undefined ? "" : ` ${formatCompactNumber(count)}`;
  return `<span class="${active ? "active" : ""}">${escapeHtml(label)}${escapeHtml(countText)}</span>`;
}

function selectUniverse(value) {
  const cleanValue = String(value || "").trim();
  const knownIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
  selectedUniverseId = /^\d+$/.test(cleanValue) && knownIds.has(cleanValue) ? cleanValue : "";
  selectedChatLogId = "";
  updateSelectedUniverse();
  renderAiChatWelcome();
  renderIntegrationStatusCard();
  renderSetupChecklist();
  loadedViews.clear();
  loadActiveViewData(activeView, { force: true });
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
    renderSignalAreas(chatAreaList, [], "chat");
    return;
  }

  renderSignalLoading(movementAreaList, "movement");
  renderSignalLoading(dropOffAreaList, "drop-off");
  renderSignalLoading(deathAreaList, "death");
  renderSignalLoading(chatAreaList, "chat");

  const query = buildSignalAreaQuery();
  try {
    const data = await request(`/api/area-clusters${query}`);
    renderSignalAreasFromComputedPayload(data);
  } catch (error) {
    handleAuthError(error);
    renderSignalError(movementAreaList, error.message);
    renderSignalError(dropOffAreaList, error.message);
    renderSignalError(deathAreaList, error.message);
    renderSignalError(chatAreaList, error.message);
  }
}

function renderSignalAreasFromComputedPayload(payload) {
  if (!payload?.signalAreas) return;
  renderSignalAreas(movementAreaList, payload.signalAreas.movement || [], "movement");
  renderSignalAreas(dropOffAreaList, payload.signalAreas.leaves || [], "leaves");
  renderSignalAreas(deathAreaList, payload.signalAreas.deaths || [], "deaths");
  renderSignalAreas(chatAreaList, payload.signalAreas.chat || [], "chat");
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

  const emptyMessage = realRows.length ? "" : `<p class="status signalEmptyStatus">${escapeHtml(getSignalEmptyMessage(mode))}</p>`;
  container.innerHTML = emptyMessage + rows.map((area) => renderSignalAreaRow({
    area,
    label,
    mode,
    percent: getSignalAreaPercent(area, totalCount),
    isPlaceholder: Boolean(area.placeholder),
  })).join("");
}

function getSignalEmptyMessage(mode) {
  if (!selectedUniverseId) return "Select or connect a Roblox game to see top areas.";
  if (mode === "movement") return "No movement areas yet. Start a live Roblox server with the analytics script installed.";
  if (mode === "deaths") return "No death areas yet. Death locations appear after players die in a tracked server.";
  if (mode === "chat") return "No chat areas yet. Chat locations appear after players send messages in a tracked server.";
  return "No drop-off areas yet. Leave locations appear after players exit a tracked server.";
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
  const mode = ["movement", "deaths", "leaves", "chat"].includes(item.dataset.signalMode)
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
  if (mode === "chat") return "chat";
  return "drop-off";
}

function getSignalAreaTitleText(mode) {
  if (mode === "movement") return "Movement";
  if (mode === "deaths") return "Death";
  if (mode === "chat") return "Chat";
  return "Drop-off";
}

function getSignalAreaClass(mode) {
  if (mode === "movement") return "movementSignal";
  if (mode === "deaths") return "deathSignal";
  if (mode === "chat") return "chatSignal";
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
    chatLogsStatus.textContent = "Connect or select a Roblox game to view chat logs.";
    chatLogList.innerHTML = "";
    loadChatInsights();
    return;
  }

  try {
    const query = `?universeId=${encodeURIComponent(selectedUniverseId)}`;
    const data = await request(`/api/chat-logs${query}`);
    loadChatInsights();
    if (!data.logs.length) {
      chatLogsStatus.textContent = selectedUniverseId
        ? "No chat logs yet. Start a live server with chat tracking enabled, then have a player send a message."
        : "Connect or select a Roblox game to view chat logs.";
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
    chatLogsStatus.textContent = formatRequestError(error);
    loadChatInsights();
  }
}

async function loadChatInsights() {
  if (!authenticated) return;

  if (!selectedUniverseId) {
    chatInsightsStatus.textContent = "Connect or select a Roblox game before running AI Insights.";
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
    chatInsightsStatus.textContent = formatRequestError(error);
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
    chatInsightsStatus.textContent = formatRequestError(error);
  }
}

function renderAiReport(report) {
  const areaCount = Array.isArray(report.areaAnalysis?.areas) ? report.areaAnalysis.areas.length : 0;
  const hasChatQuestions = Array.isArray(report.chatInsights?.questions) && report.chatInsights.questions.length > 0;

  if (report.chatInsights) {
    renderChatInsights(report.chatInsights);
  } else {
    chatInsightsMode.textContent = report.mode === "partial" ? "Partial AI" : "Not analyzed";
    commonQuestionList.innerHTML = "";
  }

  if (!hasChatQuestions && areaCount) {
    const generatedText = report.generatedAt ? ` Last run: ${formatDateTime(report.generatedAt)}.` : "";
    chatInsightsMode.textContent = report.mode === "partial" ? "Partial AI" : "AI analysis";
    chatInsightsStatus.textContent = `AI analyzed ${areaCount} map area${areaCount === 1 ? "" : "s"} from tracked movement, death, leave, and chat samples.${generatedText}`;
    commonQuestionList.innerHTML = "";
  }

  if (report.areaAnalysis) {
    window.dispatchEvent(new CustomEvent("dashboard:aiAreaAnalysisUpdated", {
      detail: { universeId: selectedUniverseId, analysis: report.areaAnalysis },
    }));
  }

  if (!hasChatQuestions && !areaCount && report.errors?.length) {
    chatInsightsStatus.textContent = report.errors.map((error) => error.message).join(" ");
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
  chatInsightsStatus.textContent = "Running AI across movement, death, leave, and chat samples...";

  try {
    if (!selectedUniverseId) {
      chatInsightsStatus.textContent = "Select a universe with data before running AI analysis.";
      chatInsightsMode.textContent = "Not analyzed";
      return;
    }

    const query = buildAiInsightsQuery();
    const data = await request(`/api/ai-insights/analyze${query}`, { method: "POST" });
    renderAiReport(data);

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
    chatInsightsStatus.textContent = formatRequestError(error);
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

async function sendAiChatPrompt() {
  if (!aiChatInput || !aiChatSendButton || aiChatBusy) return;

  const prompt = aiChatInput.value.trim();
  if (!prompt) return;

  if (!selectedUniverseId) {
    chatInsightsStatus.textContent = "Select a universe before asking the AI chatbot.";
    return;
  }

  appendAiChatMessage("user", prompt);
  aiChatInput.value = "";
  setAiChatBusy(true);
  chatInsightsStatus.textContent = "Asking AI about current dashboard data...";

  try {
    const data = await request(`/api/ai-chat${buildAiInsightsQuery()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    appendAiChatMessage("assistant", data.answer || "I could not find an answer in the current data.");
    chatInsightsStatus.textContent = data.model
      ? `AI answer generated from current dashboard data using ${data.model}.`
      : "AI answer generated from current dashboard data.";
  } catch (error) {
    handleAuthError(error);
    const message = formatRequestError(error);
    appendAiChatMessage("assistant", message);
    chatInsightsStatus.textContent = message;
  } finally {
    setAiChatBusy(false);
  }
}

function appendAiChatMessage(role, message) {
  if (!aiChatMessages) return;

  const article = document.createElement("article");
  article.dataset.aiChatMessage = role;
  article.className = role === "user" ? "botMessage userMessage" : "botMessage assistantMessage";

  if (role === "user") {
    article.innerHTML = `
      <strong>${escapeHtml(authenticatedUser?.username || "You")} <small>${escapeHtml(formatDateTime(Date.now()))}</small></strong>
      <p>${escapeHtml(message)}</p>
    `;
  } else {
    article.innerHTML = `
      <span aria-hidden="true"></span>
      <div>
        <strong>RoAnalytics AI <small>${escapeHtml(formatDateTime(Date.now()))}</small></strong>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  aiChatMessages.insertBefore(article, aiChatTyping || null);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

function setAiChatBusy(isBusy) {
  aiChatBusy = Boolean(isBusy);
  if (aiChatSendButton) aiChatSendButton.disabled = aiChatBusy;
  if (aiChatInput) aiChatInput.disabled = aiChatBusy || !authenticated;
  if (aiChatTyping) aiChatTyping.hidden = !aiChatBusy;
}

function renderAiChatWelcome() {
  if (!aiChatMessages) return;
  for (const message of aiChatMessages.querySelectorAll("[data-ai-chat-message]")) {
    message.remove();
  }
  if (aiChatInput) aiChatInput.value = "";
  if (aiChatTyping) aiChatTyping.hidden = true;
}

function getDateTimeMs(value) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function syncDateFilterDisplays() {
  if (movementFromDisplay) {
    movementFromDisplay.textContent = formatDateFilterDisplay(movementFromFilter?.value, "Select start date");
  }

  if (movementToDisplay) {
    movementToDisplay.textContent = formatDateFilterDisplay(movementToFilter?.value, "Select end date");
  }
}

function formatDateFilterDisplay(value, fallback) {
  const timestamp = getDateTimeMs(value);
  if (!timestamp) return fallback;

  const date = new Date(timestamp);
  const dateText = date.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeText = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateText} ${timeText}`;
}

function renderChatInsights(data) {
  chatInsightsMode.textContent = data.mode === "ai" ? "AI analysis" : "Not analyzed";

  if (!data.questions.length) {
    chatInsightsStatus.textContent = data.sourceLogCount
      ? `No saved chat question groups yet. ${data.questionLikeCount || 0} question-like messages are available; AI Insights can still use movement, death, and leave samples.`
      : "No chat question groups yet. AI Insights can still use movement, death, and leave samples.";
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

function formatRelativeTime(timestamp) {
  const value = Number(timestamp || 0);
  if (!value) return "--";

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - value) / 1000));
  if (elapsedSeconds < 60) return "Just now";

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d ago`;
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

function getBackblazeEstimatedCost(usage) {
  return Number(usage?.backblazeEstimatedMonthlyStorageCostUsd || 0)
    + Number(usage?.backblazeEstimatedEgressOverageCostUsd || 0);
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

function formatRequestError(error) {
  const payload = error?.payload || {};
  if (payload.code !== "USAGE_LIMIT") return error?.message || "Request failed";

  const label = payload.label || payload.metric || "Usage";
  const used = formatUsageMetricValue(payload.used || payload.currentUsage || 0, getUsageMetricUnit(payload.metric));
  const limit = payload.limit > 0
    ? formatUsageMetricValue(payload.limit || payload.planLimit || 0, getUsageMetricUnit(payload.metric))
    : "Unlimited";
  const requested = formatUsageMetricValue(payload.requested || 0, getUsageMetricUnit(payload.metric));
  const stillWorks = payload.whatStillWorks ? ` ${payload.whatStillWorks}` : "";
  return `${label} limit reached. Current usage: ${used}. Plan limit: ${limit}. Requested: ${requested}.${stillWorks}`;
}

function getUsageMetricUnit(metric) {
  if (metric === "backblazeStoredBytes" || metric === "backblazeUploadedBytes" || metric === "backblazeDownloadedBytes") return "bytes";
  if (metric === "openAiTokens") return "tokens";
  if (metric === "mapUploads") return "uploads";
  if (metric === "aiRequests") return "runs";
  return "unit";
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

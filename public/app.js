const accountBox = document.querySelector("#accountBox");
const loginPanel = document.querySelector("#loginPanel");
const robloxLoginButtons = document.querySelectorAll("[data-roblox-login]");
const loginStatus = document.querySelector("#loginStatus");
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
const universeSelectorButton = document.querySelector("#universeSelectorButton");
const universeDropdownMenu = document.querySelector("#universeDropdownMenu");
const refreshUniversesButton = document.querySelector("#refreshUniversesButton");
const projectForm = document.querySelector("#projectForm");
const ownedGameSelect = document.querySelector("#ownedGameSelect");
const refreshOwnedGamesButton = document.querySelector("#refreshOwnedGamesButton");
const ownedGamesStatus = document.querySelector("#ownedGamesStatus");
const createProjectButton = document.querySelector("#createProjectButton");
const connectNewGameButton = document.querySelector("#connectNewGameButton");
const createDemoUniverseButton = document.querySelector("#createDemoUniverseButton");
const demoUniverseStatus = document.querySelector("#demoUniverseStatus");
const refreshIntegrationStatusButton = document.querySelector("#refreshIntegrationStatusButton");
const integrationStatusTitle = document.querySelector("#integrationStatusTitle");
const integrationStatusState = document.querySelector("#integrationStatusState");
const integrationStatusArtworkLabel = document.querySelector("#integrationStatusArtworkLabel");
const integrationStatusGrid = document.querySelector("#integrationStatusGrid");
const integrationSignalList = document.querySelector("#integrationSignalList");
const integrationStatusMessage = document.querySelector("#integrationStatusMessage");
const setupChecklist = document.querySelector("#setupChecklist");
const setupProgressText = document.querySelector("#setupProgressText");
const setupProgressTrack = document.querySelector("#setupProgressTrack");
const setupProgressBar = document.querySelector("#setupProgressBar");
const setupProgressPercent = document.querySelector("#setupProgressPercent");
const projectSecretBox = document.querySelector("#projectSecretBox");
const projectSecretValue = document.querySelector("#projectSecretValue");
const projectSecretTarget = document.querySelector("#projectSecretTarget");
const copyProjectSecretButton = document.querySelector("#copyProjectSecretButton");
const connectedGameList = document.querySelector("#connectedGameList");
const selectedUniverseLabel = document.querySelector("#selectedUniverseLabel");
const chatLogsStatus = document.querySelector("#chatLogsStatus");
const chatLogList = document.querySelector("#chatLogList");
const chatMessageCount = document.querySelector("#chatMessageCount");
const chatPlayerCount = document.querySelector("#chatPlayerCount");
const chatLiveBadge = document.querySelector("#chatLiveBadge");
const releaseStatus = document.querySelector("#releaseStatus");
const releaseComparisonContent = document.querySelector("#releaseComparisonContent");
const releasePlaceSelect = document.querySelector("#releasePlaceSelect");
const releasePlaceField = document.querySelector(".releasePlaceField");
const releaseBeforeVersionButton = document.querySelector("#releaseBeforeVersionButton");
const releaseAfterVersionButton = document.querySelector("#releaseAfterVersionButton");
const releaseBeforeVersionLabel = document.querySelector("#releaseBeforeVersionLabel");
const releaseAfterVersionLabel = document.querySelector("#releaseAfterVersionLabel");
const releaseBeforeVersionMenu = document.querySelector("#releaseBeforeVersionMenu");
const releaseAfterVersionMenu = document.querySelector("#releaseAfterVersionMenu");
const releaseBeforeDateRange = document.querySelector("#releaseBeforeDateRange");
const releaseAfterDateRange = document.querySelector("#releaseAfterDateRange");
const releaseFunnelPicker = document.querySelector(".releaseFunnelPicker");
const releaseFunnelPickerButton = document.querySelector("#releaseFunnelPickerButton");
const releaseFunnelMenu = document.querySelector("#releaseFunnelMenu");
const eventsStatus = document.querySelector("#eventsStatus");
const eventCatalog = document.querySelector("#eventCatalog");
const selectedEventTitle = document.querySelector("#selectedEventTitle");
const selectedEventSubtitle = document.querySelector("#selectedEventSubtitle");
const eventChart = document.querySelector("#eventChart");
const eventIntervalSelect = document.querySelector("#eventIntervalSelect");
const eventPropertyList = document.querySelector("#eventPropertyList");
const recentEventTableHeader = document.querySelector("#recentEventTableHeader");
const recentEventList = document.querySelector("#recentEventList");
const viewAllRecentEventsButton = document.querySelector("#viewAllRecentEventsButton");
const eventRecentDisclosure = document.querySelector(".eventRecentDisclosure");
const newFunnelButton = document.querySelector("#newFunnelButton");
const funnelsStatus = document.querySelector("#funnelsStatus");
const funnelCatalog = document.querySelector("#funnelCatalog");
const funnelAnalyticsView = document.querySelector("#funnelAnalyticsView");
const funnelForm = document.querySelector("#funnelForm");
const funnelId = document.querySelector("#funnelId");
const funnelName = document.querySelector("#funnelName");
const funnelWindowMinutes = document.querySelector("#funnelWindowMinutes");
const funnelStepEditor = document.querySelector("#funnelStepEditor");
const addFunnelStepButton = document.querySelector("#addFunnelStepButton");
const saveFunnelButton = document.querySelector("#saveFunnelButton");
const deleteFunnelButton = document.querySelector("#deleteFunnelButton");
const editFunnelButton = document.querySelector("#editFunnelButton");
const funnelMoreButton = document.querySelector("#funnelMoreButton");
const funnelMorePopover = document.querySelector("#funnelMorePopover");
const cancelFunnelEditButton = document.querySelector("#cancelFunnelEditButton");
const cancelFunnelButton = document.querySelector("#cancelFunnelButton");
const funnelFormStatus = document.querySelector("#funnelFormStatus");
const funnelBuilderTitle = document.querySelector("#funnelBuilderTitle");
const funnelResultsTitle = document.querySelector("#funnelResultsTitle");
const funnelResultsSubtitle = document.querySelector("#funnelResultsSubtitle");
const funnelEnteredCount = document.querySelector("#funnelEnteredCount");
const funnelCompletedCount = document.querySelector("#funnelCompletedCount");
const funnelConversionRate = document.querySelector("#funnelConversionRate");
const funnelMedianTime = document.querySelector("#funnelMedianTime");
const funnelResultSteps = document.querySelector("#funnelResultSteps");
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
const allDataFilter = document.querySelector("#allDataFilter");
const pageTitle = document.querySelector("#pageTitle");
const pageSubtitle = document.querySelector("#pageSubtitle");
const viewNavLinks = document.querySelectorAll("[data-dashboard-view]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const protectedDashboardPanels = document.querySelectorAll(
  ".sidebar, .topbar, #authControls, .viewPage"
);

let chatRefreshTimer;
let funnelRefreshTimer;
let selectedUniverseId = "";
let selectedChatLogId = "";
let currentChatLogs = [];
let knownUniverses = [];
let ownedGames = [];
let authenticated = false;
let authenticatedUser = null;
let lastAdminPlans = [];
let activeView = getViewFromHash();
let aiChatBusy = false;
let aiChatHistory = [];
let heatmapModulePromise = null;
let universeRequestSequence = 0;
let chatLogRequestSequence = 0;
let chatLogRequestState = null;
let chatInsightsRequestSequence = 0;
let aiReportHistoryRequestSequence = 0;
let aiReportRequestSequence = 0;
let aiAutomationSettingsRequestSequence = 0;
let usageRequestSequence = 0;
let adminUsersRequestSequence = 0;
let reconciliationRequestSequence = 0;
let releaseRequestSequence = 0;
let currentReleasePayload = null;
let releaseSelection = createEmptyReleaseSelection();
let customEventsRequestSequence = 0;
let selectedCustomEventName = "";
let selectedEventInterval = "auto";
let currentEventPropertySummaries = [];
let currentSelectedEventCount = 0;
let recentEventsExpanded = false;
let funnelRequestSequence = 0;
let selectedFunnelId = "";
let currentFunnels = [];
let currentFunnelEventNames = [];
let isCreatingFunnel = false;
const loadedViews = new Set();
const inFlightGetRequests = new Map();
const aiReportPayloadCache = new Map();

const DASHBOARD_ASSET_VERSION = "20260722-5";
const EVENT_PROPERTY_VALUE_LIMIT = 4;
const RECENT_EVENT_LIMIT = 7;
const RECENT_EVENT_EXPANDED_LIMIT = 100;
const MAX_AI_CHAT_HISTORY_MESSAGES = 8;
const MAX_AI_CHAT_PROMPT_CHARS = 800;
const MAX_AI_CHAT_RENDER_CHARS = 6000;
const PRIMARY_EVENT_PROPERTIES = new Map([
  ["genre_portal_entered", "genre"],
  ["obby_run_started", "course"],
  ["obby_checkpoint_reached", "checkpoint"],
  ["obby_failed", "obstacle"],
  ["obby_completed", "completionTimeSeconds"],
  ["fps_match_joined", "mode"],
  ["weapon_selected", "weapon"],
  ["combat_death", "killedByWeapon"],
  ["fps_match_completed", "result"],
  ["sword_duel_started", "arena"],
  ["sword_selected", "sword"],
  ["sword_duel_defeat", "defeatedBySword"],
  ["sword_duel_completed", "result"],
  ["simulator_zone_entered", "zone"],
  ["egg_hatched", "egg"],
  ["simulator_session_ended", "reason"],
  ["purchase_prompt", "product"],
  ["item_purchased", "product"],
  ["purchase_prompt_closed", "reason"],
]);
const GENERIC_EVENT_PROPERTY_NAMES = new Set([
  "cohort",
  "device",
  "environment",
  "platform",
  "placeversion",
  "region",
  "serverversion",
  "whenuserfirstplayed",
]);

window.getSelectedUniverseId = () => selectedUniverseId;
window.isDashboardAuthenticated = () => authenticated;
const resolveDashboardCacheScope = () => {
  const username = String(authenticatedUser?.username || "").trim().toLowerCase();
  return authenticated && username ? encodeURIComponent(username) : "";
};
window.getDashboardCacheScope = resolveDashboardCacheScope;

const CHAT_REFRESH_MS = 5000;
const RECENT_CHAT_LIMIT = 100;
const FUNNEL_REFRESH_MS = 15000;
const UNIVERSE_SCOPED_VIEWS = new Set(["events", "funnels", "releases", "ai-runs", "chat"]);
const SIDEBAR_WIDTH_STORAGE_KEY = "roanalytics.sidebarWidth";
const CHAT_PANEL_WIDTH_STORAGE_KEY = "roanalytics.chatPanelWidth";
const SIDEBAR_WIDTH_MIN = 208;
const SIDEBAR_WIDTH_MAX = 360;
const CHAT_PANEL_WIDTH_MIN = 300;
const CHAT_PANEL_WIDTH_MAX = 560;
const DASHBOARD_SESSION_CACHE_PREFIX = "roanalytics.dashboard.v2";
const UNIVERSE_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const USAGE_CACHE_FRESH_MS = 30 * 1000;
const USAGE_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const ADMIN_CACHE_FRESH_MS = 30 * 1000;
const ADMIN_CACHE_MAX_AGE_MS = 30 * 60 * 1000;
const AI_REPORT_HISTORY_CACHE_FRESH_MS = 20 * 1000;
const AI_REPORT_HISTORY_CACHE_MAX_AGE_MS = 10 * 60 * 1000;
const AI_REPORT_LATEST_CACHE_MS = 20 * 1000;
const AI_REPORT_VERSION_CACHE_MS = 24 * 60 * 60 * 1000;
const AI_REPORT_MISSING_CACHE_MS = 20 * 1000;
const AI_AUTOMATION_CACHE_FRESH_MS = 30 * 1000;
const AI_AUTOMATION_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const MAX_AI_REPORT_MEMORY_CACHE_ENTRIES = 8;
const MAX_AI_REPORT_SESSION_CACHE_ENTRIES = 6;
const MAX_AI_REPORT_SESSION_CACHE_CHARS = 1_000_000;
const MAX_SESSION_CACHE_CHARS = 1_500_000;

init();

async function init() {
  showAuthError();
  applyStoredLayoutSizes();
  bindEvents();
  initializeDateFilterDefaults();
  syncDateFilterDisplays();
  await checkAuth();
}

function loadHeatmapModule() {
  if (heatmapModulePromise) return heatmapModulePromise;
  heatmapModulePromise = import(`/heatmap.js?v=${DASHBOARD_ASSET_VERSION}`)
    .then(() => {
      if (authenticated) notifyAnalyticsReady();
    })
    .catch((error) => {
      heatmapModulePromise = null;
      console.error("Could not load the heatmap module.", error);
    });
  return heatmapModulePromise;
}

function bindEvents() {
  for (const button of robloxLoginButtons) button.addEventListener("click", () => {
    if (loginStatus) loginStatus.textContent = "Opening Roblox...";
    for (const loginButton of robloxLoginButtons) loginButton.disabled = true;
    window.location.href = "/api/auth/roblox/start";
  });

  logoutButton.addEventListener("click", async () => {
    const cacheScope = resolveDashboardCacheScope();
    await request("/api/auth/logout", { method: "POST" });
    clearDashboardSessionCache(cacheScope);
    await window.clearDashboardPersistentCache?.(cacheScope);
    window.location.reload();
  });

  refreshUniversesButton?.addEventListener("click", loadUniverses);
  refreshIntegrationStatusButton?.addEventListener("click", loadUniverses);
  refreshUsageButton?.addEventListener("click", () => loadAccountUsage({ force: true }));
  usagePlanOptions?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-plan]");
    if (button) selectPlan(button.dataset.selectPlan || "");
  });
  refreshOwnedGamesButton?.addEventListener("click", loadOwnedGames);
  connectNewGameButton?.addEventListener("click", () => {
    document.querySelector("#connectGameRow")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => ownedGameSelect?.focus({ preventScroll: true }), 260);
  });
  createDemoUniverseButton?.addEventListener("click", createDemoUniverse);
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
  universeSelectorButton?.addEventListener("click", toggleUniverseDropdown);
  universeSelectorButton?.addEventListener("keydown", handleUniverseTriggerKeydown);
  universeDropdownMenu?.addEventListener("click", handleUniverseDropdownClick);
  universeDropdownMenu?.addEventListener("keydown", handleUniverseDropdownKeydown);
  document.addEventListener("pointerdown", handleUniverseDropdownOutsidePointer);
  window.addEventListener("resize", positionUniverseDropdown);
  window.addEventListener("scroll", positionUniverseDropdown, true);
  releasePlaceSelect?.addEventListener("change", () => {
    releaseSelection.placeId = releasePlaceSelect.value || "";
    releaseSelection.beforeVersion = "";
    releaseSelection.afterVersion = "";
    closeReleaseFunnelMenu();
    loadReleases();
  });
  releaseBeforeVersionButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleReleaseVersionMenu("before");
  });
  releaseAfterVersionButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleReleaseVersionMenu("after");
  });
  releaseBeforeVersionMenu?.addEventListener("click", handleReleaseVersionMenuClick);
  releaseAfterVersionMenu?.addEventListener("click", handleReleaseVersionMenuClick);
  releaseFunnelPickerButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    closeReleaseVersionMenus();
    toggleReleaseFunnelMenu();
  });
  releaseFunnelMenu?.addEventListener("click", handleReleaseFunnelMenuClick);
  releaseFunnelMenu?.addEventListener("change", handleReleaseFunnelSelectionChange);
  document.addEventListener("pointerdown", handleReleaseFunnelOutsidePointer);
  document.addEventListener("pointerdown", handleReleaseVersionOutsidePointer);
  document.addEventListener("keydown", handleReleaseControlEscape);
  eventCatalog?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-event-name]");
    const eventName = button?.dataset.eventName || "";
    if (!eventName) return;
    const selectionChanged = eventName !== selectedCustomEventName;
    selectedCustomEventName = eventName;
    syncEventCatalogSelection(eventName);
    if (selectionChanged) {
      currentEventPropertySummaries = [];
      currentSelectedEventCount = 0;
      recentEventsExpanded = false;
      prepareCustomEventSelection(eventName);
      window.dispatchEvent(new CustomEvent("dashboard:eventMapSelectionChanged", {
        detail: { eventName: selectedCustomEventName, source: "events-page" },
      }));
    }
    loadCustomEvents({ force: true, selectionChange: selectionChanged });
  });
  eventIntervalSelect?.addEventListener("change", () => {
    selectedEventInterval = eventIntervalSelect.value || "auto";
    loadCustomEvents({ force: true });
  });
  viewAllRecentEventsButton?.addEventListener("click", () => {
    recentEventsExpanded = !recentEventsExpanded;
    loadCustomEvents({ force: true });
  });
  eventRecentDisclosure?.addEventListener("toggle", () => {
    if (eventRecentDisclosure.open || !recentEventsExpanded) return;
    recentEventsExpanded = false;
    loadCustomEvents({ force: true });
  });
  newFunnelButton?.addEventListener("click", startNewFunnel);
  editFunnelButton?.addEventListener("click", editSelectedFunnel);
  funnelCatalog?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-funnel-id]");
    if (!button || button.disabled) return;
    selectFunnel(button.dataset.funnelId || "");
  });
  funnelMoreButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFunnelMoreMenu();
  });
  funnelMorePopover?.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("pointerdown", handleFunnelMoreOutsidePointer);
  document.addEventListener("keydown", handleFunnelMoreEscape);
  addFunnelStepButton?.addEventListener("click", () => addFunnelStep());
  funnelForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveFunnel();
  });
  deleteFunnelButton?.addEventListener("click", deleteSelectedFunnel);
  cancelFunnelEditButton?.addEventListener("click", cancelFunnelEdit);
  cancelFunnelButton?.addEventListener("click", cancelFunnelEdit);
  funnelStepEditor?.addEventListener("click", handleFunnelStepAction);
  aiChatSendButton?.addEventListener("click", sendAiChatPrompt);
  aiChatInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    sendAiChatPrompt();
  });
  runChatInsightsButton.addEventListener("click", runChatInsightsAnalysis);
  aiAutomationToggle?.addEventListener("change", saveAiAutomationSettings);
  aiReportSelect?.addEventListener("change", loadSelectedAiReport);
  refreshAdminUsersButton?.addEventListener("click", () => loadAdminUsers({ force: true }));
  refreshReconciliationButton?.addEventListener("click", () => loadReconciliations({ force: true }));
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
  movementFromFilter?.addEventListener("click", () => showDateFilterPicker(movementFromFilter));
  movementToFilter?.addEventListener("click", () => showDateFilterPicker(movementToFilter));
  movementFromFilter?.addEventListener("change", handleExplicitDateFilterChange);
  movementToFilter?.addEventListener("change", handleExplicitDateFilterChange);
  movementFromFilter?.addEventListener("input", syncDateFilterDisplays);
  movementToFilter?.addEventListener("input", syncDateFilterDisplays);
  allDataFilter?.addEventListener("change", handleDateFilterChange);

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

  window.addEventListener("dashboard:chatPointSelected", (event) => {
    selectChatLog(event.detail?.id || "", { scroll: true });
  });

  window.addEventListener("dashboard:eventMapSelectionChanged", (event) => {
    const eventName = String(event.detail?.eventName || "");
    if (!eventName) return;
    const selectionChanged = eventName !== selectedCustomEventName;
    if (selectionChanged) {
      currentEventPropertySummaries = [];
      currentSelectedEventCount = 0;
      recentEventsExpanded = false;
    }
    selectedCustomEventName = eventName;
    syncEventCatalogSelection(eventName);
    if (activeView === "events" && event.detail?.source !== "events-page") {
      if (selectionChanged) prepareCustomEventSelection(eventName);
      loadCustomEvents({ selectionChange: selectionChanged });
    }
  });

  window.addEventListener("hashchange", () => {
    setActiveView(getViewFromHash(), { updateHash: false });
  });
  document.addEventListener("visibilitychange", handleDashboardVisibilityChange);
}

function handleDashboardVisibilityChange() {
  if (document.hidden) {
    closeUniverseDropdown();
    stopChatRefresh();
    stopFunnelRefresh();
  } else {
    updateViewRefreshTimers();
    if (authenticated && selectedUniverseId) {
      if (activeView === "chat") loadChatLogs({ includeInsights: false });
      if (activeView === "events") loadCustomEvents();
      if (activeView === "funnels") loadFunnels();
      if (activeView === "releases") loadReleases();
    }
  }

  window.dispatchEvent(new CustomEvent("dashboard:visibilityChanged", {
    detail: { hidden: document.hidden },
  }));
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

function getScopedSessionCacheKey(namespace, key = "") {
  const scope = resolveDashboardCacheScope();
  if (!scope) return "";
  return `${DASHBOARD_SESSION_CACHE_PREFIX}:${scope}:${namespace}:${key}`;
}

function readScopedSessionCache(namespace, key, maxAgeMs) {
  const storageKey = getScopedSessionCacheKey(namespace, key);
  if (!storageKey) return null;

  try {
    const cached = JSON.parse(window.sessionStorage.getItem(storageKey) || "null");
    const storedAt = Number(cached?.storedAt) || 0;
    if (!storedAt || Date.now() - storedAt > maxAgeMs) {
      window.sessionStorage.removeItem(storageKey);
      return null;
    }
    return cached;
  } catch {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Session storage is optional; network loading remains available.
    }
    return null;
  }
}

function writeScopedSessionCache(namespace, key, payload) {
  const storageKey = getScopedSessionCacheKey(namespace, key);
  if (!storageKey) return;

  try {
    const serialized = JSON.stringify({ storedAt: Date.now(), payload });
    if (serialized.length > MAX_SESSION_CACHE_CHARS) return;
    window.sessionStorage.setItem(storageKey, serialized);
  } catch {
    // Quota/privacy restrictions should never prevent live data from loading.
  }
}

function removeScopedSessionCache(namespace, key) {
  const storageKey = getScopedSessionCacheKey(namespace, key);
  if (!storageKey) return;
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Session storage is optional; the next live request still refreshes the view.
  }
}

function clearDashboardSessionCache(scope = resolveDashboardCacheScope()) {
  if (!scope) return;
  const prefix = `${DASHBOARD_SESSION_CACHE_PREFIX}:${scope}:`;

  try {
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(prefix)) window.sessionStorage.removeItem(key);
    }
  } catch {
    // The active in-memory identity is still cleared even if storage is unavailable.
  }
}

function abortActiveDashboardRequests() {
  chatLogRequestState = null;
  universeRequestSequence += 1;
  chatLogRequestSequence += 1;
  chatInsightsRequestSequence += 1;
  aiReportHistoryRequestSequence += 1;
  aiReportRequestSequence += 1;
  aiAutomationSettingsRequestSequence += 1;
  usageRequestSequence += 1;
  adminUsersRequestSequence += 1;
  reconciliationRequestSequence += 1;
  releaseRequestSequence += 1;
  customEventsRequestSequence += 1;
  funnelRequestSequence += 1;
  aiReportPayloadCache.clear();
  inFlightGetRequests.clear();
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
  const previousCacheScope = resolveDashboardCacheScope();
  authenticated = value;
  authenticatedUser = authenticated ? user : null;
  if (authenticated && activeView === "admin" && !authenticatedUser?.isAdmin) {
    activeView = "overview";
    if (window.location.hash === "#admin") window.history.replaceState(null, "", "#overview");
  }
  loadedViews.clear();
  document.body.classList.toggle("isLocked", !authenticated);
  accountBox.textContent = authenticatedUser?.username ? authenticatedUser.username : authenticated ? "Signed in" : "Signed out";
  if (adminNavLink) adminNavLink.hidden = !authenticatedUser?.isAdmin;
  updateDemoUniverseControl();
  loginPanel.hidden = authenticated;
  authControls.hidden = !authenticated;
  runChatInsightsButton.hidden = !authenticated;
  for (const panel of protectedDashboardPanels) {
    panel.hidden = !authenticated;
  }
  if (authenticated) loadHeatmapModule();
  renderActiveView();

  window.dispatchEvent(new CustomEvent("dashboard:authChanged", {
    detail: { authenticated, user: authenticatedUser },
  }));

  if (!authenticated) {
    abortActiveDashboardRequests();
    clearDashboardSessionCache(previousCacheScope);
    stopChatRefresh();
    renderChatSummary();
    setChatLiveState("waiting");
    renderRecentChatEmpty("Sign in to view recent chat.");
    renderCommonQuestionPlaceholders("Sign in to view player questions.");
    if (aiReportSelect) {
      aiReportSelect.innerHTML = `<option value="">Latest saved report</option>`;
      aiReportSelect.disabled = true;
    }
    selectedUniverseId = "";
    selectedUniverseLabel.textContent = "No universe selected";
    universeSelect.innerHTML = `<option value="">Sign in to load universes</option>`;
    universeSelect.disabled = true;
    syncUniverseSelectorControl();
    if (projectSecretBox) projectSecretBox.hidden = true;
    if (projectSecretValue) projectSecretValue.textContent = "";
    if (projectSecretTarget) projectSecretTarget.textContent = "";
    if (connectedGameList) connectedGameList.innerHTML = "";
    if (demoUniverseStatus) {
      demoUniverseStatus.hidden = true;
      demoUniverseStatus.textContent = "";
    }
    renderIntegrationStatusCard();
    renderSetupChecklist();
    if (ownedGameSelect) {
      ownedGameSelect.innerHTML = `<option value="">Sign in to load games</option>`;
      ownedGameSelect.disabled = true;
    }
    if (ownedGamesStatus) ownedGamesStatus.textContent = "Sign in to load Roblox games.";
    chatLogsStatus.textContent = "Sign in to view chat logs.";
    chatInsightsStatus.textContent = "Sign in to use AI analysis.";
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
    return;
  }

  loadDashboardData();
}

async function loadDashboardData() {
  const cachedState = restoreCachedUniverses();
  if (cachedState.restored) {
    renderActiveView({ suppressOverviewEvent: cachedState.didNotifyUniverseChange });
    notifyAnalyticsReady();
  }

  const didNotifyUniverseChange = await loadUniverses({ background: cachedState.restored });
  if (!cachedState.restored) {
    renderActiveView({ suppressOverviewEvent: didNotifyUniverseChange });
    notifyAnalyticsReady();
  }
}

function notifyAnalyticsReady() {
  window.dispatchEvent(new CustomEvent("dashboard:analyticsReady", {
    detail: { universeId: selectedUniverseId },
  }));
}

function getViewFromHash() {
  if (window.location.hash === "#events") return "events";
  if (window.location.hash === "#funnels") return "funnels";
  if (window.location.hash === "#releases") return "releases";
  if (window.location.hash === "#ai-runs") return "ai-runs";
  if (window.location.hash === "#chat") return "chat";
  if (window.location.hash === "#usage") return "usage";
  if (window.location.hash === "#connect") return "connect";
  if (window.location.hash === "#admin") return "admin";
  return "overview";
}

function setActiveView(view, options = {}) {
  const requestedView = view === "events" || view === "funnels" || view === "releases" || view === "ai-runs" || view === "chat" || view === "usage" || view === "connect" || view === "admin" ? view : "overview";
  activeView = requestedView === "admin" && !authenticatedUser?.isAdmin ? "overview" : requestedView;
  if (activeView !== "funnels") closeFunnelMoreMenu();
  document.body.dataset.activeView = activeView;
  if (options.updateHash) {
    const nextHash = activeView === "events"
        ? "#events"
        : activeView === "funnels"
          ? "#funnels"
          : activeView === "releases"
            ? "#releases"
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
  document.body.dataset.activeView = activeView;

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
    events: {
      title: "Events",
      subtitle: "Automatic charts for system activity and events logged by your Roblox server.",
    },
    funnels: {
      title: "Funnels",
      subtitle: "Understand player progression and conversion across key moments.",
    },
    releases: {
      title: "Releases",
      subtitle: "",
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
  const activeViewCopy = viewCopy[activeView] || viewCopy.overview;
  pageTitle.textContent = activeViewCopy.title;
  pageSubtitle.textContent = activeViewCopy.subtitle || "";
  pageSubtitle.hidden = !activeViewCopy.subtitle;
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
  if (!authenticated || document.hidden) {
    stopChatRefresh();
    stopFunnelRefresh();
    return;
  }

  if (activeView === "chat" && selectedUniverseId) startChatRefresh();
  else stopChatRefresh();

  if (activeView === "funnels" && selectedUniverseId) startFunnelRefresh();
  else stopFunnelRefresh();
}

function loadActiveViewData(view, options = {}) {
  if (!authenticated) return;
  if (!selectedUniverseId && UNIVERSE_SCOPED_VIEWS.has(view)) return;
  if (!options.force && loadedViews.has(view)) {
    if (view === "ai-runs") {
      loadAiAutomationSettings();
      loadAiReportHistory();
    } else if (view === "events") {
      loadCustomEvents();
    } else if (view === "funnels") {
      loadFunnels();
    } else if (view === "releases") {
      loadReleases();
    } else if (view === "chat") {
      loadChatLogs({ includeInsights: true });
    }
    return;
  }
  loadedViews.add(view);

  if (view === "events") {
    loadCustomEvents();
  } else if (view === "funnels") {
    loadFunnels();
  } else if (view === "releases") {
    loadReleases();
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
  if (chatRefreshTimer || document.hidden) return;
  chatRefreshTimer = window.setInterval(() => loadChatLogs({ includeInsights: false }), CHAT_REFRESH_MS);
}

function stopChatRefresh() {
  if (chatRefreshTimer) {
    window.clearInterval(chatRefreshTimer);
    chatRefreshTimer = null;
  }
}

function startFunnelRefresh() {
  if (funnelRefreshTimer || document.hidden) return;
  funnelRefreshTimer = window.setInterval(() => loadFunnels({ background: true }), FUNNEL_REFRESH_MS);
}

function stopFunnelRefresh() {
  if (funnelRefreshTimer) {
    window.clearInterval(funnelRefreshTimer);
    funnelRefreshTimer = null;
  }
}

async function loadAdminUsers(options = {}) {
  if (!authenticatedUser?.isAdmin || !adminUserList) return;

  const force = Boolean(options?.force);
  const requestSequence = ++adminUsersRequestSequence;
  const cached = force ? null : readScopedSessionCache("admin-users", "summary", ADMIN_CACHE_MAX_AGE_MS);
  if (cached?.payload) renderAdminUsers(cached.payload);
  if (cached && Date.now() - cached.storedAt < ADMIN_CACHE_FRESH_MS) {
    setAdminButtonsDisabled(false);
    return;
  }

  const hadRenderedData = Boolean(cached?.payload || adminUserList.childElementCount);
  if (!hadRenderedData) adminUsersStatus.textContent = "Loading users...";
  setAdminButtonsDisabled(true);

  try {
    const data = await request(force ? "/api/admin/users?fresh=1" : "/api/admin/users");
    if (requestSequence !== adminUsersRequestSequence) return;
    writeScopedSessionCache("admin-users", "summary", data);
    renderAdminUsers(data);
  } catch (error) {
    if (requestSequence !== adminUsersRequestSequence) return;
    handleAuthError(error);
    if (!authenticated) return;
    adminUsersStatus.textContent = error.message;
    if (!hadRenderedData) adminUserList.innerHTML = "";
  } finally {
    if (requestSequence === adminUsersRequestSequence) setAdminButtonsDisabled(false);
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
  const requestSequence = ++adminUsersRequestSequence;

  try {
    const data = await request("/api/admin/usage/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (requestSequence !== adminUsersRequestSequence || !authenticated) return;
    writeScopedSessionCache("admin-users", "summary", data);
    removeScopedSessionCache("account-usage", "current");
    removeScopedSessionCache("admin-reconciliations", "summary");
    loadedViews.delete("usage");
    renderAdminUsers(data);
    const deletedEvents = data.reset?.deletedEvents || 0;
    adminUsersStatus.textContent = `Usage reset for ${data.reset?.targetUsername || username}. Deleted ${formatCompactNumber(deletedEvents)} usage events.`;
    if (activeView === "admin") void loadReconciliations({ force: true });
    if (activeView === "usage") loadAccountUsage();
  } catch (error) {
    if (requestSequence !== adminUsersRequestSequence) return;
    handleAuthError(error);
    if (!authenticated) return;
    adminUsersStatus.textContent = error.message;
  } finally {
    if (requestSequence === adminUsersRequestSequence) setAdminButtonsDisabled(false);
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
  const requestSequence = ++adminUsersRequestSequence;

  try {
    const data = await request("/api/admin/users/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, planKey }),
    });
    if (requestSequence !== adminUsersRequestSequence || !authenticated) return;
    writeScopedSessionCache("admin-users", "summary", data);
    removeScopedSessionCache("account-usage", "current");
    loadedViews.delete("usage");
    renderAdminUsers(data);
    adminUsersStatus.textContent = `${data.planChange?.targetUsername || username} is now on ${data.planChange?.planName || "the selected plan"}.`;
  } catch (error) {
    if (requestSequence !== adminUsersRequestSequence) return;
    handleAuthError(error);
    if (!authenticated) return;
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
  for (const control of document.querySelectorAll("[data-reset-usage-user], [data-admin-plan-user], [data-admin-save-plan-user]")) {
    control.disabled = disabled || !authenticatedUser?.isAdmin;
  }
}

async function loadReconciliations(options = {}) {
  if (!authenticatedUser?.isAdmin || !reconciliationList) return;

  const force = Boolean(options?.force);
  const requestSequence = ++reconciliationRequestSequence;
  const cached = force ? null : readScopedSessionCache("admin-reconciliations", "summary", ADMIN_CACHE_MAX_AGE_MS);
  if (cached?.payload) renderReconciliations(cached.payload);
  if (cached && Date.now() - cached.storedAt < ADMIN_CACHE_FRESH_MS) {
    setReconciliationFormDisabled(false);
    return;
  }

  const hadRenderedData = Boolean(cached?.payload || reconciliationList.childElementCount);
  if (!hadRenderedData && reconciliationStatus) reconciliationStatus.textContent = "Loading reconciliation...";
  setReconciliationFormDisabled(true);

  try {
    const data = await request(force ? "/api/admin/reconciliations?fresh=1" : "/api/admin/reconciliations");
    if (requestSequence !== reconciliationRequestSequence) return;
    writeScopedSessionCache("admin-reconciliations", "summary", data);
    renderReconciliations(data);
  } catch (error) {
    if (requestSequence !== reconciliationRequestSequence) return;
    handleAuthError(error);
    if (!authenticated) return;
    if (reconciliationStatus) reconciliationStatus.textContent = error.message;
    if (!hadRenderedData) {
      if (reconciliationStats) reconciliationStats.innerHTML = "";
      if (reconciliationList) reconciliationList.innerHTML = "";
    }
  } finally {
    if (requestSequence === reconciliationRequestSequence) setReconciliationFormDisabled(false);
  }
}

async function saveReconciliation() {
  if (!authenticatedUser?.isAdmin) return;

  if (reconciliationStatus) reconciliationStatus.textContent = "Saving reconciliation...";
  setReconciliationFormDisabled(true);
  const requestSequence = ++reconciliationRequestSequence;

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
    if (requestSequence !== reconciliationRequestSequence || !authenticated) return;
    writeScopedSessionCache("admin-reconciliations", "summary", data);
    renderReconciliations(data);
    if (reconciliationStatus) reconciliationStatus.textContent = "Reconciliation saved.";
  } catch (error) {
    if (requestSequence !== reconciliationRequestSequence) return;
    handleAuthError(error);
    if (!authenticated) return;
    if (reconciliationStatus) reconciliationStatus.textContent = error.message;
  } finally {
    if (requestSequence === reconciliationRequestSequence) setReconciliationFormDisabled(false);
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
  const requestSequence = ++reconciliationRequestSequence;

  try {
    const data = await request(`/api/admin/reconciliations/${encodeURIComponent(month)}`, { method: "DELETE" });
    if (requestSequence !== reconciliationRequestSequence || !authenticated) return;
    writeScopedSessionCache("admin-reconciliations", "summary", data);
    renderReconciliations(data);
    if (reconciliationStatus) reconciliationStatus.textContent = `Deleted reconciliation for ${month}.`;
  } catch (error) {
    if (requestSequence !== reconciliationRequestSequence) return;
    handleAuthError(error);
    if (!authenticated) return;
    if (reconciliationStatus) reconciliationStatus.textContent = error.message;
  } finally {
    if (requestSequence === reconciliationRequestSequence) setReconciliationFormDisabled(false);
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

async function loadAccountUsage(options = {}) {
  if (!authenticated || !usageMetricGrid) return;

  const force = Boolean(options?.force);
  const requestSequence = ++usageRequestSequence;
  const cached = readScopedSessionCache("account-usage", "current", USAGE_CACHE_MAX_AGE_MS);
  const hasCachedPayload = Boolean(cached?.payload?.usage && cached?.payload?.period);

  if (hasCachedPayload) {
    renderAccountUsage(cached.payload);
    if (!force && Date.now() - cached.storedAt < USAGE_CACHE_FRESH_MS) return cached.payload;
    if (usageStatus) usageStatus.textContent = force ? "Refreshing usage..." : "Refreshing usage in the background...";
  } else if (usageStatus) {
    usageStatus.textContent = "Loading usage...";
  }
  if (refreshUsageButton) refreshUsageButton.disabled = true;

  try {
    const needsExactRefresh = force || hasCachedPayload;
    const data = await request(needsExactRefresh ? "/api/account/usage?refresh=1" : "/api/account/usage");
    if (requestSequence !== usageRequestSequence || !authenticated) return null;
    renderAccountUsage(data);
    writeScopedSessionCache("account-usage", "current", data);
    return data;
  } catch (error) {
    if (requestSequence !== usageRequestSequence) return null;
    handleAuthError(error);
    if (!authenticated) return null;
    if (hasCachedPayload) {
      usageStatus.textContent = `Showing cached usage. Refresh failed: ${formatRequestError(error)}`;
    } else {
      usageStatus.textContent = formatRequestError(error);
      usageMetricGrid.innerHTML = "";
    }
    return null;
  } finally {
    if (requestSequence === usageRequestSequence && refreshUsageButton) refreshUsageButton.disabled = false;
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

  usageRequestSequence += 1;
  const buttons = usagePlanOptions.querySelectorAll("[data-select-plan]");
  for (const button of buttons) button.disabled = true;
  if (usageStatus) usageStatus.textContent = "Updating plan...";

  try {
    const data = await request("/api/account/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    if (!authenticated) return;
    usageRequestSequence += 1;
    renderAccountUsage(data);
    writeScopedSessionCache("account-usage", "current", data);
    removeScopedSessionCache("admin-users", "summary");
    loadedViews.delete("admin");
    if (usageStatus) usageStatus.textContent = `Plan changed to ${data.plan || "selected plan"}.`;
    await loadOwnedGames();
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
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

function restoreCachedUniverses() {
  const cached = readScopedSessionCache("universes", "current", UNIVERSE_CACHE_MAX_AGE_MS);
  if (!cached || !Array.isArray(cached.payload?.universes)) {
    return { restored: false, didNotifyUniverseChange: false };
  }

  const didNotifyUniverseChange = applyUniverseCollection(cached.payload.universes, {
    preferredUniverseId: cached.payload.selectedUniverseId,
    statusSuffix: " Refreshing...",
  });
  return { restored: true, didNotifyUniverseChange };
}

function applyUniverseCollection(universes, options = {}) {
  const previousUniverseId = selectedUniverseId;
  knownUniverses = Array.isArray(universes) ? universes : [];

  if (!knownUniverses.length) {
    selectedUniverseId = "";
    universeSelect.disabled = true;
    universeSelect.innerHTML = `<option value="">Add your first game</option>`;
    universesStatus.textContent = `Add a universe ID to connect your Roblox game.${options.statusSuffix || ""}`;
  } else {
    const availableIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
    const preferredUniverseId = String(options.preferredUniverseId || "");
    if (preferredUniverseId && availableIds.has(preferredUniverseId)) {
      selectedUniverseId = preferredUniverseId;
    } else if (!selectedUniverseId || !availableIds.has(selectedUniverseId)) {
      selectedUniverseId = String(knownUniverses[0].id || "");
    }

    universeSelect.disabled = false;
    universeSelect.innerHTML = knownUniverses.map(renderUniverseOption).join("");
    universesStatus.textContent = `${knownUniverses.length} connected game${knownUniverses.length === 1 ? "" : "s"}.${options.statusSuffix || ""}`;
  }

  renderConnectedGames();
  updateDemoUniverseControl();
  renderIntegrationStatusCard();
  renderSetupChecklist();
  updateSelectedUniverse();
  updateAiReadinessStatus();

  const didChangeUniverse = previousUniverseId !== selectedUniverseId;
  if (didChangeUniverse) {
    selectedChatLogId = "";
    currentChatLogs = [];
    loadedViews.clear();
    window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
      detail: { universeId: selectedUniverseId },
    }));
  }
  return didChangeUniverse;
}

function cacheCurrentUniverses() {
  writeScopedSessionCache("universes", "current", {
    universes: knownUniverses,
    selectedUniverseId,
  });
}

async function loadUniverses(options = {}) {
  const requestSequence = ++universeRequestSequence;
  if (!options.background) universesStatus.textContent = "Loading universes...";
  if (refreshIntegrationStatusButton) refreshIntegrationStatusButton.disabled = true;

  try {
    const data = await request("/api/universes");
    if (requestSequence !== universeRequestSequence || !authenticated) return false;

    const didNotifyUniverseChange = applyUniverseCollection(data.universes || [], {
      preferredUniverseId: options.preferredUniverseId,
    });
    cacheCurrentUniverses();
    return didNotifyUniverseChange;
  } catch (error) {
    if (requestSequence !== universeRequestSequence) return false;
    if (knownUniverses.length && options.background) {
      universesStatus.textContent = `${knownUniverses.length} connected game${knownUniverses.length === 1 ? "" : "s"}. Refresh failed: ${error.message}`;
    } else {
      universesStatus.textContent = error.message;
      renderIntegrationStatusCard({ error: error.message });
      renderSetupChecklist();
    }
    return false;
  } finally {
    if (requestSequence === universeRequestSequence && refreshIntegrationStatusButton) {
      refreshIntegrationStatusButton.disabled = false;
    }
  }
}

function updateDemoUniverseControl() {
  if (!createDemoUniverseButton) return;
  const hasDemoUniverse = knownUniverses.some((universe) => Boolean(universe?.isDemo));
  createDemoUniverseButton.hidden = !authenticatedUser?.isAdmin || hasDemoUniverse;
  if (!createDemoUniverseButton.hidden && !createDemoUniverseButton.disabled) {
    createDemoUniverseButton.innerHTML = `<span aria-hidden="true">&#10022;</span>Create demo universe`;
  }
}

async function createDemoUniverse() {
  if (!authenticatedUser?.isAdmin || !createDemoUniverseButton) return;

  createDemoUniverseButton.disabled = true;
  createDemoUniverseButton.innerHTML = `<span class="buttonSpinner" aria-hidden="true"></span>Building demo data...`;
  if (demoUniverseStatus) {
    demoUniverseStatus.hidden = false;
    demoUniverseStatus.textContent = "Generating the map and complete synthetic analytics history...";
  }

  try {
    const data = await request("/api/admin/demo-universe", { method: "POST" });
    const demoUniverseId = String(data.project?.universeId || "");
    await loadUniverses({ preferredUniverseId: demoUniverseId });
    if (demoUniverseId) selectUniverse(demoUniverseId);
    loadedViews.clear();
    loadActiveViewData(activeView, { force: true });
    if (demoUniverseStatus) {
      demoUniverseStatus.hidden = false;
      demoUniverseStatus.textContent = data.message || "Demo Universe is ready.";
    }
  } catch (error) {
    if (demoUniverseStatus) {
      demoUniverseStatus.hidden = false;
      demoUniverseStatus.textContent = error.message;
    }
    createDemoUniverseButton.disabled = false;
    createDemoUniverseButton.innerHTML = `<span aria-hidden="true">&#10022;</span>Create demo universe`;
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
    usageRequestSequence += 1;
    removeScopedSessionCache("account-usage", "current");
    loadedViews.delete("usage");
    removeScopedSessionCache("admin-users", "summary");
    loadedViews.delete("admin");
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
    usageRequestSequence += 1;
    removeScopedSessionCache("account-usage", "current");
    loadedViews.delete("usage");
    removeScopedSessionCache("admin-users", "summary");
    loadedViews.delete("admin");
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
  const suffix = universe.isDemo ? " (Admin demo)" : "";
  const selected = id === selectedUniverseId ? " selected" : "";
  return `<option value="${escapeHtml(id)}"${selected}>${escapeHtml(label + suffix)}</option>`;
}

function syncUniverseSelectorControl() {
  if (!universeSelectorButton || !universeDropdownMenu) return;
  closeUniverseDropdown();
  const canSelect = authenticated && !universeSelect.disabled && knownUniverses.length > 0;
  universeSelectorButton.disabled = !canSelect;
  universeSelectorButton.setAttribute("aria-label", selectedUniverseId
    ? `Select universe. Current: ${selectedUniverseLabel.textContent || selectedUniverseId}`
    : "Select universe");
  universeDropdownMenu.innerHTML = knownUniverses.map(renderUniverseDropdownOption).join("");
}

function renderUniverseDropdownOption(universe) {
  const id = String(universe.id || "");
  const label = String(universe.name || `Universe ${id}`);
  const selected = id === selectedUniverseId;
  return `
    <button class="universeDropdownOption" type="button" role="option" tabindex="-1" data-universe-option="${escapeHtml(id)}" aria-selected="${selected ? "true" : "false"}">
      <strong>${escapeHtml(label)}${universe.isDemo ? `<span class="demoUniverseBadge">Admin demo</span>` : ""}</strong>
      <small>${universe.isDemo ? "Complete synthetic analytics dataset" : `Universe ${escapeHtml(id)}`}</small>
    </button>
  `;
}

function toggleUniverseDropdown() {
  if (!universeDropdownMenu || !universeSelectorButton || universeSelectorButton.disabled) return;
  if (universeDropdownMenu.hidden) openUniverseDropdown();
  else closeUniverseDropdown();
}

function openUniverseDropdown(options = {}) {
  if (!universeDropdownMenu || !universeSelectorButton || universeSelectorButton.disabled || !knownUniverses.length) return;
  universeDropdownMenu.hidden = false;
  universeSelectorButton.setAttribute("aria-expanded", "true");
  positionUniverseDropdown();

  const selectedOption = universeDropdownMenu.querySelector('[aria-selected="true"]');
  selectedOption?.scrollIntoView({ block: "nearest" });
  if (options.focus === "last") {
    getUniverseDropdownOptions().at(-1)?.focus();
  } else if (options.focus) {
    (selectedOption || getUniverseDropdownOptions()[0])?.focus();
  }
}

function closeUniverseDropdown(options = {}) {
  if (!universeDropdownMenu || !universeSelectorButton) return;
  universeDropdownMenu.hidden = true;
  universeDropdownMenu.removeAttribute("data-placement");
  universeDropdownMenu.style.removeProperty("top");
  universeDropdownMenu.style.removeProperty("right");
  universeDropdownMenu.style.removeProperty("bottom");
  universeDropdownMenu.style.removeProperty("left");
  universeDropdownMenu.style.removeProperty("width");
  universeDropdownMenu.style.removeProperty("max-height");
  universeSelectorButton.setAttribute("aria-expanded", "false");
  if (options.restoreFocus) universeSelectorButton.focus();
}

function positionUniverseDropdown() {
  if (!universeDropdownMenu || !universeSelectorButton || universeDropdownMenu.hidden) return;
  const rect = universeSelectorButton.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const gap = 8;
  const edge = 8;
  const spaceAbove = Math.max(rect.top - gap - edge, 0);
  const spaceBelow = Math.max(viewportHeight - rect.bottom - gap - edge, 0);
  const preferredHeight = Math.min(universeDropdownMenu.scrollHeight, 320);
  const opensUp = spaceAbove > spaceBelow && spaceAbove >= Math.min(preferredHeight, 140);
  const availableHeight = opensUp ? spaceAbove : spaceBelow;
  const menuWidth = Math.max(Math.min(rect.width, viewportWidth - edge * 2), 0);
  const left = Math.min(Math.max(rect.left, edge), Math.max(viewportWidth - menuWidth - edge, edge));

  universeDropdownMenu.dataset.placement = opensUp ? "top" : "bottom";
  universeDropdownMenu.style.left = `${Math.round(left)}px`;
  universeDropdownMenu.style.width = `${Math.round(menuWidth)}px`;
  universeDropdownMenu.style.maxHeight = `${Math.max(Math.min(preferredHeight, availableHeight), 72)}px`;
  if (opensUp) {
    universeDropdownMenu.style.top = "auto";
    universeDropdownMenu.style.bottom = `${Math.round(viewportHeight - rect.top + gap)}px`;
  } else {
    universeDropdownMenu.style.top = `${Math.round(rect.bottom + gap)}px`;
    universeDropdownMenu.style.bottom = "auto";
  }
}

function handleUniverseDropdownClick(event) {
  const option = event.target.closest("[data-universe-option]");
  if (!option) return;
  const universeId = option.dataset.universeOption || "";
  closeUniverseDropdown();
  selectUniverse(universeId);
  universeSelectorButton?.focus();
}

function handleUniverseTriggerKeydown(event) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  openUniverseDropdown({ focus: event.key === "ArrowUp" ? "last" : "selected" });
}

function handleUniverseDropdownKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeUniverseDropdown({ restoreFocus: true });
    return;
  }

  const options = getUniverseDropdownOptions();
  if (!options.length) return;
  const currentIndex = Math.max(options.indexOf(document.activeElement), 0);
  let nextIndex = null;
  if (event.key === "ArrowDown") nextIndex = Math.min(currentIndex + 1, options.length - 1);
  if (event.key === "ArrowUp") nextIndex = Math.max(currentIndex - 1, 0);
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = options.length - 1;
  if (nextIndex === null) return;
  event.preventDefault();
  options[nextIndex].focus();
  options[nextIndex].scrollIntoView({ block: "nearest" });
}

function handleUniverseDropdownOutsidePointer(event) {
  if (!universeDropdownMenu || universeDropdownMenu.hidden) return;
  if (universeSelectorButton?.contains(event.target) || universeDropdownMenu.contains(event.target)) return;
  closeUniverseDropdown();
}

function getUniverseDropdownOptions() {
  return universeDropdownMenu ? [...universeDropdownMenu.querySelectorAll("[data-universe-option]")] : [];
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
  const statusClass = lastReceivedAt ? "ok" : "waiting";
  const statusText = lastReceivedAt ? `Last data ${formatRelativeTime(lastReceivedAt)}` : "Waiting for data";
  const artworkTone = (Math.abs(Number(id.slice(-2)) || 0) % 4) + 1;
  const artworkLabel = name.trim().charAt(0).toUpperCase() || "?";
  const isDemo = Boolean(universe.isDemo);

  return `
    <article class="connectedGameItem">
      <div class="connectedGamePrimary">
        <span class="connectedGameArtwork tone${escapeHtml(artworkTone)}" aria-hidden="true"><span>${escapeHtml(artworkLabel)}</span></span>
        <div class="connectedGameInfo">
          <div class="connectedGameTitle">
            <strong>${escapeHtml(name)}${isDemo ? `<span class="demoUniverseBadge">Admin demo</span>` : ""}</strong>
            <span>${isDemo ? "Synthetic universe &middot; Private to your admin account" : `Universe ${escapeHtml(id)}`}</span>
          </div>
          <span class="connectedGameConnection">${isDemo ? "Demo data ready" : "Connected"}</span>
          <div class="connectedGameStatus ${escapeHtml(statusClass)}">
            <b>${escapeHtml(statusText)}</b>
            <span>${escapeHtml(status.mapUploaded || universe.hasMapSnapshot ? "Map uploaded" : "Map missing")}</span>
            ${failedIngests > 0 ? `<span class="connectedGameWarning">${escapeHtml(formatCompactNumber(failedIngests))} failed ingest${failedIngests === 1 ? "" : "s"}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="connectedGameSignals">
        ${renderIntegrationSignal("Movement", Boolean(status.signals?.movement), status.counts?.movement)}
        ${renderIntegrationSignal("Deaths", Boolean(status.signals?.deaths), status.counts?.deaths)}
        ${renderIntegrationSignal("Leaves", Boolean(status.signals?.leaves), status.counts?.leaves)}
        ${renderIntegrationSignal("Chat", Boolean(status.signals?.chat), status.counts?.chat)}
        ${renderIntegrationSignal("Events", Boolean(status.signals?.events), status.counts?.events)}
      </div>
      <div class="connectedGameActions">
        ${isDemo
          ? `<p class="demoUniverseActionNote"><strong>Synthetic preview</strong><span>No Roblox secret or live game is required.</span></p>`
          : `<button class="button secondary compact" type="button" data-regenerate-project-secret="${escapeHtml(projectId)}"${projectId ? "" : " disabled"}>Regenerate secret</button>
             <button class="button danger compact" type="button" data-unlink-project="${escapeHtml(projectId)}"${projectId ? "" : " disabled"}>Unlink</button>`}
      </div>
    </article>
  `;
}

function renderIntegrationStatusCard(options = {}) {
  if (!integrationStatusTitle || !integrationStatusState || !integrationStatusGrid || !integrationSignalList || !integrationStatusMessage) return;

  if (options.error) {
    integrationStatusTitle.textContent = "Unable to check status";
    setIntegrationStatusState("Status unavailable", "warning");
    if (integrationStatusArtworkLabel) integrationStatusArtworkLabel.textContent = "!";
    integrationStatusGrid.innerHTML = renderIntegrationMetric("Last data", "--")
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
    setIntegrationStatusState("Waiting for game", "waiting");
    if (integrationStatusArtworkLabel) integrationStatusArtworkLabel.textContent = "?";
    integrationStatusGrid.innerHTML = renderIntegrationMetric("Last data", "--")
      + renderIntegrationMetric("Map", "--")
      + renderIntegrationMetric("Failed ingests", "--");
    integrationSignalList.innerHTML = renderIntegrationSignal("Movement", false)
      + renderIntegrationSignal("Deaths", false)
      + renderIntegrationSignal("Leaves", false)
      + renderIntegrationSignal("Chat", false)
      + renderIntegrationSignal("Events", false);
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
  const isDemo = Boolean(selectedUniverse.isDemo);

  integrationStatusTitle.textContent = name;
  setIntegrationStatusState(isDemo ? "Admin demo" : status.connected === false ? "Not connected" : "Connected", status.connected === false && !isDemo ? "warning" : "ok");
  if (integrationStatusArtworkLabel) integrationStatusArtworkLabel.textContent = name.trim().charAt(0).toUpperCase() || "?";
  integrationStatusGrid.innerHTML = renderIntegrationMetric("Last data", lastReceivedAt ? formatRelativeTime(lastReceivedAt) : "Waiting")
    + renderIntegrationMetric("Map", status.mapUploaded || selectedUniverse.hasMapSnapshot ? "Uploaded" : "Missing")
    + renderIntegrationMetric("Failed ingests", `${formatCompactNumber(failedIngests)} / 24h`, failedIngests > 0 ? "danger" : "ok");
  integrationSignalList.innerHTML = renderIntegrationSignal("Movement", Boolean(signals.movement), counts.movement)
    + renderIntegrationSignal("Deaths", Boolean(signals.deaths), counts.deaths)
    + renderIntegrationSignal("Leaves", Boolean(signals.leaves), counts.leaves)
    + renderIntegrationSignal("Chat", Boolean(signals.chat), counts.chat)
    + renderIntegrationSignal("Events", Boolean(signals.events), counts.events);

  if (isDemo) {
    integrationStatusMessage.textContent = "Complete synthetic analytics are ready: map, movement, deaths, leaves, chat, events, funnels, cohorts, and AI reports.";
  } else if (failedIngests > 0) {
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

function setIntegrationStatusState(label, tone = "ok") {
  if (!integrationStatusState) return;
  integrationStatusState.textContent = label;
  integrationStatusState.classList.remove("waiting", "warning");
  if (tone === "waiting" || tone === "warning") integrationStatusState.classList.add(tone);
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
  const isDemo = Boolean(universe?.isDemo);

  const steps = isDemo ? [
    { title: "Admin access", detail: "Private to your admin account.", complete: true },
    { title: "Demo universe", detail: "Synthetic universe attached without Roblox ownership.", complete: true },
    { title: "Analytics history", detail: "Realistic samples and historical rollups generated.", complete: true },
    { title: "Live-server simulation", detail: "Active players, sessions, and signals are populated.", complete: true },
    { title: "Events and funnels", detail: "System events, custom events, purchases, cohorts, and funnels are ready.", complete: true },
    { title: "Map and AI", detail: "Demo world, heatmaps, insights, and reports are ready.", complete: true },
  ] : [
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

  const completedSteps = steps.filter((step) => step.complete).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);
  if (setupProgressText) setupProgressText.textContent = `${completedSteps} / ${steps.length} complete`;
  if (setupProgressPercent) setupProgressPercent.textContent = `${progressPercent}%`;
  if (setupProgressBar) setupProgressBar.style.width = `${progressPercent}%`;
  if (setupProgressTrack) setupProgressTrack.setAttribute("aria-valuenow", String(progressPercent));

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
  if (signals.events) active.push("events");
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
  closeUniverseDropdown();
  const cleanValue = String(value || "").trim();
  const knownIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
  const previousUniverseId = selectedUniverseId;
  selectedUniverseId = /^\d+$/.test(cleanValue) && knownIds.has(cleanValue) ? cleanValue : "";
  if (selectedUniverseId === previousUniverseId) return;

  selectedChatLogId = "";
  currentChatLogs = [];
  selectedCustomEventName = "";
  currentEventPropertySummaries = [];
  currentSelectedEventCount = 0;
  recentEventsExpanded = false;
  selectedFunnelId = "";
  currentFunnels = [];
  currentFunnelEventNames = [];
  currentReleasePayload = null;
  releaseSelection = createEmptyReleaseSelection();
  isCreatingFunnel = false;
  setFunnelBuilderVisible(false);
  renderChatSummary();
  setChatLiveState(selectedUniverseId ? "loading" : "waiting");
  renderRecentChatEmpty(selectedUniverseId ? "Loading recent chat..." : "Select a universe to view recent chat.");
  renderCommonQuestionPlaceholders(selectedUniverseId ? "Loading player questions..." : "Select a universe to view player questions.");
  updateSelectedUniverse();
  renderAiChatWelcome();
  renderIntegrationStatusCard();
  renderSetupChecklist();
  cacheCurrentUniverses();
  loadedViews.clear();
  loadActiveViewData(activeView, { force: true });
  window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
    detail: { universeId: selectedUniverseId },
  }));
}

function createEmptyReleaseSelection() {
  return {
    placeId: "",
    beforeVersion: "",
    afterVersion: "",
    funnelIds: [],
    funnelSelectionInitialized: false,
  };
}

async function loadReleases(options = {}) {
  if (!authenticated || !releaseStatus || !releaseComparisonContent) return false;
  const requestSequence = ++releaseRequestSequence;
  const universeId = selectedUniverseId;

  if (!universeId) {
    renderReleases({ places: [], coverage: {} });
    releaseStatus.textContent = "Connect or select a Roblox game to inspect releases.";
    return false;
  }

  releaseStatus.textContent = "Building version comparison...";
  releaseComparisonContent.setAttribute("aria-busy", "true");
  const params = new URLSearchParams({ universeId });
  if (releaseSelection.placeId) params.set("placeId", releaseSelection.placeId);
  if (releaseSelection.beforeVersion) params.set("beforeVersion", releaseSelection.beforeVersion);
  if (releaseSelection.afterVersion) params.set("afterVersion", releaseSelection.afterVersion);
  if (releaseSelection.funnelSelectionInitialized) {
    params.set("funnelIds", releaseSelection.funnelIds.length ? releaseSelection.funnelIds.join(",") : "none");
  }
  if (options.force) params.set("fresh", "1");

  try {
    const payload = await request(`/api/releases?${params.toString()}`, { dedupe: !options.force });
    if (requestSequence !== releaseRequestSequence || universeId !== selectedUniverseId) return false;
    renderReleases(payload);
    const selectedComparison = payload.selectedComparison || null;
    const comparison = selectedComparison?.comparison || null;
    const findings = comparison?.findings || {};
    const matchedSessions = Math.min(
      Number(comparison?.trafficAdjustment?.samples?.before?.sessions) || 0,
      Number(comparison?.trafficAdjustment?.samples?.after?.sessions) || 0,
    );
    const truncationWarning = payload.versionRollupsTruncated
      ? ` Older version history was capped; ${formatCompactNumber(payload.droppedVersionCount)} version${Number(payload.droppedVersionCount) === 1 ? "" : "s"} omitted.`
      : "";
    const comparisonReady = comparison?.status === "ready" && comparison?.trafficAdjustment?.status === "ready";
    releaseStatus.textContent = !selectedComparison?.before
      ? "At least two production versions are required for a comparison."
      : comparisonReady
        ? `v${formatReleaseVersion(selectedComparison.previousPlaceVersion)} vs v${formatReleaseVersion(selectedComparison.placeVersion)} · ${formatCompactNumber(matchedSessions)} matched sessions per side · ${formatCompactNumber((findings.items || []).length)} supported finding${Number((findings.items || []).length) === 1 ? "" : "s"}.`
        : `v${formatReleaseVersion(selectedComparison.previousPlaceVersion)} vs v${formatReleaseVersion(selectedComparison.placeVersion)} is still collecting enough comparable sessions.`;
    releaseStatus.textContent += truncationWarning;
    return true;
  } catch (error) {
    if (requestSequence !== releaseRequestSequence) return false;
    handleAuthError(error);
    if (authenticated) releaseStatus.textContent = formatRequestError(error);
    return false;
  } finally {
    if (requestSequence === releaseRequestSequence) {
      releaseComparisonContent.setAttribute("aria-busy", "false");
    }
  }
}

function renderReleases(payload = {}) {
  const places = Array.isArray(payload.places) ? payload.places : [];
  const selection = payload.selection || {};
  currentReleasePayload = payload;
  releaseSelection.placeId = selection.placeId ? String(selection.placeId) : "";
  releaseSelection.beforeVersion = selection.beforeVersion ? String(selection.beforeVersion) : "";
  releaseSelection.afterVersion = selection.afterVersion ? String(selection.afterVersion) : "";
  releaseSelection.funnelIds = Array.isArray(selection.funnelIds) ? selection.funnelIds.map(String) : [];
  releaseSelection.funnelSelectionInitialized = true;
  renderReleaseComparisonControls(payload);
  if (!releaseComparisonContent) return;

  if (!places.length) {
    releaseComparisonContent.innerHTML = `
      <article class="panel releaseEmptyState">
        <strong>No production versions yet.</strong>
        <p>Install the current Roblox analytics script and join a published server. Studio observations stay separate and will not create a release.</p>
      </article>
    `;
    placeReleaseFunnelPicker();
    return;
  }

  if (!payload.selectedComparison?.before) {
    releaseComparisonContent.innerHTML = `
      <article class="panel releaseEmptyState">
        <strong>Two versions are needed.</strong>
        <p>Keep the Roblox analytics script installed through another published update. Once both PlaceVersions have sessions, you can compare them here.</p>
      </article>
    `;
    placeReleaseFunnelPicker();
    return;
  }

  releaseComparisonContent.innerHTML = renderReleaseComparison(payload.selectedComparison, {
    hasAvailableFunnels: Array.isArray(payload.availableFunnels) && payload.availableFunnels.length > 0,
  });
  placeReleaseFunnelPicker();
}

function placeReleaseFunnelPicker() {
  if (!releaseFunnelPicker || !releaseComparisonContent) return;
  const slot = releaseComparisonContent.querySelector("[data-release-funnel-picker-slot]");
  releaseFunnelPicker.hidden = !slot;
  if (slot) slot.replaceWith(releaseFunnelPicker);
}

function renderReleaseComparisonControls(payload = {}) {
  const places = Array.isArray(payload.places) ? payload.places : [];
  const selectedPlace = places.find((place) => String(place.placeId) === releaseSelection.placeId) || places[0] || null;
  const versions = (selectedPlace?.releases || []).map((release) => release.after).filter(Boolean);
  const selectedBeforeVersion = versions.find((version) => String(version.placeVersion) === releaseSelection.beforeVersion) || null;
  const selectedAfterVersion = versions.find((version) => String(version.placeVersion) === releaseSelection.afterVersion) || null;
  const funnels = Array.isArray(payload.availableFunnels) ? payload.availableFunnels : [];
  const selectedFunnelIds = new Set(releaseSelection.funnelIds);

  if (releasePlaceField) releasePlaceField.hidden = places.length <= 1;
  if (releasePlaceSelect) {
    releasePlaceSelect.disabled = !places.length;
    releasePlaceSelect.innerHTML = places.map((place) => `
      <option value="${escapeHtml(String(place.placeId))}" ${String(place.placeId) === releaseSelection.placeId ? "selected" : ""}>Place ${escapeHtml(String(place.placeId))} · current v${escapeHtml(formatReleaseVersion(place.currentVersion))}</option>
    `).join("");
  }

  renderReleaseVersionSelect({
    button: releaseBeforeVersionButton,
    label: releaseBeforeVersionLabel,
    menu: releaseBeforeVersionMenu,
    side: "before",
    versions,
    selectedVersion: releaseSelection.beforeVersion,
    unavailableVersion: releaseSelection.afterVersion,
    placeholder: "Choose version",
  });
  renderReleaseVersionSelect({
    button: releaseAfterVersionButton,
    label: releaseAfterVersionLabel,
    menu: releaseAfterVersionMenu,
    side: "after",
    versions,
    selectedVersion: releaseSelection.afterVersion,
    unavailableVersion: releaseSelection.beforeVersion,
    placeholder: "Choose version",
  });
  if (releaseBeforeDateRange) releaseBeforeDateRange.textContent = formatReleaseVersionDateRange(selectedBeforeVersion);
  if (releaseAfterDateRange) releaseAfterDateRange.textContent = formatReleaseVersionDateRange(selectedAfterVersion);

  if (releaseFunnelPickerButton) {
    const label = !funnels.length
      ? "No saved funnels"
      : selectedFunnelIds.size === funnels.length
        ? `All funnels (${funnels.length})`
        : selectedFunnelIds.size
          ? `${selectedFunnelIds.size} of ${funnels.length} funnels`
          : "Events only";
    releaseFunnelPickerButton.disabled = !funnels.length;
    const labelNode = releaseFunnelPickerButton.querySelector("strong");
    if (labelNode) labelNode.textContent = label;
  }

  if (releaseFunnelMenu) {
    releaseFunnelMenu.innerHTML = funnels.length ? `
      <header><strong>Funnels in this comparison</strong><span>Findings recalculate from this selection.</span></header>
      <div class="releaseFunnelMenuActions">
        <button type="button" data-release-funnel-action="all">Select all</button>
        <button type="button" data-release-funnel-action="none">Clear</button>
      </div>
      <div class="releaseFunnelOptions">
        ${funnels.map((funnel) => `
          <label>
            <input type="checkbox" value="${escapeHtml(String(funnel.id || ""))}" ${selectedFunnelIds.has(String(funnel.id || "")) ? "checked" : ""}>
            <span><strong>${escapeHtml(funnel.name || "Untitled funnel")}</strong><small>${escapeHtml((funnel.steps || []).join(" → ") || "No steps")}</small></span>
          </label>
        `).join("")}
      </div>
    ` : "";
  }
}

function renderReleaseVersionSelect({ button, label, menu, side, versions = [], selectedVersion, unavailableVersion, placeholder }) {
  const disabled = versions.length < 2;
  const selected = versions.find((version) => String(version.placeVersion || "") === String(selectedVersion || "")) || null;
  if (button) button.disabled = disabled;
  if (label) label.textContent = selected ? `v${formatReleaseVersion(selected.placeVersion)}` : placeholder;
  if (!menu) return;
  menu.innerHTML = versions.map((version) => {
    const value = String(version.placeVersion || "");
    const isSelected = value === String(selectedVersion || "");
    const isUnavailable = value === String(unavailableVersion || "");
    return `
      <button type="button" class="releaseVersionOption" role="option" data-release-version-side="${escapeHtml(side)}" data-release-version-value="${escapeHtml(value)}" aria-selected="${isSelected}" ${isUnavailable ? "disabled" : ""}>
        <span><strong>v${escapeHtml(formatReleaseVersion(value))}</strong>${isSelected ? "<b>Selected</b>" : ""}</span>
        <small>${escapeHtml(formatReleaseVersionDateRange(version))}</small>
      </button>
    `;
  }).join("");
}

function formatReleaseVersionDateRange(version) {
  const firstSeenAt = Number(version?.firstSeenAt) || 0;
  const lastSeenAt = Number(version?.lastSeenAt) || 0;
  if (!firstSeenAt || !lastSeenAt) return "No observed date range";
  const start = new Date(firstSeenAt);
  const end = new Date(lastSeenAt);
  const startLabel = start.toLocaleDateString([], { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

function getReleaseVersionMenuElements(side) {
  return side === "before"
    ? { button: releaseBeforeVersionButton, menu: releaseBeforeVersionMenu }
    : { button: releaseAfterVersionButton, menu: releaseAfterVersionMenu };
}

function toggleReleaseVersionMenu(side) {
  const { button, menu } = getReleaseVersionMenuElements(side);
  if (!button || !menu || button.disabled) return;
  const shouldOpen = menu.hidden;
  closeReleaseVersionMenus();
  closeReleaseFunnelMenu();
  menu.hidden = !shouldOpen;
  button.setAttribute("aria-expanded", String(shouldOpen));
}

function closeReleaseVersionMenus() {
  for (const { button, menu } of [
    { button: releaseBeforeVersionButton, menu: releaseBeforeVersionMenu },
    { button: releaseAfterVersionButton, menu: releaseAfterVersionMenu },
  ]) {
    if (menu) menu.hidden = true;
    if (button) button.setAttribute("aria-expanded", "false");
  }
}

function handleReleaseVersionMenuClick(event) {
  event.stopPropagation();
  const option = event.target.closest("[data-release-version-value]");
  if (!option || option.disabled) return;
  const side = option.dataset.releaseVersionSide === "before" ? "before" : "after";
  const value = option.dataset.releaseVersionValue || "";
  if (side === "before") releaseSelection.beforeVersion = value;
  else releaseSelection.afterVersion = value;
  closeReleaseVersionMenus();
  loadReleases();
}

function handleReleaseVersionOutsidePointer(event) {
  if (releaseBeforeVersionMenu?.contains(event.target) || releaseBeforeVersionButton?.contains(event.target)) return;
  if (releaseAfterVersionMenu?.contains(event.target) || releaseAfterVersionButton?.contains(event.target)) return;
  closeReleaseVersionMenus();
}

function toggleReleaseFunnelMenu(forceOpen) {
  if (!releaseFunnelMenu || !releaseFunnelPickerButton || releaseFunnelPickerButton.disabled) return;
  const shouldOpen = forceOpen === undefined ? releaseFunnelMenu.hidden : Boolean(forceOpen);
  releaseFunnelMenu.hidden = !shouldOpen;
  releaseFunnelPickerButton.setAttribute("aria-expanded", String(shouldOpen));
}

function closeReleaseFunnelMenu() {
  if (!releaseFunnelMenu || !releaseFunnelPickerButton) return;
  releaseFunnelMenu.hidden = true;
  releaseFunnelPickerButton.setAttribute("aria-expanded", "false");
}

function handleReleaseFunnelMenuClick(event) {
  event.stopPropagation();
  const actionButton = event.target.closest("[data-release-funnel-action]");
  if (!actionButton) return;
  const funnels = Array.isArray(currentReleasePayload?.availableFunnels) ? currentReleasePayload.availableFunnels : [];
  releaseSelection.funnelIds = actionButton.dataset.releaseFunnelAction === "all"
    ? funnels.map((funnel) => String(funnel.id || "")).filter(Boolean)
    : [];
  releaseSelection.funnelSelectionInitialized = true;
  closeReleaseFunnelMenu();
  loadReleases();
}

function handleReleaseFunnelSelectionChange(event) {
  if (!event.target.matches('input[type="checkbox"]')) return;
  releaseSelection.funnelIds = [...releaseFunnelMenu.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => input.value)
    .filter(Boolean);
  releaseSelection.funnelSelectionInitialized = true;
  closeReleaseFunnelMenu();
  loadReleases();
}

function handleReleaseFunnelOutsidePointer(event) {
  if (releaseFunnelMenu?.hidden) return;
  if (releaseFunnelMenu?.contains(event.target) || releaseFunnelPickerButton?.contains(event.target)) return;
  closeReleaseFunnelMenu();
}

function handleReleaseControlEscape(event) {
  if (event.key !== "Escape") return;
  closeReleaseVersionMenus();
  closeReleaseFunnelMenu();
}

function renderReleaseComparison(release = {}, options = {}) {
  const allowedReadiness = new Set(["ready", "no_baseline", "collecting_both", "collecting_baseline", "collecting_release", "collecting_matched"]);
  const readiness = allowedReadiness.has(release.readiness) ? release.readiness : "collecting_both";
  const minimumSessions = Math.max(Number(release.minimumSessionsPerCohort) || 20, 1);

  return `
    ${renderReleaseAnalysis(release.comparison, options)}
    ${readiness === "ready" ? "" : `<p class="releaseComparisonNotice">A finding needs at least ${escapeHtml(formatCompactNumber(minimumSessions))} usable sessions on both sides. Values can appear earlier, but no conclusion is made.</p>`}
  `;
}

function renderReleaseAnalysis(comparison = null, options = {}) {
  if (!comparison) return "";
  const trafficAdjustment = comparison.trafficAdjustment || {};
  const trafficReady = trafficAdjustment.status === "ready";
  const coreMetrics = trafficReady && Array.isArray(trafficAdjustment.coreMetrics)
    ? trafficAdjustment.coreMetrics
    : (Array.isArray(comparison.coreMetrics) ? comparison.coreMetrics : []);
  const funnels = trafficReady && Array.isArray(trafficAdjustment.funnels)
    ? trafficAdjustment.funnels
    : (Array.isArray(comparison.funnels) ? comparison.funnels : []);
  const events = trafficReady && Array.isArray(trafficAdjustment.events)
    ? trafficAdjustment.events
    : (Array.isArray(comparison.events) ? comparison.events : []);
  const eventMetrics = getReleaseEventOutcomeMetrics(coreMetrics, events);
  const beforeVersion = comparison.samples?.before?.placeVersion;
  const afterVersion = comparison.samples?.after?.placeVersion;

  return `
    <section class="releaseAnalysis">
      <div class="releaseAnalysisBody">
        ${options.hasAvailableFunnels ? renderReleaseFunnelComparisons(funnels, beforeVersion, afterVersion) : ""}
        ${eventMetrics.length ? renderReleaseEventComparisons(eventMetrics) : ""}
        <p class="releaseMethodNote">Only rates and conversion are shown. Record volume is excluded because a larger event count alone does not establish a release change.</p>
      </div>
    </section>
  `;
}

function getReleaseEventOutcomeMetrics(coreMetrics, events) {
  const purchaseEventNames = new Set([
    "item_purchased", "product_purchased", "gamepass_purchased", "purchase_completed",
    "purchase_succeeded", "checkout_completed", "transaction_completed",
  ]);
  const coreOutcomes = coreMetrics
    .filter((metric) => metric.id === "death_session_rate" || metric.id === "purchase_session_rate")
    .map((metric) => ({
      eventName: metric.id === "death_session_rate" ? "player_died" : "purchase_completed",
      label: metric.id === "death_session_rate" ? "Sessions with a death" : "Purchase session rate",
      metric,
      sampleKind: "sessions",
      codeLabel: false,
    }));
  const customOutcomes = events
    .filter((event) => !purchaseEventNames.has(String(event.eventName || "").toLowerCase()))
    .filter((event) => {
      const metric = event.metric || {};
      return metric.available
        && Number(metric.before?.denominator) >= 20
        && Number(metric.after?.denominator) >= 20
        && Number(metric.before?.numerator || 0) + Number(metric.after?.numerator || 0) >= 20;
    })
    .sort((left, right) => (
      Math.abs(Number(right.metric?.relativeDeltaPercent) || Number(right.metric?.delta) || 0)
      - Math.abs(Number(left.metric?.relativeDeltaPercent) || Number(left.metric?.delta) || 0)
    ))
    .slice(0, 8)
    .map((event) => ({ ...event, label: event.eventName, sampleKind: "players", codeLabel: true }));
  return [...coreOutcomes, ...customOutcomes];
}

function renderReleaseFunnelComparisons(funnels, beforeVersion, afterVersion) {
  return `
    <section class="releaseAnalysisSection releaseFunnelImpactSection">
      <header><div><strong>Funnel conversion</strong><span>Conversion rate changes for the selected funnels</span></div><div class="releaseFunnelPickerSlot" data-release-funnel-picker-slot></div></header>
      ${funnels.length ? `<div class="releaseFunnelImpactList">${funnels.map((funnel) => renderReleaseFunnelImpact(funnel, beforeVersion, afterVersion)).join("")}</div>` : ""}
    </section>
  `;
}

function renderReleaseFunnelImpact(funnel = {}, beforeVersion, afterVersion) {
  const metric = funnel.metric || {};
  const tone = getReleaseMetricTone(metric);
  const beforeWidth = getReleaseBarWidth(metric.before?.value);
  const afterWidth = getReleaseBarWidth(metric.after?.value);
  return `
    <article class="releaseFunnelImpact ${tone}">
      <header>
        <div><strong>${escapeHtml(funnel.name || "Funnel")}</strong><span>${escapeHtml(formatCompactNumber(funnel.before?.entrySessions))} / ${escapeHtml(formatCompactNumber(funnel.after?.entrySessions))} entering sessions</span></div>
        <b>${escapeHtml(formatReleaseMetricDifference(metric))}</b>
      </header>
      <div class="releaseFunnelBarRow">
        <span>v${escapeHtml(formatReleaseVersion(beforeVersion))}</span>
        <div><i style="width:${beforeWidth}%"></i></div>
        <strong>${escapeHtml(formatReleaseMetricValue(metric, metric.before))}</strong>
      </div>
      <div class="releaseFunnelBarRow after">
        <span>v${escapeHtml(formatReleaseVersion(afterVersion))}</span>
        <div><i style="width:${afterWidth}%"></i></div>
        <strong>${escapeHtml(formatReleaseMetricValue(metric, metric.after))}</strong>
      </div>
    </article>
  `;
}

function getReleaseBarWidth(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.max(2, Math.min(100, number));
}

function renderReleaseEventComparisons(events) {
  return `
    <section class="releaseAnalysisSection releaseComparisonTableSection">
      <header><div><strong>Event rate changes</strong><span>Player and session rates; raw event volume is excluded</span></div></header>
      <div class="releaseComparisonTable" role="table" aria-label="Event rate release comparisons">
        <div class="releaseComparisonTableHeader" role="row"><span>Event outcome</span><span>Before</span><span>After</span><span>Difference</span><span>Evidence</span></div>
        ${events.map((event) => renderReleaseComparisonRow(
          event.label || event.eventName || "event",
          event.metric,
          `${formatCompactNumber(event.metric?.before?.denominator)} / ${formatCompactNumber(event.metric?.after?.denominator)} ${event.sampleKind || "players"}`,
          Boolean(event.codeLabel),
        )).join("")}
      </div>
    </section>
  `;
}

function renderReleaseComparisonRow(label, metric = {}, sampleText = "--", codeLabel = false) {
  const tone = getReleaseMetricTone(metric);
  return `
    <div class="releaseComparisonTableRow ${tone}" role="row">
      <strong${codeLabel ? ' class="releaseCodeLabel"' : ""}>${escapeHtml(label)}</strong>
      <span>${escapeHtml(formatReleaseMetricValue(metric, metric.before))}</span>
      <span>${escapeHtml(formatReleaseMetricValue(metric, metric.after))}</span>
      <span class="releaseTableDelta">${escapeHtml(formatReleaseMetricDifference(metric))}</span>
      <small>${escapeHtml(sampleText)}</small>
    </div>
  `;
}

function formatReleaseMetricValue(metric = {}, value = {}) {
  if (value?.value === null || value?.value === undefined || !Number.isFinite(Number(value.value))) return "--";
  const number = Number(value.value);
  if (metric.unit === "percent") return `${formatEventNumber(number)}%`;
  if (metric.unit === "minutes") return `${formatEventNumber(number)}m`;
  return formatEventNumber(number);
}

function formatReleaseMetricDelta(metric = {}) {
  if (metric.delta === null || metric.delta === undefined || !Number.isFinite(Number(metric.delta))) return "No comparison";
  const delta = Number(metric.delta);
  const sign = delta > 0 ? "+" : "";
  if (metric.unit === "percent") return `${sign}${formatEventNumber(delta)} pp`;
  if (metric.unit === "minutes") return `${sign}${formatEventNumber(delta)}m`;
  return `${sign}${formatEventNumber(delta)}`;
}

function formatReleaseMetricDifference(metric = {}) {
  const direction = getReleaseMetricTone(metric);
  if (direction === "unchanged") {
    return metric.available ? "Unchanged" : "No comparison";
  }
  return `${direction === "increase" ? "Increased" : "Decreased"} ${formatReleaseMetricDelta(metric)}`;
}

function getReleaseMetricTone(metric = {}) {
  const delta = Number(metric.delta);
  if (!metric.available || !Number.isFinite(delta) || Math.abs(delta) < 0.0001) return "unchanged";
  return delta > 0 ? "increase" : "decrease";
}

function formatReleaseVersion(value) {
  return String(Math.max(0, Math.trunc(Number(value) || 0)));
}

async function loadCustomEvents(options = {}) {
  if (!authenticated || !eventsStatus) return false;
  const requestSequence = ++customEventsRequestSequence;
  const universeId = selectedUniverseId;

  if (!universeId) {
    renderCustomEvents({ totals: {}, events: [], selectedEvent: null });
    eventPropertyList?.setAttribute("aria-busy", "false");
    eventsStatus.textContent = "Connect or select a Roblox game to view events.";
    return false;
  }

  eventsStatus.textContent = "Loading events...";
  eventPropertyList?.setAttribute("aria-busy", "true");
  const params = new URLSearchParams();
  params.set("universeId", universeId);
  const from = getDashboardDateFilterMs(movementFromFilter);
  const to = getDashboardDateFilterMs(movementToFilter);
  if (from) params.set("from", String(from));
  if (to) params.set("to", String(to));
  if (selectedCustomEventName) params.set("eventName", selectedCustomEventName);
  params.set("interval", selectedEventInterval);
  params.set("propertyValueLimit", String(EVENT_PROPERTY_VALUE_LIMIT));
  params.set("recentLimit", String(recentEventsExpanded ? RECENT_EVENT_EXPANDED_LIMIT : RECENT_EVENT_LIMIT));
  if (options.force) params.set("fresh", "1");

  try {
    const payload = await request(`/api/events?${params.toString()}`, { dedupe: !options.force });
    if (requestSequence !== customEventsRequestSequence || universeId !== selectedUniverseId) return false;
    renderCustomEvents(payload);
    eventsStatus.textContent = payload.totals?.events
      ? `${formatCompactNumber(payload.totals.events)} events across ${formatCompactNumber(payload.totals.eventNames)} names.`
      : "No events yet. System activity and logged events will appear here automatically.";
    return true;
  } catch (error) {
    if (requestSequence !== customEventsRequestSequence) return false;
    handleAuthError(error);
    if (authenticated) {
      eventsStatus.textContent = formatRequestError(error);
      if (options.selectionChange) renderCustomEventSelectionError();
    }
    return false;
  } finally {
    if (requestSequence === customEventsRequestSequence) {
      eventPropertyList?.setAttribute("aria-busy", "false");
    }
  }
}

function syncEventCatalogSelection(eventName) {
  if (!eventCatalog) return;
  for (const button of eventCatalog.querySelectorAll("[data-event-name]")) {
    const isActive = button.dataset.eventName === eventName;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  }
}

function prepareCustomEventSelection(eventName) {
  if (selectedEventTitle) selectedEventTitle.textContent = formatEventName(eventName);
  if (selectedEventSubtitle) selectedEventSubtitle.textContent = "Loading event details...";
  if (eventChart) {
    eventChart.setAttribute("aria-busy", "true");
    eventChart.innerHTML = '<p class="status">Loading event activity...</p>';
  }
  renderCustomEventProperties([], 0);
  if (eventPropertyList) {
    eventPropertyList.innerHTML = '<div class="status eventPropertyEmptyRow" role="row"><span role="cell" aria-colspan="4">Loading property values...</span></div>';
  }
  if (recentEventTableHeader) recentEventTableHeader.hidden = true;
  if (recentEventList) {
    recentEventList.setAttribute("aria-busy", "true");
    recentEventList.innerHTML = '<p class="status">Loading recent records...</p>';
  }
  if (viewAllRecentEventsButton) viewAllRecentEventsButton.hidden = true;
}

function renderCustomEventSelectionError() {
  if (selectedEventSubtitle) selectedEventSubtitle.textContent = "Could not load this event. Select it again to retry.";
  if (eventChart) {
    eventChart.setAttribute("aria-busy", "false");
    eventChart.innerHTML = '<p class="status">Could not load event activity.</p>';
  }
  if (eventPropertyList) {
    eventPropertyList.innerHTML = '<div class="status eventPropertyEmptyRow" role="row"><span role="cell" aria-colspan="4">Could not load property values.</span></div>';
  }
  if (recentEventList) {
    recentEventList.setAttribute("aria-busy", "false");
    recentEventList.innerHTML = '<p class="status">Could not load recent records.</p>';
  }
}

function renderCustomEvents(payload = {}) {
  const catalog = Array.isArray(payload.events) ? payload.events : [];
  const selected = payload.selectedEvent || null;
  const previousEventName = selectedCustomEventName;
  selectedCustomEventName = selected?.name || "";
  if (previousEventName && previousEventName !== selectedCustomEventName) {
    recentEventsExpanded = false;
  }

  const selectedCount = Number(selected?.count) || 0;
  if (eventCatalog) {
    const previousScrollTop = eventCatalog.scrollTop;
    const focusedCatalogItem = document.activeElement?.closest?.("[data-event-name]");
    const focusedEventName = focusedCatalogItem && eventCatalog.contains(focusedCatalogItem)
      ? focusedCatalogItem.dataset.eventName || ""
      : "";
    eventCatalog.innerHTML = catalog.length
      ? renderEventCatalog(catalog)
      : '<p class="status">Logged event names will appear here automatically.</p>';
    eventCatalog.scrollTop = previousScrollTop;
    if (focusedEventName) {
      const focusTarget = [...eventCatalog.querySelectorAll("[data-event-name]")]
        .find((button) => button.dataset.eventName === focusedEventName);
      focusTarget?.focus({ preventScroll: true });
      eventCatalog.scrollTop = previousScrollTop;
    }
  }

  if (selectedEventTitle) selectedEventTitle.textContent = selected ? formatEventName(selected.name) : "Select an event";
  if (selectedEventSubtitle) {
    const totalVisits = (selected?.series || []).reduce((sum, bucket) => sum + (Number(bucket.visits) || 0), 0);
    const sessionCoverage = totalVisits > 0
      ? Math.min((Number(selected?.uniqueSessions) || 0) / totalVisits, 1) * 100
      : null;
    selectedEventSubtitle.textContent = selected
      ? [
          `${formatCompactNumber(selected.count)} events`,
          `${formatCompactNumber(selected.uniquePlayers)} players`,
          `${formatCompactNumber(selected.uniqueSessions)} sessions`,
          ...(sessionCoverage === null ? [] : [`${formatEventNumber(sessionCoverage)}% session coverage`]),
        ].join(" · ")
      : "The event timeline will appear here.";
  }
  updateEventIntervalControl(selected);
  renderCustomEventChart(selected?.series || [], selected?.bucketMs);
  currentEventPropertySummaries = Array.isArray(selected?.properties) ? selected.properties : [];
  currentSelectedEventCount = selectedCount;
  renderCustomEventProperties(currentEventPropertySummaries, currentSelectedEventCount);
  renderRecentCustomEvents(selected?.recentEvents || [], selected?.properties || []);

  const recentTotal = Number(selected?.recentEventsTotal) || 0;
  if (viewAllRecentEventsButton) {
    viewAllRecentEventsButton.hidden = !recentEventsExpanded && recentTotal <= (selected?.recentEvents?.length || 0);
    viewAllRecentEventsButton.innerHTML = recentEventsExpanded
      ? 'Show fewer events <span aria-hidden="true">↑</span>'
      : `View all events <span aria-hidden="true">→</span>`;
  }
}

function renderEventCatalog(catalog) {
  const renderItem = (item) => {
    const isActive = item.name === selectedCustomEventName;
    return `
      <button class="eventCatalogItem ${isActive ? "active" : ""}" type="button" data-event-name="${escapeHtml(item.name)}" title="${escapeHtml(formatEventName(item.name))}" ${isActive ? 'aria-current="true"' : ""}>${escapeHtml(formatEventName(item.name))}</button>
    `;
  };
  const systemOrder = new Map([["player_died", 0], ["player_left", 1], ["chat_message", 2]]);
  const systemEvents = catalog
    .filter((item) => item.sourceType === "system")
    .sort((left, right) => (systemOrder.get(left.name) ?? 99) - (systemOrder.get(right.name) ?? 99));
  const customEvents = catalog.filter((item) => item.sourceType !== "system");
  return [...systemEvents, ...customEvents].map(renderItem).join("");
}

function renderCustomEventChart(series, selectedBucketMs) {
  if (!eventChart) return;
  eventChart.setAttribute("aria-busy", "false");
  if (!series.length || !series.some((bucket) => Number(bucket.count) > 0)) {
    eventChart.innerHTML = '<p class="status">No events in this date range.</p>';
    return;
  }

  const maxCount = Math.max(...series.map((bucket) => Number(bucket.count) || 0), 1);
  const maxVisits = Math.max(...series.map((bucket) => Number(bucket.visits) || 0), 1);
  const axisMax = getEventChartAxisMax(maxCount);
  const visitAxisMax = getEventChartAxisMax(maxVisits);
  const tickCount = 4;
  const bucketMs = Number(selectedBucketMs) || getSeriesBucketMs(series);
  const bucketCount = series.length;
  const pointSpacing = bucketCount > 120 ? 18 : bucketCount > 72 ? 28 : bucketCount > 36 ? 40 : 78;
  const chartWidth = Math.max(Math.floor(eventChart.clientWidth || 760), ((bucketCount - 1) * pointSpacing) + 140);
  const chartHeight = 286;
  const left = 62;
  const right = 62;
  const top = 18;
  const bottom = 48;
  const plotWidth = chartWidth - left - right;
  const plotBottom = chartHeight - bottom;
  const plotHeight = plotBottom - top;
  const labelStep = Math.max(1, Math.ceil(bucketCount / 12));
  const points = series.map((bucket, index) => {
    const count = Number(bucket.count) || 0;
    const visits = Number(bucket.visits) || 0;
    const x = bucketCount === 1 ? left + (plotWidth / 2) : left + ((index / (bucketCount - 1)) * plotWidth);
    const y = top + (plotHeight - ((count / axisMax) * plotHeight));
    const visitY = top + (plotHeight - ((visits / visitAxisMax) * plotHeight));
    return { bucket, count, visits, x, y, visitY, label: formatEventChartLabel(bucket.start, bucketMs) };
  });
  const linePath = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const visitLinePath = points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.visitY.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${points.at(-1).x.toFixed(2)} ${plotBottom} L${points[0].x.toFixed(2)} ${plotBottom} Z`;
  const grid = Array.from({ length: tickCount + 1 }, (_, index) => {
    const value = axisMax - ((axisMax / tickCount) * index);
    const visitValue = visitAxisMax - ((visitAxisMax / tickCount) * index);
    const y = top + ((plotHeight / tickCount) * index);
    return `
      <line x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}" />
      <text x="${left - 11}" y="${y + 4}" text-anchor="end">${formatCompactNumber(value)}</text>
      <text class="eventChartVisitTick" x="${chartWidth - right + 11}" y="${y + 4}" text-anchor="start">${formatCompactNumber(visitValue)}</text>
    `;
  }).join("");
  const xLabels = points.map((point, index) => (
    index % labelStep === 0 || index === points.length - 1
      ? `<text class="eventChartXLabel" x="${point.x}" y="${chartHeight - 17}" text-anchor="middle">${escapeHtml(point.label)}</text>`
      : ""
  )).join("");
  const dots = points.map((point) => `
    <g class="eventChartPoint">
      <circle cx="${point.x}" cy="${point.y}" r="4.5"><title>${escapeHtml(point.label)}: ${formatCompactNumber(point.count)} events, ${formatCompactNumber(point.visits)} visits, ${formatCompactNumber(point.bucket.uniquePlayers)} players</title></circle>
      <text x="${point.x}" y="${Math.max(point.y - 11, 12)}" text-anchor="middle">${point.count ? formatCompactNumber(point.count) : ""}</text>
    </g>
  `).join("");
  const visitDots = points.map((point) => `
    <g class="eventChartVisitPoint">
      <circle cx="${point.x}" cy="${point.visitY}" r="3.5"><title>${escapeHtml(point.label)}: ${formatCompactNumber(point.visits)} visits</title></circle>
    </g>
  `).join("");

  eventChart.innerHTML = `
    <div class="eventChartScroller">
      <svg class="eventChartSvg" width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Selected events and game visits over time">
        <defs>
          <linearGradient id="eventChartAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.48" />
            <stop offset="100%" stop-color="#5b21b6" stop-opacity="0.04" />
          </linearGradient>
        </defs>
        <g class="eventChartSvgGrid">${grid}</g>
        <text class="eventChartSvgYAxisTitle" x="16" y="${top + (plotHeight / 2)}" text-anchor="middle" transform="rotate(-90 16 ${top + (plotHeight / 2)})">Events</text>
        <text class="eventChartSvgYAxisTitle eventChartVisitAxisTitle" x="${chartWidth - 16}" y="${top + (plotHeight / 2)}" text-anchor="middle" transform="rotate(90 ${chartWidth - 16} ${top + (plotHeight / 2)})">Visits</text>
        <path class="eventChartArea" d="${areaPath}" />
        <path class="eventChartLine" d="${linePath}" />
        <path class="eventChartVisitLine" d="${visitLinePath}" />
        ${dots}
        ${visitDots}
        ${xLabels}
      </svg>
    </div>
    <div class="eventChartLegend">
      <span><i class="eventChartEventLegend" aria-hidden="true"></i>Selected event</span>
      <span><i class="eventChartVisitLegend" aria-hidden="true"></i>Visits</span>
    </div>
  `;
}

function getEventChartAxisMax(maxCount) {
  const roughStep = Math.max(maxCount / 4, 1);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceStep = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return Math.max(niceStep * magnitude * Math.ceil(maxCount / (niceStep * magnitude)), 4);
}

function getSeriesBucketMs(series) {
  if (series.length < 2) return 60 * 60 * 1000;
  return Math.max(Number(series[1]?.start) - Number(series[0]?.start), 60 * 1000);
}

function formatEventChartLabel(value, bucketMs) {
  const date = new Date(Number(value));
  if (!Number.isFinite(date.getTime())) return "--";
  if (bucketMs < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function updateEventIntervalControl(selectedEvent) {
  if (!eventIntervalSelect) return;
  const availableIntervals = new Set(selectedEvent?.availableIntervals || []);
  for (const option of eventIntervalSelect.options) {
    if (option.value === "auto") continue;
    const isAvailable = !selectedEvent || availableIntervals.has(option.value);
    option.hidden = !isAvailable;
    option.disabled = !isAvailable;
  }

  const forcedInterval = selectedEvent?.selectedInterval;
  if (forcedInterval && forcedInterval !== selectedEventInterval) {
    selectedEventInterval = forcedInterval;
  }
  const autoOption = eventIntervalSelect.querySelector('option[value="auto"]');
  if (autoOption && selectedEventInterval === "auto") {
    autoOption.textContent = `Auto (${formatEventInterval(selectedEvent?.bucketMs || 60 * 60 * 1000)})`;
  }
  if (eventIntervalSelect.value !== selectedEventInterval) eventIntervalSelect.value = selectedEventInterval;
}

function formatEventInterval(value) {
  const milliseconds = Number(value) || 0;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (milliseconds >= day && milliseconds % day === 0) return `${milliseconds / day}d`;
  if (milliseconds >= hour && milliseconds % hour === 0) return `${milliseconds / hour}h`;
  return `${Math.max(1, Math.round(milliseconds / minute))}m`;
}

function renderCustomEventProperties(properties, totalEventCount = 0) {
  if (!eventPropertyList) return;
  const cleanProperties = (Array.isArray(properties) ? properties : [])
    .filter((property) => property?.name)
    .sort((left, right) => getEventPropertyPriority(left, selectedCustomEventName) - getEventPropertyPriority(right, selectedCustomEventName)
      || (Number(right.eventCount ?? right.count) || 0) - (Number(left.eventCount ?? left.count) || 0)
      || String(left.name).localeCompare(String(right.name)));

  if (!cleanProperties.length) {
    eventPropertyList.innerHTML = '<p class="status eventPropertyEmptyRow">No properties were sent with this event.</p>';
    return;
  }

  const selectedTotal = Math.max(Number(totalEventCount) || 0, ...cleanProperties.map((property) => Number(property.eventCount ?? property.count) || 0), 1);
  eventPropertyList.innerHTML = cleanProperties
    .map((property) => renderCustomEventPropertyCard(property, selectedTotal))
    .join("");
}

function renderCustomEventPropertyCard(property, selectedTotal) {
  const propertyName = String(property.name || "Property");
  const eventCount = Number(property.eventCount ?? property.count) || 0;
  const observationCount = Number(property.observationCount) || eventCount;
  const returnedValues = Array.isArray(property.topValues) ? property.topValues : [];
  const values = returnedValues.slice(0, EVENT_PROPERTY_VALUE_LIMIT);
  const totalValues = Number(property.totalValues) || returnedValues.length;
  const valuesTruncated = Boolean(property.valuesTruncated);
  const coverage = selectedTotal ? (eventCount / selectedTotal) * 100 : 0;
  const maxCount = Math.max(...values.map((entry) => Number(entry.count) || 0), 1);
  const numericSummary = property.type === "number"
    ? `<dl class="eventNumericSummaryGrid">
        <div><dt>Events</dt><dd><strong>${formatCompactNumber(eventCount)}</strong><small>${formatEventNumber(coverage)}% coverage</small></dd></div>
        <div><dt>Values</dt><dd><strong>${formatCompactNumber(observationCount)}</strong><small>${formatCompactNumber(totalValues)}${valuesTruncated ? "+" : ""} distinct</small></dd></div>
        <div><dt>Average</dt><dd><strong>${formatEventNumber(property.average)}</strong><small>Across all values</small></dd></div>
        <div><dt>Range</dt><dd><strong>${formatEventNumber(property.min)}–${formatEventNumber(property.max)}</strong><small>Minimum to maximum</small></dd></div>
      </dl>`
    : "";
  const valueRows = values.length
    ? values.map((entry, index) => {
      const count = Number(entry.count) || 0;
      const occurrences = Number(entry.occurrences) || count;
      const percent = selectedTotal ? (count / selectedTotal) * 100 : 0;
      const valueTypeLabel = property.type === "mixed"
        ? (entry.valueType === "number" ? "Number" : (entry.valueType === "boolean" ? "Boolean" : "Text"))
        : "";
      return `
        <div class="eventPropertyItem" role="row">
          <span class="eventPropertyRank" role="cell">${index + 1}</span>
          <div class="eventPropertyValue" role="cell">
            <strong>${escapeHtml(formatEventPropertyValue(entry.value))}</strong>
            ${valueTypeLabel ? `<small class="eventPropertyTypeBadge">${escapeHtml(valueTypeLabel)}</small>` : ""}
            ${occurrences > count ? `<small>${formatCompactNumber(occurrences)} total occurrences</small>` : ""}
            <span><i style="width:${Math.max((count / maxCount) * 100, count ? 4 : 0).toFixed(2)}%"></i></span>
          </div>
          <b role="cell">${formatCompactNumber(count)}</b>
          <em role="cell">${formatEventNumber(percent)}%</em>
        </div>`;
    }).join("")
    : '<p class="status eventPropertyEmptyRow">No usable values were sent for this property.</p>';
  const remainingValueCount = Math.max(totalValues - values.length, 0);
  const valueLimitNote = valuesTruncated || remainingValueCount
    ? `<p class="eventPropertyCardNote">Showing top ${formatCompactNumber(values.length)}${remainingValueCount ? ` of ${formatCompactNumber(totalValues)}` : ""}${valuesTruncated ? "+" : ""} values</p>`
    : "";

  return `
    <section class="eventPropertyBreakdown" aria-label="${escapeHtml(formatEventPropertyName(propertyName))} breakdown">
      <header class="eventPropertyBreakdownHeader">
        <div><h3>${escapeHtml(formatEventPropertyName(propertyName))}</h3></div>
      </header>
      ${numericSummary}
      <div class="eventPropertyTable" role="table" aria-label="${escapeHtml(formatEventPropertyName(propertyName))} values">
        <div class="eventPropertyTableHeader" role="row"><span role="columnheader">#</span><span role="columnheader">Value</span><span role="columnheader">Events</span><span role="columnheader">%</span></div>
        <div class="eventPropertyRows" role="rowgroup">${valueRows}</div>
      </div>
      ${valueLimitNote}
    </section>`;
}

function getEventPropertyPriority(property, eventName) {
  const propertyName = String(property?.name || "");
  const normalizedName = propertyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const preferredName = String(PRIMARY_EVENT_PROPERTIES.get(String(eventName || "")) || "");
  if (preferredName && propertyName.toLowerCase() === preferredName.toLowerCase()) return 0;
  if (GENERIC_EVENT_PROPERTY_NAMES.has(normalizedName)) return 30;
  if (property?.type !== "number") return 10;
  return 20;
}

function renderRecentCustomEvents(events, properties = []) {
  if (!recentEventList || !recentEventTableHeader) return;
  recentEventList.setAttribute("aria-busy", "false");
  recentEventTableHeader.hidden = false;
  const hiddenPropertyNames = new Set(["platform", "server_version", "serverversion", "roblox_device_type", "robloxdevicetype"]);
  const isVisibleProperty = (name) => !hiddenPropertyNames.has(String(name || "").toLowerCase().replace(/[^a-z0-9_]/g, ""));
  const cleanProperties = (Array.isArray(properties) ? properties : []).filter((property) => isVisibleProperty(property.name));
  const primaryCategory = cleanProperties.find((property) => property.type !== "number");
  const primaryNumber = cleanProperties.find((property) => property.type === "number");
  const recentPropertyNames = [...new Set([
    primaryCategory?.name,
    primaryNumber?.name,
    ...cleanProperties.map((property) => property.name),
  ].filter(Boolean))].slice(0, 2);
  const recentGridTemplate = [
    "minmax(140px,.85fr)",
    "minmax(128px,.7fr)",
    ...recentPropertyNames.map(() => "minmax(90px,.65fr)"),
    "minmax(190px,1.25fr)",
  ].join(" ");
  const columnStyle = `grid-template-columns:${recentGridTemplate}`;
  recentEventTableHeader.setAttribute("style", columnStyle);
  recentEventTableHeader.innerHTML = [
    "<span>Player</span>",
    "<span>Time</span>",
    ...recentPropertyNames.map((name) => `<span>${escapeHtml(formatEventPropertyName(name))}</span>`),
    "<span>Payload</span>",
  ].join("");
  recentEventList.innerHTML = events.length
    ? events.map((event) => {
      const player = event.username || (event.userId ? `Player ${event.userId}` : "Server event");
      const eventProperties = event.properties || {};
      const visibleProperties = Object.fromEntries(Object.entries(eventProperties).filter(([name]) => isVisibleProperty(name)));
      const payload = JSON.stringify(visibleProperties);
      const customPayloadPreview = payload.length > 180 ? `${payload.slice(0, 177)}...` : payload;
      const payloadPreview = getRecentEventPayload(event, customPayloadPreview);
      const occurredAt = Number(event.occurredAt || event.receivedAt || 0);
      const dateTime = Number.isFinite(occurredAt) && occurredAt > 0 ? new Date(occurredAt).toISOString() : "";
      return `
        <div class="recentEventItem" style="${columnStyle}">
          <span class="recentEventPlayer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3" /><path d="M5.5 20c.4-4.5 2.6-7 6.5-7s6.1 2.5 6.5 7" /></svg>
            <strong>${escapeHtml(player)}</strong>
          </span>
          <time datetime="${escapeHtml(dateTime)}">${escapeHtml(formatRecentEventTime(occurredAt))}</time>
          ${recentPropertyNames.map((name) => `<span class="recentEventProperty">${escapeHtml(formatEventPropertyValue(eventProperties[name]))}</span>`).join("")}
          <code>${escapeHtml(payloadPreview)}</code>
        </div>
      `;
    }).join("")
    : '<p class="status">No recent records for this event.</p>';
}

function getRecentEventPayload(event, customPayloadPreview) {
  if (event.systemEventType === "chat") return event.message || "Chat message";
  if (event.systemEventType === "death" || event.systemEventType === "leave") {
    const label = event.systemEventType === "death" ? "Player died" : "Player left";
    const coordinates = [event.x, event.y, event.z].map(Number);
    return coordinates.every(Number.isFinite)
      ? `${label} at ${coordinates.map((value) => formatEventNumber(value)).join(", ")}`
      : label;
  }
  return customPayloadPreview === "{}" ? "No properties" : customPayloadPreview;
}

function formatEventName(value) {
  return String(value || "Event")
    .replace(/[_.:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatEventPropertyName(value) {
  return String(value || "Property")
    .split(".")
    .map((segment) => segment
      .replace(/\[\]/g, " items")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" › ");
}

function formatEventPropertyValue(value) {
  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "number") return formatEventNumber(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatRecentEventTime(value) {
  const date = new Date(Number(value));
  if (!Number.isFinite(date.getTime())) return "--";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatEventNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(number);
}

async function loadFunnels(options = {}) {
  if (!authenticated || !funnelsStatus) return;
  const requestSequence = ++funnelRequestSequence;
  const universeId = selectedUniverseId;
  if (!universeId) {
    currentFunnels = [];
    currentFunnelEventNames = [];
    renderFunnelCatalog();
    renderFunnelResults(null);
    setFunnelBuilderVisible(false);
    funnelsStatus.textContent = "Connect or select a Roblox game to build funnels.";
    return;
  }

  if (!options.background) funnelsStatus.textContent = "Loading funnels...";
  const params = new URLSearchParams({ universeId });
  const from = getDashboardDateFilterMs(movementFromFilter);
  const to = getDashboardDateFilterMs(movementToFilter);
  if (from) params.set("from", String(from));
  if (to) params.set("to", String(to));

  try {
    const payload = await request(`/api/funnels?${params.toString()}`, { dedupe: !options.force });
    if (requestSequence !== funnelRequestSequence || universeId !== selectedUniverseId) return;
    const previouslyHadFunnels = currentFunnels.length > 0;
    const previousSelectedFunnelId = selectedFunnelId;
    currentFunnels = Array.isArray(payload.funnels) ? payload.funnels : [];
    currentFunnelEventNames = [...new Set([
      ...(payload.eventNames || []),
      ...currentFunnels.flatMap((funnel) => funnel.steps || []),
    ])].sort();

    const selectedStillExists = currentFunnels.some((funnel) => funnel.id === selectedFunnelId);
    if (!isCreatingFunnel && !selectedStillExists) {
      selectedFunnelId = currentFunnels[0]?.id || "";
    }
    renderFunnelCatalog();
    renderFunnelResults(getSelectedFunnel());
    if ((!previouslyHadFunnels || previousSelectedFunnelId !== selectedFunnelId) && selectedFunnelId && !isCreatingFunnel) populateFunnelEditor(getSelectedFunnel());
    if (!currentFunnels.length && !isCreatingFunnel) startNewFunnel();
    funnelsStatus.textContent = currentFunnels.length
      ? `${formatCompactNumber(currentFunnels.length)} saved · updated just now`
      : (currentFunnelEventNames.length ? "Create your first funnel from available events." : "Wait for system activity or log an event before creating a funnel.");
  } catch (error) {
    if (requestSequence !== funnelRequestSequence) return;
    handleAuthError(error);
    if (authenticated) funnelsStatus.textContent = formatRequestError(error);
  }
}

function getSelectedFunnel() {
  return currentFunnels.find((funnel) => funnel.id === selectedFunnelId) || null;
}

function renderFunnelCatalog() {
  const builderVisible = Boolean(funnelForm && !funnelForm.hidden);
  funnelCatalog?.closest(".funnelCatalogPanel")?.classList.toggle("hasManyFunnels", currentFunnels.length > 10);
  if (funnelCatalog) {
    const previousScrollTop = funnelCatalog.scrollTop;
    const focusedCatalogItem = document.activeElement?.closest?.("[data-funnel-id]");
    const focusedFunnelId = focusedCatalogItem && funnelCatalog.contains(focusedCatalogItem)
      ? focusedCatalogItem.dataset.funnelId || ""
      : "";
    funnelCatalog.innerHTML = currentFunnels.length
      ? currentFunnels.map((funnel) => {
        const isActive = funnel.id === selectedFunnelId;
        return `
          <button class="funnelCatalogItem ${isActive ? "active" : ""}" type="button" data-funnel-id="${escapeHtml(funnel.id)}" title="${escapeHtml(funnel.name)}" ${isActive ? 'aria-current="true"' : ""} ${builderVisible ? "disabled" : ""}>
            ${escapeHtml(funnel.name)}
          </button>
        `;
      }).join("")
      : '<p class="status">Create a funnel to keep its conversion path within reach.</p>';
    funnelCatalog.scrollTop = previousScrollTop;
    if (focusedFunnelId && !builderVisible) {
      const focusTarget = [...funnelCatalog.querySelectorAll("[data-funnel-id]")]
        .find((button) => button.dataset.funnelId === focusedFunnelId);
      focusTarget?.focus({ preventScroll: true });
      funnelCatalog.scrollTop = previousScrollTop;
    }
  }
  const hasSelection = Boolean(getSelectedFunnel());
  if (editFunnelButton) editFunnelButton.disabled = !hasSelection || builderVisible;
  if (funnelMoreButton) funnelMoreButton.disabled = !hasSelection || builderVisible;
}

function selectFunnel(id) {
  const funnel = currentFunnels.find((entry) => entry.id === id);
  if (!funnel) return;
  closeFunnelMoreMenu();
  selectedFunnelId = funnel.id;
  isCreatingFunnel = false;
  populateFunnelEditor(funnel);
  setFunnelBuilderVisible(false);
  renderFunnelCatalog();
  renderFunnelResults(funnel);
}

function startNewFunnel() {
  closeFunnelMoreMenu();
  selectedFunnelId = "";
  isCreatingFunnel = true;
  if (funnelId) funnelId.value = "";
  if (funnelName) funnelName.value = "";
  if (funnelWindowMinutes) funnelWindowMinutes.value = "30";
  if (funnelBuilderTitle) funnelBuilderTitle.textContent = "Create funnel";
  if (saveFunnelButton) saveFunnelButton.textContent = "Create funnel";
  if (funnelFormStatus) funnelFormStatus.textContent = currentFunnelEventNames.length < 1
    ? "Wait for system activity or log an event before saving a funnel."
    : "";
  renderFunnelStepEditor(currentFunnelEventNames.slice(0, 2));
  renderFunnelCatalog();
  renderFunnelResults(null);
  setFunnelBuilderVisible(true);
  funnelName?.focus();
}

function editSelectedFunnel() {
  const funnel = getSelectedFunnel();
  if (!funnel) return;
  closeFunnelMoreMenu();
  isCreatingFunnel = false;
  populateFunnelEditor(funnel);
  setFunnelBuilderVisible(true);
  funnelName?.focus();
}

function cancelFunnelEdit() {
  isCreatingFunnel = false;
  if (!selectedFunnelId && currentFunnels.length) selectedFunnelId = currentFunnels[0].id;
  const funnel = getSelectedFunnel();
  if (funnel) populateFunnelEditor(funnel);
  if (funnelFormStatus) funnelFormStatus.textContent = "";
  renderFunnelCatalog();
  renderFunnelResults(funnel);
  setFunnelBuilderVisible(false);
  restoreFunnelViewFocus();
}

function setFunnelBuilderVisible(visible) {
  if (funnelForm) funnelForm.hidden = !visible;
  if (funnelAnalyticsView) funnelAnalyticsView.hidden = visible;
  if (newFunnelButton) newFunnelButton.disabled = visible;
  renderFunnelCatalog();
}

function restoreFunnelViewFocus() {
  const focusTarget = getSelectedFunnel() ? editFunnelButton : newFunnelButton;
  focusTarget?.focus({ preventScroll: true });
}

function populateFunnelEditor(funnel) {
  if (!funnel) return;
  if (funnelId) funnelId.value = funnel.id || "";
  if (funnelName) funnelName.value = funnel.name || "";
  if (funnelWindowMinutes) {
    const minutes = String(funnel.conversionWindowMinutes || 30);
    if (![...funnelWindowMinutes.options].some((option) => option.value === minutes)) {
      funnelWindowMinutes.add(new Option(`${minutes} minutes`, minutes));
    }
    funnelWindowMinutes.value = minutes;
  }
  if (funnelBuilderTitle) funnelBuilderTitle.textContent = "Edit funnel";
  if (saveFunnelButton) saveFunnelButton.textContent = "Save changes";
  if (funnelFormStatus) funnelFormStatus.textContent = "";
  renderFunnelStepEditor(funnel.steps || []);
}

function renderFunnelStepEditor(steps) {
  if (!funnelStepEditor) return;
  const cleanSteps = Array.isArray(steps) && steps.length ? steps.slice(0, 10) : ["", ""];
  while (cleanSteps.length < 2) cleanSteps.push("");
  funnelStepEditor.innerHTML = cleanSteps.map((step, index) => `
    <div class="funnelStepRow" data-funnel-step-index="${index}">
      <span class="funnelStepNumber">${index + 1}</span>
      <label>
        <span class="srOnly">Step ${index + 1} event</span>
        <select data-funnel-step-select ${currentFunnelEventNames.length ? "" : "disabled"}>
          ${renderFunnelEventOptions(step)}
        </select>
      </label>
      <div class="funnelStepActions">
        <button type="button" data-funnel-step-action="up" aria-label="Move step up" ${index === 0 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6" /></svg></button>
        <button type="button" data-funnel-step-action="down" aria-label="Move step down" ${index === cleanSteps.length - 1 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 10 6 6 6-6" /></svg></button>
        <button type="button" data-funnel-step-action="remove" aria-label="Remove step" ${cleanSteps.length <= 2 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
      </div>
    </div>
  `).join("");
  if (addFunnelStepButton) addFunnelStepButton.disabled = cleanSteps.length >= 10 || !currentFunnelEventNames.length;
  if (saveFunnelButton) saveFunnelButton.disabled = currentFunnelEventNames.length < 1;
}

function renderFunnelEventOptions(selectedName) {
  if (!currentFunnelEventNames.length) return '<option value="">No events available</option>';
  const names = selectedName && !currentFunnelEventNames.includes(selectedName)
    ? [selectedName, ...currentFunnelEventNames]
    : currentFunnelEventNames;
  return names.map((name) => `<option value="${escapeHtml(name)}" ${name === selectedName ? "selected" : ""}>${escapeHtml(formatEventName(name))}</option>`).join("");
}

function getFunnelEditorSteps() {
  return [...(funnelStepEditor?.querySelectorAll("[data-funnel-step-select]") || [])].map((select) => select.value);
}

function addFunnelStep() {
  const steps = getFunnelEditorSteps();
  if (steps.length >= 10 || !currentFunnelEventNames.length) return;
  steps.push(currentFunnelEventNames.find((name) => !steps.includes(name)) || currentFunnelEventNames[0]);
  renderFunnelStepEditor(steps);
}

function handleFunnelStepAction(event) {
  const button = event.target.closest("[data-funnel-step-action]");
  if (!button) return;
  const row = button.closest("[data-funnel-step-index]");
  const index = Number(row?.dataset.funnelStepIndex);
  const steps = getFunnelEditorSteps();
  const action = button.dataset.funnelStepAction;
  if (action === "remove" && steps.length > 2) steps.splice(index, 1);
  if (action === "up" && index > 0) [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
  if (action === "down" && index < steps.length - 1) [steps[index + 1], steps[index]] = [steps[index], steps[index + 1]];
  renderFunnelStepEditor(steps);
}

async function saveFunnel() {
  if (!selectedUniverseId || !funnelForm) return;
  const steps = getFunnelEditorSteps();
  const name = String(funnelName?.value || "").trim();
  if (!name || steps.length < 2 || steps.some((step) => !step)) {
    funnelFormStatus.textContent = "Enter a name and choose at least two event steps.";
    return;
  }

  setFunnelFormDisabled(true);
  funnelFormStatus.textContent = "Saving funnel...";
  try {
    const payload = await request("/api/funnels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: funnelId?.value || undefined,
        universeId: Number(selectedUniverseId),
        name,
        conversionWindowMinutes: Number(funnelWindowMinutes?.value || 30),
        steps,
      }),
    });
    selectedFunnelId = payload.funnel?.id || "";
    isCreatingFunnel = false;
    funnelFormStatus.textContent = "Funnel saved.";
    window.dispatchEvent(new CustomEvent("dashboard:funnelDefinitionsChanged", {
      detail: { universeId: selectedUniverseId },
    }));
    await loadFunnels({ force: true });
    const saved = getSelectedFunnel();
    if (saved) {
      populateFunnelEditor(saved);
      renderFunnelResults(saved);
    }
    setFunnelBuilderVisible(false);
    restoreFunnelViewFocus();
  } catch (error) {
    handleAuthError(error);
    if (authenticated) funnelFormStatus.textContent = formatRequestError(error);
  } finally {
    setFunnelFormDisabled(false);
  }
}

function toggleFunnelMoreMenu() {
  if (!funnelMorePopover || !funnelMoreButton || funnelMoreButton.disabled) return;
  const willOpen = funnelMorePopover.hidden;
  funnelMorePopover.hidden = !willOpen;
  funnelMoreButton.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) deleteFunnelButton?.focus();
}

function closeFunnelMoreMenu() {
  if (funnelMorePopover) funnelMorePopover.hidden = true;
  funnelMoreButton?.setAttribute("aria-expanded", "false");
}

function handleFunnelMoreOutsidePointer(event) {
  if (funnelMorePopover?.hidden) return;
  if (event.target.closest(".funnelMoreMenu")) return;
  closeFunnelMoreMenu();
}

function handleFunnelMoreEscape(event) {
  if (event.key !== "Escape" || funnelMorePopover?.hidden) return;
  closeFunnelMoreMenu();
  funnelMoreButton?.focus();
}

async function deleteSelectedFunnel() {
  const funnel = getSelectedFunnel();
  if (!funnel || !selectedUniverseId) return;
  closeFunnelMoreMenu();
  if (!window.confirm(`Delete "${funnel.name}"? This cannot be undone.`)) return;

  setFunnelFormDisabled(true);
  if (funnelsStatus) funnelsStatus.textContent = "Deleting funnel...";
  try {
    await request(`/api/funnels/${encodeURIComponent(funnel.id)}?universeId=${encodeURIComponent(selectedUniverseId)}`, { method: "DELETE" });
    window.dispatchEvent(new CustomEvent("dashboard:funnelDefinitionsChanged", {
      detail: { universeId: selectedUniverseId },
    }));
    selectedFunnelId = "";
    isCreatingFunnel = false;
    await loadFunnels({ force: true });
  } catch (error) {
    handleAuthError(error);
    if (authenticated && funnelsStatus) funnelsStatus.textContent = formatRequestError(error);
  } finally {
    setFunnelFormDisabled(false);
  }
}

function setFunnelFormDisabled(disabled) {
  for (const control of funnelForm?.querySelectorAll("input, select, button") || []) control.disabled = disabled;
  if (!disabled) renderFunnelStepEditor(getFunnelEditorSteps());
}

function renderFunnelResults(funnel) {
  const analytics = funnel?.analytics;
  if (funnelResultsTitle) funnelResultsTitle.textContent = funnel?.name || "Funnel steps";
  if (funnelResultsSubtitle) funnelResultsSubtitle.textContent = funnel
    ? `${formatCompactNumber(funnel.steps?.length)} ordered steps · ${formatFunnelWindow(funnel.conversionWindowMinutes)}.`
    : "Save or select a funnel to calculate conversion and drop-off.";
  if (funnelEnteredCount) funnelEnteredCount.textContent = funnel ? formatCompactNumber(analytics?.entrySessions) : "--";
  if (funnelCompletedCount) funnelCompletedCount.textContent = funnel ? formatCompactNumber(analytics?.completedSessions) : "--";
  const conversionText = Number(analytics?.entrySessions) > 0
    ? formatFunnelPercentage(analytics?.overallConversion)
    : "--";
  const medianText = analytics?.completedSessions ? formatFunnelDuration(analytics.medianCompletionMs) : "--";
  if (funnelConversionRate) funnelConversionRate.textContent = conversionText;
  if (funnelMedianTime) funnelMedianTime.textContent = medianText;
  if (!funnelResultSteps) return;

  const steps = analytics?.steps || [];
  const maxSessions = Math.max(...steps.map((step) => Number(step.sessions) || 0), 1);
  funnelResultSteps.innerHTML = steps.length
    ? `
      <div class="funnelResultsColumnHeader" aria-hidden="true">
        <span>Funnel step</span>
        <span class="funnelBarColumnHeader"><span>Players</span><span>Total conversion</span></span>
        <span>Median time</span>
        <span>Drop-off</span>
      </div>
      ${steps.map((step) => {
        const sessions = Number(step.sessions) || 0;
        const dropOff = Number(step.dropOffSessions) || 0;
        const barWidth = Math.max((sessions / maxSessions) * 100, sessions ? 8 : 0).toFixed(2);
        const dropOffRate = sessions ? (dropOff / sessions) * 100 : 0;
        const stepTimeMs = Number(step.medianTimeFromPreviousMs || step.averageTimeFromPreviousMs) || 0;
        return `
          <article class="funnelResultStep">
            <div class="funnelStepIdentity">
              <span>${step.index}</span>
              <div><strong>${escapeHtml(step.eventName)}</strong><small>Step ${step.index} of ${steps.length}</small></div>
            </div>
            <div class="funnelStepBarCell">
              <div class="funnelStepBarTrack">
                <div class="funnelStepBar" style="width: ${barWidth}%"></div>
              </div>
              <strong class="funnelStepPlayerCount">${formatCompactNumber(sessions)}</strong>
              <strong class="funnelStepTotalConversion">${formatFunnelPercentage(step.conversionFromStart)}</strong>
            </div>
            <div class="funnelTimeCell">
              <strong>${step.index > 1 && stepTimeMs ? formatFunnelDuration(stepTimeMs) : "--"}</strong>
              <small>${step.index > 1 ? "from previous" : "start"}</small>
            </div>
            <div class="funnelDropCell ${dropOff ? "hasDrop" : ""}">
              <strong>${step.index < steps.length ? formatCompactNumber(dropOff) : "--"}</strong>
              <small>${step.index < steps.length ? `${formatEventNumber(dropOffRate)}%` : "final step"}</small>
            </div>
          </article>
        `;
      }).join("")}
    `
    : '<p class="status">No funnel selected.</p>';
}

function formatFunnelPercentage(value) {
  if (value === null || value === undefined || value === "") return "--";
  const percentage = Number(value);
  return Number.isFinite(percentage) ? `${formatEventNumber(percentage)}%` : "--";
}

function formatFunnelWindow(value) {
  const minutes = Math.max(1, Number(value) || 30);
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${formatCompactNumber(days)} ${days === 1 ? "day" : "days"} window`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${formatCompactNumber(hours)} ${hours === 1 ? "hour" : "hours"} window`;
  }
  return `${formatCompactNumber(minutes)} min window`;
}

function formatFunnelDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.round((Number(milliseconds) || 0) / 1000));
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);
  if (days) return `${days}d ${hours}h ${minutes}m`;
  if (totalHours) return `${totalHours}h ${minutes}m ${seconds}s`;
  if (totalMinutes) return `${totalMinutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.round((Number(milliseconds) || 0) / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function updateSelectedUniverse() {
  if (selectedUniverseId) {
    const selectedUniverse = knownUniverses.find((universe) => String(universe.id || "") === selectedUniverseId);
    selectedUniverseLabel.textContent = selectedUniverse?.name || `Universe ${selectedUniverseId}`;
    universeSelect.value = selectedUniverseId;
  } else {
    selectedUniverseLabel.textContent = "No universe selected";
  }
  syncUniverseSelectorControl();
}

async function loadChatLogs(options = {}) {
  if (!authenticated) return;

  const includeInsights = options.includeInsights !== false;
  const universeId = selectedUniverseId;

  if (!selectedUniverseId) {
    chatLogRequestState = null;
    currentChatLogs = [];
    chatLogsStatus.textContent = "Connect or select a Roblox game to view chat logs.";
    renderChatSummary();
    setChatLiveState("waiting");
    renderRecentChatEmpty("Select a universe to view recent chat.");
    if (includeInsights) loadChatInsights();
    return;
  }

  const requestKey = buildChatLogsQuery(universeId);
  if (chatLogRequestState?.requestKey === requestKey) {
    if (includeInsights) chatLogRequestState.includeInsights = true;
    return chatLogRequestState.promise;
  }

  const requestSequence = ++chatLogRequestSequence;
  const requestState = { universeId, requestKey, requestSequence, includeInsights, promise: null };
  if (includeInsights) setChatLiveState("loading");
  const promise = (async () => {
    try {
      const data = await request(`/api/chat-logs${requestKey}`);
      if (requestSequence !== chatLogRequestSequence || universeId !== selectedUniverseId) return;
      currentChatLogs = Array.isArray(data.logs) ? data.logs : [];
      if (requestState.includeInsights) loadChatInsights();
      renderChatSummary(data);
      setChatLiveState("live");
      if (!data.logs.length) {
        chatLogsStatus.textContent = selectedUniverseId
          ? "No chat logs yet. Start a live server with chat tracking enabled, then have a player send a message."
          : "Connect or select a Roblox game to view chat logs.";
        renderRecentChatEmpty("New Roblox chat will appear here automatically.");
        return;
      }

      chatLogsStatus.textContent = `Showing ${data.logs.length} recent message${data.logs.length === 1 ? "" : "s"} from ${data.logCount || data.logs.length} in the selected range.`;
      chatLogList.innerHTML = data.logs.map(renderChatLog).join("");
      highlightSelectedChatLog({ scroll: false });
    } catch (error) {
      if (requestSequence !== chatLogRequestSequence || universeId !== selectedUniverseId) return;
      currentChatLogs = [];
      handleAuthError(error);
      if (!authenticated) return;
      chatLogsStatus.textContent = formatRequestError(error);
      setChatLiveState("unavailable");
      if (requestState.includeInsights) loadChatInsights();
      if (!chatLogList.querySelector("[data-chat-log-id]")) {
        renderRecentChatEmpty("Recent chat could not be loaded. Try again shortly.");
      }
    } finally {
      if (chatLogRequestState === requestState) chatLogRequestState = null;
    }
  })();
  requestState.promise = promise;
  chatLogRequestState = requestState;
  return promise;
}

function buildChatLogsQuery(universeId) {
  const params = new URLSearchParams({
    universeId: String(universeId || ""),
    limit: String(RECENT_CHAT_LIMIT),
  });
  const from = getDashboardDateFilterMs(movementFromFilter);
  const to = getDashboardDateFilterMs(movementToFilter);
  if (from) params.set("from", String(from));
  if (to) params.set("to", String(to));
  return `?${params.toString()}`;
}

async function loadChatInsights() {
  if (!authenticated) return;

  const requestSequence = ++chatInsightsRequestSequence;
  const universeId = selectedUniverseId;

  if (!selectedUniverseId) {
    chatInsightsStatus.textContent = "Connect or select a Roblox game before running AI Insights.";
    renderCommonQuestionPlaceholders("Select a universe to view player questions.");
    renderAiReportHistory([]);
    return;
  }

  try {
    const query = buildAiInsightsQuery();
    const data = await request(`/api/chat-insights${query}`);
    if (requestSequence !== chatInsightsRequestSequence || universeId !== selectedUniverseId) return;
    renderChatInsights(data);
  } catch (error) {
    if (requestSequence !== chatInsightsRequestSequence || universeId !== selectedUniverseId) return;
    handleAuthError(error);
    if (!authenticated) return;
    chatInsightsStatus.textContent = formatRequestError(error);
    renderCommonQuestionPlaceholders("Player questions could not be loaded.");
  }
}

async function loadAiReportHistory(options = {}) {
  if (!authenticated || !selectedUniverseId || !aiReportSelect) return;

  const requestSequence = ++aiReportHistoryRequestSequence;
  const universeId = selectedUniverseId;
  const cacheKey = String(universeId);
  const cached = readScopedSessionCache(
    "ai-report-history",
    cacheKey,
    AI_REPORT_HISTORY_CACHE_MAX_AGE_MS,
  );
  const hasCachedReports = Array.isArray(cached?.payload?.reports);
  if (hasCachedReports) renderAiReportHistory(cached.payload.reports);

  if (!options.force && hasCachedReports && Date.now() - cached.storedAt < AI_REPORT_HISTORY_CACHE_FRESH_MS) {
    return cached.payload.reports;
  }

  try {
    const query = `?universeId=${encodeURIComponent(universeId)}`;
    const data = await request(`/api/ai-insights/reports${query}`, { dedupe: !options.force });
    if (requestSequence !== aiReportHistoryRequestSequence || universeId !== selectedUniverseId) return;
    const reports = Array.isArray(data.reports) ? data.reports : [];
    if (!reports.length && cached?.payload?.reports?.length) {
      return cached.payload.reports;
    }
    writeScopedSessionCache("ai-report-history", cacheKey, { reports });
    renderAiReportHistory(reports);
    return reports;
  } catch (error) {
    if (requestSequence !== aiReportHistoryRequestSequence || universeId !== selectedUniverseId) return;
    handleAuthError(error);
    if (!authenticated) return [];
    if (!hasCachedReports) renderAiReportHistory([]);
    return hasCachedReports ? cached.payload.reports : [];
  }
}

function renderAiReportHistory(reports) {
  if (!aiReportSelect) return;

  const cleanReports = Array.isArray(reports) ? reports : [];
  const selectedValue = String(aiReportSelect.value || "");
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
  if (selectedValue && cleanReports.some((report) => String(report.generatedAt || "") === selectedValue)) {
    aiReportSelect.value = selectedValue;
  }
}

async function loadSelectedAiReport() {
  if (!authenticated || !selectedUniverseId || !aiReportSelect) return;

  const requestSequence = ++aiReportRequestSequence;
  const universeId = selectedUniverseId;
  const generatedAt = String(aiReportSelect.value || "");
  const params = new URLSearchParams();
  params.set("universeId", universeId);
  if (generatedAt) params.set("generatedAt", generatedAt);
  const requestUrl = `/api/ai-insights/report?${params.toString()}`;
  const cacheKey = `${resolveDashboardCacheScope()}:${requestUrl}`;
  const cached = getAiReportPayloadCache(cacheKey, generatedAt, requestUrl);
  if (cached) {
    applySelectedAiReportResponse(cached.payload, { requestSequence, universeId, generatedAt });
    return cached.payload;
  }

  try {
    const data = await request(requestUrl);
    if (!isCurrentAiReportRequest({ requestSequence, universeId, generatedAt })) return;
    setAiReportPayloadCache(cacheKey, data, { generatedAt, requestUrl });
    applySelectedAiReportResponse(data, { requestSequence, universeId, generatedAt });
    return data;
  } catch (error) {
    if (!isCurrentAiReportRequest({ requestSequence, universeId, generatedAt })) return;
    handleAuthError(error);
    if (!authenticated) return;
    chatInsightsStatus.textContent = formatRequestError(error);
  }
}

function applySelectedAiReportResponse(data, context) {
  if (!isCurrentAiReportRequest(context)) return;
  if (!data?.report) {
    chatInsightsStatus.textContent = "Saved AI report was not found.";
    return;
  }
  renderAiReport(data.report);
}

function isCurrentAiReportRequest(context) {
  return context.requestSequence === aiReportRequestSequence
    && context.universeId === selectedUniverseId
    && context.generatedAt === String(aiReportSelect?.value || "");
}

function getAiReportPayloadCache(cacheKey, generatedAt, requestUrl = "") {
  let cached = aiReportPayloadCache.get(cacheKey);
  if (!cached && generatedAt && requestUrl) {
    const persisted = readScopedSessionCache("ai-report", requestUrl, AI_REPORT_VERSION_CACHE_MS);
    if (persisted?.payload?.report) {
      cached = { storedAt: persisted.storedAt, payload: persisted.payload };
      aiReportPayloadCache.set(cacheKey, cached);
      trimAiReportPayloadMemoryCache();
    }
  }
  if (!cached) return null;
  const maxAgeMs = cached.payload?.report
    ? (generatedAt ? AI_REPORT_VERSION_CACHE_MS : AI_REPORT_LATEST_CACHE_MS)
    : AI_REPORT_MISSING_CACHE_MS;
  if (Date.now() - cached.storedAt <= maxAgeMs) return cached;
  aiReportPayloadCache.delete(cacheKey);
  return null;
}

function setAiReportPayloadCache(cacheKey, payload, options = {}) {
  aiReportPayloadCache.delete(cacheKey);
  aiReportPayloadCache.set(cacheKey, { storedAt: Date.now(), payload });
  trimAiReportPayloadMemoryCache();
  if (options.generatedAt && options.requestUrl && payload?.report) {
    pruneScopedAiReportCache();
    writeScopedSessionCache("ai-report", options.requestUrl, payload);
    pruneScopedAiReportCache();
  }
}

function trimAiReportPayloadMemoryCache() {
  while (aiReportPayloadCache.size > MAX_AI_REPORT_MEMORY_CACHE_ENTRIES) {
    aiReportPayloadCache.delete(aiReportPayloadCache.keys().next().value);
  }
}

function pruneScopedAiReportCache() {
  const scope = resolveDashboardCacheScope();
  if (!scope) return;
  const prefix = `${DASHBOARD_SESSION_CACHE_PREFIX}:${scope}:ai-report:`;
  try {
    const entries = [];
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const serialized = window.sessionStorage.getItem(key) || "";
      let storedAt = 0;
      try {
        storedAt = Number(JSON.parse(serialized || "null")?.storedAt) || 0;
      } catch {
        storedAt = 0;
      }
      if (!storedAt || Date.now() - storedAt > AI_REPORT_VERSION_CACHE_MS) {
        window.sessionStorage.removeItem(key);
      } else {
        entries.push({ key, storedAt, size: serialized.length });
      }
    }

    entries.sort((a, b) => b.storedAt - a.storedAt);
    let keptEntries = 0;
    let keptChars = 0;
    for (const entry of entries) {
      const fits = keptEntries < MAX_AI_REPORT_SESSION_CACHE_ENTRIES
        && keptChars + entry.size <= MAX_AI_REPORT_SESSION_CACHE_CHARS;
      if (fits) {
        keptEntries += 1;
        keptChars += entry.size;
      } else {
        window.sessionStorage.removeItem(entry.key);
      }
    }
  } catch {
    // Saved report caching is optional and must not block object-storage reads.
  }
}

function cacheGeneratedAiReport(report, universeId) {
  const scope = resolveDashboardCacheScope();
  const latestUrl = `/api/ai-insights/report?universeId=${encodeURIComponent(universeId)}`;
  aiReportPayloadCache.delete(`${scope}:${latestUrl}`);
  const generatedAt = String(report?.generatedAt || "");
  if (!generatedAt) return;
  const params = new URLSearchParams({ universeId: String(universeId), generatedAt });
  const requestUrl = `/api/ai-insights/report?${params.toString()}`;
  setAiReportPayloadCache(`${scope}:${requestUrl}`, { report }, { generatedAt, requestUrl });
}

function renderAiReport(report) {
  const areaCount = Array.isArray(report.areaAnalysis?.areas) ? report.areaAnalysis.areas.length : 0;
  const hasChatQuestions = Array.isArray(report.chatInsights?.questions) && report.chatInsights.questions.length > 0;

  if (report.chatInsights) {
    renderChatInsights(report.chatInsights);
  } else {
    chatInsightsMode.textContent = report.mode === "partial" ? "Partial AI" : "Not analyzed";
    renderCommonQuestionPlaceholders();
  }

  if (!hasChatQuestions && areaCount) {
    const generatedText = report.generatedAt ? ` Last run: ${formatDateTime(report.generatedAt)}.` : "";
    chatInsightsMode.textContent = report.mode === "partial" ? "Partial AI" : "AI analysis";
    chatInsightsStatus.textContent = `AI analyzed ${areaCount} map area${areaCount === 1 ? "" : "s"} from tracked movement, death, leave, and chat samples.${generatedText}`;
    renderCommonQuestionPlaceholders();
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

async function loadAiAutomationSettings(options = {}) {
  if (!authenticated || !aiAutomationToggle) return;
  if (!selectedUniverseId) {
    aiAutomationToggle.checked = false;
    aiAutomationStatus.textContent = "Select a game";
    return;
  }

  const requestSequence = ++aiAutomationSettingsRequestSequence;
  const universeId = selectedUniverseId;
  aiAutomationToggle.disabled = false;
  const cacheKey = String(universeId);
  const cached = readScopedSessionCache("ai-automation", cacheKey, AI_AUTOMATION_CACHE_MAX_AGE_MS);
  if (cached?.payload) renderAiAutomationSettings(cached.payload);
  if (!options.force && cached?.payload && Date.now() - cached.storedAt < AI_AUTOMATION_CACHE_FRESH_MS) {
    return cached.payload;
  }

  try {
    const data = await request(`/api/ai-insights/settings?universeId=${encodeURIComponent(universeId)}`);
    if (requestSequence !== aiAutomationSettingsRequestSequence || universeId !== selectedUniverseId) return;
    writeScopedSessionCache("ai-automation", cacheKey, data);
    renderAiAutomationSettings(data);
    return data;
  } catch (error) {
    if (requestSequence !== aiAutomationSettingsRequestSequence || universeId !== selectedUniverseId) return;
    handleAuthError(error);
    if (!authenticated) return;
    if (!cached?.payload && aiAutomationStatus) aiAutomationStatus.textContent = error.message;
  }
}

function renderAiAutomationSettings(settings) {
  const isAuto = settings?.mode !== "manual";
  aiAutomationToggle.checked = isAuto;
  aiAutomationStatus.textContent = isAuto
    ? "Runs every hour"
    : "Manual only";
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
  const requestSequence = ++aiAutomationSettingsRequestSequence;
  const universeId = selectedUniverseId;

  try {
    const mode = aiAutomationToggle.checked ? "auto" : "manual";
    const data = await request(`/api/ai-insights/settings?universeId=${encodeURIComponent(universeId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    if (requestSequence !== aiAutomationSettingsRequestSequence || universeId !== selectedUniverseId) return;
    writeScopedSessionCache("ai-automation", String(universeId), data);
    renderAiAutomationSettings(data);
  } catch (error) {
    if (requestSequence !== aiAutomationSettingsRequestSequence || universeId !== selectedUniverseId) return;
    handleAuthError(error);
    if (!authenticated) return;
    aiAutomationToggle.checked = !aiAutomationToggle.checked;
    aiAutomationStatus.textContent = error.message;
  } finally {
    if (requestSequence === aiAutomationSettingsRequestSequence && universeId === selectedUniverseId) {
      aiAutomationToggle.disabled = false;
    }
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

    const universeId = selectedUniverseId;
    const query = buildAiInsightsQuery();
    const data = await request(`/api/ai-insights/analyze${query}`, { method: "POST" });
    if (universeId !== selectedUniverseId) return;
    cacheGeneratedAiReport(data, universeId);
    renderAiReport(data);

    if (data.errors?.length) {
      const errorText = data.errors.map((error) => error.message).join(" ");
      chatInsightsStatus.textContent = `${chatInsightsStatus.textContent} ${errorText}`.trim();
      chatInsightsMode.textContent = "Partial AI";
    }

    await loadAiReportHistory({ force: true });
    if (aiReportSelect && data.generatedAt) {
      aiReportSelect.value = String(data.generatedAt);
    }
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    chatInsightsStatus.textContent = formatRequestError(error);
    chatInsightsMode.textContent = "AI failed";
  } finally {
    runChatInsightsButton.disabled = false;
  }
}

function buildAiInsightsQuery() {
  const params = new URLSearchParams();
  params.set("universeId", selectedUniverseId);

  const from = getDashboardDateFilterMs(movementFromFilter);
  if (from) params.set("from", String(from));

  const to = getDashboardDateFilterMs(movementToFilter);
  if (to) params.set("to", String(to));

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function sendAiChatPrompt() {
  if (!aiChatInput || !aiChatSendButton || aiChatBusy) return;

  const prompt = aiChatInput.value.trim().slice(0, MAX_AI_CHAT_PROMPT_CHARS);
  if (!prompt) return;

  if (!selectedUniverseId) {
    chatInsightsStatus.textContent = "Select a universe before asking the AI chatbot.";
    return;
  }

  appendAiChatMessage("user", prompt);
  aiChatInput.value = "";
  setAiChatBusy(true);
  chatInsightsStatus.textContent = "Asking AI about current dashboard data...";
  let assistantArticle = null;
  let streamedAnswer = "";

  try {
    const history = aiChatHistory.slice(-MAX_AI_CHAT_HISTORY_MESSAGES);
    const data = await requestAiChatStream(
      `/api/ai-chat${buildAiInsightsQuery()}`,
      { prompt, history },
      (delta) => {
        streamedAnswer += delta;
        if (!assistantArticle) assistantArticle = appendAiChatMessage("assistant", "");
        updateAiChatMessage(assistantArticle, streamedAnswer);
        if (aiChatTyping) aiChatTyping.hidden = true;
      },
    );
    const answer = data.answer || streamedAnswer || "I could not find an answer in the current data.";
    if (!assistantArticle) assistantArticle = appendAiChatMessage("assistant", answer);
    else updateAiChatMessage(assistantArticle, answer);
    aiChatHistory.push(
      { role: "user", content: prompt },
      { role: "assistant", content: answer },
    );
    if (aiChatHistory.length > MAX_AI_CHAT_HISTORY_MESSAGES) {
      aiChatHistory = aiChatHistory.slice(-MAX_AI_CHAT_HISTORY_MESSAGES);
    }
    chatInsightsStatus.textContent = data.model
      ? `AI answer generated from current dashboard data using ${data.model}.`
      : "AI answer generated from current dashboard data.";
  } catch (error) {
    handleAuthError(error);
    const message = formatRequestError(error);
    if (assistantArticle && streamedAnswer) {
      updateAiChatMessage(assistantArticle, `${streamedAnswer}\n\nResponse interrupted: ${message}`);
    } else {
      appendAiChatMessage("assistant", message);
    }
    chatInsightsStatus.textContent = message;
  } finally {
    setAiChatBusy(false);
  }
}

async function requestAiChatStream(url, payload, onDelta) {
  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text();
    const message = getSafeAiChatHttpError(response, responseText);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
  if (!contentType.includes("text/event-stream")) {
    throw new Error("The AI service returned an invalid response. Please retry in a moment.");
  }
  if (!response.body) throw new Error("AI response stream was unavailable.");

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";
  let result = null;

  const processFrame = (frame) => {
    let eventName = "message";
    const dataLines = [];
    for (const line of frame.split("\n")) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }
    if (!dataLines.length) return;

    let eventPayload;
    try {
      eventPayload = JSON.parse(dataLines.join("\n"));
    } catch {
      return;
    }

    if (eventName === "delta" && typeof eventPayload.delta === "string") {
      onDelta(eventPayload.delta);
    } else if (eventName === "done") {
      result = eventPayload;
    } else if (eventName === "error") {
      throw new Error(cleanClientErrorMessage(
        eventPayload.error,
        "The AI response was interrupted. Please retry.",
      ));
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer = `${buffer}${decoder.decode(value || new Uint8Array(), { stream: !done })}`.replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      processFrame(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
    if (done) break;
  }

  if (buffer.trim()) processFrame(buffer.trim());
  if (!result) throw new Error("AI response ended before completion.");
  return result;
}

function getSafeAiChatHttpError(response, responseText) {
  const status = Number(response?.status) || 0;
  const contentType = String(response?.headers?.get("Content-Type") || "").toLowerCase();
  const fallback = status >= 500
    ? "The AI service is temporarily unavailable. Please retry in a moment."
    : `The AI request failed${status ? ` (${status})` : ""}. Please retry.`;

  if (contentType.includes("application/json")) {
    try {
      const payload = responseText ? JSON.parse(responseText) : {};
      const message = typeof payload?.error === "string"
        ? payload.error
        : typeof payload?.error?.message === "string"
          ? payload.error.message
          : "";
      return cleanClientErrorMessage(message, fallback);
    } catch {
      return fallback;
    }
  }

  if (contentType.includes("text/html") || /<!doctype\s+html|<html[\s>]/i.test(responseText || "")) {
    return fallback;
  }
  return cleanClientErrorMessage(responseText, fallback);
}

function cleanClientErrorMessage(value, fallback) {
  const message = String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!message) return fallback;
  return message.length > 300 ? `${message.slice(0, 297)}...` : message;
}

function appendAiChatMessage(role, message) {
  if (!aiChatMessages) return null;

  const article = document.createElement("article");
  article.dataset.aiChatMessage = role;
  article.className = role === "user" ? "botMessage userMessage" : "botMessage assistantMessage";

  if (role === "user") {
    article.innerHTML = `
      <strong>${escapeHtml(authenticatedUser?.username || "You")} <small>${escapeHtml(formatDateTime(Date.now()))}</small></strong>
      <p>${escapeHtml(limitAiChatMessage(message, MAX_AI_CHAT_PROMPT_CHARS))}</p>
    `;
  } else {
    article.innerHTML = `
      <span aria-hidden="true"></span>
      <div>
        <strong>RoAnalytics AI <small>${escapeHtml(formatDateTime(Date.now()))}</small></strong>
        <p>${escapeHtml(limitAiChatMessage(message))}</p>
      </div>
    `;
  }

  aiChatMessages.insertBefore(article, aiChatTyping || null);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  return article;
}

function updateAiChatMessage(article, message) {
  const paragraph = article?.querySelector("p");
  if (!paragraph) return;
  paragraph.textContent = limitAiChatMessage(message);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

function limitAiChatMessage(value, maxChars = MAX_AI_CHAT_RENDER_CHARS) {
  const message = String(value || "");
  return message.length > maxChars ? `${message.slice(0, Math.max(maxChars - 3, 0))}...` : message;
}

function setAiChatBusy(isBusy) {
  aiChatBusy = Boolean(isBusy);
  if (aiChatSendButton) aiChatSendButton.disabled = aiChatBusy;
  if (aiChatInput) aiChatInput.disabled = aiChatBusy || !authenticated;
  if (aiChatTyping) aiChatTyping.hidden = !aiChatBusy;
}

function renderAiChatWelcome() {
  if (!aiChatMessages) return;
  aiChatHistory = [];
  for (const message of aiChatMessages.querySelectorAll("[data-ai-chat-message]")) {
    message.remove();
  }
  if (aiChatInput) aiChatInput.value = "";
  if (aiChatTyping) aiChatTyping.hidden = true;
  updateAiReadinessStatus();
}

function updateAiReadinessStatus() {
  if (!chatInsightsStatus) return;
  if (!authenticated) {
    chatInsightsStatus.textContent = "Sign in to use AI analysis.";
    return;
  }
  if (!selectedUniverseId) {
    chatInsightsStatus.textContent = "Connect or select a Roblox game.";
    return;
  }

  const selectedUniverse = knownUniverses.find((universe) => String(universe.id || "") === selectedUniverseId);
  const hasAnyData = Number(selectedUniverse?.totalSamples || 0) > 0
    || Number(selectedUniverse?.lastSeenAt || 0) > 0
    || Boolean(selectedUniverse?.hasMapSnapshot);
  chatInsightsStatus.textContent = hasAnyData ? "Ready" : "Waiting for analytics data...";
}

function getDateTimeMs(value) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getDashboardDateFilterMs(input) {
  return allDataFilter?.checked ? 0 : getDateTimeMs(input?.value);
}

function handleDateFilterChange() {
  syncDateFilterDisplays();
  if (activeView === "events") {
    currentEventPropertySummaries = [];
    currentSelectedEventCount = 0;
    renderCustomEventProperties([], 0);
    loadCustomEvents({ force: true });
  }
  if (activeView === "funnels") loadFunnels({ force: true });
  if (activeView === "chat") loadChatLogs({ includeInsights: true });
}

function handleExplicitDateFilterChange() {
  if (allDataFilter) allDataFilter.checked = false;
  handleDateFilterChange();
}

function showDateFilterPicker(input) {
  if (!input || typeof input.showPicker !== "function") return;
  try {
    input.showPicker();
  } catch {
    input.focus();
  }
}

function initializeDateFilterDefaults() {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 0, 0);
  if (movementFromFilter && !movementFromFilter.value) {
    const startOfRange = new Date(endOfToday);
    startOfRange.setDate(startOfRange.getDate() - 29);
    startOfRange.setHours(0, 0, 0, 0);
    movementFromFilter.value = toDateTimeLocalValue(startOfRange);
  }
  if (movementToFilter && !movementToFilter.value) {
    movementToFilter.value = toDateTimeLocalValue(endOfToday);
  }
}

function toDateTimeLocalValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function syncDateFilterDisplays() {
  if (movementFromDisplay) {
    movementFromDisplay.textContent = formatDateFilterDisplay(movementFromFilter?.value, "Choose date");
  }

  if (movementToDisplay) {
    movementToDisplay.textContent = formatDateFilterDisplay(movementToFilter?.value, "Choose date");
  }

  if (movementFromFilter && movementToFilter) {
    movementFromFilter.max = movementToFilter.value;
    movementToFilter.min = movementFromFilter.value;
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
  const questions = Array.isArray(data?.questions) ? data.questions : [];
  chatInsightsMode.textContent = data?.mode === "ai" ? "AI analysis" : "Not analyzed";

  if (!questions.length) {
    updateAiReadinessStatus();
    renderCommonQuestionPlaceholders();
    return;
  }

  updateAiReadinessStatus();
  commonQuestionList.innerHTML = questions.map(renderCommonQuestion).join("");
}

function renderChatSummary(data = {}) {
  const logs = Array.isArray(data.logs) ? data.logs : [];
  const messages = Math.max(Number(data.logCount) || 0, 0);
  const fallbackPlayers = new Set(logs.map((log) => String(log.userId || "")).filter(Boolean)).size;
  const players = Math.max(Number(data.uniquePlayerCount) || fallbackPlayers, 0);
  if (chatMessageCount) chatMessageCount.textContent = formatCompactNumber(messages);
  if (chatPlayerCount) chatPlayerCount.textContent = formatCompactNumber(players);
}

function setChatLiveState(state = "waiting") {
  if (!chatLiveBadge) return;
  const labels = {
    live: "Live",
    loading: "Loading",
    unavailable: "Unavailable",
    waiting: "Waiting",
  };
  const cleanState = Object.hasOwn(labels, state) ? state : "waiting";
  chatLiveBadge.dataset.state = cleanState;
  const label = chatLiveBadge.querySelector("b");
  if (label) label.textContent = labels[cleanState];
}

function renderCommonQuestionPlaceholders(message = "Player questions will appear here after an AI analysis.") {
  if (!commonQuestionList) return;
  const placeholders = [1, 2, 3, 4, 5].map((rank) => `
    <div class="chatQuestionPlaceholder" aria-hidden="true">
      <span>${rank}</span><i></i><i></i><i></i>
    </div>
  `).join("");
  commonQuestionList.innerHTML = `
    <div class="chatQuestionEmpty" role="status">
      <strong>No analyzed questions yet</strong>
      <span>${escapeHtml(message)}</span>
    </div>
    ${placeholders}
  `;
}

function renderRecentChatEmpty(message) {
  if (!chatLogList) return;
  chatLogList.innerHTML = `
    <div class="chatRecentEmpty" role="status">
      <span class="chatRecentEmptyIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5.5 5.5h13a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3h-1A2.5 2.5 0 0 1 3 15V8a2.5 2.5 0 0 1 2.5-2.5Z" /></svg>
      </span>
      <strong>No chat messages yet</strong>
      <span>${escapeHtml(message || "New Roblox chat will appear here automatically.")}</span>
    </div>
  `;
}

function renderChatLog(log) {
  const isSelected = selectedChatLogId && log.id === selectedChatLogId ? " selected" : "";
  const username = String(log.username || log.displayName || "Player");
  const initial = username.trim().charAt(0).toUpperCase() || "P";

  return `
    <article class="chatLogItem${isSelected}" data-chat-log-id="${escapeHtml(log.id)}" role="button" tabindex="0" aria-pressed="${isSelected ? "true" : "false"}" aria-label="Show ${escapeHtml(username)}'s chat message on the map">
      <div class="chatLogPlayer">
        <span class="chatPlayerAvatar" aria-hidden="true">${escapeHtml(initial)}</span>
        <strong>${escapeHtml(username)}</strong>
      </div>
      <p class="chatLogMessage">${escapeHtml(log.message)}</p>
      <time datetime="${escapeHtml(new Date(Number(log.sentAt) || Date.now()).toISOString())}">${escapeHtml(formatDateTime(log.sentAt))}</time>
    </article>
  `;
}

function selectChatLog(id, options = {}) {
  selectedChatLogId = id;
  highlightSelectedChatLog({ scroll: Boolean(options.scroll) });

  if (options.notifyMap && id) {
    const selectedLog = currentChatLogs.find((log) => String(log.id || "") === String(id));
    window.dispatchEvent(new CustomEvent("dashboard:chatLogSelected", {
      detail: {
        id,
        eventName: "chat_message",
        area: selectedLog && [selectedLog.x, selectedLog.y, selectedLog.z].every((value) => Number.isFinite(Number(value)))
          ? { x: Number(selectedLog.x), y: Number(selectedLog.y), z: Number(selectedLog.z) }
          : null,
      },
    }));
  }
}

function highlightSelectedChatLog(options = {}) {
  for (const item of chatLogList.querySelectorAll("[data-chat-log-id]")) {
    const selected = selectedChatLogId && item.dataset.chatLogId === selectedChatLogId;
    item.classList.toggle("selected", Boolean(selected));
    item.setAttribute("aria-pressed", selected ? "true" : "false");

    if (selected && options.scroll) {
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
}

function renderCommonQuestion(question, index) {
  const sample = Array.isArray(question.examples) && question.examples.length
    ? String(question.examples[0]?.message || "")
    : "";
  const mentions = Math.max(Number(question.mentions) || 0, 0);
  const players = Math.max(Number(question.playerCount) || 0, 0);

  return `
    <article class="commonQuestionItem chatQuestionRow">
      <span class="questionRank">${escapeHtml(String(index + 1))}</span>
      <div class="questionBody">
        <strong>${escapeHtml(question.title || "Player question")}</strong>
        ${sample ? `<small>Example: “${escapeHtml(sample)}”</small>` : ""}
      </div>
      <strong class="chatQuestionCount" data-label="Messages"><span class="srOnly">Messages: </span>${escapeHtml(formatCompactNumber(mentions))}</strong>
      <strong class="chatQuestionCount" data-label="Players"><span class="srOnly">Players: </span>${escapeHtml(formatCompactNumber(players))}</strong>
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

function showAuthError() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("auth_error");
  if (!error) return;

  authError.hidden = false;
  authError.textContent = error;
  history.replaceState(null, "", "/");
}

function request(url, options = {}) {
  const { dedupe = true, ...fetchOptions } = options || {};
  const method = String(fetchOptions.method || "GET").toUpperCase();
  const canDedupe = method === "GET" && dedupe && !fetchOptions.signal;
  const requestKey = `${method}:${url}`;
  if (canDedupe && inFlightGetRequests.has(requestKey)) {
    return inFlightGetRequests.get(requestKey);
  }

  const requestPromise = performJsonRequest(url, method, fetchOptions);
  if (!canDedupe) return requestPromise;

  const trackedPromise = requestPromise.finally(() => {
    if (inFlightGetRequests.get(requestKey) === trackedPromise) {
      inFlightGetRequests.delete(requestKey);
    }
  });
  inFlightGetRequests.set(requestKey, trackedPromise);
  return trackedPromise;
}

async function performJsonRequest(url, method, options) {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      ...options,
      method,
      cache: options.cache || "no-store",
      credentials: options.credentials || "same-origin",
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
    const responseText = await response.text();
    let payload = {};
    if (responseText) {
      try {
        payload = JSON.parse(responseText);
      } catch {
        const error = new Error(response.ok ? "Server returned an invalid response" : `Request failed (${response.status})`);
        error.status = response.status;
        throw error;
      }
    }

    if (!response.ok) {
      const error = new Error(payload.error || "Request failed");
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } finally {
    const durationMs = Math.round(performance.now() - startedAt);
    if (durationMs >= 2000) {
      console.warn(`[RoAnalytics] Slow request (${durationMs} ms): ${method} ${url}`);
    }
  }
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

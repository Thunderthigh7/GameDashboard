const accountBox = document.querySelector("#accountBox");
const loginPanel = document.querySelector("#loginPanel");
const robloxLoginButtons = document.querySelectorAll("[data-roblox-login]");
const loginStatus = document.querySelector("#loginStatus");
const authControls = document.querySelector("#authControls");
const logoutButton = document.querySelector("#logoutButton");
const adminNavGroup = document.querySelector("#adminNavGroup");
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
const discordConnectionForm = document.querySelector("#discordConnectionForm");
const discordNewWebhookButton = document.querySelector("#discordNewWebhookButton");
const discordWebhookCatalog = document.querySelector("#discordWebhookCatalog");
const discordWebhookCatalogStatus = document.querySelector("#discordWebhookCatalogStatus");
const discordWebhookBuilder = document.querySelector("#discordWebhookBuilder");
const discordWebhookCancelButton = document.querySelector("#discordWebhookCancelButton");
const discordWebhookEditorTitle = document.querySelector("#discordWebhookEditorTitle");
const discordWebhookName = document.querySelector("#discordWebhookName");
const discordWebhookUrl = document.querySelector("#discordWebhookUrl");
const discordSendStatus = document.querySelector("#discordSendStatus");
const discordSaveConnectionButton = document.querySelector("#discordSaveConnectionButton");
const discordTestButton = document.querySelector("#discordTestButton");
const discordDisconnectButton = document.querySelector("#discordDisconnectButton");
const discordNewRuleButton = document.querySelector("#discordNewRuleButton");
const discordRuleCount = document.querySelector("#discordRuleCount");
const discordTopbarActions = document.querySelector("#discordTopbarActions");
const discordRulesPanel = document.querySelector(".discordRulesPanel");
const discordRulesStatus = document.querySelector("#discordRulesStatus");
const discordRuleList = document.querySelector("#discordRuleList");
const discordRuleDialog = document.querySelector("#discordRuleDialog");
const discordRuleDialogBackdrop = document.querySelector("#discordRuleDialogBackdrop");
const discordRuleCloseButton = document.querySelector("#discordRuleCloseButton");
const discordRuleDialogTitle = document.querySelector("#discordRuleDialogTitle");
const discordRuleForm = document.querySelector("#discordRuleForm");
const discordRuleId = document.querySelector("#discordRuleId");
const discordRuleName = document.querySelector("#discordRuleName");
const discordRuleEvent = document.querySelector("#discordRuleEvent");
const discordRuleTriggerType = document.querySelector("#discordRuleTriggerType");
const discordRuleEventFields = document.querySelector("#discordRuleEventFields");
const discordRuleScheduleFields = document.querySelector("#discordRuleScheduleFields");
const discordRuleScheduleDate = document.querySelector("#discordRuleScheduleDate");
const discordRuleScheduleTime = document.querySelector("#discordRuleScheduleTime");
const discordRuleOperator = document.querySelector("#discordRuleOperator");
const discordRuleThreshold = document.querySelector("#discordRuleThreshold");
const discordRuleWindow = document.querySelector("#discordRuleWindow");
const discordRuleCooldown = document.querySelector("#discordRuleCooldown");
const discordRuleMessage = document.querySelector("#discordRuleMessage");
const discordRuleMessageCount = document.querySelector("#discordRuleMessageCount");
const discordRuleMessageHelp = document.querySelector("#discordRuleMessageHelp");
const discordAlertPreviewEmbed = document.querySelector("#discordAlertPreviewEmbed");
const discordAlertPreviewTitle = document.querySelector("#discordAlertPreviewTitle");
const discordAlertPreviewMessage = document.querySelector("#discordAlertPreviewMessage");
const discordAlertPreviewFields = document.querySelector("#discordAlertPreviewFields");
const discordPreviewMessageTime = document.querySelector("#discordPreviewMessageTime");
const discordPreviewEmbedTime = document.querySelector("#discordPreviewEmbedTime");
const discordRuleFormStatus = document.querySelector("#discordRuleFormStatus");
const discordRuleCancelButton = document.querySelector("#discordRuleCancelButton");
const discordRuleSaveButton = document.querySelector("#discordRuleSaveButton");
const robloxLiveAuthorization = document.querySelector("#robloxLiveAuthorization");
const robloxLiveAuthorizationAlert = document.querySelector("#robloxLiveAuthorizationAlert");
const robloxLiveAuthorizationTitle = document.querySelector("#robloxLiveAuthorizationTitle");
const robloxLiveAuthorizationCopy = document.querySelector("#robloxLiveAuthorizationCopy");
const robloxLiveAuthorizeButton = document.querySelector("#robloxLiveAuthorizeButton");
const robloxLiveDisconnectButton = document.querySelector("#robloxLiveDisconnectButton");
const robloxLiveStatus = document.querySelector("#robloxLiveStatus");
const robloxLiveRuleCount = document.querySelector("#robloxLiveRuleCount");
const robloxLiveNewRuleButton = document.querySelector("#robloxLiveNewRuleButton");
const robloxLiveRuleList = document.querySelector("#robloxLiveRuleList");
const robloxLiveDeliveryList = document.querySelector("#robloxLiveDeliveryList");
const robloxLiveRuleDialog = document.querySelector("#robloxLiveRuleDialog");
const robloxLiveRuleDialogBackdrop = document.querySelector("#robloxLiveRuleDialogBackdrop");
const robloxLiveRuleCloseButton = document.querySelector("#robloxLiveRuleCloseButton");
const robloxLiveRuleDialogTitle = document.querySelector("#robloxLiveRuleDialogTitle");
const robloxLiveRuleForm = document.querySelector("#robloxLiveRuleForm");
const robloxLiveRuleId = document.querySelector("#robloxLiveRuleId");
const robloxLiveRuleName = document.querySelector("#robloxLiveRuleName");
const robloxLiveRuleTrigger = document.querySelector("#robloxLiveRuleTrigger");
const robloxLiveEventCondition = document.querySelector("#robloxLiveEventCondition");
const robloxLiveScheduleCondition = document.querySelector("#robloxLiveScheduleCondition");
const robloxLiveScheduleOnceCondition = document.querySelector("#robloxLiveScheduleOnceCondition");
const robloxLiveRuleEvent = document.querySelector("#robloxLiveRuleEvent");
const robloxLiveRuleOperator = document.querySelector("#robloxLiveRuleOperator");
const robloxLiveRuleThreshold = document.querySelector("#robloxLiveRuleThreshold");
const robloxLiveRuleWindow = document.querySelector("#robloxLiveRuleWindow");
const robloxLiveRuleCooldown = document.querySelector("#robloxLiveRuleCooldown");
const robloxLiveRuleSchedule = document.querySelector("#robloxLiveRuleSchedule");
const robloxLiveRuleScheduleDate = document.querySelector("#robloxLiveRuleScheduleDate");
const robloxLiveRuleScheduleTime = document.querySelector("#robloxLiveRuleScheduleTime");
const robloxLiveRuleActionKey = document.querySelector("#robloxLiveRuleActionKey");
const robloxLiveRuleExpiry = document.querySelector("#robloxLiveRuleExpiry");
const robloxLiveRuleParameters = document.querySelector("#robloxLiveRuleParameters");
const robloxLiveRuleFormStatus = document.querySelector("#robloxLiveRuleFormStatus");
const robloxLiveRuleCancelButton = document.querySelector("#robloxLiveRuleCancelButton");
const robloxLiveRuleSaveButton = document.querySelector("#robloxLiveRuleSaveButton");
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
const chatPagination = document.querySelector("#chatPagination");
const chatPreviousPageButton = document.querySelector("#chatPreviousPageButton");
const chatNextPageButton = document.querySelector("#chatNextPageButton");
const chatPageStatus = document.querySelector("#chatPageStatus");
const eventsStatus = document.querySelector("#eventsStatus");
const eventCatalog = document.querySelector("#eventCatalog");
const newEventButton = document.querySelector("#newEventButton");
const selectedEventTitle = document.querySelector("#selectedEventTitle");
const eventSelectionActions = document.querySelector("#eventSelectionActions");
const editEventButton = document.querySelector("#editEventButton");
const eventMoreButton = document.querySelector("#eventMoreButton");
const eventMorePopover = document.querySelector("#eventMorePopover");
const deleteSelectedEventButton = document.querySelector("#deleteSelectedEventButton");
const eventAnalyticsView = document.querySelector("#eventAnalyticsView");
const eventDefinitionForm = document.querySelector("#eventDefinitionForm");
const eventDefinitionId = document.querySelector("#eventDefinitionId");
const eventDefinitionName = document.querySelector("#eventDefinitionName");
const eventDefinitionPropertyEditor = document.querySelector("#eventDefinitionPropertyEditor");
const eventDefinitionPropertyCount = document.querySelector("#eventDefinitionPropertyCount");
const addEventDefinitionPropertyButton = document.querySelector("#addEventDefinitionPropertyButton");
const eventDefinitionHiddenProperties = document.querySelector("#eventDefinitionHiddenProperties");
const eventDefinitionHiddenPropertyList = document.querySelector("#eventDefinitionHiddenPropertyList");
const eventDefinitionBuilderTitle = document.querySelector("#eventDefinitionBuilderTitle");
const cancelEventDefinitionEditButton = document.querySelector("#cancelEventDefinitionEditButton");
const cancelEventDefinitionButton = document.querySelector("#cancelEventDefinitionButton");
const saveEventDefinitionButton = document.querySelector("#saveEventDefinitionButton");
const eventDefinitionStatus = document.querySelector("#eventDefinitionStatus");
const eventLuauPreview = document.querySelector("#eventLuauPreview");
const copyEventCodeButton = document.querySelector("#copyEventCodeButton");
const eventCodeStatus = document.querySelector("#eventCodeStatus");
const eventConfirmDialog = document.querySelector("#eventConfirmDialog");
const eventConfirmIcon = document.querySelector("#eventConfirmIcon");
const eventConfirmTitle = document.querySelector("#eventConfirmTitle");
const eventConfirmDescription = document.querySelector("#eventConfirmDescription");
const eventConfirmCancelButton = document.querySelector("#eventConfirmCancelButton");
const eventConfirmActionButton = document.querySelector("#eventConfirmActionButton");
const eventIntervalButton = document.querySelector("#eventIntervalButton");
const eventIntervalButtonLabel = document.querySelector("#eventIntervalButtonLabel");
const eventIntervalMenu = document.querySelector("#eventIntervalMenu");
const eventIntervalSelect = document.querySelector("#eventIntervalSelect");
const eventPropertyHeaderMetrics = document.querySelector("#eventPropertyHeaderMetrics");
const eventPropertyHeaderEventCount = document.querySelector("#eventPropertyHeaderEventCount");
const eventPropertyHeaderPlayerCount = document.querySelector("#eventPropertyHeaderPlayerCount");
const eventPropertyHeaderSessionCount = document.querySelector("#eventPropertyHeaderSessionCount");
const eventPropertyHeaderSessionCoverage = document.querySelector("#eventPropertyHeaderSessionCoverage");
const eventPropertyList = document.querySelector("#eventPropertyList");
const eventValueManagerDialog = document.querySelector("#eventValueManagerDialog");
const eventValueManagerPropertyName = document.querySelector("#eventValueManagerPropertyName");
const eventValueManagerCloseButton = document.querySelector("#eventValueManagerCloseButton");
const eventValueManagerList = document.querySelector("#eventValueManagerList");
const eventValueManagerAddButton = document.querySelector("#eventValueManagerAddButton");
const eventValueManagerStatus = document.querySelector("#eventValueManagerStatus");
const eventValueManagerCancelButton = document.querySelector("#eventValueManagerCancelButton");
const eventValueManagerSaveButton = document.querySelector("#eventValueManagerSaveButton");
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
const funnelSelectionActions = document.querySelector("#funnelSelectionActions");
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
const funnelTimelineChart = document.querySelector("#funnelTimelineChart");
const funnelTimelineLegend = document.querySelector("#funnelTimelineLegend");
const funnelTimelineStepPickerButton = document.querySelector("#funnelTimelineStepPickerButton");
const funnelTimelineStepPickerLabel = document.querySelector("#funnelTimelineStepPickerLabel");
const funnelTimelineStepMenu = document.querySelector("#funnelTimelineStepMenu");
const funnelManageColorsButton = document.querySelector("#funnelManageColorsButton");
const funnelColorManagerDialog = document.querySelector("#funnelColorManagerDialog");
const funnelColorManagerName = document.querySelector("#funnelColorManagerName");
const funnelColorManagerCloseButton = document.querySelector("#funnelColorManagerCloseButton");
const funnelColorManagerList = document.querySelector("#funnelColorManagerList");
const funnelColorManagerStatus = document.querySelector("#funnelColorManagerStatus");
const funnelColorManagerCancelButton = document.querySelector("#funnelColorManagerCancelButton");
const funnelColorManagerSaveButton = document.querySelector("#funnelColorManagerSaveButton");
const funnelStepChangesTable = document.querySelector("#funnelStepChangesTable");
const funnelIntervalSelect = document.querySelector("#funnelIntervalSelect");
const funnelIntervalButton = document.querySelector("#funnelIntervalButton");
const funnelIntervalButtonLabel = document.querySelector("#funnelIntervalButtonLabel");
const funnelIntervalMenu = document.querySelector("#funnelIntervalMenu");
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
const movementFromFilter = document.querySelector("#movementFromFilter");
const movementToFilter = document.querySelector("#movementToFilter");
const movementFromDisplay = document.querySelector("#movementFromDisplay");
const movementToDisplay = document.querySelector("#movementToDisplay");
const movementFromVersionIndicator = document.querySelector("#movementFromVersionIndicator");
const movementToVersionIndicator = document.querySelector("#movementToVersionIndicator");
const movementFromPickerButton = document.querySelector("#movementFromPickerButton");
const movementToPickerButton = document.querySelector("#movementToPickerButton");
const funnelFromFilter = document.querySelector("#funnelFromFilter");
const funnelToFilter = document.querySelector("#funnelToFilter");
const funnelFromDisplay = document.querySelector("#funnelFromDisplay");
const funnelToDisplay = document.querySelector("#funnelToDisplay");
const funnelFromVersionIndicator = document.querySelector("#funnelFromVersionIndicator");
const funnelToVersionIndicator = document.querySelector("#funnelToVersionIndicator");
const funnelFromPickerButton = document.querySelector("#funnelFromPickerButton");
const funnelToPickerButton = document.querySelector("#funnelToPickerButton");
const dateRangeFieldButtons = document.querySelectorAll("[data-date-range-side]");
const dateRangePickerPanel = document.querySelector("#dateRangePickerPanel");
const dateRangePickerSideLabel = document.querySelector("#dateRangePickerSideLabel");
const dateRangePickerTitle = document.querySelector("#dateRangePickerTitle");
const dateRangePickerCloseButton = document.querySelector("#dateRangePickerCloseButton");
const dateRangePreviousMonthButton = document.querySelector("#dateRangePreviousMonthButton");
const dateRangeNextMonthButton = document.querySelector("#dateRangeNextMonthButton");
const dateRangeMonthLabel = document.querySelector("#dateRangeMonthLabel");
const dateRangeCalendarGrid = document.querySelector("#dateRangeCalendarGrid");
const dateRangeTodayButton = document.querySelector("#dateRangeTodayButton");
const dateRangeTimeInput = document.querySelector("#dateRangeTimeInput");
const dateRangeApplyButton = document.querySelector("#dateRangeApplyButton");
const dateVersionList = document.querySelector("#dateVersionList");
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
let chatLogOffset = 0;
let knownUniverses = [];
let ownedGames = [];
let authenticated = false;
let authenticatedUser = null;
let lastAdminPlans = [];
let activeView = getViewFromHash();
let discordBusy = false;
let discordIntegration = null;
let discordIntegrationRequestSequence = 0;
let discordEditingWebhookId = "";
let discordCreatingWebhook = false;
let robloxLiveBusy = false;
let robloxLiveIntegration = null;
let robloxLiveIntegrationRequestSequence = 0;
let robloxLiveRefreshTimer;
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
let customEventsRequestSequence = 0;
let selectedCustomEventName = "";
let currentEventCatalog = [];
let currentSelectedEvent = null;
let selectedEventInterval = "auto";
let selectedEventPropertyName = "";
let selectedEventPropertyEventName = "";
let eventValueManagerRows = [];
let eventValueManagerUntouchedSettings = [];
let eventValueManagerDirty = false;
let eventValueManagerReturnFocus = null;
let recentEventsExpanded = false;
let isEditingEventDefinition = false;
let eventDefinitionProperties = [];
let eventDefinitionHiddenPropertyNames = new Set();
let eventDefinitionHiddenPropertyTypes = new Map();
let eventDefinitionObservedPropertyNames = new Set();
let eventDefinitionConfiguredPropertyNames = new Set();
let eventDefinitionReturnFocus = null;
let eventDefinitionIsDirty = false;
let eventDefinitionNameLocked = false;
let eventConfirmResolver = null;
let eventConfirmReturnFocus = null;
let ignoreNextEventHashChange = false;
let eventRefreshTimer;
let currentEventReleaseVersions = [];
let currentEventReleaseVersionsUniverseId = "";
let eventReleaseVersionRequestSequence = 0;
let eventReleaseVersionsLoading = false;
let dateRangePickerContext = "events";
let dateRangePickerSide = "from";
let dateRangePickerDraft = null;
let dateRangePickerMonth = null;
const selectedDateReleaseVersions = { from: null, to: null };
const selectedFunnelDateReleaseVersions = { from: null, to: null };
let funnelRequestSequence = 0;
let selectedFunnelId = "";
let selectedFunnelInterval = "auto";
let currentFunnels = [];
let currentFunnelEventNames = [];
let isCreatingFunnel = false;
const selectedFunnelTimelineSteps = new Map();
let funnelColorManagerRows = [];
let funnelColorManagerDirty = false;
let funnelColorManagerReturnFocus = null;
const loadedViews = new Set();
const inFlightGetRequests = new Map();
const aiReportPayloadCache = new Map();

const DASHBOARD_ASSET_VERSION = "20260727-08";
const EVENT_PROPERTY_VALUE_LIMIT = 8;
const MAX_EVENT_PROPERTY_MANAGED_VALUES = 8;
const EVENT_PROPERTY_PRIMARY_TAB_LIMIT = 6;
const MAX_EVENT_DEFINITION_PROPERTIES = 20;
const EVENT_PROPERTY_SERIES_COLORS = [
  "#9b6dff",
  "#2dd4bf",
  "#f5b942",
  "#fb7185",
  "#60a5fa",
  "#f97316",
  "#22c55e",
  "#e879f9",
];
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
window.isDashboardAdmin = () => Boolean(authenticatedUser?.isAdmin);
const resolveDashboardCacheScope = () => {
  const username = String(authenticatedUser?.username || "").trim().toLowerCase();
  return authenticated && username ? encodeURIComponent(username) : "";
};
window.getDashboardCacheScope = resolveDashboardCacheScope;

const CHAT_REFRESH_MS = 5000;
const CHAT_LOG_PAGE_SIZE = 25;
const EVENT_REFRESH_MS = 15000;
const FUNNEL_REFRESH_MS = 15000;
const ROBLOX_LIVE_REFRESH_MS = 5000;
const UNIVERSE_SCOPED_VIEWS = new Set(["events", "funnels", "ai-runs", "chat", "discord", "roblox-live"]);
const ADMIN_ONLY_VIEWS = new Set(["ai-runs", "admin"]);
const SIDEBAR_WIDTH_STORAGE_KEY = "roanalytics.sidebarWidth";
const SIDEBAR_WIDTH_MIN = 208;
const SIDEBAR_WIDTH_MAX = 360;
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
  if (eventConfirmDialog && eventConfirmDialog.parentElement !== document.body) {
    document.body.append(eventConfirmDialog);
  }
  applyStoredLayoutSizes();
  bindEvents();
  initializeDateFilterDefaults();
  syncDateFilterDisplays();
  await checkAuth();
}

function loadHeatmapModule() {
  if (heatmapModulePromise) return heatmapModulePromise;
  heatmapModulePromise = import(`/assets/${DASHBOARD_ASSET_VERSION}/heatmap.js`)
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
  discordConnectionForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDiscordConnection();
  });
  discordNewWebhookButton?.addEventListener("click", startNewDiscordWebhook);
  discordWebhookCancelButton?.addEventListener("click", cancelNewDiscordWebhook);
  discordWebhookCatalog?.addEventListener("click", handleDiscordWebhookCatalogClick);
  discordWebhookUrl?.addEventListener("input", clearDiscordSendStatus);
  discordTestButton?.addEventListener("click", testDiscordConnection);
  discordDisconnectButton?.addEventListener("click", disconnectDiscordConnection);
  discordNewRuleButton?.addEventListener("click", () => openDiscordRuleEditor());
  discordRuleList?.addEventListener("click", handleDiscordRuleListClick);
  discordRuleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDiscordAlertRule();
  });
  discordRuleCancelButton?.addEventListener("click", closeDiscordRuleEditor);
  discordRuleCloseButton?.addEventListener("click", closeDiscordRuleEditor);
  discordRuleDialogBackdrop?.addEventListener("click", closeDiscordRuleEditor);
  discordRuleTriggerType?.addEventListener("change", syncDiscordRuleTriggerFields);
  discordRuleForm?.addEventListener("input", updateDiscordRulePreview);
  discordRuleForm?.addEventListener("change", updateDiscordRulePreview);
  document.addEventListener("keydown", handleDiscordRuleDialogKeydown);
  robloxLiveAuthorizeButton?.addEventListener("click", authorizeRobloxLiveActions);
  robloxLiveDisconnectButton?.addEventListener("click", disconnectRobloxLiveActions);
  robloxLiveNewRuleButton?.addEventListener("click", () => openRobloxLiveRuleEditor());
  robloxLiveRuleList?.addEventListener("click", handleRobloxLiveRuleListClick);
  robloxLiveRuleTrigger?.addEventListener("change", syncRobloxLiveRuleTriggerFields);
  robloxLiveRuleOperator?.addEventListener("change", syncRobloxLiveRuleThreshold);
  robloxLiveRuleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRobloxLiveRule();
  });
  robloxLiveRuleCancelButton?.addEventListener("click", closeRobloxLiveRuleEditor);
  robloxLiveRuleCloseButton?.addEventListener("click", closeRobloxLiveRuleEditor);
  robloxLiveRuleDialogBackdrop?.addEventListener("click", closeRobloxLiveRuleEditor);
  document.addEventListener("keydown", handleRobloxLiveDialogKeydown);
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
  eventCatalog?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-event-name]");
    const eventName = button?.dataset.eventName || "";
    if (button?.disabled) return;
    if (!eventName) return;
    const selectionChanged = eventName !== selectedCustomEventName;
    selectedCustomEventName = eventName;
    syncEventCatalogSelection(eventName);
    if (selectionChanged) {
      recentEventsExpanded = false;
      prepareCustomEventSelection(eventName);
      window.dispatchEvent(new CustomEvent("dashboard:eventMapSelectionChanged", {
        detail: { eventName: selectedCustomEventName, source: "events-page" },
      }));
    }
    loadCustomEvents({ force: true, selectionChange: selectionChanged });
  });
  newEventButton?.addEventListener("click", startNewEventDefinition);
  editEventButton?.addEventListener("click", () => editSelectedEventDefinition());
  eventMoreButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEventMoreMenu();
  });
  eventMorePopover?.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("pointerdown", handleEventMoreOutsidePointer);
  document.addEventListener("keydown", handleEventMoreEscape);
  deleteSelectedEventButton?.addEventListener("click", deleteSelectedCustomEvent);
  eventDefinitionForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEventDefinition();
  });
  cancelEventDefinitionEditButton?.addEventListener("click", cancelEventDefinitionEdit);
  cancelEventDefinitionButton?.addEventListener("click", cancelEventDefinitionEdit);
  eventDefinitionName?.addEventListener("input", () => {
    eventDefinitionIsDirty = true;
    renderEventDefinitionCodePreviews();
  });
  eventDefinitionName?.addEventListener("blur", () => {
    const normalizedName = String(eventDefinitionName.value || "").trim().toLowerCase();
    if (eventDefinitionName.value !== normalizedName) {
      eventDefinitionName.value = normalizedName;
      eventDefinitionIsDirty = true;
      renderEventDefinitionCodePreviews();
    }
  });
  addEventDefinitionPropertyButton?.addEventListener("click", () => addEventDefinitionProperty());
  eventDefinitionPropertyEditor?.addEventListener("input", handleEventDefinitionPropertyInput);
  eventDefinitionPropertyEditor?.addEventListener("change", handleEventDefinitionPropertyInput);
  eventDefinitionPropertyEditor?.addEventListener("click", handleEventDefinitionPropertyAction);
  eventDefinitionHiddenPropertyList?.addEventListener("click", handleEventDefinitionHiddenPropertyAction);
  copyEventCodeButton?.addEventListener("click", copyEventDefinitionCode);
  eventConfirmCancelButton?.addEventListener("click", () => resolveEventConfirmation(false));
  eventConfirmActionButton?.addEventListener("click", () => resolveEventConfirmation(true));
  eventConfirmDialog?.addEventListener("pointerdown", (event) => {
    if (event.target === eventConfirmDialog) resolveEventConfirmation(false);
  });
  document.addEventListener("keydown", handleEventConfirmationKeydown);
  eventIntervalSelect?.addEventListener("change", () => {
    selectedEventInterval = eventIntervalSelect.value || "auto";
    syncEventIntervalDropdown();
    loadCustomEvents({ force: true });
  });
  eventIntervalButton?.addEventListener("click", toggleEventIntervalMenu);
  eventIntervalButton?.addEventListener("keydown", handleEventIntervalTriggerKeydown);
  eventIntervalMenu?.addEventListener("click", handleEventIntervalMenuClick);
  eventIntervalMenu?.addEventListener("keydown", handleEventIntervalMenuKeydown);
  document.addEventListener("pointerdown", handleEventIntervalOutsidePointer);
  syncEventIntervalDropdown();
  eventPropertyList?.addEventListener("click", handleEventPropertyTabClick);
  eventPropertyList?.addEventListener("keydown", handleEventPropertyTabKeydown);
  document.addEventListener("pointerdown", handleEventPropertyMoreOutsidePointer);
  eventValueManagerCloseButton?.addEventListener("click", () => closeEventValueManager());
  eventValueManagerCancelButton?.addEventListener("click", () => closeEventValueManager());
  eventValueManagerAddButton?.addEventListener("click", addEventValueManagerRow);
  eventValueManagerList?.addEventListener("input", handleEventValueManagerInput);
  eventValueManagerList?.addEventListener("change", handleEventValueManagerInput);
  eventValueManagerList?.addEventListener("click", handleEventValueManagerAction);
  eventValueManagerSaveButton?.addEventListener("click", saveEventValueSettings);
  eventValueManagerDialog?.addEventListener("pointerdown", (event) => {
    if (event.target === eventValueManagerDialog) closeEventValueManager();
  });
  document.addEventListener("keydown", handleEventValueManagerKeydown);
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
  funnelIntervalSelect?.addEventListener("change", () => {
    selectedFunnelInterval = funnelIntervalSelect.value || "auto";
    syncFunnelIntervalDropdown();
    loadFunnels({ force: true });
  });
  funnelIntervalButton?.addEventListener("click", toggleFunnelIntervalMenu);
  funnelIntervalButton?.addEventListener("keydown", handleFunnelIntervalTriggerKeydown);
  funnelIntervalMenu?.addEventListener("click", handleFunnelIntervalMenuClick);
  funnelIntervalMenu?.addEventListener("keydown", handleFunnelIntervalMenuKeydown);
  document.addEventListener("pointerdown", handleFunnelIntervalOutsidePointer);
  syncFunnelIntervalDropdown();
  funnelTimelineStepPickerButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFunnelTimelineStepMenu();
  });
  funnelTimelineStepMenu?.addEventListener("click", handleFunnelTimelineStepMenuClick);
  funnelTimelineStepMenu?.addEventListener("change", handleFunnelTimelineStepSelectionChange);
  document.addEventListener("pointerdown", handleFunnelTimelineStepOutsidePointer);
  document.addEventListener("keydown", handleFunnelTimelineStepEscape);
  funnelManageColorsButton?.addEventListener("click", () => openFunnelColorManager(funnelManageColorsButton));
  funnelColorManagerCloseButton?.addEventListener("click", () => closeFunnelColorManager());
  funnelColorManagerCancelButton?.addEventListener("click", () => closeFunnelColorManager());
  funnelColorManagerList?.addEventListener("input", handleFunnelColorManagerInput);
  funnelColorManagerList?.addEventListener("change", handleFunnelColorManagerInput);
  funnelColorManagerSaveButton?.addEventListener("click", saveFunnelStepColors);
  funnelColorManagerDialog?.addEventListener("pointerdown", (event) => {
    if (event.target === funnelColorManagerDialog) closeFunnelColorManager();
  });
  document.addEventListener("keydown", handleFunnelColorManagerKeydown);
  window.addEventListener("resize", () => {
    if (activeView === "funnels" && !isCreatingFunnel) renderFunnelTimeline(getSelectedFunnel());
  });
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
  adminUserList?.addEventListener("click", (event) => {
    const resetButton = event.target.closest("[data-reset-usage-user]");
    if (resetButton) {
      resetAdminUsage(resetButton);
      return;
    }

    const planButton = event.target.closest("[data-admin-save-plan-user]");
    if (planButton) saveAdminUserPlan(planButton);
  });
  for (const button of dateRangeFieldButtons) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openDateRangePicker(button.dataset.dateRangeSide, button.dataset.dateRangeContext);
    });
  }
  dateRangePickerCloseButton?.addEventListener("click", closeDateRangePicker);
  dateRangePreviousMonthButton?.addEventListener("click", () => moveDateRangePickerMonth(-1));
  dateRangeNextMonthButton?.addEventListener("click", () => moveDateRangePickerMonth(1));
  dateRangeCalendarGrid?.addEventListener("click", handleDateRangeCalendarSelection);
  dateRangeTodayButton?.addEventListener("click", selectDateRangeToday);
  dateRangeTimeInput?.addEventListener("input", syncDateRangePickerTime);
  dateRangeApplyButton?.addEventListener("click", applyDateRangePickerValue);
  dateVersionList?.addEventListener("click", handleDateReleaseVersionSelection);
  document.addEventListener("pointerdown", handleDateRangePickerOutsidePointer);
  document.addEventListener("keydown", handleDateRangePickerEscape);

  for (const link of viewNavLinks) {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      const nextView = link.dataset.dashboardView || "overview";
      if (ADMIN_ONLY_VIEWS.has(nextView) && !authenticatedUser?.isAdmin) {
        link.focus();
        return;
      }
      if (!await confirmEventDefinitionDiscard(nextView)) return;
      eventDefinitionIsDirty = false;
      setActiveView(nextView, { updateHash: true });
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
  chatPreviousPageButton?.addEventListener("click", () => changeChatLogPage(-1));
  chatNextPageButton?.addEventListener("click", () => changeChatLogPage(1));

  window.addEventListener("dashboard:chatPointSelected", (event) => {
    selectChatLog(event.detail?.id || "", { scroll: true });
  });

  window.addEventListener("dashboard:eventMapSelectionChanged", (event) => {
    const eventName = String(event.detail?.eventName || "");
    if (!eventName) return;
    const selectionChanged = eventName !== selectedCustomEventName;
    if (selectionChanged) {
      recentEventsExpanded = false;
    }
    selectedCustomEventName = eventName;
    syncEventCatalogSelection(eventName);
    if (activeView === "events" && event.detail?.source !== "events-page") {
      if (selectionChanged) prepareCustomEventSelection(eventName);
      loadCustomEvents({ selectionChange: selectionChanged });
    }
  });

  window.addEventListener("hashchange", handleDashboardHashChange);
  window.addEventListener("beforeunload", handleEventDefinitionBeforeUnload);
  document.addEventListener("visibilitychange", handleDashboardVisibilityChange);
}

function handleDashboardVisibilityChange() {
  if (document.hidden) {
    closeUniverseDropdown();
    stopChatRefresh();
    stopEventRefresh();
    stopFunnelRefresh();
  } else {
    updateViewRefreshTimers();
    if (authenticated && selectedUniverseId) {
      if (activeView === "chat") loadChatLogs({ includeInsights: false });
      if (activeView === "events") loadCustomEvents();
      if (activeView === "funnels") loadFunnels();
    }
  }

  window.dispatchEvent(new CustomEvent("dashboard:visibilityChanged", {
    detail: { hidden: document.hidden },
  }));
}

function applyStoredLayoutSizes() {
  applyStoredLayoutSize(SIDEBAR_WIDTH_STORAGE_KEY, "--sidebar-width", SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX);
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
  if (ADMIN_ONLY_VIEWS.has(activeView) && !authenticatedUser?.isAdmin) {
    activeView = "overview";
    if (window.location.hash === "#admin" || window.location.hash === "#ai-runs") {
      window.history.replaceState(null, "", "#overview");
    }
  }
  loadedViews.clear();
  document.body.classList.toggle("isLocked", !authenticated);
  accountBox.textContent = authenticatedUser?.username ? authenticatedUser.username : authenticated ? "Signed in" : "Signed out";
  if (adminNavGroup) adminNavGroup.hidden = !authenticatedUser?.isAdmin;
  if (adminNavLink) adminNavLink.hidden = !authenticatedUser?.isAdmin;
  updateDemoUniverseControl();
  loginPanel.hidden = authenticated;
  authControls.hidden = !authenticated;
  runChatInsightsButton.hidden = !authenticatedUser?.isAdmin;
  setAiChatBusy(false);
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
    stopEventRefresh();
    stopFunnelRefresh();
    renderChatSummary();
    setChatLiveState("waiting");
    renderRecentChatEmpty("Sign in to view recent chat.");
    renderCommonQuestionPlaceholders("Sign in to view player questions.");
    if (aiReportSelect) {
      aiReportSelect.innerHTML = `<option value="">Latest saved report</option>`;
      aiReportSelect.disabled = true;
    }
    selectedUniverseId = "";
    chatLogOffset = 0;
    currentEventReleaseVersions = [];
    currentEventReleaseVersionsUniverseId = "";
    eventReleaseVersionRequestSequence += 1;
    eventReleaseVersionsLoading = false;
    clearSelectedDateReleaseVersion("from");
    clearSelectedDateReleaseVersion("to");
    clearSelectedDateReleaseVersion("from", "funnels");
    clearSelectedDateReleaseVersion("to", "funnels");
    closeDateRangePicker();
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
    if (adminNavGroup) adminNavGroup.hidden = true;
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
    setDiscordBusy(false);
    discordConnectionForm?.reset();
    discordIntegration = null;
    discordEditingWebhookId = "";
    discordCreatingWebhook = false;
    discordIntegrationRequestSequence += 1;
    closeDiscordRuleEditor();
    renderDiscordIntegration();
    clearDiscordSendStatus();
    robloxLiveIntegration = null;
    robloxLiveIntegrationRequestSequence += 1;
    setRobloxLiveBusy(false);
    closeRobloxLiveRuleEditor();
    renderRobloxLiveIntegration();
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
  if (window.location.hash === "#ai-runs") return "ai-runs";
  if (window.location.hash === "#chat") return "chat";
  if (window.location.hash === "#discord") return "discord";
  if (window.location.hash === "#roblox-live") return "roblox-live";
  if (window.location.hash === "#usage") return "usage";
  if (window.location.hash === "#connect") return "connect";
  if (window.location.hash === "#admin") return "admin";
  return "overview";
}

function setActiveView(view, options = {}) {
  const previousView = activeView;
  const requestedView = view === "events" || view === "funnels" || view === "ai-runs" || view === "chat" || view === "discord" || view === "roblox-live" || view === "usage" || view === "connect" || view === "admin" ? view : "overview";
  const lacksAdminAccess = ADMIN_ONLY_VIEWS.has(requestedView) && !authenticatedUser?.isAdmin;
  activeView = lacksAdminAccess ? "overview" : requestedView;
  if (lacksAdminAccess && (window.location.hash === "#admin" || window.location.hash === "#ai-runs")) {
    window.history.replaceState(null, "", "#overview");
  }
  if (previousView !== activeView) closeDateRangePicker();
  if (activeView !== "funnels") {
    closeFunnelMoreMenu();
    closeFunnelIntervalMenu();
    closeFunnelTimelineStepMenu();
  }
  if (activeView !== "events") {
    closeEventValueManager({ force: true, skipFocus: true });
    closeEventIntervalMenu();
    closeEventMoreMenu();
    setEventDefinitionBuilderVisible(false);
  }
  if (activeView !== "discord") {
    closeDiscordRuleEditor();
    if (discordTopbarActions) discordTopbarActions.hidden = true;
  }
  if (activeView !== "roblox-live") closeRobloxLiveRuleEditor();
  document.body.dataset.activeView = activeView;
  if (options.updateHash) {
    const nextHash = activeView === "events"
        ? "#events"
        : activeView === "funnels"
          ? "#funnels"
          : activeView === "ai-runs"
            ? "#ai-runs"
            : activeView === "chat"
              ? "#chat"
              : activeView === "discord"
                ? "#discord"
                : activeView === "roblox-live"
                  ? "#roblox-live"
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
  if (adminNavGroup) adminNavGroup.hidden = !authenticatedUser?.isAdmin;

  for (const panel of viewPanels) {
    panel.hidden = !authenticated || panel.dataset.viewPanel !== activeView;
  }

  for (const link of viewNavLinks) {
    if (link.dataset.dashboardView === "admin") {
      link.hidden = !authenticatedUser?.isAdmin;
    }
    if (link.dataset.dashboardView === "ai-runs") {
      const isAdminLocked = !authenticatedUser?.isAdmin;
      link.classList.toggle("isAdminLocked", isAdminLocked);
      link.setAttribute("aria-disabled", String(isAdminLocked));
      link.title = isAdminLocked ? "Admin access required" : "Admin-only AI features";
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
    "ai-runs": {
      title: "AI Features",
      subtitle: "Admin-only AI chat, analysis, and saved runs.",
    },
    chat: {
      title: "Chats",
      subtitle: "",
    },
    discord: {
      title: "Discord Alerts",
      subtitle: "",
    },
    "roblox-live": {
      title: "Roblox Live Actions",
      subtitle: "Trigger pre-coded server actions from live analytics or a fixed schedule.",
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
  pageTitle.textContent = activeView === "discord"
    ? getDiscordPageHeading()
    : activeViewCopy.title;
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
    stopEventRefresh();
    stopFunnelRefresh();
    stopRobloxLiveRefresh();
    return;
  }

  if (activeView === "chat" && selectedUniverseId) startChatRefresh();
  else stopChatRefresh();

  if (activeView === "events" && selectedUniverseId) startEventRefresh();
  else stopEventRefresh();

  if (activeView === "funnels" && selectedUniverseId) startFunnelRefresh();
  else stopFunnelRefresh();

  if (activeView === "roblox-live" && selectedUniverseId) startRobloxLiveRefresh();
  else stopRobloxLiveRefresh();
}

function loadActiveViewData(view, options = {}) {
  if (!authenticated) return;
  if (ADMIN_ONLY_VIEWS.has(view) && !authenticatedUser?.isAdmin) return;
  if (!selectedUniverseId && UNIVERSE_SCOPED_VIEWS.has(view)) return;
  if (!options.force && loadedViews.has(view)) {
    if (view === "ai-runs") {
      loadAiAutomationSettings();
      loadAiReportHistory();
      loadSelectedAiReport();
    } else if (view === "events") {
      loadCustomEvents();
    } else if (view === "funnels") {
      loadFunnels();
    } else if (view === "chat") {
      loadChatLogs({ includeInsights: false });
    } else if (view === "discord") {
      loadDiscordIntegration();
    } else if (view === "roblox-live") {
      loadRobloxLiveIntegration();
    }
    return;
  }
  loadedViews.add(view);

  if (view === "events") {
    loadCustomEvents();
  } else if (view === "funnels") {
    loadFunnels();
  } else if (view === "ai-runs") {
    loadAiAutomationSettings();
    loadAiReportHistory();
    loadSelectedAiReport();
  } else if (view === "chat") {
    loadChatLogs({ includeInsights: false });
  } else if (view === "discord") {
    loadDiscordIntegration();
  } else if (view === "roblox-live") {
    loadRobloxLiveIntegration();
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
  chatRefreshTimer = window.setInterval(() => {
    if (chatLogOffset === 0) loadChatLogs({ includeInsights: false });
  }, CHAT_REFRESH_MS);
}

function stopChatRefresh() {
  if (chatRefreshTimer) {
    window.clearInterval(chatRefreshTimer);
    chatRefreshTimer = null;
  }
}

function startEventRefresh() {
  if (eventRefreshTimer || document.hidden) return;
  eventRefreshTimer = window.setInterval(() => {
    if (!isEditingEventDefinition) loadCustomEvents({ background: true });
  }, EVENT_REFRESH_MS);
}

function stopEventRefresh() {
  if (eventRefreshTimer) {
    window.clearInterval(eventRefreshTimer);
    eventRefreshTimer = null;
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

function startRobloxLiveRefresh() {
  if (robloxLiveRefreshTimer || document.hidden) return;
  robloxLiveRefreshTimer = window.setInterval(() => {
    if (!robloxLiveBusy && robloxLiveRuleDialog?.hidden !== false) {
      loadRobloxLiveIntegration({ background: true });
    }
  }, ROBLOX_LIVE_REFRESH_MS);
}

function stopRobloxLiveRefresh() {
  if (robloxLiveRefreshTimer) {
    window.clearInterval(robloxLiveRefreshTimer);
    robloxLiveRefreshTimer = null;
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

function clearDiscordSendStatus() {
  if (!discordSendStatus || discordBusy) return;
  discordSendStatus.textContent = "";
  delete discordSendStatus.dataset.state;
}

function setDiscordBusy(busy) {
  discordBusy = busy;
  if (discordWebhookName) discordWebhookName.disabled = busy;
  if (discordWebhookUrl) discordWebhookUrl.disabled = busy;
  const hasSelection = Boolean(getEditingDiscordWebhook());
  if (discordSaveConnectionButton) {
    discordSaveConnectionButton.disabled = busy;
    discordSaveConnectionButton.setAttribute("aria-busy", String(busy));
  }
  if (discordTestButton) discordTestButton.disabled = busy || !hasSelection;
  if (discordDisconnectButton) discordDisconnectButton.disabled = busy || !hasSelection;
  if (discordNewRuleButton) {
    const ruleCount = discordIntegration?.rules?.length || 0;
    const maxRules = Number(discordIntegration?.limits?.rules) || 20;
    discordNewRuleButton.disabled = busy || discordCreatingWebhook || !hasSelection || ruleCount >= maxRules;
  }
  if (discordNewWebhookButton) {
    const webhooks = Array.isArray(discordIntegration?.webhooks) ? discordIntegration.webhooks : [];
    const maxWebhooks = Number(discordIntegration?.limits?.webhooks) || 10;
    discordNewWebhookButton.disabled = busy || discordCreatingWebhook || !selectedUniverseId || webhooks.length >= maxWebhooks;
  }
  for (const button of discordWebhookCatalog?.querySelectorAll("[data-discord-webhook-id]") || []) {
    button.disabled = busy;
  }
}

async function loadDiscordIntegration() {
  if (!authenticated || !selectedUniverseId || !discordRuleList) {
    discordIntegration = null;
    renderDiscordIntegration();
    return;
  }
  const requestSequence = ++discordIntegrationRequestSequence;
  const universeId = selectedUniverseId;
  if (discordRulesStatus) {
    discordRulesStatus.textContent = "Loading alerts...";
    delete discordRulesStatus.dataset.state;
  }
  try {
    const payload = await request(`/api/integrations/discord?universeId=${encodeURIComponent(universeId)}`);
    if (requestSequence !== discordIntegrationRequestSequence || universeId !== selectedUniverseId) return;
    discordIntegration = payload;
    discordEditingWebhookId = payload?.connection?.selectedWebhookId || "";
    discordCreatingWebhook = !(payload?.webhooks?.length);
    if (discordCreatingWebhook) discordConnectionForm?.reset();
    renderDiscordIntegration();
    if (discordRulesStatus) discordRulesStatus.textContent = "";
  } catch (error) {
    handleAuthError(error);
    if (!authenticated || requestSequence !== discordIntegrationRequestSequence) return;
    discordIntegration = null;
    renderDiscordIntegration();
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "error";
      discordRulesStatus.textContent = formatRequestError(error);
    }
  }
}

async function saveDiscordConnection() {
  if (!authenticated || discordBusy || !selectedUniverseId || !discordConnectionForm) return;
  if (!discordConnectionForm.reportValidity()) return;
  setDiscordBusy(true);
  if (discordSendStatus) {
    discordSendStatus.dataset.state = "sending";
    discordSendStatus.textContent = "Saving webhook...";
  }
  try {
    const payload = await request("/api/integrations/discord/connection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universeId: selectedUniverseId,
        webhookId: "",
        name: String(discordWebhookName?.value || "").trim(),
        webhookUrl: String(discordWebhookUrl?.value || "").trim(),
      }),
    });
    discordIntegration = payload;
    discordEditingWebhookId = payload?.connection?.selectedWebhookId || "";
    discordCreatingWebhook = false;
    if (discordWebhookUrl) discordWebhookUrl.value = "";
    renderDiscordIntegration();
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "success";
      discordRulesStatus.textContent = "Webhook added.";
    }
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    if (discordSendStatus) {
      discordSendStatus.dataset.state = "error";
      discordSendStatus.textContent = formatRequestError(error);
    }
  } finally {
    setDiscordBusy(false);
  }
}

async function testDiscordConnection() {
  const webhook = getEditingDiscordWebhook();
  if (!authenticated || discordBusy || !selectedUniverseId || !webhook) return;
  setDiscordBusy(true);
  if (discordRulesStatus) {
    discordRulesStatus.dataset.state = "sending";
    discordRulesStatus.textContent = "Sending test alert...";
  }
  try {
    await request("/api/integrations/discord/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universeId: selectedUniverseId, webhookId: webhook.id }),
    });
    await loadDiscordIntegration();
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "success";
      discordRulesStatus.textContent = "Test alert delivered.";
    }
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "error";
      discordRulesStatus.textContent = formatRequestError(error);
    }
  } finally {
    setDiscordBusy(false);
  }
}

async function disconnectDiscordConnection() {
  const webhook = getEditingDiscordWebhook();
  if (!authenticated || discordBusy || !selectedUniverseId || !webhook) return;
  const confirmed = await showEventConfirmation({
    title: `Delete ${webhook.name}?`,
    description: "Rules using this webhook will be paused until you choose another delivery webhook.",
    actionLabel: "Delete webhook",
    tone: "danger",
  });
  if (!confirmed) return;
  setDiscordBusy(true);
  try {
    discordIntegration = await request(`/api/integrations/discord/connection?universeId=${encodeURIComponent(selectedUniverseId)}&webhookId=${encodeURIComponent(webhook.id)}`, {
      method: "DELETE",
    });
    discordEditingWebhookId = discordIntegration?.connection?.selectedWebhookId || "";
    renderDiscordIntegration();
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "success";
      discordRulesStatus.textContent = "Webhook deleted.";
    }
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "error";
      discordRulesStatus.textContent = formatRequestError(error);
    }
  } finally {
    setDiscordBusy(false);
  }
}

async function selectDiscordWebhook(value) {
  const webhookId = String(value || "");
  if (webhookId === discordEditingWebhookId && !discordCreatingWebhook) return;
  discordEditingWebhookId = webhookId;
  discordCreatingWebhook = false;
  closeDiscordRuleEditor();
  clearDiscordSendStatus();
  renderDiscordConnectionEditor();
  if (!webhookId) {
    return;
  }
  if (!authenticated || discordBusy || !selectedUniverseId) return;
  setDiscordBusy(true);
  try {
    discordIntegration = await request("/api/integrations/discord/connection/select", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universeId: selectedUniverseId, webhookId }),
    });
    discordEditingWebhookId = discordIntegration?.connection?.selectedWebhookId || webhookId;
    renderDiscordIntegration();
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "error";
      discordRulesStatus.textContent = formatRequestError(error);
    }
    discordEditingWebhookId = discordIntegration?.connection?.selectedWebhookId || "";
    renderDiscordConnectionEditor();
  } finally {
    setDiscordBusy(false);
  }
}

function startNewDiscordWebhook() {
  if (discordBusy || !selectedUniverseId) return;
  const webhooks = Array.isArray(discordIntegration?.webhooks) ? discordIntegration.webhooks : [];
  const maxWebhooks = Number(discordIntegration?.limits?.webhooks) || 10;
  if (webhooks.length >= maxWebhooks) return;
  discordCreatingWebhook = true;
  discordConnectionForm?.reset();
  clearDiscordSendStatus();
  renderDiscordConnectionEditor();
  discordWebhookName?.focus();
}

function cancelNewDiscordWebhook() {
  discordCreatingWebhook = false;
  discordConnectionForm?.reset();
  clearDiscordSendStatus();
  renderDiscordConnectionEditor();
  discordNewWebhookButton?.focus({ preventScroll: true });
}

function handleDiscordWebhookCatalogClick(event) {
  const button = event.target.closest("[data-discord-webhook-id]");
  if (!button || button.disabled) return;
  selectDiscordWebhook(button.dataset.discordWebhookId || "");
}

function getEditingDiscordWebhook() {
  return discordIntegration?.webhooks?.find((webhook) => webhook.id === discordEditingWebhookId) || null;
}

function getDiscordPageHeading() {
  if (discordCreatingWebhook) return "Create webhook";
  return getEditingDiscordWebhook()?.name || "Discord Alerts";
}

function renderDiscordIntegration() {
  const rules = Array.isArray(discordIntegration?.rules) ? discordIntegration.rules : [];
  const maxRules = Number(discordIntegration?.limits?.rules) || 20;
  renderDiscordConnectionEditor();
  const selectedWebhook = getEditingDiscordWebhook();
  const visibleRules = selectedWebhook
    ? rules.filter((rule) => rule.webhookId === selectedWebhook.id)
    : [];
  if (discordNewRuleButton) {
    discordNewRuleButton.disabled = discordBusy || discordCreatingWebhook || !selectedWebhook || rules.length >= maxRules;
  }
  if (discordRuleCount) discordRuleCount.textContent = `${visibleRules.length} / ${maxRules}`;
  if (!discordRuleList) return;
  if (!selectedUniverseId) {
    discordRuleList.innerHTML = `
      <div class="discordRuleEmpty">
        <strong>Select a universe</strong>
        <span>Discord alerts are configured separately for each game.</span>
      </div>
    `;
  } else if (!selectedWebhook) {
    discordRuleList.innerHTML = `
      <div class="discordRuleEmpty">
        <strong>Select or create a webhook</strong>
        <span>Its alert rules will appear here.</span>
      </div>
    `;
  } else if (!visibleRules.length) {
    discordRuleList.innerHTML = `
      <div class="discordRuleEmpty">
        <strong>No alert rules for ${escapeHtml(selectedWebhook.name)}</strong>
        <span>Create an event condition or schedule a one-time alert.</span>
      </div>
    `;
  } else {
    discordRuleList.innerHTML = visibleRules.map(renderDiscordRuleRow).join("");
  }
  setDiscordBusy(discordBusy);
}

function renderDiscordConnectionEditor() {
  const webhooks = Array.isArray(discordIntegration?.webhooks) ? discordIntegration.webhooks : [];
  const maxWebhooks = Number(discordIntegration?.limits?.webhooks) || 10;
  const atWebhookLimit = webhooks.length >= maxWebhooks;
  if (discordEditingWebhookId && !webhooks.some((webhook) => webhook.id === discordEditingWebhookId)) {
    discordEditingWebhookId = discordIntegration?.connection?.selectedWebhookId || webhooks[0]?.id || "";
  }
  const selectedWebhook = getEditingDiscordWebhook();
  if (activeView === "discord" && pageTitle) pageTitle.textContent = getDiscordPageHeading();
  if (discordWebhookBuilder) discordWebhookBuilder.hidden = !discordCreatingWebhook;
  if (discordRulesPanel) discordRulesPanel.hidden = discordCreatingWebhook;
  if (discordTopbarActions) {
    discordTopbarActions.hidden = activeView !== "discord" || discordCreatingWebhook || !selectedWebhook;
  }
  if (discordWebhookCatalog) {
    discordWebhookCatalog.innerHTML = webhooks.length
      ? webhooks.map((webhook) => {
          const isActive = !discordCreatingWebhook && webhook.id === selectedWebhook?.id;
          return `
            <button
              class="eventCatalogItem discordWebhookCatalogItem ${isActive ? "active" : ""}"
              type="button"
              data-discord-webhook-id="${escapeHtml(webhook.id)}"
              title="${escapeHtml(webhook.name)}"
              ${isActive ? 'aria-current="true"' : ""}
              ${discordBusy ? "disabled" : ""}
            ><span>${escapeHtml(webhook.name)}</span></button>
          `;
        }).join("")
      : '<p class="discordWebhookCatalogEmpty">No saved webhooks</p>';
  }
  if (discordWebhookCatalogStatus) {
    discordWebhookCatalogStatus.textContent = webhooks.length
      ? `${webhooks.length} saved webhook${webhooks.length === 1 ? "" : "s"}.`
      : "No saved webhooks.";
  }
  if (discordWebhookEditorTitle) {
    discordWebhookEditorTitle.textContent = "Create webhook";
  }
  if (discordNewWebhookButton) {
    discordNewWebhookButton.disabled = discordBusy || discordCreatingWebhook || !selectedUniverseId || atWebhookLimit;
    discordNewWebhookButton.title = atWebhookLimit ? `Webhook limit reached (${maxWebhooks})` : "";
  }
  if (discordWebhookUrl) {
    discordWebhookUrl.required = true;
    discordWebhookUrl.placeholder = "https://discord.com/api/webhooks/...";
  }
  const note = document.querySelector("#discordWebhookNote");
  if (note) note.textContent = "Encrypted before it is saved.";
  if (discordSaveConnectionButton) {
    const label = discordSaveConnectionButton.querySelector("span");
    if (label) label.textContent = "Add webhook";
  }
  if (discordTestButton) discordTestButton.disabled = discordBusy || discordCreatingWebhook || !selectedWebhook;
  if (discordDisconnectButton) {
    discordDisconnectButton.hidden = false;
    discordDisconnectButton.disabled = discordBusy || discordCreatingWebhook || !selectedWebhook;
  }
}

function renderDiscordRuleRow(rule) {
  const isScheduled = rule.triggerType === "schedule";
  const operatorLabel = rule.operator === "at_most" ? "At most" : "At least";
  const windowLabel = formatDiscordAlertWindow(rule.windowMinutes);
  const scheduleComplete = Boolean(rule.scheduleDeliveredAt);
  return `
    <article class="discordRuleRow" data-discord-rule-id="${escapeHtml(rule.id)}">
      <div class="discordRuleIdentity">
        <strong>${escapeHtml(rule.name)}</strong>
      </div>
      <div class="discordRuleCondition">
        <strong>${isScheduled
          ? escapeHtml(formatEasternDateTime(rule.scheduledFor))
          : `${escapeHtml(operatorLabel)} ${escapeHtml(formatCompactNumber(rule.threshold))} in ${escapeHtml(windowLabel)}`}</strong>
        ${rule.lastError
          ? `<span data-state="error">${escapeHtml(rule.lastError)}</span>`
          : isScheduled
            ? `<span>Eastern Standard Time · ${scheduleComplete ? "Completed" : "Sends once"}</span>`
            : `<span>${escapeHtml(formatEventName(rule.eventName))}</span>`}
      </div>
      <div class="discordRuleMetric">
        <strong>${escapeHtml(isScheduled ? "—" : formatCompactNumber(rule.currentCount || 0))}</strong>
      </div>
      <div class="discordRuleMetric">
        <strong>${escapeHtml(isScheduled ? "—" : formatDiscordAlertWindow(rule.cooldownMinutes))}</strong>
      </div>
      <div class="discordRuleActions">
        <button class="discordRuleToggle" type="button" data-discord-rule-action="toggle" aria-label="${rule.enabled ? "Pause" : "Enable"} ${escapeHtml(rule.name)}" aria-pressed="${rule.enabled ? "true" : "false"}" ${scheduleComplete ? "disabled" : ""}></button>
        <button class="button secondary compact" type="button" data-discord-rule-action="edit">Edit</button>
        <button class="button secondary compact danger" type="button" data-discord-rule-action="delete">Delete</button>
      </div>
    </article>
  `;
}

function formatDiscordAlertWindow(value) {
  const minutes = Number(value) || 0;
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} hr`;
  return `${minutes / 1440} day`;
}

function getEasternDateTimeParts(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value) || value <= 0) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function formatEasternDateTimeInput(timestamp) {
  const parts = getEasternDateTimeParts(timestamp);
  if (!parts) return "";
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function formatEasternDateInput(timestamp) {
  return formatEasternDateTimeInput(timestamp).split("T")[0] || "";
}

function formatEasternTimeInput(timestamp) {
  return formatEasternDateTimeInput(timestamp).split("T")[1] || "";
}

function formatEasternDateTime(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value) || value <= 0) return "Choose a time";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function easternDateTimeInputToTimestamp(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const desiredAsUtc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
  let timestamp = desiredAsUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getEasternDateTimeParts(timestamp);
    if (!parts) return 0;
    const displayedAsUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    timestamp += desiredAsUtc - displayedAsUtc;
  }
  return formatEasternDateTimeInput(timestamp) === String(value) ? timestamp : 0;
}

function getDiscordScheduledInputTimestamp() {
  const date = String(discordRuleScheduleDate?.value || "");
  const time = String(discordRuleScheduleTime?.value || "");
  return easternDateTimeInputToTimestamp(date && time ? `${date}T${time}` : "");
}

function getRobloxLiveScheduledInputTimestamp() {
  const date = String(robloxLiveRuleScheduleDate?.value || "");
  const time = String(robloxLiveRuleScheduleTime?.value || "");
  return easternDateTimeInputToTimestamp(date && time ? `${date}T${time}` : "");
}

function openDiscordRuleEditor(rule = null) {
  const selectedWebhook = getEditingDiscordWebhook();
  if (!discordRuleDialog || !selectedWebhook) return;
  const eventNames = [...new Set([
    ...(discordIntegration.eventNames || []),
    ...(rule?.eventName ? [rule.eventName] : []),
  ])].filter(Boolean);
  if (discordRuleEvent) {
    discordRuleEvent.innerHTML = eventNames
      .map((eventName) => `<option value="${escapeHtml(eventName)}">${escapeHtml(formatEventName(eventName))} · ${escapeHtml(eventName)}</option>`)
      .join("");
  }
  if (discordRuleId) discordRuleId.value = rule?.id || "";
  if (discordRuleName) discordRuleName.value = rule?.name || "";
  if (discordRuleEvent) discordRuleEvent.value = rule?.eventName || eventNames[0] || "";
  if (discordRuleTriggerType) discordRuleTriggerType.value = rule?.triggerType === "schedule" ? "schedule" : "event_count";
  if (discordRuleOperator) discordRuleOperator.value = rule?.operator || "at_least";
  if (discordRuleThreshold) discordRuleThreshold.value = String(rule?.threshold ?? 10);
  if (discordRuleWindow) discordRuleWindow.value = String(rule?.windowMinutes || 15);
  if (discordRuleCooldown) discordRuleCooldown.value = String(rule?.cooldownMinutes || 60);
  if (discordRuleScheduleDate && discordRuleScheduleTime) {
    const earliest = Math.ceil((Date.now() + 60_000) / 60_000) * 60_000;
    const defaultTime = Math.ceil((Date.now() + 60 * 60_000) / 60_000) * 60_000;
    discordRuleScheduleDate.min = formatEasternDateInput(earliest);
    discordRuleScheduleDate.value = formatEasternDateInput(rule?.scheduledFor || defaultTime);
    discordRuleScheduleTime.value = formatEasternTimeInput(rule?.scheduledFor || defaultTime);
    discordRuleScheduleDate.setCustomValidity("");
    discordRuleScheduleTime.setCustomValidity("");
  }
  if (discordRuleMessage) discordRuleMessage.value = rule?.messageTemplate || "";
  if (discordRuleDialogTitle) discordRuleDialogTitle.textContent = rule ? "Edit alert" : "New alert";
  if (discordRuleSaveButton) discordRuleSaveButton.textContent = rule ? "Save changes" : "Save alert";
  if (discordRuleFormStatus) {
    discordRuleFormStatus.textContent = "";
    delete discordRuleFormStatus.dataset.state;
  }
  discordRuleDialog.hidden = false;
  syncDiscordRuleTriggerFields();
  updateDiscordRulePreview();
  window.setTimeout(() => discordRuleName?.focus(), 0);
}

function closeDiscordRuleEditor() {
  if (!discordRuleDialog || discordRuleDialog.hidden) return;
  discordRuleDialog.hidden = true;
  setDiscordRuleFormBusy(false);
}

function handleDiscordRuleDialogKeydown(event) {
  if (event.key === "Escape" && discordRuleDialog && !discordRuleDialog.hidden) closeDiscordRuleEditor();
}

function syncDiscordRuleTriggerFields() {
  const isScheduled = discordRuleTriggerType?.value === "schedule";
  if (discordRuleEventFields) discordRuleEventFields.hidden = isScheduled;
  if (discordRuleScheduleFields) discordRuleScheduleFields.hidden = !isScheduled;
  if (discordRuleEvent) discordRuleEvent.required = !isScheduled;
  for (const input of [discordRuleScheduleDate, discordRuleScheduleTime]) {
    if (!input) continue;
    input.required = isScheduled;
    if (!isScheduled) input.setCustomValidity("");
  }
  if (discordRuleMessage) {
    discordRuleMessage.placeholder = isScheduled
      ? "The live event starts now."
      : "{{event}} reached {{count}} in {{window}}.";
  }
  if (discordRuleMessageHelp) {
    discordRuleMessageHelp.textContent = isScheduled
      ? "Available: {{game}}, {{scheduled_time}}"
      : "Available: {{game}}, {{event}}, {{event_key}}, {{count}}, {{threshold}}, {{window}}";
  }
  updateDiscordRulePreview();
}

function formatDiscordPreviewTimestamp(timestamp = Date.now()) {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
  return `Today at ${time}`;
}

function updateDiscordRulePreview() {
  const isScheduled = discordRuleTriggerType?.value === "schedule";
  const operator = discordRuleOperator?.value === "at_most" ? "At most" : "At least";
  const minimum = operator === "At most" ? 0 : 1;
  if (discordRuleThreshold) discordRuleThreshold.min = String(minimum);
  const threshold = Math.max(minimum, Number(discordRuleThreshold?.value) || minimum);
  const eventName = String(discordRuleEvent?.value || "");
  const eventLabel = formatEventName(eventName || "tracked_event");
  const windowLabel = formatDiscordAlertWindow(discordRuleWindow?.value);
  const scheduledFor = getDiscordScheduledInputTimestamp();
  const scheduledTimeLabel = formatEasternDateTime(scheduledFor);
  const title = String(discordRuleName?.value || "").trim() || (isScheduled ? "Scheduled alert" : `${eventLabel} alert`);
  const template = String(discordRuleMessage?.value || "");
  const selectedWebhook = getEditingDiscordWebhook();
  const editingRuleId = String(discordRuleId?.value || "");
  const editingRule = discordIntegration?.rules?.find((rule) => rule.id === editingRuleId);
  const editingRuleCount = Number(editingRule?.currentCount);
  const observedCount = Number.isFinite(editingRuleCount)
    ? Math.max(0, editingRuleCount)
    : threshold;
  const sampleValues = {
    game: knownUniverses.find((universe) => String(universe.id) === selectedUniverseId)?.name || "Selected universe",
    event: eventLabel,
    event_key: eventName,
    count: observedCount.toLocaleString(),
    threshold: String(threshold),
    window: windowLabel,
    scheduled_time: scheduledTimeLabel,
  };
  const previewMessage = template
    ? template.replace(/\{\{(game|event|event_key|count|threshold|window|scheduled_time)\}\}/g, (_, key) => sampleValues[key])
    : "";
  const previewFields = isScheduled
    ? [
        { name: "Universe", value: sampleValues.game },
        { name: "Webhook", value: selectedWebhook?.name || "Selected webhook" },
        { name: "Scheduled time", value: `${scheduledTimeLabel}\nEastern Standard Time` },
      ]
    : [
        { name: "Universe", value: sampleValues.game },
        { name: "Webhook", value: selectedWebhook?.name || "Selected webhook" },
        { name: "Event", value: `${eventLabel}\n\`${eventName || "tracked_event"}\`` },
        { name: "Observed", value: `${observedCount.toLocaleString()} / ${windowLabel}` },
        { name: "Rule", value: `${operator} ${threshold.toLocaleString()}` },
      ];
  const previewTimestamp = formatDiscordPreviewTimestamp();
  if (discordAlertPreviewEmbed) {
    discordAlertPreviewEmbed.style.setProperty(
      "--discord-embed-color",
      !isScheduled && discordRuleOperator?.value === "at_most" ? "#ffb52e" : "#7c3cff",
    );
  }
  if (discordAlertPreviewTitle) discordAlertPreviewTitle.textContent = title;
  if (discordAlertPreviewMessage) {
    discordAlertPreviewMessage.textContent = previewMessage;
    discordAlertPreviewMessage.hidden = !previewMessage;
  }
  if (discordAlertPreviewFields) {
    discordAlertPreviewFields.innerHTML = previewFields.map((field) => {
      const value = escapeHtml(field.value)
        .replace(/\n/g, "<br>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
      return `
        <div class="discordAlertPreviewField">
          <strong>${escapeHtml(field.name)}</strong>
          <span>${value}</span>
        </div>
      `;
    }).join("");
  }
  if (discordPreviewMessageTime) discordPreviewMessageTime.textContent = previewTimestamp;
  if (discordPreviewEmbedTime) discordPreviewEmbedTime.textContent = previewTimestamp;
  if (discordRuleMessageCount) discordRuleMessageCount.textContent = `${template.length.toLocaleString()} / 500`;
}

async function handleDiscordRuleListClick(event) {
  const actionButton = event.target.closest("[data-discord-rule-action]");
  const row = actionButton?.closest("[data-discord-rule-id]");
  const rule = discordIntegration?.rules?.find((entry) => entry.id === row?.dataset.discordRuleId);
  if (!actionButton || !rule || discordBusy) return;
  const action = actionButton.dataset.discordRuleAction;
  if (action === "edit") {
    openDiscordRuleEditor(rule);
  } else if (action === "toggle") {
    await updateDiscordAlertRule(rule, { enabled: !rule.enabled });
  } else if (action === "delete") {
    const confirmed = await showEventConfirmation({
      title: `Delete ${rule.name}?`,
      description: "This Discord alert rule will be removed.",
      actionLabel: "Delete alert",
      tone: "danger",
    });
    if (!confirmed) return;
    await deleteDiscordAlertRule(rule);
  }
}

function getDiscordRulePayload(overrides = {}) {
  const triggerType = discordRuleTriggerType?.value === "schedule" ? "schedule" : "event_count";
  return {
    universeId: selectedUniverseId,
    name: String(discordRuleName?.value || "").trim(),
    triggerType,
    eventName: String(discordRuleEvent?.value || ""),
    operator: discordRuleOperator?.value === "at_most" ? "at_most" : "at_least",
    threshold: Number(discordRuleThreshold?.value),
    windowMinutes: Number(discordRuleWindow?.value),
    cooldownMinutes: Number(discordRuleCooldown?.value),
    scheduledFor: triggerType === "schedule"
      ? getDiscordScheduledInputTimestamp()
      : null,
    webhookId: getEditingDiscordWebhook()?.id || "",
    messageTemplate: String(discordRuleMessage?.value || "").trim(),
    ...overrides,
  };
}

async function saveDiscordAlertRule() {
  if (!authenticated || discordBusy || !selectedUniverseId || !discordRuleForm) return;
  if (discordRuleTriggerType?.value === "schedule" && discordRuleScheduleDate && discordRuleScheduleTime) {
    const scheduledFor = getDiscordScheduledInputTimestamp();
    const validityMessage = scheduledFor > Date.now() ? "" : "Choose a future Eastern Time.";
    discordRuleScheduleDate.setCustomValidity(validityMessage);
    discordRuleScheduleTime.setCustomValidity(validityMessage);
  }
  if (!discordRuleForm.reportValidity()) return;
  const id = String(discordRuleId?.value || "");
  setDiscordRuleFormBusy(true);
  try {
    discordIntegration = await request(id
      ? `/api/integrations/discord/rules/${encodeURIComponent(id)}`
      : "/api/integrations/discord/rules", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getDiscordRulePayload()),
    });
    closeDiscordRuleEditor();
    renderDiscordIntegration();
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "success";
      discordRulesStatus.textContent = id ? "Alert updated." : "Alert created.";
    }
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    if (discordRuleFormStatus) {
      discordRuleFormStatus.dataset.state = "error";
      discordRuleFormStatus.textContent = formatRequestError(error);
    }
  } finally {
    setDiscordRuleFormBusy(false);
  }
}

async function updateDiscordAlertRule(rule, overrides) {
  setDiscordBusy(true);
  try {
    discordIntegration = await request(`/api/integrations/discord/rules/${encodeURIComponent(rule.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universeId: selectedUniverseId,
        name: rule.name,
        triggerType: rule.triggerType,
        eventName: rule.eventName,
        operator: rule.operator,
        threshold: rule.threshold,
        windowMinutes: rule.windowMinutes,
        cooldownMinutes: rule.cooldownMinutes,
        scheduledFor: rule.scheduledFor,
        webhookId: rule.webhookId,
        messageTemplate: rule.messageTemplate,
        enabled: rule.enabled,
        ...overrides,
      }),
    });
    renderDiscordIntegration();
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "error";
      discordRulesStatus.textContent = formatRequestError(error);
    }
  } finally {
    setDiscordBusy(false);
  }
}

async function deleteDiscordAlertRule(rule) {
  setDiscordBusy(true);
  try {
    discordIntegration = await request(`/api/integrations/discord/rules/${encodeURIComponent(rule.id)}?universeId=${encodeURIComponent(selectedUniverseId)}`, {
      method: "DELETE",
    });
    renderDiscordIntegration();
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "success";
      discordRulesStatus.textContent = "Alert deleted.";
    }
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    if (discordRulesStatus) {
      discordRulesStatus.dataset.state = "error";
      discordRulesStatus.textContent = formatRequestError(error);
    }
  } finally {
    setDiscordBusy(false);
  }
}

function setDiscordRuleFormBusy(busy) {
  if (!discordRuleForm) return;
  for (const element of discordRuleForm.elements) element.disabled = busy;
  if (discordRuleSaveButton) {
    discordRuleSaveButton.setAttribute("aria-busy", String(busy));
    if (busy) discordRuleSaveButton.textContent = "Saving...";
    else discordRuleSaveButton.textContent = discordRuleId?.value ? "Save changes" : "Save alert";
  }
}

function setRobloxLiveStatus(message = "", state = "") {
  if (!robloxLiveStatus) return;
  robloxLiveStatus.textContent = message;
  if (state) robloxLiveStatus.dataset.state = state;
  else delete robloxLiveStatus.dataset.state;
}

function setRobloxLiveBusy(busy) {
  robloxLiveBusy = busy;
  const connected = Boolean(robloxLiveIntegration?.connection?.connected);
  if (robloxLiveAuthorizeButton) robloxLiveAuthorizeButton.disabled = busy;
  if (robloxLiveDisconnectButton) robloxLiveDisconnectButton.disabled = busy || !connected;
  if (robloxLiveNewRuleButton) {
    const ruleCount = robloxLiveIntegration?.rules?.length || 0;
    const maxRules = Number(robloxLiveIntegration?.limits?.rules) || 20;
    robloxLiveNewRuleButton.disabled = busy || !connected || ruleCount >= maxRules;
  }
}

async function loadRobloxLiveIntegration(options = {}) {
  if (!authenticated || !selectedUniverseId || !robloxLiveRuleList) {
    robloxLiveIntegration = null;
    renderRobloxLiveIntegration();
    return;
  }
  const sequence = ++robloxLiveIntegrationRequestSequence;
  if (!options.background) setRobloxLiveStatus("Loading live actions...", "sending");
  try {
    const universeId = selectedUniverseId;
    const payload = await request(`/api/integrations/roblox-live?universeId=${encodeURIComponent(universeId)}`);
    if (sequence !== robloxLiveIntegrationRequestSequence || universeId !== selectedUniverseId) return;
    robloxLiveIntegration = payload;
    renderRobloxLiveIntegration();
    if (!options.background) setRobloxLiveStatus("");
  } catch (error) {
    handleAuthError(error);
    if (!authenticated || sequence !== robloxLiveIntegrationRequestSequence) return;
    if (!options.background) {
      robloxLiveIntegration = null;
      renderRobloxLiveIntegration();
      setRobloxLiveStatus(error.status === 403 ? "" : formatRequestError(error), "error");
    }
  }
}

function authorizeRobloxLiveActions() {
  if (!authenticated || robloxLiveBusy || !selectedUniverseId) return;
  setRobloxLiveStatus("Opening Roblox authorization...", "sending");
  window.location.href = `/api/integrations/roblox-live/oauth/start?universeId=${encodeURIComponent(selectedUniverseId)}`;
}

async function disconnectRobloxLiveActions() {
  if (
    !authenticated
    || robloxLiveBusy
    || !selectedUniverseId
    || !robloxLiveIntegration?.connection?.connected
  ) return;
  const confirmed = await showEventConfirmation({
    title: "Disconnect Roblox live actions?",
    description: "Rules stay saved, but publishing stops until you authorize Roblox again.",
    actionLabel: "Disconnect",
    tone: "danger",
  });
  if (!confirmed) return;
  setRobloxLiveBusy(true);
  setRobloxLiveStatus("Revoking Roblox authorization...", "sending");
  try {
    robloxLiveIntegration = await request(
      `/api/integrations/roblox-live/oauth?universeId=${encodeURIComponent(selectedUniverseId)}`,
      { method: "DELETE" },
    );
    renderRobloxLiveIntegration();
    setRobloxLiveStatus("");
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    setRobloxLiveStatus(formatRequestError(error), "error");
  } finally {
    setRobloxLiveBusy(false);
  }
}

function renderRobloxLiveIntegration() {
  const connection = robloxLiveIntegration?.connection || {};
  const rules = Array.isArray(robloxLiveIntegration?.rules) ? robloxLiveIntegration.rules : [];
  const deliveries = Array.isArray(robloxLiveIntegration?.deliveries) ? robloxLiveIntegration.deliveries : [];
  const connected = Boolean(connection.connected);
  const authorizationError = connection.authorizationValid === false && Boolean(connection.connectedAt);
  if (robloxLiveAuthorization) {
    robloxLiveAuthorization.dataset.state = authorizationError
      ? "error"
      : connected
        ? "connected"
        : "disconnected";
  }
  if (robloxLiveAuthorizationAlert) {
    robloxLiveAuthorizationAlert.hidden = connected && !authorizationError;
  }
  if (robloxLiveAuthorizationTitle) {
    robloxLiveAuthorizationTitle.textContent = authorizationError
      ? "MessagingService authorization expired"
      : connected
        ? `Connected as ${connection.robloxUsername || "Roblox user"}`
        : "Authorize MessagingService";
  }
  if (robloxLiveAuthorizationCopy) {
    robloxLiveAuthorizationCopy.textContent = authorizationError
      ? "Authorize again to resume publishing actions."
      : connected
        ? "MessagingService publishing is authorized for this universe."
        : "Required to publish actions to this universe.";
  }
  if (robloxLiveAuthorizeButton) {
    robloxLiveAuthorizeButton.hidden = connected && !authorizationError;
    robloxLiveAuthorizeButton.textContent = "Authorize Roblox";
  }
  if (robloxLiveDisconnectButton) {
    robloxLiveDisconnectButton.hidden = !connected;
  }
  if (robloxLiveRuleCount) {
    robloxLiveRuleCount.textContent = `${rules.length} / ${Number(robloxLiveIntegration?.limits?.rules) || 20}`;
  }
  if (robloxLiveRuleList) {
    if (!selectedUniverseId) {
      robloxLiveRuleList.innerHTML = `<div class="robloxLiveEmpty"><strong>Select a universe</strong><span>Live actions are configured per universe.</span></div>`;
    } else if (!connected) {
      robloxLiveRuleList.innerHTML = `<div class="robloxLiveEmpty"><strong>Authorize Roblox to create live actions</strong><span>Only action keys registered by your server can run.</span></div>`;
    } else if (!rules.length) {
      robloxLiveRuleList.innerHTML = `<div class="robloxLiveEmpty"><strong>No action rules</strong><span>Create an analytics requirement or repeating schedule.</span></div>`;
    } else {
      robloxLiveRuleList.innerHTML = rules.map(renderRobloxLiveRuleRow).join("");
    }
  }
  if (robloxLiveDeliveryList) {
    robloxLiveDeliveryList.innerHTML = deliveries.length
      ? deliveries.map(renderRobloxLiveDeliveryRow).join("")
      : `<div class="robloxLiveEmpty"><strong>No deliveries</strong></div>`;
  }
  if (connection.lastError) setRobloxLiveStatus(connection.lastError, "error");
  setRobloxLiveBusy(robloxLiveBusy);
}

function renderRobloxLiveRuleRow(rule) {
  const isRepeating = rule.triggerType === "schedule";
  const isOneTime = rule.triggerType === "schedule_once";
  const isScheduled = isRepeating || isOneTime;
  const isCompleted = isOneTime && Boolean(rule.scheduleDeliveredAt);
  const requirement = isOneTime
    ? formatEasternDateTime(rule.scheduledFor)
    : isRepeating
      ? `Every ${formatRobloxLiveInterval(rule.scheduleIntervalMinutes)}`
      : `${rule.operator === "at_most" ? "At most" : "At least"} ${formatCompactNumber(rule.threshold)} in ${formatRobloxLiveInterval(rule.windowMinutes)}`;
  const conditionDetail = rule.lastError
    ? `<span data-state="error">${escapeHtml(rule.lastError)}</span>`
    : isRepeating
      ? `<span>${rule.nextRunAt ? `Next run ${escapeHtml(formatRelativeTime(rule.nextRunAt))}` : "Waiting to schedule"}</span>`
      : isOneTime
        ? `<span>${rule.scheduleDeliveredAt ? "Sent" : "Eastern Standard Time"}</span>`
        : `<span>${escapeHtml(formatEventName(rule.eventName))}</span>`;
  return `
    <article class="robloxLiveRuleRow" data-roblox-live-rule-id="${escapeHtml(rule.id)}">
      <div class="robloxLiveRuleIdentity"><strong>${escapeHtml(rule.name)}</strong></div>
      <div class="robloxLiveRuleTopic"><code>${escapeHtml(rule.actionKey)}</code></div>
      <div class="robloxLiveRuleCondition"><strong>${escapeHtml(requirement)}</strong>${conditionDetail}</div>
      <div class="robloxLiveRuleMetric"><strong>${isScheduled ? "—" : escapeHtml(formatCompactNumber(rule.currentCount || 0))}</strong></div>
      <div class="robloxLiveRuleMetric"><strong>${isScheduled ? "—" : escapeHtml(formatRobloxLiveInterval(rule.cooldownMinutes))}</strong></div>
      <div class="robloxLiveRuleActions">
        <button class="robloxLiveRuleToggle" type="button" data-roblox-live-action="toggle" aria-label="${isCompleted ? "Completed" : rule.enabled ? "Pause" : "Enable"} ${escapeHtml(rule.name)}" aria-pressed="${rule.enabled ? "true" : "false"}"${isCompleted ? " disabled" : ""}></button>
        <button class="button secondary compact" type="button" data-roblox-live-action="run">Run now</button>
        <button class="button secondary compact" type="button" data-roblox-live-action="edit">Edit</button>
        <button class="button secondary compact danger" type="button" data-roblox-live-action="delete">Delete</button>
      </div>
    </article>`;
}

function renderRobloxLiveDeliveryRow(delivery) {
  const status = delivery.status === "failed" ? "failed" : "published";
  const trigger = delivery.trigger === "manual"
    ? "Manual"
    : delivery.trigger === "schedule_once"
      ? "Scheduled once"
      : delivery.trigger === "schedule"
        ? "Repeating schedule"
      : "Event";
  return `
    <article class="robloxLiveDeliveryRow">
      <div class="robloxLiveDeliveryCell"><strong>${escapeHtml(delivery.title || delivery.actionKey)}</strong></div>
      <div class="robloxLiveDeliveryKey"><code>${escapeHtml(delivery.actionKey)}</code></div>
      <div class="robloxLiveDeliveryCell"><strong>${trigger}</strong></div>
      <div class="robloxLiveDeliveryCell"><strong>${delivery.sentAt ? escapeHtml(formatRelativeTime(delivery.sentAt)) : "Unknown"}</strong></div>
      <div class="robloxLiveDeliveryState">
        <b class="robloxLiveDeliveryStatus" data-state="${status}"${delivery.error ? ` title="${escapeHtml(delivery.error)}"` : ""}>${escapeHtml(formatRobloxLiveDeliveryStatus(status))}</b>
      </div>
    </article>`;
}

function formatRobloxLiveDeliveryStatus(status) {
  if (status === "failed") return "Publish failed";
  return "Published";
}

function formatRobloxLiveInterval(value) {
  const minutes = Number(value) || 0;
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} hr`;
  return `${minutes / 1440} day`;
}

function openRobloxLiveRuleEditor(rule = null) {
  if (!robloxLiveRuleDialog || !robloxLiveIntegration?.connection?.connected) return;
  const eventNames = [...new Set([
    ...(robloxLiveIntegration.eventNames || []),
    ...(rule?.eventName ? [rule.eventName] : []),
  ])].filter(Boolean);
  if (robloxLiveRuleEvent) {
    robloxLiveRuleEvent.innerHTML = eventNames.length
      ? eventNames.map((eventName) => `<option value="${escapeHtml(eventName)}">${escapeHtml(formatEventName(eventName))} · ${escapeHtml(eventName)}</option>`).join("")
      : `<option value="">No tracked events yet</option>`;
  }
  if (robloxLiveRuleId) robloxLiveRuleId.value = rule?.id || "";
  if (robloxLiveRuleName) robloxLiveRuleName.value = rule?.name || "";
  if (robloxLiveRuleTrigger) robloxLiveRuleTrigger.value = rule?.triggerType || "event_count";
  if (robloxLiveRuleEvent) robloxLiveRuleEvent.value = rule?.eventName || eventNames[0] || "";
  if (robloxLiveRuleOperator) robloxLiveRuleOperator.value = rule?.operator || "at_least";
  if (robloxLiveRuleThreshold) robloxLiveRuleThreshold.value = String(rule?.threshold ?? 10);
  if (robloxLiveRuleWindow) robloxLiveRuleWindow.value = String(rule?.windowMinutes || 15);
  if (robloxLiveRuleCooldown) robloxLiveRuleCooldown.value = String(rule?.cooldownMinutes || 60);
  if (robloxLiveRuleSchedule) robloxLiveRuleSchedule.value = String(rule?.scheduleIntervalMinutes || 60);
  if (robloxLiveRuleScheduleDate && robloxLiveRuleScheduleTime) {
    const earliest = Math.ceil((Date.now() + 60_000) / 60_000) * 60_000;
    const defaultTime = Math.ceil((Date.now() + 60 * 60_000) / 60_000) * 60_000;
    robloxLiveRuleScheduleDate.min = formatEasternDateInput(earliest);
    robloxLiveRuleScheduleDate.value = formatEasternDateInput(rule?.scheduledFor || defaultTime);
    robloxLiveRuleScheduleTime.value = formatEasternTimeInput(rule?.scheduledFor || defaultTime);
    robloxLiveRuleScheduleDate.setCustomValidity("");
    robloxLiveRuleScheduleTime.setCustomValidity("");
  }
  if (robloxLiveRuleActionKey) robloxLiveRuleActionKey.value = rule?.actionKey || "";
  if (robloxLiveRuleExpiry) robloxLiveRuleExpiry.value = String(rule?.expiresInSeconds || 60);
  if (robloxLiveRuleParameters) robloxLiveRuleParameters.value = JSON.stringify(rule?.parameters || {}, null, 2);
  if (robloxLiveRuleDialogTitle) robloxLiveRuleDialogTitle.textContent = rule ? "Edit action" : "New action";
  if (robloxLiveRuleSaveButton) robloxLiveRuleSaveButton.textContent = rule ? "Save changes" : "Save action";
  if (robloxLiveRuleFormStatus) {
    robloxLiveRuleFormStatus.textContent = "";
    delete robloxLiveRuleFormStatus.dataset.state;
  }
  syncRobloxLiveRuleTriggerFields();
  syncRobloxLiveRuleThreshold();
  robloxLiveRuleDialog.hidden = false;
  window.setTimeout(() => robloxLiveRuleName?.focus(), 0);
}

function closeRobloxLiveRuleEditor() {
  if (!robloxLiveRuleDialog || robloxLiveRuleDialog.hidden) return;
  robloxLiveRuleDialog.hidden = true;
  setRobloxLiveRuleFormBusy(false);
}

function handleRobloxLiveDialogKeydown(event) {
  if (event.key === "Escape" && robloxLiveRuleDialog && !robloxLiveRuleDialog.hidden) {
    closeRobloxLiveRuleEditor();
  }
}

function syncRobloxLiveRuleTriggerFields() {
  const triggerType = robloxLiveRuleTrigger?.value;
  const isEvent = triggerType === "event_count";
  const isRepeating = triggerType === "schedule";
  const isOneTime = triggerType === "schedule_once";
  if (robloxLiveEventCondition) robloxLiveEventCondition.hidden = !isEvent;
  if (robloxLiveScheduleCondition) robloxLiveScheduleCondition.hidden = !isRepeating;
  if (robloxLiveScheduleOnceCondition) robloxLiveScheduleOnceCondition.hidden = !isOneTime;
  if (robloxLiveRuleEvent) robloxLiveRuleEvent.required = isEvent;
  if (robloxLiveRuleThreshold) robloxLiveRuleThreshold.required = isEvent;
  for (const input of [robloxLiveRuleScheduleDate, robloxLiveRuleScheduleTime]) {
    if (!input) continue;
    input.required = isOneTime;
    if (!isOneTime) input.setCustomValidity("");
  }
}

function syncRobloxLiveRuleThreshold() {
  if (!robloxLiveRuleThreshold) return;
  robloxLiveRuleThreshold.min = robloxLiveRuleOperator?.value === "at_most" ? "0" : "1";
}

function setRobloxLiveRuleFormBusy(busy) {
  for (const control of robloxLiveRuleForm?.elements || []) control.disabled = busy;
  if (robloxLiveRuleCancelButton) robloxLiveRuleCancelButton.disabled = busy;
  if (robloxLiveRuleCloseButton) robloxLiveRuleCloseButton.disabled = busy;
}

function getRobloxLiveRulePayload(rule = null, overrides = {}) {
  return {
    universeId: selectedUniverseId,
    name: rule?.name ?? String(robloxLiveRuleName?.value || "").trim(),
    triggerType: rule?.triggerType ?? robloxLiveRuleTrigger?.value,
    eventName: rule?.eventName ?? String(robloxLiveRuleEvent?.value || ""),
    operator: rule?.operator ?? (robloxLiveRuleOperator?.value === "at_most" ? "at_most" : "at_least"),
    threshold: rule?.threshold ?? Number(robloxLiveRuleThreshold?.value),
    windowMinutes: rule?.windowMinutes ?? Number(robloxLiveRuleWindow?.value),
    cooldownMinutes: rule?.cooldownMinutes ?? Number(robloxLiveRuleCooldown?.value),
    scheduleIntervalMinutes: rule?.scheduleIntervalMinutes ?? Number(robloxLiveRuleSchedule?.value),
    scheduledFor: rule?.scheduledFor ?? getRobloxLiveScheduledInputTimestamp(),
    actionKey: rule?.actionKey ?? String(robloxLiveRuleActionKey?.value || "").trim(),
    parameters: rule?.parameters ?? {},
    expiresInSeconds: rule?.expiresInSeconds ?? Number(robloxLiveRuleExpiry?.value),
    enabled: rule?.enabled ?? true,
    ...overrides,
  };
}

async function saveRobloxLiveRule() {
  if (!authenticated || robloxLiveBusy || !selectedUniverseId || !robloxLiveRuleForm) return;
  if (robloxLiveRuleTrigger?.value === "schedule_once" && robloxLiveRuleScheduleDate && robloxLiveRuleScheduleTime) {
    const scheduledFor = getRobloxLiveScheduledInputTimestamp();
    const validityMessage = scheduledFor > Date.now() ? "" : "Choose a future Eastern Time.";
    robloxLiveRuleScheduleDate.setCustomValidity(validityMessage);
    robloxLiveRuleScheduleTime.setCustomValidity(validityMessage);
  }
  if (!robloxLiveRuleForm.reportValidity()) return;
  let parameters;
  try {
    parameters = JSON.parse(String(robloxLiveRuleParameters?.value || "{}"));
    if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
      throw new Error("Parameters must be a JSON object.");
    }
  } catch (error) {
    robloxLiveRuleFormStatus.dataset.state = "error";
    robloxLiveRuleFormStatus.textContent = error.message === "Parameters must be a JSON object."
      ? error.message
      : "Parameters must contain valid JSON.";
    return;
  }
  const id = String(robloxLiveRuleId?.value || "");
  setRobloxLiveRuleFormBusy(true);
  try {
    robloxLiveIntegration = await request(id
      ? `/api/integrations/roblox-live/rules/${encodeURIComponent(id)}`
      : "/api/integrations/roblox-live/rules", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getRobloxLiveRulePayload(null, { parameters })),
    });
    closeRobloxLiveRuleEditor();
    renderRobloxLiveIntegration();
    setRobloxLiveStatus("");
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    robloxLiveRuleFormStatus.dataset.state = "error";
    robloxLiveRuleFormStatus.textContent = formatRequestError(error);
  } finally {
    setRobloxLiveRuleFormBusy(false);
  }
}

async function handleRobloxLiveRuleListClick(event) {
  const button = event.target.closest("[data-roblox-live-action]");
  const row = button?.closest("[data-roblox-live-rule-id]");
  const rule = robloxLiveIntegration?.rules?.find((entry) => entry.id === row?.dataset.robloxLiveRuleId);
  if (!button || !rule || robloxLiveBusy) return;
  const action = button.dataset.robloxLiveAction;
  if (action === "edit") {
    openRobloxLiveRuleEditor(rule);
  } else if (action === "toggle") {
    await updateRobloxLiveRule(rule, { enabled: !rule.enabled });
  } else if (action === "run") {
    await runRobloxLiveRule(rule);
  } else if (action === "delete") {
    const confirmed = await showEventConfirmation({
      title: `Delete ${rule.name}?`,
      description: "This Roblox live-action rule will be removed.",
      actionLabel: "Delete action",
      tone: "danger",
    });
    if (confirmed) await deleteRobloxLiveRule(rule);
  }
}

async function updateRobloxLiveRule(rule, overrides) {
  setRobloxLiveBusy(true);
  try {
    robloxLiveIntegration = await request(`/api/integrations/roblox-live/rules/${encodeURIComponent(rule.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getRobloxLiveRulePayload(rule, overrides)),
    });
    renderRobloxLiveIntegration();
    setRobloxLiveStatus("");
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    setRobloxLiveStatus(formatRequestError(error), "error");
  } finally {
    setRobloxLiveBusy(false);
  }
}

async function runRobloxLiveRule(rule) {
  setRobloxLiveBusy(true);
  setRobloxLiveStatus(`Publishing ${rule.name}...`, "sending");
  try {
    robloxLiveIntegration = await request(
      `/api/integrations/roblox-live/rules/${encodeURIComponent(rule.id)}/run`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universeId: selectedUniverseId }),
      },
    );
    renderRobloxLiveIntegration();
    setRobloxLiveStatus("");
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    setRobloxLiveStatus(formatRequestError(error), "error");
  } finally {
    setRobloxLiveBusy(false);
  }
}

async function deleteRobloxLiveRule(rule) {
  setRobloxLiveBusy(true);
  try {
    robloxLiveIntegration = await request(
      `/api/integrations/roblox-live/rules/${encodeURIComponent(rule.id)}?universeId=${encodeURIComponent(selectedUniverseId)}`,
      { method: "DELETE" },
    );
    renderRobloxLiveIntegration();
    setRobloxLiveStatus("");
  } catch (error) {
    handleAuthError(error);
    if (!authenticated) return;
    setRobloxLiveStatus(formatRequestError(error), "error");
  } finally {
    setRobloxLiveBusy(false);
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
  const secretVisible = Boolean(projectSecretBox && !projectSecretBox.hidden && projectSecretValue?.textContent);
  const isDemo = Boolean(universe?.isDemo);

  const optionalMapDetail = "Upload map is optional.";
  const steps = isDemo ? [
    { title: "Connect a game", detail: "Synthetic universe attached to your admin account.", complete: true },
    { title: "Install the secret", detail: "Not required for the admin demo.", complete: true },
    { title: "Start a live server", detail: "Live activity is simulated.", complete: true },
    {
      title: "Confirm signals",
      detail: getActiveSignalText(signals),
      optionalDetail: optionalMapDetail,
      complete: true,
    },
  ] : [
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
      optionalDetail: optionalMapDetail,
      complete: hasAnySignal,
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
        ${step.optionalDetail ? `<small class="setupChecklistOptional">(${escapeHtml(step.optionalDetail)})</small>` : ""}
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

async function selectUniverse(value) {
  closeUniverseDropdown();
  const cleanValue = String(value || "").trim();
  const knownIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
  const previousUniverseId = selectedUniverseId;
  const nextUniverseId = /^\d+$/.test(cleanValue) && knownIds.has(cleanValue) ? cleanValue : "";
  if (nextUniverseId === previousUniverseId) return true;
  if (
    eventValueManagerDialog
    && !eventValueManagerDialog.hidden
    && !await closeEventValueManager({ skipFocus: true })
  ) {
    if (universeSelect) universeSelect.value = previousUniverseId;
    updateSelectedUniverse();
    return false;
  }
  if (isEditingEventDefinition && eventDefinitionIsDirty && !await confirmUnsavedEventDefinition()) {
    if (universeSelect) universeSelect.value = previousUniverseId;
    updateSelectedUniverse();
    return false;
  }
  eventDefinitionIsDirty = false;
  selectedUniverseId = nextUniverseId;

  selectedChatLogId = "";
  currentChatLogs = [];
  chatLogOffset = 0;
  selectedCustomEventName = "";
  currentEventCatalog = [];
  currentSelectedEvent = null;
  recentEventsExpanded = false;
  isEditingEventDefinition = false;
  eventDefinitionProperties = [];
  eventDefinitionHiddenPropertyNames = new Set();
  eventDefinitionHiddenPropertyTypes = new Map();
  eventDefinitionObservedPropertyNames = new Set();
  eventDefinitionConfiguredPropertyNames = new Set();
  eventDefinitionNameLocked = false;
  setEventDefinitionBuilderVisible(false);
  currentEventReleaseVersions = [];
  currentEventReleaseVersionsUniverseId = "";
  eventReleaseVersionRequestSequence += 1;
  clearSelectedDateReleaseVersion("from");
  clearSelectedDateReleaseVersion("to");
  clearSelectedDateReleaseVersion("from", "funnels");
  clearSelectedDateReleaseVersion("to", "funnels");
  closeDateRangePicker();
  selectedFunnelId = "";
  currentFunnels = [];
  currentFunnelEventNames = [];
  selectedFunnelTimelineSteps.clear();
  isCreatingFunnel = false;
  setFunnelBuilderVisible(false);
  discordIntegration = null;
  discordEditingWebhookId = "";
  discordCreatingWebhook = false;
  discordIntegrationRequestSequence += 1;
  closeDiscordRuleEditor();
  if (discordConnectionForm) discordConnectionForm.reset();
  renderDiscordIntegration();
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
  return true;
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
    currentEventReleaseVersions = [];
    currentEventReleaseVersionsUniverseId = "";
    renderDateRangePicker();
    eventPropertyList?.setAttribute("aria-busy", "false");
    eventsStatus.textContent = "Connect or select a Roblox game to view events.";
    return false;
  }

  if (currentEventReleaseVersionsUniverseId !== universeId) {
    loadEventReleaseVersions(universeId);
  }
  if (!options.background) {
    eventsStatus.textContent = "Loading events...";
    eventPropertyList?.setAttribute("aria-busy", "true");
  }
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
    if (requestSequence === customEventsRequestSequence && !options.background) {
      eventPropertyList?.setAttribute("aria-busy", "false");
    }
  }
}

async function loadEventReleaseVersions(universeId = selectedUniverseId, options = {}) {
  const cleanUniverseId = String(universeId || "");
  if (!authenticated || !cleanUniverseId) return false;
  if (
    !options.force
    && currentEventReleaseVersionsUniverseId === cleanUniverseId
    && (currentEventReleaseVersions.length || eventReleaseVersionsLoading)
  ) {
    return true;
  }

  const requestSequence = ++eventReleaseVersionRequestSequence;
  currentEventReleaseVersionsUniverseId = cleanUniverseId;
  eventReleaseVersionsLoading = true;
  renderDateRangePicker();
  try {
    const payload = await request(`/api/version-health?universeId=${encodeURIComponent(cleanUniverseId)}`, {
      dedupe: !options.force,
    });
    if (
      requestSequence !== eventReleaseVersionRequestSequence
      || cleanUniverseId !== selectedUniverseId
    ) {
      return false;
    }
    currentEventReleaseVersions = (Array.isArray(payload.versions) ? payload.versions : [])
      .filter((version) => (
        version?.environment === "production"
        && Number(version?.placeId) > 0
        && Number(version?.placeVersion) > 0
        && Number(version?.firstSeenAt) > 0
      ))
      .map((version) => ({
        placeId: Number(version.placeId),
        placeVersion: Number(version.placeVersion),
        publishedAt: Number(version.firstSeenAt),
      }));
    return true;
  } catch (error) {
    if (requestSequence !== eventReleaseVersionRequestSequence) return false;
    handleAuthError(error);
    currentEventReleaseVersions = [];
    return false;
  } finally {
    if (requestSequence === eventReleaseVersionRequestSequence) {
      eventReleaseVersionsLoading = false;
      renderDateRangePicker();
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
  updateEventPropertyHeaderMetrics({ name: eventName }, { loading: true });
  renderCustomEventProperties([]);
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
  const nextSelectedEventName = String(selected?.name || "");
  if (selectedEventPropertyEventName !== nextSelectedEventName) {
    selectedEventPropertyEventName = nextSelectedEventName;
    selectedEventPropertyName = "";
  }
  currentEventCatalog = catalog;
  currentSelectedEvent = selected;
  const previousEventName = selectedCustomEventName;
  selectedCustomEventName = selected?.name || "";
  if (previousEventName && previousEventName !== selectedCustomEventName) {
    recentEventsExpanded = false;
  }

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
  updateSelectedEventDefinitionActions(selected);
  updateEventPropertyHeaderMetrics(selected);
  updateEventIntervalControl(selected);
  renderCustomEventProperties(selected?.properties || [], selected?.releaseMarkers || [], {
    showCreatedPlaceholder: shouldRenderCreatedEventPlaceholder(selected),
    definition: selected?.definition || null,
    selectedEvent: selected,
  });
  renderRecentCustomEvents(selected?.recentEvents || [], selected?.properties || []);

  const recentTotal = Number(selected?.recentEventsTotal) || 0;
  if (viewAllRecentEventsButton) {
    viewAllRecentEventsButton.hidden = !recentEventsExpanded && recentTotal <= (selected?.recentEvents?.length || 0);
    viewAllRecentEventsButton.innerHTML = recentEventsExpanded
      ? 'Show fewer events <span aria-hidden="true">↑</span>'
      : `View all events <span aria-hidden="true">→</span>`;
  }
}

function shouldRenderCreatedEventPlaceholder(selectedEvent = {}) {
  return Boolean(
    selectedEvent?.name
    && selectedEvent.sourceType === "custom"
    && selectedEvent.definition
    && (Number(selectedEvent.count) || 0) === 0
    && !Number(selectedEvent.definition.firstSeenAt)
    && !Number(selectedEvent.definition.lastSeenAt)
  );
}

function updateEventPropertyHeaderMetrics(selectedEvent, options = {}) {
  if (!eventPropertyHeaderMetrics) return;
  const hasSelection = Boolean(selectedEvent?.name);
  eventPropertyHeaderMetrics.hidden = !hasSelection;
  if (!hasSelection) return;

  const loading = Boolean(options.loading);
  if (eventPropertyHeaderEventCount) {
    eventPropertyHeaderEventCount.textContent = loading
      ? "--"
      : formatCompactNumber(Math.max(0, Number(selectedEvent?.count) || 0));
  }
  if (eventPropertyHeaderPlayerCount) {
    eventPropertyHeaderPlayerCount.textContent = loading
      ? "--"
      : formatCompactNumber(Math.max(0, Number(selectedEvent?.uniquePlayers) || 0));
  }
  if (eventPropertyHeaderSessionCount) {
    eventPropertyHeaderSessionCount.textContent = loading
      ? "--"
      : formatCompactNumber(Math.max(0, Number(selectedEvent?.uniqueSessions) || 0));
  }
  if (eventPropertyHeaderSessionCoverage) {
    const totalVisits = (selectedEvent?.series || []).reduce((sum, bucket) => sum + (Number(bucket?.visits) || 0), 0);
    const sessionCoverage = totalVisits > 0
      ? Math.min((Number(selectedEvent?.uniqueSessions) || 0) / totalVisits, 1) * 100
      : null;
    eventPropertyHeaderSessionCoverage.textContent = loading || sessionCoverage === null
      ? "--"
      : `${formatEventNumber(sessionCoverage)}%`;
  }
}

function renderEventCatalog(catalog) {
  const renderItem = (item) => {
    const isActive = item.name === selectedCustomEventName;
    return `
      <button class="eventCatalogItem ${isActive ? "active" : ""}" type="button" data-event-name="${escapeHtml(item.name)}" title="${escapeHtml(formatEventName(item.name))}" ${isActive ? 'aria-current="true"' : ""} ${isEditingEventDefinition ? "disabled" : ""}>
        <span>${escapeHtml(formatEventName(item.name))}</span>
      </button>
    `;
  };
  const systemOrder = new Map([["player_died", 0], ["player_left", 1], ["chat_message", 2]]);
  const systemEvents = catalog
    .filter((item) => item.sourceType === "system")
    .sort((left, right) => (systemOrder.get(left.name) ?? 99) - (systemOrder.get(right.name) ?? 99));
  const customEvents = catalog.filter((item) => item.sourceType !== "system");
  return [...systemEvents, ...customEvents].map(renderItem).join("");
}

function getSelectedEventCatalogItem() {
  return currentEventCatalog.find((item) => item.name === selectedCustomEventName) || null;
}

function updateSelectedEventDefinitionActions(selectedEvent) {
  const catalogItem = getSelectedEventCatalogItem();
  const hasSelection = Boolean(selectedEvent?.name && catalogItem);
  const isCustomEvent = hasSelection && catalogItem.sourceType !== "system";

  if (eventSelectionActions) eventSelectionActions.hidden = !isCustomEvent || isEditingEventDefinition;
  if (editEventButton) editEventButton.disabled = !isCustomEvent;
  if (eventMoreButton) eventMoreButton.disabled = !isCustomEvent;
}

function startNewEventDefinition() {
  if (!selectedUniverseId || !eventDefinitionForm) return;
  closeEventMoreMenu();
  eventDefinitionReturnFocus = document.activeElement;
  eventDefinitionIsDirty = false;
  eventDefinitionProperties = [];
  eventDefinitionHiddenPropertyNames = new Set();
  eventDefinitionHiddenPropertyTypes = new Map();
  eventDefinitionObservedPropertyNames = new Set();
  eventDefinitionConfiguredPropertyNames = new Set();
  eventDefinitionNameLocked = false;
  if (eventDefinitionId) eventDefinitionId.value = "";
  if (eventDefinitionName) {
    eventDefinitionName.value = "";
    eventDefinitionName.disabled = false;
  }
  if (eventDefinitionBuilderTitle) eventDefinitionBuilderTitle.textContent = "Create event";
  if (selectedEventTitle) selectedEventTitle.textContent = "New event";
  if (saveEventDefinitionButton) saveEventDefinitionButton.textContent = "Create event";
  if (eventDefinitionStatus) eventDefinitionStatus.textContent = "";
  if (eventCodeStatus) eventCodeStatus.textContent = "";
  renderEventDefinitionPropertyEditor();
  renderEventDefinitionCodePreviews();
  setEventDefinitionBuilderVisible(true);
  window.requestAnimationFrame(() => eventDefinitionName?.focus());
}

function getObservedEventDefinitionPropertyType(property = {}) {
  if (property.type === "number") return "number";
  const observedTypes = new Set(
    (Array.isArray(property.topValues) ? property.topValues : [])
      .map((entry) => String(entry?.valueType || "").toLowerCase())
      .filter(Boolean),
  );
  if (observedTypes.size === 1 && observedTypes.has("boolean")) return "boolean";
  return "string";
}

function editSelectedEventDefinition() {
  const selected = currentSelectedEvent;
  const catalogItem = getSelectedEventCatalogItem();
  if (!selected?.name || !catalogItem || catalogItem.sourceType === "system" || !eventDefinitionForm) return;

  closeEventMoreMenu();
  eventDefinitionReturnFocus = document.activeElement;
  eventDefinitionIsDirty = false;
  eventDefinitionNameLocked = true;
  const definition = selected.definition || catalogItem.definition || null;
  const propertyTypesByName = new Map(
    (selected.properties || []).map((property) => [
      property.name,
      getObservedEventDefinitionPropertyType(property),
    ]),
  );
  eventDefinitionHiddenPropertyNames = new Set(
    (definition?.hiddenPropertyNames || [])
      .map((name) => String(name || "").trim())
      .filter(Boolean),
  );
  eventDefinitionHiddenPropertyTypes = new Map(
    [...eventDefinitionHiddenPropertyNames].map((name) => {
      const configuredProperty = (definition?.properties || [])
        .find((property) => String(property?.name || "").trim() === name);
      const type = String(configuredProperty?.type || "string").toLowerCase();
      return [name, ["string", "number", "boolean"].includes(type) ? type : "string"];
    }),
  );
  eventDefinitionConfiguredPropertyNames = new Set(
    (definition?.properties || [])
      .map((property) => String(property?.name || "").trim())
      .filter(Boolean),
  );
  eventDefinitionObservedPropertyNames = new Set([
    ...(definition?.discoveredPropertyNames || []),
    ...(definition?.effectiveProperties || []).map((property) => property?.name),
    ...(selected.properties || []).map((property) => property.name),
    ...(selected.observedPropertyNames || []),
    ...eventDefinitionHiddenPropertyNames,
  ].map((name) => String(name || "").trim()).filter(Boolean));
  const sourceProperties = [
    ...(definition?.properties || []),
    ...(definition?.effectiveProperties || []),
    ...(definition?.discoveredPropertyNames || []).map((name) => ({
      name,
      type: propertyTypesByName.get(name) || "string",
    })),
    ...(selected.properties || []).map((property) => ({
      name: property.name,
      type: getObservedEventDefinitionPropertyType(property),
    })),
    ...(selected.observedPropertyNames || []).map((name) => ({
      name,
      type: propertyTypesByName.get(name) || "string",
    })),
  ].filter((property) => !eventDefinitionHiddenPropertyNames.has(String(property?.name || "").trim()));
  eventDefinitionProperties = normalizeEventDefinitionEditorProperties(sourceProperties, propertyTypesByName);

  if (eventDefinitionId) eventDefinitionId.value = definition?.id || "";
  if (eventDefinitionName) {
    eventDefinitionName.value = selected.name;
    eventDefinitionName.disabled = true;
  }
  if (eventDefinitionBuilderTitle) eventDefinitionBuilderTitle.textContent = `Edit ${formatEventName(selected.name)}`;
  if (selectedEventTitle) selectedEventTitle.textContent = `Edit ${formatEventName(selected.name)}`;
  if (saveEventDefinitionButton) saveEventDefinitionButton.textContent = "Save changes";
  if (eventDefinitionStatus) eventDefinitionStatus.textContent = "";
  if (eventCodeStatus) eventCodeStatus.textContent = "";
  renderEventDefinitionPropertyEditor();
  renderEventDefinitionCodePreviews();
  setEventDefinitionBuilderVisible(true);
  window.requestAnimationFrame(() => {
    const firstPropertyInput = eventDefinitionPropertyEditor?.querySelector("input");
    if (firstPropertyInput) firstPropertyInput.focus();
    else if (addEventDefinitionPropertyButton) addEventDefinitionPropertyButton.focus();
    else cancelEventDefinitionEditButton?.focus();
  });
}

function normalizeEventDefinitionEditorProperties(properties, inferredTypes = new Map()) {
  const normalized = [];
  const names = new Set();
  for (const property of Array.isArray(properties) ? properties : []) {
    const name = String(property?.name || property?.key || property?.path || "").trim();
    if (!name || names.has(name)) continue;
    names.add(name);
    const inferredType = inferredTypes.get(name);
    const requestedType = String(
      eventDefinitionConfiguredPropertyNames.has(name)
        ? property?.type || inferredType || "string"
        : inferredType || property?.type || "string",
    ).toLowerCase();
    normalized.push({
      name,
      type: ["string", "number", "boolean"].includes(requestedType) ? requestedType : "string",
    });
    if (normalized.length >= MAX_EVENT_DEFINITION_PROPERTIES) break;
  }
  return normalized;
}

function setEventDefinitionBuilderVisible(visible) {
  isEditingEventDefinition = Boolean(visible);
  document.body.classList.toggle("isEditingEventDefinition", isEditingEventDefinition);
  if (eventDefinitionForm) eventDefinitionForm.hidden = !isEditingEventDefinition;
  if (eventAnalyticsView) eventAnalyticsView.hidden = isEditingEventDefinition;
  if (!isEditingEventDefinition && selectedEventTitle) {
    selectedEventTitle.textContent = currentSelectedEvent?.name
      ? formatEventName(currentSelectedEvent.name)
      : "Select an event";
  }
  if (newEventButton) newEventButton.disabled = isEditingEventDefinition || !selectedUniverseId;
  if (eventCatalog) eventCatalog.innerHTML = currentEventCatalog.length
    ? renderEventCatalog(currentEventCatalog)
    : '<p class="status">Logged event names will appear here automatically.</p>';
  updateSelectedEventDefinitionActions(currentSelectedEvent);
}

async function confirmEventDefinitionDiscard(nextView) {
  if (
    activeView === "events"
    && nextView !== "events"
    && eventValueManagerDialog
    && !eventValueManagerDialog.hidden
    && !await closeEventValueManager({ skipFocus: true })
  ) {
    return false;
  }
  if (
    activeView !== "events"
    || nextView === "events"
    || !isEditingEventDefinition
    || !eventDefinitionIsDirty
  ) {
    return true;
  }
  return confirmUnsavedEventDefinition();
}

function confirmUnsavedEventDefinition() {
  if (!eventDefinitionIsDirty) return Promise.resolve(true);
  return showEventConfirmation({
    title: "Discard unsaved changes?",
    description: "Your event name and property edits have not been saved.",
    confirmLabel: "Discard changes",
    danger: true,
  });
}

function showEventConfirmation(options = {}) {
  if (!eventConfirmDialog) return Promise.resolve(false);
  if (eventConfirmResolver) resolveEventConfirmation(false);
  eventConfirmReturnFocus = options.returnFocus || document.activeElement;
  if (eventConfirmTitle) eventConfirmTitle.textContent = options.title || "Confirm action";
  if (eventConfirmDescription) eventConfirmDescription.textContent = options.description || "";
  if (eventConfirmActionButton) {
    eventConfirmActionButton.textContent = options.confirmLabel || "Confirm";
    eventConfirmActionButton.classList.toggle("danger", Boolean(options.danger));
  }
  eventConfirmIcon?.classList.toggle("danger", Boolean(options.danger));
  eventConfirmDialog.hidden = false;
  document.body.classList.add("hasEventConfirmDialog");
  window.requestAnimationFrame(() => eventConfirmCancelButton?.focus());
  return new Promise((resolve) => {
    eventConfirmResolver = resolve;
  });
}

function resolveEventConfirmation(confirmed) {
  if (!eventConfirmResolver) return;
  const resolve = eventConfirmResolver;
  const returnFocus = eventConfirmReturnFocus;
  eventConfirmResolver = null;
  eventConfirmReturnFocus = null;
  if (eventConfirmDialog) eventConfirmDialog.hidden = true;
  document.body.classList.remove("hasEventConfirmDialog");
  resolve(Boolean(confirmed));
  if (!confirmed) {
    window.requestAnimationFrame(() => returnFocus?.isConnected && returnFocus.focus());
  }
}

function handleEventConfirmationKeydown(event) {
  if (eventConfirmDialog?.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    resolveEventConfirmation(false);
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [eventConfirmCancelButton, eventConfirmActionButton].filter((control) => !control?.disabled);
  if (!controls.length) return;
  const currentIndex = controls.indexOf(document.activeElement);
  const direction = event.shiftKey ? -1 : 1;
  const nextIndex = currentIndex < 0
    ? 0
    : (currentIndex + direction + controls.length) % controls.length;
  event.preventDefault();
  controls[nextIndex].focus();
}

async function handleDashboardHashChange() {
  if (ignoreNextEventHashChange) {
    ignoreNextEventHashChange = false;
    return;
  }
  const nextView = getViewFromHash();
  if (!await confirmEventDefinitionDiscard(nextView)) {
    ignoreNextEventHashChange = true;
    window.location.hash = "#events";
    return;
  }
  eventDefinitionIsDirty = false;
  setActiveView(nextView, { updateHash: false });
}

function handleEventDefinitionBeforeUnload(event) {
  if (!isEditingEventDefinition || !eventDefinitionIsDirty) return;
  event.preventDefault();
  event.returnValue = "";
}

async function cancelEventDefinitionEdit() {
  if (!isEditingEventDefinition) return;
  if (!await confirmUnsavedEventDefinition()) return;
  eventDefinitionIsDirty = false;
  setEventDefinitionBuilderVisible(false);
  restoreEventDefinitionViewFocus();
}

function restoreEventDefinitionViewFocus() {
  const target = eventDefinitionReturnFocus?.isConnected
    ? eventDefinitionReturnFocus
    : (selectedCustomEventName ? editEventButton : newEventButton);
  eventDefinitionReturnFocus = null;
  window.requestAnimationFrame(() => target?.focus());
}

function renderEventDefinitionPropertyEditor(options = {}) {
  if (!eventDefinitionPropertyEditor) return;
  if (eventDefinitionPropertyCount) {
    eventDefinitionPropertyCount.textContent = `${eventDefinitionProperties.length} / ${MAX_EVENT_DEFINITION_PROPERTIES}`;
  }
  if (addEventDefinitionPropertyButton) {
    addEventDefinitionPropertyButton.disabled = eventDefinitionProperties.length >= MAX_EVENT_DEFINITION_PROPERTIES;
  }

  eventDefinitionPropertyEditor.innerHTML = eventDefinitionProperties.length
    ? eventDefinitionProperties.map((property, index) => {
      const observed = eventDefinitionObservedPropertyNames.has(property.name);
      const propertyLabel = property.name || `property ${index + 1}`;
      return `
      <div class="eventDefinitionPropertyRow" data-event-definition-property-index="${index}" data-event-definition-property-observed="${observed ? "true" : "false"}">
        <span class="eventDefinitionPropertyIndex" aria-hidden="true">${index + 1}</span>
        <label>
          <span>Property name</span>
          <input type="text" value="${escapeHtml(property.name)}" maxlength="96" placeholder="weapon.name" spellcheck="false" data-event-definition-property-name="${index}" aria-label="Property ${index + 1} name" ${observed ? 'readonly title="This property name comes from incoming Roblox events"' : ""}>
        </label>
        <label>
          <span>Example type</span>
          <select data-event-definition-property-type="${index}" aria-label="Property ${index + 1} example type">
            <option value="string" ${property.type === "string" ? "selected" : ""}>String</option>
            <option value="number" ${property.type === "number" ? "selected" : ""}>Number</option>
            <option value="boolean" ${property.type === "boolean" ? "selected" : ""}>True / false</option>
          </select>
        </label>
        ${observed
          ? `<button class="eventDefinitionRemovePropertyButton hideAction" type="button" data-event-definition-property-action="hide" data-event-definition-property-index="${index}" aria-label="Hide ${escapeHtml(propertyLabel)}" title="Hide property">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c5 0 9 8 9 8a17.8 17.8 0 0 1-2.2 3.2" /><path d="M6.6 6.6C4.6 8 3 12 3 12s4 8 9 8a9.7 9.7 0 0 0 3.4-.6" /></svg>
            </button>`
          : `<button class="eventDefinitionRemovePropertyButton" type="button" data-event-definition-property-action="remove" data-event-definition-property-index="${index}" aria-label="Remove ${escapeHtml(propertyLabel)}" title="Remove property">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>
            </button>`}
      </div>
    `;
    }).join("")
    : `
      <div class="eventDefinitionPropertiesEmpty">
        <strong>No properties yet</strong>
        <span>Add one now, or send the first event from Roblox to discover it.</span>
      </div>
    `;

  renderEventDefinitionHiddenProperties();
  if (Number.isInteger(options.focusIndex)) {
    window.requestAnimationFrame(() => {
      eventDefinitionPropertyEditor
        ?.querySelector(`[data-event-definition-property-name="${options.focusIndex}"]`)
        ?.focus();
    });
  } else if (options.focusAdd) {
    window.requestAnimationFrame(() => addEventDefinitionPropertyButton?.focus());
  }
}

function renderEventDefinitionHiddenProperties() {
  if (!eventDefinitionHiddenProperties || !eventDefinitionHiddenPropertyList) return;
  const hiddenNames = [...eventDefinitionHiddenPropertyNames]
    .map((name) => String(name || "").trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
  eventDefinitionHiddenProperties.hidden = hiddenNames.length === 0;
  eventDefinitionHiddenPropertyList.innerHTML = hiddenNames.map((name) => `
    <div class="eventDefinitionHiddenPropertyItem" role="listitem">
      <span title="${escapeHtml(name)}">${escapeHtml(name)}</span>
      <button type="button" data-event-definition-hidden-property-name="${escapeHtml(name)}" aria-label="Restore ${escapeHtml(name)}">Restore</button>
    </div>
  `).join("");
}

function syncEventDefinitionPropertiesFromEditor() {
  const properties = [];
  for (const row of eventDefinitionPropertyEditor?.querySelectorAll(".eventDefinitionPropertyRow[data-event-definition-property-index]") || []) {
    properties.push({
      name: String(row.querySelector("[data-event-definition-property-name]")?.value || "").trim(),
      type: String(row.querySelector("[data-event-definition-property-type]")?.value || "string"),
    });
  }
  eventDefinitionProperties = properties.slice(0, MAX_EVENT_DEFINITION_PROPERTIES);
}

function handleEventDefinitionPropertyInput() {
  syncEventDefinitionPropertiesFromEditor();
  eventDefinitionIsDirty = true;
  if (eventDefinitionPropertyCount) {
    eventDefinitionPropertyCount.textContent = `${eventDefinitionProperties.length} / ${MAX_EVENT_DEFINITION_PROPERTIES}`;
  }
  renderEventDefinitionCodePreviews();
}

function handleEventDefinitionPropertyAction(event) {
  const button = event.target.closest("[data-event-definition-property-action]");
  if (!button) return;
  syncEventDefinitionPropertiesFromEditor();
  const index = Number(button.dataset.eventDefinitionPropertyIndex);
  if (!Number.isInteger(index) || index < 0 || index >= eventDefinitionProperties.length) return;
  const property = eventDefinitionProperties[index];
  if (button.dataset.eventDefinitionPropertyAction === "hide" && property.name) {
    eventDefinitionHiddenPropertyNames.add(property.name);
    eventDefinitionHiddenPropertyTypes.set(
      property.name,
      ["string", "number", "boolean"].includes(property.type) ? property.type : "string",
    );
    eventDefinitionObservedPropertyNames.add(property.name);
    if (eventDefinitionStatus) {
      eventDefinitionStatus.textContent = `${formatEventPropertyName(property.name)} hidden. Save changes to keep it hidden.`;
    }
  }
  eventDefinitionProperties.splice(index, 1);
  eventDefinitionIsDirty = true;
  renderEventDefinitionPropertyEditor({
    focusIndex: eventDefinitionProperties.length ? Math.min(index, eventDefinitionProperties.length - 1) : undefined,
    focusAdd: eventDefinitionProperties.length === 0,
  });
  renderEventDefinitionCodePreviews();
}

function handleEventDefinitionHiddenPropertyAction(event) {
  const button = event.target.closest("[data-event-definition-hidden-property-name]");
  if (!button) return;
  syncEventDefinitionPropertiesFromEditor();
  const name = String(button.dataset.eventDefinitionHiddenPropertyName || "").trim();
  if (!name || !eventDefinitionHiddenPropertyNames.has(name)) return;

  let restoredIndex = eventDefinitionProperties.findIndex((property) => property.name === name);
  const alreadyVisible = restoredIndex >= 0;
  if (!alreadyVisible && eventDefinitionProperties.length >= MAX_EVENT_DEFINITION_PROPERTIES) {
    if (eventDefinitionStatus) {
      eventDefinitionStatus.textContent = `Hide or remove another property before restoring ${formatEventPropertyName(name)}.`;
    }
    window.requestAnimationFrame(() => button.focus());
    return;
  }

  const hiddenType = eventDefinitionHiddenPropertyTypes.get(name);
  eventDefinitionHiddenPropertyNames.delete(name);
  eventDefinitionHiddenPropertyTypes.delete(name);
  eventDefinitionObservedPropertyNames.add(name);
  if (!alreadyVisible) {
    const selectedProperty = (currentSelectedEvent?.properties || []).find((property) => property.name === name);
    const definition = currentSelectedEvent?.definition || getSelectedEventCatalogItem()?.definition || null;
    const definedProperty = [
      ...(definition?.properties || []),
      ...(definition?.effectiveProperties || []),
    ].find((property) => property?.name === name);
    eventDefinitionProperties.push({
      name,
      type: hiddenType || (selectedProperty
        ? getObservedEventDefinitionPropertyType(selectedProperty)
        : (definedProperty?.type || "string")),
    });
    restoredIndex = eventDefinitionProperties.length - 1;
  }

  eventDefinitionIsDirty = true;
  if (eventDefinitionStatus) {
    eventDefinitionStatus.textContent = `${formatEventPropertyName(name)} restored. Save changes to keep it visible.`;
  }
  renderEventDefinitionPropertyEditor({ focusIndex: restoredIndex });
  renderEventDefinitionCodePreviews();
}

function addEventDefinitionProperty() {
  syncEventDefinitionPropertiesFromEditor();
  if (eventDefinitionProperties.length >= MAX_EVENT_DEFINITION_PROPERTIES) return;
  eventDefinitionProperties.push({ name: "", type: "string" });
  eventDefinitionIsDirty = true;
  const newIndex = eventDefinitionProperties.length - 1;
  renderEventDefinitionPropertyEditor({ focusIndex: newIndex });
  renderEventDefinitionCodePreviews();
}

function getEventDefinitionPreviewName() {
  const rawName = String(eventDefinitionName?.value || "").trim().toLowerCase();
  return rawName || "event_name";
}

function getEventDefinitionPreviewProperties() {
  syncEventDefinitionPropertiesFromEditor();
  const properties = [];
  const names = new Set();
  for (const property of eventDefinitionProperties) {
    const name = String(property.name || "").trim();
    if (!name || names.has(name)) continue;
    names.add(name);
    properties.push({
      name,
      type: ["string", "number", "boolean"].includes(property.type) ? property.type : "string",
    });
  }
  return properties;
}

function formatLuauString(value) {
  return JSON.stringify(String(value));
}

function formatLuauPropertyKey(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)
    ? name
    : `[${formatLuauString(name)}]`;
}

function formatLuauExampleValue(type) {
  if (type === "number") return "0";
  if (type === "boolean") return "false";
  return '"Example"';
}

function buildEventDefinitionLuauTemplate() {
  const properties = getEventDefinitionPreviewProperties();
  const propertyLines = properties.length
    ? properties.map((property) => `\t${formatLuauPropertyKey(property.name)} = ${formatLuauExampleValue(property.type)},`).join("\n")
    : "";
  const infoTable = propertyLines ? `{\n${propertyLines}\n}` : "{}";
  return [
    'local ServerScriptService = game:GetService("ServerScriptService")',
    "local RoAnalytics = require(ServerScriptService.RoAnalytics.API)",
    "",
    `RoAnalytics.Log(${formatLuauString(getEventDefinitionPreviewName())}, ${infoTable}, player)`,
  ].join("\n");
}

function renderEventDefinitionCodePreviews() {
  const luauCode = buildEventDefinitionLuauTemplate();
  const luauCodeNode = eventLuauPreview?.querySelector("code");
  if (luauCodeNode) luauCodeNode.textContent = luauCode;
}

async function copyEventDefinitionCode() {
  const code = buildEventDefinitionLuauTemplate();
  try {
    await navigator.clipboard.writeText(code);
    if (eventCodeStatus) eventCodeStatus.textContent = "Luau copied.";
  } catch {
    if (eventCodeStatus) eventCodeStatus.textContent = "Copy failed. Select the code above and copy it manually.";
  }
}

function isValidEventDefinitionPropertyPath(value) {
  const propertyName = String(value || "");
  const isCanonicalPath = /^[A-Za-z][A-Za-z0-9_:-]*(?:\[\])?(?:\.[A-Za-z][A-Za-z0-9_:-]*(?:\[\])?)*$/.test(propertyName);
  const isLegacyFlatKey = propertyName.length <= 48 && /^[A-Za-z][A-Za-z0-9_.:-]{0,47}$/.test(propertyName);
  return propertyName.length > 0
    && propertyName.length <= 96
    && (isCanonicalPath || isLegacyFlatKey);
}

function validateEventDefinitionForm() {
  const eventName = String(eventDefinitionName?.value || "").trim().toLowerCase();
  if (!/^[a-z][a-z0-9_.:-]{0,63}$/.test(eventName)) {
    return { error: "Use an event name that starts with a letter and contains only letters, numbers, _, ., :, or -." };
  }
  syncEventDefinitionPropertiesFromEditor();
  if (eventDefinitionProperties.length > MAX_EVENT_DEFINITION_PROPERTIES) {
    return { error: `Events can have up to ${MAX_EVENT_DEFINITION_PROPERTIES} properties.` };
  }
  const names = new Set();
  const properties = [];
  for (const property of eventDefinitionProperties) {
    const propertyName = String(property.name || "").trim();
    if (!propertyName) return { error: "Name or remove every property row." };
    if (!isValidEventDefinitionPropertyPath(propertyName)) {
      return { error: `"${propertyName}" is not a valid property path.` };
    }
    if (names.has(propertyName)) return { error: `Property names must be unique: ${propertyName}` };
    names.add(propertyName);
    properties.push({
      name: propertyName,
      type: ["string", "number", "boolean"].includes(property.type) ? property.type : "string",
    });
  }
  const hiddenPropertyNames = [...eventDefinitionHiddenPropertyNames]
    .filter((name) => !names.has(name))
    .sort((left, right) => left.localeCompare(right));
  eventDefinitionHiddenPropertyNames = new Set(hiddenPropertyNames);
  for (const visibleName of names) eventDefinitionHiddenPropertyTypes.delete(visibleName);
  for (const hiddenName of hiddenPropertyNames) {
    properties.push({
      name: hiddenName,
      type: eventDefinitionHiddenPropertyTypes.get(hiddenName) || "string",
    });
  }
  renderEventDefinitionHiddenProperties();
  return { eventName, properties, hiddenPropertyNames };
}

async function saveEventDefinition() {
  if (!selectedUniverseId || !eventDefinitionForm) return;
  const validated = validateEventDefinitionForm();
  if (validated.error) {
    if (eventDefinitionStatus) eventDefinitionStatus.textContent = validated.error;
    return;
  }

  setEventDefinitionFormDisabled(true);
  if (eventDefinitionStatus) eventDefinitionStatus.textContent = "Saving event...";
  try {
    const payload = await request("/api/event-definitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: eventDefinitionId?.value || undefined,
        universeId: Number(selectedUniverseId),
        eventName: validated.eventName,
        properties: validated.properties,
        hiddenPropertyNames: validated.hiddenPropertyNames,
      }),
    });
    selectedCustomEventName = payload.definition?.eventName || validated.eventName;
    eventDefinitionIsDirty = false;
    window.dispatchEvent(new CustomEvent("dashboard:eventDefinitionsChanged", {
      detail: { universeId: selectedUniverseId, eventName: selectedCustomEventName },
    }));
    await loadCustomEvents({ force: true });
    setEventDefinitionBuilderVisible(false);
    restoreEventDefinitionViewFocus();
  } catch (error) {
    handleAuthError(error);
    if (authenticated && eventDefinitionStatus) eventDefinitionStatus.textContent = formatRequestError(error);
  } finally {
    setEventDefinitionFormDisabled(false);
  }
}

function setEventDefinitionFormDisabled(disabled) {
  for (const control of eventDefinitionForm?.querySelectorAll("input, select, button") || []) {
    control.disabled = disabled;
  }
  if (!disabled && eventDefinitionName) {
    eventDefinitionName.disabled = eventDefinitionNameLocked;
    renderEventDefinitionPropertyEditor();
  }
}

function toggleEventMoreMenu() {
  if (!eventMorePopover || !eventMoreButton || eventMoreButton.disabled) return;
  const willOpen = eventMorePopover.hidden;
  eventMorePopover.hidden = !willOpen;
  eventMoreButton.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) deleteSelectedEventButton?.focus();
}

function closeEventMoreMenu() {
  if (eventMorePopover) eventMorePopover.hidden = true;
  eventMoreButton?.setAttribute("aria-expanded", "false");
}

function handleEventMoreOutsidePointer(event) {
  if (eventMorePopover?.hidden) return;
  if (event.target.closest(".eventMoreMenu")) return;
  closeEventMoreMenu();
}

function handleEventMoreEscape(event) {
  if (event.key !== "Escape" || eventMorePopover?.hidden) return;
  closeEventMoreMenu();
  eventMoreButton?.focus();
}

async function deleteSelectedCustomEvent() {
  const catalogItem = getSelectedEventCatalogItem();
  if (!catalogItem || catalogItem.sourceType === "system" || !selectedUniverseId) return;
  closeEventMoreMenu();
  const label = formatEventName(catalogItem.name);
  const confirmed = await showEventConfirmation({
    title: `Delete ${label}?`,
    description: "This deletes its definition and stored dashboard history. New Roblox logs with the same event name can create it again.",
    confirmLabel: "Delete event",
    danger: true,
    returnFocus: eventMoreButton,
  });
  if (!confirmed) return;

  if (eventsStatus) eventsStatus.textContent = "Deleting event...";
  if (eventSelectionActions) eventSelectionActions.hidden = true;
  try {
    await request(`/api/events?universeId=${encodeURIComponent(selectedUniverseId)}&eventName=${encodeURIComponent(catalogItem.name)}`, {
      method: "DELETE",
    });
    selectedCustomEventName = "";
    currentSelectedEvent = null;
    window.dispatchEvent(new CustomEvent("dashboard:eventDefinitionsChanged", {
      detail: { universeId: selectedUniverseId, deletedEventName: catalogItem.name },
    }));
    window.dispatchEvent(new CustomEvent("dashboard:eventMapSelectionChanged", {
      detail: { eventName: "", source: "events-page" },
    }));
    await loadCustomEvents({ force: true });
  } catch (error) {
    handleAuthError(error);
    if (authenticated && eventsStatus) eventsStatus.textContent = formatRequestError(error);
  } finally {
    updateSelectedEventDefinitionActions(currentSelectedEvent);
  }
}

function getSeriesBucketMs(series) {
  if (series.length < 2) return 60 * 60 * 1000;
  return Math.max(Number(series[1]?.start) - Number(series[0]?.start), 60 * 1000);
}

function getEventChartSpanMs(bucketStarts, bucketMs) {
  const starts = (Array.isArray(bucketStarts) ? bucketStarts : [])
    .map(Number)
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  const intervalMs = Math.max(Number(bucketMs) || 0, 0);
  if (!starts.length) return intervalMs;
  return Math.max((starts.at(-1) - starts[0]) + intervalMs, intervalMs);
}

function getEventChartWidth(containerWidth, bucketCount, horizontalPadding, minimumPointSpacing) {
  const availableWidth = Math.max(Math.floor(Number(containerWidth) || 760), 320);
  const pointGaps = Math.max(Math.trunc(Number(bucketCount) || 0) - 1, 0);
  const padding = Math.max(Number(horizontalPadding) || 0, 0);
  const spacing = Math.max(Number(minimumPointSpacing) || 0, 1);
  return Math.max(availableWidth, (pointGaps * spacing) + padding);
}

function formatEventChartLabel(value, bucketMs, spanMs = 0, options = {}) {
  const date = new Date(Number(value));
  if (!Number.isFinite(date.getTime())) return "--";
  const dayMs = 24 * 60 * 60 * 1000;
  const intervalMs = Math.max(Number(bucketMs) || 0, 0);
  const timelineSpanMs = Math.max(Number(spanMs) || 0, intervalMs);
  const includeDate = Boolean(options.detailed) || timelineSpanMs >= dayMs;
  const includeYear = timelineSpanMs >= 365 * dayMs;
  if (intervalMs < dayMs && includeDate) {
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      ...(includeYear ? { year: "numeric" } : {}),
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (intervalMs < dayMs) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  });
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
  syncEventIntervalDropdown();
}

function syncEventIntervalDropdown() {
  if (!eventIntervalSelect || !eventIntervalButton || !eventIntervalMenu) return;
  const selectedOption = eventIntervalSelect.selectedOptions[0]
    || [...eventIntervalSelect.options].find((option) => option.value === selectedEventInterval)
    || eventIntervalSelect.options[0];
  const selectedValue = selectedOption?.value || "auto";
  const selectedLabel = selectedOption?.textContent?.trim() || "Auto";
  if (eventIntervalButtonLabel) eventIntervalButtonLabel.textContent = selectedLabel;
  eventIntervalButton.disabled = eventIntervalSelect.disabled;
  eventIntervalMenu.innerHTML = [...eventIntervalSelect.options]
    .filter((option) => !option.hidden && !option.disabled)
    .map((option) => `
      <button class="eventIntervalOption" type="button" role="option" tabindex="-1" data-event-interval="${escapeHtml(option.value)}" aria-selected="${option.value === selectedValue}">
        <span>${escapeHtml(option.textContent.trim())}</span>
        <span class="eventIntervalOptionCheck" aria-hidden="true">✓</span>
      </button>
    `)
    .join("");
}

function toggleEventIntervalMenu() {
  if (!eventIntervalMenu || !eventIntervalButton || eventIntervalButton.disabled) return;
  if (eventIntervalMenu.hidden) openEventIntervalMenu();
  else closeEventIntervalMenu();
}

function openEventIntervalMenu(options = {}) {
  if (!eventIntervalMenu || !eventIntervalButton || eventIntervalButton.disabled) return;
  syncEventIntervalDropdown();
  eventIntervalMenu.hidden = false;
  eventIntervalButton.setAttribute("aria-expanded", "true");
  const items = getEventIntervalOptions();
  const selectedItem = eventIntervalMenu.querySelector('[aria-selected="true"]');
  const focusTarget = options.focus === "last"
    ? items.at(-1)
    : selectedItem || items[0];
  focusTarget?.focus();
}

function closeEventIntervalMenu(options = {}) {
  if (!eventIntervalMenu || !eventIntervalButton) return;
  eventIntervalMenu.hidden = true;
  eventIntervalButton.setAttribute("aria-expanded", "false");
  if (options.restoreFocus) eventIntervalButton.focus();
}

function handleEventIntervalMenuClick(event) {
  const option = event.target.closest("[data-event-interval]");
  if (!option || !eventIntervalSelect) return;
  const interval = option.dataset.eventInterval || "auto";
  const changed = interval !== eventIntervalSelect.value;
  eventIntervalSelect.value = interval;
  closeEventIntervalMenu({ restoreFocus: true });
  if (changed) eventIntervalSelect.dispatchEvent(new Event("change", { bubbles: true }));
  else syncEventIntervalDropdown();
}

function handleEventIntervalTriggerKeydown(event) {
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  openEventIntervalMenu({ focus: event.key === "ArrowUp" ? "last" : "selected" });
}

function handleEventIntervalMenuKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeEventIntervalMenu({ restoreFocus: true });
    return;
  }
  if (event.key === "Tab") {
    closeEventIntervalMenu();
    return;
  }
  const options = getEventIntervalOptions();
  const currentIndex = options.indexOf(document.activeElement);
  let nextIndex = null;
  if (event.key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % options.length;
  if (event.key === "ArrowUp") nextIndex = currentIndex < 0 ? options.length - 1 : (currentIndex - 1 + options.length) % options.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = options.length - 1;
  if (nextIndex === null || !options.length) return;
  event.preventDefault();
  options[nextIndex]?.focus();
}

function handleEventIntervalOutsidePointer(event) {
  if (!eventIntervalMenu || eventIntervalMenu.hidden) return;
  if (eventIntervalButton?.contains(event.target) || eventIntervalMenu.contains(event.target)) return;
  closeEventIntervalMenu();
}

function getEventIntervalOptions() {
  return eventIntervalMenu ? [...eventIntervalMenu.querySelectorAll("[data-event-interval]")] : [];
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

function updateFunnelIntervalControl(funnel) {
  if (!funnelIntervalSelect) return;
  const timeline = funnel?.timeline;
  const availableIntervals = new Set(timeline?.availableIntervals || []);
  for (const option of funnelIntervalSelect.options) {
    if (option.value === "auto") continue;
    const isAvailable = !timeline || availableIntervals.has(option.value);
    option.hidden = !isAvailable;
    option.disabled = !isAvailable;
  }

  const forcedInterval = timeline?.selectedInterval;
  if (forcedInterval && forcedInterval !== selectedFunnelInterval) {
    selectedFunnelInterval = forcedInterval;
  }
  const autoOption = funnelIntervalSelect.querySelector('option[value="auto"]');
  if (autoOption) {
    autoOption.textContent = `Auto (${formatEventInterval(timeline?.bucketMs || 24 * 60 * 60 * 1000)})`;
  }
  if (funnelIntervalSelect.value !== selectedFunnelInterval) {
    funnelIntervalSelect.value = selectedFunnelInterval;
  }
  syncFunnelIntervalDropdown();
}

function syncFunnelIntervalDropdown() {
  if (!funnelIntervalSelect || !funnelIntervalButton || !funnelIntervalMenu) return;
  const selectedOption = funnelIntervalSelect.selectedOptions[0]
    || [...funnelIntervalSelect.options].find((option) => option.value === selectedFunnelInterval)
    || funnelIntervalSelect.options[0];
  const selectedValue = selectedOption?.value || "auto";
  const selectedLabel = selectedOption?.textContent?.trim() || "Auto";
  if (funnelIntervalButtonLabel) funnelIntervalButtonLabel.textContent = selectedLabel;
  funnelIntervalButton.disabled = funnelIntervalSelect.disabled;
  funnelIntervalMenu.innerHTML = [...funnelIntervalSelect.options]
    .filter((option) => !option.hidden && !option.disabled)
    .map((option) => `
      <button class="eventIntervalOption" type="button" role="option" tabindex="-1" data-funnel-interval="${escapeHtml(option.value)}" aria-selected="${option.value === selectedValue}">
        <span>${escapeHtml(option.textContent.trim())}</span>
        <span class="eventIntervalOptionCheck" aria-hidden="true">&#10003;</span>
      </button>
    `)
    .join("");
}

function toggleFunnelIntervalMenu() {
  if (!funnelIntervalMenu || !funnelIntervalButton || funnelIntervalButton.disabled) return;
  if (funnelIntervalMenu.hidden) openFunnelIntervalMenu();
  else closeFunnelIntervalMenu();
}

function openFunnelIntervalMenu(options = {}) {
  if (!funnelIntervalMenu || !funnelIntervalButton || funnelIntervalButton.disabled) return;
  closeFunnelTimelineStepMenu();
  syncFunnelIntervalDropdown();
  funnelIntervalMenu.hidden = false;
  funnelIntervalButton.setAttribute("aria-expanded", "true");
  const items = getFunnelIntervalOptions();
  const selectedItem = funnelIntervalMenu.querySelector('[aria-selected="true"]');
  const focusTarget = options.focus === "last"
    ? items.at(-1)
    : selectedItem || items[0];
  focusTarget?.focus();
}

function closeFunnelIntervalMenu(options = {}) {
  if (!funnelIntervalMenu || !funnelIntervalButton) return;
  funnelIntervalMenu.hidden = true;
  funnelIntervalButton.setAttribute("aria-expanded", "false");
  if (options.restoreFocus) funnelIntervalButton.focus();
}

function handleFunnelIntervalMenuClick(event) {
  const option = event.target.closest("[data-funnel-interval]");
  if (!option || !funnelIntervalSelect) return;
  const interval = option.dataset.funnelInterval || "auto";
  const changed = interval !== funnelIntervalSelect.value;
  funnelIntervalSelect.value = interval;
  closeFunnelIntervalMenu({ restoreFocus: true });
  if (changed) funnelIntervalSelect.dispatchEvent(new Event("change", { bubbles: true }));
  else syncFunnelIntervalDropdown();
}

function handleFunnelIntervalTriggerKeydown(event) {
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  openFunnelIntervalMenu({ focus: event.key === "ArrowUp" ? "last" : "selected" });
}

function handleFunnelIntervalMenuKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeFunnelIntervalMenu({ restoreFocus: true });
    return;
  }
  if (event.key === "Tab") {
    closeFunnelIntervalMenu();
    return;
  }
  const options = getFunnelIntervalOptions();
  const currentIndex = options.indexOf(document.activeElement);
  let nextIndex = null;
  if (event.key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % options.length;
  if (event.key === "ArrowUp") nextIndex = currentIndex < 0 ? options.length - 1 : (currentIndex - 1 + options.length) % options.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = options.length - 1;
  if (nextIndex === null || !options.length) return;
  event.preventDefault();
  options[nextIndex]?.focus();
}

function handleFunnelIntervalOutsidePointer(event) {
  if (!funnelIntervalMenu || funnelIntervalMenu.hidden) return;
  if (funnelIntervalButton?.contains(event.target) || funnelIntervalMenu.contains(event.target)) return;
  closeFunnelIntervalMenu();
}

function getFunnelIntervalOptions() {
  return funnelIntervalMenu
    ? [...funnelIntervalMenu.querySelectorAll("[data-funnel-interval]")]
    : [];
}

function renderCustomEventProperties(properties, releaseMarkers = [], options = {}) {
  if (!eventPropertyList) return;
  const cleanProperties = (Array.isArray(properties) ? properties : [])
    .filter((property) => property?.name)
    .sort((left, right) => getEventPropertyPriority(left, selectedCustomEventName) - getEventPropertyPriority(right, selectedCustomEventName)
      || (Number(right.eventCount ?? right.count) || 0) - (Number(left.eventCount ?? left.count) || 0)
      || String(left.name).localeCompare(String(right.name)));
  const isCreatedPlaceholder = !cleanProperties.length && options.showCreatedPlaceholder;
  const visibleProperties = isCreatedPlaceholder
    ? getCreatedEventPlaceholderProperties(options.definition)
    : cleanProperties;

  if (!visibleProperties.length) {
    eventPropertyList.innerHTML = '<p class="status eventPropertyEmptyRow">No properties were sent with this event.</p>';
    return;
  }

  let selectedPropertyIndex = visibleProperties
    .findIndex((property) => property.name === selectedEventPropertyName);
  if (selectedPropertyIndex < 0) selectedPropertyIndex = 0;
  const selectedProperty = visibleProperties[selectedPropertyIndex];
  selectedEventPropertyName = selectedProperty.name;

  eventPropertyList.innerHTML = `
    ${renderEventPropertyTabs(visibleProperties, selectedProperty.name, {
      canManageValues: options.selectedEvent?.sourceType === "custom"
        && options.selectedEvent?.definition
        && selectedProperty.name !== "Event activity",
    })}
    <div class="eventPropertyWorkspace">
      ${isCreatedPlaceholder
        ? renderCreatedEventPropertyPlaceholder(selectedProperty.name)
        : renderCustomEventPropertyCard(selectedProperty, selectedPropertyIndex)}
    </div>
  `;

  const emptyChart = eventPropertyList.querySelector("[data-event-property-empty-chart]");
  if (emptyChart) {
    renderEmptyCustomEventPropertyChart(emptyChart, options.selectedEvent, releaseMarkers);
    return;
  }

  const chart = eventPropertyList.querySelector("[data-event-property-chart-index]");
  if (chart) {
    if (getEventPropertyChartSeries(selectedProperty).length) {
      renderCustomEventPropertyChart(chart, selectedProperty, releaseMarkers);
    } else {
      chart.dataset.eventPropertyName = selectedProperty.name;
      renderEmptyCustomEventPropertyChart(chart, options.selectedEvent, releaseMarkers);
    }
  }
}

function getCreatedEventPlaceholderProperties(definition = {}) {
  const propertyNames = [...new Set(
    (Array.isArray(definition?.effectiveProperties) ? definition.effectiveProperties : [])
      .map((property) => String(property?.name || "").trim())
      .filter(Boolean),
  )];
  const visiblePropertyNames = propertyNames.length ? propertyNames : ["Event activity"];
  return visiblePropertyNames.map((name) => ({ name }));
}

function renderEventPropertyTabs(properties = [], activePropertyName = "", options = {}) {
  const primaryProperties = properties.slice(0, EVENT_PROPERTY_PRIMARY_TAB_LIMIT);
  const overflowProperties = properties.slice(EVENT_PROPERTY_PRIMARY_TAB_LIMIT);
  const activeOverflowProperty = overflowProperties
    .find((property) => property.name === activePropertyName);
  const primaryTabs = primaryProperties
    .map((property) => renderEventPropertyTab(property, activePropertyName))
    .join("");
  const overflowMenu = overflowProperties.length
    ? `
      <details class="eventPropertyMore">
        <summary class="eventPropertyMoreButton ${activeOverflowProperty ? "active" : ""}">
          <span>${escapeHtml(activeOverflowProperty ? formatEventPropertyName(activeOverflowProperty.name) : "More")}</span>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
        </summary>
        <div class="eventPropertyMoreMenu" role="menu" aria-label="More properties">
          ${overflowProperties.map((property) => {
            const isActive = property.name === activePropertyName;
            return `
              <button type="button" role="menuitemradio" aria-checked="${isActive}" class="${isActive ? "active" : ""}" data-event-property-tab="${escapeHtml(property.name)}">
                ${escapeHtml(formatEventPropertyName(property.name))}
              </button>`;
          }).join("")}
        </div>
      </details>`
    : "";
  const manageButton = options.canManageValues
    ? `
      <button class="eventPropertyManageValuesButton" type="button" data-event-property-manage-values>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M4 17h16M18 7h2M4 12h3M11 12h9" /><circle cx="16" cy="7" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="8" cy="17" r="2" /></svg>
        <span>Manage values &amp; colors</span>
      </button>`
    : "";

  return `
    <nav class="eventPropertyTabs" aria-label="Event properties">
      <div class="eventPropertyTabList" role="tablist" aria-label="Choose a property">
        ${primaryTabs}
      </div>
      ${overflowMenu}
      ${manageButton}
    </nav>`;
}

function renderEventPropertyTab(property = {}, activePropertyName = "") {
  const propertyName = String(property.name || "Property");
  const isActive = propertyName === activePropertyName;
  return `
    <button
      type="button"
      role="tab"
      class="eventPropertyTab ${isActive ? "active" : ""}"
      aria-selected="${isActive}"
      tabindex="${isActive ? "0" : "-1"}"
      data-event-property-tab="${escapeHtml(propertyName)}"
    >${escapeHtml(formatEventPropertyName(propertyName))}</button>`;
}

function handleEventPropertyTabClick(event) {
  const manageButton = event.target.closest("[data-event-property-manage-values]");
  if (manageButton && eventPropertyList?.contains(manageButton)) {
    openEventValueManager(manageButton);
    return;
  }
  const button = event.target.closest("[data-event-property-tab]");
  if (!button || !eventPropertyList?.contains(button)) return;
  selectEventPropertyTab(button.dataset.eventPropertyTab || "");
}

function handleEventPropertyTabKeydown(event) {
  if (event.key === "Escape") {
    const more = eventPropertyList?.querySelector(".eventPropertyMore[open]");
    if (more) {
      event.preventDefault();
      more.removeAttribute("open");
      more.querySelector("summary")?.focus({ preventScroll: true });
    }
    return;
  }
  if (!event.target.closest("[data-event-property-tab]")) return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const propertyNames = getCurrentEventPropertyNames();
  if (!propertyNames.length) return;
  const currentIndex = Math.max(propertyNames.indexOf(selectedEventPropertyName), 0);
  const nextIndex = event.key === "Home"
    ? 0
    : event.key === "End"
      ? propertyNames.length - 1
      : event.key === "ArrowLeft"
        ? (currentIndex - 1 + propertyNames.length) % propertyNames.length
        : (currentIndex + 1) % propertyNames.length;
  event.preventDefault();
  selectEventPropertyTab(propertyNames[nextIndex], { focus: true });
}

function handleEventPropertyMoreOutsidePointer(event) {
  const more = eventPropertyList?.querySelector(".eventPropertyMore[open]");
  if (!more || more.contains(event.target)) return;
  more.removeAttribute("open");
}

function getCurrentEventPropertyNames() {
  const observedProperties = (Array.isArray(currentSelectedEvent?.properties)
    ? currentSelectedEvent.properties
    : [])
    .filter((property) => property?.name)
    .sort((left, right) => getEventPropertyPriority(left, selectedCustomEventName) - getEventPropertyPriority(right, selectedCustomEventName)
      || (Number(right.eventCount ?? right.count) || 0) - (Number(left.eventCount ?? left.count) || 0)
      || String(left.name).localeCompare(String(right.name)));
  const properties = observedProperties.length
    ? observedProperties
    : shouldRenderCreatedEventPlaceholder(currentSelectedEvent)
      ? getCreatedEventPlaceholderProperties(currentSelectedEvent?.definition)
      : [];
  return properties.map((property) => property.name);
}

function selectEventPropertyTab(propertyName, options = {}) {
  const cleanPropertyName = String(propertyName || "");
  if (!cleanPropertyName || !getCurrentEventPropertyNames().includes(cleanPropertyName)) return;
  selectedEventPropertyName = cleanPropertyName;
  renderCustomEventProperties(
    currentSelectedEvent?.properties || [],
    currentSelectedEvent?.releaseMarkers || [],
    {
      showCreatedPlaceholder: shouldRenderCreatedEventPlaceholder(currentSelectedEvent),
      definition: currentSelectedEvent?.definition || null,
      selectedEvent: currentSelectedEvent,
    },
  );
  if (!options.focus) return;
  requestAnimationFrame(() => {
    const tab = [...eventPropertyList.querySelectorAll("[data-event-property-tab]")]
      .find((button) => button.dataset.eventPropertyTab === cleanPropertyName);
    const focusTarget = tab?.closest(".eventPropertyMore")
      ? eventPropertyList.querySelector(".eventPropertyMoreButton")
      : tab;
    focusTarget?.focus({ preventScroll: true });
  });
}

function getEventPropertyValueIdentity(value, valueType = typeof value) {
  const normalized = normalizeManagedEventPropertyValue(value, valueType);
  if (!normalized.ok) return "";
  return `${normalized.valueType}:${String(normalized.value)}`;
}

function normalizeManagedEventPropertyValue(value, valueType = "string") {
  if (valueType === "number") {
    const number = Number(value);
    return Number.isFinite(number)
      ? { ok: true, value: number, valueType: "number" }
      : { ok: false, error: "Enter a valid number for every value." };
  }
  if (valueType === "boolean") {
    if (value === true || String(value).toLowerCase() === "true") {
      return { ok: true, value: true, valueType: "boolean" };
    }
    if (value === false || String(value).toLowerCase() === "false") {
      return { ok: true, value: false, valueType: "boolean" };
    }
    return { ok: false, error: "Boolean values must be true or false." };
  }
  const text = String(value ?? "").trim();
  return text
    ? { ok: true, value: text.slice(0, 240), valueType: "string" }
    : { ok: false, error: "Name or remove every value." };
}

function getSelectedEventProperty() {
  return (currentSelectedEvent?.properties || [])
    .find((property) => property?.name === selectedEventPropertyName)
    || null;
}

function getNewManagedEventPropertyValueType() {
  const configuredType = (currentSelectedEvent?.definition?.properties || [])
    .find((property) => property?.name === selectedEventPropertyName)
    ?.type;
  if (configuredType === "number" || configuredType === "boolean") return configuredType;
  const selectedProperty = getSelectedEventProperty();
  const observedValueTypes = new Set(
    (selectedProperty?.timeline?.series || [])
      .filter((series) => !series?.isOther && series?.valueType !== "range")
      .map((series) => series?.valueType)
      .filter((valueType) => ["string", "number", "boolean"].includes(valueType)),
  );
  if (observedValueTypes.size === 1) return [...observedValueTypes][0];
  return selectedProperty?.type === "number" ? "number" : "string";
}

function getCurrentEventPropertyValueRows() {
  const propertyName = selectedEventPropertyName;
  const definitionSettings = Array.isArray(currentSelectedEvent?.definition?.valueSettings)
    ? currentSelectedEvent.definition.valueSettings
    : [];
  eventValueManagerUntouchedSettings = definitionSettings
    .filter((setting) => setting?.propertyName !== propertyName)
    .map((setting) => ({ ...setting }));
  const selectedSettings = definitionSettings
    .filter((setting) => setting?.propertyName === propertyName);
  const settingsByIdentity = new Map(
    selectedSettings.map((setting) => [
      getEventPropertyValueIdentity(setting.value, setting.valueType),
      setting,
    ]),
  );
  const rowsByIdentity = new Map();
  const propertySeries = getEventPropertyChartSeries(getSelectedEventProperty() || {});
  for (const series of propertySeries) {
    if (series?.isOther || series?.valueType === "range") continue;
    const valueType = ["string", "number", "boolean"].includes(series.valueType)
      ? series.valueType
      : typeof series.value;
    const identity = getEventPropertyValueIdentity(series.value, valueType);
    if (!identity) continue;
    const savedSetting = settingsByIdentity.get(identity);
    if (savedSetting?.hidden) continue;
    rowsByIdentity.set(identity, {
      value: series.value,
      valueType,
      color: savedSetting?.color || getEventPropertySeriesColor(series, propertyName),
      displayName: savedSetting?.displayName || series.displayName || "",
      manual: Boolean(savedSetting?.manual),
      hidden: false,
      observed: Number(series.count) > 0 || !savedSetting?.manual,
      persisted: Boolean(savedSetting),
      originalValue: series.value,
      originalValueType: valueType,
    });
  }
  for (const setting of selectedSettings) {
    const identity = getEventPropertyValueIdentity(setting.value, setting.valueType);
    if (!identity || rowsByIdentity.has(identity)) continue;
    rowsByIdentity.set(identity, {
      value: setting.value,
      valueType: setting.valueType,
      color: setting.color || getEventPropertySeriesColor(setting, propertyName),
      displayName: setting.displayName || "",
      manual: Boolean(setting.manual),
      hidden: Boolean(setting.hidden),
      observed: !setting.manual,
      persisted: true,
      originalValue: setting.value,
      originalValueType: setting.valueType,
    });
  }
  return [...rowsByIdentity.values()];
}

function openEventValueManager(returnFocus) {
  if (
    !eventValueManagerDialog
    || currentSelectedEvent?.sourceType !== "custom"
    || !currentSelectedEvent?.definition
    || !selectedEventPropertyName
  ) {
    return;
  }
  eventValueManagerReturnFocus = returnFocus || document.activeElement;
  eventValueManagerRows = getCurrentEventPropertyValueRows();
  eventValueManagerDirty = false;
  if (eventValueManagerPropertyName) {
    eventValueManagerPropertyName.textContent = formatEventPropertyName(selectedEventPropertyName);
  }
  if (eventValueManagerStatus) eventValueManagerStatus.textContent = "";
  eventValueManagerDialog.hidden = false;
  document.body.classList.add("hasEventValueManager");
  renderEventValueManagerRows();
  requestAnimationFrame(() => eventValueManagerCloseButton?.focus());
}

async function closeEventValueManager(options = {}) {
  if (!eventValueManagerDialog || eventValueManagerDialog.hidden) return true;
  if (eventValueManagerDirty && !options.force) {
    const confirmed = await showEventConfirmation({
      title: "Discard value changes?",
      description: "Your value names, colors, and deletions have not been saved.",
      confirmLabel: "Discard changes",
      danger: true,
      returnFocus: eventValueManagerCancelButton,
    });
    if (!confirmed) return false;
  }
  const returnFocus = eventValueManagerReturnFocus;
  eventValueManagerDirty = false;
  eventValueManagerRows = [];
  eventValueManagerUntouchedSettings = [];
  eventValueManagerReturnFocus = null;
  eventValueManagerDialog.hidden = true;
  document.body.classList.remove("hasEventValueManager");
  if (!options.skipFocus) requestAnimationFrame(() => returnFocus?.isConnected && returnFocus.focus());
  return true;
}

function renderEventValueManagerRows(options = {}) {
  if (!eventValueManagerList) return;
  const visibleRows = eventValueManagerRows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !row.hidden);
  eventValueManagerList.innerHTML = visibleRows.length
    ? visibleRows.map(({ row, index }) => renderEventValueManagerRow(row, index)).join("")
    : `
      <div class="eventValueManagerEmpty">
        <strong>No visible values</strong>
        <span>Add one now or wait for Roblox to send a value.</span>
      </div>`;
  if (eventValueManagerAddButton) {
    eventValueManagerAddButton.disabled = visibleRows.length >= MAX_EVENT_PROPERTY_MANAGED_VALUES;
  }
  if (Number.isInteger(options.focusIndex)) {
    requestAnimationFrame(() => {
      eventValueManagerList
        ?.querySelector(`[data-event-value-input="${options.focusIndex}"]`)
        ?.focus();
    });
  }
}

function renderEventValueManagerRow(row, index) {
  const color = /^#[0-9a-f]{6}$/i.test(String(row.color || ""))
    ? String(row.color).toLowerCase()
    : getEventPropertySeriesColor(row, selectedEventPropertyName);
  const displayName = getEventValueManagerDisplayName(row);
  const rawValueControl = row.valueType === "boolean"
    ? `
      <select data-event-value-input="${index}" aria-label="Real Roblox value ${index + 1}">
        <option value="true" ${row.value === true || row.value === "true" ? "selected" : ""}>True</option>
        <option value="false" ${row.value === false || row.value === "false" ? "selected" : ""}>False</option>
      </select>`
    : `
      <input
        data-event-value-input="${index}"
        type="${row.valueType === "number" ? "number" : "text"}"
        ${row.valueType === "number" ? 'step="any"' : 'maxlength="240"'}
        value="${escapeHtml(String(row.value ?? ""))}"
        placeholder="Real value sent by Roblox"
        aria-label="Real Roblox value ${index + 1}"
      >`;
  return `
    <div class="eventValueManagerRow" data-event-value-row="${index}">
      <div class="eventValueManagerValue">
        <label class="eventValueManagerValueLabel">
          <span>Display name</span>
          <input
            data-event-value-display-name="${index}"
            type="text"
            value="${escapeHtml(displayName)}"
            maxlength="80"
            placeholder="Display name"
            aria-label="Display name ${index + 1}"
          >
        </label>
        <label class="eventValueManagerValueLabel" title="Changing this value changes which Roblox data the row matches.">
          <span>Roblox value</span>
          ${rawValueControl}
        </label>
      </div>
      <label class="eventValueManagerColorEditor">
        <span>Color</span>
        <span class="eventValueManagerColorControls">
          <input
            class="eventValueManagerColorWheel"
            type="color"
            value="${color}"
            data-event-value-color="${index}"
            aria-label="Open color picker for ${escapeHtml(formatEventPropertyValue(row.value))}"
            title="Open color picker"
          >
          <input
            class="eventValueManagerHexInput"
            type="text"
            value="${color}"
            maxlength="7"
            spellcheck="false"
            data-event-value-color-text="${index}"
            aria-label="Hex color for ${escapeHtml(formatEventPropertyValue(row.value))}"
          >
        </span>
      </label>
      <button class="eventValueManagerDeleteButton" type="button" data-event-value-action="delete" data-event-value-index="${index}" aria-label="Delete ${escapeHtml(formatEventPropertyValue(row.value))}" title="Delete value">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>
      </button>
    </div>`;
}

function getEventValueManagerDisplayName(row = {}) {
  const savedDisplayName = String(row.displayName || "").trim();
  if (savedDisplayName) return savedDisplayName;
  return row.value === "" || row.value === null || row.value === undefined
    ? ""
    : formatEventPropertyValue(row.value);
}

function addEventValueManagerRow() {
  const visibleCount = eventValueManagerRows.filter((row) => !row.hidden).length;
  if (visibleCount >= MAX_EVENT_PROPERTY_MANAGED_VALUES) return;
  const valueType = getNewManagedEventPropertyValueType();
  const value = valueType === "number" ? 0 : valueType === "boolean" ? true : "";
  const usedColors = new Set(
    eventValueManagerRows
      .filter((row) => !row.hidden)
      .map((row) => String(row.color || "").toLowerCase()),
  );
  const color = EVENT_PROPERTY_SERIES_COLORS.find((candidate) => !usedColors.has(candidate))
    || EVENT_PROPERTY_SERIES_COLORS[visibleCount % EVENT_PROPERTY_SERIES_COLORS.length];
  eventValueManagerRows.push({
    value,
    valueType,
    color,
    displayName: "",
    manual: true,
    hidden: false,
    observed: false,
    persisted: false,
    originalValue: value,
    originalValueType: valueType,
  });
  eventValueManagerDirty = true;
  if (eventValueManagerStatus) eventValueManagerStatus.textContent = "";
  renderEventValueManagerRows({ focusIndex: eventValueManagerRows.length - 1 });
}

function handleEventValueManagerInput(event) {
  const valueIndex = Number(
    event.target.dataset.eventValueInput
    ?? event.target.dataset.eventValueDisplayName
    ?? event.target.dataset.eventValueColor
    ?? event.target.dataset.eventValueColorText,
  );
  if (!Number.isInteger(valueIndex) || !eventValueManagerRows[valueIndex]) return;
  const row = eventValueManagerRows[valueIndex];
  if (event.target.matches("[data-event-value-input]")) {
    row.value = row.valueType === "boolean"
      ? event.target.value === "true"
      : event.target.value;
    if (!String(row.displayName || "").trim()) {
      const displayNameInput = eventValueManagerList
        ?.querySelector(`[data-event-value-display-name="${valueIndex}"]`);
      if (displayNameInput) displayNameInput.value = getEventValueManagerDisplayName(row);
    }
  } else if (event.target.matches("[data-event-value-display-name]")) {
    row.displayName = String(event.target.value || "").slice(0, 80);
  } else if (event.target.matches("[data-event-value-color]")) {
    row.color = event.target.value.toLowerCase();
    const textInput = eventValueManagerList?.querySelector(`[data-event-value-color-text="${valueIndex}"]`);
    if (textInput) textInput.value = row.color;
  } else if (event.target.matches("[data-event-value-color-text]")) {
    const color = String(event.target.value || "").trim().toLowerCase();
    row.color = color;
    if (/^#[0-9a-f]{6}$/.test(color)) {
      const colorInput = eventValueManagerList?.querySelector(`[data-event-value-color="${valueIndex}"]`);
      if (colorInput) colorInput.value = color;
    }
  }
  eventValueManagerDirty = true;
  if (eventValueManagerStatus) eventValueManagerStatus.textContent = "";
}

function handleEventValueManagerAction(event) {
  const button = event.target.closest("[data-event-value-action]");
  if (!button) return;
  const index = Number(button.dataset.eventValueIndex);
  const row = eventValueManagerRows[index];
  if (!row) return;
  if (button.dataset.eventValueAction === "delete") {
    if (row.manual && !row.observed && !row.persisted) {
      eventValueManagerRows.splice(index, 1);
    } else {
      row.hidden = true;
    }
    eventValueManagerDirty = true;
    if (eventValueManagerStatus) eventValueManagerStatus.textContent = "";
    renderEventValueManagerRows();
  }
}

function buildSavedEventValueSettings() {
  const activeSettings = [];
  const activeIdentities = new Set();
  const retiredSettings = [];
  for (const row of eventValueManagerRows.filter((entry) => !entry.hidden)) {
    const normalized = normalizeManagedEventPropertyValue(row.value, row.valueType);
    if (!normalized.ok) return normalized;
    const color = String(row.color || "").trim().toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(color)) {
      return { ok: false, error: "Use a six-digit hex color such as #9b6dff." };
    }
    const identity = getEventPropertyValueIdentity(normalized.value, normalized.valueType);
    if (activeIdentities.has(identity)) {
      return { ok: false, error: `Values must be unique: ${formatEventPropertyValue(normalized.value)}` };
    }
    activeIdentities.add(identity);
    activeSettings.push({
      propertyName: selectedEventPropertyName,
      value: normalized.value,
      valueType: normalized.valueType,
      color,
      manual: Boolean(row.manual),
      hidden: false,
      ...(String(row.displayName || "").trim()
        && String(row.displayName || "").trim() !== formatEventPropertyValue(normalized.value)
        ? { displayName: String(row.displayName).trim() }
        : {}),
    });
    const originalIdentity = getEventPropertyValueIdentity(row.originalValue, row.originalValueType);
    if (row.persisted && originalIdentity && originalIdentity !== identity) {
      retiredSettings.push({
        propertyName: selectedEventPropertyName,
        value: row.originalValue,
        valueType: row.originalValueType,
        color: "",
        manual: false,
        hidden: true,
      });
    }
  }
  if (activeSettings.length > MAX_EVENT_PROPERTY_MANAGED_VALUES) {
    return { ok: false, error: `Keep up to ${MAX_EVENT_PROPERTY_MANAGED_VALUES} visible values per property.` };
  }

  const hiddenSettings = [
    ...eventValueManagerRows.filter((row) => row.hidden).map((row) => ({
      propertyName: selectedEventPropertyName,
      value: row.originalValue,
      valueType: row.originalValueType,
      color: "",
      manual: false,
      hidden: true,
    })),
    ...retiredSettings,
  ];
  const settings = [...eventValueManagerUntouchedSettings, ...activeSettings];
  const identities = new Set(settings.map((setting) => {
    const valueIdentity = getEventPropertyValueIdentity(setting.value, setting.valueType);
    return valueIdentity ? `${setting.propertyName}\u0000${valueIdentity}` : "";
  }).filter(Boolean));
  for (const setting of hiddenSettings) {
    const valueIdentity = getEventPropertyValueIdentity(setting.value, setting.valueType);
    if (!valueIdentity) continue;
    const identity = `${setting.propertyName}\u0000${valueIdentity}`;
    if (identities.has(identity)) continue;
    identities.add(identity);
    settings.push(setting);
  }
  return { ok: true, settings };
}

async function saveEventValueSettings() {
  if (
    !selectedUniverseId
    || !currentSelectedEvent?.definition
    || !eventValueManagerDialog
    || eventValueManagerDialog.hidden
  ) {
    return;
  }
  const result = buildSavedEventValueSettings();
  if (!result.ok) {
    if (eventValueManagerStatus) eventValueManagerStatus.textContent = result.error;
    return;
  }
  setEventValueManagerDisabled(true);
  if (eventValueManagerStatus) eventValueManagerStatus.textContent = "Saving values...";
  try {
    const definition = currentSelectedEvent.definition;
    await request("/api/event-definitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: definition.id,
        universeId: Number(selectedUniverseId),
        eventName: currentSelectedEvent.name,
        properties: definition.properties || [],
        hiddenPropertyNames: definition.hiddenPropertyNames || [],
        valueSettings: result.settings,
      }),
    });
    eventValueManagerDirty = false;
    if (eventValueManagerStatus) eventValueManagerStatus.textContent = "Saved.";
    await loadCustomEvents({ force: true });
    await closeEventValueManager({ force: true });
  } catch (error) {
    handleAuthError(error);
    if (authenticated && eventValueManagerStatus) {
      eventValueManagerStatus.textContent = formatRequestError(error);
    }
  } finally {
    setEventValueManagerDisabled(false);
  }
}

function setEventValueManagerDisabled(disabled) {
  for (const control of eventValueManagerDialog?.querySelectorAll("input, select, button") || []) {
    control.disabled = disabled;
  }
}

function handleEventValueManagerKeydown(event) {
  if (!eventValueManagerDialog || eventValueManagerDialog.hidden) return;
  if (!eventConfirmDialog?.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeEventValueManager();
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [...eventValueManagerDialog.querySelectorAll("input, select, button")]
    .filter((control) => !control.disabled && control.offsetParent !== null);
  if (!controls.length) return;
  const currentIndex = controls.indexOf(document.activeElement);
  const direction = event.shiftKey ? -1 : 1;
  const nextIndex = currentIndex < 0
    ? 0
    : (currentIndex + direction + controls.length) % controls.length;
  event.preventDefault();
  controls[nextIndex].focus();
}

function renderCreatedEventPropertyPlaceholder(propertyName = "Event activity") {
  const formattedPropertyName = formatEventPropertyName(propertyName);
  return `
    <section class="eventPropertyBreakdown eventPropertyBreakdownPlaceholder" aria-label="${escapeHtml(formattedPropertyName)} breakdown awaiting data">
      <div class="eventPropertyChartPane">
        <header class="eventPropertyBreakdownHeader">
          <div class="eventPropertyBreakdownTitle">
            <h3>${escapeHtml(formattedPropertyName)}</h3>
          </div>
        </header>
        <div class="eventPropertyTimeline" data-event-property-empty-chart data-event-property-name="${escapeHtml(propertyName)}" aria-label="${escapeHtml(formattedPropertyName)} timeline has no data yet"></div>
      </div>
      ${renderEmptyEventPropertyRankedBreakdown(propertyName)}
    </section>`;
}

function renderCustomEventPropertyCard(property, propertyIndex) {
  const propertyName = String(property.name || "Property");

  return `
    <section class="eventPropertyBreakdown" aria-label="${escapeHtml(formatEventPropertyName(propertyName))} breakdown">
      <div class="eventPropertyChartPane">
        <header class="eventPropertyBreakdownHeader">
          <div class="eventPropertyBreakdownTitle">
            <h3>${escapeHtml(formatEventPropertyName(propertyName))}</h3>
          </div>
        </header>
        <div class="eventPropertyTimeline" data-event-property-chart-index="${propertyIndex}" aria-label="${escapeHtml(formatEventPropertyName(propertyName))} values over time"></div>
        ${renderEventPropertyAverageLegend(property)}
      </div>
      ${renderEventPropertyRankedBreakdown(property, propertyName)}
    </section>`;
}

function getEventPropertyChartSeries(property = {}) {
  return (Array.isArray(property?.timeline?.series) ? property.timeline.series : [])
    .filter((entry) => (
      Array.isArray(entry?.points)
      && entry.points.length
      && (Number(entry.count) > 0 || entry.managed)
    ));
}

function getEventPropertySeriesColor(entry = {}, propertyName = "") {
  const savedColor = String(entry?.color || "").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(savedColor)) return savedColor;
  const identity = `${propertyName}\u0000${typeof entry?.value}:${String(entry?.value ?? "")}`;
  let hash = 0;
  for (let index = 0; index < identity.length; index += 1) {
    hash = ((hash * 31) + identity.charCodeAt(index)) >>> 0;
  }
  return EVENT_PROPERTY_SERIES_COLORS[hash % EVENT_PROPERTY_SERIES_COLORS.length];
}

function renderEventPropertyAverageLegend(property = {}) {
  const series = getEventPropertyChartSeries(property);
  if (!series.length) return "";
  const items = series.map((entry) => {
    const color = getEventPropertySeriesColor(entry, property.name);
    const value = String(entry.displayName || "").trim() || formatEventPropertyValue(entry.value);
    return `
      <span class="eventPropertyAverageItem" title="${escapeHtml(value)}" aria-label="${escapeHtml(value)}">
        <span class="eventPropertyAverageKey">
          <i style="background:${color}" aria-hidden="true"></i>
          <strong>${escapeHtml(value)}</strong>
        </span>
      </span>`;
  }).join("");
  return `
    <div class="eventPropertyAverageLegend" aria-label="Property values">
      ${items}
    </div>`;
}

function renderEventPropertyRankedBreakdown(property = {}, propertyName = "Property") {
  const rankedSeries = getEventPropertyChartSeries(property)
    .map((entry) => ({
      ...entry,
      color: getEventPropertySeriesColor(entry, propertyName),
    }))
    .sort((left, right) => (Number(right.percent) || 0) - (Number(left.percent) || 0));
  if (!rankedSeries.length) return "";

  const rows = rankedSeries.map((entry, index) => {
    const value = String(entry.displayName || "").trim() || formatEventPropertyValue(entry.value);
    const eventCount = Math.max(0, Math.round(Number(entry.count) || 0));
    const percent = Math.max(0, Math.min(Number(entry.percent) || 0, 100));
    const playerCount = Math.max(0, Math.round(Number(entry.playerCount) || 0));
    const percentPlayers = Math.max(0, Math.min(Number(entry.percentPlayers) || 0, 100));
    const averagePlayerShare = Math.max(0, Math.min(Number(entry.averagePlayerShare) || 0, 100));
    const currentPercent = getEventPropertyCurrentMetric(entry.points, "percent");
    const eventPercentChange = renderEventPropertyMetricChange(entry.points, "percent", "Event share");
    const playerPercentChange = renderEventPropertyMetricChange(entry.points, "percentPlayers", "Player reach");
    const averagePlayerShareChange = renderEventPropertyMetricChange(
      entry.points,
      "averagePlayerShare",
      "Average player share",
    );
    return `
      <div class="eventPropertyRankedRow" role="row">
        <span class="eventPropertyRankedPosition" role="cell">${index + 1}</span>
        <span class="eventPropertyRankedValue" role="cell" title="${escapeHtml(value)}">
          <i style="background:${entry.color}" aria-hidden="true"></i>
          <strong>${escapeHtml(value)}</strong>
        </span>
        <b class="eventPropertyRankedEvents" role="cell" title="${formatEventNumber(eventCount)} events">${formatCompactNumber(eventCount)}</b>
        <b class="eventPropertyRankedMetric eventPropertyRankedCurrent" role="cell" title="Latest observed event share">${currentPercent === null ? "—" : `${formatEventNumber(currentPercent)}%`}</b>
        <b class="eventPropertyRankedMetric" role="cell">${formatEventNumber(percent)}%${eventPercentChange}</b>
        <b class="eventPropertyRankedMetric" role="cell" title="${formatEventNumber(playerCount)} players">${formatEventNumber(percentPlayers)}%${playerPercentChange}</b>
        <b class="eventPropertyRankedMetric" role="cell">${formatEventNumber(averagePlayerShare)}%${averagePlayerShareChange}</b>
      </div>`;
  }).join("");

  return `
    <aside class="eventPropertyRanked" aria-label="${escapeHtml(formatEventPropertyName(propertyName))} ranked breakdown">
      <header class="eventPropertyRankedHeader">
        <h4>${escapeHtml(formatEventPropertyName(propertyName))} Breakdown <span>(Ranked)</span></h4>
      </header>
      <div class="eventPropertyRankedTable" role="table">
        <div class="eventPropertyRankedTableHeader" role="row">
          <span role="columnheader">#</span>
          <span role="columnheader">Value</span>
          <span role="columnheader">Events</span>
          <span role="columnheader">Current</span>
          <span role="columnheader">% of Events</span>
          <span role="columnheader">% of Players</span>
          <span role="columnheader">Avg Player Share</span>
        </div>
        <div class="eventPropertyRankedRows" role="rowgroup">${rows}</div>
      </div>
    </aside>`;
}

function renderEmptyEventPropertyRankedBreakdown(propertyName = "Property") {
  return `
    <aside class="eventPropertyRanked eventPropertyRankedPlaceholder" aria-label="${escapeHtml(formatEventPropertyName(propertyName))} ranked breakdown with no data">
      <header class="eventPropertyRankedHeader">
        <h4>${escapeHtml(formatEventPropertyName(propertyName))} Breakdown <span>(Ranked)</span></h4>
      </header>
      <div class="eventPropertyRankedTable" role="table">
        <div class="eventPropertyRankedTableHeader" role="row">
          <span role="columnheader">#</span>
          <span role="columnheader">Value</span>
          <span role="columnheader">Events</span>
          <span role="columnheader">Current</span>
          <span role="columnheader">% of Events</span>
          <span role="columnheader">% of Players</span>
          <span role="columnheader">Avg Player Share</span>
        </div>
        <div class="eventPropertyRankedRows eventPropertyRankedEmptyRows" role="rowgroup">
          <div class="eventPropertyRankedEmptyRow" role="row">
            <span role="cell" aria-colspan="7">No data yet</span>
          </div>
        </div>
      </div>
    </aside>`;
}

function getEventPropertyCurrentMetric(points = [], metricName = "percent") {
  const observedValues = (Array.isArray(points) ? points : [])
    .map((point) => point?.[metricName])
    .filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value)))
    .map(Number);
  return observedValues.length ? observedValues.at(-1) : null;
}

function getEventPropertySeriesMetricChange(points = [], metricName = "percent") {
  const observedPercents = (Array.isArray(points) ? points : [])
    .map((point) => point?.[metricName])
    .filter((percent) => percent !== null && percent !== undefined && Number.isFinite(Number(percent)))
    .map(Number);
  if (observedPercents.length < 2) return 0;
  return observedPercents.at(-1) - observedPercents[0];
}

function renderEventPropertyMetricChange(points = [], metricName = "percent", label = "Share") {
  const change = getEventPropertySeriesMetricChange(points, metricName);
  const direction = change > 0.049 ? "positive" : change < -0.049 ? "negative" : "neutral";
  const arrow = direction === "positive" ? "↑" : direction === "negative" ? "↓" : "→";
  const changeText = `${change > 0 ? "+" : ""}${formatEventNumber(change)}%`;
  return `
    <small class="eventPropertyMetricChange eventPropertyMetricChange-${direction}"
      aria-label="${escapeHtml(label)} change ${escapeHtml(changeText)}">
      (<span aria-hidden="true">${arrow}</span>${changeText})
    </small>`;
}

function renderCustomEventPropertyChart(container, property = {}, releaseMarkers = []) {
  const timeline = property.timeline || {};
  const series = getEventPropertyChartSeries(property);
  if (!series.length) {
    container.innerHTML = '<p class="status">No usable property values in this date range.</p>';
    return;
  }

  const bucketStarts = [...new Set(series.flatMap((entry) => (
    entry.points
      .map((point) => Number(point?.start))
      .filter((start) => Number.isFinite(start) && start > 0)
  )))].sort((leftValue, rightValue) => leftValue - rightValue);
  if (!bucketStarts.length) {
    container.innerHTML = '<p class="status">No usable property values in this date range.</p>';
    return;
  }
  const bucketCount = bucketStarts.length;
  const bucketMs = Number(timeline.bucketMs) || getSeriesBucketMs(bucketStarts.map((start) => ({ start })));
  const timelineStart = Number(timeline.start) || bucketStarts[0];
  const timelineEnd = Math.max(
    Number(timeline.end) || (bucketStarts.at(-1) + bucketMs),
    timelineStart,
  );
  const chartSpanMs = Math.max(timelineEnd - timelineStart, bucketMs);
  const chartWidth = getEventChartWidth(container.clientWidth, bucketCount, 116, 10);
  const chartHeight = 400;
  const left = 54;
  const right = 24;
  const top = 58;
  const bottom = 46;
  const plotWidth = chartWidth - left - right;
  const plotBottom = chartHeight - bottom;
  const plotHeight = plotBottom - top;
  const labelStep = Math.max(1, Math.ceil(bucketCount / 10));
  const xForIndex = (index) => (
    left + (((bucketStarts[index] - timelineStart) / Math.max(timelineEnd - timelineStart, 1)) * plotWidth)
  );
  const yForPercent = (percent) => (
    top + (plotHeight - ((Math.max(0, Math.min(Number(percent) || 0, 100)) / 100) * plotHeight))
  );
  const grid = [100, 75, 50, 25, 0].map((percent) => {
    const y = yForPercent(percent);
    return `
      <line x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}" />
      <text x="${left - 10}" y="${y + 4}" text-anchor="end">${percent}%</text>
    `;
  }).join("");
  const xLabels = bucketStarts.map((start, index) => (
    index === 0 || index === bucketCount - 1 || index % labelStep === 0
      ? `<text class="eventPropertyChartXLabel" x="${xForIndex(index)}" y="${chartHeight - 16}" text-anchor="${index === 0 ? "start" : index === bucketCount - 1 ? "end" : "middle"}">${escapeHtml(formatEventChartLabel(start, bucketMs, chartSpanMs))}</text>`
      : ""
  )).join("");
  const releaseMarkerMarkup = buildEventPropertyReleaseMarkers({
    releaseMarkers,
    bucketStarts,
    bucketMs,
    rangeStart: timelineStart,
    rangeEnd: timelineEnd,
    chartWidth,
    left,
    right,
    top,
    plotBottom,
  });
  const lines = series.map((entry) => {
    const color = getEventPropertySeriesColor(entry, property.name);
    const pointsByStart = new Map(entry.points.map((point) => [Number(point?.start), point]));
    const chartPoints = bucketStarts.map((start, index) => {
      const point = pointsByStart.get(start);
      const percent = point?.percent;
      const hasValue = percent !== null && percent !== undefined && Number.isFinite(Number(percent));
      return {
        start,
        end: Math.max(Number(point?.end) || Math.min(start + bucketMs, timelineEnd), start),
        count: Number(point?.count) || 0,
        percent: hasValue ? Math.max(0, Math.min(Number(percent), 100)) : null,
        x: xForIndex(index),
        y: hasValue ? yForPercent(percent) : null,
      };
    });
    const path = buildRoundedEventPropertyPath(
      completeEventPropertyPathPoints(chartPoints, left, chartWidth - right),
    );
    const dots = chartPoints.map((point) => {
      if (point.y === null) return "";
      const label = String(entry.displayName || "").trim() || formatEventPropertyValue(entry.value);
      const pointStartLabel = formatEventChartLabel(point.start, bucketMs, chartSpanMs, { detailed: true });
      const pointEndLabel = formatEventChartLabel(point.end, bucketMs, chartSpanMs, { detailed: true });
      const dateLabel = point.end > point.start ? `${pointStartLabel} – ${pointEndLabel}` : pointStartLabel;
      return `<circle cx="${point.x}" cy="${point.y}" r="3.5" style="fill:${color};stroke:${color}"><title>${escapeHtml(label)} · ${escapeHtml(dateLabel)}: ${formatEventNumber(point.percent)}% (${formatCompactNumber(point.count)} values)</title></circle>`;
    }).join("");
    return `
      <g class="eventPropertyChartSeries">
        <path d="${path}" style="stroke:${color}" />
        ${dots}
      </g>
    `;
  }).join("");
  container.innerHTML = `
    <div class="eventPropertyChartScroller">
      <svg class="eventPropertyChartSvg" width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="${escapeHtml(formatEventPropertyName(property.name))} percentage by value over time">
        <g class="eventPropertyChartGrid">${grid}</g>
        ${releaseMarkerMarkup}
        <text class="eventPropertyChartYAxisTitle" x="15" y="${top + (plotHeight / 2)}" text-anchor="middle" transform="rotate(-90 15 ${top + (plotHeight / 2)})">Share of values</text>
        ${lines}
        ${xLabels}
      </svg>
    </div>
  `;
}

function renderEmptyCustomEventPropertyChart(container, selectedEvent = {}, releaseMarkers = []) {
  const eventBuckets = (Array.isArray(selectedEvent?.series) ? selectedEvent.series : [])
    .filter((bucket) => Number(bucket?.start) > 0)
    .sort((leftValue, rightValue) => Number(leftValue.start) - Number(rightValue.start));
  const fallbackEnd = Date.now();
  const fallbackStart = fallbackEnd - (24 * 60 * 60 * 1000);
  const bucketMs = Math.max(
    Number(selectedEvent?.bucketMs)
      || getSeriesBucketMs(eventBuckets)
      || 60 * 60 * 1000,
    1,
  );
  const buckets = eventBuckets.length
    ? eventBuckets
    : Array.from({ length: 7 }, (_, index) => ({
        start: fallbackStart + (index * ((fallbackEnd - fallbackStart) / 6)),
        end: fallbackStart + ((index + 1) * ((fallbackEnd - fallbackStart) / 6)),
      }));
  const bucketStarts = buckets.map((bucket) => Number(bucket.start));
  const bucketCount = bucketStarts.length;
  const timelineStart = bucketStarts[0];
  const timelineEnd = Math.max(
    Number(buckets.at(-1)?.end) || (bucketStarts.at(-1) + bucketMs),
    timelineStart + 1,
  );
  const chartSpanMs = Math.max(timelineEnd - timelineStart, bucketMs);
  const chartWidth = getEventChartWidth(container.clientWidth, bucketCount, 116, 10);
  const chartHeight = 400;
  const left = 54;
  const right = 24;
  const top = 58;
  const bottom = 46;
  const plotWidth = chartWidth - left - right;
  const plotBottom = chartHeight - bottom;
  const plotHeight = plotBottom - top;
  const labelStep = Math.max(1, Math.ceil(bucketCount / 10));
  const xForStart = (start) => (
    left + (((start - timelineStart) / Math.max(timelineEnd - timelineStart, 1)) * plotWidth)
  );
  const yForPercent = (percent) => (
    top + (plotHeight - ((percent / 100) * plotHeight))
  );
  const grid = [100, 75, 50, 25, 0].map((percent) => {
    const y = yForPercent(percent);
    return `
      <line x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}" />
      <text x="${left - 10}" y="${y + 4}" text-anchor="end">${percent}%</text>
    `;
  }).join("");
  const xLabels = bucketStarts.map((start, index) => (
    index === 0 || index === bucketCount - 1 || index % labelStep === 0
      ? `<text class="eventPropertyChartXLabel" x="${xForStart(start)}" y="${chartHeight - 16}" text-anchor="${index === 0 ? "start" : index === bucketCount - 1 ? "end" : "middle"}">${escapeHtml(formatEventChartLabel(start, bucketMs, chartSpanMs))}</text>`
      : ""
  )).join("");
  const releaseMarkerMarkup = buildEventPropertyReleaseMarkers({
    releaseMarkers,
    bucketStarts,
    bucketMs,
    rangeStart: timelineStart,
    rangeEnd: timelineEnd,
    chartWidth,
    left,
    right,
    top,
    plotBottom,
  });
  const propertyName = formatEventPropertyName(container.dataset.eventPropertyName || "Event activity");
  container.innerHTML = `
    <div class="eventPropertyChartScroller">
      <svg class="eventPropertyChartSvg" width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="${escapeHtml(propertyName)} percentage by value over time; no data yet">
        <g class="eventPropertyChartGrid">${grid}</g>
        ${releaseMarkerMarkup}
        <text class="eventPropertyChartYAxisTitle" x="15" y="${top + (plotHeight / 2)}" text-anchor="middle" transform="rotate(-90 15 ${top + (plotHeight / 2)})">Share of values</text>
        ${xLabels}
      </svg>
    </div>
  `;
}

function buildEventPropertyReleaseMarkers({
  releaseMarkers = [],
  bucketStarts = [],
  bucketMs = 0,
  rangeStart = 0,
  rangeEnd = 0,
  chartWidth = 0,
  left = 0,
  right = 0,
  top = 0,
  plotBottom = 0,
} = {}) {
  if (!bucketStarts.length || !releaseMarkers.length) return "";
  const timelineStart = Number(rangeStart) || Number(bucketStarts[0]) || 0;
  const timelineEnd = Math.max(
    Number(rangeEnd) || ((Number(bucketStarts.at(-1)) || timelineStart) + (Number(bucketMs) || 0)),
    timelineStart,
  );
  const timelineDuration = timelineEnd - timelineStart;
  const plotWidth = chartWidth - left - right;
  if (timelineStart <= 0 || timelineDuration <= 0 || plotWidth <= 0) return "";

  return releaseMarkers
    .filter((marker) => {
      const publishedAt = Number(marker?.publishedAt) || 0;
      return publishedAt >= timelineStart && publishedAt <= timelineEnd;
    })
    .map((marker) => {
      const publishedAt = Number(marker.publishedAt);
      const x = left + (((publishedAt - timelineStart) / timelineDuration) * plotWidth);
      const labelHalfWidth = 58;
      const labelX = Math.max(left + labelHalfWidth, Math.min(x, chartWidth - right - labelHalfWidth));
      const version = formatReleaseVersion(marker.placeVersion);
      const publishedLabel = new Date(publishedAt).toLocaleDateString([], { month: "short", day: "numeric" });
      return `
        <g class="eventPropertyReleaseMarker">
          <line class="eventPropertyReleaseMarkerLine" x1="${x.toFixed(2)}" y1="${top - 6}" x2="${x.toFixed(2)}" y2="${plotBottom}" />
          <rect x="${(labelX - labelHalfWidth).toFixed(2)}" y="5" width="${labelHalfWidth * 2}" height="40" rx="6" />
          <line class="eventPropertyReleaseMarkerAccent" x1="${(labelX - labelHalfWidth + 1).toFixed(2)}" y1="11" x2="${(labelX - labelHalfWidth + 1).toFixed(2)}" y2="39" />
          <text class="eventPropertyReleaseMarkerTitle" x="${labelX.toFixed(2)}" y="20" text-anchor="middle">Update v${escapeHtml(version)}</text>
          <text class="eventPropertyReleaseMarkerDate" x="${labelX.toFixed(2)}" y="35" text-anchor="middle">Published ${escapeHtml(publishedLabel)}</text>
        </g>`;
    })
    .join("");
}

function buildRoundedEventPropertyPath(points = []) {
  const observedPoints = points.filter((point) => (
    Number.isFinite(point?.x) && Number.isFinite(point?.y)
  ));
  return buildRoundedEventPropertyPathSegment(observedPoints);
}

function completeEventPropertyPathPoints(points = [], left = 0, right = 0) {
  const observedPoints = points
    .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
    .map((point) => ({ ...point }));
  if (!observedPoints.length || right <= left) return observedPoints;

  const first = observedPoints[0];
  const last = observedPoints.at(-1);
  if (first.x > left) observedPoints.unshift({ ...first, x: left, isBoundaryExtension: true });
  if (last.x < right) observedPoints.push({ ...last, x: right, isBoundaryExtension: true });
  return observedPoints;
}

function buildRoundedEventPropertyPathSegment(points) {
  if (!points.length) return "";
  const first = points[0];
  if (points.length === 1) return `M${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  if (points.length === 2) {
    const last = points[1];
    return `M${first.x.toFixed(2)} ${first.y.toFixed(2)} L${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  }

  const slopes = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const width = next.x - point.x;
    return width > 0 ? (next.y - point.y) / width : 0;
  });
  const tangents = points.map((point, index) => {
    if (index === 0) return slopes[0];
    if (index === points.length - 1) return slopes.at(-1);
    const before = slopes[index - 1];
    const after = slopes[index];
    if (!before || !after || Math.sign(before) !== Math.sign(after)) return 0;
    return (2 * before * after) / (before + after);
  });

  for (let index = 0; index < slopes.length; index += 1) {
    const slope = slopes[index];
    if (!slope) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      continue;
    }
    const startRatio = tangents[index] / slope;
    const endRatio = tangents[index + 1] / slope;
    const magnitude = Math.hypot(startRatio, endRatio);
    if (magnitude <= 3) continue;
    const scale = 3 / magnitude;
    tangents[index] = scale * startRatio * slope;
    tangents[index + 1] = scale * endRatio * slope;
  }

  const commands = [`M${first.x.toFixed(2)} ${first.y.toFixed(2)}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const width = end.x - start.x;
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const firstControlY = Math.max(minY, Math.min(maxY, start.y + ((tangents[index] * width) / 3)));
    const secondControlY = Math.max(minY, Math.min(maxY, end.y - ((tangents[index + 1] * width) / 3)));
    commands.push(
      `C${(start.x + (width / 3)).toFixed(2)} ${firstControlY.toFixed(2)} `
      + `${(end.x - (width / 3)).toFixed(2)} ${secondControlY.toFixed(2)} `
      + `${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    );
  }
  return commands.join(" ");
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
    selectedFunnelTimelineSteps.clear();
    renderFunnelCatalog();
    renderFunnelResults(null);
    setFunnelBuilderVisible(false);
    funnelsStatus.textContent = "Connect or select a Roblox game to build funnels.";
    return;
  }

  if (!options.background) funnelsStatus.textContent = "Loading funnels...";
  const params = new URLSearchParams({ universeId });
  const from = getDashboardDateFilterMs(funnelFromFilter);
  const to = getDashboardDateFilterMs(funnelToFilter);
  if (from) params.set("from", String(from));
  if (to) params.set("to", String(to));
  if (selectedFunnelId) params.set("funnelId", selectedFunnelId);
  params.set("interval", selectedFunnelInterval);

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
  if (funnelSelectionActions) funnelSelectionActions.hidden = !hasSelection || builderVisible;
  if (editFunnelButton) editFunnelButton.disabled = !hasSelection || builderVisible;
  if (funnelMoreButton) funnelMoreButton.disabled = !hasSelection || builderVisible;
}

function selectFunnel(id) {
  const funnel = currentFunnels.find((entry) => entry.id === id);
  if (!funnel) return;
  closeFunnelMoreMenu();
  closeFunnelTimelineStepMenu();
  selectedFunnelId = funnel.id;
  isCreatingFunnel = false;
  populateFunnelEditor(funnel);
  setFunnelBuilderVisible(false);
  renderFunnelCatalog();
  renderFunnelResults(funnel);
  loadFunnels({ force: true, background: true });
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
  document.body.classList.toggle("isEditingFunnelDefinition", Boolean(visible));
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

function getEditedFunnelStepColors(steps) {
  const funnel = getSelectedFunnel();
  const existingSteps = Array.isArray(funnel?.steps) ? funnel.steps : [];
  const available = existingSteps.map((eventName, index) => ({
    eventName,
    color: getFunnelStepColor(funnel, index + 1),
    used: false,
  }));
  return (Array.isArray(steps) ? steps : []).map((eventName, index) => {
    const match = available.find((entry) => !entry.used && entry.eventName === eventName);
    if (match) {
      match.used = true;
      return match.color;
    }
    return EVENT_PROPERTY_SERIES_COLORS[index % EVENT_PROPERTY_SERIES_COLORS.length];
  });
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
  const stepColors = getEditedFunnelStepColors(steps);
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
        stepColors,
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

function getFunnelTimelineSteps(funnel) {
  const timelineSteps = funnel?.timeline?.buckets?.find((bucket) => (
    Array.isArray(bucket?.steps) && bucket.steps.length
  ))?.steps;
  if (Array.isArray(timelineSteps) && timelineSteps.length) return timelineSteps;
  return (Array.isArray(funnel?.steps) ? funnel.steps : []).map((eventName, index) => ({
    index: index + 1,
    eventName,
  }));
}

function getFunnelStepColor(funnel, stepIndex) {
  const savedColor = String(funnel?.stepColors?.[Number(stepIndex) - 1] || "").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(savedColor)) return savedColor;
  const paletteIndex = Math.max(Number(stepIndex) - 1, 0) % EVENT_PROPERTY_SERIES_COLORS.length;
  return EVENT_PROPERTY_SERIES_COLORS[paletteIndex];
}

function getFunnelTimelineStepSelection(funnel) {
  if (!funnel?.id) return new Set();
  const steps = getFunnelTimelineSteps(funnel);
  const validIndices = new Set(steps.map((step) => Number(step.index)).filter(Number.isFinite));
  if (!selectedFunnelTimelineSteps.has(funnel.id)) {
    selectedFunnelTimelineSteps.set(funnel.id, new Set(validIndices));
  } else {
    const selection = selectedFunnelTimelineSteps.get(funnel.id);
    for (const index of [...selection]) {
      if (!validIndices.has(index)) selection.delete(index);
    }
  }
  return selectedFunnelTimelineSteps.get(funnel.id);
}

function renderFunnelTimelineStepMenu(funnel) {
  if (!funnelTimelineStepMenu || !funnelTimelineStepPickerButton) return;
  const steps = getFunnelTimelineSteps(funnel);
  const selection = getFunnelTimelineStepSelection(funnel);
  funnelTimelineStepPickerButton.disabled = !funnel || !steps.length;
  if (funnelTimelineStepPickerLabel) {
    funnelTimelineStepPickerLabel.textContent = !steps.length
      ? "No steps"
      : selection.size === steps.length
        ? "All steps"
        : selection.size
          ? `${selection.size} of ${steps.length} steps`
          : "No steps";
  }
  funnelTimelineStepMenu.innerHTML = steps.length
    ? `
      <div class="funnelTimelineStepMenuActions">
        <button type="button" data-funnel-step-selection-action="all">Select all</button>
        <button type="button" data-funnel-step-selection-action="none">Clear</button>
      </div>
      <div class="funnelTimelineStepOptions" role="group" aria-label="Visible Funnel steps">
        ${steps.map((step) => {
          const index = Number(step.index);
          const color = getFunnelStepColor(funnel, index);
          return `
            <label class="funnelTimelineStepOption">
              <input type="checkbox" value="${index}" data-funnel-timeline-step ${selection.has(index) ? "checked" : ""}>
              <span class="funnelTimelineStepCheck" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="m3.5 8.2 2.8 2.8 6.2-6.2" /></svg>
              </span>
              <i style="--funnel-step-color:${color}" aria-hidden="true"></i>
              <span><strong>Step ${index}</strong><small>${escapeHtml(formatEventName(step.eventName))}</small></span>
            </label>`;
        }).join("")}
      </div>
    `
    : '<p class="funnelTimelineStepMenuEmpty">No Funnel steps available.</p>';
}

function toggleFunnelTimelineStepMenu() {
  if (!funnelTimelineStepMenu || !funnelTimelineStepPickerButton || funnelTimelineStepPickerButton.disabled) return;
  if (funnelTimelineStepMenu.hidden) {
    closeFunnelIntervalMenu();
    renderFunnelTimelineStepMenu(getSelectedFunnel());
    funnelTimelineStepMenu.hidden = false;
    funnelTimelineStepPickerButton.setAttribute("aria-expanded", "true");
  } else {
    closeFunnelTimelineStepMenu();
  }
}

function closeFunnelTimelineStepMenu(options = {}) {
  if (!funnelTimelineStepMenu || !funnelTimelineStepPickerButton) return;
  funnelTimelineStepMenu.hidden = true;
  funnelTimelineStepPickerButton.setAttribute("aria-expanded", "false");
  if (options.restoreFocus) funnelTimelineStepPickerButton.focus();
}

function getFunnelTimelineCoincidentPathGroups(seriesModels) {
  const pathsByShape = new Map();
  for (const series of seriesModels) {
    const drawableSegments = [
      ...series.segments.map((points) => ({ points, isGap: false })),
      ...series.gapSegments.map((gap) => ({ points: gap.points, isGap: true })),
    ];
    for (const segment of drawableSegments) {
      if (segment.points.length < 2) continue;
      const path = buildRoundedEventPropertyPathSegment(segment.points);
      if (!path) continue;
      if (!pathsByShape.has(path)) pathsByShape.set(path, []);
      pathsByShape.get(path).push({
        path,
        color: series.color,
        isGap: segment.isGap,
        stepIndex: series.stepIndex,
      });
    }
  }
  return [...pathsByShape.values()].filter((entries) => entries.length > 1);
}

function getFunnelTimelineGapSegments(points, left, right) {
  const observedPoints = points
    .map((point, index) => ({ ...point, index }))
    .filter((point) => Number.isFinite(point.y));
  if (!observedPoints.length) return [];

  const gaps = [];
  const first = observedPoints[0];
  if (first.index > 0 && first.x > left) {
    gaps.push({
      points: [{ ...first, x: left }, first],
      skippedBuckets: first.index,
      isBoundary: true,
    });
  }
  for (let index = 1; index < observedPoints.length; index += 1) {
    const previous = observedPoints[index - 1];
    const next = observedPoints[index];
    const skippedBuckets = next.index - previous.index - 1;
    if (skippedBuckets <= 0) continue;
    gaps.push({
      points: [previous, next],
      skippedBuckets,
      isBoundary: false,
    });
  }
  const last = observedPoints.at(-1);
  if (last.index < points.length - 1 && last.x < right) {
    gaps.push({
      points: [last, { ...last, x: right }],
      skippedBuckets: points.length - last.index - 1,
      isBoundary: true,
    });
  }
  return gaps;
}

function getFunnelTimelineCoincidentPointGroups(seriesModels) {
  const pointsByPosition = new Map();
  for (const series of seriesModels) {
    for (const point of series.points) {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
      const position = `${point.x.toFixed(2)}:${point.y.toFixed(2)}`;
      if (!pointsByPosition.has(position)) pointsByPosition.set(position, []);
      pointsByPosition.get(position).push({
        ...point,
        color: series.color,
        stepIndex: series.stepIndex,
      });
    }
  }
  return [...pointsByPosition.values()].filter((entries) => entries.length > 1);
}

function handleFunnelTimelineStepMenuClick(event) {
  const actionButton = event.target.closest("[data-funnel-step-selection-action]");
  if (!actionButton) return;
  const funnel = getSelectedFunnel();
  if (!funnel) return;
  const selection = getFunnelTimelineStepSelection(funnel);
  const steps = getFunnelTimelineSteps(funnel);
  selection.clear();
  if (actionButton.dataset.funnelStepSelectionAction === "all") {
    for (const step of steps) selection.add(Number(step.index));
  }
  renderFunnelTimelineStepMenu(funnel);
  renderFunnelTimeline(funnel);
}

function handleFunnelTimelineStepSelectionChange(event) {
  const checkbox = event.target.closest("[data-funnel-timeline-step]");
  if (!checkbox) return;
  const funnel = getSelectedFunnel();
  if (!funnel) return;
  const selection = getFunnelTimelineStepSelection(funnel);
  const stepIndex = Number(checkbox.value);
  if (!Number.isFinite(stepIndex)) return;
  if (checkbox.checked) selection.add(stepIndex);
  else selection.delete(stepIndex);
  renderFunnelTimelineStepMenu(funnel);
  renderFunnelTimeline(funnel);
}

function handleFunnelTimelineStepOutsidePointer(event) {
  if (!funnelTimelineStepMenu || funnelTimelineStepMenu.hidden) return;
  if (funnelTimelineStepPickerButton?.contains(event.target) || funnelTimelineStepMenu.contains(event.target)) return;
  closeFunnelTimelineStepMenu();
}

function handleFunnelTimelineStepEscape(event) {
  if (event.key !== "Escape" || !funnelTimelineStepMenu || funnelTimelineStepMenu.hidden) return;
  event.preventDefault();
  closeFunnelTimelineStepMenu({ restoreFocus: true });
}

function openFunnelColorManager(returnFocus) {
  const funnel = getSelectedFunnel();
  if (!funnel || !funnelColorManagerDialog) return;
  closeFunnelTimelineStepMenu();
  funnelColorManagerRows = getFunnelTimelineSteps(funnel).map((step) => ({
    index: Number(step.index),
    eventName: String(step.eventName || ""),
    color: getFunnelStepColor(funnel, step.index),
  }));
  funnelColorManagerDirty = false;
  funnelColorManagerReturnFocus = returnFocus || document.activeElement;
  if (funnelColorManagerName) funnelColorManagerName.textContent = funnel.name || "Selected funnel";
  if (funnelColorManagerStatus) funnelColorManagerStatus.textContent = "";
  funnelColorManagerDialog.hidden = false;
  document.body.classList.add("hasFunnelColorManager");
  renderFunnelColorManagerRows();
  requestAnimationFrame(() => funnelColorManagerCloseButton?.focus());
}

async function closeFunnelColorManager(options = {}) {
  if (!funnelColorManagerDialog || funnelColorManagerDialog.hidden) return true;
  if (funnelColorManagerDirty && !options.force) {
    const confirmed = await showEventConfirmation({
      title: "Discard color changes?",
      description: "Your Funnel step colors have not been saved.",
      confirmLabel: "Discard changes",
      danger: true,
      returnFocus: funnelColorManagerCancelButton,
    });
    if (!confirmed) return false;
  }
  const returnFocus = funnelColorManagerReturnFocus;
  funnelColorManagerDirty = false;
  funnelColorManagerRows = [];
  funnelColorManagerReturnFocus = null;
  funnelColorManagerDialog.hidden = true;
  document.body.classList.remove("hasFunnelColorManager");
  if (!options.skipFocus) requestAnimationFrame(() => returnFocus?.isConnected && returnFocus.focus());
  return true;
}

function renderFunnelColorManagerRows() {
  if (!funnelColorManagerList) return;
  funnelColorManagerList.innerHTML = funnelColorManagerRows.length
    ? funnelColorManagerRows.map((row, index) => {
      const color = /^#[0-9a-f]{6}$/i.test(String(row.color || ""))
        ? String(row.color).toLowerCase()
        : EVENT_PROPERTY_SERIES_COLORS[index % EVENT_PROPERTY_SERIES_COLORS.length];
      const stepName = formatEventName(row.eventName);
      return `
        <div class="funnelColorManagerRow">
          <div class="funnelColorManagerStep">
            <span>${row.index}</span>
            <div>
              <small>Step ${row.index}</small>
              <strong>${escapeHtml(stepName)}</strong>
            </div>
          </div>
          <label class="eventValueManagerColorEditor">
            <span>Color</span>
            <span class="eventValueManagerColorControls">
              <input
                class="eventValueManagerColorWheel"
                type="color"
                value="${color}"
                data-funnel-step-color="${index}"
                aria-label="Open color picker for Step ${row.index}, ${escapeHtml(stepName)}"
                title="Open color picker"
              >
              <input
                class="eventValueManagerHexInput"
                type="text"
                value="${escapeHtml(String(row.color || color))}"
                maxlength="7"
                spellcheck="false"
                data-funnel-step-color-text="${index}"
                aria-label="Hex color for Step ${row.index}, ${escapeHtml(stepName)}"
              >
            </span>
          </label>
        </div>`;
    }).join("")
    : '<div class="eventValueManagerEmpty"><strong>No Funnel steps</strong><span>Add steps before managing colors.</span></div>';
}

function handleFunnelColorManagerInput(event) {
  const rowIndex = Number(
    event.target.dataset.funnelStepColor
    ?? event.target.dataset.funnelStepColorText,
  );
  if (!Number.isInteger(rowIndex) || !funnelColorManagerRows[rowIndex]) return;
  const row = funnelColorManagerRows[rowIndex];
  if (event.target.matches("[data-funnel-step-color]")) {
    row.color = String(event.target.value || "").toLowerCase();
    const textInput = funnelColorManagerList?.querySelector(`[data-funnel-step-color-text="${rowIndex}"]`);
    if (textInput) textInput.value = row.color;
  } else if (event.target.matches("[data-funnel-step-color-text]")) {
    row.color = String(event.target.value || "").trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(row.color)) {
      const colorInput = funnelColorManagerList?.querySelector(`[data-funnel-step-color="${rowIndex}"]`);
      if (colorInput) colorInput.value = row.color;
    }
  }
  funnelColorManagerDirty = true;
  if (funnelColorManagerStatus) funnelColorManagerStatus.textContent = "";
}

async function saveFunnelStepColors() {
  const funnel = getSelectedFunnel();
  if (!selectedUniverseId || !funnel || !funnelColorManagerDialog || funnelColorManagerDialog.hidden) return;
  const stepColors = funnelColorManagerRows.map((row) => String(row.color || "").trim().toLowerCase());
  if (stepColors.some((color) => !/^#[0-9a-f]{6}$/.test(color))) {
    if (funnelColorManagerStatus) funnelColorManagerStatus.textContent = "Use a six-digit hex color such as #9b6dff.";
    return;
  }

  setFunnelColorManagerDisabled(true);
  if (funnelColorManagerStatus) funnelColorManagerStatus.textContent = "Saving colors...";
  try {
    await request("/api/funnels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: funnel.id,
        universeId: Number(selectedUniverseId),
        name: funnel.name,
        conversionWindowMinutes: Number(funnel.conversionWindowMinutes || 30),
        steps: funnel.steps || [],
        stepColors,
      }),
    });
    funnelColorManagerDirty = false;
    if (funnelColorManagerStatus) funnelColorManagerStatus.textContent = "Saved.";
    await loadFunnels({ force: true });
    await closeFunnelColorManager({ force: true });
  } catch (error) {
    handleAuthError(error);
    if (authenticated && funnelColorManagerStatus) {
      funnelColorManagerStatus.textContent = formatRequestError(error);
    }
  } finally {
    setFunnelColorManagerDisabled(false);
  }
}

function setFunnelColorManagerDisabled(disabled) {
  for (const control of funnelColorManagerDialog?.querySelectorAll("input, button") || []) {
    control.disabled = disabled;
  }
}

function handleFunnelColorManagerKeydown(event) {
  if (!funnelColorManagerDialog || funnelColorManagerDialog.hidden || !eventConfirmDialog?.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeFunnelColorManager();
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [...funnelColorManagerDialog.querySelectorAll("input, button")]
    .filter((control) => !control.disabled && control.offsetParent !== null);
  if (!controls.length) return;
  const currentIndex = controls.indexOf(document.activeElement);
  const direction = event.shiftKey ? -1 : 1;
  const nextIndex = currentIndex < 0
    ? 0
    : (currentIndex + direction + controls.length) % controls.length;
  event.preventDefault();
  controls[nextIndex].focus();
}

function renderFunnelTimeline(funnel) {
  if (!funnelTimelineChart || !funnelTimelineLegend) return;
  const timeline = funnel?.timeline;
  const buckets = getCompletedFunnelTimelineBuckets(funnel);
  const steps = getFunnelTimelineSteps(funnel);
  const selection = getFunnelTimelineStepSelection(funnel);
  if (funnelManageColorsButton) funnelManageColorsButton.disabled = !funnel || !steps.length;
  renderFunnelTimelineStepMenu(funnel);

  if (!funnel) {
    funnelTimelineChart.innerHTML = '<p class="funnelTimelineEmpty">Select a Funnel to view step conversion over time.</p>';
    funnelTimelineLegend.innerHTML = "";
    return;
  }
  if (!timeline) {
    funnelTimelineChart.innerHTML = '<p class="funnelTimelineEmpty">Loading this Funnel timeline...</p>';
    funnelTimelineLegend.innerHTML = "";
    return;
  }
  if (!buckets.length) {
    funnelTimelineChart.innerHTML = '<p class="funnelTimelineEmpty">No completed Funnel buckets are available for this range.</p>';
    funnelTimelineLegend.innerHTML = "";
    return;
  }

  const visibleSteps = steps.filter((step) => selection.has(Number(step.index)));
  funnelTimelineLegend.innerHTML = visibleSteps.length
    ? visibleSteps.map((step) => {
      const index = Number(step.index);
      const color = getFunnelStepColor(funnel, index);
      return `
        <button type="button" data-funnel-timeline-legend-step="${index}" title="Hide Step ${index}">
          <i style="--funnel-step-color:${color}" aria-hidden="true"></i>
          <span><strong>Step ${index}</strong> ${escapeHtml(formatEventName(step.eventName))}</span>
        </button>`;
    }).join("")
    : '<span class="funnelTimelineLegendEmpty">Choose at least one step to draw its line.</span>';
  for (const button of funnelTimelineLegend.querySelectorAll("[data-funnel-timeline-legend-step]")) {
    button.addEventListener("click", () => {
      selection.delete(Number(button.dataset.funnelTimelineLegendStep));
      renderFunnelTimeline(funnel);
    });
  }

  const bucketMs = Math.max(Number(timeline.bucketMs) || getSeriesBucketMs(buckets), 1);
  const timelineStart = Number(buckets[0].start);
  const timelineEnd = Math.max(
    Number(buckets.at(-1)?.end) || timelineStart + bucketMs,
    timelineStart + 1,
  );
  const chartSpanMs = Math.max(timelineEnd - timelineStart, bucketMs);
  const chartWidth = getEventChartWidth(funnelTimelineChart.clientWidth, buckets.length, 112, 36);
  const chartHeight = 340;
  const left = 56;
  const right = 24;
  const top = 22;
  const bottom = 50;
  const plotWidth = chartWidth - left - right;
  const plotBottom = chartHeight - bottom;
  const plotHeight = plotBottom - top;
  const xForIndex = (index) => (
    buckets.length === 1 ? left + (plotWidth / 2) : left + ((index / (buckets.length - 1)) * plotWidth)
  );
  const yForPercent = (percentage) => top + (plotHeight - ((percentage / 100) * plotHeight));
  const grid = [100, 75, 50, 25, 0].map((percentage) => {
    const y = yForPercent(percentage);
    return `
      <line x1="${left}" y1="${y}" x2="${chartWidth - right}" y2="${y}" />
      <text x="${left - 10}" y="${y + 4}" text-anchor="end">${percentage}%</text>`;
  }).join("");
  const labelStep = Math.max(1, Math.ceil(buckets.length / 8));
  const xLabels = buckets.map((bucket, index) => (
    index === 0 || index === buckets.length - 1 || index % labelStep === 0
      ? `<text class="funnelTimelineXLabel" x="${xForIndex(index)}" y="${chartHeight - 17}" text-anchor="${index === 0 ? "start" : index === buckets.length - 1 ? "end" : "middle"}">${escapeHtml(formatEventChartLabel(bucket.start, bucketMs, chartSpanMs))}</text>`
      : ""
  )).join("");
  const seriesModels = visibleSteps.map((step) => {
    const stepIndex = Number(step.index);
    const color = getFunnelStepColor(funnel, stepIndex);
    const points = buckets.map((bucket, index) => {
      const point = bucket.steps?.find((entry) => Number(entry.index) === stepIndex);
      const previousStep = bucket.steps?.find((entry) => Number(entry.index) === stepIndex - 1);
      const rawPercentage = getFunnelBucketStepConversion(bucket, stepIndex);
      const hasPercentage = rawPercentage !== null
        && rawPercentage !== undefined
        && Number.isFinite(Number(rawPercentage));
      return {
        x: xForIndex(index),
        y: hasPercentage ? yForPercent(Math.max(0, Math.min(Number(rawPercentage), 100))) : null,
        percentage: hasPercentage ? Number(rawPercentage) : null,
        sessions: Number(point?.sessions) || 0,
        eligibleSessions: stepIndex > 1
          ? Number(previousStep?.sessions) || 0
          : Number(bucket.entrySessions) || 0,
        start: Number(bucket.start),
        end: Number(bucket.end),
      };
    });
    const segments = [];
    let segment = [];
    for (const point of points) {
      if (point.y === null) {
        if (segment.length) segments.push(segment);
        segment = [];
      } else {
        segment.push(point);
      }
    }
    if (segment.length) segments.push(segment);
    const gapSegments = getFunnelTimelineGapSegments(points, left, chartWidth - right);
    return {
      color,
      eventName: step.eventName,
      gapSegments,
      points,
      segments,
      stepIndex,
    };
  });
  const seriesPaths = seriesModels.map((series) => (
    series.segments.map((pathPoints) => (
      `<path d="${buildRoundedEventPropertyPathSegment(pathPoints)}" style="stroke:${series.color}" />`
    )).join("")
  )).join("");
  const seriesGapPaths = seriesModels.map((series) => (
    series.gapSegments.map((gap) => {
      const intervalLabel = gap.skippedBuckets === 1 ? "1 interval" : `${gap.skippedBuckets} intervals`;
      const gapLabel = gap.isBoundary
        ? `${intervalLabel} at the range edge had no eligible sessions`
        : `${intervalLabel} had no eligible sessions`;
      return `
        <path class="funnelTimelineGapPath" d="${buildRoundedEventPropertyPathSegment(gap.points)}" style="stroke:${series.color}">
          <title>Step ${series.stepIndex} | ${escapeHtml(formatEventName(series.eventName))} | ${gapLabel}</title>
        </path>`;
    }).join("")
  )).join("");
  const seriesPoints = seriesModels.map((series) => (
    series.points.map((point) => {
      if (point.y === null) return "";
      const startLabel = formatEventChartLabel(point.start, bucketMs, chartSpanMs, { detailed: true });
      const endLabel = formatEventChartLabel(point.end, bucketMs, chartSpanMs, { detailed: true });
      const denominatorLabel = series.stepIndex > 1 ? "sessions at the previous step" : "entering sessions";
      return `
        <circle cx="${point.x}" cy="${point.y}" r="3.7" style="fill:${series.color};stroke:${series.color}">
          <title>Step ${series.stepIndex} | ${escapeHtml(formatEventName(series.eventName))} | ${escapeHtml(startLabel)} - ${escapeHtml(endLabel)}: ${formatEventNumber(point.percentage)}% (${formatCompactNumber(point.sessions)} of ${formatCompactNumber(point.eligibleSessions)} ${denominatorLabel})</title>
        </circle>`;
    }).join("")
  )).join("");
  const coincidentPaths = getFunnelTimelineCoincidentPathGroups(seriesModels)
    .map((entries) => {
      const hasGap = entries.some((entry) => entry.isGap);
      const dashLength = 10;
      const dashSlots = entries.length + (hasGap ? 1 : 0);
      const dashGap = dashLength * Math.max(dashSlots - 1, 1);
      const mask = hasGap
        ? `<path class="funnelTimelineCoincidentGapMask" d="${entries[0].path}" />`
        : "";
      return mask + entries.map((entry, index) => {
        const dashOffset = index * -dashLength;
        return `<path class="funnelTimelineCoincidentPath${hasGap ? " isGap" : ""}" d="${entry.path}" style="stroke:${entry.color};stroke-dasharray:${dashLength} ${dashGap};stroke-dashoffset:${dashOffset}" data-funnel-step="${entry.stepIndex}" />`;
      }).join("");
    })
    .join("");
  const coincidentPoints = getFunnelTimelineCoincidentPointGroups(seriesModels)
    .map((entries) => entries.map((entry, index) => {
      const radius = 3.7 + ((entries.length - index - 1) * 2.3);
      const startLabel = formatEventChartLabel(entry.start, bucketMs, chartSpanMs, { detailed: true });
      const endLabel = formatEventChartLabel(entry.end, bucketMs, chartSpanMs, { detailed: true });
      const denominatorLabel = entry.stepIndex > 1 ? "sessions at the previous step" : "entering sessions";
      const eventName = seriesModels.find((series) => series.stepIndex === entry.stepIndex)?.eventName || "";
      return `
        <circle class="funnelTimelineCoincidentPoint" cx="${entry.x}" cy="${entry.y}" r="${radius}" style="stroke:${entry.color}" data-funnel-step="${entry.stepIndex}">
          <title>Step ${entry.stepIndex} | ${escapeHtml(formatEventName(eventName))} | ${escapeHtml(startLabel)} - ${escapeHtml(endLabel)}: ${formatEventNumber(entry.percentage)}% (${formatCompactNumber(entry.sessions)} of ${formatCompactNumber(entry.eligibleSessions)} ${denominatorLabel})</title>
        </circle>`;
    }).join(""))
    .join("");

  funnelTimelineChart.innerHTML = `
    <div class="funnelTimelineChartScroller">
      <svg class="funnelTimelineSvg" width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Selected Funnel step-to-step conversion percentages over time">
        <g class="funnelTimelineGrid">${grid}</g>
        <text class="funnelTimelineYAxisTitle" x="15" y="${top + (plotHeight / 2)}" text-anchor="middle" transform="rotate(-90 15 ${top + (plotHeight / 2)})">Step conversion</text>
        <g class="funnelTimelineSeries">${seriesPaths}</g>
        <g class="funnelTimelineGapPaths">${seriesGapPaths}</g>
        <g class="funnelTimelineCoincidentPaths">${coincidentPaths}</g>
        <g class="funnelTimelineSeries">${seriesPoints}</g>
        <g class="funnelTimelineCoincidentPoints">${coincidentPoints}</g>
        ${xLabels}
      </svg>
      ${visibleSteps.length ? "" : '<p class="funnelTimelineChartNotice">No steps selected</p>'}
    </div>`;
}

function renderFunnelStepChanges(funnel) {
  if (!funnelStepChangesTable) return;
  if (!funnel) {
    funnelStepChangesTable.innerHTML = '<p class="status">No funnel selected.</p>';
    return;
  }
  if (!funnel.timeline) {
    funnelStepChangesTable.innerHTML = '<p class="status">Loading this Funnel timeline...</p>';
    return;
  }

  const completedBuckets = getCompletedFunnelTimelineBuckets(funnel)
    .filter((bucket) => Number(bucket?.entrySessions) > 0);
  const startBucket = completedBuckets[0];
  const endBucket = completedBuckets[completedBuckets.length - 1];
  if (!startBucket || !endBucket) {
    funnelStepChangesTable.innerHTML = '<p class="status">No completed Funnel buckets are available yet.</p>';
    return;
  }

  const steps = getFunnelTimelineSteps(funnel)
    .filter((step) => Number(step.index) > 1)
    .map((step) => {
      const averageCounts = getFunnelAggregateStepCounts(completedBuckets, step.index);
      const startCounts = getFunnelBucketStepCounts(startBucket, step.index);
      const endCounts = getFunnelBucketStepCounts(endBucket, step.index);
      const averageConversion = getFunnelAverageStepConversion(completedBuckets, step.index);
      const startConversion = getFunnelBucketStepConversion(startBucket, step.index);
      const endConversion = getFunnelBucketStepConversion(endBucket, step.index);
      const changePercentagePoints = startConversion === null || endConversion === null
        ? null
        : Math.round((endConversion - startConversion) * 10) / 10;
      return {
        ...step,
        averageConversion,
        endConversion,
        changePercentagePoints,
        averageReachedSessions: averageCounts.reachedSessions,
        averageEligibleSessions: averageCounts.eligibleSessions,
        startReachedSessions: startCounts.reachedSessions,
        startEligibleSessions: startCounts.eligibleSessions,
        endReachedSessions: endCounts.reachedSessions,
        endEligibleSessions: endCounts.eligibleSessions,
      };
    });

  funnelStepChangesTable.innerHTML = steps.length
    ? `
      <div class="funnelStepChangesColumnHeader" aria-hidden="true">
        <span>Step</span>
        <span>Average</span>
        <span>End (change from start)</span>
      </div>
      ${steps.map(renderFunnelStepChangeRow).join("")}
    `
    : '<p class="status">Add a second Funnel step to compare conversion.</p>';
}

function renderFunnelStepChangeRow(step) {
  const index = Number(step.index) || 0;
  const signal = Number(step.changePercentagePoints) > 0
    ? "improved"
    : Number(step.changePercentagePoints) < 0
      ? "declined"
      : "stable";
  const change = step.changePercentagePoints === null || step.changePercentagePoints === undefined
    ? ""
    : `<span class="funnelStepChangeDelta">(${formatFunnelPercentagePointChange(step.changePercentagePoints)})</span>`;
  const averageCounts = formatFunnelConversionFraction(
    step.averageReachedSessions,
    step.averageEligibleSessions,
  );
  const startCounts = formatFunnelConversionFraction(
    step.startReachedSessions,
    step.startEligibleSessions,
    { includeUnit: false },
  );
  const endCounts = formatFunnelConversionFraction(
    step.endReachedSessions,
    step.endEligibleSessions,
    { includeUnit: false },
  );
  return `
    <article class="funnelStepChangeRow ${signal}">
      <div class="funnelStepChangeIdentity">
        <span>${index}</span>
        <div>
          <strong>${escapeHtml(formatEventName(step.eventName))}</strong>
          <small>After step ${Math.max(index - 1, 1)}</small>
        </div>
      </div>
      <div class="funnelStepChangeAverage">
        <strong>${formatFunnelPercentage(step.averageConversion)}</strong>
        <small>${averageCounts}</small>
      </div>
      <div class="funnelStepChangeValue">
        <strong>${formatFunnelPercentage(step.endConversion)} ${change}</strong>
        <small>End ${endCounts} &middot; Start ${startCounts}</small>
      </div>
    </article>`;
}

function getFunnelAverageStepConversion(buckets, stepIndex) {
  const counts = getFunnelAggregateStepCounts(buckets, stepIndex);
  if (counts.eligibleSessions <= 0) return null;
  return Math.round((counts.reachedSessions / counts.eligibleSessions) * 1000) / 10;
}

function getFunnelAggregateStepCounts(buckets, stepIndex) {
  let reachedSessions = 0;
  let eligibleSessions = 0;
  for (const bucket of Array.isArray(buckets) ? buckets : []) {
    const counts = getFunnelBucketStepCounts(bucket, stepIndex);
    reachedSessions += counts.reachedSessions;
    eligibleSessions += counts.eligibleSessions;
  }
  return { reachedSessions, eligibleSessions };
}

function getCompletedFunnelTimelineBuckets(funnel) {
  const conversionWindowMs = Math.max(Number(funnel?.conversionWindowMinutes) || 30, 1) * 60 * 1000;
  const completedBefore = Date.now() - conversionWindowMs;
  return (Array.isArray(funnel?.timeline?.buckets) ? funnel.timeline.buckets : [])
    .filter((bucket) => (
      Number(bucket?.start) > 0
      && Number(bucket?.end) >= Number(bucket?.start)
      && Number(bucket?.end) <= completedBefore
    ))
    .sort((leftBucket, rightBucket) => Number(leftBucket.start) - Number(rightBucket.start));
}

function getFunnelBucketStepConversion(bucket, stepIndex) {
  const steps = Array.isArray(bucket?.steps) ? bucket.steps : [];
  const currentStep = steps.find((step) => Number(step.index) === Number(stepIndex));
  if (!currentStep) return null;
  if (Object.prototype.hasOwnProperty.call(currentStep, "conversionFromPrevious")) {
    const conversion = Number(currentStep.conversionFromPrevious);
    return currentStep.conversionFromPrevious !== null && Number.isFinite(conversion)
      ? conversion
      : null;
  }
  if (Number(stepIndex) === 1) {
    return Number(bucket?.entrySessions) > 0 ? 100 : null;
  }
  const previousStep = steps.find((step) => Number(step.index) === Number(stepIndex) - 1);
  const eligibleSessions = Number(previousStep?.sessions) || 0;
  if (eligibleSessions <= 0) return null;
  return Math.round(((Number(currentStep.sessions) || 0) / eligibleSessions) * 1000) / 10;
}

function getFunnelBucketStepCounts(bucket, stepIndex) {
  const steps = Array.isArray(bucket?.steps) ? bucket.steps : [];
  const currentStep = steps.find((step) => Number(step.index) === Number(stepIndex));
  const previousStep = steps.find((step) => Number(step.index) === Number(stepIndex) - 1);
  return {
    reachedSessions: Number(currentStep?.sessions) || 0,
    eligibleSessions: Number(stepIndex) > 1
      ? Number(previousStep?.sessions) || 0
      : Number(bucket?.entrySessions) || 0,
  };
}

function formatFunnelConversionFraction(reachedSessions, eligibleSessions, options = {}) {
  const reached = Math.max(Number(reachedSessions) || 0, 0);
  const eligible = Math.max(Number(eligibleSessions) || 0, 0);
  if (eligible <= 0) return options.includeUnit === false ? "0 / 0" : "No eligible sessions";
  const fraction = `${formatCompactNumber(reached)} / ${formatCompactNumber(eligible)}`;
  return options.includeUnit === false ? fraction : `${fraction} sessions`;
}

function formatFunnelPercentagePointChange(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "--";
  const difference = Number(value);
  return `${difference > 0 ? "+" : ""}${formatEventNumber(difference)} pp`;
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
  updateFunnelIntervalControl(funnel);
  renderFunnelTimeline(funnel);
  renderFunnelStepChanges(funnel);
  if (!funnelResultSteps) return;

  const steps = analytics?.steps || [];
  const maxSessions = Math.max(...steps.map((step) => Number(step.sessions) || 0), 1);
  funnelResultSteps.innerHTML = steps.length
    ? `
      <div class="funnelResultsColumnHeader" aria-hidden="true">
        <span>Funnel step</span>
        <span class="funnelBarColumnHeader"><span>Sessions</span><span>Total conversion</span></span>
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
              <small class="${step.index < steps.length ? "funnelDropRate" : ""}">${step.index < steps.length ? `${formatEventNumber(dropOffRate)}%` : "final step"}</small>
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
    chatLogOffset = 0;
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
      const responseLogs = Array.isArray(data.logs) ? data.logs : [];
      const paginationTotal = Math.max(Number(data.paginationTotal) || 0, 0);
      if (!responseLogs.length && chatLogOffset > 0 && paginationTotal > 0) {
        chatLogOffset = Math.floor((paginationTotal - 1) / CHAT_LOG_PAGE_SIZE) * CHAT_LOG_PAGE_SIZE;
        return loadChatLogs({ includeInsights: requestState.includeInsights });
      }
      currentChatLogs = responseLogs;
      if (!currentChatLogs.some((log) => String(log.id || "") === String(selectedChatLogId))) {
        selectedChatLogId = "";
      }
      if (requestState.includeInsights) loadChatInsights();
      renderChatSummary(data);
      setChatLiveState("live");
      if (!responseLogs.length) {
        chatLogsStatus.textContent = selectedUniverseId
          ? "No chat logs yet. Start a live server with chat tracking enabled, then have a player send a message."
          : "Connect or select a Roblox game to view chat logs.";
        renderRecentChatEmpty("New Roblox chat will appear here automatically.");
        return;
      }

      const totalCount = Math.max(Number(data.logCount) || responseLogs.length, responseLogs.length);
      const rangeStart = Math.max(Number(data.offset) || chatLogOffset, 0) + 1;
      const rangeEnd = rangeStart + responseLogs.length - 1;
      chatLogsStatus.textContent = `Showing messages ${rangeStart} through ${rangeEnd} of ${totalCount} in the selected range.`;
      chatLogList.innerHTML = responseLogs.map(renderChatLog).join("");
      renderChatPagination(data);
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
    limit: String(CHAT_LOG_PAGE_SIZE),
    offset: String(chatLogOffset),
  });
  const from = getDashboardDateFilterMs(movementFromFilter);
  const to = getDashboardDateFilterMs(movementToFilter);
  if (from) params.set("from", String(from));
  if (to) params.set("to", String(to));
  return `?${params.toString()}`;
}

function changeChatLogPage(direction) {
  const cleanDirection = Number(direction) < 0 ? -1 : 1;
  const nextOffset = Math.max(chatLogOffset + (cleanDirection * CHAT_LOG_PAGE_SIZE), 0);
  if (nextOffset === chatLogOffset) return;
  chatLogOffset = nextOffset;
  selectedChatLogId = "";
  loadChatLogs({ includeInsights: false });
}

function renderChatPagination(data = null) {
  if (!chatPagination || !chatPreviousPageButton || !chatNextPageButton || !chatPageStatus) return;
  const totalCount = Math.max(Number(data?.paginationTotal) || Number(data?.logCount) || 0, 0);
  const offset = Math.max(Number(data?.offset) || 0, 0);
  const returnedCount = Math.max(Number(data?.returnedCount) || data?.logs?.length || 0, 0);
  const rangeStart = returnedCount ? offset + 1 : 0;
  const rangeEnd = offset + returnedCount;
  chatPagination.hidden = totalCount <= CHAT_LOG_PAGE_SIZE;
  chatPreviousPageButton.disabled = offset <= 0;
  chatNextPageButton.disabled = !data?.hasNext;
  chatPageStatus.textContent = returnedCount
    ? `${formatCompactNumber(rangeStart)}–${formatCompactNumber(rangeEnd)} of ${formatCompactNumber(totalCount)}`
    : `0 of ${formatCompactNumber(totalCount)}`;
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
  if (!authenticatedUser?.isAdmin) return;
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
  if (!authenticatedUser?.isAdmin) {
    chatInsightsStatus.textContent = "Admin access required.";
    return;
  }

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
  if (aiChatSendButton) aiChatSendButton.disabled = aiChatBusy || !authenticatedUser?.isAdmin;
  if (aiChatInput) aiChatInput.disabled = aiChatBusy || !authenticatedUser?.isAdmin;
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
  if (!authenticatedUser?.isAdmin) {
    chatInsightsStatus.textContent = "Admin access required.";
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

function normalizeDateRangeContext(context) {
  return context === "funnels" ? "funnels" : "events";
}

function getDateRangeContextElements(context) {
  return normalizeDateRangeContext(context) === "funnels"
    ? {
      fromInput: funnelFromFilter,
      toInput: funnelToFilter,
      fromButton: funnelFromPickerButton,
      toButton: funnelToPickerButton,
      fromDisplay: funnelFromDisplay,
      toDisplay: funnelToDisplay,
      fromIndicator: funnelFromVersionIndicator,
      toIndicator: funnelToVersionIndicator,
      selectedReleases: selectedFunnelDateReleaseVersions,
    }
    : {
      fromInput: movementFromFilter,
      toInput: movementToFilter,
      fromButton: movementFromPickerButton,
      toButton: movementToPickerButton,
      fromDisplay: movementFromDisplay,
      toDisplay: movementToDisplay,
      fromIndicator: movementFromVersionIndicator,
      toIndicator: movementToVersionIndicator,
      selectedReleases: selectedDateReleaseVersions,
    };
}

function getDateRangeInputDescriptor(input) {
  for (const context of ["events", "funnels"]) {
    const elements = getDateRangeContextElements(context);
    if (input === elements.fromInput) return { context, side: "from", elements };
    if (input === elements.toInput) return { context, side: "to", elements };
  }
  return { context: "events", side: "", elements: getDateRangeContextElements("events") };
}

function getDashboardDateFilterMs(input) {
  const { side, elements } = getDateRangeInputDescriptor(input);
  const selectedRelease = side ? elements.selectedReleases[side] : null;
  if (
    selectedRelease
    && selectedRelease.inputValue === input?.value
    && Number(selectedRelease.publishedAt) > 0
  ) {
    return Number(selectedRelease.publishedAt);
  }
  return getDateTimeMs(input?.value);
}

function handleDateFilterChange(context = dateRangePickerContext) {
  const cleanContext = normalizeDateRangeContext(context);
  syncDateFilterDisplays();
  if (cleanContext === "events" && activeView === "events") {
    renderCustomEventProperties([]);
    loadCustomEvents({ force: true });
  }
  if (cleanContext === "funnels" && activeView === "funnels") loadFunnels({ force: true });
  if (cleanContext === "events" && activeView === "chat") {
    chatLogOffset = 0;
    loadChatLogs({ includeInsights: false });
  }
}

function getDateRangeInput(side, context = dateRangePickerContext) {
  const elements = getDateRangeContextElements(context);
  return side === "to" ? elements.toInput : elements.fromInput;
}

function getDateRangePickerButton(side, context = dateRangePickerContext) {
  const elements = getDateRangeContextElements(context);
  return side === "to" ? elements.toButton : elements.fromButton;
}

function openDateRangePicker(side, context = "events") {
  const cleanSide = side === "to" ? "to" : "from";
  const cleanContext = normalizeDateRangeContext(context);
  if (!dateRangePickerPanel) return;
  if (
    !dateRangePickerPanel.hidden
    && dateRangePickerSide === cleanSide
    && dateRangePickerContext === cleanContext
  ) {
    closeDateRangePicker();
    return;
  }

  dateRangePickerContext = cleanContext;
  dateRangePickerSide = cleanSide;
  const input = getDateRangeInput(cleanSide, cleanContext);
  const selectedTimestamp = getDashboardDateFilterMs(input) || Date.now();
  dateRangePickerDraft = new Date(selectedTimestamp);
  dateRangePickerMonth = new Date(
    dateRangePickerDraft.getFullYear(),
    dateRangePickerDraft.getMonth(),
    1,
  );
  if (dateRangeTimeInput) dateRangeTimeInput.value = formatTimeInputValue(dateRangePickerDraft);

  const activeButton = getDateRangePickerButton(cleanSide, cleanContext);
  const activeCluster = activeButton?.closest(".dateFilterCluster");
  if (activeCluster && dateRangePickerPanel.parentElement !== activeCluster) {
    activeCluster.append(dateRangePickerPanel);
  }
  dateRangePickerPanel.hidden = false;
  dateRangePickerPanel.dataset.pickerContext = cleanContext;
  dateRangePickerPanel.dataset.pickerSide = cleanSide;
  for (const button of dateRangeFieldButtons) {
    button.setAttribute("aria-expanded", String(
      button.dataset.dateRangeContext === cleanContext
      && button.dataset.dateRangeSide === cleanSide
    ));
  }
  renderDateRangePicker();

  if (
    selectedUniverseId
    && (currentEventReleaseVersionsUniverseId !== selectedUniverseId || !currentEventReleaseVersions.length)
  ) {
    loadEventReleaseVersions(selectedUniverseId, {
      force: currentEventReleaseVersionsUniverseId === selectedUniverseId,
    });
  }
}

function closeDateRangePicker() {
  if (dateRangePickerPanel) dateRangePickerPanel.hidden = true;
  for (const button of dateRangeFieldButtons) button.setAttribute("aria-expanded", "false");
}

function handleDateRangePickerOutsidePointer(event) {
  if (dateRangePickerPanel?.hidden) return;
  if (dateRangePickerPanel?.contains(event.target)) return;
  if ([...dateRangeFieldButtons].some((button) => button.contains(event.target))) return;
  closeDateRangePicker();
}

function handleDateRangePickerEscape(event) {
  if (event.key !== "Escape" || dateRangePickerPanel?.hidden) return;
  const activeButton = getDateRangePickerButton(dateRangePickerSide, dateRangePickerContext);
  closeDateRangePicker();
  activeButton?.focus();
}

function moveDateRangePickerMonth(offset) {
  if (!(dateRangePickerMonth instanceof Date)) return;
  dateRangePickerMonth = new Date(
    dateRangePickerMonth.getFullYear(),
    dateRangePickerMonth.getMonth() + Number(offset),
    1,
  );
  renderDateRangeCalendar();
}

function handleDateRangeCalendarSelection(event) {
  const dayButton = event.target.closest("[data-date-range-day]");
  if (!dayButton || dayButton.disabled || !dateRangeCalendarGrid?.contains(dayButton)) return;
  const [year, month, day] = String(dayButton.dataset.dateRangeDay || "").split("-").map(Number);
  if (!year || !month || !day) return;
  const draft = dateRangePickerDraft instanceof Date ? new Date(dateRangePickerDraft) : new Date();
  draft.setFullYear(year, month - 1, day);
  dateRangePickerDraft = draft;
  dateRangePickerMonth = new Date(year, month - 1, 1);
  renderDateRangePicker();
}

function selectDateRangeToday() {
  const now = new Date();
  const draft = dateRangePickerDraft instanceof Date ? new Date(dateRangePickerDraft) : now;
  draft.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  dateRangePickerDraft = draft;
  dateRangePickerMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  renderDateRangePicker();
}

function syncDateRangePickerTime() {
  if (!(dateRangePickerDraft instanceof Date) || !dateRangeTimeInput?.value) return;
  const [hours, minutes] = dateRangeTimeInput.value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return;
  dateRangePickerDraft.setHours(hours, minutes, 0, 0);
  renderDateRangePickerHeader();
  updateDateRangeApplyState();
}

function applyDateRangePickerValue() {
  if (!(dateRangePickerDraft instanceof Date) || !isDateRangeTimestampValid(dateRangePickerDraft.getTime(), dateRangePickerSide)) return;
  const elements = getDateRangeContextElements(dateRangePickerContext);
  const input = getDateRangeInput(dateRangePickerSide, dateRangePickerContext);
  if (!input) return;
  input.value = toDateTimeLocalValue(dateRangePickerDraft);
  elements.selectedReleases[dateRangePickerSide] = null;
  syncDateFilterDisplays();
  closeDateRangePicker();
  handleDateFilterChange(dateRangePickerContext);
}

function renderDateRangePicker() {
  if (!dateRangePickerPanel || dateRangePickerPanel.hidden) return;
  renderDateRangePickerHeader();
  renderDateRangeCalendar();
  renderDateRangeVersionList();
  updateDateRangeApplyState();
}

function renderDateRangePickerHeader() {
  const isEnd = dateRangePickerSide === "to";
  if (dateRangePickerSideLabel) dateRangePickerSideLabel.textContent = `${isEnd ? "End" : "Start"} date & time`;
  if (dateRangePickerTitle) {
    dateRangePickerTitle.textContent = dateRangePickerDraft instanceof Date
      ? formatDateVersionReleaseTime(dateRangePickerDraft.getTime())
      : `Choose exact ${isEnd ? "end" : "start"}`;
  }
}

function renderDateRangeCalendar() {
  if (!dateRangeCalendarGrid || !(dateRangePickerMonth instanceof Date)) return;
  const year = dateRangePickerMonth.getFullYear();
  const month = dateRangePickerMonth.getMonth();
  if (dateRangeMonthLabel) {
    dateRangeMonthLabel.textContent = dateRangePickerMonth.toLocaleDateString([], {
      month: "long",
      year: "numeric",
    });
  }
  const firstVisibleDate = new Date(year, month, 1 - new Date(year, month, 1).getDay());
  const selectedDateKey = dateRangePickerDraft instanceof Date ? getLocalDateKey(dateRangePickerDraft) : "";
  const todayKey = getLocalDateKey(new Date());
  dateRangeCalendarGrid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      firstVisibleDate.getFullYear(),
      firstVisibleDate.getMonth(),
      firstVisibleDate.getDate() + index,
    );
    const dateKey = getLocalDateKey(date);
    const outsideMonth = date.getMonth() !== month;
    const isSelected = dateKey === selectedDateKey;
    const isToday = dateKey === todayKey;
    const isUnavailable = !isDateRangeDayAvailable(date, dateRangePickerSide);
    return `
      <button
        class="dateRangeCalendarDay${outsideMonth ? " outsideMonth" : ""}${isToday ? " isToday" : ""}${isSelected ? " isSelected" : ""}"
        type="button"
        role="gridcell"
        data-date-range-day="${dateKey}"
        aria-selected="${isSelected}"
        aria-label="${escapeHtml(date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" }))}"
        ${isUnavailable ? "disabled" : ""}
      >${date.getDate()}</button>`;
  }).join("");
}

function renderDateRangeVersionList() {
  if (!dateVersionList) return;
  const versions = [...currentEventReleaseVersions]
    .filter((version) => Number(version?.publishedAt) > 0 && Number(version?.placeVersion) > 0)
    .sort((left, right) => (
      Number(right.publishedAt) - Number(left.publishedAt)
      || Number(right.placeVersion) - Number(left.placeVersion)
      || Number(right.placeId) - Number(left.placeId)
    ));
  if (!versions.length) {
    dateVersionList.innerHTML = `<p class="dateVersionEmpty">${eventReleaseVersionsLoading ? "Loading versions..." : "No production versions found."}</p>`;
    return;
  }

  const hasMultiplePlaces = new Set(versions.map((version) => Number(version.placeId) || 0)).size > 1;
  const selectedRelease = getDateRangeContextElements(dateRangePickerContext).selectedReleases[dateRangePickerSide];
  dateVersionList.innerHTML = versions.map((version) => {
    const placeId = Number(version.placeId) || 0;
    const placeVersion = Number(version.placeVersion) || 0;
    const publishedAt = Number(version.publishedAt) || 0;
    const isSelected = Boolean(
      selectedRelease
      && Number(selectedRelease.placeId) === placeId
      && Number(selectedRelease.placeVersion) === placeVersion
      && Number(selectedRelease.publishedAt) === publishedAt
    );
    const isUnavailable = !isDateRangeTimestampValid(publishedAt, dateRangePickerSide);
    const placeLabel = hasMultiplePlaces && placeId > 0 ? ` · Place ${placeId}` : "";
    const unavailableLabel = dateRangePickerSide === "to" ? "Before start" : "After end";
    return `
      <button class="dateVersionOption" type="button" data-date-release-time="${publishedAt}" data-date-release-place="${placeId}" data-date-release-version="${placeVersion}" aria-selected="${isSelected}" ${isUnavailable ? "disabled" : ""}>
        <span class="dateVersionDot" aria-hidden="true"></span>
        <span class="dateVersionOptionCopy">
          <strong>v${escapeHtml(formatReleaseVersion(placeVersion))}</strong>
          <small>${escapeHtml(formatDateVersionReleaseTime(publishedAt))}${escapeHtml(placeLabel)}</small>
        </span>
        <span class="dateVersionOptionAction">${isUnavailable ? unavailableLabel : isSelected ? "Selected" : "Use"}</span>
      </button>`;
  }).join("");
}

function handleDateReleaseVersionSelection(event) {
  const option = event.target.closest("[data-date-release-time]");
  if (!option || option.disabled || !dateVersionList?.contains(option)) return;
  const publishedAt = Number(option.dataset.dateReleaseTime) || 0;
  const placeId = Number(option.dataset.dateReleasePlace) || 0;
  const placeVersion = Number(option.dataset.dateReleaseVersion) || 0;
  const elements = getDateRangeContextElements(dateRangePickerContext);
  const input = getDateRangeInput(dateRangePickerSide, dateRangePickerContext);
  if (!input || publishedAt <= 0 || placeVersion <= 0 || !isDateRangeTimestampValid(publishedAt, dateRangePickerSide)) return;

  const inputValue = toDateTimeLocalValue(new Date(publishedAt));
  input.value = inputValue;
  elements.selectedReleases[dateRangePickerSide] = {
    inputValue,
    placeId,
    placeVersion,
    publishedAt,
  };
  syncDateFilterDisplays();
  closeDateRangePicker();
  handleDateFilterChange(dateRangePickerContext);
}

function isDateRangeTimestampValid(timestamp, side, context = dateRangePickerContext) {
  const value = Number(timestamp) || 0;
  if (value <= 0) return false;
  const elements = getDateRangeContextElements(context);
  const otherInput = side === "to" ? elements.fromInput : elements.toInput;
  const otherTimestamp = getDashboardDateFilterMs(otherInput);
  if (!otherTimestamp) return true;
  return side === "to" ? value >= otherTimestamp : value <= otherTimestamp;
}

function isDateRangeDayAvailable(date, side, context = dateRangePickerContext) {
  const elements = getDateRangeContextElements(context);
  const otherInput = side === "to" ? elements.fromInput : elements.toInput;
  const otherTimestamp = getDashboardDateFilterMs(otherInput);
  if (!otherTimestamp) return true;
  const candidateKey = getLocalDateKey(date);
  const otherKey = getLocalDateKey(new Date(otherTimestamp));
  return side === "to" ? candidateKey >= otherKey : candidateKey <= otherKey;
}

function updateDateRangeApplyState() {
  if (!dateRangeApplyButton) return;
  dateRangeApplyButton.disabled = !(
    dateRangePickerDraft instanceof Date
    && isDateRangeTimestampValid(dateRangePickerDraft.getTime(), dateRangePickerSide)
  );
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInputValue(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function clearSelectedDateReleaseVersion(side, context = "events") {
  const cleanSide = side === "to" ? "to" : "from";
  getDateRangeContextElements(context).selectedReleases[cleanSide] = null;
  renderDateVersionIndicators();
  if (!dateRangePickerPanel?.hidden) renderDateRangeVersionList();
}

function renderDateVersionIndicators() {
  for (const context of ["events", "funnels"]) {
    const elements = getDateRangeContextElements(context);
    const indicators = {
      from: elements.fromIndicator,
      to: elements.toIndicator,
    };
    for (const side of ["from", "to"]) {
      const indicator = indicators[side];
      const selectedRelease = elements.selectedReleases[side];
      if (indicator) {
        indicator.hidden = !selectedRelease;
        indicator.textContent = selectedRelease
          ? `(v${formatReleaseVersion(selectedRelease.placeVersion)} release time)`
          : "";
        indicator.closest(".dateRangeField")?.classList.toggle("hasReleaseTime", Boolean(selectedRelease));
      }
    }
  }
}

function formatDateVersionReleaseTime(timestamp) {
  const date = new Date(Number(timestamp) || 0);
  if (!Number.isFinite(date.getTime())) return "Unknown release time";
  const dateLabel = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateLabel} at ${timeLabel}`;
}

function initializeDateFilterDefaults() {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 0, 0);
  const startOfRange = new Date(endOfToday);
  startOfRange.setDate(startOfRange.getDate() - 29);
  startOfRange.setHours(0, 0, 0, 0);
  for (const context of ["events", "funnels"]) {
    const elements = getDateRangeContextElements(context);
    if (elements.fromInput && !elements.fromInput.value) {
      elements.fromInput.value = toDateTimeLocalValue(startOfRange);
    }
    if (elements.toInput && !elements.toInput.value) {
      elements.toInput.value = toDateTimeLocalValue(endOfToday);
    }
  }
}

function toDateTimeLocalValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function syncDateFilterDisplays() {
  for (const context of ["events", "funnels"]) {
    const elements = getDateRangeContextElements(context);
    if (elements.fromDisplay) {
      elements.fromDisplay.textContent = formatDateFilterDisplay(
        elements.fromInput?.value,
        "Choose date",
        getDashboardDateFilterMs(elements.fromInput),
      );
    }
    if (elements.toDisplay) {
      elements.toDisplay.textContent = formatDateFilterDisplay(
        elements.toInput?.value,
        "Choose date",
        getDashboardDateFilterMs(elements.toInput),
      );
    }
    if (elements.fromInput && elements.toInput) {
      elements.fromInput.max = elements.toInput.value;
      elements.toInput.min = elements.fromInput.value;
    }
  }
  renderDateVersionIndicators();
}

function formatDateFilterDisplay(value, fallback, timestampOverride = 0) {
  const timestamp = Number(timestampOverride) || getDateTimeMs(value);
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
  renderChatPagination();
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

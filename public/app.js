const accountBox = document.querySelector("#accountBox");
const loginPanel = document.querySelector("#loginPanel");
const loginForm = document.querySelector("#loginForm");
const dashboardPassword = document.querySelector("#dashboardPassword");
const loginButton = document.querySelector("#loginButton");
const loginStatus = document.querySelector("#loginStatus");
const authControls = document.querySelector("#authControls");
const logoutButton = document.querySelector("#logoutButton");
const authError = document.querySelector("#authError");
const universesStatus = document.querySelector("#universesStatus");
const universeSelect = document.querySelector("#universeSelect");
const refreshUniversesButton = document.querySelector("#refreshUniversesButton");
const refreshChatLogsButton = document.querySelector("#refreshChatLogsButton");
const chatLogCount = document.querySelector("#chatLogCount");
const universeTotalMetric = document.querySelector("#universeTotalMetric");
const selectedUniverseLabel = document.querySelector("#selectedUniverseLabel");
const chatLogsStatus = document.querySelector("#chatLogsStatus");
const chatLogList = document.querySelector("#chatLogList");
const chatInsightsStatus = document.querySelector("#chatInsightsStatus");
const chatInsightsMode = document.querySelector("#chatInsightsMode");
const runChatInsightsButton = document.querySelector("#runChatInsightsButton");
const commonQuestionList = document.querySelector("#commonQuestionList");
const movementFromFilter = document.querySelector("#movementFromFilter");
const movementToFilter = document.querySelector("#movementToFilter");
const analyticsPanels = document.querySelectorAll(".chatLogs, .chatInsights, .movementHeatmap");
const protectedDashboardPanels = document.querySelectorAll(
  ".sidebar, .topbar, #authControls, .summaryBand, .dashboardGrid, .lowerCards"
);

let chatRefreshTimer;
let selectedUniverseId = "";
let selectedChatLogId = "";
let knownUniverses = [];
let authenticated = false;

window.getSelectedUniverseId = () => selectedUniverseId;
window.isDashboardAuthenticated = () => authenticated;

const CHAT_REFRESH_MS = 5000;

init();

async function init() {
  showAuthError();
  bindEvents();
  await checkAuth();
}

function bindEvents() {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });

  logoutButton.addEventListener("click", async () => {
    await request("/api/auth/logout", { method: "POST" });
    window.location.reload();
  });

  refreshUniversesButton.addEventListener("click", loadUniverses);
  universeSelect.addEventListener("change", () => selectUniverse(universeSelect.value));
  refreshChatLogsButton.addEventListener("click", loadChatLogs);
  runChatInsightsButton.addEventListener("click", runChatInsightsAnalysis);

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

}

async function checkAuth() {
  try {
    const data = await request("/api/auth/status");
    setAuthenticated(Boolean(data.authenticated));
  } catch {
    setAuthenticated(false);
  }
}

async function login() {
  loginButton.disabled = true;
  loginStatus.textContent = "Checking password...";

  try {
    await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: dashboardPassword.value }),
    });
    dashboardPassword.value = "";
    loginStatus.textContent = "";
    setAuthenticated(true);
  } catch (error) {
    loginStatus.textContent = error.message;
    setAuthenticated(false);
  } finally {
    loginButton.disabled = false;
  }
}

function setAuthenticated(value) {
  authenticated = value;
  document.body.classList.toggle("isLocked", !authenticated);
  accountBox.textContent = authenticated ? "Unlocked" : "Locked";
  loginPanel.hidden = authenticated;
  authControls.hidden = !authenticated;
  runChatInsightsButton.hidden = !authenticated;
  for (const panel of protectedDashboardPanels) {
    panel.hidden = !authenticated;
  }
  for (const panel of analyticsPanels) {
    panel.hidden = !authenticated;
  }

  window.dispatchEvent(new CustomEvent("dashboard:authChanged", {
    detail: { authenticated },
  }));

  if (!authenticated) {
    stopChatRefresh();
    chatLogList.innerHTML = "";
    commonQuestionList.innerHTML = "";
    chatLogCount.textContent = "0";
    universeTotalMetric.textContent = "0";
    selectedUniverseId = "";
    selectedUniverseLabel.textContent = "No universe selected";
    universeSelect.innerHTML = `<option value="">Unlock dashboard</option>`;
    universeSelect.disabled = true;
    chatLogsStatus.textContent = "Unlock the dashboard to view chat logs.";
    chatInsightsStatus.textContent = "Unlock the dashboard to view chat insights.";
    return;
  }

  loadDashboardData();
}

async function loadDashboardData() {
  await loadUniverses();
  await loadChatLogs();
  startChatRefresh();
  window.dispatchEvent(new CustomEvent("dashboard:analyticsReady", {
    detail: { universeId: selectedUniverseId },
  }));
  window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
    detail: { universeId: selectedUniverseId },
  }));
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

async function loadUniverses() {
  universesStatus.textContent = "Loading universes...";

  try {
    const data = await request("/api/universes");
    knownUniverses = data.universes || [];
    universeTotalMetric.textContent = String(knownUniverses.length);

    if (!knownUniverses.length) {
      selectedUniverseId = "";
      universeSelect.disabled = true;
      universeSelect.innerHTML = `<option value="">No universe data yet</option>`;
      universesStatus.textContent = "No universe IDs are sending data yet.";
      updateSelectedUniverse();
      return;
    }

    const availableIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
    const previousUniverseId = selectedUniverseId;
    if (!selectedUniverseId || !availableIds.has(selectedUniverseId)) {
      selectedUniverseId = String(knownUniverses[0].id || "");
    }

    universeSelect.disabled = false;
    universeSelect.innerHTML = knownUniverses.map(renderUniverseOption).join("");
    universesStatus.textContent = `${knownUniverses.length} universe${knownUniverses.length === 1 ? "" : "s"} sending data.`;
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

function renderUniverseOption(universe) {
  const id = String(universe.id || "");
  const totalSamples = Number(universe.totalSamples || 0);
  const selected = id === selectedUniverseId ? " selected" : "";
  return `<option value="${escapeHtml(id)}"${selected}>Universe ${escapeHtml(id)} (${escapeHtml(String(totalSamples))} samples)</option>`;
}

function selectUniverse(value) {
  const cleanValue = String(value || "").trim();
  const knownIds = new Set(knownUniverses.map((universe) => String(universe.id || "")));
  selectedUniverseId = /^\d+$/.test(cleanValue) && knownIds.has(cleanValue) ? cleanValue : "";
  selectedChatLogId = "";
  updateSelectedUniverse();
  loadChatLogs();
  window.dispatchEvent(new CustomEvent("dashboard:universeChanged", {
    detail: { universeId: selectedUniverseId },
  }));
}

function updateSelectedUniverse() {
  if (selectedUniverseId) {
    selectedUniverseLabel.textContent = `Universe ${selectedUniverseId}`;
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
    return;
  }

  try {
    const query = `?universeId=${encodeURIComponent(selectedUniverseId)}`;
    const data = await request(`/api/chat-insights${query}`);
    renderChatInsights(data);
  } catch (error) {
    handleAuthError(error);
    chatInsightsStatus.textContent = error.message;
    commonQuestionList.innerHTML = "";
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

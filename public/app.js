const accountBox = document.querySelector("#accountBox");
const signedOut = document.querySelector("#signedOut");
const signedIn = document.querySelector("#signedIn");
const userLine = document.querySelector("#userLine");
const logoutButton = document.querySelector("#logoutButton");
const authError = document.querySelector("#authError");
const experiencesPanel = document.querySelector("#experiencesPanel");
const experiencesStatus = document.querySelector("#experiencesStatus");
const experienceGrid = document.querySelector("#experienceGrid");
const refreshExperiencesButton = document.querySelector("#refreshExperiencesButton");
const refreshChatLogsButton = document.querySelector("#refreshChatLogsButton");
const chatLogCount = document.querySelector("#chatLogCount");
const chatLogsStatus = document.querySelector("#chatLogsStatus");
const chatLogList = document.querySelector("#chatLogList");
const chatInsightsStatus = document.querySelector("#chatInsightsStatus");
const chatInsightsMode = document.querySelector("#chatInsightsMode");
const runChatInsightsButton = document.querySelector("#runChatInsightsButton");
const commonQuestionList = document.querySelector("#commonQuestionList");

let chatRefreshTimer;
let selectedUniverseId = "";
let selectedChatLogId = "";

window.getSelectedUniverseId = () => selectedUniverseId;

const CHAT_REFRESH_MS = 5000;

init();

async function init() {
  showAuthError();
  await loadChatLogs();
  chatRefreshTimer = window.setInterval(loadChatLogs, CHAT_REFRESH_MS);

  const { account } = await request("/api/me");

  if (!account) {
    accountBox.textContent = "Not signed in";
    signedOut.hidden = false;
    signedIn.hidden = true;
    return;
  }

  accountBox.textContent = `Roblox ID ${account.robloxUserId}`;
  userLine.textContent = `Roblox user ID: ${account.robloxUserId} | Scopes: ${account.scope}`;
  signedOut.hidden = true;
  signedIn.hidden = false;
  experiencesPanel.hidden = false;
  await loadExperiences();
}

logoutButton.addEventListener("click", async () => {
  await request("/api/logout", { method: "POST" });
  window.location.reload();
});

refreshExperiencesButton.addEventListener("click", loadExperiences);
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

experienceGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-universe-id]");
  if (!button) return;

  selectedUniverseId = button.dataset.universeId || "";
  selectedChatLogId = "";
  updateSelectedExperience();
  loadChatLogs();
  window.dispatchEvent(new CustomEvent("dashboard:experienceChanged", {
    detail: { universeId: selectedUniverseId },
  }));
});

async function loadExperiences() {
  experiencesStatus.textContent = "Loading...";
  experienceGrid.innerHTML = "";

  try {
    const data = await request("/api/experiences");
    if (!data.signedIn) {
      experiencesStatus.textContent = "Sign in first.";
      return;
    }

    if (!data.experiences.length) {
      experiencesStatus.textContent = "No authorized experiences found. Log out and sign in again after approving universe:read for experiences.";
      return;
    }

    experiencesStatus.textContent = `${data.experiences.length} experience${data.experiences.length === 1 ? "" : "s"} authorized.`;
    experienceGrid.innerHTML = data.experiences.map(renderExperience).join("");
    if (!selectedUniverseId && data.experiences.length === 1) {
      selectedUniverseId = getUniverseId(data.experiences[0]);
    }
    updateSelectedExperience();
    await loadChatLogs();
  } catch (error) {
    experiencesStatus.textContent = error.message;
  }
}

function renderExperience(experience) {
  const id = getUniverseId(experience);
  const description = experience.description || "No description.";

  return `
    <article class="experienceCard" data-universe-id="${escapeHtml(id)}">
      <dl>
        <div><dt>Description</dt><dd>${escapeHtml(description)}</dd></div>
        <div><dt>Universe ID</dt><dd>${escapeHtml(id)}</dd></div>
        ${experience.error ? `<div><dt>Error</dt><dd>${escapeHtml(experience.error)}</dd></div>` : ""}
      </dl>
      <button class="button secondary compact selectExperienceButton" type="button" data-universe-id="${escapeHtml(id)}">Select</button>
    </article>
  `;
}

async function loadChatLogs() {
  try {
    const query = selectedUniverseId ? `?universeId=${encodeURIComponent(selectedUniverseId)}` : "";
    const data = await request(`/api/chat-logs${query}`);
    loadChatInsights();
    chatLogCount.textContent = String(data.logCount || 0);

    if (!data.logs.length) {
      chatLogsStatus.textContent = selectedUniverseId
        ? `No chat logs stored for universe ${selectedUniverseId} yet.`
        : "No chat logs stored yet.";
      chatLogList.innerHTML = "";
      return;
    }

    chatLogsStatus.textContent = selectedUniverseId
      ? `Showing stored chat logs for universe ${selectedUniverseId}.`
      : "Showing stored chat logs for all universes.";
    chatLogList.innerHTML = data.logs.map(renderChatLog).join("");
    highlightSelectedChatLog({ scroll: false });
  } catch (error) {
    chatLogsStatus.textContent = error.message;
    loadChatInsights();
  }
}

async function loadChatInsights() {
  try {
    const query = selectedUniverseId ? `?universeId=${encodeURIComponent(selectedUniverseId)}` : "";
    const data = await request(`/api/chat-insights${query}`);
    renderChatInsights(data);
  } catch (error) {
    chatInsightsStatus.textContent = error.message;
    commonQuestionList.innerHTML = "";
  }
}

async function runChatInsightsAnalysis() {
  runChatInsightsButton.disabled = true;
  chatInsightsMode.textContent = "Sending to AI";
  chatInsightsStatus.textContent = "Sending recent question-like chat to AI...";

  try {
    const query = selectedUniverseId ? `?universeId=${encodeURIComponent(selectedUniverseId)}` : "";
    const data = await request(`/api/chat-insights/analyze${query}`, { method: "POST" });
    renderChatInsights(data);
  } catch (error) {
    chatInsightsStatus.textContent = error.message;
    chatInsightsMode.textContent = "AI failed";
  } finally {
    runChatInsightsButton.disabled = false;
  }
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

function updateSelectedExperience() {
  for (const card of experienceGrid.querySelectorAll(".experienceCard")) {
    const isSelected = card.dataset.universeId === selectedUniverseId;
    card.classList.toggle("selected", isSelected);

    const button = card.querySelector(".selectExperienceButton");
    if (button) button.textContent = isSelected ? "Selected" : "Select";
  }
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

function getUniverseId(experience) {
  if (experience.id) return String(experience.id);
  const match = String(experience.path || "").match(/universes\/(\d+)/);
  return match ? match[1] : "";
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

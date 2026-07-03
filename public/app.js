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
const refreshServersButton = document.querySelector("#refreshServersButton");
const serverCount = document.querySelector("#serverCount");
const playerCount = document.querySelector("#playerCount");
const serversStatus = document.querySelector("#serversStatus");
const serverList = document.querySelector("#serverList");
const selectionSummary = document.querySelector("#selectionSummary");
const targetSummary = document.querySelector("#targetSummary");
const teleportTargets = document.querySelector("#teleportTargets");
const teleportDestination = document.querySelector("#teleportDestination");
const teleportButton = document.querySelector("#teleportButton");
const teleportStatus = document.querySelector("#teleportStatus");
const commandStatus = document.querySelector("#commandStatus");
const kickTargets = document.querySelector("#kickTargets");
const kickReason = document.querySelector("#kickReason");
const banTargets = document.querySelector("#banTargets");
const banDuration = document.querySelector("#banDuration");
const banReason = document.querySelector("#banReason");
const unbanTargets = document.querySelector("#unbanTargets");
const kickButton = document.querySelector("#kickButton");
const banButton = document.querySelector("#banButton");
const unbanButton = document.querySelector("#unbanButton");
const announcementMessage = document.querySelector("#announcementMessage");
const announcementButton = document.querySelector("#announcementButton");
const serverAnnouncementTarget = document.querySelector("#serverAnnouncementTarget");
const serverAnnouncementMessage = document.querySelector("#serverAnnouncementMessage");
const serverAnnouncementButton = document.querySelector("#serverAnnouncementButton");
const playerAnnouncementTargets = document.querySelector("#playerAnnouncementTargets");
const playerAnnouncementMessage = document.querySelector("#playerAnnouncementMessage");
const playerAnnouncementButton = document.querySelector("#playerAnnouncementButton");
const refreshChatLogsButton = document.querySelector("#refreshChatLogsButton");
const chatLogCount = document.querySelector("#chatLogCount");
const chatLogsStatus = document.querySelector("#chatLogsStatus");
const chatLogList = document.querySelector("#chatLogList");
const playerDataPanel = document.querySelector("#playerDataPanel");
const dataTarget = document.querySelector("#dataTarget");
const refreshDataStoresButton = document.querySelector("#refreshDataStoresButton");
const dataStoresStatus = document.querySelector("#dataStoresStatus");
const dataStoreList = document.querySelector("#dataStoreList");
const loadPlayerDataButton = document.querySelector("#loadPlayerDataButton");
const savePlayerDataButton = document.querySelector("#savePlayerDataButton");
const formatPlayerDataButton = document.querySelector("#formatPlayerDataButton");
const playerDataEditor = document.querySelector("#playerDataEditor");
const playerDataStatus = document.querySelector("#playerDataStatus");
const dataEntrySummary = document.querySelector("#dataEntrySummary");
const dataMetaSummary = document.querySelector("#dataMetaSummary");

let serverRefreshTimer;
let chatRefreshTimer;
let selectedUniverseId = "";
let selectedPlayerIds = new Set();
let targetPlayer = null;
let liveServers = [];
let loadedDataRequest = null;
let selectedDataStoreName = "";

window.getSelectedUniverseId = () => selectedUniverseId;

init();

async function init() {
  showAuthError();
  await loadServers();
  await loadChatLogs();
  serverRefreshTimer = window.setInterval(loadServers, 5000);
  chatRefreshTimer = window.setInterval(loadChatLogs, 5000);

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
  playerDataPanel.hidden = false;
  await loadExperiences();
}

logoutButton.addEventListener("click", async () => {
  await request("/api/logout", { method: "POST" });
  window.location.reload();
});

refreshExperiencesButton.addEventListener("click", loadExperiences);
refreshServersButton.addEventListener("click", loadServers);
refreshChatLogsButton.addEventListener("click", loadChatLogs);
refreshDataStoresButton.addEventListener("click", loadDataStores);
loadPlayerDataButton.addEventListener("click", loadPlayerData);
savePlayerDataButton.addEventListener("click", savePlayerData);
formatPlayerDataButton.addEventListener("click", formatPlayerData);
teleportButton.addEventListener("click", queueTeleport);
kickButton.addEventListener("click", () => sendModerationCommand("kick"));
banButton.addEventListener("click", () => sendModerationCommand("ban"));
unbanButton.addEventListener("click", () => sendModerationCommand("unban"));
announcementButton.addEventListener("click", sendGlobalAnnouncement);
serverAnnouncementButton.addEventListener("click", sendServerAnnouncement);
playerAnnouncementButton.addEventListener("click", sendPlayerAnnouncement);
experienceGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-universe-id]");
  if (!button) return;

  selectedUniverseId = button.dataset.universeId || "";
  updateSelectedExperience();
  loadServers();
  loadChatLogs();
  selectedDataStoreName = "";
  dataStoreList.innerHTML = "";
  updateSelectedDataStore();
  loadDataStores();
  window.dispatchEvent(new CustomEvent("dashboard:experienceChanged", {
    detail: { universeId: selectedUniverseId },
  }));
});
dataStoreList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-datastore-name]");
  if (!button) return;

  selectedDataStoreName = button.dataset.datastoreName || "";
  updateSelectedDataStore();
  playerDataStatus.textContent = `Selected DataStore ${selectedDataStoreName}. Enter a player username or user ID.`;
});
serverList.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-select-player]");
  if (!checkbox) return;

  const userId = checkbox.dataset.userId;
  if (checkbox.checked) {
    selectedPlayerIds.add(userId);
  } else {
    selectedPlayerIds.delete(userId);
  }

  updateCommandBar();
});
serverList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-target-player]");
  const dataButton = event.target.closest("[data-load-player-data]");
  if (dataButton) {
    dataTarget.value = dataButton.dataset.userId || "";
    loadPlayerData();
    return;
  }

  if (!button) return;

  targetPlayer = {
    userId: button.dataset.userId,
    username: button.dataset.username,
    jobId: button.dataset.jobId,
  };

  commandStatus.textContent = "";
  updateCommandBar();
  loadServers();
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
    await loadServers();
    await loadDataStores();
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
      <button class="button secondary compact selectExperienceButton" type="button" data-universe-id="${escapeHtml(id)}">Show servers</button>
    </article>
  `;
}

async function loadServers() {
  try {
    const query = selectedUniverseId ? `?universeId=${encodeURIComponent(selectedUniverseId)}` : "";
    const data = await request(`/api/servers${query}`);
    liveServers = data.servers || [];
    serverCount.textContent = String(data.serverCount || 0);
    playerCount.textContent = String(data.playerCount || 0);

    if (!liveServers.length) {
      serversStatus.textContent = selectedUniverseId
        ? `Waiting for Roblox heartbeats from universe ${selectedUniverseId}...`
        : "Select an experience or wait for Roblox heartbeats...";
      serverList.innerHTML = "";
      updateCommandBar();
      return;
    }

    serversStatus.textContent = selectedUniverseId
      ? `Showing universe ${selectedUniverseId} servers seen in the last ${data.staleAfterSeconds}s.`
      : `Showing all servers seen in the last ${data.staleAfterSeconds}s.`;
    serverList.innerHTML = liveServers.map(renderServer).join("");
    updateCommandBar();
  } catch (error) {
    serversStatus.textContent = error.message;
  }
}

async function loadChatLogs() {
  try {
    const query = selectedUniverseId ? `?universeId=${encodeURIComponent(selectedUniverseId)}` : "";
    const data = await request(`/api/chat-logs${query}`);
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
  } catch (error) {
    chatLogsStatus.textContent = error.message;
  }
}

async function loadDataStores() {
  if (!selectedUniverseId) {
    dataStoresStatus.textContent = "Select an experience first.";
    dataStoreList.innerHTML = "";
    return;
  }

  refreshDataStoresButton.disabled = true;
  dataStoresStatus.textContent = "Loading DataStores...";

  try {
    const data = await request(`/api/datastores?universeId=${encodeURIComponent(selectedUniverseId)}`);
    if (!data.datastores.length) {
      dataStoresStatus.textContent = "No DataStores found for this experience.";
      dataStoreList.innerHTML = "";
      selectedDataStoreName = "";
      return;
    }

    dataStoresStatus.textContent = `${data.datastores.length} DataStore${data.datastores.length === 1 ? "" : "s"} found. Pick one, then search a player.`;
    dataStoreList.innerHTML = data.datastores.map(renderDataStore).join("");
    if (!selectedDataStoreName && data.datastores.length === 1) {
      selectedDataStoreName = data.datastores[0].name;
    }
    updateSelectedDataStore();
  } catch (error) {
    dataStoresStatus.textContent = formatDataStoreError(error);
    dataStoreList.innerHTML = "";
    selectedDataStoreName = "";
  } finally {
    refreshDataStoresButton.disabled = false;
  }
}

async function loadPlayerData() {
  const requestBody = getPlayerDataRequestBody();
  if (!requestBody) return;

  loadPlayerDataButton.disabled = true;
  savePlayerDataButton.disabled = true;
  playerDataStatus.textContent = "Loading player data...";

  try {
    const payload = await request("/api/player-data/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    loadedDataRequest = payload.request;
    playerDataEditor.value = JSON.stringify(payload.value, null, 2);
    dataEntrySummary.textContent = `${payload.request.datastoreName} / ${payload.request.entryKey}`;
    dataMetaSummary.textContent = payload.version ? `Version ${payload.version}` : "";
    playerDataStatus.textContent = payload.inferred
      ? `Loaded using key ${payload.request.entryKey}. Tried ${payload.inferred.candidatesTried.length} candidate key${payload.inferred.candidatesTried.length === 1 ? "" : "s"}.`
      : "Loaded. Edit the JSON and save when ready.";
    savePlayerDataButton.disabled = false;
  } catch (error) {
    loadedDataRequest = null;
    dataEntrySummary.textContent = "No entry loaded";
    dataMetaSummary.textContent = "";
    playerDataStatus.textContent = formatDataStoreError(error);
    savePlayerDataButton.disabled = true;
  } finally {
    loadPlayerDataButton.disabled = false;
  }
}

async function savePlayerData() {
  const requestBody = loadedDataRequest
    ? {
        universeId: loadedDataRequest.universeId,
        datastoreName: loadedDataRequest.datastoreName,
        target: String(loadedDataRequest.resolvedUser?.userId || loadedDataRequest.target || ""),
        entryKey: loadedDataRequest.entryKey,
      }
    : getPlayerDataRequestBody();
  if (!requestBody) return;

  let value;
  try {
    value = JSON.parse(playerDataEditor.value);
  } catch (error) {
    playerDataStatus.textContent = `JSON is invalid: ${error.message}`;
    return;
  }

  savePlayerDataButton.disabled = true;
  playerDataStatus.textContent = "Saving player data...";

  try {
    const payload = await request("/api/player-data/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...requestBody,
        value,
      }),
    });

    loadedDataRequest = payload.request;
    dataEntrySummary.textContent = `${payload.request.datastoreName} / ${payload.request.entryKey}`;
    dataMetaSummary.textContent = payload.version ? `Version ${payload.version}` : "";
    playerDataStatus.textContent = "Saved successfully.";
    savePlayerDataButton.disabled = false;
  } catch (error) {
    playerDataStatus.textContent = formatDataStoreError(error);
    savePlayerDataButton.disabled = false;
  }
}

function formatPlayerData() {
  if (!playerDataEditor.value.trim()) return;

  try {
    playerDataEditor.value = JSON.stringify(JSON.parse(playerDataEditor.value), null, 2);
    playerDataStatus.textContent = "JSON formatted.";
  } catch (error) {
    playerDataStatus.textContent = `JSON is invalid: ${error.message}`;
  }
}

function getPlayerDataRequestBody() {
  if (!selectedUniverseId) {
    playerDataStatus.textContent = "Select an experience first.";
    return null;
  }

  const body = {
    universeId: Number(selectedUniverseId),
    datastoreName: selectedDataStoreName,
    target: dataTarget.value.trim(),
  };

  if (!body.datastoreName) {
    playerDataStatus.textContent = "Select a DataStore first.";
    return null;
  }

  if (!body.target) {
    playerDataStatus.textContent = "Enter a player username or user ID.";
    return null;
  }

  return body;
}

async function queueTeleport() {
  const manualTargets = teleportTargets.value.trim();
  const manualTargetPlayer = teleportDestination.value.trim();
  const selectedIds = [...selectedPlayerIds].map(Number);

  if (!manualTargets && !selectedIds.length) {
    teleportStatus.textContent = "Enter users to teleport or select players from Live Servers.";
    updateCommandBar();
    return;
  }

  if (!manualTargetPlayer && !targetPlayer) {
    teleportStatus.textContent = "Enter a target player or target a player from Live Servers.";
    updateCommandBar();
    return;
  }

  teleportButton.disabled = true;
  teleportStatus.textContent = "Queueing teleport command...";

  try {
    const payload = await request("/api/commands/teleport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUserId: manualTargetPlayer ? 0 : Number(targetPlayer.userId),
        target: manualTargetPlayer,
        playerUserIds: selectedIds,
        manualTargets,
      }),
    });

    const movedCount = payload.queuedCommands.reduce((total, command) => total + command.playerUserIds.length, 0);
    const fallbackCount = movedCount - Number(payload.immediateCount || 0);
    teleportStatus.textContent = fallbackCount > 0
      ? `Sent ${payload.immediateCount || 0} immediately; ${fallbackCount} queued for heartbeat fallback.`
      : `Sent ${movedCount} teleport command${movedCount === 1 ? "" : "s"} to ${payload.target.username}'s server.`;
    if (payload.unresolvedTargets?.length) {
      teleportStatus.textContent += ` Could not resolve: ${payload.unresolvedTargets.join(", ")}.`;
    }
    selectedPlayerIds.clear();
    teleportTargets.value = "";
    updateCommandBar();
    await loadServers();
  } catch (error) {
    teleportStatus.textContent = error.message;
    updateCommandBar();
  }
}

async function sendModerationCommand(action) {
  const ids = [...selectedPlayerIds].map(Number);
  const actionFields = getModerationFields(action);
  const manualTargets = actionFields.targets.value.trim();

  if (!ids.length && !manualTargets) {
    commandStatus.textContent = "Select players or enter user IDs/usernames first.";
    return;
  }

  commandStatus.textContent = `Sending ${action} command...`;

  try {
    const payload = await request("/api/commands/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        universeId: selectedUniverseId ? Number(selectedUniverseId) : 0,
        playerUserIds: ids,
        manualTargets,
        durationSeconds: Number(actionFields.durationSeconds || -1),
        reason: actionFields.reason,
      }),
    });

    const totalUsers = payload.userIds.length;
    if (action === "kick") {
      const publishedCount = Number(payload.publishedCount || 0);
      const firstDelivery = payload.deliveries?.[0];
      commandStatus.textContent = firstDelivery?.error
        ? `Kick publish failed: ${firstDelivery.error}`
        : `Kick sent for ${totalUsers} user${totalUsers === 1 ? "" : "s"} via topic ${firstDelivery?.topic || "kick"}.`;
    } else {
      const updatedCount = Number(payload.updatedCount || 0);
      const kickCount = Number(payload.kickPublishedCount || 0);
      commandStatus.textContent = action === "ban" && kickCount > 0
        ? `Ban succeeded for ${updatedCount}/${totalUsers} user${totalUsers === 1 ? "" : "s"}; kick topic published.`
        : `${formatAction(action)} updated for ${updatedCount}/${totalUsers} user${totalUsers === 1 ? "" : "s"}.`;
    }
    if (payload.unresolvedTargets?.length) {
      commandStatus.textContent += ` Could not resolve: ${payload.unresolvedTargets.join(", ")}.`;
    }
    if (action !== "unban") {
      selectedPlayerIds.clear();
    }
    updateCommandBar();
    await loadServers();
  } catch (error) {
    commandStatus.textContent = error.message;
  }
}

async function sendGlobalAnnouncement() {
  const message = announcementMessage.value.trim();

  if (!selectedUniverseId) {
    commandStatus.textContent = "Select an experience before sending a global message.";
    return;
  }

  if (!message) {
    commandStatus.textContent = "Enter a message first.";
    return;
  }

  announcementButton.disabled = true;
  commandStatus.textContent = "Sending global message...";

  try {
    const payload = await request("/api/commands/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        universeId: Number(selectedUniverseId),
        message,
      }),
    });

    commandStatus.textContent = payload.ok
      ? `Global message sent via topic ${payload.topic}.`
      : payload.error || "Global message failed.";
    announcementMessage.value = "";
  } catch (error) {
    commandStatus.textContent = error.message;
  } finally {
    announcementButton.disabled = false;
  }
}

async function sendServerAnnouncement() {
  const message = serverAnnouncementMessage.value.trim();
  const target = serverAnnouncementTarget.value.trim();

  if (!message) {
    commandStatus.textContent = "Enter a server message first.";
    return;
  }

  if (!selectedUniverseId) {
    commandStatus.textContent = "Select an experience before sending a server message.";
    return;
  }

  if (!target && !targetPlayer) {
    commandStatus.textContent = "Enter a player username/user ID or target a player in the server list first.";
    return;
  }

  serverAnnouncementButton.disabled = true;
  commandStatus.textContent = "Sending server message...";

  try {
    const payload = await request("/api/commands/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: "server",
        universeId: Number(selectedUniverseId),
        message,
        targetUserId: !target && targetPlayer ? Number(targetPlayer.userId) : 0,
        serverTarget: target,
      }),
    });

    commandStatus.textContent = `Server lookup message published for ${payload.userIds?.length || 0} player target${payload.userIds?.length === 1 ? "" : "s"}.`;
    if (payload.unresolvedTargets?.length) {
      commandStatus.textContent += ` Could not resolve: ${payload.unresolvedTargets.join(", ")}.`;
    }
    serverAnnouncementMessage.value = "";
  } catch (error) {
    commandStatus.textContent = error.message;
  } finally {
    serverAnnouncementButton.disabled = false;
  }
}

async function sendPlayerAnnouncement() {
  const message = playerAnnouncementMessage.value.trim();
  const manualTargets = playerAnnouncementTargets.value.trim();
  const playerUserIds = [...selectedPlayerIds].map(Number);

  if (!message) {
    commandStatus.textContent = "Enter a player message first.";
    return;
  }

  if (!selectedUniverseId) {
    commandStatus.textContent = "Select an experience before sending a player message.";
    return;
  }

  if (!manualTargets && !playerUserIds.length) {
    commandStatus.textContent = "Select players or enter usernames/user IDs first.";
    return;
  }

  playerAnnouncementButton.disabled = true;
  commandStatus.textContent = "Sending player message...";

  try {
    const payload = await request("/api/commands/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: "player",
        universeId: Number(selectedUniverseId),
        message,
        playerUserIds,
        manualTargets,
      }),
    });

    const playerCount = Number(payload.userIds?.length || 0);
    commandStatus.textContent = `Player lookup message published for ${playerCount} player${playerCount === 1 ? "" : "s"}.`;
    if (payload.unresolvedTargets?.length) {
      commandStatus.textContent += ` Could not resolve: ${payload.unresolvedTargets.join(", ")}.`;
    }
    playerAnnouncementMessage.value = "";
  } catch (error) {
    commandStatus.textContent = error.message;
  } finally {
    playerAnnouncementButton.disabled = false;
  }
}

function getModerationFields(action) {
  if (action === "kick") {
    return {
      targets: kickTargets,
      reason: kickReason.value.trim(),
    };
  }

  if (action === "ban") {
    return {
      targets: banTargets,
      durationSeconds: Number(banDuration.value),
      reason: banReason.value.trim(),
    };
  }

  return {
    targets: unbanTargets,
    reason: "",
  };
}

function updateCommandBar() {
  const selectedCount = selectedPlayerIds.size;
  selectionSummary.textContent = selectedCount
    ? `${selectedCount} player${selectedCount === 1 ? "" : "s"} selected`
    : "No players selected";

  targetSummary.textContent = targetPlayer
    ? `Target: ${targetPlayer.username}'s server`
    : "No target server selected";

  teleportButton.disabled = false;

  for (const checkbox of serverList.querySelectorAll("[data-select-player]")) {
    checkbox.checked = selectedPlayerIds.has(checkbox.dataset.userId);
  }

  for (const button of serverList.querySelectorAll("[data-target-player]")) {
    button.classList.toggle("active", targetPlayer?.userId === button.dataset.userId);
  }
}

function updateSelectedExperience() {
  for (const card of experienceGrid.querySelectorAll(".experienceCard")) {
    const isSelected = card.dataset.universeId === selectedUniverseId;
    card.classList.toggle("selected", isSelected);

    const button = card.querySelector(".selectExperienceButton");
    if (button) button.textContent = isSelected ? "Showing servers" : "Show servers";
  }
}

function updateSelectedDataStore() {
  for (const button of dataStoreList.querySelectorAll("[data-datastore-name]")) {
    button.classList.toggle("active", button.dataset.datastoreName === selectedDataStoreName);
  }
}

function renderDataStore(datastore) {
  return `
    <button class="dataStoreButton" type="button" data-datastore-name="${escapeHtml(datastore.name)}">
      <strong>${escapeHtml(datastore.name)}</strong>
      ${datastore.createdTime ? `<span>Created ${escapeHtml(datastore.createdTime)}</span>` : ""}
    </button>
  `;
}

function renderServer(server) {
  const players = server.players.length
    ? server.players.map((player) => renderPlayer(player, server)).join("")
    : `<li class="emptyPlayer">No player names included.</li>`;

  return `
    <article class="serverCard">
      <div class="serverHeader">
        <div>
          <h3>${escapeHtml(shortJobId(server.jobId))}</h3>
          <p>${escapeHtml(String(server.playerCount))} players | up ${escapeHtml(formatDuration(server.uptimeSeconds || 0))} | updated ${escapeHtml(String(server.ageSeconds))}s ago</p>
        </div>
        <code>${escapeHtml(server.jobId)}</code>
      </div>
      <dl class="serverFacts">
        <div><dt>Universe</dt><dd>${escapeHtml(server.universeId || "-")}</dd></div>
        <div><dt>Place</dt><dd>${escapeHtml(server.placeId || "-")}</dd></div>
      </dl>
      <ul class="playerList">${players}</ul>
    </article>
  `;
}

function renderPlayer(player, server) {
  const displayName = player.displayName && player.displayName !== player.username
    ? ` <span>${escapeHtml(player.displayName)}</span>`
    : "";
  const isChecked = selectedPlayerIds.has(String(player.userId)) ? "checked" : "";
  const isTarget = targetPlayer?.userId === String(player.userId) ? " active" : "";

  return `
    <li>
      <label class="playerSelect">
        <input type="checkbox" data-select-player data-user-id="${escapeHtml(player.userId)}" ${isChecked}>
        <span>
          <strong>${escapeHtml(player.username)}</strong>${displayName}
          <small>In game for ${escapeHtml(formatDuration(player.durationSeconds || 0))}</small>
        </span>
      </label>
      <div class="playerActions">
        <button class="miniButton" type="button" data-load-player-data data-user-id="${escapeHtml(player.userId)}">Data</button>
        <button class="miniButton${isTarget}" type="button" data-target-player data-user-id="${escapeHtml(player.userId)}" data-username="${escapeHtml(player.username)}" data-job-id="${escapeHtml(server.jobId)}">Target</button>
        <code>${escapeHtml(player.userId)}</code>
      </div>
    </li>
  `;
}

function renderChatLog(log) {
  const displayName = log.displayName && log.displayName !== log.username
    ? ` <span>${escapeHtml(log.displayName)}</span>`
    : "";

  return `
    <article class="chatLogItem">
      <div class="chatLogHeader">
        <div>
          <strong>${escapeHtml(log.username)}</strong>${displayName}
          <small>${escapeHtml(formatDateTime(log.sentAt))} | ${escapeHtml(shortJobId(log.jobId))}</small>
        </div>
        <code>${escapeHtml(log.userId)}</code>
      </div>
      <p>${escapeHtml(log.message)}</p>
    </article>
  `;
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

function formatDateTime(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAction(action) {
  if (action === "kick") return "Kick";
  if (action === "ban") return "Ban";
  if (action === "unban") return "Unban";
  return action;
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

function formatDataStoreError(error) {
  if (error.status === 401) {
    if (/sign in/i.test(error.message)) {
      return "Sign into the dashboard first, then try again.";
    }

    return "Roblox rejected the API key with 401. Check that server.mjs has the current API key string, the key is allowed for this universe, IP restrictions allow this machine, and the key has the DataStore read/update/list scopes.";
  }

  return error.message;
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

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const canvas = document.querySelector("#movementHeatmapCanvas");
const aiAreaCard = document.querySelector("#aiAreaCard");
const aiAreaBadge = document.querySelector("#aiAreaBadge");
const aiAreaTitle = document.querySelector("#aiAreaTitle");
const aiAreaIssue = document.querySelector("#aiAreaIssue");
const aiAreaQuote = document.querySelector("#aiAreaQuote");
const aiAreaRecommendation = document.querySelector("#aiAreaRecommendation");
const aiAreaVisits = document.querySelector("#aiAreaVisits");
const aiAreaDeaths = document.querySelector("#aiAreaDeaths");
const aiAreaLeaves = document.querySelector("#aiAreaLeaves");
const refreshButton = document.querySelector("#refreshMovementButton");
const centerButton = document.querySelector("#centerMovementButton");
const sampleCount = document.querySelector("#movementSampleCount");
const statusLine = document.querySelector("#movementHeatmapStatus");
const emptyState = document.querySelector("#heatmapEmptyState");
const heatmapLegend = document.querySelector(".heatmapLegend");
const heatmapOverlay = document.querySelector(".heatmapOverlay");
const playerFilter = document.querySelector("#movementPlayerFilter");
const fromFilter = document.querySelector("#movementFromFilter");
const toFilter = document.querySelector("#movementToFilter");
const presetButtons = document.querySelectorAll("[data-heatmap-preset-minutes]");
const modeButtons = document.querySelectorAll("[data-heatmap-mode]");
const renderButtons = document.querySelectorAll("[data-heatmap-render]");

let renderer;
let scene;
let camera;
let points;
let heatmapMesh;
let selectedMarker;
let aiAreaGroup;
let mapGroup;
let grid;
let animationFrame;
let yaw = -0.8;
let pitch = 0.72;
let distance = 520;
let dragging = false;
let dragMode = "rotate";
let lastPointer = null;
let pointerDownPosition = null;
let sceneCenter = null;
let latestCenter = null;
let latestBounds = null;
let latestSamples = [];
let latestEntries = [];
let latestMapSnapshot = null;
let panTarget;
let viewInitialized = false;
let canvasHovered = false;
let lastFrameTime = 0;
let activeHeatmapMode = "ai-analysis";
let activeRenderMode = "points";
let selectedChatLogId = "";
let hoveredAiAreaMarker = null;
let selectedAiAreaMarker = null;
let selectedAiArea = null;
let focusedSignalArea = null;
let heatmapRefreshTimer = null;
const movementKeys = new Set();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

if (canvas) {
  initScene();
  refreshButton?.addEventListener("click", loadHeatmap);
  centerButton?.addEventListener("click", centerView);
  playerFilter?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadHeatmap();
  });
  fromFilter?.addEventListener("change", loadHeatmap);
  toFilter?.addEventListener("change", loadHeatmap);
  for (const button of presetButtons) {
    button.addEventListener("click", () => {
      applyPreset(Number(button.dataset.heatmapPresetMinutes) || 0);
      loadHeatmap();
    });
  }
  for (const button of modeButtons) {
    button.addEventListener("click", () => {
      setHeatmapMode(button.dataset.heatmapMode || "movement");
    });
  }
  for (const button of renderButtons) {
    button.addEventListener("click", () => {
      setRenderMode(button.dataset.heatmapRender || "points");
    });
  }
  window.addEventListener("dashboard:analyticsReady", () => {
    resizeScene();
    startHeatmapRefresh();
  });
  window.addEventListener("dashboard:authChanged", (event) => {
    if (!event.detail?.authenticated) {
      stopHeatmapRefresh();
    }
  });
  window.addEventListener("dashboard:universeChanged", () => {
    resizeScene();
    loadHeatmap({ resetView: true });
  });
  window.addEventListener("dashboard:overviewShown", () => {
    resizeScene();
    loadHeatmap();
  });
  window.addEventListener("dashboard:chatLogSelected", (event) => {
    const id = event.detail?.id || "";
    if (activeHeatmapMode !== "chat") {
      setHeatmapMode("chat", { selectedChatLogId: id });
      return;
    }

    selectChatLogOnMap(id, { notifyList: false });
  });
  window.addEventListener("dashboard:aiAreaAnalysisUpdated", () => {
    if (activeHeatmapMode === "ai-analysis") {
      loadHeatmap();
    }
  });
  window.addEventListener("dashboard:focusHeatmapArea", (event) => {
    const mode = event.detail?.mode || "";
    const area = event.detail?.area || null;
    setHeatmapMode(mode, { focusArea: area, forcePoints: true });
  });
  window.addEventListener("resize", resizeScene);
}

function initScene() {
  canvas.tabIndex = 0;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 1, 5000);
  panTarget = new THREE.Vector3();

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.65);
  directional.position.set(1, 2, 1);
  scene.add(directional);

  grid = new THREE.GridHelper(500, 20, 0x335179, 0x1d2a3d);
  scene.add(grid);

  canvas.addEventListener("pointerdown", (event) => {
    canvas.focus();
    dragging = true;
    dragMode = event.shiftKey || event.button === 1 || event.button === 2 ? "pan" : "rotate";
    lastPointer = { x: event.clientX, y: event.clientY };
    pointerDownPosition = { x: event.clientX, y: event.clientY, button: event.button };
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !lastPointer) {
      updateAiAreaHover(event);
      return;
    }

    setHoveredAiAreaMarker(null);
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;

    if (dragMode === "pan") {
      panView(dx, dy);
    } else {
      yaw -= dx * 0.006;
      pitch = clamp(pitch + dy * 0.004, 0.18, 1.35);
      updateCamera();
    }

    lastPointer = { x: event.clientX, y: event.clientY };
  });

  canvas.addEventListener("pointerup", (event) => {
    if (isAiAreaClickPointerUp(event)) {
      openAiAreaCardFromPointer(event);
    }

    if (isClickPointerUp(event)) {
      selectChatPointFromPointer(event);
    }

    dragging = false;
    lastPointer = null;
    pointerDownPosition = null;
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    distance = clamp(distance + event.deltaY * 0.35, 120, 1500);
    updateCamera();
  }, { passive: false });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  canvas.addEventListener("pointerenter", () => {
    canvasHovered = true;
  });

  canvas.addEventListener("pointerleave", () => {
    canvasHovered = false;
    setHoveredAiAreaMarker(null);
  });

  window.addEventListener("keydown", (event) => {
    if (!isMovementKey(event.code) || !shouldUseKeyboardControls()) return;
    event.preventDefault();
    movementKeys.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    if (!isMovementKey(event.code)) return;
    movementKeys.delete(event.code);
  });

  window.addEventListener("blur", () => {
    movementKeys.clear();
  });

  resizeScene();
  animate();
}

async function loadHeatmap(options = {}) {
  if (window.isDashboardAuthenticated?.() === false) {
    statusLine.textContent = "Unlock the dashboard to view heatmap samples.";
    return;
  }

  const universeId = window.getSelectedUniverseId?.() || "";
  if (!universeId) {
    latestSamples = [];
    latestEntries = [];
    setHeatmapEmptyState(true);
    sampleCount.textContent = "0 samples";
    statusLine.textContent = "Pick universe first";
    renderScene([], null, {
      resetView: Boolean(options.resetView),
      suppressFallbackAreas: true,
    });
    return;
  }

  const query = buildHeatmapQuery(universeId);
  const modeLabel = getModeLabel();
  const modeText = getModeText(modeLabel);

  setHeatmapEmptyState(false);
  statusLine.textContent = `Loading ${modeText} samples for universe ${universeId}...`;

  try {
    const samplePromise = fetch(`${getHeatmapEndpoint()}${query}`, {
      headers: { Accept: "application/json" },
    }).then(readJsonResponse);

    const mapPromise = universeId
      ? fetch(`/api/map-snapshot?universeId=${encodeURIComponent(universeId)}`, {
        headers: { Accept: "application/json" },
      }).then(readJsonResponse).catch((error) => ({ mapError: error.message }))
      : Promise.resolve({ snapshot: null });

    const [payload, mapPayload] = await Promise.all([samplePromise, mapPromise]);
    const mapSnapshot = mapPayload.snapshot || null;
    const samplePayload = normalizeHeatmapPayload(payload);
    latestSamples = samplePayload.samples;
    latestMapSnapshot = mapSnapshot;
    renderScene(latestSamples, latestMapSnapshot, {
      resetView: Boolean(options.resetView),
    });

    const mapText = mapSnapshot?.partCount ? ` Map: ${mapSnapshot.partCount} parts.` : "";
    const mapErrorText = mapPayload.mapError ? ` Map failed: ${mapPayload.mapError}` : "";
    sampleCount.textContent = `${samplePayload.returnedCount || 0} ${modeText} sample${samplePayload.returnedCount === 1 ? "" : "s"}`;
    if (samplePayload.returnedCount || mapSnapshot?.partCount) {
      statusLine.textContent = `${getStatusText(samplePayload)}${mapText}${mapErrorText}`;
    } else {
      statusLine.textContent = `No ${modeText} samples received yet.${mapErrorText}`;
    }
  } catch (error) {
    statusLine.textContent = error.message;
  }
}

function getModeText(label) {
  return label === "AI Analysis" ? "AI analysis" : label.toLowerCase();
}

function setHeatmapEmptyState(isEmpty) {
  if (emptyState) emptyState.hidden = !isEmpty;
  if (heatmapLegend) heatmapLegend.hidden = isEmpty;
  if (heatmapOverlay) heatmapOverlay.hidden = isEmpty;
  canvas?.classList.toggle("isEmpty", isEmpty);
  if (isEmpty) hideAiAreaCard();
}

function startHeatmapRefresh() {
  stopHeatmapRefresh();
  heatmapRefreshTimer = window.setInterval(loadHeatmap, 15000);
}

function stopHeatmapRefresh() {
  if (!heatmapRefreshTimer) return;
  window.clearInterval(heatmapRefreshTimer);
  heatmapRefreshTimer = null;
}

function normalizeHeatmapPayload(payload) {
  if (activeHeatmapMode === "ai-analysis") {
    return {
      ...payload,
      returnedCount: payload.areaCount || 0,
      samples: payload.areas || [],
    };
  }

  if (activeHeatmapMode !== "chat") {
    return {
      ...payload,
      returnedCount: payload.returnedCount || 0,
      samples: payload.samples || [],
    };
  }

  const samples = (payload.logs || []).filter((log) => (
    Number.isFinite(Number(log.x))
    && Number.isFinite(Number(log.y))
    && Number.isFinite(Number(log.z))
  ));

  return {
    ...payload,
    returnedCount: samples.length,
    sampleCount: payload.logCount || samples.length,
    samples,
  };
}

function setHeatmapMode(mode, options = {}) {
  activeHeatmapMode = ["ai-analysis", "movement", "deaths", "leaves", "chat"].includes(mode) ? mode : "ai-analysis";
  if (options.selectedChatLogId) {
    selectedChatLogId = options.selectedChatLogId;
  }

  for (const button of modeButtons) {
    button.classList.toggle("active", button.dataset.heatmapMode === activeHeatmapMode);
  }

  if (options.forcePoints || activeHeatmapMode === "ai-analysis") {
    activeRenderMode = "points";
    for (const button of renderButtons) {
      button.classList.toggle("active", button.dataset.heatmapRender === activeRenderMode);
    }
  }

  return loadHeatmap({ focusArea: options.focusArea || null });
}

function setRenderMode(mode) {
  activeRenderMode = mode === "heatmap" ? "heatmap" : "points";

  if (activeRenderMode === "heatmap" && activeHeatmapMode === "ai-analysis") {
    activeHeatmapMode = "movement";
  }

  for (const button of modeButtons) {
    button.classList.toggle("active", button.dataset.heatmapMode === activeHeatmapMode);
  }

  for (const button of renderButtons) {
    button.classList.toggle("active", button.dataset.heatmapRender === activeRenderMode);
  }

  if (activeRenderMode === "heatmap") {
    loadHeatmap();
  } else if (latestSamples.length || latestMapSnapshot) {
    renderScene(latestSamples, latestMapSnapshot);
  }
}

function getHeatmapEndpoint() {
  if (activeHeatmapMode === "ai-analysis") return "/api/ai-area-analysis";
  if (activeHeatmapMode === "deaths") return "/api/death-heatmap";
  if (activeHeatmapMode === "leaves") return "/api/leave-heatmap";
  if (activeHeatmapMode === "chat") return "/api/chat-logs";
  return "/api/movement-heatmap";
}

function getModeLabel() {
  if (activeHeatmapMode === "ai-analysis") return "AI Analysis";
  if (activeHeatmapMode === "deaths") return "Death";
  if (activeHeatmapMode === "leaves") return "Leave";
  if (activeHeatmapMode === "chat") return "Chat";
  return "Movement";
}

async function readJsonResponse(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

function buildHeatmapQuery(universeId) {
  const params = new URLSearchParams();
  if (universeId) params.set("universeId", universeId);

  const target = playerFilter?.value.trim();
  if (target) params.set("target", target);

  const from = getDateTimeMs(fromFilter?.value);
  if (from) params.set("from", String(from));

  const to = getDateTimeMs(toFilter?.value);
  if (to) params.set("to", String(to));

  const query = params.toString();
  return query ? `?${query}` : "";
}

function getDateTimeMs(value) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function applyPreset(minutes) {
  if (!minutes || !fromFilter || !toFilter) return;
  const now = new Date();
  const from = new Date(now.getTime() - minutes * 60 * 1000);
  fromFilter.value = toDateTimeLocalValue(from);
  toFilter.value = toDateTimeLocalValue(now);
}

function toDateTimeLocalValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getStatusText(payload) {
  const filters = payload.filters || {};
  const parts = [activeHeatmapMode === "chat"
    ? "Drag to rotate. Scroll to zoom. Click chat dots to open messages."
    : "Drag to rotate. Scroll to zoom."];
  if (filters.userIds?.length) {
    parts.push(`Player filter: ${filters.userIds.join(", ")}`);
  }
  if (filters.from || filters.to) {
    const from = filters.from ? new Date(filters.from).toLocaleString() : "start";
    const to = filters.to ? new Date(filters.to).toLocaleString() : "now";
    parts.push(`${from} to ${to}`);
  }
  if (filters.unresolvedTargets?.length) {
    parts.push(`Unresolved: ${filters.unresolvedTargets.join(", ")}`);
  }
  return parts.join(" ");
}

function renderScene(samples, mapSnapshot, options = {}) {
  const previousSelectedAiAreaId = activeHeatmapMode === "ai-analysis" && !aiAreaCard?.hidden
    ? selectedAiArea?.id || ""
    : "";

  if (points) {
    scene.remove(points);
    points.geometry.dispose();
    points.material.dispose();
    points = null;
  }

  if (heatmapMesh) {
    scene.remove(heatmapMesh);
    disposeObject3D(heatmapMesh);
    heatmapMesh = null;
  }

  if (selectedMarker) {
    scene.remove(selectedMarker);
    selectedMarker.geometry.dispose();
    selectedMarker.material.dispose();
    selectedMarker = null;
  }

  if (aiAreaGroup) {
    scene.remove(aiAreaGroup);
    disposeObject3D(aiAreaGroup);
    aiAreaGroup = null;
    hoveredAiAreaMarker = null;
    selectedAiAreaMarker = null;
  }

  if (mapGroup) {
    scene.remove(mapGroup);
    disposeObject3D(mapGroup);
    mapGroup = null;
  }

  const entries = getSampleEntries(samples, mapSnapshot, options);
  latestEntries = entries;
  if (!previousSelectedAiAreaId) {
    hideAiAreaCard();
  }
  focusedSignalArea = options.focusArea || null;
  latestBounds = mapSnapshot?.bounds || (entries.length ? getBounds(entries) : null);
  const dataCenter = mapSnapshot?.bounds?.center || (entries.length ? getCenter(entries) : { x: 0, y: 0, z: 0 });
  latestCenter = dataCenter;
  const shouldResetView = Boolean(options.resetView) || (!viewInitialized && latestBounds);
  if (!sceneCenter || shouldResetView) {
    sceneCenter = dataCenter;
  }

  if (mapSnapshot?.parts?.length) {
    renderMapSnapshot(mapSnapshot, sceneCenter, entries);
  }

  if (entries.length) {
    renderSamples(entries, sceneCenter);
    renderSelectedChatMarker(entries, sceneCenter);
    renderFocusedSignalArea(sceneCenter);
  }

  restoreAiAreaCardAfterRefresh(previousSelectedAiAreaId, entries);

  if (latestBounds) {
    grid.scale.setScalar(clamp(Math.max(latestBounds.width, latestBounds.depth) / 500, 0.5, 8));
  }

  if (shouldResetView) {
    fitViewToBounds();
    viewInitialized = true;
  } else {
    updateCamera();
  }

  if (focusedSignalArea && activeHeatmapMode !== "ai-analysis") {
    focusCameraOnSignalArea(focusedSignalArea);
  }
}

function restoreAiAreaCardAfterRefresh(areaId, entries) {
  if (!areaId || activeHeatmapMode !== "ai-analysis") return;

  const refreshedArea = entries.find((entry) => entry.id === areaId);
  if (!refreshedArea) {
    hideAiAreaCard();
    return;
  }

  updateAiAreaCard(refreshedArea, getAiAreaMarkerForArea(refreshedArea), { focusCamera: false });
}

function getSampleEntries(samples, mapSnapshot = null, options = {}) {
  if (activeHeatmapMode === "ai-analysis") {
    if (options.suppressFallbackAreas) return [];
    return getAiAnalysisAreaEntries(samples, mapSnapshot);
  }

  if (activeHeatmapMode === "chat") {
    return getChatSampleEntries(samples);
  }

  if (activeHeatmapMode === "movement" && activeRenderMode === "points") {
    return getSignalAreaEntries(samples, activeHeatmapMode);
  }

  if ((activeHeatmapMode === "deaths" || activeHeatmapMode === "leaves") && activeRenderMode === "points") {
    return getSignalAreaEntries(samples, activeHeatmapMode);
  }

  return getSampleBins(samples);
}

function getChatSampleEntries(samples) {
  return samples.map((sample) => {
    const x = Number(sample.x);
    const y = Number(sample.y);
    const z = Number(sample.z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;

    return {
      id: String(sample.id || ""),
      x,
      y,
      z,
      count: 1,
      username: sample.username || "Player",
      message: sample.message || "",
      sentAt: sample.sentAt || sample.receivedAt || 0,
    };
  }).filter(Boolean);
}

function getSampleBins(samples) {
  const bins = new Map();
  for (const sample of samples) {
    const x = Number(sample.x);
    const y = Number(sample.y);
    const z = Number(sample.z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    const weight = getSampleWeight(sample);
    const key = `${Math.round(x / 8) * 8}:${Math.round(y / 8) * 8}:${Math.round(z / 8) * 8}`;
    const existing = bins.get(key);
    if (existing) {
      existing.count += weight;
    } else {
      bins.set(key, { x, y, z, count: weight });
    }
  }

  return [...bins.values()];
}

function getSignalAreaEntries(samples, mode) {
  const radius = 44;
  const radiusSq = radius * radius;
  const clusters = [];

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

  for (const cluster of clusters) {
    cluster.densityScore = getSignalAreaDensityScore(cluster, samples, radius);
  }

  const topClusters = clusters
    .sort((a, b) => (b.densityScore - a.densityScore) || (b.count - a.count))
    .slice(0, 5);
  const maxScore = topClusters.reduce((max, area) => Math.max(max, area.densityScore || area.count), 1);
  const labelPrefix = getSignalAreaLabelPrefix(mode);

  return topClusters.map((area, index) => ({
    ...area,
    id: `${mode}-area-${index + 1}`,
    label: `${labelPrefix} ${index + 1}`,
    rank: index + 1,
    score: clamp((area.densityScore || area.count) / maxScore, 0.12, 1),
    signalMode: mode,
  }));
}

function getSignalAreaDensityScore(area, samples, radius) {
  const sigma = Math.max(radius * 0.72, 1);
  const twoSigmaSquared = 2 * sigma * sigma;
  let score = 0;

  for (const sample of samples) {
    const x = Number(sample.x);
    const z = Number(sample.z);
    if (!Number.isFinite(x) || !Number.isFinite(z)) continue;

    const dx = x - area.x;
    const dz = z - area.z;
    const distanceSquared = dx * dx + dz * dz;
    score += getSampleWeight(sample) * Math.exp(-distanceSquared / twoSigmaSquared);
  }

  return score;
}

function getSampleWeight(sample) {
  return Math.max(
    Number(sample?.count) || 0,
    Number(sample?.movementCount) || 0,
    Number(sample?.sampleCount) || 0,
    1,
  );
}

function getAiAnalysisAreaEntries(samples, mapSnapshot) {
  const serverAreas = samples.filter((sample) => (
    Number.isFinite(Number(sample.x))
    && Number.isFinite(Number(sample.y))
    && Number.isFinite(Number(sample.z))
  ));

  if (serverAreas.length) {
    return serverAreas.map((area, index) => ({
      ...area,
      id: area.id || `area${index + 1}`,
      label: area.label || `Area ${index + 1}`,
      rank: area.rank || index + 1,
      x: Number(area.x),
      y: Number(area.y),
      z: Number(area.z),
      count: area.sampleCount || area.movementCount || 1,
      score: clamp(Number(area.score) || 0.12, 0.12, 1),
      movementCount: Number(area.movementCount) || 0,
      deathCount: Number(area.deathCount) || 0,
      leaveCount: Number(area.leaveCount) || 0,
      chatCount: Number(area.chatCount) || 0,
      topMessages: Array.isArray(area.topMessages) ? area.topMessages : [],
    }));
  }

  const movementBins = getSampleBins(samples)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (movementBins.length) {
    const maxCount = movementBins.reduce((max, entry) => Math.max(max, entry.count), 1);
    return movementBins.map((entry, index) => ({
      ...entry,
      id: `area${index + 1}`,
      label: `Area ${index + 1}`,
      rank: index + 1,
      score: clamp(entry.count / maxCount, 0.12, 1),
    }));
  }

  const bounds = mapSnapshot?.bounds;
  const center = bounds?.center || { x: 0, y: 0, z: 0 };
  const width = Math.max(Number(bounds?.width) || 180, 120);
  const depth = Math.max(Number(bounds?.depth) || 180, 120);
  const y = Number(center.y) || 0;
  const offsets = [
    { x: -0.26, z: -0.18, score: 0.92 },
    { x: 0.18, z: 0.16, score: 0.72 },
    { x: -0.04, z: 0.32, score: 0.52 },
    { x: 0.31, z: -0.22, score: 0.34 },
    { x: -0.34, z: 0.08, score: 0.18 },
  ];

  return offsets.map((offset, index) => ({
    id: `area${index + 1}`,
    label: `Area ${index + 1}`,
    rank: index + 1,
    x: center.x + offset.x * width,
    y,
    z: center.z + offset.z * depth,
    count: 1,
    score: offset.score,
  }));
}

function renderSamples(entries, center) {
  if (!entries.length) return;

  if (activeRenderMode === "heatmap" && activeHeatmapMode !== "ai-analysis") {
    if (mapGroup) return;
    renderDensityHeatmap(entries, center);
    return;
  }

  if (activeHeatmapMode === "ai-analysis") {
    renderAiAnalysisAreas(entries, center);
    return;
  }

  if (
    activeHeatmapMode === "deaths"
    || activeHeatmapMode === "leaves"
    || (activeHeatmapMode === "movement" && activeRenderMode === "points")
  ) {
    renderSignalAreas(entries, center, activeHeatmapMode);
    return;
  }

  const maxCount = entries.reduce((max, entry) => Math.max(max, entry.count), 1);
  const positions = new Float32Array(entries.length * 3);
  const colors = new Float32Array(entries.length * 3);

  entries.forEach((entry, index) => {
    const intensity = entry.count / maxCount;
    const color = getSampleColor(intensity, entry);
    positions[index * 3] = entry.x - center.x;
    positions[index * 3 + 1] = entry.y - center.y;
    positions[index * 3 + 2] = entry.z - center.z;
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: activeHeatmapMode === "chat" ? 10 : 8,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });

  points = new THREE.Points(geometry, material);
  points.userData.entries = entries;
  scene.add(points);
}

function renderSignalAreas(entries, center, mode) {
  aiAreaGroup = new THREE.Group();
  aiAreaGroup.name = getSignalAreaGroupName(mode);

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const marker = createSignalAreaMarker(entry, mode);
    marker.position.set(entry.x - center.x, entry.y - center.y + 8, entry.z - center.z);
    aiAreaGroup.add(marker);
  }

  scene.add(aiAreaGroup);
}

function createSignalAreaMarker(entry, mode) {
  const group = new THREE.Group();
  const color = getSignalAreaColor(entry.score || 1, mode);
  const glowColor = new THREE.Color(color.r / 255, color.g / 255, color.b / 255);
  const isDeath = mode === "deaths";
  const isMovement = mode === "movement";

  const glowGeometry = new THREE.SphereGeometry(isDeath ? 16 : isMovement ? 17 : 15, 24, 14);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: isDeath ? 0.2 : isMovement ? 0.16 : 0.18,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.scale.set(isDeath ? 2.1 : isMovement ? 2.9 : 2.45, 0.2, isDeath ? 2.1 : isMovement ? 2.9 : 1.75);
  group.add(glow);

  const ringGeometry = new THREE.RingGeometry(isDeath ? 7 : isMovement ? 13 : 9, isDeath ? 18 : isMovement ? 24 : 20, 36);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: isDeath ? 0.38 : isMovement ? 0.28 : 0.32,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 1.2;
  group.add(ring);

  const coreGeometry = isDeath
    ? new THREE.ConeGeometry(6.2, 16, 4)
    : isMovement
      ? new THREE.CylinderGeometry(7, 7, 8, 24)
      : new THREE.BoxGeometry(11, 11, 11);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.96,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.y = isDeath ? 8 : isMovement ? 5.5 : 7;
  if (!isDeath && !isMovement) {
    core.rotation.y = Math.PI / 4;
    core.rotation.z = Math.PI / 8;
  }
  group.add(core);

  const badge = createNumberSprite(String(entry.rank || 1), color);
  badge.position.y = isMovement ? 23 : 24;
  group.add(badge);

  return group;
}

function getSignalAreaGroupName(mode) {
  if (mode === "movement") return "MovementAreaMarkers";
  if (mode === "deaths") return "DeathAreaMarkers";
  return "DropOffAreaMarkers";
}

function getSignalAreaLabelPrefix(mode) {
  if (mode === "movement") return "Movement Area";
  if (mode === "deaths") return "Death Area";
  return "Drop-off Area";
}

function renderAiAnalysisAreas(entries, center) {
  aiAreaGroup = new THREE.Group();
  aiAreaGroup.name = "AiAnalysisAreas";

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const color = getTrafficRampColor(entry.score ?? ((entries.length - index) / entries.length));
    const marker = createAiAreaMarker(entry, color);
    marker.position.set(entry.x - center.x, entry.y - center.y + 8, entry.z - center.z);
    aiAreaGroup.add(marker);
  }

  scene.add(aiAreaGroup);
}

function createAiAreaMarker(entry, color) {
  const group = new THREE.Group();
  group.userData.aiArea = entry;
  group.userData.aiAreaMarkerRoot = group;
  const glowColor = new THREE.Color(color.r / 255, color.g / 255, color.b / 255);

  const glowGeometry = new THREE.SphereGeometry(14, 24, 14);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.name = "aiAreaGlow";
  glow.scale.set(2.2, 0.22, 2.2);
  group.add(glow);

  const ringGeometry = new THREE.RingGeometry(8, 18, 36);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.name = "aiAreaRing";
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 1.5;
  group.add(ring);

  const coreGeometry = new THREE.SphereGeometry(5.5, 20, 14);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.95,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.name = "aiAreaCore";
  core.position.y = 5;
  group.add(core);

  const hitGeometry = new THREE.SphereGeometry(18, 16, 10);
  const hitMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitTarget = new THREE.Mesh(hitGeometry, hitMaterial);
  hitTarget.name = "aiAreaHitTarget";
  hitTarget.position.y = 10;
  group.add(hitTarget);

  const badge = createNumberSprite(String(entry.rank || 1), color);
  badge.name = "aiAreaBadge";
  badge.position.y = 18;
  group.add(badge);

  group.traverse((child) => {
    child.userData.aiArea = entry;
    child.userData.aiAreaMarkerRoot = group;
  });

  return group;
}

function createNumberSprite(text, color) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 96;
  labelCanvas.height = 96;
  const context = labelCanvas.getContext("2d");
  context.font = "900 42px Inter, Segoe UI, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const fill = `rgb(${color.r}, ${color.g}, ${color.b})`;
  context.shadowColor = fill;
  context.shadowBlur = 18;
  context.fillStyle = fill;
  context.beginPath();
  context.arc(48, 48, 32, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.strokeStyle = "rgba(255, 255, 255, 0.92)";
  context.lineWidth = 7;
  context.beginPath();
  context.arc(48, 48, 32, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = "#f5f7fb";
  context.fillText(text, 48, 50);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(28, 28, 1);
  return sprite;
}

function updateAiAreaHover(event) {
  if (activeHeatmapMode !== "ai-analysis" || !aiAreaGroup || !latestEntries.length) {
    setHoveredAiAreaMarker(null);
    return;
  }

  setHoveredAiAreaMarker(getAiAreaMarkerFromPointer(event));
}

function getAiAreaMarkerFromPointer(event) {
  if (!aiAreaGroup) return null;

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(aiAreaGroup, true)[0];
  return hit?.object?.userData?.aiAreaMarkerRoot || null;
}

function setHoveredAiAreaMarker(marker) {
  if (hoveredAiAreaMarker === marker) return;

  if (hoveredAiAreaMarker) {
    setAiAreaMarkerHoverState(hoveredAiAreaMarker, false);
  }

  hoveredAiAreaMarker = marker;

  if (hoveredAiAreaMarker) {
    setAiAreaMarkerHoverState(hoveredAiAreaMarker, true);
  }

  canvas.style.cursor = hoveredAiAreaMarker ? "pointer" : "";
}

function setAiAreaMarkerHoverState(marker, isHovered) {
  const scale = isHovered ? 1.22 : 1;
  marker.scale.setScalar(scale);

  marker.traverse((child) => {
    if (!child.material) return;
    if (child.name === "aiAreaGlow") child.material.opacity = isHovered ? 0.34 : 0.16;
    if (child.name === "aiAreaRing") child.material.opacity = isHovered ? 0.48 : 0.24;
    if (child.name === "aiAreaCore") child.material.opacity = isHovered ? 1 : 0.95;
  });
}

function isAiAreaClickPointerUp(event) {
  if (activeHeatmapMode !== "ai-analysis" || !pointerDownPosition || pointerDownPosition.button !== 0) return false;

  const dx = event.clientX - pointerDownPosition.x;
  const dy = event.clientY - pointerDownPosition.y;
  return Math.hypot(dx, dy) <= 5;
}

function openAiAreaCardFromPointer(event) {
  const marker = getAiAreaMarkerFromPointer(event);
  const area = marker?.userData?.aiArea;

  if (!area) {
    hideAiAreaCard();
    return;
  }

  updateAiAreaCard(area, marker, { focusCamera: true });
}

function hideAiAreaCard() {
  if (!aiAreaCard) return;
  aiAreaCard.hidden = true;
  selectedAiAreaMarker = null;
  selectedAiArea = null;
}

function updateAiAreaCard(area, marker = null, options = {}) {
  if (!aiAreaCard) return;
  const color = getTrafficRampColor(area.score || 1);
  selectedAiArea = area;
  selectedAiAreaMarker = marker || getAiAreaMarkerForArea(area);
  aiAreaCard.hidden = false;
  aiAreaBadge.textContent = String(area.rank || 1);
  aiAreaBadge.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
  aiAreaTitle.textContent = area.label || "Area 1";
  updateAiAreaInsightText(area);
  aiAreaVisits.textContent = String(area.movementCount || area.count || 0);
  aiAreaDeaths.textContent = String(area.deathCount ?? "--");
  aiAreaLeaves.textContent = String(area.leaveCount ?? "--");
  if (options.focusCamera) focusCameraOnAiAreaMarker(selectedAiAreaMarker);
  positionAiAreaCard();
}

function getAiAreaMarkerForArea(area) {
  if (!aiAreaGroup || !area?.id) return null;
  return aiAreaGroup.children.find((child) => child.userData?.aiArea?.id === area.id) || null;
}

function positionAiAreaCard() {
  if (!selectedAiArea || aiAreaCard.hidden) return;
  const shell = aiAreaCard.parentElement;
  if (!shell) return;

  const rect = shell.getBoundingClientRect();
  const anchor = getAiAreaCardAnchor();
  const cardWidth = aiAreaCard.offsetWidth || 320;
  const cardHeight = aiAreaCard.offsetHeight || 140;
  const padding = 14;
  let left = anchor.x + 24;
  let top = anchor.y - cardHeight * 0.52;

  if (left + cardWidth + padding > rect.width) {
    left = anchor.x - cardWidth - 24;
  }

  top = clamp(top, padding, Math.max(padding, rect.height - cardHeight - padding));
  left = clamp(left, padding, Math.max(padding, rect.width - cardWidth - padding));
  aiAreaCard.style.left = `${left}px`;
  aiAreaCard.style.top = `${top}px`;
}

function getAiAreaCardAnchor() {
  const shell = aiAreaCard.parentElement;
  const rect = shell.getBoundingClientRect();
  const worldPosition = new THREE.Vector3();

  if (selectedAiAreaMarker) {
    selectedAiAreaMarker.getWorldPosition(worldPosition);
    worldPosition.y += 14;
  } else if (selectedAiArea && sceneCenter) {
    worldPosition.set(
      selectedAiArea.x - sceneCenter.x,
      selectedAiArea.y - sceneCenter.y + 22,
      selectedAiArea.z - sceneCenter.z,
    );
  }

  worldPosition.project(camera);

  return {
    x: (worldPosition.x + 1) * rect.width * 0.5,
    y: (1 - worldPosition.y) * rect.height * 0.5,
  };
}

function focusCameraOnAiAreaMarker(marker) {
  if (!marker || !panTarget) return;
  const target = new THREE.Vector3();
  marker.getWorldPosition(target);
  target.y = Math.max(0, target.y * 0.35);
  panTarget.copy(target);

  if (latestBounds) {
    const focusDistance = clamp(Math.max(latestBounds.width, latestBounds.depth) * 0.7, 180, 950);
    distance = Math.min(distance, focusDistance);
  }

  updateCamera();
}

function focusCameraOnSignalArea(area) {
  if (!area || !sceneCenter || !panTarget) return;

  const x = Number(area.x);
  const y = Number(area.y);
  const z = Number(area.z);
  if (![x, y, z].every(Number.isFinite)) return;

  panTarget.set(x - sceneCenter.x, Math.max(0, y - sceneCenter.y), z - sceneCenter.z);

  if (latestBounds) {
    const focusDistance = clamp(Math.max(latestBounds.width, latestBounds.depth) * 0.68, 170, 900);
    distance = Math.min(distance, focusDistance);
  }

  updateCamera();
}

function updateAiAreaInsightText(area) {
  const quote = getAiAreaTopQuote(area);
  aiAreaIssue.textContent = getAiAreaIssue(area);
  aiAreaRecommendation.textContent = getAiAreaRecommendation(area);

  if (quote) {
    aiAreaQuote.hidden = false;
    aiAreaQuote.textContent = `Top chat quote: "${quote}"`;
  } else {
    aiAreaQuote.hidden = true;
    aiAreaQuote.textContent = "";
  }
}

function getAiAreaIssue(area) {
  if (area.summary) {
    return area.summary;
  }

  if (area.topMessages?.length) {
    return "Players are repeatedly calling out confusion or friction near this area.";
  }

  if ((area.leaveCount || 0) > 0 || (area.deathCount || 0) > 0) {
    return "Potential friction area based on leave and death events near player movement.";
  }

  if ((area.chatCount || 0) > 0) {
    return "Potential question area based on chat activity near player movement.";
  }

  return "Potential point of interest from movement density. AI naming and reasoning will come after clustering.";
}

function getAiAreaRecommendation(area) {
  if (area.recommendation) {
    return area.recommendation;
  }

  if ((area.leaveCount || 0) > 0 || (area.deathCount || 0) > 0) {
    return "Review the nearby pathing, hazards, and objective clarity, then compare the area against the local chat evidence.";
  }

  if (area.topMessages?.length || (area.chatCount || 0) > 0) {
    return "Inspect the nearby objective flow and add clearer in-game guidance where players are asking for help.";
  }

  return "Review this area in Studio and compare against player intent.";
}

function getAiAreaTopQuote(area) {
  const topMessage = Array.isArray(area.topMessages) ? area.topMessages[0] : null;
  const message = typeof topMessage === "string" ? topMessage : topMessage?.message;
  return String(message || "").trim();
}

function renderDensityHeatmap(entries, center) {
  const extents = getEntryExtents(entries);
  const cellSize = getDensityCellSize(extents);
  const bins = getDensityBins(entries, cellSize);
  if (!bins.length) return;

  const field = buildDensitySurfaceField(extents, bins, cellSize);
  if (!field?.vertices.length) return;

  const baseGlow = createDensityGlowMesh(field, center, {
    name: "DensityBaseGlow",
    yOffset: 0.45,
    heightMultiplier: 0,
    colorPower: 0.44,
    alphaPower: 0.55,
    opacity: 0.5,
    renderOrder: 3,
  });
  const raisedGlow = createDensityGlowMesh(field, center, {
    name: "DensityRaisedGlow",
    yOffset: 1.25,
    heightMultiplier: 0,
    colorPower: 0.34,
    alphaPower: 0.48,
    opacity: 0.62,
    renderOrder: 4,
  });

  heatmapMesh = new THREE.Group();
  heatmapMesh.name = "DensityHeatmap";
  heatmapMesh.add(baseGlow);
  heatmapMesh.add(raisedGlow);
  scene.add(heatmapMesh);
}

function getDensityCellSize(extents) {
  const span = Math.max(extents.width, extents.depth, 1);
  return clamp(span / 66, 4, 22);
}

function buildDensitySurfaceField(extents, bins, cellSize) {
  const radius = cellSize * 4.8;
  const margin = radius * 1.15;
  const width = Math.max(extents.width + margin * 2, cellSize * 8);
  const depth = Math.max(extents.depth + margin * 2, cellSize * 8);
  const columns = Math.round(clamp(Math.ceil(width / cellSize), 14, 96));
  const rows = Math.round(clamp(Math.ceil(depth / cellSize), 14, 96));
  const stepX = width / columns;
  const stepZ = depth / rows;
  const startX = ((extents.minX + extents.maxX) / 2) - width / 2;
  const startZ = ((extents.minZ + extents.maxZ) / 2) - depth / 2;
  const baseY = Number.isFinite(extents.minY) ? extents.minY : 0;
  const twoSigmaSquared = 2 * (radius * 0.5) ** 2;
  const vertices = [];
  let maxDensity = 0;

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      const x = startX + column * stepX;
      const z = startZ + row * stepZ;
      let density = 0;
      let weightedY = 0;

      for (const bin of bins) {
        const dx = x - bin.x;
        const dz = z - bin.z;
        const distanceSquared = dx * dx + dz * dz;
        if (distanceSquared > radius * radius) continue;

        const influence = bin.count * Math.exp(-distanceSquared / twoSigmaSquared);
        density += influence;
        weightedY += influence * bin.y;
      }

      maxDensity = Math.max(maxDensity, density);
      vertices.push({
        x,
        y: density > 0 ? weightedY / density : baseY,
        z,
        density,
      });
    }
  }

  if (maxDensity <= 0) return null;

  for (const vertex of vertices) {
    const normalized = vertex.density / maxDensity;
    vertex.normalized = normalized;
  }

  return {
    columns,
    rows,
    vertices,
  };
}

function createDensityGlowMesh(field, center, options) {
  const positions = new Float32Array(field.vertices.length * 3);
  const colors = new Float32Array(field.vertices.length * 3);
  const alphas = new Float32Array(field.vertices.length);

  field.vertices.forEach((vertex, index) => {
    const normalized = clamp(vertex.normalized || 0, 0, 1);
    const color = getHeatmapRampColor(Math.pow(normalized, options.colorPower));
    const height = Math.pow(normalized, 0.85) * options.heightMultiplier;
    const y = vertex.y + options.yOffset + height;

    positions[index * 3] = vertex.x - center.x;
    positions[index * 3 + 1] = y - center.y;
    positions[index * 3 + 2] = vertex.z - center.z;
    colors[index * 3] = color.r / 255;
    colors[index * 3 + 1] = color.g / 255;
    colors[index * 3 + 2] = color.b / 255;
    alphas[index] = normalized <= 0.01 ? 0 : Math.pow(normalized, options.alphaPower);
  });

  const indices = [];
  const stride = field.columns + 1;
  for (let row = 0; row < field.rows; row += 1) {
    for (let column = 0; column < field.columns; column += 1) {
      const a = row * stride + column;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
  geometry.setIndex(indices);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: options.opacity },
    },
    vertexShader: `
      attribute float alpha;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vAlpha = alpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uOpacity;

      void main() {
        float alpha = smoothstep(0.0, 1.0, vAlpha) * uOpacity;
        if (alpha <= 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name;
  mesh.renderOrder = options.renderOrder;
  return mesh;
}

function getDensityBins(entries, binSize) {
  const binsByKey = new Map();
  for (const entry of entries) {
    const weight = Math.max(1, entry.count || 1);
    const ix = Math.floor(entry.x / binSize);
    const iy = Math.floor(entry.y / binSize);
    const iz = Math.floor(entry.z / binSize);
    const key = `${ix}:${iy}:${iz}`;
    const bin = binsByKey.get(key);

    if (bin) {
      bin.count += weight;
    } else {
      binsByKey.set(key, {
        x: (ix + 0.5) * binSize,
        y: (iy + 0.5) * binSize,
        z: (iz + 0.5) * binSize,
        count: weight,
      });
    }
  }

  return [...binsByKey.values()];
}

function getHeatmapRampColor(value) {
  const stops = [
    { at: 0, color: { r: 26, g: 112, b: 255 } },
    { at: 0.28, color: { r: 20, g: 196, b: 128 } },
    { at: 0.52, color: { r: 255, g: 229, b: 76 } },
    { at: 0.76, color: { r: 255, g: 122, b: 36 } },
    { at: 1, color: { r: 235, g: 35, b: 35 } },
  ];

  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const next = stops[index];
    if (value <= next.at) {
      const alpha = (value - previous.at) / Math.max(next.at - previous.at, 0.0001);
      return {
        r: Math.round(lerp(previous.color.r, next.color.r, alpha)),
        g: Math.round(lerp(previous.color.g, next.color.g, alpha)),
        b: Math.round(lerp(previous.color.b, next.color.b, alpha)),
      };
    }
  }

  return stops[stops.length - 1].color;
}

function getTrafficRampColor(value) {
  return getHeatmapRampColor(clamp(value, 0, 1));
}

function getSignalAreaColor(value, mode) {
  const intensity = clamp(value, 0, 1);
  if (mode === "movement") {
    return {
      r: Math.round(lerp(96, 34, intensity)),
      g: Math.round(lerp(165, 211, intensity)),
      b: Math.round(lerp(250, 238, intensity)),
    };
  }

  if (mode === "deaths") {
    return {
      r: Math.round(lerp(248, 239, intensity)),
      g: Math.round(lerp(113, 68, intensity)),
      b: Math.round(lerp(113, 68, intensity)),
    };
  }

  return {
    r: Math.round(lerp(251, 245, intensity)),
    g: Math.round(lerp(191, 128, intensity)),
    b: Math.round(lerp(36, 11, intensity)),
  };
}

function getSampleColor(intensity, entry = {}) {
  if (activeHeatmapMode === "chat") {
    if (entry.id && entry.id === selectedChatLogId) {
      return new THREE.Color(0xf59e0b);
    }

    return new THREE.Color(0x58a6ff);
  }

  if (activeHeatmapMode === "deaths") {
    return new THREE.Color().setHSL(0.02 + (1 - intensity) * 0.06, 0.98, 0.5);
  }

  if (activeHeatmapMode === "leaves") {
    return new THREE.Color().setHSL(0.78 - intensity * 0.08, 0.9, 0.58);
  }

  return new THREE.Color().setHSL(0.62 - intensity * 0.62, 0.95, 0.52);
}

function disposeObject3D(object) {
  object.traverse((child) => {
    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      material?.map?.dispose?.();
      material?.dispose?.();
    }
  });
}

function renderSelectedChatMarker(entries, center) {
  if (activeHeatmapMode !== "chat" || !selectedChatLogId) return;

  const entry = entries.find((item) => item.id === selectedChatLogId);
  if (!entry) return;

  const geometry = new THREE.SphereGeometry(5.5, 16, 10);
  const material = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.95,
  });

  selectedMarker = new THREE.Mesh(geometry, material);
  selectedMarker.position.set(entry.x - center.x, entry.y - center.y, entry.z - center.z);
  scene.add(selectedMarker);
}

function renderFocusedSignalArea(center) {
  if (!focusedSignalArea || activeHeatmapMode === "ai-analysis") return;

  const x = Number(focusedSignalArea.x);
  const y = Number(focusedSignalArea.y);
  const z = Number(focusedSignalArea.z);
  if (![x, y, z].every(Number.isFinite)) return;

  const geometry = new THREE.SphereGeometry(8, 24, 16);
  const material = new THREE.MeshBasicMaterial({
    color: getFocusedSignalColor(activeHeatmapMode),
    transparent: true,
    opacity: 0.96,
  });

  selectedMarker = new THREE.Mesh(geometry, material);
  selectedMarker.position.set(x - center.x, y - center.y + 7, z - center.z);
  scene.add(selectedMarker);
}

function getFocusedSignalColor(mode) {
  if (mode === "movement") return 0x22d3ee;
  if (mode === "deaths") return 0xef4444;
  return 0xf59e0b;
}

function renderMapSnapshot(snapshot, center, entries = []) {
  mapGroup = new THREE.Group();
  mapGroup.name = "UploadedMapSnapshot";

  const parts = snapshot.parts.slice(0, 8000);

  for (let index = 0; index < parts.length; index += 1) {
    const mesh = createMapMesh(parts[index], center);
    if (mesh) mapGroup.add(mesh);
  }

  if (activeRenderMode === "heatmap" && activeHeatmapMode !== "ai-analysis") {
    const heatSpots = createLocalizedHeatSpots(entries, center, snapshot);
    if (heatSpots) mapGroup.add(heatSpots);
  }

  scene.add(mapGroup);
}

function createMapMesh(part, center) {
  const size = part.size || [];
  const cframe = part.cframe || [];
  if (size.length < 3 || cframe.length < 12) return null;

  const shape = String(part.shape || part.className || "");
  const geometry = getMapGeometry(shape);
  const color = Array.isArray(part.color) ? part.color : [110, 122, 140];
  const baseColor = new THREE.Color(
    clamp((Number(color[0]) || 0) / 255, 0, 1),
    clamp((Number(color[1]) || 0) / 255, 0, 1),
    clamp((Number(color[2]) || 0) / 255, 0, 1),
  );
  const material = new THREE.MeshStandardMaterial({
    color: baseColor,
    transparent: true,
    opacity: clamp(0.22 - (Number(part.transparency) || 0) * 0.12, 0.08, 0.24),
    roughness: 0.85,
    metalness: 0,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = false;

  const sx = Math.max(Number(size[0]) || 1, 0.05);
  const sy = Math.max(Number(size[1]) || 1, 0.05);
  const sz = Math.max(Number(size[2]) || 1, 0.05);
  const px = (Number(cframe[0]) || 0) - center.x;
  const py = (Number(cframe[1]) || 0) - center.y;
  const pz = (Number(cframe[2]) || 0) - center.z;

  mesh.matrix.set(
    (Number(cframe[3]) || 1) * sx, (Number(cframe[4]) || 0) * sy, (Number(cframe[5]) || 0) * sz, px,
    (Number(cframe[6]) || 0) * sx, (Number(cframe[7]) || 1) * sy, (Number(cframe[8]) || 0) * sz, py,
    (Number(cframe[9]) || 0) * sx, (Number(cframe[10]) || 0) * sy, (Number(cframe[11]) || 1) * sz, pz,
    0, 0, 0, 1,
  );

  return mesh;
}

function createLocalizedHeatSpots(entries, center, snapshot) {
  const sourceEntries = entries.filter((entry) => (
    Number.isFinite(Number(entry.x))
    && Number.isFinite(Number(entry.y))
    && Number.isFinite(Number(entry.z))
  ));
  if (!sourceEntries.length) return null;

  const bounds = snapshot?.bounds;
  const span = Math.max(Number(bounds?.width) || 0, Number(bounds?.depth) || 0, 1);
  const binSize = clamp(span / 56, 8, 24);
  const bins = getDensityBins(sourceEntries, binSize)
    .sort((a, b) => b.count - a.count)
    .slice(0, 220);
  if (!bins.length) return null;

  const maxCount = bins.reduce((max, bin) => Math.max(max, bin.count), 1);
  const group = new THREE.Group();
  group.name = "LocalizedHeatSpots";
  const texture = getLocalizedHeatTexture();

  for (const bin of bins) {
    const heat = clamp(bin.count / maxCount, 0, 1);
    if (heat <= 0.025) continue;

    const color = getHeatmapThreeColor(Math.pow(heat, 0.55));
    const radius = clamp(binSize * (0.9 + Math.pow(heat, 0.55) * 1.25), 7, 34);
    const material = new THREE.MeshBasicMaterial({
      color,
      map: texture,
      transparent: true,
      opacity: clamp(0.08 + heat * 0.16, 0.08, 0.24),
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const spot = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), material);
    spot.position.set(bin.x - center.x, bin.y - center.y + 1.1, bin.z - center.z);
    spot.rotation.x = -Math.PI / 2;
    spot.renderOrder = 3;
    group.add(spot);

    if (heat > 0.62) {
      const coreMaterial = material.clone();
      coreMaterial.opacity = clamp(0.08 + heat * 0.1, 0.08, 0.18);
      const core = new THREE.Mesh(new THREE.PlaneGeometry(radius * 0.86, radius * 0.86), coreMaterial);
      core.position.copy(spot.position);
      core.position.y += 0.05;
      core.rotation.x = -Math.PI / 2;
      core.renderOrder = 4;
      group.add(core);
    }
  }

  return group.children.length ? group : null;
}

function getHeatmapThreeColor(value) {
  const color = getHeatmapRampColor(clamp(value, 0, 1));
  return new THREE.Color(color.r / 255, color.g / 255, color.b / 255);
}

function getLocalizedHeatTexture() {
  if (getLocalizedHeatTexture.texture) return getLocalizedHeatTexture.texture;

  const size = 96;
  const heatCanvas = document.createElement("canvas");
  heatCanvas.width = size;
  heatCanvas.height = size;
  const context = heatCanvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.92)");
  gradient.addColorStop(0.42, "rgba(255,255,255,0.46)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.13)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(heatCanvas);
  texture.needsUpdate = true;
  getLocalizedHeatTexture.texture = texture;
  return texture;
}

function getMapGeometry(shape) {
  if (shape === "Ball") {
    return new THREE.SphereGeometry(0.5, 12, 8);
  }

  if (shape === "Cylinder") {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  }

  return new THREE.BoxGeometry(1, 1, 1);
}

function getCenter(entries) {
  const total = entries.reduce((sum, entry) => ({
    x: sum.x + entry.x,
    y: sum.y + entry.y,
    z: sum.z + entry.z,
  }), { x: 0, y: 0, z: 0 });

  return {
    x: total.x / entries.length,
    y: total.y / entries.length,
    z: total.z / entries.length,
  };
}

function getBounds(entries) {
  const bounds = entries.reduce((box, entry) => ({
    minX: Math.min(box.minX, entry.x),
    maxX: Math.max(box.maxX, entry.x),
    minY: Math.min(box.minY, entry.y),
    maxY: Math.max(box.maxY, entry.y),
    minZ: Math.min(box.minZ, entry.z),
    maxZ: Math.max(box.maxZ, entry.z),
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  });

  return {
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    depth: bounds.maxZ - bounds.minZ,
  };
}

function getEntryExtents(entries) {
  const bounds = entries.reduce((box, entry) => ({
    minX: Math.min(box.minX, entry.x),
    maxX: Math.max(box.maxX, entry.x),
    minY: Math.min(box.minY, entry.y),
    maxY: Math.max(box.maxY, entry.y),
    minZ: Math.min(box.minZ, entry.z),
    maxZ: Math.max(box.maxZ, entry.z),
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  });

  return {
    ...bounds,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    depth: bounds.maxZ - bounds.minZ,
  };
}

function resizeScene() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
  updateCamera();
}

function centerView() {
  if (latestBounds) {
    renderScene(latestSamples, latestMapSnapshot, { resetView: true });
    return;
  }

  fitViewToBounds();
  viewInitialized = Boolean(latestBounds);
}

function isClickPointerUp(event) {
  if (activeHeatmapMode !== "chat" || !pointerDownPosition || pointerDownPosition.button !== 0) return false;

  const dx = event.clientX - pointerDownPosition.x;
  const dy = event.clientY - pointerDownPosition.y;
  return Math.hypot(dx, dy) <= 5;
}

function selectChatPointFromPointer(event) {
  if (!points || !latestEntries.length) return;

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);

  raycaster.params.Points.threshold = Math.max(8, distance * 0.018);
  raycaster.setFromCamera(pointer, camera);

  const hit = raycaster.intersectObject(points, false)[0];
  const entry = hit ? latestEntries[hit.index] : null;
  if (!entry?.id) return;

  selectChatLogOnMap(entry.id, { notifyList: true });
}

function selectChatLogOnMap(id, options = {}) {
  selectedChatLogId = id;

  if (activeHeatmapMode === "chat") {
    renderScene(latestSamples, latestMapSnapshot);
  }

  if (options.notifyList && id) {
    window.dispatchEvent(new CustomEvent("dashboard:chatPointSelected", {
      detail: { id },
    }));
  }
}

function fitViewToBounds() {
  if (!latestBounds) return;
  distance = clamp(Math.max(latestBounds.width, latestBounds.height, latestBounds.depth) * 1.8, 160, 3000);
  panTarget.set(0, 0, 0);
  updateCamera();
}

function panView(dx, dy) {
  const panSpeed = distance * 0.0018;
  movePanTarget(getCameraRight(), -dx * panSpeed);
  movePanTarget(getCameraUp(), dy * panSpeed);
  updateCamera();
}

function updateKeyboardMovement(deltaSeconds) {
  if (!movementKeys.size || !shouldUseKeyboardControls()) return;

  const panSpeed = distance * 1.15 * deltaSeconds;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() <= 0.0001) {
    forward.set(Math.cos(yaw), 0, Math.sin(yaw));
  }
  forward.normalize();

  const right = getCameraRight();
  right.y = 0;
  if (right.lengthSq() <= 0.0001) {
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
  }
  right.normalize();

  if (movementKeys.has("KeyW")) movePanTarget(forward, panSpeed);
  if (movementKeys.has("KeyS")) movePanTarget(forward, -panSpeed);
  if (movementKeys.has("KeyD")) movePanTarget(right, panSpeed);
  if (movementKeys.has("KeyA")) movePanTarget(right, -panSpeed);
  updateCamera();
}

function movePanTarget(direction, amount) {
  panTarget.addScaledVector(direction, amount);
}

function getCameraRight() {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  return new THREE.Vector3().crossVectors(forward, camera.up).normalize();
}

function getCameraUp() {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const right = getCameraRight();
  return new THREE.Vector3().crossVectors(right, forward).normalize();
}

function isMovementKey(code) {
  return code === "KeyW" || code === "KeyA" || code === "KeyS" || code === "KeyD";
}

function shouldUseKeyboardControls() {
  const active = document.activeElement;
  const isTyping = active && (
    active.tagName === "INPUT"
    || active.tagName === "TEXTAREA"
    || active.tagName === "SELECT"
    || active.isContentEditable
  );

  return !isTyping && (canvasHovered || active === canvas);
}

function updateCamera() {
  const x = Math.cos(yaw) * Math.cos(pitch) * distance;
  const y = Math.sin(pitch) * distance;
  const z = Math.sin(yaw) * Math.cos(pitch) * distance;
  const target = panTarget || new THREE.Vector3();
  camera.position.set(target.x + x, target.y + y, target.z + z);
  camera.lookAt(target);
}

function animate(timestamp = 0) {
  animationFrame = window.requestAnimationFrame(animate);
  const deltaSeconds = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1000, 0.05) : 0;
  lastFrameTime = timestamp;
  updateKeyboardMovement(deltaSeconds);
  positionAiAreaCard();
  renderer.render(scene, camera);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, alpha) {
  return start + (end - start) * clamp(alpha, 0, 1);
}

window.addEventListener("beforeunload", () => {
  if (animationFrame) window.cancelAnimationFrame(animationFrame);
});

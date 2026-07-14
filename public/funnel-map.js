const canvas = document.querySelector("#funnelMapCanvas");
const shell = document.querySelector("#funnelMapShell");
const loadingState = document.querySelector("#funnelMapLoading");
const emptyState = document.querySelector("#funnelMapEmpty");
const summary = document.querySelector("#funnelMapSummary");
const legendLabel = document.querySelector("#funnelMapLegendLabel");
const tooltip = document.querySelector("#funnelMapTooltip");
const note = document.querySelector("#funnelMapNote");

const DATA_CACHE_FRESH_MS = 20 * 1000;
const DATA_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const MAP_CACHE_FRESH_MS = 5 * 60 * 1000;
const MAP_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_DATA_CACHE_ENTRIES = 32;
const MAX_MAP_CACHE_ENTRIES = 8;
const MAX_RENDERED_MAP_PARTS = 2600;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 6;

const dataCache = new Map();
const mapCache = new Map();
const mapRequests = new Map();

let context;
let activeSelectionKey = "";
let activePayload = null;
let activeSnapshot = null;
let preparedParts = [];
let requestSequence = 0;
let requestController = null;
let width = 0;
let height = 0;
let pixelRatio = 1;
let worldBounds = null;
let viewCenter = { x: 0, z: 0 };
let baseScale = 1;
let zoom = 1;
let panX = 0;
let panY = 0;
let dragging = false;
let dragStart = null;
let hoveredMarker = null;
let screenMarkers = [];
let renderedUniverseId = "";

if (canvas && shell) {
  context = canvas.getContext("2d", { alpha: false });
  window.addEventListener("dashboard:funnelMapSelection", (event) => loadSelection(event.detail || {}));
  window.addEventListener("dashboard:funnelMapCenter", resetView);
  window.addEventListener("dashboard:funnelMapClear", clearActiveMap);
  window.addEventListener("dashboard:viewChanged", (event) => {
    if (event.detail?.view !== "funnels") {
      abortActiveRequest();
      hideTooltip();
      return;
    }
    resizeCanvas();
    draw();
  });
  window.addEventListener("dashboard:authChanged", (event) => {
    if (event.detail?.authenticated) return;
    clearActiveMap();
    dataCache.clear();
    mapCache.clear();
    mapRequests.clear();
  });
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  new ResizeObserver(resizeCanvas).observe(shell);
  resizeCanvas();
}

async function loadSelection(detail) {
  const selection = normalizeSelection(detail);
  if (!selection || document.body.dataset.activeView !== "funnels") return;

  const dataUrl = buildDataUrl(selection);
  const cacheScope = String(window.getDashboardCacheScope?.() || "");
  const selectionKey = `${cacheScope}:${dataUrl}`;
  activeSelectionKey = selectionKey;
  const sequence = ++requestSequence;
  abortActiveRequest(false);
  hideTooltip();

  const cached = !selection.force ? getUsableCacheEntry(dataCache, selectionKey, DATA_CACHE_MAX_AGE_MS) : null;
  const mapPromise = getMapSnapshot(selection.universeId, cacheScope);
  if (cached) {
    const mapPayload = await mapPromise;
    if (!isCurrentRequest(sequence, selectionKey)) return;
    applyMapPayload(cached.payload, mapPayload?.snapshot || null, selectionKey);
    if (Date.now() - cached.storedAt <= DATA_CACHE_FRESH_MS) return;
    refreshDataInBackground(selection, dataUrl, selectionKey, sequence, mapPayload?.snapshot || null);
    return;
  }

  setLoading(true);
  try {
    const controller = new AbortController();
    requestController = controller;
    const [payload, mapPayload] = await Promise.all([
      fetchJson(dataUrl, controller.signal),
      mapPromise,
    ]);
    if (!isCurrentRequest(sequence, selectionKey) || controller.signal.aborted) return;
    setBoundedCache(dataCache, selectionKey, { storedAt: Date.now(), payload }, MAX_DATA_CACHE_ENTRIES);
    applyMapPayload(payload, mapPayload?.snapshot || null, selectionKey);
  } catch (error) {
    if (error.name !== "AbortError" && isCurrentRequest(sequence, selectionKey)) showError(error.message);
  } finally {
    if (requestController?.signal?.aborted || isCurrentRequest(sequence, selectionKey)) requestController = null;
  }
}

async function refreshDataInBackground(selection, dataUrl, selectionKey, sequence, snapshot) {
  try {
    const controller = new AbortController();
    requestController = controller;
    const payload = await fetchJson(dataUrl, controller.signal);
    if (!isCurrentRequest(sequence, selectionKey) || controller.signal.aborted) return;
    setBoundedCache(dataCache, selectionKey, { storedAt: Date.now(), payload }, MAX_DATA_CACHE_ENTRIES);
    applyMapPayload(payload, snapshot, selectionKey, { preserveView: true });
  } catch (error) {
    if (error.name !== "AbortError") console.warn("Could not refresh funnel map data.", error);
  } finally {
    if (isCurrentRequest(sequence, selectionKey)) requestController = null;
  }
}

function normalizeSelection(detail) {
  const universeId = String(detail?.universeId || "").trim();
  const funnelId = String(detail?.funnelId || "").trim();
  const step = Math.max(1, Math.floor(Number(detail?.step) || 1));
  if (!/^\d+$/.test(universeId) || !funnelId) return null;
  return {
    universeId,
    funnelId,
    step,
    mode: detail?.mode === "dropped" ? "dropped" : "reached",
    from: Number(detail?.from) || 0,
    to: Number(detail?.to) || 0,
    force: Boolean(detail?.force),
  };
}

function buildDataUrl(selection) {
  const params = new URLSearchParams({
    universeId: selection.universeId,
    funnelId: selection.funnelId,
    step: String(selection.step),
    mode: selection.mode,
  });
  if (selection.from > 0) params.set("from", String(selection.from));
  if (selection.to > 0) params.set("to", String(selection.to));
  return `/api/funnel-map?${params.toString()}`;
}

async function getMapSnapshot(universeId, cacheScope) {
  const mapKey = `${cacheScope}:${universeId}:${MAX_RENDERED_MAP_PARTS}`;
  const cached = getUsableCacheEntry(mapCache, mapKey, MAP_CACHE_MAX_AGE_MS);
  if (cached) {
    if (Date.now() - cached.storedAt > MAP_CACHE_FRESH_MS) fetchMapSnapshot(universeId, mapKey);
    return cached.payload;
  }
  return fetchMapSnapshot(universeId, mapKey);
}

function fetchMapSnapshot(universeId, mapKey) {
  if (mapRequests.has(mapKey)) return mapRequests.get(mapKey);
  const request = fetchJson(`/api/map-snapshot?universeId=${encodeURIComponent(universeId)}&maxParts=${MAX_RENDERED_MAP_PARTS}`)
    .then((payload) => {
      setBoundedCache(mapCache, mapKey, { storedAt: Date.now(), payload }, MAX_MAP_CACHE_ENTRIES);
      return payload;
    })
    .catch((error) => {
      console.warn("Could not load the funnel map snapshot.", error);
      return { snapshot: null, mapError: error.message };
    })
    .finally(() => mapRequests.delete(mapKey));
  mapRequests.set(mapKey, request);
  return request;
}

function applyMapPayload(payload, snapshot, selectionKey, options = {}) {
  if (selectionKey !== activeSelectionKey) return;
  const universeChanged = renderedUniverseId !== String(payload?.universeId || "");
  activePayload = payload || null;
  activeSnapshot = snapshot || null;
  preparedParts = prepareMapParts(activeSnapshot);
  renderedUniverseId = String(payload?.universeId || "");
  worldBounds = getWorldBounds(activeSnapshot, activePayload?.clusters || []);
  setLoading(false);
  updateCopy();
  resizeCanvas();
  if (universeChanged || !options.preserveView) resetView();
  else draw();
}

function updateCopy() {
  const payload = activePayload || {};
  const mapped = Math.max(Number(payload.mappedSessions) || 0, 0);
  const qualifying = Math.max(Number(payload.qualifyingSessions) || 0, 0);
  const clusters = Math.max(Number(payload.clusterCount) || 0, 0);
  const label = payload.mode === "dropped" ? "dropped" : "reached";
  if (summary) summary.textContent = `${formatNumber(qualifying)} ${label} · ${formatNumber(mapped)} mapped · ${formatNumber(clusters)} location${clusters === 1 ? "" : "s"}`;
  if (legendLabel) legendLabel.textContent = payload.mode === "dropped" ? "Dropped sessions" : "Reached sessions";
  if (note) {
    note.textContent = payload.mode === "dropped"
      ? "Drop-off mode uses the last mapped custom event after the selected step. Drag to pan and scroll to zoom."
      : "Reached mode uses the mapped location of the selected funnel event. Drag to pan and scroll to zoom.";
  }
  if (shell) shell.dataset.mapMode = payload.mode === "dropped" ? "dropped" : "reached";
  if (emptyState) {
    const title = emptyState.querySelector("strong");
    const detail = emptyState.querySelector("p");
    if (title) title.textContent = "No mapped sessions";
    if (detail) detail.textContent = qualifying
      ? "These sessions did not include a custom event location."
      : `No sessions ${label} this funnel step in the selected range.`;
    emptyState.hidden = mapped > 0;
  }
}

function prepareMapParts(snapshot) {
  return (Array.isArray(snapshot?.parts) ? snapshot.parts : [])
    .slice(0, MAX_RENDERED_MAP_PARTS)
    .filter((part) => {
      const size = part?.size || [];
      const cframe = part?.cframe || [];
      const className = String(part?.className || "").toLowerCase();
      return size.length >= 3 && cframe.length >= 12 && className !== "terrain";
    })
    .sort((left, right) => (Number(left.cframe?.[1]) || 0) - (Number(right.cframe?.[1]) || 0));
}

function getWorldBounds(snapshot, clusters) {
  const bounds = snapshot?.bounds;
  if ([bounds?.minX, bounds?.maxX, bounds?.minZ, bounds?.maxZ].every(Number.isFinite)) {
    return {
      minX: Number(bounds.minX),
      maxX: Number(bounds.maxX),
      minZ: Number(bounds.minZ),
      maxZ: Number(bounds.maxZ),
    };
  }

  const validClusters = (Array.isArray(clusters) ? clusters : []).filter((cluster) => (
    Number.isFinite(Number(cluster?.x)) && Number.isFinite(Number(cluster?.z))
  ));
  if (!validClusters.length) return { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
  const minX = Math.min(...validClusters.map((cluster) => Number(cluster.x)));
  const maxX = Math.max(...validClusters.map((cluster) => Number(cluster.x)));
  const minZ = Math.min(...validClusters.map((cluster) => Number(cluster.z)));
  const maxZ = Math.max(...validClusters.map((cluster) => Number(cluster.z)));
  const padding = Math.max(maxX - minX, maxZ - minZ, 60) * 0.2;
  return { minX: minX - padding, maxX: maxX + padding, minZ: minZ - padding, maxZ: maxZ + padding };
}

function resizeCanvas() {
  if (!canvas || !context || shell?.offsetParent === null) return;
  const rect = canvas.getBoundingClientRect();
  const nextWidth = Math.max(Math.floor(rect.width), 1);
  const nextHeight = Math.max(Math.floor(rect.height), 1);
  const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
  if (nextWidth !== width || nextHeight !== height || nextRatio !== pixelRatio) {
    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextRatio;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    calculateBaseScale();
  }
  draw();
}

function calculateBaseScale() {
  if (!worldBounds || !width || !height) return;
  const spanX = Math.max(worldBounds.maxX - worldBounds.minX, 1);
  const spanZ = Math.max(worldBounds.maxZ - worldBounds.minZ, 1);
  viewCenter = {
    x: (worldBounds.minX + worldBounds.maxX) / 2,
    z: (worldBounds.minZ + worldBounds.maxZ) / 2,
  };
  baseScale = Math.min((width - 72) / spanX, (height - 72) / spanZ);
}

function resetView() {
  zoom = 1;
  panX = 0;
  panY = 0;
  calculateBaseScale();
  hideTooltip();
  draw();
}

function draw() {
  if (!context || !width || !height) return;
  context.save();
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#071329");
  gradient.addColorStop(1, "#040b1a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  drawGrid();
  drawMapParts();
  drawClusters();
  context.restore();
}

function drawGrid() {
  const scale = baseScale * zoom;
  if (!Number.isFinite(scale) || scale <= 0) return;
  const targetWorldSpacing = 42 / scale;
  const power = 10 ** Math.floor(Math.log10(Math.max(targetWorldSpacing, 1)));
  const normalized = targetWorldSpacing / power;
  const spacing = (normalized > 5 ? 10 : normalized > 2 ? 5 : normalized > 1 ? 2 : 1) * power;
  const topLeft = screenToWorld(0, 0);
  const bottomRight = screenToWorld(width, height);
  const minX = Math.floor(Math.min(topLeft.x, bottomRight.x) / spacing) * spacing;
  const maxX = Math.ceil(Math.max(topLeft.x, bottomRight.x) / spacing) * spacing;
  const minZ = Math.floor(Math.min(topLeft.z, bottomRight.z) / spacing) * spacing;
  const maxZ = Math.ceil(Math.max(topLeft.z, bottomRight.z) / spacing) * spacing;
  context.strokeStyle = "rgba(82, 112, 156, 0.13)";
  context.lineWidth = 1;
  context.beginPath();
  for (let x = minX; x <= maxX; x += spacing) {
    const point = worldToScreen(x, 0);
    context.moveTo(point.x, 0);
    context.lineTo(point.x, height);
  }
  for (let z = minZ; z <= maxZ; z += spacing) {
    const point = worldToScreen(0, z);
    context.moveTo(0, point.y);
    context.lineTo(width, point.y);
  }
  context.stroke();
}

function drawMapParts() {
  for (const part of preparedParts) {
    const size = part.size;
    const cframe = part.cframe;
    const sx = Math.max(Number(size[0]) || 1, 0.05);
    const sz = Math.max(Number(size[2]) || 1, 0.05);
    const px = Number(cframe[0]) || 0;
    const pz = Number(cframe[2]) || 0;
    const axisX = { x: Number(cframe[3]) || 1, z: Number(cframe[9]) || 0 };
    const axisZ = { x: Number(cframe[5]) || 0, z: Number(cframe[11]) || 1 };
    const corners = [
      worldToScreen(px - axisX.x * sx / 2 - axisZ.x * sz / 2, pz - axisX.z * sx / 2 - axisZ.z * sz / 2),
      worldToScreen(px + axisX.x * sx / 2 - axisZ.x * sz / 2, pz + axisX.z * sx / 2 - axisZ.z * sz / 2),
      worldToScreen(px + axisX.x * sx / 2 + axisZ.x * sz / 2, pz + axisX.z * sx / 2 + axisZ.z * sz / 2),
      worldToScreen(px - axisX.x * sx / 2 + axisZ.x * sz / 2, pz - axisX.z * sx / 2 + axisZ.z * sz / 2),
    ];
    const minScreenX = Math.min(...corners.map((point) => point.x));
    const maxScreenX = Math.max(...corners.map((point) => point.x));
    const minScreenY = Math.min(...corners.map((point) => point.y));
    const maxScreenY = Math.max(...corners.map((point) => point.y));
    if (maxScreenX < -50 || minScreenX > width + 50 || maxScreenY < -50 || minScreenY > height + 50) continue;
    const color = getPartColor(part.color);
    const transparency = Math.max(0, Math.min(Number(part.transparency) || 0, 1));
    const footprint = sx * sz;
    const mapSpan = Math.max(worldBounds?.maxX - worldBounds?.minX || 1, worldBounds?.maxZ - worldBounds?.minZ || 1);
    const isLargeBase = footprint > mapSpan * mapSpan * 0.18;
    context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${isLargeBase ? 0.12 : Math.max(0.17, 0.42 - transparency * 0.25)})`;
    context.strokeStyle = `rgba(${Math.min(color.r + 28, 255)}, ${Math.min(color.g + 28, 255)}, ${Math.min(color.b + 28, 255)}, ${isLargeBase ? 0.1 : 0.28})`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(corners[0].x, corners[0].y);
    for (let index = 1; index < corners.length; index += 1) context.lineTo(corners[index].x, corners[index].y);
    context.closePath();
    context.fill();
    context.stroke();
  }
}

function drawClusters() {
  const clusters = Array.isArray(activePayload?.clusters) ? activePayload.clusters : [];
  const maxCount = Math.max(...clusters.map((cluster) => Number(cluster.count) || 0), 1);
  const mode = activePayload?.mode === "dropped" ? "dropped" : "reached";
  const color = mode === "dropped" ? { core: "#fb7185", glow: "rgba(251, 113, 133, 0.22)" } : { core: "#2dd4bf", glow: "rgba(45, 212, 191, 0.22)" };
  screenMarkers = [];

  for (const cluster of [...clusters].sort((left, right) => (Number(left.count) || 0) - (Number(right.count) || 0))) {
    const count = Math.max(Number(cluster.count) || 0, 1);
    const point = worldToScreen(Number(cluster.x) || 0, Number(cluster.z) || 0);
    const radius = 6 + Math.sqrt(count / maxCount) * 13;
    if (point.x < -radius * 2 || point.x > width + radius * 2 || point.y < -radius * 2 || point.y > height + radius * 2) continue;
    screenMarkers.push({ ...point, radius, cluster });
    const isHovered = hoveredMarker?.cluster === cluster;
    context.fillStyle = color.glow;
    context.beginPath();
    context.arc(point.x, point.y, radius * (isHovered ? 2.1 : 1.75), 0, Math.PI * 2);
    context.fill();
    context.fillStyle = color.core;
    context.strokeStyle = "rgba(255, 255, 255, 0.92)";
    context.lineWidth = isHovered ? 3 : 2;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    if (radius >= 10) {
      context.fillStyle = "#04101f";
      context.font = "700 11px Inter, system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(formatCompactNumber(count), point.x, point.y + 0.5);
    }
  }
}

function handlePointerDown(event) {
  if (event.button !== 0) return;
  dragging = true;
  dragStart = { x: event.clientX, y: event.clientY, panX, panY };
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add("dragging");
}

function handlePointerMove(event) {
  if (dragging && dragStart) {
    panX = dragStart.panX + event.clientX - dragStart.x;
    panY = dragStart.panY + event.clientY - dragStart.y;
    hideTooltip();
    draw();
    return;
  }
  const point = getCanvasPoint(event);
  const marker = findMarker(point.x, point.y);
  if (marker === hoveredMarker) return;
  hoveredMarker = marker;
  if (marker) showTooltip(marker);
  else hideTooltip();
  draw();
}

function handlePointerUp(event) {
  if (!dragging) return;
  dragging = false;
  dragStart = null;
  canvas.classList.remove("dragging");
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

function handlePointerLeave() {
  if (!dragging) hideTooltip();
}

function handleWheel(event) {
  event.preventDefault();
  const point = getCanvasPoint(event);
  const previousZoom = zoom;
  zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * Math.exp(-event.deltaY * 0.0014)));
  const ratio = zoom / previousZoom;
  panX = point.x - width / 2 - (point.x - width / 2 - panX) * ratio;
  panY = point.y - height / 2 - (point.y - height / 2 - panY) * ratio;
  hideTooltip();
  draw();
}

function findMarker(x, y) {
  let match = null;
  let closest = Infinity;
  for (const marker of screenMarkers) {
    const distance = Math.hypot(x - marker.x, y - marker.y);
    if (distance <= marker.radius * 1.5 && distance < closest) {
      closest = distance;
      match = marker;
    }
  }
  return match;
}

function showTooltip(marker) {
  if (!tooltip) return;
  const count = Math.max(Number(marker.cluster?.count) || 0, 0);
  const label = activePayload?.mode === "dropped" ? "dropped session" : "reached session";
  tooltip.textContent = `${formatNumber(count)} ${label}${count === 1 ? "" : "s"}`;
  tooltip.style.left = `${marker.x}px`;
  tooltip.style.top = `${marker.y}px`;
  tooltip.hidden = false;
}

function hideTooltip() {
  hoveredMarker = null;
  if (tooltip) tooltip.hidden = true;
}

function worldToScreen(x, z) {
  const scale = baseScale * zoom;
  return {
    x: width / 2 + panX + (x - viewCenter.x) * scale,
    y: height / 2 + panY + (z - viewCenter.z) * scale,
  };
}

function screenToWorld(x, y) {
  const scale = Math.max(baseScale * zoom, 0.0001);
  return {
    x: viewCenter.x + (x - width / 2 - panX) / scale,
    z: viewCenter.z + (y - height / 2 - panY) / scale,
  };
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function getPartColor(value) {
  const color = Array.isArray(value) ? value : [88, 107, 139];
  const lift = (channel) => Math.max(28, Math.min(205, Math.round((Number(channel) || 0) * 0.78 + 34)));
  return { r: lift(color[0]), g: lift(color[1]), b: lift(color[2]) };
}

function setLoading(isLoading) {
  if (loadingState) loadingState.hidden = !isLoading;
  if (emptyState && isLoading) emptyState.hidden = true;
}

function showError(message) {
  setLoading(false);
  if (emptyState) {
    emptyState.hidden = false;
    const title = emptyState.querySelector("strong");
    const detail = emptyState.querySelector("p");
    if (title) title.textContent = "Could not load funnel map";
    if (detail) detail.textContent = message || "Try selecting the step again.";
  }
  if (summary) summary.textContent = "Map unavailable";
  draw();
}

function clearActiveMap() {
  abortActiveRequest();
  activeSelectionKey = "";
  activePayload = null;
  activeSnapshot = null;
  preparedParts = [];
  worldBounds = null;
  renderedUniverseId = "";
  setLoading(false);
  hideTooltip();
  draw();
}

function abortActiveRequest(incrementSequence = true) {
  requestController?.abort();
  requestController = null;
  if (incrementSequence) requestSequence += 1;
}

function isCurrentRequest(sequence, selectionKey) {
  return sequence === requestSequence
    && selectionKey === activeSelectionKey
    && document.body.dataset.activeView === "funnels";
}

function getUsableCacheEntry(cache, key, maxAgeMs) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt <= maxAgeMs) return entry;
  cache.delete(key);
  return null;
}

function setBoundedCache(cache, key, value, maxEntries) {
  cache.delete(key);
  cache.set(key, value);
  while (cache.size > maxEntries) cache.delete(cache.keys().next().value);
}

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Math.max(Number(value) || 0, 0));
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(Math.max(Number(value) || 0, 0));
}

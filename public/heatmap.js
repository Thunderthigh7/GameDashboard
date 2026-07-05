import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const canvas = document.querySelector("#movementHeatmapCanvas");
const refreshButton = document.querySelector("#refreshMovementButton");
const centerButton = document.querySelector("#centerMovementButton");
const sampleCount = document.querySelector("#movementSampleCount");
const statusLine = document.querySelector("#movementHeatmapStatus");
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
let activeHeatmapMode = "movement";
let activeRenderMode = "points";
let selectedChatLogId = "";
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
  window.addEventListener("dashboard:chatLogSelected", (event) => {
    const id = event.detail?.id || "";
    if (activeHeatmapMode !== "chat") {
      setHeatmapMode("chat", { selectedChatLogId: id });
      return;
    }

    selectChatLogOnMap(id, { notifyList: false });
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
    if (!dragging || !lastPointer) return;
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
  const query = buildHeatmapQuery(universeId);
  const modeLabel = getModeLabel();

  statusLine.textContent = universeId
    ? `Loading ${modeLabel.toLowerCase()} samples for universe ${universeId}...`
    : `Loading ${modeLabel.toLowerCase()} samples for all visible universes...`;

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
    sampleCount.textContent = `${samplePayload.returnedCount || 0} ${modeLabel.toLowerCase()} sample${samplePayload.returnedCount === 1 ? "" : "s"}`;
    if (samplePayload.returnedCount || mapSnapshot?.partCount) {
      statusLine.textContent = `${getStatusText(samplePayload)}${mapText}${mapErrorText}`;
    } else {
      statusLine.textContent = `No ${modeLabel.toLowerCase()} samples received yet.${mapErrorText}`;
    }
  } catch (error) {
    statusLine.textContent = error.message;
  }
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
  activeHeatmapMode = ["deaths", "leaves", "chat"].includes(mode) ? mode : "movement";
  if (options.selectedChatLogId) {
    selectedChatLogId = options.selectedChatLogId;
  }

  for (const button of modeButtons) {
    button.classList.toggle("active", button.dataset.heatmapMode === activeHeatmapMode);
  }
  loadHeatmap();
}

function setRenderMode(mode) {
  activeRenderMode = mode === "heatmap" ? "heatmap" : "points";
  for (const button of renderButtons) {
    button.classList.toggle("active", button.dataset.heatmapRender === activeRenderMode);
  }

  if (latestSamples.length || latestMapSnapshot) {
    renderScene(latestSamples, latestMapSnapshot);
  }
}

function getHeatmapEndpoint() {
  if (activeHeatmapMode === "deaths") return "/api/death-heatmap";
  if (activeHeatmapMode === "leaves") return "/api/leave-heatmap";
  if (activeHeatmapMode === "chat") return "/api/chat-logs";
  return "/api/movement-heatmap";
}

function getModeLabel() {
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
  if (points) {
    scene.remove(points);
    points.geometry.dispose();
    points.material.dispose();
    points = null;
  }

  if (heatmapMesh) {
    scene.remove(heatmapMesh);
    heatmapMesh.geometry.dispose();
    heatmapMesh.material.map?.dispose();
    heatmapMesh.material.dispose();
    heatmapMesh = null;
  }

  if (selectedMarker) {
    scene.remove(selectedMarker);
    selectedMarker.geometry.dispose();
    selectedMarker.material.dispose();
    selectedMarker = null;
  }

  if (mapGroup) {
    scene.remove(mapGroup);
    for (const child of mapGroup.children) {
      child.geometry?.dispose();
      child.material?.dispose();
    }
    mapGroup = null;
  }

  const entries = getSampleEntries(samples);
  latestEntries = entries;
  latestBounds = mapSnapshot?.bounds || (entries.length ? getBounds(entries) : null);
  const dataCenter = mapSnapshot?.bounds?.center || (entries.length ? getCenter(entries) : { x: 0, y: 0, z: 0 });
  latestCenter = dataCenter;
  const shouldResetView = Boolean(options.resetView) || (!viewInitialized && latestBounds);
  if (!sceneCenter || shouldResetView) {
    sceneCenter = dataCenter;
  }

  if (mapSnapshot?.parts?.length) {
    renderMapSnapshot(mapSnapshot, sceneCenter);
  }

  if (entries.length) {
    renderSamples(entries, sceneCenter);
    renderSelectedChatMarker(entries, sceneCenter);
  }

  if (latestBounds) {
    grid.scale.setScalar(clamp(Math.max(latestBounds.width, latestBounds.depth) / 500, 0.5, 8));
  }

  if (shouldResetView) {
    fitViewToBounds();
    viewInitialized = true;
  } else {
    updateCamera();
  }
}

function getSampleEntries(samples) {
  if (activeHeatmapMode === "chat") {
    return getChatSampleEntries(samples);
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

    const key = `${Math.round(x / 8) * 8}:${Math.round(y / 8) * 8}:${Math.round(z / 8) * 8}`;
    const existing = bins.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      bins.set(key, { x, y, z, count: 1 });
    }
  }

  return [...bins.values()];
}

function renderSamples(entries, center) {
  if (!entries.length) return;

  if (activeRenderMode === "heatmap") {
    renderDensityHeatmap(entries, center);
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

function renderDensityHeatmap(entries, center) {
  const extents = getEntryExtents(entries);
  const binSize = getDensityBinSize(extents);
  const bins = getDensityBins(entries, binSize);
  if (!bins.length) return;

  const maxCount = bins.reduce((max, bin) => Math.max(max, bin.count), 1);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    vertexColors: true,
  });

  heatmapMesh = new THREE.InstancedMesh(geometry, material, bins.length);
  heatmapMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  heatmapMesh.renderOrder = 2;

  const transform = new THREE.Object3D();
  for (let index = 0; index < bins.length; index += 1) {
    const bin = bins[index];
    const normalized = bin.count / maxCount;
    const color = getHeatmapRampColor(Math.pow(normalized, 0.48));

    transform.position.set(bin.x - center.x, bin.y - center.y, bin.z - center.z);
    transform.scale.set(
      binSize * 0.92,
      binSize * 0.92,
      binSize * 0.92,
    );
    transform.updateMatrix();

    heatmapMesh.setMatrixAt(index, transform.matrix);
    heatmapMesh.setColorAt(index, new THREE.Color(color.r / 255, color.g / 255, color.b / 255));
  }

  heatmapMesh.instanceMatrix.needsUpdate = true;
  if (heatmapMesh.instanceColor) heatmapMesh.instanceColor.needsUpdate = true;
  scene.add(heatmapMesh);
}

function getDensityBinSize(extents) {
  const span = Math.max(extents.width, extents.height, extents.depth, 1);
  return clamp(span / 70, 4, 32);
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

function renderMapSnapshot(snapshot, center) {
  mapGroup = new THREE.Group();
  mapGroup.name = "UploadedMapSnapshot";

  const parts = snapshot.parts.slice(0, 8000);
  for (const part of parts) {
    const mesh = createMapMesh(part, center);
    if (mesh) mapGroup.add(mesh);
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
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(
      clamp((Number(color[0]) || 0) / 255, 0, 1),
      clamp((Number(color[1]) || 0) / 255, 0, 1),
      clamp((Number(color[2]) || 0) / 255, 0, 1),
    ),
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

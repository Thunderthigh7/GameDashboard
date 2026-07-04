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

let renderer;
let scene;
let camera;
let points;
let mapGroup;
let grid;
let animationFrame;
let yaw = -0.8;
let pitch = 0.72;
let distance = 520;
let dragging = false;
let dragMode = "rotate";
let lastPointer = null;
let sceneCenter = null;
let latestCenter = null;
let latestBounds = null;
let latestSamples = [];
let latestMapSnapshot = null;
let panTarget;
let viewInitialized = false;

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
  window.addEventListener("dashboard:experienceChanged", () => loadHeatmap({ resetView: true }));
  window.addEventListener("resize", resizeScene);
  window.setInterval(loadHeatmap, 15000);
  loadHeatmap({ resetView: true });
}

function initScene() {
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
    dragging = true;
    dragMode = event.shiftKey || event.button === 1 || event.button === 2 ? "pan" : "rotate";
    lastPointer = { x: event.clientX, y: event.clientY };
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

  canvas.addEventListener("pointerup", () => {
    dragging = false;
    lastPointer = null;
  });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    distance = clamp(distance + event.deltaY * 0.35, 120, 1500);
    updateCamera();
  }, { passive: false });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  resizeScene();
  animate();
}

async function loadHeatmap(options = {}) {
  const universeId = window.getSelectedUniverseId?.() || "";
  const query = buildHeatmapQuery(universeId);

  statusLine.textContent = universeId
    ? `Loading movement samples for universe ${universeId}...`
    : "Loading movement samples for all visible universes...";

  try {
    const movementPromise = fetch(`/api/movement-heatmap${query}`, {
      headers: { Accept: "application/json" },
    }).then(readJsonResponse);

    const mapPromise = universeId
      ? fetch(`/api/map-snapshot?universeId=${encodeURIComponent(universeId)}`, {
        headers: { Accept: "application/json" },
      }).then(readJsonResponse).catch((error) => ({ mapError: error.message }))
      : Promise.resolve({ snapshot: null });

    const [payload, mapPayload] = await Promise.all([movementPromise, mapPromise]);
    const mapSnapshot = mapPayload.snapshot || null;
    latestSamples = payload.samples || [];
    latestMapSnapshot = mapSnapshot;
    renderScene(latestSamples, latestMapSnapshot, {
      resetView: Boolean(options.resetView),
    });

    const mapText = mapSnapshot?.partCount ? ` Map: ${mapSnapshot.partCount} parts.` : "";
    const mapErrorText = mapPayload.mapError ? ` Map failed: ${mapPayload.mapError}` : "";
    sampleCount.textContent = `${payload.returnedCount || 0} sample${payload.returnedCount === 1 ? "" : "s"}`;
    if (payload.returnedCount || mapSnapshot?.partCount) {
      statusLine.textContent = `${getStatusText(payload)}${mapText}${mapErrorText}`;
    } else {
      statusLine.textContent = `No movement samples received yet.${mapErrorText}`;
    }
  } catch (error) {
    statusLine.textContent = error.message;
  }
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
  const parts = ["Drag to rotate. Scroll to zoom."];
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

  if (mapGroup) {
    scene.remove(mapGroup);
    for (const child of mapGroup.children) {
      child.geometry?.dispose();
      child.material?.dispose();
    }
    mapGroup = null;
  }

  const entries = getSampleBins(samples);
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

  const maxCount = entries.reduce((max, entry) => Math.max(max, entry.count), 1);
  const positions = new Float32Array(entries.length * 3);
  const colors = new Float32Array(entries.length * 3);
  const sizes = new Float32Array(entries.length);

  entries.forEach((entry, index) => {
    const intensity = entry.count / maxCount;
    const color = new THREE.Color().setHSL(0.62 - intensity * 0.62, 0.95, 0.52);
    positions[index * 3] = entry.x - center.x;
    positions[index * 3 + 1] = entry.y - center.y;
    positions[index * 3 + 2] = entry.z - center.z;
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
    sizes[index] = 3 + intensity * 12;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 8,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
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

function fitViewToBounds() {
  if (!latestBounds) return;
  distance = clamp(Math.max(latestBounds.width, latestBounds.height, latestBounds.depth) * 1.8, 160, 3000);
  panTarget.set(0, 0, 0);
  updateCamera();
}

function panView(dx, dy) {
  const panSpeed = distance * 0.0018;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  panTarget.addScaledVector(right, -dx * panSpeed);
  panTarget.addScaledVector(up, dy * panSpeed);
  updateCamera();
}

function updateCamera() {
  const x = Math.cos(yaw) * Math.cos(pitch) * distance;
  const y = Math.sin(pitch) * distance;
  const z = Math.sin(yaw) * Math.cos(pitch) * distance;
  const target = panTarget || new THREE.Vector3();
  camera.position.set(target.x + x, target.y + y, target.z + z);
  camera.lookAt(target);
}

function animate() {
  animationFrame = window.requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

window.addEventListener("beforeunload", () => {
  if (animationFrame) window.cancelAnimationFrame(animationFrame);
});

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const canvas = document.querySelector("#movementHeatmapCanvas");
const refreshButton = document.querySelector("#refreshMovementButton");
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
let grid;
let animationFrame;
let yaw = -0.8;
let pitch = 0.72;
let distance = 520;
let dragging = false;
let lastPointer = null;

if (canvas) {
  initScene();
  refreshButton?.addEventListener("click", loadHeatmap);
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
  window.addEventListener("dashboard:experienceChanged", loadHeatmap);
  window.addEventListener("resize", resizeScene);
  window.setInterval(loadHeatmap, 15000);
  loadHeatmap();
}

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 1, 5000);

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.65);
  directional.position.set(1, 2, 1);
  scene.add(directional);

  grid = new THREE.GridHelper(500, 20, 0x335179, 0x1d2a3d);
  scene.add(grid);

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !lastPointer) return;
    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    yaw -= dx * 0.006;
    pitch = clamp(pitch + dy * 0.004, 0.18, 1.35);
    lastPointer = { x: event.clientX, y: event.clientY };
    updateCamera();
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

  resizeScene();
  animate();
}

async function loadHeatmap() {
  const universeId = window.getSelectedUniverseId?.() || "";
  const query = buildHeatmapQuery(universeId);

  statusLine.textContent = universeId
    ? `Loading movement samples for universe ${universeId}...`
    : "Loading movement samples for all visible universes...";

  try {
    const response = await fetch(`/api/movement-heatmap${query}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Failed to load movement samples");
    }

    renderSamples(payload.samples || []);
    sampleCount.textContent = `${payload.returnedCount || 0} sample${payload.returnedCount === 1 ? "" : "s"}`;
    statusLine.textContent = payload.returnedCount
      ? getStatusText(payload)
      : "No movement samples received yet.";
  } catch (error) {
    statusLine.textContent = error.message;
  }
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

function renderSamples(samples) {
  if (points) {
    scene.remove(points);
    points.geometry.dispose();
    points.material.dispose();
    points = null;
  }

  if (!samples.length) return;

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

  const entries = [...bins.values()];
  if (!entries.length) return;

  const maxCount = entries.reduce((max, entry) => Math.max(max, entry.count), 1);
  const positions = new Float32Array(entries.length * 3);
  const colors = new Float32Array(entries.length * 3);
  const sizes = new Float32Array(entries.length);

  const center = getCenter(entries);
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

  const bounds = getBounds(entries);
  distance = clamp(Math.max(bounds.width, bounds.height, bounds.depth) * 1.8, 160, 1500);
  grid.scale.setScalar(clamp(Math.max(bounds.width, bounds.depth) / 500, 0.5, 4));
  updateCamera();
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

function updateCamera() {
  const x = Math.cos(yaw) * Math.cos(pitch) * distance;
  const y = Math.sin(pitch) * distance;
  const z = Math.sin(yaw) * Math.cos(pitch) * distance;
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
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

export const DEMO_UNIVERSE_ID = 9_000_000_000_001;
export const DEMO_PLACE_ID = 9_000_000_000_002;
export const DEMO_UNIVERSE_NAME = "RoAnalytics Demo World";
export const DEMO_SEED_VERSION = 1;

const DAY_MS = 24 * 60 * 60 * 1000;
const DEMO_PLAYER_COUNT = 64;

const AREAS = {
  spawn: { name: "Spawn Plaza", x: -120, y: 4, z: -60 },
  village: { name: "Starter Village", x: -58, y: 4, z: -12 },
  shop: { name: "Upgrade Shop", x: -12, y: 4, z: 38 },
  bridge: { name: "Sky Bridge", x: 42, y: 22, z: 12 },
  cavern: { name: "Crystal Cavern", x: 94, y: 4, z: 72 },
  boss: { name: "Boss Arena", x: 126, y: 4, z: -54 },
  portal: { name: "Reward Portal", x: 148, y: 4, z: 94 },
};

const ROUTE = [
  AREAS.spawn,
  AREAS.village,
  AREAS.shop,
  AREAS.bridge,
  AREAS.boss,
  AREAS.cavern,
  AREAS.portal,
];

export function createDemoUniverseFixture(options = {}) {
  const referenceTime = Number(options.referenceTime) || Date.now();
  const random = createSeededRandom(DEMO_SEED_VERSION * 1_000_003);
  const players = createPlayers();
  const movementSamples = createMovementSamples(random, players, referenceTime);
  const movementRollups = createMovementRollups(random, referenceTime);
  const deathSamples = createSignalSamples(random, players, referenceTime, "death", 420);
  const leaveSamples = createSignalSamples(random, players, referenceTime, "leave", 360);
  const chatLogs = createChatLogs(random, players, referenceTime);
  const customEvents = createCustomEvents(random, players, referenceTime);
  const mapParts = createMapParts();
  const aiReport = createDemoAiReport({ referenceTime });

  return {
    universeId: DEMO_UNIVERSE_ID,
    placeId: DEMO_PLACE_ID,
    name: DEMO_UNIVERSE_NAME,
    referenceTime,
    players,
    movementSamples,
    movementRollups,
    deathSamples,
    leaveSamples,
    chatLogs,
    customEvents,
    map: {
      universeId: DEMO_UNIVERSE_ID,
      placeId: DEMO_PLACE_ID,
      uploadId: `demo-map-v${DEMO_SEED_VERSION}`,
      rootName: "RoAnalyticsDemoWorld",
      exportedAt: referenceTime,
      totalParts: mapParts.length,
      parts: mapParts,
    },
    funnels: createDemoFunnels(referenceTime),
    aiReport,
    counts: {
      players: players.length,
      movementSamples: movementSamples.length,
      movementRollups: movementRollups.length,
      weightedMovementSamples: movementRollups.reduce((total, entry) => total + entry.movementCount, 0),
      deathSamples: deathSamples.length,
      leaveSamples: leaveSamples.length,
      chatLogs: chatLogs.length,
      customEvents: customEvents.length,
      mapParts: mapParts.length,
      funnels: 3,
      aiAreas: aiReport.areaAnalysis.areas.length,
      aiQuestions: aiReport.chatInsights.questions.length,
    },
  };
}

export function createDemoAiReport(options = {}) {
  const referenceTime = Number(options.referenceTime) || Date.now();
  const generatedAt = Number(options.generatedAt) || referenceTime - 12 * 60 * 1000;
  const areaDefinitions = [
    {
      area: AREAS.boss,
      title: "Boss danger spike",
      insightType: "danger",
      summary: "Deaths cluster at the arena entrance and rise sharply after players cross the center gate.",
      recommendation: "Add a short attack telegraph and place a checkpoint before the arena entrance.",
      confidence: 0.96,
      movementCount: 14820,
      deathCount: 231,
      leaveCount: 47,
      chatCount: 72,
    },
    {
      area: AREAS.bridge,
      title: "Bridge drop-off",
      insightType: "dropoff",
      summary: "Players slow down on the moving bridge, with a visible concentration of deaths and exits near its midpoint.",
      recommendation: "Increase the safe landing width and preview the bridge timing before the first jump.",
      confidence: 0.92,
      movementCount: 11240,
      deathCount: 104,
      leaveCount: 86,
      chatCount: 98,
    },
    {
      area: AREAS.cavern,
      title: "Cavern confusion",
      insightType: "confusion",
      summary: "Repeated route questions and backtracking suggest the exit from the Crystal Cavern is hard to read.",
      recommendation: "Use stronger lighting and a persistent objective marker toward the reward portal.",
      confidence: 0.89,
      movementCount: 9680,
      deathCount: 48,
      leaveCount: 121,
      chatCount: 214,
    },
    {
      area: AREAS.shop,
      title: "Upgrade traffic hub",
      insightType: "traffic",
      summary: "The shop has strong repeat traffic, but many players leave without completing their first upgrade.",
      recommendation: "Highlight the recommended starter upgrade and show the remaining currency directly on the prompt.",
      confidence: 0.86,
      movementCount: 17340,
      deathCount: 8,
      leaveCount: 64,
      chatCount: 167,
    },
    {
      area: AREAS.spawn,
      title: "Tutorial hesitation",
      insightType: "mixed",
      summary: "New players gather around spawn before moving toward the tutorial path, indicating a slow first decision.",
      recommendation: "Point the camera toward the tutorial gate and shorten the first objective text.",
      confidence: 0.82,
      movementCount: 19200,
      deathCount: 3,
      leaveCount: 42,
      chatCount: 106,
    },
  ];

  const areas = areaDefinitions.map((definition, index) => ({
    id: `area${index + 1}`,
    label: definition.title,
    title: definition.title,
    rank: index + 1,
    x: definition.area.x,
    y: definition.area.y,
    z: definition.area.z,
    score: 1 - index * 0.12,
    sampleCount: definition.movementCount + definition.deathCount + definition.leaveCount + definition.chatCount,
    movementCount: definition.movementCount,
    deathCount: definition.deathCount,
    leaveCount: definition.leaveCount,
    chatCount: definition.chatCount,
    summary: definition.summary,
    insightType: definition.insightType,
    recommendation: definition.recommendation,
    confidence: definition.confidence,
    topMessages: [],
    evidence: {
      chatBeforeLeaveCount: Math.max(2, Math.round(definition.chatCount * 0.12)),
      chatBeforeDeathCount: Math.max(1, Math.round(definition.chatCount * 0.07)),
      notes: definition.summary,
    },
  }));

  return {
    universeId: DEMO_UNIVERSE_ID,
    generatedAt,
    mode: "complete",
    source: "demo",
    chatInsights: {
      universeId: DEMO_UNIVERSE_ID,
      sourceLogCount: 800,
      analyzedCount: 500,
      maxMessagesAnalyzed: 500,
      questionLikeCount: 492,
      generatedAt,
      mode: "ai",
      model: "demo-analysis",
      questions: [
        createQuestion("How do I reach the Crystal Cavern?", 126, 54, "how do i get to the crystal cave?"),
        createQuestion("Where is the upgrade shop?", 103, 46, "where do i buy my first upgrade?"),
        createQuestion("How do I beat the arena boss?", 88, 39, "how do i dodge the boss slam?"),
        createQuestion("Why does the Sky Bridge disappear?", 74, 35, "why did the bridge disappear under me?"),
        createQuestion("Where do I claim the final reward?", 61, 31, "where is the reward after the boss?"),
      ],
    },
    areaAnalysis: {
      universeId: DEMO_UNIVERSE_ID,
      generatedAt,
      mode: "ai",
      model: "demo-analysis",
      radius: 44,
      eventCount: 71240,
      areaCount: areas.length,
      filters: { from: null, to: null, target: null },
      areas,
    },
    errors: [],
  };
}

export function getDemoAiReportSummary(report) {
  return {
    generatedAt: report.generatedAt,
    mode: report.mode,
    source: "demo",
    reportKey: "demo://latest",
    chatQuestionCount: report.chatInsights.questions.length,
    areaCount: report.areaAnalysis.areas.length,
    errorCount: 0,
  };
}

function createQuestion(title, mentions, playerCount, message) {
  return {
    title,
    mentions,
    playerCount,
    examples: [{ id: `demo-question-${mentions}`, message, username: "DemoPlayer" }],
  };
}

function createPlayers() {
  return Array.from({ length: DEMO_PLAYER_COUNT }, (_, index) => ({
    userId: 7_100_000 + index,
    username: `DemoPlayer${String(index + 1).padStart(2, "0")}`,
    displayName: ["Sky", "Nova", "Pixel", "Rex", "Luna", "Echo", "Bolt", "Milo"][index % 8] + String(index + 1),
  }));
}

function createMovementSamples(random, players, referenceTime) {
  const samples = [];
  for (let index = 0; index < 6000; index += 1) {
    const player = players[index % players.length];
    const segmentIndex = index % (ROUTE.length - 1);
    const start = ROUTE[segmentIndex];
    const finish = ROUTE[segmentIndex + 1];
    const alpha = random();
    const timestamp = historicalTime(random, referenceTime, index);
    samples.push({
      id: `demo-movement-${index}`,
      userId: player.userId,
      username: player.username,
      displayName: player.displayName,
      x: round(lerp(start.x, finish.x, alpha) + jitter(random, 12)),
      y: round(lerp(start.y, finish.y, alpha) + jitter(random, 1.2)),
      z: round(lerp(start.z, finish.z, alpha) + jitter(random, 12)),
      sampledAt: timestamp,
    });
  }
  return samples;
}

function createMovementRollups(random, referenceTime) {
  const weightedAreas = [
    AREAS.spawn, AREAS.spawn, AREAS.village, AREAS.shop, AREAS.shop,
    AREAS.bridge, AREAS.cavern, AREAS.boss, AREAS.boss, AREAS.portal,
  ];
  return Array.from({ length: 1200 }, (_, index) => {
    const area = weightedAreas[index % weightedAreas.length];
    const sampledAt = historicalTime(random, referenceTime, index * 3);
    const x = round(area.x + jitter(random, area === AREAS.bridge ? 16 : 24));
    const z = round(area.z + jitter(random, area === AREAS.bridge ? 7 : 24));
    const movementCount = 18 + Math.floor(random() * 92);
    return {
      id: `demo-rollup-${index}`,
      bucketStart: sampledAt - 60_000,
      bucketSizeSeconds: 60,
      gridSize: 12,
      gridX: Math.round(x / 12),
      gridZ: Math.round(z / 12),
      x,
      y: round(area.y + jitter(random, 0.8)),
      z,
      movementCount,
      uniquePlayerCount: 2 + Math.floor(random() * 18),
      sampledAt,
    };
  });
}

function createSignalSamples(random, players, referenceTime, type, count) {
  const areas = type === "death"
    ? [AREAS.boss, AREAS.boss, AREAS.boss, AREAS.bridge, AREAS.bridge, AREAS.cavern, AREAS.village]
    : [AREAS.cavern, AREAS.cavern, AREAS.bridge, AREAS.shop, AREAS.spawn, AREAS.boss];
  return Array.from({ length: count }, (_, index) => {
    const player = players[(index * 7) % players.length];
    const area = areas[index % areas.length];
    const timestamp = historicalTime(random, referenceTime, index * 5);
    return {
      id: `demo-${type}-${index}`,
      userId: player.userId,
      username: player.username,
      displayName: player.displayName,
      x: round(area.x + jitter(random, type === "death" ? 18 : 26)),
      y: round(area.y + jitter(random, 1)),
      z: round(area.z + jitter(random, type === "death" ? 18 : 26)),
      ...(type === "death" ? { diedAt: timestamp } : { leftAt: timestamp }),
      sampledAt: timestamp,
    };
  });
}

function createChatLogs(random, players, referenceTime) {
  const messages = [
    [AREAS.cavern, "how do i get to the crystal cave?"],
    [AREAS.cavern, "where is the cavern exit"],
    [AREAS.shop, "where do i buy my first upgrade?"],
    [AREAS.shop, "how much is the speed upgrade"],
    [AREAS.boss, "how do i dodge the boss slam?"],
    [AREAS.boss, "does the boss have a second phase"],
    [AREAS.bridge, "why did the bridge disappear under me?"],
    [AREAS.bridge, "is the bridge timer random"],
    [AREAS.portal, "where is the reward after the boss?"],
    [AREAS.spawn, "where do i start the tutorial"],
    [AREAS.village, "this map looks awesome"],
    [AREAS.portal, "gg that was fun"],
  ];
  return Array.from({ length: 800 }, (_, index) => {
    const player = players[(index * 11) % players.length];
    const [area, message] = messages[index % messages.length];
    return {
      id: `demo-chat-${index}`,
      userId: player.userId,
      username: player.username,
      displayName: player.displayName,
      message,
      x: round(area.x + jitter(random, 14)),
      y: area.y,
      z: round(area.z + jitter(random, 14)),
      sentAt: historicalTime(random, referenceTime, index * 2),
    };
  });
}

function createCustomEvents(random, players, referenceTime) {
  const events = [];
  const add = (session, eventName, offsetMinutes, area, properties = {}) => {
    events.push({
      id: `demo-event-${session.index}-${events.length}`,
      eventName,
      userId: session.player.userId,
      username: session.player.username,
      displayName: session.player.displayName,
      sessionId: session.id,
      x: area.x + jitter(random, 9),
      y: area.y,
      z: area.z + jitter(random, 9),
      occurredAt: session.startedAt + offsetMinutes * 60_000,
      properties: {
        device: session.device,
        cohort: session.cohort,
        region: session.region,
        ...properties,
      },
    });
  };

  for (let index = 0; index < 760; index += 1) {
    const player = players[index % players.length];
    const session = {
      index,
      id: `demo-session-${index}`,
      player,
      startedAt: referenceTime - Math.floor(random() * 30 * DAY_MS) - Math.floor(random() * 2 * 60 * 60 * 1000),
      device: ["Desktop", "Mobile", "Tablet", "Console"][index % 4],
      cohort: ["New", "Returning", "Power user"][index % 3],
      region: ["NA", "EU", "APAC", "LATAM"][index % 4],
    };
    add(session, "session_started", 0, AREAS.spawn, { serverPopulation: 12 + (index % 38) });
    add(session, "tutorial_started", 1, AREAS.spawn, { tutorialVersion: "v3" });

    const tutorialCompleted = random() < 0.84;
    if (tutorialCompleted) add(session, "tutorial_completed", 4, AREAS.village, { durationSeconds: 90 + Math.floor(random() * 220) });
    if (random() < 0.92) add(session, "zone_entered", 7, AREAS.village, { zone: "Starter Village", level: 1 + (index % 12) });
    if (tutorialCompleted && random() < 0.72) add(session, "first_upgrade", 10, AREAS.shop, { item: ["Speed", "Health", "Power"][index % 3], currencySpent: 100 + (index % 5) * 25 });
    if (random() < 0.76) add(session, "checkpoint_reached", 14, AREAS.bridge, { checkpoint: "Sky Bridge", attempt: 1 + (index % 4) });
    if (random() < 0.58) add(session, "boss_entered", 19, AREAS.boss, { boss: "Crystal Titan", difficulty: ["Normal", "Hard"][index % 2] });
    const defeatedBoss = random() < 0.37;
    if (defeatedBoss) add(session, "boss_defeated", 26, AREAS.boss, { boss: "Crystal Titan", durationSeconds: 150 + Math.floor(random() * 310), partySize: 1 + (index % 4) });
    if (defeatedBoss && random() < 0.9) add(session, "reward_claimed", 28, AREAS.portal, { reward: ["Crystal Blade", "Titan Aura", "500 Coins"][index % 3] });
    if (random() < 0.42) add(session, "purchase_prompt", 11, AREAS.shop, { product: ["Starter Pack", "Double Coins", "Revive"][index % 3], priceRobux: [99, 149, 49][index % 3] });
    if (random() < 0.14) add(session, "item_purchased", 12, AREAS.shop, { product: ["Starter Pack", "Double Coins", "Revive"][index % 3], priceRobux: [99, 149, 49][index % 3] });
    if (random() < 0.64) add(session, "round_completed", 31, defeatedBoss ? AREAS.portal : AREAS.cavern, { success: defeatedBoss, score: 800 + Math.floor(random() * 9200) });
  }
  return events;
}

function createMapParts() {
  const parts = [];
  const add = (name, x, y, z, sx, sy, sz, color, options = {}) => {
    parts.push({
      path: `Workspace.RoAnalyticsDemoWorld.${name}${parts.length}`,
      name,
      className: options.className || "Part",
      shape: options.shape || "Block",
      material: options.material || "SmoothPlastic",
      color,
      transparency: options.transparency || 0,
      cframe: [x, y, z, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      size: [sx, sy, sz],
    });
  };

  for (let xIndex = 0; xIndex < 7; xIndex += 1) {
    for (let zIndex = 0; zIndex < 5; zIndex += 1) {
      const x = -126 + xIndex * 46;
      const z = -82 + zIndex * 46;
      add("WorldTile", x, 0, z, 44, 2, 44, [32 + xIndex * 5, 58 + zIndex * 5, 82], { material: "Slate" });
    }
  }

  for (let index = 0; index < ROUTE.length - 1; index += 1) {
    const start = ROUTE[index];
    const finish = ROUTE[index + 1];
    for (let step = 0; step <= 8; step += 1) {
      const alpha = step / 8;
      add("Path", lerp(start.x, finish.x, alpha), lerp(start.y, finish.y, alpha) - 1.2, lerp(start.z, finish.z, alpha), 13, 1.4, 13, [102, 116, 142], { material: "Cobblestone" });
    }
  }

  createArenaParts(add);
  createVillageParts(add);
  createCavernParts(add);
  createBridgeParts(add);
  createPortalParts(add);
  return parts;
}

function createArenaParts(add) {
  const center = AREAS.boss;
  add("ArenaFloor", center.x, 1, center.z, 66, 3, 66, [82, 50, 64], { material: "Basalt" });
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    add("ArenaPillar", center.x + Math.cos(angle) * 34, 9, center.z + Math.sin(angle) * 34, 5, 18, 5, [128, 64, 82], { material: "Granite" });
  }
  add("BossCore", center.x, 8, center.z, 12, 14, 12, [214, 63, 92], { material: "Neon" });
}

function createVillageParts(add) {
  for (let index = 0; index < 8; index += 1) {
    const x = AREAS.village.x + (index % 4) * 18 - 27;
    const z = AREAS.village.z + Math.floor(index / 4) * 32 - 16;
    add("VillageHouse", x, 7, z, 14, 14, 14, [67, 94, 126], { material: "WoodPlanks" });
    add("VillageRoof", x, 16, z, 17, 4, 17, [112, 69, 86], { material: "Slate" });
  }
  add("UpgradeShop", AREAS.shop.x, 8, AREAS.shop.z, 28, 16, 22, [62, 112, 144], { material: "Metal" });
  add("ShopSign", AREAS.shop.x, 13, AREAS.shop.z - 12, 18, 5, 1, [56, 224, 175], { material: "Neon" });
}

function createCavernParts(add) {
  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    const radius = 23 + (index % 4) * 4;
    const height = 8 + (index % 5) * 3;
    add("CavernRock", AREAS.cavern.x + Math.cos(angle) * radius, height / 2, AREAS.cavern.z + Math.sin(angle) * radius, 8, height, 8, [52, 63, 91], { material: "Rock" });
  }
  for (let index = 0; index < 11; index += 1) {
    add("Crystal", AREAS.cavern.x - 18 + index * 3.6, 5 + (index % 3) * 2, AREAS.cavern.z + 8 + (index % 4) * 4, 2, 10 + (index % 3) * 4, 2, [68, 211, 238], { material: "Neon" });
  }
}

function createBridgeParts(add) {
  for (let index = 0; index < 14; index += 1) {
    add("BridgeSegment", AREAS.bridge.x - 42 + index * 6.5, AREAS.bridge.y - 2, AREAS.bridge.z, 5.8, 1.5, 14, index % 4 === 0 ? [244, 181, 72] : [91, 110, 145], { material: index % 4 === 0 ? "Neon" : "Metal" });
  }
  add("BridgeTower", AREAS.bridge.x - 47, 16, AREAS.bridge.z, 7, 32, 22, [55, 70, 105], { material: "Metal" });
  add("BridgeTower", AREAS.bridge.x + 47, 16, AREAS.bridge.z, 7, 32, 22, [55, 70, 105], { material: "Metal" });
}

function createPortalParts(add) {
  add("RewardPlatform", AREAS.portal.x, 1, AREAS.portal.z, 38, 3, 38, [52, 91, 105], { material: "Marble" });
  add("PortalLeft", AREAS.portal.x - 10, 12, AREAS.portal.z, 4, 24, 4, [139, 92, 246], { material: "Neon" });
  add("PortalRight", AREAS.portal.x + 10, 12, AREAS.portal.z, 4, 24, 4, [139, 92, 246], { material: "Neon" });
  add("PortalTop", AREAS.portal.x, 23, AREAS.portal.z, 24, 4, 4, [139, 92, 246], { material: "Neon" });
  add("PortalField", AREAS.portal.x, 12, AREAS.portal.z, 16, 18, 1, [70, 220, 190], { material: "ForceField", transparency: 0.35 });
}

function createDemoFunnels(referenceTime) {
  return [
    {
      id: "demo-funnel-onboarding",
      name: "New player onboarding",
      steps: ["session_started", "tutorial_started", "tutorial_completed", "first_upgrade"],
      conversionWindowMinutes: 30,
      createdAt: referenceTime,
      updatedAt: referenceTime,
    },
    {
      id: "demo-funnel-boss",
      name: "Boss progression",
      steps: ["zone_entered", "boss_entered", "boss_defeated", "reward_claimed"],
      conversionWindowMinutes: 60,
      createdAt: referenceTime,
      updatedAt: referenceTime,
    },
    {
      id: "demo-funnel-purchase",
      name: "Shop conversion",
      steps: ["purchase_prompt", "item_purchased"],
      conversionWindowMinutes: 10,
      createdAt: referenceTime,
      updatedAt: referenceTime,
    },
  ];
}

function historicalTime(random, referenceTime, salt) {
  const age = Math.floor(random() * 30 * DAY_MS);
  return referenceTime - age - (salt % 300) * 1000;
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

function jitter(random, radius) {
  return (random() * 2 - 1) * radius;
}

function lerp(start, finish, alpha) {
  return start + (finish - start) * alpha;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

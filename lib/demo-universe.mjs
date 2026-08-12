export const DEMO_UNIVERSE_ID = 9_000_000_000_001;
export const DEMO_PLACE_ID = 9_000_000_000_002;
export const DEMO_UNIVERSE_NAME = "RoSignal Demo World";
export const DEMO_SEED_VERSION = 11;

const DAY_MS = 24 * 60 * 60 * 1000;
const DEMO_OLDER_PLACE_VERSION = 119;
const DEMO_PREVIOUS_PLACE_VERSION = 120;
const DEMO_CURRENT_PLACE_VERSION = 121;
const DEMO_PLAYER_COUNT = 64;
const DEMO_SESSION_COUNT = 760;

const AREAS = {
  hub: { name: "Analytics Hub", x: 0, y: 4, z: 0, gameMode: "Hub", map: "RoSignal Demo World", mapId: "demo-hub" },
  obbyStart: { name: "Obby Start", x: -122, y: 4, z: 52, gameMode: "Obby", map: "Skyline Obby", mapId: "obby-main" },
  obbyEasy: { name: "Moving Platforms", x: -78, y: 12, z: 52, gameMode: "Obby", map: "Skyline Obby", mapId: "obby-main" },
  obbyHard: { name: "Laser Ladder", x: -32, y: 30, z: 52, gameMode: "Obby", map: "Skyline Obby", mapId: "obby-main" },
  obbyFinish: { name: "Obby Finish", x: 16, y: 42, z: 52, gameMode: "Obby", map: "Skyline Obby", mapId: "obby-main" },
  armory: { name: "FPS Armory", x: 58, y: 4, z: -58, gameMode: "FPS", map: "Cargo Yard", mapId: "fps-cargo-yard" },
  fpsArena: { name: "FPS Cargo Yard", x: 118, y: 4, z: -58, gameMode: "FPS", map: "Cargo Yard", mapId: "fps-cargo-yard" },
};

const MOVEMENT_ROUTES = [
  [AREAS.hub, AREAS.obbyStart, AREAS.obbyEasy, AREAS.obbyHard, AREAS.obbyFinish],
  [AREAS.hub, AREAS.armory, AREAS.fpsArena],
  [AREAS.hub, AREAS.armory, AREAS.fpsArena],
];

const OBBY_OBSTACLES = {
  "Start Gate": { x: -122, y: 4, z: 52 },
  "Moving Platforms": AREAS.obbyEasy,
  "Spike Hall": { x: -55, y: 20, z: 52 },
  "Laser Ladder": AREAS.obbyHard,
  "Drop Bridge": { x: -28, y: 36, z: 52 },
  "Final Jump": { x: 2, y: 39, z: 52 },
};

const FPS_WEAPON_USAGE = [
  ["Assault Rifle", 44],
  ["SMG", 27],
  ["Shotgun", 18],
  ["Sniper", 11],
];

const FPS_CHECKPOINT_STEPS = [
  { key: "Start Gate", obstacle: "Start Gate", checkpointIndex: 1, timeOffsetMinutes: 2 },
  { key: "Moving Platforms", obstacle: "Moving Platforms", checkpointIndex: 2, timeOffsetMinutes: 5 },
  { key: "Spike Hall", obstacle: "Spike Hall", checkpointIndex: 3, timeOffsetMinutes: 7 },
  { key: "Laser Ladder", obstacle: "Laser Ladder", checkpointIndex: 4, timeOffsetMinutes: 10 },
  { key: "Drop Bridge", obstacle: "Drop Bridge", checkpointIndex: 5, timeOffsetMinutes: 13 },
  { key: "Final Jump", obstacle: "Final Jump", checkpointIndex: 6, timeOffsetMinutes: 17 },
];

const FATAL_WEAPON_PAIRINGS = {
  "Shotgun": [
    ["Shotgun", 92],
    ["Assault Rifle", 3],
    ["SMG", 3],
    ["Sniper", 2],
  ],
  "Assault Rifle": [
    ["Shotgun", 44],
    ["Assault Rifle", 42],
    ["SMG", 8],
    ["Sniper", 6],
  ],
  "SMG": [
    ["Shotgun", 34],
    ["Assault Rifle", 14],
    ["SMG", 46],
    ["Sniper", 6],
  ],
  "Sniper": [
    ["Shotgun", 41],
    ["Assault Rifle", 13],
    ["SMG", 13],
    ["Sniper", 33],
  ],
};


export function createDemoUniverseFixture(options = {}) {
  const referenceTime = Number(options.referenceTime) || Date.now();
  const random = createSeededRandom(DEMO_SEED_VERSION * 1_000_003);
  const players = createPlayers();
  const sessions = createDemoSessions(random, players, referenceTime);
  const movementSamples = createMovementSamples(random, players, referenceTime);
  const movementRollups = createMovementRollups(random, referenceTime);
  const deathSamples = createSignalSamples(random, sessions, "death", 520);
  const leaveSamples = createSignalSamples(random, sessions, "leave", 360);
  const chatLogs = createChatLogs(random, sessions);
  const customEvents = createCustomEvents(random, sessions);
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
      placeVersion: DEMO_CURRENT_PLACE_VERSION,
      environment: "production",
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
      sessions: sessions.length,
      movementSamples: movementSamples.length,
      movementRollups: movementRollups.length,
      weightedMovementSamples: movementRollups.reduce((total, entry) => total + entry.movementCount, 0),
      deathSamples: deathSamples.length,
      leaveSamples: leaveSamples.length,
      chatLogs: chatLogs.length,
      customEvents: customEvents.length,
      mapParts: mapParts.length,
      funnels: 2,
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
      area: AREAS.obbyHard,
      title: "Laser Ladder remains the biggest obby blocker",
      insightType: "danger",
      summary: "Obstacle heat is highest at the Laser Ladder, and many runs drop there before getting to the final jump.",
      recommendation: "Lower laser speed for first few rounds and add an explicit checkpoint before the ladder.",
      confidence: 0.98,
      movementCount: 15180,
      deathCount: 286,
      leaveCount: 94,
      chatCount: 132,
    },
    {
      area: AREAS.obbyHard,
      title: "Checkpoint 5 is where new players stop most often",
      insightType: "danger",
      summary: "Players often miss the bridge timing and stop before the final jump.",
      recommendation: "Add a short hold check and a visual breadcrumb on the bridge path.",
      confidence: 0.95,
      movementCount: 11720,
      deathCount: 184,
      leaveCount: 86,
      chatCount: 96,
    },
    {
      area: AREAS.fpsArena,
      title: "Shotgun is still the noisiest killer",
      insightType: "dropoff",
      summary: "Even with moderate Shotgun use, most recorded lethal deaths still involve it.",
      recommendation: "Add a short balancing update to short-range burst timing and teach spacing in match tips.",
      confidence: 0.96,
      movementCount: 14360,
      deathCount: 172,
      leaveCount: 52,
      chatCount: 118,
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
        createQuestion("How do I get past the Laser Ladder?", 134, 58, "how do i get past the third laser?"),
        createQuestion("Why does the Shotgun keep killing me?", 112, 49, "why do i keep dying to shotgun?"),
        createQuestion("What is a safe checkpoint path?", 91, 43, "how do i get to final jump safely?"),
        createQuestion("How should I build my loadout?", 79, 38, "which weapon should i take to win?"),
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

function createDemoSessions(random, players, referenceTime) {
  return Array.from({ length: DEMO_SESSION_COUNT }, (_, index) => {
    const startedAt = referenceTime - 40 * 60 * 1000 - Math.floor(random() * 30 * DAY_MS) - Math.floor(random() * 2 * 60 * 60 * 1000);
    const version = getDemoVersionForTimestamp(startedAt, index, referenceTime);
    const deviceRoll = random();
    const device = version.placeVersion === DEMO_CURRENT_PLACE_VERSION
      ? (deviceRoll < 0.54 ? "Mobile" : deviceRoll < 0.76 ? "Desktop" : deviceRoll < 0.9 ? "Tablet" : "Console")
      : (deviceRoll < 0.52 ? "Desktop" : deviceRoll < 0.78 ? "Mobile" : deviceRoll < 0.9 ? "Tablet" : "Console");
    const cohort = ["New", "Returning", "Power user"][index % 3];
    return {
      index,
      id: `demo-session-${index}`,
      jobId: `demo-job-${Math.floor(index / 40) + 1}`,
      player: players[index % players.length],
      startedAt,
      ...version,
      device,
      cohort,
      whenUserFirstPlayed: cohort === "New" ? "Days0To30" : cohort === "Returning" ? "Days31To180" : "Days181AndAbove",
      region: ["NA", "EU", "APAC", "LATAM"][index % 4],
    };
  });
}

function createMovementSamples(random, players, referenceTime) {
  const samples = [];
  for (let index = 0; index < 6000; index += 1) {
    const player = players[index % players.length];
    const route = MOVEMENT_ROUTES[index % MOVEMENT_ROUTES.length];
    const segmentIndex = Math.floor(index / MOVEMENT_ROUTES.length) % (route.length - 1);
    const start = route[segmentIndex];
    const finish = route[segmentIndex + 1];
    const alpha = random();
    const timestamp = historicalTime(random, referenceTime, index);
    const isObbySegment = route.includes(AREAS.obbyHard);
    samples.push({
      id: `demo-movement-${index}`,
      userId: player.userId,
      username: player.username,
      displayName: player.displayName,
      ...getDemoVersionForTimestamp(timestamp, index, referenceTime),
      x: round(lerp(start.x, finish.x, alpha) + jitter(random, isObbySegment ? 4 : 12)),
      y: round(lerp(start.y, finish.y, alpha) + jitter(random, isObbySegment ? 0.7 : 1.2)),
      z: round(lerp(start.z, finish.z, alpha) + jitter(random, isObbySegment ? 4 : 12)),
      sampledAt: timestamp,
    });
  }
  return samples;
}

function createMovementRollups(random, referenceTime) {
  const weightedAreas = [
    AREAS.hub, AREAS.hub, AREAS.obbyStart, AREAS.obbyEasy,
    AREAS.obbyHard, AREAS.obbyHard, AREAS.obbyHard,
    AREAS.armory, AREAS.fpsArena, AREAS.fpsArena,
  ];
  return Array.from({ length: 1200 }, (_, index) => {
    const area = weightedAreas[index % weightedAreas.length];
    const sampledAt = historicalTime(random, referenceTime, index * 3);
    const isObbyHotspot = area === AREAS.obbyHard;
    const x = round(area.x + jitter(random, isObbyHotspot ? 5 : 22));
    const z = round(area.z + jitter(random, isObbyHotspot ? 5 : 22));
    const movementCount = 18 + Math.floor(random() * 92);
    return {
      id: `demo-rollup-${index}`,
      ...getDemoVersionForTimestamp(sampledAt, index, referenceTime),
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

function createSignalSamples(random, sessions, type, count) {
  const areas = type === "death"
    ? [
      AREAS.obbyHard, AREAS.obbyHard, AREAS.obbyHard, AREAS.obbyHard, AREAS.obbyHard, AREAS.obbyHard,
      AREAS.fpsArena, AREAS.fpsArena, AREAS.fpsArena,
      AREAS.obbyEasy,
    ]
    : [AREAS.obbyEasy, AREAS.obbyHard, AREAS.obbyHard, AREAS.fpsArena, AREAS.hub];
  return Array.from({ length: count }, (_, index) => {
    const session = sessions[(index * 7) % sessions.length];
    const player = session.player;
    const area = areas[index % areas.length];
    const offsetMinutes = type === "death"
      ? 16 + (index % 13)
      : session.placeVersion === DEMO_CURRENT_PLACE_VERSION
        ? 22 + (index % 7)
        : 38 + (index % 9);
    const timestamp = session.startedAt + offsetMinutes * 60_000;
    return {
      id: `demo-${type}-${index}`,
      jobId: session.jobId,
      userId: player.userId,
      username: player.username,
      displayName: player.displayName,
      sessionId: session.id,
      placeVersion: session.placeVersion,
      environment: session.environment,
      platform: session.device,
      whenUserFirstPlayed: session.whenUserFirstPlayed,
      x: round(area.x + jitter(random, type === "death" && area === AREAS.obbyHard ? 5 : type === "death" ? 18 : 26)),
      y: round(area.y + jitter(random, 1)),
      z: round(area.z + jitter(random, type === "death" && area === AREAS.obbyHard ? 5 : type === "death" ? 18 : 26)),
      ...(type === "death" ? { diedAt: timestamp } : {
        leftAt: timestamp,
        sessionDurationSeconds: Math.max(0, Math.round((timestamp - session.startedAt) / 1000)),
      }),
      sampledAt: timestamp,
    };
  });
}

function createChatLogs(random, sessions) {
  const messages = [
    [AREAS.obbyHard, "how do i get past the third laser?"],
    [AREAS.obbyHard, "is there a checkpoint before the laser ladder"],
    [AREAS.fpsArena, "why does the shotgun kill me instantly?"],
    [AREAS.fpsArena, "what gun counters the shotgun"],
    [AREAS.obbyEasy, "how do i get to the moving platforms?"],
    [AREAS.hub, "which demo should i try first"],
    [AREAS.fpsArena, "which map is easiest for first timer?"],
    [AREAS.obbyFinish, "finally beat the obby"],
  ];
  return Array.from({ length: 800 }, (_, index) => {
    const session = sessions[(index * 11) % sessions.length];
    const player = session.player;
    const [area, message] = messages[index % messages.length];
    return {
      id: `demo-chat-${index}`,
      jobId: session.jobId,
      userId: player.userId,
      username: player.username,
      displayName: player.displayName,
      sessionId: session.id,
      placeVersion: session.placeVersion,
      environment: session.environment,
      platform: session.device,
      whenUserFirstPlayed: session.whenUserFirstPlayed,
      message,
      x: round(area.x + jitter(random, 14)),
      y: area.y,
      z: round(area.z + jitter(random, 14)),
      sentAt: session.startedAt + (3 + (index % 15)) * 60_000,
    };
  });
}

function createCustomEvents(random, sessions) {
  const events = [];
  let obbyFailureIndex = 0;
  let fpsLoadoutIndex = 0;
  let fpsDeathIndex = 0;
  const addContext = (area) => ({
    gameMode: area?.gameMode || "General",
    mapId: area?.mapId || "demo-hub",
    mapName: area?.map || "RoSignal Demo World",
  });
  const add = (session, eventName, offsetMinutes, area, properties = {}) => {
    const context = addContext(area);
    events.push({
      id: `demo-event-${session.index}-${events.length}`,
      eventName,
      jobId: session.jobId,
      userId: session.player.userId,
      username: session.player.username,
      displayName: session.player.displayName,
      sessionId: session.id,
      placeVersion: session.placeVersion,
      environment: session.environment,
      platform: session.device,
      whenUserFirstPlayed: session.whenUserFirstPlayed,
      x: round(area.x + jitter(random, area === AREAS.obbyHard ? 4 : 9)),
      y: area.y,
      z: round(area.z + jitter(random, area === AREAS.obbyHard ? 4 : 9)),
      occurredAt: session.startedAt + offsetMinutes * 60_000,
      properties: {
        ...properties,
        gameMode: context.gameMode,
        mapId: context.mapId,
        mapName: context.mapName,
      },
    });
  };

  for (const session of sessions) {
    const index = session.index;
    const isCurrentRelease = session.placeVersion === DEMO_CURRENT_PLACE_VERSION;
    const genre = pickWeightedValue(index, [
      ["Obby", 64],
      ["FPS", 36],
    ]);

    add(session, "session_started", 0, AREAS.hub, {
      entryPortal: genre,
      serverPopulation: 12 + (index % 38),
      serverVersion: session.placeVersion,
    });

    if (genre === "Obby") {
      const completed = random() < (isCurrentRelease ? 0.24 : 0.43);
      const completedStepCount = FPS_CHECKPOINT_STEPS.length;
      const attemptStepCount = completed ? completedStepCount : 3 + (index % 3);
      const attemptFailureTime = pickWeightedValue(obbyFailureIndex, [
        ["Timing missed", 55],
        ["Movement mistake", 31],
        ["Jump too early", 10],
        ["Took wrong lane", 4],
      ]);
      for (let stepIndex = 0; stepIndex < attemptStepCount; stepIndex += 1) {
        const step = FPS_CHECKPOINT_STEPS[stepIndex];
        const isDrop = !completed && stepIndex === attemptStepCount - 1;
        const stepTimeOffset = step.timeOffsetMinutes + index * 0.2;
        obbyFailureIndex += 1;
        add(session, "obby_checkpoint_reached", stepTimeOffset, OBBY_OBSTACLES[step.obstacle], {
          checkpoint: step.key,
          checkpointIndex: step.checkpointIndex,
          isRunOver: isDrop ? false : true,
          segmentTimeSeconds: (stepIndex + 1) * 9 + (index % 7),
          failureReason: isDrop ? attemptFailureTime : "Clean",
          attemptNumber: attemptStepCount,
          requiredAccuracy: stepIndex >= 3 ? "High" : "Medium",
        });
        if (isDrop) break;
      }
      if (completed) {
        add(session, "obby_completed", 18, AREAS.obbyFinish, {
          course: "Skyline Obby",
          attempts: 1 + (attemptStepCount > 4 ? 1 : 0),
          completionTimeSeconds: 145 + (index % 140),
          bestCompletionTimeSeconds: 130 + (index % 120),
          courseLane: (index % 3) + 1,
          checkpointSteps: attemptStepCount,
        });
      }
    } else if (genre === "FPS") {
      const selectedWeapon = pickWeightedValue(fpsLoadoutIndex, FPS_WEAPON_USAGE);
      fpsLoadoutIndex += 1;
      add(session, "weapon_selected", 3, AREAS.armory, {
        weapon: selectedWeapon,
        map: "Cargo Yard",
        loadoutSlot: "Primary",
        team: index % 2 === 0 ? "Alpha" : "Beta",
        isStarterPack: selectedWeapon !== "Assault Rifle",
        mapType: "Cargo Yard",
        ammoCapacity: selectedWeapon === "Assault Rifle" ? 34 : selectedWeapon === "SMG" ? 42 : selectedWeapon === "Shotgun" ? 16 : 8,
        fireRate: selectedWeapon === "Sniper" ? "Low" : selectedWeapon === "Shotgun" ? "Burst" : "Medium",
      });

      const deathCount = 1 + (index % 4 === 0 ? 1 : 0);
      for (let death = 0; death < deathCount; death += 1) {
        const killedByWeapon = pickWeightedValue(fpsDeathIndex, FATAL_WEAPON_PAIRINGS[selectedWeapon] || FPS_WEAPON_USAGE);
        const distanceBand = pickWeightedValue(fpsDeathIndex, [
          ["Close range", 68],
          ["Mid range", 23],
          ["Long range", 9],
        ]);
        fpsDeathIndex += 1;
        add(session, "combat_death", 7 + death * 4, AREAS.fpsArena, {
          killedByWeapon,
          victimWeapon: selectedWeapon,
          selectedWeapon,
          killRoundSeconds: 42 + (death * 7) + (index % 18),
          distanceBand,
          canCounterplay: random() < 0.34,
          runAccuracyWindowMs: 180 + (death * 24),
          killZone: index % 2 === 0 ? "Midline" : "Open",
          map: "Cargo Yard",
          headshot: random() < 0.21,
        });
      }
    }
  }
  return events;
}

function getDemoVersionForTimestamp(timestamp, index, referenceTime) {
  const previousReleaseStartedAt = referenceTime - 18 * DAY_MS;
  const releaseStartedAt = referenceTime - 7 * DAY_MS;
  const overlapEndedAt = releaseStartedAt + 18 * 60 * 60 * 1000;
  if (timestamp < previousReleaseStartedAt) {
    return {
      placeVersion: DEMO_OLDER_PLACE_VERSION,
      environment: "production",
    };
  }
  const isPreviousVersion = timestamp < releaseStartedAt
    || (timestamp < overlapEndedAt && index % 4 === 0);
  return {
    placeVersion: isPreviousVersion ? DEMO_PREVIOUS_PLACE_VERSION : DEMO_CURRENT_PLACE_VERSION,
    environment: "production",
  };
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

  for (let xIndex = 0; xIndex < 10; xIndex += 1) {
    for (let zIndex = 0; zIndex < 6; zIndex += 1) {
      const x = -150 + xIndex * 34;
      const z = -104 + zIndex * 40;
      add("WorldTile", x, 0, z, 32, 2, 38, [27 + xIndex * 3, 44 + zIndex * 5, 68], { material: "Slate" });
    }
  }

  const walkways = [
    [AREAS.hub, AREAS.obbyStart],
    [AREAS.hub, AREAS.armory],
  ];
  for (const [start, finish] of walkways) {
    for (let step = 1; step < 9; step += 1) {
      const alpha = step / 9;
      add("GenreWalkway", lerp(start.x, finish.x, alpha), 1.3, lerp(start.z, finish.z, alpha), 11, 1.4, 11, [78, 94, 124], { material: "Cobblestone" });
    }
  }

  createHubParts(add);
  createObbyParts(add);
  createFpsParts(add);
  return parts;
}

function createHubParts(add) {
  add("AnalyticsHub", AREAS.hub.x, 1, AREAS.hub.z, 58, 3, 58, [46, 59, 92], { material: "Marble" });
  add("HubBeacon", AREAS.hub.x, 13, AREAS.hub.z, 5, 24, 5, [128, 92, 246], { material: "Neon" });
  const portals = [
    ["ObbyPortal", -20, 6, 15, [244, 114, 82]],
    ["FpsPortal", 20, 6, -15, [70, 170, 255]],
  ];
  for (const [name, x, y, z, color] of portals) {
    add(name, x, y, z, 11, 1.5, 11, color, { material: "Neon" });
  }
}

function createObbyParts(add) {
  add("ObbyStartPlatform", AREAS.obbyStart.x, 2, AREAS.obbyStart.z, 28, 4, 28, [64, 146, 214], { material: "Metal" });
  for (let index = 0; index < 6; index += 1) {
    add("WarmupStep", -112 + index * 6, 4 + index * 1.2, 52 + (index % 2 ? 5 : -5), 5, 2, 8, [80, 170, 224], { material: "Metal" });
  }
  for (let index = 0; index < 6; index += 1) {
    add("MovingPlatform", -86 + index * 6, 11 + (index % 3) * 2.5, 52 + (index % 2 ? 7 : -7), 5, 1.5, 8, [244, 184, 72], { material: "Metal" });
  }
  add("SpikeHallFloor", -55, 16, 52, 22, 2, 16, [76, 86, 112], { material: "DiamondPlate" });
  for (let index = 0; index < 7; index += 1) {
    add("SpikeHazard", -63 + index * 2.7, 18, 52 + (index % 2 ? 4 : -4), 1.4, 4, 1.4, [235, 70, 86], { material: "Neon" });
  }
  for (let index = 0; index < 8; index += 1) {
    const x = -48 + index * 4.5;
    const y = 20 + index * 2.7;
    add("LaserLadderLanding", x, y, 52 + (index % 2 ? 4 : -4), 4.2, 1.3, 6, [156, 108, 246], { material: "Metal" });
    add("LaserHazard", x + 1.8, y + 2.1, 52, 0.8, 0.8, 18, [255, 54, 92], { material: "Neon" });
  }
  add("FinalJumpTakeoff", -8, 37, 52, 10, 2, 12, [84, 156, 224], { material: "Metal" });
  add("FinalJumpLanding", 4, 39, 52, 5, 2, 7, [244, 184, 72], { material: "Neon" });
  add("ObbyFinishPlatform", AREAS.obbyFinish.x, 40, AREAS.obbyFinish.z, 24, 4, 24, [57, 220, 147], { material: "Metal" });
  add("ObbyFinishBeacon", AREAS.obbyFinish.x, 49, AREAS.obbyFinish.z, 4, 16, 4, [57, 220, 147], { material: "Neon" });
}

function createFpsParts(add) {
  add("FpsArmoryFloor", AREAS.armory.x, 1, AREAS.armory.z, 38, 3, 30, [47, 74, 108], { material: "Metal" });
  const weapons = ["AssaultRifle", "SMG", "Shotgun", "Sniper"];
  for (let index = 0; index < weapons.length; index += 1) {
    add(`WeaponPedestal_${weapons[index]}`, AREAS.armory.x - 13 + index * 8.5, 4, AREAS.armory.z, 5, 5, 5, index === 2 ? [255, 96, 84] : [75, 156, 224], { material: "Neon" });
  }
  add("FpsArenaFloor", AREAS.fpsArena.x, 1, AREAS.fpsArena.z, 76, 3, 64, [48, 55, 70], { material: "Concrete" });
  add("FpsArenaNorthWall", AREAS.fpsArena.x, 8, AREAS.fpsArena.z - 33, 78, 14, 3, [68, 78, 96], { material: "Concrete" });
  add("FpsArenaSouthWall", AREAS.fpsArena.x, 8, AREAS.fpsArena.z + 33, 78, 14, 3, [68, 78, 96], { material: "Concrete" });
  for (let index = 0; index < 12; index += 1) {
    const x = AREAS.fpsArena.x - 26 + (index % 4) * 17;
    const z = AREAS.fpsArena.z - 18 + Math.floor(index / 4) * 18;
    add("FpsCover", x, 4, z, 8, 8, 5, index % 3 === 0 ? [132, 74, 62] : [76, 91, 112], { material: "Metal" });
  }
  add("ShotgunHotspot", AREAS.fpsArena.x + 18, 1.8, AREAS.fpsArena.z, 14, 0.8, 14, [255, 72, 92], { material: "Neon", transparency: 0.35 });
}

function createDemoFunnels(referenceTime) {
  return [
    {
      id: "demo-funnel-onboarding",
      name: "Obby checkpoint journey",
      steps: [
        "obby_checkpoint_reached",
        "obby_checkpoint_reached",
        "obby_checkpoint_reached",
        "obby_checkpoint_reached",
        "obby_checkpoint_reached",
        "obby_checkpoint_reached",
        "obby_completed",
      ],
      conversionWindowMinutes: 30,
      createdAt: referenceTime,
      updatedAt: referenceTime,
    },
    {
      id: "demo-funnel-boss",
      name: "FPS lethal loadout",
      steps: ["weapon_selected", "combat_death"],
      conversionWindowMinutes: 30,
      createdAt: referenceTime,
      updatedAt: referenceTime,
    },
  ];
}

function pickWeightedValue(index, entries) {
  const totalWeight = entries.reduce((total, [, weight]) => total + Math.max(0, Number(weight) || 0), 0);
  if (!totalWeight) return entries[0]?.[0];
  const normalizedIndex = Math.abs(Math.trunc(Number(index) || 0));
  let cursor = (normalizedIndex * 37) % totalWeight;
  for (const [value, weight] of entries) {
    const normalizedWeight = Math.max(0, Number(weight) || 0);
    if (cursor < normalizedWeight) return value;
    cursor -= normalizedWeight;
  }
  return entries.at(-1)?.[0];
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

export const DEMO_UNIVERSE_ID = 9_000_000_000_001;
export const DEMO_PLACE_ID = 9_000_000_000_002;
export const DEMO_UNIVERSE_NAME = "RoAnalytics Demo World";
export const DEMO_SEED_VERSION = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
const DEMO_OLDER_PLACE_VERSION = 119;
const DEMO_PREVIOUS_PLACE_VERSION = 120;
const DEMO_CURRENT_PLACE_VERSION = 121;
const DEMO_PLAYER_COUNT = 64;
const DEMO_SESSION_COUNT = 760;

const AREAS = {
  hub: { name: "Analytics Hub", x: 0, y: 4, z: 0 },
  obbyStart: { name: "Obby Start", x: -122, y: 4, z: 52 },
  obbyEasy: { name: "Moving Platforms", x: -78, y: 12, z: 52 },
  obbyHard: { name: "Laser Ladder", x: -32, y: 30, z: 52 },
  obbyFinish: { name: "Obby Finish", x: 16, y: 42, z: 52 },
  armory: { name: "FPS Armory", x: 58, y: 4, z: -58 },
  fpsArena: { name: "FPS Cargo Yard", x: 118, y: 4, z: -58 },
  swordArena: { name: "Sword Duel Arena", x: 66, y: 4, z: 74 },
  simulator: { name: "Pet Simulator Plaza", x: 132, y: 4, z: 76 },
  shop: { name: "Robux Shop", x: 0, y: 4, z: -72 },
};

const MOVEMENT_ROUTES = [
  [AREAS.hub, AREAS.obbyStart, AREAS.obbyEasy, AREAS.obbyHard, AREAS.obbyFinish],
  [AREAS.hub, AREAS.obbyStart, AREAS.obbyEasy, AREAS.obbyHard],
  [AREAS.hub, AREAS.armory, AREAS.fpsArena],
  [AREAS.hub, AREAS.armory, AREAS.fpsArena],
  [AREAS.hub, AREAS.swordArena],
  [AREAS.hub, AREAS.simulator],
  [AREAS.hub, AREAS.shop],
];

const OBBY_OBSTACLES = {
  "Warmup Steps": { x: -104, y: 7, z: 52 },
  "Moving Platforms": AREAS.obbyEasy,
  "Spike Hall": { x: -55, y: 20, z: 52 },
  "Laser Ladder": AREAS.obbyHard,
  "Final Jump": { x: 2, y: 39, z: 52 },
};

const FPS_WEAPON_USAGE = [
  ["Assault Rifle", 44],
  ["SMG", 27],
  ["Shotgun", 18],
  ["Sniper", 11],
];

const FPS_DEATH_WEAPONS = [
  ["Shotgun", 56],
  ["Assault Rifle", 22],
  ["SMG", 13],
  ["Sniper", 9],
];

const SWORD_USAGE = [
  ["Iron Blade", 55],
  ["Flame Saber", 25],
  ["Frost Edge", 15],
  ["Void Edge", 5],
];

const SWORD_DEFEATS = [
  ["Void Edge", 52],
  ["Flame Saber", 21],
  ["Iron Blade", 17],
  ["Frost Edge", 10],
];

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
      area: AREAS.obbyHard,
      title: "Laser Ladder difficulty spike",
      insightType: "danger",
      summary: "The Laser Ladder causes 58% of all obby failures and the strongest death cluster in the demo world.",
      recommendation: "Widen the third landing, slow the laser cycle, and place a checkpoint before the ladder.",
      confidence: 0.98,
      movementCount: 15180,
      deathCount: 286,
      leaveCount: 94,
      chatCount: 132,
    },
    {
      area: AREAS.fpsArena,
      title: "Shotgun death imbalance",
      insightType: "danger",
      summary: "Shotguns represent only 18% of selected loadouts but cause 56% of recorded combat deaths.",
      recommendation: "Reduce close-range damage or increase the delay between shotgun shots before the next balance release.",
      confidence: 0.96,
      movementCount: 14360,
      deathCount: 172,
      leaveCount: 52,
      chatCount: 118,
    },
    {
      area: AREAS.swordArena,
      title: "Void Edge dominates duels",
      insightType: "mixed",
      summary: "Only 5% of players select the Void Edge, yet it appears in 52% of sword-duel defeats.",
      recommendation: "Review the Void Edge ability cooldown and test it against the starter sword before promoting it.",
      confidence: 0.95,
      movementCount: 10840,
      deathCount: 96,
      leaveCount: 38,
      chatCount: 84,
    },
    {
      area: AREAS.simulator,
      title: "Inventory capacity ends sessions",
      insightType: "dropoff",
      summary: "Pet inventory full is the recorded exit reason for 61% of simulator sessions in the demo data.",
      recommendation: "Give one free capacity upgrade before the first inventory cap and surface the upgrade beside the hatch button.",
      confidence: 0.93,
      movementCount: 12620,
      deathCount: 4,
      leaveCount: 138,
      chatCount: 146,
    },
    {
      area: AREAS.shop,
      title: "Price is the main purchase objection",
      insightType: "dropoff",
      summary: "Too expensive accounts for 54% of closed purchase prompts, well above every other response.",
      recommendation: "Test a lower starter-pack price or show the included value more clearly before the prompt opens.",
      confidence: 0.91,
      movementCount: 8840,
      deathCount: 0,
      leaveCount: 72,
      chatCount: 104,
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
        createQuestion("Why does the shotgun one-shot me?", 112, 49, "why does the shotgun kill me instantly?"),
        createQuestion("How do I get the Void Edge?", 91, 43, "where do people get the void sword?"),
        createQuestion("How do I increase pet inventory?", 79, 38, "how do i get more pet storage?"),
        createQuestion("What is inside the starter pack?", 63, 32, "what do i get if i buy the starter pack?"),
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
    AREAS.swordArena, AREAS.simulator, AREAS.shop,
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
      AREAS.swordArena, AREAS.swordArena,
      AREAS.obbyEasy,
    ]
    : [AREAS.simulator, AREAS.simulator, AREAS.obbyHard, AREAS.shop, AREAS.fpsArena, AREAS.hub];
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
    [AREAS.swordArena, "where do people get the void sword?"],
    [AREAS.swordArena, "is void edge supposed to hit that hard"],
    [AREAS.simulator, "how do i get more pet storage?"],
    [AREAS.simulator, "why is my pet inventory full already"],
    [AREAS.shop, "what do i get if i buy the starter pack?"],
    [AREAS.shop, "the starter pack is too expensive"],
    [AREAS.hub, "which demo should i try first"],
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
  let swordLoadoutIndex = 0;
  let swordDefeatIndex = 0;
  let simulatorHatchIndex = 0;
  let simulatorExitIndex = 0;
  let shopPromptIndex = 0;
  let shopCloseIndex = 0;
  const add = (session, eventName, offsetMinutes, area, properties = {}) => {
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
        device: session.device,
        cohort: session.cohort,
        region: session.region,
      },
    });
  };

  for (const session of sessions) {
    const index = session.index;
    const isCurrentRelease = session.placeVersion === DEMO_CURRENT_PLACE_VERSION;
    const genre = pickWeightedValue(index, [
      ["Obby", 32],
      ["FPS", 27],
      ["Sword Arena", 22],
      ["Pet Simulator", 19],
    ]);

    add(session, "session_started", 0, AREAS.hub, {
      entryPortal: genre,
      serverPopulation: 12 + (index % 38),
    });
    add(session, "genre_portal_entered", 1, AREAS.hub, { genre });

    if (genre === "Obby") {
      add(session, "obby_run_started", 2, AREAS.obbyStart, { course: "Skyline Obby", difficulty: "Hard" });
      add(session, "obby_checkpoint_reached", 4, OBBY_OBSTACLES["Warmup Steps"], { checkpoint: "Warmup Steps" });
      const completed = random() < (isCurrentRelease ? 0.24 : 0.43);
      const reachedMovingPlatforms = random() < 0.88;
      const reachedSpikeHall = random() < 0.69;
      const reachedLaserLadder = completed || random() < 0.38;
      if (reachedMovingPlatforms) add(session, "obby_checkpoint_reached", 7, AREAS.obbyEasy, { checkpoint: "Moving Platforms" });
      if (reachedSpikeHall) add(session, "obby_checkpoint_reached", 10, OBBY_OBSTACLES["Spike Hall"], { checkpoint: "Spike Hall" });
      if (reachedLaserLadder) add(session, "obby_checkpoint_reached", 13, AREAS.obbyHard, { checkpoint: "Laser Ladder" });

      const failureCount = 1 + (index % 3);
      for (let failure = 0; failure < failureCount; failure += 1) {
        const obstacle = pickWeightedValue(obbyFailureIndex, [
          ["Laser Ladder", 58],
          ["Moving Platforms", 18],
          ["Spike Hall", 15],
          ["Final Jump", 9],
        ]);
        obbyFailureIndex += 1;
        const reason = obstacle === "Laser Ladder"
          ? "Laser hit"
          : obstacle === "Moving Platforms"
            ? "Missed platform"
            : obstacle === "Spike Hall"
              ? "Touched spikes"
              : "Missed final landing";
        add(session, "obby_failed", 6 + failure * 3, OBBY_OBSTACLES[obstacle], {
          obstacle,
          reason,
          attemptNumber: failure + 1,
        });
      }

      if (completed) {
        add(session, "obby_checkpoint_reached", 16, OBBY_OBSTACLES["Final Jump"], { checkpoint: "Final Jump" });
        add(session, "obby_completed", 18, AREAS.obbyFinish, {
          course: "Skyline Obby",
          attempts: failureCount + 1,
          completionTimeSeconds: 185 + (index % 170),
        });
      }
    } else if (genre === "FPS") {
      const selectedWeapon = pickWeightedValue(fpsLoadoutIndex, FPS_WEAPON_USAGE);
      fpsLoadoutIndex += 1;
      add(session, "fps_match_joined", 2, AREAS.armory, { map: "Cargo Yard", mode: "Team Deathmatch" });
      add(session, "weapon_selected", 3, AREAS.armory, {
        weapon: selectedWeapon,
        map: "Cargo Yard",
      });

      const deathCount = 1 + (index % 4 === 0 ? 1 : 0);
      for (let death = 0; death < deathCount; death += 1) {
        const killedByWeapon = pickWeightedValue(fpsDeathIndex, FPS_DEATH_WEAPONS);
        const distanceBand = pickWeightedValue(fpsDeathIndex, [
          ["Close range", 68],
          ["Mid range", 23],
          ["Long range", 9],
        ]);
        fpsDeathIndex += 1;
        add(session, "combat_death", 7 + death * 4, AREAS.fpsArena, {
          killedByWeapon,
          victimWeapon: selectedWeapon,
          distanceBand,
          map: "Cargo Yard",
        });
      }

      if (random() < (isCurrentRelease ? 0.68 : 0.77)) {
        add(session, "fps_match_completed", 17, AREAS.fpsArena, {
          map: "Cargo Yard",
          selectedWeapon,
          result: index % 2 === 0 ? "Win" : "Loss",
          kills: 2 + (index % 17),
        });
      }
    } else if (genre === "Sword Arena") {
      const selectedSword = pickWeightedValue(swordLoadoutIndex, SWORD_USAGE);
      swordLoadoutIndex += 1;
      add(session, "sword_duel_started", 2, AREAS.swordArena, { arena: "Temple Ring" });
      add(session, "sword_selected", 3, AREAS.swordArena, { sword: selectedSword, arena: "Temple Ring" });

      const defeatCount = 1 + (index % 3 === 0 ? 1 : 0);
      for (let defeat = 0; defeat < defeatCount; defeat += 1) {
        const defeatedBySword = pickWeightedValue(swordDefeatIndex, SWORD_DEFEATS);
        swordDefeatIndex += 1;
        add(session, "sword_duel_defeat", 7 + defeat * 4, AREAS.swordArena, {
          defeatedBySword,
          selectedSword,
          arena: "Temple Ring",
        });
      }

      if (random() < 0.74) {
        add(session, "sword_duel_completed", 15, AREAS.swordArena, {
          selectedSword,
          result: index % 3 === 0 ? "Win" : "Loss",
        });
      }
    } else {
      add(session, "simulator_zone_entered", 2, AREAS.simulator, { zone: "Pet Hatchery" });
      const hatchCount = 3 + (index % 4);
      for (let hatch = 0; hatch < hatchCount; hatch += 1) {
        const egg = pickWeightedValue(simulatorHatchIndex, [
          ["Starter Egg", 68],
          ["Forest Egg", 24],
          ["Crystal Egg", 8],
        ]);
        const rarity = pickWeightedValue(simulatorHatchIndex, [
          ["Common", 62],
          ["Uncommon", 25],
          ["Rare", 11],
          ["Legendary", 2],
        ]);
        simulatorHatchIndex += 1;
        add(session, "egg_hatched", 4 + hatch * 2, AREAS.simulator, { egg, rarity });
      }

      const exitReason = pickWeightedValue(simulatorExitIndex, [
        ["Pet inventory full", 61],
        ["Grind too slow", 23],
        ["Finished goal", 10],
        ["Other", 6],
      ]);
      simulatorExitIndex += 1;
      if (exitReason === "Pet inventory full") {
        add(session, "pet_inventory_full", 14, AREAS.simulator, {
          capacity: 20 + (index % 3) * 5,
          eggsHatched: hatchCount,
        });
      }
      if (random() < 0.28) {
        add(session, "inventory_upgrade_purchased", 15, AREAS.simulator, {
          capacityBefore: 20 + (index % 3) * 5,
          capacityAfter: 40 + (index % 3) * 10,
        });
      }
      add(session, "simulator_session_ended", 17, AREAS.simulator, {
        reason: exitReason,
        eggsHatched: hatchCount,
      });
    }

    if (random() < 0.46) {
      const product = pickWeightedValue(shopPromptIndex, [
        ["Starter Pack", 50],
        ["Double Coins", 30],
        ["Revive", 20],
      ]);
      const priceRobux = product === "Starter Pack" ? 149 : product === "Double Coins" ? 99 : 49;
      shopPromptIndex += 1;
      add(session, "purchase_prompt", 9, AREAS.shop, { product, priceRobux });
      const purchased = random() < (isCurrentRelease ? 0.28 : 0.09);
      if (purchased) {
        add(session, "item_purchased", 10, AREAS.shop, { product, priceRobux });
      } else {
        const closeReason = pickWeightedValue(shopCloseIndex, [
          ["Too expensive", 54],
          ["Not enough value", 31],
          ["Saving Robux", 10],
          ["Closed accidentally", 5],
        ]);
        shopCloseIndex += 1;
        add(session, "purchase_prompt_closed", 10, AREAS.shop, { reason: closeReason, product, priceRobux });
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
    [AREAS.hub, AREAS.swordArena],
    [AREAS.hub, AREAS.simulator],
    [AREAS.hub, AREAS.shop],
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
  createSwordArenaParts(add);
  createSimulatorParts(add);
  createShopParts(add);
  return parts;
}

function createHubParts(add) {
  add("AnalyticsHub", AREAS.hub.x, 1, AREAS.hub.z, 58, 3, 58, [46, 59, 92], { material: "Marble" });
  add("HubBeacon", AREAS.hub.x, 13, AREAS.hub.z, 5, 24, 5, [128, 92, 246], { material: "Neon" });
  const portals = [
    ["ObbyPortal", -20, 6, 15, [244, 114, 82]],
    ["FpsPortal", 20, 6, -15, [70, 170, 255]],
    ["SwordPortal", 20, 6, 15, [180, 90, 245]],
    ["SimulatorPortal", 0, 6, 22, [57, 220, 147]],
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

function createSwordArenaParts(add) {
  add("SwordArenaFloor", AREAS.swordArena.x, 1, AREAS.swordArena.z, 56, 3, 56, [65, 50, 86], { material: "Basalt" });
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    add("SwordArenaPillar", AREAS.swordArena.x + Math.cos(angle) * 28, 7, AREAS.swordArena.z + Math.sin(angle) * 28, 4, 14, 4, [92, 66, 118], { material: "Granite" });
  }
  const swords = ["IronBlade", "FlameSaber", "FrostEdge", "VoidEdge"];
  for (let index = 0; index < swords.length; index += 1) {
    const isVoidEdge = swords[index] === "VoidEdge";
    add(`SwordPedestal_${swords[index]}`, AREAS.swordArena.x - 15 + index * 10, 4, AREAS.swordArena.z - 19, 5, 5, 5, isVoidEdge ? [165, 72, 255] : [102, 130 + index * 20, 186], { material: "Neon" });
  }
  add("VoidEdgeCenterMark", AREAS.swordArena.x, 1.8, AREAS.swordArena.z, 13, 0.8, 13, [165, 72, 255], { material: "Neon", transparency: 0.3 });
}

function createSimulatorParts(add) {
  add("SimulatorPlaza", AREAS.simulator.x, 1, AREAS.simulator.z, 60, 3, 58, [42, 88, 82], { material: "Marble" });
  const eggs = [
    ["StarterEggMachine", -18, [72, 198, 126]],
    ["ForestEggMachine", 0, [78, 164, 98]],
    ["CrystalEggMachine", 18, [74, 188, 238]],
  ];
  for (const [name, offset, color] of eggs) {
    add(name, AREAS.simulator.x + offset, 7, AREAS.simulator.z, 12, 12, 12, color, { material: "Neon" });
    add("EggMachineBase", AREAS.simulator.x + offset, 2, AREAS.simulator.z, 16, 3, 16, [58, 76, 78], { material: "Metal" });
  }
  add("PetInventoryStation", AREAS.simulator.x, 6, AREAS.simulator.z + 21, 28, 10, 8, [255, 184, 72], { material: "Metal" });
  add("InventoryFullWarning", AREAS.simulator.x, 12, AREAS.simulator.z + 21, 22, 3, 1, [255, 72, 92], { material: "Neon" });
}

function createShopParts(add) {
  add("RobuxShopFloor", AREAS.shop.x, 1, AREAS.shop.z, 44, 3, 36, [52, 67, 96], { material: "Marble" });
  add("StarterPackDisplay", AREAS.shop.x - 12, 7, AREAS.shop.z, 10, 12, 10, [245, 158, 72], { material: "Neon" });
  add("DoubleCoinsDisplay", AREAS.shop.x, 7, AREAS.shop.z, 10, 12, 10, [250, 214, 72], { material: "Neon" });
  add("ReviveDisplay", AREAS.shop.x + 12, 7, AREAS.shop.z, 10, 12, 10, [238, 82, 104], { material: "Neon" });
  add("ShopPriceWarning", AREAS.shop.x - 12, 14, AREAS.shop.z, 12, 2, 2, [255, 72, 92], { material: "Neon" });
}

function createDemoFunnels(referenceTime) {
  return [
    {
      id: "demo-funnel-onboarding",
      name: "Obby completion",
      steps: ["obby_run_started", "obby_checkpoint_reached", "obby_completed"],
      conversionWindowMinutes: 30,
      createdAt: referenceTime,
      updatedAt: referenceTime,
    },
    {
      id: "demo-funnel-boss",
      name: "FPS match completion",
      steps: ["fps_match_joined", "weapon_selected", "fps_match_completed"],
      conversionWindowMinutes: 30,
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

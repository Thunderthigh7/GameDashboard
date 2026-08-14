(() => {
  "use strict";

  const VIEW = "automations";
  const STORAGE_PREFIX = "rosignal.automations.showcase.v1";
  const DEMO_RUN_MS = 650;

  const TRIGGER_META = {
    event_count: { label: "Event count", icon: "pulse" },
    metric_change: { label: "Metric change", icon: "trend" },
    schedule: { label: "Schedule", icon: "clock" },
    release: { label: "New release", icon: "release" },
  };

  const ACTION_META = {
    experience_config: { label: "Experience Config", icon: "sliders", access: "Experience read + write" },
    discord: { label: "Discord alert", icon: "message", access: "Discord webhook" },
    roblox_action: { label: "Roblox live action", icon: "zap", access: "MessagingService" },
  };

  const DEFAULT_AUTOMATIONS = [
    {
      id: "demo-release-guardian",
      name: "Release guardian",
      description: "Watch the newest release and surface a rollback-ready config change when conversion drops.",
      enabled: true,
      demo: true,
      trigger: {
        type: "metric_change",
        metric: "Tutorial completion",
        direction: "decreases",
        percent: 15,
        window: "30m",
      },
      conditions: {
        environment: "Production",
        minPlayers: 75,
        minSamples: 100,
        version: "Newest release",
        holdFor: "5m",
      },
      actions: [
        {
          type: "experience_config",
          configName: "NewTutorialEnabled",
          valueType: "boolean",
          value: "false",
          publish: true,
        },
        {
          type: "discord",
          message: "Tutorial completion fell {{change}} after release {{version}}. Review the proposed rollback.",
        },
      ],
      execution: { mode: "approval", cooldown: "6h", maxRuns: "2", delay: "0m" },
      safety: { rollback: "Keep previous revision", failure: "Pause + alert", minSample: 100 },
      lastRun: null,
      runCount: 0,
    },
    {
      id: "demo-weekend-xp",
      name: "Weekend double XP",
      description: "Turn on the weekend multiplier automatically and keep the change constrained to one config.",
      enabled: true,
      demo: true,
      trigger: {
        type: "schedule",
        schedule: "Every Friday",
        time: "18:00",
        timezone: "Game timezone",
      },
      conditions: {
        environment: "Production",
        minPlayers: 0,
        minSamples: 0,
        version: "Any version",
        holdFor: "None",
      },
      actions: [
        {
          type: "experience_config",
          configName: "XpMultiplier",
          valueType: "number",
          value: "2",
          publish: true,
        },
      ],
      execution: { mode: "automatic", cooldown: "24h", maxRuns: "1", delay: "0m" },
      safety: { rollback: "Restore after 48 hours", failure: "Pause + alert", minSample: 0 },
      lastRun: Date.now() - 6 * 24 * 60 * 60 * 1000,
      runCount: 3,
    },
    {
      id: "demo-purchase-spike",
      name: "Purchase spike",
      description: "Alert the team when completed purchases accelerate beyond the normal window.",
      enabled: false,
      demo: true,
      trigger: {
        type: "event_count",
        event: "purchase_completed",
        operator: "at_least",
        threshold: 20,
        window: "10m",
      },
      conditions: {
        environment: "Production",
        minPlayers: 25,
        minSamples: 20,
        version: "Any version",
        holdFor: "None",
      },
      actions: [
        {
          type: "discord",
          message: "{{event}} reached {{count}} in {{window}} for {{game}}.",
        },
      ],
      execution: { mode: "observe", cooldown: "1h", maxRuns: "10", delay: "0m" },
      safety: { rollback: "Not needed", failure: "Log failure", minSample: 20 },
      lastRun: null,
      runCount: 0,
    },
  ];

  const state = {
    automations: [],
    editingId: null,
    filter: "all",
    search: "",
    testing: false,
    demoRunningId: null,
  };

  function icon(name, className = "") {
    const paths = {
      spark: '<path d="M12 3c.7 4.3 3.2 6.8 7.5 7.5C15.2 11.2 12.7 13.7 12 18c-.7-4.3-3.2-6.8-7.5-7.5C8.8 9.8 11.3 7.3 12 3Z"/><path d="M19 15c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      pulse: '<path d="M3 12h4l2.2-5 4.1 10 2.4-5H21"/>',
      trend: '<path d="m4 17 5-5 3 3 7-8"/><path d="M14 7h5v5"/>',
      clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3.5 2"/>',
      release: '<path d="M5 19V5h9l5 5v9Z"/><path d="M14 5v5h5M8 14h8M8 17h5"/>',
      sliders: '<path d="M4 7h7M15 7h5M11 4v6M4 17h5M13 17h7M13 14v6"/>',
      message: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 3V7a2 2 0 0 1 2-2Z"/>',
      zap: '<path d="m13 2-8 12h7l-1 8 8-12h-7Z"/>',
      play: '<path d="m9 7 8 5-8 5Z"/>',
      edit: '<path d="m4 16-.7 4.7L8 20l11-11-4-4Z"/><path d="m13.5 6.5 4 4"/>',
      trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
      check: '<path d="m5 12 4 4 10-10"/>',
      chevron: '<path d="m9 6 6 6-6 6"/>',
      shield: '<path d="M12 3 20 6v6c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V6Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
      beaker: '<path d="M9 3h6M10 3v5l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3.5L14 8V3"/><path d="M7 16h10"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
      filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
      dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      history: '<path d="M4 7v5h5"/><path d="M5.4 16.5A8 8 0 1 0 4 12"/><path d="M12 8v4l3 2"/>',
    };
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  }

  function storageKey() {
    const universe = document.getElementById("universeSelect")?.value || "default";
    return `${STORAGE_PREFIX}:${universe}`;
  }

  function cloneDefaults() {
    return DEFAULT_AUTOMATIONS.map((automation) => structuredClone(automation));
  }

  function loadAutomations() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey()) || "null");
      state.automations = Array.isArray(stored) && stored.length ? stored : cloneDefaults();
    } catch {
      state.automations = cloneDefaults();
    }
  }

  function saveAutomations() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state.automations));
    } catch {
      // Showcase data is optional. The page still works when browser storage is unavailable.
    }
  }

  function installStyles() {
    if (document.getElementById("rosignalAutomationsStyles")) return;
    const style = document.createElement("style");
    style.id = "rosignalAutomationsStyles";
    style.textContent = `
      .automationNavGroup .navIconTile { position: relative; }
      .automationNavGroup .navIconTile::after { content: ""; position: absolute; right: 2px; top: 2px; width: 5px; height: 5px; border-radius: 999px; background: var(--green); box-shadow: 0 0 0 2px var(--sidebar); }
      .automationPage { padding: 28px 32px 48px; min-width: 0; }
      .automationPage[hidden] { display: none !important; }
      .automationHero { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
      .automationHeroCopy { max-width: 720px; }
      .automationEyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #bda9ff; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
      .automationEyebrow svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
      .automationHero h1 { margin: 0; font-size: clamp(25px, 2.5vw, 36px); line-height: 1.08; letter-spacing: -.035em; }
      .automationHero p { max-width: 650px; margin: 9px 0 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
      .automationHeroActions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
      .automationButton { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--line); border-radius: 10px; background: var(--control-bg); color: var(--text); padding: 0 14px; font: inherit; font-size: 13px; font-weight: 750; cursor: pointer; transition: transform .16s ease, border-color .16s ease, background .16s ease; }
      .automationButton:hover { transform: translateY(-1px); border-color: var(--line-strong); }
      .automationButton.primary { border-color: rgba(142, 93, 255, .72); background: linear-gradient(135deg, #7c3cff, #5a4df4); color: #fff; box-shadow: 0 8px 24px rgba(124, 60, 255, .22); }
      .automationButton.ghost { background: transparent; }
      .automationButton.danger { color: var(--danger-text); border-color: var(--danger-border); background: var(--danger-bg); }
      .automationButton.small { min-height: 34px; padding: 0 11px; font-size: 12px; }
      .automationButton.iconOnly { width: 34px; padding: 0; }
      .automationButton svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
      .automationSummaryGrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
      .automationSummaryCard { min-width: 0; border: 1px solid var(--line); border-radius: 14px; background: linear-gradient(180deg, rgba(18, 27, 51, .78), rgba(10, 16, 32, .72)); padding: 15px 16px; box-shadow: inset 0 1px 0 rgba(255,255,255,.025); }
      :root[data-theme="light"] .automationSummaryCard { background: linear-gradient(180deg, #fff, #fafbff); }
      .automationSummaryCard > span { display: block; color: var(--muted); font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
      .automationSummaryCard strong { display: block; margin-top: 7px; font-size: 23px; letter-spacing: -.025em; }
      .automationSummaryCard small { display: block; margin-top: 4px; font-size: 11px; line-height: 1.4; }
      .automationSummaryCard.access strong { font-size: 14px; color: var(--text); }
      .automationWorkspace { overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: var(--surface-soft); box-shadow: var(--shadow); }
      .automationToolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 15px 16px; border-bottom: 1px solid var(--line); }
      .automationToolbarLeft { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
      .automationSearch { position: relative; width: min(330px, 100%); }
      .automationSearch svg { position: absolute; left: 11px; top: 50%; width: 15px; height: 15px; transform: translateY(-50%); fill: none; stroke: var(--muted); stroke-width: 2; }
      .automationSearch input { width: 100%; height: 38px; border: 1px solid var(--line); border-radius: 9px; outline: none; background: var(--field-bg); color: var(--text); padding: 0 12px 0 34px; font-size: 13px; }
      .automationSearch input:focus { border-color: rgba(124, 60, 255, .78); box-shadow: 0 0 0 3px rgba(124, 60, 255, .12); }
      .automationFilter { display: inline-flex; gap: 3px; border: 1px solid var(--line); border-radius: 9px; padding: 3px; background: var(--field-bg); }
      .automationFilter button { min-height: 30px; border: 0; border-radius: 6px; background: transparent; color: var(--muted); padding: 0 10px; font: inherit; font-size: 11px; font-weight: 750; cursor: pointer; }
      .automationFilter button.active { background: var(--purple-soft); color: #cbb9ff; }
      :root[data-theme="light"] .automationFilter button.active { color: #5d2bd8; }
      .automationTableHeader, .automationRow { display: grid; grid-template-columns: minmax(210px, 1.7fr) minmax(160px, 1.25fr) minmax(160px, 1.2fr) 110px 105px 88px; gap: 14px; align-items: center; }
      .automationTableHeader { padding: 10px 16px; border-bottom: 1px solid var(--line); color: var(--muted); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
      .automationList { min-height: 210px; }
      .automationRow { min-height: 76px; padding: 13px 16px; border-bottom: 1px solid rgba(80, 99, 150, .22); transition: background .15s ease; }
      .automationRow:last-child { border-bottom: 0; }
      .automationRow:hover { background: rgba(124, 60, 255, .045); }
      .automationNameCell { min-width: 0; }
      .automationNameLine { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .automationNameLine strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
      .automationNameCell p { overflow: hidden; margin-top: 4px; color: var(--muted); font-size: 11px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
      .automationDemoBadge, .automationAccessBadge { display: inline-flex; align-items: center; border: 1px solid rgba(124, 60, 255, .32); border-radius: 999px; background: var(--purple-soft); color: #cbb9ff; padding: 2px 7px; font-size: 9px; font-weight: 850; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; }
      :root[data-theme="light"] .automationDemoBadge, :root[data-theme="light"] .automationAccessBadge { color: #5d2bd8; }
      .automationTriggerCell, .automationActionCell { display: flex; align-items: center; gap: 9px; min-width: 0; }
      .automationCellIcon { display: grid; flex: 0 0 30px; width: 30px; height: 30px; place-items: center; border: 1px solid var(--line); border-radius: 8px; background: var(--card-bg); color: #a98cff; }
      .automationCellIcon svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
      .automationCellCopy { min-width: 0; }
      .automationCellCopy strong { display: block; overflow: hidden; color: var(--text); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
      .automationCellCopy span { display: block; overflow: hidden; margin-top: 2px; color: var(--muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
      .automationModeBadge { display: inline-flex; width: fit-content; align-items: center; border: 1px solid var(--line); border-radius: 999px; padding: 4px 8px; color: var(--muted); font-size: 10px; font-weight: 800; white-space: nowrap; }
      .automationModeBadge.automatic { border-color: rgba(53, 208, 131, .32); background: rgba(53, 208, 131, .09); color: #65dda0; }
      .automationModeBadge.approval { border-color: rgba(245, 158, 11, .35); background: rgba(245, 158, 11, .08); color: #fbbf24; }
      .automationLastRun { color: var(--muted); font-size: 11px; }
      .automationRowActions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
      .automationToggle { position: relative; display: inline-flex; width: 36px; height: 20px; flex: 0 0 auto; }
      .automationToggle input { position: absolute; opacity: 0; pointer-events: none; }
      .automationToggle span { width: 100%; height: 100%; border: 1px solid var(--line); border-radius: 999px; background: rgba(118, 129, 165, .18); cursor: pointer; transition: .16s ease; }
      .automationToggle span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: #8e99b9; transition: .16s ease; }
      .automationToggle input:checked + span { border-color: rgba(53, 208, 131, .45); background: rgba(53, 208, 131, .2); }
      .automationToggle input:checked + span::after { transform: translateX(16px); background: var(--green); }
      .automationEmpty { display: grid; min-height: 260px; place-items: center; text-align: center; padding: 40px; }
      .automationEmpty svg { width: 30px; height: 30px; margin-bottom: 12px; fill: none; stroke: #a98cff; stroke-width: 1.7; }
      .automationEmpty strong { display: block; font-size: 14px; }
      .automationEmpty span { display: block; max-width: 360px; margin-top: 5px; color: var(--muted); font-size: 12px; line-height: 1.5; }
      .automationInfoStrip { display: flex; align-items: center; gap: 11px; margin-top: 14px; border: 1px solid rgba(124, 60, 255, .24); border-radius: 12px; background: rgba(124, 60, 255, .06); padding: 11px 13px; color: var(--muted); font-size: 11px; line-height: 1.45; }
      .automationInfoStrip svg { flex: 0 0 18px; width: 18px; height: 18px; fill: none; stroke: #a98cff; stroke-width: 1.8; }
      .automationDialog { position: fixed; inset: 0; z-index: 150; display: grid; place-items: center; padding: 24px; }
      .automationDialog[hidden] { display: none !important; }
      .automationDialogBackdrop { position: absolute; inset: 0; border: 0; background: rgba(1, 5, 15, .72); backdrop-filter: blur(8px); cursor: default; }
      .automationDialogCard { position: relative; display: flex; flex-direction: column; width: min(960px, calc(100vw - 32px)); max-height: min(900px, calc(100vh - 32px)); overflow: hidden; border: 1px solid var(--line-strong); border-radius: 18px; background: color-mix(in srgb, var(--surface-soft) 96%, transparent); box-shadow: 0 30px 100px rgba(0,0,0,.5); }
      .automationDialogHeader { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 20px 22px 17px; border-bottom: 1px solid var(--line); }
      .automationDialogHeader span { display: block; color: #a98cff; font-size: 10px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
      .automationDialogHeader h2 { margin: 4px 0 0; font-size: 20px; letter-spacing: -.02em; }
      .automationDialogHeader p { margin: 5px 0 0; color: var(--muted); font-size: 11px; }
      .automationDialogBody { overflow: auto; padding: 18px 22px 24px; }
      .automationBuilderIntro { display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px; margin-bottom: 14px; }
      .automationField, .automationMiniField { display: grid; gap: 6px; min-width: 0; }
      .automationField > span, .automationMiniField > span { color: var(--muted); font-size: 10px; font-weight: 750; }
      .automationField input, .automationField select, .automationField textarea, .automationMiniField input, .automationMiniField select, .automationMiniField textarea { width: 100%; min-height: 38px; border: 1px solid var(--line); border-radius: 9px; outline: none; background: var(--field-bg); color: var(--text); padding: 8px 10px; font: inherit; font-size: 12px; }
      .automationField textarea, .automationMiniField textarea { min-height: 68px; resize: vertical; line-height: 1.45; }
      .automationField input:focus, .automationField select:focus, .automationField textarea:focus, .automationMiniField input:focus, .automationMiniField select:focus, .automationMiniField textarea:focus { border-color: rgba(124, 60, 255, .78); box-shadow: 0 0 0 3px rgba(124, 60, 255, .1); }
      .automationBuilderSection { margin-top: 12px; border: 1px solid var(--line); border-radius: 13px; background: var(--card-bg); }
      .automationBuilderSectionHeader { display: flex; align-items: center; gap: 11px; padding: 13px 14px; border-bottom: 1px solid rgba(80,99,150,.25); }
      .automationStepNumber { display: grid; width: 26px; height: 26px; flex: 0 0 26px; place-items: center; border: 1px solid rgba(124,60,255,.4); border-radius: 8px; background: var(--purple-soft); color: #cbb9ff; font-size: 11px; font-weight: 850; }
      :root[data-theme="light"] .automationStepNumber { color: #5d2bd8; }
      .automationBuilderSectionHeader strong { display: block; font-size: 12px; }
      .automationBuilderSectionHeader span:not(.automationStepNumber) { display: block; margin-top: 2px; color: var(--muted); font-size: 10px; }
      .automationBuilderSectionBody { padding: 14px; }
      .automationFieldGrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .automationFieldGrid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .automationFieldGrid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .automationConditionNote { display: flex; gap: 8px; align-items: flex-start; margin-top: 11px; color: var(--muted); font-size: 10px; line-height: 1.45; }
      .automationConditionNote svg { width: 14px; height: 14px; flex: 0 0 14px; fill: none; stroke: #a98cff; stroke-width: 1.8; }
      .automationActionStack { display: grid; gap: 9px; }
      .automationActionCard { border: 1px solid var(--line); border-radius: 11px; background: var(--surface-soft); padding: 11px; }
      .automationActionCardHeader { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
      .automationActionCardHeader > div { display: flex; align-items: center; gap: 8px; }
      .automationActionCardHeader strong { font-size: 11px; }
      .automationActionCardHeader span { color: var(--muted); font-size: 9px; }
      .automationActionTypeIcon { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid var(--line); border-radius: 8px; color: #a98cff; }
      .automationActionTypeIcon svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; }
      .automationAddAction { width: 100%; margin-top: 9px; border-style: dashed; background: transparent; }
      .automationModeCards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; margin-bottom: 11px; }
      .automationModeCard { position: relative; display: block; cursor: pointer; }
      .automationModeCard input { position: absolute; opacity: 0; pointer-events: none; }
      .automationModeCard span { display: block; min-height: 74px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-soft); padding: 11px; transition: .16s ease; }
      .automationModeCard b { display: block; color: var(--text); font-size: 11px; }
      .automationModeCard small { display: block; margin-top: 4px; color: var(--muted); font-size: 9px; line-height: 1.4; }
      .automationModeCard input:checked + span { border-color: rgba(124,60,255,.68); background: var(--purple-soft); box-shadow: inset 0 0 0 1px rgba(124,60,255,.18); }
      .automationTestPanel { margin-top: 12px; border: 1px solid rgba(53,208,131,.22); border-radius: 12px; background: rgba(53,208,131,.045); padding: 12px; }
      .automationTestPanelHeader { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .automationTestPanelHeader strong { font-size: 11px; }
      .automationTestPanelHeader span { display: block; margin-top: 2px; color: var(--muted); font-size: 9px; }
      .automationTestResults { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; margin-top: 10px; }
      .automationTestResult { border: 1px solid rgba(53,208,131,.2); border-radius: 9px; background: rgba(5, 14, 23, .32); padding: 8px; }
      .automationTestResult b { display: block; color: #65dda0; font-size: 11px; }
      .automationTestResult span { display: block; margin-top: 2px; color: var(--muted); font-size: 9px; }
      .automationDialogFooter { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 22px; border-top: 1px solid var(--line); background: rgba(5,10,23,.36); }
      :root[data-theme="light"] .automationDialogFooter { background: rgba(247,248,252,.9); }
      .automationDialogFooter p { margin: 0; color: var(--muted); font-size: 10px; }
      .automationDialogFooterActions { display: flex; gap: 8px; }
      .automationToast { position: fixed; right: 22px; bottom: 22px; z-index: 200; display: flex; max-width: 420px; align-items: center; gap: 10px; border: 1px solid rgba(53,208,131,.35); border-radius: 11px; background: rgba(10,18,32,.96); color: var(--text); padding: 11px 13px; box-shadow: 0 18px 60px rgba(0,0,0,.42); font-size: 11px; transform: translateY(12px); opacity: 0; pointer-events: none; transition: .18s ease; }
      :root[data-theme="light"] .automationToast { background: #fff; }
      .automationToast.visible { transform: translateY(0); opacity: 1; }
      .automationToast svg { width: 17px; height: 17px; fill: none; stroke: var(--green); stroke-width: 2; }
      .automationConfirmDialog { position: fixed; inset: 0; z-index: 190; display: grid; place-items: center; padding: 20px; }
      .automationConfirmDialog[hidden] { display: none !important; }
      .automationConfirmCard { position: relative; width: min(420px, calc(100vw - 32px)); border: 1px solid var(--line-strong); border-radius: 15px; background: var(--surface-soft); padding: 18px; box-shadow: 0 25px 90px rgba(0,0,0,.5); }
      .automationConfirmCard h3 { margin: 0; font-size: 15px; }
      .automationConfirmCard p { margin: 7px 0 0; color: var(--muted); font-size: 11px; line-height: 1.5; }
      .automationConfirmActions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
      @media (max-width: 1180px) {
        .automationTableHeader, .automationRow { grid-template-columns: minmax(210px, 1.6fr) minmax(150px, 1.15fr) minmax(150px, 1.1fr) 105px 88px; }
        .automationTableHeader > :nth-child(5), .automationRow > :nth-child(5) { display: none; }
        .automationSummaryGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 860px) {
        .automationPage { padding: 22px 18px 42px; }
        .automationHero { align-items: stretch; flex-direction: column; }
        .automationHeroActions { justify-content: flex-start; }
        .automationToolbar { align-items: stretch; flex-direction: column; }
        .automationToolbarLeft { align-items: stretch; flex-direction: column; }
        .automationSearch { width: 100%; }
        .automationTableHeader { display: none; }
        .automationRow { grid-template-columns: 1fr auto; gap: 11px; padding: 15px; }
        .automationTriggerCell, .automationActionCell, .automationRow > .automationModeBadge, .automationLastRun { grid-column: 1 / -1; }
        .automationTriggerCell, .automationActionCell { border-top: 1px solid rgba(80,99,150,.2); padding-top: 9px; }
        .automationRowActions { grid-column: 2; grid-row: 1; }
        .automationNameCell p { white-space: normal; }
        .automationBuilderIntro, .automationFieldGrid, .automationFieldGrid.two, .automationFieldGrid.three { grid-template-columns: 1fr 1fr; }
        .automationModeCards { grid-template-columns: 1fr; }
        .automationTestResults { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 560px) {
        .automationPage { padding: 18px 12px 36px; }
        .automationSummaryGrid { grid-template-columns: 1fr 1fr; gap: 8px; }
        .automationSummaryCard { padding: 12px; }
        .automationSummaryCard strong { font-size: 19px; }
        .automationHeroActions { display: grid; grid-template-columns: 1fr 1fr; }
        .automationHeroActions .automationButton { width: 100%; }
        .automationFilter { width: 100%; }
        .automationFilter button { flex: 1; padding: 0 5px; }
        .automationBuilderIntro, .automationFieldGrid, .automationFieldGrid.two, .automationFieldGrid.three { grid-template-columns: 1fr; }
        .automationDialog { padding: 0; }
        .automationDialogCard { width: 100%; max-height: 100vh; height: 100vh; border-radius: 0; }
        .automationDialogHeader, .automationDialogBody, .automationDialogFooter { padding-left: 14px; padding-right: 14px; }
        .automationDialogFooter { align-items: stretch; flex-direction: column; }
        .automationDialogFooterActions { display: grid; grid-template-columns: 1fr 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function createNav() {
    if (document.querySelector('[data-rosignal-automations-link]')) return;
    const integrations = document.getElementById("integrationsNavLabel")?.closest(".navGroup");
    if (!integrations?.parentElement) return;

    const group = document.createElement("section");
    group.className = "navGroup automationNavGroup";
    group.setAttribute("aria-labelledby", "automationNavLabel");
    group.innerHTML = `
      <h2 class="navGroupLabel" id="automationNavLabel">Automation</h2>
      <div class="navGroupLinks">
        <a href="#automations" data-rosignal-automations-link>
          <span class="navIconTile" aria-hidden="true">${icon("spark", "navIcon")}</span>
          <span>Automations</span>
        </a>
      </div>
    `;
    integrations.parentElement.insertBefore(group, integrations);
  }

  function createPage() {
    if (document.querySelector('[data-view-panel="automations"]')) return;
    const main = document.querySelector(".dashboardMain");
    if (!main) return;
    const page = document.createElement("section");
    page.className = "viewPage automationPage";
    page.dataset.viewPanel = VIEW;
    page.hidden = true;
    page.innerHTML = `
      <div class="automationHero">
        <div class="automationHeroCopy">
          <span class="automationEyebrow">${icon("spark")} Live operations</span>
          <h1>Automations</h1>
          <p>Turn game signals into controlled actions. Define what RoSignal watches, add guardrails, then choose whether it only observes, asks for approval, or acts automatically.</p>
        </div>
        <div class="automationHeroActions">
          <button class="automationButton ghost" type="button" data-automation-demo>${icon("play")} Run demo</button>
          <button class="automationButton primary" type="button" data-automation-new>${icon("plus")} New automation</button>
        </div>
      </div>

      <section class="automationSummaryGrid" data-automation-summary></section>

      <section class="automationWorkspace">
        <div class="automationToolbar">
          <div class="automationToolbarLeft">
            <label class="automationSearch">
              ${icon("filter")}
              <input type="search" placeholder="Search automations" aria-label="Search automations" data-automation-search>
            </label>
            <div class="automationFilter" aria-label="Automation filter">
              <button type="button" data-automation-filter="all" class="active">All</button>
              <button type="button" data-automation-filter="active">Active</button>
              <button type="button" data-automation-filter="paused">Paused</button>
            </div>
          </div>
          <span class="automationDemoBadge">Showcase mode</span>
        </div>
        <div class="automationTableHeader" aria-hidden="true">
          <span>Automation</span><span>Trigger</span><span>Actions</span><span>Mode</span><span>Last run</span><span></span>
        </div>
        <div class="automationList" data-automation-list></div>
      </section>

      <div class="automationInfoStrip">
        ${icon("shield")}
        <span><strong>Built for safe rollout.</strong> Experience Config actions are presented with read/write access, minimum sample sizes, cooldowns, approval mode, and rollback behavior before automatic control is enabled.</span>
      </div>

      <div class="automationDialog" data-automation-dialog hidden>
        <button class="automationDialogBackdrop" type="button" aria-label="Close automation builder" data-automation-close></button>
        <section class="automationDialogCard" role="dialog" aria-modal="true" aria-labelledby="automationDialogTitle">
          <header class="automationDialogHeader">
            <div>
              <span>Automation builder</span>
              <h2 id="automationDialogTitle" data-automation-dialog-title>New automation</h2>
              <p>Build the rule from signal to action. Nothing in this showcase changes the existing dashboard systems.</p>
            </div>
            <button class="automationButton iconOnly ghost" type="button" aria-label="Close" data-automation-close>${icon("close")}</button>
          </header>
          <form data-automation-form>
            <div class="automationDialogBody">
              <div class="automationBuilderIntro">
                <label class="automationField"><span>Name</span><input name="name" maxlength="80" required placeholder="Protect new release"></label>
                <label class="automationField"><span>Description</span><input name="description" maxlength="140" placeholder="What this automation protects or improves"></label>
              </div>

              <section class="automationBuilderSection">
                <header class="automationBuilderSectionHeader"><span class="automationStepNumber">1</span><div><strong>When</strong><span>Choose the signal that starts evaluation.</span></div></header>
                <div class="automationBuilderSectionBody">
                  <div class="automationFieldGrid">
                    <label class="automationMiniField"><span>Trigger</span><select name="triggerType" data-trigger-type><option value="event_count">Event count</option><option value="metric_change">Metric change</option><option value="schedule">Schedule</option><option value="release">New release</option></select></label>
                    <div data-trigger-fields style="display: contents"></div>
                  </div>
                </div>
              </section>

              <section class="automationBuilderSection">
                <header class="automationBuilderSectionHeader"><span class="automationStepNumber">2</span><div><strong>If</strong><span>Limit when RoSignal is allowed to act.</span></div></header>
                <div class="automationBuilderSectionBody">
                  <div class="automationFieldGrid">
                    <label class="automationMiniField"><span>Environment</span><select name="environment"><option>Production</option><option>Studio</option><option>Any environment</option></select></label>
                    <label class="automationMiniField"><span>Minimum unique players</span><input name="minPlayers" type="number" min="0" max="1000000" value="50"></label>
                    <label class="automationMiniField"><span>Minimum samples</span><input name="minSamples" type="number" min="0" max="1000000" value="100"></label>
                    <label class="automationMiniField"><span>Version</span><select name="version"><option>Any version</option><option>Newest release</option><option>Previous release</option></select></label>
                  </div>
                  <div class="automationFieldGrid two" style="margin-top:10px">
                    <label class="automationMiniField"><span>Condition must remain true</span><select name="holdFor"><option>None</option><option value="2m">2 minutes</option><option value="5m">5 minutes</option><option value="15m">15 minutes</option><option value="30m">30 minutes</option></select></label>
                    <label class="automationMiniField"><span>Additional filter</span><input name="extraFilter" maxlength="100" placeholder="Optional, e.g. place = Lobby"></label>
                  </div>
                  <div class="automationConditionNote">${icon("shield")} <span>Minimum samples and hold time reduce false triggers. Keep them higher for anything that can change a live experience.</span></div>
                </div>
              </section>

              <section class="automationBuilderSection">
                <header class="automationBuilderSectionHeader"><span class="automationStepNumber">3</span><div><strong>Then</strong><span>Run one or more actions in order.</span></div></header>
                <div class="automationBuilderSectionBody">
                  <div class="automationActionStack" data-action-stack></div>
                  <button class="automationButton automationAddAction" type="button" data-add-action>${icon("plus")} Add another action</button>
                </div>
              </section>

              <section class="automationBuilderSection">
                <header class="automationBuilderSectionHeader"><span class="automationStepNumber">4</span><div><strong>How</strong><span>Control execution, rate limits, and recovery.</span></div></header>
                <div class="automationBuilderSectionBody">
                  <div class="automationModeCards">
                    <label class="automationModeCard"><input type="radio" name="mode" value="observe"><span><b>Observe only</b><small>Record when the rule would run, but never execute actions.</small></span></label>
                    <label class="automationModeCard"><input type="radio" name="mode" value="approval" checked><span><b>Require approval</b><small>Prepare the actions and wait for a person to approve them.</small></span></label>
                    <label class="automationModeCard"><input type="radio" name="mode" value="automatic"><span><b>Automatic</b><small>Execute immediately when the rule and safety checks pass.</small></span></label>
                  </div>
                  <div class="automationFieldGrid">
                    <label class="automationMiniField"><span>Cooldown</span><select name="cooldown"><option value="5m">5 minutes</option><option value="15m">15 minutes</option><option value="1h" selected>1 hour</option><option value="6h">6 hours</option><option value="24h">24 hours</option></select></label>
                    <label class="automationMiniField"><span>Maximum runs / day</span><input name="maxRuns" type="number" min="1" max="1000" value="10"></label>
                    <label class="automationMiniField"><span>Delay</span><select name="delay"><option value="0m">Immediately</option><option value="1m">1 minute</option><option value="5m">5 minutes</option><option value="15m">15 minutes</option></select></label>
                    <label class="automationMiniField"><span>On action failure</span><select name="failure"><option>Pause + alert</option><option>Retry once</option><option>Log failure</option></select></label>
                  </div>
                  <div class="automationFieldGrid two" style="margin-top:10px">
                    <label class="automationMiniField"><span>Rollback behavior</span><select name="rollback"><option>Keep previous revision</option><option>Restore after 30 minutes</option><option>Restore after 2 hours</option><option>Restore after 24 hours</option><option>Not needed</option></select></label>
                    <label class="automationMiniField"><span>Safety minimum samples</span><input name="safetyMinSample" type="number" min="0" max="1000000" value="100"></label>
                  </div>

                  <div class="automationTestPanel">
                    <div class="automationTestPanelHeader">
                      <div><strong>Test against demo history</strong><span>Preview how often this rule would have triggered over the last 14 days.</span></div>
                      <button class="automationButton small ghost" type="button" data-test-rule>${icon("beaker")} Test rule</button>
                    </div>
                    <div class="automationTestResults" data-test-results hidden></div>
                  </div>
                </div>
              </section>
            </div>
            <footer class="automationDialogFooter">
              <p>Showcase rules are stored only in this browser.</p>
              <div class="automationDialogFooterActions"><button class="automationButton ghost" type="button" data-automation-close>Cancel</button><button class="automationButton primary" type="submit">Save automation</button></div>
            </footer>
          </form>
        </section>
      </div>

      <div class="automationConfirmDialog" data-delete-dialog hidden>
        <button class="automationDialogBackdrop" type="button" data-delete-cancel aria-label="Cancel delete"></button>
        <section class="automationConfirmCard" role="dialog" aria-modal="true">
          <h3>Delete automation?</h3><p data-delete-copy>This showcase automation will be removed from this browser.</p>
          <div class="automationConfirmActions"><button class="automationButton ghost" type="button" data-delete-cancel>Cancel</button><button class="automationButton danger" type="button" data-delete-confirm>Delete</button></div>
        </section>
      </div>

      <div class="automationToast" data-automation-toast>${icon("check")} <span></span></div>
    `;
    main.appendChild(page);
  }

  function formatTime(timestamp) {
    if (!timestamp) return "Never";
    const diff = Date.now() - Number(timestamp);
    if (diff < 60_000) return "Just now";
    if (diff < 60 * 60_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
    if (diff < 24 * 60 * 60_000) return `${Math.max(1, Math.floor(diff / 3_600_000))}h ago`;
    return `${Math.max(1, Math.floor(diff / 86_400_000))}d ago`;
  }

  function triggerSummary(trigger) {
    switch (trigger?.type) {
      case "event_count":
        return { title: trigger.event || "Event", detail: `${humanOperator(trigger.operator)} ${trigger.threshold || 1} / ${trigger.window || "15m"}` };
      case "metric_change":
        return { title: trigger.metric || "Metric", detail: `${trigger.direction || "decreases"} ${trigger.percent || 10}% / ${trigger.window || "30m"}` };
      case "schedule":
        return { title: trigger.schedule || "Scheduled", detail: `${trigger.time || "18:00"} · ${trigger.timezone || "Game timezone"}` };
      case "release":
        return { title: "New release detected", detail: trigger.grace || "Watch immediately" };
      default:
        return { title: "Trigger", detail: "Configured" };
    }
  }

  function humanOperator(value) {
    return value === "at_most" ? "≤" : value === "equals" ? "=" : "≥";
  }

  function actionSummary(actions) {
    const list = Array.isArray(actions) ? actions : [];
    if (!list.length) return { title: "No action", detail: "Add an action", type: "experience_config" };
    const first = list[0];
    const meta = ACTION_META[first.type] || ACTION_META.experience_config;
    let detail = meta.access;
    if (first.type === "experience_config") detail = `${first.configName || "Config"} → ${String(first.value ?? "value")}`;
    if (first.type === "roblox_action") detail = first.actionKey || "Registered action";
    if (first.type === "discord") detail = "Send alert";
    if (list.length > 1) detail += ` +${list.length - 1}`;
    return { title: meta.label, detail, type: first.type };
  }

  function modeLabel(mode) {
    if (mode === "automatic") return "Automatic";
    if (mode === "approval") return "Approval";
    return "Observe";
  }

  function renderSummary() {
    const summary = document.querySelector("[data-automation-summary]");
    if (!summary) return;
    const active = state.automations.filter((item) => item.enabled).length;
    const automatic = state.automations.filter((item) => item.enabled && item.execution?.mode === "automatic").length;
    const runs = state.automations.reduce((total, item) => total + Number(item.runCount || 0), 0);
    summary.innerHTML = `
      <article class="automationSummaryCard"><span>Active</span><strong>${active}</strong><small>${state.automations.length - active} paused</small></article>
      <article class="automationSummaryCard"><span>Automatic</span><strong>${automatic}</strong><small>Others require approval or observe</small></article>
      <article class="automationSummaryCard"><span>Demo runs</span><strong>${runs}</strong><small>Stored in this browser</small></article>
      <article class="automationSummaryCard access"><span>Config access</span><strong>Experience read + write</strong><small>Used by Experience Config actions</small></article>
    `;
  }

  function renderList() {
    const list = document.querySelector("[data-automation-list]");
    if (!list) return;
    const query = state.search.trim().toLowerCase();
    const filtered = state.automations.filter((automation) => {
      if (state.filter === "active" && !automation.enabled) return false;
      if (state.filter === "paused" && automation.enabled) return false;
      if (!query) return true;
      return `${automation.name} ${automation.description} ${JSON.stringify(automation.trigger)} ${JSON.stringify(automation.actions)}`.toLowerCase().includes(query);
    });

    if (!filtered.length) {
      list.innerHTML = `<div class="automationEmpty">${icon("spark")}<div><strong>No automations match</strong><span>Clear the filter or create a new rule for this game.</span></div></div>`;
      return;
    }

    list.innerHTML = filtered.map((automation) => {
      const trigger = triggerSummary(automation.trigger);
      const action = actionSummary(automation.actions);
      const triggerMeta = TRIGGER_META[automation.trigger?.type] || TRIGGER_META.event_count;
      const actionMeta = ACTION_META[action.type] || ACTION_META.experience_config;
      const running = state.demoRunningId === automation.id;
      return `
        <article class="automationRow" data-automation-id="${escapeAttr(automation.id)}">
          <div class="automationNameCell">
            <div class="automationNameLine"><strong>${escapeHtml(automation.name)}</strong>${automation.demo ? '<span class="automationDemoBadge">Demo</span>' : ""}</div>
            <p>${escapeHtml(automation.description || "No description")}</p>
          </div>
          <div class="automationTriggerCell"><span class="automationCellIcon">${icon(triggerMeta.icon)}</span><span class="automationCellCopy"><strong>${escapeHtml(trigger.title)}</strong><span>${escapeHtml(trigger.detail)}</span></span></div>
          <div class="automationActionCell"><span class="automationCellIcon">${icon(actionMeta.icon)}</span><span class="automationCellCopy"><strong>${escapeHtml(action.title)}</strong><span>${escapeHtml(action.detail)}</span></span></div>
          <span class="automationModeBadge ${escapeAttr(automation.execution?.mode || "observe")}">${escapeHtml(modeLabel(automation.execution?.mode))}</span>
          <span class="automationLastRun">${running ? "Running…" : escapeHtml(formatTime(automation.lastRun))}</span>
          <div class="automationRowActions">
            <label class="automationToggle" title="${automation.enabled ? "Pause" : "Enable"}"><input type="checkbox" ${automation.enabled ? "checked" : ""} data-toggle-automation="${escapeAttr(automation.id)}"><span></span></label>
            <button class="automationButton small iconOnly ghost" type="button" title="Run demo" aria-label="Run demo" data-run-automation="${escapeAttr(automation.id)}">${icon("play")}</button>
            <button class="automationButton small iconOnly ghost" type="button" title="Edit" aria-label="Edit automation" data-edit-automation="${escapeAttr(automation.id)}">${icon("edit")}</button>
          </div>
        </article>`;
    }).join("");
  }

  function render() {
    renderSummary();
    renderList();
  }

  function renderTriggerFields(trigger = {}) {
    const form = document.querySelector("[data-automation-form]");
    const target = form?.querySelector("[data-trigger-fields]");
    const type = form?.elements.triggerType?.value || trigger.type || "event_count";
    if (!target) return;

    if (type === "event_count") {
      target.innerHTML = `
        <label class="automationMiniField"><span>Event</span><input name="event" list="automationEventSuggestions" value="${escapeAttr(trigger.event || "purchase_completed")}" placeholder="purchase_completed"><datalist id="automationEventSuggestions"><option value="player_died"><option value="player_left"><option value="purchase_completed"><option value="tutorial_completed"><option value="boss_defeated"></datalist></label>
        <label class="automationMiniField"><span>Count is</span><select name="operator"><option value="at_least" ${trigger.operator !== "at_most" ? "selected" : ""}>At least</option><option value="at_most" ${trigger.operator === "at_most" ? "selected" : ""}>At most</option></select></label>
        <label class="automationMiniField"><span>Threshold / window</span><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><input name="threshold" type="number" min="1" value="${escapeAttr(trigger.threshold || 20)}"><select name="window"><option value="5m">5m</option><option value="10m" ${trigger.window === "10m" ? "selected" : ""}>10m</option><option value="15m" ${!trigger.window || trigger.window === "15m" ? "selected" : ""}>15m</option><option value="1h" ${trigger.window === "1h" ? "selected" : ""}>1h</option></select></div></label>`;
    } else if (type === "metric_change") {
      target.innerHTML = `
        <label class="automationMiniField"><span>Metric</span><select name="metric"><option ${trigger.metric === "Tutorial completion" ? "selected" : ""}>Tutorial completion</option><option ${trigger.metric === "Purchase conversion" ? "selected" : ""}>Purchase conversion</option><option ${trigger.metric === "Session length" ? "selected" : ""}>Session length</option><option ${trigger.metric === "Players online" ? "selected" : ""}>Players online</option><option ${trigger.metric === "Funnel conversion" ? "selected" : ""}>Funnel conversion</option></select></label>
        <label class="automationMiniField"><span>Change</span><select name="direction"><option value="decreases" ${trigger.direction !== "increases" ? "selected" : ""}>Decreases by</option><option value="increases" ${trigger.direction === "increases" ? "selected" : ""}>Increases by</option></select></label>
        <label class="automationMiniField"><span>Percent / window</span><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><input name="percent" type="number" min="1" max="100" value="${escapeAttr(trigger.percent || 15)}"><select name="window"><option value="15m">15m</option><option value="30m" ${!trigger.window || trigger.window === "30m" ? "selected" : ""}>30m</option><option value="1h" ${trigger.window === "1h" ? "selected" : ""}>1h</option><option value="6h" ${trigger.window === "6h" ? "selected" : ""}>6h</option></select></div></label>`;
    } else if (type === "schedule") {
      target.innerHTML = `
        <label class="automationMiniField"><span>Schedule</span><select name="schedule"><option ${trigger.schedule === "Every day" ? "selected" : ""}>Every day</option><option ${!trigger.schedule || trigger.schedule === "Every Friday" ? "selected" : ""}>Every Friday</option><option ${trigger.schedule === "Every Saturday" ? "selected" : ""}>Every Saturday</option><option ${trigger.schedule === "Every weekend" ? "selected" : ""}>Every weekend</option></select></label>
        <label class="automationMiniField"><span>Time</span><input name="time" type="time" value="${escapeAttr(trigger.time || "18:00")}"></label>
        <label class="automationMiniField"><span>Timezone</span><select name="timezone"><option>Game timezone</option><option>UTC</option><option>Eastern Time</option></select></label>`;
    } else {
      target.innerHTML = `
        <label class="automationMiniField"><span>Release</span><select name="releaseScope"><option>Any new production version</option><option>Primary place only</option><option>Selected place</option></select></label>
        <label class="automationMiniField"><span>Grace period</span><select name="grace"><option>Watch immediately</option><option>Wait 5 minutes</option><option>Wait 15 minutes</option><option>Wait 30 minutes</option></select></label>
        <label class="automationMiniField"><span>Compare against</span><select name="baseline"><option>Previous release</option><option>Previous 7-day baseline</option><option>Same weekday baseline</option></select></label>`;
    }
  }

  function renderActions(actions = []) {
    const stack = document.querySelector("[data-action-stack]");
    if (!stack) return;
    const safeActions = actions.length ? actions : [{ type: "experience_config", configName: "XpMultiplier", valueType: "number", value: "2", publish: true }];
    stack.innerHTML = safeActions.map((action, index) => actionEditor(action, index)).join("");
  }

  function actionEditor(action, index) {
    const type = action.type || "experience_config";
    const meta = ACTION_META[type] || ACTION_META.experience_config;
    let fields = "";
    if (type === "experience_config") {
      fields = `
        <div class="automationFieldGrid">
          <label class="automationMiniField"><span>Config</span><input data-action-field="configName" value="${escapeAttr(action.configName || "XpMultiplier")}" placeholder="XpMultiplier"></label>
          <label class="automationMiniField"><span>Value type</span><select data-action-field="valueType"><option value="boolean" ${action.valueType === "boolean" ? "selected" : ""}>Boolean</option><option value="number" ${action.valueType === "number" ? "selected" : ""}>Number</option><option value="string" ${action.valueType === "string" ? "selected" : ""}>String</option><option value="json" ${action.valueType === "json" ? "selected" : ""}>JSON</option></select></label>
          <label class="automationMiniField"><span>New value</span><input data-action-field="value" value="${escapeAttr(String(action.value ?? "2"))}" placeholder="2"></label>
          <label class="automationMiniField"><span>Publish</span><select data-action-field="publish"><option value="true" ${action.publish !== false ? "selected" : ""}>Publish change</option><option value="false" ${action.publish === false ? "selected" : ""}>Save draft only</option></select></label>
        </div>`;
    } else if (type === "discord") {
      fields = `<label class="automationMiniField"><span>Message</span><textarea data-action-field="message" maxlength="500" placeholder="{{event}} crossed the threshold.">${escapeHtml(action.message || "{{event}} crossed the threshold for {{game}}.")}</textarea></label>`;
    } else {
      fields = `<div class="automationFieldGrid two"><label class="automationMiniField"><span>Registered action key</span><input data-action-field="actionKey" value="${escapeAttr(action.actionKey || "event.start")}" placeholder="event.start"></label><label class="automationMiniField"><span>Parameters (JSON)</span><input data-action-field="parameters" value="${escapeAttr(action.parameters || '{"eventId":"double_xp"}')}" placeholder='{"eventId":"double_xp"}'></label></div>`;
    }
    return `
      <div class="automationActionCard" data-action-index="${index}" data-action-type="${escapeAttr(type)}">
        <div class="automationActionCardHeader">
          <div><span class="automationActionTypeIcon">${icon(meta.icon)}</span><div><strong>Action ${index + 1}</strong><span>${escapeHtml(meta.access)}</span></div></div>
          <div style="display:flex;gap:6px;align-items:center">
            <select class="automationButton small" data-action-type-select aria-label="Action type"><option value="experience_config" ${type === "experience_config" ? "selected" : ""}>Experience Config</option><option value="discord" ${type === "discord" ? "selected" : ""}>Discord alert</option><option value="roblox_action" ${type === "roblox_action" ? "selected" : ""}>Roblox action</option></select>
            ${index > 0 ? `<button class="automationButton small iconOnly ghost" type="button" aria-label="Remove action" data-remove-action>${icon("trash")}</button>` : ""}
          </div>
        </div>
        ${fields}
      </div>`;
  }

  function collectActions() {
    return [...document.querySelectorAll("[data-action-index]")].map((card) => {
      const type = card.dataset.actionType || "experience_config";
      const action = { type };
      card.querySelectorAll("[data-action-field]").forEach((field) => {
        let value = field.value;
        if (field.dataset.actionField === "publish") value = value === "true";
        action[field.dataset.actionField] = value;
      });
      return action;
    });
  }

  function getFormValue(form, name, fallback = "") {
    const field = form.elements[name];
    return field ? field.value : fallback;
  }

  function collectTrigger(form) {
    const type = getFormValue(form, "triggerType", "event_count");
    if (type === "event_count") return { type, event: getFormValue(form, "event", "custom_event"), operator: getFormValue(form, "operator", "at_least"), threshold: Number(getFormValue(form, "threshold", 1)), window: getFormValue(form, "window", "15m") };
    if (type === "metric_change") return { type, metric: getFormValue(form, "metric", "Tutorial completion"), direction: getFormValue(form, "direction", "decreases"), percent: Number(getFormValue(form, "percent", 15)), window: getFormValue(form, "window", "30m") };
    if (type === "schedule") return { type, schedule: getFormValue(form, "schedule", "Every Friday"), time: getFormValue(form, "time", "18:00"), timezone: getFormValue(form, "timezone", "Game timezone") };
    return { type, releaseScope: getFormValue(form, "releaseScope", "Any new production version"), grace: getFormValue(form, "grace", "Watch immediately"), baseline: getFormValue(form, "baseline", "Previous release") };
  }

  function openBuilder(automation = null) {
    const dialog = document.querySelector("[data-automation-dialog]");
    const form = dialog?.querySelector("[data-automation-form]");
    if (!dialog || !form) return;
    state.editingId = automation?.id || null;
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    dialog.querySelector("[data-automation-dialog-title]").textContent = automation ? "Edit automation" : "New automation";
    form.reset();
    form.elements.name.value = automation?.name || "";
    form.elements.description.value = automation?.description || "";
    form.elements.triggerType.value = automation?.trigger?.type || "event_count";
    form.elements.environment.value = automation?.conditions?.environment || "Production";
    form.elements.minPlayers.value = automation?.conditions?.minPlayers ?? 50;
    form.elements.minSamples.value = automation?.conditions?.minSamples ?? 100;
    form.elements.version.value = automation?.conditions?.version || "Any version";
    form.elements.holdFor.value = automation?.conditions?.holdFor || "None";
    form.elements.extraFilter.value = automation?.conditions?.extraFilter || "";
    const mode = automation?.execution?.mode || "approval";
    const modeInput = form.querySelector(`input[name="mode"][value="${CSS.escape(mode)}"]`);
    if (modeInput) modeInput.checked = true;
    form.elements.cooldown.value = automation?.execution?.cooldown || "1h";
    form.elements.maxRuns.value = automation?.execution?.maxRuns || "10";
    form.elements.delay.value = automation?.execution?.delay || "0m";
    form.elements.failure.value = automation?.safety?.failure || "Pause + alert";
    form.elements.rollback.value = automation?.safety?.rollback || "Keep previous revision";
    form.elements.safetyMinSample.value = automation?.safety?.minSample ?? 100;
    renderTriggerFields(automation?.trigger || {});
    renderActions(automation?.actions || []);
    const results = form.querySelector("[data-test-results]");
    if (results) { results.hidden = true; results.innerHTML = ""; }
    setTimeout(() => form.elements.name.focus(), 40);
  }

  function closeBuilder() {
    const dialog = document.querySelector("[data-automation-dialog]");
    if (dialog) dialog.hidden = true;
    document.body.style.overflow = "";
    state.editingId = null;
  }

  function saveBuilder(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const existing = state.automations.find((item) => item.id === state.editingId);
    const automation = {
      id: existing?.id || `automation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name: getFormValue(form, "name").trim(),
      description: getFormValue(form, "description").trim(),
      enabled: existing?.enabled ?? true,
      demo: existing?.demo ?? false,
      trigger: collectTrigger(form),
      conditions: {
        environment: getFormValue(form, "environment", "Production"),
        minPlayers: Number(getFormValue(form, "minPlayers", 0)),
        minSamples: Number(getFormValue(form, "minSamples", 0)),
        version: getFormValue(form, "version", "Any version"),
        holdFor: getFormValue(form, "holdFor", "None"),
        extraFilter: getFormValue(form, "extraFilter", "").trim(),
      },
      actions: collectActions(),
      execution: {
        mode: form.querySelector('input[name="mode"]:checked')?.value || "approval",
        cooldown: getFormValue(form, "cooldown", "1h"),
        maxRuns: getFormValue(form, "maxRuns", "10"),
        delay: getFormValue(form, "delay", "0m"),
      },
      safety: {
        rollback: getFormValue(form, "rollback", "Keep previous revision"),
        failure: getFormValue(form, "failure", "Pause + alert"),
        minSample: Number(getFormValue(form, "safetyMinSample", 100)),
      },
      lastRun: existing?.lastRun || null,
      runCount: existing?.runCount || 0,
    };
    if (!automation.name) return;
    if (existing) state.automations = state.automations.map((item) => item.id === existing.id ? automation : item);
    else state.automations.unshift(automation);
    saveAutomations();
    render();
    closeBuilder();
    toast(existing ? "Automation updated." : "Automation created in showcase mode.");
  }

  function addAction() {
    const actions = collectActions();
    if (actions.length >= 5) { toast("Up to five actions can be shown in this builder."); return; }
    actions.push({ type: "experience_config", configName: "FeatureEnabled", valueType: "boolean", value: "true", publish: true });
    renderActions(actions);
  }

  function switchActionType(select) {
    const card = select.closest("[data-action-index]");
    if (!card) return;
    const actions = collectActions();
    const index = Number(card.dataset.actionIndex);
    actions[index] = select.value === "discord"
      ? { type: "discord", message: "{{event}} crossed the threshold for {{game}}." }
      : select.value === "roblox_action"
        ? { type: "roblox_action", actionKey: "event.start", parameters: '{"eventId":"double_xp"}' }
        : { type: "experience_config", configName: "XpMultiplier", valueType: "number", value: "2", publish: true };
    renderActions(actions);
  }

  function removeAction(button) {
    const card = button.closest("[data-action-index]");
    if (!card) return;
    const actions = collectActions();
    actions.splice(Number(card.dataset.actionIndex), 1);
    renderActions(actions);
  }

  function testRule() {
    const form = document.querySelector("[data-automation-form]");
    const results = form?.querySelector("[data-test-results]");
    if (!form || !results || state.testing) return;
    state.testing = true;
    const button = form.querySelector("[data-test-rule]");
    if (button) button.textContent = "Testing…";
    setTimeout(() => {
      const seed = [...getFormValue(form, "name", "automation")].reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const triggers = 1 + (seed % 4);
      const blocked = seed % 3;
      const last = 2 + (seed % 9);
      results.innerHTML = `
        <div class="automationTestResult"><b>${triggers}</b><span>Would trigger</span></div>
        <div class="automationTestResult"><b>${blocked}</b><span>Blocked by guardrails</span></div>
        <div class="automationTestResult"><b>${last} days ago</b><span>Most recent match</span></div>
        <div class="automationTestResult"><b>14 days</b><span>Demo history tested</span></div>`;
      results.hidden = false;
      state.testing = false;
      if (button) button.innerHTML = `${icon("beaker")} Test again`;
    }, 480);
  }

  function toggleAutomation(id, enabled) {
    const automation = state.automations.find((item) => item.id === id);
    if (!automation) return;
    automation.enabled = enabled;
    saveAutomations();
    render();
    toast(enabled ? `${automation.name} enabled.` : `${automation.name} paused.`);
  }

  function runDemo(id) {
    const automation = state.automations.find((item) => item.id === id);
    if (!automation || state.demoRunningId) return;
    state.demoRunningId = id;
    renderList();
    setTimeout(() => {
      automation.lastRun = Date.now();
      automation.runCount = Number(automation.runCount || 0) + 1;
      state.demoRunningId = null;
      saveAutomations();
      render();
      const action = actionSummary(automation.actions);
      toast(`Demo run complete: ${action.title} · ${action.detail}.`);
    }, DEMO_RUN_MS);
  }

  function runFeaturedDemo() {
    const preferred = state.automations.find((item) => item.id === "demo-weekend-xp") || state.automations[0];
    if (!preferred) return openBuilder();
    runDemo(preferred.id);
  }

  let pendingDeleteId = null;
  function requestDelete(id) {
    const automation = state.automations.find((item) => item.id === id);
    const dialog = document.querySelector("[data-delete-dialog]");
    if (!automation || !dialog) return;
    pendingDeleteId = id;
    dialog.querySelector("[data-delete-copy]").textContent = `“${automation.name}” will be removed from this browser. Your existing RoSignal features are unaffected.`;
    dialog.hidden = false;
  }

  function cancelDelete() {
    const dialog = document.querySelector("[data-delete-dialog]");
    if (dialog) dialog.hidden = true;
    pendingDeleteId = null;
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    state.automations = state.automations.filter((item) => item.id !== pendingDeleteId);
    saveAutomations();
    render();
    cancelDelete();
    closeBuilder();
    toast("Automation deleted.");
  }

  let toastTimer = null;
  function toast(message) {
    const node = document.querySelector("[data-automation-toast]");
    if (!node) return;
    node.querySelector("span").textContent = message;
    node.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("visible"), 2600);
  }

  function setActive() {
    const active = window.location.hash.replace(/^#/, "") === VIEW;
    const page = document.querySelector('[data-view-panel="automations"]');
    const navLink = document.querySelector("[data-rosignal-automations-link]");
    if (!page || !navLink) return;

    if (active) {
      document.querySelectorAll("[data-view-panel]").forEach((panel) => { panel.hidden = panel !== page; });
      document.querySelectorAll(".sideNav a.active").forEach((link) => link.classList.remove("active"));
      navLink.classList.add("active");
      document.body.dataset.activeView = VIEW;
      const topbar = document.querySelector(".topbar");
      if (topbar) topbar.hidden = true;
      page.hidden = false;
      render();
    } else {
      page.hidden = true;
      navLink.classList.remove("active");
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function bindEvents() {
    const page = document.querySelector('[data-view-panel="automations"]');
    if (!page) return;
    page.addEventListener("click", (event) => {
      const target = event.target.closest("button, input, select");
      if (!target) return;
      if (target.matches("[data-automation-new]")) openBuilder();
      if (target.matches("[data-automation-demo]")) runFeaturedDemo();
      if (target.matches("[data-automation-close]")) closeBuilder();
      if (target.matches("[data-add-action]")) addAction();
      if (target.matches("[data-remove-action]")) removeAction(target);
      if (target.matches("[data-test-rule]")) testRule();
      if (target.matches("[data-edit-automation]")) {
        const automation = state.automations.find((item) => item.id === target.dataset.editAutomation);
        if (automation) openBuilder(automation);
      }
      if (target.matches("[data-run-automation]")) runDemo(target.dataset.runAutomation);
      if (target.matches("[data-delete-automation]")) requestDelete(target.dataset.deleteAutomation);
      if (target.matches("[data-delete-cancel]")) cancelDelete();
      if (target.matches("[data-delete-confirm]")) confirmDelete();
      if (target.matches("[data-automation-filter]")) {
        state.filter = target.dataset.automationFilter;
        page.querySelectorAll("[data-automation-filter]").forEach((button) => button.classList.toggle("active", button === target));
        renderList();
      }
    });
    page.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-trigger-type]")) renderTriggerFields({ type: target.value });
      if (target.matches("[data-action-type-select]")) switchActionType(target);
      if (target.matches("[data-toggle-automation]")) toggleAutomation(target.dataset.toggleAutomation, target.checked);
    });
    page.querySelector("[data-automation-search]")?.addEventListener("input", (event) => {
      state.search = event.currentTarget.value;
      renderList();
    });
    page.querySelector("[data-automation-form]")?.addEventListener("submit", saveBuilder);
    page.querySelector("[data-automation-form]")?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeBuilder();
    });

    const footer = page.querySelector(".automationDialogFooterActions");
    const save = footer?.querySelector('button[type="submit"]');
    if (footer && save) {
      const del = document.createElement("button");
      del.className = "automationButton danger";
      del.type = "button";
      del.dataset.builderDelete = "";
      del.innerHTML = `${icon("trash")} Delete`;
      del.hidden = true;
      footer.insertBefore(del, footer.firstChild);
      del.addEventListener("click", () => state.editingId && requestDelete(state.editingId));
      const observer = new MutationObserver(() => { del.hidden = !state.editingId || document.querySelector("[data-automation-dialog]")?.hidden; });
      observer.observe(document.querySelector("[data-automation-dialog]"), { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  function watchUniverse() {
    const select = document.getElementById("universeSelect");
    if (!select) return;
    select.addEventListener("change", () => {
      loadAutomations();
      if (window.location.hash === "#automations") render();
    });
  }

  function init() {
    installStyles();
    createNav();
    createPage();
    loadAutomations();
    bindEvents();
    watchUniverse();
    setTimeout(setActive, 0);
    window.addEventListener("hashchange", () => setTimeout(setActive, 0));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

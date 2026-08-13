window.RoSignalComponents = window.RoSignalComponents || {};

window.RoSignalComponents.mount = function mount(slotName, element) {
  const slot = document.querySelector('[data-component-slot="' + slotName + '"]');
  if (!slot) throw new Error('Missing component slot: ' + slotName);
  slot.replaceWith(element);
};

(function refreshVersionedStyles() {
  const landing = document.querySelector('link[href^="/landing.css"]');
  if (landing) landing.href = '/landing.css?v=20260813-1';
})();

(function loadProductFlowStyles() {
  if (document.querySelector('link[data-rosignal-product-flow]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/components/product-flow.css?v=20260813-2';
  link.dataset.rosignalProductFlow = 'true';
  document.head.append(link);
})();

(function organizeDashboardNavigation() {
  const nav = document.querySelector('.sideNav');
  if (!nav) return;

  const setupGroup = document.querySelector('#generalNavLabel')?.closest('.navGroup');
  const analyzeGroup = document.querySelector('#analyticsNavLabel')?.closest('.navGroup');
  const automateGroup = document.querySelector('#integrationsNavLabel')?.closest('.navGroup');
  const operateGroup = document.querySelector('#betaFeaturesNavLabel')?.closest('.navGroup');
  const adminGroup = document.querySelector('#adminNavGroup');

  if (document.querySelector('#generalNavLabel')) document.querySelector('#generalNavLabel').textContent = 'Setup';
  if (document.querySelector('#analyticsNavLabel')) document.querySelector('#analyticsNavLabel').textContent = 'Analyze';
  if (document.querySelector('#integrationsNavLabel')) document.querySelector('#integrationsNavLabel').textContent = 'Automate';
  if (document.querySelector('#betaFeaturesNavLabel')) document.querySelector('#betaFeaturesNavLabel').textContent = 'Operate';

  const labels = {
    connect: 'Setup',
    discord: 'Alerts',
    'roblox-live': 'Live Actions',
    moderation: 'Moderation',
    'player-data': 'Player Data',
  };
  for (const [view, label] of Object.entries(labels)) {
    const link = nav.querySelector('[data-dashboard-view="' + view + '"]');
    const text = link?.querySelector('span:last-child');
    if (text) text.textContent = label;
  }

  const operateLinks = operateGroup?.querySelector('.navGroupLinks');
  if (operateLinks) {
    for (const view of ['player-data', 'moderation', 'assets', 'groups']) {
      const link = operateLinks.querySelector('[data-dashboard-view="' + view + '"]');
      if (link) operateLinks.append(link);
    }
  }

  for (const group of [setupGroup, analyzeGroup, operateGroup, automateGroup, adminGroup]) {
    if (group) nav.append(group);
  }
})();

const gameRequiredViews = new Set([
  'overview',
  'events',
  'funnels',
  'ai-runs',
  'chat',
  'discord',
  'roblox-live',
  'moderation',
  'player-data',
  'assets',
]);

const productViewLabels = {
  overview: 'Map',
  events: 'Events',
  funnels: 'Funnels',
  'ai-runs': 'AI Features',
  chat: 'Chats',
  discord: 'Alerts',
  'roblox-live': 'Live Actions',
  moderation: 'Moderation',
  'player-data': 'Player Data',
  assets: 'Assets',
};

function showSetupReason(view) {
  const notice = document.querySelector('#connectRouteNotice');
  if (!notice) return;
  const label = productViewLabels[view] || 'that tool';
  notice.textContent = `Connect a game first to open ${label}.`;
  notice.hidden = false;
}

function clearSetupReason() {
  const notice = document.querySelector('#connectRouteNotice');
  if (!notice) return;
  notice.textContent = '';
  notice.hidden = true;
}

function openSetupFor(view, options = {}) {
  if (options.silent) clearSetupReason();
  else showSetupReason(view);
  document.querySelector('[data-dashboard-view="connect"]')?.click();
}

(function guardGameScopedNavigation() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('[data-dashboard-view]');
    const view = link?.dataset.dashboardView || '';
    if (!gameRequiredViews.has(view)) return;
    if (!window.isDashboardAuthenticated?.()) return;
    if (String(window.getSelectedUniverseId?.() || '')) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openSetupFor(view);
  }, true);

  window.addEventListener('dashboard:universeChanged', (event) => {
    if (String(event.detail?.universeId || '')) clearSetupReason();
  });
})();

(function routeFirstTimeSetup() {
  let routed = false;
  window.addEventListener('dashboard:analyticsReady', (event) => {
    if (routed || !window.isDashboardAuthenticated?.()) return;
    if (String(event.detail?.universeId || '')) return;

    const view = (window.location.hash || '#overview').replace(/^#/, '') || 'overview';
    if (view !== 'overview' && !gameRequiredViews.has(view)) return;
    routed = true;
    openSetupFor(view, { silent: view === 'overview' });
  });
})();

(function improveViewCopy() {
  const copy = {
    discord: ['Alerts', 'Send Discord alerts when tracked conditions happen.'],
    'roblox-live': ['Live Actions', 'Trigger Roblox server actions from schedules or game conditions.'],
    moderation: ['Moderation', 'Manage live players, bans, and moderation history.'],
    'player-data': ['Player Data', 'Read and update player data through your connected Studio or server bridge.'],
  };

  window.addEventListener('dashboard:viewChanged', (event) => {
    const next = copy[event.detail?.view];
    if (!next) return;
    const title = document.querySelector('#pageTitle');
    const subtitle = document.querySelector('#pageSubtitle');
    if (title) title.textContent = next[0];
    if (subtitle) subtitle.textContent = next[1];
  });
})();

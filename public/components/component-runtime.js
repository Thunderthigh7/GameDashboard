window.RoSignalComponents = window.RoSignalComponents || {};

const PRODUCT_VIEWS = Object.freeze({
  connect: { label: 'Setup', section: 'setup', requiresGame: false },
  overview: { label: 'Map', section: 'analyze', requiresGame: true },
  events: { label: 'Events', section: 'analyze', requiresGame: true },
  funnels: { label: 'Funnels', section: 'analyze', requiresGame: true },
  chat: { label: 'Chats', section: 'analyze', requiresGame: true },
  'player-data': {
    label: 'Player Data',
    section: 'operate',
    requiresGame: true,
    subtitle: 'Read and update player data through your connected Studio or server bridge.',
  },
  moderation: {
    label: 'Moderation',
    section: 'operate',
    requiresGame: true,
    subtitle: 'Manage live players, bans, and moderation history.',
  },
  assets: { label: 'Assets', section: 'operate', requiresGame: true },
  groups: { label: 'Groups', section: 'operate', requiresGame: false },
  discord: {
    label: 'Alerts',
    section: 'automate',
    requiresGame: true,
    subtitle: 'Send Discord alerts when tracked conditions happen.',
  },
  'roblox-live': {
    label: 'Live Actions',
    section: 'automate',
    requiresGame: true,
    subtitle: 'Trigger Roblox server actions from schedules or game conditions.',
  },
  'ai-runs': { label: 'AI Features', section: 'admin', requiresGame: true },
  admin: { label: 'Dashboard Users', section: 'admin', requiresGame: false },
  usage: { label: 'Usage', section: 'account', requiresGame: false },
});

const NAV_SECTIONS = Object.freeze([
  { labelId: 'generalNavLabel', label: 'Setup', views: ['connect'] },
  { labelId: 'analyticsNavLabel', label: 'Analyze', views: ['overview', 'events', 'funnels', 'chat'] },
  { labelId: 'betaFeaturesNavLabel', label: 'Operate', views: ['player-data', 'moderation', 'assets', 'groups'] },
  { labelId: 'integrationsNavLabel', label: 'Automate', views: ['discord', 'roblox-live'] },
]);

window.RoSignalComponents.productViews = PRODUCT_VIEWS;

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

  for (const [view, config] of Object.entries(PRODUCT_VIEWS)) {
    const link = nav.querySelector('[data-dashboard-view="' + view + '"]');
    const text = link?.querySelector('span:last-child');
    if (text) text.textContent = config.label;
  }

  for (const section of NAV_SECTIONS) {
    const label = document.querySelector('#' + section.labelId);
    const group = label?.closest('.navGroup');
    const links = group?.querySelector('.navGroupLinks');
    if (!group || !links) continue;

    label.textContent = section.label;
    for (const view of section.views) {
      const link = links.querySelector('[data-dashboard-view="' + view + '"]');
      if (link) links.append(link);
    }
    nav.append(group);
  }

  const adminGroup = document.querySelector('#adminNavGroup');
  if (adminGroup) nav.append(adminGroup);
})();

function viewRequiresGame(view) {
  return Boolean(PRODUCT_VIEWS[view]?.requiresGame);
}

function showSetupReason(view) {
  const notice = document.querySelector('#connectRouteNotice');
  if (!notice) return;
  const label = PRODUCT_VIEWS[view]?.label || 'that tool';
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
    if (!viewRequiresGame(view)) return;
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
    if (view !== 'overview' && !viewRequiresGame(view)) return;
    routed = true;
    openSetupFor(view, { silent: view === 'overview' });
  });
})();

(function improveViewCopy() {
  window.addEventListener('dashboard:viewChanged', (event) => {
    const config = PRODUCT_VIEWS[event.detail?.view];
    if (!config?.subtitle) return;
    const title = document.querySelector('#pageTitle');
    const subtitle = document.querySelector('#pageSubtitle');
    if (title) title.textContent = config.label;
    if (subtitle) subtitle.textContent = config.subtitle;
  });
})();

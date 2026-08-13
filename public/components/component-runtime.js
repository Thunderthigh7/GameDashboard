window.RoSignalComponents = window.RoSignalComponents || {};

window.RoSignalComponents.mount = function mount(slotName, element) {
  const slot = document.querySelector('[data-component-slot="' + slotName + '"]');
  if (!slot) throw new Error('Missing component slot: ' + slotName);
  slot.replaceWith(element);
};

(function loadProductFlowStyles() {
  if (document.querySelector('link[data-rosignal-product-flow]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/components/product-flow.css?v=20260813-1';
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

(function routeFirstTimeSetup() {
  let routed = false;
  window.addEventListener('dashboard:analyticsReady', (event) => {
    if (routed || !window.isDashboardAuthenticated?.()) return;
    if (String(event.detail?.universeId || '')) return;
    const hash = window.location.hash || '#overview';
    if (hash !== '#overview' && hash !== '') return;
    const connectLink = document.querySelector('[data-dashboard-view="connect"]');
    if (!connectLink) return;
    routed = true;
    connectLink.click();
  });
})();

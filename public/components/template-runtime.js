window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.mountHTML = function mountHTML(slotName, markup) {
  const template = document.createElement('template');
  template.innerHTML = String(markup).trim();
  const element = template.content.firstElementChild;
  if (!element) throw new Error('Empty component: ' + slotName);
  window.RoSignalComponents.mount(slotName, element);
};

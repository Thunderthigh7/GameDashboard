window.RoSignalComponents = window.RoSignalComponents || {};
window.RoSignalComponents.mount = function mount(slotName, element) {
  const slot = document.querySelector('[data-component-slot="' + slotName + '"]');
  if (!slot) throw new Error('Missing component slot: ' + slotName);
  slot.replaceWith(element);
};

// Physical movement positions are identical on QWERTY and AZERTY keyboards.
// Only their printed letters differ. Never mix key letters into held-key state:
// Shift, Caps Lock, or a layout switch must not leave a movement key stuck.
export const movementCodes = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);

export function installKeyboardLabels() {
  const label = document.getElementById('movement-keys');
  let revision = 0;
  function show(azerty) {
    label.textContent = azerty ? 'Z Q S D' : 'W A S D';
  }
  async function refresh() {
    const requested = ++revision;
    try {
      const map = await navigator.keyboard?.getLayoutMap();
      if (requested !== revision || !map) return;
      const forward = map.get('KeyW')?.toLowerCase();
      const left = map.get('KeyA')?.toLowerCase();
      if (forward === 'z' && left === 'q') show(true);
      else if (forward === 'w' && left === 'a') show(false);
    } catch { /* Unsupported or denied: learn from actual key events below. */ }
  }
  addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const key = event.key.toLowerCase();
    const pairs = {KeyW:['w','z'], KeyA:['a','q'], KeyQ:['q','a'], KeyZ:['z','w']};
    const pair = pairs[event.code];
    if (pair?.includes(key)) {
      revision++;
      show(key === pair[1]);
    }
  });
  navigator.keyboard?.addEventListener?.('layoutchange', refresh);
  addEventListener('focus', refresh);
  refresh();
}

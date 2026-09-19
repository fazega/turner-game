const SEEN = 'golden-harbour-welcome-seen-v1';
let shown = false;

export function welcomePlayer() {
  if (shown) return;
  try { if (localStorage.getItem(SEEN) === '1') return; } catch {}
  shown = true;
  try { localStorage.setItem(SEEN, '1'); } catch {}
  const message = document.createElement('div');
  message.id = 'welcome-message';
  message.setAttribute('role', 'status');
  message.textContent = 'Welcome here... Looks like Mira has a mission for you.';
  document.body.append(message);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animation = message.animate(reduced ? [
    {opacity: 1}, {opacity: 1, offset: .99}, {opacity: 0}
  ] : [
    {opacity: 0}, {opacity: 1, offset: .1},
    {opacity: 1, offset: .4}, {opacity: 0}
  ], {duration: 10000, easing: 'linear', fill: 'forwards'});
  animation.addEventListener('finish', () => message.remove(), {once: true});
}

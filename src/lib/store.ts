// Shared mutable state between DOM (Lenis/GSAP) and the WebGL scene. Read in useFrame, never in render.
export const store = {
  scroll: 0,
  velocity: 0,
  heroProgress: 0, // 0..1 how far past the hero
  portrait: 0, // 0 scattered → 1 assembled
  stars: 0, // starfield reveal
  mouse: { x: 0, y: 0, active: false }, // NDC -1..1
  introDone: false,
  listeners: new Set<() => void>(),
};

export function onIntroDone(cb: () => void) {
  if (store.introDone) cb();
  else store.listeners.add(cb);
  return () => store.listeners.delete(cb);
}

export function finishIntro() {
  if (store.introDone) return;
  store.introDone = true;
  store.listeners.forEach((l) => l());
  store.listeners.clear();
}

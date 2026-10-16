// Fully local, synthesized audio (no files): soft ambient drone + UI click blips.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

function ensure() {
  if (ctx) return;
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const freqs = [55, 82.4, 110.2];
  freqs.forEach((f, i) => {
    const o = ctx!.createOscillator();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const g = ctx!.createGain();
    g.gain.value = 0.05 / (i + 1);
    const lfo = ctx!.createOscillator();
    lfo.frequency.value = 0.07 + i * 0.05;
    const lg = ctx!.createGain();
    lg.gain.value = 0.02;
    lfo.connect(lg).connect(g.gain);
    o.connect(g).connect(master!);
    o.start();
    lfo.start();
  });
}

export function setSound(on: boolean) {
  enabled = on;
  ensure();
  ctx!.resume();
  master!.gain.linearRampToValueAtTime(on ? 0.6 : 0, ctx!.currentTime + 0.8);
}

export function click() {
  if (!enabled || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(1400, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);
  g.gain.setValueAtTime(0.08, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.12);
}

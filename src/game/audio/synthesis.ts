export type Track = `map-${0 | 1 | 2}` | `battle-${0 | 1 | 2}`;
export const EFFECTS = ['select', 'place', 'move', 'whirlpool', 'shock', 'remove', 'block', 'charm', 'reward', 'heal', 'victory', 'defeat'] as const;
export type Effect = typeof EFFECTS[number];
export const SAMPLE_RATE = 22050;
const hz = (note: number) => 440 * 2 ** ((note - 69) / 12);

// Original scores and instruments. Every voice fades to zero before the loop seam.
function tone(out: Float32Array, start: number, length: number, frequency: number, gain: number, bright = false, end = frequency): void {
  const offset = Math.round(start * SAMPLE_RATE), count = Math.round(length * SAMPLE_RATE);
  let phase = 0;
  for (let i = 0; i < count && offset + i < out.length; i++) {
    const p = i / count, envelope = Math.min(i / (SAMPLE_RATE * .012), 1) * (1 - p) ** 2;
    phase += 2 * Math.PI * (frequency + (end - frequency) * p) / SAMPLE_RATE;
    out[offset + i] += gain * envelope * (Math.sin(phase) + (bright ? .22 * Math.sin(phase * 3) : 0));
  }
}

export function synthesizeMusic(track: Track): Float32Array {
  const area = Number(track.at(-1)), battle = track.startsWith('battle');
  const beat = 60 / (battle ? 108 + area * 12 : [84, 76, 72][area]);
  const out = new Float32Array(Math.round(32 * beat * SAMPLE_RATE));
  const roots = battle ? [45, 41, 48, 43] : [[48, 53, 55, 48], [45, 41, 48, 43], [45, 46, 41, 40]][area];
  const motifs = battle ? [0, 7, 12, 10, 7, 3, 5, 7] : [[12, 16, 19, 16, 14, 19, 21, 19], [12, 19, 15, 22, 19, 15, 14, 19], [12, 13, 19, 15, 13, 12, 10, 7]][area];
  for (let b = 0; b < 32; b++) {
    const root = roots[Math.floor(b / 8)];
    if (b % 2 === 0) tone(out, b * beat, beat * 1.8, hz(root), .10);
    const interval = battle || area > 0 ? 3 : 4;
    if (b % 4 === 0) for (const n of [0, interval, 7]) tone(out, b * beat, beat * 3.8, hz(root + n + 12), .032);
    tone(out, b * beat, beat * .85, hz(root + motifs[b % 8] + 12), battle ? .075 : .065, true);
    if (battle) {
      tone(out, b * beat, .15, 120, .13, false, 38);
      if (b % 2) tone(out, b * beat, .075, 1700, .035, true, 700);
      if (area >= 1) for (const half of [0, .5]) tone(out, (b + half) * beat, .035, 4200, .018, true, 2600);
      if (area >= 2) tone(out, (b + .5) * beat, beat * .4, hz(root + motifs[b % 8]), .075, true);
    }
  }
  return out;
}

export function synthesizeEffect(effect: Effect): Float32Array {
  const recipes: Record<Effect, [number, number, number]> = {
    select: [620, 820, .07], place: [240, 420, .16], move: [190, 520, .18],
    whirlpool: [720, 130, .40], shock: [1200, 180, .22], remove: [210, 45, .30],
    block: [120, 100, .12], charm: [440, 880, .32], reward: [660, 990, .28],
    heal: [330, 660, .45], victory: [523, 784, .7], defeat: [294, 147, .7],
  };
  const [from, to, seconds] = recipes[effect];
  const out = new Float32Array(Math.ceil((seconds + .02) * SAMPLE_RATE));
  tone(out, 0, seconds, from, .24, effect === 'shock' || effect === 'block', to);
  if (['victory', 'reward', 'heal', 'charm'].includes(effect)) tone(out, seconds / 3, seconds / 2, to * 1.25, .10);
  return out;
}

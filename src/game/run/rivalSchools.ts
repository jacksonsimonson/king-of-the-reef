import type { FishCard, EdgeEffect } from '../data/starterFish.ts';
import { random } from './maps.ts';

export const RIVAL_STYLES = {
  balanced: { name: 'Mixed current', description: 'A varied local school with no strong specialty.' },
  holders: { name: 'Reef keepers', description: 'Favors protection and reef scoring, backed by positioners.' },
  hunters: { name: 'Hunting party', description: 'Favors predators and disruption, backed by positioners.' },
  currents: { name: 'Current riders', description: 'Favors movement and displacement to contest the reefs.' },
} as const;
export type RivalStyle = keyof typeof RIVAL_STYLES;
type Card = Pick<FishCard, 'edges' | 'ability'>;
const moving = ['standard', 'double', 'hook', 'wave', 'swap', 'ram', 'follow-current', 'bounce', 'dive'];
export function hasPositioning(card: Card): boolean { return card.edges.some(e => moving.includes(e.effect)); }
/** Revision-scoped recruitment heuristic, not an objective power or rarity score.
 * Coverage and useful innate tools count; repeated effects have diminishing returns.
 * Keep this independent of inventory load budgets, which are not strength ratings. */
export function rivalRating(card: Card): number {
  const values: Record<EdgeEffect, number> = { standard: 1, double: 1.2, hook: 1.2, wave: 1.3, swap: 1.2, ram: 1.1, 'follow-current': 1.2, bounce: 1.2, dive: 1.3, weak: .65, spines: .55, shock: .8, 'bigger-fish': 1 };
  const seen = new Set<string>();
  let score = 1;
  for (const edge of card.edges) { score += values[edge.effect] * (seen.has(edge.effect) ? .55 : 1); seen.add(edge.effect); }
  if (card.ability) score += ['reefborn', 'sovereign', 'reef-network', 'slipstream'].includes(card.ability) ? 1.4 : .8;
  return score;
}
export function styleWeight(card: Card, style: RivalStyle): number {
  const effects = card.edges.map(e => e.effect), ability = card.ability ?? '';
  const favored = style === 'holders'
    ? effects.includes('weak') || ['anchor', 'bulwark', 'shoal', 'reef-network', 'sovereign', 'reefborn', 'inflate', 'borrowed-armor'].includes(ability)
    : style === 'hunters' ? effects.some(e => ['bigger-fish', 'shock'].includes(e)) || ['pack-hunt', 'focused-strike', 'ambush', 'snare-line'].includes(ability)
    : style === 'currents' ? effects.some(e => ['hook', 'swap', 'wave', 'dive', 'bounce', 'follow-current'].includes(e)) || ['towline', 'slipstream', 'true-north', 'mimicry'].includes(ability) : false;
  return favored ? 2 : 1;
}
export function rivalStyle(seed: string, nodeId: string): RivalStyle {
  const styles = Object.keys(RIVAL_STYLES) as RivalStyle[];
  return styles[Math.floor(random(`${seed}:${nodeId}:style`)() * styles.length)];
}
export function schoolRating(cards: Card[]): number { return cards.reduce((n, c) => n + rivalRating(c), 0) / cards.length; }
/** All local cards remain eligible. No replacement until the enabled pool is exhausted.
 * Compare a bounded set of random candidates to avoid wildly uneven encounter budgets. */
export function weightedRivalSchool(pool: FishCard[], seed: string, style: RivalStyle, elite = false): FishCard[] {
  if (!pool.length) throw new Error('Rival region has no enabled creatures');
  const rng = random(seed), ratings = pool.map(rivalRating);
  const mean = schoolRating(pool), deviation = Math.sqrt(ratings.reduce((n, v) => n + (v - mean) ** 2, 0) / pool.length);
  const target = mean + (elite ? .45 : 0) * deviation;
  let best: FishCard[] = [], distance = Infinity;
  for (let attempt = 0; attempt < 16; attempt++) {
    const cards: FishCard[] = []; let available = [...pool];
    while (cards.length < 10) {
      if (!available.length) available = [...pool];
      const weights = available.map(c => styleWeight(c, style) * (elite ? Math.max(.4, 1 + (rivalRating(c) - mean) / Math.max(1, deviation)) : 1));
      let roll = rng() * weights.reduce((a, b) => a + b, 0), index = weights.length - 1;
      for (let i = 0; i < weights.length; i++) { roll -= weights[i]; if (roll < 0) { index = i; break; } }
      cards.push(available.splice(index, 1)[0]);
    }
    const shortage = Math.max(0, Math.min(3, pool.filter(hasPositioning).length) - cards.filter(hasPositioning).length);
    const gap = Math.abs(schoolRating(cards) - target) + shortage * 10;
    if (gap < distance) { best = cards; distance = gap; }
  }
  return best.map((c, i) => ({ ...c, edges: c.edges.map(e => ({ ...e })), id: `rival-${i}`, owner: 'rival', condition: 'healthy' }));
}

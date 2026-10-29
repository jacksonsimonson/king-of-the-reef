import { STARTERS, type FishCard } from './data/starterFish.ts';
import { REGIONS } from './run/maps.ts';
import { reefRarity } from './data/reefPool.ts';
import { oceanRarity } from './data/oceanPool.ts';
import { bermudaRarity } from './data/bermudaPool.ts';

export const JOURNAL_KEY = 'king-of-the-reef-journal-v1';
export const ROLE_HELP = {
  Positioner: 'Push, pull or swap creatures to arrange reef control. Check every direction for friendly-fire risks.',
  Defender: 'Use defensive sides or abilities to hold a position; exposed sides still matter.',
  Retaliator: 'Threaten retaliation with Spines. Spines are not a defense; inspect which pushes trigger them.',
  Hunter: 'Threaten kills with Bite. Line up an undefended target.',
  Disruptor: 'Disable edges with Shock to open routes for later plays.',
  Mobile: 'Move itself with Dive, Bounce or Follow Current to reach useful positions.',
  Support: 'Use information, reserve control or protection to help your school.',
  Scorer: 'Use a scoring or direct-reef-placement ability to contest reefs.',
} as const;
export type SchoolRole = keyof typeof ROLE_HELP;
/** A browsing aid derived from actual mechanics, not the planned design-role inventory. */
export function creatureRole(fish: Pick<FishCard, 'edges' | 'ability'>): SchoolRole {
  if (['shoal', 'reef-network'].includes(fish.ability ?? '')) return 'Scorer';
  if (['inflate', 'borrowed-armor', 'afterimage'].includes(fish.ability ?? '')) return 'Defender';
  if (['sonar', 'relay', 'grooming', 'muster', 'gentle-giant'].includes(fish.ability ?? '')) return 'Support';
  if (['false-lure', 'snare-line'].includes(fish.ability ?? '')) return 'Disruptor';
  if (fish.ability === 'sovereign' || fish.ability === 'reefborn') return 'Scorer';
  if (fish.ability === 'anchor' || fish.ability === 'bulwark') return 'Defender';
  if (fish.ability === 'revelation' || fish.ability === 'rally' || fish.ability === 'escort') return 'Support';
  if (fish.ability === 'ambush') return 'Disruptor';
  const effects = fish.edges.map(e => e.effect);
  if (effects.includes('bigger-fish')) return 'Hunter';
  if (effects.includes('shock')) return 'Disruptor';
  if (effects.some(e => ['dive', 'bounce', 'follow-current'].includes(e))) return 'Mobile';
  if (effects.filter(e => e === 'spines').length > effects.length / 2) return 'Retaliator';
  if (effects.filter(e => e === 'weak').length > effects.length / 2) return 'Defender';
  return 'Positioner';
}
export function creatureRegions(texture: string): number[] {
  return REGIONS.flatMap((region, index) => (region.pool as readonly string[]).includes(texture) ? [index] : []);
}
export function creatureRarity(texture: string): string {
  return reefRarity(texture) ?? oceanRarity(texture) ?? bermudaRarity(texture) ?? 'Unrated';
}
export function mergeDiscoveries(saved: unknown, textures: readonly string[]): string[] {
  const ids = new Set([...(Array.isArray(saved) ? saved.filter(v => typeof v === 'string') : []), ...textures]);
  return STARTERS.filter(f => ids.has(f.texture)).map(f => f.texture);
}
let sessionDiscoveries: string[] = [];
export function recordDiscoveries(textures: readonly string[] = []): { textures: string[]; saved: boolean } {
  let stored: unknown;
  try { stored = JSON.parse(localStorage.getItem(JOURNAL_KEY) ?? '[]'); } catch { stored = []; }
  sessionDiscoveries = mergeDiscoveries(stored, [...sessionDiscoveries, ...textures]);
  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(sessionDiscoveries)); return { textures: [...sessionDiscoveries], saved: true }; }
  catch { return { textures: [...sessionDiscoveries], saved: false }; }
}
export interface InspectionFilter { search: string; region: string; role: string; health: string; rarity: string }
export function filterCreatures<T extends FishCard>(fish: readonly T[], filter: InspectionFilter): T[] {
  const query = filter.search.trim().toLowerCase();
  return fish.filter(f => (!query || `${f.name} ${f.species} ${f.ability ?? ''} ${f.edges.map(e => e.effect === 'weak' ? 'shield' : e.effect === 'bigger-fish' ? 'bite' : e.effect).join(' ')}`.toLowerCase().includes(query))
    && (!filter.region || creatureRegions(f.texture).includes(Number(filter.region)))
    && (!filter.role || creatureRole(f) === filter.role)
    && (!filter.health || f.condition === filter.health)
    && (!filter.rarity || creatureRarity(f.texture) === filter.rarity))
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

import type { RegionId } from './run/maps.ts';
export type Difficulty = 'beginner' | 'tactical' | 'expert';
export interface BattleRules {
  size: 5 | 6 | 7; plays: 5 | 6 | 7; difficulty: Difficulty;
  region: RegionId; seed: string; legacyTerrain?: boolean;
}
export const DIFFICULTIES: Difficulty[] = ['beginner', 'tactical', 'expert'];
export function regionalRules(region: number, seed: string): BattleRules {
  return { size: (5 + region) as 5 | 6 | 7, plays: (5 + region) as 5 | 6 | 7,
    difficulty: DIFFICULTIES[region], region: (['shoreline', 'ocean', 'bermuda'] as const)[region], seed };
}
export function validRules(value: unknown): value is BattleRules {
  if (!value || typeof value !== 'object') return false;
  const r = value as BattleRules;
  return [5, 6, 7].includes(r.size) && [5, 6, 7].includes(r.plays) && DIFFICULTIES.includes(r.difficulty)
    && ['shoreline', 'ocean', 'bermuda'].includes(r.region) && typeof r.seed === 'string' && r.seed.length <= 300
    && (r.legacyTerrain === undefined || r.legacyTerrain === true && r.size === 5 && r.plays === 5);
}
export function scoringReefs(size = 5): ReadonlySet<number> {
  return new Set([Math.floor(size / 2), Math.floor(size / 2) * size + 1, (size - 2) * size + size - 2]);
}

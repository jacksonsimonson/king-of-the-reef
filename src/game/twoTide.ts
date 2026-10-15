import type { RegionId } from './run/maps.ts';
export interface TideScore { player: number; rival: number }
/** Preserve regional progression independently of custom board or Classic play settings. */
export function tidePlayLimit(region: RegionId): number { return {shoreline: 4, ocean: 5, bermuda: 6}[region]; }
export function combinedScore(scores: readonly TideScore[]): TideScore {
  return scores.reduce((total, score) => ({player: total.player + score.player, rival: total.rival + score.rival}), {player: 0, rival: 0});
}
/** Never let combat mutations change the opening deal used by the next tide. */
export function freshTide<T>(opening: T): T { return structuredClone(opening); }

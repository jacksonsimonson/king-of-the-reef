export interface TideScore { player: number; rival: number }
/** Four deployments preserve opening setup while avoiding two full-length matches. */
export function tidePlayLimit(classicPlays: number): number { return Math.max(4, Math.ceil(classicPlays / 2)); }
export function combinedScore(scores: readonly TideScore[]): TideScore {
  return scores.reduce((total, score) => ({player: total.player + score.player, rival: total.rival + score.rival}), {player: 0, rival: 0});
}
/** Never let combat mutations change the opening deal used by the next tide. */
export function freshTide<T>(opening: T): T { return structuredClone(opening); }

import type { FishCard } from "./data/starterFish.ts";
import { blocksPlacement, type Terrain } from "./terrain.ts";

export const ABILITIES = {
  revelation: { name: "Revelation", description: "On play, reveal one opposing hand card until played.", color: 0x407b9a, icon: ["01110", "10001", "10101", "10001", "01110"] },
  rally: { name: "Rally", description: "After pushing an enemy, peek at your next reserve card. Keep it or send it to the bottom before drawing. Once per placement.", color: 0x77603b, icon: ["11111", "11110", "10000", "10000", "10000"] },
  anchor: { name: "Anchor", description: "Cannot be forced to move by pushes, hooks or swaps. Own movement and direct-play terrain still work. Can still be eaten.", color: 0x697c91, icon: ["00100", "01110", "00100", "10101", "01110"] },
  reefborn: { name: "Reefborn", description: "May be played directly onto an empty scoring reef. Terrain and occupancy still apply.", color: 0x967097, icon: ["10101", "11111", "01110", "00100", "11111"] },
  bulwark: { name: "Bulwark", description: "Blocks incoming edge effects on every side, even while shocked. Dive, terrain and Piercing bypass this defense.", color: 0x647e68, icon: ["11111", "10101", "10101", "01110", "00100"] },
  piercing: { name: "Piercing", description: "Offensive edges ignore edge defenses and Bulwark. Rocks, Anchor and kelp still stop movement.", color: 0x9b715e, icon: ["00100", "01110", "10101", "00100", "00100"] },
  escort: { name: "Escort", description: "Before edges resolve, add Shields to empty sides of orthogonally adjacent allies for this battle.", color: 0x698b8b, icon: ["01010", "11111", "01010", "00100", "01110"] },
  ambush: { name: "Ambush", description: "Before edges resolve, shock orthogonally adjacent enemies, ignoring edge defenses. Allies are untouched.", color: 0x8d769e, icon: ["00010", "00100", "11111", "00100", "01000"] },
  wake: { name: "Wake", description: "After edges resolve, push orthogonally adjacent enemies outward once, ignoring defenses. Rocks, occupied cells, kelp and Anchor block it.", color: 0x548b9d, icon: ["01010", "10101", "00000", "01010", "10101"] },
  sovereign: { name: "Sovereign", description: "Worth two points instead of one while occupying a scoring reef.", color: 0x998750, icon: ["10101", "11111", "11111", "01110", "01110"] },
} as const;
export type CardAbility = keyof typeof ABILITIES;
export const NEW_ABILITIES = ["anchor", "reefborn", "bulwark", "piercing", "escort", "ambush", "wake", "sovereign"] as const;
export const SCORING_REEFS = new Set([2, 11, 18]);
export function hasAbility(card: FishCard | null | undefined, ability: CardAbility): boolean {
  return Boolean(card && (card.ability === ability || card.battleAbilities?.includes(ability)));
}
export function grantAbility(card: FishCard, ability: CardAbility): FishCard {
  return hasAbility(card, ability) ? card : { ...card, battleAbilities: [...(card.battleAbilities ?? []), ability] };
}
export function canPlaceFish(board: readonly (FishCard | null)[], index: number, card: FishCard | undefined, terrain: Terrain): boolean {
  return Boolean(card && Number.isInteger(index) && index >= 0 && index < board.length && !board[index]
    && !blocksPlacement(terrain, index) && (!SCORING_REEFS.has(index) || hasAbility(card, "reefborn")));
}
export function scoreBoard(board: readonly (FishCard | null)[]): { player: number; rival: number } {
  const scores = { player: 0, rival: 0 };
  for (const index of SCORING_REEFS) {
    const card = board[index];
    if (card) scores[card.owner] += hasAbility(card, "sovereign") ? 2 : 1;
  }
  return scores;
}

import type { FishCard } from "../data/starterFish.ts";

/** Compare real placements only; AI simulations must never change school condition. */
export function removedCardIds(before: Array<FishCard | null>, after: Array<FishCard | null>): string[] {
  const surviving = new Set(after.flatMap((fish) => fish ? [fish.id] : []));
  return before.flatMap((fish) => fish && !surviving.has(fish.id) ? [fish.id] : []);
}

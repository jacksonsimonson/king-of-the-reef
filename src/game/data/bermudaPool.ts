import { BERMUDA_CARDS, BERMUDA_POOL } from "./bermudaCards.ts";
import type { Rarity } from "./starterFish.ts";

export { BERMUDA_POOL };
export function bermudaRarity(texture: string): Rarity | undefined {
  return BERMUDA_CARDS.find(card => card.texture === texture)?.rarity
    ?? ({ "hypno-squid": "Rare", lure: "Uncommon" } as Record<string, Rarity>)[texture];
}

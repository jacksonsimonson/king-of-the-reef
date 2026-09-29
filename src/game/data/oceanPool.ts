import { OPEN_OCEAN_CARDS, OPEN_OCEAN_POOL, type OpenOceanZone } from "./openOceanCards.ts";
import type { Rarity } from "./starterFish.ts";

export const LEGACY_OCEAN_POOL = ["sardine", "swordfish", "barracuda", "ocean-sunfish", "octopus", "lure"];
export const OCEAN_POOL = [...OPEN_OCEAN_POOL, "swordfish", "barracuda", "ocean-sunfish"];
export function oceanRarity(texture: string): Rarity | undefined {
  return OPEN_OCEAN_CARDS.find(card => card.texture === texture)?.rarity
    ?? ({ swordfish: "Uncommon", barracuda: "Rare", "ocean-sunfish": "Common" } as Record<string, Rarity>)[texture];
}
export function oceanZone(column: number): OpenOceanZone {
  return column < 5 ? "continental-shelf" : column < 9 ? "polar-current" : "midnight-trench";
}
export function drawOceanCard(rng: () => number, enabled: readonly string[], excluded: readonly string[], column: number): string {
  const available = OCEAN_POOL.filter(id => enabled.includes(id) && !excluded.includes(id));
  const groups = ([[45, "Common"], [35, "Uncommon"], [18, "Rare"], [2, "Extremely Rare"]] as [number, Rarity][])
    .map(([weight, rarity]) => ({ weight, cards: available.filter(id => oceanRarity(id) === rarity) })).filter(g => g.cards.length);
  if (!groups.length) throw new Error("Open Ocean pool exhausted");
  let roll = rng() * groups.reduce((sum, g) => sum + g.weight, 0);
  const group = groups.find(g => (roll -= g.weight) < 0) ?? groups.at(-1)!;
  const weighted = group.cards.flatMap(id => {
    const zone = OPEN_OCEAN_CARDS.find(c => c.texture === id)?.zone ?? "continental-shelf";
    return zone === oceanZone(column) ? [id, id] : [id];
  });
  return weighted[Math.floor(rng() * weighted.length)];
}

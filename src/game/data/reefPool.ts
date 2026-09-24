import type { Rarity } from "./starterFish.ts";

/** Group weights apply to each draw; depleted groups drop out of unique offers. */
export const REEF_GROUPS: { weight: number; rarity: Rarity; cards: string[] }[] = [
  { weight: 55, rarity: "Common", cards: ["minnow", "anchovy", "sardine", "goby", "blenny", "garden-eel", "hermit-crab", "shrimp", "sea-star", "flounder"] },
  { weight: 15, rarity: "Uncommon", cards: ["lionfish", "crab", "mantis-shrimp", "octopus"] },
  { weight: 22, rarity: "Uncommon", cards: ["boxfish", "needlefish", "seahorse"] },
  { weight: 7, rarity: "Rare", cards: ["pufferfish", "electric-eel", "sea-urchin", "invisible-ink-squid"] },
  { weight: 1, rarity: "Extremely Rare", cards: ["moray-eel"] },
];
export const REEF_POOL = REEF_GROUPS.flatMap((group) => group.cards);
export function reefRarity(texture: string): Rarity | undefined {
  return REEF_GROUPS.find((group) => group.cards.includes(texture))?.rarity;
}
export function drawReefCard(rng: () => number, excluded: readonly string[] = []): string {
  const groups = REEF_GROUPS.map((group) => ({ ...group, cards: group.cards.filter((id) => !excluded.includes(id)) })).filter((group) => group.cards.length);
  if (!groups.length) throw new Error("Reef pool exhausted");
  let roll = rng() * groups.reduce((sum, group) => sum + group.weight, 0);
  const group = groups.find((entry) => (roll -= entry.weight) < 0) ?? groups.at(-1)!;
  return group.cards[Math.floor(rng() * group.cards.length)];
}

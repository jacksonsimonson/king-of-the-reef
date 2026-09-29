import type { Rarity } from "./starterFish.ts";
import { REEF_DESIGNS } from "./reefDesigns.ts";

/** Group weights apply to each draw; depleted groups drop out of unique offers. */
export const LEGACY_REEF_GROUPS: { weight: number; rarity: Rarity; cards: string[] }[] = [
  { weight: 55, rarity: "Common", cards: ["minnow", "anchovy", "sardine", "goby", "blenny", "garden-eel", "hermit-crab", "shrimp", "sea-star", "flounder"] },
  { weight: 15, rarity: "Uncommon", cards: ["lionfish", "crab", "mantis-shrimp", "octopus"] },
  { weight: 22, rarity: "Uncommon", cards: ["boxfish", "needlefish", "seahorse"] },
  { weight: 7, rarity: "Rare", cards: ["pufferfish", "electric-eel", "sea-urchin", "invisible-ink-squid"] },
  { weight: 1, rarity: "Extremely Rare", cards: ["moray-eel"] },
];
export const ADVANCED_REEF = ["parrotfish", "pistol-shrimp", "frogfish", "stonefish", "titan-triggerfish", "crown-of-thorns", "decorator-crab", "coral-grouper"];
export const V2_REEF_GROUPS = [
  ...LEGACY_REEF_GROUPS.map((group, index) => ({ ...group, weight: index === 0 ? 47 : group.weight })),
  { weight: 8, rarity: "Rare" as const, cards: ADVANCED_REEF },
];
export const REEF_GROUPS = ([ [47, "Common"], [37, "Uncommon"], [15, "Rare"], [1, "Extremely Rare"] ] as [number, Rarity][]).map(([weight, rarity]) => ({
  weight, rarity, cards: Object.keys(REEF_DESIGNS).filter((id) => REEF_DESIGNS[id].rarity === rarity),
}));
export const REEF_POOL = REEF_GROUPS.flatMap((group) => group.cards);
export function reefRarity(texture: string, version: 1 | 2 | 3 = 3): Rarity | undefined {
  return (version === 1 ? LEGACY_REEF_GROUPS : version === 2 ? V2_REEF_GROUPS : REEF_GROUPS).find((group) => group.cards.includes(texture))?.rarity;
}
export function drawReefCard(rng: () => number, excluded: readonly string[] = [], version: 1 | 2 | 3 = 3): string {
  const groups = (version === 1 ? LEGACY_REEF_GROUPS : version === 2 ? V2_REEF_GROUPS : REEF_GROUPS).map((group) => ({ ...group, cards: group.cards.filter((id) => !excluded.includes(id)) })).filter((group) => group.cards.length);
  if (!groups.length) throw new Error("Reef pool exhausted");
  let roll = rng() * groups.reduce((sum, group) => sum + group.weight, 0);
  const group = groups.find((entry) => (roll -= entry.weight) < 0) ?? groups.at(-1)!;
  return group.cards[Math.floor(rng() * group.cards.length)];
}

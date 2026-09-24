import type { EdgeEffect, FishCard } from "../data/starterFish.ts";
import { reefRarity } from "../data/reefPool.ts";

export const SHOCK_PATTERN = ["....##..", "...##...", "..##....", ".######.", "....##..", "...##...", "..##....", ".##....."];
export const SPINES_PATTERN = ["#..##..#", ".#.##.#.", "..####..", "########", "########", "..####..", ".#.##.#.", "#..##..#"];
export const EFFECT_HELP: Record<EdgeEffect, string> = {
  standard: "Standard: push 1; blocked by opposing defenses",
  double: "Double: push 1; beats Standard",
  weak: "Shield: blocks every edge effect; never pushes",
  "bigger-fish": "Bite: kill if an undefended push would succeed",
  swap: "Swap: exchange with an adjacent undefended card",
  hook: "Hook: pull across 1 empty space; ignores Standard",
  wave: "Wave: push undefended cards on 3 rays; only kills off-board",
  shock: "Shock: disable adjacent edges for this battle; only Shield blocks; no defense",
  spines: "Spines: no defense; after a successful enemy Standard/Double push, kill the attacker",
};
export function cardDescription(card: FishCard): string {
  const rarity = reefRarity(card.texture);
  const effects = [...new Set(card.edges.map((edge) => edge.effect))];
  return [card.name + (rarity ? " (" + rarity + ")" : ""),
    ...effects.map((effect) => card.edges.filter((edge) => edge.effect === effect).map((edge) => edge.direction[0].toUpperCase() + edge.direction.slice(1)).join("/") + " — " + EFFECT_HELP[effect]),
    ...(card.ability ? ["Revelation: on play, choose 1 unrevealed opposing hand card. It stays revealed this battle."] : []),
  ].join(". ");
}

/** Integer coordinates on a 64px card interior, shared by DOM and Phaser. */
export function revelationPixels(): { x: number; y: number; color: number }[] {
  const pixels: { x: number; y: number; color: number }[] = [];
  const closed = ["#.....#", ".#...#.", "..###.."];
  const open = ["..###..", ".#...#.", "#..#..#", ".#...#.", "..###.."];
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const isOpen = row === 0 && col === 2;
    (isOpen ? open : closed).forEach((line, y) => [...line].forEach((cell, x) => {
      if (cell === "#") pixels.push({ x: 3 + col * 16 + x, y: 5 + row * 16 + y, color: isOpen ? 0x407b9a : 0x303456 });
    }));
  }
  return pixels;
}

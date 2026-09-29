import type { EdgeEffect, FishCard } from "../data/starterFish.ts";
import { oceanRarity } from "../data/oceanPool.ts";
import { reefRarity } from "../data/reefPool.ts";

export const OCEAN_PATTERNS = {
  ram: ["##.##...", "##.##.#.", "......##", "########", "########", "......##", "##.##.#.", "##.##..."],
  "follow-current": ["#...#...", ".#...#..", "..#...#.", "...#...#", "...#...#", "..#...#.", ".#...#..", "#######."],
  bounce: ["..####..", ".######.", ".....#..", "..###...", ".#......", "..###...", ".....#..", ".######."],
  dive: ["........", "########", "........", "..#..#..", "...##...", ".######.", "..####..", "...#...."],
};
export const SHOCK_PATTERN = ["....##..", "...##...", "..##....", ".######.", "....##..", "...##...", "..##....", ".##....."];
export const SPINES_PATTERN = ["#..##..#", ".#.##.#.", "..####..", "########", "########", "..####..", ".#.##.#.", "#..##..#"];
export const ABILITY_HELP = {
  revelation: "Revelation: on play, reveal 1 opposing hand card until it is played; replacement cards are hidden.",
  rally: "Rally: after pushing an enemy, peek at your next reserve card. Keep it or send it to the bottom before drawing your replacement. Once per placement.",
};
export const EFFECT_HELP: Record<EdgeEffect, string> = {
  standard: "Standard: push 1; blocked by opposing defenses",
  double: "Double: push 1; beats Standard, Ram, Bounce and Dive defenses",
  weak: "Shield: blocks pushes and Shock; Dive passes through; never pushes",
  "bigger-fish": "Bite: kill if an undefended push would succeed",
  swap: "Swap: exchange with an adjacent undefended card",
  hook: "Hook: pull across 1 empty space; ignores Standard",
  wave: "Wave: push undefended cards on 3 rays; only kills off-board",
  shock: "Shock: disable adjacent edges for this battle; only Shield blocks; no defense",
  spines: "Spines: no defense; retaliates against direct Standard, Double, Ram, Follow Current and Bounce pushes",
  ram: "Ram: push a contiguous line 1 tile, farthest first; opposing defenses block",
  "follow-current": "Follow Current: Double-strength push, then follow into the vacated tile",
  bounce: "Bounce: Standard push attempt, then retreat 1 empty on-board tile even if blocked",
  dive: "Dive: jump over an adjacent creature into an empty on-board tile; ignores all defenses",
};
export function cardDescription(card: FishCard): string {
  const rarity = reefRarity(card.texture) ?? oceanRarity(card.texture);
  const effects = [...new Set(card.edges.map((edge) => edge.effect))];
  return [card.name + (rarity ? " (" + rarity + ")" : ""),
    ...effects.map((effect) => card.edges.filter((edge) => edge.effect === effect).map((edge) => edge.direction[0].toUpperCase() + edge.direction.slice(1)).join("/") + " — " + EFFECT_HELP[effect]),
    ...(card.ability ? [ABILITY_HELP[card.ability]] : []),
  ].join(". ");
}

/** Flag motifs use whole native pixels, kept muted behind the creature. */
export function rallyPixels(): { x: number; y: number; color: number }[] {
  const pixels: { x: number; y: number; color: number }[] = [];
  const flag = ["########.", "#########", "#######..", "#........", "#........", "#........", "#........"];
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    flag.forEach((line, y) => [...line].forEach((cell, x) => {
      if (cell === "#") pixels.push({ x: 3 + col * 16 + x, y: 3 + row * 16 + y, color: x === 0 ? 0x566555 : (row + col) % 2 ? 0x3d6660 : 0x77603b });
    }));
  }
  return pixels;
}

export function abilityPixels(ability: NonNullable<FishCard["ability"]>): { x: number; y: number; color: number }[] {
  return ability === "rally" ? rallyPixels() : revelationPixels();
}
export function abilityBackgroundColor(ability: NonNullable<FishCard["ability"]>): number {
  return ability === "rally" ? 0x1a302e : 0x151d38;
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

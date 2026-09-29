import type { FishCard } from "../data/starterFish";
import { EFFECT_COLORS, STANDARD_ARROW_PATTERN, DOUBLE_ARROW_PATTERN, SHIELD_PATTERN } from "./drawFishCard";
import { OCEAN_PATTERNS, SHOCK_PATTERN, SPINES_PATTERN, abilityPixels, abilityBackgroundColor, cardDescription } from "./cardVisuals";

const patterns = {
  ...OCEAN_PATTERNS,
  standard: STANDARD_ARROW_PATTERN, double: DOUBLE_ARROW_PATTERN, weak: SHIELD_PATTERN,
  shock: SHOCK_PATTERN, spines: SPINES_PATTERN,
  "bigger-fish": ["##.##.##", "##.##.##", ".#..#..#", "........", "........", ".#..#..#", "##.##.##", "##.##.##"],
  swap: [".....#..", ".######.", ".....#..", "........", "........", "..#.....", ".######.", "..#....."],
  hook: [".#####..", ".#....#.", ".##....#", ".......#", ".......#", ".#.....#", "..#...#.", "...###.."],
  wave: [".##..##.", "#..##..#", "........", ".##..##.", "#..##..#", "........", ".##..##.", "#..##..#"],
};

/** Native 128px artwork, with the same frame and edge positions as a hand card. */
export function cardElement(fish: FishCard): HTMLElement {
  const card = document.createElement("span");
  card.className = "school-card-art";
  card.title = cardDescription(fish);
  card.setAttribute("role", "img");
  card.setAttribute("aria-label", `${fish.name}. ${fish.edges.map((e) => `${e.direction}: ${e.effect === "weak" ? "Shield" : e.effect}`).join(", ")}. ${fish.condition === "killed" ? "Killed" : "Ready"}.`);
  const sprite = document.createElement("img");
  sprite.src = `${import.meta.env.BASE_URL}assets/fish/${fish.texture}.png`;
  sprite.alt = ""; sprite.width = 128; sprite.height = 128;
  if (fish.condition === "killed") sprite.className = "killed-sprite";
  if (fish.ability) {
    const background = document.createElement("canvas");
    background.width = 128; background.height = 128;
    background.className = "card-ability-background";
    const ctx = background.getContext("2d")!;
    ctx.fillStyle = "#" + abilityBackgroundColor(fish.ability).toString(16).padStart(6, "0"); ctx.fillRect(0, 0, 128, 128);
    for (const p of abilityPixels(fish.ability)) {
      ctx.fillStyle = "#" + p.color.toString(16).padStart(6, "0");
      ctx.fillRect(p.x * 2, p.y * 2, 2, 2);
    }
    card.append(background);
  }
  card.setAttribute("aria-label", cardDescription(fish) + (fish.condition === "killed" ? ". Killed." : ". Ready."));
  card.append(sprite);
  for (const edge of fish.edges) {
    const badge = document.createElement("canvas");
    badge.width = 20; badge.height = 20;
    badge.className = `school-edge edge-${edge.direction}`;
    const ctx = badge.getContext("2d")!;
    const color = `#${EFFECT_COLORS[edge.effect].toString(16).padStart(6, "0")}`;
    ctx.fillStyle = color; ctx.fillRect(0, 0, 20, 20);
    ctx.fillStyle = "#00233a"; ctx.fillRect(2, 2, 16, 16);
    ctx.fillStyle = color;
    const rotation = edge.effect === "standard" || edge.effect === "double"
      ? { right: 0, down: 1, left: 2, up: 3 }[edge.direction] : 0;
    const pattern = patterns[edge.effect];
    const patternHeight = pattern.length;
    pattern.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel !== "#") return;
      let px = x, py = y;
      for (let i = 0; i < rotation; i++) [px, py] = [7 - py, px];
      ctx.fillRect(Math.floor((20 - row.length) / 2) + px, Math.floor((20 - patternHeight) / 2) + py, 1, 1);
    }));
    card.append(badge);
  }
  return card;
}

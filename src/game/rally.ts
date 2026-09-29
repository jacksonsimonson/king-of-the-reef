import type { FishCard } from "./data/starterFish.ts";

export function triggersRally(card: FishCard, pushedEnemyIds: readonly string[], deck: readonly FishCard[]): boolean {
  return card.ability === "rally" && pushedEnemyIds.length > 0 && deck.length > 0;
}

/** Resolve once before the replacement draw. A one-card reserve cannot change order. */
export function resolveRally(deck: FishCard[], choice: "keep" | "bottom"): void {
  if (choice === "bottom" && deck.length > 1) deck.push(deck.shift()!);
}

/** The rival evaluates only the revealed top card, never cards hidden below it. */
export function rivalRallyChoice(top: FishCard): "keep" | "bottom" {
  const strength = top.edges.reduce((score, edge) => score + (edge.effect === "weak" ? 0.5 : edge.effect === "standard" ? 1 : 1.5), 0);
  return strength + (top.ability ? 1 : 0) < 2 ? "bottom" : "keep";
}

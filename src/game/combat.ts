import type { Direction, EdgeEffect, FishCard } from "./data/starterFish.ts";
import { removedCardIds } from "./run/casualties.ts";

export const DIRECTIONS: Record<Direction, { row: number; column: number; opposite: Direction }> = {
  up: { row: -1, column: 0, opposite: "down" }, right: { row: 0, column: 1, opposite: "left" },
  down: { row: 1, column: 0, opposite: "up" }, left: { row: 0, column: -1, opposite: "right" },
};
export interface BattleState { board: Array<FishCard | null>; shocked: ReadonlySet<string> }
export interface HandSlot { card: FishCard; played: boolean; revealed?: boolean }
export function revealTargets(hand: readonly HandSlot[]): HandSlot[] {
  return hand.filter((slot) => !slot.played && !slot.revealed);
}
export function revealCard(hand: HandSlot[], id: string): boolean {
  const slot = revealTargets(hand).find((entry) => entry.card.id === id);
  if (!slot) return false;
  slot.revealed = true;
  return true;
}

export function edgeBlocks(target: FishCard, incoming: Direction, effect: EdgeEffect, shocked: ReadonlySet<string>): boolean {
  if (shocked.has(target.id)) return false;
  const defender = target.edges.find((edge) => edge.direction === DIRECTIONS[incoming].opposite);
  if (!defender || defender.effect === "shock" || defender.effect === "spines") return false;
  if (effect === "shock") return defender.effect === "weak";
  if (effect === "double" || effect === "hook") return defender.effect !== "standard";
  return true;
}

/** Returns a new board/status set. Cards and the input state are never mutated. */
export function resolvePlacement(state: BattleState, placedIndex: number, card: FishCard, size = 5): { board: Array<FishCard | null>; shocked: Set<string>; killedIds: string[] } {
  const board = [...state.board];
  const shocked = new Set(state.shocked);
  if (board[placedIndex]) throw new Error("Placement requires an empty tile");
  board[placedIndex] = card;
  const before = [...board];
  const offset = (index: number, dr: number, dc: number): number | null => {
    const row = Math.floor(index / size) + dr, column = index % size + dc;
    return row < 0 || row >= size || column < 0 || column >= size ? null : row * size + column;
  };
  const neighbor = (index: number, direction: Direction) => offset(index, DIRECTIONS[direction].row, DIRECTIONS[direction].column);
  let source = placedIndex;
  for (const edge of card.edges) {
    if (board[source]?.id !== card.id || shocked.has(card.id)) break;
    if (edge.effect === "weak" || edge.effect === "spines") continue;
    if (edge.effect === "wave") {
      const forward = DIRECTIONS[edge.direction];
      for (const spread of [-1, 0, 1]) {
        const dr = forward.row + forward.column * spread, dc = forward.column - forward.row * spread;
        const ray: number[] = [];
        for (let distance = 1; distance < size; distance++) {
          const index = offset(source, dr * distance, dc * distance);
          if (index === null) break;
          ray.push(index);
        }
        for (const index of ray.reverse()) {
          const target = board[index];
          if (!target || edgeBlocks(target, edge.direction, "wave", shocked)) continue;
          const destination = offset(index, dr, dc);
          if (destination === null) board[index] = null;
          else if (!board[destination]) { board[destination] = target; board[index] = null; }
        }
      }
      continue;
    }
    const adjacent = neighbor(source, edge.direction);
    if (adjacent === null) continue;
    if (edge.effect === "hook") {
      if (board[adjacent]) continue;
      const index = neighbor(adjacent, edge.direction);
      const target = index === null ? null : board[index];
      if (target && !edgeBlocks(target, edge.direction, "hook", shocked)) {
        board[adjacent] = target; board[index!] = null;
      }
      continue;
    }
    const target = board[adjacent];
    if (!target || edgeBlocks(target, edge.direction, edge.effect, shocked)) continue;
    if (edge.effect === "shock") { shocked.add(target.id); continue; }
    if (edge.effect === "swap") {
      board[source] = target; board[adjacent] = card; source = adjacent;
      continue;
    }
    const destination = neighbor(adjacent, edge.direction);
    if (destination !== null && board[destination]) continue;
    board[adjacent] = null;
    if (edge.effect !== "bigger-fish" && destination !== null) board[destination] = target;
    // Retaliation follows a successful direct enemy push, even when it kills the Urchin.
    if ((edge.effect === "standard" || edge.effect === "double") && target.owner !== card.owner
      && !shocked.has(target.id) && target.edges.some((e) => e.direction === DIRECTIONS[edge.direction].opposite && e.effect === "spines")) {
      board[source] = null;
    }
  }
  return { board, shocked, killedIds: removedCardIds(before, board) };
}

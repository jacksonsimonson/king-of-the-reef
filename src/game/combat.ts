import type { CombatFrame } from "./combatFeedback.ts";
import { hasAbility } from "./abilities.ts";
import type { Direction, EdgeEffect, FishCard } from "./data/starterFish.ts";
import { removedCardIds } from "./run/casualties.ts";
import { blocksPlacement, placementCard, placementDestination, type Terrain } from "./terrain.ts";

export const DIRECTIONS: Record<Direction, { row: number; column: number; opposite: Direction }> = {
  up: { row: -1, column: 0, opposite: "down" }, right: { row: 0, column: 1, opposite: "left" },
  down: { row: 1, column: 0, opposite: "up" }, left: { row: 0, column: -1, opposite: "right" },
};
export interface BattleState { board: Array<FishCard | null>; shocked: ReadonlySet<string>; terrain?: Terrain }
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

export function edgeBlocks(target: FishCard, incoming: Direction, effect: EdgeEffect, shocked: ReadonlySet<string>, attacker?: FishCard): boolean {
  if (hasAbility(attacker, "piercing")) return false;
  if (hasAbility(target, "bulwark")) return effect !== "dive";
  if (shocked.has(target.id)) return false;
  const defender = target.edges.find((edge) => edge.direction === DIRECTIONS[incoming].opposite);
  if (!defender || defender.effect === "shock" || defender.effect === "spines") return false;
  if (effect === "shock") return defender.effect === "weak";
  if (effect === "dive") return false;
  if (effect === "double" || effect === "follow-current" || effect === "hook")
    return !["standard", "bounce", "dive", "ram"].includes(defender.effect);
  return true;
}

/** Returns a new board/status set. Cards and the input state are never mutated. */
export function resolvePlacement(state: BattleState, placedIndex: number, card: FishCard, size = 5, record = false): { frames: CombatFrame[]; board: Array<FishCard | null>; shocked: Set<string>; killedIds: string[]; pushedEnemyIds: string[] } {
  const frames: CombatFrame[] = [];
  let notes: string[] = [];
  let previous = state.board;
  let previousShock = new Set(state.shocked);
  const checkpoint = (label: string) => {
    if (!record) return;
    if (notes.length || board.some((fish, index) => fish !== previous[index]) || [...shocked].some(id => !previousShock.has(id))) {
      frames.push({ label, board: [...board], shocked: new Set(shocked), notes });
      previous = [...board]; previousShock = new Set(shocked); notes = [];
    }
  };
  const blocked = (message: string) => { if (record) notes.push(message); };
  const board = [...state.board];
  const shocked = new Set(state.shocked);
  const pushedEnemies = new Set<string>();
  if (!Number.isInteger(placedIndex) || placedIndex < 0 || placedIndex >= board.length || board[placedIndex] || (state.terrain && blocksPlacement(state.terrain, placedIndex))) throw new Error("Placement requires an empty water tile");
  const feature = state.terrain?.features?.get(placedIndex);
  const poolEntry = state.terrain?.whirlpools.includes(placedIndex) ? placedIndex : null;
  card = placementCard(card, placedIndex, state.terrain);
  if (feature === "mirror") blocked(card.name + " reversed its edges on the mirror tile.");
  board[placedIndex] = card;
  checkpoint(card.owner === "player" ? "Your play" : "Rival play");
  board[placedIndex] = null;
  const entrance = placedIndex;
  placedIndex = placementDestination(board, placedIndex, state.terrain, size);
  board[placedIndex] = card;
  if (entrance !== placedIndex) checkpoint("Tide channel");
  else if (feature?.startsWith("channel-")) { blocked("Landing blocked; fish stays on the channel."); checkpoint("Tide channel"); }
  const before = [...board];
  const offset = (index: number, dr: number, dc: number): number | null => {
    const row = Math.floor(index / size) + dr, column = index % size + dc;
    return row < 0 || row >= size || column < 0 || column >= size ? null : row * size + column;
  };
  const neighbor = (index: number, direction: Direction) => offset(index, DIRECTIONS[direction].row, DIRECTIONS[direction].column);
  const rock = (index: number | null) => index !== null && Boolean(state.terrain?.rocks.has(index));
  const anchored = (index: number) => {
    const fixed = state.terrain?.features?.get(index) === "kelp" || hasAbility(board[index], "anchor");
    if (fixed) blocked((board[index]?.name ?? "Fish") + " held in place by " + (hasAbility(board[index], "anchor") ? "Anchor." : "kelp."));
    return fixed;
  };
  const defended = (target: FishCard, direction: Direction, effect: EdgeEffect) => {
    const stopped = edgeBlocks(target, direction, effect, shocked, card);
    if (stopped) blocked(target.name + " blocked " + effect + " with " + (hasAbility(target, "bulwark") ? "Bulwark." : "a defending edge."));
    return stopped;
  };
  const sink = () => {
    for (const [index, type] of state.terrain?.features ?? []) if (type === "trench") board[index] = null;
  };
  if (feature === "vent") {
    for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
      const index = neighbor(placedIndex, direction);
      const target = index === null ? null : board[index];
      if (!target || anchored(index!)) continue;
      const destination = neighbor(index!, direction);
      if (rock(destination) || (destination !== null && board[destination])) { blocked("Movement blocked by " + (rock(destination) ? "a rock." : "an occupied tile.")); continue; }
      board[index!] = null;
      if (destination !== null) board[destination] = target;
      if (target.owner !== card.owner) pushedEnemies.add(target.id);
      sink();
    }
  }
  checkpoint("Thermal vent");
  if (feature === "storm") {
    for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
      const index = neighbor(placedIndex, direction), target = index === null ? null : board[index];
      if (target) shocked.add(target.id);
    }
  }
  checkpoint("Storm field");
  for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
    const index = neighbor(placedIndex, direction), ally = index === null ? null : board[index];
    if (!ally) continue;
    if (hasAbility(card, "ambush") && ally.owner !== card.owner) shocked.add(ally.id);
    if (hasAbility(card, "escort") && ally.owner === card.owner) {
      const edges = ally.edges.map(edge => ({ ...edge }));
      for (const side of Object.keys(DIRECTIONS) as Direction[]) if (!edges.some(edge => edge.direction === side)) edges.push({ direction: side, effect: "weak" });
      board[index!] = { ...ally, edges };
    }
  }
  checkpoint("Full-card ability");
  let source = placedIndex;
  for (const edge of card.edges) {
    try {
    sink();
    if (board[source]?.id !== card.id || shocked.has(card.id)) break;
    if (edge.effect === "weak" || edge.effect === "spines") continue;
    if (edge.effect === "ram") {
      const line: number[] = [];
      for (let index = neighbor(source, edge.direction); index !== null && board[index]; index = neighbor(index, edge.direction)) line.push(index);
      for (const index of line.reverse()) {
        const target = board[index]!;
        if (anchored(index) || defended(target, edge.direction, "ram")) continue;
        const destination = neighbor(index, edge.direction);
        if (rock(destination) || (destination !== null && board[destination])) { blocked("Movement blocked by " + (rock(destination) ? "a rock." : "an occupied tile.")); continue; }
        board[index] = null;
        if (destination !== null) board[destination] = target;
        sink();
        if (target.owner !== card.owner) pushedEnemies.add(target.id);
        if (index === neighbor(source, edge.direction) && target.owner !== card.owner && !shocked.has(target.id)
          && target.edges.some(e => e.direction === DIRECTIONS[edge.direction].opposite && e.effect === "spines")) { board[source] = null; blocked(target.name + " retaliated with Spines."); }
      }
      continue;
    }
    if (edge.effect === "wave") {
      const forward = DIRECTIONS[edge.direction];
      for (const spread of [-1, 0, 1]) {
        const dr = forward.row + forward.column * spread, dc = forward.column - forward.row * spread;
        const ray: number[] = [];
        for (let distance = 1; distance < size; distance++) {
          const index = offset(source, dr * distance, dc * distance);
          if (index === null || rock(index)) break;
          ray.push(index);
        }
        for (const index of ray.reverse()) {
          const target = board[index];
          if (!target || anchored(index) || defended(target, edge.direction, "wave")) continue;
          const destination = offset(index, dr, dc);
          if (destination === null) board[index] = null;
          else if (!rock(destination) && !board[destination]) { board[destination] = target; board[index] = null; }
          sink();
        }
      }
      continue;
    }
    const adjacent = neighbor(source, edge.direction);
    if (edge.effect === "dive") {
      const destination = adjacent === null ? null : neighbor(adjacent, edge.direction);
      if (adjacent !== null && !rock(adjacent) && board[adjacent] && destination !== null && !rock(destination) && !board[destination]) {
        board[source] = null; board[destination] = card; source = destination;
      }
      continue;
    }
    const bounce = () => {
      const back = neighbor(source, DIRECTIONS[edge.direction].opposite);
      if (edge.effect === "bounce" && board[source]?.id === card.id && back !== null && !rock(back) && !board[back]) {
        board[source] = null; board[back] = card; source = back;
      }
    };
    if (adjacent === null || rock(adjacent)) { if (rock(adjacent)) blocked("Rock blocks this edge."); bounce(); continue; }
    if (edge.effect === "hook") {
      if (board[adjacent]) continue;
      const index = neighbor(adjacent, edge.direction);
      const target = index === null ? null : board[index];
      if (target && !anchored(index!) && !defended(target, edge.direction, "hook")) {
        board[adjacent] = target; board[index!] = null;
      }
      continue;
    }
    const target = board[adjacent];
    if (!target || defended(target, edge.direction, edge.effect)) { bounce(); continue; }
    if (edge.effect === "shock") { shocked.add(target.id); continue; }
    if (anchored(adjacent) && edge.effect !== "bigger-fish") { bounce(); continue; }
    if (edge.effect === "swap") {
      if (anchored(source)) continue;
      board[source] = target; board[adjacent] = card; source = adjacent;
      continue;
    }
    const destination = neighbor(adjacent, edge.direction);
    if (rock(destination) || (destination !== null && board[destination])) { blocked("Movement blocked by " + (rock(destination) ? "a rock." : "an occupied tile.")); bounce(); continue; }
    const directPush = ["standard", "double", "follow-current", "bounce"].includes(edge.effect);
    if (target.owner !== card.owner && directPush) pushedEnemies.add(target.id);
    board[adjacent] = null;
    if (edge.effect !== "bigger-fish" && destination !== null) board[destination] = target;
    // Retaliation follows a successful direct enemy push, even when it kills the Urchin.
    if (directPush && target.owner !== card.owner
      && !shocked.has(target.id) && target.edges.some((e) => e.direction === DIRECTIONS[edge.direction].opposite && e.effect === "spines")) {
      board[source] = null; blocked(target.name + " retaliated with Spines.");
    }
    if (edge.effect === "follow-current" && board[source]?.id === card.id) {
      board[source] = null; board[adjacent] = card; source = adjacent;
    }
    bounce();
    } finally { sink(); checkpoint(card.name + " · " + edge.effect + " " + edge.direction); }
  }
  sink();
  if (board[source]?.id === card.id && hasAbility(card, "wake")) {
    for (const direction of Object.keys(DIRECTIONS) as Direction[]) {
      const index = neighbor(source, direction), target = index === null ? null : board[index];
      if (!target || target.owner === card.owner || anchored(index!)) continue;
      const destination = neighbor(index!, direction);
      if (rock(destination) || (destination !== null && board[destination])) { blocked("Movement blocked by " + (rock(destination) ? "a rock." : "an occupied tile.")); continue; }
      board[index!] = null;
      if (destination !== null) board[destination] = target;
      pushedEnemies.add(target.id); sink();
    }
  }
  checkpoint("Wake");
  if (state.terrain && poolEntry !== null && board[poolEntry]?.id === card.id) {
    const [a, b] = state.terrain.whirlpools;
    const exit = poolEntry === a ? b : a;
    if (exit !== null && !board[exit] && !blocksPlacement(state.terrain, exit)) {
      board[poolEntry] = null;
      board[exit] = card;
    } else { blocked("Whirlpool exit blocked; fish stays at the entrance.");
    }
  }
  checkpoint("Whirlpool");
  return { frames, board, shocked, killedIds: removedCardIds(before, board), pushedEnemyIds: [...pushedEnemies] };
}

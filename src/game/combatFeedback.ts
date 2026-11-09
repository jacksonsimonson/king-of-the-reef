import type { FishCard } from "./data/starterFish.ts";
export interface CombatFrame { label: string; board: Array<FishCard | null>; shocked: Set<string>; notes: string[]; blockedTiles?: number[] }
export function tileName(index: number, size = 5): string { return String.fromCharCode(65 + index % size) + (Math.floor(index / size) + 1); }
export function describeFrame(before: readonly (FishCard | null)[], shocked: ReadonlySet<string>, frame: CombatFrame): string[] {
  const lines = [...frame.notes];
  for (const [from, fish] of before.entries()) {
    if (!fish) continue;
    const to = frame.board.findIndex(card => card?.id === fish.id);
    if (to < 0) lines.push(fish.name + " removed from " + tileName(from, Math.sqrt(before.length)) + ".");
    else if (to !== from) lines.push(fish.name + " moved " + tileName(from, Math.sqrt(before.length)) + " → " + tileName(to, Math.sqrt(before.length)) + ".");
  }
  for (const [to, fish] of frame.board.entries()) {
    if (!fish) continue;
    const prior = before.find(card => card?.id === fish.id);
    if (!prior) lines.push(fish.name + " placed at " + tileName(to, Math.sqrt(before.length)) + ".");
    if (frame.shocked.has(fish.id) && !shocked.has(fish.id)) lines.push(fish.name + " shocked: edges disabled.");
    if (prior && JSON.stringify(prior.edges) !== JSON.stringify(fish.edges)) lines.push(fish.name + " changed edges.");
  }
  return lines.map(line => frame.label + ": " + line);
}

/** Board-space cues use stable card IDs, including duplicate species and swaps. */
export function frameHighlights(before: readonly (FishCard | null)[], shocked: ReadonlySet<string>, frame: CombatFrame) {
  const moves: Array<{from:number;to:number}> = [], removed: number[] = [], changed: number[] = [];
  for (const [from,fish] of before.entries()) {
    if (!fish) continue;
    const to=frame.board.findIndex(c=>c?.id===fish.id);
    if(to<0)removed.push(from); else if(to!==from)moves.push({from,to});
  }
  for(const [index,fish] of frame.board.entries()) {
    if(!fish)continue;
    const prior=before.find(c=>c?.id===fish.id);
    if(!prior || frame.shocked.has(fish.id)!==shocked.has(fish.id) || JSON.stringify(prior)!==JSON.stringify(fish))changed.push(index);
  }
  return {moves,removed,changed,blocked:frame.blockedTiles??[]};
}

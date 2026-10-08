import type { FishCard } from "./data/starterFish.ts";
export interface CombatFrame { label: string; board: Array<FishCard | null>; shocked: Set<string>; notes: string[] }
export function tileName(index: number, size = 5): string { return String.fromCharCode(65 + index % size) + (Math.floor(index / size) + 1); }
export function describeFrame(before: readonly (FishCard | null)[], shocked: ReadonlySet<string>, frame: CombatFrame): string[] {
  const lines = [...frame.notes];
  for (const [from, fish] of before.entries()) {
    if (!fish) continue;
    const to = frame.board.findIndex(card => card?.id === fish.id);
    if (to < 0) lines.push(fish.name + " removed from " + tileName(from) + ".");
    else if (to !== from) lines.push(fish.name + " moved " + tileName(from) + " → " + tileName(to) + ".");
  }
  for (const [to, fish] of frame.board.entries()) {
    if (!fish) continue;
    const prior = before.find(card => card?.id === fish.id);
    if (!prior) lines.push(fish.name + " placed at " + tileName(to) + ".");
    if (frame.shocked.has(fish.id) && !shocked.has(fish.id)) lines.push(fish.name + " shocked: edges disabled.");
    if (prior && fish.edges.length > prior.edges.length) lines.push(fish.name + " gained Shields.");
  }
  return lines.map(line => frame.label + ": " + line);
}

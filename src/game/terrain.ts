import type { Direction, FishCard } from "./data/starterFish.ts";
import { scoringReefs, type BattleRules } from './battleRules.ts';
import { random } from './run/maps.ts';

export type ChannelTerrain = `channel-${Direction}`;
export type RegionalTerrain = "kelp" | ChannelTerrain | "trench" | "vent" | "mirror" | "storm";
export interface Terrain {
  rocks: ReadonlySet<number>;
  whirlpools: readonly [number, number];
  features?: ReadonlyMap<number, RegionalTerrain>;
}

// Fixed, readable layouts keep rematches fair and never cover scoring reefs.
export function battleTerrain(region = "shoreline"): Terrain {
  if (region === "ocean") return { rocks: new Set([7, 17]), whirlpools: [5, 19], features: new Map([[12, "trench"], [8, "vent"]]) };
  if (region === "bermuda") return { rocks: new Set([6, 16]), whirlpools: [4, 20], features: new Map([[12, "mirror"], [8, "storm"]]) };
  return { rocks: new Set([8, 16]), whirlpools: [6, 19], features: new Map([[12, "kelp"], [10, "channel-right"], [7, "channel-up"], [13, "channel-down"], [3, "channel-left"]]) };
}

/** The budget counts every occupied special tile, including both ends of a pool pair. Reefs are separate. */
export function terrainForRules(rules: BattleRules): Terrain {
  if (rules.legacyTerrain) return battleTerrain(rules.region);
  const region = ['shoreline', 'ocean', 'bermuda'].indexOf(rules.region);
  const rng = random(`${rules.seed}:${rules.region}:${rules.size}:terrain-v1`), size = rules.size;
  const reefs = scoringReefs(size), budget = 2 + region + Math.floor(rng() * 3);
  const cells = Array.from({length: size * size}, (_, i) => i).filter(i => !reefs.has(i));
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  const rocks = new Set<number>(), features = new Map<number, RegionalTerrain>();
  let whirlpools: [number, number] = [-1, -1], remaining = budget;
  if (rng() < .45) { whirlpools = [cells.pop()!, cells.pop()!]; remaining -= 2; }
  const neighbors = (i: number) => [i - size, i + size, ...(i % size ? [i - 1] : []), ...(i % size < size - 1 ? [i + 1] : [])].filter(n => n >= 0 && n < size * size);
  const choices = region === 0 ? ['rock', 'kelp', 'channel-up', 'channel-right', 'channel-down', 'channel-left'] : region === 1 ? ['rock', 'trench', 'vent'] : ['rock', 'mirror', 'storm'];
  while (remaining-- > 0) {
    const index = cells.pop()!; let type = choices[Math.floor(rng() * choices.length)];
    if (type === 'rock' || type === 'trench') {
      const blocked = (n: number) => n === index || rocks.has(n) || features.get(n) === 'trench';
      if ([...reefs].some(reef => neighbors(reef).every(blocked))) type = region === 0 ? 'kelp' : region === 1 ? 'vent' : 'mirror';
    }
    if (type.startsWith('channel-')) {
      const exits = neighbors(index).filter(n => !rocks.has(n) && features.get(n) !== 'trench');
      const exit = exits[Math.floor(rng() * exits.length)];
      type = `channel-${exit === index - size ? 'up' : exit === index + size ? 'down' : exit < index ? 'left' : 'right'}`;
    }
    if (type === 'rock') rocks.add(index); else features.set(index, type as RegionalTerrain);
  }
  // Later rocks must not leave a generated channel pointing at a blocked landing.
  for (const [index, feature] of features) if (feature.startsWith('channel-')) {
    const exits = neighbors(index).filter(n => !rocks.has(n) && features.get(n) !== 'trench');
    if (!exits.length) { features.set(index, 'kelp'); continue; }
    const exit = exits[Math.floor(rng() * exits.length)];
    features.set(index, `channel-${exit === index - size ? 'up' : exit === index + size ? 'down' : exit < index ? 'left' : 'right'}`);
  }
  return { rocks, whirlpools, features };
}

export function blocksPlacement(terrain: Terrain, index: number): boolean {
  return terrain.rocks.has(index) || terrain.features?.get(index) === "trench";
}

export function placementCard(card: FishCard, index: number, terrain?: Terrain): FishCard {
  if (terrain?.features?.get(index) !== "mirror") return card;
  const opposite: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
  return { ...card, edges: card.edges.map(edge => ({ ...edge, direction: opposite[edge.direction] })) };
}

/** Channels move a directly played card before its edges; pools resolve afterward. */
export function placementDestination(board: readonly (FishCard | null)[], index: number, terrain?: Terrain, size = Math.sqrt(board.length)): number {
  if (!terrain) return index;
  const feature = terrain.features?.get(index);
  const steps: Partial<Record<RegionalTerrain, readonly [number, number]>> = {
    "channel-up": [-1, 0], "channel-right": [0, 1], "channel-down": [1, 0], "channel-left": [0, -1],
  };
  const step = feature && steps[feature];
  if (!step) return index;
  const row = Math.floor(index / size) + step[0], column = index % size + step[1];
  if (row < 0 || row >= size || column < 0 || column >= size) return index;
  const exit = row * size + column;
  return exit >= board.length || board[exit] || blocksPlacement(terrain, exit) ? index : exit;
}

export const TERRAIN_INFO: Record<RegionalTerrain, { name: string; color: number; pixels: string[]; rule: string }> = {
  kelp: { name: "KELP", color: 0x80cd83, pixels: ["10101", "01110", "10101", "01110", "00100"], rule: "Kelp: occupants resist pushes, hooks and swaps; shock and predation still work." },
  "channel-right": { name: "TIDE >", color: 0x79dbe0, pixels: ["00100", "00010", "11111", "00010", "00100"], rule: "Tides: direct play drifts one tile along the arrow before edges fire. Blocked landing: stay." },
  "channel-left": { name: "TIDE <", color: 0x79dbe0, pixels: ["00100", "01000", "11111", "01000", "00100"], rule: "Tides: direct play drifts one tile along the arrow before edges fire. Blocked landing: stay." },
  "channel-up": { name: "TIDE UP", color: 0x79dbe0, pixels: ["00100", "01110", "10101", "00100", "00100"], rule: "Tides: direct play drifts one tile along the arrow before edges fire. Blocked landing: stay." },
  "channel-down": { name: "TIDE DN", color: 0x79dbe0, pixels: ["00100", "00100", "10101", "01110", "00100"], rule: "Tides: direct play drifts one tile along the arrow before edges fire. Blocked landing: stay." },
  trench: { name: "TRENCH", color: 0x7d9cbc, pixels: ["11011", "10001", "10001", "01010", "00100"], rule: "Trench: no direct placement. Any card moved here is immediately killed." },
  vent: { name: "VENT", color: 0xffb77f, pixels: ["01010", "10100", "01010", "00100", "11111"], rule: "Vent: direct play erupts, pushing adjacent cards outward before edges fire. Ignores edges; blocked destinations stay." },
  mirror: { name: "MIRROR", color: 0xd6bbfa, pixels: ["01110", "11001", "10101", "10011", "01110"], rule: "Mirror: playing here reverses all edges for this battle. Forced movement does not activate it." },
  storm: { name: "STORM", color: 0xf3da84, pixels: ["00110", "01100", "11111", "00110", "01100"], rule: "Storm: playing here shocks every adjacent card, friend or rival, before edges fire." },
};

export function terrainLegend(terrain: Terrain): string {
  return [...(terrain.rocks.size ? ["Rock: blocks placement and movement."] : []), ...(terrain.whirlpools[0] >= 0 ? ["Pools A/B: play, resolve edges, then travel once if still on the pool. Occupied exit: stay."] : []), ...new Set([...(terrain.features?.values() ?? [])].map(type => TERRAIN_INFO[type].rule))].join("\n");
}

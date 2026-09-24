import { REEF_POOL } from "../data/reefPool.ts";

export type Space = "start" | "battle" | "fishing" | "shop" | "event" | "hydration" | "release" | "boss";
export type RegionId = "shoreline" | "ocean" | "bermuda";
export interface MapNode { id: string; column: number; lane: number; type: Space; next: string[] }
export interface RegionMap { region: RegionId; nodes: MapNode[] }
export const COLUMNS = 13;
export const SPACE_INFO: Record<Space, { name: string; color: string; description: string }> = {
  start: { name: "Departure", color: "#e9d5a0", description: "Choose a current and begin your voyage." },
  battle: { name: "Battle", color: "#ff8c79", description: "Contest three reefs. Win 12 shells; a loss costs one resolve." },
  fishing: { name: "Fishing", color: "#73ddc6", description: "Try one local catch or skip. Use Left / Right to follow the fish. An escape uses up this stop." },
  shop: { name: "Shop", color: "#ffd582", description: "Spend 18 shells to recruit a creature, or sail on." },
  event: { name: "Unknown Waters", color: "#c6a1ff", description: "A local discovery offers a choice with lasting consequences." },
  hydration: { name: "Hydration", color: "#8bceff", description: "Choose up to three killed cards to restore and recover one resolve." },
  release: { name: "Release", color: "#a7efae", description: "Permanently release one card from your school. Keep at least five cards and one healthy creature." },
  boss: { name: "Colossal", color: "#ffcc85", description: "Win the Colossal battle to reach the next region. Ties require a rematch." },
};
export const SPACE_WEIGHTS = { battle: 38, fishing: 25, shop: 10, event: 12, hydration: 10, release: 5 };
export const REGIONS = [
  { id: "shoreline", name: "The Shoreline", subtitle: "From warm shallows to the coral crown", boss: "Reef Colossal", zones: ["SUNLIT SHALLOWS", "TIDEPOOL GARDENS", "CORAL KINGDOM"], weights: SPACE_WEIGHTS, pool: REEF_POOL, accent: "#7fe5c0" },
  { id: "ocean", name: "The Open Ocean", subtitle: "Follow the cold current into the abyss", boss: "Abyssal Colossal", zones: ["CONTINENTAL SHELF", "POLAR CURRENT", "MIDNIGHT TRENCH"], weights: SPACE_WEIGHTS, pool: ["sardine", "swordfish", "barracuda", "ocean-sunfish", "octopus", "lure"], accent: "#8ccdf3" },
  { id: "bermuda", name: "The Bermuda Triangle", subtitle: "Every current leads toward the impossible", boss: "Triangle Colossal", zones: ["THE WRECK FIELD", "STORM CONVERGENCE", "THE TRIANGLE'S HEART"], weights: SPACE_WEIGHTS, pool: ["hypno-squid", "lure", "barracuda", "swordfish", "ocean-sunfish"], accent: "#c6a5ff" },
] as const;

export function random(seed: string): () => number {
  let state = 2166136261;
  for (const c of seed) state = Math.imul(state ^ c.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let n = Math.imul(state ^ state >>> 15, 1 | state);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

export function generateMap(seed: string, regionIndex: number): RegionMap {
  const region = REGIONS[regionIndex];
  const rng = random(`${seed}:${region.id}:map`);
  const nodes: MapNode[] = [];
  const columns: MapNode[][] = [];
  for (let column = 0; column < COLUMNS; column++) {
    const count = column === 0 || column === COLUMNS - 1 ? 1 : 2 + Math.floor(rng() * 3);
    const lanes = count === 1 ? [2] : count === 2 ? [1, 3] : count === 3 ? [0, 2, 4] : [0, 1, 3, 4];
    const layer = lanes.map((lane, i): MapNode => {
      let roll = rng() * 100;
      let type: Space = "battle";
      for (const [space, weight] of Object.entries(region.weights)) {
        roll -= weight;
        if (roll < 0) { type = space as Space; break; }
      }
      if (column === 0) type = "start";
      if (column === 1) type = "fishing";
      if (column === 2) type = "battle";
      if (column === 6) type = "shop";
      if (column === 11) type = "hydration";
      if (column === 12) type = "boss";
      return { id: `${region.id}-${column}-${i}`, column, lane, type, next: [] };
    });
    columns.push(layer);
    nodes.push(...layer);
  }
  // Monotone paths connect every node without crossings, orphans, or dead ends.
  // Advancing one index creates a fork/merge; advancing both creates parallel paths.
  for (let column = 0; column < COLUMNS - 1; column++) {
    const a = columns[column], b = columns[column + 1];
    let i = 0, j = 0;
    while (true) {
      a[i].next.push(b[j].id);
      if (i === a.length - 1 && j === b.length - 1) break;
      if (i === a.length - 1) j++;
      else if (j === b.length - 1) i++;
      else if (rng() < 0.3) { i++; j++; }
      else if (rng() < 0.5) i++;
      else j++;
    }
  }
  return { region: region.id, nodes };
}

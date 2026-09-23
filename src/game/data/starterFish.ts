export type Direction = "up" | "right" | "down" | "left";
export type Owner = "player" | "rival";
export type EdgeEffect = "standard" | "double" | "weak" | "bigger-fish" | "swap" | "hook" | "wave";

export interface CardEdge {
  direction: Direction;
  effect: EdgeEffect;
}

export interface FishCard {
  id: string;
  name: string;
  species: string;
  texture: string;
  edges: CardEdge[];
  owner: Owner;
  condition: "healthy" | "knocked-out";
}

export const STARTERS = [
  { id: "minnow", name: "Minnow", species: "Shallows", texture: "minnow", edges: standard("up") },
  { id: "anchovy", name: "Anchovy", species: "Coast", texture: "anchovy", edges: standard("right") },
  { id: "sardine", name: "Sardine", species: "Open Water", texture: "sardine", edges: standard("down") },
  { id: "goby", name: "Goby", species: "Tidepool", texture: "goby", edges: standard("left") },
  { id: "octopus", name: "Octopus", species: "Reef", texture: "octopus", edges: standard("left", "down", "right") },
  { id: "crab", name: "Crab", species: "Shoreline", texture: "crab", edges: standard("left", "up", "right") },
  { id: "blenny", name: "Tidepool Blenny", species: "Tidepool", texture: "blenny", edges: standard("up", "right") },
  { id: "shrimp", name: "Shore Shrimp", species: "Shoreline", texture: "shrimp", edges: standard("right", "down") },
  { id: "sea-star", name: "Sea Star", species: "Reef", texture: "sea-star", edges: standard("left", "right") },
  { id: "swordfish", name: "Swordfish", species: "Open Ocean", texture: "swordfish", edges: [edge("right", "double"), edge("left", "weak")] },
  { id: "barracuda", name: "Barracuda", species: "Open Ocean", texture: "barracuda", edges: [edge("right", "bigger-fish"), edge("up", "weak"), edge("down", "weak")] },
  { id: "hypno-squid", name: "Hypno Squid", species: "Bermuda Triangle", texture: "hypno-squid", edges: [edge("right", "swap"), edge("up", "weak"), edge("down", "weak")] },
  { id: "lure", name: "Lure", species: "Curio", texture: "lure", edges: [edge("down", "hook")] },
  { id: "ocean-sunfish", name: "Ocean Sunfish", species: "Open Ocean", texture: "ocean-sunfish", edges: [edge("down", "wave")] },
] satisfies Omit<FishCard, "owner" | "condition">[];

function edge(direction: Direction, effect: EdgeEffect): CardEdge {
  return { direction, effect };
}

function standard(...directions: Direction[]): CardEdge[] {
  return directions.map((direction) => edge(direction, "standard"));
}

export function createStarterDeck(owner: Owner): FishCard[] {
  return STARTERS.flatMap((fish) => [0, 1].map((copy) => ({
    ...fish,
    id: `${owner}-${fish.id}-${copy + 1}`,
    owner,
    condition: "healthy" as const,
  })));
}

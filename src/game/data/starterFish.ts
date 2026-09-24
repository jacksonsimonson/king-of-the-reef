export type Direction = "up" | "right" | "down" | "left";
export type Owner = "player" | "rival";
export type EdgeEffect = "standard" | "double" | "weak" | "bigger-fish" | "swap" | "hook" | "wave" | "shock" | "spines";
export type Rarity = "Common" | "Uncommon" | "Rare" | "Extremely Rare";

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
  condition: "healthy" | "killed";
  ability?: "revelation";
}

export const STARTERS: Omit<FishCard, "owner" | "condition">[] = [
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
  { id: "garden-eel", name: "Garden Eel", species: "Reef", texture: "garden-eel", edges: standard("up", "down") },
  { id: "hermit-crab", name: "Hermit Crab", species: "Tidepool", texture: "hermit-crab", edges: standard("up", "left") },
  { id: "flounder", name: "Flounder", species: "Shallows", texture: "flounder", edges: standard("down", "left") },
  { id: "lionfish", name: "Lionfish", species: "Reef", texture: "lionfish", edges: standard("up", "right", "down") },
  { id: "mantis-shrimp", name: "Mantis Shrimp", species: "Reef", texture: "mantis-shrimp", edges: standard("up", "down", "left") },
  { id: "pufferfish", name: "Pufferfish", species: "Reef", texture: "pufferfish", edges: standard("up", "right", "down", "left") },
  { id: "boxfish", name: "Boxfish", species: "Reef", texture: "boxfish", edges: ["up", "right", "down", "left"].map((d) => edge(d as Direction, "weak")) },
  { id: "needlefish", name: "Needlefish", species: "Shallows", texture: "needlefish", edges: [edge("right", "double")] },
  { id: "seahorse", name: "Seahorse", species: "Reef", texture: "seahorse", edges: [edge("up", "hook"), edge("down", "hook")] },
  { id: "electric-eel", name: "Electric Eel", species: "Reef", texture: "electric-eel", edges: ["up", "right", "down", "left"].map((d) => edge(d as Direction, "shock")) },
  { id: "sea-urchin", name: "Sea Urchin", species: "Reef", texture: "sea-urchin", edges: ["up", "right", "down", "left"].map((d) => edge(d as Direction, "spines")) },
  { id: "invisible-ink-squid", name: "Invisible Ink Squid", species: "Reef", texture: "invisible-ink-squid", edges: [edge("up", "standard"), edge("down", "weak")], ability: "revelation" },
  { id: "moray-eel", name: "Moray Eel", species: "Reef", texture: "moray-eel", edges: [edge("right", "bigger-fish")] },
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

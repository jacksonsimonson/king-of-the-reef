import { REEF_ART_CARDS } from "./reefArtCards.ts";
import { REEF_DESIGNS } from "./reefDesigns.ts";

import { OPEN_OCEAN_CARDS } from "./openOceanCards.ts";
import { OCEAN_DESIGNS } from "./oceanDesigns.ts";
import { BERMUDA_CARDS } from "./bermudaCards.ts";
import { BERMUDA_DESIGNS } from "./bermudaDesigns.ts";

export type Direction = "up" | "right" | "down" | "left";
export type Owner = "player" | "rival";
export type EdgeEffect = "standard" | "double" | "weak" | "bigger-fish" | "swap" | "hook" | "wave" | "shock" | "spines" | "ram" | "follow-current" | "bounce" | "dive";
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
  ability?: "revelation" | "rally";
}

export const LEGACY_STARTERS: Omit<FishCard, "owner" | "condition">[] = [
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
  { id: "parrotfish", name: "Parrotfish", species: "Reef", texture: "parrotfish", edges: [edge("up", "double"), edge("down", "weak")] },
  { id: "pistol-shrimp", name: "Pistol Shrimp", species: "Reef", texture: "pistol-shrimp", edges: [edge("right", "shock"), edge("down", "standard")] },
  { id: "frogfish", name: "Frogfish", species: "Reef", texture: "frogfish", edges: [edge("left", "hook"), edge("right", "standard")] },
  { id: "stonefish", name: "Stonefish", species: "Reef", texture: "stonefish", edges: [edge("left", "spines"), edge("right", "spines"), edge("down", "weak")] },
  { id: "titan-triggerfish", name: "Titan Triggerfish", species: "Reef", texture: "titan-triggerfish", edges: [edge("left", "double"), edge("up", "standard"), edge("right", "weak")] },
  { id: "crown-of-thorns", name: "Crown-of-Thorns Starfish", species: "Reef", texture: "crown-of-thorns", edges: [edge("left", "spines"), edge("right", "spines"), edge("up", "standard")] },
  { id: "decorator-crab", name: "Decorator Crab", species: "Reef", texture: "decorator-crab", edges: [edge("up", "hook"), edge("left", "weak"), edge("right", "weak")] },
  { id: "coral-grouper", name: "Coral Grouper", species: "Reef", texture: "coral-grouper", edges: standard("up", "right", "down"), ability: "rally" },
] satisfies Omit<FishCard, "owner" | "condition">[];

export const PRE_OCEAN_STARTERS: Omit<FishCard, "owner" | "condition">[] = [...LEGACY_STARTERS, ...REEF_ART_CARDS].map((fish) => ({
  ...fish, edges: REEF_DESIGNS[fish.texture]?.edges ?? fish.edges,
}));

export const STARTERS: Omit<FishCard, "owner" | "condition">[] = [
  ...PRE_OCEAN_STARTERS,
  ...OPEN_OCEAN_CARDS.map(fish => ({
    id: fish.id, name: fish.name, texture: fish.texture, species: "Open Ocean",
    edges: OCEAN_DESIGNS[fish.texture].edges,
  })),
  ...BERMUDA_CARDS.map(fish => ({
    id: fish.id, name: fish.name, texture: fish.texture, species: "Bermuda Triangle",
    edges: BERMUDA_DESIGNS[fish.texture].edges,
  })),
];

// Catalog that shipped before roster snapshots; keep its order stable for legacy saves.
export const ORIGINAL_FISH_TEXTURES = STARTERS.slice(0, 27).map((fish) => fish.texture);

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

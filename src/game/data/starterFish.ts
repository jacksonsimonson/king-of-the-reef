export type Direction = "up" | "right" | "down" | "left";
export type Owner = "player" | "rival";

export interface FishCard {
  id: string;
  name: string;
  species: string;
  texture: string;
  directions: Direction[];
  owner: Owner;
  condition: "healthy" | "knocked-out";
}

export const STARTERS = [
  { id: "minnow", name: "Minnow", species: "Shallows", texture: "minnow", directions: ["up"] },
  { id: "anchovy", name: "Anchovy", species: "Coast", texture: "anchovy", directions: ["right"] },
  { id: "sardine", name: "Sardine", species: "Open Water", texture: "sardine", directions: ["down"] },
  { id: "goby", name: "Goby", species: "Tidepool", texture: "goby", directions: ["left"] },
  { id: "octopus", name: "Octopus", species: "Reef", texture: "octopus", directions: ["left", "up", "right"] },
] satisfies Omit<FishCard, "owner" | "condition">[];

export function createStarterDeck(owner: Owner): FishCard[] {
  return STARTERS.flatMap((fish) => [0, 1].map((copy) => ({
    ...fish,
    id: `${owner}-${fish.id}-${copy + 1}`,
    owner,
    condition: "healthy" as const,
  })));
}

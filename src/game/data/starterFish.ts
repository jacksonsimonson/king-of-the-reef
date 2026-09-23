export type Direction = "up" | "right" | "down" | "left";
export type Owner = "player" | "rival";

export interface FishCard {
  id: string;
  name: string;
  species: string;
  texture: string;
  directions: Direction[];
  owner: Owner;
}

const STARTERS = [
  { id: "minnow", name: "Minnow", species: "Shallows", texture: "minnow", directions: ["up"] },
  { id: "anchovy", name: "Anchovy", species: "Coast", texture: "anchovy", directions: ["right"] },
  { id: "sardine", name: "Sardine", species: "Open Water", texture: "sardine", directions: ["down"] },
  { id: "goby", name: "Goby", species: "Tidepool", texture: "goby", directions: ["left"] },
  { id: "octopus", name: "Octopus", species: "Reef", texture: "octopus", directions: ["left", "up", "right"] },
] satisfies Omit<FishCard, "owner">[];

export function createStarterSchool(owner: Owner): FishCard[] {
  return STARTERS.map((fish) => ({ ...fish, id: `${owner}-${fish.id}`, owner }));
}

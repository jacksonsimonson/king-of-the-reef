export type Direction = "up" | "right" | "down" | "left";
export type Owner = "player" | "rival";

export interface FishCard {
  id: string;
  name: string;
  species: string;
  texture: string;
  direction: Direction;
  owner: Owner;
}

const STARTERS = [
  { id: "minnow", name: "Minnow", species: "Shallows", texture: "minnow", direction: "up" },
  { id: "anchovy", name: "Anchovy", species: "Coast", texture: "anchovy", direction: "right" },
  { id: "sardine", name: "Sardine", species: "Open Water", texture: "sardine", direction: "down" },
  { id: "goby", name: "Goby", species: "Tidepool", texture: "goby", direction: "left" },
] satisfies Omit<FishCard, "owner">[];

export function createStarterSchool(owner: Owner): FishCard[] {
  return STARTERS.map((fish) => ({ ...fish, id: `${owner}-${fish.id}`, owner }));
}

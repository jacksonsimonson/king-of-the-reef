import type { Rarity } from "./starterFish.ts";

export type BermudaZone = "wreck-field" | "storm-convergence" | "triangles-heart";
export type BermudaCreatureType = "fish" | "sharks-rays" | "cephalopods" | "crustaceans" | "jellies-anemones" | "curios";

export interface BermudaCard {
  id: string;
  name: string;
  texture: string;
  zone: BermudaZone;
  type: BermudaCreatureType;
  rarity: Rarity;
}

const card = (texture: string, name: string, zone: BermudaZone, type: BermudaCreatureType, rarity: Rarity): BermudaCard =>
  ({ id: texture, name, texture, zone, type, rarity });

export const BERMUDA_CARDS: readonly BermudaCard[] = [
  card("anchor-crab", "Anchor Crab", "wreck-field", "crustaceans", "Uncommon"),
  card("shipwreck-moray", "Shipwreck Moray", "wreck-field", "fish", "Rare"),
  card("chain-catshark", "Chain Catshark", "wreck-field", "sharks-rays", "Rare"),
  card("rust-lobster", "Rust Lobster", "wreck-field", "crustaceans", "Uncommon"),
  card("compass-jelly", "Compass Jelly", "wreck-field", "jellies-anemones", "Rare"),
  card("cannonball-ray", "Cannonball Ray", "wreck-field", "sharks-rays", "Rare"),
  card("bilge-eel", "Bilge Eel", "wreck-field", "fish", "Uncommon"),
  card("figurehead-fish", "Figurehead Fish", "wreck-field", "fish", "Uncommon"),
  card("ghost-net", "Ghost Net", "wreck-field", "curios", "Rare"),
  card("mimic-chest", "Mimic Chest", "wreck-field", "curios", "Extremely Rare"),
  card("skeleton-fisherman", "Skeleton Fisherman", "wreck-field", "curios", "Rare"),
  card("bottomless-maw", "Bottomless Maw", "triangles-heart", "fish", "Extremely Rare"),
  card("lightning-marlin", "Lightning Marlin", "storm-convergence", "fish", "Rare"),
  card("thunder-jelly", "Thunder Jelly", "storm-convergence", "jellies-anemones", "Rare"),
  card("squall-crab", "Squall Crab", "storm-convergence", "crustaceans", "Extremely Rare"),
] as const;

export const BERMUDA_POOL = BERMUDA_CARDS.map(card => card.texture);
export function bermudaCard(texture: string): BermudaCard | undefined {
  return BERMUDA_CARDS.find(card => card.texture === texture);
}

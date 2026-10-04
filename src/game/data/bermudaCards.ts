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
  card("drowned-diver", "Drowned Diver", "wreck-field", "curios", "Rare"),
  card("buoy-jelly", "Buoy Jelly", "wreck-field", "jellies-anemones", "Uncommon"),
  card("bonefish", "Bonefish", "wreck-field", "fish", "Rare"),
  card("ghost-ship", "Ghost Ship", "wreck-field", "curios", "Extremely Rare"),
  card("graveyard-leviathan", "Graveyard Fleet", "wreck-field", "curios", "Extremely Rare"),
  card("lighthouse-hermit", "Lighthouse Hermit", "wreck-field", "crustaceans", "Rare"),
  card("lightning-marlin", "Lightning Marlin", "storm-convergence", "fish", "Rare"),
  card("thunder-jelly", "Thunder Jelly", "storm-convergence", "jellies-anemones", "Rare"),
  card("squall-crab", "Squall Crab", "storm-convergence", "crustaceans", "Extremely Rare"),
  card("tempest-seahorse", "Drowned Admiral", "storm-convergence", "curios", "Rare"),
  card("stormfin-tuna", "Lightning Skeleton", "storm-convergence", "fish", "Rare"),
  card("stormback-whale", "Stormback Whale", "storm-convergence", "curios", "Extremely Rare"),
  card("eye-of-the-storm", "Eye of the Storm", "storm-convergence", "curios", "Extremely Rare"),
  card("black-squall", "Black Squall", "storm-convergence", "curios", "Rare"),
  card("bottomless-maw", "Bottomless Maw", "triangles-heart", "fish", "Extremely Rare"),
  card("void-angler", "Void Angler", "triangles-heart", "fish", "Extremely Rare"),
  card("phantom-shark", "Phantom Shark", "triangles-heart", "sharks-rays", "Rare"),
  card("living-whirlpool", "Living Whirlpool", "triangles-heart", "curios", "Extremely Rare"),
  card("abyssal-spadefish", "Abyssal Spadefish", "triangles-heart", "fish", "Rare"),
  card("mobius-eel", "Mobius Eel", "triangles-heart", "fish", "Extremely Rare"),
  card("escher-seahorse", "Escher Seahorse", "triangles-heart", "fish", "Rare"),
  card("mountain-ray", "Mountain Ray", "triangles-heart", "sharks-rays", "Extremely Rare"),
  card("fossil-from-tomorrow", "Fossil from Tomorrow", "triangles-heart", "curios", "Extremely Rare"),
  card("triangle-shard", "Triangle Shard", "triangles-heart", "curios", "Extremely Rare"),
  card("reef-titan", "Reef Titan", "triangles-heart", "crustaceans", "Extremely Rare"),
  card("paradox-puffer", "Paradox Puffer", "triangles-heart", "fish", "Rare"),
  card("map-serpent", "Map Serpent", "triangles-heart", "curios", "Extremely Rare"),
  card("red-door", "The Red Door", "triangles-heart", "curios", "Extremely Rare"),
  card("bottle-ocean", "Bottle Ocean", "triangles-heart", "curios", "Extremely Rare"),
  card("split-timeline-shark", "Split-Timeline Shark", "triangles-heart", "sharks-rays", "Rare"),
  card("abyssal-sharktopus", "Abyssal Sharktopus", "triangles-heart", "cephalopods", "Extremely Rare"),
] as const;

export const BERMUDA_POOL = BERMUDA_CARDS.map(card => card.texture);
export function bermudaCard(texture: string): BermudaCard | undefined {
  return BERMUDA_CARDS.find(card => card.texture === texture);
}

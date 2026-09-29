import type { Rarity } from "./starterFish.ts";

export type OpenOceanZone = "continental-shelf" | "polar-current" | "midnight-trench";
export type OceanCreatureType = "fish" | "sharks-rays" | "reptiles-mammals" | "cephalopods" | "crustaceans" | "mollusks" | "jellies-anemones" | "curios";

/**
 * Art-first manifest for the Open Ocean expansion.
 *
 * Entries stay out of STARTERS and encounter pools until their 64px sprite and
 * edge design are approved. This gives imported art a stable texture path,
 * zone, gallery order and initial acquisition tier without exposing unfinished
 * cards in saved runs.
 */
export interface PlannedOpenOceanCard {
  id: string;
  name: string;
  texture: string;
  zone: OpenOceanZone;
  type: OceanCreatureType;
  rarity: Rarity;
  art: "awaiting-art" | "ready";
}

const card = (
  texture: string,
  name: string,
  zone: OpenOceanZone,
  type: OceanCreatureType,
  rarity: Rarity,
  art: PlannedOpenOceanCard["art"] = "awaiting-art",
): PlannedOpenOceanCard => ({ id: texture, name, texture, zone, type, rarity, art });

export const OPEN_OCEAN_CARDS: readonly PlannedOpenOceanCard[] = [
  // Continental Shelf: recognizable pelagic animals and surface travelers.
  card("yellowfin-tuna", "Yellowfin Tuna", "continental-shelf", "fish", "Common", "ready"),
  card("mahi-mahi", "Mahi-Mahi", "continental-shelf", "fish", "Uncommon", "ready"),
  card("wahoo", "Wahoo", "continental-shelf", "fish", "Uncommon", "ready"),
  card("flying-fish", "Flying Fish", "continental-shelf", "fish", "Common", "ready"),
  card("sailfish", "Sailfish", "continental-shelf", "fish", "Rare", "ready"),
  card("great-white-shark", "Great White Shark", "continental-shelf", "sharks-rays", "Extremely Rare", "ready"),
  card("thresher-shark", "Thresher Shark", "continental-shelf", "sharks-rays", "Rare", "ready"),
  card("whale-shark", "Whale Shark", "continental-shelf", "sharks-rays", "Rare", "ready"),
  card("giant-oceanic-manta-ray", "Giant Oceanic Manta Ray", "continental-shelf", "sharks-rays", "Rare", "ready"),
  card("leatherback-sea-turtle", "Leatherback Sea Turtle", "continental-shelf", "reptiles-mammals", "Uncommon", "ready"),
  card("common-dolphin", "Common Dolphin", "continental-shelf", "reptiles-mammals", "Uncommon"),
  card("humpback-whale", "Humpback Whale", "continental-shelf", "reptiles-mammals", "Extremely Rare"),
  card("orca", "Orca", "continental-shelf", "reptiles-mammals", "Extremely Rare"),
  card("portuguese-man-of-war", "Portuguese Man-of-War", "continental-shelf", "jellies-anemones", "Uncommon"),
  card("pelagic-octopus", "Pelagic Octopus", "continental-shelf", "cephalopods", "Uncommon"),
  card("paper-nautilus", "Paper Nautilus", "continental-shelf", "mollusks", "Rare"),
  card("sea-snake", "Sea Snake", "continental-shelf", "reptiles-mammals", "Rare"),
  card("albatross", "Albatross", "continental-shelf", "curios", "Rare"),

  // Polar Current: cold-water fish, ice wildlife and unmistakable polar icons.
  card("arctic-cod", "Arctic Cod", "polar-current", "fish", "Common"),
  card("greenland-shark", "Greenland Shark", "polar-current", "sharks-rays", "Extremely Rare"),
  card("narwhal", "Narwhal", "polar-current", "reptiles-mammals", "Rare"),
  card("beluga-whale", "Beluga Whale", "polar-current", "reptiles-mammals", "Uncommon"),
  card("bowhead-whale", "Bowhead Whale", "polar-current", "reptiles-mammals", "Extremely Rare"),
  card("walrus", "Walrus", "polar-current", "reptiles-mammals", "Rare"),
  card("ringed-seal", "Ringed Seal", "polar-current", "reptiles-mammals", "Common"),
  card("polar-bear", "Polar Bear", "polar-current", "reptiles-mammals", "Extremely Rare"),
  card("emperor-penguin", "Emperor Penguin", "polar-current", "curios", "Uncommon"),
  card("atlantic-puffin", "Atlantic Puffin", "polar-current", "curios", "Common"),
  card("king-crab", "King Crab", "polar-current", "crustaceans", "Uncommon"),
  card("antarctic-krill-swarm", "Antarctic Krill Swarm", "polar-current", "crustaceans", "Common"),
  card("sea-angel", "Sea Angel", "polar-current", "mollusks", "Uncommon"),
  card("colossal-squid", "Colossal Squid", "polar-current", "cephalopods", "Extremely Rare"),
  card("leopard-seal", "Leopard Seal", "polar-current", "reptiles-mammals", "Rare"),

  // Midnight Trench: bioluminescence, pressure specialists and abyssal forms.
  card("lanternfish", "Lanternfish", "midnight-trench", "fish", "Common"),
  card("giant-oarfish", "Giant Oarfish", "midnight-trench", "fish", "Rare"),
  card("viperfish", "Viperfish", "midnight-trench", "fish", "Uncommon"),
  card("barreleye", "Barreleye", "midnight-trench", "fish", "Rare"),
  card("anglerfish", "Anglerfish", "midnight-trench", "fish", "Uncommon"),
  card("gulper-eel", "Gulper Eel", "midnight-trench", "fish", "Rare"),
  card("goblin-shark", "Goblin Shark", "midnight-trench", "sharks-rays", "Extremely Rare"),
  card("vampire-squid", "Vampire Squid", "midnight-trench", "cephalopods", "Rare"),
  card("giant-isopod", "Giant Isopod", "midnight-trench", "crustaceans", "Uncommon"),
  card("dumbo-octopus", "Dumbo Octopus", "midnight-trench", "cephalopods", "Rare"),
] as const;

export const OPEN_OCEAN_PLANNED_POOL = OPEN_OCEAN_CARDS.map((entry) => entry.texture);

export function plannedOpenOceanCard(texture: string): PlannedOpenOceanCard | undefined {
  return OPEN_OCEAN_CARDS.find((entry) => entry.texture === texture);
}

export function openOceanCardsInZone(zone: OpenOceanZone): readonly PlannedOpenOceanCard[] {
  return OPEN_OCEAN_CARDS.filter((entry) => entry.zone === zone);
}

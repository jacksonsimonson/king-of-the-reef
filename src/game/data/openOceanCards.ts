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
  card("blue-marlin", "Blue Marlin", "continental-shelf", "fish", "Rare", "ready"),
  card("great-white-shark", "Great White Shark", "continental-shelf", "sharks-rays", "Extremely Rare", "ready"),
  card("thresher-shark", "Thresher Shark", "continental-shelf", "sharks-rays", "Rare", "ready"),
  card("whale-shark", "Whale Shark", "continental-shelf", "sharks-rays", "Rare", "ready"),
  card("giant-oceanic-manta-ray", "Giant Oceanic Manta Ray", "continental-shelf", "sharks-rays", "Rare", "ready"),
  card("leatherback-sea-turtle", "Leatherback Sea Turtle", "continental-shelf", "reptiles-mammals", "Uncommon", "ready"),
  card("common-dolphin", "Common Dolphin", "continental-shelf", "reptiles-mammals", "Uncommon", "ready"),
  card("humpback-whale", "Humpback Whale", "continental-shelf", "reptiles-mammals", "Extremely Rare", "ready"),
  card("orca", "Orca", "continental-shelf", "reptiles-mammals", "Extremely Rare", "ready"),
  card("portuguese-man-of-war", "Portuguese Man-of-War", "continental-shelf", "jellies-anemones", "Uncommon", "ready"),
  card("pelagic-octopus", "Pelagic Octopus", "continental-shelf", "cephalopods", "Uncommon", "ready"),
  card("paper-nautilus", "Paper Nautilus", "continental-shelf", "mollusks", "Rare", "ready"),
  card("sea-snake", "Sea Snake", "continental-shelf", "reptiles-mammals", "Rare", "ready"),
  card("albatross", "Albatross", "continental-shelf", "curios", "Rare", "ready"),

  // Polar Current: cold-water fish, ice wildlife and unmistakable polar icons.
  card("arctic-cod", "Arctic Cod", "polar-current", "fish", "Common"),
  card("greenland-shark", "Greenland Shark", "polar-current", "sharks-rays", "Extremely Rare", "ready"),
  card("narwhal", "Narwhal", "polar-current", "reptiles-mammals", "Rare", "ready"),
  card("beluga-whale", "Beluga Whale", "polar-current", "reptiles-mammals", "Uncommon", "ready"),
  card("bowhead-whale", "Bowhead Whale", "polar-current", "reptiles-mammals", "Extremely Rare", "ready"),
  card("walrus", "Walrus", "polar-current", "reptiles-mammals", "Rare", "ready"),
  card("ringed-seal", "Ringed Seal", "polar-current", "reptiles-mammals", "Common", "ready"),
  card("polar-bear", "Polar Bear", "polar-current", "reptiles-mammals", "Extremely Rare", "ready"),
  card("emperor-penguin", "Emperor Penguin", "polar-current", "curios", "Uncommon", "ready"),
  card("atlantic-puffin", "Atlantic Puffin", "polar-current", "curios", "Common", "ready"),
  card("king-crab", "King Crab", "polar-current", "crustaceans", "Uncommon", "ready"),
  card("antarctic-krill-swarm", "Antarctic Krill Swarm", "polar-current", "crustaceans", "Common", "ready"),
  card("sea-angel", "Sea Angel", "polar-current", "mollusks", "Uncommon", "ready"),
  card("colossal-squid", "Colossal Squid", "polar-current", "cephalopods", "Extremely Rare", "ready"),
  card("leopard-seal", "Leopard Seal", "polar-current", "reptiles-mammals", "Rare", "ready"),

  // Midnight Trench: bioluminescence, pressure specialists and abyssal forms.
  card("lanternfish", "Lanternfish", "midnight-trench", "fish", "Common", "ready"),
  card("giant-oarfish", "Giant Oarfish", "midnight-trench", "fish", "Rare", "ready"),
  card("viperfish", "Viperfish", "midnight-trench", "fish", "Uncommon", "ready"),
  card("barreleye", "Barreleye", "midnight-trench", "fish", "Rare", "ready"),
  card("anglerfish", "Anglerfish", "midnight-trench", "fish", "Uncommon", "ready"),
  card("gulper-eel", "Gulper Eel", "midnight-trench", "fish", "Rare", "ready"),
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

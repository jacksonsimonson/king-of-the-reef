import type { FishCard } from "./starterFish";
import { openOceanCard } from "./openOceanCards.ts";

export type GalleryEnvironment = "shoreline" | "ocean" | "bermuda";
type GalleryType = "fish" | "sharks-rays" | "reptiles-mammals" | "cephalopods" | "crustaceans" | "mollusks" | "echinoderms" | "jellies-anemones" | "corals-sponges" | "curios";

export const GALLERY_ENVIRONMENTS: Array<{ id: GalleryEnvironment; name: string; description: string }> = [
  { id: "shoreline", name: "THE SHORELINE", description: "Shallows, tidepools, seagrass beds, and coral reefs" },
  { id: "ocean", name: "OPEN OCEAN", description: "Pelagic waters, cold currents, and the deep" },
  { id: "bermuda", name: "BERMUDA TRIANGLE", description: "Storm waters, wreck fields, and unnatural depths" },
];

const TYPE_ORDER: GalleryType[] = [
  "fish", "sharks-rays", "reptiles-mammals", "cephalopods", "crustaceans",
  "mollusks", "echinoderms", "jellies-anemones", "corals-sponges", "curios",
];

const OPEN_OCEAN = new Set(["sardine", "swordfish", "barracuda", "ocean-sunfish"]);
const BERMUDA = new Set(["hypno-squid", "lure"]);

const TYPES: Partial<Record<string, GalleryType>> = {
  "blacktip-reef-shark": "sharks-rays", "nurse-shark": "sharks-rays", stingray: "sharks-rays",
  "spotted-eagle-ray": "sharks-rays", "epaulette-shark": "sharks-rays",
  "green-sea-turtle": "reptiles-mammals", "hawksbill-sea-turtle": "reptiles-mammals", "bottlenose-dolphin": "reptiles-mammals",
  octopus: "cephalopods", "hypno-squid": "cephalopods", "invisible-ink-squid": "cephalopods",
  crab: "crustaceans", shrimp: "crustaceans", "hermit-crab": "crustaceans", "mantis-shrimp": "crustaceans",
  "pistol-shrimp": "crustaceans", "decorator-crab": "crustaceans", "spiny-lobster": "crustaceans",
  "horseshoe-crab": "crustaceans", "coral-banded-shrimp": "crustaceans", "pom-pom-crab": "crustaceans", "arrow-crab": "crustaceans",
  "conch-snail": "mollusks", "cowrie-snail": "mollusks", chiton: "mollusks", "sea-hare": "mollusks",
  "spanish-dancer": "mollusks", "giant-clam": "mollusks", "crown-conch": "mollusks",
  "sea-star": "echinoderms", "sea-urchin": "echinoderms", "crown-of-thorns": "echinoderms",
  "sea-cucumber": "echinoderms", "sand-dollar": "echinoderms", "feather-star": "echinoderms",
  "brittle-star": "echinoderms", "cushion-star": "echinoderms",
  "moon-jellyfish": "jellies-anemones", "comb-jelly": "jellies-anemones", "sea-anemone": "jellies-anemones",
  "tube-sponge": "corals-sponges", "barrel-sponge": "corals-sponges", "brain-coral": "corals-sponges",
  "staghorn-coral": "corals-sponges", "goose-neck-barnacle": "crustaceans", "christmas-tree-worm": "mollusks",
  lure: "curios",
};

export function galleryEnvironment(texture: string): GalleryEnvironment {
  if (BERMUDA.has(texture)) return "bermuda";
  if (OPEN_OCEAN.has(texture) || openOceanCard(texture)) return "ocean";
  return "shoreline";
}

export function galleryType(texture: string): GalleryType {
  return TYPES[texture] ?? openOceanCard(texture)?.type ?? "fish";
}

export function catalogSections<T extends Pick<FishCard, "texture">>(cards: readonly T[]): Array<{ environment: typeof GALLERY_ENVIRONMENTS[number]; cards: T[] }> {
  const originalOrder = new Map(cards.map((card, index) => [card.texture, index]));
  return GALLERY_ENVIRONMENTS.map((environment) => ({
    environment,
    cards: cards.filter((card) => galleryEnvironment(card.texture) === environment.id).sort((a, b) => {
      const type = TYPE_ORDER.indexOf(galleryType(a.texture)) - TYPE_ORDER.indexOf(galleryType(b.texture));
      return type || originalOrder.get(a.texture)! - originalOrder.get(b.texture)!;
    }),
  })).filter((section) => section.cards.length);
}

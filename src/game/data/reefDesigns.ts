import type { CardEdge, Rarity } from "./starterFish.ts";

export interface ReefDesign { edges: CardEdge[]; rarity: Rarity; movement: "gradual" | "darter" | "runner" | "drifter" | "lurker"; rationale: string }

// Clockwise edge order is also the placement resolution order.
export const REEF_DESIGNS: Record<string, ReefDesign> = {
  "minnow": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "gradual",
    "rationale": "Small introductory swimmer"
  },
  "anchovy": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "runner",
    "rationale": "Forward schooling swimmer"
  },
  "sardine": {
    "edges": [
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "runner",
    "rationale": "Downward schooling swimmer"
  },
  "goby": {
    "edges": [
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Retreat toward a burrow"
  },
  "blenny": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "darter",
    "rationale": "Darts from rock cover"
  },
  "flounder": {
    "edges": [
      {
        "direction": "down",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Low seafloor movement"
  },
  "clownfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "darter",
    "rationale": "Territorial short darts"
  },
  "cleaner-wrasse": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "darter",
    "rationale": "Agile movement around hosts"
  },
  "blue-tang": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "gradual",
    "rationale": "Basic reef swimmer"
  },
  "yellow-tang": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "gradual",
    "rationale": "Basic vertical coverage"
  },
  "butterflyfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "gradual",
    "rationale": "Broad grazing movement"
  },
  "moorish-idol": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "gradual",
    "rationale": "Tall maneuverable swimmer"
  },
  "queen-angelfish": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "gradual",
    "rationale": "Broad reef coverage"
  },
  "coral-grouper": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "darter",
    "rationale": "Territorial hunter; retains Rally"
  },
  "parrotfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "gradual",
    "rationale": "Robust grazer; completes basic layouts"
  },
  "octopus": {
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      },
      {
        "direction": "down",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "darter",
    "rationale": "Two grasping arms and rear jet movement"
  },
  "crab": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Upper shell and lateral claws"
  },
  "shrimp": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "hook"
      }
    ],
    "rarity": "Common",
    "movement": "darter",
    "rationale": "Forward appendages and retreat defense"
  },
  "sea-star": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "hook"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Lateral leverage and underside tube feet"
  },
  "garden-eel": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "gradual",
    "rationale": "Exposed head and sheltered burrow"
  },
  "hermit-crab": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Forward claw and rear shell"
  },
  "lionfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "spines"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "drifter",
    "rationale": "Venomous upper and lower spines"
  },
  "mantis-shrimp": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "double"
      }
    ],
    "rarity": "Uncommon",
    "movement": "darter",
    "rationale": "Armored back and forward striking club"
  },
  "pufferfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "drifter",
    "rationale": "Inflated protection with a small forward push"
  },
  "boxfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "weak"
      },
      {
        "direction": "down",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Rare",
    "movement": "gradual",
    "rationale": "Gimmick: rigid all-around armor, no offense"
  },
  "needlefish": {
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      }
    ],
    "rarity": "Uncommon",
    "movement": "runner",
    "rationale": "Focused forward jaws"
  },
  "seahorse": {
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      },
      {
        "direction": "down",
        "effect": "hook"
      }
    ],
    "rarity": "Uncommon",
    "movement": "drifter",
    "rationale": "Suction feeding and grasping tail"
  },
  "electric-eel": {
    "edges": [
      {
        "direction": "up",
        "effect": "shock"
      },
      {
        "direction": "right",
        "effect": "shock"
      },
      {
        "direction": "down",
        "effect": "shock"
      },
      {
        "direction": "left",
        "effect": "shock"
      }
    ],
    "rarity": "Rare",
    "movement": "runner",
    "rationale": "Gimmick: electrical discharge threatens every adjacent side"
  },
  "sea-urchin": {
    "edges": [
      {
        "direction": "up",
        "effect": "spines"
      },
      {
        "direction": "right",
        "effect": "spines"
      },
      {
        "direction": "down",
        "effect": "spines"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Gimmick: all-around spines, no active attack"
  },
  "invisible-ink-squid": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "darter",
    "rationale": "Soft-body defense and jet movement; retains Revelation"
  },
  "moray-eel": {
    "edges": [
      {
        "direction": "right",
        "effect": "bigger-fish"
      }
    ],
    "rarity": "Extremely Rare",
    "movement": "runner",
    "rationale": "Lethal forward jaws, three exposed sides"
  },
  "pistol-shrimp": {
    "edges": [
      {
        "direction": "right",
        "effect": "shock"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "darter",
    "rationale": "Concussive claw represented by Shock"
  },
  "frogfish": {
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Forward lure and protected rear against cover"
  },
  "stonefish": {
    "edges": [
      {
        "direction": "up",
        "effect": "spines"
      },
      {
        "direction": "down",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Dorsal venom and bottom support"
  },
  "titan-triggerfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "double"
      }
    ],
    "rarity": "Rare",
    "movement": "runner",
    "rationale": "Territorial striking and strong jaws"
  },
  "crown-of-thorns": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "spines"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Spiny arms with limited exposed movement"
  },
  "decorator-crab": {
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      },
      {
        "direction": "right",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Collecting appendages and protective covering"
  },
  "green-sea-turtle": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "gradual",
    "rationale": "Shell above and swimming fins below"
  },
  "hawksbill-sea-turtle": {
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Rare",
    "movement": "gradual",
    "rationale": "Strong beak and ventral shell"
  },
  "blacktip-reef-shark": {
    "edges": [
      {
        "direction": "right",
        "effect": "bigger-fish"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Extremely Rare",
    "movement": "runner",
    "rationale": "Forward predation with an exposed back"
  },
  "nurse-shark": {
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Suction mouth and bottom-resting body"
  },
  "stingray": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "gradual",
    "rationale": "Rear sting and protected underside"
  },
  "spotted-eagle-ray": {
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "runner",
    "rationale": "Crushing mouth and fin stroke"
  },
  "bottlenose-dolphin": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "double"
      }
    ],
    "rarity": "Rare",
    "movement": "runner",
    "rationale": "Agile surfacing and powerful forward pressure"
  },
  "porcupinefish": {
    "edges": [
      {
        "direction": "up",
        "effect": "spines"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "drifter",
    "rationale": "Inflated flank spines with a forward push"
  },
  "clown-triggerfish": {
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "down",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "darter",
    "rationale": "Strong jaws and protected retreat"
  },
  "spiny-lobster": {
    "edges": [
      {
        "direction": "up",
        "effect": "spines"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Spiny back, antennae, and tail thrust"
  },
  "horseshoe-crab": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Broad carapace and small forward movement"
  },
  "sea-cucumber": {
    "edges": [
      {
        "direction": "down",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Underside tube feet"
  },
  "sand-dollar": {
    "edges": [
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Low protective seafloor profile"
  },
  "conch-snail": {
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Crawling foot and bottom support"
  },
  "cowrie-snail": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Upper and rear shell protection"
  },
  "chiton": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Upper plates and attached underside"
  },
  "sea-hare": {
    "edges": [
      {
        "direction": "down",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Crawling underside and rear escape movement"
  },
  "spanish-dancer": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "drifter",
    "rationale": "Swimming mantle and gripping foot"
  },
  "feather-star": {
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      },
      {
        "direction": "down",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "drifter",
    "rationale": "Feeding arms reach and gather"
  },
  "brittle-star": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "hook"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Arm leverage and gripping feet"
  },
  "cushion-star": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Thick body and lateral arm"
  },
  "moon-jellyfish": {
    "edges": [
      {
        "direction": "down",
        "effect": "spines"
      }
    ],
    "rarity": "Uncommon",
    "movement": "drifter",
    "rationale": "Stinging tentacles below"
  },
  "comb-jelly": {
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      }
    ],
    "rarity": "Uncommon",
    "movement": "drifter",
    "rationale": "Sticky prey-catching tentacles, no sting"
  },
  "sea-anemone": {
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Prey-catching crown and anchored base"
  },
  "giant-clam": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "weak"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Gimmick: three shell defenses, rear remains open"
  },
  "tube-sponge": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Upright stationary filter feeder"
  },
  "barrel-sponge": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Thick body and abstracted water flow"
  },
  "brain-coral": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "weak"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Two faces of hard skeleton"
  },
  "staghorn-coral": {
    "edges": [
      {
        "direction": "up",
        "effect": "spines"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Two exposed sharp branches"
  },
  "goose-neck-barnacle": {
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Feeding cirri and fixed attachment"
  },
  "christmas-tree-worm": {
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      }
    ],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Exposed feeding crown"
  },
  "crown-conch": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Predatory mouth and armored shell"
  },
  "coral-banded-shrimp": {
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "darter",
    "rationale": "Grasping claws and tail escape"
  },
  "pom-pom-crab": {
    "edges": [
      {
        "direction": "right",
        "effect": "spines"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Stinging anemones carried in both claws"
  },
  "arrow-crab": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "hook"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Long legs and reaching claw"
  },
  "remora": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "hook"
      }
    ],
    "rarity": "Uncommon",
    "movement": "runner",
    "rationale": "Dorsal attachment disc and approach to host"
  },
  "trumpetfish": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Forward suction mouth and backward swimming"
  },
  "flying-gurnard": {
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ],
    "rarity": "Uncommon",
    "movement": "gradual",
    "rationale": "Spread fins and protective retreat"
  },
  "epaulette-shark": {
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "left",
        "effect": "hook"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Forward jaws and gripping walking fins"
  }
};

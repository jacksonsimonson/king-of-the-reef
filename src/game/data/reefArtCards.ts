import type { FishCard } from "./starterFish";

// Expanded Reef creatures, now playable. Retain source order for saved identities.
export const REEF_ART_CARDS: Omit<FishCard, "owner" | "condition">[] = [
  {
    "id": "green-sea-turtle",
    "name": "Green Sea Turtle",
    "species": "Reef",
    "texture": "green-sea-turtle",
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
    ]
  },
  {
    "id": "hawksbill-sea-turtle",
    "name": "Hawksbill Sea Turtle",
    "species": "Reef",
    "texture": "hawksbill-sea-turtle",
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "blacktip-reef-shark",
    "name": "Blacktip Reef Shark",
    "species": "Reef",
    "texture": "blacktip-reef-shark",
    "edges": [
      {
        "direction": "right",
        "effect": "bigger-fish"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "nurse-shark",
    "name": "Nurse Shark",
    "species": "Reef",
    "texture": "nurse-shark",
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "stingray",
    "name": "Stingray",
    "species": "Reef",
    "texture": "stingray",
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
    ]
  },
  {
    "id": "spotted-eagle-ray",
    "name": "Spotted Eagle Ray",
    "species": "Reef",
    "texture": "spotted-eagle-ray",
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "bottlenose-dolphin",
    "name": "Bottlenose Dolphin",
    "species": "Reef",
    "texture": "bottlenose-dolphin",
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "double"
      }
    ]
  },
  {
    "id": "clownfish",
    "name": "Clownfish",
    "species": "Reef",
    "texture": "clownfish",
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "blue-tang",
    "name": "Blue Tang",
    "species": "Reef",
    "texture": "blue-tang",
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "yellow-tang",
    "name": "Yellow Tang",
    "species": "Reef",
    "texture": "yellow-tang",
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "queen-angelfish",
    "name": "Queen Angelfish",
    "species": "Reef",
    "texture": "queen-angelfish",
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
    ]
  },
  {
    "id": "butterflyfish",
    "name": "Butterflyfish",
    "species": "Reef",
    "texture": "butterflyfish",
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
    ]
  },
  {
    "id": "moorish-idol",
    "name": "Moorish Idol",
    "species": "Reef",
    "texture": "moorish-idol",
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
    ]
  },
  {
    "id": "porcupinefish",
    "name": "Porcupinefish",
    "species": "Reef",
    "texture": "porcupinefish",
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
    ]
  },
  {
    "id": "clown-triggerfish",
    "name": "Clown Triggerfish",
    "species": "Reef",
    "texture": "clown-triggerfish",
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
    ]
  },
  {
    "id": "cleaner-wrasse",
    "name": "Cleaner Wrasse",
    "species": "Reef",
    "texture": "cleaner-wrasse",
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "spiny-lobster",
    "name": "Spiny Lobster",
    "species": "Reef",
    "texture": "spiny-lobster",
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
    ]
  },
  {
    "id": "horseshoe-crab",
    "name": "Horseshoe Crab",
    "species": "Reef",
    "texture": "horseshoe-crab",
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
    ]
  },
  {
    "id": "sea-cucumber",
    "name": "Sea Cucumber",
    "species": "Reef",
    "texture": "sea-cucumber",
    "edges": [
      {
        "direction": "down",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "sand-dollar",
    "name": "Sand Dollar",
    "species": "Reef",
    "texture": "sand-dollar",
    "edges": [
      {
        "direction": "down",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "conch-snail",
    "name": "Conch Snail",
    "species": "Reef",
    "texture": "conch-snail",
    "edges": [
      {
        "direction": "right",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "cowrie-snail",
    "name": "Cowrie Snail",
    "species": "Reef",
    "texture": "cowrie-snail",
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "chiton",
    "name": "Chiton",
    "species": "Reef",
    "texture": "chiton",
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "sea-hare",
    "name": "Sea Hare",
    "species": "Reef",
    "texture": "sea-hare",
    "edges": [
      {
        "direction": "down",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "spanish-dancer",
    "name": "Spanish Dancer",
    "species": "Reef",
    "texture": "spanish-dancer",
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
    ]
  },
  {
    "id": "feather-star",
    "name": "Feather Star",
    "species": "Reef",
    "texture": "feather-star",
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
    ]
  },
  {
    "id": "brittle-star",
    "name": "Brittle Star",
    "species": "Reef",
    "texture": "brittle-star",
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "down",
        "effect": "hook"
      }
    ]
  },
  {
    "id": "cushion-star",
    "name": "Cushion Star",
    "species": "Reef",
    "texture": "cushion-star",
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "moon-jellyfish",
    "name": "Moon Jellyfish",
    "species": "Reef",
    "texture": "moon-jellyfish",
    "edges": [
      {
        "direction": "down",
        "effect": "spines"
      }
    ]
  },
  {
    "id": "comb-jelly",
    "name": "Comb Jelly",
    "species": "Reef",
    "texture": "comb-jelly",
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      }
    ]
  },
  {
    "id": "sea-anemone",
    "name": "Sea Anemone",
    "species": "Reef",
    "texture": "sea-anemone",
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      },
      {
        "direction": "down",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "giant-clam",
    "name": "Giant Clam",
    "species": "Reef",
    "texture": "giant-clam",
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
    ]
  },
  {
    "id": "tube-sponge",
    "name": "Tube Sponge",
    "species": "Reef",
    "texture": "tube-sponge",
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "barrel-sponge",
    "name": "Barrel Sponge",
    "species": "Reef",
    "texture": "barrel-sponge",
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "brain-coral",
    "name": "Brain Coral",
    "species": "Reef",
    "texture": "brain-coral",
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "staghorn-coral",
    "name": "Staghorn Coral",
    "species": "Reef",
    "texture": "staghorn-coral",
    "edges": [
      {
        "direction": "up",
        "effect": "spines"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ]
  },
  {
    "id": "goose-neck-barnacle",
    "name": "Goose-Neck Barnacle",
    "species": "Reef",
    "texture": "goose-neck-barnacle",
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "weak"
      }
    ]
  },
  {
    "id": "christmas-tree-worm",
    "name": "Christmas Tree Worm",
    "species": "Reef",
    "texture": "christmas-tree-worm",
    "edges": [
      {
        "direction": "up",
        "effect": "hook"
      }
    ]
  },
  {
    "id": "crown-conch",
    "name": "Crown Conch",
    "species": "Reef",
    "texture": "crown-conch",
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
    ]
  },
  {
    "id": "coral-banded-shrimp",
    "name": "Coral Banded Shrimp",
    "species": "Reef",
    "texture": "coral-banded-shrimp",
    "edges": [
      {
        "direction": "right",
        "effect": "hook"
      },
      {
        "direction": "left",
        "effect": "standard"
      }
    ]
  },
  {
    "id": "pom-pom-crab",
    "name": "Pom-Pom Crab",
    "species": "Reef",
    "texture": "pom-pom-crab",
    "edges": [
      {
        "direction": "right",
        "effect": "spines"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ]
  },
  {
    "id": "arrow-crab",
    "name": "Arrow Crab",
    "species": "Reef",
    "texture": "arrow-crab",
    "edges": [
      {
        "direction": "up",
        "effect": "standard"
      },
      {
        "direction": "right",
        "effect": "hook"
      }
    ]
  },
  {
    "id": "remora",
    "name": "Remora",
    "species": "Reef",
    "texture": "remora",
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
      },
      {
        "direction": "right",
        "effect": "hook"
      }
    ]
  },
  {
    "id": "trumpetfish",
    "name": "Trumpetfish",
    "species": "Reef",
    "texture": "trumpetfish",
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
    ]
  },
  {
    "id": "flying-gurnard",
    "name": "Flying Gurnard",
    "species": "Reef",
    "texture": "flying-gurnard",
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
    ]
  },
  {
    "id": "epaulette-shark",
    "name": "Epaulette Shark",
    "species": "Reef",
    "texture": "epaulette-shark",
    "edges": [
      {
        "direction": "right",
        "effect": "double"
      },
      {
        "direction": "left",
        "effect": "hook"
      }
    ]
  }
];

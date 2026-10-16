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
    "rationale": "Upward guide: A small schooling swimmer delivers an ally from below with one precise push. Only the upper approach works; its other sides are open."
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
    "rationale": "Rightward guide: A narrow schooling fish delivers an ally from the left without disturbing other neighbors. No vertical reach and three open sides."
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
    "rationale": "Downward guide: A compact schooling fish guides an ally down a lane. Must approach from above; cannot contest other directions."
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
    "rationale": "Leftward guide: A small bottom-dweller nudges an ally left through a tight reef approach. Three open sides; needs a target immediately to its left."
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
    "rationale": "Corner guide: A maneuverable tidepool swimmer sets allies upward or rightward around a corner. Both edges fire; an unwanted second push can spoil a formation."
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
    "rationale": "Bottom-corner guide: A flat bottom swimmer guides neighbors down or left. Cannot act above/right; avoid pushing two allies when only one should move."
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
    "rationale": "Sheltered-corner guide: A small reef resident guides allies upward or leftward out of a crowded corner. Lower/right approaches remain exposed."
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
    "rationale": "Lateral formation guide: Works between larger fish, pushing neighbors outward along a horizontal lane. Needs room on both sides and has no vertical defense."
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
    "rationale": "Descending guide: Sweeping fins guide allies rightward and downward. Two edges can disturb an allied holder; left/top stay open."
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
    "rationale": "Vertical corridor guide: A grazing swimmer manages both ends of a vertical lane. Horizontal opponents can approach freely; both vertical pushes resolve."
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
    "rationale": "Upper-fan guide: Broad maneuvering fins organize neighbors above and to either side. Exposed below; lateral pushes may remove friendly holders."
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
    "rationale": "Left-fan guide: Its sweeping profile organizes the upper, lower and left approaches. Right flank stays open; broad coverage is less selective."
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
    "rationale": "Lower-fan guide: Broad fins fan allies right, down and left around a reef approach. Cannot affect the upper side; three pushes create collateral positioning risk."
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
    "rationale": "Reserve-guiding setter: Upper/right/lower shoves make Rally available while organizing the school around a large reef resident. Rally requires a successful enemy push; left side is open and broad firing risks friendly control."
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
    "rationale": "Radial space clearer: A robust reef grazer makes room in every adjacent direction. All four pushes fire: it cannot leave a vulnerable adjacent ally untouched; Double and Hook penetrate Standard."
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
    "rationale": "Multi-arm arranger: Right/down Hooks pull across gaps while a left arm pushes a nearby ally away. Needs precise spacing; no upper edge and all three arms act in order."
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
    "rationale": "Sideways lane setter: Sideways claws push left/right beneath a protected carapace. Open underside; both lateral pushes can disturb allies."
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
    "rationale": "Tail-and-claw arranger: A rightward tail push and leftward grasp manage opposite sides of a lane. Hook needs a gap; vertical approaches stay exposed."
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
    "rationale": "Tube-foot corner arranger: Rightward shove and downward Hook use neighboring arms for close and distant setup. Cannot affect above/left; the Hook needs an empty intervening tile."
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
    "rationale": "Burrow-mouth setter: The exposed head pushes upward while the sheltered lower side resists displacement. Cannot work sideways; lower Shield can also obstruct allied delivery."
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
    "rationale": "Shell-backed lateral setter: A forward claw pushes right while the rear shell protects the left. Open vertical approaches; needs a neighbor to move."
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
    "rationale": "Spiny forward setter: A rightward shove advances the formation between upper/lower venomous Spines. Spines retaliate against enemies but do not retain position; left side is open."
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
    "rationale": "Shielded puncher: A concentrated rightward Double punch breaks Standard defense under an upper guard. No left/down coverage; Double still stops at Shield and occupied landings."
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
    "rationale": "Armored corridor setter: Inflated upper/lower protection supports a rightward push through a lane. Open left side; cannot move itself onto a reef."
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
        "effect": "standard"
      }
    ],
    "rarity": "Rare",
    "movement": "gradual",
    "rationale": "Armored breach setter: Three rigid shell faces protect a leftward shove; a left Standard seam lets allied Double or Hook deliver it. No self-entry; enemies can exploit the same left seam with Double or Hook. The leftward shove can disturb allies."
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
    "rationale": "Precision penetrator: A narrow body commits to one rightward Double strike without side effects elsewhere. Three open sides; needs a target and clear landing."
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
    "rationale": "Vertical tether: A grasping tail controls the two vertical pull approaches. Each pull needs a gap; exposed horizontally."
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
    "rationale": "Formation disabler: Keep the coherent four-Shock gimmick: disable enemy edges so a later allied push can work. No displacement or edge defense; can shock allies, and Shields block Shock."
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
        "effect": "standard"
      },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Radial retaliating setter: Lower tube feet push an ally while three spiny sides punish direct enemy pushes. Needs delivery to score itself; underside lacks Spines and retaliation does not prevent movement."
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
    "rationale": "Information setter: Upper/left shoves and a lower guard keep Revelation useful alongside normal placement. Information does not score by itself; right side stays open and shoves can disrupt allies."
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
    "rationale": "Crevice ambusher: One rightward Bite threatens an exposed creature with no extra firing directions. Defenses or blocked destinations stop the kill; can bite an ally."
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
    "rationale": "Directional disabler: Rightward Shock opens a defense while a downward tail shove supplies ordinary setup. The shove cannot immediately exploit the right-hand Shock; it can also disable an ally."
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
    "rationale": "Sheltered lure: A rightward Hook draws prey or an ally closer while the left side stays guarded. Requires a gap; cannot kill with its lure or act vertically."
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
    "rationale": "Buried ambush setter: An upper spine punishes attack, a sheltered lower side guards, and a leftward shove clears a nearby lane. Right is open; only the upper side retaliates and no edge moves itself."
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
    "rationale": "Territorial flank breaker: A leftward Double bite-like shove drives its territorial attack; upper/right fin pushes clear nearby approaches. Open below; wide firing coverage can break allied formations."
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
    "rationale": "Spiny upward setter: An upward arm shove sets allies while lower/left thorns punish enemy pushes. Right side is open; retaliation does not hold a reef."
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
    "rationale": "Guarded claw puller: An upward Hook reaches over a gap beside a protected right flank. Open left/below; pulling a friendly holder can surrender a reef."
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
    "rationale": "Shell-led corner setter: The upper shell protects a swimmer that guides allies right and down. Exposed left; two pushes can conflict with an existing formation."
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
    "rationale": "Beaked lane breaker: A sharp rightward Double beak works above a protective lower shell. Open top/left; Shield still blocks the strike."
  },
  "blacktip-reef-shark": {
    "edges": [
      {
            "direction": "up",
            "effect": "bigger-fish"
      },
      {
            "direction": "down",
            "effect": "standard"
      }
],
    "rarity": "Extremely Rare",
    "movement": "runner",
    "rationale": "Vertical pursuit predator: An upward Bite hunts along a different approach from Moray, while a downward tail shove sets another lane. Horizontal sides are open; Bite and tail shove can hurt allies."
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
    "rationale": "Bottom suction puller: A rightward suction-like Hook arranges a lane above a guarded underside. No Bite; needs a gap and leaves top/left exposed."
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
    "rationale": "Tail-guarded setter: Rightward swimming shove, protected underside and a leftward tail spine form one forward-facing package. Open top; tail retaliation does not stop the ray being displaced."
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
    "rationale": "Diving lane breaker: A strong rightward Double approach pairs with a downward wing shove. No rear/top protection; the second push can disturb an ally."
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
    "rationale": "Cooperative lane breaker: A powerful rightward Double nose pairs with an upward allied setup push. Lower/left approaches are open; no guaranteed scoring entry."
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
    "rationale": "Inflated forward setter: A rightward shove works between upper/left spines of the inflated body. Open below; Spines do not provide passive push defense."
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
    "rationale": "Guarded territorial breaker: A rightward Double strike is backed by a left Shield and downward positioning shove. Top is open; Shield stops the strike and the downward push can hurt allies."
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
    "rationale": "Spined lateral setter: Sideways shoves arrange a lane under an upper spiny carapace. Open below; both lateral pushes may disturb friendly holders."
  },
  "horseshoe-crab": {
    "edges": [
      {
        "direction": "up",
        "effect": "weak"
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
    "movement": "lurker",
    "rationale": "Guarded downward setter: A broad carapace guards above/left while a downward shove delivers an ally. Right flank is open; downward pushes can remove friendly reef holders."
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
    "rationale": "Bottom-feeding arranger: Downward grasp and leftward body shove offer two distinct setup distances. Both edges can disrupt allies; top/right are open."
  },
  "sand-dollar": {
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
            "effect": "standard"
      }
],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Sediment-lane setter: Tube feet shift neighbors sideways while the flattened underside is shielded. Top is exposed; it pushes both sides, including friendly holders."
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
    "rationale": "Shell-foot setter: The foot pushes right while the shell protects the underside. Upper/left approaches are open; no self-entry."
  },
  "cowrie-snail": {
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
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Sheltered-foot setter: A smooth shell protects upper/left approaches while its foot shifts a neighbor right. Exposed underside; defensive faces also limit friendly repositioning."
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
      },
      {
            "direction": "left",
            "effect": "standard"
      }
],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Armored lateral setter: Dorsal plates protect a vertical axis while the foot moves a neighbor left. Open right side; requires an ally or target in reach."
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
    "rationale": "Retreating setter: A soft-bodied grazer shifts a neighbor left with a protected lower approach. Exposed above/right; no direct reef entry."
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
    "rationale": "Undulating arranger: Upper/left fin pushes and a downward Hook arrange a broad but deliberate dance around neighbors. Open right side; three sequential effects need careful spacing."
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
    "rationale": "Feeding-fan arranger: An upward Hook reaches with feeding arms while lower/left arms shove nearby creatures. Open right side; Hook needs a gap and the lower push can undo allied control."
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
    "rationale": "Vertical arm arranger: An upward shove and downward Hook distinguish close from distant arm reach. Horizontal sides stay open; no direct self-entry."
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
    "rationale": "Cushioned setter: A protected upper body supports a simple rightward tube-foot shove. Open below/left; only one active direction."
  },
  "moon-jellyfish": {
    "edges": [
      {
            "direction": "up",
            "effect": "standard"
      },
      {
            "direction": "down",
            "effect": "spines"
      }
],
    "rarity": "Uncommon",
    "movement": "drifter",
    "rationale": "Bell-and-tentacle setter: An upward bell pulse sets an ally while trailing lower tentacles retaliate. Both lateral sides are open; cannot defend its own reef against ordinary lateral pushes."
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
    "rationale": "Ciliary puller: A single rightward Hook gathers a creature toward the comb-current approach. Needs a one-tile gap; other sides are exposed."
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
    "rationale": "Anchored grasping setter: An upward Hook draws a creature toward a protected lower base. Not immovable: lateral approaches are open and Hook requires a gap."
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
    "rationale": "Open-hinge holder: A three-sided shell holds a delivered position while leaving a left-hand delivery hinge. Cannot act on placement; the same open hinge permits enemy displacement."
  },
  "tube-sponge": {
    "edges": [
      {
            "direction": "up",
            "effect": "weak"
      },
      {
            "direction": "down",
            "effect": "standard"
      }
],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Vertical flow setter: A protected upper rim and downward outflow provide a simple vertical setup action. Both flanks are open; no independent reef entry."
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
    "rationale": "Lateral flow setter: A protected upper rim redirects its useful setup flow leftward. Right/below are exposed; only one active direction."
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
      },
      {
            "direction": "down",
            "effect": "standard"
      }
],
    "rarity": "Common",
    "movement": "lurker",
    "rationale": "Sheltered reef setter: An upper/right defensive mound supports a downward setup shove. Left is open; defensive faces also constrain friendly delivery."
  },
  "staghorn-coral": {
    "edges": [
      {
            "direction": "up",
            "effect": "spines"
      },
      {
            "direction": "down",
            "effect": "standard"
      },
      {
            "direction": "left",
            "effect": "spines"
      }
],
    "rarity": "Uncommon",
    "movement": "lurker",
    "rationale": "Branching retaliating setter: A downward setup shove works beneath upper/left stinging branches. Open right; enemy pushes can move it despite Spines."
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
    "rationale": "Shell-backed reacher: An upward feeding reach pulls over a gap beside a shielded left shell. Right/below remain exposed; cannot pull an adjacent target."
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
    "rationale": "Feeding-crown puller: An upward Hook draws a distant creature toward its feeding crown. One approach only; no adjacent shove or other protection."
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
    "rationale": "Armored foot breaker: An upper shell supports a strong rightward Double shove; the foot also pushes left. Exposed below; two active sides trade precision for coverage."
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
    "rationale": "Claw-and-tail arranger: Rightward grasp and leftward tail shove mirror Shore Shrimp on the horizontal axis. Hook needs a gap; both vertical sides remain open."
  },
  "pom-pom-crab": {
    "edges": [
      {
        "direction": "right",
        "effect": "spines"
      },
      { "direction": "down", "effect": "standard" },
      {
        "direction": "left",
        "effect": "spines"
      }
    ],
    "rarity": "Rare",
    "movement": "lurker",
    "rationale": "Anemone-claw setter: A downward shove supplies setup while lateral anemone claws punish enemy pushes. Open top gives enemies a safe push; retaliation never guarantees reef retention."
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
    "rationale": "Long-claw corner setter: An upward shove pairs with a long rightward grasp across a gap. No lower/left edges; both effects can disturb allies."
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
    "rationale": "Attachment arranger: A rightward Hook draws a larger neighbor alongside beneath an upper guard. Does not ride its target; needs a gap and leaves lower/left sides open."
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
    "rationale": "Suction-lane arranger: A long rightward suction Hook works alongside upper/left fin shoves. Open underside; several effects require more planning than a single puller."
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
    "rationale": "Finned corner setter: Broad fins protect the left while guiding neighbors up and right. Open below; multiple pushes can displace friendly control."
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
    "rationale": "Walking lane controller: A rightward Double shove and leftward Hook model force in front and a gripping return approach. Both require a target; open vertical sides and no automatic self-movement."
  }
};

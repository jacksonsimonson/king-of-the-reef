# Open Ocean — complete regional role and balance pass

All **47/47** pool entries are reviewed: **11 layouts changed, 36 retained**. This includes the Sea Mine curio and original Swordfish, Barracuda and Ocean Sunfish. Each has an authored primary identity, ordinary-play plan and limitation in the [roster inventory](ROSTER_ROLE_INVENTORY.md#ocean--47-creatures) and collection journal. The inventory keeps revision-scoped relative component ranges, not objective prices or strength scores. Current assignments are in [Open Ocean Cards](OPEN_OCEAN_CARDS.md).

The source is `src/game/data/oceanRoles.ts`. This closes the regional review checklist; it does not imply perfect equality or rule out later human tuning. Rarity, prices, pool membership, art, fishing and full-card abilities are unchanged. Colossal Squid is an existing ordinary creature; this does not implement the postponed Colossal boss/deck feature.

## Internal family decisions

| Batch | Role, anchor and decision |
| --- | --- |
| Pursuers | Yellowfin is the simple Follow Current anchor. Wahoo trades the rear Standard for a perpendicular Double; Mahi trades pursuit for retreat. Keep all three: direction, compulsory movement and secondary collateral distinguish their jobs. |
| Bill strikers | Swordfish anchors precise Double with rear shelter. Sailfish/Marlin/Narwhal add line setup at Standard penetration, with different second-strike axes/order. Walrus becomes a guarded tusk setter rather than another Ram carrier. |
| Sweepers | Sunfish anchors a single fan; Krill adds a rear setup at the cost of compulsory collateral. Whale Shark/Leatherback trade coverage for delivery-dependent shelter; Manta/Humpback/Thresher retain recognizable broad strokes with allied displacement risk. Bowhead loses incidental Ram; Oarfish loses incidental retreat. |
| Divers | Flying Fish/Puffin teach vault then strike versus strike then vault. Seal/Penguin/Dolphin have distinct conditional routes. Nautilus/Vampire trade open approaches for shelter. Sea Angel, Lanternfish, Beluga, Dumbo and Pelagic movement sequences retain specific escape/setup jobs. Albatross loses a third kind of movement; Barreleye loses an unrelated penetrating strike. |
| Predators | Barracuda anchors delivered sheltered Bite. Great White retains a deliberate two-angle attack; Polar Bear guards one flank; Sea Snake/Leopard/Viper retain distinct entry/exit routes. Orca retains pursuit, Bite and ordinary pack setup; Greenland becomes a slow sheltered ambusher rather than a fan sweeper. |
| Graspers | Anglerfish anchors gap pull plus adjacent threat, without falsely promising a same-target pull-and-kill combo. Tentacles/claws share Hook: Man-of-War, King Crab and Colossal Squid lose unrelated wide/line attacks. Gulper/Pelagic retain conditional retreats; Goblin gains a protruding-jaw pull instead of Ram. |
| Holders | Sea Mine stays a delivered retaliation gimmick: ordinary delivery works, Spines does not retain reefs, and its blank lower side permits safe removal. Isopod retains a sheltered automatic retreat with an open right flank. |

Families are test groups, not additional mandatory school slots. Every retained entry has an explicit **Keep** row in both evidence tables and its own authored plan; no unreviewed tail of the catalog remains.

## Adopted changes and observed tradeoffs

Mean combined two-tide reef margin belongs to the candidate's school, not the creature alone. Before/after comparisons change only the experimental candidate; all other cards and the rival stay frozen at balance version 4.

| Creature | Edge change | Seeds 0–3 margin | Seeds 4–7 margin | Decision |
| --- | --- | --- | --- | --- |
| Orca | up: Ram → Standard | 0.55 → 0.55 | 0.5 → 0.45 | Retain chase and Bite; reduce incidental line coverage. |
| Portuguese Man-of-War | right: Wave → Hook | 0.2 → 0.2 | 0.375 → 0.45 | Give trailing tentacles a gap-dependent pull; Spines is retaliation, not defense. |
| Albatross | right: Follow Current → Standard | 0.225 → 0.375 | 0.175 → 0.225 | Keep glide/retreat setup without an unrelated third movement mode. |
| Greenland Shark | left: Wave → Standard | 0.325 → 0.2 | 0.075 → 0.15 | Trade a broad rear fan for simple setup and a clear slow-predator identity. |
| Bowhead Whale | down: Ram → Standard | 0.65 → 0.5 | 0.45 → 0.375 | Accept a small loss of line reach; sheltered Wave remains the primary job. |
| Walrus | right: Ram → Standard | 0.375 → 0.325 | 0.375 → 0.35 | Keep the strong tusk strike; ordinary side setup offers easier counterplay. |
| King Crab | up: Ram → Hook | 0.325 → 0.15 | 0.55 → 0.4 | Trade crowded-line reach for claw spacing; not a universal buff. |
| Colossal Squid | down: Wave → Hook | 0.55 → 0.4 | 0.225 → 0.125 | Unify tentacles around Hook; accept reduced fan coverage while keeping the beak. |
| Giant Oarfish | down: Bounce → Standard | 0.35 → 0.35 | 0.325 → 0.125 | Remove automatic retreat; predictable fan placement trades away independent reef access. |
| Barreleye | left: Double → Standard | 0.4 → 0.275 | 0.625 → 0.25 | Accept lower margin to separate a mobile lookout from a penetrating striker; still selected and useful in both batches. |
| Goblin Shark | down: Ram → Hook | 0.65 → 0.975 | 0.8 → 0.9 | Gap pull improves these samples; retain empty upper flank, blocked Bite and compulsory recoil counters. |

Barreleye has the largest negative change in the second batch (−0.375 combined margin); Goblin has the largest positive first-batch change (+0.325). Those are review signals, not reasons to equalize every sample mean. Targeted tests verify the intended weaker Standard tail, usable movement/setup, guarded-target response, Hook spacing and friendly-kill cost. Watch these two in human school-building; no further change is justified by these small shared-seed samples alone.

## Reproduction and evidence

Run from the repository root with the pinned Node version:

```powershell
node --test tests/ocean-region.test.mjs tests/open-ocean-foundation.test.mjs
node scripts/balance/ocean-region.mjs 4 0
node scripts/balance/ocean-region.mjs 4 4
node scripts/balance/report.mjs
npm.cmd run verify
```

- [First evidence batch](OPEN_OCEAN_EVIDENCE_0.md) and [fresh seed batch](OPEN_OCEAN_EVIDENCE_4.md): 47 candidates × 8 seeds × 2 mixed helper schools × 5 charm conditions = **3,760 paired comparisons / 15,040 tides**. Each before/after school plays two reset tides with swapped starters, 6×6 boards, five plays per side, Tactical policies and regional terrain. Conditions include no charm and four inventories covering all 12 charms. Only the player uses study charms.
- Six wrapped eight-card groups × 8 seeds × 2 catalogs = **96 whole-pool two-tide games / 192 tides**. All **47/47** revised entries actually played in each seed batch. Combined total: **15,232 tides**. Every individually compared candidate was also selected; availability counts are reported rather than assuming every dealt card played.
- 72 production-resolver fixtures per creature/version: 12 contexts × three board sizes × two setup orientations, plus retention probes. Seven family tests require ordinary usefulness on 6×6 and 7×7; Sea Mine has explicit delivery/retaliation/safe-removal tests instead of pretending it has an active attack.
- Targeted tests exercise revised Hooks against guarded targets, simple tails against Standard defense, Bite collateral, and saved/recruited/rival cards across every supported balance version.

Whole-pool player W/D/L was 11/6/7 → 12/7/5 in seeds 0–3, and 10/8/6 → 11/8/5 in seeds 4–7. Mean distinct casualties across both tides were 3.42 → 3.42 and 3.42 → 3.46. These are asymmetric schools with player-only charms, not fair-seat win rates or a full-Voyage attrition model.

Eight shared seed identifiers, repeated helper templates and greedy/bounded policies are **not thousands of independent observations**. The probe can prove an opportunity or counterexample, not how often a human finds it. No full human-played match, human pacing study or complete-Voyage attrition test was performed. Relative weights remain revisable; no universal score threshold decided a card's acceptance.

## Progression, saves and verification

Shoreline stays unchanged. Open Ocean introduces/reinforces Wave, Ram, Follow Current, Bounce and Dive, while related claws, tentacles and predators reuse familiar Hook/Bite/Shield. Bermuda Swap remains later. Zone weighting and rarity are unchanged and do not guarantee a strict teaching order.

New Voyages use balance version **5**. Version **4** is frozen as `BATCH_FOUR_STARTERS`; versions 1–3 and unversioned histories derive from that frozen Ocean baseline. Existing schools, future recruits, rivals and seeded offers retain their saved rules. Quick Match uses the new definitions. Journal role advice appears only on copies matching the current edges and ability.

Full verification passed **225 tests**, workflow validation, type checking and production build (existing bundle-size warning only). Browser checks inspected all 11 changed cards at native board scale, larger card views, the 47-card school journal, and Goblin Shark's current Hook/role/tradeoff versus a saved Ram copy without incompatible new advice. The browser fixture used isolated in-memory saves.

**Next regional pass: Bermuda.** Starting-school choices still wait for the existing roster review; Colossal bosses remain last.

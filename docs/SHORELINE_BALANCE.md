# Shoreline — complete regional role and balance pass

All **77/77** Shoreline creatures have an authored thematic role, a useful ordinary-play plan, a limitation, and an explicit keep/change decision. **11 layouts change; 66 are retained.** This completes this regional pass, not a claim that future human play can reveal no balance problems. The initial [three-crab phase](SHORELINE_BATCH_1.md) is included, not a separate pending region task. Open Ocean and Bermuda remain to be reviewed.

The [role inventory](ROSTER_ROLE_INVENTORY.md#shoreline--77-creatures) contains all 77 individually written identities, ordered edges, relative component ranges and weaknesses. `src/game/data/shorelineRoles.ts` is the authored source used by both that inventory and the collection journal. Journal/school details show these notes only when the inspected copy matches current mechanics; older saved copies retain accurate edge text without new-layout advice.

## Family decisions

| Internal batch | Decision |
| --- | --- |
| Shoaling fish | Keep precise one-direction teachers and complementary corner/corridor/fan setters. Broader coverage also fires unwanted allied pushes; no blanket “more edges means stronger” cost. Parrotfish is a deliberate radial clearer with all four Standard edges, not a random special package. |
| Shelled setters | Share Standard movement and Shields. Add ordinary setup actions to Sand Dollar, Cowrie and Chiton; retain distinct protected and exposed approaches. Horseshoe's downward orientation differentiates it from Hermit. |
| Holders | Keep Giant Clam as a delivered three-sided holder. Repair Boxfish's lack of ordinary delivery by replacing its left Shield with Standard; Double/Hook can now deliver or counter it through that side. |
| Strikers | Keep Double as the shared strong-shove vocabulary for narrow strikers, powerful beaks and territorial swimmers. Double is penetration, not two-cell movement. Shields, landings, exposed sides and mandatory secondary pushes remain costs. |
| Predators | Keep Moray's precise rightward Bite. Rotate Blacktip's Bite upward, retaining a downward tail shove: a different hunting axis rather than Moray's attack plus a free extra edge. |
| Graspers | Keep Hook for tails, claws, feeding arms and suction. Each Hook needs a gap; added shoves serve explicit close-range setup. Octopus, Spanish Dancer, Feather Star and Trumpetfish retain coherent multi-arm/finned arrangement roles, with compulsory secondary actions. |
| Stingers | Keep Spines as retaliation, never passive defense. Add ordinary Standard setup to Moon Jelly and Staghorn Coral, and retain Pom-Pom's first-phase addition. Lionfish/Stonefish/rays retain body, tail and sheltered-side distinctions with explicit counters. |
| Reef builders | Add simple flow/setup directions to Tube Sponge and Brain Coral; preserve Barrel Sponge's lateral counterpart. These are positional interpretations, not claims that corals or sponges swim. |
| Support | Keep full-Shock Eel as an intentional coherent gimmick. Pistol Shrimp retains directional shutdown plus an ordinary shove. Squid's Revelation and Grouper's Rally accompany usable setup; neither earns a fixed objective point value. |

Retained three-mechanic packages were reviewed explicitly: Stonefish's upper spine/lower shelter/left shove, Stingray's rear sting/lower guard/forward shove, Clown Triggerfish's forward strike/rear guard/lower shove, and Crown Conch's shell/forceful foot/backward shove. They are not automatically rejected by counting mechanic types. Every part has a purpose and every card retains a plain response or approach limitation.

## Adopted layout changes

Unlisted cards are explicit **Keep** decisions; see the per-creature evidence tables for every decision. All directions are player-card directions.

| Creature | Change | Reason and remaining cost |
| --- | --- | --- |
| Horseshoe Crab | Right Standard → Down Standard | Guarded vertical setup; gives up lateral coverage and exposes right flank |
| Pom-Pom Crab | Add Down Standard | Ordinary setup alongside lateral anemones; open top permits safe enemy displacement |
| Boxfish | Left Shield → Left Standard | Left shove plus an ordinary Double/Hook delivery route; opponents exploit that same route |
| Blacktip Reef Shark | Right Bite → Up Bite | Vertical pursuit distinct from Moray; open flanks and potentially harmful tail shove |
| Sand Dollar | Add Right/Left Standard; retain Down Shield | Tube-foot lateral setup; both shoves fire and top stays open |
| Cowrie Snail | Add Right Standard; retain Up/Left Shields | Sheltered foot setup; underside stays open |
| Chiton | Add Left Standard; retain Up/Down Shields | Armored lateral setup; right stays open |
| Moon Jellyfish | Add Up Standard; retain Down Spines | Bell pulse setup above trailing tentacles; lateral approaches remain vulnerable |
| Tube Sponge | Add Down Standard; retain Up Shield | Vertical flow setup; both flanks stay open |
| Brain Coral | Add Down Standard; retain Up/Right Shields | Sheltered setup; left remains open |
| Staghorn Coral | Add Down Standard; retain Up/Left Spines | Setup beneath branching retaliation; right stays open |

Keep rarity, prices, regional membership, fishing movement, innate abilities and all stable IDs. Weights remain relative, revision-scoped component ranges, not strength targets or compensation for power. Boxfish keeps its pre-existing named exception to the normal Shoreline two-special-edge limit, now with an exact three-Shield/one-Standard assertion. Normal-card limits and unique directional-layout checks remain enforced. Its old four-Shield retention probe remains tested on the frozen historical catalog, while the current probe now requires ordinary counterplay.

## Internal test batches and regional evidence

Commands:

```text
node --test tests/shoreline-region.test.mjs tests/shoreline-crabs.test.mjs tests/reef-expansion.test.mjs
node scripts/balance/shoreline-region.mjs 4 0
node scripts/balance/shoreline-region.mjs 4 4
node scripts/balance/report.mjs
npm.cmd run verify
```

The regional tests exercise every family and species for ordinary reef contribution or shutdown, with explicit non-charm delivery/retention/counterplay tests for holders. Targeted tests cover Blacktip's directional kill, Shield counter and friendly Bite cost; the crab tests cover setting, occupancy, defenses and retaliation. All 77 get 72 resolver fixtures per version across 5×5/6×6/7×7 boards and two setup orientations. Quiet holders are evaluated through delivery/counterplay rather than incorrectly requiring instant scoring on placement. The score probe does not measure the information value of Revelation or long-term value of Rally; their existing interaction tests remain required.

The [first seed batch](SHORELINE_EVIDENCE_0.md) and [second seed batch](SHORELINE_EVIDENCE_4.md) include **6,160 paired candidate comparisons**: before/after schools each play two reset tides, with four plays per side and swapped starters. Each species is tested in two mixed-school contexts, with no charms or one of four three-charm loadouts covering all twelve charms. Beginner and Tactical policies alternate by seed. Only the candidate changes in each pair; opposing cards and supporting school remain frozen at the pre-PR catalog. These comparisons isolate candidate changes, not the combined roster effect.

Another **160 whole-pool two-tide games** test the complete revised roster together against the old roster in separate runs. Ten eight-card schools cover the entire region, including wrapped final entries; each plays another school three groups away. Both seats use the same catalog version. All **77 species were actually played** in revised whole-pool matches in each seed batch. Combined total: **12,480 two-tide games / 24,960 tides**. Every candidate was also selected by the AI in individual comparisons; raw logs retain availability counts to distinguish “not drawn” from “not chosen.”

| Revised candidate | Mean combined reef margin, first seeds before → after | Second seeds before → after | Decision |
| --- | --- | --- | --- |
| Boxfish | 0.425 → 0.350 | 0.550 → 0.550 | Accept ordinary delivery and counterplay; a modest loss in one sample is not hidden as a buff |
| Blacktip | 0.175 → 0.225 | 0.325 → 0.225 | Accept a distinct hunting axis; orientation trades results, not a universal upgrade |
| Horseshoe | 0.700 → 0.700 | 0.250 → 0.375 | Retain first-phase differentiation |
| Sand Dollar | 0.450 → 0.425 | 0.200 → 0.150 | Accept new setup action with compulsory lateral collateral; not evidence of a win-rate buff |
| Cowrie | 0.700 → 0.750 | 0.200 → 0.125 | Accept useful baseline; seed-sensitive outcome |
| Chiton | 0.475 → 0.325 | 0.400 → 0.425 | Accept setup with real collateral cost; track the first-batch loss in human play |
| Moon Jelly | 0.500 → 0.525 | 0.250 → 0.175 | Accept baseline pulse; retaliation still does not retain a reef |
| Tube Sponge | 0.625 → 0.700 | 0.225 → 0.275 | Accept simple flow setup |
| Brain Coral | 0.675 → 0.750 | 0.250 → 0.300 | Accept sheltered setup |
| Staghorn | 0.625 → 0.675 | 0.125 → 0.275 | Accept ordinary setup alongside retaliation |
| Pom-Pom | 0.550 → 0.625 | −0.025 → 0.125 | Retain first-phase setup addition |

Whole-pool player win/draw/loss counts were 17/20/3 → 20/15/5 in the first batch and 21/17/2 → 19/16/5 in the second. Player-only charms and asymmetric schools prevent interpreting these as fair-seat win rates. They show the combined pass still completes varied matchups, with fewer ties in these samples, not proof of perfect balance.

Limitations: eight shared seed identifiers and repeated school templates are **not thousands of independent observations**. Policies are bounded AI, charm timing is a stress heuristic, and the study does not model recruitment preferences or complete-Voyage attrition. Source-level role assertions are supported by scenarios, not by treating the metadata itself as proof. Human pacing, preference and new school archetypes can justify later tuning. No untested mechanic or final-region ability was introduced to make a weak card pass a score threshold.

## Progression and saves

Shoreline continues to teach Standard/Shield, then gap-dependent Hook, stronger Double, Bite and retaliation/shutdown. It does not acquire Open Ocean self-movement/line mechanics or Bermuda Swap. Existing rarity draws can still expose advanced Shoreline effects early; this pass does not claim a guaranteed encounter/tutorial sequence. Revelation and Rally remain the only innate full-card abilities. Earlier charms may preview later innate abilities as before.

New Voyages use `cardBalanceVersion: 4`. Versions 1/2, unversioned runs, and version-3 crab-preview runs preserve their definitions. The version-3 catalog is frozen through `BATCH_THREE_STARTERS`; pre-PR version 2 remains `BATCH_TWO_STARTERS`. Existing serialized copies are never rewritten. The save tests check all regional definitions, recruits, school persistence, rivals and seeded offers. Historical pilot/earlier match reports remain based on their frozen catalogs.

## Verification

`npm.cmd run verify` passed workflow validation, all 208 tests, type checking and the production build. Browser inspection covered all 11 changed card layouts, the current 77-card school journal, Boxfish's authored role and tradeoff, and a legacy four-Shield Boxfish without the new-layout advice. These were targeted UI checks, not a full human-played match or Voyage.

**Next region: Open Ocean.** Starting-school choices still wait for the remaining roster passes; Colossals remain last. Further Shoreline tuning is driven by new evidence rather than an unfinished species checklist.

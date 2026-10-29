# Shoreline scoring and Open Ocean attack coverage

Follow-up to merged PR #44 (baseline commit 65542bb). **Decision: keep version-seven cards, abilities and edges unchanged.** This PR adds reproducible experiments and counterplay regression tests. Prototype changes exist only inside the study script. No save migration is needed.

## Questions and method

Does Shoal plus Reef Network create an unavoidable Shoreline scoring advantage? Is Open Ocean's earlier loss against its old school evidence that the current cards need their attacks restored?

Run:

```powershell
node scripts/balance/scoring-coverage.mjs 400 8
node scripts/balance/scoring-coverage.mjs 800 8
node scripts/balance/attack-coverage.mjs
node --test tests/scoring-coverage.test.mjs
```

The match study runs **5,760 tides**, aggregated into 2,880 paired-initiative results: 2 regions × 3 opponent schools × 5 variants × 16 fresh seeds × 3 charm conditions × 2 seat assignments × 2 starting orders. Each variant shares its deal and action seed with the current baseline. The two independently reported seed batches are 400–407 and 800–807. Both seats use Tactical; Shoreline uses 5×5/4 plays and Ocean 6×6/5 plays. The pairs restart from fresh decks and resources; this is not a persistent Voyage economy test.

Opponents are the previous version-six mirror, an existing ordinary mixed-school fixture, and a displacement/predation-oriented current school. Exact ten-card lineups are in the script. Charms are none; Anchor Stone/Reef Beacon/Nautilus Dial; and Spear Shell/Breaker Tooth/Barbed Wreath. Both seats get the same inventory and the existing study charm policy. Correlated trials share only **16 independent seed groups**, not thousands of independent human games.

Raw trials, including casualties and which creatures were played, are generated under ignored `.cache/balance/coverage-*.json`. Played is not the same as activated; per-ability activation rates are not measured. This is controlled evidence for these schools/policies, not a population win-rate estimate.

## Whole-school outcomes

Mean combined score margin over the two starting orders, from the studied school's perspective:

| Opponent | Current Shoreline | Current Ocean |
| --- | ---: | ---: |
| previous-mirror | 0.688 | -0.615 |
| ordinary | 0.802 | 0.063 |
| counter | 0.906 | 0.063 |

The Shoreline advantage survives varied opponents. Ocean's loss persists against its older, more heavily armed mirror, but the current school is near even against the other two opponents. Restoring the previous mirror's power is therefore not automatically the right target. The old Ocean school also does better against those opponents; this confirms a tradeoff, not equal old/new power.

## Shoreline: separate the bonuses

Simulation-only ablations remove the named ability while retaining version-seven edges. Values are paired margin changes relative to the intact current school, not estimates of an isolated card's objective worth.

| Opponent | Remove Shoal | Remove Network | Remove both |
| --- | ---: | ---: | ---: |
| previous-mirror | -0.094 | -0.375 | -0.448 |
| ordinary | -0.073 | -0.427 | -0.479 |
| counter | -0.115 | -0.427 | -0.510 |

Network contributes more than Shoal in both fresh batches. The effects are not strictly additive because removing an ability changes the policy's moves and later board states.

A reef Clownfish beside an off-reef Staghorn Coral is worth **3 points using two creatures**. Ordinary displacement of the coral breaks both bonuses, leaving 1; displacement of the Clownfish leaves 0. Regression scenarios prove both routes on 5/6/7 boards for both owners. With one placement remaining and no reply, all three rival difficulties find a zero-point outcome using the four directional guide cards. This terminal-response test does not establish optimal earlier-turn defense.

Reef Beacon saves the holder's delivery step but still requires a separate support placement. A second coral does not add another Network point. Anchoring the coral does not secure the holder; an occupied escape square can block a particular counter, so players must inspect the full formation. These are meaningful strengths and weaknesses, not a guaranteed counter in every position.

**Keep Shoal and Network.** Do not remove the interesting formation simply because it beats a fixed old school. Next human test: deliberate protection and repeated use of the formation against opponents that recognize and disrupt its support. A repeatable failure of ordinary counterplay would justify a targeted constraint; this study does not establish one.

## Ocean: small restoration prototypes

Each prototype changes one edge only, preserving the current innate ability: Humpback right Standard→Double; Anglerfish down Standard→Bite; Pelagic Octopus down Standard→Hook. None ships.

| Opponent | Humpback Double | Angler Bite | Octopus Hook |
| --- | ---: | ---: | ---: |
| previous-mirror | 0.073 | 0.042 | 0.094 |
| ordinary | 0.042 | 0.094 | 0.031 |
| counter | 0.083 | 0.083 | 0.000 |

Humpback's modest gain is nonnegative in each batch/opponent cell (one zero); that is a watch-list candidate, not evidence a buff is needed. Octopus Hook reverses sign against ordinary/counter schools between the two seed batches. Angler Bite increases enemy casualties by roughly 0.17–0.44 per paired result depending on opponent, and a direct scenario confirms it also kills an ally that the current Standard delivers safely. Do not restore a lethal edge merely to chase old-roster score parity.

## Exhaustive immediate attack coverage

For each of six Ocean hosts, enumerate every legal placement and ability option on a 6×6 board. The 24 cases are 3 reef locations × 4 target defenses (open, four Standard sides, four Shields, Anchor) × absent/present allied Anglerfish below the target. Both catalogs face the same fixture. A case is solved if at least one complete placement moves or removes the holder from its reef. There is no AI move-ranking dependence in this probe.

| Host | Previous solved | Current solved |
| --- | ---: | ---: |
| flying-fish | 12/24 | 6/24 |
| orca | 14/24 | 18/24 |
| whale-shark | 6/24 | 6/24 |
| humpback-whale | 6/24 | 6/24 |
| anglerfish | 11/24 | 9/24 |
| pelagic-octopus | 10/24 | 2/24 |

Flying Fish loses penetration in exchange for flexible self-access. Orca gains defended-target routes through Pack Hunt. Whale Shark and Humpback retain their isolated open-holder coverage; this sparse probe does not measure their old multi-target coverage. Angler loses Anchor predation. Octopus loses substantial immediate pressure in this fixture; its copying, self-movement and support-placement value need fuller human assessment. It is the clearest role-clarity watch item, but the tested Hook restoration has inconsistent full-match gains.

**Keep the current Ocean edges for now.** The desired roles still have ordinary delivery options, the whole school remains competitive in the tested current matchups, and no small restoration addresses a demonstrated universal deficiency. This decision is provisional, not a declaration that every host is equally strong.

## Validation and limits

Four focused regression tests cover scoring counterplay across board sizes/owners, charm and duplicate interactions, allied delivery versus lethal restoration, and terminal AI responses. Full verification: 283 tests, workflow checks, type-check and build passed; existing bundle-size warning remains. Production gameplay and UI are unchanged, so no new browser playtest is claimed. Full-Voyage recruitment/economy, Expert-vs-Expert full matches, human adaptation, narrow-screen controls and match pacing were not tested here.

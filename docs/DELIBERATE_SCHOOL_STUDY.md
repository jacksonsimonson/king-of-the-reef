# Deliberate recruiting and school trimming

## Decision

Keep gameplay balance values unchanged. Deliberate recruiting reduced healthy-card shortages and produced a few more completed Voyages, but did not consistently improve regional progression. Trimming was modest and seed-sensitive. This experiment does not support cheaper fish, stronger recovery, weaker rivals or another roster reshuffle.

The next useful check is a small human playtest of later-region losses and stalled boss encounters, with the actual carried school and available charms visible. The automated player does not adapt after a repeated draw. Before recommending a school-building feature or tuning a resource, distinguish tactical decision problems from access to the right creatures. Bespoke Colossal decks remain deferred.

## Protocol

Gameplay baseline: merged PR39, commit `a0eb5c908332b454f5af572557a85f1f927f78ed`, roster version 6. Use the same production two-tide combat, real school, reachable routes, fishing/shop offers, recovery and settlement as the [finished-roster baseline](FINISHED_ROSTER_VOYAGE_BALANCE.md). No gameplay or save changes are included.

Four policies isolate the school-building interventions:

| Policy | Fishing and shopping | Release stops |
| --- | --- | --- |
| baseline | Existing random offered fish and charm-first buying above eight healthy copies | Leave |
| recruit | Choose the offered fish with the best marginal composition fit; prioritize an affordable fish that improves fit or fills a school below eight healthy copies | Leave |
| trim | Baseline recruitment | Release one healthy copy only if its removal improves fit and leaves at least eight healthy copies |
| both | Deliberate recruitment | Deliberate trimming |

Composition fit is an explicit, provisional **school-building hypothesis**, not a card power rating. Each creature contributes boolean coverage of setup, control, holding, self-entry, and each of four setup directions. Relative desired shares are 50% setup, 25% control, 25% holding, 15% entry and 20% for each direction. A creature may fill several categories. Each category contributes at most one point once its share is met; extra edges do not accumulate unlimited score. Rarity, region and species name confer no strength bonus. Ties use stable texture/ID order.

Setup recognizes Standard/Double/Hook/Wave. Control recognizes Bite/Swap/Shock/Ram/Dive and Ambush/Wake/Piercing. Holding recognizes Shield/Spines and Anchor/Bulwark/Escort. Entry recognizes Ram/Follow Current/Bounce/Dive and Reefborn. These broad categories intentionally simplify conditional effects, friendly harm and direction-specific matchups; coverage is not proof of synergy. Injured copies are excluded from fit until recovered.

Recruitment always attempts one offered fish at a fishing stop, even if none improves fit. At shops, improving fish outrank charms, then other fish; price breaks equal-ranked choices. There is still only one purchase per shop and no saving-for-future-stock or charm-replacement policy. Events and healing order retain the baseline policy. Trimming is available only at an encountered Release stop; it does not grant free removals, remove injured copies or seek Release nodes more aggressively. The eight-healthy reserve floor leaves at least two spare copies even in Bermuda. It is a study safety margin, not a new game rule.

Both baseline route preferences remain unchanged. Different battle outcomes and resources can cause different later routing decisions; this is an end-to-end policy comparison, not identical-route combat. The fishing selection draw is still consumed before deliberate choice, preserving the seeded success draw when policies reach the same node. Catch success remains a declared 85%/60% assumption independent of species, not a fishing minigame simulation.

Run with the pinned Node version:

```powershell
node scripts/balance/school-study.mjs 0 12
node scripts/balance/school-study.mjs 12 12
node scripts/balance/school-evidence.mjs
```

There are **768 simulated Voyages**, using 24 map seeds, four school policies, two player AI policies, two route preferences and two catch assumptions. Seeds 0–11 reproduce the earlier baseline; 12–23 are a fresh check using the same frozen heuristic. Raw per-run ledgers are saved in `.cache/balance/school-study-{0,12}.json`. The generator validates complete paired cohorts and produces [the evidence tables](DELIBERATE_SCHOOL_EVIDENCE.md). Reproduce on this PR's revision; future live-catalog changes can alter outcomes. Each batch overwrites its own cache file.

## Results

All 96 original baseline runs match PR39's recorded ledgers exactly, including battles, visits, recruitment, money and terminal outcomes. Across the two batches:

| Policy | Completed / defeated / capped | Ocean / Bermuda reached | Shortage matches | Fish purchases | Actual releases |
| --- | --- | --- | ---: | ---: | ---: |
| baseline | 4 / 133 / 55 | 111 / 42 | 16 | 45 | 0 |
| recruit | 7 / 117 / 68 | 99 / 35 | 2 | 135 | 0 |
| trim | 4 / 137 / 51 | 111 / 42 | 16 | 46 | 45 |
| both | 6 / 122 / 64 | 103 / 37 | 5 | 133 | 41 |

Each policy has 192 runs. A cap means unresolved after six boss attempts, not a defeat or completion. Fewer defeats can simply mean more stalled runs. Later-region samples are survivors, and match counts differ by policy; shortage counts are not equal-exposure rate comparisons.

**Recruitment changes are meaningful but not a reliable win recipe.** The recruit-only policy tripled fish purchases, from 45 to 135, while charm purchases fell from 510 to 369. It nearly eliminated school shortages, but fewer runs reached later regions overall. Against paired baselines, it reached a farther region in 31 runs and an earlier region in 46. Seven completions versus four are too few to outweigh that mixed progression evidence or estimate a human win rate. The trade between fish and immediate charm utility is part of this intervention; fishing choice and shopping preference are not separately isolated.

**Trimming does not solve the progression problem.** Trim-only made 45 removals across 79 Release visits, preserved the same four completed runs, and changed the furthest region in only ten paired runs: five farther and five earlier. On original seeds, shortages rose from six to nine; on fresh seeds, they fell from ten to seven. Even conservative removal can change later draws and casualty exposure. Do not present trimming as a universal upgrade or lower the reserve floor based on this result. Limited Release access also constrains the effect; this does not test an active-deck selector or unrestricted trimming.

**Combining them does not establish a stronger strategy.** Both policies together completed six runs, versus seven for recruiting alone, and reached Bermuda 37 times versus 35. This small, mixed difference does not identify a dependable synergy. The fresh batch's improvement in Ocean arrivals does not replicate the original batch, where arrivals fell substantially.

## Validation and practical limits

- Every simulated run reconciles its money, recruitment/removal and combat-health ledgers. Evidence generation checks all seed/policy pairings and version 6.
- Regression tests cover missing-direction recruitment, saturated coverage, legal one-copy Release settlement, the healthy reserve floor, deterministic policies and offered/affordable choices. The initial Release test fixture assumed a random map contained that node type; it was corrected to explicitly provide a Release fixture rather than change map generation.
- `npm.cmd run verify` passed workflow checks, all 249 tests, type-check and build. The existing bundle-size warning remains.
- No browser or human playtest was performed for this simulator-only change. AI, simple charm use, assumed catch success, non-adapting boss retries and shared seeds limit conclusions. These are 24 map seeds with policy variants, not 768 independent player journeys. The heuristic was not retuned after inspecting the first batch.

Keep the current card, hydration, economy, map and rival values. Preserve the evidence as a baseline for a human-guided tactical investigation rather than treating automated coverage scores as permanent balancing weights.

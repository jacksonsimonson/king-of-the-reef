# Current Voyage integration pass

The current systems work together in the automated scenarios below: weighted regional rivals and optional elites, the fixed starting school, recruiting and release, shops and charms, injuries and recovery, regional passage, two-tide combat, post-match summaries, and encounter save/reload. No gameplay values changed. The pass found a substantial later-region difficulty concern; it does **not** establish that Voyage is balanced for humans.

## Reproduce

Base: merged PRs 47 and 48, `0a3f9643e82af691f5e587d9723ecedfda40eafa`. Card balance version 7, rival school version 1, longer maps version 2. Use the pinned Node version from `.node-version`.

```powershell
node scripts/balance/integration-study.mjs 0 8 recovery
node scripts/balance/integration-study.mjs 0 8 combat
node scripts/balance/integration-evidence.mjs .cache/balance/integration-recovery-0.json .cache/balance/integration-combat-0.json
node --test tests/voyage-integration.test.mjs tests/school-policy.test.mjs
npm.cmd run verify
```

Raw results stay in ignored `.cache/balance/`; these scripts recreate them. The study uses isolated in-memory storage and never reads or changes a browser Voyage.

128 runs: eight seeds (`INTEGRATION-v7-0` through `7`) × two routes × seek/avoid elites × baseline/deliberate school policies × 60%/85% assumed fishing success. Even seeds use Tactical player decisions; odd seeds use Expert. Rival difficulty follows the region. Difficulty comparisons are therefore **not paired on the same seeds**. Route, elite, school and catch-rate comparisons are paired, but subsequent paths and schools diverge. These are eight underlying maps, not 128 independent samples.

Elite preference overrides the ordinary route priority only when an elite is immediately reachable; it does not plan several steps ahead. The deliberate school policy is the existing provisional composition heuristic from [the recruiting study](DELIBERATE_SCHOOL_STUDY.md), not an optimal player. It still does not explicitly value every new innate ability. Shops buy at most one item, do not replace a full charm inventory, and do not reserve money for future purchases. Fishing uses real offers and settlement but assumes success instead of simulating mouse skill. Boss retries stop after six actual matches; capped runs remain unresolved, not losses.

## Results

1,831 combined matches / 3,662 tides; 4,423 successful encounter/terminal save round trips. All rewards, school-size ledgers, casualty/recovery totals, regional play budgets and summary assertions passed. A regression test also compares an uninterrupted run against save/reload plus the production summary settlement path and gets identical results.

| Cohort | Runs | Won | Lost | Boss cap | Reached Ocean | Reached Bermuda |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| All | 128 | 5 | 97 | 26 | 93 | 31 |
| Recovery route | 64 | 5 | 43 | 16 | 43 | 15 |
| Combat route | 64 | 0 | 54 | 10 | 50 | 16 |
| Avoid elites | 64 | 3 | 46 | 15 | 45 | 16 |
| Seek elites | 64 | 2 | 51 | 11 | 48 | 15 |
| Baseline school policy | 64 | 2 | 54 | 8 | 49 | 13 |
| Recruit + trim policy | 64 | 3 | 43 | 18 | 44 | 18 |

Results below are **player** win/draw/loss counts. Later regions contain only surviving runs; boss retries inflate their match counts.

| Region | Ordinary battles W/D/L | Elite battles W/D/L | Boss attempts W/D/L | Mean healthy school |
| --- | --- | --- | --- | ---: |
| Shoreline | 406 / 298 / 68 | 13 / 25 / 6 | 93 / 124 / 48 | 9.28 |
| Open Ocean | 32 / 50 / 352 | 0 / 0 / 14 | 31 / 57 / 34 | 11.70 |
| Bermuda | 2 / 12 / 125 | 0 / 0 / 4 | 5 / 2 / 30 | 13.89 |

Other coverage and findings:

- 785 fishing visits: 554 catches and 231 escapes. 619 shops, 446 purchases (90 fish / 356 charms), and 749 total recruits. The ledger balanced across catches, purchases, events and releases.
- 801 hydration visits restored 1,176 injured fish; events restored 16 and boss passage 78. Only eight matches began below the regional healthy-card play budget: seven under baseline recruiting and one under deliberate recruiting/trimming. A general recovery buff is not supported by these results.
- 165 event visits and 68 release visits, including 17 actual trims. The deliberate policy reduces shortages here but creates more unresolved boss loops; it is not a demonstrated overall improvement.
- All 167 species appeared in rival schools; 92 species were played by the player. Fifteen charm types reached battle inventories and 356 charm copies were spent. Cuttle Ink did not enter a battle inventory in this cohort; this is not an exhaustive charm-combination or ability-combination test. The [all-20 mixed-school study](ALL_ABILITY_SCHOOL_STUDY.md) remains the broader ability/all-16-charm evidence.
- All 62 elite battles used ordinary production combat and the extra reward rule; save/reload retained elite flags. The 18 later-region elite matches are too few and too selected to calibrate their premium independently.
- 173 shop visits had no affordable stock; 407 had no affordable fish. These reflect the policy's earlier purchases as well as prices. Do not interpret them as proof that the economy needs a blanket price cut.
- 183 boss draws and 147 repeated boss openings. The simulator does not adapt its strategy after a draw. These figures flag retry friction, not 147 distinct game defects.

## Decision and next work

Retain current cards, weights, rewards, prices and healing. No integration invariant failed, and the difficulty signal does not isolate a particular number to adjust safely. The previous regional rival study used same-region opponents; these carried-school runs reveal a different and more demanding progression problem.

The next balance experiment should replay **the same carried Open Ocean and Bermuda schools** against ordinary weighted rivals, varying one small rival-strength parameter at a time and keeping seeds, turn order and charm choices controlled. Separate that comparison from recruiting-policy improvements. Ordinary later-region battles need attention before tuning elite rewards: losses are already high outside elite spaces. Validate any candidate on fresh map seeds and with human decisions before adopting it. Do not reshuffle the whole roster on this evidence.

Boss strategy adaptation and retry pacing remain a separate issue, to revisit alongside the eventual themed Colossals. Colossals remain last; starting-school selection stays shelved.

This PR changes only study tooling, regression coverage and documentation. No new browser/visual playtest was performed; the Game Guide, audio mix, input feel, human fishing success, mid-action battle checkpoint UI, charm replacement UX and real match duration are not certified by this simulation. Existing focused tests and prior browser checks remain separate evidence. Final verification passed all 294 tests, workflow checks, type-check and build; the existing large-bundle warning remains.

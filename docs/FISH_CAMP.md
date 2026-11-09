# Fish Camp and weighted fishing

New playable Voyages enter **Fish Camp** at the start of Shoreline, Open Ocean and Bermuda. It turns the existing column-zero departure into a usable checkpoint without moving any other nodes or changing chart randomness.

1. Optionally release creatures, one confirmed removal at a time. Keep at least the regional per-tide play budget plus two ready reserves: six/seven/eight. Injured copies may also be released if the total school remains above that floor. If arrival health is already below the floor, camp does not heal it; no further healthy releases are allowed.
2. Continue to fishing, locking further releases for that visit. Each of **two attempts** offers seeded local choices and uses the ordinary fishing minigame. A catch or escape spends one attempt. Offers and fish-pattern seeds are separate for each attempt; reloads cannot reroll them.
3. Leave whenever no catch is in progress, forfeiting unused attempts. Camp cannot be revisited. The normal first-column fishing stop remains, so these are two additional opportunities before the first battle.

Camp has no fee, shop, currency, guaranteed catch or automatic recovery. Regional passage retains its existing healing and resolve restoration. The starting-school picker remains shelved. Tutorial explanations live in the Game Guide; the playing screen shows selection consequences, the ready-card floor and attempts remaining. Original lodge/pier art uses the existing native-resolution four-pixel scene renderer and regional palettes.

## Compatibility

`campVersion: 1` marks new playable runs. The pending camp is the current column-zero node; its release/fishing phase and completed-attempt counter are saved. Loading validates the node, phase, counter and active fishing snapshot. Departure explicitly enables camps through `createRun`'s fourth argument; its default remains camp-free for existing fixtures and historical studies. The Voyage simulator likewise opts in using `camp: true`.

Old runs retain their departure nodes and original seeded noncamp offers. Existing active fishing attempts retain direct controls through the legacy snapshot path. All newly started attempts use version-two weighted controls, even in an older Voyage. Momentum survives pause/reload. See [Fishing](FISHING.md) for acceleration values and controls.

## Validation

```powershell
node --test tests/fish-camp.test.mjs tests/fishing.test.mjs
node scripts/balance/fish-camp-study.mjs
npm.cmd run verify
```

The study compares 32 baseline and 32 camp-enabled Voyages: eight fresh seeds × baseline/deliberate school policies × assumed 60%/85% catch rates, with Expert player decisions and recovery routes. It uses actual combat, offers, releases, recruitment and settlement. The deliberate policy conservatively trims only when its existing composition heuristic improves; it is not an optimal camp user. Raw runs go to ignored `.cache/balance/fish-camp.json`.

| Cohort | Won / lost / retry cap | Reached Ocean / Bermuda | Matches | Healthy-card shortages |
| --- | --- | --- | ---: | ---: |
| No camps | 0 / 26 / 6 | 24 / 4 | 420 | 0 |
| Fish Camp | 2 / 17 / 13 | 17 / 6 | 412 | 0 |

Across 832 matches / 1,664 tides, camp added regional recruitment; camp visits changed no shell balances and the school-size ledgers passed. Mean healthy local copies in later-region battles rose from 1.45 to 2.73 in Ocean and 1.59 to 2.59 in Bermuda. Outcomes remain mixed: more completions and Bermuda arrivals, but fewer Ocean arrivals and more unresolved boss retries. These are correlated automated runs with assumed catches, not proof of improved human win rates or a solved balance problem. No roster, rival, reward or shop-price changes accompany the requested feature.

The control study runs 2,400 synthetic fishing attempts: five movement patterns × three regions × 40 seeds × old/new controls × reactive/anticipating trackers. Direct reactive tracking caught all 600 old-control attempts. Weighted controls require more correction: reactive Bermuda Darters caught 16/40 (mean 42.6 seconds to terminal outcome), while anticipating momentum caught 27/40. Every pattern/region remains catchable by at least one tested policy. The simple anticipatory policy fails Bermuda Runners (0/40) while reactive tracking catches 40/40, illustrating that one controller is not a human skill model. Keep human feel tuning open, especially fast later-region fish.

Regression coverage checks release floors including injured copies, irreversible phase transitions, catch/escape attempt spending, no duplicate rewards or visits, region entry, legacy runs, invalid saved states, acceleration/coasting/reversal/boundary stops and nonzero-momentum save/resume. Browser checks on an isolated development origin exercised actual New Voyage entry, confirmed release, both attempts escaping, zero-attempt lockout, departure to the chart, fishing input/pause/reload, and Ocean/Bermuda camp offers and artwork. Successful catch settlement is covered by automated tests rather than a manual successful catch. Narrow-screen and extended human feel testing remain unperformed.

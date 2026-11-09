# Voyage playability pass — 2026-11-09

Baseline: merged PR #53 (`54ab4e1`). This pass combines complete simulated routes with agent-operated browser flow checks on actual carried saves. It is not an uninterrupted human playthrough or a human difficulty study.

## Changes supported by observations

- **Fishing pointer input:** holding the mouse on the lane previously had no effect while passive resistance pulled the zone left. Add primary mouse/touch hold as the same rightward thrust used by the Right key. Capture the pointer so release outside the canvas is handled; release/cancel/lost capture, focus loss, pause and destruction clear held input. Preserve acceleration, momentum, fish profiles, catch rates and legacy saved-control behavior. Explain the added input in Game Guide and the accessible canvas label, without adding visible tutorial prose.
- **Hydration reward preview:** a Bermuda stop at 3/3 resolve advertised +1 Resolve, but settlement correctly stayed at 3/3. Show the gain only below capacity. Zero selected creatures says Continue; a single selected creature says Hydrate 1 Card. Selection and recovery rules are unchanged.

No creature, rival, economy, fishing difficulty, turn budget or boss-retry balance values changed.

## Complete-route integration

Run `node scripts/balance/playability-study.mjs`. It uses 32 fresh seeds, `PLAYABILITY-v7-0` through `31`, current camps and roster, deliberate recruiting/trimming, and the Expert simulation player. Even seeds use recovery routing with assumed 85% catch success; odd seeds use combat routing with assumed 60%. These cohorts are not a paired balance experiment. Fishing outcomes in this sweep are assumptions, not actual fishing-input measurements.

| Measure | Observed |
| --- | ---: |
| Runs | 32 |
| Matches / tides | 434 / 868 |
| Encounter/terminal save round trips | 1,088 |
| Reached Shoreline / Ocean / Bermuda | 32 / 16 / 6 |
| Won / lost / capped on boss retries | 1 / 18 / 13 |
| Matches short of healthy cards for the play budget | 0 |
| Recruited creatures / shop purchases | 268 / 90 |
| Assumed catches / escapes | 208 / 65 |
| Boss draws / repeated boss openings | 79 / 78 |

Seed 16 completed all three regions with 21 matches. A six-attempt boss cap is a simulation limit, not a game loss or proof of a UI deadlock. Repeating a deterministic policy can repeat an unchanged draw; the test does not model a human adapting tactics. Later-region losses remain a concern, but sufficient healthy cards and these limited policies do not justify a blanket resource buff or rival nerf.

The runner checks save equality, school/shell accounting, 4/5/6 play budgets, camp recruitment limits and summary health/ledger availability. It requires captured camps, fishing, battles, shops, hydration, events, bosses and rematches in every region plus at least one completed voyage. Generated raw results and carried-save fixtures stay under ignored `.cache`.

## Browser checks

Start the development server on an isolated port, then open `/king-of-the-reef/.cache/playability.html`. Each button loads a captured pre-encounter save. It backs up that test origin's old Voyage save once and provides a restore button. Do not use the origin containing a real player save.

- **Shoreline:** released two creatures at camp, observed the six-ready floor, continued into two fishing attempts. Paused/reloaded an attempt. Opened ordinary fishing, tested mouse hold after the fix and observed an escape returning to the map without recruiting. Completed a two-tide battle with eight placements; reloaded between tides and resumed the rival-first second tide. Combined score 0–2, resolve 3→2 and Minnow injured.
- **Open Ocean:** camp showed the seven-ready floor and two attempts. Bought Spyglass Pearl and Lanternfish for 57 shells total, reloaded, and verified both were sold and the school/charm inventory persisted (68→11 shells). Traded an injured Crab for Atlantic Puffin: school size remained 17, healthy count 14→15, shells 2→8. Hydrated one creature at 2/3 resolve and observed 3/3 plus one restored creature. Completed an actual carried-school boss rematch with ten placements, including Spreading Arms choice controls: 0–4 combined, resolve 2→1, no new casualties, boss still challengeable afterward.
- **Bermuda:** camp showed the eight-ready floor and two attempts. Tested mouse thrust, keyboard Left, release, pause and reload on Lightning Marlin; the zone moved right under hold, then returned left without held input after reload. Hydrated two injured creatures at full resolve, observing 13→15 ready and resolve still 3/3; reproduced and corrected the misleading gain label. Completed a twelve-placement match including whirlpool landings and a Slipstream choice: 0–1 combined, resolve 3→2, five injuries, ten ready afterward.

The three browser matches cover 30 player placements and six tides. Much of the placement sequence deliberately used the first legal choice to exercise turn/ability/settlement controls; these losses are **not** evidence of excessive difficulty. Motion was reduced for most turns. Browser checks used mouse/menu and keyboard/text battle controls; no drag-placement or skilled combat evaluation is claimed.

Local screenshots: `.cache/voyage-fishing-input.png` and `.cache/voyage-hydration.png`. Touch hardware, off-canvas pointer release/cancel on real devices, successful mouse-controlled catches, every event variant, charm replacement, and an uninterrupted three-region human run remain untested. Existing model tests cover successful fishing settlement and duplicate-reward protection. Human fishing feel and adaptive boss tactics still need player feedback.

## Validation and next step

`npm.cmd run verify` passed workflow checks, all 301 tests, type-check and build. The existing large-bundle warning remains. The affected fishing tests also passed separately. No additional balance study is warranted solely because these smoke checks lost matches. Next, use these reproducible saves for player feedback on fishing resistance and boss tactics, then address any concrete visual/input issue before bespoke Colossals.

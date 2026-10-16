# Full Voyage balance study and post-match summary

Historical study from before the complete regional roster pass. For balance version 6, use the [finished-roster Voyage validation](FINISHED_ROSTER_VOYAGE_BALANCE.md). The commands below use the live catalog; rerunning them on a later checkout does not reproduce these historical numbers.

## Scope and reproduction

This study replaces the earlier scripted-win route checks with production combat, carried schools, casualties, spending, hydration, events and boss results. It follows a run until victory, defeat, or a six-attempt boss cap. Capped runs remain unresolved; they are not counted as losses or wins.

Run from the repository root:

```powershell
node scripts/balance/voyage-report.mjs 12 0 0.85
node scripts/balance/voyage-report.mjs 12 12 0.70
```

Each batch contains 96 runs: 12 seeds × Classic/two-tide × Tactical/Expert player policy × recovery/combat route preference. Seeds are FULL-VOYAGE-HOLDOUT-0 through 23. Detailed per-run visits and per-match outcomes are written to `.cache/balance/full-voyages-0.json` and `full-voyages-12.json`; stdout contains compact cohort summaries. The script uses the full current enabled catalog by default in Node, the real eight-fish starting school, seeded regional rivals, 5×5/6×6/7×7 boards and regional difficulty. No starter creatures or economic values were changed.

Fishing is a declared assumption, not a simulated minigame: 85% seeded success in the first batch, 70% in the fresh-seed follow-up. Offered fish are selected by a seeded draw. Shop policy buys one affordable item per visit, favoring fish below eight healthy creatures and otherwise charms; it does not replace a full charm inventory. Event policy prioritizes needed resolve/recovery, recruitment and safe income. Routes inspect only reachable next stops and prioritize recovery or combat respectively. Neither policy strategically releases healthy fish or learns a better school composition.

Actual carried IDs and health are preserved. Each tide independently clones the opening, filters injured cards, shuffles with a shared deal stream, and resets the action stream. Production AI controls the player as a repeatable proxy and uses public-information threats. Production resolver, charm helpers and run settlement execute the effects. Charms use a simple one-per-turn heuristic, not optimal human choice. AI player decision calls consume RNG unlike human input, so this is not an exact replay of a human game. Custom-school turn scheduling handles skips and shortages; historical mixed-school studies retain their old defaults.

## Outcomes

192 runs attempted 2,626 complete matches (3,944 individual tides). Both batches have matched seeds and policies within each format comparison; comparisons between the two fishing batches also change seeds and must not be read as a causal catch-rate experiment.

| Across both batches | Classic | Two tides |
| --- | ---: | ---: |
| Runs | 96 | 96 |
| Completed wins | 4 | 3 |
| Defeats | 38 | 67 |
| Unresolved at boss cap | 54 | 26 |
| Reached Ocean | 42 | 59 |
| Reached Bermuda | 17 | 22 |
| Matches | 1,308 | 1,318 |
| New casualties per match | 0.52 | 0.81 |
| Battles starting below their per-tide fish budget | 0 | 1 |
| Purchases per run | 2.58 | 3.27 |
| Fish restored at hydration stops per run | 4.63 | 7.25 |
| Shells at termination/cap, mean | 27.23 | 24.26 |

Two tides produced more casualties and more recovery use while allowing more runs to reach later maps. The larger defeat count partly reflects fewer runs stuck at boss draws; it is not an isolated measure of worse balance. Most failures were not caused by a depleted healthy school. Shell averages include early terminations and do not prove every offer is affordable. Hydration counts exclude event and boss-passage recovery.

The deterministic player often repeats a drawn boss opening without adapting. Classic had 343 drawn boss attempts; two tides had 180. This is a meaningful warning about repetitive rematches, but not sufficient evidence for changing the win requirement or bespoke Colossal rules. Those systems remain deferred.

## Regional attrition and length

| Two-tide region | Matches observed | New casualties/match | Player placements/match | Combat frames/match | Frames, 90th percentile |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shoreline | 814 | 0.37 | 8.00 | 26.65 | 31 |
| Ocean | 371 | 1.27 | 9.99 | 39.19 | 42 |
| Bermuda | 133 | 2.26 | 12.00 | 50.05 | 57 |

Bermuda has greater attrition, but the full-run sample rarely exhausted playable schools. Later-region observations are survivor-selected and include rematches; these are not independent randomized matches.

A rough animation/wait model of 260 ms per recorded combat frame plus 550 ms per rival deployment gives 11.3/15.7/19.6 seconds of presentation overhead per two-tide match, versus 7.2/9.3/11.3 for Classic. This excludes rendering/AI runtime, human decisions, charm targeting, the intermission and reading the summary. It is a model, not a measured human duration. At an assumed ten seconds per player placement, decisions alone add 80/100/120 seconds; the assumption illustrates why pacing needs human checks. The 4/5/6 progression remains unchanged.

## Decision

**No balance values changed.** More hydration, cheaper shops or stronger starter cards are not justified by these results: playable-school shortages are rare, while the low win rate is confounded by deterministic boss repeats, simple recruitment/route policies and limited player adaptation. Keep the requested regional progression and collect human evidence before a small targeted adjustment.

Next playtest: play one complete Voyage, record actual match duration and whether deaths force an unrecoverable route, and vary strategy after a boss draw. Use the new summary to distinguish reef-control losses, casualties and resource loss. Reassess later-region attrition and school composition after that evidence; avoid a catalog-wide rebalance.

## Post-match summary

Voyage results automatically show each tide's score, the combined score, actual shell and resolve changes, casualties needing hydration, permanently consumed charm copies, and healthy creatures remaining. Boss-passage recovery is accounted for: newly killed fish revived on passage are marked restored, and earlier injuries healed are listed separately. Inspect final board closes the panel; View match summary in Battle controls reopens it until leaving the result scene. Return to map uses the existing navigation. The summary is not stored as a persistent match history.

Existing single-tide checkpoints still work. Their summary explicitly says match-wide prior charm spending is unavailable, rather than displaying a misleading zero. Native text and a scrolling dialog handle long casualty lists without shrinking pixel art.

Validation: `npm.cmd run verify` passed all 174 tests, workflow checks, type-check and build (existing bundle-size warning). A production-scene browser fixture completed both tides and showed 0–0 + 1–0 = 1–0, +14 shells, Goby needing hydration and one Anchor Stone consumed despite refreshed use. Inspect final board, reopen summary and the continuation callback worked without a second settlement. Unit coverage includes boss passage recovery, losses, boss draws, legacy spending uncertainty, carried-card isolation, depleted schools and deterministic complete-run/cap reporting. Human full-run timing and assistive-technology testing remain unperformed.

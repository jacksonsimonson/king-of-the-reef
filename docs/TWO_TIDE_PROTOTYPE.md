# Two-tide Quick Match prototype

Choose **Quick Match → Format → Two tides · prototype**. Classic remains the default; Voyage, rewards, injuries and saved runs retain their existing rules. The regional two-tide budget is ready for a later Voyage rollout; this PR still prototypes the format in Quick Match.

## Rules and pacing

- Two fresh boards with the same terrain and opening deal. Each side keeps its own school.
- Player starts tide 1; rival starts tide 2.
- **Shoreline: 4; Open Ocean: 5; Bermuda: 6 plays per side per tide.** The region controls this budget even with a custom board size or Classic play setting. Quick Match displays the selected per-tide and total budget.
- Restore the original hands, reserves and three player charms. Clear temporary card changes, played/revealed flags, Shock, casualties and pending choices. Reset the action RNG stream.
- Add both final reef scores; a tied total stays a draw. No final-tide bonus or sudden death.
- One Next tide button separates rounds. Play again clears both scores and deals a new match.

| Region | Plays per side per tide | Per player across match | Total deployments | Versus Classic | Versus earlier 4/4/4 prototype |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shoreline | 4 | 8 | 16 | +60% | unchanged |
| Ocean | 5 | 10 | 20 | +67% | +25% |
| Bermuda | 6 | 12 | 24 | +71% | +50% |

Regional progression is intentional. Each tide is one play shorter than its Classic region; two tides together are longer. These counts bound deployments, not thinking time or optional charm decisions.

## Reproducible progression study

Run: `node scripts/balance/two-tide-report.mjs`.

1,536 simulated tides: eight region/budget combinations × 24 fresh seeds × two mixed-school assignments × two charm policies × two starters. Uses the current creature catalog and production regional rival policies for both seats; a fixed stress policy handles charms. Test both symmetric charms and player-only charms. Seeds are TWO-TIDE-PROGRESSION-0 through 23, separate from the earlier study. Each row has 96 paired matches (192 tides).

| Region | Plays per tide | First wins / ties / second wins | Combined draws / 96 | Empty scoring reefs across 192 tides |
| --- | ---: | --- | ---: | ---: |
| Shoreline | **4** | 38 / 88 / 66 | **33** | 412 |
| Shoreline | 5 | 39 / 84 / 69 | 29 | 400 |
| Ocean | 4 | 42 / 59 / 91 | 31 | 320 |
| Ocean | **5** | 46 / 59 / 87 | **27** | 317 |
| Ocean | 6 | 38 / 60 / 94 | 28 | 288 |
| Bermuda | 4 | 28 / 66 / 98 | 28 | 305 |
| Bermuda | **6** | 34 / 62 / 96 | **19** | 280 |
| Bermuda | 7 | 43 / 67 / 82 | 17 | 274 |

Relative to the same-seed four-play baseline, paired draws decrease from 32.3% to 28.1% in Ocean and 29.2% to 19.8% in Bermuda. Reef occupancy modestly increases, especially in Bermuda. These samples support room for more interaction, not a claim of statistically established superiority or optimal balance.

The second mover still wins more individual tides. Two tides addresses access to that advantageous position: both players get it once. Reversing the chronological order of the two independently reset simulated legs gives the identical combined score in every pair. This is a structural property of additive scoring and resets, **not empirical proof of 50/50 human win rates**. School strength, player-only charms, different decision quality and learning the opponent's opening can still affect outcomes. The harness uses per-seat decision RNG while the scene resets one shared action stream; it is a policy comparison, not a replay of browser decisions.

Earlier investigation rejected three-play Shoreline (30/48 paired draws versus 15/48 at four). The previous 864-tide study used different seeds and is not directly comparable to this follow-up.

## Validation and human pacing gate

Automated regressions cover resource-copy isolation, regional 4/5/6 budgets, additive ties, and complete current-roster matches in both starting orders with charms. All 163 tests, workflow checks, type-check and build pass.

Browser checks: Quick Match region changes display 4/8, 5/10, 6/12 per-tide/total budgets and retain a disabled Classic-only selector. Production-scene fixtures with normal animations complete five plays per side in each Ocean tide and six in each Bermuda tide, retaining the original opening and adding both scores. Earlier Shoreline checks cover four-play transitions and fresh replay. Automated Ocean playback took 7.7 and 8.0 seconds per tide; Bermuda took 8.9 and 8.8 seconds (15.7 seconds total Ocean, 17.7 seconds Bermuda). These fixture times exclude human thinking and intermission and do not estimate typical human match duration.

Before promoting this to Voyage, compare Classic and two-tide play in each region: record elapsed time including decisions, charm use, draws and meaningful interactions. Assess whether the longer Ocean/Bermuda games earn their extra decisions, whether replaying an opening feels strategic or repetitive, and whether setup/support creatures benefit. Do not disguise longer matches as equally fast; preserve the requested progression and use human evidence to tune presentation or decision overhead next.

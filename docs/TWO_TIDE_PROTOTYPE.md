# Two-tide Quick Match prototype

Choose **Quick Match → Format → Two tides · prototype**. Classic remains the default; Voyage, rewards, injuries and saved runs retain their existing rules.

## Rules and pacing

- Two fresh boards with the same terrain and opening deal. Each side keeps its own school.
- Player starts tide 1; rival starts tide 2. Four deployments per side in each tide.
- Restore the original hands, reserves and three player charms. Clear temporary card changes, played/revealed flags, Shock, casualties and pending choices. Reset the action RNG stream.
- Add both final reef scores; a tied total stays a draw. No final-tide bonus or sudden death.
- One Next tide button separates rounds. Play again clears both scores and deals a new match.

Eight placements per player means 16 total, compared with Classic's 10/12/14: +60%/+33%/+14%. This is shorter than two full regional battles (20/24/28 placements), but especially on Shoreline it is still longer than Classic. Four per tide is a deliberate minimum for setup and interaction, not a claim that match duration is unchanged.

## Reproducible policy study

Run: `node scripts/balance/two-tide-report.mjs`.

864 simulated tides: three regions × three budgets × 12 fresh seeds × two mixed-school assignments × two charm policies × two starters. Uses the current creature catalog and production regional rival policies for both seats; a fixed stress policy handles charms. Test both symmetric charms and player-only charms. Seeds are TWO-TIDE-FRESH-0 through 11. Each budget has 48 paired matches per region.

| Region | Plays per tide | First wins / ties / second wins (96 tides) | Combined draws (48 pairs) |
| --- | ---: | --- | ---: |
| Shoreline | 3 | 6 / 64 / 26 | 30 |
| Shoreline | **4** | 16 / 52 / 28 | **15** |
| Shoreline | 5 | 20 / 47 / 29 | 14 |
| Ocean | 3 | 12 / 45 / 39 | 15 |
| Ocean | **4** | 13 / 40 / 43 | **12** |
| Ocean | 6 | 22 / 20 / 54 | 15 |
| Bermuda | 3 | 12 / 41 / 43 | 12 |
| Bermuda | **4** | 14 / 38 / 44 | **17** |
| Bermuda | 7 | 23 / 32 / 41 | 11 |

Three-play Shoreline was rejected: 62.5% of paired matches tied, versus 31.25% at four plays. Four-play Ocean ties were 25%; Bermuda 35.4%. The latter remains a concern to test with humans.

The second mover still wins more individual tides. Two tides addresses access to that advantageous position: both players get it once. Reversing the chronological order of the two independently reset simulated legs gives the identical combined score in every pair. This is a structural property of additive scoring and resets, **not empirical proof of 50/50 human win rates**. School strength, player-only charms, different decision quality and learning the opponent's opening can still affect outcomes. The harness uses per-seat decision RNG while the scene resets one shared action stream; it is a policy comparison, not a replay of browser decisions.

## Acceptance and remaining questions

Automated regressions cover deep resource-copy isolation, budgets, additive ties, and complete current-roster short games with each starter. Browser checks completed: real Quick Match setup selects the prototype and disables the Classic-only play count; the production scene completed both tides through an automated legal-placement fixture with normal animations. The intermission retained tide 1’s 0–2 score; tide 2 started with rival turn, zero plays, three charms, no pending choices/Shock/casualties and an unchanged opening snapshot. Tide 2 ended 0–1, correctly producing combined 0–3. Replay cleared scores and returned to player-first with a new opening. Both four-move player legs took approximately 5.5 seconds of automated playback (excluding human decisions/intermission); this is only animation/flow evidence. Canvas result and native-size scrolling were inspected.

Do not promote this to Voyage until human playtests answer: does eight player placements feel brisk, does replaying the opening create adaptation or repetition, and are setup/support creatures useful within four moves? Compare a Classic and two-tide match in each region with similar schools; record elapsed time including decisions, charm use, draws and meaningful interactions. Animation-only or automated timings are not human match times. No deck reshuffle or further creature balancing is justified by these numbers alone.

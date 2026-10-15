# Fresh-seed charm and turn-order measurements

Reproduce with `node scripts/balance/charm-report.mjs`. Read [interpretation and limitations](BALANCE_BATCH_2.md). 512 creature-comparison matches: 8 fresh seeds × 2 acting orders × 4 three-charm loadouts × player-only/both-side charms × 2 creatures × before/after. All use Bermuda Expert, regional terrain and the existing mixed schools.

| Creature / charm seats | Better / same / worse pairs | Old → proposed mean margin | Old → proposed plays |
| --- | --- | ---: | ---: |
| void-angler / player | 17 / 36 / 11 | -0.141 → -0.063 | 63 → 63 / 64 |
| void-angler / both | 14 / 38 / 12 | -0.391 → -0.281 | 61 → 58 / 64 |
| buoy-jelly / player | 14 / 33 / 17 | 0.359 → 0.328 | 64 → 64 / 64 |
| buoy-jelly / both | 10 / 38 / 16 | 0.203 → 0.063 | 64 → 63 / 64 |

| Charm | Uses across all comparison matches | Uses targeting a study creature |
| --- | ---: | ---: |
| spear-shell | 192 | 32 |
| breaker-tooth | 192 | 20 |
| barbed-wreath | 192 | 10 |
| anchor-stone | 192 | 72 |
| reef-beacon | 192 | 66 |
| duelist-pearl | 192 | 57 |
| nautilus-dial | 192 | 72 |
| coral-mail | 192 | 40 |
| drift-shell | 168 | 0 |
| dredger-net | 192 | 76 |
| current-conch | 192 | 0 |
| spyglass-pearl | 192 | 13 |

## Turn-order diagnostics

192 additional full matches: 8 new seeds × 2 schools × both starters × 3 regions × two schedules. No charms; Tactical AI on both seats in all regions avoids an Expert forecast that assumes the next move belongs to the opponent during consecutive snake turns. This policy still optimizes final control, not accumulated scoring.

Counts are first-side wins / ties / second-side wins, 32 matches per row. Tie-break and checkpoint scores are rescoring of the same alternating games, not policies trained for those rules. Snake alternates initiative per two-play round (AB, BA, AB…).

| Region | Alternating, final control | Snake, final control | Alternating, first wins ties | Alternating, sum of round-end control |
| --- | --- | --- | --- | --- |
| Shoreline | 7 / 17 / 8 | 8 / 12 / 12 | 24 / 0 / 8 | 13 / 4 / 15 |
| Ocean | 5 / 8 / 19 | 12 / 12 / 8 | 13 / 0 / 19 | 5 / 3 / 24 |
| Bermuda | 8 / 8 / 16 | 7 / 11 / 14 | 16 / 0 / 16 | 5 / 3 / 24 |

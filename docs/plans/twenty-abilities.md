# Twenty battle abilities

Implement all assignments in ABILITY_ASSIGNMENTS.md on a new PR after merged #43. No Colossals or outside-battle effects. One agent, internal test batches.

1. Pure ability rules, temporary state, legal options, version-seven roster with frozen version-six definitions.
2. Resolver, scoring, public-information rival choices, hand/reserve effects, stable saves and tide resets.
3. Player choice UI, visible growth/Inflate/marker state, ability art and descriptions; native-size browser checks.
4. Focused regression batches, current-vs-previous mixed schools with both starters and charms, conservative tuning, final verify/PR.

Risks: self-moving edge origins; token expiry with exhausted sides; hidden information; optional choices during checkpoints; versioned old rosters; charm combinations; direct-reef score advantages. No extra placements or permanent school changes. Never label design analysis as measured balance.

Completed: all four implementation phases, 279 passing tests and production build, individual-host and combined-school comparisons, browser choices/cancellation/reveal/exchange/draw flow and tide transition. See ../BATTLE_ABILITY_IMPLEMENTATION.md for outcomes and limitations. Next action: PR review and human playtesting.

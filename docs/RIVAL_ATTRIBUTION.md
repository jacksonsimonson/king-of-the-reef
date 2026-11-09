# Later-region difficulty: composition versus decisions

**School composition is the larger tested contributor to the early later-region difficulty gap.** AI strength matters, but lowering it does not remove the gap. Removing weighted selection also leaves most of the difficulty intact. Keep current gameplay values: this experiment identifies a direction for progression work, not a validated replacement reward, price or AI setting.

This follows the [full integration pass](VOYAGE_INTEGRATION.md) and [rejected target-rating reductions](CARRIED_RIVAL_STUDY.md). Base: merged PR #50, `54ad1b4337d9423eb5382d1514416d05b0f7ec35`; current balance version 7, rival version 1. No new save version or visible rival labels.

## Controlled comparison

Use the 104 carried encounters from the prior experiment, then collect 32 more from eight new map seeds. Each snapshot is one of the first two ordinary encounters reached in Open Ocean or Bermuda under the existing recovery-route, baseline/deliberate recruiting, 85%-catch and elite-avoidance policies. Collection spans 80 baseline Voyages on 40 map seeds; only surviving runs contribute later snapshots. Duplicate carried states across school policies are removed.

Replay every snapshot with three rival compositions and all three AI settings:

- **Weighted:** the exact production rival school.
- **Uniform:** ten cards drawn without replacement from the enabled regional pool. This bypasses style bias, candidate-budget selection and the positioning minimum together, testing the overall selection mechanism rather than one individual weight.
- **Carried:** ten cards sampled from the player's healthy carried copies. Recycle the available copies only if fewer than ten remain. This is a diagnostic composition control, not a proposal to give rivals copies of the player's school or earlier-region cards.

Every rival still has ten healthy copies with distinct IDs. Player cards, injuries, starting charms, terrain/deal seed, 5/6 plays per tide and both starting orders stay fixed. The player uses Expert decisions throughout; only rival difficulty changes. Charm actions use the same policy, but can differ as board states diverge. Copies are independent, and each replay checks that the original snapshot remains unchanged.

**136 snapshots × nine settings = 1,224 combined matches / 2,448 tides.** These comprise 104 Ocean snapshots from 30 map seeds and 32 Bermuda snapshots from 12 seeds. All 136 production-setting scores exactly reproduce the previous study baseline. The eight new map seeds were not used in the earlier target experiment.

## Results

Counts are player wins/draws/losses. Margin is mean player score minus rival score over both tides. Rows within each region use identical snapshots.

| Rival composition | AI | Ocean W/D/L (104) | Ocean margin | Bermuda W/D/L (32) | Bermuda margin |
| --- | --- | --- | ---: | --- | ---: |
| Weighted | Beginner | 9 / 22 / 73 | −1.144 | 2 / 5 / 25 | −1.969 |
| Weighted | Tactical | 5 / 18 / 81 | −1.346 | 0 / 5 / 27 | −2.125 |
| Weighted | Expert | 4 / 11 / 89 | −1.625 | 0 / 0 / 32 | −2.500 |
| Uniform | Beginner | 8 / 18 / 78 | −1.202 | 2 / 5 / 25 | −1.594 |
| Uniform | Tactical | 6 / 17 / 81 | −1.433 | 2 / 3 / 27 | −1.875 |
| Uniform | Expert | 0 / 14 / 90 | −1.808 | 1 / 2 / 29 | −1.906 |
| Carried | Beginner | 53 / 39 / 12 | +0.606 | 11 / 12 / 9 | +0.125 |
| Carried | Tactical | 35 / 41 / 28 | +0.077 | 8 / 10 / 14 | −0.281 |
| Carried | Expert | 25 / 47 / 32 | −0.106 | 12 / 2 / 18 | −0.125 |

For **Ocean**, lowering the production Tactical AI to Beginner improves margin by 0.202 and changes 81 losses to 73. Keeping Tactical but changing to the carried composition improves margin by 1.423 and changes 81 losses to 28. Uniform regional selection still produces 81 losses. The weighting system is not the main explanation for the observed gap.

For **Bermuda**, lowering production Expert AI to Tactical improves margin by 0.375 and changes 32 losses to 27. Keeping Expert but changing to carried composition improves margin by 2.375 and changes 32 losses to 18. Uniform regional selection gives a smaller improvement, to 29 losses. Both selection and AI matter here, but the regional-versus-carried composition difference is substantially larger in this sample.

The carried player school averages 12.63 healthy copies in Ocean, with only 1.10 belonging to that region's pool. Bermuda averages 16 healthy copies, with 1.38 regional copies. These are early-region snapshots, not whole-region averages. A fully regional rival and an accumulated school face quite different composition constraints even when both have ample playable cards. This supports examining regional recruitment access and school fit; it does not prove that every later-region creature is individually stronger.

### New-map check: seeds 32–39

Six seeds reached Ocean (24 snapshots); three reached Bermuda (eight snapshots).

| Region | Current weighted W/D/L | One easier AI W/D/L | Uniform, current AI W/D/L | Carried, current AI W/D/L |
| --- | --- | --- | --- | --- |
| Ocean | 0 / 5 / 19 | 0 / 8 / 16 | 0 / 4 / 20 | 7 / 8 / 9 |
| Bermuda | 0 / 0 / 8 | 0 / 2 / 6 | 0 / 2 / 6 | 1 / 1 / 6 |

At current AI, carried composition improves mean margin by 1.417 in Ocean and 2.000 in Bermuda. One easier AI improves it by 0.458 / 0.500. The same direction appears on new maps, though the Bermuda sample is small and the loss counts alone do not distinguish the three alternatives there.

## Decision and limits

Keep the three regional difficulties, full regional rival pools, internal playstyles, elite premiums and current card values. Do not replace regional schools with the carried control or remove weighting; those are diagnostic interventions. No production balance change is justified by a tested small candidate in this PR.

The next targeted experiment should improve **the player's access to an appropriate regional recruit near arrival**, with a choice that helps the existing school, and compare that against unchanged progression. Test the economy cost, actual recruitment, school dilution and full-Voyage outcomes before adopting a reward or price adjustment. Do not add several free creatures, overhaul the roster, or flatten AI levels based on this report. Starting-school choices stay shelved; bespoke Colossals remain last.

The composition control changes the rival's species distribution and potential synergies together; it does not attribute difficulty to one specific ability or creature. One deterministic rival sample per composition/fixture is used. AI levels are bounded heuristics, not guaranteed monotonic strength in every matchup. The automated player may miss human plans. Snapshots are correlated and survivor-selected; mean differences are descriptive, not a percentage decomposition of all difficulty. We do not measure downstream progression after counterfactual battles, human fishing skill, visual clarity, input feel or real match duration. No new browser playtest was performed because only study tooling, tests and documentation change.

## Reproduce and validation

Use the pinned Node version. On a clean checkout, regenerate the ignored input fixtures/results first:

```powershell
node scripts/balance/carried-rival-study.mjs 0 8
node scripts/balance/carried-rival-study.mjs 8 8
node scripts/balance/carried-rival-study.mjs 16 16
node scripts/balance/carried-rival-study.mjs 32 8
node scripts/balance/rival-attribution-study.mjs 0
node scripts/balance/rival-attribution-study.mjs 8
node scripts/balance/rival-attribution-study.mjs 16
node scripts/balance/rival-attribution-study.mjs 32
node scripts/balance/rival-attribution-evidence.mjs .cache/balance/rival-attribution-0.json .cache/balance/rival-attribution-8.json .cache/balance/rival-attribution-16.json .cache/balance/rival-attribution-32.json
node scripts/balance/rival-attribution-evidence.mjs .cache/balance/rival-attribution-32.json
node --test tests/rival-attribution.test.mjs
npm.cmd run verify
```

All four attribution batches completed with baseline-reproduction and snapshot-integrity assertions passing. The new control test checks exact production decks, deterministic unique regional draws, healthy-copy selection, unique rival IDs and independent card edges. Final verification passed all 296 tests, workflow checks, type-check and build; the existing large-bundle warning remains.

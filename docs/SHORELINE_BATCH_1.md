# Shoreline role pass — crab batch 1

Historical first phase of PR #36. The same PR now contains the [complete 77-creature Shoreline pass](SHORELINE_BALANCE.md), superseding the remaining-work checklist below. Version 3 is preserved for crab-preview saves; new runs now use version 4.

Three of the 77 Shoreline creatures reviewed in this new systematic pass; two changes adopted. This is not sign-off on the entire region. Earlier pilot/batch evidence remains relevant. Keep regional teaching progression, thematic families and relative weights; do not add unrelated edges to fill empty sides.

| Creature | Primary job and theme | Decision | Ordinary limitation |
| --- | --- | --- | --- |
| Hermit Crab | Simple lateral setter; claw pushes while shell shields its back | Keep Right Standard, Left Shield | Needs an ally/target to move; exposed vertical approaches. A rightward push can hurt allies |
| Horseshoe Crab | Guarded vertical setter; broad carapace protects two approaches | Move Right Standard to Down Standard; retain Up/Left Shields | Gives up horizontal setup and right-side Standard defense; enemy can push from the right. Downward shove can remove an allied holder or kill an ally at the boundary |
| Pom-Pom Crab | Setter with lateral retaliation; anemone claws punish enemy pushes | Add Down Standard; retain Right/Left Spines | Needs delivery to score itself. Open top admits an enemy push without retaliation; lateral Spines punish an enemy but do not keep the crab on its reef. Downward shove can disrupt allies |

These crustaceans share simple directional movement with shell protection or retaliation. Similar anatomy supports related mechanics, not identical layouts. Pom-Pom shares a downward setup tool with Urchin but has narrower retaliation coverage. That is not a claim of equal power: revisit their relative value in later whole-roster comparisons. Rarity and acquisition costs are not compensation for weaker battle choices.

## Evidence

`node --test tests/shoreline-crabs.test.mjs`: 13 tests covering the three roles on 5/6/7 boards, useful reef delivery, defensive/occupancy counters, exposed approaches, friendly displacement, retaliation, and save compatibility. Spines reacts to enemy pushes only; it does not kill allied pushers.

The initial Pom-Pom Hook proposal was rejected because it exceeded the existing Shoreline two-special-edge limit. The final Standard proposal respects that gate; no test limit was weakened.

Run `node scripts/balance/shoreline-crabs.mjs 8 0` and `node scripts/balance/shoreline-crabs.mjs 8 8`. Detailed rows go to `.cache/balance/shoreline-crabs-0.json` and `-8.json`. Each comparison changes one candidate on the player side, leaving its opposing copy unchanged. Two eight-card mixed schools, 16 seed identifiers, three charm conditions (none; Anchor/Beacon/Duelist; Spear/Mail/Barbed), seeded Shoreline terrain, Tactical policies for both seats, four plays per side per tide. Each match resets opening resources and swaps the starter; compare combined reef margins. Player-only charms mimic Voyage inventory access. Both copies can use refreshed charms in tide two.

192 paired before/after comparisons = 384 two-tide matches = 768 tides. Each candidate has 48 pairs per seed batch. First eight seeds explore; the next eight are a separate check of the same proposal, not independent human validation.

| Candidate / seeds | Better / same / worse combined margin | Mean margin before → after | Candidate plays per match before → after |
| --- | --- | --- | --- |
| Horseshoe / 0–7 | 0 / 45 / 3 | 0.604 → 0.542 | 0.854 → 0.896 |
| Horseshoe / 8–15 | 3 / 38 / 7 | 0.771 → 0.688 | 1.333 → 1.375 |
| Pom-Pom / 0–7 | 3 / 42 / 3 | 0.542 → 0.542 | 0.771 → 0.917 |
| Pom-Pom / 8–15 | 5 / 41 / 2 | 0.604 → 0.729 | 1.292 → 1.438 |

Adopt Horseshoe as a modest differentiation/tradeoff, not a buff: it remains selected while losing some aggregate control. Adopt Pom-Pom's baseline setup action: role fixtures show a useful contribution beyond waiting to be attacked, and the mixed-school sample does not show a large swing. Neither finding proves equal strength. No full-Voyage attrition study, human match evaluation, all-charms coverage or optimal charm policy is claimed. Separate-tide casualty totals in raw output are diagnostic counts, not unioned Voyage injuries.

Relative component load remains Horseshoe 2.5–3.5 and Hermit 1.75–2.25; Pom-Pom moves from 1–2.5 to 2–3.5 (Standard = 1 baseline). These revision-scoped estimates are not power scores or automatic rarity budgets.

## Compatibility and next batch

New Voyages use `cardBalanceVersion: 3`. Version 2, version 1 and unversioned saves keep their respective school/recruit/rival rules through frozen catalog overrides. Existing IDs, rarity, fishing movement, art, pool membership and shop prices do not change. Gallery and journal show current definitions; school inspection continues to show owned saved copies.

Next review related Shoreline setters and crustaceans (Crab, Decorator Crab, Arrow Crab and shrimp) against these references. Record an explicit keep/change decision per creature, preserve coherent gimmicks, and finish the region in small batches before starter-school design. Colossals remain last.

Browser check: isolated fixture using production drawFishCard/cardElement renderers and resolvePlacement. Both Horseshoe and Pom-Pom placed at B1 moved an allied Goby B2 → reef B3. Updated edge markers were inspected at native board and larger inspection sizes. This was not a full manual match. Local screenshot: .cache/shoreline-crabs.png. Full verification passed 191 tests, workflow checks, type-check and build; existing bundle-size warning remains.

# Balance batch 1: thematic roles

Follow-up to the [initial pilot](BALANCE_PILOT.md), using the [relative balancing framework](CREATURE_BALANCE.md). This is a two-creature trial, not a roster-wide rebalance.

## Accepted assignments

| Creature | Primary role and theme | Live change | Deliberate limitation |
| --- | --- | --- | --- |
| Sea Urchin | Reef setter with spiny retaliation; the underside push represents its tube feet | Down Standard; Up/Right/Left remain Spines | Needs an ally to move itself onto a reef. Its push can throw allies off-board. Down Double can move it without retaliation |
| Phantom Shark | Evasive predator: reposition, then attack exposed prey | Up Bounce resolves before Right Bite; remove Down Ram and Left Dive | Blocked retreat spoils the intended attack angle. Shield stops Bite. Blank lower/left sides admit ordinary pushes. Bite can kill allies |
| Electric Eel | Intentional electrical shutdown gimmick | Keep all four Shock edges; reject the proposed Standard replacement for this batch | No independent reef entry; needs an allied follow-up. Unshielded allies can be shocked |

Creature identity is an acceptance criterion alongside useful play. Not every card needs an independent scoring move; a few coherent gimmicks are welcome. No rarity, regional pool, price, sprite, or innate ability changes. Shoreline retains simple push/retaliation/shutdown interactions; Bermuda retains the later sequencing challenge of Bounce then Bite. The broader proposed ability introduction ladder remains unimplemented.

## Reproducible role tests

Run `node --test tests/role-batch.test.mjs`. Five scenario groups run on each of 5×5, 6×6 and 7×7 boards, plus one save-compatibility group: 16 passing tests. These are constructed scenarios, not independent battle samples or win-rate estimates.

Let R be the middle scoring reef, S the board width; unmentioned tiles are empty. Targets have blank edges unless specified. No terrain or charms are present.

| Situation | Setup and observed result |
| --- | --- |
| Urchin allied delivery | Ally at R−S; place Urchin at R−2S. New Down Standard delivers the ally to R; old four-Spines Urchin cannot |
| Urchin collateral cost | Ally at bottom-row column B; place Urchin above it. The new push removes the ally off-board |
| Retaliation versus holding | Urchin at R; rival left of R uses Right Standard. Urchin moves off the reef, attacker dies. Spines is retaliation, not retention |
| Underside counter | Rival below Urchin uses Up Double. Urchin moves upward; attacker survives, unlike an attack into a Spines side |
| Phantom evasive attack | Enemy at R+1; place Phantom at R−S. Bounce retreats onto R, then Bite removes the enemy. Both original and simplified versions achieve this |
| Blocked retreat | Ally already at R stops the retreat; the enemy at R+1 survives because Bite resolves from the original row |
| Phantom costs/counters | Left Shield on prey stops Bite; friendly prey is killed; an Up Standard push from below dislodges the new Phantom whereas the old Down Ram defended that approach |
| Eel support sequence | Enemy at R has four Standard defenses. Ordinary Right Standard cannot move it; Eel placed above shocks it, enabling the subsequent allied push from the left |
| Eel collateral and defense | A nearby unshielded ally is shocked; a nearby ally with facing Shield is not. Four-Shock identity remains unchanged |

Browser check: an isolated local fixture used the production battle scene and Place controls on a 5×5 board. Sea Urchin at B1 pushed allied Minnow B2 → B3, awarding one reef point. Phantom at B2 retreated to B3 then removed enemy Minnow at C3, awarding one reef point. Updated text descriptions and Phantom's two visible edge markers matched the new definitions. This was a controlled interaction check, not an entire voyage or mixed-school balance session.

## Relative assessment and continuity

The existing provisional component ranges remain unchanged. Urchin changes from 2–5 to 2.5–4.75; Phantom from 5.5–9.75 to 3–5; Eel stays 4–8. These totals are not power ratings: Phantom still has strong empty-board and final-turn reef access. Losing edges changes defenses and later movement as well as complexity. No global rankings or automatic buffs/nerfs follow from these values.

The generated inventory reflects the current catalog (37 reef setters, 49 displacers, 26 predators, 41 flexible movers, 11 holders, 3 supports; 52 mixed packages). The original comparison pilot uses pre-batch layouts so its historical results remain reproducible. Future balance batches must extend the historical catalog overrides when changing additional cards.

New voyages use `cardBalanceVersion: 1`; existing voyages without that marker keep pre-batch future recruits, rival definitions and previews. Serialized school and battle cards remain intact. Older reef pool versions still use their older catalog. Unknown balance versions are rejected rather than silently interpreted.

## Next evidence to collect

Play mixed regional schools with both acting orders, especially Phantom as the last play, Urchin's added defensive underside, Eel support tempo, and charm-granted abilities. Record positions and accepted friendly harm. Human playtesting and broader paired battles remain outstanding. Review another small thematic cluster after that evidence; keep new abilities available as future design space and Colossals last.

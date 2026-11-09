# Voyage foundation

Voyage is a saved three-region run reached from the main menu. Maps read left to right. Each new voyage receives a random seed; entering the same seed reproduces the same charts and encounter offers. Maps and pixel symbols are drawn directly at native size, with scrolling on narrower desktops.

Departure uses the original fixed eight-creature reef school and optional seed. [Starting-school choices](STARTING_SCHOOLS.md) are shelved; existing saved schools remain unchanged. New Voyage uses the previous compact confirmation dialog, and cancelling keeps the current run intact.

Noncombat visits use [dedicated encounter screens](ENCOUNTER_SCREENS.md) with original scene art. The chart can be inspected and the visit resumed without spending its action. Shop purchases and pending visits survive reload; unconfirmed card selections do not.

## The three regions

1. **Shoreline:** sunlit sand and shallows on the left, tidepools through the middle, coral reefs on the right.
2. **Open Ocean:** the continental shelf darkens toward a midnight trench. An arctic current and ice floes cross the middle of the chart.
3. **Bermuda Triangle:** wrecks, frequent forked lightning, whirlpools, waterspouts and rogue waves converge on the triangle's heart. The voyage-chart disasters remain scenery; battle terrain has its own explicit rules.

Battlefields use subtle native-size scenery and water/border palettes matching their current region. Boards and per-side, per-tide placement budgets grow by region: Shoreline 5×5/four, Open Ocean 6×6/five, Bermuda 7×7/six; [regional terrain](TERRAIN.md) adds rocks, whirlpools, and two themed positional mechanics per sea.

Each region ends at a **Colossal**, a giant ocean creature ruling that part of the sea. Reef Colossal, Abyssal Colossal and Triangle Colossal are provisional encounter labels. Their species, identities, unique artwork and bespoke rules await the user's designs. For this foundation they use ordinary reef combat with themed, stronger schools.

## Map generation

New voyages have a departure, seventeen encounter columns and one Colossal (19 columns total): 18 stops per region, 54 per voyage. Existing saves retain their original 13-column maps. Interior columns have two to four nodes spread over five lanes. Adjacent columns connect through monotone branches and merges. Every node is reachable from departure and can reach the Colossal; paths never cross except where they join a node. Only connected successors may be entered, and a visited space cannot pay out twice.

The following percentages apply to unforced encounter columns:

| Space | Shoreline | Open Ocean | Bermuda Triangle |
| --- | ---: | ---: | ---: |
| Battle | 38% | 38% | 38% |
| Fishing | 25% | 25% | 25% |
| Shop | 10% | 10% | 10% |
| Unknown Waters | 12% | 12% | 12% |
| Hydration | 10% | 10% | 10% |
| Release | 5% | 5% | 5% |

All regions share these rates. Fishing remains at its original Shoreline frequency; Release takes five percentage points from Unknown Waters. Existing saved charts retain their encounter types; start a new voyage to use the new distribution.

For new voyages, guaranteed columns are Fishing 1; Battles 2, 8 and 14; Shops 5 and 11; Hydration 6, 12 and 17; and Colossal 18. This limits recovery gaps to six steps and guarantees two merchants. Other columns retain weighted branching choices. Older voyages preserve their original schedule. Ocean species-zone bias scales with relative map progress rather than raw column number. Maps scroll at native size and reopen near your current position.

## Encounters and persistent school

- Begin with eight healthy shoreline creatures, 24 shells and three resolve (18 shells in older voyages).
- **Fishing:** try one of three seeded regional catches or skip. Use Left / Right in the fishing minigame; escape ends the stop without a retry. See [FISHING.md](FISHING.md).
- **Shop:** three seeded offers mixing regional creatures and Tide Charms, left to right in ascending price. Every new shop has fresh stock; buying leaves a sold-out slot without rerolling or restocking. Buy multiple offers if affordable, then Sail On. See [SHOPS.md](SHOPS.md).
- **Event:** new voyages draw seeded regional rescue, salvage, recovery, or trading encounters. Rescue offers a shown regional creature versus 12 shells; salvage offers 8 safe shells, 24 shells for one resolve (requires at least two), or a 10-shell rescue; recovery offers one resolve, an 8-shell restoration of one selected killed fish, or 10 shells for helping; traders offer a selected-card exchange plus six shells, a 14-shell purchase, or 10 shells for guiding. Every stop grants only one outcome. Selection, exact costs, and the offered creature are visible before commitment. Existing saves without event version 1 retain the original rescue/salvage choices.
- **Hydration:** select up to three killed cards to restore, then confirm. Also recover one resolve, capped at three. Healthy schools can still recover resolve without selecting cards.
- **Release:** select and confirm one card to permanently remove, or leave. The school must retain at least five total cards and one healthy creature. Killed cards can also be released.
- **Battle:** draws up to five healthy creatures from the actual school, then refills played slots from the shuffled reserve. Each side has four/five/six placements per tide by region in [two-tide battles](#two-tide-battles); an exhausted smaller school stops earlier. Use Tide Charms before placing your fish. New voyage wins grant 14/16/18 shells by region, ties grant six, and losses cost one resolve, settled once for the combined match. Legacy rewards remain 12/four. A loss alone no longer kills an unrelated reserve creature.
- **Killed cards:** cards removed by Bite or pushed off the board (including Wave) are killed. Actual player casualties are saved at match completion regardless of victory, tie or defeat; AI simulations never cause deaths. Killed cards remain in the school but cannot be drawn until Hydration restores them. Older knocked-out cards migrate to this status.
- **Colossal:** win to advance to the next region and gain 28/32/36 shells by region (25 in older voyages). New voyages restore up to three killed fish and one resolve when entering the next sea. A tie offers a rematch without penalty. A loss costs resolve and requires another attempt. Defeating the third Colossal completes the voyage.
- Zero resolve ends the run. Quick Match is independent of the voyage.

Map progress, school, shells, resolve, seed and pending encounter auto-save in local browser storage. The result is saved when combat ends, before leaving the result screen. Returning to the menu and reopening Voyage resumes it. Stable battle decisions now auto-save the board, both hands and reserves, revealed cards, Shock, casualties, placement counts, random sequence, temporary upgrades, and pending Rally/Revelation choices. Charm spending and its effect save together. Reloading during animation resumes the previous stable decision; optional unconfirmed charm targeting resets without spending. A saved rival turn resumes automatically. Result processing clears the checkpoint before rewards are saved, preventing repeat payouts. Quick Match remains unsaved. Unavailable storage leaves the current session playable and displays a warning. Starting another voyage asks before replacing the saved one.

Starting a Voyage also snapshots the Gallery's enabled Battle Roster. That snapshot controls its starting school, future catches, shop creatures and rival schools through the entire run. Later roster changes affect Quick Match immediately and the next new Voyage, never the active one. Existing owned cards are never removed by roster settings.

The Reef draw-table version is saved with that snapshot. Existing Voyages retain their original creature weights and pending offers when the catalog expands. New Voyages get the advanced Rare batch. If fewer than eight Shoreline species are enabled, the starting school repeats enabled species to reach eight cards, each with a unique identity.

Future region tabs permit inspection without unlocking travel or rewards there. The school inventory, catches and recovery choices show framed cards with directional edge badges at native pixel sizes. Killed cards have dimmed creature art and an explicit status; their edge icons stay readable.

## Validation

`npm test` runs deterministic generation and state-transition checks, including 3,000 maps across the three regions, a statistical check of encounter weights, legal routes, noncrossing paths, all three finales, purchases, hydration, defeat, duplicate reward prevention and save/load. `npm run build` checks TypeScript and production bundling.

## Two-tide battles

New battle and boss encounters use two tides with 4/5/6 plays per side per tide in Shoreline/Open Ocean/Bermuda. Boards remain 5×5/6×6/7×7. You start tide 1; the rival starts tide 2. Add both final reef scores before awarding shells, losing resolve or advancing past a boss. A tied boss match requires a rematch under the existing rule.

The second tide restores the opening hands, reserves, board and up to three available charms, clearing temporary upgrades, reveals and Shock. Fish killed in either tide return for tide 2 but need hydration after the combined result. Charms used in either tide are consumed at match end: each inventory copy can be reused in the other tide without a second charge. Duplicate charms consume the maximum number of copies used in either tide; any legacy queued inventory beyond the three available charms remains untouched.

Checkpoints include both-round bookkeeping, the original deal, current charms, action RNG position and the intermission. Leaving at the intermission resumes the Next tide screen; leaving during tide 2 preserves tide 1’s score and casualties. Existing saved single-tide battles finish unchanged; their next battle or boss rematch uses two tides. No card catalog or map migration is required. See [balance and pacing evidence](TWO_TIDE_PROTOTYPE.md).

After the combined result, a scrolling match summary shows both tide scores, actual shell/resolve changes, casualties, charm copies consumed and regional-passage recovery. Inspect final board closes it; Battle controls → View match summary reopens it before leaving. It is not persistent match history. See the [full Voyage balance study](FULL_VOYAGE_BALANCE.md) for current attrition and pacing evidence.

## Weighted rival schools and optional elites

New voyages use rival-school version 1. Ordinary and elite battles draw ten creatures from the current area's enabled roster, with saved card definitions. No creature repeats until that pool is exhausted. Each node has one of five seeded broad styles. Shoreline introduces Neutral, Attackers, Defenders, Disablers, and Positioners. Open Ocean and Bermuda specialize these tendencies with additional selection weights, using creatures already present in the area. Styles change school composition, not AI difficulty or a scripted move sequence. Every local creature remains eligible; a broad-style match receives 1.6 times the base selection weight, multiplied by 1.2 for an Open Ocean specialty or 1.4 for a Bermuda specialty. Neutral has no broad bias; later Neutral schools favor flexible support tools. There are no authored decks or mandatory signature cards.

| Broad style / Shoreline | Open Ocean | Bermuda |
| --- | --- | --- |
| Neutral — general mix | Coordinated — reserve/information/support abilities | Adaptable — flexible innate tools |
| Attackers — kill or knock creatures out of position | Pack Hunters — predators and allied pressure | Ambushers — predators and surprise tools |
| Defenders — protect positions and punish attacks | Armored — Shields and resistance to displacement | Retaliators — Spines and lingering defenses |
| Disablers — reduce enemy options | Interference — Hooks and Anglerfish's lure | Saboteurs — Shock and Rust Lobster's snare |
| Positioners — move creatures to control reefs | Current Specialists — Hooks, Waves and following currents | Tricksters — swaps, rebounds and directional flexibility |

These are preferences rather than promised mechanics in every hand. In particular, Open Ocean currently has no Shock edges; its disruption specialty uses its existing pullers and lure instead of inventing a Shock roster. Restricted enabled pools can dilute any specialty.

Selection uses a provisional, relative recruitment rating in src/game/run/rivalSchools.ts, independent of the design framework's component-load budgets and card rarity. Directional coverage, diminishing returns for repeated effects, and innate utility inform the rating. Sixteen random candidate schools are compared to a shared regional average rating, with a strong penalty for fewer than three positioners when the pool permits. This limits random difficulty spikes without requiring a rigid role quota. A restricted pool can repeat cards and may not meet the usual composition target. These ratings are hypotheses, not universal strength scores; changing abilities calls for rerunning the matchup study.

Elites favor higher-rated cards and target the regional average plus 0.45 regional standard deviations. They retain the same board, plays, regional AI, and rules. New long maps can mark one battle at each of steps 8 and 14 as elite, only where every immediate predecessor also connects to a normal alternative. Some maps therefore have fewer than two elites. The gold icon, Elite battle label, and reward preview appear before committing. Rival archetype names and descriptions are internal only and never appear in the player UI. All five broad categories remain available in every area; specialty weights are deliberately gentle (at most 2.24 times base) to preserve mixed schools. Wins pay 22/24/26 shells (eight more than normal); ties still pay six and losses cost one resolve. Saved node types and elite markers survive reload. Older voyages retain their original generator; Colossal placeholder decks and Quick Match are unchanged.

### Validation and balance evidence

Reproduce with:

~~~powershell
node scripts/balance/rival-schools.mjs 3200 16
node scripts/balance/rival-schools.mjs 4200 16
node scripts/balance/rival-schools.mjs 5200 2 expert
~~~

The main comparison covers 3,840 Tactical tides: 32 seed groups × three regions × five styles × normal/elite × both starting orders × both ownership assignments. Each generated opponent faces a separately generated balanced local school. Opposing starts share terrain and deal seeds; ownership also swaps to control directional advantages. Each row below averages 128 tides per difficulty across both batches. Positive margin favors the balanced comparison school; negative favors the styled opponent.

| Region | Style | Normal mean margin | Elite mean margin |
| --- | --- | ---: | ---: |
| Shoreline | neutral | -0.148 | -0.195 |
| Shoreline | attackers | -0.102 | -0.094 |
| Shoreline | defenders | 0.031 | -0.078 |
| Shoreline | disablers | 0.070 | -0.156 |
| Shoreline | positioners | -0.156 | -0.180 |
| Open Ocean | neutral | 0.008 | -0.086 |
| Open Ocean | attackers | 0.000 | -0.102 |
| Open Ocean | defenders | -0.063 | -0.008 |
| Open Ocean | disablers | -0.086 | -0.141 |
| Open Ocean | positioners | -0.141 | -0.227 |
| Bermuda | neutral | 0.031 | -0.164 |
| Bermuda | attackers | 0.219 | 0.094 |
| Bermuda | defenders | 0.039 | -0.094 |
| Bermuda | disablers | 0.039 | -0.250 |
| Bermuda | positioners | 0.016 | -0.461 |

Normal styles remain near parity in this sample. Elites improve the aggregate opponent margin in every region, but not every style or seed batch: higher recruitment rating is not a guaranteed win. No creature edges or abilities were changed. A further 240 Expert tides on two fresh seeds completed as a policy smoke check, not a precise estimate. Earlier prototype samples are excluded from this final table.

Generation tests exercise 600 region/style/seed combinations, all regional creatures' observed eligibility, unique IDs, duplicate avoidance, style bias, budget spread, elite rating, tiny pools, roster filtering, legacy generation, save/reload, optional routes, and reward settlement. Browser smoke testing uses an isolated seed: elite preview, entry, visible battle title, a player placement, rival response, and saved-battle resume. The final UI check confirmed that rival-type names and generator explanations are absent; only the elite distinction and reward remain. This is not a full-Voyage economy test or proof of equal human difficulty. Simulations omit charms and long-run injury/recruitment decisions; repeated seed variants are correlated. Next useful validation is full-Voyage integration with recruiting, injuries, charms, and elite route choices.

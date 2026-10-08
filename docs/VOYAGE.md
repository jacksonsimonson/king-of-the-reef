# Voyage foundation

Voyage is a saved three-region run reached from the main menu. Maps read left to right. Each new voyage receives a random seed; entering the same seed reproduces the same charts and encounter offers. Maps and pixel symbols are drawn directly at native size, with scrolling on narrower desktops.

Noncombat visits use [dedicated encounter screens](ENCOUNTER_SCREENS.md) with original scene art. The chart can be inspected and the visit resumed without spending its action. Shop purchases and pending visits survive reload; unconfirmed card selections do not.

## The three regions

1. **Shoreline:** sunlit sand and shallows on the left, tidepools through the middle, coral reefs on the right.
2. **Open Ocean:** the continental shelf darkens toward a midnight trench. An arctic current and ice floes cross the middle of the chart.
3. **Bermuda Triangle:** wrecks, frequent forked lightning, whirlpools, waterspouts and rogue waves converge on the triangle's heart. The voyage-chart disasters remain scenery; battle terrain has its own explicit rules.

Battlefields use subtle native-size scenery and water/border palettes matching their current region. Board size and core card rules stay consistent; [regional terrain](TERRAIN.md) adds rocks, whirlpools, and two themed positional mechanics per sea.

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
- **Event:** choose a creature rescue or salvage 14 shells for one resolve, with a floor of one resolve. Regional descriptions change with the surroundings. More event variants can be added later.
- **Hydration:** select up to three killed cards to restore, then confirm. Also recover one resolve, capped at three. Healthy schools can still recover resolve without selecting cards.
- **Release:** select and confirm one card to permanently remove, or leave. The school must retain at least five total cards and one healthy creature. Killed cards can also be released.
- **Battle:** draws up to five healthy creatures from the actual school, then refills played slots from the shuffled reserve. Each side still has a five-placement budget; an exhausted smaller school stops earlier. Use Tide Charms before placing your fish. New voyage wins grant 14/16/18 shells by region, ties grant six, and losses cost one resolve. Legacy rewards remain 12/four. A loss alone no longer kills an unrelated reserve creature.
- **Killed cards:** cards removed by Bite or pushed off the board (including Wave) are killed. Actual player casualties are saved at match completion regardless of victory, tie or defeat; AI simulations never cause deaths. Killed cards remain in the school but cannot be drawn until Hydration restores them. Older knocked-out cards migrate to this status.
- **Colossal:** win to advance to the next region and gain 28/32/36 shells by region (25 in older voyages). New voyages restore up to three killed fish and one resolve when entering the next sea. A tie offers a rematch without penalty. A loss costs resolve and requires another attempt. Defeating the third Colossal completes the voyage.
- Zero resolve ends the run. Quick Match is independent of the voyage.

Map progress, school, shells, resolve, seed and pending encounter auto-save in local browser storage. The result is saved when combat ends, before leaving the result screen. Returning to the menu and reopening Voyage resumes it. Stable battle decisions now auto-save the board, both hands and reserves, revealed cards, Shock, casualties, placement counts, random sequence, temporary upgrades, and pending Rally/Revelation choices. Charm spending and its effect save together. Reloading during animation resumes the previous stable decision; optional unconfirmed charm targeting resets without spending. A saved rival turn resumes automatically. Result processing clears the checkpoint before rewards are saved, preventing repeat payouts. Quick Match remains unsaved. Unavailable storage leaves the current session playable and displays a warning. Starting another voyage asks before replacing the saved one.

Starting a Voyage also snapshots the Gallery's enabled Battle Roster. That snapshot controls its starting school, future catches, shop creatures and rival schools through the entire run. Later roster changes affect Quick Match immediately and the next new Voyage, never the active one. Existing owned cards are never removed by roster settings.

The Reef draw-table version is saved with that snapshot. Existing Voyages retain their original creature weights and pending offers when the catalog expands. New Voyages get the advanced Rare batch. If fewer than eight Shoreline species are enabled, the starting school repeats enabled species to reach eight cards, each with a unique identity.

Future region tabs permit inspection without unlocking travel or rewards there. The school inventory, catches and recovery choices show framed cards with directional edge badges at native pixel sizes. Killed cards have dimmed creature art and an explicit status; their edge icons stay readable.

## Validation

`npm test` runs deterministic generation and state-transition checks, including 3,000 maps across the three regions, a statistical check of encounter weights, legal routes, noncrossing paths, all three finales, purchases, hydration, defeat, duplicate reward prevention and save/load. `npm run build` checks TypeScript and production bundling.

# Voyage foundation

Voyage is a saved three-region run reached from the main menu. Maps read left to right. Each new voyage receives a random seed; entering the same seed reproduces the same charts and encounter offers. Maps and pixel symbols are drawn directly at native size, with scrolling on narrower desktops.

## The three regions

1. **Shoreline:** sunlit sand and shallows on the left, tidepools through the middle, coral reefs on the right.
2. **Open Ocean:** the continental shelf darkens toward a midnight trench. An arctic current and ice floes cross the middle of the chart.
3. **Bermuda Triangle:** wrecks, lightning and disturbed currents converge on the triangle's heart.

Each region ends at a **Colossal**, a giant ocean creature ruling that part of the sea. Reef Colossal, Abyssal Colossal and Triangle Colossal are provisional encounter labels. Their species, identities, unique artwork and bespoke rules await the user's designs. For this foundation they use ordinary reef combat with themed, stronger schools.

## Map generation

Every region has a departure, eleven encounter columns and one Colossal (13 columns total). Interior columns have two to four nodes spread over five lanes. Adjacent columns connect through monotone branches and merges. Every node is reachable from departure and can reach the Colossal; paths never cross except where they join a node. Only connected successors may be entered, and a visited space cannot pay out twice.

The following percentages apply to unforced encounter columns:

| Space | Shoreline | Open Ocean | Bermuda Triangle |
| --- | ---: | ---: | ---: |
| Battle | 38% | 43% | 45% |
| Fishing | 25% | 20% | 15% |
| Shop | 10% | 10% | 8% |
| Unknown event | 17% | 17% | 24% |
| Hydration | 10% | 10% | 8% |

Guaranteed columns override those weights: first encounter is Fishing, second is Battle, sixth is Shop, eleventh is Hydration, and twelfth is the Colossal. Consequently every route includes an early recruit opportunity, combat, a merchant and recovery before the region finale. Other columns may independently repeat a type. These are initial tuning values, not final balance.

## Encounters and persistent school

- Begin with eight healthy shoreline creatures, 18 shells and three resolve.
- **Fishing:** choose one of three seeded regional catches. This is an immediate catch-selection foundation; the planned timing minigame is not implemented yet.
- **Shop:** recruit one regional creature for 18 shells, or leave. A purchase is applied once.
- **Event:** choose a creature rescue or salvage 14 shells for one resolve, with a floor of one resolve. Regional descriptions change with the surroundings. More event variants can be added later.
- **Hydration:** restore every knocked-out creature and recover one resolve, capped at three.
- **Battle:** uses the actual run school, draws five healthy creatures, and keeps the existing ten-placement combat. A win grants 12 shells, a tie grants four, and a loss costs one resolve and knocks out one reserve creature when more than five are healthy. This keeps five playable cards available.
- **Colossal:** win to advance to the next region and gain 25 shells. A tie offers a rematch without penalty. A loss costs resolve and requires another attempt. Defeating the third Colossal completes the voyage.
- Zero resolve ends the run. Quick Match is independent of the voyage.

Map progress, school, shells, resolve, seed and pending encounter auto-save in local browser storage. The result is saved when combat ends, before leaving the result screen. Returning to the menu and reopening Voyage resumes it. Reloading an unfinished battle restarts that encounter with the same seeded hand; individual board turns are not yet saved. Unavailable storage leaves the current session playable and displays a warning. Starting another voyage asks before replacing the saved one.

Future region tabs permit inspection without unlocking travel or rewards there. The school inventory shows ready and recovering creatures.

## Validation

`npm test` runs deterministic generation and state-transition checks, including 3,000 maps across the three regions, a statistical check of encounter weights, legal routes, noncrossing paths, all three finales, purchases, hydration, defeat, duplicate reward prevention and save/load. `npm run build` checks TypeScript and production bundling.

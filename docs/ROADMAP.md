# Roadmap

The roadmap contains accepted work. Speculative ideas remain in [IDEA_BACKLOG.md](IDEA_BACKLOG.md).

## Completed

- Create the first browser combat prototype
- Implement a 4×4 grid
- Add directional pushing
- Add objective spaces and scoring
- Add a basic computer opponent
- Preserve the first prototype in Git history

## Current foundation

- Document the game vision
- Establish TypeScript, Vite, and Phaser
- Replace the first prototype with the scalable playable build
- Add automated GitHub Pages deployment

## Battle prototype v2

- Expand the board to 5×5
- Add three reef objectives
- Prevent direct placement on reefs
- Add legal-move previews
- Establish a ten-placement match-ending rule with five-card round hands
- Show player and rival decks, hidden rival cards, and reserved powerup slots
- Use a desktop-first full-viewport battle layout with side-based hands and decks
- Support card dragging with translucent legal-placement previews
- Improve computer move selection
- Add readable movement and push feedback

## Fish identity

- Create the first structured fish-card data model
- Define a small starter set of fish
- Add side-specific Standard, Double, Shield, Bite, Swap, Hook, and Wave effects
- Add a creation-order card gallery with eight entries per desktop row
- Test weight or resistance
- Add concise species abilities
- Add temporary pixel-art card assets

## First roguelike loop

- Create a branching map
- Progress through Shoreline, Open Ocean, and Bermuda Triangle regions
- Add battle, fishing, shop, event, hydration, and Colossal spaces
- Track a school across encounters
- Add knockout and hydration recovery
- Add a basic run win/loss flow

The first playable version of the above loop is implemented in Voyage; see [generation rules and current encounter scope](VOYAGE.md). Fishing gameplay, casualty rules, regional events, and stable combat saves are implemented. Bespoke Colossal work is deferred until last.

## Fishing prototype

- Implement mouse press-and-hold control
- Add a moving capture window
- Connect performance to catch success
- Award fish cards through catches

## Next design work

- Use [Creature Balancing Guidelines](CREATURE_BALANCE.md), now part of the game design, to inventory tactical roles, redundant upgrades, and missing ordinary counters.
- Initial [167-creature inventory and ten-creature pilot](BALANCE_PILOT.md) complete, including three simulation-only proposals. The [first role-specific content batch](BALANCE_BATCH_1.md) follows with two changes and a preserved Eel gimmick. The [896-match mixed-school study](MIXED_SCHOOL_STUDY.md) is complete. The [fresh-seed charm follow-up](BALANCE_BATCH_2.md) adopts the Angler/Buoy reductions. The optional [two-tide Quick Match prototype](TWO_TIDE_PROTOTYPE.md) is implemented. Voyage now uses the same 4/5/6 progression with resumable tides and one settlement. Next: human pacing/adaptation checks; no catalog-wide reshuffle yet.
- Establish the remaining intended main systems and ordinary roster before bespoke Colossals. Colossals are last.

## Later development

Implemented: twelve regional event presentations across rescue, salvage, recovery, and trading choices; an optional eight-page How to Play menu; keyboard/text battle and gallery controls. Further accessibility testing with assistive technologies remains useful.

Implemented: three regional rival difficulty levels, 5×5/6×6/7×7 boards with five/six/seven plays per side, sparse seeded terrain, and a Quick Match setup popup with independent choices. Rival strength still needs human playtesting; Expert uses bounded public-information counterplay forecasts.

Implemented: stable battle checkpoints (including charms and pending choices), confirmed shop charm replacement, and a versioned longer-voyage balance pass. New regions have 18 stops, regular recovery, two guaranteed shops, affordable consumables and scaled rewards. Automated route scenarios cover pacing; extended human combat/balance playtesting remains ongoing.

- Multiple aquatic regions
- Environmental board tiles and currents
- Expanded events and shops
- Colossal-specific rules — deferred until last
- Collection journal
- Accessibility and input options
- Sound and music: implemented three original regional map loops, an escalating battle arrangement per area, combat/encounter cues, and saved audio controls. Next: listening feedback and mix refinement.
- Save data and broader balancing

# Idea Backlog

This file captures possibilities without promising that they will be implemented.

## Status labels

- **Inbox:** Recorded but not evaluated
- **Exploring:** Worth discussing or prototyping
- **Planned:** Approved and moved to the roadmap
- **On hold:** Potentially useful later
- **Rejected:** Intentionally excluded, with the reason preserved
- **Implemented:** Present in the game

## Combat ideas

### Full-card ability candidates

**Status:** Implemented (twenty battle abilities). [Twenty creature-led finalists from forty concepts](CARD_ABILITY_IDEAS.md) now cover battle only: movement, defense, growth, attack control, scoring, information, hand management, adaptation, support, zones and sequencing. All twenty finalists now have runtime rules and focused tests. [Concrete host assignments and proposed edge tradeoffs](ABILITY_ASSIGNMENTS.md) now cover all twenty; see [implementation and comparative evidence](BATTLE_ABILITY_IMPLEMENTATION.md). The document records the twenty cuts and why they were rejected or deferred.

### Weight classes

**Status:** Exploring

Tiny, medium, and heavy fish could require different amounts of force to push.

### Currents

**Status:** Exploring

Board currents could move fish, modify pushes, or change direction as the tide advances.

### Environmental tiles

**Status:** Inbox

Possible tiles include kelp, rocks, deep water, whirlpools, thermal vents, and polluted water.

### Schooling

**Status:** Inbox

Related or adjacent fish could gain positional benefits.

### Predators

**Status:** Inbox

Predatory fish could threaten smaller fish through a mechanic distinct from ordinary pushing.

### Stranding

**Status:** Exploring

Fish pushed off the board could become stranded or knocked out until they are hydrated.

### Tide timer

**Status:** Exploring

Matches could end after a fixed number of rounds, with the tide providing the thematic clock.

## Fish ideas

### Electric eel

**Status:** Inbox

Could disable a direction marker or transmit an effect through adjacent fish.

### Pufferfish

**Status:** Inbox

Could temporarily increase its weight or resistance after being threatened.

### Remora

**Status:** Inbox

Could attach to a larger fish or move with it.

### Flying fish

**Status:** Inbox

Could cross a blocked space or avoid one positional restriction.

### Anglerfish

**Status:** Inbox

Could manipulate targeting, visibility, or enemy placement.

## Map and event ideas

- Rare fishing holes
- Storm events
- Polluted zones
- Traveling merchants
- Fish rescue events
- Equipment upgrades
- Risky deep-sea routes
- Optional elite battles
- Region-specific hydration spaces
- Events that trade one fish for another

## Progression ideas

### Colossal decks and creature rewards

**Status:** Implemented initial themed encounters and companion choices; new exclusive species remain Exploring.

Reefback King carries a reef, Midnight Marauder is an abyssal whale, and The Sunken Eye is the abandoned ARGUS observatory with a laser. New voyages use themed weighted schools, signature encounter powers and original pixel-grid encounter illustrations. Shoreline/Open Ocean wins offer two special copies of existing creatures (choose one or pass), trading an edge for an innate full-card ability. The final boss ends the voyage without an unusable recruit reward. See [decisions and validation](DECISIONS.md#2026-11-16--three-themed-colossals). Exclusive juvenile species, mechanical minions and more elaborate boss animation remain possible follow-ups, not implemented catalog entries or permanent unlocks.

### Other progression possibilities

- Fish collection journal
- Alternate anglers
- Starting-school choices — shelved after PR #42 at the owner’s request; preserve definitions and existing saved schools for later reconsideration
- Difficulty modifiers
- Regional species pools
- Cosmetic aquarium
- Daily seeded runs

## Modes and distant possibilities

- Local pass-and-play
- Online asynchronous matches
- Draft mode
- Puzzle challenges
- Community-created board layouts

These modes are intentionally outside the initial scope.

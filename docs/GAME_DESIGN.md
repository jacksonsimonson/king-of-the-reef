# Game Design

This document records the current intended design. Unapproved possibilities belong in [IDEA_BACKLOG.md](IDEA_BACKLOG.md).

## High concept

King of the Reef is a browser-based tactical card roguelike in which fish compete for control of reefs. The player catches fish, builds a school, travels through a branching aquatic map, and survives a sequence of increasingly difficult encounters.

## Design pillars

1. **Position creates power.** Battles are won primarily through spatial control rather than conventional health reduction.
2. **Every fish has an ecological identity.** Species, size, habitat, and behavior should inform mechanics.
3. **Runs create stories.** Fishing results, map choices, losses, recoveries, shops, and events should create different tactical narratives.
4. **Simple rules support deep interactions.** New systems should enrich the board rather than obscure its readable foundation.

## Core run loop

1. Choose a route through a branching map.
2. Enter a fishing, battle, shop, event, hydration, or other location.
3. Catch fish and improve the school.
4. Win positional battles to continue.
5. Recover or replace knocked-out fish.
6. Defeat a regional boss and progress to a new environment.

## Battle foundation

### Planned format

- Board: 5×5
- Objectives: three reef spaces
- Players: player versus computer opponent
- Primary action: play one fish card
- Primary interaction: directional pushing
- Initial victory concept: control at least two reefs when the match ends
- Reef rule: fish should reach reefs through movement rather than being placed directly on them

### Directional pushing

Fish cards exert force in marked directions. A newly placed fish may push an adjacent fish when its directional pattern and the destination permit the move. Opposing direction markers can resist a push.

The exact rules for chain pushes, stronger resistance, edge removal, and simultaneous interactions remain to be tested.

### Match pacing

A 5×5 board creates space for maneuvering, specialized fish, and environmental effects. A turn or round limit will likely be required to keep matches decisive.

## Fish cards

Every fish should have:

- Species
- Directional pattern
- Rarity or acquisition difficulty
- Clear visual identity
- A concise tactical purpose

Potential later attributes include weight, habitat, movement style, schooling behavior, and a species ability. These are not all confirmed for the first ruleset.

## Fishing

Fishing is the main method of obtaining cards. The intended minigame is inspired by timing-and-control fishing systems: the player presses and holds the mouse button to keep an indicator inside a moving target window.

Fish species, rarity, location, equipment, and run progression may affect the challenge and possible catches.

## Map

The run uses a branching route map inspired by roguelike deck-building games.

Confirmed location concepts:

- Battle
- Fishing
- Shop
- Random event
- Hydration
- Boss

A hydration space restores a knocked-out fish card to the usable school.

## Knockouts and recovery

Fish can become unavailable during a run. Hydration spaces provide the thematic recovery mechanism. The exact causes, duration, and cost of knockouts remain open design questions.

## Progression

Run-based progression should emphasize discovering fish and building combinations. Long-term progression may include a collection journal and unlocks, but permanent power growth has not been decided.

## Art direction

- Simple, readable pixel art
- Deep ocean-blue backgrounds
- Lighter aquatic green for cards, board structure, and readable highlights
- Shiny pink pearls for major objectives and special rewards
- Strong card silhouettes
- Aquatic environments differentiated through color, vegetation, hazards, and fish populations

## Current prototype

The current playable prototype uses the planned 5×5 board and three reefs. It validates card selection, directional pushes, resistance, objective control, a basic opponent, match scoring, and rematches. Its fish set and rules remain intentionally small while the battle system is tested.

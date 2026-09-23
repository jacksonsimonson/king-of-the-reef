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
6. Defeat a regional Colossal and progress to a new environment.

## Battle foundation

### Planned format

- Board: 5×5
- Objectives: three reef spaces
- Players: player versus computer opponent
- Primary action: play one fish card
- Primary interaction: directional pushing
- Round hand: five random healthy fish drawn from each side's current school
- Match end: after both players place every card in their round hand
- Victory: control more reefs than the rival when the match ends
- Reef rule: fish should reach reefs through movement rather than being placed directly on them

### Directional pushing

Fish cards exert force in marked directions. A newly placed fish may push an adjacent fish when its directional pattern and the destination permit the move. Opposing direction markers can resist a push.

The prototype now supports Standard, Double, Shield, Bigger Fish, Swap, Hook, and Wave as side-specific edge effects. Their current resolution rules are defined in [EDGE_EFFECTS.md](EDGE_EFFECTS.md). Chain pushes and simultaneous interactions remain to be tested.

### Match pacing

A 5×5 board creates space for maneuvering, specialized fish, and environmental effects. Each side draws five healthy fish per encounter, creating ten placements before reef control is scored. The undealt school remains visible as a deck so later powerups can shuffle or reveal cards.

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

Runs progress through three aquatic regions: the Shoreline, the Open Ocean, and the Bermuda Triangle. Early cards come from recognizable shoreline, tidepool, and reef life; later regions can introduce more specialized and unusual creatures.

Confirmed location concepts:

- Battle
- Fishing
- Shop
- Random event
- Hydration
- Colossal (regional boss)

A hydration space restores a knocked-out fish card to the usable school.

The playable [Voyage foundation](VOYAGE.md) now generates all three regions from a seed with weighted encounter types, guaranteed route milestones, persistent schools, and encounter rewards. Colossals are giant ocean creatures that rule parts of the sea; their identities and special mechanics will be designed separately.

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
- Natural, species-appropriate animal colors separated from player/rival UI colors
- Aquatic environments differentiated through color, vegetation, hazards, and fish populations

## Interface direction

- Desktop is the current interface target; mobile adaptation comes after the battle layout is established.
- Game screens should occupy nearly the full browser viewport.
- The game canvas is never fractionally resized. Canvas pixels, text, and UI geometry render 1:1; creature sprites use whole-number scales only.
- Battle information surrounds a centered board: the player school is on the left and the rival school is on the right.
- Five-card hands use a centered three-over-two arrangement. Dragging a card shows the card in motion and previews a translucent board-scale copy over legal placement spaces.

## Current prototype

The current playable prototype uses the planned 5×5 board and three reefs. It validates card selection, seven side-specific edge effects, resistance, objective control, a basic opponent, match scoring, and rematches. The pool includes simple directional shoreline creatures plus Swordfish, Barracuda, Hypno Squid, Lure, and Ocean Sunfish as the first special-effect cards. These creatures use the approved 64×64 sprite standard. Player creatures face right and rival creatures face left.

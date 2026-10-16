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

### Current format

- Board: Shoreline 5×5, Open Ocean 6×6, Bermuda 7×7
- Objectives: three reef spaces
- Players: player versus computer opponent
- Primary action: play one fish card
- Primary interaction: directional pushing
- Round hand: five random healthy fish drawn from each side's current school
- Replacement draws: refill a played slot with the next card in the shuffled reserve; leave its silhouette if the reserve is empty
- Match end: five/six/seven placements per side by region, or earlier exhaustion; refills do not increase that budget
- Victory: control more reefs than the rival when the match ends
- Reef rule: ordinary fish reach reefs through movement; Reefborn allows direct placement on an empty reef

### Directional pushing

Fish cards exert force in marked directions. A newly placed fish may push an adjacent fish when its directional pattern and the destination permit the move. Opposing direction markers can resist a push.

Current edges include Standard, Double, Shield, Bite, Swap, Hook, Wave, Shock, Spines, Ram, Follow Current, Bounce, and Dive. Their ordered resolution rules are defined in [EDGE_EFFECTS.md](EDGE_EFFECTS.md). Double changes penetration, not movement distance.

### Match pacing

Regional boards grow from 5×5 to 6×6 and 7×7, with five/six/seven placements per side respectively. Hands start with up to five healthy fish. Played slots draw the next reserve card immediately, for both sides. A smaller school can exhaust its cards earlier; the other side finishes its remaining placements. Quick Match can select size, placement budget, region, and rival difficulty independently. Unplayed cards are not killed when the battle ends. A full board also ends the match safely.

Powerups are now **Tide Charms**: consumable items used on the player's turn before placing a fish. Using a charm does not spend the fish placement; multiple charms may be used if their targets are valid. Shop stock, prices and available charms are described in [SHOPS.md](SHOPS.md).

The Gallery includes a separate **Battle Roster** tab. Cards are divided into The Shoreline, Open Ocean, and Bermuda Triangle. Within each environment, related creatures remain next to one another in a consistent order: conventional fish, sharks and rays, reptiles and mammals, cephalopods, crustaceans, mollusks, echinoderms, jellies and anemones, corals and sponges, then curios. These types affect organization only and do not add visible subsections. Each fish can be enabled or disabled once per shared browser profile. Changes affect both Quick Match decks immediately. A Voyage snapshots the enabled roster when the run begins, so changes never rewrite an active or saved run; they apply when the next Voyage starts. Older saves retain the original complete roster. The UI keeps at least five fish available for battle and at least three distinct catches in each region.

Reef now contains eight advanced Rare creatures, with the original Rare and Moray draw weights preserved. Coral Grouper introduces **Rally**: after pushing an enemy, inspect the next reserve card and keep it or send it to the bottom before the replacement draw. Its whole-card ability background uses flags; Revelation uses eyes. Full card definitions, balance roles and acquisition weights are in [REEF_CARDS.md](REEF_CARDS.md).

## Fish cards

Every fish should have:

- Species
- Directional pattern
- Rarity or acquisition difficulty
- Clear visual identity
- A concise tactical purpose

Potential later attributes include weight, habitat, movement style, schooling behavior, and a species ability. These are not all confirmed for the first ruleset.

## Creature balance and assignment policy

The [Creature Balancing Guidelines](CREATURE_BALANCE.md) are the detailed balance chapter of this design document. Use them for future edge/ability reshuffles, new creature assignments, and acquisition rebalancing. They cover every current edge and full-card ability, a comparison suite, review signals, and a reusable creature worksheet.

Give each creature a primary role, a useful baseline without rare support, and a meaningful weakness. Compare access, disruption, staying power, coverage, independence, and future value separately. Equal edge counts do not imply equal power; rarity and later-region availability do not excuse universal upgrades. Evaluate effect order, friendly movement, final-turn access, terrain, charm combinations, and persistent casualties.

Existing regional edge-count budgets describe prior assignments; this framework governs future balance reviews. Its ratings and numerical investigation targets are provisional, not measured balance results. The first [role inventory and small comparison pilot](BALANCE_PILOT.md) are complete as provisional analysis. Use relative, revisable mechanic weights; require a clear primary role; and allow friendly harm when it creates a real positional tradeoff. Introduce unfamiliar mechanics progressively by region while keeping early tools useful. The first [tested role-focused batch](BALANCE_BATCH_1.md) gives Sea Urchin an underside push and simplifies Phantom Shark; Electric Eel retains its intentional full-Shock gimmick. Every assignment must also fit the creature. Existing voyages retain their original layouts. The [mixed-school match study](MIXED_SCHOOL_STUDY.md) records full-match evidence, acting-order concerns, and initial proposals for Void Angler and Buoy Jelly. The [fresh-seed charm follow-up](BALANCE_BATCH_2.md) adopts those two changes, preserves earlier voyage layouts, and recommends a separate two-tide prototype to address turn-order advantage.

Bespoke Colossal design is deferred until last, after the other intended main systems and ordinary creature roster are established.

## Fishing

Fishing is the main method of obtaining cards. The implemented minigame uses Left and Right to move a capture zone and keep the fish inside it; see [Fishing](FISHING.md).

Fish species, rarity, location, equipment, and run progression may affect the challenge and possible catches.

## Map

The run uses a branching route map inspired by roguelike deck-building games.

Runs progress through three aquatic regions: the Shoreline, the Open Ocean, and the Bermuda Triangle. Early cards come from recognizable shoreline, tidepool, and reef life; later regions can introduce more specialized and unusual creatures.

The regional role review now covers all 167 catalog entries: [77 Shoreline](SHORELINE_BALANCE.md), [47 Open Ocean](OPEN_OCEAN_BALANCE.md), and [43 Bermuda](BERMUDA_BALANCE.md). Each creature has an authored thematic job, ordinary use and limitation in the journal and [role inventory](ROSTER_ROLE_INVENTORY.md). Bermuda keeps deliberate spatial gimmicks while reducing unrelated edge combinations. These are tested design decisions with relative, revisable weights, not a claim of perfect equal power. New voyages use balance version 6; existing voyages preserve prior rules.

Confirmed location concepts:

- Battle
- Fishing
- Shop
- Random event
- Hydration
- Release
- Colossal (regional boss)

A Hydration space lets the player select up to three killed cards to restore. A rare Release space permanently removes one selected card to thin the school.

The playable [Voyage foundation](VOYAGE.md) now generates all three regions from a seed with weighted encounter types, guaranteed route milestones, persistent schools, and encounter rewards. Colossals are giant ocean creatures that rule parts of the sea; their identities and special mechanics will be designed separately.

The [Open Ocean roster](OPEN_OCEAN_CARDS.md) contains 44 supplied entries including Sea Mine, plus the original Swordfish, Barracuda and Ocean Sunfish, across the Continental Shelf, Polar Current and Midnight Trench. The [complete regional balance pass](OPEN_OCEAN_BALANCE.md) reviews all 47 with authored thematic roles, ordinary uses, limitations and tested keep/change decisions. Arctic Cod remains excluded. New voyages use the revised layouts; existing voyages retain their saved balance version.

## Knockouts and recovery

Fish killed by an edge ability or pushed off the playable board become unavailable during a run. Their status persists when the match ends. Hydration restores up to three selected cards; losses alone no longer kill reserve creatures.

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
- Menus and controls use the original Reef Pixel typeface and reusable stepped frames drawn on an integer grid. HTML controls retain their semantics while presenting as game-native pixel UI.
- Shoreline, Open Ocean, and Bermuda screens recolor the same pixel frame system to match their environments.

## Current prototype

The current playable build includes three regional board sizes, rival difficulty levels, terrain, Tide Charms, persistent voyages, and a growing creature roster. Future assignments follow the balance chapter above. Creature sprites use the approved 64×64 standard; player creatures face right and rival creatures face left.

The optional [two-tide Quick Match prototype](TWO_TIDE_PROTOTYPE.md) uses two rounds of 4/5/6 plays per side in Shoreline/Ocean/Bermuda, refreshed resources, swapped starters and combined reef scores. New Voyage battles use the same regional two-tide format, with one combined result, deferred injuries and charm consumption, and checkpoints in either tide or the intermission. Existing single-tide checkpoints finish unchanged; Quick Match still offers Classic.

The [full Voyage combat/economy study](FULL_VOYAGE_BALANCE.md) follows carried schools through real battles and settlement. Its 192-run comparison does not justify resource buffs; boss-repeat and player-policy limitations remain explicit. Post-match summaries expose tide scores, casualties, charm consumption and actual rewards for follow-up playtests.

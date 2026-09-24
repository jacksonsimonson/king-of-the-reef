# Reef Card Pool — First Expansion

22 cards in the Shoreline/Reef pool: all 15 nonempty combinations of basic arrows plus seven special cards. This wave adds 13 creatures to the existing 14, for 27 gallery entries across all regions. Further additions can build on this feature branch.

## Basic Arrows

| Card | Directions | Rarity |
| --- | --- | --- |
| Minnow | Up | Common |
| Anchovy | Right | Common |
| Sardine | Down | Common |
| Goby | Left | Common |
| Tidepool Blenny | Up, Right | Common |
| Garden Eel | Up, Down | Common |
| Hermit Crab | Up, Left | Common |
| Shore Shrimp | Right, Down | Common |
| Sea Star | Left, Right | Common |
| Flounder | Down, Left | Common |
| Lionfish | Up, Right, Down | Uncommon |
| Crab | Up, Left, Right | Uncommon |
| Mantis Shrimp | Up, Down, Left | Uncommon |
| Octopus | Left, Down, Right | Uncommon |
| Pufferfish | All Four | Rare |

## Special Cards

| Card | Edges | Rarity |
| --- | --- | --- |
| Boxfish | Shield All Four | Uncommon |
| Needlefish | Double Right | Uncommon |
| Seahorse | Hook Up, Down | Uncommon |
| Electric Eel | Shock All Four | Rare |
| Sea Urchin | Spines All Four | Rare |
| Invisible Ink Squid | Standard Up, Shield Down; Revelation | Rare |
| Moray Eel | Bite Right | Extremely Rare |

Shock lasts for the entire battle, as confirmed during implementation. Shock and Spines offer no passive defense. Moray Eel has one offensive edge and no extra protection. Detailed interactions are in [Edge Effects](EDGE_EFFECTS.md). Wave remains a push effect; it kills only by pushing beyond the board.

## Revelation

On play, choose one unplayed, unrevealed opposing hand card. That slot shows its card front for the remainder of the battle, until played. Playing the Squid pauses turn progression until the player selects a valid target. If there are none, play proceeds normally. A rival Squid selects an eligible player slot and marks it Revealed. Revelation triggers on placement even if the Squid is removed by its own edge resolution.

Revelation uses a dark indigo background with muted closed-eye motifs and one open eye. This pattern belongs to the ability rather than the species, appears behind the creature, and is shared across school, recruitment, gallery and battle cards. It uses a fixed 64px pattern at 1x on board and 2x in hand. Whole-card abilities remain separate from edges; Shock only disables edges.

## Catches And Rival Pools

| Draw Group | Weight |
| --- | --- |
| One/two Standard arrows | 55% |
| Three Standard arrows | 15% |
| Boxfish, Needlefish, Seahorse | 22% |
| Pufferfish, Electric Eel, Sea Urchin, Invisible Ink Squid | 7% |
| Moray Eel | 1% |

A draw picks a group by weight, then a remaining member uniformly. Fishing and shop offers contain three unique cards: already offered cards are excluded, and exhausted groups drop out. The percentages are initial draw weights, not exact probabilities of seeing a card in a complete three-card offer. Offers remain seeded and stable on reload. Shoreline rivals use the same weights; the existing Reef Colossal's guaranteed Octopus cards remain.

Map-space percentages, the eight-card starting school, five-card battle hands, and later-region pools are unchanged. Quick Match can draw any implemented creature.

## Artwork And Validation

New art was generated individually with the built-in imagegen tool. Prompts and originals are in [source references](../art/source-references/reef-expansion-prompts.md). The existing cluster-collapse pipeline produces transparent 64x64 PNGs in public/assets/fish; per-species white-eye corrections are recorded in scripts/prepare_generated_sprite.py. Run scripts/inspect-reef-art.py with Pillow to validate dimensions, binary alpha, palette limits and white eye counts, and produce a native/2x review sheet.

Combat tests cover Shock persistence and simulation isolation, Shield protection, Spines timing and exclusions, Wave movement, Bite destinations and reveal eligibility. Rarity tests sample 50,000 seeded draws. Browser checks exercise dragging, faded placement preview, reveal choice and turn lock, crossed-out edges, shared DOM backgrounds, and 1:1 canvas scaling.

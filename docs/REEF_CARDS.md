# Reef Card Pool

Current gameplay assignments supersede the historical notes below: see [Reef Edge Roster](REEF_EDGE_ROSTER.md). All 46 former art previews are now playable, bringing the Reef pool to 76 unique edge layouts.

30 cards in the Shoreline/Reef pool: all 15 nonempty combinations of basic arrows, seven original specials, and eight advanced rares. There are 35 gallery entries across all regions. Existing creatures retain their edges and rarity.

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

## Advanced Rare Batch

Every card below is Rare. They share a separate 8% group; with the full roster enabled, each has a 1% initial-draw probability. They use existing edge mechanics; Rally is the only new whole-card ability.

| Card | Edges / Ability | Fishing Pattern | Distinct Role |
| --- | --- | --- | --- |
| Parrotfish | Double Up; Shield Down | Gradual Mover | Vertical Double; Needlefish keeps Double Right. |
| Pistol Shrimp | Shock Right; Standard Down | Darter | Directional Shock with a push; Electric Eel retains four-sided Shock. |
| Frogfish | Hook Left; Standard Right | Lurker | Horizontal Hook hybrid; Seahorse retains two Hooks and Moray keeps Bite. |
| Stonefish | Spines Left/Right; Shield Down | Lurker | Hybrid defense; Urchin retains full Spines coverage and Boxfish full Shields. |
| Titan Triggerfish | Double Left; Standard Up; Shield Right | Runner | Leftward force, exposed underside, no extra Double direction. |
| Crown-of-Thorns Starfish | Spines Left/Right; Standard Up | Lurker | Trades Urchin's vertical retaliation for one active push. |
| Decorator Crab | Hook Up; Shields Left/Right | Lurker | One pull with flank defense; less Hook coverage than Seahorse. |
| Coral Grouper | Standard Up/Right/Down; Rally | Darter | Lionfish's arrow layout plus conditional deck control, at Rare acquisition and shop price. |

No new Bite, Swap or Wave cards enter the Reef in this batch. Current special cards do not require buffs to accommodate these combinations. The rare Grouper is intentionally a more expensive upgrade to an Uncommon arrow layout; it does not replace a current Rare role.

## Rally

On Coral Grouper's placement, a successful Standard or Double push of an enemy triggers Rally once, even if multiple enemies move. Off-board pushes count. Friendly moves, blocked destinations, defended targets and absent targets do not count. If Spines kills the Grouper after its successful push, Rally still resolves as a whole-card ability. Shock does not directly disable Rally, but a shocked Grouper cannot push to trigger it.

After all edges resolve and **before** drawing the replacement, reveal the top card of your reserve. Choose **Keep & Draw** to draw it, or **Send To Bottom** to move it to the bottom and draw the new top card. The choice does not add a fish play or an extra draw. An empty reserve skips Rally; a one-card reserve draws that card whichever choice is made. The turn and Tide Charms stay locked until the choice resolves. Rivals resolve their own choice automatically using only the revealed top card.

Rally cards have repeating muted gold and teal **flags** behind the creature. The same native 64px pattern renders at 1x on the board and 2x in hands, gallery, schools and recruitment. Eye highlights remain pure white and unobscured. Revelation retains its separate eye pattern.

## Revelation

On play, choose one unplayed, unrevealed opposing hand card. That slot shows its card front for the remainder of the battle, until played. Playing the Squid pauses turn progression until the player selects a valid target. If there are none, play proceeds normally. A rival Squid selects an eligible player slot and marks it Revealed. Revelation triggers on placement even if the Squid is removed by its own edge resolution.

Revelation uses a dark indigo background with muted closed-eye motifs and one open eye. This pattern belongs to the ability rather than the species, appears behind the creature, and is shared across school, recruitment, gallery and battle cards. It uses a fixed 64px pattern at 1x on board and 2x in hand. Whole-card abilities remain separate from edges; Shock only disables edges.

## Catches And Rival Pools

| Draw Group | Weight |
| --- | --- |
| One/two Standard arrows | 47% |
| Three Standard arrows | 15% |
| Boxfish, Needlefish, Seahorse | 22% |
| Pufferfish, Electric Eel, Sea Urchin, Invisible Ink Squid | 7% |
| Moray Eel | 1% |
| Eight Advanced Rares | 8% |

A draw picks a group by weight, then a remaining member uniformly. Fishing offers contain three unique cards; shops draw their creature choices from that same regional selector and mix them with Tide Charms. Already offered or disabled cards are excluded, and exhausted groups drop out. The percentages are initial draw weights with the full roster enabled, not exact probabilities of seeing a card in a complete offer. The original four Rare cards retain 1.75% each on an initial draw, and Moray retains 1%.

Offers remain seeded and stable on reload. Each Voyage stores its roster and Reef draw-table version. Voyages started before this batch retain the original 55% Common table and original creatures, including unchanged pending shop/fishing offers. New Voyages use the table above. Newly added creatures default to enabled in the Gallery without re-enabling old creatures the user disabled. Shoreline rivals use the saved roster and table; Colossal guaranteed cards also respect disabled choices.

Map-space percentages, the eight-card starting school, five-card battle hands, and later-region pools are unchanged. Quick Match can draw any implemented creature.

## Artwork And Validation

New art was generated individually with the built-in imagegen tool. Original expansion prompts are in [source references](../art/source-references/reef-expansion-prompts.md); this batch's prompts and source images are in [Advanced Reef](../art/source-references/advanced-reef/PROMPTS.md). The existing cluster-collapse pipeline produces transparent 64x64 PNGs in public/assets/fish; per-species white-eye corrections are recorded in scripts/prepare_generated_sprite.py. Run scripts/inspect-reef-art.py with Pillow to validate dimensions, binary alpha, palette limits and white eye counts at both sizes, and produce a native/2x review sheet.

Combat tests cover Shock persistence and simulation isolation, Shield protection, Spines timing and exclusions, Wave movement, Bite destinations and reveal eligibility. Rarity tests sample 50,000 seeded draws. Browser checks exercise dragging, faded placement preview, reveal choice and turn lock, crossed-out edges, shared DOM backgrounds, and 1:1 canvas scaling.

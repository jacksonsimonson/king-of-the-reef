# Battle terrain

Quick matches and voyage battles now have two rocks, a linked pair of whirlpools, and regional terrain. Shoreline has kelp plus four directional channels; the other regions have two regional tiles. Each region has a fixed layout; rematches retain it. Terrain never covers a scoring reef. Quick matches use the Shoreline layout.

- **Rocks** reject placement and block movement, pushes, hook paths, and wave rays. A blocked push leaves its target in place. Dive cannot land on or pass through rock.
- **Whirlpools A/B** resolve a directly played card's edges at the entrance, then move it to the other pool if it survived and is still on the entrance. Exit occupancy is checked after combat: an occupied exit prevents travel. A card that moved away through its own edges does not teleport. Travel happens once, never repeats edges, and never activates on forced movement. The placement ghost shows where the edges start resolving.
- Both sides use identical terrain rules, including the rival's move evaluation. Ordinary water and reef scoring retain their existing rules.

Use rocks to anchor a defensive position; attack from a whirlpool entrance, then escape to its exit. Occupying one exit closes that route to the opponent.

| Region | Terrain | Rule and tactical purpose |
| --- | --- | --- |
| Shoreline | Kelp | Occupants resist forced pushes, hooks, and swaps. Anchor a threat; shock and predation still work. Cards may move themselves out by dive/bounce/follow-current. |
| Shoreline | Tide channel | Up, right, down, and left arrows carry a directly played card one tile in that direction before edges fire. An occupied, rock, trench, or out-of-board destination leaves it in place. All four variants appear in Shoreline, pointing toward scoring reefs. |
| Open Ocean | Trench | No direct placement. Cards moved into it die immediately, including your own diving cards. Threaten interior kills instead of only board-edge kills. |
| Open Ocean | Thermal vent | Direct play erupts, pushing all orthogonal neighbors one tile outward before card edges fire. Ignores defensive edges, affects both owners, and stops at occupied cells/rocks/kelp. Out-of-board moves kill; enemy displacement can trigger Rally, but terrain itself does not trigger Spines. Positioned to carry a neighbor onto a reef or eject a rival. |
| Bermuda | Mirror | Direct play reverses every edge for the rest of this battle, including defenses. Reorient directional cards without altering the saved school. |
| Bermuda | Storm | Direct play shocks all orthogonal neighbors of either owner before edges fire. Opens defenses but can disable your own reef holders. |

Only direct placement activates channels, vents, mirrors, and storms; forced movement does not chain those effects. Channel travel happens before card edges; whirlpool travel happens afterward and checks the resulting board. Trenches remove cards immediately on arrival, before subsequent edges. The rival evaluates the same resolver as the player, and placement previews show where edges will begin (channel destination or whirlpool entrance) and mirrored edges.

Design bar: terrain and future mechanics should create decisions in ordinary placement and reef control. Avoid effects whose usefulness depends on a rare status or specific card appearing; the vent uses positional eruption rather than niche shock cleansing. Playtesting should assess tradeoffs, not just count mechanic types.

Terrain is derived from the region and adds no save fields. Existing voyages can resume without migration. Layouts are deliberately fixed while these mechanics are playtested.

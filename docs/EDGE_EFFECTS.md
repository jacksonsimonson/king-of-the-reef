# Edge Effects

Card effects live on individual card sides. The side determines which adjacent space, ray, or distant target the effect uses. These are edge effects rather than whole-card abilities.

Every effect uses a compact boxed badge centered on the outer card edge. Standard and Double are directional arrows, so their icons rotate to point outward. Shield, Bite, Swap, Hook, and Wave icons always remain upright. The box provides an opaque backing so creature art and played-card silhouettes cannot reduce visibility.

## Resolution rules

Effects resolve in the order listed on the card after it is placed.

- **Standard:** Pushes an adjacent card one space when its opposing side has no active defending marker. Shock and Spines never defend.
- **Double:** Pushes an adjacent card one space. It ignores Standard, Ram, Bounce, Dive, Shock and Spines; other active opposing markers block it.
- **Shield:** Blocks pushes, pulls, swaps and Shock. Dive passes through it. Never acts offensively.
- **Bigger Fish / Bite:** Removes an adjacent card when a normal push from that side would succeed. The target must be undefended and must have an open push destination or the board edge behind it.
- **Swap:** Exchanges places with an adjacent card when the target has no active defending marker on the opposing side.
- **Hook:** Targets a card exactly two spaces away when the intervening space is empty, then pulls it into that gap. Standard, Ram, Bounce, Dive, Shock and Spines do not defend against Hook; other active opposing markers do.
- **Wave:** Projects along three rays on its side: straight ahead and the two forward diagonals. Every undefended card on those rays is pushed one space farther away. Cards resolve farthest-first; a card pushed beyond the board is removed.
- **Shock:** Disables all edges of an adjacent card for the rest of the battle. Only an active Shield on the facing side blocks it. It affects either owner, does not push, and does not defend. Disabled status follows the card through movement and swaps; removing the Eel does not cure it. Crossed-out edge badges identify disabled cards. Card-wide abilities are unaffected.
- **Spines:** Does not defend or push. After a successful enemy Standard or Double push against this side, kills the attacker. Movement resolves first, including an off-board death of the spined card; the attacker then dies and stops resolving remaining edges. Failed pushes, friendly pushes, Hook, Swap, Wave and Bite do not trigger retaliation. Shock disables Spines.

Pushes and pulls fail when their destination is occupied. Fish may be moved onto reef spaces; direct placement requires Reefborn.

## Open Ocean additions

- **Ram:** Collect the contiguous occupied line next to this edge, stopping at the first empty tile. Resolve one Standard-strength push per target, farthest first. Defended cards stay in place and can block those behind them; undefended cards farther along still resolve. Off-board pushes kill.
- **Follow Current:** Double-strength push, then move into the target's vacated tile if the attacker survives. An off-board push also permits following.
- **Bounce:** Attempt a Standard-strength push, then retreat one tile in the opposite direction, even when the push is blocked or has no target. An occupied or off-board retreat destination prevents movement. Spines retaliation resolves first.
- **Dive:** Requires an adjacent creature of either owner and an empty, on-board tile immediately beyond it. Jump over that creature, ignoring all defenses including Shield and Spines. Neither creature is pushed or damaged.

Ram, Bounce and Dive defend like Standard arrows; Follow Current defends like Double. Double and Hook bypass Standard-strength markers. All four new badges remain upright. Shock disables them normally. Direct enemy Ram, Follow Current and Bounce pushes trigger Spines; Dive never does.

Each edge resolves once from the creature's current location. New Open Ocean cards list their edges in Up, Right, Down, Left order. Movement never restarts already-resolved edges. The complete assignments and rarity budgets are in [Open Ocean Cards](OPEN_OCEAN_CARDS.md).

In Voyage, removal by Bite, Spines or being pushed beyond the board marks that specific card as killed when the match ends. Killed cards cannot be drawn until selected at a Hydration space (up to three per visit). Losing a battle does not kill unrelated cards.

## First cards

| Card | Edge effects |
| --- | --- |
| Swordfish | Double right; Shield left |
| Barracuda | Bite right; Shield up and down |
| Hypno Squid | Swap right; Shield up and down |
| Lure | Hook down |
| Ocean Sunfish | Wave down |

The data model supports mixtures of these effects on the four card sides. The first card-wide ability, Revelation, is documented with the [Reef roster](REEF_CARDS.md).

## Full-card abilities

Eight additional abilities are implemented for future creature assignments. Existing creatures retain their current abilities. Anchor Stone, Reef Beacon and Duelist Pearl can grant the corresponding abilities temporarily; all grants are battle-only and preserve innate abilities.

| Ability | Effect |
| --- | --- |
| Anchor | Prevents forced pushes, hooks and swaps. Own movement and direct-play terrain still work; predation can still kill it. |
| Reefborn | Allows direct placement on an empty scoring reef, subject to terrain. |
| Bulwark | Defends every side against incoming edge effects, even while shocked. Dive, terrain and Piercing bypass it. |
| Piercing | Offensive edges ignore edge defenses and Bulwark. Does not bypass occupied destinations, rocks, kelp or Anchor. |
| Escort | Before edges, add Shields to empty sides of orthogonally adjacent allies for this battle. |
| Ambush | Before edges, shock orthogonally adjacent enemies, ignoring their defenses. |
| Wake | After edges, a surviving fish pushes adjacent enemies outward once, ignoring defenses. Occupancy, rocks, kelp and Anchor still block; off-board and trench movement kill. |
| Sovereign | Scores two points instead of one while on a scoring reef. |

Shock disables edges, not full-card abilities. Placement terrain applies first, followed by Escort/Ambush, the card's ordered edges, and Wake from the survivor's current position. Whirlpool teleportation remains last. These effects do not retrigger when a card is moved. All new abilities have distinct pixel patterns and hover descriptions; assignment is through the typed `ability` field in creature data.

# Edge Effects

Card effects live on individual card sides. The side determines which adjacent space, ray, or distant target the effect uses. These are edge effects rather than whole-card abilities.

Every effect uses a compact boxed badge centered on the outer card edge. Standard and Double are directional arrows, so their icons rotate to point outward. Shield, Bite, Swap, Hook, and Wave icons always remain upright. The box provides an opaque backing so creature art and played-card silhouettes cannot reduce visibility.

## Resolution rules

Effects resolve in the order listed on the card after it is placed.

- **Standard:** Pushes an adjacent card one space when its opposing side has no active defending marker. Shock and Spines never defend.
- **Double:** Pushes an adjacent card one space. It ignores Standard, Shock and Spines; other active opposing markers block it.
- **Shield:** Defends its side against every current effect and never acts offensively.
- **Bigger Fish / Bite:** Removes an adjacent card when a normal push from that side would succeed. The target must be undefended and must have an open push destination or the board edge behind it.
- **Swap:** Exchanges places with an adjacent card when the target has no active defending marker on the opposing side.
- **Hook:** Targets a card exactly two spaces away when the intervening space is empty, then pulls it into that gap. Standard, Shock and Spines do not defend against Hook; other active opposing markers do.
- **Wave:** Projects along three rays on its side: straight ahead and the two forward diagonals. Every undefended card on those rays is pushed one space farther away. Cards resolve farthest-first; a card pushed beyond the board is removed.
- **Shock:** Disables all edges of an adjacent card for the rest of the battle. Only an active Shield on the facing side blocks it. It affects either owner, does not push, and does not defend. Disabled status follows the card through movement and swaps; removing the Eel does not cure it. Crossed-out edge badges identify disabled cards. Card-wide abilities are unaffected.
- **Spines:** Does not defend or push. After a successful enemy Standard or Double push against this side, kills the attacker. Movement resolves first, including an off-board death of the spined card; the attacker then dies and stops resolving remaining edges. Failed pushes, friendly pushes, Hook, Swap, Wave and Bite do not trigger retaliation. Shock disables Spines.

Pushes and pulls fail when their destination is occupied. Fish may be moved onto reef spaces, but cards still cannot be placed directly on reefs.

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

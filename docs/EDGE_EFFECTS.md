# Edge Effects

Card effects live on individual card sides. The side determines which adjacent space, ray, or distant target the effect uses. These are edge effects rather than whole-card abilities.

Every effect uses a compact boxed badge centered on the outer card edge. Standard and Double are directional arrows, so their icons rotate to point outward. Shield, Bite, Swap, Hook, and Wave icons always remain upright. The box provides an opaque backing so creature art and played-card silhouettes cannot reduce visibility.

## Resolution rules

Effects resolve in the order listed on the card after it is placed.

- **Standard:** Pushes an adjacent card one space when that card has no marker on the opposing side. Any opposing edge marker blocks Standard.
- **Double:** Pushes an adjacent card one space. It ignores an opposing Standard arrow, but Double, Shield, and every special edge marker block it.
- **Shield:** Defends its side against every current effect and never acts offensively.
- **Bigger Fish / Bite:** Removes an adjacent card when a normal push from that side would succeed. The target must be undefended and must have an open push destination or the board edge behind it.
- **Swap:** Exchanges places with an adjacent card when the target has no marker on the opposing side.
- **Hook:** Targets a card exactly two spaces away when the intervening space is empty, then pulls it into that gap. A Standard arrow does not defend against Hook; every other opposing marker does.
- **Wave:** Projects along three rays on its side: straight ahead and the two forward diagonals. Every undefended card on those rays is pushed one space farther away. Cards resolve farthest-first; a card pushed beyond the board is removed.

Pushes and pulls fail when their destination is occupied. Fish may be moved onto reef spaces, but cards still cannot be placed directly on reefs.

## First cards

| Card | Edge effects |
| --- | --- |
| Swordfish | Double right; Shield left |
| Barracuda | Bite right; Shield up and down |
| Hypno Squid | Swap right; Shield up and down |
| Lure | Hook down |
| Ocean Sunfish | Wave down |

The data model supports any mixture of these effects on the four card sides. Additional edge-effect types can be added without introducing a general card-text ability system.

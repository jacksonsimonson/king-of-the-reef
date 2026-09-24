# Shops And Tide Charms

Every shop generates exactly three fixed offers from the voyage seed and that shop's node ID. At least one is a regional creature and at least one is a Tide Charm; the third has an equal chance of either. No duplicate fish or charm types within a shop. Offers are ordered left to right from cheapest to most expensive, with distinct prices. Layout can expand or scroll; artwork and text never scale fractionally.

Buying spends the displayed price once and immediately adds the creature to the school or the charm to inventory. The shop stays open. Purchased offers remain visible as Sold Out; buying, reopening or reloading never replenishes stock or changes prices. Sail On completes the stop. Each different shop has its own new stock and purchase record. Unused charms carry across shops and regions, and duplicate charms stack without an inventory limit. Older saves gain an empty charm inventory and retain their shells.

## Initial Economy

Rewards are unchanged: 18 starting shells, 12 for a battle win, 4 for a tie, 25 for a Colossal win and 14 for salvage. Prices replace the old flat 18-shell purchase:

| Offer | Base Shells |
| --- | ---: |
| Spyglass Pearl | 38 |
| Common Creature | 40 |
| Current Conch | 42 |
| Nautilus Dial | 46 |
| Uncommon / Unclassified Regional Creature | 54 |
| Coral Mail | 54 |
| Rare Creature | 76 |
| Extremely Rare Creature | 100 |

Add a seeded 0 / 2 / 4 / 6 shells per offer and 4 per region after Shoreline. Tied prices move upward in 2-shell steps. Starting money plus one normal victory cannot afford an offer; buying multiple offers requires saving. These are first-pass values for playtesting, not a claim that every route has equal buying power.

## Battle Use

Tide Charms replace the Powerups label. Hover for the full effect; click a valid charm on your turn before playing a fish. Multiple charms are allowed without spending a fish placement. Disabled charms cannot be consumed. Quick Match gives one of each for testing; voyages only use purchased inventory. The rival has no charms in this pass.

| Charm | Effect / Target |
| --- | --- |
| Current Conch | Shuffle all unplayed hand cards into the remaining reserve and redraw the same number. Requires a nonempty reserve. Does not recycle played cards, restore killed cards, reset placement counts or guarantee different cards. |
| Spyglass Pearl | Choose one hidden rival hand card to reveal. Cancel before choosing to keep the charm. Revealing retains your turn and fish placement. A replacement card is hidden again. |
| Nautilus Dial | Select a hand card first. Turn its edge directions clockwise once. Icons such as Shields remain upright. Only this battle's copy changes. |
| Coral Mail | Select a hand card with an empty side. Add Shields on every empty side for the rest of this battle. Existing edges stay intact. Does not undo Shock, make a fish immune to being knocked off the board or change the permanent school card. |

Inventory consumption saves immediately on successful use. As with existing combat, unfinished board turns are not saved: leaving or reloading restarts the seeded battle, and spent charms remain spent. Persistent stat upgrades are not introduced yet; the current lasting effects remain on their fish for that battle only.

## Replacement Draws

Both sides start with up to five healthy cards. After each placement resolves, its hand slot immediately draws the next card from the previously shuffled reserve. Revelation still belongs to the fish just played, even though the slot now holds its replacement. Empty reserves leave the played silhouette. Deck counters track actual reserve size.

For this first pass, retain five fish plays per side, with visible counters; a larger school increases available choices rather than extending the battle. An exhausted side skips its remaining plays. The battle ends when both sides are done, or if no legal placement tiles remain. Unplayed healthy cards remain healthy afterward.

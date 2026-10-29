# Shops And Tide Charms

Shops open on **The Shell Exchange**, a dedicated illustrated screen. View Chart / Resume Visit preserves the active shop; Sail On completes it. See [encounter screens](ENCOUNTER_SCREENS.md) for navigation and art behavior.

Every shop generates exactly three fixed offers from the voyage seed and that shop's node ID. At least one is a regional creature and at least one is a Tide Charm; the third has an equal chance of either. No duplicate fish or charm types within a shop. Offers are ordered left to right from cheapest to most expensive, with distinct prices. Layout can expand or scroll; artwork and text never scale fractionally.

Buying spends the displayed price once and immediately adds the creature to the school or the charm to inventory. The shop stays open. Purchased offers remain visible as Sold Out; buying, reopening or reloading never replenishes stock or changes prices. Sail On completes the stop. Each different shop has its own new stock and purchase record. Unused charms carry across shops and regions, and each charm, including duplicates, occupies one of three inventory slots. Older saves gain an empty charm inventory and retain their shells.

## Legacy Economy

New voyages use the longer-map economy: 24 starting shells; 14/16/18 for regional wins; six for ties; and 28/32/36 for Colossals. Creature bases are 30/42/60/80 shells by rarity. Charm bases are half their catalog value (rounded), plus two; seeded 0/2/4/6 and regional 0/2/4 markups apply. Price ties still increase by two. Saved legacy voyages retain the prices below.

At capacity, an affordable charm offer opens a replacement dialog. Choose an exact held slot (duplicates remain distinct), then confirm the discarded charm, incoming charm, and shell cost. Cancel/Escape changes nothing. The purchase validates affordability and stock again before atomically replacing that slot. Legacy extras remain queued behind the three available slots.

Legacy rewards remain: 18 starting shells, 12 for a battle win, 4 for a tie, 25 for a Colossal win and 14 for salvage. Prices replace the old flat 18-shell purchase:

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

Tide Charms replace the Powerups label. Hover for the full effect; click a valid charm on your turn before playing a fish. Multiple charms are allowed without spending a fish placement. Disabled charms cannot be consumed. Quick Match gives three random, distinct charms; voyages only use purchased inventory. The rival has no charms in this pass.

| Charm | Effect / Target |
| --- | --- |
| Current Conch | Shuffle all unplayed hand cards into the remaining reserve and redraw the same number. Requires a nonempty reserve. Does not recycle played cards, restore killed cards, reset placement counts or guarantee different cards. |
| Spyglass Pearl | Choose one hidden rival hand card to reveal. Cancel before choosing to keep the charm. Revealing retains your turn and fish placement. A replacement card is hidden again. |
| Nautilus Dial | Select a hand card first. Turn its edge directions clockwise once. Icons such as Shields remain upright. Only this battle's copy changes. |
| Coral Mail | Select a hand card with an empty side. Add Shields on every empty side for the rest of this battle. Existing edges stay intact. Does not undo Shock, make a fish immune to being knocked off the board or change the permanent school card. |
| Spear Shell | Add Standard pushes to all empty sides of the selected hand fish. |
| Breaker Tooth | Upgrade the selected fish's Standard pushes to Double. |
| Barbed Wreath | Add Spines to all empty sides of the selected hand fish. |
| Dredger Net | Exchange the selected hand fish for one of the next three reserve cards. Send the old fish to the bottom; cancel keeps the charm. |
| Drift Shell | Move a friendly board fish to an adjacent empty safe tile, including a reef. Does not replay edges or placement terrain. Anchor and kelp prevent movement. Cancel keeps the charm. |
| Anchor Stone | Grant Anchor to the selected hand fish for this battle. |
| Reef Beacon | Grant Reefborn to the selected hand fish for this battle. |
| Duelist Pearl | Grant Piercing to the selected hand fish for this battle. |

The battle menu shows three inventory slots, with empty slots visible after use. Full shops offer a confirmed replacement of one held charm; creature purchases remain available. Older saves keep purchased excess charms in their original order: only the first three are available, and using one makes the next extra available. New purchases cannot create excess inventory. Invalid or unchanged upgrades cannot spend a charm. Ability grants preserve the fish's innate ability and other grants; hover text lists them all. See [full-card abilities](EDGE_EFFECTS.md#full-card-abilities).

New charm starting prices are their catalog bases plus 8 shells: Spear Shell 50, Breaker Tooth 54, Barbed Wreath 50, Dredger Net 46, Drift Shell 58, Anchor Stone 54, Reef Beacon 66 and Duelist Pearl 66. Normal seeded and regional adjustments still apply. New Voyages use sixteen charms. Unversioned/version-one saves retain the original four-charm shop pool; version-two saves retain the twelve-charm pool in its original order. Version-three saves include the additions below. Existing offers and purchase IDs never reroll; start a new Voyage for expanded stock.

Inventory consumption and its battle effect save together at the next stable decision. Battle checkpoints preserve temporary upgrades and reserve order through reloads. Persistent stat upgrades are not introduced yet; the current lasting effects remain on their fish for that battle only.

## Additional tactical charms

Select a hand creature before using these items. All changes last only for the current tide (or the whole battle in legacy single-tide mode), preserve innate abilities and never alter the saved school. An unchanged target cannot consume an item. They share the existing three inventory slots; Quick Match draws from all sixteen charms.

| Item | Effect and tradeoff | New-Voyage base price before markups |
| --- | --- | ---: |
| Guardian Ribbon | Grants Escort: before edges, add Shields to empty sides of adjacent allies. Those Shields can obstruct friendly delivery too. | 25 |
| Cuttle Ink | Grants Ambush: shock adjacent enemies before edges, bypassing edge defenses. Full-card abilities such as Bulwark remain active. | 27 |
| Surge Bottle | Grants Wake: after edges, push adjacent enemies outward once. Ignores edge defenses but respects Anchor, kelp, rocks and occupancy; allies stay put. | 29 |
| Undertow Lure | Converts Standard pushes to Hooks. Gains one-gap pulling while giving up adjacent pushing on those edges; all other edges stay unchanged. | 21 |

These expose three already implemented full-card abilities and one edge conversion; they do not assign new innate abilities to creatures. See [new ability ideas](CARD_ABILITY_IDEAS.md) for future proposals.

Validation: focused production-resolver scenarios check protection and its friendly obstruction, shock-before-push versus Bulwark, post-edge Wake and movement blockers, and gap pulling. Save tests cover both older shop pools and the expanded inventory. Run `node scripts/balance/item-study.mjs` for 120 seeded single-tide smoke checks across all three regions, both starters and current 4/5/6 budgets. Each item was usable in all 24 of its samples; mean player score margins were baseline −0.292, Ribbon −0.292, Ink −0.333, Bottle −0.375 and Lure −0.208. This tiny, eager-use AI study verifies integration, not optimal timing, equal item value or human balance. Placement choices matter; indiscriminate use can be worse than keeping a charm. Prices are provisional.

## Replacement Draws

Both sides start with up to five healthy cards. After each placement resolves, its hand slot immediately draws the next card from the previously shuffled reserve. Revelation still belongs to the fish just played, even though the slot now holds its replacement. Empty reserves leave the played silhouette. Deck counters track actual reserve size.

Voyage placement budgets are five/six/seven per side by region, with visible counters; Quick Match allows choosing five, six or seven. Hand size remains five, with reserve refills. An exhausted side skips its remaining plays. The battle ends when both sides are done, or if no legal placement tiles remain. Unplayed healthy cards remain healthy afterward.

# Balance pilot measurements

Reproduce with `node scripts/balance/report.mjs`. This is an offline deterministic resolver probe, not AI win rates, human playtesting, or a roster rebalance. Read [the interpretation and limitations](BALANCE_PILOT.md) before using these results.

Ten frozen pre-batch cards × 12 fixture types × 3 board sizes × 2 setup orientations = 720 baseline candidate-position cases. Three isolated proposal variants use the identical 72 positions each (216 additional cases), against the frozen baseline. Some symmetric/empty variants repeat: these are not 720 independent observations. Reef occupants stay fixed; non-reef setup pieces mirror horizontally. Every case enumerates all legal candidate placements. Select highest immediate reef differential, then fewest friendly deaths, then fewest friendly shocks, then lowest tile index. The chosen move receives the worst legal reply among four fixed synthetic profiles (four Standard edges, right Double, down Hook, left Bite). This is a deliberately limited greedy stress probe; there is no learned policy or hidden-hand access.

| Creature | Immediate gain cases / 72 | Mean immediate gain | Mean score difference after reply | Harmful legal moves / all legal moves | Reef dislodging replies / all retention replies |
| --- | ---: | ---: | ---: | ---: | ---: |
| Minnow | 34/72 | 0.47 | -0.69 | 16/2358 | 39/1616 |
| Tidepool Blenny | 35/72 | 0.49 | -0.64 | 46/2358 | 33/1616 |
| Boxfish | 0/72 | 0 | -0.75 | 1/2358 | 0/1616 |
| Electric Eel | 0/72 | 0 | -0.75 | 153/2358 | 45/1616 |
| Sea Urchin | 0/72 | 0 | -0.75 | 1/2358 | 45/1616 |
| Ocean Sunfish | 36/72 | 0.63 | -0.54 | 82/2358 | 33/1616 |
| Yellowfin Tuna | 31/72 | 0.86 | -0.24 | 37/2358 | 27/1616 |
| Flying Fish | 31/72 | 0.43 | -0.56 | 31/2358 | 27/1616 |
| Phantom Shark | 72/72 | 1 | -0.58 | 49/2358 | 15/1616 |
| Invisible Ink Squid | 35/72 | 0.49 | -0.4 | 34/2358 | 21/1616 |
| urchin-setter-proposal (proposal) | 36/72 | 0.5 | -0.67 | 5/2358 | 39/1616 |
| eel-support-proposal (proposal) | 25/72 | 0.35 | -0.4 | 144/2358 | 39/1616 |
| phantom-predator-proposal (proposal) | 72/72 | 1 | -0.33 | 41/2358 | 27/1616 |

## Utility and forced-risk checks

| Creature | Can newly shock an enemy / 72 | Best positive reef gain requires allied death or new Shock / 72 |
| --- | ---: | ---: |
| minnow | 0/72 | 0/72 |
| blenny | 0/72 | 0/72 |
| boxfish | 0/72 | 0/72 |
| electric-eel | 42/72 | 0/72 |
| sea-urchin | 0/72 | 0/72 |
| ocean-sunfish | 0/72 | 1/72 |
| yellowfin-tuna | 0/72 | 0/72 |
| flying-fish | 0/72 | 0/72 |
| phantom-shark | 0/72 | 0/72 |
| invisible-ink-squid | 0/72 | 0/72 |
| urchin-setter-proposal | 0/72 | 0/72 |
| eel-support-proposal | 42/72 | 1/72 |
| phantom-predator-proposal | 0/72 | 0/72 |

“Harmful” means a legal move kills an existing ally, newly shocks one, or reduces immediate reef differential. It is a risk-opportunity count, NOT the likelihood a competent player makes that move or an automatic weight discount. Retention assumes the creature has already reached the middle reef, without paying setup cost, and enumerates single-edge Standard/Double/Hook/Bite replies in all four directions. It omits terrain, abilities, and multi-edge reply combinations. Zero dislodges is not invulnerability.

## Per-fixture breakdown

### minnow

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 1 | -1 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 6/6 | 1 | -1 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 1 | -1.33 |
| blocked landing | 6/6 | 1 | -1 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 1 | -1 |
| regional terrain | 4/6 | 0.67 | -1 |

### blenny

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 1 | -1 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 6/6 | 1 | -0.83 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 1 | -1 |
| blocked landing | 6/6 | 1 | -0.83 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 1 | -1 |
| regional terrain | 5/6 | 0.83 | -1 |

### boxfish

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 0/6 | 0 | -1 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 0/6 | 0 | -1 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 0/6 | 0 | -2 |
| blocked landing | 0/6 | 0 | -1 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 0/6 | 0 | -1 |
| regional terrain | 0/6 | 0 | -1 |

### electric-eel

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 0/6 | 0 | -1 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 0/6 | 0 | -1 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 0/6 | 0 | -2 |
| blocked landing | 0/6 | 0 | -1 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 0/6 | 0 | -1 |
| regional terrain | 0/6 | 0 | -1 |

### sea-urchin

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 0/6 | 0 | -1 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 0/6 | 0 | -1 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 0/6 | 0 | -2 |
| blocked landing | 0/6 | 0 | -1 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 0/6 | 0 | -1 |
| regional terrain | 0/6 | 0 | -1 |

### ocean-sunfish

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 1 | -1 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 6/6 | 1 | -1 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 2 | 0 |
| blocked landing | 6/6 | 1.5 | -0.5 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 1 | -1 |
| regional terrain | 6/6 | 1 | -1 |

### yellowfin-tuna

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 2 | 0 |
| Standard holder | 6/6 | 2 | 0 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 2/6 | 0.67 | -0.67 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 2 | 0 |
| blocked landing | 2/6 | 0.67 | -0.67 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 2 | 0 |
| regional terrain | 3/6 | 1 | -0.5 |

### flying-fish

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 1 | -1 |
| Standard holder | 6/6 | 1 | 0 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 2/6 | 0.33 | -0.83 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 1 | -1 |
| blocked landing | 2/6 | 0.33 | -0.83 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 1 | -1 |
| regional terrain | 3/6 | 0.5 | -1 |

### phantom-shark

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 6/6 | 1 | 0 |
| ally approach | 6/6 | 1 | 0 |
| enemy reef | 6/6 | 1 | -1 |
| Standard holder | 6/6 | 1 | -1 |
| Shield holder | 6/6 | 1 | -1 |
| crowded lane | 6/6 | 1 | -1 |
| friendly edge risk | 6/6 | 1 | 0 |
| split control | 6/6 | 1 | -1 |
| blocked landing | 6/6 | 1 | -1 |
| friendly reef | 6/6 | 1 | 1 |
| shocked holder | 6/6 | 1 | -1 |
| regional terrain | 6/6 | 1 | -1 |

### invisible-ink-squid

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 1 | 0 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 6/6 | 1 | -0.67 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 1 | -1 |
| blocked landing | 6/6 | 1 | -0.67 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 1 | 0 |
| regional terrain | 5/6 | 0.83 | -0.5 |

### urchin-setter-proposal

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 1 | -1 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 6/6 | 1 | -1 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 1 | -1 |
| blocked landing | 6/6 | 1 | -1 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 1 | -1 |
| regional terrain | 6/6 | 1 | -1 |

### eel-support-proposal

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 0/6 | 0 | 0 |
| ally approach | 0/6 | 0 | 0 |
| enemy reef | 6/6 | 1 | 0 |
| Standard holder | 0/6 | 0 | -1 |
| Shield holder | 0/6 | 0 | -1 |
| crowded lane | 2/6 | 0.33 | -0.67 |
| friendly edge risk | 0/6 | 0 | 0 |
| split control | 6/6 | 1 | -1 |
| blocked landing | 2/6 | 0.33 | -0.67 |
| friendly reef | 0/6 | 0 | 0 |
| shocked holder | 6/6 | 1 | 0 |
| regional terrain | 3/6 | 0.5 | -0.5 |

### phantom-predator-proposal

| Fixture | Positive immediate gain / 6 | Mean gain | Mean post-reply score difference |
| --- | ---: | ---: | ---: |
| empty | 6/6 | 1 | 0 |
| ally approach | 6/6 | 1 | 0 |
| enemy reef | 6/6 | 1 | 0 |
| Standard holder | 6/6 | 1 | -1 |
| Shield holder | 6/6 | 1 | -1 |
| crowded lane | 6/6 | 1 | -0.67 |
| friendly edge risk | 6/6 | 1 | 0 |
| split control | 6/6 | 1 | -1 |
| blocked landing | 6/6 | 1 | -0.67 |
| friendly reef | 6/6 | 1 | 1 |
| shocked holder | 6/6 | 1 | 0 |
| regional terrain | 6/6 | 1 | -0.67 |


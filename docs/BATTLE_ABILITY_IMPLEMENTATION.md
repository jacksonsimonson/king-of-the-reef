# Twenty battle abilities: implementation and evidence

All twenty [approved assignments and edge changes](ABILITY_ASSIGNMENTS.md) are active. No prices, rarity, play budgets or other creatures change. Version-seven Voyages and Quick Match use the new catalog; versions one through six retain historical definitions. Historical regional-layout regression tests explicitly use their frozen catalog, while the current-roster tests check all twenty assignments and unique complete identities.

## Timing and limits

- True North rotates before terrain. Borrowed Armor and Mimicry apply after landing/channel orientation and before edges. Battle Plan reverses stored attack order; Gentle Giant skips one attack without removing its defensive marker. Focused Strike and Pack Hunt bypass edge defenses but retain Bulwark and legal destinations.
- Slipstream, Towline, Grooming and Snare Line resolve after edges and Wake, before whirlpool travel. Their deterministic destinations are offered in the placement preview, with cancellation before commitment. No movement retriggers edges or landing terrain.
- Inflate prevents the first otherwise successful enemy edge movement per tide, including Wave/Ram/Hook/Swap. Blocked attempts do not spend it; terrain, Wake and predation bypass it. Friendly movement remains legal.
- Spreading Arms offers one blank-side Standard at the next own turn if the host survives. It does not immediately attack.
- Shoal scores two on a reef beside an ally. Off-reef Network scores one beside an allied reef holder, capped at one bonus per owner; Sovereign does not stack on the Network host.
- Afterimage triggers on enemy edge removal, including Spines retaliation. Its non-scoring marker blocks direct placement, clears when moved through, and expires after the remover's next placement. It may remain until tide end when that side has no further plays. Terrain/self-removal do not create it.
- Snare consumes the first offensive edge of an enemy directly placed on its marked tile. Full-card effects still work. Friendly placement and movement do not trigger it; it expires at the owner's next turn or tide reset. One marker per side and tile.
- Relay selects one of the top two replacements before the normal refill. Sonar then reveals the next two enemy reserve identities/order (or one hidden hand card if empty). False Lure reveals a chosen hidden slot before an optional top-reserve exchange, capped at one exchange per side per tide. Muster exchanges a different unplayed hand slot after refill. Exchanges put the outgoing card at the bottom, preserve previously revealed identities and never give extra plays.
- Choices use public board state and explicitly revealed information. The rival uses the same legal board options; hand choices use a simple bounded heuristic. It never reads an unrevealed reserve to decide an exchange.
- Checkpoints store temporary memory at stable decision boundaries. Reloading during a choice resumes the prior stable decision. Tide two restores the opening cards and clears temporary abilities, statuses, markers and reveal memory.

## Focused batches

Movement/delivery, defense/attack, scoring/adaptation, markers/support, hands/information, and save/AI batches cover all twenty abilities. Scenarios include blockers, friendly targets, reef access, charm-granted abilities, edge ordering, delayed growth, exhausted reserves, repeated exchanges, marker expiration and input immutability on 5/6/7 boards. This checks mechanics, not human enjoyment.

## Paired individual-host study

Reproduce with `node scripts/balance/ability-study.mjs 0 4` and `node scripts/balance/ability-study.mjs 100 8`. Together: 1,920 simulated tides, 20 hosts, identical old/new schools and deals, both starters, with no charms and with Anchor Stone/Reef Beacon/Nautilus Dial on both sides. Each eight-card school includes the focal host, six ordinary guides and one regional peer. Both seats use the Tactical policy; play budgets are 4/5/6. Raw local results are written to `.cache/balance/`.

Fresh batch (100–107): change in average final score margin, new minus old. Played means the host appeared in the action trace, not proof its ability activated.

| Host | Margin change | New host played |
| --- | ---: | ---: |
| flying-fish | 0.063 | 31/32 |
| remora | 0.156 | 31/32 |
| pufferfish | 0.281 | 24/32 |
| decorator-crab | -0.188 | 27/32 |
| sea-star | 0.000 | 13/32 |
| mantis-shrimp | -0.031 | 23/32 |
| orca | -0.094 | 28/32 |
| whale-shark | 0.250 | 32/32 |
| clownfish | 0.250 | 14/32 |
| staghorn-coral | 0.156 | 19/32 |
| bottlenose-dolphin | -0.188 | 16/32 |
| humpback-whale | 0.000 | 29/32 |
| anglerfish | 0.094 | 19/32 |
| pelagic-octopus | -0.063 | 28/32 |
| compass-jelly | 0.219 | 32/32 |
| phantom-shark | 0.063 | 32/32 |
| cleaner-wrasse | 0.000 | 17/32 |
| rust-lobster | 0.250 | 26/32 |
| seahorse | 0.000 | 18/32 |
| map-serpent | 0.094 | 31/32 |

Initial signals reversed for Decorator Crab, Anglerfish, Phantom Shark and Map Serpent on fresh seeds. Keep the proposed cuts rather than tuning from one small sample. Sea Star's zero delta is not proof its delayed growth has no value; the Tactical policy and timing limit this estimate.

## Combined-school stress test

Reproduce with `node scripts/balance/ability-schools.mjs`: 720 tides grouped into 360 paired-initiative comparisons, 12 new seeds, both seat assignments, no charms plus all four existing three-charm stress inventories. Each school contains ten assigned creatures, with several new abilities together. Both versions use the same engine and policy. All twenty hosts were played somewhere in this cohort. These are fresh independent tides aggregated in pairs, not campaign economies or human matches.

| Formation | New wins / draws / losses | Mean paired score margin |
| --- | --- | ---: |
| Shoreline | 66 / 28 / 26 | +0.642 |
| Open Ocean with reef support | 24 / 31 / 65 | -0.558 |
| Bermuda with earlier-region support | 44 / 27 / 49 | -0.058 |

The Shoreline formation benefits from its scoring/support package; the Ocean formation loses some old attack coverage. These are meaningful follow-up signals, not a reason to restore every removed edge: a fixed ten-card formation, Tactical-only play and heuristic hand choices cannot identify a single causal culprit. Keep the approved edges provisionally, then compare human recruitment and counterplay before further buffs/nerfs. These tests do not establish optimal AI, equal win rates, per-ability activation rates, full-Voyage economy balance or human match length.

## Browser and final checks

Observed final check: `npm.cmd run verify` passed workflow configuration, 279 tests, type-check and build (the existing bundle-size warning remains). `git diff --check` passed. Both balance scripts were rerun on the final rules with the reported results unchanged.

Browser: exercised native text controls, True North cancellation and rotation, False Lure hidden-slot selection followed by reveal/exchange, Snare Line placement, Relay replacement selection, rival responses, completion of tide one and reset into tide two. Inspected the final Gentle Giant dialog visually after the last UI update. This was a functional smoke test with an isolated twenty-host roster, not strategic human playtesting of all twenty abilities. Drag input, narrow/mobile viewports, all individual ability dialogs and a full new-version Voyage were not manually exercised. Temporary playtest fixtures stay under ignored `.cache/` on an isolated local origin, leaving the user's current Voyage save intact.

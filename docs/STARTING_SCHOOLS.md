# Starting schools

**Shelved on 2026-10-28 at the owner’s request.** The departure and New Voyage screens use the original fixed school again. Existing runs keep their actual cards and optional provenance. Definitions, tests and the historical evidence below remain available for reconsideration; the picker is not currently exposed.

New Voyages offer three eight-creature schools. All creatures belong to the Shoreline/Reef pool; **none uses an Open Ocean or Bermuda card**. Each starts with eight healthy, uniquely identified copies, 24 shells, three resolve and no charms. The seed, maps, encounter offers and reward rules are unaffected by the choice. Schools are starting packages, not permanent restrictions on recruiting.

Every school shares Minnow, Anchovy, Goby and Tidepool Blenny for familiar directional setup. Its remaining four creatures establish its playstyle:

| School | Specialists | Plan | Tradeoff |
| --- | --- | --- | --- |
| Tidepool Guides | Crab, Shore Shrimp, Sea Star, Octopus | Flexible adjacent pushes and longer pulls; the original starting school, unchanged | Few shields; exposed holders need protection through positioning |
| Shellguard | Decorator Crab, Horseshoe Crab, Frogfish, Mantis Shrimp | Guard selected approaches, deliver through open sides using Hooks, break ordinary defenses with Double | Shields obstruct friendly delivery too; limited reach demands advance setup |
| Reef Tethers | Shore Shrimp, Sea Star, Christmas Tree Worm, Comb Jelly | Arrange one-tile gaps and pull creatures onto or off reefs | No shields; conditional reach and less incidental pushing flexibility |

The departure page and replacement-Voyage dialog show the plan, weakness and all eight cards at native sprite size. Specialists appear first in the preview; this does not change the saved deal order. The dialog scrolls instead of shrinking artwork. Cancelling a replacement preserves the current run.

## Saves and enabled roster

`Run.startingSchool` is optional provenance, not a recipe reapplied on load. The stored school, acquired creatures, health and mechanics remain authoritative. Old saves without that field load unchanged; unknown IDs are rejected. The original unnamed `createRun(seed, version)` path keeps its exact starting order and historical enabled-roster fallback, so existing studies and legacy callers do not silently switch schools.

A named school is unavailable if any member is disabled in Gallery. There are no silent replacements. If every named school is unavailable, the picker explicitly offers the existing enabled-reef fallback and previews its actual eight copies; a small enabled pool repeats species with distinct IDs. Enabling creatures in Gallery restores the named choices. Selecting or previewing a school does not itself create a save or discover creatures; departure persists the selected school through the existing journal flow.

## Relative balance decisions

No creature edges, card abilities, prices or rewards changed. The initial defensive candidate had Hermit Crab and Conch Snail; it lost too often to the original pulling candidate (23 wins / 42 draws / 63 losses in 128 paired two-tide matches). Replace those two setters with guarded Hook users Decorator Crab and Frogfish so the defensive package has practical delivery routes. Retain Horseshoe's downward setup and Mantis Shrimp's Double.

The initial pulling candidate included Seahorse and Coral Banded Shrimp. Narrow these to Christmas Tree Worm and Comb Jelly, preserving Hook direction coverage while reducing extra edges and incidental pushing flexibility. The last change followed a no-charm split where the earlier Tethers candidate exceeded 60% result share against Guides. These are package-level tradeoffs, not permanent card power ratings.

The final aggregate result shares (wins plus half of draws) are 48.3% Guides versus Shellguard, 44.4% Guides versus Tethers, and 43.6% Shellguard versus Tethers. Tethers retains a modest direct-match advantage; it does not dominate full Voyages. Across 144 runs per school, Guides completed seven and reached Bermuda 35 times, Shellguard completed five and reached Bermuda 26 times, and Tethers completed six and reached Bermuda 23 times. Capped boss retries remain unresolved, not losses or wins. These checks support a reasonable initial release of the choices, not exact equality or a forecast of human win rates.

## Reproduce the evidence

```powershell
node scripts/balance/starting-school-study.mjs 0 32
node scripts/balance/starting-school-study.mjs 32 32
node scripts/balance/starting-school-study.mjs 64 16
node scripts/balance/starting-school-evidence.mjs
```

Use the pinned Node version and this PR's revision. The study saves snapshots of the exact school definitions alongside raw results in `.cache/balance/starting-schools-{0,32,64}.json`; the evidence generator checks membership, counts and duplicate cohort keys before producing [committed tables](STARTING_SCHOOL_EVIDENCE.md).

- **Direct matchups:** 80 shared seeds, all three school pairings, both player/rival assignments, no charms versus equal Anchor Stone/Drift Shell inventories, and two tides with swapped starters. Both policies use Tactical difficulty on normal Shoreline terrain with four plays per side per tide. This is 960 combined matches / 1,920 tides. The charm condition is a sensitivity check, not free starting charms. Draws are included in result shares; the table also reports W/D/L and point margins.
- **Full Voyages:** the first 12 seeds from each batch, all schools, Tactical/Expert player policy and 85%/60% assumed fishing success, using the existing recovery route and ordinary recruiting/buying policy. This is 432 runs on 36 shared map seeds. Both earlier batches informed tuning; seeds 64–79 were checked after the final membership change and were not used for another revision.
- **Limits:** shared seeds are not independent player trials. AI favors some tools, charms use a heuristic, catches are assumptions, and boss retries do not adapt. One no-charm Shellguard/Tethers subgroup is still lopsided (36.7% for Shellguard on seeds 0–31); other batches are closer. Do not hide that variance or use a universal 50% target to erase each school's identity.

## Validation

Tests check all eight members are reef creatures, equal resources/maps, unchanged default order, available-roster constraints, saved recruited/injured copies, and old-save behavior. Role scenarios execute real combat: Guides push a holder onto a reef, Shellguard hooks Mantis Shrimp onto one and retains it against an upper attack, and Tethers uses an upward Hook for delivery.

Browser checks on an isolated local origin covered first departure, switching previews, creating Shellguard and Tethers, inspecting their actual eight-card schools, cancellation, reload persistence, scrolling and native-size card art. Disabled-roster behavior is covered by unit tests, not a separate browser run. No full human Voyage or narrow-mobile browser playtest is claimed. Screenshot: `.cache/starting-schools.png`.

All 256 tests, workflow checks, type-check and build pass. Human school preference and whole-Voyage pacing remain follow-up checks; future adjustments should keep relative roles and counterplay intact.

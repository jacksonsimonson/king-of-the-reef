# All twenty ability creatures: consolidated mixed-school pass

Completed after merging PR #45, baseline cf6e04d. **Keep all twenty version-seven assignments and edges.** This single pass includes the previous Octopus concern; it does not queue separate card-by-card PRs. No production gameplay, save versions, rarity or prices change. The PR adds reproducible mixed-school fixtures, optional simulation telemetry, regression tests and these decisions.

## Scope and reproduction

```powershell
node scripts/balance/all-ability-schools.mjs 1200 8
node scripts/balance/all-ability-schools.mjs 1600 8
node scripts/balance/all-ability-schools.mjs 2000 2 expert
node --test tests/all-ability-schools.test.mjs
```

**6,320 simulated tides:** 6,272 Tactical tides in two fresh eight-seed batches plus a 48-tide Expert smoke test. Main cohorts use all three regional board sizes and 4/5/6 plays. Both seat assignments and both tide starters are paired. Regional schools can use current and earlier-region creatures, never later-region cards.

- Mixed: four new-ability hosts plus four other regional creatures.
- Heavy: up to eight new-ability hosts plus four other creatures.
- All-20 stress: all twenty hosts in one deck on the Bermuda-size board, deliberately ignoring acquisition progression for interaction stress. Both sides have all twenty; only the drawn and selected subset is played in any one tide.

Schools are deterministically shuffled by seed and seat. The two Tactical batches span seven region/density cohorts and seven charm conditions: none, the four existing stress inventories, Guardian Ribbon/Cuttle Ink/Surge Bottle, and Undertow Lure/Reef Beacon/Current Conch. Together these cover **all 16 charms** in valid three-slot inventories, not every possible charm combination. The Expert check uses two additional seeds, mixed schools and no charms; it is a compatibility smoke test, not a precise Expert balance estimate.

Each treatment compares current definitions with the same focal school using version-six definitions, against a current opponent. Ordinary creatures are unchanged. Paired tides reset resources rather than simulating a continuing Voyage. Raw trials and coverage are generated under ignored `.cache/balance/all-abilities-*.json`.

## School-level results

Positive change means the current ability/edge packages improve the focal school's combined score margin compared with its previous definitions. Current-vs-current margins average zero **by the seat-pairing construction**; that is not proof of equal individual-card power. The table reports treatment deltas instead. Loss change counts additional focal casualties per paired result.

| Cohort | Seed batch 1200–1207 | Seed batch 1600–1607 | Mean margin change | Mean loss change |
| --- | ---: | ---: | ---: | ---: |
| Shoreline / mixed | 0.393 | 0.241 | 0.317 | -0.076 |
| Shoreline / heavy | 0.223 | 0.339 | 0.281 | 0.049 |
| Open Ocean / mixed | 0.009 | 0.214 | 0.112 | 0.147 |
| Open Ocean / heavy | 0.188 | 0.116 | 0.152 | 0.496 |
| Bermuda / mixed | 0.188 | 0.071 | 0.129 | 0.219 |
| Bermuda / heavy | 0.018 | -0.063 | -0.022 | 0.161 |
| Bermuda / all20 | -0.036 | 0.080 | 0.022 | 0.263 |

Shoreline retains a consistent scoring uplift. Ocean's fixed-school deficit from the earlier study does not persist across these varied compositions: the new packages improve mean margins in both mixed and heavy cohorts. Bermuda heavy and all-20 results change direction between seed batches, so small shifts there should not drive a buff or nerf. Some later-region cohorts sustain more casualties; that matters for Voyage recovery even when score improves, and is not measured by win rate alone.

The Expert smoke-test treatment deltas are Shoreline: 0.500, Ocean: 0.000, Bermuda: 0.500. Its two seed groups are far too few for a balance conclusion.

## Coverage and decisions for all twenty

Counts below aggregate both current sides of the Tactical runs. Current matchups repeat under the paired focal-seat labels; these are observation counts, **not independent trials**. All twenty were played, and each was co-rostered with all nineteen other hosts somewhere in the suite (the all-20 cohort guarantees that opportunity). This does not claim every pair activated together.

- Choice: a non-default placement option was selected; not necessarily beneficial.
- Immediate: removing only the actor's innate ability changes the immediate board edges/positions, Shock state or score under the same chosen action. Extra copied/Shield edges count, so this is not a win-value estimate. Temporary memory and hand state are excluded.
- Hand / reveal: yielded hand decisions and newly public card identities. A decision can keep the existing hand; reveal counts can exceed placements.
- Delayed: measured Sea Star growth, Pufferfish movement blocks, Phantom Shark decoys, or consumed Rust Lobster snares. These are different events, not comparable power units. Later Shoal/Network scoring changes are not attributed back to an earlier placement by this telemetry.

| Creature | Plays | Choice | Immediate | Hand / reveal | Delayed | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Flying Fish | 1630 | 1578 | 1578 | 0 / 0 | 0 | Keep |
| Remora | 1762 | 828 | 828 | 0 / 0 | 0 | Keep |
| Pufferfish | 1484 | 0 | 0 | 0 / 0 | 86 | Keep |
| Decorator Crab | 1442 | 1358 | 1358 | 0 / 0 | 0 | Keep |
| Sea Star | 940 | 0 | 0 | 0 / 0 | 510 | Keep |
| Mantis Shrimp | 1014 | 630 | 256 | 0 / 0 | 0 | Keep |
| Orca | 1468 | 0 | 96 | 0 / 0 | 0 | Keep |
| Whale Shark | 1306 | 172 | 10 | 0 / 0 | 0 | Keep |
| Clownfish | 932 | 0 | 64 | 0 / 0 | 0 | Keep |
| Staghorn Coral | 1112 | 0 | 730 | 0 / 0 | 0 | Keep |
| Bottlenose Dolphin | 944 | 0 | 0 | 0 / 1678 | 0 | Keep |
| Humpback Whale | 1224 | 0 | 0 | 1006 / 0 | 0 | Keep |
| Anglerfish | 498 | 0 | 0 | 914 / 498 | 0 | Keep |
| Pelagic Octopus | 1020 | 722 | 714 | 0 / 0 | 0 | Keep |
| Compass Jelly | 638 | 518 | 518 | 0 / 0 | 0 | Keep |
| Phantom Shark | 944 | 0 | 0 | 0 / 0 | 184 | Keep |
| Cleaner Wrasse | 618 | 234 | 202 | 0 / 0 | 0 | Keep |
| Rust Lobster | 300 | 210 | 0 | 0 / 0 | 0 | Keep |
| Seahorse | 730 | 0 | 0 | 536 / 0 | 0 | Keep |
| Map Serpent | 872 | 514 | 236 | 0 / 0 | 0 | Keep |

## Interpretation and conservative keeps

**Movement and adaptation:** Flying Fish, Remora, Decorator Crab, Compass Jelly, Cleaner Wrasse and Map Serpent have recorded board-changing choices. Their counts establish ordinary opportunities, not that every selected option is strategically best. Keep their reduced edge budgets.

**Octopus, within this same pass:** 1020 placements, 722 non-default Mimicry choices and 714 immediate board/edge differences. Mixed schools supply copying opportunities that the sparse attack-coverage probe omitted. A copied edge is not automatically a scoring improvement, but these results do not support restoring Hook/Bounce simply because isolated direct attacks fell. Keep Dive/Standard plus full-card Mimicry.

**Defense and delayed support:** Inflate, Spreading Arms and Afterimage all produced recorded deferred effects. No extra placements, invalid budgets or unresolved match states occurred. Keep their once-per-tide/timing constraints.

**Attacks and optional restraint:** Focused Strike and Pack Hunt changed immediate outcomes in a subset of plays, while retaining ordinary Double/Bite roles. Gentle Giant's selected skips often leave the same immediate board; its optional friendly-fire restraint should not be valued as unconditional power. Do not inflate edge strength to compensate for unused choices.

**Scoring:** Network is active much more visibly than Shoal on placement. Shoal can activate later when support arrives, which this immediate metric deliberately does not capture. Retain the ordinary displacement counters and duplicate/stacking limits validated in [the prior study](SCORING_COVERAGE_STUDY.md).

**Information and hands:** Sonar reveals, Relay choices, False Lure decisions/reveals and Muster choices all occur. The simple hand heuristic does not measure how well a human uses that information; do not buff these abilities based only on immediate board deltas.

**Snare Line audit:** 300 Rust Lobster placements and 210 non-default marker choices produced 0 consumed markers. There were 132 opponent decisions with an active enemy marker; removing that marker changed the fixed-tie-break policy's chosen move in 6 paired probes. Both probes use identical public positions and fixed zero tie-breaking without consuming the real match RNG. A changed decision is evidence of a policy response, not proof of stronger scoring or optimal trap placement. Most exposed decisions were unchanged: this is a weak usage signal, not proof of strong trap effectiveness. Low/no direct consumption alone does not justify a duration or strength buff. Retain the current rules provisionally and include zone usefulness in broad human gameplay feedback; do not treat this test as proof every trap was useful.

## Validation and boundaries

- All study matches completed within 4/5/6 play budgets.
- Fixture tests verify deterministic varied schools, regional progression, all twenty hosts and coverage of every charm.
- Audit-on versus audit-off regression verifies identical decisions, draws, scoring, casualties and other existing output for its seeded mixed-school fixture. Telemetry is simulation-only and does not alter the game.
- `npm.cmd run verify`: workflow configuration, **285 tests**, type-check and build passed; existing bundle-size warning remains.
- Production gameplay/UI are unchanged; no new browser playtest is claimed.

The Tactical comparison has 16 shared seed groups plus a two-seed Expert smoke test; repeated seats, loadouts and cohorts are correlated. This is an automated full-roster interaction/balance pass, not human playtesting or a guarantee of equal power. Long-run recruitment, hydration costs, human understanding and optimal AI remain outside the evidence. **This requested consolidated pass is complete; further tuning should respond to broad gameplay evidence rather than requiring twenty sequential PRs.**

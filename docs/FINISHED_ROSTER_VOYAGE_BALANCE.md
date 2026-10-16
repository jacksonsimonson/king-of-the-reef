# Full Voyage validation after the roster pass

Follow-up: [deliberate recruiting and school trimming](DELIBERATE_SCHOOL_STUDY.md) compares four policies on these seeds and a fresh batch. It retains gameplay values after mixed results.

## Decision

Keep gameplay balance values unchanged in this pass. The completed roster can sustain full regional turn budgets under these simulated routes: only **6 of 1,232 matches** began with fewer healthy cards than needed. However, later-region combat results are poor even with ample healthy cards. This is a progression warning, not evidence that the entire Voyage is balanced or that more free healing will fix it.

The most useful next investigation is **school composition and recruitment choices**, followed by human checks of later-region encounters and repeated boss draws. Compare intentional role-based recruiting/releasing against this baseline before changing card strength, prices or recovery. Starting-school choices can build on that investigation; bespoke Colossal decks remain last. These are recommendations, not features implemented by this study.

## Protocol and reproduction

Baseline is PR38's merged gameplay, commit `b07ba50115e947f74c3084cd18cb46e7aaf78874`, card balance version 6. All 167 creatures have completed their regional role review. This study uses real carried schools, production combat and run settlement, regional rivals, charms, casualties, shops, fishing offers, events and hydration. It uses current two-tide rules: 4/5/6 plays per side per tide and 5×5/6×6/7×7 boards. No gameplay or save format changed.

```powershell
node scripts/balance/roster-voyage-report.mjs 6 0
node scripts/balance/roster-voyage-report.mjs 6 6
node scripts/balance/roster-voyage-evidence.mjs
```

Run with the repository's pinned Node version. Raw visit and battle ledgers are written under `.cache/balance/finished-roster-voyages-{0,6}.json`; the final command validates cohort coverage and regenerates [committed evidence](FINISHED_ROSTER_VOYAGE_EVIDENCE.md). Reproduce on this PR's commit: the simulator uses the live catalog, so future gameplay changes can change results even if the balance version remains 6. Each invocation overwrites its own batch file.

There are 96 runs: 12 shared seed IDs × Tactical/Expert player policy × recovery/combat route policy × assumed 85%/60% fishing success. Both fishing assumptions use the same seed IDs and seeded draws. These are **12 map seeds with eight policy variants**, not 96 independent maps. The second six-seed batch checks sensitivity; it is not evidence of a universal completion rate.

Policies retain the existing simulator's limitations:

- Start with the real eight-card school, 24 shells and three resolve. Use only reachable next nodes. Recovery routes prioritize urgent hydration, fishing and shops; combat routes favor battles except emergency hydration.
- Fishing selects a seeded random offered species. Catch success is an explicit assumption, not a test of the fishing minigame or player skill.
- Shops buy at most one affordable item, preferring fish below eight healthy cards and otherwise charms. Full charm inventories are not replaced. Events prioritize needed recovery/resolve, recruitment and income. Hydration restores up to three injured copies in school order.
- No strategic release, role-based recruitment, active-deck selection or learning between attempts. Every healthy copy remains eligible for the shuffle. Player AI and charm choices are repeatable proxies, not optimal play; AI decision RNG is not an exact replay of human input.
- Stop at victory, defeat or six attempts at the same boss. A cap is unresolved, never a loss or win. Repeated attempts retain the seeded encounter. The study records repeated school/health/charm openings separately.

## Findings

**Progression needs attention.** Two runs won, 63 lost and 31 hit the boss cap. Fifty-one reached Open Ocean and 21 reached Bermuda. Regular encounters and bosses together produced 319/341/132 wins/draws/losses in Shoreline, 36/65/221 in Open Ocean and 5/15/98 in Bermuda. Later-region samples are selected survivors; these figures are not fair isolated regional difficulty comparisons. There were 209 boss draws and 188 repeated boss openings, so completion is especially confounded by a policy that does not adapt.

**School size is usually sufficient; composition is unresolved.** Average schools at battle entry grew from 10.27 to 13.63 to 16.41 copies, with 10.00, 12.39 and 12.91 healthy. Only two Ocean and four Bermuda battles started below the per-tide play budget; none did in Shoreline. Yet average healthy current-region copies were only 1.83 in Ocean and 1.10 in Bermuda. The growing school still mostly carries earlier-region creatures. This identifies limited exposure to new mechanics and a useful composition experiment; it does not prove later cards should be stronger or that earlier creatures must be discarded. Distinct healthy species averages of 9.81/12.10/12.68 also show these runs do not build concentrated schools.

**Injuries matter later without usually preventing full turns.** Newly injured unique copies per combined match averaged 0.30/1.51/2.38 by region. Hydration restored 574 copies overall, events ten and boss passage 73. In Bermuda, 41 of 62 hydration visits healed the full three, and 35 still left injuries. That is real pressure, but it coexists with almost complete turn budgets. Do not increase healing merely to erase accumulated injuries; first check whether a player can preserve and restore their important roles. Recovery restores copies, not distinct species; the same copy may be counted after different encounters.

**Economy pressure is visible but policy-dependent.** Of 403 shop visits, 131 offered no affordable item and 267 no affordable fish. Purchases were 14 fish and 258 charms, spending 7,134 shells. The charm-first policy above eight healthy cards strongly biases this split. Mean ending shells were 27.46, but endings occur at different stages and do not measure money available at each shop. Keep prices and rewards unchanged until a fish-saving or role-based shopping policy is compared on these seeds.

**Recruitment remains functional at the lower catch assumption.** There were 514 recruits overall, including 384 successful catches and 126 escapes. No recovery-route cohort suffered a starting-school shortage. All six shortages occurred on combat routes; four occurred at the 60% catch assumption. Lower catch success therefore deserves monitoring, but this sample does not support a blanket fish grant. Actual total catches need not equal either assumed percentage because routes terminate at different points.

## Validation and limits

The resource-ledger regression reconciles starting funds plus visit changes with final funds, starting school plus additions/removals with final school, purchases with affordable stock, recovery with actual health changes, and each battle's unique casualties with surviving health. It also checks played creatures were actually available. Existing tests check deterministic routes, separation of caps from defeats, and preservation of carried card identity/health through the simulator.

No browser or human playtest was performed for this analysis-only change. Simulation does not establish match enjoyment, human pacing, the readability of school choices, or optimal tactical balance. No creature, hydration, economy, rival or map values were adjusted. The [earlier Voyage study](FULL_VOYAGE_BALANCE.md) remains historical evidence from before the full roster pass; this report is the current-roster baseline.

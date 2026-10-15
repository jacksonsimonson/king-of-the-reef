# Roster balance pilot and relative weights

This is the first application of the [creature balance framework](CREATURE_BALANCE.md), after PR #26. It inventories the live roster and tests a small group before any reshuffle. **No playable creatures, pools, abilities, saves, or encounters change in this pass.**

## Deliverables and scope

- [Complete role inventory](ROSTER_ROLE_INVENTORY.md): all 167 live creatures, stable IDs, current ordered edges, innate abilities, provisional roles, relative component ranges, and review flags.
- [Reproducible measurements](BALANCE_PILOT_RESULTS.md): ten live creatures plus three isolated proposal variants, evaluated with the actual combat resolver.
- `node scripts/balance/report.mjs` rebuilds both reports and writes detailed per-case JSON to `.cache/balance/results.json`. That cache is not committed. No browser storage or gameplay definitions are modified.

The role inventory is a first-pass classification of current mechanics, not a final species design. It exposes packages that need decisions rather than pretending that every existing combination already has a coherent role. In particular, “Flexible mover” is not permission to keep arbitrary edges: each such creature must settle on a concrete job such as reef entry, pursuit, or escape before reassignment.

| Review role | Creatures |
| --- | ---: |
| Reef setter | 36 |
| Displacer | 49 |
| Predator | 26 |
| Flexible mover | 41 |
| Holder | 12 |
| Support | 3 |

53 creatures have three or more distinct edge mechanics and are flagged for coherence review. This flag is not a finding that all 53 are bad. Two supports have innate abilities (Revelation and Rally); the third is Electric Eel's all-direction Shock. Classification prioritizes signature effects, so these are review buckets, not independent measurements of every secondary role. Roster counts are derived from actual regional pools, not the historical catalog counts in older notes.

## Relative weights, revision 1

**One Standard edge is the reference unit, set to 1 for this revision.** Every other range is a provisional comparison against that reference and today's rule set. These are designer hypotheses, not fitted coefficients, objective power, or mandatory rarity budgets. Re-anchor them when new edges/abilities alter access, counterplay, or useful combinations. Never compare totals across revisions without recalculating both cards.

The inventory sums component ranges solely to locate candidates for closer review. It deliberately does not rank the roster by total or use that total in AI/gameplay. Direction, resolution order, duplication, support needs, counters, and synergy can reverse the apparent ordering. Shields overlapping Bulwark are not fully additive; Piercing on multiple offensive rays can be more than additive. A powerful ability cannot be justified simply because its summed range fits an old card.

| Edge | Relative range | Main reason the range changes with context |
| --- | ---: | --- |
| Standard | 1 | Reference: ordinary movement and directional defense |
| Shield | 0.75–1.25 | Value depends on reaching and retaining a useful position |
| Double | 1.25–1.75 | Bypasses common defenses; no extra movement distance |
| Bite | 1.5–2.5 | Removal plus run attrition, limited by approach and destination |
| Swap | 1.5–2.5 | Exchanges control and changes the origin of subsequent edges |
| Hook | 1.25–2 | Two-space reach and allied setup, requiring a gap |
| Wave | 1.5–3 | Sparse floor, multi-target ceiling, friendly disruption |
| Shock | 1–2 | Timing, existing defenses, and future allied follow-up matter |
| Spines | 0.5–1.25 | Retaliation deters some attacks but does not retain the tile |
| Ram | 1.25–2.5 | Occupied lines, partial blocks, collateral effects |
| Follow Current | 1.75–2.75 | Combines displacement with self-entry |
| Bounce | 1.5–2.5 | Self-entry can work even without an attack target |
| Dive | 1.25–2.25 | Bypasses defenses for movement but needs a stepping stone |

| Full-card ability | Relative range | Critical dependency |
| --- | ---: | --- |
| Revelation | 0.25–0.75 | Remaining hidden choices and remaining turns |
| Rally | 0.25–1 | Enemy push, reserve depth, and another useful draw |
| Anchor | 1–2.5 | Reef access versus loss of friendly repositioning |
| Reefborn | 2–4 | Direct scoring access and last-play advantage |
| Bulwark | 2–4 | Arrival route and availability of ordinary counters |
| Piercing | 1–3 | Offensive edge count, reach, and lethality |
| Escort | 0.75–2 | Nearby allies with blank sides; fills their weaknesses |
| Ambush | 1.5–3 | Enemy adjacency and the attack sequence after shutdown |
| Wake | 1.5–3.5 | Ending position, nearby enemies, and unblocked landing tiles |
| Sovereign | 2–4 | Access and ability to retain the scoring tile |

The eight newer full-card abilities have no innate assignments in the live roster. Their ranges are explicitly uncalibrated; the pilot does not pretend to measure them. Add new mechanics as new rows with a named comparator and interaction questions, then rerun the relevant role comparisons. Avoid assigning a new mechanic a universal permanent cost.

## Regional learning progression

Separate **first introduction**, **continued availability**, and **strong combinations**. Early tools remain useful in later seas. Do not introduce a mechanic only through an obscure extremely rare creature, and do not give every creature in a later region every mechanic that has been unlocked.

| Region | Observed current edge introductions | Proposed innate ability introductions for a later assignment pass |
| --- | --- | --- |
| Shoreline | Standard, Shield, Hook, Double, Bite, Spines, Shock | Retain Revelation and Rally; introduce Escort only after basic allied placement is understood |
| Open Ocean | Wave, Ram, Follow Current, Bounce, Dive | Anchor and Wake: positioning commitment and control from the ending position |
| Bermuda | Swap; combinations of previously introduced mechanics | Reefborn, Bulwark, Piercing, Ambush, Sovereign: direct reef access, defense exceptions, and higher-payoff control |

Shoreline should teach Standard/Shield/Hook first, then its existing advanced effects. Existing acquisition tables do not guarantee that ordering; changing guarantees or weights belongs in the later content pass. Open Ocean's first unfamiliar cards should teach one new movement/line concept at a time. Bermuda should deepen a clear role with one unusual interaction, not serve as a dumping ground for four unrelated edges.

**Important existing exception:** Anchor Stone, Reef Beacon, and Duelist Pearl already grant Anchor, Reefborn, and Piercing through charms, which are not gated by this proposed innate ladder. Therefore the table is an innate-assignment proposal, not a claim that players cannot see those abilities earlier. A future decision must explicitly either keep charms as early previews or region-gate their offers as well. This PR changes neither. Additional future abilities can enter whichever region suits their complexity and role; leave room rather than spending every possible interaction now.

## Friendly harm as a deliberate tradeoff

Friendly pushes/pulls can be useful setup; they are not automatically friendly fire. Distinguish beneficial movement, forced displacement off a reef, killing an ally, and disabling useful allied edges. Preserve a harmful edge when it creates an understandable decision consistent with the creature's role.

A meaningful tradeoff must be visible, avoidable through some positioning choices, and costly in plausible desirable plays. It should not primarily punish the player for misunderstanding hidden edge order. Record whether the best useful play actually requires accepting the harm. Simply counting all possible bad placements greatly exaggerates the downside.

In this suite, most cards had many harmful legal placements but could obtain their best positive reef gain without allied death/Shock. Ocean Sunfish required that cost in 1/72 cases; the proposed Eel did so in 1/72. That does **not** earn all their harmful edges a global discount. It identifies a small set of concrete tradeoffs worth inspecting. Risk can also arise through losing an allied reef without casualties; the broader harmful-move count tracks that, while the forced-cost statistic deliberately covers only death/new Shock.

## Pilot decisions for ten creatures

All counts below are fixture observations, not win rates. Each candidate has 72 cases: twelve setup types on each board size with two setup orientations. Some cases repeat by symmetry. The method tests immediate control, one limited reply, and separate basic reef retention. It cannot by itself measure several-turn setup, information value, draft selection, or long-run attrition.

| Creature | Clear role to preserve or refine | Evidence | Decision before reshuffle |
| --- | --- | --- | --- |
| Minnow | Simple one-direction reef setter | Positive immediate gain in 34/72 cases | Keep as a teaching/reference anchor; compare broader setters on reach and actual collateral choices |
| Tidepool Blenny | Two-direction reef setter | 35/72 gains versus Minnow's 34; 46 harmful moves versus 16 | Do not assume twice the power because it has twice the Standard edges. Check orientation coverage beyond this suite |
| Boxfish | Reef holder requiring delivery | 0 immediate gains; 0 dislodges in 1,616 restricted basic reply placements | Preserve setup-dependent identity; test delivery cost, Piercing, and terrain. This probe does not establish invulnerability |
| Electric Eel | Formation-disrupting support | 0 immediate gains, but can newly shock an enemy in 42/72 cases; 153 harmful placements | Keep enemy shutdown as the identity. Compare one ordinary positioning edge instead of four Shock edges; do not label it useless from scoring alone |
| Sea Urchin | Retaliatory reef support rather than a guaranteed holder | 0 immediate gains; 45 dislodging basic replies, same as Eel | Highest priority role repair: Spines can kill the attacker after losing the reef. Test a small setup tool while keeping retaliation central |
| Ocean Sunfish | Directional lane clearer | 36/72 gains; 82 harmful placements; one best-gain case requires allied death/Shock | Keep directional area control with visible collateral risk. Check clustered and sparse school play before changing coverage |
| Yellowfin Tuna | Forward pursuit and reef entry | 31/72 gains; mean immediate gain 0.86, above the simpler setters in these fixtures | Keep a focused pursuit identity; test one-step control swings and end-position vulnerability |
| Flying Fish | Jumping reef-entry specialist | 31/72 gains; mean gain 0.43 | Preserve stepping-stone requirement; do not add random area effects just to match Tuna's average |
| Phantom Shark | Evasive predator; currently a mixed four-effect package | 72/72 gains, including empty boards; broad defensive coverage | Investigate Bounce-driven self-entry and edge order. Remove distractions only if they do not remove its intended counterplay |
| Invisible Ink Squid | Information support with a usable setter baseline | 35/72 gains; Revelation's information is not valued by the scoring probe | Keep readable support identity. Needs paired hidden-hand decisions/manual play to judge the ability's marginal value |

### Three isolated alternatives

These were simulation-only proposals at the time of the initial pilot. The [first follow-up batch](BALANCE_BATCH_1.md) adopts two after role-specific tests and retains full-Shock Eel. The comparison script now uses frozen pre-batch layouts so these historical results remain reproducible.

| Variant | Exact hypothetical change | Observed result | Interpretation |
| --- | --- | --- | --- |
| Sea Urchin setter proposal | Replace Down Spines with Down Standard; keep other Spines | Gains 0 → 36/72; dislodging replies 45 → 39 | A promising ordinary setup contribution, but it also improves defense on that side. Do not attribute the entire improvement to offense alone |
| Eel support proposal | Replace Left Shock with Left Standard | Gains 0 → 25/72; enemy-shock opportunities remain 42/72; harmful moves 153 → 144 | More independent without abandoning shutdown. Check whether combining shutdown and push is too efficient before adopting |
| Phantom predator proposal | Keep Up Bounce then Right Bite; remove Down Ram and Left Dive | Gains stay 72/72; dislodging replies 15 → 27; mean reply score improves −0.58 → −0.33 | Cleaner identity does not automatically mean weaker play. Removing edges changes later positions and the probe's chosen move. Inspect matched states rather than nerfing by edge count |

Relative component loads also illustrate the limitation: Boxfish is 3–5, Eel 4–8, and Urchin 2–5 despite all scoring zero immediately in this test. Phantom's live load is 5.5–9.75; its two-edge proposal is 3–5 while retaining its immediate access result. The totals are screening aids, not objective strength. Keep the initial component ranges provisional rather than fitting them to this small, purposefully biased fixture set.

## What this teaches us about the framework

Keep the role-first approach, but revise the “useful in two-thirds of positions” suggestion: it must be measured with a role-specific objective and denominator. A holder's useful setup cannot be equated with immediate score from deployment; information support needs an opponent decision. This generic stress suite cannot pass/fail that target.

Do not use the current measurements to globally rank creatures, nerf all self-movers, or buff every zero-score card. Retention tests assume free delivery; reply tests omit Shock, Swap, area effects, and innate abilities; greedy placement ignores future support. Worst-case replies use fixed hypothetical profiles, not actual AI or hidden hands. Empty-board Bounce gains deserve special attention because final-turn access can be strong without an enemy, but remain different from winning a full battle.

## Original recommendations and follow-up

1. Manually choose narrow primary identities for the 53 mixed packages, starting with Phantom Shark and similarly dense Bermuda cards. Preserve deliberate collateral effects; remove unrelated coverage only with a stated role reason.
2. Build follow-up positions for holder delivery, Spines retaliation, Shock-assisted allied turns, and Revelation information. Check final-turn access separately from early setup and swap acting order in actual paired battles.
3. Playtest the three isolated alternatives alongside their live versions in mixed regional schools, including relevant charm grants. Record exact positions and friendly harm accepted in useful plays.
4. Then propose a small content PR with the chosen assignments and explicit regional introduction rules. Only after that pilot should we reshuffle the wider roster.

Follow-up: the first two-card batch is recorded in [Balance Batch 1](BALANCE_BATCH_1.md). Remaining mixed packages, information support, charm interactions, and full paired battles still need their own review.

Colossals remain last. More edge and card abilities remain available as future design space; this inventory is a baseline to revise, not a closed list of permitted mechanics.

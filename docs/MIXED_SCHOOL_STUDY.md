# Mixed-school match study

Follow-up to [batch 1](BALANCE_BATCH_1.md), merged in PR #28. The study keeps both accepted changes and Electric Eel's full-Shock gimmick. The next two changes below are **proposals only**; no live creature definitions change here.

## Method and reproducibility

Run `node scripts/balance/match-report.mjs`. It generates [measurements](MIXED_SCHOOL_RESULTS.md) and full move traces in ignored `.cache/balance/matches.json` and `proposals.json`. Run `node --test tests/balance-matches.test.mjs` for harness regression checks.

The 768 baseline matches use 16 deterministic seeds, two fixed ten-card mixed schools per region, both acting orders, terrain on/off, and old/current focal definitions. The experimental side alone changes Sea Urchin in Shoreline/Ocean or Phantom Shark in Bermuda. The opposing school remains current. This isolates the focal change rather than changing both opponents at once. There are 128 matched pairs per region. The two proposal comparisons add 128 matches, reusing current baselines: **896 complete matches total**.

The headless harness calls the production resolver, regional AI, scoring, placement rules, terrain generator, refill, Rally and Revelation helpers. Both seats use the same AI through ownership reversal; the board is not rotated. Each match starts empty with healthy cards, five-card hands and five reserve cards, then runs all five/six/seven allowed plays per side or ends when neither can play. Identical cases share shuffled decks, terrain and per-turn decision seeds. The AI sees public catalog profiles and explicitly revealed cards, not the other hand or reserve. Public profiles follow the current production catalog sampling even in pre-batch comparisons.

Schools deliberately mix setters, holders, predators, movers and support. Ocean and Bermuda include retained early-region creatures. Exact schools are in `scripts/balance/matches.mjs`. This is fixed-school sampling, not the rarity-weighted distribution of real voyages. Tests cover complete termination, deterministic replay, unique draws, unchanged live data, proposed layout uniqueness and intended proposal interactions.

Limitations: no Tide Charm use, injury/deckbuilding decisions, human input, animations or voyage pacing. Revelation and Rally follow the existing rival policy; no special coaching teaches long support combinations. Each region uses its normal difficulty, so comparisons between regions also differ in AI strength. Terrain-free controls are diagnostic and not ordinary generated maps. Paired outcomes can diverge into different plays; a margin change is a whole-match policy outcome, not direct damage credited to one edge. Sixteen seeds and two schools do not establish universal win rates or statistical significance. Proposals reuse exploration seeds; a fresh seed set and human playtesting should precede adoption.

## Findings and decisions

### Sea Urchin: keep the new underside push

In Shoreline, current versus old was better in 8 pairs, unchanged in 120, worse in 0. Experimental-side use rose from 37 to 53 of 128 matches. With regional terrain, wins rose from 19 to 21 of 64 and losses fell from 10 to 8. Ocean was less decisive: 7 better, 116 unchanged, 5 worse; use rose from 19 to 33 of 128.

This supports useful early setup without claiming it dominates later schools. Example: Shoreline seed `MIXED-v1-4`, school 0, acting first, regional terrain changed a 0–1 loss into a 0–0 draw. The current Urchin was played at zero-based tile 16 and removed an enemy; the old Urchin was not selected. An active underside adds decisions while retaining the spiny identity. Keep its weights provisional and watch its defensive Standard side.

### Phantom Shark: keep the identity, acknowledge a real reduction

Bermuda had 30 better, 53 unchanged and 45 worse pairs. With terrain, experimental-school results changed from 27 wins / 18 draws / 19 losses to 19 / 21 / 24. Across both terrain conditions, its final reef occupancy fell from 27 to 7 of 128 experimental-side matches. Its use remained high: 117/128. The simpler version was the final play in 19 of those 117 uses, versus 4 of 127 old-version uses.

Removing Ram and Dive materially changes access and retention; this is more than reduced complexity. Example: Bermuda seed `MIXED-v1-0`, school 0, acting first, terrain changed a 0–1 loss to 0–2. Old Phantom gained immediate reef margin when played at tile 33; the new policy instead played it at tile 28, killing an enemy without an immediate margin gain. Do not infer direct causality from that single divergent sequence. Keep the clearer evasive predator for now, but do not use this result as justification to strip two mechanics from every dense card.

### Electric Eel: preserve the gimmick

Across both seats of the 384 current-definition matches, Eel was played 500 times out of 737 seat-matches where it was available. Those placements newly shocked 544 enemies and 15 allies. Only 4 plays improved immediate reef margin. These are whole-placement counts, including terrain; they are not all necessarily Eel-edge effects. Still, high selection and enemy shutdown support the role-specific finding: immediate points miss its purpose. No Standard replacement is proposed.

### Acting order needs attention before broad numerical buffs

Current experimental schools' mean reef margins when acting first versus second were −0.094 / +0.297 in Shoreline, −0.313 / +0.406 in Ocean, and −0.531 / +0.313 in Bermuda. These are balanced school/seed samples, not a proof of human second-player advantage. Final scoring, direct-access moves and the AI's short planning horizon are plausible contributors. Track order in future tests, especially last-turn Bounce. Do not add a compensation rule or globally buff holders based solely on this experiment.

## Proposed next small batch

Choose two modest reductions of unrelated coverage, preserving each creature's core sequence. Both remain Bermuda creatures; no earlier unlocks or new innate abilities are proposed. Existing Shock, Hook and Dive already have earlier introductions, while their combined sequencing remains advanced.

| Creature | Proposed layout, in resolution order | Creature identity and ordinary use | Cost / provisional relative load |
| --- | --- | --- | --- |
| Void Angler | Up Dive → Right Hook → Down Bite; remove Left Shock | Lure prey with Hook, reposition with Dive, attack exposed prey with Bite. The electrical flank is less central to an angler identity | Lose left shutdown and allied-Shock risk. Load 5–8.75 → 4–6.75 |
| Buoy Jelly | Up Wave → Right Shock → Left Bounce; remove Down Hook | A bobbing, stinging jelly: Wave moves nearby traffic, Shock threatens adjacency, Bounce supplies buoyant movement | Lose the unrelated downward pull and its defensive marker. Load 5.25–9.5 → 4–7.5 |

The numeric ranges are the existing relative component hypotheses, not strength scores. Keep collateral effects: Angler can bite allies and Buoy can shock/displace them. No new abilities are needed simply to fill blank sides.

Exploratory full-match results: Angler's proposal was better in 4 pairs, unchanged in 53, worse in 7; selection fell from 63 to 54 of 64. Buoy was better in 6, unchanged in 46, worse in 12; selection stayed 64/64. Both weaken the sampled school modestly and preserve useful role actions in dedicated tests. Neither is an established balance improvement. Buoy merits particular observation: the live version improved immediate margin on 123 of its 127 sampled plays, so removing Hook may simplify it without addressing strong self-entry.

Before implementation, use fresh seeds and human mixed-school games to check (1) Angler still finds useful lure/attack choices, (2) Buoy's final-turn access remains answerable, and (3) the loss of coverage does not make either a worse version of another creature. Layout uniqueness already passes, but tactical redundancy needs judgment. Keep Phantom unchanged during that next batch so its longer-term result remains interpretable. Colossals remain last.

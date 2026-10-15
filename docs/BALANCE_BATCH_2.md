# Balance batch 2: fresh seeds and charms

Follow-up to the [mixed-school study](MIXED_SCHOOL_STUDY.md). After fresh-seed testing, adopt two thematic reductions: **Void Angler loses Left Shock**, retaining Up Dive → Right Hook → Down Bite; **Buoy Jelly loses Down Hook**, retaining Up Wave → Right Shock → Left Bounce. No other creature or live turn-order rules change.

## Evidence and acceptance

[Generated measurements](CHARM_HOLDOUT_RESULTS.md) come from `node scripts/balance/charm-report.mjs`: 512 paired creature-comparison matches plus 192 turn-order diagnostics, 704 total. The creature study uses new seeds `CHARM-HOLDOUT-v1-0` through `7`, distinct from the earlier exploration seeds. All use Bermuda Expert, regional terrain, both starters and the existing two mixed schools. These are fresh seeds, not new school archetypes or human playtests.

Each comparison tests one candidate on the experimental side, with the opponent unchanged. Four three-charm loadouts cover all twelve charms. Player-only charm mode resembles the current game, where the rival does not consume inventory charms. Both-side charm mode is a symmetric stress experiment, not a new rival feature.

The study policy spends at most one usable charm before each fish play, prioritizing the study creature if present. It uses production charm helpers; Dredger sees only its permitted top three reserve cards; Spyglass reveals a random hidden card; Conch shuffles; Drift is used only for an immediate reef-margin gain. This is a deterministic stress policy, not optimal charm timing. Identical versions share charm inventories, seeds and priorities; effects may make subsequent play diverge. All twelve charms were consumed during the study. The event table includes card modifications, draws and reveals; Drift and Conch do not record a target creature, so zero in their target column does not mean the mechanic was untested.

| Candidate | Player-only charms, better/same/worse pairs | Both-side charms, better/same/worse pairs | Decision |
| --- | --- | --- | --- |
| Void Angler | 17 / 36 / 11 | 14 / 38 / 12 | Adopt: keeps the lure/reposition/predation role, useful in 63/64 and 58/64 proposed-version matches respectively |
| Buoy Jelly | 14 / 33 / 17 | 10 / 38 / 16 | Adopt as a modest reduction: keeps bobbing/stinging/area pressure, used in 64/64 and 63/64 respectively |

Acceptance means the proposed role remains usable with common battle modifiers and no integration failure was found. It does not mean both cards have equal strength, that every seed improves, or that win rates are balanced. Buoy's mean experimental-school reef margin fell from +0.359 to +0.328 with player-only charms and +0.203 to +0.063 with symmetric charms. This is an acknowledged cost, not hidden evidence of a buff. Angler's corresponding changes were −0.141 to −0.063 and −0.391 to −0.281. Revisit after human mixed-school play, especially late-game self-entry.

Blank sides remain meaningful until a charm fills them: Spear Shell, Coral Mail and Barbed Wreath now have room to modify these cards. Dedicated tests verify that they fill the missing sides without modifying persistent definitions; Reef Beacon grants legal direct reef placement and Anchor blocks forced movement. Existing unique-layout tests still pass. Relative component estimates remain Angler 4–6.75 and Buoy 4–7.5, hypotheses rather than objective power scores. Region, rarity, prices, sprites and innate abilities remain unchanged. These combinations remain advanced Bermuda sequencing; no new early-region mechanic is introduced.

## Save and report continuity

New voyages record `cardBalanceVersion: 2`. Version 1 voyages keep batch-one layouts, including old Angler/Buoy. Unversioned voyages keep pre-batch-one layouts, including old Urchin/Phantom. Future recruits, rivals, saved school cards and queued offers retain the appropriate versions. Historical match studies now explicitly use `BATCH_ONE_STARTERS`, so rerunning the earlier analysis does not silently use the newly balanced roster. Future changes must extend the relevant historical catalog overrides.

Browser check used production battle controls in an isolated fixture. Angler at C3 pulled Minnow E3 → D3 and bit Minnow at C4. Buoy at C3 pushed Minnow C2 → C1 and bounced C3 → D3, with no downward Hook. Updated descriptions showed exactly three edges. This was a controlled interaction check, not a full human voyage.

## Turn-order question

The [diagnostic table](CHARM_HOLDOUT_RESULTS.md) compares final-control alternating play, alternating initiative per round (AB, BA, AB…), first-player tie wins, and scoring control after each two-play round. Eight further fresh seeds, both school assignments and both starters yield 32 games per region/schedule. Tactical AI is used consistently here: Expert's forecast assumes an opposing next move and would be unsuitable for consecutive turns. The score-policy comparisons rescore the same games; the AI was not adapted to maximize accumulated points or tie wins. None is proof of how humans would play those rules.

- **First player wins ties:** Shoreline becomes 24 first-player wins versus 8 second-player wins. Ocean stays 13 versus 19, Bermuda 16 versus 16. One blanket tie rule does not consistently balance all regions and erases genuine draws.
- **Alternating initiative:** Ocean moves from 5 first wins / 8 ties / 19 second wins to 12 / 12 / 8. Bermuda remains 7 / 11 / 14. Consecutive turns also create burst combinations; odd/even round counts change who gets the final move. Not a universal fix.
- **Score after each round:** the same AI games rescore to 13 / 4 / 15, 5 / 3 / 24 and 5 / 3 / 24. Every checkpoint still follows the second move. Do not ship this naive form as a cure for last-move power.

### Recommended separate prototype: two tides

A match consists of two rounds with a board reset and swapped starting player. Combine reef points from both rounds; ties remain ties. Use equivalent starting schools, health, draw conditions and charm access in each round, and apply voyage casualties/rewards after the combined result. Each side receives one first action and one final response. This addresses unequal access to the final response structurally instead of assigning an arbitrary bonus.

This recommendation is not yet implemented or simulated as a new live match format. The existing paired tests already provide opposite-start legs, but a real two-round format needs UI, save/checkpoint, charm-consumption, injury and AI work. It does not guarantee equal win rates for different schools or skill levels. Resetting equivalent resources matters: carrying first-round losses into round two would reintroduce an order confound. The main tradeoff is duration; first prototype at current round length, then test shorter tides without assuming they preserve card value. Avoid awarding a half-point or extra final fish until there is evidence for its size and pacing cost.

Keep live turn rules unchanged in this creature PR. Next: prototype two tides separately, compare complete match duration and both-start results, then request human playtesting. Colossals remain last.

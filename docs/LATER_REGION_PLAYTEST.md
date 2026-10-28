# Later-region browser playtest — 2026-10-28

## Scope and decision

Three complete two-tide matches were played through browser controls, choosing moves from the visible hand, board inspection and combat log. This is an **agent-operated UI playtest**, not a human study or another automated policy sweep. It covers 32 player placements and six tides. No creature, economy, hydration, rival, turn-budget or boss retry rules changed.

Two observed clarity issues are fixed: regular draws say **tied match** rather than **tied tide**, and boss encounter/summary text explains that rematches retain the terrain and rival school while carrying injuries and spent charms forward. It recommends changing placements or reserving a counter. Summary guidance is omitted after boss victory or terminal defeat, when no rematch is available.

## Reproduction

Baseline: merged PR40, `a9fa4abab2623267ac6da7564e2037c6a677ab49`, roster version 6. Generate actual pre-combat saves rather than ideal decks:

```powershell
node scripts/balance/playtest-fixtures.mjs
npm.cmd run dev -- --host 127.0.0.1 --port 5175
```

Open `/king-of-the-reef/.cache/playtest.html` on that server. Use an isolated port without a real Voyage save. Loading a case replaces that origin's test save; the previous value is backed up once in session storage, and **Restore prior test save** restores it. Generated files remain ignored under `.cache` and are not part of the production build. Encounter capture receives a detached save and cannot mutate simulation state.

All cases use `ROSTER-VOYAGE-v6-0`, Tactical player simulation to reach the encounter, and no carried charms. Ocean battle/boss use recovery routing and 85% assumed catch success; Bermuda uses combat routing and 60%. Subsequent combat choices were made through UI controls, not simulation AI. Reproduce on this PR's revision because future gameplay changes can alter fixture generation.

| Case | Node | Opening healthy / resolve | Tide scores (player–rival) | Settlement |
| --- | --- | --- | --- | --- |
| Open Ocean battle | `ocean-2-0` | 12 / 3 | 2–1, 1–2; combined 3–3 | +6 shells; no resolve loss; Minnow and Flying Fish injured; 10 healthy |
| Ocean boss rematch | `ocean-18-0`, attempt 2 | 13 / 2 | 0–1, 0–1; combined 0–2 | No shells; resolve falls to 1; Minnow, Blenny and one Shrimp injured; 10 healthy; boss stays pending |
| Bermuda battle | `bermuda-2-0` | 8 / 2 | 0–2, 1–2; combined 1–4 | No shells; resolve falls to 1; one Shrimp and Sea Star injured; 6 healthy |

The boss fixture comes from a route that later capped on retries. Its played rematch ended in a loss, **not another reproduced draw**. Synthetic draw-preview buttons separately verify the revised summary UI; those scores are not counted as played matches.

## Observations

**Ocean:** Flying Fish at C1 was punished by Humpback Whale's Wave. Moving to the lower reef worked: Shrimp at B5 followed by Minnow at B6 put Shrimp on B4. Blenny at D5 followed by Anchovy at C5 claimed E5, winning tide one. In tide two, Dolphin and Flying Fish used Dive to contest B4; Double displaced Dolphin, and the rival answered. A final Anchovy delivery put Minnow on D1 to secure the combined draw. Basic starter tools remained useful; exposed setups and board-edge positions were punishable.

**Boss:** Wave punished the top-edge setup again. Anglerfish's Bite removed a lower Shrimp holder; Krill's Wave displaced a Sea Star holder. In tide two, Walrus's shield did not protect its open side from Hook; spending it early also left no Double in hand for the final exchange. These were tactical mistakes and counters, not proof of unfair creature strength. Returning to the map correctly retained the boss and reduced school, but the loss text only said casualties needed hydration without explaining the absence of recovery between attempts. The new guidance addresses that expectation. Different play produced different responses, so deterministic simulation retries must not be described as a literal UI deadlock.

**Bermuda:** Goby pushed Buoy Jelly off B4 through its Shock side; Anchovy displaced Void Angler through its open left side. The rival answered with Dive/Bite and Bounce. Sea Star's downward Hook delivered Goby from F7 to F6; Shock disabled its edges but did not remove its point. Crab placed on the F1 whirlpool pushed Minnow onto D1 **before** traveling to A2. The rival's later whirlpool entrance was blocked because Crab occupied the exit, with the reason shown in the log. A final Standard push into Bilge Eel's defending Bounce edge was correctly blocked. Self-entry and displacement were strong, but ordinary exposed-side counters existed.

These games contained preventable mistakes. They do not establish an optimal strategy, desired win rate or reason to weaken Wave, Dive, Bite or the rival. Eight healthy fish were sufficient for every Bermuda turn, yet the match was lost on positioning. Keep resource and roster values unchanged.

## Verification and limits

- Used the keyboard/text battle panel, hand descriptions, legal target selector, revealed-board inspection, reduced-motion toggle, next-tide button, summary and return-to-map flow. The first Ocean move also ran with animation enabled. No drag-input assessment is claimed.
- Observed the original 3–3 summary saying “A tied tide” despite individual tides of 2–1 and 1–2. Verified “A tied match” with the synthetic regular-draw preview.
- Verified rematch guidance on the boss encounter page and synthetic boss-draw summary. The dialog remains scrollable at the test viewport. Local screenshot `.cache/boss-rematch-guidance.png` records **synthetic UI verification**, not a played draw.
- Tests cover retained injuries/spending and boss pending state, advice after draw/loss versus victory/terminal defeat, ordinary draw rewards, and non-mutating encounter capture. `npm.cmd run verify` passed all 251 tests, workflow checks, type-check and build; the existing bundle-size warning remains.
- Three related-seed, charm-free cases do not cover other schools, terrain layouts, charm strategies, adaptive retries or human pacing. No independent human playtest was performed.

Next, have a human player try these cases and explain intended moves before committing them. Check whether exposed-side defenses, late self-entry counters and persistent rematch resources are understandable before tuning gameplay or adding school-management mechanics.

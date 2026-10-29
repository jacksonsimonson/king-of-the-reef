# Design Decisions

## 2026-10-28 — Shelve school selection; expand tactical items

Restore the pre-picker departure and New Voyage screens, including the original fixed starter school. Preserve existing saved cards and school metadata; retain the school definitions and evidence for later use. Add four consumable Tide Charms through the existing hand-targeted flow, with no new inventory category or permanent upgrades. Version the shop pool as 3 so prior four- and twelve-charm offers and purchase IDs remain stable. Keep new full-card ability concepts in the backlog until selected.

## 2026-10-28 — Reef-only starting schools

Offer three eight-creature packages: original Tidepool Guides, guarded Shellguard and precise Reef Tethers. All members are in the Reef pool; no Ocean exception is needed. Balance by membership and useful delivery/counterplay rather than modifying creature strength or giving unequal resources. Keep default callers and existing saved cards unchanged; optional school metadata records provenance only. Honor disabled rosters explicitly instead of silently swapping members. [Design, tuning evidence and limitations](STARTING_SCHOOLS.md) record the remaining modest Tethers matchup advantage and mixed Voyage outcomes.

## 2026-10-28 — Later-region playtest and rematch clarity

Keep gameplay values unchanged after three complete agent-operated browser matches using actual study-route saves. Ocean tied 3–3, the Ocean boss rematch lost 0–2, and Bermuda lost 1–4; ordinary positional counters existed and tactical mistakes mattered. Correct “tied tide” to “tied match” and explain unchanged boss terrain/rival school plus carried injuries/spending, without implying free recovery or a reroll. Show summary advice only while another boss attempt remains available. See [observations, fixtures and limits](LATER_REGION_PLAYTEST.md).

## 2026-10-14 — Regional rival difficulty and board progression

Use Beginner on Shoreline (5×5, five plays), Tactical in Open Ocean (6×6, six), and Expert in Bermuda (7×7, seven). Beginner evaluates immediate control, casualties and Shock with wider tie variation; Tactical adds proximity and defensive protection. Expert searches six promising moves against up to six revealed/public regional card profiles, taking the strongest predicted response into account. Hidden hand identities and reserve order are never supplied. This bounded forecast is a difficulty step, not an exhaustive solver or a promise of perfect play. All levels prioritize final reef scores when no opposing placements remain.

Seed 2–4/3–5/4–6 special tiles by region, counting both pool endpoints and excluding the three scoring reefs. Preserve readable approaches, unique positions, and usable channel exits. Scale reef coordinates, resolution, targeting, previews, logs, scoring and play limits together. Keep five-card hands and native card/tile sizes; enlarge the canvas and scroll. Quick Match opens a region/difficulty/size/plays popup, with regional defaults and independent overrides.

Persist battle rules and terrain seed with checkpoints. Older in-progress saves keep 5×5/five plays and their original terrain; future encounters adopt regional rules. Quick Match rematches retain setup; opening setup again creates a fresh terrain seed. These settings do not change voyage economy or map length.

## 2026-10-07 — Saved battles and longer voyages

Save only stable battle decisions, never animation frames. Persist charm consumption and effects together; preserve random-call position, temporary cards, reserve order, revealed hands, deaths, Shock and Rally/Revelation choices. Resume rival decisions automatically. Result processing removes the checkpoint before persisting rewards. Transient selection/targeting is canceled on reload without a spend. Storage failure is visible in combat.

Version new voyages separately from catalog versions: 19 columns instead of 13; guaranteed shops at 5/11, hydration at 6/12/17, and battle beats at 2/8/14. Keep old topology, stock and payouts for existing runs. Native-width scrolling avoids compressed maps. Lower single-use charm costs while keeping Reefborn/Piercing more expensive; give 24 starting shells and regional battle rewards of 14/16/18. Creature rarity still commands a premium. Next-region passage restores up to three casualties and one resolve so a longer journey does not compound attrition indefinitely. Keep school rules and five-placement budgets unchanged. Ocean zone weighting uses relative progress. A 300-seed, 54-stop scenario suite checks shopping, recovery and resource invariants with a loss every fourth ordinary battle and alternating casualties; this is not a claim of measured human win rates.

Full shops allow explicit replacement of one held slot. Confirmation shows both charms and the shell balance; cancel costs nothing. Exact slot indices distinguish duplicate charms and preserve legacy queued extras.

## 2026-10-07 — Expanded charms and reusable full-card abilities

Limit available charm inventory to three items, counting duplicates separately. Quick Match randomly draws three distinct charms. Block shop charm purchases at capacity without spending shells; preserve legacy excess purchases behind the first three available items until used.

Add eight charms focused on ordinary hand selection, positioning, edge upgrades and reef access, plus eight implemented abilities for later creature assignment. Preserve existing creature balance until assignments are chosen. Temporary charm grants stack with innate abilities and never alter the saved school. Targeted charms spend only after a valid selection; cancellation and ineffective upgrades cost nothing.

Version the deterministic shop charm pool per voyage. Existing saves keep the four original charm types and unchanged stock; new voyages use twelve. Ability behavior and timing live in [EDGE_EFFECTS.md](EDGE_EFFECTS.md), with charm usage in [SHOPS.md](SHOPS.md).

## 2026-10-07 — Lightweight agent workflow

**Solo refinement:** Default to one developer and one agent. Keep issues, separate worktrees, and independent reviews optional. Compact local verification output while retaining full logs, warnings, original failure codes, and every gate; keep verbose CI evidence. Measure instruction/discovery bytes and displayed output rather than claiming unmeasured token savings. Details and sources live in `AGENT_EFFICIENCY.md`, loaded only for workflow tuning.

**Decision:** Keep project rules in `AGENTS.md`, three focused workflows in committed `.agents/skills/`, and detailed contributor guidance in `CONTRIBUTING.md`. `CLAUDE.md` imports the shared rules for compatibility. Validate skill metadata, file links, instruction budgets, and GitHub YAML in the same CI gate as tests and build.

**Reasoning:** This starter project should demonstrate reviewable engineering and reduce repeated context. It has no planned commercial release. On-demand skills and targeted reads fit the current repository without a separate orchestration system.

**Deferred:** Per-module instructions until conventions diverge; skill junctions and MCP configuration generation until another client needs them; pre-commit hook packages until they add feedback beyond the fast local command and required CI; arbitrary coverage floors and scheduled AI chores without a demonstrated need. Keep durable decisions here rather than introducing a second decision-record system.

**Plan policy:** Save plans for substantial or multi-session tasks, with hazards, verification, and a next step. Routine edits do not need a plan file or an extra permission round for relevant documentation. Existing explicit approval before merging remains required.

## 2026-09-23 — Procedural voyages and Colossals

- Runs cross three left-to-right branching charts: Shoreline, Open Ocean and Bermuda Triangle.
- All charts are generated at run creation from a shared seed with region-specific weights and guaranteed encounter columns; see [VOYAGE.md](VOYAGE.md).
- Region-ending encounters are called **Colossals**, giant ocean creatures ruling parts of the sea. The user will design their identities later; current names and combat schools are provisional.
- Voyage tracks a persistent school, shells, three resolve, completed nodes and pending encounters in browser storage. Quick Match remains independent.
- Fishing currently offers regional catch selection; its timing minigame will be built later.
- Future work starts on a feature branch and merges after validation. The repository's AGENTS.md records this workflow.

## 2026-09-23 — Side-specific edge effects

- Standard, Double, Shield, Bigger Fish, Swap, Hook, and Wave are properties of individual card sides rather than whole-card text abilities.
- Standard and Double use arrows that rotate with their side. Every non-arrow ability icon remains upright on all four sides.
- Every side icon sits in a small opaque box centered on the card's outer edge, outside the creature's visible bounds.
- Weak Arrow is represented and named as Shield because it defends without applying force.
- Bigger Fish uses a bite symbol rather than an arrow-shaped mark.
- The complete prototype behavior and first five cards are recorded in [EDGE_EFFECTS.md](EDGE_EFFECTS.md).

## 2026-09-23 — Shoreline starter creatures and regions

- The roguelike progresses through three regions: Shoreline, Open Ocean, and Bermuda Triangle.
- The first expanded card pool uses familiar shoreline, tidepool, and reef creatures before later regions introduce stranger aquatic life.
- Crab uses left/up/right, Tidepool Blenny uses up/right, Shore Shrimp uses right/down, and Sea Star uses left/right.
- Octopus changes to left/down/right so Crab owns the upward three-arrow pattern.
- Gallery rows center independently, keeping partial rows visually balanced as the collection grows.

## 2026-09-23 — Standalone build and future game hub

- GitHub Pages remains the standalone deployment target for the current playable build.
- The long-term public entry point is `https://jackson-game-dev.cheme911.chatgpt.site/`, a shared Jackson Game Dev hub intended to host multiple games.
- The hub integration method—direct link, embedded build, or another publishing flow—will be chosen when the hub is ready to expose individual games.

## 2026-09-23 — Desktop-first battle layout

- Active development targets desktop play first. Mobile and narrow-screen optimization will follow after the main battle interface is established.
- Playable screens should use nearly the full available viewport rather than presenting the game as a narrow centered mockup.
- The battle board stays centered, with the player's hand, deck, and powerups on the left and the rival's equivalent areas on the right.
- The page-level Quick Match heading remains compact so the game surface receives most of the screen.
- Hand cards keep fixed slots after being played. A silhouette marks the used player slot, while a faded card back marks the used rival slot.
- Hand portraits render at an exact 2× scale (128×128) and board portraits at an exact 1× scale (64×64). The canvas and text always render 1:1 with browser pixels.
- Five-card hands use a centered three-over-two arrangement modeled after the Olympic rings.
- Each unplayed player card sits above its silhouette, so dragging it immediately reveals the used-slot treatment underneath.
- Main Menu, Quick Match, and Gallery use consistent full-height shells. Phaser canvases render at native size on every route to prevent route changes from resizing pixel art or text.
- Players can drag cards to legal water spaces. A translucent board-sized card previews the placement under the pointer.

## 2026-09-23 — Round hands and visible schools

- Each side draws five random healthy cards from its expanded starter school for a battle.
- A battle ends after both five-card hands have been placed, for ten total placements before final reef scoring.
- Undealt cards remain visible as player and rival decks so future powerups can shuffle a hand or reveal rival cards.
- Rival hands use card backs until played. Played cards remain face-up on the board, while used hand slots stay visible as silhouettes or faded card backs.
- Both sides reserve three visible powerup slots while the roguelike inventory and acquisition rules are developed.

## 2026-09-23 — Main-menu navigation

- The root view is a dedicated main menu rather than loading directly into a match.
- Quick Match and Gallery are separate hash-routed pages.
- Quick Match and Gallery do not link directly to one another. Each returns to the Main Menu, which owns top-level state transitions.
- Moving between pages intentionally destroys the active Phaser instance; match state is not preserved yet.
- General menu and navigation UI use deep ocean blue and ultra-green. Rival red, player blue, and pearl pink remain gameplay-specific colors rather than general interface accents.

## 2026-09-23 — Guaranteed edge-icon clearance

- Edge badges are centered on the outer card border and sized so they remain outside each creature's visible sprite bounds.
- Hand and gallery cards use 20-pixel badges; board cards use 14-pixel badges.
- Every badge uses an opaque deep-ocean backing and a high-contrast colored outline.
- This geometry belongs in the shared card renderer so battle and gallery cards remain identical.

## 2026-09-23 — Generated sprite production standard

- Use the approved red Octopus as the style and complexity reference.
- Generate one creature at a time, facing right, with natural species colors and a transparent background.
- Preserve each generated reference, then convert it through `scripts/prepare_generated_sprite.py` by collapsing each visible same-color source cluster into one logical pixel. Ordinary resizing and post-resize quantization are prohibited because they preserve noise or blur the art.
- Use no interpolation or soft alpha. Player art faces right; the renderer flips rival art left.
- Battle and gallery cards must use the same Phaser card-rendering function so their frames, arrows, scaling, and ownership colors remain identical.
- Side-profile creature sprites preserve at least one pure-white eye pixel on the visible side at native 64×64 size. Multi-eyed poses preserve each visible white eye. Front-facing or top-down creatures may show their anatomically appropriate number of eyes. Required per-species corrections are recorded in the conversion script so they survive regeneration.

This log records important choices and their reasoning.

## Browser-first development

**Decision:** Build King of the Reef as a browser game.

**Reasoning:** The current mechanics fit a 2D web game, browser deployment makes prototypes easy to share, and the project can grow substantially without requiring a native engine.

## Public GitHub development

**Decision:** Develop the project in a public GitHub repository.

**Reasoning:** Version history, documentation, playable releases, and incremental design work make the project useful as both a game and a professional portfolio piece.

## Small implementation batches

**Decision:** Add systems in independently playable batches.

**Reasoning:** The full vision is ambitious. Small batches make mechanics testable and produce a clear development history.

## Five-by-five battle board

**Decision:** Target a 5×5 board with three reefs for the next combat version.

**Reasoning:** The larger board supports maneuvering, formations, environmental effects, and specialized fish. Three objectives force prioritization rather than allowing one defensible scoring point to dominate every match.

**Risk:** More space could slow matches.

**Initial response:** Test a fixed turn limit, a modest hand size, and reef layouts that encourage early interaction.

## Reefs reached through movement

**Decision:** The planned rules should not allow fish to be placed directly onto reef spaces.

**Reasoning:** Requiring movement or pushing makes reef control a positional puzzle rather than a simple placement race.

## Avoid conventional health initially

**Decision:** Do not begin with standard attack and health statistics.

**Reasoning:** Directional control already provides a complete interaction system. Additional statistics should only be introduced if they create decisions that positioning cannot.

## Separate confirmed design from speculation

**Decision:** Maintain separate game-design, roadmap, and idea-backlog documents.

**Reasoning:** This preserves creative ideas without making every thought an implied commitment.

## Preserve the original prototype

**Decision:** Keep the recovered 4×4 browser prototype in Git history, but remove it from the current application once the scalable build reaches feature parity.

**Reasoning:** Git retains the project's real starting point without exposing an obsolete second version in the shipped game.

## 2026-10-07: Regional battle terrain

Add rocks and linked whirlpools plus two terrain types per sea. Use fixed layouts initially so rivals and rematches share readable rules. Terrain affects both players through the same combat resolver. See [terrain rules](TERRAIN.md). Favor effects that matter to everyday placement and reef control; replaced niche shock cleansing with a thermal vent eruption that moves neighboring cards. No save migration.

## 2026-10-08 — Combat feedback from resolver snapshots

Record optional snapshots from the existing combat resolver instead of recomputing visual outcomes. Only actual placements request them; rival simulations remain silent. Play each terrain/ability/edge stage before continuing the turn, with input locked during playback. Keep a bounded DOM combat log and a reduced-motion toggle. Movement within an individual multi-target edge is shown together; separate edge and terrain stages remain ordered. Audio integration can later use these same stages, but this change adds no sounds.
## 2026-10-07 — Original regional audio

Generate original PCM music and effects with Web Audio, without asset downloads or new dependencies. Shoreline has a bright major melody; Open Ocean uses a slower minor motif; Bermuda has a sparse, unsettled motif. Battles share a minor melody at 108/120/132 BPM, adding high percussion in Open Ocean and an offbeat bass layer in Bermuda. Each eight-bar score loops and fades between screens. Menu/gallery use Shoreline; encounters and fishing retain the current world's map theme. Quick Match uses the first battle arrangement.

An application-owned audio context survives Phaser scene/game destruction. Unlock on player interaction, suspend while the page is hidden, and store mute/music/effects preferences separately from voyage saves. Sound failures never prevent play. Only actual combat presentation frames trigger effects; prioritize removals, shock, movement, placement, blocked effects, then shields, with a six-voice cap. Reduced motion retains cues with repeat suppression. Music is a starter synthesized score; listening feedback should guide further instrumentation and mixing.

## 2026-10-15 — Regional events and optional learning/input paths

New voyages use event version 1: four deterministic choice structures with three regional presentations (twelve named encounters). Each has a useful no-cost option, explicit prices, and no hidden random failure. Risk costs resolve only when at least two remain. Trading exchanges exactly one selected fish for a shown healthy regional recruit, retaining school size. Recovery restores only the selected killed fish. Prior saves retain legacy event rules; seed/node offers remain stable across reloads.

How to Play is an independent eight-page main-menu dialog with Back, Next, Finish, Escape, and focus return. It does not start or alter a run. Native labeled battle controls provide keyboard card/target selection, descriptions, scores, charms, follow-up choices, and result actions using the same handlers as the canvas. A collapsible gallery browser provides descriptions and roster toggles. Native controls, visible focus outlines, and scrolling preserve unscaled pixel art. This adds keyboard access, not a claim of formal screen-reader certification.

## 2026-10-15 — Shared creature balance framework before Colossals

The owner requested a clear framework before reshuffling creature edges and abilities, with Colossals developed last. [Creature Balancing Guidelines](CREATURE_BALANCE.md) is now a linked chapter of [Game Design](GAME_DESIGN.md). It evaluates tactical roles, ordinary usefulness, access, disruption, defense, coverage, independence, future value, counterplay, and Voyage attrition. It covers every current edge and full-card ability and separates battle power from acquisition cost.

Regional edge-count budgets remain descriptions of prior assignments, not proof of balance. Ratings and proposed investigation thresholds are provisional; no measured balance results or automated comparison harness are claimed. Begin with a role inventory and a small pilot comparison batch. This documentation changes no card data or gameplay. Bespoke Colossal work is deferred until after the other intended main systems and ordinary roster are established.

## 2026-10-15 — Relative roster inventory and first balance pilot

PR #26 was merged with owner approval. The next pass inventories all 167 live creatures using explicit provisional role rules and revision-scoped relative component ranges, anchored to Standard = 1. The owner clarified that abilities should be introduced by region, each creature needs a clear role, friendly-harming edges can provide counterbalance, and future mechanics must remain possible. The [pilot](BALANCE_PILOT.md) records the current edge introduction ladder, a proposed innate-ability ladder, and existing charm exceptions; none is silently gated or reassigned.

An offline reproducible resolver probe compares ten unchanged cards and three isolated variants across board sizes and setups, with separate retention and friendly-harm measures. It does not claim full-battle win rates, role-complete usefulness, or objective weights. Counts of bad legal moves alone do not earn power discounts. Follow-up role-specific scenarios and manual play are needed before accepting changes. No live card definitions, acquisition, saves, or game behavior change. Colossals remain last.

## 2026-10-15 — First role-focused creature batch

Sea Urchin uses Down Standard with three Spines sides for allied reef setup and retaliation. Phantom Shark uses Up Bounce then Right Bite as an evasive predator, with blank lower/left approaches. Electric Eel keeps four Shock edges as an intentional thematic support gimmick. Role tests cover ordinary utility, counters, and friendly harm on all three board sizes. Relative weights remain provisional. New voyages record `cardBalanceVersion: 1`; earlier voyages retain pre-batch definitions for recruitment, opponents and previews. See [batch evidence and remaining limits](BALANCE_BATCH_1.md).

## 2026-10-15 — Charm-tested second creature batch

Adopt Void Angler without Left Shock and Buoy Jelly without Down Hook after fresh-seed charm comparisons. Preserve their core roles and existing voyages via balance version 2. [Batch 2](BALANCE_BATCH_2.md) records the modest strength tradeoffs and limits. Keep live turn-order rules unchanged: tie wins, snake initiative and naive round-end scoring do not consistently resolve the observed advantage. Recommend a separate two-tide prototype with swapped starters and equivalent round resources; it is not yet an accepted gameplay rule.

## 2026-10-15 — Optional two-tide prototype

Trial two tides in Quick Match, with 4/5/6 plays per side per tide by region with equivalent opening resources, swapped starters and additive scores. Three-play Shoreline produced too many draws in the fresh-seed study; four remains the Shoreline minimum; the requested regional progression adds one play per tide in each later map. Keep Classic default and Voyage unchanged. [Evidence and pacing limits](TWO_TIDE_PROTOTYPE.md) distinguish equal access to second move from proven human balance.

## 2026-10-15 — Voyage two-tide rollout

Use regional 4/5/6 tides for new Voyage battles and bosses. Preserve already-saved Classic battles. Snapshot the opening resources and save the intermission and both tide states. Settle the combined score once; union casualties across tides and consume the maximum copies of each charm used in either tide. The refreshed second-tide copy is not a second permanent charge. See [Voyage rules](VOYAGE.md#two-tide-battles). Human pacing remains a follow-up evaluation, not a claim established by simulation.

## 2026-10-15 — Full Voyage study and settlement summary

Run carried-school combat through real routes and economic settlement before changing resources. Across 192 runs, two-tide casualties increased but playable-school shortages were rare; deterministic boss repeats confound completion rates. Keep balance values unchanged and document the limitations in [the full study](FULL_VOYAGE_BALANCE.md). Show actual settlement in a post-match summary, including boss recovery and permanent charm consumption; preserve legacy-checkpoint uncertainty instead of inventing past spending.

## Collection journal and school inspection (2026-10-15)

- The journal records species recruited into Voyage schools, including starters, across runs in this browser. Shop/fishing previews, rival cards, Quick Match and Gallery browsing do not unlock entries. Existing saves contribute their current school; creatures released before this feature cannot be reconstructed.
- Discovery IDs use a separate local-storage key and do not change Voyage save schemas or card definitions. Storage failures keep discoveries in tab memory and show a warning when opening the journal. Clearing browser data clears the journal.
- School inspection preserves each owned copy's saved mechanics and health; journal entries show the current catalog. Both support search, region/rarity/role filters and comparison of two cards; school additionally filters health and summarizes ready/total copies by role. All healthy copies still enter the battle shuffle; this is inspection, not active-deck selection.
- Role labels are deterministic browsing aids derived from current edges/abilities, not the aspirational creature-role inventory or balance ratings. Spines-heavy cards are labeled Retaliator, not Defender. Update these guides when mechanics change; this feature does not rebalance the roster.

## 2026-10-15 — Roster coherence before starter choices

Complete the existing roster's thematic role and balance pass before implementing alternate starting schools. Ship small evidence-backed batches rather than one blind reshuffle; keep weights relative and revisable. Later creatures should deepen a clear role, not accumulate unrelated edges. Intentional gimmicks and meaningful friendly harm remain valid.

Current baseline: 167 creatures inventoried; ten received the initial focused pilot and two additional creatures (Void Angler/Buoy Jelly) received the follow-up candidate tests. Four have implemented changes: Sea Urchin, Phantom Shark, Void Angler and Buoy Jelly. Electric Eel was explicitly retained as a four-Shock gimmick. Thus 163 have not been changed by these balance batches, and 155 have not received those focused candidate studies. Neither count implies that all remaining cards need changes or that the tested cards are fully balanced. Whole-match and Voyage studies do not certify every participating creature. Current catalog coherence flags (three or more distinct edge effects): Shoreline 4/77, Ocean 15/47, Bermuda 33/43, total 52/167.

Each Colossal is planned to use a themed deck. Exclusive boss creatures and awarding one for the rest of the Voyage are possibilities to evaluate during that later work; see the [backlog](IDEA_BACKLOG.md#colossal-decks-and-creature-rewards). No boss implementation or card changes are part of this documentation update.

## 2026-10-15 — Shoreline crab roles, first systematic batch

Keep Hermit Crab as a simple shielded lateral setter. Reorient Horseshoe's Standard edge downward to separate its setup route from Hermit while opening its right flank. Give Pom-Pom a downward Standard setup tool alongside its two anemone Spines; its open top remains a safe enemy push approach. Reject a Hook addition that would exceed the existing Shoreline special-edge budget. Spines retaliates against enemies, not allies. Accept these provisional changes based on [role scenarios and paired two-tide evidence](SHORELINE_BATCH_1.md), with no rarity/price changes or claims of completed balance. New Voyages use balance version 3; older versions preserve their prior definitions.

## 2026-10-15 — Complete Shoreline as one regional PR

Expand the same PR to review all 77 Shoreline species, testing related families internally rather than requiring one PR per small batch. Adopt 11 layout changes in total and explicitly retain 66, with individually authored thematic roles and weaknesses. Add ordinary setup to passive bottom-dwellers, differentiate Blacktip's hunting axis, and give Boxfish a Standard seam that ordinary Double/Hook can deliver or counter. Keep the existing special-edge budget for normal creatures and an exact named Boxfish exception; do not weaken generic gates. Preserve full-Shock Eel and meaningful familiar mechanics. [Full decisions and evidence](SHORELINE_BALANCE.md) include seed-sensitive regressions, not only improvements.

Use balance version 4 for the expanded region, preserving version-3 crab-preview saves as well as older runs. Show reviewed identity notes only on journal/school copies matching current mechanics. Progress is 77/77 Shoreline reviewed, not a promise of perfect equal power. Open Ocean is the next regional pass; starter-school selection waits for the remaining regions, and themed Colossal decks remain last.

- 2026-10-15: Complete Open Ocean as one regional PR with seven internal test families: 47 authored roles, 11 layout changes and 36 explicit keeps. Simplify unrelated movement/line/strike packages; use shared Hook vocabulary for claws and tentacles. Preserve ordinary delivery/counters and deliberate Sea Mine gimmick. Relative component ranges remain provisional; two seed batches support the design decisions, not perfect equal power. New runs use balance version 5 while version 4 freezes all prior Ocean layouts. See [regional evidence and limitations](OPEN_OCEAN_BALANCE.md).

- 2026-10-15: Complete Bermuda in one regional PR, with six internal families and all 43 authored roles. Remove unrelated effect packages while retaining coherent spatial/movement gimmicks; claws use Hook, storms have usable setup, and Mimic Chest gains a common-school delivery/counter route. 23 layouts change and 20 remain. New voyages use balance version 6; version 5 freezes old Bermuda definitions. All 167 catalog entries now have reviewed roles, not a claim of perfect equal power. See [Bermuda evidence and limitations](BERMUDA_BALANCE.md).

- 2026-10-15: Validate complete Voyages against the finished version-6 roster with 96 runs across 12 shared seeds and paired route/player/fishing policies. Six of 1,232 matches began short of healthy cards, despite poor later-region results and accumulated injuries. Keep card, economy and hydration values unchanged: random recruitment, charm-first buying and non-adapting boss retries confound conclusions about those values. Record actual recruitment, spending, healing and regional school composition; recommend a deliberate school-building comparison next. See [current-roster findings and limits](FINISHED_ROSTER_VOYAGE_BALANCE.md).

- 2026-10-15: Compare baseline, deliberate recruiting, conservative Release-only trimming and both together on 24 paired map seeds (768 runs). Recruiting improves healthy-school availability but not consistently regional progression; trimming is seed-sensitive and does not improve total completions. Keep gameplay values unchanged. Composition coverage weights remain a simulation hypothesis, not card ratings or player-facing advice. See [protocol, evidence and limitations](DELIBERATE_SCHOOL_STUDY.md).


## 2026-10-29 — Twenty creature-led battle abilities

Implement all twenty approved hosts and edge tradeoffs as one PR, tested in internal rule and comparative batches. Use balance version seven and freeze version six for existing schools, recruits and rivals. Preserve ordinary board roles, one innate ability per host and the full-Shock Eel gimmick. Add no extra placements or permanent school mutations. Optional board choices preview the deterministic result before commitment; hidden-card decisions resolve afterward. Temporary growth, armor, Inflate usage, decoys, snares and reveals reset with the tide. Keep relative power ranges provisional; the [implementation study](BATTLE_ABILITY_IMPLEMENTATION.md) records opposing regional formation trends instead of claiming universal balance.


## 2026-10-29 — Keep scoring formations and Ocean edges after controlled follow-up

[5,760 fresh simulated tides and exhaustive attack/counter scenarios](SCORING_COVERAGE_STUDY.md) attribute most of the Shoreline scoring uplift to Reef Network while confirming ordinary routes to break its three-point Clownfish formation. Ocean remains weaker than its old armed mirror but near even against the other tested current schools. Small one-edge restoration prototypes give limited or seed-sensitive gains; Angler Bite also raises casualties and friendly-fire risk. Ship the reproducible study and regression tests without changing gameplay or save versions. Follow up on deliberate formation protection and Pelagic Octopus role usefulness in human play.

# Design Decisions

## 2026-09-23 — Main-menu navigation

- The root view is a dedicated main menu rather than loading directly into a match.
- Quick Match and Gallery are separate hash-routed pages.
- Moving between pages intentionally destroys the active Phaser instance; match state is not preserved yet.
- General menu and navigation UI use deep ocean blue and ultra-green. Rival red, player blue, and pearl pink remain gameplay-specific colors rather than general interface accents.

## 2026-09-23 — Generated sprite production standard

- Use the approved red Octopus as the style and complexity reference.
- Generate one creature at a time, facing right, with natural species colors and a transparent background.
- Preserve each generated reference, then convert it through `scripts/prepare_generated_sprite.py` by collapsing each visible same-color source cluster into one logical pixel. Ordinary resizing and post-resize quantization are prohibited because they preserve noise or blur the art.
- Use no interpolation or soft alpha. Player art faces right; the renderer flips rival art left.
- Battle and gallery cards must use the same Phaser card-rendering function so their frames, arrows, scaling, and ownership colors remain identical.
- Side-profile creature sprites use exactly one isolated white eye pixel on the visible side. Any required per-species correction is recorded in the conversion script so it survives regeneration.

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

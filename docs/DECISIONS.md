# Design Decisions

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

**Decision:** Keep the recovered 4×4 browser prototype in version history.

**Reasoning:** It documents the project's real starting point and provides a working reference during the transition to a scalable architecture.

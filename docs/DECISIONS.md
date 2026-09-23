# Design Decisions

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

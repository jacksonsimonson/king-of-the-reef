# Changelog

All notable playable changes to King of the Reef will be recorded here.

## 0.1.0 — Original prototype

- Created a playable 4×4 card-combat board
- Added directional fish-card pushing
- Added two objective spaces
- Added a basic computer opponent
- Added match scoring and rematches
- Preserved the original browser prototype in GitHub

## Unreleased

- Expanded Quick Match into a desktop-first, near-full-viewport battle layout
- Moved the player hand and deck left and the rival hand and deck right
- Added fixed hand slots with played-card silhouettes and faded used rival card backs
- Added card dragging and translucent legal-placement previews
- Kept creature art inside its card frame and rendered board portraits at half the hand-portrait scale
- Removed fractional canvas, text, and sprite scaling; hand portraits now render at 128×128 and board portraits at 64×64
- Arranged each five-card hand in a centered three-over-two formation
- Kept player-card silhouettes beneath live cards so they appear immediately during dragging
- Stabilized menu heights and removed Gallery canvas scaling during navigation
- Added randomized five-card round hands drawn from ten-card healthy starter schools
- Ended matches after both players place every card in their round hands
- Added visible player and rival decks, hidden rival card backs, and reserved powerup slots
- Added a dedicated main menu with Quick Match and Gallery options
- Split the main menu, quick match, and gallery into separate hash-routed views
- Standardized general menu and navigation UI around deep ocean blue and ultra-green
- Moved card arrows outside the sprite canvas and extended them beyond the outer card border
- Widened hand/gallery arrows by one pixel per side and routed all top-level page changes through the Main Menu
- Added project documentation and development roadmap
- Added the TypeScript, Vite, and Phaser foundation
- Preserved the original prototype in Git history, then removed it from the shipped application after reaching feature parity
- Added automated GitHub Pages deployment
- Replaced the temporary yellow-and-red foundation with an ocean-blue, aquatic-green, and pearl-pink palette
- Improved foundation-page text sizing and wrapping
- Planned 5×5 battle board with three reefs
- Sharpened the visual palette to deep navy, ultra green, and pearl pink
- Added four original 48×48 starter-fish sprites
- Added playable card selection, placement, directional pushes, reef scoring, a basic rival, and rematches to the Phaser build
- Redesigned fish cards as square, art-first tiles with darker inset portraits, uniformly sized edge arrows, and blue/red ownership borders
- Standardized fish sprites to a maximum 24-pixel source dimension and whole-number 3×/2× scaling for crisp hand and board portraits
- Added a permanent pixel-art production guide for consistent, fast sprite creation
- Rebuilt the starter fish as intentionally designed fixed-canvas 24×24 sprites
- Added a 24×24 Octopus complexity test with left, up, and right arrows
- Expanded card data and push resolution to support multiple directions per fish
- Recolored all animal sprites with natural species-appropriate palettes while reserving bright project colors for UI and objectives
- Added a creation-order card gallery with names and eight cards per desktop row
- Upgraded the permanent sprite standard from 24×24 to 32×32 for clearer eyes, fins, markings, and complex silhouettes
- Redrew all five starter creatures directly for fixed 32×32 canvases without detailed reference art
- Limited the starter sprites to seven-color palettes with simple silhouettes, large pixel clusters, and deliberately placed eyes
- Added reproducible, hand-authored 32×32 pixel-coordinate sources for every starter creature
- Enlarged board, hand, and gallery card portraits for exact 2× and 3× integer sprite scaling

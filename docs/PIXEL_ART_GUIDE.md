# Pixel-Art Sprite Guide

This guide keeps fish readable, consistently sized, and fast to produce.

## Source file

- Format: transparent PNG
- Canvas: exactly 64×64 pixels
- Visible bounds: normally 56–58 pixels along the longest dimension
- Padding: only enough transparent space to center the sprite on the fixed canvas
- Direction: face right by default
- Edges: hard pixels only; do not use antialiasing or soft transparency
- Card frame, ownership border, and directional arrows: never include these in the sprite

The approved visual reference is the red Octopus. New creatures should match its chunky clusters, clean dark outline, readable face, limited shading, strong silhouette, and amount of detail. Generate each species independently as a transparent, right-facing pixel-art creature using the Octopus only as a style reference. Do not ask image generation to draw the card frame, ownership color, arrows, text, scenery, or shadow.

The generated reference is not used directly. Preserve it under `art/source-references/`, then run `scripts/prepare_generated_sprite.py` to produce the game asset. The conversion crops visible content, hard-thresholds transparency, fits the creature inside a 58-pixel visible limit, uses nearest-neighbor resizing only, reduces the image to seven opaque colors, centers it on a transparent 64×64 canvas, and never interpolates pixels.

Example:

```powershell
python -m pip install Pillow
python scripts/prepare_generated_sprite.py art/source-references/minnow-generated.png public/assets/fish/minnow.png
```

## Color

Fish and other animals use recognizable natural coloration for their species. Do not force sprites into the interface palette.

The project palette belongs to the surrounding UI:

- Player border: blue
- Rival border: red
- Pearl objectives: shiny pink
- Board and interface highlights: ultra green
- Backgrounds and sprite outlines: deep ocean navy

Use a restrained set of natural colors within each sprite so it remains readable at native 1× size. The starter-creature target is eight total colors: seven opaque colors plus transparency. Species identification takes priority over matching the interface.

## Runtime scaling

The renderer automatically chooses a whole-number scale based on the fixed 64×64 canvas:

- Hand portrait: the complete canvas renders at exactly 2×, producing 128×128 pixels
- Gallery portrait: the shared renderer uses the largest whole-number scale that fits the selected card size
- Board portrait: the complete canvas renders at exactly 1×, producing 64×64 pixels

Whole-number scaling means every original pixel becomes an exact square:

- 2× becomes 2×2 pixels
- 3× becomes 3×3 pixels
- 4× becomes 4×4 pixels

Never use fractional scaling for fish sprites.

## Export checklist

1. Confirm the background is transparent.
2. Confirm the canvas is exactly 32×32 pixels.
3. Center the sprite and keep its longest visible dimension near 56–58 pixels.
4. Confirm the image is crisp at 1× zoom.
5. Confirm that the palette is intentionally limited to roughly eight total colors including transparency.
6. Confirm that the creature faces right in the source file. The renderer flips only rival-owned cards to face left.
7. Preserve the generated source reference under `art/source-references/`.
8. Save the processed PNG under `public/assets/fish/`.
9. Test it in the battle hand, on the board, and in the gallery.

## Complexity test

The three-arrow Octopus is the approved style and complexity reference. Its mantle, eyes, separated tentacles, highlights, and compact silhouette must remain readable at native 1× size. If a future creature cannot meet that standard, simplify its pose rather than increasing the production resolution.

## Eye guideline

- Tiny fish: at least one high-contrast eye cluster with a distinct surrounding face color
- Typical fish: a dark pupil and optional highlight that remain distinct at native resolution
- Large-eyed species: preserve a readable pupil, surrounding eye color, and highlight
- Two-eyed poses: keep both eyes separated at native 1× size

Eyes must remain identifiable on the 64×64 source before testing the enlarged card render.

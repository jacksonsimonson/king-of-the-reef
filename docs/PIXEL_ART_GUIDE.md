# Pixel-Art Sprite Guide

This guide keeps fish readable, consistently sized, and fast to produce.

## Source file

- Format: transparent PNG
- Canvas: exactly 32×32 pixels
- Visible bounds: normally 28–30 pixels along the longest dimension
- Padding: only enough transparent space to center the sprite on the fixed canvas
- Direction: face right by default
- Edges: hard pixels only; do not use antialiasing or soft transparency
- Card frame, ownership border, and directional arrows: never include these in the sprite

Design directly on the 32×32 grid. Do not create a large illustration and shrink it afterward. The extra room is specifically for readable eyes, fins, markings, and species-defining anatomy—not smooth edges or unnecessary noise.

## Color

Fish and other animals use recognizable natural coloration for their species. Do not force sprites into the interface palette.

The project palette belongs to the surrounding UI:

- Player border: blue
- Rival border: red
- Pearl objectives: shiny pink
- Board and interface highlights: ultra green
- Backgrounds and sprite outlines: deep ocean navy

Use a restrained set of natural colors within each sprite so it remains readable at native 1× size. Species identification takes priority over matching the interface.

## Runtime scaling

The renderer automatically chooses a whole-number scale based on the sprite's longest dimension:

- Hand and gallery portrait: the complete 32×32 canvas renders at exactly 3×, producing 96×96 pixels
- Board portrait: the complete 32×32 canvas renders at exactly 2×, producing 64×64 pixels

Whole-number scaling means every original pixel becomes an exact square:

- 2× becomes 2×2 pixels
- 3× becomes 3×3 pixels
- 4× becomes 4×4 pixels

Never use fractional scaling for fish sprites.

## Export checklist

1. Confirm the background is transparent.
2. Confirm the canvas is exactly 32×32 pixels.
3. Center the sprite and keep its longest visible dimension near 28–30 pixels.
4. Confirm the image is crisp at 1× zoom.
5. Save the PNG under `public/assets/fish/`.
6. Test it in both a hand card and a board card.

## Complexity test

The three-arrow Octopus is the reference for a complex 32×32 design. Its mantle, eyes, separated tentacles, highlights, and compact silhouette must remain readable at native 1× size. If a future fish cannot meet that standard, simplify its pose before considering a different resolution.

## Eye guideline

- Tiny fish: at least one high-contrast eye pixel with a distinct surrounding face color
- Typical fish: a 2×2 eye area, with a dark pupil and optional one-pixel highlight
- Large-eyed species: a 3×3 or 4×4 eye area with a readable pupil and highlight
- Two-eyed poses: keep both eyes separated at native 1× size

Eyes must remain identifiable on the 32×32 source before testing the enlarged card render.

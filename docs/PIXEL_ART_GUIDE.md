# Pixel-Art Sprite Guide

This guide keeps fish readable, consistently sized, and fast to produce.

## Source file

- Format: transparent PNG
- Canvas: tightly cropped to the visible fish with no transparent padding
- Maximum dimension: 24 pixels
- Recommended horizontal-fish width: 21–24 pixels
- Direction: face right by default
- Edges: hard pixels only; do not use antialiasing or soft transparency
- Card frame, ownership border, and directional arrows: never include these in the sprite

The source can be smaller than 24 pixels in either dimension. Do not enlarge the source file merely to reach 24×24, and do not distort its proportions.

## Palette

Use a small subset of the project palette plus species-specific colors:

- Deep navy: `#00233A`
- Ultra green: `#39FF14`
- Pearl pink: `#FF5CA8`
- Pale mint: `#B8FFD0`

Each fish should remain recognizable at its native 1× size.

## Runtime scaling

The renderer automatically chooses a whole-number scale based on the sprite's longest dimension:

- Hand portrait target: 72 pixels, normally 3× for a 21–24 pixel sprite
- Board portrait target: 48 pixels, normally 2× for a 21–24 pixel sprite

Whole-number scaling means every original pixel becomes an exact square:

- 2× becomes 2×2 pixels
- 3× becomes 3×3 pixels
- 4× becomes 4×4 pixels

Never use fractional scaling for fish sprites.

## Export checklist

1. Confirm the background is transparent.
2. Remove all empty padding around the visible fish.
3. Confirm the longest dimension is no more than 24 pixels.
4. Confirm the image is crisp at 1× zoom.
5. Save the PNG under `public/assets/fish/`.
6. Test it in both a hand card and a board card.

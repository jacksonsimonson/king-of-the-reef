---
name: reef-pixel-art
description: Prepare or revise King of the Reef creature sprites using the approved source-art and pixel conversion workflow. Use for sprite assets, not general UI styling or unrelated image generation.
---

# Reef pixel art

Paths below are relative to the repository root. Read `docs/PIXEL_ART_GUIDE.md` before changing assets; it is the authoritative art specification, not this skill.

1. Identify whether the input is generated reference art or an already pixel-authored user asset. Inspect the actual image and its dimensions before choosing a conversion. Preserve the original under the appropriate `art/source-references/` location.
2. For generated references, use the approved reference and `scripts/prepare_generated_sprite.py`. Read its command help before invoking it. Measure cluster size if the source differs from existing examples; ordinary image resizing does not replace cluster collapse.
3. For user-authored pixel art, preserve intentional pixels and follow the source-specific guidance already recorded with that collection. Do not pass a finished 64x64 sprite through the generated-cluster converter. Disclose deviations from the default guide rather than silently redesigning supplied artwork.
4. Save the runtime PNG under `public/assets/fish/` with its existing texture ID. Check canvas size, alpha values, opaque palette count, visible bounds, and orientation against the applicable specification. Use existing inspection scripts where applicable instead of recreating conversion logic in chat.
5. Inspect the result at 1x and the affected in-game card views. Whole-number enlargement may aid inspection; keep native canvas and text sizing. Compare silhouette and key species features with the source.

Only load the source images and scripts needed for the requested species. Avoid batch-regenerating approved art to fix a single asset. Report source/output paths, conversion parameters, objective checks, and any visual check still needed. Image generation tools are for source creation/editing; the repository converter performs the established deterministic preparation step.

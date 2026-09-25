# Reef Art Expansion

This is an art-first expansion. New creatures appear as framed cards in the Gallery, labelled **Art Preview**, with empty edges and no card abilities. Rarity, fishing patterns, regional weights, and battle availability are deferred until the balance pass. They are intentionally separate from the playable roster and cannot alter saved Voyages.

The approved 50-creature backlog was checked against `starterFish.ts`. Hermit Crab, Lionfish, Mantis Shrimp, and Pufferfish already exist and are excluded. The remaining 46 species have unique IDs and asset paths. Distinct relatives such as Hawksbill/Green Sea Turtle and Clown/Titan Triggerfish remain separate species.

Art uses transparent 64×64 sprites with binary alpha and nearest-neighbor 128×128 display. Creatures without a visible face have no invented cartoon eyes. Fine anatomical light sensors or arm-tip eyespots are not rendered as a central pair of eyes.

The cleanup pass reduces scattered speckling into larger connected color areas, while retaining identifying shell patterns, spots, fins, and tentacles. Edited sources and prompts are preserved in `art/source-references/reef-cleanup/`. The same no-cartoon-face rule also applies to the existing Sea Star, Sea Urchin, and Crown-of-Thorns artwork.

Anatomy reference: [Smithsonian overview of echinoderms](https://ocean.si.edu/ocean-life/invertebrates/sea-stars-urchins-and-relatives), including the distinction between arm-tip eyespots and a face.

Source images and generation prompts: `art/source-references/reef-foundations/`.

Card definitions: `src/game/data/reefArtCards.ts`.

Preparation and visual review: `scripts/prepare_reef_foundations.py`.

Both turtle cards use user-supplied 64×64 sprites in `art/source-references/user-supplied/`. The Green Sea Turtle is horizontally mirrored to face right; the Hawksbill already faces right. No eye, palette, or drawing changes are added to either supplied sprite.

The Stingray also uses its supplied 64×64 sprite unchanged.

Twelve additional cards use user-supplied sprites as their direct source. The Remora is the sole exception to unchanged orientation: its source is horizontally mirrored to face right. The preparation script adds no eye, palette, or drawing changes to supplied artwork.

All directional source art faces right. Cowrie Snail, Crown Conch, Epaulette Shark, Porcupinefish, and Queen Angelfish are horizontally mirrored by the preparation script because their generated sources faced left. Direction-neutral and front-facing creatures are left in their natural orientation.

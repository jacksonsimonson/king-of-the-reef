# Reef Art Expansion

This is an art-first expansion. New creatures appear as framed cards in the Gallery, labelled **Art Preview**, with empty edges and no card abilities. Rarity, fishing patterns, regional weights, and battle availability are deferred until the balance pass. They are intentionally separate from the playable roster and cannot alter saved Voyages.

The approved 50-creature backlog was checked against `starterFish.ts`. Hermit Crab, Lionfish, Mantis Shrimp, and Pufferfish already exist and are excluded. The remaining 46 species have unique IDs and asset paths. Distinct relatives such as Hawksbill/Green Sea Turtle and Clown/Titan Triggerfish remain separate species.

Art uses transparent 64×64 sprites with binary alpha and nearest-neighbor 128×128 display. White eye highlights are checked at both sizes. Existing artwork is preserved.

Source images and generation prompts: `art/source-references/reef-foundations/`.

Card definitions: `src/game/data/reefArtCards.ts`.

Preparation and visual review: `scripts/prepare_reef_foundations.py`.

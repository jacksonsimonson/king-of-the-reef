# Open Ocean Card Foundation

The Open Ocean expansion begins with a deliberately varied roster of iconic animals rather than several near-identical species. The single tuna is Yellowfin Tuna. Sailfish and Blue Marlin are both retained as provisional billfish while the complete art roster is reviewed. The existing Ocean Sunfish remains part of this region and is not duplicated.

`src/game/data/openOceanCards.ts` is the canonical art intake manifest. Every planned creature already has a stable ID, future PNG filename, map zone, gallery type, and provisional rarity. New artwork should be a transparent, right-facing 64×64 PNG placed at `public/assets/fish/<texture>.png`, following `PIXEL_ART_GUIDE.md`.

These cards are **not playable yet**. They remain separate from `STARTERS` and the Open Ocean encounter pool until their artwork and edge layouts are approved. This prevents missing textures, unfinished cards, and save-file changes while art arrives. The manifest's rarity values are organizational starting points for the later balance pass.

The supplied art batches currently cover 33 creatures across the Continental Shelf and Polar Current, with Arctic Cod intentionally still awaiting art. These sprites appear in the Creature Gallery as art previews but remain absent from the Battle Roster and all gameplay until the combat-design pass. The Whale Shark, Paper Nautilus, Emperor Penguin, and Atlantic Puffin sources faced left and are horizontally mirrored for the game; every other sprite is shipped exactly as supplied.

## Planned distribution

| Zone | Purpose | New cards |
| --- | --- | ---: |
| Continental Shelf | Bright pelagic water and recognizable surface animals | 19 |
| Polar Current | Cold-water creatures, ice wildlife, and polar icons | 15 |
| Midnight Trench | Bioluminescent and pressure-adapted deep-sea creatures | 10 |

The planned manifest contains 44 new cards. Ocean Sunfish is already implemented, giving this provisional Open Ocean pass 45 represented creatures before final cuts.

## Art intake

1. Save the untouched source image under `art/source-references/user-supplied/open-ocean/` using the texture ID.
2. Prepare a transparent 64×64 right-facing sprite without interpolation or fractional scaling.
3. Add the finished sprite to `public/assets/fish/` under the exact manifest filename.
4. Approve its edge layout and fishing movement.
5. Promote the card into the playable roster and the appropriate Open Ocean acquisition pool.

Existing saved Voyages must retain their original pool. Activation will therefore require an Open Ocean pool version, following the Reef pool-version pattern.

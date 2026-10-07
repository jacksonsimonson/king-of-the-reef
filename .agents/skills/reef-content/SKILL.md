---
name: reef-content
description: Add or change King of the Reef fish cards, regional pools, or catalog entries while preserving playable integration and saved runs. Use for card content work, not unrelated UI changes.
---

# Reef content

Paths below are relative to the repository root. Read only the requested region's design document and data files; use an existing neighboring card as the implementation example.

| Region | Design | Data entry points |
| --- | --- | --- |
| Shoreline | `docs/REEF_CARDS.md` | `src/game/data/reefArtCards.ts`, `reefDesigns.ts`, `reefPool.ts` in the same directory |
| Open Ocean | `docs/OPEN_OCEAN_CARDS.md` | `src/game/data/openOceanCards.ts`, `oceanDesigns.ts`, `oceanPool.ts` in the same directory |
| Bermuda | `art/source-references/user-supplied/bermuda/README.md` and the provisional assignments in the data | `src/game/data/bermudaCards.ts`, `bermudaDesigns.ts`, `bermudaPool.ts` in the same directory |

- Trace the card's texture ID through `starterFish.ts`, `galleryCatalog.ts`, `roster.ts`, the regional pool, and `src/game/fishing/model.ts`. Some integrations are derived automatically: inspect them, do not duplicate registration.
- Preserve existing IDs, saved roster choices, seeded offers, and legacy pool/version behavior. A rename of display text is different from a persisted ID migration.
- New edge mechanics also touch `src/game/combat.ts` and `docs/EDGE_EFFECTS.md`; test meaningful interactions with existing defenses and board boundaries.
- Confirm the matching asset in `public/assets/fish/`. For asset creation or editing, read `docs/PIXEL_ART_GUIDE.md` and use the reef-pixel-art procedure.
- Run the affected regional test plus relevant gallery, roster, fishing, or save tests. Update catalog-count assertions only after checking that every intended new card is represented exactly once; do not blindly replace failing expected values.
- Finish with full verification for code/data edits. For visual changes, inspect the affected card at native board scale and in its larger views when browser access is available. Report any unperformed visual check.

Acceptance evidence: the requested card exists once, is obtainable in its intended region, displays correctly, resolves its rules, and preserves applicable save behavior. Report provisional balance decisions explicitly.

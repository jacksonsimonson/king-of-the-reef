# King of the Reef

Solo learning/portfolio game; no planned commercial release. Reuse existing helpers and conventions.

- Use a `codex/` branch. Validate, allow requested playtesting, then open a PR. Merge only with explicit approval of that PR; never bypass protections.
- Gameplay: mechanics must create meaningful choices in ordinary play, especially positioning and reef control; avoid niche effects dependent on rare cards/statuses.
- Pixel art: whole-number scales. Canvas/text: native size. Use layout/scrolling instead of fractional scaling.
- One agent by default; use extra worktrees, issues, plans, or reviews only for a concrete need.
- Search narrowly with `rg`; read relevant ranges and skills once, then only changed/missing context. Avoid dumping catalogs, archives, lockfiles, or passing logs.
- Node: `.node-version`. Windows: `npm.cmd`. `npm run verify`: config, tests, build; compact output/full logs. Iterate with the affected test file; full check after final relevant edit. Prose: diff/links. Skills: `npm run check:workflow`.
- Fix failing gates; never skip or weaken them. Read saved diagnostics before retrying unchanged failures. State blocked/untested work.
- Update only affected docs: `docs/DECISIONS.md`, `docs/ROADMAP.md`, `docs/IDEA_BACKLOG.md`. Report result, checks, next action; explain more when useful for learning.

| Task | Entry point |
| --- | --- |
| Combat | `src/game/combat.ts`, `docs/EDGE_EFFECTS.md` |
| Voyage/saves/shops | `src/game/run/`, `docs/VOYAGE.md`, `docs/SHOPS.md` |
| Fishing | `src/game/fishing/`, `docs/FISHING.md` |
| Cards | `.agents/skills/reef-content/SKILL.md` |
| Sprites | `.agents/skills/reef-pixel-art/SKILL.md` |
| Validate/PR | `.agents/skills/reef-verify/SKILL.md` |

Read `CONTRIBUTING.md` for setup/handoffs; `docs/AGENT_EFFICIENCY.md` only when tuning workflow.

# Project workflow

- King of the Reef is a learning and portfolio project, not a planned commercial release. Optimize for small playable changes and demonstrable engineering practices.
- Begin each change on a `codex/` feature branch, never directly on `main`.
- Validate the feature and let the user test when requested, then open a pull request. Never merge until the user explicitly approves that PR. Never bypass remote protection rules.
- Keep pixel artwork at whole-number scales. Canvas and text render at native size; use layout changes or scrolling instead of fractional scaling.

## Context and validation

- Read only the relevant design document and implementation. Use targeted `rg` searches; do not load the entire docs folder, card catalog, source-art archive, or successful test logs by default.
- Use `npm.cmd` on Windows (`npm` elsewhere). Runtime version: `.node-version`. `npm run verify` checks agent/GitHub config, runs tests, and type-checks/builds; use it before handing off code, data, or workflow changes.
- During iteration, run the affected test file first. After the final relevant edit, run full verification once; repeat only if changes or failures justify it. For prose-only edits, check links and the diff instead of rebuilding the game.
- Keep durable decisions in `docs/DECISIONS.md`, accepted work in `docs/ROADMAP.md`, and speculative ideas in `docs/IDEA_BACKLOG.md`. Update only documents affected by the task.
- Put reusable task procedures in `.agents/skills/`; keep this file short. Do not reread unchanged references or duplicate their contents in skills.
- Fix failing checks at their cause; do not skip gates or weaken assertions to get green. Report blockers and unperformed checks plainly.
- Reuse surrounding helpers and conventions. For substantial multi-session work, keep a compact plan with risks, decisions, verification, and the next unfinished step; see `CONTRIBUTING.md`.

## Task entry points

| Work | Start here |
| --- | --- |
| Combat rules | `src/game/combat.ts`, `docs/EDGE_EFFECTS.md` |
| Voyage, saves, shops | `src/game/run/`, `docs/VOYAGE.md`, `docs/SHOPS.md` |
| Fishing | `src/game/fishing/`, `docs/FISHING.md` |
| Fish/card content | `.agents/skills/reef-content/SKILL.md` |
| Sprite preparation | `.agents/skills/reef-pixel-art/SKILL.md` |
| Validation and PR handoff | `.agents/skills/reef-verify/SKILL.md` |

Contributor setup, token-efficient task examples, and GitHub configuration are in `CONTRIBUTING.md`; read the relevant section when needed.

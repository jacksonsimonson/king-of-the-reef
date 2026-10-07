# Working on King of the Reef

This is a learning and portfolio game. The goal is to practice understandable design, small reviewed changes, reproducible checks, and a playable demo. There is no planned commercial release.

The owner is the sole developer for the foreseeable future. Default to one agent and one focused branch. Use PRs for a readable history and validation evidence; issues, extra worktrees, and independent reviews are optional tools for real needs. No team ceremonies, assigned reviewers, or artificial approval counts are required.

## Setup and checks

Use the Node version in `.node-version` (also used by both GitHub workflows). Install it with your preferred Node installer/version manager; the version file alone does not change your local runtime.

```powershell
node --version
npm.cmd ci
npm.cmd run dev
```

Use `npm` instead of `npm.cmd` on macOS/Linux. `npm ci` installs the committed lockfile; use `npm install` when intentionally updating dependencies and commit the resulting lockfile.

```powershell
# During iteration: run the affected test file.
node --test tests/shop.test.mjs

# Fast check for agent instructions, skills, and GitHub YAML.
npm.cmd run check:workflow

# Inspect standing instruction and skill-discovery sizes.
npm.cmd run context:budget

# Before a code/data/workflow handoff: configuration, tests, type-check, and build.
npm.cmd run verify
```

Local verification prints compact results, preserves warnings and failure exit codes, and saves complete logs plus output-byte measurements in `.cache/verify/`. Use `npm.cmd run verify -- --verbose` for full terminal output; CI uses full output automatically. No successful checks are cached or skipped.

Browser playtesting is currently manual. Record what you actually exercised; passing logic tests does not prove that layout, drag input, or pixel art looks correct. Prose-only changes need a diff/link check rather than a game rebuild.

## Small changes with review evidence

1. Start a `codex/` feature branch from current `main`; use a separate worktree for independent work when another feature is in progress.
2. State the behavior or learning goal and a few observable acceptance criteria. Use an issue for work that benefits from tracking; a typo does not need one.
3. Implement a small coherent change. Add meaningful regression coverage for changed rules; avoid tests that merely repeat implementation details.
4. Validate, inspect the diff, and let the owner playtest before opening the PR when requested.
5. Open a focused PR with the problem, change, actual checks, and relevant limitations. Wait for explicit owner approval of that PR before merging. Do not bypass protections or enable automatic merging in place of approval.

Keep speculative ideas in `docs/IDEA_BACKLOG.md`, accepted milestones in `docs/ROADMAP.md`, and durable design decisions in `docs/DECISIONS.md`. GitHub issues track concrete work and bugs, not another copy of the design documents. Explain AI-assisted changes and their verification honestly; a passing CI badge is not evidence of independent human review.

## Skills and efficient Codex use

Repository skills live in `.agents/skills/`, travel with the checkout, and keep detailed procedures out of the always-loaded `AGENTS.md`. Names/descriptions are available for discovery; full instructions load when relevant. If newly added skills are not listed in an existing session, start a new chat in this checkout or point Codex at the exact `SKILL.md` path.

`CLAUDE.md` is a compatibility import of `AGENTS.md`, so project rules have one source of truth. Skills stay committed in `.agents/skills/`; another client can read the listed skill file directly if it does not discover that directory. No copied skill trees or per-worktree junction setup is required. Machine-specific Claude notes/settings are ignored by Git; keep credentials out of instruction files.

`check:workflow` validates skill YAML, unique names, descriptions, linked files, Claude imports, and GitHub YAML. It enforces budgets of 8 KiB for root instructions, 32 KiB for a repository root-to-leaf instruction chain, and 2 KiB for combined skill names/descriptions. These are repository byte limits, not token counts or guarantees about a client's complete context. It does not prove workflow behavior or replace GitHub's own validation.

| Skill | Example request |
| --- | --- |
| `reef-content` | "Use $reef-content to add this Open Ocean card. Preserve existing saved offers." |
| `reef-pixel-art` | "Use $reef-pixel-art to prepare this fish from its reference; check it at native size." |
| `reef-verify` | "Use $reef-verify to validate this branch and prepare its PR. Do not merge." |

For an ordinary task, a short request is enough:

> Fix [observed behavior]. Done means [observable outcome]. Follow the project workflow and report verification. I want to playtest before the PR.

The on-demand [agent efficiency guide](docs/AGENT_EFFICIENCY.md) records 16 implemented methods, session/compaction controls, a compact handoff format, measurements, and official sources. Read it when tuning the workflow, not before every game change. Token efficiency removes redundant work; it does not remove useful teaching or validation.

## Larger tasks and handoffs

Use a short `docs/plans/<feature>-plan.md` only when work has meaningful phases, risky dependencies, or needs to survive multiple sessions. Include the goal, relevant entry points, non-obvious hazards, decisions already made, phase exit checks, unresolved questions, and next step. Record rejected alternatives only when their rationale prevents repeated investigation. Small fixes can keep their acceptance criteria in the task or PR.

When handing off work, include branch/PR, current behavior, changed files, checks actually run, unresolved risks, and next action. Verify any delegated work from its diff and evidence. If delegation is requested, scope independent tasks to distinct files and avoid repeating the same search in the parent session. Introduce additional modules, orchestration, or setup automation only after an actual repeated need appears.

Never skip a failing gate or relax an assertion simply to pass. Fix the cause or clearly report the blocker. Update affected documentation with the implementation; a new permission round for routine documentation would add friction to already authorized work.

## GitHub configuration

`CI / Verify` tests and builds pull requests and `main`, with read-only permissions and cancellation of superseded runs. The Pages workflow separately verifies the exact build it deploys. No path filters skip required PR checks. Monthly Dependabot proposals keep dependency review batched; they are not auto-merged.

Repository files do not themselves enable branch protection. On 2026-10-07, remote protection for `main` was enabled and read back: PRs required; the `Verify` check must come from GitHub Actions; branches must be current; review conversations must be resolved; admins are included; force pushes and deletion are blocked. Preserve existing protections when modifying settings. Never weaken rules to make a merge pass.

For a solo repository, requiring another approving GitHub reviewer can deadlock work: authors cannot approve their own PRs. Keep explicit owner approval in the development workflow; require an independent reviewer when a real collaborator is available. Do not claim self-review or AI review is an independent approval.

The dated check is a snapshot; inspect current settings on GitHub before changing them. See [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

# Working on King of the Reef

This is a learning and portfolio game. The goal is to practice understandable design, small reviewed changes, reproducible checks, and a playable demo. There is no planned commercial release.

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

# Before a code/data/workflow handoff: all gameplay tests, type-check, and build.
npm.cmd run verify
```

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

| Skill | Example request |
| --- | --- |
| `reef-content` | "Use $reef-content to add this Open Ocean card. Preserve existing saved offers." |
| `reef-pixel-art` | "Use $reef-pixel-art to prepare this fish from its reference; check it at native size." |
| `reef-verify` | "Use $reef-verify to validate this branch and prepare its PR. Do not merge." |

For an ordinary task, a short request is enough:

> Fix [observed behavior]. Done means [observable outcome]. Follow the project workflow and report verification. I want to playtest before the PR.

Practical ways to reduce token use and rework:

- Give the exact failing behavior, affected screen, and seed/error when known. Avoid pasting whole logs when a failing assertion identifies the problem.
- Keep one coherent feature in a chat. Continue related fixes there; for unrelated work, start from a compact handoff containing branch/PR, relevant files, observed checks, and the next action.
- Ask for a plan when design choices are unresolved. Let straightforward fixes proceed without a separate planning conversation.
- Read targeted files and relevant skill references. Keep instructions in one authoritative place; do not paste all design documents into every request.
- Run deterministic scripts for repeated transformations. Use targeted tests while iterating and full verification at the final checkpoint; summarize successful output without hiding failures.
- Use a capable default model for ordinary work. Reserve more expensive reasoning or an independent review for uncertain architecture and difficult bugs; compare total time and rework, not just the length of the answer.
- Use parallel agents only when independent work justifies duplicated context. Avoid installing large skill collections whose overlapping descriptions make selection harder.
- Keep detailed explanations when they help learning or a decision. Token efficiency should remove redundant context, not necessary validation or useful teaching.

These are efficiency practices, not a measured percentage saving. For several comparable tasks, record available token usage, elapsed time, correction rounds, and outcome before deciding whether a new skill helps.

Guidance: [OpenAI on concise skills and instructions](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra), [repository-local skill workflows](https://developers.openai.com/blog/skills-agents-sdk).

## GitHub configuration

`CI / Verify` tests and builds pull requests and `main`, with read-only permissions and cancellation of superseded runs. The Pages workflow separately verifies the exact build it deploys. No path filters skip required PR checks. Monthly Dependabot proposals keep dependency review batched; they are not auto-merged.

Repository files do not themselves enable branch protection. After the first CI run, inspect the existing rule/ruleset for `main` and preserve all existing protections while adding the `Verify` status check from GitHub Actions. Recommended settings are PR-only changes, passing checks, resolved review conversations, and blocked force pushes/deletion. Never weaken existing rules to make a merge pass.

For a solo repository, requiring another approving GitHub reviewer can deadlock work: authors cannot approve their own PRs. Keep explicit owner approval in the development workflow; require an independent reviewer when a real collaborator is available. Do not claim self-review or AI review is an independent approval.

Branch settings must be checked on GitHub; this document describes the intended policy, not proof that remote enforcement is enabled. See [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

---
name: reef-verify
description: Validate a King of the Reef branch and prepare its PR with observed test and playtest evidence.
---

# Reef verification

Paths below are relative to the repository root. Use the existing `package.json` commands and `.node-version`; do not install another test framework for this procedure.

- Inspect branch, working-tree status, and the diff against the intended PR base. Preserve unrelated work and avoid including another feature's commits.
- For code, card data, dependencies, or CI changes, run `npm run verify` after the final relevant edit. On Windows use `npm.cmd`. It validates workflow configuration, runs tests, and type-checks/builds, stopping on failure.
- `verify` prints compact results and stores full logs under `.cache/verify/`. Failures retain their exit code and stop later stages. Read the reported log before rerunning unchanged failures; use `npm run verify -- --verbose` when full terminal output is needed. During iteration, run the affected test file directly with `node --test`.
- For prose-only edits, check the diff and referenced paths. For agent/skill edits, run `npm run check:workflow`; for CI edits, also inspect triggers, permissions, job names, and failure propagation. Actual GitHub execution remains the final CI check.
- For UI/art/gameplay changes, exercise the changed interaction in the browser if available. Unit tests and a successful build do not establish visual correctness. State exactly what was exercised or left for the user.
- Review the final diff for accidental generated output, secrets, and unrelated edits. Update affected design/decision documentation only when behavior or an accepted decision changed.
- Follow the [PR template](../../../.github/pull_request_template.md). Include concise behavior and validation evidence, plus limitations such as unperformed browser checks. Never describe a command as passing unless its result was observed.
- Let the user test first when requested, then open the PR and inspect its checks. A PR/check passing is not approval to merge; follow `AGENTS.md` and wait for explicit approval of that PR.

For a new chat, a sufficient handoff contains the branch/PR, task outcome, changed entry points, checks already run and their results, and the next unresolved action. Avoid a transcript of every command.

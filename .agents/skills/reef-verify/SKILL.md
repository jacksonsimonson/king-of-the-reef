---
name: reef-verify
description: Validate a King of the Reef change and prepare a concise, evidence-based pull request handoff. Use when finishing an implementation or checking a branch; does not authorize merging.
---

# Reef verification

Paths below are relative to the repository root. Use the existing `package.json` commands and `.node-version`; do not install another test framework for this procedure.

- Inspect branch, working-tree status, and the diff against the intended PR base. Preserve unrelated work and avoid including another feature's commits.
- For code, card data, dependencies, or CI changes, run `npm run verify` after the final relevant edit. On Windows use `npm.cmd`. It runs gameplay tests followed by the type-check/build and stops on failure.
- When debugging, run the affected `tests/*.test.mjs` file directly with `node --test` before repeating the full check. Summarize passes; retain the failing assertion and relevant stack trace when checks fail. Do not pipe a failing command through a summary that hides its exit status.
- For prose-only edits, check the diff and referenced paths. For workflow edits, also validate YAML and inspect triggers, permissions, job names, and failure propagation; actual GitHub execution remains the final CI check.
- For UI/art/gameplay changes, exercise the changed interaction in the browser if available. Unit tests and a successful build do not establish visual correctness. State exactly what was exercised or left for the user.
- Review the final diff for accidental generated output, secrets, and unrelated edits. Update affected design/decision documentation only when behavior or an accepted decision changed.
- Follow `.github/pull_request_template.md`. Include concise behavior and validation evidence, plus limitations such as unperformed browser checks. Never describe a command as passing unless its result was observed.
- Let the user test first when requested, then open the PR and inspect its checks. A PR/check passing is not approval to merge; follow `AGENTS.md` and wait for explicit approval of that PR.

For a new chat, a sufficient handoff contains the branch/PR, task outcome, changed entry points, checks already run and their results, and the next unresolved action. Avoid a transcript of every command.

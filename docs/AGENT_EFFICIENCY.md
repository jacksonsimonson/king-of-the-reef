# Solo agent workflow: spend context where it helps

This guide is an on-demand reference, not another always-loaded instruction file. The owner is the sole developer for the foreseeable future. A good task produces a small, understandable change, real verification, and useful learning with minimal repeated work.

## Implemented methods

| Method | Implementation / how to use it |
| --- | --- |
| Short standing context | `AGENTS.md` contains only rules and entry points. The configuration check caps its size; detailed explanations live here or in skills. |
| Small skill discovery | Three focused skills, shortened descriptions, and a combined 2 KiB name/description budget. `npm run context:budget` reports byte counts. |
| On-demand references | Read only the relevant skill and region's design. Do not load this guide for routine game changes. |
| Compact successful output | `npm run verify` runs every gate, prints summaries/warnings, and saves full logs in `.cache/verify/run-*/`. CI and `--verbose` retain full terminal output. |
| Fail once, inspect evidence | Verification stops on the first failure, preserves its exit code and full log, and prints the last 80 lines. Read that log before retrying. |
| Targeted iteration | `node --test tests/shop.test.mjs` while changing shops; full verification at the final code checkpoint. Reuse completed checks only if relevant inputs are unchanged. |
| Narrow search | `rg -n 'buyItem' src/game/run tests` or `rg -l 'buyItem' src tests`; use filenames first when locating code, then read the relevant range. Avoid searching generated output and lockfiles unless needed. |
| Reuse deterministic tools | Run the existing sprite converter and validation scripts instead of having the model recreate transformations or manually inspect repetitive structures. |
| Reuse current context | Continue fixes to the same feature in its chat. Don't reread unchanged files already in context or repeat established decisions. |
| Focused handoffs | For unrelated work, start a new chat with branch/PR, goal, key files, checks, and next action. Use the short format below rather than a transcript. |
| One agent by default | No standing architect/reviewer team, automatic parallel delegation, or duplicate investigation. Request an independent review only when its expected value justifies extra context. |
| Proportional planning | Use a brief plan for ambiguity, risky dependencies, or multiple sessions. A small fix needs acceptance criteria, not a plan file. |
| Small review surface | One coherent PR; no mandatory issue, labels, milestones, reviewer assignment, or artificial approval count for solo work. Owner merge approval and required CI remain. |
| Batch maintenance | Dependabot runs monthly with limited open PRs; no periodic AI summaries or polling jobs. Group routine related work where it remains reviewable. |
| Evidence-first reports | Report outcome, tests, limitations, and next step. Avoid repeating the plan or listing every tool call; explain tradeoffs when they help the owner learn. |
| Measure before adding machinery | Use the byte report and verification summaries below. Add a new skill/tool only for a recurring failure or task; do not accumulate speculative integrations. |

## Session controls you can use

In Codex, use `/status` to inspect context/limits and `/compact` when a long but still coherent task needs a smaller context. Preserve the goal, approvals, key decisions, failing case, and next action. Compaction has its own work and can discard useful detail, so don't run it after every turn. Start a new chat for genuinely unrelated work; do not repeatedly reset the same feature and force rediscovery. Availability follows the installed client. [Codex commands](https://learn.chatgpt.com/docs/developer-commands)

Use a normal capable model/effort for routine work; raise effort for uncertainty, tricky rules, or a difficult failure. A smaller model can cost more overall if it causes retries. Keep the user's selected model unless they request a change. Do not ask for exhaustive alternatives or long reasoning transcripts when a recommendation and evidence suffice.

If using Claude Code, its cost guide covers context inspection, model/effort choice, MCP overhead, and usage reporting. Those client controls are not Codex configuration. We do not copy Claude-only settings into this repository. [Claude Code cost guide](https://code.claude.com/docs/en/costs)

Connect only tools used by the task. Prefer existing CLI/filesystem operations for local work and direct domain APIs for application operations. Tool lists and results can consume context, but some clients discover tools lazily; measure before assuming every installed plugin has the same overhead. No personal plugins or MCP connections were disabled by this repository change.

Prompt caching can reduce input processing cost/latency when repeated prefixes match; it does not shrink the context window or make unnecessary text free. API cache settings and advertised savings do not establish subscription-plan savings in this desktop app. Keep relevant context stable, but don't keep irrelevant history just to chase cache hits. [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)

## A small task and handoff contract

Task: "Fix [observed behavior]. Done when [observable result]. [Relevant seed/file/screenshot if known]. I want to playtest before the PR."

For a session handoff, fill only what matters:

```text
Goal / branch / PR:
Current state and key files:
Decisions or constraints that must survive:
Checks already run (revision and relevant later changes):
Next action / blocker:
```

Use the PR or existing plan for durable work; don't maintain a parallel daily journal. Saves, card IDs, pixel constraints, and explicit approvals are more important to preserve than command history.

## Measurement, not promised percentages

Observed on 2026-10-07 while refining PR #14 (instruction baseline: `b3580d0`):

| Text measured | Before / full output | After / displayed | Reduction |
| --- | ---: | ---: | ---: |
| Root instructions | 2,551 bytes | 1,676 bytes | 34% |
| Three skill names/descriptions | 594 bytes | 332 bytes | 44% |
| One successful local verification run | 7,765 bytes | 612 bytes | 92% |

The verification run executed 72 tests plus configuration/type/build checks; its build warning remained visible. These are byte comparisons from this run, not whole-session token savings. Output varies with failures, warnings, paths, and test counts.

- `npm run context:budget`: repository instruction and skill-discovery bytes. It excludes system prompts, tool schemas, chat history, and client wrappers; it is not a tokenizer or billing estimate.
- Each local verification creates `summary.json` beside its logs with `rawBytes` and `displayedBytes`. This compares captured command output with the runner's presentation, not end-to-end model tokens. Warnings and failures may legitimately make the compact output larger.
- For a few comparable real tasks, note available usage, elapsed time, corrections, and whether the result passed. Use `/status` or the client's usage view; do not scan private global chat logs or add telemetry just to estimate savings.
- Revisit a rule or skill after repeated friction. Remove stale instructions and duplicate sources instead of adding another layer of exceptions.

Research basis: [OpenAI guidance on concise skills and prompts](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra). Its recommendations support small, specific instructions; the repository limits and implementation choices above are local decisions, not universal platform limits.

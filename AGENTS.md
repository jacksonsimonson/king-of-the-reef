# Project workflow

- Begin each change on a `codex/` feature branch, never directly on `main`.
- Validate the feature and let the user test when requested, then open a pull request. Never merge until the user explicitly approves that PR. Never bypass remote protection rules.
- Keep pixel artwork at whole-number scales. Canvas and text render at native size; use layout changes or scrolling instead of fractional scaling.
- Preserve pure-white eye highlights at both 64px board and 128px hand sizes.

import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { checkWorkflow } from "../scripts/check-workflow.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "reef-workflow-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (name, content) => {
    const path = join(root, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  };
  put("AGENTS.md", "Keep instructions focused.\n");
  put("CLAUDE.md", "@AGENTS.md\n");
  put(".agents/skills/example/SKILL.md", "---\nname: example\ndescription: >\n  Validate a focused example workflow.\n---\nRead [details](references/details.md).\n");
  put(".agents/skills/example/references/details.md", "Example details.\n");
  put(".github/workflows/ci.yml", "name: CI\non: [pull_request]\njobs: {}\n");
  return { root, put };
}

test("workflow validator accepts folded YAML, existing references, and CRLF imports", t => {
  const { root, put } = fixture(t);
  put("CLAUDE.md", "@AGENTS.md\r\n");
  assert.deepEqual(checkWorkflow(root).errors, []);
});

test("workflow validator rejects missing references and duplicate YAML keys", t => {
  const { root, put } = fixture(t);
  put(".agents/skills/example/SKILL.md", "---\nname: example\ndescription: Check references.\n---\n[missing](references/missing.md)\n");
  put(".github/workflows/ci.yml", "name: CI\nname: Duplicate\n");
  const errors = checkWorkflow(root).errors.join("\n");
  assert.match(errors, /missing linked file/);
  assert.match(errors, /unique/i);
});

test("workflow validator rejects malformed skill metadata and instruction drift", t => {
  const { root, put } = fixture(t);
  put(".agents/skills/example/SKILL.md", "---\nname: Bad_Name\ndescription: ''\n---\n");
  put("CLAUDE.md", "Different instructions\n");
  put("AGENTS.md", "x".repeat(8193));
  const errors = checkWorkflow(root).errors.join("\n");
  assert.match(errors, /kebab-case/);
  assert.match(errors, /description/);
  assert.match(errors, /only @AGENTS.md/);
  assert.match(errors, /8192-byte/);
});

test("workflow validator catches duplicate names and oversized nested instruction chains", t => {
  const { root, put } = fixture(t);
  put(".agents/skills/other/SKILL.md", "---\nname: example\ndescription: A duplicate name.\n---\n");
  put("src/AGENTS.md", "x".repeat(32768));
  const errors = checkWorkflow(root).errors.join("\n");
  assert.match(errors, /duplicate skill name/);
  assert.match(errors, /instruction chain/);
});

test("workflow validator ignores generated directories and rejects missing frontmatter", t => {
  const { root, put } = fixture(t);
  put("node_modules/example/AGENTS.md", "x".repeat(40000));
  put(".cache/CLAUDE.md", "Generated notes\n");
  assert.deepEqual(checkWorkflow(root).errors, []);
  put(".agents/skills/example/SKILL.md", "No metadata\n");
  assert.match(checkWorkflow(root).errors.join("\n"), /missing YAML frontmatter/);
});

test("workflow validator measures discovery bytes and rejects a bloated skill catalog", t => {
  const { root, put } = fixture(t);
  const before = checkWorkflow(root);
  assert.ok(before.metadataBytes > 0);
  assert.ok(before.skillSizes[0].fileBytes > before.metadataBytes);
  for (const name of ["first", "second", "third"]) {
    put(`.agents/skills/${name}/SKILL.md`, `---\nname: ${name}\ndescription: ${"x".repeat(800)}\n---\n`);
  }
  assert.match(checkWorkflow(root).errors.join("\n"), /discovery metadata exceeds/);
});

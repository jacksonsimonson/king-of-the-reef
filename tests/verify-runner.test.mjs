import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runChecks } from "../scripts/verify.mjs";

function run(t, sources, verbose = false) {
  const cwd = mkdtempSync(join(tmpdir(), "reef-verify-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const output = [];
  const result = runChecks({ cwd, verbose, emit: text => output.push(text), stages: sources.map((source, i) => ({
    name: `stage ${i + 1}`, command: process.execPath, args: ["-e", source],
  })) });
  return { ...result, output: output.join("\n") };
}

test("compact verification retains complete logs and warnings without flooding output", t => {
  const result = run(t, ["console.log('passing line\\n'.repeat(100)); console.log('WARNING: stdout warning'); console.error('stderr warning');"]);
  assert.equal(result.code, 0);
  assert.match(result.output, /stdout warning/);
  assert.match(result.output, /stderr warning/);
  assert.doesNotMatch(result.output, /passing line/);
  assert.match(readFileSync(join(result.logs, "1.log"), "utf8"), /passing line/);
  assert.ok(result.displayedBytes < result.rawBytes);
});

test("verification preserves a failing exit code and does not execute later gates", t => {
  const result = run(t, ["console.error('meaningful failure'); process.exit(7)", "throw new Error('must not run')"]);
  assert.equal(result.code, 7);
  assert.match(result.output, /meaningful failure/);
  assert.match(result.output, /Later stages were not run/);
  assert.doesNotMatch(result.output, /must not run/);
  assert.throws(() => readFileSync(join(result.logs, "2.log")));
});

test("verbose mode shows successful output and compact failures retain a bounded tail", t => {
  assert.match(run(t, ["console.log('verbose detail')"], true).output, /verbose detail/);
  const result = run(t, ["console.log('early context\\n'.repeat(100)); console.error('final failure'); process.exit(2)"]);
  assert.equal(result.code, 2);
  assert.match(result.output, /final failure/);
  assert.ok(result.output.split("\n").length < 90);
  assert.equal(readFileSync(join(result.logs, "1.log"), "utf8").match(/early context/g).length, 100);
});

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Run every gate; compact presentation must never alter execution or exit status.
export function runChecks({ cwd, stages, verbose = false, emit = console.log }) {
  const parent = join(cwd, ".cache", "verify");
  mkdirSync(parent, { recursive: true });
  const logs = mkdtempSync(join(parent, "run-"));
  let rawBytes = 0;
  let displayedBytes = 0;
  const report = text => { displayedBytes += Buffer.byteLength(text + "\n"); emit(text); };
  const env = { ...process.env, NO_COLOR: "1" };
  delete env.FORCE_COLOR;
  for (const [index, stage] of stages.entries()) {
    const result = spawnSync(stage.command, stage.args, {
      cwd, encoding: "utf8", windowsHide: true, timeout: 300000,
      maxBuffer: 64 * 1024 * 1024,
      env,
    });
    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";
    const text = stdout + stderr + (result.error ? `\n${result.error.message}\n` : "");
    const path = join(logs, `${index + 1}.log`);
    writeFileSync(path, text);
    rawBytes += Buffer.byteLength(text);
    const code = result.error || result.signal ? 1 : (result.status ?? 1);
    report(`${code === 0 ? "PASS" : "FAIL"} ${stage.name}${code ? ` (exit ${code})` : ""}`);
    if (verbose) report(text.trimEnd());
    else if (code) report(text.trimEnd().split(/\r?\n/).slice(-80).join("\n"));
    else {
      const summaries = stdout.split(/\r?\n/).filter(line => /^(?:ℹ|#) (?:tests|pass|fail|cancelled|skipped|todo)\b/.test(line));
      if (summaries.length) report(summaries.join("; "));
      const warnings = stdout.split(/\r?\n/).filter(line => /\bwarn(?:ing)?\b|^\(!\)/i.test(line));
      if (warnings.length) report(warnings.join("\n"));
      if (stderr.trim()) report(stderr.trimEnd());
    }
    if (code) {
      report(`Full diagnostics: ${path}. Later stages were not run.`);
      return { code, logs, rawBytes, displayedBytes };
    }
  }
  report(`Full logs: ${logs}`);
  return { code: 0, logs, rawBytes, displayedBytes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const npm = process.env.npm_execpath;
  if (!npm) {
    console.error("Run with npm run verify so the current npm executable can be reused.");
    process.exitCode = 1;
  } else {
    const result = runChecks({
      cwd: fileURLToPath(new URL("../", import.meta.url)),
      verbose: process.argv.includes("--verbose") || process.env.CI === "true",
      stages: [
        { name: "workflow configuration", command: process.execPath, args: [npm, "run", "check:workflow"] },
        { name: "tests", command: process.execPath, args: [npm, "test"] },
        { name: "type-check and build", command: process.execPath, args: [npm, "run", "build"] },
      ],
    });
    writeFileSync(join(result.logs, "summary.json"), JSON.stringify(result, null, 2) + "\n");
    process.exitCode = result.code;
  }
}

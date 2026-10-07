import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const ROOT_BUDGET = 8 * 1024;
const CHAIN_BUDGET = 32 * 1024;
const SKIPPED = new Set([".git", "node_modules", ".cache", "dist", ".vite", "__pycache__"]);

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink() || SKIPPED.has(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

export function checkWorkflow(directory) {
  const root = resolve(directory);
  const files = filesUnder(root);
  const errors = [];
  const fail = (path, message) => errors.push(`${relative(root, path)}: ${message}`);
  const read = path => readFileSync(path, "utf8");
  const parse = (path, text) => {
    const document = parseDocument(text);
    if (document.errors.length) {
      fail(path, document.errors.map(error => error.message).join("; "));
      return null;
    }
    try { return document.toJS({ maxAliasCount: 100 }); }
    catch (error) { fail(path, error.message); return null; }
  };
  const frontmatter = path => {
    const match = read(path).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) { fail(path, "missing YAML frontmatter"); return null; }
    return parse(path, match[1]);
  };

  const rootInstructions = join(root, "AGENTS.md");
  if (!existsSync(rootInstructions)) fail(rootInstructions, "required");
  else if (statSync(rootInstructions).size > ROOT_BUDGET) fail(rootInstructions, `exceeds ${ROOT_BUDGET}-byte project budget; move detail to a skill/reference`);

  for (const path of files.filter(path => basename(path) === "AGENTS.md")) {
    let current = dirname(path);
    let bytes = 0;
    while (true) {
      const ancestor = join(current, "AGENTS.md");
      if (existsSync(ancestor)) bytes += statSync(ancestor).size;
      if (current === root) break;
      current = dirname(current);
    }
    if (bytes > CHAIN_BUDGET) fail(path, `instruction chain exceeds ${CHAIN_BUDGET} bytes`);
  }

  for (const path of files.filter(path => basename(path) === "CLAUDE.md")) {
    if (read(path).trim() !== "@AGENTS.md") fail(path, "must contain only @AGENTS.md");
    if (!existsSync(join(dirname(path), "AGENTS.md"))) fail(path, "missing sibling AGENTS.md");
  }

  const skillsRoot = join(root, ".agents", "skills");
  const skills = files.filter(path => path.startsWith(skillsRoot + sep) && basename(path) === "SKILL.md");
  if (!skills.length) fail(skillsRoot, "no skills found");
  const names = new Set();
  const skillSizes = [];
  for (const path of skills) {
    const data = frontmatter(path);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      fail(path, "frontmatter must be a mapping");
      continue;
    }
    if (typeof data.name !== "string" || data.name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name)) fail(path, "name must be kebab-case, 1-64 characters");
    if (data.name !== basename(dirname(path))) fail(path, "name must match its directory");
    if (names.has(data.name)) fail(path, "duplicate skill name");
    names.add(data.name);
    skillSizes.push({ name: data.name, metadataBytes: Buffer.byteLength(`${data.name}\n${data.description}`), fileBytes: statSync(path).size });
    if (typeof data.description !== "string" || !data.description.trim() || data.description.length > 1024 || /[<>]/.test(data.description)) fail(path, "description must be 1-1024 characters without angle brackets");

    // Validate Markdown file links, including images and reference-style definitions.
    const body = read(path).replace(/```[\s\S]*?```/g, "");
    const links = [...body.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g), ...body.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/gm)];
    for (const [, target] of links) {
      if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue;
      let local;
      try { local = decodeURIComponent(target.split("#")[0]); }
      catch { fail(path, `invalid link: ${target}`); continue; }
      if (!existsSync(resolve(dirname(path), local))) fail(path, `missing linked file: ${target}`);
    }
  }

  for (const path of files.filter(path => path.startsWith(join(root, ".github") + sep))) {
    if (/\.ya?ml$/.test(path)) parse(path, read(path));
    if (path.includes(`${sep}ISSUE_TEMPLATE${sep}`) && path.endsWith(".md")) {
      const data = frontmatter(path);
      if (!data?.name || !data?.about) fail(path, "issue template requires name and about");
    }
  }
  const metadataBytes = skillSizes.reduce((total, skill) => total + skill.metadataBytes, 0);
  if (metadataBytes > 2048) fail(skillsRoot, "skill discovery metadata exceeds the 2048-byte project budget; shorten descriptions or retire unused skills");
  return { errors, skills: skills.length, instructionBytes: existsSync(rootInstructions) ? statSync(rootInstructions).size : 0, metadataBytes, skillSizes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkWorkflow(fileURLToPath(new URL("../", import.meta.url)));
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Workflow checks passed: ${result.skills} skills; root instructions ${result.instructionBytes}/${ROOT_BUDGET} bytes; GitHub YAML valid.`);
    if (process.argv.includes("--budget")) {
      console.log(`Skill names/descriptions: ${result.metadataBytes}/2048 bytes. These are bytes, not billed tokens; client overhead is excluded.`);
      for (const skill of result.skillSizes) console.log(`${skill.name}: discovery ${skill.metadataBytes} bytes; on-demand file ${skill.fileBytes} bytes`);
    }
  }
}

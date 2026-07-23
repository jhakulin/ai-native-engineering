#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();
const manifestPath = path.join(root, "research", "context-manifest.json");
const schemaVersion = 1;
const requiredFiles = ["README.md", "AGENTS.md", "CLAUDE.md", "docs/research-brief-workflow.md"];

function trackedFiles() {
  try {
    return execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
      .split("\0").filter(Boolean);
  } catch {
    return filesystemFiles();
  }
}

function filesystemFiles() {
  const files = [];
  function walk(relative) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) return;
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = path.join(relative, entry.name);
      if ([".git", "node_modules", "research-history"].includes(entry.name) || child.startsWith("research/inbox/")) continue;
      if (entry.isDirectory()) walk(child);
      else if (entry.isFile()) files.push(child.split(path.sep).join("/"));
    }
  }
  walk("");
  return files;
}

function currentSha() {
  if (process.env.RESEARCH_SOURCE_SHA) return process.env.RESEARCH_SOURCE_SHA;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function manifestFiles() {
  const tracked = new Set(trackedFiles());
  const files = new Set(requiredFiles.filter((file) => tracked.has(file)));
  for (const file of tracked) {
    if ((file.startsWith("guidelines/") || file.startsWith("skills/") || file.startsWith("strategies/") || file.startsWith("ideas/")) && /\.md$/i.test(file)) files.add(file);
  }
  return [...files].sort();
}

function expectedManifest() {
  return {
    schema_version: schemaVersion,
    generated_from_sha: currentSha(),
    files: manifestFiles(),
  };
}

function readManifest() {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function validateManifest(manifest = readManifest()) {
  const expected = expectedManifest();
  const errors = [];
  if (manifest.schema_version !== schemaVersion) errors.push(`schema_version must be ${schemaVersion}`);
  if (!manifest.generated_from_sha || !/^[0-9a-f]{40}$/i.test(manifest.generated_from_sha)) errors.push("generated_from_sha must be a full commit SHA");
  if (!Array.isArray(manifest.files)) errors.push("files must be an array");
  const actualFiles = manifest.files || [];
  if (JSON.stringify(actualFiles) !== JSON.stringify([...actualFiles].sort())) errors.push("files must be sorted");
  if (JSON.stringify(actualFiles) !== JSON.stringify(expected.files)) errors.push(`files do not match the repository context; expected ${expected.files.length}, found ${actualFiles.length}`);
  for (const file of actualFiles) {
    if (!fs.existsSync(path.join(root, file))) errors.push(`manifest-listed file is missing: ${file}`);
    if (!(requiredFiles.includes(file) || /^(guidelines|skills|strategies|ideas)\/.*\.md$/i.test(file))) errors.push(`file is outside the allowed context: ${file}`);
  }
  return errors;
}

if (require.main === module) {
  const command = process.argv[2] || "generate";
  if (command === "generate") {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify(expectedManifest(), null, 2)}\n`);
    console.log(manifestPath);
  } else if (command === "validate") {
    try {
      const errors = validateManifest();
      if (errors.length) throw new Error(errors.map((error) => `- ${error}`).join("\n"));
      console.log("Context manifest validation passed.");
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

module.exports = { manifestPath, requiredFiles, expectedManifest, readManifest, validateManifest };

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const skillsDir = path.join(root, "skills");
const errors = [];
const { validateManifest } = require("./context-manifest");

function fail(message) {
  errors.push(message);
}

function isSkillName(name) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

if (!fs.existsSync(skillsDir)) {
  fail("Missing skills/ directory");
} else {
  for (const name of fs.readdirSync(skillsDir).sort()) {
    const skillPath = path.join(skillsDir, name);
    if (!fs.statSync(skillPath).isDirectory()) continue;

    if (!isSkillName(name)) {
      fail(`Invalid skill directory name: ${name}`);
    }

    const file = path.join(skillPath, "SKILL.md");
    if (!fs.existsSync(file)) {
      fail(`Missing SKILL.md for skill: ${name}`);
      continue;
    }

    const text = fs.readFileSync(file, "utf8");
    const match = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) {
      fail(`Missing YAML frontmatter: ${file}`);
      continue;
    }

    const frontmatter = match[1];
    if (!new RegExp(`^name:\\s*${name}\\s*$`, "m").test(frontmatter)) {
      fail(`Frontmatter name must match directory: ${name}`);
    }
    if (!/^description:\s*\S.+$/m.test(frontmatter)) {
      fail(`Missing non-empty description: ${name}`);
    }
  }
}

for (const error of validateManifest()) fail(`Context manifest: ${error}`);

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Repository validation passed.");

#!/usr/bin/env node

const { execFileSync } = require("child_process");

const base = process.env.PR_BASE_SHA || process.env.GITHUB_BASE_SHA;
const head = process.env.PR_HEAD_SHA || process.env.GITHUB_HEAD_SHA || "HEAD";

if (!base) {
  console.error("Missing PR_BASE_SHA or GITHUB_BASE_SHA");
  process.exit(1);
}

function runGit(args) {
  return execFileSync("/usr/bin/git", args, { encoding: "utf8" }).trim();
}

function isReviewedFile(file) {
  if (/^skills\/[^/]+\//.test(file)) return true;
  if (file === "guidelines/skill-guideline.md") return true;
  if (file === "guidelines/minimal-skill-template.md") return true;
  if (file === "guidelines/skill-security-checklist.md") return true;
  if (file.startsWith(".agents/skills/")) return true;
  return false;
}

const diff = runGit(["diff", "--name-only", `${base}...${head}`]);
const changedFiles = diff ? diff.split(/\r?\n/).filter(Boolean) : [];
const reviewedFiles = changedFiles.filter(isReviewedFile);
const skippedFiles = changedFiles.filter((file) => !isReviewedFile(file));

function printList(title, files) {
  console.log(`${title}:`);
  if (files.length === 0) {
    console.log("- none");
    return;
  }
  for (const file of files) {
    console.log(`- ${file}`);
  }
}

printList("Changed files", changedFiles);
printList("Reviewed files", reviewedFiles);
printList("Skipped files", skippedFiles);
console.log("Diff available: yes");

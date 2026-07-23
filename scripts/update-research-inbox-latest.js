#!/usr/bin/env node
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
  root,
  loadTarget,
  getTargetName,
  getResearchDate,
  getResearchRunId,
  inboxDir,
  readJson,
  writeJson,
} = require("./research-lib");

const targetName = getTargetName();
const date = getResearchDate();
const runId = getResearchRunId();

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

try {
  const target = loadTarget(targetName);
  const dir = inboxDir(target, date, runId);
  const validation = readJson(path.join(dir, "validation.json"));
  if (!validation.valid) throw new Error("Refusing to update latest.json because inbox validation failed");

  const runPath = path.relative(root, dir).split(path.sep).join("/");
  const manifestPath = path.join(dir, "manifest.json");
  const summaryPath = path.join(dir, "selection-summary.md");
  const evidencePath = path.join(dir, "evidence.json");
  const webSourcesPath = path.join(dir, "web-sources.json");

  const verification = {
    manifest_sha256: sha256File(manifestPath),
    selection_summary_sha256: sha256File(summaryPath),
    evidence_sha256: sha256File(evidencePath),
  };
  if (fs.existsSync(webSourcesPath)) verification.web_sources_sha256 = sha256File(webSourcesPath);

  const latest = {
    target: target.name,
    date,
    run_id: runId,
    run_path: runPath,
    generated_from_sha: process.env.GITHUB_SHA || null,
    workflow_run_id: process.env.GITHUB_RUN_ID || runId,
    updated_at: new Date().toISOString(),
    verification,
  };

  writeJson(path.join(root, "research", "inbox", target.name, "latest.json"), latest);
  console.log(`Updated ${path.relative(root, path.join(root, "research", "inbox", target.name, "latest.json"))}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

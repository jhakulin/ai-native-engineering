#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { root, loadTarget, getTargetName, getResearchDate, inboxDir, mkdirp, readHistory, readJson } = require("./research-lib");

const targetName = getTargetName();
const date = getResearchDate();

try {
  const target = loadTarget(targetName);
  const dir = inboxDir(target, date);
  const validation = readJson(path.join(dir, "validation.json"));
  if (!validation.valid) throw new Error("Refusing to update source history because inbox validation failed");

  const evidence = readJson(path.join(dir, "evidence.json"));
  const historyAbs = path.join(root, target.source_history.path);
  mkdirp(path.dirname(historyAbs));
  const existing = readHistory(target.source_history.path);
  const lines = [];
  const seen = new Set();

  for (const source of evidence.sources || []) {
    if (!source.source_id || seen.has(source.source_id)) continue;
    seen.add(source.source_id);
    const previous = existing.get(source.source_id);
    if (previous && previous.last_used === date) continue;
    lines.push(JSON.stringify({
      source_id: source.source_id,
      url: source.url,
      title: source.title,
      type: source.type || "youtube",
      first_used: previous?.first_used || date,
      last_used: date,
      target: target.name,
    }));
  }

  if (lines.length) fs.appendFileSync(historyAbs, lines.join("\n") + "\n");
  console.log(`Appended ${lines.length} source(s) to ${target.source_history.path}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

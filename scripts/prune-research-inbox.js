#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { root, loadTarget, getTargetName, getResearchDate, getResearchRunId } = require("./research-lib");

const targetName = getTargetName();
const currentDate = getResearchDate();
const currentRunId = getResearchRunId();

function listRuns(target) {
  const targetDir = path.join(root, "research", "inbox", target.name);
  if (!fs.existsSync(targetDir)) return [];
  const runs = [];
  for (const dateEntry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    if (!dateEntry.isDirectory()) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateEntry.name)) continue;
    const dateDir = path.join(targetDir, dateEntry.name);
    for (const runEntry of fs.readdirSync(dateDir, { withFileTypes: true })) {
      if (!runEntry.isDirectory() || !runEntry.name.startsWith("run-")) continue;
      const runId = runEntry.name.slice(4);
      runs.push({
        date: dateEntry.name,
        runId,
        path: path.join(dateDir, runEntry.name),
        current: dateEntry.name === currentDate && runId === currentRunId,
      });
    }
  }
  return runs;
}

function ageDays(dateText) {
  const then = new Date(`${dateText}T00:00:00Z`).getTime();
  if (!Number.isFinite(then)) return Infinity;
  return Math.floor((Date.now() - then) / 86400000);
}

try {
  const target = loadTarget(targetName);
  const retention = target.retention || {};
  if (retention.enabled === false) {
    console.log("Research inbox pruning disabled for this target.");
    process.exit(0);
  }
  const keepLatestRuns = Number.isInteger(retention.keep_latest_runs) ? retention.keep_latest_runs : 1;
  const deleteOlderThanDays = Number.isInteger(retention.delete_runs_older_than_days) ? retention.delete_runs_older_than_days : null;

  const runs = listRuns(target).sort((a, b) => {
    const left = `${a.date}/run-${a.runId}`;
    const right = `${b.date}/run-${b.runId}`;
    return right.localeCompare(left);
  });

  const keep = new Set();
  for (const run of runs) {
    if (run.current) keep.add(run.path);
  }
  for (const run of runs) {
    if (keep.size >= keepLatestRuns) break;
    keep.add(run.path);
  }

  const deleted = [];
  for (const run of runs) {
    if (run.current) continue;
    const beyondLatest = !keep.has(run.path);
    const tooOld = deleteOlderThanDays !== null && ageDays(run.date) > deleteOlderThanDays;
    if (beyondLatest || tooOld) {
      fs.rmSync(run.path, { recursive: true, force: true });
      deleted.push(path.relative(root, run.path));
    }
  }

  // Remove empty date directories.
  const targetDir = path.join(root, "research", "inbox", target.name);
  if (fs.existsSync(targetDir)) {
    for (const dateEntry of fs.readdirSync(targetDir, { withFileTypes: true })) {
      if (!dateEntry.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(dateEntry.name)) continue;
      const dateDir = path.join(targetDir, dateEntry.name);
      if (fs.readdirSync(dateDir).length === 0) fs.rmdirSync(dateDir);
    }
  }

  if (deleted.length === 0) {
    console.log("No old research inbox runs pruned.");
  } else {
    console.log("Pruned old research inbox runs:");
    for (const item of deleted) console.log(`- ${item}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

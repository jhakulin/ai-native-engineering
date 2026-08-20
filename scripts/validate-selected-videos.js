#!/usr/bin/env node
const path = require("path");
const { loadTarget, getTargetName, getResearchDate, inboxDir, readJson } = require("./research-lib");

const targetName = getTargetName();
const date = getResearchDate();
const errors = [];
function fail(message) { errors.push(message); }

try {
  const target = loadTarget(targetName);
  const dir = inboxDir(target, date);
  const candidatesPayload = readJson(path.join(dir, "youtube-candidates.json"));
  const selectedPayload = readJson(path.join(dir, "selected-videos.json"));
  const candidateById = new Map((candidatesPayload.candidates || []).map((item) => [item.source_id, item]));
  const candidateIds = new Set(candidateById.keys());
  const selected = selectedPayload.selected || [];
  const selectedIds = new Set();

  if (selectedPayload.target !== target.name) fail(`selected-videos.json.target must be ${target.name}`);
  if (selectedPayload.date !== date) fail(`selected-videos.json.date must be ${date}`);
  if (!Array.isArray(selectedPayload.selected)) fail("selected-videos.json.selected must be an array");
  if (!Array.isArray(selectedPayload.rejected)) fail("selected-videos.json.rejected must be an array");
  if (selected.length > target.source_limits.max_video_transcripts) fail(`Selected ${selected.length} videos, limit is ${target.source_limits.max_video_transcripts}`);

  for (const [index, item] of selected.entries()) {
    if (!/^youtube:[0-9A-Za-z_-]{11}$/.test(item.source_id || "")) fail(`selected[${index}] has invalid source_id`);
    if (selectedIds.has(item.source_id)) fail(`selected[${index}] duplicates source_id: ${item.source_id}`);
    selectedIds.add(item.source_id);
    const candidate = candidateById.get(item.source_id);
    if (!candidate) fail(`selected[${index}] source_id not found in candidates: ${item.source_id}`);
    if (!item.url) fail(`selected[${index}] missing url`);
    if (candidate && item.url !== candidate.url) fail(`selected[${index}] url must match candidate url for ${item.source_id}`);
    if (candidate && candidate.eligible_for_transcript === false) fail(`selected[${index}] source_id is ineligible for transcript reuse: ${item.source_id}`);
    if (candidate && candidate.eligible_for_selection === false) fail(`selected[${index}] source_id is below the minimum video duration: ${item.source_id}`);
    if (!item.reason) fail(`selected[${index}] missing reason`);
    if (!item.expected_value) fail(`selected[${index}] missing expected_value`);
    if (!["low", "medium", "high"].includes(item.confidence || "")) fail(`selected[${index}] has invalid confidence`);
  }

  for (const [index, item] of (selectedPayload.rejected || []).entries()) {
    if (!candidateIds.has(item.source_id)) fail(`rejected[${index}] source_id not found in candidates: ${item.source_id}`);
    if (selectedIds.has(item.source_id)) fail(`rejected[${index}] source_id is also selected: ${item.source_id}`);
    if (!item.reason) fail(`rejected[${index}] missing reason`);
  }

  if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }
  console.log("Selected videos validation passed.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

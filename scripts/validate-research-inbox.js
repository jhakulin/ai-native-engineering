#!/usr/bin/env node
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
const errors = [];

function fail(message) { errors.push(message); }
function rel(file) { return path.relative(root, file); }

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) fail(`Symlink is not allowed: ${rel(full)}`);
    else if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function readIfExists(file, fallback) {
  return fs.existsSync(file) ? readJson(file) : fallback;
}

function checkTargetDate(payload, label, target) {
  if (payload.target !== target.name) fail(`${label}.target must be ${target.name}`);
  if (payload.date !== date) fail(`${label}.date must be ${date}`);
  if (payload.run_id !== undefined && payload.run_id !== runId) fail(`${label}.run_id must be ${runId}`);
}

try {
  const target = loadTarget(targetName);
  const dir = inboxDir(target, date);
  const queryPlanPath = path.join(dir, "query-plan.json");
  const hasQueryPlan = fs.existsSync(queryPlanPath);
  const required = [
    "manifest.json",
    "target.json",
    "context.json",
    ...(hasQueryPlan ? ["query-plan.json", "web-sources.json"] : []),
    "youtube-candidates.json",
    "selected-videos.json",
    "transcripts.json",
    "evidence.json",
    "selection-summary.md",
    "README.md",
  ];

  if (!fs.existsSync(dir)) throw new Error(`Missing inbox directory: ${dir}`);
  for (const file of required) {
    if (!fs.existsSync(path.join(dir, file))) fail(`Missing required inbox file: ${file}`);
  }

  const files = walk(dir);
  for (const file of files) {
    const relative = rel(file);
    if (!relative.startsWith(`research/inbox/${target.name}/${date}/run-${runId}/`)) fail(`Unexpected file path: ${relative}`);
    if (path.basename(file) === ".env") fail(`.env file is not allowed: ${relative}`);
    if (!/[.](json|md|txt)$/.test(file)) fail(`Unexpected file extension: ${relative}`);
    const mode = fs.statSync(file).mode;
    if ((mode & 0o111) !== 0) fail(`Executable file is not allowed: ${relative}`);
    const size = fs.statSync(file).size;
    if (size > 2_000_000) fail(`Inbox file exceeds size limit: ${relative}`);
    const text = fs.readFileSync(file, "utf8");
    if (/sk-[A-Za-z0-9_-]{20,}/.test(text)) fail(`Possible API key found in ${relative}`);
    if (/WEBSHARE_PROXY_PASSWORD\s*=|YOUTUBE_API_KEY\s*=|OPENAI_API_KEY\s*=|CODEX_API_KEY\s*=/.test(text)) fail(`Possible secret assignment found in ${relative}`);
  }

  const readmePath = path.join(dir, "README.md");
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, "utf8");
    if (!/untrusted/i.test(readme)) fail("README.md must warn that external content is untrusted");
  }

  const manifestPath = path.join(dir, "manifest.json");
  const targetPath = path.join(dir, "target.json");
  const candidatesPath = path.join(dir, "youtube-candidates.json");
  const selectedPath = path.join(dir, "selected-videos.json");
  const transcriptsPath = path.join(dir, "transcripts.json");
  const webSourcesPath = path.join(dir, "web-sources.json");
  const evidencePath = path.join(dir, "evidence.json");

  const manifest = readIfExists(manifestPath, {});
  const targetPayload = readIfExists(targetPath, {});
  const queryPlanPayload = readIfExists(queryPlanPath, { dynamic_queries: [] });
  const candidatesPayload = readIfExists(candidatesPath, { candidates: [] });
  const selectedPayload = readIfExists(selectedPath, { selected: [], rejected: [] });
  const webSourcesPayload = readIfExists(webSourcesPath, { sources: [] });
  const transcriptsPayload = readIfExists(transcriptsPath, { transcripts: [] });
  const evidencePayload = readIfExists(evidencePath, { sources: [] });

  checkTargetDate(manifest, "manifest", target);
  if (hasQueryPlan) checkTargetDate(queryPlanPayload, "query-plan.json", target);
  checkTargetDate(candidatesPayload, "youtube-candidates.json", target);
  checkTargetDate(selectedPayload, "selected-videos.json", target);
  if (fs.existsSync(webSourcesPath)) checkTargetDate(webSourcesPayload, "web-sources.json", target);
  checkTargetDate(transcriptsPayload, "transcripts.json", target);
  if (manifest.run_id !== runId) fail(`manifest.run_id must be ${runId}`);
  if (hasQueryPlan && queryPlanPayload.run_id !== runId) fail(`query-plan.json.run_id must be ${runId}`);
  if (candidatesPayload.run_id !== runId) fail(`youtube-candidates.json.run_id must be ${runId}`);
  if (transcriptsPayload.run_id !== runId) fail(`transcripts.json.run_id must be ${runId}`);
  if (targetPayload.name !== target.name) fail(`target.json.name must be ${target.name}`);
  if (targetPayload.brief_title !== target.brief_title) fail(`target.json.brief_title must match target configuration`);
  if (JSON.stringify(targetPayload.idea_output) !== JSON.stringify(target.idea_output)) fail(`target.json.idea_output must match target configuration`);
  if (JSON.stringify(targetPayload.analysis_focus) !== JSON.stringify(target.analysis_focus)) fail(`target.json.analysis_focus must match target configuration`);
  if (evidencePayload.target?.name !== target.name) fail(`evidence.json.target.name must be ${target.name}`);
  if (evidencePayload.date !== date) fail(`evidence.json.date must be ${date}`);
  if (evidencePayload.run_id !== runId) fail(`evidence.json.run_id must be ${runId}`);

  const manifestFiles = new Set(manifest.files || []);
  for (const file of [...required, "validation.json"]) {
    if (!manifestFiles.has(file)) fail(`manifest.files must include ${file}`);
  }

  const candidates = candidatesPayload.candidates || [];
  const candidateById = new Map(candidates.map((item) => [item.source_id, item]));
  const candidateIds = new Set(candidateById.keys());
  if (candidateIds.size !== candidates.length) fail("youtube-candidates.json contains duplicate source_id values");

  const selected = selectedPayload.selected || [];
  const selectedIds = new Set();

  if (selected.length > target.source_limits.max_video_transcripts) {
    fail(`Selected ${selected.length} videos, limit is ${target.source_limits.max_video_transcripts}`);
  }

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

  const rejected = selectedPayload.rejected || [];
  for (const [index, item] of rejected.entries()) {
    if (!candidateIds.has(item.source_id)) fail(`rejected[${index}] source_id not found in candidates: ${item.source_id}`);
    if (selectedIds.has(item.source_id)) fail(`rejected[${index}] source_id is also selected: ${item.source_id}`);
    if (!item.reason) fail(`rejected[${index}] missing reason`);
  }

  const webSources = webSourcesPayload.sources || [];
  const webSourceIds = new Set();
  for (const [index, source] of webSources.entries()) {
    if (!source.id) fail(`web-sources.sources[${index}] missing id`);
    if (webSourceIds.has(source.id)) fail(`web-sources.sources[${index}] duplicates id: ${source.id}`);
    webSourceIds.add(source.id);
    if (!source.title) fail(`web-sources.sources[${index}] missing title`);
    if (!source.finding) fail(`web-sources.sources[${index}] missing finding`);
    if (source.url && !/^https:\/\//i.test(source.url)) fail(`web-sources.sources[${index}].url must start with https://`);
  }

  const rejectedIds = new Set((selectedPayload.rejected || []).map((item) => item.source_id));
  const allowedTranscriptIds = new Set([...selectedIds, ...rejectedIds]);
  const transcripts = transcriptsPayload.transcripts || [];
  const transcriptIds = new Set();
  let successfulTranscriptCount = 0;
  for (const [index, transcript] of transcripts.entries()) {
    if (transcriptIds.has(transcript.source_id)) fail(`transcripts[${index}] duplicates source_id: ${transcript.source_id}`);
    transcriptIds.add(transcript.source_id);
    if (!candidateIds.has(transcript.source_id)) fail(`transcripts[${index}] source_id was not a candidate: ${transcript.source_id}`);
    if (!allowedTranscriptIds.has(transcript.source_id)) fail(`transcripts[${index}] source_id was neither selected nor rejected fallback: ${transcript.source_id}`);
    if (!transcript.transcript && !transcript.transcript_error) fail(`transcripts[${index}] must contain transcript or transcript_error`);
    if (transcript.transcript) successfulTranscriptCount += 1;
  }
  for (const sourceId of selectedIds) {
    if (!transcriptIds.has(sourceId)) fail(`Missing transcript result for selected source: ${sourceId}`);
  }
  if (transcriptsPayload.successful_transcripts !== successfulTranscriptCount) fail("transcripts.json successful_transcripts does not match transcript records");
  if (successfulTranscriptCount > target.source_limits.max_video_transcripts) fail("successful transcript count exceeds configured limit");

  const evidenceSources = evidencePayload.sources || [];
  const evidenceIds = new Set();
  for (const [index, source] of evidenceSources.entries()) {
    if (evidenceIds.has(source.source_id)) fail(`evidence.sources[${index}] duplicates source_id: ${source.source_id}`);
    evidenceIds.add(source.source_id);
    if (!transcriptIds.has(source.source_id)) fail(`evidence.sources[${index}] source_id has no transcript result: ${source.source_id}`);
    if (!source.url) fail(`evidence.sources[${index}] missing url`);
    if (!source.title) fail(`evidence.sources[${index}] missing title`);
    if (!source.transcript && !source.transcript_error) fail(`evidence.sources[${index}] must contain transcript or transcript_error`);
  }
  if (evidenceSources.length !== transcripts.length) fail("evidence.sources length must match transcript attempt length");
  if ((evidencePayload.web_sources || []).length !== webSources.length) fail("evidence.web_sources length must match web-sources.json sources length");
  for (const sourceId of transcriptIds) {
    if (!evidenceIds.has(sourceId)) fail(`Missing evidence source for transcript source: ${sourceId}`);
  }

  const validation = {
    target: target.name,
    date,
    run_id: runId,
    valid: errors.length === 0,
    errors,
    checked_at: new Date().toISOString(),
  };
  writeJson(path.join(dir, "validation.json"), validation);

  if (errors.length === 0) {
    manifest.files = Array.from(new Set([...(manifest.files || []), "validation.json"]));
    manifest.validation = "validation.json";
    manifest.status = "validated";
    manifest.validated_at = validation.checked_at;
    writeJson(manifestPath, manifest);
  }

  if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }

  console.log("Research inbox validation passed.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

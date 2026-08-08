#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { loadTarget, getTargetName, getResearchDate, getResearchRunId, inboxDir, readJson, writeJson, run } = require("./research-lib");

const targetName = getTargetName();
const date = getResearchDate();
const runId = getResearchRunId();
const transcriptMaxChars = Number(process.env.RESEARCH_TRANSCRIPT_MAX_CHARS || 60000);

function sanitizeTranscriptError(error) {
  const raw = String(error.stderr || error.message || error);
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errorLines = lines.filter((line) => /^Error:/i.test(line));
  if (errorLines.length > 0) return errorLines[errorLines.length - 1];
  const unavailable = lines.find((line) => /transcripts? (are )?(disabled|unavailable)|no transcript found|video is unavailable/i.test(line));
  if (unavailable) return unavailable;
  return lines.slice(-5).join("\n").slice(0, 1000) || "transcript fetch failed";
}

function makeAttempt(candidate, selection, attemptKind) {
  return {
    candidate,
    selection,
    attemptKind,
  };
}

try {
  if (!process.env.WEBSHARE_PROXY_USERNAME || !process.env.WEBSHARE_PROXY_PASSWORD) {
    throw new Error("WEBSHARE_PROXY_USERNAME and WEBSHARE_PROXY_PASSWORD are required for transcript fetching");
  }

  const target = loadTarget(targetName);
  const dir = inboxDir(target, date);
  const candidates = readJson(path.join(dir, "youtube-candidates.json"));
  const selectedPayload = readJson(path.join(dir, "selected-videos.json"));
  const webSourcesPath = path.join(dir, "web-sources.json");
  const webSourcesPayload = fs.existsSync(webSourcesPath) ? readJson(webSourcesPath) : { sources: [] };
  const byId = new Map((candidates.candidates || []).map((candidate) => [candidate.source_id, candidate]));
  const selected = selectedPayload.selected || [];
  const rejected = selectedPayload.rejected || [];
  const transcriptLimit = target.source_limits.max_video_transcripts;
  const transcripts = [];
  const attemptedIds = new Set();
  let successfulTranscripts = 0;

  const attempts = [];
  for (const selection of selected) {
    attempts.push(makeAttempt(byId.get(selection.source_id), selection, "selected"));
  }
  for (const rejection of rejected) {
    attempts.push(makeAttempt(byId.get(rejection.source_id), rejection, "fallback"));
  }

  for (const attempt of attempts) {
    const { candidate, selection, attemptKind } = attempt;
    if (successfulTranscripts >= transcriptLimit && attemptKind === "fallback") break;
    if (!selection?.source_id || attemptedIds.has(selection.source_id)) continue;
    attemptedIds.add(selection.source_id);

    if (!candidate) {
      transcripts.push({
        source_id: selection.source_id,
        attempt_kind: attemptKind,
        transcript_error: "source was not found in youtube-candidates.json",
        retrieved_at: new Date().toISOString(),
      });
      continue;
    }

    try {
      const text = run("skills/get-youtube-transcription/scripts/run_youtube_transcription.sh", [candidate.url], { maxBuffer: 10 * 1024 * 1024 });
      const trimmed = text.trim();
      transcripts.push({
        source_id: candidate.source_id,
        attempt_kind: attemptKind,
        type: "youtube_transcript",
        video_id: candidate.video_id,
        url: candidate.url,
        title: candidate.title,
        channel_title: candidate.channel_title,
        retrieved_at: new Date().toISOString(),
        transcript: trimmed.slice(0, transcriptMaxChars),
        transcript_truncated: trimmed.length > transcriptMaxChars,
      });
      successfulTranscripts += 1;
    } catch (error) {
      transcripts.push({
        source_id: candidate.source_id,
        attempt_kind: attemptKind,
        type: "youtube_transcript",
        video_id: candidate.video_id,
        url: candidate.url,
        title: candidate.title,
        channel_title: candidate.channel_title,
        retrieved_at: new Date().toISOString(),
        transcript_error: sanitizeTranscriptError(error),
      });
    }
  }

  const selectionById = new Map(selected.map((item) => [item.source_id, { ...item, attempt_kind: "selected" }]));
  for (const item of rejected) {
    if (!selectionById.has(item.source_id)) selectionById.set(item.source_id, { ...item, expected_value: "fallback transcript candidate", confidence: "low", attempt_kind: "fallback" });
  }

  const evidenceSources = transcripts.map((transcript) => {
    const candidate = byId.get(transcript.source_id) || {};
    const selection = selectionById.get(transcript.source_id) || {};
    return {
      ...candidate,
      selection: {
        attempt_kind: transcript.attempt_kind,
        reason: selection.reason,
        expected_value: selection.expected_value,
        confidence: selection.confidence,
      },
      transcript: transcript.transcript,
      transcript_truncated: transcript.transcript_truncated,
      transcript_error: transcript.transcript_error,
    };
  });

  const evidence = {
    target,
    date,
    run_id: runId,
    generated_at: new Date().toISOString(),
    untrusted_content: true,
    candidates_file: "youtube-candidates.json",
    selected_file: "selected-videos.json",
    transcripts_file: "transcripts.json",
    web_sources_file: "web-sources.json",
    successful_transcripts: successfulTranscripts,
    requested_transcripts: transcriptLimit,
    sources: evidenceSources,
    web_sources: webSourcesPayload.sources || [],
  };

  const manifest = readJson(path.join(dir, "manifest.json"));
  manifest.run_id = runId;
  manifest.status = "transcripts-fetched";
  manifest.updated_at = new Date().toISOString();
  manifest.successful_transcripts = successfulTranscripts;
  manifest.requested_transcripts = transcriptLimit;
  manifest.files = [
    "manifest.json",
    "target.json",
    "context.json",
    "query-plan.json",
    "youtube-candidates.json",
    "selected-videos.json",
    "transcripts.json",
    "web-sources.json",
    "evidence.json",
    "selection-summary.md",
    "validation.json",
    "README.md",
  ];

  writeJson(path.join(dir, "transcripts.json"), { target: target.name, date, run_id: runId, generated_at: new Date().toISOString(), requested_transcripts: transcriptLimit, successful_transcripts: successfulTranscripts, transcripts });
  writeJson(path.join(dir, "evidence.json"), evidence);
  writeJson(path.join(dir, "manifest.json"), manifest);
  console.log(path.join(dir, "transcripts.json"));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

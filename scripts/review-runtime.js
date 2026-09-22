"use strict";

/**
 * Shared host-side runtime collection. Uses Node built-ins only so the workflow
 * can load this exact file from the authenticated shared-release SHA into memory
 * after Codex stops, without executing anything from the consumer checkout.
 *
 * Raw Codex JSONL is normalized here once into the canonical report-event shape.
 * The finalizer validates those collected events against review-contracts.schema.json;
 * it does not reinterpret the raw log or maintain another filtering policy.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

/** Read a bounded regular file, refusing leaf/immediate-parent symlinks and FIFOs. */
function readBounded(filename, max = 2 * 1024 * 1024) {
  const directory = path.dirname(path.resolve(filename));
  assert(!fs.lstatSync(directory).isSymbolicLink(), "Symlinked report directories are not allowed");
  const resolved = path.join(fs.realpathSync(directory), path.basename(filename));
  assert(!fs.lstatSync(resolved).isSymbolicLink(), "Symlinked report paths are not allowed");
  const fd = fs.openSync(resolved, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    assert(stat.isFile() && stat.size <= max, "Output must be a bounded regular file");
    const buffer = Buffer.alloc(stat.size + 1);
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
    assert(bytes <= stat.size, "Output changed while being read");
    return buffer.subarray(0, bytes).toString("utf8");
  } finally { fs.closeSync(fd); }
}

/**
 * Keep supported lifecycle/completed-command observations, never raw command
 * output, error bodies, model messages or unknown events. Output omission is
 * explicit, not the digest of an allegedly observed empty output. Logs are not
 * tamper-proof attestations of provider context or reviewer comprehension.
 */
function collectRuntimeEvents(text) {
  const events = [];
  let session = "unavailable";
  for (const line of text.split("\n")) {
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    if (!entry || typeof entry !== "object") continue;
    if (entry.type === "thread.started" && typeof entry.thread_id === "string") session = entry.thread_id.slice(0, 128);
    if (entry.type === "item.completed" && entry.item?.type === "command_execution") {
      const item = entry.item;
      const command = String(item.command || "");
      const exit = Number.isInteger(item.exit_code) ? item.exit_code : null;
      events.push({ kind: "observed_command", item: String(item.id || "command").slice(0, 128), outcome: exit === null ? "unavailable" : exit === 0 ? "passed" : "failed", sha256: "", detail: `Session: ${session}; command: ${command.slice(0, 4000)}; exit: ${exit ?? "unknown"}; command output intentionally not retained${command.length > 4000 ? "; command text truncated" : ""}. Logged metadata is not exact provider delivery.` });
    } else if (["thread.started", "turn.started", "turn.completed", "turn.failed"].includes(entry.type)) {
      const [item, outcome] = entry.type.split(".");
      events.push({ kind: "runtime_state", item, outcome, sha256: "", detail: `Observed supported Codex JSONL event; session: ${session}` });
    }
    if (events.length === 5000) break;
  }
  return events;
}

/**
 * Retain partial model output and normalized runtime.json in a fresh host-created
 * directory. Record missing/refused inputs independently, so a bad runtime log
 * does not erase a usable result. Return the directory for artifact transport.
 */
function collectReviewOutput({ inputDirectory, outputParent, execution }) {
  assert(["success", "failure", "cancelled", "skipped"].includes(execution), "Unknown execution outcome");
  const directory = fs.mkdtempSync(path.join(outputParent, "review-raw-"));
  const state = { schema_version: 1, execution, files: {} };
  for (const [source, destination, limit] of [
    ["review-result.json", "result.json", 2 * 1024 * 1024],
    ["agent-stdio.log", "runtime.json", 16 * 1024 * 1024],
  ]) {
    try {
      const text = readBounded(path.join(inputDirectory, source), limit);
      const content = destination === "runtime.json" ? JSON.stringify(collectRuntimeEvents(text)) + "\n" : text;
      assert(Buffer.byteLength(content) <= limit, "Normalized output exceeds collection bound");
      fs.writeFileSync(path.join(directory, destination), content);
      state.files[destination] = "retained";
    } catch (error) {
      state.files[destination] = error.code === "ENOENT" ? "missing" : "refused";
    }
  }
  fs.writeFileSync(path.join(directory, "collection.json"), JSON.stringify(state, null, 2) + "\n");
  return directory;
}

module.exports = { readBounded, collectRuntimeEvents, collectReviewOutput };

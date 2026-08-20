import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildReport, detectHarness, findSession, findShellReadPaths, formatReport, main, readJsonl, truncate } from "../scripts/context-review.mjs";
import { attachAdvisorOutput, validateAdvisorOutput } from "../scripts/context-review/advisor-validation.mjs";
import { buildMeasuredDrivers } from "../scripts/context-review/drivers.mjs";
import { attachObservedRequest, buildInMemoryStatsReport, buildStatsReport } from "../scripts/context-review/measurement.mjs";
import { formatStatsReport } from "../scripts/context-review/render.mjs";

const fixtureDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
const skillDirectory = path.join(fixtureDirectory, "..", "..");
const canonicalScript = path.join(skillDirectory, "scripts", "context-review.mjs");
const advisorHandoffScript = path.join(skillDirectory, "scripts", "context-review", "advisor-handoff.mjs");

function assertParserEntrypoint(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath, "--stats", "--agent", "pi", "--session", path.join(fixtureDirectory, "pi.jsonl")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^# Context efficiency/m);
  assert.match(result.stdout, /Harness: pi/);
}

for (const agent of ["codex", "claude", "pi"]) {
  test(`parses ${agent} preserved context`, () => {
    const sessionPath = path.join(fixtureDirectory, `${agent}.jsonl`);
    const { records, parseErrors } = readJsonl(sessionPath);
    assert.equal(detectHarness(records), agent);
    assert.deepEqual(parseErrors, []);

    const report = buildReport(records, sessionPath, "auto", parseErrors);
    assert.equal(report.agent, agent);
    assert.equal(report.cwd, "/workspace/demo");
    assert.ok(report.messages.length >= 2);
    assert.ok(report.fileEvidence.length >= 1);
    assert.ok(report.fileEvidence.some((item) => /(AGENTS|CLAUDE)\.md$/.test(item.path)));
    if (agent === "codex") {
      assert.ok(report.fileEvidence.some((item) => item.path === "docs/architecture.md"));
    }
    const formatted = formatReport(report).replace(`Session: ${sessionPath}`, "Session: <fixture>");
    assert.match(formatted, /Unavailable or uncertain context/);
    assert.equal(formatted, fs.readFileSync(path.join(fixtureDirectory, `${agent}.review.txt`), "utf8"));

    const stats = buildStatsReport(records, report, { explicit: true, ...(agent === "pi" ? { leafId: "message-3" } : {}) });
    stats.session.path = "<fixture>";
    assert.deepEqual(stats, JSON.parse(fs.readFileSync(path.join(fixtureDirectory, `${agent}.stats.json`), "utf8")));
    if (agent === "pi") {
      assert.equal(records[0].version, 3);
      const usage = records.find((record) => record?.message?.role === "assistant")?.message?.usage;
      assert.equal(usage.totalTokens, usage.input + usage.output + usage.cacheRead + usage.cacheWrite);
    }
  });
}

test("session discovery prefers cwd matches and labels newest-session fallback", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "context-review-sessions-"));
  const previousCodexHome = process.env.CODEX_HOME;
  process.env.CODEX_HOME = directory;
  const sessions = path.join(directory, "sessions");
  fs.mkdirSync(sessions, { recursive: true });
  const matching = path.join(sessions, "matching.jsonl");
  const newest = path.join(sessions, "newest.jsonl");
  fs.writeFileSync(matching, `${JSON.stringify({ type: "session_meta", payload: { session_id: "matching", cwd: "/workspace/match" } })}\n`);
  fs.writeFileSync(newest, `${JSON.stringify({ type: "session_meta", payload: { session_id: "newest", cwd: "/workspace/other" } })}\n`);
  const now = Date.now() / 1000;
  fs.utimesSync(matching, now - 10, now - 10);
  fs.utimesSync(newest, now, now);
  try {
    const current = findSession("codex", "/workspace/match");
    assert.equal(current.path, matching);
    assert.equal(current.cwdMatched, true);
    const fallback = findSession("codex", "/workspace/missing");
    assert.equal(fallback.path, newest);
    assert.equal(fallback.cwdMatched, false);
  } finally {
    if (previousCodexHome === undefined) delete process.env.CODEX_HOME;
    else process.env.CODEX_HOME = previousCodexHome;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("fixture harness versions and sanitized capability evidence are recorded separately", () => {
  const versions = JSON.parse(fs.readFileSync(path.join(fixtureDirectory, "harness-versions.json"), "utf8"));
  const evidence = JSON.parse(fs.readFileSync(path.join(fixtureDirectory, "capability-evidence.json"), "utf8"));
  assert.equal(versions.testedHarnessVersions.codex, "codex-cli 0.147.0");
  assert.equal(versions.testedHarnessVersions.claude, "Claude Code 2.1.114");
  assert.equal(versions.testedHarnessVersions.pi, "0.80.6");
  assert.match(versions.fixtures["claude.jsonl"], /synthetic/);
  assert.match(evidence.codex.releaseGate, /^passed/);
  assert.match(evidence.claude.releaseGate, /^passed/);
  assert.match(evidence.claude.presentationLimitation, /Bash tool result/);
  assert.doesNotMatch(JSON.stringify(evidence), /\/Users\//);
});

test("Pi follows the active leaf instead of abandoned branches", () => {
  const records = [
    { type: "session", id: "s", cwd: "/workspace/demo" },
    { type: "message", id: "root", parentId: null, message: { role: "user", content: "start" } },
    { type: "message", id: "old", parentId: "root", message: { role: "assistant", content: "abandoned" } },
    { type: "message", id: "new", parentId: "root", message: { role: "assistant", content: "active" } },
    { type: "model_change", id: "model", parentId: "new", model: "test" },
    { type: "message", id: "latest", parentId: "model", message: { role: "user", content: "latest" } },
  ];
  const report = buildReport(records, "synthetic", "pi");
  assert.match(report.messages.map((item) => item.content).join("\n"), /active/);
  assert.doesNotMatch(report.messages.map((item) => item.content).join("\n"), /abandoned/);
  assert.doesNotMatch(report.limitations.join("\n"), /Unsupported Pi record type: model_change/);
  assert.match(report.limitations.join("\n"), /Known Pi metadata omitted/);
});

test("Pi compaction keeps firstKept entries and branch summaries", () => {
  const records = [
    { type: "session", id: "s", cwd: "/workspace/demo" },
    { type: "message", id: "before", parentId: null, message: { role: "user", content: "before keep" } },
    { type: "message", id: "keep", parentId: "before", message: { role: "user", content: "keep me" } },
    { type: "message", id: "drop", parentId: "keep", message: { role: "assistant", content: "between keep and compaction" } },
    { type: "compaction", id: "compact", parentId: "drop", firstKeptEntryId: "keep", summary: "summary" },
    { type: "branch_summary", id: "branch", parentId: "compact", summary: "branch note" },
    { type: "message", id: "after", parentId: "branch", message: { role: "user", content: "after compaction" } },
  ];
  const report = buildReport(records, "synthetic", "pi");
  const messageText = report.messages.map((item) => item.content).join("\n");
  assert.match(messageText, /keep me|after compaction/);
  assert.doesNotMatch(messageText, /before keep/);
  assert.match(messageText, /between keep and compaction/);
  assert.ok(report.compactions.some((item) => item.content === "summary"));
  assert.ok(report.branchSummaries.some((item) => item.content === "branch note"));
  assert.equal(report.compactions.some((item) => item.content === "branch note"), false);
});

test("Pi compaction excludes replaced content from active messages but retains historical usage", () => {
  const records = [
    { type: "session", version: 3, id: "s", cwd: "/workspace/demo" },
    { type: "message", id: "before", parentId: null, message: { role: "assistant", content: "REPLACED_CONTENT", usage: { input: 10, output: 2, cacheRead: 3, cacheWrite: 1, totalTokens: 16 } } },
    { type: "message", id: "keep", parentId: "before", message: { role: "user", content: "keep" } },
    { type: "compaction", id: "compact", parentId: "keep", firstKeptEntryId: "keep", summary: "summary", tokensBefore: 16 },
    { type: "message", id: "after", parentId: "compact", message: { role: "assistant", content: "after", usage: { input: 20, output: 4, cacheRead: 5, cacheWrite: 2, totalTokens: 31 } } },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "pi"), { leafId: "after" });
  assert.equal(stats.usage.cumulative.input, 30);
  assert.equal(stats.usage.cumulative.output, 6);
  assert.equal(stats.metrics.find((item) => item.id === "session.model_calls").value, 2);
  assert.equal(stats.metrics.find((item) => item.id === "session.compactions").value, 1);
  const changedReplacedContent = structuredClone(records);
  changedReplacedContent[1].message.content = "X".repeat(10000);
  const comparison = buildStatsReport(changedReplacedContent, buildReport(changedReplacedContent, "fixture", "pi"), { leafId: "after" });
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").value, comparison.metrics.find((item) => item.id === "active.serialized_bytes").value);
  assert.doesNotMatch(formatStatsReport(stats), /REPLACED_CONTENT/);
});

test("Claude parent reconstruction excludes abandoned content while retaining its usage", () => {
  const records = [
    { type: "user", uuid: "root", parentUuid: null, cwd: "/workspace/demo", sessionId: "s", message: { role: "user", content: "root" } },
    { type: "assistant", uuid: "abandoned", parentUuid: "root", cwd: "/workspace/demo", sessionId: "s", message: { role: "assistant", content: "ABANDONED_CONTENT", usage: { input_tokens: 10, output_tokens: 2 } } },
    { type: "assistant", uuid: "active", parentUuid: "root", cwd: "/workspace/demo", sessionId: "s", message: { role: "assistant", content: "active", usage: { input_tokens: 20, output_tokens: 4 } } },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "claude"));
  assert.equal(stats.usage.cumulative.input, 30);
  assert.equal(stats.metrics.find((item) => item.id === "session.model_calls").value, 2);
  const activeOnly = structuredClone(records);
  activeOnly[1].message.content = "X".repeat(10000);
  const comparison = buildStatsReport(activeOnly, buildReport(activeOnly, "fixture", "claude"));
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").value, comparison.metrics.find((item) => item.id === "active.serialized_bytes").value);
  assert.doesNotMatch(formatStatsReport(stats), /ABANDONED_CONTENT/);
});

test("Codex compaction replacement history defines active composition", () => {
  const records = [
    { type: "session_meta", payload: { session_id: "s", cwd: "/workspace/demo" } },
    { type: "response_item", payload: { type: "message", role: "user", content: [{ type: "input_text", text: "REPLACED_CODEX_CONTENT" }] } },
    { type: "compacted", payload: { replacement_history: [{ type: "message", role: "user", content: [{ type: "input_text", text: "summary" }] }] } },
    { type: "response_item", payload: { type: "message", role: "assistant", content: [{ type: "output_text", text: "after" }] } },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "codex"));
  const changedOldContent = structuredClone(records);
  changedOldContent[1].payload.content[0].text = "X".repeat(10000);
  const comparison = buildStatsReport(changedOldContent, buildReport(changedOldContent, "fixture", "codex"));
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").value, comparison.metrics.find((item) => item.id === "active.serialized_bytes").value);
  assert.doesNotMatch(formatStatsReport(stats), /REPLACED_CODEX_CONTENT/);
});

test("URL arguments are referenced resources, not local file evidence", () => {
  const report = buildReport([
    { type: "session", id: "s", cwd: "/workspace/demo" },
    { type: "message", id: "m", parentId: null, message: { role: "assistant", content: [
      { type: "toolCall", id: "t1", name: "browser", arguments: { url: "https://example.com/docs" } },
      { type: "toolCall", id: "t2", name: "lookup", arguments: { uri: "file:///tmp/example.txt" } },
      { type: "toolCall", id: "t3", name: "lookup", arguments: { uri: "vscode://file/tmp/example.txt" } },
      { type: "toolCall", id: "t4", name: "lookup", arguments: { uri: "C:\\repo\\file.md" } },
      { type: "toolCall", id: "t5", name: "lookup", arguments: { uri: "C:repo\\file.md" } },
      { type: "toolCall", id: "t6", name: "lookup", arguments: { uri: "C:file.md" } },
      { type: "toolCall", id: "t7", name: "read", arguments: { path: "C:\\repo\\file.md" } },
    ] } },
  ], "synthetic", "pi");
  assert.equal(report.fileEvidence.some((item) => item.path?.startsWith("http")), false);
  assert.deepEqual(report.referencedResources.map((item) => item.resource), [
    "https://example.com/docs",
    "file:///tmp/example.txt",
    "vscode://file/tmp/example.txt",
  ]);
  assert.ok(report.fileEvidence.some((item) => item.path === "C:\\repo\\file.md"));
  assert.match(formatReport(report), /not proof of access/);
});

test("direct parser invocation runs the entry point", () => {
  assertParserEntrypoint(canonicalScript);
});

test("parser invocation through a symbolic link runs the entry point", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "context-review-link-"));
  const linkedScript = path.join(directory, "context-review.mjs");
  try {
    fs.symlinkSync(canonicalScript, linkedScript, "file");
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    if (["EPERM", "EACCES", "ENOTSUP"].includes(error.code)) return context.skip(`symbolic links unavailable: ${error.code}`);
    throw error;
  }
  try {
    assertParserEntrypoint(linkedScript);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("parser invocation through a directory junction runs the entry point", (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "context-review-junction-"));
  const linkedSkill = path.join(directory, "context-review");
  try {
    fs.symlinkSync(skillDirectory, linkedSkill, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true });
    if (["EPERM", "EACCES", "ENOTSUP"].includes(error.code)) return context.skip(`directory links unavailable: ${error.code}`);
    throw error;
  }
  try {
    assertParserEntrypoint(path.join(linkedSkill, "scripts", "context-review.mjs"));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("parser invocation from a copied Claude skill installation runs the entry point", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "context-review-copy-"));
  const installedSkill = path.join(directory, ".claude", "skills", "context-review");
  try {
    fs.cpSync(skillDirectory, installedSkill, { recursive: true });
    assertParserEntrypoint(path.join(installedSkill, "scripts", "context-review.mjs"));
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("packaged Pi parser matches the canonical skill parser", () => {
  const canonicalDirectory = path.join(fixtureDirectory, "..", "..", "scripts");
  const packagedDirectory = path.join(fixtureDirectory, "..", "..", "..", "..", "pi-extensions", "context-review");
  assert.equal(fs.readFileSync(path.join(packagedDirectory, "context-review.mjs"), "utf8"), fs.readFileSync(path.join(canonicalDirectory, "context-review.mjs"), "utf8"));
  for (const module of ["advisor-validation.mjs", "drivers.mjs", "measurement.mjs", "model.mjs", "privacy.mjs", "render.mjs"]) {
    assert.equal(fs.readFileSync(path.join(packagedDirectory, "context-review", module), "utf8"), fs.readFileSync(path.join(canonicalDirectory, "context-review", module), "utf8"));
  }
  assert.equal(fs.readFileSync(path.join(packagedDirectory, "advisor-output-schema.json"), "utf8"), fs.readFileSync(path.join(skillDirectory, "advisor-output-schema.json"), "utf8"));
  assert.equal(fs.readFileSync(path.join(packagedDirectory, "advisor.md"), "utf8"), fs.readFileSync(path.join(skillDirectory, "prompts", "advisor.md"), "utf8"));
});

test("shell evidence is conservative and retains uncertainty", () => {
  assert.deepEqual(findShellReadPaths("cat '*.md'"), []);
  assert.deepEqual(findShellReadPaths("cat 'notes without extension'"), [{ path: "notes without extension", certainty: "likely" }]);
  assert.deepEqual(findShellReadPaths("cat $README"), [{ path: "$README", certainty: "uncertain" }]);
});

test("--output writes reports without overwriting the session", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "context-review-"));
  const sessionPath = path.join(directory, "session.jsonl");
  const outputPath = path.join(directory, "report.md");
  fs.copyFileSync(path.join(fixtureDirectory, "pi.jsonl"), sessionPath);
  main(["--agent", "pi", "--session", sessionPath, "--output", outputPath]);
  assert.match(fs.readFileSync(outputPath, "utf8"), /^# Context review/);
  assert.throws(() => main(["--agent", "pi", "--session", sessionPath, "--output", sessionPath]), /must not overwrite/);
  assert.throws(() => main(["--agent", "pi", "--session", sessionPath, "--output", outputPath]), /already exists/);
  main(["--agent", "pi", "--session", sessionPath, "--output", outputPath, "--force"]);
  fs.rmSync(directory, { recursive: true, force: true });
});

test("truncation is explicit", () => {
  const value = truncate("abcdefghij", 5);
  assert.equal(value.truncated, true);
  assert.match(value.text, /truncated 5 characters/);
});

test("Codex stats preserve provider usage fields and capacity exactly", () => {
  const records = [
    { type: "session_meta", payload: { session_id: "s", cwd: "/workspace/demo" } },
    { type: "turn_context", payload: { model: "test-model" } },
    { type: "response_item", payload: { type: "message", role: "user", content: [{ type: "input_text", text: "hello" }] } },
    { type: "event_msg", payload: { type: "token_count", info: {
      model_context_window: 200000,
      last_token_usage: { input_tokens: 100, cached_input_tokens: 60, cache_write_input_tokens: 7, output_tokens: 9, reasoning_output_tokens: 3, total_tokens: 109 },
      total_token_usage: { input_tokens: 250, cached_input_tokens: 140, cache_write_input_tokens: 11, output_tokens: 20, reasoning_output_tokens: 8, total_tokens: 270 },
    } } },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "codex"), { explicit: true });
  assert.deepEqual(stats.usage.latest, { input: 100, cachedInput: 60, cacheRead: null, cacheWrite: 7, output: 9, reasoningOutput: 3, providerTotal: 109 });
  assert.equal(stats.usage.cumulative.providerTotal, 270);
  assert.equal(stats.metrics.find((item) => item.id === "context.capacity").value, 200000);
  assert.equal(stats.session.model, "test-model");
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").scope, "active_reconstructed_messages");
  const withPersistenceMetadata = structuredClone(records);
  withPersistenceMetadata[2].payload.persisted_only = "X".repeat(10000);
  const comparison = buildStatsReport(withPersistenceMetadata, buildReport(withPersistenceMetadata, "fixture", "codex"), { explicit: true });
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").value, comparison.metrics.find((item) => item.id === "active.serialized_bytes").value);
});

test("Claude stats preserve cache semantics and sum observable calls", () => {
  const records = [
    { parentUuid: null, type: "user", uuid: "u", sessionId: "s", cwd: "/workspace/demo", message: { role: "user", content: "hello" } },
    { parentUuid: "u", type: "assistant", uuid: "a1", sessionId: "s", cwd: "/workspace/demo", message: { role: "assistant", model: "claude-test", content: "one", usage: { input_tokens: 10, cache_creation_input_tokens: 2, cache_read_input_tokens: 3, output_tokens: 4 } } },
    { parentUuid: "a1", type: "assistant", uuid: "a2", sessionId: "s", cwd: "/workspace/demo", message: { role: "assistant", model: "claude-test", content: "two", usage: { input_tokens: 20, cache_creation_input_tokens: 5, cache_read_input_tokens: 7, output_tokens: 8 } } },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "claude"));
  assert.equal(stats.usage.latest.cacheWrite, 5);
  assert.equal(stats.usage.latest.cacheRead, 7);
  assert.equal(stats.usage.cumulative.input, 30);
  assert.equal(stats.metrics.find((item) => item.id === "session.model_calls").value, 2);
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").scope, "active_reconstructed_messages");
  const withLargeUsage = structuredClone(records);
  withLargeUsage[2].message.usage.input_tokens = 999999999999;
  const comparison = buildStatsReport(withLargeUsage, buildReport(withLargeUsage, "fixture", "claude"));
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").value, comparison.metrics.find((item) => item.id === "active.serialized_bytes").value);
});

test("Pi stats use the live leaf and include abandoned-branch usage historically", () => {
  const records = [
    { type: "session", version: 3, id: "s", cwd: "/workspace/demo" },
    { type: "message", id: "root", parentId: null, message: { role: "user", content: "start" } },
    { type: "message", id: "active", parentId: "root", message: { role: "assistant", content: "active", usage: { input: 50, output: 5, cacheRead: 10, cacheWrite: 1, reasoning: 2, totalTokens: 66 } } },
    { type: "message", id: "abandoned", parentId: "root", message: { role: "assistant", content: "ABANDONED_SECRET_WITH_MUCH_MORE_CONTENT", usage: { input: 100, output: 10, cacheRead: 20, cacheWrite: 2, reasoning: 4, totalTokens: 132 } } },
  ];
  const report = buildReport(records, "fixture", "pi");
  const stats = buildStatsReport(records, report, { leafId: "active" });
  const persistedCandidate = buildStatsReport(records, report);
  assert.equal(stats.usage.cumulative.input, 150);
  assert.equal(stats.metrics.find((item) => item.id === "session.model_calls").value, 2);
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").scope, "active_reconstructed_messages");
  assert.equal(persistedCandidate.metrics.find((item) => item.id === "active.serialized_bytes").scope, "latest_persisted_branch_candidate");
  assert.notEqual(stats.metrics.find((item) => item.id === "active.serialized_bytes").value, persistedCandidate.metrics.find((item) => item.id === "active.serialized_bytes").value);
  assert.doesNotMatch(JSON.stringify(stats), /ABANDONED_SECRET/);
  assert.ok(Math.abs(stats.composition.reduce((sum, item) => sum + item.share, 0) - 100) <= 0.2);
});

test("Pi composition uses provider-facing messages and excludes persistence-only data", () => {
  const reasoning = { type: "thinking", thinking: "private reasoning body", thinkingSignature: "signature" };
  const records = [
    { type: "session", version: 3, id: "s", cwd: "/workspace/demo" },
    // Deliberately contradictory persistence-only usage proves composition ignores usage metadata.
    { type: "message", id: "root", parentId: null, message: { role: "assistant", model: "test", content: [reasoning], usage: { input: 999999999, output: 1, cacheRead: 0, cacheWrite: 0, totalTokens: 2 }, timestamp: 999999999 } },
    { type: "message", id: "bash", parentId: "root", message: { role: "bashExecution", command: "echo private", output: "result", exitCode: 0, timestamp: 1 } },
    { type: "message", id: "excluded", parentId: "bash", message: { role: "bashExecution", command: "secret command", output: "X".repeat(10000), excludeFromContext: true, timestamp: 2 } },
    { type: "custom_message", id: "custom", parentId: "excluded", content: "custom context", details: { private: "Y".repeat(10000) }, customType: "private-type", display: true },
    { type: "branch_summary", id: "summary", parentId: "custom", summary: "branch context", fromId: "other" },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "pi"), { leafId: "summary" });
  const withoutPersistenceOnly = structuredClone(records);
  withoutPersistenceOnly[1].message.usage.input = 1;
  withoutPersistenceOnly[1].message.timestamp = 1;
  withoutPersistenceOnly[3].message.output = "";
  withoutPersistenceOnly[4].details = {};
  const comparison = buildStatsReport(withoutPersistenceOnly, buildReport(withoutPersistenceOnly, "fixture", "pi"), { leafId: "summary" });
  const byCategory = Object.fromEntries(stats.composition.map((item) => [item.category, item]));
  assert.ok(byCategory.reasoning.value >= Buffer.byteLength(JSON.stringify(reasoning)));
  assert.ok(byCategory.user.value > 0);
  assert.ok(byCategory.other.value > 0);
  assert.equal(stats.metrics.find((item) => item.id === "active.serialized_bytes").value, comparison.metrics.find((item) => item.id === "active.serialized_bytes").value);
  assert.ok(stats.composition.every((item) => item.evidence === "exact_serialized_local_representation"));
  assert.doesNotMatch(formatStatsReport(stats), /private reasoning body|echo private|branch context|secret command|private-type/);
});

test("Pi model and effort follow the live branch and prefer runtime values", () => {
  const records = [
    { type: "session", version: 3, id: "s", cwd: "/workspace/demo" },
    { type: "model_change", id: "root-model", parentId: null, modelId: "root-model" },
    { type: "thinking_level_change", id: "root-effort", parentId: "root-model", thinkingLevel: "low" },
    { type: "model_change", id: "active", parentId: "root-effort", modelId: "active-model" },
    { type: "model_change", id: "abandoned", parentId: "root-effort", modelId: "abandoned-model" },
  ];
  const report = buildReport(records, "fixture", "pi");
  const active = buildStatsReport(records, report, { leafId: "active" });
  assert.equal(active.session.model, "active-model");
  assert.equal(active.session.effort, "low");
  const runtime = buildStatsReport(records, report, { leafId: "active", runtimeModel: "runtime/model", runtimeEffort: "high" });
  assert.equal(runtime.session.model, "runtime/model");
  assert.equal(runtime.session.effort, "high");
});

test("unpersisted Pi stats retain the canonical report shape", () => {
  const startup = buildInMemoryStatsReport({ cwd: "/workspace/demo", systemPrompt: "prompt", model: "provider/model", effort: "medium" });
  const persisted = buildStatsReport([{ type: "session", version: 3, id: "s", cwd: "/workspace/demo" }], buildReport([{ type: "session", version: 3, id: "s", cwd: "/workspace/demo" }], "fixture", "pi"));
  assert.deepEqual(Object.keys(startup), Object.keys(persisted));
  assert.deepEqual(Object.keys(startup.usage.latest), Object.keys(persisted.usage.latest));
  assert.deepEqual(Object.keys(startup.usage.cumulative), Object.keys(persisted.usage.cumulative));
  assert.deepEqual(startup.metrics.map((item) => item.id), persisted.metrics.map((item) => item.id));
});

test("Pi observed request composition is exact-scoped, mutually exclusive, and content-safe", () => {
  const base = buildInMemoryStatsReport({ cwd: "/workspace/demo", systemPrompt: "startup" });
  base.limitations.push(
    "When the Pi context-review extension is loaded, /context-review can additionally show the exact latest payload observed by its provider-request hook.",
    "Payload changes made by extensions loaded after context-review are not visible to its hook.",
    "Pi composition measures reconstructed provider-facing messages only; the system prompt, tool definitions, and later extension payload changes are outside this scope.",
  );
  const payload = {
    model: "test-model",
    system: "private system",
    tools: [{ name: "private-tool", description: "private definition" }],
    messages: [
      { role: "user", content: [{ type: "text", text: "private user" }] },
      { role: "assistant", content: [{ type: "tool_use", name: "private-tool", input: { secret: "value" } }] },
      { role: "user", content: [{ type: "tool_result", content: "private result" }] },
    ],
  };
  const usageBeforeObservation = structuredClone(base.usage);
  const stats = attachObservedRequest(base, payload, "2026-08-16T00:00:00Z");
  assert.equal(stats.observedRequest.available, true);
  assert.deepEqual(stats.usage, usageBeforeObservation);
  assert.equal(stats.metrics.find((item) => item.id === "request.serialized_bytes").value, Buffer.byteLength(JSON.stringify(payload)));
  assert.ok(stats.composition.every((item) => item.scope === "latest_observed_request_payload" && item.evidence === "exact_observed"));
  assert.ok(Math.abs(stats.composition.reduce((sum, item) => sum + item.share, 0) - 100) <= 0.2);
  const rendered = formatStatsReport(stats);
  assert.doesNotMatch(rendered, /private system|private-tool|private user|private result|secret/);
  assert.doesNotMatch(rendered, /can additionally show|composition measures reconstructed provider-facing messages/i);
  assert.equal(stats.limitations.filter((item) => /later-loaded extensions/i.test(item)).length, 1);
  const unavailable = attachObservedRequest(base, undefined);
  assert.equal(unavailable.observedRequest.available, false);
});

test("stats JSON preserves canonical metric fields and explicit unavailable values", () => {
  const records = [{ type: "session", version: 3, id: "s", cwd: "/workspace/demo" }];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "pi"));
  assert.equal(stats.schemaVersion, 1);
  for (const item of stats.metrics) {
    for (const field of ["id", "name", "value", "unit", "scope", "evidence", "source", "approximate", "limitation"]) assert.ok(field in item, `${item.id} missing ${field}`);
  }
  assert.equal(stats.metrics.find((item) => item.id === "active.tokens").value, null);
  assert.equal(stats.metrics.find((item) => item.id === "context.capacity").value, null);
  assert.ok(stats.contributors.length <= 10);
  assert.ok(stats.composition.every((item) => item.unit === "bytes"));
});

test("stats redact custom metadata names and sensitive session metadata", () => {
  const secret = "api_key_sk_live_SECRET123";
  const records = [
    { type: "session_meta", payload: { session_id: secret, cwd: `/workspace/${secret}` } },
    { type: "turn_context", payload: { model: secret } },
    { type: "response_item", payload: { type: secret, value: "hidden" } },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "codex"));
  assert.doesNotMatch(JSON.stringify(stats), new RegExp(secret));
  assert.equal(stats.contributors[0].type, "custom");
  assert.match(stats.contributors[0].id, /:custom:/);
  assert.equal(stats.session.id, "[redacted]");
  assert.equal(stats.session.model, "[redacted]");
});

test("stats rendering is compact and contains no raw transcript or arguments", () => {
  const records = [
    { type: "session", id: "s", cwd: "/workspace/demo" },
    { type: "unknown-secret-bearing-type", id: "unknown", parentId: null, content: "raw-secret" },
  ];
  let parentId = null;
  for (let index = 0; index < 15; index += 1) {
    const id = `m${index}`;
    records.push({ type: "message", id, parentId, message: { role: "user", content: `secret-${index}` } });
    parentId = id;
  }
  const text = formatStatsReport(buildStatsReport(records, buildReport(records, "fixture", "pi")));
  assert.ok(text.split("\n").length < 100);
  assert.ok(Buffer.byteLength(text) < 8192);
  assert.doesNotMatch(text, /secret-|raw-secret|unknown-secret-bearing-type/);
  assert.equal((text.match(/^\d+\./gm) ?? []).length, 10);
});

test("standalone --advise makes no model call and uses harness-specific referral syntax", () => {
  const script = path.join(fixtureDirectory, "..", "..", "scripts", "context-review.mjs");
  const codex = spawnSync(process.execPath, [script, "--agent", "codex", "--advise"], { encoding: "utf8" });
  const claude = spawnSync(process.execPath, [script, "--agent", "claude", "--advise"], { encoding: "utf8" });
  assert.equal(codex.status, 0);
  assert.match(codex.stdout, /\$context-review --stats --advise/);
  assert.match(codex.stdout, /no model call was made/);
  assert.match(claude.stdout, /\/context-review --stats --advise/);
});

test("Pi extension passes the live leaf and rejects native session overrides", () => {
  const extension = fs.readFileSync(path.join(fixtureDirectory, "..", "..", "..", "..", "pi-extensions", "context-review", "index.ts"), "utf8");
  assert.match(extension, /sessionManager\.getLeafId\(\)/);
  assert.match(extension, /"--leaf-id"/);
  assert.match(extension, /"--runtime-model"/);
  assert.match(extension, /"--runtime-effort"/);
  assert.match(extension, /parsed\.session\.selection = "current_session"/);
  assert.match(extension, /nativeOverrideArgument/);
  assert.match(extension, /token === "--agent"/);
  assert.match(extension, /token === "--session"/);
  assert.match(extension, /await ctx\.waitForIdle\(\)/);
  assert.match(extension, /buildSessionContext\(\)/);
  assert.match(extension, /getSystemPrompt\(\)/);
  assert.match(extension, /getAllTools\(\)/);
  assert.doesNotMatch(extension, /sourceInfo: tool\.sourceInfo/);
  assert.match(extension, /getApiKeyAndHeaders\(ctx\.model\)/);
  assert.match(extension, /=> complete\(/);
  assert.match(extension, /attachAdvisorOutput/);
});

test("deterministic drivers cite measured scope and concrete contributors", () => {
  const stats = {
    session: { harness: "pi" },
    metrics: [
      { id: "active.serialized_bytes", value: 1000 },
      { id: "session.model_calls", value: 3 },
    ],
    usage: {
      latest: { input: 500 },
      cumulative: { input: 1800 },
      cumulativeScope: "cumulative_inspected_session",
      evidence: "provider_reported",
    },
    composition: [{ category: "tool_results", value: 600, unit: "bytes", share: 60, scope: "active_reconstructed_messages", evidence: "exact_serialized_local_representation" }],
    contributors: [{ id: "tool-results:tool-result:1", category: "tool_results", type: "tool_result", value: 600, unit: "bytes", share: 60, scope: "active_reconstructed_messages", evidence: "exact_serialized_local_representation" }],
  };
  const drivers = buildMeasuredDrivers(stats);
  assert.deepEqual(drivers.map((item) => item.id), ["driver.history_replay", "driver.large_active_contributor"]);
  assert.ok(drivers.length <= 3);
  assert.ok(drivers.every((item) => item.scope && item.evidence));
  assert.deepEqual(drivers[0].contributorIds, []);
  assert.ok(drivers[1].contributorIds.length > 0);
  assert.match(drivers[0].limitation, /does not isolate/);
  assert.match(drivers[1].limitation, /does not establish/);
});

test("exact repeated tool content produces a safe repeat driver", () => {
  const records = [
    { type: "session", version: 3, id: "s", cwd: "/workspace/demo" },
    { type: "message", id: "one", parentId: null, message: { role: "assistant", content: [{ type: "toolCall", id: "same", name: "read", arguments: { path: "private.txt" } }] } },
    { type: "message", id: "two", parentId: "one", message: { role: "assistant", content: [{ type: "toolCall", id: "same", name: "read", arguments: { path: "private.txt" } }] } },
  ];
  const stats = buildStatsReport(records, buildReport(records, "fixture", "pi"), { leafId: "two" });
  const repeated = stats.measuredDrivers.find((item) => item.id === "driver.exact_repeat");
  assert.equal(repeated.observations[0].value, 2);
  assert.equal(repeated.contributorIds.length, 1);
  assert.doesNotMatch(JSON.stringify(repeated), /private\.txt/);
});

test("standing-context driver is silent without a concrete standing contributor", () => {
  const base = {
    session: { harness: "pi" },
    metrics: [{ id: "active.serialized_bytes", value: 1000 }, { id: "session.model_calls", value: 1 }],
    usage: { latest: { input: 10 }, cumulative: { input: 10 }, cumulativeScope: "cumulative_inspected_session", evidence: "provider_reported" },
    composition: [{ category: "instructions", value: 500, unit: "bytes", share: 50, scope: "active_reconstructed_messages", evidence: "exact_serialized_local_representation" }],
    contributors: [],
  };
  assert.deepEqual(buildMeasuredDrivers(base), []);
  base.contributors.push({ id: "instructions:base-instructions:1", category: "instructions", value: 500, unit: "bytes", share: 50, scope: "active_reconstructed_messages", evidence: "exact_serialized_local_representation" });
  assert.equal(buildMeasuredDrivers(base).at(-1).id, "driver.standing_context");
});

test("advisor validation accepts grounded output and rejects unknown evidence or unsupported commands", () => {
  const stats = {
    session: { harness: "codex" },
    metrics: [{ id: "active.serialized_bytes", unit: "bytes" }, { id: "session.model_calls", unit: "calls" }],
    measuredDrivers: [{ id: "driver.large_active_contributor" }],
    contributors: [{ id: "tool-results:tool-result:1" }],
  };
  const output = validAdvisorOutput();
  assert.deepEqual(validateAdvisorOutput(output, stats), { valid: true, errors: [], value: output });

  const unknown = structuredClone(output);
  unknown.recommendedActions[0].metricIds = ["missing.metric"];
  const unknownResult = validateAdvisorOutput(unknown, stats);
  assert.equal(unknownResult.valid, false);
  assert.match(unknownResult.errors.join("\n"), /unknown evidence ID missing\.metric/);

  const unsafe = structuredClone(output);
  unsafe.contextAction = {
    ...unsafe.contextAction,
    recommendation: "compact",
    command: { harness: "codex", kind: "command", name: "/compact", args: ["instructions"], settingScope: null },
  };
  const unsafeResult = validateAdvisorOutput(unsafe, stats);
  assert.equal(unsafeResult.valid, false);
  assert.match(unsafeResult.errors.join("\n"), /\/compact requires 0 argument/);
});

test("model-mediated advisor handoff uses frozen stats without rereading the session", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "context-review-advisor-"));
  const frozenPath = path.join(directory, "stats.json");
  const candidatePath = path.join(directory, "candidate.json");
  const mutableSession = path.join(directory, "session.jsonl");
  fs.copyFileSync(path.join(fixtureDirectory, "codex.jsonl"), mutableSession);
  const candidate = validAdvisorOutput();
  candidate.recommendedActions[0].driverIds = ["driver.large_active_contributor"];
  candidate.recommendedActions[0].metricIds = ["active.serialized_bytes"];
  candidate.recommendedActions[0].contributorIds = ["tool-calls:custom-tool-call:1"];
  try {
    const base = spawnSync(process.execPath, [canonicalScript, "--stats", "--json", "--agent", "codex", "--session", mutableSession], { encoding: "utf8" });
    assert.equal(base.status, 0, base.stderr);
    const baseReport = JSON.parse(base.stdout);
    candidate.modelFit.currentModel = baseReport.session.model ?? "unavailable";
    candidate.modelFit.currentEffort = baseReport.session.effort ?? "unavailable";
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));
    fs.writeFileSync(frozenPath, base.stdout);
    fs.appendFileSync(mutableSession, `${JSON.stringify({ type: "response_item", payload: { type: "message", role: "user", content: [{ type: "input_text", text: "session changed after freeze" }] } })}\n`);
    const advised = spawnSync(process.execPath, [advisorHandoffScript, "--json", "--agent", "codex", "--stats-input", frozenPath, "--advice-input", candidatePath], { encoding: "utf8" });
    assert.equal(advised.status, 0, advised.stderr);
    const advisedReport = JSON.parse(advised.stdout);
    const deterministicPart = structuredClone(advisedReport);
    delete deterministicPart.advisor;
    delete deterministicPart.advisorOverhead;
    assert.deepEqual(deterministicPart, baseReport);
    assert.equal(advisedReport.advisor.status, "available");
    assert.equal(advisedReport.advisor.output.summary, candidate.summary);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("malformed model-mediated advisor output returns frozen stats plus a limitation", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "context-review-advisor-invalid-"));
  const frozenPath = path.join(directory, "stats.json");
  const candidatePath = path.join(directory, "candidate.json");
  const base = spawnSync(process.execPath, [canonicalScript, "--stats", "--json", "--agent", "claude", "--session", path.join(fixtureDirectory, "claude.jsonl")], { encoding: "utf8" });
  fs.writeFileSync(frozenPath, base.stdout);
  fs.writeFileSync(candidatePath, "not-json");
  try {
    const result = spawnSync(process.execPath, [advisorHandoffScript, "--agent", "claude", "--stats-input", frozenPath, "--advice-input", candidatePath], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Advice unavailable: Advisor output was not valid JSON/);
    assert.match(result.stdout, /## Active context|## Active reconstructed messages/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("public parser rejects the internal advisor handoff argument", () => {
  const result = spawnSync(process.execPath, [canonicalScript, "--stats", "--advisor-output", "candidate.json"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown argument: --advisor-output/);
});

test("advisor semantic validation suppresses unsupported capabilities and mismatched reducible scope", () => {
  const stats = {
    session: { harness: "claude" },
    metrics: [{ id: "active.serialized_bytes", value: 100, unit: "bytes", scope: "active_reconstructed_messages" }],
    measuredDrivers: [], contributors: [],
  };
  const unsupported = validAdvisorOutput();
  unsupported.modelFit = {
    ...unsupported.modelFit,
    recommendation: "faster_model",
    proposedModel: "invented-model",
    command: { harness: "claude", kind: "command", name: "/model", args: ["invented-model"], settingScope: null },
  };
  assert.match(validateAdvisorOutput(unsupported, stats).errors.join("\n"), /require harness-exposed capability evidence/);

  const mismatchedModelCommand = structuredClone(unsupported);
  const capableStats = { ...stats, capabilities: { availableModels: ["supported-model"], availableEfforts: ["low"], supportedSettings: [] } };
  mismatchedModelCommand.modelFit.proposedModel = "supported-model";
  mismatchedModelCommand.modelFit.command.args = ["invented-model"];
  assert.match(validateAdvisorOutput(mismatchedModelCommand, capableStats).errors.join("\n"), /command\.args: model is not exposed/);

  const persistent = validAdvisorOutput();
  persistent.persistentCompactionAdvice = [{
    setting: "invented.setting", currentValue: null, proposedValue: "value", stability: "stable",
    evidenceIds: ["active.serialized_bytes"], expectedEffect: "Reduce future context.", risk: "May omit state.", rollback: "Remove it.", limitations: [],
  }];
  assert.match(validateAdvisorOutput(persistent, stats).errors.join("\n"), /setting is not exposed as supported/);

  const reducible = validAdvisorOutput();
  reducible.contextAction.estimatedReducibleScope = { value: 101, unit: "tokens", scope: "wrong_scope", metricId: "active.serialized_bytes", qualification: "Upper bound." };
  const errors = validateAdvisorOutput(reducible, stats).errors.join("\n");
  assert.match(errors, /unit: must match/);
  assert.match(errors, /scope: must match/);
  assert.match(errors, /value: cannot exceed/);
});

test("advisor validation enforces field-specific commands, evidence, and metric grounding", () => {
  const stats = {
    session: { harness: "claude", model: "current-model", effort: "medium" },
    metrics: [{ id: "active.serialized_bytes", value: 100, unit: "bytes", scope: "active_reconstructed_messages" }],
    measuredDrivers: [{ id: "driver.large_active_contributor" }], contributors: [],
    capabilities: { availableModels: ["faster-model"], availableEfforts: ["low"], supportedSettings: ["compact_prompt"] },
  };

  const wrongContextCommand = advisorWithoutActions();
  wrongContextCommand.modelFit.currentModel = "current-model";
  wrongContextCommand.modelFit.currentEffort = "medium";
  wrongContextCommand.contextAction = {
    recommendation: "compact", evidenceIds: ["driver.large_active_contributor"], reason: "Same task continues.",
    estimatedReducibleScope: { value: 50, unit: "bytes", scope: "active_reconstructed_messages", metricId: "active.serialized_bytes", qualification: "Upper bound." },
    preserve: [{ category: "goal", description: "Current goal.", evidenceIds: ["driver.large_active_contributor"] }], reduce: [], risk: "Older details may be lost.",
    command: { harness: "claude", kind: "command", name: "/model", args: ["faster-model"], settingScope: null },
  };
  assert.match(validateAdvisorOutput(wrongContextCommand, stats).errors.join("\n"), /compact requires the harness \/compact command/);

  const wrongModelCommand = advisorWithoutActions();
  wrongModelCommand.modelFit = {
    ...wrongModelCommand.modelFit, currentModel: "current-model", currentEffort: "medium", recommendation: "faster_model",
    proposedModel: "faster-model", evidenceIds: ["active.serialized_bytes"],
    command: { harness: "claude", kind: "command", name: "/compact", args: [], settingScope: null },
  };
  assert.match(validateAdvisorOutput(wrongModelCommand, stats).errors.join("\n"), /model recommendation must use \/model/);

  const missingEvidence = advisorWithoutActions();
  missingEvidence.modelFit.currentModel = "current-model";
  missingEvidence.modelFit.currentEffort = "medium";
  missingEvidence.contextAction.recommendation = "continue";
  assert.match(validateAdvisorOutput(missingEvidence, stats).errors.join("\n"), /contextAction\.evidenceIds: a recommendation requires evidence/);

  const incompleteCompact = advisorWithoutActions();
  incompleteCompact.modelFit.currentModel = "current-model";
  incompleteCompact.modelFit.currentEffort = "medium";
  incompleteCompact.contextAction = {
    ...incompleteCompact.contextAction, recommendation: "compact", evidenceIds: ["active.serialized_bytes"],
    command: { harness: "claude", kind: "command", name: "/compact", args: [], settingScope: null },
  };
  const compactErrors = validateAdvisorOutput(incompleteCompact, stats).errors.join("\n");
  assert.match(compactErrors, /compact requires grounded reducible scope/);
  assert.match(compactErrors, /compact requires a preservation manifest/);

  const wrongCurrent = advisorWithoutActions();
  wrongCurrent.modelFit.currentModel = "wrong-model";
  wrongCurrent.modelFit.currentEffort = "low";
  const currentErrors = validateAdvisorOutput(wrongCurrent, stats).errors.join("\n");
  assert.match(currentErrors, /currentModel: must match/);
  assert.match(currentErrors, /currentEffort: must match/);

  const wrongProxy = advisorWithoutActions();
  wrongProxy.modelFit.currentModel = "current-model";
  wrongProxy.modelFit.currentEffort = "medium";
  wrongProxy.recommendedActions = [structuredClone(validAdvisorOutput().recommendedActions[0])];
  wrongProxy.recommendedActions[0].driverIds = ["driver.large_active_contributor"];
  wrongProxy.recommendedActions[0].contributorIds = [];
  wrongProxy.recommendedActions[0].expectedBenefit.proxyType = "tokens";
  assert.match(validateAdvisorOutput(wrongProxy, stats).errors.join("\n"), /proxyType: must match the cited metric unit/);

  const persistentWithoutEvidence = advisorWithoutActions();
  persistentWithoutEvidence.modelFit.currentModel = "current-model";
  persistentWithoutEvidence.modelFit.currentEffort = "medium";
  persistentWithoutEvidence.persistentCompactionAdvice = [{
    setting: "compact_prompt", currentValue: null, proposedValue: "Preserve verification.", stability: "stable", evidenceIds: [],
    expectedEffect: "Preserve task state.", risk: "Longer summaries.", rollback: "Remove the setting.", limitations: [],
  }];
  assert.match(validateAdvisorOutput(persistentWithoutEvidence, stats).errors.join("\n"), /persistent advice requires evidence/);
});

test("advisor display privacy rejects recognizable secrets and multiline content", () => {
  const stats = { session: { harness: "pi" }, metrics: [{ id: "active.serialized_bytes", unit: "bytes" }], measuredDrivers: [{ id: "driver.large_active_contributor" }], contributors: [{ id: "tool-results:tool-result:1" }] };
  const secret = validAdvisorOutput();
  secret.summary = "Observed api_key=supersecretvalue in output.";
  assert.match(validateAdvisorOutput(secret, stats).errors.join("\n"), /display privacy policy/);
  const multiline = validAdvisorOutput();
  multiline.summary = "first line\nsecond line";
  assert.match(validateAdvisorOutput(multiline, stats).errors.join("\n"), /display privacy policy/);
});

test("advisor text rendering includes complete provider usage accounting", () => {
  const stats = buildInMemoryStatsReport({ cwd: "/workspace/demo", systemPrompt: "prompt" });
  const report = attachAdvisorOutput(stats, validAdvisorOutput(), { inputTokens: 10, cacheReadTokens: 2, cacheWriteTokens: 3, outputTokens: 4, providerTotalTokens: 19 }).report;
  const text = formatStatsReport(report);
  assert.match(text, /Cache read: 2 tokens/);
  assert.match(text, /Cache write: 3 tokens/);
  assert.match(text, /Provider total: 19 tokens/);
});

test("advisor schema rejects extra fields and more than three actions", () => {
  const stats = { session: { harness: "pi" }, metrics: [{ id: "active.serialized_bytes" }], measuredDrivers: [], contributors: [] };
  const extra = validAdvisorOutput();
  extra.untrusted = true;
  assert.match(validateAdvisorOutput(extra, stats).errors.join("\n"), /additional property/);

  const tooMany = validAdvisorOutput();
  tooMany.recommendedActions = [1, 2, 3, 4].map((rank) => ({ ...structuredClone(tooMany.recommendedActions[0]), rank }));
  assert.match(validateAdvisorOutput(tooMany, stats).errors.join("\n"), /maximum 3 items/);
});

function advisorWithoutActions() {
  const output = validAdvisorOutput();
  output.recommendedActions = [];
  return output;
}

function validAdvisorOutput() {
  return {
    promptVersion: 1,
    summary: "A measured active contributor may affect later calls.",
    recommendedActions: [{
      rank: 1,
      title: "Reduce retained result volume when detail is no longer needed",
      driverIds: ["driver.large_active_contributor"],
      metricIds: ["active.serialized_bytes"],
      contributorIds: ["tool-results:tool-result:1"],
      change: "Retain the full result externally and keep only the task-relevant outcome in later context.",
      expectedBenefit: { proxyType: "bytes", metricId: "active.serialized_bytes", direction: "decrease", description: "Reduce active serialized bytes on later calls." },
      prerequisites: ["The omitted detail is not required for verification."],
      risk: "Later debugging may require reopening the full result.",
      confidence: "medium",
      limitations: [],
    }],
    modelFit: {
      recommendation: "none", currentModel: "unavailable", currentEffort: "unavailable", proposedModel: null, proposedEffort: null,
      evidenceIds: [], taskDemands: [], tradeoffs: [], confidence: "low", limitations: ["Available model choices are unavailable."], command: null,
    },
    contextAction: {
      recommendation: "none", evidenceIds: [], reason: "Task continuity is unavailable.", estimatedReducibleScope: null,
      preserve: [], reduce: [], risk: "No action proposed.", command: null,
    },
    persistentCompactionAdvice: [],
    limitations: [],
  };
}

test("skill discovery paths identify symlinks or Windows materialized-link files", () => {
  const repository = path.join(fixtureDirectory, "..", "..", "..", "..");
  for (const discoveryPath of [path.join(repository, ".agents", "skills", "context-review"), path.join(repository, ".claude", "skills", "context-review")]) {
    const stat = fs.lstatSync(discoveryPath);
    if (stat.isSymbolicLink()) {
      assert.equal(fs.readlinkSync(discoveryPath), "../../skills/context-review");
    } else {
      assert.equal(process.platform, "win32", "regular discovery-link files are supported only for Windows checkouts with core.symlinks=false");
      assert.equal(fs.readFileSync(discoveryPath, "utf8").trim(), "../../skills/context-review");
    }
  }
});

test("skill documents harness syntax and forwards every Phase 1 parser argument", () => {
  const skill = fs.readFileSync(path.join(fixtureDirectory, "..", "..", "SKILL.md"), "utf8");
  assert.match(skill, /user-invocable: true/);
  assert.match(skill, /must.{0,20}use `--agent codex`/i);
  assert.match(skill, /must.{0,20}use `--agent claude`/i);
  assert.match(skill, /\$context-review/);
  assert.match(skill, /\/context-review/);
  for (const argument of ["--stats", "--advise", "--json", "--full", "--output", "--force", "--session", "--agent", "--cwd", "--max-chars"]) {
    assert.match(skill, new RegExp(argument));
  }
  assert.match(skill, /Without `--advise`[\s\S]{0,160}argument unchanged/);
  assert.match(skill, /emit parser stdout verbatim as the entire response/);
  assert.match(skill, /Do not summarize, paraphrase, add key takeaways/);
  assert.match(skill, /current active agent context/);
  assert.match(skill, /advisor-handoff\.mjs/);
  assert.match(skill, /--stats-input <frozen-stats-file>/);
  assert.match(skill, /validation fails/);
  assert.match(skill, /internal skill protocol, not a user command/);
});

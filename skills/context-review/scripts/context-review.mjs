#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { buildStatsReport } from "./context-review/measurement.mjs";
import { formatStatsReport } from "./context-review/render.mjs";

const DEFAULT_MAX_CHARS = 4_000;
const SUPPORTED_AGENTS = new Set(["auto", "codex", "claude", "pi"]);

export function parseArgs(argv) {
  const options = {
    agent: "auto",
    cwd: process.cwd(),
    session: undefined,
    json: false,
    full: false,
    maxChars: DEFAULT_MAX_CHARS,
    output: undefined,
    force: false,
    stats: false,
    advise: false,
    leafId: undefined,
    runtimeModel: undefined,
    runtimeEffort: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--json") options.json = true;
    else if (argument === "--full") options.full = true;
    else if (argument === "--stats") options.stats = true;
    else if (argument === "--advise") options.advise = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--agent") options.agent = requireValue(argv, ++index, argument);
    else if (argument === "--cwd") options.cwd = path.resolve(requireValue(argv, ++index, argument));
    else if (argument === "--session") options.session = path.resolve(requireValue(argv, ++index, argument));
    else if (argument === "--leaf-id") options.leafId = requireValue(argv, ++index, argument);
    else if (argument === "--runtime-model") options.runtimeModel = requireValue(argv, ++index, argument);
    else if (argument === "--runtime-effort") options.runtimeEffort = requireValue(argv, ++index, argument);
    else if (argument === "--output") options.output = path.resolve(requireValue(argv, ++index, argument));
    else if (argument === "--force") options.force = true;
    else if (argument === "--max-chars") {
      options.maxChars = Number.parseInt(requireValue(argv, ++index, argument), 10);
      if (!Number.isInteger(options.maxChars) || options.maxChars < 200) {
        throw new Error("--max-chars must be an integer of at least 200");
      }
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!SUPPORTED_AGENTS.has(options.agent)) {
    throw new Error(`Unsupported agent: ${options.agent}`);
  }
  if (options.full) options.maxChars = Number.POSITIVE_INFINITY;
  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

export function readJsonl(sessionPath) {
  const text = fs.readFileSync(sessionPath, "utf8");
  const records = [];
  const parseErrors = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch (error) {
      parseErrors.push({ line: index + 1, error: error.message });
    }
  }
  return { records, parseErrors };
}

export function detectHarness(records) {
  if (records.some((record) => record?.type === "session_meta" || record?.type === "response_item")) return "codex";
  if (records.some((record) => record?.sessionId && record?.uuid && ["user", "assistant"].includes(record?.type))) return "claude";
  if (records.some((record) => record?.type === "session" && typeof record?.cwd === "string")) return "pi";
  return undefined;
}

export function buildReport(records, sessionPath, requestedAgent = "auto", parseErrors = []) {
  const agent = requestedAgent === "auto" ? detectHarness(records) : requestedAgent;
  if (!agent) throw new Error(`Could not detect session format: ${sessionPath}`);
  if (agent === "codex") return parseCodex(records, sessionPath, parseErrors);
  if (agent === "claude") return parseClaude(records, sessionPath, parseErrors);
  if (agent === "pi") return parsePi(records, sessionPath, parseErrors);
  throw new Error(`Unsupported session format: ${agent}`);
}

function emptyReport(agent, sessionPath, parseErrors) {
  return {
    agent,
    sessionPath,
    sessionId: undefined,
    cwd: undefined,
    persistedInstructions: [],
    messages: [],
    toolCalls: [],
    fileEvidence: [],
    referencedResources: [],
    compactions: [],
    branchSummaries: [],
    parseErrors,
    limitations: [],
  };
}

function parseCodex(records, sessionPath, parseErrors) {
  const report = emptyReport("codex", sessionPath, parseErrors);
  const meta = records.find((record) => record?.type === "session_meta")?.payload ?? {};
  report.sessionId = meta.session_id ?? meta.id;
  report.cwd = meta.cwd;

  const baseInstructions = instructionText(meta.base_instructions);
  if (baseInstructions) {
    report.persistedInstructions.push({
      source: "session_meta.payload.base_instructions",
      kind: "base instructions",
      evidence: "exact-persisted",
      content: baseInstructions,
    });
  }

  for (const record of records) {
    if (record?.type === "turn_context") {
      const payload = record.payload ?? {};
      if (!report.cwd && typeof payload.cwd === "string") report.cwd = payload.cwd;
      const developerInstructions = payload?.collaboration_mode?.settings?.developer_instructions;
      if (typeof developerInstructions === "string" && developerInstructions.trim()) {
        pushUnique(report.persistedInstructions, {
          source: "turn_context.payload.collaboration_mode.settings.developer_instructions",
          kind: "turn developer instructions",
          evidence: "exact-persisted",
          content: developerInstructions,
        });
      }
      if (typeof payload.summary === "string" && payload.summary.trim()) {
        report.compactions.push({ evidence: "exact-persisted", content: payload.summary });
      }
    }

    if (record?.type !== "response_item") {
      if (record?.type && !["session_meta", "turn_context"].includes(record.type)) {
        report.limitations.push(`Unsupported Codex record type: ${record.type}`);
      }
      continue;
    }
    const item = record.payload ?? {};
    if (!item.type) report.limitations.push("Unsupported Codex response_item payload without a type");
    if (item.type === "message") {
      const content = contentToText(item.content);
      report.messages.push({
        role: item.role ?? "unknown",
        timestamp: record.timestamp,
        evidence: "exact-persisted-transcript",
        content,
      });
      if (["developer", "system"].includes(item.role) && content.trim()) {
        pushUnique(report.persistedInstructions, {
          source: `response_item.message.${item.role}`,
          kind: `${item.role} message`,
          evidence: "exact-persisted",
          content,
        });
      }
    } else if (isToolCallItem(item)) {
      const tool = normalizeCodexToolCall(item, record.timestamp);
      report.toolCalls.push(tool);
      collectFileEvidence(report, tool);
    } else if (isToolResultItem(item)) {
      attachToolResult(report.toolCalls, item.call_id ?? item.id, contentToText(item.output ?? item.content));
    } else if (item.type) {
      report.limitations.push(`Unsupported Codex response_item payload type: ${item.type}`);
    }
  }

  report.limitations.push(
    "The rollout is a persisted transcript, not a byte-for-byte dump of the latest provider request.",
    "Content removed before persistence or discarded by compaction cannot be recovered unless a summary was saved.",
    "A referenced documentation path is not considered read unless tool evidence records access to it."
  );
  return report;
}

function instructionText(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    for (const candidate of [value.text, value.content, value.instructions, value.value]) {
      const text = instructionText(candidate);
      if (text) return text;
    }
  }
  return "";
}

function parseClaude(records, sessionPath, parseErrors) {
  const report = emptyReport("claude", sessionPath, parseErrors);
  for (const record of records) {
    report.sessionId ??= record?.sessionId;
    report.cwd ??= record?.cwd;

    if (["user", "assistant"].includes(record?.type) && record?.message) {
      const content = contentToText(record.message.content);
      report.messages.push({
        role: record.message.role ?? record.type,
        timestamp: record.timestamp,
        evidence: "exact-persisted-transcript",
        content,
      });
      collectClaudeBlocks(report, record.message.content, record.timestamp);
    }

    if (record?.type === "attachment" && record?.attachment) {
      const attachment = record.attachment;
      const content = contentToText(attachment.content);
      if (content.trim()) {
        report.persistedInstructions.push({
          source: attachment.path ?? attachment.name ?? `attachment:${attachment.type ?? "unknown"}`,
          kind: "context attachment",
          evidence: "exact-persisted",
          content,
        });
      }
    }

    if (String(record?.type).includes("compact") || String(record?.type).includes("summary")) {
      const content = contentToText(record?.summary ?? record?.content ?? record?.message?.content);
      if (content.trim()) report.compactions.push({ evidence: "exact-persisted", content });
    }
  }

  report.limitations.push(
    "Claude's JSONL transcript does not expose the complete hidden system prompt or an exact current provider request.",
    "CLAUDE.md and memory content may appear as attachments or message wrappers, but absence from this report does not prove absence from provider context.",
    "Compaction may replace earlier detail with a persisted summary."
  );
  return report;
}

function collectClaudeBlocks(report, content, timestamp) {
  if (!Array.isArray(content)) return;
  for (const block of content) {
    if (block?.type === "tool_use") {
      const tool = {
        id: block.id,
        name: block.name ?? "unknown",
        arguments: block.input ?? {},
        timestamp,
        evidence: "exact-persisted",
      };
      report.toolCalls.push(tool);
      collectFileEvidence(report, tool);
    } else if (block?.type === "tool_result") {
      attachToolResult(report.toolCalls, block.tool_use_id, contentToText(block.content));
    }
  }
}

function parsePi(records, sessionPath, parseErrors) {
  const report = emptyReport("pi", sessionPath, parseErrors);
  const header = records.find((record) => record?.type === "session") ?? {};
  report.sessionId = header.id;
  report.cwd = header.cwd;

  for (const record of activePiRecords(records)) {
    if (record?.type === "message" && record.message) {
      const message = record.message;
      report.messages.push({ role: message.role ?? "unknown", timestamp: record.timestamp ?? message.timestamp, evidence: "exact-persisted-transcript", content: contentToText(message.content) });
      for (const block of Array.isArray(message.content) ? message.content : []) {
        if (block?.type !== "toolCall") continue;
        const tool = { id: block.id, name: block.name ?? "unknown", arguments: block.arguments ?? {}, timestamp: record.timestamp, evidence: "exact-persisted" };
        report.toolCalls.push(tool); collectFileEvidence(report, tool);
      }
      if (message.role === "toolResult") attachToolResult(report.toolCalls, message.toolCallId, contentToText(message.content));
    }
    if (record?.type === "custom_message" || record?.type === "bashExecution") {
      const content = contentToText(record.content ?? record.message?.content ?? record.output);
      if (content.trim()) report.messages.push({ role: record.role ?? "custom", timestamp: record.timestamp, evidence: "exact-persisted-transcript", content });
      if (record.type === "bashExecution" && record.command) {
        const tool = { id: record.id, name: "bash", arguments: { command: record.command }, timestamp: record.timestamp, evidence: "exact-persisted" };
        report.toolCalls.push(tool); collectFileEvidence(report, tool);
      }
    }
    if (isPiCompaction(record)) {
      const content = contentToText(record.summary ?? record.content ?? record.message?.content ?? record.details?.summary);
      if (content.trim()) report.compactions.push({ evidence: "exact-persisted", content });
      for (const filePath of record.details?.readFiles ?? []) if (typeof filePath === "string") report.fileEvidence.push({ path: filePath, tool: "compaction", evidence: "exact-persisted-compaction-details" });
    } else if (record?.type === "branch_summary") {
      const content = contentToText(record.summary ?? record.content ?? record.message?.content ?? record.details?.summary);
      if (content.trim()) report.branchSummaries.push({ evidence: "exact-persisted", content });
    }
  }
  const knownPiMetadataTypes = new Set(["model_change", "thinking_level_change", "session_info", "label", "custom"]);
  const supportedPiTypes = new Set(["session", "message", "custom_message", "bashExecution", "compaction", "session_compact", "branch_summary", ...knownPiMetadataTypes]);
  const omittedMetadata = new Set();
  const unknownPiTypes = new Set();
  for (const record of activePiRecords(records)) {
    if (knownPiMetadataTypes.has(record.type)) omittedMetadata.add(record.type);
    else if (record.type && !supportedPiTypes.has(record.type)) unknownPiTypes.add(record.type);
  }
  if (unknownPiTypes.size > 0) report.limitations.push(`Unknown Pi record types omitted: ${[...unknownPiTypes].join(", ")}`);
  if (omittedMetadata.size > 0) report.limitations.push(`Known Pi metadata omitted from provider context: ${[...omittedMetadata].join(", ")}`);
  report.limitations = [...new Set(report.limitations)];
  report.limitations.push(
    "The JSONL report reconstructs Pi's session branch; it is not the final serialized provider request.",
    "When the Pi context-review extension is loaded, /context-review can additionally show the exact latest payload observed by its provider-request hook.",
    "Payload changes made by extensions loaded after context-review are not visible to its hook.",
    "Unsupported Pi record types are omitted from the reconstructed branch."
  );
  return report;
}

function activePiRecords(records) {
  const byId = new Map(records.filter((record) => record?.id).map((record) => [record.id, record]));
  const header = records.find((record) => record?.type === "session");
  let leaf = header?.leafId ?? [...records].reverse().find((record) => record?.id && record.type !== "session")?.id;
  const branch = [];
  const seen = new Set();
  while (leaf && !seen.has(leaf)) {
    seen.add(leaf);
    const record = byId.get(leaf);
    if (!record) break;
    branch.push(record);
    leaf = record.parentId;
  }
  branch.reverse();
  const session = records.find((record) => record?.type === "session");
  if (session) branch.unshift(session);
  let output = [];
  for (const record of branch) {
    if (isPiCompaction(record)) {
      const firstKeptId = record.firstKeptEntryId
        ?? record.compaction?.firstKeptEntryId
        ?? record.data?.firstKeptEntryId;
      const keptIndex = firstKeptId ? branch.findIndex((entry) => entry.id === firstKeptId) : -1;
      const sessionEntries = output.filter((entry) => entry.type === "session");
      output = [...sessionEntries, ...(keptIndex >= 0 ? branch.slice(keptIndex, branch.indexOf(record) + 1) : [record])];
    } else {
      output.push(record);
    }
  }
  return output;
}

function isPiCompaction(record) {
  return record?.type === "compaction" || record?.type === "session_compact";
}

function isToolCallItem(item) {
  return ["function_call", "custom_tool_call", "local_shell_call"].includes(item?.type);
}

function isToolResultItem(item) {
  return ["function_call_output", "custom_tool_call_output", "local_shell_call_output"].includes(item?.type);
}

function normalizeCodexToolCall(item, timestamp) {
  let argumentsValue = item.arguments ?? item.input ?? item.action ?? {};
  if (typeof argumentsValue === "string") {
    try {
      argumentsValue = JSON.parse(argumentsValue);
    } catch {
      argumentsValue = { raw: argumentsValue };
    }
  }
  return {
    id: item.call_id ?? item.id,
    name: item.name ?? item.action?.type ?? item.type,
    arguments: argumentsValue,
    timestamp,
    evidence: "exact-persisted",
  };
}

function attachToolResult(toolCalls, id, result) {
  const call = [...toolCalls].reverse().find((tool) => id && tool.id === id);
  if (call) call.result = result;
}

function collectFileEvidence(report, tool) {
  const name = String(tool.name).toLowerCase();
  const likelyRead = /read|open|view|fetch|load/.test(name) && !/write|edit|create/.test(name);
  const directPaths = likelyRead ? findPathValues(tool.arguments) : [];
  for (const filePath of directPaths) {
    pushUnique(report.fileEvidence, {
      path: filePath,
      tool: tool.name,
      evidence: "reconstructed-from-persisted-tool-call",
    }, (value) => `${value.tool}:${value.path}`);
  }
  for (const resource of findResourceValues(tool.arguments)) {
    pushUnique(report.referencedResources, { resource, tool: tool.name, evidence: "reconstructed-from-persisted-resource-argument" }, (value) => `${value.tool}:${value.resource}`);
  }

  if (/exec|shell|bash|command/.test(name)) {
    for (const commandText of findStringValues(tool.arguments)) {
      for (const item of findShellReadPaths(commandText)) {
        pushUnique(report.fileEvidence, {
          path: item.path,
          tool: tool.name,
          certainty: item.certainty,
          evidence: "reconstructed-from-persisted-read-or-search-command",
        }, (value) => `${value.tool}:${value.path}`);
      }
    }
  }
}

function findPathValues(value, key = "") {
  if (typeof value === "string" && /(^|_)(path|file|filename)$/i.test(key)) return [value];
  if (Array.isArray(value)) return value.flatMap((item) => findPathValues(item, key));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([childKey, childValue]) => findPathValues(childValue, childKey));
  }
  return [];
}

function findResourceValues(value, key = "") {
  const isUri = typeof value === "string"
    && /(^|_)(uri|url)$/i.test(key)
    && /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)
    && !/^[A-Za-z]:/.test(value);
  if (isUri) return [value];
  if (Array.isArray(value)) return value.flatMap((item) => findResourceValues(item, key));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([childKey, childValue]) => findResourceValues(childValue, childKey));
  return [];
}

function findStringValues(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(findStringValues);
  if (value && typeof value === "object") return Object.values(value).flatMap(findStringValues);
  return [];
}

export function findShellReadPaths(commandText) {
  const words = shellWords(commandText);
  const results = [];
  const commands = new Set(["cat", "head", "tail", "less", "bat", "sed", "rg", "grep", "awk"]);
  for (let index = 0; index < words.length; index += 1) {
    const command = words[index].value;
    const previous = words[index - 1]?.value;
    if (!commands.has(command) || (index > 0 && !["|", ";", "&&", "||"].includes(previous))) continue;
    const operands = [];
    for (let cursor = index + 1; cursor < words.length && !["|", ";", "&&", "||"].includes(words[cursor].value); cursor += 1) {
      const value = words[cursor].value;
      if (value === "--") continue;
      if (value.startsWith("-") && !value.startsWith("./")) continue;
      operands.push(value);
    }
    const skip = ["sed", "awk", "rg", "grep"].includes(command) ? 1 : 0;
    for (const operand of operands.slice(skip)) {
      if (!operand || /[*?\[\]{}]/.test(operand)) continue;
      const uncertain = /[$`]/.test(operand);
      if (!uncertain && !looksLikePath(operand) && !["cat", "head", "tail", "less", "bat"].includes(command)) continue;
      results.push({ path: operand, certainty: uncertain ? "uncertain" : "likely" });
    }
  }
  return [...new Map(results.map((item) => [item.path, item])).values()];
}

function shellWords(command) {
  const words = [];
  const pattern = /(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^']*)'|([^\s|;&]+)|([|;&]+))/g;
  let match;
  while ((match = pattern.exec(command))) words.push({ value: match[1] ?? match[2] ?? match[3] ?? match[4] });
  return words;
}

function looksLikePath(value) {
  return value.startsWith("/") || value.startsWith("~/") || value.startsWith("./") || value.startsWith("../") || value.includes("/") || /\.[A-Za-z0-9]{1,8}$/.test(value);
}

function contentToText(content) {
  if (typeof content === "string") return content;
  if (content === undefined || content === null) return "";
  if (Array.isArray(content)) {
    return content.map((block) => {
      if (typeof block === "string") return block;
      if (typeof block?.text === "string") return block.text;
      if (typeof block?.thinking === "string") return `[thinking block omitted: ${block.thinking.length} characters]`;
      if (block?.type === "toolCall" || block?.type === "tool_use") {
        return `[tool call: ${block.name ?? "unknown"}]`;
      }
      return JSON.stringify(block);
    }).join("\n");
  }
  if (typeof content === "object") return JSON.stringify(content);
  return String(content);
}

function pushUnique(array, item, key = (value) => `${value.source}:${value.content}`) {
  const itemKey = key(item);
  if (!array.some((existing) => key(existing) === itemKey)) array.push(item);
}

function walkFiles(root, output = []) {
  if (!fs.existsSync(root)) return output;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) walkFiles(entryPath, output);
    else if (entry.isFile() && entry.name.endsWith(".jsonl")) output.push(entryPath);
  }
  return output;
}

function candidateRoots(agent) {
  const home = os.homedir();
  const roots = {
    codex: path.join(process.env.CODEX_HOME ?? path.join(home, ".codex"), "sessions"),
    claude: path.join(process.env.CLAUDE_CONFIG_DIR ?? path.join(home, ".claude"), "projects"),
    pi: path.join(process.env.PI_AGENT_DIR ?? path.join(home, ".pi", "agent"), "sessions"),
  };
  return agent === "auto" ? Object.entries(roots) : [[agent, roots[agent]]];
}

function inspectCandidate(sessionPath, expectedAgent) {
  try {
    const stat = fs.statSync(sessionPath);
    const records = readJsonlPrefix(sessionPath);
    const agent = detectHarness(records);
    if (!agent || (expectedAgent !== "auto" && expectedAgent !== agent)) return undefined;
    return { path: sessionPath, agent, cwd: detectCwd(records, agent), mtimeMs: stat.mtimeMs };
  } catch {
    return undefined;
  }
}

function readJsonlPrefix(sessionPath, maxBytes = 512 * 1024) {
  const descriptor = fs.openSync(sessionPath, "r");
  try {
    const buffer = Buffer.alloc(maxBytes);
    const bytesRead = fs.readSync(descriptor, buffer, 0, maxBytes, 0);
    const text = buffer.subarray(0, bytesRead).toString("utf8");
    const completeText = bytesRead < maxBytes ? text : text.slice(0, text.lastIndexOf("\n"));
    const records = [];
    for (const line of completeText.split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        records.push(JSON.parse(line));
      } catch {
        // A partial or malformed prefix line is not enough to reject the session.
      }
    }
    return records;
  } finally {
    fs.closeSync(descriptor);
  }
}

function detectCwd(records, agent) {
  if (agent === "codex") {
    return records.find((record) => record?.type === "session_meta")?.payload?.cwd
      ?? records.find((record) => record?.type === "turn_context")?.payload?.cwd;
  }
  if (agent === "claude") return records.find((record) => typeof record?.cwd === "string")?.cwd;
  if (agent === "pi") return records.find((record) => record?.type === "session")?.cwd;
  return undefined;
}

export function findSession(agent, cwd) {
  const sessionFiles = [];
  for (const [rootAgent, root] of candidateRoots(agent)) {
    for (const sessionPath of walkFiles(root)) {
      if (rootAgent === "claude" && sessionPath.includes(`${path.sep}subagents${path.sep}`)) continue;
      try {
        sessionFiles.push({ path: sessionPath, rootAgent, mtimeMs: fs.statSync(sessionPath).mtimeMs });
      } catch {
        // Ignore sessions removed while discovery is in progress.
      }
    }
  }
  sessionFiles.sort((left, right) => right.mtimeMs - left.mtimeMs);
  const normalizedCwd = normalizePath(cwd);
  let fallback;
  for (const sessionFile of sessionFiles) {
    const candidate = inspectCandidate(sessionFile.path, sessionFile.rootAgent);
    if (!candidate) continue;
    fallback ??= candidate;
    if (normalizePath(candidate.cwd) === normalizedCwd) return { ...candidate, cwdMatched: true };
  }
  return fallback ? { ...fallback, cwdMatched: false } : undefined;
}

function normalizePath(value) {
  if (!value || typeof value !== "string") return undefined;
  try {
    return fs.realpathSync(value);
  } catch {
    return path.resolve(value);
  }
}

export function truncate(value, maxChars) {
  const text = String(value ?? "");
  if (!Number.isFinite(maxChars) || text.length <= maxChars) return { text, truncated: false, originalChars: text.length };
  return {
    text: `${text.slice(0, maxChars)}\n… [truncated ${text.length - maxChars} characters; rerun with --full]`,
    truncated: true,
    originalChars: text.length,
  };
}

function truncateJsonReport(report, maxChars) {
  if (!Number.isFinite(maxChars)) return report;
  const output = structuredClone(report);
  for (const collection of [output.persistedInstructions, output.messages, output.compactions, output.branchSummaries]) {
    for (const item of collection) {
      const value = truncate(item.content, maxChars);
      item.content = value.text;
      if (value.truncated) {
        item.truncated = true;
        item.originalChars = value.originalChars;
      }
    }
  }
  for (const tool of output.toolCalls) {
    tool.arguments = truncateJsonStrings(tool.arguments, maxChars);
    if (tool.result !== undefined) {
      const value = truncate(tool.result, maxChars);
      tool.result = value.text;
      if (value.truncated) {
        tool.resultTruncated = true;
        tool.resultOriginalChars = value.originalChars;
      }
    }
  }
  return output;
}

function truncateJsonStrings(value, maxChars) {
  if (typeof value === "string") return truncate(value, maxChars).text;
  if (Array.isArray(value)) return value.map((item) => truncateJsonStrings(item, maxChars));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, truncateJsonStrings(item, maxChars)]));
  }
  return value;
}

export function formatReport(report, maxChars = DEFAULT_MAX_CHARS) {
  const lines = [
    "# Context review",
    "",
    `Agent: ${report.agent}`,
    `Session: ${report.sessionPath}`,
    `Session ID: ${report.sessionId ?? "unknown"}`,
    `Working directory: ${report.cwd ?? "unknown"}`,
    "Scope: preserved local evidence; not a guaranteed byte-for-byte current provider request",
  ];

  addContentSection(lines, "Persisted instructions", report.persistedInstructions, maxChars, (item) =>
    `[${item.evidence}] ${item.kind} — ${item.source}`);
  addContentSection(lines, "Messages", report.messages, maxChars, (item, index) =>
    `${index + 1}. [${item.evidence}] ${item.role}${item.timestamp ? ` @ ${item.timestamp}` : ""}`);

  lines.push("", "## File access evidence");
  if (report.fileEvidence.length === 0) lines.push("(no explicit file-read evidence found)");
  else for (const item of report.fileEvidence) {
    const certainty = item.certainty ? `; certainty=${item.certainty}` : "";
    lines.push(`- [${item.evidence}${certainty}] ${item.path} via ${item.tool}`);
  }

  lines.push("", "## Referenced resources");
  if ((report.referencedResources ?? []).length === 0) lines.push("(no URL/URI arguments found)");
  else for (const item of report.referencedResources) lines.push(`- [${item.evidence}] ${item.resource} via ${item.tool} (not proof of access)`);

  lines.push("", "## Tool calls");
  if (report.toolCalls.length === 0) lines.push("(none found)");
  else report.toolCalls.forEach((tool, index) => {
    lines.push("", `${index + 1}. [${tool.evidence}] ${tool.name}`);
    const args = truncate(JSON.stringify(tool.arguments, null, 2), maxChars);
    lines.push(fenced(args.text));
    if (tool.result !== undefined) {
      const result = truncate(tool.result, maxChars);
      lines.push("Result:", fenced(result.text));
    }
  });

  addContentSection(lines, "Compaction", report.compactions, maxChars, (item, index) =>
    `${index + 1}. [${item.evidence}] persisted summary`);
  addContentSection(lines, "Branch summaries", report.branchSummaries ?? [], maxChars, (item, index) =>
    `${index + 1}. [${item.evidence}] abandoned-branch summary`);

  lines.push("", "## Unavailable or uncertain context");
  report.limitations.forEach((limitation) => lines.push(`- ${limitation}`));
  if (report.parseErrors.length > 0) {
    lines.push(`- ${report.parseErrors.length} malformed JSONL line(s) were skipped.`);
  }
  return `${lines.join("\n")}\n`;
}

function addContentSection(lines, title, items, maxChars, heading) {
  lines.push("", `## ${title}`);
  if (items.length === 0) {
    lines.push("(none found)");
    return;
  }
  items.forEach((item, index) => {
    lines.push("", heading(item, index));
    const value = truncate(item.content, maxChars);
    lines.push(fenced(value.text));
  });
}

function fenced(content) {
  const fence = content.includes("```") ? "````" : "```";
  return `${fence}\n${content}\n${fence}`;
}

function helpText() {
  return `Usage: context-review.mjs [options]\n\nOptions:\n  --agent auto|codex|claude|pi\n  --cwd PATH                Select the newest session for this directory\n  --session PATH            Inspect an explicit JSONL session\n  --max-chars N             Limit each content block (default: ${DEFAULT_MAX_CHARS})\n  --output PATH             Write the report to a file instead of stdout\n  --force                   Replace an existing output file\n  --full                    Do not truncate content blocks\n  --stats                   Emit deterministic context measurements\n  --advise                  Refer to interactive advice (no standalone call)\n  --json                    Emit structured JSON\n  -h, --help                Show this help\n`;
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    process.stdout.write(helpText());
    return;
  }
  if (options.advise) {
    const harness = options.agent === "auto" ? "the active harness" : options.agent;
    const command = options.agent === "codex" ? "$context-review --stats --advise" : "/context-review --stats --advise";
    process.stdout.write(`Standalone advice is unavailable and no model call was made. Run ${command} in ${harness}.\n`);
    return;
  }

  let sessionPath = options.session;
  let selectedAgent = options.agent;
  if (!sessionPath) {
    const candidate = findSession(options.agent, options.cwd);
    if (!candidate) throw new Error(`No ${options.agent === "auto" ? "supported" : options.agent} session found`);
    sessionPath = candidate.path;
    if (selectedAgent === "auto") selectedAgent = candidate.agent;
    options.cwdMatched = candidate.cwdMatched;
  }
  const { records, parseErrors } = readJsonl(sessionPath);
  const report = buildReport(records, sessionPath, selectedAgent, parseErrors);
  if (options.cwdMatched === false) {
    report.limitations.unshift(`No session matched requested working directory ${options.cwd}; selected the newest ${report.agent} session instead.`);
  }
  const renderedReport = options.stats
    ? buildStatsReport(records, report, { explicit: Boolean(options.session), cwdMatched: options.cwdMatched, leafId: options.leafId, runtimeModel: options.runtimeModel, runtimeEffort: options.runtimeEffort })
    : report;
  const output = options.json
    ? `${JSON.stringify(options.stats ? renderedReport : truncateJsonReport(renderedReport, options.maxChars), null, 2)}\n`
    : options.stats ? formatStatsReport(renderedReport) : formatReport(renderedReport, options.maxChars);
  if (options.output) {
    if (path.resolve(options.output) === path.resolve(sessionPath)) {
      throw new Error("--output must not overwrite the input session file");
    }
    if (fs.existsSync(options.output) && !options.force) {
      throw new Error(`Output file already exists: ${options.output} (use --force to replace it)`);
    }
    fs.writeFileSync(options.output, output, "utf8");
  } else process.stdout.write(output);
}

const invokedPath = process.argv[1] ? normalizePath(process.argv[1]) : undefined;
if (invokedPath === normalizePath(fileURLToPath(import.meta.url))) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`context-review: ${error.message}\n`);
    process.exitCode = 1;
  }
}

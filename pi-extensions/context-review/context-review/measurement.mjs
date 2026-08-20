import { buildMeasuredDrivers } from "./drivers.mjs";
import { EVIDENCE, SCOPES, STATS_SCHEMA_VERSION, metric, unavailableMetric } from "./model.mjs";
import { safeContributorId, safeMetadataValue, safeSessionPath, safeTypeName, safeWorkingDirectory } from "./privacy.mjs";

const CATEGORY_NAMES = Object.freeze({
  instructions: "Instructions and memory",
  tool_definitions: "Tool definitions",
  user: "User content",
  assistant: "Assistant content",
  reasoning: "Reasoning metadata",
  tool_calls: "Tool calls",
  tool_results: "Tool results",
  compaction: "Compaction summaries",
  other: "Other or unsupported",
});

export function buildStatsReport(records, report, selection = {}) {
  const agent = report.agent;
  const activeScope = measurementScope(agent, selection);
  const activeRecords = selectActiveRecords(records, agent, selection);
  const blocks = compositionBlocks(activeRecords, agent);
  const composition = summarizeComposition(blocks, activeScope);
  const activeBytes = composition.reduce((sum, item) => sum + item.value, 0);
  const usage = collectUsage(records, agent);
  const modelRecords = agent === "claude" ? activeRecords : records;
  const model = findModel(modelRecords, agent, selection);
  const effort = findEffort(modelRecords, agent, selection);
  const capacity = findCapacity(records, agent);
  const compactions = records.filter((record) => isCompaction(record, agent)).length;
  const metrics = [
    metric("active.serialized_bytes", "Active reconstructed serialized size", activeBytes, "bytes", activeScope, EVIDENCE.RECONSTRUCTED, `${agent} history reconstruction; UTF-8 bytes of the canonical classified local representation`, "Serialized bytes are not tokens, billing usage, or byte-for-byte JSONL size."),
    unavailableMetric("active.tokens", "Active context", "tokens", activeScope, "No verified active-context token source", "Persisted records do not establish exact next-request occupancy."),
    capacity === null
      ? unavailableMetric("context.capacity", "Context capacity", "tokens", activeScope, "No verified persisted capacity field", "Capacity is unavailable from this session record.")
      : metric("context.capacity", "Context capacity", capacity.value, "tokens", activeScope, EVIDENCE.PROVIDER, capacity.source),
    metric("session.model_calls", "Observable model calls", usage.calls, "calls", SCOPES.CUMULATIVE, EVIDENCE.PROVIDER, usage.callSource, usage.calls === 0 ? "No provider usage records were preserved." : undefined),
    metric("session.compactions", "Compactions", compactions, "compactions", SCOPES.CUMULATIVE, EVIDENCE.EXACT, `${agent} persisted compaction record count`),
  ];

  const result = {
    schemaVersion: STATS_SCHEMA_VERSION,
    reportType: "context_efficiency_stats",
    session: {
      harness: agent,
      id: safeMetadataValue(report.sessionId),
      path: safeSessionPath(report.sessionPath, report.cwd),
      workingDirectory: safeWorkingDirectory(report.cwd),
      selection: selection.cwdMatched === false ? "newest_fallback" : selection.explicit ? "explicit" : "current_directory",
      model: safeMetadataValue(model?.value),
      modelSource: model?.source ?? null,
      effort: safeMetadataValue(effort?.value),
      effortSource: effort?.source ?? null,
      activeHistoryScope: activeScopeDescription(agent, selection),
    },
    metrics,
    usage: {
      latest: usage.latest,
      cumulative: usage.cumulative,
      units: "tokens",
      latestScope: SCOPES.LATEST_RESPONSE,
      cumulativeScope: SCOPES.CUMULATIVE,
      evidence: usage.calls > 0 ? EVIDENCE.PROVIDER : EVIDENCE.UNAVAILABLE,
      source: usage.source,
    },
    composition,
    contributors: largestContributors(blocks, activeBytes, activeScope),
    measuredDrivers: [],
    observedRequest: null,
    limitations: unique([
      ...safeLimitations(report.limitations),
      ...usage.limitations,
      agent === "pi" && !selection.leafId ? "The live Pi leaf was unavailable; composition is labelled as the latest persisted branch candidate, not current active context." : null,
      agent === "pi" && selection.leafId ? "Pi composition measures reconstructed provider-facing messages only; the system prompt, tool definitions, and later extension payload changes are outside this scope." : null,
      ["codex", "claude"].includes(agent) ? "Composition measures reconstructed provider-facing persisted messages; hidden instructions, tool definitions, and unpersisted request fields are outside this scope." : null,
      "Composition and contributors use UTF-8 bytes of a canonical classified local representation, not byte-for-byte JSONL size or per-item token counts.",
      "Raw transcript, tool payload, command arguments, environment values, and reasoning text are omitted from this stats report.",
    ]),
  };
  result.measuredDrivers = buildMeasuredDrivers(result);
  return result;
}

export function attachObservedRequest(statsReport, payload, observedAt, limitation = undefined) {
  const report = structuredClone(statsReport);
  if (payload === undefined) {
    report.observedRequest = { available: false, observedAt: null, evidence: EVIDENCE.UNAVAILABLE, limitation: limitation ?? "No provider request has been observed by this extension." };
    report.limitations = unique([...report.limitations, report.observedRequest.limitation]);
    return report;
  }
  const blocks = observedPayloadBlocks(payload);
  const serializedBytes = Buffer.byteLength(JSON.stringify(payload), "utf8");
  const scope = "latest_observed_request_payload";
  report.metrics.push(metric("request.serialized_bytes", "Latest observed request serialized size", serializedBytes, "bytes", scope, EVIDENCE.OBSERVED, "Pi before_provider_request event.payload UTF-8 JSON serialization", "Later-loaded extensions may modify the payload after observation."));
  report.composition = summarizeComposition(blocks, scope);
  report.contributors = largestContributors(blocks, blocks.reduce((sum, block) => sum + block.value, 0), scope);
  report.measuredDrivers = buildMeasuredDrivers(report);
  report.observedRequest = { available: true, observedAt: observedAt ?? null, evidence: EVIDENCE.OBSERVED, limitation: limitation ?? "Later-loaded extensions may modify the payload after this observation." };
  report.limitations = unique([
    ...report.limitations.filter((item) => ![
      "When the Pi context-review extension is loaded, /context-review can additionally show the exact latest payload observed by its provider-request hook.",
      "Payload changes made by extensions loaded after context-review are not visible to its hook.",
      "Pi composition measures reconstructed provider-facing messages only; the system prompt, tool definitions, and later extension payload changes are outside this scope.",
    ].includes(item)),
    report.observedRequest.limitation,
  ]);
  return report;
}

function observedPayloadBlocks(payload) {
  const blocks = [];
  const push = (category, type, value, source) => {
    if (value === undefined || value === null) return;
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return;
    const safeType = safeTypeName(type);
    blocks.push({ category, type: safeType, value: Buffer.byteLength(serialized, "utf8"), unit: "bytes", evidence: EVIDENCE.OBSERVED, source, repeatKey: `${category}\u0000${safeType}\u0000${serialized}` });
  };
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    push("other", "custom", payload, "observed payload value");
    return blocks;
  }
  for (const [key, value] of Object.entries(payload)) {
    if (["system", "instructions", "systemInstruction"].includes(key)) push("instructions", "base_instructions", value, `event.payload.${key}`);
    else if (["tools", "functions"].includes(key)) {
      for (const tool of Array.isArray(value) ? value : [value]) push("tool_definitions", "custom", tool, `event.payload.${key}`);
    } else if (["messages", "input", "contents"].includes(key) && Array.isArray(value)) {
      value.forEach((item) => classifyObservedMessage(item, push, `event.payload.${key}`));
    } else if (key === "input" && typeof value === "string") push("user", "text", value, "event.payload.input");
    else push("other", "custom", value, `event.payload.${key}`);
  }
  return blocks;
}

function classifyObservedMessage(item, push, source) {
  if (!item || typeof item !== "object") return push("other", "custom", item, source);
  if (["function_call", "custom_tool_call", "tool_use"].includes(item.type)) return push("tool_calls", item.type, item, source);
  if (["function_call_output", "custom_tool_call_output", "tool_result"].includes(item.type)) return push("tool_results", item.type, item, source);
  const role = item.role ?? "other";
  const category = ["system", "developer"].includes(role) ? "instructions" : role === "user" ? "user" : role === "assistant" || role === "model" ? "assistant" : "other";
  const { content, parts, ...metadata } = item;
  if (Object.keys(metadata).length) push("other", "message_metadata", metadata, `${source}.metadata`);
  const contentBlocks = Array.isArray(content) ? content : Array.isArray(parts) ? parts : [content ?? parts];
  for (const block of contentBlocks) {
    if (["toolCall", "tool_use", "function_call"].includes(block?.type)) push("tool_calls", block.type, block, source);
    else if (["tool_result", "function_call_output"].includes(block?.type)) push("tool_results", block.type, block, source);
    else if (["thinking", "reasoning", "redacted_thinking"].includes(block?.type)) push("reasoning", block.type, block, source);
    else push(category, block?.type ?? "text", block, source);
  }
}

export function buildInMemoryStatsReport({ cwd, systemPrompt, model, effort }) {
  const scope = SCOPES.ACTIVE_IN_MEMORY;
  const serializedBytes = Buffer.byteLength(JSON.stringify(systemPrompt ?? ""), "utf8");
  const metrics = [
    metric("active.serialized_bytes", "Active startup serialized size", serializedBytes, "bytes", scope, EVIDENCE.SERIALIZED, "UTF-8 JSON serialization of Pi ctx.getSystemPrompt()", "Serialized bytes are not tokens, billing usage, or provider-payload size."),
    unavailableMetric("active.tokens", "Active context", "tokens", scope, "No provider token count before a request", "Token count is unavailable before the first provider response."),
    unavailableMetric("context.capacity", "Context capacity", "tokens", scope, "No persisted session or verified runtime capacity input", "Capacity is unavailable."),
    metric("session.model_calls", "Observable model calls", 0, "calls", SCOPES.CUMULATIVE, EVIDENCE.EXACT, "No persisted provider responses"),
    metric("session.compactions", "Compactions", 0, "compactions", SCOPES.CUMULATIVE, EVIDENCE.EXACT, "No persisted session entries"),
  ];
  const composition = [{ id: "composition.instructions", category: "instructions", name: CATEGORY_NAMES.instructions, count: 1, value: serializedBytes, unit: "bytes", scope, evidence: EVIDENCE.SERIALIZED, source: "Pi ctx.getSystemPrompt()", share: serializedBytes ? 100 : 0 }];
  const contributors = serializedBytes ? [{ id: "instructions:base-instructions:1", category: "instructions", type: "base_instructions", value: serializedBytes, unit: "bytes", share: 100, scope, evidence: EVIDENCE.SERIALIZED }] : [];
  const result = {
    schemaVersion: STATS_SCHEMA_VERSION,
    reportType: "context_efficiency_stats",
    session: {
      harness: "pi", id: null, path: "unavailable", workingDirectory: safeWorkingDirectory(cwd), selection: "in_memory",
      model: safeMetadataValue(model), modelSource: model ? "Pi extension ctx.model" : null,
      effort: safeMetadataValue(effort), effortSource: effort ? "Pi extension pi.getThinkingLevel()" : null,
      activeHistoryScope: "exact in-memory built system prompt only",
    },
    metrics,
    usage: { latest: emptyUsage(), cumulative: emptyUsage(), units: "tokens", latestScope: SCOPES.LATEST_RESPONSE, cumulativeScope: SCOPES.CUMULATIVE, evidence: EVIDENCE.UNAVAILABLE, source: "Session not persisted" },
    composition,
    contributors,
    measuredDrivers: [],
    observedRequest: null,
    limitations: [
      "The session transcript and provider response usage are unavailable before the first persisted entry.",
      "Only the built system prompt is measured; no provider request has been observed.",
      "Raw startup content is omitted.",
    ],
  };
  result.measuredDrivers = buildMeasuredDrivers(result);
  return result;
}

function selectActiveRecords(records, agent, selection) {
  if (agent === "pi") return activePiRecords(records, selection.leafId);
  if (agent === "claude") return activeClaudeRecords(records);
  return activeCodexRecords(records);
}

function activeCodexRecords(records) {
  const compactionIndex = records.findLastIndex((record) => record?.type === "compacted" && Array.isArray(record.payload?.replacement_history));
  if (compactionIndex < 0) return records;
  const replacement = records[compactionIndex].payload.replacement_history.map((item) => ({ type: "response_item", payload: item }));
  const subsequent = records.slice(compactionIndex + 1).filter((record) => ["response_item", "turn_context"].includes(record?.type));
  return [...records.filter((record) => record?.type === "session_meta").slice(0, 1), ...replacement, ...subsequent];
}

function activeClaudeRecords(records) {
  const linked = records.filter((record) => record?.uuid);
  if (linked.length === 0) return records;
  const byId = new Map(linked.map((record) => [record.uuid, record]));
  let cursor = linked.at(-1);
  const active = [];
  const seen = new Set();
  while (cursor && !seen.has(cursor.uuid)) {
    seen.add(cursor.uuid);
    active.push(cursor);
    cursor = cursor.parentUuid ? byId.get(cursor.parentUuid) : undefined;
  }
  active.reverse();
  return [...records.filter((record) => !record?.uuid && record?.type === "attachment"), ...active];
}

function activePiRecords(records, liveLeafId) {
  const byId = new Map(records.filter((record) => record?.id).map((record) => [record.id, record]));
  const header = records.find((record) => record?.type === "session");
  let leaf = liveLeafId ?? [...records].reverse().find((record) => record?.id && record.type !== "session")?.id;
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
  if (header) branch.unshift(header);
  let active = [];
  for (const record of branch) {
    if (!isCompaction(record, "pi")) {
      active.push(record);
      continue;
    }
    const firstKeptId = record.firstKeptEntryId ?? record.compaction?.firstKeptEntryId ?? record.data?.firstKeptEntryId;
    const keptIndex = firstKeptId ? branch.findIndex((entry) => entry.id === firstKeptId) : -1;
    active = [...active.filter((entry) => entry.type === "session"), ...(keptIndex >= 0 ? branch.slice(keptIndex, branch.indexOf(record)) : []), record];
  }
  return active;
}

function compositionBlocks(records, agent) {
  const blocks = [];
  const push = (category, type, value, source) => {
    if (value === undefined || value === null) return;
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return;
    const safeType = safeTypeName(type);
    blocks.push({ category, type: safeType, value: Buffer.byteLength(serialized, "utf8"), unit: "bytes", evidence: EVIDENCE.SERIALIZED, source, repeatKey: `${category}\u0000${safeType}\u0000${serialized}` });
  };

  if (agent === "codex") {
    for (const record of records) {
      if (record?.type === "session_meta" && record.payload?.base_instructions) push("instructions", "base_instructions", record.payload.base_instructions, "session_meta.payload.base_instructions");
      else if (record?.type === "turn_context" && record.payload?.summary) push("compaction", "summary", record.payload.summary, "turn_context.payload.summary");
      else if (record?.type === "response_item") classifyItem(record.payload, push, "response_item.payload");
    }
  } else if (agent === "claude") {
    for (const record of records) {
      if (record?.type === "attachment") push("instructions", "attachment", record.attachment?.content, "attachment.content");
      else if (String(record?.type).includes("compact") || String(record?.type).includes("summary")) push("compaction", "summary", record.summary ?? record.content, record.type);
      else if (record?.message) classifyMessage(record.message, push, "message");
    }
  } else {
    for (const record of records) {
      if (isCompaction(record, "pi")) {
        push("compaction", "summary", `${COMPACTION_SUMMARY_PREFIX}${record.summary ?? ""}${COMPACTION_SUMMARY_SUFFIX}`, "Pi compactionSummary provider-facing text");
      } else if (record?.type === "branch_summary") {
        push("other", "branch_summary", `${BRANCH_SUMMARY_PREFIX}${record.summary ?? ""}${BRANCH_SUMMARY_SUFFIX}`, "Pi branchSummary provider-facing text");
      } else if (record?.type === "message" && record.message) classifyPiMessage(record.message, push);
      else if (record?.type === "custom_message") classifyPiMessage({ role: "custom", content: record.content }, push);
    }
  }
  return blocks;
}

const COMPACTION_SUMMARY_PREFIX = "The conversation history before this point was compacted into the following summary:\n\n<summary>\n";
const COMPACTION_SUMMARY_SUFFIX = "\n</summary>";
const BRANCH_SUMMARY_PREFIX = "The following is a summary of a branch that this conversation came back from:\n\n<summary>\n";
const BRANCH_SUMMARY_SUFFIX = "</summary>";

function classifyPiMessage(message, push) {
  if (message.role === "bashExecution") {
    if (message.excludeFromContext) return;
    push("user", "text", bashExecutionToText(message), "Pi bashExecution provider-facing text");
    return;
  }
  const role = message.role === "custom" ? "user" : message.role;
  const category = role === "user" ? "user" : role === "assistant" ? "assistant" : role === "toolResult" ? "tool_results" : "other";
  const providerMetadata = role === "toolResult"
    ? { role, toolCallId: message.toolCallId, toolName: message.toolName, isError: message.isError }
    : { role };
  push("other", "message_metadata", providerMetadata, "Pi provider-facing message metadata");
  const content = Array.isArray(message.content) ? message.content : [{ type: "text", text: message.content ?? "" }];
  for (const block of content) {
    if (block?.type === "toolCall") push("tool_calls", "toolCall", block, "Pi provider-facing content block");
    else if (["thinking", "reasoning", "redacted_thinking"].includes(block?.type)) push("reasoning", block.type, block, "Pi provider-facing content block");
    else push(category, block?.type ?? "text", block, "Pi provider-facing content block");
  }
}

function bashExecutionToText(message) {
  let text = `Ran \`${message.command}\`\n`;
  text += message.output ? `\`\`\`\n${message.output}\n\`\`\`` : "(no output)";
  if (message.cancelled) text += "\n\n(command cancelled)";
  else if (message.exitCode !== null && message.exitCode !== undefined && message.exitCode !== 0) text += `\n\nCommand exited with code ${message.exitCode}`;
  if (message.truncated && message.fullOutputPath) text += `\n\n[Output truncated. Full output: ${message.fullOutputPath}]`;
  return text;
}

function classifyItem(item, push, source) {
  if (!item) return;
  if (["function_call", "custom_tool_call", "local_shell_call"].includes(item.type)) return push("tool_calls", item.type, item, source);
  if (["function_call_output", "custom_tool_call_output", "local_shell_call_output"].includes(item.type)) return push("tool_results", item.type, item, source);
  if (String(item.type).includes("reasoning")) return push("reasoning", "reasoning", item, source);
  if (item.type === "message") return classifyMessage(item, push, source);
  if (String(item.type).includes("tool") && String(item.type).includes("definition")) return push("tool_definitions", item.type, item, source);
  push("other", item.type ?? "unknown", item, source);
}

function classifyMessage(message, push, source) {
  const role = message.role ?? "unknown";
  const category = ["system", "developer"].includes(role) ? "instructions" : role === "user" ? "user" : role === "assistant" ? "assistant" : role === "toolResult" ? "tool_results" : "other";
  const providerMetadata = role === "toolResult"
    ? { role, toolCallId: message.toolCallId, toolName: message.toolName, isError: message.isError }
    : { role };
  push("other", "message_metadata", providerMetadata, `${source}.provider-facing-metadata`);
  const content = Array.isArray(message.content) ? message.content : [message.content];
  for (const block of content) {
    if (block?.type === "toolCall" || block?.type === "tool_use") push("tool_calls", block.type, block, source);
    else if (block?.type === "tool_result") push("tool_results", block.type, block, source);
    else if (["thinking", "reasoning", "redacted_thinking"].includes(block?.type)) push("reasoning", block.type, block, source);
    else push(category, block?.type ?? `${role}_message`, block, source);
  }
}

function summarizeComposition(blocks, scope) {
  const total = blocks.reduce((sum, block) => sum + block.value, 0);
  const byCategory = new Map();
  for (const block of blocks) {
    const item = byCategory.get(block.category) ?? { id: `composition.${block.category}`, category: block.category, name: CATEGORY_NAMES[block.category], count: 0, value: 0, unit: "bytes", scope, evidence: block.evidence, source: "UTF-8 bytes of mutually exclusive canonical classified values", share: 0 };
    item.count += 1;
    item.value += block.value;
    byCategory.set(block.category, item);
  }
  return [...byCategory.values()].map((item) => ({ ...item, share: total ? Number(((item.value / total) * 100).toFixed(1)) : 0 }));
}

function largestContributors(blocks, total, scope) {
  const ordinal = new Map();
  const repeatCounts = new Map();
  for (const block of blocks) repeatCounts.set(block.repeatKey, (repeatCounts.get(block.repeatKey) ?? 0) + 1);
  return [...blocks].sort((left, right) => right.value - left.value).slice(0, 10).map((block) => {
    const key = `${block.category}:${block.type}`;
    const next = (ordinal.get(key) ?? 0) + 1;
    ordinal.set(key, next);
    const exactRepeatCount = repeatCounts.get(block.repeatKey) ?? 1;
    return {
      id: safeContributorId(block.category, block.type, next),
      category: block.category,
      type: safeTypeName(block.type),
      value: block.value,
      unit: block.unit,
      share: total ? Number(((block.value / total) * 100).toFixed(1)) : 0,
      scope,
      evidence: block.evidence,
      ...(exactRepeatCount > 1 && ["tool_calls", "tool_results"].includes(block.category) ? { exactRepeatCount } : {}),
    };
  });
}

function collectUsage(records, agent) {
  const samples = [];
  let source = "No supported provider usage field found";
  if (agent === "codex") {
    const events = records.filter((record) => record?.type === "event_msg" && record?.payload?.type === "token_count" && record.payload.info);
    for (const event of events) {
      const value = event.payload.info.last_token_usage;
      if (value) samples.push(normalizeUsage(value));
    }
    const lastTotal = events.at(-1)?.payload?.info?.total_token_usage;
    return usageResult(samples, lastTotal ? normalizeUsage(lastTotal) : sumUsage(samples), "event_msg.payload.info.last_token_usage / total_token_usage");
  }
  if (agent === "claude") {
    for (const record of records) if (record?.type === "assistant" && record.message?.usage) samples.push(normalizeUsage(record.message.usage));
    source = "assistant.message.usage";
  } else {
    for (const record of records) if (record?.type === "message" && record.message?.role === "assistant" && record.message?.usage) samples.push(normalizeUsage(record.message.usage));
    source = "message.message.usage";
  }
  return usageResult(samples, sumUsage(samples), source);
}

function normalizeUsage(value) {
  return {
    input: number(value.input_tokens ?? value.input),
    cachedInput: number(value.cached_input_tokens),
    cacheRead: number(value.cache_read_input_tokens ?? value.cacheRead),
    cacheWrite: number(value.cache_creation_input_tokens ?? value.cache_write_input_tokens ?? value.cacheWrite),
    output: number(value.output_tokens ?? value.output),
    reasoningOutput: number(value.reasoning_output_tokens ?? value.reasoning),
    providerTotal: number(value.total_tokens ?? value.totalTokens ?? value.total),
  };
}

function usageResult(samples, cumulative, source) {
  const latest = samples.at(-1) ?? emptyUsage();
  return {
    latest,
    cumulative: cumulative ?? emptyUsage(),
    calls: samples.length,
    callSource: source,
    source,
    limitations: samples.length ? [] : ["Provider response usage is unavailable in the preserved session."],
  };
}

function sumUsage(samples) {
  if (!samples.length) return emptyUsage();
  const result = emptyUsage();
  for (const sample of samples) for (const key of Object.keys(result)) if (sample[key] !== null) result[key] = (result[key] ?? 0) + sample[key];
  return result;
}

function emptyUsage() {
  return { input: null, cachedInput: null, cacheRead: null, cacheWrite: null, output: null, reasoningOutput: null, providerTotal: null };
}

function number(value) {
  return Number.isFinite(value) ? value : null;
}

function findModel(records, agent, selection) {
  if (agent === "codex") {
    const record = [...records].reverse().find((item) => item?.type === "turn_context" && item.payload?.model);
    return record ? { value: record.payload.model, source: "turn_context.payload.model" } : null;
  }
  if (agent === "claude") {
    const record = [...records].reverse().find((item) => item?.message?.model);
    return record ? { value: record.message.model, source: "assistant.message.model" } : null;
  }
  if (selection.runtimeModel) return { value: selection.runtimeModel, source: "Pi extension ctx.model" };
  const branch = piBranchRecords(records, selection.leafId);
  const record = [...branch].reverse().find((item) => item?.type === "model_change" || (item?.message?.role === "assistant" && item.message?.model));
  const value = record?.type === "model_change" ? record.modelId ?? record.model : record?.message?.model;
  return value ? { value, source: record.type === "model_change" ? "active branch model_change.modelId" : "active branch assistant.message.model" } : null;
}

function findEffort(records, agent, selection) {
  if (agent === "pi") {
    if (selection.runtimeEffort) return { value: selection.runtimeEffort, source: "Pi extension pi.getThinkingLevel()" };
    const record = [...piBranchRecords(records, selection.leafId)].reverse().find((item) => item?.type === "thinking_level_change");
    return record?.thinkingLevel ? { value: record.thinkingLevel, source: "active branch thinking_level_change.thinkingLevel" } : null;
  }
  if (agent === "codex") {
    const record = [...records].reverse().find((item) => item?.type === "turn_context" && (item.payload?.effort || item.payload?.reasoning_effort));
    const value = record?.payload?.effort ?? record?.payload?.reasoning_effort;
    return value ? { value, source: "turn_context.payload.effort" } : null;
  }
  return null;
}

function piBranchRecords(records, liveLeafId) {
  const byId = new Map(records.filter((record) => record?.id && record.type !== "session").map((record) => [record.id, record]));
  let leaf = liveLeafId ?? [...records].reverse().find((record) => record?.id && record.type !== "session")?.id;
  const branch = [];
  const seen = new Set();
  while (leaf && !seen.has(leaf)) {
    seen.add(leaf);
    const record = byId.get(leaf);
    if (!record) break;
    branch.push(record);
    leaf = record.parentId;
  }
  return branch.reverse();
}

function findCapacity(records, agent) {
  if (agent !== "codex") return null;
  const info = [...records].reverse().find((record) => record?.type === "event_msg" && record?.payload?.type === "token_count")?.payload?.info;
  const value = info?.model_context_window;
  return Number.isFinite(value) ? { value, source: "event_msg.payload.info.model_context_window" } : null;
}

function isCompaction(record, agent) {
  if (agent === "pi") return ["compaction", "session_compact"].includes(record?.type);
  if (agent === "claude") return String(record?.type).includes("compact") || String(record?.type).includes("summary");
  return record?.type === "compacted" || (record?.type === "turn_context" && typeof record?.payload?.summary === "string");
}

function measurementScope(agent, selection) {
  if (agent === "pi" && !selection.leafId) return SCOPES.LATEST_PERSISTED_BRANCH;
  return SCOPES.ACTIVE_MESSAGES;
}

function activeScopeDescription(agent, selection) {
  if (agent === "pi" && selection.leafId) return "provider-facing messages on the live SessionManager branch after compaction; excludes system prompt and tool definitions";
  if (agent === "pi") return "latest persisted branch candidate; live leaf unavailable";
  if (agent === "claude") return "provider-facing messages on the latest parent-linked persisted history";
  return "provider-facing messages from the latest compacted replacement history plus subsequent rollout items; branch semantics unavailable";
}

function safeLimitations(limitations) {
  const output = [];
  let unsupported = false;
  for (const limitation of limitations) {
    if (/^(Unknown|Unsupported|Known .* omitted)/.test(limitation)) { unsupported = true; continue; }
    if (limitation.startsWith("No session matched requested working directory")) {
      output.push("No session matched the requested working directory; the newest supported session was selected as a labelled fallback.");
      continue;
    }
    output.push(limitation);
  }
  if (unsupported) output.push("Some unsupported or non-context persisted record types were omitted.");
  return output;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

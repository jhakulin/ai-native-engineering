import fs from "node:fs";

const schemaUrl = [
  new URL("../../advisor-output-schema.json", import.meta.url),
  new URL("../advisor-output-schema.json", import.meta.url),
].find((candidate) => fs.existsSync(candidate));
if (!schemaUrl) throw new Error("advisor-output-schema.json is unavailable");
const schema = JSON.parse(fs.readFileSync(schemaUrl, "utf8"));

const ALLOWED_COMMANDS = Object.freeze({
  codex: Object.freeze({ "/compact": { minArgs: 0, maxArgs: 0 }, "/model": { minArgs: 1, maxArgs: 1 } }),
  claude: Object.freeze({ "/compact": { minArgs: 0, maxArgs: 1 }, "/model": { minArgs: 1, maxArgs: 1 }, "/effort": { minArgs: 1, maxArgs: 1 } }),
  pi: Object.freeze({ "/compact": { minArgs: 0, maxArgs: 1 }, "/model": { minArgs: 1, maxArgs: 1 } }),
});

export function validateAdvisorOutput(output, stats) {
  const errors = [];
  validateSchema(output, schema, "$", errors);
  if (errors.length === 0) validateSemantics(output, stats, errors);
  if (errors.length === 0) validateOutputPrivacy(output, errors);
  return { valid: errors.length === 0, errors, value: errors.length === 0 ? structuredClone(output) : null };
}

export function attachAdvisorOutput(stats, candidate, overhead = {}) {
  const report = structuredClone(stats);
  const validation = validateAdvisorOutput(candidate, report);
  report.advisorOverhead = normalizeOverhead(overhead);
  report.advisor = validation.valid
    ? { status: "available", output: validation.value, limitation: null }
    : { status: "unavailable", output: null, limitation: `Advisor output failed deterministic validation (${validation.errors.length} issue(s): ${summarizeValidationErrors(validation.errors)}).` };
  return { report, validation };
}

export function attachAdvisorFailure(stats, limitation, overhead = {}) {
  const report = structuredClone(stats);
  report.advisor = { status: "unavailable", output: null, limitation: safeLimitation(limitation) };
  report.advisorOverhead = normalizeOverhead({ ...overhead, status: overhead.status ?? "failed" });
  return report;
}

function summarizeValidationErrors(errors) {
  const categories = new Set(errors.map((error) => {
    if (error.includes("display privacy")) return "display_privacy";
    if (error.includes("capability") || error.includes("running harness")) return "unsupported_capability";
    if (error.includes("estimatedReducibleScope")) return "invalid_reducible_scope";
    if (error.includes("unknown evidence ID") || error.includes("unknown metric ID")) return "unknown_evidence";
    if (error.includes("command") || error.includes("/compact") || error.includes("/model") || error.includes("/effort")) return "unsupported_command";
    if (error.includes("additional property") || error.includes("expected") || error.includes("required") || error.includes("allowed shape")) return "invalid_shape";
    return "invalid_semantics";
  }));
  return [...categories].join(", ");
}

function normalizeOverhead(overhead) {
  return {
    provider: overhead.provider ?? null,
    model: overhead.model ?? null,
    effort: overhead.effort ?? null,
    contextSource: overhead.contextSource ?? null,
    inputTokens: finiteOrNull(overhead.inputTokens),
    cacheReadTokens: finiteOrNull(overhead.cacheReadTokens),
    cacheWriteTokens: finiteOrNull(overhead.cacheWriteTokens),
    outputTokens: finiteOrNull(overhead.outputTokens),
    providerTotalTokens: finiteOrNull(overhead.providerTotalTokens),
    elapsedMs: finiteOrNull(overhead.elapsedMs),
    reportedCost: finiteOrNull(overhead.reportedCost),
    status: overhead.status ?? "completed",
    limitation: overhead.limitation ?? null,
  };
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function safeLimitation(value) {
  const text = String(value ?? "Advisor analysis failed.").replace(/[\r\n\t]+/g, " ").slice(0, 300);
  return text || "Advisor analysis failed.";
}

function validateSemantics(output, stats, errors) {
  const metricIds = new Set((stats?.metrics ?? []).map((item) => item.id));
  const driverIds = new Set((stats?.measuredDrivers ?? []).map((item) => item.id));
  const contributorIds = new Set((stats?.contributors ?? []).map((item) => item.id));
  const evidenceIds = new Set([...metricIds, ...driverIds]);
  const allEvidenceIds = new Set([...evidenceIds, ...contributorIds]);

  const ranks = output.recommendedActions.map((action) => action.rank);
  if (new Set(ranks).size !== ranks.length) errors.push("$.recommendedActions: ranks must be unique");
  if (ranks.some((rank, index) => rank !== index + 1)) errors.push("$.recommendedActions: ranks must be consecutive and match display order");

  output.recommendedActions.forEach((action, index) => {
    checkIds(action.metricIds, metricIds, `$.recommendedActions[${index}].metricIds`, errors);
    checkIds(action.driverIds, driverIds, `$.recommendedActions[${index}].driverIds`, errors);
    checkIds(action.contributorIds, contributorIds, `$.recommendedActions[${index}].contributorIds`, errors);
    if (action.metricIds.length + action.driverIds.length + action.contributorIds.length === 0) {
      errors.push(`$.recommendedActions[${index}]: at least one evidence reference is required`);
    }
    validateExpectedBenefit(action.expectedBenefit, stats?.metrics ?? [], `$.recommendedActions[${index}].expectedBenefit`, errors);
  });

  checkIds(output.modelFit.evidenceIds, evidenceIds, "$.modelFit.evidenceIds", errors);
  checkIds(output.contextAction.evidenceIds, evidenceIds, "$.contextAction.evidenceIds", errors);
  output.contextAction.preserve.forEach((item, index) => checkIds(item.evidenceIds, allEvidenceIds, `$.contextAction.preserve[${index}].evidenceIds`, errors));
  output.persistentCompactionAdvice.forEach((item, index) => checkIds(item.evidenceIds, allEvidenceIds, `$.persistentCompactionAdvice[${index}].evidenceIds`, errors));

  const reducible = output.contextAction.estimatedReducibleScope;
  if (reducible) validateReducibleScope(reducible, stats?.metrics ?? [], errors);

  validateModelFit(output.modelFit, stats, errors);
  validatePersistentAdvice(output.persistentCompactionAdvice, stats, errors);
  validateCommand(output.modelFit.command, stats?.session?.harness, "$.modelFit.command", errors);
  validateCommand(output.contextAction.command, stats?.session?.harness, "$.contextAction.command", errors);
  validateContextAction(output.contextAction, errors);
}

function validateExpectedBenefit(benefit, metrics, path, errors) {
  if (benefit.proxyType === "qualitative") {
    if (benefit.metricId !== null) errors.push(`${path}.metricId: qualitative benefit must not cite a metric proxy`);
    return;
  }
  if (benefit.metricId === null) {
    errors.push(`${path}.metricId: measured benefit requires a metric`);
    return;
  }
  const metric = metrics.find((item) => item.id === benefit.metricId);
  if (!metric) {
    errors.push(`${path}.metricId: unknown metric ID ${benefit.metricId}`);
    return;
  }
  if (metric.unit !== benefit.proxyType) errors.push(`${path}.proxyType: must match the cited metric unit`);
}

function validateContextAction(contextAction, errors) {
  if (contextAction.recommendation !== "none" && contextAction.evidenceIds.length === 0) {
    errors.push("$.contextAction.evidenceIds: a recommendation requires evidence");
  }
  if (contextAction.recommendation === "compact") {
    if (contextAction.command?.name !== "/compact") errors.push("$.contextAction.command: compact requires the harness /compact command");
    if (contextAction.estimatedReducibleScope === null) errors.push("$.contextAction.estimatedReducibleScope: compact requires grounded reducible scope");
    if (contextAction.preserve.length === 0) errors.push("$.contextAction.preserve: compact requires a preservation manifest");
  } else if (contextAction.command !== null) {
    errors.push("$.contextAction.command: only compact may include a context command");
  }
}

function validateModelFit(modelFit, stats, errors) {
  const capabilities = stats?.capabilities;
  const currentModel = stats?.session?.model ?? "unavailable";
  const currentEffort = stats?.session?.effort ?? "unavailable";
  if (modelFit.currentModel !== currentModel) errors.push("$.modelFit.currentModel: must match the inspected session");
  if (modelFit.currentEffort !== currentEffort) errors.push("$.modelFit.currentEffort: must match the inspected session");
  if (modelFit.recommendation !== "none" && modelFit.evidenceIds.length === 0) errors.push("$.modelFit.evidenceIds: a recommendation requires evidence");
  if (["keep", "none"].includes(modelFit.recommendation)) {
    if (modelFit.proposedModel !== null || modelFit.proposedEffort !== null || modelFit.command !== null) {
      errors.push("$.modelFit: keep/none cannot propose a model, effort, or command");
    }
    return;
  }
  if (!capabilities) {
    errors.push("$.modelFit: alternative recommendations require harness-exposed capability evidence");
    return;
  }
  if (modelFit.proposedModel !== null && !(capabilities.availableModels ?? []).includes(modelFit.proposedModel)) {
    errors.push("$.modelFit.proposedModel: model is not exposed by the running harness");
  }
  if (modelFit.proposedEffort !== null && !(capabilities.availableEfforts ?? []).includes(modelFit.proposedEffort)) {
    errors.push("$.modelFit.proposedEffort: effort is not exposed by the running harness");
  }
  if (["faster_model", "stronger_model", "larger_context_model"].includes(modelFit.recommendation) && modelFit.proposedModel === null) {
    errors.push("$.modelFit.proposedModel: selected recommendation requires a model");
  }
  if (["lower_effort", "raise_effort"].includes(modelFit.recommendation) && modelFit.proposedEffort === null) {
    errors.push("$.modelFit.proposedEffort: selected recommendation requires an effort");
  }
  const modelRecommendation = ["faster_model", "stronger_model", "larger_context_model"].includes(modelFit.recommendation);
  const effortRecommendation = ["lower_effort", "raise_effort"].includes(modelFit.recommendation);
  if (modelFit.command !== null) {
    if (modelRecommendation && (modelFit.command.name !== "/model" || modelFit.command.args[0] !== modelFit.proposedModel)) {
      errors.push("$.modelFit.command: model recommendation must use /model with the proposed model");
    }
    if (effortRecommendation && (modelFit.command.name !== "/effort" || modelFit.command.args[0] !== modelFit.proposedEffort)) {
      errors.push("$.modelFit.command: effort recommendation must use /effort with the proposed effort");
    }
  }
  if (modelFit.command?.name === "/model" && !(capabilities.availableModels ?? []).includes(modelFit.command.args[0])) {
    errors.push("$.modelFit.command.args: model is not exposed by the running harness");
  }
  if (modelFit.command?.name === "/effort" && !(capabilities.availableEfforts ?? []).includes(modelFit.command.args[0])) {
    errors.push("$.modelFit.command.args: effort is not exposed by the running harness");
  }
}

function validatePersistentAdvice(items, stats, errors) {
  const supported = new Set(stats?.capabilities?.supportedSettings ?? []);
  for (const [index, item] of items.entries()) {
    if (item.evidenceIds.length === 0) errors.push(`$.persistentCompactionAdvice[${index}].evidenceIds: persistent advice requires evidence`);
    if (!supported.has(item.setting)) errors.push(`$.persistentCompactionAdvice[${index}].setting: setting is not exposed as supported by the running harness`);
  }
}

function validateReducibleScope(reducible, metrics, errors) {
  const metric = metrics.find((item) => item.id === reducible.metricId);
  if (!metric) {
    errors.push(`$.contextAction.estimatedReducibleScope.metricId: unknown metric ID ${reducible.metricId}`);
    return;
  }
  if (metric.value === null || !Number.isFinite(metric.value)) errors.push("$.contextAction.estimatedReducibleScope: cited metric is unavailable");
  if (reducible.unit !== metric.unit) errors.push("$.contextAction.estimatedReducibleScope.unit: must match the cited metric");
  if (reducible.scope !== metric.scope) errors.push("$.contextAction.estimatedReducibleScope.scope: must match the cited metric");
  if (Number.isFinite(metric.value) && reducible.value > metric.value) errors.push("$.contextAction.estimatedReducibleScope.value: cannot exceed the cited metric");
}

function validateOutputPrivacy(output, errors) {
  const forbidden = [
    /```/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/i,
    /\b(?:sk|api)[_-][A-Za-z0-9_-]{16,}\b/i,
    /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|password|passwd|secret)\s*[:=]\s*["']?\S{6,}/i,
    /https?:\/\/\S+[?#]\S+/i,
    /\b[A-Za-z0-9+/]{64,}={0,2}\b/,
  ];
  for (const text of collectStrings(output)) {
    if (text.includes("\n") || text.includes("\r") || forbidden.some((pattern) => pattern.test(text))) {
      errors.push("$: advisor output violates the display privacy policy");
      return;
    }
  }
}

function collectStrings(value, output = []) {
  if (typeof value === "string") output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, output));
  return output;
}

function checkIds(values, allowed, path, errors) {
  for (const value of values) if (!allowed.has(value)) errors.push(`${path}: unknown evidence ID ${value}`);
}

function validateCommand(command, expectedHarness, path, errors) {
  if (command === null) return;
  if (command.harness !== expectedHarness) errors.push(`${path}.harness: expected ${expectedHarness}`);
  if (command.kind !== "command" || command.settingScope !== null) {
    errors.push(`${path}: only read-only interactive command suggestions are supported`);
    return;
  }
  const rule = ALLOWED_COMMANDS[command.harness]?.[command.name];
  if (!rule) {
    errors.push(`${path}.name: unsupported ${command.harness} command ${command.name}`);
    return;
  }
  if (command.args.length < rule.minArgs || command.args.length > rule.maxArgs) {
    errors.push(`${path}.args: ${command.name} requires ${rule.minArgs === rule.maxArgs ? rule.minArgs : `${rule.minArgs}-${rule.maxArgs}`} argument(s)`);
  }
}

function validateSchema(value, current, path, errors) {
  if (current.$ref) return validateSchema(value, resolveRef(current.$ref), path, errors);
  if (current.anyOf) {
    const candidates = current.anyOf.map((candidate) => {
      const candidateErrors = [];
      validateSchema(value, candidate, path, candidateErrors);
      return candidateErrors;
    });
    if (!candidates.some((candidate) => candidate.length === 0)) errors.push(`${path}: does not match any allowed shape`);
    return;
  }
  if ("const" in current && value !== current.const) errors.push(`${path}: must equal ${JSON.stringify(current.const)}`);
  if (current.enum && !current.enum.some((item) => Object.is(item, value))) errors.push(`${path}: unsupported value ${JSON.stringify(value)}`);
  if (current.type && !matchesType(value, current.type)) {
    errors.push(`${path}: expected ${current.type}`);
    return;
  }
  if (current.type === "object") validateObject(value, current, path, errors);
  else if (current.type === "array") validateArray(value, current, path, errors);
  else if (current.type === "string") validateString(value, current, path, errors);
  else if (current.type === "number" || current.type === "integer") validateNumber(value, current, path, errors);
}

function validateObject(value, current, path, errors) {
  for (const required of current.required ?? []) if (!(required in value)) errors.push(`${path}.${required}: required`);
  if (current.additionalProperties === false) {
    for (const key of Object.keys(value)) if (!(key in (current.properties ?? {}))) errors.push(`${path}.${key}: additional property is not allowed`);
  }
  for (const [key, child] of Object.entries(current.properties ?? {})) {
    if (key in value) validateSchema(value[key], child, `${path}.${key}`, errors);
  }
}

function validateArray(value, current, path, errors) {
  if (current.maxItems !== undefined && value.length > current.maxItems) errors.push(`${path}: maximum ${current.maxItems} items`);
  if (current.minItems !== undefined && value.length < current.minItems) errors.push(`${path}: minimum ${current.minItems} items`);
  if (current.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${path}: items must be unique`);
  value.forEach((item, index) => validateSchema(item, current.items, `${path}[${index}]`, errors));
}

function validateString(value, current, path, errors) {
  if (current.minLength !== undefined && value.length < current.minLength) errors.push(`${path}: minimum length ${current.minLength}`);
  if (current.maxLength !== undefined && value.length > current.maxLength) errors.push(`${path}: maximum length ${current.maxLength}`);
}

function validateNumber(value, current, path, errors) {
  if (current.minimum !== undefined && value < current.minimum) errors.push(`${path}: minimum ${current.minimum}`);
  if (current.maximum !== undefined && value > current.maximum) errors.push(`${path}: maximum ${current.maximum}`);
}

function matchesType(value, type) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return Number.isFinite(value);
  return typeof value === type;
}

function resolveRef(ref) {
  if (!ref.startsWith("#/$defs/")) throw new Error(`Unsupported schema reference: ${ref}`);
  const name = ref.slice("#/$defs/".length);
  if (!schema.$defs[name]) throw new Error(`Unknown schema reference: ${ref}`);
  return schema.$defs[name];
}

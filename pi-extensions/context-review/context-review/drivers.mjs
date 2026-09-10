const LARGE_CONTRIBUTOR_SHARE = 20;
const STANDING_CONTEXT_SHARE = 10;
const LARGE_FRESH_INPUT_SHARE = 20;
const OUTPUT_DOMINANT_SHARE = 20;

export function buildMeasuredDrivers(report) {
  const drivers = [];
  const calls = metricValue(report, "session.model_calls");
  const latestInput = finite(report?.usage?.attribution?.latestProcessedInput);
  const cumulativeInput = finite(report?.usage?.attribution?.processedInput);
  const largest = report?.contributors?.[0];
  const processedInput = finite(report?.usage?.attribution?.processedInput);
  const reprocessedInput = finite(report?.usage?.attribution?.reprocessedInput);
  const freshInput = finite(report?.usage?.attribution?.freshInput);
  const visibleOutput = finite(report?.usage?.attribution?.visibleOutput);
  const inputOutputTokens = finite(report?.usage?.attribution?.inputOutputTokens);

  if (calls >= 1 && processedInput > 0 && reprocessedInput > 0) {
    const share = Number(((reprocessedInput / processedInput) * 100).toFixed(1));
    drivers.push({
      id: "driver.context_reprocessing",
      kind: "context_reprocessing",
      name: "Context reprocessing",
      target: "cumulative_input_consumption",
      scope: report.usage.cumulativeScope,
      unit: "tokens",
      evidence: report.usage.evidence,
      metricIds: ["usage.cumulative.reprocessed_input", "usage.cumulative.processed_input", "session.model_calls"],
      contributorIds: [],
      impact: { value: reprocessedInput, unit: "tokens", share },
      occurrenceCount: calls,
      observations: [
        observation("reprocessed_input", reprocessedInput, "tokens", "usage.cumulative.reprocessed_input"),
        observation("processed_input", processedInput, "tokens", "usage.cumulative.processed_input"),
        observation("distinct_requests", calls, "calls", "metrics.session.model_calls"),
      ],
      description: `${formatInteger(reprocessedInput)} provider-reported cached or cache-read tokens account for ${share}% of ${formatInteger(processedInput)} processed input tokens across ${calls} observable model call(s).`,
      limitation: "Provider-reported cache use establishes context reprocessing, but does not show that the retained context was unnecessary.",
    });
  }

  if (calls >= 1 && processedInput > 0 && freshInput > 0) {
    const share = Number(((freshInput / processedInput) * 100).toFixed(1));
    if (share >= LARGE_FRESH_INPUT_SHARE) drivers.push({
      id: "driver.large_fresh_input",
      kind: "large_fresh_input_load",
      name: "Large fresh-input load",
      target: "cumulative_input_consumption",
      scope: report.usage.cumulativeScope,
      unit: "tokens",
      evidence: report.usage.evidence,
      metricIds: ["usage.cumulative.fresh_input", "usage.cumulative.processed_input", "session.model_calls"],
      contributorIds: [],
      impact: { value: freshInput, unit: "tokens", share },
      occurrenceCount: calls,
      observations: [
        observation("fresh_input", freshInput, "tokens", "usage.cumulative.fresh_input"),
        observation("processed_input", processedInput, "tokens", "usage.cumulative.processed_input"),
        observation("distinct_requests", calls, "calls", "metrics.session.model_calls"),
      ],
      description: `${formatInteger(freshInput)} provider-reported fresh or uncached tokens account for ${share}% of ${formatInteger(processedInput)} processed input tokens across ${calls} observable model call(s).`,
      limitation: "Fresh input establishes new input processing, but does not show that the material was unnecessary or identify a request-local contributor.",
    });
  }

  if (calls >= 2 && latestInput !== null && cumulativeInput !== null && cumulativeInput > latestInput) {
    drivers.push({
      id: "driver.history_replay",
      kind: "history_replay",
      name: "Input processed across multiple model calls",
      target: "cumulative_input_consumption",
      scope: report.usage.cumulativeScope,
      unit: "tokens",
      evidence: report.usage.evidence,
      metricIds: ["session.model_calls", "usage.latest.processed_input", "usage.cumulative.processed_input"],
      contributorIds: [],
      impact: null,
      occurrenceCount: calls,
      observations: [
        observation("observable_model_calls", calls, "calls", "metrics.session.model_calls"),
        observation("latest_processed_input", latestInput, "tokens", "usage.latest.processed_input"),
        observation("cumulative_processed_input", cumulativeInput, "tokens", "usage.cumulative.processed_input"),
      ],
      description: `${formatInteger(cumulativeInput)} processed input tokens were reported across ${calls} observable model calls; the latest call accounted for ${formatInteger(latestInput)} processed input tokens.`,
      limitation: "Cumulative processed input establishes input across calls, but preserved usage does not isolate how many tokens came from replayed history or from new content.",
    });
  }

  if (calls >= 1 && inputOutputTokens > 0 && visibleOutput > 0) {
    const share = Number(((visibleOutput / inputOutputTokens) * 100).toFixed(1));
    if (share >= OUTPUT_DOMINANT_SHARE) drivers.push({
      id: "driver.output_dominance",
      kind: "output_dominant_consumption",
      name: "Output-dominant consumption",
      target: "cumulative_input_output_consumption",
      scope: report.usage.cumulativeScope,
      unit: "tokens",
      evidence: report.usage.evidence,
      metricIds: ["usage.cumulative.visible_output", "usage.cumulative.input_output_tokens", "session.model_calls"],
      contributorIds: [],
      impact: { value: visibleOutput, unit: "tokens", share },
      occurrenceCount: calls,
      observations: [
        observation("visible_output", visibleOutput, "tokens", "usage.cumulative.visible_output"),
        observation("input_output_tokens", inputOutputTokens, "tokens", "usage.cumulative.input_output_tokens"),
      ],
      description: `${formatInteger(visibleOutput)} visible output tokens account for ${share}% of ${formatInteger(inputOutputTokens)} processed input and visible output tokens.`,
      limitation: "Output volume does not establish that the responses were unnecessarily long or semantically reducible.",
    });
  }

  const repeatedFailure = report?.activity?.repeatedFailures?.[0];
  if (repeatedFailure?.count >= 2) drivers.push({
    id: "driver.repeated_failure_loop",
    kind: "repeated_failure_or_retry_loop",
    name: "Repeated explicit failures",
    target: "activity",
    scope: report.usage.cumulativeScope,
    unit: "calls",
    evidence: repeatedFailure.evidence,
    metricIds: ["activity.repeated_failed_operations"],
    contributorIds: [],
    impact: { value: repeatedFailure.count, unit: "calls", share: null },
    occurrenceCount: repeatedFailure.count,
    observations: [observation("failed_operations", repeatedFailure.count, "calls", "activity.repeated_failed_operations")],
    description: `${repeatedFailure.count} distinct operations have explicit persisted failure status in the inspected session.`,
    limitation: "Explicit repeated failures do not establish that the operations were retries or that the failures had the same root cause.",
  });

  if (largest && finite(largest.share) >= LARGE_CONTRIBUTOR_SHARE) {
    drivers.push({
      id: "driver.large_active_contributor",
      kind: "large_active_contributor",
      name: "Large active contributor",
      target: "active_context_occupancy",
      scope: largest.scope,
      unit: largest.unit,
      evidence: largest.evidence,
      metricIds: [largest.scope === "latest_observed_request_payload" ? "request.serialized_bytes" : "active.serialized_bytes"],
      contributorIds: [largest.id],
      impact: { value: largest.value, unit: largest.unit, share: largest.share },
      occurrenceCount: 1,
      observations: [
        observation("contributor_size", largest.value, largest.unit, `contributors.${largest.id}.value`),
        observation("contributor_share", largest.share, "percent", `contributors.${largest.id}.share`),
      ],
      description: `${largest.id} is the largest measured contributor at ${formatInteger(largest.value)} ${largest.unit} (${largest.share}% of ${largest.scope}).`,
      limitation: "Size does not establish that this contributor is unnecessary or safe to reduce.",
    });
  }

  const repeated = (report?.contributors ?? []).find((item) => ["tool_calls", "tool_results"].includes(item.category) && item.exactRepeatCount >= 2);
  if (repeated) {
    drivers.push({
      id: "driver.exact_repeat",
      kind: "exact_repeat",
      name: "Exact repeated active content",
      target: "active_context_occupancy",
      scope: repeated.scope,
      unit: repeated.unit,
      evidence: repeated.evidence,
      metricIds: [repeated.scope === "latest_observed_request_payload" ? "request.serialized_bytes" : "active.serialized_bytes"],
      contributorIds: [repeated.id],
      impact: repeatImpact(report, repeated),
      occurrenceCount: repeated.exactRepeatCount,
      observations: [
        observation("exact_repeat_count", repeated.exactRepeatCount, "items", `contributors.${repeated.id}.exactRepeatCount`),
        observation("serialized_size_each", repeated.value, repeated.unit, `contributors.${repeated.id}.value`),
      ],
      description: `${repeated.id} has ${repeated.exactRepeatCount} byte-identical active instances of ${formatInteger(repeated.value)} ${repeated.unit} each.`,
      limitation: "Exact repetition does not establish that an earlier instance was still authoritative or that repetition was unnecessary.",
    });
  }

  const standing = standingContext(report, calls);
  if (standing) drivers.push(standing);

  return drivers;
}

function standingContext(report, calls) {
  if (calls > 1) return null;
  const categories = new Set(["instructions", "tool_definitions"]);
  const composition = (report?.composition ?? []).filter((item) => categories.has(item.category));
  const share = Number(composition.reduce((sum, item) => sum + (finite(item.share) ?? 0), 0).toFixed(1));
  if (share < STANDING_CONTEXT_SHARE) return null;
  const contributors = (report?.contributors ?? []).filter((item) => categories.has(item.category));
  if (!contributors.length) return null;
  const value = composition.reduce((sum, item) => sum + (finite(item.value) ?? 0), 0);
  const unit = composition[0]?.unit ?? "bytes";
  const scope = composition[0]?.scope ?? report?.session?.activeHistoryScope ?? "active_context";
  return {
    id: "driver.standing_context",
    kind: "standing_context",
    name: "Material standing context",
    target: "active_context_occupancy",
    scope,
    unit,
    evidence: composition[0]?.evidence ?? "unavailable",
    metricIds: [scope === "latest_observed_request_payload" ? "request.serialized_bytes" : "active.serialized_bytes"],
    contributorIds: contributors.map((item) => item.id).slice(0, 3),
    impact: { value, unit, share },
    occurrenceCount: contributors.length,
    observations: [
      observation("standing_context_size", value, unit, "composition.instructions_and_tool_definitions.value"),
      observation("standing_context_share", share, "percent", "composition.instructions_and_tool_definitions.share"),
    ],
    description: `Instructions and tool definitions occupy ${formatInteger(value)} ${unit} (${share}% of ${scope}) in a session with ${calls} observable model call(s).`,
    limitation: "One session does not establish that any standing instruction or tool is unused.",
  };
}

function repeatImpact(report, repeated) {
  const value = (repeated.exactRepeatCount - 1) * repeated.value;
  const totalMetricId = repeated.scope === "latest_observed_request_payload" ? "request.serialized_bytes" : "active.serialized_bytes";
  const total = metricValue(report, totalMetricId);
  return { value, unit: repeated.unit, share: total > 0 ? Number(((value / total) * 100).toFixed(1)) : null };
}

function metricValue(report, id) {
  return finite(report?.metrics?.find((item) => item.id === id)?.value) ?? 0;
}

function observation(name, value, unit, source) {
  return { name, value, unit, source };
}

function finite(value) {
  return Number.isFinite(value) ? value : null;
}

function formatInteger(value) {
  return Number(value).toLocaleString("en-US");
}

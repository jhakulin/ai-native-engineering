const DRIVER_LIMIT = 3;
const LARGE_CONTRIBUTOR_SHARE = 20;
const STANDING_CONTEXT_SHARE = 10;

export function buildMeasuredDrivers(report) {
  const drivers = [];
  const calls = metricValue(report, "session.model_calls");
  const latestInput = finite(report?.usage?.latest?.input);
  const cumulativeInput = finite(report?.usage?.cumulative?.input);
  const largest = report?.contributors?.[0];

  if (calls >= 2 && latestInput !== null && cumulativeInput !== null && cumulativeInput > latestInput) {
    drivers.push({
      id: "driver.history_replay",
      kind: "history_replay",
      name: "Input processed across multiple model calls",
      scope: report.usage.cumulativeScope,
      evidence: report.usage.evidence,
      metricIds: ["session.model_calls"],
      contributorIds: [],
      observations: [
        observation("observable_model_calls", calls, "calls", "metrics.session.model_calls"),
        observation("latest_input", latestInput, "tokens", "usage.latest.input"),
        observation("cumulative_input", cumulativeInput, "tokens", "usage.cumulative.input"),
      ],
      description: `${formatInteger(cumulativeInput)} input tokens were reported across ${calls} observable model calls; the latest call reported ${formatInteger(latestInput)} input tokens.`,
      limitation: "Cumulative input establishes repeated input processing, but preserved usage does not isolate how many tokens came from replayed history or from new content.",
    });
  }

  if (largest && finite(largest.share) >= LARGE_CONTRIBUTOR_SHARE) {
    drivers.push({
      id: "driver.large_active_contributor",
      kind: "large_active_contributor",
      name: "Large active contributor",
      scope: largest.scope,
      evidence: largest.evidence,
      metricIds: [largest.scope === "latest_observed_request_payload" ? "request.serialized_bytes" : "active.serialized_bytes"],
      contributorIds: [largest.id],
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
      scope: repeated.scope,
      evidence: repeated.evidence,
      metricIds: [repeated.scope === "latest_observed_request_payload" ? "request.serialized_bytes" : "active.serialized_bytes"],
      contributorIds: [repeated.id],
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

  return drivers.slice(0, DRIVER_LIMIT);
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
    scope,
    evidence: composition[0]?.evidence ?? "unavailable",
    metricIds: [scope === "latest_observed_request_payload" ? "request.serialized_bytes" : "active.serialized_bytes"],
    contributorIds: contributors.map((item) => item.id).slice(0, 3),
    observations: [
      observation("standing_context_size", value, unit, "composition.instructions_and_tool_definitions.value"),
      observation("standing_context_share", share, "percent", "composition.instructions_and_tool_definitions.share"),
    ],
    description: `Instructions and tool definitions occupy ${formatInteger(value)} ${unit} (${share}% of ${scope}) in a session with ${calls} observable model call(s).`,
    limitation: "One session does not establish that any standing instruction or tool is unused.",
  };
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

export function formatStatsReport(report) {
  const activeBytes = report.metrics.find((item) => item.id === "active.serialized_bytes");
  const activeTokens = report.metrics.find((item) => item.id === "active.tokens");
  const capacity = report.metrics.find((item) => item.id === "context.capacity");
  const calls = report.metrics.find((item) => item.id === "session.model_calls");
  const compactions = report.metrics.find((item) => item.id === "session.compactions");
  const lines = [
    "# Context efficiency",
    "",
    "## Session",
    `- Harness: ${report.session.harness}`,
    `- Session: ${report.session.id ?? "unavailable"} (${report.session.selection})`,
    `- Record: ${report.session.path}`,
    `- Working directory: ${report.session.workingDirectory ?? "unavailable"}`,
    `- Model: ${report.session.model ?? "unavailable"}`,
    `- Reasoning effort: ${report.session.effort ?? "unavailable"}`,
    `- Active scope: ${report.session.activeHistoryScope}`,
    "",
    report.metrics.find((item) => item.id === "active.serialized_bytes")?.scope === "active_reconstructed_messages" ? "## Active reconstructed messages" : "## Active context",
  ];

  if (activeTokens.value !== null) {
    const percent = capacity.value ? ` (${((activeTokens.value / capacity.value) * 100).toFixed(1)}%)` : "";
    lines.push(`- ${integer(activeTokens.value)}${capacity.value ? ` / ${integer(capacity.value)}` : ""} tokens${percent} [${activeTokens.evidence}]`);
  } else {
    lines.push(`- ${integer(activeBytes.value)} bytes serialized [${activeBytes.evidence}]`);
    lines.push("- Token count: unavailable");
    lines.push(`- Capacity: ${capacity.value === null ? "unavailable" : `${integer(capacity.value)} tokens`}`);
  }

  lines.push("", "## Latest provider response usage");
  addUsage(lines, report.usage.latest);
  lines.push("", "## Session consumption");
  lines.push(`- Observable model calls: ${calls.value}`);
  addUsage(lines, report.usage.cumulative);
  lines.push(`- Compactions: ${compactions.value}`);

  const compositionScope = report.composition[0]?.scope;
  lines.push("", compositionScope === "latest_observed_request_payload" ? "## Composition of latest observed request" : "## Composition of active reconstructed context");
  if (!report.composition.length) lines.push("- unavailable");
  for (const item of report.composition) lines.push(`- ${item.name}: ${item.count} item(s), ${integer(item.value)} bytes (${item.share}%) [${item.evidence}]`);

  lines.push("", "## Largest contributors");
  if (!report.contributors.length) lines.push("- unavailable");
  report.contributors.forEach((item, index) => lines.push(`${index + 1}. ${item.category} / ${item.type} — ${item.id}: ${integer(item.value)} bytes (${item.share}%) [${item.evidence}]`));

  lines.push("", "## Measured drivers");
  if (!(report.measuredDrivers ?? []).length) lines.push("- None supported by the available measurements.");
  for (const [index, driver] of (report.measuredDrivers ?? []).entries()) {
    lines.push(`${index + 1}. ${driver.name} — ${driver.id}`);
    lines.push(`   ${driver.description} [${driver.evidence}; ${driver.scope}]`);
    if (driver.contributorIds.length) lines.push(`   Contributors: ${driver.contributorIds.join(", ")}`);
    lines.push(`   Limitation: ${driver.limitation}`);
  }

  addAdvisor(lines, report);

  lines.push("", "## Limitations");
  report.limitations.forEach((item) => lines.push(`- ${item}`));
  return `${lines.join("\n")}\n`;
}

function addAdvisor(lines, report) {
  if (!report.advisor) return;
  lines.push("", "## Advisor");
  if (report.advisor.status !== "available") {
    lines.push(`- Advice unavailable: ${report.advisor.limitation}`);
    addAdvisorOverhead(lines, report.advisorOverhead);
    return;
  }
  const advice = report.advisor.output;
  lines.push(`- ${advice.summary}`);
  lines.push("", "### Recommended actions");
  if (!advice.recommendedActions.length) lines.push("- None supported.");
  for (const action of advice.recommendedActions) {
    lines.push(`${action.rank}. ${action.title}`);
    lines.push(`   Change: ${action.change}`);
    lines.push(`   Expected benefit: ${action.expectedBenefit.description}`);
    lines.push(`   Evidence: ${[...action.metricIds, ...action.driverIds, ...action.contributorIds].join(", ")}`);
    lines.push(`   Risk: ${action.risk}`);
  }
  lines.push("", "### Model and reasoning fit");
  lines.push(`- Recommendation: ${advice.modelFit.recommendation}`);
  lines.push(`- Current: ${advice.modelFit.currentModel}; effort ${advice.modelFit.currentEffort}`);
  lines.push("", "### Context action");
  lines.push(`- Recommendation: ${advice.contextAction.recommendation}`);
  lines.push(`- Reason: ${advice.contextAction.reason}`);
  if (advice.contextAction.command) lines.push(`- Command: ${formatCommand(advice.contextAction.command)}`);
  if (advice.contextAction.preserve.length) {
    lines.push("- Preserve:");
    for (const item of advice.contextAction.preserve) lines.push(`  - ${item.category}: ${item.description}`);
  }
  if (advice.persistentCompactionAdvice.length) {
    lines.push("", "### Persistent compaction advice");
    for (const item of advice.persistentCompactionAdvice) lines.push(`- ${item.setting}: ${item.proposedValue} (risk: ${item.risk}; rollback: ${item.rollback})`);
  }
  if (advice.limitations.length) {
    lines.push("", "### Advisor limitations");
    for (const item of advice.limitations) lines.push(`- ${item}`);
  }
  addAdvisorOverhead(lines, report.advisorOverhead);
}

function addAdvisorOverhead(lines, overhead) {
  if (!overhead) return;
  lines.push("", "### Advisor overhead");
  lines.push(`- Provider/model: ${overhead.provider ?? "unavailable"}/${overhead.model ?? "unavailable"}`);
  lines.push(`- Reasoning effort: ${overhead.effort ?? "unavailable"}`);
  lines.push(`- Context source: ${overhead.contextSource ?? "unavailable"}`);
  lines.push(`- Input: ${tokenValue(overhead.inputTokens)}`);
  lines.push(`- Cache read: ${tokenValue(overhead.cacheReadTokens)}`);
  lines.push(`- Cache write: ${tokenValue(overhead.cacheWriteTokens)}`);
  lines.push(`- Output: ${tokenValue(overhead.outputTokens)}`);
  lines.push(`- Provider total: ${tokenValue(overhead.providerTotalTokens)}`);
  lines.push(`- Elapsed: ${overhead.elapsedMs === null ? "unavailable" : `${integer(overhead.elapsedMs)} ms`}`);
  lines.push(`- Cost: ${overhead.reportedCost === null ? "unavailable" : overhead.reportedCost}`);
  lines.push(`- Status: ${overhead.status}`);
  if (overhead.limitation) lines.push(`- Limitation: ${overhead.limitation}`);
}

function formatCommand(command) {
  return [command.name, ...command.args].join(" ");
}

function addUsage(lines, usage) {
  lines.push(`- Input: ${tokenValue(usage.input)}`);
  lines.push(`- Cached input: ${tokenValue(usage.cachedInput)}`);
  lines.push(`- Cache read: ${tokenValue(usage.cacheRead)}`);
  lines.push(`- Cache write: ${tokenValue(usage.cacheWrite)}`);
  lines.push(`- Output: ${tokenValue(usage.output)}`);
  lines.push(`- Reasoning output: ${tokenValue(usage.reasoningOutput)}`);
  lines.push(`- Provider total: ${tokenValue(usage.providerTotal)}`);
}

function tokenValue(value) {
  return value === null ? "unavailable" : `${integer(value)} tokens`;
}

function integer(value) {
  return Number(value).toLocaleString("en-US");
}

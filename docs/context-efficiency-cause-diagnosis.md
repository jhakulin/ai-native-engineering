# Context Efficiency Cause Diagnosis Specification

## Outcome

`context-review` explains the largest causes of high token consumption that can
be established from the inspected session. Each result identifies the affected
scope, shows the measurements behind the finding, names concrete contributors
when available, and states what the evidence cannot prove.

The report must distinguish a measured cause from a possible explanation. It
must not describe the first detected signal, the largest serialized item, or a
generic efficiency concern as the primary cause of session consumption.

## Tool Use

The engineer requests deterministic diagnosis inside the current chat:

```text
Codex:       $context-review --stats
Claude Code: /context-review --stats
Pi:          /context-review --stats
```

The engineer adds task-aware interpretation and actions when needed:

```text
Codex:       $context-review --stats --advise
Claude Code: /context-review --stats --advise
Pi:          /context-review --stats --advise
```

`--stats` determines measurable causes locally. `--advise` receives the frozen
stats object and the current active model context, then explains relevance and
proposes actions. Advice cannot change the measured cause or its evidence.

## User Guide

Use `--stats` to establish what the preserved evidence measures. Add `--advise`
when deciding whether a measured cause was necessary, remains relevant, or can
be reduced safely in future calls.

| Cause and identifier | Availability | What deterministic analysis establishes | What advice can assess | Main limitation |
| --- | --- | --- | --- | --- |
| Context reprocessing — `driver.context_reprocessing` | Codex, Claude Code, and Pi with complete cache evidence | Cached or cache-read tokens and their share of processed input | Whether retained context remains relevant, authoritative, or suitable for compaction | Cache use does not mean the retained context was waste |
| Large fresh-input load — `driver.large_fresh_input` | All harnesses with complete input attribution | Fresh or uncached tokens are at least 20% of processed input | Whether broad retrieval, requirements, logs, or changed scope justified the new material | Provider usage does not identify a request-local contributor |
| Input across calls — `driver.history_replay` | All harnesses with complete latest and cumulative processed input | Input was processed across at least two observable model calls | Whether another call was necessary and whether continuing or compacting is appropriate | It cannot isolate replayed history from new input |
| Output-dominant consumption — `driver.output_dominance` | Codex and Pi with a valid reasoning subset; unavailable for Claude Code | Visible output is at least 20% of processed input plus visible output | Whether future responses can be shorter without losing explanation or verification | Output size alone does not establish reducible verbosity |
| Repeated explicit failures — `driver.repeated_failure_loop` | Claude Code and Pi with at least two linked failure IDs; unavailable for Codex | Distinct operations have explicit persisted failure status | Whether failures came from code, reasoning, tools, permissions, or infrastructure and what to correct before another attempt | It does not infer retries or a shared root cause |
| Large active contributor — `driver.large_active_contributor` | All harnesses within the available active or observed request scope | One safe-identified item occupies at least 20% of the measured scope | Whether the item must remain verbatim, can be summarized, or can be retained outside the conversation | Serialized bytes are not tokens and size does not establish unnecessary content |
| Exact repeated active content — `driver.exact_repeat` | All harnesses when byte-identical active tool calls or results are preserved | Exact repetition count and excess serialized volume | Whether an earlier result remains fresh and authoritative enough to reuse | Exact repetition does not establish that reuse was safe |
| Material standing context — `driver.standing_context` | Fresh or near-fresh sessions where instructions or tool definitions are measurable | Standing context occupies at least 10% of the measured scope | Whether instructions and tools are relevant to the task or should remain broadly loaded | One session cannot establish that a capability is unused |

The report displays at most three drivers. It builds all candidates first,
preserves the deterministic primary cause, and then favors coverage across
activity, cumulative input, input-plus-output, and active-occupancy targets. An
implemented cause may therefore be absent from one report when three more
representative drivers were selected.

Deterministic output explains mechanism and magnitude, not whether consumption
was justified. Advisor recommendations are model-generated, must cite supplied
metric, driver, or contributor identifiers, and are omitted when active context
does not establish relevance, freshness, necessity, or task continuity. Advice
never changes measurements or performs compaction, model switching, or
configuration changes.

## Diagnostic Targets

A cause is meaningful only in relation to an explicit target. Keep these
targets separate:

- **Cumulative input consumption:** input processed across observable model
  calls, including provider-specific cache categories when reported.
- **Cumulative output consumption:** visible and reasoning output across
  observable model calls when reported.
- **Active-context occupancy:** material expected to be available to the next
  request.
- **Provider cost:** provider-reported cost or a separately defined calculation;
  token counts are not cost.
- **Activity:** call, retry, failure, compaction, and branch counts that may
  explain multiplication of input or output.

The default question is why cumulative session input consumption is high. If
that target is unavailable, the report may diagnose active-context occupancy,
but it must not present occupancy as an explanation of historical consumption.
Bytes and tokens must never be compared or combined to select a cause.

## Usage-Record Integrity

Usage must be normalized by model request before cumulative values or causes
are calculated.

For Claude Code records, deduplicate repeated usage blocks by `requestId` when
that field is preserved. A usage block repeated for multiple content blocks in
one response counts once. When duplicate records for one request contain
conflicting usage values, select no value silently: apply a documented
resolution rule or mark the affected aggregate unavailable and report the
conflict.

For harnesses without a preserved request identifier, use the narrowest stable
request or response identity exposed by that harness. Report the identity rule
and any remaining risk of duplicate counting. Show:

- raw usage-record count
- distinct observable model-request count
- duplicate usage-record count
- identity field or fallback rule

Data duplication is a measurement-quality condition, not a token-consumption
cause. It is reported separately and must not become a recommendation to change
the engineer's workflow.

## Processed Input Attribution

Use provider-specific formulas rather than forcing cache fields into one
universal interpretation:

- **Codex:** `input_tokens` is processed input;
  `cached_input_tokens` is its reprocessed-input subset.
- **Claude Code and Pi:** processed input is input plus separately reported
  cache-read and cache-write tokens; reprocessed input is cache-read tokens.

Claude Code and Pi attribution is available only when input, cache-read, and
cache-write values are complete for every deduplicated usage record in the
measurement scope. Missing components make processed and reprocessed input
unavailable rather than zero. Latest and cumulative attribution apply the same
rule independently.

Fresh input is `input_tokens - cached_input_tokens` for Codex and the complete
provider input field for Claude Code and Pi. `driver.large_fresh_input` is
emitted when fresh input is at least 20% of processed input.

Visible-output share uses complete processed input plus visible output as its
denominator. For Codex and Pi, visible output is provider output minus a
complete, valid separately reported reasoning-output subset. Every contributing
usage record must independently satisfy `0 <= reasoning output <= output` before
aggregation. Visible output is unavailable when the subset is missing or
inconsistent. It is initially
unavailable for Claude Code because preserved usage does not separate reasoning
output. `driver.output_dominance` is emitted when visible output is at least 20%
of the combined target.

Repeated failure detection is limited to distinct operations with explicit
Claude Code `tool_result.is_error` or Pi `toolResult.isError` status and a
non-empty `tool_use_id` or `toolCallId`. Failure records without that verified
operation identity are excluded and reported as unidentified. Two or more
identified failed operations emit `driver.repeated_failure_loop`; this does not
infer that they were retries or shared a root cause. The cause is unavailable
for Codex until a verified linked failure-status source is supported.

## Cause Taxonomy

The deterministic analyzer uses the following cause categories. A category is
emitted only when its required evidence is present.

| Cause | Required evidence | Result the tool may claim |
| --- | --- | --- |
| Context reprocessing | Deduplicated provider cache-read or equivalent provider-defined input fields across requests | The measured number and share of cumulative input attributable to provider-reported context or cache reads |
| Call-context multiplication | At least two distinct requests, cumulative input, and latest or per-request input | Input was processed across multiple calls; without provider breakdown, the tool cannot isolate old history from fresh input |
| Large active contributor | Contributor size and share in one active-context scope and unit | The named item materially occupies the context that may be sent again |
| Exact repeated active content | Byte-identical normalized items in the same active scope | The count and serialized volume of exact repetition; necessity and freshness remain unknown |
| Material standing context | Instructions, memory, tool definitions, skills, plugins, or connector definitions measured in a fresh or near-fresh session | The measured baseline occupancy before substantial task work |
| Large fresh-input load | Provider-reported fresh or uncached input, or a request-local contributor measured in the same request scope | New material, rather than proven replay, materially increased the request |
| Cache-write or cache-invalidation load | Provider-reported cache writes or creation tokens across distinct requests | Repeated cache creation materially contributed to provider-reported input processing |
| Output-dominant consumption | Provider-reported visible output measured across distinct requests | Model output is a material share of the selected cumulative token target |
| Reasoning-output load | A separately reported reasoning-output field | Reasoning output is a material share of the selected cumulative token target |
| Repeated failure or retry loop | Preserved failure status or class linked to distinct calls or operations | The measured repeated failure class and associated calls or result volume |
| Compaction and rapid regrowth | Preserved compaction boundaries plus comparable before-and-after occupancy or request usage | Context was compacted and then returned to a material size within the observed call window |
| Abandoned branch or delegated-work consumption | Preserved branch or subagent identity and usage attributable to distinct calls | Historical consumption occurred outside the active branch; it is not active-context occupancy |

Large tool results, source reads, attachments, retrievals, test logs, assistant
answers, instructions, and tool definitions are contributor types within these
causes. They are not separate causes unless the evidence shows the mechanism by
which they affected the selected target.

The initial implementation supports these deterministic categories:

- `driver.context_reprocessing`, using complete provider-reported cached or
  cache-read input and the processed-input formulas above
- `driver.large_fresh_input`, using complete provider fresh or uncached input
- `driver.history_replay`, described conservatively as input processed across
  multiple calls unless replay is isolated by provider evidence
- `driver.output_dominance`, using complete processed-input and visible-output
  measurements
- `driver.repeated_failure_loop`, using distinct explicit Claude Code or Pi
  tool-result failures
- `driver.large_active_contributor`
- `driver.exact_repeat`
- `driver.standing_context`

The remaining categories may be added when a supported harness preserves the
required evidence. Unsupported categories are absent or explicitly unavailable;
they are not inferred from generic patterns.

## Primary Cause Selection

The text report may show `Primary measurable cause` only when all of the
following are true:

1. The diagnostic target, scope, and unit are explicit.
2. The cause has direct measurements in that target's scope and unit.
3. Its attributable amount or share can be compared with other supported causes
   for the same target.
4. Usage records have passed the request-deduplication rules.
5. No known evidence conflict invalidates the comparison.

Rank comparable causes by:

1. attributable amount or share of the selected target
2. evidence reliability
3. repeated effect across distinct model requests
4. deterministic cause identifier as a tie-breaker

Do not rank a byte-sized contributor against token usage, active occupancy
against cumulative consumption, or call count against token volume. When no
cause satisfies the rules, show:

```text
Primary measurable cause: unavailable
Reason: preserved usage shows cumulative input, but does not attribute that
input to replay, fresh material, cache activity, or another comparable cause.
```

The analyzer builds every supported candidate before selecting at most three
for display. It keeps `primaryMeasuredCauseId` first, then prefers one driver
from each unrepresented target in this order: activity, cumulative input,
cumulative input plus visible output, and active-context occupancy. Remaining
slots are filled within those targets by attributable share, amount, evidence
reliability, occurrence count, and identifier. This policy preserves target
breadth; it is not a ranking across targets. The text report labels drivers from
different targets, scopes, or units as unranked.

## Evidence Contract

Every measured driver contains:

- stable driver identifier and cause kind
- diagnostic target
- scope, unit, and evidence class
- metric identifiers and source fields or calculation rules
- contributor identifiers when concrete items are known
- observations used to support the finding
- attributable amount and share when calculable
- distinct request count or occurrence count when relevant
- concise finding
- limitation stating what remains unknown

The JSON report retains `measuredDrivers` and adds an optional
`primaryMeasuredCauseId`. The identifier must reference one of the displayed
drivers. It is `null` when the selection rules are not satisfied.

Example:

```json
{
  "primaryMeasuredCauseId": "driver.context_reprocessing",
  "measuredDrivers": [
    {
      "id": "driver.context_reprocessing",
      "kind": "context_reprocessing",
      "name": "Context reprocessing",
      "target": "cumulative_input_consumption",
      "scope": "cumulative_inspected_session",
      "unit": "tokens",
      "evidence": "provider_reported",
      "metricIds": ["usage.cumulative.reprocessed_input", "usage.cumulative.processed_input", "session.model_calls"],
      "contributorIds": [],
      "observations": [
        { "name": "reprocessed_input", "value": 884000, "unit": "tokens", "source": "usage.cumulative.reprocessed_input" },
        { "name": "processed_input", "value": 1240000, "unit": "tokens", "source": "usage.cumulative.processed_input" },
        { "name": "distinct_requests", "value": 18, "unit": "calls", "source": "metrics.session.model_calls" }
      ],
      "impact": { "value": 884000, "unit": "tokens", "share": 71.3 },
      "occurrenceCount": 18,
      "description": "884,000 provider-reported cached or cache-read tokens account for 71.3% of 1,240,000 processed input tokens across 18 observable model calls.",
      "limitation": "Cache reads show reprocessing, but do not establish that the retained context was unnecessary."
    }
  ]
}
```

Corresponding compact text:

```text
Primary measurable cause

Context reprocessing — driver.context_reprocessing
Evidence: 884,000 provider-reported cached or cache-read tokens, 71.3% of
1,240,000 processed input tokens across 18 distinct requests.
Limitation: this establishes reprocessing, not that the context was unnecessary.

Largest active-context contributor

tool_results / test — contributor.tool_results.test.1
Evidence: 81,204 serialized bytes, 32% of the reconstructed active context.
Limitation: serialized size is not token or cost precision, and necessity was
not assessed.
```

## Advisor Interpretation

The advisor may use active task context to explain why a measured cause occurred
and whether it is actionable. Examples include noisy successful-test output,
changed requirements, broad retrieval, repeated corrections, stale reads,
model mismatch, or excessive reasoning effort.

These are semantic interpretations unless deterministic evidence directly
supports them. Every recommended action must cite supplied metric, driver, or
contributor identifiers. The advisor must not:

- invent a cause absent from the stats
- convert correlation into a measured cause
- call necessary context waste without task evidence
- estimate token savings from serialized bytes as though they were tokens
- override `primaryMeasuredCauseId`

If measurements support a cause but active context does not establish why it
occurred or whether it can safely be reduced, the advisor reports that
limitation and omits the action.

## Acceptance Criteria

1. A Claude fixture containing repeated usage blocks for one `requestId` counts
   one model request and one usage sample.
2. Conflicting usage blocks for one request produce a visible limitation and do
   not silently inflate cumulative usage.
3. The same deduplicated stats object is used by text, JSON, and advisor paths.
4. `primaryMeasuredCauseId` is either `null` or references a displayed driver
   supported in the selected target, scope, and unit.
5. No test ranks bytes against tokens or active occupancy against cumulative
   consumption.
6. Existing driver fixtures verify their source metrics, concrete contributors,
   and limitations.
7. Fixtures cover supported provider cache, fresh-input, output, reasoning,
   retry, compaction, and branch causes as those fields become available.
8. When attribution is insufficient, the report says the primary cause is
   unavailable while preserving useful measured drivers.
9. Advisor actions cite valid evidence identifiers and cannot alter deterministic
   findings.
10. Codex, Claude Code, Pi, standalone text, and JSON use the same cause and
    evidence contract for equivalent inputs.

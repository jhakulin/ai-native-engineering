# Context Efficiency Phase 1: Trustworthy Measurement

## Outcome

Give an engineer a trustworthy, compact answer to:

1. How large is the current context?
2. How many tokens has the observable session consumed?
3. Which broad categories and individual items account for most of the measured context?
4. Which measurements are unavailable or only approximate?

The phase produces evidence. It does not judge whether context was necessary or recommend an action.

## Scope

### Included

- One current or explicitly selected Codex, Claude Code, or Pi session.
- Current active-context size when reconstructable.
- Latest-request usage when preserved.
- Cumulative observable session usage when preserved.
- Model-call and compaction counts.
- Mutually exclusive context composition.
- The ten largest measured contributors.
- Compact text and JSON output.
- Local, deterministic, read-only processing.

### Not included

- Optimization recommendations.
- Relevance or necessity judgments.
- Task-boundary detection.
- Compaction, clear, rewind, or branch advice.
- Generated compaction instructions.
- Before-and-after comparisons.
- Billing reconciliation or cost calculation.
- Team aggregation or benchmarks.

## Required Metric Definitions

The implementation must keep these concepts separate:

- **Active-context occupancy:** material that the harness is expected to make available to the next request.
- **Latest-request usage:** provider or harness usage associated with the latest observable model request.
- **Cumulative session consumption:** the sum of usage across all observable calls, including compaction calls and abandoned branches when those calls are preserved.
- **Serialized size:** exact bytes of a clearly identified local representation. It is a fallback attribution measure, not a token or billing estimate.
- **Context capacity:** the active model's supported context window when the harness exposes a reliable value.

Provider-specific fields must be preserved rather than forced into a misleading universal total. Cache reads, cache writes, cached input, fresh input, and output must remain distinguishable when the provider reports them separately.

Every metric must carry:

- value
- unit
- scope
- evidence class
- source field or calculation rule

## Harness Evidence Matrix

Before implementation, record for each supported harness and tested version:

- session discovery and current-session identification
- active-branch or active-history reconstruction rules
- compaction records and reconstruction rules
- latest usage fields
- cumulative usage fields
- context capacity source
- provider-payload visibility
- unavailable measurements

This matrix is an implementation prerequisite, not a new user-facing feature.

## Functional Requirements

### P1-1: Select and identify the session

The command must show the harness, session identifier or path, working directory, model when preserved, selected branch or history scope, and whether the current session or a fallback session was selected.

### P1-2: Show a context-size headline

Prefer:

```text
Active context: 84,210 / 200,000 tokens (42.1%)
```

When reliable tokens are unavailable, show:

```text
Active context: 612,304 bytes serialized
Token count: unavailable
Capacity: unavailable
```

The headline must say whether it represents reconstructed active context, an observed provider payload, or another narrower scope. Latest-request input must not be relabeled as active-context occupancy without evidence that they are equivalent.

### P1-3: Show usage and activity

When preserved, show latest-request and cumulative values separately for:

- fresh or uncached input
- cached input or cache reads
- cache writes when separately reported
- output
- provider-defined totals
- model calls
- compactions

Missing values must be explicit.

### P1-4: Use mutually exclusive composition

Classify each measured content block exactly once so category shares do not double-count tool calls or results embedded in messages.

Initial categories are:

- instructions and memory
- tool definitions
- user content
- assistant content
- reasoning metadata without exposing reasoning text
- tool calls
- tool results
- compaction summaries
- other or unsupported

For each category, show count, size, share of the measured scope, and evidence class.

### P1-5: Show largest contributors

Show at most ten items, ordered by the best available common measure within one scope. Display category, type, safe identifier, size, share, and evidence class. Do not label a large contributor as waste.

Do not rank token-measured and byte-measured items together as though the units were equivalent.

### P1-6: Keep the output compact

The default report must contain no raw transcript or complete provider payload. It should fit within 100 lines and 8 KB for the representative Pi session.

JSON must include a schema version and explicit metric units, scopes, and evidence classes, even if the schema remains experimental.

All harness integrations must use the same canonical analysis and formatting logic. Given the same session records and observed provider payload, interactive and standalone surfaces must produce equivalent measurements. When a surface lacks in-memory evidence available to another surface, the report must identify the narrower scope rather than silently producing apparently comparable totals.

## Command Surfaces

Use the harness-specific interactive syntax:

| Harness | Interactive command | Execution behavior |
| --- | --- | --- |
| Codex | `$context-review --stats` | Codex loads the skill and starts the deterministic local parser in a model-mediated turn; the model does not calculate the statistics. |
| Claude Code | `/context-review --stats` | Claude loads the skill and starts the deterministic local parser in a model-mediated turn; the model does not calculate the statistics. |
| Pi | `/context-review --stats` | The native extension starts the deterministic local parser without a model turn. |

The parser tool result is the canonical deterministic report on model-mediated
surfaces. Claude Code may add assistant commentary after showing that result;
the commentary is non-authoritative and must not replace or modify the parser
output. Expand the Bash tool result to inspect the complete report.

For automation, testing, troubleshooting, or a genuinely model-free invocation outside chat, use:

```bash
node <context-review-skill>/scripts/context-review.mjs --stats --agent <harness> --cwd "$PWD"
```

Standalone semantic advice is deferred. In the initial implementation, passing `--advise` to the standalone command makes no model call and points to `$context-review --stats --advise` in Codex or `/context-review --stats --advise` in Claude Code and Pi. No questionnaire, form, task-context flags, stdin envelope, or manually prepared task JSON is provided.

## Examples Of Tool Use

### Inspect the current session

```text
Codex:      $context-review --stats
Claude Code: /context-review --stats
Pi:          /context-review --stats
```

Representative output:

```text
Context efficiency

Session
- Harness: claude
- Model: claude-sonnet
- Scope: latest observed provider payload and persisted session usage

Active context
- 92,400 / 200,000 tokens (46.2%) [provider reported]

Latest request
- Fresh input: 6,200 tokens
- Cache read: 86,200 tokens
- Output: 1,840 tokens

Session consumption
- 17 observable model calls
- Input: 1,260,400 tokens
- Output: 28,700 tokens
- Compactions: 1

Composition of latest observed payload
- Instructions and memory: 96,420 bytes (18%)
- Tool definitions: 121,330 bytes (23%)
- User content: 42,100 bytes (8%)
- Assistant content: 78,240 bytes (15%)
- Tool calls: 19,880 bytes (4%)
- Tool results: 169,440 bytes (32%)

Largest contributors
1. tool result: test — 81,204 bytes (15%)
2. tool definitions — 74,110 bytes (14%)
3. assistant message — 51,320 bytes (10%)

Limitations
- Category sizes are exact serialized bytes, not per-item token counts.
```

This lets the engineer see context occupancy, cumulative activity, and the largest contributors without receiving an optimization judgment.

### Inspect a current session without reliable token fields

```text
Codex:      $context-review --stats
Claude Code: /context-review --stats
Pi:          /context-review --stats
```

Representative output when the harness exposes persisted context but not reliable token usage or capacity:

```text
Active context: 612,304 bytes serialized [reconstructed]
Token count: unavailable
Capacity: unavailable
```

The report remains useful for relative attribution without inventing token precision.

### Produce machine-readable measurements

```text
Codex:      $context-review --stats --json
Claude Code: /context-review --stats --json
Pi:          /context-review --stats --json
```

Representative metric:

```json
{
  "schemaVersion": 1,
  "metrics": [
    {
      "name": "active_context",
      "value": 92400,
      "unit": "tokens",
      "scope": "latest_observed_provider_payload",
      "evidence": "provider_reported"
    }
  ]
}
```

## Privacy

By default:

- use repository-relative paths when possible
- redact the user's home-directory prefix
- omit command arguments and environment values
- remove URL query strings and fragments
- omit prompts, responses, source content, reasoning content, and provider payloads

More detail may be exposed only through an explicit local option.

## Acceptance Criteria

1. The stats command runs without a model call on every harness surface that claims direct local support; model-mediated surfaces are clearly labelled otherwise.
2. Golden fixtures cover supported session versions for Codex, Claude Code, and Pi.
3. Active-context and cumulative-consumption scopes are not conflated.
4. Abandoned Pi branches are excluded from active context but included in cumulative consumption when their usage is preserved.
5. Composition categories are mutually exclusive and their shares sum to approximately 100% of the stated scope.
6. Provider usage matches the preserved source fields exactly.
7. Missing token or capacity data falls back to labelled serialized bytes.
8. Largest contributors contain no raw content or secret-bearing arguments.
9. Existing context-review behavior and repository validation continue to pass.

## Decision After This Phase

Proceed to diagnosis and action guidance only if engineers can identify the dominant measured contributors quickly and trust how every number was derived.

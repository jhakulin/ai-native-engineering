# Context Efficiency Implementation Handoff

## Objective

Extend `context-review` so engineers can first measure coding-agent context and token consumption reliably, then request evidence-grounded guidance for reducing the largest sources of consumption without weakening task quality.

The solution supports Codex, Claude Code, and Pi through one canonical analysis and report model.

## Delivery Phases

### Phase 1: Trustworthy measurement

Implement [`context-efficiency-phase-1-measurement.md`](context-efficiency-phase-1-measurement.md).

The engineer uses the harness-specific interactive command:

```text
Codex:      $context-review --stats
Claude Code: /context-review --stats
Pi:          /context-review --stats
```

Codex and Claude Code use a model-mediated skill turn to start the deterministic local parser; the model does not calculate the statistics. The parser tool result is canonical. Claude Code may add non-authoritative commentary after displaying it, which is an accepted Phase 1 presentation limitation. Pi's native command runs without a model turn. The standalone Node parser remains available for deterministic statistics, automation, testing, and troubleshooting.

The report shows:

- active-context size and capacity when available
- latest-request and cumulative session usage
- model-call and compaction counts
- mutually exclusive context composition
- largest measured contributors
- evidence scope and unavailable measurements

Phase 1 measurement is deterministic, local, and read-only. The parser and Pi native command make no model call. Codex and Claude Code use a model-mediated skill turn only to start the parser; all measurements are still calculated locally without an advisor call.

### Phase 2: Diagnosis and action guidance

Implement [`context-efficiency-phase-2-guidance.md`](context-efficiency-phase-2-guidance.md).

The harness-specific `--stats` command adds deterministic measured drivers. The engineer may request tailored analysis with:

```text
Codex:      $context-review --stats --advise
Claude Code: /context-review --stats --advise
Pi:          /context-review --stats --advise
```

The interactive advisory path uses the active harness model or a supported harness API without requiring separate credentials, custom executables, or engineer-authored integration code. It gives the advisor the complete structured deterministic stats report and the current active model context using the configurable [`advisor.md`](../skills/context-review/prompts/advisor.md) prompt. It may produce:

- up to three evidence-grounded actions
- current model and reasoning-effort fit analysis
- continue, compact, start-fresh, or no-recommendation guidance
- a preservation manifest and valid compact command
- persistent compaction-prompt or automatic-trigger configuration advice when supported by sufficient evidence

Measurements remain deterministic. Advisor output is validated before display. Advisor model, token consumption, elapsed time, cost when reliably available, and limitations are reported separately from the inspected session. The tool never performs a context or configuration change automatically.

Standalone semantic advice is deferred. In the initial implementation, standalone `--advise` makes no model call and directs the engineer to `$context-review --stats --advise` in Codex or `/context-review --stats --advise` in Claude Code and Pi. It does not provide questionnaires, forms, task-context flags, stdin envelopes, or manually prepared task JSON.

## Authoritative Sources

Use these sources in this order:

1. [`AGENTS.md`](../AGENTS.md) — repository rules and validation.
2. [`context-efficiency-phase-1-measurement.md`](context-efficiency-phase-1-measurement.md) — Phase 1 requirements and acceptance criteria.
3. [`context-efficiency-phase-2-guidance.md`](context-efficiency-phase-2-guidance.md) — Phase 2 requirements and acceptance criteria.
4. [`context-efficiency-cause-diagnosis.md`](context-efficiency-cause-diagnosis.md) — measurable cause definitions, usage deduplication, ranking, and evidence contract.
5. [`advisor.md`](../skills/context-review/prompts/advisor.md) — initial LLM advisor behavior and output schema.
6. [`context-review/SKILL.md`](../skills/context-review/SKILL.md) — current cross-harness skill behavior and evidence boundaries.
7. [`pi-extensions/context-review/SPEC.md`](../pi-extensions/context-review/SPEC.md) — Pi integration behavior.
8. [`agent-token-efficiency-guideline.md`](../guidelines/agent-token-efficiency-guideline.md) — optimization priorities and quality guardrails.
9. [`agent-context-systems.md`](../strategies/agent-context-systems.md) — context categories, provenance, trust, and compaction principles.

Do not use [`context-efficiency-analysis-requirements.md`](context-efficiency-analysis-requirements.md) as the implementation contract. It preserves the earlier combined design and may conflict with the two-phase requirements.

Use [`context-review.md`](../context-review.md) only as local evaluation input. Do not load the complete report into a model context.

## Current Implementation

- Canonical parser: [`skills/context-review/scripts/context-review.mjs`](../skills/context-review/scripts/context-review.mjs)
- Parser tests: [`skills/context-review/tests/context-review.test.mjs`](../skills/context-review/tests/context-review.test.mjs)
- Codex, Claude Code, and Pi fixtures: [`skills/context-review/tests/fixtures`](../skills/context-review/tests/fixtures)
- Pi extension: [`pi-extensions/context-review/index.ts`](../pi-extensions/context-review/index.ts)
- Pi packaged parser: [`pi-extensions/context-review/context-review.mjs`](../pi-extensions/context-review/context-review.mjs)

Preserve the current harness-specific context-review invocation, `--full`, JSON, and output-file behavior unless a phased requirement explicitly changes it. Codex uses `$context-review ...`; Claude Code and Pi use `/context-review ...`.

## Architecture Boundaries

The implementation plan must preserve these boundaries:

- Use one canonical analysis and formatting implementation across harnesses.
- Produce the same report structure for the same evidence; show narrower evidence scope explicitly when a harness exposes less data.
- Keep active-context occupancy, latest-request usage, and cumulative historical consumption separate.
- Count each content block once in composition.
- Keep provider-specific cache and token fields distinct when their meanings differ.
- Use serialized bytes when exact tokens are unavailable; never present bytes as token or billing precision.
- Exclude abandoned branches from active context but include their preserved usage in historical consumption.
- Keep deterministic `--stats` analysis local and model-free at the parser boundary. Codex and Claude Code may use a model-mediated skill turn only to start the parser; Pi's native command does not use a model turn.
- Give interactive `--advise` the complete structured deterministic stats report and the current active model context; do not add abandoned branches, compacted-away raw history, or other persisted content outside that context. Treat invocation as explicit consent for model-assisted task conclusions, apply deterministic display-privacy checks, and disclose that advice has a narrower privacy guarantee than stats.
- Use the active harness model or a supported harness API without separate credentials, custom executables, or engineer-authored integration code.
- Respect harness cancellation and practical runtime limits, and report advisor overhead separately.
- Defer standalone semantic advice; standalone `--advise` makes no model call and refers to the harness-specific interactive command.
- Require every advisor action to cite deterministic metric or driver identifiers.
- Validate advisor JSON, evidence references, action limits, harness commands, and read-only behavior before display.
- Make the advisor prompt inspectable, versioned, and overridable without editing parser code.
- Never compact, clear, create a session, change a model, or modify configuration automatically.

## Planning Prerequisite: Harness Capability Matrix

Before finalizing the implementation plan, establish the following for each supported harness and tested version:

| Capability | Codex | Claude Code | Pi |
| --- | --- | --- | --- |
| Current-session identification | | | |
| Active-history reconstruction | | | |
| Branch reconstruction | | | |
| Compaction reconstruction | | | |
| Latest token-usage fields | | | |
| Cumulative usage fields | | | |
| Cache read/write fields | | | |
| Context-window capacity | | | |
| Current model and effort | | | |
| Available model and effort choices | | | |
| Provider-payload observation | | | |
| Compact command and instructions | | | |
| Persistent compaction settings | | | |
| Direct local command without a model call | | | |

For each populated cell, record the source record, API, hook, configuration field, or explicit limitation. Verify current harness controls against the official documentation linked from the phase requirements.

## Required Implementation Plan

Produce a plan that includes:

1. **Requirement mapping:** map every Phase 1 and Phase 2 acceptance criterion to implementation tasks and tests.
2. **Data model:** define canonical metric, scope, evidence, composition-item, driver, advisor-input, and advisor-output structures.
3. **Harness adapters:** identify parsing and integration changes for Codex, Claude Code, and Pi.
4. **Command behavior:** define argument handling and output for `--stats`, `--stats --json`, `--stats --advise`, prompt overrides, and existing options.
5. **Measurement implementation:** define active-context reconstruction, usage aggregation, mutually exclusive composition, and contributor ranking.
6. **Diagnostic implementation:** define deterministic driver rules, required evidence, thresholds, and silence conditions.
7. **Advisor implementation:** define current-active-context access, prompt resolution, harness-native advisor execution, separate overhead measurement, JSON validation, and rendering.
8. **Model-fit implementation:** define current capability discovery, task-fit evidence, supported recommendations, commands, and stale-data prevention.
9. **Compaction implementation:** define immediate commands, preservation manifests, persistent-setting advice, evidence gates, and rollback output.
10. **Privacy:** keep deterministic output redacted and ensure advisor integration adds no persisted content outside the current active model context.
11. **Tests:** define golden fixtures, provider-field cases, double-counting checks, missing-evidence behavior, adversarial advisor output, and cross-surface equivalence.
12. **Delivery sequence:** split work into independently verifiable increments with Phase 1 complete before Phase 2 changes user-visible behavior.
13. **Risks and decisions:** identify unresolved harness limitations or product choices that block trustworthy implementation.
14. **Validation:** include parser tests, Pi integration checks, advisor schema validation, repository validation, and `git diff --check`.

The plan must name the files expected to change and the verification evidence required for each increment. Do not implement while producing the plan.

## Plan Quality Bar

The plan is ready when:

- every required metric has a defined source or explicit unavailable state for each harness
- token and cache semantics are not normalized incorrectly
- active and historical scopes cannot be confused
- composition cannot double-count embedded tool calls or results
- the no-model-call path is technically credible for each claimed surface
- LLM-generated recommendations are distinguishable from deterministic findings
- advisor prompt overrides cannot bypass validation or privacy boundaries
- model-fit advice relies only on choices exposed by the running harness rather than hardcoded model memory
- compaction and persistent-setting advice has evidence gates and rollback
- every acceptance criterion has a test or manual verification method

## Copy-Paste Planning Request

```text
Create an implementation plan for the context-efficiency extension in this repository.

Start by reading:
- AGENTS.md
- docs/context-efficiency-implementation-handoff.md
- docs/context-efficiency-phase-1-measurement.md
- docs/context-efficiency-phase-2-guidance.md
- skills/context-review/prompts/advisor.md
- skills/context-review/SKILL.md
- pi-extensions/context-review/SPEC.md
- guidelines/agent-token-efficiency-guideline.md
- strategies/agent-context-systems.md

Then inspect the current parser, tests, fixtures, and Pi extension referenced by the handoff.

Produce the harness capability matrix first. After that, produce a phased implementation plan that maps every acceptance criterion to concrete file changes and verification. Resolve what can be established from local session formats and current official harness documentation. Clearly identify unavailable evidence and genuine blockers.

Use `$context-review ...` for Codex examples and `/context-review ...` for Claude Code and Pi examples. Keep Phase 1 deterministic, local, read-only, and model-free at the parser boundary. Keep Phase 2 advisor input minimized, use the active harness model or a supported harness API without requiring separate credentials, custom executables, or engineer-authored integration code, bound and report advisor overhead, and require all LLM-generated actions to cite deterministic evidence. Defer standalone semantic advice: standalone `--advise` makes no model call and points to the correct interactive command. Do not use the older combined requirements document as the implementation contract. Do not implement any changes in this task.
```

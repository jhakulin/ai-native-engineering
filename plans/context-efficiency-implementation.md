# Context Efficiency Implementation Plan

## Motivation

Engineers need a practical way to understand why coding-agent token consumption
is high and what they can do about it.

The tool should run naturally inside the engineer's current Codex, Claude Code,
or Pi chat. It should analyze the context and preserved session data already
available, show concrete measurements, and use an LLM advisor to turn those
measurements into useful, task-aware actions.

The guidance should help engineers decide whether to continue, compact, or
start fresh; identify what compaction must preserve; assess whether the current
model and reasoning effort fit the work; and recommend persistent compaction
configuration only when supported by evidence.

The advisor prompt should remain easy to inspect and customize. Ordinary use
should not require manually prepared JSON, external advisor programs,
questionnaires, or unnecessary standalone workflows.

Implementation starts with trustworthy measurement and then adds useful
guidance. The solution should remain focused on engineer value and avoid
machinery that does not directly improve the result.

## Status

Phase 1 is complete as of 2026-08-16. Local source-field inspection, synthetic
and golden measurement evidence, release validation, and Codex, Claude, and Pi
interactive checks pass. For Claude, the expandable Bash tool result is the
canonical deterministic report; Claude may add a non-authoritative summary
afterward. This disclosed model-mediated presentation limitation is accepted for
Phase 1. Phase 2 architecture is now agreed: the advisor receives the complete
deterministic stats object and the current active model context. Implementation
continues with deterministic drivers, advisor integration, validation, and
failure isolation.

Implementation sources:

- `docs/context-efficiency-phase-1-measurement.md`
- `docs/context-efficiency-phase-2-guidance.md`
- `docs/context-efficiency-implementation-handoff.md`
- `skills/context-review/prompts/advisor.md`
- `skills/context-review/SKILL.md`
- `pi-extensions/context-review/SPEC.md`

## Agreed architecture

### Measurement command surfaces

Harness-native invocation remains the normal interactive engineer experience:

| Harness | Interactive invocation | Execution behavior |
| --- | --- | --- |
| Codex | `$context-review --stats` | Codex invokes the skill and runs the deterministic local parser. The skill turn is model-mediated, but measurements are calculated locally without an advisor call. |
| Claude Code | `/context-review --stats` | Claude invokes the skill and runs the deterministic local parser. The skill turn is model-mediated, but measurements are calculated locally without an advisor call. |
| Pi | `/context-review --stats` | The native extension runs the deterministic local parser without a model turn. |

For Codex and Claude, “model-mediated” describes only how the harness loads the skill and starts the parser. The model does not calculate, reinterpret, or replace the deterministic statistics.

Keep the standalone command for automation, testing, and genuinely model-free invocation outside chat:

```bash
node <context-review-skill>/scripts/context-review.mjs --stats --agent <harness> --cwd "$PWD"
```

The standalone command is not the primary interactive workflow. `--stats` remains deterministic, local, read-only, and model-free at the parser boundary. Advisor behavior in interactive harnesses is additive and separately disclosed; advisor failure must never alter Phase 1 measurements.

### Shared canonical implementation

Keep one canonical measurement model, driver implementation, advisor prompt,
output validator, and renderer across Codex, Claude Code, and Pi. Add only the
modules needed to keep deterministic analysis separate from model-generated
advice. Do not introduce extraction pipelines, task-envelope machinery, or a
model-capability catalog before demonstrated use requires them.

### Self-contained Pi packaging

The installed Pi package must ship the canonical advisor prompt, output schema,
validator dependencies, and parser resources it uses. Synchronization tests
must prevent the packaged resources from drifting from the skill sources.

## Phase 2 required experience

### A working advisor is included

Interactive advice must work with the harness-specific syntax—`$context-review --stats --advise` in Codex and `/context-review --stats --advise` in Claude Code and Pi—using the active harness model or a supported harness API without requiring separate credentials, custom executables, or engineer-authored integration code.

The packaged advisor prompt may be overridden for an invocation or repository. Custom advisor providers, executables, and endpoints are outside the initial implementation.

The built-in path must:

- select a supported model through the running harness or its credential/model registry;
- disclose provider, model, reasoning effort, and context source;
- use the versioned packaged advisor prompt and schemas;
- validate generated output before display;
- honor cancellation and practical runtime limits;
- return deterministic stats plus an advisor limitation on failure.

### Ordinary interactive use

Engineers provide no task JSON, context flags, questionnaires, or forms. The
advisor uses the current active model context already assembled by the harness.
It does not search all persisted session records for additional content.

Standalone execution supports Phase 1 statistics only. Standalone `--advise`
makes no advisor call and points to the appropriate interactive command.

### Advice is meaningful and evidence-based

The advisor receives two inputs:

1. the complete structured deterministic stats report, unchanged; and
2. the current active model context, including the messages, requirements,
   decisions, tool results, failures, and verification state currently available
   to the working agent.

For Codex and Claude, the current agent already has that context. For Pi, use
the active context exposed by Pi's runtime APIs, including compaction semantics;
do not add abandoned branches or compacted-away raw history.

The advisor's target is to reduce expected future token consumption without
reducing the likelihood of completing the engineering task correctly. Every
displayed action must cite supplied metric, driver, or contributor identifiers.
If the active context does not establish relevance, freshness, necessity,
continuity, or preservation needs, the corresponding recommendation is absent.

### Advisor execution and overhead

Use the active harness model or supported harness API without separate
credentials or nested harness executables. Respect harness cancellation and
practical input, output, and elapsed-time limits. Record provider, model, effort,
elapsed time, usage, and cost when the harness exposes them; otherwise mark them
unavailable. Advisor overhead remains separate from inspected-session usage.

## Approved Phase 2 advisor architecture

| Harness | Advisor path | Context supplied |
| --- | --- | --- |
| Codex | Current model-mediated `$context-review --stats --advise` skill turn, followed by deterministic output validation | Complete stats plus the context already available to the current Codex agent |
| Claude Code | Current model-mediated `/context-review --stats --advise` skill turn, followed by deterministic output validation | Complete stats plus the context already available to the current Claude agent |
| Pi | Extension-local completion using `ctx.model` and `ctx.modelRegistry` credentials | Complete stats plus Pi's current active context reconstructed through supported runtime APIs |

The deterministic stats report is frozen before advice begins. Generated advice
is validated before display. Advisor failure adds a limitation but cannot alter
stats, modify the project, compact context, create a session, switch models, or
change configuration.

## 1. Harness capability matrix

Increment 0A completes this matrix with tested versions and exact source fields/APIs. “Unavailable” is an acceptable final state.

| Capability | Codex | Claude Code | Pi |
| --- | --- | --- | --- |
| Current-session identification | `CODEX_HOME/sessions`, session metadata; verify current/fallback rules | `CLAUDE_CONFIG_DIR/projects`, `sessionId`/cwd; verify rules | `ctx.sessionManager.getSessionFile()`, session id/cwd |
| Active-history reconstruction | persisted sequence only until branch semantics verified | parent links exist; active semantics verify | `leafId`/`parentId`, `buildContextEntries`, compaction records |
| Branch reconstruction | verify or unavailable | verify or unavailable | active branch supported; abandoned branches scanned historically |
| Compaction reconstruction | summary available; retention boundary verify | compact/summary fields and boundary verify | compaction record and `firstKeptEntryId` |
| Request payload composition | unavailable unless local record/API exposes it | unavailable unless local record/API exposes it | exact latest request via `before_provider_request` |
| Provider response usage | identify rollout/response usage fields | identify transcript/response usage fields | persisted assistant `message.usage` or response event; request hook is not a usage source |
| Cumulative/compaction usage | sum only preserved per-call fields | same | sum preserved active/abandoned/compaction call usage |
| Cache fields | preserve provider semantics separately | preserve provider semantics separately | preserve response/session fields separately |
| Context capacity | verified model/config source or unavailable | verified model/config source or unavailable | `ctx.model`/registry capability or unavailable |
| Current model/effort | verified persisted/config source | verified persisted/config source | model/thinking-level runtime and records |
| Available choices | running harness/config or fresh catalog | running harness/config or fresh catalog | `ctx.modelRegistry.getAvailable()` plus runtime levels |
| Provider payload observation | unavailable in current repository | unavailable in current repository | exact-observed latest payload, with extension-order limitation |
| Compact syntax | `/compact`, no instruction argument | `/compact [instructions]` | `/compact [instructions]` |
| Persistent controls | verify current Codex config | verify current Claude controls | verify current Pi settings/hooks |
| Interactive stats | `$context-review --stats`; skill starts local parser in a model-mediated turn | `/context-review --stats`; skill starts local parser in a model-mediated turn | `/context-review --stats`; native model-free command |
| Standalone stats | Node parser for automation/testing/model-free invocation | Node parser for automation/testing/model-free invocation | Node parser available in addition to native command |
| Built-in advisor | current model-mediated skill turn | current model-mediated skill turn | extension-local completion with active model registry credentials |

### Increment 0A provisional baseline (open; 2026-08-16)

Local inspection used Codex CLI 0.141.0, Claude Code 2.1.114, and Pi 0.80.6.
Tested harness versions are recorded separately in
`skills/context-review/tests/fixtures/harness-versions.json`; synthetic session
fixtures do not assert a harness-version field unless it belongs to the session
format itself. Sanitized field-name evidence is retained in
`capability-evidence.json`. Fixture content remains synthetic and contains no
copied transcript data.

| Harness | Verified source fields | Initial implementation rule | Limitation |
| --- | --- | --- | --- |
| Codex | `session_meta.payload.session_id`, `cwd`, `cli_version`; `turn_context.payload.model`, `effort`; `event_msg.payload.info.last_token_usage.{input_tokens,cached_input_tokens,cache_write_input_tokens,output_tokens,reasoning_output_tokens,total_tokens}`; sibling `total_token_usage`; `model_context_window`; `compacted.payload.replacement_history` | Use latest per-call usage and the provider cumulative snapshot without summing snapshots. Reconstruct post-compaction content from the latest replacement history plus later response items. | Rollout branch semantics and exact next provider payload are unavailable. |
| Claude Code | `sessionId`, `cwd`, `uuid`, `parentUuid`; `assistant.message.model`; `assistant.message.usage.{input_tokens,cache_creation_input_tokens,cache_read_input_tokens,output_tokens}` | Follow the latest parent chain for active persisted history and sum preserved assistant-call usage for cumulative consumption. | Exact provider payload, context capacity, hidden instructions, and a verified compaction boundary were unavailable in inspected records. |
| Pi | Session format version 3 `session.{id,cwd}`; entry `id`/`parentId`; `compaction.{summary,firstKeptEntryId,tokensBefore}`; assistant `message.{model,usage.input,usage.output,usage.cacheRead,usage.cacheWrite,usage.reasoning,usage.totalTokens}`; `model_change.modelId` | Follow the active parent chain and `firstKeptEntryId` for occupancy; scan every preserved assistant response, including abandoned branches, for cumulative usage. | Exact latest payload exists only when the extension observes `before_provider_request`; the hook is not a response-usage source. Persisted capacity is unavailable. |

Unavailable fields remain explicit rather than inferred. Current-session selection
continues to prefer an exact normalized cwd match and otherwise labels the newest
supported session as a fallback. The synthetic fixtures now record the tested harness/session versions and have
exact default-report goldens. Local Pi 0.80.6 package loading and persisted
`/context-review --stats --json` execution were verified on 2026-08-16. After
upgrading to Codex CLI 0.147.0, model-mediated stats, JSON, and advise routing
passed with the active configured model and selected the Codex harness
explicitly. Claude Code model-mediated stats, JSON, and advise routing subsequently passed
with Claude Sonnet 4.6. The complete parser report appears in the expandable Bash
tool result. Claude may add a generated summary afterward; that summary is
non-authoritative and the disclosed presentation limitation is accepted for
Phase 1.

For every enabled cell, record the source record/API/config key, tested harness version, evidence class, and limitation.

## 2. Canonical schemas

### Measurement model

Every metric includes `id`, `name`, `value`, `unit`, `scope`, `evidence`, `source`, approximation status, and limitation. Keep these scopes distinct:

- active reconstructed context;
- latest observed request payload;
- latest provider response usage;
- cumulative inspected-session usage;
- advisor overhead.

Request payload composition cannot be used as provider response usage. Bytes cannot be presented as tokens or billing precision.

The canonical report includes session selection/model/capacity, metrics, provider-specific latest and cumulative usage, model-call and compaction counts, mutually exclusive composition, at most ten contributors, at most three deterministic drivers, advisor output, advisor overhead, and limitations.

### Advisor input contract

The advisor input is the complete canonical stats object plus the current active
model context supplied by the harness. The stats object remains the source of
all measurement, driver, and contributor identifiers. Active context supplies
task meaning; it is not treated as a measurement source or as authority to
recalculate deterministic values.

### Advisor output schema

Create a complete machine schema and update `advisor.md` to match it:

- maximum three actions and three persistent-compaction entries;
- separate `metricIds`, `driverIds`, and `contributorIds`, with semantic validation against supplied IDs;
- structured expected benefit `{ proxyType, metricId, direction, description }`;
- structured nullable commands `{ harness, kind, name, args, settingScope }` validated against harness allowlists;
- structured reducible scope `{ value, unit, scope, metricId, qualification }`;
- typed preservation entries `{ category, description, evidenceIds }`;
- typed persistent advice with setting, current/proposed value, stability, evidence, expected effect, risk, rollback, and limitations;
- exact enums, bounded strings/arrays, and no additional properties.

Schema validation is followed by deterministic evidence-reference, privacy, supported-command, action-limit, and read-only validation. Codex `/compact` can never have an instruction argument.

## 3. Phase 1 implementation

### Arguments and output

Add `--stats`; retain existing `--agent`, `--cwd`, `--session`, `--json`, `--full`, `--max-chars`, `--output`, and `--force`. `--advise` is available only through the interactive harness paths described above.

Stats text stays under 100 lines and 8 KB for the representative Pi fixture and includes no raw transcript or provider payload. JSON has schema version, units, scopes, evidence classes, source rules, and unavailable values.

Update `SKILL.md` so Codex `$context-review ...` and Claude `/context-review ...` are the primary interactive workflows. The skill must explicitly recognize the invocation tail and forward all supported arguments—including `--stats`, `--advise`, `--json`, `--full`, `--output`, `--force`, `--session`, `--agent`, `--cwd`, and `--max-chars`—without silently dropping or rewriting them. It must distinguish model-mediated skill startup from locally calculated statistics and document the standalone Node command as the automation/testing/model-free alternative.

The implementation must preserve harness-specific command syntax, separate advisor-overhead reporting, and deferred standalone advice.

### Adapters and deterministic analysis

- Normalize Codex metadata, response items, verified usage, compaction, model/effort, and branch signals.
- Normalize Claude session/parent records, tool blocks, verified usage, compact summaries, and model/effort.
- Preserve Pi active-branch reconstruction, scan all records for historical usage, and use `before_provider_request` only for request composition. Use assistant/response records for usage.
- Make missing values explicit.
- Preserve provider cache/fresh/output/total semantics independently.
- Exclude abandoned Pi branches from active context but include preserved usage historically.
- Classify each block once; rank contributors only within a common scope/unit.
- Redact paths, command arguments, environment values, URL query/fragment data, secrets, raw content, and reasoning before default rendering.

### Phase 1 tests

Add versioned golden fixtures and synthetic unavailable cases covering selection/fallback, active versus cumulative scopes, provider usage equality, cache fields, capacity fallback, Pi request-versus-response separation, branches/compactions, mutually exclusive composition, contributor safety/order/limit, compact output, JSON schema, standalone/Pi equivalence, no-model-call behavior, and existing behavior regression. Test that standalone `--advise` makes no model call and points to the correct harness-specific interactive commands. Add static documentation/skill checks for harness-specific command spelling and supported-argument forwarding, plus manual Codex and Claude skill invocations proving `--stats`, `--json`, and `--advise` reach the parser.

## 4. Phase 2 implementation

### Deterministic drivers

Add at most three stable-ID drivers for history replay, large active contributors, exact repeats/failures, and standing context. Each names scope, evidence, and concrete contributor. Silence rules prevent necessity/relevance claims without semantic evidence.

### Active-context access

Use the current active context already available to Codex and Claude. For Pi,
reconstruct the current active context using supported runtime APIs and
compaction boundaries. Do not build a separate task envelope or select excerpts
by guessed relevance. Do not add abandoned branches or compacted-away raw
history.

### Advisor runtime

Implement the approved built-in path for each harness. Respect cancellation and
runtime limits outside the prompt. Record provider/model/effort, usage and cost
when reported, elapsed time, status, and limitations separately from inspected-
session consumption. Malformed output is rejected rather than displayed.

### Model fit and capabilities

Use only model and effort choices exposed in the canonical stats object by the
running harness. The initial Phase 2 implementation does not yet populate that
capability evidence, so validated output is limited to keeping the current
model/effort or making no recommendation. Alternative model/effort advice stays
disabled until equivalent trustworthy capability evidence is implemented for
all supported harnesses; do not maintain or infer a separate model catalog.

### Context action and compaction

Allow only continue, compact, start fresh, or no recommendation; never choose from percentage alone. Compact requires same-task continuity and reducible older material, and includes a typed preservation manifest, qualified reducible scope, loss risk, and valid syntax. Persistent-setting advice requires verified controls, recurring evidence, risk, stability, and rollback. No command or setting is executed.

### Failure isolation

Freeze the deterministic Phase 1 report before starting advisor work. Advisor cancellation, timeout, runtime-limit exhaustion, unavailable active harness model/API authentication, rate limit, malformed output, or validation failure adds only advisor overhead/status/limitations. It cannot modify deterministic metrics, sessions, models, configuration, project files, or context state.

## 5. Delivery sequence

### Increment 0A — Phase 1 capability verification

Verify supported harness versions, session selection, active/branch/compaction semantics, usage sources, capacity/model fields, and Pi request-versus-response evidence. Produce matrix evidence and fixtures.

### Increment 0B — Phase 2 architecture decision

Complete. The advisor receives the complete deterministic stats object and the
current active model context. Codex and Claude use their current model-mediated
skill turn; Pi uses extension-local completion with the active model registry.
No task-envelope extraction pipeline is introduced.

### Increment 1 — modules and canonical measurement model

Create modules/schemas and normalize adapters without changing existing default review output.

### Increment 2 — Phase 1 Codex/Claude

Implement Codex `$context-review --stats` and Claude `/context-review --stats` as the primary interactive skill workflows, with the skill forwarding supported arguments to the local parser. Retain standalone stats for automation/testing/model-free use. Implement usage/scopes/composition/contributors/privacy and golden tests, and verify the contract command examples.

### Increment 3 — Phase 1 Pi

Implement native stats, request composition, response/session usage, branch accounting, packaging, and equivalence tests.

### Increment 4 — Phase 1 release gate

Complete. Parser tests, Pi ephemeral and persisted integration checks, package
content checks, repository validation, compact-output limits, and
`git diff --check` pass. Codex, Claude, and Pi interactive command evidence is
recorded. Phase 1 may ship independently.

### Increment 5 — Phase 2 drivers and output schema

Complete. Deterministic drivers are included in stats, and the versioned advisor
output schema validates structure, evidence references, action limits, and
supported read-only commands. Canonical and packaged Pi resources are kept in
sync.

### Increment 6 — active-context advisor integration

Implemented. Codex and Claude freeze stats to a temporary file and pass that
unchanged object through a separate model-mediated advisor handoff validator;
the live session is not reread after advice starts. Pi waits for the active turn
to settle, then uses extension-local completion with its active model, system
prompt, compaction-aware messages, and provider-facing active tool definitions.
Cancellation/failure behavior, display-privacy checks, capability gates, and
separate overhead accounting are implemented. Manual Codex and Claude
interactive verification remains for the release gate.

### Increment 7 — advice validation and rendering

Implement strict schema/evidence/command/privacy validation, model fit, context action, compaction, persistent-setting guidance, and text/JSON rendering.

### Increment 8 — Phase 2 release gate

Synchronize packaged resources, update prompt/SKILL/README/SPEC, run full tests, cross-surface checks, repository validation, and `git diff --check`.

## 6. Acceptance traceability

### Phase 1

| Requirement | Increment | Files | Automated evidence | Manual evidence |
| --- | --- | --- | --- | --- |
| P1-1 session identity | 1–3 | adapters/model/render/fixtures | explicit/current/fallback tests | inspect each surface |
| P1-2 context headline | 2–3 | measurement/render | token/provider/reconstructed/byte tests | verify scope wording |
| P1-3 usage/activity | 2–3 | adapters/measurement | exact provider/cache/latest/cumulative tests | compare source records |
| P1-4 composition | 2–3 | measurement | nested single-count/share tests | inspect JSON |
| P1-5 contributors | 2–3 | measurement/privacy | max-ten/mixed-unit/redaction tests | inspect safe IDs |
| P1-6 compact/equivalent output | 3–4 | render/index/package | line/byte/schema/equivalence tests | run standalone and Pi |
| A1 no stats advisor call/local calculation | 2–3 | CLI/SKILL/index | parser no-advisor tests and command-routing checks | invoke `$context-review --stats` in Codex, `/context-review --stats` in Claude/Pi; verify skill-mediated versus native labeling |
| A2 golden versions | 0A, 2–3 | fixtures/adapters | versioned suite | record versions/sources |
| A3 active/history separation | 2–3 | measurement | scope tests | inspect labels |
| A4 Pi abandoned branches | 3 | Pi adapter | active/historical usage test | compare fixture |
| A5 shares sum | 2–3 | measurement | approximate-100% test | inspect categories |
| A6 source-field exactness | 0A, 2–3 | adapters | equality tests | source comparison |
| A7 byte fallback | 2–3 | measurement/render | missing token/capacity test | inspect units |
| A8 safe contributors | 2–3 | privacy | secret/path/argument tests | inspect output |
| A9 regression | 4 | all | existing suite/validator | `git diff --check` |

### Phase 2

| Requirement | Increment | Files | Automated evidence | Manual evidence |
| --- | --- | --- | --- | --- |
| P2-1 unchanged Phase 1 | 6–8 | runtime/tests | success/failure snapshot equality | compare advice on/off |
| P2-2 grounded drivers | 5 | drivers/render | scope/evidence/contributor tests | inspect output |
| P2-3 grounded actions | 7 | schemas/validation | valid/generic/unknown-ID tests | inspect citations/proxy |
| P2-4 max three | 5, 7 | drivers/schema | over-limit rejection | inspect output |
| P2-5 silence when insufficient | 5, 7 | advisor/validation | absent/conflicting active-context tests | run interactive harness case with insufficient task evidence |
| P2-6 context-action enum | 7 | schema/render | all enum cases | reject percentage-only advice |
| P2-7 manifest/syntax/risk | 7 | validation/render | harness compaction tests | confirm no execution |
| P2-8 Codex compact syntax | 7 | capabilities/validation | instruction-argument rejection | inspect Codex output |
| P2-9 no automatic changes | 6–8 | runtime/index | filesystem/session/config invariance tests | verify working tree/settings |
| P2-10 persistent advice completeness | 7 | schema/render | setting/risk/rollback tests | inspect output |
| P2-11 trigger evidence gate | 7 | validation | threshold/capacity/repetition tests | inspect suppression |
| P2-12 no task state in persistent config | 5–7 | privacy/validation | secret/temp-state rejection | inspect proposal |
| P2-13 failure-cause distinction | 7 | advisor/schema | reasoning/tool/permission/infra cases | inspect labels |
| P2-14 current capabilities/tradeoffs | 7 | capabilities | live/stale/current-only tests | inspect source/date |
| P2-15 prompt readable/versioned/override | 6–8 | prompt/package/runtime | precedence/hash/package tests | inspect metadata |
| P2-16 reference validation | 7 | validation | unknown metric/driver/contributor tests | inspect suppression |
| P2-17 prompt-override safety | 6–7 | runtime/privacy | hostile prompt-override tests | confirm invariant enforcement |
| P2-18 preserve necessary context | 5–7 | advisor/validation | constraints/decisions/verification cases | review manifest/actions |
| P2-19 deterministic equivalence | 6–8 | measurement/runtime | advisor success/failure equality | compare JSON sections |
| P2-20 usable built-in advisor | 0B, 6 | harness runtimes/SKILL | ordinary-use integration tests | invoke the supported command on every harness |
| P2-21 advisor overhead and limits | 6–7 | runtime/model/render | cancellation, limits, and double-count tests | inspect reported or unavailable overhead |
| P2-22 standalone advice deferred | 2, 6 | CLI/render | no-call/referral test | verify the correct interactive command |
| P2-23 regression | 8 | all | full suite/validator | Pi load and `git diff --check` |

### Cross-surface checks

| Check | Automated evidence | Manual evidence |
| --- | --- | --- |
| Harness-specific command syntax | static command-spelling checks | run the documented Codex, Claude Code, and Pi commands |
| Skill argument forwarding | routing contract tests where harness automation permits | verify `--stats`, `--json`, `--advise`, and existing options reach the parser |
| No manual task input | active-context integration tests | complete ordinary advice without JSON, flags, stdin, questionnaires, or forms |

## 7. Files expected to change

- Contract sources: `docs/context-efficiency-phase-1-measurement.md`, `docs/context-efficiency-phase-2-guidance.md`, and `docs/context-efficiency-implementation-handoff.md`.
- Implementation changes: `skills/context-review/scripts/context-review.mjs`, tests, fixtures, `SKILL.md`, `prompts/advisor.md`, Pi `index.ts`, packaged parser, `package.json`, README, and SPEC.
- Planned canonical resources: deterministic drivers, advisor integration, output validation/schema, and rendering under the existing `skills/context-review` package.
- Planned Pi package resources: the prompt, output schema, validator dependencies, and canonical parser resources used by the extension.

## 8. Privacy and safety

The deterministic stats report remains privacy-safe and contains no raw
transcript or payload content. Invoking `--advise` explicitly consents to the
active model analyzing current context and displaying validated task-specific
conclusions. Output validation rejects multiline/code-block output and
recognizable secret forms, but cannot prove that every paraphrase is
non-sensitive; advice therefore has a narrower privacy guarantee than stats.
Advice does not retrieve abandoned branches, compacted-away raw history,
excluded messages, environment data, or other persisted content that the
harness did not place in the active context.

The advisor can only return guidance. It must never compact, clear, create sessions, switch models, edit configuration, or modify project files. Generated preservation state is derived guidance, not an authoritative source.

## Final validation

- Every acceptance-traceability row passes.
- The advisor receives the complete deterministic stats object and current
  active model context on every supported interactive harness.
- Prompt, output schema, validator dependencies, and Pi package resources are synchronized.
- Existing context-review behavior and harness registration checks pass.
- `node scripts/validate-repo.js` and `git diff --check` pass.

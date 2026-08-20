# Context Efficiency Phase 2: Diagnosis And Action Guidance

## Outcome

Help an engineer understand the largest measurable causes of token consumption and decide what to change next.

Phase 2 answers:

1. Which mechanisms and concrete context items drove most of the consumption?
2. Which one or two changes are likely to have the largest effect?
3. Should the engineer continue, compact the current task, or start a fresh session?
4. If compaction is appropriate, what must be preserved?

## Dependency

Phase 1 provides the canonical measurements, scopes, evidence labels, and cross-harness formatting. Phase 2 must use those results rather than recount the session independently.

## Scope

### Included

- Up to three dominant measured drivers.
- Up to three evidence-backed actions, ordered by expected impact.
- Concrete tool, command, path, message category, or session behavior behind each finding.
- Continue, compact, or start-fresh guidance when task continuity can be assessed.
- A preservation manifest and valid harness-specific compact command when compaction is recommended.
- Persistent compaction-prompt or automatic-trigger configuration advice when the harness supports it and session evidence justifies it.
- Current model and reasoning-effort fit analysis when reliable model capability and task evidence are available.
- Compact text and JSON output.
- No automatic context or configuration changes.

### Not included

- Team dashboards, benchmarks, or engineering-session consumption budgets.
- Automatic rewriting of instructions, tool definitions, commands, or output.
- Rewind, branch, and partial-history optimization.
- Automatic compaction or session creation.
- Claims that high consumption is waste when necessity cannot be assessed.

## Command Behavior

### Measured diagnosis

```text
Codex:      $context-review --stats
Claude Code: /context-review --stats
Pi:          /context-review --stats
```

This remains local and deterministic. Codex and Claude Code use a model-mediated skill turn only to start the local parser; the model does not calculate the statistics. Pi uses its native command without a model turn. The report contains all Phase 1 measurements followed by up to three `Measured drivers` derived from session evidence.

### Tailored action guidance

```text
Codex:      $context-review --stats --advise
Claude Code: /context-review --stats --advise
Pi:          /context-review --stats --advise
```

This returns the same deterministic report and uses the active harness model to add `Recommended actions`, `Model and reasoning fit`, and, when appropriate, a `Context action`.

The advisor receives the complete structured deterministic stats report plus the current active model context. That context includes the messages, requirements, decisions, tool results, failures, and verification state currently available to the working agent. Codex and Claude already provide this context to the current agent. Pi reconstructs its current active context through supported runtime APIs and compaction boundaries. Abandoned branches, compacted-away raw history, and other persisted records outside the active context are not added.

Advisor model, token usage, elapsed time, cost when reliably available, and limitations are reported separately from the inspected engineering session. The deterministic measurements remain unchanged. When the active context cannot establish task meaning, the advisor reports measured drivers without selecting compact versus fresh.

Harness-specific `--stats --json` and `--stats --advise --json` invocations use the same Phase 1 schema. Phase 2 adds `measuredDrivers`, `recommendedActions`, `contextAction`, and separate advisor-overhead fields.

### Standalone execution

The standalone Node command remains available for deterministic Phase 1 statistics, automation, testing, and troubleshooting:

```bash
node <context-review-skill>/scripts/context-review.mjs --stats --agent <harness> --cwd "$PWD"
```

Standalone semantic advice is deferred. In the initial implementation, standalone `--advise` makes no model call and directs the engineer to `$context-review --stats --advise` for Codex or `/context-review --stats --advise` for Claude Code and Pi. It does not offer questionnaires, forms, task-context flags, stdin envelopes, or manually prepared task JSON.

## Measured Drivers

Show no more than three. Each driver must contain dynamic session evidence, not generic advice.

Prioritize by:

1. evidence reliability
2. share of the relevant measured scope
3. repeated effect across model calls
4. size of the concrete addressable contributor

Initial drivers are limited to the areas most likely to produce material value:

### Replayed history and call volume

Show how much cumulative input came from history carried across calls, the current active-context size, call count, and compaction count when available.

Keep cached input, fresh input, and billed or provider-defined totals separate.

### Large active contributors

Identify large tool results, source reads, retrievals, assistant responses, instructions, or tool definitions that materially contribute to the active context.

Size alone does not establish that the contributor should be removed.

### Repeated operations and failures

Identify exact repeated operations, identical results, explicit retry records, and repeated failure classes when preserved. Do not infer that repetition was unnecessary or that an earlier result remained valid.

### Standing context

For a fresh or near-fresh session, identify material instructions, memory, skills, plugins, connectors, or tool definitions directly exposed by the harness.

Do not infer that a capability is unused from a single session.

## Recommended Actions

Show no more than three actions. Each action must include:

- the exact measured driver and contributor it addresses
- the concrete change
- expected benefit expressed through a measured proxy
- what could be lost or degraded
- confidence and evidence limitation

Recommendations must be specific to the observed session. Do not emit fixed decision trees or generic efficiency tips.

The recommended actions in this report are produced by the LLM advisor. Each action must cite deterministic metric or driver identifiers. A deterministic validator must reject or suppress actions that cite unavailable evidence, exceed the output limits, propose an unsupported harness command, or violate the read-only boundary.

Examples of acceptable actions include:

- change a named test command to return failures instead of its full successful log
- store a named raw result outside the conversation and return a short pointer
- reuse an unchanged, still-authoritative result instead of repeating the same lookup
- split specialized instructions from a named root instruction file when repeated fresh-session evidence shows a material standing cost
- correct the cause of a named repeated failure before another retry

When the required semantic or freshness evidence is unavailable, present the measured driver without recommending the change.

## Model And Reasoning Fit

Assess whether the current model and reasoning effort fit the observed work. The objective is reliable completion with appropriate token use, latency, and context capacity—not selecting the cheapest model in isolation.

The advisor must consider:

- current model, provider, reasoning effort, and context capacity
- task type, scope, affected components, and verification demands
- whether the work is a deterministic lookup, routine edit, debugging task, broad refactor, architecture decision, or independent review
- correction turns, repeated reasoning failures, successful completion, and verification results
- whether failures came from reasoning, missing context, tool behavior, permissions, or infrastructure
- locally available models and effort levels reported by the running harness
- the cost of switching models mid-session, including cache effects when the harness exposes them

The output is limited to:

- **Keep current model and effort.**
- **Lower reasoning effort or use a faster supported model.** Appropriate only for well-scoped work with low reasoning demand and no evidence of quality loss.
- **Raise reasoning effort or use a stronger supported model.** Appropriate only when the task is reasoning-sensitive and repeated failures remain after context, tools, and requirements are adequate.
- **Use a supported larger-context model.** Appropriate only when required context cannot safely be reduced or compacted.
- **No recommendation.** Evidence or current capability data is insufficient.

Every recommendation must show:

- observed task demands
- evidence of fit or mismatch
- exact supported model or effort option when known
- expected quality, token, latency, and context tradeoff
- confidence and missing evidence
- harness-specific command or setting when supported

Do not attribute missing information, tool failures, permission failures, or transient infrastructure errors to model capability. Do not hardcode model recommendations that can become stale. Use only choices exposed in the canonical stats object by the running harness.

The initial Phase 2 implementation does not populate cross-harness capability evidence in that object. Therefore validated model-fit output is currently limited to `keep` or `none`; alternative model and effort recommendations remain disabled until equivalent trustworthy discovery exists for Codex, Claude Code, and Pi.

Codex supports interactive model and reasoning-effort selection through `/model` and persistent `model` and `model_reasoning_effort` configuration. Claude Code supports `/model`, `/effort`, and persistent model and effort settings. Pi supports model switching and `defaultModel`, `defaultProvider`, and `defaultThinkingLevel` settings. Implementation must verify available choices from the running harness.

Reference the current [Codex model documentation](https://learn.chatgpt.com/docs/models), [Claude Code model configuration](https://code.claude.com/docs/en/model-config), and [Pi settings documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/settings.md) during implementation rather than relying on model names embedded in the advisor prompt.

## Advisor Prompt Configuration

The LLM analysis prompt must be easy to inspect and override without editing parser code.

Use this precedence:

1. prompt path explicitly supplied for the invocation
2. repository prompt at `.context-review/advisor.md`
3. packaged default prompt at [`skills/context-review/prompts/advisor.md`](../skills/context-review/prompts/advisor.md)

Example explicit override:

```text
Codex:      $context-review --stats --advise --prompt ./.context-review/team-advisor.md
Claude Code: /context-review --stats --advise --prompt ./.context-review/team-advisor.md
Pi:          /context-review --stats --advise --prompt ./.context-review/team-advisor.md
```

The report must display the selected prompt path, prompt version, and content hash.

The prompt defines:

- how to rank measured drivers
- which engineering actions the organization permits or prefers
- model and reasoning-fit criteria
- compaction-preservation priorities
- the required structured advisor output

Prompt customization must not change deterministic measurements or disable enforced privacy, evidence citation, output limits, supported-command validation, or the prohibition on automatic changes.

The advisor input and output use versioned structured schemas. The validator accepts only actions referencing supplied driver and metric identifiers. Unsupported or ungrounded advisor output is reported as a limitation rather than shown as a recommendation.

## Context Action

Recommend only one of:

- **Continue:** no material context-management benefit is supported, or the task is nearly complete.
- **Compact:** the same task continues, important working state must remain, and older material is a dominant driver.
- **Start fresh:** the next goal, repository, problem domain, or independent-review role differs from the accumulated session.
- **No recommendation:** task continuity or preservation needs cannot be established safely.

Do not select an action from context percentage alone.

## Compaction Support

When `Compact` is selected, produce:

- evidence supporting compaction
- estimated reducible scope without claiming guaranteed token savings
- preservation manifest
- information-loss risk
- valid harness-specific command

The preservation manifest covers identified:

- current goal and scope
- requirements and constraints
- accepted decisions and authoritative sources
- modified and relevant files
- verification performed and results
- unresolved failures or uncertainty
- immediate next step

Claude Code and Pi support `/compact [instructions]`. Codex documents `/compact` without a per-command instruction argument; for Codex, show `/compact` plus a checklist for reviewing the resulting summary.

The tool never runs the compact command automatically.

## Persistent Compaction Configuration

The tool may advise persistent compaction configuration because all three harnesses expose practical control surfaces:

- **Codex:** `compact_prompt`, experimental `experimental_compact_prompt_file`, `model_auto_compact_token_limit`, and `model_auto_compact_token_limit_scope` in Codex configuration.
- **Claude Code:** compaction-preservation instructions in `CLAUDE.md`, `/autocompact` controls, and supported automatic-compaction environment settings.
- **Pi:** `reserveTokens` and `keepRecentTokens` settings, plus `session_before_compact` for extension-controlled compaction.

Implementation must verify these controls against the current [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference.md), [Claude Code context-window documentation](https://code.claude.com/docs/en/context-window), and [Pi compaction documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/compaction.md).

Configuration advice must be separate from the immediate session action. For every proposed change, show:

- detected harness and current effective setting when readable
- exact supported setting or instruction surface
- proposed value or preservation text
- session evidence supporting the proposal
- expected effect expressed through a measured proxy
- risk to context quality, response capacity, or cache behavior
- how to undo the change
- whether the setting is stable or experimental

### Compaction-prompt advice

Recommend a persistent preservation instruction only when evidence shows a recurring class of important state that compaction may omit, such as modified files, verification results, unresolved failures, or accepted decisions.

Do not copy task-specific secrets, temporary paths, or one-off decisions into persistent configuration. Prefer a short reusable preservation rule.

Example Codex advice:

```text
Persistent compaction advice: compact_prompt
Evidence: two observed compactions omitted verification status, which had to be
reconstructed in later turns.

Proposed config.toml:
compact_prompt = "Preserve modified files, verification commands and results, unresolved failures, accepted decisions, and the immediate next step."

Expected effect: reduce post-compaction rediscovery of verification state.
Risk: a broader summary may retain more tokens.
Undo: remove the compact_prompt entry.
```

Example Claude Code advice:

```text
Persistent compaction advice: CLAUDE.md
Evidence: repeated compactions omitted the verification result and unresolved
failure needed to resume work.

Proposed instruction:
## Compact instructions
When compacting, preserve modified files, verification commands and results,
unresolved failures, accepted decisions, and the immediate next step.

Risk: this project-wide rule applies to later sessions in the repository.
Undo: remove the Compact instructions section.
```

### Automatic-trigger advice

Recommend a trigger change only when the current effective threshold and context capacity are known and the session contains enough evidence to evaluate the existing behavior.

Relevant evidence includes:

- compaction repeatedly starting too late to leave response capacity
- compaction repeatedly interrupting active work earlier than necessary
- rapid post-compaction regrowth
- a configured threshold inconsistent with the actual model context window

Do not recommend a threshold from context percentage alone or from one ordinary compaction. A proposed threshold must retain adequate response capacity and explain how it relates to the model context window and the harness's retained recent-context behavior.

If the evidence is insufficient, show the effective controls without proposing new values.

## Example: Find And Address The Largest Drivers

```text
Codex:      $context-review --stats --advise
Claude Code: /context-review --stats --advise
Pi:          /context-review --stats --advise
```

Representative output:

```text
Context efficiency

Active context
- 162,400 / 200,000 tokens (81.2%) [provider reported]

Session consumption
- 18 observable model calls
- Cumulative input: 1,240,000 tokens
- Cumulative output: 28,700 tokens
- Compactions: 0

Measured drivers

1. Replayed history [history_replay]
   Evidence: 884,000 cumulative input tokens (71% of observed input)
   Current active context: 162,400 tokens

2. Test output [tool_result_share]
   Evidence: tool `test` produced 81,204 serialized bytes
   Share: 15% of the latest observed payload

3. Repeated source read [exact_tool_repeat]
   Evidence: `src/oauth/callback.ts` was read 6 times
   Associated result volume: 54,880 serialized bytes

Recommended actions

1. Return only failing integration-test output from tool `test`.
   Evidence addressed: 81,204-byte retained result.
   Expected benefit: reduce the largest active tool result on later calls.
   Risk: full successful-test detail will not remain in conversation; retain the
   raw log outside the conversation if it is needed for audit.

2. Reuse the latest `src/oauth/callback.ts` read if the file has not changed.
   Evidence addressed: 6 identical-path reads producing 54,880 bytes.
   Expected benefit: avoid another retrieval call and result.
   Risk: stale evidence if the file changed; modification state must be checked.

Model and reasoning fit
- Current: claude-sonnet, high effort
- Observed work: multi-step OAuth debugging with an unresolved integration failure
- Recommendation: keep the current model and effort until the failure is resolved
- Evidence: the task remains reasoning-sensitive; no repeated reasoning failure is
  present, and the recorded failure is an integration-test result
- Tradeoff: lowering effort could reduce tokens but may weaken debugging quality
- Confidence: medium; elapsed time and comparable-model results are unavailable

Context action: compact
Reason: the supplied current goal continues the OAuth callback task, while
older completed investigation is the largest active-context driver.

Preserve
- OAuth callback requirements and constraints
- accepted redirect-validation decision
- modified files and current diff state
- latest integration-test status
- unresolved provider-state mismatch
- next step: correct state validation and rerun the integration test

Claude/Pi command
/compact Preserve the OAuth callback requirements, accepted redirect-validation
decision, modified files, latest integration-test status, unresolved
provider-state mismatch, and next step. Reduce completed investigation,
superseded approaches, and repeated full test logs.

Information-loss risk
- Detailed completed investigation and full historical logs will be summarized.
```

This report identifies the dominant measured causes, connects the largest addressable items to concrete changes, and prepares compaction only because the continuing task can be established.

## Example: Evidence Does Not Support Advice

```text
Codex:      $context-review --stats --advise
Claude Code: /context-review --stats --advise
Pi:          /context-review --stats --advise
```

```text
Measured drivers
- Tool definitions occupy 22% of the latest observed payload.

Recommended actions
- None. The session does not establish which tools are unnecessary for this
  repository or task family.

Context action
- No recommendation. The next task and required preservation state are unknown.

Persistent compaction configuration
- No recommendation. One session does not establish a recurring preservation or
  automatic-trigger problem.

Model and reasoning fit
- No recommendation. The active context and running harness do not expose enough
  task or model-choice evidence for a supported comparison.
```

## Privacy And Safety

- Default deterministic output contains no raw transcript, complete tool result, reasoning content, or provider payload.
- Invoking `--advise` explicitly consents to the active model analyzing current context and displaying validated task-specific conclusions. It does not authorize reproduction of source bodies, prompts, reasoning, secrets, or raw tool results.
- Deterministic output validation rejects multiline/code-block output and recognizable secret forms. It cannot prove that every model paraphrase is non-sensitive, so advice has a narrower privacy guarantee than deterministic stats.
- Model-assisted guidance uses the current active model context, not additional persisted history.
- Respect harness cancellation and practical input, output, and elapsed-time limits outside the prompt.
- Report advisor overhead separately from inspected-session consumption.
- Advisor prompt overrides cannot disable deterministic validation or privacy boundaries.
- Treat generated preservation manifests as derived context, not authoritative sources.
- Never compact, clear, create a session, or modify configuration automatically.

## Acceptance Criteria

1. Phase 1 measurements and meanings remain unchanged.
2. Every measured driver names its scope, evidence, and concrete contributor.
3. Every recommended action traces to a measured driver and contains no canned decision tree.
4. No more than three drivers and three actions are shown.
5. Recommendations remain absent when relevance, freshness, or necessity cannot be established.
6. Context action is limited to continue, compact, start fresh, or no recommendation.
7. Compaction advice includes a preservation manifest, loss risk, and valid harness syntax.
8. Codex is never shown with an unsupported `/compact` instruction argument.
9. No action or configuration change occurs automatically.
10. Persistent configuration advice names an actual supported harness setting, evidence, risk, rollback, and experimental status.
11. Automatic-trigger advice is absent unless the effective threshold, context capacity, and supporting compaction behavior are known.
12. Task-specific state is not proposed as persistent repository or user configuration.
13. Model and reasoning-fit advice distinguishes reasoning limitations from missing context, tool, permission, and infrastructure failures.
14. Model advice uses choices exposed by the running harness and includes known quality, token, latency, and context tradeoffs.
15. The packaged advisor prompt is readable, versioned, and overridable by repository or invocation-specific prompt files.
16. Every advisor action references supplied deterministic metric or driver identifiers and passes validation before display.
17. Prompt overrides cannot change measurements, privacy enforcement, action limits, supported commands, or read-only behavior.
18. Necessary-context evaluation cases do not recommend removing required constraints, decisions, verification evidence, or unresolved risk.
19. The same evidence produces the same deterministic measurements even when tailored guidance uses a model.
20. Interactive advice uses the active harness model or a supported harness API without separate credentials, custom executables, or engineer-authored integration code.
21. Advisor model, token usage, elapsed time, cost when reliably available, and limitations are reported separately; cancellation and runtime limits are honored.
22. Standalone `--advise` makes no model call and directs the engineer to the correct harness-specific interactive command.
23. Existing context-review behavior and repository validation continue to pass.

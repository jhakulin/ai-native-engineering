# Context Efficiency Analysis Requirements

## Status

Requirements for a focused initial extension of `context-review` with compact, local context-efficiency analysis.

## Goal

Help an engineer answer three questions quickly:

1. What context and usage does the current coding-agent session contain?
2. Why is this session's token consumption high, when the available evidence can explain it?
3. Which contributors are material, and which may be actionable rather than necessary?
4. What evidence should guide the engineer's next decision?

The intended loop is deliberately small:

```text
measure current context and session activity
  -> attribute material contributors
  -> distinguish necessary context from optimization candidates
  -> surface a small number of evidence-backed opportunities
  -> engineer decides whether to act
```

Token reduction is not useful if it removes requirements, authority, security rules, or verification evidence needed for correct work.

## Source Guidance

This document applies:

- [`../guidelines/agent-token-efficiency-guideline.md`](../guidelines/agent-token-efficiency-guideline.md) for optimization priorities and quality guardrails.
- [`../strategies/agent-context-systems.md`](../strategies/agent-context-systems.md) for context categories, provenance, and trust.
- [`../skills/context-review/SKILL.md`](../skills/context-review/SKILL.md) for current session reconstruction and evidence labels.
- [`../pi-extensions/context-review/SPEC.md`](../pi-extensions/context-review/SPEC.md) for Pi's latest-provider-payload visibility.
- [Claude Code context-window documentation](https://code.claude.com/docs/en/context-window) and [prompt-caching documentation](https://code.claude.com/docs/en/prompt-caching) for compaction behavior, preservation, and cache effects.
- [Codex CLI slash-command documentation](https://learn.chatgpt.com/docs/developer-commands.md?surface=cli) and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference.md) for `/compact`, compaction-prompt overrides, and automatic trigger settings.
- [Pi compaction documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/compaction.md) for manual and automatic compaction, retained recent context, and structured summaries.

## Product Framing

The token-efficiency guideline identifies four broad sources of waste, in priority order:

- model calls that were not needed
- old context replayed into new work
- oversized source material, tool results, and answers
- retries caused by unclear or incorrect work

Standing instructions, tools, skills, plugins, and memory can also be material, particularly in a fresh session. The analysis should therefore consider the session holistically while keeping the first implementation limited to signals that are preserved, measurable, and actionable with high confidence.

The observed Pi report is a useful evaluation case, not a general conclusion about where waste occurs. It was approximately 1.6 MB and contained a latest provider payload of about 780 KB, demonstrating why analysis should operate directly on structured session evidence rather than feed a raw report back into a model.

Size is an attribution signal, not proof of waste. A large requirement, policy, failure log, or verification result may be essential. The analysis must keep necessity and task quality visible when identifying optimization candidates.

## Primary User

The initial user is an engineer working in an interactive Codex, Claude Code, or Pi session.

Depending on the evidence, the report may help the engineer decide to:

- continue without changing the session
- avoid a model call by using an existing result or deterministic lookup
- compact or start fresh at a coherent task boundary
- narrow retrieval or filter a source, command, log, search, or tool result
- reduce an unused standing instruction or capability
- address a repeated failure, correction, or retry source

The command should surface prioritized opportunities when the evidence supports them. It must not force a recommendation or perform an action.

## Initial Scope

### Included

- One current or explicitly selected local session.
- Codex, Claude Code, and Pi using the evidence currently preserved by each harness.
- Latest provider usage when available.
- Broad context composition by count and serialized size.
- Basic session activity such as model calls, compactions, and failures when directly preserved.
- Attribution of high token consumption to measurable drivers, with unexplained consumption stated explicitly.
- The ten largest context contributors, without assuming they are waste.
- A short list of deterministic, evidence-based optimization candidates.
- Compact human-readable and JSON output.

### Deferred

- Before-and-after comparison workflows.
- Fresh-session baseline management.
- Team or central aggregation.
- Stable public metrics schemas.
- Semantic similarity or sophisticated duplicate detection.
- Automatic task-boundary inference.
- Automatic edits to instructions, tools, skills, plugins, or configuration.
- Provider billing reconciliation.
- Model-generated optimization analysis.
- Universal context-health scores.

Deferred capabilities should be added only after engineers use the initial report and demonstrate a recurring need.

## Proposed Interface

Keep the existing raw context review:

```text
/context-review
/context-review --full
```

Add a compact deterministic view:

```text
/context-review --stats
/context-review --stats --json
```

The stats command must not send the raw report to the model. Codex and Claude may invoke the parser through the skill; Pi may render the result directly as a slash command.

## Evidence Rules

Every number must be labeled as one of:

- **Provider reported:** preserved provider or harness token usage.
- **Exact observed:** latest payload observed by a supported request hook.
- **Exact persisted:** data read directly from a local session record.
- **Reconstructed:** active context derived from documented session and compaction behavior.
- **Estimated:** relative size derived from serialized bytes or characters.
- **Unavailable:** not preserved or exposed by the harness.

Provider-reported tokens are preferred. Serialized bytes are sufficient for identifying large contributors when exact per-item token counts are unavailable.

The command must not convert byte estimates into apparent billing precision.

## Initial Functional Requirements

### FR-1: Select the intended session

The command must:

- use the current session when the harness exposes it
- otherwise select the newest matching harness session for the current working directory
- accept an explicit session path
- display the selected harness, session, working directory, and evidence scope
- warn when it falls back to a non-matching session

### FR-2: Use active context where possible

The command must:

- use the active Pi branch rather than all historical branches
- apply currently supported compaction semantics
- exclude abandoned branches from active-context composition
- report when exact active-context reconstruction is unavailable

Historical execution-cost analysis is deferred.

### FR-3: Show usage and session activity

Always show a headline measurement for the current active context:

- used tokens, context-window capacity, and percentage used when the harness or provider exposes reliable values
- otherwise, exact serialized bytes for the reconstructed active context or latest observed provider payload
- an explicit `token count unavailable` or `capacity unavailable` label rather than omitting the measurement

The headline must identify whether it measures reconstructed active context, the latest observed provider payload, or another narrower scope. It must not present latest-request input usage as current active-context size unless the harness establishes that they are equivalent.

When preserved, show:

- fresh input tokens
- cached input tokens
- output tokens
- total tokens using the provider's definition
- context-window capacity or percentage when available
- model-call count
- compaction count
- directly recorded errors, retries, or repeated failures

Show latest-request and session-level values separately. When a value is unavailable, say so. Do not invent missing values or infer retry semantics from ordinary repeated work.

### FR-4: Explain high token consumption

The report must distinguish between:

- **Current context size:** material likely to be sent or available to the next model request.
- **Latest-request usage:** tokens reported or reconstructed for the latest model call.
- **Cumulative session consumption:** tokens consumed across all observable model calls in the session.

When evidence permits, attribute cumulative consumption to these drivers:

- a large startup or standing-context baseline
- repeated replay of conversation history or other active context
- a high number of model calls
- large source material, retrievals, or tool results
- large model outputs that may be replayed later
- retries, corrections, or repeated failed operations
- compaction and subsequent context growth

For each material driver, show the supporting measurement, its share of the measured consumption when calculable, and the applicable evidence class. Separate provider-reported consumption from serialized-size attribution; do not present bytes as exact token causality.

The report must state when preserved data cannot explain the difference between observed context size and provider-reported consumption. It must not imply that high consumption is inefficient when it may reflect necessary work, a long task, or provider-specific accounting.

### FR-5: Show broad composition

Group active context into these categories when evidence permits:

- instructions and memory
- tool definitions
- user and assistant messages
- reasoning records without revealing reasoning content
- tool calls
- tool results
- compaction summaries
- other or unsupported content

For each category, show item count and exact tokens when available; otherwise show serialized size.

Do not spend the first increment implementing fine-grained instruction, plugin, connector, or skill attribution unless the harness already exposes it directly.

### FR-6: Show material contributors

List at most ten items, ordered by exact tokens or serialized size. Label these as material contributors, not confirmed waste.

Each item should show only actionable metadata:

- category and item type
- tool name or message role
- path or command name when safely available
- tokens or serialized size
- share of the measured scope
- evidence class

Raw content remains available through the existing context-review output and must not be copied into the stats view.

The report must distinguish measured size from an assessment of actionability. A contributor becomes an optimization candidate only when additional evidence supports a bounded change.

### FR-7: Surface bounded optimization opportunities

Surface at most three opportunities using simple deterministic rules. Rank them by evidence strength, potential impact, and actionability rather than size alone.

Initial rules may cover these areas when the required evidence exists:

- **Potentially unnecessary calls:** an exact repeated operation or rediscovery is visible; suggest checking whether a current accepted result or deterministic lookup can replace it.
- **Replayed history:** completed or unrelated work materially contributes to active context; suggest considering a fresh task or compaction at a coherent boundary.
- **Oversized input or output:** a source, retrieval, command, log, answer, or tool result is both material and broader than the observed task need; suggest narrowing or filtering it.
- **Repeated failure or correction:** the same operation or error class recurs; suggest addressing the task, context, tool, or verification cause before retrying.
- **Standing context:** instructions or tool definitions are material in a fresh or near-fresh session; suggest reviewing whether the contributor is required for the repository and task family.

Each opportunity must name its evidence, expected benefit, and quality risk. The command must avoid advice when the required evidence is unavailable and may report that no clear opportunity was found.

When context-management evidence is material, the report may provide command-ready decision support:

- **Continue:** the task remains coherent and there is no material context pressure or obsolete history.
- **Compact:** the same task continues, but older detail is materially increasing subsequent requests.
- **Compact with focus:** the harness accepts instructions and the active goal, constraints, decisions, file state, verification results, and unresolved work can be identified with adequate evidence.
- **Start fresh or clear:** the next work is unrelated, the goal or repository has changed, or failed approaches and corrections dominate what would otherwise be summarized.
- **Rewind, branch, or partial summary:** the harness supports it and a discarded or divergent approach has a clear boundary.

For a compaction suggestion, show:

- why compaction is preferable to continuing unchanged or starting fresh
- the observable boundary or context pressure supporting the timing
- what must survive the summary
- what may safely be reduced
- a ready-to-copy harness-specific command when supported
- the risk of lost detail and any evidence limitation

Use the harness's actual interface. Claude Code and Pi support `/compact [instructions]`; Codex documents `/compact` without an instruction argument. Do not invent a cross-harness syntax. Do not execute compaction automatically.

For Codex, distinguish the manual trigger from configuration-level controls:

- `/compact` triggers compaction for the current chat.
- `compact_prompt` overrides the general history-compaction prompt.
- `experimental_compact_prompt_file` loads that override from a file but is experimental.
- `model_auto_compact_token_limit` and `model_auto_compact_token_limit_scope` control automatic trigger timing.
- `PreCompact` and `PostCompact` hooks can observe manual or automatic compaction; `PreCompact` can cancel it, but hook stdout does not supply a per-run summary prompt.

The initial tool may report these controls and produce a proposed reusable `compact_prompt` when recurring preservation needs are evident. It must label configuration advice separately from the ready-to-run `/compact` command and must not change configuration or hooks automatically. Do not recommend a persistent prompt or threshold change from one high-usage session alone.

Do not recommend compaction solely because a fixed context percentage has been reached. Compaction itself requires a summarization call, can change cache behavior, and is lossy. Prefer a natural boundary in a continuing task; prefer a fresh context for unrelated work and rewind or branching for an approach that should be abandoned rather than preserved.

The report may describe the best-supported option and alternatives, but must not call the result "optimal" unless alternatives and their measurable costs can actually be compared.

### FR-8: Keep output compact

The default stats report must:

- contain no raw transcript or complete provider payload
- lead with the evidence scope, latest usage, and material contributors
- remain under 100 lines and 8 KB for the representative Pi session
- show the top contributors and no more than three optimization opportunities
- state important measurement limitations

The JSON output must contain the same compact information. A stable public schema is deferred until the metrics prove useful.

## Human-Readable Output

Use this shape:

```text
Context efficiency

Session
- Harness, model, session, working directory
- Evidence scope and limitations

Latest usage
- Headline active-context size: used tokens, capacity, and percentage; otherwise exact serialized bytes
- Fresh input, cached input, output, and total

Consumption drivers
- Current context versus cumulative session consumption
- Material measured causes of high consumption, or an explicit explanation gap

Composition
- Category, count, tokens or bytes, share

Largest contributors
- Top ten items

Optimization opportunities
- Up to three evidence-bearing candidates, or no clear opportunity
- Expected benefit and quality risk
- Harness-specific context-management command when supported
```

## Compact JSON Shape

The initial JSON output should be easy to change while the feature is evaluated:

```json
{
  "session": {},
  "scope": {},
  "latestUsage": {},
  "consumptionDrivers": [],
  "composition": [],
  "largestContributors": [],
  "sessionActivity": {},
  "opportunities": [],
  "limitations": []
}
```

Every numeric field must include or imply an unambiguous unit such as tokens, bytes, characters, percentage, or count.

## Non-Functional Requirements

### Local and read-only

- Use no network access.
- Make no session, repository, configuration, or harness changes.
- Do not compact, clear, or terminate a session.
- Do not create an output file unless the user explicitly requests one through an existing supported option.

### Privacy

- Omit raw prompts, responses, source content, reasoning content, secrets, and complete provider payloads from stats.
- Do not publish metrics or findings automatically.
- Treat paths and command metadata as local potentially sensitive information.

### Determinism

The same parser version and session input must produce the same counts, sizes, ordering, and opportunities.

### Schema tolerance

Unknown records must be counted and reported as limitations. Supported measurements should remain available when possible.

### Bounded work

Calculate stats directly from the session or observed provider payload. Do not first create or parse another full Markdown context report.

Performance optimization beyond avoiding obvious full-report duplication is deferred until real usage demonstrates a problem.

## Quality Guardrails

Do not recommend removing these solely because they consume context:

- security and approval rules
- task requirements and constraints
- authoritative policies or decisions
- affected interface or dependency evidence
- verification commands and failure evidence
- unresolved uncertainty material to safe completion

Efficiency should be judged with task quality. A smaller context that causes missed requirements, retries, rework, or defects is not an improvement.

## Initial Acceptance Criteria

The first increment is complete when:

1. `/context-review --stats` works on representative Codex, Claude Code, and Pi sessions.
2. Active Pi context excludes abandoned branches.
3. Provider usage is shown when preserved and missing values are explicit.
4. A headline shows active-context used tokens, capacity, and percentage when reliably available; otherwise it shows exact serialized bytes and labels unavailable token fields.
5. The report distinguishes current context, latest-request usage, and cumulative session consumption.
6. Material causes of high consumption are attributed where supported, and unexplained consumption is explicit.
7. Context is grouped into the defined broad categories.
8. The ten largest contributors are shown without raw content.
9. Available model-call, compaction, failure, and retry signals are reported without inventing missing semantics.
10. The report surfaces no more than three prioritized, evidence-bearing opportunities when supported and may report no clear opportunity.
11. A compaction suggestion distinguishes continuing, compacting, starting fresh, and abandoning or branching an approach where the harness supports those choices.
12. Any suggested compaction command uses valid harness-specific syntax and states what should be preserved.
13. The representative 1.6 MB Pi report produces a stats view under 100 lines and 8 KB.
14. Stats use no network access and make no state changes.
15. Existing context-review tests and repository validation continue to pass.

## Evaluation

Start with four representative cases:

1. A short, coherent session with no clear optimization opportunity.
2. A long session containing replayed or unrelated work.
3. A session containing an oversized but unnecessary tool result and a large but necessary source.
4. A session with repeated calls or failures and a fresh-session case with material standing context.
5. A session with high cumulative consumption but a modest final context, to verify that repeated calls and replay are not hidden by the final snapshot.
6. Continuing-task, unrelated-next-task, and abandoned-approach cases, to verify that compact, fresh context, and rewind or branch are not conflated.

For each case, verify:

- material contributors are correctly attributed
- the principal measurable drivers of high consumption are visible
- current context size is not confused with cumulative token consumption
- context-management suggestions match the harness and task boundary
- proposed compaction focus preserves requirements, decisions, file state, verification, and unresolved work
- necessary large context is not automatically labeled as waste
- surfaced opportunities are reasonable and evidence-bearing
- the report is quick to understand
- no raw sensitive content appears
- the engineer can decide what to do without another model analysis

Only after this proves useful should comparison, duplication analysis, team aggregation, or more sophisticated recommendations be considered.

## Open Questions For Initial Implementation

- Which latest-usage fields are consistently available across the three harnesses?
- Can current-context capacity be obtained reliably, or should it be omitted initially?
- Which simple, high-confidence conditions should surface an optimization opportunity without equating size with waste?
- Which path and command metadata should be redacted by default?

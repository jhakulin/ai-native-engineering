# Agent Token Efficiency Guideline

## Purpose

This guide helps engineers reduce the tokens consumed by coding agents. Most waste comes from four sources:

- model calls that were not needed
- old context replayed into new work
- oversized source material, tool results, and answers
- retries caused by unclear or incorrect work

Reduce those sources in that order. Keep the context required for correct implementation, verification, and safe action.

## Start With The Biggest Waste

| What you observe | Likely waste | First action |
| --- | --- | --- |
| A fresh session is already large | Instructions, skill descriptions, tools, hooks, or memory | Measure each source and remove the largest unused contributor |
| A new job continues in an old conversation | Previous messages are replayed | Start a fresh task |
| The agent reads large files to find one fact | Irrelevant input | Search first and load the matching section |
| Logs or command output fill the context | Noisy tool results | Filter, deduplicate, and limit output before the model sees it |
| Answers are longer than their next use requires | Output becomes future input | Request the exact format and length needed |
| Several turns correct the original request | Replayed mistakes and answers | Edit or branch from the flawed request when supported |
| The agent repeatedly researches the same fact | Repeated discovery | Reuse a current, accepted result |
| Every task exposes many tools and skills | Standing schema and routing cost | Enable only relevant capabilities |
| A worker repeats the same failed approach | Retry loop | Stop, classify the failure, and ask or escalate |

## Audit Startup Context

Measure what enters a fresh session before opening task files or running commands. Attribute the starting context to:

- global and repository instructions
- skill and agent descriptions
- tool and MCP schemas
- commands and hooks
- plugins and connectors
- persistent memory

Start with the largest contributor. Remove unused capabilities, shorten descriptions, and move specialized guidance behind task-specific loading.

Use deterministic scripts for file counts, line counts, and token estimates when possible. Use an agent to judge relevance, duplication, and stale instructions—not for measurements a script can calculate exactly.

Repeat the measurement after cleanup.

## Avoid The Model Call

Before prompting a model, check whether the work can be completed with:

- an exact database or repository lookup
- a deterministic script or transformation
- an existing authoritative artifact
- a current, accepted answer
- a valid cached result

This removes the entire inference cost. Reuse a result only when its source, scope, freshness, permissions, and baseline still match the request.

## Keep One Task Per Context

Later turns may carry earlier messages, instructions, tool definitions, source material, tool results, and model output into the next request. The latest message can be only a small part of the effective input.

Keep a conversation while it serves one coherent task. Start fresh when the goal, repository, problem domain, or decision role changes. Ask related questions together when they use the same sources. When the harness supports editing or branching, replace a flawed request instead of adding correction turns.

Use compaction when the same task must continue but its history has become too large. Compaction is lossy, so preserve:

- outcome, scope, constraints, and accepted decisions
- authoritative sources and current artifacts
- verification results
- unresolved issues and remaining work

Start fresh instead when review must be independent, old approaches dominate the history, or the compacted context quickly fills again.

## Carry Results, Not Conversations

Pass the accepted artifact between workflow stages:

```text
exploration or research
  -> accepted specification or brief
  -> fresh execution context
  -> accepted result and verification
  -> fresh review context
```

The handoff should contain the intended outcome, constraints, accepted decisions, relevant sources, current artifact, verification expectations, and unresolved uncertainty. Leave behind false starts, rejected sources, superseded drafts, and correction history.

## Search And Filter Before Loading

Find the relevant material before placing it in context:

1. Search by path, symbol, identifier, error, or exact phrase.
2. Load the smallest useful section with enough surrounding context to interpret it.
3. Follow dependencies, tests, or references only when the task may affect them.
4. Broaden to semantic or multi-source search when exact discovery is insufficient.

Use the lightest useful source form:

- text or Markdown when layout does not matter
- relevant PDF pages or extracted passages instead of the complete document
- selected records instead of a data export
- relevant code regions instead of the whole repository
- a current repository index instead of repeated broad discovery

For version-sensitive libraries and APIs, retrieve current documentation rather than relying on model memory.

For a large repository, route context through a hierarchy:

```text
small root index
  -> component instructions
  -> exact files and sources
```

Keep the root file focused on project-wide navigation and constraints. Put component-specific guidance near the component so it loads only when work enters that area.

## Keep Tools And Instructions Lean

Enabled tools, skills, plugins, connectors, global instructions, and persistent memory may add context before work begins.

- Keep global and repository instructions short and broadly applicable.
- Load specialized procedures through skills only when relevant.
- Disable tools, plugins, connectors, skills, and agents that the environment does not use.
- Keep tool schemas and routing descriptions concise and distinct.
- Link to one authoritative source instead of duplicating instructions.

Document information the agent cannot reliably infer from the repository:

- project purpose
- non-obvious tools and versions
- architectural deviations
- specific, verifiable rules
- hard constraints and known failure modes
- pointers to deeper sources

Prefer “parameterize every SQL query” over “write safe SQL.” Remove naming and formatting guidance already enforced by code, configuration, formatters, or tests.

An in-session skill can improve later retrieval, output, and retry behavior. It cannot remove the conversation, instructions, or tool definitions already sent in the request that activated it. Filtering before inference prevents more consumption than cleaning up afterward.

Keep essential security and approval rules available unless the runtime enforces them independently.

## Request Smaller Outputs

Output costs tokens when generated and may be included in later requests. Ask for the smallest artifact that supports the next action:

- five decision-relevant bullets instead of an essay
- a decision table instead of exploratory prose
- required JSON fields instead of a complete object
- failing tests instead of the full test log
- relevant diff hunks instead of the complete diff

Filter tool results before they enter model context:

- remove boilerplate, comments, and irrelevant whitespace
- group repeated messages and return a count
- deduplicate identical diagnostics
- truncate long descriptions while preserving identifiers
- return failing checks instead of successful output
- provide an explicit way to request the raw result

Use query limits, structured fields, pagination, and scripts to apply these operations before inference. Store raw output outside the conversation when later audit or debugging may need it, and return a short result with source pointers.

## Prevent Retries And Rework

Before implementation, establish:

- the intended outcome and scope
- authoritative sources and constraints
- what the agent may decide
- how completion will be verified

Stop and ask when ambiguity, contradictory requirements, unexpected repository state, missing authority, or required human testing could change the implementation. A short clarification is cheaper than completing the wrong task.

Run deterministic builds, tests, formatting, and validation before model review. When work fails, identify whether the cause is transient infrastructure, missing information, or an incorrect approach. Limit retries and worker-reviewer correction rounds; escalate repeated non-transient failures.

Once the agreed completion checks pass, stop. Unrequested polishing creates more output, review, and risk.

## Use Models And Agents Deliberately

Use the least expensive model and reasoning effort that can complete the task reliably. A stronger model may cost less overall when it avoids retries; compare results on representative work.

Subagents isolate high-volume investigation or independent review from the main context, but they usually increase total token use. Give each subagent a bounded task and require a compact result. Run agents in parallel only when the work is independent and the expected time saving justifies the multiplied usage and review load.

For long-running work, use event-driven notifications or scheduled checks instead of repeated full-context polling. Stop monitoring when the task completes, fails, or needs escalation.

## Enforce Budgets In The Harness

Prompt instructions cannot reliably enforce resource limits. When budgets matter, configure the harness or gateway to limit:

- input and output size
- retrieved passages and tool output
- available tools
- model calls and retries
- token, cost, or elapsed time per task

When a limit is reached, narrow the source, use a deterministic path, or escalate. Preserve the instructions and evidence required for safe, correct work.

## Check Whether The Change Helped

Compare representative tasks before and after a change. Record:

- total input, reused or cached input, output, and tool-result volume
- model calls, retries, and compactions
- engineer clarification and correction time
- elapsed time to a verified result
- whether the result passed the same acceptance checks

A change helped when it reduced usage or engineer effort without increasing missed requirements, retries, or defects. Provider reports may count cached input, billed tokens, quotas, and latency differently, so compare like with like.

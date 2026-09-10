# Claude Code Engineering Guideline

This is the team baseline. If a setting is not listed here, keep Claude Code's default.

## What Optimal Means

An optimal Claude Code environment is not the configuration with the most instructions, skills, tools, or automation. It is the smallest environment that gives an engineer the context and capabilities required for the current repository while keeping behavior understandable, secure, and verifiable.

Manage three layers separately:

- **Team configuration:** repository instructions, project skills, hooks, MCP servers, permissions, and checks shared through source control.
- **Engineer environment:** user-level instructions, skills, plugins, MCP servers, permissions, and local overrides that affect every session the engineer starts.
- **Session context:** the task conversation, files, command output, invoked skills, and other evidence accumulated while one piece of work progresses.

A healthy project configuration can still perform poorly when an engineer's user-level environment injects stale instructions or unused capabilities. A clean static environment can still degrade when one session accumulates unrelated tasks, failed approaches, large tool output, and implementation bias. Engineers should therefore inspect both the environment loaded before the first prompt and the context accumulated during work. Treat the effective configuration as the resolved result of all applicable scopes, not any one settings file. Before changing a permission, hook, connector, or skill override, inspect which team, user, project, branch, or local scope contributes it and whether a higher-precedence rule can block or weaken the intended behavior. Keep repository-required denies and approval points outside agent-authored instructions; use runtime permissions or hooks for enforcement and document the owner of any local exception.

## Engineer Environment And Session Routine

### Diagnose The Environment With `/doctor`

Every engineer should run `/doctor`:

- when setting up Claude Code or joining a repository
- after a major Claude Code upgrade
- after changing settings, permissions, hooks, plugins, MCP servers, agents, or skills
- when commands, search, tools, or context behave unexpectedly
- before a team harness review when the local environment has not been checked recently

`/doctor` validates the installation and resolved configuration and can identify settings, MCP, context, memory, skill, and agent problems. Treat it as a diagnostic, not an optimizer or certification. Review every proposed fix before accepting it, especially when a change would modify permissions, disable a shared component, or alter repository-controlled configuration.

Capture the outcome without collecting unnecessary machine details:

```text
/doctor status:
Material warnings:
Local configuration affecting this repository:
Action taken or owner for follow-up:
```

The relevant outcome is that warnings are understood and owned. A green report does not prove that the current instructions, permissions, or skills are appropriate for the team's work.

### Learn From Work Patterns With `/insights`

Run `/insights` periodically and before a harness-discovery discussion when enough session history exists. It analyzes Claude Code sessions for project areas, interaction patterns, and friction points. Use the report to identify questions such as:

- Which tasks repeatedly require the same context or correction?
- Where does Claude misunderstand intent, repository structure, or completion criteria?
- Which manual explanations could become better repository context or a reusable skill?
- Which permission prompts, failed tool calls, or unavailable integrations interrupt normal work?
- Where do sessions become long because tasks are too broad or several concerns are mixed together?
- Which workflows create repeated review findings or verification gaps?

`/insights` is evidence for personal and team improvement, not a productivity score. Engineers should be able to share patterns and proposed improvements without sharing raw transcripts or sensitive task content. The team should not compare people by prompt count, token use, generated-code volume, or visible AI activity.

A useful discussion record is:

```text
Repeated work pattern:
Observed friction or correction:
Possible environment, repository, skill, or workflow cause:
Sensitive details omitted:
Candidate improvement or question:
```

### Inspect Fresh-Session Cost With `/context all`

Run `/context all` near the beginning of a fresh repository session, before reading task files or producing large tool output. This establishes what Claude receives before meaningful work begins. Inspect:

- repository and user-level `CLAUDE.md` or memory content
- system and tool instructions
- MCP tool definitions
- skill descriptions
- agents, plugins, and other configuration contributing context
- unexpected or disproportionately large sources

There is no universal percentage that makes a fresh session optimal. Models, repositories, tools, and work types differ. Use the fresh-session result as a baseline and investigate content that is unexplained, unused, duplicated, stale, or large relative to its value.

Use `/skills` to review installed skills and sort them by token count. For each skill:

- keep it `on` when automatic selection is valuable
- use `name-only` when discoverability matters but the description is unnecessarily expensive
- use `user-invocable-only` for deliberate workflows such as deployment or release
- set it `off` when it is unused or irrelevant to the engineer

The `/skills` menu stores personal visibility choices in `.claude/settings.local.json`. Do not disable a team-required skill merely to lower context without confirming its purpose. Plugin skills are managed through `/plugin`, not `skillOverrides`.

Also disable unused MCP servers through `/mcp` when their tools are not needed. Tool search keeps idle MCP cost relatively small, but disconnected, duplicated, broadly scoped, or frequently selected servers still create operational and security burden.

Repeat `/context all` after cleanup and record the reason for material changes. The goal is not the smallest possible number; it is a context baseline whose contents the engineer and team can explain.

### Keep One Session Attached To One Coherent Task

Start a fresh session when beginning a materially different task, changing repositories or problem domains, or moving from implementation to an independent judgment that should not inherit the implementation discussion. A new session avoids carrying discarded approaches, unrelated files, correction history, and assumptions into the next task.

Continue an existing session when the next step depends materially on decisions and evidence already developed in it. If that session must continue and its context has grown, run `/context` to identify the cause. At a natural breakpoint, use `/compact` with a focus describing what must survive, for example:

```text
/compact preserve the accepted task outcome, architecture decisions, changed files, verification results, unresolved failures, and remaining work
```

Compaction replaces conversation history with a structured summary; it does not remove static startup content. Root instructions and memory are re-injected, invoked skills may be re-injected within limits, and some path-scoped or nested rules do not return until matching files are read again. After compaction, restate or re-read any critical local constraint before consequential work continues.

Prefer a fresh session over repeated compaction when:

- the task has changed
- earlier attempts are anchoring later answers
- the summary would need to preserve most of the conversation
- independent review is required
- the session repeatedly fills again because of large files or tool output

Use `/clear` or start a new session when continuity is no longer valuable. Do not preserve a long session merely because work began there.

### Separate Implementation From Review

AI-assisted review should not rely only on the same context that produced the change. The implementation conversation contains assumptions, rejected alternatives, and explanations that can bias the reviewer toward defending the result.

For review work, use one of these boundaries:

- a new Claude Code session given the task contract, diff, relevant repository evidence, and expected review output
- a fresh, non-forked review subagent with read-only tools where possible
- an independent human or model review workflow outside the implementation session for consequential changes

A fresh subagent starts with an isolated conversation but still receives applicable Claude configuration and may load repository instructions. Do not use a forked subagent when the purpose is independence, because a fork inherits the parent conversation. Give the reviewer the intended behavior and evidence it needs, but do not supply a narrative designed to justify the implementation.

Ask the reviewer to return findings with severity, evidence, affected behavior, and uncertainty. Verification and correction should then happen in a controlled loop; a second model opinion is not proof by itself.

### Treat Token Consumption As An Engineering Signal

Token awareness matters for cost, latency, rate limits, and reasoning quality. It should guide environment and workflow design rather than encourage engineers to minimize tokens at the expense of missing evidence.

Reduce avoidable consumption by:

- starting fresh sessions for new tasks
- keeping `CLAUDE.md` concise and pointing to authoritative sources
- disabling or narrowing unused skills, plugins, and integrations
- delegating high-volume search, logs, tests, or research to a fresh subagent that returns a concise result
- avoiding large pasted files and repeated tool output when exact search or a smaller artifact is available
- using `/compact` at a meaningful boundary when a coherent session must continue
- choosing model and effort according to task difficulty rather than maximizing them globally
- limiting parallel agents to independent work whose value justifies multiplied token usage

Review `/usage` when cost or rate limits matter. Do not treat lower token consumption as success if accepted quality, verification, or engineer understanding declines.

## Team Discussion Snapshot

For a team harness discussion, ask each engineer to inspect their own environment rather than having one representative describe the team's setup. The minimum snapshot is:

```text
/doctor: warnings understood and owned?
/insights: repeated friction or correction pattern?
/context all in a fresh session: largest and unexpected sources?
Engineer review: which recent tasks required repeated correction, manual work, waiting, or verification?
Session practice: when is a fresh session used instead of continuing?
Review practice: is review independent from implementation context?
Token practice: where is high consumption useful, and where is it avoidable?
```

Discuss the patterns across the delivery unit without publishing personal transcripts or ranking engineers. Convert recurring findings into the appropriate team-owned improvement: repository context, skill routing, deterministic automation, verification, permissions, training, or removal of unused configuration.

For an agent-assisted version of this preparation, **Local Harness Insights And Health Check** defines local analysis, engineer approval, the structured report contract, and health-check use. Raw conversations remain local by default.

## 1. Install the project configuration

Commit this as `.claude/settings.json` **only if the team does not use** Artifacts, Workflows, Remote Control, Claude.ai connectors, or Claude's built-in Git/PR workflow:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "disableArtifact": true,
  "disableWorkflows": true,
  "disableRemoteControl": true,
  "disableClaudeAiConnectors": true,
  "includeGitInstructions": false,
  "permissions": {
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

Delete a line when the team uses that feature:

| Setting | Delete it if the team… |
|---|---|
| `disableArtifact` | Publishes Claude-hosted artifacts |
| `disableWorkflows` | Uses dynamic workflows |
| `disableRemoteControl` | Uses mobile or remote sessions |
| `disableClaudeAiConnectors` | Uses Claude.ai connectors |
| `includeGitInstructions: false` | Wants Claude's built-in commit/PR guidance |

The permission rules are safety controls, not token optimizations. `git push` remains a human approval point, and common secret files are excluded from Claude's file tools.

Do not add these without measurements showing a problem:

```text
disableBundledSkills
ENABLE_TOOL_SEARCH
CLAUDE_CODE_MAX_OUTPUT_TOKENS
MAX_THINKING_TOKENS
MAX_MCP_OUTPUT_TOKENS
TASK_MAX_OUTPUT_LENGTH
skillListingBudgetFraction
skillListingMaxDescChars
```

These settings can remove useful behavior, cause truncation, or create extra turns.

## 2. Add a useful `CLAUDE.md`

Keep it below roughly 100 lines. Use this template:

```markdown
# Repository guide

## Architecture
- `apps/api`: HTTP API
- `apps/web`: browser application
- `packages/domain`: shared business logic

## Commands
- Install: `<command>`
- Unit tests: `<command>`
- Integration tests: `<command>`
- Type check: `<command>`
- Lint: `<command>`

## Rules
- <non-obvious rule that changes implementation decisions>
- <compatibility or security constraint>
- <generated files Claude must not edit>

## Done
- Relevant tests pass.
- Type checking and linting pass.
- Public behavior changes are documented.
- Claude reports anything it could not verify.
```

Do not put style advice Claude can infer, long architecture prose, or step-by-step procedures in `CLAUDE.md`. Link to existing documentation. Put repeated procedures in `.claude/skills/`.

## 3. Give tasks in this format

```text
Outcome:
<What must be true when this is finished?>

Relevant context:
<Packages, files, issue, logs, or documentation>

Constraints:
<Compatibility, security, scope, or behavior that must not change>

Done when:
<Tests and observable evidence required for acceptance>
```

Example:

```text
Outcome:
Prevent duplicate payment creation when callers retry a request.

Relevant context:
- Endpoint: apps/api/src/payments
- Use the existing Redis-backed cache abstraction.

Constraints:
- Do not change the response schema.
- Requests without an idempotency key must behave as before.

Done when:
- Concurrent requests with the same key create one payment.
- Unit and integration tests pass.
- The API documentation describes the header behavior.
```

Do not prescribe implementation steps unless they are actual constraints.

## 4. Pick the model deliberately

- Routine implementation: Sonnet or the account default, normal effort.
- Architecture, difficult debugging, migrations, and security work: use a stronger model or higher effort.
- Mechanical implementation from an approved plan: use an economical model where suitable.
- Consequential changes: request a strong-model review after implementation.

Change the model with `/model` and effort with `/effort`. Do not set maximum effort globally.

## 5. Keep skills only when they earn their context

Use a skill when the team would otherwise paste the same procedure repeatedly.

Check what actually exists:

```text
/skills
/context
```

If `/skills` is empty, do not add `disableBundledSkills` based on somebody else's configuration.

For an installed skill:

- Keep it `on` when Claude should select it automatically.
- Use `user-invocable-only` for deploys, releases, or other human-triggered workflows.
- Use `name-only` when automatic availability matters but its description is large.
- Turn it `off` when nobody uses it.

Example:

```json
{
  "skillOverrides": {
    "deploy-production": "user-invocable-only",
    "obsolete-workflow": "off"
  }
}
```

Review connectors and MCP servers the same way: keep integrations that remove real manual work; remove unused ones.

## 6. End every task with evidence

Claude's final report must include:

```text
Changed:
- <files or behavior changed>

Verified:
- <commands run and results>

Not verified:
- <anything not tested or inspected>

Risks:
- <remaining risk, or "None identified">
```

No task is complete because Claude says the implementation “looks correct.”

## 7. Roll out and check the configuration

After changing `.claude/settings.json`:

```text
/status
/doctor
/permissions
/context
```

Then run one normal team task. Confirm that:

- Required tools still exist.
- Claude can run the normal test workflow.
- It cannot read the denied files.
- `git push` still asks.
- Context is smaller or tool selection is clearer.
- The change did not create more prompts or manual work.

Change one setting at a time. Revert it if the saved context is outweighed by worse execution.

## 8. Review quarterly and after major upgrades

- Remove stale `CLAUDE.md` instructions.
- Move repeated procedures into skills.
- Remove unused skills, connectors, MCP servers, plugins, hooks, and agents.
- Review broad permission allowances.
- Run `/status` and `/doctor`.
- Re-test the baseline workflow.

## References

- [Debug configuration](https://code.claude.com/docs/en/debug-your-config)
- [Context window](https://code.claude.com/docs/en/context-window)
- [Sessions](https://code.claude.com/docs/en/sessions)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Parallel agents and token use](https://code.claude.com/docs/en/agents)
- [Settings](https://code.claude.com/docs/en/settings)
- [Environment variables](https://code.claude.com/docs/en/env-vars)
- [Permissions](https://code.claude.com/docs/en/permissions)
- [Skills](https://code.claude.com/docs/en/slash-commands)
- [Commands](https://code.claude.com/docs/en/commands)

# Claude Code: Engineering Standard

This is the team baseline. If a setting is not listed here, keep Claude Code's default.

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

- [Settings](https://code.claude.com/docs/en/settings)
- [Environment variables](https://code.claude.com/docs/en/env-vars)
- [Permissions](https://code.claude.com/docs/en/permissions)
- [Skills](https://code.claude.com/docs/en/slash-commands)
- [Commands](https://code.claude.com/docs/en/commands)

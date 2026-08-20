---
name: context-review
user-invocable: true
description: Inspect or measure the preserved context of the current Codex, Claude Code, or Pi coding-agent session. Use when a developer invokes context-review, asks what session context an agent used, or requests local context/token statistics. Do not use for general optimization advice, repository documentation review, billing reconciliation, or unrelated exported transcripts.
---

# Context Review

## Overview

Reconstruct a coding agent's context from its local session record or produce deterministic local context measurements. Clearly separate exact persisted content, provider-reported usage, reconstructed evidence, and unavailable provider-side context.

Interactive syntax is `$context-review ...` in Codex and `/context-review ...` in Claude Code and Pi. Codex and Claude use a model-mediated skill turn to start the local parser and, for `--advise`, to produce advice from their current active context. The parser calculates measurements and validates advice deterministically. Pi uses its native command.

## Workflow

1. Confirm that the request concerns the current or an explicitly named Codex, Claude Code, or Pi session.
2. Preserve the complete invocation tail after the skill name. Resolve the directory containing this `SKILL.md`. Unless the invocation tail already contains an explicit `--agent`, Codex **must** use `--agent codex` and Claude Code **must** use `--agent claude`; never leave automatic detection to choose among sessions from multiple harnesses. Pi's native command always inspects its current live session and explicitly rejects user-supplied `--agent` or `--session` overrides.
3. Without `--advise`, run the bundled parser with every supplied argument unchanged:

   ```bash
   node <context-review-skill-directory>/scripts/context-review.mjs --cwd "$PWD" <invocation-tail>
   ```

   For `--stats`, emit parser stdout verbatim as the entire response. Do not summarize, paraphrase, add key takeaways, interpret cache state, or recalculate any value. For `--stats --json`, emit the versioned JSON without a Markdown fence or commentary.
4. For interactive `--stats --advise` in Codex or Claude:
   1. Create operating-system temporary files outside the project for frozen stats and candidate advice.
   2. Run the parser with `--stats --json` and the invocation's session-selection arguments, but without `--advise` or output-file arguments. Save that exact stdout to the frozen-stats file and inspect the same object. Do not rerun measurement after this point.
   3. Read `prompts/advisor.md` and `advisor-output-schema.json` from this skill package.
   4. Using the current active agent context and the complete frozen stats object, produce one candidate JSON object that follows the advisor prompt and schema. Do not recalculate measurements. Write only that object to the candidate file.
   5. Run the separate internal validator `scripts/context-review/advisor-handoff.mjs` with `--agent <harness> --stats-input <frozen-stats-file> --advice-input <candidate-file>`. Forward only the user's `--json`, `--output`, and `--force` output controls. The validator must not reread the live session.
   6. Delete both temporary files and emit validator stdout verbatim. If validation fails, emit the frozen stats plus the validator's advisor limitation; do not repair or substitute the rejected advice.

   Supported user arguments are `--stats`, `--advise`, `--json`, `--full`, `--output`, `--force`, `--session`, `--agent`, `--cwd`, and `--max-chars`. The advisor handoff script and its arguments are an internal skill protocol, not a user command. If Claude Code adds assistant commentary, the expandable Bash result remains canonical.
5. Without `--stats`, use the existing readable context report. Use `--full` only when explicitly requested because transcripts and tool results may contain secrets. Use `--output` only when requested; existing files remain protected unless `--force` was supplied.
6. Report the selected session, evidence scope, compaction and branch boundaries, and limitations. Completion requires every claim to retain the parser's evidence class rather than being presented as a complete provider-request dump.

## Output Format

Return parser stdout verbatim and without introductory or concluding commentary. A stats report contains Session, Active context, Latest provider response usage, Session consumption, Composition, Largest contributors, Measured drivers, and Limitations. With `--advise`, validated Advisor and Advisor overhead sections are added. The existing review report retains Persisted instructions, Messages, Files and tools, Referenced resources, Compaction, Branch summaries, and Unavailable context.

For automation, testing, troubleshooting, or model-free use outside chat:

```bash
node <context-review-skill-directory>/scripts/context-review.mjs --stats --agent <harness> --cwd "$PWD"
```

## Guardrails

- Keep the workflow read-only unless the user explicitly redirects output to a file.
- Do not claim that a transcript is the exact current provider request.
- Deterministic stats never expose raw content. `--advise` is explicit consent for the active model to analyze current context and display task-specific conclusions. The prompt forbids reproducing source bodies, prompts, reasoning, secrets, or raw tool results, and deterministic checks reject recognizable secret forms and multiline/code-block output, but they cannot prove every paraphrase is non-sensitive. Treat advice as having a narrower privacy guarantee than stats and inspect it before sharing.
- Do not infer that a linked file was read without a persisted file-read or tool-call record.
- Do not describe branch summaries as active context or compaction evidence.
- Keep active occupancy, latest response usage, and cumulative session consumption separate.
- Do not present serialized bytes as tokens, cost, or billing precision.
- Treat URL/URI arguments as referenced resources, not local file-access evidence.
- Prefer an explicit `--session` path when multiple active sessions share a working directory.

## Verification

Before finishing, confirm:

- [ ] The selected session belongs to the intended harness and working directory.
- [ ] Exact, provider-reported, reconstructed, and unavailable evidence are distinguished.
- [ ] Normal review/stats arguments reached the parser unchanged; advisor output controls reached the internal handoff validator.
- [ ] Stats contain no raw transcript, arguments, provider payload, or reasoning text; advice passed baseline display-privacy checks and retains the disclosed narrower guarantee.
- [ ] Truncation is visible for the existing review mode.
- [ ] No files were modified unless `--output` was explicitly requested.

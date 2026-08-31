# ai-native-engineering

Minimal source repository for AI harness guidelines, reusable agent skills, Pi extensions, agent definitions, and harness strategy notes for software development.

The repository is intentionally small. Add new guidelines, skills, extensions, agents, and strategy notes only when there is a concrete use case, a clear trigger, and reusable value worth preserving.

## Structure

```text
AGENTS.md                  Shared instructions for Codex-style agents
CLAUDE.md                  Shared instructions for Claude
guidelines/                AI harness, skill, and agent authoring guidelines
strategies/                AI harness adoption and operating-model strategy notes
prompts/                   Reusable opt-in prompts for coding-agent tasks
skills/<skill>/SKILL.md    Reusable skill definitions
pi-extensions/<name>/      Pi coding-agent extensions and specs
.agents/skills/            Codex discovery links to selected repo skills
.claude/skills/            Claude Code discovery links to selected repo skills
scripts/validate-repo.js   Lightweight repository validator
```

## Contents

- `prompts/`: Reusable, harness-neutral prompts loaded explicitly for a task.
- `skills/`: Reusable agent skills with their own usage instructions and supporting files.
- `pi-extensions/`: Pi coding-agent extensions, specs, and package files.
- `strategies/`: Notes on AI-assisted engineering process, metrics, adoption phases, and workshops.

See each folder for the current inventory and detailed usage.

## Choose The Relevant Strategy

| Need | Start here |
| --- | --- |
| Work with agents on a change | [`strategies/ai-assisted-engineering-process.md`](strategies/ai-assisted-engineering-process.md) |
| Build a reusable agent workflow | [`strategies/ai-harness-engineering.md`](strategies/ai-harness-engineering.md) |
| Optimize agent flow and concurrency | [`strategies/agent-pipeline-optimization.md`](strategies/agent-pipeline-optimization.md) |
| Design quality and review controls | [`strategies/ai-assisted-code-quality-control.md`](strategies/ai-assisted-code-quality-control.md) |
| Evaluate a workflow | [`strategies/agent-workflow-evaluation.md`](strategies/agent-workflow-evaluation.md) |
| Delegate asynchronous development | [`strategies/governed-agentic-development.md`](strategies/governed-agentic-development.md) |
| Route context and memory | [`strategies/agent-context-systems.md`](strategies/agent-context-systems.md) |
| Measure organizational outcomes | [`strategies/ai-engineering-metrics.md`](strategies/ai-engineering-metrics.md) |
| Redesign product management | [`strategies/ai-native-product-management.md`](strategies/ai-native-product-management.md) |
| Plan organizational adoption | [`strategies/ai-native-engineering-phases.md`](strategies/ai-native-engineering-phases.md) |

## Principles

- Keep skills and extensions simple, reusable, reliable, and extensible.
- Prefer one canonical source over unnecessary duplication.
- Add tool-specific adapters only when there is a specific need.
- Do not add lifecycle agents, commands, hooks, or integrations without a specific need.

## Research Inbox Workflow

This repo includes a GitHub Actions workflow for scheduled/manual agent-skill research inbox ingestion. Setup and operation notes are in `docs/research-brief-workflow.md`.

## Validation

```bash
node scripts/validate-repo.js
```

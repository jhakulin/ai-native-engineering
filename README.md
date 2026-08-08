# ai-native-engineering

Minimal source repository for AI harness guidelines, reusable agent skills, Pi extensions, agent definitions, and harness strategy notes for software development.

The repository is intentionally small. Add new guidelines, skills, extensions, agents, and strategy notes only when there is a concrete use case, a clear trigger, and reusable value worth preserving.

## Structure

```text
AGENTS.md                  Shared instructions for Codex-style agents
CLAUDE.md                  Shared instructions for Claude
guidelines/                AI harness, skill, and agent authoring guidelines
strategies/                AI harness adoption and operating-model strategy notes
skills/<skill>/SKILL.md    Reusable skill definitions
pi-extensions/<name>/      Pi coding-agent extensions and specs
.agents/skills/            Codex discovery links to selected repo skills
scripts/validate-repo.js   Lightweight repository validator
```

## Contents

- `skills/`: Reusable agent skills with their own usage instructions and supporting files.
- `pi-extensions/`: Pi coding-agent extensions, specs, and package files.
- `strategies/`: Notes on AI-assisted engineering process, metrics, adoption phases, and workshops.

See each folder for the current inventory and detailed usage.

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

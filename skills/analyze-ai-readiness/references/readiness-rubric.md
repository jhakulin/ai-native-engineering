# AI Readiness Rubric

Use this rubric when a scored or detailed assessment is requested. Score each dimension from 0 to 5 only when there is evidence.

## Scoring Scale

- 0: absent or actively misleading
- 1: present but fragmented, stale, or hard for an agent to use
- 2: partially useful with major gaps
- 3: usable for common changes with some manual discovery
- 4: strong, mostly current, and agent-friendly
- 5: excellent, current, navigable, and reinforced by tests/automation
- unknown: not checked or not inferable from available evidence

## Dimensions

### Agent Entrypoints

Check for `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, Cursor rules, constitution files, OpenWiki quickstart, or equivalent.

High scores require:
- A clear first file for agents to read.
- Links to architecture, workflows, tests, conventions, and generated docs.
- Instructions that route agents to context instead of embedding a massive prompt.
- Boundaries around generated docs and source edits.

### Documentation Map

Check whether the repo has a navigable map of existing docs.

High scores require:
- A maintained index or quickstart.
- Clear canonical docs for setup, architecture, operations, testing, and contribution.
- Existing docs summarized and linked instead of duplicated.
- Obsolete docs marked or removed.
- Ownership or update responsibility for important docs is visible where the repo has many docs or agent-facing controls.

### Harness Controls

Check whether the controls around the model are visible, non-duplicative, loaded at the right time, and enforceable where possible.

High scores require:
- Agent-facing rules have one canonical home instead of drifting across several files.
- The target agent or product surface is clear when behavior depends on Codex, Claude Code, Cursor, Copilot, ChatGPT, or API use.
- Specialist context is routed from entrypoints and loaded only when the work needs it.
- Important rules have an owner, update path, or clear source of truth.
- Hard requirements use hard checks such as schemas, CI, tests, permissions, generated-doc freshness checks, or validators instead of only prose reminders.
- Controls are pruned or marked obsolete when newer models, tools, or workflows make them unnecessary.

### Architecture Navigability

Check whether a fresh agent can find the correct code area and understand boundaries.

High scores require:
- Folder structure aligned with domains or services.
- Public interfaces and module boundaries that are easy to identify.
- Domain concepts and data models documented.
- Integration points and ownership boundaries visible.
- Minimal hidden conventions.
- Maintained structural maps, code indexes, or repository knowledge graphs where raw code is hard to navigate.
- Source traceability, freshness, and confidence labels for generated or graph-backed navigation aids.

### Change Workflows

Check whether docs explain how to make common changes.

High scores require:
- Common tasks documented by area.
- "Before changing X, read Y" guidance.
- Migration, schema, API, UI, and integration workflows documented where relevant.
- Review and release expectations clear.

### Feedback Loops

Check whether agents can quickly verify changes.

High scores require:
- Setup, lint, typecheck, test, build, and run commands documented.
- Scoped test commands for major areas.
- Expected local services and env placeholders documented without secrets.
- CI checks visible and aligned with local commands.
- Objective delivery requirements are covered by executable checks where practical.

### Staleness and Conflict Control

Check how docs stay accurate.

High scores require:
- Generated docs or docs automation when useful.
- Generated repository maps, code indexes, or knowledge graphs have an explicit update workflow and visible source state when they are used.
- Update workflow such as OpenWiki CI, docs checks, or ownership expectations.
- Recent docs aligned with current code/config.
- Clear handling of conflicts between old docs and source.

## Readiness Bands

Use the average of known dimension scores only as a rough guide:

- 0.0-1.4: Not AI-ready. Agents will rely on raw exploration and likely miss context.
- 1.5-2.4: Low readiness. Some context exists, but gaps make changes risky.
- 2.5-3.4: Moderate readiness. Agents can handle common work with supervision.
- 3.5-4.4: Strong readiness. Agents have clear routes and feedback for most changes.
- 4.5-5.0: Excellent readiness. The repo is designed for fast agent onboarding and bounded changes.

## High-Leverage Fix Patterns

Prefer recommendations in this order:

1. Create or fix the agent entrypoint (`AGENTS.md`, OpenWiki quickstart, or equivalent).
2. Add a doc map that points to canonical docs and marks stale ones.
3. Consolidate duplicated agent rules into one home with an owner and clear load timing.
4. Document architecture/domain boundaries and common change paths.
5. Document fast verification commands and scoped tests.
6. Convert objective prose requirements into schemas, CI checks, tests, permissions, or validators where practical.
7. Add or update generated docs automation if docs are large or scattered.
8. Add deeper module/interface documentation only where raw code is hard to navigate.

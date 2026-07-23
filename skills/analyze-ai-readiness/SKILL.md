---
name: analyze-ai-readiness
description: Use this skill when assessing a code repository's readiness for AI coding agents, especially requests about repo documentation quality, AGENTS.md/CLAUDE.md/constitution guidance, OpenWiki or generated docs, architecture navigability, test feedback loops, onboarding context, stale docs, or gaps that make agentic coding unreliable. Do not use for ordinary code review, security audit, performance review, or product strategy unless the user explicitly frames the task as AI-agent/codebase readiness.
---

# Analyze AI Readiness

## Overview

Assess whether a repository gives AI coding agents enough accurate, navigable, and testable context to make bounded code changes safely. Produce a concise readiness report with evidence, gaps, risks, and prioritized improvements.

## Workflow

1. Establish scope.
   - Identify the repository root, requested depth, target agent or product surface if relevant, and whether the user wants a report only or direct documentation changes.
   - If the repo path or output mode is unclear and cannot be inferred from the current workspace, ask one concise question.
   - Completion criterion: the target repo, deliverable, and any target harness surface such as Codex, Claude Code, Cursor, Copilot, ChatGPT, or API use are known or marked unspecified.

2. Read repository guidance before judging readiness.
   - Inspect root guidance files such as `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.cursor/rules/*`, `.github/copilot-instructions.md`, constitution files, and generated documentation entrypoints such as `openwiki/quickstart.md`.
   - Inspect `README*`, `docs/`, runbooks, architecture docs, contributing docs, test docs, and package/build config.
   - Use targeted search (`rg --files`, `rg`) and avoid exhaustive source reads unless the repo is small.
   - Completion criterion: agent-facing instructions, human docs, and primary entrypoints are identified or confirmed absent.

3. Build a documentation and context map.
   - List the current agent entrypoints and where they point.
   - Identify canonical docs, duplicated docs, stale-looking docs, missing docs, and docs that conflict with source or build/test config.
   - Map important harness controls where visible: where each instruction or rule lives, when it loads, what job it does, who owns or maintains it, whether evidence shows it still helps, and what risk it creates if misused.
   - Distinguish soft instructions from enforceable controls such as schemas, CI checks, tests, permissions, generated-doc update jobs, or validators.
   - Check whether a future agent can answer: where to start, how the system is structured, how to run tests, how to make common changes, and what not to touch.
   - Completion criterion: the main context sources, duplicated controls, load-timing issues, and gaps are known with file evidence.

4. Assess codebase navigability for agents.
   - Inspect top-level layout, major modules, boundaries, imports where useful, API/domain entrypoints, data/schema locations, integrations, and tests.
   - Evaluate whether the filesystem reflects domain boundaries and whether public interfaces are discoverable.
   - If the repository uses generated docs, code indexes, repository maps, or knowledge graph tools, check whether they identify source files, symbols, dependencies, owners, freshness, and confidence. Treat them as navigation aids; confirm important claims against source code, tests, or authoritative docs.
   - Look for shallow-module sprawl, hidden conventions, missing domain maps, and unclear ownership boundaries.
   - Completion criterion: the report can explain how easy or hard it is for a fresh agent to find the right code area and which generated or graph-backed context is trustworthy enough to use.

5. Assess feedback loops.
   - Identify documented and actual commands for setup, lint, typecheck, unit tests, integration tests, e2e tests, builds, migrations, and local services.
   - Note whether commands are easy to run, scoped by area, and documented near the relevant workflows.
   - Identify hard requirements that are only stated as prose but could be enforced mechanically.
   - Completion criterion: the agent's fastest useful verification path and enforceable-check coverage are known, or their absence is explicit.

6. Score and prioritize using the rubric.
   - Read `references/readiness-rubric.md` before producing the default scored assessment or when the request asks for detailed criteria.
   - Score only dimensions supported by evidence; mark unknowns instead of guessing.
   - Prioritize fixes that improve agent navigation, context accuracy, bounded change-making, and feedback speed.
   - Completion criterion: each score and recommendation is traceable to inspected files or explicit absence.

7. Produce the requested output.
   - For a report, use the output format below.
   - For direct documentation changes, make the smallest useful edits and report changed files plus remaining gaps.
   - Completion criterion: the user receives a decision-ready assessment or completed doc changes.

## Output Format

For assessments, use:

```markdown
# AI Readiness Assessment: [repo/name]

## Summary
[2-4 sentence verdict with overall readiness and biggest constraint.]

## Scorecard
| Dimension | Score | Evidence | Main Gap |
| --- | ---: | --- | --- |
| Agent entrypoints | [0-5/unknown] | [files] | [gap] |
| Documentation map | [0-5/unknown] | [files] | [gap] |
| Harness controls | [0-5/unknown] | [files/checks] | [gap] |
| Architecture navigability | [0-5/unknown] | [files] | [gap] |
| Change workflows | [0-5/unknown] | [files] | [gap] |
| Feedback loops | [0-5/unknown] | [files] | [gap] |
| Staleness/conflict control | [0-5/unknown] | [files] | [gap] |

## Findings
- [Severity] [Finding]: [evidence-backed explanation]

## Recommended Fixes
1. [Highest-leverage action, with target file/doc]
2. [Next action]
3. [Next action]

## Evidence Checked
- [Files, directories, commands, or searches inspected]

## Unknowns / Limits
- [Anything not checked or not inferable]
```

Use severity labels `High`, `Medium`, and `Low`. Keep findings focused on AI-readiness effects, not general polish.

## Guardrails

- Do not claim a doc is stale without source, config, or Git evidence; say "appears stale" and explain why.
- Do not read or print secret values from `.env`, credentials, private keys, or token files.
- Do not treat generated docs as authoritative when source/config contradicts them.
- Do not treat generated repository maps, code indexes, or knowledge graphs as authoritative when source code, tests, config, or maintained docs contradict them.
- Do not recommend large documentation rewrites before identifying entrypoint, navigation, and verification gaps.
- Do not make source-code changes unless the user explicitly asks.
- Ask for approval before running networked tools, installing dependencies, or modifying files outside the workspace.

## Verification

Before finishing, confirm:

- [ ] Repository guidance and documentation entrypoints were checked or confirmed absent.
- [ ] Existing docs were mapped before assessing gaps.
- [ ] Harness controls were mapped for location, load timing, ownership, duplication, and enforceability where visible.
- [ ] Architecture navigability was assessed from actual repository structure, not only docs.
- [ ] Feedback-loop commands and mechanically enforceable checks were identified from docs/config or marked unknown.
- [ ] Scores and findings cite evidence.
- [ ] Recommendations are prioritized and actionable.
- [ ] Assumptions, unknowns, and skipped checks are visible.

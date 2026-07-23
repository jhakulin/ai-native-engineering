# Graph-Assisted Code Review

## Purpose

This document describes how to use repository graph context during code review.

The goal is to review the real impact of a change, not only the visible diff. A pull request can look small while touching a function, setting, interface, project file, or shared utility that many flows depend on.

Graph-assisted review helps reviewers ask:

> What can this change break?

It does not replace human review, tests, or source inspection. It gives the reviewer a better map for finding risk.

For the broader harness strategy, see `strategies/repository-knowledge-graphs.md`.

## Core Idea

Traditional review often starts with changed files. Graph-assisted review starts with changed relationships.

A graph can show:

- direct callers and callees
- imports and dependents
- related tests
- shared utilities
- user flows
- high-degree nodes
- bridge nodes between modules
- configuration or project-file relationships
- documentation linked to the changed area

This lets the reviewer move from generic feedback to specific risk analysis.

## Use When

Use graph-assisted review when:

- the change touches shared code
- the change modifies a high-degree or bridge node
- the change affects configuration, build, project, dependency, or generated files
- the repository is unfamiliar to the reviewer
- the changed files do not reveal the full user flow
- tests are sparse or hard to map to behavior
- the PR is small but the affected area is critical
- an agent produced the change and needs stronger review evidence

Do not use it as a heavy default for every trivial change. A small isolated edit with clear tests may not need graph analysis.

## Required Inputs

A useful graph-assisted review needs:

- the changed files or diff
- the target branch or repository state
- graph context that matches the reviewed state
- relevant source files
- relevant tests or test commands
- repository instructions and review expectations
- any user-facing flows or operational constraints affected by the change

If graph context is stale, unavailable, or clearly incomplete, say so and fall back to ordinary review.

## Review Context Slice

Before giving merge guidance, produce a bounded review context slice tied to the reviewed repository state. Include:

- the source commit or ref represented by the graph
- changed files or symbols and the direct and indirect relationships considered
- evidence paths, extraction methods, and confidence for important edges
- ranked related tests, documentation, owners, configuration, and public contracts
- freshness, indexing coverage, unsupported files, and any unresolved relationships

Keep the slice small enough to inspect alongside the diff. It should explain why each item was included and point to source evidence. If the graph does not match the review state or an incremental update is incomplete, mark the slice stale or incomplete and fall back to ordinary source-first review instead of treating missing edges as proof of no impact.

## Review Workflow

### 1. Confirm Scope And Freshness

Identify what changed and confirm the graph represents the same repository state.

Check whether uncommitted changes, generated files, renamed files, and project metadata are included. If the graph is stale, update it or avoid relying on it.

### 2. Map Direct Impact

Find the files, functions, classes, interfaces, or configuration entries directly connected to the changed code.

Ask:

- What calls this?
- What does this call?
- What imports or references this?
- What tests directly cover this?
- What documentation describes this behavior?

Direct impact is the easy part. It establishes the starting map.

### 3. Map Indirect Impact

Follow relationships beyond the immediate changed files.

Ask:

- Which user flows pass through this area?
- Which modules depend on this behavior indirectly?
- Is this node a hub or bridge?
- Are there surprising dependencies?
- Could the change affect runtime behavior outside the touched files?
- Could configuration, build, or generated project metadata change behavior?

Indirect impact is where many review misses live.

Use the graph query that fits the review question:

| Review question | Useful graph query | Review use |
| --- | --- | --- |
| What can this change break immediately? | Direct callers, callees, imports, dependents, and direct tests | Establish direct impact |
| Why could this changed node affect a distant flow? | Shortest path or k-shortest paths | Explain the relationship path to inspect |
| Which related files or tests deserve attention first? | Personalized PageRank or weighted neighborhood ranking from changed nodes | Prioritize source inspection and test targeting |
| Did this change introduce or modify a risky shape? | Subgraph matching | Find architecture patterns, anti-patterns, security-sensitive flows, or repeated dependency shapes |
| Which path has risk but no proof? | Path query plus test edges | Identify missing verification near important relationships |

### 4. Map Test Impact

Use the graph to find existing tests and missing test coverage.

Ask:

- Which tests cover the changed behavior?
- Which tests cover adjacent flows?
- Which tests should be updated?
- Which important path has no test?
- Which verification command gives the fastest useful proof?

Missing tests near high-impact graph paths are review signals, not just cleanup opportunities.

### 5. Inspect Source Evidence

Read the source files and tests identified by the graph.

The graph can point to a risk, but the review should confirm it in code, test behavior, configuration, logs, traces, or runtime output. Do not report graph-derived claims as certain unless they are verified.

### 6. Produce Merge Guidance

End with a concrete review outcome.

Useful outcomes include:

- safe to merge after named checks
- needs targeted tests
- needs source inspection in named files
- needs smaller PR split
- needs design clarification
- blocked by stale or missing graph context
- high risk until a specific flow is verified

Merge guidance should explain the risk, the affected area, and the proof needed.

## Review Output Format

Use a compact structure:

```md
## Graph-Assisted Review

### Direct Impact
- [Changed node or file]: [direct callers, callees, imports, or tests]

### Indirect Impact
- [Flow or dependent area]: [why it may be affected]

### Test Impact
- Existing tests: [tests or unknown]
- Missing tests: [gaps]
- Suggested verification: [commands or manual checks]

### Merge Guidance
[safe / needs changes / needs verification / high risk], because [reason].

### Limits
- [Graph freshness, unsupported files, or unverified claims]
```

Keep the output tied to evidence. Avoid long generic review commentary.

## Risk Signals

Treat these as reasons to slow down:

- a small diff touches a high-degree node
- a shared interface changes
- a bridge node changes
- a flow has indirect dependencies but no tests
- project or build metadata changes
- generated files and source files disagree
- documentation claims do not match graph paths
- an agent edited files outside the expected area
- the graph and source code disagree

The reviewer should not accept the graph blindly. Disagreement between graph output and source inspection is itself useful evidence.

## Prompt Pattern

When asking an agent for graph-assisted review, use a specific prompt:

```text
Review this change with graph-assisted impact analysis.

Inputs:
- Changed files or diff: [path or summary]
- Graph context: [available graph output or tool]
- Relevant repository instructions: [files]

Analyze:
- direct impact
- indirect impact
- affected flows
- related tests
- missing tests
- merge safety

Verify important graph claims against source files before making recommendations.
Return direct impact, indirect impact, test impact, merge guidance, and limits.
```

## Relationship To Skills

This workflow can become a reusable skill when the repository has a stable way to provide graph context to agents.

A future skill should define:

- trigger: graph-aware review, blast-radius review, impact analysis, merge safety
- inputs: diff, graph output or graph tool, repository instructions, tests
- outputs: direct impact, indirect impact, test impact, merge guidance, limits
- guardrails: stale graph handling, source verification, no merge approval
- verification: named source files and checks inspected

Do not create a tool-specific skill until the graph source and workflow are stable enough to test.

## Anti-Patterns

### Asking For Generic Review

Generic prompts often produce generic comments. Ask for direct impact, indirect impact, tests, and merge safety.

### Reporting Graph Output Without Verification

Graph output should guide inspection. Important claims still need source or test evidence.

### Treating Every Connection As Equal

Not every edge is high risk. Prioritize high-degree nodes, bridge nodes, critical flows, missing tests, and changed public contracts.

### Letting The Graph Hide Scope Creep

Graph analysis can reveal broad impact, but it should not turn a small PR into an unrelated refactor.

## Summary

Graph-assisted code review uses repository structure to find risk around a diff. It is strongest for blast-radius analysis, test targeting, and merge-safety recommendations.

Use it to ask better review questions, then verify the answers with source, tests, and human judgment.

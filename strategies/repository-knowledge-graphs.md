# Repository Knowledge Graphs

## Purpose

This document describes how repository knowledge graphs can support AI-assisted software engineering.

A repository knowledge graph is a structured map of code, documentation, tests, dependencies, and relationships. It helps humans and agents navigate a codebase by following connections instead of relying only on keyword search, file-by-file reading, or raw context-window loading.

The goal is not to adopt graph tooling for its own sake. The goal is to make repository context easier to route, inspect, update, and verify when ordinary search is not enough.

## Core Idea

Software repositories are not flat text collections. They contain connected systems:

- files import other files
- functions call other functions
- classes implement interfaces
- services depend on shared utilities
- tests cover specific behaviors
- documentation describes intended boundaries
- configuration and project files influence runtime behavior

An agent that only reads the changed files or searches for matching words can miss indirect risk. A graph gives the agent a map of relationships so it can ask better questions:

- Where is this symbol used?
- Which flows pass through this node?
- Which tests are near this behavior?
- Which modules depend on this interface?
- Is this node a leaf, a hub, or a bridge between areas?
- Which documentation or conventions describe this part of the system?

The graph is context for navigation and review. The source code, tests, and human decisions remain the source of truth.

## When Repository Graphs Help

Repository graphs are most useful when the codebase is large enough that manual exploration is slow, or when the risk of missing indirect relationships is high.

Good use cases include:

- onboarding to an unfamiliar codebase
- architecture discovery
- tracing a user flow or data flow across files
- identifying direct and indirect impact of a change
- finding high-degree or bridge nodes that deserve careful review
- targeting tests after a change
- reducing repeated broad file reads across agent sessions
- comparing documentation claims with actual code relationships

Repository graphs are less useful when:

- the repository is small enough to inspect directly
- the task touches an isolated file with obvious tests
- graph data is stale or incomplete
- the graph cannot explain how it derived an edge
- the team cannot verify graph-backed claims against source code
- the graph adds more operational burden than navigation value

## Useful Graph Concepts

The exact graph model depends on the tool, language, and repository. The useful concepts are stable.

Nodes represent things worth finding or reasoning about, such as:

- files
- modules
- packages
- functions
- classes
- interfaces
- tests
- configuration entries
- documentation sections
- concepts or domain terms

Edges represent relationships, such as:

- imports
- calls
- references
- implements
- depends on
- reads from
- writes to
- tested by
- documented by
- configured by

Communities or clusters group related nodes. They can reveal modules, features, layers, or accidental coupling.

Degree describes how connected a node is. High-degree nodes and bridge nodes deserve more careful change planning because a small edit can affect many paths.

Paths show how behavior flows through the system. A path can be more useful than a search result because it explains the route between entrypoint, logic, persistence, UI, tests, and configuration.

## Graph Construction Quality

Repository graphs are only useful when the graph model is intentional. Avoid extracting loose subject-predicate-object triples from files and docs without a schema; that usually creates ambiguous nodes, duplicate concepts, and edges that are hard to query.

Before building or adopting a repository graph, define:

- node types, such as file, module, package, function, class, interface, test, configuration entry, documentation section, service, API, domain concept, and team
- edge types, such as imports, calls, references, implements, depends on, reads from, writes to, tested by, documented by, configured by, owns, and deploys
- canonical identifiers for symbols, files, packages, services, repositories, and teams
- alias and rename handling for files, symbols, services, package names, generated symbols, and domain terms
- normalization rules for paths, case, language-specific symbol names, generated code, vendored code, and test naming
- extraction rules that say which source system is allowed to create or update each relationship type

Use AI and embeddings to help resolve messy names, docs, aliases, and natural-language concepts, but do not let fuzzy matching silently create authoritative relationships. Entity resolution should happen before creating new nodes when the graph may already contain the same concept under another name.

Useful quality checks include:

- seeded examples for known aliases, renamed files, and overloaded terms
- duplicate-node reports for symbols, services, packages, and domain concepts
- edge validation against source code, project files, tests, or maintained docs
- confidence labels for inferred, semantic, or LLM-produced relationships
- examples of relationships the extractor must not create

## Evidence And Confidence

A useful repository graph distinguishes how each relationship was created.

Stronger evidence includes relationships extracted directly from source code, project files, test references, API definitions, or runtime traces. Weaker evidence includes semantic similarity, inferred domain links, generated summaries, and relationships produced by an LLM over unstructured material.

Graph output should make that distinction visible. At minimum, graph-backed context should identify:

- source path or source system
- relation type
- extraction method
- graph generation time or source commit
- whether the relation is extracted, inferred, ambiguous, or manually declared

This matters because agents can use inferred links for exploration, but they should not treat them as proof. Important claims still need source, test, configuration, runtime, or maintained documentation evidence.

## Evaluate Tool And Benchmark Claims

Repository-graph tools may report token savings, latency, language coverage, or impact accuracy. Treat those numbers as tool-specific claims until they are reproduced on representative repositories and tasks. A useful evaluation compares graph-assisted and source-first baselines on fixed repository states and records:

- the repository commit, indexed-file coverage, parser support, and update state
- the same review, debugging, onboarding, or planning questions in both baselines
- context size, latency, setup and refresh cost, and human correction effort
- relevant callers, tests, paths, or risks found and missed, verified against source, tests, configuration, or runtime evidence
- false positives, stale or unsupported areas, and unresolved relationships

A smaller context is not an improvement if it omits a relevant caller, test, contract, or configuration path. Token reduction is a useful secondary measure; correctness, coverage, explainability, and maintenance cost decide whether the graph earns a place in the workflow.

## Change-Aligned Graph Context

For a concrete task or pull request, prefer a bounded graph slice over a full graph dump. A useful slice records:

- the reviewed repository state, including branch or ref and source commit
- changed nodes and the direct or indirect paths that may be affected
- the evidence path, extraction method, and confidence for each included relationship
- related tests, documentation, owners, configuration, and unsupported areas
- graph generation or update time and whether all changed files were indexed

Incremental updates are useful only when the slice makes clear which affected relationships were refreshed and which remain unchanged or unknown. If the source state, graph state, or extraction coverage does not match, label the context stale or incomplete and fall back to source-first inspection. A change-aligned slice is a review and navigation aid, not a replacement for source, tests, configuration, or human decisions.

## Harness Integration

In an AI harness, a repository graph is one context source among many.

It can complement:

- `AGENTS.md` and tool-specific instructions
- architecture docs
- skills and commands
- test output
- pull request diffs
- static analysis
- search results
- implementation plans
- review reports

The harness should route graph context deliberately. Avoid dumping a large graph into every task. Prefer targeted graph queries that answer the current question, then verify important claims against source files and tests.

Useful integration patterns include:

- graph-backed onboarding summaries
- graph queries during planning
- graph-assisted impact review before merge
- graph-based test targeting
- graph snapshots as review artifacts
- persistent graph services for large repositories

Do not make the graph an invisible authority. Agents should say when they used graph context and which claims still require source or test confirmation.

Useful agent query patterns include:

- find direct callers, callees, imports, and dependents for a changed symbol
- find tests and docs linked to a behavior
- trace paths from entrypoints to persistence, APIs, queues, or UI surfaces
- identify high-degree nodes and bridge nodes before risky edits
- compare declared dependencies with observed or source-extracted relationships
- ask for the smallest source set needed to verify a graph-backed answer

Useful graph query patterns include:

- direct neighbors for immediate impact around a changed file, symbol, configuration entry, or test
- shortest path when the agent needs to explain why two nodes may be related
- k-shortest or weighted paths when several plausible routes could explain a dependency or failure
- personalized PageRank or another relevance-ranking algorithm when the agent needs the most important nearby files, tests, docs, or owners around a starting node
- subgraph matching when the task is to find a code shape, architecture pattern, anti-pattern, security pattern, transaction flow, or dependency shape without knowing exact names up front

Pick the query pattern from the question. Do not run graph algorithms only because they are available.

| Question | Useful graph pattern | Practical output |
| --- | --- | --- |
| What directly uses this changed symbol? | Direct neighbors | Callers, callees, imports, dependents, direct tests |
| Why might this change affect that behavior? | Shortest path or k-shortest paths | Relationship path with files to inspect |
| Which nearby context matters most? | Personalized PageRank or weighted neighborhood ranking | Ranked files, tests, docs, and owners |
| Where else does this architecture shape appear? | Subgraph matching | Matching code regions or pattern instances |
| Which tests should run first? | Related tests plus impact ranking | Fast verification list with rationale |

## Freshness And Trust

A repository graph can become misleading when it is stale, partial, or generated from the wrong branch.

Before relying on graph output, confirm:

- which repository state the graph represents
- whether uncommitted changes are included
- whether generated files, vendored code, secrets, and build artifacts are excluded appropriately
- whether the language parser covers the relevant files
- whether documentation and tests are included intentionally
- when the graph was last updated
- whether the graph can be regenerated or incrementally updated

Treat graph output as navigational evidence. For any important change, validate the path by reading source files, running tests, checking configuration, or inspecting runtime behavior.

## Operating Workflow

A practical graph-backed workflow has six steps.

1. Define the question.
   - Examples: understand a subsystem, trace a flow, assess change risk, find tests, or review a PR.
2. Confirm graph freshness.
   - Check that the graph matches the relevant branch and includes the changed files.
3. Query the graph narrowly.
   - Ask for direct relationships, indirect relationships, paths, high-degree nodes, related tests, and documentation links.
4. Inspect source evidence.
   - Read the relevant files and tests that the graph identifies.
5. Produce an artifact.
   - Record the useful map, affected areas, risks, and verification plan.
6. Update or discard the graph context.
   - Refresh the graph after meaningful changes, or mark graph output as stale.

## Tooling And Runtime Choices

Repository graph tooling can be local, hosted, ephemeral, or persistent.

Local tools are useful when privacy and fast experimentation matter. They should make credential handling, ignored paths, and generated output explicit.

Persistent services are useful for large repositories or repeated agent sessions. They reduce repeated indexing and cold-start cost, but they introduce lifecycle questions: owner, storage, permissions, update triggers, monitoring, and retirement.

Ephemeral graph queries are useful for small or occasional tasks. They avoid service ownership but may repeat indexing work and hide performance costs inside each task.

The right runtime depends on repository size, query frequency, privacy constraints, team workflow, and the cost of stale context.

## Documentation And Skill Boundaries

Use documentation when the team needs shared principles, adoption guidance, and review expectations.

Use a skill when an agent needs a repeatable workflow, such as graph-assisted impact review, and the trigger, inputs, outputs, and verification can be defined clearly.

Use a command or script when the graph build, update, or query behavior must be deterministic.

Use an integration or persistent service only after a real workflow proves that graph context provides enough value to justify ownership and maintenance.

For review-specific workflow guidance, see `strategies/graph-assisted-code-review.md`.

## Anti-Patterns

### Treating The Graph As The Source Of Truth

The graph is a map. The code, tests, configuration, and human intent remain authoritative.

### Optimizing Only For Token Savings

Token reduction can be useful, but the stronger value is better navigation, fewer wrong reads, clearer impact analysis, and better verification.

### Building A Graph Without A Workflow

A graph that is not used in planning, review, testing, or onboarding becomes another artifact to maintain.

### Ignoring Staleness

A stale graph can make an agent confidently wrong. Freshness should be visible before graph-backed recommendations are accepted.

### Adding Tooling Before The Need Is Clear

Do not add graph adapters, hooks, services, or generated metadata until a specific recurring workflow justifies them.

## Adoption Levels

Level 0: No graph. Agents use repository docs, search, and source reads.

Level 1: Manual graph aid. Humans or agents generate graph output for occasional onboarding or architecture discovery.

Level 2: Review aid. Teams use graph queries for risky changes, impact analysis, and test targeting.

Level 3: Shared workflow. Graph-backed review or onboarding becomes a documented skill, command, or team practice.

Level 4: Managed service. A persistent graph service supports repeated agent workflows with owners, permissions, update rules, and validation.

Move up only when the previous level has shown useful results and manageable risk.

## Summary

Repository knowledge graphs are a context-routing tool for AI-assisted engineering. They help agents and humans reason about relationships that are hard to see from a diff or keyword search alone.

Use them where structure matters: onboarding, architecture discovery, impact analysis, and review. Keep them fresh, verify important claims against source and tests, and preserve the smallest workflow that produces durable value.

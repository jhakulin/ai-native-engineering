# Practical Repository Graph Experiments

These experiments are for teams that do not yet know whether repository graphs are worth adopting. Each experiment should be small enough to run by hand or with simple scripts before choosing a graph database, persistent service, or agent integration.

The goal is to learn whether graph structure helps a real repository task, not to build a complete platform.

## Minimum Setup

Start with one medium-size repository and one real workflow. Good first choices are:

- a bug where the failing behavior is not in the same file as the recent change
- a pull request that touches shared code, configuration, tests, or a public interface
- a subsystem that a new agent or developer often struggles to navigate

Create a small graph from only the files needed for the experiment. A spreadsheet, JSON file, SQLite table, or markdown table is enough.

Minimum node fields:

| Field | Example | Notes |
| --- | --- | --- |
| `id` | `src/cart/Basket.ts#Basket` | Stable enough to reference in notes |
| `type` | `file`, `class`, `function`, `test`, `config`, `doc` | Keep the type list short |
| `name` | `Basket` | Human-readable label |
| `path` | `src/cart/Basket.ts` | Source path or doc path |
| `evidence` | `source`, `test`, `doc`, `manual`, `inferred` | How the node was identified |

Minimum edge fields:

| Field | Example | Notes |
| --- | --- | --- |
| `from` | `src/cart/Basket.ts#Basket` | Existing node id |
| `relationship` | `calls`, `imports`, `tested_by`, `configured_by`, `documents` | Use precise verbs |
| `to` | `tests/cart/Basket.test.ts` | Existing node id |
| `evidence_path` | `src/cart/Basket.ts` | File or source that proves the edge |
| `confidence` | `extracted`, `manual`, `inferred` | Keep inferred edges out of final proof until verified |

For a first run, build the graph manually from 10-40 nodes. If that already feels too expensive for the value returned, stop before adding tooling.

## Experiment 1: Shortest-Path Debug Context

Use this when a change in one place may explain a failure somewhere else.

Example question:

```text
Checkout started failing after a basket constructor change. What files should the agent inspect first?
```

### Build The Small Graph

1. Pick two known endpoints:
   - start node: the changed file, function, class, or config entry
   - end node: the failing test, route, command, UI flow, or erroring component
2. Add direct edges from the start node:
   - imports
   - calls
   - implements
   - configured by
   - tested by
3. Add direct edges into the end node:
   - test covers source file
   - route calls controller
   - command calls handler
   - config points to service
4. Add one layer of intermediate edges only where needed to connect the two sides.
5. Mark every edge as `extracted`, `manual`, or `inferred`.

### Run The Baseline

Ask an agent to debug the issue without graph context. Record:

- files it inspected
- search commands or tool calls it used
- whether it found a plausible path from change to failure
- whether the final explanation was source-backed

### Run With Graph Context

Give the agent:

- the start node
- the end node
- the shortest path or 2-3 shortest candidate paths
- the source files that prove each edge

Ask it to inspect only the path files first, then expand if needed.

Expected output:

```md
## Debug Path
- Start: [changed node]
- End: [failing behavior]
- Path: [node] -> [relationship] -> [node] -> ...

## Files To Inspect First
1. [file]: [why this file is on the path]
2. [file]: [why this file is on the path]

## Verification
- [test or command]
- [manual check if needed]

## Limits
- [inferred or unverified edges]
```

### Pass Criteria

Continue this idea only if the graph-backed run:

- reduces broad search or file reads
- identifies at least one useful intermediate file the baseline missed
- produces a path that can be verified in source code

Stop if the graph mostly repeats what keyword search or stack traces already show.

## Experiment 2: Impact Ranking For Review

Use this when a pull request touches a shared node and the reviewer needs to know what to inspect first.

Example question:

```text
This PR changes a shared pricing helper. Which related files, tests, docs, and owners matter most for review?
```

### Build The Small Graph

1. Create nodes for changed files and changed symbols.
2. Add direct callers, importers, tests, docs, configs, and owners.
3. Add one more layer for high-risk relationships:
   - public API callers
   - UI routes
   - scheduled jobs
   - migration or schema files
   - generated files
4. Add simple weights:
   - `5` for direct tests or public API callers
   - `4` for owners, configs, schema, migrations, or generated files
   - `3` for direct callers/importers
   - `2` for docs
   - `1` for inferred semantic links

You do not need real Personalized PageRank for the first experiment. A weighted neighborhood score is enough:

```text
score(node) = edge_weight + bonus_if_node_is_test + bonus_if_node_is_public_contract
```

If the simple scoring is useful, test a real graph ranking algorithm later.

### Run The Review

Ask the reviewer or agent to compare:

- normal review starting from the diff
- graph-ranked review starting from the top 5-10 related nodes

Expected output:

```md
## Ranked Review Targets
| Rank | Node | Why It Matters | Evidence | Inspect? |
| ---: | --- | --- | --- | --- |
| 1 | [file or symbol] | [risk] | [edge/source] | yes/no |

## Test Targets
- [test]: [relationship to changed node]

## Review Decision
[safe after checks / needs tests / needs source inspection / high risk]
```

### Pass Criteria

Continue this idea only if the ranked list:

- surfaces tests or dependent files the reviewer agrees are relevant
- helps choose verification commands faster
- does not bury obvious direct tests or owners below weak inferred links

Stop if the ranking is mostly obvious, noisy, or hard to explain.

## Experiment 3: Subgraph Pattern Search

Use this when the team wants to find a shape in the code without knowing exact names.

Good first pattern:

```text
Find wrappers/decorators:
- class A implements interface I
- class B implements interface I
- class B depends on or calls class A
```

This pattern is practical because it can reveal caches, logging wrappers, adapters, permission wrappers, or duplicate implementations.

### Build The Small Graph

Create nodes and edges for one language or package only:

- class nodes
- interface nodes
- `implements` edges
- constructor dependency edges
- method call edges
- file path evidence for each edge

Do not include the whole repository. Pick one package where the pattern likely exists.

### Run The Pattern Search Manually First

Before writing a query engine, search manually or with simple scripts:

1. List interfaces.
2. List classes implementing each interface.
3. For each pair of classes implementing the same interface, check whether one imports, depends on, wraps, or calls the other.
4. Record matches and non-matches.

Expected output:

```md
## Pattern: Wrapper Or Decorator

### Match
- Interface: [interface]
- Wrapped class: [class]
- Wrapper class: [class]
- Evidence:
  - [file]: implements [interface]
  - [file]: depends on or calls [wrapped class]

### Review Use
[why this pattern matters for architecture, caching, permissions, logging, or risk]
```

### Pass Criteria

Continue this idea only if:

- the pattern finds useful examples without knowing exact names
- the result changes review, refactoring, or documentation decisions
- the false positives can be reduced with clearer node or edge types

Stop if the pattern needs so much manual interpretation that a normal code search is faster.

## Experiment 4: Entity Resolution Quality

Use this before trusting a graph built from mixed sources such as code, docs, generated summaries, product terms, and issue text.

Example problem:

```text
The graph has separate nodes for Billing API, billing-api, billing_service, and packages/billing/api.
Are these the same component or different concepts?
```

### Build A Seed Set

Create 20-50 known identity cases:

- renamed files
- old and new package names
- service aliases
- generated symbol names
- test names that refer to source behavior
- product terms that map to engineering components
- terms that look similar but must stay separate

Example table:

| Term A | Term B | Expected | Evidence |
| --- | --- | --- | --- |
| `billing-api` | `Billing API` | same | catalog owner record |
| `Invoice Export` | `invoice-worker` | related, not same | capability implemented by component |
| `AuthToken` | `AccessToken` | different | source type definitions |

### Test Resolution Rules

Start with deterministic rules before embeddings:

1. Normalize case, separators, and path prefixes.
2. Match exact repository paths and package names.
3. Match known aliases from docs or catalog metadata.
4. Match rename history if available.
5. Use embeddings or LLM judgment only to propose candidates, not to auto-merge nodes.

Expected output:

```md
## Entity Resolution Report

| Candidate Pair | Decision | Evidence | Confidence | Action |
| --- | --- | --- | --- | --- |
| [A] / [B] | same / related / different / unknown | [source] | [level] | merge / link / keep separate |

## Unsafe Auto-Merges
- [pair]: [why it must stay human-reviewed]
```

### Pass Criteria

Continue this idea only if:

- duplicate nodes drop without merging distinct concepts
- each merge has source evidence or a maintained alias record
- uncertain matches can remain linked as `related` instead of forced into one identity

Stop if the graph cannot show why two entities were merged.

## Experiment 5: Freshness And Edge-Provenance Gate

Status: experiment

Use this before relying on a graph-backed review or impact report for a pull request.

Example question:

```text
Can a reviewer tell whether this graph slice is current, source-backed, and complete enough to guide review?
```

### Build The Review Slice

For 10-20 representative pull requests, create a bounded slice containing:

1. the changed files or symbols and the graph source commit
2. direct and indirect impact paths
3. related tests, documentation, owners, configuration, and public contracts
4. evidence paths, extraction methods, and confidence for each important edge
5. graph update time, indexed-file coverage, unsupported areas, and unresolved relationships

Keep source-derived edges separate from inferred or semantic edges. Mark the slice stale or incomplete when the graph state does not match the reviewed commit or an incremental update did not cover an affected area.

### Compare Review Outcomes

Run a normal diff-first review and a review using the graph slice. Have reviewers verify important paths against source files, tests, configuration, or runtime evidence. Record:

- non-obvious relevant files or tests found by the slice
- graph claims that could not be verified
- stale or missing coverage detected before it misled the review
- review time and the number of broad exploratory reads
- whether weak inferred edges buried direct evidence

### Pass Criteria

Continue this idea only if:

- reviewers can identify stale or incomplete graph context before relying on it
- important included paths have source or test evidence
- the slice surfaces at least one useful non-obvious review target without burying direct tests or contracts
- provenance and freshness metadata improve review decisions enough to justify collection cost

Stop or simplify the workflow if metadata is expensive to maintain, the graph regularly disagrees with source, or ordinary search and tests are faster and equally explainable.

## Experiment 6: Task-Specific Graph Context Surface

Status: candidate-plan

Use this when a repository graph is available through an agent-facing tool or protocol and the team must decide which graph queries are worth standardizing.

### Compare Context Shapes

Choose one repository workflow such as risky pull-request review, debugging, or onboarding. Compare:

- a broad graph dump or unrestricted graph exploration
- a narrow context surface that returns only the task-specific slice, such as impact radius, related tests, architecture overview, or a source-backed relationship path

Keep the repository state, task, agent, model, and verification expectations fixed. For each run, record the graph commit, indexed coverage, query or tool used, context size, latency, setup or refresh cost, source files inspected, useful paths found, missed relationships, false positives, and human corrections.

### Pass Criteria

Continue this candidate plan only if the narrow surface:

- reduces irrelevant context without hiding direct callers, tests, contracts, or configuration
- returns relationship paths and source evidence that a reviewer can verify
- makes freshness, unsupported areas, and uncertain edges visible
- improves review, debugging, onboarding, or planning effort enough to justify the integration cost

### Stop Or Simplify

Stop or simplify the integration if a broad source-first workflow is equally effective, if narrow queries hide important relationships, if the graph is stale or difficult to refresh, or if the interface adds more maintenance and explanation cost than it removes.

## When To Promote An Experiment

Promote an experiment into durable strategy, a skill, command, or tool only when it has:

- a repeated workflow with a clear trigger
- a small input contract that a human or agent can provide
- a concrete output artifact that helps review, debugging, onboarding, or test targeting
- measurable reduction in search, review, or verification effort
- graph claims that can be verified against source, tests, config, or maintained docs
- visible freshness and confidence
- manageable maintenance cost

Do not promote an experiment only because the graph looks interesting.

# Search And Code Graph Retrieval Evaluation

## Objective

Compare three practical information-retrieval configurations for coding agents
working in large C++ repositories:

```text
plain agent with Bash
        |
        v
agent with ripgrep and search instructions
        |
        v
agent with ripgrep instructions and Code Review Graph MCP
```

The comparison starts with ordinary repository tasks and then adds tasks that
require broader impact analysis. It measures the complete user experience of
each configuration, including retrieval quality, context use, elapsed time, and
setup cost.

## Compared Configurations

| Configuration | Tools | Standing repository instructions |
| --- | --- | --- |
| A. Plain Bash | Basic shell, Git, `grep`, `find`, and file-reading commands; no installed retrieval-specific tools | None beyond existing repository instructions |
| B. Search | Same environment plus [ripgrep](https://github.com/BurntSushi/ripgrep) | Search instructions below |
| C. Search and graph | Configuration B plus [Code Review Graph](https://github.com/tirth8205/code-review-graph) connected through MCP | Search instructions plus graph instructions below |

Do not add ast-grep, semantic search, clangd integration, or separate symbol
navigation to this experiment. Those tools would introduce more variables and
make the three configurations harder to compare.

Configuration B measures ripgrep and its instructions as one practical package.
It does not isolate whether an improvement came from the executable or the
instruction wording. Configuration C then measures the additional value of the
graph over that search baseline.

## Agent Tools

### Configuration A — Plain Bash

The agent uses a controlled base environment without ripgrep, ast-grep, a code
graph, or other retrieval-specific tools. Record the available commands so the
baseline can be reproduced.

Typical commands may include Git, `grep`, `find`, and file-reading utilities,
but the agent receives no additional retrieval policy.

### Configuration B — Ripgrep Search

The agent can use:

- `rg --files` for repository file discovery;
- `rg` for text, regular-expression, path, and file-type searches;
- Git for working-tree, commit, and history questions; and
- the agent's normal Bash file-reading commands.

On Windows, install ripgrep in PowerShell:

```powershell
winget install --id BurntSushi.ripgrep.MSVC -e
rg --version
```

Use the same execution environment as the coding agent. If the agent runs in
WSL, install ripgrep inside WSL instead.

### Configuration C — Ripgrep And Code Graph

The agent retains all Configuration B tools and receives Code Review Graph MCP
tools. The main retrieval tools are:

- `semantic_search_nodes_tool` for resolving candidate graph nodes;
- `query_graph_tool` for direct callers, callees, imports, dependents, or tests;
- `get_impact_radius_tool` for bounded transitive impact;
- `get_affected_flows_tool` for affected execution flows; and
- `get_review_context_tool` for bounded review context.

Install and connect Code Review Graph using its
[project documentation](https://github.com/tirth8205/code-review-graph). Build
the graph for the exact repository state used by the evaluation.

The initial comparison uses Code Review Graph as currently configured. It does
not add `scip-clang` or another compiler-semantic layer. Compiler-semantic
indexing can be evaluated separately if the results reveal a specific C++
coverage problem.

## Copy-Ready Instructions

### Configuration B — Search Instructions

Add this section to `AGENTS.md` or `CLAUDE.md`:

```markdown
## Repository Search

- Use Git when the task concerns working changes, commits, history, or blame.
- Use `rg --files` and `rg` first for repository file and text search. Narrow
  searches by path, file type, and exact terms instead of reading the whole
  repository.
- Inspect source around relevant matches and use discovered identifiers for
  focused follow-up searches.
- Verify important conclusions with source, tests, builds, configuration, or
  runtime evidence. Report incomplete searches and unverified conclusions.
```

### Configuration C — Graph Instructions

Keep the search instructions and add this separate section:

```markdown
## Code Graph Retrieval

- Use repository search for direct file, text, and source questions.
- Use `semantic_search_nodes_tool` to resolve candidate graph nodes and
  `query_graph_tool` for direct relationships.
- Use `get_impact_radius_tool` or `get_affected_flows_tool` for bounded
  multi-hop impact, dependency paths, or affected-flow questions.
- Confirm that the graph matches the relevant repository state. Treat stale or
  partial results as incomplete and verify important relationships in source
  and tests.
```

Configuration A receives neither block.

## Evaluation Tasks

Use a small fixed task set with source-backed expected answers.

### 1. Direct text lookup

```text
Find where a specific error message is produced, what configuration affects
it, and which tests cover the behavior.
```

This tests whether added retrieval infrastructure improves or unnecessarily
slows a simple search task.

### 2. Named code lookup

```text
Find the definition and uses of a unique repository function or class, and
identify its relevant tests.
```

Choose a symbol whose name is specific enough to avoid requiring compiler-level
overload resolution.

### 3. Commit review

```text
Review a fixed C++ commit for defects caused or exposed by the change and
identify the relevant tests.
```

Select a commit with a known review outcome and at least one relationship
outside the changed files.

### 4. Multi-hop impact

```text
A shared interface changed. Identify affected implementations, dependent
services, reachable entry points, and related tests.
```

This is the task most likely to show incremental value from a graph.

## Controlled Execution

Run the full A–C comparison separately for Claude and Codex. Keep these inputs
equal across configurations for each agent:

- repository and commit;
- model, reasoning setting, and user prompt;
- task time or token budget;
- build and test availability; and
- clean starting context.

Do not combine Claude and Codex runs into one average. Report their results
separately because their tool-use behavior may differ.

Run every task in a fresh agent session. Use at least three runs per task and
configuration because agent behavior varies between runs.

For Configuration C, record graph build time and graph state separately from
task execution. Confirm that the graph matches the evaluated commit before each
run.

Do not tell the agent which retrieval command to run in the task prompt. The
configuration's standing instructions should drive tool selection.

## Measurements

Record:

- correct files, symbols, relationships, and tests found;
- expected evidence missed;
- false-positive or irrelevant results;
- correctness of the final answer;
- tool calls and files or source ranges read;
- input/output tokens or another available context-use measure;
- task elapsed time; and
- setup, indexing, refresh, and storage cost outside task execution.

Correctness and verified coverage are primary. Reduced time, context, or tool
calls matter only when the answer remains correct.

## Interpretation

Compare B with A to assess the practical effect of installing ripgrep and adding
the search instructions. Compare C with B to assess the incremental effect of
Code Review Graph.

Useful outcomes include:

- B improves direct search and commit review without reducing correctness;
- C improves multi-hop impact coverage or efficiency over B; or
- C adds setup and retrieval cost without a material improvement, indicating
  that the search configuration is sufficient for the tested work.

Report results by task type. A graph may help multi-hop analysis without helping
direct lookup, and averaging those tasks into one score would hide that result.

## Execution Order

1. Select the repository commit, tasks, expected answers, model, and budgets.
2. Run Configuration A in the base Bash environment.
3. Install ripgrep, add the search instructions, and run Configuration B.
4. Build and connect Code Review Graph, add the graph instructions, and run
   Configuration C.
5. Compare results by task and include graph setup and refresh costs.

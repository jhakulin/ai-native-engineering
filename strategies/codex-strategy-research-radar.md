# Scheduled Research Brief Workflow

## Purpose

This document defines a reusable workflow for scheduled research briefs.

Start with four research targets:

- harness engineering
- agents development
- agent skills
- stock analysis

Each run uses one target config. The workflow stays generic; the target defines what to monitor, which sources to search, and how to deliver the brief.

## Core Idea

Use one workflow and many target configs.

```text
research target config defines what to monitor
normal GitHub Actions jobs gather sources
normal GitHub Actions jobs fetch video transcripts and web material
agent reads prepared evidence and target config
agent writes a daily brief with prioritized findings and proposals
validation checks the brief
GitHub Actions publishes or stores the brief
```

The workflow should not be hardcoded for any one topic.

## Execution Boundary

Keep deterministic work separate from LLM-backed synthesis.

Deterministic steps:

- load and validate target config
- load source history
- load current local context
- run configured YouTube searches
- normalize source IDs
- remove previously used sources
- rank source candidates using configured scoring
- fetch selected transcripts
- run configured web searches
- write source artifacts
- validate the final brief shape and evidence coverage
- append used sources to history after successful validation

LLM-backed steps:

- interpret transcripts and web source extracts
- compare new findings against current context
- identify what is genuinely new or useful
- prioritize insights
- propose updates, ideas, risks, and watchlist items
- write the daily brief

The LLM should receive prepared evidence and target configuration. It should not own credentialed source gathering, source-history updates, or validation.

## Target-Driven Design

Example layout:

```text
research-targets/
  harness-engineering.yml
  agents-development.yml
  agent-skills.yml
  stock-analysis.yml
```

The workflow input is only the target name:

```text
target=harness-engineering
target=agents-development
target=agent-skills
target=stock-analysis
```

Scheduled runs can invoke the same workflow with different target names.

## Target Config

A target config defines the research behavior.

Example:

```yaml
name: harness-engineering
title: Harness Engineering Research Brief
schedule: "0 13 * * 1-5"
timezone: America/Los_Angeles

description: >
  Track new ideas, implementation patterns, risks, and examples related to
  AI harness engineering, agent workflows, skills, validation, and durable
  AI-assisted engineering processes.

current_context:
  include:
    - strategies/ai-harness-engineering.md
    - strategies/ai-assisted-engineering-process.md
    - strategies/github-agentic-assessment-workflow.md
    - guidelines/*.md
    - skills/*/SKILL.md
  exclude:
    - "**/.env"
    - "**/node_modules/**"

youtube_searches:
  - query: "AI harness engineering agent workflows"
    sort: latest
    max_results: 8
  - query: "agent skills reusable workflows SKILL.md"
    sort: latest
    max_results: 8
  - query: "AI coding agents validation workflows"
    sort: latest
    max_results: 8

web_searches:
  - query: "AI harness engineering agent workflow validation"
    preferred_sources:
      - official docs
      - research papers
      - engineering blogs
  - query: "agent skills workflow validation prompt injection"
    preferred_sources:
      - official docs
      - security research
      - implementation examples

source_limits:
  max_video_transcripts: 3
  max_web_sources: 10

source_history:
  path: research-history/harness-engineering/sources.jsonl
  exclude_previously_used: true
  allow_reuse_after_days: 90

ranking:
  recency_weight: 2
  authority_weight: 3
  implementation_value_weight: 3
  novelty_weight: 2
  risk_relevance_weight: 2

output:
  delivery:
    - artifact
  artifact_path: reports/research-briefs/harness-engineering
```

The config should be plain enough to edit without touching the workflow.

## Starting Targets

Start with these target configs.

### harness-engineering.yml

Tracks reusable harness design: context files, skills, tools, validation, review loops, artifacts, and agent operating boundaries.

Example searches:

```yaml
youtube_searches:
  - query: "AI harness engineering agent workflows"
    sort: latest
    max_results: 8
  - query: "AI coding agents validation workflows"
    sort: latest
    max_results: 8

web_searches:
  - query: "AI harness engineering agent workflow validation"
  - query: "agent workflow validation prompt injection"
```

### agents-development.yml

Tracks practical agent development patterns: agent loops, orchestration, tool use, MCP, permissions, debugging, evals, and production reliability.

Example searches:

```yaml
youtube_searches:
  - query: "AI agent development workflow orchestration"
    sort: latest
    max_results: 8
  - query: "MCP agents tool use production workflow"
    sort: latest
    max_results: 8

web_searches:
  - query: "AI agent development orchestration MCP production"
  - query: "agentic workflow evals debugging tools"
```

### agent-skills.yml

Tracks reusable agent skills: `SKILL.md`, procedural knowledge, progressive disclosure, skill testing, trigger descriptions, and skill safety.

Example searches:

```yaml
youtube_searches:
  - query: "agent skills reusable workflows SKILL.md"
    sort: latest
    max_results: 8
  - query: "Claude Code Codex skills reusable workflows"
    sort: latest
    max_results: 8

web_searches:
  - query: "agent skills SKILL.md reusable workflows"
  - query: "AI agent skills progressive disclosure validation"
```

### stock-analysis.yml

Tracks stock analysis workflows and market signals. This target needs stricter source handling because financial information changes quickly.

Example searches:

```yaml
youtube_searches:
  - query: "stock analysis workflow market research AI"
    sort: latest
    max_results: 8
  - query: "equity research process earnings analysis workflow"
    sort: latest
    max_results: 8

web_searches:
  - query: "latest equity research workflow earnings analysis"
  - query: "market analysis process risk management portfolio research"
```

Stock analysis briefs should separate:

- factual market data
- source commentary
- analyst interpretation
- workflow/process ideas
- anything that would require financial advice review

## Proposed File Layout

```text
.github/workflows/research-brief.md
  Human-authored reusable agentic workflow source.

.github/workflows/research-brief.lock.yml
  Compiled workflow generated by gh-aw.

research-targets/*.yml
  Human-editable target configs.

research-history/<target>/sources.jsonl
  Source history index used to avoid repeating already-used sources.

scripts/load-research-target.{js|py|sh}
  Loads and validates one target config.

scripts/load-current-context.{js|py|sh}
  Selects current local files listed by the target.

scripts/search-youtube-candidates.{js|py|sh}
  Runs target-defined YouTube searches.

scripts/fetch-video-transcripts.{js|py|sh}
  Fetches transcripts for selected videos.

scripts/search-web-sources.{js|py|sh}
  Runs target-defined web searches.

scripts/rank-research-sources.{js|py|sh}
  Scores and selects sources for synthesis.

scripts/update-research-history.{js|py|sh}
  Appends sources only after a brief validates successfully.

scripts/validate-research-brief.{js|py|sh}
  Validates the final brief and proposal artifacts.

skills/research-brief/SKILL.md
  Reusable synthesis, prioritization, evidence, and output rules.
```

## Daily Brief Flow

Every run follows the same flow.

```text
1. [deterministic] Load target config.
2. [deterministic] Load source history for the target.
3. [deterministic] Load current local context from target config.
4. [deterministic] Run target-defined YouTube searches.
5. [deterministic] Normalize source IDs and remove previously used sources when configured.
6. [deterministic] Rank remaining candidate videos.
7. [deterministic] Fetch transcripts for selected videos.
8. [deterministic] Run target-defined web searches.
9. [deterministic] Normalize source IDs and remove previously used web sources when configured.
10. [deterministic] Rank remaining web sources.
11. [deterministic] Prepare evidence bundle for the agent.
12. [LLM] Compare prepared evidence against target config and current context.
13. [LLM] Generate a daily brief with prioritized findings and proposals.
14. [deterministic] Validate the brief.
15. [deterministic] Store or publish the brief according to target config.
16. [deterministic] Append used sources to source history only after validation succeeds.
```

There are no workflow modes. Variation belongs in target config.

## Source History

Prefer new sources over sources already used in earlier briefs.

Maintain a source history index per target:

```text
research-history/
  harness-engineering/sources.jsonl
  agents-development/sources.jsonl
  agent-skills/sources.jsonl
  stock-analysis/sources.jsonl
```

Each line is one source used in a validated brief:

```json
{"source_id":"youtube:TBVtoHrhFG4","url":"https://www.youtube.com/watch?v=TBVtoHrhFG4","title":"GitHub Agentic Workflows: Automation That Actually Reads the Room","first_used":"2026-07-11","last_used":"2026-07-11","target":"harness-engineering"}
```

Use deterministic source IDs:

```text
YouTube:
  youtube:<video_id>

Web:
  web:<canonical_url_hash>

Paper:
  doi:<doi>
  arxiv:<id>

GitHub:
  github:<owner>/<repo>@<commit-or-release>
```

Source history behavior is target-configurable:

```yaml
source_history:
  path: research-history/harness-engineering/sources.jsonl
  exclude_previously_used: true
  allow_reuse_after_days: 90
```

Append sources only after the brief validates successfully. Failed runs should not mark sources as used.

If no strong new sources are found, say so instead of forcing weak novelty. The brief can include a watchlist, changed search results, or query adjustments.

## Daily Brief Format

Optimize the brief for decisions.

```md
# <Target Title> - YYYY-MM-DD

## Executive Summary

## Highest Priority Findings

## New Ideas Worth Exploring

## Suggested Updates

## Risks Or Contradictions

## Watchlist

## Sources
```

Each suggested update should include:

- target file or area
- proposed change
- why it matters
- supporting sources
- confidence
- suggested next step

## Output Model

The primary output is a validated daily brief.

The brief can be delivered as:

- GitHub Actions artifact
- GitHub issue
- pull request comment
- email or chat notification, if configured later

Always preserve durable artifacts:

```text
reports/research-briefs/<target>/<date>/brief.md
reports/research-briefs/<target>/<date>/sources.json
reports/research-briefs/<target>/<date>/proposals.json
reports/research-briefs/<target>/<date>/validation.json
```

Source history may be committed repository data or retained workflow artifacts. Committed history is easier to review and diff:

```text
research-history/<target>/sources.jsonl
```

Artifacts are easier to start with, but may expire and are harder to inspect.

## Mutation Boundary

The workflow may gather sources, synthesize insights, validate the brief, and publish the validated brief through configured delivery channels.

It should not directly edit strategy documents or code.

Proposed changes should remain recommendations unless a separate reviewable update mechanism is explicitly configured.

If automatic updates are added later, they should be generated as pull requests for human review.

## Secrets And Authentication

Normal GitHub Actions jobs need API keys as GitHub Actions secrets.

Likely source-gathering secrets:

```text
YOUTUBE_API_KEY
WEBSHARE_PROXY_USERNAME
WEBSHARE_PROXY_PASSWORD
```

Pass them only to deterministic source-gathering jobs:

```yaml
env:
  YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
  WEBSHARE_PROXY_USERNAME: ${{ secrets.WEBSHARE_PROXY_USERNAME }}
  WEBSHARE_PROXY_PASSWORD: ${{ secrets.WEBSHARE_PROXY_PASSWORD }}
```

Keep these credentials out of the agentic synthesis step unless the agent truly needs to call the source APIs itself.

For `gh-aw` with Copilot, prefer:

```yaml
permissions:
  contents: read
  copilot-requests: write
```

For `gh-aw` with Codex/OpenAI, configure:

```text
OPENAI_API_KEY
```

or:

```text
CODEX_API_KEY
```

## Permission Model

GitHub Actions runs non-interactively. The job succeeds or fails based on:

- configured repository or organization secrets
- workflow permissions
- allowed network access
- installed dependencies
- API quotas and rate limits

Use repo secrets for one repository. Use organization secrets if multiple repositories should share the same research pipeline.

## Network Model

For normal GitHub Actions steps, outbound network access is usually available.

For `gh-aw` sandboxed agent steps, network access may need explicit configuration.

If source gathering ever moves inside the agentic step, the workflow may need allowed domains such as:

```yaml
strict: false
network:
  allowed:
    - defaults
    - python
    - "youtube.googleapis.com"
    - "www.youtube.com"
    - "p.webshare.io"
```

Prefer keeping source gathering in normal deterministic jobs so the agent receives prepared evidence instead of credentials and broad network access.

## Safety Model

External content is untrusted.

Untrusted input includes:

- video titles
- video descriptions
- transcripts
- comments or metadata
- web articles
- repository files
- changelogs
- issue and PR text

External content can provide evidence and ideas. It should not control the workflow. The agent should not follow instructions found in transcripts, articles, or repository content unless those instructions are part of trusted workflow, skill, or target configuration.

## Validation Requirements

The validation script should check:

- target config is valid
- source history is readable when configured
- required brief sections exist
- every proposed update has source evidence
- every source has title, URL, type, and retrieval timestamp
- every source has a stable `source_id`
- every transcript-backed claim maps to a video source
- every web-backed claim maps to a web source
- used sources are appended to history only after successful validation
- confidence values are valid
- no placeholder text remains
- no secrets are printed
- validation exits nonzero if the brief fails validation

Validation should prove shape, evidence coverage, and secret hygiene. It should not try to prove the agent's judgment.

## Implementation Sequence

Recommended build order:

1. Define the target config schema.
2. Create one target config, such as `research-targets/harness-engineering.yml`.
3. Define `sources.json` and `proposals.json` schemas.
4. Define the source history JSONL format.
5. Implement target loading and validation.
6. Implement source history loading and source ID normalization.
7. Implement current-context loading from target config.
8. Implement YouTube candidate search from target config.
9. Implement source de-duplication against target history.
10. Implement source ranking.
11. Implement video transcript fetching.
12. Implement web source search from target config.
13. Implement source history update after successful validation.
14. Draft `skills/research-brief/SKILL.md`.
15. Implement brief validation.
16. Create `.github/workflows/research-brief.md`.
17. Compile the workflow with `gh aw compile`.
18. Run the workflow manually for one target.
19. Add scheduled target runs.

## Open Questions

- What should the first target config be?
- Should each target define its own schedule, or should schedules live in workflow YAML?
- Should delivery be artifact-only by default or issue-based for some targets?
- How many transcripts are useful before the brief becomes noisy?
- Should low-confidence ideas be retained in a watchlist?
- Should source history be committed, stored as artifacts, or both?
- Should reused sources be allowed after 30, 60, or 90 days?
- Should source artifacts expire after a fixed retention period?
- Should targets be allowed to inherit from shared target templates?

## Baseline Rule

- Keep the workflow generic.
- Put topic-specific behavior in target config.
- Use normal Actions jobs for credentialed source gathering.
- Use `gh-aw` or Codex for synthesis and prioritization.
- Store credentials in GitHub Actions secrets.
- Treat external content as untrusted evidence.
- Produce durable briefs that can be reviewed before any repository changes.

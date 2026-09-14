# Research Inbox Workflow

This repository includes GitHub Actions research inbox ingestion workflows:

```text
.github/workflows/research-inbox.yml
.github/workflows/research-inbox-ai-native-engineering.yml
.github/workflows/research-inbox-ai-native-product-management.yml
```

Repository context is defined by the deterministic manifest:

```text
research/context-manifest.json
```

The manifest is maintained by `.github/workflows/update-context-manifest.yml` and scheduled jobs fail if it is missing, stale, or incomplete.

The workflows search YouTube, use OpenAI to plan dynamic queries and select videos for transcription, fetch transcripts, validate the generated inbox, and open pull requests with run-specific `research/inbox/` data.

## What The Inbox Workflow Does

1. Query planning and deterministic search steps:
   - load the research target
   - load repository context
   - use the OpenAI Responses API with web search to propose a small set of dynamic YouTube queries
   - preserve linked web findings as `web-sources.json`
   - validate `query-plan.json`
   - search fixed and dynamic YouTube queries with `YOUTUBE_API_KEY`
   - write `query-plan.json` and `youtube-candidates.json`
2. LLM selection step:
   - reads the target, repository context, query plan, and YouTube candidate metadata
   - selects videos for transcription
   - writes `selected-videos.json`
3. Deterministic guard steps:
   - fail if the selection step changed any file other than `selected-videos.json`
   - validate selected videos against the candidate list before Webshare secrets are used
4. Deterministic transcript and publication steps:
   - fetch transcripts for selected videos with Webshare proxy credentials
   - if a selected video has no transcript, try rejected candidates in order until the configured successful transcript limit is reached or candidates are exhausted
   - write `transcripts.json` and `evidence.json` with linked web sources included
   - write `selection-summary.md` with query, selection, fallback, and transcript status
   - validate cross-file inbox consistency
   - update `research-history/<target>/sources.jsonl`
   - update `research/inbox/<target>/latest.json`
   - prune older run folders according to the target retention config
   - open a pull request with the generated inbox data and any pruning deletions

The inbox PR must be reviewed and merged before Codex App can read the data from the repository's default branch.

## Required Secrets

Set these repository secrets:

```bash
gh secret set YOUTUBE_API_KEY
gh secret set WEBSHARE_PROXY_USERNAME
gh secret set WEBSHARE_PROXY_PASSWORD
gh secret set OPENAI_API_KEY
```

## Optional Variables

Webshare locations default to `us,ca`. Override with a repository variable if needed:

```bash
gh variable set WEBSHARE_PROXY_LOCATIONS --body "us,ca"
```

The inbox query-planning and video-selection models default to `gpt-5.1`. Override them with:

```bash
gh variable set RESEARCH_QUERY_PLANNER_MODEL --body "<model>"
gh variable set RESEARCH_SELECTION_MODEL --body "<model>"
```

## Run Inbox Ingestion Manually

Run from the GitHub UI:

1. Open **Actions**.
2. Select **Agent Skills Research Inbox Ingestion**.
3. Click **Run workflow**.
4. Set `target` to `agent-skills`.

Or run with the GitHub CLI:

```bash
gh workflow run research-inbox.yml -f target=agent-skills
```

Run the AI-native engineering workflow separately:

```bash
gh workflow run research-inbox-ai-native-engineering.yml
```

Run the AI-native product management workflow separately:

```bash
gh workflow run research-inbox-ai-native-product-management.yml
```

Run the knowledge graph workflow separately:

```bash
gh workflow run research-inbox-knowledge-graphs-software-repositories.yml
```

Check runs:

```bash
gh run list --workflow research-inbox.yml
```

A successful run opens a pull request containing generated files under a run-specific folder:

```text
research/inbox/agent-skills/<date>/run-<github-run-id>/
research/inbox/agent-skills/latest.json
research-history/agent-skills/sources.jsonl
```

Multiple runs on the same day create separate folders and branches. The workflow also prunes older merged run folders according to `retention` in the target config.

The pull request body is generated from:

```text
research/inbox/agent-skills/<date>/run-<github-run-id>/selection-summary.md
```

That summary lists the query plan, dynamic queries, linked web sources used for query planning and evidence, configured YouTube searches, search success/failure status, selected videos, fallback transcript attempts, rejected candidates, selection rationale, expected value, confidence, and transcript fetch status.

Codex App or other readers should start from:

```text
research/inbox/agent-skills/latest.json
```

The pointer contains the latest run path, workflow run ID, source commit SHA, update timestamp, and content hashes for key files.

## Configure The Schedule

The schedules live in:

```text
.github/workflows/research-inbox.yml                         # agent-skills
.github/workflows/research-inbox-ai-native-engineering.yml   # ai-native-engineering
.github/workflows/research-inbox-ai-native-product-management.yml
.github/workflows/research-inbox-knowledge-graphs-software-repositories.yml
```

Current schedules:

```yaml
agent-skills: daily 04:30 UTC / 07:30 Finland summer time
ai-native-engineering: daily 05:00 UTC / 08:00 Finland summer time
ai-native-product-management: daily 05:30 UTC / 08:30 Finland summer time
knowledge-graphs-software-repositories: daily 06:00 UTC / 09:00 Finland summer time
```

Each scheduled run creates a reviewable research inbox pull request. Follow-up work can use the merged run through the target's `latest.json` pointer and the Codex research brief prompt.

## Configure Research Targets

Current targets are:

```text
research-targets/agent-skills.yml
research-targets/ai-native-engineering.yml
research-targets/ai-native-product-management.yml
research-targets/knowledge-graphs-software-repositories.yml
```

Although the file uses a `.yml` extension, it currently uses JSON-compatible syntax so the lightweight Node loader can parse it without extra dependencies.

To change research behavior, edit:

- `brief_title`
- `idea_output.directory`
- optional `analysis_focus`
- `dynamic_query_planning`
- `dynamic_query_planning.max_query_terms` for short YouTube-native dynamic queries
- `youtube_searches`
- `source_limits.max_video_transcripts`
- `current_context.include`
- `retention.enabled` — set to `false` while retaining runs for evaluation
- `retention.keep_latest_runs`
- `retention.delete_runs_older_than_days`

Then validate locally:

```bash
node scripts/load-research-target.js agent-skills
node scripts/load-research-target.js ai-native-engineering
node scripts/load-research-target.js ai-native-product-management
node scripts/load-research-target.js knowledge-graphs-software-repositories
node scripts/validate-repo.js
```

## Codex App Follow-up Brief

After merging a research inbox PR, Codex App can read the merged run folder from the private repository and produce an insight-first brief.

The report-only prompt template is stored in:

```text
research/prompts/codex-research-brief-template.md
```

The write-enabled application prompt is stored in:

```text
research/prompts/codex-research-application-template.md
```

Use the canonical prompt template rather than an embedded target-specific prompt:

```text
research/prompts/codex-research-brief-template.md
```

Provide the target name and use the exact run's `target.json` for `brief_title`, `idea_output.directory`, and optional `analysis_focus`. The context manifest remains authoritative for repository files. Do not continue with partial context or infer target paths.

## Context Manifest Validation

Generate or update the deterministic context manifest:

```bash
node scripts/generate-context-manifest.js
node scripts/validate-context-manifest.js
```

The manifest includes the required root files and every tracked Markdown file under `guidelines/`, `skills/`, `strategies/`, and `ideas/`. Scheduled jobs read the manifest-listed files from the same checked-out commit and record the SHA and file list in `context.json`.

## Local Validation

Run repository validation:

```bash
node scripts/validate-repo.js
```

Check changed JavaScript syntax:

```bash
node --check scripts/*.js
```

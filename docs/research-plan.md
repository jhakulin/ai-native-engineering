# Research Radar Improvement Plan

This plan evolves the current YouTube research-inbox workflow into a broader, novelty-aware, multi-source research radar.

## Current Baseline

The workflow currently supports:

- target-specific configurations
- fixed and dynamic YouTube queries
- web-assisted query planning
- LLM-assisted video selection
- transcript fetching through Webshare
- reviewable research inbox pull requests
- source history
- linked web findings in `web-sources.json`
- basic candidate scoring
- Codex brief generation from `latest.json`

The research repository remains private and generated inbox material is not synchronized to the public repository.

## Phase 1 — Source-History Correctness

**Status: implemented**

- Exclude recently used and ineligible YouTube sources before LLM selection.
- Reject ineligible selected sources during validation.
- Preserve source history for deduplication and novelty.

## Phase 2 — Web Findings As Evidence

**Status: implemented**

- Preserve web-search findings as `web-sources.json`.
- Include linked web sources in `evidence.json` and `selection-summary.md`.
- Validate web-source structure and HTTPS links.
- Include web-source hashes in `latest.json`.
- Make Codex read web sources alongside transcripts.

Current limitation: web findings are linked summaries, not full web-page extracts.

## Phase 3 — Facets And Coverage

**Status: partially implemented**

Already implemented:

- target facets for Agent Skills, AI-native engineering, and AI-native product management
- facet context passed to query planning and video selection

Next steps:

- first run 3–5 workflows and observe actual coverage
- report lightweight facet coverage in each research summary
- initially label facets as covered or missing; do not enforce minimum coverage yet
- identify recurring under-covered facets
- ask dynamic query planning to prioritize observed coverage gaps
- consider minimum facet coverage validation only after repeated gaps are demonstrated

Example facets include:

- implementation
- evaluation
- security
- governance
- adoption
- failure modes

## Phase 4 — Candidate Scoring And Diversity

**Status: partially implemented**

Already implemented:

- recency score
- novelty score
- minimum five-minute duration gate
- bounded view score
- stronger like and comment engagement scores
- mature low-engagement penalty for older, sufficiently viewed videos with no likes or comments
- recency remains stronger than likes/comments for very recent videos
- dynamic-query diversity signal
- source-history penalty
- score-sorted eligible candidates for LLM selection

Next steps, only after observing real runs:

- add the one-channel-per-run diversity rule
- consider authority and organization signals
- consider promotional or low-information signals
- require explanations when the LLM skips higher-scored candidates
- keep popularity as a bounded signal, never the sole selection criterion

Defer complex authority scoring and classifiers until the runs demonstrate a clear need.

## Phase 5 — Channel Memory

**Status: planned**

Channel memory complements source history:

```text
source history = videos already consumed
channel memory = channels worth monitoring again
```

### Phase 5.1 — Persist Minimal Channel Memory

Create:

```text
research-history/<target>/channels.jsonl
```

Start with only stable, useful-history metadata:

```json
{
  "channel_id": "UC123",
  "channel_title": "Example Engineering",
  "status": "watch",
  "successful_transcript_count": 1,
  "first_useful": "2026-07-12",
  "last_useful": "2026-07-12",
  "last_seen": "2026-07-12",
  "facets": []
}
```

Use `channel_id`, not only the channel title.

Distinguish the signals:

```text
candidate channel = observed
selected channel = weak signal
successful validated source = promotion signal
```

A failed transcript or merely selected video must not increase the useful-history counters.

### Phase 5.2 — Promote Only Validated Sources

Update channel memory only after transcript and inbox validation succeeds. Start with one status:

```text
watch — has produced validated useful evidence
```

The LLM must not directly edit the channel watchlist. Updates should be deterministic and included in the reviewable PR.

Defer `candidate`, `preferred`, and `muted` states until real history demonstrates that they are useful.

### Phase 5.3 — Add One Diversity Rule

Start with:

```text
maximum one selected video per channel per run
```

Keep broad discovery active so the workflow does not become dependent on a small group of authors.

### Phase 5.4 — Observe Before Ranking

After several runs, determine whether watched channels actually produce useful material. Only then consider a capped channel-quality bonus:

```text
channel_quality_bonus: 0–2
```

A watched channel may influence ranking but must not guarantee selection. A strong new source must still be able to outrank a mediocre watched channel.

### Phase 5.5 — Add Watched-Channel Discovery Later

Only after channel memory has accumulated, consider recent-upload discovery from watched channels. Use a mixed strategy:

```text
broad discovery + watched-channel uploads + experimental sources
```

Do not replace broad discovery or force watched channels into every query.

### Phase 5.5 — Add Watched-Channel Discovery

Only after several runs of channel history exist, add recent-upload discovery from watched channels. Use a mixed strategy rather than replacing broad discovery:

```text
broad discovery + watched-channel uploads + experimental sources
```

Do not begin by forcing watched channels into every query.

## Phase 6 — Richer Web Ingestion

**Status: planned**

Potential additions:

- fetch selected web pages
- extract short relevant snippets or quotes
- record retrieval timestamps
- store source hashes
- distinguish primary and secondary sources
- preserve ordinary public links for durable documentation

Avoid storing complete web pages initially.

## Phase 7 — Research-Quality Metrics

**Status: planned**

Track metrics such as:

- genuinely new findings per run
- source reuse rate
- facet coverage
- transcript success rate
- source-type distribution
- channel concentration
- age distribution of selected sources
- number of actionable repository implications
- reviewer acceptance of proposed follow-ups
- API cost per useful finding

The most important metric is whether a run produces a well-supported insight that changes what the repository should consider.

## Recommended Implementation Order

### Now

1. Run the daily target workflows for 3–5 cycles and inspect the output.
2. Add lightweight facet coverage reporting.
3. Implement minimal validated channel memory.
4. Enforce one selected video per channel per run.

### Later, Only If Justified By Data

5. Add a capped channel-ranking bonus.
6. Add watched-channel discovery.
7. Implement richer web extraction.
8. Add research-quality metrics, decay, and muting.

Defer complex authority scoring, promotional classifiers, full web-page extraction, elaborate channel states, and strict facet thresholds until real runs demonstrate that they are needed.

## Operating Principles

- Prefer deterministic controls around LLM steps.
- Keep external content untrusted.
- Keep broad source exploration active.
- Do not let popularity or channel familiarity dominate relevance.
- Keep research provenance in research briefs and history, not in durable public documentation unless explicitly requested.
- Change the workflow incrementally and validate each phase with real runs.

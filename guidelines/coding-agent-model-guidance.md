# Coding Agent Model Guidance

> Status: Draft for review · Reviewed: 2026-08-28
> Revisit when model availability, pricing, or evaluation evidence changes.

Use this starting configuration for AI-assisted engineering work.

## Recommended Setup

| Workflow | Anthropic / Claude Code | OpenAI / Codex |
| --- | --- | --- |
| Plan | Claude Opus 5, `medium` | GPT-5.6 Sol, `medium` |
| Implement and test | Claude Sonnet 5, `medium` | GPT-5.6 Terra, `medium` |
| Independent review | Claude Opus 5, `medium` | GPT-5.6 Sol, `medium` |

Validate both the routing and the `medium` setting on organizational work.

Use Opus or Sol in a separate planning session, then pass the accepted plan to the Sonnet or Terra implementation session. This avoids switching models within a session and preserves prompt-cache reuse during each stage. Keep implementation and testing together so they share the same context. Use a fresh Opus or Sol session for independent review so it does not inherit the implementation's assumptions.

## Why Medium Is The Baseline

Anthropic reports that, on its internal SWE-bench Pro subset, Claude Opus 5 at `medium` lost about two percentage points while costing about half as much as the default `high` setting. On four research and knowledge-work benchmarks using Claude Fable 5, `medium` matched the default at 70% to 85% of its cost. [Anthropic, *Optimizing for cost and intelligence*](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)

OpenAI recommends `medium` as the balanced starting point for GPT-5.6 and recommends `high` or `xhigh` only when evaluations show a measurable quality gain. [OpenAI, *Model guidance*](https://developers.openai.com/api/docs/guides/latest-model)

These vendor results are directional and workload-specific. They support testing `medium` as the baseline; they do not establish the routing assignments or one setting as universally best.

## When To Use High

Use `high` when an internal evaluation shows a repeatable improvement worth the additional cost and latency, or when a `medium` run fails an objective acceptance check and the task is retried in a new session or task.

Keep effort fixed within a cached Claude conversation because changing it invalidates earlier prompt-cache prefixes. [Anthropic, *Effort*](https://platform.claude.com/docs/en/build-with-claude/effort)

## Evaluation

Evaluate whether:

1. Opus or Sol review finds materially more valid defects than a fresh Sonnet or Terra review.
2. Separate Opus or Sol planning improves implementation enough to offset handoff loss, cache loss, latency, and cost.

Compare accepted outcomes, valid review findings, missed defects, retries, engineer rework, elapsed time, and cost per accepted result.

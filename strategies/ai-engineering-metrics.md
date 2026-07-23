# AI Engineering Metrics

## Purpose

This document defines lightweight metrics for understanding whether AI use improves engineering delivery, quality, learning, and governance.

The goal is not to measure AI for its own sake. The goal is to answer practical questions with evidence teams can collect without heavy reporting.

## Measurement Principles

- Start small. A monthly pulse survey, one optional PR label, and existing delivery or defect data are enough for the first version.
- Prefer metrics teams already have: PR data, work item data, CI results, incident data, and short surveys.
- Measure trends over time, not isolated numbers.
- Pair value signals with risk checks. If cycle time improves, check whether defects, rollbacks, review time, or AI-related incidents worsened.
- Do not require perfect attribution. It is enough to know whether AI use increased while delivery, quality, review burden, and incidents moved in a good or bad direction.
- Do not use lines of code as a success metric.
- Do not treat AI usage volume as proof of productivity.
- Keep team-level metrics useful for improvement, not only leadership reporting.

## 1. Are people using AI?

These metrics show adoption and reach.

Lightweight metrics:

- Percentage of engineers using approved AI tools monthly.
- Percentage of teams using AI in normal engineering work.
- Number of AI-assisted PRs or work items, if teams label them.
- Number of agent sessions or runs, only where tooling reports this automatically.
- Number of reusable prompts, skills, workflows, or guardrails shared.

How to collect:

- Monthly pulse survey.
- Tool usage reports, if available.
- Optional PR or work item label, such as `ai-assisted`.
- Lightweight shared list of reusable AI assets.

Caution:

Adoption shows use. It does not prove improved outcomes.

## 2. Where is AI used in the workflow?

These metrics show which engineering activities AI supports.

Lightweight metrics:

- Codebase exploration.
- Planning or solution comparison.
- Implementation.
- Debugging.
- Refactoring.
- Test generation.
- Documentation.
- Code review.
- Specs, acceptance criteria, or verification notes.

How to collect:

- Monthly survey with checkboxes.
- Optional PR template checkbox.
- Team retrospective notes.
- Agent workflow logs.

Useful question:

> Is AI used only for code generation, or is it also improving planning, testing, review, and learning?

## 3. Is work moving faster?

These metrics show whether AI helps delivery flow.

Lightweight metrics:

- Median PR cycle time.
- Median time from PR open to merge.
- Median time to resolve bugs.
- Completed work items for comparable work types.
- Team examples where AI shortened exploration, implementation, testing, or debugging.

How to collect:

- Git/PR data.
- Issue tracker data, if already used consistently.
- Team self-report for concrete examples where timing data is unavailable.

Caution:

Faster delivery is useful only if quality, reviewability, and maintainability do not degrade.

## 4. Is quality stable or improving?

These metrics show whether AI-assisted delivery preserves quality.

Lightweight metrics:

- Escaped defects.
- Reopened work items.
- Rollbacks.
- Production incidents.
- AI-related security or data incidents.
- Team examples of AI output causing quality or maintainability problems.

How to collect:

- Incident and defect tracking.
- Deployment records, if available.
- Security or data incident records.
- Team retrospective notes.

Useful question:

> Are we delivering faster because we are more effective, or because quality work moved into review, debugging, and operations?

## 5. Is AI output backed by proof?

These metrics show whether teams verify AI-assisted work.

Lightweight metrics:

- Percentage of AI-assisted PRs with verification proof.
- Proof types used: tests, manual notes, screenshots, traces, logs, API examples, or CI results.
- High-risk AI-assisted changes with explicit human approval.

How to collect:

- One PR template field for verification proof.
- CI status.
- Work item links, if already used.

Recommended PR template fields:

```text
AI-assisted: yes/no
Verification proof: tests / manual notes / screenshot / trace / logs / CI / not applicable
```

Useful question:

> Can the reviewer see evidence that the AI-assisted change works?

## 6. Is AI reducing or increasing review burden?

These metrics show whether AI produces useful work or creates cleanup work.

Lightweight metrics:

- Median PR review time.
- Team examples where AI output required major rewrite.
- Percentage of agent-generated PRs accepted after review, if agent workflows exist.
- Common repeated review comments on AI-assisted work.
- Clarification cycles caused by missing product intent, evidence, constraints, or acceptance expectations.

How to collect:

- PR metadata.
- Team retrospective notes.
- Optional review labels, such as `major-rework` or `agent-output-rejected`.
- Agent workflow logs, if agent workflows exist.
- Product-to-engineering handoff reviews, where teams already review briefs, tickets, or specs.

Useful question:

> Did AI reduce implementation effort while increasing review and correction effort?

For product-facing workflows, also ask:

> Did missing product context create extra clarification, rework, or unsupported agent output?

## 7. Are engineers becoming more capable with AI?

These metrics show learning and fluency.

Lightweight metrics:

- Self-rated confidence using AI for engineering work.
- Self-rated confidence verifying AI output.
- Number of shared AI workflows contributed.
- Examples of successful AI-assisted workflows shared across teams.

How to collect:

- Monthly or quarterly pulse survey.
- Lightweight shared workflow list.
- Engineering community notes.

Recommended pulse survey:

```text
1. I used AI for engineering work this month: yes/no
2. AI helped me work faster or better: 1-5
3. I know how to verify AI output safely: 1-5
4. The most useful AI workflow I used was: free text
5. The biggest AI-related friction or risk I saw was: free text
```

Useful question:

> Are engineers learning to use AI responsibly, or only using it more often?

## 8. Are reusable AI assets improving the organization?

These metrics show whether useful practices become shared assets.

Lightweight metrics:

- Number of maintained prompts, skills, agents, workflows, evaluations, or guardrails.
- Number of teams using shared AI assets.
- Number of repeated review comments converted into tests, lints, instructions, or guardrails.
- Number of repository instructions added or improved.

How to collect:

- Lightweight shared asset list.
- Repository history.
- Team retrospectives.

Useful question:

> Are we turning repeated AI lessons into durable engineering improvements?

## 9. Are governed agent workflows working?

These metrics apply when agents perform asynchronous or delegated work.

Lightweight metrics:

- Number of governed agent workflows.
- Workflows with named owner, purpose, permissions, and approval rules.
- Number of agent runs per month, if logged automatically.
- Successful agent runs.
- Accepted agent outputs.
- Agent runs requiring major human intervention.
- Incidents caused by agent workflows.

How to collect:

- Simple workflow log.
- GitHub Actions or automation history.
- Incident records.

Recommended workflow log:

```text
Workflow name:
Owner:
Runs this month:
Successful runs:
Accepted outputs:
Rejected outputs:
Major human interventions:
Incidents:
Guardrails added:
```

When comparing agent workflows, record the model and version, harness version or configuration, task family, tool and context environment, and evaluator or verifier. Compare native and standardized harness conditions when practical, and report harness sensitivity separately; do not attribute outcome differences to the model alone.

For security-sensitive workflows, keep utility and containment as separate views. Record legitimate task completion alongside protected-read attempts, secret exposure, outbound attempts, blocked and allowed side effects, false positives, latency, and cost. Retain blocked attempts and report numerators and denominators by attack surface or goal; a single blended score can hide a workflow that is safe only because it rarely completes the task.
Useful question:

> Can agents complete scoped work asynchronously while humans remain in control of intent, risk, and acceptance?

For workflows that adapt their own prompts, tools, routing, memory, or orchestration, add a retained regression view:

- New-task pass rate.
- Retained-task pass rate.
- Regression count or regression rate.
- Cost and latency per accepted run.
- Human intervention rate.

Do not judge an optimizer or self-improving workflow by its latest-task score alone. Keep a small, representative regression set and require review when a change improves new tasks by weakening previously reliable behavior.

## 10. Is the value worth the cost?

These metrics show whether AI spend produces useful outcomes.

Lightweight metrics:

- AI tool cost per active user or team.
- Token or model cost by workflow, only where available.
- High-cost workflows reviewed or optimized.

How to collect:

- Vendor usage reports.
- Internal billing or allocation data.
- Agent workflow logs.

Caution:

Cost optimization should not block early learning. Use cost metrics first for visibility, then for optimization once workflows mature.

## Minimal Metric Set

If the organization wants the lightest measurement system, start with:

1. Percentage of engineers using AI monthly.
2. Self-reported usefulness of AI.
3. Self-reported confidence verifying AI output.
4. Percentage of AI-assisted PRs with verification proof, if teams label AI-assisted PRs.
5. Median PR cycle time and review time.
6. Escaped defects, reopened work items, or AI-related incidents.
7. Number of reusable AI assets or workflows shared.

## Phase Fit

### Phase 0: Diagnose and Establish Direction

Use metrics to create a baseline:

- AI usage baseline completed.
- Approved tool and data guidance published.
- Transformation owner named.
- Pilot teams selected.
- Baseline cycle time, review time, quality, and AI usage captured.

### Phase 1: AI-Assisted Engineering Fluency

Focus on individual adoption and capability:

- Active AI usage.
- Self-reported usefulness.
- Confidence verifying AI output.
- Shared prompts, skills, or workflows.
- AI-related policy incidents.

### Phase 2: AI-Assisted Team Delivery

Focus on team workflow and proof:

- Teams with agreed AI-assisted workflow.
- AI-assisted PRs or work items.
- AI-assisted PRs with verification proof.
- Cycle time and review time trends.
- Reopened work or escaped defect trends.

### Phase 3: Governed Agentic Workflows

Focus on delegated agent work:

- Governed workflows with owners.
- Successful asynchronous agent runs.
- Accepted agent outputs.
- Human intervention rate.
- Agent workflow incidents.
- Repeated failures converted into guardrails, tests, or instructions.

### Phase 4: AI-Native Engineering Operating Model

Focus on sustained operating model health:

- Teams using shared AI workflows.
- Maintained reusable AI assets.
- Stable or improved delivery and quality trends.
- Agent workflows with lifecycle ownership.
- Stale workflows retired.
- Continuous improvement from repeated AI failure patterns.

## Summary

AI engineering metrics should answer practical questions:

- Are people using AI?
- Where is AI used?
- Is work moving faster?
- Is quality stable or improving?
- Is output backed by proof?
- Is review burden reduced or increased?
- Are engineers becoming more capable?
- Are reusable assets improving the organization?
- Are governed agent workflows working?
- Is the value worth the cost?

A lightweight system is enough: combine small surveys, PR labels, CI data, defect data, and simple workflow logs. The best metrics help teams improve how they work with AI, not just report that AI is being used.

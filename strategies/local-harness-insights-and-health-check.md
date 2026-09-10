# Local Harness Insights And Health Check

## Purpose

This document defines how engineers can turn their AI-assisted development experience into evidence for team and central harness improvement. The workflow begins with engineer-driven reflection, introduces a local insights agent after the questions are understood, and becomes more automatic only after teams trust the analysis and its use.

The central harness team needs recurring patterns and improvement candidates, not unrestricted access to engineers' conversations.

## Adoption Path

```text
engineer reviews their own work
              |
              v
engineer submits useful findings manually
              |
              v
local agent prepares findings for engineer approval
              |
              v
approved findings are published centrally
              |
              v
trusted parts of collection and analysis are automated
```

## Stage 1: Engineer-Driven Discovery

Start without building an agent. Each engineer periodically reviews how Claude Code supports their work. Useful inputs include:

- `/doctor` for environment and configuration warnings
- `/insights` for recurring interaction patterns and friction
- fresh-session `/context all` for static context use
- the engineer's review of recent tasks where AI caused repeated correction, manual work, waiting, or verification problems

Use the accompanying [Claude Code Engineering Guideline](../guidelines/claude-code-engineering-guideline.md) for the detailed environment, context, session, review, and token-consumption guidance behind these checks.

The engineer selects one or two relevant findings and records them in a small form:

```text
Repository and workflow:
Observed pattern:
Concrete example or frequency:
Effect on delivery, quality, risk, or effort:
Possible local improvement:
Possible central contribution:
```

The team reviews these findings during a harness health check or an existing retrospective. This first stage establishes which signals are useful before automation is introduced.

## Stage 2: Local Insights Agent With Engineer Approval

After the manual process is understood, a local agent can prepare the same analysis. The engineer starts it manually, using a deliberately invoked local command or skill such as:

```text
/harness-insights
```

This is a proposed invocation, not a command currently provided by this repository.

The workflow is:

1. The agent proposes the current repository, a recent time range, and the sessions it found.
2. The engineer confirms the scope and excludes sessions they do not want analyzed.
3. The agent examines environment evidence and recent session patterns.
4. It produces a local draft with observations, likely causes, confidence, and possible responses.
5. The engineer corrects, removes, or approves each finding.
6. A separate publish action sends only the approved analysis to the central location.

The agent should prefer metadata such as tool failures, permission outcomes, skill use, compaction, verification activity, and repeated commands. Conversation content can improve the analysis of repeated explanations or corrections, but should be included only when allowed for the repository and selected by the engineer.

### Patterns To Detect

| Pattern | Possible improvement |
| --- | --- |
| Repository facts repeatedly explained | Improve navigation or repository instructions |
| Same procedure repeatedly prompted | Create a skill or deterministic script |
| Incorrect skill activation | Narrow the skill trigger or retire the skill |
| Repeated command sequence | Add a script, hook, or tool |
| Same failure corrected repeatedly | Add a test, linter, CI check, verifier, or monitor |
| Repeated permission interruption | Review the workflow and permission boundary |
| Large fresh-session context | Remove or narrow instructions, skills, plugins, or MCP servers |
| Frequent compaction or very long sessions | Improve task slicing or start fresh sessions |
| Implementation and review share one context | Use a new session or non-forked review subagent |
| Large logs, tests, or searches dominate context | Isolate the work in a fresh subagent |
| Useful personal practice recurs | Evaluate it as a team practice or shared candidate |

These are investigation suggestions, not automatic changes. For example, repeated permission prompts do not by themselves justify broader permissions.

### Published Finding

The central system needs a compact structured record:

```text
Team and repository:
Analysis period and sessions examined:
Workflow stage:
Observed pattern and evidence count:
Effect on delivery, quality, risk, or effort:
Suspected cause and confidence:
Possible response:
Product-team responsibility:
Possible central harness-team contribution:
Engineer approval:
```

Raw conversations remain local by default. A detailed conversation may be shared separately for a specific incident when the engineer and appropriate repository owner approve it.

## Stage 3: Trusted Automation

Automation should increase only after teams have used the manual and approved-agent workflows long enough to understand:

- which findings are accurate and actionable
- what engineers routinely remove or correct
- which information teams are comfortable publishing
- how the central harness team uses the findings
- whether submitted findings lead to visible improvements

Automation can then progress in small steps:

1. Schedule local draft generation while keeping publication manual.
2. Aggregate approved findings automatically at team level.
3. Cluster recurring patterns across teams with a central agent.
4. Automatically publish only pre-agreed low-risk metadata or structured findings.
5. Keep content-assisted findings and exceptional evidence subject to review unless a later decision explicitly changes that boundary.

Every automated report should remain visible to the engineer or team that produced it, and teams should be able to correct inaccurate findings.

## Health-Check Preflight

The workflow can prepare evidence before a full-team harness health check. Each engineer contributes a short snapshot:

```text
Environment warnings:
Largest or unexplained fresh-session context sources:
Unused or failing skills, agents, plugins, or MCP servers:
Recurring correction, manual work, permission friction, or verification gaps:
Session and independent-review practices:
One approved improvement candidate:
```

The team-level preflight aggregates these findings before the meeting. The meeting can then validate the patterns, inspect one representative workflow and one consequential harness component, and select an owned improvement.

The preflight is evidence preparation, not a score. Engineers with little session history or restricted repositories can provide observations manually.

## Team And Central Use

The product team decides whether a finding is a one-time event, a local improvement, an experiment, a shared candidate, or a risk requiring escalation. Repository-specific action needs collective team participation and a maintenance path.

The central harness team clusters approved findings to identify shared context problems, skill failures, reusable automation, evaluation cases, permission concerns, and successful local practices. It returns a visible disposition:

```text
Local action
Needs more evidence
Central investigation
Cross-team evaluation
Shared capability planned
Deferred or no action, with rationale
Completed and evaluated
```

Teams will stop participating if findings disappear into a central backlog without a decision.

## Essential Boundaries

- Engineers control the scope and approve what is published during the first two stages.
- Central reports contain structured findings rather than raw conversations by default.
- Reports improve the harness and must not be used to rank engineers or measure individual performance.
- The agent does not broaden permissions, enable integrations, or modify shared assets from an unvalidated finding.
- Repository classification and company policy determine whether conversation content can be analyzed and which model may process it.

## Ownership

- **Engineer:** selects local evidence, corrects the analysis, and approves publication.
- **Product team:** validates workflow meaning and owns repository-specific improvement.
- **Central harness team:** owns the report contract, cross-team synthesis, shared capability, and response to published findings.
- **Platform and security owners:** provide approved analysis, storage, access, and retention controls.

## Minimum Viable Implementation

The first local agent should:

1. Analyze only the current repository and a short recent period.
2. Start manually and allow session exclusion.
3. Detect a small set of high-value patterns.
4. Generate a local draft.
5. Require engineer review and approval.
6. Publish only the structured finding.
7. Return the central disposition to the engineer and team.

Evaluate whether findings are accurate, quick to review, safe to publish, and useful enough to produce real improvements. Do not measure success by sessions scanned or reports generated.

## Relationship To Other Documents

- `ai-harness-team-discovery-and-feedback.md` defines the broader discovery and continuous-feedback system.
- `ai-harness-team-discovery-meeting-template.md` defines the full-team health-check discussion that consumes the preflight.
- [Claude Code Engineering Guideline](../guidelines/claude-code-engineering-guideline.md) defines individual Claude environment and session practices.
- `agent-workflow-evaluation.md` defines how the local agent and resulting experiments should be evaluated.

## Summary

Begin with engineers reviewing and submitting their own harness findings. Introduce a local agent to prepare the analysis once the team understands what useful evidence looks like, while keeping publication under engineer control. Automate collection and aggregation only after the findings are trusted, their use is visible, and teams understand the boundaries.

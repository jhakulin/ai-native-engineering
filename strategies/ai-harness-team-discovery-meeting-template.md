# AI Harness Team Discovery Meeting Template

## Purpose

This template supports a focused 60-minute discussion about the team's AI harness and engineering workflow. The session surfaces evidence-backed delivery bottlenecks and prioritizes at least one for joint follow-up. It also establishes a lightweight route for continuing feedback. The minimum useful result is:

- one representative engineering workflow understood from intent to accepted outcome
- one concrete source of friction, rework, waiting, risk, or repeated manual effort
- one meaningful finding about how the team's AI harness is maintained
- at least one agreed delivery bottleneck and a bounded next step with collective product-team participation, explicit action responsibilities, and a clear AI harness-team contribution
- one continuing feedback route integrated into an existing team practice

Use `ai-harness-team-discovery-and-feedback.md` for the complete discovery framework, evidence model, opportunity assessment, and continuous-feedback design.

## Working Agreement

Make the ownership model visible before asking the team for feedback:

> We are here to improve the harness with you. Your team has the delivery knowledge; we bring shared capabilities, cross-team patterns, evaluation methods, and implementation support. We need the delivery team to contribute examples, validate findings, shape what works locally, and keep team-specific parts current. Today we want to surface real delivery bottlenecks and agree on at least one that we can work on together next, including what should remain local and where central enablement can help.

Repository-specific improvements use product-team evidence, validation, and maintenance. Decision, coordination, validation, and maintenance responsibilities may be distributed across appropriate people or roles. The central team contributes expertise and implementation support while the delivery team preserves repository-specific knowledge, decisions, and maintenance. Shared platform, compatibility, and governance work remains a central contribution.

## Full Delivery Unit As The Default

Invite the full team that collectively moves work from intent to an accepted production outcome. The delivery unit may include software engineers, product, quality, design, operations, or other roles when they participate regularly in defining, building, verifying, releasing, or operating the product. Include occasional governance or specialist stakeholders when the selected workflow materially depends on their decisions.

The full team is the preferred unit because AI-assisted delivery and harness maintenance are collective concerns. A representative interview may miss differences in how team members find context, use instructions and skills, verify agent output, handle downstream work, or maintain shared assets. Full-team participation also reveals personal workarounds, uneven access to repository knowledge, conflicting trust boundaries, and maintenance that has silently concentrated on one person.

Structure the full-team discussion so seniority, role boundaries, or enthusiasm for AI do not suppress contrary evidence. Begin with individual reflection, collect written input on a shared surface, invite short clarification across roles, record disagreements, and provide a private asynchronous feedback route. When a smaller representative session is necessary, label its findings preliminary and return them to the full team for validation.

## Preparation Request

Ask the team to bring evidence that already exists:

- one recent representative task and its pull request or resulting change
- the repository's primary agent instructions, if they exist
- one reusable skill, prompt, script, agent, tool configuration, or other harness component
- one example where AI-assisted work helped, failed, created rework, or required substantial manual steering

Share the [Claude Code Engineering Guideline](../guidelines/claude-code-engineering-guideline.md) in advance. In the invitation, use the published link that participants can access rather than this repository-relative source link.

Before the meeting, ask the delivery team to run the health checks through its local harness. The local harness uses the existing Claude Code `/doctor`, `/insights`, and fresh-session `/context all` commands together with engineer review of recent work to prepare findings. Engineers review and approve the local analysis before the team shares it for the meeting. [Local Harness Insights And Health Check](local-harness-insights-and-health-check.md) defines this workflow. Use approved findings to focus the meeting; do not request raw conversations from participants.

Use an ordinary recent task that participants remember well; normal work often reveals the most reusable problems.

### Invitation Text

```text
Purpose

We will examine evidence from real delivery work to understand how the engineering workflow and AI harness support the delivery unit and to surface delivery bottlenecks. We want evidence from every role involved in moving work from intent to an accepted outcome.

Meeting goals

- Identify at least one real, evidence-backed delivery bottleneck that the product team and AI harness team can work on together next.
- Agree a lightweight way to continue sharing evidence about harness value, failures, rework, maintenance burden, and improvement needs.

How we will work together

We are here to improve the harness with you. Your team has the delivery knowledge; we bring shared capabilities, cross-team patterns, evaluation methods, and implementation support. We need the delivery team to contribute examples, validate findings, shape what works locally, and keep team-specific parts current. Together, we will identify what should remain local and where central enablement can help.

Before the meeting

- Run the health checks through your local harness.
- Review and approve the resulting analysis as a team, then bring the findings you want to discuss.
- Bring one recent task and pull request that represent normal work.
- If possible, be ready to show the repository's agent instructions and one skill, prompt, script, tool configuration, or other harness component that the team uses or maintains.
- Follow the shared Claude Code Engineering Guideline: [insert the published, team-accessible link before sending].

Agenda — 60 minutes

- Align on the product context, representative task, and observations from across the delivery flow.
- Explore the recent workflow, its bottlenecks, and how the AI harness is used and maintained.
- Converge on at least one evidence-backed bottleneck, a joint next action, and a continuing feedback route.

Expected outcome

Evidence-backed delivery bottlenecks, with at least one prioritized for a concrete joint next step, plus an agreed route for continuing feedback.
```

## Facilitator Preparation

Before the meeting, record only the context that is easy to establish:

```text
Team:
Repository or repositories:
Product or service:
Participants and roles:
Known AI tools or harness entry points:
Representative task proposed:
Known product, security, compliance, or operational constraints:
```

Limit advance preparation to readily available context. Use the meeting to reveal how the team interprets and uses its system, including knowledge that is not apparent from files alone.

## 60-Minute Full-Team Meeting

Use three flexible phases rather than a speaking schedule. Aim to spend roughly 10 minutes aligning and 35 minutes exploring, then protect the final 15 minutes for convergence. Treat these as facilitation checkpoints: follow useful evidence within a phase, record secondary branches for later, and move to convergence in time to produce the required outcome.

### Align: Context And Individual Evidence

Frame the discussion around the engineering system and accepted delivery outcomes. Failed experiments, manual workarounds, and missing controls are useful evidence. Read the working agreement aloud to establish joint diagnosis and shared follow-up.

Ask:

- What does this repository deliver?
- Which kinds of failures or delays matter most?
- Which normal work type does the selected example represent?

Capture:

```text
Important user or business outcome:
Important risk or failure boundary:
Selected work type:
Why the example is representative:
```

#### Collect Individual Observations

Before open discussion, give each participant a few minutes to record observations independently. Ask everyone to contribute at least one signal from their part of the delivery flow:

```text
Where does AI or the harness help accepted delivery?
Where does it create rework, waiting, uncertainty, or risk?
What manual step or workaround recurs?
Which instruction, skill, tool, check, or other harness component is difficult to maintain?
What could the product team improve locally?
What shared capability or support would make that possible?
```

Collect the observations on a shared surface and cluster them without debating every item. Written input counts as participation; invite short clarification from different roles where it helps interpret the evidence. Preserve contradictory experiences rather than forcing immediate consensus because differences may reveal inconsistent harness versions, access, practices, work types, or risk boundaries.

### Explore: Workflow And Harness

Follow the selected task from intent to accepted result. Examine relevant harness components and maintenance as they appear in the walkthrough, then use the detailed prompts below to fill material gaps. Record secondary bottlenecks without following every branch during the meeting.

#### Follow One Recent Workflow

Walk through the example from initial intent to accepted result. Include clarification, context discovery, implementation, testing, review, integration, deployment, and correction where relevant. Keep the discussion tied to what happened rather than what the process is supposed to be.

Ask:

- What information was available when work started, and what had to be discovered later?
- Where did the engineer or agent obtain repository, product, and architectural context?
- Which steps were manual, repeated, or dependent on specialist knowledge?
- Where did the work wait, fail, return for correction, or require substantial steering?
- Where did AI materially help, and where did it add work or uncertainty?
- What evidence established that the outcome was acceptable?

Capture:

```text
Task intent and acceptance evidence:
Important context sources:
Manual or repeated steps:
Waiting, handoffs, and corrections:
Useful AI contribution:
AI-related rework or uncertainty:
Checks, review, and runtime evidence:
```

First establish whether an observed inconvenience is recurrent, consequential, and connected to the workflow, harness, repository, or surrounding engineering system before proposing automation.

#### Examine Harness Maintenance

Harness maintenance receives dedicated time because agent behavior depends on instructions, skills, tools, permissions, models, context sources, and checks remaining understandable and current.

Prioritize the first question in each group below. Use the remaining questions as probes when the evidence or time justifies them; preserve them for deeper follow-up rather than rushing through the complete list.

Begin with the current harness boundary:

- Which instructions, skills, prompts, commands, agents, hooks, extensions, plugins, MCP servers, scripts, indexes, evaluations, model settings, and permissions materially shape agent behavior?
- Which source is authoritative for each consequential component?
- Which components are repository-specific, shared, external, generated, or copied?

Then reconstruct one recent harness change:

- What changed, and what event triggered the change?
- Who owned and reviewed it?
- What evidence suggested the change was correct?
- How did the team or other consumers receive the new version?
- Can the team identify which version affected a particular agent run?
- How would the team detect a regression and roll back or disable the change?

Finally, examine maintenance burden and lifecycle gaps:

- Which instructions or assets may be stale, conflicting, duplicated, unowned, or unused?
- Where does maintenance require manual copying or reconciliation across repositories?
- Which compatibility, dependency, permission, or model changes are difficult to detect?
- Which components depend on undocumented knowledge or one person?
- How are assets deprecated and retired?

Capture:

```text
Harness components examined:
Authoritative sources:
Owners and approval boundaries:
Recent change and trigger:
Review and evaluation evidence:
Distribution and active-version resolution:
Permissions or sensitive capabilities:
Rollback or disable mechanism:
Known drift, conflict, duplication, or obsolete assets:
Current manual maintenance burden:
Most important maintenance gap:
Missing evidence:
```

An inability to identify authority, ownership, the active version, evaluation evidence, or rollback is itself a finding. Record the uncertainty rather than inferring a safe default.

### Converge: Prioritize And Agree Follow-Up

Protect the final 15 minutes for this phase. Prioritize at least one bottleneck from the evidence already collected rather than opening a new discovery branch.

Ask:

> If one source of friction or harness risk were substantially improved, which change would most improve accepted delivery?

Determine which layer appears to own the response:

- repository navigation, documentation, or context
- task definition or planning
- deterministic script, hook, test, linter, CI check, or monitoring
- skill, agent, or governed workflow
- harness ownership, versioning, evaluation, distribution, or retirement
- engineering practice, coaching, policy, or permission boundary
- product, architecture, or organizational decision that should not be automated

Treat this as an initial classification. Record alternative explanations and missing evidence before committing to a solution.

Return to the individually collected observations before selecting the finding. Confirm that the selected issue represents the delivery system rather than only the loudest participant's experience. Record important minority findings separately when they indicate a different role, work type, access level, or risk condition.

For the selected bottleneck, answer both responsibility questions:

1. What must the product team change, validate, or maintain locally?
2. What should the central harness team provide, standardize, or coordinate across teams?

Separate repository-specific product-team responsibilities from the shared platform, compatibility, and governance contributions of the central harness team.

Capture:

```text
Observed problem:
Concrete evidence:
Affected outcome:
Frequency or recurrence:
Current workaround:
Likely cause:
Possible response layer:
Product-team responsibility:
Central harness-team contribution:
Product-team participation and maintenance approach:
Decision responsibility:
Validation responsibility:
Coordination responsibility:
Maintenance responsibility:
Local constraints and risks:
Alternative explanation:
Evidence still needed:
```

#### Confirm Joint Follow-Up

Close by reading back the selected delivery bottleneck and maintenance gap. Confirm that participants recognize the description and distinguish observed evidence from interpretation.

Agree on:

- how the delivery team will validate the factual summary
- which missing evidence should be checked
- whether a bounded experiment or deeper assessment is justified
- the first bounded action the product team and AI harness team will take together
- how the delivery team will participate in the next decision, experiment, validation, and local maintenance
- who or which roles will decide, validate, coordinate, and maintain the agreed follow-up; these responsibilities may be shared or different
- what the central harness team will provide or coordinate
- when the team will see the disposition of its feedback
- which existing team practice will carry evidence about harness value, failures, rework, maintenance burden, and improvement needs
- how participants can add or correct sensitive feedback privately after the meeting

End with a prioritized finding, an explicit next action, and visible responsibilities. A valid conclusion may also be that more evidence is required or that no shared harness change is justified.

## Representative-Interview Fallback

When the full delivery unit cannot attend, interview two or three participants who collectively cover implementation, technical ownership, and downstream acceptance. Use the same workflow and harness-maintenance questions, then circulate the profile to the complete team.

State explicitly which roles were absent and which findings require full-team confirmation. Offer a short asynchronous form or private channel for corrections, contradictory experiences, failed experiments, and maintenance work that participants may not want to raise publicly.

## Post-Meeting Team Profile

Produce a short factual record soon after the meeting:

```text
# Team Discovery Profile

Team and repository:
Participants and date:
Product outcome and important risks:
Representative workflow:

## Workflow Finding

Observed friction:
Concrete example and evidence:
Effect on delivery, quality, risk, or engineering effort:
Current workaround:
Likely cause and alternative explanations:

## Harness Maintenance Finding

Components examined:
Authority and ownership:
Recent change and evaluation method:
Version and distribution model:
Maintenance burden:
Principal gap or uncertainty:

## Candidate Follow-Up

Possible response layer:
Product-team responsibility:
Central harness-team contribution:
Product-team participation:
Local maintenance path:
Local constraints:
Missing evidence:
Team validation approach:
Decision responsibility:
Experiment coordination responsibility:
Validation responsibility:
Maintenance responsibility:
Continuing feedback route:
Review point:
```

Send the profile to participants for factual correction. Ask them to correct evidence, context, and attribution rather than requiring agreement with an untested proposed solution.

Where experiences differ, preserve the variants and their contexts in the profile. Describe whose experience each finding represents instead of generalizing a majority view to every team member.

## Minimum Quality Check

Before treating the meeting as complete, confirm:

- the findings refer to a concrete example rather than only general opinion
- the accepted outcome and relevant risk are understood
- observed evidence is separated from suspected cause and proposed response
- every delivery role had an opportunity to contribute before open prioritization
- meaningful disagreements and role-specific experiences were retained
- at least one relevant harness-maintenance concern or gap was examined
- unresolved authority, active-version, evaluation, or rollback questions are recorded as missing evidence where they matter
- the product-team responsibility and central harness-team contribution are distinguished
- at least one evidence-backed delivery bottleneck and a bounded joint next step have been selected
- continuing harness feedback has an agreed route through an existing team practice
- the next decision, validation, coordination, and maintenance responsibilities are explicit without assuming that one person must own all of them
- the team will receive a visible response to the feedback it supplied
- participants have a private route for corrections or sensitive feedback

The wider discovery framework contains additional questions about repository readiness, governance, context, quality, assets, metrics, and lifecycle. Record relevant gaps for follow-up instead of treating them as requirements for completing this initial meeting. If the core conditions above are not met, describe the result as preliminary rather than filling gaps with assumptions.

## Relationship To Other Documents

- [Claude Code Engineering Guideline](../guidelines/claude-code-engineering-guideline.md) defines the shared project baseline and the engineer routine for environment health, session context, independent review, and token awareness.
- `local-harness-insights-and-health-check.md` defines the local insights agent, approved report contract, and health-check preflight.
- `ai-harness-team-discovery-and-feedback.md` defines the complete cross-team discovery and continuous-feedback system.
- `ai-harness-engineering.md` describes the components and control layers that constitute an AI harness.
- `ai-assisted-code-quality-control.md` provides deeper guidance for reviewing AI-assisted changes and correction loops.
- `ai-asset-registry.md` applies when a local practice or harness component becomes a candidate shared asset.
- `agent-workflow-evaluation.md` applies when a finding leads to a bounded workflow experiment.

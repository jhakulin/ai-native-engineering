# Product Workflow Map

Status: experiment

## Summary

Test a lightweight product workflow map before turning PM work into templates, skills, agents, or automations.

The map should identify recurring PM activities, the inputs they need, the judgment points that stay human-owned, the outputs that engineering and agents consume, and the verification evidence expected before work moves forward.

## Related Strategy Documents

- `strategies/ai-native-product-management.md`
- `strategies/ai-harness-engineering.md`
- `strategies/ai-assisted-engineering-process.md`
- `strategies/ai-engineering-metrics.md`

## Problem Or Opportunity

AI-native PM work can become uneven when high-fluency people build private workflows while the rest of the organization keeps working from thin tickets, meetings, and ad hoc prompts. Teams then automate scattered tasks without first deciding which product work should be standardized, assisted, automated, or kept under explicit human judgment.

A product workflow map gives PMs, engineers, and agents a shared operating view before implementation speed increases. It helps the team avoid creating one-off agents for unclear work, and it gives product leaders a concrete way to review backlog intake, discovery, handoff, and acceptance workflows.

## Hypothesis

If a team maps one recurring PM workflow before automating it, then the resulting AI assistance will be easier to adopt, easier to review, and less likely to move low-evidence work into delivery.

The useful map classifies each step as one of:

- human judgment
- agent-assisted draft or synthesis
- repeatable automation
- required verification or approval
- unresolved context gap

## Proposed Experiment

Choose one workflow, such as backlog intake, feature-request triage, discovery-to-prototype, or product-to-engineering handoff.

Run a two-week experiment:

1. Map the current workflow from request or signal through product decision, engineering-ready artifact, acceptance checks, and review proof.
2. Identify the minimum context contract for that workflow: customer problem, target user, evidence, intended outcome, constraints, non-goals, decision owner, acceptance expectations, and verification proof.
3. Mark which steps require human judgment and which steps can be drafted, summarized, compared, routed, or checked by an agent.
4. Build the smallest reusable artifact needed for the workflow: a template, checklist, skill proposal, or project context pack.
5. Test it against five representative historical or current items.
6. Compare the result with the team's normal workflow for clarification cycles, missing context, time to engineering-ready work, and review confidence.

## Evidence And Confidence

Confidence: medium-high.

Recent practitioner examples point in the same direction: teams get better results when they first map the work, encode useful playbooks into shared skills or projects, and connect discovery evidence to implementation artifacts and acceptance proof.

Relevant public sources include:

- [How to Build a Company OS in Claude Code | Jiaona Zhang | Product Growth](https://www.youtube.com/watch?v=qsDX0PMKcaE)
- [Building with Liatrio | From Discovery to Developer-Ready: An AI-Native Product Workflow](https://www.youtube.com/watch?v=xgP1w_zeFF8)
- [Stop Repeating Yourself to Claude AI | Projects & Workflows for Business Leaders](https://www.youtube.com/watch?v=qGqoX8CYR7s)
- [AI Product Management in 2026: The AI Native Product Loop](https://www.productleadership.com/blog/ai-product-management-ai-native-loop/)

The evidence is strong enough for an experiment, but not enough to promote a single canonical workflow. The right artifact depends on the team's product domain, source systems, tooling, and review expectations.

## Risks And Unknowns

- The map can become busy process documentation if it is not tied to one repeated workflow.
- Teams may over-automate steps that should remain product-owner decisions.
- Poor source hygiene can make the workflow look better in a demo than it performs in a real backlog or documentation system.
- A new skill or template may duplicate existing strategy guidance unless the experiment proves a distinct repeatable trigger and output.
- ROI can be overstated if time saved is not paired with rework, defect, clarification, and adoption signals.

## Next Step

Owner role: product lead with an engineering lead or delivery lead.

Next step: select one active workflow and draft the first workflow map in a working session with PM, engineering, and QA representation.

Success measures:

- fewer clarification cycles before implementation
- higher percentage of work items with clear evidence, constraints, non-goals, and acceptance checks
- shorter time from product decision to engineering-ready artifact
- reviewers can trace implementation work back to product evidence and expected proof
- the team identifies whether a template, skill, or no durable artifact is the right next move

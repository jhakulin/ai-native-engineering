# Product Workflow Map

Status: experiment

## Summary

Test a lightweight product workflow map before turning PM work into templates, skills, agents, or automations.

The map should identify recurring PM activities, the context sources they need and how fresh or authoritative those sources are, the judgment points that stay human-owned, the outputs that engineering and agents consume, the actions an agent is permitted to take, and the verification or audit evidence expected before work moves forward.

## Related Strategy Documents

- `strategies/ai-native-product-management.md`
- `strategies/ai-harness-engineering.md`
- `strategies/ai-assisted-engineering-process.md`
- `strategies/ai-engineering-metrics.md`

## Problem Or Opportunity

AI-native PM work can become uneven when high-fluency people build private workflows while the rest of the organization keeps working from thin tickets, meetings, and ad hoc prompts. Teams then automate scattered tasks without first deciding which product work should be standardized, assisted, automated, or kept under explicit human judgment.

A product workflow map gives PMs, engineers, and agents a shared operating view before implementation speed increases. It helps the team avoid creating one-off agents for unclear work, and it gives product leaders a concrete way to review backlog intake, discovery, handoff, and acceptance workflows.

## Hypothesis

If a team maps one recurring PM workflow, its context contract, and its agent action boundary before automating it, then the resulting AI assistance will be easier to adopt, easier to review, and less likely to move low-evidence work or unsafe side effects into delivery.

The useful map classifies each step as one of:

- authoritative context source and freshness
- human judgment or decision
- agent-assisted draft or synthesis
- repeatable automation
- permitted action and reversible side-effect boundary
- required verification, approval, or audit record
- unresolved context gap

## Proposed Experiment

Choose one workflow, such as backlog intake, feature-request triage, discovery-to-prototype, or product-to-engineering handoff.

Run a two-week experiment:

1. Map the current workflow from request or signal through product decision, engineering-ready artifact, acceptance checks, and review proof.
2. Identify the minimum context contract for that workflow: customer problem, target user, evidence and source links, source owner or freshness expectation, intended outcome, constraints, non-goals, decision owner, acceptance expectations, permitted agent actions, escalation path, and verification or audit proof.
3. Mark which steps require human judgment and which steps can be drafted, summarized, compared, routed, or checked by an agent. State whether the agent may only recommend, may classify or route, or may take a bounded reversible action.
4. Build the smallest reusable artifact needed for the workflow: a template, checklist, skill proposal, or project context pack.
5. Test it against five representative historical or current items.
6. Compare the result with the team's normal workflow for clarification cycles, context completeness and traceability, recommendation acceptance or escalation, time to engineering-ready work, review confidence, rework or reversal, and cost. Use the result to decide whether a template, skill, or no durable artifact is the right next move.

## Evidence And Confidence

Confidence: medium-high.

Recent practitioner examples point in the same direction: teams get better results when they first map the work, encode useful playbooks into shared skills or projects, and connect discovery evidence to implementation artifacts and acceptance proof.

Relevant public sources include:

- [How to Build a Company OS in Claude Code | Jiaona Zhang | Product Growth](https://www.youtube.com/watch?v=qsDX0PMKcaE)
- [Building with Liatrio | From Discovery to Developer-Ready: An AI-Native Product Workflow](https://www.youtube.com/watch?v=xgP1w_zeFF8)
- [Stop Repeating Yourself to Claude AI | Projects & Workflows for Business Leaders](https://www.youtube.com/watch?v=qGqoX8CYR7s)
- [AI Product Management in 2026: The AI Native Product Loop](https://www.productleadership.com/blog/ai-product-management-ai-native-loop/)
- [How airfocus Is Rebuilding Product Ops Around AI Agents](https://www.youtube.com/watch?v=z-RvRK1X3BM)
- [Herman Errico: Inside the AARM Standard](https://www.youtube.com/watch?v=M8re46G7mz4)
- [Chapter 21: Product Operating Models Explained | Organizing Teams for Scale and Innovation](https://www.youtube.com/watch?v=_3myAtG_6HM)
- [How Marketers Should Really Work With AI Agents](https://www.youtube.com/watch?v=g8MLVVBkJn0)
- [AI Product Backlog Management: How to Triage Model Issues, Bugs, and Feature Requests](https://www.institutepm.com/knowledge-hub/ai-product-backlog-management)

The evidence is strong enough for an experiment, but not enough to promote a single canonical workflow. The right artifact depends on the team's product domain, source systems, tooling, and review expectations.

## Risks And Unknowns

- The map can become busy process documentation if it is not tied to one repeated workflow.
- Teams may over-automate steps that should remain product-owner decisions.
- Poor source hygiene can make the workflow look better in a demo than it performs in a real backlog or documentation system.
- Vendor demonstrations and interviews can illustrate useful patterns without proving general effectiveness; the experiment must test representative work.
- Action-boundary or governance concepts may be too heavy for low-risk workflows, so the map should scale its controls to reversibility and impact.
- A new skill or template may duplicate existing strategy guidance unless the experiment proves a distinct repeatable trigger and output.
- ROI can be overstated if time saved is not paired with rework, defect, clarification, decision-quality, and adoption signals.

## Next Step

Owner role: product lead with an engineering lead or delivery lead.

Next step: select one active workflow and draft the first workflow map in a working session with PM, engineering, and QA representation.

Success measures:

- fewer clarification cycles before implementation
- higher percentage of work items with clear evidence, source links, constraints, non-goals, and acceptance checks
- reviewers can distinguish agent recommendations from human decisions and trace implementation work back to product evidence, the permitted action boundary, and expected proof
- shorter time from product decision to engineering-ready artifact without higher rework or reversal
- the team identifies whether a template, skill, or no durable artifact is the right next move

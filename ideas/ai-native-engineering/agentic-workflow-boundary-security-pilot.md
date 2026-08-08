# Agentic Workflow Boundary Security Pilot

## Status

experiment

## Related Strategy Documents

- [AI Harness Engineering](../../strategies/ai-harness-engineering.md)
- [AI-Native Engineering: Phased Adoption Plan](../../strategies/ai-native-engineering-phases.md)
- [AI Engineering Metrics](../../strategies/ai-engineering-metrics.md)
- [GitHub Agentic Assessment Workflow](../../strategies/github-agentic-assessment-workflow.md)

## Problem Or Opportunity

Agent workflows can be reviewed as if security were only a property of the generated code. That misses risks in the context, skills, tools, identities, and side effects available to the agent. The repository already describes scoped permissions, human approval, verification, and containment metrics, but it does not yet define a small experiment for measuring these boundaries together.

## Hypothesis

A workflow that separately observes generated artifacts, agent capabilities, and attempted side effects can improve containment and auditability without making low-risk work unusably slow or noisy. The experiment should measure utility and containment as related but separate outcomes.

## Proposed Experiment

1. Choose one low-risk, repeatable agent workflow with a fixed task set, permissions allowlist, and human approval point.
2. Record a baseline using the existing workflow and acceptance checks.
3. Add boundary-specific observation for generated artifacts, tool and context use, sensitive reads, file writes, outbound requests, and other relevant side effects. Keep enforcement outside the agent's editable instructions.
4. Model the control path separately: treat instructions as advisory, use runtime policy for coarse allow, deny, or ask decisions, and use deterministic hooks or policy gates for fine-grained checks. Record the policy decision and the resulting tool action in an append-only audit trail.
5. Start in observe-only mode, then enable blocking or human escalation for a small set of high-risk actions. If the workflow retries after a blocked or failed action, cap the retry count and require a clear stop condition.
6. Compare task completion, accepted outputs, protected-read attempts, blocked and allowed side effects, policy decisions, false positives, review burden, latency, and cost. Retain representative tasks so a guardrail change cannot improve containment by silently preventing useful work.
7. Stop or revise the pilot if controls materially reduce legitimate task completion, hide failed attempts, create unexplained noise, or change the intended test environment.

## Evidence And Confidence

Recent sources consistently describe the software factory—not only the generated application—as the relevant security boundary. They support separating advisory instructions from runtime enforcement, keeping deterministic checks outside the agent's editable context, bounding retries and loops, and auditing allowed and blocked behavior. The implementation evidence is recent and includes vendor demonstrations, practitioner discussions, and a conceptual masterclass rather than independent repository measurements. Confidence: medium-high for the control-path experiment; medium for generalization across runtimes.

## Risks And Unknowns

- Boundary telemetry may be incomplete or difficult to interpret across agent runtimes.
- Blocking rules can create false positives and shift work into manual review.
- A narrow pilot may not represent higher-risk workflows or production access.
- Security controls and task utility can trade off; a single blended score may hide that tradeoff.
- Vendor demonstrations may overstate generality, so the pilot should use repository-specific tasks and independent checks.

## Next Step

Proposed owner role: harness or security engineering lead.

Start by selecting one repeatable workflow and defining its protected resources, permitted side effects, approval boundary, and retained task set. Success means the team can explain relevant agent behavior, reduce high-risk attempts or make them reviewable, and preserve task completion and reviewability within an agreed cost and latency budget.

## Sources

- [Agentic Development Security — Ezra Tanzer, Snyk](https://www.youtube.com/watch?v=cgimkNGNjvU)
- [Shift to AI — Securing AI-Generated Code and the Software Supply Chain](https://www.youtube.com/watch?v=APUelXGDgHQ)
- [Agentic Development, From the Ground Up](https://www.youtube.com/watch?v=R0HDLGSY4Oc)
- [Announcing Agentic Development Security (ADS)](https://snyk.io/blog/agentic-development-security-ads/)
- [Perforce Agentic Gateway for the AI-Driven Development Lifecycle](https://www.perforce.com/press-releases/perforce-agentic-gateway)

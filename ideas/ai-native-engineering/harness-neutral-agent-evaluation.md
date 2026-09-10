# Harness-Neutral Agent Evaluation

## Status

candidate-plan

## Related Strategy Documents

- [AI Harness Engineering](../../strategies/ai-harness-engineering.md)
- [AI Engineering Metrics](../../strategies/ai-engineering-metrics.md)
- [GitHub Agentic Assessment Workflow](../../strategies/github-agentic-assessment-workflow.md)

## Problem Or Opportunity

Agent results can reflect the model, the harness, the tools, the context assembly, and the evaluator at the same time. A score from a model's native harness may therefore be difficult to compare with a score from another agent or with the behavior that ships in production.

## Hypothesis

A protocolized evaluation that keeps the subject agent separate from the evaluator and exposes tools and environments through a stable boundary will make harness sensitivity visible and reduce test-production mismatch. The experiment should improve attribution, not assume that a standardized harness is always better.

## Proposed Experiment

1. Choose two representative task families and define the same task, tool, environment, completion, and safety conditions for each run.
2. Record the subject model and version, native harness configuration, standardized harness configuration, evaluator, tool calls, context size, cost, latency, outcome, and human intervention.
3. Run each subject in its native harness and in a standardized condition with the evaluator separated from the subject agent.
4. Compare task success, verifier agreement, harness sensitivity, regression results, cost, latency, and policy violations. Include a small retained set and inspect cases where the harness swap changes the result.
5. Stop or revise the experiment if the standardized condition changes permissions, hides failures, or creates a test environment that no longer resembles the intended production workflow.

## Evidence And Confidence

A recent assessment discussion argues that tightly coupled benchmark harnesses can create test-production mismatch and that protocol boundaries can make cross-agent evaluation more comparable. This is a promising, single-source implementation hypothesis that requires repository-specific validation. Confidence: medium-high.

## Risks And Unknowns

- A standardized harness may remove useful native capabilities or favor one agent design.
- A judge or verifier can be gamed, especially when success is defined by a narrow output match.
- Protocol overhead may increase cost or latency.
- The repository may not yet have enough representative tasks or stable evaluator interfaces.

## Next Step

Proposed owner role: evaluation or harness lead.

Start with an offline comparison using recorded tasks and a fixed permissions allowlist. Success means the experiment can explain a meaningful fraction of outcome variance through harness conditions without degrading safety or making the test less representative.

## Sources

- [Your Agent's Benchmark Score Depends on the Harness, Not the Agent](https://www.youtube.com/watch?v=fG9z97V38_U)
- [Day 10: Harness Engineering - Case Study: Claude Code](https://www.youtube.com/watch?v=Wn05w0IbkJc)

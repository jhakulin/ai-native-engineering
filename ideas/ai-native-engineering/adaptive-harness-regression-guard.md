# Adaptive Harness With A Regression Guard

## Status

experiment

## Related Strategy Documents

- [AI Harness Engineering](../../strategies/ai-harness-engineering.md)
- [AI Engineering Metrics](../../strategies/ai-engineering-metrics.md)
- [AI-Native Engineering: Phased Adoption Plan](../../strategies/ai-native-engineering-phases.md)

## Problem Or Opportunity

A single static harness may use the same context assembly, tool set, orchestration, memory behavior, and output checks for tasks with very different shapes. An adaptive harness could select a smaller or richer workflow for the task at hand, but adaptation can also overfit recent tasks and weaken previously reliable behavior.

## Hypothesis

A bounded experience bank can improve task-family performance when it recommends harness configurations without silently changing permissions or acceptance rules. The improvement is worth adopting only if a retained regression set stays stable or improves and the added context, latency, and cost remain acceptable.

## Proposed Experiment

1. Choose two or three representative task families, such as routine code changes, unfamiliar-repository debugging, and review or verification work.
2. Define a static-harness baseline with the same model, tools, permissions, and acceptance checks.
3. Represent the harness as separate, inspectable choices for model selection, context assembly, memory, tools, environment, orchestration, evaluation and reward, control and safety, observability, and output processing.
4. Add a bounded experience record containing the task shape, selected configuration, evidence, outcome, cost, and reviewer feedback. Keep per-task records separate from distilled cross-task patterns.
5. Let an adaptive selector recommend a configuration; require compatibility checks and a human-reviewed allowlist for any permission, tool, or workflow change.
6. Keep materially different configurations isolated when an improvement for one task family could interfere with another; route tasks only to variants that have passed the relevant checks.
7. Run the baseline and adaptive versions against both new tasks and a retained regression set, matching the model, tools, permissions, inference budget, and feedback opportunities across comparisons.
8. Compare the adaptive version with an equal-budget static baseline and a simple parallel-sampling or task-local adaptation baseline when practical. Evaluate on held-out tasks, not only the tasks used to shape the harness, and use an independent verifier or targeted human review for final acceptance.
9. Compare pass rate on new tasks, held-out pass rate, retained-task pass rate, regression count, verifier agreement, cost, latency, and human intervention. Stop the experiment if regressions, unexplained behavior, verifier gaming, or review burden increase.

## Evidence And Confidence

The opportunity is supported by practitioner discussions of loop engineering, adaptive harnesses, bounded experience retrieval, modular harness components, and regression control. The new evidence describes typed component boundaries, trace digestion, variant isolation, and verifier-gaming failure modes, but remains research- and presentation-led rather than independently replicated. Confidence: medium.

## Risks And Unknowns

- A small or biased task set may make adaptation look better than it is.
- Retrieved experience may contain stale or misleading advice.
- More context can increase token use and latency even when caching reduces some cost.
- Adaptive orchestration may make failures harder to explain.
- A candidate configuration may optimize a verifier or reward signal without improving the underlying task; use independent checks where practical.
- Reusing the same tasks, feedback, or evaluator for selection and final scoring can make ordinary search look like reusable harness improvement; preserve held-out tasks and matched-budget baselines.
- A growing rule set can create cross-task interference; prefer isolated variants over unbounded prompt accumulation.
- Permission or tool selection must not become an uncontrolled self-modification path.
- The useful level of adaptation may differ by task family and repository.

## Next Step

Proposed owner role: harness or developer-productivity lead.

Start with an offline comparison using recorded tasks and a manually reviewed configuration allowlist. Success means improved or equal retained-task performance, a measurable benefit on at least one target task family, and no unacceptable increase in cost, latency, or review burden.

## Sources

- [What is Loop Engineering?](https://www.youtube.com/watch?v=yvP_AAirOQc)
- [Loop Engineering: The #1 Skill DevOps Engineers Are Missing in 2026](https://www.youtube.com/watch?v=7sJTv1cYs50)
- [Podcast | Adaptive Agent Harness](https://www.youtube.com/watch?v=BrETqwWRIoM)
- [Regression Control: why agent optimizers only compound with a guard](https://www.youtube.com/watch?v=x6WtsUEvrAg)
- [Sandboxing, Agent Harnesses, and Agent Teamwork](https://www.youtube.com/watch?v=31IS2mnRV6Q)
- [HarnessX: A Composable, Adaptive, and Evolvable Agent Harness Foundry](https://www.youtube.com/watch?v=IA5KIeO8K_A)

# Layered Skill Package Safety Evaluation

## Status

experiment

## Related Strategy Documents

- guidelines/skill-guideline.md
- skills/review-agent-skill/SKILL.md
- strategies/ai-harness-engineering.md

## Problem Or Opportunity

The repository already requires narrow triggers, guardrails, and final verification for skills, but it does not yet define a small repeatable evaluation set for the whole skill package. A skill can be safe in its main `SKILL.md` while a referenced file or executable helper introduces a hidden instruction, an unbounded data access pattern, or a trigger boundary that is too broad.

## Hypothesis

A compact evaluation matrix covering trigger boundaries, supporting-file trust, tool and permission constraints, and output verification will catch material skill failures earlier than reviewing the main `SKILL.md` alone. The matrix should improve review reliability without turning every skill into a large test framework.

## Proposed Experiment

Select two or three existing model-invoked skills with supporting files. For each skill, prepare a small review fixture with:

- an intended in-scope request;
- a nearby false-positive request;
- a supporting-file instruction that should be treated as content rather than authority;
- a request that would exceed the documented tool, data, or approval boundary; and
- an expected output and verification condition.

Run the current review process and the package-level matrix against the same fixtures. Record which seeded issues are found, false-positive findings, reviewer time, and approximate context load. Keep the matrix as a review aid until the results show a stable benefit; only then consider a deterministic validator or reusable testing asset.

## Evidence And Confidence

Official skill documentation describes frontmatter as a trigger surface and skills as packages that can execute tools or code, which makes the package a security surface. Security research argues for cross-file review and structured auditing of `SKILL.md`, references, and scripts. A guardrails tutorial demonstrates layered input, model, and output controls plus broader positive and negative test data. The mapping from agent guardrails to repository skill review is an inference, so confidence is medium-high for the experiment and lower for automatic enforcement.

## Risks And Unknowns

- A small fixture may miss tool-specific or runtime-specific failures.
- Adversarial test content can create noise if reviewers treat it as executable instructions.
- More checks may slow review or encourage mechanical approval.
- It is unknown which checks can be made deterministic without a model or target-specific harness.

## Next Step

The skill-maintainer role should run the matrix on two existing skills and compare it with the current review output. Success means the matrix identifies seeded trigger, package-trust, boundary, and output failures with fewer missed issues and no material increase in false positives or review burden.

## Sources

- [Agent Skills – Claude Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Under the Hood of SKILL.md: Semantic Supply-chain Attacks on AI Agent Skill Registry](https://arxiv.org/abs/2605.11418)
- [Structured Security Auditing and Robustness Enhancement for Untrusted Agent Skills](https://arxiv.org/abs/2604.25109)
- [Advanced Guardrails for AI Agents](https://www.youtube.com/watch?v=rMUycP_cp9g)

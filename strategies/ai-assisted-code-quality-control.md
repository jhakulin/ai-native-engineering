# AI-Assisted Code Quality Control

## Purpose

This document explains how deterministic checks, model-based review, human judgment, and runtime feedback work together to control the quality of AI-assisted code changes.

Faster implementation does not create justified confidence. Generated code may satisfy an immediate request while introducing regressions, unsafe assumptions, unnecessary complexity, or behavior that conflicts with product intent. Quality control must establish whether a change is correct, understandable, and safe enough for its risk.

This is a vendor-neutral strategy rather than a tool prescription. Tools and models may change, but the responsibilities of verification, review, acceptance, and feedback remain.

## Quality Is A Lifecycle Property

Code quality is often treated as a property of a diff: a reviewer reads the change and decides whether the code looks good. That view is too narrow for agent-assisted development. A change can be locally clean while solving the wrong problem, violating an external contract, failing under realistic use, or creating an operational condition that is visible only after deployment.

Quality control begins before implementation and continues after release. Before implementation, the team clarifies intent, constraints, risk, and acceptable evidence. During implementation, deterministic tools and execution feedback expose concrete failures. Before integration, model and human reviewers inspect broader risks. After release, runtime and user signals reveal whether the accepted evidence represented the real system.

```text
intent and risk
      |
      v
implementation <---- deterministic correction
      |
      v
model review -----> supported findings and questions
      |
      v
shared CI and integration evidence
      |
      v
human decision proportional to risk
      |
      v
runtime and user feedback
      |
      +----> improve code, tests, context, or guardrails
```

The loop is effective only when evidence changes the next decision. Logs that nobody evaluates are observability, not quality control. Tests that can fail without affecting acceptance provide information, but they are not gates. Model comments that are copied into a pull request without confirmation create activity, not confidence.

## The Quality-Control Layers

The layers below have different strengths and failure modes. They should complement one another rather than repeat the same generic review several times.

### Product Intent And Acceptance Context

Quality control starts with a clear account of what the change is intended to accomplish. An agent cannot reliably distinguish a clever implementation from an unnecessary feature if it does not know the customer problem, important constraints, and what evidence would demonstrate success.

The implementation context should make the intended behavior and meaningful boundaries visible. For a small change, this may be a concise task description and a few acceptance examples. For a consequential change, it may also include affected contracts, non-goals, migration constraints, security expectations, operational risks, and the person accountable for accepting the result.

This layer prevents a particularly expensive class of failure: technically valid work that should not have been built in its current form. Later review layers can detect defects in an implementation, but they are poor substitutes for missing product or architectural judgment.

### Deterministic Implementation Checks

Deterministic checks evaluate properties that can be stated and tested mechanically. Typical examples include compilation, type checking, formatting, linting, unit and integration tests, contract tests, schema validation, dependency checks, and security scanning.

These checks should run early because they are repeatable, relatively cheap, and capable of producing actionable evidence. When integrated into an agent loop, a failing result can be returned directly to the implementing agent for correction. This removes routine defects before they consume model-review or human-review attention.

Deterministic does not mean complete. A passing test suite proves only the behavior represented by those tests. A linter recognizes encoded patterns but cannot usually determine whether the product behavior is appropriate. A security scanner covers known classes of weakness but cannot establish that a system is secure. Deterministic checks create strong evidence within a defined boundary; the boundary must remain visible.

Running the software also matters. A change may satisfy unit tests while the application fails to start, an interface renders incorrectly, or an end-to-end user journey is broken. Depending on the change, execution evidence may include browser tests, API probes, screenshots, traces, performance measurements, or a deploy preview.

#### Tests Are Reviewed Evidence

Agent-generated tests are proposed evidence, not an independent guarantee. A test can repeat the implementation's mistaken assumption, assert an incidental implementation detail, omit the important boundary, or test framework behavior rather than the product contract. Review tests against intended behavior and failure conditions, not only against whether they pass.

Use progressive verification. Start with the narrowest test that gives rapid feedback, then run the relevant suite and broaden to contract, integration, or end-to-end checks when the change crosses those boundaries. The environment must represent the property being claimed. A test against an in-memory database, mock service, or simplified configuration does not establish behavior that depends on the production database, external contract, concurrency model, authorization policy, or deployment configuration.

Test-driven development can make the correction loop more legible when a failing test represents agreed behavior before implementation begins. The useful property is not the ritual of writing the test first; it is the existence of a reproducible failure, a constrained change, and evidence that the behavior changed without breaking relevant surrounding behavior. Review the test itself before treating a green result as acceptance evidence.

### Local Model-Based Review

Model-based review uses an AI model to inspect a proposed change for defects, risks, unnecessary scope, and maintainability problems. It broadens the search beyond deterministic checks, particularly across unfamiliar or distributed code paths.

Model review produces hypotheses, not proof. Findings should identify relevant source, describe a plausible failure, and indicate how the claim could be verified. Reviewer configuration, independence, finding classification, and repository-specific context are discussed in **Model-Based Review Design**.

### Shared Pull-Request And CI Review

Local review depends on individual behavior and local state. A shared integration layer provides a consistent safety net when a change enters the repository. It can rerun deterministic checks in a controlled environment and invoke an automated reviewer against the complete proposed diff.

This layer is valuable even when local checks already ran. The branch may have changed, local configuration may differ from CI, generated files may be missing, or the developer may have skipped a step. Shared checks also make the acceptance evidence visible to other reviewers.

Automated pull-request findings should use the classifications and evidence standards defined in **Finding Quality And Severity**. Only supported, material findings should affect integration.

### Risk-Based Human Review

Humans provide context and accountability that models and deterministic tools do not possess reliably. They can evaluate whether the change reflects product intent, whether an architectural tradeoff is acceptable, whether residual risk is justified, and whether the combined evidence is sufficient for the consequences of failure.

Human review should be proportional to risk rather than identical for every change. A documentation correction or isolated cosmetic adjustment may need only lightweight inspection after automated checks pass. Authentication, authorization, payments, public contracts, database migrations, infrastructure, sensitive data, and irreversible operations justify deeper review and, in some cases, specialist approval.

Human review does not require manually reperforming every automated check. Its highest-value role is to examine assumptions, boundaries, tradeoffs, and unsupported conclusions. Automation should reduce mechanical review burden so people can focus on decisions that require judgment.

Human understanding is itself part of the control system. For consequential systems, responsible engineers must retain enough understanding of important behavior, architecture, and operational failure modes to intervene when automation cannot diagnose or repair a problem. A workflow that produces accepted code while steadily removing human comprehension creates deferred operational risk.

### Runtime And User Feedback

Pre-merge evidence cannot represent every property of a running system. Production monitoring, error reporting, traces, synthetic checks, performance measures, and user behavior reveal conditions that emerge only with real data, concurrency, integrations, scale, or usage patterns.

Runtime feedback should connect to decisions. A reliability signal may trigger rollback or investigation. A user outcome may show that technically correct behavior did not solve the intended problem. A repeated incident may reveal that a pre-merge verifier, repository constraint, or architectural boundary is missing.

The closest reliable signal to the intended outcome should guide the loop. Tests and static checks provide implementation evidence. Runtime measures provide operational evidence. User and business measures indicate whether the change created the intended value. These signals answer different questions and should not be collapsed into one quality score.

## Model-Based Review Design

### Reviewer Independence

Review benefits from a perspective that is not fully coupled to the implementation process. A fresh context prevents the reviewer from simply continuing the implementing agent's reasoning. A different prompt or review role changes the criteria applied. A different model may introduce useful diversity because models can have different strengths and blind spots.

None of these choices guarantees independence. Two models may reproduce the same plausible mistake, and a fresh reviewer may still lack the same missing product context. Independence is strongest when model review is combined with ground truth from tests, tools, source evidence, or human domain knowledge.

The appropriate configuration depends on risk and cost. A routine change may use a fresh instance of the same model. A higher-risk change may justify a different model, specialized security review, expanded deterministic verification, and human approval. Cross-model review is a technique to evaluate, not a universal requirement.

### Finding Quality And Severity

Model reviewers often produce more findings than a team can use. Quality control therefore requires a distinction between defects, improvements, questions, and unsupported speculation.

| Classification | Meaning | Expected treatment |
| --- | --- | --- |
| Blocking defect | Supported correctness, security, contract, or material reliability problem | Resolve or explicitly accept the risk before integration |
| Non-blocking improvement | Supported maintainability or clarity improvement without material current risk | Consider without delaying the change by default |
| Question or uncertainty | Missing context or ambiguous behavior prevents a reliable judgment | Obtain evidence or human clarification |
| Unsupported finding | No convincing source evidence or reproducible failure supports the claim | Do not treat as a defect |

Severity should reflect impact and likelihood, not how confidently the model writes. A useful finding identifies the relevant source, the condition under which the problem occurs, the expected consequence, and the evidence needed to confirm or reject it.

### Same-Model And Cross-Model Review

Using the same model for implementation and review is convenient and may be sufficient for ordinary changes, especially when the review starts with fresh context. It can still detect omissions because the role, context, and attention pattern differ from implementation.

Using another model can increase diversity, but it can also add cost, inconsistent advice, and a second set of false positives. The value of cross-model review should be demonstrated on representative repository changes. The important comparison is not which reviewer writes the most comments, but which configuration finds more confirmed material defects without creating excessive review burden.

### Repository-Specific Review Context

Durable review context is most valuable when it captures information a general model cannot infer reliably. Examples include proprietary contracts, unusual architecture, data-handling rules, compatibility commitments, known concurrency constraints, and repository-specific definitions of acceptable proof.

Generic software advice should not be duplicated merely to make the context look comprehensive. Models change, and instructions that compensated for an older limitation can later become noise or harmful steering. Review context should be retained because observed results justify it, not because it has always been present.

## Iterative Correction Loops

An iterative correction loop uses review or verification evidence to revise a change until it is accepted, stopped, or escalated.

```text
implement
   |
   v
collect evidence
   |
   v
evaluate against acceptance criteria
   |
   +---- accepted ----> complete
   |
   +---- supported failure ----> revise and verify again
   |
   +---- unresolved uncertainty ----> escalate or stop
```

The quality of the loop depends on the quality of its evidence. Compiler output and reproducible tests provide a clearer correction target than a generic reviewer statement. A model finding can start an investigation, but the correction should be checked against the behavior or constraint that motivated it. Otherwise, agents can enter a cycle in which one model makes speculative suggestions and another repeatedly changes correct code to satisfy them.

The handoff should name the checks or commands run, the relevant results or artifacts, unresolved uncertainty, and the disposition of blocking review findings. Evidence should be detailed enough for another reviewer to inspect without replaying the entire agent conversation. A summary such as “all tests passed” is insufficient when the task contract or risk profile requires a particular integration, user-flow, security, or operational property.

Loops need explicit boundaries. Completion means that the agreed acceptance evidence passes and no unresolved blocking finding remains. Continued iteration is justified when a supported failure is still actionable. Escalation is appropriate when evidence conflicts, the same correction fails repeatedly, required context is missing, or the decision exceeds the workflow's authority. Time, cost, iteration, and scope limits prevent a local correction loop from consuming unlimited resources or drifting into unrelated refactoring.

The reviewer and implementer do not need to agree linguistically. Acceptance should be based on the defined criteria and evidence. If two models disagree and neither claim can be verified, the result is uncertainty for human judgment, not permission to continue an automated argument indefinitely.

## Risk-Based Control Profiles

Quality controls should scale with the consequences and reversibility of failure. The following profiles illustrate the principle without prescribing universal gates.

| Profile | Characteristics | Quality-control emphasis |
| --- | --- | --- |
| Low | Narrow, reversible, limited impact | Relevant automated checks and lightweight inspection |
| Standard | Normal product or internal change | Deterministic evidence, model review, shared CI, and accountable acceptance |
| High | Sensitive data, public contracts, infrastructure, migrations, or broad impact | Independent evidence, deeper human review, recovery, and runtime verification |
| Critical | Safety-sensitive, regulated, or difficult to reverse | Multiple independent checks and explicit specialist acceptance |

Risk is not determined only by diff size. A one-line permission change can be more consequential than a large internal refactoring. Relevant factors include affected users, data sensitivity, blast radius, reversibility, observability, novelty, architectural reach, and the team's ability to recover.

## From Failures To Stronger Quality Control

Escaped defects and difficult reviews provide evidence about the quality-control system itself. They may reveal missing acceptance context, incomplete tests, an unenforced code rule, weak runtime observation, or a design decision that was not made durable.

Material or recurring failures should feed the improvement loop described in `ai-harness-engineering.md`. The resulting control might be a regression test, CI check, static rule, monitor, repository constraint, or architecture record. The goal is to strengthen the layer that allowed the failure, not to add a permanent guardrail after every isolated mistake.

## Evaluating The Quality-Control System

A quality-control system should be judged by the confidence it creates and the failures it prevents, not by the volume of activity it generates. Lines of generated code, number of model reviews, and number of review comments do not demonstrate quality.

Useful evaluation considers both effectiveness and burden. Effectiveness includes confirmed material defects found before integration, important defects missed, escaped defects, rollback or incident trends, and recurrence of failure modes that were thought to be addressed. Burden includes false-positive findings, human review time, correction cycles, latency, inference cost, and the percentage of changes that require major intervention.

The relevant unit is often the accepted change rather than the agent run. A cheap reviewer that produces many false positives may cost more in human attention than an expensive reviewer that identifies a small number of real problems. Likewise, a fast implementation loop is not an improvement if it creates a queue at human review or increases production recovery work.

Evaluation should use representative changes from the repository and should be repeated when models, prompts, context, tools, or review policies change. Review systems can be overfit just like implementation systems. A retained set of known defects and realistic clean changes helps reveal both missed problems and excessive false positives.

## Relationship To Other Strategy Documents

This document provides the detailed end-to-end quality-control model for AI-assisted code changes.

- `ai-assisted-engineering-process.md` describes the broader development process and human-agent responsibilities.
- `ai-harness-engineering.md` describes general harnesses, guardrails, permissions, and control loops across workflows.
- `agent-workflow-evaluation.md` describes evaluation contracts, representative suites, graders, repeated trials, and autonomy assurance for complete workflows.
- `governed-agentic-development.md` describes how task contracts, control-plane state, isolated workers, checks, and human acceptance form a delegated development system.
- `graph-assisted-code-review.md` describes a specialized technique for impact and blast-radius analysis.
- `ai-engineering-metrics.md` describes organization-level measurement of adoption, delivery, quality, review burden, and agent workflows.
- `ai-native-engineering-phases.md` describes how these capabilities can mature across teams and the organization.

The documents complement one another. Detailed code-review and acceptance guidance belongs here, while broader process, harness, graph, measurement, and adoption guidance remains in the corresponding strategy.

## Open Research Questions

This document is an initial synthesis, not a claim that the optimal review system is settled. Important questions remain:

- When does a fresh instance of the implementing model perform as well as a different reviewer model?
- Which defect classes are model reviewers consistently good or poor at finding?
- How should review prompts balance broad exploration against false-positive burden?
- What evidence is sufficient to reduce human code reading safely for different risk classes?
- When do additional review layers stop improving accepted-change quality?
- How should repository instructions and review criteria be reassessed when models improve?
- How should runtime incidents be connected to retained evaluation cases for implementation and review agents?
- Which measures best predict maintainability across successive agent-generated changes?

These questions should be answered with representative repository evidence rather than generic benchmark rankings alone.

## Current Source Basis

The initial layered-review model was informed by [Four levels of AI code review](https://www.youtube.com/watch?v=As2xy_cSx00), which combines deterministic local checks, local model review, automated pull-request review, and risk-based human review. Testing details were also informed by [How I Test With Claude Code](https://www.youtube.com/watch?v=Kx7bAwVH_1c), and the limits of model review were visible in [Claude Code Agent Teams in 12 Minutes](https://www.youtube.com/watch?v=KuxsOv0q0mo), where a reviewed change still failed in a real application flow. [The Full AI Development Workflow](https://www.youtube.com/watch?v=O5ph_x4-L50) provided lifecycle context from requirements through monitoring.

These videos are practitioner demonstrations, not controlled comparative research. Their claims remain hypotheses until supported by representative repository evidence, measured false positives and misses, and observed accepted-change outcomes. Future revisions should continue comparing the model with research, practitioner evidence, and repository results.

## Summary

Effective AI-assisted code quality control is a layered evidence and decision system:

1. Product intent and acceptance context define what success means.
2. Deterministic checks establish mechanically verifiable properties.
3. Model review broadens the search for defects and uncertainty.
4. Shared CI makes evidence consistent and visible.
5. Humans decide consequential questions in proportion to risk.
6. Runtime and user feedback test whether pre-release evidence represented reality.
7. Significant recurring failures improve the harness and its guardrails.

The strongest system does not ask whether AI or humans should review code. It assigns each kind of judgment to the mechanism best able to support it, connects findings to evidence, and keeps acceptance, revision, stopping, and escalation explicit.

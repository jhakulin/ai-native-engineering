# Agent Workflow Evaluation And Assurance

## Purpose

This document explains how to evaluate an AI agent workflow and determine whether the evidence justifies its intended use and autonomy level.

Agent evaluation is not a model leaderboard exercise. A deployed agent is a model operating through a harness, context system, tools, permissions, environment, control flow, and acceptance policy. The useful evaluation target is therefore the complete workflow performing representative tasks under known conditions.

Assurance means justified confidence within an explicit boundary. It does not mean proving that a probabilistic system will never fail. A good evaluation makes capabilities, failure modes, containment, uncertainty, and operating cost visible enough for an accountable person to decide whether to deploy, revise, restrict, or stop the workflow.

## Scope

This document covers evaluation contracts, task and suite design, environments, trials, traces, outcomes, graders, non-determinism, baselines, containment, staged release, production feedback, and evaluation governance.

It does not define the detailed correctness criteria for every domain. Domain owners must supply the intended behavior, risk boundaries, and evidence appropriate to coding, research, product, support, operations, or another task family.

## Core Assurance Model

Evaluation connects an intended workflow to evidence and a deployment decision:

```text
workflow purpose and risk
          |
          v
evaluation contract and representative tasks
          |
          v
versioned model + harness + tools + environment
          |
          v
repeated trials and recorded outcomes
          |
          v
deterministic, model, and human grading
          |
          v
capability, containment, reliability, and cost evidence
          |
          v
deploy, restrict, revise, reject, or reduce autonomy
          |
          v
production feedback and retained regressions
```

The evaluation is useful only when its results can change the workflow or its authority. A report that records failures but does not affect release, permissions, routing, or improvement is observability rather than assurance.

## Evaluation Vocabulary

Use explicit terms to prevent results from being interpreted more broadly than the experiment supports:

| Term | Meaning |
| --- | --- |
| Workflow under evaluation | The versioned model, harness, context, tools, permissions, control flow, and policy being tested |
| Task | One problem with defined inputs, environment, authority, and success criteria |
| Trial | One attempt by the workflow to perform a task |
| Trace | The recorded messages, tool calls, observations, state transitions, and intermediate artifacts from a trial |
| Outcome | The externally observable final state produced by the trial |
| Grader | Deterministic logic, model rubric, or human judgment that evaluates one property |
| Assertion | One check within a grader |
| Suite | A collection of related tasks used to evaluate a capability, risk, or regression boundary |
| Baseline | The existing workflow, human process, or simpler alternative used for comparison |
| Release gate | The evidence threshold required before a workflow version or autonomy level is accepted |

The trace and outcome are different. An agent may say that it opened a pull request, updated a ticket, or completed a deployment while the target system shows no such state. Outcome grading should verify the environment rather than trust the agent's account of its own success.

## Evaluation Contract

Before building cases, define what the evaluation is intended to justify. A useful contract includes:

- workflow purpose and eligible task family
- intended user, operator, or affected population
- permitted inputs, sources, tools, and side effects
- required output or end state
- completion and acceptance criteria
- required evidence and auditability
- prohibited actions and protected resources
- conditions that require refusal, no action, or escalation
- expected recovery behavior
- latency, token, cost, and resource limits
- proposed autonomy level and human decision boundary
- known exclusions that the evaluation does not cover

Without this contract, teams tend to grade only visible task completion. A workflow can then appear successful while exceeding scope, using unauthorized data, producing unverifiable evidence, or depending on extensive hidden human repair.

The contract should use behavior and outcome language rather than prescribe one exact reasoning path. Agents can find valid solutions that differ from a reference implementation. Graders should reject unsafe or incorrect outcomes without penalizing harmless variation merely because it was unexpected.

## Agent Contract Conformance

An agent intended for a shared platform should be evaluated against the declaration defined by `../guidelines/agent-guideline.md` and the platform contract defined by `governed-agentic-development.md`. Conformance is not established by one successful task. Representative cases should verify that the workflow:

- accepts valid task inputs and rejects or escalates incomplete, contradictory, or incompatible inputs
- receives only authorized context, tools, permissions, and side-effect capability
- produces a result with the correct completed, blocked, failed, refused, or escalated state
- respects correction, retry, time, token, cost, and concurrency limits where they apply
- preserves required artifacts, verification results, failure evidence, and unresolved uncertainty
- is surrounded by a platform that records required lifecycle events, correlation identifiers, version information, material actions, side effects, resource measures, and human interventions independently of the model
- remains compatible with each runtime, model, tool, dependency, and configuration profile claimed by its registry entry

Test event completeness as well as event presence. If the platform records `completed` but omits a failed check, unsupported side effect, model version, or human correction, the run is not observably conformant. Compare platform records and the agent's structured result with external state because both instrumentation and self-reported completion can be wrong. Observability conformance should inspect behavior and evidence, not require access to hidden chain-of-thought.

Contract failures should affect approval. A task-quality success cannot compensate for a material permission violation, missing result state, unverifiable artifact, or absent evidence needed to reconstruct a consequential action.

## Evaluation Dimensions

Agent workflows are multi-dimensional. Keep at least task utility and containment separate; add other dimensions when they affect the deployment decision.

| Dimension | Question |
| --- | --- |
| Task outcome | Did the workflow produce the intended externally verifiable result? |
| Contract adherence | Did it remain within scope, constraints, and non-goals? |
| Evidence quality | Can another actor verify the claims and important state transitions? |
| Tool correctness | Were tools selected and parameterized appropriately? |
| Containment | Did the workflow avoid protected reads, writes, egress, or capabilities? |
| Escalation | Did it ask for help, refuse, or stop when authority or evidence was insufficient? |
| Recovery | Did it handle failure, retries, stale state, and partial effects safely? |
| Reliability | How consistently does it succeed across repeated trials? |
| Human burden | How much correction, adjudication, or review is needed for acceptance? |
| Efficiency | What latency, tokens, compute, and cost are required per accepted outcome? |
| Maintainability | Is the durable output understandable and supportable after acceptance? |
| Runtime or user effect | Did the accepted result behave correctly in its intended environment and create the intended value? |

Do not collapse these dimensions into one score when a low value in any one of them changes the risk decision. A workflow that completes most tasks but occasionally violates authorization cannot hide that failure inside a high average. Report numerators, denominators, severity, and task class where they matter.

## Evaluation Case Design

A representative suite covers ordinary work and the conditions that reveal whether the workflow knows its boundaries.

| Case type | Purpose |
| --- | --- |
| Typical | Represents common intended work |
| Boundary | Exercises limits, unusual inputs, and difficult transitions |
| Negative | Correct outcome is no change, refusal, or escalation |
| Clean control | Confirms reviewers and checkers do not invent problems in valid output |
| Adversarial | Tests hostile instructions, protected data, unsafe tools, or policy evasion |
| Regression | Preserves a previously observed and important failure |
| Long-running | Tests budgets, checkpoints, compaction, stale state, and recovery |
| Concurrent | Tests claims, leases, isolation, dependencies, and conflicts |
| Degraded environment | Tests unavailable tools, partial sources, rate limits, and infrastructure failure |

Tasks should come from real product requirements, bug reports, support cases, review findings, incidents, and observed manual checks when possible. Synthetic cases are useful for targeted coverage but may omit the ambiguity and environmental complexity that make real work difficult.

Each task should be solvable under the stated conditions. A known reference solution or successful expert attempt helps validate that the environment and graders do not require hidden information. When capable humans cannot agree whether the task passes, the task contract or rubric needs refinement before its score is used to judge the agent.

Balanced cases matter. If every case rewards taking an action, the workflow may learn to act when it should abstain. If every review case contains a defect, a model grader may learn to invent findings. Include nearby cases where the correct behavior differs, such as search versus no search, edit versus no change, fix versus escalate, and defect versus clean diff.

## Suite Structure

Separate suites by the question they answer.

### Development Set

The development set supports diagnosis and iteration. Teams may inspect results, traces, and graders while improving the workflow. Performance on this set is useful for debugging but becomes optimistic as the workflow is adapted to its cases.

### Capability Set

A capability set asks what difficult work the workflow can do and where its frontier lies. It should include tasks the current workflow does not reliably pass. A saturated capability set no longer distinguishes improvements and should be expanded or graduated into regression coverage.

### Retained Regression Set

A regression set protects behavior that is already expected to be reliable. It includes important ordinary tasks and previous failures that the harness claims to have corrected. Pass expectations should be high, but a passing score is meaningful only if tasks remain representative and graders still detect the original failure mode.

### Holdout Set

A holdout set tests whether improvements generalize beyond the cases used during development. Avoid exposing its exact tasks, expected outputs, or grader quirks to the workflow improvement process. Periodically refresh it as the product, source data, and task distribution change.

### Live Or Fresh Set

Fresh tasks drawn from recent real work reduce contamination and adaptation to static benchmarks. They are especially useful for coding agents, whose models may have seen public issue and patch pairs during training. A live set still requires stable, reproducible environments and human validation of task and grader quality.

No one suite serves every purpose. Capability results should not be presented as production reliability, and a regression suite with nearly perfect scores may say little about new or harder work.

## Evaluation Environment

The environment is part of the evaluated system. Record and, where practical, reproduce:

- repository commit, branch, data snapshot, or external-system state
- available files, services, schemas, dependencies, and network access
- tools, tool versions, and tool descriptions
- credentials, permissions, protected resources, and policy gates
- model and model settings
- harness, prompt, skills, routing, and context configuration
- time, token, compute, retry, and concurrency budgets
- randomization, seeds, caching, and rate-limit behavior where relevant
- grader versions and reference artifacts

An unstable environment produces noisy scores that can be mistaken for model variance. Broken dependencies, unavailable APIs, nondeterministic tests, stale fixtures, and hidden setup requirements should be measured and reported separately from agent failure.

The environment should be realistic enough to exercise the claimed workflow but isolated enough to reset safely between trials. State-changing evaluations need cleanup or disposable environments so one trial does not influence another. Protected side effects should be simulated or routed to controlled test systems unless the evaluation explicitly governs live behavior.

## What To Grade

Prefer the closest reliable evidence to the intended outcome.

### Outcome And State

Outcome graders inspect the state that should exist after the task: code behavior, filesystem artifacts, database records, issue state, pull requests, messages, deployed resources, or another external effect. They are usually stronger than checking whether the agent claimed success.

### Durable Artifacts

Artifact graders inspect code, tests, reports, plans, citations, configuration, or other outputs. Compilation, tests, schema validation, static analysis, link checks, contract checks, and source verification can provide reproducible evidence.

### Trace And Tool Use

Trace graders inspect tool calls, parameters, sequence, resource use, policy decisions, and escalation. They are valuable when the process itself matters—for example, when identity must be verified before an action or protected files must never be read.

Do not overconstrain harmless strategy. Requiring a particular tool sequence can penalize a valid and more efficient solution. Grade traces when the behavior expresses a real safety, evidence, or workflow invariant.

### Communication And Judgment

Human or model rubrics may evaluate clarity, groundedness, relevance, maintainability, product fit, or whether an escalation explains the missing decision. These properties require explicit criteria and examples because fluent output can hide weak evidence.

## Grader Types

### Deterministic Graders

Deterministic graders include exact checks, tests, static analysis, schema validation, state queries, policy assertions, and bounded trace rules. They are fast, repeatable, and debuggable, but they cover only encoded properties and can reject valid variation when written too narrowly.

Use deterministic grading for properties that have an objective system representation. Verify both positive and negative behavior: a new test should fail on the known bad state and pass on the corrected state when practical; a permission grader should detect attempted violations as well as the absence of successful unauthorized actions.

### Model-Based Graders

Model graders are useful for open-ended properties that deterministic code cannot express economically. Suitable uses include rubric-based quality, groundedness, relevance, severity classification, pairwise comparison, and identification of missing evidence.

A model grader is another probabilistic system. It can share the evaluated model's blind spots, prefer verbosity or style over correctness, be influenced by ordering, or reward outputs that mimic the rubric. Give it the evidence needed to judge, require structured criteria, and prevent it from inventing unavailable ground truth.

Calibrate model graders against expert human judgments on representative passing, failing, and ambiguous cases. Measure agreement by criterion and failure type, not only average score. Recalibrate when the grader model, prompt, task distribution, or output format changes. When disagreement affects a consequential decision, route it to human adjudication rather than averaging uncertain opinions.

Pairwise grading can be easier than absolute scoring when comparing two valid open-ended outputs, but it still requires order controls and a clear definition of what “better” means. Multi-judge consensus adds cost and correlated confidence; it does not create independent ground truth by itself.

### Human Graders

Humans provide domain judgment, discover broken tasks and graders, calibrate model judges, and decide consequential ambiguity. Expert review is expensive, so use it where the information gain or risk justifies it: initial rubric design, sampled calibration, disputed cases, high-risk failures, and periodic audit.

Measure inter-reviewer agreement when human scores define ground truth. Disagreement can reveal ambiguous tasks, incomplete rubrics, or legitimate plural judgment. Do not force false precision by hiding disagreement inside one label.

## Non-Determinism And Repeated Trials

One successful trial does not establish reliability. Agent behavior varies with sampling, tool observations, context order, external latency, and accumulated state. Run repeated trials for important cases and report the distribution rather than only the best result.

For workflows expected to succeed on the first user attempt, pass rate per trial or pass@1 is more relevant than the chance that one of many attempts eventually succeeds. Best-of-many results can be useful for exploration or candidate generation, but they spend more resources and require a reliable selector.

For customer-facing or safety-relevant behavior, consistency across repeated trials matters. Report how often all required conditions hold, including correct abstention and containment, rather than presenting one successful sample. Small suites provide directional evidence early; mature workflows need enough tasks and trials to detect the size of regression that matters operationally.

Separate agent variance from environment and grader variance. Repeatedly rerun known reference solutions and stable baselines to detect broken fixtures or scoring drift.

## Baselines And Comparisons

An evaluation needs a comparison that answers the actual decision:

- current workflow versus proposed workflow
- agent versus the existing human or non-agent process
- model alone versus model plus a new skill or context source
- single-agent versus multi-agent execution
- current model versus replacement model
- same-model versus cross-model review
- source-first versus retrieval-assisted context
- proposal-only versus higher-autonomy execution

Compare under equivalent task, environment, tool, permission, and resource conditions. A model with more time, attempts, context, tools, or compute is a different system. Resource scaling may be an intentional design choice, but its additional cost belongs in the result.

Use ablations to identify which component caused an apparent improvement. If a new multi-agent workflow also changes the model, prompt, tool set, and time budget, the experiment cannot attribute the result to coordination. Report harness sensitivity because the same model can perform differently under different scaffolds.

Human baselines require comparable conditions and appropriately experienced participants. They provide grounding for feasibility, time, quality, and burden, not a universal claim about all engineers.

## Failure Taxonomy

Classify failures by the layer that allowed them so evaluation produces actionable improvements:

| Failure class | Example durable response |
| --- | --- |
| Contract failure | Clarify outcome, scope, negative behavior, or acceptance evidence |
| Context failure | Correct authority mapping, retrieval, freshness, or handoff |
| Planning or reasoning failure | Improve decomposition, model choice, or escalation boundary |
| Tool failure | Fix interface, description, implementation, or parameter validation |
| Permission failure | Narrow capability or strengthen external policy enforcement |
| State-management failure | Correct claims, checkpoints, idempotency, or recovery semantics |
| Verification failure | Add or repair tests, state checks, runtime evidence, or clean controls |
| Reviewer or grader failure | Calibrate rubric, repair fixtures, or add human adjudication |
| Acceptance failure | Clarify decision ownership or risk profile |
| Runtime mismatch | Add representative environment, monitoring, rollback, or user evidence |

Do not automatically add prompt instructions after every failure. The appropriate response may be a task change, deterministic check, tool correction, permission boundary, data fix, evaluator improvement, or decision to reduce autonomy.

## Containment And Adversarial Evaluation

Task completion and containment are separate axes. Test whether the workflow can complete legitimate work while respecting protected reads, writes, egress, credentials, user boundaries, and approval gates.

Adversarial cases may include malicious repository content, ticket comments that impersonate policy, retrieved prompt injection, requests to expose secrets, attempts to broaden scope, misleading tool output, compromised dependencies, and instructions to bypass approval. Include benign neighboring cases so the safest-looking workflow is not one that refuses everything.

Record attempted and successful violations separately. A deterministic gate that blocks an unsafe write is functioning, but the attempted action still reveals a reasoning or context failure worth understanding. Report false positives that block legitimate work because containment without utility is not a successful workflow.

Evaluation environments should use non-production secrets and controlled destinations. Do not create real harm merely to prove that the policy gate would have blocked it.

## Coding-Workflow Evaluation

Coding-agent tasks should use real or representative repositories, executable environments, issue-like contracts, and tests that verify both the intended fix and surrounding behavior. Fresh tasks help reduce contamination from public issue and patch histories.

Passing tests is necessary evidence for many tasks but not complete assurance. Inspect task scope, test quality, maintainability, security, public contracts, dependency effects, and real application flows according to risk. Include clean changes to measure whether model reviewers invent defects and known-bad changes to measure misses.

Evaluate the complete issue-to-proposed-change flow when that is the deployed unit: task retrieval, baseline selection, worktree isolation, edits, checks, review correction, artifact publication, evidence, and escalation. A patch-only benchmark does not measure claiming, permissions, handoff quality, or review burden.

## Context, Retrieval, And Memory Evaluation

For context systems, grade retrieval and generation separately. Record whether the necessary authoritative source entered the context, whether stale or unauthorized material was included, and whether the agent used the retrieved evidence correctly.

Memory evaluation should include tasks where a stored fact remains valid, has changed, belongs to another scope, conflicts with an authority, or should never have been retained. Measure correction, expiry, deletion, isolation, and regressions caused by memory additions—not merely whether personalization is visible.

Detailed context evaluation dimensions are defined in `agent-context-systems.md`.

## Long-Running And Concurrent Workflow Evaluation

Long-running cases should interrupt the workflow, change relevant external state, exhaust a budget, or invalidate a checkpoint. Grade whether the workflow resumes from a trustworthy baseline, preserves evidence, avoids replaying non-idempotent effects, and escalates when safe recovery is impossible.

Concurrent cases should test atomic claiming, stale leases, dependent tasks, shared files, incompatible interface decisions, merge conflicts, rate limits, and review capacity. Measure accepted-change throughput and review waiting time at each concurrency level. Maximum runnable workers is not the same as sustainable system capacity.

For multi-agent designs, record per-role context, outputs, messages, cost, and failure contribution. Compare with a simpler single-agent or deterministic workflow. Additional roles are justified only when they improve capability, containment, latency, or reviewability enough to repay coordination cost.

## Staged Release And Autonomy Gates

Evaluation should control progressively more consequential use:

```text
offline evaluation
    -> internal or shadow observation
    -> proposal-only pilot
    -> bounded asynchronous execution with human acceptance
    -> narrowly pre-authorized automatic action
```

Each transition needs criteria for task success, containment, reliability, human burden, recovery, and cost. High-risk or irreversible actions require stronger evidence and accountable specialist approval. A workflow can operate at different autonomy levels for different task families.

Shadow evaluation observes real inputs without taking the workflow's proposed action. Proposal-only use exposes whether humans accept, reject, or substantially rewrite outputs. A bounded pilot limits users, repositories, data, task classes, permissions, and duration. Automatic action should be narrow, reversible, observable, and governed by deterministic policy outside the agent's editable context.

Reduce autonomy when the task distribution, model, harness, tools, context, permissions, environment, or observed failure rate changes materially. Historical evaluation does not permanently certify a changing workflow.

## Production Feedback

Offline evaluations cannot represent every real input, integration, user behavior, or operating condition. Production monitoring, sampled human review, support cases, incidents, rollbacks, user research, and outcome measures complete the assurance loop.

Connect material production failures to retained cases when they represent a reusable weakness. Preserve enough original context to reproduce the failure without retaining unnecessary sensitive data. Re-run related suites after corrections and inspect whether the new control creates false positives or suppresses legitimate behavior.

Production success should be measured at the workflow's intended outcome. A research agent may need source-supported decision usefulness; a coding agent needs accepted maintainable changes and runtime quality; a backlog agent needs improved readiness without destructive relabeling. Usage and agent activity alone do not establish value.

## Evaluation Lifecycle And Governance

Every shared evaluation suite needs an owner responsible for task validity, environment health, graders, sensitive data, release criteria, and retirement. Domain experts own intended behavior; platform or evaluation engineers may own execution infrastructure.

Version tasks, fixtures, environments, graders, and workflow configurations. Preserve historical comparability, but do not keep obsolete cases merely because they provide a stable chart. Mark tasks superseded when product behavior legitimately changes, and distinguish that change from a workflow regression.

Protect evaluation integrity. Limit exposure of holdout cases and grader details when the same system or team optimizes the workflow. Watch for contamination from public benchmarks, training data, cached outputs, or generated reference solutions. Fresh cases and periodically refreshed holdouts reduce but do not eliminate this risk.

Audit graders themselves. Reference solutions should pass; known failures should fail; clean controls should not accumulate false findings; model-judge agreement should remain calibrated; environment failure should not be counted as agent failure. An evaluator that always selects the challenger is evidence of evaluator weakness, not continuous breakthrough.

Retire or consolidate suites when they duplicate another authority, no longer represent the task distribution, have saturated without protecting a regression boundary, or cost more to maintain than the decision they support.

## Reporting

An evaluation report should make its boundary reproducible and its uncertainty visible. Include:

- decision the evaluation was intended to support
- workflow, model, harness, tool, permission, and environment versions
- task sources, suite composition, exclusions, and contamination risks
- number of tasks and trials
- grader types, thresholds, calibration, and known limitations
- results by task family, risk class, and evaluation dimension
- confidence intervals or variability where sample size supports them
- environment and grader failures separated from agent failures
- latency, tokens, compute, cost, and human review burden
- important qualitative failures and traces
- comparison conditions and ablations
- release, restriction, or follow-up decision

Avoid presenting more decimal precision than the sample size and grader reliability justify. Report failures that matter even when their frequency is low, especially authorization, sensitive-data, irreversible-action, and severe acceptance failures.

## Anti-Patterns

### Evaluating Only The Final Message

An agent can describe success without changing the environment correctly. Inspect outcome state, artifacts, and relevant tool behavior.

### One Score For Everything

A blended score can hide containment failures, costly retries, or extensive human repair behind strong task completion.

### Best-Of-Many As Reliability

Selecting one successful attempt from many measures search potential, not first-attempt or customer-facing reliability.

### Testing Only Positive Cases

If every task expects action or every diff contains a bug, the workflow learns over-action and reviewers learn to invent findings.

### Model Judge As Ground Truth

A fluent grader can share the same blind spots as the evaluated agent. Calibrate against humans and deterministic evidence.

### Static Public Benchmark As Product Assurance

Benchmarks are useful comparisons but may be contaminated, narrow, saturated, or unlike the deployed task and harness.

### Changing Several Variables At Once

Simultaneously changing model, prompt, context, tools, budget, and orchestration prevents causal interpretation.

### Ignoring Environment Failures

Broken fixtures and unavailable services create noise that can be mistaken for agent regression or improvement.

### Turning Every Failure Into Prompt Text

Failure classification should determine whether the durable response belongs in context, code, tools, permissions, verification, state management, or human policy.

### Permanent Certification

Evaluation evidence applies to a versioned workflow and task distribution. It does not permanently authorize future models, tools, contexts, or capabilities.

## Relationship To Other Strategy Documents

This document owns evaluation design and assurance for complete agent workflows.

- `ai-engineering-metrics.md` defines organization-level measurement of adoption, delivery, quality, review burden, governed workflows, and value.
- `ai-assisted-code-quality-control.md` defines detailed evidence and acceptance for AI-assisted code changes.
- `agent-context-systems.md` defines retrieval, context, checkpoint, and memory evaluation concerns.
- `governed-agentic-development.md` defines the delegated-development architecture and autonomy boundaries that evaluation must justify.
- `ai-harness-engineering.md` defines general guardrails, control loops, permissions, and harness improvement.
- `ai-native-engineering-phases.md` defines organizational maturity and when governed workflows enter team practice.

## Current Evidence Basis

The evaluation structure and grader distinctions were informed by Anthropic's [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), which defines tasks, trials, traces, outcomes, harnesses, and code-, model-, and human-based graders; distinguishes capability from regression suites; and emphasizes repeated trials, balanced cases, reference solutions, and human calibration of model judges.

Coding-task design was informed by [SWE-bench](https://arxiv.org/abs/2310.06770), which uses real GitHub issues and repository environments, and [SWE-bench-Live](https://arxiv.org/abs/2505.23419), which addresses static benchmark limitations through fresh tasks and reproducible container environments. These benchmarks evaluate issue resolution; they do not by themselves cover the full governed development lifecycle described in this repository.

Long-horizon and baseline guidance was informed by [RE-Bench](https://arxiv.org/abs/2411.15114), which evaluates agents and human experts under comparable time and environment conditions, records trajectories, and demonstrates that performance depends on task, scaffold, attempt allocation, and resource budget. Its AI research tasks are not a direct proxy for ordinary product engineering.

Risk-governance framing was informed by the [NIST AI Risk Management Framework: Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1), which places measurement and evaluation inside a broader lifecycle of governance and risk management.

Practitioner scenarios and failure modes were informed by the [Owain Lewis YouTube channel](https://www.youtube.com/@owainlewis), including demonstrations of code review, testing, worker loops, scheduled agents, context and memory, and multi-agent coordination. Those demonstrations motivate representative cases but do not establish comparative performance or safe autonomy by themselves.

## Summary

Agent workflow evaluation should test the versioned model and harness in representative environments, inspect real outcomes and protected boundaries, combine appropriate grader types, account for non-determinism and resources, and connect evidence to release and autonomy decisions.

The goal is not a flattering benchmark score. It is a maintained assurance system that reveals what the workflow can do, how reliably and safely it does it, what it costs, when it should escalate, and whether current evidence justifies the authority it has been given.

# Governed Agentic Development Systems

## Purpose

This document explains how to design a development system that can delegate bounded software work to AI agents while preserving human control of intent, risk, and acceptance.

The subject is sometimes described as an agentic software factory. The factory metaphor is useful when it emphasizes repeatable flow, visible state, consistent checks, and feedback. It becomes misleading when it implies that software work is uniform, that all decisions can be automated, or that producing more changes is the same as delivering better outcomes. The objective is not maximum autonomy. It is dependable delegation for work whose boundaries and proof can be made explicit.

This is a system-design strategy, not an operational runbook or a prescription for a particular agent, issue tracker, cloud, or code-review product.

## Scope

The document focuses on the system that connects an approved unit of engineering work to an inspectable proposed change. It covers task contracts, control-plane state, worker selection, execution isolation, deterministic controls, agent work, correction, evidence, acceptance, and feedback.

It does not transfer product direction, architecture ownership, risk acceptance, merge authority, deployment authority, or incident accountability to an agent. Those responsibilities remain explicit human decisions unless a separate, governed policy authorizes a narrowly bounded action.

In this document, an **agent definition** is the reusable combination of agent instructions and deployment metadata. A **worker run** is one task-specific execution of a resolved agent definition inside a runtime environment. One agent definition may therefore produce many separate worker runs. After this distinction is established, “worker” is used as shorthand for a worker run rather than as a different kind of agent.

## Core Model

A governed agentic development system is a closed delivery loop:

```text
intent and constraints
        |
        v
reviewable task contract
        |
        v
control plane and routing
        |
        v
isolated worker execution
        |
        v
deterministic checks and model review
        |
        +---- supported failure ----> correction
        |
        v
evidence-bearing proposed change
        |
        v
human acceptance, rejection, or escalation
        |
        v
runtime and workflow feedback
        |
        +----> improve task context, checks, or controls
```

The model separates three responsibilities:

- **Humans define intent and authority.** People own the problem, consequential design choices, risk tolerance, and acceptance decision.
- **Deterministic infrastructure controls execution.** Code manages state transitions, permissions, isolation, limits, required checks, and durable records where those properties can be enforced mechanically.
- **Agents handle bounded adaptive work.** Models explore the repository, propose plans, implement changes, diagnose supported failures, and prepare evidence within the authority granted by the workflow.

Collapsing these responsibilities into one prompt creates an opaque system whose safety depends on model compliance. Keeping them separate makes behavior easier to inspect, test, and change.

## Shared Agent Platform Contract

When several agents run through one engineering platform, consistency should come from shared contracts rather than identical prompts or implementations. LLM-visible instructions define specialist behavior and result expectations. Separate deployment metadata defines machine-operable requirements. Deterministic platform infrastructure validates and enforces those requirements and records execution independently of the model.

| Agent package or deployment metadata declares | Platform enforces or provides |
| --- | --- |
| Delegation eligibility and required task inputs | Task schema, readiness validation, identity, and routing |
| Required context, tools, and dependencies | Authorized context delivery, tool adapters, and compatibility checks |
| Permitted actions, side effects, and approval boundaries | Capability policy, credentials, isolation, and approval gates |
| Completion, correction, failure, and escalation meaning | State machine, retry and resource limits, transitions, and recovery rules |
| Required result, artifacts, and verification evidence | Durable artifact storage, result validation, and acceptance handoff |
| Supported telemetry-contract version | Authoritative event production, correlation, collection, retention, and access controls |
| Supported runtime and version constraints | Runtime adapters, immutable version resolution, and compatibility enforcement |

The stable integration surface should include task, event, artifact, and result contracts. A task contract carries intent, scope, authority, context references, and acceptance expectations. An event contract records lifecycle transitions and material execution facts. An artifact contract identifies produced or changed durable objects and their provenance. A result contract distinguishes completed, blocked, failed, refused, and escalated outcomes and attaches the evidence needed for the next decision. Model-specific conversation formats can remain behind runtime adapters.

Observability is a platform responsibility. The dispatcher, runtime wrapper, tool gateway, policy layer, verifier, control plane, and acceptance system should emit authoritative events from the execution they observe. Each run should be correlatable to its task, parent run where applicable, agent and workflow identity, concrete model and harness configuration, repository or environment baseline, material tool actions and external side effects, state transitions, artifacts, verification results, retries, corrections, failures, refusals, escalations, human interventions, acceptance decisions, latency, tokens, cost, and relevant resource use. The agent may return a structured result and evidence, but that self-report does not replace observed telemetry. Collection should expose observable behavior and evidence without requiring hidden chain-of-thought.

Deployment metadata does not need to be repeated in the agent instructions. A platform may supply common defaults, but the resolved contract for a run must be inspectable, versioned, and attributable. Agent-specific metadata overrides a default only within policy, and missing declarations must not silently grant capability.

## When Delegated Development Fits

Delegation works best when a task has a clear outcome, bounded scope, accessible context, known acceptance evidence, and a reversible handoff such as a pull request. Documentation corrections, narrow bug fixes, dependency maintenance, test improvements, mechanical migrations, and well-understood feature slices are common candidates.

The task does not need to be trivial. It does need to be checkable. A larger task may be suitable when it can be decomposed into coherent units with explicit contracts and integration boundaries. A small task may still be unsuitable when it changes authorization, data retention, public contracts, infrastructure, or another high-consequence boundary.

Keep work interactive when the problem is still being discovered, product intent is contested, architecture choices are consequential, hidden dependencies dominate, or correctness cannot be evaluated more cheaply than the work is produced. An agentic system should route these conditions to human collaboration rather than conceal them behind a longer prompt or more workers.

## System Responsibilities

### Intent And Task Contract

The system needs a reviewable contract before it needs an agent. A sufficient contract identifies the intended outcome, relevant context and authoritative sources, constraints, non-goals, acceptance criteria, expected evidence, material risks, and the person accountable for acceptance.

The contract is not necessarily a separate document. A concise ticket can be sufficient for a narrow change. Larger work may link a product brief, technical design, and several implementation tasks. These artifacts serve different responsibilities: product context explains why and for whom, technical design preserves consequential choices, and the implementation task defines what one worker may change and how the result will be judged.

Automated refinement may turn an incomplete intake item into a proposed task contract, but it should not silently invent product intent or approve its own assumptions. Missing outcome, unresolved design, contradictory sources, or unverifiable acceptance criteria are routing signals for clarification.

### Control Plane

The control plane is the inspectable system of record for work. It represents task identity, current state, ownership, dependencies, evidence, and escalation. GitHub Issues, pull requests, Linear, Jira, durable agent threads, or another shared system can fill this role. The product is secondary to the behavioral contract.

Chat alone is a weak control plane for multiple long-running tasks because it obscures current ownership, dependencies, blocked work, and historical state changes. Markdown task lists may be adequate for a short local effort, but they become fragile when several workers or people update them concurrently.

A control-plane transition should identify what changed, why it changed, and which actor is responsible for the next decision. Agents may propose classifications such as risk or readiness, but policy-backed rules and human exception paths determine what those classifications authorize.

### Dispatcher And Claiming

The dispatcher selects eligible work and assigns it to a worker. Eligibility should be derived from explicit state and policy rather than from a worker searching broadly for anything it feels able to change.

Claiming needs concurrency semantics. An atomic claim or time-bounded lease prevents two workers from unknowingly executing the same task. A claim records the worker, workflow and harness version, repository state, and start time needed for later inspection. A lease needs a recovery rule so an abandoned worker does not leave the task permanently active or cause another worker to reuse a potentially unsafe partial workspace.

Deterministic polling or event handling should perform routine queue inspection without invoking a model. Model judgment is useful for ambiguous classification or planning, not for checking repeatedly whether a known state exists.

### Execution Boundary

Each worker operates inside an explicit execution boundary. A branch and Git worktree isolate concurrent source changes and make proposed work reviewable. They do not isolate processes, credentials, network access, host files, or generated code. Worktrees are version-control isolation, not a security sandbox.

Stronger boundaries may include process or container isolation, restricted filesystem mounts, network policy, scoped credentials, resource quotas, and disposable environments. The required boundary depends on what the worker can read and change, whether generated code is executed, the sensitivity of the repository, and the consequences of a compromised dependency or instruction.

The environment should begin from a known repository state. Pre-existing user changes, an ambiguous branch, stale dependencies, or a failed earlier run weaken both isolation and the meaning of later verification evidence.

### Agent Runtime

The runtime supplies the model, context, tools, and inner tool-use loop. It may be a commercial coding agent, a custom harness, or a model-independent worker adapter. The surrounding system should depend on stable task, tool, event, artifact, and result contracts rather than one model's conversational behavior.

The agent should receive the smallest coherent context package that supports the task: the contract, repository instructions, relevant sources, accepted design decisions, current artifacts, and verification expectations. It should not inherit every prior conversation or an unbounded memory store. A fresh reviewer context is useful only when the handoff preserves the information needed to judge the change.

Context categories, retrieval choices, authorization, handoffs, and persistent-memory lifecycle are defined in `agent-context-systems.md`.

### Deterministic Controls Around Agent Work

Deterministic infrastructure should enforce properties that do not require model judgment. Pre-execution controls can validate readiness, repository state, permitted paths, credentials, and resource budgets. Post-execution controls can run required checks, validate artifact structure, publish a proposed change, attach evidence, and update control-plane state.

These controls should return actionable evidence. A failed policy gate should identify the violated condition; a failed test should preserve relevant output; a rejected transition should state the missing prerequisite. Silent rejection makes the system safer only superficially because neither the worker nor the owner can correct the underlying condition.

Prompts remain useful for intent, judgment criteria, and adaptive behavior. They are not reliable substitutes for permission boundaries, task claiming, maximum work limits, or required acceptance gates.

### Evidence And Proposed Change

The primary output is not code alone. It is a proposed change accompanied by evidence that allows another actor to decide what happens next. A useful handoff links the task contract, changed scope, tests and checks run, relevant results, model-review dispositions, known limitations, and unresolved uncertainty.

Evidence should support the property being claimed. Unit tests do not establish a browser flow, a mocked dependency does not prove a production integration, and a model review does not prove runtime correctness. The system should start with the narrowest relevant check and broaden verification when risk, architectural reach, or uncertainty demands it.

A pull request is a useful acceptance boundary because it makes the diff, discussion, checks, and decision durable. It is not mandatory: documentation, research, configuration, or other workflows may produce different artifacts. The required property is an inspectable proposal separated from consequential acceptance or execution.

### Acceptance And Authority

Acceptance is a decision, not the absence of a failing check. The decision considers whether the task contract is satisfied, the evidence is sufficient, blocking findings are resolved, residual risk is acceptable, and responsible humans understand the consequential behavior.

Low-risk workflows may pre-authorize narrow state transitions after proven checks. Higher-risk changes require human or specialist approval. Merge and deployment authority should be governed separately from permission to edit a worktree or open a pull request. A worker that can propose a change does not automatically need authority to make it durable or release it.

## Lifecycle And State Semantics

A useful lifecycle distinguishes the meaning of state rather than prescribing universal labels:

| State meaning | Required interpretation |
| --- | --- |
| Intake | The work exists but may not have enough context or approval for delegation |
| Ready | The contract and routing policy allow a worker to claim the task |
| Active | One identified worker or lease owns execution against a known baseline |
| Review | A proposed result and its evidence await an acceptance decision |
| Blocked | Progress requires missing context, authority, dependency, or external change |
| Failed | Execution stopped without satisfying the contract; evidence and partial effects are known |
| Completed | The authorized acceptance condition was met and durable state reflects the decision |

Blocked and failed are different. A blocked task may be healthy but waiting for a human decision or dependency. A failed task indicates that the attempted execution did not complete. Neither state should be represented as success merely because the agent stopped producing tool calls.

Completion also differs from implementation. Opening a pull request may complete the worker's responsibility while leaving the engineering task in review. Merging may complete delivery but not establish the intended runtime or user outcome. The control plane should express which boundary its completed state represents.

## Delegation Modes

The same system can support several modes with different control needs:

| Mode | Suitable use | Primary control concern |
| --- | --- | --- |
| Interactive | Ambiguous, exploratory, or design-heavy work | Preserve human steering and shared understanding |
| Bounded asynchronous | One task with known evidence and a reviewable handoff | Task contract, isolation, limits, and acceptance |
| Scheduled maintenance | Repeated scans, reconciliation, documentation drift, or dependency work | Deduplication, scope, false positives, ownership, and stop conditions |
| Event-driven | A known external transition such as a new issue or review comment | Authenticity, idempotency, permissions, and state consistency |
| Multi-worker | Several genuinely independent tasks or alternatives | Claiming, dependencies, merge boundaries, concurrency, and review capacity |

Modes should be selected per task family rather than declared for the entire organization. A repository can use asynchronous agents for documentation and dependency updates while keeping authentication, migrations, and architectural work interactive.

## Reference Scenarios

The scenarios below show how the system responsibilities combine in recognizable development work. They are conceptual patterns rather than product-specific recipes. Each scenario still needs repository-specific task contracts, permissions, checks, owners, and evaluation before it is enabled.

### Backlog Classification And Task Refinement

This scenario begins with an intake item that is not yet safe to implement: a customer report, vague bug description, incomplete feature request, or stale task. A refinement agent inspects the issue and permitted sources, identifies missing information, checks for duplicates or conflicting state, and proposes a clearer task contract. It may also propose type, risk, readiness, and routing classifications.

The agent's output is a refined proposal, not authorization to implement. Product intent, consequential design, and risk classifications that grant additional capability remain subject to policy or human confirmation. When the evidence is insufficient, the correct output is a question or `blocked` state rather than invented acceptance criteria.

Deterministic controls restrict this worker to the backlog and approved read sources, validate required task fields, record changes, and prevent it from assigning itself implementation authority. Useful evidence includes the sources inspected, ambiguities discovered, proposed acceptance criteria, duplicate rationale, and the reason for each routing recommendation.

This is a strong initial scenario because its effects are visible and reversible. It becomes unreliable when the organization treats model-generated labels as authoritative risk decisions or measures success by the number of tickets rewritten rather than improved readiness and reduced clarification during delivery.

### Documentation-Drift Correction

This scenario compares maintained documentation with authoritative code, configuration, schemas, generated references, or supported commands. The agent proposes a documentation change only when it can identify a specific mismatch. If the sources agree, the workflow completes without creating a change.

The task contract defines which documents and source types are in scope and which source owns disputed information. The worker should report contradictions rather than silently selecting the most convenient version. Deterministic checks can validate links, commands, generated sections, formatting, and repository structure; human review decides whether prose still communicates the intended meaning.

The evidence-bearing output identifies the stale statement, its authoritative replacement, the source state inspected, and any commands or validations run. The workflow should escalate when the source of truth is unclear, the documentation expresses product intent not derivable from code, or the correction would change a consequential contract rather than describe current behavior.

Documentation drift is suitable for bounded asynchronous execution because the proposed change is easy to inspect and reverse. It should not become an excuse to generate large volumes of explanatory prose or preserve implementation details that the repository documentation guideline would otherwise reject.

### Low-Risk Ticket To Pull Request

This scenario starts with an approved task contract for a narrow, reversible change. The dispatcher claims the task, records the repository baseline, creates an isolated branch and worktree, and gives the worker only the context and capability needed for that task. The agent plans within the approved scope, implements the change, runs relevant checks, requests model review when configured, and corrects supported failures.

The worker completes its responsibility by producing a pull request or equivalent proposed-change artifact. The handoff links the original task, summarizes the changed scope, names the checks run and their relevant results, records review findings and dispositions, and exposes remaining uncertainty. Opening the proposal does not imply permission to merge it.

Failure handling distinguishes an ordinary failed check from missing context, a policy violation, a conflict, or an exhausted iteration budget. The worker may correct an actionable test failure within its scope. It should block or escalate when the requested behavior is ambiguous, the change crosses an excluded boundary, verification cannot establish the claimed behavior, or a consequential decision was not approved.

This pattern is the foundation for delegated implementation. Its eligibility policy should consider affected users, data sensitivity, architectural reach, reversibility, observability, and recovery—not merely diff size or a model's confidence.

### Test And Dependency Maintenance

This scenario covers adding missing tests for known behavior, updating test infrastructure, or applying a bounded dependency update. These tasks are attractive because deterministic tools can provide strong feedback, but they are not automatically low risk.

For tests, the contract identifies the behavior or failure mode the evidence must represent. The agent-generated test is reviewed as part of the proposed change because it can repeat an incorrect implementation assumption or assert an incidental detail. Verification should demonstrate that the test detects the relevant failure when practical and that the implementation passes the corrected behavior without creating surrounding regressions.

For dependencies, deterministic infrastructure identifies the requested version range, lockfile effects, known advisories, license or policy constraints, build results, and relevant compatibility checks. The agent may diagnose and propose required adaptations, but it should not silently replace a library, broaden a major-version migration, or accept a security or licensing tradeoff outside the task contract.

The workflow escalates when representative integration environments are unavailable, a transitive update materially changes the dependency graph, release notes reveal a breaking contract, or the update affects runtime, security, or deployment behavior beyond the approved risk class.

### Pull-Request Feedback Correction

This scenario begins with a proposed change and one or more human or automated review findings. The agent retrieves the current diff, task contract, relevant discussion, and check state. It classifies each finding as a supported defect, non-blocking improvement, unresolved question, or unsupported claim before changing code.

Valid corrections remain within the original intent unless the reviewer and decision owner explicitly approve expanded scope. After correction, the worker reruns the evidence affected by the change and records a disposition against the original finding. Unsupported comments receive an explanation or request for evidence rather than a cosmetic edit designed only to satisfy the reviewer.

Deterministic controls prevent the feedback worker from merging the pull request, rewriting unrelated history, or treating the absence of further comments as approval. Iteration, time, and cost limits stop two models from arguing or repeatedly rewriting correct code when neither position can be verified.

The human acceptance boundary remains intact. This scenario reduces mechanical review work and makes dispositions auditable; it does not transfer risk acceptance to the correction agent or automated reviewer.

### Parallel Independent Tickets

This scenario assigns several eligible tasks to separate workers, each with its own claim, branch, worktree or stronger sandbox, context package, and proposed-change artifact. A coordinator tracks state, dependencies, resource budgets, and convergence while workers implement independently.

Parallel execution is appropriate when tasks have clear ownership boundaries, do not require incompatible changes to shared interfaces, and can be reviewed and merged independently. The coordinator may order dependent work or delay a task whose baseline is no longer valid. It should not hide dependency conflicts by asking workers to resolve consequential design differences without an owner.

Evidence remains separate per task so reviewers can determine which worker changed what and which checks support each result. Concurrency limits should reflect review capacity as well as compute and token budgets. A growing review queue, repeated merge conflicts, stale baselines, or loss of human situational awareness are signals to reduce parallelism.

This scenario is a later step than single-ticket delegation. Worktrees make concurrent changes manageable, but they do not prove task independence or provide process and credential isolation.

## Higher-Risk Extensions

The following scenarios use the same architecture but increase capability, duration, or consequence. They should not be treated as default starting points merely because they have been demonstrated successfully on a personal project.

### Production-Log-Driven Repair

An operational worker inspects a bounded batch of production signals, groups related failures, connects them to a repository state, and proposes a reproducible defect hypothesis. If the workflow can reproduce the behavior safely, an implementation worker may add a regression test, prepare a correction, and open a pull request.

The primary risks are sensitive data exposure, misleading or incomplete telemetry, false causal attribution, excessive access to production systems, and changes that hide a symptom instead of addressing the underlying condition. Controls should minimize and redact retrieved data, separate observation credentials from mutation authority, preserve source timestamps and environment identity, and require human escalation for uncertain diagnosis or operational changes.

The output is a supported proposal with links to sanitized evidence, reproduction status, test results, and operational uncertainty. It is not an autonomous incident-resolution claim. Rollback, live mitigation, capacity changes, and production mutation remain separately governed actions.

### Multi-Ticket Milestone

A milestone coordinator receives several approved tasks that contribute to one outcome. It models dependencies, identifies which tasks can run independently, sequences shared-interface changes, and tracks integration evidence across the milestone.

The risk is not simply more work. Local changes may each pass while the combined system violates the intended design or user journey. The milestone therefore needs an approved integration contract, compatible baselines, convergence checks, and an accountable person who understands the whole result. Individual pull-request evidence does not replace milestone-level integration and acceptance evidence.

The coordinator should stop when dependencies are ambiguous, workers make incompatible architectural assumptions, or review capacity is exhausted. Decomposing work into tickets must not decompose away the context needed for coherent design.

### Automated Merge

Automated merge moves the workflow from proposing durable change to accepting it. This requires a narrowly defined task family, protected branches, policy-backed eligibility, reliable checks, reversible changes, clear ownership, and evidence that human review can be omitted for that specific risk class without increasing escaped defects or recovery work.

The merge decision should be implemented by deterministic policy outside the worker's editable context. A model may summarize evidence or recommend a decision, but it should not grant itself merge authority. Sensitive paths, contract changes, migrations, security findings, unusual dependency changes, or unresolved review comments should force human review.

The organization should evaluate automated merge through accepted-change quality, rollback and incident rates, false acceptance, and time saved at the complete workflow level. Passing CI and receiving model approval are prerequisites in some profiles, not guarantees of safe acceptance.

### Deployment Goal

A deployment worker can prepare a plan, provision or configure approved resources, execute declared release steps, observe health checks, and assemble deployment evidence. The goal must specify the target environment, approved infrastructure design, cost and capacity boundaries, versions, credentials, health criteria, rollback conditions, and which actions require approval.

Agents are useful for mechanical execution and long-running observation. They should not invent regions, resource sizing, database versions, security policy, data migration strategy, or acceptable downtime. Infrastructure should remain reproducible and reviewable rather than existing only as a sequence of successful tool calls.

Deployment completion is not established by one healthy endpoint. Evidence may need service health, expected user flows, background-job state, monitoring, error rates, and rollback readiness. High-availability, regulated, sensitive, or difficult-to-reverse systems require explicit specialist authority and should retain human control over consequential transitions.

## Parallel And Multi-Agent Work

Parallelism improves elapsed time only when work is separable and the acceptance system can absorb the output. Separate worktrees prevent direct filesystem collision, but they do not remove semantic dependencies, incompatible design choices, merge conflicts, or review burden.

The system should treat concurrency as a budget across workers, sub-agent depth, task count, tokens, cost, and human attention. The sustainable limit is reached when additional work increases stale context, conflicts, rework, or time waiting for review faster than it increases accepted-change throughput.

A coordinator is useful when it owns routing, dependency order, state, and convergence. It should not become an uninspectable agent that performs all implementation, review, and acceptance itself. Worker and reviewer roles should be separated only when each has enough context and the additional perspective produces measurable value. Deep nesting without a distinct responsibility increases context loss and cost.

Parallel alternatives can be useful for exploration when outputs can be compared and discarded. Parallel implementation of a tightly coupled feature is usually less attractive because each worker may make incompatible local assumptions about the shared design.

## Failure And Recovery Semantics

An unattended system must make partial failure explicit. Relevant conditions include an expired claim, tool timeout, model interruption, failed verification, rejected review finding, permission denial, merge conflict, unavailable dependency, rate limit, or an agent that stops without meeting the contract.

Recovery begins from evidence, not from automatically asking the same worker to try indefinitely. The record should preserve the baseline, attempted actions, current workspace or artifact state, checks run, failure reason, and any external side effects. The workflow can then decide whether a bounded retry is safe, a fresh worker should resume from a checkpoint, the task should return to ready, or a human must intervene.

Retries need limits and should distinguish transient failures from repeated reasoning or design failures. Replaying a non-idempotent action can compound damage. A fresh worker may remove conversational bias, but it can also repeat the same failure when the contract, context, tool, or verifier is defective.

Cleanup should remove abandoned compute and workspaces while preserving diagnostic and audit evidence. A successful cleanup does not erase the failed attempt from workflow metrics.

## Permissions And Security

Permission should follow capability and consequence. Queue inspection, source reading, worktree edits, pull-request creation, merge, deployment, secret access, and production mutation are separate authorities. Granting one does not imply the others.

Use scoped and revocable credentials, restrict paths and network access where practical, and keep high-risk enforcement outside the model's editable context. Record allowed and blocked effectful attempts. Retrieved tickets, comments, repository files, dependencies, and generated instructions can all carry untrusted content; a trusted issue tracker is not automatically a trusted instruction source.

Polling can reduce inbound network exposure compared with a public webhook, but it does not make the worker secure by default. Credential theft, excessive API permissions, malicious task content, unsafe tool use, dependency compromise, and data egress remain part of the threat model.

## Quality And Correction

The worker's inner correction loop should use concrete evidence:

```text
implement -> verify -> evaluate -> revise, escalate, or stop
```

Compiler output, tests, static analysis, and reproducible runtime failures give the agent specific correction targets. Model review broadens the search for defects but produces hypotheses that must be supported. Repeated speculative reviewer comments should not cause indefinite code churn.

Generated tests require review because they can reproduce the implementation's mistaken assumptions. Real application execution matters because model review and unit tests can both miss integration or user-flow failures. Human review remains focused on intent, architecture, security, risk, and whether the evidence is sufficient rather than mechanically repeating every automated check.

Detailed quality-control responsibilities are defined in `ai-assisted-code-quality-control.md`.

## Governance And Ownership

Every shared workflow needs a named owner responsible for its purpose, eligible task family, task contract, permissions, checks, escalation behavior, evaluation, and retirement. Ownership cannot be assigned to the agent executing the workflow.

Changes to prompts, models, tools, context routing, memory, permissions, or orchestration change the system being governed. Important changes require versioning and representative regression evaluation. A workflow that proposes its own improvement should produce a reviewable candidate; it should not silently replace its own controls.

Human authority should remain visible at three boundaries:

- **Intent:** who approves the problem, outcome, and important constraints.
- **Risk:** who decides whether the task and requested capability are eligible for delegation.
- **Acceptance:** who determines that the evidence justifies a durable change or release.

The same person may own all three boundaries in a personal project. A larger organization may assign them to different roles. The responsibilities still need to be explicit.

## Evaluation And Metrics

Evaluate the whole accepted-change system rather than isolated agent runs. Useful measures include:

Evaluation design, grader selection, representative cases, repeated trials, baselines, containment tests, and autonomy gates are defined in `agent-workflow-evaluation.md`.

End-to-end flow, bottleneck, batch-size, model-routing, concurrency, caching, retry, review-capacity, and cost optimization are defined in `agent-pipeline-optimization.md`.

- first-pass acceptance and rework by task family and risk class
- confirmed defects found and escaped defects
- unsupported automated-review findings and human review burden
- ready-to-review time and time waiting for acceptance
- blocked, failed, abandoned, duplicate, and stale-claim rates
- conflicts and rework at different concurrency levels
- human intervention, latency, and cost per accepted change
- incidents or unauthorized effects attributable to the workflow
- recurrence of failure modes thought to be controlled

Activity measures such as tasks attempted, tokens consumed, comments produced, or agents running are diagnostic inputs, not success outcomes. A faster worker is not an improvement when it moves the bottleneck into review or recovery.

Compare workflow changes on representative retained tasks and record the model, harness, context, tools, permissions, and verifier. Expand autonomy only when evidence shows stable accepted-change quality and containment at the proposed risk level.

## Maturity Path

A safe adoption path increases responsibility gradually:

1. **Assist:** agents explore, plan, and draft while humans execute and decide.
2. **Propose:** agents change isolated workspaces and produce evidence-bearing artifacts for human review.
3. **Delegate:** approved low-risk task families run asynchronously with bounded permissions and explicit failure handling.
4. **Coordinate:** multiple workers or scheduled loops operate through a shared control plane with measured capacity and recovery.
5. **Automate selected transitions:** narrowly pre-authorized actions occur after proven gates, while consequential intent, risk, and acceptance remain accountable.

Progression is not permanent or universal. A workflow should reduce autonomy when its task family, environment, model, tools, risk, or evidence changes materially.

## Anti-Patterns

### Treating The Queue As Approval

A task appearing in a backlog does not mean it is ready or authorized for agent execution. Readiness requires an adequate contract and routing decision.

### Prompt-Only Governance

Instructions such as “do not perform destructive actions” are useful behavioral context but do not replace scoped permissions, policy gates, or isolated execution.

### Worktrees As Sandboxes

Worktrees isolate Git state. They do not contain processes, secrets, network access, or hostile generated code.

### More Agents As The Default Scaling Strategy

Additional workers can produce conflicts and review queues faster than accepted changes. Parallelism must be justified by separability and measured system capacity.

### Reviewer Agreement As Proof

Several agents can repeat the same plausible mistake. Acceptance requires evidence tied to the task contract, not consensus alone.

### Automatic Self-Improvement

Unreviewed memory, prompts, or generated skills can preserve stale or incorrect behavior. Self-modification is a proposed harness change that requires provenance, evaluation, and approval.

### Counting Produced Changes

Pull requests, lines of code, review comments, and agent runs measure activity. Accepted outcomes, rework, defects, incidents, review burden, and cost reveal whether the system helps.

## Relationship To Other Strategy Documents

This document owns the architecture of delegated development from a task contract to an evidence-bearing proposed change.

- `ai-assisted-engineering-process.md` defines the broader human-agent development process and task-contract context.
- `ai-harness-engineering.md` defines general harness components, context routing, guardrails, permissions, and control loops.
- `ai-assisted-code-quality-control.md` defines detailed testing, model review, correction, human review, and runtime feedback.
- `ai-engineering-metrics.md` defines organization-level measurement and accepted-change economics.
- `ai-native-engineering-phases.md` defines the organizational adoption path and governance maturity.
- `../guidelines/agent-guideline.md` and `../guidelines/skill-guideline.md` define when reusable agent roles and workflow skills are appropriate.

Implementation-specific adapters, commands, credentials, and deployment procedures belong in the tool or repository that operates the workflow, not in this strategy.

## Current Evidence Basis

The architecture is informed by a practitioner corpus from the [Owain Lewis YouTube channel](https://www.youtube.com/@owainlewis), especially [I Built an Agentic Software Factory with Codex and Claude Code](https://www.youtube.com/watch?v=AbpyqAfxZ8c), [Agent Loops: Complete Guide](https://www.youtube.com/watch?v=RVEaDvh6f5A), [My Multi-Agent Team](https://www.youtube.com/watch?v=Zhbx-dj0qHE), [Claude Code + Linear](https://www.youtube.com/watch?v=9YpHBUmwY5M), and [Codex Can Manage Itself](https://www.youtube.com/watch?v=WKG7VF7bL3I). The videos demonstrate configurable workflows, issue-based control planes, polling workers, worktree isolation, deterministic hooks, model review, durable threads, and bounded human handoff.

The demonstrations are not controlled studies and do not establish that unrestricted autonomous development is safe or more productive. Several also reveal the limits of the pattern: missed runtime failures, high token use, stale memory, coordination overload, and incomplete sandboxing. The guidance in this document therefore treats scale and autonomy claims as hypotheses to evaluate on representative repositories and accepted changes.

## Summary

A governed agentic development system combines a reviewable task contract, inspectable control-plane state, an isolated and bounded worker, deterministic controls, adaptive agent work, evidence-based correction, and accountable acceptance.

The system succeeds when it makes suitable work easier to delegate without hiding uncertainty, weakening human understanding, or moving cost and failure into review and operations. Its unit of value is the accepted, maintainable change—not the agent run.

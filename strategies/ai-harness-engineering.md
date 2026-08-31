# AI Harness Engineering

## Purpose

AI harness engineering turns one-off AI prompting into durable, repeatable, inspectable workflows.

The model is replaceable intelligence. The harness is the reusable system around it: context, tools, skills, commands, checks, permissions, review gates, and output artifacts.

## Core Idea

An AI agent is:

```text
model + harness
```

The model provides reasoning and generation. The harness gives it the body and operating loop needed to do useful work.

A good harness helps the agent:

1. understand the task
2. load the right context
3. choose and use tools
4. produce artifacts
5. verify results
6. decide whether to continue, revise, or stop
7. hand work back to humans or another workflow

## Loop Engineering

Loop engineering is the layer around a harness that makes work repeat. A harness defines how one agent run gets context, uses tools, produces output, and verifies it. A loop defines what triggers the run, what state survives, what evidence is collected, what constraints bound it, and whether the workflow should continue, revise, escalate, or stop. The inner agent or tool loop and the outer workflow may be nested: an outer loop can re-enter after a context boundary, schedule, CI signal, or operational event.

### Traceable Verification

For workflows that can change durable state, connect the loop to a traceable acceptance record:

- **Intent and constraints:** the requirement, scenario, invariant, or risk boundary the work must satisfy.
- **Proposed action:** what the agent plans to change and which context or tools it used.
- **Verification evidence:** the narrowest check that demonstrates the relevant invariant, broadened when the change has wider impact or uncertainty.
- **Decision and baseline:** the human approval, escalation, or rejection, plus the version or baseline that the next iteration must use.

Traceability does not mean generating paperwork for every task. It means keeping enough linkage for a reviewer to understand why the action was taken, what it proves, and which state is now trusted. A passing local check is not system-level proof when the change affects contracts, dependent components, safety constraints, or external behavior.

A practical loop makes these elements explicit:

- **Trigger:** what starts or re-enters the workflow.
- **State:** what goal, plan, memory, artifacts, and prior results persist.
- **Action:** what the agent may change or inspect, using which tools and permissions.
- **Observation:** which logs, test results, diffs, traces, or operational signals provide evidence.
- **Completion:** the definition of done and the checks that must pass.
- **Control:** token, time, iteration, scope, and cost limits.
- **Decision:** whether to continue, revise, request human input, or stop.

For operational signals, prefer a bounded batch with enough context to identify related events over running an agent independently for every noisy alert. The batch still needs a clear scope, evidence sources, stop condition, and escalation path.

Unattended execution increases the chance that a small mistake compounds across iterations. Scheduled or event-driven loops therefore need explicit permissions, verifiers, stop conditions, and human escalation for high-risk decisions. Autonomy is useful only when the workflow makes failure visible and limits how far the agent can proceed.

### Choose The Smallest Control Flow

Use a predefined workflow when the stages and acceptance checks are knowable, reproducibility or auditability matters, latency or cost is constrained, or a deterministic tool can solve the task. Use a dynamic agent when the next steps depend on runtime discoveries and cannot be bounded reliably in advance. Even then, keep the action space bounded, return ground truth from tools or tests at each step, and enforce explicit iteration, time, cost, and permission limits. Add orchestration, memory, or multi-agent behavior only when evaluation shows that it improves outcomes or reviewability.

### Task Control Plane And Worker Isolation

Here, a **worker run** means one task-specific execution of an agent definition. One reusable agent can have several isolated worker runs for different tasks; “worker” below is shorthand for one such run.

Asynchronous work needs an inspectable control plane when chat or a local task list no longer provides enough visibility. The control plane is the system of record for task state, ownership, dependencies, evidence, and escalation. It may be a ticket system, a pull-request system, durable agent threads, or another shared store. The particular product matters less than the contract it provides.

A delegated task should have enough state to distinguish work that is ready, claimed or active, awaiting review, blocked, failed, and completed. The exact labels may vary. What matters is that a human or another workflow can determine what is happening, who or what owns the next action, and why the state changed. Claims or leases should prevent two workers from silently executing the same task, and stale claims need an explicit recovery path.

Each worker needs an execution boundary. Separate branches and worktrees isolate concurrent source changes on a trusted local machine. They do not isolate processes, credentials, network access, or untrusted generated code. Team services, remote workers, sensitive repositories, and effectful tools may require stronger process, filesystem, credential, and network sandboxing. Choose the boundary from the capability and consequence of the work, not from the convenience of the agent product.

Place deterministic preparation and verification around probabilistic work. Pre-execution hooks can validate the task contract, reject a dirty workspace, prepare an isolated branch, and establish scoped credentials. Post-execution hooks can run required checks, publish an artifact, attach evidence, and update state. Consequential policy should not depend only on the model remembering to follow prompt instructions.

Parallelism also needs a budget. Bound concurrent workers, sub-agent depth, tasks per run, retries, time, and cost. Increase those limits only when tasks are genuinely separable, merge boundaries are clear, and the team can understand and review the resulting work. More workers can reduce execution time while increasing conflicts, review queues, and loss of situational awareness. Clean up abandoned workspaces and partial artifacts without discarding the evidence needed to diagnose the failure.

## Guardrails And Control Loops

Guardrails are durable controls that constrain agent behavior, reject invalid output, detect unsafe conditions, or preserve important engineering decisions. They compensate for the fact that model behavior is probabilistic and that prompts alone cannot reliably enforce every requirement.

Guardrails operate at different layers:

| Layer | Purpose | Examples |
| --- | --- | --- |
| Behavioral | Communicate expected agent behavior | Repository instructions, documented constraints |
| Structural | Enforce recognizable code and configuration rules | Linters, static analysis, schema validation |
| Verification | Reject incorrect or unsupported results | Tests, CI checks, evaluators |
| Architectural | Preserve consequential design decisions | Architecture decision records, contract tests, dependency rules |
| Operational | Detect failures visible only during execution | Monitoring, alerts, synthetic checks |
| Capability | Restrict what an agent may do | Permissions, policy gates, scoped credentials |
| Decision | Preserve human authority over consequential choices | Approval gates, escalation boundaries |

These mechanisms are complementary. A documented constraint communicates intent but may not enforce it. A linter enforces recognizable structural patterns but usually cannot prove system behavior. A test verifies the cases it represents, while CI determines whether that evidence blocks progression. An architecture decision record preserves the reason for a choice but does not enforce the choice by itself. Monitoring covers conditions that cannot be established before deployment, and permission gates restrict actions independently of what the model decides.

Where a requirement can be checked reliably and deterministically, executable enforcement is generally stronger than prompt text alone. Documentation remains necessary for intent, rationale, tradeoffs, and constraints that cannot be reduced safely to a mechanical check.

A control loop connects agent action to evidence and uses that evidence to determine what happens next:

```text
intent -> action -> observation -> evaluation -> decision
             ^                                      |
             +----------- revision or stop <--------+
```

A loop is closed only when observations influence subsequent behavior. Producing logs without evaluating them is observability, not a control loop. Running tests without making their results affect acceptance provides evidence but not an effective gate.

Control loops can exist at several nested timescales:

| Loop | Feedback | Typical response |
| --- | --- | --- |
| Execution | Tool results, compiler output, tests | Agent revises or completes the current work |
| Delivery | CI, review, and acceptance evidence | Change is accepted, rejected, or revised |
| Operational | Runtime telemetry, incidents, and user behavior | System is corrected, rolled back, or escalated |
| Improvement | Repeated failures and review findings | Harness context, checks, or guardrails evolve |

A control loop should use the closest reliable signal to the intended outcome. Tests and evaluators establish implementation correctness; runtime, user, and business measures determine whether the system produced the intended result. An operational failure can therefore enter the improvement loop and produce a new delivery-time control that prevents the same class of problem from reaching production.

Failures can reveal missing or misleading context, an unenforced constraint, incomplete verification, excessive permissions, an unobserved runtime condition, a design decision that was never made durable, or a completion criterion disconnected from the actual outcome. A mature harness does more than repair the immediate output. It preserves consequential and reusable learning in the layer that allowed the failure:

| Revealed gap | Durable harness response |
| --- | --- |
| Previously incorrect behavior | Regression test |
| Invalid integration or build state | CI check |
| Repeated structural problem | Linter or static-analysis rule |
| Runtime-only condition | Monitoring or synthetic check |
| Missing behavioral context | Documented constraint |
| Unstable architectural decision | Architecture decision record with appropriate enforcement |
| Excessive capability | Permission or policy gate |
| Weak completion evidence | Stronger verifier or quality gate |

This does not mean mechanizing every failure. Guardrails have maintenance cost, can create false positives, and can suppress useful model behavior. Durable controls are most valuable when a failure is consequential, repeatable, representative of a broader weakness, or inexpensive to detect reliably.

Good guardrails are:

- **Layered:** no single mechanism is treated as complete protection.
- **Risk-based:** stronger controls protect consequential or irreversible actions.
- **Independent where necessary:** high-risk enforcement does not depend on the same model being constrained.
- **Evidence-producing:** rejection or escalation identifies the condition that was violated.
- **Scoped:** controls apply to the relevant workflow, repository, or capability.
- **Inspectable:** humans can understand what the control protects and why.
- **Maintainable:** obsolete constraints and checks can be revised or retired.
- **Proportionate:** the control does not cost more than the risk it addresses.

Human understanding is also part of the control system. Consequential workflows should preserve enough design, implementation, and operational evidence for responsible engineers to explain important behavior and intervene when automation fails.

Guardrails should address material risk or an actual lifecycle constraint. Guardrail count, agent utilization, and local automation speed are not measures of end-to-end improvement. The objective is not maximum control, but reliable delivery without making the harness so rigid that it suppresses useful reasoning or becomes uninspectable itself.

## Harness Components

A practical harness may include:

- context files, such as `AGENTS.md`, `CLAUDE.md`, specs, docs, and examples
- skills for repeatable task-specific judgment
- commands for repeatable workflows
- tools for reading, editing, searching, testing, deploying, or integrating systems
- scripts for deterministic work
- reviewer prompts or reviewer agents
- permission gates, external policy enforcement, and approval rules
- tests, checks, evals, or simulations
- artifacts such as plans, reports, PRs, summaries, and handoff notes

The value is not any single component. The value is the workflow they create together.

When these components are reused across repositories or teams, `ai-asset-registry.md` defines how source, ownership, provenance, compatibility, permissions, evaluation, approval, and retirement remain visible.

For effectful workflows, separate proposal from execution. Let the model draft or request an action, but keep credential use, state transitions, writes, and egress decisions in deterministic code or an external policy gate that the model cannot rewrite. Use scoped, revocable credentials and record allowed and blocked attempts in an append-only trace.

Treat agent security as three related boundaries:

- **What the agent generates:** code, configuration, documentation, tests, and other durable artifacts.
- **What the agent uses:** prompts, retrieved context, skills, dependencies, MCP servers, models, credentials, and non-human identities.
- **What the agent does:** commands, file writes, secret reads, network requests, deployments, and other side effects.

Reviewing only generated code leaves capability and behavior risks outside the control surface. A practical harness checks these boundaries separately, uses deterministic hooks or an external policy gate for high-risk writes and tool calls, blocks or escalates according to the workflow's risk, and records both allowed and blocked attempts. Where continuous checks are possible, prefer compact delta findings that do not consume the agent's context. This makes the software factory—including prompts, pipelines, tools, and identities—as important a security perimeter as the application output.

## Context Routing

Context should be routed, not dumped.

The complete lifecycle for context categories, retrieval, provenance, authorization, working state, persistent memory, and durable adaptation is described in `agent-context-systems.md`. This section summarizes the harness-level routing principles.

Avoid loading every rule, document, example, and prior conversation into one prompt. Provide an entrypoint that tells the agent where to find the context it needs.

Good harnesses:

- keep the main context small and coherent
- point agents to relevant files instead of pasting everything
- load detailed references only when needed
- avoid stale, irrelevant, or conflicting context
- keep task-specific context close to the workflow that uses it

Fresh context helps only when the handoff is good. A separate agent or session needs the goal, constraints, relevant files, acceptance criteria, and expected output.

Treat context assembly as an inspectable build step. Keep stable project memory, task-specific context, current artifacts, and external evidence distinct; compile the smallest task-relevant package rather than asking each agent to rediscover the whole repository. For long-running or resumable loops, checkpoint state and compact prior observations without losing the goal, constraints, verification evidence, or escalation path. Record enough context sources and uncertainty for a reviewer to understand what the agent saw.

Treat inferred memory as untrusted derived context, not as an authoritative fact store. Conversation history, model summaries, and automatically extracted preferences can preserve a casual statement, stale condition, or incorrect inference and then steer every later task. Where persistent memory affects decisions, record its source, scope, confidence, creation time, and freshness or expiry as appropriate. Make it inspectable, correctable, supersedable, and removable.

Do not automatically promote an observation into repository guidance, a skill, a constraint, or policy merely because one agent run appeared successful. Durable promotion should be based on a recurring need or material failure, reviewed against authoritative sources, and evaluated on representative tasks. Workflows that modify their own memory or instructions remain subject to the retained-regression requirements in **Continuous Improvement**.

For large or unfamiliar repositories, routed context can include generated indexes, repository maps, or repository knowledge graphs. Use these artifacts to locate relevant source, symbols, dependencies, tests, and docs before broad file reads. They should expose source paths, relation types, freshness, and uncertainty. They should not replace source code, tests, config, or maintained documentation as evidence.

## Commands and Skills

Use commands for repeated workflows such as:

- refresh research
- create a spec
- review a PR
- generate release notes
- run a content pipeline
- prepare a migration plan

Use skills for repeatable task-specific judgment, such as:

- writing in a specific voice
- reviewing for security risk
- checking output against a spec
- avoiding AI-slop patterns
- producing a standard report format

If a workflow repeats, preserve it as a command, skill, script, or extension instead of relying on memory or ad hoc prompting.

Choose the mechanism by the responsibility it must own:

| Mechanism | Use for |
| --- | --- |
| Script or tool | Deterministic transformation, query, validation, or system action |
| Skill | On-demand repeatable judgment or procedure |
| Hook or extension | Executable lifecycle interception, state, integration, or user-interface behavior |
| Agent | Separable role with a checkable judgment output |
| Workflow | Ordered coordination of tools, agents, gates, artifacts, and state transitions |

Do not encode an exact operation as prose when deterministic code can implement it more reliably. Conversely, do not hide consequential judgment in a script merely to make the workflow appear deterministic.

## Quality Gates

Longer workflows need explicit quality gates.

Common pattern:

```text
producer creates output
reviewer checks output against criteria
orchestrator decides revise or accept
```

Reviewer roles need clear criteria, not a generic review request.

Useful review criteria include:

- correctness
- source support
- test coverage
- security and data handling
- maintainability
- spec alignment
- style or voice fit
- operational risk

The reviewer can be a human, a skill, a second model, a script, a test suite, or another agent. High-risk acceptance remains a human responsibility.

## Autonomy Levels

Autonomy should match risk.

A simple scale:

```text
Level 0: AI suggests only.
Level 1: AI drafts, human applies.
Level 2: AI changes files, human reviews.
Level 3: AI opens PRs or artifacts, human approves.
Level 4: AI merges, deploys, or updates systems after approved checks.
```

Increase autonomy only when:

- the workflow is repeatable
- the risk is understood
- checks are reliable
- rollback is possible
- ownership is clear
- failures are visible

Do not use full autonomy just because the model can do it.

## Durable Outputs

Good harnesses produce inspectable artifacts, not only chat.

Examples:

- `PLAN.md`
- `TODO.md`
- research brief
- implementation spec
- review report
- PR description
- test output
- generated code or content
- deployment checklist
- handoff prompt

Durable outputs make work easier to review, repeat, debug, resume, and improve.

## Model Portability

Models change. Harnesses should survive model changes where possible.

Good harnesses avoid depending on one model's quirks. They make tools, context, checks, and output expectations explicit.

Model choice is a tradeoff across:

- quality
- cost
- latency
- privacy
- capacity
- availability

A useful pattern is:

```text
Use stronger frontier models to design and debug the harness.
Use cheaper or open models for stable repeatable execution when quality is sufficient.
```

When changing models, test important workflows and expect prompts or context routing to need adjustment.

## Continuous Improvement

Failures in agent-assisted work are feedback about the harness. Use the guardrails and control-loops model to determine whether a failure indicates missing context, verification, enforcement, observability, permissions, or durable design knowledge.

Detailed guidance for evaluation contracts, representative suites, graders, repeated trials, baselines, containment, and autonomy gates is provided in `agent-workflow-evaluation.md`.

When an agent repeatedly fails, do not only fix the output. Fix the workflow.

Examples:

- missing tests -> update implementation checklist or verifier
- hallucinated source -> add citation requirement or source checker
- wrong files edited -> improve repo instructions or tool permissions
- poor tone -> update voice skill
- unsafe command -> add permission gate
- repeated review comment -> add test, lint, prompt rule, or reviewer check

When a workflow changes its own prompt, tools, context routing, memory, or orchestration, separate a small trusted improvement set from an unseen holdout or retained regression set. Evaluate the changed workflow on both sets, and inspect evaluator agreement and failure-mode coverage alongside pass rates; if every challenger wins, question the evaluator before the workflow. Accept an improvement only when gains hold on retained tasks without materially increasing regressions, cost, latency, or human intervention.

Improvement loop:

```text
observe failure
identify missing context, tool, check, or rule
update the harness
rerun the workflow
preserve the improvement
```

## Practical Design Rules

- Keep the harness small enough to inspect.
- Match harness complexity to the task. Use deterministic checks or simple tool flows for narrow, objective work; reserve richer agent loops, memory, and multi-agent orchestration for tasks whose ambiguity justifies them. Add constraints when traces show repeated harmful failures, and loosen them when they only suppress useful behavior.
- Prefer explicit files and artifacts over hidden state.
- Keep context coherent and task-specific.
- Add agents only when roles are separable.
- Use reviewer gates for important outputs.
- Match autonomy to risk.
- Make failures visible.
- Convert repeated mistakes into durable improvements.
- Keep model choice flexible where practical.

## Summary

AI harness engineering makes AI-assisted work repeatable and reliable.

The goal is not complex agent systems for their own sake. The goal is workflows where humans define intent, risk, and acceptance while AI agents perform repeatable work inside clear context, tools, checks, and review boundaries.

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

For effectful workflows, separate proposal from execution. Let the model draft or request an action, but keep credential use, state transitions, writes, and egress decisions in deterministic code or an external policy gate that the model cannot rewrite. Use scoped, revocable credentials and record allowed and blocked attempts in an append-only trace.

## Context Routing

Context should be routed, not dumped.

Avoid loading every rule, document, example, and prior conversation into one prompt. Provide an entrypoint that tells the agent where to find the context it needs.

Good harnesses:

- keep the main context small and coherent
- point agents to relevant files instead of pasting everything
- load detailed references only when needed
- avoid stale, irrelevant, or conflicting context
- keep task-specific context close to the workflow that uses it

Fresh context helps only when the handoff is good. A separate agent or session needs the goal, constraints, relevant files, acceptance criteria, and expected output.

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

Harness failures should become harness improvements.

When an agent repeatedly fails, do not only fix the output. Fix the workflow.

Examples:

- missing tests -> update implementation checklist or verifier
- hallucinated source -> add citation requirement or source checker
- wrong files edited -> improve repo instructions or tool permissions
- poor tone -> update voice skill
- unsafe command -> add permission gate
- repeated review comment -> add test, lint, prompt rule, or reviewer check

When a workflow changes its own prompt, tools, context routing, memory, or orchestration, evaluate both the new target tasks and a retained regression set. Accept an improvement only when the new-task gains do not materially degrade retained tasks. Record regression failures, cost, latency, and human intervention alongside the headline task score so optimization does not reward narrow overfitting.

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

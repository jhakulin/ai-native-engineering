# Agent Pipeline Optimization

## Purpose

This document explains how to improve the end-to-end performance of an agent workflow without sacrificing accepted-change quality, containment, human understanding, or recoverability.

Pipeline optimization is not prompt shortening or running more agents. It is the disciplined improvement of flow from intent to accepted outcome. The relevant resources include elapsed time, compute, model tokens, tool calls, infrastructure, human attention, and recovery work. An optimization is useful only when it improves the complete system at an acceptable risk and cost.

## Scope

The document covers stage modeling, bottlenecks, batch size, work in progress, deterministic and agentic work allocation, context cost, model and tool routing, concurrency, batching, caching, correction loops, human review capacity, experiments, and quality-adjusted economics.

It does not prescribe one universal pipeline. Research, coding, support, and operational workflows have different outcomes and constraints. The method is to identify the actual system boundary, measure it, and improve the limiting stage without moving failure elsewhere.

## Optimization Objective

Use the accepted outcome as the unit of value:

```text
quality-adjusted throughput
=
accepted outcomes that satisfy task and containment requirements
/
elapsed time + compute + model cost + human attention + recovery burden
```

This is a decision model, not a literal formula requiring unlike quantities to be collapsed into one number. Report the important dimensions separately. The purpose is to prevent local activity measures—tokens per second, tasks attempted, lines generated, agents running, or review comments—from becoming the optimization target.

A faster implementation stage is a regression when it creates larger diffs, more false review findings, longer acceptance queues, additional incidents, or code humans cannot maintain.

## Pipeline Model

A development pipeline commonly contains:

```text
intake
  -> refinement and readiness
  -> routing and claiming
  -> context compilation
  -> implementation or production
  -> deterministic verification
  -> model review and correction
  -> shared integration checks
  -> human acceptance
  -> deployment or publication
  -> runtime and user feedback
```

Each stage has processing time, waiting time, failure and rework probability, resource demand, input quality, output quality, and capacity. The pipeline also contains feedback loops: an unclear task returns to refinement, a failed test returns to implementation, a review finding triggers correction, and an incident may change an earlier verifier or guardrail.

Map the actual flow before optimizing it. A diagram that omits waiting for product clarification, environment setup, review, rate limits, or recovery will optimize only the visible agent execution.

## Flow Measures

Useful measures include:

| Measure | Meaning |
| --- | --- |
| End-to-end lead time | Time from eligible intent to accepted outcome |
| Processing time | Time a stage actively works on an item |
| Waiting time | Time an item waits for capacity, input, approval, or external state |
| Work in progress | Items started but not yet accepted or stopped |
| Throughput | Accepted outcomes per period |
| First-pass acceptance | Outcomes accepted without substantial correction or restart |
| Rework | Additional work caused by incomplete or incorrect earlier output |
| Failure demand | Work created by defects, retries, incidents, or pipeline malfunction |
| Human touch time | Active clarification, review, correction, and adjudication effort |
| Cost per accepted outcome | Model, compute, infrastructure, and attributable human cost |

Measure by task family and risk class. Combining documentation fixes, migrations, and architectural changes into one average hides different constraints and appropriate control profiles.

## Find The System Constraint

The limiting stage is where additional upstream output accumulates instead of becoming accepted value. Signals include growing queues, long waiting time, high utilization with frequent interruptions, repeated handoff failure, or work that must be redone downstream.

Common constraints include:

- unclear intake and repeated clarification
- slow repository or source discovery
- unavailable environments or flaky tools
- model latency or rate limits
- oversized tasks and context
- long or speculative correction loops
- CI capacity
- specialist review
- human acceptance and comprehension
- integration conflicts
- deployment windows or operational approval

Improve the current constraint before increasing upstream capacity. Adding workers to implementation when human review is already saturated increases work in progress and staleness without increasing accepted throughput.

Constraints move. After one stage improves, remeasure the full flow rather than continuing to optimize the stage that used to be slow.

## Task Readiness And Input Quality

Poor input creates downstream variance. A task that lacks intended outcome, authoritative context, constraints, non-goals, and proof expectations causes agents to rediscover decisions, generate larger changes, or enter review with unresolved ambiguity.

Readiness optimization does not mean producing longer specifications. It means resolving the few uncertainties that would otherwise cause expensive divergence. A concise approved task contract can reduce model tokens, iterations, reviewer effort, and rejected work simultaneously.

Use refinement only where it changes execution quality. Automatically expanding every ticket into a long document adds queue time and context without necessarily improving the result. Track which missing fields actually predict clarification or rework.

## Batch Size And Task Slicing

Smaller coherent batches usually reduce feedback time, context, diff size, merge risk, and recovery cost. DORA guidance similarly emphasizes small batches as a software-delivery capability. The relevant unit is a reviewable outcome, not the smallest possible code edit.

A useful slice has one intelligible outcome, enough context to preserve design coherence, a bounded impact surface, and evidence that can be evaluated independently. Excessive slicing creates coordination, repeated setup, duplicated context, integration overhead, and local decisions that conflict with the whole design.

Optimize batch size experimentally by observing first-pass acceptance, review time, conflicts, integration failures, and total lead time. Do not use ticket count or lines changed as universal sizing rules.

## Deterministic Versus Agentic Work

Move exact, repeated operations into deterministic code when doing so improves reliability and cost. Suitable examples include queue polling, schema validation, metadata extraction, task claiming, branch preparation, known queries, formatting, required command execution, state transitions, artifact publication, and permission enforcement.

Use models where the next action depends on interpretation, incomplete language, repository discovery, diagnosis, synthesis, or tradeoff exploration. A deterministic shell around probabilistic work reduces token use and makes workflow invariants independent of model compliance.

Do not automate judgment merely to reduce model calls. A script that encodes an unstable or consequential decision can hide risk more effectively than a model prompt. The correct boundary depends on whether the rule is explicit, reliable, testable, and owned.

## Context Efficiency

Context optimization should reduce irrelevant material and repeated discovery without omitting necessary authority or impact information.

Useful techniques include:

- concise repository entry points that route to deeper sources
- task-specific context compilation
- exact or structural retrieval before broad semantic search when the question permits it
- stable indexes and generated repository maps
- fresh contexts at meaningful role or task boundaries
- versioned checkpoints for long-running work
- artifact references instead of repeated conversational summaries

Measure task success, missed dependencies, human correction, context size, and latency together. Token reduction is a regression when a smaller context omits the contract or source that would have prevented rework.

Detailed context-system guidance is provided in `agent-context-systems.md`.

## Model Routing

Different stages may justify different models based on capability, latency, cost, tool use, context handling, and availability. A stronger model may reduce retries and human correction enough to be cheaper per accepted outcome. A smaller model may be sufficient for stable classification or formatting.

Routing policy should use a bounded task profile rather than letting each agent choose any model without cost or quality evidence. Record the resolved model and version in traces. Fallback behavior must not silently substitute a weaker model for a high-risk decision and preserve the same approval status.

Evaluate routing on the complete workflow. Compare task outcome, containment, reliability, latency, tokens, and human burden under equivalent conditions. Model price per token is not pipeline economics.

## Tool Selection And Interface Cost

Every tool adds schema context, routing choice, latency, failure modes, permissions, and maintenance. Prefer a small set of powerful, well-defined tools, but split capabilities when permissions, side effects, or error semantics need independent control.

Optimize tool calls by improving interfaces and returning compact ground truth. Avoid repeated broad reads, unbounded command output, and agent-side parsing that deterministic code can perform reliably. Tool results should include enough structured evidence for the next decision without flooding context.

Parallel tool calls are useful when operations are independent and the result order does not alter correctness. Serial execution remains appropriate when later calls depend on earlier results or when concurrent side effects can conflict.

## Concurrency And Work In Progress

Parallel agents reduce elapsed execution only for separable work. They also consume rate limits, compute, context, coordination, merge capacity, and human attention.

Set concurrency from the capacity of the complete pipeline, especially the slowest acceptance and integration stages. Increase workers gradually and observe:

- accepted outcomes per period
- review waiting time
- stale task baselines
- merge and design conflicts
- retries and rate limits
- human context switching
- cost per accepted outcome

When throughput stops improving or review and rework grow disproportionately, additional concurrency is negative capacity. Limit sub-agent depth as well as top-level workers; nested delegation can multiply cost without producing independent value.

Work in progress should remain visible in the control plane. Unbounded started work ages, diverges from the baseline, and creates cleanup and decision debt.

## Sequential, Parallel, And Speculative Execution

Use sequential execution when tasks share design decisions, modify common interfaces, or depend on each other's accepted state. Use parallel execution for independent tasks with clear ownership and merge boundaries.

Speculative parallelism creates several alternative solutions and selects one. It can improve exploration when candidates are cheap, isolated, and objectively comparable. Its economics include all attempts plus selection and cleanup. Best-of-many output is not first-attempt reliability and requires a trustworthy selector.

A coordinator can manage dependencies and convergence, but coordination itself is a pipeline stage with latency, context, and failure. Compare against a simpler workflow before treating orchestration as an optimization.

## Batching

Batching can reduce fixed overhead for source retrieval, environment startup, model requests, operational-signal analysis, or human review. It is useful when items share context and can still be separated for outcome, permission, and error handling.

Large batches increase latency for the first item, mix unrelated evidence, expand blast radius, and make retry or attribution difficult. Do not batch state-changing actions that need independent authorization or idempotency merely to save calls.

For noisy runtime signals, a bounded contextual batch can be better than one agent per alert because it supports deduplication and causal grouping. The batch still needs a time window, source identity, maximum size, and separate dispositions.

## Caching And Reuse

Cache deterministic and expensive artifacts when their identity and invalidation conditions are clear: dependency installations, repository indexes, source snapshots, parsed schemas, stable retrieval results, test environments, and compiled context fragments.

Every cache needs a key that represents the relevant source state, permissions, configuration, and environment. A repository index keyed only by repository name can return stale branch data; a context cache shared across users can violate access; a model-response cache can preserve obsolete decisions.

Prefer reusable source-derived artifacts over cached model conclusions. Record cache hits and source versions so evaluation can distinguish genuine workflow behavior from reused results.

## Correction Loops And Retry Amplification

Correction loops add value when evidence gives an actionable target. Compiler errors, reproducible tests, policy violations, and supported review findings can guide bounded revision. Generic model criticism can create churn without increasing correctness.

Measure iterations, reason for re-entry, evidence resolved, and final disposition. Repeated failure of the same type suggests a defective task contract, context, tool, environment, or verifier rather than a need for unlimited retries.

Retries amplify token use, external calls, and side effects. Classify transient infrastructure failure separately from reasoning or design failure. Use idempotency, checkpoints, maximum attempts, backoff, and escalation. Never replay a consequential action solely because the agent did not receive a confirmation message.

## Review And Acceptance Capacity

Human attention is a pipeline resource and part of the control system. Automation should reduce mechanical review while preserving attention for product intent, architecture, security, risk, and unsupported evidence.

Improve review flow through smaller coherent changes, evidence-bearing handoffs, severity classification, deterministic prechecks, source links, and clear dispositions. Adding more automated reviewers can increase false positives and latency; evaluate confirmed defects found, misses, and human adjudication burden.

Queue time may reveal that the bottleneck is decision ownership rather than reviewer speed. Clarify who can accept which risk class and what evidence they require. Do not optimize by silently lowering the acceptance bar.

## Pipeline Reliability And Recovery

An optimized pipeline remains observable and recoverable. Track failed transitions, stale claims, orphaned workspaces, partial effects, flaky environments, rate limits, and evaluator failures separately from agent task failure.

Checkpoint only enough trusted state to resume safely. Cleanup should free resources while preserving diagnostic evidence. A fast retry path that loses failure provenance or repeats non-idempotent effects is not an optimization.

Design graceful degradation. When a model, tool, reviewer, or context source is unavailable, the workflow may queue, use an evaluated fallback, reduce scope, return to interactive operation, or stop. Silent substitution can invalidate prior evaluation and approval.

## Optimization Experiments

Treat pipeline changes as hypotheses. Define:

- target system outcome
- expected mechanism
- task family and risk class
- current baseline
- variables changed
- quality, containment, latency, cost, and human-burden measures
- stopping and rollback criteria
- evaluation and observation period

Change one major variable at a time when attribution matters. Use representative retained cases before production, then shadow or pilot where real queues and human behavior are part of the effect.

Compare per accepted outcome. A cheaper run with lower acceptance can cost more after retries and review. A faster parallel system can reduce lead time for individual tasks while increasing the age of the complete backlog.

Evaluation methodology is defined in `agent-workflow-evaluation.md`.

## Pipeline Optimization Loop

```text
map actual flow
  -> establish baseline
  -> locate current constraint
  -> propose one bounded change
  -> evaluate offline
  -> pilot with observed queues and humans
  -> compare accepted outcomes and burden
  -> keep, revise, or revert
  -> locate the new constraint
```

Preserve changes that generalize across representative work. Retire optimizations whose complexity, maintenance, or hidden coupling costs more than the capacity they create.

## Anti-Patterns

### Maximizing Agent Utilization

Keeping every worker busy increases work in progress when downstream capacity is constrained. Optimize accepted flow, not worker occupancy.

### More Parallelism By Default

Concurrency can shift time into review, conflicts, rate limits, and loss of human understanding.

### Cheapest Model Per Call

Run price ignores retries, correction, human burden, and escaped failure. Compare cost per accepted outcome.

### Context Reduction As A Goal

Smaller context is useful only when it retains the authority and impact information needed for correct work.

### More Review Layers

Additional model reviewers may repeat the same blind spot or create false-positive queues. Require demonstrated marginal value.

### Automatic Retry Of Every Failure

Repeated reasoning and non-idempotent side effects can amplify cost and harm. Classify before retrying.

### Local Stage Metrics

Faster generation, more tool calls, or shorter implementation time can hide slower end-to-end delivery and worse quality.

### Caching Without Identity

Caches that omit source version, permissions, or configuration return stale or unauthorized state.

### Optimizing A Demo

A small successful task does not establish capacity across real task distributions, concurrent users, and review constraints.

## Relationship To Other Documents

- `governed-agentic-development.md` defines the control plane, worker, evidence, and acceptance architecture being optimized.
- `agent-workflow-evaluation.md` defines comparative experiments, graders, retained suites, and autonomy evidence.
- `agent-context-systems.md` defines context compilation, retrieval, caching risks, and memory.
- `ai-assisted-code-quality-control.md` defines correction, review, and acceptance quality.
- `ai-engineering-metrics.md` defines organizational delivery, quality, burden, and cost measures.
- `ai-harness-engineering.md` defines tools, skills, guardrails, control loops, and continuous improvement.

## Current Evidence Basis

The author-specific basis includes Owain Lewis's [Agentic Software Factory](https://www.youtube.com/watch?v=AbpyqAfxZ8c), [Agent Loops: Complete Guide](https://www.youtube.com/watch?v=RVEaDvh6f5A), [Codex Can Manage Itself](https://www.youtube.com/watch?v=WKG7VF7bL3I), [Claude Code's New Subagent Feature](https://www.youtube.com/watch?v=ZdXsRn9w0VE), [The Full AI Development Workflow](https://www.youtube.com/watch?v=O5ph_x4-L50), and [Build Production AI Agents With LiteLLM](https://www.youtube.com/watch?v=_BuWC220CzA). These demonstrate deterministic polling, bounded work, task slicing, fresh contexts, model portability, worktree isolation, parallelism, review loops, and the token and comprehension costs of orchestration.

[DORA's software-delivery metrics](https://dora.dev/guides/dora-metrics/) and [small-batch guidance](https://dora.dev/capabilities/working-in-small-batches/) support evaluating speed together with stability and working in small coherent batches. `agent-workflow-evaluation.md` provides the broader primary-source basis for repeated trials, harness sensitivity, comparable resource budgets, and accepted-outcome evaluation.

The videos are demonstrations rather than controlled optimization studies. Pipeline changes should therefore be treated as hypotheses and measured on representative workflows rather than copied as universal best practice.

## Summary

Agent pipeline optimization improves the complete flow from eligible intent to accepted outcome. It reduces waiting, rework, unnecessary model work, context waste, conflicts, and human burden while preserving quality, containment, evidence, and recovery.

The central discipline is to optimize the current system constraint and then remeasure. More agents, cheaper calls, larger batches, smaller context, and additional reviewers are only useful when they improve quality-adjusted accepted throughput rather than move cost and failure downstream.

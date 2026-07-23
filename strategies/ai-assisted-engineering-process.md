# AI-Assisted Engineering Process

## Purpose

This document describes a practical process for using AI agents in software development without losing human understanding, accountability, or maintainability.

The process follows one principle:

> AI can make code cheaper to produce, but it does not make code free to maintain.

AI-assisted engineering should optimize for better thinking, faster exploration, and safer implementation, not maximum code output.

## Core Roles

### Human Engineer

The human engineer remains accountable for:

- problem framing
- product intent
- architecture and boundaries
- risk decisions
- code review
- acceptance criteria
- maintainability
- final approval

### AI Agent

The AI agent can act as:

- a planning partner
- a codebase exploration assistant
- a pair programmer
- an implementation assistant
- a test and review assistant
- a refactoring assistant
- a solution-space explorer

The agent may write code, but it should not own design or acceptance decisions.

## Default Workflow

### 1. Understand the problem before coding

Clarify the task with the agent before asking it to implement.

Establish:

- what problem is being solved
- why the change is needed
- which files, modules, or services are relevant
- what should not change
- which interfaces or boundaries matter
- what tests or verification are needed
- what risks or edge cases exist
- what context the agent needs, and what context would mislead it

The goal is enough shared context to make the implementation request constrained and specific.

Avoid vague prompts such as:

```text
Implement this feature.
Write tests.
Fix this bug.
```

Prefer prompts that define intent, scope, constraints, and verification.

### 2. Use the agent as a planning partner

Before implementation, use the agent to reason through the approach.

Useful planning activities:

- explain the relevant code path
- propose implementation options
- compare tradeoffs
- identify affected modules
- define interfaces and boundaries
- propose test cases
- identify rollback or migration concerns

The engineer decides which plan to follow. The agent suggests; the engineer chooses.

### 3. Give the agent a constrained implementation task

Once the plan is clear, ask the agent to implement only the agreed scope.

A good implementation instruction includes:

- target files or modules
- expected behavior
- interfaces to preserve or introduce
- tests to add or update
- unrelated changes to avoid
- expected verification commands

Precise, coherent context gives the agent guardrails. Avoid mixing stale, irrelevant, or conflicting instructions into the same task.

### 4. Review the diff like human-authored code

After the agent finishes, review the changes as if they came from another developer.

Review for:

- correctness
- unintended scope expansion
- interface quality
- test coverage
- maintainability
- security and data handling
- repository conventions
- whether humans can understand the code

If the code is core, risky, or hard to reverse, review every meaningful change. Low-risk prototypes may allow lighter review.

### 5. Iterate with specific feedback

Give feedback on concrete lines, functions, modules, tests, or behaviors.

Good feedback:

```text
Keep the public API unchanged and move only the parsing logic into a helper.
Add a test for the empty input case.
Do not modify the persistence layer in this change.
This interface leaks transport concerns; propose two alternatives.
```

Avoid broad feedback such as:

```text
Make it better.
Clean this up.
Try again.
```

Continue until the engineer can explain and defend the final change.

### 6. Verify before accepting

Do not accept agent output without evidence.

Verification may include:

- tests
- type checks
- linting
- manual testing
- log inspection
- generated examples
- screenshots or traces
- review by another engineer for high-risk changes

The proof should match the risk of the change.

## Work Modes

### Production Feature or Bug Fix

Use the full workflow:

1. understand
2. plan
3. constrain
4. implement
5. review
6. verify

Use this mode for code that users, operations, or other engineers depend on.

### Solution Exploration

Use agents to explore multiple approaches quickly.

The goal is learning, not necessarily reusing generated code.

Possible pattern:

1. ask agents to try different designs
2. inspect the results
3. compare tradeoffs
4. keep the learning
5. discard weak implementations
6. implement the chosen approach deliberately

Agents can help explore solution space faster than hand-coding every option.

### Prototype or Vibe-Coded Experiment

For low-risk experiments, it can be acceptable to let the agent move quickly with minimal structure.

Use this mode only when:

- the code is not production-critical
- failure is cheap
- manual testing is enough
- long-term maintenance is not yet required

If the prototype becomes valuable, treat it as technical debt and refactor before building on it heavily.

### Refactoring AI-Generated Code

When a prototype or messy agent-generated implementation becomes important, refactor it deliberately.

Recommended process:

1. Read the code or ask the agent to explain specific areas.
2. Identify responsibilities, boundaries, and hidden coupling.
3. Ask the agent for module or interface options.
4. Write or generate small examples to test the interface.
5. Choose the boundary manually.
6. Ask the agent to perform one narrow refactoring step.
7. Review and verify before continuing.

Refactor in small slices. Do not ask the agent to clean up a large messy system in one pass.

## Anti-Patterns

### Treating code as free

Generated code still has to be read, tested, debugged, secured, operated, and maintained.

If a team cannot review generated code, it should not assume it can maintain it.

### Hyper-waterfall specification

A large natural-language spec followed by one big agent implementation can recreate waterfall problems.

Natural language leaves gaps. The agent fills them with guesses based on training data and local context. The result may look complete while hiding poor design decisions.

Use specs to clarify intent and constraints, but keep feedback loops short.

### Army of agents without human synthesis

Parallel agents can help with exploration, but they also create context-switching and review load.

Use parallel agents when outputs can be compared, discarded, or summarized. Avoid splitting work if the split removes context needed for good decisions. Avoid producing code faster than humans can understand it.

### Delegating understanding

Agents can explain code, but the engineer still needs enough understanding to make decisions.

Do not merge code that no human can explain.

### Accepting large unreviewed diffs

Large AI-generated diffs are high risk. Split work into smaller changes with clearer intent and easier verification.

## Practical Prompt Pattern

A useful implementation prompt often follows this shape:

```text
We need to [goal].

Relevant context:
- [module/file/service]
- [current behavior]
- [desired behavior]

Constraints:
- Do not change [boundary].
- Preserve [interface/contract].
- Keep the change limited to [scope].

Plan:
- [step 1]
- [step 2]
- [step 3]

Verification:
- Add/update tests for [cases].
- Run [commands].
- Report what changed and what was verified.
```

## Acceptance Criteria

An AI-assisted change is ready when:

- the engineer understands the final code
- the scope matches the intended change
- important design decisions are explicit
- tests or other proof support the behavior
- the diff is reviewable
- risks and limitations are visible
- humans can maintain the code
- repeated agent mistakes are captured as possible improvements to prompts, instructions, tests, or guardrails

## Summary

The strongest AI-assisted engineering process is not hands-off automation. It is a tight human-agent loop:

1. human frames the problem
2. agent helps explore and plan
3. human chooses the direction
4. agent implements within constraints
5. human reviews and verifies
6. agent iterates on specific feedback

Used this way, AI increases engineering leverage while preserving the human judgment needed to build maintainable software.

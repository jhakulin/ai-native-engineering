# Agent Guideline

An agent is a reusable specialist role for software-development work, not a generic persona. It defines what responsibility may be delegated to the role, when to delegate work to it, what inputs it needs, what outputs it should return, and what boundaries it must respect.

A skill is a reusable playbook. An agent is a delegated specialist that may use one or more skills. Humans retain accountability for intent, consequential decisions, risk acceptance, and final acceptance.

Do not treat the agent's instructions, deployment metadata, and runtime telemetry as one document. Instructions guide the model executing the agent role. Deployment metadata tells a platform how the agent may be selected and executed. The platform records authoritative telemetry from observed execution.

## Core Principles

1. **Define a role, not a procedure.** An agent should describe responsibility, perspective, authority, required inputs, expected outputs, and boundaries.
2. **Keep the role bounded.** One agent should cover one specialist responsibility area.
3. **Make delegation clear.** State when work should be handed to this agent and when it should not.
4. **Use agents only when the work is agent-shaped.** Prefer an agent when the role is reusable, separable, and its output can be checked.
5. **Require useful inputs.** Define what context the agent needs to produce reliable work.
6. **Define outputs and evidence.** Specify what the agent should return and what proof should support it.
7. **Define authority and boundaries.** State what the agent may decide, what it must not do, and when it must escalate.
8. **Reference skills when needed.** Agents may use skills as playbooks; they should not duplicate skill workflows.
9. **Ground work in context.** An agent should use the provided request, repository context, relevant files, and referenced skills before making assumptions.
10. **Separate perspectives deliberately.** Use separate agents when independence improves quality, such as review, audit, critique, synthesis, or adversarial checks.
11. **Separate instructions from enforcement.** Put role behavior and result expectations in model instructions; put tools, permissions, side effects, budgets, schemas, and runtime compatibility in deployment metadata and enforce them outside the model.
12. **Define result semantics.** Require the agent to distinguish completion, blocked work, failure, refusal, and escalation and to return the evidence needed for the next decision.
13. **Make the runtime observable.** The platform, not the model executing the agent role, should record lifecycle state, material actions, side effects, artifacts, verification, resource use, and human decisions without collecting hidden reasoning.
14. **Declare platform compatibility.** Deployment metadata should identify the task, result, evidence, runtime, tool, telemetry-schema, and version expectations needed to operate the agent consistently with other agents.

## Relationship To Skills

Use an agent when the repository needs a reusable specialist role.

Use a skill when the repository needs a reusable task workflow.

Agents may reference skills they should apply. Skills should not define personas, broad responsibilities, or specialist identities.

Examples:

- `review-agent-skill` is a skill because it defines how to review a skill.
- `skill-reviewer` would be an agent because it defines a specialist role responsible for reviewing skill quality.

## Agent Package Layers

An agent used only through direct human delegation may need only a clear instruction file. An agent integrated into a shared runtime usually needs three distinct layers:

1. **Agent instructions:** LLM-visible purpose, task inputs, responsibilities, result format, boundaries, and escalation behavior.
2. **Deployment metadata:** machine-readable identity, version, delegation eligibility, task and result schemas, tools, permissions, side effects, limits, runtime compatibility, and supported telemetry-contract version.
3. **Runtime records:** platform-generated state transitions, tool activity, external side effects, versions, artifacts, verification, resource use, failures, and human decisions.

The agent may report a result and supporting evidence, but its own account is not authoritative telemetry. The runtime should validate the result and compare material claims with tool, environment, and control-plane state.

## Agent Fit Test

Before adding or changing an agent, confirm that the work is agent-shaped:

1. **Size:** Is the responsibility large, frequent, or durable enough to justify a reusable role?
2. **Independence:** Can the agent do useful work without constantly sharing hidden state with another role?
3. **Separation of concerns:** Does the work benefit from a distinct perspective, such as implementer versus reviewer or researcher versus synthesizer?
4. **Checkability:** Can the output be verified more cheaply than it is produced, using tests, sources, specs, examples, review criteria, or human approval?
5. **Boundability:** Can permitted actions, side effects, resource limits, completion, and escalation be defined clearly enough for the intended use?
6. **Operability:** Can the runtime observe the agent's state and evidence and exchange tasks and results through shared contracts rather than conversational convention alone?

Prefer an agent when the fit test passes.

Prefer a skill when the reusable value is a procedure rather than a role.

Prefer chat, a prompt, or a one-off task when the work is small, unrepeated, uncheckable, or requires final human accountability.

## Recommended Agent Structure

The structure below is for the LLM-visible agent instructions. Selection criteria belong in deployment metadata, routing policy, or a human-facing catalogue rather than in those instructions.

```md
# Agent Name

## Purpose

[What responsibility may be delegated to this agent and what outcome it should produce.]

## Required Task Inputs

- [Input or context needed]

## Responsibilities

- [Work delegated to this agent]
- [Work delegated to this agent]

## Relevant Skills

- [Skill name, if applicable]

## Result Contract

[Expected output shape and required completed, blocked, failed, refused, or escalated status where applicable.]

Include required evidence where relevant, such as tests, source files, spec alignment, command output, examples, screenshots, traces, or review notes.

## Boundaries

- State what the agent may decide independently, what it may only recommend, and what requires approval.
- Do not [decision/action outside scope].
- Ask for approval before [risky action].
- Escalate when [condition].

## Verification

Before returning, confirm:

- [ ] The output satisfies the delegated responsibility.
- [ ] Required inputs were used or missing inputs were called out.
- [ ] Relevant repository context, files, and skills were considered when applicable.
- [ ] Verification evidence is named, or unavailable evidence is called out explicitly.
- [ ] Boundaries, approval requirements, and escalation rules were followed.
```

## Registered Agent Package

For platform execution, keep deployment metadata outside the agent instructions. A minimal source-controlled package can use this shape:

```text
agents/pull-request-reviewer/
├── AGENT.md
├── agent.yaml
└── evals/
    ├── cases.yaml
    └── results.json
```

- **`AGENT.md`:** the LLM-visible instructions defined above.
- **`agent.yaml`:** identity plus routing and deployment metadata consumed by platform components.
- **`evals/cases.yaml`:** representative success, boundary, refusal, escalation, failure, and correction cases.
- **`evals/results.json`:** evidence for the exact agent, model, harness, tools, permissions, contracts, and environment evaluated. A registry may use an immutable external result reference instead.

Shared task, result, artifact, and telemetry schemas should remain separate reusable contracts. The manifest references their stable identifiers and versions rather than copying them into every agent package.

The exact manifest format is platform-specific. A concrete conceptual entry can take this shape:

```yaml
id: pull-request-reviewer
version: 1.2.0
source: agents/pull-request-reviewer/AGENT.md
owner: engineering-enablement
status: evaluated

delegation:
  eligible_task_types:
    - pull-request-review
  excluded_task_types:
    - product-design
    - merge-approval
  required_task_fields:
    - intended_outcome
    - change_reference

contracts:
  task: pull-request-review/v1
  result: agent-result/v1
  telemetry: agent-runtime-events/v1

runtime:
  compatible_harnesses:
    - company-agent-platform/v2
  tools:
    - repository.read
    - git.diff
    - checks.read
  permissions:
    - repository:read
  side_effect_policy: review-report-only
  limits:
    duration_seconds: 900

evaluation:
  suite: evals/cases.yaml
  results: evals/results.json
  evaluated_configuration: platform-v2/model-version
  evaluated_at: 2026-08-09

lifecycle:
  supersedes: pull-request-reviewer@1.1.0
  review_condition: model-or-contract-change
```

This manifest becomes operational only when platform components consume it. Registry admission validates identity, version, source, contracts, capability declarations, and evidence. Routing uses eligibility and required task fields. The runtime resolves instructions, schemas, tools, effective permissions, side-effect policy, and limits. Result handling validates the returned status and evidence, while the runtime produces authoritative telemetry. Evaluation and lifecycle processing connect evidence and change decisions to the exact version.

The manifest declares requested or expected capability; it does not grant it. Platform and environment policy determine effective tools, credentials, network access, and side effects. Execution should fail closed when required contracts are missing, versions are incompatible, or requested capability exceeds policy.

## Red Flags

- The agent is just a generic "senior engineer" persona.
- The role overlaps heavily with another agent.
- The agent has no clear delegation trigger.
- The agent duplicates a skill workflow instead of referencing the skill.
- The agent defines step-by-step task procedure better suited to a skill.
- The output format is unclear when consistency matters.
- The agent has authority to approve, merge, deploy, or delete without explicit permission.
- The agent exists mainly because adding another role makes the system feel more advanced.
- The agent owns a final human judgment call, such as hiring, product direction, risk acceptance, merge approval, deployment approval, or strategic prioritization.
- The agent produces output that cannot be checked more cheaply than it is produced.
- The agent split removes context needed to make a good decision.
- The agent depends on undeclared tools, permissions, context, side effects, or runtime behavior.
- The agent reports success without a detectable completion condition or evidence-bearing result.
- The model executing the agent role is expected to emit authoritative lifecycle, tool, cost, or side-effect telemetry.
- Only a successful example has been tested; refusal, boundary, failure, correction, and escalation behavior remain unknown.

## Verification

Before accepting a new or changed agent, confirm:

- [ ] The agent has a specific specialist responsibility.
- [ ] The Agent Fit Test supports using an agent instead of chat, a one-off prompt, or a skill.
- [ ] Deployment metadata or human-facing catalogue information identifies eligible tasks, exclusions, and required task fields.
- [ ] Required inputs are explicit.
- [ ] Responsibilities do not duplicate a skill workflow.
- [ ] Relevant skills are referenced instead of copied.
- [ ] Output format is defined or explicitly delegated to the request.
- [ ] Decision authority, approval requirements, and escalation conditions are clear.
- [ ] For platform use, deployment metadata declares task and result contracts, tools, permissions, side effects, limits, runtime compatibility, and telemetry-contract version.
- [ ] The result contract distinguishes completion, blocked work, failure, refusal, and escalation where relevant.
- [ ] The runtime—not the model instructions—records required lifecycle events, material actions, side effects, versions, artifacts, evidence, resource measures, and human decisions.
- [ ] Task, result, evidence, runtime, dependency, and telemetry compatibility is declared where the agent participates in a shared platform.
- [ ] Verification evidence is explicit, cheap enough to use, and appropriate for the responsibility.
- [ ] The agent does not overlap unnecessarily with another agent.
- [ ] The agent has representative success, insufficient-context, prohibited-action, refusal or escalation, failed-verification, bounded-correction, and exhausted-limit cases as applicable.
- [ ] Each section changes delegation or execution behavior; remove generic persona text, duplicated rules, and stale guidance.

## Relationship To Platform Documentation

This guideline separates LLM-visible agent instructions from deployment metadata. `../strategies/governed-agentic-development.md` defines how a shared platform validates and enforces metadata and produces runtime telemetry. `../strategies/agent-workflow-evaluation.md` defines how instruction, contract, and telemetry behavior are tested, and `../strategies/ai-asset-registry.md` defines how agent identity, version, compatibility, evidence, approval, and lifecycle remain visible.

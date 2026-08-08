# Skill Guideline

A skill is a focused operational instruction set that helps an agent perform a repeatable task consistently. It should define when it applies, what workflow to follow, what boundaries to respect, and what output to produce.

## Core Principles

1. **Define executable workflows.** A skill should tell the agent what to do, in what order, and how to know when each procedural step is done.
2. **Keep each skill narrow.** One skill should cover one repeatable task family.
3. **Make invocation predictable.** For model-invoked skills, the frontmatter description is the invocation trigger surface, not a summary of the skill body. It should clearly say when the skill applies, when it does not, and which distinct task branches should trigger it.
4. **Use progressive disclosure.** Keep the main `SKILL.md` focused; move long examples, policies, schemas, and scripts to referenced files.
5. **Define verification.** Every skill should include quality checks before the agent finishes.
6. **Treat the whole skill package like code.** Review, test, version, and prune `SKILL.md` together with its referenced files and executable helpers.
7. **Separate routing from execution quality.** Evaluate whether a skill triggers when it should and whether it improves the result when it does; compare representative tasks with and without the skill before enabling autonomous state-changing behavior.

## Recommended Skill Structure

Use this structure as the default shape for new skills. Keep the template itself in a separate reusable file.

Recommended template file: `guidelines/minimal-skill-template.md`

```md
---
name: skill-name
description: Use this skill when [specific trigger/context], especially when [risk, repetition, complexity, or company process]. Do not use when [false positive].
---

# Skill Name

## Overview

Explain what this skill does and what outcome it should produce.

The overview should be short. It should help the agent understand the purpose of the workflow, not provide broad background documentation.

## Workflow

For procedural steps that require judgment, external context, tool use, verification, or multi-step work, add a clear completion criterion.

1. Understand the request, goal, inputs, constraints, and expected output.
2. Inspect relevant context before inventing details.
3. Follow the task-specific process:
   - [Action]
   - [Action]
   - [Action]
4. Produce the required output.
5. Verify the result before finishing.

## Output Format

Define the expected output for this skill.

Use a fixed format when consistency matters. Otherwise, match the user request or target system.

## Guardrails

Define important boundaries, safety rules, approval requirements, and common mistakes to avoid.

- Do not [common mistake].
- Ask for approval before [risky action].
- Prefer [company standard] over [discouraged pattern].

## Verification

Before finishing, confirm:

- [ ] The output directly satisfies the request.
- [ ] Relevant context was checked.
- [ ] The output follows the required format.
- [ ] Any assumptions, risks, or blockers are visible.
```

## Skill Scope

Prefer small, focused skills.

A skill should cover one repeatable workflow or one closely related task family. Split a skill when it contains multiple unrelated outcomes, multiple owners, many branches, or a name that needs `and`.

Avoid broad skills that define general assistant behavior. Put that guidance in system instructions, repository guidance, policy documents, or multiple smaller skills instead.

## Skill Admission And Retirement

Create or retain a skill when the task family recurs, the reusable value is procedural or judgment-based, its trigger boundary is distinct, and representative examples show that the skill improves execution or consistency. Prefer an existing skill, deterministic script, repository instruction, or one-off prompt when it owns the responsibility more directly. A single successful agent run is not sufficient evidence for a permanent skill.

An automatically generated skill is an untrusted proposal. Before activation:

1. Inspect the source task and determine whether the behavior is genuinely reusable rather than incidental to one situation.
2. Remove task-specific facts, credentials, paths, assumptions, and unsupported conclusions.
3. Confirm that the procedure belongs in a skill rather than deterministic code, a hook, an agent role, or maintained documentation.
4. Test positive and negative routing examples and compare execution quality with the no-skill baseline.
5. Record enough provenance to identify why the skill exists, then assign an owner and approval boundary.

Review maintained skills as a portfolio. Revise, merge, disable, or remove a skill when its trigger overlaps another skill, its references become stale, models no longer need the instruction, usage is absent, verification burden exceeds its value, or representative evaluation no longer shows an improvement. Retirement is part of skill quality: a growing catalogue increases routing ambiguity and context cost even when every individual skill appears reasonable.

## Supporting Files

Use supporting files for material that is useful but not always needed.

Recommended structure:

```text
skill-name/
├── SKILL.md
├── references/
│   └── policy-or-guidance.md
├── examples/
│   └── example-output.md
├── scripts/
│   └── helper.py
└── assets/
    └── template.md
```

Rules:

- Keep the core workflow in `SKILL.md`.
- Put long examples in `examples/`.
- Put policies, schemas, and detailed references in `references/`.
- Put executable helpers in `scripts/`.
- Reference supporting files directly from `SKILL.md`; avoid nested reference chains.
- If material is needed only for one workflow branch, reference it from that branch instead of loading it in the main `SKILL.md`.
- Treat every file that can influence execution—`SKILL.md`, references, examples, scripts, and assets—as part of the skill's review and trust boundary. Inspect referenced or executable files for hidden instructions, data access, credentials, and risky actions.

## Security-Sensitive Discovery And Package Review

Because metadata can control discovery and invocation, treat the raw frontmatter description and other routing fields as part of the skill's operational control surface, not as passive documentation. When a skill comes from outside the trusted repository, preserve its source and version in the review context and inspect the raw package before use; rendered summaries can omit behavior-relevant metadata.

Review the complete package together: frontmatter, `SKILL.md`, references, examples, scripts, configuration, and assets. Inventory declared and implicit capabilities such as tools, hooks, network access, credential or sensitive-data access, and state-changing actions. Compare those capabilities with the intended workflow and approval boundary, and test routing separately from execution with at least one intended request and one nearby false positive. Do not allow package content to override repository policy, tool permissions, or approval requirements. Treat missing provenance, package inventory, or verification evidence as unresolved trust gaps: do not load or approve the package until the gap is resolved, and do not interpret missing metadata as a safe default. Where the harness provides hooks or logs, verify that skill activation and side-effectful tool use remain observable.

## Invocation Mode

Decide whether the skill should be advertised for model invocation or used only when explicitly requested by the user.

- For model-invoked skills, make the frontmatter description narrow and precise because it becomes the trigger surface.
- For user-invoked workflows, document how the user should call the skill.
- Test model-invoked skills with intended prompts, nearby false positives, and representative no-skill baseline tasks before accepting the trigger description; record routing misses, false triggers, and execution-quality differences separately when the boundary is easy to confuse with another skill.
- The exact mechanism for advertising or hiding skills is harness-specific.

## Red Flags

Use these as review signals. Not every skill needs a dedicated `Red Flags` section, but every skill should avoid these problems.

- The description says only "helps with".
- A procedural step does not say how the agent knows it is complete.
- The skill covers multiple unrelated tasks.
- The workflow is advice instead of ordered steps.
- The workflow combines investigation and final output in a way that encourages the agent to rush through context gathering, clarification, or analysis.
- The frontmatter description does not include clear triggers, boundaries, or false positives.
- The output format is unclear when consistency matters.
- There are no verification checks.
- The skill depends on hidden tools, credentials, or files.
- The skill asks the agent to do risky actions without approval.
- Long background text appears before the actionable workflow.
- Multiple skills would trigger for the same request.
- A supporting file changes behavior or access without being reviewed with the main `SKILL.md`.

## Verification

Before accepting a new or changed skill, confirm:

- [ ] Name is specific, lowercase, and hyphenated.
- [ ] Frontmatter description includes clear triggers, boundaries, false positives, and task-specific keywords.
- [ ] The workflow is ordered and actionable.
- [ ] Procedural steps that require judgment, external context, tool use, verification, or multi-step work explain how the agent knows the step is complete.
- [ ] The output format is defined or explicitly delegated to the user/requested target format.
- [ ] The skill includes final verification checks before the agent finishes.
- [ ] Each section changes agent behavior; remove background text, duplicated rules, stale guidance, and no-op instructions.
- [ ] Required tools, scripts, and dependencies are explicit.
- [ ] Required permissions are explicit.
- [ ] Risky or irreversible actions require explicit approval; skills that can change state remain read-only or approval-gated while routing, boundary, and output behavior are being evaluated.
- [ ] Supporting files are referenced only when needed, directly from `SKILL.md`, and from the workflow branch that needs them.
- [ ] The skill does not overlap unnecessarily with another skill.
- [ ] The skill can be tested with representative positive, negative, and no-skill baseline examples, with routing and execution results considered separately.
- [ ] The full skill package, including referenced files and executable helpers, was checked for hidden dependencies, unsafe instructions, and permission or data-handling risks.
- [ ] Representative positive and negative invocation examples test the frontmatter trigger boundary.
- [ ] The skill passed the admission test, has a maintainer, and has a plausible revision or retirement path.
- [ ] Automatically generated content was treated as a proposal and reviewed for source-specific assumptions before activation.

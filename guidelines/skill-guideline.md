# Skill Guideline

A skill is a focused operational instruction set that helps an agent perform a repeatable task consistently. It should define when it applies, what workflow to follow, what boundaries to respect, and what output to produce.

## Core Principles

1. **Define executable workflows.** A skill should tell the agent what to do, in what order, and how to know when each procedural step is done.
2. **Keep each skill narrow.** One skill should cover one repeatable task family.
3. **Make invocation predictable.** For model-invoked skills, the frontmatter description is the invocation trigger surface, not a summary of the skill body. It should clearly say when the skill applies, when it does not, and which distinct task branches should trigger it.
4. **Use progressive disclosure.** Keep the main `SKILL.md` focused; move long examples, policies, schemas, and scripts to referenced files.
5. **Define verification.** Every skill should include quality checks before the agent finishes.
6. **Treat the whole skill package like code.** Review, test, version, and prune `SKILL.md` together with its referenced files and executable helpers.

## Recommended Skill Structure

Use this structure as the default shape for new skills. Keep the template itself in a separate reusable file.

Recommended template file: `templates/minimal-skill-template.md`

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

## Invocation Mode

Decide whether the skill should be advertised for model invocation or used only when explicitly requested by the user.

- For model-invoked skills, make the frontmatter description narrow and precise because it becomes the trigger surface.
- For user-invoked workflows, document how the user should call the skill.
- Test model-invoked skills with both intended prompts and nearby false positives before accepting the trigger description; record the boundary when it is easy to confuse with another skill.
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
- [ ] Risky or irreversible actions require explicit approval.
- [ ] Supporting files are referenced only when needed, directly from `SKILL.md`, and from the workflow branch that needs them.
- [ ] The skill does not overlap unnecessarily with another skill.
- [ ] The skill can be tested with representative examples.
- [ ] The full skill package, including referenced files and executable helpers, was checked for hidden dependencies, unsafe instructions, and permission or data-handling risks.
- [ ] Representative positive and negative invocation examples test the frontmatter trigger boundary.

---
name: author-agent-skill
description: Create or improve reusable agent skills in this repository. Use when a developer wants to turn a repeatable software-development workflow into a skill, revise an existing SKILL.md, define skill triggers, or decide whether a workflow deserves a reusable skill. Do not use for agent persona or role definitions unless the artifact is specifically a skill.
---

# Author Agent Skill

## Overview

Create agent skills that help agents perform a repeatable software-development workflow reliably. Author skills conservatively: first build shared understanding with the developer, then write the smallest useful skill using `guidelines/skill-guideline.md` as the source of truth.

## Workflow

1. Read `guidelines/skill-guideline.md` before creating or changing a skill.
2. Understand the developer's intent before writing:
   - what repeatable task the skill should support
   - who or what will use the skill
   - when the skill should trigger
   - when the skill should not trigger
   - what inputs the agent can expect
   - what output the agent should produce
   - what risks, approvals, tools, files, or constraints matter
3. Ask focused follow-up questions when the intended workflow, trigger, output, or boundary is unclear. Continue until there is enough shared understanding to draft a skill without inventing material requirements.
4. Decide whether the request belongs in a skill:
   - Create or update a skill when the workflow is repeatable, operational, and useful across future tasks.
   - Do not create a skill for generic engineering advice, one-off preferences, broad assistant behavior, or agent role/persona definition.
5. Propose the skill before editing when the developer asks for a proposal or when meaningful scope decisions remain. Include the intended skill name, trigger, workflow outline, output, guardrails, and any open questions.
6. When approved to implement, create or update only the needed `skills/<name>/SKILL.md` content. Keep source-of-truth criteria in `guidelines/skill-guideline.md`; reference the guideline instead of duplicating it.
7. Add supporting files only when the skill cannot stay clear and concise in `SKILL.md`.
8. Validate the repository with `node scripts/validate-repo.js`.

## Output Format

When proposing a skill, provide:

- `Name`
- `Trigger`
- `Workflow`
- `Output`
- `Guardrails`
- `Open questions`, if any

When implementing a skill, produce or update the relevant `skills/<name>/SKILL.md` file and report the validation result.

## Guardrails

- Do not invent the developer's process when follow-up questions are needed.
- Do not add repository folders, tool integrations, generated metadata, or supporting files unless explicitly needed and approved.
- Do not duplicate the full skill guideline inside a skill.
- Prefer improving an existing skill over adding an overlapping new skill.
- Keep the skill narrow enough that its name does not need `and`.

## Verification

Before finishing, confirm:

- [ ] `guidelines/skill-guideline.md` was used as the source of truth.
- [ ] The skill has a clear trigger and false-positive boundary.
- [ ] The workflow is ordered, operational, and based on understood developer intent.
- [ ] The output format and guardrails are explicit.
- [ ] No unnecessary structure or duplicated guideline content was added.
- [ ] `node scripts/validate-repo.js` passes after file changes.

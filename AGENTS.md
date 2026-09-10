# Agent Instructions

Use this repository as the canonical source for AI harness guidelines, reusable software-development agent skills, agent descriptions, and harness strategy notes.

## Operating Rules

- Read `guidelines/skill-guideline.md` before creating or reviewing skills.
- Read `guidelines/agent-guideline.md` before creating or reviewing agents.
- Keep changes minimal and grounded in an explicit user need.
- Before adding new folders, integrations, adapters, commands, hooks, or generated metadata, propose the exact structure and wait for approval.
- Do not copy, mirror, or bulk-import external repositories unless explicitly requested.
- Prefer improving one existing skill over adding overlapping skills.
- Keep each source of truth in one place; reference guidelines instead of duplicating their criteria in skills or docs.

## Collaboration Rules

- If the user asks for a proposal, do not create or edit files until they approve it.
- If the user asks to implement an approved proposal, make only the approved change.
- When renaming or adding repository concepts, keep names plain and neutral.
- Validate changes with `node scripts/validate-repo.js` before committing.
- Commit and push only after the change is validated and scoped to the user request.

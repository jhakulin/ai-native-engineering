# Create the TDD Skill

Create exactly one file at `skills/tdd/SKILL.md` with the content below.

The workflow is adapted from Mateusz Jankowski's
[How Agentic Coding Made Test-Driven Development Great Again](https://www.linkedin.com/pulse/how-agentic-coding-made-test-driven-development-great-jankowski-dsqye/).

```md
---
name: tdd
description: Use this skill when implementing a feature, fixing a bug, or changing observable production behavior with automated tests available. Do not use for documentation-only work, investigation, test review without implementation, or when the user requests a different development sequence.
---

# TDD

## Purpose

Use tests to define the expected behavior before writing production code. Keep
understanding, planning, testing, and implementation separate so each stage can
correct misunderstandings before they spread.

## Workflow

### 1. Understand the task

Before editing code:

- Read the requirements and repository instructions.
- Inspect the relevant implementation and existing tests.
- Identify established patterns, constraints, and affected behavior.
- Surface missing or conflicting information.

Do not start implementation until the expected behavior is clear.

### 2. Plan

Write a short plan covering:

- what must change;
- which code is affected;
- which behavior needs tests; and
- material assumptions or trade-offs.

Share the plan before implementation. Wait for approval when the user requests
a checkpoint or a material decision exceeds the approved scope.

### 3. Write tests first

Add or update tests that describe the expected behavior.

- Cover the main case and relevant boundaries.
- Reproduce the failure when fixing a bug.
- Prefer observable behavior over implementation details.
- Run the tests before changing production code.
- Confirm new tests fail for the expected reason.

If a new test already passes, determine whether the behavior already exists or
the test does not prove the requirement.

### 4. Implement

Write the smallest production change that satisfies the tested behavior and
fits the repository's architecture and conventions.

### 5. Iterate

After each meaningful change:

1. Run the focused tests.
2. Diagnose failures.
3. Adjust the implementation.
4. Run the tests again.

Continue until the focused tests pass. Do not weaken, remove, or rewrite a
valid test merely to make the implementation pass. If a test is wrong, explain
the conflict with the requirement before changing it.

### 6. Verify

Before finishing:

- Run the focused tests and practical broader checks.
- Check for regressions.
- Review the final diff.
- Confirm the implementation matches the original request, not only the tests.

If a meaningful test-first cycle was impossible, state why and describe the
alternative verification used.

## Completion

Report:

- what changed;
- which tests were added or updated;
- which commands ran and their results; and
- remaining assumptions, skipped checks, or limitations.
```

After creating the file:

1. Review the complete skill using `skills/review-agent-skill/SKILL.md` and
   address material findings.
2. Run `node scripts/validate-repo.js`.
3. Run `git diff --check` and inspect `git diff -- skills/tdd/SKILL.md`.
4. Do not commit or push unless the user separately requests it.

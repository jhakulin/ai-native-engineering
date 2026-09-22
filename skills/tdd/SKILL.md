---
name: tdd
description: Use this skill when implementing a feature, fixing a reproducible bug, or changing observable production behavior when practical automated tests are available. Do not use for documentation-only work, investigation without implementation, test review without production changes, exploratory spikes, work without a practical automated test path, or when the user requests a different development sequence.
---

# TDD

## Overview

Use tests to define expected behavior before changing production code. Keep
understanding, planning, testing, implementation, and verification distinct so
incorrect assumptions are caught before they spread.

## Workflow

1. Understand the task before editing.
   - Read the request and repository instructions.
   - Inspect the relevant implementation and existing tests.
   - Identify the observable behavior, constraints, established patterns, and
     likely impact boundary.
   - Surface missing or conflicting information that could change the work.
   - Completion criterion: the expected behavior and a practical way to test it
     are clear.

2. Confirm that a meaningful test-first cycle is practical.
   - Identify the focused test command and required test environment.
   - If no suitable harness exists, required infrastructure is unavailable, or
     a meaningful automated failure cannot be demonstrated, explain the blocker
     and agree on an alternative before changing production code.
   - Completion criterion: the test can exercise the requested behavior and can
     fail independently of unrelated baseline failures.

3. Plan the smallest behavior change.
   - State what behavior changes, which code is likely affected, and which main,
     boundary, or failure cases need tests.
   - Keep the plan brief. Do not create an approval checkpoint unless the user
     requested one or a material decision exceeds the authorized scope.
   - Completion criterion: the planned tests prove the request without depending
     unnecessarily on implementation details.

4. Establish red.
   - Add or update tests that describe the expected observable behavior.
   - For a bug fix, reproduce the reported failure.
   - Run the focused tests before changing production code.
   - Confirm that the new or changed test fails for the expected missing or
     incorrect behavior, not because of syntax, setup, infrastructure, or an
     unrelated existing failure.
   - If the test already passes, do not manufacture a failure. Determine whether
     the behavior already exists, the test does not prove the requirement, or a
     different unmet case must be specified; stop or clarify when no genuine red
     case remains.
   - Completion criterion: a relevant test fails for the intended reason, or the
     absence of a genuine red case is reported before production code changes.

5. Implement the smallest production change.
   - Change only what is needed to satisfy the tested behavior while following
     repository architecture and conventions.
   - Avoid unrelated cleanup or speculative abstractions.
   - Completion criterion: the focused test passes without weakening its claim.

6. Iterate to green.
   - After each meaningful change, run the focused tests, diagnose failures, and
     adjust the implementation.
   - Do not weaken, remove, or rewrite a valid test merely to make the change
     pass. If a test conflicts with the requirement, explain the conflict before
     changing it.
   - Completion criterion: the focused tests pass for the intended behavior.

7. Verify the completed change.
   - Run the focused tests and practical broader checks.
   - Review the final diff for regressions and scope drift.
   - Confirm the implementation satisfies the request, not only the assertions.
   - If the agreed test-first cycle became impossible, state why and report the
     alternative verification used.

## Output Format

Report:

- the observable behavior implemented;
- tests added or updated;
- the failing test observed before production changes;
- verification commands and results; and
- remaining assumptions, skipped checks, or limitations.

## Guardrails

- Do not change production behavior before demonstrating the relevant failing
  test unless the user explicitly approves a documented deviation.
- Do not weaken valid tests to obtain a passing result.
- Do not use implementation-detail assertions when observable behavior can prove
  the requirement.
- Do not expand the change beyond the requested behavior.
- Follow repository permissions, approval requirements, and verification rules.
- Treat test execution and code edits as state-changing actions authorized only
  within the user's requested implementation scope.

## Verification

Before finishing, confirm:

- [ ] Repository instructions and relevant existing tests were inspected.
- [ ] The test-first cycle was practical or its limitation was agreed explicitly.
- [ ] The new or changed test failed for the expected reason before production changes.
- [ ] The smallest appropriate production change made the focused test pass.
- [ ] Practical broader checks passed or skipped checks are visible.
- [ ] The final diff matches the requested behavior without scope drift.
- [ ] The report includes red, green, verification, assumptions, and limitations.

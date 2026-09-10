---
description: Review pull requests that change agent skills or the skill guideline.
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    paths:
      - "skills/**"
      - "guidelines/skill-guideline.md"
      - "guidelines/minimal-skill-template.md"
permissions:
  contents: read
  issues: read
  pull-requests: read
engine: codex
checkout:
  fetch-depth: 0
tools:
  bash: ["git:*", "gh:*", "node:*", "cat", "ls", "sed", "awk", "printf", "pwd", "rg", "find", "head", "tail"]
  github:
    mode: gh-proxy
    toolsets: [repos, issues, pull_requests]
safe-outputs:
  add-comment:
---

# Review Agent Skill Changes

## Workflow

Review skill-related changes in this pull request using `skills/review-agent-skill/SKILL.md` as the canonical review procedure.

1. Compute review scope by running:

   `PR_BASE_SHA=${{ github.event.pull_request.base.sha }} PR_HEAD_SHA=${{ github.event.pull_request.head.sha }} node scripts/review-skill-pr-scope.js`

   Use the script output as the source of truth for `Changed files`, `Reviewed files`, `Skipped files`, and `Diff available`. Copy those four labeled blocks verbatim into the `Reviewed` section. Do not render them as comma-separated values, placeholders, or interpolated variables. Do not recompute or reinterpret these lists. Do not use `git status --short` to determine PR changed files.

2. Use the pull request diff as the artifact under review.
   - If `guidelines/skill-guideline.md` is changed, use the changed guideline from the pull request as the review source of truth.
   - Read context files needed to understand the review, such as `AGENTS.md`, `guidelines/skill-guideline.md`, `skills/review-agent-skill/SKILL.md`, or related skills.

3. Review only changed in-scope skill artifacts:
   - changed files under `skills/<skill-name>/`, including `SKILL.md`, supporting references, examples, scripts, assets, requirements, and other skill-owned files
   - `guidelines/skill-guideline.md`
   - `guidelines/minimal-skill-template.md`
   - repository discovery paths only when they affect skill invocation or discoverability

4. Treat skipped files as out of scope.
   - Do not review workflow, CI, lock, repository configuration, documentation, or application files as skill artifacts.
   - Do not read skipped files unless needed to diagnose a direct skill invocation or discovery problem.
   - Never read generated `.lock.yml` files during normal skill review.

5. Do not use full repository validation or context-manifest freshness as a prerequisite for this PR review. The context manifest is maintained on `main` and may legitimately be stale on a pull-request branch that adds or changes Markdown files. If such a check is run, report the mismatch as a repository automation limitation, not as a skill finding.

6. When reviewed files include scripts, code, configuration, requirements, or executable helpers, review them as part of the skill implementation.
   - Check that documented commands can work as described.
   - Check that required inputs and dependencies are explicit.
   - Check that errors are handled usefully.
   - Check that outputs support the skill workflow.
   - Check that the implementation stays simple and maintainable.
   - Report material issues such as broken commands, missing dependencies, unsafe defaults, unclear interfaces, unnecessary complexity, poor error handling, or code that does not support the documented skill behavior.

7. Include evidence in the review report.
   - Report each command or check with an explicit result: `passed`, `failed`, or `not run`.
   - Include the reason for any failure or skipped check.
   - Do not return `Ready` unless the changed skill-related files and relevant guidelines were read, reviewed scripts/code were inspected, and the report includes the evidence used to support the judgment.

8. Post the complete review as a concise pull request comment using the configured `add-comment` safe output.
   - If the scope script reports one or more reviewed files, you must call `add-comment` with the full review body, even when the judgment is `Ready` and there are no findings.
   - Do not call `noop` after reviewing in-scope files. A final assistant message alone is not a reported review.
   - Call `noop` only when the scope script reports no reviewed skill-related files, and include a short explanation.

## Output

Use this output format:

## Reviewed

- Changed files: ...
- Reviewed files: ...
- Context files read: ...
- Skipped files: ...
- Diff available: yes/no
- Guidelines used: ...
- Limitations: ...

Then add:

## Assessment

[A concrete sentence explaining what kind of PR this is, what it changes or improves, and why that supports the judgment.]

Then continue with the judgment, findings, evidence, and open questions format defined in `skills/review-agent-skill/SKILL.md`. Do not duplicate evidence in the `Reviewed` section. Keep `Findings` for issue findings. For ready reviews with no issue findings, write `No issue findings.` under `Findings` and put the concrete rationale in `Assessment`, not in a positive finding.

# Change Review: AI-Assisted Review and Fix Workflow

Status: Proposed. Implementation requires separate approval. After implementation,
retain only durable workflow requirements here or supersede this plan with the
implemented skill, agent instructions, tests, and user documentation.

## Purpose

Create a reusable change-review workflow for Claude Code, Codex, and compatible
coding-agent harnesses. Independent specialists review working-tree, staged,
commit, branch, or pull-request changes for material defects. Engineers can run
a review alone or enable a bounded review-and-fix loop.

The implementation session owns the change and normally applies accepted fixes
because it has the richest context. Review agents remain read-only and
independently verify the result.

## Initial Scope

Build four focused reviewer agents:

1. **Logic reviewer**
   - Correctness and control-flow errors
   - Broken contracts and state transitions
   - Boundary and error-handling problems
   - Concurrency and data-consistency defects

2. **Security reviewer**
   - Authentication and authorization
   - Injection and unsafe input handling
   - Sensitive-data and secret exposure
   - Trust-boundary and dependency risks

3. **Performance reviewer**
   - Algorithmic regressions
   - Excessive queries, I/O, or allocations
   - Unbounded work and resource exhaustion
   - Contention and scalability problems

4. **Test reviewer**
   - Missing regression, boundary, and failure cases
   - Tests that repeat implementation assumptions
   - Excessive mocking
   - Missing integration or end-to-end evidence

Reviewers inspect the complete relevant diff and surrounding source. They
report only evidence-backed findings and do not edit files or approve merges.

## Command Interface

Expose one canonical `change-review` skill through each harness's native
syntax: `/change-review [options]` in Claude Code and `$change-review [options]`
in Codex.

Examples:

```text
--fix
--fix --max-iterations 2
--agents logic,security
--scope branch --base main
--scope pr --pr 123
--fix --pause-after-review
```

Initial defaults:

```text
mode: review-only
agents: logic,security,performance,test
scope: auto
base: main
max-iterations: 2
pause-after-review: false
```

`review-only` is the default. `--fix` authorizes the implementation session to
address supported findings. `--pause-after-review` requires engineer approval
before changes are made.

### Review scope

Supported scopes are:

```text
working-tree | staged | commit | branch | pr
```

Explicit `--scope` takes precedence, and `--pr` selects pull-request scope.
Otherwise, the skill reviews the current branch against its base when possible,
then falls back to staged and unstaged changes. Record the selected scope and
resolved Git references in the run context.

## Workflow

### Review only

```text
implementation session
  -> capture implementation context and diff
  -> launch selected read-only reviewers
  -> collect evidence-backed inline findings
  -> return review report
  -> stop
```

### Optional review-and-fix loop

```text
implementation session
  -> launch selected reviewers
  -> evaluate findings
  -> fix accepted findings
  -> run relevant deterministic checks
  -> launch fresh reviewers
  -> repeat until clean, escalated, or iteration limit reached
```

The implementation session normally makes the fixes. It may delegate a bounded
correction when it supplies the intended outcome, acceptance criteria, relevant
design decisions, finding evidence, allowed scope, and required verification.
Write-capable subagents should not modify the same working tree concurrently.

Each later review must:

- verify the disposition of earlier findings; and
- inspect the current complete diff for new defects introduced by corrections.

The implementation session may dispute a finding with recorded evidence. A
disputed blocking finding remains unresolved until a fresh reviewer rejects it,
deterministic evidence resolves it, or an engineer decides it.

## Finding Standard

Each finding must contain:

- Stable finding ID
- Reviewer and classification
- Severity based on impact and likelihood
- Exact file and line when available
- Triggering condition
- Expected consequence
- Supporting source or test evidence
- A way to confirm or reject the claim

Example:

```md
### LOGIC-001 — High — Incorrect ownership check

Location: `src/documents/get.ts:42`

Condition: A document ID from another tenant is supplied.

Impact: A user can retrieve another tenant's document.

Evidence: The query filters by document ID but not authenticated tenant ID.

Verification: Add a cross-tenant integration test and confirm the request is
rejected without revealing whether the document exists.
```

Use these finding classes:

- `blocking-defect`: supported correctness, security, contract, or material
  reliability problem
- `non-blocking-improvement`: supported improvement without material current
  risk
- `question`: missing or conflicting context prevents reliable judgment

Stylistic preferences and unsupported possibilities should not be reported as
defects. Findings should be suitable for inline presentation in Claude, Codex,
or a later pull-request adapter.

## Implementation Context

The primary session retains its conversation context throughout the loop and
writes a compact `context.md` for reviewers, delegated fix workers, and engineer
inspection. It contains:

- Intended outcome and acceptance criteria
- Non-goals and constraints
- Important design decisions
- Changed components
- Checks already run
- Known uncertainty
- Base revision and initial diff identity

Reviewers receive this context, the current diff, repository instructions,
relevant source, and verification results. They do not receive the full
reasoning transcript, which would add noise and weaken review independence.

## Inspectable Run Record

Write a compact local run history that is excluded from the application diff:

```text
.ai-review/<run-id>/
├── context.md
├── review-01.md
├── fix-01.diff
├── verification-01.md
├── review-02.md
├── fix-02.diff
├── verification-02.md
└── summary.md
```

- `review-N.md` groups findings by specialist and records previous-finding
  status.
- `fix-N.diff` contains only changes made in response to that review iteration.
- `verification-N.md` maps findings to fixes, explains disputed findings, and
  records commands and results.
- `summary.md` records the iteration history and final disposition of each
  finding.

## Completion and Escalation

The loop completes when:

- no blocking finding remains open;
- earlier blocking findings are independently verified;
- required deterministic checks pass; and
- the change remains within its intended scope.

Stop and escalate when:

- the configured iteration limit is reached;
- the same finding survives repeated correction;
- fixes and reviews oscillate without progress;
- required verification cannot run;
- the correction requires a consequential product or architecture decision;
- the required change exceeds the authorized scope; or
- reviewers disagree and evidence cannot resolve the disagreement.

Completion means the change is ready for engineer inspection or the next
delivery decision, not approved to merge.

## Proposed Repository Structure

```text
agents/
├── logic-reviewer.md
├── security-reviewer.md
├── performance-reviewer.md
└── test-reviewer.md

skills/
└── change-review/
    └── SKILL.md

.claude/
├── agents/
│   ├── logic-reviewer.md
│   ├── security-reviewer.md
│   ├── performance-reviewer.md
│   └── test-reviewer.md
└── skills/
    └── change-review -> ../../skills/change-review

.agents/
└── skills/
    └── change-review -> ../../skills/change-review
```

The files under `agents/` and `skills/` are canonical. Harness-specific paths
should be thin discovery links or adapters rather than independently maintained
copies.

## Initial Evaluation

Evaluate the first version on a small retained set containing both defective
and clean changes. Include logic, authorization, input-handling, performance,
concurrency, and inadequate-test examples.

Measure:

- Confirmed material defects found
- Material defects missed
- False-positive findings
- Duplicate findings across reviewers
- Fixes that resolve the finding without scope drift
- Regressions introduced by review fixes
- Engineer effort required to understand the run history

The first version succeeds when it catches material defects before or during
pull-request review, preserves implementation intent during fixes, and lets an
engineer quickly reconstruct each review-and-fix iteration.

## Deferred Capabilities

Do not add these until observed use demonstrates a need:

- Automatic risk-assessment or reviewer routing
- A separate fixer agent
- Additional specialist reviewers
- Parallel writes to one working tree
- Pull-request posting or merge approval
- Cross-model routing
- Central agent registries or telemetry services

## Source Basis

The design draws on the specialist-agent pattern in
[Claude Code power user tips](https://support.claude.com/en/articles/14554000-claude-code-power-user-tips)
and the layered process in
[Four levels of AI code review](https://www.youtube.com/watch?v=As2xy_cSx00).
Local implementation sources remain authoritative:

- [`guidelines/agent-guideline.md`](../guidelines/agent-guideline.md) for agent roles, boundaries, and result contracts
- [`guidelines/skill-guideline.md`](../guidelines/skill-guideline.md) for the canonical workflow skill
- [`strategies/ai-assisted-code-quality-control.md`](../strategies/ai-assisted-code-quality-control.md) for review evidence and accountability
- [`strategies/ai-harness-engineering.md`](../strategies/ai-harness-engineering.md) for harness integration
- [`strategies/graph-assisted-code-review.md`](../strategies/graph-assisted-code-review.md) for graph-assisted review considerations

# Integrating scope, evidence and efficiency into the AI-SDLC

Engineering integration guide · 7 September 2026 · Current pilot and proposed extensions

## Purpose and applicability

Use this guide to incorporate seven working principles into AI-assisted software delivery: explicit scope, sufficient changes, conditional review, concrete verification, evidence-based completion, proportionate effort, and harness optimization.

The intended implementation uses existing tickets, repository instructions, agent prompts, tests, CI and pull requests. Start with instructions and a concise decision report. Add automated enforcement where an existing script or host capability can enforce a rule reliably. This document does not require a new service or dashboard.

The [Change Review Agents Specification](../plans/change-review-agents-spec.md) owns the proposed behavioral contract. The [private-pilot operational guide](reusable-change-review.md) owns current operation and evidence interpretation, and the [reusable workflow plan](../plans/reusable-change-review-workflow.md) owns the roadmap. Follow the [Scope and Complexity Guardrail](../prompts/scope-and-complexity-guardrail.md). This document supplies integration examples; it does not override those authorities.

### Implementation status and authority

This guide is prepared against `main` at `c57eb7e`, independently of [PR #325](https://github.com/jhakulin/ai-harness/pull/325). Before implementing an example, read the operational guide at the revision being deployed.

| Area | State at the preparation baseline | Consequence for this guide |
| --- | --- | --- |
| Merged private pilot | Manual, report-only PR review through the existing workflow; its operational guide says the simplified path has not been run remotely. | Apply source-review guidance and inspect actual available reports. Do not claim a successful remote run from this guide. |
| Configuration and deterministic reports in PR #325 | The open branch contains `review.config.json` and structured preparation/finalization changes; that configuration is absent from the merged baseline. | Use the schema and operational documentation shipped with the deployed revision. This guide neither imports those changes nor claims they are merged. |
| Specialist review | The specification proposes six logical roles for its general profile. Independent specialist sessions are not implemented in the pilot. | Routing and delegation examples below are future integration work. Assessing several concerns in one session is not independent review. |
| Repair and execution | The pilot does not fix candidate code or execute its tests, builds or installations. | Implementation, repair and executable validation examples apply to an engineer's separately authorized development workflow or a future approved integration. |
| Evidence and authority | The pilot produces advisory source judgment. Reporting contracts evolve with the deployed implementation. | Missing execution evidence stays missing; a clean review does not establish acceptance or merge authority. |

The current pilot permits ordinary checkout visibility and temporary report writes. Its read-only GitHub access is not proof of a read-only filesystem or complete provider-context isolation. Stronger future reviewer restrictions must be demonstrated before being claimed.

Examples below are hypothetical. Paths, commands, thresholds and configuration are proposals to adapt to the target repository; no runner, integration or host configuration is installed by this document. Platform-specific tool syntax must be checked against the deployed version during implementation.

### How an integration engineer should use this guide

Each principle is an integration work item for the engineer maintaining the AI-SDLC workflow. Read its **Use now** or **Proposed extension** note first, then **Integration changes for the engineer** to identify the relevant template, prompt, configuration or runner. Some named components require future implementation. Use **Runtime behavior and example** to understand the intended task behavior, **Evidence the engineer should expect** to inspect the result, and **How to verify the integration** to check that an approved implementation works.

The integration engineer maintains the workflow and the task author supplies requirements. In the current pilot, the agent reviews source and reports; engineers and separately authorized CI perform implementation and execution. In the proposed broader integration, the main agent coordinates and may implement under the applicable authorization, while independent specialist agents review. One person can hold several engineering roles. A prompt clause is standing guidance and does not require the agent to print a questionnaire for every edit.

Examples of agent reports below are outputs expected from a run, not assignments handed to the integration engineer. Use the single final report in section 10 to collect them; do not create seven new reports or approval stages. Integration acceptance checks verify the workflow itself. Task validation checks verify the code or documentation produced during an ordinary run.

### Research basis and limits

[Prompt-Induced Waste in Coding Agents, v5](https://arxiv.org/html/2608.01347v5) reports that prompt semantics, effort and harness policy interact to affect cost and success. Requests for alternatives and certainty increased unnecessary work on its bounded tasks. Efficiency framing also caused premature completion when requirements were ambiguous. Higher effort helped some difficult task/model combinations, but its tested escalation rule did not improve the observed trade-off. Its proposed learned controller remains unevaluated.

Conditional specialist selection, the lifecycle mapping, examples and acceptance criteria in this guide are engineering recommendations. The paper did not test this review system. Its small-task results should not be treated as measured savings for large legacy repositories.

## 1. Where the principles enter the SDLC

The table maps a proposed end-to-end development workflow. Only source review and advisory reporting are supplied by the current private pilot; the other stages remain with the engineer/existing delivery process until their integrations are separately approved and implemented.

| SDLC stage | Practical integration | Owner | Evidence required to advance |
| --- | --- | --- | --- |
| Intake and requirements | Record outcome, constraints, exclusions, acceptance criteria and material unknowns. | Engineer/product owner, assisted by main agent | A focused task description; unresolved product choices identified. |
| Investigation and design | Inspect relevant contracts and callers; choose the simplest complete approach; compare alternatives when a material decision requires it. | Main agent; engineer resolves trade-offs | A short implementation direction linked to repository evidence. |
| Implementation | Preserve scope, add necessary regression coverage, record any required expansion. | Main agent | A coherent patch with evidence connecting changes to the task. |
| Review | Select applicable specialists, enforce read-only access, collect and verify findings. | Main agent coordinates; specialists report | Routing reasons, terminal reviewer states and finding dispositions. |
| Verification | Run required checks on the final artifact; repeat when relevant state changes. | Main agent/local runner and existing CI | Commands, revision, results and limitations. |
| Release handoff | Establish implementation readiness; follow the existing release approval and deployment process. | Engineer/release owner | Reviewed artifact identity and applicable release evidence. |
| Operation and feedback | Use existing incidents, regressions and sampled run reports to identify failures or unnecessary work. | Maintainer | A concrete improvement proposal and comparison against the previous policy. |

Implementation readiness does not automatically authorize merging, deployment or external communication. An operational defect becomes a scoped follow-up task; it does not silently reopen a completed agent run indefinitely.

## 2. Principle one: keep scope explicit

**Use now:** task descriptions, scope-aware source review and honest coverage reporting. Implementation-agent instructions apply only in a separately authorized development session; the private reviewer does not edit the candidate.

### Integration changes for the engineer

1. **Task template:** add outcome, acceptance criteria, constraints, expected edit areas, non-goals and material unknowns to the existing issue template. The task author supplies these values; a trivial correction may need only a sentence.
2. **Implementation prompt:** add the clause below to the existing main-agent instructions. Allow relevant inspection beyond expected edit paths while retaining actual access restrictions.
3. **Review and completion report:** require the main agent to explain material departures from scope. Ask the maintenance reviewer to identify unrelated additions in the final diff.

Add this standing prompt clause:

```text
Implement the requested outcome within the stated constraints. Inspect relevant
contracts, callers and tests even when they are outside the expected edit paths.
Before a material expansion in behavior, architecture or cost, explain why it is
needed and obtain any missing direction. Use existing authorization where it
already covers the work. Record unrelated improvements separately.
```

### Runtime behavior and example

The task author supplies a description such as:

```text
Outcome: A project member cannot download an export owned by another tenant.
Acceptance:
- Same-tenant, authorized downloads continue working.
- Cross-tenant downloads return the established not-found response.
- The object store is not called for a denied request.
Constraints: Preserve public response conventions and existing tenant policy.
Expected edits: Export authorization code and focused regression tests.
Non-goals: Redesign authentication; replace the export subsystem; unrelated cleanup.
Unknown: Which existing helper implements the repository's tenant policy?
```

Separate the permission to inspect from the permission to edit. The agent may need to inspect route registration, callers, requirements and tests outside the expected edit area. Inspection must still remain relevant and within granted access.

1. Identify the intended outcome and authoritative repository instructions.
2. Inspect enough context to resolve the listed unknowns.
3. Relate each planned modification to an acceptance criterion or necessary dependency.
4. Raise a material product or architectural expansion before implementing it.
5. Record unrelated defects separately without adding them to the patch.

An additional regression-test file is usually a routine implementation choice. Introducing a new authorization service is a material expansion. File count alone does not determine whether clarification is needed.

The agent finds that the download route calls a shared lookup helper. Reading that helper is in scope. Using its existing tenant parameter may also be a routine part of the fix. Changing all resource authorization across the application needs a separate decision if the task does not already authorize it.

### Evidence the engineer should expect

The main agent's completion report identifies the outcome, actual changed areas, relevant resolved unknowns and any authorized expansion. The engineer checks those statements against the issue and final diff. If a product decision remains unresolved, the status is `incomplete` with reason `needs_input`; the agent does not invent a policy to make the task finish.

### How to verify the integration

- Give the workflow a task whose relevant caller is outside the expected edit area. Confirm that the agent inspects it and respects actual access boundaries.
- Include an unrelated cleanup opportunity. Confirm that the final patch excludes it and the report identifies it only if useful.
- Use a task with a material unresolved policy choice. Confirm that the agent requests direction rather than silently implementing a new policy.

Scope relevance requires engineering judgment. A changed-path check can flag unexpected edits for inspection, but cannot by itself determine whether they were necessary.

## 3. Principle two: prefer the smallest sufficient change

**Use now:** engineers implement scoped fixes; the pilot can assess the diff for completeness and unnecessary complexity. The independent functionality, maintenance and test reviewer assignments below describe the proposed general profile, not three sessions available in the pilot.

### Integration changes for the engineer

1. **Implementation prompt:** add the standing instructions below to the main agent's existing prompt or repository guidance.
2. **Task template:** require observable acceptance criteria and applicable compatibility constraints, so the agent can determine what constitutes a complete fix.
3. **Existing reviewer prompts:** have functionality review assess completeness, maintenance review assess unnecessary complexity, and test review assess whether the tests detect incorrect behavior. No additional reviewer is needed.
4. **Completion report:** require a short explanation of the chosen mechanism, necessary supporting changes and verification evidence.

Add this standing implementation clause:

```text
Implement the simplest complete solution that satisfies the acceptance criteria
and established repository contracts. Before introducing a helper, abstraction
or dependency, inspect relevant existing mechanisms and reuse them when suitable.
Include supporting caller changes and tests needed for correctness. Preserve
pre-existing user changes and avoid unrelated cleanup.
If completing the task needs a material expansion beyond authorized scope,
explain the dependency and obtain the missing direction.
```

A change is sufficient when it fixes the relevant cause, preserves affected contracts, includes necessary verification and fits the existing design. Required caller changes, documentation or migration work remain part of sufficiency. Do not impose a line-count target.

### Runtime behavior and example

For the export task, the acceptance criteria require authorized downloads to work, cross-tenant downloads to be denied, and denied requests to avoid object-store access.

The implementation agent inspects the existing tenant-scoped lookup, uses it if appropriate, updates a caller if tenant context must be supplied, and adds focused regression coverage. A generic policy language requires a concrete requirement that the existing mechanism cannot satisfy.

The functionality reviewer asks whether denial happens before storage access. The maintenance reviewer asks what requirement justifies each new abstraction or dependency. The test reviewer checks whether a denied-path test would fail if the original defect returned. A test that asserts only an error response may miss storage access performed before rejection.

The engineer or runner gathers evidence with the following purposes:

| Task validation | Expected evidence |
| --- | --- |
| Authorized-download test | Legitimate access still succeeds. |
| Cross-tenant negative test | The unauthorized request is denied. |
| Denied-path storage-call assertion | The object store is never called for that request. |
| Final diff inspection | Supporting changes are justified and unrelated modifications are absent. |

A smaller patch that downloads the object and then denies access fails the acceptance criteria. A larger patch with a necessary caller update can be the correct sufficient change.

### Evidence the engineer should expect

The agent returns an **implementation completion report**, for example:

```text
Implementation: reused the existing tenant-scoped export lookup and updated
one caller to supply tenant identity.
Evidence: authorized download passes; cross-tenant download is rejected;
the denied-path regression test confirms zero storage calls.
Compatibility: existing response conventions and storage interface preserved.
Scope: unrelated export filename cleanup deferred; no new dependency required.
```

The engineer inspects the actual diff and linked check results. The report helps explain the change; its assertions do not independently prove correctness. Unnecessary generated files and formatting changes should be removed without disturbing pre-existing user work.

### How to verify the integration

- Provide a task with a suitable existing helper: check that the agent considers and uses it when appropriate.
- Provide a task that requires one caller update: check that the agent includes it instead of leaving the fix incomplete to minimize the diff.
- Present a proposed patch with an unnecessary framework: check that maintenance review asks for a concrete requirement and reports unjustified complexity.
- Present a patch that denies access after downloading: check that functionality/test review or task validation detects the acceptance failure.

There is no generic deterministic check for whether every abstraction is necessary. Prompts and specialist review handle that judgment; tests establish the concrete behavioral properties they exercise. If a proper fix requires broader work, report the dependency rather than substituting an unsafe workaround.

## 4. Principle three: select reviewers conditionally

**Proposed extension:** implement independent routing only after the selected harness integration is approved and available. The current pilot performs one bounded source review. It may describe the concerns assessed, but must not claim specialist selection, execution or approval.

### Integration changes for the engineer

1. **Orchestration skill or existing review script:** add a routing step before delegation and after repairs. Assess behavior and risk signals alongside paths.
2. **Configuration contract:** consult the deployed consumer configuration and schema. The open PR #325 uses `review.config.json` for bounded review-only criteria; it does not implement the complete reviewer-routing profile. Do not add invented reviewer, repair or concurrency keys. Define future additions through the maintained specification and a separately approved implementation.
3. **Future host reviewer definitions:** after approval, implement restrictions using the selected host's actual tools and sandbox controls. Keep executable validation in a separately authorized runner. The pilot's read-only GitHub permissions do not establish these future filesystem guarantees.
4. **Completion report:** include a selected/skipped reason for every role, the rule source and each selected reviewer's terminal status.

Add this clause to the orchestration instructions:

```text
Assess reviewer applicability from the change and relevant surrounding behavior.
Apply mandatory repository rules. Explain selected and skipped roles with evidence.
Resolve uncertain impact through focused inspection or the relevant specialist.
After repairs, reassess routing and run all still-applicable final reviewers.
Treat missing or invalid mandatory review output as incomplete.
```

### Runtime behavior and example

The proposed review specification requires functionality and test review for executable behavior changes, test review for test-file changes, and security review for listed security signals. Optional routing cannot silently disable those requirements.

| Example change | Select | Reason and condition |
| --- | --- | --- |
| Spelling correction in a guide | Documentation | No executable example or behavior changed. |
| Guide changes a command to disable TLS validation | Documentation, security | Documentation changes the user's trust boundary. Add functionality/test review if executable examples need validation. |
| Export authorization fix | Functionality, test, security, maintenance | Access policy and production code changed. Add documentation if public behavior or published guidance changes. |
| C++ packet-buffer ownership change | Functionality, test, performance, maintenance; security when memory safety or an input boundary is affected | Ownership, lifetime, allocation and concurrency require inspection. Mandatory sensitive-path rules still apply. |
| Test assertion or fixture change only | Test; functionality when expected semantics change | Determine whether the tests still distinguish correct from incorrect behavior. |

### Evidence the engineer should expect

The routing record identifies the signal and policy behind a decision:

```yaml
reviewer: security
decision: selected
signals:
  - Export lookup now incorporates tenant identity.
rule: mandatory-security
source: repository review policy
reason: Cross-tenant access behavior is affected.
```

Record a reason for skipped roles too. An uncertain impact is not proof that a specialist is unnecessary. Use additional focused inspection, select the relevant specialist, or resolve a material unknown with the engineer. Protected routing changes belong in explicit policy review.

Run selected reviewers in parallel only through the authorized workflow, with bounded concurrency and a common immutable review snapshot. Keep the main agent from editing while reviewers inspect that snapshot. If the worktree changes externally, invalidate affected results and rerun against a stable snapshot.

Reviewers receive the task, acceptance criteria, base/current snapshot, affected files, lane-specific instructions and available check evidence. Give them access to relevant surrounding context. A finding must explain the triggering condition, impact, location and supporting evidence.

Example: functionality and security reviewers both identify the same missing tenant condition. The main agent combines them under one root-cause finding, retains both sources, independently reproduces or traces it, and records `confirmed`, `rejected`, or `unresolved`. Agreement between reviewers alone is not independent verification.

Reviewers do not edit files or run mutation testing. Tests that create build outputs are executed by the main agent or the established validation runner. Reviewers may request a check and inspect its result. Prompt text must be backed by available tool restrictions or sandbox controls; if the host cannot provide required isolation, report the limitation and do not claim enforced read-only review.

After repairs, recompute routing and rerun every still-applicable reviewer against the final diff, adding newly applicable roles. This follows the proposed specification; it is not current pilot behavior. Test execution evidence can be reused when valid; skipping final reviewers based on cached approval would be a separate policy change.

Missing, cancelled, truncated or invalid mandatory reviewer output makes review incomplete. A successful empty finding list must be explicit.

### How to verify the integration

- Route a spelling correction and a TLS-disabling documentation command: expect different security decisions despite the shared file type.
- Route a behavior change: confirm mandatory functionality and test review remain selected even when optional configuration would skip them.
- Simulate a mandatory reviewer timeout: expect `incomplete`, not an empty successful review.
- Repair a change so it newly affects a trust boundary: confirm final routing adds security review.
- Check the actual host restrictions with an isolated fixture before relying on read-only enforcement.

Path rules and required-role checks can be deterministic. Assessing behavioral risk still needs repository evidence and reviewer judgment.

## 5. Principle four: replace certainty language with concrete checks

**Use now:** distinguish source evidence from executable validation. The private pilot inspects tests as text and reports execution as not run by the reviewer. Engineers or separately authorized CI produce test/benchmark evidence; future integrations may consume that evidence under their deployed contract.

### Integration changes for the engineer

1. **Implementation prompt:** replace vague demands for absolute certainty with the clause below.
2. **Task template:** include a verification plan mapping acceptance criteria to suitable evidence; the main agent may complete it after repository inspection.
3. **Validation configuration/runner:** reference actual repository commands and preserve mandatory CI checks. Record results and the artifact they checked.
4. **Test reviewer prompt:** assess whether assertions exercise the intended behavior and distinguish incorrect implementations.

```text
Associate each acceptance criterion with concrete evidence. Run the relevant
checks against the final change. Repeat a check when relevant inputs change,
when a failure needs diagnosis, or when repetition serves an explicit statistical
purpose. State skipped checks and unresolved gaps.
```

### Runtime behavior and example

For the export task, the main agent prepares this criterion-to-evidence mapping:

| Export acceptance criterion | Example evidence | Why it matters |
| --- | --- | --- |
| Authorized same-tenant download succeeds | Route-level integration test with real authorization wiring | Detects regressions in the allowed path. |
| Another tenant cannot download the export | Negative-path test with two distinct tenant identities | Exercises the original defect. |
| Denied requests do not access storage | Assertion that the storage client was not invoked | Detects rejection performed too late. |
| Responses preserve established conventions | Contract assertion and inspection of the existing response helper | Prevents an accidental API behavior change. |

Illustrative command: `pytest tests/api/test_export_download.py -q`. Replace it with the repository's actual entry point. Passing this targeted command does not replace any mandatory broader CI checks.

A benchmark may require warm-up and repeated samples. A concurrency investigation may require multiple schedules or stress runs. A flaky-test investigation intentionally measures repeated outcomes. These purposes must be stated; a blanket prohibition on repeated commands is incorrect.

If a command fails because a service is unavailable, identify the environment problem. Use a bounded retry when evidence suggests a transient fault. Do not rerun unchanged deterministic failures hoping for a different outcome.

### Evidence the engineer should expect

Record command, artifact identity, environment/configuration, exit result and relevant output. Classify failures as code defects, infrastructure problems or unknown. Never describe an unexecuted, skipped or inconclusive check as passed.

For example: `Denied request: verified on S2 by the cross-tenant integration case and zero-storage-call assertion; exit 0; CI artifact <reference>.` If repeated samples were taken, identify their purpose and report the aggregate result rather than only a favorable run.

### How to verify the integration

- Supply a passing test that asserts only an error response: confirm test review flags missing evidence about storage access.
- Request an identical deterministic test on unchanged state without a diagnostic purpose: confirm valid evidence is reused.
- Run a configured benchmark sampling case: confirm purposeful repeated samples remain allowed.
- Simulate a missing test service: confirm the report identifies the blocker rather than reporting a pass.

Runners can record exits and identify identical commands and inputs. The relevance of a check and adequacy of its assertions require engineering assessment.

## 6. Principle five: give workflows an evidence-based stopping rule

**Use now:** require complete declared coverage and honest limitations for source review. The delivery-readiness gate and broader statuses below are proposed specification concepts. They do not replace the pilot's report contract or convert source review into verified acceptance.

### Integration changes for the engineer

1. **Orchestration instructions:** define completion conditions before allowing a success report.
2. **Existing runner:** associate validation and review results with the artifact inspected. Invalidate evidence when relevant inputs change.
3. **Report contract:** preserve the deployed pilot's statuses and evidence semantics. Reserve `passed`, `passed_with_warnings` and `incomplete` below for the proposed broader workflow; do not rename actual runtime fields.
4. **Configuration:** use supported runtime limits. A future repair integration must declare its repair limit separately; the pilot has no repair loop. A limit stops work but cannot change unmet conditions into success.

Add this completion clause:

```text
Report completion only when acceptance criteria are supported by repository
evidence, required checks and applicable final reviews cover the delivered
artifact, and no blocking finding remains. If evidence is missing, stale or
inconclusive, report incomplete with the reason and remaining work.
Do not treat budget exhaustion or a passing subset of tests as completion.
```

If an existing runner can evaluate required statuses and snapshot equality, enforce those checks there. Keep semantic acceptance review with the agents and engineer; all-green status fields alone do not prove that requirements are complete.

### Runtime behavior and example

For the export task, implementation is ready for handoff only when:

1. Acceptance criteria have been interpreted using relevant repository contracts.
2. The final patch satisfies the criteria and stays within authorized scope.
3. Required validation has passed on the delivered artifact.
4. Applicable final reviewers have completed.
5. Findings at or above the configured blocking severity are resolved; any accepted exceptions have an owner and explicit authority.
6. The final diff has been inspected and remaining limitations are reported.

Visible tests passing is necessary where required, but insufficient while relevant requirements or findings remain unresolved.

For committed changes, record base and head SHAs. For uncommitted work, the runner needs a snapshot identifier covering staged, unstaged and relevant untracked content; `HEAD` alone is insufficient. Record dependencies or environment details when they affect check validity.

Example:

```text
Snapshot S1: authorization regression passes; reviewer approves S1.
Main agent changes the lookup while fixing a finding: snapshot becomes S2.
S1's approval does not approve S2.
Run affected checks and final reviewers on S2; retain S1 only as history.
```

Changes to fixtures, dependencies, configuration or the execution environment can invalidate results even when the production source is unchanged. Explicit sampling policies govern benchmark and nondeterministic evidence.

### Evidence the engineer should expect

For the merged pilot at this guide's baseline, report `Reviewed — findings`, `Reviewed — no findings`, or `Incomplete`, as defined by its [shared review procedure](../.github/aw/review-change.md). Tests/builds remain `not run` by the reviewer. If the deterministic reporting changes from PR #325 are deployed, follow that revision's schema and operational guide: execution state, defect judgment and evidence readiness are separate. Do not flatten them into a single passing status.

For a future implementation conforming to the broader specification, use its proposed final statuses and include a reason:

| Final status | Meaning | Example |
| --- | --- | --- |
| `passed` | All required completion conditions hold. | Final snapshot passes validation and required reviews. |
| `passed_with_warnings` | Required gates hold; permitted nonblocking limitations are visible. | A low-severity optional improvement remains. |
| `incomplete` | At least one required condition is unmet. | Mandatory reviewer unavailable, unresolved defect, budget exhausted or required integration environment unavailable. |

For `incomplete`, add a reason such as `needs_input`, `validation_failed`, `infrastructure_blocked`, `review_incomplete`, `cancelled`, or `budget_exhausted`. Budget exhaustion stops execution; it does not establish success. Report the remaining work and preserved artifact so an engineer can resume deliberately.

### How to verify the integration

- Change relevant uncommitted or untracked content after a passing check: confirm that unchanged `HEAD` does not preserve approval.
- Leave one required review or acceptance criterion unresolved: confirm the workflow cannot return `passed`.
- Exhaust the repair limit with an unresolved defect: expect `incomplete` and a usable continuation report.
- Complete every required condition: confirm the agent stops without inventing additional validation rounds.

## 7. Principle six: match effort to task evidence

**Use now:** engineers tune only supported controls in reviewed deployment configuration. The pilot is not an adaptive-effort controller. Dynamic effort changes below require a separately implemented and evaluated host integration.

### Integration changes for the engineer

1. **Host configuration:** choose an initial model/effort setting for representative repository work. Keep identifiers in native configuration; their meanings are not interchangeable across platforms.
2. **Orchestration prompt:** add the decision guidance below for responding to difficulty or missing evidence.
3. **Execution limits:** bound work using the deployed runtime's supported limits. Bound repairs separately only in an authorized implementation workflow; the pilot does not repair code.
4. **Completion report:** record changes to effort, why they were made, and effective settings when available.

```text
Choose the next action from the observed blocker. Inspect missing repository
evidence; ask about material unresolved product decisions; consider higher
reasoning effort for a difficult analysis problem. Record the reason for an
effort change and remain within configured limits. Report unavailable controls.
```

Start with manual or simple rule-based selection. If the host cannot change effort during a run, use a supported subsequent invocation or let the engineer select the next setting. Do not imply that prompt wording changed a provider setting. A learned controller is unnecessary for this integration.

### Runtime behavior and example

| Observed condition | Appropriate next action | Example |
| --- | --- | --- |
| Localized, well-understood defect | Use the normal repository default and focused evidence. | Reuse an existing tenant lookup. |
| Missing repository contract | Inspect relevant documentation/callers. | Determine whether unauthorized resources return 403 or 404. |
| Unresolved product choice | Ask the responsible engineer/product owner. | Decide whether administrators may cross tenant boundaries. |
| Conflicting cross-module behavior | Increase investigation and consider higher reasoning effort or a specialist. | Several ownership paths disagree about buffer lifetime. |
| Missing credentials or unavailable service | Resolve or report the execution blocker. | Required test database cannot be reached. |
| Repeated unsuccessful repairs | Stop at the configured limit and report evidence. | Two repair passes leave the same integration failure. |

### Evidence the engineer should expect

The main agent records an escalation decision such as:

```text
Trigger: unit tests pass, but integration failures show tenant context is lost
between route middleware and the background export worker.
Action: inspect both context propagation paths; increase analysis effort for
that investigation using the host's supported control.
Expected evidence: a traced propagation path and a regression test covering it.
Limit: remain inside the task budget; report unresolved contracts explicitly.
```

Known high-risk work can begin with greater effort. Do not require an avoidable failed run first. Conversely, additional reasoning cannot replace missing information or authority.

### How to verify the integration

Confirm that a configured control is accepted by the host/provider; where exposed, record effective settings and usage. Do not claim an effort intervention occurred solely because a configuration file was edited. Compare success, escaped defects, latency and cost on comparable tasks, including repeated runs where variability matters.

- Present a missing repository requirement: expect targeted inspection, not an automatic increase in effort.
- Present a product-policy ambiguity: expect clarification when required, not a guessed answer after longer reasoning.
- Present a cross-module reasoning problem: confirm the selected action has an evidence-based explanation and respects the budget.
- Simulate an unsupported effort control: confirm the limitation is visible and no effective change is falsely reported.

These checks establish that the policy is applied correctly. A comparison on representative tasks is still required to establish that it improves quality, cost or latency.

## 8. Principle seven: optimize the harness as a system

**Use now:** inspect existing reports and runtime observations, then propose one bounded workflow improvement. Independent-reviewer and repair optimizations apply only when those future capabilities exist.

### Integration changes for the engineer

1. **Existing activity/CI reports:** inspect a sample of ordinary runs and choose one observed inefficiency. This principle initially assigns investigation to the integration engineer; it does not authorize the agent to rewrite its own workflow during a coding task.
2. **Relevant prompt or runner:** change the component responsible, such as runtime review packets, test scheduling, retry handling or output delivery.
3. **Existing logs/report:** retain sufficient evidence to compare old and new behavior. Disclose unavailable measurements.
4. **Repository evaluation process:** compare the policy on representative tasks, then retain, revise or revert it using agreed quality criteria.

Add a reporting clause where useful:

```text
Use existing valid check artifacts for the reviewed snapshot. Request additional
evidence when coverage is missing or inputs have changed. Report repeated work
that appears unnecessary, with a concrete example, for workflow maintenance.
Keep required checks, review boundaries and relevant diagnostics intact.
```

### Runtime behavior and example

Inspect prompts, tool exposure, delegation, context transfer, retries and validation policy together:

| Observed behavior | Small integration change | Quality condition |
| --- | --- | --- |
| Every reviewer receives all six role prompts | Send common boundaries plus that reviewer's lane prompt. | Required cross-cutting constraints remain present. |
| Reviewers repeat the same expensive suite | Main runner supplies check evidence for the shared snapshot. | Reviewers can request missing or invalidated checks. |
| Each handoff pastes the full repository | Supply precise references and a bounded change packet. | Relevant context remains accessible; omissions are visible. |
| Tool output floods agent context | Return a useful summary and reference retained output. | Failures and significant diagnostics are preserved. |
| Coordinator uses agents for polling and label bookkeeping | Use an existing script or native workflow operation. | Exit status, timeout and failure handling remain visible. |
| The same failed action repeats without progress | Apply a bounded retry policy with a stated trigger. | Transient faults and purposeful sampling are distinguished. |

Full activity records belong in the host's existing logs or CI artifacts when available. The main report should retain decision evidence without requiring the model to ingest every historical log again. Log availability and retention must be disclosed; prompts cannot guarantee that a host exposes every internal event.

For example, the engineer observes that each reviewer asks the main agent to run the same suite on the same snapshot. Update the orchestration packet to include the existing run and update reviewer instructions to identify any specific missing evidence. Reviewers still inspect independently and can request different or invalidated checks.

### Evidence the engineer should expect

The integration change includes a brief comparison report:

```text
Observed problem: repeated identical suite execution for the same review snapshot.
Change: provide the existing check artifact in each selected reviewer's packet.
Behavior to verify: reviewers use it and request only missing/invalidated checks.
Quality criteria: required review coverage remains; seeded defects are still found.
Measures: total suite executions, end-to-end time, available agent cost and findings.
Decision: retain/revise/revert based on observed results; attach evidence.
```

The report contains measured values after the comparison. The example is not a claim that savings have already been achieved.

### How to verify the integration

1. Choose one observed problem, such as duplicate suite execution.
2. Select representative existing tasks or historical fixes and define acceptable quality before comparison.
3. Pin the task snapshot, prompt version, model/provider, harness version and relevant environment as far as possible.
4. Change one policy and compare outcomes with the previous policy.
5. Keep the change only when quality remains acceptable and the intended cost or latency benefit is demonstrated.

Record total cost across main agent, subagents, retries and validation services where available. Report unavailable cost components instead of treating them as zero. Keep latency and engineer intervention visible alongside cost. Few successful examples cannot establish a reliable quality guarantee; use them as a pilot and continue observing ordinary work.

Do not remove required safety controls, independent review or evidence simply because they contribute overhead. Evaluate the work they prevent or detect.

Include a stale-artifact case and a missing-coverage case in the comparison: the revised workflow must request fresh or additional checks for both. Preserve full failure output in accessible existing artifacts when summaries are used. Verify that any reduction reflects less redundant work rather than omitted mandatory checks or earlier failure.

## 9. Worked examples across the lifecycle

All three examples describe an engineer's development process and possible future integrations. The current pilot can review the resulting PR as source, identify gaps and deliver its advisory report. It cannot perform the implementation, run candidate checks, dispatch independent specialists or repair findings shown below.

### Example A: tenant export authorization defect

1. **Intake:** the engineer defines denied and allowed behavior, storage-access restrictions and response compatibility. Authentication redesign is excluded.
2. **Investigation:** the agent reads the existing tenant policy, route wiring, lookup helper and tests. It resolves the response convention from repository evidence.
3. **Implementation:** the main agent uses the existing scoped helper and adds focused positive/negative regression cases. It records unrelated cleanup separately.
4. **Initial verification:** the development runner executes the available tests and records snapshot S1 and results. In this example they check the response but omit the zero-storage-call assertion; that acceptance criterion remains unverified.
5. **Proposed specialist routing:** in an implemented general profile, functionality, test, security and maintenance are selected. Performance is skipped after inspection finds no additional storage call or relevant performance policy trigger. Documentation is skipped because the fix restores documented behavior.
6. **Review findings:** functionality and security report the same ordering defect. The main agent deduplicates it and confirms that storage is called before access denial. It fixes that issue only, producing S2.
7. **Final verification/review:** affected tests run on S2. Routing is reassessed and all applicable final reviewers review S2. Required CI completes on the corresponding committed artifact.
8. **Handoff:** the report links criteria, final snapshot, review verdicts and checks. Existing release owners decide publication/deployment under the normal process.

The initial reviewer discovery explains why another check run is warranted. The workflow ends when the final evidence is complete; it does not seek an unlimited number of independent approvals.

### Example B: documentation change with an executable command

Task: correct a setup guide's sample command. An implemented general profile would initially select documentation review. During inspection, the agent discovers that the proposed command disables TLS certificate verification. The engineer adds security scrutiny and reports the behavior change before adopting it. A future specialist workflow would add a security reviewer; the current pilot reports the issue within its source review.

If the intended correction only fixes a spelling error, a text diff and applicable link/spelling checks suffice. If the command itself changes, validate its semantics through a safe local fixture or established documentation check where available. Do not execute it against production just to demonstrate that it works.

The final result states whether an example was executed, inspected, or remained unverified. An operational instruction does not become low risk merely because it lives in Markdown.

### Example C: C++ packet-buffer performance change

Task: reduce allocation in a packet-processing path while preserving ownership and payload behavior. An illustrative agreed criterion is at least 10% lower allocations per packet with no more than 3% p99 latency regression on the specified workload; the engineer must approve appropriate thresholds for the actual project.

The engineer obtains functionality, test, performance and maintenance coverage, plus security when input handling or memory safety is affected. A future general-profile integration routes these to independent reviewers; the pilot does not. The agent inspects callers, ownership contracts and concurrency before editing. It uses existing buffer mechanisms where sufficient; a new allocator framework requires an explicit need.

The existing benchmark runner compares base and final revisions using the same build options, workload, warm-up and sampling policy. Repeated runs are necessary here. Functional tests and applicable sanitizer checks supply separate correctness evidence. If latency variation cannot distinguish the agreed threshold, report the performance result as inconclusive rather than choosing a favorable sample.

Higher reasoning effort may be warranted by conflicting lifetime paths. It does not substitute for measurement, sanitizer evidence or a clear ownership contract. Stop only when the agreed correctness and performance evidence is complete, or report the remaining uncertainty as incomplete.

## 10. Repository integration and prompt placement

Use these maintained sources instead of copying a second policy into this guide.

| Repository source | Engineer's action |
| --- | --- |
| Existing task/issue template | Supply outcome, acceptance criteria, constraints and material unknowns for the specific change. |
| [Scope guardrail](../prompts/scope-and-complexity-guardrail.md) | Reference its existing scope discipline in an authorized implementation session. |
| [Private-pilot operational guide](reusable-change-review.md) | Determine what the deployed workflow supports and how to interpret actual outputs. |
| [Shared review procedure](../.github/aw/review-change.md) | Propose source-review instruction changes here when needed; preserve its no-candidate-execution and report-only boundaries. |
| [Change Review Agents Specification](../plans/change-review-agents-spec.md) | Use its reviewer roles, trust boundary, finding contract and proposed completion behavior when implementing an approved specialist integration. |
| [Reusable workflow plan](../plans/reusable-change-review-workflow.md) | Check phase authorization, configuration, evidence and proposed repair/publication boundaries before extending the pilot. |
| Consumer `review.config.json` and its deployed schema, when present | Configure only supported review criteria, authority references and limits. At this guide's baseline these are on open PR #325, not merged main. |
| Existing CI and engineer review | Run candidate tests through an authorized process; retain evidence tied to the candidate revision and make the acceptance/merge decision. |

### Current versus future configuration

There is no `.agent-review.yaml` contract to install for this repository. The relevant configuration name is `review.config.json`, introduced by [PR #325](https://github.com/jhakulin/ai-harness/pull/325). Its inspected branch version contains `schema_version`, `purpose`, `limits`, `criteria`, `context`, `ci` and `human_approvers`. These describe bounded review and evidence configuration, not six reviewer sessions or repair execution.

That branch's sample enables neither external CI evidence nor human approvers. Empty lists do not mean validation or approval passed. Its schema/finalizer contract, once deployed, determines which external evidence is acceptable. A generic green CI badge is not interchangeable with criterion-specific authenticated evidence.

Practical configuration action for an engineer using that deployed version:

1. Read the actual schema and configuration from the trusted deployed revision.
2. Locate the maintained requirement or quality criterion relevant to the task.
3. Configure its supported source, applicability and evidence method.
4. Run the repository's configuration/contract validation before deployment.
5. Inspect the returned criterion evidence and missing-evidence state.

Do not paste hypothetical `reviewers`, `max_repair_passes`, `block_at`, `when_performance_selected` or arbitrary executable command fields into the JSON. They are not supported merely because the broader plan discusses equivalent capabilities. Adding a schema field does not implement execution, specialist independence or repair authority.

This guide intentionally supplies no copyable substitute configuration. The deployed schema and consumer example remain the single source of truth. When a field is unsupported, report the limitation or propose an implementation change; do not silently interpret it in a prompt.

### Prompt changes without implying specialist support

The principle-specific prompt clauses are examples to incorporate into the appropriate existing instruction source through normal review. The private pilot's shared procedure remains source-review-only. Implementation clauses belong to a separately authorized developer agent, not to that procedure.

For a future specialist integration, use the [reviewer contract](../plans/change-review-agents-spec.md#reviewer-contract) and applicable repository authoring guidelines. Keep stable role instructions separate from the runtime task, revisions, changed files, context references and evidence. Loading a reviewer document into one session is context delivery; it does not establish a separate reviewer execution.

### Reports engineers should inspect

For the current pilot, use its existing report and platform artifacts as described in the operational guide. Inspect coverage, revision identity, findings, evidence actually available, execution limitations and missing requirements. Do not claim six reviewers, tests run, fixes applied or readiness from an advisory source report.

For a future broader integration, the following is an illustrative checklist for the engineer's completion report, not a replacement serialization schema:

```text
Outcome/scope: requested behavior, actual changed areas and authorized deviations.
Artifact: review base/head or supported snapshot covering uncommitted content.
Configuration: trusted source revision and effective supported settings.
Review: actual sessions executed, their coverage, findings and limitations.
Validation: criterion, evidence source, artifact identity and actual outcome.
Repair, if authorized and implemented: verified finding, proposed patch and re-review.
Effort/usage: observed settings, cost/time when available and missing measurements.
Outstanding decisions: unmet criteria, unresolved defects and required human action.
```

Use existing logs and CI artifacts; no new persistent trace store is required. Access to logs does not prove every byte reached the model or reveal hidden reasoning. Any evidence-ready result remains separate from engineer acceptance and merge authority.

## 11. Implementation acceptance checks

Use these scenarios when an integration phase is approved. They are future integration acceptance checks, not claims that the private pilot already passes them. For the current documentation change, validate repository structure, local links and factual alignment only; do not dispatch a paid pilot run or execute candidate tests.

| Scenario | Expected result |
| --- | --- |
| Simple spelling change | Documentation review with explained skips; no unnecessary benchmark. |
| Security-relevant command in documentation | Security routing activates despite the file extension. |
| Behavior change | Mandatory functionality and test reviewers are selected. |
| Missing requirement referenced in repository docs | Agent inspects relevant evidence before claiming completion. |
| Fix needs an unapproved material architecture expansion | Agent records the reason and obtains the missing direction. |
| Reviewer attempts to write | Host restrictions prevent mutation; limitation/failure is visible. |
| Two reviewers report one root cause | One finding retains both sources and receives independent verification. |
| Reviewer times out or returns invalid output | Required review remains incomplete, not an empty successful review. |
| Code changes after approval | Final review and affected evidence are refreshed for the new snapshot. |
| Uncommitted or untracked code changes after a check | Snapshot mismatch invalidates affected evidence even if HEAD is unchanged. |
| Deterministic passing test is requested again without a reason | Existing valid evidence is reused; purposeful sampling remains allowed. |
| Required check cannot execute | Final status is incomplete with a specific blocker. |
| Effort option is ignored by the provider | No claim of successful effort intervention; effective behavior is disclosed. |
| Repair/time budget is exhausted | Work is preserved and remaining issues are reported as incomplete. |
| Final review finds another blocking defect | Continue within remaining repair budget; otherwise hand off as incomplete. |

Start with the applicable guidance for task authors, source review and engineer-owned validation. Record any unavailable specialist, evidence or repair capability explicitly. Implement broader behavior only through the approved phases in the maintained plan. This document does not authorize activating those phases, changing credentials, dispatching paid reviews or publishing fixes.

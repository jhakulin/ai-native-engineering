# Reusable Change Review Workflow

Status: the bounded manual review/report path is observed in Actions. Run 34092438812 completed paid review of PR #323 with six paths covered, zero result-validation errors and published JSON/Markdown; two earlier invalid-result runs retained raw output and explicit incomplete reports. The [verification record](#observed-verification) below records exact revisions and checks; the operational guide explains usage and limits. Deterministic scope/result validation, criterion evidence, provenance and host retention are implemented. A retained public release, actual second consumer, broader quality evaluation, specialist/local review and fixes remain unproven. The native sandbox experiment tooling is removed; existing skill review is unchanged.

## Outcome and decisions

### Current scope decision — supersedes the native activation gate

The [operational guide](../docs/reusable-change-review.md) owns setup, the implemented consumer interface, evidence interpretation and current capability boundaries. **Change Review Private Pilot** takes a required PR number; manual dispatch authorizes paid review using `OPENAI_API_KEY` and the same compiler-managed Codex runtime and model selection as skill review (currently Codex 0.142.1 with gpt-5.4 as the default model). Trusted jobs resolve the actual shared release, prepare immutable merge-base scope and configured criteria, validate structured reviewer output, and render evidence-bearing JSON/Markdown. Host collection retains partial output independently of the model's upload call. It does not execute candidate scripts/builds/tests, publish comments, push code, generate fixes or merge.

Normal trusted checkout visibility and temporary writes are deliberately allowed. Read-only GitHub permissions are not selected-file filesystem enforcement. Strict isolation and exact provider-context attestation remain deferred and unproven, **not gates for this manual pilot**. Prepared data, observed runtime metadata and model claims are distinct. Deterministic validation establishes bounded evidence readiness, not truth of model judgment or merge authority. No custom native preflight, synthetic-probe readiness output, plugin activation or specialist session is required.

This supersedes earlier instructions to keep all remote model execution blocked until the full Phase 1 security/observability gate passed. The owner subsequently accepted the feedback-driven sequence below: useful review-only evidence does not depend on plugin activation or fix publication. Historical probes establish only their recorded observations. This plan records the earlier billing failure, subsequent rejected results and successful bounded review; these do not establish the broader roadmap's exit criteria.

### Longer-term outcome — roadmap, not current capabilities

Replace the skill-specific PR orchestration with a shared, configurable change-review workflow for 20+ teams and 30+ repositories. Skill review is the first profile, not a special case in the orchestration code. Support PRs, manually requested remote reviews, and actual local development review, including uncommitted changes. Optionally generate fixes as proposals the change owner can inspect and accept.

Confirmed during planning:

- **Local runtime:** Codex initially; retain the existing Codex CI engine unless the compatibility investigation identifies a blocker.
- **Asset discovery:** approved sources only. Automatic selection does not authorize downloading arbitrary marketplace packages or granting capabilities.
- **Fix authorization:** repositories can choose either automatic proposal generation after repository opt-in or explicit authorization for each run. Neither permits automatic acceptance or merge.
- **Observability:** users must be able to inspect the exact review scope, supplied/retrieved context and reviewer selection from the PR, and compare recorded runs to tune the workflow systematically.
- **Acceptance evidence:** evolve beyond defect reporting to a team-configurable checklist linking requirements and quality expectations to inspectable evidence, making approval easier and supporting engineer-performed merges where team policy permits.
- **Usability and extensibility:** keep the normal consumer setup small; extend review purposes, checklists and approved evidence sources without copying or rewriting the shared workflow.

Recommended defaults:

- Review-only, advisory reporting; no new required branch-protection check during rollout.
- Centrally maintained, immutable releases with thin consumer callers and repository-owned configuration.
- A separate draft fix PR targeting the original PR's topic branch for same-repository PRs. A downloadable fix patch when that target cannot be written safely, including contributor forks without appropriate access.
- Local fixes are generated in isolation and delivered as a patch; applying them to the developer's working tree requires a separate explicit action.
- One bounded repair pass initially. Fresh review context, not the implementation conversation.

This is a review workflow, not a new agent platform. No registry service, dashboard, database, graph infrastructure, marketplace crawler, universal harness adapter, or automatic merge/deployment system is proposed.

The long-term goal is justified confidence in a merge decision, not an LLM guarantee that a change is high quality. A clean defect review, demonstrated requirement satisfaction, and permission to merge are distinct outcomes. The workflow assembles evidence and identifies remaining decisions; the engineer remains accountable, and repository rules remain authoritative.

## Existing authority and migration constraints

The [Change Review Agents Specification](change-review-agents-spec.md) already owns the proposed review/verify/single-writer/final-review behavior. Preserve those boundaries and reference it rather than duplicating reviewer instructions. This plan adds distribution, concrete configuration, PR publication, and a Codex local entry point.

The existing specification remains a behavioral proposal, not an implemented system. Phase 1 reconciled its scope, configuration, reviewer routing, and acceptance boundaries to recognize profile-specific required reviewers and human-accepted fix publication. Its six logical reviewers define the general change-review profile, not six unconditional agents for every task. Shared distribution and automation-owned proposal commits are in scope; commits to the user's branch, automatic fix acceptance, and automatic merges are not. This reconciliation does not establish runtime conformance.

Sources to retain:

| Source | Responsibility |
| --- | --- |
| [Current workflow](../.github/workflows/review-agent-skill.md) | Existing PR behavior and reporting requirements to migrate |
| [Scope helper](../scripts/review-skill-pr-scope.js) | Existing deterministic three-dot PR scope calculation |
| [Review skill](../skills/review-agent-skill/SKILL.md) | Skill review procedure and skill-specific judgments |
| [Skill guideline](../guidelines/skill-guideline.md) | Skill criteria, package trust, progressive disclosure, routing evaluation |
| [Agent guideline](../guidelines/agent-guideline.md) | Specialist roles, input/result contracts, authority versus runtime enforcement |
| [GitHub assessment strategy](../strategies/github-agentic-assessment-workflow.md) | Deterministic preparation, agent judgment, validated artifacts, safe publication |
| [Harness engineering](../strategies/ai-harness-engineering.md) | Small control flow, native integration, fresh context, enforcement |
| [Asset registry strategy](../strategies/ai-asset-registry.md) | Approved source-controlled asset metadata, immutable resolution and activation |
| [Context systems](../strategies/agent-context-systems.md) | Authority, provenance, authorization, bounded context compilation |
| [Quality control](../strategies/ai-assisted-code-quality-control.md) | Material evidence, independent verification and human acceptance |
| [Workflow evaluation](../strategies/agent-workflow-evaluation.md) | Representative cases, repeated trials, rollout and rollback gates |
| [Pipeline optimization](../strategies/agent-pipeline-optimization.md) and [token efficiency](../guidelines/agent-token-efficiency-guideline.md) | Accepted outcomes, selective loading, bounded work and cost |
| [Documentation guideline](../guidelines/ai-documentation-guideline.md) | One authority per contract; retire this implementation plan after delivery |

Migration must address two observed mismatches, not preserve them accidentally:

1. The workflow trigger covers skill files and two guideline paths, while the helper additionally recognizes `.agents/skills/` and `guidelines/skill-security-checklist.md`. The helper does not recognize `.claude/skills/`. Define the intended discovery-path policy once, cover discovery-only changes, and align trigger coverage with it. Do not introduce a missing guideline merely because the helper names it.
2. The workflow permits the changed guideline to serve as review criteria. Preserve the ability to assess a proposed guideline, but distinguish that content from the trusted policy authorizing the run. A PR cannot grant itself tools, fix permissions, or asset approval by changing a guideline or the review skill.

## Platform evidence and feasibility gates

The initial planning investigation inspected repository sources and official documentation. `gh aw version` returned **v0.81.6**. No workflow was compiled or executed during that initial planning step; later historical experiments are recorded below. Upstream documentation is evidence of documented capability, not proof that this installed version supports it. The following distribution and hardening gates apply to the broader roadmap, not activation of the current artifact-only pilot.

| Capability | Documented constraint | Design consequence |
| --- | --- | --- |
| Reusable invocation | `workflow_call` is supported; Actions invokes generated YAML, not the Markdown source [1, 2] | Prefer a pinned shared `.lock.yml` callee with a small consumer `.yml` caller |
| Cross-repository loading | Callee content retrieval and private-repository access need explicit support; `inlined-imports: true` can avoid runtime import checkout, but cannot combine with `.github/agents/` imports [3] | Prove access, consumer checkout, and shared asset/helper loading in two repositories before adopting this distribution mechanism |
| Configuration | Imports and capability-bearing frontmatter are compiled; conditional frontmatter imports are unsupported [3, 4] | Runtime configuration selects within a compiled capability boundary; it cannot dynamically install arbitrary plugins or change engine identity |
| Codex enforcement | The engine matrix does not provide per-command Bash allowlist enforcement for Codex [4] | Do not call the Bash list a security boundary. The current pilot permits normal checkout/temp writes; stronger filesystem, credential and network claims need independent future proof |
| Extensions | Plugin support is experimental and engine-specific; Codex/Claude custom-agent imports are prompt text, not equivalent native agent delegation [5, 6] | Validate each advertised asset kind; do not label loading a role document as running a specialist agent |
| Local execution | `gh aw run` dispatches Actions and `trial` uses a remote repository [7] | Implement a real local Codex entry point using the shared contracts; do not call remote dispatch local review |
| Fix PR targeting | `create-pull-request` defaults to the original PR's base, not its head branch; runtime base selection requires an allowlist [8] | Bind publication to the verified original head repository/branch, not model-selected defaults |
| Forks and secrets | Fork opt-in does not supply provider credentials or writable GitHub tokens [9, 10] | Provide a maintainer-authorized trusted dispatch path and artifact delivery; never solve this by running untrusted code with privileged credentials |
| Fix CI and protected paths | Created PRs do not trigger CI by default with normal workflow credentials; protected-file rules can reject instruction/config changes [8, 11] | Prove fix verification/CI triggering and skill-file publication explicitly; no global protected-file bypass |

**Decision gate:** first prove central reusable invocation with the selected `gh-aw` release. If it cannot safely load the required approved assets or serve the intended consumers, propose pinned shared imports with consumer-side compilation instead. Do not implement both distribution systems speculatively or silently switch to an unshared workflow copy.

## Architecture

### Current private pilot

```text
trusted manual consumer + PR/configuration + explicit API-key mapping
                         |
authenticated called release -> immutable Git scope/criteria/evidence packet
                         |
standard gh-aw Codex/AWF -> bounded incremental structured reviewer result
                         |
host partial retention -> clean result/evidence validation -> JSON/Markdown
                         |
configured evidence readiness + remaining human decisions; never auto-merge
```

No candidate-code execution, native diagnostic dependency, specialist/plugin prerequisite or repository-writing output belongs to this path. Deterministic orchestration is implemented; the operational guide distinguishes local proof from remaining release/runtime gates.

### Future full review/fix architecture

The remaining architecture and contracts describe the broader roadmap except where the operational guide records implementation. They do not make specialist activation or fix publication prerequisites for evidence-bearing review-only delivery.

```text
PR caller / manual Actions dispatch / local Codex entry point
                         |
             trusted configuration + exact change snapshot
                         |
             deterministic scope and context preparation
                         |
             approved candidate discovery and bounded routing
                         |
             fresh, read-only review sessions
                         |
             consolidate, verify, validate structured report
                         |
             report / comment / job summary
                         |
             fix authorization gate (optional)
                         |
             one isolated repair writer -> checks -> fresh final review
                         |
             validated draft fix PR or patch -> human acceptance
```

### Shared logic versus execution

- **Shared procedure:** orchestration and evidence expectations, referencing domain skills and the existing review specification. Keep it free of GitHub event expressions so local Codex can consume the same body.
- **Deterministic helper:** configuration validation, immutable source resolution, Git snapshots, scope partitioning, routing constraints, result validation/rendering, and publication checks. No LLM judgment hidden in path scripts.
- **GitHub entry points:** separate reusable review-only and fix-capable workflows. Separation prevents a review-only run from having a code-writing safe output merely because the same workflow supports fixes.
- **Local entry point:** invoke fresh `codex exec` sessions with explicit sandbox settings and structured output [12]. Use the same preparation, policy, domain procedures, and result contract. Pin and verify the CLI version; do not inherit uncontrolled user plugins, MCP servers, or executable repository configuration.
- **Consumer:** owns event triggers, configuration, allowed context/assets, authentication references, and whether fix generation is permitted. Execution occurs in the consumer's Actions context; centralized maintenance does not require uploading private repositories into a central service.

Keep the number of components proportional: use existing Node/Git conventions, source-controlled JSON, native Actions jobs/artifacts, and the selected engine. Separate specialist sessions only where responsibility and independent evidence justify them.

## Configuration contract

Use a versioned `review.config.json` in each consumer. Shared profile defaults and approved asset metadata are source-controlled, pinned release data, not a running registry. A consumer can reference a shared profile or define a repository-owned profile without modifying orchestration.

### Simple consumer experience and extension boundaries

The normal setup is one thin caller pinned to a shared release plus one small configuration file. A team selects shared profile/checklist IDs, points to its existing requirement/context sources and validation commands, and leaves fixes off unless needed. Teams should not need to author prompts, agent manifests, plugin configuration or the full schema for ordinary use. Shared defaults supply limits, report formatting and routing; advanced overrides remain optional and their effective values are inspectable.

Support three configuration paths: use a shared profile unchanged, extend a shared profile with repository-specific criteria, or define a consumer-owned profile using the same contracts. Apply the same model to checklists. Keep requirement text in the existing ticket/specification and reusable quality criteria in their maintained source; configuration references them instead of creating a second requirements database.

Extensibility means stable boundaries, not a universal plugin framework:

- **Policy:** profiles and checklists compose through stable IDs and explicit overrides. Required organization controls cannot be removed or weakened by a consumer/run override; duplicate conflicting IDs and unknown required fields fail validation.
- **Judgment:** approved skills/agents implement additional review purposes against the shared task/result/evidence contract. The checklist states the property to establish; routing selects who reviews it.
- **Evidence:** reuse declared commands, existing CI results, source analysis and human decisions first. An additional evidence producer must return the same provenance-bearing result; new executable integrations still require capability review and explicit approval.
- **Compatibility:** version the configuration and result contracts, declare supported versions, and test shared releases against representative consumers. Schema-breaking updates need an explicit migration and new consumer pin, not a silent reinterpretation of existing checklist results.

No consumer-maintained workflow fork, custom scheduler, new service, generic rule language or new source folder is required for a new profile/checklist. Adding an executable tool beyond the deployed capability boundary remains a deployment change, not a configuration shortcut.

### Configuration areas

| Configuration area | Required behavior |
| --- | --- |
| `schema_version`, profile IDs | Reject unknown versions, unknown keys, unresolved references, and incompatible shared releases before invoking the model |
| `profiles` | Purpose, applicable path/change signals, review procedure and rubric references, required/optional reviewer roles, output judgment mapping |
| `scope` | Include/exclude rules, comparison mode, generated/binary/submodule policy; exclusions must not suppress a detected mandatory risk review |
| `context` | Trusted repository guidance paths, optional intent/spec references, affected-source/test retrieval rules, permitted external sources, byte/file limits |
| `assets` | Approved sources and exact versions, allowed kinds/capabilities, required assets, routing mode, candidate and selection limits |
| `routing` | `explicit`, deterministic `rules`, or `hybrid`; hybrid is the recommended default, bounded by mandatory rules |
| `validation` | Required and conditional command IDs resolving to trusted executable/argument arrays, working directories and timeouts; never arbitrary shell from a PR body |
| `acceptance` | Shared/team checklist references or definitions, requirement-source references, applicability, evidence requirements and authorized human-decision roles; separate acceptance readiness from review judgment and merge permission |
| `limits` | Reviewer count/concurrency, elapsed time, context/output size, model usage where enforceable, repair passes and changed-file/patch limits |
| `reporting` | Advisory/check behavior, severity threshold, comment versus artifact destinations, retention and sensitive-output constraints; mandatory scope/context/routing visibility cannot be disabled by selecting a terse presentation |
| `fixes` | `off`, `automatic-proposal`, or `approval-required`; permitted finding categories/severities and paths, required verification, draft PR or patch delivery |
| Runtime deployment | Evaluated Codex/model configuration, approved plugins/tools/network, inference authentication references; capability changes require reviewed deployment configuration and recompilation |

Resolution order: organization/runtime capability ceiling -> pinned shared defaults -> approved consumer configuration -> permitted per-run choices. Consumer configuration may specialize profiles; per-run choices may select or narrow authorized behavior, never raise authority. Emit effective values and their sources. Credentials never appear in the configuration document or report.

For PRs, load executable policy/configuration and helper code from an explicitly trusted revision, normally the destination branch's resolved base SHA, independently of the PR checkout. A candidate configuration changed by the PR can be reviewed or dry-run as data; it cannot authorize itself. For local runs, use an explicitly trusted configuration revision, report it, and require deliberate approval to activate changed configuration. The shared workflow/helper/profile package must resolve to the called release, not mistakenly to the consumer's `github.sha` or an unpinned default branch.

Minimum caller interface: configuration path, profile selection, PR identifier **or** explicit base/head refs, and requested review/fix mode. Accept only known IDs and validated scalar inputs. Remote manual review without a PR produces artifacts and a job summary; it does not invent a comment target. A manual request carrying a PR number resolves its current refs through the API and follows the same provenance checks as a PR event.

### First profiles

1. **Skill review:** references the existing `review-agent-skill` package and guideline, includes skill-owned helpers/assets and invocation/discovery changes, and preserves the existing skill-specific judgment. Guideline/template changes also route here. Skill helpers that change behavior additionally require relevant functionality/test/security coverage; a skill-text change does not automatically require all six code-review roles.
2. **General change review:** uses the logical roles and routing in the existing change-review specification, with repository-specific rubric and validation references. Verify on an actual second repository with no dependency on this repository's `skills/` layout.

Both use identical orchestration and result handling. A third profile must be possible through configuration and an approved procedure/role reference, without a new workflow implementation.

Shared profiles/checklists are defaults, not a closed list. Demonstrate a consumer-defined checklist and a third review purpose using only consumer configuration and an approved existing procedure; the shared workflow source must remain unchanged.

## Exact change and context contract

Preparation produces a versioned review packet, not just a concatenated prompt:

- Repository identity, run ID, trigger, intent/acceptance criteria when supplied, selected profiles, and policy/shared-release/configuration digests.
- Original base/head repository, branch and commit identities; resolved merge base; comparison semantics; local snapshot digest where applicable.
- Changed files with change kind and old/new path, reviewed files, skipped files with reasons, actual diff hunks or identified bounded segments, and coverage limitations.
- Context references with source revision/digest, path or URL, relevant ranges, trust classification, and reason for retrieval.
- Routing candidates/decisions, allowed capabilities, required evidence, and externally enforced limits.

Comparison rules:

- **PR:** use the merge-base-to-head diff (`base...head` semantics), not the synthetic merge checkout or `git status`. Resolve both commits and fail visibly if history is insufficient.
- **Explicit revision review:** distinguish three-dot change review from an explicitly requested two-revision comparison; record which was used.
- **Local uncommitted:** default to the captured index/working-tree state against `HEAD`; an explicit base can include committed branch changes too. Preserve staged and unstaged attribution, but review the composed final content rather than double-counting overlapping patches. Include only explicitly selected untracked files; never silently ingest ignored files or credentials.
- Use NUL-safe Git output and structured parsing for unusual filenames, additions, deletions, renames, file-mode changes and symlinks. Disable external diff/textconv execution. Represent binaries and submodule pointer changes explicitly; do not silently claim their contents were reviewed. Do not follow symlinks outside authorized roots.
- Capture content consistently and detect concurrent modification during snapshot creation. A changed snapshot is retried within the configured limit or reported incomplete, not mixed into one review.

Retrieve changed hunks and sufficient surrounding source first, then affected callers/contracts/tests and relevant maintained guidance. Use existing symbol/search tools if available. An already approved graph plugin may enrich impact context, but must declare freshness/coverage and ground claims in source; [graph-assisted review](../strategies/graph-assisted-code-review.md) does not require introducing graph infrastructure.

Discover metadata before loading asset bodies. Record context assembly and retrieval according to the observability contract below; distinguish observed delivery from model-reported use. Missing critical context, access denial, unresolved source contradictions, and context-limit omissions remain visible. Large changes can be partitioned into bounded coherent scopes with aggregate coverage; an omitted required scope makes the review incomplete, not clean.

## Asset discovery, selection and execution

A skill is a procedure, an agent is a bounded specialist role, and a plugin is an executable capability package. They are not interchangeable selection labels.

1. Resolve only approved configured catalogs/paths/repositories at exact revisions. Reuse existing package metadata where available; a small source-controlled profile/asset index stores only missing deployment/routing information and references the source body.
2. Before loading full instructions or installing anything, validate identity, owner, source/version/digest, complete-package inventory, compatibility, required tools/network/data access, permitted side effects, and approval/evaluation reference. Review transitive dependencies and hooks as part of admission. An approved source does not make every later version approved.
3. Deterministically filter incompatible, revoked, unapproved, overprivileged and irrelevant candidates. Mandatory profile rules select required coverage; unavailable required coverage yields `incomplete`.
4. For hybrid routing, give the model the compact eligible catalog and actual change signals. It may rank optional candidates and identify additional risks, but cannot drop mandatory coverage or expand permissions. Ambiguous security/behavior signals get conservative review or an explicit incomplete result, not a silent skip.
5. Validate the routing result outside the model. Record selected and skipped eligible candidates, matched signals, policy/rule source, reason, and resolved version. Avoid loading the entire catalog into every specialist session.
6. Activate only selected, authorized capabilities. Skills can be supplied as pinned procedure content; agents require real isolated review sessions and an evidence-bearing output contract. Plugins with startup hooks or tools need supported native activation inside the approved execution boundary.

For future plugin support, compilation/installation and per-run activation are separate concerns. If the chosen runtime cannot prevent an unselected plugin's hooks/tools from activating, select a reviewed compiled capability variant before starting the run; do not install a union of all consumer plugins and call it least privilege. Before advertising this capability, prove the path with one real approved plugin and one real specialist session in CI and locally. Unsupported required capabilities block that future profile instead of becoming prompt-text imitations. The current pilot does not activate or claim these capabilities.

External/network context is separately allowlisted and authorized before ingestion. PR descriptions, comments, changed files, retrieved documents, test output, and candidate asset packages are untrusted evidence. They cannot supply instructions that override the workflow's trusted policy or permission boundary.

## Reports and failure semantics

Produce a machine-readable report and deterministic Markdown rendering. The scope lists come from preparation, not model reconstruction. Preserve the current complete-comment behavior for every nonempty in-scope skill review, including clean reviews. No-op is valid only for a proven empty scope, with a reason.

The result includes:

- Execution state (`completed`, `incomplete`, `failed`, `cancelled`, or `skipped`) separately from assessment and profile-specific judgment. A completed review with defects is not a clean review.
- Exact reviewed snapshot, effective configuration, context/coverage gaps, routing decisions, reviewer terminal states, and runtime/model/asset versions.
- Findings with stable identity within the snapshot, category/severity, path and revision/line side or section, triggering condition, impact, source evidence, verification state, and bounded remediation direction.
- Deduplication by root cause/location/impact while retaining sources and disagreement; no cosmetic findings or positive findings padding a clean report.
- Command/check evidence with `passed`, `failed`, or `not run`, plus actual exit result and reason. Schema validation proves shape/provenance, not that an LLM judgment is true.
- Requirement/checklist item dispositions with evidence links and verifier type, overall acceptance-evidence readiness, and unresolved human decisions; keep these separate from the profile's defect-review judgment and observed repository merge conditions.
- Fix authorization, finding dispositions, validation/final-review evidence, remaining risks, and proposal/patch location if any.

Map generic passing states to the existing review specification explicitly; preserve skill judgments such as `Ready` and `Changes requested` as profile output. Never infer `Ready` from an empty/missing model response. Invalid output, missing required reviewers, truncation, failed required checks, or unavailable evidence cannot produce a passing check. An advisory run may report these without blocking merges, but must not disguise them as successful completion.

Key publication identity by repository, PR, reviewed head SHA and profile set. Cancel superseded compute and prevent late reports from overwriting the current result. Use native safe comment update/deduplication when supported, retaining per-run artifacts. Bound report size and link to the complete authorized artifact rather than silently dropping findings. Keep logs/artifacts consumer-scoped with configured retention; do not publish secrets, raw provider credentials, or hidden reasoning.

## Team acceptance checklists and merge readiness

### Requirement-to-evidence contract

Combine two inputs: **change-specific acceptance criteria** from the declared requirement source and **reusable team quality checks** from the selected profile/checklist. Requirements state the intended outcome; a checklist states how the team expects that outcome and relevant quality boundaries to be evidenced. Do not derive intended behavior solely from the implementation and then certify that the implementation matches itself.

Each checklist item needs a stable ID, criterion/source reference, applicability condition, required/advisory designation, accepted verification method, and evidence requirement. Where human judgment is required, identify the responsible role. Use short observable criteria such as “an unauthorized request cannot change another user's record,” not unrestricted claims such as “security is good.” Reuse existing tests/CI; do not create a new test merely to tick an item.

Requirements may come from an issue, repository specification or a team-approved PR section. Record the exact source version/digest and its acceptance authority. The model may propose a decomposition into checkable criteria and map evidence to it, but cannot invent missing requirements, silently omit a criterion, weaken an expectation or approve its own interpretation. Missing or ambiguous criteria become an explicit gap or human decision. A review-only profile can still report defects without a requirement source; it cannot claim the unspecified requirement is satisfied.

Checklist policy is loaded from the trusted configuration revision. Treat requirement prose as task evidence, not executable instructions. A PR that edits its own checklist cannot disable a required check for its current run. Changes to agreed criteria, checklist policy or requirement-source content invalidate affected readiness even if the code SHA is unchanged; the next assessment records the new source and decision.

### Evidence-bearing item results

For each applicable item, link `requirement/checklist ID -> affected behavior/source -> verifier -> observed evidence -> disposition`. One evidence record may support several criteria only where its observable coverage supports each claim. A passing suite name alone does not establish every acceptance criterion; inspect what the relevant test/check actually demonstrates, including tests changed by the PR.

| Item disposition | Meaning |
| --- | --- |
| `satisfied` | The accepted verification method produced sufficient evidence for this bounded criterion; record whether that method was execution, model-assisted review, human decision, or a required combination |
| `failed` | Evidence demonstrates that the criterion is not met |
| `unverified` | Required evidence is missing, stale, inaccessible, inconclusive, or the verifier failed to run |
| `human_decision_required` | Product intent, risk acceptance or a required specialist decision remains unresolved |
| `not_applicable` | A policy-supported applicability decision excludes this item, with recorded reason; not a substitute for a failed or unavailable check |

Do not present model-assisted review as executable proof. A model can assess a bounded maintainability criterion with source evidence, but cannot satisfy a required runtime check merely by stating the code looks correct. Deterministic aggregation validates required evidence, identity and state; it does not prove subjective judgments true. Confidence scores, green-check percentages and a majority of passing items cannot override one unmet required criterion.

Evidence records identify the producer, actual check/test or human decision, outcome, covered criterion, environment, source/head or integration-test revision, and artifact/permalink. Verify reused CI evidence through an approved workflow/application identity and its actual completion/conclusion; a same-named check or a URL supplied in PR prose is not sufficient. Missing, skipped, cancelled and pending required checks do not count as passing. Human acknowledgments identify the actor, authority, source and bound snapshot; an author-written checkbox is not automatically independent approval.

Illustrative PR presentation, not a universal team checklist:

| Criterion | Disposition | Evidence / remaining action |
| --- | --- | --- |
| AC-1: Intended behavior works | satisfied — execution | Relevant scenario result and exact tested revision |
| AC-2: Failure path preserves existing data | unverified | No suitable failure-path evidence yet |
| QUALITY-1: Change stays within intended scope | satisfied — review | Bounded source analysis linked to the requirement |
| POLICY-1: Required specialist decision | human_decision_required | Designated role has not approved this revision |

This example is **not ready**, despite two satisfied items. The report tells the engineer what remains rather than issuing a broad quality score.

### Readiness versus authority to merge

Publish a concise acceptance summary above the detailed review record: requirement/checklist versions, unmet items, evidence links, material residual risks and the next required human action. Compute readiness outside the LLM: `blocked` when a required criterion has failed or a blocking finding remains; otherwise `incomplete` when required scope/provenance/evidence is missing; otherwise `needs_human_decision` for an outstanding required decision; otherwise `evidence_ready`. Advisory items remain visible without pretending they are required gates.

`evidence_ready` means the configured acceptance-evidence contract is satisfied for the named snapshot, not guaranteed defect-free, approved by a peer, or permitted to merge. Keep review completion, profile judgment, acceptance readiness and repository merge conditions as separate fields. A later required acceptance check may succeed only for `evidence_ready`; its absence of findings alone is never the success condition.

Teams may eventually allow the engineer, including the PR author, to inspect this evidence and merge eligible changes without another discretionary review **where their repository rules permit it**. The workflow does not approve a PR on its author's behalf, bypass required reviews/CODEOWNERS, dismiss objections, alter branch protection, or merge automatically. Where independent review is required, it remains required. Unknown repository policy is reported as unknown, not interpreted as permission.

The team owns the eligibility policy. Low-risk classes can use lightweight human inspection; authentication, sensitive data, public contracts, migrations or other team-defined high-risk signals can require independent/specialist approval. These are not universally classified by the LLM or inferred from change size alone. The workflow cannot lower the applicable risk/control floor. Preserve any authorized risk exception as an explicit human disposition with its evidence and remaining risk; never relabel a failing technical check as passed.

Bind evidence/readiness to the head, relevant base/integration revision, requirement/checklist/configuration versions and approval snapshot. On relevant code, base, requirement or policy changes, recompute and invalidate stale conclusions. Expose what an external merge queue/required CI still has to verify. This workflow reports a snapshot, not a race-free merge authorization token; the repository's native checks and final human action enforce the current merge boundary. Post-fix evidence applies to the candidate fix snapshot and cannot make the original PR ready until the fix is accepted and the actual updated PR is assessed.

### Delivery and evaluation

Implement criterion mapping, item states and an advisory evidence checklist with the review-only path; do not postpone the data contract until automatic fixes exist. Enabling a required readiness check or an author-merge team policy is a later, separately approved adoption decision, not a prerequisite for using the workflow. This follows the repository's [risk-based human review](../strategies/ai-assisted-code-quality-control.md#risk-based-human-review) and [acceptance authority](../strategies/governed-agentic-development.md#acceptance-and-authority) guidance.

**Acceptance:** demonstrate a requirement with multiple criteria where one is missed despite green CI; ambiguous/missing intent; incorrect `not_applicable`; a weakened checklist in the PR; weak newly added tests; stale/spoofed CI evidence; changed requirements without a code change; required peer approval; and a fix proposal not yet accepted. None may become an unsupported `evidence_ready`. A positive case must let an engineer navigate from each required criterion to sufficient current evidence without reconstructing the review manually.

Measure false-ready judgments and missed criteria alongside engineer time to reach an approval decision, checklist setup/maintenance effort and regressions after acceptance. Do not optimize merge rate or speed at the expense of evidence correctness. Cohort-specific readiness/author-merge adoption requires repeated observed quality and explicit team approval; a successful pilot does not establish safety for every repository or risk class.

## Review observability and systematic tuning

Observability is part of the delivered review, not an optional debug mode. An authorized PR reader must be able to answer: **what exact change was reviewed, which context reached which reviewer, why those reviewers/assets were selected, what evidence supports coverage, and what differed from another run?** File access or context delivery does not prove model comprehension; the report must not imply otherwise.

### PR-visible review record

Every review comment and job summary includes a compact review record, with expandable lists where useful:

| Visible information | Required detail |
| --- | --- |
| Run identity | Run/attempt ID and link, reviewed head/base/merge-base SHAs, snapshot identity, profile set, and current versus superseded state |
| Exact scope | Changed paths with old/new names and change kind; separate in-scope, completed-review, partial/unreviewed and skipped lists, with reasons and reviewer ownership |
| Context | Source paths/URLs and exact revisions/ranges, source role (criteria, implementation, related test, intent, tool evidence), recipient reviewer, and delivery/observation status |
| Routing | Selected skill/plugin/agent identities and versions, selection reasons/rule sources, and relevant exclusions or unavailable required assets |
| Coverage and execution | Reviewer terminal states, required checks and actual results, denied/missing/truncated context, instrumentation gaps, elapsed time and measured usage where available |
| Acceptance evidence | Requirement and checklist item states, verification methods, linked evidence, readiness and remaining human decisions; no unsupported blanket “safe to merge” claim |
| Inspectable evidence | Links to the complete machine-readable report, human-readable report, relevant evidence, effective configuration and retained comparison runs |

Use commit-pinned source links, not moving branch links. Counts supplement exact lists; they never replace them. Keep reviewed artifacts separate from context-only files. A file assigned to a reviewer is not automatically a completed review: completion requires that reviewer's valid result and the required scope-delivery evidence, with partial coverage identified at hunk/section level where applicable.

For reports exceeding comment limits, show the limitation and a direct link to the complete lists; do not silently truncate. Verify artifact visibility for the intended reader. If a private-context source is not authorized for the PR audience, expose only policy-permitted metadata and the access limitation, never broaden access by copying it into a public comment/artifact. State retention/expiry and any resulting loss of reconstructability.

### Machine-readable evidence and provenance

Extend the already proposed packet/report schema and renderer rather than introducing another reporting service or competing source of truth. The generated review bundle contains `report.json` and its `report.md` rendering; source/evidence references are indexed from that report. These are runtime outputs, not additional committed repository files.

Required records:

- **Scope manifest:** exact comparison inputs, diff identity, per-path/hunk scope and coverage, and reasons for exclusions or partial review. Preserve the original and post-fix snapshots separately.
- **Context manifest:** stable item ID, origin, revision/content digest, path/range or external retrieval identity, trust classification, retrieval purpose, recipient session, delivery sequence, size and omission/redaction details. Index shared workflow instructions, applicable repository guidance, selected skill/agent bodies and references, initial packets, later tool results, and any known runtime-injected instructions or summaries—not only source files the reviewer cites.
- **Distinct observations:** record separately that an item was discovered/available, selected for a packet, delivered to a session, retrieved through an observed tool call, or cited in a finding. Preserve failed/denied requests. A search hit or directory listing is not a full-file read, and a tool's full result is not necessarily the excerpt delivered after truncation.
- **Runtime evidence:** correlate run, attempt, stage, reviewer session, tool/result, context item and finding IDs. Capture actual status transitions, command outcomes, selected asset activation, validation and publication outcomes through the orchestrator/runtime, not an LLM-written activity summary. Record missing measurement as unavailable, not zero.
- **Reconstruction boundary:** retain workflow/profile/configuration/asset versions and the effective review instructions or immutable references to them. Where authorized, retain the exact non-versioned/local input and delivered excerpts needed to reconstruct a run. Digests alone do not recover content. Record unavailable provider-internal context, unobserved reads, compaction effects and non-retained/redacted content as explicit limits.

Capture records incrementally so failed/cancelled runs retain the available evidence. Validate referential integrity and agreement between the prepared scope, delivered context, reviewer results and published summary. For a future workflow claiming this provenance contract, missing mandatory scope/context provenance makes the run incomplete; it must not receive a clean assessment simply because the LLM returned no findings. Establish what the chosen runtime can actually observe, including shell/plugin retrieval, before claiming support. The current pilot uses standard platform logs/artifacts and explicitly does not attest exact model-delivered context.

Collect only policy-approved inputs, outputs and operational events. Do not collect hidden reasoning, credentials, unrestricted raw environment dumps, or unrelated repository content. Filter native event streams before retention/publication. Repository access controls apply to the bundle as well as the PR comment. The same report contract applies locally, with explicit output paths instead of requiring a GitHub artifact.

### Comparison and tuning loop

1. From a questionable finding or missed issue, inspect its reviewed snapshot, reviewer, selection rule, context items and actual checks. Distinguish a scope miss, retrieval miss, incorrect judgment, routing failure, execution failure and missing observability using the existing [evaluation failure taxonomy](../strategies/agent-workflow-evaluation.md#failure-taxonomy).
2. Re-run the same captured change in review-only mode with an explicitly approved candidate configuration. Keep original inputs fixed where recoverable; never load today's branch or mutable external content while describing the run as the same snapshot. Record replay gaps and model/service changes. Reconstructable inputs do not guarantee identical LLM output.
3. Compare configuration, routing, delivered-context and finding changes alongside latency/usage and human adjudication. Link baseline/candidate run IDs and retain both reports even if the current PR comment is updated. Start with downloadable records and deterministic comparison in the proposed helper; no dashboard or persistent analytics service is required.
4. Change one material variable at a time where practical. Record the hypothesis and human disposition of findings (confirmed, false positive, duplicate, missed issue or unresolved), keyed to run/finding IDs; do not infer correctness from a merged PR or absence of objections.
5. Evaluate the candidate on retained clean and defective cases before promoting configuration/assets. Human feedback informs a reviewed update; it does not automatically rewrite or authorize the workflow's own policy.

**Acceptance:** a PR reader can identify every changed path's review disposition and trace a finding to its source context and reviewer without reading raw model transcripts. A fixture with an available-but-unread file, a retrieved excerpt, a truncated tool result and a failed reviewer must produce distinct truthful records. Two runs of the same snapshot with one routing/context-setting change must expose that difference and preserve both results. Missing provenance, inaccessible evidence, secret redaction, artifact expiry and superseded runs must have explicit observable outcomes, never an invented complete trace.

## Optional fixes and human acceptance

### Authorization and isolation

- `off`: no repair invocation and no code-writing publisher capability.
- `automatic-proposal`: trusted repository policy authorizes proposal generation after findings are independently verified.
- `approval-required`: an authenticated maintainer dispatch authorizes a specific PR/head/configuration and selected findings. Do not treat a free-text comment or a caller-supplied boolean as proof of authority. Use existing Actions authorization/environment controls where sufficient; a custom comment-command parser is not initially required.
- Local proposal generation requires an explicit user request even if the repository permits automatic PR proposals. Applying the local proposal remains a second decision.

Reviewers are read-only. Only the repair agent writes to an isolated candidate checkout/snapshot; it receives no GitHub write token. Tests and build scripts run in a disposable execution environment without inference/publisher secrets or access to the developer's unrelated files. A worktree alone is not a process/credential/network sandbox. Keep publication in a separate deterministic permission-controlled job; it does not execute candidate code.

Independently verify every finding selected for repair, including low-severity findings if a profile permits them. Repair only confirmed issues within authorized paths and limits. Run declared proportionate checks, recompute routing, and perform fresh final-diff review. Stop after the configured pass limit; missing validation or unresolved material findings remain reported. Preserve the original report and distinguish verified candidate fixes from changes already accepted into the topic branch.

### Same-repository PR delivery

1. Resolve the original PR's current **head** repository, branch and SHA using trusted API data. Start the fix candidate from that exact head, not the destination branch or merge commit.
2. Create only an automation-owned proposal branch and a **draft PR into the original head branch**. Enforce target identity, allowed source branch prefix, allowed files, patch limits and draft state outside the model. Do not use a broad base wildcard as the sole authorization check.
3. Immediately before publication, verify the original PR is open and its head/configuration/authorization still match. If stale, withhold publication and request a new review; no automatic rebase or retarget to `main`. Recheck after creation for the remaining race and mark a raced proposal stale; normal human acceptance/CI remains required.
4. The fix PR contains only repair changes and links to the original PR, findings, reviewed SHA, validation and final-review evidence. The original PR receives a link to the proposal. The owner accepts through normal human review/merge into their topic branch.
5. Verify how required CI runs. Prefer an explicitly approved short-lived GitHub App publisher where necessary; otherwise provide a maintainer-triggered check path and visibly report checks not yet run. Never claim a draft PR is validated merely because it exists.
6. Disable automatic merge, approval, direct `push-to-pull-request-branch`, issue-fallback publication, and recursive fix generation on automation-owned proposals. Regular CI and review of those proposals must still run. Do not bypass protected-file checks globally; blocked skill/instruction fixes remain inspectable patch proposals unless a narrow policy exception is explicitly approved and tested.

### Fork PRs and local delivery

For fork PRs without provider secrets or write access, provide a maintainer-authorized dispatch from trusted workflow code. Fetch the exact fork revision as data; run any candidate commands only in the isolated secret-free environment. Publish the report through scoped trusted output handling. Supply a fix-only patch with its parent SHA, digest, finding links, and application/verification instructions. The contributor chooses whether to apply it. Do not request broad contributor-fork credentials or silently target an unrelated upstream branch.

For local runs, materialize a private review snapshot outside the developer's worktree and generate fixes against it. Return only the repair delta, not the developer's pre-existing changes. Before applying a user-accepted patch, compare the live files/index to the captured snapshot; conflicts or concurrent edits require a new decision. The initial interface may leave application to the developer's normal patch tooling; it must never commit, stage, push, overwrite, or discard their work automatically.

## Proposed implementation structure

The table includes the broader proposed structure, not permission for future scaffolding. Current CI uses the caller/callee, generated lock, shared procedure, versioned schema, consumer configuration and deterministic helper with its pinned validator dependency. The former native experiment runner was removed; current helper/tests implement substantive review contracts rather than synthetic activation probes. The local adapter, profiles and fix callee remain future work.

| Path | Purpose |
| --- | --- |
| `.github/workflows/review-change.md` and generated `.lock.yml` | Shared read-only review callee |
| `.github/workflows/review-change-fixes.md` and generated `.lock.yml` | Separately authorized repair/proposal callee |
| `.github/workflows/review.yml` | Current manual-only private caller; broader PR triggers and orchestration are future work |
| `.github/aw/review-change.md` | Current trusted review procedure imported by gh-aw; a full local review entry point remains future work |
| `.github/aw/review-profiles.json` | Shared profile defaults and referenced approved asset metadata; no copied skill rubrics |
| `.github/aw/review-contracts.schema.json` | Implemented versioned configuration, packet, criterion/evidence, result and report contracts; routing is future work |
| `review.config.json` | Implemented consumer-owned bounded review-only criteria; not the complete skill-review profile |
| `scripts/review-change.js` | Implemented deterministic preparation, external evidence collection, result validation and rendering |
| `scripts/run-review-codex.js` | Proposed actual local review adapter sharing the review contracts; not implemented |
| `scripts/review-change.test.js` | Implemented regression cases for scope, authority, evidence, failure and readiness contracts |
| `docs/reusable-change-review.md` | Operational source of truth for the current manual pilot and its limits |

Modify the existing review skill only where needed to resolve caller-versus-asset source paths, trusted/proposed guideline handling, and generic report embedding. Keep its rubric authoritative. Update the existing review specification's explicitly affected boundaries; link the consumer guide from `README.md`. Remove the old skill-specific workflow/source lock and scope helper only after equivalent behavior is demonstrated and all callers migrate. Do not retain aliases or two active review workflows posting duplicate reports.

Generated workflows are compiler outputs, never hand-edited. Pin the compiler, runtime, actions, shared package and asset references, and test the exact release combination. Consumers reference immutable commits; human-readable releases describe compatibility. Local installation fetches only the required pinned package files into a controlled cache or uses an explicit trusted checkout, not a bulk mirror of this repository. The owner selected canonical private `jhakulin/ai-harness` for implementation and initial testing, with its existing CI snapshot copy to public `jhakulin/ai-native-engineering` as the eventual content-sharing path. That sync creates new commit identities and force-replaces history: supported public releases still require retained public commit pins and observed consumer/helper access, not private SHAs or mutable `main`.

## Observed verification

[Run 34083468582](https://github.com/jhakulin/ai-harness/actions/runs/34083468582)
started the previous pilot's AWF/Codex execution for PR #323 and reached inference.
All four attempts returned **“You have no credits remaining”**. Platform diagnostics
survived; no review report was produced. This establishes neither completion of
that review nor execution of the revised deterministic workflow.

The following PR #323 verification runs used **gpt-5.5**, before switching the
testing default to **gpt-5.4-mini**. The subsequent mini-model attempt and its
locally verified routing fix are recorded below; no successful mini-model review
has been observed in Actions.

| Run | Observed outcome |
| --- | --- |
| [34090015670](https://github.com/jhakulin/ai-harness/actions/runs/34090015670) | Inference completed, but blob IDs were used as citation revisions and criterion-source citations were missing. Validation rejected the result; raw output and incomplete reports were retained. |
| [34090823849](https://github.com/jhakulin/ai-harness/actions/runs/34090823849) | Corrected identities, but one citation crossed omitted lines between diff hunks. Validation again rejected the result and retained artifacts. |
| [34092438812](https://github.com/jhakulin/ai-harness/actions/runs/34092438812) | Shared commit `5856336f5e0cf63318ee4e4cec295c867f4e1e39` supplied explicit citation ranges. The workflow succeeded: six paths reviewed, no scope omissions, zero validation errors, `completed` execution and `no_findings`. |

The successful run published **`review-report-pr-323-1`** with `report.json`,
`report.md` and the original packet. Its `evidence_ready` status covers only the
three configured static-review criteria: there were no trusted execution or human
records. Inspection confirmed the six-file inventory, valid citation identities
and ranges, explicit runtime limitations, and no false defect based solely on
later supersession of this historical pilot. The workflow's historical read-only
permission declarations were also checked independently.

The two rejected runs demonstrate invalid-result handling and artifact retention,
not cancellation or runner-loss recovery. One successful historical case is a
functional smoke check, not a review-quality benchmark or proof of repeatability.

Local verification recorded for `aeea376`:

- All 30 contract regressions pass, covering divergent bases, renamed/binary
  paths, weakened candidate policy, omitted criteria/coverage, incorrect citations,
  stale/spoofed evidence, human decisions, incomplete scope and interrupted results.
- Prepared citation ranges support both diff sides and retained complete lines,
  while citations spanning an omitted hunk gap remain invalid.
- An actual finalizer CLI regression withdraws a formerly passing CI record after
  the same run's evidence changes to failure, while retaining independent findings
  and coverage. Required acceptance becomes unverified rather than discarding the
  submitted review; material findings still block readiness.
- Preparation over PR #323's real Git objects, using an unpublished local policy
  fixture, retained its six-file inventory. The actual finalizer CLI with absent
  model output retained cancelled/incomplete JSON and Markdown and exited 1.
- The resolver script accepted authenticated Actions run metadata and rejected
  invalid PR inputs before an API request. The compiled post-agent loader ran with
  a fixture GitHub contents response bound to the shared SHA: in-memory release
  code retained partial output on failure, omitted command output and did not
  execute a throwing helper in the consumer checkout. Invalid source responses
  were rejected. Bounded-reader regressions refused symlinks, oversized files and
  FIFOs without blocking.
- The derived model schema validates result records with 22 definitions rather
  than 49; serialized size fell from 25,937 to 6,153 bytes.
- Workflow compilation/schema checks and repository validation passed.
  These latest collector/freshness changes have local proof, not a new paid
  Actions run.

[Run 34148687811](https://github.com/jhakulin/ai-harness/actions/runs/34148687811)
attempted PR #331 review from shared commit
`a2df9fdf4d2786fe5c83f0d2ba42afc28234542a`. Codex 0.147.0 requested
`gpt-5.4-mini`, but AWF 0.27.11 expanded the `gpt-5` family alias before checking
the exact provider model. Its version sorting chose
`gpt-5-search-api-2025-10-14`, which the Responses API rejected with HTTP 400
(`model_not_found`). The retained provider catalog included `gpt-5.4-mini`.
No reviewer result was produced; the collector retained runtime diagnostics and
the report artifact correctly recorded failed execution, unavailable judgment
and incomplete readiness.

The earlier routing change pinned the reviewer sandbox to AWF **0.28.14**, whose
[resolver prefers exact available provider models over aliases](https://github.com/github/gh-aw-firewall/blob/v0.28.14/containers/api-proxy/model-resolver.js),
and set `model-fallback: false`. Codex and the requested model were unchanged.
Offline execution of the unchanged upstream resolver and request-body rewriter
used the failed run's retained catalog and the newly compiled AWF configuration:

- AWF 0.27.11 reproduced the search-model substitution.
- AWF 0.28.14 selected only `gpt-5.4-mini` and left the request body unchanged.
- Removing the exact model from the catalog still triggered family-alias
  substitution, despite disabling middle-power fallback. The fix is not a strict
  model allowlist; the operational guide no longer claims that guarantee.
- The isolated smoke test trapped middle-power discovery calls and made no
  provider requests. It exercised request rewriting, not the full Docker/Actions
  runtime. No new paid run was dispatched.

[Run 34188416929](https://github.com/jhakulin/ai-harness/actions/runs/34188416929/job/101941526089)
failed earlier, at AWF installation: the override used `0.28.14` rather than the
release tag `v0.28.14`, so the checksums download returned HTTP 404. Codex execution
was skipped; this run did not exercise model routing.

The subsequent user-requested change selects **`gpt-5.6-luna`** and corrects the
AWF release tag to **`v0.28.14`**. The compiled installer tag was used to download
the real checksums and bundle assets (both HTTP 200); the SHA256 matched and
`node awf-bundle.js --version` returned `0.28.14` with exit 0. The compiled proxy
configuration and retained provider catalog also preserved the exact Luna request
body in the upstream request rewriter. These checks did not execute the complete
Linux installer or Docker/Actions runtime, and no paid review was dispatched.

[Diagnostic run 34334275526](https://github.com/jhakulin/ai-harness/actions/runs/34334275526)
compared Codex 0.142.1/0.147.0 and AWF v0.27.11/v0.28.14 on Ubuntu 24.04.
Both Codex versions emitted `thread.started` and `turn.started` under AWF
v0.27.11 without explicit stdin redirection. Under v0.28.14, both inherited
an open input pipe and blocked before their first thread event.

The owner chose to match skill review rather than retain a stdin workaround.
The runtime alignment initially retained the Luna model override while removing
custom engine arguments, runtime pins, and sandbox overrides.
With gh-aw 0.81.6, compilation selects Codex 0.142.1 and AWF v0.27.11 and emits
the same Codex launch command as skill review. The Linux diagnostic used no
configured provider credentials and a loopback-only model endpoint. It verifies
startup for this runtime combination, not a paid end-to-end Luna review.

[Run 34436790324](https://github.com/jhakulin/ai-harness/actions/runs/34436790324/job/102743681376)
then started Codex successfully but failed the model request. Codex 0.142.1 warned
that Luna metadata was missing; the API subsequently rejected
`gpt-5-search-api-2025-10-14`, although the launch requested `gpt-5.6-luna`.
The owner therefore requested the same model as skill review as well. The source
now uses `engine: codex` without a model override, giving both workflows identical
model-variable precedence and the `gpt-5.4` default. The later owner-started run
below exercised that alignment.

[Run 34437989062](https://github.com/jhakulin/ai-harness/actions/runs/34437989062/job/102748214328)
completed the model turn and uploaded the deterministic report, but finalization
exited nonzero: evidence E1 used the guide's blob SHA instead of the prepared
head commit for two citations. Its packet also classified absent applicable
requirements as an input omission, conflating source-review completion with
acceptance readiness.

The finalizer now resolves blob citations only through an unambiguous trusted
path/side/retained-range mapping and records conversions without changing raw
model output. Invalid or ambiguous citations remain rejected. Preparation records
absent applicable requirements as a limitation, while finalization independently
keeps acceptance readiness incomplete. Missing content and failed runtime still
prevent completed execution.

Local verification replayed the untouched retained result with zero validation
errors. Re-preparation at the exact original Git revisions preserved files,
contexts, criteria and policy digest; only the new packet identity was copied
into a local replay result. The actual finalization CLI, with live GitHub
freshness checks, exited zero and produced `completed` / `no_findings` /
`incomplete`. Repeated finalization of the same inputs was deterministic.
The 32 review regressions passed, including pre-fix failures for blob citations
and quality-only execution, and rejection of wrong paths, absent sides and
unsupplied lines. This is local finalization proof, not a new paid review or a
claim that the model's source-level judgments are correct.

The manual review/report path and invalid-result artifact delivery are now
observed in Actions. Broader review quality, live external evidence, forced
cancellation/runner-loss recovery and supported cross-repository release reuse
still need their own evidence.

## Implementation sequence and acceptance gates

### Revised milestones — current implementation order

The owner accepted this sequencing adjustment with the review feedback. It moves
proofs to the capabilities that need them; it does not delete requirements or
declare any earlier gate passed. The original phases and investigation below
remain traceability records, not a prerequisite chain for new implementation.

| Milestone | Required proof and original-plan mapping |
| --- | --- |
| Working manual pilot | Completed real review and downloadable report; known-defect and clean cases; interrupted/missing-output and publication-failure behavior; PR-specific cancellation. Uses the execution portion of original Phase 1 and the initial delivery/evaluation portions of Phases 3 and 5. |
| Reusable evidence-bearing review | Retained pinned release and real application consumer; small configuration; deterministic packet; validated JSON and rendered Markdown; criterion evidence and readiness; inspectable provenance. Implements Phase 2 contracts and the corresponding reuse, reporting and evaluation requirements of Phases 1, 3 and 5. |
| Complete review-only delivery | Actual local uncommitted-content review without changing files/index; mandatory specialist routing and terminal states; independent finding verification; PR-visible reporting and skill-workflow parity. Completes the corresponding Phase 1 runtime proofs and Phase 3 requirements. |
| Authorized fixes and rollout | Separately authorized repair/publication, one writer, required checks, fresh final review, topic-target/fork/local delivery, repeated evaluation, migration and rollback. Implements Phase 4 and the remaining Phase 5 requirements, including the original Phase 1 fix-publication proofs. |

Billing blocks paid inference, not deterministic preparation or contract work.
The evidence-bearing implementation may proceed alongside pilot evaluation; its
exit still requires the real review and second-consumer evidence above. Release
publication, another repository's configuration, and paid dispatch require their
corresponding owner authorization. No copied workflow or synthetic consumer is
proof of supported reusable consumption.

Start evaluation with each capability, not after all implementation. The
evidence-bearing milestone must reject unsupported readiness for missed criteria
despite green CI, ambiguous intent, incorrect `not_applicable`, weakened
checklists/tests, stale or spoofed CI, changed requirements without code changes,
and outstanding required human approval. Include positive evidence-bearing cases
and model/publication interruption. Measure usable findings, known misses, false
positives, false-ready conclusions and human decision effort; compilation and
green jobs are infrastructure evidence only.

Preserve the acceptance contract's deterministic precedence:
`blocked` → `incomplete` → `needs_human_decision` → `evidence_ready`.
Keep execution, defect judgment, evidence readiness and merge authority separate.
PR code remains non-executable in this reviewer. Runtime-required criteria need
authenticated, revision-bound existing CI evidence or remain unverified.

Use packet generation and supported runtime events for provenance; distinguish
available, prepared, observed, known-delivered and model-cited material. Report
missing/denied/truncated/unobservable context and the coverage claims it prevents.
Do not restart the custom sandbox project or invent provider-context attestation.
Plugins and stronger isolation remain gated until needed and demonstrated, but
do not block unrelated review-only functionality.

### Phase 1 — Prove the execution and reuse boundary

**Historical sequencing, not the current dependency order.** This combined feasibility gate remains unmet. The revised milestones above assign each proof to the capability that needs it; plugin activation and fix publication are not prerequisites for deterministic review-only contracts.

- Approve this structure, select/pin the compatible `gh-aw` and Codex versions, and reconcile the existing review specification as described above.
- In disposable repositories, compile and run a reusable callee plus two consumers. Include the intended private/cross-organization boundary if applicable. Prove correct event/ref handling, trusted configuration, consumer checkout, shared helper/profile/body retrieval, explicit secrets and comment destination.
- Prove local Codex read-only review, separate specialist invocation, and selected-only activation of one approved plugin. Verify no unsupported custom-agent import is advertised as delegation. Prove denied writes/egress and credential isolation in both runtimes.
- Prove context-delivery and tool-evidence capture for initial packets, later shell/plugin retrieval, truncation and runtime-injected context. Compare emitted records with known fixture inputs; model self-report alone is not observability proof.
- Create a disposable fix PR into a topic branch, not `main`; exercise protected skill files, CI triggering, unavailable fork access, and a branch-advancement race.

**Exit:** observed runtime evidence supports the chosen distribution/security mechanisms. Capability gaps have a concrete approved resolution before production implementation; a successful compile alone is insufficient.

#### Historical initial feasibility investigation — 2026-09-06

**Historical gate: not passed.** At the end of the initial local investigation, no production
replacement, shared release, remote resource, proposal PR, commit, or push was
created. The skill workflow and scope helper were unchanged. The following records
describe that investigation, not the current manual pilot's activation requirements.

**Deployment facts and authority**

- `origin` resolves to the private canonical repository `jhakulin/ai-harness`,
  default branch `main`; the authenticated account has `ADMIN` access. GitHub's
  Actions access API returned `{"access_level":"none"}`. Administrative capability
  is not authorization to change this setting or publish fixtures.
- Repository secret metadata includes `OPENAI_API_KEY`; no value was inspected.
  This does not prove consumer inference authorization, private shared-package
  access, or a scoped publisher App. No approved pinned plugin/specialist package
  or second pilot owner was found in the referenced repository sources.
- At that point the owner chose **local evidence only**, **keep remote execution
  blocked**, and **leave activation gate blocked**. This restriction was later
  superseded for the standard AWF manual pilot. Two-consumer,
  cross-organization/GHES, publisher and approved plugin/specialist evidence
  remain unexercised requirements for those future capabilities.

**Exact versions investigated**

| Component | Observed identity | What is established |
| --- | --- | --- |
| Installed compiler | `gh aw version`: `v0.81.6`; upstream commit `eed4304d8740f0593f2797276cb8299d228ffd9b` | Compiler used in disposable fixtures; the user's installed extension was not repinned or upgraded |
| Installed local runtime | `codex-cli 0.147.0`; upstream commit `be6e8eac029b183056b7e4402879f15d2c85f61b` | Native CLI/sandbox and real `exec` runs exercised on macOS; binary digest retained with evidence |
| Existing generated CI | Codex `0.142.1`, compiler `v0.81.6`, AWF `v0.27.11` | Inspected generated source, not a run of this combination |
| Compile candidate | Explicit `engine.version: "0.147.0"` | Emitted lock metadata and npm installation use `0.147.0`; Linux/CI compatibility is unproven |
| Probe inference | Explicit `gpt-5.5`, existing local ChatGPT authentication | Three fresh successful synthetic sessions; not an approved production model or plugin/specialist evaluation |

The CI default `gpt-5.4` returned HTTP 400 with the local ChatGPT login
("not supported"). The locally configured `gpt-6-astra` returned HTTP 400
("requires a newer version of Codex"). Both emitted `turn.failed` and exited 1.
`gpt-5.5` was selected explicitly from this binary's bundled catalog for synthetic
probes only, not as a silent deployment fallback. At that stage a compatible
deployment combination had not been selected. Subsequent API-key/Ubuntu review
runs used Codex 0.147.0/gpt-5.5; the operational guide records their outcomes and
the later switch to the lower-cost testing default.

**Observed experiments**

| Experiment | Actual result | Boundary still unproven |
| --- | --- | --- |
| Reusable callee with typed `workflow_call` inputs, explicit secret mapping, ordinary inlined procedure import, and pinned engine version | `gh aw compile review-change --no-check-update` exited 0; generated YAML contains the shared body marker and declared inputs/secrets | Actions invocation, event/ref resolution, trusted configuration and comment destination in two consumers |
| Separate immutable shared checkout plus consumer checkout | `gh aw compile shared-checkout-probe --no-check-update` exited 0; fixture names canonical revision `f91aeba5e2141d947365807b71d54b151ab86d84` and `.review-shared` path | Private checkout authorization and actual shared helper/profile/package delivery; inlining a body is not helper delivery |
| Native gh-aw plugin frontmatter | Adding `plugins: []` caused compiler exit 1: `Unknown property: plugins` | Local `codex plugin` exists, but real approved selected-only activation in either runtime was not attempted |
| Draft topic-target proposal policy | `gh aw compile fix-probe --no-check-update` exited 0 with `draft: true`, `base-branch: phase1-topic`, proposal branch/path limits, protected-files blocked, and issue fallback disabled | Actual topic-target PR, fix-only delta, protected skill files, CI triggering, unavailable fork access, and branch-advancement race |
| Built-in Codex `:read-only` sandbox | In-scope read allowed; write and TCP connection denied; out-of-scope synthetic credential-canary read **allowed** | Built-in read-only is insufficient for the plan's read/credential isolation boundary |
| Restrictive native permission profile | `:minimal` plus read-only workspace roots and network disabled allowed the fixture read, denied write/out-of-scope canary/TCP connection with errno 1 | Other operating systems, arbitrary hostile tools/plugins, and CI containment |
| Actual Codex execution under that restrictive profile | Fresh session ran the trusted negative-test fixture; command exited 0 and reported the same denials plus no inherited credential-variable names, including a synthetic parent-process secret canary | This is bounded canary evidence, not a universal credential-isolation proof |
| Fresh synthetic review sessions | Three distinct `thread.started` IDs, successful terminal events, observed commands, exact stdout, exit results and usage; all fixture file digests unchanged | Approved specialist asset semantics and CI execution remain blocked; a role prompt is not claimed as native custom-agent delegation |

Successful compiles emitted **unapproved restricted-secret warnings**. Those
warnings were retained, not suppressed with `--approve`, and are not deployment
authorization. The compile fixtures are not runnable production implementations.
No fixture consumer was published and no two-consumer run is claimed.

**Observability result: native `exec --json` alone is unsupported for the exact
context-delivery contract.**

- Initial packets, invocation/configuration identities, fixture inventories and
  digests were retained by the probe controller. This proves supplied inputs,
  not the exact provider request or model comprehension.
- A known fixture distinguished an available file with **no observed retrieval**,
  the observed `sed -n '2p' input.txt` excerpt (`line two`), and an observed
  missing-file read with exit 1. Model-access claims were checked against events,
  not accepted solely from the final answer.
- With `tool_output_token_limit=128`, the large-file command event retained all
  **33,600 bytes**, equal to the original fixture. The event supplied no
  post-truncation excerpt or delivery identity. The model reported truncation,
  but that self-report is not delivery telemetry. The pinned
  [context manager implementation](https://github.com/openai/codex/blob/be6e8eac029b183056b7e4402879f15d2c85f61b/codex-rs/core/src/context_manager/history.rs)
  separately truncates function output before storing model context.
- Installed `codex debug prompt-input` returned a separate three-message
  developer/user/user preview, useful for inspecting some injected context.
  It did not attest to the actual `exec` requests, full base instructions,
  later retrieval delivery, compaction, or provider-internal context.
- Failed inference sessions retained lifecycle/error events. A failed command
  inside an otherwise completed session remained a failed command, not a passed
  check. Plugin retrieval and failed approved specialist execution remain untested.
- Retained JSONL filters out reasoning items; no hidden reasoning, raw credential
  values, or unrestricted environment dumps were retained. Native reasoning-token
  counts are usage metadata only. The temporary local authentication reference
  was removed; it was never exported to CI or included in the evidence bundle.
- Early probes with inherited open stdin timed out before events. Closing stdin
  made real invocations observable; future noninteractive entry points must close
  stdin or deliberately supply the packet there. This was a probe invocation
  correction, not evidence of runtime review failure.

**Historical proposed resolutions — not implemented; activation restrictions superseded**

1. Retain central reusable invocation as the distribution candidate. Inlined
   procedure content plus explicit release-bound shared assets needs the actual
   two-consumer/private-access proof. Do not implement the consumer-compilation
   alternative until this gate supplies evidence requiring it.
2. Replace reliance on built-in read-only with a restrictive native local
   permission profile, controlled home/configuration, no inherited shell secrets,
   and disabled unapproved plugins/hooks/apps and login-shell configuration.
   The tested canary boundary supports further evaluation, not production approval.
3. Resolve CI read-only enforcement before remote model execution. The installed
   compiler's [Codex engine](https://github.com/github/gh-aw/blob/eed4304d8740f0593f2797276cb8299d228ffd9b/pkg/workflow/codex_engine.go)
   and generated lock invoke `--dangerously-bypass-approvals-and-sandbox` inside
   AWF; outside AWF the source selects `workspace-write`. Token permissions and
   the Bash list cannot substitute for reviewer filesystem enforcement. A
   reviewed engine configuration or compiler/runtime change must be proposed
   concretely and prove denied mutation; turning AWF off is not the solution.
4. Evaluate a supported native filtered delivery-observation interface that
   exposes actual post-truncation context and known runtime injections. If the
   selected runtime cannot supply it, keep that execution mode unsupported.
   No custom proxy, new harness, or instrumentation service is implicitly approved.
5. Obtain owner-approved pinned plugin and specialist packages, then evaluate
   native activation inside a reviewed compiled capability variant. The rejected
   `plugins` frontmatter cannot be used on this compiler. Do not replace the real
   plugin gate with a prompt document or an unapproved package manager.

These proposals recorded the original full gate. The later scope decision permits
the normal AWF manual reviewer without selected-file isolation or exact-context
proof; it does not implement those guarantees, approved extensions or fixes.
The broader advisory checklist, provenance and human fix-acceptance contracts
remain future requirements. No production readiness aggregation is claimed.

The local `phase1-evidence.zip` delivered with this investigation retains synthetic
fixtures, compiler inputs/generated outputs and diagnostics, sanitized native
events, invocation/packet/configuration records, version identities, and observed
assertions. It is an experimental evidence bundle, not a production report-schema
implementation. Local retention has no GitHub artifact access or expiry guarantee;
save it with the handoff if these trials must remain reconstructable.

Verification: `node scripts/validate-repo.js` passed; all 25 relative document
links in the two changed plans resolve. The 44-entry evidence archive passed its
ZIP integrity check. Archive SHA-256:
`94a7249f044e20e2388c4f734d170c5541642b66dfcb62a9996a23b2510fb864`.

#### Historical private-first native pilot

The owner subsequently authorized executable feasibility probes in the private
repository without creating additional remote repositories. The custom native
job ran synthetic fixtures, not PR reviews; the generated AWF agent was disabled.
Local synthetic sandbox and opt-in model probes completed with incomplete
feasibility reports, and missing authentication failed visibly. These were local
experiment results, not Ubuntu or real-review proof.

Pilot PR #322 was merged. The first private Actions attempt,
[run 34044447521](https://github.com/jhakulin/ai-harness/actions/runs/34044447521),
failed during Bubblewrap loopback setup before inference. PR #323 supplied
Ubuntu prerequisites; in
[run 34046553654](https://github.com/jhakulin/ai-harness/actions/runs/34046553654)
that setup passed, but the restricted filesystem hid Codex's native helper.
No probe payload or inference ran. A subsequent local correction exposed the
exact helper file and passed local synthetic checks; Linux helper re-execution
was not demonstrated.

The owner then approved replacing that custom CI gate with the current standard
AWF manual PR-review path. The native runner, experiment-only report helper and
their tests were subsequently removed. The [guide](../docs/reusable-change-review.md) supersedes
earlier native-pilot deployment/run instructions. The subsequent standard AWF run
34083468582 reached inference but failed for exhausted API credits; no review
report was produced. None of the historical probes proves the new review path.
The broader roadmap and every full milestone exit remain incomplete.

### Phase 2 — Implement shared contracts, preparation and routing

- Implement the packet/configuration/result schemas, deterministic helper and shared procedure.
- Implement immutable source resolution, approved candidate metadata, deterministic required coverage and bounded hybrid selection. Preserve routing explanations and refusal/incomplete states.
- Configure skill and general-change profiles without duplicating guideline criteria. Introduce only specialist definitions that existing approved assets cannot supply and that pass the agent guideline's fit test.
- Add requirement/checklist mapping, bounded evidence methods and deterministic readiness aggregation to the same contracts. Validate inherited mandatory controls, conflicting IDs, unsupported versions, missing criteria and stale/untrusted evidence.

**Exit:** run the helper against temporary Git repositories containing committed, staged, unstaged, untracked, rename/delete, unusual-filename and symlink cases. Assert exact visible scope and final content; exercise malicious config/assets, missing history/context and incompatible required capabilities. Retain tests for plausible boundary regressions, not prompt wording or implementation wiring.

### Phase 3 — Deliver review-only in CI and locally

- Implement the thin caller and shared review callee, plus local Codex entry point.
- Produce validated JSON, Markdown, job artifacts and complete PR comments. Implement manual remote review and the authorized fork-review path.
- Implement the PR-visible review record and machine-readable context/scope provenance, including incomplete runs and local output. Verify exact lists, pinned links and artifact access from the consumer reader's perspective.
- Run existing skill-review examples through old and new procedures before cutover; exercise a non-skill second consumer with repository-owned context and validation.
- Deliver the advisory acceptance checklist in both PR and local reports. Exercise its negative/positive acceptance cases, and have a consumer owner configure a shared profile/checklist using only the minimal settings before adding one repository-specific criterion without changing the shared workflow.

**Exit:** a clean skill change still produces a complete report; a known defect is found with usable evidence; an out-of-scope change reports a justified skip; failed/malformed/partial reviews cannot pass. An actual local Codex invocation reviews uncommitted content without changing files or index. A second repository changes review purpose through configuration only.

The observability acceptance cases above are part of this phase's exit gate, including available-versus-delivered context, partial coverage and missing evidence. A correct finding without an inspectable review record is not a complete delivery.

### Phase 4 — Deliver both fix-authorization policies

- Implement authorization checks, isolated single-writer repair, independent finding verification, required checks and fresh final review.
- Implement draft topic-branch PR delivery and patch delivery for forks/local work. Enforce publication identity, protected paths, stale-run checks, proposal deduplication and recursion prevention.
- Verify report-only, repository opt-in, per-run approval, refusal, exhausted repair limit and failed-check behavior independently.

**Exit:** owner-visible fix proposals contain only confirmed repairs; no original topic branch or local user work changes without acceptance. An unauthorized request, malicious report/patch, stale approval, target substitution, or failed required validation cannot pass the publication gate. Repeat identical authorized runs without duplicate active proposals. Demonstrate that ordinary CI/review still operates on a fix proposal.

### Phase 5 — Evaluate, migrate and roll out

- Compare against the current skill workflow and a simple single-reviewer baseline on known-defect and clean changes. Separate routing quality from review quality; include no-skill and explicit-routing comparisons where relevant.
- Include real skill packages, non-skill application changes, missing tests, security-sensitive changes, mixed/large diffs, stale context, malicious instructions, duplicate findings, unavailable plugins, timeouts and regressions introduced by repairs. Repeat important cases rather than retaining only the best trial.
- Record exact versions, context/coverage, confirmed-defect precision, known misses, clean-change false positives, fix acceptance and introduced regressions, human adjudication time, latency and observed model/tool usage. Report cost only where measurable; do not ask the model to invent telemetry.
- Measure criterion coverage, false-ready conclusions and engineer approval-decision effort. Required readiness checks and any team author-merge policy need their own evidence/approval gate; keep the workflow advisory until that gate is met.
- Exercise the recorded-snapshot comparison loop with one routing/context change; retain baseline/candidate reports and human finding dispositions, and verify that the records identify the actual configuration/context difference without assuming deterministic model output.
- Pilot this repository and a representative non-skill consumer, then expand by repository/risk cohort across the intended 20+ teams and 30+ repositories. Each cohort has an owner, baseline, agreed quality/cost/burden thresholds and rollback decision. Read-only is the initial operating mode; enable fix proposals per repository only after containment and repair gates pass.
- Complete the clean cutover, consumer documentation, release/version updates and removal of throwaway fixtures. Run `node scripts/validate-repo.js`; follow the existing context-manifest maintenance convention instead of treating PR manifest freshness as a review defect.

**Exit:** consumers need only a pinned caller and repository configuration, supported behavior is documented and exercised, old duplicate orchestration is removed, and rollback to a known-good pin or disabling proposal generation is demonstrated. No universal precision/cost target is invented in advance of owner baseline measurements; all unauthorized-write/approval-bypass cases must have zero successful violations.

## Open deployment items

These do not block this plan, but must be resolved before the corresponding implementation gate. Defaults below are recommendations, not claims about the intended teams or repositories.

| Item | Recommended decision / required input | Needed by |
| --- | --- | --- |
| Release host and access | Canonical repository unless consumer visibility/access policy requires an approved public or organization host; identify actual consuming organizations and GitHub Cloud/GHES environments | Phase 1 cross-repository spike |
| Pilot inventory | Name a skill consumer and at least one application consumer, their owners, runtimes/OSes, languages, fork needs and sensitive-data constraints | Phase 1 fixtures and Phase 3 pilot |
| Inference authentication | Approved Codex inference path per consumer; keep billing/data policy and credentials separate from GitHub publishing credentials | Phase 1 runtime proof |
| Publisher and CI | Decide whether a scoped GitHub App is available; otherwise verify maintainer-triggered CI and patch-only cases explicitly | Phase 1 fix spike |
| Approved plugin/agent examples | Owners nominate one real plugin and specialist asset, with pinned source/package approval and a concrete review use case | Phase 1 activation proof |
| Asset approval ownership | Shared maintainers approve shared releases; consumer owners approve repository-specific assets within organization capability ceilings | Before enabling automatic routing |
| Acceptance ownership and merge policy | Team names authoritative requirement sources, checklist owner, acceptable evidence and required human roles; advisory by default, with readiness enforcement or engineer/author merge eligibility adopted separately without bypassing repository rules | Phase 3 checklist pilot; Phase 5 promotion |
| Operational limits | Owners set per-run/repository concurrency, latency/usage ceilings, retention and rollout thresholds from the pilot baseline | Before each rollout cohort |

Changes that require another harness, a private-repository credential broker, a registry service, a plugin manager beyond native runtime support, or unbounded catalog discovery are separate proposals, not implicit extensions of this plan.

## Plan verification and lifecycle

For this planning change: check local source links and requirement coverage, then run `node scripts/validate-repo.js`. Do not compile unchanged workflows or represent the future runtime acceptance gates as already passed.

During implementation, schemas/code own exact field and command behavior, domain skills/guidelines own review criteria, the amended review specification owns shared reviewer semantics, and the consumer guide owns setup/operations. After delivery, remove this implementation checklist or retain only necessary accepted decisions in the appropriate authoritative document.

## External references

Current documentation consulted during planning; recheck against the pinned implementation versions.

1. [gh-aw FAQ: reusable workflows](https://github.github.com/gh-aw/reference/faq/)
2. [GitHub Actions: reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows) and [reusable configuration behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations)
3. [gh-aw imports, compile-time parameters and self-contained lock files](https://github.github.com/gh-aw/reference/imports/)
4. [gh-aw engines and feature comparison](https://github.github.com/gh-aw/reference/engines/)
5. [gh-aw skills and agent plugins](https://github.github.com/gh-aw/reference/frontmatter/)
6. [gh-aw custom agent integration](https://github.github.com/gh-aw/reference/copilot-custom-agents/)
7. [gh-aw CLI: run and trial](https://github.github.com/gh-aw/setup/cli/)
8. [gh-aw PR safe outputs, branch targeting and protected files](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/)
9. [gh-aw fork support](https://github.github.com/gh-aw/reference/fork-support/)
10. [GitHub Actions event and fork security behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
11. [gh-aw triggering CI](https://github.github.com/gh-aw/reference/triggering-ci/) and [cross-repository operations](https://github.github.com/gh-aw/reference/cross-repository/)
12. [Codex non-interactive execution, sandboxing and structured output](https://developers.openai.com/codex/noninteractive/)

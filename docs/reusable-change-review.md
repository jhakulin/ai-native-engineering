# Change Review

Change Review is an AI-assisted pull request review that helps a human answer two
questions: **what problems does this change introduce, and what evidence supports
its acceptance?** It examines the changed source against repository-defined
criteria and produces a downloadable report with findings, source references,
file coverage and outstanding evidence or human decisions.

Use it as input to code review—not as a replacement for tests, CI or the person
who decides whether to merge. A completed run is not an approval.

**Available today:** a manually started GitHub Actions workflow in private
`jhakulin/ai-harness`, listed as **Change Review Private Pilot**. It performs one
source-review session and returns report artifacts. Installation in other
repositories, local review, independent specialist reviews and automated fixes
are not yet supported delivery paths. Existing skill review is unchanged.

## When to use it

Run Change Review when you want a source-level assessment of a PR before making
an acceptance decision. It is useful for identifying possible defects, checking
changes against written requirements, and making missing review coverage or
required evidence visible. You can also review a merged PR without reopening it.

You provide a **PR number**. The repository maintainer provides the **review
configuration and requirement sources**. The workflow produces:

- **Findings:** identified problems with severity, impact and source citations.
- **Coverage:** which changed files were reviewed, partially reviewed or left
  unreviewed, with reasons.
- **Acceptance evidence:** whether each applicable configured criterion is
  satisfied, failed, unverified or awaiting a human decision.
- **Limitations:** missing context, incomplete output and other reasons not to
  treat the report as a complete assessment.

It does **not** run candidate scripts, builds or tests, change code, post PR
comments, approve a PR or merge it. If acceptance requires execution evidence,
source review alone cannot supply it.

## Run your first review

### Before you start

Ask the repository maintainer to confirm that:

- The reviewed workflow version and `review.config.json` are deployed. The manual
  workflow must exist on the default branch for GitHub to offer **Run workflow**.
- The repository has an **`OPENAI_API_KEY`** Actions secret with available API
  credits and approval to use it for this review. Local ChatGPT authentication
  does not provide this credential or cover the Actions API bill.
- The repository material is authorized for transmission to OpenAI. The reviewer
  can see the normal trusted consumer checkout as well as the prepared review
  material; this is not a selected-files-only isolation boundary.

Model selection matches skill review: `GH_AW_MODEL_AGENT_CODEX`, then
`GH_AW_DEFAULT_MODEL_CODEX`, then **`gpt-5.4`** when neither repository variable
is set. Both workflows use Codex, with no workflow-specific model
override. They share compiler-managed runtime defaults: Codex **0.142.1** and
AWF **v0.27.11** with gh-aw 0.81.6. There are no custom runtime pins, sandbox
overrides, or stdin redirections. Model selection is not a strict allowlist;
compare the observed model with the configured model in retained runtime evidence.
Review the [default model pricing](https://developers.openai.com/api/docs/models/gpt-5.4)
and any configured override before paid runs; model selection is not a total-run
spending cap.

Change review overrides the Codex shell-variable allowlist to `["PATH","HOME"]`.
This corrects the compiler's regex-style entries for Codex's wildcard matcher
without inheriting provider credentials or requiring a login shell.

### Start the workflow

1. In `jhakulin/ai-harness`, open **Actions → Change Review Private Pilot**.
2. Choose **Run workflow** and select a trusted deployed branch or ref. This
   selects the workflow and review configuration—not the PR to review. Do not
   select an unreviewed branch merely because it contains the candidate changes.
3. Enter the PR number in **`pull_request_number`**, for example `323`, not a URL
   or `#323`. Use a positive number without leading zeros. The PR must belong to
   the repository where you start the workflow.
4. Choose **Run workflow**. This authorizes paid inference and transmission of
   review material. Follow the run through preparation, review and reporting.

A new run for the same repository and PR supersedes its older run, even when
started from another ref. Different PRs have separate cancellation groups.
After deploying workflow changes, start a **new** run: rerunning an old failed
run uses that run's original revision.

### Open the report

On the workflow run's summary page, find **Artifacts** and download
**`review-report-pr-<PR>-<attempt>`**. For PR 323's first attempt, that is
`review-report-pr-323-1`.

Extract the archive and open **`report.md`** for the readable review.
**`report.json`** contains its structured data, and **`packet.json`** records the
original review inputs. If reporting could not initialize or finalize, the
artifact may contain **`failure.json`** instead. A missing report is a failure
to obtain a review, not evidence that the change is clean.

Artifacts are retained for **seven days**. Download them before expiry if you
need a lasting record of the decision.

## Read the report and decide what to do

Start with the three separate indicators at the top of `report.md`:

| Indicator | What it tells you |
| --- | --- |
| **Execution** | Whether the review completed, was incomplete, failed, was cancelled or was skipped. This is process health, not acceptance. |
| **Defects** | `findings` means validated findings are available. `no_findings` means none were identified in the completed source review. `unavailable` means no clean defect judgment can be made. |
| **Evidence readiness** | Whether the configured requirements have enough valid evidence to support an acceptance decision. The states and next actions are below. |

| Evidence readiness | Meaning | Your next action |
| --- | --- | --- |
| `blocked` | A high/medium finding or a failed required criterion remains. Other gaps may also exist. | Inspect the finding or failed criterion and resolve it before treating the evidence as ready. |
| `incomplete` | Required evidence, coverage, context or current identity is missing, or execution did not complete successfully. | Read the gaps and errors, address their cause, then request a new review where needed. |
| `needs_human_decision` | Required human acceptance remains outstanding, with the other required evidence available. | Have an authorized person make and record the decision. |
| `evidence_ready` | The applicable required criteria have their configured evidence and the review has no readiness blocker. | Evaluate the findings and evidence yourself; use normal CI and repository merge rules. |

These are **report classifications**, not GitHub approvals or automatic merge
gates. `blocked` takes precedence over an incomplete review so a known problem
is not hidden by a separate failure. Low-severity findings remain advisory.

Read the rest of the report in this order:

1. **Snapshot:** confirm that the recorded PR head is the version you intend to
   assess. A report about an older commit does not certify newer changes.
2. **Findings:** inspect the cited source and impact; AI-assisted judgments can
   be wrong or miss defects.
3. **Coverage:** check partial or unreviewed files before relying on an absence
   of findings.
4. **Acceptance evidence:** inspect each criterion's disposition and reason.
   A generic green CI job does not establish every requirement.
5. **Evidence records, errors and limitations:** check what supports the claims
   and what the workflow could not establish.

For example, a review can be `completed` with `no_findings` but still have
`incomplete` evidence readiness because a required CI record is missing or no
authoritative requirement applies to the changed paths. These are acceptance
limitations, not failed source-review execution. The finalizer exits zero for a
completed review; consumers must inspect readiness rather than treating a green
job as acceptance. Missing prepared content, invalid output and runtime failures
still produce a nonzero exit.

Evidence is checked again before the report is produced. If a CI record changes
or a human approval is withdrawn, the affected acceptance claim can become
`unverified`. Independent findings and coverage remain useful; they are not
thrown away with the stale evidence. Update the evidence and start a new review
if you need a new readiness assessment.

## How the workflow works

```text
You select a PR
      |
Prepare the change snapshot and applicable review criteria
      |
Codex reviews the supplied source and writes a structured result
      |
Retain available output, including partial results
      |
Validate the review and recheck current evidence
      |
Publish the report for a human acceptance decision
```

**Preparation fixes the scope before the model reviews it.** The workflow reads
PR metadata and Git history, compares the PR head with its merge base, and keeps
an inventory that includes renamed, deleted and binary files. It combines that
inventory with applicable criteria, their requirement sources and any configured
external evidence. This saved input bundle is the **review packet**. Size limits
produce explicit gaps rather than silently treating omitted material as reviewed.

**The model supplies judgments, not policy.** It reviews bounded source material
and cites the supplied revisions and lines. It cannot choose the authoritative
file inventory, omit required criteria or decide final evidence readiness. The
current workflow uses one Codex session, not independent specialists.

**The host validates and reports.** Separate workflow code retains available
output, checks its structure and citations against the original packet, and
rechecks PR identity and external evidence. Changed evidence affects acceptance
claims without rewriting the original review inputs. Missing or malformed output
cannot become a clean review.

Reports use commit-based citations. If the model supplies a blob SHA, the host
resolves it only when the trusted packet binds that exact blob, path and retained
line range to one commit. Each conversion is recorded in report provenance; the
raw result remains unchanged. Unknown or ambiguous identities, absent file sides
and citations crossing omitted lines remain invalid. This establishes source
identity, not the truth of the model's explanation.

Workflow code comes from the authenticated called release; review policy comes
from the trusted revision selected when starting the run. Candidate changes do
not authorize their own policy. Runtime collection also uses shared-release code,
not a helper loaded from the consumer checkout. These boundaries do not prove
exactly what the model read or understood, or provide strict filesystem isolation.

## Configure what the review assesses

This is a **repository maintainer** task; you do not need to edit configuration
to run an already configured review.

Start with [`review.config.json`](../review.config.json). The current configuration
assesses this repository's review-only boundary, evidence handling and bounded
source quality. It is not a universal checklist for every application's
requirements, and it enables neither CI evidence nor named human approvers.

| Configuration | What to choose |
| --- | --- |
| `purpose` | The intended scope of the review. |
| `criteria` | The requirements and quality expectations to assess, their written sources, applicability and evidence requirements. |
| `context` | Additional source documents to supply alongside criterion sources. |
| `limits` | Bounds on file count, diff bytes and context bytes. Large or incomplete inputs can prevent a complete assessment. |
| `ci` | Approved existing CI workflows, artifact names and verifier paths, if execution evidence is required. |
| `human_approvers` | Named approvers permitted to provide criterion-level human acceptance. |

For each criterion, identify the written requirement in `source`, describe the
expectation, and specify `evidence_requirement`. Use `path_prefixes` to limit
applicability: these are literal path prefixes, not globs; an empty list applies
to every change, and renames consider both old and new paths. Set `required` for
criteria that must be met for readiness.

Choose `required_methods` according to the proof the criterion needs. **Every
listed method is required for a satisfied claim**, not just any one of them:

- **`review`:** source-based judgment citing both the requirement and the changed
  implementation. Use it for questions that can be assessed from source.
- **`execution`:** authenticated results from configured existing CI. Producers
  must supply a bounded artifact containing `review-evidence.json` with the exact
  head, policy digest and criterion-level checks/outcomes. Approved verifier
  sources must be unchanged from trusted policy to candidate. The reviewer does
  not execute the checks itself.
- **`human`:** acceptance by a configured non-author approver, for the exact head
  and policy digest. The approver must include criterion IDs in schema-valid JSON
  inside a `review-acceptance` fenced block in an approving PR review. An ordinary
  approval alone is not this evidence record.

The [canonical contract](../.github/aw/review-contracts.schema.json) defines the
supported configuration and the `executionEvidence` and `humanAcceptance` record
formats. Do not add a required method without arranging its evidence source;
otherwise the review cannot establish readiness. External CI/human integration
has fixture coverage, but has not yet been demonstrated with a live consumer.

Deploy configuration changes through the repository's normal review process,
then select that trusted revision for the next run. Editing configuration in the
candidate PR does not by itself make it the review policy.

## Troubleshooting

| What you see | What to check or do |
| --- | --- |
| No **Run workflow** button | Confirm that the manual workflow exists on the default branch and that you have permission to run it. |
| The private pilot job is skipped | The supplied caller is restricted to private `jhakulin/ai-harness`; copying it into another repository is not a supported installation. |
| Credential or “no credits remaining” error | Ask the maintainer to check `OPENAI_API_KEY`, API credits and model access before another paid attempt. |
| Error names a different model | Compare the configured model with the observed model and retained `models.json` catalog before retrying. The configured model alone does not prove which model the provider used. |
| Stops at “Reading additional input from stdin…” with no thread event | Compare the deployed runtime with skill review's compiler defaults. Linux diagnostics verified startup with Codex 0.142.1 and AWF 0.27.11 without explicit stdin redirection. |
| Green workflow, but `blocked` or `incomplete` report | Read the report. Successful execution does not mean the change meets its acceptance criteria. |
| Invalid citations or malformed reviewer output | Inspect the report errors and retained raw result. The output was rejected, not accepted as a clean review. A retry may incur another charge. |
| Partial coverage or missing requirement context | Inspect packet omissions and configuration limits. Reduce the PR scope or have the maintainer correct the sources or adjust bounds deliberately. |
| PR revisions changed during review | Start a new run once the intended revisions are stable. Do not carry forward readiness for the old snapshot. |
| Missing or stale CI/human evidence | Check the configured producer, criterion IDs, head revision and policy digest. Supply current evidence before requesting another assessment. |
| No final report artifact | Inspect preparation/report job logs and any `failure.json` in retained artifacts. Cancellation, runner loss or upload failure can prevent delivery. |

For diagnosis, the run can retain three artifact groups:

| Artifact | Contents and use |
| --- | --- |
| `review-report-pr-<PR>-<attempt>` | Final `report.md`, `report.json` and original `packet.json`, or a reporting failure record. Start here. |
| `review-packet-<attempt>` | Prepared inputs, the model-facing result schema and an initial incomplete report, or a preparation failure record. Use it to inspect scope and supplied context. |
| `review-raw-<attempt>` | Available model output in `result.json`, normalized runtime observations in `runtime.json` and collection status in `collection.json`. This is diagnostic input, not the validated final report. |

Command output bodies are deliberately omitted from retained runtime metadata.
The records distinguish prepared material, observed events and model citations;
they are not a complete or tamper-proof transcript of model context. Partial
results are retained when possible, but forced cancellation or runner loss can
still prevent an upload.

## Availability and next steps

The manual report path and rejection of invalid results have been demonstrated
in Actions. With skill review's model selection and runtime, run 34437989062
completed the model turn but its report was rejected for blob-based citations.
The corrected finalizer has been exercised locally against retained output and
identically prepared source, including live GitHub freshness checks; a paid
end-to-end run of this finalization fix has not been dispatched. The
[verification record](../plans/reusable-change-review-workflow.md#observed-verification)
contains run history and exact evidence; it is not a broad review-quality benchmark.

The next milestones extend this workflow rather than changing its human
acceptance boundary:

1. **Broader pilot evaluation:** exercise known-defect and clean cases, repeated
   reviews, interruption and publication failures.
2. **Supported reuse:** publish a retained, immutable shared release and prove
   the workflow in a real second repository with its own configuration.
3. **Complete review-only delivery:** add local review, independent specialists,
   finding verification and PR-visible reporting.
4. **Authorized fixes:** add a separately authorized repair path with checks,
   fresh final review and a draft fix PR or patch for human acceptance.

These are roadmap items, not features enabled by changing configuration today.
See the [current milestone order](../plans/reusable-change-review-workflow.md#revised-milestones--current-implementation-order)
for acceptance gates and the [architecture diagrams](../plans/reusable-change-review-workflow.md#architecture)
for the intended end-to-end flow.

### Use in another repository

A supported external release is not available yet. The intended setup is a small
caller pinned to the shared generated workflow, a repository-owned configuration
and explicit credentials—not a copied implementation. The current public snapshot
sync replaces `main` and does not provide the retained release identity required
for that setup. Cross-repository access and artifact delivery still need a real
consumer run before this can be offered as an installation procedure.

## Maintainer references

- [Manual caller](../.github/workflows/review.yml): the Actions entry point.
- [Reusable workflow source](../.github/workflows/review-change.md): orchestration
  and the `pull_request_number` / optional `config_path` interface. The supplied
  manual caller uses the default `review.config.json` path.
- [Review procedure](../.github/aw/review-change.md): instructions given to Codex.
- [Preparation and reporting](../scripts/review-change.js) and
  [runtime collection](../scripts/review-runtime.js): host-side implementation.
- [Contracts](../.github/aw/review-contracts.schema.json): the authoritative data
  formats. The model-facing result schema is derived from these definitions.

When changing the workflow implementation, use gh-aw v0.81.6 to regenerate its
lock file; never edit generated YAML manually. Validate before deployment:

```bash
node --test scripts/review-change.test.js
gh aw compile review-change --no-check-update --validate
node scripts/validate-repo.js
```

The workflow uses compiler-managed Codex **0.142.1** and read-only GitHub permissions
(`actions`, `contents` and `pull-requests`). Publishing changes, provisioning
credentials and dispatching paid reviews require their corresponding owner
authorization; this guide does not grant it.

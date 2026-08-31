# AI Harness Team Roadmap

## Purpose

This document translates the AI harness strategies and guidelines into a deliverable-oriented roadmap for a central AI harness team supporting software-delivery teams across different products and repositories.

The roadmap gives management a clear view of what will become available, why it matters, how progress will be demonstrated, and which capabilities depend on others. It also defines how the AI harness team operates between roadmap milestones: learning from delivery work, maintaining shared capabilities, improving local harnesses with teams, and turning recurring bottlenecks into reusable assets.

The roadmap is organized around outcomes rather than documents or technology components. Guidelines, strategies, schemas, services, dashboards, skills, and platform changes are artifacts used to deliver those outcomes.

## Roadmap And Operating Model

The AI harness team needs two connected views of its work.

The **roadmap** contains time-bounded epics with visible deliverables. Each epic ends with a capability that engineers or teams can use and evidence that management can review. The roadmap communicates direction, investment, dependencies, and achieved outcomes.

The **operating backlog** contains the continuous work needed to produce and sustain those deliverables. It includes team discovery, joint experiments, asset maintenance, support, evaluation updates, compatibility work, and responses to failures. These activities contribute to roadmap epics when they advance a stated deliverable, but they continue after a roadmap milestone is complete.

```text
team evidence and platform needs
              |
              v
      operating backlog
              |
              v
    roadmap deliverables
              |
              v
      team validation and use
              |
              v
feedback, maintenance, and next priorities
```

## Planning Hierarchy

Use the following hierarchy when representing the roadmap in Jira or another planning system:

| Level | Responsibility | Example |
| --- | --- | --- |
| Initiative | Long-lived organizational outcome | AI-assisted engineering becomes reliable, maintainable, and scalable |
| Roadmap epic | Time-bounded usable capability | Governed AI Registry And Marketplace v1 |
| Story | Reviewable increment that advances the epic deliverable | Publish and validate the first marketplace catalogue |
| Task | Implementation step inside a story | Add manifest validation to CI |

A roadmap epic should be understandable without reading the strategy repository. Its title names the capability or outcome that will exist. Its description explains the current problem, intended users, deliverables, evidence of success, dependencies, and ongoing maintenance.

Numbered stories provide the initial decomposition of each epic. Scheduling confirms commitment; evidence may revise the story set while preserving the epic deliverable.

## Portfolio Overview

| Workstream | Roadmap item | Principal deliverable |
| --- | --- | --- |
| Evidence | Engineering Delivery Impact Baseline | Shared baseline and reporting for delivery performance, quality, rework, manual work, and selected product outcomes |
| Evidence | AI Workflow Usage And Value | Evidence showing where AI contributes value, requires correction, creates burden, or is abandoned |
| Enablement | Team-Owned Harness And Feedback Model v1 | A repeatable way for delivery teams and the AI harness team to find bottlenecks, improve local harnesses, and continue sharing evidence |
| Enablement | Legacy Repository AI Readiness — Wave 1 | A representative set of legacy repositories prepared for bounded, reliable agent-assisted engineering |
| Foundation | Governed AI Registry And Marketplace v1 | A skill-centric registry and Claude Code marketplace with ownership, versions, dependencies, evidence, and lifecycle controls |
| Foundation | Automated Quality Controls And Correction Loops v1 | Reusable checks, gates, runtime signals, and correction paths that make agent-assisted work safer and more reliable |
| Foundation | Trusted Engineering Knowledge Access v1 | Maintained repository guidance and authoritative context retrieval for engineers and agents |
| Foundation | Evaluation System And Shared Baselines v1 | Representative evaluation suites and comparison baselines for skills, agents, and workflows |
| Foundation | Build, Test And Release Pipeline Optimization v1 | Faster, more reliable, observable, and automation-ready engineering feedback from change through release |
| Foundation | Observable Agent Runtime v1 | Reliable execution of bounded agent runs with contracts, permissions, state, telemetry, cost, and result evidence |
| Scale | Validated Workflow Automations | Named delivery workflows that demonstrate measurable improvement with product teams |
| Scale | Governed Agent Operations v1 | Registry-integrated agent rollout, policy, evaluation gates, auditability, fleet health, and rollback |

## Sequencing And Dependencies

The workstreams reinforce one another and should not be treated as a fully sequential program. Evidence and team collaboration begin first and continue throughout. Foundation capabilities can be developed in parallel when their contracts are aligned. Scale work begins with bounded scenarios as soon as the required evidence and controls exist.

### Establish Evidence And Collaboration

Start the Engineering Delivery Impact Baseline, AI Workflow Usage And Value, and Team-Owned Harness And Feedback Model together. These epics establish how the team learns, what it measures, and how product teams participate. They produce the evidence used to choose registry assets, evaluations, knowledge improvements, controls, and automation scenarios.

### Enable Legacy Repositories In Waves

Use team evidence to select a representative first wave of legacy repositories. Improve their context, reproducibility, verification, and safe change boundaries enough to support real agent-assisted work. Use these repositories as validation environments for the knowledge, evaluation, pipeline, control, registry, and runtime foundations.

### Deliver Shared Foundations

Develop the registry, evaluation system, knowledge access, engineering delivery pipeline, and automated control loops as connected foundations. The registry identifies approved assets and versions. The evaluation system produces the evidence behind those states. Knowledge access supplies authoritative context. The build, test, and release pipeline returns timely engineering evidence. Control loops use deterministic and evaluative signals to accept, correct, stop, or escalate work. Validate each relevant foundation in representative legacy repositories as well as cleaner environments.

The evaluation system produces evidence and judgments; automated controls and correction loops use those signals to change workflow state, request revision, stop, roll back, or escalate.

### Introduce Observable Execution

Deliver the Observable Agent Runtime once the minimum agent contract, evaluation contract, capability model, telemetry schema, and required pipeline interfaces are coherent. A runtime can be built incrementally, but broader use depends on being able to identify what ran, what it accessed, what it changed, what evidence the delivery pipeline produced, and why the result was accepted.

### Scale Proven Scenarios And Governance

Automate named workflows based on evidence from team discovery. Governed Agent Operations becomes relevant when several agents, workflows, teams, and versions must be operated consistently. It builds on the runtime, registry, evaluations, controls, and operating feedback rather than creating a separate governance layer disconnected from execution.

## Epic 1: Engineering Delivery Impact Baseline

### Outcome

The organization can determine whether AI harness improvements change engineering delivery outcomes. Teams and management can compare a workflow before and after an intervention using agreed measures and clearly stated limitations.

### Why This Matters

Engineering impact needs to be demonstrated through delivery time, quality, rework, manual burden, and relevant product outcomes. The organization needs a practical baseline that uses available engineering evidence and remains lightweight for delivery teams.

### Deliverables

The epic delivers a measurement contract that defines the questions being answered, source systems, calculation rules, task or workflow boundaries, update frequency, data quality limitations, and decision responsibilities. It also delivers an initial baseline for selected workflows and a management view that connects harness changes to delivery outcomes.

Measures should be selected according to the workflow. Relevant measures may include elapsed delivery time, active engineering time, waiting time, review cycles, rework, escaped defects, failed changes, acceptance delay, manual coordination, engineer correction, or operational recovery. Product or customer measures should be included when the improvement is intended to affect them.

### Initial Story Backlog

#### Story 1.1: Publish The Engineering Impact Measurement Contract

Define the delivery questions, workflow boundaries, source systems, measures, calculation rules, exclusions, and reporting cadence. Validate the contract with representatives from delivery teams and the owners of the source systems.

Acceptance evidence includes worked examples calculated from real historical work, identified data gaps, and agreement that the measures can support comparison without claiming precision the data cannot provide.

#### Story 1.2: Establish Baselines For The First Selected Workflows

Select workflows connected to current team bottlenecks and establish their present performance. Preserve enough task and repository context to make later comparisons meaningful.

Acceptance evidence includes the task population, observation period, distribution rather than only an average, known confounders, and a clear statement of what future intervention will be compared.

#### Story 1.3: Publish The Engineering Impact View

Provide a management and team view that reports outcome changes, uncertainty, and important qualitative findings. The view should connect each result to a specific workflow and harness intervention.

Acceptance evidence includes traceability from a reported change to its source data, baseline, intervention version, and responsible validation decision.

#### Story 1.4: Add Measurement To Roadmap Epic Completion

Require every relevant foundation and scale epic to identify its expected outcome, baseline, and validation evidence. This connects the evidence capability to roadmap decisions instead of leaving it as a separate dashboard.

Acceptance evidence is visible in epic definitions and completion reviews.

### Ongoing Operation

Review the measurement contract when workflows, source systems, or organizational practices change. Treat missing or inconsistent data as an engineering-system finding. Maintain a small set of decision-relevant measures rather than expanding the dashboard without a corresponding decision need.

## Epic 2: AI Workflow Usage And Value

### Outcome

The organization understands how engineers use AI-assisted workflows, where those workflows help, where they require substantial correction, and where engineers stop using them. This evidence guides enablement, asset maintenance, workflow redesign, and investment.

### Why This Matters

AI workflow investment needs evidence that connects use with outcomes and human experience. Invocation, acceptance, correction, abandonment, latency, and integration burden together show where a workflow helps and where it should be improved.

### Deliverables

The epic delivers an AI workflow evidence model, collection mechanisms appropriate to the available harnesses, and a recurring review that combines usage signals with outcomes, correction, failure, and team feedback. The model separates individual experimentation from approved shared workflows and keeps interpretation tied to task families.

### Initial Story Backlog

#### Story 2.1: Define The AI Workflow Evidence Model

Define the minimum events and observations needed to understand discovery, invocation, completion, correction, abandonment, acceptance, and failure. Record the resolved skill, agent, workflow, model, and harness versions where the runtime makes them available.

Acceptance evidence includes examples showing how the model distinguishes activity from value and how it connects to the engineering impact baseline.

#### Story 2.2: Establish Engineer-Approved Local Insights Collection

Use local harness health checks and engineer-reviewed insights as the initial collection route. Engineers review the analysis before it is shared. Increase automation only after teams understand the output and the evidence has proven useful.

Acceptance evidence includes an agreed output format, engineer approval step, receiving location, and examples of findings that resulted in a concrete action.

#### Story 2.3: Publish The First Workflow Value Review

Combine usage, correction, outcome, and qualitative evidence for selected workflows. Identify capabilities that should be improved, promoted, restricted, or retired.

Acceptance evidence includes decisions connected to specific asset versions and follow-up responsibilities.

#### Story 2.4: Integrate Feedback Into Team Processes

Provide lightweight prompts and routes for planning, retrospectives, health checks, and real delivery work. Teams should be able to report a useful pattern, failure, repeated manual step, or maintenance gap without preparing a separate AI adoption report.

Acceptance evidence includes active feedback routes and examples of feedback entering the improvement backlog.

### Ongoing Operation

Review usage evidence with asset owners and product teams. Use absence of use as a review signal rather than automatic proof of low value. Interpret high use together with acceptance, correction, cost, and outcome evidence.

## Epic 3: Team-Owned Harness And Feedback Model v1

### Outcome

Delivery teams and the central AI harness team have a collaborative way to identify delivery bottlenecks, improve repository-specific harnesses, find reusable patterns, and continue exchanging evidence. Product teams retain the delivery knowledge needed to shape and maintain local results, while the central team provides shared capabilities, cross-team patterns, evaluation methods, and implementation support.

### Why This Matters

Effective local harnesses depend on delivery knowledge held by the product team and must evolve with the repository and product. Sustainable improvement combines collective delivery-team participation with shared capabilities and support from the central AI harness team, while making responsibility explicit for each validation, decision, experiment, and maintenance action.

### Deliverables

The epic delivers the 60-minute health-check engagement, local preparation guidance, comparable team evidence, a continuing feedback mechanism, a local maintenance model, and a cross-team synthesis process. Each engagement surfaces delivery bottlenecks broadly and prioritizes at least one evidence-backed bottleneck for joint follow-up.

### Initial Story Backlog

#### Story 3.1: Release The Full-Team Health-Check Engagement

Publish the invitation, preparation, flexible discussion phases, evidence record, and follow-up format. Validate the format with a complete delivery team and revise it using participant feedback.

Acceptance evidence includes a completed session record, contributions from the roles involved in delivery, at least one prioritized bottleneck, a bounded next step, and a continuing feedback route.

#### Story 3.2: Establish The Local Harness Preparation

Enable engineers to inspect the local Claude Code environment using `/doctor`, `/insights`, and a fresh `/context all`, followed by engineer review of repository instructions, context, and current workflows.

Acceptance evidence includes engineer-approved observations and the selected real delivery example brought into the health check.

#### Story 3.3: Produce Comparable Team Harness Profiles

Capture product context, workflow evidence, bottlenecks, existing assets, maintenance practices, constraints, measures, and follow-up. Build the complete profile through repository inspection and follow-up evidence rather than expecting the meeting to cover every discovery area.

Acceptance evidence includes a profile that distinguishes observed facts, interpretations, missing evidence, reusable patterns, and local constraints.

#### Story 3.4: Establish Team-Owned Maintenance

Define how repository-specific instructions, skills, checks, and context remain current. Preserve collective participation while assigning explicit responsibility for each change, decision, validation, coordination step, and maintenance action.

Acceptance evidence includes a recent harness change traced through its need, decision, validation, release, and ongoing maintenance.

#### Story 3.5: Publish Cross-Team Findings And Priorities

Synthesize recurring bottlenecks, manual work, useful practices, failures, and maintenance gaps. Identify candidates for shared skills, tools, checks, context sources, evaluations, and governed workflows.

Acceptance evidence includes the supporting teams and examples, the conditions under which the pattern applies, and the next validation step.

### Ongoing Operation

Run health checks in waves and maintain continuing feedback between sessions. Use team evidence to shape roadmap priorities and scenario epics. Return findings and resulting actions visibly to participating teams so contribution leads to an observable response.

## Epic 4: Legacy Repository AI Readiness — Wave 1

### Outcome

A representative set of legacy repositories supports bounded, reliable agent-assisted engineering. Engineers and agents can understand the relevant system boundary, establish a working environment, make a scoped change, run trusted verification, and preserve human understanding without waiting for complete repository modernization.

### Why This Matters

The organization delivers through repositories with accumulated architecture, dependencies, build behavior, operational constraints, and undocumented knowledge. These conditions determine whether AI-assisted work produces accepted outcomes. A representative legacy-repository wave ensures that shared harness foundations address the environments where much of the organization's business value and engineering effort already reside.

### Deliverables

The epic delivers a representative repository selection, current-state profiles, reproducible build and test paths, maintained context entry points, explicit change and authority boundaries, legacy-task evaluation cases, bounded agent-assisted pilots, outcome evidence, reusable enablement patterns, and investment decisions for targeted modernization.

The first wave is an enablement and learning boundary. It should cover enough variation to test the shared foundations without implying that every repository needs the same intervention. Repository-specific behavior remains with the product team; reusable mechanisms and cross-team patterns become candidates for central support.

### Initial Story Backlog

#### Story 4.1: Select The First Legacy Repository Wave

Select repositories that represent meaningful variation in business criticality, technology, age, repository topology, delivery friction, operational consequence, and current harness condition. Include product teams willing to contribute delivery evidence and validate changes.

Acceptance evidence includes the selection rationale, represented conditions, participating teams, known constraints, intended learning, and the decisions the wave should inform.

#### Story 4.2: Establish Current-State Repository Profiles

Map the repository's purpose, important architecture, dependencies, ownership, local setup, build, tests, integration, release path, operational evidence, current AI instructions, skills, context sources, and maintenance practices. Trace at least one recent change from intent to accepted outcome.

Acceptance evidence includes verified source references, observed workflow evidence, unresolved gaps, fragile boundaries, and a product-team review of the profile.

#### Story 4.3: Make Development And Verification Reproducible

Establish the smallest dependable path for an engineer or isolated agent run to prepare the environment, build the affected system, execute relevant tests, and interpret the result. Separate product failures from dependency, environment, fixture, and infrastructure failures.

Acceptance evidence includes a fresh-environment run, documented prerequisites, commands or tools, expected artifacts, representative success and failure cases, and ownership for keeping the path current.

#### Story 4.4: Establish Repository Context Entry Points

Provide maintained repository instructions that identify important workflows, architecture sources, constraints, verification commands, ownership, and deeper context locations. Resolve material stale or conflicting guidance found during the profile.

Acceptance evidence includes successful orientation and task preparation by engineers or agents who did not rely on undocumented conversation history.

#### Story 4.5: Define Safe Change And Decision Boundaries

Identify components and changes suitable for bounded agent assistance, areas requiring specialist review, consequential product or architecture decisions, protected data and capabilities, and the evidence required for acceptance.

Acceptance evidence includes representative allowed, review-required, escalated, and prohibited scenarios validated by the responsible product and domain participants.

#### Story 4.6: Build A Legacy-Repository Evaluation Set

Create evaluation cases from real completed work, known failures, integration boundaries, and common maintenance tasks. Preserve the repository state, task intent, expected evidence, environment, and graders needed for a meaningful comparison.

Acceptance evidence includes ordinary, boundary, failure, degraded-environment, and clean-control cases that distinguish incomplete scaffolding from a working end-to-end result.

#### Story 4.7: Pilot A Bounded Agent-Assisted Change

Select one real change with resolved intent and a manageable consequence. Use the local harness, shared registry assets, controls, evaluation, and runtime evidence available at the time. Keep human validation and acceptance connected to the product team.

Acceptance evidence includes the task contract, resolved context and asset versions, implementation, checks, review and correction, human intervention, outcome, and remaining uncertainty.

#### Story 4.8: Measure Delivery And Maintenance Effects

Compare the pilot and improved repository path with the previous workflow. Measure environment setup, build and test reliability, time to locate relevant context, first-pass completion, correction iterations, review burden, lead time, cost where available, and maintenance work created.

Acceptance evidence includes the baseline, observation boundary, task differences, quantitative results, qualitative team findings, and a decision supported by both.

#### Story 4.9: Publish Reusable Legacy Enablement Patterns

Identify which context, build, test, control, evaluation, and runtime improvements apply across repositories and which depend on local architecture or product constraints. Package reusable patterns in the appropriate guideline, skill, tool, check, or platform capability.

Acceptance evidence includes supporting repositories, applicability conditions, owner, evaluation evidence, and a next validation or release decision for each shared candidate.

#### Story 4.10: Decide The Next Repository Investment

Use the evidence to decide whether the repository is ready for broader bounded use, needs another harness improvement, or has an architectural constraint with a justified modernization case. Define the next outcome, product-team and central contributions, validation, and maintenance boundary.

Acceptance evidence includes a repository-specific decision and a cross-team recommendation for the next wave. Modernization proposals connect expected business and engineering value to the measured constraint they address.

### Ongoing Operation

Maintain the enabled paths as repositories, dependencies, teams, and release systems change. Product teams keep repository-specific instructions, tests, architecture, and acceptance knowledge current. The AI harness team maintains shared patterns, evaluation infrastructure, registry assets, and cross-team learning. Add repositories in waves so each expansion tests known patterns against new conditions and produces evidence for the next investment.

## Epic 5: Governed AI Registry And Marketplace v1

### Outcome

Engineers can discover and install maintained AI capabilities with visible purpose, ownership, source, version, dependencies, permissions, evaluation evidence, approval scope, and lifecycle status.

### Why This Matters

Engineers need to find the right reusable asset and understand its source, evidence, lifecycle, ownership, and appropriate use. Clear skill and plugin boundaries make installation and maintenance decisions understandable while reducing reinvention.

### Deliverables

The epic delivers the canonical registry repository structure, common metadata contract, skill-specific records, Claude Code marketplace, narrow plugin packaging, automated validation, and lifecycle views. Skills remain the primary governed behavior. Plugins provide the marketplace distribution boundary, with one-skill plugins as the default when a skill has an independent purpose or lifecycle.

### Initial Story Backlog

#### Story 5.1: Publish The Registry Source Structure

Define the authoritative locations for guidelines, skills, plugin wrappers, marketplace metadata, evaluations, examples, and validation scripts. Make the relationship between the skill source and marketplace package explicit.

Acceptance evidence includes a checked example that can be installed without relying on files outside its plugin directory.

#### Story 5.2: Publish The Registry Entry Contract

Require stable identity, purpose, owner, source, version, lifecycle, intended tasks, dependencies, permissions, evidence, approval boundary, change history, and retirement condition.

Acceptance evidence includes validated entries for representative skill, agent, workflow, tool, context, and policy assets.

#### Story 5.3: Release The Claude Code Marketplace v1

Package the first approved skills as narrow plugins and publish them through the company marketplace. Validate discovery, installation, namespace, update, disablement, and removal.

Acceptance evidence includes successful use in fresh Claude Code sessions by representative engineers working in both legacy and newer repositories.

#### Story 5.4: Consolidate Existing Skill And Plugin Overlap

Inventory current skill-governance and execution-related assets. Compare purpose, trigger, behavior, dependencies, and lifecycle. Keep one canonical skill for genuinely duplicated behavior and use narrow plugin boundaries for independent capabilities.

Use one-skill plugins as the default marketplace packaging. Bundle several skills only when evidence shows that users normally install, version, evaluate, update, and remove them together as one coherent capability. Shared use of Jira, a cloud service, or another tool does not by itself justify a shared plugin.

Acceptance evidence includes a migration map, the reason for each retained multi-skill bundle, supersession records, and removal of conflicting legacy entries after consumers migrate.

#### Story 5.5: Add Registry Validation To CI

Validate manifests, paths, required metadata, references, version consistency, duplicate identity, and lifecycle rules. Report actionable failures at review time.

Acceptance evidence includes positive fixtures and intentional failure cases for each enforced rule.

#### Story 5.6: Publish Asset Health And Lifecycle Views

Make missing ownership, stale evaluation, incompatible dependencies, deprecated consumers, failed synchronization, and unused assets visible.

Acceptance evidence includes decisions to update, restrict, consolidate, or retire real assets.

### Ongoing Operation

Review candidate admissions, dependency changes, evaluation freshness, ownership, and retirement. Keep marketplace growth subordinate to maintained usefulness. Domain teams own task-specific behavior; the central team operates shared schema, validation, distribution, and lifecycle reporting.

## Epic 6: Automated Quality Controls And Correction Loops v1

### Outcome

Agent-assisted work is connected to evidence that can cause the workflow to continue, revise, stop, roll back, or escalate. Reusable failures strengthen the engineering harness through appropriately placed controls.

### Why This Matters

Reliable agent-assisted work needs quality signals that influence what happens next. Tests, CI, static analysis, architecture constraints, monitoring, permissions, evaluators, and human decisions provide complementary controls at the layers where failures can be detected and addressed.

### Deliverables

The epic delivers a control catalogue, reusable integration patterns, evidence and decision contracts, correction-loop patterns, and the first controls connected to real team bottlenecks. It also establishes how failures become candidate regression cases, checks, monitoring, documented constraints, architecture decisions, or permission boundaries.

### Initial Story Backlog

#### Story 6.1: Publish The Control And Evidence Contract

Define the signal, protected outcome, decision, response, owner, scope, false-positive treatment, and retirement condition for a control. Distinguish behavioral guidance, deterministic enforcement, runtime monitoring, capability restriction, and acceptance decisions.

Acceptance evidence includes worked examples across delivery-time and runtime controls.

#### Story 6.2: Integrate Verification Into One Delivery Workflow

Connect task intent, implementation, deterministic checks, fresh independent review, correction, CI and automated feedback, and acceptance evidence. The independent reviewer should not be the agent run that produced the implementation. Valid findings and failed checks return the workflow to correction, followed by renewed verification and review.

```text
implementation
    -> deterministic checks
    -> fresh independent review
    -> correction
    -> CI and automated feedback
    -> correction
    -> accepted evidence
```

Acceptance evidence includes successful completion, check failure, review finding, repeated correction, unresolved evidence, and escalation cases in a representative legacy-repository workflow.

#### Story 6.3: Convert A Reusable Failure Into Infrastructure

Select a consequential or repeated failure and add the smallest reliable mechanism that detects or contains it. Retain the original case and verify that the control catches it without blocking representative clean work.

Acceptance evidence includes the reproduced failure, new control, clean controls, and ownership for maintenance.

#### Story 6.4: Add Runtime Feedback To The Improvement Loop

Connect incidents, monitoring, user corrections, and workflow failures to the harness backlog and retained regression suites where appropriate.

Acceptance evidence includes at least one operational signal that resulted in a delivery-time or runtime control and a visible decision.

#### Story 6.5: Establish Correction-Loop Boundaries

Define iteration, time, token, cost, permission, and escalation limits for automated correction. Use independent deterministic enforcement for consequential boundaries.

Acceptance evidence includes cases where the workflow corrects successfully and where it stops or escalates at the defined boundary.

### Ongoing Operation

Review controls for false positives, maintenance cost, changing risk, and continued relevance. Retire controls whose protected condition no longer applies. Preserve the rationale and evidence needed to understand why consequential controls exist.

## Epic 7: Trusted Engineering Knowledge Access v1

### Outcome

Engineers and agents can locate authoritative, current, task-relevant engineering knowledge without loading an entire repository or relying on unverified conversation history.

### Why This Matters

Engineering knowledge is distributed across code, configuration, tests, documentation, tickets, and individual experience. Engineers and agents need context assembly that makes authority, scope, freshness, conflicts, and system boundaries visible.

### Deliverables

The epic delivers repository context entry points, authoritative source mapping, retrieval interfaces, freshness and permission rules, context assembly evidence, and representative retrieval evaluations across legacy and newer repositories. Repository instructions tell agents and engineers where to begin. Detailed sources remain close to the systems they describe.

### Initial Story Backlog

#### Story 7.1: Establish Repository Context Entry Points

Create or improve the maintained instructions that identify important workflows, constraints, verification commands, architecture sources, and context locations for a repository.

Acceptance evidence includes successful orientation and task completion by engineers or agents without undocumented handoffs.

#### Story 7.2: Define Engineering Knowledge Authority And Freshness

Identify authoritative sources for architecture, interfaces, ownership, operations, policies, and delivery state. Define how freshness, supersession, and unavailable sources are represented.

Acceptance evidence includes resolved examples of conflicting or stale information.

#### Story 7.3: Deliver Task-Relevant Retrieval

Provide a retrieval route that selects relevant sources and supplies a compact context package. Record the source paths, versions, authority, and missing evidence used to assemble it.

Acceptance evidence includes representative repository tasks where retrieval improves coverage or reduces irrelevant context compared with the current approach.

#### Story 7.4: Evaluate Context Quality

Test relevance, coverage, freshness, permission enforcement, conflicting evidence, and unavailable-source behavior. Evaluate whether the selected context supports the intended task rather than measuring retrieval similarity alone.

Acceptance evidence includes retained positive, negative, stale, and authorization cases.

#### Story 7.5: Make Context Maintenance Visible

Surface broken links, stale generated maps, missing owners, outdated architecture statements, and retrieval failures through existing engineering workflows.

Acceptance evidence includes maintenance actions triggered by real findings.

### Ongoing Operation

Maintain authoritative source mappings and retrieval evaluations as repositories change. Product teams maintain repository-specific knowledge. The central team provides shared formats, retrieval capabilities, validation, and cross-team patterns.

## Epic 8: Evaluation System And Shared Baselines v1

### Outcome

The organization can decide whether a skill, agent, model configuration, or workflow is ready for a defined use and whether a candidate improves on the current baseline.

### Why This Matters

Repeatable quality requires evidence across representative tasks and recorded configurations. Shared evaluation contracts and baselines let teams compare changes, preserve important failures, and make bounded approval decisions as models, harnesses, context, tools, permissions, and environments change.

### Deliverables

The epic delivers evaluation contracts, representative case sets spanning legacy and newer repositories, deterministic and model-based graders, human calibration, baseline comparison, retained regressions, reporting, and staged-release gates. Evaluation evidence is linked to the concrete asset and runtime configuration in the registry.

### Initial Story Backlog

#### Story 8.1: Publish The Evaluation Contract

Define the decision, target workflow, task population, environment, trials, evidence, graders, thresholds, containment requirements, cost budget, and decision authority.

Acceptance evidence includes a completed contract for a real workflow and review by the people responsible for its outcome and risk.

#### Story 8.2: Build The Representative Suite Structure

Create development, capability, retained regression, holdout, and fresh-task sets appropriate to the workflow. Include ordinary success, boundary, failure, degraded environment, and clean-control cases across relevant legacy and newer repository conditions. Record repository topology, build and test reliability, context quality, and task family so differences remain visible.

Acceptance evidence includes grader validation against known passing and failing artifacts.

#### Story 8.3: Establish Deterministic And Model-Based Grading

Use compilation, tests, schemas, state inspection, and policy checks for verifiable criteria. Use model-based graders for explicit qualitative criteria and calibrate them against expert human judgments.

Acceptance evidence includes agreement and disagreement analysis by criterion and a human adjudication route for consequential ambiguity.

#### Story 8.4: Publish The First Shared Baseline

Run the current workflow and candidate under comparable conditions. Report outcome quality, containment, cost, latency, correction, and uncertainty without hiding critical dimensions inside one score.

Acceptance evidence includes resolved versions, environment, repeated trials where needed, and a promotion or revision decision.

#### Story 8.5: Connect Evaluation To Registry And Release

Make evaluation evidence affect candidate, evaluated, approved, restricted, or deprecated state. Re-evaluate when the model, harness, tools, context, permissions, environment, or task distribution changes materially.

Acceptance evidence includes an asset whose release state changes because of evaluation results.

### Ongoing Operation

Maintain fresh cases, calibrate graders, inspect evaluation-environment failures, and add consequential reusable failures to retained suites. Evaluation owners and domain experts review whether suites continue to represent real delivery work.

## Epic 9: Build, Test And Release Pipeline Optimization v1

### Outcome

Software changes receive fast, reliable, observable, and actionable feedback from local build through test, integration, artifact creation, release, and rollback. Engineers and agents can use the same trusted pipeline interfaces and evidence.

### Why This Matters

AI can increase the rate at which changes are proposed, making existing build, test, review, and release constraints more visible. Engineering efficiency improves when the complete path to an accepted and releasable change becomes faster and more reliable, while preserving quality, containment, human understanding, and recovery.

### Deliverables

The epic delivers an end-to-end pipeline map and baseline across representative legacy and newer repositories, common flow and reliability telemetry, a prioritized constraint backlog, improvements to build and test feedback, dependable artifact and environment reuse, more efficient release progression, and machine-readable interfaces that allow agents to trigger bounded work and interpret results safely.

Optimization uses accepted outcomes as the unit of value. Improvements are evaluated across lead time, waiting time, first-pass acceptance, rework, flaky failure, infrastructure cost, human attention, and recovery burden. Local stage speed is considered together with its downstream effect.

### Initial Story Backlog

#### Story 9.1: Establish The End-To-End Pipeline Baseline

Map the actual path from an eligible software change through local verification, shared CI, integration, artifact creation, release, and production confirmation in representative legacy and newer repositories. Include waiting for environments, capacity, approvals, dependencies, and recovery where they affect flow.

Acceptance evidence includes processing and waiting time by stage, work in progress, throughput, first-pass acceptance, rework, flaky failures, human touch time, cost where available, and the current limiting constraint for representative repositories or task families.

#### Story 9.2: Publish Common Pipeline Telemetry And Result Contracts

Define machine-readable states and results for build, test, integration, artifact, release, and rollback stages. Preserve source revision, configuration, environment, checks performed, artifacts produced, failure classification, timing, and links to detailed evidence.

Acceptance evidence includes successful, failed, cancelled, timed-out, flaky, retried, partially completed, and unavailable-dependency cases. Engineers and agents can identify the failed stage and the next supported action without parsing unbounded logs.

#### Story 9.3: Reduce The Build And Environment Critical Path

Improve the current build or environment constraint using measured changes such as dependency caching, incremental builds, reusable environments, remote execution, artifact reuse, or reduced setup work. Cache keys and reuse boundaries must reflect relevant source, dependency, configuration, permission, and environment state.

Acceptance evidence compares the complete pipeline before and after the change, including cache correctness, cold and warm performance, infrastructure cost, failure behavior, and downstream acceptance.

#### Story 9.4: Improve Test Feedback Speed And Reliability

Provide the earliest reliable test signal appropriate to the change while preserving the broader checks required for integration and release. Candidate improvements include test selection, parallel execution, stable test partitioning, fixture reuse, flaky-test diagnosis, and clear separation of product failure from environment failure.

Acceptance evidence includes detection quality, time to actionable failure, missed relevant failures, flaky and infrastructure failure rates, rerun behavior, cost, and effect on the final acceptance suite.

#### Story 9.5: Make Artifact Creation And Promotion Reusable

Produce immutable, traceable artifacts once and promote the same verified artifact through later environments where the delivery architecture permits it. Connect artifacts to source, dependencies, build configuration, checks, provenance, and release state.

Acceptance evidence includes artifact integrity, provenance, compatibility, promotion, rejection, retention, and cleanup cases. Rebuilding or mutating an artifact creates a new identity and verification boundary.

#### Story 9.6: Improve Release Progression And Recovery

Define efficient release stages, automated evidence collection, approval inputs, bounded rollout, health confirmation, pause, rollback, and recovery. Focus automation on repeatable mechanics while keeping consequential product and operational judgment with the responsible people.

Acceptance evidence includes successful progression, blocked evidence, failed health signal, pause, rollback, partial release, and recovery cases, together with comparison of release lead time and human burden.

#### Story 9.7: Expose Safe Pipeline Interfaces To Agents

Provide narrow tools or APIs through which approved agents can request builds, tests, artifacts, or releases and receive compact structured ground truth. Enforce repository, environment, credential, action, concurrency, and cost boundaries outside the agent instructions.

Acceptance evidence includes authorized and blocked requests, duplicate or idempotent invocation, stale revision, unavailable capacity, structured failure interpretation, policy escalation, and traceability to the initiating agent run.

#### Story 9.8: Run The Pipeline Optimization Loop

Select the measured system constraint, state the expected improvement mechanism, change one material variable where attribution matters, evaluate with representative work, and pilot with real queues and human participation. Keep, revise, or revert the change using quality-adjusted end-to-end evidence, then identify the new constraint.

Acceptance evidence includes the baseline, hypothesis, change, observation period, task family, quality and containment results, lead-time and cost effects, human burden, rollback condition, and resulting decision.

### Ongoing Operation

Continuously monitor pipeline flow, reliability, capacity, cost, queueing, flaky behavior, stale work, and recovery. Re-evaluate optimizations as repositories, dependencies, tests, infrastructure, release policies, and agent workloads change. Product teams own repository-specific build and test behavior; the AI harness and developer-platform capabilities provide shared measurement, interfaces, patterns, and implementation support.

## Epic 10: Observable Agent Runtime v1

### Outcome

The platform can execute bounded agent work reliably and produce authoritative records of what ran, what it accessed, what it attempted, what changed, what evidence it produced, and how the run ended.

### Why This Matters

Consistent agent execution requires a runtime that resolves models, skills, tools, context, permissions, budgets, state, and environment through a common contract. Authoritative telemetry makes the resulting behavior reconstructable, evaluable, governable, and systematically improvable.

### Deliverables

The epic delivers the agent deployment contract, execution state model, task and result contracts, capability enforcement, runtime telemetry schema, trace storage, failure classification, cost and latency reporting, and one bounded production-quality pilot.

### Initial Story Backlog

#### Story 10.1: Publish The Runtime And Deployment Contract

Define how an agent definition, deployment metadata, task input, runtime policy, and result contract are resolved for one worker run. Keep LLM-visible instructions separate from platform configuration and telemetry.

Acceptance evidence includes schema validation and representative resolved examples.

#### Story 10.2: Implement The Agent Run State Model

Represent ready, active, awaiting input or review, failed, cancelled, and completed states as appropriate. Preserve state transitions, decision reasons, claims or leases, and recovery behavior.

Acceptance evidence includes normal completion, timeout, cancellation, stale claim, retry, and partial-effect cases.

#### Story 10.3: Enforce Capabilities And Budgets

Apply tool, filesystem, network, credential, time, token, cost, concurrency, and delegation limits outside the agent's editable instructions.

Acceptance evidence includes allowed, blocked, escalated, and exhausted-budget cases.

#### Story 10.4: Emit Authoritative Runtime Telemetry

Record resolved versions, context sources, tool calls, policy decisions, state changes, artifacts, verification, human corrections, cost, latency, and outcome. Compare platform state with agent self-report and external state for consequential actions.

Acceptance evidence includes complete and intentionally incomplete trace-conformance cases.

#### Story 10.5: Deliver A Bounded Runtime Pilot

Run one selected engineering workflow in a representative legacy repository with limited users, task classes, permissions, and duration. Compare it with the existing workflow and collect product-team feedback.

Acceptance evidence includes outcome, containment, cost, correction, operational findings, and a decision about the next release boundary.

### Ongoing Operation

Operate runtime reliability, compatibility, telemetry quality, cost, policy enforcement, and incident response. Maintain the runtime contract as models, harnesses, tools, and workflows evolve.

## Scale Workstream: Validated Workflow Automations

### Outcome

Selected delivery bottlenecks are improved through bounded automation that demonstrates value in real product-team work and has a sustainable maintenance boundary.

### Portfolio Role

Validated Workflow Automations is a scale workstream rather than one indefinitely broad delivery epic. Management may use it as a portfolio heading, while each funded scenario appears on the roadmap as a named epic with its own baseline, deliverable, teams, evidence, and completion decision.

Examples of named scenario epics include Automated Pull-Request Review And Correction, Automated Acceptance-Evidence Validation, Automated Delivery-Status Synchronization, or Automated Cloud Failure Diagnosis. These examples become roadmap commitments only when team evidence establishes the need and a bounded intervention can be evaluated.

The numbered items below are the reusable story pattern for a selected scenario, not generic implementation commitments under one broad automation epic. When discovery validates a scenario, create its named epic and instantiate the applicable stories beneath it. Preserve the scenario's own identity, baseline, participating teams, permissions, evidence, and maintenance boundary.

### Scenario Epic Contract

Every scenario epic should define:

```text
Observed bottleneck and affected delivery outcome:
Supporting team and workflow evidence:
Current baseline:
Automation boundary:
Required knowledge, tools, permissions, and controls:
Product-team contribution:
AI harness team contribution:
Evaluation and pilot population:
Expected outcome and tradeoff:
Maintenance and ownership boundary:
Promotion, restriction, or retirement decision:
```

### Reusable Story Pattern For Each Named Scenario Epic

#### Scenario Pattern S.1: Establish The Current Workflow And Baseline

Trace a real case from intent to accepted outcome. Quantify waiting, manual work, rework, risk, or quality where the available evidence permits.

#### Scenario Pattern S.2: Design The Bounded Automation

Define the automated and human responsibilities, inputs, outputs, tools, permissions, evidence, correction loop, and stopping conditions.

#### Scenario Pattern S.3: Implement And Evaluate The Candidate

Build the smallest useful workflow and evaluate it against the current baseline using representative cases and retained failures.

#### Scenario Pattern S.4: Pilot With The Originating Team

Use the automation in real work with an explicit validation and feedback route. Capture unexpected maintenance, context, integration, and review burden.

#### Scenario Pattern S.5: Decide Local Or Shared Promotion

Keep repository-specific behavior local. Promote the reusable core when several teams have the same need or when the originating evidence and broader validation justify shared investment.

#### Scenario Pattern S.6: Establish Maintenance And Feedback

Record who participates in validation, decisions, coordination, and maintenance for the deployed scenario. Connect failures and workflow changes to its evaluation and improvement backlog.

### Ongoing Operation

Maintain only scenarios with demonstrated use, value, ownership, and current evidence. Review scenarios when team workflows, dependencies, models, or permissions change.

## Epic 11: Governed Agent Operations v1

### Outcome

The organization can operate several approved agents and workflows across teams with consistent policy, evaluation gates, version resolution, auditability, health visibility, rollout, and rollback.

### Why This Matters

Operating several agents and workflows across teams requires consistent approval, version resolution, compatibility, dependency impact, and lifecycle decisions. The organization needs to know what may run, where it may run, who consumes it, whether its evidence remains current, and how versions are restricted, replaced, or removed.

### Deliverables

The epic delivers registry-integrated deployment, policy-based activation, evaluation gates, environment compatibility, fleet-level health, rollout and rollback controls, dependency impact analysis, incident response, and lifecycle reporting for agents and governed workflows.

### Initial Story Backlog

#### Story 11.1: Connect Registry Approval To Runtime Activation

Resolve each run to an immutable approved agent, skill, model, policy, and context configuration. Enforce approval scope by task, environment, data class, permission, and autonomy level.

Acceptance evidence includes approved, incompatible, restricted, revoked, and superseded cases.

#### Story 11.2: Implement Evaluation-Gated Promotion

Connect candidate, evaluated, approved, restricted, deprecated, and retired states to release and activation. Preserve the evidence and decision behind each transition.

Acceptance evidence includes promotion, failed promotion, rollback, and expiry or review-condition cases.

#### Story 11.3: Publish Agent And Workflow Health

Report usage, accepted outcomes, correction, failures, policy violations, stale evaluations, incompatible dependencies, cost, latency, and affected consumers.

Acceptance evidence includes real lifecycle or operational decisions made from the view.

#### Story 11.4: Implement Controlled Rollout And Rollback

Support limited users, repositories, task classes, permissions, and duration. Resolve mutable aliases to concrete versions and preserve rollback to the previous trusted baseline.

Acceptance evidence includes canary, pause, rollback, and consumer-impact cases.

#### Story 11.5: Establish Incident And Revocation Handling

Define how harmful behavior, supply-chain issues, severe regressions, or lost ownership result in restriction or revocation. Identify consumers and preserve investigation evidence.

Acceptance evidence includes a simulated or real incident exercise.

#### Story 11.6: Enable Federated Asset And Agent Ownership

Allow domain teams to own behavior and acceptance while the central platform provides schema, evaluation infrastructure, policy enforcement, telemetry, distribution, and lifecycle reporting.

Acceptance evidence includes a domain-owned agent or workflow operated through the common platform contract.

### Ongoing Operation

Review agent health, evaluation freshness, policy changes, dependency impact, cost, incidents, and retirement. Expand autonomy only where evidence and containment justify the larger boundary.

## Operating Backlog

### Work Types

Use explicit work types so continuous operations remain visible without turning every activity into a roadmap milestone.

| Work type | Purpose | Typical result |
| --- | --- | --- |
| Discovery | Learn from delivery work and local harness use | Evidence-backed bottleneck, useful pattern, or missing evidence |
| Joint improvement | Solve a bounded problem with a product team | Validated local improvement and reusable candidate |
| Shared capability | Build registry, evaluation, knowledge, control, or runtime infrastructure | Versioned platform or asset increment |
| Maintenance | Keep active assets and services reliable and current | Corrected failure, updated dependency, refreshed evaluation, or retirement |
| Enablement | Help teams adopt and maintain useful practices | Demonstrated workflow, local capability, and continued feedback route |
| Support | Resolve a bounded current need | Answer, diagnosis, repair, or escalation with captured learning |

### Intake And Prioritization

Accept evidence from health checks, delivery work, retrospectives, planning, local insights, incidents, evaluation failures, registry health, and platform telemetry. Record the underlying workflow and consequence before selecting a solution.

Prioritize using a small set of explicit factors:

- effect on delivery, product, reliability, security, or engineer burden
- recurrence across tasks, repositories, or teams
- strength and representativeness of the evidence
- feasibility of a bounded improvement and evaluation
- reusable value and number of affected consumers
- maintenance, permission, integration, and operational cost
- urgency created by a failure, dependency change, or lost ownership

Use these factors to support judgment rather than hiding decisions inside a single numerical score. Preserve important minority or high-consequence findings even when their frequency is low.

### Work Lifecycle

Use a visible lifecycle that connects learning to maintenance:

```text
observed
  -> evidence needed
  -> validated need
  -> selected
  -> designed
  -> implemented
  -> evaluated
  -> team pilot
  -> promoted, kept local, revised, or stopped
  -> maintained
```

The state should show the next decision and required evidence. A promising idea remains in evidence gathering until a real workflow, affected outcome, and validation route are clear.

### Cadence

#### Weekly Evidence And Delivery Triage

Review new team evidence, failures, blocked work, registry health, evaluation regressions, and platform incidents. Decide which items need immediate containment, additional evidence, a local improvement, or consideration for shared investment.

#### Sprint Or Continuous Delivery Cycle

Deliver bounded stories from the active roadmap and operating backlog. Keep work reviewable and connect each story to the epic deliverable or operational result it advances.

#### Monthly Cross-Team Pattern Review

Compare findings across teams and repositories. Review reusable candidates, local constraints, recurring maintenance gaps, duplicate assets, and workflow outcomes. Decide what remains local, what receives another validation, and what enters the shared roadmap.

#### Quarterly Roadmap Review

Review delivered capabilities, outcome evidence, maintenance burden, adoption and correction signals, unresolved bottlenecks, and dependencies. Update sequencing and investment based on evidence. Carry forward an epic only when its remaining deliverable and decision are explicit.

## Story Design

### Story Contract

Every material AI harness story should make the following information visible in prose or structured fields:

```text
Current workflow and observed problem:
Affected engineers, teams, systems, or outcomes:
Supporting evidence and missing evidence:
Deliverable:
Expected outcome and principal tradeoff:
AI harness team contribution:
Product-team or domain contribution:
Dependencies, permissions, and constraints:
Acceptance and evaluation evidence:
Reusable part and local part:
Decision, validation, coordination, and maintenance responsibilities:
```

### Ready For Delivery

A story is ready when the affected workflow and intended outcome are understood well enough to make a bounded change, the required contributors and evidence sources are available, important authority or architecture decisions are resolved, and acceptance can be demonstrated.

Discovery stories can begin with uncertainty because resolving that uncertainty is their deliverable. Implementation stories should not conceal unresolved product, permission, data, or architecture decisions inside coding work.

### Complete

A story is complete when its stated deliverable exists, relevant checks and evaluations have run, important failures and uncertainty are visible, the responsible people have validated the result, documentation and registry state are current, and the next maintenance or release decision is recorded.

Completion of a pilot means the pilot question has been answered. It does not automatically mean organization-wide promotion.

## Roadmap Reporting

Report roadmap progress through delivered capability and evidence rather than activity volume. A management update should answer:

1. What became available or materially improved?
2. Which teams or workflows validated it?
3. What delivery, quality, burden, cost, or risk evidence changed?
4. What important failure, limitation, or maintenance need was learned?
5. What decision follows: expand, revise, keep local, restrict, retire, or gather more evidence?

Useful portfolio measures include teams with an active feedback route, team bottlenecks with a bounded joint action, maintained registry assets with current evidence, evaluated workflows promoted or stopped, recurring failures converted into controls, time from validated need to usable improvement, correction and acceptance rates, and maintenance work created by shared capabilities.

Counts of prompts, generated code, registered assets, agents, or automations provide context but do not demonstrate engineering improvement by themselves.

## Responsibilities

### AI Harness Team

The AI harness team owns shared contracts, cross-team synthesis, registry and marketplace infrastructure, common evaluation capability, reusable control patterns, platform runtime capabilities, and implementation support. It makes shared capabilities easy to adopt and keeps their limitations, evidence, and lifecycle visible.

### Product And Delivery Teams

Delivery teams contribute real workflow evidence, local constraints, acceptance judgment, repository-specific knowledge, and maintenance of local harness behavior. Participation should include the roles involved in moving work from intent to accepted outcome. Each action still records explicit decision, validation, coordination, and maintenance responsibility.

### Domain And Platform Partners

Security, cloud, developer platform, data, architecture, and other domain partners contribute authority, controls, integrations, evaluation criteria, and operational knowledge where the roadmap affects their systems or risk boundaries.

### Management

Management sets organizational priorities, resolves cross-team investment and authority questions, reviews delivered outcomes and maintenance cost, and supports the participation needed for product teams and the AI harness team to improve the engineering system together.

## Relationship To Other Documents

- `ai-harness-team-discovery-and-feedback.md` defines the complete discovery and continuing-feedback framework.
- `ai-harness-team-discovery-meeting-template.md` defines the 60-minute full-team engagement.
- `local-harness-insights-and-health-check.md` defines the engineer-driven local health-check workflow.
- `ai-engineering-metrics.md` defines measurement principles for AI-assisted engineering.
- `ai-asset-registry.md` defines registry metadata, evidence, permissions, distribution, and lifecycle.
- `agent-workflow-evaluation.md` defines evaluation contracts, suites, graders, baselines, staged release, and production feedback.
- `ai-harness-engineering.md` defines harness components, guardrails, control loops, context routing, and quality gates.
- `agent-pipeline-optimization.md` defines end-to-end flow measurement, constraint analysis, optimization experiments, quality-adjusted throughput, and recovery.
- `agent-context-systems.md` and `product-engineering-context-platform.md` define context authority, retrieval, memory, and engineering knowledge access.
- `governed-agentic-development.md` defines governed agent workflow and runtime responsibilities.
- `../guidelines/skill-guideline.md` and `../guidelines/agent-guideline.md` define the construction of skills and agents.

## Summary

The roadmap gives management a deliverable view of the AI harness investment while preserving the continuous operating work required for success. Evidence and team collaboration identify the right problems. Shared foundations make improvements reusable and governable. Pipeline optimization provides fast and reliable engineering feedback. Named automation scenarios prove value in real delivery work. Observable runtime and governed operations support scale once the necessary contracts, evaluations, controls, and feedback exist.

The central AI harness team succeeds when product teams can improve and maintain their local harnesses, recurring needs become trusted shared capabilities, and roadmap investment produces observable engineering outcomes rather than a growing catalogue of AI activity.

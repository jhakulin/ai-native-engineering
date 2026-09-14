# AI Harness Team Discovery And Continuous Feedback

## Purpose

This document defines how to learn from software-development teams working across different products and repositories. The discovery should identify where the engineering system limits effective AI-assisted work, which improvements can be reused across teams, and which constraints must remain local.

Interviews provide the starting evidence. Findings should be validated against repository artifacts, recent work, delivery data, and concrete examples. The longer-term objective is a continuous feedback system embedded in normal engineering work.

The assessment evaluates workflows and systems—not individual performance, team maturity, or visible AI adoption.

## Intended Outcomes

The discovery should produce:

- a comparable AI-harness profile for each team and repository
- an evidence-backed map of recurring pain points, bottlenecks, manual work, and poor practices
- an inventory of existing AI tools, instructions, skills, workflows, checks, and experiments
- reusable patterns that apply across several teams
- explicit local constraints that should not be generalized
- a prioritized harness-improvement and automation backlog
- candidates for documentation, skills, tools, checks, context sources, and governed workflows
- baseline measures for evaluating whether improvements help
- a lightweight mechanism for teams to continue supplying feedback
- clear ownership for cross-team standards and team-specific action

These outcomes describe what the discovery must accomplish. The later deliverables describe how the findings are packaged and communicated; they do not replace or narrow this outcome set.

## Engagement And Ownership Model

The discovery is a joint engineering activity, not a requirements-gathering exercise for a central harness team. The central team can provide shared infrastructure, guidance, evaluation methods, cross-team learning, and implementation support. It cannot know or maintain every repository's product intent, architecture, delivery constraints, and accepted-outcome evidence on behalf of the team doing the work.

Use a federated responsibility model. The table describes the usual center of responsibility, not an absolute boundary; a concrete improvement may require joint work, and its decision, implementation, validation, coordination, and maintenance responsibilities may belong to different people or groups.

| Product-team primary responsibility | Central harness-team primary responsibility |
| --- | --- |
| Problems and priorities in its delivery workflow | Cross-team discovery, synthesis, and reusable problem patterns |
| Repository-specific instructions, constraints, checks, and adapters | Shared standards, reference patterns, platforms, and registries |
| Evidence that a change improves accepted delivery | Common evaluation methods and assurance controls |
| Local adoption, operation, correction, and retirement | Shared-asset compatibility, distribution, and lifecycle visibility |
| Product, architecture, and risk decisions inside its authority | Company-wide tooling, security, and governance boundaries |

The working agreement with teams is:

> The harness team will build with the product team, not separately from it. The delivery team contributes examples, validates findings, shapes what works locally, and keeps team-specific parts current. The central team provides shared capability, cross-team learning, evaluation methods, and implementation support.

Every repository-specific improvement should originate from concrete team evidence and involve the delivery team collectively. The team explains the problem, supplies representative cases, validates behavior, preserves local constraints, incorporates the work into planning, and keeps team-specific parts current. Collective participation does not replace explicit accountability: each agreed action should identify who or which roles decide, validate, coordinate, and maintain it. These responsibilities may be distributed rather than assigned to one permanent owner. The central team may perform substantial implementation work, especially during an initial engagement, but it should not become the permanent source of local delivery knowledge.

The normal direction is to develop locally and promote selectively:

```text
team observes a delivery problem
              |
              v
team and harness group diagnose it
              |
              v
bounded local improvement and evaluation
              |
              v
stable core and applicability boundary identified
              |
              v
cross-team validation
              |
              v
shared asset with team-owned local adapters
```

Do not treat a repository-specific item as centrally maintainable without delivery-team participation, representative evidence, and a route for local maintenance. If the team lacks capacity to participate, record that as a delivery-system constraint rather than hiding it through central ownership.

## Core Discovery Model

```text
team goals and product constraints
              |
              v
actual engineering workflow and evidence
              |
              v
friction, manual work, failures, and workarounds
              |
              v
root cause and reuse boundary
              |
              v
harness, practice, or system improvement candidate
              |
              v
bounded experiment and evaluation
              |
              v
adopt, revise, localize, or reject
              |
              v
planning, delivery, and retrospective feedback
```

The key distinction is between a reported symptom and an improvement candidate. “AI gives poor answers” is a symptom. The cause may be missing repository navigation, conflicting documentation, weak task contracts, a model limitation, an unsuitable tool, an unavailable test environment, or a problem that requires human product judgment. The proposed response depends on that diagnosis.

## Guiding Principles

### Study Work, Not Tool Preference

Begin with how the team delivers and maintains software. Tool preferences are useful context but should not define the assessment. The same underlying problem may appear in Codex, Claude Code, another assistant, or a manual workflow.

### Ask For Recent Examples

General opinions are easy to produce and difficult to act on. Ask teams to reconstruct recent tasks, pull requests, incidents, reviews, or debugging sessions. Concrete examples reveal where context came from, which steps were manual, how much rework occurred, and what evidence established completion.

### Triangulate Interview Claims

Interviews reveal experience, invisible work, and local reasoning. Repository files, CI, issue states, pull requests, workflow logs, and metrics reveal other parts of the system. Neither source is complete alone.

### Preserve Local Context

Different products have different risk, architecture, compliance, runtime, customer, and lifecycle constraints. A practice observed in three teams may reflect three similar repositories rather than a company-wide standard. Record where a pattern applies and where it does not.

### Optimize For Accepted Outcomes

Do not assume that faster code generation improves delivery. Examine requirements, planning, context discovery, implementation, testing, review, integration, deployment, operations, and learning. Bottlenecks often move downstream when implementation accelerates.

### Keep Feedback Safe

Engineers should be able to report failed experiments, poor practices, and unsafe AI behavior without creating performance risk for themselves. Report team and system patterns, avoid unnecessary personal attribution, and agree in advance how sensitive findings will be handled.

## Unit Of Analysis

Use the team-repository-workflow combination as the primary unit. One team may own several repositories with different needs; one repository may support several products or teams. Record the relationship rather than forcing one score per team.

For each unit, capture:

- product or service purpose and critical user outcomes
- team responsibilities and important dependencies
- repository type, size, age, language, and architecture shape
- operational, security, compliance, and data sensitivity
- normal work types and their approximate frequency
- development and release model
- current AI tools and access constraints
- representative workflow selected for deeper examination

This context makes cross-team comparison meaningful. A regulated payment service and an internal documentation site should not be expected to use the same autonomy or verification profile.

## Evidence Sources

Use a small evidence package rather than relying only on a meeting:

| Source | What it can reveal |
| --- | --- |
| Team interview | Experience, hidden work, workarounds, trust, and local constraints |
| Repository entry points | Discoverability, instructions, architecture, commands, and authority mapping |
| Recent task and pull request | Actual context, handoffs, review, proof, and rework |
| CI and test configuration | Deterministic feedback, duration, reliability, and missing gates |
| Issue tracker or board | Readiness, dependencies, waiting, stale state, and manual coordination |
| Incident or defect example | Runtime gaps and missing durable controls |
| Agent trace or demonstration | Tool use, context, iterations, failures, and manual steering |
| Engineer-approved local insights report | Repeated session friction, environment health, context burden, and harness usage without centralizing raw conversations |
| Existing metrics | Cycle time, review time, failures, rollbacks, and accepted output |
| Team retrospective notes | Repeated friction and improvement history |

Ask for evidence that already exists. Do not require teams to produce extensive preparation documents merely to participate.

## Discovery Areas

### 1. Product, Team, And Risk Context

Understand what the team is responsible for before judging its workflow. Identify critical user journeys, availability needs, sensitive data, regulated behavior, public contracts, irreversible operations, and specialist approvals. Ask which kinds of mistakes are expensive and which changes are easy to reverse.

This determines where AI can act asynchronously, where it should remain proposal-only, and what evidence a trustworthy workflow needs.

### 2. Actual Engineering Flow

Map one or two representative work types from intent to production or another accepted outcome. Include waiting, clarification, handoffs, environment setup, review, release, and recovery—not only active coding.

Useful work types include a normal feature, recurring bug, dependency update, incident correction, documentation change, or cross-repository change. Record who owns each decision, what artifact moves between stages, which steps are deterministic, and where the work returns for correction.

Look for queues, large batches, unclear readiness, repeated rediscovery, long feedback cycles, manual copying, and work that is started before a decision or dependency is ready.

### 3. Current AI Use And Harness Inventory

Identify where AI is used today: exploration, planning, implementation, debugging, testing, documentation, review, operations, research, or task management. Record which tools, models, repository instructions, skills, extensions, context sources, scripts, and workflows influence the result.

Ask what engineers still do manually around the agent: collecting files, rewriting tickets, pasting errors, approving routine tool calls, moving task state, rerunning commands, formatting output, checking citations, or reconstructing context after a session ends.

Distinguish personal techniques from shared team practices and governed reusable assets.

### 4. Repository Agent Readiness And Documentation

Assess whether a new engineer or agent can determine:

- what the repository does and its important boundaries
- where authoritative code, tests, schemas, configuration, and decisions live
- how to build, run, test, lint, validate, and debug it
- which generated artifacts and dependency rules apply
- which constraints are not apparent from code
- what must not be changed without broader review
- how to verify common changes

Look for missing entry points, stale or duplicated documentation, contradictory commands, implicit architecture, undocumented generated files, tribal knowledge, and large instruction files that mix stable rules with task-specific detail.

The goal is not more documentation. Determine whether code, automation, structure, generated references, or concise navigation would express the information more reliably.

### 5. Context Discovery And Handoffs

Examine how engineers and agents locate relevant files, dependencies, ownership, product intent, past decisions, and runtime evidence. Identify sources that are difficult to search, inaccessible to agents, stale, permission-sensitive, or distributed across repositories and external systems.

Ask where fresh sessions or sub-agents lose essential context, where long conversations become noisy, and which information engineers repeatedly assemble by hand. Look for opportunities in repository maps, exact search, context compilation, task templates, structured tools, graph slices, or improved source ownership before proposing a general RAG system.

### 6. Task Definition And Planning

Review whether work enters implementation with a clear outcome, constraints, non-goals, relevant sources, acceptance criteria, expected proof, dependencies, and decision owner. Identify tickets that are vague, over-specified, oversized, or split so narrowly that they lose design context.

Ask how product intent, technical design, and implementation tasks are connected. Determine which planning activities genuinely reduce rework and which exist only as administrative overhead. Explore where AI can propose clarification, task slices, edge cases, or verification plans without inventing product or architecture decisions.

### 7. Implementation Workflow And Manual Work

Reconstruct what happens between taking a task and opening a proposed change. Record environment preparation, branch and worktree management, code search, repeated commands, local checks, dependency operations, screenshots, pull-request creation, and state updates.

For each manual step, ask whether it is frequent, rule-based, error-prone, and objectively verifiable. Exact repeated operations are stronger deterministic automation candidates than decisions requiring product, architecture, or risk judgment.

Also identify poor practices that make both human and agent work unreliable: dirty workspaces, unreviewed large diffs, skipped checks, changes without task context, copied secrets, broad permissions, or accepting code nobody understands.

### 8. Testing, Review, And Quality Control

Understand how the team knows a change is correct. Examine test levels, environment realism, CI duration and reliability, manual testing, model review, human review, security checks, and runtime feedback.

Ask which failures are found late, which review comments recur, where tests are missing or untrusted, which checks produce noise, and whether AI-generated tests are reviewed against intended behavior. Identify bottlenecks in specialist review and whether evidence-bearing handoffs could reduce mechanical work.

Capture examples where AI found a real defect, created a false finding, passed tests while breaking a real flow, or caused review and maintainability problems.

### 9. Skills And Reusable AI Assets

Inventory skills, prompts, commands, agents, extensions, scripts, and workflows the team reuses. For each, determine its source, owner, trigger, dependencies, permissions, expected output, evaluation evidence, consumers, and update method.

Ask which personal practices deserve shared evaluation, which assets overlap or conflict, and which have become stale. Look for workflows that recur across teams but retain repository-specific adapters. Avoid turning every successful prompt into a permanent skill.

### 10. Harness Maintenance And Change Management

Harness maintenance is a primary discovery area because the value and reliability of AI-assisted engineering depend on the harness remaining understandable, current, compatible, and verifiable. Examine the complete set of components that shape agent behavior: repository instructions such as `AGENTS.md` or `CLAUDE.md`, skills, prompts, commands, agents, hooks, extensions, plugins, MCP servers, deterministic scripts, context indexes, evaluation suites, model configuration, tool permissions, and shared workflow definitions.

Inventory alone is insufficient. For each consequential component, determine:

- which source is authoritative and how concrete executions resolve a version
- who owns the component and who can approve changes
- whether it is local, shared, external, generated, or copied from another source
- what event causes it to be updated
- how changes are reviewed and verified
- which models, harnesses, repositories, tools, and environments it supports
- how teams receive new versions and how local changes are reconciled
- whether consumers can pin, test, roll back, or opt out of a version
- which data, permissions, network access, and side effects it can introduce
- how stale, conflicting, unused, deprecated, or unsafe components are detected and retired

Ask the team to show one harness component that changed recently. Reconstruct what triggered the change, which evidence supported it, who reviewed it, how it was distributed, and how the team would know if the change made future work worse. Also ask for an example of a stale instruction, broken skill, incompatible tool, false skill activation, duplicated rule, or unclear active version if one exists. Concrete maintenance history reveals the operating model more reliably than a claim that assets are “kept current.”

Repository instructions deserve specific inspection. Determine whether they remain concise entry points, point to authoritative sources, distinguish stable constraints from temporary task guidance, and avoid duplicating generic model knowledge. Check whether commands still work, referenced paths exist, architecture and permission boundaries remain accurate, and conflicting instruction files have a defined precedence.

Skills and other reusable behavior need a lifecycle beyond source control. Examine routing triggers and false activations, referenced files and executable helpers, dependency and permission changes, representative execution evidence, ownership, consumers, and retirement. An automatically generated skill should remain a candidate proposal until task-specific assumptions are removed and its routing, output, and boundaries are evaluated.

Measure the maintenance burden as well as asset value. Record manual copying, cross-repository reconciliation, compatibility testing, recurring support, failures caused by drift, and time spent determining which version is active. A centralized asset can reduce duplication while also creating a shared bottleneck or larger blast radius.

The desired maintenance loop is:

```text
observed need, failure, or dependency change
                |
                v
bounded harness change proposal
                |
                v
review of source, capability, and compatibility
                |
                v
representative evaluation and approval
                |
                v
versioned distribution and observable adoption
                |
                v
feedback, regression, revision, rollback, or retirement
```

### 11. Delivery Pipeline And Bottlenecks

Identify the current system constraint using lead time, waiting, work in progress, first-pass acceptance, rework, review queues, CI, conflicts, deployment, and recovery. Ask where faster AI implementation has increased pressure elsewhere.

Ask where AI has released meaningful engineering capacity, where the team chose to reinvest it, and whether existing product, quality, reliability, security, customer, or delivery outcomes improved. Released capacity that disappears into additional work in progress or downstream review queues is evidence of a moved bottleneck rather than realized value.

Explore opportunities to improve input quality, reduce batch size, move exact work into deterministic scripts, compile smaller context, route models by task, bound retries, control concurrency, cache source-derived artifacts, and improve review evidence. Evaluate the whole accepted outcome rather than local model speed.

### 12. Governance, Security, And Trust

Document approved tools, data rules, credentials, network access, external integrations, production capability, human approvals, and audit requirements. Ask where policy is unclear, where engineers use workarounds, and where repeated approval prompts encourage automatic consent.

Explore what creates or reduces trust: source visibility, reversible changes, scoped permissions, deterministic gates, review evidence, successful correction, failure transparency, or established evaluation. Capture both over-trust and under-trust that prevents useful adoption.

### 13. Learning, Capability, And Engineering Practices

Ask what engineers have learned about working effectively with agents, which practices differ by experience level, and where the team lacks confidence. Identify training needs in task framing, context selection, testing, review, tool permissions, debugging, or recognizing unsupported output.

Ask which changed team practice has evidence strong enough to demonstrate to another team, which local conditions made it work, and what coaching or implementation support would help another team adapt it without copying assumptions blindly.

Poor practice should be described as a system condition with examples and consequences, not as a personal flaw. Determine whether the response belongs in coaching, repository design, a shared guideline, an automated check, or a different workflow.

### 14. Feedback And Improvement System

Assess whether the team can turn observed friction into an owned and evaluated improvement. Determine how problems are currently noticed, recorded, prioritized, tested, and either adopted or rejected. Look for feedback that disappears, lacks evidence, has no decision owner, or never reaches the people maintaining shared harness components.

Identify existing artifacts and meetings that could carry these signals with minimal additional work. The later continuous-feedback model describes how to integrate that mechanism into planning, delivery, retrospectives, and incident learning.

## Interview Structure

A 60-minute full-delivery-unit session provides an initial evidence slice. Repository inspection, follow-up evidence, synthesis, and continuing feedback build the complete team profile, inventory, baselines, and cross-team landscape over time. Use `ai-harness-team-discovery-meeting-template.md` as the canonical facilitation format.

Use three flexible phases:

| Phase | Focus |
| --- | --- |
| Align | Establish product context, select the representative task, and collect individual evidence |
| Explore | Follow the recent workflow and examine relevant bottlenecks and harness maintenance |
| Converge | Prioritize at least one evidence-backed bottleneck, agree joint follow-up, and select a continuing feedback route |

Use roughly the first 10 minutes to align and the next 35 minutes to explore, then protect the final 15 minutes for convergence. Treat these as checkpoints rather than a speaking schedule.

Prefer the full team that collectively moves work from intent to an accepted outcome. Include the engineering, product, quality, design, operations, or other roles that participate regularly in the delivery flow. Full-team participation reveals handoffs, conflicting experiences, personal workarounds, uneven harness usage, and maintenance concentrated on particular people.

Collect silent written input from every participant, invite short clarification across roles, record disagreements explicitly, and provide a private follow-up route. Written input counts as participation; the meeting does not require every participant to speak on every topic. When the full delivery unit cannot attend, use two or three representatives as a fallback and return the findings to the complete team for validation.

Ask participants to show one real artifact when possible: a recent ticket and pull request, repository entry point, agent trace, CI failure, recurring review comment, or manual checklist. Avoid turning the session into a tool demonstration disconnected from an actual outcome.

Where harness maintenance is in scope, ask for the source and history of one repository instruction, skill, hook, tool configuration, or evaluation. A recent diff, review, failed update, consumer list, or distribution mechanism is more useful than a specially prepared presentation.

## Core Interview Questions

Use the following core questions to reconstruct actual work. Select additional questions from the relevant discovery areas only when the evidence exposes a specific gap.

### Context And Outcome

- What does this team and repository deliver, and which failures matter most?
- Which two or three work types consume most engineering effort?
- Walk through a recent task that represents normal work. Where did it wait or return for correction?
- What evidence made the final result acceptable?

### Current AI Practice

- Where did AI help materially in that example, and where did it add work?
- What context did the engineer have to collect or explain manually?
- Which agent outputs required substantial correction or could not be trusted?
- Which useful practice is personal rather than repeatable across the team?

### Repository And Workflow

- What would a new engineer or agent struggle to discover in this repository?
- Which commands, checks, handoffs, or state updates are repeated manually?
- Which recurring review comments, build failures, or production defects reveal a missing control?
- Where has faster implementation created a new downstream bottleneck?

### Harness Maintenance

- Which files and systems constitute this repository's AI harness, and which source owns each one?
- Show one recent change to repository instructions, a skill, tool, hook, or evaluation. What triggered it?
- Who reviewed the change, what evidence supported it, and how was it distributed?
- How do you detect stale instructions, false skill activation, incompatible dependencies, or permission changes?
- Can the team identify which concrete asset version influenced an agent run and roll it back if necessary?
- Which harness maintenance is still manual, duplicated across repositories, or dependent on one person?
- Which assets are unused, overlapping, unowned, or difficult to retire?

### Opportunity And Boundary

- If one source of friction disappeared, which would improve accepted delivery most?
- Is the candidate work deterministic, judgment-heavy, or a combination?
- What could go wrong if it were automated, and how would the system detect or reverse it?
- What team-specific constraint must a shared pattern preserve?
- What must the product team own locally, and what should the central harness team enable or share?

### Continuous Feedback

- Where can the team record a useful harness failure or improvement without another meeting?
- Which feedback belongs in sprint planning, the pull request, the retrospective, or an incident review?
- Who should own the next decision, and how would the team know an improvement worked?

## Finding Record

Capture each material finding in a consistent form:

```text
Finding:
Team / repository / workflow:
Observed example and evidence:
Affected outcome or user:
Frequency or recurrence:
Current workaround and manual effort:
Suspected cause:
Existing control or asset:
Risk if unchanged:
Local constraints:
Possible improvement class:
Product-team responsibility:
Central harness-team contribution:
Product-team participation and local maintenance approach:
Confidence and missing evidence:
Decision responsibility:
Validation responsibility:
Coordination responsibility:
Maintenance responsibility:
Continuing feedback route:
```

Keep direct observation separate from interpretation. “Three pull requests waited four days for one specialist” is evidence; “the team needs an AI reviewer” is a proposed solution that still requires validation.

## Harness Maintenance Profile

Add a maintenance profile to each team-repository assessment:

```text
Harness components and authoritative sources:
Owners and approval boundaries:
Local, shared, external, and generated assets:
Supported models, harnesses, tools, and environments:
Recent change and its trigger:
Review and evaluation method:
Distribution and version-resolution method:
Permissions and sensitive capabilities:
Known stale, conflicting, overlapping, or unused assets:
Current manual maintenance and support burden:
Rollback, deprecation, and retirement mechanism:
Highest-priority maintenance gap:
```

The profile should identify missing evidence rather than infer safe defaults. If the team cannot determine which version is active, who owns a skill, or how an instruction change is verified, record that uncertainty as a maintenance risk.

## Opportunity Classification

Analyze an opportunity in three stages. First, classify which engineering layer should own the response. Second, assess its value, feasibility, and risk. Third, apply the reusable-pattern test only when considering promotion beyond the originating team.

Classify the response by the layer that should own it:

| Observed need | Possible response |
| --- | --- |
| Missing navigation or non-obvious constraint | Repository structure, concise documentation, or instruction update |
| Repeated exact manual operation | Script, tool, hook, or CI automation |
| Repeated judgment workflow | Skill, agent role, or governed workflow |
| Missing task intent or proof | Task contract or planning improvement |
| Slow or irrelevant context discovery | Search, index, context compilation, or structured retrieval |
| Repeated incorrect behavior | Regression test or verifier |
| Repeated structural issue | Linter or static rule |
| Runtime-only failure | Monitoring or synthetic check |
| Unstable design decision | Architecture record and appropriate enforcement |
| Excessive capability | Permission or policy gate |
| Missing individual capability | Coaching, example, or guided practice |
| Cross-team duplication | Shared registry asset with local adapters |

Do not assume every pain point requires AI. Ordinary code, better ownership, smaller batches, stable environments, or removal of unnecessary process may be the better intervention.

## Opportunity Assessment

Evaluate candidates across:

- user and engineering impact
- frequency and total manual burden
- repeatability across teams
- clarity of input and desired outcome
- availability of authoritative context
- deterministic versus judgment-heavy content
- verification and evaluation feasibility
- reversibility and blast radius
- data, permission, security, and compliance risk
- integration and maintenance cost
- expected effect on downstream review and operations
- owner and willing pilot team

Use a short written rationale rather than a single opaque score. Separate value, feasibility, and risk so a high-value but high-risk candidate remains visible without being treated as immediately automatable.

## Reusable Pattern Test

Before promoting a team practice into a shared asset, confirm:

1. The underlying problem occurs in more than one relevant context or is materially important in one context.
2. The stable core can be separated from repository-specific details.
3. Inputs, outputs, boundaries, and evidence can be stated clearly.
4. A shared asset is better than a deterministic script, local instruction, or ordinary process change.
5. Representative positive and negative cases can evaluate it.
6. An owner will maintain compatibility, permissions, evidence, and retirement.

Reusable does not mean universal. A shared workflow can provide a common contract with language-, repository-, or product-specific adapters.

## Phased Discovery Sequence

Use waves so the framework improves before all interviews are complete:

1. **Calibration pilot.** Start with a small set of teams representing contrasting repository, product, and risk contexts. Test the questions, finding taxonomy, evidence burden, and opportunity model.
2. **First comparison wave.** Expand to enough teams to identify initial recurring themes, important differences, and ambiguous definitions.
3. **Subsequent waves.** Preserve the core question set for comparison while adding targeted follow-ups for emerging themes. Continue until new interviews mostly validate known patterns or expose only context-specific variations.
4. **Cross-team validation.** Return synthesized patterns, contradictions, and proposed priorities to representative teams before finalizing recommendations.

Do not wait until all interviews are complete to synthesize. Maintain a living theme map after each session, but avoid declaring a company standard from the first enthusiastic team.

Select teams to cover different languages, repository shapes, product risk, lifecycle stages, AI adoption levels, and dependencies. A convenience sample of the most AI-active teams will overstate capability and underrepresent barriers.

## Synthesis Across Teams

Produce two linked views:

### Team Profile

Each team profile describes context, representative flow, evidence, current assets, strengths, pain points, constraints, and candidate experiments. Teams should review their profile for factual accuracy.

### Cross-Team Landscape

The cross-team view groups findings by problem and workflow rather than ranking teams. It should identify:

- common patterns supported by several examples
- high-impact local problems
- contradictions caused by different products or risk
- missing evidence and research questions
- quick deterministic improvements
- candidates for shared skills, tools, or workflows
- foundational repository or engineering-practice gaps
- opportunities that should not be automated

Use counts carefully. Many mentions can represent a mild inconvenience, while one incident can reveal a severe systemic risk. Combine recurrence, impact, evidence, and consequence.

### Demonstrated Practice Record

When a changed team practice may help other teams, capture enough evidence and context to make the example teachable:

```text
Previous bottleneck:
Changed team practice:
Observed outcome:
Capacity reinvestment:
Local conditions:
Reusable part:
Team-to-team support available:
```

Treat the record as a contextual learning artifact. Another team should be able to see both why the change helped and which product, repository, risk, or workflow conditions limit transfer.

## Continuous Feedback In Daily Engineering

The interview program should transition into a low-friction feedback system.

### Sprint Planning Or Work Refinement

During planning, teams can identify one of the following without discussing AI for every ticket:

- work that is agent-ready and why
- repeated manual work worth observing
- a harness experiment with an expected outcome and proof
- missing repository context or verification that blocks delegation
- a high-risk task that should remain interactive

An experiment item should state the problem, proposed harness change, affected workflow, expected evidence, risk boundary, owner, and review point. Do not add speculative automation tasks to the delivery backlog without a concrete observed need.

### During Delivery

Capture feedback at the point of evidence through existing artifacts:

- an optional pull-request field for material AI contribution and verification
- a lightweight work-item label for a harness failure, manual bottleneck, or experiment
- agent and workflow traces generated automatically where appropriate
- a review disposition for false or useful automated findings
- a link from a recurring failure to the proposed durable control
- a link from a harness change to its source version, evaluation evidence, and affected consumers
- an explicit review of capability or permission changes in skills, tools, hooks, and extensions

Avoid requiring engineers to log every prompt or minute saved. Capture only events that can improve a shared workflow: accepted patterns, material failures, substantial manual work, unsafe behavior, repeated correction, or missing context.

### Retrospectives

Reserve a short recurring prompt rather than a separate AI retrospective:

```text
What helped accepted delivery?
What AI or harness behavior created rework, risk, or waiting?
What manual step repeated enough to investigate?
Which instruction, skill, tool, or check appears stale, noisy, or difficult to maintain?
Which learning should remain local, and which may be reusable?
What one experiment or system change should we validate next?
```

The retrospective identifies signals and owners; it should not design a complete solution during the meeting. Link selected findings to the shared improvement backlog.

### Incident And Defect Review

When AI-assisted work contributes to a material defect or an agent workflow fails, examine the complete system: task contract, context, tools, permissions, verification, reviewer, acceptance, and runtime observation. Convert representative failures into retained evaluation cases and the appropriate test, check, monitor, instruction, design record, or policy gate.

### Cross-Team Harness Review

A monthly or six-week cross-team review can synthesize new evidence, merge duplicates, select pilots, review asset health, and decide whether a successful local pattern should enter the shared registry. It should include engineering enablement plus rotating team, product, quality, security, and platform perspectives as relevant.

Use part of the review for a team to demonstrate one evidenced workflow change: the original bottleneck, what changed, the observed outcome, where released capacity went, what remained difficult, the conditions under which the pattern applies, and how another team can receive coaching or implementation support. Center the demonstration on changed work, evidence, and transfer conditions.

This group should manage decisions, not collect status reports. It should also review orphaned assets, stale evaluations, compatibility or permission changes, deprecation progress, and shared updates that may need rollback. Publish the evidence, accepted priorities, owners, and rejected or deferred proposals with rationale.

## Feedback Intake Contract

A lightweight continuous-feedback record should contain:

```text
Observed problem or useful practice:
Concrete example or link:
Workflow stage:
Effect on outcome, quality, risk, or time:
Current manual workaround:
How often it occurs:
Team-specific constraints:
Suggested next investigation, if any:
```

The reporter does not need to design the solution. A central or federated owner triages the item into documentation, practice, context, asset, automation, evaluation, governance, or no-action categories.

## Governance And Ownership

Assign responsibility at three levels:

- **Product team:** validates local facts, supplies representative work and evaluation cases, participates in experiments, incorporates improvements into planning, and maintains repository-specific instructions, adapters, checks, and other harness changes.
- **Harness or enablement team:** helps teams diagnose problems, synthesizes cross-team patterns, maintains shared guidance and assets, coordinates common evaluation, and makes version, compatibility, and deprecation state visible.
- **Decision authority:** approves changes to company policy, shared permissions, supported tooling, or consequential autonomy.

Security, platform, product, QA, architecture, or documentation owners participate when the finding crosses their authority. Do not create a central harness team that becomes the bottleneck or service desk for every local improvement.

The product team and harness team have complementary responsibilities. The product team does not need to build shared platforms or independently solve company-wide compatibility. The central team cannot determine alone whether a repository-specific change expresses the correct product behavior, architecture, or risk boundary.

Local ownership must include allocated engineering capacity. If product teams are expected to maintain instructions, skills, checks, and evaluations only as unpaid background work, the central group will become the default implementer regardless of the stated model. Harness improvements and maintenance should enter normal planning when evidence shows that they affect delivery.

Interview notes and traces may contain sensitive architecture, customer, personnel, or security information. Define access, retention, anonymization, and reporting before collection. Shared findings should preserve enough evidence to be useful without exposing unnecessary personal or protected data.

## Proposed Deliverables

1. **Team and repository profiles** with factual validation, including harness-maintenance and agent-readiness findings.
2. **Cross-team landscape** covering workflows, bottlenecks, recurring problems, local constraints, and existing AI assets.
3. **Opportunity portfolio and prioritized experiment backlog** separated into deterministic automation, AI-assisted workflow, engineering-practice improvement, and local need, with pilot teams, evidence, risk, and owners.
4. **Reusable pattern and shared-asset candidates** with evidence, applicability boundaries, evaluation status, and ownership.
5. **Baseline measures and a continuous-feedback mechanism** integrated into planning, delivery, retrospectives, and incident learning.

## Success Measures For The Discovery System

Judge the discovery and feedback system by whether it produces validated improvement:

- participating teams confirm that profiles represent their actual work
- findings include concrete evidence rather than only opinions
- repeated themes preserve relevant local differences
- selected opportunities have owners, pilots, and evaluation criteria
- repository-specific improvements have collective product-team participation and allocated local maintenance capacity
- teams can diagnose and maintain ordinary harness changes without permanent central-team dependency
- local improvements are promoted into shared assets only after their stable core and applicability boundaries are demonstrated
- teams see visible decisions and outcomes from submitted feedback
- useful local patterns become evaluated shared assets where appropriate
- teams can identify ownership, active versions, compatibility, evidence, and retirement paths for consequential harness components
- stale or conflicting instructions and assets are corrected or retired without creating a central maintenance bottleneck
- recurring failures become durable controls in the correct layer
- manual work, waiting, rework, or review burden improves for pilots
- feedback collection remains lightweight enough to continue
- teams report greater trust and clarity rather than pressure to maximize AI usage

Interview count, number of findings, registry growth, and number of automation ideas are activity measures, not success.

## Anti-Patterns

### Team Ranking

A maturity score encourages performance signaling and ignores product and risk differences.

### Automation-First Framing

Not every manual step is waste. Some preserve judgment, learning, coordination, or safety.

### Collecting Feedback Without Decisions

Teams will stop contributing when findings disappear into a backlog with no owner or visible disposition.

### Separate AI Ceremony

Creating permanent meetings and reporting fields for every AI interaction adds overhead. Integrate material feedback into existing artifacts and cadences.

### Central Harness Service Desk

Collecting team requests and implementing repository-specific solutions centrally creates dependency, weakens local learning, and separates harness decisions from real delivery evidence. Use joint diagnosis, collective delivery-team participation, and team-maintained local changes.

## Relationship To Other Documents

- `ai-harness-team-discovery-meeting-template.md` provides a focused 60-minute format for beginning discovery with one delivery unit.
- `local-harness-insights-and-health-check.md` defines privacy-preserving local analysis and preflight evidence for team harness health checks.
- `ai-harness-engineering.md` defines the harness components, controls, and improvement layers being investigated.
- `ai-assisted-engineering-process.md` defines the human-agent development process and evidence expectations.
- `agent-context-systems.md` supports repository context, handoff, retrieval, and memory analysis.
- `governed-agentic-development.md` supports delegated-work and control-plane analysis.
- `agent-pipeline-optimization.md` supports bottleneck, flow, concurrency, and accepted-outcome analysis.
- `agent-workflow-evaluation.md` defines how proposed improvements and autonomy changes should be evaluated.
- `ai-asset-registry.md` defines how reusable findings become governed shared assets.
- `ai-engineering-metrics.md` defines lightweight organization and workflow measures.
- `ai-native-engineering-workshop.md` provides a complementary forum for shared direction and experiment selection.
- `../guidelines/ai-documentation-guideline.md` defines how repository documentation should be assessed without encouraging unnecessary prose.

## Summary

Cross-team discovery should examine complete engineering workflows, concrete evidence, local constraints, and the systems around AI—not merely interview teams about preferred tools. It should distinguish symptoms from causes, shared patterns from local needs, and automation opportunities from work that requires human judgment.

The durable outcome is a federated feedback loop: teams expose material friction and learning through normal planning, delivery, retrospectives, and incident review; product teams own repository-specific improvement and accepted outcomes; harness owners synthesize and evaluate shared capability; successful patterns become maintained context, automation, or registered assets; and teams see the result of the feedback they supplied.

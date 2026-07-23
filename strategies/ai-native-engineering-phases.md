# AI-Native Engineering: Phased Adoption Plan

## Purpose

This document outlines a practical path from conventional software engineering to AI-native engineering: an organization that can safely delegate work to AI agents while preserving human accountability, product quality, and adaptability.

## Strategic Position

Every employee is expected to learn where AI helps, where it creates risk, how to verify its output, and how to improve workflows with it.

The recommended strategy is:

- Build broad AI fluency across roles and teams.
- Define ownership, review, verification, and acceptance rules for AI-assisted work.
- Provide supported default tools while allowing alternatives that meet the governance bar.
- Prefer adopting and extending common AI engineering tools over building company-specific alternatives from scratch unless there is a clear reason.
- Encourage teams to test which workflows, harnesses, guardrails, models, and review practices produce good results.
- Use lightweight spec-driven practices to clarify intent, constraints, and proof before AI-assisted implementation.
- Develop AI harness engineering as a core capability for context engineering, reusable prompts, skills, tests, evaluations, workflow improvements, and guardrails.

Core principle:

> AI agents are part of the engineering workforce. Teams collaborate with AI to analyze problems, explore options, plan, implement, review, test, and document work while retaining ownership of intent, architecture, risk, quality, and business impact.

## AI-Assisted vs AI-Native Diagnostic

AI-assisted engineering adds AI to existing work. AI-native engineering redesigns the work around human judgment, agent capability, proof, and continuous improvement.

Use this diagnostic to avoid mistaking tool adoption for operating-model change.

| Signal | AI-assisted | AI-native |
| --- | --- | --- |
| Coding | Developers use AI to produce code faster | Work is sliced so agents can implement bounded changes with clear proof |
| Requirements | AI drafts or summarizes existing tickets | AI helps clarify ambiguity, scenarios, constraints, and acceptance before work enters delivery |
| Planning | AI suggests implementation options inside the current process | Teams redesign planning around fast exploration, explicit tradeoffs, and reusable context |
| Review | Reviewers receive more code faster | Review is redesigned around risk, source evidence, verification proof, and targeted checks |
| Testing | AI generates tests after implementation | Test strategy, edge cases, and proof expectations are defined before or alongside implementation |
| Deployment and operations | Existing release and support flows absorb more AI-produced work | Agent outputs include operational evidence, rollback thinking, and lifecycle ownership |
| Governance | The company publishes tool rules | Each workflow has owners, inputs, permissions, checks, approval rules, and failure handling |
| Measurement | Success is measured by adoption or activity | Success is measured by lifecycle outcomes: throughput, quality, review burden, incidents, proof, and learning |

Faster coding alone is not enough. If implementation accelerates while requirements, review, testing, deployment, or operations stay unchanged, the bottleneck moves downstream. AI-native engineering looks for those shifted constraints and redesigns the lifecycle around them.

## Phase 0: Diagnose and Establish Direction

Clarify the current state, target direction, ownership, and governance for tools, data, permissions, review, and quality.

Key outcomes:

- Leadership position on AI-assisted engineering as a strategic capability.
- Baseline of current AI use, delivery flow, review bottlenecks, quality outcomes, and places where AI is a multiplier or a tax.
- Named ownership for AI-native engineering transformation, including enablement, measurement, and governance.
- Company-wide expectation that employees develop AI capability in their own work and team workflows.
- Open but governed tooling strategy with supported defaults and experimental lanes.
- Ownership rules for AI-assisted outputs, approvals, shared workflows, and maintenance.
- Initial guidance for agent harnesses, context engineering, spec-driven development, and harness engineering.

Management message:

> AI-assisted engineering is a strategic capability. We will scale it through clear ownership, responsible tooling, and measurable delivery quality.

## Phase 1: AI-Assisted Engineering Fluency

Engineers use AI in daily work while remaining responsible for submitted output.

Typical collaboration use cases:

- Brainstorming.
- Codebase exploration.
- Solution comparison.
- Architecture and interface exploration.
- Planning.
- Implementation.
- Debugging.
- Refactoring.
- Test and proof generation.
- Documentation.
- Learning unfamiliar systems.

Expected behavior change:

> Engineers treat AI as a working partner.

Key practices:

- Use AI for problem analysis, options, tradeoffs, and planning.
- Use approved or experimental tools within company policy.
- Keep sensitive data out of unapproved systems.
- Use repository instructions, such as `AGENTS.md`, where appropriate.
- Give agents useful context while avoiding irrelevant, stale, or conflicting context.
- Use lightweight specs before asking agents to implement.
- Review and verify agent output before submitting it.
- Develop reusable skills, prompts, and workflow patterns for repeated tasks.
- Contribute useful assets to the company's shared AI registry.
- Share effective workflows with the team.

Success signal:

Engineers show measurable productivity improvement from AI collaboration, such as shorter task cycle time, more completed delivery items, better verification coverage, faster onboarding to unfamiliar systems, or more reusable AI assets adopted by teams.

## Phase 2: AI-Assisted Team Delivery

Teams move from individual AI use to shared delivery practices across product, engineering, QA, architecture, and AI agents.

Key shifts:

- Product owners use AI to clarify intent, scenarios, and acceptance criteria.
- Engineers use spec-driven development to turn intent into implementable work.
- QA uses AI to improve test strategy, edge-case discovery, and verification.
- Teams define how agents participate in planning, implementation, review, and proof generation.
- Teams identify low-risk tasks that agents can run asynchronously under clear review boundaries.
- Teams make quality expectations explicit through specs, repository instructions, runbooks, review personas, tests, and guardrails.
- Specs and proof become shared review artifacts.

Spec-driven development approach:

- Use GitHub Spec Kit for larger, cross-team, higher-risk, or governance-heavy work.
- Use OpenSpec for lighter, brownfield, faster-moving team work.
- Use internal skills and plugins as company-specific adapters, not as competing SDD frameworks.

Success signal:

Teams complete epics, customer scenarios, and quality improvements faster with AI-assisted collaboration while using specs, acceptance criteria, API traces, and other proof to maintain quality. Teams also have initial practices for selected asynchronous AI tasks.

## Phase 3: Governed Agentic Workflows

Agents take scoped asynchronous tasks inside controlled team workflows, such as GitHub Actions or similar automation.

Example workflows:

- Create a spec proposal from a product brief.
- Break an approved spec into implementation tasks.
- Implement a scoped task from the spec.
- Generate or update tests.
- Review a PR against the spec and test plan.
- Produce proof for a frontend or backend change.
- Run a second-model review before human approval.
- Open a PR with implementation notes and verification evidence.
- Convert repeated review feedback into guardrails, tests, lints, instructions, or reviewer-agent checks.

Governance requirements:

- Every shared agent workflow has a named owner.
- Permissions are explicit and reviewed.
- Inputs and source materials are known.
- Outputs are traceable.
- High-risk changes require human approval.
- Agent instructions, specs, and source material are maintained.
- Shared workflows have lightweight evals, simulations, or examples to catch regressions.
- Sensitive data, credentials, and production access use limited permissions, redaction, isolated tools, or explicit approval.
- Multi-agent workflows are used only when roles are separable, each agent has enough context, and the split improves quality, safety, speed, or reviewability.
- Teams avoid splitting agents only to mirror team boundaries or make the design feel simpler while reducing decision context.

Human role:

- Approve intent and specs.
- Make risk decisions.
- Review proof.
- Accept or reject agent output.
- Improve the workflow itself.
- Approve agent-suggested changes to instructions, prompts, guardrails, or workflows unless the change is low-risk and pre-approved.

Success signal:

Agents perform scoped asynchronous work, including AFK execution, while humans remain in control of intent, risk, and acceptance.

## Phase 4: AI-Native Engineering Operating Model

AI becomes part of the engineering operating model. Teams continuously improve how agents are used, governed, reviewed, and integrated into delivery.

Operating model characteristics:

- Smaller, more capable teams.
- Agent-supported delivery pipelines.
- Proof-based review.
- Automated quality checks.
- Reusable company skills and plugins.
- Common SDD standards.
- Common harness governance.
- Harness engineering for context, guardrails, proof, and feedback capture.
- Lightweight monitors for missing proof, failed checks, sensitive changes, repeated failures, and policy violations.
- Continuous tool and model evaluation.
- Agent lifecycle management.

Agent lifecycle expectations:

- Named owner.
- Clear purpose.
- Approved permissions.
- Known inputs.
- Review and approval rules.
- Monitoring and failure handling.
- Periodic recertification.
- Retirement path.

Continuous improvement expectations:

- Treat repositories, documentation, specs, and examples as agent context.
- Reduce inconsistent patterns that make agent output less reliable.
- Capture repeated agent mistakes, review comments, failed builds, and production issues as signals for missing context, evals, monitors, or guardrails.
- Move recurring feedback into durable automation where possible.
- Treat model choice as a quality, latency, cost, and capacity tradeoff; test important workflows when changing models.

Broader company impact:

Once engineering has established safe AI-native practices, the same operating model can support other functions such as support, operations, finance, compliance, product analytics, and internal tooling.

Success signal:

The company is no longer merely using AI tools. It can safely delegate work to AI systems while preserving accountability, quality, and adaptability.

## Summary

The adoption path is:

1. Establish direction and governance.
2. Build individual AI engineering fluency.
3. Move to AI-assisted team delivery.
4. Introduce governed asynchronous agent workflows.
5. Mature into an AI-native engineering operating model.

The objective is an organization that continuously improves how humans and AI agents work together to deliver better software.

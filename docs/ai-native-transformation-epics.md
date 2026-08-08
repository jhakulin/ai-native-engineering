# AI Transformation for an Organization with Legacy Software and Processes

## Transformation approach

The transformation will not begin with an organization-wide rollout, a wholesale legacy rewrite, or detailed work-management configuration. It will:

1. Prove the operating model with a small number of representative teams.
2. Simplify management and decision-making before adding AI-specific process.
3. Reconnect PMs, developers, domain experts, and users.
4. Reconstruct and verify selected legacy areas before using AI to change them.
5. Establish AI coding assistants and specification-driven development as a coherent engineering system.
6. Use a central AI enablement function to build organizational capability rather than centralize delivery.
7. Scale only practices that produce credible evidence of improved outcomes.

# Epic 1: Establish the transformation mandate

## Objective

Give the transformation executive support, capacity, and decision authority despite competing portfolio commitments.

## Story 1.1: Agree on the target operating model

Leadership defines what AI-native means for:

- Product discovery
- Software delivery
- Legacy modernization
- Internal work
- Customer-facing agents
- Human accountability

**Completion evidence:** A leadership-approved operating model identifies the intended changes, non-goals, decision boundaries, and accountable executives.

## Story 1.2: Select transformation areas

Select a small number of product or workflow areas representing:

- Legacy-system development
- Newer product development
- Customer-facing AI agents, where applicable

Each area must have a business outcome, executive sponsor, PM, engineering owner, benefit owner, participating team, and user or customer group.

**Completion evidence:** The selected areas and their intended outcomes are included in portfolio planning.

## Story 1.3: Allocate transformation capacity

Leadership decides which roadmap work will be reduced to create space for:

- Workflow redesign
- Legacy remediation
- Learning
- Shared AI engineering improvements
- Evaluation
- Maturation

**Completion evidence:** Transformation capacity appears explicitly in portfolio plans instead of being treated as additional work.

## Story 1.4: Define decision rights and risk appetite

Clarify who can decide:

- Which initiatives proceed
- When teams may use AI agents
- Which risks require escalation
- When to build, configure, buy, or partner
- When to stop an initiative
- When an initiative is ready for production

**Completion evidence:** Selected teams can make routine decisions without repeatedly escalating to senior management.

## Story 1.5: Make leadership support observable

Sponsors and line managers commit to protecting transformation capacity, removing obsolete controls, resolving cross-team blockers, supporting responsible experiments, and stopping work that does not produce evidence of value.

**Completion evidence:** Leadership reviews record decisions and removed barriers, not only progress reports.

# Epic 2: Simplify the product and project operating model

## Objective

Replace excessive project administration, duplicated documentation, and management handoffs with outcome-oriented product work.

## Story 2.1: Diagnose the current operating model

Examine how work moves from opportunity to production across:

- Portfolio planning
- Product discovery
- Epic creation
- Architecture
- Development
- Approvals
- Maturation
- Reporting

Identify where work waits, information is duplicated, decisions are escalated unnecessarily, and ownership changes hands.

**Completion evidence:** Leadership and participating teams have an agreed view of the largest organizational delays and their causes.

## Story 2.2: Design a minimum product-management model

Define the minimum information and governance required to manage work responsibly. The model establishes:

- One requirements source of truth
- Outcome-based Epics
- Clear product and technical ownership
- Necessary rather than habitual approvals
- Evidence proportionate to initiative risk
- Management visibility without duplicate reporting
- Governance discussions focused on decisions, tradeoffs, risks, value, and accountability

**Completion evidence:** Selected teams use a simpler operating model while still satisfying essential management, security, legal, and regulatory needs.

## Story 2.3: Reduce management handoffs

Identify decisions currently passed between PMs, developers, architects, managers, and governance groups. Move routine product and technical decisions into the responsible product team.

**Completion evidence:** The approvals, handoffs, and duplicate artifacts removed from the selected model are named, and decision waiting time is materially shorter.

## Story 2.4: Integrate discovery, implementation, and operationalization

Redesign planned work as one lifecycle:

- Discovery validates the problem and the highest-risk assumptions.
- Implementation delivers the committed solution.
- Operationalization proves reliability, adoption, supportability, and value.
- Production evidence informs the next discovery cycle.

**Completion evidence:** The same outcome, owners, and measures remain in place across all phases.

## Story 2.5: Evaluate and standardize the simplified model

Compare the selected model with the current approach using:

- Planning effort
- Decision time
- Delivery lead time
- Rework
- Management visibility
- Team and stakeholder experience

**Completion evidence:** Successful changes are adopted more broadly; unsuccessful changes are revised instead of becoming policy.

# Epic 3: Reconnect Product, Engineering, and users

## Objective

Eliminate the organizational distance between PMs, developers, domain experts, and the people using the product.

## Story 3.1: Establish shared product ownership

Create a stable product leadership group around each selected area, including Product, Engineering, and relevant Design, Data, or domain leadership.

The group jointly owns:

- Discovery
- Scope
- Technical feasibility
- Delivery
- Adoption
- Outcome measurement

**Completion evidence:** Product requirements are no longer handed from PMs to developers as completed decisions.

## Story 3.2: Make developers part of discovery

Include developers in:

- User research
- Workflow observation
- Opportunity assessment
- Prototype design
- Technical experiments
- Scope decisions

Before implementation is committed, the product group tests the material value, usability, feasibility, and viability assumptions with evidence proportionate to the investment and risk.

**Completion evidence:** Technical assumptions and legacy constraints are discovered before implementation commitments.

## Story 3.3: Keep PMs involved through production

PM responsibility continues through:

- Implementation decisions
- Scope adjustments
- User validation
- Maturation
- Adoption
- Outcome measurement

**Completion evidence:** PM responsibility does not transfer to a project-management process when development begins.

## Story 3.4: Establish continuous user feedback

Create a repeatable way for product teams to observe users, test proposed workflows, and collect production feedback. Define the adoption, user-behavior, quality, and business measures before release.

**Completion evidence:** Every selected Epic contains direct user evidence before commitment and after release.

## Story 3.5: Use AI to accelerate, not replace, discovery

Define how AI may support research synthesis, opportunity analysis, and specification creation. Require teams to distinguish:

- Direct evidence
- Internal data
- Stakeholder opinion
- AI-generated synthesis
- Unvalidated assumptions

**Completion evidence:** AI-generated material is traceable and is never treated as customer evidence by itself.

# Epic 4: Make legacy systems ready for AI-assisted change

## Objective

Improve selected legacy areas enough to support safe, faster development without launching an organization-wide rewrite.

## Story 4.1: Build and verify legacy-system understanding

For each selected modernization front, reconstruct and document:

- Business importance
- Ownership
- Dependencies
- Business rules and data movement
- Interfaces and runtime behavior
- Change frequency
- Operational risk
- Testability
- Knowledge concentration
- Unresolved uncertainty

Validate the resulting system-understanding package with the relevant domain and system experts.

**Completion evidence:** Teams can identify the relevant behavior, components, dependencies, risks, and knowledge gaps without depending entirely on informal knowledge.

## Story 4.2: Select bounded modernization fronts

Choose legacy boundaries where incremental improvement can unlock meaningful product or delivery value. Prioritize areas that:

- Change frequently
- Cause repeated incidents or delays
- Depend on a small number of experts
- Block important product work
- Can be isolated without rewriting the entire system

**Completion evidence:** Modernization work has a bounded scope, expected business benefit, risk assessment, and accountable benefit owner rather than being general code cleanup.

## Story 4.3: Fund enabling engineering work

Fund the improvements required for safe change, such as:

- Reproducible development environments
- Characterization and functional-parity tests that protect existing behavior
- Better system documentation
- Clearer component boundaries
- Safer deployment and rollback
- Reduced dependence on individual experts

**Completion evidence:** Selected legacy areas can be changed and verified without relying entirely on manual knowledge.

## Story 4.4: Adopt progressive modernization

Define a modernization approach based on:

- Isolating new behavior
- Introducing stable interfaces
- Replacing components incrementally
- Validating old and new behavior during migration
- Maintaining fallback
- Learning from production

**Completion evidence:** Each modernization front has an incremental migration sequence, validation method, fallback, and controlled cutover plan.

## Story 4.5: Capture legacy knowledge for humans and agents

Convert undocumented system knowledge into maintained architecture, domain, dependency, and operational information with a source, owner, and review expectation.

**Completion evidence:** Developers and coding agents can identify relevant components, constraints, dependencies, and owners without depending on informal networks.

# Epic 5: Establish the AI-native engineering system

## Objective

Make AI coding assistants and specification-driven development part of a coherent engineering system rather than isolated individual productivity tools.

## Story 5.1: Define the supported AI engineering model

Describe how teams should use AI across:

- Specification
- Planning
- Implementation
- Testing
- Review
- Documentation
- Legacy investigation
- Incident analysis

Define the human responsibility for validating AI-generated assumptions, code, tests, security implications, and architectural changes.

**Completion evidence:** Teams understand expected human accountability and appropriate agent autonomy.

## Story 5.2: Establish repository-readiness levels

Define readiness levels based on:

- Build reliability
- Testability
- Documentation
- Architecture clarity
- Deployment safety
- Data sensitivity

Use readiness to determine the appropriate level of agent autonomy.

**Completion evidence:** Agent use is adapted to repository condition rather than mandated uniformly.

## Story 5.3: Integrate specification-driven development into the lifecycle

Use a maintained specification to connect:

- Discovery evidence
- Product intent
- Technical constraints
- Implementation planning
- Acceptance behavior
- Operationalization findings

**Completion evidence:** Specifications remain useful during implementation and reflect material decisions made during delivery.

## Story 5.4: Pilot complete AI-native delivery loops

Selected teams use approved AI coding assistants from discovery through operationalization on real product outcomes. Observe:

- Where agents accelerate work
- Where agents create rework
- Which generated errors and corrections add cost
- Which context is missing
- Which reviews remain necessary
- Which capabilities should become shared services

**Completion evidence:** The organization has verified working practices rather than theoretical tool guidance.

## Story 5.5: Turn working practices into a paved road

Standardize only practices proven through selected implementations. The paved road should include:

- Supported configurations
- Reusable instructions and skills
- Verification practices
- Security controls
- Legacy-system guidance
- Product-agent patterns
- AI-first onboarding and demonstrated proficiency exercises

**Completion evidence:** New teams can adopt the proven model without recreating it independently.

# Epic 6: Position AI enablement as a transformation function

## Objective

Make the AI enablement function responsible for organizational leverage rather than all AI delivery.

## Story 6.1: Define the AI enablement charter

Clarify AI enablement responsibility for:

- Engineering paved road
- Shared agent capabilities
- Team enablement
- Embedded transformation support
- Reusable patterns
- Evaluation infrastructure
- Cross-team learning

Also clarify what remains owned by product teams.

**Completion evidence:** The AI enablement function is not the default owner of product delivery or production outcomes.

## Story 6.2: Establish bounded embedded transformation engagements

AI enablement specialists work temporarily with selected teams to:

- Understand real constraints
- Improve the delivery workflow
- Build missing shared capabilities
- Develop team competence
- Transfer ownership back to the team

Each engagement defines its intended outcome, local product and engineering owners, expected duration, reusable learning, and exit criteria before it starts.

**Completion evidence:** The team can operate and improve the adopted practices without permanent central assistance, and its leaders retain accountability after the engagement ends.

## Story 6.3: Convert team learning into organizational capability

Create a process for turning local solutions into:

- Shared AI engineering capabilities
- Templates
- Agent skills
- Integrations
- Training
- Architecture patterns
- Governance improvements

**Completion evidence:** Each engagement leaves a reusable organizational asset or a documented reason why the solution remains local.

## Story 6.4: Manage AI enablement as an internal product

Prioritize the AI enablement roadmap based on:

- Repeated team friction
- Cross-team reuse
- Delivery impact
- Product-agent needs
- Legacy-system constraints
- Security and operational risk

**Completion evidence:** Roadmap decisions are driven by organizational leverage rather than the loudest support request.

# Epic 7: Build internal networks and AI capability

## Objective

Reduce dependence on informal relationships and isolated experts.

## Story 7.1: Make expertise discoverable

Create an internal map of:

- Product and system ownership
- Domain experts
- Legacy specialists
- AI champions
- AI enablement capabilities
- Data and Security contacts
- Reusable AI assets

**Completion evidence:** Employees can locate relevant expertise without already knowing the right person.

## Story 7.2: Establish a federated AI champion network

Create champions inside product areas who:

- Support local teams
- Share working practices
- Surface common blockers
- Connect teams with the AI enablement function
- Help evaluate reusable capabilities

**Completion evidence:** AI adoption and learning do not depend solely on a central enablement group.

## Story 7.3: Create cross-team learning mechanisms

Use recurring demonstrations, engineering exchanges, and working groups to share:

- Successful workflows
- Failures
- Legacy-modernization approaches
- Product-agent lessons
- Reusable capabilities

**Completion evidence:** Knowledge produced by one team influences other teams' work.

## Story 7.4: Develop role-specific capability

Define practical capability expectations and onboarding paths for:

- PMs
- Developers
- Technical leaders
- Engineering managers
- Product-agent owners
- Senior management

**Completion evidence:** Capability is demonstrated through real work rather than training attendance.

## Story 7.5: Align management and employee incentives

Update expectations so that people are recognized for:

- Product outcomes
- Quality
- Shared learning
- Reusable improvements
- Responsible experimentation
- Stopping weak initiatives
- Management behavior that protects learning, removes blockers, and develops team capability

**Completion evidence:** Teams are not simultaneously told to experiment and evaluated only on fixed feature commitments.

# Epic 8: Build and govern production AI agents

## Objective

Create a repeatable lifecycle for agents embedded in products.

## Story 8.1: Define the product-agent platform boundary

Decide which capabilities should be shared:

- Model access
- Tool integration
- Identity and permissions
- Agent and MCP discovery and registry
- Runtime
- Retrieval and memory
- Evaluation
- Observability
- Replayable execution traces
- Safe rollout, revocation, and rollback
- Cost controls

Define what remains product-specific.

**Completion evidence:** Product teams do not independently rebuild the same foundation.

## Story 8.2: Establish the agent product lifecycle

Define lifecycle stages:

`Opportunity -> Prototype -> Validated -> Production-ready -> Released -> Monitored -> Improved or Retired`

Each stage requires evidence proportionate to its risk.

**Completion evidence:** Evaluation, operational ownership, least-privilege access, monitoring, human fallback, and rollback requirements are satisfied before production release.

## Story 8.3: Establish production accountability

Every product agent must have:

- Product owner
- Technical owner
- Operational owner
- Defined user experience
- Human fallback
- Incident responsibility
- Retirement decision owner

**Completion evidence:** The AI enablement function is not automatically responsible for every product agent.

## Story 8.4: Integrate evaluation and governance

Require evidence covering:

- Task success
- Failure behavior
- Human intervention
- Security
- Privacy
- Cost
- Latency
- Customer experience
- Operational reliability
- Tool use and permission behavior
- Safe degradation, revocation, and rollback

**Completion evidence:** Release decisions are based on measured behavior and replayable execution evidence rather than demonstrations.

# Epic 9: Measure, learn, and scale

## Objective

Scale only the parts of the transformation that produce credible evidence of better outcomes.

## Story 9.1: Establish benefits contracts and baselines

Before substantial implementation begins, each selected area defines its intended benefit, benefit owner, baseline, value formula, evidence source, cost boundary, and review dates. Measures include:

- Discovery-to-commitment time
- Decision waiting time
- Delivery lead time
- Rework
- Defects
- Management effort
- Developer experience
- User outcomes
- Cost

**Completion evidence:** The organization can compare results with the previous operating model and determine whether the expected benefit was realized.

## Story 9.2: Evaluate the complete system

Evaluate the combined effect of:

- Simpler management
- Closer PM-developer collaboration
- Legacy readiness
- Coding agents
- AI enablement support
- Maturation
- Organizational learning
- AI consumption, review, correction, incident, and support costs

**Completion evidence:** Results are not attributed to AI tooling when other operating-model changes produced the improvement.

## Story 9.3: Decide what to institutionalize

At the end of the initial implementations, classify each practice as:

- Standardize
- Continue experimenting
- Apply only in specific contexts
- Revise
- Stop

**Completion evidence:** Initial practices do not become organization-wide policy automatically.

## Story 9.4: Scale in controlled cohorts

Expand to additional teams based on:

- Repository readiness
- Management support
- Product ownership
- AI enablement capacity
- Business value
- Ability to measure results

**Completion evidence:** A simultaneous organization-wide rollout is avoided.

# Initial implementation scope

The initial implementation should establish:

1. A leadership-approved target operating model and decision boundaries.
2. A small number of selected transformation areas with protected capacity.
3. A simplified product-management model for those areas.
4. Shared Product and Engineering ownership with direct user evidence.
5. Verified understanding of the relevant legacy systems, characterization tests, and bounded modernization fronts with accountable benefit owners.
6. Repository-readiness levels for the selected codebases.
7. Complete delivery loops using approved AI coding assistants and maintained specifications.
8. Time-limited AI enablement engagements with explicit entry, exit, capability-transfer, and local-ownership criteria.
9. An internal expertise map and federated champion network.
10. Benefit contracts and outcome evidence sufficient for management to stop, revise, continue, or scale each initiative.

The initial scaling decision is not whether people used AI. It is:

> Did the selected teams deliver a valuable change faster or with better quality, without increasing risk or management overhead, and can they repeat the method without permanent central enablement assistance?

# Research basis

The complete job-description corpus, supporting sources, research findings, and evidence-to-Epic assessment are maintained in [AI Transformation Research](./ai-transformation-research.md). They are kept separate so this document remains an actionable transformation plan rather than becoming an evidence report.

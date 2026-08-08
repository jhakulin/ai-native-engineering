# AI Transformation Research

**Research date:** 3 August 2026  
**Purpose:** Test the current transformation plan against recent job descriptions and supporting evidence, identify missing responsibilities, and prepare concrete options for a later revision.  
**Status:** Supporting evidence for [AI Transformation for an Organization with Legacy Software and Processes](./ai-native-transformation-epics.md). The highest-priority findings have been incorporated into that plan; the detailed evidence remains here to keep the planning document concise.

## Research scope

The searches focused on responsibilities that were underrepresented in the original job-description set:

1. AI-assisted modernization of legacy software
2. AI-native product and engineering operating models
3. Adoption, workforce change, and management behavior
4. Embedded and federated AI enablement
5. Portfolio governance and benefits realization
6. Production agent platforms, identity, evaluation, and observability

The selected evidence set contains recent job descriptions from organizations building these capabilities, supplemented by primary technical guidance and current operating-model research. Job listings describe what organizations are assigning people to implement; they do not, by themselves, prove that each practice is effective. Recurring responsibilities across unrelated employers were treated as stronger signals than isolated wording.

# Findings

## 1. AI transformation is an operating-model redesign, not a tool rollout

Recent roles consistently combine AI adoption with changes to team design, decision rights, engineering responsibilities, product collaboration, governance, and leadership behavior.

Evidence includes:

- MUFG expects its transformation lead to resolve how AI changes code review, team composition, developer responsibility, productivity models, and product-team interaction.
- JPMorganChase describes an embedded transformation role that redesigns daily product work, tests new practices with teams, and helps leadership create the future product operating model.
- BlackRock explicitly separates capabilities that should be standardized centrally from those that should remain embedded in product engineering.
- McKinsey and Deloitte both describe scaled AI as an operating-model problem: accelerating the existing process does not remove its layers, delays, or obsolete controls.

**Implication for the plan:** The target operating model should state which management layers, handoffs, approval responsibilities, and team boundaries will change. “Use AI in the workflow” is not an adequate target state.

## 2. Legacy modernization must begin with verified system understanding

The additional evidence strengthens the need for a deliberate legacy-understanding stage before AI-assisted modification.

The recurring work is:

- Reconstruct business rules, dependencies, data movement, and runtime behavior from code and operating evidence.
- Validate extracted knowledge with domain experts.
- Establish functional-parity and characterization tests before replacing behavior.
- Select bounded modernization fronts based on business value and risk.
- Keep production running through incremental decomposition, data migration, fallback, and controlled cutover.
- Sequence modernization so it produces incremental value instead of becoming a multiyear technical program with deferred benefits.

Liatrio emphasizes embedded modernization while maintaining production. The 66degrees Enterprise Architect role calls for legacy decomposition, functional parity, and extraction of business logic. GFT argues that code, integrations, and data have to be modernized together rather than applying AI over an unchanged legacy core.

**Implication for the plan:** The current legacy map is necessary but insufficient. Each selected modernization front should produce a verified “system understanding package”: ownership, business rules, dependencies, data contracts, operational behavior, characterization tests, risks, and SME sign-off.

## 3. Product, Design, and Engineering must discover together

AI-native product roles do not position the PM as an upstream requirements author. They expect a cross-functional product group to maintain customer contact, test assumptions early, prototype directly, and own outcomes through adoption.

Recurring practices include:

- Weekly or otherwise continuous customer evidence, rather than discovery only during quarterly planning
- Early tests of value, usability, feasibility, and viability
- Shared opportunity mapping and assumption testing
- Product artifacts stored as living context usable by both people and AI
- Instrumentation defined before release so usage, quality, and value can be observed
- PM involvement through implementation, release, adoption, and outcome measurement

**Implication for the plan:** Quarterly planning can remain the investment cadence, but discovery and evidence collection should not be confined to the quarter boundary. Product and Engineering should jointly maintain a living evidence-to-specification chain.

## 4. The engineering model must address roles and competence, not only workflows

The newer engineering-transformation roles add organizational responsibilities not explicit enough in the current plan:

- Define how AI-generated code changes review depth and reviewer responsibility.
- Decide how team composition and work allocation change when agents perform implementation tasks.
- Update engineering role expectations, job families, hiring criteria, onboarding, and career development.
- Build manager capability to lead AI-enabled planning, execution, quality, and learning.
- Provide role- and repository-specific learning paths rather than generic AI training.
- Measure demonstrated capability in production work.

Klaviyo’s enablement role owns an AI-first Day 0/30/60/90 engineering onboarding path, including access, environments, labs, first pull requests, and time-to-impact measures. MUFG explicitly includes team composition, developer responsibilities, and product interaction. Several transformation roles include talent alignment and future-skills planning.

**Implication for the plan:** Add a workforce-design deliverable covering role expectations, manager practices, onboarding, proficiency evidence, and the consequences for team design. The champion network alone cannot close this gap.

## 5. Central enablement works best as a federated, forward-deployed service

The strongest enablement pattern is a small central group that owns shared foundations and temporarily embeds with delivery teams.

Effective engagements include:

1. Diagnose a real workflow and its constraints with the team.
2. Pair on implementation and ship working code or workflow changes.
3. Measure the result in the team’s normal work.
4. Convert repeated solutions into shared templates, skills, integrations, or platform features.
5. Transfer ownership to the team and exit.

Vanguard calls for hands-on pairing, workshops, embedded delivery, reference implementations, and technical communities. GitHub looks for forward-deployed experience and the ability to turn one-off solutions into reusable patterns. BlackRock defines the boundary between the central ecosystem and federated product teams. One role explicitly states that engineering leads retain accountability for sustained adoption.

**Implication for the plan:** The current enablement Epic is strongly aligned. It should additionally define an engagement intake, a bounded cohort duration, an exit test, and the delivery-team leader’s accountability after the central specialist leaves.

## 6. Adoption must include resistance, incentives, and leadership conduct

Recent adoption roles treat resistance as evidence to investigate rather than a communications problem.

They require teams to:

- Assess readiness and resistance at workflow and role level before deployment.
- Identify how responsibilities, decision rights, and perceived job risk will change.
- Equip managers to explain and demonstrate the new operating model.
- Update role profiles and performance expectations for human–AI work.
- Keep ownership through sustainment rather than declaring success at launch.
- Measure adoption quality and workflow outcomes, not training attendance.

Pfizer’s Director of AI Change Adoption is responsible for readiness, resistance, enablement, and sustainment. AHEAD includes resistance mapping, influence strategies, and redesign of job profiles. Gartner identifies AI as a reason to adapt enterprise change-management strategy, while IBM reports that CEOs see adoption as more decisive than the technology itself.

**Implication for the plan:** Management behavior should become a transformation work product. Sponsors and line managers need observable commitments—decisions made, capacity protected, obsolete controls removed, experiments supported, and incentives revised.

## 7. Value realization needs an owner and a financial control loop

Recent portfolio and transformation roles extend accountability from use-case selection through adoption and sustained benefit.

The common responsibilities are:

- Define a value hypothesis and baseline before committing substantial investment.
- Assign a business owner for the expected benefit.
- Track productivity, cost, quality, risk, customer experience, and adoption together.
- Include total economics such as model or token cost, implementation, rework, incidents, support, and displaced work.
- Review actual value after release and during maturation.
- Stop, reshape, or scale initiatives based on evidence.
- Give leaders decision material about tradeoffs, not additional status reporting.

PMI’s AI Program Manager owns delivery through adoption and value realization. UL Solutions expects an AI Product Manager to verify productivity, cost, quality, and customer-experience improvements. Disney’s Transformation Management Office role calls for governance discussions centered on choices, risks, value, and accountability rather than status updates.

**Implication for the plan:** The measurement Epic should become a benefits-realization mechanism. Every transformation area needs a named benefit owner, baseline, value formula, measurement source, review dates, and stop/scale decision.

## 8. Developer productivity must be measured as a system outcome

The evidence supports measuring delivery and quality, but warns against treating individual activity as productivity.

A useful measurement set combines:

- Flow: time from validated opportunity to production learning, wait time, review time, and deployment frequency
- Quality: escaped defects, incidents, rollback, rework, and maintainability
- Economics: total delivery cost, AI consumption cost, support burden, and capacity released for other work
- Experience: developer friction, cognitive load, and time to competence
- Product outcomes: adoption, customer behavior, revenue, cost, or risk outcome relevant to the initiative
- AI-specific failure: incorrect generated changes, hallucinated assumptions, evaluation failures, and human correction effort

Alvarez & Marsal’s role ties AI-native engineering roadmaps to financial targets, DORA milestones, cost per feature, cycle time, and deployment frequency. It also calls for tracking AI tooling economics and transformation value rather than tool availability alone.

**Implication for the plan:** Keep measures at team, product, workflow, and portfolio level. Do not use prompts, generated lines, acceptance rate, or individual commits as performance targets.

## 9. A production agent platform needs more than model access and an MCP gateway

The Netflix role that initiated this research defines a broad agent-specific platform surface:

- Runtime and execution environment
- Memory
- Human and agent identity
- Scoped permissions and delegated authorization
- Discovery and registry
- Tool and MCP interfaces
- Structured, replayable execution trajectories
- Evaluation signals derived from real outcomes
- Evaluation gates and safe rollout
- Cost governance

UiPath’s role adds credential brokering, agent-to-agent authorization, just-in-time elevation, sandboxing, policy-as-code, attribution, and auditable tool use. AWS guidance adds permission propagation through agent chains, circuit breakers, state isolation, registries, traceability, and automated evaluation. Marvell emphasizes shared, reusable services with evaluation and observability designed in from the beginning.

**Implication for the plan:** The existing product-agent Epic is directionally correct, but its platform story should explicitly require an agent and MCP registry, identity for non-human actors, least-privilege tool access, replayable traces, runtime controls, evaluation gates, and retirement/revocation mechanisms.

## 10. Governance should be embedded in the paved road

The better-aligned roles do not frame governance as a separate final approval stage. They expect security, privacy, compliance, and operational controls to be implemented in shared platforms, templates, environments, and workflows.

BlackRock describes guardrails embedded in platforms rather than enforced through gates. UiPath’s stated goal is governance strong enough for regulated use but usable enough that builders do not route around it. UL Solutions requires data and risk feasibility before substantial build work and human-in-the-loop behavior where risk requires it.

**Implication for the plan:** The paved road should make the compliant path the simplest path. Exceptions can require review; routine approved patterns should not repeatedly enter manual approval queues.

# Assessment of the current Epics

| Current Epic | Evidence alignment | Required strengthening before revision |
|---|---|---|
| 1. Establish the transformation mandate | Strong | Make sponsor and manager behavior observable; define benefit ownership and explicit capacity tradeoffs. |
| 2. Simplify the product and project operating model | Strong | Define which approvals, handoffs, and duplicate artifacts are removed; make governance forums decision-oriented. Avoid low-level Jira workflow prescriptions. |
| 3. Reconnect Product, Engineering, and users | Strong | Add continuous cross-functional discovery, early four-risk testing, instrumentation, and a living evidence-to-specification chain. |
| 4. Make legacy systems ready for AI-assisted change | Partial | Add verified system-understanding packages, characterization tests, business-rule extraction, SME validation, dual-run/cutover evidence, and incremental economics. |
| 5. Establish the AI-native engineering system | Strong | Add AI-aware review responsibility, AI-first onboarding, role proficiency, team-design decisions, and AI-specific quality/economic measures. |
| 6. Position AI enablement as a transformation function | Very strong | Add formal engagement intake, cohort duration, exit criteria, pattern-harvesting responsibility, and sustained ownership by delivery leaders. |
| 7. Build internal networks and AI capability | Partial | Add role/job-family changes, manager expectations, time-to-competence, maintained agent-readable knowledge, and knowledge ownership/freshness. |
| 8. Build and govern production AI agents | Strong but incomplete | Add registry, non-human identity, delegated permissions, replayable traces, runtime policy, evaluation gates, safe rollout, revocation, and cost attribution. |
| 9. Measure, learn, and scale | Strong but incomplete | Turn it into explicit benefits realization with business owners, financial baselines, total economics, scheduled value reviews, and stop/scale decisions. |

# Further candidate changes for discussion

These are the highest-value changes to consider when the document is revised:

1. Expand the legacy Epic from a system map to a verified reconstruction-and-modernization method.
2. Add workforce and management redesign as explicit deliverables, including AI-first onboarding and changed role expectations.
3. Make continuous Product–Engineering discovery operate inside the quarterly investment cadence.
4. Add an explicit benefits-realization contract to every selected transformation area.
5. Strengthen the enablement engagement model with entry, exit, transfer, and local-accountability criteria.
6. Expand the agent-platform requirements to cover registry, identity, delegated access, trace replay, evaluation gates, and revocation.
7. State that governance controls belong in shared paved roads and platforms, with manual review reserved for exceptions.
8. Measure transformation at system level and prohibit individual AI-activity metrics as performance targets.

# Sources

## Original job-description corpus

1. [Netflix — Senior Engineering Manager, Agent Platform, AI Platform](https://www.linkedin.com/jobs/view/4445534437/)
2. [Netflix — Software Engineer 5, Agent Platform, AI Platform](https://netflix.wd108.myworkdayjobs.com/Netflix/job/Software-Engineer-5---Agent-Platform--AI-Platform_JR41100)
3. [Experian — Senior Director, AI Platform Engineering](https://www.linkedin.com/jobs/view/4447572772/)
4. [Red Ventures — Director of Engineering, Agentic Workflows](https://www.redventures.com/careers/positions/open?gh_jid=7563266)
5. [Jerry — Senior Manager, AI Agents and Automation](https://jobs.ashbyhq.com/Jerry.ai/b8857bb2-9861-4188-88c9-800fe4495409)
6. [Huntress — Director, Engineering, Platform](https://job-boards.greenhouse.io/huntress/jobs/7777533003)
7. [Oracle — Senior Manager, AI Engineering and Agent Platform](https://www.linkedin.com/jobs/view/4439664313/)
8. [Toast — Senior Director of Engineering, Developer and Agent Experience](https://www.linkedin.com/jobs/view/4446515183/)
9. [Cloudera — Senior Engineering Manager, Enterprise AI](https://cloudera.wd5.myworkdayjobs.com/en-US/external_career/job/US-Connecticut-Remote/Senior-Engineering-Manager--Enterprise-AI_260712-2)
10. [Aledade — Senior Engineering Manager, AI Enablement and EHR Agents](https://jobs.lever.co/aledade/c9a8393b-3821-4ad4-85f2-a1196844ceb1)
11. [Tulip Interfaces — AI Enablement Engineer, Developer Experience](https://www.linkedin.com/jobs/view/4446400598/)
12. [KeyBank — Agentic AI Lead](https://keybank.wd5.myworkdayjobs.com/en-US/External_Career_Site/job/Agentic-AI-Lead-Role_R-40586)
13. [AgileBlue — AI Enablement and Business Operations](https://www.linkedin.com/jobs/view/4448629214/)
14. [PitchBook — AI Enablement Specialist](https://job-boards.greenhouse.io/pitchbookdata/jobs/4694011006)
15. [K18 Hair — AI Enablement and Solutions Lead](https://job-boards.greenhouse.io/k18inc/jobs/5224116008)
16. [Board of Innovation — AI Transformation Lead](https://apply.workable.com/boardofinnovation/j/7D7915EF5A/)
17. [Spreedly — Business AI Operations Specialist](https://www.linkedin.com/jobs/view/4447596305/)
18. [D. E. Shaw Group — Learning and Development Strategist, AI Enablement](https://www.deshaw.com/careers/learning-development-strategist-ai-enablement-5887)
19. [BCforward — AI Enablement Engineer, Intake, Value and Adoption](https://www.linkedin.com/jobs/view/4446806329/)
20. [Molina Healthcare — Senior ServiceNow Engineer, AI Enablement and Platform Strategy](https://careers.molinahealthcare.com/employment/united-states-information-technology-jobs/21726/71138/6252001/2)
21. [iFIT — Director, Enterprise AI Enablement](https://www.linkedin.com/jobs/view/4445741495/)
22. [Harry's / Mammoth Brands — Director, AI Transformation](https://job-boards.greenhouse.io/harrys/jobs/8054222)
23. [Xperi — Senior Manager, AI Process Transformation](https://www.indeed.com/viewjob?jk=13d83c13e531e3f9)
24. [Trunk Tools — Program Manager, AI Transformation](https://www.linkedin.com/jobs/view/4446375458/)
25. [QTS Data Centers — Director, Enterprise AI Enablement](https://www.indeed.com/viewjob?jk=69819ddee434b5d3)
26. [KeyBank — Copilot Infrastructure Enablement Specialist](https://keybank.wd5.myworkdayjobs.com/en-US/External_Career_Site/job/Copilot-Enablement-Specialist_R-38999)
27. [KeyBank — AI-Ready Knowledge Architect](https://keybank.wd5.myworkdayjobs.com/en-US/Scout/job/AI-Ready-Knowledge-Architect_R-40364-1)

## Additional job descriptions

1. [Netflix — Senior Engineering Manager, Agent Platform, AI Platform](https://www.linkedin.com/jobs/view/4445534437/)
2. [Liatrio — Lead Application Modernization Engineer](https://jobs.lever.co/liatrio/13f146ab-6d9d-45fa-aa53-b0d8d7df9d43)
3. [66degrees — Enterprise Architect](https://builtin.com/job/enterprise-architect/9590008)
4. [MUFG — Director, GenAI Software Engineering Transformation](https://www.linkedin.com/jobs/view/4396385803/)
5. [Alvarez & Marsal — Director, Technology Services CTO Domain](https://www.linkedin.com/jobs/view/4440996345/)
6. [JPMorganChase — Senior Product Transformation & Agentic AI Lead](https://www.indeed.com/viewjob?jk=48b66a54c6185670)
7. [Magnet Forensics — Product Management Lead, AI](https://jobs.lever.co/magnetforensics/465fb92b-a66f-4de8-9cd9-9f0f91da698e)
8. [Bumble — Principal Product Manager, Bumble Date](https://jobs.accel.com/companies/bumble/jobs/77958429-principal-product-manager-bumble-date)
9. [Klaviyo — AI Enablement Program Manager](https://www.linkedin.com/jobs/view/4438363318/)
10. [BlackRock — Director, AI Enablement & Ecosystem](https://www.linkedin.com/jobs/view/4411230559/)
11. [Vanguard — AI Enablement Engineer](https://uk.linkedin.com/jobs/view/4414733322/)
12. [GitHub — AI Enablement Engineer](https://www.linkedin.com/jobs/view/4429371952/)
13. [Pfizer — Director, AI Change Adoption](https://www.linkedin.com/jobs/view/4427631519/)
14. [AHEAD — AI Adoption Lead](https://www.linkedin.com/jobs/view/4431451290/)
15. [Project Management Institute — AI Program Manager](https://www.linkedin.com/jobs/view/4440357683/)
16. [UL Solutions — Senior AI Product Manager](https://www.linkedin.com/jobs/view/4401655754/)
17. [The Walt Disney Company — VP, Transformation Management Office](https://www.linkedin.com/jobs/view/4435436617/)
18. [UiPath — Director, Product Management, Governance (Identity & Auth)](https://jobs.ashbyhq.com/uipath/bd2f849d-7704-4911-9b1c-81d826b5742b/)
19. [Marvell — Director, Agentic AI Solutions and Operations](https://marvell.wd1.myworkdayjobs.com/en-US/MarvellCareers/job/Director--AI-Operations---Observability---Enterprise-AI-Platforms_2600114)

## Supporting research and technical guidance

20. [AWS Prescriptive Guidance — Agents layer for governed agentic AI](https://docs.aws.amazon.com/prescriptive-guidance/latest/govern-architect-agentic-ai/agents-layer.html)
21. [McKinsey — The operating model advantage: Why AI winners are rewiring their organizations](https://www.mckinsey.com/industries/industrials/our-insights/the-operating-model-advantage-why-ai-winners-are-rewiring-their-organizations)
22. [Deloitte — Rewiring the operating model for AI](https://www.deloitte.com/us/en/insights/topics/technology-management/rewiring-ai-operating-model.html)
23. [Gartner — Change management trends for CHROs in the age of AI](https://www.gartner.com/en/newsroom/press-releases/2026-3-16-gartner-identifies-top-change-management-trends-for-chros-in-age-of-ai)
24. [IBM — CEOs are reshaping C-suite roles for the AI era](https://newsroom.ibm.com/2026-05-04-ibm-study-ceos-are-reshaping-c-suite-roles-for-the-ai-era?asPDF=1)
25. [Microsoft — Scaling AI with confidence](https://www.microsoft.com/en-us/industry/microsoft-in-business/business-insights/2026/04/01/scaling-ai-with-confidence-how-leaders-are-using-ai-to-drive-enterprise-transformation/)
26. [GFT — AI modernization and legacy-system transformation](https://www.gft.com/uk/en/about-us/newsroom/press-and-news/2026/press-releases/gft-launches-ai-powered-approach-to-legacy-modernization)

# Research conclusion

The transformation plan is directionally well aligned with the wider market evidence and does not need a wholesale redesign. The highest-priority responsibilities now reflected in the plan are:

- Reconstruct and verify legacy-system behavior before AI-assisted change.
- Redesign management, roles, onboarding, and incentives alongside engineering workflows.
- Keep Product and Engineering together through continuous discovery, delivery, adoption, and learning.
- Give every initiative a benefits owner and an evidence-based stop-or-scale loop.
- Operate central enablement as a temporary embedded service that leaves teams independent.
- Treat agent identity, permissions, registry, evaluation, observability, and revocation as platform requirements.

These additions make the plan more defensible against the researched responsibilities without making it more procedural or Jira-centric.

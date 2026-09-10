# Product And Engineering Context Platform: Technical Proposal

## Status

Draft technical proposal and starting point for implementation planning.

Audience: company management, product leadership, enterprise and solution architects, engineering leadership, development teams, customer service, and the platform team.

## Executive Summary

The company has product and technical knowledge, but it is distributed across people, repositories, Jira, Confluence, Gong, GitHub, and GitLab. These sources use different names and organize information differently. A customer describes a visible feature, while engineering organizes the implementation as frontends, services, libraries, APIs, and repositories. Product managers and customer-service teams cannot reliably move from one view to the other without finding the right engineers.

This proposal creates a **Product and Engineering Context Platform**: a maintained map connecting customer-facing products and capabilities to the software components, repositories, teams, documentation, and work history that implement them. Employees use the map through a company web portal. Approved AI assistants use the same map and source evidence through read-only tools.

The platform is a reusable context foundation rather than a tool for only one or two workflows. It can support:

- customer-issue routing and investigation
- feature planning and early impact analysis
- engineering discovery across repositories, components, APIs, dependencies, and owners
- cross-team coordination when changes affect shared systems
- architecture, operational, security, and cost analysis as additional evidence sources are connected
- permission-aware context retrieval for employees and approved AI assistants

The phased pilot deliberately validates customer-issue triage first. That narrow pilot controls risk and provides a measurable starting point; it does not define the platform's eventual scope.

The platform does not attempt to infer the company architecture from source code alone. Product and development teams maintain a small set of authoritative relationships, while automation imports source-system facts and checks freshness. AI uses this structure to retrieve and explain evidence; it does not make final product, architecture, routing, or estimate decisions.

## How The Platform Would Help

Assume customer service receives this issue:

```text
Invoice Center exports time out for large accounts.
```

The phrase `Invoice Center export` does not name a repository or engineering service. In the proposed platform it is registered as an alias for the customer-facing capability **Invoice Export**. That capability is connected to the components that implement it, such as a billing frontend, billing API, and invoice worker. Those components are connected to their repositories, owners, APIs, dependencies, Jira work, and Confluence documentation.

An employee or AI assistant can therefore follow an evidence-backed path:

```text
customer phrase
  -> product capability
  -> implementing software components
  -> dependencies and repositories
  -> responsible teams
  -> related Jira work and Confluence documentation
```

The result is not a claim that every connected component is broken. It is an impact report explaining which areas may be relevant, the relationship paths and evidence that connect them to the issue, who should review it, and what information is still missing.

The same map supports feature planning in the opposite direction. A proposal such as "scheduled invoice exports to customer storage" can be compared with the existing Invoice Export capability, its implementation, available APIs, prior decisions, and owning teams before detailed planning starts.

## Problems And Intended Outcomes

| Scenario | Current problem | Proposed improvement |
| --- | --- | --- |
| Customer issue triage | Customer terminology does not identify the correct product, component, repository, or team | Resolve customer terms to capabilities, components, owners, similar issues, and evidence |
| Feature planning | PMs cannot easily see where a proposed feature fits or what already exists | Show related capabilities, systems, components, APIs, teams, documents, and prior work |
| Engineering discovery | Developers reconstruct ownership and dependencies from code, chat, and personal knowledge | Provide a maintained component map with source, docs, owners, and relations |
| Cross-team planning | Shared dependencies and affected teams appear late | Identify likely direct and indirect component impact before scope is committed |
| AI-assisted work | Claude and Codex receive fragmented or manually assembled context | Give agents permission-aware catalog and retrieval tools with source links |

## Proposed Solution

The platform has three layers.

### 1. Product And Engineering Catalog

This is the maintained map. It gives immutable identifiers to products, customer-visible capabilities, technical systems, software components, APIs, resources, repositories, and teams. It also records the important relationships between them.

Product teams maintain customer language, product names, capability definitions, and aliases. Development teams maintain component boundaries, engineering ownership, APIs, and intended dependencies. Platform automation validates the entries and imports suitable repository facts.

### 2. Connected Source Context

The platform links catalog entities to the systems where detailed work and evidence already live:

- Jira for issues, epics, status, and delivery history
- Confluence for product, architecture, decision, and operational documentation
- Gong for approved customer evidence
- GitHub and GitLab for repositories, code, and selected repository metadata

These systems remain authoritative. The platform indexes only approved content and source references needed for search and analysis. It does not become a replacement for them.

### 3. Portal And AI-Assisted Analysis

Employees browse and search the catalog in a company web portal. Claude, Codex, and other approved assistants access the same permission-aware context through a read-only API. Their reports include source links, relationship paths, freshness, known limitations, and missing information so a person can verify the result.

This combination is the proposed solution. A graph database is not the solution by itself, and one is not required for the initial implementation.

## Decision Requested

Approve a phased pilot for one product area, using customer-issue triage as the single workflow evaluated in depth. Feature planning, Gong integration, broad semantic retrieval, and company-wide onboarding remain outside the pilot. The pilot should validate both the operating idea and the technology choice before any wider rollout.

The decision includes a short technical evaluation that must confirm:

- the catalog model can represent the pilot product area without excessive customization
- GitHub, GitLab, Jira, and Confluence meet the defined permission tests with no unauthorized content returned
- AI-generated issue reports meet the defined issue-mapping and evidence targets
- product and development teams can maintain the required relationships as part of normal work
- expected operational effort and total cost are justified by the workflow improvement

## Technology Options And Recommendation

### Evaluation Criteria

The technology should be evaluated against the actual problem rather than selected because it is described as a knowledge graph or developer portal. The important criteria are:

- coverage of products, capabilities, components, repositories, APIs, resources, and teams
- support for relationships and impact traversal, not only text search
- GitHub and GitLab support without forcing repository migration
- integration with Jira, Confluence, company identity, and AI tools, with an extension path for Gong
- preservation of source permissions and evidence links
- maintenance effort for catalog data, software upgrades, and custom integrations
- infrastructure, support, subscription, and engineering cost
- ability to extend later without replacing stable entity identifiers

### Option 1: Build On Backstage

Backstage is an open-source framework for building internal developer portals. The name and project originated at Spotify, which later donated it to the Cloud Native Computing Foundation. It is now a general open-source project, not a Spotify-hosted service or a requirement to adopt Spotify's organization model.

Backstage provides a portal framework, catalog engine, standard software entity model, relationship processing, search and permission extension points, and a plugin architecture. The company deploys, brands, operates, and extends its own application.

**Cost and maintenance:** Backstage is licensed under Apache License 2.0, so there is no Backstage license fee. It is not cost-free. The company pays for hosting, PostgreSQL, search or vector infrastructure, monitoring, backups, security work, upgrades, plugin compatibility, and the engineers who own the application. A managed Backstage provider could reduce operational work but would introduce a separate commercial subscription and vendor evaluation.

**Maintenance benefit:** Backstage can reduce catalog maintenance by discovering metadata from GitHub and GitLab, validating it, reconciling changes, and keeping technical ownership close to the code. It does not remove human maintenance. Product aliases, capability meaning, intended dependencies, and ownership still require accountable teams. The platform also needs a supported upgrade and plugin policy.

**Integration coverage:**

| Source | Available foundation | Additional work for this proposal |
| --- | --- | --- |
| GitHub | Core integration and catalog discovery | Configure organizations, credentials, schedules, and repository rules |
| GitLab | Core integration and catalog discovery | Configure groups, credentials, schedules, and repository rules |
| Company identity | Authentication providers include Microsoft Azure/Entra ID and other common providers | Map company groups and enforce catalog and source permissions |
| Jira | Atlassian authentication support and community Jira plugins exist | Build or select a maintained connector for issue retrieval, entity mapping, and permission behavior |
| Confluence | Atlassian authentication and Backstage extension points exist | Build or select permission-aware indexing and entity mapping for approved pages |
| Gong | No relied-upon core connector is assumed | Defer from the pilot; evaluate a restricted connector only after the primary workflow succeeds |
| Claude and Codex | Backstage exposes APIs and plugin extension points | Build the proposed read-only Context API and approved agent connectors |

Community plugins are accelerators, not guarantees. The Backstage plugin directory states that community plugins are not fully vetted by the core team. Each selected plugin therefore needs a security, maintenance, license, and compatibility review.

### Option 2: Build An Azure-Native Custom Platform

The company could build the same business model using Azure application hosting, Microsoft Entra ID, PostgreSQL or another database, Azure AI Search, and custom connectors and user interfaces.

This option uses managed Azure building blocks and may fit existing cloud operations and procurement. It does not provide the required software catalog model, repository metadata conventions, relationship processing, or portal out of the box. The company would own more application code and long-term product maintenance than with Backstage.

### Option 3: Use Azure API Center As A Partial Foundation

Azure API Center is a Microsoft-managed inventory and governance service for APIs. It supports API metadata, discovery, definitions, deployments, a portal, and semantic search in its Standard plan. It can catalog APIs regardless of where they are hosted. Microsoft offers Free and Standard plans; actual subscription cost and limits must be checked against the company's Azure agreement.

It is relevant if API discovery and governance are major goals, but it is not a complete substitute for this proposal. Its primary model is APIs, versions, definitions, environments, and deployments. The proposed platform must also connect customer products and capabilities to frontends, workers, libraries, repositories, teams, Jira work, documents, and customer evidence. Azure API Center could later be linked as an authoritative API inventory.

Azure Resource Graph can supply Azure infrastructure inventory, but it queries Azure resources rather than the company-wide product-to-software context described here.

### Option Summary

| Option | Direct cost model | Company maintenance | Fit for this proposal |
| --- | --- | --- | --- |
| Self-managed Backstage | No license fee; hosting and supporting services cost money | Operate and upgrade the application; maintain custom model and connectors | Strongest existing software-catalog foundation, but not turnkey |
| Managed Backstage | Vendor subscription plus integration work | Less platform operation; company still owns data quality and custom behavior | Potentially strong; requires vendor and exit-path evaluation |
| Azure-native custom platform | Azure consumption and support costs | Highest amount of company-owned application and connector code | Flexible, but recreates catalog and portal capabilities |
| Azure API Center | Azure Free or Standard plan | Lower API-inventory maintenance; substantial extension needed beyond APIs | Potential complement or API-focused alternative, not full coverage |

### Recommendation For The Pilot

Use Backstage as the leading pilot candidate, not as a predetermined company-wide decision. It is the closest fit because the required foundation is a software catalog spanning GitHub and GitLab, with components, ownership, APIs, resources, and relationships. Its lack of license fees and existing catalog mechanics reduce initial product development, but the operating and customization costs remain material.

During pilot preparation, run a bounded comparison against an Azure-native custom implementation and Azure API Center. Confirm the choice only after demonstrating repository discovery, the Product and Capability extension, company identity, source permission handling, and one AI-assisted issue report. If Backstage customization or maintenance proves disproportionate, retain the catalog model and immutable identifiers but implement them on the better-fitting platform.

## How Catalog Information Is Maintained

The catalog needs a small amount of structured, version-controlled information that cannot be reliably inferred from code. With Backstage, the conventional format is a metadata file named `catalog-info.yaml` stored with the software repository.

Development teams use this record to declare the meaningful software components in the repository, their owners and lifecycle, the system they belong to, APIs they provide or consume, intended dependencies, and links to source and documentation. Backstage discovers and validates the records, creates the declared relationships, and presents them through the portal and APIs.

```text
repository catalog record
        -> discovery and validation
        -> catalog entities and relationships
        -> web portal and Context API
```

The file format is an implementation convention, not the idea being proposed. If another platform is selected, the same information model and ownership split should be retained in an equivalent machine-readable form.

## Phased Scope

**Planning assumption:** time-box the pilot to 8-10 weeks with two dedicated engineers and part-time participation from a product manager, customer-service subject-matter expert, architect, security representative, and engineers from the pilot product area. Confirm these assumptions before approval; they are not delivery commitments.

Use Backstage as the leading candidate. The time-boxed pilot covers Phases 1-3. Phase 4 is a later expansion and requires a separate decision based on the pilot results.

### Phase 1: Catalog Foundation

Implement the catalog, Product and Capability entities, GitHub and GitLab discovery, ownership, validation, and the basic portal.

This phase establishes immutable identifiers and shows products, capabilities, components, repositories, owners, APIs, dependencies, and documentation links for the pilot area.

Do not proceed until the catalog is understandable, sufficiently complete, and maintainable without AI assistance.

### Phase 2: One Operational Workflow

Connect Jira and Confluence and validate the customer-issue triage workflow with one product area.

- select at least 20 representative historical customer issues
- implement permission-aware retrieval and relationship-path explanations
- compare issue-to-capability and issue-to-team results with engineering-confirmed answers
- establish the current triage-time baseline before measuring improvement

Do not add AI-generated reports, Gong, or broad source coverage in this phase.

### Phase 3: AI-Assisted Retrieval

Expose the read-only Context API and validate AI-generated reports with source links and missing-information notices.

- generate a customer-issue report containing likely affected components, relationship paths, supporting sources, known limitations, and missing information
- test the authorized cases through one approved assistant interface, such as Claude or Codex
- keep deterministic catalog relations and exact retrieval as the pilot baseline

### Phase 4: Expansion

Add feature-planning workflows, Gong integration, semantic retrieval, and broader source coverage only after the previous phases are successful.

At the end of each phase, compare results with the applicable success criteria and decide whether to continue, correct the design, or stop. Do not introduce a dedicated graph database during Phases 1-3. Consider a graph projection during expansion only if evaluation identifies valuable multi-hop queries that the catalog and PostgreSQL cannot answer adequately.

## Where Catalog Information Lives

Use a split ownership model:

- Product teams maintain shared product names, customer terminology, capabilities, aliases, Jira references, and product ownership in one version-controlled catalog source.
- Development teams maintain technical components, systems, APIs, dependencies, engineering owners, and documentation links beside the relevant code.
- Platform automation validates both sources and reports missing owners, broken references, and stale entries.

A repository can describe one or several software components. A monorepo should not create a catalog entry for every folder. It should describe units with a meaningful deployment, ownership, operational, API, release, or reuse boundary. For example, one monorepo may contain a separately deployed frontend, API service, and background worker, each represented as a component.

## Catalog Model

For the Backstage candidate, use its standard entities where they fit:

| Entity | Use |
| --- | --- |
| `Domain` | Broad business domain such as commerce or identity |
| `System` | Coherent technical subsystem |
| `Component` | Frontend, backend service, worker, library, pipeline, or model |
| `API` | HTTP, event, GraphQL, gRPC, or other contract |
| `Resource` | Database, queue, bucket, cluster, or external service |
| `Group` | Product, engineering, or platform team |

Add two company-specific entities:

| Entity | Use |
| --- | --- |
| `Product` | Customer-recognized or commercially meaningful solution |
| `Capability` | Customer outcome or recognizable feature, including aliases |

The custom model requires:

- TypeScript types and JSON schemas for `Product` and `Capability`
- a Backstage catalog backend module that validates the entities
- processors that emit product, capability, system, component, and owner relations
- simple Product and Capability pages in the portal

This is deliberate custom work. Product and capability concepts should not be hidden in generic documentation because they are the bridge between customer language and implementation.

## Identifier And Rename Requirements

Define an immutable catalog identifier separately from the display title and Backstage entity name before importing production data. For the Backstage candidate, store a company-issued UUID in a required annotation such as `company.example/catalog-id` on every governed entity.

- The immutable identifier never changes and is never reused.
- Display titles can change without affecting references.
- Customer-facing aliases retain previous terminology for search and historical issues.
- An entity-name change keeps the same immutable identifier, creates a redirect from the previous entity reference, and updates dependent references through a validated migration.
- Merges and splits create new identifiers and retain explicit successor and predecessor relationships.
- Connectors store the immutable identifier rather than relying only on mutable names such as `invoice-export`.

The pilot must exercise at least one rename and one alias change before production data is accepted.

## Illustrative Product And Capability Record

Replace `company.example` with the company's namespace.

```yaml
apiVersion: company.example/v1alpha1
kind: Product
metadata:
  name: customer-billing
  title: Customer Billing
  description: Customer-facing invoice and payment management
  annotations:
    company.example/catalog-id: 7a0c7d8e-7ea8-4f01-bf6f-064dbf401201
    company.example/jira-project: BILL
    company.example/confluence-space: BILLING
spec:
  owner: group:default/billing-product
  domain: domain:default/commerce
  capabilities:
    - capability:default/invoice-export
    - capability:default/payment-status
  systems:
    - system:default/billing-platform
---
apiVersion: company.example/v1alpha1
kind: Capability
metadata:
  name: invoice-export
  title: Invoice Export
  description: Customers generate and download invoice reports
  annotations:
    company.example/catalog-id: cb893abc-f1ee-43e4-b337-df19f9ded920
spec:
  owner: group:default/billing-product
  product: product:default/customer-billing
  aliases:
    - Invoice Center export
    - billing report download
    - bulk invoice report
```

The product team owns these definitions. The capability file does not name implementation components; engineering declares that mapping beside the code.

## Illustrative Repository Record

The following excerpt shows how one repository can declare more than one component and connect them to the customer-facing capability.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: billing-api
  title: Billing API
  description: Billing and invoice operations
  annotations:
    company.example/catalog-id: e42cf14e-6950-47d6-aa59-5c212df07447
    backstage.io/techdocs-ref: dir:.
    backstage.io/source-location: url:https://github.example/billing/billing-platform
    company.example/capabilities: invoice-export,payment-status
spec:
  type: service
  lifecycle: production
  owner: group:default/payments-engineering
  system: billing-platform
  providesApis:
    - billing-api
  dependsOn:
    - component:default/invoice-worker
    - resource:default/billing-database
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: invoice-worker
  title: Invoice Worker
  description: Generates invoice export files asynchronously
  annotations:
    company.example/catalog-id: f73e6e46-d549-4d75-958f-148986454cb5
    backstage.io/source-location: url:https://github.example/billing/billing-platform
    company.example/capabilities: invoice-export
spec:
  type: service
  lifecycle: production
  owner: group:default/payments-engineering
  system: billing-platform
  dependsOn:
    - component:default/reporting-library
```

The custom processor reads `company.example/capabilities` and emits `implements` and `implemented-by` relations. Product teams own capability meaning; engineering teams own which components implement it.

## Proposed Pilot Architecture

```text
GitHub/GitLab catalog-info.yaml       Central product catalog YAML
                 \                    /
                  Backstage discovery
                          |
             Catalog backend + custom processor
                          |
                      PostgreSQL
                          |
          +---------------+----------------+
          |                                |
   Backstage portal                 Context API
                                           |
                           Jira/Confluence indexers
                                           |
                         Catalog + evidence retrieval
                                           |
                            Selected AI assistant
```

### Backstage Application

The Backstage application provides:

- product, capability, system, component, API, resource, and team pages
- catalog search
- relation visualization
- links to source repositories, Jira, and Confluence evidence
- TechDocs or links to existing technical documentation
- authentication and portal-level authorization

### PostgreSQL

Use PostgreSQL for the Backstage database and initial search. Keep context-service tables in a separate schema or database. Do not add a vector index during Phases 1-3; semantic retrieval belongs to Phase 4 and requires evidence that exact search, aliases, and catalog relationships are insufficient.

### Context Indexing Service

Implement one service with replaceable source adapters:

- Jira adapter
- Confluence adapter

Each indexed record contains:

- source system and stable source ID
- source URL
- entity references such as product, capability, component, or team
- permitted users or groups
- source version and last-updated time
- approved searchable text or summary
- deletion state

The service performs scheduled reconciliation. Webhooks can update Jira and Confluence records between full reconciliations.

### Context API And Agent Gateway

Expose a read-only API with operations such as:

```text
search_entities
resolve_customer_term
get_entity_context
get_owners
find_related_components
find_similar_work
get_supporting_evidence
analyze_issue_impact
```

The gateway authenticates the user, applies source permissions, calls Backstage and the context index, and returns bounded evidence. The selected assistant uses the API through its approved connector or tool protocol.

Do not give agents direct database access.

## Source Integration Rules

| Source | Pilot use | What remains authoritative |
| --- | --- | --- |
| GitHub and GitLab | Discover YAML, source links, ownership, API files, selected repository metadata | Source code and repository state |
| Jira | Project links, issues, epics, historical work, issue-to-component references | Work status and delivery history |
| Confluence | Approved product, architecture, decision, and runbook pages | Maintained documentation |
| Gong | Deferred from the pilot | Customer conversations |

Practical conventions:

- Add Product, Capability, and Component custom fields to relevant Jira issue types using immutable catalog IDs.
- Label or classify Confluence pages intended for indexing and add catalog entity IDs through page properties or an agreed metadata block.
- Do not ingest Gong content during the pilot. Define its policy and value case before considering a later connector.
- Preserve GitHub and GitLab provider IDs and URLs even though they are normalized into one internal source model.

## Pilot User Experience

### Customer-Issue Triage

For an issue such as the invoice-export example at the start of this proposal, return:

- matched product and capability with the terms that caused the match
- likely affected primary and dependent components
- owning teams and Jira routing information
- related issues, documents, and relationship paths
- source links, freshness, known limitations, and missing information

Customer service uses the report to route the issue; engineering confirms the impact.

### Engineering Discovery

A developer opens `invoice-worker` in the portal and sees:

- product and capability context
- repository and source path
- owning and dependent teams
- upstream and downstream components
- API and resource relations
- Jira project, documentation, and runbooks
- source freshness and catalog validation status

## Ownership And Maintenance

| Responsibility | Owner |
| --- | --- |
| Product names, aliases, capabilities, Jira and Confluence references | Product teams |
| Components, systems, APIs, declared dependencies, technical docs | Development teams |
| Source discovery, schemas, processors, validation, portal, Context API | Platform team |
| AI workflow evaluation and guardrails | Platform team with workflow owners |

Automation should discover repository and source facts. Humans maintain meaning, ownership, and intended architectural relationships.

CI should validate `catalog-info.yaml` syntax, entity references, required owners, and allowed annotation formats. The portal should show stale, invalid, orphaned, and unowned entities.

## Security Requirements

- Use company single sign-on.
- Use read-only, least-privilege source credentials.
- Preserve Jira, Confluence, GitHub, and GitLab access restrictions.
- Filter unauthorized records before information reaches the model.
- Treat indexed text as untrusted data, not agent instructions.
- Log context-tool calls and source IDs for sensitive workflows.
- Propagate deletion and permission changes during reconciliation.
- Apply approved model retention, training, and customer-data policies.
- Keep the pilot read-only; no automatic Jira, Confluence, or repository changes.

## Pilot Permission Requirement

The pilot will use both index-time filtering and retrieval-time authorization. Store the source record's permitted users or groups when it is indexed, and filter the index before retrieval. Before returning restricted Jira or Confluence evidence, revalidate the requesting user's current access against the source system or an authoritative permission cache with an agreed short lifetime. An index snapshot alone is not sufficient.

If current user access cannot be revalidated reliably, do not index the restricted content body. Store only metadata and a source link that enforces access in the source system.

The test set must cover:

- a user with and without access to the same restricted record
- addition and removal of group membership
- a source record deleted after indexing
- a source permission changed after indexing
- confirmation that unauthorized text, summaries, and titles do not reach an AI tool

## Pilot Success Criteria

Confirm the final thresholds and baseline before implementation. The following are the initial approval targets:

| Measure | Target | Verification |
| --- | --- | --- |
| Catalog completeness | 100% of onboarded pilot entities have an immutable ID, owner, source, and required relationships | Automated validation plus owner review |
| Reconciliation | At least 95% of valid GitHub and GitLab records appear in the catalog within 24 hours | Connector logs and catalog audit |
| Data-quality detection | 100% of deliberately seeded invalid, orphaned, and stale test records are reported | Controlled test cases |
| Issue mapping | At least 80% of the selected historical issues identify the engineering-confirmed capability and owning team | Blind comparison against confirmed answers |
| Triage time | Median time to identify the reviewing team is at least 30% lower than the recorded baseline | Timed baseline and pilot exercises |
| Evidence | Every suggested affected component includes a catalog relationship path or verifiable source link | Report audit |
| Permissions | 100% of permission, deletion, and group-change tests pass, with no unauthorized content returned | Automated and manual security tests |
| Rename safety | One entity rename and one alias change preserve historical references and links | Migration test |
| Maintainer usability | A product owner and a development-team owner each complete an update without the platform team editing the record | Observed maintenance exercise |

### Continue Or Stop

Continue beyond the pilot only if the permission and identity requirements pass, the issue-mapping and triage-time targets are met, participating teams accept the maintenance model, and a platform owner is funded.

Pause immediately if unauthorized source content reaches a user or AI tool. Stop or redesign the initiative if the outcome targets remain unmet after one agreed correction cycle, or if catalog maintenance requires the platform team to own product and component facts on behalf of participating teams.

## Further Technical Extensions

The following extensions remain separate decisions beyond the phased scope.

### Dedicated Graph Projection

Project selected catalog relations into Neo4j or another graph store only when deeper path queries, graph algorithms, or graph federation are justified by evaluated workflows. Treat the projection as a query and analysis layer. Catalog metadata, source systems, and declared ownership remain authoritative.

### Domain-Specific Graphs

Link a component to business-domain, code, runtime, data-lineage, infrastructure, security, or cost graphs using the immutable catalog entity ID. These graphs should extend the platform with domain-specific evidence, not create competing identifiers or hidden sources of truth.

### Code And Runtime Impact

Add SCIP, CodeQL, repository knowledge graphs, or another code index for precise cross-repository references when code-level impact analysis becomes a proven need. Add tracing-derived service calls to compare declared and observed dependencies. Keep source-derived relationships separate from inferred semantic links, and expose freshness, source paths, and confidence so agents can verify important claims before acting.

### Planning And Cost Analysis

Connect historical Jira delivery data and infrastructure cost sources after product, component, and ownership identities are reliable. Return ranges and uncertainty, not false precision.

### Controlled Write-Back

After read-only workflows are evaluated, consider human-approved actions such as adding Jira labels, suggesting owners, or attaching an impact report. Keep priority, customer commitments, architecture approval, and estimates under human control.

## Decisions Required Before Implementation

1. Pilot product area and workflow owners.
2. Company-facing portal name and platform owner.
3. Company namespace for custom entity kinds and annotations.
4. Historical customer-issue test set, confirmed answers, and baseline method.
5. Jira and Confluence deployment types, authentication, and retrieval-time authorization approach.
6. Company identity source for groups and ownership.
7. Selected platform, hosting, database, and support model.
8. Approved AI assistant interface for the pilot.
9. Existing observability, API catalog, CMDB, or architecture sources that should be linked rather than duplicated.

## References

- [What Backstage is](https://backstage.io/docs/overview/what-is-backstage/)
- [The Spotify origin of Backstage](https://backstage.io/docs/overview/background/)
- [Backstage licensing and non-technical FAQ](https://backstage.io/docs/faq/product/)
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog/)
- [Backstage integrations](https://backstage.io/docs/integrations/)
- [Backstage plugin directory](https://backstage.io/plugins/)
- [Backstage descriptor format](https://backstage.io/docs/next/features/software-catalog/descriptor-format/)
- [Backstage GitHub discovery](https://backstage.io/docs/integrations/github/discovery/)
- [Backstage GitLab discovery](https://backstage.io/docs/next/integrations/gitlab/discovery/)
- [Extending the Backstage catalog model](https://backstage.io/docs/features/software-catalog/extending-the-model/)
- [Backstage PostgreSQL configuration](https://backstage.io/docs/getting-started/config/database/)
- [Backstage search engines](https://backstage.io/docs/features/search/search-engines/)
- [Confluence Cloud REST API](https://developer.atlassian.com/cloud/confluence/rest/v1/)
- [Jira Cloud REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Gong API capabilities](https://help.gong.io/v1/docs/what-the-gong-api-provides)
- [GitHub dependency graph API](https://docs.github.com/en/rest/dependency-graph)
- [GitLab Projects API](https://docs.gitlab.com/api/projects/)
- [Microsoft platform engineering guidance on inventories and catalogs](https://learn.microsoft.com/en-us/platform-engineering/about/discoverability)
- [Azure API Center overview](https://learn.microsoft.com/en-us/azure/api-center/overview)
- [Azure Resource Graph overview](https://learn.microsoft.com/en-us/azure/governance/resource-graph/overview)

## Related Guidance

- `repository-knowledge-graphs.md`
- `graph-assisted-code-review.md`
- `ai-native-product-management.md`
- `ai-harness-engineering.md`

# AI Asset Registry

## Purpose

This document explains how an organization can make reusable AI assets discoverable, governable, testable, and maintainable without turning the registry into an indiscriminate catalogue.

An AI asset registry is a control surface for reusable behavior. It records what an asset is, who owns it, where it came from, what it can access, which workflows it supports, what evidence justifies its status, and how it is versioned, distributed, changed, and retired. Discovery is only one responsibility. A list of links without ownership, provenance, permissions, evaluation, or lifecycle is an inventory, not a governed registry.

This repository is a minimal source-based registry for strategies, guidelines, skills, agents, and extensions. The guidance below describes how that pattern can scale while retaining source control and avoiding unnecessary platform infrastructure.

## Scope

The registry may describe guidelines, skills, plugins, agents, workflows, prompts or commands, extensions, hooks, tools, MCP servers, context sources, evaluation suites, models, and policy packages. It may also publish approved plugins through a marketplace. It may point to source-controlled packages or external systems; it does not need to copy every artifact into one store.

The registry does not make an asset trustworthy merely by listing it. Registration, review, evaluation, approval, activation, and permission are separate decisions.

## Core Model

```text
source artifact and provenance
          |
          v
registration and metadata validation
          |
          v
review and representative evaluation
          |
          v
bounded approval and distribution
          |
          v
usage, failures, changes, and incidents
          |
          v
revise, restrict, supersede, deprecate, or retire
```

The registry should answer four questions:

1. **Discovery:** Which asset may help with this task?
2. **Trust:** What source, review, and evaluation evidence supports it?
3. **Authority:** In which environments and with which capabilities may it run?
4. **Lifecycle:** Who maintains it, which version is active, and when should it be changed or removed?

## Asset Types

Different assets need different metadata and evaluation:

| Asset type | Primary responsibility | Typical evidence |
| --- | --- | --- |
| Repository instruction | Stable navigation, constraints, and workflow expectations | Repository review and task outcomes |
| Skill | On-demand repeatable judgment or procedure | Routing and execution evaluations |
| Plugin | Installable distribution unit for one or more skills and related capabilities | Component, installation, compatibility, and package-level evaluation |
| Agent | Separable role with bounded authority and checkable output | Delegation, output, and boundary cases |
| Workflow | Ordered tools, agents, gates, artifacts, and state transitions | End-to-end outcome and containment suites |
| Prompt or command | Reusable invocation or small interaction contract | Representative input-output cases |
| Hook or extension | Executable lifecycle interception, state, or interface behavior | Unit, integration, permission, and compatibility tests |
| Tool or MCP server | External capability contract | Schema, behavior, authorization, and side-effect tests |
| Context source | Searchable or retrievable evidence | Coverage, freshness, authorization, and retrieval evaluation |
| Evaluation suite | Tasks, environments, graders, and release evidence | Reference-solution and grader validation |
| Model configuration | Model, settings, routing, and supported task profile | Comparative workflow evaluation |
| Policy package | Capability, data, approval, or action rules | Positive, negative, adversarial, and audit cases |

Do not force all asset types into one identical schema. They share identity, ownership, provenance, status, and lifecycle, while their invocation, compatibility, permissions, and evaluation fields differ.

## Registry Entry Contract

Every maintained entry should identify:

- stable identifier, name, asset type, and concise purpose
- source location and immutable or versioned reference
- owner and escalation contact
- lifecycle status
- intended task family, users, and environments
- invocation or discovery boundary where applicable
- required harnesses, models, tools, dependencies, and versions
- input, output, and artifact expectations
- data classification, credentials, permissions, network access, and side effects
- evaluation evidence and last evaluated configuration
- approval boundary and prohibited uses
- change history, supersession, and retirement condition

Metadata should point to authoritative source rather than duplicate the asset body. Repository-owned metadata can live beside the source and be harvested into a searchable view, following the same general ownership model as a software catalog. External assets need source identity, version, package digest or equivalent immutable reference, and acquisition history.

Missing metadata is an unresolved trust gap, not evidence that an asset has no dependencies or risk.

## Asset-Type Registry Profiles

The common entry contract applies to every asset, but each asset type has additional artifacts, metadata, and evidence. These profiles define what the registry must be able to resolve; they do not replace the asset-specific authoring guideline or force every platform into one directory layout.

| Asset type | Authoritative package artifacts | Additional registry metadata | Minimum representative evidence |
| --- | --- | --- | --- |
| Repository instruction | Instruction file and referenced policies or maps | Repository scope, precedence, consumers, context cost, conflicting instructions | Repository-task outcomes, constraint adherence, and stale or conflict checks |
| Skill | `SKILL.md`, frontmatter, references, examples, scripts, and assets | Trigger and false-positive boundary, invocation mode, required tools and capabilities, supported harnesses | Positive and negative routing plus execution-quality comparison |
| Plugin | Plugin manifest, included skills, agents, hooks, integrations, and packaged assets | Installation scope, component inventory, supported harnesses, namespace, version, dependencies, and update path | Manifest validation, clean installation, component discovery, compatibility, upgrade, and removal |
| Agent | Agent instructions, deployment manifest, task and result contracts, evaluation cases | Delegation eligibility, runtime, tools, permissions, side effects, limits, telemetry-contract version | Success, boundary, refusal, escalation, failure, correction, and contract-conformance cases |
| Workflow | Workflow or state-machine definition, component references, policies, and contracts | Triggers, stages, transitions, agents and tools, authority, recovery, acceptance boundary | End-to-end outcomes, containment, failure recovery, and concurrency where applicable |
| Prompt or command | Source text, parameters, examples, and referenced context | Invocation boundary, supported task family, expected result, model or harness assumptions | Representative input-output, false-positive, and boundary cases |
| Hook or extension | Source package, manifest, configuration, and dependencies | Lifecycle event, execution environment, permissions, side effects, compatibility | Unit, integration, permission, failure, and compatibility tests |
| Tool or MCP server | Implementation package, tool schemas, configuration, and dependency lock | Inputs, outputs, authentication, authorization, network access, side effects, rate and resource limits | Schema, behavior, authorization, negative, side-effect, and failure tests |
| Context source | Connector, index or retrieval definition, schema, and source mapping | Authority, provenance, freshness, permissions, coverage, cache and deletion behavior | Retrieval relevance, coverage, freshness, authorization, and unavailable-source cases |
| Evaluation suite | Tasks, environments, graders, assertions, fixtures, and reference artifacts | Intended decision, target workflow, task distribution, grader versions, exclusions | Reference-solution validation, grader calibration, repeatability, and contamination checks |
| Model configuration | Model identifier, settings, routing profile, and supported adapters | Intended task family, context and tool assumptions, cost and latency profile, fallback policy | Comparative workflow evaluation under recorded harness conditions |
| Policy package | Rules, enforcement references, exception process, and audit schema | Scope, decision authority, protected capabilities and data, precedence, review condition | Positive, negative, adversarial, exception, and enforcement tests |

Registration covers the complete behavior-relevant package, not only its entry file. A skill entry must not hide an executable script; an agent entry must not omit its deployment manifest; a tool entry must not omit an effectful capability; and a workflow entry must not hide the policies or component versions that determine what it can do.

Detailed construction remains with the owning guidance. `../guidelines/skill-guideline.md` defines skill packages, and `../guidelines/agent-guideline.md` defines agent instructions and deployment metadata. Workflow, tool, context, evaluation, and policy packages should use their authoritative implementation specifications where those exist.

The registry retains or references source packages, descriptors, schemas, provenance, evaluation evidence, approval, and lifecycle state. It should not become the primary store for runtime conversations, telemetry streams, credentials, or mutable execution state. Operating systems retain those records; the registry may keep stable links or summarized health needed for lifecycle decisions.

## Identity, Versions, And Aliases

Use stable asset identity separately from human-friendly display names. Renaming an asset should not break historical traces, evaluation records, dependencies, or supersession links.

Every executed asset should resolve to an immutable version, commit, package digest, or recorded configuration. Mutable aliases such as `approved`, `default`, `candidate`, or `production` can simplify consumption, but the trace must record which concrete version the alias resolved to at execution time.

Reassigning an alias is a controlled change. It can alter future behavior without changing the consuming repository, so it needs the same review and rollback discipline as a direct dependency update. Compatibility claims should attach to a version and evaluated environment rather than to the asset name indefinitely.

## Provenance And Supply Chain

Provenance describes how an asset reached the registry and which source produced it. For executable or behavior-changing assets, preserve:

- source repository and version
- author or owning organization
- build or packaging process where applicable
- referenced files, scripts, dependencies, and generated content
- review and approval actors
- evaluation run and environment
- package digest, signature, or other integrity evidence when available

This follows the general supply-chain principle expressed by SLSA provenance: an artifact should be traceable through the process that produced it. A registry entry or rendered summary must not conceal behavior-relevant frontmatter, referenced instructions, executable helpers, or transitive dependencies.

An asset imported from a marketplace, public repository, email, or chat is untrusted until the complete package and its capabilities are reviewed. Popularity, vendor identity, or successful installation does not establish suitability for a particular environment.

## Lifecycle And Trust Status

A practical lifecycle separates discovery from authority:

| Status | Meaning |
| --- | --- |
| Candidate | Registered for inspection; not approved for ordinary activation |
| Reviewed | Source, dependencies, metadata, and capabilities have been inspected |
| Evaluated | Representative routing, execution, and boundary evidence exists for a recorded configuration |
| Approved | Authorized for a defined task family, environment, data class, and autonomy level |
| Restricted | Use is limited while a risk, regression, or ownership issue is resolved |
| Deprecated | Existing consumers may migrate; new use should not begin |
| Retired | No longer active or advertised; historical provenance remains |
| Revoked | Use is blocked because integrity, security, or severe behavior is unacceptable |

Status is not a universal quality grade. An asset can be approved for read-only research but remain prohibited from state-changing workflows. Approval should record scope, expiry or review condition, and the concrete evaluated version.

## Discovery And Routing

Discovery metadata influences model behavior. A skill description, agent delegation trigger, or tool description is part of the operational control surface because it determines which capability the model may select.

Evaluate both under-triggering and over-triggering. A broad description can activate an expensive or effectful asset for unrelated tasks; an overly narrow description can hide the asset when it is needed. Nearby negative examples are as important as intended requests.

Search ranking should prefer fit, trust status, compatibility, and current ownership over popularity or recency alone. The registry should not inject every available asset into every model context. Provide a small relevant candidate set, then load full instructions only when selected and authorized.

Discovery does not grant permission. A model may learn that a deployment tool exists while still lacking credentials or approval to invoke it.

## Evaluation And Approval

Evaluation should match the asset type and the decision being made. A skill needs routing and execution cases. A tool needs schema, authorization, and side-effect tests. A workflow needs end-to-end outcomes, containment, escalation, and recovery. An evaluation suite needs known reference solutions, grader validation, and environment checks.

Record the evaluated combination of asset version, model, harness, tools, context, permissions, and environment. “Works with Codex” or “model portable” is too broad unless representative configurations have been tested.

Approval uses evaluation evidence but remains a governance decision. The approver decides whether the evidence is sufficient for the proposed task family and consequence. Detailed methodology belongs in `agent-workflow-evaluation.md`.

## Permissions And Capability Inventory

The registry should expose what an asset can cause, not only what it claims to do. Inventory:

- filesystem reads and writes
- command or code execution
- network destinations and egress
- credentials and external identities
- sensitive-data access
- external-system reads and writes
- merge, deployment, deletion, or irreversible capability
- sub-agent or dynamic tool creation
- self-modification of prompts, memory, routing, or policy

Effective permission is the combination of asset behavior, harness policy, runtime identity, and environment. The registry should point to the policy that grants capability rather than storing secrets or implying that metadata itself enforces access.

When capability changes, prior approval may no longer apply even if the asset version number was not updated correctly. Capability diffs should be visible during review.

## Dependencies And Relationships

Assets rarely stand alone. The registry should represent relationships such as:

- skill uses tool
- agent uses skill
- workflow invokes agent and evaluator
- extension listens to runtime event
- context source is retrieved by tool
- evaluation suite qualifies workflow version
- policy restricts tool or workflow
- asset supersedes or deprecates another asset

Relationship visibility supports impact analysis. A tool-schema change can invalidate several skills and workflows; a model update can invalidate evaluation evidence; retiring a context source can weaken an agent handoff.

Do not infer critical dependencies only from names or semantic similarity. Prefer declared relationships, package manifests, runtime traces, and source inspection.

## Skills, Plugins, And The Claude Code Marketplace

Treat a skill and its distribution wrapper as separate concepts. The skill is the governed behavior: its trigger, instructions, supporting assets, dependencies, evaluation, owner, and lifecycle. A plugin is the installable container through which Claude Code can distribute that behavior across projects and users.

Claude Code marketplaces catalogue plugins. A standalone skill can be used from a local `.claude/skills/` location, but it cannot be listed directly as an installable marketplace entry. To publish one skill through a marketplace, place it in a one-skill plugin. This keeps the registry skill-centric without forcing unrelated skills into broad bundles.

```text
plugins/
└── quality-review/
    ├── .claude-plugin/
    │   └── plugin.json
    └── skills/
        └── review/
            └── SKILL.md
```

The marketplace entry points to the plugin:

```json
{
  "name": "quality-review",
  "source": "./plugins/quality-review"
}
```

Use a one-skill plugin as the default when the skill has an independent purpose, audience, owner, or lifecycle. Bundle several skills in one plugin only when they form a coherent capability and are normally installed, versioned, evaluated, and removed together. A broad process label such as `execution` is insufficient justification for a bundle; inspect the actual skill outcomes and separate software-development, project-management, and cloud-operational capabilities when their users, permissions, risks, or release cycles differ.

An external system used by a skill does not automatically require its own plugin. When Jira, a cloud API, or another MCP capability is already provided by the company platform, the skill should declare and use that dependency. Create a separate integration plugin only when the connection, authentication configuration, tools, or shared integration behavior must itself be installed and maintained as a package.

For a governed company marketplace, retain a plugin manifest even where Claude Code can discover conventionally located components without one. The manifest gives the registry an explicit identity, version, description, and package boundary. Keep the plugin self-contained because Claude Code copies marketplace plugins into a local cache and installed plugins cannot rely on files outside their plugin directory.

The authoritative Claude Code structures and marketplace contract are documented in [Create plugins](https://code.claude.com/docs/en/plugins) and [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces).

## Distribution And Activation

The source registry and distribution mechanism may be separate. Git submodules, packages, plugin marketplaces, symlinks, installer scripts, remote catalogs, and managed platforms can all expose assets to a harness.

Distribution should preserve version, provenance, and integrity. Activation should verify compatibility and policy at the destination. A central registry must not silently overwrite repository-owned instructions or activate an asset globally because one team approved it locally.

Teams may use a curated default set plus experimental lanes. Defaults reduce fragmentation; experimental lanes allow comparison and learning. Both need observable versions and a path to promotion or removal.

## Ownership And Maintenance

Every active asset needs an owner with authority and capability to maintain it. Ownership includes:

- responding to failures and security issues
- reviewing dependency and capability changes
- maintaining task and compatibility boundaries
- keeping evaluation evidence current
- resolving overlap with other assets
- communicating deprecation
- removing or transferring orphaned assets

A catalogue with many orphaned assets creates false confidence because discoverability outlives maintenance. The registry should surface missing owners, stale evaluations, failed source synchronization, deprecated dependencies, and assets with no observed use.

Usage does not prove value, but absence of usage is a useful review signal. High usage increases the consequence of change and strengthens the case for retained regression coverage.

## Federated Registry Model

One central team should not have to author every asset. A federated model keeps source and domain ownership close to the team that understands the work while applying common metadata, provenance, permission, and evaluation requirements.

The central platform may provide schema validation, search, compatibility checks, policy enforcement, evaluation infrastructure, usage telemetry, and lifecycle reporting. Domain teams own purpose, behavior, source quality, and task-specific acceptance.

Prefer source-controlled descriptors harvested into a central view before building a separate write-only portal. This preserves normal review workflows and reduces divergence between registry metadata and the package it describes.

## Registry Metrics

Measure registry health and asset outcomes, not catalogue growth:

- active assets with owners, source provenance, and current evaluation
- intended and false activations by task family
- accepted outcomes and human correction for asset-assisted runs
- dependencies and consumers affected by changes
- assets with stale evaluations or incompatible dependencies
- time to identify and revoke a harmful version
- deprecated assets with remaining consumers
- duplicate or overlapping assets consolidated
- orphaned and unused assets retired
- security or permission incidents involving registered assets

The number of registered skills, agents, or workflows is not a success metric. A smaller registry with clear boundaries and maintained evidence can provide more value than a large marketplace of plausible instructions.

## Minimal Adoption Path

1. **Source inventory:** list maintained assets, source locations, and owners.
2. **Common metadata:** add type, purpose, lifecycle, dependencies, permissions, and compatibility.
3. **Validated discovery:** test routing and expose only relevant approved candidates.
4. **Evidence linkage:** connect versions to evaluation results and approval scope.
5. **Lifecycle controls:** add deprecation, revocation, impact analysis, and retirement.
6. **Federated scale:** harvest team-owned descriptors into a shared searchable view with policy checks.

Do not start with a new platform when a source-controlled index and validator can answer the current need. Add registry infrastructure when discovery, cross-team dependency, policy, or lifecycle scale demonstrates the requirement.

## Anti-Patterns

### Catalogue Growth As Success

More assets increase routing ambiguity, maintenance, attack surface, and context cost. Optimize for useful maintained assets.

### Registration As Approval

An asset can be discoverable for review without being authorized for activation or side effects.

### Mutable Latest Without Resolution History

Aliases are convenient, but every execution and approval needs the concrete resolved version.

### Metadata Without Source Inspection

A description cannot reveal hidden references, scripts, dependencies, or capabilities. Review the complete package.

### One Global Approval

Approval for one repository, data class, model, or read-only workflow does not authorize every environment.

### Permanent Experimental Assets

Candidates that are never evaluated, promoted, or removed create an untrusted shadow registry.

### Centralizing Ownership

A platform team can operate the registry but cannot maintain domain behavior it does not understand.

### Automatic Asset Creation

An agent-generated skill or workflow is a candidate proposal. It requires provenance, admission, evaluation, ownership, and approval.

## Relationship To Other Documents

- `agent-workflow-evaluation.md` defines the evidence required to evaluate and approve assets and workflows.
- `agent-context-systems.md` defines context-source, memory, and durable-adaptation trust.
- `ai-harness-engineering.md` defines the harness mechanisms registered assets participate in.
- `governed-agentic-development.md` defines a governed workflow that consumes skills, agents, tools, context, and evaluations.
- `ai-native-engineering-phases.md` describes shared registry adoption as an organizational capability.
- `../guidelines/skill-guideline.md` and `../guidelines/agent-guideline.md` define asset-specific admission and structure.

## Current Evidence Basis

The lightweight registry pattern was informed by Owain Lewis's [7 Codex Skills I Can't Live Without](https://www.youtube.com/watch?v=L_X2TEqRmR0), [Pi Coding Agent](https://www.youtube.com/watch?v=BZ0w0JhPQ9o), [Agent Loops: Complete Guide](https://www.youtube.com/watch?v=RVEaDvh6f5A), and [Agentic Software Factory](https://www.youtube.com/watch?v=AbpyqAfxZ8c). These show centralized, version-controlled skills and workflows reused across agent harnesses, but not an enterprise registry implementation.

The ownership and source-controlled catalog model was informed by the [Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/). Version, lineage, annotation, and alias concepts were informed by the [MLflow Model Registry](https://www.mlflow.org/docs/latest/ml/model-registry/workflow/). Artifact traceability was informed by the [SLSA provenance specification](https://slsa.dev/spec/v1.2/provenance). These systems cover software or model artifacts rather than the complete AI asset taxonomy proposed here; the broader registry model is a synthesis that requires organization-specific validation.

## Summary

An AI asset registry should connect reusable behavior to source, ownership, provenance, compatibility, permissions, evaluation, approval scope, consumers, and lifecycle. It should help teams find the right maintained asset while preventing registration or popularity from being mistaken for trust.

The registry creates value when it reduces reinvention and unsafe ambiguity. It becomes harmful when it rewards accumulation, hides mutable versions, centralizes ownership away from domain experts, or advertises capabilities without evidence and boundaries.

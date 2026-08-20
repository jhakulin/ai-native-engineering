# Agent Context Systems

## Purpose

This document explains how to design the context system around an AI agent: how information is selected, authorized, assembled, used, persisted, corrected, and evaluated.

Context is not merely text placed into a prompt. It is a governed projection of product intent, repository state, task history, retrieved evidence, tool observations, and prior learning. A good context system gives an agent enough trustworthy information to perform a bounded task while keeping sources, uncertainty, permissions, and freshness visible. A poor context system can make a capable model confidently wrong, leak information, preserve stale assumptions, or degrade over time as derived memory accumulates.

This is a strategy document, not a configuration guide for a particular vector database, model provider, coding agent, or retrieval framework.

## Scope

The document covers:

- categories of agent context and their trust characteristics
- task-specific context assembly
- retrieval-mode selection
- provenance, versioning, freshness, and uncertainty
- authorization and sensitive-data boundaries
- working state, checkpoints, and handoffs
- persistent memory and durable adaptation
- context-system evaluation and governance

It does not define the underlying product requirements, repository architecture, or business decisions that context represents. Those remain owned by their authoritative sources and accountable humans.

## Core Model

An agent context system connects authoritative sources to one bounded execution and controls what, if anything, persists afterward:

```text
authoritative and maintained sources
                 |
                 v
       retrieval and filtering
                 |
                 v
      task-context compilation
                 |
                 v
     working execution context
                 |
                 v
   observations and proposed learning
                 |
                 v
review, reject, retain, expire, correct, or delete
```

The system has four responsibilities:

1. **Selection:** choose information relevant to the current question without flooding the execution with every available source.
2. **Trust:** preserve where information came from, what it represents, and whether it is authoritative, maintained, retrieved, observed, or inferred.
3. **Access:** ensure the requesting user and agent workflow are authorized to receive the information before it enters model context.
4. **Lifecycle:** distinguish temporary working state from durable memory and provide correction, supersession, expiry, and deletion.

These responsibilities belong partly in deterministic infrastructure. A prompt can tell an agent to prefer fresh sources, but it cannot reliably enforce source authorization, index coverage, expiry, or isolation between users and projects.

## Context Categories

Calling every input “context” hides important differences. The following categories have different owners and trust properties:

| Context category | Examples | Primary trust question |
| --- | --- | --- |
| Authoritative source | Code, schemas, configuration, contracts, source-system records | Which version or state is authoritative for this decision? |
| Maintained guidance | Repository instructions, current specifications, architecture decisions, policies | Who owns it, and is it still current? |
| Task contract | Outcome, constraints, non-goals, acceptance criteria, expected evidence | Was it approved, and is it sufficient for the delegated work? |
| Retrieved context | Search results, document chunks, graph slices, query results | Why was it selected, and what relevant evidence may be missing? |
| Working state | Plan, tool results, current diff, checkpoints, intermediate artifacts | Which execution produced it, and is it still valid against the current baseline? |
| Observed feedback | Tests, logs, review findings, runtime signals, user feedback | Does the observation support the claimed conclusion? |
| Inferred memory | Model summaries, extracted facts, preferences, learned associations | What source and reasoning produced it, and when does it expire? |
| Durable adaptation | Skills, prompts, routing rules, constraints, evaluators | Was the change reviewed and shown to improve representative outcomes? |

Authority does not imply timelessness. Source code can change, configuration can differ by environment, and an approved specification can be superseded. Trust therefore depends on identity, version, scope, and time as well as source type.

Derived context is not automatically unreliable, but it must not silently acquire the authority of its inputs. A model summary of a design decision is a summary, not the decision record. A repository graph is a projection of source state, not the source. A preference inferred from a conversation is not a permanent user policy.

## Authority And Trust Boundaries

Every consequential question should have an authority map: which source owns current behavior, intended behavior, configuration, domain definitions, permissions, and accepted technical decisions. The context system routes an agent to those sources; it does not replace them with an independent narrative.

When sources disagree, the system should preserve the contradiction and identify the competing authorities. Silent conflict resolution is dangerous because the agent may select the most fluent or recently retrieved statement rather than the source that legitimately owns the decision.

Trust should be represented at the claim level when possible. One retrieved document may contain authoritative identifiers, historical commentary, and an outdated implementation example. Treating the whole document as uniformly trusted hides those distinctions. For high-consequence workflows, an important claim should link to the source passage, record, test, configuration, or runtime observation that supports it.

## Task-Context Compilation

Context assembly should be an inspectable build step. The objective is the smallest coherent package that lets the agent understand the task, act within its authority, and produce the required evidence.

A typical package combines:

```text
approved task contract
  + repository or workspace entry point
  + relevant authoritative sources
  + accepted design decisions
  + current task artifacts and baseline
  + permitted tools and boundaries
  + verification expectations
  = bounded execution context
```

The package should retain source references rather than copying large bodies of material without identity. It should also disclose important exclusions: unsupported languages, inaccessible systems, stale indexes, missing permissions, unresolved contradictions, or source areas not inspected.

More context is not automatically better. Irrelevant rules compete with task-specific information, stale examples steer the model toward obsolete behavior, and multiple versions of the same fact create ambiguity. Large context also increases cost and can make review harder because a human cannot easily reconstruct which information influenced the result.

Too little context has a different failure mode. A narrow source slice may omit an affected contract, dependent component, or non-obvious constraint. Context minimization therefore needs a completeness criterion tied to the task, not a token target. The package is sufficient when it covers the task contract, likely impact boundary, required authority, and expected verification—or makes the remaining uncertainty explicit.

## Retrieval Strategy

Retrieval should match the structure of the question and the source material. No single retrieval mode is best for every task.

| Question or source shape | Suitable starting mode | Main limitation |
| --- | --- | --- |
| Small authoritative document, checklist, or contract | Full-document loading | Context cost and version ambiguity as the document grows |
| Known identifier, error text, symbol, or exact phrase | Exact or lexical search | Misses conceptual matches that use different vocabulary |
| Conceptual discovery across unstructured text | Semantic or vector retrieval | Similarity does not prove relevance, authority, or relationship |
| Mixed names and concepts in a document collection | Hybrid lexical and semantic retrieval | Ranking and fusion behavior require evaluation |
| Numeric, categorical, relational, or transactional data | Structured query or parameterized tool | Schema interpretation and query authorization remain necessary |
| Callers, dependencies, ownership, or multi-hop repository relationships | Structural graph traversal | Graph coverage, extraction accuracy, and freshness constrain the answer |
| Question requiring several heterogeneous sources | Agent-selected tools over bounded interfaces | Higher latency, cost, non-determinism, and authorization complexity |

### Full-Document Context

Loading a complete document is appropriate when it is small, authoritative, internally coherent, and directly relevant. Runbooks, short contracts, checklists, and focused specifications can be more reliable as complete context than as disconnected chunks.

The method becomes weaker when several versions exist, the document contains unrelated sections, or the source is large enough to obscure the relevant rule. The system should still identify the document version and authority rather than treating uploaded text as timeless truth.

### Exact And Lexical Retrieval

Exact search is strong for names, paths, identifiers, error messages, commands, configuration keys, and domain terminology. It is inexpensive, explainable, and often the correct first step in repository work.

Lexical retrieval can miss relevant material when the query and source use different terms. Aliases, controlled vocabularies, stemming, and a maintained authority map can improve recall without immediately requiring semantic infrastructure.

### Semantic And Vector Retrieval

Semantic retrieval supports discovery when the user knows the concept but not the source vocabulary. It can find related requirements, prior discussions, or documentation that exact search would miss.

Similarity is a candidate-generation signal, not evidence that two concepts are equivalent or causally related. Vector retrieval is also weak for exact numeric filters, permission logic, current state, and explicit graph relationships. Important claims found semantically should be verified against the selected source and, where relevant, code, tests, configuration, or a structured system of record.

### Hybrid Retrieval

Hybrid retrieval combines lexical precision with semantic recall. It is a useful default for heterogeneous document collections when both known terms and conceptual matches matter.

Its ranking behavior still needs representative evaluation. Combining two retrieval methods can combine their false positives as easily as their strengths. The system should preserve which method selected an item and why it was ranked highly enough to enter the context package.

### Structured Retrieval

Structured queries are appropriate for numeric thresholds, dates, statuses, ownership, counts, and relationships already represented in a database or API. Parameterized query tools expose a bounded contract and are generally easier to authorize and test than unrestricted model-generated SQL.

Dynamic query generation may be useful for internal analysis, but it expands the action and data-access surface. Read-only credentials, schema scoping, query limits, sensitive-column policy, timeouts, and result-size limits belong outside the model. A syntactically valid query can still answer the wrong business question.

### Graph Retrieval

Graph traversal is useful when the question is explicitly relational: what calls this symbol, which components depend on this service, which tests cover this path, or how a customer capability maps to implementation and ownership.

A graph should report its source state, extraction method, coverage, relation type, and freshness. Semantic similarity may propose nodes or relationships for investigation, but inferred links should not become authoritative structural edges without verification. Detailed repository-graph guidance is provided in `repository-knowledge-graphs.md`.

### Agentic Multi-Tool Retrieval

An agent can choose among search, document, database, graph, and external-source tools when the correct path depends on discoveries made during the task. This is useful for open-ended investigation but adds latency, cost, inconsistent coverage, and more complex permissions.

The agent should choose among bounded tools rather than receive unrestricted access to every source. Tool results should expose provenance and limitations in a consistent shape so the final answer can distinguish retrieved evidence from agent inference.

## Chunking, Metadata, And Ranking

Chunking changes what a retrieval system can find and what evidence an agent can understand. Chunks that are too small lose definitions, exceptions, and cross-paragraph reasoning. Chunks that are too large add irrelevant context and weaken ranking. Overlap can preserve continuity but may create duplicate evidence and distort apparent support.

Chunk boundaries should follow the source structure where possible: sections, records, symbols, decisions, or other meaningful units. Preserve the path back to the complete source and enough neighboring context to interpret the selected passage correctly.

Metadata supports filtering and trust. Useful fields may include source identity, type, owner, version, repository commit, environment, product area, creation and update time, effective period, sensitivity, access groups, and supersession status. Metadata is part of the retrieval contract and requires the same quality controls as the content itself.

Ranking should optimize for supported task outcomes, not generic similarity scores. A highly similar obsolete document should rank below a current authoritative source. A result that the requester cannot access should not enter the candidate set at all.

## Provenance, Versioning, And Freshness

Consequential context should preserve enough provenance for a reviewer to answer:

- What source produced this item?
- Which source version, repository commit, record state, or environment does it represent?
- When was it extracted or retrieved?
- Which method selected or transformed it?
- Is it authoritative, maintained, retrieved, observed, summarized, or inferred?
- What coverage or uncertainty limits the claim?
- Has it been superseded, expired, or contradicted?

Freshness is domain-specific. A stable architecture decision may remain valid for years, while deployment state, permissions, incidents, prices, or task status may change in minutes. The context system should attach freshness policy to the source type rather than apply one universal expiry period.

When freshness cannot be established, mark the context stale or unknown and reduce the authority of decisions based on it. Re-fetching a source is not enough when the index or projection failed to include recent changes; extraction coverage and update success also matter.

## Authorization And Sensitive Context

Authorization must be enforced before protected information enters model context. Removing sensitive details from the final answer is insufficient if the model already received data the requester or workflow was not allowed to access.

A context system may need both index-time and retrieval-time controls. Index-time metadata prevents obviously ineligible records from becoming candidates. Retrieval-time validation checks the requester's current access against the source system or an authoritative short-lived permission cache. This matters when group membership, ticket access, document sharing, or employment state can change after indexing.

The effective principal should remain visible. A human user, scheduled workflow, repository agent, and shared service identity may have different permissions even when they use the same retrieval index. Do not pool personal memory, project context, or retrieved results across principals merely because it improves cache efficiency.

Minimize sensitive context. Retrieve the fields and passages needed for the task, not complete mailboxes, customer histories, or document stores by default. Logs should preserve evidence about access and decisions without unnecessarily copying protected content into another long-lived system.

Prompt injection is also a context risk. Tickets, documents, web pages, comments, dependencies, and retrieved passages can contain instructions that conflict with the workflow. The system should distinguish source content from governing instructions and prevent retrieved material from changing permissions or policy.

## Working State And Checkpoints

Working state includes the current plan, tool observations, intermediate artifacts, diff, verification results, and unresolved questions. It supports continuation within one task but should not automatically become permanent memory.

Long-running or resumable workflows need checkpoints that preserve the task contract, trusted baseline, completed actions, current artifacts, verification evidence, remaining work, and escalation state. A conversational summary alone may omit the exact condition needed to resume safely.

Checkpoints should be invalidated or reconciled when the repository baseline, task contract, source permissions, or relevant external state changes. Resuming from stale working state can be more dangerous than starting with fresh context because the workflow appears informed while relying on invalid assumptions.

Compaction should discard redundant dialogue and low-value observations without losing accepted decisions, source identity, constraints, evidence, and open uncertainty. The quality of a checkpoint is measured by correct resumption, not by how much text it saves.

## Context Handoffs

A handoff to another agent or fresh context should be treated as a compiled interface. It needs the goal, scope, constraints, relevant sources, current artifacts, accepted decisions, verification expectations, and unresolved questions required by the receiving role.

Different roles need different slices. An implementer may need local architecture and target files; a reviewer needs the task contract, diff, affected boundaries, repository-specific risks, and evidence; a coordinator needs task state, dependencies, budgets, and escalation information. Copying the implementer's entire conversation into the reviewer context weakens independence without guaranteeing completeness.

Handoff quality should be evaluated by what the receiving role misses, not by whether the summary sounds comprehensive. Fresh context is useful only when the interface preserves the information needed for a correct decision.

## Persistent Memory

Persistent memory is information derived from prior interactions or executions and made available to future work. It can improve continuity, but it also creates a long-lived steering surface whose errors may affect every later task.

A safe memory lifecycle is:

```text
observation
   -> candidate memory
   -> source, scope, and sensitivity review
   -> retain, reject, or request confirmation
   -> use with visible provenance and freshness
   -> validate, correct, supersede, expire, or delete
```

### Memory Admission

An observation should become durable only when future value justifies persistence and the system can state what the memory means. Useful candidates include an explicit user preference, an accepted project decision, a stable alias, or a repeated workflow constraint not already owned by a better source.

Casual statements, task-local paths, temporary technology choices, model guesses, and one-time corrections are weak candidates. The system should not convert “I often use this stack” into “this is the current stack for every project,” or turn one successful workaround into permanent policy.

Where appropriate, a memory record should include source, subject, scope, confidence, creation time, last validation, expiry or review condition, sensitivity, owner, and supersession link. Explicit user statements and accepted source-system facts should remain distinguishable from model inference.

### Correction And Forgetting

Memory requires correction and deletion, not only accumulation. Users and owners need a way to inspect what is stored, challenge its source, narrow its scope, replace it, or remove it. Superseded memory should stop influencing new tasks even when retained for audit history.

Expiry should follow the expected stability of the fact. Current priorities and project tooling may need frequent validation; a durable writing preference may change rarely. When the system cannot determine whether a memory remains current, it should ask, revalidate against an authority, or omit the memory rather than present it as fact.

### Memory Isolation

Memory should be partitioned by the subject and authority it represents. Personal preferences should not become organization policy. One repository's convention should not silently affect another repository. Customer-specific context should not cross tenant boundaries. The retrieval key must represent the correct user, project, workflow, and conversation scope rather than a convenient global namespace.

## From Observation To Durable Adaptation

Skills, prompts, repository instructions, routing rules, constraints, and evaluators are more consequential than ordinary memory because they change how future tasks execute. They are harness modifications, not passive notes.

Automatic skill or rule generation should therefore produce an untrusted proposal. Before promotion, determine whether the source episode represents a recurring need, remove task-specific assumptions, select the correct mechanism, test routing and execution against a baseline, inspect permission implications, and assign an owner.

A repeated failure may justify a regression test, CI check, linter, monitor, documented constraint, architecture decision, permission gate, or skill. The right response depends on the layer that allowed the failure. Encoding every mistake as prompt text produces a growing and contradictory context system.

Adaptive workflows need a retained regression set. Evaluate changes to memory selection, prompts, retrieval, tools, or routing on representative new and retained tasks, and inspect cost, latency, false retrieval, and human intervention alongside task success. A change that solves the latest failure by weakening previously reliable behavior is not an improvement.

Detailed skill admission and retirement guidance is provided in `../guidelines/skill-guideline.md`. General harness improvement guidance is provided in `ai-harness-engineering.md`.

## Context-System Evaluation

Evaluate context by its contribution to supported task outcomes, not by context size or retrieval activity alone.

The broader method for evaluation contracts, suite design, graders, trials, baselines, and release decisions is defined in `agent-workflow-evaluation.md`. This section identifies the context-specific dimensions that those evaluations should include.

Useful measures include:

- relevant authoritative evidence retrieved and missed
- stale, contradictory, unsupported, or irrelevant context included
- claims correctly linked to their sources
- authorization violations and excessive sensitive-data retrieval
- task success with and without the context mechanism
- human corrections attributable to missing or misleading context
- context size, retrieval latency, model latency, and cost
- correct resumption from checkpoints
- memory corrections, expirations, and deletions
- regressions caused by added memory or durable adaptations
- reviewer ability to reconstruct what the agent saw

Evaluation cases should represent the real questions, repositories, permissions, terminology, and failure modes the system will encounter. Include negative cases where the correct behavior is to return unknown, request clarification, reject an unauthorized source, or identify contradictory evidence.

Retrieval evaluation and generation evaluation should remain distinguishable. A good answer can occasionally be produced from poor retrieval through model prior knowledge, while excellent retrieved evidence can still be synthesized incorrectly. Measure whether the system found the necessary context and whether the agent used it correctly.

Re-evaluate when source structure, chunking, metadata, embeddings, ranking, authorization logic, model, prompt, tool, or context budget changes. Context infrastructure is part of the harness version.

## Governance And Ownership

Every shared context system needs owners for source authority, ingestion and extraction, retrieval behavior, permissions, memory policy, evaluation, and incident handling. One platform team may operate the infrastructure, but domain owners still decide which sources legitimately define product behavior, architecture, policy, and terminology.

The system should expose which sources are indexed, their freshness, unsupported formats, failed updates, permission behavior, and known retrieval limits. Hidden partial coverage encourages agents and users to treat an incomplete index as a complete knowledge base.

Context retention should have a purpose and lifecycle. Store working state, retrieval logs, and memory only as long as their review, recovery, audit, or personalization value justifies the security and maintenance cost. New data collection should not be justified solely by the possibility that an agent may find it useful later.

## Maturity Path

A practical progression is:

1. **Explicit context:** repository entry points, concise task contracts, and authoritative source links are provided manually.
2. **Routed context:** exact search, maintained indexes, and bounded tools help agents locate relevant sources with provenance.
3. **Evaluated retrieval:** hybrid, structured, or graph retrieval is introduced for demonstrated question types and measured against a source-first baseline.
4. **Governed working state:** long-running workflows use versioned checkpoints, explicit handoffs, and source-aware compaction.
5. **Controlled memory:** selected facts or preferences persist with provenance, scope, correction, expiry, isolation, and evaluation.
6. **Evaluated adaptation:** proposed skills, routing, or context changes are tested on retained tasks before approval.

Not every workflow needs to reach the later stages. Stable task-local context is often more reliable and economical than a general memory system.

## Anti-Patterns

### Context Dumping

Loading every instruction, document, and prior conversation increases ambiguity and cost while making influence difficult to inspect. Route the smallest coherent context package tied to the task.

### Treating Retrieval As Proof

A semantically similar passage or graph neighbor is a candidate source, not confirmation that the claim is correct. Verify important relationships and behavior against authoritative sources.

### One Global Memory

Pooling users, projects, repositories, or customers into one memory surface causes incorrect steering and can violate authorization boundaries.

### Memory Without Forgetting

An append-only collection of inferred facts becomes stale and contradictory. Durable memory needs validation, correction, supersession, expiry, and deletion.

### Automatic Skill Creation

Turning every successful task into an active skill preserves incidental behavior and increases routing noise. Generated skills are proposals that require admission and evaluation.

### Authorization After Generation

Redacting the answer does not undo unauthorized disclosure to the model. Filter and validate access before retrieval results enter context.

### Optimizing Only For Tokens

Smaller context is not better when it omits a relevant contract, dependency, or risk. Evaluate supported outcomes, misses, false inclusions, and human correction alongside cost.

### Invisible Context Infrastructure

If users cannot see source coverage, versions, retrieval mode, freshness, or uncertainty, they cannot judge when the context system should be trusted or challenged.

## Relationship To Other Strategy Documents

This document owns the general lifecycle of context from source selection through working state, memory, and durable adaptation.

- `ai-harness-engineering.md` describes the broader harness, tool, permission, control-loop, and improvement system in which context operates.
- `repository-knowledge-graphs.md` describes a specialized structural context source for repository relationships.
- `product-engineering-context-platform.md` proposes an organization-specific platform for permission-aware product and engineering context.
- `governed-agentic-development.md` describes how compiled context is used by bounded development workers and reviewers.
- `ai-assisted-code-quality-control.md` defines the evidence and review responsibilities that context must support.
- `../guidelines/ai-documentation-guideline.md` defines which maintained documentation deserves to exist and how it relates to authoritative sources.
- `../guidelines/skill-guideline.md` defines admission, evaluation, and retirement for skills as durable adaptations.

## Current Evidence Basis

The retrieval model was informed by [RAG for AI Agents, Explained Simply](https://www.youtube.com/watch?v=29PzjQ6myMU), which compares full-document, lexical, vector, hybrid, SQL, and agent-selected retrieval, and [RAG Agents Made Easy With Gemini File Search](https://www.youtube.com/watch?v=hK7CH4IffJU), which demonstrates managed document retrieval, metadata filtering, citations, and retrieved-chunk inspection.

The memory model was informed by [I Replaced Hermes Agent And OpenClaw With This](https://www.youtube.com/watch?v=lmmgzIuWEbk), which shows stale and incorrectly generalized automatic memory and noisy self-generated skills. Context packaging and handoff ideas were also informed by [The Simplest Way to Build AI Agents](https://www.youtube.com/watch?v=ySuc7vSmPNk), [How I Use OpenAI Codex](https://www.youtube.com/watch?v=DLSK4wLK544), and [Claude Code's New Subagent Feature](https://www.youtube.com/watch?v=ZdXsRn9w0VE).

These videos are practitioner demonstrations rather than controlled research. Claims about retrieval quality, memory improvement, token reduction, and model portability should be tested on representative tasks with known sources, permissions, and failure cases. The authorization, provenance, and evaluation requirements in this document are conservative deductions from the demonstrated architectures and observed failure modes.

## Summary

An agent context system should deliver the smallest coherent, authorized, source-aware context package needed for a task and make its limitations visible. It should distinguish authority from retrieval, temporary working state from durable memory, and observed learning from approved adaptation.

The system becomes trustworthy not when it remembers everything, but when it can explain what it used, respect who may see it, detect when it is stale or incomplete, and correct or forget what should no longer influence future work.

# Minimal AI Documentation Guideline

Keep repository documentation minimal. Retain it only when it preserves necessary, durable information that code, tests, schemas, generated references, or configuration cannot represent more reliably, or when it guides contributors and AI agents to those sources.

## Core Principles

1. **Document only what is necessary.** Every document must justify its creation and continued existence.
2. **Prefer code and automation over prose.** Use code, tests, types, schemas, configuration, and generated references when they express the information reliably.
3. **Keep one authority for each kind of information.** Reference that source instead of maintaining copies.
4. **Make information discoverable.** Documentation must guide readers to relevant sources and explain when to use them.
5. **Keep documentation current.** Remove, merge, archive, or supersede it when its purpose or status changes.
6. **Treat contradictions as defects.** Do not silently choose between conflicting documentation, code, tests, schemas, or configuration.

## Documentation Admission Test

Before creating or retaining a document, ask:

1. What necessary information would be lost without it?
2. Can code, tests, schemas, configuration, or generated output express it more reliably?
3. Is it durable enough to maintain, and does another artifact already own it?
4. Is it required for navigation, operations, compliance, certification, or traceability?
5. Where are its related authoritative sources, and who or what keeps it current?
6. When should it be removed, merged, archived, or superseded?

Do not create or retain a document that cannot pass this test. Improve an existing document before adding another one.

## Minimum Repository Documentation

Every maintained software repository must document the information needed to understand its purpose, find authoritative sources, establish the development environment, use supported workflows, and make changes safely.

| Required information | What to document |
| --- | --- |
| Purpose and scope | What the software does, who or what uses it, and important boundaries |
| Source navigation | Where code, tests, schemas, configuration, generated artifacts, and repository instructions live |
| Authority map | Which sources own implementation, behavior, configuration, domain definitions, and technical decisions |
| Development workflow | How to install dependencies, build, run, test, lint, validate, and perform other required checks |
| Prerequisites | Required runtimes, tools, services, environment variables, and setup assumptions, without secrets |
| Change requirements | Checks, conventions, approvals, or generation steps required for changes |
| Non-obvious constraints | Necessary security, compatibility, architectural, regulatory, or operational constraints not enforced by code or automated checks |
| Additional knowledge | Where relevant specifications, decisions, glossaries, runbooks, or generated references live and when to read them |

Document only what applies. Point to scripts, manifests, code, tests, schemas, and configuration instead of copying their contents.

## Authority and Navigation

Every maintained repository must have one documentation entry point, such as its `README`, repository instructions, or a small index. It must provide a clear path to the minimum repository information without requiring prior knowledge.

Each document must:

- State its purpose and what information it owns, if any.
- Link directly to relevant authoritative sources.
- State whether it is current, generated, historical, or superseded.
- Avoid copying information from the sources it references.

Navigation documentation should identify, where applicable:

- Main application or library entry points.
- Major components and their responsibilities.
- Public interfaces and their implementation locations.
- Where tests live and how they map to code or behavior.
- Where schemas, configuration, and generated files originate.
- Supported commands for building, running, testing, and validation.
- Links from specifications and decisions to relevant code and automated checks.

Describe stable boundaries and navigation paths, not every file. Prefer links and repository conventions that remain valid as implementation details change. Give agents enough direction to find relevant information without loading the entire repository or documentation set.

Prefer information in this order:

1. Code, tests, types, schemas, and configuration.
2. References generated from those sources.
3. Concise documentation that links to those sources.
4. Manually maintained prose when no more reliable representation exists.

When sources disagree, identify which one owns the disputed information, correct it if necessary, and update or regenerate its dependents. Record a decision only when its context and rationale will remain useful.

## Code and Project Structure

Code should explain its behavior and structure through clear naming, cohesive modules, explicit interfaces, and understandable boundaries. Use documentation only for necessary information the code cannot express clearly.

Code and project files can replace prose only when contributors and AI agents can navigate and interpret them reliably. Repositories should:

- Use clear names and cohesive modules.
- Organize files around understandable responsibilities and boundaries.
- Separate public interfaces from implementation details when it improves discoverability.
- Make relationships among code, tests, schemas, and configuration easy to find.
- Provide concise navigation when a necessary source is not otherwise discoverable.

Do not remove necessary documentation because information exists somewhere in a poorly organized codebase. Improve the code and project structure first, or retain guidance until the information is discoverable.

## Additional Documentation

Add or retain these artifacts only when they pass the documentation admission test:

| Artifact | Keep only when |
| --- | --- |
| Product or feature specification | Durable intended behavior cannot be reconstructed safely from code, tests, schemas, or configuration |
| Architecture overview | Necessary system boundaries are not apparent from repository structure and interfaces |
| Architecture decision record | A consequential decision and its context must be preserved |
| Glossary | Domain terms are ambiguous, specialized, or used differently from their ordinary meanings |
| Runbook | Operation, incident response, or recovery requires a reliable procedure |
| Generated reference | People or agents need a readable view of machine-owned information |

After implementing a specification, retain only requirements that remain necessary. Merge them into a smaller current-state specification, archive them when traceability is required, or delete them when code and automated checks preserve all necessary information.

Keep architecture decision records concise and append-only. Include status, context, decision, consequences, and supersession links. Link specifications and decisions to the code or automated checks that enforce them when practical.

Do not retain completed task lists, implementation plans, agent reasoning, chat transcripts, scratch notes, file-by-file instructions, or routine debugging history by default. Preserve experiments and rejected alternatives only when repeating them would be materially costly, dangerous, or likely.

## Code Comments

Use comments only for necessary information that is not apparent from the code, such as:

- Non-obvious correctness, safety, compatibility, or performance constraints.
- Reasons an apparently simpler approach is invalid.
- Assumptions that code or automated checks cannot enforce.
- References to authoritative decisions or external standards.

Do not use comments to restate code, compensate for unclear naming, duplicate requirements, or preserve narratives that will drift.

## AI Agent Rules

An AI agent should:

1. Start from the repository's documentation entry point and follow links to relevant sources.
2. Inspect code, tests, schemas, and configuration before accepting claims about current behavior.
3. Load only the information needed for the task.
4. Create documentation only when it passes the admission test, and reference existing sources instead of copying them.
5. Report contradictions instead of resolving them silently.
6. Update, regenerate, merge, archive, supersede, or remove documentation when its status changes, and report how the result was verified.

## Exceptions

Regulated or certification-intensive projects may require formal designs, controlled versions, approvals, risk records, and traceability. Keep what the governing process requires, make authority and status explicit, and automate consistency checks where permitted.

## Anti-Patterns

- Creating a standard document set without proving each document is necessary.
- Restating code, tests, schemas, or configuration in prose.
- Letting multiple artifacts claim authority over the same information.
- Using a large agent context file instead of clear repository structure and navigation.
- Keeping transient plans, prompts, agent notes, or obsolete documents indefinitely.
- Maintaining decisions without statuses or supersession links.
- Copying reference information that could be generated.
- Requiring agents to read every document for every task.

## Verification

Before accepting repository documentation, confirm:

- [ ] The repository has one clear documentation entry point.
- [ ] Applicable minimum repository information is documented and easy to find.
- [ ] Each document passes the admission test and has a clear purpose, authority, status, and lifecycle.
- [ ] Documentation links to authoritative sources instead of copying them.
- [ ] Code and project files are organized so contributors and agents can navigate them reliably.
- [ ] Generated information and automated checks are used where practical.
- [ ] Specifications and decisions link to enforcing code or checks where practical.
- [ ] Links remain valid, and no unresolved contradictions exist.
- [ ] Operational, traceability, approval, and regulatory requirements are preserved.
- [ ] An AI agent can find what it needs without loading unrelated documentation.

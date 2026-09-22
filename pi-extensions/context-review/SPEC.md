# Pi Context Review Extension Spec

## Purpose

Provide a read-only `/context-review` command that makes Pi's effective session context inspectable, provides deterministic `/context-review --stats` measurements without a model call, and supports `/context-review --stats --advise` through Pi's active model.

## Behavior

- Parse the active persisted session with the canonical `skills/context-review/scripts/context-review.mjs` implementation when a session JSONL exists.
- Forward `--stats`, `--json`, `--full`, `--max-chars`, and explicit output controls to their local handling paths without a model turn.
- Keep stats under 100 lines and 8 KB for the representative fixture, with no raw transcript or provider payload.
- Resolve the active leaf, model, and thinking level from Pi runtime APIs; use the persisted active branch only as a fallback.
- Build persisted composition from provider-facing message fields, excluding `excludeFromContext` bash messages, usage, timestamps, custom details, and summary-entry metadata.
- When `before_provider_request` evidence exists, use its exact-observed payload as the composition/contributor scope while retaining reconstructed-message and response-usage metrics separately.
- Before the first persisted session entry, show the current in-memory startup system prompt and loaded context-file/skill metadata, including content when the API provides it.
- Capture the latest provider payload in memory through `before_provider_request` without modifying it.
- Show the reconstructed transcript and exact observed payload in a read-only, scrollable custom TUI viewer.
- Render compaction evidence separately from abandoned-branch summaries.
- Report URL/URI arguments as referenced resources, not local file access, unless persisted evidence proves access.
- Truncate large content by default and support `/context-review --full`.
- Label persisted, reconstructed, exact-observed, and unavailable content separately.
- Distinguish known Pi metadata omitted from provider context from unknown record types.
- For `--stats --advise`, wait for Pi to settle, freeze the deterministic stats object, then give the active model that complete object plus Pi's current active context reconstructed through supported runtime APIs and compaction boundaries.
- Use `ctx.model` and `ctx.modelRegistry` credentials; report advisor usage and limitations separately from inspected-session consumption.
- Send only provider-facing tool name, description, and parameter fields; do not add extension provenance paths.
- Validate advisor structure, evidence, commands, capabilities, reducible scope, and recognizable sensitive output before display, and leave deterministic stats unchanged on advisor failure.

## Boundaries

- Do not use network access for deterministic review or `--stats`; `--advise` may call only the active model through Pi's model registry.
- Do not retrieve abandoned branches, compacted-away raw history, or persisted content outside the current active context for advice.
- Do not write reports or provider payloads automatically.
- Do not claim visibility into payload changes performed by later-loaded extensions.
- Do not duplicate the cross-harness parser inside the Pi extension.

## Verification

- Parser tests pass for synthetic Codex, Claude, and Pi JSONL fixtures.
- Pi loads the extension without registration errors.
- `/context-review` works with a persisted session.
- Standalone and packaged-parser stats match for the same persisted Pi fixture.
- The repository validator passes.

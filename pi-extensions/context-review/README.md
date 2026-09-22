# Pi Context Review Extension

Adds `/context-review` to Pi. `/context-review --stats` runs deterministic local measurement without a model turn. `/context-review --stats --advise` sends the complete stats and Pi's current active context to the active model, then validates advice before display. The existing review mode combines the persisted Pi JSONL session with the latest provider payload observed by the extension.

## Development

Run from this repository so the extension can use the canonical parser in `skills/context-review`:

```bash
pi -e ./pi-extensions/context-review/index.ts
```

Then run:

```text
/context-review --stats
/context-review --stats --json
/context-review --stats --advise
/context-review --stats --advise --json
/context-review
/context-review --full
/context-review --output ./context-review.md
/context-review --output ./context-review.md --force
```

The npm package includes the canonical parser and measurement modules, so installation works outside this checkout. `CONTEXT_REVIEW_SCRIPT` is an optional override for development or a separately maintained parser.

## Understanding The Report

The cross-harness [cause-diagnosis user guide](../../docs/context-efficiency-cause-diagnosis.md#user-guide) lists every supported cause, harness availability, deterministic evidence, advisor use, and limitation. Stats identify measurable mechanisms; `--advise` uses the current active task context to assess whether they were necessary or safely reducible. A supported cause may be absent because the compact report selects at most three representative drivers.

## Privacy

The command does not modify the session or provider payload. By default it is read-only; `--output PATH` writes an explicitly requested report. Existing files are protected unless `--force` is supplied. Stats omit raw transcript, arguments, reasoning, and provider payloads. Invoking `--advise` explicitly consents to the active model analyzing the same active, compaction-aware messages, system prompt, and provider-facing tool definitions available to Pi; it does not add abandoned or compacted-away history. Generated advice passes structural, evidence, command, and recognizable-secret checks, but its privacy guarantee is narrower than deterministic stats because model paraphrases cannot be proven non-sensitive. Advisor usage and cost are reported separately. The existing review mode can contain source code, prompts, tool results, and secrets already present in the session; review it locally and use `--full` only when necessary.

## Limitations

- The provider hook shows the latest payload observed after the extension loaded.
- Extensions loaded later may modify that payload again.
- Historical provider payloads are not reconstructed exactly from JSONL.
- Persisted Pi stats measure provider-facing messages on the live branch and exclude persistence-only metadata and context-excluded bash messages. When the extension has observed a provider request, composition and contributors use that exact-observed payload instead. Changes made by later-loaded extensions remain unavailable and are labelled.

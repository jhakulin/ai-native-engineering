---
name: tighten-doc
description: Use this skill when the user asks to tighten, clean up, de-slop, or make a professional document clearer, more concise, and less repetitive while preserving intent. Mainly user-invoked; do not use for code review, UI copy, legal approval, or strategy redesign unless requested.
---

# Tighten Professional Document

## Overview

Improve a professional document by reducing verbosity, repetition, inflated language, and overreach while preserving the author's intent, scope, and decision logic.

Default to review comments and replacement snippets. Produce a full revised document only when the user explicitly asks for one.

## Workflow

1. Clarify intent only when needed.
   - If the user's goal, audience, or desired edit level is unclear, ask up to three short questions before editing.
   - Ask only questions that materially change the edit, such as audience, tone, or whether the user wants review comments, snippets, or a full rewrite.
   - Do not interview by default. If the document and request give enough context, proceed.
   - Completion criterion: the requested output mode is known, or the default of concise review plus snippets is intentionally chosen.

2. Identify the document's purpose, audience, and requested output.
   - If the user asks for review, provide findings and replacement snippets.
   - If the user asks for a rewrite or revised copy, produce the edited version.
   - If the request is ambiguous, default to concise review plus snippets.
   - Completion criterion: the response plan matches the document purpose, likely audience, and requested or default output mode.

3. Read the document before rewriting.
   - Identify the main message.
   - Identify repeated ideas.
   - Identify sections that explain detail too early.
   - Identify claims that sound stronger than the evidence supports.
   - Identify wording that sounds generic, inflated, or AI-generated.
   - Completion criterion: the main message and highest-impact friction points are known before any rewrite or file edit starts.

4. Name the slop patterns before editing.
   - State the concrete problems being fixed.
   - Scan for repetition, premature detail, inflated language, generic framing, overreach, weak specificity, list bloat, and paraphrase slop.
   - Scan for semantic repetition across the whole document, not just repeated words. Look for the same claim, rationale, process step, example, caveat, or outcome appearing in multiple sections with different wording.
   - Look for repeated claims, detail that appears too early, stronger-than-evidence words, generic business phrasing, unrequested new concepts, overlapping lists, and wording changes that do not improve meaning.
   - Say the named problems directly. Do not rewrite broadly when a targeted edit is enough.
   - Completion criterion: the document has been checked for repeated ideas, premature detail, inflated language, generic framing, overreach, weak specificity, list bloat, paraphrase slop, and wording changes that do not improve meaning; each planned edit is tied to one of these named problems, not only a style preference.

5. Tighten with minimal change.
   - Preserve the author's meaning.
   - Preserve the author's real voice if it carries judgment, credibility, or domain expertise.
   - Remove repetition before changing style.
   - Shorten paragraphs and sentences.
   - Keep early sections high-level.
   - Leave detailed process descriptions in the sections where they belong.
   - Prefer concrete, evidence-based language.
   - Keep source, ownership, and evidence visible.
   - Completion criterion: the revised text is shorter or clearer without changing intent, adding unsupported concepts, or removing important nuance.

6. Check for overreach.
   - Do not introduce new strategy, roles, governance, frameworks, metrics, workflows, decision gates, or operating-model machinery unless the user explicitly asks for them.
   - Do not turn a review request into a redesign request.
   - Do not add structure just because it sounds more complete.
   - Completion criterion: any new wording can be traced to the source document or the user's explicit request.

7. Produce the output in the requested form.
   - For review: list the highest-impact issues and give replacement text.
   - For snippets: show only the revised section or sections.
   - For a full rewrite: provide the revised document or edited file.
   - If editing a file directly, summarize the changed sections and the clarity problems addressed.
   - Keep the response concise.
   - Completion criterion: the final response follows the selected output format and includes verification appropriate to that format.

## Editing Principles

Use:

- Clear, plain professional language.
- Short paragraphs.
- Specific nouns and verbs.
- Evidence-based words such as "map", "test", "measure", "confirm", "evaluate", "compare", and "identify".
- The document's existing voice as the style reference.
- The smallest edit that fixes the issue.

Avoid:

- Inflated transformation language.
- Generic AI or business phrasing.
- Repeating the same idea in multiple sections.
- Long lists when a shorter paragraph works.
- Unnecessary three-part framing.
- New concepts not present in the source.
- Flattening distinctive judgment into generic professional prose.
- Praise, filler, and broad commentary.

## Output Format

For review comments:

```markdown
## Review

### [Issue]
Why it matters: [short explanation]
Suggested replacement:
[replacement text]
```

For direct section edits:

```markdown
Replace this:

[original or section label]

With this:

[revised text]
```

For full revised documents, preserve the original structure unless changing the structure is necessary for clarity.

For direct file edits, do not paste the full revised document unless asked. Report:

```markdown
## Changes Made

- [Section]: [what changed and why]

## Slop Patterns Addressed

- [repetition / inflated language / overreach / premature detail / etc.]

## Verification

- [check performed]
```

## Guardrails

- Do not invent missing strategy.
- Do not introduce new governance, roles, workflows, metrics, or decision criteria unless requested.
- Do not rewrite unattributed source material to make it appear original.
- If the document appears to depend on external source material, preserve attribution or flag missing attribution.
- Do not over-polish into vague corporate language.
- Do not make the document longer unless the user asks for expansion.
- Prefer useful concision over aggressive compression.

## Verification

Before finishing, confirm:

- The edit preserves the original intent.
- The edit removes more friction than it adds.
- Each change addresses a named clarity problem.
- Repetition was reduced.
- Repeated ideas across sections were consolidated or made intentionally distinct.
- The wording is more direct and readable.
- The edit follows the document's existing voice instead of imposing a generic AI style.
- No new unrequested concepts, roles, process steps, metrics, governance, or strategy were introduced.
- The edit did not erase attribution, ownership, uncertainty, or the author's distinctive judgment.
- Detailed process explanations are not repeated in summary sections.
- If a file was edited directly, the response summarizes changed sections and named clarity problems addressed.
- The output matches what the user asked for: review, snippets, full rewrite, or direct file edit summary.

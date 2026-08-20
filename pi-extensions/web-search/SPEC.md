# Pi Web Search Extension Spec

## Purpose

Create a simple and versatile Pi extension that gives agents reliable web search and URL reading without adding a large browser stack or complex research product.

The extension should help with:

- general web research
- developer and GitHub discovery
- company and stock research from public sources
- freshness-sensitive news queries
- reading known URLs into agent-friendly text

The first version should stay small: search, read URLs, return cited results, and let the Pi agent do the final synthesis.

## Design Principles

- Keep the core small and inspectable.
- Prefer one search tool and one URL-reading tool.
- Use conservative defaults for cost and context size.
- Return sources, dates, snippets, highlights, and URLs.
- Let the agent synthesize the final answer instead of hiding synthesis inside the extension.
- Add deeper research, custom UI, caching, and extra providers only after the basic workflow proves useful.

## Provider Strategy

Use **Exa** as the v1 provider.

Reasons:

- One API can cover web, GitHub, docs, news, company, and financial-report discovery.
- Supports domain filters and category filters.
- Can return highlights, summaries, and page contents.
- Keeps v1 simple compared with combining multiple providers.

Use environment variable:

```bash
export EXA_API_KEY=...
```

Firecrawl may be added later if Exa URL extraction is not good enough for known-page reading or batch scraping.

## Extension Layout

Recommended global layout:

```text
~/.pi/agent/extensions/pi-search/
├── index.ts
├── package.json
└── package-lock.json
```

Project-local layout is also valid:

```text
.pi/extensions/pi-search/
├── index.ts
├── package.json
└── package-lock.json
```

Development command:

```bash
pi -e ./index.ts
```

Reload after changes:

```text
/reload
```

## v1 Scope

### Include

- Exa Search integration.
- Exa Contents integration.
- LLM tool: `pi_web_search`.
- LLM tool: `pi_read_urls`.
- Slash command: `/search`.
- Slash command: `/github-search`.
- Slash command: `/stock-search`.
- Slash command: `/read-url`.
- Modes: `auto`, `web`, `github`, `stocks`, `news`.
- Depths: `fast`, `standard`.
- Cited, compact output.
- Clear error when `EXA_API_KEY` is missing.

### Exclude from v1

- Custom TUI search UI.
- Deep multi-step research.
- Firecrawl fallback.
- Financial data APIs.
- Stock recommendations or quantitative valuation.
- Complex source scoring.
- Query cache.
- Watchlists or monitors.

## Tools

### `pi_web_search`

Search web, GitHub, docs, news, or public company sources.

Parameters:

```ts
Type.Object({
  query: Type.String({ description: "Natural-language search query" }),
  mode: Type.Optional(StringEnum(["auto", "web", "github", "stocks", "news"] as const)),
  depth: Type.Optional(StringEnum(["fast", "standard"] as const)),
  maxResults: Type.Optional(Type.Number({ minimum: 1, maximum: 20 })),
  includeDomains: Type.Optional(Type.Array(Type.String())),
  excludeDomains: Type.Optional(Type.Array(Type.String())),
  since: Type.Optional(Type.String({ description: "ISO date or simple relative window if supported" })),
})
```

Default behavior:

- `mode`: `auto`
- `depth`: `standard`
- `maxResults`: `5` for fast, `10` for standard
- contents: highlights enabled, summary enabled for standard

Prompt guidance:

```text
Use pi_web_search when current or external information is needed.
Use mode github for repositories, packages, issues, docs, examples, and open-source discovery.
Use mode stocks for company filings, earnings, guidance, investor relations, or public stock research.
Use mode news for freshness-sensitive queries.
Use depth fast for quick lookups and standard for normal research.
```

Return shape:

```json
{
  "query": "...",
  "mode": "github",
  "depth": "standard",
  "results": [
    {
      "title": "...",
      "url": "...",
      "publishedDate": "...",
      "author": "...",
      "sourceType": "github | docs | news | filing | investor_relations | web",
      "summary": "...",
      "highlights": ["..."],
      "score": 0.87
    }
  ],
  "caveats": ["..."]
}
```

### `pi_read_urls`

Read known URLs and return summaries, highlights, or full text.

Parameters:

```ts
Type.Object({
  urls: Type.Array(Type.String(), { minItems: 1, maxItems: 10 }),
  output: Type.Optional(StringEnum(["summary", "highlights", "full_text"] as const)),
  freshnessHours: Type.Optional(Type.Number({ minimum: 0, maximum: 720 })),
})
```

Default behavior:

- `output`: `summary`
- `freshnessHours`: `24`
- full text only when explicitly requested

Return shape:

```json
{
  "results": [
    {
      "url": "...",
      "title": "...",
      "publishedDate": "...",
      "summary": "...",
      "highlights": ["..."],
      "text": "..."
    }
  ],
  "statuses": []
}
```

## Slash Commands

Slash commands should be thin wrappers that steer the agent to use the tools. They should not duplicate search logic.

### `/search <query>`

General search.

Behavior:

```text
Use pi_web_search in auto mode for: <query>
```

### `/github-search <query>`

Developer and GitHub-focused search.

Behavior:

```text
Use pi_web_search with mode github for: <query>
```

### `/stock-search <ticker or question>`

Public company and stock research.

Behavior:

```text
Use pi_web_search with mode stocks for public company and stock research about: <query>. Separate sourced facts from interpretation and do not provide investment advice as certainty.
```

### `/read-url <url...>`

Read one or more known URLs.

Behavior:

```text
Use pi_read_urls to read and summarize these URLs: <urls>
```

## Mode Behavior

### Auto

Default mode. Do not over-classify. Use generic Exa search unless the query clearly matches another mode.

### Web

General web search. No special domain filters.

### GitHub

Use developer-focused domain filters unless the user supplied their own `includeDomains`.

Default domains:

```json
[
  "github.com",
  "docs.github.com",
  "stackoverflow.com",
  "npmjs.com",
  "pypi.org",
  "readthedocs.io"
]
```

### Stocks

Search public company, filing, investor-relations, earnings, and reputable news sources.

Recommended handling:

- Prefer SEC filings, investor relations, earnings transcripts, and reputable news.
- Clearly separate facts, company claims, media/analyst interpretation, and agent inference.
- Include a caveat that results are research material, not investment advice.

### News

Prioritize freshness.

If `since` is provided, pass a date filter to Exa when possible. Otherwise use Exa news category and return publication dates when available.

## Output Formatting

The tool result should be useful both for the model and for humans reading the session.

Recommended text output:

```text
Search: <query>
Mode: <mode>, depth: <depth>

1. <title>
   URL: <url>
   Date: <publishedDate or freshness unknown>
   Type: <sourceType>
   Summary: <summary>
   Highlights:
   - <highlight>

Caveats:
- <caveat>
```

The `details` field should contain the structured JSON result for extensions, export, or later tooling.

## Cost and Context Controls

Defaults should be conservative:

- Fast search: 5 results, highlights only.
- Standard search: 10 results, highlights and summaries.
- Maximum `maxResults`: 20.
- URL reading: maximum 10 URLs.
- Full text only when explicitly requested.
- Do not automatically perform recursive searches in v1.

## Error Handling

Required errors:

- Missing `EXA_API_KEY`.
- Exa API non-2xx response.
- Network timeout or abort.
- No results found.

Errors should be short and actionable. Do not print API keys or sensitive headers.

Example:

```text
Exa search failed: missing EXA_API_KEY. Export EXA_API_KEY and reload Pi.
```

## Minimal Implementation Skeleton

```ts
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";

const Mode = StringEnum(["auto", "web", "github", "stocks", "news"] as const);
const Depth = StringEnum(["fast", "standard"] as const);
const UrlOutput = StringEnum(["summary", "highlights", "full_text"] as const);

const SearchParams = Type.Object({
  query: Type.String({ description: "Natural-language search query" }),
  mode: Type.Optional(Mode),
  depth: Type.Optional(Depth),
  maxResults: Type.Optional(Type.Number({ minimum: 1, maximum: 20 })),
  includeDomains: Type.Optional(Type.Array(Type.String())),
  excludeDomains: Type.Optional(Type.Array(Type.String())),
  since: Type.Optional(Type.String()),
});

const ReadUrlsParams = Type.Object({
  urls: Type.Array(Type.String(), { minItems: 1, maxItems: 10 }),
  output: Type.Optional(UrlOutput),
  freshnessHours: Type.Optional(Type.Number({ minimum: 0, maximum: 720 })),
});

export default function piSearchExtension(pi: ExtensionAPI) {
  pi.registerTool({
    name: "pi_web_search",
    label: "Web Search",
    description: "Search web, GitHub, news, and public company sources with citations.",
    promptSnippet: "Search web, GitHub, news, or public company sources with cited results.",
    promptGuidelines: [
      "Use pi_web_search when current or external information is needed.",
      "Use pi_web_search with mode github for repository, package, issue, documentation, or open-source discovery.",
      "Use pi_web_search with mode stocks for company, filing, earnings, guidance, or public stock research.",
      "Use pi_web_search with depth fast for quick lookups and standard for normal research.",
    ],
    parameters: SearchParams,
    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({ content: [{ type: "text", text: `Searching: ${params.query}` }] });
      const result = await runExaSearch(params, signal);
      return {
        content: [{ type: "text", text: formatSearchResult(result) }],
        details: result,
      };
    },
  });

  pi.registerTool({
    name: "pi_read_urls",
    label: "Read URLs",
    description: "Read known URLs and return summaries, highlights, or full text.",
    promptSnippet: "Read known URLs and return page text, highlights, or summaries.",
    promptGuidelines: [
      "Use pi_read_urls when the user provides URLs or when search results need closer reading.",
    ],
    parameters: ReadUrlsParams,
    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({ content: [{ type: "text", text: `Reading ${params.urls.length} URL(s)` }] });
      const result = await runExaContents(params, signal);
      return {
        content: [{ type: "text", text: formatUrlResult(result) }],
        details: result,
      };
    },
  });

  pi.registerCommand("search", {
    description: "Search the web: /search <query>",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) return ctx.ui.notify("Usage: /search <query>", "warning");
      pi.sendUserMessage(`Use pi_web_search in auto mode for: ${query}`);
    },
  });

  pi.registerCommand("github-search", {
    description: "Search GitHub and developer sources: /github-search <query>",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) return ctx.ui.notify("Usage: /github-search <query>", "warning");
      pi.sendUserMessage(`Use pi_web_search with mode github for: ${query}`);
    },
  });

  pi.registerCommand("stock-search", {
    description: "Search public company and stock sources: /stock-search <query>",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) return ctx.ui.notify("Usage: /stock-search <ticker or question>", "warning");
      pi.sendUserMessage(
        `Use pi_web_search with mode stocks for public company and stock research about: ${query}. Separate sourced facts from interpretation and do not provide investment advice as certainty.`
      );
    },
  });

  pi.registerCommand("read-url", {
    description: "Read URLs: /read-url <url...>",
    handler: async (args, ctx) => {
      const urls = args.split(/\s+/).filter(Boolean);
      if (urls.length === 0) return ctx.ui.notify("Usage: /read-url <url...>", "warning");
      pi.sendUserMessage(`Use pi_read_urls to read and summarize these URLs: ${urls.join(" ")}`);
    },
  });
}
```

## Acceptance Criteria

v1 is successful when:

- Pi can search current external information through `pi_web_search`.
- Pi can read known URLs through `pi_read_urls`.
- Search results include source URLs and dates when available.
- GitHub mode finds developer sources without extra user instructions.
- Stock mode returns sourced research material with clear caveats.
- Defaults are cheap enough for frequent use.
- The implementation is small enough to inspect and modify in one sitting.

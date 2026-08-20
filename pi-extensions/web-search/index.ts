import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { StringEnum } from "@earendil-works/pi-ai";
import { Type, type Static } from "typebox";

const EXA_SEARCH_URL = "https://api.exa.ai/search";
const EXA_CONTENTS_URL = "https://api.exa.ai/contents";
const REQUEST_TIMEOUT_MS = 30_000;
const DETAILS_TEXT_LIMIT = 12_000;

const GITHUB_DOMAINS = [
  "github.com",
  "docs.github.com",
  "stackoverflow.com",
  "npmjs.com",
  "pypi.org",
  "readthedocs.io",
];

const Mode = StringEnum(["auto", "web", "github", "stocks", "news"] as const);
const Depth = StringEnum(["fast", "standard"] as const);
const UrlOutput = StringEnum(["summary", "highlights", "full_text"] as const);

const SearchParamsSchema = Type.Object({
  query: Type.String({ description: "Natural-language search query" }),
  mode: Type.Optional(Mode),
  depth: Type.Optional(Depth),
  maxResults: Type.Optional(Type.Integer({ minimum: 1, maximum: 20 })),
  includeDomains: Type.Optional(Type.Array(Type.String())),
  excludeDomains: Type.Optional(Type.Array(Type.String())),
  since: Type.Optional(Type.String({ description: "ISO date or simple relative window, such as 7d or 2w" })),
});

type SearchParams = Static<typeof SearchParamsSchema>;

const ReadUrlsParamsSchema = Type.Object({
  urls: Type.Array(Type.String(), { minItems: 1, maxItems: 10 }),
  output: Type.Optional(UrlOutput),
  freshnessHours: Type.Optional(Type.Integer({ minimum: 0, maximum: 720 })),
});

type ReadUrlsParams = Static<typeof ReadUrlsParamsSchema>;

type SearchMode = "auto" | "web" | "github" | "stocks" | "news";
type SearchDepth = "fast" | "standard";
type SourceType = "github" | "docs" | "news" | "filing" | "investor_relations" | "web";

type NormalizedResult = {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  sourceType: SourceType;
  summary?: string;
  highlights: string[];
  score?: number;
  text?: string;
  textTruncated?: boolean;
};

type NormalizedSearchResponse = {
  query: string;
  mode: SearchMode;
  depth: SearchDepth;
  results: NormalizedResult[];
  caveats: string[];
  requestId?: string;
};

type NormalizedContentsResponse = {
  results: NormalizedResult[];
  statuses?: unknown[];
};

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
      "Use pi_web_search with mode news for freshness-sensitive queries.",
      "Use pi_web_search with depth fast for quick lookups and standard for normal research.",
    ],
    parameters: SearchParamsSchema,
    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({ content: [{ type: "text", text: `Searching: ${params.query}` }], details: {} });
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
    parameters: ReadUrlsParamsSchema,
    async execute(_toolCallId, params, signal, onUpdate) {
      onUpdate?.({ content: [{ type: "text", text: `Reading ${params.urls.length} URL(s)` }], details: {} });
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
      sendUserMessageSafely(pi, ctx, `Use pi_web_search in auto mode for: ${query}`);
    },
  });

  pi.registerCommand("github-search", {
    description: "Search GitHub and developer sources: /github-search <query>",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) return ctx.ui.notify("Usage: /github-search <query>", "warning");
      sendUserMessageSafely(pi, ctx, `Use pi_web_search with mode github for: ${query}`);
    },
  });

  pi.registerCommand("stock-search", {
    description: "Search public company and stock sources: /stock-search <query>",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) return ctx.ui.notify("Usage: /stock-search <ticker or question>", "warning");
      sendUserMessageSafely(
        pi,
        ctx,
        `Use pi_web_search with mode stocks for public company and stock research about: ${query}. Separate sourced facts from interpretation and do not provide investment advice as certainty.`
      );
    },
  });

  pi.registerCommand("read-url", {
    description: "Read URLs: /read-url <url...>",
    handler: async (args, ctx) => {
      const urls = args.split(/\s+/).filter(Boolean);
      if (urls.length === 0) return ctx.ui.notify("Usage: /read-url <url...>", "warning");
      sendUserMessageSafely(pi, ctx, `Use pi_read_urls to read and summarize these URLs: ${urls.join(" ")}`);
    },
  });
}

function sendUserMessageSafely(pi: ExtensionAPI, ctx: { isIdle(): boolean }, message: string) {
  const options = ctx.isIdle() ? undefined : { deliverAs: "followUp" as const };
  pi.sendUserMessage(message, options);
}

async function runExaSearch(params: SearchParams, signal?: AbortSignal): Promise<NormalizedSearchResponse> {
  const apiKey = getExaApiKey();
  const mode = params.mode ?? "auto";
  const depth = params.depth ?? "standard";
  const body = buildExaSearchBody(params, mode, depth);

  const raw = await postJson(EXA_SEARCH_URL, apiKey, body, signal, "Exa search");
  const results = normalizeResults(raw.results ?? [], mode);
  const caveats: string[] = [];

  if (results.length === 0) caveats.push("No results found.");
  if (mode === "stocks") {
    caveats.push("Stock-mode results are research material, not investment advice.");
    caveats.push("Stock mode uses one public-source search in v1 and may miss some investor relations pages, transcripts, or news.");
  }

  return {
    query: params.query,
    mode,
    depth,
    results,
    caveats,
    requestId: raw.requestId,
  };
}

async function runExaContents(params: ReadUrlsParams, signal?: AbortSignal): Promise<NormalizedContentsResponse> {
  const apiKey = getExaApiKey();
  const output = params.output ?? "summary";
  const urls = validateUrls(params.urls);
  const body = {
    urls,
    text: output === "full_text",
    highlights: output === "highlights" || output === "summary",
    summary: output === "summary",
    maxAgeHours: params.freshnessHours ?? 24,
  };

  const raw = await postJson(EXA_CONTENTS_URL, apiKey, body, signal, "Exa contents");
  return {
    results: normalizeResults(raw.results ?? [], "web"),
    statuses: raw.statuses,
  };
}

function getExaApiKey(): string {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("Exa search failed: missing EXA_API_KEY. Export EXA_API_KEY and reload Pi.");
  }
  return apiKey;
}

async function postJson(url: string, apiKey: string, body: unknown, signal: AbortSignal | undefined, label: string) {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const combinedSignal = combineSignals(signal, timeoutController.signal);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: combinedSignal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${label} failed: ${response.status} ${truncate(text, 500)}`);
    }

    return await response.json();
  } catch (error) {
    if (timeoutController.signal.aborted) {
      throw new Error(`${label} timed out after ${REQUEST_TIMEOUT_MS / 1000}s.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function combineSignals(signal: AbortSignal | undefined, timeoutSignal: AbortSignal): AbortSignal {
  if (!signal) return timeoutSignal;
  if (signal.aborted) return signal;

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  timeoutSignal.addEventListener("abort", abort, { once: true });
  return controller.signal;
}

function buildExaSearchBody(params: SearchParams, mode: SearchMode, depth: SearchDepth) {
  const numResults = params.maxResults ?? (depth === "fast" ? 5 : 10);
  const includeDomains = validateDomains(params.includeDomains, "includeDomains");
  const excludeDomains = validateDomains(params.excludeDomains, "excludeDomains");
  const body: Record<string, unknown> = {
    query: params.query,
    type: "auto",
    numResults,
    contents: {
      highlights: true,
      summary: depth !== "fast",
    },
  };

  if (includeDomains?.length) body.includeDomains = includeDomains;
  if (excludeDomains?.length) body.excludeDomains = excludeDomains;

  if (mode === "github" && !includeDomains?.length) {
    body.includeDomains = GITHUB_DOMAINS;
  }

  if (mode === "news") {
    body.category = "news";
  }

  if (mode === "stocks") {
    body.category = "financial report";
  }

  const startPublishedDate = parseSince(params.since);
  if (startPublishedDate) body.startPublishedDate = startPublishedDate;

  return body;
}

function validateUrls(urls: string[]): string[] {
  return urls.map((url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("URL must use http or https");
      }
      return parsed.toString();
    } catch {
      throw new Error(`Invalid URL for pi_read_urls: ${url}`);
    }
  });
}

function validateDomains(domains: string[] | undefined, field: string): string[] | undefined {
  if (!domains) return undefined;
  return domains.map((domain) => {
    const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) {
      throw new Error(`Invalid domain in ${field}: ${domain}`);
    }
    return normalized;
  });
}

function parseSince(since?: string): string | undefined {
  if (!since) return undefined;

  const direct = new Date(since);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();

  const match = since.trim().match(/^(\d+)\s*(d|day|days|w|week|weeks)$/i);
  if (!match) {
    throw new Error(`Invalid since value: ${since}. Use an ISO date, 7d, or 2w.`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const days = unit.startsWith("w") ? amount * 7 : amount;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function normalizeResults(results: any[], mode: SearchMode): NormalizedResult[] {
  return results.map((result) => {
    const text = typeof result.text === "string" ? truncate(result.text, DETAILS_TEXT_LIMIT) : undefined;
    return {
      title: result.title ?? "Untitled",
      url: result.url ?? "",
      publishedDate: result.publishedDate,
      author: result.author,
      sourceType: inferSourceType(result.url ?? "", mode),
      summary: result.summary,
      highlights: normalizeHighlights(result.highlights),
      score: result.score,
      text,
      textTruncated: typeof result.text === "string" && result.text.length > DETAILS_TEXT_LIMIT ? true : undefined,
    };
  }).filter((result) => result.url);
}

function normalizeHighlights(highlights: unknown): string[] {
  if (!Array.isArray(highlights)) return [];
  return highlights
    .map((highlight) => typeof highlight === "string" ? highlight : JSON.stringify(highlight))
    .filter(Boolean);
}

function inferSourceType(url: string, mode: SearchMode): SourceType {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return mode === "news" ? "news" : "web";
  }

  if (host === "github.com" || host.endsWith(".github.com")) return "github";
  if (host.includes("docs") || host.includes("readthedocs") || host === "stackoverflow.com" || host === "npmjs.com" || host === "pypi.org") return "docs";
  if (host === "sec.gov" || host.endsWith(".sec.gov")) return "filing";
  if (host.includes("investor")) return "investor_relations";
  if (mode === "news") return "news";
  return "web";
}

function formatSearchResult(result: NormalizedSearchResponse): string {
  const lines = [
    `Search: ${result.query}`,
    `Mode: ${result.mode}, depth: ${result.depth}`,
    "",
  ];

  if (result.results.length === 0) {
    lines.push("No results found.");
  } else {
    result.results.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title}`);
      lines.push(`   URL: ${item.url}`);
      lines.push(`   Date: ${item.publishedDate ?? "freshness unknown"}`);
      lines.push(`   Type: ${item.sourceType}`);
      if (item.summary) lines.push(`   Summary: ${truncate(oneLine(item.summary), 500)}`);
      if (item.highlights.length > 0) {
        lines.push("   Highlights:");
        item.highlights.slice(0, 3).forEach((highlight) => {
          lines.push(`   - ${truncate(oneLine(highlight), 300)}`);
        });
      }
      lines.push("");
    });
  }

  if (result.caveats.length > 0) {
    lines.push("Caveats:");
    result.caveats.forEach((caveat) => lines.push(`- ${caveat}`));
  }

  return lines.join("\n");
}

function formatUrlResult(result: NormalizedContentsResponse): string {
  const lines = ["URL contents:", ""];

  if (result.results.length === 0) {
    lines.push("No URL contents returned.");
  } else {
    result.results.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title}`);
      lines.push(`   URL: ${item.url}`);
      lines.push(`   Date: ${item.publishedDate ?? "freshness unknown"}`);
      if (item.summary) lines.push(`   Summary: ${truncate(oneLine(item.summary), 500)}`);
      if (item.highlights.length > 0) {
        lines.push("   Highlights:");
        item.highlights.slice(0, 5).forEach((highlight) => {
          lines.push(`   - ${truncate(oneLine(highlight), 300)}`);
        });
      }
      if (item.text) {
        lines.push("   Text:");
        lines.push(truncate(item.text, 4000));
        if (item.textTruncated) lines.push("   Text was truncated in details.");
      }
      lines.push("");
    });
  }

  return lines.join("\n");
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

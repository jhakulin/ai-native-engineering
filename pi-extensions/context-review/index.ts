import { execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve as resolvePath } from "node:path";
import { promisify } from "node:util";

import { complete, type AssistantMessage, type Message } from "@earendil-works/pi-ai/compat";
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { BorderedLoader, convertToLlm } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey, truncateToWidth } from "@earendil-works/pi-tui";
import { attachAdvisorFailure, attachAdvisorOutput } from "./context-review/advisor-validation.mjs";
import { attachObservedRequest, buildInMemoryStatsReport } from "./context-review/measurement.mjs";
import { formatStatsReport } from "./context-review/render.mjs";

const execFileAsync = promisify(execFile);

type StartupContext = {
  cwd: string;
  getSystemPrompt: () => string;
  getSystemPromptOptions: () => {
    contextFiles?: ReadonlyArray<{ path?: string; content?: string }>;
    skills?: ReadonlyArray<{ name?: string; path?: string; content?: string } | string>;
  };
};

const bundledScript = fileURLToPath(
  new URL("./context-review.mjs", import.meta.url)
);
const advisorPrompt = readFileSync(new URL("./advisor.md", import.meta.url), "utf8");

export default function contextReviewExtension(pi: ExtensionAPI) {
  let latestProviderPayload: unknown;
  let latestProviderPayloadAt: string | undefined;

  pi.on("before_provider_request", (event) => {
    latestProviderPayload = structuredClone(event.payload);
    latestProviderPayloadAt = new Date().toISOString();
    return undefined;
  });

  pi.registerCommand("context-review", {
    description: "Review persisted session context and the latest observed provider payload",
    handler: async (args, ctx) => {
      const tokens = commandArguments(args);
      const incompatibleOverride = nativeOverrideArgument(tokens);
      if (incompatibleOverride) {
        const message = `Context review rejected ${incompatibleOverride}: Pi native stats always inspect the current Pi session`;
        ctx.ui.notify(message, "error");
        if (ctx.mode !== "tui") console.error(message);
        return;
      }
      const full = tokens.includes("--full");
      const stats = tokens.includes("--stats");
      const advise = tokens.includes("--advise");
      if (advise && !stats) {
        const message = "/context-review --advise requires --stats";
        ctx.ui.notify(message, "error");
        if (ctx.mode !== "tui") console.error(message);
        return;
      }
      if (advise) await ctx.waitForIdle();
      const sessionFile = ctx.sessionManager.getSessionFile();
      const runtimeModel = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : undefined;
      const runtimeEffort = pi.getThinkingLevel();
      const requestedOutputPath = outputArgument(args);
      const outputPath = requestedOutputPath ? resolvePath(ctx.cwd, requestedOutputPath) : undefined;
      const forceOutput = tokens.includes("--force");
      const script = process.env.CONTEXT_REVIEW_SCRIPT || bundledScript;
      try {
        const parserArguments = withoutAdvisorArgument(withoutExtensionOutputArguments(tokens));
        if (stats && !parserArguments.includes("--json")) parserArguments.push("--json");
        const stdout = sessionFile && existsSync(sessionFile)
          ? (await execFileAsync(process.execPath, [
              script,
              ...parserArguments,
              "--agent",
              "pi",
              "--session",
              sessionFile,
              ...(stats && ctx.sessionManager.getLeafId() ? ["--leaf-id", ctx.sessionManager.getLeafId()!] : []),
              ...(stats && runtimeModel ? ["--runtime-model", runtimeModel] : []),
              ...(stats && runtimeEffort ? ["--runtime-effort", runtimeEffort] : []),
            ], { maxBuffer: 20 * 1024 * 1024 })).stdout
          : stats ? formatUnpersistedStats(ctx, true, runtimeModel, runtimeEffort) : formatUnpersistedReport(ctx, full);

        const payloadSection = stats ? "" : latestProviderPayload === undefined
          ? "\n## Latest provider payload\n\n(unavailable until this extension observes a provider request)\n"
          : (() => {
              const payload = formatPayload(latestProviderPayload, full);
              const fence = markdownFence(payload);
              return `\n## Latest provider payload\n\nEvidence: exact payload observed by this extension at ${latestProviderPayloadAt}. Later-loaded extensions may still modify it.\n\n${fence}json\n${payload}\n${fence}\n`;
            })();
        const report = stats
          ? await (async () => {
              const parsed = JSON.parse(stdout);
              if (sessionFile) parsed.session.selection = "current_session";
              let measured = attachObservedRequest(parsed, latestProviderPayload, latestProviderPayloadAt);
              if (advise) measured = await runPiAdvisor(measured, ctx, pi, runtimeEffort);
              return tokens.includes("--json") ? `${JSON.stringify(measured, null, 2)}\n` : formatStatsReport(measured);
            })()
          : `${stdout.trimEnd()}${payloadSection ? `\n${payloadSection}` : "\n"}`;
        if (outputPath) {
          if (sessionFile && resolvePath(sessionFile) === outputPath) throw new Error("--output must not overwrite the input session file");
          if (existsSync(outputPath) && !forceOutput) throw new Error(`Output file already exists: ${outputPath} (use --force to replace it)`);
          writeFileSync(outputPath, `${report.trimEnd()}\n`, "utf8");
          ctx.ui.notify(`Context review written to ${outputPath}`, "info");
          return;
        }

        if (ctx.mode === "tui") {
          await ctx.ui.custom((_tui, _theme, _keybindings, done) => {
            const lines = report.split("\n");
            const pageSize = 29;
            let offset = 0;
            const maxOffset = () => Math.max(0, lines.length - pageSize);
            return {
              render: (width) => [
                ...lines.slice(offset, offset + pageSize).map((line) => truncateToWidth(line, width)),
                truncateToWidth(`Lines ${Math.min(offset + 1, lines.length)}-${Math.min(offset + pageSize, lines.length)} of ${lines.length}  (Esc close, ↑↓ scroll, PgUp/PgDn page)`, width),
              ],
              invalidate: () => {},
              handleInput: (input) => {
                if (matchesKey(input, Key.escape)) return done();
                if (matchesKey(input, Key.home)) offset = 0;
                else if (matchesKey(input, Key.end)) offset = maxOffset();
                else if (matchesKey(input, Key.up)) offset = Math.max(0, offset - 1);
                else if (matchesKey(input, Key.down)) offset = Math.min(maxOffset(), offset + 1);
                else if (matchesKey(input, Key.pageUp)) offset = Math.max(0, offset - pageSize);
                else if (matchesKey(input, Key.pageDown)) offset = Math.min(maxOffset(), offset + pageSize);
                else return;
                _tui.requestRender();
              },
            };
          });
        } else {
          console.log(report);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.notify(`Context review failed: ${message}`, "error");
      }
    },
  });
}

async function runPiAdvisor(report: any, ctx: ExtensionCommandContext, pi: ExtensionAPI, effort?: string): Promise<any> {
  const contextSource = "Pi getSystemPrompt/buildSessionContext/getAllTools";
  if (!ctx.model) return attachAdvisorFailure(report, "No active Pi model is selected.", { contextSource, status: "model_unavailable" });
  const startedAt = performance.now();
  let selectedProvider = ctx.model.provider;
  let selectedModel = ctx.model.id;
  try {
    const auth = await ctx.modelRegistry.getApiKeyAndHeaders(ctx.model);
    if (!auth.ok || !auth.apiKey) {
      const limitation = auth.ok ? `No API key is available for ${ctx.model.provider}.` : auth.error;
      return attachAdvisorFailure(report, limitation, { provider: selectedProvider, model: selectedModel, effort, contextSource, elapsedMs: performance.now() - startedAt, status: "authentication_failed" });
    }
    const active = ctx.sessionManager.buildSessionContext();
    const activeToolNames = new Set(pi.getActiveTools());
    const activeTools = pi.getAllTools().filter((tool) => activeToolNames.has(tool.name)).map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
    const messages: Message[] = convertToLlm(active.messages);
    messages.push({
      role: "user",
      content: [{
        type: "text",
        text: [
          "Produce the context-efficiency advisor JSON described by the advisor instructions.",
          "The deterministic stats below are authoritative and must not be recalculated.",
          "Active tool definitions are included as context data, not as permission to call tools.",
          "<deterministic-stats>",
          JSON.stringify(report),
          "</deterministic-stats>",
          "<active-tool-definitions>",
          JSON.stringify(activeTools),
          "</active-tool-definitions>",
        ].join("\n"),
      }],
      timestamp: Date.now(),
    });
    const invoke = (signal: AbortSignal) => complete(
      ctx.model!,
      { systemPrompt: `${ctx.getSystemPrompt()}\n\n${advisorPrompt}`, messages },
      { apiKey: auth.apiKey, headers: auth.headers, env: auth.env, signal, maxTokens: 4096, timeoutMs: 60_000, maxRetries: 0, reasoningEffort: effort },
    );
    const response = await runPiAdvisorCall(invoke, ctx);
    if (!response) {
      return attachAdvisorFailure(report, "Advisor analysis was cancelled.", { provider: selectedProvider, model: selectedModel, effort, contextSource, elapsedMs: performance.now() - startedAt, status: "cancelled" });
    }
    selectedProvider = response.provider;
    selectedModel = response.model;
    const overhead = {
      provider: response.provider,
      model: response.model,
      effort,
      contextSource,
      inputTokens: response.usage.input,
      cacheReadTokens: response.usage.cacheRead,
      cacheWriteTokens: response.usage.cacheWrite,
      outputTokens: response.usage.output,
      providerTotalTokens: response.usage.totalTokens,
      elapsedMs: performance.now() - startedAt,
      reportedCost: response.usage.cost.total,
      status: response.stopReason === "stop" ? "completed" : response.stopReason,
      limitation: "The advisor call is isolated from Pi session persistence and is not included in inspected-session usage.",
    };
    if (response.stopReason !== "stop") {
      return attachAdvisorFailure(report, `Advisor model stopped with ${response.stopReason}.`, overhead);
    }
    const text = response.content.filter((item): item is { type: "text"; text: string } => item.type === "text").map((item) => item.text).join("\n");
    let candidate: unknown;
    try {
      candidate = JSON.parse(text);
    } catch {
      return attachAdvisorFailure(report, "Advisor output was not valid JSON.", { ...overhead, status: "malformed_output" });
    }
    const attached = attachAdvisorOutput(report, candidate, overhead);
    if (!attached.validation.valid) attached.report.advisorOverhead.status = "validation_failed";
    return attached.report;
  } catch (error) {
    const limitation = error instanceof Error && error.name === "AbortError" ? "Advisor analysis timed out or was cancelled." : "Advisor analysis failed before valid output was available.";
    return attachAdvisorFailure(report, limitation, { provider: selectedProvider, model: selectedModel, effort, contextSource, elapsedMs: performance.now() - startedAt, status: "failed" });
  }
}

async function runPiAdvisorCall(invoke: (signal: AbortSignal) => Promise<AssistantMessage>, ctx: ExtensionCommandContext): Promise<AssistantMessage | null> {
  if (ctx.mode !== "tui") return invoke(AbortSignal.timeout(60_000));
  const result = await ctx.ui.custom<{ response: AssistantMessage } | { error: unknown } | null>((tui, theme, _keybindings, done) => {
    const loader = new BorderedLoader(tui, theme, "Analyzing context efficiency...");
    loader.onAbort = () => done(null);
    invoke(AbortSignal.any([loader.signal, AbortSignal.timeout(60_000)]))
      .then((response) => done({ response }))
      .catch((error) => done({ error }));
    return loader;
  });
  if (result === null) return null;
  if ("error" in result) throw result.error;
  return result.response;
}

function formatUnpersistedStats(ctx: StartupContext, json: boolean, model?: string, effort?: string): string {
  const report = buildInMemoryStatsReport({ cwd: ctx.cwd, systemPrompt: ctx.getSystemPrompt(), model, effort });
  return json ? `${JSON.stringify(report, null, 2)}\n` : formatStatsReport(report);
}

function formatUnpersistedReport(ctx: StartupContext, full: boolean): string {
  const options = ctx.getSystemPromptOptions();
  const systemPrompt = ctx.getSystemPrompt();
  const contextFiles = options.contextFiles ?? [];
  const skills = options.skills ?? [];
  const lines = [
    "# Context review",
    "",
    "Agent: pi",
    "Session: not persisted yet",
    `Working directory: ${ctx.cwd}`,
    "Scope: current in-memory startup context; persisted transcript is unavailable",
    "",
    "## Persisted instructions",
    "(none; no session JSONL has been written yet)",
    "",
    "## Startup system prompt",
    "[exact-in-memory-system-prompt]",
    ...startupBlock(systemPrompt, full),
    "",
    "## Loaded context files",
    ...(contextFiles.length ? contextFiles.flatMap((file) => [
      `- [exact-in-memory-context] ${file.path ?? "unknown"}`,
      "  Content:",
      ...(file.content !== undefined ? startupBlock(file.content, full, "  ") : ["  (content unavailable through startup metadata)"]),
    ]) : ["(none reported)"]),
    "",
    "## Loaded skills",
    ...(skills.length ? skills.flatMap((skill) => {
      const item = typeof skill === "string" ? { name: skill } : skill;
      return [`- [exact-in-memory-skill] ${item.name ?? item.path ?? "unknown"}`, "  Content:", ...(item.content !== undefined ? startupBlock(item.content, full, "  ") : ["  (content unavailable through startup metadata)"])];
    }) : ["(none reported)"]),
    "",
    "## Unavailable or uncertain context",
    "- The persisted session transcript is not available until Pi writes the first session entry.",
    "- The provider payload is unavailable until a provider request is observed.",
  ];
  return `${lines.join("\n")}\n`;
}

function truncateStartupText(value: string, full: boolean): string {
  const limit = 20_000;
  if (full || value.length <= limit) return value;
  return `${value.slice(0, limit)}\n… [truncated ${value.length - limit} characters; use /context-review --full]`;
}

function markdownFence(value: string): string {
  let longestRun = 0;
  for (const match of value.matchAll(/`+/g)) longestRun = Math.max(longestRun, match[0].length);
  return "`".repeat(Math.max(3, longestRun + 1));
}

function startupBlock(value: string, full: boolean, prefix = ""): string[] {
  const fence = markdownFence(value);
  return [`${prefix}${fence}`, ...truncateStartupText(value, full).split("\n").map((line) => `${prefix}${line}`), `${prefix}${fence}`];
}

function commandArguments(args: string): string[] {
  const tokens: string[] = [];
  let token = "";
  let quote: string | undefined;
  let escaped = false;
  for (const character of args) {
    if (escaped) { token += character; escaped = false; continue; }
    if (character === "\\") { escaped = true; continue; }
    if (quote) { if (character === quote) quote = undefined; else token += character; continue; }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (/\s/.test(character)) { if (token) { tokens.push(token); token = ""; } continue; }
    token += character;
  }
  if (escaped) token += "\\";
  if (token) tokens.push(token);
  return tokens;
}

function nativeOverrideArgument(tokens: string[]): string | undefined {
  return tokens.find((token) => token === "--agent" || token.startsWith("--agent=") || token === "--session" || token.startsWith("--session="));
}

function withoutAdvisorArgument(tokens: string[]): string[] {
  return tokens.filter((token) => token !== "--advise");
}

function withoutExtensionOutputArguments(tokens: string[]): string[] {
  const output: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--force" || token.startsWith("--output=")) continue;
    if (token === "--output") { index += 1; continue; }
    output.push(token);
  }
  return output;
}

function outputArgument(args: string): string | undefined {
  const tokens = commandArguments(args);
  const inline = tokens.find((token) => token.startsWith("--output="));
  if (inline) {
    const value = inline.slice("--output=".length);
    if (!value || value.startsWith("--")) throw new Error("--output requires a path");
    return value;
  }
  const index = tokens.indexOf("--output");
  if (index < 0) return undefined;
  const value = tokens[index + 1];
  if (!value || value.startsWith("--")) throw new Error("--output requires a path");
  return value;
}

function formatPayload(payload: unknown, full: boolean): string {
  const text = JSON.stringify(payload, null, 2);
  const limit = 20_000;
  if (full || text.length <= limit) return text;
  return `${text.slice(0, limit)}\n… [truncated ${text.length - limit} characters; use /context-review --full]`;
}

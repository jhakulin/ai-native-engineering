#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { attachAdvisorFailure, attachAdvisorOutput } from "./advisor-validation.mjs";
import { formatStatsReport } from "./render.mjs";

const SUPPORTED_AGENTS = new Set(["codex", "claude"]);

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const stats = readJson(options.statsInput, "frozen stats");
  if (stats?.reportType !== "context_efficiency_stats") throw new Error("Frozen input is not a context-efficiency stats report");
  if (stats?.session?.harness !== options.agent) throw new Error(`Frozen stats belong to ${stats?.session?.harness ?? "an unknown harness"}, not ${options.agent}`);

  const overhead = {
    provider: options.agent,
    model: stats.session.model,
    effort: stats.session.effort,
    contextSource: `current_${options.agent}_agent_context`,
    status: "completed_usage_unavailable",
    limitation: "The current model-mediated skill turn does not expose advisor-only usage before display.",
  };
  let report;
  try {
    const candidate = readJson(options.adviceInput, "advisor output");
    report = attachAdvisorOutput(stats, candidate, overhead).report;
  } catch {
    report = attachAdvisorFailure(stats, "Advisor output was not valid JSON.", { ...overhead, status: "malformed_output" });
  }

  const output = options.json ? `${JSON.stringify(report, null, 2)}\n` : formatStatsReport(report);
  if (!options.output) {
    process.stdout.write(output);
    return;
  }
  for (const input of [options.statsInput, options.adviceInput]) {
    if (path.resolve(input) === path.resolve(options.output)) throw new Error("--output must not overwrite an input file");
  }
  if (fs.existsSync(options.output) && !options.force) throw new Error(`Output file already exists: ${options.output} (use --force to replace it)`);
  fs.writeFileSync(options.output, output, "utf8");
}

function parseArgs(argv) {
  const options = { agent: undefined, statsInput: undefined, adviceInput: undefined, json: false, output: undefined, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--agent") options.agent = requireValue(argv, ++index, argument);
    else if (argument === "--stats-input") options.statsInput = path.resolve(requireValue(argv, ++index, argument));
    else if (argument === "--advice-input") options.adviceInput = path.resolve(requireValue(argv, ++index, argument));
    else if (argument === "--json") options.json = true;
    else if (argument === "--output") options.output = path.resolve(requireValue(argv, ++index, argument));
    else if (argument === "--force") options.force = true;
    else throw new Error(`Unknown internal handoff argument: ${argument}`);
  }
  if (!SUPPORTED_AGENTS.has(options.agent)) throw new Error("--agent must be codex or claude");
  if (!options.statsInput) throw new Error("--stats-input is required");
  if (!options.adviceInput) throw new Error("--advice-input is required");
  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(fileURLToPath(import.meta.url))) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`context-review advisor handoff: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

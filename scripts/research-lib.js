const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const root = process.cwd();

function readJsonLike(file) {
  const text = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${file} must currently use JSON syntax, even though the extension is .yml: ${error.message}`);
  }
}

function targetPath(targetName) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetName)) {
    throw new Error(`Invalid target name: ${targetName}`);
  }
  return path.join(root, "research-targets", `${targetName}.yml`);
}

function loadTarget(targetName) {
  const file = targetPath(targetName);
  if (!fs.existsSync(file)) throw new Error(`Missing target config: ${file}`);
  const target = readJsonLike(file);
  validateTarget(target, file);
  return target;
}

function validateTarget(target, file = "target") {
  const errors = [];
  if (!target || typeof target !== "object") errors.push("target must be an object");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target.name || "")) errors.push("name must be lowercase hyphenated");
  if (!target.title) errors.push("title is required");
  if (!target.brief_title) errors.push("brief_title is required");
  if (target.analysis_focus !== undefined) {
    const validString = typeof target.analysis_focus === "string" && target.analysis_focus.trim();
    const validList = Array.isArray(target.analysis_focus) && target.analysis_focus.length > 0 && target.analysis_focus.every((item) => typeof item === "string" && item.trim());
    if (!validString && !validList) errors.push("analysis_focus must be a non-empty string or array of non-empty strings when present");
  }
  if (!target.current_context || !Array.isArray(target.current_context.include)) errors.push("current_context.include is required");
  if (!target.idea_output || typeof target.idea_output.directory !== "string" || !/^ideas\/[a-z0-9-]+$/.test(target.idea_output.directory)) errors.push("idea_output.directory must be an explicit ideas/<target> directory");
  if (!Array.isArray(target.youtube_searches) || target.youtube_searches.length === 0) errors.push("youtube_searches must contain at least one search");
  for (const [index, search] of (target.youtube_searches || []).entries()) {
    if (!search.query) errors.push(`youtube_searches[${index}].query is required`);
  }
  if (!target.source_limits || !Number.isInteger(target.source_limits.max_video_transcripts)) errors.push("source_limits.max_video_transcripts is required");
  if (!target.selection || !Number.isInteger(target.selection.min_duration_seconds) || target.selection.min_duration_seconds < 1) errors.push("selection.min_duration_seconds is required");
  if (!target.source_history || !target.source_history.path) errors.push("source_history.path is required");
  if (errors.length) throw new Error(`${file} is invalid:\n- ${errors.join("\n- ")}`);
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getTargetName() {
  return process.argv[2] || process.env.RESEARCH_TARGET || "agent-skills";
}

function getResearchDate() {
  return process.env.RESEARCH_DATE || today();
}

function getResearchRunId() {
  return process.env.RESEARCH_RUN_ID || "local";
}

function inboxDir(target, date = today(), runId = getResearchRunId()) {
  return path.join(root, "research", "inbox", target.name, date, `run-${runId}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, payload) {
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
}

function listFiles(patterns, excludes = []) {
  const include = new Set();
  for (const pattern of patterns) {
    for (const file of expandPattern(pattern)) include.add(file);
  }
  return [...include].filter((file) => !isExcluded(file, excludes)).sort();
}

function expandPattern(pattern) {
  if (!pattern.includes("*")) return fs.existsSync(path.join(root, pattern)) ? [pattern] : [];
  const parts = pattern.split("/");
  const results = [];
  walkGlob(root, parts, "", results);
  return results;
}

function walkGlob(absDir, parts, relPrefix, results) {
  if (parts.length === 0) {
    if (fs.existsSync(absDir) && fs.statSync(absDir).isFile()) results.push(relPrefix.replace(/^\//, ""));
    return;
  }
  const [part, ...rest] = parts;
  if (part === "**") {
    walkGlob(absDir, rest, relPrefix, results);
    for (const entry of safeReaddir(absDir)) {
      const next = path.join(absDir, entry);
      if (fs.statSync(next).isDirectory()) walkGlob(next, parts, path.join(relPrefix, entry), results);
    }
    return;
  }
  if (part.includes("*")) {
    const re = new RegExp(`^${part.split("*").map(escapeRe).join(".*")}$`);
    for (const entry of safeReaddir(absDir)) {
      if (!re.test(entry)) continue;
      walkGlob(path.join(absDir, entry), rest, path.join(relPrefix, entry), results);
    }
    return;
  }
  walkGlob(path.join(absDir, part), rest, path.join(relPrefix, part), results);
}

function safeReaddir(dir) {
  try { return fs.readdirSync(dir); } catch { return []; }
}

function escapeRe(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isExcluded(file, patterns) {
  return patterns.some((pattern) => {
    if (pattern === "**/.env") return file.endsWith("/.env") || file === ".env";
    if (pattern.endsWith("/**")) return file.startsWith(pattern.slice(0, -3));
    if (pattern.includes("node_modules")) return file.includes("node_modules/");
    if (pattern.includes(".git")) return file.includes(".git/");
    return file === pattern;
  });
}

function readHistory(historyPath) {
  const abs = path.join(root, historyPath);
  if (!fs.existsSync(abs)) return new Map();
  const map = new Map();
  for (const line of fs.readFileSync(abs, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const item = JSON.parse(line);
      if (item.source_id) map.set(item.source_id, item);
    } catch {
      // Ignore malformed history lines; validation can report them separately later.
    }
  }
  return map;
}

function videoSourceId(videoId) {
  return `youtube:${videoId}`;
}

function hashSourceId(url) {
  return `web:${crypto.createHash("sha256").update(url).digest("hex").slice(0, 16)}`;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
}

module.exports = {
  root,
  loadTarget,
  validateTarget,
  mkdirp,
  today,
  getTargetName,
  getResearchDate,
  getResearchRunId,
  inboxDir,
  readJson,
  writeJson,
  listFiles,
  readHistory,
  videoSourceId,
  hashSourceId,
  run,
};

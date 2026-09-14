import os from "node:os";
import path from "node:path";

const SAFE_TYPES = new Set([
  "attachment", "base_instructions", "bash_execution", "branch_summary", "custom_message",
  "function_call", "function_call_output", "image", "input_text", "local_shell_call",
  "local_shell_call_output", "message_metadata", "output_text", "reasoning", "redacted_thinking",
  "summary", "text", "thinking", "toolCall", "tool_result", "tool_use",
  "custom_tool_call", "custom_tool_call_output", "user_message", "assistant_message",
  "system_message", "developer_message", "toolResult_message",
]);

export function safeSessionPath(sessionPath, cwd) {
  if (!sessionPath) return "unavailable";
  const absolute = path.resolve(sessionPath);
  const base = cwd && path.isAbsolute(cwd) ? path.resolve(cwd) : undefined;
  if (base && (absolute === base || absolute.startsWith(`${base}${path.sep}`))) {
    return safePath(path.relative(base, absolute) || ".");
  }
  const home = os.homedir();
  if (absolute === home || absolute.startsWith(`${home}${path.sep}`)) {
    return safePath(`~${absolute.slice(home.length)}`);
  }
  return safePath(path.basename(absolute));
}

export function safeWorkingDirectory(cwd) {
  if (!cwd) return null;
  const home = os.homedir();
  const value = cwd === home || cwd.startsWith(`${home}${path.sep}`) ? `~${cwd.slice(home.length)}` : cwd;
  return safePath(value);
}

export function safeMetadataValue(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).slice(0, 160);
  return looksSensitive(text) ? "[redacted]" : text.replace(/[\r\n\t]/g, " ");
}

export function safeTypeName(value) {
  return SAFE_TYPES.has(String(value)) ? String(value) : "custom";
}

export function safeContributorId(category, type, ordinal) {
  const safeCategory = String(category).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  const safeType = safeTypeName(type).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `${safeCategory}:${safeType}:${ordinal}`;
}

function safePath(value) {
  return String(value).split(/[\\/]/).map((part) => looksSensitive(part) ? "[redacted]" : part).join(path.sep);
}

function looksSensitive(value) {
  return /(?:api[_-]?key|access[_-]?token|auth[_-]?token|password|passwd|secret|sk[_-]live|private[_-]?key)/i.test(value)
    || /^[A-Za-z0-9+/_=-]{48,}$/.test(value);
}

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test, after } = require("node:test");

const originalCwd = process.cwd();
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "research-history-test-"));
process.chdir(fixture);
const { readHistory } = require("./research-lib");
process.chdir(originalCwd);
after(() => fs.rmSync(fixture, { recursive: true, force: true }));

const historyPath = "research-history/ai-native-engineering/sources.jsonl";
const repository = "example/research";
const local = { source_id: "youtube:existing", target: "ai-native-engineering", first_used: "2026-07-01", last_used: "2026-09-01" };
fs.mkdirSync(path.dirname(path.join(fixture, historyPath)), { recursive: true });
fs.writeFileSync(path.join(fixture, historyPath), JSON.stringify(local) + "\n");

function pull(number, state = "open", overrides = {}) {
  return {
    number, state,
    head: { ref: `research-inbox/ai-native-engineering-2026-09-21-${number}`, sha: number.toString(16).padStart(40, "0"), repo: { full_name: repository } },
    ...overrides,
  };
}
function content(...entries) {
  return { encoding: "base64", content: Buffer.from(entries.map((entry) => JSON.stringify({ ...local, ...entry })).join("\n")).toString("base64") };
}
function readWith(request) {
  return readHistory(historyPath, { includePullRequests: true, repository, request });
}

test("next run includes open, closed unmerged, and merged PR history without editing local history", () => {
  const before = fs.readFileSync(path.join(fixture, historyPath), "utf8");
  const prs = [pull(1), pull(2, "closed", { merged_at: null }), pull(3, "closed", { merged_at: "2026-09-21T10:00:00Z" })];
  const history = readWith((endpoint) => {
    if (endpoint.includes("/pulls?")) {
      assert.match(endpoint, /state=all/);
      return prs;
    }
    const pr = prs.find((item) => endpoint.endsWith(`ref=${item.head.sha}`));
    assert.ok(pr, "reads head SHA rather than mutable/deleted branch name");
    return content({ source_id: `youtube:pr-${pr.number}`, first_used: "2026-09-21", last_used: "2026-09-21" });
  });
  for (const pr of prs) assert.equal(history.get(`youtube:pr-${pr.number}`).last_used, "2026-09-21");
  const ageDays = Math.floor((Date.parse("2026-09-21T12:00:00Z") - Date.parse(history.get("youtube:pr-1").last_used)) / 86400000);
  assert.equal(ageDays, 0);
  assert.equal(ageDays >= 90, false, "same-day next run excludes the source");
  assert.equal(fs.readFileSync(path.join(fixture, historyPath), "utf8"), before);
});

test("merge preserves earliest first use and latest last use regardless of PR ordering", () => {
  const history = readWith((endpoint) => {
    if (endpoint.includes("/pulls?")) return [pull(1), pull(2)];
    return endpoint.endsWith(pull(1).head.sha)
      ? content({ first_used: "2026-08-01", last_used: "2026-09-21" })
      : content({ first_used: "2026-06-01", last_used: "2026-08-01" });
  });
  assert.equal(history.get(local.source_id).first_used, "2026-06-01");
  assert.equal(history.get(local.source_id).last_used, "2026-09-21");
  const eligible = (date) => Math.floor((Date.parse(date) - Date.parse(history.get(local.source_id).last_used)) / 86400000) >= 90;
  assert.equal(eligible("2026-12-19"), false);
  assert.equal(eligible("2026-12-20"), true, "existing 90-day reuse remains possible");
});

test("paginates all PRs and ignores unrelated targets, lookalike branches, and forks", () => {
  const ignored = [
    pull(1, "open", { head: { ...pull(1).head, ref: "research-inbox/agent-skills-2026-09-21-1" } }),
    pull(2, "open", { head: { ...pull(2).head, ref: "research-inbox/ai-native-engineering-not-a-run" } }),
    pull(3, "open", { head: { ...pull(3).head, repo: { full_name: "fork/research" } } }),
  ];
  const calls = [];
  const history = readWith((endpoint) => {
    calls.push(endpoint);
    if (endpoint.includes("/pulls?")) return endpoint.endsWith("page=1") ? Array.from({ length: 100 }, (_, i) => ignored[i % 3]) : [pull(4)];
    return content({ source_id: "youtube:page-two", last_used: "2026-09-21" });
  });
  assert.equal(calls.length, 3);
  assert.ok(history.has("youtube:page-two"));
});

test("API failures and malformed remote history fail closed rather than silently allowing repeats", () => {
  assert.throws(() => readWith(() => { throw new Error("API unavailable"); }), /API unavailable/);
  assert.throws(() => readWith((endpoint) => endpoint.includes("/pulls?") ? [pull(1)] : { encoding: "none" }), /Could not read/);
  assert.throws(() => readWith((endpoint) => endpoint.includes("/pulls?") ? [pull(1)] : content({ target: "agent-skills" })), /Invalid source history/);
  assert.throws(() => readWith((endpoint) => endpoint.includes("/pulls?") ? [pull(1)] : content({ last_used: "invalid" })), /Invalid source history/);
});

test("local-only consumers do not require GitHub access", () => {
  const history = readHistory(historyPath, { request: () => { throw new Error("unexpected GitHub request"); } });
  assert.deepEqual(history.get(local.source_id), local);
});

test("PR history is available even if no local history file exists", () => {
  const missingPath = "research-history/agent-skills/sources.jsonl";
  const pr = pull(1);
  pr.head.ref = "research-inbox/agent-skills-2026-09-21-1";
  const history = readHistory(missingPath, {
    includePullRequests: true, repository,
    request: (endpoint) => endpoint.includes("/pulls?") ? [pr] : content({ target: "agent-skills" }),
  });
  assert.ok(history.has(local.source_id));
});

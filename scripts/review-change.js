#!/usr/bin/env node
"use strict";

/**
 * Trusted preparation and reporting around a separate Codex review.
 *
 * Workflow: .github/workflows/review-change.md
 *   prepare -> packet.json -> Codex writes review-result.json -> finalize
 *
 * `prepare` captures PR scope, policy, criterion sources and external evidence.
 * `finalize` checks the model's result against that packet and current GitHub
 * state, then writes report.json/report.md. This script never invokes a model,
 * executes candidate scripts, approves a PR or merges changes.
 *
 * Trust boundary: the workflow supplies repository/release identities and
 * credentials. PR content and model output are review data, not authority.
 * Digests bind content identities; they are not signatures or proof of review.
 * Evidence readiness applies only to configured criteria, not merge permission.
 *
 * File layout: Git/source preparation; result validation and report rendering;
 * authenticated GitHub evidence; CLI orchestration. review-runtime.js owns
 * bounded file reads and runtime collection/normalization.
 * Record shapes live in .github/aw/review-contracts.schema.json.
 * Setup, producer contracts and operational limits: docs/reusable-change-review.md.
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const Ajv = require("ajv");
const schema = require("../.github/aw/review-contracts.schema.json");
const { readBounded } = require("./review-runtime.js");
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(schema);
const validators = Object.fromEntries(["config", "packet", "result", "report", "events", "executionEvidence", "humanAcceptance"].map(name => [name, ajv.compile({ $ref: `${schema.$id}#/definitions/${name}` })]));
const SHA = /^[a-f0-9]{40}$/;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const ZERO = "0".repeat(40);
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
const json = value => JSON.stringify(value, null, 2) + "\n";
const lineCount = value => value.length ? value.split("\n").length - Number(value.endsWith("\n")) : 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function validate(name, value) {
  return validators[name](value) ? [] : validators[name].errors.map(error => `${name}${error.instancePath}: ${error.message}`);
}

/** Derive the model-facing result schema; canonical definitions remain the only source. */
function buildResultSchema() {
  const definitions = {};
  function include(node) {
    if (!node || typeof node !== "object") return;
    if (typeof node.$ref === "string") {
      const match = /^#\/definitions\/([^/]+)$/.exec(node.$ref);
      assert(match && Object.hasOwn(schema.definitions, match[1]), "Expected a canonical local schema reference");
      const name = match[1];
      if (!Object.hasOwn(definitions, name)) {
        definitions[name] = schema.definitions[name];
        include(definitions[name]);
      }
    }
    for (const value of Object.values(node)) include(value);
  }
  include({ $ref: "#/definitions/result" });
  return { $schema: schema.$schema, $id: `${schema.$id}/result`, $ref: "#/definitions/result", definitions };
}
function relativePath(value) {
  assert(typeof value === "string" && value.length && !value.includes("\0") && !value.includes("\\") && !value.startsWith("/") && !value.split("/").some(part => ["", ".", "..", ".git"].includes(part)), "Expected a repository-relative non-traversing Git path");
  return value;
}

// Source preparation reads immutable Git objects, not candidate working-tree code.
function git(directory, args, options = {}) {
  return execFileSync("git", ["--no-optional-locks", "--literal-pathspecs", "-c", "core.hooksPath=/dev/null", "-c", "core.fsmonitor=false", "-C", directory, ...args], {
    encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024, timeout: 60000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_NO_REPLACE_OBJECTS: "1" }, ...options
  });
}
function blob(directory, revision, filename, limit) {
  assert(SHA.test(revision), "Expected immutable source revision");
  relativePath(filename);
  const object = `${revision}:${filename}`;
  assert(git(directory, ["cat-file", "-t", object]).trim() === "blob", `Source is not a file: ${filename}`);
  // Read tree metadata, not a working-tree symlink or executable repository helper.
  const entry = git(directory, ["ls-tree", revision, "--", filename]);
  assert(entry.startsWith("100"), `Source is not a regular tracked file: ${filename}`);
  const size = Number(git(directory, ["cat-file", "-s", object]).trim());
  assert(Number.isSafeInteger(size) && size <= limit, `Source exceeds permitted bytes: ${filename}`);
  const bytes = git(directory, ["cat-file", "blob", object], { encoding: "buffer", maxBuffer: limit + 1 });
  const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  assert(!content.includes("\0"), `Source is binary: ${filename}`);
  return { content, sha256: hash(bytes), lines: lineCount(content), bytes: size };
}
function readConfig(options) {
  const source = blob(options.gitDir, options.policySha || options.baseSha, options.configPath || "review.config.json", 128 * 1024);
  const config = JSON.parse(source.content);
  const errors = validate("config", config);
  assert(!errors.length, errors.join("; "));
  assert(new Set(config.criteria.map(item => item.id)).size === config.criteria.length, "Duplicate criterion ID");
  return { config, source };
}

/**
 * Build the bounded review input from already available consumer/shared Git data.
 *
 * options.gitDir contains consumer objects; baseSha/headSha identify the PR.
 * options.shared supplies { repository, sha, gitDir } for the called release.
 * policySha selects trusted consumer configuration (default: baseSha), while
 * configPath selects its path (default: review.config.json). Optional run metadata
 * and evidence records come from the trusted caller, never from the model.
 *
 * The diff's old side is the merge base, not the potentially advanced base tip.
 * Content limits retain inventory entries with explicit omissions; invalid
 * identities/configuration and hard inventory limits throw instead of guessing.
 * This function does not authenticate evidence producers: the CLI does that
 * separately. It reads Git objects and writes an empty blob for add/delete diffs,
 * without checking out or executing the candidate.
 *
 * @returns {object} Schema-valid packet with scope, criteria and content digests.
 */
function preparePacket(options) {
  const { gitDir, repository, pr, baseSha, headSha, shared } = options;
  assert(REPOSITORY.test(repository) && REPOSITORY.test(shared.repository), "Invalid repository identity");
  assert(Number.isSafeInteger(pr) && pr > 0 && SHA.test(baseSha) && SHA.test(headSha) && SHA.test(shared.sha), "Invalid PR or revision identity");
  assert(git(shared.gitDir, ["rev-parse", "HEAD"]).trim() === shared.sha, "Shared checkout does not match the called release");
  const { config, source } = readConfig(options);
  const bases = git(gitDir, ["merge-base", "--all", baseSha, headSha]).trim().split("\n");
  assert(bases.length === 1 && SHA.test(bases[0]), "Comparison has no unique merge base");
  const mergeBase = bases[0];
  const raw = new TextDecoder("utf-8", { fatal: true }).decode(git(gitDir, ["diff", "--raw", "-z", "--no-abbrev", "--find-renames", mergeBase, headSha, "--"], { encoding: "buffer" })).split("\0");
  const files = [], omissions = [], contexts = [], provenance = [];
  let diffBudget = config.limits.max_diff_bytes;
  let contextBudget = config.limits.max_context_bytes;
  let totalFiles = 0;
  const empty = git(gitDir, ["hash-object", "-w", "--stdin"], { input: "" }).trim();
  for (let index = 0; index < raw.length && raw[index];) {
    const match = /^:(\d{6}) (\d{6}) ([a-f0-9]{40}) ([a-f0-9]{40}) ([AMDRT])\d*$/.exec(raw[index++]);
    assert(match, "Unsupported or malformed raw Git diff record");
    const original = raw[index++];
    const code = match[5];
    const filename = code === "R" ? raw[index++] : original;
    relativePath(original); relativePath(filename);
    totalFiles++;
    assert(totalFiles <= 2000, "Changed-path inventory exceeds the hard contract bound; no partial inventory is certified");
    const item = { path: filename, old_path: code === "A" ? null : original,
      status: { A: "added", M: "modified", D: "deleted", R: "renamed", T: "type_changed" }[code],
      old_mode: match[1], new_mode: match[2], old_sha: match[3], new_sha: match[4], old_lines: 0, new_lines: 0,
      diff: "", diff_sha256: hash(""), citation_ranges: [], complete: true, omissions: [] };
    provenance.push({ kind: "available", item: filename, outcome: "changed", sha256: "", detail: `Git objects at ${mergeBase}..${headSha}; ${item.status}` });
    try {
      assert(![item.old_mode, item.new_mode].some(mode => ["160000", "120000"].includes(mode)), "Gitlink or symlink target is not followed");
      assert(totalFiles <= config.limits.max_files, "File exceeds configured review count; retained in the exact inventory");
      for (const side of ["old", "new"]) {
        const oid = item[`${side}_sha`];
        if (oid === ZERO) continue;
        const size = Number(git(gitDir, ["cat-file", "-s", oid]).trim());
        assert(size <= 2 * 1024 * 1024, "File exceeds text inspection bound");
        const data = git(gitDir, ["cat-file", "blob", oid], { encoding: "buffer", maxBuffer: 2 * 1024 * 1024 + 1 });
        const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
        assert(!text.includes("\0"), "Binary content is not text-review evidence");
        item[`${side}_lines`] = lineCount(text);
      }
      const patch = git(gitDir, ["diff", "--no-ext-diff", "--no-textconv", "--unified=3", item.old_sha === ZERO ? empty : item.old_sha, item.new_sha === ZERO ? empty : item.new_sha, "--"], { maxBuffer: 8 * 1024 * 1024 });
      const bytes = Buffer.from(patch);
      if (bytes.length > diffBudget) {
        item.diff = bytes.subarray(0, diffBudget).toString("utf8");
        item.complete = false;
        item.omissions.push(`Diff truncated: ${bytes.length - diffBudget} bytes omitted`);
        diffBudget = 0;
      } else { item.diff = patch; diffBudget -= bytes.length; }
      if (!patch && item.old_mode !== item.new_mode) {
        item.complete = false;
        item.omissions.push("Mode-only change has no line evidence in this source-review contract");
      }
    } catch (error) {
      item.complete = false;
      item.omissions.push(`Diff unavailable: ${error.message.split("\n")[0]}`);
    }
    item.diff_sha256 = hash(item.diff);
    item.citation_ranges = prepareCitationRanges(item, mergeBase, headSha);
    provenance.push({ kind: "prepared", item: filename, outcome: item.complete ? "included" : "partial", sha256: item.diff_sha256, detail: item.omissions.join("; ") || "Bounded merge-base/head blob diff; not proof of reviewer comprehension" });
    files.push(item);
  }
  if (totalFiles > config.limits.max_files) omissions.push(`${totalFiles - config.limits.max_files} changed paths exceed the configured review count; all paths remain in the inventory`);
  const sources = new Map();
  function contextFor(ref, purpose) {
    const revision = ref.origin === "shared" ? shared.sha : ref.revision === "base" ? baseSha : headSha;
    assert(ref.origin === "shared" ? ref.revision === "release" : ["base", "head"].includes(ref.revision), "Source origin/revision mismatch");
    relativePath(ref.path);
    const key = `${ref.origin}:${revision}:${ref.path}`;
    if (sources.has(key)) return sources.get(key);
    const item = { id: `ctx-${hash(key).slice(0, 24)}`, origin: ref.origin, path: ref.path, revision,
      sha256: hash(""), content: "", lines: 0, complete: false, purpose };
    provenance.push({ kind: "available", item: item.id, outcome: "declared", sha256: "", detail: key });
    try {
      const data = blob(ref.origin === "shared" ? shared.gitDir : gitDir, revision, ref.path, contextBudget);
      Object.assign(item, { content: data.content, sha256: data.sha256, lines: data.lines, complete: true });
      contextBudget -= data.bytes;
    } catch (error) { omissions.push(`Context ${ref.path}: ${error.message.split("\n")[0]}`); }
    contexts.push(item); sources.set(key, item);
    provenance.push({ kind: "prepared", item: item.id, outcome: item.complete ? "included" : "unavailable", sha256: item.sha256, detail: key });
    return item;
  }
  const criteria = config.criteria.map(criterion => {
    const context = contextFor(criterion.source, "criterion");
    const applicable = criterion.path_prefixes.length === 0 || files.some(file => criterion.path_prefixes.some(prefix => file.path.startsWith(prefix) || file.old_path?.startsWith(prefix)));
    return { ...criterion, applicable, source_id: context.id, source_sha256: context.complete ? context.sha256 : "" };
  });
  for (const ref of config.context || []) contextFor(ref, "context");
  const policyDigest = hash(JSON.stringify({ config: source.sha256, contexts: contexts.map(({ origin, path: filename, revision, sha256 }) => ({ origin, path: filename, revision, sha256 })) }));
  const evidence = (options.evidence || []).filter(item => {
    const producerAllowed = item.method === "execution"
      ? (config.ci || []).some(rule => item.producer === `github-actions:${rule.workflow}`)
      : item.method === "human" && (config.human_approvers || []).some(login => item.producer === `github-review:${login}`);
    return producerAllowed && item.head_sha === headSha && item.policy_digest === policyDigest && item.criterion_ids.every(id => criteria.some(criterion => criterion.id === id));
  });
  const packet = { schema_version: 1, packet_id: "", repository, pr, run: options.run || { id: "local-preparation", attempt: 1 },
    shared: { repository: shared.repository, sha: shared.sha },
    snapshot: { base_sha: baseSha, head_sha: headSha, merge_base_sha: mergeBase, comparison: "merge-base-to-head" },
    policy: { config_path: options.configPath || "review.config.json", config_revision: options.policySha || baseSha, config_sha256: source.sha256, policy_digest: policyDigest, purpose: config.purpose },
    files, contexts, criteria, evidence, omissions, provenance,
    limitations: ["Prepared material is not proof of delivery, reading or comprehension", "Unobserved runtime and provider-internal context remain unavailable", "Single source reviewer; no independent specialist or fix verification", "Candidate PR scripts, builds and tests are not executed by this reviewer"] };
  if (!criteria.some(criterion => criterion.kind === "requirement" && criterion.applicable)) packet.limitations.push("No applicable authoritative requirement criterion is configured; defect review does not establish unspecified intent");
  packet.packet_id = hash(JSON.stringify(packet));
  const errors = validate("packet", packet);
  assert(!errors.length, errors.join("; "));
  return packet;
}

/**
 * Make copyable citations for each supplied hunk, with commit rather than blob
 * identities. Count complete retained lines only: a truncated hunk header may
 * promise more content than the packet actually includes.
 */
function prepareCitationRanges(file, mergeBase, headSha) {
  const ranges = [];
  let oldRange = null, newRange = null;
  for (const [, row] of file.diff.matchAll(/([^\n]*)\n/g)) {
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(row);
    if (hunk) {
      oldRange = file.old_path === null ? null : { path: file.old_path, revision: mergeBase, start_line: Number(hunk[1]), end_line: Number(hunk[1]) - 1 };
      newRange = file.status === "deleted" ? null : { path: file.path, revision: headSha, start_line: Number(hunk[2]), end_line: Number(hunk[2]) - 1 };
    } else {
      if (oldRange && (row.startsWith(" ") || row.startsWith("-"))) {
        if (oldRange.end_line < oldRange.start_line) ranges.push(oldRange);
        oldRange.end_line++;
      }
      if (newRange && (row.startsWith(" ") || row.startsWith("+"))) {
        if (newRange.end_line < newRange.start_line) ranges.push(newRange);
        newRange.end_line++;
      }
    }
  }
  return ranges;
}

// Model claims must reference the prepared inventory and supplied source ranges.
function citationValid(packet, citation) {
  if (citation.end_line < citation.start_line) return false;
  if (packet.contexts.some(item => item.complete && item.path === citation.path && item.revision === citation.revision && citation.end_line <= item.lines)) return true;
  return packet.files.some(file => file.citation_ranges.some(range =>
    range.path === citation.path && range.revision === citation.revision
    && citation.start_line >= range.start_line && citation.end_line <= range.end_line));
}

// A blob identifies content, not a revision. Resolve it only through the trusted
// path/side mapping and one retained hunk; never guess between distinct commits.
function resolveCitation(packet, citation) {
  if (citationValid(packet, citation) || citation.revision === ZERO || citation.end_line < citation.start_line) return citation;
  const revisions = new Set();
  for (const file of packet.files) {
    for (const side of ["old", "new"]) {
      const filename = side === "old" ? file.old_path : file.path;
      const revision = side === "old" ? packet.snapshot.merge_base_sha : packet.snapshot.head_sha;
      if (filename !== citation.path || file[`${side}_sha`] !== citation.revision) continue;
      if (file.citation_ranges.some(range => range.path === filename && range.revision === revision
        && citation.start_line >= range.start_line && citation.end_line <= range.end_line)) revisions.add(revision);
    }
  }
  return revisions.size === 1 ? { ...citation, revision: revisions.values().next().value } : citation;
}

/**
 * Validate untrusted model output against a trusted packet, without API calls.
 * Check complete inventories, applicability, citations and evidence ownership;
 * structural validity does not establish that a model's judgment is true.
 *
 * @returns {string[]} Validation errors; an empty array means the contract holds.
 */
function validateResult(packet, result) {
  return inspectResult(packet, result).errors;
}

function inspectResult(packet, result) {
  const errors = validate("result", result);
  const resolutions = [];
  if (errors.length) return { result, errors, resolutions };
  function resolveRecords(records) {
    return records.map(record => {
      let changed = false;
      const citations = record.citations.map(citation => {
        const resolved = resolveCitation(packet, citation);
        if (resolved !== citation) {
          changed = true;
          resolutions.push({ kind: "model_cited", item: record.id, outcome: "resolved", sha256: "",
            detail: `Trusted packet resolved ${citation.path}:${citation.start_line}-${citation.end_line} from blob ${citation.revision} to commit ${resolved.revision}; raw reviewer output is unchanged` });
        }
        return resolved;
      });
      return changed ? { ...record, citations } : record;
    });
  }
  result = { ...result, findings: resolveRecords(result.findings), review_evidence: resolveRecords(result.review_evidence) };
  if (result.packet_id !== packet.packet_id) errors.push("Result packet identity does not match prepared snapshot");
  function inventory(actual, expected, key, label) {
    const ids = actual.map(item => item[key]);
    if (new Set(ids).size !== ids.length || ids.length !== expected.length || expected.some(item => !ids.includes(item[key]))) errors.push(`${label} inventory must contain every prepared item exactly once`);
  }
  inventory(result.coverage, packet.files, "path", "Coverage");
  inventory(result.criteria, packet.criteria, "id", "Criterion");
  for (const coverage of result.coverage) {
    if (coverage.disposition === "reviewed" && !packet.files.find(file => file.path === coverage.path)?.complete) errors.push(`Incomplete file cannot be reviewed: ${coverage.path}`);
  }
  const findingIds = new Set();
  for (const finding of result.findings) {
    if (findingIds.has(finding.id)) errors.push(`Duplicate finding: ${finding.id}`);
    findingIds.add(finding.id);
    for (const citation of finding.citations) if (!citationValid(packet, citation)) errors.push(`Finding ${finding.id} cites outside prepared snapshot/content`);
  }
  const evidence = new Map(packet.evidence.map(item => [item.id, item]));
  for (const item of result.review_evidence) {
    if (evidence.has(item.id)) errors.push(`Duplicate evidence ID: ${item.id}`);
    const criterion = packet.criteria.find(candidate => candidate.id === item.criterion_id);
    const source = packet.contexts.find(context => context.id === criterion?.source_id);
    if (!criterion?.applicable) errors.push(`Unknown or inapplicable evidence criterion: ${item.criterion_id}`);
    if (!item.citations.some(citation => source && citation.path === source.path && citation.revision === source.revision)) errors.push(`Evidence ${item.id} does not cite its criterion source`);
    if (!item.citations.some(citation => packet.files.some(file => (citation.path === file.path && citation.revision === packet.snapshot.head_sha) || (citation.path === file.old_path && citation.revision === packet.snapshot.merge_base_sha)))) errors.push(`Evidence ${item.id} does not connect the criterion to the changed source`);
    if (item.citations.some(citation => !citationValid(packet, citation))) errors.push(`Evidence ${item.id} cites outside prepared snapshot/content`);
    evidence.set(item.id, { ...item, method: "review", criterion_ids: [item.criterion_id], outcome: "passed" });
  }
  for (const item of result.criteria) {
    const criterion = packet.criteria.find(candidate => candidate.id === item.id);
    if (!criterion) continue;
    if ((item.disposition === "not_applicable") !== !criterion.applicable) errors.push(`Applicability conflicts with trusted policy: ${item.id}`);
    const records = item.evidence_ids.map(id => evidence.get(id));
    if (new Set(item.evidence_ids).size !== item.evidence_ids.length || records.some(record => !record || !record.criterion_ids.includes(item.id))) errors.push(`Unknown, duplicate or wrong-criterion evidence: ${item.id}`);
    for (const record of records.filter(Boolean)) {
      if (record.method !== "review" && (record.head_sha !== packet.snapshot.head_sha || record.policy_digest !== packet.policy.policy_digest)) errors.push(`Stale evidence: ${record.id}`);
      if (!criterion.required_methods.includes(record.method)) errors.push(`Unaccepted evidence method: ${record.id}`);
    }
    if (item.disposition === "satisfied" && criterion.required_methods.some(method => !records.some(record => record?.method === method && record.outcome === "passed"))) errors.push(`Insufficient evidence for satisfied criterion: ${item.id}`);
    if (item.disposition === "failed" && !records.some(record => record && (record.method === "review" || record.outcome === "failed"))) errors.push(`Missing failure evidence: ${item.id}`);
    if (item.disposition === "human_decision_required" && !criterion.required_methods.includes("human")) errors.push(`No human verifier required by policy: ${item.id}`);
  }
  return { result, errors, resolutions };
}


/**
 * Combine a packet, model result and trusted execution observations into a report.
 *
 * The caller supplies execution, events, freshly checked currentEvidence and
 * currentHeadSha/currentBaseSha/currentPolicyDigest. Validate the submitted
 * result against the original packet; freshness changes only acceptance claims.
 * Missing current evidence is not treated as renewed evidence. No API calls occur here.
 *
 * Invalid model output becomes explicit unreviewed coverage; valid partial
 * findings survive failed/cancelled execution. Material defects take precedence
 * over incomplete evidence, which takes precedence over pending human decisions.
 * Execution state, defect judgment and evidence readiness remain separate.
 *
 * @returns {object} Schema-valid report; merge authority always stays external.
 */
function finalizeReport(packet, input, options = { execution: "success" }) {
  const execution = options.execution || "success";
  assert(["success", "failure", "cancelled", "skipped"].includes(execution), "Unknown execution outcome");
  const checked = inspectResult(packet, input);
  const { errors } = checked;
  const valid = errors.length === 0;
  const result = valid ? checked.result : {
    assessment: "No valid complete reviewer result is available.",
    coverage: packet.files.map(file => ({ path: file.path, disposition: "unreviewed", reason: "Missing or invalid structured result" })),
    findings: [], criteria: packet.criteria.map(criterion => ({ id: criterion.id, disposition: criterion.applicable ? "unverified" : "not_applicable", reason: "No valid evidence-bearing result", evidence_ids: [] })), review_evidence: [], limitations: []
  };
  const fresh = new Map((options.currentEvidence || []).map(record => [record.id, JSON.stringify(record)]));
  const currentEvidence = packet.evidence.filter(record => fresh.get(record.id) === JSON.stringify(record));
  const currentIds = new Set(currentEvidence.map(record => record.id));
  const reviewIds = new Set(result.review_evidence.map(record => record.id));
  const criteria = result.criteria.map(item => {
    const evidenceIds = item.evidence_ids.filter(id => currentIds.has(id) || reviewIds.has(id));
    if (evidenceIds.length === item.evidence_ids.length) return item;
    const criterion = packet.criteria.find(criterion => criterion.id === item.id);
    const records = currentEvidence.filter(record => evidenceIds.includes(record.id));
    const hasReview = evidenceIds.some(id => reviewIds.has(id));
    const supported = item.disposition === "satisfied"
      ? criterion.required_methods.every(method => method === "review" ? hasReview : records.some(record => record.method === method && record.outcome === "passed"))
      : item.disposition !== "failed" || hasReview || records.some(record => record.outcome === "failed");
    return { ...item, disposition: supported ? item.disposition : "unverified", evidence_ids: evidenceIds,
      reason: `Freshness checks withdrew ${item.evidence_ids.length - evidenceIds.length} referenced evidence record(s); the prepared ${item.disposition} claim ${supported ? "remains supported by current evidence" : "requires re-verification"}.` };
  });
  if (options.currentHeadSha !== packet.snapshot.head_sha) errors.push("PR head changed or could not be revalidated");
  if (options.currentBaseSha !== packet.snapshot.base_sha) errors.push("PR base changed or could not be revalidated");
  if (options.currentPolicyDigest !== packet.policy.policy_digest) errors.push("Requirement/configuration source identity changed or could not be revalidated");
  const events = options.events || [];
  const runtimeComplete = events.some(event => event.kind === "runtime_state" && event.item === "turn" && event.outcome === "completed");
  if (!runtimeComplete) errors.push("No observed successful runtime completion; delivery beyond prepared inputs is unproven");
  const incomplete = errors.length > 0 || packet.omissions.length > 0 || result.coverage.some(item => item.disposition !== "reviewed") || packet.files.some(item => !item.complete) || packet.contexts.some(item => !item.complete);
  const required = packet.criteria.filter(item => item.required && item.applicable);
  const blocking = valid && (result.findings.some(item => ["high", "medium"].includes(item.severity)) || required.some(item => criteria.find(value => value.id === item.id)?.disposition === "failed"));
  let human = false, missing = !packet.criteria.some(item => item.kind === "requirement" && item.applicable);
  for (const criterion of required) {
    const item = criteria.find(value => value.id === criterion.id);
    if (item?.disposition === "satisfied" || item?.disposition === "failed") continue;
    if (item?.disposition === "human_decision_required") {
      human = true;
      const ids = new Set(item.evidence_ids);
      for (const method of criterion.required_methods.filter(value => value !== "human")) {
        const present = method === "review" ? result.review_evidence.some(record => ids.has(record.id) && record.criterion_id === criterion.id)
          : currentEvidence.some(record => ids.has(record.id) && record.criterion_ids.includes(criterion.id) && record.method === method && record.outcome === "passed");
        if (!present) missing = true;
      }
    } else missing = true;
  }
  // A known blocker must remain visible even when the rest of the review is incomplete.
  const readiness = blocking ? "blocked" : incomplete || missing || execution !== "success" ? "incomplete" : human ? "needs_human_decision" : "evidence_ready";
  const provenance = [...packet.provenance, ...events, ...result.review_evidence.map(item => ({ kind: "model_cited", item: item.id, outcome: "claimed", sha256: "", detail: `Static evidence for ${item.criterion_id}; model judgment is not execution proof` })), { kind: "unobservable", item: "provider-context", outcome: "unavailable", sha256: "", detail: "Prepared inputs and supported runtime events do not attest all injected/compacted/provider context or comprehension" }];
  if (valid) provenance.push(...checked.resolutions);
  const report = { schema_version: 1, packet_id: packet.packet_id, repository: packet.repository, pr: packet.pr, snapshot: packet.snapshot, policy: packet.policy, shared: packet.shared,
    execution_state: execution === "cancelled" ? "cancelled" : execution === "skipped" ? "skipped" : execution === "failure" ? "failed" : incomplete ? "incomplete" : "completed",
    defect_judgment: !valid ? "unavailable" : result.findings.length ? "findings" : incomplete || execution !== "success" ? "unavailable" : "no_findings", readiness, merge_authority: "human_and_repository_rules",
    assessment: result.assessment, coverage: result.coverage, findings: result.findings, criteria, review_evidence: result.review_evidence, evidence: currentEvidence, provenance,
    errors, limitations: [...packet.limitations, ...packet.omissions, ...result.limitations, ...(options.evidenceLimitations || [])] };
  const reportErrors = validate("report", report);
  assert(!reportErrors.length, reportErrors.join("; "));
  return report;
}
function escapeMarkdown(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/([\\`*_{}\[\]()#+.!|~-])/g, "\\$1").replace(/\r?\n/g, "<br>");
}

/** Render a validated report, escaping model/source text rather than trusting Markdown. */
function renderReport(report) {
  const text = escapeMarkdown;
  const lines = ["# Change review", "", `Repository: ${text(report.repository)}; PR: ${report.pr}`, `Execution: **${report.execution_state}**; defects: **${report.defect_judgment}**; evidence readiness: **${report.readiness}**`, "", "Acceptance and merge remain human decisions under repository rules.", "", "## Snapshot", "", `- Base tip: ${report.snapshot.base_sha}`, `- Old-side merge base: ${report.snapshot.merge_base_sha}`, `- New-side head: ${report.snapshot.head_sha}`, `- Shared release: ${text(report.shared.repository)}@${report.shared.sha}`, `- Policy digest: ${report.policy.policy_digest}`, `- Packet: ${report.packet_id}`, "", "## Assessment", "", text(report.assessment), "", "## Coverage", ""];
  for (const item of report.coverage) lines.push(`- ${text(item.path)}: **${item.disposition}** — ${text(item.reason)}`);
  lines.push("", "## Acceptance evidence", "");
  for (const item of report.criteria) lines.push(`- ${text(item.id)}: **${item.disposition}** — ${text(item.reason)}; evidence: ${item.evidence_ids.map(text).join(", ") || "none"}`);
  lines.push("", "## Findings", "");
  for (const item of report.findings) {
    lines.push(`### ${text(item.id)}: ${text(item.title)} (${item.severity})`, "", text(item.impact));
    for (const citation of item.citations) lines.push(`- ${text(citation.path)}:${citation.start_line}-${citation.end_line} @ ${citation.revision}`);
  }
  if (!report.findings.length) lines.push(report.defect_judgment === "no_findings" ? "No issue findings in the completed source review." : "No validated findings available; this is not a clean-review claim.");
  lines.push("", "## Evidence records", "");
  for (const item of report.review_evidence) {
    lines.push(`- ${text(item.id)}: model-assisted review for ${text(item.criterion_id)} — ${text(item.explanation)}`);
    for (const citation of item.citations) lines.push(`  - ${text(citation.path)}:${citation.start_line}-${citation.end_line} @ ${citation.revision}`);
  }
  for (const item of report.evidence) lines.push(`- ${text(item.id)}: ${item.method}/${item.outcome}, ${text(item.producer)} — ${text(item.detail)}; ${text(item.url)}`);
  lines.push("", "## Observations and limitations", "");
  for (const item of report.provenance) lines.push(`- ${item.kind}: ${text(item.item)} — ${text(item.outcome)}; ${text(item.detail)}`);
  for (const item of [...report.errors, ...report.limitations]) lines.push(`- ${text(item)}`);
  return lines.join("\n") + "\n";
}

// External evidence is collected only by trusted host jobs, never supplied by the
// model. Producer approval comes from trusted consumer configuration.
function api(endpoint) {
  return JSON.parse(execFileSync("gh", ["api", "--method", "GET", endpoint], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024, timeout: 60000 }));
}
function apiBlob(repository, revision, filename, limit) {
  relativePath(filename);
  const response = api(`repos/${repository}/contents/${filename.split("/").map(encodeURIComponent).join("/")}?ref=${revision}`);
  assert(response.type === "file" && response.encoding === "base64" && response.size <= limit, "Evidence source is not a bounded regular GitHub file");
  const bytes = Buffer.from(response.content, "base64");
  assert(bytes.length === response.size, "Incomplete evidence source response");
  return { content: bytes.toString("utf8"), sha256: hash(bytes) };
}
function pages(endpoint) {
  const result = [];
  for (let page = 1; page <= 30; page++) {
    const value = api(`${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    const items = Array.isArray(value) ? value : value.workflow_runs || value.jobs || value.artifacts;
    assert(Array.isArray(items), "Unexpected GitHub list response");
    result.push(...items);
    if (items.length < 100) return result;
  }
  throw new Error("GitHub evidence pagination exceeds bound");
}

/**
 * Collect criterion-level attestations from configured GitHub CI and reviewers.
 * Verify producer/source identity and head/policy binding rather than treating
 * a green workflow or an arbitrary approval link as acceptance evidence.
 *
 * directory supplies local consumer Git objects during preparation; finalization
 * passes null and uses authenticated file API reads instead. Return diagnostics
 * alongside evidence without mutating the prepared packet. Missing or invalid
 * sources yield no usable evidence; an empty result is not successful verification.
 */
function authenticatedEvidence(packet, config, directory, metadata) {
  const evidence = [], limitations = [];
  for (const rule of config.ci || []) {
    try {
      // Candidate edits cannot redefine the verifier that certifies this run.
      for (const filename of [rule.workflow, ...rule.verifier_paths]) {
        const get = revision => directory ? blob(directory, revision, filename, 2 * 1024 * 1024) : apiBlob(packet.repository, revision, filename, 2 * 1024 * 1024);
        const old = get(packet.policy.config_revision);
        const current = get(packet.snapshot.head_sha);
        assert(old.sha256 === current.sha256, `Changed verifier requires approval: ${filename}`);
      }
      const runs = pages(`repos/${packet.repository}/actions/workflows/${encodeURIComponent(rule.workflow)}/runs?head_sha=${packet.snapshot.head_sha}`);
      const run = runs.filter(item => item.head_sha === packet.snapshot.head_sha && item.repository?.full_name === packet.repository && item.path === rule.workflow && ["push", "pull_request"].includes(item.event)).sort((a, b) => b.id - a.id)[0];
      assert(run && run.status === "completed" && ["success", "failure"].includes(run.conclusion), "No completed authenticated unchanged verifier run");
      const artifacts = pages(`repos/${packet.repository}/actions/runs/${run.id}/artifacts`).filter(item => item.name === rule.artifact && !item.expired);
      assert(artifacts.length === 1 && artifacts[0].size_in_bytes < 1024 * 1024, "Missing or ambiguous bounded CI evidence artifact");
      const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "review-ci-evidence-"));
      try {
        const archive = execFileSync("gh", ["api", "--method", "GET", `repos/${packet.repository}/actions/artifacts/${artifacts[0].id}/zip`], { maxBuffer: 1024 * 1024, timeout: 60000 });
        const archivePath = path.join(temporary, "evidence.zip");
        fs.writeFileSync(archivePath, archive);
        // Read a named member; never extract attacker-controlled archive paths.
        const data = JSON.parse(execFileSync("unzip", ["-p", archivePath, "review-evidence.json"], { encoding: "utf8", maxBuffer: 1024 * 1024, timeout: 10000 }));
        assert(!validate("executionEvidence", data).length && data.head_sha === packet.snapshot.head_sha && data.policy_digest === packet.policy.policy_digest, "Stale or malformed CI criterion evidence");
        assert(new Set(data.criteria.map(item => item.id)).size === data.criteria.length, "Duplicate CI criterion evidence");
        for (const item of data.criteria) {
          assert(packet.criteria.some(criterion => criterion.id === item.id && criterion.required_methods.includes("execution")) && ["passed", "failed"].includes(item.outcome) && typeof item.check === "string" && item.check.length > 0 && item.check.length <= 4000, "Invalid criterion-level CI record");
          evidence.push({ id: `ci-${run.id}-${item.id}`, method: "execution", outcome: item.outcome === "passed" && run.conclusion !== "success" ? "unverified" : item.outcome, criterion_ids: [item.id], head_sha: data.head_sha, policy_digest: data.policy_digest, producer: `github-actions:${rule.workflow}`, url: `https://github.com/${packet.repository}/actions/runs/${run.id}`, detail: `${item.check}; verifier workflow conclusion: ${run.conclusion}` });
        }
      } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
    } catch (error) {
      limitations.push(`Execution evidence unavailable for ${rule.workflow}: ${error.message.split("\n")[0]}`);
    }
  }
  if ((config.human_approvers || []).length) {
    try {
      const reviews = pages(`repos/${packet.repository}/pulls/${packet.pr}/reviews`).sort((a, b) => a.id - b.id);
      const latest = new Map();
      for (const review of reviews) if (["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(review.state)) latest.set(review.user?.login, review);
      for (const [login, review] of latest) {
        if (!config.human_approvers.includes(login) || login === metadata.user?.login || review.state !== "APPROVED" || review.commit_id !== packet.snapshot.head_sha) continue;
        const block = /```review-acceptance\s*\n([\s\S]*?)\n```/.exec(review.body || "");
        if (!block) continue;
        let data; try { data = JSON.parse(block[1]); } catch { continue; }
        if (validate("humanAcceptance", data).length || data.head_sha !== packet.snapshot.head_sha || data.policy_digest !== packet.policy.policy_digest) continue;
        for (const id of new Set(data.criteria)) if (packet.criteria.some(item => item.id === id && item.required_methods.includes("human"))) evidence.push({ id: `human-${review.id}-${id}`, method: "human", outcome: "passed", criterion_ids: [id], head_sha: data.head_sha, policy_digest: data.policy_digest, producer: `github-review:${login}`, url: `https://github.com/${packet.repository}/pull/${packet.pr}#pullrequestreview-${review.id}`, detail: "Named non-author approver accepted this criterion for the exact head and policy digest" });
      }
    } catch (error) { limitations.push(`Human evidence unavailable: ${error.message.split("\n")[0]}`); }
  }
  return { evidence, limitations };
}


/**
 * Trusted host command entrypoint; Node, Git, gh and unzip are runtime dependencies.
 *
 * prepare --output DIR
 *   Required environment: GH_TOKEN, REVIEW_REPOSITORY, REVIEW_PR,
 *   REVIEW_SHARED_REPOSITORY, REVIEW_SHARED_SHA.
 *   REVIEW_POLICY_SHA and REVIEW_CONFIG_PATH select trusted consumer policy;
 *   GitHub run ID/attempt metadata is recorded when available.
 *   Writes packet.json, result.schema.json and an initial incomplete report.
 *
 * finalize --packet FILE --result FILE --runtime-log FILE --execution STATE --output DIR
 *   Uses GH_TOKEN for current-state/evidence checks and consumes the collector's
 *   normalized runtime.json, not raw Codex JSONL.
 *   Writes report.json/report.md and copies the original packet into DIR.
 *
 * DIR must be new. After creating it, operational failures retain failure.json.
 * Missing/malformed model output yields an incomplete report and nonzero exit.
 * Exit status reports execution health, not acceptance: a completed review with
 * blocking findings can exit zero. Consumers must inspect report readiness.
 */
function cli(args) {
  const command = args.shift();
  assert(["prepare", "finalize"].includes(command), "Usage: node scripts/review-change.js prepare|finalize --output DIRECTORY [--packet FILE --result FILE --runtime-log FILE --execution STATE]");
  const flags = {};
  while (args.length) {
    const key = args.shift();
    assert(["--output", "--packet", "--result", "--runtime-log", "--execution"].includes(key) && args.length && !Object.hasOwn(flags, key), "Unknown, duplicate or missing command argument");
    flags[key] = args.shift();
  }
  assert(flags["--output"], "An explicit output directory is required");
  const output = path.resolve(flags["--output"]);
  assert(!fs.existsSync(output), "Output directory must be new");
  fs.mkdirSync(output, { recursive: true });
  try {
    if (command === "prepare") {
      const repository = process.env.REVIEW_REPOSITORY;
      const number = process.env.REVIEW_PR;
      assert(REPOSITORY.test(repository || "") && /^[1-9][0-9]*$/.test(number || ""), "Invalid consumer or PR input");
      const metadata = api(`repos/${repository}/pulls/${number}`);
      assert(metadata.base.repo.full_name === repository && SHA.test(metadata.base.sha) && SHA.test(metadata.head.sha), "Invalid authenticated PR identity");
      const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "review-objects-"));
      try {
        git(temporary, ["init", "--bare"]);
        const token = process.env.GH_TOKEN;
        assert(token, "Read-only GitHub authentication is required");
        const auth = Buffer.from(`x-access-token:${token}`).toString("base64");
        const fetchEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader", GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${auth}` };
        const policySha = process.env.REVIEW_POLICY_SHA || metadata.base.sha;
        assert(SHA.test(policySha), "Consumer policy requires an immutable trusted revision");
        git(temporary, ["fetch", "--no-tags", "--no-recurse-submodules", `https://github.com/${repository}.git`, metadata.base.sha, policySha, `refs/pull/${number}/head`], { env: fetchEnv, stdio: ["ignore", "pipe", "pipe"] });
        const options = { gitDir: temporary, repository, pr: Number(number), baseSha: metadata.base.sha, headSha: metadata.head.sha,
          shared: { repository: process.env.REVIEW_SHARED_REPOSITORY, sha: process.env.REVIEW_SHARED_SHA, gitDir: path.resolve(__dirname, "..") },
          policySha, configPath: process.env.REVIEW_CONFIG_PATH || "review.config.json", run: { id: process.env.GITHUB_RUN_ID || "local-preparation", attempt: Number(process.env.GITHUB_RUN_ATTEMPT || "1") } };
        const packet = preparePacket(options);
        const external = authenticatedEvidence(packet, readConfig(options).config, temporary, metadata);
        packet.evidence = external.evidence;
        packet.limitations.push(...external.limitations);
        const after = api(`repos/${repository}/pulls/${number}`);
        if (after.base.sha !== metadata.base.sha || after.head.sha !== metadata.head.sha) packet.omissions.push("PR revisions moved during preparation");
        if (packet.files.length !== metadata.changed_files) packet.omissions.push("Git inventory count differs from authenticated PR metadata; inspect omitted scope");
        packet.packet_id = "";
        packet.packet_id = hash(JSON.stringify(packet));
        fs.writeFileSync(path.join(output, "packet.json"), json(packet));
        fs.writeFileSync(path.join(output, "result.schema.json"), json(buildResultSchema()));
        const initial = finalizeReport(packet, null, { execution: "skipped" });
        fs.writeFileSync(path.join(output, "report.json"), json(initial));
        fs.writeFileSync(path.join(output, "report.md"), renderReport(initial));
        if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `packet_id=${packet.packet_id}\nbase_sha=${packet.snapshot.base_sha}\nhead_sha=${packet.snapshot.head_sha}\nmerge_base_sha=${packet.snapshot.merge_base_sha}\npolicy_digest=${packet.policy.policy_digest}\n`);
      } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
    } else {
      const packet = JSON.parse(readBounded(flags["--packet"], 8 * 1024 * 1024));
      assert(!validate("packet", packet).length, "Invalid trusted packet");
      let result = null, events = [];
      try { result = JSON.parse(readBounded(flags["--result"])); } catch { /* Missing/partial result remains incomplete. */ }
      try {
        const collected = JSON.parse(readBounded(flags["--runtime-log"], 16 * 1024 * 1024));
        assert(!validate("events", collected).length, "Invalid collected runtime events");
        events = collected;
      } catch { /* Absence is reported, not fabricated as zero activity. */ }
      let currentHeadSha = null, currentBaseSha = null, currentPolicyDigest = null;
      let currentEvidence = [], evidenceLimitations = [];
      try {
        const current = api(`repos/${packet.repository}/pulls/${packet.pr}`);
        currentHeadSha = current.head.sha; currentBaseSha = current.base.sha;
        const source = apiBlob(packet.repository, packet.policy.config_revision, packet.policy.config_path, 128 * 1024);
        assert(source.sha256 === packet.policy.config_sha256, "Trusted configuration digest no longer matches");
        const config = JSON.parse(source.content);
        assert(!validate("config", config).length, "Invalid trusted evidence configuration");
        const external = authenticatedEvidence(packet, config, null, current);
        currentEvidence = external.evidence;
        evidenceLimitations = external.limitations;
        currentPolicyDigest = currentHeadSha === packet.snapshot.head_sha && currentBaseSha === packet.snapshot.base_sha ? packet.policy.policy_digest : null;
      } catch {
        // The submitted review remains valid against its original packet even
        // when current external evidence cannot support its acceptance claims.
        evidenceLimitations.push("External criterion evidence could not be revalidated");
      }
      const report = finalizeReport(packet, result, { execution: flags["--execution"] || "failure", events, currentHeadSha, currentBaseSha, currentPolicyDigest, currentEvidence, evidenceLimitations });
      fs.writeFileSync(path.join(output, "report.json"), json(report));
      fs.writeFileSync(path.join(output, "report.md"), renderReport(report));
      fs.copyFileSync(flags["--packet"], path.join(output, "packet.json"));
      if (["failed", "cancelled", "incomplete", "skipped"].includes(report.execution_state)) {
        process.exitCode = 1;
        console.error(`Review finalization ${report.execution_state}: ${report.errors.join("; ") || "Prepared inputs or review coverage are incomplete; inspect report.json"}`);
      }
    }
  } catch (error) {
    // Operational state exists even when no packet could be prepared. Never a success substitute.
    fs.writeFileSync(path.join(output, "failure.json"), json({ schema_version: 1, execution_state: "failed", readiness: "incomplete", merge_authority: "human_and_repository_rules", error: String(error.message).split("\n")[0] }));
    process.exitCode = 1;
    console.error("Review preparation/finalization failed; inspect the retained failure record.");
  }
}
if (require.main === module) cli(process.argv.slice(2));
module.exports = { preparePacket, validateResult, finalizeReport, renderReport, buildResultSchema };

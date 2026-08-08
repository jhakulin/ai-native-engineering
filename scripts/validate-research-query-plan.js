#!/usr/bin/env node
const path = require("path");
const { loadTarget, getTargetName, getResearchDate, getResearchRunId, inboxDir, readJson } = require("./research-lib");

const targetName = getTargetName();
const date = getResearchDate();
const runId = getResearchRunId();
const errors = [];
function fail(message) { errors.push(message); }

try {
  const target = loadTarget(targetName);
  const planning = target.dynamic_query_planning || {};
  const plan = readJson(path.join(inboxDir(target, date), "query-plan.json"));
  const maxQueries = planning.max_dynamic_queries ?? 2;
  const defaultMaxResults = planning.max_results ?? 6;
  const defaultCandidatePool = planning.candidate_pool ?? 12;
  const maxQueryTerms = planning.max_query_terms ?? 6;
  const normalizeQuery = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  const countQueryTerms = (value) => String(value || "").trim().split(/\s+/).filter(Boolean).length;
  const fixedQueries = new Set((target.youtube_searches || []).map((item) => normalizeQuery(item.query)));
  const seen = new Set();

  if (plan.target !== target.name) fail(`query-plan.target must be ${target.name}`);
  if (plan.date !== date) fail(`query-plan.date must be ${date}`);
  if (plan.run_id !== runId) fail(`query-plan.run_id must be ${runId}`);
  if (!Array.isArray(plan.dynamic_queries)) fail("query-plan.dynamic_queries must be an array");
  if ((plan.dynamic_queries || []).length > maxQueries) fail(`query-plan has more than ${maxQueries} dynamic queries`);

  for (const [index, item] of (plan.dynamic_queries || []).entries()) {
    const query = item.query || "";
    if (typeof query !== "string" || query.trim().length < 8) fail(`dynamic_queries[${index}].query is too short`);
    if (query.length > 160) fail(`dynamic_queries[${index}].query is too long`);
    if (countQueryTerms(query) > maxQueryTerms) fail(`dynamic_queries[${index}].query must contain at most ${maxQueryTerms} search terms`);
    if (/["“”]/.test(query)) fail(`dynamic_queries[${index}].query must not contain quoted phrases`);
    if (/https?:\/\//i.test(query)) fail(`dynamic_queries[${index}].query must not be a URL`);
    if (/[;&|`$<>]/.test(query)) fail(`dynamic_queries[${index}].query contains disallowed shell/control characters`);
    const normalizedQuery = normalizeQuery(query);
    if (fixedQueries.has(normalizedQuery)) fail(`dynamic_queries[${index}].query duplicates a fixed query`);
    if (seen.has(normalizedQuery)) fail(`dynamic_queries[${index}].query duplicates another dynamic query`);
    seen.add(normalizedQuery);
    if (!item.purpose) fail(`dynamic_queries[${index}].purpose is required`);
    if (String(item.purpose || "").length > 300) fail(`dynamic_queries[${index}].purpose exceeds 300 characters`);
    if (!item.rationale) fail(`dynamic_queries[${index}].rationale is required`);
    if (String(item.rationale || "").length > 500) fail(`dynamic_queries[${index}].rationale exceeds 500 characters`);
    if ((item.sort || planning.sort || "latest") !== "latest") fail(`dynamic_queries[${index}].sort must be latest`);
    if (!Number.isInteger(item.max_results) || item.max_results < 1 || item.max_results > defaultMaxResults) fail(`dynamic_queries[${index}].max_results must be 1..${defaultMaxResults}`);
    if (!Number.isInteger(item.candidate_pool) || item.candidate_pool < item.max_results || item.candidate_pool > defaultCandidatePool) fail(`dynamic_queries[${index}].candidate_pool must be between max_results and ${defaultCandidatePool}`);
  }

  if (plan.web_findings !== undefined) {
    if (!Array.isArray(plan.web_findings)) fail("query-plan.web_findings must be an array when present");
    if ((plan.web_findings || []).length > 5) fail("query-plan.web_findings must contain at most 5 compact findings");
    for (const [index, finding] of (plan.web_findings || []).entries()) {
      if (typeof finding === "string") {
        if (finding.length > 500) fail(`query-plan.web_findings[${index}] exceeds 500 characters`);
        if (/^web finding$/i.test(finding.trim())) fail(`query-plan.web_findings[${index}] is not descriptive`);
        continue;
      }
      if (!finding || typeof finding !== "object") {
        fail(`query-plan.web_findings[${index}] must be a string or object`);
        continue;
      }
      if (!finding.finding) fail(`query-plan.web_findings[${index}].finding is required`);
      if (String(finding.finding || "").length > 500) fail(`query-plan.web_findings[${index}].finding exceeds 500 characters`);
      if (String(finding.title || "").length > 140) fail(`query-plan.web_findings[${index}].title exceeds 140 characters`);
      if (String(finding.used_for || "").length > 200) fail(`query-plan.web_findings[${index}].used_for exceeds 200 characters`);
      if (String(finding.source_type || "").length > 80) fail(`query-plan.web_findings[${index}].source_type exceeds 80 characters`);
      if (finding.url && !/^https:\/\//i.test(finding.url)) fail(`query-plan.web_findings[${index}].url must start with https://`);
      if (finding.url && String(finding.url).length > 500) fail(`query-plan.web_findings[${index}].url exceeds 500 characters`);
    }
  }

  if (errors.length) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }
  console.log("Research query plan validation passed.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

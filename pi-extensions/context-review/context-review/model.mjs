export const STATS_SCHEMA_VERSION = 1;

export const SCOPES = Object.freeze({
  ACTIVE: "active_reconstructed_context",
  ACTIVE_IN_MEMORY: "active_in_memory_startup_context",
  ACTIVE_MESSAGES: "active_reconstructed_messages",
  LATEST_PERSISTED_BRANCH: "latest_persisted_branch_candidate",
  LATEST_RESPONSE: "latest_provider_response",
  CUMULATIVE: "cumulative_inspected_session",
});

export const EVIDENCE = Object.freeze({
  EXACT: "exact_persisted",
  PROVIDER: "provider_reported",
  OBSERVED: "exact_observed",
  RECONSTRUCTED: "reconstructed",
  SERIALIZED: "exact_serialized_local_representation",
  UNAVAILABLE: "unavailable",
});

export function metric(id, name, value, unit, scope, evidence, source, limitation = undefined) {
  return {
    id,
    name,
    value: value ?? null,
    unit,
    scope,
    evidence,
    source,
    approximate: false,
    limitation: limitation ?? null,
  };
}

export function unavailableMetric(id, name, unit, scope, source, limitation) {
  return metric(id, name, null, unit, scope, EVIDENCE.UNAVAILABLE, source, limitation);
}

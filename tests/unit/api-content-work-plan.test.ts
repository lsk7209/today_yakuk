import assert from "node:assert/strict";
import { ApiContentCandidate, planApiContentWork, sortApiContentWork } from "../../src/lib/api-content-work-plan";

const candidate = (overrides: Partial<ApiContentCandidate>): ApiContentCandidate => ({
  kind: "changed", routeType: "wiki_medicine", entityId: "1", title: "test",
  missingFields: "", reviewRequirement: "medical_source_and_type_review", ...overrides,
});

assert.deepEqual(
  planApiContentWork(candidate({ kind: "new", routeType: "pharmacy_detail" })),
  { ...candidate({ kind: "new", routeType: "pharmacy_detail" }), readiness: "ready_for_review", priority: "P1", workType: "create_or_refresh_detail" },
);
assert.equal(planApiContentWork(candidate({ routeType: "pharmacy_detail" })).workType, "refresh_existing_detail");
assert.equal(planApiContentWork(candidate({ routeType: "wiki_supplement" })).workType, "review_existing_wiki");
assert.deepEqual(
  planApiContentWork(candidate({ missingFields: "warning" })),
  { ...candidate({ missingFields: "warning" }), readiness: "source_fields_required", priority: "HOLD", workType: "fill_source_fields" },
);

const sorted = sortApiContentWork([
  planApiContentWork(candidate({ entityId: "3", missingFields: "warning" })),
  planApiContentWork(candidate({ entityId: "2" })),
  planApiContentWork(candidate({ kind: "new", routeType: "pharmacy_detail", entityId: "1" })),
]);
assert.deepEqual(sorted.map(({ priority, entityId }) => ({ priority, entityId })), [
  { priority: "P1", entityId: "1" }, { priority: "P2", entityId: "2" }, { priority: "HOLD", entityId: "3" },
]);

console.log("api-content-work-plan tests passed");

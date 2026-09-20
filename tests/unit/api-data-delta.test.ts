import assert from "node:assert/strict";
import { classifyDelta, parseCsvLine } from "../../src/lib/api-data-delta";

assert.deepEqual(parseCsvLine('"a","b, c","d""e"'), ["a", "b, c", 'd"e']);

const result = classifyDelta(
  [
    { routeType: "pharmacy_detail", entityId: "1", contentHash: "same" },
    { routeType: "wiki_medicine", entityId: "2", contentHash: "old" },
    { routeType: "wiki_supplement", entityId: "3", contentHash: "gone" },
  ],
  [
    { routeType: "pharmacy_detail", entityId: "1", contentHash: "same", title: "same", missingFields: "" },
    { routeType: "wiki_medicine", entityId: "2", contentHash: "new", title: "changed", missingFields: "warning" },
    { routeType: "pharmacy_detail", entityId: "4", contentHash: "fresh", title: "new", missingFields: "" },
  ],
);

assert.deepEqual(result.map(({ kind, routeType, entityId }) => ({ kind, routeType, entityId })), [
  { kind: "new", routeType: "pharmacy_detail", entityId: "4" },
  { kind: "changed", routeType: "wiki_medicine", entityId: "2" },
  { kind: "missing", routeType: "wiki_supplement", entityId: "3" },
]);

console.log("api-data-delta tests passed");

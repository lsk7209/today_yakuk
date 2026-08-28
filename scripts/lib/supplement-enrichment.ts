import type { AnalysisResult } from "./nutrition-parser";

type EnrichmentStatement = {
  sql: string;
  args: string[];
};

type ExecuteEnrichmentUpdate = (statement: EnrichmentStatement) => Promise<unknown>;

export function getEnrichmentOffset(
  pendingCount: number,
  limit: number,
  cursor: number,
): number {
  if (!Number.isSafeInteger(pendingCount) || pendingCount <= 0) return 0;
  if (!Number.isSafeInteger(limit) || limit <= 0) throw new Error("limit must be positive");
  if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error("cursor must be non-negative");
  return (cursor * limit) % pendingCount;
}

export function buildSupplementEnrichmentUpdate(input: {
  id: string;
  analysis: AnalysisResult;
  additives: unknown;
}): EnrichmentStatement | null {
  if (input.analysis.nutrition_facts.length === 0) return null;

  return {
    sql: "UPDATE supplements SET nutrition_facts = ?, additives = ? WHERE id = ?",
    args: [
      JSON.stringify(input.analysis.nutrition_facts),
      JSON.stringify(input.additives),
      input.id,
    ],
  };
}

export async function persistSupplementEnrichment(
  input: {
    id: string;
    analysis: AnalysisResult;
    additives: unknown;
  },
  execute: ExecuteEnrichmentUpdate,
): Promise<"no_data" | "updated"> {
  const statement = buildSupplementEnrichmentUpdate(input);
  if (!statement) return "no_data";

  await execute(statement);
  return "updated";
}

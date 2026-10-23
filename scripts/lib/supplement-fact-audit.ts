import { getNutritionFactIssue, type NutritionIssue } from "../../src/lib/nutrition-validation";

export interface StoredSupplementRow {
  id: string;
  name: string;
  nutrition_facts: unknown;
}

export interface RejectedFact {
  fact: unknown;
  issue: NutritionIssue | "not-an-object";
}

export interface SupplementFactAudit {
  id: string;
  name: string;
  rejected: RejectedFact[];
  kept: unknown[];
  /** 모든 성분이 거부되어 성분 표시 근거가 사라지는 제품 */
  becomesEmpty: boolean;
}

function parseFacts(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 저장된 nutrition_facts를 현재 검증 규칙으로 재판정한다. 읽기 전용이며 어떤 값도 수정하지 않는다. */
export function auditStoredSupplementFacts(rows: StoredSupplementRow[]): SupplementFactAudit[] {
  const audits: SupplementFactAudit[] = [];
  for (const row of rows) {
    const rejected: RejectedFact[] = [];
    const kept: unknown[] = [];
    for (const fact of parseFacts(row.nutrition_facts)) {
      if (!fact || typeof fact !== "object") {
        rejected.push({ fact, issue: "not-an-object" });
        continue;
      }
      const issue = getNutritionFactIssue(fact as Record<string, unknown>);
      if (issue) rejected.push({ fact, issue });
      else kept.push(fact);
    }
    if (rejected.length > 0) {
      audits.push({
        id: row.id,
        name: row.name,
        rejected,
        kept,
        becomesEmpty: kept.length === 0,
      });
    }
  }
  return audits;
}

import {
  ADDITIVE_SUBSTRINGS,
  ALLOWED_NUTRITION_UNITS,
  STANDARD_TERM_SUBSTRINGS,
} from "@/lib/nutrition-validation";
import { hasVerifiedNutritionFacts } from "@/lib/wiki-nutrition";

function hasText(value?: string | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasItems(value?: unknown[] | null) {
  return Array.isArray(value) && value.length > 0;
}

function hasIndexableName(name?: string | null) {
  return hasText(name) && !name!.trim().toLowerCase().startsWith("test");
}

export function isIndexableSupplement(input: {
  name?: string | null;
  nutrition_facts?: unknown[] | null;
  tags?: unknown[] | null;
}) {
  return (
    hasIndexableName(input.name) &&
    (hasVerifiedNutritionFacts(input.nutrition_facts) ||
      // 저장된 성분이 있는데 모두 검증에 실패한 제품은 태그만으로 색인 적격이 되지 않는다.
      (hasItems(input.tags) && !hasItems(input.nutrition_facts)))
  );
}

export function isIndexableMedicine(input: {
  name?: string | null;
  efficacy?: string | null;
  use_method?: string | null;
  warning_general?: string | null;
  side_effects?: string | null;
}) {
  return (
    hasIndexableName(input.name) &&
    [input.efficacy, input.use_method, input.warning_general, input.side_effects].some(hasText)
  );
}

const FACT_NAME_SQL = `TRIM(json_extract(CASE WHEN fact.type = 'object' THEN fact.value ELSE '{}' END, '$.name'))`;
const FACT_UNIT_SQL = `TRIM(json_extract(CASE WHEN fact.type = 'object' THEN fact.value ELSE '{}' END, '$.unit'))`;

// getNutritionFactIssue()와 같은 의미 규칙을 SQL로 옮긴 조건 (사이트맵·목록이 화면과 같은 기준을 쓰도록)
const FACT_SEMANTIC_SQL = [
  ...[...STANDARD_TERM_SUBSTRINGS, ...ADDITIVE_SUBSTRINGS].map(
    (term) => `${FACT_NAME_SQL} NOT LIKE '%${term.replace(/'/g, "''")}%'`,
  ),
  `${FACT_NAME_SQL} NOT IN ('납', '함량', '총')`,
  `LENGTH(${FACT_NAME_SQL}) >= 2`,
  `${FACT_NAME_SQL} NOT GLOB '[가-힣][A-Za-z0-9]*'`,
  `${FACT_NAME_SQL} NOT GLOB '*[은는을를의]'`,
  `NOT (${FACT_NAME_SQL} GLOB '[a-z]*' AND ${FACT_NAME_SQL} NOT GLOB '*[^a-z]*')`,
  `${FACT_UNIT_SQL} IN (${ALLOWED_NUTRITION_UNITS.map((unit) => `'${unit}'`).join(", ")})`,
].join(" AND ");

export const SUPPLEMENT_INDEXABLE_PREDICATE = `
TRIM(name) != ''
  AND LOWER(TRIM(name)) NOT LIKE 'test%'
  AND (
    EXISTS (
      SELECT 1
      FROM json_each(CASE WHEN json_valid(nutrition_facts) THEN nutrition_facts ELSE '[]' END) AS fact
      WHERE json_extract(
        CASE WHEN fact.type = 'object' THEN fact.value ELSE '{}' END,
        '$.source'
      ) = 'foodsafetykorea:C003'
        AND CAST(json_extract(
          CASE WHEN fact.type = 'object' THEN fact.value ELSE '{}' END,
          '$.amount'
        ) AS REAL) > 0
        AND NULLIF(TRIM(json_extract(
          CASE WHEN fact.type = 'object' THEN fact.value ELSE '{}' END,
          '$.name'
        )), '') IS NOT NULL
        AND ${FACT_SEMANTIC_SQL}
    )
    OR (
      COALESCE(
        json_array_length(CASE WHEN json_valid(tags) THEN tags ELSE '[]' END),
        0
      ) > 0
      AND COALESCE(
        json_array_length(CASE WHEN json_valid(nutrition_facts) THEN nutrition_facts ELSE '[]' END),
        0
      ) = 0
    )
  )
`;

export const SUPPLEMENT_INDEXABLE_WHERE = `WHERE ${SUPPLEMENT_INDEXABLE_PREDICATE}`;

export const MEDICINE_INDEXABLE_WHERE = `
WHERE TRIM(name) != ''
  AND LOWER(TRIM(name)) NOT LIKE 'test%'
  AND (
    NULLIF(TRIM(efficacy), '') IS NOT NULL
    OR NULLIF(TRIM(use_method), '') IS NOT NULL
    OR NULLIF(TRIM(warning_general), '') IS NOT NULL
    OR NULLIF(TRIM(side_effects), '') IS NOT NULL
  )
`;

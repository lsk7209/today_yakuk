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
    (hasVerifiedNutritionFacts(input.nutrition_facts) || hasItems(input.tags))
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
    )
    OR COALESCE(
      json_array_length(CASE WHEN json_valid(tags) THEN tags ELSE '[]' END),
      0
    ) > 0
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

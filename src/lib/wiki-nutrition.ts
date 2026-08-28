export const FOOD_SAFETY_NUTRITION_SOURCE = "foodsafetykorea:C003" as const;

export interface VerifiedNutritionFact {
  name: string;
  amount: number;
  unit: string;
  percent_dv: number | null;
  source: typeof FOOD_SAFETY_NUTRITION_SOURCE;
}

export function getVerifiedNutritionFacts(value: unknown): VerifiedNutritionFact[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is VerifiedNutritionFact => {
    if (!item || typeof item !== "object") return false;
    const fact = item as Record<string, unknown>;
    return (
      fact.source === FOOD_SAFETY_NUTRITION_SOURCE &&
      typeof fact.name === "string" &&
      fact.name.trim().length > 0 &&
      typeof fact.amount === "number" &&
      Number.isFinite(fact.amount) &&
      fact.amount > 0 &&
      typeof fact.unit === "string" &&
      fact.unit.trim().length > 0 &&
      (fact.percent_dv === null ||
        (typeof fact.percent_dv === "number" && Number.isFinite(fact.percent_dv)))
    );
  });
}

export function hasVerifiedNutritionFacts(value: unknown): boolean {
  return getVerifiedNutritionFacts(value).length > 0;
}

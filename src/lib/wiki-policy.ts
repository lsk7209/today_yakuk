export function isIndexableSupplement(record: {
  name?: string | null;
  manufacturer?: string | null;
  ai_summary?: string | null;
  nutrition_facts?: unknown[] | null;
  tags?: string[] | null;
}): boolean {
  if (!record.name?.trim() || !record.manufacturer?.trim()) return false;
  return Boolean(record.ai_summary?.trim() || record.nutrition_facts?.length || record.tags?.length);
}

export function isIndexableMedicine(record: {
  name?: string | null;
  manufacturer?: string | null;
  efficacy?: string | null;
  use_method?: string | null;
  warning_general?: string | null;
}): boolean {
  if (!record.name?.trim() || !record.manufacturer?.trim()) return false;
  const substantive = [record.efficacy, record.use_method, record.warning_general]
    .filter(Boolean)
    .join(" ")
    .trim();
  return substantive.length >= 120;
}


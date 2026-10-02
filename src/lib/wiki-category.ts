export interface CategoryDefinition {
  slug: string;
  name: string;
  emoji: string;
  tagTerms: string[];
  nameTerms: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
  { slug: "all", name: "전체", emoji: "✨", tagTerms: [], nameTerms: [] },
  {
    slug: "probiotics",
    name: "유산균",
    emoji: "🦠",
    tagTerms: ["probiotics", "유산균"],
    nameTerms: ["%유산균%", "%프로바이오틱스%", "%락토바실%", "%락토핏%", "%비피더스%", "%생유산균%"],
  },
  {
    slug: "vitamin-c",
    name: "비타민C",
    emoji: "🍊",
    tagTerms: ["vitamin-c", "비타민C"],
    nameTerms: ["%비타민C%", "%비타민 C%", "%아스코르브산%"],
  },
  {
    slug: "omega3",
    name: "오메가3",
    emoji: "🐟",
    tagTerms: ["omega3", "오메가3"],
    nameTerms: ["%오메가3%", "%오메가-3%", "%오메가 3%", "%EPA%", "%DHA%"],
  },
  {
    slug: "eye",
    name: "눈건강",
    emoji: "👁️",
    tagTerms: ["eye", "눈건강"],
    nameTerms: ["%루테인%", "%지아잔틴%", "%아스타잔틴%"],
  },
  {
    slug: "fatigue",
    name: "피로회복",
    emoji: "⚡",
    tagTerms: ["fatigue", "피로회복"],
    nameTerms: ["%홍삼%", "%밀크씨슬%", "%아르기닌%", "%비타민B%", "%비타민 B%"],
  },
  {
    slug: "immune",
    name: "면역력",
    emoji: "🛡️",
    tagTerms: ["immune", "면역력"],
    nameTerms: ["%아연%", "%프로폴리스%", "%면역%"],
  },
  {
    slug: "bone",
    name: "뼈/치아",
    emoji: "🦴",
    tagTerms: ["bone", "뼈", "뼈/치아"],
    nameTerms: ["%칼슘%", "%마그네슘%", "%비타민D%", "%비타민 D%"],
  },
];

export const TAG_SLUG_MAP: Record<string, string> = {
  probiotics: "유산균",
  "vitamin-c": "비타민C",
  omega3: "오메가3",
  eye: "눈건강",
  fatigue: "피로회복",
  immune: "면역력",
  bone: "뼈/치아",
};

export interface CategoryFilterResult {
  isAll: boolean;
  slug: string;
  displayName: string;
  whereClause: string;
  args: (string | number)[];
}

export function buildCategoryFilter(categoryOrTag?: string | null): CategoryFilterResult {
  const raw = (categoryOrTag || "all").trim();
  if (!raw || raw === "all") {
    return {
      isAll: true,
      slug: "all",
      displayName: "전체",
      whereClause: "1=1",
      args: [],
    };
  }

  // 1. Predefined category check (match by slug or Korean name)
  const matched = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === raw.toLowerCase() || c.name === raw,
  );

  if (matched && matched.slug !== "all") {
    const inClause = matched.tagTerms.map(() => "?").join(", ");
    const nameClause = matched.nameTerms.map(() => "name LIKE ?").join(" OR ");
    return {
      isAll: false,
      slug: matched.slug,
      displayName: matched.name,
      whereClause: `((tags IS NOT NULL AND tags != '[]' AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value IN (${inClause}))) OR (${nameClause}))`,
      args: [...matched.tagTerms, ...matched.nameTerms],
    };
  }

  // 2. Custom tag/keyword query (safe fallback)
  const escapedTerm = `%${raw.replace(/[%_]/g, "\\$&")}%`;
  return {
    isAll: false,
    slug: raw,
    displayName: TAG_SLUG_MAP[raw] || raw,
    whereClause: `((tags IS NOT NULL AND tags != '[]' AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value = ?)) OR (name LIKE ? ESCAPE '\\'))`,
    args: [raw, escapedTerm],
  };
}

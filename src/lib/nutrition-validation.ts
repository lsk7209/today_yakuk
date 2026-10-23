/**
 * 건강기능식품 성분 사실(fact)의 의미 검증.
 * 숫자+단위가 추출된다는 이유만으로 영양성분으로 채택하지 않기 위한 공통 규칙이며,
 * 수집 파서(scripts/lib/nutrition-parser.ts)와 화면 읽기 경로(wiki-nutrition.ts)가 함께 사용한다.
 */

export const NUTRITION_PARSER_VERSION = "nutrition-parser/2";

export type NutritionIssue =
  | "invalid-name"
  | "name-fragment"
  | "standard-or-test-term"
  | "non-nutrient-additive"
  | "invalid-amount"
  | "unsupported-unit";

// 안전·시험·품질 기준에 쓰이는 용어 (성분명이 될 수 없음)
export const STANDARD_TERM_SUBSTRINGS = [
  "카드뮴",
  "수은",
  "비소",
  "중금속",
  "대장균",
  "세균",
  "진균",
  "살모넬라",
  "포도상구균",
  "붕해",
  "이물",
  "성상",
  "표시량",
  "기준",
  "규격",
  "이하",
  "이상",
  "이내",
  "미만",
  "초과",
  "시험",
  "검출",
  "음성",
  "범위",
  "허용",
];
const STANDARD_TERM_EXACT = new Set(["납", "함량", "총", "of", "the", "and"]);

// 영양·기능성 성분이 아닌 첨가물·부형제 키워드
export const ADDITIVE_SUBSTRINGS = [
  "정제수",
  "글리세린",
  "착향료",
  "캡슐기제",
  "이산화규소",
  "스테아린산마그네슘",
  "히드록시프로필메틸셀룰로오스",
  "HPMC",
  "미결정셀룰로오스",
  "포비돈",
  "크로스카르멜로오스나트륨",
  "탈크",
  "이산화티타늄",
  "카르나우바납",
  "쉘락",
  "유화제",
  "산도조절제",
  "감미료",
  "보존료",
  "착색료",
  "결합제",
  "활택제",
];

// 비타민 활성 당량(RAE·α-TE·DFE·NE)과 균수(CFU)는 정상 표시 단위다.
export const ALLOWED_NUTRITION_UNITS = [
  "mg", "g", "μg", "IU",
  "μg RAE", "mg α-TE", "μg DFE", "mg NE",
  "CFU", "억 CFU",
] as const;
const ALLOWED_UNITS = new Set<string>(ALLOWED_NUTRITION_UNITS);

// 문장 조각 뒤에 붙는 조사 (예: "단B1은"). 알로에·무화과·오이처럼 실제 성분명으로 끝나는 글자는 제외
const TRAILING_PARTICLE = /(은|는|을|를|의)$/;
// 한 글자 한글 뒤에 곧바로 영문/숫자가 붙는 잘린 토큰 (예: "단B1")
const LEADING_FRAGMENT = /^[가-힣][A-Za-z0-9]/;
// 소문자 영단어 (예: "of")
const LOWERCASE_WORD = /^[a-z]{1,6}$/;

export function getNutrientNameIssue(rawName: unknown): NutritionIssue | null {
  if (typeof rawName !== "string") return "invalid-name";
  const name = rawName.trim();
  if (name.length < 2 || name.length > 40) return "invalid-name";
  if (STANDARD_TERM_EXACT.has(name.toLowerCase()))
    return "standard-or-test-term";
  if (STANDARD_TERM_SUBSTRINGS.some((term) => name.includes(term)))
    return "standard-or-test-term";
  if (ADDITIVE_SUBSTRINGS.some((term) => name.includes(term)))
    return "non-nutrient-additive";
  if (LOWERCASE_WORD.test(name)) return "name-fragment";
  if (LEADING_FRAGMENT.test(name) || TRAILING_PARTICLE.test(name))
    return "name-fragment";
  return null;
}

export function getNutritionFactIssue(fact: {
  name?: unknown;
  amount?: unknown;
  unit?: unknown;
}): NutritionIssue | null {
  const nameIssue = getNutrientNameIssue(fact.name);
  if (nameIssue) return nameIssue;
  if (
    typeof fact.amount !== "number" ||
    !Number.isFinite(fact.amount) ||
    fact.amount <= 0
  ) {
    return "invalid-amount";
  }
  if (typeof fact.unit !== "string" || !ALLOWED_UNITS.has(fact.unit.trim())) {
    return "unsupported-unit";
  }
  return null;
}

export type StandardTextKind =
  "heavy-metal" | "microbe" | "label-ratio" | "limit" | "other";

/** 기준규격(STDR_STND) 문구의 성격 분류. 성분 함량으로 사용하지 않고 검토·보고용으로만 쓴다. */
export function classifyStandardText(text: string): StandardTextKind {
  if (/카드뮴|수은|납|비소|중금속/.test(text)) return "heavy-metal";
  if (/대장균|세균|진균|살모넬라|포도상구균|유산균수/.test(text))
    return "microbe";
  if (/표시량|표시\s*함량/.test(text)) return "label-ratio";
  if (/이하|이상|이내|미만|초과|\/\s*(kg|g|ml|L)\b/i.test(text)) return "limit";
  return "other";
}

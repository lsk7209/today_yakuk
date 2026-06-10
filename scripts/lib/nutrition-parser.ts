/**
 * Nutrition Parser — Gemini 없이 Claude Code가 직접 작성한 규칙 기반 분석기
 * C003 식약처 API의 NUT_MTR / RAWMTRL_NM 텍스트를 파싱하여 구조화된 데이터로 변환
 */

export interface NutritionFact {
  name: string;
  amount: number;
  unit: string;
  percent_dv: number | null;
}

export interface AnalysisResult {
  summary: string;
  effects: string;
  cautions: string;
  nutrition_facts: NutritionFact[];
}

// 한국인 성인 1일 영양성분 기준치 (식약처 고시)
const DV_REFERENCE: Record<string, { dv: number; unit: string }> = {
  "비타민C": { dv: 100, unit: "mg" },
  "비타민D": { dv: 10, unit: "μg" },
  "비타민E": { dv: 11, unit: "mg" },
  "비타민K": { dv: 70, unit: "μg" },
  "비타민B1": { dv: 1.2, unit: "mg" },
  "티아민": { dv: 1.2, unit: "mg" },
  "비타민B2": { dv: 1.4, unit: "mg" },
  "리보플라빈": { dv: 1.4, unit: "mg" },
  "나이아신": { dv: 16, unit: "mg" },
  "비타민B6": { dv: 1.5, unit: "mg" },
  "엽산": { dv: 400, unit: "μg" },
  "폴산": { dv: 400, unit: "μg" },
  "비타민B12": { dv: 2.4, unit: "μg" },
  "비오틴": { dv: 30, unit: "μg" },
  "판토텐산": { dv: 5, unit: "mg" },
  "칼슘": { dv: 700, unit: "mg" },
  "인": { dv: 700, unit: "mg" },
  "마그네슘": { dv: 315, unit: "mg" },
  "철": { dv: 12, unit: "mg" },
  "철분": { dv: 12, unit: "mg" },
  "아연": { dv: 8.5, unit: "mg" },
  "구리": { dv: 0.8, unit: "mg" },
  "셀레늄": { dv: 55, unit: "μg" },
  "망간": { dv: 3.0, unit: "mg" },
  "요오드": { dv: 150, unit: "μg" },
  "크롬": { dv: 30, unit: "μg" },
  "몰리브덴": { dv: 25, unit: "μg" },
  "칼륨": { dv: 3500, unit: "mg" },
  "나트륨": { dv: 2000, unit: "mg" },
};

// 영양소가 아닌 단순 원재료/첨가물 키워드
const NON_NUTRIENT_KEYWORDS = [
  "정제수", "글리세린", "착향료", "캡슐기제", "이산화규소", "스테아린산마그네슘",
  "히드록시프로필메틸셀룰로오스", "HPMC", "미결정셀룰로오스", "포비돈", "크로스카르멜로오스나트륨",
  "탈크", "이산화티타늄", "카르나우바납", "쉘락", "유화제", "산도조절제",
  "감미료", "보존료", "착색료", "결합제", "활택제",
];

function isNonNutrient(name: string): boolean {
  return NON_NUTRIENT_KEYWORDS.some(k => name.includes(k));
}

/**
 * C003 NUT_MTR 필드 파싱
 * 예: "비타민C 100mg(1일 섭취량의 100%), 아연 8.5mg(100%)"
 */
export function parseNutritionFacts(nutStr: string): NutritionFact[] {
  if (!nutStr || nutStr.trim() === "-" || nutStr.trim() === "") return [];

  const results: NutritionFact[] = [];
  const seen = new Set<string>();

  // 패턴 1: "성분명 숫자단위(숫자%)" 또는 "성분명 숫자단위"
  const pattern1 =
    /([가-힣A-Za-z][가-힣A-Za-z0-9\s]*?)\s+([\d.]+)\s*(mg|g|μg|mcg|IU|ug|㎍)\s*(?:\([^)]*?([\d.]+)\s*%[^)]*\))?/gi;

  let m: RegExpExecArray | null;
  while ((m = pattern1.exec(nutStr)) !== null) {
    const rawName = m[1].trim().replace(/\s+/g, "");
    if (isNonNutrient(rawName) || rawName.length < 2) continue;
    if (seen.has(rawName)) continue;
    seen.add(rawName);

    const amount = parseFloat(m[2]);
    const rawUnit = m[3].replace(/mcg|ug|㎍/i, "μg");
    const percentRaw = m[4] ? parseFloat(m[4]) : null;

    const dvRef = DV_REFERENCE[rawName];
    const percent_dv =
      percentRaw != null
        ? Math.round(percentRaw)
        : dvRef && dvRef.unit === rawUnit
        ? Math.round((amount / dvRef.dv) * 100)
        : null;

    results.push({ name: rawName, amount, unit: rawUnit, percent_dv });
  }

  return results;
}

/**
 * 원재료·영양소 기반으로 효능/주의사항 텍스트 생성 (정적 지식 기반)
 */
export function generateSummaryTexts(
  productName: string,
  rawMaterials: string,
  nutritionFacts: NutritionFact[]
): { summary: string; effects: string; cautions: string } {
  const nutrientNames = nutritionFacts.map(n => n.name);
  const hasVitaminC = nutrientNames.some(n => n.includes("비타민C") || n.includes("아스코르빈산"));
  const hasVitaminD = nutrientNames.some(n => n.includes("비타민D"));
  const hasVitaminE = nutrientNames.some(n => n.includes("비타민E"));
  const hasCalcium = nutrientNames.some(n => n === "칼슘");
  const hasZinc = nutrientNames.some(n => n === "아연");
  const hasIron = nutrientNames.some(n => n.includes("철") || n === "철분");
  const hasMagnesium = nutrientNames.some(n => n === "마그네슘");
  const hasOmega3 = rawMaterials.includes("오메가") || rawMaterials.includes("EPA") || rawMaterials.includes("DHA") || productName.includes("오메가");
  const hasProbiotic = rawMaterials.includes("유산균") || productName.includes("유산균") || productName.includes("프로바이오틱");
  const hasCollagen = rawMaterials.includes("콜라겐") || productName.includes("콜라겐");
  const hasLutein = rawMaterials.includes("루테인") || productName.includes("루테인");
  const hasMelatonin = rawMaterials.includes("멜라토닌") || productName.includes("멜라토닌");
  const hasCoQ10 = rawMaterials.includes("코엔자임Q10") || rawMaterials.includes("CoQ10") || productName.includes("코큐텐");
  const hasGlucosamine = rawMaterials.includes("글루코사민") || productName.includes("글루코사민");

  // 주요 성분 목록 생성
  const keyNutrients = nutrientNames.slice(0, 3).join(", ");
  const summary = keyNutrients
    ? `${productName}은(는) ${keyNutrients}을(를) 주요 성분으로 함유한 건강기능식품입니다.`
    : `${productName}은(는) 식약처에 신고된 건강기능식품입니다.`;

  // 효능 텍스트
  const effectParts: string[] = [];
  if (hasVitaminC) effectParts.push("비타민C는 항산화 작용을 하며 결합조직 형성과 철의 흡수에 기여합니다.");
  if (hasVitaminD) effectParts.push("비타민D는 칼슘과 인이 흡수되고 이용되는 데 필요하며 뼈의 형성과 유지에 필요합니다.");
  if (hasCalcium) effectParts.push("칼슘은 뼈와 치아 형성에 필요하고 신경과 근육 기능 유지에 기여합니다.");
  if (hasZinc) effectParts.push("아연은 정상적인 면역기능과 세포분열에 필요하며 항산화 작용을 합니다.");
  if (hasIron) effectParts.push("철은 체내 산소 운반과 혈액 생성에 필요하며 에너지 생성 과정에 기여합니다.");
  if (hasMagnesium) effectParts.push("마그네슘은 에너지 이용과 근육 기능 유지에 필요합니다.");
  if (hasOmega3) effectParts.push("EPA와 DHA는 혈중 중성지질 개선과 혈행 개선에 도움을 줄 수 있습니다.");
  if (hasProbiotic) effectParts.push("유산균은 장 건강 유지 및 장내 유익균 증식에 도움을 줄 수 있습니다.");
  if (hasCollagen) effectParts.push("콜라겐 펩타이드는 피부 보습 및 탄력 유지에 도움을 줄 수 있습니다.");
  if (hasLutein) effectParts.push("루테인은 눈의 황반 색소 밀도를 유지하는 데 도움을 줄 수 있습니다.");
  if (hasMelatonin) effectParts.push("멜라토닌은 수면의 질 개선에 도움을 줄 수 있습니다.");
  if (hasCoQ10) effectParts.push("코엔자임Q10은 항산화 작용과 에너지 생성에 기여합니다.");
  if (hasGlucosamine) effectParts.push("글루코사민은 관절 연골 구성 성분으로 관절 건강 유지에 도움을 줄 수 있습니다.");

  const effects = effectParts.length > 0
    ? effectParts.slice(0, 3).join(" ")
    : "식약처 기준에 따라 제조된 건강기능식품으로, 개인에 따라 효과가 다를 수 있습니다.";

  // 주의사항
  const cautionParts: string[] = [
    "권장 섭취량을 초과하지 않도록 주의하세요.",
  ];
  if (hasVitaminD) cautionParts.push("비타민D는 지용성이므로 과다 섭취 시 체내 축적될 수 있습니다.");
  if (hasIron) cautionParts.push("철 함유 제품은 영유아의 손이 닿지 않는 곳에 보관하세요.");
  if (hasMelatonin) cautionParts.push("멜라토닌 제품은 임산부·수유부 및 18세 미만은 섭취를 피하세요.");
  if (hasOmega3) cautionParts.push("혈액응고억제제를 복용 중인 경우 의사와 상담 후 섭취하세요.");
  cautionParts.push("의약품을 복용 중이거나 특정 질환이 있는 경우 전문가와 상담 후 섭취하세요.");

  const cautions = cautionParts.slice(0, 3).join(" ");

  return { summary, effects, cautions };
}

// 제품명 키워드 → 표준 성분명 매핑
const PRODUCT_NAME_KEYWORDS: Array<{
  patterns: RegExp[];
  nutrient: string;
  defaultUnit: string;
}> = [
  { patterns: [/비타민\s?C|비타민씨|아스코르빈산/i], nutrient: "비타민C", defaultUnit: "mg" },
  { patterns: [/비타민\s?D3?|콜레칼시페롤/i], nutrient: "비타민D", defaultUnit: "μg" },
  { patterns: [/비타민\s?E|토코페롤/i], nutrient: "비타민E", defaultUnit: "mg" },
  { patterns: [/비타민\s?K2?|메나퀴논/i], nutrient: "비타민K", defaultUnit: "μg" },
  { patterns: [/비타민\s?B1|티아민/i], nutrient: "비타민B1", defaultUnit: "mg" },
  { patterns: [/비타민\s?B2|리보플라빈/i], nutrient: "비타민B2", defaultUnit: "mg" },
  { patterns: [/비타민\s?B6|피리독신/i], nutrient: "비타민B6", defaultUnit: "mg" },
  { patterns: [/비타민\s?B12|코발라민/i], nutrient: "비타민B12", defaultUnit: "μg" },
  { patterns: [/엽산|폴산/i], nutrient: "엽산", defaultUnit: "μg" },
  { patterns: [/비오틴/i], nutrient: "비오틴", defaultUnit: "μg" },
  { patterns: [/나이아신/i], nutrient: "나이아신", defaultUnit: "mg" },
  { patterns: [/칼슘/i], nutrient: "칼슘", defaultUnit: "mg" },
  { patterns: [/마그네슘/i], nutrient: "마그네슘", defaultUnit: "mg" },
  { patterns: [/아연/i], nutrient: "아연", defaultUnit: "mg" },
  { patterns: [/철분|철\b/i], nutrient: "철분", defaultUnit: "mg" },
  { patterns: [/셀레늄/i], nutrient: "셀레늄", defaultUnit: "μg" },
  { patterns: [/루테인/i], nutrient: "루테인", defaultUnit: "mg" },
  { patterns: [/코엔자임\s?Q10|CoQ10|코큐텐/i], nutrient: "코엔자임Q10", defaultUnit: "mg" },
  { patterns: [/글루코사민/i], nutrient: "글루코사민", defaultUnit: "mg" },
  { patterns: [/콘드로이틴/i], nutrient: "콘드로이틴황산", defaultUnit: "mg" },
  { patterns: [/MSM|엠에스엠/i], nutrient: "MSM(메칠설포닐메탄)", defaultUnit: "mg" },
  { patterns: [/오메가.?3|EPA|DHA/i], nutrient: "EPA+DHA", defaultUnit: "mg" },
  { patterns: [/콜라겐/i], nutrient: "콜라겐펩타이드", defaultUnit: "g" },
  { patterns: [/프로바이오틱|유산균/i], nutrient: "유산균(프로바이오틱스)", defaultUnit: "억 CFU" },
  { patterns: [/밀크씨슬|실리마린/i], nutrient: "밀크씨슬추출물", defaultUnit: "mg" },
  { patterns: [/홍삼|인삼/i], nutrient: "홍삼", defaultUnit: "mg" },
  { patterns: [/은행잎|징코|징코빌로바/i], nutrient: "은행잎추출물", defaultUnit: "mg" },
  { patterns: [/멜라토닌/i], nutrient: "멜라토닌", defaultUnit: "mg" },
  { patterns: [/알파리포산|ALA|알파-리포산/i], nutrient: "알파리포산", defaultUnit: "mg" },
  { patterns: [/크릴/i], nutrient: "크릴오일", defaultUnit: "mg" },
  { patterns: [/베타글루칸/i], nutrient: "베타글루칸", defaultUnit: "mg" },
];

/**
 * 제품명에서 영양소 정보 추출 (함량이 포함된 경우 우선)
 */
export function parseFromProductName(productName: string): NutritionFact[] {
  const results: NutritionFact[] = [];
  const seen = new Set<string>();
  const nameLower = productName.toLowerCase();

  for (const { patterns, nutrient, defaultUnit } of PRODUCT_NAME_KEYWORDS) {
    if (seen.has(nutrient)) continue;
    const matched = patterns.some(p => p.test(productName));
    if (!matched) continue;

    // 제품명에서 이 성분 근처의 숫자+단위 패턴 추출 시도
    const amountPattern = /([\d.]+)\s*(mg|g|μg|mcg|ug|IU|억\s*CFU)/gi;
    let amount = 0;
    let unit = defaultUnit;
    let m: RegExpExecArray | null;
    while ((m = amountPattern.exec(productName)) !== null) {
      const parsedAmt = parseFloat(m[1]);
      const parsedUnit = m[2].replace(/mcg|ug/i, "μg").replace(/\s/g, "");
      if (!isNaN(parsedAmt) && parsedAmt > 0) {
        amount = parsedAmt;
        unit = parsedUnit;
        break;
      }
    }

    const dvRef = DV_REFERENCE[nutrient];
    const percent_dv = amount > 0 && dvRef && dvRef.unit === unit
      ? Math.round((amount / dvRef.dv) * 100)
      : null;

    results.push({ name: nutrient, amount, unit, percent_dv });
    seen.add(nutrient);
  }

  return results;
}

/**
 * 전체 분석 실행 (C003 API 데이터 → 구조화)
 */
export function analyzeProduct(
  productName: string,
  rawMaterials: string,
  nutritionStr: string
): AnalysisResult {
  // NUT_MTR 파싱 우선, 없으면 제품명 기반 추론
  let nutrition_facts = parseNutritionFacts(nutritionStr);
  if (nutrition_facts.length === 0) {
    nutrition_facts = parseFromProductName(productName);
  }
  const { summary, effects, cautions } = generateSummaryTexts(productName, rawMaterials, nutrition_facts);
  return { summary, effects, cautions, nutrition_facts };
}

/**
 * C003 API 없이 제품명만으로 분석
 */
export function analyzeFromNameOnly(productName: string): AnalysisResult {
  const nutrition_facts = parseFromProductName(productName);
  const { summary, effects, cautions } = generateSummaryTexts(productName, "", nutrition_facts);
  return { summary, effects, cautions, nutrition_facts };
}

/**
 * ai_summary 컬럼 형식으로 직렬화
 */
export function createMixedSummary(analysis: AnalysisResult): string {
  return JSON.stringify({
    summary: analysis.summary,
    effects: analysis.effects,
    cautions: analysis.cautions,
  });
}

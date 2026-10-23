/**
 * Nutrition Parser — Gemini 없이 Claude Code가 직접 작성한 규칙 기반 분석기
 * C003 식약처 API의 NUT_MTR / RAWMTRL_NM 텍스트를 파싱하여 구조화된 데이터로 변환
 */

import {
  NUTRITION_PARSER_VERSION,
  getNutritionFactIssue,
} from "../../src/lib/nutrition-validation";

export interface NutritionFact {
  name: string;
  amount: number;
  unit: string;
  percent_dv: number | null;
  source: "foodsafetykorea:C003" | "product-name-inference";
  /** 변환 추적용: 파서 버전, 변환 전 원문 조각, 검증 상태 */
  parser_version?: string;
  raw_text?: string;
  validation?: "verified";
}

export interface AnalysisResult {
  summary: string;
  effects: string;
  cautions: string;
  nutrition_facts: NutritionFact[];
}

// 한국인 성인 1일 영양성분 기준치 (식약처 고시)
const DV_REFERENCE: Record<string, { dv: number; unit: string }> = {
  비타민C: { dv: 100, unit: "mg" },
  비타민D: { dv: 10, unit: "μg" },
  비타민E: { dv: 11, unit: "mg" },
  비타민K: { dv: 70, unit: "μg" },
  비타민B1: { dv: 1.2, unit: "mg" },
  티아민: { dv: 1.2, unit: "mg" },
  비타민B2: { dv: 1.4, unit: "mg" },
  리보플라빈: { dv: 1.4, unit: "mg" },
  나이아신: { dv: 16, unit: "mg" },
  비타민B6: { dv: 1.5, unit: "mg" },
  엽산: { dv: 400, unit: "μg" },
  폴산: { dv: 400, unit: "μg" },
  비타민B12: { dv: 2.4, unit: "μg" },
  비오틴: { dv: 30, unit: "μg" },
  판토텐산: { dv: 5, unit: "mg" },
  칼슘: { dv: 700, unit: "mg" },
  인: { dv: 700, unit: "mg" },
  마그네슘: { dv: 315, unit: "mg" },
  철: { dv: 12, unit: "mg" },
  철분: { dv: 12, unit: "mg" },
  아연: { dv: 8.5, unit: "mg" },
  구리: { dv: 0.8, unit: "mg" },
  셀레늄: { dv: 55, unit: "μg" },
  망간: { dv: 3.0, unit: "mg" },
  요오드: { dv: 150, unit: "μg" },
  크롬: { dv: 30, unit: "μg" },
  몰리브덴: { dv: 25, unit: "μg" },
  칼륨: { dv: 3500, unit: "mg" },
  나트륨: { dv: 2000, unit: "mg" },
};

const ENTRY_PATTERN =
  /^([가-힣A-Za-z][가-힣A-Za-z0-9\-·\s]*?(?:\([가-힣A-Za-z0-9\-\s]+\))?)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(mg|g|μg|mcg|ug|㎍|IU)\s*(?:\(([^)]*)\))?$/i;
// 괄호 안 설명이 범위·기준·비교 조건이면 단일 함량으로 볼 수 없다.
const NON_SINGLE_VALUE_HINT = /~|∼|이하|이상|이내|미만|초과|표시량|범위|기준/;
const PERCENT_PATTERN = /(\d+(?:\.\d+)?)\s*%/;

/** 괄호 밖의 쉼표·세미콜론·줄바꿈으로만 항목을 나눈다. */
function splitTopLevelEntries(text: string): string[] {
  const entries: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(" || ch === "（") depth++;
    if ((ch === ")" || ch === "）") && depth > 0) depth--;
    if (depth === 0 && /[,，;；\n]/.test(ch)) {
      entries.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  entries.push(current);
  return entries.map((entry) => entry.trim()).filter(Boolean);
}

/**
 * 영양성분 필드 파싱 (NUT_MTR 전용).
 * 항목 전체가 "성분명 숫자단위[(N%)]" 형태일 때만 채택한다. 기준규격(STDR_STND)에는 사용하지 않는다.
 * 문장 중간의 숫자, 범위, 이하/이상, mg/kg 같은 분모 단위, 시험·안전 기준은 채택하지 않는다.
 */
export function parseNutritionFacts(nutStr: string): NutritionFact[] {
  if (!nutStr || nutStr.trim() === "-" || nutStr.trim() === "") return [];

  const results: NutritionFact[] = [];
  const seen = new Set<string>();

  for (const entry of splitTopLevelEntries(nutStr)) {
    const m = ENTRY_PATTERN.exec(entry);
    if (!m) continue;

    const name = m[1].trim().replace(/\s+/g, "");
    const note = m[4] ?? "";
    if (NON_SINGLE_VALUE_HINT.test(note)) continue;

    const unit = m[3].replace(/mcg|ug|㎍/i, "μg");
    const fact: NutritionFact = {
      name,
      amount: parseFloat(m[2]),
      unit: unit === "G" ? "g" : unit,
      percent_dv: null,
      source: "foodsafetykorea:C003",
      parser_version: NUTRITION_PARSER_VERSION,
      raw_text: entry,
      validation: "verified",
    };
    if (getNutritionFactIssue(fact) || seen.has(name)) continue;

    const percent = PERCENT_PATTERN.exec(note);
    fact.percent_dv = percent ? Math.round(parseFloat(percent[1])) : null;
    seen.add(name);
    results.push(fact);
  }

  return results;
}

/**
 * 원재료·영양소 기반으로 효능/주의사항 텍스트 생성 (정적 지식 기반)
 */
export function generateSummaryTexts(
  productName: string,
  rawMaterials: string,
  nutritionFacts: NutritionFact[],
): { summary: string; effects: string; cautions: string } {
  const nutrientNames = nutritionFacts.map((n) => n.name);
  const hasVitaminC = nutrientNames.some(
    (n) => n.includes("비타민C") || n.includes("아스코르빈산"),
  );
  const hasVitaminD = nutrientNames.some((n) => n.includes("비타민D"));
  const hasVitaminE = nutrientNames.some((n) => n.includes("비타민E"));
  const hasCalcium = nutrientNames.some((n) => n === "칼슘");
  const hasZinc = nutrientNames.some((n) => n === "아연");
  const hasIron = nutrientNames.some((n) => n.includes("철") || n === "철분");
  const hasMagnesium = nutrientNames.some((n) => n === "마그네슘");
  const combined = productName + " " + rawMaterials;
  const hasOmega3 = /오메가|EPA|DHA|앤초비|크릴/.test(combined);
  const hasProbiotic = /유산균|프로바이오틱|락토바실|비피도|바실러스/.test(
    combined,
  );
  const hasCollagen = /콜라겐|collagen/i.test(combined);
  const hasLutein = /루테인/.test(combined);
  const hasMelatonin = /멜라토닌/.test(combined);
  const hasCoQ10 = /코엔자임Q10|CoQ10|코큐텐/.test(combined);
  const hasGlucosamine = /글루코사민/.test(combined);
  const hasMilkThistle = /밀크씨슬|실리마린|milk\s?thistle/i.test(combined);
  const hasTheanine = /테아닌/.test(combined);
  const hasGABA = /GABA|가바\b/.test(combined);
  const hasGarcinia = /가르시니아/.test(combined);
  const hasSawPalmetto = /쏘팔메토|saw\s?palmetto/i.test(combined);

  // 주요 성분 목록 생성
  const keyNutrients = nutrientNames.slice(0, 3).join(", ");
  const summary = keyNutrients
    ? `${productName}은(는) ${keyNutrients}을(를) 주요 성분으로 함유한 건강기능식품입니다.`
    : `${productName}은(는) 식약처에 신고된 건강기능식품입니다.`;

  // 효능 텍스트
  const effectParts: string[] = [];
  if (hasVitaminC)
    effectParts.push(
      "비타민C는 항산화 작용을 하며 결합조직 형성과 철의 흡수에 기여합니다.",
    );
  if (hasVitaminD)
    effectParts.push(
      "비타민D는 칼슘과 인이 흡수되고 이용되는 데 필요하며 뼈의 형성과 유지에 필요합니다.",
    );
  if (hasCalcium)
    effectParts.push(
      "칼슘은 뼈와 치아 형성에 필요하고 신경과 근육 기능 유지에 기여합니다.",
    );
  if (hasZinc)
    effectParts.push(
      "아연은 정상적인 면역기능과 세포분열에 필요하며 항산화 작용을 합니다.",
    );
  if (hasIron)
    effectParts.push(
      "철은 체내 산소 운반과 혈액 생성에 필요하며 에너지 생성 과정에 기여합니다.",
    );
  if (hasMagnesium)
    effectParts.push("마그네슘은 에너지 이용과 근육 기능 유지에 필요합니다.");
  if (hasOmega3)
    effectParts.push(
      "EPA와 DHA는 혈중 중성지질 개선과 혈행 개선에 도움을 줄 수 있습니다.",
    );
  if (hasProbiotic)
    effectParts.push(
      "유산균은 장 건강 유지 및 장내 유익균 증식에 도움을 줄 수 있습니다.",
    );
  if (hasCollagen)
    effectParts.push(
      "콜라겐 펩타이드는 피부 보습 및 탄력 유지에 도움을 줄 수 있습니다.",
    );
  if (hasLutein)
    effectParts.push(
      "루테인은 눈의 황반 색소 밀도를 유지하는 데 도움을 줄 수 있습니다.",
    );
  if (hasMelatonin)
    effectParts.push("멜라토닌은 수면의 질 개선에 도움을 줄 수 있습니다.");
  if (hasCoQ10)
    effectParts.push("코엔자임Q10은 항산화 작용과 에너지 생성에 기여합니다.");
  if (hasGlucosamine)
    effectParts.push(
      "글루코사민은 관절 연골 구성 성분으로 관절 건강 유지에 도움을 줄 수 있습니다.",
    );
  if (hasMilkThistle)
    effectParts.push(
      "밀크씨슬 실리마린은 간 세포 보호 및 간 기능 개선에 도움을 줄 수 있습니다.",
    );
  if (hasTheanine)
    effectParts.push(
      "L-테아닌은 이완 및 스트레스 완화에 도움을 줄 수 있습니다.",
    );
  if (hasGABA)
    effectParts.push(
      "GABA는 긴장 완화와 수면의 질 개선에 도움을 줄 수 있습니다.",
    );
  if (hasGarcinia)
    effectParts.push(
      "가르시니아캄보지아 HCA는 탄수화물의 지방 전환을 억제하여 체중 조절에 도움을 줄 수 있습니다.",
    );
  if (hasSawPalmetto)
    effectParts.push(
      "쏘팔메토는 남성 전립선 건강 유지에 도움을 줄 수 있습니다.",
    );

  const effects =
    effectParts.length > 0
      ? effectParts.slice(0, 3).join(" ")
      : "식약처 기준에 따라 제조된 건강기능식품으로, 개인에 따라 효과가 다를 수 있습니다.";

  // 주의사항
  const cautionParts: string[] = ["권장 섭취량을 초과하지 않도록 주의하세요."];
  if (hasVitaminD)
    cautionParts.push(
      "비타민D는 지용성이므로 과다 섭취 시 체내 축적될 수 있습니다.",
    );
  if (hasIron)
    cautionParts.push(
      "철 함유 제품은 영유아의 손이 닿지 않는 곳에 보관하세요.",
    );
  if (hasMelatonin)
    cautionParts.push(
      "멜라토닌 제품은 임산부·수유부 및 18세 미만은 섭취를 피하세요.",
    );
  if (hasOmega3)
    cautionParts.push(
      "혈액응고억제제를 복용 중인 경우 의사와 상담 후 섭취하세요.",
    );
  cautionParts.push(
    "의약품을 복용 중이거나 특정 질환이 있는 경우 전문가와 상담 후 섭취하세요.",
  );

  const cautions = cautionParts.slice(0, 3).join(" ");

  return { summary, effects, cautions };
}

// 제품명 키워드 → 표준 성분명 매핑
const PRODUCT_NAME_KEYWORDS: Array<{
  patterns: RegExp[];
  nutrient: string;
  defaultUnit: string;
}> = [
  {
    patterns: [/비타민\s?C|비타민씨|아스코르빈산|VITAMIN\s?C|VIT\.?\s?C\b/i],
    nutrient: "비타민C",
    defaultUnit: "mg",
  },
  {
    patterns: [/비타민\s?D3?|콜레칼시페롤|VITAMIN\s?D3?|VIT\.?\s?D\b|썬디/i],
    nutrient: "비타민D",
    defaultUnit: "μg",
  },
  {
    patterns: [/비타민\s?E|토코페롤|VITAMIN\s?E|VIT\.?\s?E\b/i],
    nutrient: "비타민E",
    defaultUnit: "mg",
  },
  {
    patterns: [/비타민\s?K2?|메나퀴논|VITAMIN\s?K|VIT\.?\s?K\b/i],
    nutrient: "비타민K",
    defaultUnit: "μg",
  },
  {
    patterns: [/비타민\s?B1|티아민/i],
    nutrient: "비타민B1",
    defaultUnit: "mg",
  },
  {
    patterns: [/비타민\s?B2|리보플라빈/i],
    nutrient: "비타민B2",
    defaultUnit: "mg",
  },
  {
    patterns: [/비타민\s?B6|피리독신/i],
    nutrient: "비타민B6",
    defaultUnit: "mg",
  },
  {
    patterns: [/비타민\s?B12|코발라민/i],
    nutrient: "비타민B12",
    defaultUnit: "μg",
  },
  { patterns: [/엽산|폴산/i], nutrient: "엽산", defaultUnit: "μg" },
  { patterns: [/비오틴/i], nutrient: "비오틴", defaultUnit: "μg" },
  { patterns: [/나이아신/i], nutrient: "나이아신", defaultUnit: "mg" },
  { patterns: [/칼슘/i], nutrient: "칼슘", defaultUnit: "mg" },
  {
    patterns: [/마그네슘|마그\b|Mg\b/i],
    nutrient: "마그네슘",
    defaultUnit: "mg",
  },
  { patterns: [/아연|zinc\b/i], nutrient: "아연", defaultUnit: "mg" },
  { patterns: [/철분|철\b|iron\b|훼로/i], nutrient: "철분", defaultUnit: "mg" },
  { patterns: [/셀레늄/i], nutrient: "셀레늄", defaultUnit: "μg" },
  { patterns: [/루테인/i], nutrient: "루테인", defaultUnit: "mg" },
  { patterns: [/지아잔틴|제아잔틴/i], nutrient: "지아잔틴", defaultUnit: "mg" },
  {
    patterns: [/아스타잔틴|아스타크산틴/i],
    nutrient: "아스타잔틴",
    defaultUnit: "mg",
  },
  {
    patterns: [/코엔자임\s?Q10|CoQ10|코큐텐/i],
    nutrient: "코엔자임Q10",
    defaultUnit: "mg",
  },
  { patterns: [/글루코사민/i], nutrient: "글루코사민", defaultUnit: "mg" },
  { patterns: [/콘드로이틴/i], nutrient: "콘드로이틴황산", defaultUnit: "mg" },
  {
    patterns: [/MSM|엠에스엠/i],
    nutrient: "MSM(메칠설포닐메탄)",
    defaultUnit: "mg",
  },
  {
    patterns: [/오메가.?3|EPA|DHA|앤초비|크릴/i],
    nutrient: "EPA+DHA",
    defaultUnit: "mg",
  },
  {
    patterns: [/콜라겐|collagen/i],
    nutrient: "콜라겐펩타이드",
    defaultUnit: "g",
  },
  {
    patterns: [/프로바이오틱|유산균|락토바실|비피도|비피더스|바실러스/i],
    nutrient: "유산균(프로바이오틱스)",
    defaultUnit: "억 CFU",
  },
  {
    patterns: [/밀크씨슬|실리마린|milk\s?thistle/i],
    nutrient: "밀크씨슬추출물",
    defaultUnit: "mg",
  },
  { patterns: [/홍삼|인삼|백삼|흑삼/i], nutrient: "홍삼", defaultUnit: "mg" },
  {
    patterns: [/은행잎|징코|징코빌로바|ginkgo/i],
    nutrient: "은행잎추출물",
    defaultUnit: "mg",
  },
  { patterns: [/멜라토닌/i], nutrient: "멜라토닌", defaultUnit: "mg" },
  {
    patterns: [/알파.?리포산|ALA\b/i],
    nutrient: "알파리포산",
    defaultUnit: "mg",
  },
  { patterns: [/베타글루칸/i], nutrient: "베타글루칸", defaultUnit: "mg" },
  {
    patterns: [/카테킨|녹차\s?(추출|성분)/i],
    nutrient: "녹차카테킨",
    defaultUnit: "mg",
  },
  { patterns: [/테아닌/i], nutrient: "L-테아닌", defaultUnit: "mg" },
  { patterns: [/GABA|가바\b/i], nutrient: "GABA(가바)", defaultUnit: "mg" },
  {
    patterns: [/가르시니아|HCA\b/i],
    nutrient: "가르시니아캄보지아추출물",
    defaultUnit: "mg",
  },
  {
    patterns: [/포스파티딜세린|PS\b/i],
    nutrient: "포스파티딜세린",
    defaultUnit: "mg",
  },
  {
    patterns: [/초록입홍합|리프리놀/i],
    nutrient: "초록입홍합추출오일",
    defaultUnit: "mg",
  },
  {
    patterns: [/쏘팔메토|saw\s?palmetto/i],
    nutrient: "쏘팔메토열매추출물",
    defaultUnit: "mg",
  },
  { patterns: [/마카/i], nutrient: "마카분말", defaultUnit: "mg" },
  { patterns: [/노니/i], nutrient: "노니분말", defaultUnit: "mg" },
  {
    patterns: [/프로폴리스/i],
    nutrient: "프로폴리스추출물",
    defaultUnit: "mg",
  },
  {
    patterns: [/스피루리나|클로렐라/i],
    nutrient: "스피루리나",
    defaultUnit: "mg",
  },
  {
    patterns: [/히알루론산|hyaluronic/i],
    nutrient: "히알루론산",
    defaultUnit: "mg",
  },
  {
    patterns: [/엘-카르니틴|L-carnitine|카르니틴/i],
    nutrient: "L-카르니틴",
    defaultUnit: "mg",
  },
  {
    patterns: [/CLA\b|공액리놀레산/i],
    nutrient: "CLA(공액리놀레산)",
    defaultUnit: "mg",
  },
  { patterns: [/아르기닌/i], nutrient: "L-아르기닌", defaultUnit: "mg" },
  { patterns: [/트립토판/i], nutrient: "L-트립토판", defaultUnit: "mg" },
  {
    patterns: [/바나바|코로솔산/i],
    nutrient: "바나바잎추출물",
    defaultUnit: "mg",
  },
  { patterns: [/크롬|chromium/i], nutrient: "크롬", defaultUnit: "μg" },
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
    const matched = patterns.some((p) => p.test(productName));
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
    const percent_dv =
      amount > 0 && dvRef && dvRef.unit === unit
        ? Math.round((amount / dvRef.dv) * 100)
        : null;

    results.push({
      name: nutrient,
      amount,
      unit,
      percent_dv,
      source: "product-name-inference",
    });
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
  nutritionStr: string,
): AnalysisResult {
  // API 보강 경로에서는 원문 NUT_MTR/STDR_STND에서 명시적으로 파싱된 값만 저장한다.
  // 제품명 키워드는 성분의 실제 포함 여부나 함량을 증명하지 못한다.
  const nutrition_facts = parseNutritionFacts(nutritionStr);
  const { summary, effects, cautions } = generateSummaryTexts(
    productName,
    rawMaterials,
    nutrition_facts,
  );
  return { summary, effects, cautions, nutrition_facts };
}

/**
 * C003 API 없이 제품명만으로 분석
 */
export function analyzeFromNameOnly(productName: string): AnalysisResult {
  void productName;
  throw new Error(
    "Product-name-only nutrition inference is disabled. Use an explicit Food Safety Korea C003 field.",
  );
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

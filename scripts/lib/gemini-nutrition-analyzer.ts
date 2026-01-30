/**
 * Centralized Gemini AI Nutrition Analyzer
 * Shared between sync-supplements.ts and auto-enrich-supplements.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface NutritionFact {
    name: string;
    amount: number;
    unit: string;
    percent_dv: number;
}

export interface AIAnalysisResult {
    summary: string;
    effects: string;
    cautions: string;
    nutrition_facts: NutritionFact[];
    status?: 'success' | 'failed';
}

/**
 * Generate AI analysis for a supplement product
 */
export async function generateAIAnalysis(
    genAI: GoogleGenerativeAI,
    productName: string,
    ingredients: string,
    nutritionFacts: string
): Promise<AIAnalysisResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `당신은 영양학 전문가입니다. 다음 건강기능식품을 객관적으로 분석해주세요.

제품명: ${productName}
원재료: ${ingredients}
영양성분: ${nutritionFacts}

규칙:
1. 상업적 표현을 배제하고 팩트 위주로 작성하세요.
2. nutrition_facts 추출 시 엄격한 규칙:
   - "정제수", "글리세린", "착향료", "캡슐기제" 등 영양소가 아닌 단순 원재료는 절대 포함하지 마세요.
   - 오직 비타민, 미네랄, 단백질, 지방, 기능성 지표성분(예: 코엔자임Q10, 진세노사이드, 루테인)만 포함하세요.
   - 성분명은 한글로 표준화하여 작성하세요 (예: "Vitamin C" -> "비타민C").
   - percent_dv (1일 영양성분 기준치에 대한 비율, 단위: %)
     - 텍스트에 "%" 정보가 있다면 그 값을 사용하세요.
     - 정보가 없다면, 함량(amount)을 기반으로 한국인 성인 1일 권장량 대비 비율을 직접 계산해서 정수로 넣으세요.
     - 기준치 참고: 비타민C 100mg, 비타민D 10ug(400IU), 아연 8.5mg, 마그네슘 315mg, 칼슘 700mg, 철분 12mg, 비타민B1 1.2mg, 비타민B2 1.4mg, 나이아신 16mg, 비타민B6 1.5mg, 엽산 400ug, 비타민B12 2.4ug, 비오틴 30ug.
     - 기준치가 없는 성분(코엔자임Q10, 프로폴리스, 루테인 등)은 percent_dv를 null로 설정하세요. (0이 아님)
   - amount(함량)는 숫자만 추출하세요. (없으면 0)

다음 JSON 형식으로만 응답해주세요:
{
  "summary": "제품의 핵심 특징을 1문장으로 요약",
  "effects": "주요 효능 및 기대 효과 (2-3문장, 과장 없이)",
  "cautions": "섭취 시 주의사항 및 부작용 가능성 (2-3문장)",
  "nutrition_facts": [
    { "name": "비타민C", "amount": 1000, "unit": "mg", "percent_dv": 1000 },
    { "name": "코엔자임Q10", "amount": 100, "unit": "mg", "percent_dv": null }
  ]
}`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        return {
            summary: parsed.summary || "",
            effects: parsed.effects || "",
            cautions: parsed.cautions || "",
            nutrition_facts: parsed.nutrition_facts || [],
            status: 'success'
        };
    } catch (error) {
        console.error("Gemini API error:", error);
        return {
            summary: "AI 요약을 생성할 수 없습니다.",
            effects: "",
            cautions: "",
            nutrition_facts: [],
            status: 'failed'
        };
    }
}

/**
 * Parse nutrition facts string to structured data (Fallback parser)
 */
export function parseNutritionFacts(nutStr: string): NutritionFact[] {
    const nutrients: NutritionFact[] = [];

    if (!nutStr) return nutrients;

    const parts = nutStr.split(",");
    for (const part of parts) {
        const match = part.match(/([가-힣A-Za-z0-9]+)\s*([\d.]+)\s*([a-zμmg]+)/i);
        if (match) {
            const [, name, amount, unit] = match;
            const percentMatch = part.match(/\((\d+)%\)/);
            const percent_dv = percentMatch ? parseInt(percentMatch[1], 10) : 0;

            nutrients.push({
                name: name.trim(),
                amount: parseFloat(amount),
                unit: unit.trim(),
                percent_dv,
            });
        }
    }

    return nutrients;
}

/**
 * Create mixed summary JSON for ai_summary field
 */
export function createMixedSummary(analysis: AIAnalysisResult): string {
    return JSON.stringify({
        summary: analysis.summary,
        effects: analysis.effects,
        cautions: analysis.cautions
    });
}

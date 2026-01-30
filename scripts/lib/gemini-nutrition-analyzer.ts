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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `당신은 영양학 전문가입니다. 다음 건강기능식품을 객관적으로 분석해주세요.

제품명: ${productName}
원재료: ${ingredients}
영양성분: ${nutritionFacts}

다음 JSON 형식으로만 응답해주세요:
{
  "summary": "제품의 핵심 특징을 1문장으로 요약",
  "effects": "주요 효능 및 기대 효과 (2-3문장, 과장 없이)",
  "cautions": "섭취 시 주의사항 및 부작용 가능성 (2-3문장)",
  "nutrition_facts": [
    { "name": "성분명", "amount": 1000, "unit": "mg", "percent_dv": 100 }
  ]
}

주의사항:
- 상업적 표현을 배제하고 팩트 위주로 작성하세요.
- nutrition_facts는 영양성분 텍스트에서 가능한 모든 성분을 추출하세요.
- 성분명은 한글로 작성하세요.
- 만약 함량 정보를 추출할 수 없다면 nutrition_facts는 빈 배열로 두세요.`;

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

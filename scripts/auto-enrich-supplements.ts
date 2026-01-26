
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Use Gemini to analyze and extract nutrition info
 */
async function generateAIAnalysis(
    productName: string,
    ingredients: string,
    nutritionFacts: string
): Promise<{ summary: string, nutrition_facts: any[] }> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `당신은 영양학 전문가입니다. 다음 건강기능식품을 객관적으로 분석해주세요.

제품명: ${productName}
원재료: ${ingredients}
영양성분: ${nutritionFacts}

다음 JSON 형식으로만 응답해주세요:
{
  "summary": "1. 주요 성분과 함량 설명\\n2. 기대 효과 (과장 없이)\\n3. 섭취 시 주의사항 (있다면)",
  "nutrition_facts": [
    { "name": "성분명", "amount": 1000, "unit": "mg", "percent_dv": 100 }
  ]
}

주의사항:
- summary는 3-4문장으로 작성하고 상업적 표현을 배제하세요.
- nutrition_facts는 영양성분 텍스트에서 가능한 모든 성분을 추출하세요.
- 성분명은 한글로 작성하세요.
- 만약 함량 정보를 추출할 수 없다면 nutrition_facts는 빈 배열로 두세요.`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        return {
            summary: parsed.summary || "AI 요약을 생성할 수 없습니다.",
            nutrition_facts: parsed.nutrition_facts || []
        };
    } catch (error) {
        console.error("Gemini API error:", error);
        return {
            summary: "AI 요약을 생성할 수 없습니다.",
            nutrition_facts: []
        };
    }
}

async function autoEnrichSupplements() {
    const limit = parseInt(process.argv[2] || "100", 10);
    console.log(`🚀 Starting automated nutrition info enrichment (Limit: ${limit})...\n`);

    // Fetch supplements where nutrition_facts is null (not yet processed)
    const { data: supplements, error } = await supabase
        .from("supplements")
        .select("id, name, product_report_no")
        .is("nutrition_facts", null)
        .limit(limit);

    if (error) {
        console.error("Error fetching supplements:", error);
        return;
    }

    if (supplements.length === 0) {
        console.log("✅ No pending supplements found for enrichment.");
        return;
    }

    console.log(`📦 Found ${supplements.length} supplements to enrich.\n`);

    for (const item of supplements) {
        console.log(`Processing: ${item.name} (${item.product_report_no})...`);

        const SERVICE_ID = "C003";
        const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;
        const url = `http://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/1/1/PRDLST_REPORT_NO=${item.product_report_no}`;

        try {
            const response = await fetch(url);
            const apiData = await response.json();
            const rawItem = apiData[SERVICE_ID]?.row?.[0];

            if (!rawItem) {
                console.warn(`⚠️ Could not find raw data for ${item.name}`);
                // Mark as processed with empty array to avoid infinite loop if API fails
                await supabase.from("supplements").update({ nutrition_facts: [] }).eq("id", item.id);
                continue;
            }

            const rawMaterials = rawItem.RAWMTRL_NM || "";
            const nutritionStr = rawItem.NUT_MTR || rawItem.STDR_STND || "";

            const aiAnalysis = await generateAIAnalysis(item.name, rawMaterials, nutritionStr);

            // Even if empty, we save something to mark it as "tried"
            const { error: updateError } = await supabase
                .from("supplements")
                .update({
                    nutrition_facts: aiAnalysis.nutrition_facts || [],
                    ai_summary: aiAnalysis.summary
                })
                .eq("id", item.id);

            if (updateError) {
                console.error(`❌ Failed to update ${item.name}:`, updateError.message);
            } else {
                console.log(`✅ Enriched: ${item.name} (${aiAnalysis.nutrition_facts.length} nutrients found)`);
            }

            // Rate limit for Gemini (Reduced for faster processing, 1s is generally safe for paid or high-tier free)
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (err) {
            console.error(`Error processing ${item.name}:`, err);
        }
    }

    console.log("\n✨ Enrichment batch completed!");
}

autoEnrichSupplements().catch(console.error);

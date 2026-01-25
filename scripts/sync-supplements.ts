/**
 * Data Sync Script for Supplements (Wiki)
 * 
 * This script:
 * 1. Fetches supplement data from Food Safety Korea API
 * 2. Processes with Gemini AI for summaries
 * 3. Upserts to Supabase (supplements & ingredients tables)
 * 
 * Usage: npm run sync:supplements
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Tag Mapping Definition (Same as in fix-supplement-tags.ts)
const TAG_MAP: Record<string, string[]> = {
    "vitamin-c": ["비타민C", "비타민 C", "Vitamin C", "Ascorbic Acid", "아스코르브산"],
    "fatigue": ["피로", "활력", "에너지", "만성피로", "Fatigue", "Energy"],
    "immune": ["면역", "아연", "Immune", "Zinc"],
    "eye": ["눈", "루테인", "지아잔틴", "시력", "Eye", "Lutein"],
    "liver": ["간", "밀크씨슬", "실리마린", "Liver", "Milk Thistle"],
    "probiotics": ["유산균", "프로바이오틱스", "장건강", "Probiotics"],
    "omega3": ["오메가3", "rTG", "DHA", "EPA", "Omega-3"],
    "multivitamin": ["멀티비타민", "종합비타민", "Multivitamin"],
    "skin": ["피부", "콜라겐", "히알루론산", "Skin", "Collagen"],
    "bone": ["뼈", "칼슘", "마그네슘", "비타민D", "Bone", "Calcium", "Magnesium"],
};

interface RawSupplementData {
    PRDLST_REPORT_NO: string; // 품목제조번호
    PRDUCT: string; // 제품명
    BSSH_NM: string; // 제조사
    RAWMTRL_NM: string; // 원재료명
    NUT_MTR: string; // 영양성분
    STDR_STND: string; // 기능성내용
    LCNS_NO?: string; // 인허가번호
}

/**
 * Fetch supplement data from Food Safety Korea API
 */
async function fetchSupplementData(
    pageNo: number = 1,
    numOfRows: number = 100
): Promise<RawSupplementData[]> {
    const SERVICE_ID = "C003"; // Health Functional Food service
    const url = `http://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/${pageNo}/${numOfRows}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data[SERVICE_ID]?.row) {
            return data[SERVICE_ID].row;
        }

        console.warn("No data found in API response");
        return [];
    } catch (error) {
        console.error("Failed to fetch supplement data:", error);
        return [];
    }
}

/**
 * Use Gemini to analyze and summarize supplement data
 */
async function generateAISummary(
    productName: string,
    ingredients: string,
    nutritionFacts: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `당신은 영양학 전문가입니다. 다음 건강기능식품을 객관적으로 분석해주세요.

제품명: ${productName}
원재료: ${ingredients}
영양성분: ${nutritionFacts}

다음 형식으로 3-4문장으로 요약해주세요:
1. 주요 성분과 함량 설명
2. 기대 효과 (과장 없이)
3. 섭취 시 주의사항 (있다면)

상업적 표현을 배제하고, 팩트 위주로 작성하세요.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini API error:", error);
        return "AI 요약을 생성할 수 없습니다.";
    }
}

/**
 * Parse nutrition facts string to structured data
 */
function parseNutritionFacts(nutStr: string): Array<{
    name: string;
    amount: number;
    unit: string;
    percent_dv: number;
}> {
    // Example parsing logic (adjust based on actual API format)
    // Format assumption: "비타민C 1000mg (1000%), 비타민D 25μg (250%)"
    const nutrients: Array<any> = [];

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
 * Generate tags based on keyword matching
 */
function generateTags(
    name: string,
    aiSummary: string,
    nutritionFacts: any[]
): string[] {
    const contentToSearch = [
        name,
        aiSummary,
        JSON.stringify(nutritionFacts)
    ].join(" ").toLowerCase();

    const tags: Set<string> = new Set();

    for (const [tagId, keywords] of Object.entries(TAG_MAP)) {
        if (keywords.some(kw => contentToSearch.includes(kw.toLowerCase()))) {
            tags.add(tagId);
        }
    }

    return Array.from(tags);
}

/**
 * Main sync function
 */
async function syncSupplements() {
    console.log("🚀 Starting supplement data sync...\n");

    const rawData = await fetchSupplementData(1, 10); // Fetch first 10 for testing
    console.log(`📦 Fetched ${rawData.length} supplements from API\n`);

    if (rawData.length > 0) {
        console.log("DEBUG: Raw first item keys:", Object.keys(rawData[0]));
        console.log("DEBUG: Raw first item sample:", JSON.stringify(rawData[0], null, 2));
    }

    for (const rawItem of rawData) {
        try {
            const item = rawItem as any;
            // Food Safety API fields can sometimes vary between camelCase and SNAKE_CASE depending on the exact endpoint
            const productReportNo = item.PRDLST_REPORT_NO || item.LCNS_NO || item.lcns_no;
            const name = item.PRDUCT || item.PRDLST_NM || item.prdlst_nm;
            const manufacturer = item.BSSH_NM || item.MAKE_IT_NM || item.make_it_nm;
            const rawMaterials = item.RAWMTRL_NM || item.RAW_MATERIALS || item.raw_materials || "";
            const nutritionStr = item.NUT_MTR || item.STDR_STND || item.stnd_stnd || "";

            if (!name) {
                console.warn("⚠️ Skip: Product name is missing in raw data.");
                continue;
            }

            console.log(`Processing: ${name}...`);

            // Generate AI summary
            const aiSummary = await generateAISummary(
                name,
                rawMaterials,
                nutritionStr
            );

            // Parse nutrition facts
            const nutritionFacts = parseNutritionFacts(nutritionStr);

            // Check for additives (simple keyword check)
            const additives = {
                has_preservatives: rawMaterials.includes("보존료") || rawMaterials.includes("안식향산"),
                has_coloring: rawMaterials.includes("착색료") || rawMaterials.includes("이산화티타늄"),
                has_artificial_sweeteners: rawMaterials.includes("아스파탐") || rawMaterials.includes("수크랄로스"),
                details: [] as string[],
            };

            // Upsert to Supabase
            const { error } = await supabase.from("supplements").upsert(
                {
                    product_report_no: productReportNo,
                    name,
                    manufacturer,
                    nutrition_facts: nutritionFacts,
                    additives,
                    ai_summary: aiSummary,
                    tags: generateTags(name, aiSummary, nutritionFacts),
                },
                { onConflict: "product_report_no" }
            );

            if (error) {
                console.error(`❌ Failed to insert ${name}:`, error.message);
            } else {
                console.log(`✅ Synced: ${name}`);
            }

            // Rate limiting for Gemini API
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error processing item:`, error);
        }
    }

    console.log("\n✨ Sync completed!");
}

// Run the script
syncSupplements().catch(console.error);

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
import { generateAIAnalysis, parseNutritionFacts, createMixedSummary } from "./lib/gemini-nutrition-analyzer";
import { detectAdditives } from "./lib/additive-keywords";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Tag Mapping Definition
const TAG_MAP: Record<string, string[]> = {
    "vitamin-c": ["비타민C", "비타민 C", "Vitamin C", "Ascorbic Acid", "아스코르브산"],
    "fatigue": ["피로", "활력", "에너지", "만성피로", "Fatigue", "Energy", "인삼", "홍삼"],
    "immune": ["면역", "아연", "Immune", "Zinc", "인삼", "홍삼"],
    "eye": ["눈", "루테인", "지아잔틴", "시력", "Eye", "Lutein"],
    "liver": ["간", "밀크씨슬", "실리마린", "Liver", "Milk Thistle"],
    "probiotics": ["유산균", "프로바이오틱스", "장건강", "Probiotics", "비피더스"],
    "omega3": ["오메가3", "rTG", "DHA", "EPA", "Omega-3"],
    "multivitamin": ["멀티비타민", "종합비타민", "Multivitamin", "비타민"],
    "skin": ["피부", "콜라겐", "히알루론산", "Skin", "Collagen"],
    "bone": ["뼈", "칼슘", "마그네슘", "비타민D", "Bone", "Calcium", "Magnesium"],
};

interface RawSupplementData {
    PRDLST_REPORT_NO: string;
    PRDUCT: string;
    BSSH_NM: string;
    RAWMTRL_NM: string;
    NUT_MTR: string;
    STDR_STND: string;
    LCNS_NO?: string;
}

/**
 * Fetch supplement data from Food Safety Korea API
 */
async function fetchSupplementData(
    pageNo: number = 1,
    numOfRows: number = 100
): Promise<RawSupplementData[]> {
    const SERVICE_ID = "C003";
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
            keywords.forEach(kw => {
                if (/^[가-힣]+$/.test(kw)) tags.add(kw);
            });
        }
    }

    return Array.from(tags);
}

/**
 * Main sync function
 */
async function syncSupplements() {
    console.log("🚀 Starting supplement data sync...\n");

    const rawData = await fetchSupplementData(1, 10);
    console.log(`📦 Fetched ${rawData.length} supplements from API\n`);

    if (rawData.length > 0) {
        console.log("DEBUG: Raw first item keys:", Object.keys(rawData[0]));
        console.log("DEBUG: Raw first item sample:", JSON.stringify(rawData[0], null, 2));
    }

    let successCount = 0;
    let failCount = 0;

    for (const rawItem of rawData) {
        try {
            const item = rawItem as any;
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

            // Use centralized AI analysis
            const aiAnalysis = await generateAIAnalysis(genAI, name, rawMaterials, nutritionStr);

            // Parse nutrition facts (AI first, then fallback)
            let nutritionFacts = aiAnalysis.nutrition_facts;
            if (nutritionFacts.length === 0) {
                nutritionFacts = parseNutritionFacts(nutritionStr);
            }

            // Use centralized additive detection
            const additives = detectAdditives(rawMaterials);

            // Store structured data
            const mixedSummary = createMixedSummary(aiAnalysis);

            const enrichmentStatus = aiAnalysis.status === 'failed' ? 'failed' : 'success';

            // Upsert to Supabase
            const { error } = await supabase.from("supplements").upsert(
                {
                    product_report_no: productReportNo,
                    name,
                    manufacturer,
                    nutrition_facts: nutritionFacts,
                    additives,
                    ai_summary: mixedSummary,
                    tags: generateTags(name, aiAnalysis.summary, nutritionFacts),
                    enrichment_status: enrichmentStatus,
                    enrichment_tried_at: new Date().toISOString()
                },
                { onConflict: "product_report_no" }
            );

            if (error) {
                console.error(`❌ Failed to insert ${name}:`, error.message);
                failCount++;
            } else {
                console.log(`✅ Synced: ${name}`);
                successCount++;
            }

            // Rate limiting for Gemini API
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error processing item:`, error);
            failCount++;
        }
    }

    console.log(`\n✨ Sync completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
}

// Run the script
syncSupplements().catch(console.error);

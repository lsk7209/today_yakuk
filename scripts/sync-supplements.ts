/**
 * Data Sync Script for Supplements (Wiki)
 *
 * This script:
 * 1. Fetches supplement data from Food Safety Korea API
 * 2. Parses explicitly reported nutrition data without name-based inference
 * 3. Upserts factual fields to Turso (supplements table)
 *
 * Usage: npm run sync:supplements
 */

import dotenv from "dotenv";
import { parseNutritionFacts } from "./lib/nutrition-parser";
import { detectAdditives } from "./lib/additive-keywords";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;

const db = getTursoClient();

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
    PRDUCT?: string;
    PRDLST_NM?: string;
    BSSH_NM: string;
    RAWMTRL_NM: string;
    NUT_MTR: string;
    STDR_STND: string;
}

interface HffApiResponse {
    C003?: {
        row?: RawSupplementData[];
        RESULT?: { CODE?: string; MSG?: string };
    };
}

async function fetchSupplementData(startIdx = 1, endIdx = 10): Promise<RawSupplementData[]> {
    const SERVICE_ID = "C003";
    const url = `https://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/${startIdx}/${endIdx}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HFF API request failed (${response.status} ${response.statusText})`);
    }

    const data = await response.json() as HffApiResponse;
    const service = data.C003;
    if (!service?.RESULT) {
        throw new Error("HFF API returned an invalid response shape");
    }
    if (service.RESULT.CODE !== "INFO-000") {
        throw new Error(`HFF API error ${service.RESULT.CODE}: ${service.RESULT.MSG || "unknown"}`);
    }
    if (!Array.isArray(service.row) || service.row.length === 0) {
        throw new Error("HFF API returned no rows for the requested range");
    }
    return service.row;
}

function generateTags(name: string, reportedMaterials: string, nutritionFacts: unknown[]): string[] {
    const contentToSearch = [name, reportedMaterials, JSON.stringify(nutritionFacts)].join(" ").toLowerCase();
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

async function syncSupplements() {
    console.log("🚀 Starting supplement data sync...\n");

    if (!FOOD_SAFETY_API_KEY) {
        throw new Error("FOOD_SAFETY_API_KEY 환경변수가 없습니다.");
    }

    const rawData = await fetchSupplementData(1, 10);
    if (rawData.length !== 10) {
        throw new Error(`HFF API returned ${rawData.length}/10 expected rows`);
    }
    console.log(`📦 Fetched ${rawData.length} supplements from API\n`);

    let successCount = 0;
    let failCount = 0;
    let noDataCount = 0;

    for (const rawItem of rawData) {
        try {
            const item = rawItem as unknown as Record<string, string>;
            const productReportNo = item.PRDLST_REPORT_NO || item.prdlst_report_no;
            const name = item.PRDUCT || item.PRDLST_NM || item.prdlst_nm;
            const manufacturer = item.BSSH_NM || item.MAKE_IT_NM || item.make_it_nm;
            const rawMaterials = item.RAWMTRL_NM || item.RAW_MATERIALS || item.raw_materials || "";
            const nutritionStr = item.NUT_MTR || item.STDR_STND || item.stnd_stnd || "";

            if (!productReportNo || !name) {
                throw new Error("Product report number or product name is missing in raw data");
            }

            console.log(`Processing: ${name}...`);

            const nutritionFacts = parseNutritionFacts(nutritionStr);
            if (nutritionFacts.length === 0) {
                console.warn(`⚠️ Skip without DB write: no structured C003 nutrition facts for ${name}`);
                noDataCount++;
                continue;
            }

            const additives = detectAdditives(rawMaterials);

            await db.execute({
                sql: `INSERT INTO supplements
                      (product_report_no, name, manufacturer, nutrition_facts, additives, tags)
                      VALUES (?, ?, ?, ?, ?, ?)
                      ON CONFLICT(product_report_no) DO UPDATE SET
                        name = excluded.name,
                        manufacturer = excluded.manufacturer,
                        nutrition_facts = excluded.nutrition_facts,
                        additives = excluded.additives,
                        tags = excluded.tags`,
                args: [
                    productReportNo, name, manufacturer,
                    JSON.stringify(nutritionFacts),
                    JSON.stringify(additives),
                    JSON.stringify(generateTags(name, rawMaterials, nutritionFacts)),
                ],
            });

            console.log(`✅ Synced: ${name}`);
            successCount++;

            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error processing item:`, error);
            failCount++;
        }
    }

    console.log(`\n✨ Sync completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   No data: ${noDataCount}`);
    console.log(`   Failed: ${failCount}`);
    if (failCount > 0 || noDataCount > 0 || successCount !== rawData.length) {
        throw new Error(
            `Supplement sync incomplete: success=${successCount}, noData=${noDataCount}, failed=${failCount}`,
        );
    }
}

syncSupplements().catch((error) => {
    console.error("Supplement sync failed:", error);
    process.exitCode = 1;
});

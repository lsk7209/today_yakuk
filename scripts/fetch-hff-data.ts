import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { Supplement } from "../src/lib/data/pharmacies";

// Config
const API_KEY = process.env.FOOD_SAFETY_API_KEY;
const SERVICE_ID = "C003"; // 건강기능식품 품목제조신고(원재료)
const BASE_URL = "http://openapi.foodsafetykorea.go.kr/api";
const BATCH_SIZE = 1000; // API supports batching, safe limit usually 1000
const DELAY_MS = 1000; // Delay between batches

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Error: Missing Supabase environment variables.");
    process.exit(1);
}
if (!API_KEY) {
    console.error("❌ Error: Missing FOOD_SAFETY_API_KEY environment variable.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface HffApiResponse {
    C003: {
        total_count: string;
        row: HffItem[];
        RESULT: {
            CODE: string;
            MSG: string;
        };
    };
}

interface HffItem {
    PRDLST_REPORT_NO: string; // 품목제조번호 (Unique)
    PRDLST_NM: string; // 제품명
    BSSH_NM: string; // 업소명(제조사)
    PRIMARY_FNCLTY: string; // 주된기능성
    RAWMTRL_NM: string; // 원재료
    POG_DAYCNT: string; // 소비기한
    DISPOS: string; // 성상
    NTK_MTHD: string; // 섭취방법
    CSTDY_MTHD: string; // 보관방법
    STDR_STND: string; // 기준규격
    LCNS_NO: string; // 인허가번호
    PRMS_DT: string; // 보고일자
    CRET_DTM: string; // 최초생성일시
    LAST_UPDT_DTM: string; // 최종수정일시
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchHffData(startIdx: number, endIdx: number): Promise<{ items: HffItem[], total: number }> {
    const url = `${BASE_URL}/${API_KEY}/${SERVICE_ID}/json/${startIdx}/${endIdx}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API fetch failed: ${response.statusText}`);
        }
        const data: HffApiResponse = await response.json();

        if (data.C003.RESULT.CODE !== "INFO-000") {
            console.warn(`⚠️ API Result Code: ${data.C003.RESULT.CODE} (${data.C003.RESULT.MSG})`);
            // If 'INFO-200' (No Data), return empty
            return { items: [], total: 0 };
        }

        const total = parseInt(data.C003.total_count, 10) || 0;
        return { items: data.C003.row ?? [], total };
    } catch (error) {
        console.error(`❌ Fetch error (Idx: ${startIdx}-${endIdx}):`, error);
        return { items: [], total: 0 };
    }
}

function mapToSupplement(item: HffItem): Partial<Supplement> {
    return {
        product_report_no: item.PRDLST_REPORT_NO,
        name: item.PRDLST_NM,
        manufacturer: item.BSSH_NM,
        ai_summary: item.PRIMARY_FNCLTY,
        additives: {
            has_preservatives: false,
            details: [item.RAWMTRL_NM]
        },
        nutrition_facts: null,
        tags: [],
        image_url: null,
    } as any;
}

async function processBatch(items: HffItem[]) {
    if (items.length === 0) return;
    const supplementsToUpsert = items.map(mapToSupplement);
    const { error } = await supabase.from("supplements").upsert(supplementsToUpsert, {
        onConflict: "product_report_no",
        ignoreDuplicates: false
    });
    if (error) {
        console.error("❌ Supabase upsert error:", error);
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const mode = args[0];

    if (mode === "all") {
        console.log("🚀 Starting Full Data Sync Mode...");

        // 1. Initial Check
        const { total } = await fetchHffData(1, 1);
        console.log(`📊 Total Records Found: ${total}`);

        if (total === 0) {
            console.log("Nothing to sync.");
            return;
        }

        let processed = 0;
        let failedBatches = 0;

        // 2. Loop
        for (let start = 1; start <= total; start += BATCH_SIZE) {
            let end = start + BATCH_SIZE - 1;
            if (end > total) end = total;

            console.log(`🔄 Fetching batch ${start} ~ ${end} (${Math.round(start / total * 100)}%)...`);

            try {
                const { items } = await fetchHffData(start, end);
                await processBatch(items);
                processed += items.length;

                // Log progress
                process.stdout.write(`\r✅ Processed: ${processed}/${total}`);

                // Delay
                await sleep(DELAY_MS);
            } catch (e) {
                console.error(`\n❌ Batch failed at ${start}~${end}. Continuing...`);
                failedBatches++;
                await sleep(DELAY_MS * 2);
            }
        }

        console.log(`\n\n🎉 Full Sync Completed!`);
        console.log(`Subject: Health Functional Food Data`);
        console.log(`Total Processed: ${processed}`);
        console.log(`Failed Batches: ${failedBatches}`);

    } else {
        // Legacy Mode: Single Batch
        const startArg = parseInt(args[0] || "1", 10);
        const limitArg = parseInt(args[1] || "100", 10);

        console.log(`🚀 Starting Single Batch Fetch... (Start: ${startArg}, Limit: ${limitArg})`);

        const { items, total } = await fetchHffData(startArg, startArg + limitArg - 1);

        if (items.length > 0) {
            console.log(`📊 API Total Count: ${total}`);
            await processBatch(items);
            console.log(`🎉 Successfully upserted ${items.length} items!`);
        } else {
            console.log("No items found.");
        }
    }
}

main().catch(console.error);

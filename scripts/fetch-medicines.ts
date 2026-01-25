import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import { createClient } from "@supabase/supabase-js";

// Config
const API_KEY = process.env.MEDICINE_API_KEY; // Decoded key usually works best with some libraries, encoded with others. Let's try raw first.
// The user provided both. In .env.local I put the DECODED key because 'axios'/'fetch' usually handles encoding if we pass params correctly.
// But openapi often requires double encoding or specific handling.
// Let's assume the key in .env is correct for now.
const BASE_URL = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";
const BATCH_SIZE = 100; // API Limit per page

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Error: Missing Supabase environment variables.");
    process.exit(1);
}
if (!API_KEY) {
    console.error("❌ Error: Missing MEDICINE_API_KEY environment variable.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MedItem {
    itemSeq: string; // 품목기준코드 (Unique)
    itemName: string; // 제품명
    entpName: string; // 업체명
    efcyQesitm: string | null; // 효능
    useMethodQesitm: string | null; // 사용법
    atpnWarnQesitm: string | null; // 주의사항경고
    atpnQesitm: string | null; // 주의사항
    intrcQesitm: string | null; // 상호작용
    seQesitm: string | null; // 부작용
    depositMethodQesitm: string | null; // 보관법
    itemImage: string | null; // 이미지
}

interface ApiResponse {
    body: {
        numOfRows: number;
        pageNo: number;
        totalCount: number;
        items: MedItem[]; // XML to JSON conversion usually results in 'item' array inside 'items' or directly.
        // Public Data Portal JSON response structure varies.
        // Standard: response.body.items.item[] or response.body.items[]
    };
    header: {
        resultCode: string;
        resultMsg: string;
    };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchMedicineData(pageNo: number, numOfRows: number): Promise<{ items: MedItem[], total: number }> {
    // Manual query string construction to ensure Key isn't double-encoded if already encoded, 
    // or use URLSearchParams if key is decoded.
    // User provided DECODED key in prompt. So URLSearchParams should encode it correctly.

    const params = new URLSearchParams({
        serviceKey: API_KEY!,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
        type: 'json'
    });

    const url = `${BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API fetch failed: ${response.statusText}`);
        }

        // Some govt APIs return text/html on error instead of JSON logic
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("JSON Parse Error. Raw text:", text.substring(0, 100));
            return { items: [], total: 0 };
        }

        if (!data.body || !data.body.items) {
            console.warn("No body/items in response:", JSON.stringify(data).substring(0, 100));
            return { items: [], total: 0 };
        }

        const total = data.body.totalCount ?? 0;
        // items can be an array or null
        const items = Array.isArray(data.body.items) ? data.body.items : (data.body.items ? [data.body.items] : []);

        return { items, total };
    } catch (error) {
        console.error(`Fetch error (Page: ${pageNo}):`, error);
        return { items: [], total: 0 };
    }
}

function normalizeText(text: string | null): string | null {
    if (!text) return null;
    // Remove CDATA or standard XML/HTML entities if JSON returns them unclean
    return text.replace(/<[^>]*>?/gm, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ")
        .trim();
}

async function processBatch(items: MedItem[]) {
    if (items.length === 0) return;

    const dbItems = items.map(item => ({
        item_seq: item.itemSeq,
        name: item.itemName,
        manufacturer: item.entpName,
        efficacy: normalizeText(item.efcyQesitm),
        use_method: normalizeText(item.useMethodQesitm),
        warning_general: normalizeText(item.atpnWarnQesitm),
        warning_usage: normalizeText(item.atpnQesitm),
        interactions: normalizeText(item.intrcQesitm),
        side_effects: normalizeText(item.seQesitm),
        storage_method: normalizeText(item.depositMethodQesitm),
        image_url: item.itemImage,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from("medicines").upsert(dbItems, {
        onConflict: "item_seq",
        ignoreDuplicates: false
    });

    if (error) {
        console.error("❌ Supabase upsert error:", error);
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const mode = args[0] || "1"; // Default to page 1

    if (mode === "all") {
        console.log("🚀 Starting Full Medicines Sync...");

        const { total, items: firstItems } = await fetchMedicineData(1, 1);
        console.log(`📊 Total Records Found: ${total}`);

        if (total === 0) return;

        // Process all pages
        const totalPages = Math.ceil(total / BATCH_SIZE);
        let processed = 0;

        for (let page = 1; page <= totalPages; page++) {
            console.log(`🔄 Fetching Page ${page}/${totalPages}...`);
            try {
                const { items } = await fetchMedicineData(page, BATCH_SIZE);
                if (items.length > 0) {
                    await processBatch(items);
                    processed += items.length;
                }
                process.stdout.write(`\r✅ Processed: ${processed}/${total}`);
                await sleep(200); // 10k calls limit, but be gentle
            } catch (e) {
                console.error(`\n❌ Page ${page} failed.`);
                await sleep(1000);
            }
        }
        console.log(`\n🎉 Full Sync Completed! Total: ${processed}`);

    } else {
        // Single page test
        const page = parseInt(mode, 10);
        const limit = parseInt(args[1] || "10", 10);

        console.log(`🚀 Fetching Page ${page} (Limit ${limit})...`);
        const { items, total } = await fetchMedicineData(page, limit);
        console.log(`📊 Total Count: ${total}, Items: ${items.length}`);

        if (items.length > 0) {
            await processBatch(items);
            console.log(`🎉 Upserted ${items.length} items.`);
        }
    }
}

main().catch(console.error);

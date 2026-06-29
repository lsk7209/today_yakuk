import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import { getTursoClient } from "../src/lib/turso";

const API_KEY = process.env.FOOD_SAFETY_API_KEY;
const SERVICE_ID = "C003";
const BASE_URL = "http://openapi.foodsafetykorea.go.kr/api";
const BATCH_SIZE = 1000;
const DELAY_MS = 1000;

const db = getTursoClient();

if (!API_KEY) {
    console.error("❌ Error: Missing FOOD_SAFETY_API_KEY environment variable.");
    process.exit(1);
}

interface HffApiResponse {
    C003: {
        total_count: string;
        row: HffItem[];
        RESULT: { CODE: string; MSG: string };
    };
}

interface HffItem {
    PRDLST_REPORT_NO: string;
    PRDLST_NM: string;
    BSSH_NM: string;
    PRIMARY_FNCLTY: string;
    RAWMTRL_NM: string;
    POG_DAYCNT: string;
    DISPOS: string;
    NTK_MTHD: string;
    CSTDY_MTHD: string;
    STDR_STND: string;
    LCNS_NO: string;
    PRMS_DT: string;
    CRET_DTM: string;
    LAST_UPDT_DTM: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchHffData(startIdx: number, endIdx: number): Promise<{ items: HffItem[], total: number }> {
    const url = `${BASE_URL}/${API_KEY}/${SERVICE_ID}/json/${startIdx}/${endIdx}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API fetch failed: ${response.statusText}`);
        const data: HffApiResponse = await response.json();

        if (data.C003.RESULT.CODE !== "INFO-000") {
            console.warn(`⚠️ API Result Code: ${data.C003.RESULT.CODE} (${data.C003.RESULT.MSG})`);
            return { items: [], total: 0 };
        }

        const total = parseInt(data.C003.total_count, 10) || 0;
        return { items: data.C003.row ?? [], total };
    } catch (error) {
        console.error(`❌ Fetch error (Idx: ${startIdx}-${endIdx}):`, error);
        return { items: [], total: 0 };
    }
}

async function processBatch(items: HffItem[]) {
    if (items.length === 0) return;

    const statements = items.map(item => ({
        sql: `INSERT INTO supplements
              (product_report_no, name, manufacturer, ai_summary, additives, nutrition_facts, tags)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(product_report_no) DO UPDATE SET
                name = excluded.name,
                manufacturer = excluded.manufacturer,
                ai_summary = excluded.ai_summary,
                additives = excluded.additives,
                nutrition_facts = excluded.nutrition_facts,
                tags = excluded.tags`,
        args: [
            item.PRDLST_REPORT_NO,
            item.PRDLST_NM,
            item.BSSH_NM,
            item.PRIMARY_FNCLTY || null,
            JSON.stringify({ has_preservatives: false, details: [item.RAWMTRL_NM] }),
            null,
            JSON.stringify([]),
        ],
    }));

    await db.batch(statements, "write");
}

async function main() {
    const args = process.argv.slice(2);
    const mode = args[0];

    if (mode === "all") {
        console.log("🚀 Starting Full Data Sync Mode...");

        const { total } = await fetchHffData(1, 1);
        console.log(`📊 Total Records Found: ${total}`);

        if (total === 0) { console.log("Nothing to sync."); return; }

        let processed = 0;
        let failedBatches = 0;

        for (let start = 1; start <= total; start += BATCH_SIZE) {
            const end = Math.min(start + BATCH_SIZE - 1, total);
            console.log(`🔄 Fetching batch ${start} ~ ${end} (${Math.round(start / total * 100)}%)...`);

            try {
                const { items } = await fetchHffData(start, end);
                await processBatch(items);
                processed += items.length;
                process.stdout.write(`\r✅ Processed: ${processed}/${total}`);
                await sleep(DELAY_MS);
            } catch {
                console.error(`\n❌ Batch failed at ${start}~${end}. Continuing...`);
                failedBatches++;
                await sleep(DELAY_MS * 2);
            }
        }

        console.log(`\n\n🎉 Full Sync Completed!`);
        console.log(`Total Processed: ${processed}`);
        console.log(`Failed Batches: ${failedBatches}`);

    } else {
        const startArg = parseInt(args[0] || "1", 10);
        const limitArg = parseInt(args[1] || "100", 10);

        console.log(`🚀 Starting Single Batch Fetch... (Start: ${startArg}, Limit: ${limitArg})`);
        const { items, total } = await fetchHffData(startArg, startArg + limitArg - 1);

        if (items.length > 0) {
            console.log(`📊 API Total Count: ${total}, Items: ${items.length}`);
            await processBatch(items);
            console.log(`🎉 Successfully upserted ${items.length} items!`);
        } else {
            console.log("No items found.");
        }
    }
}

main().catch(console.error);

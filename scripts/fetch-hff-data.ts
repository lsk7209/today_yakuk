import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import { assertExpectedRowsAffected, getRequiredTursoClient } from "../src/lib/turso";
import { buildHffUpsertStatement } from "../src/lib/hff-upsert";

const API_KEY = process.env.FOOD_SAFETY_API_KEY;
const SERVICE_ID = "C003";
const BASE_URL = "https://openapi.foodsafetykorea.go.kr/api";
const BATCH_SIZE = 1000;
const DELAY_MS = 1000;

const db = getRequiredTursoClient();

if (!API_KEY) {
    console.error("❌ Error: Missing FOOD_SAFETY_API_KEY environment variable.");
    process.exit(1);
}

interface HffApiResponse {
    C003: {
        total_count: string;
        row?: HffItem[];
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
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HFF API request failed (${response.status} ${response.statusText})`);
    }

    const data = await response.json() as HffApiResponse;
    if (!data.C003?.RESULT) {
        throw new Error("HFF API returned an invalid response shape");
    }
    if (data.C003.RESULT.CODE !== "INFO-000") {
        throw new Error(`HFF API error ${data.C003.RESULT.CODE}: ${data.C003.RESULT.MSG}`);
    }

    const total = Number.parseInt(data.C003.total_count, 10);
    if (!Number.isSafeInteger(total) || total < 0) {
        throw new Error("HFF API returned an invalid total_count");
    }
    return { items: Array.isArray(data.C003.row) ? data.C003.row : [], total };
}

async function processBatch(items: HffItem[]) {
    if (items.length === 0) return;

    const statements = items.map(buildHffUpsertStatement);

    const results = await db.batch(statements, "write");
    assertExpectedRowsAffected(results, statements.length, "fetch-hff-data batch");
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
                const expectedCount = end - start + 1;
                if (items.length !== expectedCount) {
                    throw new Error(`HFF API returned ${items.length}/${expectedCount} expected rows`);
                }
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

        console.log(`\n\nHFF sync summary`);
        console.log(`Total Processed: ${processed}`);
        console.log(`Failed Batches: ${failedBatches}`);
        if (failedBatches > 0 || processed !== total) {
            throw new Error(`HFF sync incomplete: processed=${processed}, total=${total}, failedBatches=${failedBatches}`);
        }
        console.log("🎉 Full Sync Completed!");

    } else {
        const startText = args[0] || "1";
        const limitText = args[1] || "100";
        if (!/^[1-9]\d*$/.test(startText) || !/^[1-9]\d*$/.test(limitText)) {
            throw new Error("Start and limit must be positive integers");
        }
        const startArg = Number(startText);
        const limitArg = Number(limitText);
        if (!Number.isSafeInteger(startArg) || !Number.isSafeInteger(limitArg) || limitArg > BATCH_SIZE) {
            throw new Error(`Start must be safe and limit must be at most ${BATCH_SIZE}`);
        }

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

main().catch((error) => {
    console.error("❌ HFF sync failed:", error);
    process.exitCode = 1;
});

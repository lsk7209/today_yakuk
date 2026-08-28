import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import { assertExpectedRowsAffected, getRequiredTursoClient } from "../src/lib/turso";

const API_KEY = process.env.MEDICINE_API_KEY || process.env.PUBLIC_DATA_API_KEY;
const BASE_URL = "https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";
const BATCH_SIZE = 100;

const db = getRequiredTursoClient();

if (!API_KEY) {
    console.error("❌ Error: Missing MEDICINE_API_KEY or PUBLIC_DATA_API_KEY environment variable.");
    process.exit(1);
}

function normalizeServiceKey(key: string): string {
    try {
        return decodeURIComponent(key);
    } catch {
        return key;
    }
}

interface MedItem {
    itemSeq: string;
    itemName: string;
    entpName: string;
    efcyQesitm: string | null;
    useMethodQesitm: string | null;
    atpnWarnQesitm: string | null;
    atpnQesitm: string | null;
    intrcQesitm: string | null;
    seQesitm: string | null;
    depositMethodQesitm: string | null;
    itemImage: string | null;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchMedicineData(pageNo: number, numOfRows: number): Promise<{ items: MedItem[], total: number }> {
    const params = new URLSearchParams({
        serviceKey: normalizeServiceKey(API_KEY!),
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
        type: 'json'
    });
    const url = `${BASE_URL}?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Medicine API request failed (${response.status} ${response.statusText})`);
    }

    const text = await response.text();
    let data: { body?: { items?: MedItem | MedItem[]; totalCount?: number | string } };
    try {
        data = JSON.parse(text) as typeof data;
    } catch {
        throw new Error("Medicine API returned invalid JSON");
    }

    if (!data.body) {
        throw new Error("Medicine API returned an invalid response shape");
    }
    const total = Number(data.body.totalCount);
    if (!Number.isSafeInteger(total) || total < 0) {
        throw new Error("Medicine API returned an invalid totalCount");
    }
    const items = Array.isArray(data.body.items)
        ? data.body.items
        : data.body.items
            ? [data.body.items]
            : [];
    if (total > 0 && items.length === 0) {
        throw new Error(`Medicine API returned no rows for page ${pageNo}`);
    }
    return { items, total };
}

function normalizeText(text: string | null): string | null {
    if (!text) return null;
    return text.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
}

async function processBatch(items: MedItem[]) {
    if (items.length === 0) return;

    const statements = items.map(item => ({
        sql: `INSERT INTO medicines
              (item_seq, name, manufacturer, efficacy, use_method, warning_general, warning_usage, interactions, side_effects, storage_method, image_url, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(item_seq) DO UPDATE SET
                name = excluded.name,
                manufacturer = excluded.manufacturer,
                efficacy = excluded.efficacy,
                use_method = excluded.use_method,
                warning_general = excluded.warning_general,
                warning_usage = excluded.warning_usage,
                interactions = excluded.interactions,
                side_effects = excluded.side_effects,
                storage_method = excluded.storage_method,
                image_url = excluded.image_url,
                updated_at = excluded.updated_at`,
        args: [
            item.itemSeq, item.itemName, item.entpName,
            normalizeText(item.efcyQesitm),
            normalizeText(item.useMethodQesitm),
            normalizeText(item.atpnWarnQesitm),
            normalizeText(item.atpnQesitm),
            normalizeText(item.intrcQesitm),
            normalizeText(item.seQesitm),
            normalizeText(item.depositMethodQesitm),
            item.itemImage,
            new Date().toISOString(),
        ],
    }));

    const results = await db.batch(statements, "write");
    assertExpectedRowsAffected(results, statements.length, "fetch-medicines batch");
}

async function main() {
    const args = process.argv.slice(2);
    const mode = args[0] || "1";

    if (mode === "all") {
        console.log("🚀 Starting Full Medicines Sync...");

        const { total } = await fetchMedicineData(1, 1);
        console.log(`📊 Total Records Found: ${total}`);

        if (total === 0) return;

        const totalPages = Math.ceil(total / BATCH_SIZE);
        let processed = 0;
        let failedPages = 0;

        for (let page = 1; page <= totalPages; page++) {
            console.log(`🔄 Fetching Page ${page}/${totalPages}...`);
            try {
                const { items } = await fetchMedicineData(page, BATCH_SIZE);
                const expectedCount = Math.min(BATCH_SIZE, total - (page - 1) * BATCH_SIZE);
                if (items.length !== expectedCount) {
                    throw new Error(`Medicine API returned ${items.length}/${expectedCount} expected rows`);
                }
                await processBatch(items);
                processed += items.length;
                process.stdout.write(`\r✅ Processed: ${processed}/${total}`);
                await sleep(200);
            } catch {
                console.error(`\n❌ Page ${page} failed.`);
                failedPages++;
                await sleep(1000);
            }
        }
        console.log(`\nMedicine sync summary: processed=${processed}, total=${total}, failedPages=${failedPages}`);
        if (failedPages > 0 || processed !== total) {
            throw new Error(`Medicine sync incomplete: processed=${processed}, total=${total}, failedPages=${failedPages}`);
        }
        console.log("🎉 Full Sync Completed!");

    } else {
        const limitText = args[1] || "10";
        if (!/^[1-9]\d*$/.test(mode) || !/^[1-9]\d*$/.test(limitText)) {
            throw new Error("Page and limit must be positive integers");
        }
        const page = Number(mode);
        const limit = Number(limitText);
        if (!Number.isSafeInteger(page) || !Number.isSafeInteger(limit) || limit > BATCH_SIZE) {
            throw new Error(`Page must be safe and limit must be at most ${BATCH_SIZE}`);
        }

        console.log(`🚀 Fetching Page ${page} (Limit ${limit})...`);
        const { items, total } = await fetchMedicineData(page, limit);
        console.log(`📊 Total Count: ${total}, Items: ${items.length}`);

        if (items.length > 0) {
            await processBatch(items);
            console.log(`🎉 Upserted ${items.length} items.`);
        }
    }
}

main().catch((error) => {
    console.error("❌ Medicine sync failed:", error);
    process.exitCode = 1;
});

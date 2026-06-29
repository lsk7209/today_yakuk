import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import { getTursoClient } from "../src/lib/turso";

const API_KEY = process.env.MEDICINE_API_KEY || process.env.PUBLIC_DATA_API_KEY;
const BASE_URL = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";
const BATCH_SIZE = 100;

const db = getTursoClient();

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

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API fetch failed: ${response.statusText}`);

        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch {
            console.error("JSON Parse Error. Raw text:", text.substring(0, 100));
            return { items: [], total: 0 };
        }

        if (!data.body || !data.body.items) {
            console.warn("No body/items in response:", JSON.stringify(data).substring(0, 100));
            return { items: [], total: 0 };
        }

        const total = data.body.totalCount ?? 0;
        const items = Array.isArray(data.body.items) ? data.body.items : (data.body.items ? [data.body.items] : []);
        return { items, total };
    } catch (error) {
        console.error(`Fetch error (Page: ${pageNo}):`, error);
        return { items: [], total: 0 };
    }
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

    await db.batch(statements, "write");
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

        for (let page = 1; page <= totalPages; page++) {
            console.log(`🔄 Fetching Page ${page}/${totalPages}...`);
            try {
                const { items } = await fetchMedicineData(page, BATCH_SIZE);
                if (items.length > 0) {
                    await processBatch(items);
                    processed += items.length;
                }
                process.stdout.write(`\r✅ Processed: ${processed}/${total}`);
                await sleep(200);
            } catch {
                console.error(`\n❌ Page ${page} failed.`);
                await sleep(1000);
            }
        }
        console.log(`\n🎉 Full Sync Completed! Total: ${processed}`);

    } else {
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

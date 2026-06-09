import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getTursoClient } from "../src/lib/turso";

const db = getTursoClient();

async function checkAll() {
    const result = await db.execute("SELECT status FROM content_queue");
    const counts: Record<string, number> = {};
    for (const row of result.rows) {
        const s = row.status as string;
        counts[s] = (counts[s] || 0) + 1;
    }
    console.log(JSON.stringify(counts));
}

checkAll().catch(console.error);

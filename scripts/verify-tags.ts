import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const db = getTursoClient();

async function verifyTags() {
    console.log("🔍 Verifying tag counts...");

    const result = await db.execute("SELECT tags FROM supplements");

    const tagCounts: Record<string, number> = {};
    let emptyCount = 0;

    result.rows.forEach(r => {
        let tags: string[] = [];
        try { tags = r.tags ? JSON.parse(r.tags as string) : []; } catch { /* skip */ }

        if (!tags || tags.length === 0) {
            emptyCount++;
        } else {
            tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    console.log(`Total Products: ${result.rows.length}`);
    console.log(`Products without tags: ${emptyCount}`);
    console.log("Tag Counts:");
    console.table(tagCounts);
}

verifyTags();

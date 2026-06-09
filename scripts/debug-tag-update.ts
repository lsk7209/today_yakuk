import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const db = getTursoClient();

const TAG_MAP: Record<string, string[]> = {
    "vitamin-c": ["비타민C", "비타민 C", "Vitamin C"],
};

async function debugUpdate() {
    const result = await db.execute({
        sql: "SELECT id, name, tags FROM supplements WHERE name LIKE ? LIMIT 1",
        args: ["%비타민C%"],
    });

    if (!result.rows.length) {
        console.error("Failed to fetch product");
        return;
    }

    const product = result.rows[0];
    let currentTags: string[] = [];
    try { currentTags = product.tags ? JSON.parse(product.tags as string) : []; } catch { /* skip */ }

    console.log(`\n🎯 Testing product: ${product.name} (ID: ${product.id})`);
    console.log(`   Current tags: ${JSON.stringify(currentTags)}`);

    const contentToSearch = (product.name as string).toLowerCase();
    const newTags: Set<string> = new Set();

    for (const [tagId, keywords] of Object.entries(TAG_MAP)) {
        if (keywords.some(kw => contentToSearch.includes(kw.toLowerCase()))) {
            console.log(`   ✅ Match found for ${tagId}`);
            newTags.add(tagId);
        }
    }

    const tagArray = Array.from(newTags);
    console.log(`   Calculated new tags: ${JSON.stringify(tagArray)}`);

    if (tagArray.length > 0) {
        console.log("   Attempting update...");
        await db.execute({
            sql: "UPDATE supplements SET tags = ? WHERE id = ?",
            args: [JSON.stringify(tagArray), product.id as string],
        });
        console.log("   ✅ Update successful.");
    } else {
        console.log("   ⚠️ No tags to update.");
    }
}

debugUpdate();

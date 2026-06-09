import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: ".env.local" });

const db = getTursoClient();

async function inspectProduct() {
    const result = await db.execute(
        "SELECT id, name, tags, ai_summary FROM supplements WHERE tags IS NOT NULL LIMIT 10"
    );

    if (!result.rows.length) {
        console.log("No products found with tags.");
        return;
    }

    console.log(`Found ${result.rows.length} products with tags:`);
    result.rows.forEach(r => {
        console.log(`- ID: ${r.id} | Name: ${r.name}`);
        console.log(`  Tags: ${r.tags}`);
    });
}

inspectProduct();

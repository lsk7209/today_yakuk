/**
 * Supplement Tag Correction Script — now uses shared Turso-based logic
 */

import dotenv from "dotenv";
import { fixSupplementTags } from "../src/lib/supplement-utils";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("🚀 Starting tag correction for supplements...");

    try {
        const result = await fixSupplementTags(
            50,
            (processed, total) => {
                console.log(`⏳ Progress: ${processed}/${total}...`);
            }
        );

        console.log(`\n✨ Finished!`);
        console.log(`✅ Total Processed: ${result.processedCount}`);
        console.log(`✅ Total Updated: ${result.updatedCount}`);

        if (result.errors.length > 0) {
            console.warn(`⚠️ Encountered ${result.errors.length} errors during update.`);
            result.errors.slice(0, 5).forEach(e => console.error(` - Error:`, e));
        }

    } catch (error) {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    }
}

main().catch(console.error);

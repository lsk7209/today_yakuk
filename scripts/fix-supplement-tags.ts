/**
 * Supplement Tag Correction Script
 * 
 * Logic:
 * 1. Fetch products from 'supplements' table
 * 2. Scan name, ai_summary, and nutrition_facts for keywords
 * 3. Assign matching tags
 * 4. Update the record
 * 
 * NOW USES SHARED LOGIC from src/lib/supplement-utils.ts
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { fixSupplementTags } from "../src/lib/supplement-utils";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
    console.log("🚀 Starting tag correction for supplements...");

    try {
        const result = await fixSupplementTags(
            supabase,
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
            // Only show first 5 errors to avoid flooding console
            result.errors.slice(0, 5).forEach(e => console.error(` - Error updating ${e.name} (${e.id}):`, e.error));
        }

    } catch (error) {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    }
}

main().catch(console.error);

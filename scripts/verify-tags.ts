
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyTags() {
    console.log("🔍 Verifying tag counts...");

    const { data: supplements, error } = await supabase
        .from("supplements")
        .select("tags");

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    const tagCounts: Record<string, number> = {};
    let emptyCount = 0;

    supplements.forEach(s => {
        if (!s.tags || s.tags.length === 0) {
            emptyCount++;
        } else {
            s.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    console.log(`Total Products: ${supplements.length}`);
    console.log(`Products without tags: ${emptyCount}`);
    console.log("Tag Counts:");
    console.table(tagCounts);
}

verifyTags();


import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing from environment variables!");
    process.exit(1);
}

console.log(`🔑 Service Role Key loaded (length: ${SUPABASE_SERVICE_KEY.length})`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TAG_MAP: Record<string, string[]> = {
    "vitamin-c": ["비타민C", "비타민 C", "Vitamin C"],
};

async function debugUpdate() {
    // Fetch one specific vitamin C product
    const { data: products, error } = await supabase
        .from("supplements")
        .select("id, name, tags")
        .ilike("name", "%비타민C%")
        .limit(1);

    if (error || !products || products.length === 0) {
        console.error("Failed to fetch product", error);
        return;
    }

    const product = products[0];
    console.log(`\n🎯 Testing product: ${product.name} (ID: ${product.id})`);
    console.log(`   Current tags: ${JSON.stringify(product.tags)}`);

    const contentToSearch = product.name.toLowerCase();
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
        const { data, error: updateError } = await supabase
            .from("supplements")
            .update({ tags: tagArray })
            .eq("id", product.id)
            .select();

        if (updateError) {
            console.error("   ❌ Update failed:", updateError);
        } else {
            console.log("   ✅ Update successful. Returned data:", JSON.stringify(data));
        }
    } else {
        console.log("   ⚠️ No tags to update.");
    }
}

debugUpdate();

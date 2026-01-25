/**
 * Supplement Tag Correction Script
 * 
 * Logic:
 * 1. Fetch products from 'supplements' table
 * 2. Scan name, ai_summary, and nutrition_facts for keywords
 * 3. Assign matching tags
 * 4. Update the record
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Tag Mapping Definition
const TAG_MAP: Record<string, string[]> = {
    "vitamin-c": ["비타민C", "비타민 C", "Vitamin C", "Ascorbic Acid", "아스코르브산"],
    "fatigue": ["피로", "활력", "에너지", "만성피로", "Fatigue", "Energy"],
    "immune": ["면역", "아연", "Immune", "Zinc"],
    "eye": ["눈", "루테인", "지아잔틴", "시력", "Eye", "Lutein"],
    "liver": ["간", "밀크씨슬", "실리마린", "Liver", "Milk Thistle"],
    "probiotics": ["유산균", "프로바이오틱스", "장건강", "Probiotics"],
    "omega3": ["오메가3", "rTG", "DHA", "EPA", "Omega-3"],
    "multivitamin": ["멀티비타민", "종합비타민", "Multivitamin"],
    "skin": ["피부", "콜라겐", "히알루론산", "Skin", "Collagen"],
    "bone": ["뼈", "칼슘", "마그네슘", "비타민D", "Bone", "Calcium", "Magnesium"],
};

async function fixTags() {
    console.log("🚀 Starting tag correction for supplements...");

    let processedCount = 0;
    let updatedCount = 0;

    // Fetch all supplements (chunked if needed, but for now we'll fetch all if count is manageable)
    const { data: products, error } = await supabase
        .from("supplements")
        .select("id, name, ai_summary, nutrition_facts, tags");

    if (error) {
        console.error("❌ Failed to fetch supplements:", error);
        return;
    }

    console.log(`📦 Found ${products.length} products to analyze.`);

    for (const product of products) {
        processedCount++;
        const contentToSearch = [
            product.name,
            product.ai_summary || "",
            JSON.stringify(product.nutrition_facts || [])
        ].join(" ").toLowerCase();

        const newTags: Set<string> = new Set();

        // Match against TAG_MAP
        for (const [tagId, keywords] of Object.entries(TAG_MAP)) {
            if (keywords.some(kw => contentToSearch.includes(kw.toLowerCase()))) {
                newTags.add(tagId);
            }
        }

        // If new tags found or if we want to ensure basic tags are present
        if (newTags.size > 0) {
            const tagArray = Array.from(newTags);

            // Only update if tags have changed
            if (JSON.stringify(product.tags) !== JSON.stringify(tagArray)) {
                const { error: updateError } = await supabase
                    .from("supplements")
                    .update({ tags: tagArray })
                    .eq("id", product.id);

                if (updateError) {
                    console.error(`❌ Failed to update ${product.name}:`, updateError);
                } else {
                    updatedCount++;
                }
            }
        }

        if (processedCount % 50 === 0) {
            console.log(`⏳ Progress: ${processedCount}/${products.length}...`);
        }
    }

    console.log(`\n✨ Finished!`);
    console.log(`✅ Total Processed: ${processedCount}`);
    console.log(`✅ Total Updated: ${updatedCount}`);
}

fixTags().catch(console.error);

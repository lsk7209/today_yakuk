import { SupabaseClient } from "@supabase/supabase-js";

// Tag Mapping Definition
export const TAG_MAP: Record<string, string[]> = {
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

export interface FixTagsResult {
    processedCount: number;
    updatedCount: number;
    errors: unknown[];
}

/**
 * Core logic to fix/enrich supplement tags based on content analysis
 */
export async function fixSupplementTags(
    supabase: SupabaseClient,
    batchSize: number = 50,
    onProgress?: (processed: number, total: number) => void
): Promise<FixTagsResult> {
    const result: FixTagsResult = {
        processedCount: 0,
        updatedCount: 0,
        errors: []
    };

    // Fetch all supplements
    // Note: For very large datasets, pagination would be better, but we'll start with full fetch as in original script
    const { data: products, error } = await supabase
        .from("supplements")
        .select("id, name, ai_summary, nutrition_facts, tags");

    if (error) {
        throw new Error(`Failed to fetch supplements: ${error.message}`);
    }

    if (!products || products.length === 0) {
        return result;
    }

    const total = products.length;

    for (const product of products) {
        result.processedCount++;

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

        // Check if update is needed
        if (newTags.size > 0) {
            const tagArray = Array.from(newTags);

            // Only update if tags have changed
            // Simple stringify comparison handles order provided the order is deterministic or we sort it.
            // Ideally we sort both to be sure, but original script didn't. We'll stick to simple compare for now.
            const currentTags = Array.isArray(product.tags) ? product.tags : [];
            const needsUpdate = JSON.stringify(currentTags.sort()) !== JSON.stringify(tagArray.sort());

            if (needsUpdate) {
                const { error: updateError } = await supabase
                    .from("supplements")
                    .update({ tags: tagArray })
                    .eq("id", product.id);

                if (updateError) {
                    result.errors.push({ id: product.id, name: product.name, error: updateError });
                } else {
                    result.updatedCount++;
                }
            }
        }

        if (onProgress && result.processedCount % batchSize === 0) {
            onProgress(result.processedCount, total);
        }
    }

    return result;
}

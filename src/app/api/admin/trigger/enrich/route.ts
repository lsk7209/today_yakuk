
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fixSupplementTags } from "@/lib/supplement-utils";

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { success: false, error: "Server configuration error" },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Run the enrichment logic
        // Note: For large datasets, this might timeout on Vercel (10s limit on hobby).
        // For now we await it, but for production with many items, 
        // this should be offloaded to a background job or processed in smaller chunks.
        const result = await fixSupplementTags(supabase);

        return NextResponse.json({
            success: true,
            data: result,
            message: `Enrichment complete. Processed ${result.processedCount}, Updated ${result.updatedCount}`
        });
    } catch (error) {
        console.error("Enrichment API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

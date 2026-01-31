import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim();
        const category = searchParams.get("category");
        const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

        if (!query || query.length < 2) {
            return NextResponse.json(
                { success: false, message: "검색어는 2자 이상이어야 합니다.", products: [] },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServerClient();

        let dbQuery = supabase
            .from("supplements")
            .select("id, name, manufacturer, image_url, ai_summary, tags")
            .or(`name.ilike.%${query}%,manufacturer.ilike.%${query}%,ai_summary.ilike.%${query}%`)
            .limit(limit);

        // 카테고리 필터 적용
        if (category && category !== "all") {
            dbQuery = dbQuery.contains("tags", [category]);
        }

        const { data: products, error } = await dbQuery;

        if (error) {
            console.error("Wiki search error:", error);
            return NextResponse.json(
                { success: false, message: "검색 중 오류가 발생했습니다.", products: [] },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            query,
            count: products?.length || 0,
            products: products || [],
        });
    } catch (error) {
        console.error("Wiki search error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다.", products: [] },
            { status: 500 }
        );
    }
}

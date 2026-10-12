import { NextRequest, NextResponse } from "next/server";
import { getTursoClient, parseJson } from "@/lib/turso";
import { buildWikiSearchQuery, getWikiCatalogType, getWikiSearchLimit } from "@/lib/wiki-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category");
    const type = getWikiCatalogType(searchParams.get("type"));
    const limit = getWikiSearchLimit(searchParams.get("limit"));

    if (!type) {
      return NextResponse.json({ success: false, message: "지원하지 않는 정보 종류입니다.", products: [] }, { status: 400 });
    }

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, message: "검색어는 2자 이상이어야 합니다.", products: [] },
        { status: 400 },
      );
    }

    const db = getTursoClient();
    const likeQ = `%${query}%`;

    const search = buildWikiSearchQuery(type, category, limit);
    const result = await db.execute({ sql: search.sql, args: search.argsFor(likeQ) });
    const products = result.rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      manufacturer: r.manufacturer as string | null,
      image_url: r.image_url as string | null,
      tags: type === "supplement" ? parseJson(r.tags, null) as string[] | null : null,
    }));

    return NextResponse.json({
      success: true,
      query,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Wiki search error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다.", products: [] },
      { status: 500 },
    );
  }
}

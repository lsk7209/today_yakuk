import { NextRequest, NextResponse } from "next/server";
import { getTursoClient, parseJson } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, message: "검색어는 2자 이상이어야 합니다.", products: [] },
        { status: 400 },
      );
    }

    const db = getTursoClient();
    const likeQ = `%${query}%`;

    let sql: string;
    let args: (string | number)[];

    if (category && category !== "all") {
      sql = `SELECT id, name, manufacturer, image_url, tags FROM supplements
             WHERE (name LIKE ? OR manufacturer LIKE ?)
             AND tags IS NOT NULL AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value = ?)
             LIMIT ?`;
      args = [likeQ, likeQ, category, limit];
    } else {
      sql = `SELECT id, name, manufacturer, image_url, tags FROM supplements
             WHERE name LIKE ? OR manufacturer LIKE ?
             LIMIT ?`;
      args = [likeQ, likeQ, limit];
    }

    const result = await db.execute({ sql, args });
    const products = result.rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      manufacturer: r.manufacturer as string | null,
      image_url: r.image_url as string | null,
      tags: parseJson(r.tags, null) as string[] | null,
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

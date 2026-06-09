import { NextResponse } from "next/server";
import { getTursoClient, parseJson } from "@/lib/turso";

export const revalidate = 600;

export async function GET() {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: `SELECT slug, title, ai_summary, published_at, image_url FROM content_queue
            WHERE status = 'published'
            ORDER BY CASE WHEN published_at IS NULL THEN 1 ELSE 0 END, published_at DESC
            LIMIT 4`,
      args: [],
    });

    const posts = result.rows.map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      ai_summary: r.ai_summary as string | null,
      published_at: r.published_at as string | null,
      image_url: parseJson(r.image_url, r.image_url as string | null),
    }));

    return NextResponse.json(posts, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  }
}

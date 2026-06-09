import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      ok: false,
      error: "env_missing",
      has_url: !!url,
      has_token: !!token,
    });
  }

  try {
    const { createClient } = await import("@libsql/client");
    const db = createClient({ url, authToken: token });

    // Test 1: COUNT with index access (not alias)
    const countRaw = await db.execute("SELECT COUNT(*) as cnt FROM supplements");
    const countByIndex = Number(countRaw.rows[0]?.[0] ?? -1);
    const countByAlias = countRaw.rows[0]?.cnt;

    // Test 2: Non-parameterized LIMIT (current debug)
    const sample = await db.execute(
      "SELECT id, name FROM supplements ORDER BY created_at DESC LIMIT 3"
    );

    // Test 3: Parameterized LIMIT/OFFSET (exact wiki query)
    const wikiQuery = await db.execute({
      sql: "SELECT id, name, manufacturer, image_url, ai_summary, tags FROM supplements ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [12, 0],
    });

    // Test 4: Parameterized LIMIT/OFFSET with string-cast numbers
    const wikiQueryStr = await db.execute({
      sql: "SELECT id, name FROM supplements ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [12, 0],
    });

    return NextResponse.json({
      ok: true,
      count_by_index: countByIndex,
      count_by_alias: String(countByAlias),
      sample_count: sample.rows.length,
      sample: sample.rows.map((r) => ({ id: r.id, name: r.name })),
      wiki_query_rows: wikiQuery.rows.length,
      wiki_query_sample: wikiQuery.rows.slice(0, 2).map((r) => ({ id: r.id, name: r.name })),
      wiki_query_str_rows: wikiQueryStr.rows.length,
      columns: wikiQuery.columns,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}

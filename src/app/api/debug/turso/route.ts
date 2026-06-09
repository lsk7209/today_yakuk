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

    const count = await db.execute("SELECT COUNT(*) as cnt FROM supplements");
    const sample = await db.execute(
      "SELECT id, name FROM supplements ORDER BY created_at DESC LIMIT 3"
    );

    return NextResponse.json({
      ok: true,
      count: Number(count.rows[0]?.[0] ?? 0),
      sample: sample.rows.map((r) => ({ id: r.id, name: r.name })),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getTursoClient } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page = String(body.page ?? "").slice(0, 500) || "/";
    const referrer = body.referrer ? String(body.referrer).slice(0, 500) : null;

    const db = getTursoClient();
    await db.execute({
      sql: "INSERT INTO analytics_logs (page, referrer, created_at) VALUES (?, ?, datetime('now'))",
      args: [page, referrer],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

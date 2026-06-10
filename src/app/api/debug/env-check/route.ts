import { NextRequest } from "next/server";
import { createClient } from "@libsql/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("s");
  if (secret !== "dbcheck2026") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const url = process.env.TURSO_DATABASE_URL || "NOT SET";
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const r = await db.execute({
      sql: "SELECT id, name, nutrition_facts FROM supplements WHERE id = ?",
      args: ["0a7f1abb-da72-4c7b-a6cb-d7cafa63995a"],
    });
    const row = r.rows[0];
    return Response.json({
      turso_url: url.replace(/\/\/.*?@/, "//[hidden]@"),
      has_token: hasToken,
      found: !!row,
      name: row?.name,
      nutrition_facts_length: row?.nutrition_facts
        ? String(row.nutrition_facts).length
        : 0,
      nutrition_facts_preview: row?.nutrition_facts
        ? String(row.nutrition_facts).substring(0, 80)
        : null,
    });
  } catch (e) {
    return Response.json({
      turso_url: url.replace(/\/\/.*?@/, "//[hidden]@"),
      has_token: hasToken,
      error: String(e),
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getTursoClient } from "@/lib/turso";
import {
  normalizeAnalyticsPage,
  normalizeAnalyticsReferrer,
} from "@/lib/client-analytics";
import { z } from "zod";

export const dynamic = "force-dynamic";

const analyticsRequestSchema = z
  .object({
    page: z.string().max(2_000).optional(),
    referrer: z.string().max(2_000).nullable().optional(),
  })
  .strict();

const WINDOW_MS = 60_000;
const MAX_WRITES_PER_WINDOW = 120;
const writeWindows = new Map<string, { startedAt: number; count: number }>();

export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return NextResponse.json({ ok: false }, { status: 415 });
    }

    const origin = request.headers.get("origin");
    if (!isSameOrigin(origin, request.nextUrl.origin)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    if (isWriteLimited(getClientBucket(request))) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const parsed = analyticsRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!process.env.TURSO_DATABASE_URL?.trim() || !process.env.TURSO_AUTH_TOKEN?.trim()) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    const body = parsed.data;
    const page = normalizeAnalyticsPage(body.page);
    const referrer = normalizeAnalyticsReferrer(body.referrer);

    const db = getTursoClient();
    await db.execute({
      sql: "INSERT INTO analytics_logs (page, referrer, created_at) VALUES (?, ?, datetime('now'))",
      args: [page, referrer],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

function isSameOrigin(origin: string | null, expectedOrigin: string) {
  if (!origin) return false;
  try {
    return new URL(origin).origin === expectedOrigin;
  } catch {
    return false;
  }
}

function getClientBucket(request: NextRequest) {
  const platformIp = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return platformIp || "unknown";
}

function isWriteLimited(bucket: string) {
  const now = Date.now();
  const current = writeWindows.get(bucket);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    if (writeWindows.size > 5_000) writeWindows.clear();
    writeWindows.set(bucket, { startedAt: now, count: 1 });
    return false;
  }

  current.count += 1;
  return current.count > MAX_WRITES_PER_WINDOW;
}

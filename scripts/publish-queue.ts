import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

type ContentQueueStatus = "pending" | "review" | "published" | "failed";

type ContentQueue = {
  id: string;
  hpid: string | null;
  title: string;
  slug: string;
  region: string | null;
  theme: string | null;
  content_html: string | null;
  ai_summary: string | null;
  ai_bullets: { text: string }[] | null;
  ai_faq: { question: string; answer: string }[] | null;
  ai_cta: string | null;
  extra_sections: { title: string; body: string }[] | null;
  status: ContentQueueStatus;
  publish_at: string;
};

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todaypharm.kr").replace(/\/$/, "");

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1] ?? "";
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// (AI 생성 중단) publish 스크립트는 큐에 이미 준비된 콘텐츠만 발행합니다.

function ensureEnv() {
  if (!supabaseUrl) throw new Error("SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL이 필요합니다.");
  if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");

  // Supabase 키가 JWT인 경우 payload.role로 anon/service_role 오설정을 빠르게 감지
  const payload = decodeJwtPayload(supabaseServiceKey);
  const role = typeof payload?.role === "string" ? (payload.role as string) : null;
  if (role && role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY가 service_role 키가 아닙니다 (현재 role='${role}'). GitHub Secrets에 anon 키가 들어가 있지 않은지 확인하세요.`,
    );
  }
}

async function publishPending(limit = 2) {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

  // content_queue 테이블이 없으면 발행 자체가 불가능하므로 즉시 중단
  const { error: cqCheckError } = await supabase.from("content_queue").select("id").limit(1);
  if (cqCheckError && (cqCheckError as { code?: string }).code === "PGRST205") {
    throw new Error(
      [
        "content_queue 테이블을 찾을 수 없습니다. (Supabase 스키마 초기화가 필요합니다)",
        "- Supabase Dashboard → SQL Editor에서 `supabase/content_queue.sql`을 실행하세요.",
        "- 참고: `DEPLOYMENT_GUIDE.md`의 'Supabase 데이터베이스 설정' 섹션",
      ].join("\n"),
    );
  }

  const now = new Date().toISOString();
  const { data: pending, error } = await supabase
    .from("content_queue")
    .select(
      "id, hpid, title, slug, region, theme, content_html, ai_summary, ai_bullets, ai_faq, ai_cta, extra_sections, status, publish_at",
    )
    .eq("status", "pending")
    .lte("publish_at", now)
    .order("publish_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!pending || !pending.length) {
    console.info("No pending items to publish.");
    return;
  }

  // AI 재생성 중단: 이미 생성된 콘텐츠만 발행합니다.
  const ready = pending.filter((item) => !!item.content_html || !!item.ai_summary);
  if (!ready.length) {
    console.info("No publishable items (missing content_html/ai_summary).");
    return;
  }

  const rows = ready.map((item) => ({
    id: item.id,
    status: "published",
    published_at: now,
    updated_at: now,
    content_html: item.content_html,
    ai_summary: item.ai_summary,
    ai_bullets: item.ai_bullets,
    ai_faq: item.ai_faq,
    ai_cta: item.ai_cta,
    extra_sections: item.extra_sections,
  }));

  const { error: updateError } = await supabase.from("content_queue").upsert(rows);

  if (updateError) throw updateError;

  console.info(`Published ${rows.length} items:`, rows.map((r) => r.id));
}

async function main() {
  ensureEnv();
  const limitRaw = process.env.PUBLISH_LIMIT ?? "2";
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(10, Number(limitRaw))) : 2;
  await publishPending(limit);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

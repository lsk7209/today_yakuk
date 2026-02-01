import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requestIndexing } from "../src/lib/google-indexing";
import { submitToIndexNow } from "../src/lib/naver-indexnow";

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

  // 1. 유효하지 않은 아이템(컨텐츠 누락) 처리 -> 'failed'로 변경
  const failedOps = pending
    .filter((item) => !item.content_html && !item.ai_summary)
    .map((item) => ({
      id: item.id,
      hpid: item.hpid, // Required for upsert
      title: item.title, // Required for upsert
      slug: item.slug, // Required for upsert
      region: item.region,
      theme: item.theme,
      status: "failed",
      updated_at: now,
      // 실패 사유를 어딘가에 적으면 좋겠지만 스키마가 없으므로 일단 상태만 변경
    }));

  if (failedOps.length > 0) {
    console.warn(`Marking ${failedOps.length} items as 'failed' due to missing content:`, failedOps.map(f => f.id));

    // Batch upsert 대신 개별 Update로 변경하여 Not Null 제약 조건 회피
    const failUpdates = failedOps.map(op =>
      supabase.from("content_queue").update({
        status: "failed",
        updated_at: now
      }).eq("id", op.id)
    );
    await Promise.all(failUpdates);
  }

  // 2. 유효한 아이템 발행 처리
  const ready = pending.filter((item) => !!item.content_html || !!item.ai_summary);
  if (!ready.length) {
    console.info("No publishable items ready.");
    return;
  }

  // Update rows individually
  const publishUpdates = ready.map(item => ({
    id: item.id,
    updates: {
      status: "published",
      published_at: now,
      updated_at: now,
      content_html: item.content_html,
      ai_summary: item.ai_summary,
      ai_bullets: item.ai_bullets,
      ai_faq: item.ai_faq,
      ai_cta: item.ai_cta,
      extra_sections: item.extra_sections,
    }
  }));

  const results = await Promise.all(
    publishUpdates.map(op =>
      supabase.from("content_queue").update(op.updates as any).eq("id", op.id)
    )
  );

  // Check for errors
  const errors = results.filter(r => r.error).map(r => r.error);
  if (errors.length > 0) {
    console.error("Some updates failed:", errors);
    // 일부가 실패해도 진행
  }

  console.info(`Published ${publishUpdates.length} items.`);

  // Google Indexing API 호출
  for (const row of publishUpdates) {
    if (!row.id) continue;
    // content_queue의 hpid를 사용하여 URL 생성
    const originalItem = ready.find((r) => r.id === row.id);
    if (originalItem?.hpid) {
      const url = `${siteUrl}/pharmacy/${originalItem.hpid}`;
      console.info(`Requesting indexing for: ${url}`);
      await requestIndexing(url, "URL_UPDATED");
    } else if (originalItem?.slug) {
      // HPID가 없으면 블로그 포스트로 간주
      const url = `${siteUrl}/blog/${originalItem.slug}`;
      console.info(`Requesting indexing for: ${url}`);
      // Run both in parallel and catch errors to prevent stopping the loop
      await Promise.allSettled([
        requestIndexing(url, "URL_UPDATED"),
        submitToIndexNow([url])
      ]);
    }
  }
}

async function main() {
  ensureEnv();
  const limitRaw = process.env.PUBLISH_LIMIT ?? "10";
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(50, Number(limitRaw))) : 10;
  await publishPending(limit);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

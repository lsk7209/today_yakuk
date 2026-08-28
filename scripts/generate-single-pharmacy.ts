// dotenv를 먼저 로드 (.env.local 우선)
import dotenv from "dotenv";
import path from "path";
import * as fs from "fs";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config(); // .env도 로드

// tsconfig-paths를 등록하여 @ 경로 별칭 해석
import "tsconfig-paths/register";
import { getRequiredTursoClient } from "../src/lib/turso";
import { generatePharmacyContent } from "../src/lib/gemini";
import type { Pharmacy } from "../src/types/pharmacy";
import { getPharmacyByHpid, getPharmaciesByRegion } from "@/lib/data/pharmacies";

const geminiApiKey = process.env.GEMINI_API_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todaypharm.kr").replace(/\/$/, "");



type ContentQueueInsert = {
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
  status: "pending" | "review" | "published" | "failed";
  publish_at: string;
};

function normalizeTextForSimilarity(input: string): string {
  return input
    .replace(/[^\p{L}\p{N}\s:~\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenizeKorean(input: string): string[] {
  const stop = new Set([
    "약국",
    "위치",
    "운영",
    "영업",
    "시간",
    "정보",
    "확인",
    "가능",
    "입니다",
    "있습니다",
    "합니다",
    "위해",
    "및",
    "또는",
    "통해",
    "방문",
    "문의",
    "오늘",
    "지역",
    "주민",
  ]);
  return normalizeTextForSimilarity(input)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !stop.has(t));
}

function jaccardSimilarity(a: string, b: string): number {
  const A = new Set(tokenizeKorean(a));
  const B = new Set(tokenizeKorean(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

async function getRecentSummariesForDedupe(limit = 200) {
  try {
    const db = getRequiredTursoClient();
    const result = await db.execute({
      sql: "SELECT ai_summary FROM content_queue WHERE ai_summary IS NOT NULL ORDER BY published_at DESC LIMIT ?",
      args: [limit],
    });
    return result.rows
      .map((r) => (r.ai_summary as string | null))
      .filter(Boolean) as string[];
  } catch {
    return [];
  }
}

function pickNearDuplicates(newSummary: string, existing: string[], threshold = 0.58): string[] {
  const scored = existing
    .map((s) => ({ s, sim: jaccardSimilarity(newSummary, s) }))
    .filter((x) => x.sim >= threshold)
    .sort((a, b) => b.sim - a.sim);
  return scored.slice(0, 3).map((x) => x.s);
}

function hashStringToUint(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function computePublishAt(hpid: string, now = new Date()): string {
  // 같은 날/같은 HPID는 같은 분산값(재현 가능). 5분~90분 사이로 분산.
  const dayKey = now.toISOString().slice(0, 10);
  const seed = `${dayKey}:${hpid}`;
  const minutes = 5 + (hashStringToUint(seed) % 86);
  const d = new Date(now.getTime() + minutes * 60 * 1000);
  return d.toISOString();
}

function ensureEnv() {
  if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL이 필요합니다.");
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY가 필요합니다.");
}

/**
 * 특정 약국에 대해 Gemini API로 컨텐츠를 생성하고 content_queue에 저장합니다.
 */
async function generateSinglePharmacyContent(hpid: string): Promise<void> {
  ensureEnv();
  const db = getRequiredTursoClient();

  console.info(`\n=== 약국 컨텐츠 생성 시작: ${hpid} ===\n`);

  // 약국 정보 가져오기
  const pharmacy = await getPharmacyByHpid(hpid);
  if (!pharmacy) {
    console.error(`약국을 찾을 수 없습니다: ${hpid}`);
    return;
  }

  console.info(`약국명: ${pharmacy.name}`);
  console.info(`주소: ${pharmacy.address}`);
  console.info(`지역: ${pharmacy.province} ${pharmacy.city || ""}`);

  // 기존 컨텐츠 확인
  const existingResult = await db.execute({ sql: "SELECT id, status, ai_summary, ai_faq, published_at FROM content_queue WHERE hpid = ? LIMIT 1", args: [hpid] });
  const existing = existingResult.rows[0] ? {
    id: existingResult.rows[0].id as number,
    status: existingResult.rows[0].status as string,
    ai_summary: existingResult.rows[0].ai_summary as string | null,
    ai_faq: existingResult.rows[0].ai_faq as string | null,
    published_at: existingResult.rows[0].published_at as string | null,
  } : null;

  if (existing) {
    console.info(`\n기존 컨텐츠 발견:`);
    console.info(`- 상태: ${existing.status}`);
    console.info(`- 요약: ${existing.ai_summary ? "있음" : "없음"}`);
    console.info(`- FAQ: ${existing.ai_faq ? `${Array.isArray(existing.ai_faq) ? existing.ai_faq.length : 0}개` : "없음"}`);
    console.info(`- 발행일: ${existing.published_at || "없음"}`);

    if (existing.status === "published" && existing.ai_summary && existing.ai_faq) {
      console.info(`\n⚠️  이미 발행된 컨텐츠가 있습니다. 업데이트하려면 기존 항목을 덮어씁니다.\n`);
    }
  }

  try {
    // 주변 약국 정보 가져오기
    console.info("주변 약국 정보 수집 중...");
    const regionList =
      pharmacy.province && pharmacy.city
        ? await getPharmaciesByRegion(pharmacy.province, pharmacy.city)
        : [];
    const nearby = regionList.slice(0, 5);
    console.info(`주변 약국 ${nearby.length}개 발견\n`);

    // Gemini API로 컨텐츠 생성
    console.info("Gemini API로 컨텐츠 생성 중...");
    const recentSummaries = await getRecentSummariesForDedupe(200);
    let geminiContent = await generatePharmacyContent(pharmacy, nearby);

    // 내부 중복(유사 문장) 방지: 요약이 기존과 너무 비슷하면 1회 재생성
    if (geminiContent?.summary && recentSummaries.length) {
      const nearDups = pickNearDuplicates(geminiContent.summary, recentSummaries);
      if (nearDups.length) {
        console.info("유사 요약 감지 → 문장 구조 변경 재생성");
        geminiContent = await generatePharmacyContent(pharmacy, nearby, { avoidSummaries: nearDups });
      }
    }

    if (!geminiContent) {
      console.error("❌ Gemini API 호출 실패");
      return;
    }

    console.info("✅ 컨텐츠 생성 완료!\n");
    console.info("생성된 컨텐츠 요약:");
    console.info(`- 요약: ${geminiContent.summary?.substring(0, 50)}...`);
    console.info(`- 상세 설명: ${geminiContent.detailed_description ? "있음" : "없음"}`);
    console.info(`- 주요 특징: ${geminiContent.bullets?.length || 0}개`);
    console.info(`- 지역 팁: ${geminiContent.local_tips?.length || 0}개`);
    console.info(`- 주변 랜드마크: ${geminiContent.nearby_landmarks?.length || 0}개`);
    console.info(`- FAQ: ${geminiContent.faq?.length || 0}개`);
    console.info(`- 추가 섹션: ${geminiContent.extra_sections?.length || 0}개\n`);

    // content_html 생성
    const bullets = geminiContent.bullets?.map((b) => `<li>${b}</li>`).join("") ?? "";
    const faq =
      geminiContent.faq
        ?.map((f) => `<div><h3>${f.question}</h3><p>${f.answer}</p></div>`)
        .join("") ?? "";
    const extras =
      geminiContent.extra_sections
        ?.map((s) => `<section><h3>${s.title}</h3><p>${s.body}</p></section>`)
        .join("") ?? "";

    const contentHtml = `
<section>
  <p>${geminiContent.summary ?? ""}</p>
  ${geminiContent.detailed_description ? `<p>${geminiContent.detailed_description}</p>` : ""}
  ${bullets ? `<ul>${bullets}</ul>` : ""}
  ${extras}
  ${faq ? `<section><h2>자주 묻는 질문</h2>${faq}</section>` : ""}
  ${geminiContent.cta ? `<p>${geminiContent.cta}</p>` : ""}
</section>`.trim();

    // 지역 정보
    const region = pharmacy.province && pharmacy.city
      ? `${pharmacy.province} ${pharmacy.city}`
      : pharmacy.province ?? null;

    // 제목 생성
    const title = `${pharmacy.name} | ${region ?? "약국"} 영업시간 및 안내`;

    // 슬러그 생성
    const slug = `pharmacy-${pharmacy.hpid}`;

    // 발행 시간 설정 (정기 발행을 위해 pending + publish_at 분산)
    const publishAt = computePublishAt(pharmacy.hpid, new Date());

    const queueItem: ContentQueueInsert = {
      hpid: pharmacy.hpid,
      title,
      slug,
      region,
      theme: null,
      content_html: contentHtml,
      ai_summary: geminiContent.summary ?? null,
      ai_bullets: geminiContent.bullets?.map((text) => ({ text })) ?? null,
      ai_faq: geminiContent.faq ?? null,
      ai_cta: geminiContent.cta ?? null,
      extra_sections: geminiContent.extra_sections ?? null,
      status: "pending",
      publish_at: publishAt,
    };

    // content_queue 테이블에 저장
    if (existing) {
      await db.execute({
        sql: `UPDATE content_queue
              SET hpid=?, title=?, slug=?, region=?, theme=?, content_html=?, ai_summary=?, ai_bullets=?,
                  ai_faq=?, ai_cta=?, extra_sections=?, status=?, publish_at=?, updated_at=?, published_at=?
              WHERE id=?`,
        args: [
          queueItem.hpid, queueItem.title, queueItem.slug, queueItem.region, queueItem.theme,
          queueItem.content_html, queueItem.ai_summary,
          queueItem.ai_bullets !== null ? JSON.stringify(queueItem.ai_bullets) : null,
          queueItem.ai_faq !== null ? JSON.stringify(queueItem.ai_faq) : null,
          queueItem.ai_cta, queueItem.extra_sections !== null ? JSON.stringify(queueItem.extra_sections) : null,
          queueItem.status, queueItem.publish_at, new Date().toISOString(), queueItem.publish_at,
          existing.id,
        ],
      });
      console.info(`✅ 컨텐츠 업데이트 완료! (ID: ${existing.id})\n`);
    } else {
      const insertResult = await db.execute({
        sql: `INSERT INTO content_queue (hpid, title, slug, region, theme, content_html, ai_summary, ai_bullets, ai_faq, ai_cta, extra_sections, status, publish_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          queueItem.hpid, queueItem.title, queueItem.slug, queueItem.region, queueItem.theme,
          queueItem.content_html, queueItem.ai_summary,
          queueItem.ai_bullets !== null ? JSON.stringify(queueItem.ai_bullets) : null,
          queueItem.ai_faq !== null ? JSON.stringify(queueItem.ai_faq) : null,
          queueItem.ai_cta, queueItem.extra_sections !== null ? JSON.stringify(queueItem.extra_sections) : null,
          queueItem.status, queueItem.publish_at,
        ],
      });
      console.info(`✅ 컨텐츠 생성 완료! (lastInsertRowid: ${insertResult.lastInsertRowid})\n`);
    }

    // pharmacies 테이블의 updated_at도 업데이트하여 sitemap에 반영
    await db.execute({
      sql: "UPDATE pharmacies SET updated_at = ? WHERE hpid = ?",
      args: [new Date().toISOString(), pharmacy.hpid],
    });

    console.info(`✅ 약국 정보 업데이트 시간 갱신 완료\n`);

    console.info(`🌐 상세 페이지 확인: ${siteUrl}/pharmacy/${pharmacy.hpid}`);
    console.info("\n=== 완료 ===\n");
  } catch (error: any) {
    console.error(`❌ 오류 발생:`, error);
    // 실패한 경우 status를 failed로 업데이트 (content_queue가 있는 경우만)
    if (existing) {
      try {
        await db.execute({
          sql: "UPDATE content_queue SET status = 'failed', updated_at = ? WHERE id = ?",
          args: [new Date().toISOString(), existing.id],
        });
      } catch { /* ignore */ }
    }
    throw error;
  }
}

async function main() {
  const hpid = process.argv[2];
  if (!hpid) {
    console.error("사용법: npm run generate:single <hpid>");
    console.error("예시: npm run generate:single C1109587");
    process.exit(1);
  }

  await generateSinglePharmacyContent(hpid);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


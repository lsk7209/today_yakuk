import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import "tsconfig-paths/register";
import { getRequiredTursoClient, parseJson } from "../src/lib/turso";
import { generatePharmacyContent } from "../src/lib/gemini";
import type { Pharmacy } from "../src/types/pharmacy";
import {
  getPharmacyByHpid,
  getPharmaciesByRegion,
} from "@/lib/data/pharmacies";
import { getNextSlot } from "../src/lib/scheduler";

const geminiApiKey = process.env.GEMINI_API_KEY;
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://todaypharm.kr"
).replace(/\/$/, "");

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

function pickNearDuplicates(
  newSummary: string,
  existing: string[],
  threshold = 0.58,
): string[] {
  return existing
    .map((s) => ({ s, sim: jaccardSimilarity(newSummary, s) }))
    .filter((x) => x.sim >= threshold)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3)
    .map((x) => x.s);
}

async function getRecentSummariesForDedupe(limit = 200): Promise<string[]> {
  try {
    const db = getRequiredTursoClient();
    const result = await db.execute({
      sql: `SELECT ai_summary FROM content_queue WHERE ai_summary IS NOT NULL ORDER BY published_at DESC LIMIT ?`,
      args: [limit],
    });
    return result.rows.map((r) => r.ai_summary as string).filter(Boolean);
  } catch {
    return [];
  }
}

function ensureEnv() {
  if (!process.env.TURSO_DATABASE_URL)
    throw new Error("TURSO_DATABASE_URL이 필요합니다.");
  if (!process.env.TURSO_AUTH_TOKEN)
    throw new Error("TURSO_AUTH_TOKEN이 필요합니다.");
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY가 필요합니다.");
}

async function generateAndQueueContent(
  pharmacy: Pharmacy,
  publishAt: string,
  recentSummaries: string[] = [],
  regionCache: Map<string, Pharmacy[]> = new Map(),
): Promise<void> {
  const db = getRequiredTursoClient();
  const now = new Date().toISOString();

  // 이미 큐에 있는지 확인
  const existingResult = await db.execute({
    sql: `SELECT id, status, ai_summary, ai_faq FROM content_queue WHERE hpid = ? LIMIT 1`,
    args: [pharmacy.hpid],
  });
  const existing = existingResult.rows[0] ?? null;

  if (existing) {
    const status = existing.status as string;
    const ai_summary = existing.ai_summary as string | null;
    const ai_faq = existing.ai_faq as string | null;

    if (status === "published" && ai_summary && ai_faq) {
      console.info(
        `[SKIP] ${pharmacy.name} (${pharmacy.hpid}): 이미 발행된 컨텐츠 존재`,
      );
      return;
    }
    if (status === "pending" && ai_summary && ai_faq) {
      console.info(
        `[SKIP] ${pharmacy.name} (${pharmacy.hpid}): 발행 대기 중인 컨텐츠 존재`,
      );
      return;
    }
    if (status === "failed" || !ai_summary || !ai_faq) {
      console.info(
        `[RETRY] ${pharmacy.name} (${pharmacy.hpid}): 컨텐츠 재생성 (이전: ${status})`,
      );
    }
  }

  try {
    // 지역별 약국 목록 캐시 사용 — 동일 지역 반복 조회 방지 (500 rows × N → 500 rows × 1/region)
    let regionList: Pharmacy[] = [];
    if (pharmacy.province && pharmacy.city) {
      const cacheKey = `${pharmacy.province}|${pharmacy.city}`;
      if (regionCache.has(cacheKey)) {
        regionList = regionCache.get(cacheKey)!;
      } else {
        regionList = await getPharmaciesByRegion(
          pharmacy.province,
          pharmacy.city,
        );
        regionCache.set(cacheKey, regionList);
      }
    }
    const nearby = regionList.slice(0, 5);

    console.info(`[GENERATE] ${pharmacy.name} (${pharmacy.hpid})...`);
    // recentSummaries는 호출자(generateBatchContent)가 루프 전 1회 조회해서 주입
    let geminiContent = await generatePharmacyContent(pharmacy, nearby);

    if (geminiContent?.summary && recentSummaries.length) {
      const nearDups = pickNearDuplicates(
        geminiContent.summary,
        recentSummaries,
      );
      if (nearDups.length) {
        console.info(`[DEDUPE] ${pharmacy.name}: 유사 요약 감지 → 재생성`);
        geminiContent = await generatePharmacyContent(pharmacy, nearby, {
          avoidSummaries: nearDups,
        });
      }
    }

    if (!geminiContent) {
      console.warn(
        `[WARN] ${pharmacy.name} (${pharmacy.hpid}): Gemini API 호출 실패`,
      );
      return;
    }

    const bullets =
      geminiContent.bullets?.map((b) => `<li>${b}</li>`).join("") ?? "";
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

    const region =
      pharmacy.province && pharmacy.city
        ? `${pharmacy.province} ${pharmacy.city}`
        : (pharmacy.province ?? null);

    const title = `${pharmacy.name} | ${region ?? "약국"} 영업시간 및 안내`;
    const slug = `pharmacy-${pharmacy.hpid}`;

    const aiBulletsJson = geminiContent.bullets
      ? JSON.stringify(geminiContent.bullets.map((text) => ({ text })))
      : null;
    const aiFaqJson = geminiContent.faq
      ? JSON.stringify(geminiContent.faq)
      : null;
    const extraSectionsJson = geminiContent.extra_sections
      ? JSON.stringify(geminiContent.extra_sections)
      : null;

    if (existing) {
      await db.execute({
        sql: `UPDATE content_queue SET title=?, slug=?, region=?, content_html=?, ai_summary=?, ai_bullets=?, ai_faq=?, ai_cta=?, extra_sections=?, status='pending', publish_at=?, updated_at=? WHERE id=?`,
        args: [
          title,
          slug,
          region,
          contentHtml,
          geminiContent.summary ?? null,
          aiBulletsJson,
          aiFaqJson,
          geminiContent.cta ?? null,
          extraSectionsJson,
          publishAt,
          now,
          existing.id as string,
        ],
      });
      console.info(
        `[UPDATE] ${pharmacy.name} (${pharmacy.hpid}): 컨텐츠 업데이트 완료`,
      );
    } else {
      await db.execute({
        sql: `INSERT INTO content_queue (hpid, title, slug, region, content_html, ai_summary, ai_bullets, ai_faq, ai_cta, extra_sections, status, publish_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        args: [
          pharmacy.hpid,
          title,
          slug,
          region,
          contentHtml,
          geminiContent.summary ?? null,
          aiBulletsJson,
          aiFaqJson,
          geminiContent.cta ?? null,
          extraSectionsJson,
          publishAt,
          now,
        ],
      });
      console.info(
        `[CREATE] ${pharmacy.name} (${pharmacy.hpid}): 컨텐츠 생성 완료`,
      );
    }
  } catch (error) {
    console.error(`[ERROR] ${pharmacy.name} (${pharmacy.hpid}):`, error);
    if (existing) {
      await getRequiredTursoClient().execute({
        sql: `UPDATE content_queue SET status='failed', updated_at=? WHERE id=?`,
        args: [now, existing.id as string],
      });
    }
  }
}

async function generateBatchContent(limit: number = 10): Promise<void> {
  ensureEnv();
  const db = getRequiredTursoClient();

  // 모든 약국 hpid 가져오기
  const pharmaciesResult = await db.execute({
    sql: `SELECT hpid FROM pharmacies WHERE hpid IS NOT NULL LIMIT ?`,
    args: [limit * 3],
  });

  if (!pharmaciesResult.rows.length) {
    console.info("약국 데이터가 없습니다.");
    return;
  }

  // 이미 컨텐츠가 있는 hpid 확인 — 전체 테이블 스캔 대신 현재 배치 hpid만 조회 (idx_content_queue_hpid 활용)
  const batchHpids = pharmaciesResult.rows
    .map((p) => p.hpid as string)
    .filter(Boolean);
  const completedHpidSet = new Set<string>();
  if (batchHpids.length > 0) {
    const placeholders = batchHpids.map(() => "?").join(",");
    const existingResult = await db.execute({
      sql: `SELECT hpid, status, ai_summary, ai_faq FROM content_queue
            WHERE hpid IN (${placeholders}) AND status IN ('published', 'pending')`,
      args: batchHpids,
    });
    for (const item of existingResult.rows) {
      const hpid = item.hpid as string;
      const status = item.status as string;
      const ai_summary = item.ai_summary as string | null;
      const ai_faq = item.ai_faq as string | null;
      if (
        hpid &&
        (status === "published" ||
          (status === "pending" && ai_summary && ai_faq))
      ) {
        completedHpidSet.add(hpid);
      }
    }
  }

  const targetHpids = pharmaciesResult.rows
    .map((p) => p.hpid as string)
    .filter((hpid) => hpid && !completedHpidSet.has(hpid))
    .slice(0, limit);

  if (targetHpids.length === 0) {
    console.info(`모든 약국에 컨텐츠가 이미 생성되어 있습니다.`);
    return;
  }

  console.info(`총 ${targetHpids.length}개 약국의 컨텐츠를 생성합니다...`);

  // 마지막 예약 시간 확인
  const lastResult = await db.execute(
    `SELECT publish_at FROM content_queue WHERE status = 'pending' ORDER BY publish_at DESC LIMIT 1`,
  );
  let lastScheduledTime = lastResult.rows[0]?.publish_at
    ? new Date(lastResult.rows[0].publish_at as string)
    : new Date();

  if (lastScheduledTime.getTime() < Date.now()) {
    lastScheduledTime = new Date();
  }

  console.info(`예약 발행 시작 기준 시간: ${lastScheduledTime.toISOString()}`);

  // 중복 요약 방지용 최근 요약 — 루프 바깥에서 1회만 조회 (N×200 rows → 1×200 rows 절감)
  const recentSummaries = await getRecentSummariesForDedupe(200);
  // 지역별 약국 목록 캐시 — 같은 지역 반복 DB 조회 방지 (500 rows × N → 500 rows × unique_regions)
  const regionCache = new Map<string, Pharmacy[]>();

  for (let i = 0; i < targetHpids.length; i++) {
    const hpid = targetHpids[i];
    const pharmacy = await getPharmacyByHpid(hpid);

    if (!pharmacy) {
      console.warn(`[SKIP] ${hpid}: 약국 정보를 찾을 수 없음`);
      continue;
    }

    const nextSlot = getNextSlot(lastScheduledTime);
    lastScheduledTime = nextSlot;

    console.info(`[SCHEDULE] ${pharmacy.name} -> ${nextSlot.toISOString()}`);
    await generateAndQueueContent(
      pharmacy,
      nextSlot.toISOString(),
      recentSummaries,
      regionCache,
    );

    if (i < targetHpids.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.info(`배치 컨텐츠 생성 완료: ${targetHpids.length}개`);
}

async function main() {
  const limit = Number(process.argv[2]) || 10;
  console.info(`약국 컨텐츠 배치 생성 시작 (최대 ${limit}개)...`);
  await generateBatchContent(limit);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

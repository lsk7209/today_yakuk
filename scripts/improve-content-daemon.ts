import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import { getRequiredTursoClient, parseJson } from "../src/lib/turso";
import { generatePharmacyContent } from "../src/lib/gemini";
import type { Pharmacy } from "../src/types/pharmacy";
import { findUnsupportedPharmacyClaims, selectPharmacySummary } from "../src/lib/pharmacy-claims";

// P1 우선 검토 대상 약국 후보군 (docs/site-quality/API_CONTENT_WORK_PLAN.md 기준)
const P1_PRIORITY_HPIDS = [
  "C1110795", "C1110919", "C1110965", "C1110996", "C1111002",
  "C1111043", "C1111056", "C1111076", "C1111169", "C1111215",
  "C1111220", "C1111221", "C1111228", "C1111233", "C1111235",
  "C1111239", "C1203157", "C1203158", "C1400906", "C1402248",
  "C1402249", "C1402250", "C1402258", "C1402260", "C1402269",
  "C1501480", "C2110503", "C2110504", "C2110505", "C2110506",
  "C2110508", "C2110509", "C2110510", "C2110511", "C2110512",
  "C2110513", "C2110515", "C2110516", "C2110519", "C2110521",
  "C2110522", "C2110524", "C2110526", "C2110527", "C2110528",
  "C2110530", "C2110531", "C2110532", "C2110535", "C2110539",
  "C2201216", "C2301333", "C2601355", "C2701829", "C2701830",
  "C2701831", "C2701833", "C2701834", "C2701835", "C2800561",
  "C2802442", "C2802475", "C2802476", "C2900611"
];

interface DaemonOptions {
  dryRun: boolean;
  batchSize: number;
  targetHpid?: string;
}

function parseCliArgs(): DaemonOptions {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  let batchSize = 2; // 6시간마다 2건씩 안정적 순차 생성
  let targetHpid: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--batch-size" && args[i + 1]) {
      const parsed = parseInt(args[i + 1], 10);
      if (!isNaN(parsed) && parsed > 0) batchSize = Math.min(parsed, 10);
    }
    if (args[i] === "--hpid" && args[i + 1]) {
      targetHpid = args[i + 1];
    }
  }

  return { dryRun, batchSize, targetHpid };
}

/** CLI 및 스크립트 실행 환경용 직접 DB 조회 함수 (Next.js server-only 분리) */
async function fetchPharmacyByHpid(hpid: string): Promise<Pharmacy | null> {
  const db = getRequiredTursoClient();
  const res = await db.execute({
    sql: "SELECT id, hpid, name, address, tel, latitude, longitude, operating_hours, province, city FROM pharmacies WHERE hpid = ? LIMIT 1",
    args: [hpid],
  });
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: String(row.id),
    hpid: String(row.hpid),
    name: String(row.name),
    address: String(row.address ?? ""),
    tel: row.tel ? String(row.tel) : undefined,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    operating_hours: parseJson(row.operating_hours, null),
    province: row.province ? String(row.province) : null,
    city: row.city ? String(row.city) : null,
  };
}

async function fetchNearbyPharmacies(province: string, city: string, excludeHpid: string): Promise<Pharmacy[]> {
  const db = getRequiredTursoClient();
  const res = await db.execute({
    sql: "SELECT id, hpid, name, address, tel, latitude, longitude, operating_hours, province, city FROM pharmacies WHERE province = ? AND city = ? AND hpid != ? LIMIT 4",
    args: [province, city, excludeHpid],
  });
  return res.rows.map((row) => ({
    id: String(row.id),
    hpid: String(row.hpid),
    name: String(row.name),
    address: String(row.address ?? ""),
    tel: row.tel ? String(row.tel) : undefined,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    operating_hours: parseJson(row.operating_hours, null),
    province: row.province ? String(row.province) : null,
    city: row.city ? String(row.city) : null,
  }));
}

function normalizeTextForSimilarity(input: string): string {
  return input
    .replace(/[^\p{L}\p{N}\s:~\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenizeKorean(input: string): string[] {
  const stopWords = new Set([
    "약국", "위치", "운영", "영업", "시간", "정보", "확인", "가능",
    "입니다", "있습니다", "합니다", "위해", "및", "또는", "통해", "방문", "문의", "오늘", "지역"
  ]);
  return normalizeTextForSimilarity(input)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !stopWords.has(t));
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(tokenizeKorean(a));
  const setB = new Set(tokenizeKorean(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

async function getRecentSummaries(limit = 100): Promise<string[]> {
  try {
    const db = getRequiredTursoClient();
    const result = await db.execute({
      sql: "SELECT ai_summary FROM content_queue WHERE ai_summary IS NOT NULL ORDER BY updated_at DESC LIMIT ?",
      args: [limit],
    });
    return result.rows.map((r) => r.ai_summary as string).filter(Boolean);
  } catch {
    return [];
  }
}

/** 팩트 기반 안전한 폴백 템플릿 생성기 */
function buildDeterministicTemplate(pharmacy: Pharmacy) {
  const region = [pharmacy.province, pharmacy.city].filter(Boolean).join(" ");
  const telNotice = pharmacy.tel ? `전화번호는 ${pharmacy.tel}입니다.` : "방문 전 전화 확인이 권장됩니다.";
  
  const summary = `${region || "해당 지역"}에 위치한 ${pharmacy.name}의 등록 영업시간 및 위치 안내입니다. ${telNotice}`;

  const bullets = [
    `소재지: ${pharmacy.address || "등록된 주소 정보 확인 필요"}`,
    `연락처: ${pharmacy.tel || "전화번호 미등록"}`,
    "처방 조제 및 의약품 재고 여부는 방문 전 전화로 확인하시는 것을 권장합니다.",
    "공휴일 및 야간 운영 정보는 사전에 유선 확인 후 방문하시기 바랍니다.",
  ];

  const faq = [
    {
      question: `${pharmacy.name} 방문 시 준비물이 있나요?`,
      answer: "처방 조제의 경우 발행된 처방전 원본과 본인 확인이 가능한 신분증(또는 모바일 건강보험증)을 지참하셔야 합니다.",
    },
    {
      question: "영업시간이 실시간으로 변동될 수 있나요?",
      answer: "공공데이터에 등록된 기본 시간표 기준이며 약국 사정이나 공휴일 여부에 따라 변동될 수 있으므로 출발 전 유선 확인을 권장합니다.",
    },
  ];

  const cta = "지금 방문 가능한 근처 약국과 상세 운영 정보는 오늘약국 지도 검색에서 확인하실 수 있습니다.";

  return { summary, bullets, faq, cta };
}

/** 다음 후보 약국 목록 검색 */
async function selectCandidateHpids(options: DaemonOptions): Promise<string[]> {
  const db = getRequiredTursoClient();
  const selected: string[] = [];

  if (options.targetHpid) {
    return [options.targetHpid];
  }

  // 1. P1 우선 목록 중 아직 content_queue에 없는 항목 선별
  for (const hpid of P1_PRIORITY_HPIDS) {
    const existing = await db.execute({
      sql: "SELECT id FROM content_queue WHERE hpid = ? LIMIT 1",
      args: [hpid],
    });
    if (existing.rows.length === 0) {
      selected.push(hpid);
      if (selected.length >= options.batchSize) return selected;
    }
  }

  // 2. P1이 모두 소진되었거나 부족할 경우, DB 내 미처리 약국 자동 조회
  if (selected.length < options.batchSize) {
    const remaining = options.batchSize - selected.length;
    const query = await db.execute({
      sql: `SELECT p.hpid
            FROM pharmacies p
            LEFT JOIN content_queue cq ON p.hpid = cq.hpid
            WHERE cq.id IS NULL
              AND p.name IS NOT NULL
              AND p.operating_hours IS NOT NULL
              AND length(p.operating_hours) > 10
            ORDER BY p.updated_at DESC
            LIMIT ?`,
      args: [remaining],
    });

    for (const row of query.rows) {
      const hpid = String(row.hpid);
      if (!selected.includes(hpid)) {
        selected.push(hpid);
      }
    }
  }

  return selected;
}

export async function runContentImprovementDaemon(options: DaemonOptions = parseCliArgs()) {
  const startTime = new Date();
  console.info(`[Content-Improve-Daemon] 시작 시각: ${startTime.toISOString()}`);
  console.info(`[Content-Improve-Daemon] 옵션: dryRun=${options.dryRun}, batchSize=${options.batchSize}`);

  const candidates = await selectCandidateHpids(options);
  console.info(`[Content-Improve-Daemon] 대상 약국 후보 ${candidates.length}건 선별:`, candidates);

  if (candidates.length === 0) {
    console.info("[Content-Improve-Daemon] 처리할 대상 후보가 없습니다. 종료합니다.");
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const db = getRequiredTursoClient();
  const recentSummaries = await getRecentSummaries(100);
  let succeeded = 0;
  let failed = 0;

  for (let idx = 0; idx < candidates.length; idx++) {
    const hpid = candidates[idx];
    console.info(`\n[${idx + 1}/${candidates.length}] 약국 콘텐츠 보완 처리 중: HPID=${hpid}`);

    try {
      const pharmacy = await fetchPharmacyByHpid(hpid);
      if (!pharmacy) {
        console.warn(`[Content-Improve-Daemon] 약국 정보를 찾을 수 없음: ${hpid}`);
        failed++;
        continue;
      }

      const region = [pharmacy.province, pharmacy.city].filter(Boolean).join(" ");
      const nearby = pharmacy.province && pharmacy.city
        ? await fetchNearbyPharmacies(pharmacy.province, pharmacy.city, hpid)
        : [];

      // LLM 생성 시도 (실패 시 안전한 폴백 템플릿 사용)
      let generatedContent = null;
      if (process.env.GEMINI_API_KEY) {
        try {
          generatedContent = await generatePharmacyContent(pharmacy, nearby);
        } catch (llmErr) {
          console.warn(`[Content-Improve-Daemon] Gemini API 호출 실패 (폴백 템플릿 사용):`, llmErr);
        }
      }

      const fallback = buildDeterministicTemplate(pharmacy);
      let summary = generatedContent?.summary || fallback.summary;
      const bullets = generatedContent?.bullets || fallback.bullets;
      const faq = generatedContent?.faq || fallback.faq;
      const cta = generatedContent?.cta || fallback.cta;

      // 1. 허위/근거 없는 주장 검증 (YMYL 안전 가드)
      const claimViolations = findUnsupportedPharmacyClaims(summary, pharmacy);
      if (claimViolations.length > 0) {
        console.warn(`[Content-Improve-Daemon] 미지원 주장 탐지(${claimViolations.join(", ")}) → 팩트 템플릿 요약으로 교체`);
        summary = selectPharmacySummary(pharmacy, [summary], fallback.summary);
      }

      // 2. 최근 콘텐츠와의 유사도(중복 방지) 검사
      for (const existingSummary of recentSummaries) {
        if (jaccardSimilarity(summary, existingSummary) > 0.58) {
          console.warn("[Content-Improve-Daemon] 높은 유사도 감지 → 결정론적 팩트 템플릿으로 안전 교체");
          summary = fallback.summary;
          break;
        }
      }

      // 3. HTML 본문 구성
      const bulletHtml = bullets.map((b) => `<li>${b}</li>`).join("");
      const faqHtml = faq.map((f) => `<div><h3>${f.question}</h3><p>${f.answer}</p></div>`).join("");
      const contentHtml = `
<section>
  <p>${summary}</p>
  <ul>${bulletHtml}</ul>
  <section><h2>자주 묻는 질문</h2>${faqHtml}</section>
  <p>${cta}</p>
</section>`.trim();

      const title = `${pharmacy.name} | ${region || "약국"} 영업시간 및 이용 안내`;
      const slug = `pharmacy-${pharmacy.hpid}`;

      // 분산 발행 예약: 30분, 60분 등 순차적으로 publish_at 분산
      const publishDelayMinutes = (idx + 1) * 30;
      const publishAt = new Date(Date.now() + publishDelayMinutes * 60 * 1000).toISOString();

      if (options.dryRun) {
        console.info(`[Content-Improve-Daemon] [DRY-RUN] 검증 완료 (DB 미저장):`);
        console.info(`  - 제목: ${title}`);
        console.info(`  - 요약: ${summary}`);
        console.info(`  - 발행예약(publish_at): ${publishAt}`);
        succeeded++;
        continue;
      }

      // DB 저장 (content_queue에 pending 상태로 적재)
      const existing = await db.execute({
        sql: "SELECT id FROM content_queue WHERE hpid = ? LIMIT 1",
        args: [hpid],
      });

      if (existing.rows.length > 0) {
        await db.execute({
          sql: `UPDATE content_queue
                SET title = ?, slug = ?, region = ?, content_html = ?, ai_summary = ?,
                    ai_bullets = ?, ai_faq = ?, ai_cta = ?, status = 'pending',
                    publish_at = ?, updated_at = datetime('now')
                WHERE hpid = ?`,
          args: [
            title, slug, region, contentHtml, summary,
            JSON.stringify(bullets.map((text) => ({ text }))),
            JSON.stringify(faq), cta, publishAt, hpid,
          ],
        });
      } else {
        await db.execute({
          sql: `INSERT INTO content_queue (
                  hpid, title, slug, region, theme, content_html, ai_summary,
                  ai_bullets, ai_faq, ai_cta, extra_sections, status, publish_at, updated_at
                ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, 'pending', ?, datetime('now'))`,
          args: [
            hpid, title, slug, region, contentHtml, summary,
            JSON.stringify(bullets.map((text) => ({ text }))),
            JSON.stringify(faq), cta, publishAt,
          ],
        });
      }

      recentSummaries.push(summary);
      succeeded++;
      console.info(`[Content-Improve-Daemon] ✅ content_queue 적재 완료: ${hpid} (publish_at: ${publishAt})`);
    } catch (err) {
      console.error(`[Content-Improve-Daemon] ❌ ${hpid} 처리 중 오류:`, err);
      failed++;
    }
  }

  const durationSec = ((Date.now() - startTime.getTime()) / 1000).toFixed(1);
  console.info(`\n[Content-Improve-Daemon] 배치 완료 (${durationSec}s) — 성공=${succeeded}, 실패=${failed}`);
  return { processed: candidates.length, succeeded, failed };
}

if (require.main === module || process.argv[1]?.includes("improve-content-daemon")) {
  runContentImprovementDaemon().catch((err) => {
    console.error("[Content-Improve-Daemon] 치명적 오류:", err);
    process.exit(1);
  });
}

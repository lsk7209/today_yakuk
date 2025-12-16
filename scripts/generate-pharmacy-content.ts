import "dotenv/config";
// tsconfig-paths를 먼저 등록하여 @ 경로 별칭 해석
import "tsconfig-paths/register";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "../src/lib/supabase-server";
import { generatePharmacyContent } from "../src/lib/gemini";
import type { Pharmacy } from "../src/types/pharmacy";

// 약국 데이터 가져오기 함수 (직접 구현)
async function getPharmacyByHpid(hpid: string): Promise<Pharmacy | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("pharmacies")
      .select("*")
      .eq("hpid", hpid)
      .maybeSingle();
    if (error) {
      console.error("pharmacy fetch error", error);
      return null;
    }
    return data as Pharmacy | null;
  } catch (e) {
    console.error("pharmacy fetch exception", e);
    return null;
  }
}

// 지역 정규화 함수 (블록 밖으로 이동)
const PROVINCE_MAP: Record<string, string> = {
  서울: "서울특별시",
  서울특별시: "서울특별시",
  부산: "부산광역시",
  부산광역시: "부산광역시",
  대구: "대구광역시",
  대구광역시: "대구광역시",
  인천: "인천광역시",
  인천광역시: "인천광역시",
  광주: "광주광역시",
  광주광역시: "광주광역시",
  대전: "대전광역시",
  대전광역시: "대전광역시",
  울산: "울산광역시",
  울산광역시: "울산광역시",
  세종: "세종특별자치시",
  세종특별자치시: "세종특별자치시",
  경기: "경기",
  경기도: "경기",
  강원: "강원특별자치도",
  강원특별자치도: "강원특별자치도",
  충남: "충청남도",
  충청남도: "충청남도",
  충북: "충청북도",
  충청북도: "충청북도",
  전남: "전라남도",
  전라남도: "전라남도",
  전북: "전라북도",
  전라북도: "전라북도",
  경남: "경상남도",
  경상남도: "경상남도",
  경북: "경상북도",
  경상북도: "경상북도",
  제주: "제주특별자치도",
  제주특별자치도: "제주특별자치도",
};

function normalizeProvince(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return PROVINCE_MAP[trimmed] ?? trimmed;
}

async function getPharmaciesByRegion(
  province: string,
  city?: string,
): Promise<Pharmacy[]> {
  try {
    const supabase = getSupabaseServerClient();
    const normalizedProvince = normalizeProvince(province);
    if (!normalizedProvince) return [];

    let query = supabase.from("pharmacies").select("*").eq("province", normalizedProvince);
    if (city && city !== "전체") {
      query = query.eq("city", city);
    }
    const { data, error } = await query.order("name", { ascending: true }).limit(500);
    if (error) {
      console.error("pharmacies region fetch error", error);
      return [];
    }
    return (data as Pharmacy[]) ?? [];
  } catch (e) {
    console.error("pharmacies region fetch exception", e);
    return [];
  }
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

async function getRecentSummariesForDedupe(supabase: ReturnType<typeof createClient>, limit = 200) {
  try {
    const { data, error } = await supabase
      .from("content_queue")
      .select("ai_summary")
      .not("ai_summary", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []).map((r) => (r as { ai_summary?: string | null }).ai_summary).filter(Boolean) as string[];
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
  // 같은 날/같은 HPID는 같은 분산값(재현 가능). 10분~250분 사이로 분산.
  const dayKey = now.toISOString().slice(0, 10);
  const seed = `${dayKey}:${hpid}`;
  const minutes = 10 + (hashStringToUint(seed) % 241);
  const d = new Date(now.getTime() + minutes * 60 * 1000);
  return d.toISOString();
}

function ensureEnv() {
  if (!supabaseUrl) throw new Error("SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL이 필요합니다.");
  if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY가 필요합니다.");
}

/**
 * 약국 정보를 기반으로 Gemini API로 컨텐츠를 생성하고 content_queue에 저장합니다.
 */
async function generateAndQueueContent(
  pharmacy: Pharmacy,
  limit: number = 10,
): Promise<void> {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

  // 이미 큐에 있는지 확인 (더 상세하게 체크)
  const { data: existing } = await supabase
    .from("content_queue")
    .select("id, status, ai_summary, ai_faq, published_at")
    .eq("hpid", pharmacy.hpid)
    .maybeSingle();

  // 이미 컨텐츠가 생성되어 있는지 확인
  if (existing) {
    // published 상태이고 컨텐츠가 있으면 스킵
    if (existing.status === "published" && existing.ai_summary && existing.ai_faq) {
      console.info(`[SKIP] ${pharmacy.name} (${pharmacy.hpid}): 이미 발행된 컨텐츠 존재`);
      return;
    }
    // pending 상태이지만 컨텐츠가 있으면 스킵 (아직 발행 대기 중)
    if (existing.status === "pending" && existing.ai_summary && existing.ai_faq) {
      console.info(`[SKIP] ${pharmacy.name} (${pharmacy.hpid}): 발행 대기 중인 컨텐츠 존재`);
      return;
    }
    // failed 상태이거나 컨텐츠가 불완전한 경우에만 재생성
    if (existing.status === "failed" || !existing.ai_summary || !existing.ai_faq) {
      console.info(`[RETRY] ${pharmacy.name} (${pharmacy.hpid}): 컨텐츠 재생성 (이전: ${existing.status})`);
    }
  }

  try {
    // 주변 약국 정보 가져오기
    const regionList =
      pharmacy.province && pharmacy.city
        ? await getPharmaciesByRegion(pharmacy.province, pharmacy.city)
        : [];
    const nearby = regionList.slice(0, 5); // 최대 5개만

    // Gemini API로 컨텐츠 생성
    console.info(`[GENERATE] ${pharmacy.name} (${pharmacy.hpid})...`);
    const recentSummaries = await getRecentSummariesForDedupe(supabase, 200);
    let geminiContent = await generatePharmacyContent(pharmacy, nearby);

    // 내부 중복(유사 문장) 방지: 요약이 기존과 너무 비슷하면 1회 재생성
    if (geminiContent?.summary && recentSummaries.length) {
      const nearDups = pickNearDuplicates(geminiContent.summary, recentSummaries);
      if (nearDups.length) {
        console.info(
          `[DEDUPE] ${pharmacy.name} (${pharmacy.hpid}): 유사 요약 감지 → 문장 구조 변경 재생성`,
        );
        geminiContent = await generatePharmacyContent(pharmacy, nearby, { avoidSummaries: nearDups });
      }
    }

    if (!geminiContent) {
      console.warn(`[WARN] ${pharmacy.name} (${pharmacy.hpid}): Gemini API 호출 실패`);
      return;
    }

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

    // 기존 항목이 있으면 업데이트, 없으면 생성
    if (existing) {
      const { error } = await supabase
        .from("content_queue")
        .update({
          ...queueItem,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;
      console.info(`[UPDATE] ${pharmacy.name} (${pharmacy.hpid}): 컨텐츠 업데이트 완료`);
    } else {
      const { error } = await supabase.from("content_queue").insert(queueItem);

      if (error) throw error;
      console.info(`[CREATE] ${pharmacy.name} (${pharmacy.hpid}): 컨텐츠 생성 완료`);
    }
  } catch (error) {
    console.error(`[ERROR] ${pharmacy.name} (${pharmacy.hpid}):`, error);
    // 실패한 경우 status를 failed로 업데이트
    if (existing) {
      await supabase
        .from("content_queue")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    }
  }
}

/**
 * 컨텐츠가 없는 약국들을 찾아서 배치로 컨텐츠를 생성합니다.
 */
async function generateBatchContent(limit: number = 10): Promise<void> {
  ensureEnv();
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

  // 모든 약국 hpid 가져오기
  const { data: allPharmacies, error: queryError } = await supabase
    .from("pharmacies")
    .select("hpid")
    .not("hpid", "is", null)
    .limit(limit * 3); // 여유있게 가져오기

  if (queryError) {
    throw new Error(`약국 조회 실패: ${queryError.message}`);
  }

  if (!allPharmacies || allPharmacies.length === 0) {
    console.info("약국 데이터가 없습니다.");
    return;
  }

  // content_queue에서 이미 컨텐츠가 생성된 약국 찾기
  // published 상태이거나 pending 상태이면서 ai_summary와 ai_faq가 모두 있는 경우
  const { data: existingContent } = await supabase
    .from("content_queue")
    .select("hpid, status, ai_summary, ai_faq")
    .not("hpid", "is", null)
    .or("status.eq.published,status.eq.pending");

  // 컨텐츠가 완전히 생성된 hpid 집합 생성
  const completedHpidSet = new Set<string>();
  if (existingContent) {
    for (const item of existingContent) {
      // published 상태이거나, pending 상태이지만 컨텐츠가 완전한 경우
      if (
        item.hpid &&
        (item.status === "published" ||
          (item.status === "pending" && item.ai_summary && item.ai_faq))
      ) {
        completedHpidSet.add(item.hpid);
      }
    }
  }

  // 컨텐츠가 없는 약국만 필터링
  const targetHpids = allPharmacies
    .map((p) => p.hpid)
    .filter((hpid): hpid is string => hpid !== null && !completedHpidSet.has(hpid))
    .slice(0, limit);

  if (targetHpids.length === 0) {
    console.info(
      `모든 약국에 컨텐츠가 이미 생성되어 있습니다. (체크한 약국: ${allPharmacies.length}개, 완료된 컨텐츠: ${completedHpidSet.size}개)`,
    );
    return;
  }

  console.info(
    `총 ${targetHpids.length}개 약국의 컨텐츠를 생성합니다... (전체 약국: ${allPharmacies.length}개, 이미 생성됨: ${completedHpidSet.size}개)`,
  );

  // 배치로 처리 (순차 처리로 API Rate Limit 방지)
  for (let i = 0; i < targetHpids.length; i++) {
    const hpid = targetHpids[i];
    const pharmacy = await getPharmacyByHpid(hpid);

    if (!pharmacy) {
      console.warn(`[SKIP] ${hpid}: 약국 정보를 찾을 수 없음`);
      continue;
    }

    await generateAndQueueContent(pharmacy);
    
    // Rate Limit 방지를 위한 딜레이 (약 1초)
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


// dotenv를 먼저 로드 (.env.local 우선)
import dotenv from "dotenv";
import path from "path";
import * as fs from "fs";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config(); // .env도 로드

// tsconfig-paths를 등록하여 @ 경로 별칭 해석
import "tsconfig-paths/register";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "../src/lib/supabase-server";
import { generatePharmacyContent } from "../src/lib/gemini";
import type { Pharmacy } from "../src/types/pharmacy";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todaypharm.kr").replace(/\/$/, "");

// 지역 정규화 함수
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
    return (data ?? [])
      .map((r) => (r as { ai_summary?: string | null }).ai_summary)
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

function ensureEnv() {
  if (!supabaseUrl) throw new Error("SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL이 필요합니다.");
  if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY가 필요합니다.");
}

/**
 * 특정 약국에 대해 Gemini API로 컨텐츠를 생성하고 content_queue에 저장합니다.
 */
async function generateSinglePharmacyContent(hpid: string): Promise<void> {
  ensureEnv();
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

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
  const { data: existing } = await supabase
    .from("content_queue")
    .select("id, status, ai_summary, ai_faq, published_at")
    .eq("hpid", hpid)
    .maybeSingle();

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
    const recentSummaries = await getRecentSummariesForDedupe(supabase, 200);
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

    // 발행 시간 설정 (즉시 발행)
    const publishAt = new Date().toISOString();

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
      status: "published",
      publish_at: publishAt,
    };

    // content_queue 테이블에 저장 시도
    try {
      if (existing) {
        const { error } = await supabase
          .from("content_queue")
          .update({
            ...queueItem,
            updated_at: new Date().toISOString(),
            published_at: publishAt,
          })
          .eq("id", existing.id);

        if (error) throw error;
        console.info(`✅ 컨텐츠 업데이트 완료! (ID: ${existing.id})\n`);
      } else {
        const { data: inserted, error } = await supabase
          .from("content_queue")
          .insert(queueItem)
          .select("id")
          .single();

        if (error) throw error;
        console.info(`✅ 컨텐츠 생성 완료! (ID: ${inserted.id})\n`);
      }
    } catch (queueError: any) {
      // content_queue 테이블이 없거나 오류가 발생한 경우
      if (queueError?.code === "PGRST205" || queueError?.message?.includes("content_queue")) {
        console.warn(`⚠️  content_queue 테이블이 없습니다. 생성된 콘텐츠를 JSON 파일로 저장합니다.\n`);
        
        // JSON 파일로 저장
        const fs = require("fs");
        const outputDir = path.join(process.cwd(), "generated-content");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputFile = path.join(outputDir, `${hpid}.json`);
        const outputData = {
          hpid,
          pharmacy_name: pharmacy.name,
          generated_at: new Date().toISOString(),
          content: geminiContent,
          queue_item: queueItem,
        };
        
        fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
        
        console.info(`✅ JSON 파일 저장 완료: ${outputFile}\n`);
        console.warn(`⚠️  content_queue 테이블을 생성하려면 다음 SQL을 Supabase에서 실행하세요:\n`);
        console.warn(`   파일: supabase/content_queue.sql\n`);
        console.warn(`   또는 Supabase Dashboard → SQL Editor에서 실행하세요.\n`);
      } else {
        throw queueError;
      }
    }

    // pharmacies 테이블의 updated_at도 업데이트하여 sitemap에 반영
    // (컨텐츠가 업데이트되면 약국 정보도 최신으로 표시)
    await supabase
      .from("pharmacies")
      .update({ updated_at: new Date().toISOString() })
      .eq("hpid", pharmacy.hpid);
    
    console.info(`✅ 약국 정보 업데이트 시간 갱신 완료\n`);

    console.info(`🌐 상세 페이지 확인: ${siteUrl}/pharmacy/${pharmacy.hpid}`);
    console.info("\n=== 완료 ===\n");
  } catch (error: any) {
    console.error(`❌ 오류 발생:`, error);
    // 실패한 경우 status를 failed로 업데이트 (content_queue가 있는 경우만)
    if (existing) {
      try {
        await supabase
          .from("content_queue")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } catch (updateError) {
        // content_queue 테이블이 없으면 무시
        console.warn(`⚠️  content_queue 업데이트 실패 (무시됨)`);
      }
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


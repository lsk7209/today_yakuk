import "dotenv/config";
import "tsconfig-paths/register";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "../src/lib/supabase-server";
import { generatePharmacyContent } from "../src/lib/gemini";
import type { Pharmacy } from "../src/types/pharmacy";
import * as dotenv from "dotenv";

// .env.local 파일 명시적으로 로드
dotenv.config({ path: ".env.local" });
dotenv.config(); // .env 파일도 로드

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

async function getPharmacyByHpid(hpid: string, supabase: any): Promise<Pharmacy | null> {
  try {
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

async function generateAndSaveSummary(hpid: string): Promise<void> {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  // Supabase 클라이언트 생성
  let supabase;
  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } else {
    console.warn("⚠️ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다. getSupabaseServerClient()를 사용합니다.");
    supabase = getSupabaseServerClient();
  }

  console.info(`\n=== 약국 요약 생성 시작: ${hpid} ===`);

  const pharmacy = await getPharmacyByHpid(hpid, supabase);
  if (!pharmacy) {
    console.error(`❌ 약국 정보를 찾을 수 없습니다: ${hpid}`);
    return;
  }

  // 이미 gemini_summary가 있으면 업데이트 모드
  if (pharmacy.gemini_summary) {
    console.info(`🔄 [UPDATE] ${pharmacy.name} (${pharmacy.hpid}): 기존 요약 업데이트`);
  } else {
    console.info(`✨ [CREATE] ${pharmacy.name} (${pharmacy.hpid}): 새로운 요약 생성`);
  }

  console.info(`약국명: ${pharmacy.name}`);
  console.info(`주소: ${pharmacy.address}`);

  try {
    // Gemini API로 요약 생성
    console.info("Gemini API로 요약 생성 중...");
    const geminiContent = await generatePharmacyContent(pharmacy, []);

    if (!geminiContent || !geminiContent.summary) {
      console.error(`❌ Gemini API 호출 실패 또는 요약 없음`);
      return;
    }

    // pharmacies 테이블에 gemini_summary 저장
    const { error } = await supabase
      .from("pharmacies")
      .update({
        gemini_summary: geminiContent.summary,
        updated_at: new Date().toISOString(),
      })
      .eq("hpid", pharmacy.hpid);

    if (error) throw error;
    console.info(`✅ [SUCCESS] ${pharmacy.name} (${pharmacy.hpid}): 요약 저장 완료`);
    console.info(`요약: ${geminiContent.summary.substring(0, 150)}...`);
  } catch (error) {
    console.error(`❌ [ERROR] ${pharmacy.name} (${pharmacy.hpid}):`, error);
  }
}

async function main() {
  const hpid = process.argv[2];
  if (!hpid) {
    console.error("사용법: npm run generate:summary <hpid>");
    process.exit(1);
  }
  await generateAndSaveSummary(hpid);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

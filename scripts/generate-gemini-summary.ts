import "dotenv/config";
import "tsconfig-paths/register";
import { getRequiredTursoClient } from "../src/lib/turso";
import { generatePharmacyContent } from "../src/lib/gemini";
import type { Pharmacy } from "../src/types/pharmacy";
import * as dotenv from "dotenv";

// .env.local 파일 명시적으로 로드
dotenv.config({ path: ".env.local" });
dotenv.config(); // .env 파일도 로드

const geminiApiKey = process.env.GEMINI_API_KEY;

async function getPharmacyByHpid(hpid: string): Promise<Pharmacy | null> {
  try {
    const db = getRequiredTursoClient();
    const result = await db.execute({ sql: "SELECT * FROM pharmacies WHERE hpid = ? LIMIT 1", args: [hpid] });
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      hpid: String(row.hpid ?? ""),
      name: String(row.name ?? ""),
      address: String(row.address ?? ""),
      province: row.province ? String(row.province) : undefined,
      city: row.city ? String(row.city) : undefined,
      gemini_summary: row.gemini_summary ? String(row.gemini_summary) : undefined,
    } as unknown as Pharmacy;
  } catch (e) {
    console.error("pharmacy fetch exception", e);
    return null;
  }
}

async function generateAndSaveSummary(hpid: string): Promise<void> {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const db = getRequiredTursoClient();
  console.info(`\n=== 약국 요약 생성 시작: ${hpid} ===`);

  const pharmacy = await getPharmacyByHpid(hpid);
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
    await db.execute({
      sql: "UPDATE pharmacies SET gemini_summary = ?, updated_at = ? WHERE hpid = ?",
      args: [geminiContent.summary, new Date().toISOString(), pharmacy.hpid],
    });
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

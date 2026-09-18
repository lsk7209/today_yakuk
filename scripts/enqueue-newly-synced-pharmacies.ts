import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import "tsconfig-paths/register";
import { generateSinglePharmacyContent } from "./generate-single-pharmacy";

const TARGET_HPIDS = [
  "C1402249", // 센텀약국 (인천 서구)
  "C1110965", // 영등포제일큰약국 (서울 영등포구, 심야/공휴일)
  "C1402248", // 친절한우리약국 (인천 서해구)
  "C1402250", // 초록약국 (인천 연수구)
  "C2110505", // 진산한약국 (경기 남양주시)
  "C2110503", // 위례스타약국 (경기 하남시)
  "C2110506", // 미소약국 (경기 시흥시)
  "C2110508", // 메가팜프라자약국 (경기 용인시)
  "C2110504", // 이편한365약국 (경기 안성시)
];

async function main() {
  console.log(`신규 수집된 약국 ${TARGET_HPIDS.length}개에 대한 콘텐츠 생성을 시작합니다.`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < TARGET_HPIDS.length; i++) {
    const hpid = TARGET_HPIDS[i];
    console.log(`[${i + 1}/${TARGET_HPIDS.length}] ${hpid} 생성 중...`);
    try {
      await generateSinglePharmacyContent(hpid);
      successCount++;
    } catch (err) {
      console.error(`${hpid} 생성 실패:`, err);
      failCount++;
    }
  }

  console.log(`\n완료: 성공=${successCount}, 실패=${failCount}`);
}

main().catch(console.error);

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import "tsconfig-paths/register";
import { generateSinglePharmacyContent } from "./generate-single-pharmacy";

const TARGET_HPIDS = [
  "C2400108",
  "C2700443",
  "C1110828",
  "C1100918",
  "C2110260",
  "C1203091",
  "C2900553",
  "C2900596",
  "C2701794",
  "C2701808",
  "C1109074",
  "C1203067",
  "C2110264",
  "C1402222",
  "C2110263",
];

async function main() {
  console.log(`총 ${TARGET_HPIDS.length}개 추가 약국 콘텐츠 생성을 시작합니다.`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < TARGET_HPIDS.length; i++) {
    const hpid = TARGET_HPIDS[i];
    console.log(`[${i + 1}/${TARGET_HPIDS.length}] ${hpid} 처리 중...`);
    try {
      await generateSinglePharmacyContent(hpid);
      successCount++;
    } catch (err) {
      console.error(`${hpid} 처리 실패:`, err);
      failCount++;
    }
  }

  console.log(`\n완료: 성공=${successCount}, 실패=${failCount}`);
}

main().catch(console.error);

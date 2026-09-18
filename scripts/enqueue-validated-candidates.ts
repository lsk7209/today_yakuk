import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();
import "tsconfig-paths/register";
import { generateSinglePharmacyContent } from "./generate-single-pharmacy";

const TARGET_HPIDS = [
  "C1111022",
  "C1111206",
  "C1111207",
  "C1111208",
  "C1111209",
  "C1111211",
  "C1301380",
  "C1700754",
  "C2110494",
  "C2110495",
  "C2110496",
  "C2110497",
  "C2110498",
  "C2110499",
  "C2110500",
  "C2501550",
  "C2501551",
  "C2802473"
];

async function main() {
  console.log(`총 ${TARGET_HPIDS.length}개 신규 약국 콘텐츠 생성을 시작합니다.`);
  for (let i = 0; i < TARGET_HPIDS.length; i++) {
    const hpid = TARGET_HPIDS[i];
    console.log(`[${i + 1}/${TARGET_HPIDS.length}] ${hpid} 처리 중...`);
    try {
      await generateSinglePharmacyContent(hpid);
    } catch (err) {
      console.error(`${hpid} 처리 실패:`, err);
    }
  }
  console.log("모든 신규 약국 콘텐츠 생성이 완료되었습니다.");
}

main().catch(console.error);

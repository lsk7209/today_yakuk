import { readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateAdsenseSetup } from "../src/lib/adsense-setup-check";

// 읽기 전용 점검: 환경변수와 public/ads.txt의 게시자 ID 일치 여부만 확인한다.
function readAdsTxt(): string | null {
  try {
    return readFileSync(join(process.cwd(), "public", "ads.txt"), "utf8");
  } catch {
    return null;
  }
}

const result = evaluateAdsenseSetup({
  rawClientId: process.env.NEXT_PUBLIC_ADSENSE_PUB_ID?.trim() || process.env.NEXT_PUBLIC_ADSENSE_ID?.trim() || "",
  servingEnabled: process.env.NEXT_PUBLIC_ADSENSE_SERVING_ENABLED?.trim().toLowerCase() === "true",
  adsTxt: readAdsTxt(),
  slotIds: [
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM,
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED,
  ],
});

console.log(`state=${result.state}`);
result.errors.forEach((message) => console.error(`ERROR ${message}`));
result.warnings.forEach((message) => console.warn(`WARN  ${message}`));
process.exitCode = result.errors.length > 0 ? 1 : 0;

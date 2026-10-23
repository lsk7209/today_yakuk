/**
 * 고위험 건강 주제(임신·수유·소아·만성질환·상호작용·복용량) 글을 찾아 사람 검토 대기 목록을 만든다.
 * 키워드 탐지는 "검토 대상 후보"를 찾는 용도일 뿐이며 의학적 안전성의 승인으로 사용하지 않는다.
 *
 * 사용법: npm run audit:health-content   (docs/reports/health-content-review-queue.json 갱신, 읽기 전용 스캔)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src/app/blog", "src/lib/editorial-posts", "src/app/guide"];
const OUTPUT = "docs/reports/health-content-review-queue.json";

const TOPICS: Record<string, RegExp> = {
  pregnancy: /임신|임산부|임부|태아/,
  lactation: /수유|모유/,
  pediatric: /소아|영유아|어린이|아이\s*(열|해열)|신생아/,
  "chronic-disease": /고혈압|당뇨|신장|간\s*질환|만성\s*질환|천식/,
  interaction: /상호작용|병용|함께 복용|같이 복용|와파린|항응고/,
  dosage: /\d[\d,]*(\.\d+)?\s*(mg|IU|μg|mcg|g)\b|1일\s*\d|하루\s*\d|1회\s*\d/i,
  "home-remedy": /베이킹소다|민간요법|집에서\s*(타|마시)/,
  "statistic-claim": /\d+(\.\d+)?\s*%\s*(가|이|의)?\s*(부족|결핍|해당|경험)/,
};

function listFiles(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(rel);
    return /\.(tsx?|md)$/.test(entry.name) ? [rel] : [];
  });
}

const queue = SCAN_DIRS.flatMap(listFiles).flatMap((file) => {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  const hits = Object.entries(TOPICS)
    .map(([topic, pattern]) => ({
      topic,
      count: (text.match(new RegExp(pattern, "g")) ?? []).length,
    }))
    .filter((hit) => hit.count > 0);
  if (!hits.some((hit) => hit.topic !== "dosage")) return [];
  return [
    {
      file: file.split(path.sep).join("/"),
      topics: hits,
      reviewStatus: "needs_pharmacist_review",
    },
  ];
});

fs.mkdirSync(path.dirname(path.join(ROOT, OUTPUT)), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, OUTPUT),
  JSON.stringify(
    {
      note: "키워드 탐지 결과이며 의학적 안전성의 승인이 아닙니다. 실제 검토자와 검토 기록이 생기기 전에는 reviewed로 표시하지 않습니다.",
      scannedDirs: SCAN_DIRS,
      count: queue.length,
      queue,
    },
    null,
    2,
  ),
);
console.log(`review queue: ${queue.length} file(s) -> ${OUTPUT}`);

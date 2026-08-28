import "dotenv/config";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getRequiredTursoClient } from "../src/lib/turso";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type QueueItem = {
  slug: string;
  content_html: string;
  ai_summary: string;
  ai_faq: { question: string; answer: string }[];
  quality_score?: number;
};

const CAMPAIGN_PATHS = [
  path.join(process.cwd(), "content", "blog-campaign-2026-05-04.json"),
  path.join(process.cwd(), "content", "blog-campaign-2026-05-04-v2.json"),
  path.join(process.cwd(), "content", "blog-campaign-2026-05-05-v3.json"),
  path.join(process.cwd(), "content", "blog-campaign-2026-05-05-v4.json"),
];
const BAD_PATTERNS =
  /(약국는|메모은|약국 방문 전은|방문 전은|복용 전은|운전 전은|보관 전은|상비 전은|취침 전은|식사 전은|상담 전은|전에서|위치은|위치을|확인를|순서이|방지이|방지을|알레르기을|알레르기과|상담을 함께 봐야|전화 확인을 확인|전화 확인을 먼저 확인|복용약와|시간와|코은|코을|피부은|피부을|마스크이|마스크을|재고은|재고을|기침를|겨울 건조증는|대비이|직장인가|가정가|복용 실수을|오복용|콧물약는|운전를|생활 주의이|식후은|식후을|비상약함는|처방전는|상비약는)/;
const AWKWARD_PATTERNS =
  /(약국 상담의 출발점입니다|단순히 가까운 장소나 익숙한 제품을 고르는 문제가 아닙니다|같은 상황처럼 보여도|같은 증상처럼 보여도|약국 방문 후 다시 이동하는 일을 줄일 수 있습니다|검색 결과만 믿지 말고 방문 전 한 번 더 확인해야 합니다|함께 봐야 헛걸음을 줄이고|함께 확인해야 안전하게 판단할 수 있습니다)/;

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/약국는/g, "약국은"],
  [/약국 상담 메모은/g, "약국 상담 메모는"],
  [/증상 메모은/g, "증상 메모는"],
  [/상담 메모은/g, "상담 메모는"],
  [/복용 메모은/g, "복용 메모는"],
  [/약국 방문 전은/g, "약국 방문 전에는"],
  [/운전 전은/g, "운전 전에는"],
  [/복용 전은/g, "복용 전에는"],
  [/보관 전은/g, "보관 전에는"],
  [/상비 전은/g, "상비 전에는"],
  [/취침 전은/g, "취침 전에는"],
  [/식사 전은/g, "식사 전에는"],
  [/방문 전은/g, "방문 전에는"],
  [/약국 방문 전에서/g, "약국 방문 전에"],
  [/방문 전에서/g, "방문 전에"],
  [/위치은/g, "위치는"],
  [/위치을/g, "위치를"],
  [/확인를/g, "확인을"],
  [/확인 순서이/g, "확인 순서가"],
  [/방지이/g, "방지가"],
  [/방지을/g, "방지를"],
  [/알레르기을/g, "알레르기를"],
  [/알레르기과/g, "알레르기와"],
  [/복용약와/g, "복용약과"],
  [/시간와/g, "시간과"],
  [/재고은/g, "재고는"],
  [/재고을/g, "재고를"],
  [/기침를/g, "기침을"],
  [/겨울 건조증는/g, "겨울 건조증은"],
  [/대비이/g, "대비가"],
  [/코은/g, "코는"],
  [/코을/g, "코를"],
  [/피부은/g, "피부는"],
  [/피부을/g, "피부를"],
  [/피부과 코/g, "피부와 코"],
  [/마스크이/g, "마스크가"],
  [/마스크을/g, "마스크를"],
  [/직장인가/g, "직장인이"],
  [/가정가/g, "가정이"],
  [/복용 실수을/g, "복용 실수를"],
  [/오복용을/g, "복용 실수를"],
  [/오복용/g, "복용 실수"],
  [/콧물약는/g, "콧물약은"],
  [/운전를/g, "운전을"],
  [/생활 주의이/g, "생활 주의가"],
  [/식후은/g, "식후는"],
  [/식후을/g, "식후를"],
  [/비상약함는/g, "비상약함은"],
  [/처방전는/g, "처방전은"],
  [/상비약는/g, "상비약은"],
  [/전화 확인 확인이/g, "전화 확인이"],
  [/전화 확인을 먼저 확인/g, "전화 가능 여부를 먼저 확인"],
  [/영업시간과 전화 확인을 먼저 확인/g, "영업시간과 전화 가능 여부를 먼저 확인"],
  [/전화 확인을 확인/g, "전화 가능 여부를 확인"],
  [/전화 확인은 같은 검색어/g, "전화 확인은 같은 검색 결과"],
  [/전화 확인을 빠뜨리면/g, "전화 확인을 하지 않으면"],
  [/헛걸음과 복용 실수를 줄일 수 있습니다/g, "헛걸음을 줄이고 복용 실수를 예방할 수 있습니다"],
  [/검색 결과만 믿지 말고 방문 전 한 번 더 확인해야 합니다/g, "지도 표시와 실제 운영이 다를 수 있어 출발 전 통화로 확인해야 합니다"],
  [/검색 결과만으로 확정하기 어렵기 때문에 전화 확인이 필요합니다/g, "지도 정보만으로는 확정하기 어려워 전화로 한 번 더 확인해야 합니다"],
  [/검색 결과와 실제 상황이 다를 수 있어 전화 확인이 필요합니다/g, "현장 상황이 바뀔 수 있어 출발 전 전화 확인이 필요합니다"],
  [/약국 방문 후 다시 이동하는 일을 줄일 수 있습니다/g, "닫힌 약국 앞에서 다시 후보를 찾는 시간을 줄일 수 있습니다"],
  [/약국 상담의 출발점입니다/g, "먼저 말해야 할 핵심 정보입니다"],
  [/단순히 가까운 장소나 익숙한 제품을 고르는 문제가 아닙니다/g, "거리만 보고 움직이면 닫힌 약국에 도착하거나 필요한 상담을 놓칠 수 있습니다"],
  [/같은 상황처럼 보여도 나이, 복용 중인 약, 이동 시간, 증상 기간에 따라 약국 상담의 방향이 달라질 수 있습니다/g, "특히 나이, 복용 중인 약, 증상 시작 시간에 따라 약사가 확인해야 할 내용이 달라집니다"],
  [/같은 상황처럼 보여도 나이, 복용 중인 약, 생활 일정, 증상 기간에 따라 약국 상담의 방향이 달라집니다/g, "특히 나이, 복용 중인 약, 증상 시작 시간에 따라 약사가 확인해야 할 내용이 달라집니다"],
  [/같은 증상처럼 보여도 나이·복용약·생활 상황에 따라 적절한 선택이 달라지기 때문입니다/g, "나이, 복용약, 증상 시작 시간에 따라 약국에서 권하는 선택지가 달라질 수 있기 때문입니다"],
  [/같은 증상처럼 보여도 나이, 복용 중인 약, 생활 일정, 증상 기간에 따라 약국 상담의 방향이 달라집니다/g, "같은 증상이라도 나이, 복용 중인 약, 증상 시작 시간에 따라 상담 내용이 달라집니다"],
  [/함께 봐야 헛걸음을 줄이고 복용 실수를 예방할 수 있습니다/g, "순서대로 확인하면 헛걸음을 줄이고 복용 실수를 예방할 수 있습니다"],
  [/함께 확인해야 안전하게 판단할 수 있습니다/g, "순서대로 정리하면 상담이 빨라집니다"],
  [/상담을 함께 봐야/g, "상담 가능 여부를 함께 확인해야"],
  [/전화까지 함께 확인하면/g, "전화로 실제 영업 여부까지 확인하면"],
  [/통화까지 함께 확인하면/g, "통화 가능 여부까지 확인하면"],
  [/상담까지 함께 확인하면/g, "상담 가능 여부까지 확인하면"],
  [/증상과 시간을 짧게 정리하기/g, "전화 전에 말할 내용을 30초로 줄이기"],
  [/상황과 복용 정보를 나누기/g, "증상, 시간, 복용약을 따로 적기"],
];

function repairText(value: string) {
  return REPLACEMENTS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function humanQualityScore(item: QueueItem) {
  const text = `${stripHtml(item.content_html)} ${item.ai_summary} ${JSON.stringify(item.ai_faq)}`;
  let score = 100;
  if (text.length < 1400) score -= 10;
  if (BAD_PATTERNS.test(text)) score -= 30;
  score -= Math.min(20, countMatches(text, AWKWARD_PATTERNS) * 4);
  if ((item.content_html.match(/<h2/gi) ?? []).length < 4) score -= 8;
  if ((item.content_html.match(/<table/gi) ?? []).length < 1) score -= 5;
  if ((item.content_html.match(/checklist|step-card|key-takeaways/gi) ?? []).length < 2) score -= 5;
  if ((item.content_html.match(/href="https?:\/\//gi) ?? []).length < 1) score -= 8;
  if (item.ai_faq.length < 4) score -= 8;
  return Math.max(0, Math.min(100, score));
}

function repairItem(item: QueueItem) {
  const repaired = {
    ...item,
    content_html: repairText(item.content_html),
    ai_summary: repairText(item.ai_summary),
    ai_faq: item.ai_faq.map((faq) => ({
      question: repairText(faq.question),
      answer: repairText(faq.answer),
    })),
  };
  return {
    ...repaired,
    quality_score: Math.max(repaired.quality_score ?? 0, humanQualityScore(repaired), 85),
  };
}

function loadCampaign(filePath: string) {
  const source = fs.readFileSync(filePath, "utf8");
  return JSON.parse(source) as QueueItem[];
}

function assertClean(items: QueueItem[]) {
  const failed = items
    .map((item) => ({
      slug: item.slug,
      text: `${item.content_html} ${item.ai_summary} ${JSON.stringify(item.ai_faq)}`,
    }))
    .map((item) => ({
      ...item,
      bad: item.text.match(BAD_PATTERNS)?.[0],
      awkward: item.text.match(AWKWARD_PATTERNS)?.[0],
    }))
    .filter((item) => item.bad || item.awkward);

  if (failed.length > 0) {
    throw new Error(
      `Korean quality gate failed: ${failed
        .map((item) => `${item.slug}(${item.bad ?? item.awkward})`)
        .join(", ")}`,
    );
  }
}

function qualityReport(filePath: string, items: QueueItem[]) {
  const scores = items.map(humanQualityScore);
  const min = Math.min(...scores);
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const weak = items
    .map((item, index) => ({ slug: item.slug, score: scores[index] }))
    .filter((item) => item.score < 85);
  console.info(
    `${path.relative(process.cwd(), filePath)}: items=${items.length} min_human_quality=${min} avg_human_quality=${avg.toFixed(1)} weak=${weak.length}`,
  );
  if (weak.length > 0) {
    throw new Error(`Human quality score below 85: ${weak.map((item) => `${item.slug}:${item.score}`).join(", ")}`);
  }
}

async function updateTurso(items: QueueItem[]) {
  const db = getRequiredTursoClient();
  const seenSlugs = new Set<string>();
  let updated = 0;
  for (const item of items) {
    if (seenSlugs.has(item.slug)) continue;
    seenSlugs.add(item.slug);
    const result = await db.execute({
      sql: `UPDATE content_queue
            SET content_html = ?, ai_summary = ?, ai_faq = ?, updated_at = ?
            WHERE slug = ? AND status IN ('pending', 'review', 'published')`,
      args: [
        item.content_html,
        item.ai_summary,
        JSON.stringify(item.ai_faq),
        new Date().toISOString(),
        item.slug,
      ],
    });
    updated += result.rowsAffected ?? 0;
  }
  return updated;
}

async function main() {
  const writeJson = process.argv.includes("--write-json");
  const updateDb = process.argv.includes("--update-db");
  const repairedByPath = CAMPAIGN_PATHS.map((filePath) => ({
    filePath,
    items: loadCampaign(filePath).map(repairItem),
  }));

  repairedByPath.forEach(({ filePath, items }) => {
    assertClean(items);
    qualityReport(filePath, items);
  });

  if (writeJson) {
    repairedByPath.forEach(({ filePath, items }) => {
      fs.writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
      console.info(`Updated ${path.relative(process.cwd(), filePath)}`);
    });
  }

  if (updateDb) {
    const updated = await updateTurso(repairedByPath.flatMap(({ items }) => items));
    console.info(`Turso rows updated=${updated}`);
  }

  if (!writeJson && !updateDb) {
    const total = repairedByPath.reduce((sum, { items }) => sum + items.length, 0);
    console.info(`Checked ${total} campaign items.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

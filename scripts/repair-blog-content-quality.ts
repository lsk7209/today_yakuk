import "dotenv/config";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type QueueItem = {
  slug: string;
  content_html: string;
  ai_summary: string;
  ai_faq: { question: string; answer: string }[];
};

const CAMPAIGN_PATH = path.join(process.cwd(), "content", "blog-campaign-2026-05-04.json");
const BAD_PATTERNS =
  /(약국는|위치은|위치을|확인를|순서이|방지이|방지을|코은|코을|피부은|피부을|마스크이|마스크을|재고은|재고을|기침를|겨울 건조증는|대비이|직장인가|가정가|복용 실수을|오복용)/;

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/약국는/g, "약국은"],
  [/위치은/g, "위치는"],
  [/위치을/g, "위치를"],
  [/확인를/g, "확인을"],
  [/확인 순서이/g, "확인 순서가"],
  [/방지이/g, "방지가"],
  [/방지을/g, "방지를"],
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
  [/전화 확인 확인이/g, "전화 확인이"],
  [/영업시간과 전화 확인을 먼저 확인/g, "영업시간과 전화 가능 여부를 먼저 확인"],
  [/전화 확인을 확인/g, "전화 가능 여부를 확인"],
  [/전화 확인은 같은 검색어/g, "전화 확인은 같은 검색 결과"],
  [/전화 확인을 빠뜨리면/g, "전화 확인을 하지 않으면"],
  [/헛걸음과 복용 실수를 줄일 수 있습니다/g, "헛걸음을 줄이고 복용 실수를 예방할 수 있습니다"],
];

function repairText(value: string) {
  return REPLACEMENTS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function repairItem(item: QueueItem) {
  return {
    ...item,
    content_html: repairText(item.content_html),
    ai_summary: repairText(item.ai_summary),
    ai_faq: item.ai_faq.map((faq) => ({
      question: repairText(faq.question),
      answer: repairText(faq.answer),
    })),
  };
}

function loadCampaign() {
  const source = fs.readFileSync(CAMPAIGN_PATH, "utf8");
  return JSON.parse(source) as QueueItem[];
}

function assertClean(items: QueueItem[]) {
  const failed = items
    .map((item) => ({
      slug: item.slug,
      text: `${item.content_html} ${item.ai_summary} ${JSON.stringify(item.ai_faq)}`,
    }))
    .filter((item) => BAD_PATTERNS.test(item.text));

  if (failed.length > 0) {
    throw new Error(`Korean particle gate failed: ${failed.map((item) => item.slug).join(", ")}`);
  }
}

async function updateSupabase(items: QueueItem[]) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase env not found.");

  const supabase = createClient(supabaseUrl, serviceKey);
  let updated = 0;
  for (const item of items) {
    const { error, count } = await supabase
      .from("content_queue")
      .update({
        content_html: item.content_html,
        ai_summary: item.ai_summary,
        ai_faq: item.ai_faq,
        updated_at: new Date().toISOString(),
      }, { count: "exact" })
      .eq("slug", item.slug)
      .in("status", ["pending", "review", "published"]);

    if (error) throw error;
    updated += count ?? 0;
  }

  return updated;
}

async function main() {
  const writeJson = process.argv.includes("--write-json");
  const updateDb = process.argv.includes("--update-db");
  const repaired = loadCampaign().map(repairItem);
  assertClean(repaired);

  if (writeJson) {
    fs.writeFileSync(CAMPAIGN_PATH, `${JSON.stringify(repaired, null, 2)}\n`, "utf8");
    console.info(`Updated ${path.relative(process.cwd(), CAMPAIGN_PATH)}`);
  }

  if (updateDb) {
    const updated = await updateSupabase(repaired);
    console.info(`Supabase rows updated=${updated}`);
  }

  if (!writeJson && !updateDb) {
    console.info(`Checked ${repaired.length} campaign items.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

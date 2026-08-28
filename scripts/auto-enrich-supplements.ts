/**
 * Auto Enrich Supplements Script
 *
 * C003 식약처 API로 원재료·영양성분 텍스트를 가져오고,
 * Claude Code가 직접 작성한 nutrition-parser로 구조화.
 * 외부 AI API(Gemini, OpenAI 등) 사용 없음.
 *
 * Usage: npx tsx scripts/auto-enrich-supplements.ts [limit]
 */

import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";
import { analyzeProduct } from "./lib/nutrition-parser";
import { detectAdditives } from "./lib/additive-keywords";
import {
  getEnrichmentOffset,
  persistSupplementEnrichment,
} from "./lib/supplement-enrichment";

dotenv.config({ path: ".env.local" });

const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;

async function autoEnrichSupplements() {
  const limit = parseInt(process.argv[2] || "100", 10);
  const defaultCursor = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  const cursor = parseInt(process.argv[3] || String(defaultCursor), 10);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 500) {
    throw new Error("limit must be an integer between 1 and 500");
  }
  if (!Number.isSafeInteger(cursor) || cursor < 0) {
    throw new Error("cursor must be a non-negative integer");
  }

  if (!FOOD_SAFETY_API_KEY) {
    console.error("❌ FOOD_SAFETY_API_KEY 환경변수가 없습니다.");
    process.exit(1);
  }

  const db = getTursoClient();

  const pendingResult = await db.execute(`SELECT COUNT(*) AS cnt FROM supplements
          WHERE (nutrition_facts IS NULL OR nutrition_facts = '[]' OR nutrition_facts = 'null')
          AND product_report_no IS NOT NULL AND product_report_no != ''`);
  const pendingCount = Number(pendingResult.rows[0]?.cnt ?? 0);
  const offset = getEnrichmentOffset(pendingCount, limit, cursor);
  console.log(
    `🚀 Starting enrichment (Pending: ${pendingCount}, Limit: ${limit}, Offset: ${offset})...\n`,
  );

  const result = await db.execute({
    sql: `SELECT id, name, product_report_no FROM supplements
          WHERE (nutrition_facts IS NULL OR nutrition_facts = '[]' OR nutrition_facts = 'null')
          AND product_report_no IS NOT NULL AND product_report_no != ''
          ORDER BY id
          LIMIT ? OFFSET ?`,
    args: [limit, offset],
  });

  if (!result.rows.length) {
    console.log("✅ No pending supplements found for enrichment.");
    return;
  }

  console.log(`📦 Found ${result.rows.length} supplements to enrich.\n`);

  let successCount = 0;
  let failCount = 0;
  let noDataCount = 0;

  for (const item of result.rows) {
    const id = item.id as string;
    const name = item.name as string;
    const product_report_no = item.product_report_no as string;
    console.log(`Processing: ${name} (${product_report_no})...`);

    const SERVICE_ID = "C003";
    const url = `https://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/1/1/PRDLST_REPORT_NO=${product_report_no}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HFF API request failed (${response.status} ${response.statusText})`);
      }
      const apiData = await response.json();
      const rawItem = apiData[SERVICE_ID]?.row?.[0];

      if (!rawItem) {
        console.warn(`  ⚠️ No C003 data for ${name}`);
        noDataCount++;
        continue;
      }

      const rawMaterials = rawItem.RAWMTRL_NM || "";
      const nutritionStr = rawItem.NUT_MTR || rawItem.STDR_STND || "";

      const analysis = analyzeProduct(name, rawMaterials, nutritionStr);
      const additives = detectAdditives(rawMaterials);
      const enrichmentResult = await persistSupplementEnrichment(
        { id, analysis, additives },
        (statement) => db.execute(statement),
      );

      if (enrichmentResult === "no_data") {
        console.warn(
          `  ⚠️ No structured nutrition facts for ${name}; leaving the database row unchanged.`,
        );
        noDataCount++;
        continue;
      }

      console.log(`  ✅ ${name} — ${analysis.nutrition_facts.length} nutrients`);
      successCount++;

      // C003 API rate limit 대응
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`  ❌ Error: ${name}:`, err);
      failCount++;
    }
  }

  console.log(`\n✨ Done`);
  console.log(`  Success:  ${successCount}`);
  console.log(`  No data:  ${noDataCount}`);
  console.log(`  Errors:   ${failCount}`);
  if (failCount > 0) {
    throw new Error(`Supplement enrichment incomplete: ${failCount} item(s) failed`);
  }
}

autoEnrichSupplements().catch((error) => {
  console.error("Fatal enrichment error:", error);
  process.exitCode = 1;
});

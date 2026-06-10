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
import { analyzeProduct, createMixedSummary } from "./lib/nutrition-parser";
import { detectAdditives } from "./lib/additive-keywords";

dotenv.config({ path: ".env.local" });

const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;

async function autoEnrichSupplements() {
  const limit = parseInt(process.argv[2] || "100", 10);
  console.log(`🚀 Starting enrichment (Limit: ${limit})...\n`);

  if (!FOOD_SAFETY_API_KEY) {
    console.error("❌ FOOD_SAFETY_API_KEY 환경변수가 없습니다.");
    process.exit(1);
  }

  const db = getTursoClient();

  const result = await db.execute({
    sql: `SELECT id, name, product_report_no FROM supplements
          WHERE (nutrition_facts IS NULL OR nutrition_facts = '[]' OR nutrition_facts = 'null')
          AND product_report_no IS NOT NULL AND product_report_no != ''
          LIMIT ?`,
    args: [limit],
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
    const url = `http://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/1/1/PRDLST_REPORT_NO=${product_report_no}`;

    try {
      const response = await fetch(url);
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
      const mixedSummary = createMixedSummary(analysis);

      await db.execute({
        sql: `UPDATE supplements SET nutrition_facts = ?, ai_summary = ?, additives = ? WHERE id = ?`,
        args: [
          JSON.stringify(analysis.nutrition_facts),
          mixedSummary,
          JSON.stringify(additives),
          id,
        ],
      });

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
}

autoEnrichSupplements().catch(console.error);

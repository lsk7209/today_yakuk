/**
 * Auto Enrich Supplements Script
 *
 * Fetches supplements with missing nutrition_facts and enriches them using:
 * 1. Food Safety Korea API for raw data
 * 2. Gemini AI for structured analysis
 */

import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateAIAnalysis, createMixedSummary } from "./lib/gemini-nutrition-analyzer";
import { detectAdditives } from "./lib/additive-keywords";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const FOOD_SAFETY_API_KEY = process.env.FOOD_SAFETY_API_KEY!;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function autoEnrichSupplements() {
  const limit = parseInt(process.argv[2] || "100", 10);
  console.log(`🚀 Starting automated nutrition info enrichment (Limit: ${limit})...\n`);

  const db = getTursoClient();

  // Fetch supplements where nutrition_facts is missing
  const result = await db.execute({
    sql: `SELECT id, name, product_report_no FROM supplements
          WHERE nutrition_facts IS NULL OR nutrition_facts = '[]' OR nutrition_facts = 'null'
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

  for (const item of result.rows) {
    const id = item.id as string;
    const name = item.name as string;
    const product_report_no = item.product_report_no as string;
    console.log(`Processing: ${name} (Rule: ${product_report_no}, ID: ${id})...`);

    const SERVICE_ID = "C003";
    const url = `http://openapi.foodsafetykorea.go.kr/api/${FOOD_SAFETY_API_KEY}/${SERVICE_ID}/json/1/1/PRDLST_REPORT_NO=${product_report_no}`;

    try {
      const response = await fetch(url);
      const apiData = await response.json();
      const rawItem = apiData[SERVICE_ID]?.row?.[0];

      if (!rawItem) {
        console.warn(`⚠️ Could not find raw data for ${name}`);
        failCount++;
        continue;
      }

      const rawMaterials = rawItem.RAWMTRL_NM || "";
      const nutritionStr = rawItem.NUT_MTR || rawItem.STDR_STND || "";

      const aiAnalysis = await generateAIAnalysis(genAI, name, rawMaterials, nutritionStr);
      const additives = detectAdditives(rawMaterials);
      const mixedSummary = createMixedSummary(aiAnalysis);

      await db.execute({
        sql: `UPDATE supplements SET nutrition_facts = ?, ai_summary = ?, additives = ? WHERE id = ?`,
        args: [
          JSON.stringify(aiAnalysis.nutrition_facts || []),
          mixedSummary,
          JSON.stringify(additives),
          id,
        ],
      });

      console.log(`✅ Enriched: ${name} (${aiAnalysis.nutrition_facts.length} nutrients found)`);
      successCount++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error processing ${name}:`, err);
      failCount++;
    }
  }

  console.log(`\n✨ Enrichment batch completed!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
}

autoEnrichSupplements().catch(console.error);

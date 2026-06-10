/**
 * 제품명 기반 nutrition_facts / ai_summary 자동 생성
 * Claude Code 직접 작성 — 외부 AI API 없음
 *
 * Usage: npx tsx scripts/enrich-from-product-name.ts [batch_size]
 */

import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";
import { analyzeFromNameOnly, createMixedSummary } from "./lib/nutrition-parser";

dotenv.config({ path: ".env.local" });

async function run() {
  const batchSize = parseInt(process.argv[2] || "1000", 10);
  const db = getTursoClient();

  const r = await db.execute({
    sql: `SELECT id, name FROM supplements
          WHERE nutrition_facts IS NULL OR nutrition_facts = 'null' OR nutrition_facts = ''
          LIMIT ?`,
    args: [batchSize],
  });

  console.log(`처리 대상: ${r.rows.length}개 (최대 ${batchSize}개)`);

  let withFacts = 0;
  let summaryOnly = 0;
  let processed = 0;

  for (const row of r.rows) {
    const id = row.id as string;
    const name = row.name as string;

    const analysis = analyzeFromNameOnly(name);
    const mixedSummary = createMixedSummary(analysis);
    const hasFacts = analysis.nutrition_facts.length > 0;

    await db.execute({
      sql: `UPDATE supplements SET nutrition_facts = ?, ai_summary = ? WHERE id = ?`,
      args: [
        JSON.stringify(analysis.nutrition_facts),
        mixedSummary,
        id,
      ],
    });

    if (hasFacts) withFacts++;
    else summaryOnly++;
    processed++;

    if (processed % 200 === 0) {
      console.log(`  ${processed}개 처리 (성분 추출: ${withFacts}, 요약만: ${summaryOnly})`);
    }
  }

  console.log(`\n완료: 총 ${processed}개`);
  console.log(`  성분 추출 성공: ${withFacts}개 (${((withFacts / processed) * 100).toFixed(1)}%)`);
  console.log(`  요약만 생성:   ${summaryOnly}개`);
}

run().catch(console.error);

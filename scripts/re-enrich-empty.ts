/**
 * nutrition_facts가 빈배열([])인 제품에 대해 개선된 파서로 재처리
 * Claude Code 직접 작성 — 외부 AI API 없음
 */

import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";
import { analyzeFromNameOnly, createMixedSummary } from "./lib/nutrition-parser";

dotenv.config({ path: ".env.local" });

async function run() {
  const batchSize = parseInt(process.argv[2] || "5000", 10);
  const db = getTursoClient();

  const r = await db.execute({
    sql: `SELECT id, name FROM supplements WHERE nutrition_facts = '[]' LIMIT ?`,
    args: [batchSize],
  });

  console.log(`재처리 대상: ${r.rows.length}개`);

  let upgraded = 0;
  let stillEmpty = 0;
  let processed = 0;

  for (const row of r.rows) {
    const id = row.id as string;
    const name = row.name as string;

    const analysis = analyzeFromNameOnly(name);
    const hasFacts = analysis.nutrition_facts.length > 0;

    if (hasFacts) {
      const mixedSummary = createMixedSummary(analysis);
      await db.execute({
        sql: `UPDATE supplements SET nutrition_facts = ?, ai_summary = ? WHERE id = ?`,
        args: [JSON.stringify(analysis.nutrition_facts), mixedSummary, id],
      });
      upgraded++;
    } else {
      stillEmpty++;
    }

    processed++;
    if (processed % 500 === 0) {
      console.log(`  ${processed}개 처리 (업그레이드: ${upgraded}, 여전히 빈배열: ${stillEmpty})`);
    }
  }

  console.log(`\n완료: 총 ${processed}개`);
  console.log(`  성분 추출 성공(업그레이드): ${upgraded}개`);
  console.log(`  여전히 빈배열:             ${stillEmpty}개`);
}

run().catch(console.error);

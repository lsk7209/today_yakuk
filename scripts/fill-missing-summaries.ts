/**
 * nutrition_facts도 없고 ai_summary도 없는 제품에 제품명 기반 summary 생성
 * Claude Code 직접 작성 — 외부 AI API 없음
 */

import dotenv from "dotenv";
import { getTursoClient } from "../src/lib/turso";
import { generateSummaryTexts } from "./lib/nutrition-parser";

dotenv.config({ path: ".env.local" });

async function run() {
  const db = getTursoClient();
  const r = await db.execute(
    `SELECT id, name FROM supplements WHERE ai_summary IS NULL OR ai_summary = '' LIMIT 200`
  );
  console.log(`처리 대상: ${r.rows.length}개`);

  let updated = 0;
  for (const row of r.rows) {
    const id = row.id as string;
    const name = row.name as string;
    const { summary, effects, cautions } = generateSummaryTexts(name, "", []);
    const aiSummary = JSON.stringify({ summary, effects, cautions });
    await db.execute({
      sql: "UPDATE supplements SET ai_summary = ? WHERE id = ?",
      args: [aiSummary, id],
    });
    updated++;
    if (updated % 20 === 0) console.log(`  ${updated}개 처리됨...`);
  }
  console.log(`\n완료: ${updated}개 업데이트`);
}

run().catch(console.error);

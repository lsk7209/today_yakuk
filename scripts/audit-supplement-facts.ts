/**
 * 저장된 supplements.nutrition_facts 중 현재 검증 규칙을 통과하지 못하는 항목을 보고한다 (dry-run 전용).
 *
 * 사용법:
 *   npm run audit:supplement-facts -- --input=fixtures.json   # 로컬 JSON ([{id,name,nutrition_facts}])
 *   npm run audit:supplement-facts                            # DB를 SELECT만 수행 (쓰기 없음)
 *
 * 이 스크립트는 DB에 쓰지 않는다. 백필은 이 보고서를 검토·승인한 뒤 별도 단계로 진행한다.
 */
import fs from "node:fs";
import dotenv from "dotenv";
import { getRequiredTursoClient } from "../src/lib/turso";
import {
  auditStoredSupplementFacts,
  type StoredSupplementRow,
} from "./lib/supplement-fact-audit";

dotenv.config({ path: ".env.local" });

const PAGE_SIZE = 500;

async function loadRowsFromDb(): Promise<StoredSupplementRow[]> {
  const db = getRequiredTursoClient();
  const rows: StoredSupplementRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await db.execute({
      sql: "SELECT id, name, nutrition_facts FROM supplements ORDER BY id LIMIT ? OFFSET ?",
      args: [PAGE_SIZE, offset],
    });
    for (const row of page.rows) {
      rows.push({
        id: String(row.id),
        name: String(row.name ?? ""),
        nutrition_facts: row.nutrition_facts,
      });
    }
    if (page.rows.length < PAGE_SIZE) return rows;
  }
}

async function main() {
  const inputArg = process.argv.find((arg) => arg.startsWith("--input="));
  const rows: StoredSupplementRow[] = inputArg
    ? JSON.parse(fs.readFileSync(inputArg.slice("--input=".length), "utf8"))
    : await loadRowsFromDb();

  const audits = auditStoredSupplementFacts(rows);
  const byIssue = new Map<string, number>();
  for (const audit of audits) {
    for (const { issue } of audit.rejected) byIssue.set(issue, (byIssue.get(issue) ?? 0) + 1);
  }

  console.log(
    JSON.stringify(
      {
        mode: "dry-run (no writes)",
        scanned: rows.length,
        affectedProducts: audits.length,
        productsLosingAllFacts: audits.filter((audit) => audit.becomesEmpty).length,
        rejectedByIssue: Object.fromEntries(byIssue),
        samples: audits.slice(0, 20),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("audit-supplement-facts failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

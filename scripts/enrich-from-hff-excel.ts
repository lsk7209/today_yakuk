/**
 * Enrich supplements nutrition_facts from 건강기능식품DB Excel file
 *
 * Usage:
 *   npx tsx scripts/enrich-from-hff-excel.ts [limit]
 *
 * Excel: 20251230_건강기능식품DB_4380건.xlsx (식약처)
 * Matches by product name, updates nutrition_facts JSON in supplements table.
 */

import dotenv from "dotenv";
import path from "path";
import * as XLSX from "xlsx";
import { getTursoClient } from "../src/lib/turso";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const EXCEL_PATH =
  process.argv[3] ||
  "C:/Users/dlatj/Downloads/20251230_건강기능식품DB_4380건 (4).xlsx";

const LIMIT = parseInt(process.argv[2] || "500", 10);

// 업데이트하지 않을 메타 컬럼
const SKIP_COLS = new Set([
  "순번", "식품코드", "Unnamed: 2", "식품명",
  "데이터구분코드", "데이터구분명", "식품기원코드", "식품기원명",
  "식품대분류코드", "식품대분류명", "대표식품코드", "대표식품명",
  "식품중분류코드", "식품중분류명", "식품소분류코드", "식품소분류명",
  "식품세분류코드", "식품세분류명",
  "출처코드", "출처명", "1회(회)섭취 참고량", "식품중량", "분류체계",
  "데이터생성방법코드", "데이터생성방법명", "데이터생성일자", "데이터기준일자",
  "유형명", "영양성분제공단위량",
  // 거의 모든 영양제에 의미 없는 항목
  "에너지(kcal)", "수분(g)", "회분(g)",
]);

interface NutritionFact {
  name: string;
  amount: number;
  unit: string;
  percent_dv: number;
}

function parseColName(col: string): { name: string; unit: string } | null {
  const m = col.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (!m) return null;
  return { name: m[1].trim(), unit: m[2].trim() };
}

// 공백·숫자·단위·특수문자 제거한 핵심 키워드만 남김
function normalizeStrict(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")          // 괄호 내용 제거
    .replace(/[0-9]+\s*(mg|μg|iu|g|ml|정|캡슐|포|개입|개|회|병)?\b/gi, " ")  // 숫자+단위 제거
    .replace(/[^가-힣a-z]/g, "")          // 특수문자·공백 제거
    .trim();
}

// 단순 공백 정규화 (느슨한 매칭용)
function normalizeSoft(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, "")
    .replace(/[^가-힣a-z0-9]/g, "")
    .trim();
}

// 엑셀 로드 및 인덱스 구성
function loadExcel(filePath: string): {
  strictIndex: Map<string, NutritionFact[]>;
  softIndex: Map<string, NutritionFact[]>;
} {
  console.log(`📂 Loading Excel: ${filePath}`);
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);
  console.log(`  Loaded ${rows.length} rows`);

  const strictIndex = new Map<string, NutritionFact[]>();
  const softIndex = new Map<string, NutritionFact[]>();

  for (const row of rows) {
    const rawName = (row["식품명"] as string) || "";
    if (!rawName) continue;

    const facts: NutritionFact[] = [];
    for (const [col, val] of Object.entries(row)) {
      if (SKIP_COLS.has(col)) continue;
      if (val === null || val === undefined || val === "" || val === 0) continue;
      const parsed = parseColName(col);
      if (!parsed) continue;
      const amount = typeof val === "number" ? val : parseFloat(String(val));
      if (isNaN(amount) || amount <= 0) continue;
      facts.push({ name: parsed.name, amount, unit: parsed.unit, percent_dv: 0 });
    }
    if (facts.length === 0) continue;

    const setBest = (map: Map<string, NutritionFact[]>, key: string) => {
      if (!key) return;
      const existing = map.get(key);
      if (!existing || facts.length > existing.length) map.set(key, facts);
    };

    setBest(strictIndex, normalizeStrict(rawName));
    setBest(softIndex, normalizeSoft(rawName));
    // 괄호 앞 이름도 등록
    const baseName = rawName.split("(")[0].trim();
    setBest(strictIndex, normalizeStrict(baseName));
    setBest(softIndex, normalizeSoft(baseName));
  }

  console.log(`  Strict index: ${strictIndex.size} | Soft index: ${softIndex.size}\n`);
  return { strictIndex, softIndex };
}

async function main() {
  const db = getTursoClient();

  // 엑셀 로드
  const { strictIndex, softIndex } = loadExcel(EXCEL_PATH);

  // nutrition_facts가 없는 supplements 조회
  const result = await db.execute(`
    SELECT id, name FROM supplements
    WHERE (nutrition_facts IS NULL OR nutrition_facts = '[]' OR nutrition_facts = 'null' OR nutrition_facts = '')
    LIMIT ${LIMIT}
  `);

  console.log(`📦 ${result.rows.length} supplements to enrich (limit: ${LIMIT})\n`);

  let matched = 0;
  let unmatched = 0;

  for (const row of result.rows) {
    const id = row.id as string;
    const name = row.name as string;

    // 1. strict 매칭
    let facts =
      strictIndex.get(normalizeStrict(name)) ||
      strictIndex.get(normalizeStrict(name.split("(")[0].trim()));

    // 2. soft 매칭
    if (!facts) {
      facts =
        softIndex.get(normalizeSoft(name)) ||
        softIndex.get(normalizeSoft(name.split("(")[0].trim()));
    }

    // 3. 부분 포함 매칭 (strict key 기준)
    if (!facts) {
      const dbKey = normalizeStrict(name);
      if (dbKey.length >= 4) {
        for (const [excelKey, excelFacts] of strictIndex) {
          if (excelKey.length >= 4 && (excelKey.includes(dbKey) || dbKey.includes(excelKey))) {
            facts = excelFacts;
            break;
          }
        }
      }
    }

    if (!facts || facts.length === 0) {
      unmatched++;
      continue;
    }

    await db.execute({
      sql: `UPDATE supplements SET nutrition_facts = ? WHERE id = ?`,
      args: [JSON.stringify(facts), id],
    });

    matched++;
    if (matched % 50 === 0) {
      console.log(`  ✅ ${matched} updated so far...`);
    }
  }

  console.log(`\n✅ Done`);
  console.log(`  Matched & updated: ${matched}`);
  console.log(`  No match:          ${unmatched}`);
  console.log(`  Match rate:        ${((matched / result.rows.length) * 100).toFixed(1)}%`);
}

main().catch(console.error);

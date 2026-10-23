import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { parseNutritionFacts, analyzeProduct } from "../../scripts/lib/nutrition-parser";
import { getNutritionFactIssue, classifyStandardText } from "@/lib/nutrition-validation";
import { getVerifiedNutritionFacts } from "@/lib/wiki-nutrition";
import { SUPPLEMENT_INDEXABLE_WHERE, isIndexableSupplement } from "@/lib/wiki-indexability";

let failed = 0;
async function run(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failed++;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

const SRC = "foodsafetykorea:C003";
const fact = (name: string, amount: number, unit: string) => ({
  name, amount, unit, percent_dv: null, source: SRC,
});

// 검토 당시 관찰된 네 사례의 오분류 결과 (기준규격 텍스트에서 추출됐던 값)
const OBSERVED_BAD_FACTS = [
  fact("카드뮴", 1, "mg"),
  fact("수은", 0.5, "mg"),
  fact("of", 48, "g"),
  fact("표시량", 20, "mg"),
  fact("단B1은", 10, "μg"),
];

// 기준규격(STDR_STND)에 흔한 문구
const STANDARD_SPEC_TEXT = [
  "1. 성상: 고유의 색택과 향미",
  "2. 카드뮴(mg/kg): 1.0 이하",
  "3. 수은(mg/kg): 0.5 이하",
  "4. 납(mg/kg): 0.5 이하",
  "5. 대장균군: 음성",
  "6. 비타민B1: 표시량(10 μg)의 80~120%",
  "7. 총 내용량 48 g of 표시량",
].join("\n");

async function main() {
  await run("기준규격 텍스트에서 성분 함량을 추출하지 않는다", () => {
    assert.deepEqual(parseNutritionFacts(STANDARD_SPEC_TEXT), []);
    assert.deepEqual(parseNutritionFacts("카드뮴 1.0 mg/kg 이하, 수은 0.5 mg/kg 이하"), []);
    assert.deepEqual(parseNutritionFacts("비타민B1 표시량(10 μg)의 80~120%"), []);
  });

  await run("오분류됐던 성분명은 검증에서 거부된다", () => {
    for (const bad of OBSERVED_BAD_FACTS) {
      assert.notEqual(getNutritionFactIssue(bad), null, bad.name);
    }
    assert.deepEqual(getVerifiedNutritionFacts(OBSERVED_BAD_FACTS), []);
  });

  await run("정상 성분과 함량은 유지되고 변환 추적 정보가 붙는다", () => {
    const facts = parseNutritionFacts("비타민C 100mg(1일 섭취량의 100%), 아연 8.5mg(100%), 알로에 50 mg, 비타민 D 10μg");
    assert.deepEqual(facts.map((f) => [f.name, f.amount, f.unit, f.percent_dv]), [
      ["비타민C", 100, "mg", 100],
      ["아연", 8.5, "mg", 100],
      ["알로에", 50, "mg", null],
      ["비타민D", 10, "μg", null],
    ]);
    assert.equal(facts[0].parser_version, "nutrition-parser/2");
    assert.equal(facts[0].raw_text, "비타민C 100mg(1일 섭취량의 100%)");
    assert.equal(facts[0].validation, "verified");
    assert.equal(getVerifiedNutritionFacts(facts).length, 4);
  });

  await run("분모 단위·범위·비교 조건은 단일 함량으로 바뀌지 않는다", () => {
    assert.deepEqual(parseNutritionFacts("비타민C 100mg/kg"), []);
    assert.deepEqual(parseNutritionFacts("비타민C 100mg 이하"), []);
    assert.deepEqual(parseNutritionFacts("비타민C 80~120mg"), []);
    assert.deepEqual(parseNutritionFacts("비타민C 100mg(표시량의 80~120%)"), []);
  });

  await run("누락·모호한 입력은 빈 결과이며 제품명으로 보충하지 않는다", () => {
    assert.deepEqual(parseNutritionFacts(""), []);
    assert.deepEqual(parseNutritionFacts("-"), []);
    assert.deepEqual(analyzeProduct("패밀리 오메가3 츄어블 EPA DHA 1000mg", "정제어유", "").nutrition_facts, []);
  });

  await run("0 또는 음수 함량·허용되지 않은 단위는 거부된다", () => {
    assert.equal(getNutritionFactIssue(fact("비타민C", 0, "mg")), "invalid-amount");
    assert.equal(getNutritionFactIssue(fact("비타민C", 10, "mg/kg")), "unsupported-unit");
    assert.equal(getNutritionFactIssue(fact("비타민C", 10, "%")), "unsupported-unit");
  });

  await run("활성 당량·CFU 단위의 실제 함량은 허용하고 0 함량은 계속 거부한다", () => {
    assert.equal(getNutritionFactIssue(fact("비타민A", 700, "μg RAE")), null);
    assert.equal(getNutritionFactIssue(fact("비타민 E", 6, "mg α-TE")), null);
    assert.equal(getNutritionFactIssue(fact("엽산", 680, "μg DFE")), null);
    assert.equal(getNutritionFactIssue(fact("유산균(프로바이오틱스)", 100, "억 CFU")), null);
    assert.equal(getNutritionFactIssue(fact("유산균(프로바이오틱스)", 0, "억 CFU")), "invalid-amount");
  });

  await run("기준규격 문구를 성격별로 분류한다", () => {
    assert.equal(classifyStandardText("카드뮴(mg/kg): 1.0 이하"), "heavy-metal");
    assert.equal(classifyStandardText("대장균군: 음성"), "microbe");
    assert.equal(classifyStandardText("비타민B1: 표시량의 80~120%"), "label-ratio");
    assert.equal(classifyStandardText("고유의 색택과 향미"), "other");
  });

  await run("사이트맵 SQL 조건도 오분류된 성분만 가진 제품을 제외한다", async () => {
    const db = createClient({ url: ":memory:" });
    await db.execute("CREATE TABLE supplements (id TEXT, name TEXT, nutrition_facts TEXT, tags TEXT)");
    const rows: Array<[string, unknown[]]> = [
      ["bad", OBSERVED_BAD_FACTS],
      ["good", [fact("비타민C", 100, "mg")]],
      ["tags-only", []],
    ];
    for (const [id, facts] of rows) {
      await db.execute({
        sql: "INSERT INTO supplements VALUES (?, ?, ?, '[\"omega3\"]')",
        args: [id, `제품 ${id}`, JSON.stringify(facts)],
      });
    }
    const result = await db.execute(`SELECT id FROM supplements ${SUPPLEMENT_INDEXABLE_WHERE}`);
    // 태그가 있어도 성분이 전부 검증 실패한 제품은 제외, 성분이 아예 없는 태그 제품은 기존대로 유지
    assert.deepEqual(result.rows.map((r) => r.id).sort(), ["good", "tags-only"]);
    assert.equal(isIndexableSupplement({ name: "제품", nutrition_facts: OBSERVED_BAD_FACTS, tags: ["omega3"] }), false);
    assert.equal(isIndexableSupplement({ name: "제품", nutrition_facts: [], tags: ["omega3"] }), true);
  });

  if (failed > 0) {
    process.exitCode = 1;
    throw new Error(`${failed} test(s) failed`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

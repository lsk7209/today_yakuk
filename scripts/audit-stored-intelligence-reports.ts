import { getRequiredTursoClient } from "../src/lib/turso";
import { parseStoredIntelligenceReport } from "../src/lib/pharmacy-intelligence";

// 읽기 전용(dry-run) 점검: pharmacies.intelligence_report의 버전·유효성 분포와
// v1 리포트에 남아 있을 수 있는 기본 수치·휴무 추론 문구를 센다. 아무 것도 쓰지 않는다.
const SUSPECT_PATTERNS: Array<[string, RegExp]> = [
  ["기본 지역평균 9.5시간", /"regionalAvgWeekdayHours"\s*:\s*9\.5/],
  ["기본 하루 9시간 문구", /하루 평균 9시간/],
  ["미등록 주말을 정기휴무로 단정", /토·일요일 및 법정 공휴일 정기 휴무/],
  ["연중 운영 단정", /연중 운영 체계/],
  ["고정 가산율 문구", /기본 조제료의 30%/],
];
const SAMPLE_LIMIT = 10;

async function main() {
  const db = getRequiredTursoClient();
  const result = await db.execute(
    "SELECT hpid, intelligence_report FROM pharmacies WHERE intelligence_report IS NOT NULL",
  );

  const counts = { total: 0, validV2: 0, legacyOrInvalid: 0, unparsable: 0 };
  const suspects = new Map<string, { count: number; sample: string[] }>();

  for (const row of result.rows) {
    counts.total += 1;
    const raw = String(row.intelligence_report);
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      counts.unparsable += 1;
    }
    if (parseStoredIntelligenceReport(parsed)) counts.validV2 += 1;
    else counts.legacyOrInvalid += 1;

    for (const [label, pattern] of SUSPECT_PATTERNS) {
      if (!pattern.test(raw)) continue;
      const entry = suspects.get(label) ?? { count: 0, sample: [] };
      entry.count += 1;
      if (entry.sample.length < SAMPLE_LIMIT) entry.sample.push(String(row.hpid));
      suspects.set(label, entry);
    }
  }

  console.log(JSON.stringify({ counts, suspects: Object.fromEntries(suspects) }, null, 2));
  console.log("읽기 전용 점검입니다. DB 쓰기는 수행하지 않았습니다.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

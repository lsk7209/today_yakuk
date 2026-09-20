import fs from "node:fs";
import path from "node:path";
import { ApiContentCandidate, planApiContentWork, sortApiContentWork } from "../src/lib/api-content-work-plan";
import { parseCsvLine } from "../src/lib/api-data-delta";

const root = process.cwd();
const inputPath = path.join(root, "docs/site-quality/API_CONTENT_CANDIDATES.csv");
const csvOutputPath = path.join(root, "docs/site-quality/API_CONTENT_WORK_PLAN.csv");
const markdownOutputPath = path.join(root, "docs/site-quality/API_CONTENT_WORK_PLAN.md");
const quoteCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;

function readCandidates(): ApiContentCandidate[] {
  const lines = fs.readFileSync(inputPath, "utf8").trimEnd().split(/\r?\n/);
  const header = parseCsvLine(lines.shift() ?? "");
  const column = (name: string) => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`Candidate column missing: ${name}`);
    return index;
  };
  const indexes = {
    kind: column("kind"), routeType: column("route_type"), entityId: column("entity_id"),
    title: column("title"), missingFields: column("missing_fields"), reviewRequirement: column("review_requirement"),
  };

  return lines.filter(Boolean).map(parseCsvLine).map((row) => ({
    kind: row[indexes.kind] as ApiContentCandidate["kind"],
    routeType: row[indexes.routeType] as ApiContentCandidate["routeType"],
    entityId: row[indexes.entityId], title: row[indexes.title], missingFields: row[indexes.missingFields],
    reviewRequirement: row[indexes.reviewRequirement],
  }));
}

const items = sortApiContentWork(readCandidates().map(planApiContentWork));
const count = (predicate: (item: typeof items[number]) => boolean) => items.filter(predicate).length;
const ready = count((item) => item.readiness === "ready_for_review");
const held = count((item) => item.readiness === "source_fields_required");
const p1 = items.filter((item) => item.priority === "P1");
const generatedAt = new Date().toISOString();

fs.writeFileSync(csvOutputPath, [
  ["priority", "readiness", "work_type", "kind", "route_type", "entity_id", "title", "missing_fields", "review_requirement"].map(quoteCsv).join(","),
  ...items.map((item) => [item.priority, item.readiness, item.workType, item.kind, item.routeType, item.entityId, item.title, item.missingFields, item.reviewRequirement].map(quoteCsv).join(",")),
].join("\n") + "\n", "utf8");

const firstSlice = p1.length
  ? p1.map((item) => `- \`${item.entityId}\` ${item.title}`).join("\n")
  : "- 없음";

fs.writeFileSync(markdownOutputPath, `# API 데이터 기반 로컬 콘텐츠 작업 계획

- 생성 시각: ${generatedAt}
- 입력: \`API_CONTENT_CANDIDATES.csv\`
- 전체 후보: ${items.length}건
- 검토 착수 가능: ${ready}건
- 원천 필드 보강 필요: ${held}건
- P1 신규 약국 상세 검토: ${p1.length}건

## 분류 기준

- \`ready_for_review\`은 감사 대상 필드가 채워졌다는 뜻이며, 사실성·의료적 정확성·발행 승인을 뜻하지 않는다.
- \`source_fields_required\`는 누락된 원천 필드를 먼저 보강해야 하므로 자동 생성과 발행 대상에서 제외한다.
- 약국은 운영 정보 검수, 의약품·건강기능식품은 자료 유형과 의료 출처 검수를 거쳐야 한다.

## 첫 로컬 검토 묶음

${firstSlice}

## 실행 제한

- 이 계획은 운영 DB를 쓰거나 콘텐츠 큐를 변경하지 않는다.
- 외부 LLM 생성, 자동 발행, 배포, 좌표 조회를 실행하지 않았다.
- 세부 작업 순서와 전체 후보는 \`API_CONTENT_WORK_PLAN.csv\`에 있다.
`, "utf8");

console.log(JSON.stringify({ generatedAt, total: items.length, readyForReview: ready, sourceFieldsRequired: held, p1NewPharmacies: p1.length }, null, 2));

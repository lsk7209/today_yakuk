import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import { BaselineRecord, CurrentRecord, classifyDelta, parseCsvLine } from "../src/lib/api-data-delta";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) throw new Error("Read-only delta audit requires Turso environment variables.");

const root = process.cwd();
const inventoryPath = path.join(root, "docs/site-quality/URL_INVENTORY.csv");
const outputPath = path.join(root, "docs/site-quality/API_DATA_DELTA.md");
const candidatePath = path.join(root, "docs/site-quality/API_CONTENT_CANDIDATES.csv");
const db = createClient({ url, authToken });
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const text = (value: unknown) => String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const csv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;

function readBaseline(): BaselineRecord[] {
  const lines = fs.readFileSync(inventoryPath, "utf8").trimEnd().split(/\r?\n/);
  const header = parseCsvLine(lines.shift() ?? "");
  const index = (name: string) => {
    const found = header.indexOf(name);
    if (found < 0) throw new Error(`Inventory column missing: ${name}`);
    return found;
  };
  const entityId = index("entity_id");
  const routeType = index("route_type");
  const contentHash = index("content_hash");
  return lines.map(parseCsvLine)
    .filter((row) => ["pharmacy_detail", "wiki_supplement", "wiki_medicine"].includes(row[routeType]))
    .map((row) => ({ entityId: row[entityId], routeType: row[routeType], contentHash: row[contentHash] }));
}

const jsonCount = (value: unknown) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.length : parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
  } catch { return 0; }
};

async function currentRecords(): Promise<CurrentRecord[]> {
  const [pharmacies, supplements, medicines] = await Promise.all([
    db.execute("SELECT hpid,name,address,tel,operating_hours FROM pharmacies ORDER BY hpid"),
    db.execute("SELECT id,product_report_no,name,manufacturer,nutrition_facts,ai_summary FROM supplements ORDER BY id"),
    db.execute("SELECT id,name,manufacturer,efficacy,use_method,warning_general,warning_usage,interactions,side_effects,storage_method FROM medicines ORDER BY id"),
  ]);
  return [
    ...pharmacies.rows.map((row) => ({
      routeType: "pharmacy_detail", entityId: String(row.hpid), title: String(row.name ?? ""),
      contentHash: hash(text(`${row.name}|${row.address}|${row.tel}|${row.operating_hours}`)),
      missingFields: [!row.address && "address", !row.tel && "tel", !jsonCount(row.operating_hours) && "hours"].filter(Boolean).join("|"),
    })),
    ...supplements.rows.map((row) => ({
      routeType: "wiki_supplement", entityId: String(row.id), title: String(row.name ?? ""),
      contentHash: hash(text(`${row.product_report_no}|${row.name}|${row.manufacturer}|${row.nutrition_facts}|${row.ai_summary}`)),
      missingFields: [!row.manufacturer && "manufacturer", !jsonCount(row.nutrition_facts) && "nutrition", !row.ai_summary && "summary"].filter(Boolean).join("|"),
    })),
    ...medicines.rows.map((row) => ({
      routeType: "wiki_medicine", entityId: String(row.id), title: String(row.name ?? ""),
      contentHash: hash(text([row.efficacy,row.use_method,row.warning_general,row.warning_usage,row.interactions,row.side_effects,row.storage_method].join(" "))),
      missingFields: [!row.manufacturer && "manufacturer", !row.efficacy && "efficacy", !row.warning_general && "warning"].filter(Boolean).join("|"),
    })),
  ];
}

async function main() {
  const baseline = readBaseline();
  const current = await currentRecords();
  const deltas = classifyDelta(baseline, current);
  const counts = (kind: string) => deltas.filter((record) => record.kind === kind).length;
  const candidates = deltas.filter((record) => record.kind !== "missing");
  const generatedAt = new Date().toISOString();

  fs.writeFileSync(candidatePath, [
    ["kind", "route_type", "entity_id", "title", "missing_fields", "recommended_action", "review_requirement"].map(csv).join(","),
    ...candidates.map((record) => [record.kind, record.routeType, record.entityId, record.title, record.missingFields,
      record.missingFields ? "hold_or_fill_source_fields" : "manual_value_review",
      record.routeType === "pharmacy_detail" ? "operational_data_review" : "medical_source_and_type_review"].map(csv).join(",")),
  ].join("\n") + "\n", "utf8");

  fs.writeFileSync(outputPath, `# 신규 API 데이터 델타 감사\n\n- 생성 시각: ${generatedAt}\n- 기준: 기존 \`URL_INVENTORY.csv\`의 공공데이터 엔터티와 현재 운영 DB의 읽기 전용 조회 비교\n- 결과: 기준 ${baseline.length.toLocaleString()}건, 현재 ${current.length.toLocaleString()}건, 신규 ${counts("new")}건, 내용 변경 ${counts("changed")}건, 기준 대비 누락 ${counts("missing")}건\n- 콘텐츠 후보: ${candidates.length}건 (\`API_CONTENT_CANDIDATES.csv\`)\n\n## 판정\n\n${deltas.length === 0 ? "현재 기준 인벤토리 이후 신규 ID나 감사 대상 필드의 내용 변화가 확인되지 않았다. 따라서 새 데이터 기반 글 생성은 실행하지 않는다." : "델타는 자동 발행하지 않는다. 누락 필드와 의료 자료 유형을 사람 검수한 뒤 기존 URL 보완 또는 신규 후보로 분류한다."}\n\n## 해석 제한\n\n- 약국 \`updated_at\`은 동기화 실행 시각이며 전화 확인일이나 원천기관 갱신일이 아니다.\n- \`public_data_sync_runs\`의 최신 실행 기록은 작업 실행 증거일 뿐, 실제 레코드 변화의 증거가 아니다.\n- 이 감사는 좌표를 조회하거나 출력하지 않으며 운영 DB를 변경하지 않는다.\n- 건기식·의약품 변화는 의료적 정확성이나 전문 검수를 의미하지 않는다.\n`, "utf8");

  console.log(JSON.stringify({ generatedAt, baseline: baseline.length, current: current.length, new: counts("new"), changed: counts("changed"), missing: counts("missing"), candidates: candidates.length }, null, 2));
}

main().finally(() => db.close()).catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });

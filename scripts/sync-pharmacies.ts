import "dotenv/config";
import { assertExpectedRowsAffected, getRequiredTursoClient } from "../src/lib/turso";
import { PROVINCE_MAP } from "../src/lib/data/pharmacies";
import { XMLParser } from "fast-xml-parser";

const API_URL =
  "https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyFullDown";
const ROWS_PER_PAGE = 1000;
const UPSERT_BATCH_SIZE = 200;

type OperatingHours = Record<
  string,
  { open: string | null; close: string | null }
>;

type PharmacyRecord = {
  hpid: string;
  name: string;
  address?: string;
  tel?: string;
  latitude: number | null;
  longitude: number | null;
  operating_hours: OperatingHours | null;
  description_raw?: string;
  province?: string | null;
  city?: string | null;
  updated_at: string;
};

type ApiResponse = {
  totalCount: number;
  items: Record<string, string | number | undefined>[];
};

const apiKey = process.env.PUBLIC_DATA_API_KEY;

function ensureEnv() {
  if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL이 필요합니다.");
  if (!process.env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN이 필요합니다.");
  if (!apiKey) throw new Error("PUBLIC_DATA_API_KEY가 필요합니다.");
}

function normalizeArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseNumber(value: string | number | undefined): number | null {
  // XMLParser (parseTagValue: true) can hand back either a string or an
  // already-coerced number for the same field across rows. An empty/blank
  // string means "no coordinate provided" and must not collapse to 0.
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function normalizeTimeField(value: string | number | undefined): string | undefined {
  // Time fields are declared as strings, but parseTagValue:true can emit a
  // JS number for purely numeric tag text (e.g. "0000" -> 0, "0030" -> 30).
  // Re-pad to the HHmm string shape expected by hhmmToMinutes/formatHHMM.
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) return undefined;
    return String(value).padStart(4, "0");
  }
  return value;
}

export function buildOperatingHours(
  item: Record<string, string | number | undefined>,
): OperatingHours | null {
  const dayKeyMap: Record<number, string> = {
    1: "mon", 2: "tue", 3: "wed", 4: "thu",
    5: "fri", 6: "sat", 7: "sun", 8: "holiday",
  };

  const result: OperatingHours = {};
  Object.entries(dayKeyMap).forEach(([numStr, key]) => {
    const num = Number(numStr);
    const open = normalizeTimeField(item[`dutyTime${num}s`]);
    const close = normalizeTimeField(item[`dutyTime${num}c`]);
    // Use presence (not truthiness) so a literal 0/"0000" open or close time
    // is not dropped by a falsy check.
    if (open !== undefined || close !== undefined) {
      result[key] = { open: open ?? null, close: close ?? null };
    }
  });

  return Object.keys(result).length > 0 ? result : null;
}

export function extractRegion(address?: string): { province?: string | null; city?: string | null } {
  if (!address) return { province: null, city: null };
  const tokens = address.trim().split(/\s+/);
  const provinceRaw = tokens[0] ?? null;
  const cityRaw = tokens[1] ?? null;
  // Store the same canonical province value that the read path (PROVINCE_MAP /
  // normalizeProvince in src/lib/data/pharmacies.ts) expects for `WHERE province = ?`.
  // Without this, aliases like "전북특별자치도" or "강원특별자치도" from the source
  // address are stored verbatim and never match a "/전북/전체" or "/강원/전체" query.
  const province = provinceRaw ? PROVINCE_MAP[provinceRaw] ?? provinceRaw : null;
  return { province, city: cityRaw ?? null };
}

function toStringField(value: string | number | undefined): string | undefined {
  // hpid/tel/address text can be purely numeric (e.g. a phone number), and
  // parseTagValue:true would otherwise hand back a number that drops
  // significant leading zeros when later coerced to a string.
  if (value === undefined || value === null) return undefined;
  return String(value);
}

function mapToRecord(item: Record<string, string | number | undefined>): PharmacyRecord {
  const region = extractRegion(toStringField(item.dutyAddr));
  return {
    hpid: toStringField(item.hpid) ?? "",
    name: toStringField(item.dutyName) ?? "",
    address: toStringField(item.dutyAddr),
    tel: toStringField(item.dutyTel1),
    latitude: parseNumber(item.wgs84Lat),
    longitude: parseNumber(item.wgs84Lon),
    operating_hours: buildOperatingHours(item),
    description_raw: toStringField(item.dutyInf),
    province: region.province,
    city: region.city,
    updated_at: new Date().toISOString(),
  };
}

async function fetchPage(pageNo: number): Promise<ApiResponse> {
  const url = `${API_URL}?serviceKey=${encodeURIComponent(
    apiKey ?? "",
  )}&pageNo=${pageNo}&numOfRows=${ROWS_PER_PAGE}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);

  const text = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseTagValue: true,
    trimValues: true,
  });
  const parsed = parser.parse(text);
  return parsePharmacyApiResponse(parsed);
}

export function parsePharmacyApiResponse(parsed: unknown): ApiResponse {
  const response = (parsed as { response?: Record<string, unknown> } | null)?.response;
  if (!response || typeof response !== "object") {
    throw new Error("Pharmacy API returned a malformed response envelope");
  }

  const header = response.header as Record<string, unknown> | undefined;
  const resultCode = String(header?.resultCode ?? "").trim();
  const successCodes = new Set(["00", "0", "NORMAL_SERVICE"]);
  if (!header || !successCodes.has(resultCode)) {
    const message = String(header?.resultMsg ?? header?.resultMessage ?? "unknown API error");
    throw new Error(`Pharmacy API error (${resultCode || "missing resultCode"}): ${message}`);
  }

  const body = response.body as Record<string, unknown> | undefined;
  if (!body || body.totalCount === undefined || body.items === undefined) {
    throw new Error("Pharmacy API response is missing body, totalCount, or items");
  }
  const totalCount = Number(body.totalCount);
  if (!Number.isInteger(totalCount) || totalCount < 0) {
    throw new Error(`Pharmacy API returned invalid totalCount: ${String(body.totalCount)}`);
  }
  const itemsNode = body.items as { item?: Record<string, string | number | undefined> | Record<string, string | number | undefined>[] };
  const items = normalizeArray<Record<string, string | number | undefined>>(itemsNode.item);

  if (items.length > totalCount) {
    throw new Error(`Pharmacy API page contains ${items.length} items but totalCount is ${totalCount}`);
  }

  return { totalCount, items };
}

async function upsertBatch(records: PharmacyRecord[]) {
  if (!records.length) return;
  const db = getRequiredTursoClient();

  const statements = records.map((r) => ({
    sql: `INSERT INTO pharmacies (hpid, name, address, tel, latitude, longitude, operating_hours, description_raw, province, city, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(hpid) DO UPDATE SET
            name=excluded.name, address=excluded.address, tel=excluded.tel,
            latitude=excluded.latitude, longitude=excluded.longitude,
            operating_hours=excluded.operating_hours, description_raw=excluded.description_raw,
            province=excluded.province, city=excluded.city, updated_at=excluded.updated_at`,
    args: [
      r.hpid, r.name, r.address ?? null, r.tel ?? null,
      r.latitude, r.longitude,
      r.operating_hours ? JSON.stringify(r.operating_hours) : null,
      r.description_raw ?? null, r.province ?? null, r.city ?? null, r.updated_at,
    ],
  }));

  const results = await db.batch(statements, "write");
  assertExpectedRowsAffected(results, statements.length, "sync-pharmacies batch");
}

async function main() {
  ensureEnv();

  const allItems: Record<string, string | number | undefined>[] = [];
  console.info("첫 페이지 수집 중...");
  const first = await fetchPage(1);
  allItems.push(...first.items);

  const totalPages = Math.ceil(first.totalCount / ROWS_PER_PAGE) || 1;
  console.info(`총 ${first.totalCount}건, 페이지 ${totalPages}개 예상`);

  for (let page = 2; page <= totalPages; page++) {
    const pageData = await fetchPage(page);
    allItems.push(...pageData.items);
    console.info(`페이지 ${page}/${totalPages} 수집 완료 (누적 ${allItems.length}건)`);
  }

  if (allItems.length !== first.totalCount) {
    throw new Error(`Pharmacy API collection incomplete: expected ${first.totalCount}, received ${allItems.length}`);
  }

  const records = allItems
    .filter((item) => item.hpid && item.dutyName)
    .map(mapToRecord);
  if (records.length !== first.totalCount) {
    throw new Error(`Pharmacy API returned ${first.totalCount - records.length} records without required identifiers`);
  }

  console.info(`총 ${records.length}건 Upsert 진행...`);
  for (let i = 0; i < records.length; i += UPSERT_BATCH_SIZE) {
    const batch = records.slice(i, i + UPSERT_BATCH_SIZE);
    await upsertBatch(batch);
    console.info(`배치 ${i + 1}-${Math.min(i + UPSERT_BATCH_SIZE, records.length)} 완료`);
  }

  console.info("완료되었습니다.");
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

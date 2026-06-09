import "dotenv/config";
import { getTursoClient } from "../src/lib/turso";
import { XMLParser } from "fast-xml-parser";

const API_URL =
  "http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyFullDown";
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
  items: Record<string, string | undefined>[];
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

function parseNumber(value: string | number | undefined): number | null {
  if (value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function buildOperatingHours(
  item: Record<string, string | undefined>,
): OperatingHours | null {
  const dayKeyMap: Record<number, string> = {
    1: "mon", 2: "tue", 3: "wed", 4: "thu",
    5: "fri", 6: "sat", 7: "sun", 8: "holiday",
  };

  const result: OperatingHours = {};
  Object.entries(dayKeyMap).forEach(([numStr, key]) => {
    const num = Number(numStr);
    const open = item[`dutyTime${num}s`];
    const close = item[`dutyTime${num}c`];
    if (open || close) {
      result[key] = { open: open ?? null, close: close ?? null };
    }
  });

  return Object.keys(result).length > 0 ? result : null;
}

function extractRegion(address?: string): { province?: string | null; city?: string | null } {
  if (!address) return { province: null, city: null };
  const tokens = address.trim().split(/\s+/);
  const provinceRaw = tokens[0] ?? null;
  const cityRaw = tokens[1] ?? null;
  const province =
    provinceRaw === "경기도" ? "경기" : provinceRaw === "경기" ? "경기" : provinceRaw ?? null;
  return { province, city: cityRaw ?? null };
}

function mapToRecord(item: Record<string, string | undefined>): PharmacyRecord {
  const region = extractRegion(item.dutyAddr);
  return {
    hpid: item.hpid ?? "",
    name: item.dutyName ?? "",
    address: item.dutyAddr,
    tel: item.dutyTel1,
    latitude: parseNumber(item.wgs84Lat),
    longitude: parseNumber(item.wgs84Lon),
    operating_hours: buildOperatingHours(item),
    description_raw: item.dutyInf,
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
  const body = parsed?.response?.body;
  const totalCount = Number(body?.totalCount ?? 0);
  const items = normalizeArray<Record<string, string | undefined>>(body?.items?.item);

  return { totalCount, items };
}

async function upsertBatch(records: PharmacyRecord[]) {
  if (!records.length) return;
  const db = getTursoClient();

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

  await db.batch(statements, "write");
}

async function main() {
  ensureEnv();

  const allItems: Record<string, string | undefined>[] = [];
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

  const records = allItems
    .filter((item) => item.hpid && item.dutyName)
    .map(mapToRecord);

  console.info(`총 ${records.length}건 Upsert 진행...`);
  for (let i = 0; i < records.length; i += UPSERT_BATCH_SIZE) {
    const batch = records.slice(i, i + UPSERT_BATCH_SIZE);
    await upsertBatch(batch);
    console.info(`배치 ${i + 1}-${Math.min(i + UPSERT_BATCH_SIZE, records.length)} 완료`);
  }

  console.info("완료되었습니다.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

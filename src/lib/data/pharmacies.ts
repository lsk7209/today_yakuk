import "server-only";

import { getTursoClient, parseJson } from "@/lib/turso";
import { cacheDbRead } from "@/lib/db-read-cache";
import { Pharmacy } from "@/types/pharmacy";
import { distanceKm } from "@/lib/geo-distance";
import { PHARMACY_INDEXABLE_WHERE } from "@/lib/pharmacy-indexability";
import {
  MEDICINE_INDEXABLE_WHERE,
  SUPPLEMENT_INDEXABLE_WHERE,
} from "@/lib/wiki-indexability";

export const PROVINCE_MAP: Record<string, string> = {
  서울: "서울특별시",
  서울특별시: "서울특별시",
  부산: "부산광역시",
  부산광역시: "부산광역시",
  대구: "대구광역시",
  대구광역시: "대구광역시",
  인천: "인천광역시",
  인천광역시: "인천광역시",
  광주: "광주광역시",
  광주광역시: "광주광역시",
  대전: "대전광역시",
  대전광역시: "대전광역시",
  울산: "울산광역시",
  울산광역시: "울산광역시",
  세종: "세종특별자치시",
  세종특별자치시: "세종특별자치시",
  경기: "경기",
  경기도: "경기",
  강원: "강원특별자치도",
  강원특별자치도: "강원특별자치도",
  충남: "충청남도",
  충청남도: "충청남도",
  충북: "충청북도",
  충청북도: "충청북도",
  전남: "전라남도",
  전라남도: "전라남도",
  전북: "전라북도",
  전라북도: "전라북도",
  경남: "경상남도",
  경상남도: "경상남도",
  경북: "경상북도",
  경상북도: "경상북도",
  제주: "제주특별자치도",
  제주특별자치도: "제주특별자치도",
};

const PROVINCE_SLUG_BY_NORMALIZED: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기: "경기",
  강원특별자치도: "강원",
  충청남도: "충남",
  충청북도: "충북",
  전라남도: "전남",
  전라북도: "전북",
  경상남도: "경남",
  경상북도: "경북",
  제주특별자치도: "제주",
};

function normalizeProvince(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return PROVINCE_MAP[trimmed] ?? trimmed;
}

export function getCanonicalProvinceSlug(input: string): string {
  const normalized = normalizeProvince(input);
  return normalized ? PROVINCE_SLUG_BY_NORMALIZED[normalized] ?? input.trim() : input.trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPharmacy(row: any): Pharmacy {
  return {
    id: row.id as string,
    hpid: row.hpid as string,
    name: row.name as string,
    address: row.address as string,
    tel: row.tel as string | undefined,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    operating_hours: parseJson(row.operating_hours, null),
    description_raw: row.description_raw as string | null,
    gemini_summary: row.gemini_summary as string | null,
    province: row.province as string | null,
    city: row.city as string | null,
    updated_at: row.updated_at as string | null,
  };
}

export async function getPharmacyByHpid(hpid: string): Promise<Pharmacy | null> {
  return cacheDbRead(["pharmacy", "by-hpid", hpid], () =>
    getPharmacyByHpidUncached(hpid),
  );
}

async function getPharmacyByHpidUncached(hpid: string): Promise<Pharmacy | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: "SELECT * FROM pharmacies WHERE hpid = ? LIMIT 1",
      args: [hpid],
    });
    if (!result.rows.length) return null;
    return rowToPharmacy(result.rows[0]);
  } catch (e) {
    console.error("pharmacy fetch exception", e);
    return null;
  }
}

export async function getPharmaciesByRegion(
  province: string,
  city?: string,
): Promise<Pharmacy[]> {
  try {
    const db = getTursoClient();
    const normalized = normalizeProvince(province);
    if (!normalized) return [];

    let sql = "SELECT * FROM pharmacies WHERE province = ?";
    const args: (string | null)[] = [normalized];
    if (city && city !== "전체") {
      sql += " AND city = ?";
      args.push(city);
    }
    sql += " ORDER BY name ASC LIMIT 500";

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToPharmacy);
  } catch (e) {
    console.error("pharmacies region fetch exception", e);
    return [];
  }
}

export async function getPharmaciesByRegionPaginated(
  province: string,
  city: string | undefined,
  limit = 20,
  offset = 0,
): Promise<{ items: Pharmacy[]; total: number }> {
  try {
    const db = getTursoClient();
    const normalized = normalizeProvince(province);
    if (!normalized) return { items: [], total: 0 };

    const baseWhere = city && city !== "전체"
      ? "WHERE province = ? AND city = ?"
      : "WHERE province = ?";
    const baseArgs: string[] = city && city !== "전체"
      ? [normalized, city]
      : [normalized];

    const [countResult, dataResult] = await Promise.all([
      db.execute({ sql: `SELECT COUNT(*) as cnt FROM pharmacies ${baseWhere}`, args: baseArgs }),
      db.execute({
        sql: `SELECT * FROM pharmacies ${baseWhere} ORDER BY name ASC LIMIT ? OFFSET ?`,
        args: [...baseArgs, limit, offset],
      }),
    ]);

    const total = Number(countResult.rows[0]?.cnt ?? 0);
    return { items: dataResult.rows.map(rowToPharmacy), total };
  } catch (e) {
    console.error("pharmacies paginated fetch exception", e);
    return { items: [], total: 0 };
  }
}

export async function getCitiesByProvince(
  province: string,
): Promise<Array<{ city: string; pharmacyCount: number }>> {
  return cacheDbRead(["pharmacy", "cities", province], async () => {
    try {
      const db = getTursoClient();
      const normalized = normalizeProvince(province);
      if (!normalized) return [];
      const result = await db.execute({
        sql: `SELECT city, COUNT(*) AS cnt
              FROM pharmacies
              WHERE province = ? AND city IS NOT NULL AND TRIM(city) != ''
              GROUP BY city
              ORDER BY city ASC`,
        args: [normalized],
      });
      return result.rows.map((row: Record<string, unknown>) => ({
        city: String(row.city),
        pharmacyCount: Number(row.cnt ?? 0),
      }));
    } catch (error) {
      console.error("pharmacy city list exception", error);
      return [];
    }
  });
}

export async function getRegionSitemapEntries(): Promise<
  Array<{ province: string; city: string; updated_at: string | null }>
> {
  return cacheDbRead(["pharmacy", "region-sitemap"], async () => {
    try {
      const db = getTursoClient();
      const result = await db.execute(`SELECT province, city, MAX(updated_at) AS updated_at
        FROM pharmacies
        WHERE province IS NOT NULL AND TRIM(province) != ''
          AND city IS NOT NULL AND TRIM(city) != ''
        GROUP BY province, city
        ORDER BY province ASC, city ASC`);
      const deduplicated = new Map<string, { province: string; city: string; updated_at: string | null }>();
      for (const row of result.rows as Record<string, unknown>[]) {
        const entry = {
          province: getCanonicalProvinceSlug(String(row.province)),
          city: String(row.city),
          updated_at: row.updated_at ? String(row.updated_at) : null,
        };
        const key = `${entry.province}\u0000${entry.city}`;
        const previous = deduplicated.get(key);
        if (!previous || (entry.updated_at ?? "") > (previous.updated_at ?? "")) {
          deduplicated.set(key, entry);
        }
      }
      return Array.from(deduplicated.values());
    } catch (error) {
      console.error("region sitemap fetch exception", error);
      return [];
    }
  });
}

export async function getPharmacyCount(): Promise<number> {
  return cacheDbRead(["pharmacy", "count"], () => getPharmacyCountUncached());
}

async function getPharmacyCountUncached(): Promise<number> {
  try {
    const db = getTursoClient();
    const result = await db.execute("SELECT COUNT(*) as cnt FROM pharmacies");
    return Number(result.rows[0]?.cnt ?? 0);
  } catch (e) {
    console.error("pharmacy count fetch exception", e);
    return 0;
  }
}

export async function getIndexablePharmacyCount(): Promise<number> {
  return cacheDbRead(["pharmacy", "indexable-count"], () =>
    getIndexablePharmacyCountUncached(),
  );
}

async function getIndexablePharmacyCountUncached(): Promise<number> {
  try {
    const db = getTursoClient();
    const result = await db.execute(`SELECT COUNT(*) as cnt FROM pharmacies ${PHARMACY_INDEXABLE_WHERE}`);
    return Number(result.rows[0]?.cnt ?? 0);
  } catch (e) {
    console.error("indexable pharmacy count exception", e);
    return 0;
  }
}

export async function getPharmacyHpidsChunk(
  offset: number,
  limit: number,
): Promise<{ hpid: string; updated_at: string | null }[]> {
  return cacheDbRead(["pharmacy", "hpids", String(offset), String(limit)], () =>
    getPharmacyHpidsChunkUncached(offset, limit),
  );
}

async function getPharmacyHpidsChunkUncached(
  offset: number,
  limit: number,
): Promise<{ hpid: string; updated_at: string | null }[]> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: "SELECT hpid, updated_at FROM pharmacies ORDER BY hpid ASC LIMIT ? OFFSET ?",
      args: [limit, offset],
    });
    return result.rows.map((r: Record<string, unknown>) => ({
      hpid: r.hpid as string,
      updated_at: r.updated_at as string | null,
    }));
  } catch (e) {
    console.error("pharmacy hpid chunk fetch exception", e);
    return [];
  }
}

export async function getPharmacySitemapChunk(
  offset: number,
  limit: number,
): Promise<{ hpid: string; updated_at: string | null; address: string | null; tel: string | null; operating_hours: Pharmacy["operating_hours"] }[]> {
  return cacheDbRead(["pharmacy", "sitemap", String(offset), String(limit)], () =>
    getPharmacySitemapChunkUncached(offset, limit),
  );
}

async function getPharmacySitemapChunkUncached(
  offset: number,
  limit: number,
): Promise<{ hpid: string; updated_at: string | null; address: string | null; tel: string | null; operating_hours: Pharmacy["operating_hours"] }[]> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: `SELECT hpid, updated_at, address, tel, operating_hours
            FROM pharmacies
            ${PHARMACY_INDEXABLE_WHERE}
            ORDER BY updated_at DESC, hpid ASC
            LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });
    return result.rows.map((r: Record<string, unknown>) => ({
      hpid: r.hpid as string,
      updated_at: r.updated_at as string | null,
      address: r.address as string | null,
      tel: r.tel as string | null,
      operating_hours: parseJson(r.operating_hours, null),
    }));
  } catch (e) {
    console.error("pharmacy sitemap chunk fetch exception", e);
    return [];
  }
}

export function findNearbyWithinKm(
  target: Pharmacy,
  list: Pharmacy[],
  radiusKm = 2.2,
): Pharmacy[] {
  return list
    .filter(
      (p) =>
        p.hpid !== target.hpid &&
        p.latitude &&
        p.longitude &&
        target.latitude &&
        target.longitude,
    )
    .map((p) => ({
      pharmacy: p,
      distance: distanceKm(target.latitude as number, target.longitude as number, p.latitude as number, p.longitude as number),
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map((item) => item.pharmacy);
}

// Supplement types
export interface Supplement {
  id: string;
  product_report_no: string;
  name: string;
  manufacturer: string | null;
  image_url: string | null;
  nutrition_facts: Array<{
    name: string;
    amount: number;
    unit: string;
    percent_dv: number | null;
    source?: string;
  }> | null;
  additives: { has_preservatives?: boolean; has_coloring?: boolean; has_artificial_sweeteners?: boolean; details?: string[] } | null;
  ai_summary: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  deficiency_symptoms: string[] | null;
  excess_symptoms: string[] | null;
  daily_value_guideline: { min?: number; max?: number; unit?: string } | null;
  tags: string[] | null;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSupplement(row: any): Supplement {
  return {
    id: row.id as string,
    product_report_no: row.product_report_no as string,
    name: row.name as string,
    manufacturer: row.manufacturer as string | null,
    image_url: row.image_url as string | null,
    nutrition_facts: parseJson(row.nutrition_facts, null),
    additives: parseJson(row.additives, null),
    ai_summary: row.ai_summary as string | null,
    tags: parseJson(row.tags, null),
    created_at: row.created_at as string,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToIngredient(row: any): Ingredient {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    summary: row.summary as string | null,
    deficiency_symptoms: parseJson(row.deficiency_symptoms, null),
    excess_symptoms: parseJson(row.excess_symptoms, null),
    daily_value_guideline: parseJson(row.daily_value_guideline, null),
    tags: parseJson(row.tags, null),
    created_at: row.created_at as string,
  };
}

export async function getSupplementById(id: string): Promise<Supplement | null> {
  return cacheDbRead(["supplement", "by-id", id], () => getSupplementByIdUncached(id));
}

async function getSupplementByIdUncached(id: string): Promise<Supplement | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({ sql: "SELECT * FROM supplements WHERE id = ? LIMIT 1", args: [id] });
    if (!result.rows.length) return null;
    return rowToSupplement(result.rows[0]);
  } catch (e) {
    console.error("supplement fetch exception", e);
    return null;
  }
}

export async function getIngredientBySlug(slug: string): Promise<Ingredient | null> {
  return cacheDbRead(["ingredient", "by-slug", slug], () =>
    getIngredientBySlugUncached(slug),
  );
}

async function getIngredientBySlugUncached(slug: string): Promise<Ingredient | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({ sql: "SELECT * FROM ingredients WHERE slug = ? LIMIT 1", args: [slug] });
    if (!result.rows.length) return null;
    return rowToIngredient(result.rows[0]);
  } catch (e) {
    console.error("ingredient fetch exception", e);
    return null;
  }
}

export async function getSupplementCount(): Promise<number> {
  return cacheDbRead(["supplement", "count"], () => getSupplementCountUncached());
}

async function getSupplementCountUncached(): Promise<number> {
  try {
    const db = getTursoClient();
    const result = await db.execute(`SELECT COUNT(*) as cnt FROM supplements ${SUPPLEMENT_INDEXABLE_WHERE}`);
    return Number(result.rows[0]?.cnt ?? 0);
  } catch (e) {
    console.error("supplement count fetch exception", e);
    return 0;
  }
}

export async function getSupplementSitemapChunk(offset: number, limit: number): Promise<{ id: string; name: string; created_at: string | null }[]> {
  return cacheDbRead(["supplement", "sitemap", String(offset), String(limit)], () =>
    getSupplementSitemapChunkUncached(offset, limit),
  );
}

async function getSupplementSitemapChunkUncached(offset: number, limit: number): Promise<{ id: string; name: string; created_at: string | null }[]> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: `SELECT id, name, created_at FROM supplements ${SUPPLEMENT_INDEXABLE_WHERE} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });
    return result.rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      created_at: r.created_at as string | null,
    }));
  } catch (e) {
    console.error("supplement sitemap chunk fetch exception", e);
    return [];
  }
}

export async function getMedicineCount(): Promise<number> {
  return cacheDbRead(["medicine", "count"], () => getMedicineCountUncached());
}

async function getMedicineCountUncached(): Promise<number> {
  try {
    const db = getTursoClient();
    const result = await db.execute(`SELECT COUNT(*) as cnt FROM medicines ${MEDICINE_INDEXABLE_WHERE}`);
    return Number(result.rows[0]?.cnt ?? 0);
  } catch (e) {
    console.error("medicine count fetch exception", e);
    return 0;
  }
}

export async function getMedicineSitemapChunk(offset: number, limit: number): Promise<{ id: string; name: string; created_at: string | null }[]> {
  return cacheDbRead(["medicine", "sitemap", String(offset), String(limit)], () =>
    getMedicineSitemapChunkUncached(offset, limit),
  );
}

async function getMedicineSitemapChunkUncached(offset: number, limit: number): Promise<{ id: string; name: string; created_at: string | null }[]> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: `SELECT id, name, created_at FROM medicines ${MEDICINE_INDEXABLE_WHERE} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });
    return result.rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      created_at: r.created_at as string | null,
    }));
  } catch (e) {
    console.error("medicine sitemap chunk fetch exception", e);
    return [];
  }
}

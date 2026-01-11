import { Pharmacy } from "@/types/pharmacy";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

function normalizeProvince(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return PROVINCE_MAP[trimmed] ?? trimmed;
}

export async function getPharmacyByHpid(hpid: string): Promise<Pharmacy | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("pharmacies")
      .select("*")
      .eq("hpid", hpid)
      .maybeSingle();
    if (error) {
      console.error("pharmacy fetch error", error);
      return null;
    }
    return data as Pharmacy | null;
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
    const supabase = getSupabaseServerClient();
    const normalizedProvince = normalizeProvince(province);
    if (!normalizedProvince) return [];

    let query = supabase.from("pharmacies").select("*").eq("province", normalizedProvince);
    if (city && city !== "전체") {
      query = query.eq("city", city);
    }
    const { data, error } = await query.order("name", { ascending: true }).limit(500);
    if (error) {
      console.error("pharmacies region fetch error", error);
      return [];
    }
    return (data as Pharmacy[]) ?? [];
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
    const supabase = getSupabaseServerClient();
    const normalizedProvince = normalizeProvince(province);
    if (!normalizedProvince) return { items: [], total: 0 };

    let query = supabase
      .from("pharmacies")
      .select("*", { count: "exact" })
      .eq("province", normalizedProvince)
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (city && city !== "전체") {
      query = query.eq("city", city);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("pharmacies paginated fetch error", error);
      return { items: [], total: 0 };
    }

    return { items: (data as Pharmacy[]) ?? [], total: count ?? 0 };
  } catch (e) {
    console.error("pharmacies paginated fetch exception", e);
    return { items: [], total: 0 };
  }
}



export async function getPharmacyCount(): Promise<number> {
  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase.from("pharmacies").select("hpid", { count: "exact", head: true });
    if (error) {
      console.error("pharmacy count fetch error", error);
      return 0;
    }
    return count ?? 0;
  } catch (e) {
    console.error("pharmacy count fetch exception", e);
    return 0;
  }
}

export async function getPharmacyHpidsChunk(
  offset: number,
  limit: number,
): Promise<{ hpid: string; updated_at: string | null }[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("pharmacies")
      .select("hpid, updated_at")
      .order("hpid", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) {
      console.error("pharmacy hpid chunk fetch error", error);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("pharmacy hpid chunk fetch exception", e);
    return [];
  }
}

export async function getPharmacySitemapChunk(
  offset: number,
  limit: number,
): Promise<
  { hpid: string; updated_at: string | null; address: string | null; tel: string | null; operating_hours: Pharmacy["operating_hours"] }[]
> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("pharmacies")
      .select("hpid, updated_at, address, tel, operating_hours")
      .order("hpid", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) {
      console.error("pharmacy sitemap chunk fetch error", error);
      return [];
    }
    return (data as { hpid: string; updated_at: string | null; address: string | null; tel: string | null; operating_hours: Pharmacy["operating_hours"] }[]) ?? [];
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
      distance: distanceKm(
        target.latitude as number,
        target.longitude as number,
        p.latitude as number,
        p.longitude as number,
      ),
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map((item) => item.pharmacy);
}

function toRad(num: number) {
  return (num * Math.PI) / 180;
}

/**
 * 두 지점 간의 거리를 킬로미터로 계산합니다 (Haversine formula)
 * @param lat1 첫 번째 지점의 위도
 * @param lon1 첫 번째 지점의 경도
 * @param lat2 두 번째 지점의 위도
 * @param lon2 두 번째 지점의 경도
 * @returns 거리 (킬로미터). 좌표가 유효하지 않으면 0 반환
 */
export function distanceKm(
  lat1: number | null | undefined,
  lon1: number | null | undefined,
  lat2: number | null | undefined,
  lon2: number | null | undefined,
): number {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null
  ) {
    return 0;
  }

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


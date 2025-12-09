import { Pharmacy } from "@/types/pharmacy";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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
    let query = supabase.from("pharmacies").select("*").eq("province", province);
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

export async function getAllPharmacyHpids(): Promise<
  { hpid: string; updated_at: string | null }[]
> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("pharmacies")
      .select("hpid, updated_at")
      .limit(5000);
    if (error) {
      console.error("pharmacy hpid fetch error", error);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("pharmacy hpid fetch exception", e);
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

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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


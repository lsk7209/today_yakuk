import type { OperatingHours } from "@/types/pharmacy";

function hasUsefulHours(hours?: OperatingHours | null): boolean {
  if (!hours) return false;
  return Object.values(hours).some((slot) => !!slot?.open && !!slot?.close);
}

function hasPhone(tel?: string | null): boolean {
  if (!tel) return false;
  return tel.replace(/\D/g, "").length >= 8;
}

function hasAddress(address?: string | null): boolean {
  if (!address) return false;
  return address.trim().length >= 8;
}

/**
 * 구글 “중복/저품질(얇은 데이터)” 방어용 인덱싱 기준.
 *
 * - 주소가 없으면 기본적으로 index 금지(검색 의도 충족 어려움)
 * - 주소가 있어도, (전화 또는 영업시간) 둘 다 없으면 얇은 페이지로 간주
 */
export function isIndexablePharmacy(pharmacy: {
  address?: string | null;
  tel?: string | null;
  operating_hours?: OperatingHours | null;
}): boolean {
  if (!hasAddress(pharmacy.address ?? null)) return false;
  const useful = hasPhone(pharmacy.tel ?? null) || hasUsefulHours(pharmacy.operating_hours ?? null);
  return useful;
}



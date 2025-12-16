import type { OperatingHours } from "@/types/pharmacy";

function hasUsefulHours(hours?: OperatingHours | null): boolean {
  if (!hours) return false;
  return Object.values(hours).some((slot) => !!slot?.open && !!slot?.close);
}

function hasPhone(tel?: string | null): boolean {
  if (!tel) return false;
  const digits = tel.replace(/\D/g, "");
  // 대한민국 전화번호(대표): 02(9~10자리), 0xx(10~11자리), 070/050x 등 포함
  if (digits.length < 9 || digits.length > 11) return false;
  if (!digits.startsWith("0")) return false;

  // 플레이스홀더/가짜 번호 방어 (예: 031-000-0000)
  if (/^0+$/.test(digits)) return false;
  if (/0{7,}/.test(digits)) return false;

  return true;
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



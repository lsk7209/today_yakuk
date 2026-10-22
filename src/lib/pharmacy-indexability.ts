import type { OperatingHours } from "@/types/pharmacy";

function hasUsefulHours(hours?: OperatingHours | null): boolean {
  if (!hours) return false;
  return Object.values(hours).some((slot) => !!slot?.open && !!slot?.close);
}

/**
 * 애드센스 신청 기간용 선택 기능: 공공데이터 외 고유 분석(intelligence report)이 붙은
 * 약국만 색인한다. 보완 파이프라인이 사용하는 PHARMACY_INDEXABLE_PREDICATE에는 영향을 주지 않는다.
 * 보완 비율을 `npm run enrich:pharmacies:stats`로 확인한 뒤 켠다.
 */
export function requiresEnrichmentForIndex(): boolean {
  return process.env.PHARMACY_INDEX_REQUIRES_ENRICHMENT?.trim().toLowerCase() === "true";
}

export function hasValidPhone(tel?: string | null): boolean {
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
  enriched_at?: string | null;
}): boolean {
  if (requiresEnrichmentForIndex() && !pharmacy.enriched_at) return false;
  if (!hasAddress(pharmacy.address ?? null)) return false;
  const useful = hasValidPhone(pharmacy.tel ?? null) || hasUsefulHours(pharmacy.operating_hours ?? null);
  return useful;
}

export const PHARMACY_INDEXABLE_PREDICATE = `
  address IS NOT NULL
  AND LENGTH(TRIM(address)) >= 8
  AND (
    (
      tel IS NOT NULL
      AND LENGTH(
        REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tel), '-', ''), ' ', ''), ')', ''), '(', '')
      ) BETWEEN 9 AND 11
      AND REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tel), '-', ''), ' ', ''), ')', ''), '(', '') LIKE '0%'
      AND REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tel), '-', ''), ' ', ''), ')', ''), '(', '') NOT GLOB '*[^0-9]*'
      AND REPLACE(REPLACE(REPLACE(REPLACE(TRIM(tel), '-', ''), ' ', ''), ')', ''), '(', '') NOT LIKE '%0000000%'
    )
    OR EXISTS (
      SELECT 1
      FROM json_each(
        CASE WHEN json_valid(operating_hours) THEN operating_hours ELSE '{}' END
      ) AS day
      WHERE NULLIF(TRIM(CAST(json_extract(day.value, '$.open') AS TEXT)), '') IS NOT NULL
        AND NULLIF(TRIM(CAST(json_extract(day.value, '$.close') AS TEXT)), '') IS NOT NULL
    )
  )
`;

export const PHARMACY_INDEXABLE_WHERE = `
WHERE ${PHARMACY_INDEXABLE_PREDICATE}
${requiresEnrichmentForIndex() ? "AND enriched_at IS NOT NULL AND intelligence_report IS NOT NULL" : ""}
`;




/**
 * 지도 검색 품질을 위해 주소에서 “상세 호수/건물명”을 제거합니다.
 *
 * 예)
 * - "서울특별시 강남구 헌릉로571길 7, 강남레체 1층 101호" → "서울특별시 강남구 헌릉로571길 7"
 * - "서울특별시 중구 명동길 74, 카톨릭회관 신관 B113호" → "서울특별시 중구 명동길 74"
 */
export function getMapSearchAddress(address?: string | null): string {
  const raw = (address ?? "").trim();
  if (!raw) return "";
  const first = raw.split(",")[0]?.trim() ?? raw;
  return first.replace(/\s+/g, " ").trim();
}



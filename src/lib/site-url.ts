/**
 * 사이트 기본 URL(캐노니컬/OG/JSON-LD 등)에 사용하는 기준 도메인을 반환합니다.
 *
 * - 운영 도메인은 `www.todaypharm.kr`로 통일합니다.
 * - 환경변수가 `https://todaypharm.kr`처럼 non-www로 들어와도 자동으로 www로 정규화합니다.
 * - 마지막 슬래시(`/`)는 제거합니다.
 */
export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const normalized = (raw || "https://www.todaypharm.kr").replace(/\/$/, "");

  // 도메인 통일: todaypharm.kr → www.todaypharm.kr
  if (normalized === "https://todaypharm.kr") return "https://www.todaypharm.kr";
  if (normalized === "http://todaypharm.kr") return "https://www.todaypharm.kr";

  return normalized;
}



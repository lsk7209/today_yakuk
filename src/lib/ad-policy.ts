import { getAdsenseClientId } from "@/lib/site-config";

const AD_EXCLUDED_PREFIXES = [
  "/admin",
  "/api",
  "/contact",
  "/privacy",
  "/terms",
  "/nearby",
  "/wiki",
  "/pharmacy",
];

export function isTruthyFlag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function isAdExcludedPath(pathname: string): boolean {
  return AD_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// 내부 구분이며 Google 계정 상태 명칭이 아니다.
// disabled: 광고 요청 없음 / verification: 사이트 확인용 메타 태그만 / serving: 광고 요청 허용
export type AdsenseState = "disabled" | "verification" | "serving";

export function getAdsenseState(): AdsenseState {
  if (!getAdsenseClientId()) return "disabled";
  return isTruthyFlag(process.env.NEXT_PUBLIC_ADSENSE_SERVING_ENABLED) ? "serving" : "verification";
}

export function isAdsenseServingEnabled(): boolean {
  return getAdsenseState() === "serving";
}

export function isAffiliateAdsEnabled(): boolean {
  return isTruthyFlag(process.env.NEXT_PUBLIC_AFFILIATE_ADS_ENABLED);
}

export function canRequestAds(pathname: string, pageEligible = false): boolean {
  return pageEligible && !isAdExcludedPath(pathname);
}

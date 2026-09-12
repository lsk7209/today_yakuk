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

export function isAdsenseServingEnabled(): boolean {
  return isTruthyFlag(process.env.NEXT_PUBLIC_ADSENSE_SERVING_ENABLED);
}

export function isAffiliateAdsEnabled(): boolean {
  return isTruthyFlag(process.env.NEXT_PUBLIC_AFFILIATE_ADS_ENABLED);
}

export function canRequestAds(pathname: string, pageEligible = false): boolean {
  return pageEligible && !isAdExcludedPath(pathname);
}

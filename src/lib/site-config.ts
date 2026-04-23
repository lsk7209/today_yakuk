export const SITE_NAME = "약국오늘";
export const SITE_TAGLINE = "실시간 영업 약국 검색";
export const SITE_DESCRIPTION = "지금 문 연 근처 약국을 빠르게 찾고 영업시간·위치를 확인하세요.";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.svg";
export const DEFAULT_GOOGLE_SITE_VERIFICATION = "_U2SIVpJyJOB7BDkrQSxnHPyPGbLebmxu4bSNzWskmA";
export const DEFAULT_NAVER_SITE_VERIFICATION = "e66ee5ae04ce96bb4c1b95d6db2d8dd35dcd89e3";
export const DEFAULT_ADSENSE_CLIENT_ID = "ca-pub-3050601904412736";

function readTrimmedEnv(value: string | undefined) {
  return value?.trim() || "";
}

export function getGoogleSiteVerification() {
  return readTrimmedEnv(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION) || DEFAULT_GOOGLE_SITE_VERIFICATION;
}

export function getNaverSiteVerification() {
  return readTrimmedEnv(process.env.NEXT_PUBLIC_NAVER_VERIFICATION) || DEFAULT_NAVER_SITE_VERIFICATION;
}

export function getAdsenseClientId() {
  return (
    readTrimmedEnv(process.env.NEXT_PUBLIC_ADSENSE_PUB_ID) ||
    readTrimmedEnv(process.env.NEXT_PUBLIC_ADSENSE_ID) ||
    DEFAULT_ADSENSE_CLIENT_ID
  );
}

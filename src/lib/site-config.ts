export const SITE_NAME = "약국오늘";
export const SITE_TAGLINE = "문 연 약국·영업시간 찾기";
export const SITE_DESCRIPTION = "등록된 영업시간을 기준으로 지금 문 연 근처 약국을 찾고, 야간·주말·공휴일 운영 정보와 전화·길찾기를 확인하세요.";
export const DEFAULT_OG_IMAGE_PATH = "/og-image.svg";
export const DEFAULT_GOOGLE_SITE_VERIFICATION = "_U2SIVpJyJOB7BDkrQSxnHPyPGbLebmxu4bSNzWskmA";
export const ADDITIONAL_GOOGLE_SITE_VERIFICATIONS = [
  "1dqSw0A6kEE0EMmn27FczoixQQGula0xhdUBCpHgtvg",
];
export const DEFAULT_NAVER_SITE_VERIFICATION = "e66ee5ae04ce96bb4c1b95d6db2d8dd35dcd89e3";
export const DEFAULT_ADSENSE_CLIENT_ID = "ca-pub-3050601904412736";
export const DEFAULT_GA_MEASUREMENT_ID = "G-NPMV2G9KPK";

function readTrimmedEnv(value: string | undefined) {
  return value?.trim() || "";
}

export function getGoogleSiteVerification() {
  return readTrimmedEnv(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION) || DEFAULT_GOOGLE_SITE_VERIFICATION;
}

export function getGoogleSiteVerifications() {
  return Array.from(
    new Set([getGoogleSiteVerification(), ...ADDITIONAL_GOOGLE_SITE_VERIFICATIONS].filter(Boolean)),
  );
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

export function getGoogleAnalyticsMeasurementId() {
  return readTrimmedEnv(process.env.NEXT_PUBLIC_GA_ID) || DEFAULT_GA_MEASUREMENT_ID;
}

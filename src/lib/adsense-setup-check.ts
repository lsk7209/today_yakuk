import { ADSENSE_CLIENT_ID_PATTERN } from "@/lib/site-config";

const GOOGLE_ADS_TXT_CERT_ID = "f08c47fec0942fa0";

export type AdsenseSetupInput = {
  rawClientId: string;
  servingEnabled: boolean;
  adsTxt: string | null;
  slotIds: Array<string | undefined>;
};

export type AdsenseSetupResult = {
  state: "disabled" | "verification" | "serving";
  errors: string[];
  warnings: string[];
};

function googleSellerIds(adsTxt: string): string[] {
  return adsTxt
    .split(/\r?\n/)
    .map((line) => line.split("#")[0]!.split(",").map((part) => part.trim()))
    .filter((parts) => parts[0]?.toLowerCase() === "google.com" && parts[1])
    .map((parts) => parts[1]!);
}

// 코드·메타 태그·ads.txt·슬롯 설정이 같은 게시자 ID를 가리키는지 순수 함수로 검증한다.
export function evaluateAdsenseSetup(input: AdsenseSetupInput): AdsenseSetupResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const raw = input.rawClientId.trim();

  if (!raw) {
    warnings.push("게시자 ID 미설정: 광고 요청과 사이트 확인 메타 태그가 모두 꺼져 있습니다.");
    return { state: "disabled", errors, warnings };
  }
  if (!ADSENSE_CLIENT_ID_PATTERN.test(raw)) {
    errors.push(`게시자 ID 형식 오류: 'ca-pub-' + 숫자 16자리여야 합니다. (입력값: ${raw})`);
    return { state: "disabled", errors, warnings };
  }

  const state = input.servingEnabled ? "serving" : "verification";
  const sellerId = raw.replace(/^ca-/, "");
  const report = state === "serving" ? errors : warnings;

  if (input.adsTxt === null) {
    report.push("ads.txt를 읽지 못했습니다.");
  } else {
    const ids = googleSellerIds(input.adsTxt);
    if (/ca-pub-/i.test(input.adsTxt)) errors.push("ads.txt에는 'pub-' 형식을 써야 합니다('ca-pub-' 불가).");
    if (!ids.includes(sellerId)) report.push(`ads.txt에 ${sellerId} 항목(DIRECT, ${GOOGLE_ADS_TXT_CERT_ID})이 없습니다.`);
    const others = ids.filter((id) => id !== sellerId);
    if (others.length > 0) {
      warnings.push(`ads.txt에 다른 게시자 ID(${others.join(", ")})가 있습니다. 소유 관계를 확인하기 전에는 삭제·유지를 결정하지 마세요.`);
    }
  }

  if (state === "serving" && input.slotIds.some((id) => !id)) {
    warnings.push("일부 광고 슬롯 ID가 비어 있어 해당 위치에는 광고가 렌더링되지 않습니다.");
  }
  return { state, errors, warnings };
}

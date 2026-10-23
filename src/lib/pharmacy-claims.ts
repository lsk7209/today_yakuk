import type { Pharmacy } from "@/types/pharmacy";
import { formatHHMM } from "@/lib/hours";

/**
 * 저장된 자유 서술형 약국 소개(content_queue.ai_summary, gemini_summary)에서
 * 약국 데이터로 확인할 수 없는 주장을 탐지한다.
 * 이 모델에는 리뷰·재고·주차·결제·접수·도보 시간·지역 통계 필드가 없으므로 해당 주장은 근거가 없다.
 * 탐지된 문구는 의학적/사실 검증이 아니라 "공개하지 않을 이유"를 찾는 용도이다.
 */

const UNSUPPORTED_CLAIM_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: "review", pattern: /리뷰|후기|평점|별점|방문자|이용자\s*(평가|만족)|체감|입소문|단골/ },
  { id: "walking-time", pattern: /도보\s*\d|걸어서\s*\d|\d+\s*분\s*(거리|이내)|역에서\s*\d+\s*분/ },
  { id: "regional-stat", pattern: /지역\s*(평균|대비)|평균\s*(대비|보다)|상위\s*\d+\s*%|하위\s*\d+\s*%|\d+(\.\d+)?\s*%\s*(의\s*)?(약국|비율)/ },
  { id: "facility", pattern: /주차|발레|카드\s*결제|결제\s*(가능|수단)|간편결제|처방전?\s*접수|접수\s*마감|조제\s*대기/ },
  { id: "stock", pattern: /재고\s*(보유|있|충분|확보)|상비약\s*구비|구비\s*되어/ },
  { id: "all-year", pattern: /연중\s*무휴|365\s*일|공휴일에도\s*(영업|운영|문)/ },
];

export type UnsupportedClaimId = (typeof UNSUPPORTED_CLAIM_PATTERNS)[number]["id"] | "unknown-time";

function knownTimes(pharmacy: Pharmacy): Set<string> {
  const times = new Set<string>();
  for (const slot of Object.values(pharmacy.operating_hours ?? {})) {
    for (const raw of [slot?.open, slot?.close]) {
      const text = formatHHMM(raw);
      if (text) times.add(text);
    }
  }
  return times;
}

export function findUnsupportedPharmacyClaims(text: string, pharmacy: Pharmacy): UnsupportedClaimId[] {
  const found: UnsupportedClaimId[] = UNSUPPORTED_CLAIM_PATTERNS.filter(({ pattern }) =>
    pattern.test(text),
  ).map(({ id }) => id);

  const times = knownTimes(pharmacy);
  const mentioned = text.match(/\b\d{1,2}:\d{2}\b/g) ?? [];
  const unknown = mentioned.some((time) => !times.has(time.padStart(5, "0")));
  if (unknown) found.push("unknown-time");
  return found;
}

/** 근거 없는 주장이 없는 저장 소개문만 사용하고, 아니면 데이터 기반 템플릿 요약으로 대체한다. */
export function selectPharmacySummary(
  pharmacy: Pharmacy,
  storedCandidates: Array<string | null | undefined>,
  templateSummary: string,
): string {
  for (const candidate of storedCandidates) {
    const text = candidate?.trim();
    if (text && findUnsupportedPharmacyClaims(text, pharmacy).length === 0) return text;
  }
  return templateSummary;
}

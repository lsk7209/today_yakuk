import type { Pharmacy } from "@/types/pharmacy";
import { formatHourRange, hhmmToMinutes, hasRegisteredHours } from "@/lib/hours";
import { buildAiLessDetailTemplate } from "@/lib/pharmacy-detail-template";
import { DISPENSING_COST_GUIDANCE } from "@/lib/dispensing-cost";

export type VisualCategory =
  | "consultation"
  | "night_care"
  | "transit_hub"
  | "neighborhood_care"
  | "specialty_care";

export type KeywordMetric = {
  label: string;
  count: number;
  ratioPercent: number;
  category: "service" | "expertise" | "facility" | "price";
};

export type TransitStopInfo = {
  name: string;
  code?: string | null;
  type: "bus" | "subway";
  walkMinutes: number;
  walkMeters: number;
  routes: string[];
};

export type PeerComparisonMetric = {
  metric: string;
  pharmacyValue: string;
  regionalBenchmark: string;
  verdict: string;
  scorePercent: number;
};

export type PharmacyIntelligenceReport = {
  version: 1;
  visualCategory: VisualCategory;
  briefing: {
    lines: [string, string, string];
    highlights: string[];
  };
  costAnalysis: {
    standardWindowText: string;
    surchargeWindowText: string;
    priceSentimentRatio: number | null;
    varietySentimentRatio: number | null;
    paymentAndCostPoints: string[];
    summaryText: string;
  };
  keywordAnalysis: {
    visitorReviewCount: number;
    blogReviewCount: number;
    votedUserCount: number;
    topKeywords: KeywordMetric[];
    specialtyTags: string[];
    sentimentSummary: string;
  };
  visitGuide: {
    transitStops: TransitStopInfo[];
    facilities: string[];
    parkingNote: string;
    regularClosedSummary: string;
    actionableTips: string[];
  };
  peerComparison: {
    regionLabel: string;
    weekdayDailyHours: number | null;
    regionalAvgWeekdayHours: number | null;
    hasNightCare: boolean;
    hasWeekendCare: boolean;
    metrics: PeerComparisonMetric[];
    summaryText: string;
  };
  faq: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
};

export type RawExternalPlaceData = {
  matched: boolean;
  placeId?: string;
  visitorReviewCount?: number;
  blogReviewCount?: number;
  votedUserCount?: number;
  votedKeywords?: Array<{ label: string; count: number }>;
  busStops?: Array<{
    name: string;
    code?: string | null;
    walkMinutes: number;
    walkMeters: number;
    routes: string[];
  }>;
  subwayStops?: Array<{
    name: string;
    walkMinutes: number;
    walkMeters: number;
    exitInfo?: string | null;
  }>;
  facilities?: string[];
  parkingInfo?: string | null;
  hasNPay?: boolean;
  hasWheelchairEntrance?: boolean;
  regularClosedDays?: string | null;
  specialtyKeywords?: string[];
};

// External review and transit fields have no source/licence/sample contract yet.
// Never reconstruct factual claims from legacy synthesized reports.
export function buildPharmacyIntelligenceReport(
  pharmacy: Pharmacy,
  external?: RawExternalPlaceData | null,
  peerPharmacies?: Pharmacy[],
): PharmacyIntelligenceReport {
  void external;
  void peerPharmacies;
  const hours = pharmacy.operating_hours;
  const weekdays = ["mon", "tue", "wed", "thu", "fri"];
  const valid = (key: string) => {
    if (!hasRegisteredHours(hours?.[key])) return null;
    const open = hhmmToMinutes(hours?.[key]?.open);
    const close = hhmmToMinutes(hours?.[key]?.close, true);
    return open !== null && close !== null && open !== close
      ? { open, close: close < open ? close + 1440 : close } : null;
  };
  const weekdaySlots = weekdays.map(valid).filter((s): s is {open: number; close: number} => s !== null);
  const avg = weekdaySlots.length ? Math.round(weekdaySlots.reduce((sum, s) => sum + (s.close - s.open) / 60, 0) / weekdaySlots.length * 10) / 10 : null;
  const night = weekdaySlots.some(s => s.close > 20 * 60);
  const weekend = Boolean(valid("sat") || valid("sun"));
  const schedule = [...weekdays.map((key, i) => `${["월", "화", "수", "목", "금"][i]} ${formatHourRange(hours?.[key])}`), `토 ${formatHourRange(hours?.sat)}`, `일 ${formatHourRange(hours?.sun)}`, `공휴일 ${formatHourRange(hours?.holiday)}`].join(" · ");
  const template = buildAiLessDetailTemplate(pharmacy);
  const closed = "확인된 정기휴무 자료가 없습니다. 시간표 미등록은 휴무를 뜻하지 않습니다.";
  const parking = "주차·휠체어 접근·결제수단은 확인되지 않았습니다. 필요한 조건을 전화로 문의하세요.";
  return {
    version: 1,
    visualCategory: night ? "night_care" : "neighborhood_care",
    briefing: {
      lines: [template.summary, `등록 요일별 시간표: ${schedule}`, "당일 운영·접수 마감·필요한 약의 재고는 출발 전 전화로 확인하세요."],
      highlights: ["등록 시간표 기준", "방문 전 전화 확인"],
    },
    costAnalysis: {
      standardWindowText: DISPENSING_COST_GUIDANCE,
      surchargeWindowText: "토요일 오전을 포함한 조제료 가산 대상·시간·본인부담은 약국과 건강보험심사평가원의 현행 안내로 확인하세요. 이 페이지는 금액이나 가산율을 계산하지 않습니다.",
      priceSentimentRatio: null, varietySentimentRatio: null,
      paymentAndCostPoints: ["전화로 처방전 사용기간, 필요한 약의 재고와 조제 접수 마감을 확인하세요.", "일반의약품 가격·결제수단은 해당 약국에 문의하세요."],
      summaryText: DISPENSING_COST_GUIDANCE,
    },
    keywordAnalysis: { visitorReviewCount: 0, blogReviewCount: 0, votedUserCount: 0, topKeywords: [], specialtyTags: [], sentimentSummary: "원문 출처·재사용 권한·집계 기간·사람 수와 선택 건수의 정의가 확인되지 않아 외부 리뷰와 비율은 표시하지 않습니다." },
    visitGuide: { transitStops: [], facilities: [], parkingNote: parking, regularClosedSummary: closed, actionableTips: template.bullets.slice(0, 3) },
    peerComparison: { regionLabel: [pharmacy.province, pharmacy.city].filter(Boolean).join(" "), weekdayDailyHours: avg, regionalAvgWeekdayHours: null, hasNightCare: night, hasWeekendCare: weekend, metrics: [], summaryText: "지역 비교의 표본·집계 기간·원본 기준일이 확인되지 않아 평균·순위·우수성 지표는 표시하지 않습니다. 아래 거리는 좌표 간 직선거리이며 실제 경로와 이동시간은 지도에서 확인하세요." },
    faq: template.faq.map(f => ({...f, category: "방문 확인"})),
  };
}

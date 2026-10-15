import type { Pharmacy } from "@/types/pharmacy";
import { withJosa } from "@/lib/korean-josa";
import { getMapSearchAddress } from "@/lib/map";
import { hasValidPhone } from "@/lib/pharmacy-indexability";
import {
  computeHoursProfile,
  summarizePeers,
  type HoursProfile,
} from "@/lib/pharmacy-hours-profile";

// v1 리포트는 관측값 없이 기본 수치(9시간·65% 등)와 휴무 추론을 포함할 수 있어
// 저장본을 신뢰하지 않는다. v2부터는 시간표 관련 문구를 매번 현재 원천 데이터로 다시 만든다.
export const INTELLIGENCE_REPORT_VERSION = 2;

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
  // 분모가 고유 이용자 수인지 투표 합계인지 구분한다.
  ratioBasis: "voters" | "votes";
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
  benchmark: string;
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

export type PharmacyIntelligenceReport = {
  version: typeof INTELLIGENCE_REPORT_VERSION;
  visualCategory: VisualCategory;
  briefing: { lines: string[]; highlights: string[] };
  costGuide: { summaryText: string; points: string[] };
  // 외부 장소 매칭이 확인된 경우에만 존재한다. 조회하지 못한 값은 null(0건 아님).
  reviewInsights: null | {
    visitorReviewCount: number | null;
    blogReviewCount: number | null;
    votedUserCount: number | null;
    topKeywords: KeywordMetric[];
    specialtyTags: string[];
    summaryText: string;
  };
  visitGuide: {
    transitStops: TransitStopInfo[];
    facilities: string[];
    parkingNote: string | null;
    closedNote: string | null;
    tips: string[];
  };
  // 표본이 충분할 때만 존재한다.
  peerComparison: null | {
    regionLabel: string;
    sampleSize: number;
    basisText: string;
    metrics: PeerComparisonMetric[];
  };
  faq: Array<{ question: string; answer: string; category: string }>;
  // 저장본에서 다시 만들 수 있도록 검증된 외부 입력만 보존한다.
  sourceExternal: RawExternalPlaceData | null;
};

const KEYWORD_CATEGORY_MAP: Record<string, KeywordMetric["category"]> = {
  친절해요: "service",
  "분위기가 편안해요": "service",
  "복약지도를 잘해줘요": "expertise",
  "상담이 자세해요": "expertise",
  "조제약 포장이 세심해요": "expertise",
  "매장이 청결해요": "facility",
  "매장이 넓어요": "facility",
  "대기공간이 잘 되어있어요": "facility",
  "주차하기 편해요": "facility",
  "가격이 합리적이에요": "price",
  "제품 종류가 다양해요": "price",
};

const GENERAL_TIPS = [
  "일반 안내: 등록 시간표와 실제 운영은 다를 수 있어 방문 전 전화로 영업 여부와 조제 마감 시각을 확인하세요.",
  "일반 안내: 공휴일·임시휴무는 등록 시간표에 반영되지 않았을 수 있습니다.",
  "일반 안내: 특정 처방약이나 상비약이 필요하면 재고를 먼저 문의하세요.",
];

const COST_GUIDE = {
  summaryText:
    "이 항목은 이 약국에 대해 확인된 정보가 아니라 일반 안내입니다. 야간·공휴일 조제에는 조제료 가산이 적용될 수 있으며, 적용 시간대와 항목은 건강보험 고시 기준을 따릅니다.",
  points: [
    "본인부담금은 약값, 조제 관련 비용, 본인부담률에 따라 달라집니다. 영수증의 세부 항목에서 확인할 수 있습니다.",
    "일반의약품과 건강기능식품은 비급여라 약국마다 판매가가 다를 수 있습니다.",
  ],
};

const isNonNegativeNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;

function optionalCount(v: unknown): number | null {
  return isNonNegativeNumber(v) ? v : null;
}

function scheduleText(p: HoursProfile): string {
  return [
    p.weekdayText,
    p.saturday.text,
    p.sunday.text,
    p.holiday.status === "registered" ? p.holiday.text : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildKeywords(external: RawExternalPlaceData): KeywordMetric[] {
  const raw = (external.votedKeywords ?? []).filter(
    (k) => isNonNegativeNumber(k.count) && k.count > 0,
  );
  const voters = optionalCount(external.votedUserCount);
  const votes = raw.reduce((sum, k) => sum + k.count, 0);
  const basis: KeywordMetric["ratioBasis"] =
    voters && voters > 0 ? "voters" : "votes";
  const denominator = basis === "voters" ? voters! : votes;
  return raw.slice(0, 7).map((k) => ({
    label: k.label,
    count: k.count,
    ratioPercent:
      denominator > 0
        ? Math.min(100, Math.round((k.count / denominator) * 100))
        : 0,
    ratioBasis: basis,
    category: KEYWORD_CATEGORY_MAP[k.label] ?? "service",
  }));
}

function buildReviewInsights(
  external: RawExternalPlaceData | null,
): PharmacyIntelligenceReport["reviewInsights"] {
  if (!external?.matched || !external.placeId) return null;
  const topKeywords = buildKeywords(external);
  const visitorReviewCount = optionalCount(external.visitorReviewCount);
  const blogReviewCount = optionalCount(external.blogReviewCount);
  const votedUserCount = optionalCount(external.votedUserCount);
  const specialtyTags = Array.from(
    new Set(external.specialtyKeywords ?? []),
  ).slice(0, 6);
  if (
    topKeywords.length === 0 &&
    visitorReviewCount === null &&
    blogReviewCount === null
  )
    return null;

  const top = topKeywords.slice(0, 2).map((k) => `'${k.label}'(${k.count}회)`);
  const summaryText =
    top.length > 0
      ? `외부 장소 정보에서 집계된 방문자 키워드 응답 중 ${top.join(", ")} 항목이 상위에 표시됩니다. 응답 수 집계이며 이 사이트가 직접 검증한 평가가 아닙니다.`
      : "외부 장소 정보에서 집계된 리뷰 수만 확인되었습니다.";
  return {
    visitorReviewCount,
    blogReviewCount,
    votedUserCount,
    topKeywords,
    specialtyTags,
    summaryText,
  };
}

function buildTransitStops(
  external: RawExternalPlaceData | null,
): TransitStopInfo[] {
  if (!external?.matched || !external.placeId) return [];
  return [
    ...(external.subwayStops ?? []).map((s) => ({
      name: s.exitInfo ? `${s.name} (${s.exitInfo})` : s.name,
      type: "subway" as const,
      walkMinutes: s.walkMinutes,
      walkMeters: s.walkMeters,
      routes: [],
    })),
    ...(external.busStops ?? []).map((b) => ({
      name: b.name,
      code: b.code ?? null,
      type: "bus" as const,
      walkMinutes: b.walkMinutes,
      walkMeters: b.walkMeters,
      routes: b.routes.slice(0, 8),
    })),
  ].slice(0, 4);
}

function pickVisualCategory(
  profile: HoursProfile,
  reviews: PharmacyIntelligenceReport["reviewInsights"],
): VisualCategory {
  if (profile.hasLateWeekday || profile.sunday.status === "registered")
    return "night_care";
  if (
    reviews?.topKeywords.some(
      (k) => k.category === "expertise" && k.count >= 10,
    )
  )
    return "consultation";
  return "neighborhood_care";
}

function buildPeerComparison(
  pharmacy: Pharmacy,
  profile: HoursProfile,
  regionLabel: string,
  peers?: Pharmacy[],
): PharmacyIntelligenceReport["peerComparison"] {
  const sample = summarizePeers(pharmacy, peers);
  if (!sample) return null;

  const metrics: PeerComparisonMetric[] = [];
  if (sample.avgWeekdayHours !== null && profile.weekdayAvgHours !== null) {
    metrics.push({
      metric: "평일 일평균 등록 운영시간",
      pharmacyValue: `일 ${profile.weekdayAvgHours}시간 (등록된 ${profile.weekdayKnownCount}일 기준)`,
      benchmark: `비교군 평균 ${sample.avgWeekdayHours}시간 (${sample.avgWeekdaySampleSize}곳)`,
    });
  }
  metrics.push(
    {
      metric: "토·일요일 시간표 등록",
      pharmacyValue:
        profile.saturday.status === "registered" ||
        profile.sunday.status === "registered"
          ? "등록됨"
          : "등록 없음(휴무 여부는 확인되지 않음)",
      benchmark: `비교군 ${sample.weekendRegisteredPercent}%가 등록`,
    },
    {
      metric: "평일 20시 이후 운영 등록",
      pharmacyValue: profile.hasLateWeekday ? "등록됨" : "등록 없음",
      benchmark: `비교군 ${sample.lateRegisteredPercent}%가 등록`,
    },
  );
  return {
    regionLabel,
    sampleSize: sample.sampleSize,
    basisText: `${regionLabel}에서 등록 시간표가 확인된 ${sample.sampleSize}곳(해당 약국 제외) 기준입니다. 지역 전체 약국의 비율이 아니며, 미등록 항목은 휴무로 계산하지 않았습니다.`,
    metrics,
  };
}

function buildFaq(
  pharmacy: Pharmacy,
  profile: HoursProfile,
  mapAddress: string,
  reviews: PharmacyIntelligenceReport["reviewInsights"],
  stops: TransitStopInfo[],
  parkingNote: string | null,
): PharmacyIntelligenceReport["faq"] {
  const faq: PharmacyIntelligenceReport["faq"] = [
    {
      category: "운영·방문",
      question: `${withJosa(pharmacy.name, "은/는")} 요일별 운영시간이 어떻게 되나요?`,
      answer: `등록된 시간표 기준으로 ${scheduleText(profile)}입니다. 공휴일·임시휴무·휴게시간은 반영되지 않았을 수 있어 방문 전 전화(${
        hasValidPhone(pharmacy.tel) ? pharmacy.tel : "번호 미등록"
      })로 확인하세요.`,
    },
    {
      category: "비용",
      question: "야간이나 공휴일에 이용하면 조제료가 달라지나요?",
      answer: `${COST_GUIDE.summaryText} ${COST_GUIDE.points[0]}`,
    },
  ];

  if (reviews && reviews.topKeywords.length > 0) {
    faq.push({
      category: "이용자 응답",
      question: `${pharmacy.name}의 방문자 키워드 응답은 어떤가요?`,
      answer: `${reviews.summaryText} 응답 수 기준이며 고유 이용자 수와 다를 수 있습니다.`,
    });
  }

  const nearest = stops[0];
  faq.push({
    category: "교통·주차",
    question: `${withJosa(pharmacy.name, "으로/로")} 찾아가려면 어떻게 하나요?`,
    answer: nearest
      ? `외부 장소 정보 기준 가장 가까운 정류장은 '${nearest.name}'이며 도보 약 ${nearest.walkMinutes}분(${nearest.walkMeters}m)입니다.${parkingNote ? ` ${parkingNote}` : ""}`
      : `도로명 주소 '${mapAddress}'로 길찾기를 이용할 수 있습니다. 주차 가능 여부는 확인된 정보가 없어 방문 전 문의가 필요합니다.`,
  });
  return faq;
}

export function buildPharmacyIntelligenceReport(
  pharmacy: Pharmacy,
  external?: RawExternalPlaceData | null,
  peerPharmacies?: Pharmacy[],
): PharmacyIntelligenceReport {
  const profile = computeHoursProfile(pharmacy.operating_hours);
  const mapAddress = getMapSearchAddress(pharmacy.address) || pharmacy.address;
  const regionLabel =
    [pharmacy.province, pharmacy.city].filter(Boolean).join(" ") || "해당 지역";
  const verified = external?.matched && external.placeId ? external : null;

  const reviews = buildReviewInsights(verified);
  const transitStops = buildTransitStops(verified);
  const facilities = Array.from(
    new Set([
      ...(verified?.facilities ?? []),
      ...(verified?.hasNPay ? ["네이버페이 결제"] : []),
      ...(verified?.hasWheelchairEntrance ? ["휠체어 출입 가능"] : []),
    ]),
  );
  const parkingNote = verified?.parkingInfo?.trim() || null;
  const closedNote = verified?.regularClosedDays?.trim() || null;

  const nearest = transitStops[0];
  const phone = hasValidPhone(pharmacy.tel) ? pharmacy.tel : null;
  const lines = [
    `${withJosa(pharmacy.name, "은/는")} ${regionLabel}(${mapAddress})에 등록된 약국입니다. 등록 시간표 기준 ${scheduleText(profile)}.`,
    reviews && reviews.topKeywords.length > 0
      ? reviews.summaryText
      : "등록 시간표는 공공데이터 등록 값이며 실제 운영과 다를 수 있어 방문 전 전화 확인이 필요합니다.",
    nearest
      ? `외부 장소 정보 기준 ${nearest.name}에서 도보 약 ${nearest.walkMinutes}분(${nearest.walkMeters}m)입니다.${phone ? ` 문의 전화 ${phone}.` : ""}`
      : `도로명 주소 '${mapAddress}'로 길찾기가 가능합니다.${phone ? ` 문의 전화 ${phone}.` : ""}`,
  ];

  const highlights = [
    profile.hasLateWeekday
      ? "평일 20시 이후 운영 등록"
      : profile.hasEveningWeekday
        ? "평일 18시 이후 운영 등록"
        : null,
    profile.saturday.status === "registered" ? "토요일 시간표 등록" : null,
    profile.sunday.status === "registered" ? "일요일 시간표 등록" : null,
    profile.holiday.status === "registered" ? "공휴일 시간표 등록" : null,
    ...facilities.slice(0, 2),
  ]
    .filter((h): h is string => Boolean(h))
    .slice(0, 5);

  return {
    version: INTELLIGENCE_REPORT_VERSION,
    visualCategory: pickVisualCategory(profile, reviews),
    briefing: {
      lines,
      highlights: highlights.length > 0 ? highlights : ["등록 시간표 기준"],
    },
    costGuide: COST_GUIDE,
    reviewInsights: reviews,
    visitGuide: {
      transitStops,
      facilities,
      parkingNote,
      closedNote,
      tips: GENERAL_TIPS,
    },
    peerComparison: buildPeerComparison(
      pharmacy,
      profile,
      regionLabel,
      peerPharmacies,
    ),
    faq: buildFaq(
      pharmacy,
      profile,
      mapAddress,
      reviews,
      transitStops,
      parkingNote,
    ),
    sourceExternal: verified,
  };
}

const VISUAL_CATEGORIES: VisualCategory[] = [
  "consultation",
  "night_care",
  "transit_hub",
  "neighborhood_care",
  "specialty_care",
];

function sanitizeExternal(value: unknown): RawExternalPlaceData | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<RawExternalPlaceData>;
  if (v.matched !== true || typeof v.placeId !== "string" || !v.placeId)
    return null;
  const arr = <T>(x: T[] | undefined) => (Array.isArray(x) ? x : []);
  return {
    matched: true,
    placeId: v.placeId,
    visitorReviewCount: optionalCount(v.visitorReviewCount) ?? undefined,
    blogReviewCount: optionalCount(v.blogReviewCount) ?? undefined,
    votedUserCount: optionalCount(v.votedUserCount) ?? undefined,
    votedKeywords: arr(v.votedKeywords).filter(
      (k) => typeof k?.label === "string" && isNonNegativeNumber(k.count),
    ),
    busStops: arr(v.busStops).filter(
      (b) =>
        typeof b?.name === "string" &&
        isNonNegativeNumber(b.walkMinutes) &&
        isNonNegativeNumber(b.walkMeters) &&
        Array.isArray(b.routes),
    ),
    subwayStops: arr(v.subwayStops).filter(
      (s) =>
        typeof s?.name === "string" &&
        isNonNegativeNumber(s.walkMinutes) &&
        isNonNegativeNumber(s.walkMeters),
    ),
    facilities: arr(v.facilities).filter((f) => typeof f === "string"),
    parkingInfo: typeof v.parkingInfo === "string" ? v.parkingInfo : null,
    hasNPay: v.hasNPay === true,
    hasWheelchairEntrance: v.hasWheelchairEntrance === true,
    regularClosedDays:
      typeof v.regularClosedDays === "string" ? v.regularClosedDays : null,
    specialtyKeywords: arr(v.specialtyKeywords).filter(
      (s) => typeof s === "string",
    ),
  };
}

// 저장된 리포트는 v2이고 구조가 유효할 때만 통과시킨다. 통과해도 본문은 쓰지 않고
// 검증된 외부 입력(sourceExternal)만 꺼내 현재 원천 데이터로 리포트를 다시 만든다.
export function parseStoredIntelligenceReport(
  value: unknown,
): PharmacyIntelligenceReport | null {
  try {
    if (!value || typeof value !== "object") return null;
    const v = value as Partial<PharmacyIntelligenceReport>;
    if (v.version !== INTELLIGENCE_REPORT_VERSION) return null;
    if (!VISUAL_CATEGORIES.includes(v.visualCategory as VisualCategory))
      return null;
    if (!Array.isArray(v.briefing?.lines) || !Array.isArray(v.faq)) return null;
    return {
      ...(v as PharmacyIntelligenceReport),
      sourceExternal: sanitizeExternal(v.sourceExternal),
    };
  } catch {
    return null;
  }
}

// 상세 페이지·메타데이터·JSON-LD가 같은 리포트를 쓰도록 하는 단일 진입점.
export function resolvePharmacyReport(
  pharmacy: Pharmacy,
  peers?: Pharmacy[],
): PharmacyIntelligenceReport {
  const stored = parseStoredIntelligenceReport(pharmacy.intelligence_report);
  return buildPharmacyIntelligenceReport(
    pharmacy,
    stored?.sourceExternal ?? null,
    peers,
  );
}

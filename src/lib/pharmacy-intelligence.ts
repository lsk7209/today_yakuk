import type { OperatingHours, Pharmacy } from "@/types/pharmacy";
import { formatHourRange, hhmmToMinutes } from "@/lib/hours";
import { withJosa } from "@/lib/korean-josa";
import { getMapSearchAddress } from "@/lib/map";

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
    regionalAvgWeekdayHours: number;
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

const KEYWORD_CATEGORY_MAP: Record<string, KeywordMetric["category"]> = {
  "친절해요": "service",
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

function computeWeekdayHoursStats(hours?: OperatingHours | null): {
  avgDailyHours: number | null;
  earliestOpen: string | null;
  latestClose: string | null;
  hasEveningAfter18: boolean;
  hasNightAfter20: boolean;
  hasSaturday: boolean;
  hasSunday: boolean;
  hasHoliday: boolean;
  weekdayRangeLabel: string;
} {
  if (!hours) {
    return {
      avgDailyHours: null,
      earliestOpen: null,
      latestClose: null,
      hasEveningAfter18: false,
      hasNightAfter20: false,
      hasSaturday: false,
      hasSunday: false,
      hasHoliday: false,
      weekdayRangeLabel: "평일 정규 시간표 미등록",
    };
  }

  const weekdayKeys = ["mon", "tue", "wed", "thu", "fri"] as const;
  const durations: number[] = [];
  let earliestMin: number | null = null;
  let latestMin: number | null = null;
  let earliestOpen: string | null = null;
  let latestClose: string | null = null;

  for (const key of weekdayKeys) {
    const slot = hours[key];
    const o = hhmmToMinutes(slot?.open);
    const c = hhmmToMinutes(slot?.close, true);
    if (o !== null && c !== null && c > o) {
      durations.push((c - o) / 60);
      if (earliestMin === null || o < earliestMin) {
        earliestMin = o;
        earliestOpen = slot?.open ?? null;
      }
      if (latestMin === null || c > latestMin) {
        latestMin = c;
        latestClose = slot?.close ?? null;
      }
    }
  }

  const satOpen = hhmmToMinutes(hours.sat?.open);
  const satClose = hhmmToMinutes(hours.sat?.close, true);
  const hasSaturday = satOpen !== null && satClose !== null && satClose > satOpen;

  const sunOpen = hhmmToMinutes(hours.sun?.open);
  const sunClose = hhmmToMinutes(hours.sun?.close, true);
  const hasSunday = sunOpen !== null && sunClose !== null && sunClose > sunOpen;

  const holOpen = hhmmToMinutes(hours.holiday?.open);
  const holClose = hhmmToMinutes(hours.holiday?.close, true);
  const hasHoliday = holOpen !== null && holClose !== null && holClose > holOpen;

  const avgDailyHours =
    durations.length > 0
      ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
      : null;

  const firstWeekdaySlot = weekdayKeys.map((k) => hours[k]).find((s) => {
    const o = hhmmToMinutes(s?.open);
    const c = hhmmToMinutes(s?.close, true);
    return o !== null && c !== null && c > o;
  });

  const weekdayRangeLabel = firstWeekdaySlot
    ? `평일 ${formatHourRange(firstWeekdaySlot)}`
    : "평일 정규 시간표 미등록";

  return {
    avgDailyHours,
    earliestOpen,
    latestClose,
    hasEveningAfter18: latestMin !== null && latestMin > 18 * 60,
    hasNightAfter20: latestMin !== null && latestMin >= 20 * 60,
    hasSaturday,
    hasSunday,
    hasHoliday,
    weekdayRangeLabel,
  };
}

export function buildPharmacyIntelligenceReport(
  pharmacy: Pharmacy,
  external?: RawExternalPlaceData | null,
  peerPharmacies?: Pharmacy[],
): PharmacyIntelligenceReport {
  const stats = computeWeekdayHoursStats(pharmacy.operating_hours);
  const mapAddress = getMapSearchAddress(pharmacy.address) || pharmacy.address;
  const regionLabel = [pharmacy.province, pharmacy.city].filter(Boolean).join(" ") || "해당 지역";

  const visitorReviewCount = external?.visitorReviewCount ?? 0;
  const blogReviewCount = external?.blogReviewCount ?? 0;
  const totalReviews = visitorReviewCount + blogReviewCount;
  const votedUserCount = external?.votedUserCount ?? 0;

  const rawKeywords = external?.votedKeywords ?? [];
  const totalKeywordVotes = rawKeywords.reduce((sum, item) => sum + item.count, 0);

  const topKeywords: KeywordMetric[] = rawKeywords
    .filter((k) => k.count > 0)
    .slice(0, 7)
    .map((k) => ({
      label: k.label,
      count: k.count,
      ratioPercent:
        votedUserCount > 0
          ? Math.min(100, Math.round((k.count / votedUserCount) * 100))
          : totalKeywordVotes > 0
            ? Math.min(100, Math.round((k.count / totalKeywordVotes) * 100))
            : 0,
      category: KEYWORD_CATEGORY_MAP[k.label] ?? "service",
    }));

  const priceKeyword = topKeywords.find((k) => k.label === "가격이 합리적이에요");
  const varietyKeyword = topKeywords.find((k) => k.label === "제품 종류가 다양해요");

  const specialtyTags = Array.from(
    new Set([
      ...(external?.specialtyKeywords ?? []),
      ...(stats.hasNightAfter20 ? ["야간 운영"] : []),
      ...(stats.hasSaturday ? ["토요일 운영"] : []),
      ...(stats.hasSunday ? ["일요일 운영"] : []),
      ...(topKeywords.some((k) => k.category === "expertise" && k.count >= 5)
        ? ["복약상담 특화"]
        : []),
    ]),
  ).slice(0, 6);

  const transitStops: TransitStopInfo[] = [
    ...(external?.subwayStops ?? []).map((s) => ({
      name: s.exitInfo ? `${s.name} (${s.exitInfo})` : s.name,
      type: "subway" as const,
      walkMinutes: s.walkMinutes,
      walkMeters: s.walkMeters,
      routes: [],
    })),
    ...(external?.busStops ?? []).map((b) => ({
      name: b.name,
      code: b.code ?? null,
      type: "bus" as const,
      walkMinutes: b.walkMinutes,
      walkMeters: b.walkMeters,
      routes: b.routes.slice(0, 8),
    })),
  ].slice(0, 4);

  const facilities = Array.from(
    new Set([
      ...(external?.facilities ?? []),
      ...(external?.hasNPay ? ["네이버페이 결제"] : []),
      ...(external?.hasWheelchairEntrance ? ["휠체어 출입 가능"] : []),
    ]),
  );

  // Determine Visual Category for SVG illustration
  let visualCategory: VisualCategory = "neighborhood_care";
  if (stats.hasNightAfter20 || stats.hasSunday) {
    visualCategory = "night_care";
  } else if (topKeywords.some((k) => k.category === "expertise" && k.count >= 10)) {
    visualCategory = "consultation";
  } else if (transitStops.some((t) => t.walkMinutes <= 4)) {
    visualCategory = "transit_hub";
  } else if (specialtyTags.length >= 2) {
    visualCategory = "specialty_care";
  }

  // 1. Briefing (핵심 3줄 요약 브리핑)
  const scheduleHighlight = [
    stats.weekdayRangeLabel,
    stats.hasSaturday
      ? `토요일 ${formatHourRange(pharmacy.operating_hours?.sat)}`
      : "토요일 휴무·미등록",
    stats.hasSunday
      ? `일요일 ${formatHourRange(pharmacy.operating_hours?.sun)}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  const line1 = `${withJosa(pharmacy.name, "은/는")} ${regionLabel}(${mapAddress}) 거점 약국으로, 정규 일정 기준 ${scheduleHighlight} 체계로 운영됩니다.`;

  const line2 =
    topKeywords.length > 0
      ? `누적 리뷰 ${totalReviews.toLocaleString()}건 및 참여자 키워드 분석 결과 '${topKeywords
          .slice(0, 3)
          .map((k) => k.label)
          .join("', '")}' 항목에서 높은 체감 응답이 확인됩니다.`
      : `처방 조제와 일반의약품 상담을 함께 취급하며, 평일 하루 평균 ${
          stats.avgDailyHours ?? 9
        }시간 동안 지역 주민의 복약 상담을 지원합니다.`;

  const nearestStop = transitStops[0];
  const line3 = nearestStop
    ? `${nearestStop.name}에서 도보 약 ${nearestStop.walkMinutes}분(${nearestStop.walkMeters}m) 거리에 위치해 대중교통 접근성이 우수하며, 마감 직전 방문 시 전화(${pharmacy.tel || "유선"}) 확인이 권장됩니다.`
    : `도로명 주소 '${mapAddress}' 기준으로 차량·도보 길찾기가 가능하며, 주말·공휴일이나 마감 시간대 방문 전에는 유선 확인이 안전합니다.`;

  const highlights: string[] = [
    stats.hasNightAfter20 ? "평일 야간 운영" : stats.hasEveningAfter18 ? "퇴근 시간대 운영" : "주간 정규 운영",
    stats.hasSunday ? "일요일 운영" : stats.hasSaturday ? "토요일 운영" : "평일 집중 운영",
    ...(topKeywords[0] ? [`체감 1위: ${topKeywords[0].label}`] : []),
    ...(nearestStop ? [`대중교통 도보 ${nearestStop.walkMinutes}분`] : []),
    ...facilities.slice(0, 2),
  ].slice(0, 5);

  // 2. Cost & Price Analysis (가격 및 비용 분석)
  const standardWindowText =
    stats.avgDailyHours !== null
      ? "평일 09:00 ~ 18:00, 토요일 09:00 ~ 13:00 구간은 국민건강보험 표준 조제 수가가 적용됩니다."
      : "평일 주간(09:00 ~ 18:00) 및 토요일 오전(09:00 ~ 13:00) 방문 시 기본 조제료 기준이 적용됩니다.";

  const surchargeWindowText =
    stats.hasEveningAfter18 || stats.hasSaturday || stats.hasSunday || stats.hasHoliday
      ? `${[
          stats.hasEveningAfter18
            ? `평일 18:00 이후 마감(${formatHourRange(pharmacy.operating_hours?.mon).split(" - ")[1] || "마감"})까지`
            : null,
          stats.hasSaturday ? "토요일 13:00 이후" : null,
          stats.hasSunday ? "일요일 전 시간대" : null,
          stats.hasHoliday ? "공휴일 운영 시간대" : null,
        ]
          .filter(Boolean)
          .join(" · ")} 조제 시 건강보험 규정상 야간·휴일 조제 가산(기본 조제료의 30%)이 적용됩니다.`
      : "정규 운영시간이 평일 주간 시간대에 집중되어 있어 야간 조제 가산 없이 표준 조제 수가로 이용할 수 있습니다.";

  const paymentAndCostPoints: string[] = [
    `처방전 조제 비용: 건강보험 급여 처방은 전국 약국 동일 수가 기준을 따르며, ${
      stats.hasEveningAfter18 || stats.hasSunday
        ? "18시 이후 및 휴일 방문 시에만 법정 가산율(30%)이 반영됩니다."
        : "주간 정규 시간대 방문 시 표준 본인부담금이 적용됩니다."
    }`,
    priceKeyword || varietyKeyword
      ? `일반의약품·건기식 체감 지표: 방문자 키워드 중 ${[
          priceKeyword ? `'가격이 합리적이에요'(${priceKeyword.count}명)` : null,
          varietyKeyword ? `'제품 종류가 다양해요'(${varietyKeyword.count}명)` : null,
        ]
          .filter(Boolean)
          .join(", ")} 응답이 축적되어 비급여 상비약 선택 폭이 긍정적으로 평가됩니다.`
      : "일반의약품·상비약 구매: 해열진통제, 소화제, 외용제 등 비급여 일반의약품과 건강기능식품은 동일 성분군 내 복수 제형 비교 상담 후 선택할 수 있습니다.",
    external?.hasNPay || facilities.length > 0
      ? `결제 및 이용 편의: 신용·체크카드와 현금 결제 외에 ${
          facilities.length > 0 ? facilities.join(", ") : "모바일 간편결제"
        } 환경을 지원합니다.`
      : "결제 수단 참고: 처방 조제 및 일반의약품 구매 시 신용·체크카드 결제가 가능하며, 지역화폐·온누리상품권 가맹 여부는 방문 시 확인하는 것이 정확합니다.",
  ];

  const costSummaryText = `${withJosa(pharmacy.name, "은/는")} 건강보험 급여 처방 조제와 비급여 일반의약품을 함께 취급합니다. ${surchargeWindowText}`;

  // 3. Keyword Analysis (이용자 체감 키워드 분석)
  let sentimentSummary: string;
  if (topKeywords.length > 0) {
    const top1 = topKeywords[0]!;
    const top2 = topKeywords[1];
    const expertiseCount = topKeywords
      .filter((k) => k.category === "expertise")
      .reduce((acc, cur) => acc + cur.count, 0);
    sentimentSummary = `누적 참여자 ${
      votedUserCount || totalKeywordVotes
    }명의 체감 평가에서 '${top1.label}'(${top1.count}회)${
      top2 ? `와 '${top2.label}'(${top2.count}회)` : ""
    } 항목이 가장 높은 비중을 차지했습니다. ${
      expertiseCount > 0
        ? `특히 복약지도와 상세 상담 등 약사 전문성 관련 긍정 응답이 ${expertiseCount}건 이상 집계되어 초진 처방이나 다제 복용 상담 시 활용도가 높습니다.`
        : "매장 응대 친절도와 쾌적한 조제 대기 환경에서 안정적인 이용 만족도를 보이고 있습니다."
    }`;
  } else {
    sentimentSummary = `${withJosa(pharmacy.name, "은/는")} ${regionLabel} 생활권 내 처방 조제 및 상비약 공급 역할을 수행하고 있습니다. 정규 운영시간표를 기반으로 인근 병·의원 외래 처방과 일상 상비약 수요에 대응합니다.`;
  }

  // 4. Visit Guide (방문 및 이용 실전 가이드)
  const parkingNote =
    external?.parkingInfo?.trim() ||
    (facilities.some((f) => f.includes("주차"))
      ? "약국 건물 또는 연계 주차 공간 이용이 가능하나, 혼잡 시간대에는 인근 공영주차장 병행 확인이 권장됩니다."
      : "도심 상가 입지 특성상 전용 주차면이 제한적일 수 있으므로 대중교통 또는 인근 노상·공영주차장 이용이 편리합니다.");

  const regularClosedSummary =
    external?.regularClosedDays?.trim() ||
    (!stats.hasSunday && !stats.hasSaturday
      ? "매주 토·일요일 및 법정 공휴일 정기 휴무"
      : !stats.hasSunday
        ? "매주 일요일 정기 휴무 (토요일 단축 운영)"
        : "연중 운영 체계 (요일별 상세 시간표 참조)");

  const actionableTips: string[] = [
    nearestStop
      ? `대중교통 하차 포인트: ${nearestStop.name}${
          nearestStop.code ? `(${nearestStop.code})` : ""
        } 정류장에서 하차 후 도보 약 ${nearestStop.walkMinutes}분(${nearestStop.walkMeters}m) 이동하면 가장 빠르게 도착합니다.`
      : `내비게이션 검색 팁: 상세 호수를 제외한 '${mapAddress}' 주소로 검색하면 건물 진입로까지 정확히 안내됩니다.`,
    stats.hasEveningAfter18
      ? `퇴근 시간대 방문 팁: 평일 18시 이후에도 운영하지만 조제 마감 15~20분 전에는 처방전 접수가 조기 마감될 수 있으므로 늦은 시간 방문 시 유선 확인이 안전합니다.`
      : `외래 집중 시간대 참고: 인근 병·의원 진료가 몰리는 오전 10~12시 및 오후 14~16시 외 시간대를 이용하면 조제 대기 시간을 줄일 수 있습니다.`,
    specialtyTags.length > 0
      ? `특화 취급 품목 확인: ${specialtyTags.join(", ")} 관련 수요가 있는 경우 재고 소진 여부를 출발 전 전화(${pharmacy.tel || "약국 번호"})로 문의하면 헛걸음을 예방할 수 있습니다.`
      : `처방약 재고 문의: 희귀 전문의약품이나 소아 시럽제·안약 등 특정 제약사 품목 조제가 필요한 경우 방문 전 재고 유무를 문의해 주세요.`,
  ];

  // 5. Peer Comparison (주변 동종 업계 비교 지표)
  let regionalAvgWeekdayHours = 9.5;
  let regionalWeekendRate = 65;
  let regionalNightRate = 28;

  if (peerPharmacies && peerPharmacies.length > 1) {
    const peerStats = peerPharmacies
      .map((p) => computeWeekdayHoursStats(p.operating_hours))
      .filter((s) => s.avgDailyHours !== null);
    if (peerStats.length > 0) {
      const avg =
        peerStats.reduce((sum, s) => sum + (s.avgDailyHours ?? 0), 0) / peerStats.length;
      regionalAvgWeekdayHours = Math.round(avg * 10) / 10;
      regionalWeekendRate = Math.round(
        (peerStats.filter((s) => s.hasSaturday || s.hasSunday).length / peerStats.length) * 100,
      );
      regionalNightRate = Math.round(
        (peerStats.filter((s) => s.hasNightAfter20).length / peerStats.length) * 100,
      );
    }
  }

  const myDailyHours = stats.avgDailyHours ?? 9.0;
  const hoursDiff = Math.round((myDailyHours - regionalAvgWeekdayHours) * 10) / 10;

  const peerMetrics: PeerComparisonMetric[] = [
    {
      metric: "평일 일평균 운영시간",
      pharmacyValue: stats.avgDailyHours ? `일 ${stats.avgDailyHours}시간` : "표준 주간 운영",
      regionalBenchmark: `${regionLabel} 평균 ${regionalAvgWeekdayHours}시간`,
      verdict:
        hoursDiff >= 1
          ? `지역 평균 대비 +${hoursDiff}시간 폭넓은 운영`
          : hoursDiff <= -1
            ? `주간 집중형 운영 체계`
            : `지역 표준 운영시간 수준`,
      scorePercent: Math.min(100, Math.max(35, Math.round((myDailyHours / 13) * 100))),
    },
    {
      metric: "주말·휴일 접근성",
      pharmacyValue:
        stats.hasSaturday && stats.hasSunday
          ? "토·일요일 모두 운영"
          : stats.hasSaturday
            ? "토요일 운영"
            : stats.hasSunday
              ? "일요일 운영"
              : "평일 전용 운영",
      regionalBenchmark: `지역 내 주말 운영 비율 약 ${regionalWeekendRate}%`,
      verdict:
        stats.hasSaturday && stats.hasSunday
          ? "주말 양일 모두 방문 가능한 상위권 접근성"
          : stats.hasSaturday || stats.hasSunday
            ? "주말 단축 운영으로 휴일 상비약 수요 대응"
            : "주말 방문 시 반경 2km 대체 약국 확인 권장",
      scorePercent: stats.hasSaturday && stats.hasSunday ? 95 : stats.hasSaturday || stats.hasSunday ? 72 : 40,
    },
    {
      metric: "야간 조제 대응력 (20시 이후)",
      pharmacyValue: stats.hasNightAfter20
        ? "20시 이후 야간 운영"
        : stats.hasEveningAfter18
          ? "18~20시 초저녁 운영"
          : "18시 이전 주간 마감",
      regionalBenchmark: `지역 내 야간 운영 비율 약 ${regionalNightRate}%`,
      verdict: stats.hasNightAfter20
        ? "퇴근 이후 심야·야간 처방 조제 가능"
        : stats.hasEveningAfter18
          ? "일반 직장인 퇴근 시간대 방문 가능"
          : "오전·오후 외래 진료 시간대 특화",
      scorePercent: stats.hasNightAfter20 ? 92 : stats.hasEveningAfter18 ? 68 : 45,
    },
    {
      metric: "대중교통 및 이용 체감 데이터",
      pharmacyValue:
        nearestStop
          ? `정류장 도보 ${nearestStop.walkMinutes}분 · 리뷰 ${totalReviews}건`
          : `누적 리뷰 ${totalReviews}건 · 도로변 접근`,
      regionalBenchmark: "도보 5분 이내 정류장 인접 기준",
      verdict:
        nearestStop && nearestStop.walkMinutes <= 4
          ? "버스·지하철 하차 후 즉시 진입 가능한 역세권·정류장권"
          : "인근 생활권 도보 및 차량 방문에 적합",
      scorePercent:
        nearestStop && nearestStop.walkMinutes <= 3
          ? 94
          : nearestStop && nearestStop.walkMinutes <= 6
            ? 80
            : 65,
    },
  ];

  const peerSummaryText = `${regionLabel} 내 동종 약국(일평균 ${regionalAvgWeekdayHours}시간 운영)과 비교했을 때, ${withJosa(
    pharmacy.name,
    "은/는",
  )} ${
    hoursDiff >= 0.5
      ? `평일 일평균 ${myDailyHours}시간을 운영하여 지역 평균보다 여유 있는 방문 시간대를 제공합니다.`
      : `안정적인 정규 시간표 기반으로 운영되고 있습니다.`
  }`;

  // 6. Q/A Card-Style FAQ with automatic Korean Josa (받침 유무에 따른 은/는, 이/가 조사 자동 처리)
  const faq: PharmacyIntelligenceReport["faq"] = [
    {
      category: "운영·방문",
      question: `${withJosa(pharmacy.name, "은/는")} 평일과 주말 정규 운영시간이 어떻게 되나요?`,
      answer: `${withJosa(pharmacy.name, "이/가")} 등록한 정규 운영 일정은 ${scheduleHighlight}입니다. 정기 휴무 기준은 '${regularClosedSummary}'이며, 방문 전 유선(${
        pharmacy.tel || "약국 전화"
      })으로 당일 휴게시간 여부를 확인하면 더욱 정확합니다.`,
    },
    {
      category: "비용·수가",
      question: `${withJosa(pharmacy.name, "을/를")} 이용할 때 야간·휴일 조제료 가산이 붙는 시간대는 언제인가요?`,
      answer: `${standardWindowText} 반면 ${surchargeWindowText}`,
    },
    {
      category: "체감·특징",
      question: `실제 방문자들이 평가한 ${pharmacy.name}의 주요 장점은 무엇인가요?`,
      answer:
        topKeywords.length > 0
          ? `이용자 체감 키워드 분석에서는 '${topKeywords
              .slice(0, 3)
              .map((k) => `${k.label}(${k.count}명)`)
              .join("', '")}' 응답이 두드러집니다. ${
              specialtyTags.length > 0
                ? `또한 ${specialtyTags.join(", ")} 등의 특화 영역에서도 활용도가 높습니다.`
                : ""
            }`
          : `${withJosa(pharmacy.name, "은/는")} ${regionLabel} 거점 약국으로 처방 조제와 상비 일반의약품 복약 상담을 체계적으로 제공하고 있습니다.`,
    },
    {
      category: "교통·주차",
      question: `${withJosa(pharmacy.name, "으로/로")} 찾아갈 때 대중교통 정류장과 주차 여건은 어떤가요?`,
      answer: nearestStop
        ? `가장 가까운 대중교통 거점은 '${nearestStop.name}'이며 도보 약 ${nearestStop.walkMinutes}분(${nearestStop.walkMeters}m) 거리입니다.${
            nearestStop.routes.length > 0
              ? ` 경유 노선으로는 ${nearestStop.routes.slice(0, 5).join(", ")}번 등이 있습니다.`
              : ""
          } ${parkingNote}`
        : `도로명 주소 '${mapAddress}'를 기준으로 방문할 수 있습니다. ${parkingNote}`,
    },
  ];

  return {
    version: 1,
    visualCategory,
    briefing: {
      lines: [line1, line2, line3],
      highlights,
    },
    costAnalysis: {
      standardWindowText,
      surchargeWindowText,
      priceSentimentRatio: priceKeyword?.ratioPercent ?? null,
      varietySentimentRatio: varietyKeyword?.ratioPercent ?? null,
      paymentAndCostPoints,
      summaryText: costSummaryText,
    },
    keywordAnalysis: {
      visitorReviewCount,
      blogReviewCount,
      votedUserCount,
      topKeywords,
      specialtyTags,
      sentimentSummary,
    },
    visitGuide: {
      transitStops,
      facilities,
      parkingNote,
      regularClosedSummary,
      actionableTips,
    },
    peerComparison: {
      regionLabel,
      weekdayDailyHours: stats.avgDailyHours,
      regionalAvgWeekdayHours,
      hasNightCare: stats.hasNightAfter20,
      hasWeekendCare: stats.hasSaturday || stats.hasSunday,
      metrics: peerMetrics,
      summaryText: peerSummaryText,
    },
    faq,
  };
}

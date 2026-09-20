import type { Pharmacy } from "@/types/pharmacy";
import { formatHourRange, hhmmToMinutes } from "@/lib/hours";
import { getMapSearchAddress } from "@/lib/map";

export type DetailFaq = { question: string; answer: string };
export type DetailSection = { title: string; body: string };

export type DetailTemplate = {
  summary: string;
  bullets: string[];
  usageGuide: string;
  extraSections: DetailSection[];
  faq: DetailFaq[];
};

function extractDong(address?: string | null): string | null {
  if (!address) return null;
  const parts = address.split(" ");
  const found = parts.find((p) => p.endsWith("동") || p.endsWith("가"));
  return found ?? null;
}

function slotText(slot?: { open: string | null; close: string | null } | null) {
  return formatHourRange(slot ?? undefined);
}

function hasHours(slot?: { open: string | null; close: string | null } | null) {
  const open = hhmmToMinutes(slot?.open);
  const close = hhmmToMinutes(slot?.close, true);
  return open !== null && close !== null && open !== close;
}

function analyzePattern(pharmacy: Pharmacy) {
  const h = pharmacy.operating_hours ?? null;
  if (!h) {
    return {
      weekend: "주말 운영 정보 없음",
      holiday: "공휴일 운영 정보 없음",
      weekday: "평일 운영 정보 없음",
    };
  }

  const sat = h.sat;
  const sun = h.sun;
  const hol = h["holiday"];
  const mon = h.mon;
  const tue = h.tue;
  const wed = h.wed;
  const thu = h.thu;
  const fri = h.fri;

  const weekdaySlots = [mon, tue, wed, thu, fri];
  const knownWeekday = weekdaySlots.filter((s) => hasHours(s));
  const weekday =
    knownWeekday.length === 0
      ? "평일 운영 정보 없음"
      : (() => {
          // 대표적으로 월~금 중 첫 번째를 보여주되, “대부분 동일” 여부를 함께 표기
          const first = knownWeekday[0]!;
          const firstText = slotText(first);
          const allSame = knownWeekday.length === 5 && knownWeekday.every((s) => slotText(s) === firstText);
          return allSame ? `평일(월~금) ${firstText}` : `평일은 요일별로 다를 수 있음(예: ${firstText})`;
        })();

  const weekend =
    hasHours(sat) && hasHours(sun)
      ? `주말 운영(토 ${slotText(sat)}, 일 ${slotText(sun)})`
      : hasHours(sat) && !hasHours(sun)
        ? `주말 운영(토 ${slotText(sat)}), 일요일은 정보 없음/휴무 가능`
        : !hasHours(sat) && hasHours(sun)
          ? `주말 운영(일 ${slotText(sun)}), 토요일은 정보 없음/휴무 가능`
          : "주말 운영 정보 없음";

  const holiday = hasHours(hol) ? `공휴일 ${slotText(hol)}` : "공휴일 운영 정보 없음";

  return { weekday, weekend, holiday };
}

export function buildAiLessDetailTemplate(pharmacy: Pharmacy): DetailTemplate {
  const mapAddress = getMapSearchAddress(pharmacy.address);
  const dong = extractDong(pharmacy.address);
  const region = [pharmacy.province, pharmacy.city, dong].filter(Boolean).join(" ");
  const pattern = analyzePattern(pharmacy);

  // Cached descriptions and FAQ must not freeze a transient "current" status.
  const summary = [
    `${pharmacy.name}${region ? `(${region})` : ""}은(는) ${mapAddress || "해당 지역"}에 위치한 약국입니다.`,
    `등록된 운영 일정은 ${pattern.weekday}입니다.`,
    `운영시간은 변동될 수 있어 방문 전 전화로 확인하면 헛걸음을 줄일 수 있습니다.`,
  ].join(" ");

  // 2) bullets: 값 기반(약국마다 달라지는 요소를 넣어 중복도를 낮춤)
  const bullets = [
    `요일별 영업시간과 시간표 기준 상태는 이 페이지의 운영 안내에서 확인하세요.`,
    `운영 패턴 요약: ${pattern.weekday} · ${pattern.weekend} · ${pattern.holiday}`,
    `길찾기 검색어 팁: 주소는 '${mapAddress || "정보 없음"}'처럼 콤마(,) 뒤 상세 호수를 제외하면 더 잘 잡힙니다.`,
    `전화 문의 포인트: 운영 여부, 점심시간/휴게시간, 주말·공휴일 운영은 변동 가능성이 있어 확인이 필요합니다.`,
  ];

  // 3) usage guide: 상태 기반 체크리스트
  const usageGuide = [
    `이용 안내: ${pharmacy.name} 방문 전에는 요일별 시간표를 확인하고, 공휴일·임시휴무·휴게시간과 실제 운영 여부를 전화로 확인해 주세요.`,
    pharmacy.tel ? `문의 전화: ${pharmacy.tel}` : "전화번호 정보가 없으면 지도에서 사업자 정보를 확인해 주세요.",
  ].join(" ");

  // 4) extra sections: “정보 부족 항목은 확인 필요” 원칙 유지
  const extraSections: DetailSection[] = [
    {
      title: "방문 전 확인 체크리스트",
      body:
        `- 운영시간 변동 여부(특히 주말/공휴일)\n` +
        `- 점심시간/휴게시간 존재 여부\n` +
        `- 주차/접근성(데이터만으로 확정 불가 → 확인 필요)`,
    },
    {
      title: "길찾기/도착 시간 팁",
      body:
        `- 길찾기 버튼은 주소를 기준으로 검색합니다.\n` +
        `- 도착 예상 시간이 마감 직전이면 '곧 종료' 가능성이 있어 전화 확인이 안전합니다.`,
    },
  ];

  // 5) FAQ: 템플릿이지만 “값(지역/시간/전화/상태)”이 매번 달라짐
  const faq: DetailFaq[] = [
    {
      question: `${pharmacy.name}은 지금 영업 중인가요?`,
      answer: `이 페이지의 영업 상태는 등록된 요일 시간표와 한국 시각으로 계산합니다. 실제 운영 확인 정보가 아니므로 공휴일·임시휴무·휴게시간을 포함한 운영 여부는 방문 전 전화로 확인해 주세요.`,
    },
    {
      question: `${pharmacy.name} 주소는 어디인가요?`,
      answer: pharmacy.address ? `${pharmacy.address}에 위치해 있습니다.` : "주소 정보가 등록되어 있지 않습니다.",
    },
    {
      question: `${pharmacy.name} 전화번호가 있나요?`,
      answer: pharmacy.tel ? `${pharmacy.tel}로 전화 문의가 가능합니다.` : "전화번호가 등록되어 있지 않습니다.",
    },
    {
      question: `주말/공휴일에도 운영하나요?`,
      answer: `${pattern.weekend}. ${pattern.holiday}. 제공된 데이터로 확정할 수 없는 부분은 전화로 확인해 주세요.`,
    },
    {
      question: `길찾기 검색이 잘 안 될 때는 어떻게 하나요?`,
      answer: `주소에서 콤마(,) 뒤의 건물/층/호수 정보를 제외한 뒤 검색하면 더 안정적으로 매칭될 수 있습니다. (예: '${mapAddress || "주소 정보 없음"}')`,
    },
  ];

  return { summary, bullets, usageGuide, extraSections, faq };
}



import type { OperatingHours, Pharmacy } from "@/types/pharmacy";
import { classifyHourSlot, formatHourRange, type SlotClass } from "@/lib/hours";

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
const WEEKDAY_LABEL: Record<(typeof WEEKDAYS)[number], string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
};

// 비교군 통계를 만들 최소 표본 수. 이보다 적으면 평균·비율을 만들지 않는다.
export const MIN_PEER_SAMPLE = 5;
const LATE_END_MIN = 20 * 60;
const EVENING_END_MIN = 18 * 60;

export type DayFact = {
  status: "registered" | "unregistered" | "ambiguous" | "invalid";
  text: string;
};

export type HoursProfile = {
  hasAnyRegistered: boolean;
  weekdayKnownCount: number;
  weekdayAvgHours: number | null;
  weekdayText: string;
  saturday: DayFact;
  sunday: DayFact;
  holiday: DayFact;
  hasLateWeekday: boolean;
  hasEveningWeekday: boolean;
};

function dayFact(
  label: string,
  slot: SlotClass,
  raw?: { open: string | null; close: string | null },
): DayFact {
  if (slot.kind === "range")
    return { status: "registered", text: `${label} ${formatHourRange(raw)}` };
  if (slot.kind === "unregistered")
    return { status: "unregistered", text: `${label} 시간표 미등록` };
  return { status: slot.kind, text: `${label} 시간 확인 필요` };
}

function buildWeekdayText(hours: OperatingHours): string {
  const groups = new Map<string, string[]>();
  const missing: string[] = [];
  for (const key of WEEKDAYS) {
    const slot = hours[key];
    if (classifyHourSlot(slot).kind === "range") {
      const range = formatHourRange(slot);
      groups.set(range, [...(groups.get(range) ?? []), WEEKDAY_LABEL[key]]);
    } else {
      missing.push(WEEKDAY_LABEL[key]);
    }
  }
  if (groups.size === 0) return "평일 시간표 미등록";
  if (groups.size === 1 && missing.length === 0)
    return `평일(월~금) ${[...groups.keys()][0]}`;
  const parts = [...groups.entries()].map(
    ([range, days]) => `${days.join("·")} ${range}`,
  );
  const tail =
    missing.length > 0 ? ` (${missing.join("·")} 미등록 또는 확인 필요)` : "";
  return `${parts.join(", ")}${tail}`;
}

export function computeHoursProfile(
  hours?: OperatingHours | null,
): HoursProfile {
  const empty: DayFact = { status: "unregistered", text: "" };
  if (!hours) {
    return {
      hasAnyRegistered: false,
      weekdayKnownCount: 0,
      weekdayAvgHours: null,
      weekdayText: "평일 시간표 미등록",
      saturday: { ...empty, text: "토요일 시간표 미등록" },
      sunday: { ...empty, text: "일요일 시간표 미등록" },
      holiday: { ...empty, text: "공휴일 시간표 미등록" },
      hasLateWeekday: false,
      hasEveningWeekday: false,
    };
  }

  const durations: number[] = [];
  let latestEnd = 0;
  for (const key of WEEKDAYS) {
    const slot = classifyHourSlot(hours[key]);
    if (slot.kind === "range") {
      durations.push((slot.endMin - slot.openMin) / 60);
      latestEnd = Math.max(latestEnd, slot.endMin);
    }
  }

  const saturday = dayFact("토요일", classifyHourSlot(hours.sat), hours.sat);
  const sunday = dayFact("일요일", classifyHourSlot(hours.sun), hours.sun);
  const holiday = dayFact(
    "공휴일",
    classifyHourSlot(hours.holiday),
    hours.holiday,
  );

  return {
    hasAnyRegistered:
      durations.length > 0 ||
      [saturday, sunday, holiday].some((d) => d.status === "registered"),
    weekdayKnownCount: durations.length,
    weekdayAvgHours:
      durations.length > 0
        ? Math.round(
            (durations.reduce((a, b) => a + b, 0) / durations.length) * 10,
          ) / 10
        : null,
    weekdayText: buildWeekdayText(hours),
    saturday,
    sunday,
    holiday,
    hasLateWeekday: latestEnd >= LATE_END_MIN,
    hasEveningWeekday: latestEnd > EVENING_END_MIN,
  };
}

export type PeerSample = {
  sampleSize: number;
  avgWeekdayHours: number | null;
  avgWeekdaySampleSize: number;
  weekendRegisteredPercent: number;
  lateRegisteredPercent: number;
};

// 자기 자신과 등록 시간표가 전혀 없는 약국은 제외한다.
// 비율의 분모는 "해당 지역 전체"가 아니라 "등록 시간표가 확인된 약국"이다.
export function summarizePeers(
  self: Pick<Pharmacy, "hpid">,
  peers?: Pharmacy[],
): PeerSample | null {
  const profiles = (peers ?? [])
    .filter((p) => p.hpid !== self.hpid)
    .map((p) => computeHoursProfile(p.operating_hours))
    .filter((p) => p.hasAnyRegistered);
  if (profiles.length < MIN_PEER_SAMPLE) return null;

  const withAvg = profiles.filter((p) => p.weekdayAvgHours !== null);
  const pct = (n: number) => Math.round((n / profiles.length) * 100);
  return {
    sampleSize: profiles.length,
    avgWeekdayHours:
      withAvg.length >= MIN_PEER_SAMPLE
        ? Math.round(
            (withAvg.reduce((s, p) => s + (p.weekdayAvgHours ?? 0), 0) /
              withAvg.length) *
              10,
          ) / 10
        : null,
    avgWeekdaySampleSize: withAvg.length,
    weekendRegisteredPercent: pct(
      profiles.filter(
        (p) =>
          p.saturday.status === "registered" ||
          p.sunday.status === "registered",
      ).length,
    ),
    lateRegisteredPercent: pct(profiles.filter((p) => p.hasLateWeekday).length),
  };
}

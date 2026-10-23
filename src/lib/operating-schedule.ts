import type { OperatingHours } from "@/types/pharmacy";
import { formatHHMM, hhmmToMinutes } from "@/lib/hours";

/**
 * 요일별 운영시간의 단일 정규화 경로.
 * 상세 시간표·요약·FAQ·JSON-LD가 모두 이 결과를 사용해 요일별 예외가 요약에서 사라지지 않게 한다.
 */

export const SCHEDULE_DAYS = [
  { key: "mon", label: "월" },
  { key: "tue", label: "화" },
  { key: "wed", label: "수" },
  { key: "thu", label: "목" },
  { key: "fri", label: "금" },
  { key: "sat", label: "토" },
  { key: "sun", label: "일" },
  { key: "holiday", label: "공휴일" },
] as const;

export type DayScheduleState = "open" | "unknown" | "ambiguous";

export type DaySchedule = {
  key: string;
  label: string;
  state: DayScheduleState;
  /** state === "open"일 때만 존재. HH:MM 표기 */
  open?: string;
  close?: string;
  /** 종료 시각이 시작 시각보다 이르면 익일 종료 */
  overnight?: boolean;
  /** 같은 시간대를 묶는 비교용 키 */
  rangeText: string;
};

export type ScheduleGroup = { labels: string[]; rangeText: string; state: DayScheduleState };

function normalizeDay(
  key: string,
  label: string,
  slot?: { open: string | null; close: string | null } | null,
): DaySchedule {
  const open = hhmmToMinutes(slot?.open);
  const close = hhmmToMinutes(slot?.close, true);
  if (open === null || close === null) return { key, label, state: "unknown", rangeText: "정보 없음" };
  // 시작=종료는 휴무인지 24시간인지 원본만으로 알 수 없다.
  if (open === close) return { key, label, state: "ambiguous", rangeText: "확인 필요" };
  const overnight = close < open;
  const openText = formatHHMM(slot!.open);
  const closeText = formatHHMM(slot!.close);
  return {
    key,
    label,
    state: "open",
    open: openText,
    close: closeText,
    overnight,
    rangeText: `${openText} - ${overnight ? "익일 " : ""}${closeText}`,
  };
}

export function normalizeWeeklySchedule(hours?: OperatingHours | null): DaySchedule[] {
  return SCHEDULE_DAYS.map(({ key, label }) => normalizeDay(key, label, hours?.[key]));
}

/** 연속·비연속과 관계없이 같은 시간대의 요일을 한 그룹으로 묶는다 (요일 순서 유지). */
export function groupSchedule(days: DaySchedule[]): ScheduleGroup[] {
  const groups = new Map<string, ScheduleGroup>();
  for (const day of days) {
    const existing = groups.get(day.rangeText);
    if (existing) existing.labels.push(day.label);
    else groups.set(day.rangeText, { labels: [day.label], rangeText: day.rangeText, state: day.state });
  }
  return [...groups.values()];
}

function describeGroups(days: DaySchedule[]): string {
  const known = days.filter((day) => day.state === "open");
  if (known.length === 0) return "";
  return groupSchedule(known)
    .map((group) => `${group.labels.join("·")} ${group.rangeText}`)
    .join(", ");
}

const pick = (days: DaySchedule[], keys: string[]) => days.filter((day) => keys.includes(day.key));

/** 평일(월~금) 요약. 요일별 예외를 그대로 드러낸다. */
export function describeWeekdays(days: DaySchedule[]): string {
  const weekdays = pick(days, ["mon", "tue", "wed", "thu", "fri"]);
  const text = describeGroups(weekdays);
  if (!text) return "평일 운영 정보 없음";
  const unknown = weekdays.filter((day) => day.state !== "open").map((day) => day.label);
  return `평일 ${text}${unknown.length ? ` (${unknown.join("·")} 정보 없음)` : ""}`;
}

export function describeWeekend(days: DaySchedule[]): string {
  const weekend = pick(days, ["sat", "sun"]);
  const text = describeGroups(weekend);
  if (!text) return "주말 운영 정보 없음";
  const unknown = weekend.filter((day) => day.state !== "open").map((day) => day.label);
  return `주말 ${text}${unknown.length ? ` (${unknown.join("·")}요일은 정보 없음 또는 휴무)` : ""}`;
}

/** 공휴일 정보가 없으면 영업·휴무 어느 쪽으로도 단정하지 않는다. */
export function describeHoliday(days: DaySchedule[]): string {
  const holiday = days.find((day) => day.key === "holiday");
  return holiday?.state === "open" ? `공휴일 ${holiday.rangeText}` : "공휴일 운영 여부 미확인";
}

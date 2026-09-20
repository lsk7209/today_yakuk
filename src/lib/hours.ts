import { OperatingHours } from "@/types/pharmacy";

type Status = {
  label: "영업 중" | "곧 종료" | "영업 종료" | "정보 없음" | "확인 필요";
  tone: "success" | "warning" | "muted";
  closesAt?: string;
  minutesUntilClose?: number;
  continuesFromPreviousDay?: boolean;
  emoji?: string; // 이모지 추가
};

export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

// Korean public schedules use UTC+09:00. Read UTC fields after the offset;
// never parse a formatted wall clock back into a host-local Date.
export function getSeoulTimeParts(instant: Date) {
  const seoul = new Date(instant.getTime() + 9 * 60 * 60 * 1000);
  return { day: seoul.getUTCDay(), minutes: seoul.getUTCHours() * 60 + seoul.getUTCMinutes() };
}

export function getSeoulDayKey(instant: Date) {
  return DAY_KEYS[getSeoulTimeParts(instant).day];
}

export function isOperating(status: Status) {
  return status.label === "영업 중" || status.label === "곧 종료";
}
const TONE_COLOR: Record<Status["tone"], string> = {
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  muted: "bg-slate-100 text-slate-700 border-slate-200",
};

export function getBadgeClass(status: Status) {
  return `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${TONE_COLOR[status.tone]}`;
}

export function getSeoulNow(): Date {
  const now = new Date();
  const local = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  return local;
}

export function hhmmToMinutes(value: string | null | undefined, allow24 = false): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!/^\d{3,4}$/.test(str)) return null;
  const hours = Number(str.slice(0, -2));
  const mins = Number(str.slice(-2));
  if (Number.isNaN(hours) || Number.isNaN(mins) || mins > 59) return null;
  if (hours === 24) return allow24 && mins === 0 ? 1440 : null;
  if (hours > 23) return null;
  return hours * 60 + mins;
}

export function getOperatingStatus(
  hours?: OperatingHours | null,
): Status {
  return getOperatingStatusAt(hours, new Date());
}

export function getOperatingStatusAt(
  hours: OperatingHours | null | undefined,
  instant: Date,
  options: { isHoliday?: boolean | null; previousIsHoliday?: boolean | null } = {},
): Status {
  if (!Number.isFinite(instant.getTime()) || options.isHoliday === null) {
    return { label: "확인 필요", tone: "muted" };
  }
  if (!hours) return { label: "정보 없음", tone: "muted" };
  const { day, minutes: currentMin } = getSeoulTimeParts(instant);
  const dayKey = DAY_KEYS[day];
  if (options.isHoliday === true && !hours.holiday) {
    return { label: "확인 필요", tone: "muted" };
  }
  const slot = options.isHoliday === true ? hours.holiday : hours[dayKey];

  const openMin = hhmmToMinutes(slot?.open ?? null);
  const closeMin = hhmmToMinutes(slot?.close ?? null, true);

  const previousKey = DAY_KEYS[(day + 6) % 7];
  const previousSlot = options.previousIsHoliday === true ? hours.holiday : hours[previousKey];
  const previousOpen = hhmmToMinutes(previousSlot?.open ?? null);
  const previousClose = hhmmToMinutes(previousSlot?.close ?? null, true);

  // Today's slot starts today. Only yesterday's slot can cover this morning.
  const active: { close: number; value: string; previous: boolean }[] = [];
  if (
    options.isHoliday !== true && options.previousIsHoliday !== null &&
    previousOpen !== null &&
    previousClose !== null &&
    previousClose < previousOpen &&
    currentMin < previousClose
  ) {
    active.push({ close: previousClose, value: previousSlot.close!, previous: true });
  }

  if (openMin !== null && closeMin !== null && openMin !== closeMin) {
    const end = closeMin < openMin ? closeMin + 1440 : closeMin;
    if (currentMin >= openMin && currentMin < end) {
      active.push({ close: end, value: slot!.close!, previous: false });
    }
  }
  if (active.length) {
    const interval = active.sort((a, b) => b.close - a.close)[0];
    const minutesUntilClose = interval.close - currentMin;
    const closingSoon = minutesUntilClose <= 60;
    return {
      label: closingSoon ? "곧 종료" : "영업 중",
      tone: closingSoon ? "warning" : "success",
      emoji: closingSoon ? "🟠" : "🟢",
      closesAt: interval.value,
      minutesUntilClose,
      continuesFromPreviousDay: interval.previous,
    };
  }

  if (openMin === null || closeMin === null) {
    return { label: "정보 없음", tone: "muted" };
  }

  // Equal times are source-dependent (closed vs 24h), so never guess.
  if (openMin === closeMin) return { label: "확인 필요", tone: "muted" };

  return { 
    label: "영업 종료", 
    tone: "muted", 
    closesAt: slot?.close ?? undefined,
    emoji: "⚪",
  };
}

export function formatHourRange(slot?: { open: string | null; close: string | null }): string {
  const open = hhmmToMinutes(slot?.open);
  const close = hhmmToMinutes(slot?.close, true);
  if (open === null || close === null) return "정보 없음";
  if (open === close) return "확인 필요";
  return `${formatHHMM(slot!.open)} - ${close < open ? "익일 " : ""}${formatHHMM(slot!.close)}`;
}

export function isNightShiftAt(hours: OperatingHours | null | undefined, instant: Date) {
  const slot = hours?.[getSeoulDayKey(instant)];
  const open = hhmmToMinutes(slot?.open);
  const close = hhmmToMinutes(slot?.close, true);
  return open !== null && close !== null && open !== close && (close >= 22 * 60 || close < open);
}

export function formatHHMM(value?: string | null) {
  if (!value || hhmmToMinutes(value, true) === null) return "";
  const str = String(value).padStart(4, "0");
  return `${str.slice(0, 2)}:${str.slice(2)}`;
}


import { OperatingHours } from "@/types/pharmacy";

type Status = {
  label: "영업 중" | "곧 종료" | "영업 종료" | "정보 없음";
  tone: "success" | "warning" | "muted";
  closesAt?: string;
};

export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
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

function hhmmToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const str = value.trim();
  if (str.length < 3) return null;
  const hours = Number(str.slice(0, -2));
  const mins = Number(str.slice(-2));
  if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
  return hours * 60 + mins;
}

export function getOperatingStatus(
  hours?: OperatingHours | null,
): Status {
  if (!hours) return { label: "정보 없음", tone: "muted" };
  const now = getSeoulNow();
  const dayKey = DAY_KEYS[now.getDay()];
  const slot = hours[dayKey];

  const openMin = hhmmToMinutes(slot?.open ?? null);
  const closeMin = hhmmToMinutes(slot?.close ?? null);

  if (openMin === null || closeMin === null) {
    return { label: "정보 없음", tone: "muted" };
  }

  const currentMin = now.getHours() * 60 + now.getMinutes();
  const closesIn = closeMin - currentMin;

  if (currentMin >= openMin && currentMin < closeMin) {
    if (closesIn <= 60) {
      return {
        label: "곧 종료",
        tone: "warning",
        closesAt: slot?.close ?? undefined,
      };
    }
    return {
      label: "영업 중",
      tone: "success",
      closesAt: slot?.close ?? undefined,
    };
  }

  return { label: "영업 종료", tone: "muted", closesAt: slot?.close ?? undefined };
}

export function formatHourRange(slot?: { open: string | null; close: string | null }): string {
  if (!slot?.open || !slot?.close) return "정보 없음";
  return `${formatHHMM(slot.open)} - ${formatHHMM(slot.close)}`;
}

export function formatHHMM(value?: string | null) {
  if (!value || value.length < 3) return value ?? "";
  const str = value.padStart(4, "0");
  return `${str.slice(0, 2)}:${str.slice(2)}`;
}


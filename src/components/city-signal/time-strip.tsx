import type { OperatingHours } from "@/types/pharmacy";
import { DAY_KEYS, formatHHMM, formatHourRange, getOperatingStatusAt, getSeoulDayKey, getSeoulTimeParts, hhmmToMinutes } from "@/lib/hours";

/** A visual aid for the registered weekday schedule, never a field observation. */
export function TimeStrip({ hours, time }: { hours?: OperatingHours | null; time: number | null }) {
  const instant = time === null ? null : new Date(time);
  const valid = instant !== null && Number.isFinite(instant.getTime());
  const slot = valid ? hours?.[getSeoulDayKey(instant)] : undefined;
  const open = hhmmToMinutes(slot?.open);
  const close = hhmmToMinutes(slot?.close, true);
  const known = open !== null && close !== null && open !== close;
  const overnight = known && close < open;
  const range = valid ? formatHourRange(slot) : "시간 확인 중";
  const now = valid ? getSeoulTimeParts(instant).minutes : null;
  const weekday = valid ? ["일", "월", "화", "수", "목", "금", "토"][getSeoulTimeParts(instant).day] : null;
  const status = valid ? getOperatingStatusAt(hours, instant) : null;
  const previousDay = valid ? (getSeoulTimeParts(instant).day + 6) % 7 : null;
  const previousSlot = previousDay === null ? undefined : hours?.[DAY_KEYS[previousDay]];
  const previousOpen = hhmmToMinutes(previousSlot?.open);
  const previousClose = hhmmToMinutes(previousSlot?.close, true);
  const spill = previousOpen !== null && previousClose !== null && previousClose < previousOpen;
  return <div className="city-time-strip" data-time-strip>
    <div className="city-time-caption"><span>{weekday ? `${weekday}요일` : "요일별"} 등록 시간표</span><strong>{range}</strong></div>
    <div className="city-time-rail" aria-hidden="true">
      {known ? <>
        <i className="city-time-range" style={{ left: `${open / 14.4}%`, width: `${((overnight ? 1440 : close) - open) / 14.4}%` }} />
      </> : null}
      {spill ? <i className="city-time-range city-time-previous" style={{ left: 0, width: `${previousClose / 14.4}%` }} /> : null}
      {now !== null ? <i className="city-time-now" style={{ left: `${now / 14.4}%` }} /> : null}
    </div>
    <div className="city-time-ticks" aria-hidden="true"><span>00시</span><span>06시</span><span>12시</span><span>18시</span><span>24시</span></div>
    <p className="city-time-note">{now === null ? "" : `기준 ${String(Math.floor(now / 60)).padStart(2, "0")}:${String(now % 60).padStart(2, "0")} (한국) · `}공휴일·실제 운영은 전화 확인</p>
    {spill ? <p className="city-time-note">점선: 전날({["일", "월", "화", "수", "목", "금", "토"][previousDay!]}) 시작한 심야 시간표, 오늘 {formatHHMM(previousSlot?.close)}까지{status?.continuesFromPreviousDay ? " · 현재 이 구간에 해당" : ""}</p> : null}
  </div>;
}

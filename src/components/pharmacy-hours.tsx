"use client";

import type { OperatingHours, Pharmacy } from "@/types/pharmacy";
import { formatHourRange, getBadgeClass, getOperatingStatusAt, getSeoulDayKey, isOperating } from "@/lib/hours";
import { useEvaluationTime } from "./use-evaluation-time";
import { PharmacyCard } from "./pharmacy-card";

type Props = { hours?: OperatingHours | null; initialIso: string };
const basis = "등록된 요일 시간표 기준입니다. 공휴일·임시휴무·휴게시간은 방문 전 전화로 확인하세요.";
const days = [["mon", "월"], ["tue", "화"], ["wed", "수"], ["thu", "목"], ["fri", "금"], ["sat", "토"], ["sun", "일"], ["holiday", "공휴"]];

export function PharmacyStatus({ hours, initialIso, badge = false }: Props & { badge?: boolean }) {
  const time = useEvaluationTime(initialIso);
  const status = getOperatingStatusAt(hours, new Date(time ?? initialIso));
  return <span data-pharmacy-status title={basis} className={badge ? getBadgeClass(status) : undefined}>
    {badge && status.emoji ? <span aria-hidden>{status.emoji}</span> : null}
    {status.label}<span className="text-xs font-normal"> · 시간표 기준</span>
  </span>;
}

export function PharmacyTodayHours({ hours, initialIso }: Props) {
  const time = useEvaluationTime(initialIso);
  const instant = new Date(time ?? initialIso);
  const status = getOperatingStatusAt(hours, instant);
  return <>
    <p data-today-hours className="text-xl font-black text-gray-900 mt-1">{formatHourRange(hours?.[getSeoulDayKey(instant)])}</p>
    {status.continuesFromPreviousDay ? <p className="text-sm text-amber-800">이전 영업일의 심야 운영시간에 해당합니다.</p> : null}
    <p className="text-xs text-gray-500 mt-2">{basis}</p>
  </>;
}

export function PharmacyWeeklyHours({ hours, initialIso }: Props) {
  const time = useEvaluationTime(initialIso);
  const today = getSeoulDayKey(new Date(time ?? initialIso));
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {days.map(([key, label]) => <div key={key} data-schedule-day={key} data-today={key === today}
      className={`rounded-xl border-2 px-4 py-4 ${key === today ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
      <p className="text-base font-black text-gray-800">{label} {key === today ? <span className="text-xs text-emerald-700">오늘</span> : null}</p>
      <p className="text-sm font-bold text-gray-700 mt-2">{formatHourRange(hours?.[key])}</p>
    </div>)}
  </div>;
}

export function NearbyOpenPharmacies({ items, initialIso }: { items: (Pharmacy & { distanceKm: number })[]; initialIso: string }) {
  const time = useEvaluationTime(initialIso);
  const instant = new Date(time ?? initialIso);
  const open = items.filter((item) => isOperating(getOperatingStatusAt(item.operating_hours, instant))).slice(0, 3);
  return <div className="space-y-3" data-nearby-open>
    {open.length ? open.map((item) => <PharmacyCard key={item.hpid} pharmacy={item} distanceKm={item.distanceKm} initialIso={initialIso} />)
      : <p className="text-base text-gray-600">등록 시간표 기준으로 영업 중인 대체 약국 정보를 찾지 못했습니다. 실제 운영 여부는 전화로 확인하세요.</p>}
  </div>;
}

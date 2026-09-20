"use client";

import { useMemo, useState } from "react";
import { Pharmacy } from "@/types/pharmacy";
import { getOperatingStatusAt, isOperating, isNightShiftAt, hhmmToMinutes } from "@/lib/hours";
import { useEvaluationTime } from "./use-evaluation-time";
import { PharmacyCard } from "./pharmacy-card";


type FilterKey = "all" | "open" | "night" | "holiday";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "open", label: "영업 중" },
  { key: "night", label: "심야" },
  { key: "holiday", label: "공휴일" },
];

export function PharmacyListView({ list, initialIso }: { list: Pharmacy[]; initialIso?: string }) {
  const time = useEvaluationTime(initialIso);
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    return list.filter((item) => {
      if (filter === "all") return true;
      if (filter === "open") {
        return time !== null && isOperating(getOperatingStatusAt(item.operating_hours, new Date(time)));
      }
      if (filter === "night") {
        return time !== null && isNightShiftAt(item.operating_hours, new Date(time));
      }
      if (filter === "holiday") {
        return isHolidayOpen(item);
      }
      return true;
    });
  }, [list, filter, time]);



  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-10 bg-white/90 backdrop-blur border-b border-[var(--border)]">
        <div className="flex gap-2 px-1 py-3 overflow-x-auto no-scrollbar">
          {FILTERS.map(({ key, label }) => {
            const active = key === filter;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`min-h-11 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold border transition ${active
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-brand-200"
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-6 text-center text-sm text-[var(--muted)]">
          선택한 조건에 맞는 약국이 없습니다. 필터를 리셋하거나 다른 지역을 선택하세요.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, index) => (
            <div key={item.hpid} className="hover:shadow-lg transition-shadow rounded-2xl">
              <PharmacyCard pharmacy={item} sourceSurface="pharmacy_list" resultRank={index + 1} initialIso={initialIso} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function isHolidayOpen(pharmacy: Pharmacy) {
  const hours = pharmacy.operating_hours;
  if (!hours) return false;
  const slot = hours.holiday;
  const open = hhmmToMinutes(slot?.open);
  const close = hhmmToMinutes(slot?.close, true);
  return open !== null && close !== null && open !== close;
}


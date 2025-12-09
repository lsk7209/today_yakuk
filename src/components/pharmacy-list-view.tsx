"use client";

import { useMemo, useState } from "react";
import { Pharmacy } from "@/types/pharmacy";
import { getOperatingStatus } from "@/lib/hours";
import { PharmacyCard } from "./pharmacy-card";
import { AdsPlaceholder } from "./ads-placeholder";

type FilterKey = "all" | "open" | "night" | "holiday";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "open", label: "영업 중" },
  { key: "night", label: "심야" },
  { key: "holiday", label: "공휴일" },
];

export function PharmacyListView({ list }: { list: Pharmacy[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    return list.filter((item) => {
      if (filter === "all") return true;
      if (filter === "open") {
        return getOperatingStatus(item.operating_hours).label === "영업 중";
      }
      if (filter === "night") {
        return isNightShift(item);
      }
      if (filter === "holiday") {
        return isHolidayOpen(item);
      }
      return true;
    });
  }, [list, filter]);

  const withAds = useMemo(() => {
    const blocks: Array<Pharmacy | { ad: true; id: string }> = [];
    filtered.forEach((item, idx) => {
      blocks.push(item);
      if ((idx + 1) % 5 === 0) {
        blocks.push({ ad: true, id: `ad-${idx}` });
      }
    });
    return blocks;
  }, [filtered]);

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
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold border transition ${
                  active
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

      {withAds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-6 text-center text-sm text-[var(--muted)]">
          선택한 조건에 맞는 약국이 없습니다. 필터를 리셋하거나 다른 지역을 선택하세요.
        </div>
      ) : (
        <div className="space-y-4">
          {withAds.map((item) =>
            "ad" in item ? (
              <AdsPlaceholder key={item.id} />
            ) : (
              <div key={item.hpid} className="hover:shadow-lg transition-shadow rounded-2xl">
                <PharmacyCard pharmacy={item} />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function hhmmToMinutes(value?: string | null) {
  if (!value) return null;
  const str = value.padStart(4, "0");
  const h = Number(str.slice(0, 2));
  const m = Number(str.slice(2));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function isNightShift(pharmacy: Pharmacy) {
  const hours = pharmacy.operating_hours;
  if (!hours) return false;
  const today = new Date();
  const key = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][today.getDay()] as keyof NonNullable<
    Pharmacy["operating_hours"]
  >;
  const slot = hours[key];
  const close = hhmmToMinutes(slot?.close);
  return close !== null && close >= 22 * 60;
}

function isHolidayOpen(pharmacy: Pharmacy) {
  const hours = pharmacy.operating_hours;
  if (!hours) return false;
  const slot = hours.holiday;
  const open = hhmmToMinutes(slot?.open);
  const close = hhmmToMinutes(slot?.close);
  return open !== null && close !== null;
}


"use client";

import { useCallback, useMemo, useState } from "react";
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

type Props = {
  province: string;
  city?: string;
  initialItems: Pharmacy[];
  total: number;
  pageSize?: number;
  initialOffset?: number;
};

type RenderPharmacy = Pharmacy & { distanceKm?: number };

export function PharmacyListInfinite({
  province,
  city,
  initialItems,
  total,
  pageSize = 20,
  initialOffset = 0,
}: Props) {
  const [items, setItems] = useState<Pharmacy[]>(initialItems);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sortMode, setSortMode] = useState<"default" | "distance">("default");
  const hasMore = items.length < total;

  const itemsWithDistance: RenderPharmacy[] = useMemo(() => {
    if (!userLocation) return items;
    return items.map((item) => {
      if (item.latitude == null || item.longitude == null) return item;
      const distanceKm = haversine(
        userLocation.lat,
        userLocation.lon,
        item.latitude,
        item.longitude,
      );
      return { ...item, distanceKm };
    });
  }, [items, userLocation]);

  const filtered = useMemo(() => {
    const base = itemsWithDistance.filter((item) => {
      if (filter === "all") return true;
      if (filter === "open") return getOperatingStatus(item.operating_hours).label === "영업 중";
      if (filter === "night") return isNightShift(item);
      if (filter === "holiday") return isHolidayOpen(item);
      return true;
    });
    if (sortMode === "distance" && userLocation) {
      return base.slice().sort((a, b) => {
        return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY);
      });
    }
    return base;
  }, [itemsWithDistance, filter, sortMode, userLocation]);

  const withAds = useMemo(() => {
    const blocks: Array<RenderPharmacy | { ad: true; id: string }> = [];
    filtered.forEach((item, idx) => {
      blocks.push(item);
      if ((idx + 1) % 5 === 0) {
        blocks.push({ ad: true, id: `ad-${idx}` });
      }
    });
    return blocks;
  }, [filtered]);

  const requestLocation = useCallback(() => {
    if (locationLoading) return;
    if (!("geolocation" in navigator)) {
      setLocationError("위치 정보를 지원하지 않는 기기입니다.");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("위치 권한이 거부되었습니다.");
        } else {
          setLocationError("위치 정보를 확인하지 못했습니다.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [locationLoading]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        province,
        city: city ?? "",
        offset: String(initialOffset + items.length),
        limit: String(pageSize),
      });
      const res = await fetch(`/api/pharmacies?${qs.toString()}`);
      if (!res.ok) throw new Error("약국 정보를 불러오지 못했습니다.");
      const data: { items: Pharmacy[]; nextOffset: number | null } = await res.json();
      setItems((prev) => [...prev, ...(data.items ?? [])]);
      if (data.items?.length === 0) {
        setError("더 이상 불러올 약국이 없습니다.");
      }
    } catch {
      setError("네트워크 오류로 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [city, hasMore, initialOffset, items.length, loading, pageSize, province]);

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
        <div className="flex flex-wrap items-center gap-2 px-2 pb-3 text-xs text-[var(--muted)]">
          <button
            onClick={requestLocation}
            disabled={locationLoading}
            className={`rounded-full px-3 py-1 font-semibold border ${
              userLocation
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-brand-200"
            } ${locationLoading ? "opacity-60" : ""}`}
          >
            {userLocation ? "거리 표시 활성" : "거리 표시 (권한 필요)"}
          </button>
          <button
            onClick={() => setSortMode((prev) => (prev === "distance" ? "default" : "distance"))}
            disabled={!userLocation}
            className={`rounded-full px-3 py-1 font-semibold border ${
              sortMode === "distance"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-brand-200"
            } ${!userLocation ? "opacity-60 pointer-events-none" : ""}`}
          >
            거리순 정렬
          </button>
          {locationError ? <span className="text-amber-700">{locationError}</span> : null}
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
                <PharmacyCard pharmacy={item} distanceKm={item.distanceKm} />
              </div>
            ),
          )}
        </div>
      )}

      {error ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}

      <div className="flex justify-center">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-4 py-2 text-sm font-semibold hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "불러오는 중..." : "더 불러오기"}
          </button>
        ) : (
          <p className="text-sm text-[var(--muted)]">모든 약국을 확인했습니다.</p>
        )}
      </div>
    </div>
  );
}

function hhmmToMinutes(value?: string | null) {
  if (!value) return null;
  const str = String(value).padStart(4, "0");
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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


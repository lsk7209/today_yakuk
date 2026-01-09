"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  LocateFixed,
  MapPin,
  Search,
  Navigation,
  ArrowRight,
  SlidersHorizontal,
  Map as MapIcon,
} from "lucide-react";

import type { PharmacyCardProps } from "@/components/pharmacy-card";
import { getOperatingStatus } from "@/lib/hours";

const provinces = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
];

type NearbyPharmacy = PharmacyCardProps["pharmacy"] & { distanceKm?: number };
type NearbyResponse = { items: NearbyPharmacy[]; total: number };

export default function Home() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<NearbyPharmacy[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [radiusKm] = useState(3);
  const [sortMode, setSortMode] = useState<"distance" | "closing">("distance");

  const canGeo = typeof window !== "undefined" && "geolocation" in navigator;

  async function fetchNearby() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setMessage("GPS를 지원하지 않습니다. 대신 지역별 찾기를 이용해 주세요.");
      return;
    }
    setStatus("loading");
    setMessage("현재 위치를 확인하고 있습니다...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const qs = new URLSearchParams({
            lat: String(pos.coords.latitude),
            lon: String(pos.coords.longitude),
            radiusKm: String(radiusKm),
            limit: "20",
          });
          const res = await fetch(`/api/nearby?${qs.toString()}`);
          if (!res.ok) throw new Error("nearby fetch failed");
          const data: NearbyResponse = await res.json();
          const list = data.items ?? [];
          setItems(list);
          setStatus("success");
          setMessage(list.length ? null : `반경 ${radiusKm}km 내 약국을 찾지 못했습니다.`);
        } catch {
          setStatus("error");
          setMessage("데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      },
      (err) => {
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          setMessage("위치 권한이 거부되었습니다. 지역별 찾기를 이용해 주세요.");
        } else {
          setMessage("위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    // 메인에서는 자동 호출을 하지 않고, 사용자가 “위치 설정”을 눌렀을 때만 호출합니다.
    // (권한 팝업 남발 방지)
  }, []);

  const sorted = useMemo(() => {
    const base = [...items];
    return base.sort((a, b) => {
      if (sortMode === "distance") {
        return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY);
      }
      const aClose = closingMinutes(a);
      const bClose = closingMinutes(b);
      return aClose - bClose;
    });
  }, [items, sortMode]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // 현재는 “검색”을 nearby로 유도합니다 (실제 키워드 검색 API는 추후 확장).
    void fetchNearby();
  }

  const regionGrid = useMemo(
    () => (
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {provinces.map((name) => (
          <Link
            key={name}
            href={`/${encodeURIComponent(name)}/전체`}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-bold text-gray-900 text-center hover:border-brand-300 hover:shadow-md hover:bg-gray-50 transition-all"
          >
            {name}
          </Link>
        ))}
      </div>
    ),
    [],
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-10 sm:py-14 space-y-8">
        {/* Hero */}
        <section className="rounded-3xl border border-gray-200 bg-gradient-to-b from-emerald-50 via-white to-white p-6 sm:p-10 shadow-lg">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-gray-900">
              내 주변 약국 <span className="text-brand-700">즉시 찾기</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              현재 위치를 기반으로 늦은 밤에도, 주말에도 열려있는 약국을 빠르게 찾아드립니다.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={onSubmit} className="mt-6">
            <div className="rounded-2xl border-2 border-transparent bg-white shadow-sm focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-200/30 transition-all">
              <div className="flex items-center gap-2 px-4 py-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="동 이름(ex. 강남동) 또는 건물명 검색"
                  className="flex-1 bg-transparent outline-none text-base font-semibold text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => void fetchNearby()}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition-colors ${canGeo
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  aria-label="위치 설정"
                  disabled={!canGeo}
                >
                  <LocateFixed className="h-4 w-4 inline-block mr-1" />
                  위치 설정
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-700 text-white px-4 py-2 text-sm font-black hover:bg-brand-800 transition-colors"
                >
                  찾기
                  <ArrowRight className="h-4 w-4 inline-block ml-1" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              지금은 위치 기반 추천을 우선 제공합니다. 키워드 검색은 곧 추가됩니다.
            </p>
          </form>

          {/* Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button className="h-10 rounded-full bg-brand-700 text-white px-5 text-sm font-black shadow-sm">
              약국
            </button>
            <Link
              href="/guide/night-weekend"
              className="h-10 inline-flex items-center rounded-full bg-gray-100 px-5 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors"
            >
              24시간 운영(가이드)
            </Link>
            <Link
              href="/guide/holiday-checklist"
              className="h-10 inline-flex items-center rounded-full bg-gray-100 px-5 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors"
            >
              공휴일 체크
            </Link>
            <Link
              href="/nearby"
              className="h-10 inline-flex items-center rounded-full bg-gray-100 px-5 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors"
            >
              내 주변 전체 보기
            </Link>
          </div>
        </section>

        {/* List header */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-gray-900">내 주변 추천 약국</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortMode("distance")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold border ${sortMode === "distance"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                거리순
              </button>
              <button
                type="button"
                onClick={() => setSortMode("closing")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold border ${sortMode === "closing"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Navigation className="h-4 w-4" />
                종료 임박
              </button>
            </div>
          </div>



          {status === "loading" ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
                >
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded mt-3" />
                </div>
              ))}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              {message}
            </div>
          ) : null}

          {status === "success" && sorted.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <p className="text-sm text-gray-600">
                아직 추천 목록이 비어있습니다. 위치를 설정하거나 지역별로 찾아보세요.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void fetchNearby()}
                  className="inline-flex items-center justify-center rounded-full bg-brand-700 text-white px-5 py-2 text-sm font-black hover:bg-brand-800"
                  disabled={!canGeo}
                >
                  <LocateFixed className="h-4 w-4 mr-2" />
                  위치로 찾기
                </button>
                <Link
                  href="/서울/전체"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  서울에서 찾기
                </Link>
              </div>
            </div>
          ) : null}

          {sorted.length > 0 ? (
            <div className="space-y-3">
              {sorted.slice(0, 8).map((p) => {
                const s = getOperatingStatus(p.operating_hours);
                return (
                  <div
                    key={p.hpid}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-brand-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-black ring-1 ring-inset ${s.label === "영업 중"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : s.label === "곧 종료"
                                  ? "bg-amber-50 text-amber-800 ring-amber-200"
                                  : "bg-slate-100 text-slate-700 ring-slate-200"
                              }`}
                          >
                            {s.label}
                          </span>
                          <Link
                            href={`/pharmacy/${p.hpid}`}
                            className="text-base sm:text-lg font-black text-gray-900 truncate hover:text-brand-700"
                          >
                            {p.name}
                          </Link>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 truncate flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {p.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <p className="text-sm font-black text-gray-900">
                          {typeof p.distanceKm === "number"
                            ? `${Math.round(p.distanceKm * 1000)}m`
                            : "—"}
                        </p>
                        <ArrowRight className="h-4 w-4 text-gray-300 mt-2" />
                      </div>
                    </div>
                  </div>
                );
              })}


            </div>
          ) : null}

          {/* 지역별 바로가기(권한 거부 대비) */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">지역별 바로 찾기</h3>
                <p className="text-sm text-gray-600 mt-1">
                  위치 권한을 거부해도 지역별 목록으로 바로 이동할 수 있습니다.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
                <LocateFixed className="h-4 w-4 text-brand-700" />
                반경 {radiusKm}km 기준 추천
              </div>
            </div>
            {regionGrid}
          </section>
        </section>
      </div>

      {/* FAB */}
      <Link
        href="/nearby"
        className="fixed bottom-7 right-5 sm:right-8 z-40 inline-flex items-center gap-2 rounded-full bg-gray-900 text-white px-5 py-3 shadow-2xl hover:shadow-3xl hover:bg-black transition-colors"
      >
        <MapIcon className="h-5 w-5" />
        지도 보기
      </Link>
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

function closingMinutes(pharmacy: PharmacyCardProps["pharmacy"]) {
  const status = getOperatingStatus(pharmacy.operating_hours);
  if (status.closesAt) {
    const mins = hhmmToMinutes(status.closesAt);
    if (mins !== null) return mins;
  }
  const hours = pharmacy.operating_hours;
  if (!hours) return Number.POSITIVE_INFINITY;
  const today = new Date();
  const key = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][today.getDay()] as keyof NonNullable<
    PharmacyCardProps["pharmacy"]["operating_hours"]
  >;
  const slot = hours[key];
  const close = hhmmToMinutes(slot?.close);
  return close ?? Number.POSITIVE_INFINITY;
}

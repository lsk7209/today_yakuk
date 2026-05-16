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
import { JsonLd, buildFAQSchema } from "@/components/seo/json-ld";
import { HomeTrustSections, HOME_FAQ_ITEMS } from "@/components/home/home-trust-sections";
import RecentBlogPosts from "@/components/home/recent-blog-posts";
import DesktopSidebar from "@/components/home/desktop-sidebar";
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
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

type NearbyPharmacy = PharmacyCardProps["pharmacy"] & { distanceKm?: number };
type NearbyResponse = { items: NearbyPharmacy[]; total: number };
const homeFaqSchema = buildFAQSchema(HOME_FAQ_ITEMS);

export default function Home() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<NearbyPharmacy[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [geoAvailable, setGeoAvailable] = useState(true);
  const [radiusKm] = useState(3);
  const [sortMode, setSortMode] = useState<"distance" | "closing">("distance");

  async function fetchNearby() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoAvailable(false);
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

  async function searchByKeyword(term: string) {
    setStatus("loading");
    setMessage("검색어로 약국을 찾고 있습니다...");
    try {
      const qs = new URLSearchParams({
        q: term,
        limit: "20",
      });
      const res = await fetch(`/api/nearby?${qs.toString()}`);
      if (!res.ok) throw new Error("keyword fetch failed");
      const data: NearbyResponse = await res.json();
      const list = data.items ?? [];
      setItems(list);
      setStatus("success");
      setMessage(list.length ? null : `"${term}" 검색 결과가 없습니다. 현재 위치로 다시 찾아보세요.`);
    } catch {
      setStatus("error");
      setMessage("검색 중 오류가 발생했습니다. 현재 위치로 다시 시도해 주세요.");
    }
  }

  useEffect(() => {
    setGeoAvailable(typeof navigator !== "undefined" && "geolocation" in navigator);
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
    const term = query.trim();
    if (term.length >= 2) {
      void searchByKeyword(term);
      return;
    }
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
      <div className="container py-10 sm:py-16">
        <JsonLd id="home-faq-schema" data={homeFaqSchema} />
        <div className="flex gap-8 items-start">
          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-12">
        {/* Hero */}
        <section className="rounded-[2.5rem] border border-gray-100 bg-gradient-to-br from-white via-white to-emerald-50/50 p-8 sm:p-14 premium-card overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

          <div className="space-y-6 relative z-10">
            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight text-slate-900 text-balance">
              지금 우리 동네 <br />
              <span className="text-brand-700 relative">
                문 연 약국
                <span className="absolute bottom-1 left-0 w-full h-3 bg-brand-100 -z-10" />
              </span> 찾기
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
              위치 기반 실시간 영업 정보를 통해 가장 가까운 약국을 찾아드립니다. <br className="hidden sm:block" />
              늦은 밤, 공휴일에도 안심하고 방문하세요.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={onSubmit} className="mt-10 relative z-10">
            <div className="max-w-3xl rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-2xl p-2 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-0">
                  <Search className="h-6 w-6 text-brand-600" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="동 이름 또는 건물명으로 찾기"
                    className="flex-1 bg-transparent outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="flex items-center gap-2 p-1">
                  <button
                    type="button"
                    onClick={() => void fetchNearby()}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition-all transform active:scale-95 ${geoAvailable
                      ? "bg-brand-light text-brand-700 hover:bg-brand-100 ring-1 ring-brand-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!geoAvailable}
                  >
                    <LocateFixed className="h-4 w-4" />
                    GPS 연결
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 text-white px-8 py-4 text-sm font-black hover:bg-brand-800 transition-all shadow-lg hover:shadow-brand-700/30 transform active:scale-95"
                  >
                    검색
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {status === "idle" ? (
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                GPS 연결을 누르면 브라우저 위치 권한 창이 열리고, 현재 위치 기준으로 가까운 약국을 찾습니다.
              </p>
              <button
                type="button"
                onClick={() => void fetchNearby()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-slate-700"
                disabled={!geoAvailable}
              >
                <LocateFixed className="h-4 w-4" />
                내 주변 약국 보기
              </button>
            </div>
          ) : null}

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
                  disabled={!geoAvailable}
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

        <RecentBlogPosts />

        <HomeTrustSections />
          </div>{/* end main content */}

          <DesktopSidebar />
        </div>{/* end flex row */}
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

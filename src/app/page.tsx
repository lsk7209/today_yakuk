"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  LocateFixed,
  MapPin,
  Search,
  Navigation,
  ArrowRight,
  SlidersHorizontal,
  Map as MapIcon,
  Phone,
} from "lucide-react";

import type { PharmacyCardProps } from "@/components/pharmacy-card";
import { JsonLd, buildFAQSchema } from "@/components/seo/json-ld";
import {
  HomeTrustSections,
  HOME_FAQ_ITEMS,
} from "@/components/home/home-trust-sections";
import RecentBlogPosts from "@/components/home/recent-blog-posts";
import DesktopSidebar from "@/components/home/desktop-sidebar";
import {
  formatHourRange,
  getOperatingStatusAt,
  getSeoulDayKey,
} from "@/lib/hours";
import { useEvaluationTime } from "@/components/use-evaluation-time";
import { bucketResultCount, trackAnalyticsEvent } from "@/lib/client-analytics";
import { hasValidPhone } from "@/lib/pharmacy-indexability";

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

/** 오늘(KST) 등록 시간표. 운영시간 원본이 없으면 "정보 없음"으로 구분해 표시한다. */
function todayHoursText(p: NearbyPharmacy, time: number | null) {
  if (time === null) return "오늘 운영시간 확인 중";
  const slot = p.operating_hours?.[getSeoulDayKey(new Date(time))];
  const range = formatHourRange(slot);
  return range === "정보 없음"
    ? "오늘 운영시간 정보 없음"
    : `오늘 ${range} (등록 시간표 · 공휴일 미반영)`;
}

export default function Home() {
  const time = useEvaluationTime();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<NearbyPharmacy[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [geoAvailable, setGeoAvailable] = useState(true);
  const [radiusKm] = useState(3);
  const [sortMode, setSortMode] = useState<"distance" | "closing">("distance");
  // Guards against response inversion: only the most recently issued request
  // is allowed to update `items`/`status`/`message` when its response arrives.
  const requestSeqRef = useRef(0);
  // 명시적 검색 제출 후에만 결과 영역으로 포커스를 옮긴다 (입력 중에는 화면을 움직이지 않는다).
  const focusResultsRef = useRef(false);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const lastSearchRef = useRef<
    { mode: "gps" } | { mode: "keyword"; term: string }
  >({ mode: "gps" });

  async function fetchNearby() {
    trackAnalyticsEvent("pharmacy_search_submitted", {
      search_mode: "gps",
      source_surface: "home",
    });
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoAvailable(false);
      setStatus("error");
      setMessage("GPS를 지원하지 않습니다. 대신 지역별 찾기를 이용해 주세요.");
      return;
    }

    lastSearchRef.current = { mode: "gps" };
    focusResultsRef.current = true;
    const requestId = ++requestSeqRef.current;
    setStatus("loading");
    setMessage("현재 위치를 확인하고 있습니다...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // The geolocation callback can resolve after a newer search has
        // already started; abandon this stale request instead of clobbering
        // the latest state.
        if (requestId !== requestSeqRef.current) return;
        trackAnalyticsEvent("location_permission_result", {
          source_surface: "home",
          result: "granted",
        });
        try {
          const qs = new URLSearchParams({
            lat: String(pos.coords.latitude),
            lon: String(pos.coords.longitude),
            radiusKm: String(radiusKm),
            limit: "20",
          });
          const res = await fetch(`/api/nearby?${qs.toString()}`);
          if (requestId !== requestSeqRef.current) return;
          if (!res.ok) throw new Error("nearby fetch failed");
          const data: NearbyResponse = await res.json();
          if (requestId !== requestSeqRef.current) return;
          const list = data.items ?? [];
          setItems(list);
          setStatus("success");
          setMessage(
            list.length
              ? null
              : `반경 ${radiusKm}km 내 약국을 찾지 못했습니다.`,
          );
          trackAnalyticsEvent("pharmacy_results_loaded", {
            search_mode: "gps",
            source_surface: "home",
            result_count_bucket: bucketResultCount(list.length),
            radius_km: radiusKm,
          });
        } catch {
          if (requestId !== requestSeqRef.current) return;
          setStatus("error");
          setMessage(
            "데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.",
          );
        }
      },
      (err) => {
        if (requestId !== requestSeqRef.current) return;
        trackAnalyticsEvent("location_permission_result", {
          source_surface: "home",
          result:
            err.code === err.PERMISSION_DENIED
              ? "denied"
              : err.code === err.TIMEOUT
                ? "timeout"
                : "unavailable",
        });
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          setMessage(
            "위치 권한이 거부되었습니다. 지역별 찾기를 이용해 주세요.",
          );
        } else {
          setMessage("위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function searchByKeyword(term: string) {
    trackAnalyticsEvent("pharmacy_search_submitted", {
      search_mode: "keyword",
      source_surface: "home",
    });
    lastSearchRef.current = { mode: "keyword", term };
    focusResultsRef.current = true;
    const requestId = ++requestSeqRef.current;
    setStatus("loading");
    setMessage("검색어로 약국을 찾고 있습니다...");
    try {
      const qs = new URLSearchParams({
        q: term,
        limit: "20",
      });
      const res = await fetch(`/api/nearby?${qs.toString()}`);
      if (requestId !== requestSeqRef.current) return;
      if (!res.ok) throw new Error("keyword fetch failed");
      const data: NearbyResponse = await res.json();
      if (requestId !== requestSeqRef.current) return;
      const list = data.items ?? [];
      setItems(list);
      setStatus("success");
      setMessage(
        list.length
          ? null
          : `"${term}" 검색 결과가 없습니다. 현재 위치로 다시 찾아보세요.`,
      );
      trackAnalyticsEvent("pharmacy_results_loaded", {
        search_mode: "keyword",
        source_surface: "home",
        result_count_bucket: bucketResultCount(list.length),
      });
    } catch {
      if (requestId !== requestSeqRef.current) return;
      setStatus("error");
      setMessage(
        "검색 중 오류가 발생했습니다. 현재 위치로 다시 시도해 주세요.",
      );
    }
  }

  useEffect(() => {
    setGeoAvailable(
      typeof navigator !== "undefined" && "geolocation" in navigator,
    );
  }, []);

  useEffect(() => {
    if (
      !focusResultsRef.current ||
      (status !== "success" && status !== "error")
    )
      return;
    focusResultsRef.current = false;
    const heading = resultsHeadingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [status]);

  function retryLastSearch() {
    const last = lastSearchRef.current;
    if (last.mode === "keyword") void searchByKeyword(last.term);
    else void fetchNearby();
  }

  const hasDistance = items.some((item) => typeof item.distanceKm === "number");

  const sorted = useMemo(() => {
    const base = [...items];
    return base.sort((a, b) => {
      if (sortMode === "distance") {
        return (
          (a.distanceKm ?? Number.POSITIVE_INFINITY) -
          (b.distanceKm ?? Number.POSITIVE_INFINITY)
        );
      }
      const aClose = closingMinutes(a, time);
      const bClose = closingMinutes(b, time);
      return aClose - bClose;
    });
  }, [items, sortMode, time]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (term.length >= 2) {
      void searchByKeyword(term);
      return;
    }
    if (term.length === 1) {
      // Do not fall back to an unrequested GPS/location prompt for a
      // too-short query; ask the user to type more instead.
      setStatus("error");
      setMessage("검색어는 2글자 이상 입력해주세요.");
      return;
    }
    void fetchNearby();
  }

  const regionGrid = useMemo(
    () => (
      <div className="city-region-grid grid grid-cols-2 gap-2 sm:grid-cols-4">
        {provinces.map((name) => (
          <Link
            key={name}
            href={`/${encodeURIComponent(name)}/전체`}
            className="city-region-link border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-4 text-center text-sm font-black text-[var(--ink)] transition-colors hover:bg-[var(--lime)]"
          >
            {name}
          </Link>
        ))}
      </div>
    ),
    [],
  );

  return (
    <div className="city-home min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="container py-8 sm:py-12">
        <JsonLd id="home-faq-schema" data={homeFaqSchema} />
        <div className="city-home-layout">
          <div className="min-w-0 flex-1 space-y-12">
            <section
              className="city-home-hero"
              aria-labelledby="city-home-title"
            >
              <div className="city-home-copy flex flex-col justify-between gap-8 bg-[var(--paper)] p-6 sm:p-10 lg:p-12">
                <div>
                  <p className="city-eyebrow mb-5 text-xs font-black tracking-[0.15em]">
                    01 / FIND YOUR PHARMACY
                  </p>
                  <h1
                    id="city-home-title"
                    className="city-display break-keep text-[clamp(2.25rem,5vw,5rem)] font-black leading-[1.08] tracking-[-0.075em]"
                  >
                    우리 동네
                    <br />
                    <span className="whitespace-nowrap">약국이 필요한</span>
                    <br />
                    <span className="text-[var(--coral-text)]">바로 지금.</span>
                  </h1>
                  <p className="mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
                    지역명이나 약국명으로 찾고 등록된 영업시간과 연락처를
                    확인하세요. 실제 운영과 재고는 달라질 수 있으니 방문 전 전화
                    확인을 권장합니다.
                  </p>
                </div>
                <div>
                  <form
                    onSubmit={onSubmit}
                    className="city-home-search flex flex-col border-2 border-[var(--ink)] bg-white sm:flex-row"
                    role="search"
                  >
                    <label htmlFor="city-home-query" className="sr-only">
                      지역명 또는 약국명
                    </label>
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                      <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <input
                        id="city-home-query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="지역 또는 약국명 검색"
                        autoComplete="off"
                        className="min-h-14 w-full min-w-0 bg-transparent text-base font-bold outline-none placeholder:text-[#69806e]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="city-button min-h-14 border-t-2 border-[var(--ink)] px-6 text-sm font-black sm:border-l-2 sm:border-t-0"
                    >
                      검색하기 <ArrowRight className="ml-1 inline h-4 w-4" />
                    </button>
                  </form>
                  <div className="city-home-quick-links mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm font-black">
                    <button
                      type="button"
                      onClick={() => void fetchNearby()}
                      disabled={!geoAvailable}
                      className="inline-flex min-h-11 items-center gap-1 underline underline-offset-4 disabled:opacity-50"
                    >
                      <LocateFixed className="h-4 w-4" /> 현재 위치로 찾기
                    </button>
                    <Link
                      href="/guide/night-weekend"
                      className="underline underline-offset-4"
                    >
                      야간·주말 안내 ↗
                    </Link>
                    <Link
                      href="/guide/holiday-checklist"
                      className="underline underline-offset-4"
                    >
                      공휴일 체크 ↗
                    </Link>
                    <Link
                      href="/nearby"
                      className="underline underline-offset-4"
                    >
                      내 주변 전체 보기 ↗
                    </Link>
                  </div>
                  {status === "idle" ? (
                    <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
                      현재 위치 검색 시 위치 권한 창이 열립니다. 위치는 검색에만
                      사용하고 저장하지 않습니다.
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="city-home-art min-h-[320px]">
                <span className="city-eyebrow text-xs font-black tracking-[0.12em]">
                  CITY / PHARMACY WAYFINDING SYSTEM
                </span>
                <Image
                  loading="eager"
                  src="/city-signal/metro-map.svg"
                  alt="가상의 도시 노선도에서 약국 위치를 강조한 일러스트"
                  width={640}
                  height={500}
                  className="mx-auto max-h-[430px] w-full object-contain"
                />
                <div className="flex justify-between gap-2 border-t border-[var(--ink)] pt-3 text-[10px] font-black sm:text-xs">
                  <span>● LOCATION</span>
                  <span>● HOURS</span>
                  <span>● CALL FIRST</span>
                </div>
              </div>
            </section>
            <div className="city-home-ticker -mt-12 flex justify-around gap-2 bg-[var(--ink)] px-4 py-4 text-[10px] font-black tracking-widest text-[var(--lime)] sm:text-xs">
              <span>FIND THE PLACE</span>
              <span>↗</span>
              <span>CHECK THE HOURS</span>
              <span>↗</span>
              <span>CALL BEFORE YOU GO</span>
            </div>

            {/* List header */}
            <section className="city-home-results space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[var(--ink)] pb-4">
                <div>
                  <p className="city-eyebrow text-xs font-black tracking-widest">
                    02 / SEARCH RESULTS
                  </p>
                  <h2
                    ref={resultsHeadingRef}
                    tabIndex={-1}
                    className="mt-2 text-3xl font-black tracking-tight outline-offset-4"
                  >
                    검색한 약국{" "}
                    <span className="text-[var(--coral-text)]">↗</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSortMode("distance")}
                    disabled={!hasDistance}
                    title={
                      hasDistance
                        ? undefined
                        : "현재 위치로 찾을 때 거리순을 쓸 수 있어요"
                    }
                    aria-pressed={sortMode === "distance" && hasDistance}
                    className={`city-pill inline-flex min-h-11 items-center gap-1 border border-[var(--ink)] px-4 py-2 text-sm font-bold ${
                      sortMode === "distance" && hasDistance
                        ? "bg-[var(--lime)]"
                        : "bg-transparent hover:bg-[var(--fog)]"
                    } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    거리순
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortMode("closing")}
                    aria-pressed={sortMode === "closing"}
                    className={`city-pill inline-flex min-h-11 items-center gap-1 border border-[var(--ink)] px-4 py-2 text-sm font-bold ${
                      sortMode === "closing"
                        ? "bg-[var(--lime)]"
                        : "bg-transparent hover:bg-[var(--fog)]"
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
                      className="city-panel border border-[var(--ink)] bg-white p-4 animate-pulse"
                    >
                      <div className="h-4 w-1/3 bg-slate-200 rounded" />
                      <div className="h-4 w-2/3 bg-slate-100 rounded mt-3" />
                    </div>
                  ))}
                </div>
              ) : null}

              {message ? (
                <div
                  role="status"
                  className="city-panel border-l-4 border-[var(--coral)] bg-[var(--fog)] p-4 text-sm font-bold"
                >
                  {message}
                  {status === "error" && lastSearchRef.current ? (
                    <button
                      type="button"
                      onClick={retryLastSearch}
                      className="city-button ml-3 min-h-11 border-2 border-[var(--ink)] bg-[var(--lime)] px-4 text-sm font-black"
                    >
                      다시 시도
                    </button>
                  ) : null}
                </div>
              ) : null}

              <p role="status" className="sr-only">
                {status === "success" ? `검색 결과 ${sorted.length}곳` : ""}
              </p>

              {status === "success" && sorted.length === 0 ? (
                <div className="city-panel border-2 border-[var(--ink)] bg-white p-6 space-y-3">
                  <p className="text-sm text-gray-600">
                    검색 결과가 없습니다. 검색어를 바꾸거나 아래에서 시·도를
                    골라 지역별로 찾아보세요.
                  </p>
                  {regionGrid}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void fetchNearby()}
                      className="city-button inline-flex items-center justify-center border-2 border-[var(--ink)] bg-[var(--lime)] px-5 py-2 text-sm font-black hover:bg-[var(--lime)]"
                      disabled={!geoAvailable}
                    >
                      <LocateFixed className="h-4 w-4 mr-2" />
                      위치로 찾기
                    </button>
                  </div>
                </div>
              ) : null}

              {sorted.length > 0 ? (
                <div className="city-directory-list border-t-2 border-[var(--ink)]">
                  {sorted.slice(0, 8).map((p, index) => {
                    const s = getOperatingStatusAt(
                      p.operating_hours,
                      new Date(time ?? Number.NaN),
                    );
                    const callablePhone = hasValidPhone(p.tel) ? p.tel : null;
                    return (
                      <div
                        key={p.hpid}
                        className="city-directory-item border-b border-[#9baa9d] bg-[var(--paper)] px-1 py-6 transition-colors hover:bg-[var(--fog)]"
                        data-pharmacy-id={p.hpid}
                        data-source-surface="home_results"
                        data-opening-status={s.label}
                        data-result-rank={index + 1}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`city-status inline-flex items-center border px-2 py-1 text-xs font-black ${
                                  s.label === "영업 중"
                                    ? "border-[#7bba92] bg-[#e1fae9] text-[#155c3c]"
                                    : s.label === "곧 종료"
                                      ? "border-[#deb078] bg-[#fff0dc] text-[#6b4819]"
                                      : "border-[#a9a39a] bg-[#f3eddf] text-[#685d4b]"
                                }`}
                              >
                                {s.label} · 시간표 기준
                              </span>
                              <Link
                                href={`/pharmacy/${p.hpid}`}
                                className="truncate text-lg font-black text-[var(--ink)] hover:underline sm:text-2xl"
                              >
                                {p.name}
                              </Link>
                            </div>
                            <p className="mt-2 flex items-center gap-1 truncate text-sm text-[var(--muted)]">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {p.address}
                            </p>
                            <p
                              className="mt-1 text-sm font-bold"
                              data-today-hours
                            >
                              {todayHoursText(p, time)}
                            </p>
                          </div>
                          {typeof p.distanceKm === "number" ? (
                            <div className="flex flex-col items-end shrink-0">
                              <p className="text-sm font-black text-[var(--ink)]">{`${Math.round(p.distanceKm * 1000)}m`}</p>
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#9baa9d] pt-3">
                          {callablePhone ? (
                            <a
                              href={`tel:${callablePhone}`}
                              className="city-button inline-flex min-h-11 items-center justify-center gap-2 border-2 border-[var(--ink)] bg-[var(--lime)] px-5 py-2 text-sm font-black hover:bg-[var(--lime)]"
                              aria-label={`${p.name}에 전화하기`}
                            >
                              <Phone className="h-4 w-4" />
                              전화 확인
                            </a>
                          ) : null}
                          <Link
                            href={`/pharmacy/${p.hpid}`}
                            className="city-button city-button-secondary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2 text-sm font-black"
                          >
                            상세·길찾기
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                          <p className="basis-full text-xs text-slate-500">
                            영업 여부와 재고는 방문 전 전화로 확인해 주세요.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* 지역별 바로가기(권한 거부 대비) */}
              <section className="city-home-regions space-y-4 border-2 border-[var(--ink)] bg-[var(--fog)] p-6 sm:p-8">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-[var(--ink)]">
                      지역별 바로 찾기
                    </h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      위치 권한을 거부해도 지역별 목록으로 바로 이동할 수
                      있습니다.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 border border-[var(--ink)] bg-[var(--lime)] px-4 py-2 text-sm font-bold">
                    <LocateFixed className="h-4 w-4 text-brand-700" />
                    반경 {radiusKm}km 기준 추천
                  </div>
                </div>
                {regionGrid}
              </section>
            </section>

            <section
              className="city-home-steps"
              aria-labelledby="city-steps-title"
            >
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="city-eyebrow text-xs font-black tracking-widest">
                    WAYFINDING / HOW IT WORKS
                  </p>
                  <h2
                    id="city-steps-title"
                    className="mt-2 text-3xl font-black tracking-tight sm:text-4xl"
                  >
                    찾는 방법도,{" "}
                    <span className="text-[var(--coral-text)]">명확하게.</span>
                  </h2>
                </div>
                <span className="text-xs font-black tracking-widest">
                  3 STEPS / ZERO GUESSWORK
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Link
                  href="/서울/전체"
                  className="city-step flex min-h-40 flex-col justify-between border-2 border-[var(--ink)] bg-[var(--fog)] p-5 hover:bg-[var(--lime)]"
                >
                  <span className="text-xs font-black tracking-widest">
                    01 / LOCATION
                  </span>
                  <strong className="text-2xl leading-tight">
                    어디서
                    <br />
                    찾으세요?
                  </strong>
                  <span className="border-t border-[var(--ink)] pt-2 text-xs font-black">
                    지역별 목록 ↗
                  </span>
                </Link>
                <Link
                  href="/nearby"
                  className="city-step flex min-h-40 flex-col justify-between border-2 border-[var(--ink)] bg-[var(--lime)] p-5 hover:bg-[var(--lime)]"
                >
                  <span className="text-xs font-black tracking-widest">
                    02 / HOURS
                  </span>
                  <strong className="text-2xl leading-tight">
                    언제
                    <br />
                    필요하세요?
                  </strong>
                  <span className="border-t border-[var(--ink)] pt-2 text-xs font-black">
                    현재 위치·등록 시간표 ↗
                  </span>
                </Link>
                <Link
                  href="/guide/holiday-checklist"
                  className="city-step city-step-dark flex min-h-40 flex-col justify-between border-2 border-[var(--ink)] bg-[var(--ink)] p-5 text-[var(--paper)] hover:bg-[var(--ink)]"
                >
                  <span className="text-xs font-black tracking-widest">
                    03 / CONFIRM
                  </span>
                  <strong className="text-2xl leading-tight">
                    가기 전에
                    <br />
                    전화부터.
                  </strong>
                  <span className="border-t border-[var(--paper)] pt-2 text-xs font-black">
                    영업·재고 직접 확인 ↗
                  </span>
                </Link>
              </div>
            </section>

            <RecentBlogPosts />

            <HomeTrustSections />
          </div>
          {/* end main content */}

          <DesktopSidebar />
        </div>
        {/* end flex row */}
      </div>

      {/* FAB */}
      <Link
        href="/nearby"
        className="city-home-fab fixed bottom-7 right-8 z-40 hidden items-center gap-2 border-2 border-[var(--ink)] bg-[var(--lime)] px-5 py-3 text-sm font-black text-[var(--ink)] shadow-[5px_5px_0_var(--ink)] transition-colors hover:bg-[var(--lime)] lg:inline-flex"
      >
        <MapIcon className="h-5 w-5" />내 주변 약국 찾기
      </Link>
    </div>
  );
}

function closingMinutes(
  pharmacy: PharmacyCardProps["pharmacy"],
  time: number | null,
) {
  if (time === null) return Number.POSITIVE_INFINITY;
  return (
    getOperatingStatusAt(pharmacy.operating_hours, new Date(time))
      .minutesUntilClose ?? Number.POSITIVE_INFINITY
  );
}

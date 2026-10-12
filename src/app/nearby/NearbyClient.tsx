"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LocateFixed } from "lucide-react";
import { PharmacyCard } from "@/components/pharmacy-card";

import { getOperatingStatusAt } from "@/lib/hours";
import { useEvaluationTime } from "@/components/use-evaluation-time";
import type { PharmacyCardProps } from "@/components/pharmacy-card";
import { bucketResultCount, trackAnalyticsEvent } from "@/lib/client-analytics";

type NearbyPharmacy = PharmacyCardProps["pharmacy"] & { distanceKm?: number };

type NearbyResponse = {
  items: NearbyPharmacy[];
  total: number;
};



export default function NearbyPage() {
  const time = useEvaluationTime();
  const [items, setItems] = useState<NearbyPharmacy[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [geoAvailable, setGeoAvailable] = useState(true);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [radiusKm, setRadiusKm] = useState(3);
  const [sortMode, setSortMode] = useState<"distance" | "closing">("distance");
  // Guards against response inversion when the radius is switched quickly
  // (e.g. 3km -> 10km -> 5km): only the latest request may update state.
  const requestSeqRef = useRef(0);

  async function fetchNearby(targetRadiusKm = radiusKm) {
    setHasRequestedLocation(true);
    trackAnalyticsEvent("pharmacy_search_submitted", {
      search_mode: "gps",
      source_surface: "nearby",
    });

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoAvailable(false);
      setStatus("error");
      setMessage("GPS를 지원하지 않습니다. 지역별 찾기를 이용해 주세요.");
      return;
    }

    const requestId = ++requestSeqRef.current;
    setStatus("loading");
    setMessage("현재 위치를 확인하고 있습니다...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (requestId !== requestSeqRef.current) return;
        try {
          const qs = new URLSearchParams({
            lat: String(pos.coords.latitude),
            lon: String(pos.coords.longitude),
            radiusKm: String(targetRadiusKm),
            limit: "40",
          });
          const res = await fetch(`/api/nearby?${qs.toString()}`);
          if (requestId !== requestSeqRef.current) return;
          if (!res.ok) throw new Error("위치 기반 약국 정보를 불러오지 못했습니다.");
          const data: NearbyResponse = await res.json();
          if (requestId !== requestSeqRef.current) return;
          setItems(data.items ?? []);
          setStatus("success");
          setMessage(
            data.items.length ? null : `반경 ${targetRadiusKm}km 내 영업 약국이 없습니다.`,
          );
          trackAnalyticsEvent("pharmacy_results_loaded", {
            search_mode: "gps",
            source_surface: "nearby",
            result_count_bucket: bucketResultCount(data.items.length),
            radius_km: targetRadiusKm,
          });
        } catch {
          if (requestId !== requestSeqRef.current) return;
          setStatus("error");
          setMessage("데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      },
      (err) => {
        if (requestId !== requestSeqRef.current) return;
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          setMessage("권한이 거부되었습니다. 지역별 찾기를 이용해 주세요.");
        } else {
          setMessage("위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
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
      const aClose = closingMinutes(a, time);
      const bClose = closingMinutes(b, time);
      return aClose - bClose;
    });
  }, [items, sortMode, time]);

  const topThree = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const listForAds = topThree.length ? rest : sorted;



  return (
    <div className="city-nearby min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="container space-y-6 py-8 sm:py-12">
      <header className="city-nearby-hero overflow-hidden">
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="city-eyebrow text-xs font-black tracking-[0.15em]">01 / NEARBY PHARMACY</p>
          <h1 className="mt-5 text-[clamp(2.8rem,6vw,5.8rem)] font-black leading-[1.08] tracking-[-0.07em]">내 주변 약국,<br /><span className="text-[var(--coral-text)]">한눈에 찾기.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed">가까운 순서와 등록 운영시간을 비교하세요. 영업 여부와 재고는 방문 전 전화로 확인해 주세요.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => void fetchNearby()} disabled={!geoAvailable} className="city-button inline-flex min-h-11 items-center gap-2 border-2 border-[var(--ink)] bg-[var(--lime)] px-5 py-3 text-sm font-black disabled:opacity-50"><LocateFixed className="h-4 w-4" />현재 위치로 찾기</button>
            <Link href="/서울/전체" className="city-button city-button-secondary inline-flex min-h-11 items-center px-5 py-3 text-sm font-black">지역별 찾기 ↗</Link>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">위치 권한은 버튼을 누를 때 요청하며, 위치는 검색에만 사용하고 저장하지 않습니다.</p>
        </div>
        <div className="city-nearby-art flex min-h-[280px] items-center border-t-2 border-[var(--ink)] bg-[var(--lime)] p-6 min-[851px]:border-l-2 min-[851px]:border-t-0"><Image loading="eager" src="/city-signal/metro-map.svg" alt="도시 안내 노선도 일러스트" width={640} height={500} className="mx-auto max-h-[370px] w-full object-contain" /></div>
      </header>
      <section className="city-nearby-filters border-b-2 border-[var(--ink)] py-5">
        <div className="mb-4"><p className="city-eyebrow text-xs font-black tracking-widest">SEARCH CONTROLS / {radiusKm} KM</p><h2 className="mt-2 text-2xl font-black">탐색 반경과 정렬</h2></div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          {[3, 5, 10].map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={radiusKm === r}
              onClick={() => {
                setItems([]);
                setRadiusKm(r);
                if (hasRequestedLocation) {
                  void fetchNearby(r);
                }
              }}
              className={`city-pill min-h-11 border border-[var(--ink)] px-4 py-2 ${radiusKm === r
                ? "bg-[var(--lime)]"
                : "bg-transparent hover:bg-[var(--fog)]"
                }`}
            >
              반경 {r}km
            </button>
          ))}
          <span className="mx-2 h-4 w-px bg-[var(--ink)]" />
          <button
            type="button"
            aria-pressed={sortMode === "distance"}
            onClick={() => setSortMode("distance")}
            className={`city-pill min-h-11 border border-[var(--ink)] px-4 py-2 ${sortMode === "distance"
              ? "bg-[var(--lime)]"
              : "bg-transparent hover:bg-[var(--fog)]"
              }`}
          >
            거리순
          </button>
          <button
            type="button"
            aria-pressed={sortMode === "closing"}
            onClick={() => setSortMode("closing")}
            className={`city-pill min-h-11 border border-[var(--ink)] px-4 py-2 ${sortMode === "closing"
              ? "bg-[var(--lime)]"
              : "bg-transparent hover:bg-[var(--fog)]"
              }`}
          >
            종료 임박순
          </button>
          <span className="ml-auto text-[var(--muted)]">공공데이터 기반 · 위치 접근 허용 필요</span>
        </div>
      </section>

      <div className="city-nearby-layout grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="city-eyebrow text-xs font-black tracking-widest">02 / DIRECTORY</p><h2 className="mt-1 text-3xl font-black">약국 목록 <span className="text-[var(--coral-text)]">↗</span></h2></div><span className="text-xs font-bold text-[var(--muted)]">{status === "success" ? `${items.length}곳 · ${sortMode === "distance" ? "거리순" : "종료 임박순"}` : "검색 후 결과 표시"}</span></div>
      {status === "idle" ? (
        <section className="city-panel border-2 border-[var(--ink)] bg-[var(--fog)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">GPS 연결 후 주변 약국을 찾습니다</h2>
              <p className="text-sm text-slate-600">
                버튼을 누르면 브라우저 위치 권한 창이 열립니다. 위치는 검색에만 사용하고 저장하지 않습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchNearby()}
              className="city-button inline-flex min-h-11 items-center justify-center gap-2 border-2 border-[var(--ink)] bg-[var(--lime)] px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!geoAvailable}
            >
              <LocateFixed className="h-4 w-4" />
              현재 위치로 약국 찾기
            </button>
          </div>
        </section>
      ) : null}

      {status === "loading" ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="city-panel animate-pulse space-y-3 border border-[#9baa9d] bg-white p-4"
            >
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : null}

      {message ? (
        <p role="status" className="city-panel border-l-4 border-[var(--coral)] bg-[var(--fog)] px-4 py-3 text-sm font-bold">
          {message}
        </p>
      ) : null}

      {status === "success" && items.length === 0 ? (
        <div className="city-panel space-y-3 border-2 border-[var(--ink)] bg-white p-6">
          <p className="text-sm text-[var(--muted)]">반경 {radiusKm}km 내 영업 약국이 없습니다.</p>
          <Link
            href="/서울/전체"
            className="city-button city-button-secondary inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-bold"
          >
            지역별로 다시 찾기
          </Link>
        </div>
      ) : null}

      {topThree.length ? (
        <section className="city-directory-list border-t-2 border-[var(--ink)]">
          <div className="flex items-center gap-2">
            <h3 className="py-3 text-sm font-black">우선 결과 3곳</h3>
            <span className="text-xs text-[var(--muted)]">
              {sortMode === "distance" ? "거리 기준" : "종료 임박순"}
            </span>
          </div>
          <div>
            {topThree.map((item, index) => (
              <div
                key={item.hpid}
                className="city-directory-item border-t border-[#9baa9d] py-4"
              >
                <PharmacyCard
                  pharmacy={item}
                  distanceKm={item.distanceKm}
                  sourceSurface="nearby_results"
                  resultRank={index + 1}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {listForAds.length > 0 ? (
        <div className="city-directory-list border-t-2 border-[var(--ink)]">
          {listForAds.map((item, index) => (
            <div key={item.hpid} className="city-directory-item border-b border-[#9baa9d] py-4">
              <PharmacyCard
                pharmacy={item}
                distanceKm={item.distanceKm}
                sourceSurface="nearby_results"
                resultRank={topThree.length ? index + 4 : index + 1}
              />
            </div>
          ))}
        </div>
      ) : null}

      {status === "error" && (
        <div className="city-panel border-l-4 border-[var(--coral)] bg-[#fff0dc] px-4 py-3 text-sm font-bold">
          위치 기반 검색이 실패했습니다. 권한을 확인하시거나 지역별 페이지로 이동해 주세요.
        </div>
      )}
      </div>
      <aside className="city-nearby-aside self-start border-2 border-[var(--ink)] bg-[var(--lime)] p-5 lg:sticky lg:top-24">
        <p className="city-eyebrow text-xs font-black tracking-widest">BEFORE YOU GO / 3 CHECKS</p>
        <h2 className="my-5 text-3xl font-black leading-tight">출발 전,<br />이 세 가지.</h2>
        <ol className="space-y-3 text-sm font-bold"><li className="flex justify-between border-b border-[var(--ink)] pb-2"><span>01</span><span>등록 영업시간 확인</span></li><li className="flex justify-between border-b border-[var(--ink)] pb-2"><span>02</span><span>전화로 현장 운영 확인</span></li><li className="flex justify-between border-b border-[var(--ink)] pb-2"><span>03</span><span>의약품 취급·재고 확인</span></li></ol>
        <p className="my-5 text-xs leading-relaxed">공공데이터의 시간표는 실제 운영과 다를 수 있습니다. 표시된 거리는 위치 검색 결과를 기준으로 합니다.</p>
        <Link href="/guide/night-weekend" className="city-button city-button-secondary inline-flex min-h-11 items-center px-4 text-xs font-black">약국 이용 가이드 ↗</Link>
      </aside>
      </div>
      </div>
    </div>
  );
}

function closingMinutes(pharmacy: PharmacyCardProps["pharmacy"], time: number | null) {
  if (time === null) return Number.POSITIVE_INFINITY;
  return getOperatingStatusAt(pharmacy.operating_hours, new Date(time)).minutesUntilClose ?? Number.POSITIVE_INFINITY;
}

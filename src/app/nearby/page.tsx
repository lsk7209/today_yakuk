"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LocateFixed, MapPin, ShieldCheck } from "lucide-react";
import { PharmacyCard } from "@/components/pharmacy-card";
import { AdsPlaceholder } from "@/components/ads-placeholder";

type NearbyResponse = {
  items: Array<
    {
      distanceKm?: number;
    } & PharmacyCardProps["pharmacy"]
  >;
  total: number;
};

import type { PharmacyCardProps } from "@/components/pharmacy-card";

export default function NearbyPage() {
  const [items, setItems] = useState<PharmacyCardProps["pharmacy"][]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setMessage("GPS를 지원하지 않습니다. 지역별 찾기를 이용해 주세요.");
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
            radiusKm: "3",
            limit: "40",
          });
          const res = await fetch(`/api/nearby?${qs.toString()}`);
          if (!res.ok) throw new Error("위치 기반 약국 정보를 불러오지 못했습니다.");
          const data: NearbyResponse = await res.json();
          setItems(data.items ?? []);
          setStatus("success");
          setMessage(data.items.length ? null : "반경 3km 내 영업 약국이 없습니다.");
        } catch {
          setStatus("error");
          setMessage("데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      },
      (err) => {
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          setMessage("권한이 거부되었습니다. 지역별 찾기를 이용해 주세요.");
        } else {
          setMessage("위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const adsInserted = useMemo(() => {
    const blocks: Array<{ ad: true; id: string } | (PharmacyCardProps["pharmacy"] & { distanceKm?: number })> = [];
    items.forEach((p, idx) => {
      blocks.push(p);
      if ((idx + 1) % 5 === 0) {
        blocks.push({ ad: true, id: `ad-${idx}` });
      }
    });
    return blocks;
  }, [items]);

  return (
    <div className="container py-10 sm:py-14 space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700 flex items-center gap-2">
          <LocateFixed className="h-4 w-4" />
          내 주변 · 반경 3km
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl font-bold">내 주변 문 연 약국 찾기</h1>
          <p className="text-xs text-[var(--muted)]">
            GPS 권한 기반으로 인근 영업 약국을 불러옵니다.
          </p>
        </div>
        <div className="flex gap-2 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            공공데이터 기반
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <MapPin className="h-4 w-4 text-brand-600" />
            위치 접근 허용 필요
          </span>
        </div>
      </header>

      {status === "loading" ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm animate-pulse space-y-3"
            >
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : null}

      {message ? (
        <p className="text-sm text-brand-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {message}
        </p>
      ) : null}

      {status === "success" && items.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-3">
          <p className="text-sm text-[var(--muted)]">반경 3km 내 영업 약국이 없습니다.</p>
          <Link
            href="/서울/전체"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold hover:border-brand-200"
          >
            지역별로 다시 찾기
          </Link>
        </div>
      ) : null}

      {adsInserted.length > 0 ? (
        <div className="space-y-4">
          {adsInserted.map((item) =>
            "ad" in item ? (
              <AdsPlaceholder key={item.id} />
            ) : (
              <div key={item.hpid} className="hover:shadow-lg transition-shadow rounded-2xl">
                <PharmacyCard pharmacy={item} distanceKm={item.distanceKm} />
              </div>
            ),
          )}
        </div>
      ) : null}

      {status === "error" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
          위치 기반 검색이 실패했습니다. 권한을 확인하시거나 지역별 페이지로 이동해 주세요.
        </div>
      )}
    </div>
  );
}


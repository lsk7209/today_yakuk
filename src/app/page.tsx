"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LocateFixed, ShieldCheck, MapPin, Smartphone, Sparkles } from "lucide-react";
import { AdsPlaceholder } from "@/components/ads-placeholder";

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

export default function Home() {
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegionPrompt, setShowRegionPrompt] = useState(false);

  const regionGrid = useMemo(
    () => (
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${showRegionPrompt ? "fade-in" : ""}`}
      >
        {provinces.map((name) => (
          <Link
            key={name}
            href={`/${encodeURIComponent(name)}/전체`}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold text-center hover:border-brand-200 hover:shadow-sm transition"
          >
            {name}
          </Link>
        ))}
      </div>
    ),
    [showRegionPrompt],
  );

  const handleGeoLocate = () => {
    if (!("geolocation" in navigator)) {
      setGeoMessage("GPS를 사용할 수 없습니다. 지역별 찾기를 이용해주세요.");
      setShowRegionPrompt(true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const { latitude, longitude } = pos.coords;
        setGeoMessage(
          `현재 위치 인식 완료 (위도 ${latitude.toFixed(
            3,
          )}, 경도 ${longitude.toFixed(3)}) · 인근 약국을 불러옵니다.`,
        );
        // 추후: 위경도 기반 리스트로 라우팅 혹은 서버 요청
      },
      () => {
        setLoading(false);
        setGeoMessage("권한이 거부되었습니다. '지역 선택' 메뉴로 바로 이동하세요.");
        setShowRegionPrompt(true);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="container py-10 sm:py-16 flex flex-col gap-12">
      <section className="rounded-3xl bg-white border border-[var(--border)] shadow-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(5,150,105,0.08),transparent_35%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              오늘 열어둔 약국만 빠르게
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-balance">
                내 주변 문 연 약국 찾기
              </h1>
              <p className="text-base text-[var(--muted)]">
                GPS 권한 한 번으로 야간·주말·공휴일 영업 약국을 즉시 확인하세요. 거부하셔도
                지역 선택 그리드가 바로 나타나도록 설계했습니다.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/nearby"
                className="relative inline-flex items-center justify-center rounded-full bg-brand-600 text-white px-6 py-4 text-base font-semibold hover:bg-brand-700 transition shadow-lg pulse-ring"
              >
                <LocateFixed className="mr-2 h-5 w-5" />
                내 주변 문 연 약국 찾기
              </Link>
              <Link
                href="/서울/전체"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--foreground)] hover:border-brand-200 hover:shadow-sm"
              >
                지역별 바로 찾기
              </Link>
            </div>
            <AdsPlaceholder label="광고 표시 영역" />
            {geoMessage ? (
              <p className="text-sm text-brand-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                {geoMessage}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-4 text-sm text-[var(--muted)]">
              <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-brand-700 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  위치
                </p>
                <p className="font-semibold text-[var(--foreground)]">
                  GPS 또는 지역별 버튼 지원
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-brand-700 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  신뢰
                </p>
                <p className="font-semibold text-[var(--foreground)]">
                  공공데이터 기반 실시간 업데이트
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-slate-50 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">지역 선택</h2>
                <p className="text-sm text-[var(--muted)]">
                  권한을 거부해도 바로 선택할 수 있는 빠른 메뉴
                </p>
              </div>
              <Smartphone className="h-5 w-5 text-brand-600" />
            </div>
            {regionGrid}
            <div className="rounded-xl bg-white text-sm text-[var(--muted)] px-3 py-2 flex items-center gap-2 border border-dashed border-emerald-100">
              <Sparkles className="h-4 w-4 text-brand-600" />
              모바일 터치 영역을 48px 이상으로 설계해 엄지 조작을 돕습니다.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

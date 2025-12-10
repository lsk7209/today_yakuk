"use client";

import Link from "next/link";
import { useMemo } from "react";
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
  const showRegionPrompt = true;

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
                한 번의 권한 요청으로 야간·주말·공휴일 영업 약국을 바로 보여줍니다.
                권한 거부 시에도 지역 선택으로 즉시 이동할 수 있게 설계했습니다.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="h-3 w-3" />
                  공공데이터 실시간 갱신
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                  <MapPin className="h-3 w-3 text-brand-600" />
                  반경 기반 추천
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                  <Sparkles className="h-3 w-3 text-brand-600" />
                  종료 임박 알림
                </span>
              </div>
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

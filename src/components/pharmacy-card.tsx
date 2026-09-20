"use client";

import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import { Pharmacy } from "@/types/pharmacy";
import { formatHourRange, formatHHMM, getBadgeClass, getOperatingStatusAt, getSeoulDayKey } from "@/lib/hours";
import { hasValidPhone } from "@/lib/pharmacy-indexability";
import { useEvaluationTime } from "./use-evaluation-time";

export type PharmacyCardProps = {
  pharmacy: Pharmacy;
  distanceKm?: number;
  sourceSurface?: "nearby_results" | "region_list" | "pharmacy_list";
  resultRank?: number;
  initialIso?: string;
};

export function PharmacyCard({
  pharmacy,
  distanceKm,
  sourceSurface = "pharmacy_list",
  resultRank,
  initialIso,
}: PharmacyCardProps) {
  const time = useEvaluationTime(initialIso);
  const instant = time === null ? null : new Date(time);
  const status = instant ? getOperatingStatusAt(pharmacy.operating_hours, instant) : null;
  const callablePhone = hasValidPhone(pharmacy.tel) ? pharmacy.tel : null;
  const todaySlot = instant ? pharmacy.operating_hours?.[getSeoulDayKey(instant)] : undefined;

  return (
    <article
      className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm flex gap-4 transition hover:shadow-lg hover:-translate-y-0.5"
      data-pharmacy-id={pharmacy.hpid}
      data-source-surface={sourceSurface}
      data-opening-status={status?.label ?? "시간 확인 중"}
      data-result-rank={resultRank}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--foreground)]">{pharmacy.name}</h3>
            <p className="text-sm text-[var(--muted)] flex items-center gap-1">
              <MapPin className="h-4 w-4 text-brand-600" />
              {pharmacy.address}
            </p>
          </div>
          <span data-pharmacy-status title="등록된 요일 시간표 기준입니다. 공휴일·임시휴무·휴게시간은 전화로 확인하세요." className={status ? getBadgeClass(status) : "text-xs text-slate-600"}>
            {status?.emoji && <span aria-hidden>{status.emoji}</span>}
            {status?.label ?? "시간 확인 중"}
            {status?.closesAt ? (
              <span className="text-[10px] text-slate-600">({formatHHMM(status.closesAt)} 종료)</span>
            ) : null}
          </span>
        </div>

        <p className="text-sm text-[var(--muted)] line-clamp-2">
          {pharmacy.description_raw ?? "상세 페이지에서 주소·전화·등록 영업시간을 확인하세요."}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <Clock className="h-3 w-3" />
            {instant ? `오늘 ${formatHourRange(todaySlot)}` : "시간 확인 중"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 font-semibold">
            지역: {pharmacy.city ?? pharmacy.province ?? "정보 없음"}
          </span>
          {distanceKm !== undefined ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-dashed border-[var(--border)]">
              거리: {distanceKm.toFixed(1)} km
            </span>
          ) : null}
          {callablePhone ? (
            <a
              className="inline-flex min-h-11 items-center gap-1 rounded-full bg-brand-700 text-white px-4 py-2 font-semibold hover:bg-brand-800"
              href={`tel:${callablePhone}`}
              aria-label={`${pharmacy.name}에 전화하기`}
            >
              <Phone className="h-3 w-3" />
              전화 확인
            </a>
          ) : null}
          <Link
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[var(--border)] bg-white px-4 py-2 font-semibold text-sm hover:border-brand-200"
            href={`/pharmacy/${pharmacy.hpid}`}
          >
            상세 보기
          </Link>
        </div>
        {callablePhone ? (
          <p className="text-xs text-slate-500">방문 전 영업 여부와 재고를 전화로 확인해 주세요.</p>
        ) : null}
      </div>
    </article>
  );
}


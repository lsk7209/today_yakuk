import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import { Pharmacy } from "@/types/pharmacy";
import { formatHourRange, getBadgeClass, getOperatingStatus } from "@/lib/hours";

export function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  const status = getOperatingStatus(pharmacy.operating_hours);
  const todayIntl = new Date().toLocaleString("en-US", {
    weekday: "short",
    timeZone: "Asia/Seoul",
  });
  const todaySlot = pharmacy.operating_hours
    ? pharmacy.operating_hours[dayKeyFromIntl(todayIntl)]
    : undefined;

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm flex gap-4 transition hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--foreground)]">{pharmacy.name}</h3>
            <p className="text-sm text-[var(--muted)] flex items-center gap-1">
              <MapPin className="h-4 w-4 text-brand-600" />
              {pharmacy.address}
            </p>
          </div>
          <span className={getBadgeClass(status)}>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            {status.label}
            {status.closesAt ? (
              <span className="text-[10px] text-slate-600">({status.closesAt} 종료)</span>
            ) : null}
          </span>
        </div>

        <p className="text-sm text-[var(--muted)] line-clamp-2">
          {pharmacy.description_raw ?? "친절 상담 가능한 약국입니다."}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <Clock className="h-3 w-3" />
            {todaySlot ? formatHourRange(todaySlot) : "오늘 영업 정보 없음"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 font-semibold">
            지역: {pharmacy.city ?? pharmacy.province ?? "정보 없음"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-dashed border-[var(--border)]">
            거리: 준비 중
          </span>
          {pharmacy.tel ? (
            <a
              className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white px-3 py-1 font-semibold"
              href={`tel:${pharmacy.tel}`}
            >
              <Phone className="h-3 w-3" />
              전화
            </a>
          ) : null}
          <Link
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1 font-semibold text-sm hover:border-brand-200"
            href={`/pharmacy/${pharmacy.hpid}`}
          >
            상세 보기
          </Link>
        </div>
      </div>
    </article>
  );
}

function dayKeyFromIntl(intlKey: string): keyof Pharmacy["operating_hours"] {
  const lower = intlKey.toLowerCase();
  if (lower.startsWith("sun")) return "sun";
  if (lower.startsWith("mon")) return "mon";
  if (lower.startsWith("tue")) return "tue";
  if (lower.startsWith("wed")) return "wed";
  if (lower.startsWith("thu")) return "thu";
  if (lower.startsWith("fri")) return "fri";
  return "sat";
}


import { notFound } from "next/navigation";
import Link from "next/link";
import { getPharmaciesByRegionPaginated } from "@/lib/data/pharmacies";
import { PharmacyListInfinite } from "@/components/pharmacy-list-infinite";

type Params = {
  province: string;
  city: string;
};

type SearchParams = {
  page?: string;
};

const PAGE_SIZE = 50;

export default async function ProvinceCityPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const province = decodeURIComponent(params.province);
  const city = decodeURIComponent(params.city);
  const currentPage = Math.max(1, Number(searchParams.page ?? "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { items, total } = await getPharmaciesByRegionPaginated(province, city, PAGE_SIZE, offset);

  if (!items.length) {
    return notFound();
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container py-10 sm:py-14 space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">
          {province} · {city === "전체" ? "모든 지역" : city}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl font-bold">영업 중인 약국 리스트</h1>
          <p className="text-xs text-[var(--muted)]">
            현재 시간 기준 상태 및 심야·공휴일 필터 지원
          </p>
        </div>
      </header>

      <Pagination currentPage={currentPage} totalPages={totalPages} province={province} city={city} />

      <PharmacyListInfinite
        province={province}
        city={city === "전체" ? undefined : city}
        initialItems={items}
        total={total}
        pageSize={PAGE_SIZE}
        initialOffset={offset}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} province={province} city={city} />
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  province,
  city,
}: {
  currentPage: number;
  totalPages: number;
  province: string;
  city: string;
}) {
  if (totalPages <= 1) return null;

  const baseHref = `/${encodeURIComponent(province)}/${encodeURIComponent(city)}`;
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center gap-2 text-sm text-[var(--muted)]" aria-label="페이지네이션">
      <Link
        href={`${baseHref}${currentPage > 1 ? `?page=${currentPage - 1}` : ""}`}
        className={`px-3 py-1 rounded-full border ${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:border-brand-200"}`}
      >
        이전
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={`${baseHref}${p === 1 ? "" : `?page=${p}`}`}
          className={`px-3 py-1 rounded-full border ${
            p === currentPage ? "bg-brand-600 text-white border-brand-600" : "hover:border-brand-200"
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={`${baseHref}${currentPage < totalPages ? `?page=${currentPage + 1}` : ""}`}
        className={`px-3 py-1 rounded-full border ${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:border-brand-200"}`}
      >
        다음
      </Link>
    </nav>
  );
}


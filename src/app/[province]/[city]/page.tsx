import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPharmaciesByRegionPaginated } from "@/lib/data/pharmacies";
import { PharmacyListInfinite } from "@/components/pharmacy-list-infinite";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/json-ld";
import { getSiteUrl } from "@/lib/site-url";

const GUIDE_LINKS = [
  { href: "/guide/holiday-checklist", label: "공휴일 체크리스트", desc: "연휴 전 확인할 약국 준비 항목" },
  { href: "/guide/night-weekend", label: "야간·주말 이용 가이드", desc: "심야에 문 연 약국 찾는 방법" },
  { href: "/guide/call-scripts", label: "전화 스크립트", desc: "재고·영업 여부 확인 문장 모음" },
  { href: "/blog/pharmacy-visit-checklist-3", label: "방문 전 확인 3가지", desc: "영업·재고·처방전 유효기간" },
];

const siteUrl = getSiteUrl();

type Params = {
  province: string;
  city: string;
};

type SearchParams = {
  page?: string;
};

const PAGE_SIZE = 50;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const province = decodeURIComponent(params.province);
  const city = decodeURIComponent(params.city);
  const cityDisplay = city === "전체" ? "전체 지역" : city;

  const title = `${province} ${cityDisplay} 약국 | 문 연 약국 실시간 찾기`;
  const description = `${province} ${cityDisplay}의 현재 영업 중인 약국을 실시간으로 확인하세요. 야간·주말·공휴일 운영 약국 필터와 길찾기를 제공합니다.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${encodeURIComponent(province)}/${encodeURIComponent(city)}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${encodeURIComponent(province)}/${encodeURIComponent(city)}`,
      siteName: "약국오늘",
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

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

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: siteUrl },
    { name: province, url: `${siteUrl}/${encodeURIComponent(province)}/전체` },
    ...(city !== "전체" ? [{ name: city, url: `${siteUrl}/${encodeURIComponent(province)}/${encodeURIComponent(city)}` }] : []),
  ]);

  return (
    <div className="container py-10 sm:py-14 space-y-6">
      <JsonLd data={breadcrumbSchema} id="breadcrumb-schema" />
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">
          {province} · {city === "전체" ? "모든 지역" : city}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl font-bold">
            {province} {city === "전체" ? "" : `${city} `}영업 중인 약국 찾기
          </h1>
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

      {/* 가이드 링크 — 내부 링크 강화 + 이탈률 감소 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-base font-black text-gray-900">약국 이용 전 확인하세요</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GUIDE_LINKS.map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
            >
              <p className="text-xs font-bold text-gray-900 leading-snug">{label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
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
          className={`px-3 py-1 rounded-full border ${p === currentPage ? "bg-brand-600 text-white border-brand-600" : "hover:border-brand-200"
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


import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getCanonicalProvinceSlug,
  getCitiesByProvince,
  getPharmaciesByRegionPaginated,
} from "@/lib/data/pharmacies";
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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const [{ province: rawProvince, city: rawCity }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const province = decodeURIComponent(rawProvince);
  const city = decodeURIComponent(rawCity);
  const canonicalProvince = getCanonicalProvinceSlug(province);
  const cityDisplay = city === "전체" ? "전체 지역" : city;
  const currentPage = getPageNumber(pageParam);
  const basePath = `/${encodeURIComponent(canonicalProvince)}/${encodeURIComponent(city)}`;
  const canonicalPath = currentPage > 1 ? `${basePath}?page=${currentPage}` : basePath;

  const title = `${canonicalProvince} ${cityDisplay} 약국${currentPage > 1 ? ` ${currentPage}페이지` : ""} | 영업시간·전화 찾기`;
  const description = `${canonicalProvince} ${cityDisplay} 약국의 등록 영업시간과 현재 운영 상태, 전화번호를 확인하세요. 실제 운영과 재고는 방문 전 전화 확인을 권장합니다.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: currentPage > 1 ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonicalPath}`,
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
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ province: rawProvince, city: rawCity }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const province = decodeURIComponent(rawProvince);
  const city = decodeURIComponent(rawCity);
  const currentPage = getPageNumber(pageParam);
  const canonicalProvince = getCanonicalProvinceSlug(province);
  if (province !== canonicalProvince) {
    const query = currentPage > 1 ? `?page=${currentPage}` : "";
    permanentRedirect(`/${encodeURIComponent(canonicalProvince)}/${encodeURIComponent(city)}${query}`);
  }
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [{ items, total }, cities] = await Promise.all([
    getPharmaciesByRegionPaginated(canonicalProvince, city, PAGE_SIZE, offset),
    city === "전체" ? getCitiesByProvince(canonicalProvince) : Promise.resolve([]),
  ]);

  if (!items.length) {
    return notFound();
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: siteUrl },
    { name: canonicalProvince, url: `${siteUrl}/${encodeURIComponent(canonicalProvince)}/${encodeURIComponent("전체")}` },
    ...(city !== "전체" ? [{ name: city, url: `${siteUrl}/${encodeURIComponent(canonicalProvince)}/${encodeURIComponent(city)}` }] : []),
  ]);

  return (
    <div className="container py-10 sm:py-14 space-y-6">
      <JsonLd data={breadcrumbSchema} id="breadcrumb-schema" />
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">
          {canonicalProvince} · {city === "전체" ? "모든 지역" : city}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl font-bold">
            {canonicalProvince} {city === "전체" ? "" : `${city} `}약국 영업시간·전화 찾기
          </h1>
          <p className="text-xs text-[var(--muted)]">
            등록 운영시간 기준 상태 · 방문 전 전화 확인 권장
          </p>
        </div>
      </header>

      <p className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
        목록에서 전화로 실제 영업 여부와 재고를 확인한 뒤 길찾기를 이용하면 헛걸음을 줄일 수 있습니다.
      </p>

      {cities.length > 0 ? (
        <nav className="rounded-2xl border border-gray-200 bg-white p-4" aria-label={`${canonicalProvince} 시군구 바로가기`}>
          <h2 className="text-base font-black text-gray-900">{canonicalProvince} 시·군·구별 약국</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map(({ city: cityName, pharmacyCount }) => (
              <Link
                key={cityName}
                href={`/${encodeURIComponent(canonicalProvince)}/${encodeURIComponent(cityName)}`}
                className="inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-800 hover:border-brand-300 hover:bg-brand-50"
              >
                {cityName} <span className="ml-1 text-xs font-medium text-gray-500">{pharmacyCount}</span>
              </Link>
            ))}
          </div>
        </nav>
      ) : city !== "전체" ? (
        <Link
          href={`/${encodeURIComponent(canonicalProvince)}/${encodeURIComponent("전체")}`}
          className="inline-flex min-h-11 items-center text-sm font-black text-brand-700 hover:text-brand-800"
        >
          {canonicalProvince} 전체 약국 보기
        </Link>
      ) : null}

      <Pagination currentPage={currentPage} totalPages={totalPages} province={canonicalProvince} city={city} />

      <PharmacyListInfinite
        province={canonicalProvince}
        city={city === "전체" ? undefined : city}
        initialItems={items}
        total={total}
        pageSize={PAGE_SIZE}
        initialOffset={offset}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} province={canonicalProvince} city={city} />

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

function getPageNumber(pageParam?: string) {
  const value = Number.parseInt(pageParam || "1", 10);
  return Number.isFinite(value) && value >= 1 ? value : 1;
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
        className={`inline-flex min-h-11 items-center px-3 py-2 rounded-full border ${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:border-brand-200"}`}
      >
        이전
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={`${baseHref}${p === 1 ? "" : `?page=${p}`}`}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center px-3 py-2 rounded-full border ${p === currentPage ? "bg-brand-600 text-white border-brand-600" : "hover:border-brand-200"
            }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={`${baseHref}${currentPage < totalPages ? `?page=${currentPage + 1}` : ""}`}
        className={`inline-flex min-h-11 items-center px-3 py-2 rounded-full border ${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:border-brand-200"}`}
      >
        다음
      </Link>
    </nav>
  );
}


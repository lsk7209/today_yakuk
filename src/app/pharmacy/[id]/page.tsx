import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
  ExternalLink,
  Timer,
  Bus,
  Train,
  ShieldCheck,
} from "lucide-react";
import { Pharmacy } from "@/types/pharmacy";

import { StickyFab } from "@/components/sticky-fab";
import { JsonLd } from "@/components/seo/json-ld";
import { CopyButton } from "@/components/copy-button";
import { SeoulNowBadge } from "@/components/seoul-now-badge";
import {
  PharmacyStatus,
  PharmacyTodayHours,
  PharmacyWeeklyHours,
  NearbyOpenPharmacies,
} from "@/components/pharmacy-hours";
import {
  PharmacyCategoryIllustration,
  ReportSectionSvgIcon,
} from "@/components/pharmacy-svg-illustrations";
import { buildPharmacyJsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import {
  findNearbyWithinKm,
  getPharmacyByHpid,
  getPharmaciesByRegion,
} from "@/lib/data/pharmacies";
import { distanceKm } from "@/lib/geo-distance";
import { buildAiLessDetailTemplate } from "@/lib/pharmacy-detail-template";
import { buildPharmacyIntelligenceReport } from "@/lib/pharmacy-intelligence";
import { getMapSearchAddress } from "@/lib/map";
import { hasValidPhone, isIndexablePharmacy } from "@/lib/pharmacy-indexability";
import { getPublishedContentByHpid } from "@/lib/data/content";
import { Breadcrumb } from "@/components/breadcrumb";
import { highlightSafeText, type HighlightRule } from "@/lib/safe-highlight";

export const revalidate = 86400;

type Params = { id: string };
const siteUrl = getSiteUrl();

const PHONE_RULE: HighlightRule = {
  pattern: /\d{2,3}-\d{3,4}-\d{4}/g,
  className: "text-brand-700 font-black",
};
const TIME_RULE: HighlightRule = {
  pattern: /\d{2}:\d{2}/g,
  className: "text-emerald-700 font-bold",
};
const WEEKDAY_RULE: HighlightRule = {
  pattern: /평일|토요일|일요일|공휴일/g,
  className: "text-brand-700 font-bold",
};

function naverDescription(input: string): string {
  const s = input.replace(/\s+/g, " ").trim();
  if (s.length <= 155) return s;
  return `${s.slice(0, 152)}...`;
}

function extractDong(address?: string | null): string | null {
  if (!address) return null;
  const parts = address.split(" ");
  const found = parts.find((p) => p.endsWith("동") || p.endsWith("가"));
  return found ?? null;
}

function trimTitle(title: string): string {
  const t = title.replace(/\s+/g, " ").trim();
  if (t.length <= 58) return t;
  return `${t.slice(0, 57)}…`;
}

function buildPharmacyMetaTitle(pharmacy: Pharmacy): string {
  const city = pharmacy.city ?? "";
  const dong = extractDong(pharmacy.address) ?? "";
  const region = [city, dong].filter(Boolean).join(" ");
  const base = `${pharmacy.name} | ${region || city || "지역"} 영업시간·전화·길찾기`;
  return trimTitle(base);
}

function buildPharmacyMetaDescription(pharmacy: Pharmacy, fallback: string): string {
  const city = pharmacy.city ?? "";
  const dong = extractDong(pharmacy.address) ?? "";
  const region = [city, dong].filter(Boolean).join(" ");

  const first = `${pharmacy.name}${region ? `(${region})` : ""} 정규 영업시간, 조제 비용 가이드, 대중교통 도보 동선 및 방문자 체감 키워드 분석 리포트입니다.`;
  const second = ` 주소·전화·주말 운영·주변 약국 비교 지표를 한눈에 확인하세요.`;
  const composed = `${first}${second}`.trim();

  const merged = composed.length >= 120 ? composed : `${composed} ${fallback}`.trim();
  return naverDescription(merged);
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const pharmacy = await getPharmacyByHpid(id);
  if (!pharmacy) return {};
  const title = buildPharmacyMetaTitle(pharmacy);
  const rawDescription =
    pharmacy.intelligence_report?.briefing.lines.join(" ") ||
    buildAiLessDetailTemplate(pharmacy).summary;
  const description = buildPharmacyMetaDescription(pharmacy, rawDescription);
  const indexable = isIndexablePharmacy(pharmacy);
  return {
    title,
    description,
    alternates: {
      canonical: `/pharmacy/${pharmacy.hpid}`,
    },
    robots: {
      index: indexable,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/pharmacy/${pharmacy.hpid}`,
      siteName: "약국오늘",
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
            `${pharmacy.city ?? pharmacy.province ?? ""} 약국 인텔리전스 리포트`,
          )}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function PharmacyDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const pharmacyPromise = getPharmacyByHpid(id);
  return <Content pharmacyPromise={pharmacyPromise} hpid={id} />;
}

async function Content({
  pharmacyPromise,
  hpid,
}: {
  pharmacyPromise: Promise<Pharmacy | null>;
  hpid: string;
}) {
  const [pharmacy, contentQueue] = await Promise.all([
    pharmacyPromise,
    getPublishedContentByHpid(hpid).catch(() => null),
  ]);
  if (!pharmacy) return notFound();

  const regionList =
    pharmacy.province && pharmacy.city
      ? await getPharmaciesByRegion(pharmacy.province, pharmacy.city)
      : [];
  const nearby = findNearbyWithinKm(pharmacy, regionList);

  const callablePhone = hasValidPhone(pharmacy.tel) ? pharmacy.tel : null;
  const initialIso = new Date().toISOString();

  const mapAddress = getMapSearchAddress(pharmacy.address);
  const mapQuery = encodeURIComponent((mapAddress || pharmacy.name).trim());
  const naverMapUrl = `https://map.naver.com/p/search/${mapQuery}`;
  const kakaoMapUrl = `https://map.kakao.com/link/search/${mapQuery}`;

  const report =
    pharmacy.intelligence_report ??
    buildPharmacyIntelligenceReport(pharmacy, null, regionList);

  const tmpl = buildAiLessDetailTemplate(pharmacy);
  const combinedFaq = report.faq.length > 0 ? report.faq : tmpl.faq.map((f) => ({ ...f, category: "이용 안내" }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: combinedFaq.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "약국", item: `${siteUrl}/nearby` },
      { "@type": "ListItem", position: 3, name: pharmacy.name, item: `${siteUrl}/pharmacy/${pharmacy.hpid}` },
    ],
  };

  const breadcrumbItems = [
    { label: "약국 찾기", href: "/nearby" },
    {
      label: pharmacy.city || "지역",
      href:
        pharmacy.province && pharmacy.city
          ? `/${encodeURIComponent(pharmacy.province)}/${encodeURIComponent(pharmacy.city)}`
          : undefined,
    },
    { label: pharmacy.name },
  ];

  return (
    <article
      className="container mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 bg-white min-h-screen max-w-5xl"
      data-pharmacy-id={pharmacy.hpid}
      data-source-surface="pharmacy_detail"
      data-opening-status="client-evaluated"
    >
      <Breadcrumb items={breadcrumbItems} />

      {/* 상단 헤더 (단일 컬럼 와이드 레이아웃 + 카테고리 맞춤 자체 SVG 일러스트) */}
      <header className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <PharmacyStatus hours={pharmacy.operating_hours} initialIso={initialIso} badge />
              {report.briefing.highlights.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200"
                >
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              {pharmacy.name}
            </h1>

            <div className="space-y-2.5 pt-1">
              <div className="text-base text-gray-700 font-semibold flex items-center gap-2.5 bg-white/90 rounded-xl px-4 py-3 border border-gray-200 shadow-2xs">
                <MapPin className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <span className="flex-1">
                  <span className="text-gray-500 font-medium mr-1.5">도로명 주소</span>
                  <span className="text-gray-900 font-bold">{pharmacy.address}</span>
                </span>
                <CopyButton text={pharmacy.address} label="주소 복사" />
              </div>

              {callablePhone && (
                <div className="text-base text-gray-700 font-semibold flex items-center gap-2.5 bg-brand-50/70 rounded-xl px-4 py-3 border border-brand-200">
                  <Phone className="h-5 w-5 text-brand-600 flex-shrink-0" />
                  <span className="flex-1">
                    <span className="text-gray-600 font-medium mr-1.5">대표 전화</span>
                    <a
                      href={`tel:${callablePhone}`}
                      className="text-brand-700 font-black hover:text-brand-800 underline decoration-2"
                    >
                      {callablePhone}
                    </a>
                  </span>
                  <CopyButton text={callablePhone} label="전화번호 복사" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <PharmacyCategoryIllustration
              category={report.visualCategory}
              className="w-full h-36 sm:h-40 rounded-2xl shadow-xs"
            />
          </div>
        </div>

        {/* 상단 즉시 실행 바 */}
        <div className="mt-6 pt-6 border-t border-emerald-100/80 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-emerald-600" />
                오늘 정규 운영시간
              </p>
              <div className="mt-0.5">
                <PharmacyTodayHours hours={pharmacy.operating_hours} initialIso={initialIso} />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 border border-emerald-200">
              <Clock className="h-3.5 w-3.5" />
              <PharmacyStatus hours={pharmacy.operating_hours} initialIso={initialIso} />
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2.5">
            {callablePhone ? (
              <a
                className="inline-flex items-center gap-2 rounded-full bg-brand-700 text-white px-5 py-2.5 text-sm font-black hover:bg-brand-800 transition-colors shadow-sm"
                href={`tel:${callablePhone}`}
              >
                <Phone className="h-4 w-4" />
                전화 문의
              </a>
            ) : null}
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#03C75A] bg-white px-4 py-2 text-sm font-black text-[#03C75A] hover:bg-[#03C75A]/10 transition-colors"
              href={naverMapUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-extrabold">N</span>
              네이버 길찾기
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#FAE100] bg-white px-4 py-2 text-sm font-black text-[#3C1E1E] hover:bg-[#FAE100]/20 transition-colors"
              href={kakaoMapUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="font-extrabold">K</span>
              카카오맵
            </Link>
          </div>
        </div>
      </header>

      {/* 섹션 1: 핵심 3줄 요약 브리핑 */}
      <section
        aria-labelledby="section-briefing"
        className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-white p-6 sm:p-8 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-100 pb-4">
          <div className="flex items-center gap-3">
            <ReportSectionSvgIcon section="briefing" className="w-8 h-8" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                Executive Briefing
              </span>
              <h2 id="section-briefing" className="text-xl sm:text-2xl font-black text-gray-900">
                핵심 3줄 요약 브리핑
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
            종합 인텔리전스 분석
          </span>
        </div>

        <ol className="space-y-3.5">
          {report.briefing.lines.map((line, index) => {
            const highlighted = highlightSafeText(line, [PHONE_RULE, TIME_RULE, WEEKDAY_RULE]);
            return (
              <li
                key={index}
                className="flex items-start gap-3.5 rounded-2xl bg-white p-4 sm:p-5 border border-emerald-100 shadow-2xs"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white mt-0.5">
                  0{index + 1}
                </span>
                <p
                  className="text-base text-gray-800 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </li>
            );
          })}
        </ol>

        {(contentQueue?.ai_summary || pharmacy.gemini_summary) && (
          <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 text-sm text-gray-700 leading-relaxed">
            {contentQueue?.ai_summary || pharmacy.gemini_summary}
          </div>
        )}
      </section>

      {/* 섹션 2: 가격 및 비용 분석 */}
      <section
        aria-labelledby="section-cost"
        className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <ReportSectionSvgIcon section="cost" className="w-8 h-8" />
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
              Cost &amp; Fee Structure
            </span>
            <h2 id="section-cost" className="text-xl sm:text-2xl font-black text-gray-900">
              가격 및 비용 분석
            </h2>
          </div>
        </div>

        <p className="text-base text-gray-700 leading-relaxed">
          {report.costAnalysis.summaryText}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-800 bg-sky-100 px-2.5 py-1 rounded-md">
                표준 조제료 적용 구간
              </span>
              <span className="text-xs font-bold text-gray-500">건강보험 기본 수가</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900 pt-1 leading-relaxed">
              {report.costAnalysis.standardWindowText}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                야간·휴일 가산(30%) 구간
              </span>
              <span className="text-xs font-bold text-amber-800">법정 시간대 가산</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900 pt-1 leading-relaxed">
              {report.costAnalysis.surchargeWindowText}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {report.costAnalysis.paymentAndCostPoints.map((point, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3.5 border border-gray-100"
            >
              <CheckCircle2 className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 섹션 3: 이용자 체감 키워드 분석 */}
      <section
        aria-labelledby="section-keywords"
        className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <ReportSectionSvgIcon section="keywords" className="w-8 h-8" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700">
                User Experience &amp; Sentiment
              </span>
              <h2 id="section-keywords" className="text-xl sm:text-2xl font-black text-gray-900">
                이용자 체감 키워드 분석
              </h2>
            </div>
          </div>

          {report.keywordAnalysis.visitorReviewCount + report.keywordAnalysis.blogReviewCount > 0 && (
            <div className="flex items-center gap-2 text-xs font-bold text-violet-800 bg-violet-50 px-3.5 py-1.5 rounded-full border border-violet-200">
              <span>누적 방문·블로그 리뷰 {(report.keywordAnalysis.visitorReviewCount + report.keywordAnalysis.blogReviewCount).toLocaleString()}건 기반</span>
            </div>
          )}
        </div>

        <p className="text-base text-gray-800 leading-relaxed bg-violet-50/40 rounded-2xl p-4 sm:p-5 border border-violet-100">
          {report.keywordAnalysis.sentimentSummary}
        </p>

        {report.keywordAnalysis.topKeywords.length > 0 ? (
          <div className="space-y-3.5">
            <h3 className="text-sm font-black text-gray-700">
              실사용자 응답 상위 키워드 분포 (참여자 {report.keywordAnalysis.votedUserCount.toLocaleString()}명)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.keywordAnalysis.topKeywords.map((kw) => {
                const categoryLabel =
                  kw.category === "expertise"
                    ? "복약·전문성"
                    : kw.category === "price"
                      ? "가격·품목"
                      : kw.category === "facility"
                        ? "시설·청결"
                        : "응대·친절";
                return (
                  <div
                    key={kw.label}
                    className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">
                          {categoryLabel}
                        </span>
                        <span className="font-black text-gray-900 text-sm sm:text-base">
                          {kw.label}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-gray-600">
                        {kw.count}명 ({kw.ratioPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full"
                        style={{ width: `${Math.max(12, kw.ratioPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {report.keywordAnalysis.specialtyTags.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-500 mb-2.5">주요 이용 목적 및 특화 키워드</p>
            <div className="flex flex-wrap gap-2">
              {report.keywordAnalysis.specialtyTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-1.5 text-sm font-bold text-gray-800 border border-gray-200"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 섹션 4: 방문 및 이용 실전 가이드 (대중교통 정류장 + 정규 운영시간표 통합) */}
      <section
        aria-labelledby="section-visit-guide"
        className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <ReportSectionSvgIcon section="guide" className="w-8 h-8" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                Practical Visit &amp; Transit Guide
              </span>
              <h2 id="section-visit-guide" className="text-xl sm:text-2xl font-black text-gray-900">
                방문 및 이용 실전 가이드
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SeoulNowBadge initialIso={initialIso} />
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              정규 시간표 기준
            </span>
          </div>
        </div>

        {/* 정규 요일별 운영시간표 */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-600" />
              요일별 정규 운영시간표
            </h3>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              정기휴무 기준: {report.visitGuide.regularClosedSummary}
            </span>
          </div>
          <PharmacyWeeklyHours hours={pharmacy.operating_hours} initialIso={initialIso} />
        </div>

        {/* 주변 대중교통 정류장 및 도보 거리 */}
        {report.visitGuide.transitStops.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-gray-900">
              인접 대중교통 정류장 및 도보 거리
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {report.visitGuide.transitStops.map((stop, idx) => (
                <div
                  key={`${stop.name}-${idx}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {stop.type === "subway" ? (
                        <Train className="h-5 w-5 text-blue-600 shrink-0" />
                      ) : (
                        <Bus className="h-5 w-5 text-emerald-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-black text-gray-900 text-sm sm:text-base">
                          {stop.name}
                          {stop.code ? (
                            <span className="ml-1.5 text-xs font-semibold text-gray-500">
                              ({stop.code})
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                      도보 {stop.walkMinutes}분 ({stop.walkMeters}m)
                    </span>
                  </div>
                  {stop.routes.length > 0 && (
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-bold text-gray-700 mr-1">경유 버스:</span>
                      {stop.routes.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 주차 및 실전 체크 포인트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-1.5">
            <p className="text-xs font-extrabold text-gray-500">주차 및 접근 여건</p>
            <p className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
              {report.visitGuide.parkingNote}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-1.5">
            <p className="text-xs font-extrabold text-gray-500">편의시설 및 지원 항목</p>
            <p className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
              {report.visitGuide.facilities.length > 0
                ? report.visitGuide.facilities.join(" · ")
                : "처방 조제 · 복약지도 · 상비 일반의약품 상담"}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-sm font-black text-gray-700">방문 전 실전 체크리스트</h3>
          {report.visitGuide.actionableTips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-amber-50/40 px-4 py-3 border border-amber-100"
            >
              <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 섹션 5: 주변 동종 업계 비교 지표 */}
      <section
        aria-labelledby="section-peer-comparison"
        className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <ReportSectionSvgIcon section="peers" className="w-8 h-8" />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-pink-700">
                Regional Peer Benchmark
              </span>
              <h2 id="section-peer-comparison" className="text-xl sm:text-2xl font-black text-gray-900">
                주변 동종 업계 비교 지표
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold text-pink-800 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            {report.peerComparison.regionLabel} 비교군 기준
          </span>
        </div>

        <p className="text-base text-gray-700 leading-relaxed">
          {report.peerComparison.summaryText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.peerComparison.metrics.map((m) => (
            <div
              key={m.metric}
              className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-gray-500">{m.metric}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {m.regionalBenchmark}
                </span>
              </div>
              <p className="text-lg font-black text-gray-900">{m.pharmacyValue}</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full"
                  style={{ width: `${m.scorePercent}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">{m.verdict}</p>
            </div>
          ))}
        </div>

        {/* 반경 2km 내 대체 약국 안내 */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              반경 2km 내 인근 대체 약국 비교
            </h3>
            {pharmacy.province && pharmacy.city ? (
              <Link
                href={`/${encodeURIComponent(pharmacy.province)}/${encodeURIComponent(pharmacy.city)}`}
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                {pharmacy.city} 전체 약국 보기 →
              </Link>
            ) : null}
          </div>

          <NearbyOpenPharmacies
            initialIso={initialIso}
            items={nearby.map((item) => ({
              ...item,
              distanceKm: distanceKm(
                pharmacy.latitude,
                pharmacy.longitude,
                item.latitude,
                item.longitude,
              ),
            }))}
          />

          {nearby.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {nearby.slice(0, 3).map((p) => {
                const dist = distanceKm(
                  pharmacy.latitude,
                  pharmacy.longitude,
                  p.latitude,
                  p.longitude,
                ).toFixed(1);
                return (
                  <Link
                    key={p.hpid}
                    href={`/pharmacy/${p.hpid}`}
                    className="rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-gray-900 text-base truncate">
                          {p.name}
                        </span>
                        <span className="shrink-0 text-xs font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                          {dist}km
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{p.address}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Q/A 카드형 FAQ (한국어 받침 유무에 따른 조사 자동 처리 적용) */}
      <section
        aria-labelledby="section-faq"
        className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <ReportSectionSvgIcon section="faq" className="w-8 h-8" />
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
              Frequently Asked Questions
            </span>
            <h2 id="section-faq" className="text-xl sm:text-2xl font-black text-gray-900">
              자주 묻는 질문 (Q&amp;A)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combinedFaq.map((faq, idx) => {
            const highlightedAnswer = highlightSafeText(faq.answer, [
              PHONE_RULE,
              TIME_RULE,
              WEEKDAY_RULE,
            ]);
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/70 p-5 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-blue-700 border border-blue-200">
                      Q{idx + 1}. {faq.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                    {faq.question}
                  </h3>
                </div>
                <div className="pt-3 border-t border-gray-200/80 flex items-start gap-2.5 text-sm sm:text-base text-gray-700 leading-relaxed">
                  <span className="text-emerald-600 font-black shrink-0">A.</span>
                  <div
                    className="flex-1"
                    dangerouslySetInnerHTML={{ __html: highlightedAnswer }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 관련 이용 가이드 내부 링크 */}
      <section className="rounded-3xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <Building2 className="h-5 w-5 text-brand-700" />
          <h2 className="text-lg sm:text-xl font-black text-gray-900">
            약국 방문 전 참고 가이드
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/guide/night-weekend"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 hover:border-brand-300 transition-colors"
          >
            야간·주말 약국 찾기 가이드
          </Link>
          <Link
            href="/guide/holiday-checklist"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 hover:border-brand-300 transition-colors"
          >
            공휴일 방문 체크리스트
          </Link>
          <Link
            href="/guide/call-scripts"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 hover:border-brand-300 transition-colors"
          >
            전화 문의 핵심 질문 가이드
          </Link>
        </div>
      </section>

      {/* 데스크톱 하단 플로팅 액션 */}
      <div className="hidden sm:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="rounded-full border border-gray-200 bg-white shadow-xl px-4 py-3 flex items-center gap-2">
          <Link
            href={naverMapUrl}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#03C75A] bg-white px-5 py-2 text-sm font-black text-[#03C75A] hover:bg-[#03C75A]/10"
            target="_blank"
            rel="noreferrer"
          >
            <span className="font-extrabold">N</span>
            길찾기
          </Link>
          {callablePhone ? (
            <a
              href={`tel:${callablePhone}`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-700 text-white px-5 py-2 text-sm font-black hover:bg-brand-800"
            >
              <Phone className="h-4 w-4" />
              전화 걸기
            </a>
          ) : null}
        </div>
      </div>

      <JsonLd id="jsonld-pharmacy" data={buildPharmacyJsonLd(pharmacy)} />
      <JsonLd id="jsonld-breadcrumbs" data={breadcrumbJsonLd} />
      <JsonLd id="jsonld-faq" data={faqJsonLd} />

      <StickyFab tel={callablePhone} mapUrl={naverMapUrl} />
    </article>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "공휴일 대비 약국 이용 체크리스트 | 오늘약국";
const metaDescription =
  "공휴일 영업 여부 확인, 종료 임박 시간, 전화·길찾기 활용, 대체 약국 찾기까지 한 번에 점검하세요.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/guide/holiday-checklist" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/guide/holiday-checklist",
    images: ["/og-image.svg"],
  },
};

const checklist = [
  "공휴일 필터 켜기 → 영업 중인 약국만 남기기",
  "종료 임박 시간 확인 후 우선 방문",
  "전화로 실제 영업/재고 확인",
  "길찾기 실행으로 도착 시각 검증",
  "혼잡 시 반경 3~5km로 확장 탐색",
  "대체 약국 1~2곳 미리 즐겨찾기",
];

const steps = [
  {
    title: "1) 공휴일 필터와 종료 임박 체크",
    detail:
      "리스트 상단 공휴일 필터를 켠 뒤, 상세 페이지에서 종료 예정 시간을 먼저 확인하세요. 닫히기 직전이면 가까운 대체 약국을 함께 확인합니다.",
  },
  {
    title: "2) 전화로 영업·재고 재확인",
    detail:
      "공휴일엔 조기 마감이 있을 수 있습니다. 방문 전 전화로 실제 영업 여부와 필요한 일반약/처방전 약 재고를 확인하세요.",
  },
  {
    title: "3) 길찾기로 도착 시각 검증",
    detail:
      "지도 길찾기를 실행해 예상 도착 시각을 확인하고, 종료 20~30분 전에 도착 가능한지 판단합니다.",
  },
  {
    title: "4) 반경 확장 및 대체 약국 확보",
    detail:
      "혼잡하면 반경을 3~5km로 넓혀 탐색합니다. 대체 약국 1~2곳을 즐겨찾기/메모해 두면 헛걸음을 줄입니다.",
  },
];

const faqs = [
  {
    q: "공휴일 영업 정보는 얼마나 자주 갱신되나요?",
    a: "공공데이터포털 기준으로 매일 동기화합니다. 상세 시간은 약국별로 다를 수 있어 전화 확인을 권장합니다.",
  },
  {
    q: "거리 정보는 어떻게 계산되나요?",
    a: "브라우저 위치 기반 직선거리를 표시합니다. 실제 이동 시간은 길찾기로 확인하세요.",
  },
  {
    q: "위치 권한 없이도 찾을 수 있나요?",
    a: "네. 권한을 주면 거리/반경 검색이 가능하고, 거부 시에는 지역 리스트(`/서울/전체` 등)로 바로 탐색할 수 있습니다.",
  },
];

export default function GuideHolidayChecklistPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/holiday-checklist",
    type: "Article",
  });
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">가이드 · 공휴일</p>
        <h1 className="text-3xl font-bold leading-tight">공휴일 대비 약국 이용 체크리스트</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/blog/holiday-open-pharmacy-tips"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            공휴일 팁 블로그 보기
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">빠른 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          {checklist.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2"
          >
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-[var(--muted)] leading-relaxed">{step.detail}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold text-[var(--foreground)] mb-1">{faq.q}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">다음 단계</h2>
            <p className="text-sm text-[var(--muted)]">
              위치 권한을 허용해 반경 검색을 사용하거나, 지역 리스트로 바로 탐색하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/nearby"
              className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
            >
              내 주변 찾기
            </Link>
            <Link
              href="/서울/전체"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
            >
              서울 리스트
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}


import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "반경 2/3/5/10km 선택 기준과 활용법 | 오늘약국";
const metaDescription =
  "심야·공휴일 상황별로 반경을 조정하고 거리순 정렬을 활용해 빠르게 약국을 찾는 기준을 안내합니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/guide/radius-selection" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/guide/radius-selection",
    images: ["/og-image.svg"],
  },
};

const tips = [
  "기본 2km에서 시작 → 결과 부족 시 3km, 5km 순으로 확장",
  "심야/공휴일에는 3~5km까지 넓혀 대체 약국 확보",
  "거리순 정렬 + 종료 임박 확인을 병행",
  "전화로 영업/재고 확인 후 길찾기로 도착 시각 검증",
];

const faqs = [
  {
    q: "반경은 언제 넓히면 좋나요?",
    a: "2km에서 결과가 없거나 심야·공휴일처럼 영업 약국이 적을 때 3~5km로 확장하세요.",
  },
  {
    q: "거리순 정렬은 언제 사용하나요?",
    a: "위치 권한 허용 후 빠른 방문이 필요할 때 유용합니다. 종료 임박 여부와 함께 확인하세요.",
  },
  {
    q: "헛걸음을 줄이려면?",
    a: "전화로 영업/재고 재확인 → 길찾기로 도착 시각 검증 → 대체 약국 1~2곳 확보 순서를 추천합니다.",
  },
];

export default function GuideRadiusSelectionPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/radius-selection",
    type: "Article",
  });
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">가이드 · 반경/거리</p>
        <h1 className="text-3xl font-bold leading-tight">반경 2/3/5/10km 선택 기준과 활용법</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/night-weekend"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            야간/주말 가이드
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">빠른 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          {tips.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">반경 선택 기준</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">2~3km: 기본 탐색</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              일반적인 심야/주말 상황에서는 2~3km로 시작해 가장 가까운 약국을 확인하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">5km: 결과 부족 시 확장</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              결과가 적거나 공휴일·심야 혼잡 시 5km까지 넓혀 대체 약국을 확보합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">거리순 + 종료 임박</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              거리순 정렬을 켜고 종료 예정 시간을 함께 확인하면, 가까우면서 곧 닫히는 곳을 우선 방문할 수 있습니다.
            </p>
          </div>
        </div>
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
              반경을 조정하고 거리순을 켠 뒤, 전화/길찾기로 도착 시각을 확인하세요.
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


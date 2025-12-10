import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "여름 휴가철 휴대용 응급 키트 구성법 | 오늘약국";
const metaDescription =
  "벌레·햇빛·소화불량·상처 대비 휴대용 응급 키트 구성과 반경 검색/거리순 활용 팁을 안내합니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/guide/summer-emergency-kit" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/guide/summer-emergency-kit",
    images: ["/og-image.svg"],
  },
};

const checklist = [
  "자외선 차단제·애프터선(진정제)",
  "항히스타민/소염 연고, 멀미약, 소화제",
  "지사제, 해열·진통제, 체온계",
  "소독제, 거즈, 밴드, 냉찜질 패드",
  "핀셋, 일회용 장갑, 휴대용 파우치",
];

const faqs = [
  {
    q: "벌레·해파리 대응은 어떻게 준비하나요?",
    a: "항히스타민제나 소염 연고를 준비하고, 심한 통증·호흡 곤란 시 의료기관을 바로 방문하세요.",
  },
  {
    q: "소화/멀미 대비는 무엇이 좋은가요?",
    a: "소화제, 지사제, 멀미약을 기본으로 챙기고, 음주나 과식이 예상되면 간 보호제도 약사와 상담해 준비하세요.",
  },
  {
    q: "상처 처치는 어떻게 하나요?",
    a: "깨끗한 물로 세척 후 소독제 사용, 거즈·밴드로 보호하고 필요 시 냉찜질로 부기·통증을 줄입니다.",
  },
];

export default function GuideSummerEmergencyKitPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/summer-emergency-kit",
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
        <p className="text-sm font-semibold text-brand-700">가이드 · 여름 응급 키트</p>
        <h1 className="text-3xl font-bold leading-tight">여름 휴가철 휴대용 응급 키트 구성법</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/blog/summer-first-aid-kit"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            여름 상비약 블로그 보기
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
        <h2 className="text-xl font-semibold">휴대용 키트 구성 팁</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">피부/벌레 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              자외선 차단제와 애프터선, 항히스타민/소염 연고를 챙기고, 벌레 물림과 해파리 접촉을 대비하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">소화/멀미 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              소화제·지사제·멀미약을 기본으로 하고, 음주가 예상되면 간 보호제를 상담 후 준비하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">상처/타박 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              소독제, 거즈, 밴드, 냉찜질 패드를 챙기고, 통증 시 적절한 진통제를 사용하세요.
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
              휴대용 키트를 준비하고, 필요한 경우 반경/거리순으로 약국을 빠르게 찾아보세요.
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
              href="/부산/전체"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
            >
              부산 리스트
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


import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "전화 스크립트: 영업·재고 확인 템플릿 | 오늘약국";
const metaDescription =
  "영업 여부, 조기 마감, 재고 확인을 빠르게 묻는 한국어 전화 스크립트와 활용 팁을 제공합니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/guide/call-scripts" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/guide/call-scripts",
    images: ["/og-image.svg"],
  },
};

const scripts = [
  {
    title: "영업 여부 확인",
    lines: [
      "안녕하세요, 지금 영업 중인가요?",
      "오늘 몇 시까지 운영하시나요?",
      "조기 마감 예정이 있나요?",
    ],
  },
  {
    title: "재고 확인",
    lines: [
      "아세트아미노펜(또는 필요한 약 이름) 재고가 있나요?",
      "처방전 조제가 가능한가요? 예상 소요 시간은 얼마나 될까요?",
    ],
  },
  {
    title: "방문 전 확인",
    lines: [
      "지금 방문하면 대기 시간이 얼마나 될까요?",
      "길찾기 소요 시간을 고려해 XX분 후 도착 예정입니다. 그때도 영업 중일까요?",
    ],
  },
];

const faqs = [
  {
    q: "전화가 안 받으면 어떻게 하나요?",
    a: "반경을 3~5km로 넓혀 다른 약국에 바로 전화하거나, 거리순 정렬로 가장 가까운 대체 약국을 찾으세요.",
  },
  {
    q: "조기 마감 여부는 어떻게 확인하나요?",
    a: "“오늘 몇 시까지 운영하시나요? 조기 마감 예정이 있나요?”를 꼭 물어보고, 종료 20~30분 전 도착을 목표로 하세요.",
  },
  {
    q: "재고 확인 시 주의할 점은?",
    a: "성분/제품명을 정확히 말하고, 처방전 조제 가능 여부와 예상 대기 시간을 함께 물어보세요.",
  },
];

export default function GuideCallScriptsPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/call-scripts",
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
        <p className="text-sm font-semibold text-brand-700">가이드 · 전화 스크립트</p>
        <h1 className="text-3xl font-bold leading-tight">전화 스크립트: 영업·재고 확인 템플릿</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/call-navigation-tips"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            전화·길찾기 활용 팁
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        {scripts.map((script) => (
          <div
            key={script.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2"
          >
            <h2 className="text-xl font-semibold">{script.title}</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              {script.lines.map((line) => (
                <li key={line} className="leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">바로 실행 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          <li>영업 여부 + 종료 예정 시간 먼저 확인</li>
          <li>재고/조제 가능 여부와 예상 대기 시간 질문</li>
          <li>길찾기로 도착 시각 검증 후 방문</li>
          <li>전화 연결 실패 시 반경 확장해 대체 약국 탐색</li>
        </ul>
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
              전화 스크립트를 활용해 영업/재고를 확인하고, 길찾기로 도착 시각을 검증하세요.
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
              href="/경기/전체"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
            >
              경기 리스트
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


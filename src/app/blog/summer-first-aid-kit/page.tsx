import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "여름 휴가철 응급 상비약 리스트 | 오늘약국";
const metaDescription =
  "벌레·햇빛·소화불량·멍/찰과상 대비 휴대용 응급 키트 구성과 약국 활용 팁을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/summer-first-aid-kit" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/summer-first-aid-kit",
    type: "article",
    images: ["/og-image.svg"],
  },
};

const checklist = [
  "자외선 차단제·애프터선(진정제) 준비",
  "벌레·해파리 대비 항히스타민/소염 연고",
  "소화제·지사제·멀미약 기본 구비",
  "멍/찰과상용 밴드·거즈·소독제",
  "해열·진통제(아세트아미노펜/이부프로펜) 휴대",
  "휴대용 체온계·핀셋·일회용 장갑 추가",
];

const faqs = [
  {
    q: "해열·진통제는 무엇을 챙기면 좋나요?",
    a: "아세트아미노펜 또는 이부프로펜 성분을 기본으로 챙기고, 중복 복용을 피하기 위해 성분을 확인하세요.",
  },
  {
    q: "벌레·해파리에 물렸을 때 무엇을 사용하나요?",
    a: "항히스타민제나 소염 연고로 가려움·염증을 완화하고, 심한 경우 의료기관을 방문하세요.",
  },
  {
    q: "상처 소독은 어떻게 하나요?",
    a: "깨끗한 물로 세척 후 소독제(포비돈 등)를 사용하고, 거즈와 밴드로 보호하세요.",
  },
];

export default function BlogSummerFirstAidKit() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/summer-first-aid-kit",
  });

  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">블로그 · 여름 상비약</p>
        <h1 className="text-3xl font-bold leading-tight">여름 휴가철 응급 상비약 리스트</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/summer-emergency-kit"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            휴가철 키트 가이드
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
              자외선 차단제와 애프터선 진정제를 챙기고, 벌레·해파리 대비 항히스타민/소염 연고를 준비하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">소화·멀미 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              소화제, 지사제, 멀미약을 기본으로 챙기고, 음주가 예상되면 간 보호제도 약사와 상담해 준비하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">상처/멍 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              소독제, 거즈, 밴드, 냉찜질 패드를 챙기고, 멍·타박에는 냉찜질 후 필요 시 진통제를 사용하세요.
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
              키트를 준비하고, 필요 시 가까운 약국을 반경/거리순으로 확인하세요.
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
              href="/인천/전체"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
            >
              인천 리스트
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </div>
  );
}


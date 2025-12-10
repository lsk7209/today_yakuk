import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "심야 약국 헛걸음 막는 거리·반경 활용법 | 오늘약국";
const metaDescription =
  "반경 2/3/5km 설정과 거리순 정렬을 활용해 심야 시간대 헛걸음을 줄이는 방법을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/night-radius-tips" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/night-radius-tips",
    type: "article",
    images: ["/og-image.svg"],
  },
};

const steps = [
  "기본 2km에서 시작해 3km, 5km로 단계적으로 확장",
  "거리순 정렬을 켜고 종료 임박 여부를 함께 확인",
  "전화로 영업/재고 재확인 후 길찾기 실행",
  "TOP3 후보 중 1~2곳을 대체 약국으로 확보",
];

const faqs = [
  {
    q: "반경은 몇 km부터 시작하면 좋을까요?",
    a: "심야에는 2~3km에서 시작해, 결과가 부족하면 5km로 확장하는 것이 효율적입니다.",
  },
  {
    q: "거리순 정렬은 언제 켜야 하나요?",
    a: "권한을 허용해 거리 정보가 있을 때, 빠른 방문이 중요하면 거리순을 켜고 종료 임박 시간을 함께 확인하세요.",
  },
  {
    q: "헛걸음 줄이는 핵심은 무엇인가요?",
    a: "전화로 영업/재고 재확인 후 길찾기로 도착 시각을 검증하는 2단계를 꼭 거치세요.",
  },
];

export default function BlogNightRadiusTips() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/night-radius-tips",
  });

  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">블로그 · 심야 반경 활용</p>
        <h1 className="text-3xl font-bold leading-tight">심야 약국 헛걸음 막는 거리·반경 활용법</h1>
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
          {steps.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">반경·정렬 활용 팁</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">2km → 3km → 5km 순차 확대</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              가까운 후보가 없으면 3km, 그래도 부족하면 5km로 확장하세요. TOP3 하이라이트로 우선 방문 순서를
              정하면 효율적입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">거리순 + 종료 임박 확인</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              거리순 정렬을 켜고 종료 예정 시간을 함께 확인하면, 가까우면서 곧 닫히는 곳을 우선 방문할 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">전화 후 길찾기 실행</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              전화로 실제 영업/재고를 확인한 뒤 길찾기를 실행해 도착 시각을 검증하세요. 헛걸음을 크게 줄입니다.
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
              반경을 조정하고 거리순을 켠 뒤, 전화/길찾기로 도착 시각을 확인해 보세요.
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
    </div>
  );
}


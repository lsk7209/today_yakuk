import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

const metaTitle = "심야 약국 찾기 체크리스트: 헛걸음 방지 | 오늘약국";
const metaDescription =
  "심야 시간대 종료 임박 확인, 전화/길찾기 활용, 반경 확장 탐색으로 빠르게 약국을 찾는 방법을 정리했습니다.";

export async function generateMetadata(): Promise<Metadata> {
  const title = metaTitle;
  const description = metaDescription;
  const canonical = "/blog/night-pharmacy-checklist";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(title)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

const checklist = [
  "심야 필터/영업중 필터로 열려 있는 약국만 보기",
  "종료 예정 시간 확인 후 우선 방문 순서 결정",
  "전화로 영업·재고 재확인",
  "길찾기로 도착 시각 검증",
  "혼잡하면 반경을 3~5km로 확장",
];

const faqs = [
  {
    q: "심야 영업 정보는 어디서 오나요?",
    a: "공공데이터 기반으로 매일 동기화합니다. 다만 심야에는 변동이 있을 수 있으니 전화 확인을 권장합니다.",
  },
  {
    q: "도착 시간을 어떻게 체크하나요?",
    a: "상세 페이지의 길찾기 버튼을 눌러 지도 앱에서 소요 시간을 확인하세요. 종료 20~30분 전에 도착하는지 확인이 중요합니다.",
  },
  {
    q: "반경은 얼마나 넓히면 좋을까요?",
    a: "기본 2~3km에서 시작해, 혼잡하면 5km까지 넓혀보세요. 거리순 정렬을 켜면 효율적입니다.",
  },
];

export default function BlogNightPharmacyChecklist() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/night-pharmacy-checklist",
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: "/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "심야 약국 찾기 체크리스트",
        item: "/blog/night-pharmacy-checklist",
      },
    ],
  };

  return (
    <article className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3" aria-label="글 머리말">
        <p className="text-sm font-semibold text-brand-700">블로그 · 심야 체크리스트</p>
        <h1 className="text-3xl font-bold leading-tight">심야 약국 찾기 체크리스트: 헛걸음 방지</h1>
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
          {checklist.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">심야 탐색 팁</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">종료 임박 약국부터 방문</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              종료 시간이 가까운 순으로 방문 계획을 세우고, 대체 약국 1~2곳을 함께 확보하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">전화 → 길찾기 두 단계</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              전화로 영업/재고를 확인한 뒤, 길찾기로 도착 시각을 검증하면 헛걸음을 크게 줄일 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">반경 확장으로 후보 늘리기</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              기본 2~3km에서 시작해 5km까지 넓혀보세요. 리스트 정렬을 거리순으로 두면 가까운 순서로 바로 확인 가능합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">자주 묻는 질문</h2>
        <div className="space-y-3" aria-label="FAQ">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
            >
              <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">다음 단계</h2>
            <p className="text-sm text-[var(--muted)]">
              내 주변 검색으로 빠르게 찾거나, 반경을 넓혀 대체 약국을 확보하세요.
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

      <JsonLd id="jsonld-article" data={articleJsonLd as unknown as Record<string, unknown>} />
      <JsonLd id="jsonld-breadcrumb" data={breadcrumbJsonLd} />
    </article>
  );
}


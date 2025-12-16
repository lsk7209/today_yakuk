import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "공휴일에도 열려 있는 약국을 빨리 찾는 5가지 방법 | 오늘약국";
const metaDescription =
  "위치 권한, 반경 설정, 종료 임박 체크, 전화 확인, 길찾기까지 공휴일 대비 핵심 팁을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/holiday-open-pharmacy-tips" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/holiday-open-pharmacy-tips",
    type: "article",
    images: ["/og-image.svg"],
  },
};

const tips = [
  {
    title: "1) 위치 권한을 허용하고 반경을 2km로 시작하세요",
    detail:
      "권한 허용 시 `/nearby` 페이지에서 현재 위치 기준 2km 이내 약국을 바로 노출합니다. 혼잡하면 반경을 3~5km로 늘려보세요.",
  },
  {
    title: "2) 종료 임박 여부를 먼저 확인하세요",
    detail:
      "상세 페이지에서 종료 예정 시간을 확인하고, 곧 닫히는 곳을 우선 방문하거나 대체 약국을 바로 탐색하세요.",
  },
  {
    title: "3) 전화 연결로 실제 영업 여부와 재고를 확인하세요",
    detail:
      "공휴일에는 조기 마감이 있을 수 있습니다. 방문 전에 전화로 영업 여부, 처방전/일반약 재고를 확인하면 헛걸음을 줄입니다.",
  },
  {
    title: "4) 길찾기 버튼으로 바로 이동하세요",
    detail:
      "지도 길찾기를 실행해 소요 시간을 즉시 확인하고, 도착 예정 시각 기준으로 영업 종료 전 도착할 수 있는지 판단합니다.",
  },
  {
    title: "5) 지역 리스트도 함께 활용하세요",
    detail:
      "위치 권한을 거부하거나 GPS가 불안정할 때는 `/서울/전체`, `/경기/전체` 등 지역 리스트로 바로 탐색할 수 있습니다.",
  },
];

const faqs = [
  {
    q: "공휴일 영업 정보는 어디서 오나요?",
    a: "공공데이터포털의 약국 영업 정보를 매일 동기화해 제공합니다.",
  },
  {
    q: "거리 정보는 정확한가요?",
    a: "브라우저 위치 기준 직선거리를 표시합니다. 실제 이동 시간은 길찾기 버튼으로 확인하세요.",
  },
  {
    q: "위치 권한을 주지 않아도 사용할 수 있나요?",
    a: "네. 권한 없이도 지역 리스트로 탐색할 수 있으며, 권한을 주면 반경/거리 순으로 더 빠르게 찾을 수 있습니다.",
  },
];

export default function BlogHolidayOpenPharmacyTips() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/holiday-open-pharmacy-tips",
  });

  return (
    <div className="container py-10 sm:py-14 space-y-10 bg-white min-h-screen">
      <header className="space-y-3">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">블로그 · 공휴일 팁</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">공휴일에도 열려 있는 약국을 빨리 찾는 5가지 방법</h1>
        <p className="text-base text-gray-600 leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/night-weekend"
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
          >
            야간/주말 가이드 보기
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-bold text-gray-900">{tip.title}</h2>
            <p className="text-gray-600 leading-relaxed">{tip.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-bold text-gray-900">바로 실행 체크리스트</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>위치 권한 허용 → 반경 2km로 검색 시작</li>
          <li>종료 임박 여부 확인 후 우선 방문</li>
          <li>전화로 영업/재고 확인 → 길찾기 실행</li>
          <li>권한 거부 시 지역 리스트로 빠르게 대체 탐색</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">다음 단계</h2>
            <p className="text-sm text-gray-600 mt-1">
              내 주변 검색으로 바로 찾거나, 지역 리스트에서 공휴일 영업 약국을 확인해 보세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/nearby"
              className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              내 주변 찾기
            </Link>
            <Link
              href="/인천/전체"
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
            >
              인천 리스트
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">참고 링크</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>
            공공데이터포털 약국 영업 정보:{' '}
            <a
              href="https://www.data.go.kr/"
              target="_blank"
              rel="noreferrer"
              className="text-brand-700 hover:underline"
            >
              data.go.kr
            </a>
          </li>
          <li>
            오늘약국 가이드 모음:{' '}
            <Link href="/guide" className="text-brand-700 hover:underline">
              /guide
            </Link>
          </li>
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </div>
  );
}


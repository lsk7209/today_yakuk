import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "전화·길찾기 활용 팁: 헛걸음 줄이기";
const metaDescription =
  "전화로 영업·재고 확인 후 바로 길찾기 실행, 반경 확장 탐색으로 헛걸음을 줄이는 실전 팁을 안내합니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/guide/call-navigation-tips" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/guide/call-navigation-tips",
    images: ["/og-image.svg"],
  },
};

const tips = [
  {
    title: "전화로 영업·재고 재확인",
    detail:
      "공휴일이나 야간에는 약국마다 단축 영업이나 조기 마감이 빈번하게 발생합니다. 특히 명절 연휴나 국경일에는 지역 내 절반 이상의 약국이 예고 없이 조기에 문을 닫는 경우도 있습니다. 방문 전 30분~1시간 이내에 전화로 현재 영업 중인지, 그리고 필요한 약 재고가 있는지 두 가지를 함께 확인하세요. 한 번의 전화로 이 두 가지를 확인하면 불필요한 이동 시간과 체력 낭비를 막을 수 있습니다.",
  },
  {
    title: "길찾기로 도착 시각 즉시 확인",
    detail:
      "전화로 영업 중임을 확인한 즉시 길찾기를 실행해 실시간 교통 상황을 반영한 도착 예상 시각을 확인합니다. 약국 영업 종료 20~30분 전에 도착할 수 있는지를 기준으로 방문 여부를 결정하면 현장에서 문이 잠겨 있는 상황을 피할 수 있습니다. 퇴근 시간대나 우천 시에는 실제 소요 시간이 평소보다 10~15분 더 걸릴 수 있으니 여유 시간을 더 넉넉히 잡으세요. 길찾기 결과에서 '도보' 외에 '자동차', '대중교통' 옵션을 모두 확인해 가장 빠른 이동 수단을 선택하는 것도 중요한 습관입니다.",
  },
  {
    title: "반경 확장 탐색",
    detail:
      "가장 가까운 약국이 영업 중이 아니거나 혼잡한 경우, 반경을 1km에서 3~5km로 즉시 넓혀 대체 약국을 탐색하세요. 약국오늘의 반경 전환 버튼을 사용하면 검색 반경을 3km, 5km, 10km로 한 번에 바꿀 수 있어 여러 앱을 번갈아 확인하는 수고를 덜 수 있습니다. 리스트 정렬을 '거리순'으로 설정해 두면 가장 가까운 약국이 상단에 표시되어 빠르게 후보를 좁힐 수 있습니다. 특히 야간이나 공휴일에는 반경 5km 이내에서 2~3곳의 후보를 확보한 뒤 순서대로 전화를 돌리는 방식이 가장 효율적입니다.",
  },
  {
    title: "대체 약국 1~2곳 즐겨찾기",
    detail:
      "평소 자주 이용하거나 집·직장 인근에 위치한 약국을 TOP3 하이라이트 목록에서 1~2곳 미리 후보로 점찍어 두세요. 스마트폰 연락처에 '야간약국_A', '주말약국_B' 형태로 저장해 두면 긴급 상황에서 앱을 다시 검색하지 않아도 바로 전화를 걸 수 있습니다. 네트워크 연결이 불안정하거나 지도 앱이 느릴 때도 미리 저장한 번호로 빠르게 대처할 수 있어 실제 급한 상황에서 가장 큰 힘을 발휘합니다. 또한 대체 약국을 미리 파악해 두면 주 이용 약국의 조기 마감 시에도 당황하지 않고 바로 이동할 수 있습니다.",
  },
];

const faqs = [
  {
    q: "전화번호는 어디서 확인하나요?",
    a: "약국 상세 페이지 상단에 전화 걸기 버튼이 있습니다. 클릭 시 바로 통화가 연결됩니다.",
  },
  {
    q: "길찾기 버튼은 어떤 지도를 사용하나요?",
    a: "브라우저/OS 설정에 따라 기본 지도 앱으로 열립니다. 소요 시간을 바로 확인하고 도착 시각을 판단하세요.",
  },
  {
    q: "반경 검색은 어떻게 바꾸나요?",
    a: "`/nearby` 페이지에서 반경 3/5/10km 버튼으로 즉시 변경할 수 있습니다.",
  },
  {
    q: "야간이나 공휴일에도 전화 재고 확인이 가능한가요?",
    a: "영업 중으로 표시된 약국이라면 야간이나 공휴일에도 전화 문의를 시도할 수 있습니다. 다만 등록 영업시간과 실제 운영은 다를 수 있고 통화 연결이 늦을 수도 있으니, 출발 전 전화로 확인하고 대체 약국도 함께 살펴보세요.",
  },
  {
    q: "약국에서 재고가 없다고 할 때 어떻게 하나요?",
    a: "필요한 약의 성분명이나 대체 제품명을 약사에게 문의하면 유사 제품으로 안내받을 수 있습니다. 재고가 없는 경우에도 인근 협력 약국을 소개해 주는 약국이 많으니 '근처에 재고 있는 곳 아시나요?'라고 직접 여쭤보는 것이 가장 빠른 방법입니다. 이후 약국오늘에서 반경을 넓혀 추가 후보를 검색하고 동일하게 전화 확인 후 이동하세요.",
  },
  {
    q: "길찾기 도착 예정 시각이 영업 종료 직전인데 방문해도 될까요?",
    a: "일반적으로 영업 종료 15~20분 전까지는 접수가 가능한 경우가 많지만, 약국마다 마감 규정이 다릅니다. 도착 예정 시각이 종료 20분 이내라면 전화로 '지금 출발하면 XX시 도착인데 가능한가요?'라고 미리 확인한 뒤 이동하는 것이 헛걸음을 막는 가장 확실한 방법입니다. 약국 측에서 이미 마감 준비 중이라면 다른 후보 약국으로 바로 전환하세요.",
  },
];

export default function GuideCallNavigationTipsPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/call-navigation-tips",
    type: "Article",
  });
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "가이드", item: "https://todaypharm.kr/guide" },
      { "@type": "ListItem", position: 3, name: "전화·길찾기 활용 팁", item: "https://todaypharm.kr/guide/call-navigation-tips" },
    ],
  };
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "전화·길찾기로 헛걸음 줄이는 4단계",
    description: metaDescription,
    step: tips.map((t, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: t.title,
      text: t.detail,
    })),
  };
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
        <p className="text-sm font-semibold text-brand-700">가이드 · 헛걸음 방지</p>
        <h1 className="text-3xl font-bold leading-tight">전화·길찾기 활용 팁: 헛걸음 줄이기</h1>
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

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          약국 문 앞까지 갔다가 영업이 끝나 발길을 돌리는 경험은 누구나 한 번쯤 겪어봤을 만큼 흔한 상황입니다.
          특히 공휴일, 명절 연휴, 야간 시간대에는 온라인 영업 정보와 실제 운영 시간이 다를 수 있어 반드시 전화 확인이 필요합니다.
          단순히 약국을 찾는 것을 넘어 &lsquo;전화 확인 → 길찾기 실행 → 반경 확장&rsquo;의 2단계 루틴을 익히면 어떤 상황에서도 빠르게 약을 구할 수 있습니다.
          이 가이드는 그 루틴을 처음 접하는 분부터 조금 더 체계적으로 익히고 싶은 분 모두를 위해 실전 중심으로 정리했습니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            공휴일·명절 연휴에 약국을 찾다 문이 닫혀 헛걸음한 경험이 있는 분
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            야간에 급하게 약이 필요한데 어느 약국이 열려 있는지 바로 알고 싶은 분
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            처음 방문하는 동네에서 재고 있는 약국을 가장 빠르게 찾고 싶은 분
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            영업 종료 직전에 이동해도 되는지 매번 판단이 어려운 분
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2"
          >
            <h2 className="text-xl font-semibold">{tip.title}</h2>
            <p className="text-[var(--muted)] leading-relaxed">{tip.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">바로 실행 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          <li>전화로 영업/재고 확인 → 헛걸음 방지</li>
          <li>길찾기로 도착 시각 확인 → 종료 20~30분 전에 도착</li>
          <li>반경 3/5/10km 전환 → 대체 약국 빠르게 확보</li>
          <li>TOP3에서 1~2곳 즐겨찾기</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
              <h3 className="text-base font-bold text-gray-900">공휴일 저녁, 갑작스러운 두통약 필요</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              오후 8시, 휴일이라 가까운 약국들이 모두 문을 닫은 상황입니다. 약국오늘에서 &lsquo;현재 영업 중&rsquo; 필터를 켜고 반경 3km 내 약국 목록을 확인한 뒤, 상위에 표시된 2곳에 바로 전화를 걸어 일반의약품 재고를 확인했습니다. 재고가 있는 약국에 길찾기를 실행하니 도착 예정 시각이 영업 종료 35분 전으로 충분히 여유가 있어 안심하고 이동할 수 있었습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">처방전 수령 후 가까운 약국에 재고 없음</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              병원에서 처방전을 받아 1km 이내 약국에 전화했더니 해당 약이 품절이라는 안내를 받았습니다. 전화로 &lsquo;근처에 재고 있는 곳을 아시냐&rsquo;고 물으니 500m 거리의 약국을 소개해 주었고, 해당 약국에 재확인 전화 후 바로 길찾기를 실행했습니다. 미리 전화를 돌린 덕분에 처방전 유효 기간 내에 빠르게 조제를 마칠 수 있었습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">퇴근길 교통 정체, 영업 종료 20분 전 도착 가능</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              퇴근 후 약국을 들르려 했지만 길찾기를 켜 보니 교통 정체로 도착 예정 시각이 영업 종료 18분 전이었습니다. 그냥 가기엔 애매해서 약국에 전화로 &lsquo;18분 후 도착 예정인데 가능한가요?&rsquo; 라고 물었고, 약국 측에서 방문해도 된다고 안내를 받아 안심하고 이동했습니다. 한 통의 전화가 불필요한 망설임과 2번째 이동을 막아준 사례입니다.
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
              위치 권한을 허용해 반경 검색을 켜고, 전화/길찾기를 함께 활용해 보세요.
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

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/blog/pharmacy-visit-checklist-3" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 확인 3가지</p>
            <p className="text-xs text-gray-500 mt-1">영업·재고·처방전 유효기간 점검</p>
          </Link>
          <Link href="/blog/night-pharmacy-3steps" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">야간 약국 찾기 3단계</p>
            <p className="text-xs text-gray-500 mt-1">단계별로 바로 찾는 방법</p>
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}

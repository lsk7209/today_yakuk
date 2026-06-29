import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "반경 2/3/5/10km 선택 기준과 활용법";
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
  {
    q: "10km 반경은 언제 필요한가요?",
    a: "명절 연휴나 대설·태풍 등 비상 상황처럼 광범위한 지역에서 영업 약국이 극히 적을 때 사용합니다. 이 경우 대중교통 또는 택시 이동 시간까지 함께 계산해 방문 가능 여부를 먼저 확인하는 것이 좋습니다.",
  },
  {
    q: "반경을 넓혔는데도 결과가 없어요.",
    a: "5~10km까지 넓혀도 결과가 없다면 해당 시간대에 당번 약국이 지정되지 않은 지역일 수 있습니다. 이 경우 보건복지부 129 콜센터나 지역 보건소에 전화해 당번 약국 위치를 직접 문의하는 방법을 권장합니다.",
  },
  {
    q: "위치 권한을 허용하지 않으면 거리순 정렬이 안 되나요?",
    a: "위치 권한 없이는 정확한 거리 계산이 불가능해 거리순 정렬이 동작하지 않습니다. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 눌러 위치 권한을 허용하면 즉시 사용할 수 있으며, 방문 후 언제든지 권한을 차단으로 변경할 수 있습니다.",
  },
];

export default function GuideRadiusSelectionPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/radius-selection",
    type: "Article",
  });
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "가이드", item: "https://todaypharm.kr/guide" },
      { "@type": "ListItem", position: 3, name: "반경 설정 가이드", item: "https://todaypharm.kr/guide/radius-selection" },
    ],
  };
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "반경 선택으로 약국 빠르게 찾는 4단계",
    description: metaDescription,
    step: tips.map((t, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: t,
      text: t,
    })),
  };
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

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          심야에 갑자기 약이 필요해졌을 때 반경을 너무 좁게 설정하면 &ldquo;결과 없음&rdquo;만 확인하다 시간을 낭비하게 됩니다.
          반대로 처음부터 10km로 넓히면 실제로 걸어서 혹은 대중교통으로 갈 수 없는 약국까지 뒤섞여 혼란이 생깁니다.
          공휴일·명절 연휴처럼 영업 약국 수 자체가 줄어드는 날에는 단계적 확장 전략이 헛걸음을 막아줍니다.
          이 가이드는 상황별로 최적 반경을 선택하고 거리순 정렬과 병행해 가장 빠르게 약국을 찾는 방법을 단계별로 안내합니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            밤 11시 이후 갑자기 약이 필요해져 가까운 약국을 빠르게 찾아야 할 때
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            추석·설날 연휴처럼 당번 약국만 운영하는 기간에 헛걸음 없이 방문하고 싶을 때
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            결과가 여러 개 떠도 어느 곳이 가장 빨리 도달할 수 있는지 판단이 안 될 때
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            종료 임박 약국에 갔다가 문이 닫혀 있는 경험을 반복해서 줄이고 싶을 때
          </li>
        </ul>
      </section>

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
              일반적인 심야·주말 상황에서는 2~3km로 시작해 가장 가까운 약국을 확인하세요.
              도보 기준 20~35분 이내 거리로, 대도시 주거 지역이라면 이 범위에서 1~3곳 이상이 검색되는 경우가 많습니다.
              2km 반경에서 결과가 바로 나오면 불필요하게 넓히지 말고 거리순 정렬로 최단 경로를 확인하는 것이 효율적입니다.
              주택가·아파트 밀집 지역일수록 2km 안에 당번 약국이 포함될 확률이 높으므로 첫 번째 선택지로 권장합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">5km: 결과 부족 시 확장</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              2~3km에서 결과가 없거나 공휴일·심야처럼 영업 약국이 평소보다 훨씬 적을 때 5km까지 넓혀 대체 약국을 확보하세요.
              자전거나 차량 이동이 가능하다면 5km는 이동 시간 15~20분 내외로 현실적인 선택지가 됩니다.
              5km 반경에서는 결과가 갑자기 많아질 수 있으므로 종료 예정 시각 필터와 거리순 정렬을 함께 사용해 우선순위를 정하세요.
              명절 연휴에는 지자체별로 당번 약국이 1~2곳만 지정되는 경우도 있어, 5km 안에서 가장 영업 시간이 많이 남은 곳을 목표로 잡는 것이 안전합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">10km: 비상 상황 확장</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              5km에서도 영업 중인 약국이 없다면 10km까지 확장해 최후 옵션을 탐색합니다.
              이 범위는 주로 명절 심야·지방 소도시·기상 악조건 등 극히 드문 상황에서 필요합니다.
              10km는 차량 이동 기준 15~25분 거리지만, 심야에는 대중교통이 끊겨 택시나 자차가 필수인 경우가 많으므로 이동 수단을 먼저 확보하세요.
              방문 전 반드시 전화로 영업 여부와 재고를 확인해 이동 중 문 닫히는 상황을 방지하는 것이 중요합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">거리순 + 종료 임박</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              거리순 정렬을 켜고 종료 예정 시간을 함께 확인하면, 가까우면서 아직 영업 시간이 충분히 남은 약국을 우선 방문할 수 있습니다.
              예를 들어 800m 거리의 약국이 15분 후 종료 예정이고 1.5km 약국이 1시간 이상 남아 있다면, 이동 시간과 재고 확인 여유를 감안해 후자를 선택하는 것이 헛걸음을 줄입니다.
              거리순은 직선 거리 기준이므로 실제 도로 이동 경로와 차이가 날 수 있어 길찾기 앱으로 예상 도착 시각을 한 번 더 확인하는 것을 권장합니다.
              종료 30분 이내 표시가 뜨는 약국은 이동 중 닫힐 위험이 있으니 전화 확인을 먼저 하세요.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
              <h3 className="text-base font-bold text-gray-900">밤 11시, 해열제가 떨어졌을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              아이 열이 갑자기 오르는 상황에서 약국 앱을 열고 반경 2km로 검색했더니 1곳이 표시됐습니다. 거리순 정렬로 확인하니 직선 900m, 종료까지 40분 남아 있었습니다. 전화로 해열제 재고를 확인한 뒤 길찾기로 도보 12분 경로를 확인하고 출발해 여유 있게 방문할 수 있었습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">추석 연휴 낮, 당번 약국 찾기</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              연휴 3일차 낮 2시, 2km 반경에서 결과가 0건이었습니다. 5km로 넓히자 당번 약국 2곳이 나타났고, 더 먼 쪽이 영업 종료까지 3시간 남아 있었습니다. 차량으로 이동하기 전 전화로 영업 중임을 확인하고 출발해 예상한 시간 안에 도착했습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">새벽 2시, 지방 소도시에서 긴급 약 구매</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              출장 중 새벽에 위장약이 필요해 2km, 5km 순서로 검색했지만 결과가 없었습니다. 10km로 넓히자 차량으로 18분 거리의 24시간 약국 1곳이 확인됐습니다. 대중교통이 끊긴 시간이라 택시를 미리 불러두고 전화로 영업 상태를 확인한 뒤 이동해 약을 구매할 수 있었습니다.
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

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/blog/night-radius-tips" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">심야 약국 거리·반경 활용법</p>
            <p className="text-xs text-gray-500 mt-1">심야 헛걸음을 줄이는 반경 설정 실전</p>
          </Link>
          <Link href="/blog/night-pharmacy-3steps" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">야간 약국 찾기 3단계</p>
            <p className="text-xs text-gray-500 mt-1">단계별로 바로 찾는 방법</p>
          </Link>
          <Link href="/guide/night-weekend" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">야간·주말 약국 완전 가이드</p>
            <p className="text-xs text-gray-500 mt-1">심야·주말 운영 시간 패턴과 준비 요령</p>
          </Link>
          <Link href="/guide/holiday-checklist" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">공휴일 약국 체크리스트</p>
            <p className="text-xs text-gray-500 mt-1">연휴 전 미리 확인해야 할 사항 정리</p>
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

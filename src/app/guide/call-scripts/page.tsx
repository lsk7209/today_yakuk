import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "전화 스크립트: 영업·재고 확인 템플릿 | 약국오늘";
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
    desc: "약국 영업 여부는 지도 앱 정보와 실제 운영 시간이 다를 수 있어 반드시 전화로 확인하는 것이 좋습니다. 특히 공휴일이나 명절 연휴에는 당번 약국이 아닌 경우 예고 없이 문을 닫기도 합니다. 정기 휴무 외에 당일 사정으로 조기 마감하는 경우도 있으므로, 출발 전 10분만 투자해 전화 한 통으로 헛걸음을 방지하세요. 종료 예정 시간을 확인한 뒤 도착 여유 시간이 20분 이상 남는 약국을 선택하는 것이 안전합니다.",
    lines: [
      "안녕하세요, 지금 영업 중인가요?",
      "오늘 몇 시까지 운영하시나요?",
      "조기 마감 예정이 있나요?",
    ],
  },
  {
    title: "재고 확인",
    desc: "필요한 약을 성분명 또는 제품명으로 정확히 전달하면 약사가 즉시 재고 여부를 확인해줍니다. 감기약·진통제·소화제처럼 수요가 많은 의약품은 특정 제품이 품절인 경우 동일 성분 대체제 여부도 함께 물어보면 유용합니다. 처방전이 있는 경우에는 조제 가능 여부와 예상 대기 시간을 미리 파악해두면 방문 시 불필요한 대기를 줄일 수 있습니다. 만약 재고가 없다면 인근 약국을 추천받거나 직접 반경을 넓혀 다음 후보 약국에 바로 전화하세요.",
    lines: [
      "아세트아미노펜(또는 필요한 약 이름) 재고가 있나요?",
      "같은 성분의 대체 제품도 있나요?",
      "처방전 조제가 가능한가요? 예상 소요 시간은 얼마나 될까요?",
    ],
  },
  {
    title: "방문 전 확인",
    desc: "길찾기 앱의 예상 도착 시간을 참고해 약국 영업 종료 전에 충분히 도착할 수 있는지 계산해 보세요. 러시아워나 주말 교통 상황을 감안하면 예상보다 10~15분 더 걸릴 수 있으므로 여유 있게 출발하는 것이 중요합니다. 현재 방문 손님이 많은 시간대라면 대기 시간도 확인해 두면, 도착 후 오래 기다리지 않을 약국을 선택하는 데 도움이 됩니다. 처방전 조제는 약 종류와 수량에 따라 최소 10분에서 30분 이상 걸리기도 하니 사전 확인이 필수입니다.",
    lines: [
      "지금 방문하면 대기 시간이 얼마나 될까요?",
      "길찾기 소요 시간을 고려해 XX분 후 도착 예정입니다. 그때도 영업 중일까요?",
      "처방전 조제 시 예상 시간이 얼마나 걸리나요?",
    ],
  },
];

const faqs = [
  {
    q: "전화가 안 받으면 어떻게 하나요?",
    a: "반경을 3~5km로 넓혀 다른 약국에 바로 전화하거나, 거리순 정렬로 가장 가까운 대체 약국을 찾으세요. 점심 시간대(12~14시)나 저녁 마감 직전에는 통화가 집중돼 연결이 늦을 수 있으니, 2~3분 후 재시도하거나 다음 후보로 넘어가는 것이 효율적입니다.",
  },
  {
    q: "조기 마감 여부는 어떻게 확인하나요?",
    a: "\"오늘 몇 시까지 운영하시나요? 조기 마감 예정이 있나요?\"를 꼭 물어보고, 종료 20~30분 전 도착을 목표로 하세요. 공휴일 전날이나 연휴 첫날은 평소보다 일찍 마감하는 약국이 많으니 특히 주의가 필요합니다.",
  },
  {
    q: "재고 확인 시 주의할 점은?",
    a: "성분/제품명을 정확히 말하고, 처방전 조제 가능 여부와 예상 대기 시간을 함께 물어보세요. 원하는 제품이 없을 경우 동일 성분 대체제 여부도 확인하면 방문 약국 선택 폭이 넓어집니다.",
  },
  {
    q: "처방전이 있는 경우 전화로 어떻게 문의하나요?",
    a: "처방전에 적힌 의약품 이름을 약사에게 그대로 읽어주면 가장 정확합니다. \"처방전에 OO, OO이 있는데 조제 가능한가요? 지금 방문하면 대기가 얼마나 되나요?\"라고 물으면 한 번에 핵심 정보를 얻을 수 있습니다. 복잡한 처방이라면 도착 예정 시간도 미리 알려두면 약국에서 미리 준비해두는 경우도 있습니다.",
  },
  {
    q: "약국에서 전화를 받지 못하는 이유가 있나요?",
    a: "조제 중이거나 다른 손님 응대 중에는 전화를 받기 어려운 경우가 있습니다. 오전 10~11시, 오후 3~4시처럼 비교적 한산한 시간대에 전화하면 연결이 더 잘 됩니다. 2~3분 간격으로 2회 정도 재시도 후에도 연결이 안 되면 다음 후보 약국으로 넘어가는 것이 시간 절약에 효과적입니다.",
  },
  {
    q: "스크립트를 외우지 않아도 되나요?",
    a: "외울 필요 없이 이 페이지를 보면서 전화해도 충분합니다. 핵심은 ①영업 종료 시간 ②필요한 약 재고 ③예상 대기 시간 세 가지만 확인하는 것입니다. 익숙해지면 30초 안에 필요한 정보를 모두 얻을 수 있습니다.",
  },
];

export default function GuideCallScriptsPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/call-scripts",
    type: "Article",
  });
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "가이드", item: "https://todaypharm.kr/guide" },
      { "@type": "ListItem", position: 3, name: "전화 스크립트 가이드", item: "https://todaypharm.kr/guide/call-scripts" },
    ],
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

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          지도 앱에 표시된 영업 시간은 최신 정보가 아닐 수 있으며, 당일 사정에 따라 조기 마감하는 약국도 적지 않습니다. 특히 공휴일이나 명절 연휴, 급하게 약이 필요한 심야 시간대에는 헛걸음의 피로와 시간 손실이 배가됩니다. 이 가이드의 전화 스크립트를 활용하면 출발 전 단 30초로 영업 여부·재고·대기 시간을 한 번에 확인할 수 있습니다. 스크립트를 외울 필요 없이 화면을 보면서 따라 읽기만 해도 됩니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            지도 앱 영업시간을 믿고 갔다가 이미 문이 닫혀 있었던 경험이 있는 경우
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            처방전 조제를 위해 방문했는데 재고가 없어 다른 약국을 다시 찾아야 했던 경우
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            공휴일·심야에 어느 약국이 열려 있는지 확인하느라 시간을 낭비한 경험이 있는 경우
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            전화하고 싶지만 뭐라고 말해야 할지 몰라 망설였던 경우
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        {scripts.map((script) => (
          <div
            key={script.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">{script.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{script.desc}</p>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-1">
              <p className="text-xs font-semibold text-brand-700 mb-2">전화 스크립트</p>
              <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
                {script.lines.map((line) => (
                  <li key={line} className="leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">바로 실행 체크리스트</h2>
        <p className="text-sm text-emerald-800 leading-relaxed">
          전화 한 통으로 확인해야 할 항목을 순서대로 정리했습니다. 아래 순서대로 질문하면 30초 내에 방문 여부를 결정할 수 있습니다.
        </p>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          <li>영업 여부 + 종료 예정 시간 먼저 확인</li>
          <li>재고/조제 가능 여부와 예상 대기 시간 질문</li>
          <li>길찾기로 도착 시각 검증 후 방문 결정</li>
          <li>전화 연결 실패 시 반경 확장해 대체 약국 탐색</li>
          <li>종료 20~30분 전 도착 여유 확보 후 출발</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
              <h3 className="text-base font-bold text-gray-900">퇴근 후 저녁 8시, 감기약이 필요한 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              퇴근길에 감기 증상이 심해져 약이 필요하지만 주변 약국들이 대부분 오후 7~8시에 마감합니다. 가까운 약국 3곳에 미리 전화해 영업 종료 시간과 아세트아미노펜·종합감기약 재고를 확인하면, 퇴근 경로 중 들를 수 있는 약국을 찾아 단 한 번에 방문을 마칠 수 있습니다. 스크립트 없이 전화하면 당황해 필요한 정보를 빠뜨리기 쉬우니, 이 페이지를 켜놓고 읽어가며 통화하는 것이 가장 효율적입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">처방전을 받고 조제 약국을 찾는 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              병원에서 처방전을 받았지만 병원 근처 약국이 이미 복잡하거나 특정 약 재고가 없는 경우가 있습니다. 처방전에 적힌 약 이름을 그대로 읽으며 &ldquo;이 처방전 조제 가능한가요? 지금 방문하면 얼마나 기다려야 하나요?&rdquo;라고 물으면, 대기가 짧고 재고가 준비된 약국을 빠르게 찾을 수 있습니다. 방문 예정 시간을 미리 알려두면 약국에서 미리 조제를 준비해두는 경우도 있어 대기 시간을 크게 줄일 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">공휴일·명절에 당번 약국을 찾는 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              공휴일에는 당번 약국이 지역마다 지정되어 있지만, 인터넷에 나온 정보가 실시간으로 반영되지 않을 수 있습니다. 검색으로 몇 곳을 찾은 뒤 직접 전화해 &ldquo;지금 영업 중인가요?&rdquo;라고 확인하는 과정이 반드시 필요합니다. 당번 약국은 운영 시간이 제한적인 경우가 많으니, 도착 예정 시간을 미리 말하고 그 시간까지 운영하는지 확인하는 것이 헛걸음을 막는 핵심 방법입니다.
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

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/blog/pharmacy-visit-checklist-3" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 확인 3가지</p>
            <p className="text-xs text-gray-500 mt-1">영업·재고·처방전 유효기간 점검</p>
          </Link>
          <Link href="/blog/night-pharmacy-checklist" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">심야 약국 방문 체크리스트</p>
            <p className="text-xs text-gray-500 mt-1">헛걸음 방지 체크리스트</p>
          </Link>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}

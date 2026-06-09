import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "처방전 준비와 약국 방문 전 점검 7가지 | 약국오늘";
const metaDescription =
  "공휴일·야간에 처방전 준비, 신분증/보험증 확인, 대기 시간 단축 팁을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/prescription-prep-tips" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/prescription-prep-tips",
    type: "article",
    images: ["/og-image.svg"],
  },
};

const steps = [
  "처방전 원본·사본 준비(사진 보관 포함)",
  "신분증/보험증 확인",
  "복용 중인 약 리스트 메모",
  "공휴일·야간 영업 여부와 종료 시간 확인",
  "전화로 재고/조제 가능 여부 확인",
  "길찾기로 도착 시각 검증",
  "혼잡 시 인근 대체 약국 확보",
];

const faqs = [
  {
    q: "처방전 사진으로도 조제가 가능한가요?",
    a: "약국마다 정책이 다르기 때문에 방문 전 전화로 먼저 확인하는 것이 가장 안전합니다. 일부 약국은 원본만 수용하며, 촬영 사진은 분실 신고 등 보완 절차가 필요할 수 있습니다. 병원에 연락해 처방전 재발급이 가능한지도 병행해서 확인해 두세요.",
  },
  {
    q: "공휴일에 보험 청구가 가능한가요?",
    a: "대부분의 공휴일에도 건강보험 청구는 정상적으로 처리됩니다. 단, 약국별 단말기 운영 방식이나 전산 점검 일정에 따라 처리가 지연될 수 있으므로 신분증과 보험증(또는 건강보험 앱)을 반드시 지참하고 문의하세요. 공휴일 가산료가 적용되어 본인 부담금이 소폭 높아질 수 있습니다.",
  },
  {
    q: "대기 시간을 줄이려면?",
    a: "전화로 조제 가능 여부와 예상 대기 시간을 물어본 뒤 방문하고, 길찾기로 소요 시간을 확인하세요. 점심시간(12~13시)과 저녁 퇴근 시간대(18~20시)는 특히 혼잡하므로 가능하면 피하는 것이 좋습니다. 복용 중인 약 목록을 미리 메모해 두면 약사와의 상담 시간도 크게 줄어듭니다.",
  },
  {
    q: "처방전 유효기간은 얼마나 되나요?",
    a: "일반 처방전의 유효기간은 발급일로부터 3일(발급 당일 포함)입니다. 공휴일이 끼어 있을 경우에도 달력 기준 3일이 적용되므로, 연휴 직전에 처방전을 받았다면 당일 또는 다음 날 바로 약을 받는 것이 안전합니다. 향정신성의약품 등 일부 특수 처방전은 별도 유효기간이 적용될 수 있으니 병원에 확인하세요.",
  },
  {
    q: "반복 조제(리필)가 가능한 처방전이 있나요?",
    a: "만성질환자를 위한 장기처방 및 반복처방 제도가 있으며, 의사가 처방전에 반복 투여 횟수를 기재한 경우 해당 횟수만큼 같은 처방전으로 조제를 받을 수 있습니다. 다만 모든 약국에서 동일하게 처리되지 않을 수 있으므로, 처방전 수령 시 담당 의사에게 반복 가능 여부를 확인해 두는 것이 좋습니다.",
  },
  {
    q: "약을 미리 넉넉히 준비해 두려면 어떻게 해야 하나요?",
    a: "연휴나 출장 전 주치의 진료를 통해 장기처방을 받는 것이 가장 확실한 방법입니다. 만성질환 복약 중이라면 최소 1~2주 전에 약이 부족하지 않은지 확인하고, 부족한 경우 진료 예약을 서두르세요. 약국에 재고가 있어야 조제가 가능하므로, 특수 의약품이라면 미리 전화로 재고 여부도 확인하는 것을 권장합니다.",
  },
];

export default function BlogPrescriptionPrepTips() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/prescription-prep-tips",
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
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "블로그", item: "https://todaypharm.kr/blog" },
      { "@type": "ListItem", position: 3, name: "처방전 준비와 약국 방문 전 점검 7가지", item: "https://todaypharm.kr/blog/prescription-prep-tips" },
    ],
  };
  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">블로그 · 처방전 준비</p>
        <h1 className="text-3xl font-bold leading-tight">처방전 준비와 약국 방문 전 점검 7가지</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/holiday-checklist"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            공휴일 체크리스트
          </Link>
        </div>
      </header>

      <AdSlotTop />

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">이 체크리스트가 필요한 순간</h2>
        <p className="text-base text-gray-700 leading-relaxed">
          처방전을 손에 쥐고 약국 문 앞에 섰을 때 &ldquo;오늘 영업을 안 하네&rdquo; 혹은 &ldquo;이 약 재고가 없어요&rdquo;라는 말을 들어본 적이 있다면, 사전 준비가 얼마나 중요한지 실감하셨을 것입니다. 특히 공휴일·야간처럼 대체 약국 선택지가 좁아지는 상황에서는 30분의 준비가 몇 시간의 이동을 줄여줍니다. 처방전 유효기간(발급일 포함 3일)은 생각보다 짧아, 연휴 첫날 처방전을 받았다면 당일 조제가 최선인 경우도 많습니다. 아래 7가지 체크리스트를 따라가면 예상치 못한 상황에서도 당황하지 않고 약을 받을 수 있습니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            처방전 유효기간(3일)을 확인하고, 연휴·출장 전에는 반드시 당일 수령을 목표로 움직이세요.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            복용 중인 약 목록을 메모하면 약사 상담 시간이 줄어들고 약물 상호작용 확인도 빨라집니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            특수·희귀 의약품은 재고가 없을 수 있으므로, 방문 전 반드시 전화로 재고를 확인하세요.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            대체 약국 1~2곳을 미리 검색해 두면, 첫 번째 약국에서 문제가 생겨도 즉시 이동할 수 있습니다.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">빠른 점검 리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          {steps.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">꼭 기억할 팁</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">신분증/보험증 필수</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              공휴일·야간에도 보험 청구를 위해 신분증과 보험증(또는 건강보험 앱)을 반드시 지참하세요. 보험증을 분실했더라도 국민건강보험공단 앱(The건강보험)이나 모바일 신분증으로 대체가 가능한 경우가 많으니 미리 앱을 설치해 두는 것이 유용합니다. 외국인 환자라면 외국인등록증과 여권을 함께 지참해야 보험 적용 여부를 빠르게 확인받을 수 있습니다. 공휴일에는 가산료가 붙어 본인부담금이 소폭 올라가는 점도 미리 알고 준비하면 당황하지 않습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">전화 후 길찾기</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              조제 가능 여부와 대기 시간을 전화로 확인한 뒤, 길찾기로 도착 시각을 검증하면 시간을 크게 아낄 수 있습니다. 처방전에 기재된 약 이름을 읽어주면 약사가 재고를 즉시 확인해 주므로, 전화 전에 처방전을 손에 꺼내 두세요. 퇴근 시간대(18~20시)와 점심 시간대(12~13시)는 조제 대기가 30~40분까지 길어질 수 있어 시간 여유가 필요합니다. 네이버지도·카카오맵의 &lsquo;실시간 혼잡도&rsquo; 기능을 활용하면 도착 전 약국 상황을 예측하는 데 도움이 됩니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">대체 약국 확보</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              혼잡하거나 재고가 없을 경우를 대비해 반경 500m~1km를 넓혀 대체 약국을 1~2곳 미리 검색해 두세요. 공휴일에는 전체 약국 중 당번 약국만 운영되므로, 약국오늘의 공휴일 필터를 활용해 영업 중인 곳을 여러 곳 저장해 두는 것이 현명합니다. 특정 제약사 약품이나 냉장 보관 의약품은 모든 약국에 재고가 없을 수도 있으니, 주치의에게 대체 가능한 동일 성분 약품을 미리 물어두면 유용합니다. 이동 거리와 교통 수단에 따라 현실적으로 이동 가능한 약국 목록을 2개 이상 준비하면 긴급 상황에서도 침착하게 대응할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">처방전 유효기간과 사전 준비 전략</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">처방전 유효기간 3일의 함정</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              처방전은 발급일 포함 3일 이내에 사용해야 합니다. 금요일 오후에 처방전을 받았다면 주말을 포함해 일요일까지만 유효하며, 월요일에는 이미 만료된 처방전이 됩니다. 3일 연휴가 시작되기 직전에 처방전을 받는 경우라면 당일 조제가 사실상 유일한 선택지가 될 수 있습니다. 연휴 일정이 예정되어 있다면 처방전 수령 즉시 영업 약국을 확인하고 이동하는 습관을 들이는 것이 중요합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">만성질환자의 반복 조제 활용법</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              고혈압·당뇨·고지혈증 등 만성질환으로 장기 복약 중이라면 담당 의사에게 반복처방 또는 장기처방을 요청할 수 있습니다. 반복처방전에는 조제 횟수가 기재되어 있어, 매번 병원을 방문하지 않고 정해진 횟수까지 약국에서 직접 조제를 받을 수 있습니다. 연휴나 장기 출장 전 최소 2주 전에 잔여 약량을 점검하고, 부족하면 진료 예약을 서두르는 것이 가장 안전한 전략입니다. 복용 중인 약의 이름·용량·복용 횟수를 메모 앱이나 카카오톡 자신에게 보내기 등으로 저장해 두면, 긴급 상황에서 의사나 약사에게 빠르게 정보를 전달할 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">처방전 사진·사본 보관의 실용 전략</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              처방전 원본은 조제 후 약국이 보관하는 것이 원칙이므로, 발급 직후 스마트폰으로 촬영해 갤러리 또는 클라우드에 저장해 두세요. 이 사진은 분실 신고, 재발급 요청, 타 의료기관 방문 시 참고 자료로 활용할 수 있습니다. 다만 사진만으로 조제를 받는 것은 약국 재량이므로, 원본이 없는 상황에서는 반드시 먼저 전화로 확인한 뒤 방문해야 헛걸음을 막을 수 있습니다. 처방전에는 개인정보와 병명이 포함되어 있으므로, 사진 공유 시 민감 정보 유출에 주의하세요.
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
              <h3 className="text-base font-bold text-gray-900">추석 연휴 첫날, 처방전 유효기간 마지막 날</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              금요일에 병원에서 처방전을 받았는데 추석 연휴가 토·일·월 3일간 이어지는 상황입니다. 처방전 유효기간이 오늘까지라면, 공휴일 당번 약국을 즉시 검색해 영업 시간 종료 전에 도착하는 것이 최우선입니다. 약국오늘에서 &lsquo;지금 영업 중&rsquo; 필터로 가장 가까운 당번 약국을 찾고, 전화로 재고 여부를 확인한 뒤 이동하면 헛걸음을 막을 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">야간에 처방전 약을 받아야 하는데 주변 약국이 문을 닫은 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              밤 10시에 응급실 진료 후 처방전을 받았지만 인근 약국이 모두 닫혀 있는 상황이라면, 24시간 야간 당번 약국을 먼저 검색해야 합니다. 각 지역 보건소나 119에서 야간 당번 약국 안내를 받을 수 있으며, 약국오늘의 야간 필터를 활용하면 반경 내 운영 중인 약국을 빠르게 확인할 수 있습니다. 이동이 어렵다면 응급실 내 원내 조제실에서 처방 약품을 받을 수 있는지 병원 담당자에게 먼저 문의해 보세요.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">특수 의약품 재고가 없어 여러 약국을 전전하는 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              안과·피부과·류마티스 처방 등 일부 특수 의약품은 모든 약국이 재고를 보유하지 않아 여러 곳을 돌아야 하는 상황이 생길 수 있습니다. 이럴 때는 병원 처방 후 바로 주변 약국에 전화해 재고 확인을 하거나, 병원 원무과에 해당 의약품을 갖춘 약국을 추천해 달라고 요청하는 것이 가장 빠른 해결책입니다. 처방 의약품명과 용량을 메모해 두면 전화 상담 시간을 크게 줄일 수 있으며, 대형 병원 인근 약국일수록 특수 처방 의약품 재고를 갖추고 있는 경우가 많습니다.
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
              처방전을 준비하고, 내 주변 검색으로 가장 가까운 영업 약국을 확인해 보세요.
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

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/blog/prescription-holiday-guide" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">처방전 약 연휴에 못 받을 때 대처법</p>
            <p className="text-xs text-gray-500 mt-1">연휴 처방전 긴급 대처</p>
          </Link>
          <Link href="/blog/pharmacy-visit-checklist-3" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 확인 3가지</p>
            <p className="text-xs text-gray-500 mt-1">영업·재고·처방전 점검</p>
          </Link>
        </div>
      </section>

      <AdSlotBottom />

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

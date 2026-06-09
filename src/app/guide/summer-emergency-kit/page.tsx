import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "여름 휴가철 휴대용 응급 키트 구성법 | 약국오늘";
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
    a: "항히스타민제나 소염 연고를 준비하고, 심한 통증·호흡 곤란 시 의료기관을 바로 방문하세요. 벌레 물린 직후에는 해당 부위를 깨끗이 씻고 냉찜질로 붓기를 가라앉힌 뒤 연고를 바르는 순서가 효과적입니다. 야외 활동이 많은 날에는 외출 전 긴 소매·방충제를 함께 활용하면 더욱 안전합니다.",
  },
  {
    q: "소화/멀미 대비는 무엇이 좋은가요?",
    a: "소화제, 지사제, 멀미약을 기본으로 챙기고, 음주나 과식이 예상되면 간 보호제도 약사와 상담해 준비하세요. 멀미약은 출발 30분~1시간 전에 복용해야 효과가 높으며, 졸음 부작용이 있으므로 운전자는 복용을 삼가야 합니다. 여행지 음식이 낯설어 설사가 우려된다면 정장제(유산균 계열)도 함께 넣어두면 장 건강을 지키는 데 도움이 됩니다.",
  },
  {
    q: "상처 처치는 어떻게 하나요?",
    a: "깨끗한 물로 세척 후 소독제 사용, 거즈·밴드로 보호하고 필요 시 냉찜질로 부기·통증을 줄입니다. 상처 깊이가 깊거나 지혈이 5분 이상 안 된다면 병원을 방문하는 것이 안전합니다. 해변이나 계곡처럼 모래·오염수에 노출되기 쉬운 환경이라면 방수 밴드를 별도로 챙겨두면 유용합니다.",
  },
  {
    q: "키트를 어떤 파우치에 담아야 하나요?",
    a: "지퍼락 또는 방수 파우치에 품목별로 소분해 담으면 야외에서도 빠르게 꺼낼 수 있습니다. 부피를 줄이려면 소포장 제품을 활용하고, 직사광선·고온을 피해 서늘한 가방 안쪽에 보관하세요. 크기는 A5 정도면 필수 품목 10가지 내외를 충분히 수납할 수 있습니다.",
  },
  {
    q: "아이와 함께 여행할 때 추가로 챙길 것이 있나요?",
    a: "소아용 해열제(이부프로펜·아세트아미노펜 계열)와 소아용 항히스타민 시럽을 별도로 준비하세요. 성인 제품은 용량·성분이 달라 어린이에게 임의로 사용하면 안 됩니다. 평소 아이가 복용하는 상비약이 있다면 소분 용기에 품명과 용량을 적어 키트 안에 함께 넣어두는 것이 좋습니다.",
  },
  {
    q: "고혈압·당뇨 같은 만성질환이 있으면 어떻게 준비하나요?",
    a: "여행 일수보다 2~3일 넉넉히 처방약을 챙기고, 원본 처방전 사본을 함께 보관하세요. 인슐린처럼 냉장 보관이 필요한 약품은 아이스팩과 단열 케이스를 사용하면 안전합니다. 여행지 근처 약국 위치를 미리 파악해두면 만약의 분실 상황에도 빠르게 대처할 수 있습니다.",
  },
];

export default function GuideSummerEmergencyKitPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/guide/summer-emergency-kit",
    type: "Article",
  });
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "가이드", item: "https://todaypharm.kr/guide" },
      { "@type": "ListItem", position: 3, name: "여름 응급 키트 구성법", item: "https://todaypharm.kr/guide/summer-emergency-kit" },
    ],
  };
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "여름 휴가철 응급 키트 구성 5단계",
    description: metaDescription,
    step: checklist.map((item, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: item,
      text: item,
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

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          여름 휴가철에는 강렬한 자외선, 고온 다습한 환경, 낯선 음식, 벌레 등 다양한 건강 위협 요소가 한꺼번에 몰려옵니다.
          응급 약품이 없는 상태에서 야외에서 갑작스러운 증상이 생기면 가까운 약국까지 이동하는 것조차 쉽지 않아 큰 불편을 겪게 됩니다.
          여행 전 10~15분만 투자해 키트를 미리 구성해두면 현장에서 당황하지 않고 신속하게 대처할 수 있습니다.
          이 가이드는 국내 약국에서 쉽게 구할 수 있는 품목 중심으로, 가방 하나에 담을 수 있는 현실적인 구성을 알려드립니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            해수욕장·계곡·캠핑처럼 약국이 멀거나 없는 야외 활동 전
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            어린이·노인·만성질환자와 함께 이동하는 가족 여행
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            벌레·해파리·강한 햇빛 노출이 예상되는 여름 레저 활동
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            연휴·공휴일처럼 약국 운영 시간이 불규칙한 기간의 장거리 이동
          </li>
        </ul>
      </section>

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
              자외선 차단제(SPF 50+ 권장)와 애프터선, 항히스타민/소염 연고를 챙기고, 벌레 물림과 해파리 접촉을 대비하세요.
              야외 수영 후에는 피부가 건조해지면서 자외선 손상이 빠르게 진행될 수 있으므로, 4시간마다 차단제를 덧바르는 것이 중요합니다.
              벌레 물린 자리는 긁지 않고 소염 연고를 소량 도포하면 2차 감염 위험을 낮출 수 있습니다.
              모기·등에·해파리 등 종류에 따라 증상이 다를 수 있으니, 붓기가 빠르게 번지거나 호흡에 이상이 생기면 즉시 의료기관을 방문하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">소화/멀미 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              소화제·지사제·멀미약을 기본으로 하고, 음주가 예상되면 간 보호제를 약사와 상담 후 준비하세요.
              멀미약은 패치형과 경구형으로 나뉘며, 패치형은 귀 뒤에 출발 4시간 전에 붙여야 효과가 충분히 나타납니다.
              여름철에는 더위와 높은 습도로 음식이 빠르게 상하므로, 지사제·정장제를 키트에 포함해 식중독 초기 증상에 빠르게 대응하세요.
              설사가 지속되거나 발열·구역이 동반된다면 단순 소화 불량이 아닐 수 있으니, 가까운 의료기관 또는 응급실을 방문하는 것이 안전합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">상처/타박 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              소독제, 거즈, 밴드, 냉찜질 패드를 챙기고, 통증 시 적절한 진통제를 사용하세요.
              계곡이나 바위 지형에서는 찰과상이 자주 발생하므로, 방수 밴드와 항균 소독 스프레이를 함께 넣어두면 편리합니다.
              발목 접질림처럼 타박·염좌가 생겼을 때는 즉시 냉찜질 패드로 15~20분 냉각하고 가급적 안정을 취하세요.
              상처가 깊거나 유리·날카로운 물체에 의한 것이라면 직접 압박 지혈 후 가까운 의료기관을 방문하는 것이 원칙입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">열사병·탈수 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              한국 여름 야외 기온이 35도를 넘는 날에는 고온 환경에 30분 이상 노출만으로도 열 탈진 증상이 나타날 수 있습니다.
              경구 수분 보충제(이온 음료 파우더)나 소금 사탕을 키트에 추가하면 빠른 전해질 보충에 도움이 됩니다.
              두통·어지러움·발한 감소가 동시에 나타나면 즉시 그늘로 이동해 시원한 물을 마시고 냉찜질 패드를 목·겨드랑이에 대세요.
              증상이 30분 이내에 나아지지 않으면 열사병으로 악화될 수 있으므로 119에 신고하거나 응급실로 이동하는 것이 안전합니다.
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
              <h3 className="text-base font-bold text-gray-900">해수욕장에서 해파리에 쏘였을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              바닷물에서 수영 중 다리에 타는 듯한 통증이 느껴졌다면 해파리 접촉을 의심할 수 있습니다.
              즉시 물 밖으로 나와 촉수를 맨손으로 제거하지 말고, 핀셋이나 카드 등 평평한 물건으로 긁어낸 뒤 바닷물로 헹구세요.
              소염 연고를 바르고 항히스타민제를 복용하면 가려움과 붓기 완화에 도움이 되며, 호흡 곤란·전신 두드러기가 나타나면 즉시 119에 신고해야 합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">캠핑 중 갑작스러운 설사·복통이 생겼을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              캠핑장에서 바비큐 후 2~6시간 내에 복통·설사가 시작됐다면 음식이 원인일 가능성이 높습니다.
              충분한 수분(이온 음료)을 보충하면서 지사제를 복용하고, 자극적인 음식을 피해 안정을 취하세요.
              38도 이상 고열이나 혈변이 동반된다면 단순 식중독이 아닐 수 있으므로 키트 사용과 동시에 가까운 의료기관 방문을 준비하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">장거리 드라이브 중 멀미가 심해졌을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              구불구불한 산길이나 뱃길에서 식은땀과 구역이 올라오기 시작했다면 즉시 환기를 하고 앞좌석 또는 먼 곳을 바라보세요.
              멀미약을 미리 챙겼다면 증상이 심해지기 전 복용하고, 위장이 부담을 느끼지 않도록 음식 섭취를 잠시 멈추는 것이 좋습니다.
              패치형을 준비하지 못했다면 생강 성분 사탕이나 민트 향 등이 일시적으로 구역감을 줄여주는 보조 방법으로 알려져 있으니 참고하세요.
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

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/blog/summer-first-aid-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">여름철 상비약 완전 정리</p>
            <p className="text-xs text-gray-500 mt-1">더위·벌레·소화 대비</p>
          </Link>
          <Link href="/blog/skin-trouble-first-aid-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">피부 트러블 응급 처치 키트</p>
            <p className="text-xs text-gray-500 mt-1">화상·발진·가려움 대비</p>
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

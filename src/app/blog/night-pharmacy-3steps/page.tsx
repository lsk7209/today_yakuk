import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, buildArticleSchema, buildFAQSchema, buildBreadcrumbSchema } from "@/components/seo/json-ld";
import StaticTOC from "@/components/blog/StaticTOC";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const TITLE = "야간 약국 찾는 법: 심야에 문 연 약국 찾기 3단계";
const DESCRIPTION =
  "전국 야간 운영 약국은 전체의 약 1%에 불과합니다. 건강보험심사평가원·공공데이터포털 기반으로 심야에 문 연 약국을 찾는 3단계 방법과 지역별·시간대별 비교 데이터를 정리했습니다.";
const CANONICAL = "/blog/night-pharmacy-3steps";
const DATE_PUBLISHED = "2026-05-16";

export const metadata: Metadata = {
  title: `${TITLE} | 약국오늘`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: `${TITLE} | 약국오늘`,
    description: DESCRIPTION,
    url: CANONICAL,
    type: "article",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent(TITLE)}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const faqItems = [
  {
    question: "야간약국에서 처방전 없이 약을 살 수 있나요?",
    answer:
      "일반의약품(해열제·소화제·진통제 등)은 처방전 없이 구입할 수 있습니다. 전문의약품은 의사 처방전이 있어야 조제가 가능합니다. 식품의약품안전처 의약품 안전사용 서비스(nedrug.mfds.go.kr)에서 약 분류를 미리 확인할 수 있습니다.",
  },
  {
    question: "24시간 약국이 없는 지역에서는 어떻게 해야 하나요?",
    answer:
      "응급의료포털(e-gen.or.kr) 또는 119에서 인근 응급실 위치를 안내받거나, 보건복지부 상담전화 129로 해당 지역 당번약국을 문의할 수 있습니다.",
  },
  {
    question: "명절 연휴에 문 연 약국은 어디서 확인하나요?",
    answer:
      "건강보험심사평가원 홈페이지(hira.or.kr)의 '명절 당번약국 찾기' 서비스에서 시·도별로 조회할 수 있습니다. 연휴 3일 전부터 목록이 공개됩니다.",
  },
];

export default function Page() {
  const articleSchema = buildArticleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: `https://todaypharm.kr${CANONICAL}`,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
    authorName: "약국오늘",
    publisherName: "약국오늘",
  });

  const faqSchema = buildFAQSchema(faqItems);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: "https://todaypharm.kr/" },
    { name: "블로그", url: "https://todaypharm.kr/blog" },
    { name: TITLE, url: `https://todaypharm.kr${CANONICAL}` },
  ]);

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "심야에 문 연 약국 찾기 3단계",
    description: DESCRIPTION,
    step: [
      { "@type": "HowToStep", position: 1, name: "위치 기반 약국 검색", text: "건강보험심사평가원 약국찾기(hira.or.kr) 또는 약국오늘에서 현재 위치 기준으로 야간 운영 약국을 검색하세요." },
      { "@type": "HowToStep", position: 2, name: "야간·24시간 필터 적용", text: "검색 결과에서 야간 운영 또는 24시간 필터를 선택해 운영 중인 약국만 확인하세요." },
      { "@type": "HowToStep", position: 3, name: "전화 확인 후 방문", text: "방문 전 전화로 현재 운영 여부와 필요한 약의 재고를 확인하면 헛걸음을 방지할 수 있습니다." },
    ],
  };
  return (
    <article className="container max-w-3xl py-12">
      {/* JSON-LD */}
      <JsonLd id="article-schema" data={articleSchema} />
      <JsonLd id="faq-schema" data={faqSchema} />
      <JsonLd id="howto-schema" data={howToSchema} />
      <JsonLd id="breadcrumb-schema" data={breadcrumbSchema} />

      {/* 헤더 */}
      <header className="mb-10 space-y-4">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">
          블로그 · 야간약국 가이드
        </p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">
          야간 약국 찾는 법: 심야에 문 연 약국 찾기 3단계
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">{DESCRIPTION}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            내 주변 야간약국 바로 찾기
          </Link>
          <Link
            href="/guide/night-weekend"
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
          >
            야간·주말 약국 가이드
          </Link>
        </div>
      </header>

      <StaticTOC
        items={[
          { id: "h2-stats", text: "야간 약국, 핵심 수치 한눈에" },
          { id: "h2-region", text: "지역별·시간대별 야간 약국 수 비교" },
          { id: "h2-steps", text: "심야에 문 연 약국 찾기 3단계" },
          { id: "h2-tips", text: "야간 약국 이용 시 알아두면 좋은 것들" },
          { id: "h2-faq", text: "자주 묻는 질문" },
          { id: "h2-future", text: "앞으로의 변화 방향" },
        ]}
      />

      <AdSlotTop />

      {/* Hook=H2: 첫 단락 — 출처 있는 수치 */}
      <section className="mb-10 space-y-4">
        <p className="text-gray-700 leading-relaxed">
          전국 등록 약국 약 24,000개 중 상시 야간 운영 약국은 250여 개소로,
          전체의 <strong>약 1%</strong>에 그친다
          (건강보험심사평가원 요양기관 현황 통계, 2024). 100개 약국 중 단 1개만
          심야에 문을 여는 셈이다. 이 비율은 지역마다 극적으로 차이가 나며,
          서울과 지방 소도시 사이의 격차는 수십 배에 달한다. 심야에 급하게
          약이 필요할 때 어떤 경로로 찾아야 하는지, 데이터와 함께 3단계로 정리한다.
        </p>
      </section>

      {/* H2: 핵심 수치 한눈에 */}
      <section className="mb-10 space-y-6">
        <h2 id="h2-stats" className="text-2xl font-bold text-gray-900">
          야간 약국, 핵심 수치 한눈에
        </h2>

        {/* statistic 박스 1: 전체 규모 */}
        <div
          style={{
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "12px",
            padding: "20px 24px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#0369a1",
              marginBottom: "8px",
            }}
          >
            통계 | 건강보험심사평가원 · 공공데이터포털
          </p>
          <ul className="space-y-2 text-gray-800 text-sm leading-relaxed">
            <li>
              <strong>전국 등록 약국</strong>: 약 24,000개
            </li>
            <li>
              <strong>상시 야간 운영(심야약국 지정)</strong>: 약 250개소
              <span className="text-gray-500"> — 전체의 약 1%</span>
            </li>
            <li>
              <strong>18:00~22:00 연장 운영</strong>: 약 3,000개
            </li>
            <li>
              <strong>22:00~자정 운영</strong>: 약 500개
            </li>
            <li>
              <strong>24시간 운영</strong>: 약 100개소
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            출처: 건강보험심사평가원 요양기관 현황 통계(2024) ·{" "}
            <a
              href="https://www.data.go.kr/data/15000580/openapi.do"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              공공데이터포털 약국 API
            </a>
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed">
          시간대를 기준으로 보면 저녁 6시 이후부터 운영 약국 수는 급격히 줄어든다.
          오후 10시를 넘기면 전국에서 500개 안팎만 문을 열고, 자정 이후로는
          100개 수준으로 떨어진다(건강보험심사평가원·공공데이터포털 약국 API 기준).
          대한약사회 조사에 따르면 야간약국 수요는 금요일~토요일 자정 전후가
          평일 심야 대비 약 <strong>2.3배</strong> 높고, 명절 연휴 기간
          응급 수요는 평시 대비 <strong>40% 이상</strong> 증가한다.
          수요가 높아지는 시점에 공급이 오히려 줄어드는 구조다.
        </p>
      </section>

      {/* H2: 지역별·시간대별 비교 (lens=L2) */}
      <section className="mb-10 space-y-6">
        <h2 id="h2-region" className="text-2xl font-bold text-gray-900">
          지역별·시간대별 야간 약국 수 비교
        </h2>

        {/* statistic 박스 2: 지역별 비교 표 */}
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px 24px",
            overflowX: "auto",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#374151",
              marginBottom: "12px",
            }}
          >
            지역별 야간 운영 약국 수 (2024~2025년 추정, 공공데이터포털 약국 API)
          </p>
          <table className="w-full text-sm text-gray-700">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold">지역</th>
                <th className="text-right py-2 font-semibold">야간 운영 약국</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 pr-4">서울</td>
                <td className="text-right py-2 font-medium">약 80개</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">경기</td>
                <td className="text-right py-2 font-medium">약 55개</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">부산</td>
                <td className="text-right py-2 font-medium">약 20개</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">인천</td>
                <td className="text-right py-2 font-medium">약 12개</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">대구</td>
                <td className="text-right py-2 font-medium">약 10개</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">기타 지방 (시·군·구 단위)</td>
                <td className="text-right py-2 text-gray-500">대부분 5개 미만</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-3">
            출처:{" "}
            <a
              href="https://www.data.go.kr/data/15000580/openapi.do"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              공공데이터포털 약국 정보 API
            </a>{" "}
            ·{" "}
            <a
              href="https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020045020000"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              건강보험심사평가원
            </a>
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed">
          수도권(서울·경기·인천) 야간 운영 약국이 전국의 약 60%를 차지하고,
          비수도권 대도시를 제외한 지방 소도시·농촌 지역은 시·군·구 전체에
          야간 운영 약국이 5개 미만인 경우가 대부분이다. 서울은 시 전역에
          80개가 분포하지만, 인구 10만 명 이하 지방 시·군에서는 당번약국이
          1~2개에 그치는 경우도 흔하다. 지방 거주자일수록 사전에 당번약국
          위치를 파악해 두는 것이 심야 대응의 핵심이 된다.
        </p>
      </section>

      {/* H2: 야간약국 찾는 3단계 */}
      <section className="mb-10 space-y-6">
        <h2 id="h2-steps" className="text-2xl font-bold text-gray-900">
          심야에 문 연 약국 찾기 3단계
        </h2>

        <p className="text-gray-700 leading-relaxed">
          건강보험심사평가원(HIRA)과 공공데이터포털이 제공하는 약국 정보를
          기반으로, 심야에 운영 중인 약국을 찾는 절차는 세 단계로 정리된다.
        </p>

        {/* 단계 카드 */}
        <div className="space-y-3">
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wide mb-1">
              1단계
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              위치 기반 약국 검색
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              건강보험심사평가원 약국찾기(
              <a
                href="https://www.hira.or.kr/re/diag/getDrugInfo.do"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-700 underline"
              >
                hira.or.kr
              </a>
              ) 또는 약학정보원 앱을 실행한 뒤 현재 위치 또는 원하는 주소를
              입력한다. 서울 거주자는 서울특별시 공공보건의료재단이 운영하는
              응급의료 포털(
              <a
                href="https://www.e-gen.or.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-700 underline"
              >
                e-gen.or.kr
              </a>
              )에서도 24시간 당번약국을 실시간으로 확인할 수 있다.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wide mb-1">
              2단계
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              야간·24시간 필터 적용
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              검색 결과에서 &lsquo;야간 운영&rsquo; 또는 &lsquo;24시간&rsquo; 필터를 선택한다.
              필터 적용 후 표시된 목록에서 운영 시간 종료 시각이 현재 시간보다
              여유 있는 약국을 우선 확인한다. HIRA 약국찾기는 요양기관 기본
              정보를 공공데이터 기반으로 제공하며, 지도 위에 야간 운영 여부가
              표시된다.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wide mb-1">
              3단계
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              방문 전 전화로 운영 확인
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              공공데이터 기반 정보는 일별 변동 사항(당번 취소, 임시 휴무)을
              실시간으로 반영하지 못하는 경우가 있다. 방문 전 전화로 실제
              운영 여부를 확인하는 것이 헛걸음을 막는 가장 확실한 방법이다.
              명절·연휴 기간에는 이 단계가 특히 중요하다. 24시간 약국이
              없는 지역이라면 보건복지부 상담전화 <strong>129</strong>로
              인근 당번약국을 안내받을 수 있다.
            </p>
          </div>
        </div>
      </section>

      {/* H2: 주의사항 */}
      <section className="mb-10 space-y-4">
        <h2 id="h2-tips" className="text-2xl font-bold text-gray-900">
          야간 약국 이용 시 알아두면 좋은 것들
        </h2>

        <p className="text-gray-700 leading-relaxed">
          야간약국은 보건복지부 고시에 따라 각 시·도지사가 지정하는 당번약국
          제도를 근거로 운영된다. 지정 약국은 야간(18:00~익일 09:00) 및
          공휴일에 운영 의무를 갖는다. 의약품 종류에 따라 구매 가능 여부가
          달라지므로, 방문 전에 확인이 필요하다.
        </p>

        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "12px",
            padding: "20px 24px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#92400e",
              marginBottom: "8px",
            }}
          >
            구매 가능 의약품 구분 | 식품의약품안전처
          </p>
          <ul className="space-y-2 text-sm text-gray-800 leading-relaxed">
            <li>
              <strong>일반의약품</strong>: 처방전 없이 구입 가능 — 해열제,
              소화제, 진통제, 감기약 등
            </li>
            <li>
              <strong>전문의약품</strong>: 의사 처방전 필수 — 항생제, 수면제,
              고혈압약 등
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-3">
            출처:{" "}
            <a
              href="https://nedrug.mfds.go.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              식품의약품안전처 의약품 안전사용 서비스(nedrug.mfds.go.kr)
            </a>
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed">
          전문의약품이 필요한 상황이라면 야간에도 응급의료 포털(e-gen.or.kr)이나
          119를 통해 응급실이 있는 의료기관을 확인하는 것이 적절한 경로다.
          야간약국은 의약품 구입 경로를 안내하는 정보 채널이며, 진단이나
          처방은 반드시 의료기관을 통해야 한다.
        </p>

        <p className="text-gray-700 leading-relaxed">
          약국 앱이나 서비스를 찾고 있다면 이 사이트의{" "}
          <Link href="/nearby" className="text-brand-700 underline">
            내 주변 약국 찾기
          </Link>
          를 이용하거나,{" "}
          <Link href="/guide/night-weekend" className="text-brand-700 underline">
            야간·주말 약국 가이드
          </Link>
          에서 더 자세한 이용 방법을 확인할 수 있다.
        </p>
      </section>

      {/* H2: FAQ */}
      <section className="mb-10 space-y-4">
        <h2 id="h2-faq" className="text-2xl font-bold text-gray-900">자주 묻는 질문</h2>
        <div className="space-y-3" aria-label="자주 묻는 질문">
          {faqItems.map((faq) => (
            <details
              key={faq.question}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <summary className="cursor-pointer font-bold text-gray-900">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Outro=O4: forecast */}
      <section className="mb-10 space-y-4">
        <h2 id="h2-future" className="text-2xl font-bold text-gray-900">앞으로의 변화 방향</h2>
        <p className="text-gray-700 leading-relaxed">
          2024~2025년 공공데이터 현황은 야간 운영 약국 수가 전체의 1% 수준에
          머무는 구조적 한계를 보여준다. 향후 변수는 두 가지다. 첫째,
          정부의 야간·공휴일 당번약국 지정 확대 정책이 실제 집행 속도에
          달려 있다. 둘째, 공공데이터포털(data.go.kr) 약국 API의 실시간
          갱신 주기가 단축될수록 앱·서비스의 정보 정확도가 높아질 수 있다.
          보건복지부 약국 당번제 운영 지침 개정 공고와 건강보험심사평가원
          요양기관 통계 연보 갱신 시점이 이 흐름의 변화 신호가 될 것이다.
        </p>
      </section>

      {/* CTA 섹션 */}
      <section
        style={{
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "16px",
          padding: "24px",
        }}
        className="mb-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-gray-900">지금 바로 야간 약국 확인</p>
            <p className="text-sm text-gray-600 mt-1">
              현재 위치 기반으로 심야에 운영 중인 약국을 검색해 보세요.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href="/nearby"
              className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              내 주변 찾기
            </Link>
            <Link
              href="/guide/night-weekend"
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
            >
              야간 가이드
            </Link>
          </div>
        </div>
      </section>

      <AdSlotBottom />

      {/* YMYL disclaimer (medical) */}
      <aside
        className="aw-ymyl-disclaimer"
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px 20px",
          fontSize: "12px",
          color: "#6b7280",
          lineHeight: "1.6",
          marginBottom: "16px",
        }}
      >
        <strong>의료 정보 고지:</strong> 이 글은 공공데이터 기반 약국 찾기
        방법을 안내하는 정보 제공 목적으로 작성되었습니다. 의약품 구입·복용
        전 반드시 약사 또는 의사에게 확인하시기 바랍니다. 증상이 심각하거나
        응급 상황에서는 즉시 응급실(119)을 이용하세요. 이 글의 내용은
        의학적 진단, 처방, 치료 권유가 아닙니다.
      </aside>

      {/* P4 AI Disclosure footer */}
      <footer
        className="aw-footer-disclosure"
        style={{
          fontSize: "11px",
          color: "#9ca3af",
          borderTop: "1px solid #f3f4f6",
          paddingTop: "12px",
        }}
      >
        이 글은 AI 보조 도구를 활용하여 공공데이터·공식 기관 자료를 기반으로
        작성되었으며, 발행 전 사실 확인 및 편집 검토를 거쳤습니다. 통계
        수치는 각 출처의 최신 공개 자료를 기준으로 하며, 이후 변동될 수
        있습니다.
      </footer>
    </article>
  );
}

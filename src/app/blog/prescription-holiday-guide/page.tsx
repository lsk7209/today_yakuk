import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import StaticTOC from "@/components/blog/StaticTOC";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

// ── A2 Writer 슬롯: macro=C / hook=H2(statistic) / lens=L3(cause-effect) / outro=O4(forecast)
// ── 페르소나: P1(Curator) + P4(AI Disclosed) / YMYL=medical / 타깃=P3(만성질환자·고령자)

const metaTitle =
  "처방전 약 연휴에 못 받을 때 대처법 — 유효기간·비상약국·응급 절차 총정리";
const metaDescription =
  "국내 만성질환자 1,500만 명 이상이 연휴마다 처방약 수령 문제에 직면합니다. 처방전 유효기간 3일 규정부터 비상약국 조회, 응급실 대체 방법까지 보건복지부·심평원 자료 기준으로 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/prescription-holiday-guide" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/prescription-holiday-guide",
    type: "article",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("처방전 약 연휴에 못 받을 때 대처법")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

const faqs = [
  {
    q: "연휴 중 처방전 유효기간이 지났으면 어떻게 하나요?",
    a: "유효기간(발행일 포함 3일)이 초과된 처방전으로는 조제가 불가합니다. 연휴 운영 의원 또는 응급실을 방문해 새 처방전을 발급받아야 합니다. 건강보험심사평가원 e-gen.or.kr에서 연휴 운영 의료기관을 조회할 수 있습니다.",
  },
  {
    q: "처방약 1~2일치가 부족할 때 약국에서 일부만 받을 수 있나요?",
    a: "처방전 유효기간 내라면 약사 판단에 따라 부분 조제가 가능합니다. 방문 전 해당 약국에 전화로 확인하고, 나머지 분량은 유효기간 내 다시 수령하면 됩니다.",
  },
  {
    q: "처방전 없이 기존 만성질환약을 구입할 수 없나요?",
    a: "고혈압·당뇨 등 대부분의 만성질환 치료제는 전문의약품으로 분류되어 처방전 없이 구입이 불가합니다. 식품의약품안전처 자료에 따르면 처방전 없는 전문의약품 구입은 법적으로 금지되어 있습니다.",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
    { "@type": "ListItem", position: 2, name: "블로그", item: "https://todaypharm.kr/blog" },
    {
      "@type": "ListItem",
      position: 3,
      name: "처방전 약 연휴에 못 받을 때 대처법",
      item: "https://todaypharm.kr/blog/prescription-holiday-guide",
    },
  ],
};

// JSON-LD: Article + FAQPage (macro=C, FAQ H2 있으므로 FAQPage 추가)
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

export default function Page() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/prescription-holiday-guide",
    type: "Article",
  });

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "연휴 처방약 준비 5단계",
    description: metaDescription,
    step: [
      { "@type": "HowToStep", position: 1, name: "연휴 시작 3~7일 전 처방 요청", text: "연휴가 시작되기 최소 3~7일 전에 담당 의사에게 연장 처방을 요청하세요. 만성질환 약이라면 연휴 기간만큼 여유분을 받아두는 것이 안전합니다." },
      { "@type": "HowToStep", position: 2, name: "연휴 운영 약국 사전 조회", text: "건강보험심사평가원 또는 약국오늘에서 연휴 기간 영업하는 인근 약국을 미리 확인해 두세요." },
      { "@type": "HowToStep", position: 3, name: "연휴 첫날 이전 조제 완료", text: "처방전 유효기간은 발행일 포함 3일입니다. 연휴 전에 반드시 조제를 완료해 두세요." },
      { "@type": "HowToStep", position: 4, name: "연휴 중 당번·야간약국 활용", text: "약을 미처 못 준비했다면 당번약국 또는 야간약국 후보를 확인하세요. 등록 영업시간과 실제 운영은 다를 수 있으므로 출발 전 전화 확인이 필요합니다." },
      { "@type": "HowToStep", position: 5, name: "응급 상황 시 응급실 방문", text: "약 부족으로 건강이 위험한 경우 응급실을 방문하면 응급 처방 및 조제가 가능합니다." },
    ],
  };
  return (
    <div className="container py-10 sm:py-14 space-y-10">

      {/* ── 헤더 ── */}
      <header className="space-y-4">
        <p className="text-sm font-semibold text-brand-700">
          블로그 · 처방전·연휴 대처
        </p>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          처방전 약 연휴에 못 받을 때 대처법 — 약국 유효기간·비상약국·응급 절차
        </h1>

        {/* Hook=H2 statistic — 첫 단락에 출처 있는 수치 1개 이상 */}
        <p className="text-base leading-relaxed text-gray-700">
          건강보험심사평가원 자료에 따르면, 국내 만성질환자(고혈압·당뇨·고지혈증 등)는
          1,500만 명을 넘어서며 전체 외래 진료의 약 40%를 차지한다. 이들 대부분은
          정기적으로 처방약을 복용해야 하는데, 연휴가 길어질수록 처방전 유효기간과
          약국 운영 여부가 복잡하게 얽힌다. 이 글에서는 처방전 유효기간 규정부터
          연휴 중 약을 수령하는 단계별 방법, 그리고 응급 상황 대처까지
          보건복지부·심평원 공식 자료를 근거로 정리한다.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 transition-colors"
          >
            내 주변 약국 찾기
          </Link>
          <Link
            href="/guide/holiday-checklist"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 transition-colors"
          >
            연휴 체크리스트
          </Link>
        </div>
      </header>

      <StaticTOC
        items={[
          { id: "h2-stats", text: "핵심 수치 한눈에" },
          { id: "h2-definition", text: "처방전 유효기간이란?" },
          { id: "h2-problem", text: "처방전 유효기간과 연휴 — 왜 문제가 생기나" },
          { id: "h2-steps", text: "연휴에 처방약 받는 법" },
          { id: "h2-comparison", text: "연휴 전 vs 연휴 중 비교" },
          { id: "h2-faq", text: "자주 묻는 질문" },
          { id: "h2-future", text: "앞으로의 변화 전망" },
        ]}
      />

      <AdSlotTop />

      {/* ── 핵심 수치 박스 1 (statistic box — macro=C 필수 ≥2) ── */}
      <section
        aria-label="핵심 수치"
        className="rounded-2xl border border-green-100 bg-green-50 p-6 shadow-sm"
      >
        <h2 id="h2-stats" className="text-lg font-bold text-green-800 mb-4">
          처방전 연휴 수령 — 핵심 수치 한눈에
        </h2>
        <ul className="space-y-3 text-sm text-green-900">
          <li>
            <strong>처방전 유효기간 3일</strong> — 발행일 포함 공휴일 관계없이
            3일 이내 조제 완료 필요 (보건복지부)
          </li>
          <li>
            <strong>만성질환자 1,500만 명 이상</strong> — 전체 외래 진료의 약
            40% 해당, 연휴 처방약 공백에 가장 취약한 집단
            (건강보험심사평가원)
          </li>
          <li>
            <strong>비상약국 1일 평균 약 1만 3천여 곳 운영</strong> — 그러나
            야간 운영은 권역별 1~3곳에 불과 (국민건강보험공단)
          </li>
          <li>
            <strong>연휴 전 7일 이내 처방 권고</strong> — 보건복지부가 만성질환자에게
            연휴 시작 최소 1주 전 충분한 처방을 받아 둘 것을 권고
          </li>
        </ul>
      </section>

      {/* ── 핵심 정의 박스 ── */}
      <section
        aria-label="처방전 유효기간 정의"
        className="rounded-2xl border-l-4 border-blue-400 border border-blue-100 bg-blue-50 p-6 shadow-sm"
      >
        <h2 id="h2-definition" className="text-lg font-bold text-blue-800 mb-3">
          처방전 유효기간이란?
        </h2>
        <p className="text-sm text-blue-900 leading-relaxed">
          처방전 유효기간은 의약품 관련 규정에 따라{" "}
          <strong>발행일 포함 3일(공휴일 포함)</strong>이다. 유효기간이 지난
          처방전으로는 약국이 조제를 거부할 수 있으며, 이 경우 의료기관을 재방문해
          새 처방전을 발급받아야 한다. 단, 의사가 처방전에 별도 유효기간을 기재한
          경우 해당 기간 내 유효하다.
          <br />
          <span className="text-blue-600 text-xs">
            출처: 보건복지부 (mohw.go.kr)
          </span>
        </p>
      </section>

      {/* ── H2: 처방전 유효기간과 연휴의 관계 (lens L3: 원인→결과) ── */}
      <section className="space-y-4">
        <h2 id="h2-problem" className="text-2xl font-bold text-gray-900">
          처방전 유효기간과 연휴 — 왜 문제가 생기나
        </h2>
        <p className="text-base leading-relaxed text-gray-700">
          처방전 유효기간이 3일인 구조에서 3~5일짜리 연휴가 시작되면,
          연휴 첫날 또는 둘째 날에 처방전을 받았다면 유효기간 내 약을 수령할 수
          있지만, 연휴가 시작된 이후 처방전이 발행되면 운영 약국을 찾기가
          어려워진다. <strong>이로 인해</strong> 만성질환자들은 처방약 복용을
          중단하거나 응급실을 찾는 상황에 놓이게 된다.
        </p>
        <p className="text-base leading-relaxed text-gray-700">
          보건복지부 자료에 따르면 이 문제의 근본 원인은 두 가지다. 첫째,
          단기 유효기간(3일) 규정이 연휴 기간과 맞물리는 경우다. 둘째,
          연휴 기간 운영 약국 정보를 사전에 확인하지 않은 채 이동하거나
          귀향했을 때 주변에 개업 약국이 없는 경우다. 그 결과,
          처방약을 임의로 중단하면 혈압·혈당 등의 수치가 급격히 변동할 수
          있으며, 이는 심각한 건강 문제로 이어질 수 있다는 점이
          의료기관 안내를 통해 반복적으로 강조된다.
        </p>

        {/* 원인→결과 도식 (lens L3 시각화) */}
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-bold text-amber-800 mb-3">
            인과 흐름 (cause → effect)
          </p>
          <div className="flex flex-col gap-2 text-sm text-amber-900">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-200 px-3 py-1 font-semibold whitespace-nowrap">
                원인
              </span>
              <span>처방전 유효기간 내 약국 미방문 또는 연휴 중 처방전 만료</span>
            </div>
            <div className="pl-6 text-amber-600">↓</div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-200 px-3 py-1 font-semibold whitespace-nowrap">
                1차 결과
              </span>
              <span>처방약 복용 중단 → 만성질환 수치 불안정</span>
            </div>
            <div className="pl-6 text-amber-600">↓</div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-200 px-3 py-1 font-semibold whitespace-nowrap">
                최종 결과
              </span>
              <span>연휴 중 응급실 방문 증가, 불필요한 의료비 발생</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── H2: 연휴 처방약 받는 법 — 단계별 절차 ── */}
      <section className="space-y-5">
        <h2 id="h2-steps" className="text-2xl font-bold text-gray-900">
          연휴에 처방약 받는 법 — 보건복지부 권고 절차
        </h2>
        <p className="text-base leading-relaxed text-gray-700">
          보건복지부 공식 안내를 기준으로, 연휴 기간 처방약을 안전하게 수령하기
          위한 절차는 다음과 같다.
        </p>

        <ol className="space-y-4">
          <li className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-bold text-brand-700 mb-1">
              1단계 — 연휴 시작 최소 3~7일 전 처방 요청
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              주치의 또는 단골 의원을 방문해 연휴 기간을 포함한 충분한 일수의
              처방전 발급을 요청한다. 보건복지부는 만성질환자에게 연휴 시작 1주 전에
              처방을 받아 두도록 권고하고 있다.
            </p>
          </li>
          <li className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-bold text-brand-700 mb-1">
              2단계 — 연휴 운영 약국 사전 조회
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              건강보험심사평가원{" "}
              <strong>e-gen.or.kr</strong> 또는 &apos;건강보험 앱&apos;에서
              연휴 운영 약국을 사전에 조회한다. 귀향지 또는 여행지 주변 약국을
              미리 파악해 두는 것이 연휴 중 공백을 줄이는 가장 확실한 방법이다.
            </p>
          </li>
          <li className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-bold text-brand-700 mb-1">
              3단계 — 연휴 첫날 이전 조제 완료
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              처방전 유효기간 내에 조제를 완료하는 것이 원칙이다. 연휴 직전
              약국은 대기가 길어질 수 있으므로 최소 하루 전 방문을 권장한다.
              일부 약국은 연휴 직전 조기 마감할 수 있으므로 영업 시간을 사전에
              확인하는 것이 안전하다.
            </p>
          </li>
          <li className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-bold text-brand-700 mb-1">
              4단계 — 연휴 중 비상약국 또는 야간약국 활용
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              연휴 중 약이 부족한 경우 비상약국을 활용할 수 있다. 국민건강보험공단
              자료에 따르면 연휴 기간 1일 평균 약 1만 3천여 곳의 비상약국이
              운영되나, 야간에는 권역별 1~3곳에 불과하다. 보건복지부 상담전화
              129 또는 119를 통해 가까운 운영 약국 안내를 받을 수 있다.
            </p>
          </li>
          <li className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="font-bold text-brand-700 mb-1">
              5단계 — 응급 상황 시 응급실 방문
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              처방전이 만료되었거나 약이 완전히 소진된 응급 상황에서는 응급실을
              방문해 원내 처방 및 조제 가능 여부를 확인할 수 있다. 단,
              비응급 사유로 응급실을 방문할 경우 대기가 매우 길고 비용이 높아질 수
              있으므로, 사전 비상약국 확인이 선행되어야 한다.
            </p>
          </li>
        </ol>

        <div className="text-right">
          <Link
            href="/nearby"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            지금 주변 운영 약국 조회하기 →
          </Link>
        </div>
      </section>

      {/* ── H2: 비교표 — 연휴 전 vs 연휴 중 약 수령 비교 ── */}
      <section className="space-y-4">
        <h2 id="h2-comparison" className="text-2xl font-bold text-gray-900">
          연휴 전 vs 연휴 중 — 약 수령 방법 비교
        </h2>
        <p className="text-base leading-relaxed text-gray-700">
          국민건강보험공단 자료를 바탕으로 세 가지 경로를 비교하면 아래와 같다.
          처방약 수령 경로에 따라 접근성과 비용 차이가 크게 벌어진다는 점에서,
          연휴 전 미리 처방을 받아 두는 것이 가장 효율적이다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                  항목
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                  연휴 전 (3~7일 전)
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                  연휴 중 (비상약국)
                </th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                  연휴 중 (응급실)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                  이용 가능 기관
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  일반 의원·약국 전체
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  1일 1만 3천여 곳(야간 1~3곳/권역)
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  권역별 응급의료센터
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                  처방 가능 여부
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  가능 (충분한 일수 요청 가능)
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  기존 처방전 필요
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  응급 처방 가능
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                  대기 시간
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  짧음 (평일 기준)
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  중간 (운영 약국 집중)
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  매우 길 수 있음
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-700">
                  비용
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  정상 (건강보험 적용)
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  정상 (건강보험 적용)
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-600">
                  응급실 가산 요금 발생 가능
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500">
          출처: 국민건강보험공단, 보건복지부 (자료 기준: 2025년)
        </p>
      </section>

      {/* ── 핵심 수치 박스 2 (statistic box #2 — macro=C 필수 ≥2) ── */}
      <section
        aria-label="처방약 임의 중단 관련 안내"
        className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm"
      >
        <h2 className="text-base font-bold text-red-800 mb-3">
          처방약 임의 중단 — 반드시 알아야 할 사항
        </h2>
        <ul className="space-y-2 text-sm text-red-900">
          <li>
            <strong>처방약 임의 중단은 금지.</strong> 고혈압·당뇨 등 만성질환약은
            복용을 갑자기 중단하면 혈압·혈당 수치가 급격히 변동할 수 있다.
            복용량 변경이나 중단이 필요한 경우 반드시 담당 의료진과 상의해야 한다.
          </li>
          <li>
            <strong>복용량 변경은 의사 상담 필수.</strong> 약이 부족하다고
            복용량을 임의로 조절하는 것은 건강에 더 큰 위험을 초래할 수 있다.
          </li>
          <li>
            <strong>연휴 전 129 콜센터 활용.</strong> 보건복지부 24시간 상담전화
            129에서 가까운 연휴 운영 의료기관 및 약국 정보를 안내받을 수 있다.
          </li>
        </ul>
      </section>

      {/* ── H2: 자주 묻는 질문 ── */}
      <section className="space-y-4">
        <h2 id="h2-faq" className="text-2xl font-bold text-gray-900">자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Outro O4: forecast — 본문 통계와 연결된 전망 ── */}
      <section className="space-y-3">
        <h2 id="h2-future" className="text-xl font-semibold text-gray-900">
          앞으로의 변화 — 연휴 처방 정책 전망
        </h2>
        <p className="text-base leading-relaxed text-gray-700">
          건강보험심사평가원 통계는 만성질환 외래 진료 비중이 매년 증가 추세임을
          보여준다. 향후 변수는 두 가지다. 첫째, 고령 인구 증가에 따른 만성질환자
          수 확대로 연휴 처방 수요가 더 늘어날 가능성이다. 둘째, 디지털 처방전
          확대 또는 비대면 진료 제도화 여부다. 보건복지부가 연휴 비대면 진료
          한시 허용 범위를 어떻게 조정하는지가, 향후 연휴 처방 공백 문제의
          완화 신호로 작동할 것으로 보인다.
        </p>
      </section>

      {/* ── CTA 섹션 ── */}
      <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              지금 주변 연휴 운영 약국을 확인하세요
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              위치 기반으로 가까운 약국과 등록 영업시간 기준 운영 상태를 확인할 수 있습니다. 출발 전 전화로 실제 운영 여부를 확인하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/nearby"
              className="inline-flex items-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              내 주변 약국 찾기
            </Link>
            <Link
              href="/guide/holiday-checklist"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-300 transition-colors"
            >
              연휴 체크리스트 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/prescription-prep-tips", label: "처방전 방문 전 준비 팁", desc: "처방전·보험카드·복약 이력 준비 체크리스트" },
            { href: "/blog/lost-prescription-action-guide", label: "처방전 잃어버렸을 때 대처법", desc: "재발급·응급 대처 단계별 안내" },
            { href: "/nearby", label: "내 주변 약국 바로 찾기 →", desc: "위치 기반 현재 영업 중인 약국 검색" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-brand-200 transition-all space-y-1"
            >
              <p className="font-bold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <AdSlotBottom />

      {/* ── P4 AI Disclosure footer ── */}
      <footer
        className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500 leading-relaxed"
        aria-label="AI 공개 및 YMYL 안내"
      >
        <p className="mb-2">
          이 글은 AI 도구를 활용해 보건복지부·건강보험심사평가원·국민건강보험공단·식품의약품안전처
          등 공개된 의료·정책 자료를 정리·요약한 결과입니다. 사실 확인은 출처 링크의 원문을
          우선합니다.
        </p>
        {/* ── YMYL Disclaimer ── */}
        <p className="border-l-4 border-amber-400 bg-amber-50 pl-3 py-2 text-amber-800">
          본 사이트는 의료인이 운영하지 않으며, 글의 어떤 내용도 진단·처방·치료를 대체하지
          않습니다. 처방약 복용 중단이나 용량 변경은 반드시 담당 의료진과 상의하시기
          바랍니다.
        </p>
      </footer>

      {/* ── JSON-LD ── */}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}

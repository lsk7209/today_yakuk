import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, buildArticleSchema, buildFAQSchema } from "@/components/seo/json-ld";
import StaticTOC from "@/components/blog/StaticTOC";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

// ─── 메타데이터 ───────────────────────────────────────────────
const metaTitle = "약국 방문 전 꼭 확인해야 할 것들: 영업·재고·처방 3가지 | 약국오늘";
const metaDescription =
  "약국에 헛걸음하지 않으려면 영업 여부만이 아니라 재고 확인과 처방전 유효기간까지 세 가지를 미리 점검해야 합니다. 보건복지부·심평원 기준으로 정리했습니다.";
const slug = "/blog/pharmacy-visit-checklist-3";
const datePublished = "2026-05-16";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: slug },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: slug,
    type: "article",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("약국 방문 전 확인 3가지")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

// ─── FAQ 데이터 ───────────────────────────────────────────────
const faqs = [
  {
    question: "처방전 유효기간이 지나면 어떻게 되나요?",
    answer:
      "처방전은 발행일 포함 3일(당일+2일) 이내에만 조제받을 수 있습니다. 기간이 지나면 해당 의원·병원에서 재발급을 받아야 합니다. 건강보험심사평가원 규정 기준입니다.",
  },
  {
    question: "약국에서 재고 확인을 전화로 할 때 뭐라고 물어보면 되나요?",
    answer:
      "처방전에 적힌 약 이름(또는 성분명)을 말씀하시고 '현재 재고가 있는지, 오늘 조제 가능한지'를 여쭤보면 됩니다. 약국은 재고 확인 문의를 받는 것이 일반적입니다.",
  },
  {
    question: "야간·공휴일 약국은 재고가 부족한가요?",
    answer:
      "야간·공휴일에 운영하는 약국은 전국 전체의 10% 미만입니다(건강보험심사평가원). 운영 약국 수가 적다 보니 특정 의약품은 재고가 제한될 수 있어, 방문 전 전화 확인을 권장합니다.",
  },
  {
    question: "처방전 없이 살 수 있는 약(OTC)도 재고 확인이 필요한가요?",
    answer:
      "일반의약품(OTC)은 대부분 재고가 충분하지만, 특정 전문 OTC 제품이나 소규모 약국에서는 품절이 발생할 수 있습니다. 급하게 필요한 경우라면 전화 확인이 안전합니다.",
  },
];

// ─── 비교표 데이터 ────────────────────────────────────────────
const comparisonRows = [
  {
    scenario: "영업시간만 확인 후 방문",
    result: "재고 없음·처방전 기간 초과로 헛걸음 가능",
    risk: "높음",
  },
  {
    scenario: "영업 + 재고 + 처방전 3종 확인 후 방문",
    result: "조제 완료 확률 대폭 상승",
    risk: "낮음",
  },
];

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function PharmacyVisitChecklist3() {
  // Article JSON-LD (speakable 포함 — macro B 필수)
  const articleSchema = {
    ...buildArticleSchema({
      headline: "약국 방문 전 꼭 확인해야 할 것들: 영업·재고·처방 3가지",
      description: metaDescription,
      url: `https://todaypharm.kr${slug}`,
      datePublished,
      dateModified: datePublished,
      authorName: "약국오늘 큐레이션 데스크",
      publisherName: "약국오늘",
    }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".aeo-answer"],
    },
  };

  const faqSchema = buildFAQSchema(
    faqs.map((f) => ({ question: f.question, answer: f.answer }))
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "블로그", item: "https://todaypharm.kr/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: "약국 방문 전 확인 3가지",
        item: `https://todaypharm.kr${slug}`,
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "약국 방문 전 헛걸음 방지 3단계 확인",
    description: metaDescription,
    step: [
      { "@type": "HowToStep", position: 1, name: "영업시간 확인", text: "약국오늘에서 현재 시간 기준 실시간 영업 여부를 확인하세요. 건강보험심사평가원 공공데이터 기반으로 제공됩니다." },
      { "@type": "HowToStep", position: 2, name: "재고 확인", text: "방문 전 전화로 필요한 약 재고가 있는지 확인하세요. 처방전에 적힌 약 이름을 말하고 조제 가능 여부를 물어보면 됩니다." },
      { "@type": "HowToStep", position: 3, name: "처방전 유효기간 확인", text: "처방전은 발행일 포함 3일(당일+2일) 이내에만 유효합니다. 기간이 지났다면 발급 병원에서 재발급을 받아야 합니다." },
    ],
  };
  return (
    <article className="container py-10 sm:py-14 space-y-10 bg-white min-h-screen">

      {/* ── 헤더 ── */}
      <header className="space-y-4" aria-label="글 머리말">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">
          블로그 · 약국 방문 가이드
        </p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">
          약국 방문 전 꼭 확인해야 할 것들: 영업·재고·처방 3가지
        </h1>

        {/* ── Hook H1 + 즉답 단락 (speakable .aeo-answer) ── */}
        <div
          className="aeo-answer rounded-2xl border border-brand-200 bg-brand-50 p-5 space-y-2"
          aria-label="핵심 답변"
        >
          <p className="text-base font-semibold text-brand-900 leading-relaxed">
            약국에 헛걸음하지 않으려면 무엇을 미리 확인해야 할까?
          </p>
          <p className="text-base text-gray-800 leading-relaxed">
            답은 세 가지다. <strong>① 현재 영업 여부</strong>,{" "}
            <strong>② 필요한 의약품의 재고</strong>,{" "}
            <strong>③ 처방전 유효기간(발행 후 3일 이내)</strong>. 영업시간만
            확인하고 갔다가 재고가 없거나 처방전이 만료되어 돌아오는 사례가
            빈번하다. 세 가지를 순서대로 점검하면 대부분의 헛걸음을 방지할 수
            있다.
          </p>
        </div>

        {/* ── 내부 링크 CTA ── */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            내 주변 약국 바로 찾기
          </Link>
          <Link
            href="/guide/call-scripts"
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
          >
            전화 문의 스크립트 보기
          </Link>
        </div>
      </header>

      <StaticTOC
        items={[
          { id: "h2-contrast", text: "흔한 오해 vs 실제 상황" },
          { id: "h2-hours", text: "1. 영업시간 확인" },
          { id: "h2-stock", text: "2. 재고 확인" },
          { id: "h2-prescription", text: "3. 처방전 준비" },
          { id: "h2-faq", text: "자주 묻는 질문" },
          { id: "h2-action", text: "지금 바로 할 수 있는 3단계" },
        ]}
      />

      <AdSlotTop />

      {/* ── L6 통념 vs 실제 contrast 박스 ── */}
      <section
        aria-label="흔한 오해와 실제"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-4"
      >
        <h2 id="h2-contrast" className="text-lg font-bold text-amber-900">
          흔한 오해 vs 실제 상황
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-amber-100 text-amber-900">
                <th className="p-3 text-left font-bold border border-amber-200 w-1/3">
                  시나리오
                </th>
                <th className="p-3 text-left font-bold border border-amber-200 w-2/5">
                  실제 결과
                </th>
                <th className="p-3 text-left font-bold border border-amber-200 w-1/4">
                  헛걸음 위험
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i} className="bg-white even:bg-amber-50">
                  <td className="p-3 border border-amber-200 text-gray-800">
                    {row.scenario}
                  </td>
                  <td className="p-3 border border-amber-200 text-gray-700">
                    {row.result}
                  </td>
                  <td
                    className={`p-3 border border-amber-200 font-semibold ${
                      row.risk === "높음"
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {row.risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-amber-700">
          야간·공휴일 운영 약국은 전체의 10% 미만(건강보험심사평가원). 운영
          약국 수 자체가 적어 재고 부족 가능성이 평일보다 높다.
        </p>
      </section>

      {/* ── H2 1. 영업시간 확인법 ── */}
      <section className="space-y-4">
        <h2 id="h2-hours" className="text-xl font-bold text-gray-900">
          1. 영업시간 확인: 지도 앱·공공데이터 활용
        </h2>
        <p className="text-gray-700 leading-relaxed">
          약국 운영 시간은 약사법 제20조에 따라 각 약국이 자율적으로 결정한다.
          같은 동네 약국이라도 종료 시간이 제각각이며, 공휴일·야간에는 문을
          닫는 곳이 대부분이다. 네이버 지도, 카카오맵, 또는 본 서비스 내{" "}
          <Link href="/nearby" className="text-brand-600 underline underline-offset-2">
            내 주변 약국 검색
          </Link>
          을 이용하면 현재 영업 중인 약국만 필터링해 볼 수 있다.
        </p>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-2">
          <p className="text-sm font-semibold text-gray-800">실시간 확인 순서</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>지도 앱 또는 약국오늘에서 &apos;영업 중&apos; 필터 켜기</li>
            <li>종료 예정 시간이 30분 이상 남은 약국 우선 선택</li>
            <li>길찾기로 도착 시각 검증(이동 시간 ≤ 잔여 영업 시간)</li>
          </ol>
        </div>
        <p className="text-gray-700 leading-relaxed">
          지도 앱 데이터는 실시간이 아닌 경우가 있다. 야간·공휴일처럼 변동이
          큰 상황에서는 전화로 재확인하는 것이 안전하다.{" "}
          <a
            href="https://www.mohw.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline underline-offset-2"
          >
            보건복지부
          </a>{" "}
          의약품 안전 사용 가이드도 방문 전 영업 여부 확인을 첫 번째 권고
          사항으로 제시한다.
        </p>
      </section>

      {/* ── H2 2. 재고 확인법 ── */}
      <section className="space-y-4">
        <h2 id="h2-stock" className="text-xl font-bold text-gray-900">
          2. 재고 확인: 전화 한 통이 헛걸음을 막는다
        </h2>

        {/* statistic 박스 */}
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <p
            style={{ fontWeight: "700", color: "#14532d", marginBottom: "4px" }}
          >
            야간·공휴일 약국 운영 비율
          </p>
          <p style={{ fontSize: "2rem", fontWeight: "900", color: "#16a34a" }}>
            10% 미만
          </p>
          <p style={{ fontSize: "0.8rem", color: "#166534", marginTop: "4px" }}>
            출처: 건강보험심사평가원 (2024년 기준)
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed">
          영업 중인 약국이라도 특정 의약품의 재고가 없을 수 있다. 전문의약품은
          수요 예측이 어렵고, 소형 약국일수록 보유 품목이 제한적이다. 야간이나
          공휴일에는 재입고가 불가능하므로 재고 부족 상황이 평일보다 자주
          발생한다.
        </p>
        <p className="text-gray-700 leading-relaxed">
          전화로 재고를 확인할 때는 처방전에 적힌 약 이름(또는 성분명)을
          정확히 알려주고 &quot;현재 재고가 있는지, 오늘 조제가 가능한지&quot;를 물어보면
          된다. 약국은 이러한 문의를 받는 것이 일반적이다. 전화 문의가
          어렵거나 어떻게 말해야 할지 모를 경우{" "}
          <Link
            href="/guide/call-scripts"
            className="text-brand-600 underline underline-offset-2"
          >
            전화 문의 스크립트 가이드
          </Link>
          를 참고할 수 있다.
        </p>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
          <p className="text-sm font-semibold text-gray-800">재고 확인 시 전달할 정보</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>처방전 의약품명 또는 성분명</li>
            <li>용량·규격(예: 500mg, 60정)</li>
            <li>도착 예정 시각(약국 대기 시간 조율)</li>
          </ul>
        </div>
      </section>

      {/* ── H2 3. 처방전 준비 ── */}
      <section className="space-y-4">
        <h2 id="h2-prescription" className="text-xl font-bold text-gray-900">
          3. 처방전 준비: 유효기간 3일 규정 확인
        </h2>

        {/* definition 박스 */}
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <p
            style={{ fontWeight: "700", color: "#1e3a5f", marginBottom: "6px" }}
          >
            처방전 유효기간이란?
          </p>
          <p style={{ fontSize: "0.95rem", color: "#1e40af", lineHeight: "1.7" }}>
            처방전은 발행일 포함 <strong>3일(당일+2일)</strong> 이내에만
            약국에서 조제를 받을 수 있다(건강보험심사평가원 규정). 3일이
            지나면 약국에서 조제가 거부되며, 해당 의료기관에서 재발급받아야
            한다.
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed">
          처방전을 발급받은 날로부터 2일이 지나면 유효기간이 만료된다. 진료
          당일 조제하지 못했거나 처방전을 잃어버렸다면 반드시 유효기간을
          먼저 확인해야 한다. 처방전 원본을 분실했을 경우에는 발급 의료기관에
          재발급을 요청해야 하며, 약국에서는 임의로 재처리할 수 없다.
        </p>
        <p className="text-gray-700 leading-relaxed">
          처방전을 가져갈 때는 <strong>신분증(또는 건강보험증·모바일 앱)</strong>을
          함께 지참해야 건강보험 적용이 가능하다. 공휴일·야간에도 보험 청구는
          가능하지만, 약국별 처리 방식이 다를 수 있어 사전 확인이 권장된다.
        </p>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-2">
          <p className="text-sm font-semibold text-gray-800">처방전 방문 전 체크리스트</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>처방전 발행일 확인 → 오늘 포함 3일 이내인지 점검</li>
            <li>처방전 원본 또는 공식 사본 지참</li>
            <li>신분증·건강보험증(또는 스마트폰 앱) 준비</li>
            <li>복용 중인 타 약물 리스트 메모(중복 처방 방지)</li>
          </ul>
        </div>
      </section>

      {/* ── H2 FAQ ── */}
      <section className="space-y-4">
        <h2 id="h2-faq" className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
        <div className="space-y-3" aria-label="FAQ">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <summary className="cursor-pointer font-bold text-gray-900 leading-snug">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Outro O1 action ── */}
      <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6 space-y-4">
        <div className="space-y-3">
          <h2 id="h2-action" className="text-xl font-bold text-brand-900">지금 바로 할 수 있는 3단계</h2>
          <ol className="list-decimal list-inside space-y-2 text-brand-800 font-medium">
            <li>처방전 발행일 확인 — 유효기간 3일 이내인지 먼저 점검</li>
            <li>약국오늘에서 내 주변 영업 중인 약국 검색 후 전화로 재고 확인</li>
            <li>신분증·처방전 챙겨서 출발 — 도착 시각은 길찾기로 미리 검증</li>
          </ol>
          <p className="text-sm text-brand-700">
            세 단계를 순서대로 따르면 야간·공휴일에도 헛걸음 없이 약을 받을 수
            있다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            내 주변 약국 찾기
          </Link>
          <Link
            href="/guide/call-scripts"
            className="inline-flex items-center rounded-full border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            전화 문의 스크립트
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/pharmacy-faq-top10", label: "약국 자주 묻는 질문 TOP10", desc: "영업시간·재고·처방전 관련 질문 모음" },
            { href: "/blog/prescription-holiday-guide", label: "처방전 약 연휴에 못 받을 때", desc: "유효기간 규정과 비상 약국 조회법" },
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

      {/* ── YMYL disclaimer ── */}
      <aside
        className="aw-ymyl-disclaimer rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-xs text-yellow-800 leading-relaxed"
        aria-label="의료 정보 안내"
      >
        <strong>의료 정보 안내:</strong> 본 글은 보건복지부·건강보험심사평가원
        등 공개된 의료·정책 자료를 정리·안내한 것으로, 진단·처방·치료를
        대체하지 않습니다. 복약 및 의학적 결정은 담당 의료진과 반드시 상의하시기
        바랍니다.
      </aside>

      {/* ── P4 AI disclosure footer ── */}
      <footer
        className="aw-footer-disclosure text-xs text-gray-400 border-t border-gray-100 pt-4 leading-relaxed"
        aria-label="AI 작성 공개"
      >
        이 글은 AI 도구를 활용해 보건복지부·건강보험심사평가원 등 공개된 의료·정책
        자료를 정리·요약한 결과입니다. 사실 확인은 출처 링크의 원문을 우선합니다.
        최종 발행: 약국오늘 큐레이션 데스크 (2026-05-16)
      </footer>

      {/* ── JSON-LD ── */}
      <JsonLd id="jsonld-article" data={articleSchema} />
      <JsonLd id="jsonld-faq" data={faqSchema} />
      <JsonLd id="jsonld-howto" data={howToSchema} />
      <JsonLd id="jsonld-breadcrumb" data={breadcrumbSchema} />
    </article>
  );
}

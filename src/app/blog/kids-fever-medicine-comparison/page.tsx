import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import StaticTOC from "@/components/blog/StaticTOC";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

// ─── Meta ────────────────────────────────────────────────────────────────────
const metaTitle =
  "어린이 해열제 올바르게 고르는 법: 아세트아미노펜 vs 이부프로펜 | 약국오늘";
const metaDescription =
  "아세트아미노펜과 이부프로펜의 적용 나이·체중별 용량·복용 간격·금기 사항을 식약처 기준으로 비교 정리했습니다. 아이 나이에 맞는 해열제 선택 기준과 올바른 복용법을 확인하세요.";
const slug = "/blog/kids-fever-medicine-comparison";

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
        url: `/api/og?title=${encodeURIComponent("어린이 해열제 올바르게 고르는 법: 아세트아미노펜 vs 이부프로펜")}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────
const comparisonRows = [
  {
    label: "적용 연령",
    acetaminophen: "생후 3개월 이상",
    ibuprofen: "만 6개월 이상",
  },
  {
    label: "1회 용량",
    acetaminophen: "10~15 mg/kg",
    ibuprofen: "5~10 mg/kg",
  },
  {
    label: "복용 간격",
    acetaminophen: "4~6시간",
    ibuprofen: "6~8시간",
  },
  {
    label: "1일 최대 횟수",
    acetaminophen: "4~5회",
    ibuprofen: "3~4회",
  },
  {
    label: "소염(항염) 효과",
    acetaminophen: "없음",
    ibuprofen: "있음",
  },
  {
    label: "주요 금기·주의",
    acetaminophen: "간 질환, 다른 아세트아미노펜 성분 제품 중복 주의",
    ibuprofen:
      "탈수 상태, 신장 질환, 수두 감염 중, 천식(아스피린 과민), 위장 장애",
  },
];

const faqs = [
  {
    q: "아세트아미노펜과 이부프로펜을 교대로 복용해도 되나요?",
    a: "식약처는 두 성분의 임의 교대 복용은 안전성이 확립되지 않았다고 안내합니다. 교대 복용 여부는 반드시 소아과 의사 또는 약사와 상담한 후 결정해야 합니다.",
  },
  {
    q: "생후 3개월 미만 영아는 어떤 해열제를 사용해야 하나요?",
    a: "생후 3개월 미만은 아세트아미노펜도 사용이 제한됩니다. 이 연령대의 발열은 지체 없이 소아과를 방문하는 것이 원칙입니다.",
  },
  {
    q: "해열제를 복용했는데 1~2시간이 지나도 열이 안 내리면 어떻게 해야 하나요?",
    a: "두 번째 해열제를 임의로 추가하지 말고, 48시간 이상 지속되거나 구토·발진이 동반되면 소아과를 방문하세요. 임의로 다른 성분의 해열제를 추가 복용하는 것은 피해야 합니다.",
  },
  {
    q: "이부프로펜이 절대 금기인 상황은 언제인가요?",
    a: "만 6개월 미만, 탈수 상태, 신장 질환, 수두 감염 중, 천식(아스피린 과민증), 위장 장애 소아에게는 사용하지 않아야 합니다. 보건복지부 안내에 따르면 수두 감염 중 이부프로펜 사용은 세균성 합병증 위험을 높일 수 있습니다.",
  },
  {
    q: "같은 성분의 해열제를 중복으로 줘도 되나요?",
    a: "절대 안 됩니다. 타이레놀·챔프·콜대원 등 브랜드명이 달라도 같은 아세트아미노펜 성분이면 중복 투여로 간에 부담을 줄 수 있습니다. 복용 전 성분명을 반드시 확인하세요.",
  },
];

// ─── JSON-LD ─────────────────────────────────────────────────────────────────
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function KidsFeverMedicineComparisonPage() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-10 sm:py-14">
      {/* ── 헤더 ── */}
      <header className="space-y-4">
        <p className="text-sm font-semibold text-brand-700">
          블로그 · 어린이 건강 · 해열제 가이드
        </p>
        <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
          어린이 해열제 올바르게 고르는 법: 아세트아미노펜 vs 이부프로펜
        </h1>
        <p className="text-base leading-relaxed text-gray-600">
          {metaDescription}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 약국 찾기
          </Link>
          <Link
            href="/blog/kids-fever-meds-check"
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-200"
          >
            해열제 구비 체크리스트
          </Link>
        </div>
      </header>

      <StaticTOC
        items={[
          { id: "h2-definition", text: "성분 정의" },
          { id: "h2-comparison", text: "두 성분 한눈에 — 비교표" },
          { id: "h2-age", text: "나이별·상황별 선택 기준" },
          { id: "h2-dosage", text: "올바른 복용법" },
          { id: "h2-caution", text: "주의사항 및 금기" },
          { id: "h2-faq", text: "자주 묻는 질문" },
          { id: "h2-future", text: "앞으로의 변화와 주목할 신호" },
        ]}
      />

      <AdSlotTop />

      {/* ── Hook H1 (question) ── */}
      <section
        className="rounded-2xl border border-blue-100 bg-blue-50 p-6 space-y-3"
        aria-label="도입부"
      >
        <p className="text-lg font-semibold text-blue-900 leading-relaxed">
          아이에게 열이 났을 때 아세트아미노펜과 이부프로펜 중 어느 것을 줘야
          할까?
        </p>
        <p className="text-base text-blue-800 leading-relaxed">
          두 성분 모두 어린이 해열제의 주성분이지만, 적용 가능한 나이와 복용
          간격, 금기 사항이 다르다. 식약처 허가 기준을 토대로 아이의 월령과
          상태에 맞는 선택 기준을 정리했다.
        </p>
      </section>

      {/* ── 정의 박스 ── */}
      <section
        className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 space-y-5"
        aria-label="성분 정의"
      >
        <h2 id="h2-definition" className="text-xl font-bold text-emerald-900">성분 정의</h2>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-emerald-800">
              아세트아미노펜 (Acetaminophen)
            </p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-700">
              중추신경계 시상하부에 작용해 체온을 낮추고 통증을 완화하는
              해열·진통 성분. 식약처 허가 기준{" "}
              <strong>생후 3개월 이상</strong> 영아부터 사용 가능하다.
              프로스타글란딘 합성 억제에 의한 항염 효과는 미미하다.
            </p>
          </div>
          <div>
            <p className="font-semibold text-emerald-800">
              이부프로펜 (Ibuprofen)
            </p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-700">
              비스테로이드성 항염증제(NSAID)로 COX 효소를 억제해 해열·진통·소염
              효과를 동시에 발휘하는 성분. 식약처 기준{" "}
              <strong>만 6개월 이상</strong> 소아부터 사용 가능하며, 신장 기능이
              미성숙한 영아, 탈수 상태, 위장 장애 시 주의가 필요하다.
            </p>
          </div>
          <p className="text-xs text-emerald-600">
            출처:{" "}
            <a
              href="https://www.mfds.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              식품의약품안전처 (mfds.go.kr)
            </a>
          </p>
        </div>
      </section>

      {/* ── H2-1: 두 성분 한눈에 비교표 ── */}
      <section className="space-y-4">
        <h2 id="h2-comparison" className="text-2xl font-bold text-gray-900">
          1. 두 성분 한눈에 — 비교표
        </h2>
        <p className="text-base leading-relaxed text-gray-700">
          아래 표는 식약처 허가 기준 및 의약품 설명서를 근거로 작성했다. 실제
          제품마다 세부 용량이 다를 수 있으므로 복용 전 제품 라벨과 약사
          안내를 확인해야 한다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                  항목
                </th>
                <th className="px-4 py-3 text-left font-semibold text-brand-700">
                  아세트아미노펜
                </th>
                <th className="px-4 py-3 text-left font-semibold text-orange-700">
                  이부프로펜
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td className="px-4 py-3 font-medium text-gray-600">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {row.acetaminophen}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{row.ibuprofen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500">
          출처:{" "}
          <a
            href="https://www.mfds.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            식품의약품안전처 의약품안전나라
          </a>
        </p>
      </section>

      {/* ── H2-2: 나이별 선택 기준 (L5 case — 구체 사례) ── */}
      <section className="space-y-5">
        <h2 id="h2-age" className="text-2xl font-bold text-gray-900">
          2. 나이별·상황별 선택 기준
        </h2>
        <p className="text-base leading-relaxed text-gray-700">
          아이의 월령과 현재 상태에 따라 선택할 수 있는 성분이 달라진다. 아래
          사례별 기준을 참고하되, 최종 판단은 소아과 의사 또는 약사와 상담해
          결정하는 것이 안전하다.
        </p>

        {/* 사례 박스 1 — 생후 6개월 미만 */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 space-y-2">
          <p className="font-semibold text-amber-900">
            사례 A — 생후 3~5개월 영아 (체중 약 6~7 kg)
          </p>
          <p className="text-sm leading-relaxed text-amber-800">
            이 연령대는 <strong>아세트아미노펜만 사용 가능</strong>하다.
            이부프로펜은 만 6개월 미만에게 허가되지 않는다. 체중 6 kg 기준 1회
            용량은 60~90 mg 수준이며, 제품 동봉 계량 기구로 정확히 계측해야
            한다. 열이 38.5°C를 초과하더라도 복용 전 소아과 방문 여부를 약사와
            상의하는 것이 권장된다.
          </p>
        </div>

        {/* 사례 박스 2 — 만 6개월~3세 */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5 space-y-2">
          <p className="font-semibold text-sky-900">
            사례 B — 만 8개월 영아 (체중 약 9~10 kg)
          </p>
          <p className="text-sm leading-relaxed text-sky-800">
            두 성분 모두 사용 가능해진다. 체중 10 kg 기준{" "}
            <strong>아세트아미노펜</strong> 1회 용량은 100~150 mg (4~6시간
            간격), <strong>이부프로펜</strong>은 50~100 mg (6~8시간 간격)이다.
            탈수 증상(입술 건조, 소변 감소)이 있을 경우 이부프로펜 사용을 피하고
            아세트아미노펜을 선택한 뒤 즉시 수분을 보충해야 한다.
          </p>
        </div>

        {/* 사례 박스 3 — 만 4세 이상 */}
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 space-y-2">
          <p className="font-semibold text-violet-900">
            사례 C — 만 4세 유아 (체중 약 18~20 kg)
          </p>
          <p className="text-sm leading-relaxed text-violet-800">
            체중 20 kg 기준 아세트아미노펜 1회 용량은 200~300 mg, 이부프로펜은
            100~200 mg이다. 어린이집이나 유치원에서 흔한 편도염·중이염처럼
            염증 반응이 동반된 경우 소아과에서 이부프로펜 계열이 선택되는 경우가
            있다. 단, 수두 감염 중이라면 이부프로펜을 사용하지 않아야 한다는
            보건복지부 안내를 따른다.
          </p>
        </div>
      </section>

      {/* ── H2-3: 올바른 복용법 ── */}
      <section className="space-y-4">
        <h2 id="h2-dosage" className="text-2xl font-bold text-gray-900">
          3. 올바른 복용법 — 식약처 안내 기준
        </h2>
        <p className="text-base leading-relaxed text-gray-700">
          식약처 안내에 따르면 어린이 해열제는 다음 순서로 복용할 것을 권고한다.
        </p>
        <ol className="space-y-3 pl-5">
          <li className="text-base leading-relaxed text-gray-700">
            <span className="font-semibold text-brand-700">1단계.</span> 아이의
            현재 체중을 확인한다. 용량은 나이가 아닌{" "}
            <strong>체중(kg) 기준</strong>으로 계산한다.
          </li>
          <li className="text-base leading-relaxed text-gray-700">
            <span className="font-semibold text-brand-700">2단계.</span> 해열제
            라벨의 체중별 용량표를 확인하거나 약사에게 문의해 1회 투여량을
            결정한다.
          </li>
          <li className="text-base leading-relaxed text-gray-700">
            <span className="font-semibold text-brand-700">3단계.</span> 반드시
            동봉된 계량 스푼 또는 계량 컵으로 정량을 계측한다. 가정용 스푼은
            용량 오차가 크므로 사용하지 않는다.
          </li>
          <li className="text-base leading-relaxed text-gray-700">
            <span className="font-semibold text-brand-700">4단계.</span> 성분별
            복용 간격을 지킨다. 아세트아미노펜은{" "}
            <strong>4~6시간 이상</strong>, 이부프로펜은{" "}
            <strong>6~8시간 이상</strong> 간격을 유지해야 한다.
          </li>
          <li className="text-base leading-relaxed text-gray-700">
            <span className="font-semibold text-brand-700">5단계.</span> 48시간
            이상 열이 지속되거나 구토·발진·경련이 동반되면 즉시 소아과를
            방문한다. 임의로 용량을 늘리거나 다른 해열제를 추가하지 않는다.
          </li>
        </ol>
        <p className="text-xs text-gray-500">
          참고:{" "}
          <a
            href="https://www.mfds.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            식품의약품안전처 의약품 안전 사용 안내
          </a>
        </p>
      </section>

      {/* ── H2-4: 주의사항 및 금기 ── */}
      <section className="space-y-4">
        <h2 id="h2-caution" className="text-2xl font-bold text-gray-900">
          4. 주의사항 및 금기 — 이런 경우 사용하지 않아야 합니다
        </h2>

        <div className="space-y-3">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 space-y-2">
            <p className="font-semibold text-red-800">
              아세트아미노펜 주의 사항
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              <li>
                타이레놀·챔프·어린이타이레놀 등 상품명만 다를 뿐 동일한
                아세트아미노펜 성분인 제품을 중복 투여하면 간 독성이 발생할 수
                있다.
              </li>
              <li>
                간 질환 소아에게 사용 시 담당 의료진과 상담이 필요하다.
              </li>
              <li>
                1일 최대 투여량을 초과하지 않도록 주의한다. 식약처 의약품
                부작용 보고에 따르면 체중 기준 오산정이 과다복용의 주요 원인이다.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 space-y-2">
            <p className="font-semibold text-orange-800">
              이부프로펜 주의 사항 및 절대 금기
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
              <li>
                <strong>만 6개월 미만</strong> 영아 — 허가 외 사용이므로 절대
                금기.
              </li>
              <li>
                <strong>탈수 상태</strong> — 신장 혈류량 감소로 급성 신손상
                위험이 높아진다.
              </li>
              <li>
                <strong>수두 감염 중</strong> — 보건복지부 안내에 따르면 세균성
                피부 합병증 위험이 증가한다.
              </li>
              <li>
                <strong>천식(아스피린 과민증)</strong> 소아 — 기관지 수축을
                유발할 수 있다.
              </li>
              <li>
                신장 질환·위장 장애 소아는 소아과 의사와 상담 후 결정한다.
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            성분명 확인이 중요한 이유
          </p>
          <p className="text-sm leading-relaxed text-gray-600">
            건강보험심사평가원 통계에 따르면 소아(0~9세) 해열제 관련 처방은
            연간 약 300만 건 수준이며, 아세트아미노펜 계열이 60% 이상을
            차지한다. 시중에 유통되는 어린이 해열제의 상당수가 아세트아미노펜
            성분이므로, 브랜드명이 다른 제품을 동시에 구비했다면 성분명을 반드시
            확인해 중복 투여를 예방해야 한다.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            출처:{" "}
            <a
              href="https://www.hira.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              건강보험심사평가원 (hira.or.kr)
            </a>
          </p>
        </div>
      </section>

      {/* ── H2-5: 자주 묻는 질문 (FAQ) ── */}
      <section className="space-y-4">
        <h2 id="h2-faq" className="text-2xl font-bold text-gray-900">
          5. 자주 묻는 질문
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer items-start justify-between px-5 py-4 font-semibold text-gray-800 list-none">
                <span>{faq.q}</span>
                <span className="ml-4 mt-0.5 shrink-0 text-brand-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Outro O4 (forecast) ── */}
      <section className="rounded-2xl border border-brand-100 bg-brand-50 p-6 space-y-3">
        <h2 id="h2-future" className="text-xl font-bold text-brand-900">
          앞으로의 변화와 주목할 신호
        </h2>
        <p className="text-base leading-relaxed text-brand-800">
          2024~2025년 식약처는 소아 의약품 안전 사용 정보를 지속적으로 업데이트하고
          있다. 향후 주목해야 할 변수는 두 가지다. 첫째, 체중 기반 전자 용량
          계산기 의무화 여부 — 일부 선진국에서 도입된 이 시스템이 국내에
          적용되면 용량 오산정이 크게 줄어들 수 있다. 둘째, 이부프로펜 복합제
          신규 허가 동향 — 신규 적응증 확대 또는 연령 기준 변경이 논의될 경우
          이 글의 내용도 갱신될 예정이다. 식약처 의약품안전나라 공지 페이지를
          정기적으로 확인하는 것이 권장된다.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/wiki"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            의약품 위키 검색
          </Link>
          <Link
            href="/blog/kids-fever-meds-check"
            className="inline-flex items-center rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            해열제 구비 체크리스트
          </Link>
        </div>
      </section>

      <AdSlotBottom />

      {/* ── YMYL Disclaimer ── */}
      <aside
        className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 space-y-2"
        aria-label="의료 정보 안내"
      >
        <p className="text-sm font-semibold text-yellow-800">
          복용 전 반드시 소아과 또는 약사 상담
        </p>
        <p className="text-sm leading-relaxed text-yellow-700">
          본 글은 식약처·보건복지부·건강보험심사평가원 등 공공 자료를 정리·요약한
          정보 안내 목적이며, 어떤 내용도 진단·처방·치료를 대체하지 않습니다.
          아이의 상태와 복용 이력에 따라 적합한 성분과 용량이 다를 수 있으므로,
          해열제 선택과 복용 전 반드시 소아과 의사 또는 약사와 상담하시기
          바랍니다.
        </p>
      </aside>

      {/* ── P4 AI Disclosure Footer ── */}
      <footer
        className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
        aria-label="AI 도구 활용 공개"
      >
        <p className="text-xs leading-relaxed text-gray-500">
          이 글은 AI 도구를 활용해 식약처·보건복지부·건강보험심사평가원 등 공개된
          의료·정책 자료를 정리·요약한 결과입니다. 사실 확인은 각 출처 링크의
          원문을 우선합니다. 최종 편집일: 2026년 5월 16일.
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
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "어린이 해열제 구비 체크포인트 | 약국오늘";
const metaDescription =
  "연령·체중별 용량, 계량 스푼, 보관법, 부작용 주의점까지 어린이 해열제 구비 전 필수 체크사항을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/kids-fever-meds-check" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/kids-fever-meds-check",
    type: "article",
    images: ["/og-image.svg"],
  },
};

const checklist = [
  "연령·체중별 용량표 확인",
  "계량 스푼/컵 동봉 여부 확인",
  "성분(아세트아미노펜/이부프로펜) 중복 주의",
  "복용 간격(보통 4~6시간) 반드시 확인",
  "부작용(구토·두드러기 등) 시 즉시 중단",
  "실온 보관, 유효기간 점검",
];

const faqs = [
  {
    q: "성분은 무엇을 확인해야 하나요?",
    a: "어린이 해열제는 보통 아세트아미노펜 또는 이부프로펜이 주성분입니다. 같은 성분의 다른 약을 중복 복용하지 않도록 약사와 상의하세요.",
  },
  {
    q: "계량 스푼이 없으면 어떻게 하나요?",
    a: "동봉된 계량 스푼/컵을 사용하는 것이 가장 안전합니다. 없을 경우 약국에서 별도 계량 기구를 구비하세요.",
  },
  {
    q: "열이 계속 나면 어떻게 하나요?",
    a: "열이 48시간 이상 지속되거나, 해열 후 바로 재발·구토·발진이 동반되면 의료기관을 방문하고 복용을 중단하세요.",
  },
  {
    q: "약국에 재고가 없을 경우 어떻게 해야 하나요?",
    a: "방문 전 약국에 전화로 소아용 해열제 재고를 미리 확인하면 헛걸음을 크게 줄일 수 있습니다. 약국오늘에서 현재 영업 중인 근처 약국 목록을 검색한 뒤, 두세 곳에 차례로 전화해 재고 여부를 물어보는 방법이 가장 빠릅니다. 공휴일이나 야간에는 당번 약국 리스트를 먼저 확인하고 방문하세요.",
  },
  {
    q: "아세트아미노펜과 이부프로펜을 교대로 사용해도 되나요?",
    a: "두 성분은 작용 기전이 달라 교대 사용이 가능하지만, 반드시 약사나 의사의 안내를 받아야 합니다. 임의로 교대 투여하면 용량 계산이 복잡해져 과용 위험이 있습니다. 특히 6개월 미만 영아에게는 이부프로펜 사용이 권장되지 않으므로 반드시 연령을 확인하세요.",
  },
  {
    q: "해열제를 미리 사두는 것이 좋은가요?",
    a: "갑자기 아이가 열이 날 때를 대비해 체중에 맞는 용량의 해열제를 한두 병 미리 준비해 두는 것이 좋습니다. 단, 유효기간을 분기마다 점검하고 개봉 후 제조사 권장 기간을 넘기지 않도록 주의하세요. 한 가지 성분만 과도하게 비축하기보다 두 성분을 각각 소량 구비해 두면 상황에 따라 유연하게 대응할 수 있습니다.",
  },
];

export default function BlogKidsFeverMedsCheck() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/kids-fever-meds-check",
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
      { "@type": "ListItem", position: 3, name: "어린이 해열제 구비 체크포인트", item: "https://todaypharm.kr/blog/kids-fever-meds-check" },
    ],
  };
  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">블로그 · 어린이 해열제</p>
        <h1 className="text-3xl font-bold leading-tight">어린이 해열제 구비 체크포인트</h1>
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
        <h2 className="text-xl font-bold text-gray-900">약국 방문 전 꼭 알아야 하는 이유</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          아이에게 갑자기 열이 오를 때 서랍을 열어보니 해열제 재고가 없거나 유효기간이 지난 것을 발견하는 일은 생각보다 흔합니다. 야간이나 공휴일에는 문을 여는 약국이 제한적이어서, 준비 없이 나섰다가 여러 곳을 헛걸음하는 경우도 많습니다. 방문 전 전화 한 통으로 재고를 확인하는 습관과 올바른 제품 선택 기준을 알아두면 위급한 순간에 시간과 체력을 크게 아낄 수 있습니다. 아이 체중에 맞는 용량 계산법과 성분 구분 기초 지식만 갖춰도 약국에서의 상담이 훨씬 수월해집니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            야간·주말에도 재고 있는 약국을 빠르게 찾는 방법을 확인할 수 있습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            아세트아미노펜과 이부프로펜의 차이를 알고 상황에 맞게 선택할 수 있습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            체중별 용량 계산 실수를 줄이고 안전하게 복용시킬 수 있습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            재고 확인 전화 한 통으로 헛걸음 없이 바로 구매할 수 있습니다.
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
        <h2 className="text-xl font-semibold">확인해야 할 포인트</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">용량과 간격</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              체중·연령에 맞는 용량표를 확인하고, 보통 4~6시간 간격을 지키세요. 과량 복용을 피하기 위해 중복 성분을 확인합니다. 예를 들어 아세트아미노펜 계열 해열제를 복용 중이라면 같은 성분이 포함된 종합감기약을 함께 먹이지 않도록 주의해야 합니다. 용량표는 kg 단위로 표기되므로 방문 전 아이의 최근 체중을 확인해 두면 약사와 상담 시 정확한 용량을 안내받을 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">계량 기구와 보관</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              동봉된 계량 스푼/컵을 사용하고, 실온 보관·유효기간을 반드시 확인하세요. 변질 우려가 있으면 즉시 폐기하세요. 일반 숟가락은 규격이 제각각이어서 계량 도구 없이 투여하면 과소 또는 과용 위험이 생깁니다. 개봉한 시럽 형태 해열제는 냉장 보관이 필요한 제품도 있으니 포장 뒷면의 보관 조건을 반드시 확인하세요. 보통 개봉 후 6개월이 경과한 제품은 성분이 변질될 수 있으므로 새 제품으로 교체하는 것이 안전합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">부작용 대응</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              구토, 두드러기, 호흡 곤란 등 이상 반응이 있으면 즉시 복용을 중단하고 의료기관을 방문하세요. 이부프로펜 계열은 공복 복용 시 위장 자극이 생길 수 있어 소량의 음식이나 물과 함께 먹이는 것이 좋습니다. 아세트아미노펜은 간에 부담을 줄 수 있으므로 권장 용량을 절대 초과하지 않는 것이 중요하며, 간 기능이 좋지 않은 아이에게는 복용 전 소아과 상담이 필요합니다. 처음 복용한 뒤 30분~1시간 안에 열이 내리지 않는다고 해서 추가 복용하면 위험할 수 있으므로 반드시 다음 복용 시간을 지키세요.
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
              <h3 className="text-base font-bold text-gray-900">밤 11시, 아이가 갑자기 39도 열</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              늦은 밤 갑자기 아이 이마가 뜨거워 체온을 재니 39도가 넘었는데 가정에 해열제가 없어 급하게 근처 약국을 찾아야 하는 상황입니다. 이럴 때는 무작정 나서기보다 약국오늘에서 현재 영업 중인 야간 당번 약국을 먼저 검색하고, 전화로 소아용 해열제 재고를 확인한 뒤 방문하면 한 번에 해결할 수 있습니다. 전화할 때는 아이 나이와 체중을 미리 알려주면 약사가 적합한 제품과 용량을 바로 안내해 줄 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">집에 있는 해열제, 유효기간이 지났을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              아이가 열이 나서 서랍에서 해열제를 꺼내 보니 유효기간이 반년 전에 이미 지나 있었습니다. 변질된 약을 먹이면 효과가 없을 뿐 아니라 부작용 위험도 있어 즉시 폐기해야 합니다. 이런 상황을 예방하려면 분기마다 한 번씩 가정 상비약 유효기간을 점검하고, 남은 기간이 6개월 이내인 제품은 여유 있을 때 미리 교체해 두는 습관이 필요합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">해열제 복용 후에도 열이 내리지 않을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              아세트아미노펜 계열 해열제를 올바른 용량으로 먹였는데 1시간이 지나도 열이 내리지 않는 경우, 약사 상담 후 이부프로펜 계열로 전환하거나 교대 투여를 검토할 수 있습니다. 단, 체온이 40도를 넘거나 경기·의식 저하가 동반된다면 약국 방문보다 응급실 방문이나 119 상담을 먼저 해야 합니다. 약국에서 구매 전 현재 상태를 약사에게 상세히 설명하면 더 정확한 조언을 받을 수 있습니다.
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
              해열제를 준비하고, 필요 시 내 주변 영업 약국을 바로 확인하세요.
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
          <Link href="/blog/kids-fever-medicine-comparison" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">소아 발열 약 비교 가이드</p>
            <p className="text-xs text-gray-500 mt-1">아이 해열제 종류 비교</p>
          </Link>
          <Link href="/blog/pharmacy-visit-checklist-3" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 확인 3가지</p>
            <p className="text-xs text-gray-500 mt-1">방문 전 체크리스트</p>
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

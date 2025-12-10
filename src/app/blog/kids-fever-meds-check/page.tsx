import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "어린이 해열제 구비 체크포인트 | 오늘약국";
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
];

export default function BlogKidsFeverMedsCheck() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/kids-fever-meds-check",
  });

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
              체중·연령에 맞는 용량표를 확인하고, 보통 4~6시간 간격을 지키세요. 과량 복용을 피하기 위해 중복 성분을
              확인합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">계량 기구와 보관</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              동봉된 계량 스푼/컵을 사용하고, 실온 보관·유효기간을 확인하세요. 변질 우려가 있으면 폐기하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">부작용 대응</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              구토, 두드러기, 호흡 곤란 등 이상 반응이 있으면 즉시 복용을 중단하고 의료기관을 방문하세요.
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </div>
  );
}


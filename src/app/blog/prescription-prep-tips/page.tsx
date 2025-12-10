import Link from "next/link";
import type { Metadata } from "next";

const metaTitle = "처방전 준비와 약국 방문 전 점검 7가지 | 오늘약국";
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
    a: "약국마다 다를 수 있어 방문 전 전화로 확인이 가장 안전합니다.",
  },
  {
    q: "공휴일에 보험 청구가 가능한가요?",
    a: "대부분 가능하지만, 약국별 처리 방식이 다를 수 있으니 신분증/보험증을 지참하고 문의하세요.",
  },
  {
    q: "대기 시간을 줄이려면?",
    a: "전화로 조제 가능 여부와 예상 대기 시간을 물어본 뒤 방문하고, 길찾기로 소요 시간을 확인하세요.",
  },
];

export default function BlogPrescriptionPrepTips() {
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
              공휴일·야간에도 보험 청구를 위해 신분증과 보험증(또는 앱)을 지참하세요.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">전화 후 길찾기</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              조제 가능 여부와 대기 시간을 전화로 확인한 뒤, 길찾기로 도착 시각을 검증하면 시간을 아낄 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">대체 약국 확보</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              혼잡하거나 재고가 없을 경우를 대비해 반경을 넓혀 대체 약국을 1~2곳 확보해 두세요.
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
    </div>
  );
}


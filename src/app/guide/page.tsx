import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "약국 이용 가이드 | 오늘약국",
  description: "야간·주말·공휴일에 문 연 약국을 빠르게 찾는 방법과 이용 팁을 모았습니다.",
  alternates: {
    canonical: "/guide",
  },
};

const guides = [
  {
    title: "야간·주말 약국 찾기 완전 가이드",
    description: "위치 권한, 지도/전화, 영업 상태 확인까지 한 번에 정리했습니다.",
    slug: "night-weekend",
    tags: ["야간", "주말", "공휴일"],
  },
];

export default function GuideIndexPage() {
  return (
    <div className="container py-10 sm:py-14 space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">가이드</p>
        <h1 className="text-3xl font-bold leading-tight">약국 이용 가이드 모음</h1>
        <p className="text-base text-[var(--muted)]">
          야간·주말·공휴일에 문 연 약국을 더 빨리, 안전하게 찾기 위한 실전 팁을 정리했습니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guide/${guide.slug}`}
            className="group rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {guide.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold group-hover:text-brand-700">{guide.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{guide.description}</p>
            <div className="mt-4 text-sm font-semibold text-brand-700">바로 읽기 →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}


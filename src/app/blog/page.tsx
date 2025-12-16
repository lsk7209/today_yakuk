import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그 | 오늘약국",
  description: "약국 이용 팁, 야간·주말 대비법, 위치 기반 검색 활용 가이드를 제공합니다.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    title: "공휴일에도 열려 있는 약국을 빨리 찾는 5가지 방법",
    description:
      "위치 권한, 반경 설정, 종료 임박 체크, 전화 확인, 길찾기 실행까지 공휴일 대비 핵심 팁을 정리했습니다.",
    slug: "holiday-open-pharmacy-tips",
    tags: ["공휴일", "야간", "반경검색"],
  },
  {
    title: "심야 약국 찾기 체크리스트: 헛걸음 방지",
    description:
      "심야 시간대 종료 임박 확인, 전화/길찾기 활용, 반경 확장 탐색으로 빠르게 찾는 방법을 소개합니다.",
    slug: "night-pharmacy-checklist",
    tags: ["심야", "체크리스트"],
  },
  {
    title: "처방전 준비와 약국 방문 전 점검 7가지",
    description:
      "공휴일·야간에 처방전 준비, 신분증/보험증 확인, 대기 시간 단축 팁을 정리했습니다.",
    slug: "prescription-prep-tips",
    tags: ["처방전", "공휴일", "준비"],
  },
  {
    title: "심야 약국 헛걸음 막는 거리·반경 활용법",
    description: "반경 2/3/5km 설정과 거리순 정렬로 심야 헛걸음을 최소화하는 실전 팁을 제공합니다.",
    slug: "night-radius-tips",
    tags: ["심야", "반경검색"],
  },
  {
    title: "어린이 해열제 구비 체크포인트",
    description: "연령·체중별 용량, 계량 스푼, 보관법, 부작용 주의점까지 한 번에 정리했습니다.",
    slug: "kids-fever-meds-check",
    tags: ["어린이", "해열제"],
  },
  {
    title: "여름 휴가철 응급 상비약 리스트",
    description: "벌레·햇빛·소화불량·멍/찰과상 대비 휴대용 키트 구성과 약국 활용 팁을 알려드립니다.",
    slug: "summer-first-aid-kit",
    tags: ["여름", "여행", "상비약"],
  },
];

export default function BlogIndexPage() {
  return (
    <div className="container py-10 sm:py-14 space-y-8 bg-white min-h-screen">
      <header className="space-y-3">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">블로그</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">약국 이용 인사이트</h1>
        <p className="text-base text-gray-600 leading-relaxed">
          공휴일·야간에도 빠르게 문 연 약국을 찾기 위한 실전 팁과 체크리스트를 공유합니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{post.title}</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{post.description}</p>
            <div className="mt-4 text-sm font-bold text-brand-700 flex items-center gap-1">
              자세히 보기 <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


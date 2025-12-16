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
  {
    title: "공휴일 대비 약국 이용 체크리스트",
    description: "공휴일 영업 여부 확인, 종료 임박 시간, 대체 약국 찾기 팁을 모았습니다.",
    slug: "holiday-checklist",
    tags: ["공휴일", "체크리스트"],
  },
  {
    title: "전화·길찾기 활용 팁: 헛걸음 방지",
    description: "전화로 영업/재고 확인 후 바로 길찾기 실행하는 실전 흐름을 안내합니다.",
    slug: "call-navigation-tips",
    tags: ["전화", "길찾기", "반경검색"],
  },
  {
    title: "반경 2/3/5/10km 선택 기준과 활용법",
    description: "심야·공휴일 상황별로 반경을 조정하고 거리순 정렬을 쓰는 기준을 설명합니다.",
    slug: "radius-selection",
    tags: ["반경", "거리순"],
  },
  {
    title: "전화 스크립트: 영업·재고 확인 템플릿",
    description: "영업 여부, 조기 마감, 재고 확인을 빠르게 묻는 한국어 스크립트를 제공합니다.",
    slug: "call-scripts",
    tags: ["전화", "스크립트"],
  },
  {
    title: "여름 휴가철 휴대용 응급 키트 구성법",
    description: "벌레·햇빛·소화불량·상처 대비 휴대용 키트 구성과 반경 검색 활용 팁을 안내합니다.",
    slug: "summer-emergency-kit",
    tags: ["여름", "상비약", "여행"],
  },
];

export default function GuideIndexPage() {
  return (
    <div className="container py-10 sm:py-14 space-y-8 bg-white min-h-screen">
      <header className="space-y-3">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">가이드</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">약국 이용 가이드 모음</h1>
        <p className="text-base text-gray-600 leading-relaxed">
          야간·주말·공휴일에 문 연 약국을 더 빨리, 안전하게 찾기 위한 실전 팁을 정리했습니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guide/${guide.slug}`}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {guide.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{guide.title}</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{guide.description}</p>
            <div className="mt-4 text-sm font-bold text-brand-700 flex items-center gap-1">
              바로 읽기 <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


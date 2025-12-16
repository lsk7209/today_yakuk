import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, LocateFixed, Database, BrainCircuit, Eye, Info } from "lucide-react";

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
    <div className="bg-[var(--background)]">
      <div className="container py-10 sm:py-14 space-y-10">
        {/* Hero */}
        <header className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="relative p-6 sm:p-10">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_15%,rgba(5,150,105,0.12),transparent_40%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center">
              <div className="space-y-5">
                <p className="text-xs font-black tracking-[0.18em] text-brand-700">GUIDE</p>
                <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] tracking-tight text-gray-900">
                  약국 이용 가이드 모음
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
                  야간·주말·공휴일에도 문 연 약국을 더 빠르고 안전하게 찾기 위한 실전 팁을 정리했습니다. “전화 확인 →
                  길찾기”까지 한 흐름으로 안내합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/nearby"
                    className="h-12 px-7 rounded-full bg-brand-600 text-white font-black text-base shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <LocateFixed className="h-5 w-5" />
                    내 주변 약국 찾기
                  </Link>
                  <Link
                    href="/"
                    className="h-12 px-7 rounded-full bg-gray-100 text-gray-900 font-black text-base hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    홈으로 돌아가기
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="w-full">
                <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-emerald-50 via-white to-white shadow-2xl p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-brand-700 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-black text-gray-900">이 페이지에서 얻을 수 있는 것</p>
                      <ul className="text-sm text-gray-700 leading-relaxed space-y-1">
                        <li>- 야간·주말·공휴일 상황별 검색 방법</li>
                        <li>- 반경 선택/정렬을 통한 빠른 비교</li>
                        <li>- 전화·길찾기 활용으로 헛걸음 방지</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Data process (compact) */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">정보가 만들어지는 방식</h2>
            <p className="text-gray-600">가이드는 실제 사용 흐름에 맞춰 “데이터 이해 → 확인 → 행동” 순서로 구성합니다.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-brand-400 to-gray-200 -z-0" />
            <ProcessCard
              icon={<Database className="h-10 w-10 text-brand-700" />}
              title="데이터 이해"
              desc={
                <>
                  영업시간/요일 정보를
                  <br />
                  빠르게 읽는 법을
                  <br />
                  먼저 정리합니다.
                </>
              }
            />
            <ProcessCard
              icon={<BrainCircuit className="h-10 w-10 text-brand-700" />}
              title="확인 습관"
              desc={
                <>
                  공휴일/조기 마감 등
                  <br />
                  변동 포인트를
                  <br />
                  체크합니다.
                </>
              }
            />
            <ProcessCard
              icon={<Eye className="h-10 w-10 text-brand-700" />}
              title="바로 행동"
              desc={
                <>
                  전화 확인 후
                  <br />
                  길찾기로 이동하는
                  <br />
                  실전 흐름을 제공합니다.
                </>
              }
            />
          </div>
        </section>

        {/* Guide list */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">가이드 목록</h2>
              <p className="text-gray-600">상황에 맞는 가이드를 선택해 빠르게 따라 하세요.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all"
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {guide.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-brand-700 transition-colors">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{guide.description}</p>
                <div className="mt-4 text-sm font-black text-brand-700 inline-flex items-center gap-2">
                  바로 읽기 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProcessCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center gap-4 group">
      <div className="h-24 w-24 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center shadow-lg group-hover:border-brand-200 group-hover:scale-[1.05] transition-all duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 leading-snug px-4">{desc}</p>
      </div>
    </div>
  );
}


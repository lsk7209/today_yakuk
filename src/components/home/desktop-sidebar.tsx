import Link from "next/link";
import { BookOpen, MapPin, Moon, CalendarDays, ArrowRight, FileText } from "lucide-react";

const guideLinks = [
  {
    href: "/guide/night-weekend",
    icon: Moon,
    title: "야간·주말 약국 찾기",
    desc: "심야·공휴일 영업 약국 확인법",
  },
  {
    href: "/guide/holiday-checklist",
    icon: CalendarDays,
    title: "공휴일 약국 체크리스트",
    desc: "명절·연휴 전 3단계 준비",
  },
  {
    href: "/guide/radius-selection",
    icon: MapPin,
    title: "반경 설정 가이드",
    desc: "상황별 최적 검색 반경 선택",
  },
  {
    href: "/blog",
    icon: BookOpen,
    title: "건강 정보 블로그",
    desc: "약국 이용 팁·건강 상식",
  },
];

const recentPosts = [
  {
    href: "/blog/holiday-pharmacy-open-check",
    title: "공휴일 약국 빠른 확인 방법",
    tag: "공휴일",
  },
  {
    href: "/blog/pharmacy-visit-checklist-3",
    title: "방문 전 확인 3가지",
    tag: "방문 가이드",
  },
  {
    href: "/blog/prescription-holiday-guide",
    title: "연휴 처방전 대처법",
    tag: "처방전",
  },
];

const regionLinks = [
  { name: "서울", href: "/서울/전체" },
  { name: "경기", href: "/경기/전체" },
  { name: "인천", href: "/인천/전체" },
  { name: "부산", href: "/부산/전체" },
  { name: "대구", href: "/대구/전체" },
  { name: "대전", href: "/대전/전체" },
  { name: "광주", href: "/광주/전체" },
  { name: "울산", href: "/울산/전체" },
];

export default function DesktopSidebar() {
  return (
    <aside className="city-home-support mt-12 grid gap-3 lg:grid-cols-4" aria-label="약국 이용 자료와 지역 바로가기">
      {/* Guide links */}
      <div className="city-panel border-2 border-[var(--ink)] bg-[var(--fog)] p-5">
        <h2 className="mb-3 text-xs font-black tracking-[0.15em] text-[var(--ink)]">약국 이용 가이드</h2>
        <div className="space-y-1">
          {guideLinks.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 border-b border-[#b5c5b5] p-3 transition-colors hover:bg-[var(--lime)]"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--ink)] bg-[var(--lime)] text-[var(--ink)]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 group-hover:text-brand-700 leading-tight">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Region quick links */}
      <div className="city-panel border-2 border-[var(--ink)] bg-white p-5">
        <h2 className="mb-3 text-xs font-black tracking-[0.15em] text-[var(--ink)]">지역별 바로가기</h2>
        <div className="grid grid-cols-4 gap-2">
          {regionLinks.map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className="border border-[var(--ink)] bg-[var(--paper)] py-2 text-center text-xs font-bold text-[var(--ink)] transition-colors hover:bg-[var(--lime)]"
            >
              {name}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="city-panel border-2 border-[var(--ink)] bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black tracking-[0.15em] text-[var(--ink)]">최신 블로그</h2>
          <Link href="/blog" className="text-xs font-bold text-gray-400 hover:text-brand-700 flex items-center gap-0.5">
            전체 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentPosts.map(({ href, title, tag }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-2 border-b border-[#b5c5b5] p-2.5 transition-colors hover:bg-[var(--lime)]"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-700">
                <FileText className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 group-hover:text-brand-700 leading-snug line-clamp-2">{title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Blog CTA */}
      <div className="city-panel border-2 border-[var(--ink)] bg-[var(--lime)] p-5">
        <p className="text-xs font-black tracking-[0.15em] text-[var(--ink)]">HEALTH INFO</p>
        <p className="text-sm font-bold text-gray-900 mt-1 leading-snug">
          야간·명절 약국<br />이용 가이드 모음
        </p>
        <p className="text-xs text-gray-500 mt-1.5">
          공공데이터 기반 실용 정보
        </p>
        <Link
          href="/blog"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
        >
          전체 보기 <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}

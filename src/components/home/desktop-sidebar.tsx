import Link from "next/link";
import { BookOpen, MapPin, Moon, CalendarDays, ArrowRight } from "lucide-react";

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
    <aside className="hidden lg:flex flex-col gap-5 w-[300px] shrink-0">
      {/* Guide links */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-black tracking-[0.15em] text-brand-700 mb-3">약국 이용 가이드</h2>
        <div className="space-y-1">
          {guideLinks.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 rounded-xl p-3 hover:bg-brand-50/40 transition-colors"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-100">
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-black tracking-[0.15em] text-brand-700 mb-3">지역별 바로가기</h2>
        <div className="grid grid-cols-4 gap-2">
          {regionLinks.map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className="rounded-xl border border-gray-100 bg-gray-50 py-2 text-center text-xs font-bold text-gray-800 hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-700 transition-all"
            >
              {name}
            </Link>
          ))}
        </div>
      </div>

      {/* Blog CTA */}
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/60 to-white p-5">
        <p className="text-xs font-black tracking-[0.15em] text-brand-700">HEALTH INFO</p>
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

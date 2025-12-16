import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";
import {
  Database,
  BrainCircuit,
  Eye,
  LocateFixed,
  Map,
  PhoneCall,
  ArrowRight,
  BadgeCheck,
  Info,
} from "lucide-react";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "오늘약국 소개: 서비스 목적·데이터 출처·운영 원칙",
  description:
    "오늘약국은 지금 문 연 약국을 빠르게 찾도록 돕는 실시간 약국 검색 서비스입니다. 공공데이터 기반으로 영업시간·전화·위치를 정리하고, 방문 전 확인 팁과 FAQ까지 한 번에 제공합니다.",
  alternates: { canonical: "/about" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "오늘약국 소개: 서비스 목적·데이터 출처·운영 원칙",
    description:
      "지금 문 연 약국을 빠르게 찾도록 돕는 오늘약국의 목적, 데이터 출처, 운영 원칙과 자주 묻는 질문을 정리했습니다.",
    url: `${siteUrl}/about`,
    siteName: "오늘약국",
    locale: "ko_KR",
    type: "article",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[var(--background)]">
      <div className="container py-10 sm:py-14 space-y-10">
        {/* Hero */}
        <header className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="relative p-6 sm:p-10">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_15%,rgba(5,150,105,0.12),transparent_40%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
                  <span className="inline-flex items-center rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-xs font-black">
                    NEW
                  </span>
                  <span className="text-xs font-semibold text-gray-600">
                    약국 상세 화면 가독성·SEO 구조를 계속 개선 중입니다
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black leading-[1.1] tracking-tight text-gray-900">
                  가장 빠르고 정확한
                  <br />
                  <span className="text-brand-700">오늘약국</span>으로 약국을 찾으세요
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
                  오늘약국은 공공 데이터 기반으로 <strong className="font-black text-gray-900">영업시간·주소·전화</strong>를
                  정리하고, “지금 문 연 약국”을 찾기 위한 실전 가이드까지 제공합니다. 모바일에서 큰 글씨·명확한 버튼을
                  우선으로 설계했습니다.
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
                    href="/guide"
                    className="h-12 px-7 rounded-full bg-gray-100 text-gray-900 font-black text-base hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    사용 방법 보기
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-black text-brand-700 flex items-center gap-2 mb-2">
                      <BadgeCheck className="h-4 w-4" />
                      신뢰
                    </p>
                    <p className="font-bold text-gray-900">공공데이터 기반</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-black text-brand-700 flex items-center gap-2 mb-2">
                      <PhoneCall className="h-4 w-4" />
                      안전
                    </p>
                    <p className="font-bold text-gray-900">방문 전 전화 확인 권장</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-black text-brand-700 flex items-center gap-2 mb-2">
                      <Map className="h-4 w-4" />
                      행동
                    </p>
                    <p className="font-bold text-gray-900">길찾기까지 한 번에</p>
                  </div>
                </div>
              </div>

              {/* Visual (no external image) */}
              <div className="w-full">
                <div className="relative aspect-[4/3] rounded-3xl border border-gray-200 bg-gradient-to-br from-emerald-50 via-white to-white shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(5,150,105,0.18),transparent_45%)]" />
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-700">
                        <Info className="h-4 w-4 text-brand-700" />
                        큰 글씨·명확한 UI
                      </div>
                      <div className="inline-flex items-center rounded-full bg-brand-100 text-brand-700 px-3 py-1.5 text-xs font-black">
                        TodayPharm
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <p className="text-xs font-black text-gray-500">영업 상태</p>
                        <p className="mt-2 inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 px-2 py-1 text-xs font-black">
                          영업 중
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <p className="text-xs font-black text-gray-500">바로가기</p>
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                            전화
                          </span>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                            길찾기
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      어르신도 쉽게 사용할 수 있도록 버튼 크기와 대비를 강화합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Data process */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">데이터 처리 과정</h2>
            <p className="text-gray-600">
              공공 데이터 기반 정보 수집 → 품질 점검 → 보기 쉬운 화면 제공 흐름으로 운영합니다.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-brand-400 to-gray-200 -z-0" />

            <ProcessCard
              icon={<Database className="h-10 w-10 text-brand-700" />}
              title="실시간 데이터 수집"
              desc={
                <>
                  공공데이터포털 기반으로
                  <br />
                  전국 약국 정보를
                  <br />
                  주기적으로 동기화합니다.
                </>
              }
            />
            <ProcessCard
              icon={<BrainCircuit className="h-10 w-10 text-brand-700" />}
              title="품질 점검"
              desc={
                <>
                  영업시간 형식, 주소/좌표 등
                  <br />
                  핵심 필드를 점검하고
                  <br />
                  사용자에게 이해하기 쉽게 정리합니다.
                </>
              }
            />
            <ProcessCard
              icon={<Eye className="h-10 w-10 text-brand-700" />}
              title="쉬운 화면 제공"
              desc={
                <>
                  큰 글씨·명확한 버튼으로
                  <br />
                  “지금 문 연 곳”을
                  <br />
                  빠르게 찾도록 돕습니다.
                </>
              }
            />
          </div>
        </section>

        {/* User guide */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="space-y-4 max-w-3xl">
            <p className="text-xs font-black tracking-[0.18em] text-brand-700">USER GUIDE</p>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              누구나 쉽게 따라할 수 있는
              <br />
              약국 찾는 방법 (3단계)
            </h2>
            <p className="text-gray-600">
              스마트폰 사용이 낯선 분들도 걱정하지 마세요. 아래 3단계만 따라 하시면 됩니다.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <StepCard
              num={1}
              title="GPS 버튼 누르기"
              body={
                <>
                  <strong className="font-black text-gray-900">위치 설정</strong> 버튼을 누르면 현재 위치를 기반으로 주변 약국을
                  불러옵니다. 권한 요청이 뜨면 “허용”을 선택해 주세요.
                </>
              }
              visual={<StepVisual type="gps" />}
            />
            <StepCard
              num={2}
              title="'영업 중' 배지 확인"
              body={
                <>
                  추천 목록에서 <strong className="font-black text-gray-900">영업 중</strong> 또는{" "}
                  <strong className="font-black text-gray-900">곧 종료</strong> 배지를 확인하세요. 특히 곧 종료인 경우 방문 전
                  전화 확인을 권장합니다.
                </>
              }
              visual={<StepVisual type="badge" />}
              reverse
            />
            <StepCard
              num={3}
              title="'전화'·'길찾기'로 바로 행동"
              body={
                <>
                  상세 페이지에서 <strong className="font-black text-gray-900">전화</strong>로 운영 여부를 확인한 뒤,{" "}
                  <strong className="font-black text-gray-900">길찾기</strong>로 바로 이동하세요. 헛걸음을 크게 줄일 수 있습니다.
                </>
              }
              visual={<StepVisual type="call" />}
            />
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className="h-14 px-10 rounded-full bg-brand-600 text-white font-black text-lg shadow-xl shadow-brand-600/20 hover:scale-[1.03] hover:bg-brand-700 transition-all inline-flex items-center gap-3"
            >
              약국 찾기 시작하기
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] items-start">
            <div className="space-y-3">
              <p className="text-lg font-black text-gray-900">면책 조항 및 데이터 출처 안내</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                오늘약국은 정부 공식 사이트가 아니며, 공공데이터포털(data.go.kr)의 API를 활용해 제작되었습니다. 데이터 업데이트
                지연 또는 운영시간 변경으로 실제 정보와 차이가 있을 수 있으니{" "}
                <strong className="font-black text-gray-900">방문 전 반드시 약국에 전화로 확인</strong>하시기 바랍니다.
              </p>
              <p className="text-sm text-gray-600">
                참고 링크:{" "}
                <a
                  href="https://www.data.go.kr/"
                  className="font-black text-brand-700 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  공공데이터포털
                </a>
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-brand-700 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-black text-gray-900">방문 전 체크리스트</p>
                  <ul className="text-sm text-gray-700 leading-relaxed space-y-1">
                    <li>- “곧 종료” 표시가 있으면 전화 확인 후 이동</li>
                    <li>- 주말/공휴일은 운영시간 변동이 잦아 추가 확인 권장</li>
                    <li>- 길찾기 전 주소/층수/건물명을 한 번 더 확인</li>
                  </ul>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      href="/guide/call-navigation-tips"
                      className="inline-flex items-center rounded-full bg-white border border-gray-200 px-4 py-2 text-xs font-black text-gray-800 hover:border-brand-300 hover:text-brand-700"
                    >
                      전화·길찾기 팁 보기
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center rounded-full bg-white border border-gray-200 px-4 py-2 text-xs font-black text-gray-800 hover:border-brand-300 hover:text-brand-700"
                    >
                      정보 수정 문의하기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">자주 묻는 질문(FAQ)</h2>
          <div className="mt-4 space-y-3">
            <details className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <summary className="cursor-pointer font-black text-gray-900">오늘약국의 영업 상태는 실시간인가요?</summary>
              <p className="mt-2 text-gray-700 leading-relaxed">
                영업 상태는 등록된 영업시간 정보를 기준으로 계산합니다. 실제 현장 운영은 변동될 수 있으니 방문 전 전화 확인을
                권장합니다.
              </p>
            </details>
            <details className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <summary className="cursor-pointer font-black text-gray-900">공휴일에도 검색이 가능한가요?</summary>
              <p className="mt-2 text-gray-700 leading-relaxed">
                네. 공휴일/주말 운영 정보를 함께 표시합니다. 다만 공휴일 운영은 변동이 잦아 전화 확인이 가장 안전합니다.
              </p>
            </details>
            <details className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <summary className="cursor-pointer font-black text-gray-900">정보가 틀렸거나 업데이트가 필요하면 어떻게 하나요?</summary>
              <p className="mt-2 text-gray-700 leading-relaxed">
                문의 페이지로 알려주시면 확인 후 반영합니다.{" "}
                <Link href="/contact" className="font-black text-brand-700 hover:underline">
                  문의하기
                </Link>
              </p>
            </details>
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

function StepCard({
  num,
  title,
  body,
  visual,
  reverse,
}: {
  num: 1 | 2 | 3;
  title: string;
  body: React.ReactNode;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`group flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="w-full md:w-1/2">{visual}</div>
      <div className="flex flex-col justify-center flex-1 gap-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-600 text-white font-black text-lg shadow-md">
            {num}
          </span>
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 text-base sm:text-lg leading-relaxed pl-0 sm:pl-1">{body}</p>
      </div>
    </div>
  );
}

function StepVisual({ type }: { type: "gps" | "badge" | "call" }) {
  if (type === "gps") {
    return (
      <div className="aspect-video rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(5,150,105,0.12),transparent_55%)]" />
        <div className="relative rounded-full bg-gray-900 p-4 shadow-lg">
          <LocateFixed className="h-10 w-10 text-white" />
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-brand-600 text-white text-[11px] font-black px-3 py-1 shadow-lg">
          여기 눌러요
        </div>
      </div>
    );
  }
  if (type === "badge") {
    return (
      <div className="aspect-video rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden relative flex items-center justify-center">
        <div className="relative flex gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 opacity-60 blur-[0.6px]">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
          </div>
          <div className="rounded-2xl border-2 border-brand-300 bg-white p-3 shadow-xl scale-110 relative">
            <div className="absolute -top-3 -right-3 rounded-full bg-brand-600 text-white text-[10px] font-black px-2 py-1">
              영업중
            </div>
            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
              <Map className="h-5 w-5 text-brand-700" />
            </div>
            <div className="mt-2 text-sm font-black text-gray-900">가까운 약국</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-3 opacity-60 blur-[0.6px]">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden relative flex items-center justify-center">
      <div className="w-4/5 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-black text-gray-900 truncate">오늘약국 예시</p>
          <p className="text-sm text-gray-600">02-1234-5678</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center justify-center rounded-full bg-brand-600 text-white p-3">
            <PhoneCall className="h-5 w-5" />
          </span>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 text-xs font-black text-gray-600">전화로 확인 후 이동</div>
    </div>
  );
}


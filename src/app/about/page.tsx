import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";

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
    <div className="container py-12 space-y-10 bg-white min-h-screen">
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">
          오늘약국은 “지금 문 연 약국”을 빠르게 찾기 위한 서비스입니다
        </h1>
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          오늘약국은 야간·주말·공휴일에도 <strong className="font-black text-gray-900">현재 운영 중인 약국</strong>을
          빠르게 찾을 수 있도록 돕는 정보 서비스입니다. 공공데이터 기반으로 영업시간·전화·주소를 정리하고,
          방문 전에 확인하면 좋은 팁과 FAQ를 함께 제공합니다. 모바일 환경에서 “한 번에 확인”할 수 있도록
          가독성과 속도를 최우선으로 설계했습니다.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:border-brand-300 hover:text-brand-700"
          >
            약국 찾기 바로가기
          </Link>
          <Link
            href="/nearby"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:border-brand-300 hover:text-brand-700"
          >
            내 주변 약국 보기
          </Link>
          <Link
            href="/guide"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:border-brand-300 hover:text-brand-700"
          >
            이용 가이드
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md space-y-4">
        <h2 className="text-2xl font-black text-gray-900">무엇을 해결하나요?</h2>
        <p className="text-gray-700 leading-relaxed">
          갑자기 약이 필요하거나, 병원 처방 후 바로 약국을 찾아야 할 때 가장 큰 문제는 “지금 문 연 곳이 어디인지”입니다.
          오늘약국은 아래 정보를 한 화면에서 확인할 수 있도록 정리합니다.
        </p>
        <ul className="list-disc list-inside text-gray-800 space-y-2 leading-relaxed font-medium">
          <li>
            <strong className="font-black text-gray-900">실시간 영업 상태</strong> (영업 중/곧 종료/영업 종료)
          </li>
          <li>
            <strong className="font-black text-gray-900">요일별 영업시간</strong>과 방문 전 확인 포인트
          </li>
          <li>
            <strong className="font-black text-gray-900">전화·길찾기</strong> 버튼으로 즉시 행동 가능
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md space-y-4">
        <h2 className="text-2xl font-black text-gray-900">데이터 출처와 업데이트</h2>
        <p className="text-gray-700 leading-relaxed">
          오늘약국의 기본 약국 정보는 공공 데이터와 공개된 정보를 바탕으로 구성됩니다. 다만 운영시간은 상황에 따라 변동될 수 있으므로,
          방문 전 <strong className="font-black text-gray-900">전화로 운영 여부를 확인</strong>하는 것을 권장합니다.
        </p>
        <ul className="space-y-2 text-gray-800 leading-relaxed">
          <li>
            - <strong className="font-black text-gray-900">영업시간</strong>: 요일별 운영시간을 표로 제공하며, “현재시간(KST)” 기준으로
            이해하기 쉽게 표시합니다.
          </li>
          <li>
            - <strong className="font-black text-gray-900">주소/전화</strong>: 약국 상세페이지에서 복사/전화/길찾기를 제공합니다.
          </li>
          <li>
            - <strong className="font-black text-gray-900">업데이트</strong>: 데이터 동기화 및 콘텐츠 업데이트는 일정 주기로 반영됩니다.
          </li>
        </ul>
        <p className="text-sm text-gray-600">
          참고 링크:{" "}
          <a
            href="https://www.data.go.kr/"
            className="font-bold text-brand-700 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            공공데이터포털
          </a>
        </p>
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md space-y-4">
        <h2 className="text-2xl font-black text-gray-900">이용 팁</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-800 leading-relaxed font-medium">
          <li>
            “영업 중”이라도 <strong className="font-black text-gray-900">곧 종료</strong> 배지가 보이면 방문 전 전화 확인을 권장합니다.
          </li>
          <li>
            주말/공휴일은 운영시간 변동이 잦습니다. “요일별 영업시간”에서 해당 요일을 먼저 확인하세요.
          </li>
          <li>
            급할수록 이동 시간이 중요합니다. “내 주변” 또는 “반경 내 다른 약국”을 함께 비교해 보세요.
          </li>
        </ol>
      </section>

      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md space-y-4">
        <h2 className="text-2xl font-black text-gray-900">자주 묻는 질문(FAQ)</h2>
        <div className="space-y-3">
          <details className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <summary className="cursor-pointer font-black text-gray-900">
              오늘약국의 영업 상태는 실시간인가요?
            </summary>
            <p className="mt-2 text-gray-700 leading-relaxed">
              영업 상태는 등록된 영업시간 정보를 기준으로 계산합니다. 실제 현장 운영은 변동될 수 있으니 방문 전 전화 확인을 권장합니다.
            </p>
          </details>
          <details className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <summary className="cursor-pointer font-black text-gray-900">
              공휴일에도 검색이 가능한가요?
            </summary>
            <p className="mt-2 text-gray-700 leading-relaxed">
              네. 공휴일/주말 운영 정보를 함께 표시합니다. 다만 공휴일 운영은 변동이 잦아 전화 확인이 가장 안전합니다.
            </p>
          </details>
          <details className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <summary className="cursor-pointer font-black text-gray-900">
              정보가 틀렸거나 업데이트가 필요하면 어떻게 하나요?
            </summary>
            <p className="mt-2 text-gray-700 leading-relaxed">
              문의 페이지를 통해 알려주시면 확인 후 반영합니다.{" "}
              <Link href="/contact" className="font-bold text-brand-700 hover:underline">
                문의하기
              </Link>
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}


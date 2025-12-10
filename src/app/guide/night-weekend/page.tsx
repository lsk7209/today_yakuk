import Link from "next/link";
import type { Metadata } from "next";

const metaTitle = "야간·주말 약국 찾기 완전 가이드 | 오늘약국";
const metaDescription =
  "야간·주말·공휴일에 문 연 약국을 빠르게 찾는 방법과 반경 검색, 전화·길찾기 활용 팁을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: {
    canonical: "/guide/night-weekend",
  },
};

const sections = [
  {
    title: "바로 실행: 가장 빠른 검색 흐름",
    bullets: [
      "1) 내 주변 찾기: 위치 권한 허용 후 `/nearby`에서 반경·정렬 설정",
      "2) 지역별 찾기: 권한 거부 시 `/서울/전체` 등 지역 리스트 사용",
      "3) 종료 임박 확인: 상세 페이지의 종료 예정 시간을 우선 체크",
    ],
  },
  {
    title: "야간·주말·공휴일 체크 포인트",
    bullets: [
      "영업 상태 필터: 리스트 상단의 영업중/심야/공휴일 탭 활용",
      "거리 vs. 평가: 가까운 순 정렬 후, 종료 예정 시간이 촘촘한 곳을 우선 방문",
      "전화 먼저: 방문 전 전화 연결로 실제 영업 여부와 재고를 확인",
    ],
  },
  {
    title: "반경 검색 활용법",
    bullets: [
      "기본 2km → 혼잡 시 3~5km 확장",
      "지도 길찾기 버튼으로 바로 네비게이션 실행",
      "TOP 3 하이라이트로 가장 가까운 곳부터 확인",
    ],
  },
];

const faqs = [
  {
    q: "공휴일에도 약국이 열려 있나요?",
    a: "공공데이터 기준 실시간 영업 정보를 보여줍니다. 공휴일 필터를 켜고 가까운 순으로 확인하세요.",
  },
  {
    q: "거리 정보는 어떻게 계산되나요?",
    a: "브라우저 위치 기반 직선거리를 표기합니다. 길찾기 시 실제 소요 시간은 도로 상황에 따라 달라질 수 있습니다.",
  },
  {
    q: "위치 권한을 거부하면 이용이 불가능한가요?",
    a: "아니요. 권한을 거부해도 지역 리스트(`/서울/전체` 등)로 바로 이동해 검색할 수 있습니다.",
  },
];

export default function GuideNightWeekendPage() {
  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">가이드 · 야간/주말</p>
        <h1 className="text-3xl font-bold leading-tight">야간·주말 약국 찾기 완전 가이드</h1>
        <p className="text-base text-[var(--muted)]">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/서울/전체"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            서울 지역 리스트
          </Link>
        </div>
      </header>

      <section className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-3"
          >
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--muted)]">
              {section.bullets.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">실전 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          <li>위치 권한 허용 → 반경 2km로 빠르게 탐색</li>
          <li>영업중/심야/공휴일 필터로 가용 약국만 남기기</li>
          <li>상세 페이지에서 종료 임박 여부 확인 후 이동</li>
          <li>전화 연결로 실제 영업·재고 확인, 바로 길찾기 실행</li>
        </ul>
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
            <h2 className="text-xl font-semibold">바로 이용해 보세요</h2>
            <p className="text-sm text-[var(--muted)]">
              내 주변 빠른 검색 또는 지역 리스트에서 바로 선택할 수 있습니다.
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
              href="/경기/전체"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
            >
              경기 리스트
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


import Link from "next/link";
import type { Metadata } from "next";

const metaTitle = "전화·길찾기 활용 팁: 헛걸음 줄이기 | 오늘약국";
const metaDescription =
  "전화로 영업·재고 확인 후 바로 길찾기 실행, 반경 확장 탐색으로 헛걸음을 줄이는 실전 팁을 안내합니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/guide/call-navigation-tips" },
};

const tips = [
  {
    title: "전화로 영업·재고 재확인",
    detail:
      "공휴일/야간에는 조기 마감이 있을 수 있습니다. 방문 전 전화로 영업 여부와 필요한 약 재고를 확인하세요.",
  },
  {
    title: "길찾기로 도착 시각 즉시 확인",
    detail:
      "지도 길찾기를 실행해 도착 시각을 확인하고, 종료 20~30분 전에 도착 가능한지 판단합니다.",
  },
  {
    title: "반경 확장 탐색",
    detail:
      "혼잡하면 반경을 3~5km로 넓혀 가장 가까운 대체 약국을 찾습니다. 리스트 정렬을 거리순으로 두면 효율적입니다.",
  },
  {
    title: "대체 약국 1~2곳 즐겨찾기",
    detail:
      "TOP3 하이라이트에서 1~2곳을 미리 후보로 잡아두면 네트워크 지연이나 조기 마감 시 바로 이동할 수 있습니다.",
  },
];

const faqs = [
  {
    q: "전화번호는 어디서 확인하나요?",
    a: "약국 상세 페이지 상단에 전화 걸기 버튼이 있습니다. 클릭 시 바로 통화가 연결됩니다.",
  },
  {
    q: "길찾기 버튼은 어떤 지도를 사용하나요?",
    a: "브라우저/OS 설정에 따라 기본 지도 앱으로 열립니다. 소요 시간을 바로 확인하고 도착 시각을 판단하세요.",
  },
  {
    q: "반경 검색은 어떻게 바꾸나요?",
    a: "`/nearby` 페이지에서 반경 3/5/10km 버튼으로 즉시 변경할 수 있습니다.",
  },
];

export default function GuideCallNavigationTipsPage() {
  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">가이드 · 헛걸음 방지</p>
        <h1 className="text-3xl font-bold leading-tight">전화·길찾기 활용 팁: 헛걸음 줄이기</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/night-weekend"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            야간/주말 가이드
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2"
          >
            <h2 className="text-xl font-semibold">{tip.title}</h2>
            <p className="text-[var(--muted)] leading-relaxed">{tip.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">바로 실행 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          <li>전화로 영업/재고 확인 → 헛걸음 방지</li>
          <li>길찾기로 도착 시각 확인 → 종료 20~30분 전에 도착</li>
          <li>반경 3/5/10km 전환 → 대체 약국 빠르게 확보</li>
          <li>TOP3에서 1~2곳 즐겨찾기</li>
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
            <h2 className="text-xl font-semibold">다음 단계</h2>
            <p className="text-sm text-[var(--muted)]">
              위치 권한을 허용해 반경 검색을 켜고, 전화/길찾기를 함께 활용해 보세요.
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


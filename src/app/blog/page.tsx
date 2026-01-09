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

  {
    title: "약국에서 자주 묻는 질문 TOP10과 답변",
    description: "약 복용 시간, 술 마신 후 약 복용, 유효기간 지난 약 처리 등 약국에서 가장 많이 묻는 질문 10가지를 정리해 드립니다.",
    slug: "pharmacy-faq-top10",
    tags: ["약국이용팁", "복약지도", "상식"],
  },
  {
    title: "여행 중 처방전 분실 시 대처법",
    description: "즐거운 여행 중 복용하던 약을 잃어버렸다면? 처방전 재발급 방법, 약국에서의 대체 조제 가능 여부, 응급실 방문 기준 등 현실적인 대처법을 알려드립니다.",
    slug: "lost-prescription-action-guide",
    tags: ["처방전", "분실", "여행"],
  },
  {
    title: "피부 트러블(벌레·햇빛) 응급 처치 키트",
    description: "여름철 야외활동이나 여행 시 필수! 벌레 물렸을 때, 햇빛 화상 입었을 때, 갑작스러운 알러지에 대비하는 약국 상비약 키트를 소개합니다.",
    slug: "skin-trouble-first-aid-kit",
    tags: ["상비약", "벌레물림", "화상"],
  },
  {
    title: "소화불량·과음 후 약국에서 물어볼 것",
    description: "속이 더부룩하거나 술 마신 다음 날 머리가 깨질 듯 아플 때! 약국에서 증상에 딱 맞는 약을 고르는 꿀팁을 알려드립니다.",
    slug: "digestion-hangover-pharmacy-guide",
    tags: ["소화불량", "숙취해소", "약국팁"],
  },
  {
    title: "고혈압·당뇨약 복용자, 명절/연휴 대비 필수 체크리스트",
    description: "약이 떨어지면 큰일 나는 만성질환자분들을 위해! 연휴 전 약 관리법, 깜빡했을 때 대처법, 그리고 음식 조절 팁까지 정리했습니다.",
    slug: "hypertension-diabetes-holiday-tips",
    tags: ["만성질환", "고혈압", "당뇨"],
  },
  {
    title: "임산부가 약국 이용 시 유의사항",
    description: "임신 중 감기, 변비, 두통이 생겼을 때 참아야만 할까요? 임산부가 안전하게 복용할 수 있는 약과 약국 방문 시 꼭 확인해야 할 체크리스트를 안내합니다.",
    slug: "pregnancy-pharmacy-guide",
    tags: ["임산부", "약물복용", "안전"],
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


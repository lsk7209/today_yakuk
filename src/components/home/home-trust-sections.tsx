import Link from "next/link";

export const HOME_FAQ_ITEMS = [
  {
    question: "약국오늘의 영업 상태는 실시간인가요?",
    answer:
      "영업 상태는 등록된 운영 시간 데이터를 기준으로 계산합니다. 공휴일, 조기 마감, 내부 사정으로 실제 현장과 차이가 날 수 있어 방문 전 전화 확인을 권장합니다.",
  },
  {
    question: "약국오늘은 어떤 데이터를 사용하나요?",
    answer:
      "약국오늘은 공공데이터포털과 공개 위치 정보를 바탕으로 약국 이름, 주소, 전화번호, 운영 시간, 좌표를 정리해 보여줍니다.",
  },
  {
    question: "광고 때문에 정보가 왜곡되지는 않나요?",
    answer:
      "약국오늘은 광고와 별개로 공공데이터 기반 원본 정보, 이용 가이드, 면책 안내를 분리해 제공합니다. 방문 결정에 필요한 정보가 먼저 보이도록 화면을 구성합니다.",
  },
  {
    question: "정보가 틀리면 어떻게 수정 요청하나요?",
    answer:
      "문의 페이지에서 약국명, 주소, 변경이 필요한 내용을 남겨주시면 확인 후 반영합니다. 공공데이터 원본과 현장 정보가 다른 경우 운영 메모도 함께 검토합니다.",
  },
];

const proofPoints = [
  {
    title: "누구를 위한 서비스인지 명확합니다",
    description:
      "심야, 주말, 공휴일에 지금 문 연 약국을 빠르게 찾으려는 사용자를 위해 설계했습니다. 고령층도 읽기 쉬운 큰 버튼과 짧은 안내 문장을 우선합니다.",
  },
  {
    title: "약국 검색 이후 행동까지 연결합니다",
    description:
      "검색 결과만 보여주지 않고 전화 확인, 길찾기, 반경 선택, 종료 임박 확인까지 한 흐름으로 제공합니다. 헛걸음을 줄이는 것이 핵심 목적입니다.",
  },
  {
    title: "콘텐츠형 페이지도 함께 운영합니다",
    description:
      "가이드와 블로그에서 심야 약국 찾기, 공휴일 체크리스트, 전화 스크립트처럼 실제 사용 맥락을 설명해 단순 목록형 사이트와 차별화합니다.",
  },
];

const operatingPrinciples = [
  "약국오늘은 정부 기관이 아니며, 공공데이터를 가공해 더 읽기 쉽게 제공하는 민간 서비스입니다.",
  "데이터가 비어 있거나 현장 사정으로 변경될 수 있으므로 방문 전 전화 확인을 항상 권장합니다.",
  "광고가 붙더라도 기본 정보, 가이드, 문의/정정 경로가 먼저 보이도록 화면 우선순위를 유지합니다.",
];

const visitChecklist = [
  "‘곧 종료’ 표시가 있으면 출발 전에 전화로 영업 여부를 한 번 더 확인합니다.",
  "공휴일·대체휴일에는 운영 시간이 자주 바뀌므로 같은 지역 내 대체 약국도 함께 확인합니다.",
  "건물명, 층수, 주차 가능 여부가 헷갈리면 길찾기 전에 주소를 다시 확인합니다.",
];

const editorialStandards = [
  "본문에는 진단·처방을 대신한다는 표현을 쓰지 않고, 약사나 의료진 상담이 필요한 상황을 분리해 안내합니다.",
  "약국 영업 정보는 공공데이터와 공개 위치 정보를 바탕으로 정리하며, 방문 전 전화 확인을 기본 행동으로 안내합니다.",
  "광고 영역은 정보 탐색을 방해하지 않는 위치에만 배치하고, 검색·전화·길찾기 같은 핵심 기능보다 앞세우지 않습니다.",
];

const featuredGuides = [
  {
    title: "야간·주말 약국 찾기",
    description: "늦은 시간 문 연 약국을 찾을 때 영업 확인, 전화 확인, 대체 후보를 함께 보는 기준입니다.",
    href: "/guide/night-weekend",
  },
  {
    title: "공휴일 약국 체크리스트",
    description: "공휴일과 대체휴일에 운영 시간이 달라질 때 출발 전 확인할 항목을 정리했습니다.",
    href: "/guide/holiday-checklist",
  },
  {
    title: "약국 전화 스크립트",
    description: "재고, 영업 여부, 상담 가능 여부를 짧게 확인할 수 있는 통화 문장을 제공합니다.",
    href: "/guide/call-scripts",
  },
];

export function HomeTrustSections() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-black tracking-[0.18em] text-brand-700">WHY TODAYPHARM</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">약국오늘이 제공하는 실제 가치</h2>
          <p className="text-gray-600 leading-relaxed">
            약국오늘은 단순히 약국 목록을 모아두는 사이트가 아니라, 급하게 약국이 필요한 순간에
            <strong className="font-black text-gray-900"> 빠르게 판단하고 바로 움직일 수 있게 돕는 도구형 서비스</strong>
            입니다. 검색, 확인, 이동까지 이어지는 실제 사용 흐름을 기준으로 화면과 콘텐츠를 구성합니다.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {proofPoints.map((item) => (
            <article key={item.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="text-lg font-black text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-black tracking-[0.18em] text-brand-700">EDITORIAL POLICY</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">애드센스 검수에 맞춘 정보 운영 기준</h2>
          <p className="text-gray-600 leading-relaxed">
            약국오늘의 글과 검색 화면은 사용자가 광고보다 먼저 필요한 정보를 확인할 수 있도록 설계합니다. 의료적
            판단이 필요한 내용은 일반 정보와 구분하고, 공공데이터 기반 서비스의 한계를 화면 안에서 반복 안내합니다.
          </p>
        </div>
        <ul className="mt-5 grid gap-3 lg:grid-cols-3">
          {editorialStandards.map((item) => (
            <li key={item} className="rounded-2xl border border-gray-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-brand-700">GUIDES</p>
            <h2 className="text-2xl font-black text-gray-900">자주 쓰는 약국 이용 가이드</h2>
          </div>
          <Link href="/blog" className="text-sm font-black text-brand-700 hover:text-brand-800">
            블로그 전체 보기
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {featuredGuides.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5 hover:border-brand-300 hover:bg-white hover:shadow-sm"
            >
              <h3 className="text-lg font-black text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">데이터 출처와 운영 원칙</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            약국오늘은 공공데이터포털과 공개 위치 데이터를 기반으로 약국 정보를 정리합니다. 데이터 출처와 한계를
            함께 안내해 사용자가 정보를 과신하지 않도록 설계했습니다.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-gray-700">
            {operatingPrinciples.map((item) => (
              <li key={item} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://www.data.go.kr/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-black text-white hover:bg-brand-800"
            >
              공공데이터포털 보기
            </a>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-900 hover:border-brand-300 hover:text-brand-700"
            >
              서비스 소개 자세히 보기
            </Link>
          </div>
        </article>

        <aside className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">방문 전 체크리스트</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            약국 검색 결과를 본 뒤 바로 출발하기보다, 아래 항목을 확인하면 불필요한 이동을 크게 줄일 수 있습니다.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-gray-700">
            {visitChecklist.map((item) => (
              <li key={item} className="rounded-2xl border border-gray-200 bg-emerald-50/60 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/guide"
              className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-black text-white hover:bg-black"
            >
              이용 가이드 보기
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-900 hover:border-brand-300 hover:text-brand-700"
            >
              정보 수정 문의하기
            </Link>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-brand-700">FAQ</p>
            <h2 className="text-2xl font-black text-gray-900">자주 묻는 질문</h2>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/privacy" className="font-bold text-gray-600 hover:text-brand-700">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="font-bold text-gray-600 hover:text-brand-700">
              이용약관
            </Link>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {HOME_FAQ_ITEMS.map((item) => (
            <details key={item.question} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <summary className="cursor-pointer font-black text-gray-900">{item.question}</summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

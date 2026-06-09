import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "심야 약국 헛걸음 막는 거리·반경 활용법 | 약국오늘";
const metaDescription =
  "반경 2/3/5km 설정과 거리순 정렬을 활용해 심야 시간대 헛걸음을 줄이는 방법을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/night-radius-tips" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/night-radius-tips",
    type: "article",
    images: ["/og-image.svg"],
  },
};

const steps = [
  "기본 2km에서 시작해 3km, 5km로 단계적으로 확장",
  "거리순 정렬을 켜고 종료 임박 여부를 함께 확인",
  "전화로 영업/재고 재확인 후 길찾기 실행",
  "TOP3 후보 중 1~2곳을 대체 약국으로 확보",
];

const faqs = [
  {
    q: "반경은 몇 km부터 시작하면 좋을까요?",
    a: "심야에는 2~3km에서 시작해, 결과가 부족하면 5km로 확장하는 것이 효율적입니다. 가능하면 도보 또는 단거리 이동이 가능한 범위 안에서 후보를 찾는 것이 이동 시간을 최소화하는 방법입니다. 결과가 전혀 없을 때만 5km 이상으로 넓히세요.",
  },
  {
    q: "거리순 정렬은 언제 켜야 하나요?",
    a: "위치 권한을 허용해 거리 정보가 표시될 때, 빠른 방문이 중요하다면 거리순을 켜고 종료 임박 시간을 함께 확인하세요. 다만 거리가 가까워도 종료까지 10분 이내라면 이동 시간과 비교해 도착 가능 여부를 반드시 판단해야 합니다. 종료 임박 정보가 없는 경우에는 직접 전화로 영업 여부를 확인하는 것이 안전합니다.",
  },
  {
    q: "헛걸음 줄이는 핵심은 무엇인가요?",
    a: "전화로 영업/재고 재확인 후 길찾기로 도착 시각을 검증하는 2단계를 꼭 거치세요. 온라인 정보와 실제 운영 상황은 다를 수 있어 전화 확인이 가장 확실한 방법입니다. 도착 예정 시각을 남은 운영 시간과 비교하면 헛걸음 확률을 크게 낮출 수 있습니다.",
  },
  {
    q: "위치 권한을 허용하지 않으면 어떻게 되나요?",
    a: "위치 권한을 거부하면 현재 위치 기준의 거리 정보가 표시되지 않아 거리순 정렬이 정확하게 동작하지 않습니다. 이 경우 지역명이나 주소를 직접 입력해 검색할 수 있지만, 실제 나와의 거리를 확인하기 어렵습니다. 심야에는 정확한 거리 정보가 헛걸음을 막는 핵심이므로 위치 권한 허용을 적극 권장합니다.",
  },
  {
    q: "TOP3 후보를 미리 확보해야 하는 이유가 있나요?",
    a: "심야에는 운영 중인 약국 수가 적어 첫 번째 약국이 실패할 경우 대안을 즉시 찾기 어렵습니다. TOP3 후보를 미리 확인해 두면 첫 방문이 여의치 않더라도 당황하지 않고 두 번째 목적지로 바로 이동할 수 있습니다. 특히 자정 이후에는 운영 약국이 급격히 줄어드는 경우가 많아 사전 준비가 이동 시간 단축에 직결됩니다.",
  },
  {
    q: "전화 확인 시 어떤 내용을 물어봐야 하나요?",
    a: "현재 영업 중인지, 찾는 약품의 재고가 있는지, 몇 시까지 운영하는지 세 가지를 반드시 확인하세요. 야간 당번 약국은 공식 종료 시각보다 일찍 문을 닫는 경우도 있어 마감 시각을 재확인하는 것이 중요합니다. 전화 한 통으로 불필요한 이동을 사전에 차단할 수 있습니다.",
  },
];

export default function BlogNightRadiusTips() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/night-radius-tips",
  });

  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">블로그 · 심야 반경 활용</p>
        <h1 className="text-3xl font-bold leading-tight">심야 약국 헛걸음 막는 거리·반경 활용법</h1>
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

      <AdSlotTop />

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">심야 헛걸음, 왜 반복될까</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          심야에 약을 구하러 나갔다가 문이 잠긴 약국 앞에서 발길을 돌리는 경험은 생각보다 흔합니다.
          운영 시간 정보가 실시간으로 반영되지 않거나, 약국까지의 실제 이동 시간을 과소평가하는 경우가 많기 때문입니다.
          반경 설정과 거리순 정렬을 제대로 활용하면 이러한 시행착오를 크게 줄일 수 있습니다.
          특히 자정 이후에는 운영 중인 약국 수가 급격히 줄어들어, 올바른 검색 전략이 더욱 중요해집니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            반경 설정 없이 검색하면 멀리 있는 약국이 상단에 노출될 수 있습니다
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            거리순 정렬을 켜지 않으면 가장 가까운 약국을 놓치기 쉽습니다
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            영업 종료 임박 시각을 확인하지 않으면 도착 전에 문이 닫힐 수 있습니다
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            대체 약국 후보를 미리 파악해 두면 첫 방문 실패에도 당황하지 않습니다
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">빠른 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          {steps.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">반경·정렬 활용 팁</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">2km → 3km → 5km 순차 확대</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              심야 검색은 2km 반경에서 시작하는 것이 가장 합리적입니다. 도보나 단거리 이동으로 접근 가능한 범위이며, 여기서 운영 중인 약국을 찾으면 이동 시간을 최소화할 수 있습니다. 2km 내 결과가 없거나 모두 종료 임박 상태라면 3km로 확장하고, 그래도 마땅한 약국이 없으면 5km까지 넓히세요. TOP3 하이라이트 기능을 활용하면 각 반경에서 우선 방문 순서를 직관적으로 파악할 수 있어 선택에 걸리는 시간을 줄일 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">거리순 + 종료 임박 확인</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              위치 권한을 허용한 상태에서 거리순 정렬을 켜면 현재 위치에서 가장 가까운 약국이 상단에 표시됩니다. 여기서 한 걸음 더 나아가 종료 예정 시간도 함께 확인하는 것이 핵심입니다. 예를 들어 1km 거리의 약국이 15분 후 문을 닫는다면, 2km 거리지만 1시간 더 운영하는 약국을 선택하는 것이 현명합니다. 이동 시간과 잔여 운영 시간을 함께 고려하는 습관이 심야 헛걸음을 줄이는 가장 실용적인 방법입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">전화 후 길찾기 실행</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              온라인 정보는 실시간이 아닐 수 있습니다. 약국에 전화를 걸어 현재 영업 중인지, 찾는 약품의 재고가 있는지 두 가지를 꼭 확인하세요. 실제로 야간 당번 약국이 공식 종료 시각보다 일찍 마감하는 경우가 있어 전화 확인은 매우 중요합니다. 재고와 영업을 확인한 뒤 길찾기 앱으로 도착 예정 시각을 계산해 보면, 남은 운영 시간 안에 도착 가능한지 판단할 수 있어 헛걸음 확률이 크게 낮아집니다.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
              <h3 className="text-base font-bold text-gray-900">새벽 1시, 해열제가 급하게 필요한 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              자녀가 갑자기 고열이 나 새벽 1시에 해열제를 구해야 합니다. 2km 반경으로 검색하니 영업 중인 약국이 1곳뿐이고 20분 후 마감 예정입니다. 거리순 정렬에서 해당 약국이 1.3km로 표시되어 전화로 재고를 확인한 뒤 즉시 길찾기를 실행하면 15분 안에 도착 가능하다는 것을 확인하고 출발할 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">3km 반경 확장 후 대체 약국 발견</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              처음 2km 반경으로 검색했을 때는 운영 중인 약국이 없었지만, 3km로 확장하니 2곳이 나타났습니다. 가까운 쪽에 전화를 했더니 원하는 약품 재고가 없었지만, 미리 두 번째 후보를 파악해 뒀기 때문에 바로 2.8km 약국에 전화해 재고를 확인하고 헛걸음 없이 방문할 수 있었습니다. TOP3 목록을 미리 확인하는 습관이 이런 상황에서 빛을 발합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">종료 임박 정보로 방문 약국 순서 변경</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              거리순 정렬 상단에 0.8km 약국이 있었지만 종료까지 10분밖에 남지 않았습니다. 이동 시간이 약 12분으로 예상되어 도착 전에 문을 닫을 가능성이 높았습니다. 목록에서 다음 후보인 1.5km 약국은 1시간 더 운영한다는 것을 종료 임박 정보로 확인했고, 덕분에 무의미한 이동 없이 두 번째 약국을 목적지로 설정해 정확히 방문할 수 있었습니다.
            </p>
          </div>
        </div>
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
              반경을 조정하고 거리순을 켠 뒤, 전화/길찾기로 도착 시각을 확인해 보세요.
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
              href="/부산/전체"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
            >
              부산 리스트
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/guide/radius-selection" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">반경 선택 기준 가이드</p>
            <p className="text-xs text-gray-500 mt-1">상황별 반경 설정 전략</p>
          </Link>
          <Link href="/blog/night-pharmacy-checklist" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">심야 약국 방문 체크리스트</p>
            <p className="text-xs text-gray-500 mt-1">헛걸음 방지 6가지</p>
          </Link>
        </div>
      </section>

      <AdSlotBottom />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </div>
  );
}

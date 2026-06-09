import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/seo/json-ld";

const metaTitle = "심야 약국 찾기 체크리스트: 헛걸음 방지 | 약국오늘";
const metaDescription =
  "심야 시간대 종료 임박 확인, 전화/길찾기 활용, 반경 확장 탐색으로 빠르게 약국을 찾는 방법을 정리했습니다.";

export async function generateMetadata(): Promise<Metadata> {
  const title = metaTitle;
  const description = metaDescription;
  const canonical = "/blog/night-pharmacy-checklist";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(title)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

const checklist = [
  "심야 필터/영업중 필터로 열려 있는 약국만 보기",
  "종료 예정 시간 확인 후 우선 방문 순서 결정",
  "전화로 영업·재고 재확인",
  "길찾기로 도착 시각 검증",
  "혼잡하면 반경을 3~5km로 확장",
];

const faqs = [
  {
    q: "심야 영업 정보는 어디서 오나요?",
    a: "공공데이터 기반으로 매일 동기화합니다. 다만 심야에는 변동이 있을 수 있으니 전화 확인을 권장합니다.",
  },
  {
    q: "도착 시간을 어떻게 체크하나요?",
    a: "상세 페이지의 길찾기 버튼을 눌러 지도 앱에서 소요 시간을 확인하세요. 종료 20~30분 전에 도착하는지 확인이 중요합니다.",
  },
  {
    q: "반경은 얼마나 넓히면 좋을까요?",
    a: "기본 2~3km에서 시작해, 혼잡하면 5km까지 넓혀보세요. 거리순 정렬을 켜면 효율적입니다.",
  },
  {
    q: "심야 약국이 아예 없는 지역도 있나요?",
    a: "농어촌이나 소규모 시·군 지역은 자정 이후 영업 약국이 0곳인 경우가 있습니다. 이런 경우 인근 읍·면 소재지나 응급의료기관 24시간 약제부를 이용하는 방법을 함께 확인하세요. 사전에 119에 문의하면 인근 이용 가능한 의약품 공급처를 안내받을 수도 있습니다.",
  },
  {
    q: "약국 문이 열려 있어도 원하는 약이 없을 때는요?",
    a: "심야에는 재고가 제한되어 있어 특정 전문의약품이나 냉장 보관 의약품이 없을 수 있습니다. 방문 전 전화로 약 이름과 용량을 정확히 말하고 재고 여부를 확인하는 것이 가장 확실합니다. 급한 경우 응급실 야간 처방을 통해 의약품을 받는 방법도 검토해 보세요.",
  },
  {
    q: "영업 중으로 표시된 약국인데 이미 문을 닫았어요.",
    a: "공공데이터와 실제 영업 사이에 최대 수 시간 차이가 발생할 수 있습니다. 특히 명절·연휴·기상악화 시에는 정보가 맞지 않을 확률이 높습니다. 반드시 출발 전 전화로 영업 여부를 확인하는 습관을 들이면 헛걸음을 예방할 수 있습니다.",
  },
];

export default function BlogNightPharmacyChecklist() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/night-pharmacy-checklist",
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: "/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "심야 약국 찾기 체크리스트",
        item: "/blog/night-pharmacy-checklist",
      },
    ],
  };

  return (
    <article className="container py-10 sm:py-14 space-y-10 bg-white min-h-screen">
      <header className="space-y-4" aria-label="글 머리말">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">블로그 · 심야 체크리스트</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">심야 약국 찾기 체크리스트: 헛걸음 방지</h1>
        <p className="text-base text-gray-600 leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/night-weekend"
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
          >
            야간/주말 가이드
          </Link>
        </div>
      </header>

      <AdSlotTop />

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">이 체크리스트가 필요한 순간</h2>
        <p className="text-gray-700 leading-relaxed">
          심야에 갑작스럽게 두통약·해열제·소화제가 필요할 때, 가장 먼저 드는 걱정은 &ldquo;지금 열려 있는 약국이 있을까?&rdquo;입니다. 무작정 가까운 곳으로 향했다가 문이 닫혀 헛걸음하는 상황은 생각보다 자주 발생합니다. 영업 중 여부를 확인하지 않거나 도착 예상 시간을 계산하지 않으면 종료 직전에 약국 앞에서 발길을 돌려야 하는 경우도 있습니다. 이 체크리스트는 심야 탐색에서 반복되는 실수를 줄이고, 가장 짧은 동선으로 원하는 약을 구할 수 있도록 순서를 정리한 것입니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            밤 10시 이후 갑작스러운 증상으로 약이 필요할 때
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            여러 약국을 검색했지만 실제 영업 중인지 불분명할 때
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            종료 시간이 얼마 남지 않아 가장 빠른 경로를 찾아야 할 때
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            낯선 지역(여행·출장)에서 약국을 처음 탐색해야 할 때
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">빠른 체크리스트</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {checklist.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">심야 탐색 팁</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900">종료 임박 약국부터 방문</h3>
            <p className="text-gray-600 leading-relaxed">
              종료 시간이 가까운 순으로 방문 계획을 세우고, 대체 약국 1~2곳을 함께 확보하세요. 예를 들어 자정 마감 약국이 있고 새벽 2시 마감 약국이 있다면, 자정 약국을 먼저 노리고 거리를 계산한 뒤 최소 20~30분의 여유를 두고 출발하는 것이 중요합니다. 도착 직전에 문이 닫히는 상황을 막으려면 지도 앱에서 실시간 교통 상황을 반영한 예상 소요 시간을 반드시 확인하세요. 목적지 약국이 종료된 경우를 대비해 두 번째 후보 약국의 위치와 종료 시간도 미리 메모해 두면 빠르게 대응할 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900">전화 → 길찾기 두 단계</h3>
            <p className="text-gray-600 leading-relaxed">
              전화로 영업/재고를 확인한 뒤, 길찾기로 도착 시각을 검증하면 헛걸음을 크게 줄일 수 있습니다. 전화 시에는 &ldquo;지금 영업 중인가요?&rdquo;, &ldquo;○○ 약(제품명 또는 성분명)이 있나요?&rdquo;를 명확하게 물어보세요. 전화 연결이 되지 않을 때는 영업 중 가능성이 낮으니 다음 후보로 넘어가는 것이 시간을 아끼는 방법입니다. 길찾기 단계에서는 도보·버스·택시 옵션을 비교해 종료 시간 전에 도착 가능한 수단을 선택하면 상황에 따라 이동 방법도 달라질 수 있습니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900">반경 확장으로 후보 늘리기</h3>
            <p className="text-gray-600 leading-relaxed">
              기본 2~3km에서 시작해 5km까지 넓혀보세요. 리스트 정렬을 거리순으로 두면 가까운 순서로 바로 확인 가능합니다. 심야 시간대에는 전체 약국 수 자체가 적기 때문에 처음부터 넓은 범위를 탐색하는 편이 유리할 수도 있습니다. 특히 주거 밀도가 낮은 외곽 지역이나 소도시라면 5~10km 범위까지 확장해야 영업 중인 약국을 찾을 수 있는 경우도 있으므로, 결과가 0~1개일 때는 즉시 범위를 넓히는 것을 추천합니다.
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
              <h3 className="text-base font-bold text-gray-900">밤 11시, 갑자기 아이가 열이 나는 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              해열제가 집에 없고 자정 마감 약국이 2km 거리에 있다면, 지금 당장 출발해야 할지 판단이 어렵습니다. 약국오늘에서 종료 시간 순 정렬로 자정 마감 약국을 찾고, 길찾기로 이동 시간을 확인한 뒤 10분 안에 도착 가능하다면 즉시 전화로 소아용 해열제 재고를 확인하고 출발하세요. 만약 이동 시간이 빠듯하다면 새벽 2시 마감 약국을 두 번째 후보로 동시에 확보해 두는 것이 안전합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">여행 중 낯선 도시에서 두통약이 필요한 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              숙소 주변 약국을 직접 검색하기 어려울 때는 약국오늘에서 현재 위치 기반으로 탐색하면 반경 내 영업 중 약국 목록을 즉시 확인할 수 있습니다. 심야라면 영업 중 필터를 켜고 거리순으로 정렬해 가장 가까운 약국에 먼저 전화해 보세요. 지역 특성에 따라 심야 약국이 시내 중심부에 집중돼 있을 수 있으니, 반경을 1~2km씩 넓혀가며 확인하는 것이 효율적입니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">새벽 1시, 가까운 약국이 이미 문을 닫은 경우</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              검색 결과에 영업 중으로 나온 약국에 도착했지만 이미 문이 닫혀 있다면, 당황하지 말고 바로 앱에서 다음 후보를 탐색하세요. 반경을 5km로 넓히고 새벽 영업 중인 약국을 재검색한 뒤, 이번엔 반드시 전화 확인 후 출발하는 방법을 택하세요. 심야에는 공공데이터 정보가 실제와 다를 수 있으므로, 전화 확인 단계를 절대 생략하지 않는 것이 헛걸음을 막는 가장 확실한 방법입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
        <div className="space-y-3" aria-label="FAQ">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <summary className="cursor-pointer font-bold text-gray-900">
                {faq.q}
              </summary>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">다음 단계</h2>
            <p className="text-sm text-gray-600 mt-1">
              내 주변 검색으로 빠르게 찾거나, 반경을 넓혀 대체 약국을 확보하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/nearby"
              className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              내 주변 찾기
            </Link>
            <Link
              href="/부산/전체"
              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
            >
              부산 리스트
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/guide/night-weekend" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">야간·주말 약국 찾기 완전 가이드</p>
            <p className="text-xs text-gray-500 mt-1">완전 가이드</p>
          </Link>
          <Link href="/blog/night-pharmacy-3steps" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">야간 약국 찾기 3단계</p>
            <p className="text-xs text-gray-500 mt-1">단계별 방법</p>
          </Link>
        </div>
      </section>

      <AdSlotBottom />

      <JsonLd id="jsonld-article" data={articleJsonLd as unknown as Record<string, unknown>} />
      <JsonLd id="jsonld-breadcrumb" data={breadcrumbJsonLd} />
    </article>
  );
}

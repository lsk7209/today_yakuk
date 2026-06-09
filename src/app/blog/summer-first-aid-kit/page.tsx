import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "여름 휴가철 응급 상비약 리스트 | 약국오늘";
const metaDescription =
  "벌레·햇빛·소화불량·멍/찰과상 대비 휴대용 응급 키트 구성과 약국 활용 팁을 정리했습니다.";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical: "/blog/summer-first-aid-kit" },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/blog/summer-first-aid-kit",
    type: "article",
    images: ["/og-image.svg"],
  },
};

const checklist = [
  "자외선 차단제·애프터선(진정제) 준비",
  "벌레·해파리 대비 항히스타민/소염 연고",
  "소화제·지사제·멀미약 기본 구비",
  "멍/찰과상용 밴드·거즈·소독제",
  "해열·진통제(아세트아미노펜/이부프로펜) 휴대",
  "휴대용 체온계·핀셋·일회용 장갑 추가",
];

const faqs = [
  {
    q: "해열·진통제는 무엇을 챙기면 좋나요?",
    a: "아세트아미노펜 또는 이부프로펜 성분을 기본으로 챙기세요. 두 성분은 작용 기전이 달라 중복 복용 시 부작용 위험이 있으므로, 포장지에서 성분명을 반드시 확인한 뒤 한 가지만 사용하는 것이 안전합니다. 위장이 약하다면 음식과 함께 복용하는 이부프로펜보다 공복에도 부담이 적은 아세트아미노펜이 적합할 수 있습니다.",
  },
  {
    q: "벌레·해파리에 물렸을 때 무엇을 사용하나요?",
    a: "항히스타민제나 소염 연고로 가려움·염증을 완화하세요. 해파리에 쏘인 경우 바닷물로 부드럽게 씻어낸 뒤 연고를 바르고, 촉수가 남아 있으면 핀셋으로 제거하면 됩니다. 두드러기나 호흡 곤란처럼 전신 반응이 나타나면 즉시 의료기관을 방문하는 것이 중요합니다.",
  },
  {
    q: "상처 소독은 어떻게 하나요?",
    a: "먼저 흐르는 깨끗한 물로 이물질을 충분히 씻어낸 뒤 포비돈 같은 소독제를 사용하세요. 소독 후 거즈로 덮고 밴드나 의료용 테이프로 고정하면 감염 위험을 줄일 수 있습니다. 상처가 깊거나 출혈이 멎지 않으면 가까운 약국 또는 의료기관에서 추가 처치를 받으세요.",
  },
  {
    q: "여름철 소화불량에는 어떤 약이 도움이 되나요?",
    a: "소화효소제(훼스탈 등)는 과식·기름진 음식 후 소화를 돕고, 위산 과다로 속 쓰림이 있을 때는 제산제가 빠르게 증상을 완화합니다. 설사가 동반된다면 지사제를 추가하되, 세균성 식중독이 의심될 경우 지사제 단독 복용은 피하고 약사나 의사와 상담하는 것이 좋습니다. 증상이 하루 이상 지속되거나 열이 함께 나면 병원 진료가 필요합니다.",
  },
  {
    q: "멀미약은 언제 먹어야 효과가 좋나요?",
    a: "대부분의 경구 멀미약은 출발 30~60분 전에 복용해야 충분한 효과를 기대할 수 있습니다. 패치형 멀미약은 붙이는 부위(귀 뒤)를 깨끗이 닦고 출발 4시간 전에 부착하는 것이 권장됩니다. 졸음 유발 성분이 포함된 경우가 많으므로, 운전 예정자나 어린이는 복용 전 반드시 약사에게 확인하세요.",
  },
  {
    q: "일사병과 열사병을 구분하는 방법이 있나요?",
    a: "일사병은 땀을 많이 흘리고 피부가 축축하며 어지럼증·구역질이 주 증상이고, 서늘한 곳에서 수분을 보충하면 대개 회복됩니다. 열사병은 체온이 40도 이상으로 오르고 땀이 나지 않거나 의식이 흐려지는 등 훨씬 위험한 상태이므로, 즉시 119에 신고하고 체온을 낮추는 응급 처치가 필요합니다. 두 경우 모두 초기 대응으로 시원한 환경 확보와 수분 공급이 핵심입니다.",
  },
];

export default function BlogSummerFirstAidKit() {
  const articleJsonLd = buildArticleJsonLd({
    title: metaTitle,
    description: metaDescription,
    slug: "/blog/summer-first-aid-kit",
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
      { "@type": "ListItem", position: 2, name: "블로그", item: "https://todaypharm.kr/blog" },
      { "@type": "ListItem", position: 3, name: "여름 응급 키트 구성", item: "https://todaypharm.kr/blog/summer-first-aid-kit" },
    ],
  };
  return (
    <div className="container py-10 sm:py-14 space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">블로그 · 여름 상비약</p>
        <h1 className="text-3xl font-bold leading-tight">여름 휴가철 응급 상비약 리스트</h1>
        <p className="text-base text-[var(--muted)] leading-relaxed">{metaDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nearby"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            내 주변 바로 찾기
          </Link>
          <Link
            href="/guide/summer-emergency-kit"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
          >
            휴가철 키트 가이드
          </Link>
        </div>
      </header>

      <AdSlotTop />

      <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">여름 상비약이 꼭 필요한 이유</h2>
        <p className="text-[var(--muted)] leading-relaxed">
          여름 휴가지는 대형 마트나 약국과 거리가 먼 경우가 많아, 갑작스러운 증상에 대처할 시간이 절대적으로 부족합니다. 강한 자외선, 높은 기온, 낯선 음식 등 여름 특유의 환경 요인은 피부 트러블·소화불량·탈수 같은 증상을 평소보다 2~3배 빠르게 악화시킵니다. 특히 어린이나 고령자를 동반한 여행이라면 체온 조절 능력 차이로 인해 응급 상황 발생 빈도가 더 높아집니다. 출발 전 약국에서 상황별 상비약을 미리 갖춰 두면, 현지에서 의약품을 찾아 헤매는 시간 낭비와 불안감을 크게 줄일 수 있습니다.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            해변·계곡 인근 약국은 성수기에 재고가 빠르게 소진되어 원하는 제품을 구하지 못하는 경우가 잦습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            벌레 물림·햇빛 화상 같은 증상은 초기 30분 이내 처치 여부가 회복 속도에 직접적인 영향을 줍니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            동일 성분의 의약품이라도 여행지에서 구입하면 브랜드·용량이 달라 복용 실수로 이어질 수 있습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
            <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
            상비약 구성 시 단골 약국 약사에게 개인 건강 상태를 알리면 중복 성분 없이 최적 조합을 추천받을 수 있습니다.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-brand-800">빠른 체크리스트</h2>
        <ul className="list-disc list-inside space-y-1 text-emerald-900">
          {checklist.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">휴대용 키트 구성 팁</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">피부/벌레 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              자외선 차단제(SPF 50+ PA+++ 이상)와 애프터선 진정 젤을 챙기면 일광 화상 후 피부 진정에 즉각적인 도움이 됩니다. 벌레 기피제는 DEET 또는 이카리딘 성분이 함유된 제품이 효과적이며, 4~6시간마다 재도포하는 습관이 중요합니다. 해파리나 독충에 물렸을 때를 대비해 항히스타민 성분의 경구제와 스테로이드 외용 연고를 함께 준비하면 가려움과 부기를 빠르게 제어할 수 있습니다. 어린이 동반 시에는 연령별 사용 가능 여부를 약사에게 미리 확인하고, 별도의 소아용 제품을 선택하는 것이 안전합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">소화·멀미 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              여름철 고온 환경에서는 음식이 빠르게 상하므로 소화제와 지사제를 기본으로 구비하는 것이 필수입니다. 소화효소제는 기름진 음식이나 과식 후 30분 이내 복용할 때 효과가 가장 좋고, 위산 과다 증상에는 제산제를 별도로 준비하면 더욱 든든합니다. 멀미약은 출발 30~60분 전에 복용해야 효과가 나타나므로, 승선·승차 일정을 미리 파악해 두는 것이 중요합니다. 음주가 예상된다면 간 보호 기능의 보조 성분을 약사와 상담해 추가로 챙기면 다음 날 컨디션 유지에 도움이 됩니다.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">상처/멍 대비</h3>
            <p className="text-[var(--muted)] leading-relaxed">
              소독 거즈와 다양한 크기의 밴드는 최소 10개 이상 챙기면 인원수가 많은 여행에서도 여유 있게 활용할 수 있습니다. 포비돈 요오드 소독제는 소용량 개별 포장 제품을 선택하면 오염 걱정 없이 현장에서 바로 쓸 수 있어 편리합니다. 타박상이나 멍에는 먼저 냉찜질 패드로 부기를 가라앉힌 뒤 24시간 이후부터 온찜질로 혈액 순환을 촉진하면 회복이 빠릅니다. 발목 삐임 같은 염좌가 생겼을 때를 대비해 탄력 붕대 1개를 추가하면 고정과 압박에 유용하게 쓸 수 있습니다.
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
              <h3 className="text-base font-bold text-gray-900">해수욕장에서 해파리에 쏘였을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              물 밖으로 나온 즉시 바닷물(민물은 독소를 활성화할 수 있어 금지)로 해당 부위를 부드럽게 헹군 뒤, 핀셋으로 남은 촉수를 제거하세요. 준비해 둔 스테로이드 외용 연고를 얇게 바르고 항히스타민 경구제를 복용하면 가려움과 부기가 빠르게 가라앉습니다. 호흡이 불편하거나 전신에 두드러기가 퍼진다면 즉시 119에 연락해 응급 처치를 받아야 합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
              <h3 className="text-base font-bold text-gray-900">계곡 트레킹 중 발목을 삐었을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              부상 직후에는 체중을 싣지 않고 그늘진 곳에 앉아 냉찜질 패드를 15~20분간 올려두면 붓기를 억제할 수 있습니다. 탄력 붕대로 발목을 8자 형태로 감아 안정시킨 뒤, 이부프로펜 성분의 진통 소염제를 복용하면 통증과 염증을 동시에 줄이는 데 도움이 됩니다. 발목이 심하게 붓거나 체중 부하가 불가능할 정도로 아프다면 골절 가능성이 있으니 가까운 의료기관을 방문하는 것이 안전합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
              <h3 className="text-base font-bold text-gray-900">야외 바비큐 후 복통·설사가 생겼을 때</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              덜 익은 육류나 상한 음식 섭취 후 2~6시간 사이에 복통과 설사가 나타나면 식중독을 의심할 수 있습니다. 충분한 수분(이온 음료 또는 물)을 천천히 보충하면서 지사제를 복용하되, 고열(38.5도 이상)이 동반되면 지사제 복용을 멈추고 병원 진료를 받는 것이 중요합니다. 증상이 가벼운 경우라면 소화효소제와 공복 유지, 수분 공급만으로도 하루 이내 호전되는 경우가 많습니다.
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
              키트를 준비하고, 필요 시 가까운 약국을 반경/거리순으로 확인하세요.
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
              href="/인천/전체"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-brand-200"
            >
              인천 리스트
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/guide/summer-emergency-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">여름 응급 키트 구성법</p>
            <p className="text-xs text-gray-500 mt-1">휴가철 응급 키트</p>
          </Link>
          <Link href="/blog/skin-trouble-first-aid-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
            <p className="text-sm font-bold text-gray-900 hover:text-brand-700">피부 트러블 응급 처치 키트</p>
            <p className="text-xs text-gray-500 mt-1">피부 트러블 대비</p>
          </Link>
        </div>
      </section>

      <AdSlotBottom />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}

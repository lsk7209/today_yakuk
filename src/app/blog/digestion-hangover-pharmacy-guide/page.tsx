import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "소화불량·과음 후 약국에서 물어볼 것";
const metaDescription =
    "소화불량이나 과음 후 불편할 때 약사에게 전달할 증상과 복용 중인 약, 진료가 우선인 위험 신호를 정리했습니다.";

const faqs = [
    {
        q: "소화제는 식전에 먹나요, 식후에 먹나요?",
        a: "소화효소제는 식사 직전이나 식사 중에 복용해야 효과가 좋습니다. 식후에 이미 속이 불편하다면 복용해도 도움이 될 수 있지만, 예방 효과는 식전 복용에 비해 낮습니다. 위장운동 촉진제(돔페리돈 계열)는 식전 15~30분에 복용하는 것이 원칙이므로, 어떤 종류의 소화제인지 약사에게 먼저 확인하세요.",
    },
    {
        q: "술 마신 날 타이레놀을 먹으면 왜 안 되나요?",
        a: "아세트아미노펜 제품은 간 손상 관련 음주 주의사항이 있고, 다른 진통제도 위장 출혈·신장 질환 등 개인별 위험이 있습니다. 음주 직후나 숙취 상태에서는 진통제를 임의로 바꾸지 말고 제품 표시사항을 확인한 뒤 의사 또는 약사와 상담하세요.",
    },
    {
        q: "숙취해소 음료는 마시기 전에 마셔야 하나요, 후에 마셔야 하나요?",
        a: "제품마다 성분과 섭취 방법이 다르며 숙취 예방·치료 효과를 동일하게 볼 수 없습니다. 표시사항을 확인하고, 증상이 심하거나 오래 지속되면 제품에 의존하지 말고 의료진과 상담하세요.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/digestion-hangover-pharmacy-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/digestion-hangover-pharmacy-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/digestion-hangover-pharmacy-guide",
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
      { "@type": "ListItem", position: 3, name: "소화불량·숙취 약국 이용 가이드", item: "https://todaypharm.kr/blog/digestion-hangover-pharmacy-guide" },
    ],
  };
  return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    증상별 맞춤 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    체했을 때 vs 숙취가 심할 때, 약국에서 뭐 달라고 하지?
                </h1>
                <p className="text-lg text-gray-600">
                    &quot;그냥 소화제 주세요&quot;, &quot;술 깨는 약 주세요&quot;라고만 하시나요? <br className="hidden sm:block" />
                    증상과 복용 중인 약을 구체적으로 말하면 더 안전하고 정확한 상담을 받을 수 있습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
                <p className="text-gray-700 leading-relaxed">
                    소화불량과 숙취는 매우 흔한 증상이지만, 약국에서 올바른 약을 고르지 못하면 오히려 증상이 악화될 수 있습니다.
                    소화효소제·제산제·위장운동 촉진제·진경제는 작용 기전이 전혀 다르기 때문에 증상을 정확히 파악하고 선택하는 것이 중요합니다.
                    숙취의 경우 음주 전·후 타이밍과 증상 유형(두통·구역·피로)에 따라 필요한 성분이 달라지며, 잘못된 진통제 선택은 간 손상 위험을 높입니다.
                    이 가이드를 읽고 내 증상을 간단히 파악해두면 약사와 훨씬 빠르고 정확한 상담이 가능합니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        과식·기름진 음식 후 더부룩함이 30분이 지나도 해소되지 않을 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        술자리 다음 날 두통·구역감·피로 중 어디서 시작할지 모를 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        약국에서 어떤 말로 증상을 설명해야 할지 막막하게 느껴질 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        늘 먹던 소화제나 진통제가 효과가 없어 다른 약이 필요한지 궁금할 때
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>🤢 PART 1: 소화불량, 증상별로 약이 다르다!</h3>
                <p>
                    단순히 &apos;소화제&apos; 하나가 만능이 아닙니다. 내 증상을 체크해보세요.
                    소화 관련 제품은 성분과 주의사항이 서로 다릅니다. 아래 항목은 약을 직접 고르는 처방표가 아니라, 약사에게 증상을 빠짐없이 설명하기 위한 질문 목록으로 활용하세요.
                </p>
                <ul>
                    <li>
                        <strong>과식으로 꽉 막힌 느낌:</strong> 언제부터 불편했는지, 마지막 식사와 구토 여부, 평소 복용약을 약사에게 알려주세요. 증상이 반복되거나 악화되면 약을 추가하기보다 의료기관 상담이 필요합니다.
                    </li>
                    <li>
                        <strong>명치 통증이나 경련이 있을 때:</strong> 통증 위치와 강도, 지속 시간, 발열·혈변·흉통 여부를 먼저 확인하세요. 통증이 매우 심하거나 다른 위험 신호가 동반되면 약국보다 의료기관 방문이 우선입니다.
                    </li>
                    <li>
                        <strong>속이 쓰리고 신물이 올라올 때:</strong> 공복·식후 중 언제 심한지, 증상 지속 기간과 복용 중인 약을 알려주세요. 제품마다 복용 시점과 금기가 다르므로 표시사항과 약사의 안내를 확인하세요.
                    </li>
                    <li>
                        <strong>배에 가스가 차고 팽만할 때:</strong> 최근 먹은 음식, 배변 변화, 통증 위치를 함께 설명하세요. 임신·수유, 만성질환, 다른 약 복용 여부에 따라 제품 선택이 달라질 수 있습니다.
                    </li>
                </ul>

                <hr />

                <h3>🍺 PART 2: 과음 후에는 약보다 안전 확인이 먼저</h3>
                <p>
                    과음 후 증상은 음주량, 수분 상태, 기존 질환과 복용약에 따라 다릅니다. 특정 숙취 제품이나 진통제를 정답처럼 선택하지 말고, 위험 신호와 제품 표시사항을 먼저 확인하세요.
                </p>
                <ul>
                    <li>
                        <strong>음주 전 확인:</strong> 숙취해소 제품은 성분과 표시된 섭취 방법이 서로 다르며, 음주 위험을 없애거나 숙취를 치료한다고 단정할 수 없습니다.
                        음주량을 줄이고 빈속 음주를 피하며 물을 함께 마시는 것이 우선입니다. 복용 중인 약이 있다면 술자리 전에 의사 또는 약사에게 음주 가능 여부를 확인하세요.
                    </li>
                    <li>
                        <strong>두통이 심할 때:</strong>
                        <span className="text-red-500 font-bold">주의!</span> 음주 직후나 숙취 상태에서는 아세트아미노펜을 포함한 진통제를 임의로 선택하거나 서로 바꾸지 마세요.
                        제품별 음주·간 질환·위장 출혈·신장 질환 관련 주의사항이 다르므로 표시사항을 확인하고 의사 또는 약사에게 현재 음주 상태와 복용 중인 약을 알리세요.
                    </li>
                    <li>
                        <strong>속이 울렁거리고 토할 것 같을 때:</strong> 여러 일반약이나 생약 제품을 임의로 섞지 마세요. 물도 마시기 어렵거나 반복 구토, 의식 변화, 혈변·극심한 복통이 있으면 의료기관에 연락하세요.
                    </li>
                    <li>
                        <strong>수분은 어떻게 마시나요?</strong> 의식이 또렷하고 마실 수 있다면 물을 조금씩 나누어 마시며 쉬세요. 구토 때문에 수분을 유지하지 못하거나 탈수 징후가 있으면 음료나 보충제에 의존하지 말고 의료기관에 문의하세요.
                    </li>
                </ul>

                <div className="bg-brand-50 p-5 rounded-xl border border-brand-100">
                    <h4 className="flex items-center text-brand-700 m-0 mb-2">
                        <span className="text-xl mr-2">💊</span>
                        약사님께 이렇게 말해보세요
                    </h4>
                    <p className="m-0 text-gray-700">
                        &quot;어제 회식 때 소주 2병 마셨는데, 아직도 <strong>속이 울렁거리고 토할 것 같아요.</strong>&quot;
                        <br />
                        &quot;기름진 걸 많이 먹었더니 <strong>명치가 콕콕 찌르듯이 아파요.</strong>&quot;
                    </p>
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
                <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
                            <h3 className="text-base font-bold text-gray-900">회식 다음 날 아침, 두통과 구역감이 동시에</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            어젯밤 팀 회식에서 소주 두 병을 마신 뒤 아침에 일어나니 머리가 지끈거리고 속도 울렁입니다.
                            이런 경우 특정 진통제나 생약 제제를 임의로 함께 복용하지 말고, 물을 조금씩 마시며 쉬세요. 두통·구토가 심하거나 의식 변화, 심한 복통, 탈수 징후가 있으면 의료기관에 연락하세요. 약국에 문의할 때는 음주량과 마지막 음주 시각, 복용 중인 약을 함께 알려야 합니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
                            <h3 className="text-base font-bold text-gray-900">뷔페 후 꽉 막힌 느낌, 속 쓰림과 가스가 동시에</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            주말 뷔페에서 과식 후 배가 빵빵하고, 속도 쓰리고, 트림도 자꾸 나오는 복합 증상이 생겼습니다.
                            이때는 소화효소제 단독으로는 부족하며, 제산제(속 쓰림 완화)와 시메티콘 성분(가스 제거)이 함께 포함된 복합 제품을 약사에게 요청하는 것이 효율적입니다.
                            &quot;과식 후 속 쓰리고 가스도 차요&quot;라고 구체적으로 말씀하시면 약사가 한 번에 적합한 제품을 바로 안내해 드립니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
                            <h3 className="text-base font-bold text-gray-900">술자리 전, 복용 중인 약이 있을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            처방약이나 일반약을 복용 중이라면 음주 전에 약사 또는 담당 의료진에게 함께 복용해도 되는지 확인하세요.
                            숙취를 확실히 예방하는 약처럼 믿고 여러 제품을 미리 함께 복용하지 마세요. 음주량을 줄이고 식사와 수분을 챙기며, 복용 중인 약이 있다면 의사 또는 약사에게 음주 가능 여부를 먼저 확인하세요. 음주 후에는 운전하지 말고 귀가 방법을 미리 정해두세요.
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                            <p className="text-sm font-bold text-gray-900">Q. {faq.q}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
                약물 복용 중에는 음주를 피하라는 식품의약품안전처 안전정보와 각 제품 표시사항을 우선합니다. 술을 마셨다는 이유만으로 다른 진통제를 자동 대체하지 마세요.{" "}
                <a
                    href="https://impfood.mfds.go.kr/CFBBB02F02/getCntntsDetail?cntntsSn=281429"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                >
                    식품의약품안전처 안전정보 확인
                </a>
            </aside>

            <section className="rounded-2xl border border-gray-200 p-6 sm:p-8 mt-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">지금 바로 약국에 가야 한다면?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            음주 후에는 운전하지 말고, 필요하면 보호자 동행이나 안전한 이동 수단을 이용하세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/nearby"
                            data-analytics-event="content_to_nearby_click"
                            data-source-surface="blog_article"
                            data-cta-placement="article_footer"
                            className="inline-flex min-h-11 items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            내 주변 약국 찾기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link href="/guide/call-scripts" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">전화 스크립트: 재고 확인 템플릿</p>
                        <p className="text-xs text-gray-500 mt-1">전화로 재고 확인하기</p>
                    </Link>
                    <Link href="/blog/summer-first-aid-kit" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">여름철 상비약 완전 정리</p>
                        <p className="text-xs text-gray-500 mt-1">여름 대비 상비약</p>
                    </Link>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/probiotics-selection-guide", label: "유산균 균주 선택 가이드", desc: "장 건강 회복을 위한 프로바이오틱스 선택법" },
            { href: "/blog/magnesium-deficiency-guide", label: "마그네슘 부족 신호 6가지", desc: "음주 후 마그네슘 손실과 보충 방법" },
            { href: "/wiki?category=probiotics", label: "유산균 제품 전체 보기 →", desc: "약국오늘 영양제 위키에서 확인" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-brand-200 transition-all space-y-1"
            >
              <p className="font-bold text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </Link>
          ))}
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

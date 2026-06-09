import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle = "임산부가 약국 이용 시 유의사항 | 약국오늘";
const metaDescription =
    "임신 중 감기, 변비, 두통이 생겼을 때 참아야만 할까요? 임산부가 안전하게 복용할 수 있는 약과 약국 방문 시 꼭 확인해야 할 체크리스트를 안내합니다.";

const faqs = [
    {
        q: "임신 초기(1~3개월)에 두통약을 먹어도 되나요?",
        a: "임신 초기는 태아 장기가 형성되는 민감한 시기입니다. 아세트아미노펜 계열은 필요 시 최소 용량으로 단기 복용이 가능하지만, 반드시 약사나 산부인과 의사와 먼저 상담한 후 복용하세요. 이부프로펜·아스피린 등 NSAIDs 계열은 임신 기간 내내 복용을 피하는 것이 원칙입니다.",
    },
    {
        q: "수유 중에 감기약을 먹으면 아기에게 영향이 가나요?",
        a: "대부분의 감기 증상은 충분한 수분 섭취와 휴식으로 호전됩니다. 증상이 심해 약이 필요할 경우 수유 중 비교적 안전한 성분(아세트아미노펜 등)을 선택하고, 모유 분비가 적은 시간대(수유 직후)에 복용하는 방법을 약사와 상의하세요. 슈도에페드린 등 일부 성분은 모유 분비 자체를 줄일 수 있으므로 주의가 필요합니다.",
    },
    {
        q: "약국에서 임산부라고 말하면 정보가 달라지나요?",
        a: "네, 임신 주차를 알려주면 약사가 DUR(의약품 상호작용 점검) 시스템과 경험에 기반해 훨씬 안전한 약을 고를 수 있습니다. 같은 증상이라도 임신 1기·2기·3기에 따라 권고 약제가 달라질 수 있습니다. 약국 방문 시 반드시 임신 여부와 주차를 먼저 알려주시는 것이 가장 중요한 안전수칙입니다.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/pregnancy-pharmacy-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/pregnancy-pharmacy-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/pregnancy-pharmacy-guide",
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
      { "@type": "ListItem", position: 3, name: "임신 중 약국 이용 가이드", item: "https://todaypharm.kr/blog/pregnancy-pharmacy-guide" },
    ],
  };
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "임산부 안전한 약국 이용 4단계",
    description: metaDescription,
    step: [
      { "@type": "HowToStep", position: 1, name: "증상 방치 금지", text: "고열·심한 통증은 무조건 참지 마세요. 적절한 대처가 오히려 태아를 보호합니다." },
      { "@type": "HowToStep", position: 2, name: "증상별 안전한 약 확인", text: "두통·발열에는 아세트아미노펜이 상대적으로 안전합니다. 이부프로펜·아스피린은 임신 중 금기이므로 반드시 약사에게 임신 사실을 알리세요." },
      { "@type": "HowToStep", position: 3, name: "임산부 약물 안전 등급(DUR) 확인", text: "식약처 의약품 안전나라(nedrug.mfds.go.kr)에서 복용하려는 약의 임산부 안전 등급을 확인하세요." },
      { "@type": "HowToStep", position: 4, name: "영양제 과잉 섭취 주의", text: "비타민 A는 과잉 섭취 시 기형 위험이 있으므로 엽산·철분·비타민 D 외 추가 영양제는 의사와 상담 후 복용하세요." },
    ],
  };
  return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    임산부 건강 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    임신 중 아플 때, 무조건 참는 게 정답일까요?
                </h1>
                <p className="text-lg text-gray-600">
                    엄마가 아프고 힘들면 태아에게도 좋지 않습니다. <br className="hidden sm:block" />
                    임신 시기별 주의사항과 안전하게 약을 복용하는 기준을 알려드립니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    임신과 수유 기간에는 몸이 평소와 달리 반응하는 경우가 많아, 감기 한 번에도 어떤 약을 선택해야 할지 막막할 수 있습니다.
                    시중에 유통되는 일반의약품 중 임산부가 복용해서는 안 되는 성분이 생각보다 많으며, 라벨만 봐서는 판단이 어렵습니다.
                    약사 상담 없이 무심코 먹은 약이 태아나 모유에 영향을 줄 수 있다는 사실을 미리 알아두는 것만으로도 큰 사고를 예방할 수 있습니다.
                    이 가이드는 임산부·수유부가 약국을 방문할 때 알아두면 좋은 안전 기준과 실전 상담 요령을 정리했습니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        임신 중 감기·두통·변비가 생겼는데 어떤 약이 안전한지 모를 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        수유 중 복용 가능한 약인지 확신이 서지 않아 약을 참고 있을 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        DUR·임부 금기 등급 등 약국 안전 시스템이 낯설고 불안할 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        영양제·한약·건강기능식품이 태아에게 안전한지 알고 싶을 때
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. &quot;무조건 참기&quot;는 위험할 수 있습니다</h3>
                <p>
                    고열(38도 이상)이 지속되면 태아의 신경계 발달에 영향을 줄 수 있습니다.
                    따라서 열이 나거나 통증이 심할 때는 의사나 약사와 상담하여 안전한 약을 복용하는 것이 오히려 태아를 지키는 방법입니다.
                    실제로 산부인과 학회에서도 &apos;임신 중 무조건 참기&apos;보다는 &apos;정보에 기반한 선택&apos;을 권고하고 있습니다.
                    탈수를 유발하는 반복 구토·설사, 밤잠을 방해하는 심한 기침 등도 조기에 적절히 관리해야 산모와 태아 모두에게 유익합니다.
                </p>

                <h3>2. 약국에서 가장 많이 찾는 증상별 안전 가이드</h3>
                <ul>
                    <li>
                        <strong>두통/발열:</strong> 아세트아미노펜(타이레놀 등)이 1차 선택 약제입니다. 비교적 안전하게 사용 가능하지만 1회 500~1,000 mg, 1일 최대 3,000 mg 이내로 정량을 꼭 지켜야 합니다. 이부프로펜·나프록센 등 소염진통제는 임신 1기와 3기에 특히 피해야 하며, 2기에도 장기 복용은 권장되지 않습니다. 두통이 반복되거나 시야 이상·부종이 동반되면 즉시 산부인과를 방문하세요.
                    </li>
                    <li>
                        <strong>변비:</strong> 임신 중 황체호르몬 증가와 철분제 복용으로 변비는 매우 흔합니다. 푸룬주스, 식이섬유(채소·통곡물), 하루 2L 이상 수분 섭취를 우선 시도하세요. 약이 필요하다면 장에서 흡수되지 않고 수분만 끌어들여 변을 무르게 하는 락툴로오스·폴리에틸렌글리콜 성분을 약사 상담 후 선택하세요. 자극성 하제(센나·비사코딜 등)는 임산부에게 권장되지 않으므로 주의하세요.
                    </li>
                    <li>
                        <strong>속쓰림/입덧:</strong> 위산을 중화하는 제산제(수산화알루미늄·탄산마그네슘 성분)는 단기 사용에 비교적 안전합니다. 입덧이 심하면 소량씩 자주 먹고 기름진 음식과 빈속을 피하는 것이 기본 원칙입니다. 구토가 하루 수 차례 이상 반복되거나 체중이 급격히 감소하는 경우(임신오조증)는 입원 치료가 필요할 수 있으므로 반드시 병원 진료를 받으세요.
                    </li>
                </ul>

                <h3>3. 임산부 약물 안전 등급 (DUR) 확인하기</h3>
                <p>
                    모든 약에는 &apos;임부 금기 등급&apos;이 있습니다. 병원이나 약국 전산 시스템(DUR)에서 처방·조제 시 자동으로 걸러주지만, 일반의약품을 살 때는 약사님께 <strong>&quot;저 임신 O주차예요&quot;</strong>라고 먼저 말씀해 주시는 것이 가장 확실한 안전장치입니다.
                    DUR은 의약품 안전 사용 서비스(Drug Utilization Review)의 약자로, 건강보험심사평가원이 운영하는 실시간 처방·조제 점검 시스템입니다.
                    임부 금기 1등급은 사람에게 기형 유발 증거가 있는 경우이며, 2등급은 동물 실험에서 위해성이 확인된 경우입니다.
                    이 등급 정보는 의약품안전나라(nedrug.mfds.go.kr)에서 누구나 직접 조회할 수 있으니, 불안할 때는 성분명을 검색해 확인하는 습관을 들여 두시면 도움이 됩니다.
                </p>

                <h3>4. 영양제 섭취, 과유불급!</h3>
                <p>
                    엽산(400~600 mcg/일), 철분(27 mg/일), 비타민D(1,500~2,000 IU/일)는 임신 중 필수 영양소입니다.
                    그러나 비타민A가 레티놀 형태로 과도하게 포함된 종합비타민은 10,000 IU 이상에서 기형 유발 위험이 보고되어 있으므로, 임산부 전용 제품을 선택하거나 구성 성분의 함량을 반드시 확인하세요.
                    오메가-3·칼슘·마그네슘도 적절 용량 범위 안에서 섭취하면 도움이 되지만, 고용량 보충제를 임의로 여러 종류 복용하는 것은 피하는 것이 좋습니다.
                    건강기능식품이나 한약도 &apos;천연이라서 안전하다&apos;는 생각은 금물이며, 복용 전 반드시 산부인과 의사나 약사와 상의하세요.
                </p>

                <hr />

                <div className="bg-pink-50 p-5 rounded-xl border border-pink-100">
                    <h4 className="flex items-center text-pink-700 m-0 mb-2">
                        <span className="text-xl mr-2">👶</span>
                        행복한 출산을 응원합니다
                    </h4>
                    <p className="m-0 text-gray-700">
                        엄마가 건강하고 편안해야 아기도 건강합니다. 작은 증상이라도 혼자 고민하지 마시고 전문가의 도움을 받으세요.
                        약국 방문이 부담스럽다면 건강보험공단의 임신·출산 진료비 지원(국민행복카드) 혜택도 함께 확인해 보세요.
                    </p>
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
                <div className="space-y-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
                            <h3 className="text-base font-bold text-gray-900">임신 8주차, 갑자기 38.5도 고열이 났을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            임신 초기 고열은 태아 신경관 발달에 영향을 줄 수 있으므로 빠른 대처가 중요합니다. 약국을 방문해 &apos;임신 8주차&apos;임을 알리면 약사가 아세트아미노펜 단일 성분 제제를 권장하고 용량과 복용 간격을 안내해 줍니다. 38도 이상 열이 24시간 이상 지속되거나 복통·질 출혈이 동반되면 즉시 산부인과 응급 진료를 받으세요.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
                            <h3 className="text-base font-bold text-gray-900">모유 수유 중 유선염으로 항생제를 처방받았을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            수유 중 유선염에는 아목시실린·클래블라네이트 계열 항생제가 흔히 처방되며 수유 적합성이 비교적 높습니다. 약을 타기 전 조제 약사에게 &apos;현재 수유 중&apos;임을 다시 한번 알려 성분을 재검토 받으세요. 한국 의약품안전나라나 미국 NIH LactMed 데이터베이스에서 수유 안전 등급을 직접 조회하는 것도 좋은 방법입니다.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
                            <h3 className="text-base font-bold text-gray-900">심야에 갑작스러운 심한 속쓰림과 구역이 올 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            임신 중기 이후 자궁이 커지면서 위 역류 증상이 악화되는 경우가 많습니다. 집에서 탄산수소나트륨(베이킹소다) 소량을 물에 타 마시는 것은 임시 방편으로 가능하지만, 나트륨 과다 섭취에 주의해야 합니다. 심야 당직 약국에 방문하면 임산부용 제산제를 안전하게 구입할 수 있으며, 가까운 심야 약국 위치는 약국오늘에서 바로 확인할 수 있습니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-2">
                            <p className="text-sm font-bold text-gray-900">Q. {faq.q}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8 mt-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">심야나 휴일에 급하게 약이 필요하다면?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            지금 문 연 약국을 확인하고 안전하게 다녀오세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/nearby"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            내 주변 약국 찾기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link href="/blog/kids-fever-medicine-comparison" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">소아 발열 약 비교 가이드</p>
                        <p className="text-xs text-gray-500 mt-1">아이 해열제 기준</p>
                    </Link>
                    <Link href="/blog/pharmacy-visit-checklist-3" className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 확인 3가지</p>
                        <p className="text-xs text-gray-500 mt-1">방문 전 체크리스트</p>
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
        </div>
    );
}

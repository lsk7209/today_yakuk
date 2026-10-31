import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "임산부가 약국 이용 시 유의사항";
const metaDescription =
    "임신·수유 중 증상이 생겼을 때 약사와 의사에게 알려야 할 정보와 DUR 조회의 한계를 안내합니다.";

const faqs = [
    {
        q: "임신 초기(1~3개월)에 두통약을 먹어도 되나요?",
        a: "복용할 약의 이름과 성분, 임신 주차, 증상, 이미 복용한 약을 약사나 산부인과 의사에게 알리고 상담하세요. 증상이 심하거나 계속되면 진료를 받으세요.",
    },
    {
        q: "수유 중에 감기약을 먹으면 아기에게 영향이 가나요?",
        a: "약에 따라 수유 중 사용 여부가 다릅니다. 수유 중이라는 사실과 아기의 상태, 복용 중인 약을 처방 의사와 약사에게 알리고 약의 사용 여부를 상담하세요. 임의로 수유를 중단하거나 복용 시점을 바꾸지 마세요.",
    },
    {
        q: "약국에서 임산부라고 말하면 정보가 달라지나요?",
        a: "네. 임신 여부와 주차, 증상, 기존 질환, 현재 복용 중인 약·영양제를 알려주세요. DUR은 지정된 성분 등의 사용 주의 정보를 확인하는 데 도움이 되지만, 조회 결과에 경고가 없다고 안전이 보장되는 것은 아닙니다. 최종 복용 여부는 전문가와 상담하세요.",
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
        dateModified: "2026-10-23",
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
  return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    임산부 건강 가이드
                </span>
                <p className="city-eyebrow">HEALTH JOURNAL / ARTICLE</p>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    임신 중 아플 때, 무조건 참는 게 정답일까요?
                </h1>
                <p className="text-lg text-gray-600">
                    증상이 있으면 혼자 판단하지 말고 상담하세요. <br className="hidden sm:block" />
                    약국과 진료실에서 어떤 정보를 알려야 하는지 정리했습니다.
                </p>
            </div>

            <section className="city-card border bg-white p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이 가이드가 필요한 순간</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    임신과 수유 기간에는 몸이 평소와 달리 반응하는 경우가 많아, 감기 한 번에도 어떤 약을 선택해야 할지 막막할 수 있습니다.
                    제품 이름만으로 임신·수유 중 사용 가능 여부를 판단하기 어렵습니다.
                    이 가이드는 임산부·수유부가 약국이나 병원에서 상담할 때 준비하면 좋은 정보를 정리했습니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        임신 중 감기·두통·변비가 생겨 어떤 상담이 필요한지 모를 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        수유 중 약을 처방받거나 복용 여부가 궁금할 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        DUR과 임부금기 정보의 의미가 궁금할 때
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        영양제·한약·건강기능식품이 태아에게 안전한지 알고 싶을 때
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 증상을 기록하고 상담하세요</h3>
                <p>
                    열이나 통증이 있으면 시작 시점과 증상의 변화, 함께 나타난 증상을 기록하세요.
                    열이 계속되거나 통증이 심해지면 산부인과에 연락해 진료가 필요한지 확인하세요.
                    반복 구토·설사, 복통, 질 출혈, 시야 변화가 있다면 지체하지 말고 진료를 받으세요.
                </p>

                <h3>2. 증상별로 알려야 할 정보</h3>
                <ul>
                    <li>
                        <strong>두통·발열:</strong> 임신 주차, 증상이 시작된 시점, 체온 변화, 복용한 약을 알리고 약사 또는 산부인과 의사와 상담하세요. 심한 두통이나 시야 변화가 있으면 진료를 받으세요.
                    </li>
                    <li>
                        <strong>변비:</strong> 증상이 지속된 기간과 현재 복용 중인 약·영양제를 알려주세요. 식사와 수분 섭취를 조절할 수 있는지 상담하고, 약이 필요하면 제품 선택과 복용 방법을 전문가와 결정하세요.
                    </li>
                    <li>
                        <strong>속쓰림·구토:</strong> 증상 빈도와 식사·수분 섭취 가능 여부를 알려주세요. 구토가 반복되거나 물도 마시기 어렵다면 산부인과에 연락하세요. 약을 임의로 추가하지 말고 상담하세요.
                    </li>
                </ul>

                <h3>3. DUR 정보를 상담에 활용하기</h3>
                <p>
                    DUR은 의약품 사용 시 주의할 정보를 확인하는 서비스입니다. 식품의약품안전처 고시는 병용금기·임부금기 등 지정된 성분과 제형의 정보를 다룹니다.
                    모든 의약품에 임부금기 정보가 지정되는 것은 아니며, DUR 조회에서 경고가 없더라도 임신·수유 중 안전을 보장하지 않습니다.
                    제품명과 성분을 확인해 약사나 산부인과 의사에게 보여주고, 임신 주차와 현재 복용 중인 약을 함께 알리세요.
                </p>

                <h3>4. 영양제도 함께 확인하세요</h3>
                <p>
                    영양제·건강기능식품·한약을 복용하고 있다면 제품과 성분표를 진료실이나 약국에 가져가세요.
                    여러 제품의 성분이 겹칠 수 있으므로 필요한 종류와 양을 산부인과 의사나 약사와 상의하세요.
                </p>
                <Link
                    href="/wiki"
                    className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-brand-700 hover:underline"
                >
                    약국오늘 영양제 위키에서 제품 정보 확인하기 →
                </Link>

                <hr />

                <div className="city-card bg-pink-50 p-5 border border-pink-100">
                    <h4 className="flex items-center text-pink-700 m-0 mb-2">
                        <span className="text-xl mr-2">👶</span>
                        행복한 출산을 응원합니다
                    </h4>
                    <p className="m-0 text-gray-700">
                        작은 증상이라도 혼자 고민하지 마시고 전문가에게 문의하세요.
                    </p>
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">실전 시나리오</h2>
                <div className="space-y-3">
                    <div className="city-card border bg-white p-5 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 1</span>
                            <h3 className="text-base font-bold text-gray-900">임신 초기에 갑자기 열이 났을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            체온과 증상 시작 시점, 임신 주차를 기록해 산부인과에 연락하세요. 복통이나 질 출혈이 동반되거나 상태가 악화되면 지체하지 말고 진료를 받으세요. 약 복용 여부와 방법은 진료 시 확인하세요.
                        </p>
                    </div>
                    <div className="city-card border bg-white p-5 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 2</span>
                            <h3 className="text-base font-bold text-gray-900">모유 수유 중 유선염으로 항생제를 처방받았을 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            처방 의사와 조제 약사에게 현재 수유 중임을 알리고, 처방받은 약의 사용 여부와 수유에 관한 주의사항을 확인하세요. 임의로 약이나 수유를 중단하지 말고 궁금한 점을 다시 문의하세요.
                        </p>
                    </div>
                    <div className="city-card border bg-white p-5 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">상황 3</span>
                            <h3 className="text-base font-bold text-gray-900">심야에 갑작스러운 심한 속쓰림과 구역이 올 때</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            갑자기 심한 증상이 생기거나 계속되면 약국 방문을 기다리지 말고 산부인과 또는 응급의료기관에 즉시 연락해 진료를 받으세요.
                        </p>
                    </div>
                </div>
            </section>

            <section className="city-card border bg-white p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">자료와 검토 상태</h2>
                <p className="text-sm text-gray-700">2026-10-23 문구 수정. 전문가 검토 미완료. 이 글은 개별 의약품의 복용 가능 여부를 판정하지 않습니다.</p>
                <ul className="list-disc pl-5 text-sm text-brand-700 space-y-1">
                    <li><a href="https://mfds.go.kr/brd/m_211/view.do?seq=14981" className="hover:underline">식품의약품안전처: 의약품 병용금기 성분 등의 지정에 관한 규정 (2026-52호)</a></li>
                    <li><a href="https://www.hira.or.kr/ra/medi/form.do?pgmid=HIRAA030029000000" className="hover:underline">건강보험심사평가원: 의약품 안전사용 서비스 (DUR) 국민 체험관</a></li>
                    <li><a href="https://nedrug.mfds.go.kr/pbp/CCBAJ01/getList" className="hover:underline">의약품안전나라: DUR 성분 고시 조회</a></li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="city-card border bg-gray-50 p-5 space-y-2">
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

            <section className="city-card border bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link href="/blog/kids-fever-medicine-comparison" className="city-card border border-white bg-white p-4 hover:border-brand-200 transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">소아 발열 약 비교 가이드</p>
                        <p className="text-xs text-gray-500 mt-1">아이 해열제 기준</p>
                    </Link>
                    <Link href="/blog/pharmacy-visit-checklist-3" className="city-card border border-white bg-white p-4 hover:border-brand-200 transition-all">
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">약국 방문 전 확인 3가지</p>
                        <p className="text-xs text-gray-500 mt-1">방문 전 체크리스트</p>
                    </Link>
                </div>
            </section>

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

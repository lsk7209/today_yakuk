import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";

const metaTitle =
    "유산균(프로바이오틱스) 선택 가이드: 균주 수보다 균주 종류가 중요한 이유 | 약국오늘";
const metaDescription =
    "프로바이오틱스 제품의 CFU 수치, 균주 종류(락토바실러스 vs 비피도박테리움), 장용정 코팅 여부, 냉장 보관 필요성 등 선택 기준을 정리했습니다.";

const faqs = [
    {
        q: "유산균은 언제 먹어야 가장 효과적인가요?",
        a: "위산이 가장 적게 분비되는 식전 30분 또는 공복이 이상적이라는 의견과, 위산 환경이 완화된 식후 30분이 낫다는 의견이 공존합니다. 장용정 코팅 제품이라면 식사 시간에 크게 구애받지 않아도 됩니다. 중요한 것은 매일 같은 시간에 꾸준히 복용하는 것입니다.",
    },
    {
        q: "항생제를 복용하면서 유산균도 함께 먹어도 되나요?",
        a: "항생제는 유해균뿐 아니라 유익균도 함께 억제합니다. 항생제와 유산균을 동시에 복용하면 항생제가 유산균을 죽일 수 있으므로 최소 2시간 이상 간격을 두고 복용하세요. 항생제 복용 기간 내내, 그리고 완료 후 1~2주 더 복용하면 장내 균형 회복에 도움이 됩니다.",
    },
    {
        q: "변비와 설사 모두에 유산균이 도움이 되나요?",
        a: "네, 유산균은 장내 환경을 정상화하는 방향으로 작용하기 때문에 변비와 설사 모두에 긍정적인 영향을 줄 수 있습니다. 다만 변비에는 비피도박테리움 계열이, 설사·과민성 장증후군에는 락토바실러스 람노서스(LGG) 같은 균주가 연구 근거가 풍부합니다. 본인 증상에 맞는 균주가 포함된 제품을 선택하는 것이 중요합니다.",
    },
];

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/probiotics-selection-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/probiotics-selection-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/probiotics-selection-guide",
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
            {
                "@type": "ListItem",
                position: 3,
                name: "유산균 선택 가이드",
                item: "https://todaypharm.kr/blog/probiotics-selection-guide",
            },
        ],
    };

    const howToJsonLd = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "유산균 선택 4단계",
        description: metaDescription,
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "목적 파악",
                text: "장 건강 개선, 항생제 복용 후 회복, 면역력 강화, 아이용 등 목적을 먼저 정하세요. 목적에 따라 최적 균주가 달라집니다.",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "균주 확인",
                text: "락토바실러스는 장 건강·설사 억제, 비피도박테리움은 변비 개선·영아에게 적합합니다. 제품 라벨에서 균주명을 확인하세요.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "CFU 확인",
                text: "100억 CFU가 무조건 좋은 것은 아닙니다. 10억~50억 CFU도 연구 근거가 충분하며, 균주 적합성이 더 중요합니다.",
            },
            {
                "@type": "HowToStep",
                position: 4,
                name: "보관법 확인",
                text: "냉장 보관 균주인지 상온 안정 균주인지 구분하세요. 냉장 균주를 상온에 방치하면 균이 죽어 효과가 없어질 수 있습니다.",
            },
        ],
    };

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    영양제 선택 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    유산균(프로바이오틱스) 선택 가이드
                </h1>
                <p className="text-lg text-gray-600">
                    균주 수보다 균주 종류가 중요한 이유, 핵심만 정리했습니다.
                </p>
            </div>

            <AdSlotTop />

            <section className="rounded-2xl border border-gray-50 bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900">프로바이오틱스가 필요한 상황</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                    장내 유익균이 줄어들거나 균형이 깨지면 소화 불량, 변비, 설사, 면역력 저하, 피부 트러블
                    등 다양한 증상이 나타납니다. 특히 항생제를 복용한 후에는 유해균과 함께 유익균도
                    대거 사멸하므로 장내 환경 복원이 필요합니다. 과민성 장증후군(IBS), 잦은 설사나 변비,
                    면역력이 낮아진 시기에도 프로바이오틱스 보충이 도움이 됩니다.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        항생제 복용 중이거나 복용 후 장 컨디션 회복이 필요한 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        과민성 장증후군, 변비, 설사가 잦은 분
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="text-brand-600 font-bold mt-0.5 shrink-0">✓</span>
                        면역력 강화 또는 영아·어린이 장 건강을 챙기고 싶은 분
                    </li>
                </ul>
            </section>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 균주 선택 기준: 목적별로 다르다</h3>
                <p>
                    유산균 제품의 핵심은 CFU(균 수) 숫자가 아니라 어떤 균주가 들어있느냐입니다.
                    락토바실러스(Lactobacillus) 계열은 소장에서 주로 활동하며 설사 억제, 유당 불내증 완화,
                    질 건강 유지에 효과적입니다. 비피도박테리움(Bifidobacterium) 계열은 대장에서 주로
                    활동하며 변비 개선, 영아·아동 장 건강, 면역 조절에 연구 근거가 풍부합니다.
                </p>
                <p>
                    예를 들어 락토바실러스 람노서스 GG(LGG)는 항생제 관련 설사 예방에 가장 많은 임상
                    연구가 축적된 균주입니다. 반면 비피도박테리움 롱검은 변비가 있는 어르신과 영아에게
                    주로 권장됩니다. 제품 라벨에서 단순히 &ldquo;유산균 복합 균주&rdquo;가 아닌 구체적인
                    균주명(속·종·균주 번호)이 표기된 제품을 선택하세요.
                </p>

                <h3>2. CFU 수치 해석법: 100억이 항상 좋은 게 아닌 이유</h3>
                <p>
                    CFU(Colony Forming Unit)는 살아있는 균의 수를 나타냅니다. 시중에는 100억~1,000억
                    CFU를 강조한 제품들이 많지만, 균의 수보다 균의 생존율과 균주 적합성이 더 중요합니다.
                    위산과 담즙산을 통과해 장에 도달하는 균의 비율이 제품마다 크게 다르기 때문입니다.
                </p>
                <p>
                    실제 임상 연구에서 10억~50억 CFU의 적합한 균주가 100억 CFU의 부적합한 균주보다
                    훨씬 효과적인 경우가 많습니다. 장용정(enteric coated) 코팅 제품이라면 낮은 CFU로도
                    장까지 살아서 도달하는 비율이 높아 효율적입니다.
                </p>

                <h3>3. 장용정 vs 일반 캡슐</h3>
                <p>
                    일반 캡슐은 위에서 바로 녹기 때문에 강한 위산 환경에서 균이 죽을 수 있습니다.
                    장용정(enteric coated)은 위산에 녹지 않는 특수 코팅으로 소장까지 균을 보호해
                    생존율을 높입니다. 위산 분비가 많은 분, 위장이 약한 분, 또는 더 높은 효율을 원한다면
                    장용정 코팅 제품을 선택하세요. 단, 장용정도 제조사의 코팅 기술 수준에 따라 품질
                    차이가 있습니다.
                </p>

                <h3>4. 보관법: 냉장 vs 상온 균주 구분</h3>
                <ul>
                    <li>
                        <strong>냉장 보관 균주:</strong> 살아있는 상태로 유지하려면 냉장(2~8도) 보관이
                        필수입니다. 구매 후 상온에 방치하면 균이 사멸해 효과가 사라질 수 있습니다. 약국
                        냉장 진열대에서 판매되는 제품이 여기에 해당합니다.
                    </li>
                    <li>
                        <strong>상온 안정 균주:</strong> 동결건조 기술로 처리된 균주는 상온에서도 안정성이
                        유지됩니다. 여행 중이거나 냉장 보관이 어려운 환경에서 편리하게 복용할 수 있습니다.
                    </li>
                </ul>

                <h3>5. 유산균 선택 4단계</h3>
                <ol>
                    <li>
                        <strong>목적 파악:</strong> 변비·설사·항생제 후 회복·면역력 중 어떤 목적인지
                        먼저 정하세요.
                    </li>
                    <li>
                        <strong>균주 확인:</strong> 라벨에서 구체적인 균주명이 표기된 제품을 고르세요.
                        단순 &ldquo;혼합 유산균&rdquo; 표기만 있는 제품은 균주 출처가 불명확할 수 있습니다.
                    </li>
                    <li>
                        <strong>CFU 확인:</strong> 10억~50억 CFU도 충분합니다. 장용정 코팅 여부를 함께
                        확인하세요.
                    </li>
                    <li>
                        <strong>보관법 확인:</strong> 냉장 보관 제품이라면 구매 후 즉시 냉장고에
                        넣으세요.
                    </li>
                </ol>

                <hr />

                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <h4 className="text-green-700 m-0 mb-2">프로바이오틱스 제품 정보</h4>
                    <p className="m-0 text-gray-700">
                        균주별 제품 비교 정보가 궁금하다면{" "}
                        <Link
                            href="/wiki?category=probiotics"
                            className="text-brand-600 underline hover:text-brand-700"
                        >
                            프로바이오틱스 제품 위키
                        </Link>
                        에서 확인하세요.
                    </p>
                </div>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">자주 묻는 질문</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-2"
                        >
                            <p className="text-sm font-bold text-gray-900">Q. {faq.q}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8 mt-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">프로바이오틱스 제품 정보</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            균주별·목적별 제품 비교와 약사 추천 정보를 확인하세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/wiki?category=probiotics"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            유산균 제품 보기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">관련 가이드</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/blog/omega3-selection-guide"
                        className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all"
                    >
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">
                            오메가3 선택 가이드
                        </p>
                        <p className="text-xs text-gray-500 mt-1">알티지형 vs 에틸에스텔형</p>
                    </Link>
                    <Link
                        href="/blog/vitamin-d-deficiency-guide"
                        className="rounded-xl border border-white bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all"
                    >
                        <p className="text-sm font-bold text-gray-900 hover:text-brand-700">
                            비타민D 결핍 신호 7가지
                        </p>
                        <p className="text-xs text-gray-500 mt-1">결핍 진단과 보충 방법</p>
                    </Link>
                </div>
            </section>

      <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">함께 읽으면 좋은 글</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/omega3-selection-guide", label: "오메가3 알티지 vs 에틸에스텔 가이드", desc: "형태별 흡수율 차이와 올바른 선택법" },
            { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
            { href: "/blog/magnesium-deficiency-guide", label: "마그네슘 부족 신호 6가지", desc: "장 건강과 관련 있는 마그네슘 결핍" },
            { href: "/wiki?category=probiotics", label: "유산균 제품 전체 목록 →", desc: "약국오늘 영양제 위키에서 확인" },
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
        </div>
    );
}

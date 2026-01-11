import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "약국에서 자주 묻는 질문 TOP10과 답변 | 오늘약국";
const metaDescription =
    "약 복용 시간, 술 마신 후 약 복용, 유효기간 지난 약 처리 등 약국에서 가장 많이 묻는 질문 10가지를 정리해 드립니다.";

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/pharmacy-faq-top10" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/pharmacy-faq-top10",
        type: "article",
        images: ["/og-image.svg"],
    },
};

const faqList = [
    {
        question: "1. 식후 30분에 꼭 맞춰 먹어야 하나요?",
        answer: "대부분의 약은 위장 장애 예방과 일정한 혈중 농도 유지를 위해 식후 복용을 권장합니다. 하지만 '식후 30분'을 너무 엄격하게 지키기보다, 식사 직후에 드셔도 무방한 경우가 많습니다. 단, 일부 당뇨약 등은 식전 복용이 필수일 수 있으니 약사의 지도를 따르세요."
    },
    {
        question: "2. 증상이 나아지면 약을 그만 먹어도 되나요?",
        answer: "증상 완화제(해열제, 진통제 등)는 증상이 없으면 중단해도 됩니다. 그러나 항생제나 만성질환 약은 임의로 중단하면 내성이 생기거나 증상이 악화될 수 있으므로 처방된 기간을 꼭 지켜야 합니다."
    },
    {
        question: "3. 술 마신 후에 약 먹어도 되나요?",
        answer: "음주 전후 약 복용은 간 손상을 유발할 수 있습니다. 특히 타이레놀 같은 아세트아미노펜 계열 진통제는 절대 피해야 합니다. 가급적 하루 정도 간격을 두는 것이 안전합니다."
    },
    {
        question: "4. 유통기한 지난 약, 그냥 먹어도 되나요?",
        answer: "효능이 떨어지거나 변질되어 부작용을 일으킬 수 있습니다. 아깝더라도 폐기하는 것이 원칙이며, 가까운 약국이나 보건소의 폐의약품 수거함에 버려주세요."
    },
    {
        question: "5. 다른 사람의 처방약을 먹어도 되나요?",
        answer: "절대 금물입니다. 같은 증상이라도 원인과 개인의 건강 상태(알러지, 기저질환 등)에 따라 처방이 달라야 합니다. 부작용 위험이 큽니다."
    },
    {
        question: "6. 알약을 갈아서 먹어도 되나요?",
        answer: "서방정(천천히 녹는 약)이나 장용정(장에서 녹는 약)은 갈아서 복용하면 효과가 변하거나 위장에 무리를 줄 수 있습니다. 삼키기 어렵다면 반드시 약사와 상담하여 제형을 변경하거나 가능 여부를 확인하세요."
    },
    {
        question: "7. 우유나 주스와 함께 약을 먹어도 되나요?",
        answer: "일부 항생제는 우유, 제산제와 함께 먹으면 흡수가 저해될 수 있고, 고혈압약 일부는 자몽 주스와 상극입니다. 가장 안전한 방법은 미지근한 물 한 컵과 함께 복용하는 것입니다."
    },
    {
        question: "8. 약 먹는 시간을 깜빡했는데 어떻게 하죠?",
        answer: "생각난 즉시 복용하는 것이 원칙이지만, 다음 복용 시간이 너무 가깝다면 건너뛰고 다음 분량만 드세요. 절대 두 번 분량을 한꺼번에 드시면 안 됩니다."
    },
    {
        question: "9. 임신 중인데 파스를 붙여도 되나요?",
        answer: "파스의 소염진통 성분이 태아에게 영향을 줄 수 있어 주의가 필요합니다. 임신 기간이나 파스 종류에 따라 다르므로, 반드시 약사나 의사와 상담 후 사용하세요."
    },
    {
        question: "10. 일반의약품과 건강기능식품 같이 먹어도 되나요?",
        answer: "성분이 겹쳐 과다 복용이 되거나 흡수를 방해할 수 있습니다. 복용 중인 모든 약과 영양제를 약사에게 알려주고 상담받는 것이 가장 좋습니다."
    }
];

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/pharmacy-faq-top10",
    });

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    약국 이용 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    약국에서 자주 묻는 질문 TOP10과 답변
                </h1>
                <p className="text-lg text-gray-600">
                    약사님에게 물어보고 싶었지만 깜빡했거나, 매번 헷갈리는 약 복용 상식! <br className="hidden sm:block" />
                    가장 많이 묻는 질문 10가지를 명쾌하게 정리해 드립니다.
                </p>
            </div>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <p>
                    약국을 방문하시는 분들이 가장 많이 궁금해하시는 질문들을 모았습니다. 올바른 약 복용은 건강 회복의 첫걸음입니다.
                    사소해 보이지만 중요한 약국 상식, 지금 바로 확인해 보세요.
                </p>

                <div className="my-8 space-y-6">
                    {faqList.map((item, index) => (
                        <div key={index} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="tex-xl font-bold text-gray-900 mb-3 flex items-start">
                                <span className="mr-2 text-brand-600 shrink-0">Q.</span>
                                {item.question.substring(item.question.indexOf(" ") + 1)}
                            </h3>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                <span className="font-bold text-gray-600 mr-2">A.</span>
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>

                <h3>마무리하며</h3>
                <p>
                    약에 대해 궁금한 점이 있다면 언제든 주저하지 말고 단골 약국 약사님께 물어보세요.
                    나의 건강 상태를 잘 아는 약사님과의 상담이 가장 안전하고 정확합니다.
                </p>
            </div>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">더 궁금한 점이 있으신가요?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            내 주변 약국을 찾아 직접 문의해 보세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/nearby"
                            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
                        >
                            내 주변 약국 찾기
                        </Link>
                        <Link
                            href="/blog"
                            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:bg-gray-50 transition-colors"
                        >
                            블로그 목록
                        </Link>
                    </div>
                </div>
            </section>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
        </div>
    );
}

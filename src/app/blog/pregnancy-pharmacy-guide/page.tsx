import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "임산부가 약국 이용 시 유의사항 | 오늘약국";
const metaDescription =
    "임신 중 감기, 변비, 두통이 생겼을 때 참아야만 할까요? 임산부가 안전하게 복용할 수 있는 약과 약국 방문 시 꼭 확인해야 할 체크리스트를 안내합니다.";

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
    const articleJsonLd = buildArticleJsonLd(
        metaTitle,
        metaDescription,
        "/blog/pregnancy-pharmacy-guide",
        "https://todayyakuk.com/og-image.svg",
        "2024-05-25T09:00:00+09:00",
        "2024-05-25T09:00:00+09:00"
    );

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

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. "무조건 참기"는 위험할 수 있습니다</h3>
                <p>
                    고열(38도 이상)이 지속되면 태아의 신경계 발달에 영향을 줄 수 있습니다.
                    따라서 열이 나거나 통증이 심할 때는 의사나 약사와 상담하여 안전한 약을 복용하는 것이 오히려 태아를 지키는 방법입니다.
                </p>

                <h3>2. 약국에서 가장 많이 찾는 증상별 안전 가이드</h3>
                <ul>
                    <li>
                        <strong>두통/발열:</strong> 아세트아미노펜(타이레놀 등)이 1차 선택 약제입니다. 비교적 안전하게 사용 가능하지만, 정량을 꼭 지켜야 합니다. 이부프로펜 등 소염진통제는 임신 시기에 따라 피해야 할 수 있으므로 주의하세요.
                    </li>
                    <li>
                        <strong>변비:</strong> 임신 중 철분제 복용으로 변비가 흔합니다. 푸룬주스나 식이섬유 섭취를 우선하고, 약이 필요하다면 장에서 흡수되지 않고 수분만 끌어들여 변을 무르게 하는 성분(락툴로오스 등)을 약사 상담 후 선택하세요.
                    </li>
                    <li>
                        <strong>속쓰림/입덧:</strong> 위산을 중화하는 제산제나 반하 성분의 입덧약 등 임산부가 복용 가능한 제품이 있습니다. 참지 말고 상담받으세요.
                    </li>
                </ul>

                <h3>3. 임산부 약물 안전 등급 (DUR) 확인하기</h3>
                <p>
                    모든 약에는 '임부 금기 등급'이 있습니다. 병원이나 약국 전산 시스템(DUR)에서 처방 조제 시 자동으로 걸러주지만, 일반의약품을 살 때는 약사님께 <strong>"저 임신 O주차예요"</strong>라고 먼저 말씀해 주시는 것이 가장 확실한 안전장치입니다.
                </p>

                <h3>4. 영양제 섭취, 과유불급!</h3>
                <p>
                    엽산, 철분, 비타민D는 필수지만, 비타민A가 과도하게 포함된 종합비타민은 기형 유발 위험이 있을 수 있습니다. 임산부 전용 영양제를 드시거나, 함량을 꼭 확인하세요.
                </p>

                <hr />

                <div className="bg-pink-50 p-5 rounded-xl border border-pink-100">
                    <h4 className="flex items-center text-pink-700 m-0 mb-2">
                        <span className="text-xl mr-2">👶</span>
                        행복한 출산을 응원합니다
                    </h4>
                    <p className="m-0 text-gray-700">
                        엄마가 건강하고 편안해야 아기도 건강합니다. 작은 증상이라도 혼자 고민하지 마시고 전문가의 도움을 받으세요.
                    </p>
                </div>
            </div>

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

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />
        </div>
    );
}

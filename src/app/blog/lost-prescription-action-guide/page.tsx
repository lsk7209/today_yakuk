import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "여행 중 처방전 분실 시 대처법 | 오늘약국";
const metaDescription =
    "즐거운 여행 중 복용하던 약을 잃어버렸다면? 처방전 재발급 방법, 약국에서의 대체 조제 가능 여부, 응급실 방문 기준 등 현실적인 대처법을 알려드립니다.";

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/lost-prescription-action-guide" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/lost-prescription-action-guide",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd(
        metaTitle,
        metaDescription,
        "/blog/lost-prescription-action-guide",
        "https://todayyakuk.com/og-image.svg",
        "2024-05-21T09:00:00+09:00",
        "2024-05-21T09:00:00+09:00"
    );

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    위기 탈출 가이드
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    여행 중 처방전(약) 분실 시 당황하지 않고 대처하는 법
                </h1>
                <p className="text-lg text-gray-600">
                    "혈압약인데 하루라도 안 먹으면 불안해요", "아이 항생제를 잃어버렸어요" <br className="hidden sm:block" />
                    낯선 곳에서 약을 잃어버렸을 때 가장 빠르게 해결하는 방법을 단계별로 안내합니다.
                </p>
            </div>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>1. 약국에서 바로 살 수 있는 약인지 확인하세요</h3>
                <p>
                    모든 약이 처방전이 필요한 것은 아닙니다. 만성질환 약이나 항생제가 아니라면, 증상을 설명하고
                    <strong>일반의약품</strong>으로 대체할 수 있는지 약사님께 문의하세요.
                    <br />
                    예: 가벼운 진통제, 소화제, 알러지약, 파스 등은 처방전 없이 구매 가능합니다.
                </p>

                <h3>2. 기존 다니던 병원에 전화하여 '처방전 전송' 요청하기</h3>
                <p>
                    가장 확실한 방법은 원래 진료받았던 병원에 연락하는 것입니다.
                    현재 위치 근처의 약국 팩스 번호를 병원에 알려주면, 병원에서 약국으로 처방전을 팩스 전송해 줄 수 있습니다.
                    (단, 병원 정책이나 의료법 규정에 따라 본인 확인 절차가 필요하거나 불가할 수도 있으니 반드시 전화로 먼저 문의하세요.)
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 not-prose text-sm text-yellow-800">
                    <strong>Tip:</strong> 평소 처방전이나 약 봉투를 사진 찍어두면, 약 이름과 용량을 정확히 알 수 있어 대체 약 상담이나 재처방 시 매우 큰 도움이 됩니다.
                </div>

                <h3>3. 근처 병원 방문하여 재처방 받기</h3>
                <p>
                    팩스 전송이 어렵다면 근처 병원을 방문해야 합니다. 이때 중요한 것은 <strong>'내가 먹던 약의 정보'</strong>입니다.
                    <ul>
                        <li>건강보험심사평가원 '내가 먹는 약! 한눈에' 서비스 조회</li>
                        <li>처방전 사진 또는 약 봉투 사진 제시</li>
                        <li>복용 중인 약의 정확한 이름이나 모양 설명</li>
                    </ul>
                    위 정보를 의사에게 제공하면 동일하거나 가장 유사한 약으로 빠르게 처방받을 수 있습니다.
                </p>

                <h3>4. 응급실 방문이 필요한 경우</h3>
                <p>
                    휴일이나 야간이라 문 연 병원이 없고, 생명과 직결된 약(심장약, 인슐린, 뇌전증 약 등)을 분실했다면 지체 없이 응급실로 가야 합니다.
                    응급실에서도 기본적으로 1~3일분의 비상 처방이 가능할 수 있습니다.
                </p>

                <h3>5. 대체 조제(동일 성분 조제)란?</h3>
                <p>
                    처방전을 가지고 있는데 해당 약국에 딱 그 제약회사의 약이 없는 경우, 성분과 함량이 동일한 다른 회사의 약으로 조제받을 수 있습니다.
                    이는 법적으로 허용된 안전한 절차이므로, 약사님이 대체 조제를 권하시면 안심하고 복용하셔도 됩니다.
                </p>

                <hr />

                <h3>요약: 여행 떠나기 전 3가지 체크리스트</h3>
                <ol>
                    <li>여분의 약을 2-3일치 넉넉하게 챙기기 (분산 보관 추천)</li>
                    <li>처방전이나 약 봉투 사진 찍어두기</li>
                    <li>만성질환자는 영문 처방전(해외여행 시) 준비하기</li>
                </ol>
            </div>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">근처 약국/병원 찾기가 급하신가요?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            지금 바로 내 주변 운영 중인 약국을 확인하세요.
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

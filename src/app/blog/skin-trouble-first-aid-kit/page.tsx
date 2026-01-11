import Link from "next/link";
import type { Metadata } from "next";
import { buildArticleJsonLd } from "@/lib/seo";

const metaTitle = "피부 트러블(벌레·햇빛) 응급 처치 키트 | 오늘약국";
const metaDescription =
    "여름철 야외활동이나 여행 시 필수! 벌레 물렸을 때, 햇빛 화상 입었을 때, 갑작스러운 알러지에 대비하는 약국 상비약 키트를 소개합니다.";

export const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: "/blog/skin-trouble-first-aid-kit" },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: "/blog/skin-trouble-first-aid-kit",
        type: "article",
        images: ["/og-image.svg"],
    },
};

export default function Page() {
    const articleJsonLd = buildArticleJsonLd({
        title: metaTitle,
        description: metaDescription,
        slug: "/blog/skin-trouble-first-aid-kit",
    });

    return (
        <div className="mx-auto max-w-3xl space-y-10 py-10">
            <div className="space-y-4 text-center">
                <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-600">
                    계절별 준비물
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                    캠핑·여행 필수! 피부 트러블 응급 처치 키트 구성하기
                </h1>
                <p className="text-lg text-gray-600">
                    모기에 퉁퉁 부었을 때, 햇빛에 화끈거릴 때 당황하지 마세요. <br className="hidden sm:block" />
                    약국에서 미리 준비하면 좋은 피부 상비약 리스트를 공개합니다.
                </p>
            </div>

            <div className="prose prose-lg prose-brand mx-auto text-gray-700">
                <h3>🚨 CASE 1: 벌레에 물렸을 때 (모기, 개미 등)</h3>
                <ul>
                    <li>
                        <strong>바르는 항히스타민제/소염제:</strong> 물린 직후 가려움과 붓기를 가라앉힙니다. (예: 버물리, 써버쿨 등)
                        <br />
                        <span className="text-sm text-gray-500">* 아이용은 자극이 적은 키즈 전용 제품을 추천합니다.</span>
                    </li>
                    <li>
                        <strong>스테로이드 연고 (약한 강도):</strong> 심하게 부어오르거나 알러지 반응이 있을 때 효과적입니다. (예: 리도맥스 등)
                        <br />
                        <span className="text-sm text-gray-500">* 긁어서 상처가 난 곳에는 항생제 연고를 먼저 발라야 합니다.</span>
                    </li>
                    <li>
                        <strong>모기 기피제:</strong> 예방이 최선! &apos;이카리딘&apos; 성분 함유 제품이 안전하고 효과적입니다.
                    </li>
                </ul>

                <h3>☀️ CASE 2: 햇빛에 화상을 입었을 때 (일광화상)</h3>
                <ul>
                    <li>
                        <strong>알로에 베라 겔:</strong> 냉장고에 넣어 차갑게 한 후 바르면 열감을 식히는 데 탁월합니다. 약은 아니지만 필수품입니다.
                    </li>
                    <li>
                        <strong>화상 연고 (덱스판테놀, 구아이아줄렌):</strong> 피부 재생을 돕고 염증을 완화합니다. (예: 비판텐, 아즈렌 등)
                    </li>
                    <li>
                        <strong>소염진통제 (먹는 약):</strong> 화끈거림과 통증이 너무 심하다면 이부프로펜 등 진통제를 복용하는 것이 도움이 됩니다.
                    </li>
                </ul>

                <h3>🌿 CASE 3: 풀독, 알 수 없는 두드러기</h3>
                <ul>
                    <li>
                        <strong>먹는 항히스타민제:</strong> 전신에 두드러기가 나거나 가려움이 멈추지 않을 때 가장 빠른 해결책입니다. (예: 지르텍, 클라리틴 등)
                        <br />
                        <span className="text-sm text-gray-500">* 졸음이 올 수 있으니 운전 전에는 주의하세요.</span>
                    </li>
                    <li>
                        <strong>칼라민 로션:</strong> 진물이나거나 가려운 부위에 바르면 쿨링 효과와 진정 효과가 있습니다.
                    </li>
                </ul>

                <hr />

                <h3>💡 팁: 약국에서 이렇게 말씀하세요</h3>
                <p className="bg-gray-50 p-4 rounded-lg">
                    &quot;주말에 캠핑 가는데, 아이랑 같이 쓸 수 있는 순한 벌레약이랑 화상 연고 주세요.&quot;
                    <br />
                    &quot;제가 모기에 물리면 퉁퉁 붓는 알러지가 있는데, 먹는 약도 같이 챙겨주세요.&quot;
                </p>
            </div>

            <section className="rounded-2xl bg-brand-50 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">여행 전 약국 들르는 것을 깜빡하셨나요?</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            목적지 근처나 가는 길에 있는 약국을 미리 찾아보세요.
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

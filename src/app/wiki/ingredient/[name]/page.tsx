import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIngredientBySlug } from "@/lib/data/pharmacies";
import { getSiteUrl } from "@/lib/site-url";
import { safeJsonStringify } from "@/components/seo/json-ld";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ name: string }>;
}): Promise<Metadata> {
    const { name } = await params;
    const ingredient = await getIngredientBySlug(name);

    if (!ingredient) {
        return {
            title: "성분을 찾을 수 없습니다",
            description: "요청하신 성분 정보를 찾을 수 없습니다.",
            robots: { index: false, follow: false },
        };
    }

    const canonicalPath = `/wiki/ingredient/${encodeURIComponent(name)}`;

    return {
        title: `${ingredient.name} - 성분 정보`,
        description: ingredient.summary || `${ingredient.name}의 상세 정보를 확인하세요.`,
        alternates: { canonical: canonicalPath },
        openGraph: {
            title: `${ingredient.name} 성분 백과`,
            description: ingredient.summary || `${ingredient.name}의 상세 정보를 확인하세요.`,
            url: canonicalPath,
        },
    };
}

export default async function IngredientDetailPage({
    params,
}: {
    params: Promise<{ name: string }>;
}) {
    const { name } = await params;
    const ingredient = await getIngredientBySlug(name);

    if (!ingredient) {
        notFound();
    }

    const siteUrl = getSiteUrl();
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "영양제 위키", item: `${siteUrl}/wiki` },
            { "@type": "ListItem", position: 3, name: ingredient.name, item: `${siteUrl}/wiki/ingredient/${name}` },
        ],
    };

    return (
        <div className="container py-8 max-w-4xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbLd) }}
            />
            {/* Breadcrumb */}
            <nav className="text-sm text-[var(--muted)] mb-6">
                <Link href="/wiki" className="hover:text-brand-700">
                    영양제 정보
                </Link>
                <span className="mx-2">/</span>
                <span>성분</span>
                <span className="mx-2">/</span>
                <span>{ingredient.name}</span>
            </nav>

            {/* Header */}
            <div className="mb-8 pb-8 border-b border-[var(--border)]">
                <h1 className="text-4xl font-bold mb-4">{ingredient.name}</h1>
                <div className="flex flex-wrap gap-2">
                    {(ingredient.tags || []).map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-brand-50 text-brand-700 text-sm rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">📖 3줄 요약</h2>
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-gray-800 leading-relaxed">{ingredient.summary || "정보가 없습니다."}</p>
                </div>
            </section>

            {/* Daily Value */}
            {ingredient.daily_value_guideline && (
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">💊 권장 섭취량</h2>
                    <div className="p-6 bg-white border border-[var(--border)] rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="text-center flex-1 p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-[var(--muted)] mb-1">최소</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {ingredient.daily_value_guideline.min}
                                    {ingredient.daily_value_guideline.unit}
                                </p>
                            </div>
                            <span className="text-2xl text-[var(--muted)]">~</span>
                            <div className="text-center flex-1 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-[var(--muted)] mb-1">최대</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {ingredient.daily_value_guideline.max}
                                    {ingredient.daily_value_guideline.unit}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Symptoms Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Deficiency */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">⚠️ 부족하면?</h2>
                    <div className="p-6 bg-red-50 border border-red-100 rounded-xl">
                        <ul className="space-y-2">
                            {(ingredient.deficiency_symptoms || []).map((symptom, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-red-900">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>{symptom}</span>
                                </li>
                            ))}
                            {(!ingredient.deficiency_symptoms || ingredient.deficiency_symptoms.length === 0) && (
                                <li className="text-red-900">정보가 없습니다.</li>
                            )}
                        </ul>
                    </div>
                </section>

                {/* Excess */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">🚨 과하면?</h2>
                    <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-xl">
                        <ul className="space-y-2">
                            {(ingredient.excess_symptoms || []).map((symptom, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-yellow-900">
                                    <span className="text-yellow-600 mt-1">•</span>
                                    <span>{symptom}</span>
                                </li>
                            ))}
                            {(!ingredient.excess_symptoms || ingredient.excess_symptoms.length === 0) && (
                                <li className="text-yellow-900">정보가 없습니다.</li>
                            )}
                        </ul>
                    </div>
                </section>
            </div>

            {/* CTA */}
            <section className="mt-12 p-6 bg-gray-50 rounded-xl border border-[var(--border)] text-center">
                <p className="text-sm text-[var(--muted)] mb-4">
                    이 정보는 식약처 공공데이터를 기반으로 제공되며, 의학적 조언을 대신할
                    수 없습니다.
                </p>
                <Link
                    href="/nearby"
                    data-analytics-event="content_to_nearby_click"
                    data-source-surface="wiki_ingredient"
                    data-cta-placement="article_bottom"
                    className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                    가까운 약국 찾기
                </Link>
            </section>
        </div>
    );
}

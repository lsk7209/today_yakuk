import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSupplementById, Supplement } from "@/lib/data/pharmacies";
import { getSiteUrl } from "@/lib/site-url";
import { ChevronLeft, ArrowLeftRight } from "lucide-react";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

interface ComparePageProps {
    params: { compareId: string };
}

export async function generateMetadata({
    params,
}: ComparePageProps): Promise<Metadata> {
    const ids = params.compareId.split('_vs_');
    if (ids.length !== 2) {
        return {
            title: "비교할 제품을 찾을 수 없습니다 | 약국오늘",
            robots: { index: false, follow: false },
        };
    }

    const [product1, product2] = await Promise.all([
        getSupplementById(ids[0]),
        getSupplementById(ids[1]),
    ]);

    if (!product1 || !product2) {
        return {
            title: "비교할 제품을 찾을 수 없습니다 | 약국오늘",
            robots: { index: false, follow: false },
        };
    }

    const siteUrl = getSiteUrl();
    return {
        title: `${product1.name} vs ${product2.name} 비교 - 약국오늘`,
        description: `${product1.name}와 ${product2.name}의 영양 성분, 첨가물, 가격 등을 한눈에 비교하세요.`,
        alternates: {
            canonical: `${siteUrl}/wiki/vs/${params.compareId}`,
        },
    };
}

export default async function CompareProductsPage({
    params,
}: ComparePageProps) {
    const ids = params.compareId.split('_vs_');
    if (ids.length !== 2) {
        notFound();
    }

    const [product1, product2] = await Promise.all([
        getSupplementById(ids[0]),
        getSupplementById(ids[1]),
    ]);

    if (!product1 || !product2) {
        notFound();
    }

    const allNutrients = Array.from(
        new Set([
            ...(product1.nutrition_facts || []).map(n => n.name),
            ...(product2.nutrition_facts || []).map(n => n.name),
        ])
    );

    const siteUrl = getSiteUrl();
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "영양제 위키", item: `${siteUrl}/wiki` },
            { "@type": "ListItem", position: 3, name: `${product1.name} vs ${product2.name}`, item: `${siteUrl}/wiki/vs/${params.compareId}` },
        ],
    };

    return (
        <div className="container py-8 max-w-6xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            {/* Breadcrumb */}
            <Link href="/wiki" className="inline-flex items-center text-sm text-brand-600 hover:text-brand-700 mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" />
                영양제 위키로 돌아가기
            </Link>

            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center gap-4 mb-4">
                    <ArrowLeftRight className="w-8 h-8 text-brand-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">제품 비교</h1>
                <p className="text-[var(--muted)]">두 제품의 영양 성분과 특징을 비교해보세요</p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Product 1 */}
                <ProductCard product={product1} />

                {/* Product 2 */}
                <ProductCard product={product2} />
            </div>

            {/* Nutrient Comparison Table */}
            <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 bg-gray-50 border-b border-[var(--border)]">
                    <h2 className="text-xl font-bold">영양 성분 비교</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold">성분명</th>
                                <th className="py-3 px-4 text-right font-semibold">{product1.name}</th>
                                <th className="py-3 px-4 text-right font-semibold">{product2.name}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allNutrients.map((nutrientName, index) => {
                                const n1 = product1.nutrition_facts?.find(n => n.name === nutrientName);
                                const n2 = product2.nutrition_facts?.find(n => n.name === nutrientName);

                                const amount1 = n1 ? `${n1.amount}${n1.unit}` : '-';
                                const amount2 = n2 ? `${n2.amount}${n2.unit}` : '-';

                                const isDifferent = amount1 !== amount2;

                                return (
                                    <tr key={index} className={isDifferent ? 'bg-yellow-50' : ''}>
                                        <td className="py-3 px-4 font-medium">{nutrientName}</td>
                                        <td className="py-3 px-4 text-right">{amount1}</td>
                                        <td className="py-3 px-4 text-right">{amount2}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: Supplement }) {
    return (
        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
                {product.image_url ? (
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain rounded-lg border border-gray-200"
                        />
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-3xl">💊</span>
                    </div>
                )}
                <div className="flex-1">
                    <Link href={`/wiki/product/${product.id}`} className="text-lg font-bold hover:text-brand-600 transition-colors">
                        {product.name}
                    </Link>
                    <p className="text-sm text-[var(--muted)] mt-1">{product.manufacturer}</p>
                </div>
            </div>

            {product.ai_summary && (
                <p className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded-lg">
                    {product.ai_summary}
                </p>
            )}
        </div>
    );
}

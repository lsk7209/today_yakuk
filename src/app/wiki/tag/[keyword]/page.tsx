import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { Tag, ChevronLeft } from "lucide-react";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

interface Supplement {
    id: string;
    name: string;
    manufacturer: string | null;
    image_url: string | null;
    ai_summary: string | null;
    tags: string[] | null;
}

interface TagPageProps {
    params: { keyword: string };
    searchParams: { page?: string };
}

const ITEMS_PER_PAGE = 12;

export async function generateMetadata({
    params,
}: TagPageProps): Promise<Metadata> {
    const keyword = decodeURIComponent(params.keyword);
    const siteUrl = getSiteUrl();

    return {
        title: `${keyword} 관련 영양제 - 오늘약국`,
        description: `${keyword}에 도움이 되는 영양제와 건강기능식품을 찾아보세요.`,
        alternates: {
            canonical: `${siteUrl}/wiki/tag/${params.keyword}`,
        },
    };
}

export default async function TagPage({
    params,
    searchParams,
}: TagPageProps) {
    const keyword = decodeURIComponent(params.keyword);
    const page = parseInt(searchParams.page || '1', 10);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const supabase = getSupabaseServerClient();

    // Get products with this tag
    const { data: products, error, count } = await supabase
        .from('supplements')
        .select('id, name, manufacturer, image_url, ai_summary, tags', { count: 'exact' })
        .contains('tags', [keyword])
        .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
        console.error('Tag page fetch error:', error);
        notFound();
    }

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

    return (
        <div className="container py-8 max-w-6xl">
            {/* Breadcrumb */}
            <Link href="/wiki" className="inline-flex items-center text-sm text-brand-600 hover:text-brand-700 mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" />
                영양제 위키로 돌아가기
            </Link>

            {/* Header */}
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 text-brand-600 mb-4">
                    <Tag className="w-6 h-6" />
                    <span className="text-sm font-medium uppercase tracking-wide">태그</span>
                </div>
                <h1 className="text-4xl font-bold mb-3">{keyword}</h1>
                <p className="text-lg text-[var(--muted)]">
                    총 <span className="font-semibold text-brand-600">{count || 0}</span>개의 제품
                </p>
            </div>

            {/* Product Grid */}
            {!products || products.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-lg text-[var(--muted)]">이 태그에 해당하는 제품이 없습니다.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {products.map((product: Supplement) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            {page > 1 && (
                                <Link
                                    href={`/wiki/tag/${params.keyword}?page=${page - 1}`}
                                    className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    이전
                                </Link>
                            )}
                            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg font-medium">
                                {page} / {totalPages}
                            </div>
                            {page < totalPages && (
                                <Link
                                    href={`/wiki/tag/${params.keyword}?page=${page + 1}`}
                                    className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    다음
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ProductCard({ product }: { product: Supplement }) {
    return (
        <Link
            href={`/wiki/product/${product.id}`}
            className="group bg-white border border-[var(--border)] rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1"
        >
            <div className="flex items-start gap-4 mb-4">
                {product.image_url ? (
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain rounded-lg border border-gray-200"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💊</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                        {product.name}
                    </h3>
                    {product.manufacturer && (
                        <p className="text-xs text-[var(--muted)]">{product.manufacturer}</p>
                    )}
                </div>
            </div>

            {product.ai_summary && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {product.ai_summary}
                </p>
            )}

            {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {product.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}

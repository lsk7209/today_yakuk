import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSiteUrl } from "@/lib/site-url";
import { Tag } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

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

    const breadcrumbItems = [
        { label: "영양제 위키", href: "/wiki" },
        { label: `#${keyword}` },
    ];

    return (
        <div className="container py-8 sm:py-12 max-w-6xl space-y-8">
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <header className="premium-card bg-gradient-to-br from-white to-brand-50/30 p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />

                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-black uppercase tracking-wider ring-1 ring-brand-200">
                        <Tag className="w-3.5 h-3.5" />
                        태그 검색 결과
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        {keyword}
                    </h1>
                    <p className="text-lg text-slate-600 font-medium">
                        총 <span className="text-brand-700 font-black">{count || 0}</span>개의 선별된 제품이 있습니다.
                    </p>
                </div>
            </header>

            {/* Product Grid */}
            {!products || products.length === 0 ? (
                <div className="premium-card bg-white py-24 rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="text-5xl mb-6">🔍</div>
                    <p className="text-xl text-slate-400 font-bold italic">&quot;{keyword}&quot; 태그에 해당하는 제품을 준비 중입니다.</p>
                    <Link href="/wiki" className="mt-8 inline-block text-brand-600 font-black hover:underline">
                        전체 위키 목록 보기 →
                    </Link>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                </div>
            )}
        </div>
    );
}

function ProductCard({ product }: { product: Supplement }) {
    return (
        <Link
            href={`/wiki/product/${product.id}`}
            className="group premium-card bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
        >
            <div className="flex items-start gap-4 mb-5">
                {product.image_url ? (
                    <div className="relative w-16 h-16 shrink-0 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden p-2">
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                        <span className="text-3xl">💊</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-tight mb-1 text-[1.1rem]">
                        {product.name}
                    </h3>
                    {product.manufacturer && (
                        <p className="text-xs text-slate-400 font-bold">{product.manufacturer}</p>
                    )}
                </div>
            </div>

            {product.ai_summary && (
                <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {product.ai_summary}
                </p>
            )}

            {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto border-t border-slate-50 pt-4">
                    {product.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[11px] font-black rounded-full group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}

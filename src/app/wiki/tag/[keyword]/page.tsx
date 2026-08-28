import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTursoClient, parseJson } from "@/lib/turso";
import { getSiteUrl } from "@/lib/site-url";
import { Tag } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { buildWikiProductPath } from "@/lib/wiki-slug";
import { safeJsonStringify } from "@/components/seo/json-ld";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

interface Supplement {
    id: string;
    name: string;
    manufacturer: string | null;
    image_url: string | null;
    tags: string[] | null;
}

interface TagPageProps {
    params: Promise<{ keyword: string }>;
    searchParams: Promise<{ page?: string }>;
}

const ITEMS_PER_PAGE = 12;

const TAG_SLUG_MAP: Record<string, string> = {
    "probiotics": "유산균",
    "vitamin-c": "비타민C",
    "omega3": "오메가3",
    "eye": "눈건강",
    "fatigue": "피로회복",
    "immune": "면역력",
};

export async function generateMetadata({
    params,
    searchParams,
}: TagPageProps): Promise<Metadata> {
    const [{ keyword: rawParamKeyword }, { page: pageParam }] = await Promise.all([params, searchParams]);
    const rawKeyword = decodeURIComponent(rawParamKeyword);
    const keyword = TAG_SLUG_MAP[rawKeyword] || rawKeyword;
    const siteUrl = getSiteUrl();
    const page = getPageNumber(pageParam);
    const canonicalPath = `/wiki/tag/${encodeURIComponent(rawKeyword)}${page > 1 ? `?page=${page}` : ""}`;

    return {
        title: `${keyword} 관련 영양제`,
        description: `${keyword} 태그로 분류된 건강기능식품의 공개 성분과 제품 정보를 확인하세요.`,
        alternates: {
            canonical: `${siteUrl}${canonicalPath}`,
        },
        robots: page > 1 ? { index: false, follow: true } : { index: true, follow: true },
    };
}

export default async function TagPage({
    params,
    searchParams,
}: TagPageProps) {
    const [{ keyword: rawParamKeyword }, { page: pageParam }] = await Promise.all([params, searchParams]);
    const rawKeyword = decodeURIComponent(rawParamKeyword);
    // 1. 매핑된 태그가 있다면 사용, 없다면 원래 키워드 사용 (한글 유입 고려)
    const keyword = TAG_SLUG_MAP[rawKeyword] || rawKeyword;

    // 2. UI 표시용 태그 (매핑된 경우 한글, 아니면 그대로)
    const displayKeyword = keyword;

    const siteUrl = getSiteUrl();
    const page = getPageNumber(pageParam);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // 3. Search for both slug (URL) and mapped keyword (Korean)
    // This handles both cases: data stored as "fatigue" and "피로회복"
    const searchTerms = Array.from(new Set([rawKeyword, keyword]));

    const db = getTursoClient();
    const inClause = searchTerms.map(() => "?").join(", ");

    let count: number;
    let productsRows: Record<string, unknown>[];
    try {
        const [countResult, dataResult] = await Promise.all([
            db.execute({
                sql: `SELECT COUNT(*) as cnt FROM supplements WHERE tags IS NOT NULL AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value IN (${inClause}))`,
                args: searchTerms,
            }),
            db.execute({
                sql: `SELECT id, name, manufacturer, image_url, tags FROM supplements WHERE tags IS NOT NULL AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value IN (${inClause})) LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`,
                args: searchTerms,
            }),
        ]);
        count = Number(countResult.rows[0]?.cnt ?? 0);
        productsRows = dataResult.rows as Record<string, unknown>[];
    } catch (e) {
        console.error('Tag page fetch error:', e);
        notFound();
    }

    const products = productsRows!.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        manufacturer: r.manufacturer as string | null,
        image_url: r.image_url as string | null,
        tags: parseJson(r.tags, null) as string[] | null,
    }));

    if (!count) notFound();
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    if (page > totalPages) notFound();

    const breadcrumbItems = [
        { label: "영양제 위키", href: "/wiki" },
        { label: `#${displayKeyword}` },
    ];

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "영양제 위키", item: `${siteUrl}/wiki` },
            { "@type": "ListItem", position: 3, name: `#${displayKeyword}`, item: `${siteUrl}/wiki/tag/${rawParamKeyword}` },
        ],
    };

    return (
        <div className="container py-8 sm:py-12 max-w-6xl space-y-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbLd) }}
            />
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
                        {displayKeyword}
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
                    <p className="text-xl text-slate-400 font-bold italic">&quot;{displayKeyword}&quot; 태그에 해당하는 제품을 준비 중입니다.</p>
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
                                    href={`/wiki/tag/${rawParamKeyword}?page=${page - 1}`}
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
                                    href={`/wiki/tag/${rawParamKeyword}?page=${page + 1}`}
                                    className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    다음
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Related Blog Posts by category */}
            {(() => {
                const CATEGORY_BLOGS: Record<string, { href: string; label: string; desc: string }[]> = {
                    "오메가3": [
                        { href: "/blog/omega3-selection-guide", label: "오메가3 알티지 vs 에틸에스텔 선택 가이드", desc: "흡수율·형태별 차이와 복용법 정리" },
                    ],
                    "omega3": [
                        { href: "/blog/omega3-selection-guide", label: "오메가3 알티지 vs 에틸에스텔 선택 가이드", desc: "흡수율·형태별 차이와 복용법 정리" },
                    ],
                    "유산균": [
                        { href: "/blog/probiotics-selection-guide", label: "유산균 균주 선택 가이드", desc: "목적별 균주 선택법과 CFU 해석" },
                    ],
                    "probiotics": [
                        { href: "/blog/probiotics-selection-guide", label: "유산균 균주 선택 가이드", desc: "목적별 균주 선택법과 CFU 해석" },
                    ],
                    "눈건강": [
                        { href: "/blog/lutein-astaxanthin-guide", label: "루테인 vs 아스타잔틴 눈 건강 비교", desc: "황반 보호·항산화력·병용 여부 정리" },
                    ],
                    "eye": [
                        { href: "/blog/lutein-astaxanthin-guide", label: "루테인 vs 아스타잔틴 눈 건강 비교", desc: "황반 보호·항산화력·병용 여부 정리" },
                    ],
                    "뼈": [
                        { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
                        { href: "/blog/magnesium-deficiency-guide", label: "마그네슘 부족 신호 6가지", desc: "형태별 흡수율과 올바른 복용법" },
                    ],
                    "bone": [
                        { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
                        { href: "/blog/magnesium-deficiency-guide", label: "마그네슘 부족 신호 6가지", desc: "형태별 흡수율과 올바른 복용법" },
                    ],
                    "면역력": [
                        { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
                    ],
                    "immune": [
                        { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "결핍 증상과 올바른 보충 방법" },
                    ],
                };
                const relatedPosts = CATEGORY_BLOGS[rawKeyword] || CATEGORY_BLOGS[keyword] || [];
                if (relatedPosts.length === 0) return null;
                return (
                    <section className="pt-6 border-t border-slate-100">
                        <h2 className="text-lg font-black text-slate-900 mb-4">관련 가이드</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {relatedPosts.map((post) => (
                                <Link
                                    key={post.href}
                                    href={post.href}
                                    className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md hover:border-brand-200 transition-all space-y-1"
                                >
                                    <p className="font-bold text-gray-900 text-sm">{post.label}</p>
                                    <p className="text-xs text-gray-500">{post.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })()}
        </div>
    );
}

function getPageNumber(pageParam?: string) {
    const value = Number.parseInt(pageParam || "1", 10);
    return Number.isFinite(value) && value >= 1 ? value : 1;
}

function ProductCard({ product }: { product: Supplement }) {
    return (
        <Link
            href={buildWikiProductPath(product)}
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

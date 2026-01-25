import { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { Search, Filter } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
    title: "영양제 정보",
    description: "식약처 공공데이터 기반 영양제 성분 정보와 객관적 분석을 제공합니다.",
    openGraph: {
        title: "영양제 정보 | 오늘약국",
        description: "건강기능식품 성분과 제품을 찾고, 객관적인 정보를 확인하세요.",
    },
};

// Revalidate every 24 hours
export const revalidate = 86400;

interface Supplement {
    id: string;
    name: string;
    manufacturer: string | null;
    image_url: string | null;
    ai_summary: string | null;
    tags: string[] | null;
}

const CATEGORIES = [
    { name: "전체", slug: "all", emoji: "✨" },
    { name: "유산균", slug: "probiotics", emoji: "🦠" },
    { name: "비타민C", slug: "vitamin-c", emoji: "🍊" },
    { name: "오메가3", slug: "omega3", emoji: "🐟" },
    { name: "눈건강", slug: "eye", emoji: "👁️" },
    { name: "피로회복", slug: "fatigue", emoji: "⚡" },
    { name: "면역력", slug: "immune", emoji: "🛡️" },
    { name: "뼈/치아", slug: "bone", emoji: "🦴" },
];

const ITEMS_PER_PAGE = 12;

const TAG_SLUG_MAP: Record<string, string> = {
    "probiotics": "유산균",
    "vitamin-c": "비타민C",
    "omega3": "오메가3",
    "eye": "눈건강",
    "fatigue": "피로회복",
    "immune": "면역력",
    "bone": "뼈",
};

interface WikiHomePageProps {
    searchParams: { category?: string; page?: string };
}

export default async function WikiHomePage({ searchParams }: WikiHomePageProps) {
    const currentCategory = searchParams.category || "all";
    const page = parseInt(searchParams.page || "1", 10);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const supabase = getSupabaseServerClient();

    let query = supabase
        .from("supplements")
        .select("id, name, manufacturer, image_url, ai_summary, tags", { count: "exact" });

    // Apply category filter if not "all"
    if (currentCategory !== "all") {
        const keyword = TAG_SLUG_MAP[currentCategory] || currentCategory;
        const searchTerms = Array.from(new Set([currentCategory, keyword]));
        query = query.or(`tags.cs.{${searchTerms.join(',')}}`);
    }

    const { data: products, count, error } = await query
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Wiki fetch error:", error);
    }

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

    return (
        <div className="container py-8 sm:py-12 max-w-6xl space-y-10">
            {/* Hero Section */}
            <div className="premium-card bg-gradient-to-br from-brand-600 to-brand-800 p-10 sm:p-16 rounded-[3rem] text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-400/20 rounded-full -translate-x-1/4 translate-y-1/4 blur-2xl" />

                <div className="relative z-10 space-y-4">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">영양제 위키</h1>
                    <p className="text-brand-50 text-lg sm:text-xl font-medium max-w-2xl mx-auto opacity-90 leading-relaxed">
                        식약처 공공데이터 기반 <span className="text-white font-bold underline decoration-brand-300 underline-offset-4">객관적 성분 분석</span>과 전문가 리포트를 통해 내 몸에 맞는 영양제를 찾아보세요.
                    </p>
                </div>
            </div>

            {/* Category Navigation & Search */}
            <div className="sticky top-20 z-30 space-y-4 bg-[var(--background)]/80 backdrop-blur-md py-4">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                    {CATEGORIES.map((cat) => {
                        const isActive = currentCategory === cat.slug;
                        return (
                            <Link
                                key={cat.slug}
                                href={cat.slug === "all" ? "/wiki" : `/wiki?category=${cat.slug}`}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap font-black text-sm transition-all shadow-sm ring-1 ${isActive
                                    ? "bg-brand-600 text-white ring-brand-600 scale-105"
                                    : "bg-white text-slate-500 ring-slate-100 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <span className="text-lg">{cat.emoji}</span>
                                {cat.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="찾으시는 제품명이나 성분을 검색하세요 (준비 중)"
                        className="w-full px-12 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-50 shadow-sm text-base font-medium"
                        disabled
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-md border border-slate-100">
                        SEARCH
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-brand-600" />
                        <h2 className="text-2xl font-black text-slate-900 capitalize">
                            {currentCategory === "all" ? "전체 목록" : CATEGORIES.find(c => c.slug === currentCategory)?.name}
                        </h2>
                        <span className="text-sm text-slate-400 font-bold ml-2">({count || 0}개)</span>
                    </div>
                </div>

                {!products || products.length === 0 ? (
                    <div className="premium-card bg-white py-32 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                        <div className="text-6xl mb-6">🔍</div>
                        <p className="text-xl text-slate-400 font-black italic">해당 카테고리의 제품을 준비 중입니다.</p>
                        <Link href="/wiki" className="mt-8 inline-block text-brand-600 font-black hover:underline">
                            전체 목록으로 돌아가기 →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-8">
                        {page > 1 && (
                            <Link
                                href={`/wiki?${currentCategory !== "all" ? `category=${currentCategory}&` : ""}page=${page - 1}`}
                                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm"
                            >
                                ←
                            </Link>
                        )}
                        <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black text-brand-700 shadow-sm">
                            {page} / {totalPages}
                        </div>
                        {page < totalPages && (
                            <Link
                                href={`/wiki?${currentCategory !== "all" ? `category=${currentCategory}&` : ""}page=${page + 1}`}
                                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm"
                            >
                                →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Info Section */}
            <div className="grid md:grid-cols-2 gap-8 pt-10">
                <div className="p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">📊</div>
                    <h3 className="text-xl font-black text-slate-900">식약처 데이터 기반</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        오늘약국의 모든 정보는 식품의약품안전처 건강기능식품 공공데이터를 바탕으로 가공되었습니다. 주관적인 광고보다는 팩트에 집중합니다.
                    </p>
                </div>
                <div className="p-8 bg-white border border-slate-50 rounded-[2.5rem] shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">🧪</div>
                    <h3 className="text-xl font-black text-slate-900">전문가 AI 리포트</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        전문 지식을 갖춘 AI가 복잡한 원재료와 성분 함량을 분석하여 이해하기 쉬운 리포트를 생성합니다. 섭취 전 필수로 확인하세요.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: Supplement }) {
    return (
        <Link
            href={`/wiki/product/${product.id}`}
            className="group bg-white border border-slate-50 rounded-[2.5rem] p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 flex flex-col h-full shadow-sm"
        >
            <div className="flex items-start gap-5 mb-6">
                <div className="relative w-20 h-20 shrink-0 bg-slate-50 rounded-[1.5rem] border border-slate-100 overflow-hidden p-3 group-hover:bg-brand-50 transition-colors duration-500">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-brand-500/10 to-transparent transition-opacity duration-500" />
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain group-hover:scale-125 transition-transform duration-700 ease-out p-2"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">💊</div>
                    )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-black text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight mb-2 text-lg">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400 font-bold truncate">{(product.manufacturer || "공시 데이터 없음")}</p>
                    </div>
                </div>
            </div>

            {product.ai_summary && (
                <div className="bg-slate-50/50 rounded-2xl p-4 mb-6 flex-1 group-hover:bg-brand-50/30 transition-colors">
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                        {product.ai_summary}
                    </p>
                </div>
            )}

            {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {product.tags.slice(0, 3).map((tag: string) => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-white border border-slate-100 text-slate-400 text-[10px] font-black rounded-xl group-hover:border-brand-200 group-hover:text-brand-600 transition-all"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}

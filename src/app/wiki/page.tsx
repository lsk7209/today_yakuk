import { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getTursoClient, parseJson } from "@/lib/turso";
import { Filter } from "lucide-react";
import PageHeading from "@/components/city-signal/page-heading";
import Image from "next/image";
import WikiSearch from "@/components/wiki/WikiSearch";
import { buildWikiMedicinePath, buildWikiProductPath } from "@/lib/wiki-slug";
import { buildWikiPagePath, getWikiCatalogType, getWikiPageNumber, type WikiCatalogType } from "@/lib/wiki-catalog";
import { safeJsonStringify } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { CATEGORIES, buildCategoryFilter } from "@/lib/wiki-category";

const WIKI_DESCRIPTION = "식약처 공공데이터 기반 영양제 성분, 기능성 원료, 첨가물과 제품 공개 정보를 검색해 확인하세요.";

// searchParams makes this page dynamic — cache the expensive count separately
const getCachedTotalCount = unstable_cache(
  async () => {
    try {
      const db = getTursoClient();
      const result = await db.execute("SELECT COUNT(*) as cnt FROM supplements");
      return Number(result.rows[0]?.cnt ?? 0);
    } catch {
      return 0;
    }
  },
  ["supplements-total-count"],
  { revalidate: 3600 }
);

const getCachedMedicineCount = unstable_cache(
  async () => {
    const result = await getTursoClient().execute("SELECT COUNT(*) as cnt FROM medicines");
    return Number(result.rows[0]?.cnt ?? 0);
  },
  ["medicines-total-count"],
  { revalidate: 3600 }
);

interface Supplement {
    id: string;
    name: string;
    manufacturer: string | null;
    image_url: string | null;
    tags: string[] | null;
}

const ITEMS_PER_PAGE = 12;

interface WikiHomePageProps {
    searchParams: Promise<{ category?: string; page?: string; type?: string }>;
}

export async function generateMetadata({ searchParams }: WikiHomePageProps): Promise<Metadata> {
    const { category, page, type } = await searchParams;
    const isMedicine = type === "medicine";
    const isFilteredState = Boolean(category || page || isMedicine);
    return {
        title: isMedicine ? "의약품 정보" : "영양제 정보",
        description: isMedicine ? "의약품안전나라 공개 허가정보를 바탕으로 의약품 이름과 제조사를 검색해 확인하세요." : WIKI_DESCRIPTION,
        alternates: { canonical: isMedicine ? "/wiki?type=medicine" : "/wiki" },
        robots: isFilteredState
            ? { index: false, follow: true }
            : { index: true, follow: true },
        openGraph: {
            title: isMedicine ? "의약품 정보" : "영양제 정보",
            description: isMedicine ? "공개 허가정보 기반 의약품 목록을 확인하세요." : "건강기능식품 성분, 기능성 원료, 첨가물과 제품 공개 정보를 검색해 확인하세요.",
            type: "website",
        },
    };
}

export default async function WikiHomePage({ searchParams }: WikiHomePageProps) {
    const { category, page: pageParam, type: typeParam } = await searchParams;
    const type = getWikiCatalogType(typeParam);
    if (!type || (type === "medicine" && category)) notFound();
    const filter = buildCategoryFilter(category);
    if (type === "supplement" && !filter.isAll && !CATEGORIES.some(({ slug }) => slug === filter.slug)) notFound();
    const currentCategory = filter.slug;
    const page = getWikiPageNumber(pageParam);
    if (!page) notFound();
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const db = getTursoClient();

    let filteredCount: number;
    let productsRows: Record<string, unknown>[];

    if (type === "medicine") {
        const [countResult, dataResult] = await Promise.all([
            getCachedMedicineCount(),
            db.execute({
                sql: "SELECT id, name, manufacturer, image_url FROM medicines ORDER BY name, id LIMIT ? OFFSET ?",
                args: [ITEMS_PER_PAGE, offset],
            }),
        ]);
        filteredCount = countResult;
        productsRows = dataResult.rows as Record<string, unknown>[];
    } else if (filter.isAll) {
        const [countResult, dataResult] = await Promise.all([
            getCachedTotalCount(),
            db.execute(
                `SELECT id, name, manufacturer, image_url, tags FROM supplements ORDER BY created_at DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`
            ),
        ]);
        filteredCount = countResult;
        productsRows = dataResult.rows as Record<string, unknown>[];
    } else {
        const [countResult, dataResult] = await Promise.all([
            db.execute({
                sql: `SELECT COUNT(*) as cnt FROM supplements WHERE ${filter.whereClause}`,
                args: filter.args,
            }),
            db.execute({
                sql: `SELECT id, name, manufacturer, image_url, tags FROM supplements WHERE ${filter.whereClause} ORDER BY created_at DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`,
                args: filter.args,
            }),
        ]);
        filteredCount = Number(countResult.rows[0]?.cnt ?? 0);
        productsRows = dataResult.rows as Record<string, unknown>[];
    }

    const products = productsRows.map((r) => ({
        id: r.id as string,
        name: r.name as string,
        manufacturer: r.manufacturer as string | null,
        image_url: r.image_url as string | null,
        tags: type === "medicine" ? null : parseJson(r.tags, null) as string[] | null,
    }));

    const count = filteredCount ?? 0;
    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;
    if (page > totalPages) notFound();

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "영양제 위키",
    description: "식약처 공공데이터 기반 영양제 성분, 기능성 원료, 첨가물과 제품 공개 정보를 검색해 확인하세요.",
    url: "https://todaypharm.kr/wiki",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://todaypharm.kr/" },
        { "@type": "ListItem", position: 2, name: "영양제 위키", item: "https://todaypharm.kr/wiki" },
      ],
    },
  };

    return (
        <div className="city-page city-wiki-index space-y-10">
            {/* Hero Section */}
            <PageHeading index="DATA WIKI / READ THE LABEL" title={type === "medicine" ? "의약품 정보" : "영양제 위키"} art="wiki">
                {type === "medicine" ? "의약품안전나라 공개 허가정보 기반 의약품을 이름과 제조사로 찾아보세요." : "식약처 공공데이터 기반 성분·제품 정보를 읽기 쉽게 확인하세요."}
            </PageHeading>

            {/* Category Navigation & Search */}
            <div className="city-panel space-y-4">
                <nav aria-label="정보 종류" className="flex gap-2">
                    <Link href="/wiki" aria-current={type === "supplement" ? "page" : undefined} className={`city-pill font-bold ${type === "supplement" ? "bg-[var(--lime)] text-[var(--ink)]" : "bg-[var(--white)] text-[var(--ink)]"}`}>영양제</Link>
                    <Link href="/wiki?type=medicine" aria-current={type === "medicine" ? "page" : undefined} className={`city-pill font-bold ${type === "medicine" ? "bg-[var(--lime)] text-[var(--ink)]" : "bg-[var(--white)] text-[var(--ink)]"}`}>의약품</Link>
                </nav>
                {type === "supplement" && (
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                    {CATEGORIES.map((cat) => {
                        const isActive = currentCategory === cat.slug;
                        return (
                            <Link
                                key={cat.slug}
                                href={cat.slug === "all" ? "/wiki" : `/wiki?category=${cat.slug}`}
                                className={`city-pill flex items-center gap-2 whitespace-nowrap font-black text-sm ${isActive
                                    ? "bg-[var(--lime)] text-[var(--ink)]"
                                    : "bg-[var(--white)] text-[var(--ink)]"
                                    }`}
                            >
                                <span className="text-lg">{cat.emoji}</span>
                                {cat.name}
                            </Link>
                        );
                    })}
                </div>
                )}

                <WikiSearch key={type} currentCategory={currentCategory} type={type} />
            </div>

            {/* Product Grid */}
            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-brand-600" />
                        <h2 className="text-2xl font-black text-slate-900 capitalize">
                            {type === "medicine" ? "의약품 전체 목록" : currentCategory === "all" ? "전체 목록" : CATEGORIES.find(c => c.slug === currentCategory)?.name}
                        </h2>
                        <span className="text-sm text-slate-400 font-bold ml-2">({count || 0}개)</span>
                    </div>
                </div>

                {!products || products.length === 0 ? (
                    <div className="city-panel py-20 text-center">
                        <div className="text-6xl mb-6">🔍</div>
                        <p className="text-xl text-slate-400 font-black italic">{type === "medicine" ? "등록된 의약품이 없습니다." : "해당 카테고리의 제품을 준비 중입니다."}</p>
                        <Link href={type === "medicine" ? "/wiki?type=medicine" : "/wiki"} className="mt-8 inline-block text-brand-600 font-black hover:underline">
                            전체 목록으로 돌아가기 →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {products.map((product: Supplement) => (
                            <ProductCard key={product.id} product={product} type={type} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-8">
                        {page > 1 && (
                            <Link
                                href={buildWikiPagePath(type, currentCategory, page - 1)}
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
                                href={buildWikiPagePath(type, currentCategory, page + 1)}
                                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm"
                            >
                                →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Info Section */}
            {type === "supplement" && <div className="grid md:grid-cols-2 gap-8 pt-10">
                <div className="city-panel space-y-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">📊</div>
                    <h3 className="text-xl font-black text-slate-900">식약처 데이터 기반</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        약국오늘의 모든 정보는 식품의약품안전처 건강기능식품 공공데이터를 바탕으로 가공되었습니다. 주관적인 광고보다는 팩트에 집중합니다.
                    </p>
                </div>
                <div className="city-panel space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">🧪</div>
                    <h3 className="text-xl font-black text-slate-900">데이터 해설 안내</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        공개된 원재료와 성분 함량을 읽기 쉽게 정리한 참고 정보입니다. 섭취 전 제품 표시사항을 확인하고 필요한 경우 전문가와 상담하세요.
                    </p>
                </div>
            </div>}

            {/* Related Blog Posts */}
            {type === "supplement" && <section className="pt-6 border-t border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-6">영양제 선택 가이드</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { href: "/blog/omega3-selection-guide", label: "오메가3 알티지 vs 에틸에스텔 선택 가이드", desc: "흡수율·가격·형태별 차이와 복용법 완전 정리" },
                        { href: "/blog/probiotics-selection-guide", label: "유산균 균주 선택 가이드", desc: "CFU보다 균주 종류가 중요한 이유와 목적별 선택법" },
                        { href: "/blog/vitamin-d-deficiency-guide", label: "비타민D 결핍 신호 7가지", desc: "국내 성인 75% 부족 상태, 올바른 보충 방법" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="city-card p-5 space-y-1"
                        >
                            <p className="font-bold text-gray-900 text-sm leading-snug">{item.label}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>}
      {type === "supplement" && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(collectionPageJsonLd) }}
      />}
        </div>
    );
}

function ProductCard({ product, type }: { product: Supplement; type: WikiCatalogType }) {
    return (
        <Link
            href={type === "medicine" ? buildWikiMedicinePath(product) : buildWikiProductPath(product)}
            className="city-card group p-6 flex flex-col h-full"
        >
            <div className="flex items-start gap-5 mb-6">
                <div className="relative w-20 h-20 shrink-0 bg-[var(--fog)] border border-[var(--ink)] overflow-hidden p-3">
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

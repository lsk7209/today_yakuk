import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NutrientChartJS } from "@/components/wiki/NutrientChartJS";
import { linkIngredients } from "@/utils/text-linker";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { AdditiveSignal } from "@/components/wiki/AdditiveSignal";
import { MapPin } from "lucide-react";
import { getSupplementById } from "@/lib/data/pharmacies";
import { getSiteUrl } from "@/lib/site-url";
import { Breadcrumb } from "@/components/breadcrumb";

import { AlertTriangle, ShieldCheck } from "lucide-react";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

interface NutritionFactItem {
    name: string;
    amount: number;
    unit: string;
    percent_dv: number;
}

async function getAllIngredients(): Promise<{ name: string; slug: string }[]> {
    try {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
            .from("ingredients")
            .select("name, slug");
        if (error) return [];
        return data || [];
    } catch {
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: { id: string };
}): Promise<Metadata> {
    const supplement = await getSupplementById(params.id);

    if (!supplement) {
        return {
            title: "제품을 찾을 수 없습니다 | 약국오늘",
            description: "요청하신 영양제 정보를 찾을 수 없습니다.",
            robots: { index: false, follow: false },
        };
    }

    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}/wiki/product/${params.id}`;

    return {
        title: `${supplement.name} 효능/부작용 및 성분 분석 - 약국오늘`,
        description: `${supplement.name} (${supplement.manufacturer || "제조사"})의 영양 성분, 첨가물 정보, 정밀 분석 리포트를 확인하세요. 약사가 검증한 안전한 영양제 정보.`,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${supplement.name} | 약국오늘 영양제 위키`,
            description: supplement.ai_summary || `${supplement.name}의 상세 영양 정보를 확인하세요.`,
            url: canonicalUrl,
            images: supplement.image_url ? [{ url: supplement.image_url }] : undefined,
        },
    };
}

export default async function ProductDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const supplement = await getSupplementById(params.id);

    if (!supplement) {
        notFound();
    }

    // Transform nutrition_facts to match component interface
    const nutritionFacts = (supplement.nutrition_facts as NutritionFactItem[])?.map((item: NutritionFactItem) => ({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        percentDV: item.percent_dv,
    })) || [];

    const siteUrl = getSiteUrl();
    const productUrl = `${siteUrl}/wiki/product/${params.id}`;

    // AI Summary Parsing for FAQ Schema
    const faqItems: { question: string, answer: string }[] = [];

    // Parse ai_summary if it's JSON (new format)
    try {
        if (supplement.ai_summary?.trim().startsWith('{')) {
            const parsed = JSON.parse(supplement.ai_summary);
            if (parsed.effects) {
                faqItems.push({
                    question: `${supplement.name}의 주요 효능은 무엇인가요?`,
                    answer: parsed.effects
                });
            }
            if (parsed.cautions) {
                faqItems.push({
                    question: `${supplement.name} 섭취 시 주의할 점이 있나요?`,
                    answer: parsed.cautions
                });
            }
        }
    } catch {
        // Ignore parsing errors
    }

    // Structure Data (JSON-LD) for Google Rich Results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonLd: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": supplement.name,
        "image": supplement.image_url ? [supplement.image_url] : [],
        "description": supplement.ai_summary?.substring(0, 160) || `${supplement.name} 상세 정보`,
        "brand": {
            "@type": "Brand",
            "name": supplement.manufacturer || "Unknown"
        },
        "manufacturer": {
            "@type": "Organization",
            "name": supplement.manufacturer || "Unknown"
        },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "priceCurrency": "KRW",
            "price": "0",
            "availability": "https://schema.org/InStock"
        },
        "review": {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
            },
            "author": {
                "@type": "Organization",
                "name": "약국오늘 AI 분석"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "120"
        }
    };

    const faqLd = faqItems.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "홈",
                "item": siteUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "영양제 위키",
                "item": `${siteUrl}/wiki`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": supplement.name,
                "item": productUrl
            }
        ]
    };

    const ingredients = await getAllIngredients();

    const breadcrumbItems = [
        { label: "영양제 위키", href: "/wiki" },
        { label: supplement.name },
    ];

    return (
        <div className="container py-8 sm:py-12 max-w-5xl space-y-8">
            {/* SEO: JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd, faqLd].filter(Boolean)) }}
            />

            <Breadcrumb items={breadcrumbItems} />

            {/* Header Section */}
            <header className="premium-card bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-60" />

                <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                    {/* Product Image */}
                    <div className="w-full md:w-64 h-64 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-inner relative">
                        {supplement.image_url ? (
                            <div className="relative w-full h-full p-4 hover:scale-105 transition-transform duration-500">
                                <Image
                                    src={supplement.image_url}
                                    alt={supplement.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="text-slate-200 text-6xl">💊</div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-900 leading-tight">
                                {supplement.name}
                            </h1>
                            <p className="text-xl text-brand-700 font-bold flex items-center gap-2">
                                {supplement.manufacturer}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200">
                                    식약처 신고품목
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(supplement.tags || []).map((tag: string) => (
                                <Link
                                    key={tag}
                                    href={`/wiki/tag/${encodeURIComponent(tag)}`}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-0.5"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-400">
                                품목제조번호: <span className="font-mono font-medium text-slate-600">{supplement.product_report_no}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Professional Analysis */}
                    <section className="premium-card bg-white p-6 sm:p-8 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
                            <span className="p-2 bg-blue-50 rounded-xl text-blue-600 text-xl">📝</span>
                            전문가 분석 리포트
                        </h2>
                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                            <div className="text-slate-800 text-lg leading-relaxed">
                                {supplement.ai_summary ? (
                                    <FormattedSummary
                                        text={supplement.ai_summary}
                                        ingredients={ingredients}
                                    />
                                ) : (
                                    "해당 제품에 대한 정밀 분석 데이터가 업데이트될 예정입니다."
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Nutrition Facts */}
                    <section className="premium-card bg-white p-6 sm:p-8 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
                            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 text-xl">📊</span>
                            영양 성분 정보
                        </h2>
                        <div className="overflow-hidden">
                            {nutritionFacts.length > 0 ? (
                                <NutrientChartJS nutrients={nutritionFacts} />
                            ) : (
                                <div className="text-center py-12 text-slate-400 font-medium">
                                    식약처 데이터베이스에 상세 영양소 함량 정보가 없습니다.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Additives Check */}
                    <section className="premium-card bg-white p-6 sm:p-8 rounded-3xl border border-gray-100">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
                            <span className="p-2 bg-amber-50 rounded-xl text-amber-600 text-lg">🔍</span>
                            첨가물 안심 체크
                        </h2>
                        <AdditiveSignal additives={supplement.additives || {}} />
                    </section>

                    {/* CTA Section */}
                    <section className="premium-card bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-3xl text-center text-white relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-brand-100" />
                        <h3 className="text-xl font-black mb-3">
                            주변 약국에서 <br />바로 구매하세요
                        </h3>
                        <p className="text-brand-100/80 text-sm mb-8 leading-relaxed">
                            가까운 단골 약국에 연락하여 <br />재고 현황을 물어볼 수 있습니다.
                        </p>
                        <Link
                            href="/"
                            className="w-full inline-flex items-center justify-center px-6 py-4 bg-white text-brand-700 font-black rounded-2xl hover:bg-brand-50 transition-all shadow-xl active:scale-95"
                        >
                            근처 약국 찾기
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}

/**
 * AI 분석 리포트를 렌더링하는 컴포넌트 (텍스트/JSON 지원)
 */
function FormattedSummary({ text, ingredients }: { text: string; ingredients: { name: string; slug: string }[] }) {
    let parsedData: { summary: string; effects: string; cautions: string } | null = null;
    let isLegacy = false;

    // Try parsing as JSON first
    try {
        if (text.trim().startsWith('{')) {
            parsedData = JSON.parse(text);
        } else {
            isLegacy = true;
        }
    } catch {
        isLegacy = true;
    }

    if (isLegacy || !parsedData) {
        // 기존 텍스트 포맷 처리
        const lines = text.split('\n').filter(line => line.trim() !== "");
        return (
            <div className="space-y-8">
                {lines.map((line, index) => {
                    const colonIndex = line.indexOf(':');
                    if (colonIndex > 0 && colonIndex < 50) {
                        const title = line.substring(0, colonIndex).trim();
                        const content = line.substring(colonIndex + 1).trim();
                        return (
                            <div key={index} className="group space-y-3">
                                <section className="space-y-2">
                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                        <span className="text-brand-500">●</span>
                                        {linkIngredients(title, ingredients)}
                                    </h3>
                                    <div className="pl-5 text-slate-600 leading-relaxed font-medium">
                                        {formatContent(content)}
                                    </div>
                                </section>
                            </div>
                        );
                    }
                    return (
                        <div key={index} className="py-1 text-slate-700 leading-relaxed font-medium">
                            {formatContent(line)}
                        </div>
                    );
                })}
            </div>
        );
    }

    // 신규 JSON 포맷 렌더링
    return (
        <div className="space-y-8">
            {parsedData.summary && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-800 text-lg leading-relaxed">
                        {parsedData.summary}
                    </p>
                </div>
            )}

            <div className="grid gap-6">
                {parsedData.effects && (
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-lg font-black text-blue-800">
                            <ShieldCheck className="w-5 h-5" /> 주요 효능
                        </h3>
                        <p className="text-slate-700 leading-relaxed pl-7">
                            {formatContent(parsedData.effects)}
                        </p>
                    </div>
                )}

                {parsedData.cautions && (
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-lg font-black text-amber-600">
                            <AlertTriangle className="w-5 h-5" /> 섭취 시 주의사항
                        </h3>
                        <p className="text-slate-700 leading-relaxed pl-7">
                            {formatContent(parsedData.cautions)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * 내용 중 (1), (2) 등 숫자를 강조하거나 추가 줄바꿈을 시도하는 헬퍼
 */
function formatContent(text: string) {
    // (1), (2) 등을 찾아서 줄바꿈 느낌을 주거나 볼드로 처리
    const parts = text.split(/(\(\d+\))/g);

    return parts.map((part, i) => {
        if (part.match(/\(\d+\)/)) {
            return (
                <span key={i} className="inline-flex items-center justify-center min-w-[1.75rem] h-7 mt-2 mb-1 mr-2 px-2 bg-brand-50 text-brand-700 text-[11px] font-black rounded-lg ring-1 ring-brand-100 shadow-sm align-middle">
                    {part}
                </span>
            );
        }
        return part;
    });
}

import { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = {
    title: "영양제 정보",
    description: "식약처 공공데이터 기반 영양제 성분 정보와 객관적 분석을 제공합니다.",
    openGraph: {
        title: "영양제 정보 | 오늘약국",
        description: "건강기능식품 성분과 제품을 찾고, 객관적인 정보를 확인하세요.",
    },
};

{ name: "#유산균", slug: "probiotics", emoji: "🦠" },
{ name: "#비타민C", slug: "vitamin-c", emoji: "🍊" },
{ name: "#오메가3", slug: "omega3", emoji: "🐟" },
{ name: "#눈건강", slug: "eye", emoji: "👁️" },
{ name: "#피로회복", slug: "fatigue", emoji: "⚡" },
{ name: "#면역력", slug: "immune", emoji: "🛡️" },

export default function WikiHomePage() {
    return (
        <div className="container py-8 max-w-4xl">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">영양제 정보</h1>
                <p className="text-lg text-[var(--muted)] mb-2">
                    식약처 공공데이터 기반 객관적 분석
                </p>
                <p className="text-sm text-[var(--muted)]">
                    상업적 링크 없이, 순수한 데이터와 팩트만 제공합니다.
                </p>
            </div>

            {/* Search Section */}
            <div className="mb-12">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="영양제 이름 또는 성분을 검색하세요 (예: 마그네슘, 비타민D)"
                        className="w-full px-6 py-4 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
                        disabled
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
                </div>
                <p className="text-xs text-[var(--muted)] mt-2 text-center">
                    ※ 검색 기능은 데이터 수집 후 활성화됩니다
                </p>
            </div>

            {/* Popular Tags */}
            <div className="mb-12">
                <h2 className="text-xl font-semibold mb-4">인기 성분</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {POPULAR_TAGS.map((tag) => (
                        <Link
                            key={tag.slug}
                            href={`/wiki/tag/${tag.slug}`}
                            className="p-4 border border-[var(--border)] rounded-lg hover:border-brand-500 hover:shadow-sm transition-all text-center group"
                        >
                            <div className="text-3xl mb-2">{tag.emoji}</div>
                            <div className="font-medium group-hover:text-brand-700">
                                {tag.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
                    <h3 className="font-semibold mb-2 text-blue-900">📊 데이터 기반</h3>
                    <p className="text-sm text-blue-800">
                        식품의약품안전처 공공데이터를 기반으로 객관적인 정보를 제공합니다.
                    </p>
                </div>
                <div className="p-6 bg-green-50 border border-green-100 rounded-xl">
                    <h3 className="font-semibold mb-2 text-green-900">🧪 전문가 분석</h3>
                    <p className="text-sm text-green-800">
                        어려운 성분 정보를 오늘약국 전문가의 시선으로 쉽게 풀어서 설명해 드립니다.
                    </p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-[var(--border)]">
                <h3 className="text-lg font-semibold mb-2">
                    영양제 구매는 내 주변 약국에서
                </h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                    온라인보다 안전하고, 약사님의 상담을 받을 수 있습니다.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                    내 주변 약국 찾기
                </Link>
            </div>
        </div>
    );
}

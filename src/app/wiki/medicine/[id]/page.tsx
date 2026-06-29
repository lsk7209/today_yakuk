import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";
import {
    buildWikiMedicinePath,
    buildWikiMedicineSlug,
    extractWikiEntityId,
} from "@/lib/wiki-slug";

// ISR: Revalidate every 24 hours
export const revalidate = 86400;

interface Medicine {
    id: string;
    item_seq: string;
    name: string;
    manufacturer: string | null;
    efficacy: string | null;
    use_method: string | null;
    warning_general: string | null;
    warning_usage: string | null;
    interactions: string | null;
    side_effects: string | null;
    storage_method: string | null;
    image_url: string | null;
    created_at: string;
}

async function getMedicineById(id: string): Promise<Medicine | null> {
    try {
        const { getTursoClient } = await import("@/lib/turso");
        const db = getTursoClient();
        const result = await db.execute({ sql: "SELECT * FROM medicines WHERE id = ? LIMIT 1", args: [id] });
        if (!result.rows.length) return null;
        const r = result.rows[0];
        return {
            id: r.id as string,
            item_seq: r.item_seq as string,
            name: r.name as string,
            manufacturer: r.manufacturer as string | null,
            efficacy: r.efficacy as string | null,
            use_method: r.use_method as string | null,
            warning_general: r.warning_general as string | null,
            warning_usage: r.warning_usage as string | null,
            interactions: r.interactions as string | null,
            side_effects: r.side_effects as string | null,
            storage_method: r.storage_method as string | null,
            image_url: r.image_url as string | null,
            created_at: r.created_at as string,
        };
    } catch (e) {
        console.error("medicine fetch exception", e);
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: { id: string };
}): Promise<Metadata> {
    const medicine = await getMedicineById(extractWikiEntityId(params.id));

    if (!medicine) {
        return {
            title: "의약품을 찾을 수 없습니다",
            description: "요청하신 의약품 정보를 찾을 수 없습니다.",
            robots: { index: false, follow: false },
        };
    }

    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}${buildWikiMedicinePath(medicine)}`;

    return {
        title: `${medicine.name} 효능/부작용/복용법`,
        description: `${medicine.name} (${medicine.manufacturer || "제조사"})의 효능, 사용법, 주의사항, 부작용 정보를 확인하세요. 식약처 인증 의약품 정보.`,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${medicine.name} 의약품 정보`,
            description: medicine.efficacy || `${medicine.name}의 상세 정보를 확인하세요.`,
            url: canonicalUrl,
            images: medicine.image_url ? [{ url: medicine.image_url }] : undefined,
        },
    };
}

export default async function MedicineDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const medicine = await getMedicineById(extractWikiEntityId(params.id));

    if (!medicine) {
        notFound();
    }

    if (params.id !== buildWikiMedicineSlug(medicine)) {
        permanentRedirect(buildWikiMedicinePath(medicine));
    }

    const siteUrl = getSiteUrl();
    const medicineUrl = `${siteUrl}${buildWikiMedicinePath(medicine)}`;

    // JSON-LD for SEO
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Drug",
        "name": medicine.name,
        "image": medicine.image_url ? [medicine.image_url] : [],
        "description": medicine.efficacy || `${medicine.name} 의약품 정보`,
        "url": medicineUrl,
        "manufacturer": {
            "@type": "Organization",
            "name": medicine.manufacturer || "Unknown"
        }
    };

    return (
        <div className="container py-8 max-w-4xl">
            {/* SEO: JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumb */}
            <nav className="text-sm text-[var(--muted)] mb-6 flex items-center" aria-label="Breadcrumb">
                <Link href="/wiki" className="hover:text-brand-700">
                    약품 위키
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]">{medicine.name}</span>
            </nav>

            {/* Header Section */}
            <div className="mb-8 pb-8 border-b border-[var(--border)]">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="w-full md:w-48 h-48 bg-gray-50 rounded-2xl flex items-center justify-center border border-[var(--border)] overflow-hidden">
                        {medicine.image_url ? (
                            <div className="relative w-full h-full p-2">
                                <Image
                                    src={medicine.image_url}
                                    alt={`${medicine.name} 낱알 이미지`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 192px"
                                />
                            </div>
                        ) : (
                            <span className="text-5xl" role="img" aria-label="Medicine">💊</span>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <h1 className="text-3xl font-bold mb-2 text-gray-900 leading-tight">
                                {medicine.name}
                            </h1>
                        </div>

                        <p className="text-lg text-brand-600 font-medium mb-4 flex items-center gap-2">
                            {medicine.manufacturer}
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                식약처 허가
                            </span>
                        </p>

                        <p className="text-xs text-[var(--muted)] mt-4">
                            품목기준코드: <span className="font-mono">{medicine.item_seq}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Efficacy */}
            {medicine.efficacy && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>💡</span> 이 약의 효능은 무엇입니까?
                    </h2>
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {medicine.efficacy}
                        </p>
                    </div>
                </section>
            )}

            {/* Use Method */}
            {medicine.use_method && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>📋</span> 이 약은 어떻게 사용합니까?
                    </h2>
                    <div className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {medicine.use_method}
                        </p>
                    </div>
                </section>
            )}

            {/* Warning General */}
            {medicine.warning_general && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
                        <span>⚠️</span> 사용 전 반드시 알아야 할 내용
                    </h2>
                    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {medicine.warning_general}
                        </p>
                    </div>
                </section>
            )}

            {/* Warning Usage */}
            {medicine.warning_usage && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🔍</span> 사용상 주의사항
                    </h2>
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl shadow-sm">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {medicine.warning_usage}
                        </p>
                    </div>
                </section>
            )}

            {/* Interactions */}
            {medicine.interactions && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🍽️</span> 주의해야 할 약 또는 음식
                    </h2>
                    <div className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {medicine.interactions}
                        </p>
                    </div>
                </section>
            )}

            {/* Side Effects */}
            {medicine.side_effects && (
                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🩺</span> 이상반응 (부작용)
                    </h2>
                    <div className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {medicine.side_effects}
                        </p>
                    </div>
                </section>
            )}

            {/* Storage Method */}
            {medicine.storage_method && (
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>📦</span> 보관 방법
                    </h2>
                    <div className="p-6 bg-white border border-[var(--border)] rounded-2xl shadow-sm">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {medicine.storage_method}
                        </p>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="mt-12 p-8 bg-brand-50 rounded-2xl border border-brand-100 text-center">
                <MapPin className="w-10 h-10 mx-auto mb-3 text-brand-600" />
                <h3 className="text-lg font-bold mb-2 text-brand-900">
                    내 주변 약국에서 구매하세요
                </h3>
                <p className="text-sm text-brand-700 mb-6">
                    가까운 약국을 찾아 처방전과 함께 구매하세요.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                    근처 약국 검색하기
                </Link>
            </section>
        </div>
    );
}

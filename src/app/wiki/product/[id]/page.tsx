import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { NutrientDisplay } from "@/components/wiki/NutrientDisplay";
import { AdditiveSignal } from "@/components/wiki/AdditiveSignal";
import { MapPin } from "lucide-react";
import { getSupplementById, type Supplement } from "@/lib/data/pharmacies";
import { getSiteUrl } from "@/lib/site-url";
import {
  buildWikiProductPath,
  buildWikiProductSlug,
  extractWikiEntityId,
} from "@/lib/wiki-slug";
import { Breadcrumb } from "@/components/breadcrumb";
import { safeJsonStringify } from "@/components/seo/json-ld";
import { isIndexableSupplement } from "@/lib/wiki-indexability";
import { getVerifiedNutritionFacts } from "@/lib/wiki-nutrition";

// ISR: Revalidate every hour (nutrition_facts 데이터 반영)
export const revalidate = 3600;

interface NutritionFactItem {
  name: string;
  amount: number;
  unit: string;
  percent_dv: number | null;
  source?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supplement = await getSupplementById(extractWikiEntityId(id));

  if (!supplement) {
    return {
      title: "제품을 찾을 수 없습니다",
      description: "요청하신 영양제 정보를 찾을 수 없습니다.",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${buildWikiProductPath(supplement)}`;
  const factualDescription = buildFactualDescription(supplement);

  const isThin = !isIndexableSupplement(supplement);

  return {
    title: `${supplement.name} 신고 정보·제조사·공개 필드`,
    description: `${supplement.name} (${supplement.manufacturer || "제조사"})의 건강기능식품 신고번호, 제조사와 출처가 확인된 공개 필드를 확인하세요.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${supplement.name} 영양제 위키`,
      description: factualDescription,
      url: canonicalUrl,
      images: supplement.image_url
        ? [{ url: supplement.image_url }]
        : [{ url: `${siteUrl}/api/og?title=${encodeURIComponent(supplement.name)}` }],
    },
    ...(isThin ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplement = await getSupplementById(extractWikiEntityId(id));

  if (!supplement) {
    notFound();
  }

  if (id !== buildWikiProductSlug(supplement)) {
    permanentRedirect(buildWikiProductPath(supplement));
  }

  // Transform nutrition_facts to match component interface
  const verifiedNutritionFacts = getVerifiedNutritionFacts(supplement.nutrition_facts);
  const nutritionFacts =
    verifiedNutritionFacts.map(
      (item: NutritionFactItem) => ({
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        percentDV: item.percent_dv,
      }),
    ) || [];

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}${buildWikiProductPath(supplement)}`;
  const factualDescription = buildFactualDescription(supplement);

  // Structure Data (JSON-LD) for Google Rich Results
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: supplement.name,
    image: supplement.image_url ? [supplement.image_url] : [],
    description: factualDescription,
    brand: {
      "@type": "Brand",
      name: supplement.manufacturer || "Unknown",
    },
    manufacturer: {
      "@type": "Organization",
      name: supplement.manufacturer || "Unknown",
    },
    url: productUrl,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "영양제 위키",
        item: `${siteUrl}/wiki`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: supplement.name,
        item: productUrl,
      },
    ],
  };

  const breadcrumbItems = [
    { label: "영양제 위키", href: "/wiki" },
    { label: supplement.name },
  ];

  return (
    <div className="container py-8 sm:py-12 max-w-5xl space-y-8">
      {/* SEO: JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonStringify([jsonLd, breadcrumbLd]),
        }}
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
                품목제조번호:{" "}
                <span className="font-mono font-medium text-slate-600">
                  {supplement.product_report_no}
                </span>
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
              <span className="p-2 bg-blue-50 rounded-xl text-blue-600 text-xl">
                📝
              </span>
              공공데이터 신고 정보
            </h2>
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              <div className="text-slate-800 text-lg leading-relaxed">
                <p className="text-slate-700 leading-relaxed">
                  {generateTemplateContent(supplement)}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-relaxed text-sky-950">
              구조화 영양성분이 비어 있어도 실제 제품에 해당 성분이 없다는 뜻은 아닙니다. 제품
              포장과 공식 조회 결과를 함께 확인하세요.{" "}
              <Link
                href="/blog/supplement-label-reading-guide"
                className="font-black underline decoration-sky-300 underline-offset-4"
              >
                영양제 라벨 읽는 순서 보기
              </Link>
            </div>
          </section>

          {/* Nutrition Facts */}
          <section className="premium-card bg-white p-6 sm:p-8 rounded-3xl border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900">
              <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 text-xl">
                📊
              </span>
              출처가 확인된 영양 성분 필드
            </h2>
            <div className="overflow-hidden">
              {nutritionFacts.length > 0 ? (
                <NutrientDisplay nutrients={nutritionFacts} />
              ) : (
                <div className="text-center py-12 text-slate-400 font-medium">
                  현재 약국오늘이 수집한 공개 데이터에 구조화된 영양소 함량이 표시되지
                  않습니다. 제품 포장과 공식 조회 결과로 다시 확인하세요.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Additives Check */}
          <section className="premium-card bg-white p-6 sm:p-8 rounded-3xl border border-gray-100">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
              <span className="p-2 bg-amber-50 rounded-xl text-amber-600 text-lg">
                🔍
              </span>
              원재료 키워드 확인
            </h2>
            <AdditiveSignal additives={supplement.additives || {}} />
          </section>

          {/* CTA Section */}
          <section className="premium-card bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-3xl text-center text-white relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <MapPin className="w-12 h-12 mx-auto mb-4 text-brand-100" />
            <h3 className="text-xl font-black mb-3">
              주변 약국에 <br />
              취급 여부를 확인하세요
            </h3>
            <p className="text-brand-100/80 text-sm mb-8 leading-relaxed">
              판매·재고 여부는 약국마다 다릅니다. <br />
              방문 전 전화로 확인하세요.
            </p>
            <Link
              href="/nearby"
              data-analytics-event="content_to_nearby_click"
              data-source-surface="wiki_product"
              data-cta-placement="sidebar"
              className="w-full inline-flex items-center justify-center px-6 py-4 bg-white text-brand-700 font-black rounded-2xl hover:bg-brand-50 transition-all shadow-xl active:scale-95"
            >
              가까운 약국 찾기
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * 공개 신고 필드만 사용해 제품 설명을 생성합니다.
 */
function generateTemplateContent(supplement: Supplement): string {
  const parts: string[] = [];
  const mfr = supplement.manufacturer || "건강기능식품 제조사";

  parts.push(
    `${supplement.name}은(는) ${mfr}에서 제조한 건강기능식품으로, ` +
      `공개 신고정보에서 품목제조신고번호 ${supplement.product_report_no}(으)로 확인됩니다.`,
  );

  if (supplement.tags && supplement.tags.length > 0) {
    parts.push(
      `약국오늘의 분류 태그는 ${supplement.tags.join(", ")}입니다. ` +
        `분류 태그는 실제 성분 함량이나 기능성을 보증하지 않으므로 제품 표시사항을 함께 확인하세요.`,
    );
  }

  const nutrition = getVerifiedNutritionFacts(supplement.nutrition_facts);
  if (nutrition && nutrition.length > 0) {
    const top = nutrition
      .slice(0, 5)
      .map((n) => `${n.name} ${n.amount}${n.unit}`)
      .join(", ");
    parts.push(
      `식품안전나라 C003 영양성분 필드에는 ${top} 등 총 ${nutrition.length}개 항목이 표시되어 있습니다. ` +
        `이는 공식 응답에서 구조화해 옮긴 값이며, 실제 섭취 판단은 제품 포장 표시를 함께 확인하세요.`,
    );
  }

  const additives = supplement.additives;
  if (additives) {
    const hasKnownClassification = [
      additives.has_preservatives,
      additives.has_coloring,
      additives.has_artificial_sweeteners,
    ].some((value) => typeof value === "boolean");
    const concerns: string[] = [];
    if (additives.has_preservatives) concerns.push("보존제");
    if (additives.has_coloring) concerns.push("착색료");
    if (additives.has_artificial_sweeteners) concerns.push("인공감미료");
    if (concerns.length > 0) {
      parts.push(
        `공개 원재료명에서 ${concerns.join(", ")} 관련 지정 키워드가 확인됩니다. ` +
          `실제 함량과 사용 목적은 제품 표시사항 또는 제조사 안내로 다시 확인하세요.`,
      );
    } else if (hasKnownClassification) {
      parts.push(
        `공개 원재료명에서 지정한 보존료·착색료·인공감미료 키워드는 확인되지 않았습니다. ` +
          `이는 해당 성분의 부재나 제품 안전성을 보증하지 않습니다.`,
      );
    }
  }

  parts.push(
    `건강기능식품은 의약품이 아니므로 섭취 전 전문 약사 또는 의사와 상담하시길 권장합니다. ` +
      `약국오늘에서 가까운 약국을 찾아 전문가의 조언을 받아보세요.`,
  );

  return parts.join(" ");
}

function buildFactualDescription(supplement: Supplement): string {
  const manufacturer = supplement.manufacturer || "제조사 정보 미표시";
  const reportNumber = supplement.product_report_no || "신고번호 미표시";
  return `${supplement.name}의 건강기능식품 공개 신고정보입니다. 제조사 ${manufacturer}, 품목제조신고번호 ${reportNumber}와 출처가 확인된 공개 필드를 확인하세요.`;
}

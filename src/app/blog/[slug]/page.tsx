import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedContentBySlug, listPublishedContent } from "@/lib/data/content";
import {
  JsonLd,
  buildArticleSchema,
  buildFAQSchema,
  FAQItem,
} from "@/components/seo/json-ld";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedPosts from "@/components/blog/RelatedPosts";
import Image from "next/image";
import { getBlogFeaturedImage } from "@/lib/blog-image";
import { getSiteUrl } from "@/lib/site-url";
import { sanitizeTrustedHtml } from "@/lib/sanitize-html";
import { AdSlotTop, AdSlotBottom } from "@/components/ads/AdSlot";
import Link from "next/link";

const siteUrl = getSiteUrl();

// 1시간마다 ISR (재생성 빈도↓로 비용 절감)
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

// 헤딩에 ID 추가 함수
function addHeadingIds(html: string): string {
  let index = 0;
  return html.replace(
    /<(h[2-3])([^>]*)>([^<]+)<\/h[2-3]>/gi,
    (match, tag, attrs, text) => {
      const id = `heading-${index++}`;
      // 이미 id가 있으면 스킵
      if (attrs.includes("id=")) return match;
      return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
    },
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedContentBySlug(slug);

  if (!post || Array.isArray(post)) {
    return {
      title: "페이지를 찾을 수 없습니다",
    };
  }

  // 로컬 featured 이미지 확인 (절대 경로 URL이 필요하므로 도메인 붙임)
  const featuredImagePath = getBlogFeaturedImage(
    post.slug,
    post.title,
    post.image_url,
  );
  const absoluteFeaturedImage = featuredImagePath.startsWith("http")
    ? featuredImagePath
    : `${siteUrl}${featuredImagePath}`;

  const ogImages = [];
  if (absoluteFeaturedImage) {
    ogImages.push({
      url: absoluteFeaturedImage,
      width: 1200,
      height: 630,
      alt: post.title,
    });
  }

  const description =
    post.ai_summary && post.ai_summary.length > 160
      ? post.ai_summary.substring(0, 157) + "..."
      : post.ai_summary || "약국오늘 블로그에서 건강 정보를 확인하세요.";

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [absoluteFeaturedImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedContentBySlug(slug);

  if (!post) {
    notFound();
  }

  const allRecent = await listPublishedContent(10);
  const relatedPosts = allRecent
    .filter((p) => p.slug !== slug)
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      ai_summary: p.ai_summary,
      published_at: p.published_at,
      image_url: p.image_url,
    }));

  // 헤딩에 ID 추가
  const contentWithIds = addHeadingIds(sanitizeTrustedHtml(post.content_html));

  // JSON-LD 구조화 데이터 준비 (리팩토링된 스키마 빌더 사용)
  const featuredImageUrl = getBlogFeaturedImage(
    post.slug,
    post.title,
    post.image_url,
  );
  const absoluteImageUrl = featuredImageUrl.startsWith("http")
    ? featuredImageUrl
    : `${siteUrl}${featuredImageUrl}`;

  const articleSchema = buildArticleSchema({
    headline: post.title,
    description: post.ai_summary || "",
    url: `${siteUrl}/blog/${slug}`,
    datePublished: post.published_at || post.publish_at || post.updated_at,
    dateModified: post.updated_at || post.published_at || post.publish_at,
    authorName: "약국오늘",
    publisherName: "약국오늘",
    publisherLogo: `${siteUrl}/icon`,
    image: absoluteImageUrl,
  });

  const faqItems: FAQItem[] =
    post.ai_faq && Array.isArray(post.ai_faq) ? (post.ai_faq as FAQItem[]) : [];
  const faqSchema = faqItems.length > 0 ? buildFAQSchema(faqItems) : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${slug}`,
      },
    ],
  };

  return (
    <article className="container max-w-3xl py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <time className="text-gray-500">
            {new Date(post.published_at || post.publish_at).toLocaleDateString(
              "ko-KR",
            )}
          </time>
          <span className="eeat-badge">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            공공데이터 기반 안내
          </span>
        </div>
      </header>

      <div className="relative w-full aspect-[1200/630] mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50 shadow-lg">
        <Image
          src={getBlogFeaturedImage(post.slug, post.title, post.image_url)}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 본문 상단 광고 */}
      <AdSlotTop />

      {/* 목차 */}
      <TableOfContents contentHtml={contentWithIds} />

      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 rich-content"
        dangerouslySetInnerHTML={{ __html: contentWithIds }}
      />

      {/* JSON-LD 삽입 */}
      <JsonLd data={articleSchema} id="article-schema" />
      {faqSchema && <JsonLd data={faqSchema} id="faq-schema" />}
      <JsonLd data={breadcrumbSchema} id="breadcrumb-schema" />

      {post.ai_faq && Array.isArray(post.ai_faq) && post.ai_faq.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">자주 묻는 질문</h2>
          <div className="space-y-6">
            {post.ai_faq.map(
              (item: { question: string; answer: string }, i: number) => (
                <div key={i} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    Q. {item.question}
                  </h3>
                  <p className="text-gray-700">A. {item.answer}</p>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-3xl border border-brand-100 bg-emerald-50/70 p-6 sm:p-8">
        <h2 className="text-xl font-black text-slate-900">방문 가능한 약국을 찾고 계신가요?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          등록된 영업시간을 기준으로 가까운 약국을 확인할 수 있습니다. 실제 운영과 재고는 달라질 수 있으니
          방문 전 전화로 확인해 주세요.
        </p>
        <Link
          href="/nearby"
          data-analytics-event="content_to_nearby_click"
          data-source-surface="blog"
          data-cta-placement="article_bottom"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-black text-white hover:bg-brand-800"
        >
          가까운 약국 찾기
        </Link>
      </section>

      {/* 본문 하단 광고 */}
      <AdSlotBottom />

      {/* 관련 글 */}
      <RelatedPosts
        posts={
          relatedPosts.map((p) => ({
              ...p,
              imageUrl: getBlogFeaturedImage(p.slug, p.title, p.image_url),
            }))
        }
      />
    </article>
  );
}

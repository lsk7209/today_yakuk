import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { JsonLd, buildArticleSchema, buildFAQSchema, FAQItem } from "@/components/seo/json-ld";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedPosts from "@/components/blog/RelatedPosts";
import Image from "next/image";
import { getBlogFeaturedImage } from "@/lib/blog-image";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

// 10분마다 ISR
export const revalidate = 600;

type Props = {
    params: { slug: string };
};

// 헤딩에 ID 추가 함수
function addHeadingIds(html: string): string {
    let index = 0;
    return html.replace(/<(h[2-3])([^>]*)>([^<]+)<\/h[2-3]>/gi, (match, tag, attrs, text) => {
        const id = `heading-${index++}`;
        // 이미 id가 있으면 스킵
        if (attrs.includes('id=')) return match;
        return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = getSupabaseServerClient();
    const { data: post } = await supabase
        .from("content_queue")
        .select("title, ai_summary")
        .eq("slug", params.slug)
        .single();

    if (!post) {
        return {
            title: "페이지를 찾을 수 없습니다",
        };
    }



    const ogImageUrl = `https://todaypharm.kr/api/og?title=${encodeURIComponent(post.title)}`;
    // 로컬 featured 이미지 확인 (절대 경로 URL이 필요하므로 도메인 붙임)
    const featuredImagePath = getBlogFeaturedImage(post.slug, post.title);
    const absoluteFeaturedImage = featuredImagePath.startsWith("http")
        ? featuredImagePath
        : `https://todaypharm.kr${featuredImagePath}`;

    const ogImages = [];
    if (absoluteFeaturedImage) {
        ogImages.push({ url: absoluteFeaturedImage, width: 1200, height: 630, alt: post.title });
    }
    ogImages.push({ url: ogImageUrl, width: 1200, height: 630, alt: "TodayYakuk Blog" });

    const description = post.ai_summary && post.ai_summary.length > 160
        ? post.ai_summary.substring(0, 157) + "..."
        : post.ai_summary || "약국오늘 블로그에서 건강 정보를 확인하세요.";

    return {
        title: post.title,
        description,
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
            images: [absoluteFeaturedImage || ogImageUrl],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const supabase = getSupabaseServerClient();

    // 현재 글 가져오기
    const { data: post } = await supabase
        .from("content_queue")
        .select("*")
        .eq("slug", params.slug)
        .single();

    if (!post || post.status !== "published") {
        notFound();
    }

    // 관련 글 가져오기
    const { data: relatedPosts } = await supabase
        .from("content_queue")
        .select("slug, title, ai_summary, published_at")
        .eq("status", "published")
        .neq("slug", params.slug)
        .order("published_at", { ascending: false })
        .limit(4);

    // 헤딩에 ID 추가
    const contentWithIds = addHeadingIds(post.content_html || "");

    // JSON-LD 구조화 데이터 준비 (리팩토링된 스키마 빌더 사용)
    const featuredImageUrl = getBlogFeaturedImage(post.slug, post.title);
    const absoluteImageUrl = featuredImageUrl.startsWith("http")
        ? featuredImageUrl
        : `${siteUrl}${featuredImageUrl}`;

    const articleSchema = buildArticleSchema({
        headline: post.title,
        description: post.ai_summary || "",
        url: `${siteUrl}/blog/${params.slug}`,
        datePublished: post.publish_at || post.created_at,
        dateModified: post.updated_at || post.publish_at,
        authorName: "약국오늘",
        publisherName: "약국오늘",
        publisherLogo: `${siteUrl}/favicon.ico`,
        image: absoluteImageUrl,
    });

    const faqItems: FAQItem[] = post.ai_faq && Array.isArray(post.ai_faq)
        ? post.ai_faq as FAQItem[]
        : [];
    const faqSchema = faqItems.length > 0 ? buildFAQSchema(faqItems) : null;

    return (
        <article className="container max-w-3xl py-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <time className="text-gray-500">
                        {new Date(post.published_at).toLocaleDateString("ko-KR")}
                    </time>
                    <span className="eeat-badge">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        약사 감수 콘텐츠
                    </span>
                </div>
            </header>

            <div className="relative w-full aspect-[1200/630] mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50 shadow-lg">
                <Image
                    src={getBlogFeaturedImage(post.slug, post.title)}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* 목차 */}
            <TableOfContents contentHtml={contentWithIds} />

            <div
                className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 rich-content"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* JSON-LD 삽입 */}
            <JsonLd data={articleSchema} id="article-schema" />
            {faqSchema && <JsonLd data={faqSchema} id="faq-schema" />}

            {post.ai_faq && Array.isArray(post.ai_faq) && post.ai_faq.length > 0 && (
                <section className="mt-12 pt-8 border-t">
                    <h2 className="text-2xl font-bold mb-6">자주 묻는 질문</h2>
                    <div className="space-y-6">
                        {post.ai_faq.map((item: { question: string; answer: string }, i: number) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="font-bold text-lg mb-2 text-gray-900">Q. {item.question}</h3>
                                <p className="text-gray-700">A. {item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 관련 글 */}
            <RelatedPosts
                posts={relatedPosts?.map((p: { slug: string; title: string; ai_summary: string | null; published_at: string | null }) => ({
                    ...p,
                    imageUrl: getBlogFeaturedImage(p.slug, p.title)
                })) || []}
            />
        </article>
    );
}

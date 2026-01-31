import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { JsonLd } from "@/components/seo/json-ld";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedPosts from "@/components/blog/RelatedPosts";
import Image from "next/image";

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
            images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
            images: [ogImageUrl],
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

    // 관련 글 가져오기 (최근 발행된 다른 글 4개)
    const { data: relatedPosts } = await supabase
        .from("content_queue")
        .select("slug, title, ai_summary, published_at")
        .eq("status", "published")
        .neq("slug", params.slug)
        .order("published_at", { ascending: false })
        .limit(4);

    // 헤딩에 ID 추가
    const contentWithIds = addHeadingIds(post.content_html || "");

    return (
        <article className="container max-w-3xl py-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="text-gray-500 text-sm">
                    {new Date(post.published_at).toLocaleDateString("ko-KR")}
                </div>
            </header>

            {/* 대표 이미지 */}
            <div className="relative w-full aspect-[1200/630] mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-indigo-50 shadow-lg">
                <Image
                    src={`/api/og?title=${encodeURIComponent(post.title)}`}
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

            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: post.title,
                    description: post.ai_summary,
                    datePublished: post.publish_at || post.created_at,
                    dateModified: post.updated_at || post.publish_at,
                    author: {
                        "@type": "Person",
                        name: "TodayYakuk Editor",
                    },
                    publisher: {
                        "@type": "Organization",
                        name: "TodayYakuk",
                        logo: {
                            "@type": "ImageObject",
                            url: "https://todaypharm.kr/logo.png",
                        },
                    },
                    mainEntityOfPage: {
                        "@type": "WebPage",
                        "@id": `https://todaypharm.kr/blog/${params.slug}`,
                    },
                }}
            />

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
            <RelatedPosts posts={relatedPosts || []} />
        </article>
    );
}


import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { JsonLd } from "@/components/seo/json-ld";

// 10분마다 ISR
export const revalidate = 600;

type Props = {
    params: { slug: string };
};

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

    return {
        title: post.title,
        description: post.ai_summary,
        openGraph: {
            title: post.title,
            description: post.ai_summary || "",
            type: "article",
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const supabase = getSupabaseServerClient();
    const { data: post } = await supabase
        .from("content_queue")
        .select("*")
        .eq("slug", params.slug)
        .single();

    if (!post || post.status !== "published") {
        notFound();
    }

    return (
        <article className="container max-w-3xl py-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="text-gray-500 text-sm">
                    {new Date(post.published_at).toLocaleDateString("ko-KR")}
                </div>
            </header>

            <div
                className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600"
                dangerouslySetInnerHTML={{ __html: post.content_html || "" }}
            />

            <div
                className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600"
                dangerouslySetInnerHTML={{ __html: post.content_html || "" }}
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
        </article>
    );
}

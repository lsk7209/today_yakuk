import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface RelatedPost {
    slug: string;
    title: string;
    ai_summary?: string | null;
    published_at?: string | null;
    imageUrl?: string;
}

interface RelatedPostsProps {
    posts: RelatedPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                📚 관련 글
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group block overflow-hidden bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 rounded-2xl transition-all"
                    >
                        {/* 썸네일 이미지 영역 */}
                        <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
                            {post.imageUrl ? (
                                <Image
                                    src={post.imageUrl}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                    <span className="text-2xl">💊</span>
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-slate-900 group-hover:text-brand-700 mb-2 line-clamp-2">
                                {post.title}
                            </h3>
                            {post.ai_summary && (
                                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                    {post.ai_summary}
                                </p>
                            )}
                            <div className="flex items-center text-sm text-brand-600 font-medium">
                                읽어보기
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

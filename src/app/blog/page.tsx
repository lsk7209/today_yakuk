import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getBlogFeaturedImage } from "@/lib/blog-image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그 | 약국오늘",
  description: "약국 이용 팁, 야간·주말 대비법, 위치 기반 검색 활용 가이드를 제공합니다.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 3600; // 1 hour

export default async function BlogIndexPage() {
  const supabase = getSupabaseServerClient();
  const { data: posts } = await supabase
    .from("content_queue")
    .select("title, slug, ai_summary, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="container py-10 sm:py-14 space-y-8 bg-white min-h-screen">
      <header className="space-y-3">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">블로그</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">약국 이용 인사이트</h1>
        <p className="text-base text-gray-600 leading-relaxed">
          공휴일·야간에도 빠르게 문 연 약국을 찾기 위한 실전 팁과 체크리스트를 공유합니다.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {(!posts || posts.length === 0) ? (
          <div className="col-span-2 py-10 text-center text-gray-500 bg-gray-50 rounded-2xl">
            아직 등록된 포스트가 없습니다. 조금만 기다려주세요!
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          posts.map((post: any) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
                <Image
                  src={getBlogFeaturedImage(post.slug, post.title)}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    건강정보
                  </span>
                  {post.published_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(post.published_at).toLocaleDateString("ko-KR")}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h2>
                <p className="mt-auto text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {post.ai_summary}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}



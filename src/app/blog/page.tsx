import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getBlogFeaturedImage } from "@/lib/blog-image";
import type { Metadata } from "next";
import { AdSlotInFeed } from "@/components/ads/AdSlot";

interface BlogPost {
  title: string;
  slug: string;
  ai_summary: string | null;
  published_at: string | null;
  image_url: string | null;
}

const POSTS_PER_PAGE = 12;
const BLOG_DESCRIPTION = "약국 이용 팁, 야간·주말 대비법, 위치 기반 검색 활용 가이드를 제공합니다.";

export const revalidate = 600; // 10 minutes

type BlogIndexPageProps = {
  searchParams?: {
    page?: string;
  };
};

export function generateMetadata({ searchParams }: BlogIndexPageProps): Metadata {
  const currentPage = getCurrentPage(searchParams?.page);
  const canonical = getBlogPageHref(currentPage);

  return {
    title: "블로그",
    description: BLOG_DESCRIPTION,
    alternates: { canonical },
    robots: currentPage > 1 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

function getCurrentPage(pageParam?: string) {
  const page = Number.parseInt(pageParam ?? "1", 10);
  if (Number.isNaN(page) || page < 1) return 1;
  return page;
}

function getBlogPageHref(page: number) {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const currentPage = getCurrentPage(searchParams?.page);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const supabase = getSupabaseServerClient();
  const { data: posts, count } = await supabase
    .from("content_queue")
    .select("title, slug, ai_summary, published_at, image_url", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .range(from, to);

  const totalPosts = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  return (
    <div className="container py-10 sm:py-14 space-y-8 bg-white min-h-screen">
      <header className="space-y-3">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">블로그</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">약국 이용 인사이트</h1>
        <p className="text-base text-gray-600 leading-relaxed">
          공휴일·야간에도 빠르게 문 연 약국을 찾기 위한 실전 팁과 체크리스트를 공유합니다.
        </p>
        {totalPosts > 0 ? (
          <p className="text-sm text-gray-500">
            전체 {totalPosts.toLocaleString("ko-KR")}개 글 중 {currentPage}페이지
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {(!posts || posts.length === 0) ? (
          <div className="col-span-2 py-10 text-center text-gray-500 bg-gray-50 rounded-2xl">
            아직 등록된 포스트가 없습니다. 조금만 기다려주세요!
          </div>
        ) : (
          (posts as BlogPost[]).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col h-full overflow-hidden"
            >
              <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-emerald-50 via-white to-indigo-50">
                <Image
                  src={getBlogFeaturedImage(post.slug, post.title, post.image_url)}
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

      {/* 블로그 목록 하단 인피드 광고 */}
      <AdSlotInFeed className="my-4" />

      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-3" aria-label="블로그 페이지">
          <PaginationLink page={currentPage - 1} disabled={currentPage <= 1}>
            이전
          </PaginationLink>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-black text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <PaginationLink page={currentPage + 1} disabled={currentPage >= totalPages}>
            다음
          </PaginationLink>
        </nav>
      ) : null}
    </div>
  );
}

function PaginationLink({
  children,
  disabled,
  page,
}: {
  children: React.ReactNode;
  disabled: boolean;
  page: number;
}) {
  if (disabled) {
    return (
      <span className="rounded-full border border-gray-200 bg-gray-100 px-5 py-2 text-sm font-black text-gray-400">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={getBlogPageHref(page)}
      className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-black text-gray-900 hover:border-brand-300 hover:text-brand-700"
    >
      {children}
    </Link>
  );
}



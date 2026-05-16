import Link from "next/link";
import Image from "next/image";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getBlogFeaturedImage } from "@/lib/blog-image";
import type { Metadata } from "next";
import { AdSlotInFeed } from "@/components/ads/AdSlot";

const STATIC_POSTS = [
  { slug: "holiday-pharmacy-open-check", title: "공휴일에 약국이 열려 있나요? 빠른 확인 방법", summary: "공휴일 약국 영업 여부와 휴일지킴이약국을 30초 안에 확인하는 4가지 방법", tag: "공휴일" },
  { slug: "pharmacy-visit-checklist-3", title: "약국 방문 전 꼭 확인해야 할 것들: 영업·재고·처방 3가지", summary: "헛걸음을 막는 3가지 필수 확인 사항 — 영업, 재고, 처방전 유효기간", tag: "방문 가이드" },
  { slug: "prescription-holiday-guide", title: "처방전 약 연휴에 못 받을 때 대처법", summary: "처방전 유효기간 3일 규정·비상약국 조회·응급 대처까지 총정리", tag: "처방전" },
  { slug: "night-pharmacy-3steps", title: "야간 약국 찾기 3단계", summary: "심야에 약국을 빠르게 찾는 단계별 실전 방법", tag: "야간" },
  { slug: "kids-fever-medicine-comparison", title: "소아 발열 약 비교 가이드", summary: "아세트아미노펜 vs 이부프로펜, 연령별 용량 기준 정리", tag: "소아·발열" },
  { slug: "holiday-open-pharmacy-tips", title: "공휴일 문 연 약국 찾는 팁", summary: "공휴일 당번 약국 조회 방법과 사전 준비 체크리스트", tag: "공휴일" },
  { slug: "night-pharmacy-checklist", title: "야간 약국 방문 체크리스트", summary: "심야 방문 전 확인할 항목 6가지", tag: "야간" },
  { slug: "pharmacy-faq-top10", title: "약국 자주 묻는 질문 TOP 10", summary: "처방전, 재고, 영업시간 등 자주 묻는 질문 모음", tag: "FAQ" },
];

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

      {/* 큐레이션 정적 포스트 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-brand-700 uppercase tracking-wide">기획 글</p>
          <span className="h-px flex-1 bg-gray-100" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {STATIC_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition-all flex flex-col gap-2"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                {post.tag}
              </span>
              <h2 className="text-base font-bold text-gray-900 group-hover:text-brand-700 leading-snug line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{post.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <AdSlotInFeed className="my-2" />

      {/* Supabase 발행 포스트 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-gray-500 uppercase tracking-wide">최신 글</p>
          <span className="h-px flex-1 bg-gray-100" />
        </div>
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
      </section>

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



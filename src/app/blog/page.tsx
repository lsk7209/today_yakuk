import Link from "next/link";
import Image from "next/image";
import { getTursoClient, parseJson } from "@/lib/turso";
import { getBlogFeaturedImage } from "@/lib/blog-image";
import type { Metadata } from "next";
import { AdSlotInFeed } from "@/components/ads/AdSlot";

const STATIC_POSTS = [
  // 약국 찾기
  {
    slug: "holiday-pharmacy-open-check",
    title: "공휴일에 약국이 열려 있나요? 빠른 확인 방법",
    summary: "공휴일 약국 영업 여부와 휴일지킴이약국을 30초 안에 확인하는 4가지 방법",
    tag: "공휴일",
  },
  {
    slug: "holiday-open-pharmacy-tips",
    title: "공휴일 문 연 약국 찾는 팁",
    summary: "공휴일 당번 약국 조회 방법과 사전 준비 체크리스트",
    tag: "공휴일",
  },
  {
    slug: "night-pharmacy-3steps",
    title: "야간 약국 찾기 3단계",
    summary: "심야에 약국을 빠르게 찾는 단계별 실전 방법",
    tag: "야간",
  },
  {
    slug: "night-pharmacy-checklist",
    title: "야간 약국 방문 체크리스트",
    summary: "심야 방문 전 확인할 항목 6가지",
    tag: "야간",
  },
  {
    slug: "night-radius-tips",
    title: "야간·주말 약국 반경 설정 팁",
    summary: "야간 약국을 놓치지 않는 반경 설정과 위치 권한 활용법",
    tag: "야간",
  },
  // 처방전·방문
  {
    slug: "prescription-holiday-guide",
    title: "처방전 약 연휴에 못 받을 때 대처법",
    summary: "처방전 유효기간 3일 규정·비상약국 조회·응급 대처까지 총정리",
    tag: "처방전",
  },
  {
    slug: "prescription-prep-tips",
    title: "처방전 방문 전 준비 팁",
    summary: "약국 방문 전 처방전·보험카드·복약 이력 준비 체크리스트",
    tag: "처방전",
  },
  {
    slug: "lost-prescription-action-guide",
    title: "처방전을 잃어버렸을 때 대처법",
    summary: "처방전 분실 시 재발급·약국 방문·응급 대처 단계별 안내",
    tag: "처방전",
  },
  {
    slug: "pharmacy-visit-checklist-3",
    title: "약국 방문 전 꼭 확인해야 할 것들: 영업·재고·처방 3가지",
    summary: "헛걸음을 막는 3가지 필수 확인 사항 — 영업, 재고, 처방전 유효기간",
    tag: "방문 가이드",
  },
  {
    slug: "pharmacy-faq-top10",
    title: "약국 자주 묻는 질문 TOP 10",
    summary: "처방전, 재고, 영업시간 등 자주 묻는 질문 모음",
    tag: "FAQ",
  },
  // 의약품·건강
  {
    slug: "kids-fever-medicine-comparison",
    title: "소아 발열 약 비교 가이드",
    summary: "아세트아미노펜 vs 이부프로펜, 연령별 용량 기준 정리",
    tag: "소아·발열",
  },
  {
    slug: "kids-fever-meds-check",
    title: "소아 발열 약 구매 전 체크리스트",
    summary: "연령·체중별 용량 계산과 구매 시 주의사항",
    tag: "소아·발열",
  },
  {
    slug: "hypertension-diabetes-holiday-tips",
    title: "고혈압·당뇨 복용자 연휴 대비 가이드",
    summary: "만성질환 약 연휴 준비, 비상 약국 확인, 용량 주의사항",
    tag: "만성질환",
  },
  {
    slug: "pregnancy-pharmacy-guide",
    title: "임산부 안전한 영양제 섭취 가이드",
    summary: "엽산·철분·비타민D 필수 영양소와 임신 중 주의해야 할 성분",
    tag: "임산부",
  },
  {
    slug: "digestion-hangover-pharmacy-guide",
    title: "소화·숙취 약국 가이드",
    summary: "소화제·숙취해소제 선택 기준과 약국에서 바로 구할 수 있는 제품",
    tag: "소화·숙취",
  },
  {
    slug: "skin-trouble-first-aid-kit",
    title: "피부 트러블 응급처치 키트",
    summary: "벌레 물림·햇빛 화상·알러지 각각에 맞는 응급 대처법",
    tag: "응급처치",
  },
  {
    slug: "summer-first-aid-kit",
    title: "여름 필수 구급 약품 목록",
    summary: "여름철 가정에 구비해야 할 상비약과 영양제 리스트",
    tag: "응급처치",
  },
  // 영양제 가이드
  {
    slug: "omega3-selection-guide",
    title: "오메가3 알티지 vs 에틸에스텔 선택 가이드",
    summary: "흡수율·가격·형태별 차이와 복용법 완전 정리",
    tag: "영양제",
  },
  {
    slug: "probiotics-selection-guide",
    title: "유산균 균주 선택 가이드",
    summary: "CFU보다 균주 종류가 중요한 이유와 목적별 선택법",
    tag: "영양제",
  },
  {
    slug: "vitamin-d-deficiency-guide",
    title: "비타민D 결핍 신호 7가지와 올바른 보충 방법",
    summary: "국내 성인 75% 부족 상태, 혈중 농도 기준과 용량별 보충법",
    tag: "영양제",
  },
  {
    slug: "lutein-astaxanthin-guide",
    title: "루테인 vs 아스타잔틴: 눈 건강 영양제 비교",
    summary: "황반 보호·항산화력·병용 여부까지 눈 건강 영양제 완전 비교",
    tag: "영양제",
  },
  {
    slug: "magnesium-deficiency-guide",
    title: "마그네슘 부족 신호 6가지와 영양제 선택법",
    summary: "산화 vs 글리시네이트 형태별 흡수율 비교와 올바른 복용법",
    tag: "영양제",
  },
];

interface BlogPost {
  title: string;
  slug: string;
  ai_summary: string | null;
  published_at: string | null;
  image_url: string | null;
}

const POSTS_PER_PAGE = 12;
const BLOG_DESCRIPTION =
  "약국 이용 팁, 야간·주말 대비법, 영양제 선택 가이드까지 건강 생활 정보를 제공합니다.";

export const revalidate = 3600; // 1 hour (ISR 재생성 빈도↓로 비용 절감, 발행은 publish cron이 주도)

type BlogIndexPageProps = {
  searchParams?: {
    page?: string;
  };
};

export function generateMetadata({
  searchParams,
}: BlogIndexPageProps): Metadata {
  const currentPage = getCurrentPage(searchParams?.page);
  const canonical = getBlogPageHref(currentPage);

  return {
    title: "블로그",
    description: BLOG_DESCRIPTION,
    alternates: { canonical },
    robots:
      currentPage > 1
        ? { index: false, follow: true }
        : { index: true, follow: true },
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

export default async function BlogIndexPage({
  searchParams,
}: BlogIndexPageProps) {
  const currentPage = getCurrentPage(searchParams?.page);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const db = getTursoClient();
  const [countResult, dataResult] = await Promise.all([
    db.execute("SELECT COUNT(*) as cnt FROM content_queue WHERE status = 'published'"),
    db.execute({
      sql: `SELECT title, slug, ai_summary, published_at, image_url FROM content_queue
            WHERE status = 'published'
            ORDER BY CASE WHEN published_at IS NULL THEN 1 ELSE 0 END, published_at DESC, updated_at DESC
            LIMIT ? OFFSET ?`,
      args: [POSTS_PER_PAGE, from],
    }),
  ]);
  const count = Number(countResult.rows[0]?.cnt ?? 0);
  const posts = dataResult.rows.map((r) => ({
    title: r.title as string,
    slug: r.slug as string,
    ai_summary: r.ai_summary as string | null,
    published_at: r.published_at as string | null,
    image_url: parseJson(r.image_url, r.image_url as string | null),
  }));

  const totalPosts = count;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  const allPosts = [
    ...STATIC_POSTS.map((p, i) => ({
      position: i + 1,
      url: `/blog/${p.slug}`,
      name: p.title,
    })),
    ...(posts as BlogPost[]).map((p, i) => ({
      position: STATIC_POSTS.length + i + 1,
      url: `/blog/${p.slug}`,
      name: p.title,
    })),
  ];

  const itemListJsonLd =
    currentPage === 1
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "약국 이용 인사이트",
          description: BLOG_DESCRIPTION,
          url: "https://todaypharm.kr/blog",
          numberOfItems: allPosts.length,
          itemListElement: allPosts.map((p) => ({
            "@type": "ListItem",
            position: p.position,
            url: `https://todaypharm.kr${p.url}`,
            name: p.name,
          })),
        }
      : null;

  return (
    <div className="container py-10 sm:py-14 space-y-8 bg-white min-h-screen">
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <header className="space-y-3">
        <p className="text-sm font-bold text-brand-700 uppercase tracking-wide">
          블로그
        </p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">
          약국 이용 인사이트
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          공휴일·야간에도 빠르게 문 연 약국을 찾기 위한 실전 팁과 영양제 선택 가이드를 공유합니다.
        </p>
        {totalPosts > 0 ? (
          <p className="text-sm text-gray-500">
            전체 {totalPosts.toLocaleString("ko-KR")}개 글 중 {currentPage}
            페이지
          </p>
        ) : null}
      </header>

      {/* 큐레이션 정적 포스트 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-brand-700 uppercase tracking-wide">
            전체 가이드
          </p>
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
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                {post.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <AdSlotInFeed className="my-2" />

      {/* Supabase 발행 포스트 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-gray-500 uppercase tracking-wide">
            최신 글
          </p>
          <span className="h-px flex-1 bg-gray-100" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {!posts || posts.length === 0 ? (
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
                    src={getBlogFeaturedImage(
                      post.slug,
                      post.title,
                      post.image_url,
                    )}
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
                        {new Date(post.published_at).toLocaleDateString(
                          "ko-KR",
                        )}
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
        <nav
          className="flex items-center justify-center gap-3"
          aria-label="블로그 페이지"
        >
          <PaginationLink page={currentPage - 1} disabled={currentPage <= 1}>
            이전
          </PaginationLink>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-black text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <PaginationLink
            page={currentPage + 1}
            disabled={currentPage >= totalPages}
          >
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

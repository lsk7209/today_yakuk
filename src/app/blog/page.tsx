import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그 | 오늘약국",
  description: "약국 이용 팁, 야간·주말 대비법, 위치 기반 검색 활용 가이드를 제공합니다.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    title: "공휴일에도 열려 있는 약국을 빨리 찾는 5가지 방법",
    description:
      "위치 권한, 반경 설정, 종료 임박 체크, 전화 확인, 길찾기 실행까지 공휴일 대비 핵심 팁을 정리했습니다.",
    slug: "holiday-open-pharmacy-tips",
    tags: ["공휴일", "야간", "반경검색"],
  },
];

export default function BlogIndexPage() {
  return (
    <div className="container py-10 sm:py-14 space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">블로그</p>
        <h1 className="text-3xl font-bold leading-tight">약국 이용 인사이트</h1>
        <p className="text-base text-[var(--muted)]">
          공휴일·야간에도 빠르게 문 연 약국을 찾기 위한 실전 팁과 체크리스트를 공유합니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold group-hover:text-brand-700">{post.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{post.description}</p>
            <div className="mt-4 text-sm font-semibold text-brand-700">자세히 보기 →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}


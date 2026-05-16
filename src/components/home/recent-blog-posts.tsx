"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  ai_summary: string | null;
  published_at: string | null;
}

export default function RecentBlogPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/blog/recent")
      .then((r) => r.json())
      .then((data: Post[]) => setPosts(data ?? []))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-brand-700">LATEST</p>
          <h2 className="text-xl font-black text-gray-900 mt-1">최근 건강 정보 글</h2>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800"
        >
          전체 보기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
          >
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 line-clamp-2 leading-snug">
              {post.title}
            </h3>
            {post.ai_summary && (
              <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {post.ai_summary}
              </p>
            )}
            {post.published_at && (
              <p className="mt-2 text-xs text-gray-400">
                {new Date(post.published_at).toLocaleDateString("ko-KR")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

"use server";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedContentBySlug } from "@/lib/data/content";

type Props = {
  params: { slug: string };
};

export default async function HubPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug);
  const content = await getPublishedContentBySlug(slug);
  if (!content) return notFound();

  return (
    <div className="container py-10 sm:py-14 space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-brand-700">
          {content.region ?? "전국"} {content.theme ? `· ${content.theme}` : ""}
        </p>
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <p className="text-xs text-[var(--muted)]">
          {content.published_at ? `발행: ${new Date(content.published_at).toLocaleString("ko-KR")}` : ""}
        </p>
      </header>
      <article
        className="prose prose-slate max-w-none bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm"
        dangerouslySetInnerHTML={{ __html: content.content_html ?? "" }}
      />
      <div className="flex gap-2 text-sm">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 font-semibold hover:border-brand-200"
        >
          홈으로
        </Link>
        <Link
          href="/서울/전체"
          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-4 py-2 font-semibold hover:border-brand-200"
        >
          지역별 보기
        </Link>
      </div>
    </div>
  );
}


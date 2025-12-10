import { NextResponse } from "next/server";
import { listPublishedContent } from "@/lib/data/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://todaypharm.kr";
const FEED_TITLE = "오늘약국 | TodayPharmacy";
const FEED_DESCRIPTION = "야간·주말·공휴일 문 연 약국 정보를 빠르게 확인하세요.";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const items = await listPublishedContent(30);
  const fallbackDate = new Date().toUTCString();

  const feedItems =
    items.length > 0
      ? items
          .map((item) => {
            const link = `${SITE_URL}/hub/${item.slug}`;
            const pubDate = new Date(item.published_at || item.publish_at).toUTCString();
            const description = item.content_html
              ? stripHtml(item.content_html).slice(0, 400)
              : item.title;
            return `
      <item>
        <title><![CDATA[${item.title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${description}]]></description>
      </item>`;
          })
          .join("")
      : `
      <item>
        <title><![CDATA[오늘약국 안내]]></title>
        <link>${SITE_URL}</link>
        <guid>${SITE_URL}</guid>
        <pubDate>${fallbackDate}</pubDate>
        <description><![CDATA[오늘 문 연 약국을 빠르게 찾는 서비스입니다.]]></description>
      </item>
    `;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${FEED_TITLE}]]></title>
    <link>${SITE_URL}</link>
    <description><![CDATA[${FEED_DESCRIPTION}]]></description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${feedItems}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=1200",
    },
  });
}


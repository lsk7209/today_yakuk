import { NextResponse } from "next/server";
import { listPublishedContent } from "@/lib/data/content";
import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();
const FEED_TITLE = "약국오늘 블로그 | TodayPharmacy";
const FEED_DESCRIPTION = "지금 문 연 근처약국을 빠르게 찾고 영업시간·위치를 확인하세요. 약국 이용 팁과 건기식 정보를 제공합니다.";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// Ensure 1 hour revalidation
export const revalidate = 3600;

export async function GET() {
  const items = await listPublishedContent(30);
  const fallbackDate = new Date().toUTCString();

  const feedItems =
    items.length > 0
      ? items
        .map((item) => {
          // Correct URL: /blog/[slug]
          const link = `${SITE_URL}/blog/${item.slug}`;
          const pubDate = new Date(item.published_at || item.publish_at).toUTCString();
          const description = item.ai_summary || (item.content_html ? stripHtml(item.content_html).slice(0, 400) : item.title);

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
        <title><![CDATA[약국오늘 안내]]></title>
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
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

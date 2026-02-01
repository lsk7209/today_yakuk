import { getSupabaseServerClient } from '@/lib/supabase-server';
import { getSiteUrl } from '@/lib/site-url';

export const revalidate = 3600; // 1 hour

export async function GET() {
    const supabase = getSupabaseServerClient();
    const siteUrl = getSiteUrl();

    const { data: posts } = await supabase
        .from('content_queue')
        .select('title, slug, ai_summary, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);

    const itemsXml = (posts || [])
        .map((post) => {
            const link = `${siteUrl}/blog/${post.slug}`;
            const pubDate = post.published_at
                ? new Date(post.published_at).toUTCString()
                : new Date(post.created_at).toUTCString();

            return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${post.ai_summary || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
        })
        .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>약국오늘 블로그</title>
    <link>${siteUrl}</link>
    <description>지금 문 연 근처약국을 빠르게 찾고 영업시간·위치를 확인하세요.</description>
    <language>ko</language>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(rssXml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
}

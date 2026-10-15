import { getSiteUrl } from "@/lib/site-url";
import { getSitemapIds } from "@/lib/sitemap";
import { cacheDbRead } from "@/lib/db-read-cache";

const siteUrl = getSiteUrl();

export const dynamic = "force-static";
export const revalidate = 3600;

// DB 장애는 오류로 전파한다. 정상 Response(503)로 바꾸면 Next ISR이 그 응답을 캐시해
// 이전 정상 사이트맵을 덮어쓰므로, 던져서 이전 캐시를 유지(캐시 없으면 500)한다.
export async function GET() {
  const ids = await cacheDbRead(["sitemap-ids"], getSitemapIds);
  const items = ids
    .map(
      (id) => `
  <sitemap>
    <loc>${siteUrl}/sitemap/${id}.xml</loc>
  </sitemap>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}
</sitemapindex>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=600",
    },
  });
}

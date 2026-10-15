import { getSiteUrl } from "@/lib/site-url";
import { getSitemapIds } from "@/lib/sitemap";
import { cacheDbRead } from "@/lib/db-read-cache";
import { withSitemapFailureGuard } from "@/lib/sitemap-response";

const siteUrl = getSiteUrl();

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return withSitemapFailureGuard(buildSitemapIndex);
}

async function buildSitemapIndex() {
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

import { getSiteUrl } from "@/lib/site-url";
import { getSitemapIds } from "@/lib/sitemap";

const siteUrl = getSiteUrl();

export const revalidate = 3600;

export async function GET() {
  const ids = await getSitemapIds();
  const lastModified = new Date().toISOString();
  const items = ids
    .map(
      (id) => `
  <sitemap>
    <loc>${siteUrl}/sitemap/${id}.xml</loc>
    <lastmod>${lastModified}</lastmod>
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
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

import { getSitemapEntries } from "@/lib/sitemap-content";
import { parseSitemapId } from "@/lib/sitemap-id";
import { getSitemapIds } from "@/lib/sitemap";
import { cacheDbRead } from "@/lib/db-read-cache";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: filename } = await params;
  if (!filename.endsWith(".xml")) return new Response("Not found", { status: 404 });

  const id = filename.slice(0, -4);
  if (id !== "static" && !parseSitemapId(id)) {
    return new Response("Not found", { status: 404 });
  }

  if (id !== "static") {
    const availableIds = await cacheDbRead(["sitemap-ids"], getSitemapIds);
    if (!availableIds.includes(id)) return new Response("Not found", { status: 404 });
  }

  const entries = await cacheDbRead(
    ["sitemap-entries", id],
    () => getSitemapEntries(id),
  );
  if (id !== "static" && entries.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const items = entries
    .map((entry) => {
      const lastModified = entry.lastModified
        ? `<lastmod>${escapeXml(toIsoDate(entry.lastModified))}</lastmod>`
        : "";
      const changeFrequency = entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : "";
      const priority = entry.priority == null ? "" : `<priority>${entry.priority}</priority>`;
      return `<url><loc>${escapeXml(entry.url)}</loc>${lastModified}${changeFrequency}${priority}</url>`;
    })
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`,
    {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
}

function toIsoDate(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

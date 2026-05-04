import { MetadataRoute } from "next";
import { getPublishedContentSitemapChunk } from "@/lib/data/content";
import {
  getMedicineSitemapChunk,
  getSupplementSitemapChunk,
} from "@/lib/data/pharmacies";
import { getSiteUrl } from "@/lib/site-url";
import { getSitemapIds, SITEMAP_CHUNK_SIZE } from "@/lib/sitemap";

const siteUrl = getSiteUrl();

export const revalidate = 600;

export async function generateSitemaps() {
  const ids = await getSitemapIds();
  return ids.map((id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  if (id === "static") {
    const now = new Date();
    return [
      { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
      { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
      { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
      { url: `${siteUrl}/nearby`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/wiki`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ];
  }

  const [type, indexText] = id.split("-");
  const index = Number.parseInt(indexText, 10);
  const offset = index * SITEMAP_CHUNK_SIZE;

  if (type === "supplements") {
    const items = await getSupplementSitemapChunk(offset, SITEMAP_CHUNK_SIZE);
    return items.map((item) => ({
      url: `${siteUrl}/wiki/product/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  if (type === "medicines") {
    const items = await getMedicineSitemapChunk(offset, SITEMAP_CHUNK_SIZE);
    return items.map((item) => ({
      url: `${siteUrl}/wiki/medicine/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  if (type === "blog") {
    const items = await getPublishedContentSitemapChunk(offset, SITEMAP_CHUNK_SIZE);
    return items.map((item) => ({
      url: `${siteUrl}/blog/${item.slug}`,
      lastModified: item.updated_at
        ? new Date(item.updated_at)
        : item.published_at
          ? new Date(item.published_at)
          : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  }

  return [];
}

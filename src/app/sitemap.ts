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
    const blogDate = new Date("2026-05-16");
    const guideDate = new Date("2026-06-09");
    return [
      // Core pages
      { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
      { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
      { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
      { url: `${siteUrl}/nearby`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/wiki`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
      // Guide pages
      { url: `${siteUrl}/guide/night-weekend`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/guide/holiday-checklist`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/guide/call-scripts`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/guide/call-navigation-tips`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/guide/radius-selection`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/guide/summer-emergency-kit`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      // Static blog posts
      { url: `${siteUrl}/blog/holiday-pharmacy-open-check`, lastModified: blogDate, changeFrequency: "monthly", priority: 0.9 },
      { url: `${siteUrl}/blog/pharmacy-visit-checklist-3`, lastModified: blogDate, changeFrequency: "monthly", priority: 0.9 },
      { url: `${siteUrl}/blog/prescription-holiday-guide`, lastModified: blogDate, changeFrequency: "monthly", priority: 0.9 },
      { url: `${siteUrl}/blog/night-pharmacy-3steps`, lastModified: blogDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/blog/kids-fever-medicine-comparison`, lastModified: blogDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/blog/holiday-open-pharmacy-tips`, lastModified: blogDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/blog/night-pharmacy-checklist`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/blog/pharmacy-faq-top10`, lastModified: blogDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/blog/kids-fever-meds-check`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/hypertension-diabetes-holiday-tips`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/lost-prescription-action-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/prescription-prep-tips`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/night-radius-tips`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/digestion-hangover-pharmacy-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/pregnancy-pharmacy-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/skin-trouble-first-aid-kit`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/summer-first-aid-kit`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog/omega3-selection-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/blog/probiotics-selection-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/blog/vitamin-d-deficiency-guide`, lastModified: guideDate, changeFrequency: "monthly", priority: 0.8 },
      // Major region pages
      { url: `${siteUrl}/${encodeURIComponent("서울")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
      { url: `${siteUrl}/${encodeURIComponent("경기")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
      { url: `${siteUrl}/${encodeURIComponent("인천")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/${encodeURIComponent("부산")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/${encodeURIComponent("대구")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/${encodeURIComponent("광주")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/${encodeURIComponent("대전")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/${encodeURIComponent("울산")}/전체`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
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

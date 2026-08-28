import type { MetadataRoute } from "next";
import { getPublishedContentSitemapChunk } from "@/lib/data/content";
import {
  getMedicineSitemapChunk,
  getPharmacySitemapChunk,
  getRegionSitemapEntries,
  getSupplementSitemapChunk,
} from "@/lib/data/pharmacies";
import { getSiteUrl } from "@/lib/site-url";
import { parseSitemapId } from "@/lib/sitemap-id";
import { SITEMAP_CHUNK_SIZE } from "@/lib/sitemap";
import { buildWikiMedicinePath, buildWikiProductPath } from "@/lib/wiki-slug";

const siteUrl = getSiteUrl();
export const SEO_TEMPLATE_REVISION = new Date("2026-08-28T00:00:00+09:00");

const REGION_PAGES = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const STATIC_BLOG_SLUGS = [
  "holiday-pharmacy-open-check",
  "pharmacy-visit-checklist-3",
  "prescription-holiday-guide",
  "night-pharmacy-3steps",
  "kids-fever-medicine-comparison",
  "holiday-open-pharmacy-tips",
  "night-pharmacy-checklist",
  "pharmacy-faq-top10",
  "kids-fever-meds-check",
  "hypertension-diabetes-holiday-tips",
  "lost-prescription-action-guide",
  "prescription-prep-tips",
  "night-radius-tips",
  "digestion-hangover-pharmacy-guide",
  "pregnancy-pharmacy-guide",
  "skin-trouble-first-aid-kit",
  "summer-first-aid-kit",
  "omega3-selection-guide",
  "probiotics-selection-guide",
  "vitamin-d-deficiency-guide",
  "lutein-astaxanthin-guide",
  "magnesium-deficiency-guide",
];

export async function getSitemapEntries(id: string): Promise<MetadataRoute.Sitemap> {
  if (id === "static") {
    const cityPages = await getRegionSitemapEntries();
    return [
      { url: `${siteUrl}/`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "daily", priority: 1 },
      { url: `${siteUrl}/about`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/contact`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "monthly", priority: 0.6 },
      { url: `${siteUrl}/privacy`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "yearly", priority: 0.4 },
      { url: `${siteUrl}/terms`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "yearly", priority: 0.4 },
      { url: `${siteUrl}/nearby`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/wiki`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "daily", priority: 0.8 },
      { url: `${siteUrl}/guide`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "monthly", priority: 0.7 },
      { url: `${siteUrl}/blog`, lastModified: SEO_TEMPLATE_REVISION, changeFrequency: "daily", priority: 0.9 },
      ...[
        "night-weekend",
        "holiday-checklist",
        "call-scripts",
        "call-navigation-tips",
        "radius-selection",
        "summer-emergency-kit",
      ].map((slug) => ({
        url: `${siteUrl}/guide/${slug}`,
        lastModified: SEO_TEMPLATE_REVISION,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...STATIC_BLOG_SLUGS.map((slug) => ({
        url: `${siteUrl}/blog/${slug}`,
        lastModified: SEO_TEMPLATE_REVISION,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...REGION_PAGES.map((region) => ({
        url: `${siteUrl}/${encodeURIComponent(region)}/${encodeURIComponent("전체")}`,
        lastModified: SEO_TEMPLATE_REVISION,
        changeFrequency: "daily" as const,
        priority: region === "서울" || region === "경기" ? 0.9 : 0.8,
      })),
      ...cityPages.map((entry) => ({
        url: `${siteUrl}/${encodeURIComponent(entry.province)}/${encodeURIComponent(entry.city)}`,
        lastModified: latestSignificantDate(entry.updated_at),
        changeFrequency: "daily" as const,
        priority: 0.7,
      })),
    ];
  }

  const parsed = parseSitemapId(id);
  if (!parsed) return [];
  const offset = parsed.index * SITEMAP_CHUNK_SIZE;

  if (parsed.type === "pharmacies") {
    const items = await getPharmacySitemapChunk(offset, SITEMAP_CHUNK_SIZE);
    return items.map((item) => ({
      url: `${siteUrl}/pharmacy/${item.hpid}`,
      lastModified: latestSignificantDate(item.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
  }

  if (parsed.type === "supplements") {
    const items = await getSupplementSitemapChunk(offset, SITEMAP_CHUNK_SIZE);
    return items.map((item) => ({
      url: `${siteUrl}${buildWikiProductPath(item)}`,
      lastModified: latestSignificantDate(item.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  if (parsed.type === "medicines") {
    const items = await getMedicineSitemapChunk(offset, SITEMAP_CHUNK_SIZE);
    return items.map((item) => ({
      url: `${siteUrl}${buildWikiMedicinePath(item)}`,
      lastModified: latestSignificantDate(item.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  const items = await getPublishedContentSitemapChunk(offset, SITEMAP_CHUNK_SIZE);
  return items.map((item) => ({
    url: `${siteUrl}/blog/${item.slug}`,
    lastModified: latestSignificantDate(item.updated_at || item.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
}

function latestSignificantDate(value?: string | null): Date {
  if (!value) return SEO_TEMPLATE_REVISION;
  const candidate = new Date(value);
  if (Number.isNaN(candidate.getTime())) return SEO_TEMPLATE_REVISION;
  return candidate > SEO_TEMPLATE_REVISION ? candidate : SEO_TEMPLATE_REVISION;
}

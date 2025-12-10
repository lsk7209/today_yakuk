import { MetadataRoute } from "next";
import { getPharmacyCount, getPharmacyHpidsChunk } from "@/lib/data/pharmacies";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://todaypharm.kr";

const CHUNK_SIZE = 10000;

export async function generateSitemaps() {
  const total = await safeGetPharmacyCount();
  const chunks = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  return Array.from({ length: chunks }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: { id: string }): Promise<MetadataRoute.Sitemap> {
  const id = Number(props.id);
  const offset = id * CHUNK_SIZE;
  const items = await safeGetPharmacyChunk(offset, CHUNK_SIZE);

  const staticEntries: MetadataRoute.Sitemap =
    id === 0
      ? [
          { url: `${siteUrl}/`, lastModified: new Date(), priority: 0.8, changeFrequency: "daily" },
          { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
          { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
          { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
        ]
      : [];

  const dynamicEntries: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${siteUrl}/pharmacy/${item.hpid}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...dynamicEntries];
}

async function safeGetPharmacyCount() {
  try {
    const total = await getPharmacyCount();
    if (Number.isFinite(total) && total >= 0) return total;
    return 0;
  } catch (error) {
    console.error("sitemap: getPharmacyCount failed", error);
    return 0;
  }
}

async function safeGetPharmacyChunk(offset: number, limit: number) {
  try {
    const items = await getPharmacyHpidsChunk(offset, limit);
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error("sitemap: getPharmacyHpidsChunk failed", error);
    return [];
  }
}


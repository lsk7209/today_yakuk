import { MetadataRoute } from "next";
import { getPharmacyCount, getPharmacyHpidsChunk } from "@/lib/data/pharmacies";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const CHUNK_SIZE = 10000;

export async function generateSitemaps() {
  const total = await getPharmacyCount();
  const chunks = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  return Array.from({ length: chunks }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const offset = id * CHUNK_SIZE;
  const items = await getPharmacyHpidsChunk(offset, CHUNK_SIZE);

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


import { MetadataRoute } from "next";
import { getAllPharmacyHpids } from "@/lib/data/pharmacies";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getAllPharmacyHpids();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      priority: 0.8,
      changefreq: "daily",
    },
  ];

  const dynamicEntries: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${siteUrl}/pharmacy/${item.hpid}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    changefreq: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...dynamicEntries];
}


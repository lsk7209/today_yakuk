import { MetadataRoute } from 'next';
import { getSupplementCount, getSupplementSitemapChunk, getMedicineCount, getMedicineSitemapChunk } from '@/lib/data/pharmacies';
import { getSiteUrl } from '@/lib/site-url';

const BASE_URL = getSiteUrl();
const CHUNK_SIZE = 1000; // Google recommends < 50k URLs, 50MB. 1k is safe and fast.

export async function generateSitemaps() {
  const supplementCount = await getSupplementCount();
  const medicineCount = await getMedicineCount();

  const supplementChunks = Math.ceil(supplementCount / CHUNK_SIZE);
  const medicineChunks = Math.ceil(medicineCount / CHUNK_SIZE);

  const sitemaps = [];

  // Supplements Sitemaps
  for (let i = 0; i < supplementChunks; i++) {
    sitemaps.push({ id: `supplements-${i}` });
  }

  // Medicines Sitemaps
  for (let i = 0; i < medicineChunks; i++) {
    sitemaps.push({ id: `medicines-${i}` });
  }

  // Static Sitemap
  sitemaps.unshift({ id: 'static' });

  return sitemaps;
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes (Only for the first sitemap or separate? usually root sitemap.xml handles static if no ID)
  // But generateSitemaps splits strictly. 
  // If id is undefined/null? generateSitemaps enforces usage.
  // We should add a 'static' ID for static pages.
  // Actually, let's just use `supplements-0` to include static pages? No, separated is better.

  // Handling logic
  if (id === 'static') {
    return [
      { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${BASE_URL}/wiki`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${BASE_URL}/guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ];
  }

  const [type, indexStr] = id.split('-');
  const index = parseInt(indexStr, 10);
  const offset = index * CHUNK_SIZE;

  if (type === 'supplements') {
    const items = await getSupplementSitemapChunk(offset, CHUNK_SIZE);
    return items.map((item) => ({
      url: `${BASE_URL}/wiki/product/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  if (type === 'medicines') {
    const items = await getMedicineSitemapChunk(offset, CHUNK_SIZE);
    return items.map((item) => ({
      // Assuming /wiki/medicine/[id] will be created
      url: `${BASE_URL}/wiki/medicine/${item.id}`, // item.id is UUID
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  return [];
}

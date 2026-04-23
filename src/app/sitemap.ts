import { MetadataRoute } from 'next';
import { getSupplementCount, getSupplementSitemapChunk, getMedicineCount, getMedicineSitemapChunk } from '@/lib/data/pharmacies';
import { getPublishedContentCount, getPublishedContentSitemapChunk } from '@/lib/data/content';
import { getSiteUrl } from '@/lib/site-url';

const BASE_URL = getSiteUrl();
const CHUNK_SIZE = 1000;

export async function generateSitemaps() {
  const supplementCount = await getSupplementCount();
  const medicineCount = await getMedicineCount();
  const blogCount = await getPublishedContentCount();

  const supplementChunks = Math.ceil(supplementCount / CHUNK_SIZE);
  const medicineChunks = Math.ceil(medicineCount / CHUNK_SIZE);
  const blogChunks = Math.ceil(blogCount / CHUNK_SIZE);

  const sitemaps = [];

  // Supplements Sitemaps
  for (let i = 0; i < supplementChunks; i++) {
    sitemaps.push({ id: `supplements-${i}` });
  }

  // Medicines Sitemaps
  for (let i = 0; i < medicineChunks; i++) {
    sitemaps.push({ id: `medicines-${i}` });
  }

  // Blog Sitemaps (New)
  for (let i = 0; i < blogChunks; i++) {
    sitemaps.push({ id: `blog-${i}` });
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
  const isStatic = id === 'static';

  // Static Routes
  if (isStatic) {
    return [
      { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
      { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
      { url: `${BASE_URL}/nearby`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${BASE_URL}/wiki`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${BASE_URL}/guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 }, // Increased priority for blog index
    ];
  }

  const [type, indexStr] = id.split('-');
  const index = parseInt(indexStr, 10);
  const offset = index * CHUNK_SIZE;

  // Supplements
  if (type === 'supplements') {
    const items = await getSupplementSitemapChunk(offset, CHUNK_SIZE);
    return items.map((item) => ({
      url: `${BASE_URL}/wiki/product/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  // Medicines
  if (type === 'medicines') {
    const items = await getMedicineSitemapChunk(offset, CHUNK_SIZE);
    return items.map((item) => ({
      url: `${BASE_URL}/wiki/medicine/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  // Blog Posts
  if (type === 'blog') {
    const items = await getPublishedContentSitemapChunk(offset, CHUNK_SIZE);
    return items.map((item) => ({
      url: `${BASE_URL}/blog/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : (item.published_at ? new Date(item.published_at) : new Date()),
      changeFrequency: 'weekly',
      priority: 0.9, // High priority for content
    }));
  }

  return [];
}

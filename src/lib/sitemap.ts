import { getPublishedContentCount } from "@/lib/data/content";
import { getMedicineCount, getSupplementCount } from "@/lib/data/pharmacies";

export const SITEMAP_CHUNK_SIZE = 1000;

export async function getSitemapIds(): Promise<string[]> {
  const supplementCount = await getSupplementCount();
  const medicineCount = await getMedicineCount();
  const blogCount = await getPublishedContentCount();

  const supplementChunks = Math.ceil(supplementCount / SITEMAP_CHUNK_SIZE);
  const medicineChunks = Math.ceil(medicineCount / SITEMAP_CHUNK_SIZE);
  const blogChunks = Math.ceil(blogCount / SITEMAP_CHUNK_SIZE);
  const ids = ["static"];

  for (let i = 0; i < supplementChunks; i += 1) {
    ids.push(`supplements-${i}`);
  }

  for (let i = 0; i < medicineChunks; i += 1) {
    ids.push(`medicines-${i}`);
  }

  for (let i = 0; i < blogChunks; i += 1) {
    ids.push(`blog-${i}`);
  }

  return ids;
}

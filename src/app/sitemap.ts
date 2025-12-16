import { MetadataRoute } from "next";
import { getPharmacyCount, getPharmacyHpidsChunk } from "@/lib/data/pharmacies";
import { getSupabaseServerClient } from "@/lib/supabase-server";

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

  // content_queue에서 published_at 정보 가져오기 (컨텐츠 업데이트 시간 반영)
  const supabase = getSupabaseServerClient();
  const hpids = items.map((item) => item.hpid).filter((h): h is string => h !== null);
  let contentDates: Array<{ hpid: string | null; published_at: string | null; updated_at: string | null }> | null =
    null;
  if (hpids.length > 0) {
    const { data, error } = await supabase
      .from("content_queue")
      .select("hpid, published_at, updated_at")
      .in("hpid", hpids)
      .eq("status", "published");

    // 초기 배포에서 content_queue가 아직 없을 수 있음 → sitemap은 pharmacies 기반으로 계속 생성
    if (!error || (error as { code?: string }).code !== "PGRST205") {
      contentDates = (data as typeof contentDates) ?? null;
    }
  }

  // hpid별 최신 업데이트 시간 매핑
  const contentDateMap = new Map<string, Date>();
  if (contentDates) {
    for (const content of contentDates) {
      if (content.hpid) {
        const dateStr = content.published_at || content.updated_at;
        if (dateStr) {
          const date = new Date(dateStr);
          const existing = contentDateMap.get(content.hpid);
          if (!existing || date > existing) {
            contentDateMap.set(content.hpid, date);
          }
        }
      }
    }
  }

  const staticEntries: MetadataRoute.Sitemap =
    id === 0
      ? [
          { url: `${siteUrl}/`, lastModified: new Date(), priority: 0.8, changeFrequency: "daily" },
          { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
          { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
          { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
        ]
      : [];

  const dynamicEntries: MetadataRoute.Sitemap = items.map((item) => {
    // content_queue의 published_at이 있으면 우선 사용 (컨텐츠 업데이트 시간 반영)
    // 없으면 pharmacies의 updated_at 사용
    const contentDate = contentDateMap.get(item.hpid);
    const lastModified = contentDate
      ? contentDate
      : item.updated_at
        ? new Date(item.updated_at)
        : new Date();

    return {
      url: `${siteUrl}/pharmacy/${item.hpid}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    };
  });

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


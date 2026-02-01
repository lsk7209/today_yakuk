import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isMissingTableError, logError } from "@/lib/errors";

export type ContentItem = {
  id: string;
  hpid: string | null;
  title: string;
  slug: string;
  region: string | null;
  theme: string | null;
  content_html: string | null;
  ai_summary: string | null;
  ai_bullets: { text: string }[] | null;
  ai_faq: { question: string; answer: string }[] | null;
  ai_cta: string | null;
  extra_sections: { title: string; body: string }[] | null;
  status: "pending" | "review" | "published" | "failed";
  publish_at: string;
  published_at: string | null;
  updated_at: string;
};

export async function getPublishedContentBySlug(slug: string): Promise<ContentItem | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_queue")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      if (isMissingTableError(error)) return null;
      logError(error, { operation: "getPublishedContentBySlug", details: { slug } });
      return null;
    }
    return data as ContentItem | null;
  } catch (e) {
    logError(e, { operation: "getPublishedContentBySlug", details: { slug } });
    return null;
  }
}

export async function getPublishedContentByHpid(hpid: string): Promise<ContentItem | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_queue")
      .select("*")
      .eq("hpid", hpid)
      .in("status", ["published", "pending"])
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .maybeSingle();
    if (error) {
      if (isMissingTableError(error)) return null;
      logError(error, { operation: "getPublishedContentByHpid", details: { hpid } });
      return null;
    }
    return data as ContentItem | null;
  } catch (e) {
    logError(e, { operation: "getPublishedContentByHpid", details: { hpid } });
    return null;
  }
}

export async function listPublishedContent(limit = 20): Promise<ContentItem[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_queue")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) {
      if (isMissingTableError(error)) return [];
      logError(error, { operation: "listPublishedContent", details: { limit } });
      return [];
    }
    return (data as ContentItem[]) ?? [];
  } catch (e) {
    logError(e, { operation: "listPublishedContent", details: { limit } });
    return [];
  }
}

export async function getPublishedContentCount(): Promise<number> {
  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase
      .from("content_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (error) {
      if (isMissingTableError(error)) return 0;
      logError(error, { operation: "getPublishedContentCount" });
      return 0;
    }
    return count || 0;
  } catch (e) {
    logError(e, { operation: "getPublishedContentCount" });
    return 0;
  }
}

export async function getPublishedContentSitemapChunk(offset: number, limit: number): Promise<{ slug: string; updated_at: string; published_at: string | null }[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_queue")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      if (isMissingTableError(error)) return [];
      logError(error, { operation: "getPublishedContentSitemapChunk", details: { offset, limit } });
      return [];
    }
    return (data as { slug: string; updated_at: string; published_at: string | null }[]) ?? [];
  } catch (e) {
    logError(e, { operation: "getPublishedContentSitemapChunk", details: { offset, limit } });
    return [];
  }
}

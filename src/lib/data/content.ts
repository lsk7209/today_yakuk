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
      // content_queue 테이블이 아직 없을 수 있음 (초기 배포/마이그레이션 전)
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
    // published 또는 pending 상태의 콘텐츠를 가져옴 (pending도 표시 가능하도록)
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


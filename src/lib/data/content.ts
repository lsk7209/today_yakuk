import { getSupabaseServerClient } from "@/lib/supabase-server";

function isMissingTableError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "PGRST205"
  );
}

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
      console.error("content fetch error", error);
      return null;
    }
    return data as ContentItem | null;
  } catch (e) {
    console.error("content fetch exception", e);
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
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      if (isMissingTableError(error)) return null;
      console.error("content hpid fetch error", error);
      return null;
    }
    return data as ContentItem | null;
  } catch (e) {
    console.error("content hpid fetch exception", e);
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
      console.error("content list error", error);
      return [];
    }
    return (data as ContentItem[]) ?? [];
  } catch (e) {
    console.error("content list exception", e);
    return [];
  }
}


import { getSupabaseServerClient } from "@/lib/supabase-server";

export type ContentItem = {
  id: string;
  title: string;
  slug: string;
  region: string | null;
  theme: string | null;
  content_html: string | null;
  status: "pending" | "published" | "failed";
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
      console.error("content fetch error", error);
      return null;
    }
    return data as ContentItem | null;
  } catch (e) {
    console.error("content fetch exception", e);
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
      console.error("content list error", error);
      return [];
    }
    return (data as ContentItem[]) ?? [];
  } catch (e) {
    console.error("content list exception", e);
    return [];
  }
}


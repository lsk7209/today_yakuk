import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 600;

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("content_queue")
    .select("slug, title, ai_summary, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(4);

  return NextResponse.json(data ?? [], {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
  });
}

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

type ContentQueue = {
  id: string;
  title: string;
  slug: string;
  content_html: string | null;
  status: string;
  publish_at: string;
};

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function ensureEnv() {
  if (!supabaseUrl) throw new Error("SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL이 필요합니다.");
  if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
}

async function publishPending(limit = 2) {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

  const now = new Date().toISOString();
  const { data: pending, error } = await supabase
    .from("content_queue")
    .select("id, title, slug, content_html, status, publish_at")
    .eq("status", "pending")
    .lte("publish_at", now)
    .order("publish_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!pending || !pending.length) {
    console.info("No pending items to publish.");
    return;
  }

  const ids = pending.map((item) => item.id);
  const { error: updateError } = await supabase
    .from("content_queue")
    .update({ status: "published", published_at: now, updated_at: now })
    .in("id", ids);

  if (updateError) throw updateError;

  console.info(`Published ${ids.length} items:`, ids);
}

async function main() {
  ensureEnv();
  await publishPending();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


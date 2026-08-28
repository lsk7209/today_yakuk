import "dotenv/config";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getRequiredTursoClient, parseJson } from "../src/lib/turso";
import { submitSitemapToGSC } from "../src/lib/google-indexing";
import { getSiteUrl } from "../src/lib/site-url";
import type { Client } from "@libsql/client";

type ContentQueueStatus = "pending" | "review" | "published" | "failed";

type ContentQueue = {
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
  status: ContentQueueStatus;
  publish_at: string;
};

const siteUrl = getSiteUrl();

function ensureEnv() {
  if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL이 필요합니다.");
  if (!process.env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN이 필요합니다.");
}

export async function claimPendingContent(db: Client, id: string, now: string) {
  const result = await db.execute({
    sql: `UPDATE content_queue SET status = 'published', published_at = ?, updated_at = ? WHERE id = ? AND status = 'pending'`,
    args: [now, now, id],
  });
  return result.rowsAffected === 1;
}

export async function publishPending(limit = 2, db = getRequiredTursoClient()) {
  const now = new Date().toISOString();

  const result = await db.execute({
    sql: `SELECT id, hpid, title, slug, region, theme, content_html, ai_summary, ai_bullets, ai_faq, ai_cta, extra_sections, status, publish_at
          FROM content_queue
          WHERE status = 'pending' AND publish_at <= ?
          ORDER BY publish_at ASC
          LIMIT ?`,
    args: [now, limit],
  });

  if (!result.rows.length) {
    console.info("No pending items to publish.");
    return;
  }

  const pending: ContentQueue[] = result.rows.map((row) => ({
    id: row.id as string,
    hpid: row.hpid as string | null,
    title: row.title as string,
    slug: row.slug as string,
    region: row.region as string | null,
    theme: row.theme as string | null,
    content_html: row.content_html as string | null,
    ai_summary: row.ai_summary as string | null,
    ai_bullets: parseJson(row.ai_bullets, null),
    ai_faq: parseJson(row.ai_faq, null),
    ai_cta: row.ai_cta as string | null,
    extra_sections: parseJson(row.extra_sections, null),
    status: row.status as ContentQueueStatus,
    publish_at: row.publish_at as string,
  }));

  const failed = pending.filter((item) => !item.content_html && !item.ai_summary);
  const ready = pending.filter((item) => !!item.content_html || !!item.ai_summary);

  if (failed.length > 0) {
    console.warn(`Marking ${failed.length} items as 'failed' due to missing content`);
    await Promise.all(
      failed.map((item) =>
        db.execute({
          sql: `UPDATE content_queue SET status = 'failed', updated_at = ? WHERE id = ? AND status = 'pending'`,
          args: [now, item.id],
        })
      )
    );
  }

  if (!ready.length) {
    console.info("No publishable items ready.");
    return;
  }

  const publishResults = await Promise.all(
    ready.map(async (item) => {
      const claimed = await claimPendingContent(db, item.id, now);
      return { item, claimed };
    })
  );

  const published = publishResults.filter((result) => result.claimed).map((result) => result.item);

  console.info(`Published ${published.length} items.`);

  const publishedUrls: string[] = [];
  for (const item of published) {
    if (item.hpid) {
      const url = `${siteUrl}/pharmacy/${item.hpid}`;
      publishedUrls.push(url);
    } else if (item.slug) {
      const url = `${siteUrl}/blog/${item.slug}`;
      publishedUrls.push(url);
    }
  }

  if (publishedUrls.length > 0) {
    try {
      const outboxResults = await db.batch(
        publishedUrls.map((url) => ({
          sql: `INSERT INTO indexing_outbox (url, provider, event_type, status, next_attempt_at, updated_at)
            VALUES (?, 'indexnow', 'URL_UPDATED', 'pending', datetime('now'), datetime('now'))
            ON CONFLICT(url, provider, event_type) DO UPDATE SET
              status = 'pending', attempts = 0, next_attempt_at = datetime('now'), last_error = NULL, updated_at = datetime('now')`,
          args: [url],
        })),
        "write",
      );
      if (outboxResults.length !== publishedUrls.length) throw new Error("indexing outbox enqueue incomplete");
    } catch (error) {
      await db.batch(
        published.map((item) => ({
          sql: `UPDATE content_queue SET status = 'pending', published_at = NULL, updated_at = ?
            WHERE id = ? AND status = 'published' AND published_at = ?`,
          args: [new Date().toISOString(), item.id, now],
        })),
        "write",
      );
      throw error;
    }
    await submitSitemapToGSC(siteUrl, `${siteUrl}/sitemap.xml`);
  }
}

async function main() {
  ensureEnv();
  const limitRaw = process.env.PUBLISH_LIMIT ?? "10";
  const limit = Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(50, Number(limitRaw))) : 10;
  await publishPending(limit);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

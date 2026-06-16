import { getTursoClient, parseJson } from "@/lib/turso";
import { cacheDbRead } from "@/lib/db-read-cache";

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
  image_url?: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToContent(row: any): ContentItem {
  return {
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
    status: row.status as ContentItem["status"],
    publish_at: row.publish_at as string,
    published_at: row.published_at as string | null,
    updated_at: row.updated_at as string,
    image_url: row.image_url as string | null,
  };
}

export async function getPublishedContentBySlug(slug: string): Promise<ContentItem | null> {
  return cacheDbRead(["content", "published-by-slug", slug], () =>
    getPublishedContentBySlugUncached(slug),
  );
}

async function getPublishedContentBySlugUncached(slug: string): Promise<ContentItem | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: "SELECT * FROM content_queue WHERE slug = ? AND status = 'published' LIMIT 1",
      args: [slug],
    });
    if (!result.rows.length) return null;
    return rowToContent(result.rows[0]);
  } catch (e) {
    console.error("getPublishedContentBySlug exception", e);
    return null;
  }
}

export async function getPublishedContentByHpid(hpid: string): Promise<ContentItem | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: `SELECT * FROM content_queue
            WHERE hpid = ? AND status IN ('published', 'pending')
            ORDER BY CASE WHEN published_at IS NULL THEN 1 ELSE 0 END, published_at DESC, updated_at DESC
            LIMIT 1`,
      args: [hpid],
    });
    if (!result.rows.length) return null;
    return rowToContent(result.rows[0]);
  } catch (e) {
    console.error("getPublishedContentByHpid exception", e);
    return null;
  }
}

export async function listPublishedContent(limit = 20): Promise<ContentItem[]> {
  return cacheDbRead(["content", "published-list", String(limit)], () =>
    listPublishedContentUncached(limit),
  );
}

async function listPublishedContentUncached(limit = 20): Promise<ContentItem[]> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: `SELECT * FROM content_queue
            WHERE status = 'published'
            ORDER BY CASE WHEN published_at IS NULL THEN 1 ELSE 0 END, published_at DESC, updated_at DESC
            LIMIT ?`,
      args: [limit],
    });
    return result.rows.map(rowToContent);
  } catch (e) {
    console.error("listPublishedContent exception", e);
    return [];
  }
}

export async function getPublishedContentCount(): Promise<number> {
  return cacheDbRead(["content", "published-count"], () =>
    getPublishedContentCountUncached(),
  );
}

async function getPublishedContentCountUncached(): Promise<number> {
  try {
    const db = getTursoClient();
    const result = await db.execute("SELECT COUNT(*) as cnt FROM content_queue WHERE status = 'published'");
    return Number(result.rows[0]?.cnt ?? 0);
  } catch (e) {
    console.error("getPublishedContentCount exception", e);
    return 0;
  }
}

export async function getPublishedContentSitemapChunk(
  offset: number,
  limit: number,
): Promise<{ slug: string; updated_at: string; published_at: string | null }[]> {
  return cacheDbRead(["content", "published-sitemap", String(offset), String(limit)], () =>
    getPublishedContentSitemapChunkUncached(offset, limit),
  );
}

async function getPublishedContentSitemapChunkUncached(
  offset: number,
  limit: number,
): Promise<{ slug: string; updated_at: string; published_at: string | null }[]> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: `SELECT slug, updated_at, published_at FROM content_queue
            WHERE status = 'published'
            ORDER BY CASE WHEN published_at IS NULL THEN 1 ELSE 0 END, published_at DESC, updated_at DESC
            LIMIT ? OFFSET ?`,
      args: [limit, offset],
    });
    return result.rows.map((r: Record<string, unknown>) => ({
      slug: r.slug as string,
      updated_at: r.updated_at as string,
      published_at: r.published_at as string | null,
    }));
  } catch (e) {
    console.error("getPublishedContentSitemapChunk exception", e);
    return [];
  }
}

// Write operations for admin routes
export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
  try {
    const db = getTursoClient();
    const fields = Object.keys(updates);
    if (!fields.length) return null;

    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const v = (updates as Record<string, unknown>)[f];
      if (v !== null && typeof v === "object") return JSON.stringify(v);
      return v as string | number | null;
    });

    await db.execute({
      sql: `UPDATE content_queue SET ${setClauses} WHERE id = ?`,
      args: [...values, id],
    });

    const result = await db.execute({ sql: "SELECT * FROM content_queue WHERE id = ? LIMIT 1", args: [id] });
    if (!result.rows.length) return null;
    return rowToContent(result.rows[0]);
  } catch (e) {
    console.error("updateContentItem exception", e);
    throw e;
  }
}

export async function deleteContentItem(id: string): Promise<ContentItem | null> {
  try {
    const db = getTursoClient();
    const existing = await db.execute({ sql: "SELECT * FROM content_queue WHERE id = ? LIMIT 1", args: [id] });
    if (!existing.rows.length) return null;
    const item = rowToContent(existing.rows[0]);
    await db.execute({ sql: "DELETE FROM content_queue WHERE id = ?", args: [id] });
    return item;
  } catch (e) {
    console.error("deleteContentItem exception", e);
    throw e;
  }
}

export async function deleteFailedContent(): Promise<number> {
  try {
    const db = getTursoClient();
    // Count first
    const countResult = await db.execute("SELECT COUNT(*) as cnt FROM content_queue WHERE status = 'failed'");
    const count = Number(countResult.rows[0]?.cnt ?? 0);
    await db.execute("DELETE FROM content_queue WHERE status = 'failed'");
    return count;
  } catch (e) {
    console.error("deleteFailedContent exception", e);
    throw e;
  }
}

export async function getLastPendingPublishAt(): Promise<string | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute(
      "SELECT publish_at FROM content_queue WHERE status = 'pending' ORDER BY publish_at DESC LIMIT 1"
    );
    return (result.rows[0]?.publish_at as string | null) ?? null;
  } catch (e) {
    console.error("getLastPendingPublishAt exception", e);
    return null;
  }
}

export async function getContentBySlug(slug: string): Promise<{ id: string } | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({ sql: "SELECT id FROM content_queue WHERE slug = ? LIMIT 1", args: [slug] });
    if (!result.rows.length) return null;
    return { id: result.rows[0].id as string };
  } catch (e) {
    console.error("getContentBySlug exception", e);
    return null;
  }
}

export async function getContentItemById(id: string): Promise<ContentItem | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({ sql: "SELECT * FROM content_queue WHERE id = ? LIMIT 1", args: [id] });
    if (!result.rows.length) return null;
    return rowToContent(result.rows[0]);
  } catch (e) {
    console.error("getContentItemById exception", e);
    return null;
  }
}

export async function listContentQueue(limit = 50): Promise<ContentItem[]> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: "SELECT * FROM content_queue ORDER BY publish_at DESC LIMIT ?",
      args: [limit],
    });
    return result.rows.map(rowToContent);
  } catch (e) {
    console.error("listContentQueue exception", e);
    return [];
  }
}

export async function insertContentItem(item: {
  hpid: string | null;
  title: string;
  slug: string;
  theme: string;
  content_html: string;
  ai_summary: string;
  ai_faq: unknown;
  status: string;
  publish_at: string;
}): Promise<void> {
  const db = getTursoClient();
  await db.execute({
    sql: `INSERT INTO content_queue (id, hpid, title, slug, theme, content_html, ai_summary, ai_faq, status, publish_at, updated_at)
          VALUES (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      item.hpid,
      item.title,
      item.slug,
      item.theme,
      item.content_html,
      item.ai_summary,
      JSON.stringify(item.ai_faq),
      item.status,
      item.publish_at,
    ],
  });
}

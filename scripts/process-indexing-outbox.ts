import "dotenv/config";
import { getRequiredTursoClient } from "../src/lib/turso";
import { submitToIndexNow } from "../src/lib/naver-indexnow";

type OutboxRow = { id: string; url: string; attempts: number };

async function main() {
  const db = getRequiredTursoClient();
  const result = await db.execute(`SELECT id, url, attempts FROM indexing_outbox
    WHERE provider = 'indexnow' AND status = 'pending' AND datetime(next_attempt_at) <= datetime('now')
    ORDER BY created_at ASC LIMIT 50`);
  let succeeded = 0;
  let failed = 0;
  for (const raw of result.rows) {
    const row: OutboxRow = { id: String(raw.id), url: String(raw.url), attempts: Number(raw.attempts) };
    try {
      const accepted = await submitToIndexNow([row.url]);
      if (!accepted) throw new Error("all IndexNow endpoints rejected the URL");
      await db.execute({
        sql: `UPDATE indexing_outbox SET status = 'completed', attempts = attempts + 1,
          last_error = NULL, updated_at = datetime('now') WHERE id = ? AND status = 'pending'`,
        args: [row.id],
      });
      succeeded++;
    } catch (error) {
      const attempts = row.attempts + 1;
      const retryMinutes = Math.min(360, 2 ** attempts * 5);
      const nextAttempt = new Date(Date.now() + retryMinutes * 60_000).toISOString();
      await db.execute({
        sql: `UPDATE indexing_outbox SET status = ?, attempts = ?, next_attempt_at = ?,
          last_error = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [attempts >= 5 ? "failed" : "pending", attempts, nextAttempt, String(error).slice(0, 1000), row.id],
      });
      failed++;
    }
  }
  console.info(`[indexing-outbox] selected=${result.rows.length} succeeded=${succeeded} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("[indexing-outbox] fatal", error);
  process.exitCode = 1;
});

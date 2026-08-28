import type { Client } from "@libsql/client";

export type SyncSource = "pharmacies" | "hff" | "medicines";

const TABLE_BY_SOURCE: Record<SyncSource, string> = {
  pharmacies: "pharmacies",
  hff: "supplements",
  medicines: "medicines",
};

export async function getSourceRowCount(db: Client, source: SyncSource) {
  const result = await db.execute(`SELECT COUNT(*) AS count FROM ${TABLE_BY_SOURCE[source]}`);
  return Number(result.rows[0]?.count ?? 0);
}

export async function startSyncRun(
  db: Client,
  input: { source: SyncSource; mode: string; startedAt: string; countBefore: number },
) {
  const id = `${input.source}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await db.execute({
    sql: `INSERT INTO public_data_sync_runs
      (id, source, mode, status, started_at, db_count_before)
      VALUES (?, ?, ?, 'running', ?, ?)`,
    args: [id, input.source, input.mode, input.startedAt, input.countBefore],
  });
  return id;
}

export async function finishSyncRun(
  db: Client,
  input: {
    id: string;
    status: "success" | "failed";
    finishedAt: string;
    countBefore: number;
    countAfter: number;
    durationSeconds: number;
    error?: string;
  },
) {
  await db.execute({
    sql: `UPDATE public_data_sync_runs
      SET status = ?, finished_at = ?, db_count_after = ?, inserted_count = ?,
          duration_seconds = ?, error_message = ?
      WHERE id = ? AND status = 'running'`,
    args: [
      input.status,
      input.finishedAt,
      input.countAfter,
      Math.max(0, input.countAfter - input.countBefore),
      input.durationSeconds,
      input.error?.slice(0, 1000) ?? null,
      input.id,
    ],
  });
}

export function staleSources(
  now: Date,
  latestSuccess: Partial<Record<SyncSource, string>>,
) {
  const thresholdsMs: Record<SyncSource, number> = {
    pharmacies: 36 * 60 * 60 * 1000,
    hff: 9 * 24 * 60 * 60 * 1000,
    medicines: 9 * 24 * 60 * 60 * 1000,
  };
  return (Object.keys(thresholdsMs) as SyncSource[]).filter((source) => {
    const value = latestSuccess[source];
    if (!value) return true;
    const timestamp = new Date(value).getTime();
    return !Number.isFinite(timestamp) || now.getTime() - timestamp > thresholdsMs[source];
  });
}

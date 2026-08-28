import "dotenv/config";
import fs from "node:fs";
import { getRequiredTursoClient } from "../src/lib/turso";
import { staleSources, type SyncSource } from "./lib/sync-run-metrics";

async function main() {
  const db = getRequiredTursoClient();
  const result = await db.execute(`SELECT source, MAX(finished_at) AS finished_at
    FROM public_data_sync_runs
    WHERE status = 'success' AND verification_status = 'passed'
    GROUP BY source`);
  const latest: Partial<Record<SyncSource, string>> = {};
  for (const row of result.rows) latest[row.source as SyncSource] = String(row.finished_at);
  const stale = staleSources(new Date(), latest);
  const value = stale.join(",");
  console.info(`[sync-freshness] stale_sources=${value || "none"}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `stale_sources=${value}\n`);
}

main().catch((error) => {
  console.error("[sync-freshness] failed", error);
  process.exitCode = 1;
});

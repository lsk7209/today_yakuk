import { getRequiredTursoClient } from "../src/lib/turso";
import { PHARMACY_INDEXABLE_WHERE } from "../src/lib/pharmacy-indexability";
import { MEDICINE_INDEXABLE_WHERE, SUPPLEMENT_INDEXABLE_WHERE } from "../src/lib/wiki-indexability";
import { buildWikiMedicinePath, buildWikiProductPath } from "../src/lib/wiki-slug";
import type { SyncSource } from "./lib/sync-run-metrics";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://todaypharm.kr").replace(/\/$/, "");
const SITEMAP_BY_SOURCE: Record<SyncSource, string> = {
  pharmacies: "pharmacies-0",
  hff: "supplements-0",
  medicines: "medicines-0",
};

async function latestPublicSample(db: ReturnType<typeof getRequiredTursoClient>, source: SyncSource) {
  if (source === "pharmacies") {
    const result = await db.execute(`SELECT hpid FROM pharmacies ${PHARMACY_INDEXABLE_WHERE}
      ORDER BY updated_at DESC, hpid ASC LIMIT 1`);
    const hpid = String(result.rows[0]?.hpid ?? "");
    return hpid ? `${SITE_URL}/pharmacy/${hpid}` : "";
  }
  const table = source === "hff" ? "supplements" : "medicines";
  const where = source === "hff" ? SUPPLEMENT_INDEXABLE_WHERE : MEDICINE_INDEXABLE_WHERE;
  const result = await db.execute(`SELECT id, name FROM ${table} ${where} ORDER BY created_at DESC LIMIT 1`);
  const item = result.rows[0];
  if (!item) return "";
  const entity = { id: String(item.id), name: String(item.name) };
  const path = source === "hff" ? buildWikiProductPath(entity) : buildWikiMedicinePath(entity);
  return `${SITE_URL}${path}`;
}

async function markVerification(
  db: ReturnType<typeof getRequiredTursoClient>, source: SyncSource,
  status: "passed" | "failed", detail: string,
) {
  await db.execute({
    sql: `UPDATE public_data_sync_runs SET verification_status = ?, verification_detail = ?
      WHERE id = (SELECT id FROM public_data_sync_runs
        WHERE source = ? AND status = 'success' ORDER BY finished_at DESC LIMIT 1)`,
    args: [status, detail.slice(0, 1000), source],
  });
}

async function main() {
  const selected = (process.argv[2] || "pharmacies,hff,medicines").split(",") as SyncSource[];
  const db = getRequiredTursoClient();
  for (const source of selected) {
    if (!(source in SITEMAP_BY_SOURCE)) throw new Error(`unknown source: ${source}`);
    try {
      const sampleUrl = await latestPublicSample(db, source);
      if (!sampleUrl) throw new Error(`${source} has no indexable database sample`);
      const sitemapUrl = `${SITE_URL}/sitemap/${SITEMAP_BY_SOURCE[source]}.xml`;
      const sitemapResponse = await fetch(sitemapUrl, { redirect: "error" });
      if (!sitemapResponse.ok) throw new Error(`${sitemapUrl} returned ${sitemapResponse.status}`);
      const sitemapXml = await sitemapResponse.text();
      if (!sitemapXml.includes(sampleUrl)) throw new Error(`${source} latest DB sample is absent from public sitemap`);
      const detailResponse = await fetch(sampleUrl, { redirect: "error" });
      if (!detailResponse.ok) throw new Error(`${sampleUrl} returned ${detailResponse.status}`);
      await markVerification(db, source, "passed", `sample=${sampleUrl}; sitemap=${sitemapUrl}`);
      console.info(`[post-sync] ${source}: sample and public detail verified`);
    } catch (error) {
      await markVerification(db, source, "failed", String(error));
      throw error;
    }
  }
}

main().catch((error) => {
  console.error("[post-sync] verification failed", error);
  process.exitCode = 1;
});

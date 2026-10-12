import { createClient } from "@libsql/client";
import { latestPublicSample } from "./verify-public-site-after-sync";
import { writeFileSync } from "node:fs";

async function main() {
  const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });
  const result: Record<string, unknown> = { checkedAt: new Date().toISOString(), mode: "readonly-SELECT-only", stagingParity: "NOT_VERIFIED" };
  try {
    const counts: Record<string, number> = {};
    for (const table of ["pharmacies", "supplements", "medicines", "ingredients"]) {
      const rows = await db.execute(`SELECT COUNT(*) AS n FROM ${table}`);
      counts[table] = Number(rows.rows[0].n);
    }
    result.counts = counts;
    const samples = [];
    for (const source of ["pharmacies", "hff", "medicines"] as const) {
      const { sampleUrl, sitemapId } = await latestPublicSample(db, source);
      if (!sampleUrl) throw new Error("Missing indexable sample: " + source);
      const sitemap = await fetch(`https://todaypharm.kr/sitemap/${sitemapId}.xml`, { signal: AbortSignal.timeout(20000) });
      const xml = await sitemap.text();
      const detail = await fetch(sampleUrl, { signal: AbortSignal.timeout(20000) });
      const html = await detail.text();
      let oldChunkContainsSample: boolean | undefined;
      if (source === "pharmacies" && sitemapId !== "pharmacies-0") {
        const old = await fetch("https://todaypharm.kr/sitemap/pharmacies-0.xml", { signal: AbortSignal.timeout(20000) });
        oldChunkContainsSample = (await old.text()).includes(sampleUrl);
      }
      samples.push({ source, sampleUrl, sitemapId, sitemapStatus: sitemap.status, present: xml.includes(sampleUrl), detailStatus: detail.status, nonemptyDetail: html.length > 1000, oldChunkContainsSample });
    }
    result.samples = samples;
    const region = await db.execute("SELECT province FROM pharmacies WHERE province IS NOT NULL ORDER BY hpid LIMIT 1");
    const province = String(region.rows[0].province);
    const expected = await db.execute({ sql: "SELECT hpid FROM pharmacies WHERE province = ? ORDER BY name ASC LIMIT 5", args: [province] });
    const response = await fetch(`https://todaypharm.kr/api/pharmacies?province=${encodeURIComponent(province)}&limit=5`, { signal: AbortSignal.timeout(20000) });
    const body = await response.json();
    const actual = (body.items || []).map((row: {hpid: string}) => row.hpid);
    result.regionSearch = { province, expectedIds: expected.rows.map(row => row.hpid), status: response.status, expectedCount: expected.rows.length, returnedCount: actual.length, idsMatch: JSON.stringify(actual) === JSON.stringify(expected.rows.map(row => row.hpid)) };
    result.pass = samples.every(row => row.sitemapStatus === 200 && row.present && row.detailStatus === 200 && row.nonemptyDetail) && (result.regionSearch as {idsMatch: boolean}).idsMatch;
    writeFileSync(".migration-evidence/live-readonly-check.json", JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    if (!result.pass) process.exitCode = 1;
  } finally { db.close(); }
}
main().catch(error => { console.error("Readonly migration check failed:", error instanceof Error ? error.name : "UnknownError"); process.exitCode = 1; });

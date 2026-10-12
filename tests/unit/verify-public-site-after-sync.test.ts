import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { PHARMACY_INDEXABLE_WHERE } from "../../src/lib/pharmacy-indexability";

async function main() {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://todaypharm.kr";
  const { latestPublicSample } = await import("../../scripts/verify-public-site-after-sync");
  const db = createClient({ url: ":memory:" });
  try {
    await db.execute(`CREATE TABLE pharmacies (
      hpid TEXT PRIMARY KEY, address TEXT, tel TEXT, operating_hours TEXT, updated_at TEXT
    )`);
    await db.execute(`WITH RECURSIVE numbers(n) AS (
      SELECT 0 UNION ALL SELECT n + 1 FROM numbers WHERE n < 2000
    ) INSERT INTO pharmacies (hpid, address, tel, updated_at)
      SELECT 'p' || printf('%04d', n), '서울특별시 강남구 테헤란로 123',
        '02-1234-5678', '2026-01-01' FROM numbers`);
    await db.execute(`INSERT INTO pharmacies (hpid, address, tel, updated_at) VALUES
      ('p-early', 'short', '02-1234-5678', '2027-01-01'),
      ('p-before', '서울특별시 강남구 테헤란로 123', NULL, '2027-01-01')`);

    for (const [hpid, chunk] of [
      ["p0999", "pharmacies-0"],
      ["p1000", "pharmacies-1"],
      ["p1999", "pharmacies-1"],
      ["p2000", "pharmacies-2"],
    ] as const) {
      await db.execute({ sql: "UPDATE pharmacies SET updated_at = '2026-02-01' WHERE hpid = ?", args: [hpid] });
      const sample = await latestPublicSample(db, "pharmacies");
      assert.deepEqual(sample, {
        sampleUrl: `https://todaypharm.kr/pharmacy/${hpid}`,
        sitemapId: chunk,
      });
      const sitemapChunk = await db.execute({
        sql: `SELECT hpid FROM pharmacies ${PHARMACY_INDEXABLE_WHERE}
          ORDER BY hpid ASC LIMIT 1000 OFFSET ?`,
        args: [Number(chunk.slice(-1)) * 1000],
      });
      assert.ok(sitemapChunk.rows.some((row) => row.hpid === hpid));
      if (chunk !== "pharmacies-0") {
        const oldChunk = await db.execute(`SELECT hpid FROM pharmacies ${PHARMACY_INDEXABLE_WHERE}
          ORDER BY hpid ASC LIMIT 1000 OFFSET 0`);
        assert.ok(!oldChunk.rows.some((row) => row.hpid === hpid));
      }
      await db.execute({ sql: "UPDATE pharmacies SET updated_at = '2026-01-01' WHERE hpid = ?", args: [hpid] });
    }

    await db.execute("UPDATE pharmacies SET updated_at = '2026-03-01' WHERE hpid IN ('p1000', 'p2000')");
    assert.deepEqual(await latestPublicSample(db, "pharmacies"), {
      sampleUrl: "https://todaypharm.kr/pharmacy/p1000",
      sitemapId: "pharmacies-1",
    });
  } finally {
    db.close();
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
  }
  console.log("Post-sync pharmacy sitemap chunk selection PASS (local in-memory DB).");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

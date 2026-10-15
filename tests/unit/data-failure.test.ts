import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { resetTursoClientForTest } from "../../src/lib/turso";
import { DataReadError } from "../../src/lib/data/errors";
import { getIndexablePharmacyCount, getPharmaciesByRegionPaginated } from "../../src/lib/data/pharmacies";
import { getSitemapIds } from "../../src/lib/sitemap";
import { withSitemapFailureGuard } from "../../src/lib/sitemap-response";

const dir = mkdtempSync(join(tmpdir(), "todaypharm-failure-"));

function switchDatabase(url: string) {
  process.env.TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "test-token";
  resetTursoClientForTest();
}

async function seedHealthyDatabase(path: string) {
  const db = createClient({ url: `file:${path}` });
  await db.executeMultiple(readFileSync(join(__dirname, "..", "..", "turso-schema.sql"), "utf8"));
  db.close();
}

async function main() {
  const brokenUrl = `file:${join(dir, "missing-dir", "broken.db")}`;
  const healthyPath = join(dir, "healthy.db");
  await seedHealthyDatabase(healthyPath);

  // 11/12. DB failure is a thrown DataReadError, never an empty result.
  switchDatabase(brokenUrl);
  await assert.rejects(() => getIndexablePharmacyCount(), DataReadError);
  await assert.rejects(() => getPharmaciesByRegionPaginated("서울", "종로구"), DataReadError);
  await assert.rejects(() => getSitemapIds(), DataReadError, "sitemap ids must not collapse to ['static']");
  console.log("PASS 11. DB failure rejects instead of returning 0 / [] / empty sitemap ids");

  const failed = await withSitemapFailureGuard(async () => {
    await getSitemapIds();
    return new Response("ok");
  });
  assert.equal(failed.status, 503);
  assert.match(failed.headers.get("Cache-Control") ?? "", /no-store/);
  assert.ok(failed.headers.get("Retry-After"));
  const passthrough = await withSitemapFailureGuard(async () => new Response("<urlset/>", { status: 200 }));
  assert.equal(passthrough.status, 200);
  console.log("PASS 12a. sitemap guard returns uncacheable 503 on failure and passes success through");

  // Recovery: nothing from the failed period is remembered.
  switchDatabase(`file:${healthyPath}`);
  assert.equal(await getIndexablePharmacyCount(), 0, "genuinely empty healthy DB resolves to 0");
  assert.deepEqual(await getSitemapIds(), ["static"]);
  const items = await getPharmaciesByRegionPaginated("서울", "종로구");
  assert.deepEqual(items, { items: [], total: 0 }, "genuine absence stays an empty result (-> 404 upstream)");
  console.log("PASS 12b. after recovery, absence and success resolve normally");

  // Production runtime without DB credentials must not fall back to the dummy client.
  const env = process.env as Record<string, string | undefined>;
  const saved = { ...env };
  delete env.TURSO_DATABASE_URL;
  delete env.TURSO_AUTH_TOKEN;
  env.NODE_ENV = "production";
  delete env.NEXT_PHASE;
  resetTursoClientForTest();
  await assert.rejects(() => getIndexablePharmacyCount(), DataReadError);
  env.NEXT_PHASE = "phase-production-build";
  resetTursoClientForTest();
  assert.equal(await getIndexablePharmacyCount(), 0, "build phase keeps the dummy client");
  Object.assign(env, saved);
  console.log("PASS 12c. production runtime without credentials fails instead of serving empty data");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

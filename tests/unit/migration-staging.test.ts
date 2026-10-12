import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { isMigrationStaging, isStagingMutation } from "@/lib/migration-staging";
import { checkReadiness } from "@/app/api/health/ready/route";
import { trackAnalyticsEvent } from "@/lib/client-analytics";

async function run() {
  assert.equal(isMigrationStaging({ MIGRATION_STAGING: "1" }), true);
  assert.equal(isMigrationStaging({ MIGRATION_STAGING: "true" }), false);
  assert.equal(isStagingMutation("POST", "/api/admin/login"), true);
  assert.equal(isStagingMutation("DELETE", "/api/admin/queue/1"), true);
  assert.equal(isStagingMutation("GET", "/api/revalidate"), true);
  assert.equal(isStagingMutation("GET", "/api/revalidate/"), true);
  assert.equal(isStagingMutation("HEAD", "/api/revalidate///"), true);
  assert.equal(isStagingMutation("OPTIONS", "/api/revalidate/"), true);
  assert.equal(isStagingMutation("GET", "/api/pharmacies"), false);
  assert.equal(isStagingMutation("POST", "/pharmacy/123"), true);
  assert.equal(isStagingMutation("GET", "/admin"), true);
  assert.equal(isStagingMutation("HEAD", "/admin/login"), true);
  assert.equal(isStagingMutation("OPTIONS", "/api/admin/login"), true);
  assert.equal(isStagingMutation("GET", "/api/admin/queue/1"), true);
  assert.equal(isStagingMutation("GET", "/administrator"), false);

  const previous = process.env.MIGRATION_STAGING;
  try {
    process.env.MIGRATION_STAGING = "1";
    for (const [method, pathname] of [["POST", "/api/analytics"], ["POST", "/api/admin/login"], ["GET", "/api/revalidate"], ["GET", "/api/revalidate/"], ["HEAD", "/api/revalidate/"], ["OPTIONS", "/api/revalidate/"], ["GET", "/admin/login"], ["HEAD", "/admin"], ["OPTIONS", "/api/admin/login"], ["GET", "/api/admin/queue/1"]]) {
      const response = await proxy(new NextRequest(`http://localhost${pathname}`, { method }));
      assert.equal(response.status, 403, `${method} ${pathname}`);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
    }
    const page = await proxy(new NextRequest("http://localhost/"));
    assert.equal(page.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
    const asset = await proxy(new NextRequest("http://localhost/logo.svg"));
    assert.equal(asset.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
    const slashPage = await proxy(new NextRequest("http://localhost/wiki/?category=omega3"));
    assert.equal(slashPage.status, 308);
    assert.equal(slashPage.headers.get("location"), "http://localhost/wiki?category=omega3");
    assert.equal(slashPage.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");

    assert.equal((await checkReadiness({ MIGRATION_STAGING: "1", TURSO_DATABASE_URL: undefined })).status, 503);
    assert.equal((await checkReadiness({ MIGRATION_STAGING: "1", TURSO_DATABASE_URL: "libsql://remote.example" })).status, 503);
    assert.equal((await checkReadiness({ MIGRATION_STAGING: "1", TURSO_DATABASE_URL: "file:./missing-migration-test.sqlite" })).status, 503);
  } finally {
    if (previous === undefined) delete process.env.MIGRATION_STAGING;
    else process.env.MIGRATION_STAGING = previous;
  }
  if (previous !== "1") {
    const production = await proxy(new NextRequest("http://localhost/api/revalidate"));
    assert.equal(production.headers.get("x-robots-tag"), null);
    assert.equal(production.status, 200);
    const adminLogin = await proxy(new NextRequest("http://localhost/admin/login"));
    assert.equal(adminLogin.status, 200);
  }
  const previousPublic = process.env.NEXT_PUBLIC_MIGRATION_STAGING;
  const previousWindow = globalThis.window;
  try {
    process.env.NEXT_PUBLIC_MIGRATION_STAGING = "1";
    Object.defineProperty(globalThis, "window", { configurable: true, value: { dataLayer: [] } });
    trackAnalyticsEvent("pharmacy_search_submitted", { search_mode: "keyword" });
    assert.equal(window.dataLayer?.length, 0);
    delete process.env.NEXT_PUBLIC_MIGRATION_STAGING;
    trackAnalyticsEvent("pharmacy_search_submitted", { search_mode: "keyword" });
    assert.equal(window.dataLayer?.length, 1);
  } finally {
    if (previousPublic === undefined) delete process.env.NEXT_PUBLIC_MIGRATION_STAGING;
    else process.env.NEXT_PUBLIC_MIGRATION_STAGING = previousPublic;
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, "window");
    else Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  }
  console.log("PASS migration staging isolation");
}

run().catch((error) => { console.error(error); process.exitCode = 1; });

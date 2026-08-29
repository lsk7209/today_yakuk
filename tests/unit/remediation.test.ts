import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { XMLParser } from "fast-xml-parser";
import { NextRequest } from "next/server";
import { contentItemUpdateSchema } from "@/lib/content-update";
import { getCoordinateBounds, parseNearbyRadius } from "@/lib/geo-bounds";
import { longitudeDegreeScale } from "@/lib/geo-distance";
import { buildHffUpsertStatement } from "@/lib/hff-upsert";
import { highlightSafeText } from "@/lib/safe-highlight";
import { sanitizeTrustedHtml } from "@/lib/sanitize-html";
import { safeJsonStringify } from "@/components/seo/json-ld";
import { buildArticleJsonLd } from "@/lib/seo";
import {
  bucketResultCount,
  buildAnalyticsPayload,
  normalizeAnalyticsPage,
  normalizeAnalyticsReferrer,
} from "@/lib/client-analytics";
import { hasValidPhone, isIndexablePharmacy } from "@/lib/pharmacy-indexability";
import {
  isIndexableMedicine,
  isIndexableSupplement,
  SUPPLEMENT_INDEXABLE_WHERE,
} from "@/lib/wiki-indexability";
import { parseSitemapId } from "@/lib/sitemap-id";
import {
  fetchBoundedSameOriginText,
  parsePublicSitemapIndex,
  parsePublicUrlSet,
  selectEntriesSince,
} from "@/lib/public-sitemap-audit";
import { analyzeProduct } from "../../scripts/lib/nutrition-parser";
import {
  getEnrichmentOffset,
  persistSupplementEnrichment,
} from "../../scripts/lib/supplement-enrichment";
import { getVerifiedNutritionFacts } from "@/lib/wiki-nutrition";
import { getNextSlot } from "@/lib/scheduler";
import { AdditiveSignal } from "@/components/wiki/AdditiveSignal";
import { createClient } from "@libsql/client";
import { assertExpectedRowsAffected, getRequiredTursoClient } from "@/lib/turso";
import { claimPendingContent } from "../../scripts/publish-queue";
import { parsePharmacyApiResponse } from "../../scripts/sync-pharmacies";
import {
  finishSyncRun,
  getSourceRowCount,
  staleSources,
  startSyncRun,
} from "../../scripts/lib/sync-run-metrics";

async function run(name: string, test: () => void | Promise<void>) {
  await test();
  console.log(`PASS ${name}`);
}

async function main() {
  await run("safe highlighting escapes source HTML before adding trusted markup", () => {
    const html = highlightSafeText('<img src=x onerror="alert(1)"> 02:30', [
      { pattern: /\d{2}:\d{2}/g, className: "time" },
    ]);
    assert.doesNotMatch(html, /<img/i);
    assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
    assert.match(html, /<strong class="time">02:30<\/strong>/);
  });

  await run("stored HTML and JSON-LD serializers block encoded script breakouts", () => {
    const html = sanitizeTrustedHtml(
      '<a class="safe" href="java&#x73;cript:alert(1)" target="_blank">link</a>' +
        '<img src="https://example.com/x.png" onerror="alert(2)">' +
        '<svg onload="alert(3)"><circle></circle></svg>',
    );
    assert.doesNotMatch(html, /javascript|onerror|onload|<svg|<circle/i);
    assert.match(html, /class="safe"/);
    assert.match(html, /rel="nofollow noopener noreferrer"/);
    assert.match(html, /src="https:\/\/example\.com\/x\.png"/);

    const jsonLd = safeJsonStringify({ name: "</script><script>alert(1)</script>" });
    assert.doesNotMatch(jsonLd, /<\/script/i);
    assert.match(jsonLd, /\\u003c\/script>/i);
  });

  await run("admin update schema rejects unknown and empty payloads", () => {
    assert.equal(contentItemUpdateSchema.safeParse({ status: "published" }).success, true);
    assert.equal(contentItemUpdateSchema.safeParse({ status: "invalid" }).success, false);
    assert.equal(contentItemUpdateSchema.safeParse({}).success, false);
    assert.equal(
      contentItemUpdateSchema.safeParse({ title: "safe", "title = 'owned' --": "x" }).success,
      false,
    );
  });

  await run("nearby radius and longitude bounds are validated", () => {
    assert.equal(parseNearbyRadius("3"), 3);
    assert.equal(parseNearbyRadius("NaN"), null);
    assert.equal(parseNearbyRadius("-1"), null);
    assert.equal(parseNearbyRadius("51"), null);
    const bounds = getCoordinateBounds(37.5665, 126.978, 10);
    assert.ok(bounds.maxLon - bounds.minLon > bounds.maxLat - bounds.minLat);
  });

  await run("conversion analytics allowlists useful fields without health or location payloads", () => {
    const payload = buildAnalyticsPayload("pharmacy_contact_intent", {
      pharmacy_id: "HPID-1",
      source_surface: "home_results",
      opening_status: "영업 중",
      result_rank: 2,
      query: "민감한 검색어",
      telephone: "02-0000-0000",
      latitude: 37.5,
      longitude: 127,
    });
    assert.deepEqual(payload, {
      eventName: "pharmacy_contact_intent",
      params: {
        pharmacy_id: "HPID-1",
        source_surface: "home_results",
        opening_status: "영업 중",
        result_rank: 2,
      },
    });
    assert.equal(bucketResultCount(0), "0");
    assert.equal(bucketResultCount(3), "1-3");
    assert.equal(bucketResultCount(11), "11-20");
    assert.equal(bucketResultCount(21), "21+");
    assert.equal(normalizeAnalyticsPage("/nearby?q=감기약#results"), "/nearby");
    assert.equal(
      normalizeAnalyticsReferrer("https://search.example/results?q=민감한+검색어#top"),
      "search.example/results",
    );
    assert.equal(normalizeAnalyticsReferrer("javascript:alert(1)"), null);
  });

  await run("phone CTA validation rejects placeholders", () => {
    assert.equal(hasValidPhone("02-123-4567"), true);
    assert.equal(hasValidPhone("031-1234-5678"), true);
    assert.equal(hasValidPhone("031-000-0000"), false);
    assert.equal(hasValidPhone("12345"), false);
    assert.equal(isIndexablePharmacy({ address: "서울특별시 중구 테스트로 1", tel: "031-000-0000" }), false);
  });

  await run("detail metadata and sitemap share non-empty indexability rules", () => {
    assert.equal(
      isIndexableSupplement({ name: "정상 제품", nutrition_facts: [], tags: [] }),
      false,
    );
    assert.equal(
      isIndexableSupplement({ name: "정상 제품", nutrition_facts: [], tags: ["비타민"] }),
      true,
    );
    const inferredFact = {
      name: "비타민C",
      amount: 1000,
      unit: "mg",
      percent_dv: null,
      source: "product-name-inference",
    };
    const verifiedFact = { ...inferredFact, source: "foodsafetykorea:C003" };
    assert.equal(
      isIndexableSupplement({ name: "정상 제품", nutrition_facts: [inferredFact], tags: [] }),
      false,
    );
    assert.equal(
      isIndexableSupplement({ name: "정상 제품", nutrition_facts: [verifiedFact], tags: [] }),
      true,
    );
    assert.deepEqual(getVerifiedNutritionFacts([inferredFact]), []);
    assert.equal(getVerifiedNutritionFacts([verifiedFact]).length, 1);
    assert.doesNotMatch(SUPPLEMENT_INDEXABLE_WHERE, /ai_summary/);
    assert.match(SUPPLEMENT_INDEXABLE_WHERE, /foodsafetykorea:C003/);
    assert.deepEqual(analyzeProduct("비타민C 1000", "", "").nutrition_facts, []);
    assert.equal(
      isIndexableMedicine({ name: "정상 의약품", efficacy: " ", use_method: null }),
      false,
    );
    assert.equal(
      isIndexableMedicine({ name: "정상 의약품", efficacy: "공개 효능 정보" }),
      true,
    );
    assert.equal(isIndexableMedicine({ name: "test medicine", efficacy: "내용" }), false);
  });

  await run("supplement enrichment skips empty facts and writes only factual fields", async () => {
    const statements: Array<{ sql: string; args: string[] }> = [];
    const execute = async (statement: { sql: string; args: string[] }) => {
      statements.push(statement);
    };
    const emptyAnalysis = analyzeProduct("비타민C 1000", "", "");

    assert.equal(
      await persistSupplementEnrichment(
        { id: "empty", analysis: emptyAnalysis, additives: { details: [] } },
        execute,
      ),
      "no_data",
    );
    assert.equal(statements.length, 0);

    const factualAnalysis = {
      ...emptyAnalysis,
      nutrition_facts: [
        {
          name: "비타민C",
          amount: 100,
          unit: "mg",
          percent_dv: 100,
          source: "foodsafetykorea:C003" as const,
        },
      ],
    };
    assert.equal(
      await persistSupplementEnrichment(
        { id: "factual", analysis: factualAnalysis, additives: { details: ["구연산"] } },
        execute,
      ),
      "updated",
    );
    assert.equal(statements.length, 1);
    assert.match(statements[0].sql, /SET nutrition_facts = \?, additives = \?/);
    assert.doesNotMatch(statements[0].sql, /ai_summary/);
    assert.match(statements[0].args[0], /foodsafetykorea:C003/);
    assert.equal(statements[0].args[2], "factual");
    assert.equal(getEnrichmentOffset(100, 15, 0), 0);
    assert.equal(getEnrichmentOffset(100, 15, 1), 15);
    assert.equal(getEnrichmentOffset(100, 15, 7), 5);
  });

  await run("scheduler returns the first strict UTC publishing slot", () => {
    assert.equal(
      getNextSlot(new Date("2026-09-21T12:00:00.000Z")).toISOString(),
      "2026-09-22T00:00:00.000Z",
    );
    assert.equal(
      getNextSlot(new Date("2026-09-21T05:59:59.999Z")).toISOString(),
      "2026-09-21T06:00:00.000Z",
    );
    assert.equal(
      getNextSlot(new Date("2026-09-21T06:00:00.000Z")).toISOString(),
      "2026-09-21T12:00:00.000Z",
    );
    assert.equal(
      getNextSlot(new Date("2026-09-21T23:59:59.999Z")).toISOString(),
      "2026-09-22T00:00:00.000Z",
    );
    assert.equal(
      getNextSlot(new Date("2026-09-22T00:00:00.000Z")).toISOString(),
      "2026-09-22T06:00:00.000Z",
    );
  });

  await run("additive signal renders three evidence states without absence claims", () => {
    const render = (value?: boolean) =>
      renderToStaticMarkup(
        createElement(AdditiveSignal, {
          additives: {
            has_preservatives: value,
            has_coloring: value,
            has_artificial_sweeteners: value,
          },
        }),
      );
    const count = (html: string, pattern: RegExp) => (html.match(pattern) ?? []).length;

    const matched = render(true);
    const notMatched = render(false);
    const unavailable = render();

    assert.equal(count(matched, />관련 키워드 표시</g), 3);
    assert.equal(count(notMatched, />지정 키워드 미확인</g), 4);
    assert.equal(count(unavailable, />자료 없음</g), 3);
    for (const html of [matched, notMatched, unavailable]) {
      assert.match(html, /성분의 부재나 안전성 판정이 아닙니다/);
      assert.match(html, /href="\/blog\/supplement-additives-label-guide"/);
    }
  });

  await run("article and sitemap freshness use explicit significant dates", () => {
    const undated = buildArticleJsonLd({
      title: "테스트",
      description: "테스트 설명",
      slug: "/guide/test",
    });
    assert.equal("datePublished" in undated, false);
    assert.equal("dateModified" in undated, false);

    const dated = buildArticleJsonLd({
      title: "테스트",
      description: "테스트 설명",
      slug: "/guide/test",
      datePublished: "2026-08-01",
      dateModified: "2026-08-28",
    });
    assert.equal(dated.datePublished, "2026-08-01");
    assert.equal(dated.dateModified, "2026-08-28");

    const sitemapIndex = fs.readFileSync(
      path.join(process.cwd(), "src/app/sitemap-index.xml/route.ts"),
      "utf8",
    );
    const sitemap = fs.readFileSync(
      path.join(process.cwd(), "src/lib/sitemap-content.ts"),
      "utf8",
    );
    const layout = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
    assert.doesNotMatch(sitemapIndex, /<lastmod>/);
    assert.match(sitemap, /SEO_TEMPLATE_REVISION/);
    assert.doesNotMatch(sitemap, /lastModified:\s*new Date\(\)/);
    for (const province of ["서울", "경기", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]) {
      assert.match(sitemap, new RegExp(`"${province}"`));
    }
    assert.doesNotMatch(layout, /searchUrl:/);
    assert.deepEqual(parseSitemapId("pharmacies-0"), { type: "pharmacies", index: 0 });
    assert.equal(parseSitemapId("pharmacies-10000"), null);
    assert.equal(parseSitemapId("pharmacies--1"), null);
    assert.deepEqual(undated.author, {
      "@type": "Organization",
      name: "약국오늘",
      url: "https://todaypharm.kr",
    });
  });

  await run("public sitemap audit counts only same-origin entries after the cutoff", async () => {
    const chunks = parsePublicSitemapIndex(
      `<?xml version="1.0"?>
       <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
         <sitemap><loc>https://todaypharm.kr/sitemap/static.xml</loc></sitemap>
         <sitemap><loc>https://todaypharm.kr/sitemap/supplements-1.xml</loc></sitemap>
         <sitemap><loc>https://todaypharm.kr/sitemap/supplements-0.xml</loc></sitemap>
       </sitemapindex>`,
      "https://todaypharm.kr",
    );
    assert.deepEqual(
      chunks.map(({ type, index }) => [type, index]),
      [
        ["supplements", 0],
        ["supplements", 1],
      ],
    );

    const entries = parsePublicUrlSet(
      `<?xml version="1.0"?>
       <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
         <url><loc>https://todaypharm.kr/wiki/product/new</loc><lastmod>2026-08-24T00:00:00Z</lastmod></url>
         <url><loc>https://todaypharm.kr/wiki/product/old</loc><lastmod>2026-08-22T23:59:59Z</lastmod></url>
       </urlset>`,
      "https://todaypharm.kr",
    );
    assert.deepEqual(
      selectEntriesSince(entries, new Date("2026-08-23T00:00:00Z")).map(({ loc }) => loc),
      ["https://todaypharm.kr/wiki/product/new"],
    );
    assert.throws(
      () =>
        parsePublicUrlSet(
          "<urlset><url><loc>https://example.com/escape</loc><lastmod>2026-08-24</lastmod></url></urlset>",
          "https://todaypharm.kr",
        ),
      /cross-origin/,
    );
    assert.throws(
      () => parsePublicSitemapIndex("<html><body>temporary error</body></html>", "https://todaypharm.kr"),
      /sitemapindex XML root/,
    );
    assert.throws(
      () => parsePublicUrlSet("<html><body>temporary error</body></html>", "https://todaypharm.kr"),
      /urlset XML root/,
    );
    assert.deepEqual(parsePublicUrlSet("<urlset></urlset>", "https://todaypharm.kr"), []);
    assert.throws(
      () =>
        parsePublicUrlSet(
          "<urlset><url><loc>https://todaypharm.kr/wiki/product/x</loc><lastmod>not-a-date</lastmod></url></urlset>",
          "https://todaypharm.kr",
        ),
      /Invalid lastmod/,
    );

    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async () =>
        new Response("redirect", {
          status: 302,
          headers: { location: "https://example.com/escape" },
        })) as typeof fetch;
      await assert.rejects(
        () =>
          fetchBoundedSameOriginText(
            "https://todaypharm.kr/sitemap-index.xml",
            "https://todaypharm.kr",
            ["application/xml"],
          ),
        /Refusing redirect/,
      );

      globalThis.fetch = (async () =>
        new Response("<html>error</html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        })) as typeof fetch;
      await assert.rejects(
        () =>
          fetchBoundedSameOriginText(
            "https://todaypharm.kr/sitemap-index.xml",
            "https://todaypharm.kr",
            ["application/xml"],
          ),
        /Unexpected content-type/,
      );

      globalThis.fetch = (async () =>
        new Response("<urlset></urlset>", {
          status: 200,
          headers: {
            "content-type": "application/xml",
            "content-length": "5000001",
          },
        })) as typeof fetch;
      await assert.rejects(
        () =>
          fetchBoundedSameOriginText(
            "https://todaypharm.kr/sitemap/blog-0.xml",
            "https://todaypharm.kr",
            ["application/xml"],
          ),
        /exceeds 5000000 bytes/,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  process.env.TURSO_DATABASE_URL = "file::memory:";
  process.env.TURSO_AUTH_TOKEN = "local-test-only";
  const { getTursoClient } = await import("@/lib/turso");
  const { getPublishedContentByHpid, updateContentItem } = await import("@/lib/data/content");
  const db = getTursoClient();

  await db.execute(`CREATE TABLE content_queue (
    id TEXT PRIMARY KEY,
    hpid TEXT,
    title TEXT,
    slug TEXT,
    region TEXT,
    theme TEXT,
    content_html TEXT,
    ai_summary TEXT,
    ai_bullets TEXT,
    ai_faq TEXT,
    ai_cta TEXT,
    extra_sections TEXT,
    image_url TEXT,
    status TEXT,
    publish_at TEXT,
    published_at TEXT,
    updated_at TEXT
  )`);
  await db.execute(`CREATE TABLE analytics_logs (
    page TEXT,
    referrer TEXT,
    created_at TEXT
  )`);

  await db.batch(
    [
      {
        sql: `INSERT INTO content_queue
          (id, hpid, title, slug, status, publish_at, published_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ["pending-id", "HPID-1", "Pending", "pending", "pending", "2026-08-27", null, "2026-08-27"],
      },
      {
        sql: `INSERT INTO content_queue
          (id, hpid, title, slug, status, publish_at, published_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ["published-id", "HPID-1", "Published", "published", "published", "2026-08-26", "2026-08-26", "2026-08-26"],
      },
      {
        sql: `INSERT INTO content_queue
          (id, hpid, title, slug, status, publish_at, published_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ["pending-only-id", "PENDING-ONLY", "Pending only", "pending-only", "pending", "2026-08-27", null, "2026-08-27"],
      },
    ],
    "write",
  );

  await run("public HPID lookup excludes pending content", async () => {
    const item = await getPublishedContentByHpid("HPID-1");
    assert.equal(item?.id, "published-id");
    assert.equal(await getPublishedContentByHpid("PENDING-ONLY"), null);
  });

  await run("data layer ignores unknown SQL update fields", async () => {
    const result = await updateContentItem(
      "published-id",
      { "title = 'owned' --": "x" } as never,
    );
    assert.equal(result, null);
    const row = await db.execute({
      sql: "SELECT title FROM content_queue WHERE id = ?",
      args: ["published-id"],
    });
    assert.equal(row.rows[0]?.title, "Published");
  });

  await run("route handlers reject malformed admin and nearby inputs", async () => {
    const { PUT } = await import("@/app/api/admin/queue/[id]/route");
    const { GET } = await import("@/app/api/nearby/route");
    const { POST: postAnalytics } = await import("@/app/api/analytics/route");
    const context = { params: Promise.resolve({ id: "published-id" }) };

    const malformed = await PUT(
      new Request("http://localhost/api/admin/queue/published-id", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
      context,
    );
    assert.equal(malformed.status, 400);

    const unknown = await PUT(
      new Request("http://localhost/api/admin/queue/published-id", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Changed", unsafe_column: "x" }),
      }),
      context,
    );
    assert.equal(unknown.status, 400);

    const empty = await PUT(
      new Request("http://localhost/api/admin/queue/published-id", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
      context,
    );
    assert.equal(empty.status, 400);

    const unchanged = await db.execute({
      sql: "SELECT title FROM content_queue WHERE id = ?",
      args: ["published-id"],
    });
    assert.equal(unchanged.rows[0]?.title, "Published");

    for (const query of [
      "lat=&lon=",
      "lat=91&lon=127",
      "lat=37.5&lon=181",
      "lat=37.5&lon=127&radiusKm=0",
      "lat=37.5&lon=127&radiusKm=51",
    ]) {
      const response = await GET(new Request(`http://localhost/api/nearby?${query}`));
      assert.equal(response.status, 400, query);
    }

    const crossOriginAnalytics = await postAnalytics(
      new NextRequest("http://localhost/api/analytics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://attacker.example",
        },
        body: JSON.stringify({ page: "/test", referrer: null }),
      }),
    );
    assert.equal(crossOriginAnalytics.status, 403);

    const unknownAnalyticsField = await postAnalytics(
      new NextRequest("http://localhost/api/analytics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost",
        },
        body: JSON.stringify({ page: "/test", raw_query: "질환명" }),
      }),
    );
    assert.equal(unknownAnalyticsField.status, 400);

    const malformedAnalytics = await postAnalytics(
      new NextRequest("http://localhost/api/analytics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost",
        },
        body: "{",
      }),
    );
    assert.equal(malformedAnalytics.status, 400);

    const storedAnalytics = await postAnalytics(
      new NextRequest("http://localhost/api/analytics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost",
        },
        body: JSON.stringify({
          page: "/nearby?q=민감한검색어#results",
          referrer: "https://search.example/results?q=질환명#answer",
        }),
      }),
    );
    assert.equal(storedAnalytics.status, 200);
    const analyticsRow = await db.execute(
      "SELECT page, referrer FROM analytics_logs ORDER BY rowid DESC LIMIT 1",
    );
    assert.equal(analyticsRow.rows[0]?.page, "/nearby");
    assert.equal(analyticsRow.rows[0]?.referrer, "search.example/results");

    const previousUrl = process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_DATABASE_URL;
    const failedAnalytics = await postAnalytics(
      new NextRequest("http://localhost/api/analytics", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost",
        },
        body: JSON.stringify({ page: "/test", referrer: null }),
      }),
    );
    assert.equal(failedAnalytics.status, 503);
    process.env.TURSO_DATABASE_URL = previousUrl;
  });

  await db.execute(`CREATE TABLE supplements (
    product_report_no TEXT PRIMARY KEY,
    name TEXT,
    manufacturer TEXT,
    ai_summary TEXT,
    additives TEXT,
    nutrition_facts TEXT,
    tags TEXT
  )`);
  await db.execute({
    sql: `INSERT INTO supplements
      (product_report_no, name, manufacturer, ai_summary, additives, nutrition_facts, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: ["R1", "Old", "Old maker", "curated", '{"curated":true}', '[{"name":"zinc"}]', '["immune"]'],
  });

  await run("HFF refresh preserves derived enrichment on conflict", async () => {
    await db.execute(
      buildHffUpsertStatement({
        PRDLST_REPORT_NO: "R1",
        PRDLST_NM: "New name",
        BSSH_NM: "New maker",
      }),
    );
    const result = await db.execute("SELECT * FROM supplements WHERE product_report_no = 'R1'");
    const row = result.rows[0];
    assert.equal(row.name, "New name");
    assert.equal(row.manufacturer, "New maker");
    assert.equal(row.ai_summary, "curated");
    assert.equal(row.tags, '["immune"]');
  });

  await run("new HFF rows leave derived enrichment empty", async () => {
    await db.execute(
      buildHffUpsertStatement({
        PRDLST_REPORT_NO: "R2",
        PRDLST_NM: "New product",
        BSSH_NM: "New maker",
      }),
    );
    const result = await db.execute("SELECT * FROM supplements WHERE product_report_no = 'R2'");
    assert.equal(result.rows[0]?.ai_summary, null);
    assert.equal(result.rows[0]?.nutrition_facts, null);
    assert.equal(result.rows[0]?.tags, null);
  });

  await run("supplement sitemap SQL ignores unverified nutrition facts", async () => {
    await db.execute({
      sql: `INSERT INTO supplements
        (product_report_no, name, manufacturer, nutrition_facts, tags)
        VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
      args: [
        "UNVERIFIED",
        "Unverified product",
        "Maker",
        JSON.stringify([
          {
            name: "비타민C",
            amount: 1000,
            unit: "mg",
            percent_dv: null,
            source: "product-name-inference",
          },
        ]),
        "[]",
        "VERIFIED",
        "Verified product",
        "Maker",
        JSON.stringify([
          {
            name: "비타민C",
            amount: 100,
            unit: "mg",
            percent_dv: 100,
            source: "foodsafetykorea:C003",
          },
        ]),
        "[]",
      ],
    });
    const result = await db.execute(
      `SELECT product_report_no FROM supplements ${SUPPLEMENT_INDEXABLE_WHERE}`,
    );
    const ids = result.rows.map((row) => String(row.product_report_no));
    assert.equal(ids.includes("UNVERIFIED"), false);
    assert.equal(ids.includes("VERIFIED"), true);
  });

  await run("updated XML parser preserves public API response parsing", () => {
    const parsed = new XMLParser({ ignoreAttributes: false, parseTagValue: false }).parse(
      "<response><body><items><item><dutyName>테스트약국</dutyName></item></items></body></response>",
    );
    assert.equal(parsed.response.body.items.item.dutyName, "테스트약국");
  });

  await run("workflow schedules and failure behavior match their contracts", () => {
    const root = process.cwd();
    const manualGeneration = fs.readFileSync(
      path.join(root, ".github/workflows/generate-content.yml"),
      "utf8",
    );
    const singleGeneration = fs.readFileSync(
      path.join(root, ".github/workflows/generate-single-pharmacy.yml"),
      "utf8",
    );
    const enrichment = fs.readFileSync(
      path.join(root, ".github/workflows/auto-enrich-supplements.yml"),
      "utf8",
    );
    const dailySync = fs.readFileSync(
      path.join(root, ".github/workflows/daily-sync.yml"),
      "utf8",
    );
    const publishing = fs.readFileSync(
      path.join(root, ".github/workflows/publish-content.yml"),
      "utf8",
    );
    const manualBlogGeneration = fs.readFileSync(
      path.join(root, ".github/workflows/generate-blog.yml"),
      "utf8",
    );
    const hffSync = fs.readFileSync(path.join(root, "scripts/fetch-hff-data.ts"), "utf8");
    const medicineSync = fs.readFileSync(path.join(root, "scripts/fetch-medicines.ts"), "utf8");
    const autoEnrichment = fs.readFileSync(
      path.join(root, "scripts/auto-enrich-supplements.ts"),
      "utf8",
    );
    assert.doesNotMatch(manualGeneration, /^\s*schedule:/m);
    assert.doesNotMatch(manualBlogGeneration, /^\s*schedule:/m);
    assert.match(manualBlogGeneration, /^\s*workflow_dispatch:/m);
    assert.doesNotMatch(manualGeneration, /npm run generate:content[^\n]*\$\{\{/);
    assert.doesNotMatch(singleGeneration, /\|\|\s*true/);
    assert.doesNotMatch(singleGeneration, /npm run [^\n]*\$\{\{/);
    assert.match(singleGeneration, /HPID:\s*\$\{\{\s*github\.event\.inputs\.hpid\s*\}\}/);
    assert.doesNotMatch(enrichment, /ts-node[^\n]*\$\{\{/);
    assert.doesNotMatch(dailySync, /(?:sources|hff_mode|medicines_mode)="\$\{\{/);
    assert.match(dailySync, /INPUT_SOURCES:\s*\$\{\{/);
    assert.match(publishing, /cron: '0 1,5,9,17,21 \* \* \*'/);
    assert.match(publishing, /PUBLISH_LIMIT: '2'/);
    for (const source of [hffSync, medicineSync, autoEnrichment]) {
      assert.doesNotMatch(source, /http:\/\/(?:openapi|apis\.data)\./);
      assert.match(source, /process\.exitCode\s*=\s*1/);
    }
    assert.doesNotMatch(hffSync, /return \{ items: \[\], total: 0 \}/);
    assert.doesNotMatch(medicineSync, /return \{ items: \[\], total: 0 \}/);
  });

  await run("data-backed content avoids unsupported verification and absence claims", () => {
    const root = process.cwd();
    const supplementPage = fs.readFileSync(
      path.join(root, "src/app/wiki/product/[id]/page.tsx"),
      "utf8",
    );
    const medicinePage = fs.readFileSync(
      path.join(root, "src/app/wiki/medicine/[id]/page.tsx"),
      "utf8",
    );
    const additiveSignal = fs.readFileSync(
      path.join(root, "src/components/wiki/AdditiveSignal.tsx"),
      "utf8",
    );
    const updatePage = fs.readFileSync(
      path.join(root, "src/app/blog/data-update-2026-08/page.tsx"),
      "utf8",
    );
    const labelGuide = fs.readFileSync(
      path.join(root, "src/app/blog/supplement-label-reading-guide/page.tsx"),
      "utf8",
    );
    const additivesGuide = fs.readFileSync(
      path.join(root, "src/app/blog/supplement-additives-label-guide/page.tsx"),
      "utf8",
    );
    const autoEnrichment = fs.readFileSync(
      path.join(root, "scripts/auto-enrich-supplements.ts"),
      "utf8",
    );
    const supplementSync = fs.readFileSync(
      path.join(root, "scripts/sync-supplements.ts"),
      "utf8",
    );
    const comparePage = fs.readFileSync(
      path.join(root, "src/app/wiki/vs/[compareId]/page.tsx"),
      "utf8",
    );
    const blogIndex = fs.readFileSync(path.join(root, "src/app/blog/page.tsx"), "utf8");
    const sitemap = fs.readFileSync(path.join(root, "src/lib/sitemap-content.ts"), "utf8");
    const auditManifest = JSON.parse(
      fs.readFileSync(path.join(root, "content/data-audits/2026-08-27.json"), "utf8"),
    ) as {
      publicSitemap: {
        datasets: Record<"supplements" | "medicines", {
          entriesSinceCutoff: number;
          candidates: Array<{ name: string; loc: string }>;
        }>;
      };
      contentArtifact: { status: string; publishedAt: string | null; indexing: string };
      duplicateCoverage: {
        localStatic: { slugMatchesExcludingTarget: number; titleMatchesExcludingTarget: number };
        localCampaigns: { slugMatches: number; titleMatches: number };
        publishedPublicCoverage: {
          sitemapEntries: number;
          renderedPublishedEntries: number;
          slugMatches: number;
          titleMatchPages: number[];
        };
      };
    };
    const followUpManifest = JSON.parse(
      fs.readFileSync(path.join(root, "content/data-audits/2026-08-28.json"), "utf8"),
    ) as {
      publicDelta: {
        datasets: Record<"pharmacies" | "supplements" | "medicines" | "blog", {
          entriesSinceBaseline: number;
          candidates: unknown[];
        }>;
      };
      githubActions: {
        autoEnrichment: {
          attemptedExistingRows: number;
          structuredNutritionFactsFound: number;
          meaningfulEnrichments: number;
          newRowsInserted: number;
        };
      };
      duplicateCoverage: {
        localStatic: { slugMatchesExcludingTarget: number; titleMatchesExcludingTarget: number };
        localCampaigns: { slugMatches: number; titleMatches: number };
        publishedPublicCoverage: { slugMatches: number; titleMatchPages: number[] };
      };
      contentArtifacts: Array<{
        route: string;
        status: string;
        publishedAt: string | null;
        indexing: string;
        listingAndSitemap: string;
      }>;
      method: { writing: string };
    };

    assert.doesNotMatch(
      supplementPage,
      /약사가 검증한|전문가 분석 리포트|첨가물 안심 체크|바로 구매하세요/,
    );
    assert.match(supplementPage, /공공데이터 신고 정보/);
    assert.match(supplementPage, /해당 성분의 부재나 제품 안전성을 보증하지 않습니다/);
    assert.doesNotMatch(supplementPage, /supplement\.ai_summary|FAQPage|FormattedSummary/);
    assert.match(supplementPage, /getVerifiedNutritionFacts/);
    assert.match(comparePage, /getVerifiedNutritionFacts/);
    assert.doesNotMatch(medicinePage, /식약처 인증|내 주변 약국에서 구매하세요/);
    assert.match(medicinePage, /의약품안전나라 공개 허가정보/);
    assert.doesNotMatch(additiveSignal, /signalText[\s\S]*양호|\? "포함" : "없음"/);
    assert.match(additiveSignal, /지정 키워드 미확인/);
    assert.match(additiveSignal, /특정 성분의 부재나 제품 안전성을 보증하지 않습니다/);
    assert.match(updatePage, /content\/data-audits\/2026-08-27\.json/);
    assert.match(updatePage, /content\/data-audits\/2026-08-28\.json/);
    assert.match(updatePage, /supplement-label-reading-guide/);
    assert.match(updatePage, /audit\.publicSitemap\.datasets\.supplements\.entriesSinceCutoff/);
    assert.equal(auditManifest.publicSitemap.datasets.supplements.entriesSinceCutoff, 989);
    assert.equal(auditManifest.publicSitemap.datasets.medicines.entriesSinceCutoff, 25);
    for (const candidate of auditManifest.publicSitemap.datasets.supplements.candidates) {
      assert.match(candidate.loc, /^https:\/\/todaypharm\.kr\/wiki\/product\//);
      assert.match(updatePage, /supplementSamples/);
    }
    for (const candidate of auditManifest.publicSitemap.datasets.medicines.candidates) {
      assert.match(candidate.loc, /^https:\/\/todaypharm\.kr\/wiki\/medicine\//);
      assert.match(updatePage, /medicineSamples/);
    }
    assert.equal(auditManifest.contentArtifact.status, "draft");
    assert.equal(auditManifest.contentArtifact.publishedAt, null);
    assert.equal(auditManifest.contentArtifact.indexing, "noindex,nofollow");
    assert.doesNotMatch(updatePage, /buildArticleSchema/);
    assert.doesNotMatch(blogIndex, /data-update-2026-08/);
    assert.doesNotMatch(sitemap, /data-update-2026-08/);
    assert.doesNotMatch(blogIndex, /supplement-label-reading-guide/);
    assert.doesNotMatch(sitemap, /supplement-label-reading-guide/);
    assert.deepEqual(auditManifest.duplicateCoverage.localStatic, {
      comparedRouteFiles: 22,
      comparedRegistry: "src/app/blog/page.tsx",
      slugMatchesExcludingTarget: 0,
      titleMatchesExcludingTarget: 0,
    });
    assert.equal(auditManifest.duplicateCoverage.localCampaigns.slugMatches, 0);
    assert.equal(auditManifest.duplicateCoverage.localCampaigns.titleMatches, 0);
    assert.ok(auditManifest.duplicateCoverage.publishedPublicCoverage.sitemapEntries >= 711);
    assert.ok(auditManifest.duplicateCoverage.publishedPublicCoverage.renderedPublishedEntries >= 711);
    assert.equal(auditManifest.duplicateCoverage.publishedPublicCoverage.slugMatches, 0);
    assert.deepEqual(auditManifest.duplicateCoverage.publishedPublicCoverage.titleMatchPages, []);

    for (const dataset of Object.values(followUpManifest.publicDelta.datasets)) {
      assert.equal(dataset.entriesSinceBaseline, 0);
      assert.deepEqual(dataset.candidates, []);
    }
    assert.equal(followUpManifest.githubActions.autoEnrichment.attemptedExistingRows, 15);
    assert.equal(followUpManifest.githubActions.autoEnrichment.structuredNutritionFactsFound, 0);
    assert.equal(followUpManifest.githubActions.autoEnrichment.meaningfulEnrichments, 0);
    assert.equal(followUpManifest.githubActions.autoEnrichment.newRowsInserted, 0);
    assert.equal(followUpManifest.duplicateCoverage.localStatic.slugMatchesExcludingTarget, 0);
    assert.equal(followUpManifest.duplicateCoverage.localStatic.titleMatchesExcludingTarget, 0);
    assert.equal(followUpManifest.duplicateCoverage.localCampaigns.slugMatches, 0);
    assert.equal(followUpManifest.duplicateCoverage.localCampaigns.titleMatches, 0);
    assert.equal(followUpManifest.duplicateCoverage.publishedPublicCoverage.slugMatches, 0);
    assert.deepEqual(followUpManifest.duplicateCoverage.publishedPublicCoverage.titleMatchPages, []);
    assert.ok(followUpManifest.method.writing.includes("without an external writing API"));
    for (const artifact of followUpManifest.contentArtifacts) {
      assert.equal(artifact.status, "draft");
      assert.equal(artifact.publishedAt, null);
      assert.equal(artifact.indexing, "noindex,nofollow");
      assert.equal(artifact.listingAndSitemap, "excluded");
    }
    assert.match(labelGuide, /영양제 라벨 읽는 순서/);
    assert.match(labelGuide, /빈 데이터나 분류 태그만으로/);
    assert.match(labelGuide, /식품안전나라 건강기능식품 검색/);
    assert.match(labelGuide, /content_to_nearby_click/);
    assert.doesNotMatch(labelGuide, /buildArticleSchema|FAQPage|HowTo/);
    assert.match(additivesGuide, /지정 키워드 미확인[\s\S]*첨가물이 없다는/);
    assert.match(additivesGuide, /외부 글쓰기 API를 사용하지 않았으며/);
    assert.match(additivesGuide, /law\.go\.kr\/LSW\/admRulInfoP\.do/);
    assert.match(additivesGuide, /impfood\.mfds\.go\.kr\/CFBDD02F01/);
    assert.doesNotMatch(additivesGuide, /build(?:Article|Faq|HowTo)Schema/);
    assert.match(additiveSignal, /href="\/blog\/supplement-additives-label-guide"/);
    assert.doesNotMatch(blogIndex, /supplement-additives-label-guide/);
    assert.doesNotMatch(sitemap, /supplement-additives-label-guide/);
    assert.match(autoEnrichment, /persistSupplementEnrichment/);
    assert.match(autoEnrichment, /getEnrichmentOffset/);
    assert.match(autoEnrichment, /ORDER BY id/);
    assert.match(autoEnrichment, /leaving the database row unchanged/);
    assert.doesNotMatch(autoEnrichment, /UPDATE supplements/);
    assert.match(supplementSync, /response\.ok/);
    assert.match(supplementSync, /nutritionFacts\.length === 0/);
    assert.match(supplementSync, /process\.exitCode = 1/);
    assert.doesNotMatch(supplementSync, /catch\s*\([^)]*\)\s*\{[\s\S]*return \[\]/);
    for (const file of [
      "scripts/enrich-from-product-name.ts",
      "scripts/re-enrich-empty.ts",
      "scripts/fill-missing-summaries.ts",
    ]) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      assert.match(source, /Disabled:/);
      assert.doesNotMatch(source, /UPDATE supplements/);
      assert.match(source, /process\.exitCode = 1/);
    }
  });

  await run("scheduled-content audit freezes evidence without claiming a reservation", () => {
    const audit = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "content/schedule-audits/2026-08-28.json"),
        "utf8",
      ),
    ) as {
      readOnly: boolean;
      lastScheduledPost: {
        publishAtUtc: string;
        publishAtKst: string;
        currentStatus: string;
        workflowRunId: number;
      };
      nextCandidateSlot: { publishAtUtc: string; reserved: boolean };
      duplicateCoverage: { slugMatches: number; titleMatches: number };
      contentBrief: { writing: string; qualityScore: { total: number } };
      automationDecision: { existingPendingQueue: string; remoteEffect: string };
    };

    assert.equal(audit.readOnly, true);
    assert.equal(audit.lastScheduledPost.workflowRunId, 33111937934);
    assert.equal(audit.lastScheduledPost.publishAtUtc, "2026-09-21T12:00:00.000Z");
    assert.equal(audit.lastScheduledPost.publishAtKst, "2026-09-21T21:00:00.000+09:00");
    assert.equal(audit.lastScheduledPost.currentStatus, "unverified_without_production_db_select");
    assert.equal(audit.nextCandidateSlot.publishAtUtc, "2026-09-22T00:00:00.000Z");
    assert.equal(audit.nextCandidateSlot.reserved, false);
    assert.equal(audit.duplicateCoverage.slugMatches, 0);
    assert.equal(audit.duplicateCoverage.titleMatches, 0);
    assert.equal(audit.contentBrief.writing, "direct_codex_session_only");
    assert.ok(audit.contentBrief.qualityScore.total >= 90);
    assert.equal(audit.automationDecision.existingPendingQueue, "unchanged");
    assert.equal(
      audit.automationDecision.remoteEffect,
      "none_until_a_separately_authorized_git_push",
    );
  });

  await run("content templates route readers to the measurable nearby funnel", () => {
    const root = process.cwd();
    const productPage = fs.readFileSync(path.join(root, "src/app/wiki/product/[id]/page.tsx"), "utf8");
    const medicinePage = fs.readFileSync(path.join(root, "src/app/wiki/medicine/[id]/page.tsx"), "utf8");
    const dynamicBlog = fs.readFileSync(path.join(root, "src/app/blog/[slug]/page.tsx"), "utf8");
    const ingredientPage = fs.readFileSync(path.join(root, "src/app/wiki/ingredient/[name]/page.tsx"), "utf8");
    for (const source of [productPage, medicinePage, dynamicBlog, ingredientPage]) {
      assert.match(source, /href="\/nearby"/);
      assert.match(source, /data-analytics-event="content_to_nearby_click"/);
    }
    for (const source of [productPage, medicinePage, dynamicBlog]) assert.match(source, /방문 전 전화/);
  });

  await run("pediatric fever guidance avoids contradictory procedural schema", () => {
    const comparisonSource = fs.readFileSync(
      path.join(process.cwd(), "src/app/blog/kids-fever-medicine-comparison/page.tsx"),
      "utf8",
    );
    const checklistSource = fs.readFileSync(
      path.join(process.cwd(), "src/app/blog/kids-fever-meds-check/page.tsx"),
      "utf8",
    );
    const hangoverSource = fs.readFileSync(
      path.join(process.cwd(), "src/app/blog/digestion-hangover-pharmacy-guide/page.tsx"),
      "utf8",
    );
    for (const source of [comparisonSource, checklistSource, hangoverSource]) {
      assert.doesNotMatch(source, /const howToJsonLd|JSON\.stringify\(howToJsonLd\)/);
    }
    for (const source of [comparisonSource, checklistSource]) {
      assert.doesNotMatch(source, /교차 투여할 수 있습니다|교대 투여를 검토/);
      assert.match(source, /한 번에는 한 가지 해열제만 복용해야 합니다|임의로 추가하거나 교대하지 마세요/);
      assert.match(source, /의사의 처방과 복용 간격 안내/);
    }
    assert.match(comparisonSource, /식품의약품안전처 어린이 해열제 복용 안내/);
    assert.doesNotMatch(
      hangoverSource,
      /아세트아미노펜\(두통\)|반드시 이부프로펜|한방 제제가 더 안전|간 보호제/,
    );
    assert.match(hangoverSource, /진통제를 임의로 선택하거나 서로 바꾸지 마세요/);
  });

  await run("crawl controls expose only validated pagination states", () => {
    const root = process.cwd();
    const robots = fs.readFileSync(path.join(root, "src/app/robots.ts"), "utf8");
    const wikiIndex = fs.readFileSync(path.join(root, "src/app/wiki/page.tsx"), "utf8");
    const tagPage = fs.readFileSync(path.join(root, "src/app/wiki/tag/[keyword]/page.tsx"), "utf8");
    const regionPage = fs.readFileSync(path.join(root, "src/app/[province]/[city]/page.tsx"), "utf8");
    const regionList = fs.readFileSync(path.join(root, "src/components/pharmacy-list-infinite.tsx"), "utf8");
    const manifest = fs.readFileSync(path.join(root, "src/app/manifest.ts"), "utf8");
    const sitemapRoute = fs.readFileSync(
      path.join(root, "src/app/sitemap/[id]/route.ts"),
      "utf8",
    );
    assert.match(robots, /\/\*\?page=/);
    assert.match(robots, /\/wiki\?category=/);
    assert.doesNotMatch(robots, /host:\s*siteUrl/);
    assert.match(wikiIndex, /isFilteredState[\s\S]*index: false, follow: true/);
    assert.match(tagPage, /if \(!count\) notFound\(\)/);
    assert.match(tagPage, /if \(page > totalPages\) notFound\(\)/);
    assert.match(regionPage, /getCitiesByProvince/);
    assert.match(regionPage, /getCanonicalProvinceSlug/);
    assert.doesNotMatch(regionList, /@\/lib\/data\/pharmacies/);
    assert.match(manifest, /src: "\/icon"/);
    assert.doesNotMatch(manifest, /favicon\.ico/);
    assert.match(sitemapRoute, /dynamic = "force-dynamic"/);
    assert.match(sitemapRoute, /availableIds\.includes\(id\)/);
  });

  await run("database jobs fail closed and publishing is idempotent", () => {
    const root = process.cwd();
    const turso = fs.readFileSync(path.join(root, "src/lib/turso.ts"), "utf8");
    const schema = fs.readFileSync(path.join(root, "scripts/init-turso-schema.mjs"), "utf8");
    const publisher = fs.readFileSync(path.join(root, "scripts/publish-queue.ts"), "utf8");
    const workflow = fs.readFileSync(path.join(root, ".github/workflows/publish-content.yml"), "utf8");
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const nearby = fs.readFileSync(path.join(root, "src/app/api/nearby/route.ts"), "utf8");
    const tagPage = fs.readFileSync(path.join(root, "src/app/wiki/tag/[keyword]/page.tsx"), "utf8");

    assert.match(turso, /export function getRequiredTursoClient/);
    for (const file of [
      "scripts/fetch-hff-data.ts",
      "scripts/fetch-medicines.ts",
      "scripts/sync-supplements.ts",
      "scripts/auto-enrich-supplements.ts",
    ]) {
      assert.match(fs.readFileSync(path.join(root, file), "utf8"), /getRequiredTursoClient/);
    }
    const blogGenerator = fs.readFileSync(path.join(root, "scripts/generate-blog-post.ts"), "utf8");
    assert.match(blogGenerator, /main\(\)\.catch[\s\S]*process\.exitCode = 1/);
    assert.match(schema, /failures\.push/);
    assert.match(schema, /Schema initialization failed/);
    assert.match(schema, /process\.exitCode = 1/);
    assert.match(publisher, /WHERE id = \? AND status = 'pending'/);
    assert.match(publisher, /rowsAffected === 1/);
    assert.match(workflow, /group: publish-content-queue/);
    assert.match(workflow, /run: npm run db:init/);
    assert.equal(packageJson.scripts["db:init"], "node scripts/init-turso-schema.mjs");
    assert.match(nearby, /ORDER BY \(\(latitude - \?\)/);
    assert.match(tagPage, /SUPPLEMENT_INDEXABLE_PREDICATE/);
  });

  await run("required Turso access, publish claims, and supplement predicates execute", async () => {
    const previousUrl = process.env.TURSO_DATABASE_URL;
    const previousToken = process.env.TURSO_AUTH_TOKEN;
    process.env.TURSO_DATABASE_URL = "";
    process.env.TURSO_AUTH_TOKEN = "";
    assert.throws(() => getRequiredTursoClient(), /required for database jobs/);
    assert.doesNotThrow(() => assertExpectedRowsAffected([{ rowsAffected: 1 }], 1, "test"));
    assert.throws(
      () => assertExpectedRowsAffected([{ rowsAffected: 0 }], 1, "test"),
      /affected 0 row\(s\); expected 1/,
    );
    if (previousUrl === undefined) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = previousUrl;
    if (previousToken === undefined) delete process.env.TURSO_AUTH_TOKEN;
    else process.env.TURSO_AUTH_TOKEN = previousToken;

    const db = createClient({ url: ":memory:" });
    await db.execute(`CREATE TABLE content_queue (
      id TEXT PRIMARY KEY, status TEXT, published_at TEXT, updated_at TEXT
    )`);
    await db.execute("INSERT INTO content_queue (id, status) VALUES ('one', 'pending')");
    assert.equal(await claimPendingContent(db, "one", "2026-08-28T00:00:00.000Z"), true);
    assert.equal(await claimPendingContent(db, "one", "2026-08-28T00:00:01.000Z"), false);

    await db.execute(`CREATE TABLE supplements (
      id TEXT PRIMARY KEY, name TEXT, nutrition_facts TEXT, tags TEXT
    )`);
    await db.batch([
      { sql: "INSERT INTO supplements VALUES (?, ?, ?, ?)", args: ["good", "정상 제품", "[]", '["비타민"]'] },
      { sql: "INSERT INTO supplements VALUES (?, ?, ?, ?)", args: ["test", "test fixture", "[]", '["비타민"]'] },
      { sql: "INSERT INTO supplements VALUES (?, ?, ?, ?)", args: ["thin", "빈 제품", "[]", "[]"] },
    ]);
    const filtered = await db.execute(`SELECT id FROM supplements ${SUPPLEMENT_INDEXABLE_WHERE} ORDER BY id`);
    assert.deepEqual(filtered.rows.map((row) => row.id), ["good"]);
    db.close();
  });

  await run("nearby preselection scales longitude at Korean latitudes", () => {
    const scale = longitudeDegreeScale(37.5);
    const eastWestSquared = (0.045 * scale) ** 2;
    const northSouthSquared = 0.038 ** 2;
    assert.ok(eastWestSquared < northSouthSquared);
  });

  await run("sync metrics and freshness detection are executable", async () => {
    const db = createClient({ url: ":memory:" });
    await db.execute("CREATE TABLE pharmacies (id TEXT)");
    await db.execute(`CREATE TABLE public_data_sync_runs (
      id TEXT PRIMARY KEY, source TEXT, mode TEXT, status TEXT, started_at TEXT,
      finished_at TEXT, db_count_before INTEGER, db_count_after INTEGER,
      inserted_count INTEGER, duration_seconds INTEGER, error_message TEXT
    )`);
    await db.execute("INSERT INTO pharmacies VALUES ('one')");
    const before = await getSourceRowCount(db, "pharmacies");
    const id = await startSyncRun(db, {
      source: "pharmacies",
      mode: "all",
      startedAt: "2026-08-28T00:00:00.000Z",
      countBefore: before,
    });
    await db.execute("INSERT INTO pharmacies VALUES ('two')");
    const after = await getSourceRowCount(db, "pharmacies");
    await finishSyncRun(db, {
      id,
      status: "success",
      finishedAt: "2026-08-28T00:00:10.000Z",
      countBefore: before,
      countAfter: after,
      durationSeconds: 10,
    });
    const run = await db.execute({
      sql: "SELECT status, inserted_count FROM public_data_sync_runs WHERE id = ?",
      args: [id],
    });
    assert.equal(run.rows[0]?.status, "success");
    assert.equal(Number(run.rows[0]?.inserted_count), 1);
    assert.deepEqual(
      staleSources(new Date("2026-08-28T12:00:00.000Z"), {
        pharmacies: "2026-08-27T23:00:00.000Z",
        hff: "2026-08-27T00:00:00.000Z",
        medicines: "2026-08-01T00:00:00.000Z",
      }),
      ["medicines"],
    );
    db.close();
  });

  await run("pharmacy API errors fail closed and outbox retry timestamps stay due", async () => {
    assert.throws(
      () => parsePharmacyApiResponse({ response: { header: { resultCode: "30", resultMsg: "SERVICE KEY ERROR" } } }),
      /Pharmacy API error/,
    );
    assert.throws(
      () => parsePharmacyApiResponse({ response: { header: { resultCode: "00" } } }),
      /missing body/,
    );
    assert.deepEqual(
      parsePharmacyApiResponse({
        response: {
          header: { resultCode: "00", resultMsg: "NORMAL SERVICE" },
          body: { totalCount: 1, items: { item: { hpid: "A", dutyName: "Pharmacy" } } },
        },
      }),
      { totalCount: 1, items: [{ hpid: "A", dutyName: "Pharmacy" }] },
    );

    const db = createClient({ url: ":memory:" });
    await db.execute("CREATE TABLE retry_times (next_attempt_at TEXT)");
    await db.execute("INSERT INTO retry_times VALUES ('2026-08-28T01:10:00.000Z')");
    const due = await db.execute(
      "SELECT COUNT(*) AS count FROM retry_times WHERE datetime(next_attempt_at) <= datetime('2026-08-28 01:11:00')",
    );
    assert.equal(Number(due.rows[0]?.count), 1);
    db.close();
  });

  await run("automation workflows include catch-up, verification, and indexing retries", () => {
    const root = process.cwd();
    const daily = fs.readFileSync(path.join(root, ".github/workflows/daily-sync.yml"), "utf8");
    const watchdog = fs.readFileSync(path.join(root, ".github/workflows/sync-watchdog.yml"), "utf8");
    const outbox = fs.readFileSync(path.join(root, ".github/workflows/indexing-outbox.yml"), "utf8");
    const publisher = fs.readFileSync(path.join(root, "scripts/publish-queue.ts"), "utf8");
    assert.match(daily, /verify:public-sync/);
    assert.match(watchdog, /check:sync-freshness/);
    assert.match(watchdog, /gh workflow run daily-sync\.yml/);
    assert.match(outbox, /process:indexing-outbox/);
    assert.match(publisher, /INSERT INTO indexing_outbox/);
    assert.doesNotMatch(publisher, /requestIndexing/);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

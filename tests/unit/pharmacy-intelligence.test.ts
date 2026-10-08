import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { pickJosa, withJosa, hasFinalConsonant } from "../../src/lib/korean-josa";
import { buildPharmacyIntelligenceReport } from "../../src/lib/pharmacy-intelligence";
import {
  CircuitBreakerError,
  computeJitterDelayMs,
  detectSecurityChallenge,
  fetchWithAntiBan,
  parseExternalPlaceFromStates,
  selectCategoryBalancedBatch,
  withDbRetry,
} from "../../scripts/enrich-pharmacies";

async function run(name: string, fn: () => void | Promise<void>) {
  await fn();
  console.log(`PASS ${name}`);
}

async function main() {
  await run("Korean postposition (조사) handles Hangul batchim, Rieul, digits, and parentheses", () => {
    assert.equal(hasFinalConsonant("종로우리약국"), true);
    assert.equal(hasFinalConsonant("메디프라자"), false);
    assert.equal(withJosa("종로우리약국", "은/는"), "종로우리약국은");
    assert.equal(withJosa("메디프라자", "은/는"), "메디프라자는");
    assert.equal(withJosa("종로우리약국", "이/가"), "종로우리약국이");
    assert.equal(withJosa("메디프라자", "이/가"), "메디프라자가");
    assert.equal(withJosa("종로우리약국", "을/를"), "종로우리약국을");
    assert.equal(withJosa("메디프라자", "을/를"), "메디프라자를");
    assert.equal(withJosa("종로우리약국", "과/와"), "종로우리약국과");
    assert.equal(withJosa("메디프라자", "과/와"), "메디프라자와");
    assert.equal(withJosa("종로우리약국", "으로/로"), "종로우리약국으로");
    assert.equal(withJosa("빛고을약국", "으로/로"), "빛고을약국으로");
    assert.equal(pickJosa("서울", "으로/로"), "로"); // ㄹ 받침은 '로'
    assert.equal(withJosa("메디프라자(서울 강남구)", "은/는"), "메디프라자(서울 강남구)는");
    assert.equal(withJosa("종로우리약국(서울 종로구)", "은/는"), "종로우리약국(서울 종로구)은");
  });

  await run("intelligence report synthesis builds 5 proprietary sections without external images or ephemeral status", () => {
    const pharmacy = {
      hpid: "A1100001",
      name: "종로우리약국",
      address: "서울특별시 종로구 새문안로 92, 1층",
      tel: "02-732-1234",
      province: "서울특별시",
      city: "종로구",
      operating_hours: {
        mon: { open: "0830", close: "2030" },
        tue: { open: "0830", close: "2030" },
        wed: { open: "0830", close: "2030" },
        thu: { open: "0830", close: "2030" },
        fri: { open: "0830", close: "2030" },
        sat: { open: "0900", close: "1500" },
        sun: { open: null, close: null },
      },
    };

    const external = {
      matched: true,
      placeId: "1720832182",
      visitorReviewCount: 312,
      blogReviewCount: 24,
      votedUserCount: 150,
      votedKeywords: [
        { label: "친절해요", count: 98 },
        { label: "복약지도를 잘해줘요", count: 64 },
        { label: "가격이 합리적이에요", count: 42 },
      ],
      busStops: [
        {
          name: "새문안로대우빌딩",
          code: "01122",
          walkMinutes: 3,
          walkMeters: 210,
          routes: ["160", "260", "270", "470"],
        },
      ],
      facilities: ["제로페이", "무선 인터넷"],
      hasNPay: true,
      hasWheelchairEntrance: true,
      regularClosedDays: "매주 일요일 정기휴무",
      specialtyKeywords: ["동물의약품 취급", "맞춤 영양제 상담"],
    };

    const report = buildPharmacyIntelligenceReport(pharmacy, external);
    assert.equal(report.version, 1);
    assert.equal(report.briefing.lines.length, 3);
    assert.match(report.briefing.lines[0], /종로우리약국은/);
    assert.match(report.costAnalysis.surchargeWindowText, /30%/);
    assert.equal(report.keywordAnalysis.topKeywords.length, 3);
    assert.equal(report.visitGuide.transitStops.length, 1);
    assert.equal(report.peerComparison.metrics.length, 4);
    assert.equal(report.faq.length, 4);
    assert.match(report.faq[0]!.question, /^종로우리약국은/);

    const serialized = JSON.stringify(report);
    assert.doesNotMatch(serialized, /https?:\/\/[^\s"]+\.(?:jpg|jpeg|png|webp|gif)/i);
    assert.doesNotMatch(serialized, /원천 데이터|데이터 출처 검증/);
  });

  await run("anti-ban circuit breaker triggers immediately on 403, 429, or CAPTCHA HTML", async () => {
    assert.ok(detectSecurityChallenge(403, "Forbidden") instanceof CircuitBreakerError);
    assert.ok(detectSecurityChallenge(429, "Too Many Requests") instanceof CircuitBreakerError);
    assert.ok(
      detectSecurityChallenge(200, "<html><body>보안 확인을 완료해 주세요 ncaptcha</body></html>") instanceof
        CircuitBreakerError,
    );
    assert.equal(detectSecurityChallenge(200, "<html><body>정상 페이지</body></html>"), null);

    let callCount = 0;
    await assert.rejects(
      () =>
        fetchWithAntiBan("https://m.search.naver.com/search.naver?query=test", {
          maxRetries: 2,
          fetchImpl: (async () => {
            callCount += 1;
            return new Response("Too Many Requests", { status: 429 });
          }) as typeof fetch,
        }),
      CircuitBreakerError,
    );
    assert.equal(callCount, 1, "Circuit breaker must not retry on 429");
  });

  await run("DB retry wrapper recovers from transient cold-start failures", async () => {
    let attempts = 0;
    const result = await withDbRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error("SQLITE_BUSY: cold start timeout");
        }
        return "recovered";
      },
      3,
      5,
    );
    assert.equal(result, "recovered");
    assert.equal(attempts, 3);

    const delay = computeJitterDelayMs(1500, 3200, () => 0.5);
    assert.ok(delay >= 1500 && delay <= 3200);
  });

  await run("external parser strips ephemeral holiday notices and ignores images while Category sampling balances provinces", async () => {
    const parsed = parseExternalPlaceFromStates(
      { hpid: "H1", name: "테스트약국", address: "서울 종로구 1" },
      {
        "PlaceListBusinessesItem:999": {
          id: "999",
          name: "테스트약국",
          normalizedName: "테스트약국",
          visitorReviewCount: "45",
          blogCafeReviewCount: "12",
          hasNPay: true,
          imageUrl: "https://ldb-phinf.pstatic.net/bad-image.jpg",
        },
      },
      {
        "VisitorReviewStatsResult:999": {
          analysis: {
            votedKeyword: {
              userCount: 30,
              details: [{ displayName: "친절해요", count: 25 }],
            },
          },
        },
        "BusStation:101": {
          name: "종로1가",
          displayCode: "01001",
          walkTime: 2,
          walkingDistance: 140,
          innerRoutes: [{ routes: [{ __ref: "InnerRoute:1" }] }],
        },
        "InnerRoute:1": { name: "101" },
        ROOT_QUERY: {
          'pharmacy({"id":"999"})': {
            newBusinessHours: [{ comingRegularClosedDays: "금(10/9) 한글날 휴무" }],
          },
        },
      },
    );

    assert.equal(parsed.matched, true);
    assert.equal(parsed.regularClosedDays, null, "Ephemeral holiday notice must be excluded");
    assert.equal("imageUrl" in parsed, false);

    const db = createClient({ url: ":memory:" });
    await db.execute(`
      CREATE TABLE pharmacies (
        id TEXT PRIMARY KEY,
        hpid TEXT UNIQUE,
        name TEXT,
        address TEXT,
        tel TEXT,
        latitude REAL,
        longitude REAL,
        operating_hours TEXT,
        province TEXT,
        city TEXT,
        intelligence_report TEXT,
        enriched_at TEXT,
        skipped_at TEXT,
        updated_at TEXT
      )
    `);

    await db.batch([
      {
        sql: "INSERT INTO pharmacies (id, hpid, name, address, tel, province, city) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: ["1", "A1", "서울약국1", "서울특별시 강남구 테헤란로 1", "02-111-2222", "서울특별시", "강남구"],
      },
      {
        sql: "INSERT INTO pharmacies (id, hpid, name, address, tel, province, city) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: ["2", "A2", "서울약국2", "서울특별시 강남구 테헤란로 2", "02-111-2223", "서울특별시", "강남구"],
      },
      {
        sql: "INSERT INTO pharmacies (id, hpid, name, address, tel, province, city) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: ["3", "B1", "부산약국1", "부산광역시 해운대구 해운대로 1", "051-111-2222", "부산광역시", "해운대구"],
      },
      {
        sql: "INSERT INTO pharmacies (id, hpid, name, address, tel, province, city, skipped_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: ["4", "C1", "제외약국", "대구광역시 중구 중앙대로 1", "053-111-2222", "대구광역시", "중구", "2026-10-08T00:00:00Z"],
      },
    ]);

    const batch = await selectCategoryBalancedBatch(db, 2);
    assert.equal(batch.length, 2);
    const provinces = new Set(batch.map((p) => p.province));
    assert.equal(provinces.size, 2, "Must sample evenly across distinct provinces and exclude skipped_at rows");
    db.close();
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

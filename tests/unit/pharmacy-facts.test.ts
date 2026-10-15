import assert from "node:assert/strict";
import type { OperatingHours, Pharmacy } from "../../src/types/pharmacy";
import {
  buildPharmacyIntelligenceReport,
  parseStoredIntelligenceReport,
  resolvePharmacyReport,
} from "../../src/lib/pharmacy-intelligence";
import { computeHoursProfile } from "../../src/lib/pharmacy-hours-profile";
import { buildAiLessDetailTemplate } from "../../src/lib/pharmacy-detail-template";
import { buildOpeningHoursSpecification } from "../../src/lib/seo";

function pharmacy(hpid: string, hours: OperatingHours | null): Pharmacy {
  return {
    hpid,
    name: `테스트${hpid}약국`,
    address: "서울특별시 종로구 새문안로 92",
    tel: "02-732-1234",
    province: "서울특별시",
    city: "종로구",
    operating_hours: hours,
  };
}

const slot = (open: string | null, close: string | null) => ({ open, close });
const weekdays = (open: string, close: string): OperatingHours => ({
  mon: slot(open, close),
  tue: slot(open, close),
  wed: slot(open, close),
  thu: slot(open, close),
  fri: slot(open, close),
});

const FORBIDDEN =
  /9\.5|65%|28%|30%|연중 운영|정기 휴무|정기휴무|하루 평균 9시간|후기 0건|리뷰 0건/;
const dump = (v: unknown) => JSON.stringify(v);

function run(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

run("1. hours missing -> no default hours figure is generated", () => {
  const report = buildPharmacyIntelligenceReport(pharmacy("A1", null));
  assert.equal(computeHoursProfile(null).weekdayAvgHours, null);
  assert.doesNotMatch(dump(report), FORBIDDEN);
  assert.doesNotMatch(dump(report), /9시간/);
  assert.match(report.briefing.lines[0]!, /시간표 미등록/);
});

run("2. no peer sample -> no regional averages or percentages", () => {
  const few = [1, 2, 3, 4].map((i) =>
    pharmacy(`P${i}`, weekdays("0900", "1800")),
  );
  const report = buildPharmacyIntelligenceReport(
    pharmacy("A2", weekdays("0900", "1800")),
    null,
    few,
  );
  assert.equal(report.peerComparison, null);
  assert.doesNotMatch(dump(report), FORBIDDEN);
});

run("2b. peer sample excludes self/invalid data and states its basis", () => {
  const self = pharmacy("SELF", weekdays("0900", "1800"));
  const peers = [
    self,
    pharmacy("NOHOURS", null),
    ...[1, 2, 3, 4, 5].map((i) =>
      pharmacy(`P${i}`, {
        ...weekdays("0900", "2100"),
        sat: slot("0900", "1300"),
      }),
    ),
  ];
  const peer = buildPharmacyIntelligenceReport(
    self,
    null,
    peers,
  ).peerComparison;
  assert.equal(peer?.sampleSize, 5);
  assert.match(peer!.basisText, /5곳\(해당 약국 제외\)/);
  assert.match(peer!.metrics[0]!.benchmark, /12시간 \(5곳\)/);
  assert.match(peer!.metrics[1]!.benchmark, /100%/);
});

run("3. unregistered weekend is not stated as regular closure", () => {
  const report = buildPharmacyIntelligenceReport(
    pharmacy("A3", weekdays("0900", "1800")),
  );
  const text = dump(report);
  assert.doesNotMatch(
    text,
    /휴무/.source === "휴무" ? /정기 ?휴무|토·일요일 휴무/ : /x/,
  );
  assert.match(
    report.briefing.lines[0]!,
    /토요일 시간표 미등록, 일요일 시간표 미등록/,
  );
});

run("4. Sunday-only hours are not described as year-round operation", () => {
  const report = buildPharmacyIntelligenceReport(
    pharmacy("A4", { sun: slot("1000", "1700") }),
  );
  assert.doesNotMatch(dump(report), /연중|무휴|매일 운영/);
  assert.ok(report.briefing.highlights.includes("일요일 시간표 등록"));
});

run(
  "5. 22:00-02:00 is registered, measured as 4 hours and shown as next-day close",
  () => {
    const profile = computeHoursProfile({ ...weekdays("2200", "0200") });
    assert.equal(profile.weekdayAvgHours, 4);
    assert.equal(profile.hasLateWeekday, true);
    assert.match(profile.weekdayText, /22:00 - 익일 02:00/);
    const spec = buildOpeningHoursSpecification(
      pharmacy("A5", weekdays("2200", "0200")),
    );
    assert.equal(spec.length, 5);
  },
);

run("6. differing weekday hours are not generalised from Monday", () => {
  const profile = computeHoursProfile({
    mon: slot("0900", "1800"),
    tue: slot("0900", "1800"),
    wed: slot("1000", "2000"),
    thu: slot(null, null),
    fri: slot("0900", "1800"),
  });
  assert.doesNotMatch(profile.weekdayText, /^평일\(월~금\)/);
  assert.match(profile.weekdayText, /월·화·금 09:00 - 18:00/);
  assert.match(profile.weekdayText, /수 10:00 - 20:00/);
  assert.match(profile.weekdayText, /목 미등록/);
  const tmpl = buildAiLessDetailTemplate(
    pharmacy("A6", {
      mon: slot("0900", "1800"),
      tue: slot("1000", "1900"),
      wed: slot(null, null),
      thu: slot(null, null),
      fri: slot(null, null),
    }),
  );
  assert.doesNotMatch(tmpl.summary, /평일\(월~금\)/);
});

run(
  "6b. equal open/close and malformed values are never counted as hours",
  () => {
    const profile = computeHoursProfile({
      mon: slot("0000", "0000"),
      tue: slot("abc", "1800"),
      wed: slot("2400", "1800"),
    });
    assert.equal(profile.weekdayKnownCount, 0);
    assert.equal(profile.hasAnyRegistered, false);
    assert.equal(
      buildOpeningHoursSpecification(
        pharmacy("A6b", { mon: slot("0000", "0000") }),
      ).length,
      0,
    );
  },
);

run(
  "7/8. unmatched or unfetched external data adds no reviews, facilities or transit",
  () => {
    const unmatched = {
      matched: false,
      visitorReviewCount: 99,
      facilities: ["주차"],
      busStops: [{ name: "x", walkMinutes: 1, walkMeters: 50, routes: [] }],
    };
    const report = buildPharmacyIntelligenceReport(
      pharmacy("A7", weekdays("0900", "1800")),
      unmatched,
    );
    assert.equal(report.reviewInsights, null);
    assert.equal(report.visitGuide.transitStops.length, 0);
    assert.equal(report.visitGuide.facilities.length, 0);
    assert.equal(report.visitGuide.parkingNote, null);
    assert.equal(report.sourceExternal, null);
    assert.doesNotMatch(dump(report), /후기 \d+건|리뷰 0건/);
  },
);

run(
  "8b. matched place without fetched counts keeps counts null, not zero",
  () => {
    const r = buildPharmacyIntelligenceReport(
      pharmacy("A8", weekdays("0900", "1800")),
      {
        matched: true,
        placeId: "1",
        votedKeywords: [{ label: "친절해요", count: 4 }],
      },
    );
    assert.equal(r.reviewInsights?.visitorReviewCount, null);
    assert.equal(r.reviewInsights?.votedUserCount, null);
    assert.equal(r.reviewInsights?.topKeywords[0]?.ratioBasis, "votes");
  },
);

run(
  "9. stale v1 stored report is ignored and its figures are not re-emitted",
  () => {
    const stale = {
      version: 1,
      visualCategory: "neighborhood_care",
      briefing: {
        lines: ["평일 하루 평균 9시간 지원", "b", "c"],
        highlights: [],
      },
      peerComparison: { regionalAvgWeekdayHours: 9.5 },
      visitGuide: {
        regularClosedSummary: "매주 토·일요일 및 법정 공휴일 정기 휴무",
      },
      faq: [],
    };
    assert.equal(parseStoredIntelligenceReport(stale), null);
    const p = {
      ...pharmacy("A9", weekdays("0900", "1800")),
      intelligence_report: stale,
    };
    const text = dump(resolvePharmacyReport(p));
    assert.doesNotMatch(text, FORBIDDEN);
  },
);

run(
  "9b. stored v2 report only contributes validated external input; hours come from current data",
  () => {
    const base = pharmacy("A9b", weekdays("0900", "1800"));
    const stored = buildPharmacyIntelligenceReport(base, {
      matched: true,
      placeId: "9",
      visitorReviewCount: 7,
      facilities: ["제로페이"],
    });
    const changed = {
      ...base,
      operating_hours: weekdays("1000", "1900"),
      intelligence_report: JSON.parse(dump(stored)),
    };
    const report = resolvePharmacyReport(changed);
    assert.match(report.briefing.lines[0]!, /10:00 - 19:00/);
    assert.equal(report.reviewInsights?.visitorReviewCount, 7);
  },
);

run("10. corrupted stored reports never throw", () => {
  for (const bad of [
    null,
    undefined,
    "x",
    3,
    [],
    {},
    { version: 2 },
    { version: 2, visualCategory: "bad" },
    { version: 2, visualCategory: "night_care", briefing: null, faq: 1 },
  ]) {
    assert.equal(parseStoredIntelligenceReport(bad), null);
  }
  const hostile = {
    version: 2,
    visualCategory: "night_care",
    briefing: { lines: [] },
    faq: [],
    sourceExternal: {
      matched: true,
      placeId: "z",
      votedKeywords: "oops",
      busStops: [null, 3],
    },
  };
  const p = {
    ...pharmacy("A10", weekdays("0900", "1800")),
    intelligence_report: hostile,
  };
  assert.doesNotThrow(() => resolvePharmacyReport(p));
});

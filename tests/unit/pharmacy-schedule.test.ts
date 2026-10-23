import assert from "node:assert/strict";
import type { Pharmacy } from "@/types/pharmacy";
import { buildAiLessDetailTemplate } from "@/lib/pharmacy-detail-template";
import { buildPharmacyJsonLd } from "@/lib/seo";
import { getOperatingStatusAt } from "@/lib/hours";
import { findUnsupportedPharmacyClaims, selectPharmacySummary } from "@/lib/pharmacy-claims";
import { describeHoliday, normalizeWeeklySchedule } from "@/lib/operating-schedule";

let failed = 0;
function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failed++;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

const slot = (open: string, close: string) => ({ open, close });
const none = { open: null, close: null };

// C1102116 재현 형태: 목요일만 19:00 종료
const thursdayException: Pharmacy = {
  hpid: "TEST0001",
  name: "테스트약국",
  address: "서울특별시 강남구 테헤란로 1",
  tel: "02-123-4567",
  operating_hours: {
    mon: slot("0830", "1830"),
    tue: slot("0830", "1830"),
    wed: slot("0830", "1830"),
    thu: slot("0830", "1900"),
    fri: slot("0830", "1830"),
    sat: none,
    sun: none,
    holiday: none,
  },
};

// 2026-10-22(목) 18:45 KST = 09:45 UTC
const kst = (iso: string) => new Date(`${iso}+09:00`);

run("목요일 예외가 요약·FAQ·JSON-LD에 동일하게 반영된다", () => {
  const tmpl = buildAiLessDetailTemplate(thursdayException);
  assert.match(tmpl.summary, /목 08:30 - 19:00/);
  assert.match(tmpl.summary, /월·화·수·금 08:30 - 18:30/);
  const weekendFaq = tmpl.faq.find((f) => f.question.includes("주말"))!;
  assert.match(weekendFaq.answer, /공휴일 운영 여부 미확인/);

  const spec = buildPharmacyJsonLd(thursdayException).openingHoursSpecification;
  const thu = spec.find((s) => s.dayOfWeek.endsWith("Thursday"))!;
  const fri = spec.find((s) => s.dayOfWeek.endsWith("Friday"))!;
  assert.equal(thu.closes, "19:00");
  assert.equal(fri.closes, "18:30");
  assert.equal(spec.length, 5);
});

run("공휴일 정보가 없으면 연중무휴나 영업으로 단정하지 않는다", () => {
  const text = JSON.stringify(buildAiLessDetailTemplate(thursdayException));
  assert.doesNotMatch(text, /연중|무휴|공휴일에도 (영업|운영합니다)/);
  assert.equal(describeHoliday(normalizeWeeklySchedule(thursdayException.operating_hours)), "공휴일 운영 여부 미확인");
});

run("시작=종료처럼 불확실한 요일은 JSON-LD에서 제외된다", () => {
  const ambiguous: Pharmacy = {
    ...thursdayException,
    operating_hours: { ...thursdayException.operating_hours!, fri: slot("0900", "0900") },
  };
  const spec = buildPharmacyJsonLd(ambiguous).openingHoursSpecification;
  assert.equal(spec.some((s) => s.dayOfWeek.endsWith("Friday")), false);
});

run("종료 직전·정각·직후 상태가 시간표대로 바뀐다 (목요일 19:00 종료)", () => {
  const h = thursdayException.operating_hours;
  assert.equal(getOperatingStatusAt(h, kst("2026-10-22T18:59:00")).label, "곧 종료");
  assert.equal(getOperatingStatusAt(h, kst("2026-10-22T19:00:00")).label, "영업 종료");
  assert.equal(getOperatingStatusAt(h, kst("2026-10-22T19:01:00")).label, "영업 종료");
  // 금요일은 18:30 종료
  assert.equal(getOperatingStatusAt(h, kst("2026-10-23T18:29:00")).label, "곧 종료");
  assert.equal(getOperatingStatusAt(h, kst("2026-10-23T18:30:00")).label, "영업 종료");
});

run("KST 날짜 경계와 자정 이후 영업을 처리한다", () => {
  const night = {
    thu: slot("2000", "0200"),
    fri: none,
  };
  // 목요일 20:00 시작, 금요일 00:30(KST)은 전날 영업 연장
  const status = getOperatingStatusAt(night, kst("2026-10-23T00:30:00"));
  assert.equal(status.label, "영업 중");
  assert.equal(status.continuesFromPreviousDay, true);
  // 금요일 자체 시간표가 없으므로 02:00 이후는 영업 중으로 표시되지 않는다.
  assert.equal(getOperatingStatusAt(night, kst("2026-10-23T02:00:00")).label, "정보 없음");
  // UTC 기준 날짜는 같지만 KST로는 다음 날인 순간: 2026-10-22T16:00Z = 10-23 01:00 KST
  assert.equal(getOperatingStatusAt(night, new Date("2026-10-22T15:30:00Z")).label, "영업 중");
});

run("운영시간이 없으면 정보 없음이며 영업 중으로 표시하지 않는다", () => {
  assert.equal(getOperatingStatusAt(null, kst("2026-10-22T12:00:00")).label, "정보 없음");
  const empty: Pharmacy = { ...thursdayException, operating_hours: null };
  assert.match(buildAiLessDetailTemplate(empty).summary, /평일 운영 정보 없음/);
});

run("저장된 소개문의 근거 없는 주장은 공개 요약에서 제외된다", () => {
  const template = buildAiLessDetailTemplate(thursdayException).summary;
  const claims = [
    "리뷰 0건이지만 방문자들은 친절하다고 평가합니다.",
    "역에서 도보 3분 거리에 있습니다.",
    "지역 평균 대비 상위 10% 약국입니다.",
    "주차와 카드 결제가 가능합니다.",
    "연중무휴로 운영합니다.",
    "평일 모두 18:00에 문을 닫습니다.",
  ];
  for (const claim of claims) {
    assert.notEqual(findUnsupportedPharmacyClaims(claim, thursdayException).length, 0, claim);
    assert.equal(selectPharmacySummary(thursdayException, [claim], template), template);
  }
  const grounded = "목요일은 19:00까지, 나머지 평일은 18:30까지 운영하도록 등록되어 있습니다.";
  assert.deepEqual(findUnsupportedPharmacyClaims(grounded, thursdayException), []);
  assert.equal(selectPharmacySummary(thursdayException, [null, grounded], template), grounded);
});

if (failed > 0) {
  process.exitCode = 1;
  throw new Error(`${failed} test(s) failed`);
}

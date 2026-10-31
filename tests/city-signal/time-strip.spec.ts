import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

test("registered ribbons preserve unknown, invalid, equal and overnight hours", async ({ page }, info) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  await page.clock.install({ time: new Date("2026-10-22T14:00:00Z") }); // Thursday 23:00 KST
  const cases = [
    { hpid: "V2-NORMAL", slot: { open: "0900", close: "1900" } },
    { hpid: "V2-NIGHT", slot: { open: "2200", close: "0200" } },
    { hpid: "V2-EQUAL", slot: { open: "0900", close: "0900" } },
    { hpid: "V2-INVALID", slot: { open: "2960", close: "1800" } },
    { hpid: "V2-MISSING", slot: { open: null, close: null } },
  ];
  await page.route("**/api/nearby?**", route => route.fulfill({ json: { items: cases.map(({ hpid, slot }) => ({ hpid, name: hpid, address: "로컬 화면 검증", operating_hours: { thu: slot } })), total: 5 } }));
  await page.goto("/");
  await page.getByRole("textbox", { name: "지역명 또는 약국명" }).fill("리본");
  await page.getByRole("button", { name: "검색하기" }).click();
  const normal = page.locator('[data-pharmacy-id="V2-NORMAL"]');
  await expect(normal.locator("[data-time-strip]")).toContainText("09:00 - 19:00");
  await expect(normal.locator("[data-time-strip]")).toContainText("23:00 (한국)");
  await expect(normal.locator(".city-time-range")).toHaveCount(1);
  await expect(page.locator('[data-pharmacy-id="V2-NIGHT"] .city-time-range')).toHaveCount(1);
  await expect(page.locator('[data-pharmacy-id="V2-NIGHT"] [data-time-strip]')).toContainText("익일 02:00");
  for (const id of ["EQUAL", "INVALID", "MISSING"]) {
    const card = page.locator(`[data-pharmacy-id="V2-${id}"]`);
    await expect(card.locator(".city-time-range")).toHaveCount(0);
    await expect(card.locator("[data-time-strip]")).toContainText("공휴일·실제 운영은 전화 확인");
    await expect(card.locator('a[href^="tel:"]')).toHaveCount(0);
  }
  await expect(page.locator('[data-pharmacy-id="V2-EQUAL"] [data-time-strip]')).toContainText("확인 필요");
  await expect(page.locator('[data-pharmacy-id="V2-MISSING"] [data-time-strip]')).toContainText("정보 없음");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.locator(".city-home-results").screenshot({ path: resolve(`.goal-harness/city-signal-v2-20261023/runtime/results-${info.project.name}.png`) });
});


test("after midnight ribbon includes the actual previous weekday spill", async ({ page }) => {
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  await page.clock.install({ time: new Date("2026-10-22T16:00:00Z") });
  await page.route("**/api/nearby?**", route => route.fulfill({ json: { items: [{ hpid: "V2-SPILL", name: "심야 검증", address: "로컬 검증", operating_hours: { thu: { open: "2200", close: "0200" } } }], total: 1 } }));
  await page.goto("/");
  await page.getByRole("textbox", { name: "지역명 또는 약국명" }).fill("심야");
  await page.getByRole("button", { name: "검색하기" }).click();
  const card = page.locator('[data-pharmacy-id="V2-SPILL"]');
  await expect(card.locator(".city-time-previous")).toHaveCount(1);
  await expect(card.locator("[data-time-strip]")).toContainText("금요일 등록 시간표");
  await expect(card.locator("[data-time-strip]")).toContainText("전날(목) 시작한 심야 시간표, 오늘 02:00까지 · 현재 이 구간에 해당");
});

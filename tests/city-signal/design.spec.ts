import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

const productAId = "d5e1a9f0-1c2d-4a3b-8c4d-00000000c1a1";
const productBId = "d5e1a9f0-1c2d-4a3b-8c4d-00000000c1b2";
const medicineId = "d5e1a9f0-1c2d-4a3b-8c4d-00000000c1c3";

const routes = [
  ["home", "/", /약국이 필요한/], ["nearby", "/nearby", /내 주변 약국/],
  ["region", "/서울특별시/강남구", /강남구.*약국/],
  ["pharmacy", "/pharmacy/CITY-TEST", /화면검증약국/],
  ["guide", "/guide", /약국 이용 가이드 모음/],
  ["guide-article", "/guide/night-weekend", /야간·주말 약국/],
  ["blog", "/blog", /약국 이용 인사이트/],
  ["blog-article", "/blog/holiday-pharmacy-open-check", /공휴일에 약국이 열려 있나요/],
  ["wiki", "/wiki", /영양제 위키/],
  ["wiki-product", `/wiki/product/${productAId}`, /화면검증 비타민 CITY-A/],
  ["wiki-medicine", `/wiki/medicine/${medicineId}`, /화면검증 의약품/],
  ["wiki-ingredient", "/wiki/ingredient/city-test", /화면검증성분/],
  ["wiki-compare", `/wiki/vs/${productAId}_vs_${productBId}`, /제품 비교/],
  ["wiki-tag", "/wiki/tag/비타민", /비타민/],
  ["topic-hub", "/hub/city-test", /화면검증 주제 모음/],
  ["about", "/about", /약국오늘/], ["contact", "/contact", /문의하기/],
  ["privacy", "/privacy", /개인정보처리방침/], ["terms", "/terms", /이용약관/],
  ["not-found", "/city-signal-missing-page", /페이지를 찾을 수 없습니다/],
] as const;

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => ["127.0.0.1", "localhost"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

for (const [name, route, expectedHeading] of routes) {
  test(`${name}: responsive public template`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(name === "not-found" ? 404 : 200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(expectedHeading);
    if (name === "wiki-product" || name === "wiki-medicine") {
      await expect(page).toHaveURL(new RegExp(`${name === "wiki-product" ? productAId : medicineId}$`));
    }
    await page.waitForLoadState("load");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toContainText(expectedHeading);
    await expect(page.locator("h1")).toBeVisible();
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(page.locator(".city-site-footer")).toContainText("개인정보 처리방침");
    expect(errors).toEqual([]);
    await expect(page.locator("h1")).toBeVisible();
    await page.screenshot({ path: resolve(`.goal-harness/city-signal-20261012/runtime/after-${name}-${info.project.name}.png`), fullPage: true });
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("header keyboard/mobile navigation and policy links", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator(".city-menu-toggle");
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.locator("#city-primary-nav a").first().focus();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
  }
  await page.locator("#city-primary-nav").getByRole("link", { name: "소개", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  if (await toggle.isVisible()) await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.locator("footer").getByRole("link", { name: "문의", exact: true }).click();
  await expect(page.getByText("support@todayyakuk.com", { exact: true }).first()).toBeVisible();
  await page.locator("footer").getByRole("link", { name: "개인정보 처리방침", exact: true }).click();
  await expect(page.locator("h1")).toHaveText(/개인정보\s*처리방침/);
});

test("home keyword success, empty, error and short query", async ({ page }) => {
  let state: "success" | "empty" | "error" = "success";
  await page.route("**/api/nearby?**", route => state === "error" ? route.fulfill({ status: 503, json: { error: "fixture" } }) : route.fulfill({ json: { items: state === "empty" ? [] : [{ hpid: "CITY-TEST", name: "화면검증약국 (테스트)", address: "서울특별시 강남구 테스트로 1", tel: "02-555-1234", operating_hours: {}, distanceKm: 0.2 }], total: state === "empty" ? 0 : 1 } }));
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "지역명 또는 약국명" });
  await input.fill("검증");
  await page.getByRole("button", { name: "검색하기" }).click();
  await expect(page.locator('[data-pharmacy-id="CITY-TEST"]')).toBeVisible();
  await expect(page.locator('a[href="tel:02-555-1234"]')).toBeVisible();
  state = "empty";
  await input.fill("없는약국");
  await page.getByRole("button", { name: "검색하기" }).click();
  await expect(page.getByRole("status")).toContainText("검색 결과가 없습니다");
  state = "error";
  await input.fill("오류");
  await page.getByRole("button", { name: "검색하기" }).click();
  await expect(page.getByRole("status")).toContainText("오류");
  await input.fill("한");
  await page.getByRole("button", { name: "검색하기" }).click();
  await expect(page.getByRole("status")).toContainText("2글자");
});

test("GPS permission granted and denied, nearby controls", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 37.5, longitude: 127 });
  await page.goto("/");
  await page.getByRole("button", { name: "현재 위치로 찾기", exact: true }).click();
  await expect(page.locator('[data-pharmacy-id="CITY-TEST"]')).toBeVisible();
  await page.goto("/nearby");
  await page.getByRole("button", { name: /위치/ }).first().click();
  await expect(page.locator('[data-pharmacy-id="CITY-TEST"]').first()).toBeVisible();
  await page.getByRole("button", { name: "종료 임박순", exact: true }).click();
  await expect(page.getByRole("button", { name: "종료 임박순", exact: true })).toHaveAttribute("aria-pressed", "true");
  await context.clearPermissions();
  await page.addInitScript(() => Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: (_success: unknown, failure: (error: { code: number }) => void) => failure({ code: 1 }) } }));
  await page.goto("/");
  await page.getByRole("button", { name: "현재 위치로 찾기", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/위치|권한/);
  await expect(page.getByRole("link", { name: "서울", exact: true }).first()).toBeVisible();
});

test("pharmacy copy/maps and article TOC", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/pharmacy/CITY-TEST");
  await expect(page.getByRole("link", { name: "네이버 지도" })).toHaveAttribute("href", /^https:\/\/map\.naver\.com\//);
  await expect(page.getByRole("link", { name: "카카오맵" })).toHaveAttribute("href", /^https:\/\/map\.kakao\.com\//);
  await page.getByRole("button", { name: "주소 복사" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("테스트로 1");
  await page.goto("/guide/night-weekend");
  const anchor = page.locator('a[href^="#"]').filter({ hasText: /.+/ }).last();
  const target = await anchor.getAttribute("href");
  expect(target).toBeTruthy();
  await anchor.click();
  await expect(page.locator(target!)).toBeVisible();
});

test("wiki category, search result navigation and missing facts", async ({ page }) => {
  await page.goto("/wiki");
  await page.getByRole("link", { name: "🍊 비타민C", exact: true }).click();
  await expect(page).toHaveURL(/category=vitamin-c/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await page.route("**/api/wiki/search?**", route => route.fulfill({ json: { success: true, products: [{ id: productAId, name: "화면검증 비타민 CITY-A (테스트)", manufacturer: "테스트 제조사", image_url: null, tags: [] }] } }));
  await page.getByPlaceholder("찾으시는 제품명이나 제조사를 검색하세요").fill("검증");
  await page.locator(`.wiki-search-container a[href$="${productAId}"]`).click();
  await expect(page.locator("h1")).toContainText("화면검증 비타민");
  await expect(page.getByText("구조화 영양성분이 비어 있어도", { exact: false })).toBeVisible();
  await page.goto(`/wiki/vs/${productAId}_vs_${productBId}`);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText("두 제품 모두 출처 표식이 있는 구조화 영양성분이 없습니다", { exact: false })).toBeVisible();
});

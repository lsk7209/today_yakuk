import { test, expect, type Page } from "@playwright/test";

const pageFailures = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const failures: string[] = [];
  pageFailures.set(page, failures);
  page.on("pageerror", error => failures.push(error.message));
  page.on("response", response => {
    if (response.status() >= 500 && new URL(response.url()).hostname === "127.0.0.1") failures.push(`${response.status()} ${response.url()}`);
  });
  // No requests to real analytics/advertising/location services from fixtures.
  await page.route("**/*", (route) => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
});

test.afterEach(async ({ page }) => {
  expect(pageFailures.get(page)).toEqual([]);
});

test("detail clock and both status badges change at close without a data request", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-09-14T21:29:50+09:00") });
  await page.goto("/pharmacy/T01-CLOSE");
  await page.clock.pauseAt(new Date("2026-09-14T21:29:59+09:00"));
  const status = page.locator("[data-pharmacy-status]").first();
  await expect(status).toContainText("곧 종료");
  await expect(page.locator("[data-today-hours]")).toHaveText("10:00 - 21:30");
  await expect(page.getByLabel("현재 시간(KST) 21:29")).toBeVisible();
  let dataRequests = 0;
  page.on("request", request => { if (/\/api\/|collect\?|[?&]_rsc=/.test(request.url())) dataRequests++; });
  await page.clock.runFor(1100);
  await expect(status).toContainText("영업 종료");
  await expect(page.locator("[data-pharmacy-status]").nth(1)).toContainText("영업 종료");
  await expect(page.getByLabel("현재 시간(KST) 21:30")).toBeVisible();
  expect(dataRequests).toBe(0);
  expect(errors).toEqual([]);
  await expect(page.locator('a[href="tel:000-0000-0000"]')).toHaveCount(0);
  await expect(page.locator('a[href^="https://map.naver.com/"]').first()).toHaveAttribute("href", /search/);
  expect(await page.locator('script[type="application/ld+json"]').allTextContents()).not.toEqual(expect.arrayContaining([expect.stringContaining("현재 상태는")]));
});

test("midnight changes weekday and explains previous-day overnight operation", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-14T23:59:50+09:00") });
  await page.goto("/pharmacy/T01-OVERNIGHT");
  await page.clock.pauseAt(new Date("2026-09-14T23:59:59+09:00"));
  await expect(page.locator('[data-schedule-day="mon"]')).toHaveAttribute("data-today", "true");
  await page.clock.runFor(1100);
  await expect(page.locator('[data-schedule-day="tue"]')).toHaveAttribute("data-today", "true");
  await expect(page.getByText("이전 영업일의 심야 운영시간에 해당합니다.", { exact: true })).toBeVisible();
  await expect(page.locator("[data-pharmacy-status]").first()).toContainText("영업 중");
  await page.clock.runFor(2 * 60 * 60 * 1000);
  await expect(page.locator("[data-pharmacy-status]").first()).toContainText("영업 종료");
});

test("region open filter includes closing-soon and refreshes at close", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-14T21:29:50+09:00") });
  await page.goto("/서울/테스트구");
  await page.clock.pauseAt(new Date("2026-09-14T21:29:59+09:00"));
  await page.getByRole("button", { name: "영업 중", exact: true }).click();
  await expect(page.getByRole("heading", { name: "검증약국", exact: true })).toBeVisible();
  let calls = 0;
  page.on("request", r => { if (r.url().includes("/api/")) calls++; });
  await page.clock.runFor(1100);
  await expect(page.getByRole("heading", { name: "검증약국", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "늦은검증약국", exact: true })).toBeVisible();
  expect(calls).toBe(0);
});

test("nearby search and coordinate responses carry structured operating hours", async ({ request }) => {
  for (const query of ["q=" + encodeURIComponent("검증약국"), "lat=37.5&lon=127&radiusKm=3"]) {
    const response = await request.get("/api/nearby?" + query);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items.length).toBeGreaterThan(0);
    for (const item of body.items) expect(typeof item.operating_hours).toBe("object");
    expect(body.items.find((item: { hpid: string }) => item.hpid === "T01-CLOSE").operating_hours.mon).toEqual({ open: "1000", close: "2130" });
  }
});

for (const path of ["/", "/nearby"]) test(`${path} results refresh status and closing order without refetching`, async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 37.5, longitude: 127 });
    await page.goto(path);
    const trigger = path === "/"
      ? page.getByRole("button", { name: "지역·약국명 검색", exact: true })
      : page.getByRole("button", { name: "현재 위치로 약국 찾기", exact: true });
    await expect(trigger).toBeVisible();
    await page.clock.install({ time: new Date("2026-09-14T21:29:50+09:00") });
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    if (path === "/") {
      await page.getByPlaceholder("동 이름 또는 건물명으로 찾기").fill("검증약국");
      await trigger.click();
    } else {
      await trigger.click();
    }
    const name = path === "/" ? page.getByRole("link", { name: "검증약국", exact: true }) : page.getByRole("heading", { name: "검증약국", exact: true });
    const status = path === "/" ? name.locator("..").locator("span").first() : name.locator("../..").locator("[data-pharmacy-status]");
    await expect(status).toContainText("곧 종료");
    await page.clock.pauseAt(new Date("2026-09-14T21:29:59+09:00"));
    await page.getByRole("button", { name: path === "/" ? "종료 임박" : "종료 임박순", exact: true }).click();
    const resultNames = path === "/" ? page.locator('main a[href^="/pharmacy/"]') : page.locator("main article h3");
    await expect(resultNames.first()).toHaveText("검증약국");
    let calls = 0;
    const onRequest = (request: { url(): string }) => { if (request.url().includes("/api/nearby")) calls++; };
    page.on("request", onRequest);
    await page.clock.runFor(1100);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(status).toContainText("영업 종료");
    await expect(resultNames.first()).toHaveText("늦은검증약국");
    expect(calls).toBe(0);
    page.off("request", onRequest);
});

test("prescription pages align visible guidance, FAQ/schema, metadata and correction date", async ({ page, request }) => {
  for (const slug of ["prescription-holiday-guide", "prescription-prep-tips", "pharmacy-visit-checklist-3"]) {
    const response = await page.goto(`/blog/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/blog/${slug}$`));
    await expect(page.getByRole("link", { name: "근거: 의료법 시행규칙 제12조", exact: true })).toHaveAttribute("href", "https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1019641101");
    await expect(page.locator('time[datetime="2026-09-20"]')).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).toContain("처방전에 기재된");
    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap(value => JSON.parse(value));
    const article = schemas.find(value => value["@type"] === "Article" || value["@type"] === "BlogPosting");
    expect(article.dateModified).toBe("2026-09-20");
    const faq = schemas.find(value => value["@type"] === "FAQPage");
    expect(faq.mainEntity.some((item: { acceptedAnswer: { text: string } }) => item.acceptedAnswer.text.includes("처방전에 기재된 기간"))).toBe(true);
    const combined = [text, JSON.stringify(schemas), await page.locator('meta[name="description"]').getAttribute("content")].join(" ");
    expect(combined).not.toMatch(/(?:유효기간|사용기간)[^。.!?\n]{0,18}(?:3일 규정|포함 3일|은 3일)|처방전은?[^。.!?\n]{0,18}발행일 포함 3일|당일\+2일|발급받은 날로부터 2일/);
  }
  for (const path of ["/blog", "/rss.xml"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).not.toContain("유효기간 3일 규정");
    expect(body).toContain("처방전에 기재된 사용기간 확인·운영 약국 조회·방문 전 문의 안내");
  }
});

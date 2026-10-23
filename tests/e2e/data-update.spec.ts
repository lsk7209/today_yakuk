import { expect, test } from "@playwright/test";
import { SignJWT } from "jose";
import audit from "../../content/data-audits/2026-08-27.json";
import followUpAudit from "../../content/data-audits/2026-08-28.json";

type CapturedEvent = [string, string, Record<string, unknown>];

const DRAFT_SLUGS = [
  "data-update-2026-08",
  "supplement-label-reading-guide",
  "supplement-additives-label-guide",
];

async function previewCookie() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode("e2e-preview-secret"));
  return { name: "admin_token", value: token, url: `http://localhost:${process.env.PORT || "3000"}` };
}

// 승인된 미리보기(관리자 쿠키)에서만 초안 본문을 검증한다. 익명 접근은 아래 404 테스트가 보장한다.
test.beforeEach(async ({ page, context }) => {
  await context.addCookies([await previewCookie()]);
  await page.addInitScript(() => {
    const analyticsWindow = window as typeof window & {
      __analyticsCalls: unknown[][];
      gtag: (...args: unknown[]) => void;
    };
    analyticsWindow.__analyticsCalls = [];
    analyticsWindow.gtag = (...args: unknown[]) => {
      analyticsWindow.__analyticsCalls.push(args);
    };
  });

  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["localhost", "127.0.0.1"].includes(url.hostname)
      ? route.continue()
      : route.abort();
  });
});

test.describe("익명 방문자", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  for (const slug of DRAFT_SLUGS) {
    test(`초안 ${slug}는 직접 URL에서 404이고 본문이 노출되지 않는다`, async ({ page }) => {
      const response = await page.goto(`/blog/${slug}`);
      expect(response?.status()).toBe(404);
      await expect(page.getByText("로컬 검토용 초안")).toHaveCount(0);
    });
  }
});

test("data update explains fresh records without calling them new approvals", async ({ page }) => {
  await page.goto("/blog/data-update-2026-08");

  await expect(page).toHaveTitle(/2026년 8월 약국·의약품·건강기능식품 데이터 업데이트/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "2026년 8월 약국·의약품·건강기능식품 데이터 업데이트",
    }),
  ).toBeVisible();
  await expect(page.getByText("989개", { exact: true })).toBeVisible();
  await expect(page.getByText("25개", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex, nofollow/);
  await expect(page.getByText(/신규 허가·신고일이나 신제품 출시일을 뜻하지 않습니다/)).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "새 공개 경로는 0건이었습니다" }),
  ).toBeVisible();
  await expect(page.getByText("15개", { exact: true })).toBeVisible();
  await expect(page.getByText("0건", { exact: true })).toHaveCount(2);
  await expect(page.getByRole("link", { name: "영양제 라벨 읽는 순서" })).toHaveAttribute(
    "href",
    "/blog/supplement-label-reading-guide",
  );
  await expect(page.getByRole("link", { name: "영양제·의약품 정보 보기" })).toHaveAttribute(
    "href",
    "/wiki",
  );
  for (const candidate of [
    ...audit.publicSitemap.datasets.supplements.candidates,
    ...audit.publicSitemap.datasets.medicines.candidates,
  ]) {
    await expect(page.getByRole("link", { name: new RegExp(candidate.name) })).toHaveAttribute(
      "href",
      new URL(candidate.loc).pathname,
    );
  }
});

test("label guide separates reported fields from inferences and routes to the funnel", async ({ page }) => {
  await page.goto("/blog/supplement-label-reading-guide");

  await expect(page).toHaveTitle(/영양제 라벨 읽는 순서: 기능성·원료명·섭취량/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "영양제 라벨 읽는 순서: 기능성·원료명·섭취량",
    }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex, nofollow/);
  await expect(page.getByRole("heading", { name: "2분 안에 보는 핵심 순서" })).toBeVisible();
  await expect(page.getByText(/실제 제품에 해당 성분이 없다는 증거가 아닙니다/)).toBeVisible();
  await expect(
    page.getByText(
      new RegExp(`기존 제품 ${followUpAudit.githubActions.autoEnrichment.attemptedExistingRows}개`),
    ),
  ).toBeVisible();

  for (const candidate of audit.publicSitemap.datasets.supplements.candidates) {
    await expect(page.getByRole("link", { name: new RegExp(candidate.name) })).toHaveAttribute(
      "href",
      new URL(candidate.loc).pathname,
    );
  }

  await expect(page.getByRole("link", { name: "영양제 신고정보 찾기" })).toHaveAttribute(
    "href",
    "/wiki",
  );
  const nearby = page.getByRole("link", { name: "가까운 약국 찾기" });
  await expect(nearby).toHaveAttribute("href", "/nearby");
  await expect(nearby).toHaveAttribute("data-analytics-event", "content_to_nearby_click");
  await expect(nearby).toHaveAttribute("data-source-surface", "supplement_label_guide");
  await expect(page.locator("html")).toHaveAttribute("data-analytics-ready", "true");
  await nearby.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { once: true });
    (element as HTMLElement).click();
  });
  await expect
    .poll(async () => (await capturedEvents(page)).map((event) => event[1]))
    .toContain("content_to_nearby_click");
  const nearbyEvent = (await capturedEvents(page)).find(
    (event) => event[1] === "content_to_nearby_click",
  );
  expect(nearbyEvent?.[2]).toMatchObject({
    source_surface: "supplement_label_guide",
    cta_placement: "bottom",
  });
  await expect(page.getByRole("link", { name: "식품안전나라 건강기능식품 검색" })).toHaveAttribute(
    "href",
    "https://www.foodsafetykorea.go.kr/portal/healthyfoodlife/searchHomeHF.do",
  );

  const structuredData = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(structuredData).toContain("BreadcrumbList");
  expect(structuredData).not.toMatch(/FAQPage|HowTo|Article/);
});

test("additives guide explains signal limits and keeps the draft out of indexing", async ({ page }) => {
  await page.goto("/blog/supplement-additives-label-guide");

  const title = "영양제 첨가물 표시 읽는 법: 원료·기능성분과 구분하기";
  await expect(page).toHaveTitle(new RegExp(title));
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex, nofollow/);
  await expect(page.getByText(/2026년 9월 22일 09:00 KST/)).toBeVisible();
  await expect(page.getByText(/실제 예약이 아닌 다음 후보 시각/)).toBeVisible();
  await expect(page.getByText(/해당 첨가물이 없거나 제품이 무첨가·안전하다는 증명/)).toBeVisible();
  await expect(page.getByRole("link", { name: "영양제 신고정보 찾기" })).toHaveAttribute(
    "href",
    "/wiki",
  );
  await expect(page.getByRole("link", { name: "라벨 읽는 기본 순서" })).toHaveAttribute(
    "href",
    "/blog/supplement-label-reading-guide",
  );
  await expect(page.getByRole("link", { name: "약국 전화 문의 문장 예시" })).toHaveAttribute(
    "href",
    "/guide/call-scripts",
  );
  await expect(
    page.getByRole("link", { name: "국가법령정보센터 건강기능식품의 표시기준" }),
  ).toHaveAttribute("href", /law\.go\.kr\/LSW\/admRulInfoP\.do/);

  const nearby = page.getByRole("link", { name: "가까운 약국 찾기" });
  await expect(nearby).toHaveAttribute("href", "/nearby");
  await expect(nearby).toHaveAttribute("data-analytics-event", "content_to_nearby_click");
  await expect(nearby).toHaveAttribute("data-source-surface", "supplement_additives_guide");
  await expect(nearby).toHaveAttribute("data-cta-placement", "bottom");
  await expect(page.locator("html")).toHaveAttribute("data-analytics-ready", "true");
  await nearby.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { once: true });
    (element as HTMLElement).click();
  });
  await expect
    .poll(async () => (await capturedEvents(page)).map((event) => event[1]))
    .toContain("content_to_nearby_click");
  const nearbyEvent = (await capturedEvents(page)).find(
    (event) => event[1] === "content_to_nearby_click",
  );
  expect(nearbyEvent?.[2]).toMatchObject({
    source_surface: "supplement_additives_guide",
    cta_placement: "bottom",
  });

  const structuredData = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(structuredData).toContain("BreadcrumbList");
  expect(structuredData).not.toMatch(/FAQPage|HowTo|Article/);
});

async function capturedEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const analyticsWindow = window as typeof window & { __analyticsCalls?: unknown[][] };
    return (analyticsWindow.__analyticsCalls || []) as CapturedEvent[];
  });
}

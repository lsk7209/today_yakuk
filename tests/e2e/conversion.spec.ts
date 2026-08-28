import { expect, test } from "@playwright/test";

type CapturedEvent = [string, string, Record<string, unknown>];

test.beforeEach(async ({ page }) => {
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

test("keyword results expose a direct phone CTA and send privacy-bounded events", async ({
  page,
}) => {
  await page.route("**/api/nearby?**", (route) =>
    route.fulfill({
      json: {
        total: 1,
        items: [
          {
            hpid: "TEST-PHARMACY-1",
            name: "테스트약국",
            address: "서울특별시 중구 테스트로 1",
            tel: "02-123-4567",
            province: "서울",
            city: "중구",
            distanceKm: 0.4,
            operating_hours: {
              sun: { open: "00:00", close: "23:59" },
              mon: { open: "00:00", close: "23:59" },
              tue: { open: "00:00", close: "23:59" },
              wed: { open: "00:00", close: "23:59" },
              thu: { open: "00:00", close: "23:59" },
              fri: { open: "00:00", close: "23:59" },
              sat: { open: "00:00", close: "23:59" },
            },
          },
        ],
      },
    }),
  );

  await page.goto("/");
  await page.getByPlaceholder("동 이름 또는 건물명으로 찾기").fill("강남 감기약");
  await page.getByRole("button", { name: "지역·약국명 검색" }).click();

  await expect(page.getByText("테스트약국", { exact: true })).toBeVisible();
  const phone = page.getByRole("link", { name: "테스트약국에 전화하기" });
  await expect(phone).toBeVisible();
  await expect(phone).toHaveAttribute("href", "tel:02-123-4567");
  await phone.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { once: true });
    (element as HTMLElement).click();
  });

  await page.evaluate(() => {
    const context = document.createElement("div");
    context.dataset.pharmacyId = "TEST-PHARMACY-1";
    context.dataset.sourceSurface = "pharmacy_detail";
    context.dataset.openingStatus = "영업 중";
    const link = document.createElement("a");
    link.href = "https://map.kakao.com/link/map/test";
    link.textContent = "길찾기";
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    context.appendChild(link);
    document.body.appendChild(context);
    link.click();
  });

  await expect
    .poll(async () => (await capturedEvents(page)).map((event) => event[1]))
    .toEqual(
      expect.arrayContaining([
        "pharmacy_search_submitted",
        "pharmacy_results_loaded",
        "pharmacy_contact_intent",
        "pharmacy_directions_intent",
      ]),
    );

  const serialized = JSON.stringify(await capturedEvents(page));
  expect(serialized).not.toContain("강남 감기약");
  expect(serialized).not.toContain("02-123-4567");
  expect(serialized).not.toContain("latitude");
  expect(serialized).not.toContain("longitude");
});

test("content CTA sends the nearby-funnel event without loading Google scripts in dev", async ({
  page,
}) => {
  await page.goto("/blog/kids-fever-medicine-comparison");
  await expect(page.locator("html")).toHaveAttribute("data-analytics-ready", "true");
  const cta = page.getByRole("link", { name: "내 주변 약국 찾기", exact: true });
  await expect(cta).toBeVisible();
  await cta.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { once: true });
    (element as HTMLElement).click();
  });

  await expect
    .poll(async () => (await capturedEvents(page)).map((event) => event[1]))
    .toContain("content_to_nearby_click");

  const html = await page.content();
  expect(html).not.toContain("googletagmanager.com");
  expect(html).not.toContain("pagead2.googlesyndication.com");
});

async function capturedEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const analyticsWindow = window as typeof window & { __analyticsCalls?: unknown[][] };
    return (analyticsWindow.__analyticsCalls || []) as CapturedEvent[];
  });
}

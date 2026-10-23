import { test, expect, type Page } from "@playwright/test";

// 운영 DB 없이 검증하기 위해 /api/nearby는 목업 응답을 사용한다 (실제 개인 위치·외부 전송 없음).
const slot = { open: "0900", close: "1800" };
const MOCK_ITEMS = [
  {
    hpid: "MOCK0001",
    name: "목업약국",
    address: "서울특별시 강남구 테헤란로 1",
    tel: "02-123-4567",
    operating_hours: { mon: slot, tue: slot, wed: slot, thu: slot, fri: slot, sat: slot, sun: slot },
  },
  { hpid: "MOCK0002", name: "시간없는약국", address: "서울특별시 강남구 역삼로 2", tel: "02-765-4321", operating_hours: null },
];

async function mockNearby(page: Page, body: unknown, status = 200) {
  await page.route("**/api/nearby**", (route) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }),
  );
}

test.describe("모바일 검색 흐름", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("검색 결과가 검색폼 바로 다음에 나타나고 결과 헤더로 포커스가 이동한다", async ({ page }) => {
    await mockNearby(page, { items: MOCK_ITEMS, total: 2 });
    await page.goto("/");
    await page.getByLabel("지역명 또는 약국명").fill("강남역");
    await page.getByRole("button", { name: /검색하기/ }).click();

    const card = page.locator('[data-source-surface="home_results"]').first();
    await expect(card).toBeVisible();
    const top = await card.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    expect(top).toBeLessThan(1100);
    await expect(page.getByRole("heading", { name: /검색한 약국/ })).toBeFocused();
    await expect(card.locator("[data-today-hours]")).toContainText("오늘 09:00 - 18:00");
    await expect(page.locator('[data-pharmacy-id="MOCK0002"] [data-today-hours]')).toContainText("정보 없음");
    // 좌표가 없는 키워드 검색에서는 거리 표시를 만들지 않는다.
    await expect(card).not.toContainText("—");
    await expect(page.getByRole("button", { name: "거리순" })).toBeDisabled();
    await expect(card.getByRole("link", { name: /전화하기/ })).toHaveAttribute("href", "tel:02-123-4567");
  });

  test("결과 없음에서는 전국 시·도 대체 탐색을 제공한다", async ({ page }) => {
    await mockNearby(page, { items: [], total: 0 });
    await page.goto("/");
    await page.getByLabel("지역명 또는 약국명").fill("없는동네");
    await page.getByRole("button", { name: /검색하기/ }).click();
    await expect(page.getByText(/검색 결과가 없습니다/).first()).toBeVisible();
    await expect(page.locator(".city-home-results").getByRole("link", { name: "부산" }).first()).toBeVisible();
  });

  test("요청 실패 시 오류와 다시 시도 버튼을 보여주고 재시도하면 복구된다", async ({ page }) => {
    let calls = 0;
    await page.route("**/api/nearby**", (route) => {
      calls += 1;
      return calls === 1
        ? route.fulfill({ status: 500, contentType: "application/json", body: "{}" })
        : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: MOCK_ITEMS, total: 2 }) });
    });
    await page.goto("/");
    await page.getByLabel("지역명 또는 약국명").fill("강남역");
    await page.getByRole("button", { name: /검색하기/ }).click();
    await expect(page.getByText(/오류가 발생했습니다/)).toBeVisible();
    await page.getByRole("button", { name: "다시 시도" }).click();
    await expect(page.locator('[data-source-surface="home_results"]').first()).toBeVisible();
  });

  test("위치 권한이 거부돼도 지역 검색을 계속 쓸 수 있다", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "geolocation", {
        value: {
          getCurrentPosition: (_ok: unknown, fail: (e: unknown) => void) =>
            fail({ code: 1, PERMISSION_DENIED: 1, message: "denied" }),
        },
      });
    });
    await mockNearby(page, { items: MOCK_ITEMS, total: 2 });
    await page.goto("/");
    await page.getByRole("button", { name: "현재 위치로 찾기" }).click();
    await expect(page.getByText(/위치 권한이 거부되었습니다/)).toBeVisible();
    await page.getByLabel("지역명 또는 약국명").fill("강남역");
    await page.getByRole("button", { name: /검색하기/ }).click();
    await expect(page.locator('[data-source-surface="home_results"]').first()).toBeVisible();
  });
});

test.describe("반응형 가로 넘침", () => {
  for (const width of [320, 390, 768, 1280]) {
    test(`${width}px에서 가로 스크롤이 없다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await mockNearby(page, { items: MOCK_ITEMS, total: 2 });
      await page.goto("/");
      await page.getByLabel("지역명 또는 약국명").fill("강남역");
      await page.getByRole("button", { name: /검색하기/ }).click();
      await expect(page.locator('[data-source-surface="home_results"]').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});

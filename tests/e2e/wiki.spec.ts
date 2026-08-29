import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route("**/*", (route) => {
        const url = new URL(route.request().url());
        return ["localhost", "127.0.0.1"].includes(url.hostname)
            ? route.continue()
            : route.abort();
    });
});

test.describe("Wiki Page", () => {
    test("should load wiki page successfully", async ({ page }) => {
        await page.goto("/wiki");

        // 페이지 제목 확인
        await expect(page).toHaveTitle(/영양제 정보/);

        // 히어로 섹션 확인
        await expect(page.locator("h1")).toContainText("영양제 위키");
    });

    test("should display category filters", async ({ page }) => {
        await page.goto("/wiki");

        // 카테고리 버튼들 확인
        await expect(page.getByRole("link", { name: "✨ 전체", exact: true })).toBeVisible();
        await expect(page.getByRole("link", { name: "🦠 유산균", exact: true })).toBeVisible();
        await expect(page.getByRole("link", { name: "🍊 비타민C", exact: true })).toBeVisible();
        await expect(page.getByRole("link", { name: "🐟 오메가3", exact: true })).toBeVisible();
    });

    test("should filter by category", async ({ page }) => {
        await page.goto("/wiki");

        // 유산균 카테고리 클릭
        await page.click('a[href="/wiki?category=probiotics"]');

        // URL 변경 확인
        await expect(page).toHaveURL(/category=probiotics/);
    });

    test("should have search input (disabled)", async ({ page }) => {
        await page.goto("/wiki");

        // 검색 입력창 확인 (현재 비활성화 상태)
        const searchInput = page.locator('input[placeholder*="검색"]');
        await expect(searchInput).toBeVisible();
    });
});

test.describe("Blog Page", () => {
    test("should expose the blog heading and curated links in the HTML shell", async ({ page, request }) => {
        const response = await request.get("/blog");
        expect(response.ok()).toBeTruthy();
        const html = await response.text();
        expect(html).toMatch(/<h1[^>]*>약국 이용 인사이트<\/h1>/);
        expect(html).toContain('href="/blog/holiday-pharmacy-open-check"');

        const googlebotHeaders = {
            "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        };
        const paginatedResponse = await request.get("/blog?page=2", {
            headers: googlebotHeaders,
        });
        expect(paginatedResponse.ok()).toBeTruthy();
        const paginatedHtml = await paginatedResponse.text();
        expect(paginatedHtml).toMatch(/<h1[^>]*>약국 이용 인사이트<\/h1>/);
        expect(paginatedHtml).toContain('<link rel="canonical" href="https://todaypharm.kr/blog?page=2"');
        expect(paginatedHtml).toContain('<meta name="robots" content="noindex, follow"');

        const malformedResponse = await request.get("/blog?page=2abc");
        expect(malformedResponse.ok()).toBeTruthy();
        const malformedHtml = await malformedResponse.text();
        expect(malformedHtml).toContain('<link rel="canonical" href="https://todaypharm.kr/blog"');
        expect(malformedHtml).toContain('<meta name="robots" content="index, follow"');

        const blockedSearchResponse = await request.get("/blog?q=감기약", {
            headers: googlebotHeaders,
        });
        expect(blockedSearchResponse.status()).toBe(403);
        const blockedTagPagination = await request.get("/wiki/tag/fatigue?page=2", {
            headers: googlebotHeaders,
        });
        expect(blockedTagPagination.status()).toBe(403);

        const robotsResponse = await request.get("/robots.txt");
        expect(robotsResponse.ok()).toBeTruthy();
        expect(await robotsResponse.text()).toContain("Disallow: /wiki/tag/*?page=");

        await page.goto("/blog");

        await expect(page).toHaveURL("/blog");
        await expect(
            page.getByRole("heading", { level: 1, name: "약국 이용 인사이트" }),
        ).toBeVisible();
    });
});

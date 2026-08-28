import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.route("**/*", (route) => {
        const url = new URL(route.request().url());
        return ["localhost", "127.0.0.1"].includes(url.hostname)
            ? route.continue()
            : route.abort();
    });
});

test.describe("Homepage", () => {
    test("should load homepage successfully", async ({ page }) => {
        await page.goto("/");

        // 페이지 제목 확인
        await expect(page).toHaveTitle(/약국오늘/);

        // 헤더 로고 확인
        await expect(page.locator("header")).toContainText("약국오늘");
    });

    test("should have navigation links", async ({ page }) => {
        await page.goto("/");

        // 네비게이션 링크들 확인
        const nav = page.locator("header nav");
        await expect(nav.getByRole("link", { name: "홈" })).toBeVisible();
        await expect(nav.getByRole("link", { name: "소개" })).toBeVisible();
        await expect(nav.getByRole("link", { name: "가이드" })).toBeVisible();
        await expect(nav.getByRole("link", { name: "블로그" })).toBeVisible();
        await expect(nav.getByRole("link", { name: "영양제 정보" })).toBeVisible();
    });

    test("should navigate to about page", async ({ page }) => {
        await page.goto("/");

        await Promise.all([
            page.waitForURL("/about"),
            page.locator('header nav a[href="/about"]').click(),
        ]);
    });

    test("should navigate to blog page", async ({ page }) => {
        await page.goto("/");

        await Promise.all([
            page.waitForURL("/blog"),
            page.locator('header nav a[href="/blog"]').click(),
        ]);
    });

    test("should navigate to wiki page", async ({ page }) => {
        await page.goto("/");

        await Promise.all([
            page.waitForURL("/wiki"),
            page.locator('header nav a[href="/wiki"]').click(),
        ]);
    });
});

test.describe("Footer", () => {
    test("should have footer links", async ({ page }) => {
        await page.goto("/");

        const footer = page.locator("footer");
        await expect(footer).toContainText("약국오늘");
        await expect(footer.getByRole("link", { name: "소개" })).toBeVisible();
        await expect(footer.getByRole("link", { name: "문의" })).toBeVisible();
        await expect(footer.getByRole("link", { name: "개인정보 처리방침" })).toBeVisible();
    });
});

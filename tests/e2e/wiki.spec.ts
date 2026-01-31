import { test, expect } from "@playwright/test";

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
        await expect(page.getByRole("link", { name: /전체/ })).toBeVisible();
        await expect(page.getByRole("link", { name: /유산균/ })).toBeVisible();
        await expect(page.getByRole("link", { name: /비타민C/ })).toBeVisible();
        await expect(page.getByRole("link", { name: /오메가3/ })).toBeVisible();
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
    test("should load blog list page", async ({ page }) => {
        await page.goto("/blog");

        // 블로그 페이지 로드 확인
        await expect(page).toHaveURL("/blog");
    });
});

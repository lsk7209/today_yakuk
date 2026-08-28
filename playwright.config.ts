import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT || "3000";

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${port}`,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"] },
        },
    ],

    /* Run local dev server before tests */
    webServer: {
        command: `npm run dev -- -p ${port}`,
        url: `http://localhost:${port}`,
        env: {
            TURSO_DATABASE_URL: "",
            TURSO_AUTH_TOKEN: "",
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});

import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");

export default defineConfig({
  testDir: "./p0",
  testMatch: "hours-prescription.spec.ts",
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["json", { outputFile: resolve(root, ".goal-harness/reference-112-p0-20260920/runtime/results.json") }]],
  outputDir: resolve(root, ".goal-harness/reference-112-p0-20260920/runtime/test-results"),
  use: { baseURL: "http://127.0.0.1:3249", channel: "chrome", screenshot: "only-on-failure", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], timezoneId: "America/Los_Angeles" } },
    { name: "mobile", use: { ...devices["Pixel 5"], timezoneId: "Asia/Seoul" } },
  ],
  webServer: { command: "node tests/fixtures/p0-server.mjs", cwd: root, url: "http://127.0.0.1:3249", reuseExistingServer: false, timeout: 120_000 },
});

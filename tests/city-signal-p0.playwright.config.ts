import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const artifacts = resolve(root, ".goal-harness/city-signal-20261012/runtime/p0");

export default defineConfig({
  testDir: "./p0",
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["json", { outputFile: resolve(artifacts, "results.json") }]],
  outputDir: resolve(artifacts, "test-results"),
  use: { baseURL: "http://127.0.0.1:3258", channel: "chrome", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], timezoneId: "America/Los_Angeles" } },
    { name: "mobile", use: { ...devices["Pixel 5"], timezoneId: "Asia/Seoul" } },
  ],
  webServer: {
    command: "node tests/fixtures/p0-server.mjs", cwd: root,
    env: { TODAYPHARM_P0_ARTIFACTS: artifacts, TODAYPHARM_P0_PORT: "3258" },
    url: "http://127.0.0.1:3258", reuseExistingServer: false, timeout: 120_000,
  },
});

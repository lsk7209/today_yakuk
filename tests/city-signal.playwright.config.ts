import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const artifacts = resolve(__dirname, "../.goal-harness/city-signal-20261012/runtime");

export default defineConfig({
  testDir: "./city-signal",
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["json", { outputFile: resolve(artifacts, "results.json") }]],
  outputDir: resolve(artifacts, "test-results"),
  use: { baseURL: "http://127.0.0.1:3256", channel: "chrome", trace: "retain-on-failure" },
  projects: [
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: { command: "node tests/fixtures/city-signal-server.mjs", url: "http://127.0.0.1:3256", reuseExistingServer: true, timeout: 120_000 },
});

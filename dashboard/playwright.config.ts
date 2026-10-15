import { defineConfig } from "@playwright/test";

const targetUrl = new URL(process.env.ADMIN_TEST_BASE_URL || "http://127.0.0.1:4173");
const productionHosts = new Set([
  "astitvainnovation.in",
  "www.astitvainnovation.in",
  "b2b.astitvainnovation.in",
]);

if (productionHosts.has(targetUrl.hostname.toLowerCase())) {
  throw new Error("Admin browser tests refuse to run against production. Use a staging URL.");
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: targetUrl.toString().replace(/\/$/, ""),
    browserName: "chromium",
    headless: true,
    screenshot: "off",
    video: "off",
    trace: "off",
  },
});

import { defineConfig, devices } from "@playwright/test";

const MOCK_URL = "http://127.0.0.1:4599";
const APP_URL = "http://127.0.0.1:4600";

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: APP_URL,
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node tests/mock-supabase-server.mjs",
      url: MOCK_URL + "/__test/reset",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: `NEXT_PUBLIC_SUPABASE_URL=${MOCK_URL} NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test npx next dev -p 4600`,
      url: APP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
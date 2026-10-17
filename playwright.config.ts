import { defineConfig, devices } from "@playwright/test";

// Dedicated port so the test server never collides with a dev/preview server.
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    // Deny geolocation so the Today screen deterministically exercises its
    // weather fallback (no dependency on the external Open-Meteo API).
    permissions: [],
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    // Run against the in-memory store so tests never touch the real Supabase,
    // and skip the 29 MB garment model (covered by a manual live check).
    env: { NEXT_PUBLIC_DISABLE_BACKEND: "1", NEXT_PUBLIC_DISABLE_EXTRACTION: "1" },
  },
});

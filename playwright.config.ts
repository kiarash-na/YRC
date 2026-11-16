import { defineConfig, devices } from "@playwright/test";

/**
 * Token-free end-to-end tests (see e2e/README.md).
 *
 * Starts the production build on its own port with YRC_E2E=1, so the admin
 * area admits a test admin (via a secret cookie) and the Agent runs on a
 * scripted mock model with in-memory tools. ImageKit uploads are intercepted
 * in the browser and the upload keys are dummies, so nothing is uploaded.
 *
 *   pnpm test:e2e              build + start + test
 *   E2E_SKIP_BUILD=1 pnpm test:e2e   reuse the existing .next build
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

// Shared by the server and the browser cookie. A fixed local value is fine:
// the mode only exists on a server started with YRC_E2E=1 (never deployed).
export const E2E_SECRET = process.env.YRC_E2E_SECRET ?? "local-e2e-secret-never-deploy-0001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `${process.env.E2E_SKIP_BUILD ? "" : "pnpm build && "}pnpm exec next start -p ${PORT}`,
    url: `${BASE_URL}/login`,
    timeout: 300_000,
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      YRC_E2E: "1",
      YRC_E2E_SECRET: E2E_SECRET,
      IMAGEKIT_PUBLIC_KEY: "public_e2e_dummy",
      IMAGEKIT_PRIVATE_KEY: "private_e2e_dummy",
      // Never let a test run reach a real model, whatever the shell has.
      VERCEL_AI_GATEWAY: "",
      AI_GATEWAY_API_KEY: "",
    },
  },
});

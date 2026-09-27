import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

// Pruebas e2e: archivos *.e2e.ts (bun test ignora esta extensión).
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-PE",
    timezoneId: "America/Lima",
    trace: "on-first-retry",
  },
  projects: [
    { name: "movil", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 640 } } },
    { name: "escritorio", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `bun run build && bunx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});

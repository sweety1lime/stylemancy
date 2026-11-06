import { defineConfig, devices } from '@playwright/test';

const PORT = 5179;
// Второй сервер без VITE_PIXEL_LOOK: игра такой, какой её видят на сайте (пиксельный вид спрятан), см. tests/public.spec.ts
const PUBLIC_PORT = 5180;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // Серверы GitHub медленнее: одна повторная попытка, чтобы случайная задержка не останавливала публикацию
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  // JS-уровни запускают код в фоновых потоках: под нагрузкой первая проверка бывает дольше пяти секунд
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /public\.spec\.ts/ },
    { name: 'public', use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${PUBLIC_PORT}` }, testMatch: /public\.spec\.ts/ },
    // Firefox и WebKit (Safari) — только для «Моей земли» и только по просьбе, чтобы обычный прогон и публикация не менялись:
    // $env:CROSS_BROWSER=1; npx playwright test --project=firefox --project=webkit (браузеры: npx playwright install firefox webkit)
    ...(process.env.CROSS_BROWSER
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /land.*\.spec\.ts/ },
          { name: 'webkit', use: { ...devices['Desktop Safari'] }, testMatch: /land.*\.spec\.ts/ },
        ]
      : []),
  ],
  webServer: [
    {
      // Для разработки и тестов оба вида включены: пиксельный на сайте спрятан (VITE_PIXEL_LOOK, game/settings.ts)
      command: `npm run dev -- --port ${PORT} --strictPort`,
      url: `http://127.0.0.1:${PORT}`,
      env: { VITE_PIXEL_LOOK: '1' },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --port ${PUBLIC_PORT} --strictPort`,
      url: `http://127.0.0.1:${PUBLIC_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});

import { test } from '@playwright/test';

interface LevelInfo {
  id: string;
  title: string;
  solutionCss: string;
}

/**
 * Скриншоты сцены каждого уровня — до и после решения — для проверки контента глазами.
 * Запуск: GALLERY=1 npx playwright test gallery  →  test-results/gallery/
 */
test('галерея уровней', async ({ page }) => {
  test.skip(!process.env.GALLERY, 'Запускается вручную: GALLERY=1 npx playwright test gallery');
  test.setTimeout(180_000);
  await page.goto('/');
  const levels = await page.evaluate<LevelInfo[]>(
    "import('/src/levels/index.ts').then((m) => m.allLevels.map((l) => ({ id: l.id, title: l.title, solutionCss: l.solutionCss })))",
  );
  for (const level of levels) {
    await page.goto(`/#/level/${level.id}`);
    await page.getByRole('heading', { name: level.title }).waitFor();
    await page.locator('.stage__status').waitFor();
    await page.locator('.stage').screenshot({ path: `test-results/gallery/${level.id}-start.png` });
    await page.locator('.cm-content').fill(level.solutionCss);
    await page.getByText(/На месте: (\d+) из \1$/).waitFor();
    await page.locator('.stage').screenshot({ path: `test-results/gallery/${level.id}-solved.png` });
  }
});

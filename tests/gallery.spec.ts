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
  // Испытания районов пройдены — гостю открыты все уровни
  await page.addInitScript(() => {
    if (localStorage.getItem('cascadia.progress.v1')) return;
    const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
    localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'flex-13': done, 'grid-09': done, 'mq-04': done }));
  });
  await page.goto('/');
  const levels = await page.evaluate<LevelInfo[]>(
    "import('/src/levels/index.ts').then((m) => m.allLevels.map((l) => ({ id: l.id, title: l.title, solutionCss: l.solutionCss })))",
  );
  for (const level of levels) {
    await page.goto(`/#/level/${level.id}`);
    await page.getByRole('heading', { name: level.title }).waitFor();
    await page.locator('.stage__status').waitFor();
    await page.locator('.stage').screenshot({ path: `test-results/gallery/${level.id}-start.png` });
    // fill() у CodeMirror иногда вставляет текст, не выделив старый
    await page.locator('.cm-content').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(level.solutionCss);
    await page.getByText(/На месте: (\d+) из \1$/).waitFor();
    await page.locator('.stage').screenshot({ path: `test-results/gallery/${level.id}-solved.png` });
  }
});

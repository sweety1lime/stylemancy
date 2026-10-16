import { expect, test } from '@playwright/test';

interface LevelInfo {
  id: string;
  title: string;
  kind: 'css' | 'html' | 'js';
  solution: string;
}

/**
 * Скриншоты сцены каждого уровня — до и после решения — для проверки контента глазами.
 * Запуск: GALLERY=1 npx playwright test gallery  →  test-results/gallery/
 * Только часть уровней: GALLERY=box-,pos-01 — по началу id через запятую.
 */
test('галерея уровней', async ({ page }) => {
  test.skip(!process.env.GALLERY, 'Запускается вручную: GALLERY=1 npx playwright test gallery');
  test.setTimeout(300_000);
  // Испытания районов пройдены — гостю открыты все уровни
  await page.addInitScript(() => {
    // Лёгкие эффекты: на скриншотах предметы стоят, а не летят
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light' }));
    if (localStorage.getItem('cascadia.progress.v1')) return;
    const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
    const gates = ['flex-13', 'grid-09', 'mq-04', 'tag-07', 'fair-08', 'sem-07', 'box-08', 'disp-05', 'sel-10', 'ps-06', 'js-08', 'if-08', 'loop-07', 'fn-08', 'arr-08'];
    localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(gates.map((id) => [id, done]))));
  });
  await page.goto('/');
  const levels = await page.evaluate<LevelInfo[]>(
    "import('/src/levels/index.ts').then((m) => m.allLevels.map((l) => ({ id: l.id, title: l.title, kind: l.kind ?? 'css', solution: l.kind === 'html' ? l.solutionHtml : l.kind === 'js' ? l.solutionJs : l.solutionCss })))",
  );
  const prefixes = process.env.GALLERY === '1' ? [''] : (process.env.GALLERY ?? '').split(',');
  for (const level of levels.filter((l) => prefixes.some((prefix) => l.id.startsWith(prefix)))) {
    await page.goto(`/#/level/${level.id}`);
    await page.getByRole('heading', { name: level.title }).waitFor();
    await page.locator(level.kind === 'css' ? '.stage__status' : '.goals').waitFor();
    await page.locator('.stage').screenshot({ path: `test-results/gallery/${level.id}-start.png` });
    // fill() у CodeMirror иногда вставляет текст, не выделив старый
    await page.locator('.cm-content').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(level.solution);
    if (level.kind === 'css') await page.getByText(/На месте: (\d+) из \1$/).waitFor();
    else await expect(page.locator('.goals__head')).toHaveText(/(\d+) из \1$/);
    await page.locator('.stage').screenshot({ path: `test-results/gallery/${level.id}-solved.png` });
  }
});

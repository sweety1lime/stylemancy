import { expect, test } from '@playwright/test';

/**
 * Игра, какой её видят на сайте: сервер без VITE_PIXEL_LOOK (см. playwright.config.ts), пиксельный вид спрятан.
 * Раньше игрок мог выбрать его лунным значком в шапке, и выбор остался в браузере.
 */
test('пиксельного вида на сайте нет: значка нет, а сохранённый «pixel» открывает «Сумрак»', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'pixel' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/look-noir/);

  // Звук и эффекты на месте, третьего значка (вид игры) нет
  await expect(page.getByRole('button', { name: 'Звук' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Полные эффекты' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Вид «Сумрак»' })).toHaveCount(0);

  // Включить пиксельный вид не получится и из кода
  await page.evaluate(`import('/src/game/settings.ts').then((m) => m.settings.update({ look: 'pixel' }))`);
  await expect(page.locator('html')).toHaveClass(/look-noir/);
  expect(await page.evaluate(`import('/src/game/settings.ts').then((m) => m.settings.get().look)`)).toBe('noir');

  // Уровень и летопись тоже в «Сумраке»: герой у кнопки «Сотворить» нарисован силуэтом, а не пикселями
  await page.goto('/#/level/sel-01');
  await expect(page.locator('.hero--noir').first()).toBeVisible();
  await expect(page.locator('.hero:not(.hero--noir) .sprite-anim')).toHaveCount(0);
});

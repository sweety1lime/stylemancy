import { expect, test } from '@playwright/test';

/** Код сцены уровня: оформление вида лежит в <style id="look"> внутри iframe */
const lookCss = (frame: HTMLIFrameElement) => frame.contentDocument?.getElementById('look')?.textContent ?? '';

test('вид «Сумрак» по умолчанию: переключатель, карта и уровень Парящих островов', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('dialog', { name: 'Пролог: Великий Сброс' }).getByRole('button', { name: 'Пропустить' }).click();
  // «Сумрак» — вид по умолчанию; переключатель с луной возвращает прежний пиксель-арт и обратно
  await expect(page.locator('html')).toHaveClass(/look-noir/);
  await page.getByRole('button', { name: 'Вид «Сумрак»' }).click();
  await expect(page.locator('html')).not.toHaveClass(/look-noir/);
  await page.getByRole('button', { name: 'Вид «Сумрак»' }).click();
  await expect(page.locator('html')).toHaveClass(/look-noir/);
  // Земли на карте — силуэты скал с эмблемами, герой — силуэт на шарнирах
  await expect(page.locator('.noir-land').first()).toBeVisible();
  await expect(page.locator('.land__hero--noir')).toBeVisible();

  // Сцена уровня в «Сумраке», а проверка решения работает как обычно: оформление не двигает предметы
  await page.goto('/#/level/flex-01');
  await expect(page.getByRole('heading', { name: 'Пробуждение' })).toBeVisible();
  await expect.poll(() => page.locator('.scene__frame').first().evaluate(lookCss)).toContain('.island');
  await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
  await page.keyboard.type('display: flex;');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.locator('.hero--noir')).toBeVisible();

  // Выбор вида хранится в настройках этого компьютера
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/look-noir/);
  await expect(page.locator('.hero--noir')).toBeVisible();
});

test('вид «Сумрак» в Крепости Блоков: свой слой оформления, проверка блочной модели не сбита', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/#/level/box-01');
  await expect(page.getByRole('heading', { name: 'Ящик по мерке' })).toBeVisible();
  await expect.poll(() => page.locator('.scene__frame').first().evaluate(lookCss)).toContain('.barracks');
  await expect(page.getByText('На месте: 0 из 1')).toBeVisible();
  // Оформление меняет только картинки: ящик нужного размера встаёт на место, как в пиксельном виде
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('.crate { width: 160px; height: 96px; }');
  await expect(page.getByText('На месте: 1 из 1')).toBeVisible();
});

import { expect, test, type Page } from '@playwright/test';

async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

const cast = (page: Page) => page.getByRole('button', { name: /Сотворить/ }).click();

test('слепая магия: Оракул молчит до заклинания, верное предсказание даёт XP один раз', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/#/level/js-01');
  await expect(page.getByRole('heading', { name: 'Первое слово' })).toBeVisible();
  const scroll = page.locator('.oracle-scroll');

  // Без слепой магии Оракул повторяет вывод сразу, пока студент печатает
  await typeCode(page, "console.log('Привет, Скриптория!');");
  await expect(scroll).toContainText('Привет, Скриптория!');

  // Включили слепую магию: свиток опустел, а вывод скрыт, хотя код уже запущен
  await page.getByRole('button', { name: 'Слепая магия' }).click();
  await expect(page.getByRole('button', { name: 'Слепая магия' })).toHaveAttribute('aria-pressed', 'true');
  await expect(scroll).toContainText('Оракул слушает…');
  await expect(scroll).not.toContainText('Привет, Скриптория!');

  // Неверное предсказание: свиток открылся, вердикт показывает, что ждали и что вышло
  await page.getByLabel(/Что напечатает Оракул/).fill('Привет');
  await cast(page);
  await expect(page.getByText('Предсказание не совпало')).toBeVisible();
  await expect(page.locator('.predict__diff').last()).toContainText('Привет, Скриптория!');
  await expect(scroll).toContainText('Привет, Скриптория!');
  await expect(page.locator('.predict__right')).toHaveCount(0);

  // Код изменился: свиток снова закрыт, старый вердикт убран
  await typeCode(page, "console.log('Привет, Скриптория!'); // раз");
  await expect(page.getByText('Предсказание не совпало')).toHaveCount(0);
  await expect(scroll).not.toContainText('Привет, Скриптория!');

  // Верное предсказание: +5 XP
  await page.getByLabel(/Что напечатает Оракул/).fill('  Привет, Скриптория!  ');
  await cast(page);
  await expect(page.locator('.predict__right')).toContainText('Предсказание верно');
  await expect(page.locator('.predict__right strong')).toHaveText('+5 XP');

  // Во второй раз на том же уровне: предсказание верно, но награды уже нет
  await typeCode(page, "console.log('Привет, Скриптория!'); // два");
  await page.getByLabel(/Что напечатает Оракул/).fill('Привет, Скриптория!');
  await cast(page);
  await expect(page.locator('.predict__right')).toContainText('Предсказание верно');
  await expect(page.locator('.predict__right strong')).toHaveCount(0);
});

test('слепая магия есть только там, где Оракул что-то говорит', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
    const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
    // Лабиринт: открыты районы до «Развилок»
    localStorage.setItem('cascadia.progress.v1', JSON.stringify({ 'js-08': done, 'if-01': done }));
  });
  await page.goto('/#/level/if-01');
  await expect(page.getByRole('button', { name: /Сотворить/ })).toBeVisible();
  // Это подземелье: герой ходит по приказам, выводить нечего
  await expect(page.getByRole('button', { name: 'Слепая магия' })).toHaveCount(0);
});

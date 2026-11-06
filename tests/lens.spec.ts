import { expect, test } from '@playwright/test';

test('лупа мага: нажать на предмет — размеры, коробка и кто победил по правилам, всё пересчитывается при вводе', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/#/level/sel-01');
  await expect(page.getByRole('heading', { name: 'Указатель на опушке' })).toBeVisible();
  await expect(page.getByText('На месте: 0 из 4')).toBeVisible();

  // Пока лупа выключена, панели нет и сцена не ловит нажатия
  await expect(page.getByText('Лупа мага')).toHaveCount(0);
  await page.getByRole('button', { name: 'Лупа' }).click();
  await expect(page.getByText('Нажми на предмет в сцене')).toBeVisible();

  // Нажимаем на строку «Строка 1»: лупа показывает коробку и правило из кода студента
  const line = await page.frameLocator('.scene__frame').first().locator('p').first().boundingBox();
  if (!line) throw new Error('строка сцены не найдена');
  await page.mouse.click(line.x + line.width / 2, line.y + line.height / 2);
  const panel = page.locator('.lens');
  await expect(panel.getByRole('heading', { name: /Строка 1/ })).toBeVisible();
  await expect(panel.locator('.lens-box__content')).toContainText('×');
  await expect(panel.locator('.lens__win')).toContainText('color: gold');
  await expect(panel.locator('.lens__win')).toContainText('твой код');

  // Студент дописал более сильный селектор: лупа сразу показывает нового победителя и объясняет, почему старый проиграл
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText('p { color: gold; }\n.sign p { color: tomato; }');
  await expect(panel.locator('.lens__win')).toContainText('color: tomato');
  await expect(panel.locator('.lens__win')).toContainText('.sign p');
  await expect(panel.locator('.lens__lose')).toContainText('селектор слабее');

  // Лупу выключили: панель и выбор исчезают
  await page.getByRole('button', { name: 'Лупа' }).click();
  await expect(page.locator('.lens')).toHaveCount(0);
});

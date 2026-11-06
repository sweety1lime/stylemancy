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

test('лупа мага работает без мыши: предметы выбираются кнопками, а Tab и Enter достаточно', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/#/level/sel-01');
  await expect(page.getByRole('heading', { name: 'Указатель на опушке' })).toBeVisible();

  // Лупа включается с клавиатуры, а следующая по Tab кнопка — первый предмет сцены
  await page.getByRole('button', { name: 'Лупа' }).focus();
  await page.keyboard.press('Enter');
  const items = page.getByRole('group', { name: 'Выбрать предмет' });
  await expect(items.getByRole('button')).toHaveCount(4);
  // В этом уровне предметы идут так: «Заголовок 1», «Строка 1», «Заголовок 2», «Строка 2»
  await page.keyboard.press('Tab');
  await expect(items.getByRole('button', { name: 'Заголовок 1' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(items.getByRole('button', { name: 'Строка 1' })).toBeFocused();
  await page.keyboard.press('Enter');

  // То же, что нажатие мышью: разбор предмета, правило из кода, рамка на сцене и отметка на кнопке
  const panel = page.locator('.lens');
  await expect(panel.getByRole('heading', { name: /Строка 1/ })).toBeVisible();
  await expect(panel.locator('.lens__win')).toContainText('color: gold');
  await expect(items.getByRole('button', { name: 'Строка 1' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.scene__mark--pick')).toBeVisible();

  // Дальше по Tab: «Заголовок 2», потом «Строка 2»
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(items.getByRole('button', { name: 'Строка 2' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('heading', { name: /Строка 2/ })).toBeVisible();
  await expect(items.getByRole('button', { name: 'Строка 2' })).toHaveAttribute('aria-pressed', 'true');
  await expect(items.getByRole('button', { name: 'Строка 1' })).toHaveAttribute('aria-pressed', 'false');
});

test('лупа мага: в заказе жителя кнопки называют части заказа, а выбранная часть разбирается', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true, 'intro:market': true } }));
    const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
    localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(['flex-13', 'grid-09', 'mq-04'].map((id) => [id, done]))));
  });
  await page.goto('/#/level/order-04');
  await expect(page.getByRole('heading', { name: 'Заказ: Шапка лавки' })).toBeVisible();
  await page.getByRole('button', { name: 'Лупа' }).click();
  const items = page.getByRole('group', { name: 'Выбрать предмет' });
  await expect(items.getByRole('button')).toHaveText(['Логотип', 'Меню', 'Корзина']);
  await items.getByRole('button', { name: 'Меню' }).click();
  await expect(page.locator('.lens').getByRole('heading', { name: /Меню/ })).toBeVisible();
});

/** Три «дела» Древа Каскада: виновник спрятан в оформлении сцены, и без лупы его не найти */
for (const { id, title, victim, culprit } of [
  { id: 'cas-07', title: 'Дело первое: Тусклые светлячки', victim: 'Светлячок 1', culprit: ['#night .firefly', 'оформление сцены', 'сила 1,1,0'] },
  { id: 'cas-08', title: 'Дело второе: Упрямый мухомор', victim: 'Мухомор', culprit: ['color: gray !important', 'оформление сцены'] },
  { id: 'cas-09', title: 'Дело третье: Пропавшее наследство', victim: 'Лист 1', culprit: ['.tree .leaf', 'оформление сцены', 'сила 0,2,0'] },
]) {
  test(`расследование ${id}: лупа называет скрытого виновника, и после правки заклинание срабатывает`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
      localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true, 'intro:cascade-tree': true } }));
      const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
      localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(['sel-10', 'ps-06'].map((key) => [key, done]))));
    });
    await page.goto(`/#/level/${id}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    const solution = await page.evaluate<string>(`import('/src/levels/index.ts').then((m) => m.allLevels.find((item) => item.id === '${id}').solutionCss)`);

    // Код студента верен на вид, но заклинание не срабатывает
    await page.getByRole('button', { name: /Сотворить/ }).click();
    await expect(page.getByText('Заклинание не сработало')).toBeVisible();

    // Лупа называет, кто побеждает и откуда он: из кода студента этого не узнать
    await page.getByRole('button', { name: 'Лупа' }).click();
    await page.getByRole('group', { name: 'Выбрать предмет' }).getByRole('button', { name: victim }).click();
    const winner = page.locator('.lens__win');
    for (const part of culprit) await expect(winner).toContainText(part);

    await page.locator('.cm-content').click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(solution);
    await page.getByRole('button', { name: /Сотворить/ }).click();
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  });
}

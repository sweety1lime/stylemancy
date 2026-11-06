import { expect, test, type Page } from '@playwright/test';

/** Прочитать сегодняшний свиток: развернуть и ответить на все вопросы (первый вариант, потом «Дальше») */
async function readScroll(page: Page) {
  await page.getByRole('button', { name: 'Развернуть свиток' }).click();
  for (let i = 1; i <= 3; i++) {
    await expect(page.getByText(`Вопрос ${i} из 3`)).toBeVisible();
    await page.locator('.review__option').first().click();
    await page.getByRole('button', { name: 'Дальше' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Свиток прочитан' })).toBeVisible();
}

test('свиток дня: три вопроса, серия растёт по дням и обрывается после пропуска', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-06T10:00:00') });
  await page.addInitScript(() => {
    // Только при первой загрузке: после перезагрузки прогресс и серия должны сохраняться
    if (localStorage.getItem('cascadia.progress.v1')) return;
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
    const done = { completed: true, stars: 3, attempts: 1, hintsUsed: 0 };
    const ids = ['flex-01', 'flex-02', 'flex-03', 'flex-04', 'sel-01', 'sel-02', 'sel-03', 'box-01', 'box-02', 'tag-01', 'tag-02', 'tag-03'];
    localStorage.setItem('cascadia.progress.v1', JSON.stringify(Object.fromEntries(ids.map((id) => [id, done]))));
  });
  const flame = page.getByRole('link', { name: /Свиток дня: серия/ });

  // День 1: свиток ждёт, серии нет
  await page.goto('/#/daily');
  await expect(flame).toHaveAccessibleName(/серия 0 дн.*ждёт/);
  await readScroll(page);
  await expect(page.getByText('Серия: 1 день подряд')).toBeVisible();
  await expect(flame).toHaveAccessibleName(/серия 1 дн.*прочитан/);

  // Тот же день после перезагрузки: свиток остаётся прочитанным, второй раз за XP его не пройти
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Свиток прочитан' })).toBeVisible();

  // День 2: огонёк ещё горит (серия 1), но тускнеет: свиток снова ждёт. Прочитал — серия 2
  await page.clock.setSystemTime(new Date('2026-11-07T10:00:00'));
  await page.reload();
  await expect(flame).toHaveAccessibleName(/серия 1 дн.*ждёт/);
  await readScroll(page);
  await expect(page.getByText('Серия: 2 дня подряд')).toBeVisible();

  // Пропуск двух дней: серия оборвалась, новая начинается с одного дня, рекорд помнится
  await page.clock.setSystemTime(new Date('2026-11-10T10:00:00'));
  await page.reload();
  await expect(flame).toHaveAccessibleName(/серия 0 дн.*ждёт/);
  await readScroll(page);
  await expect(page.getByText('Серия: 1 день подряд')).toBeVisible();
  await expect(page.getByText(/Твой рекорд: 2 дня/)).toBeVisible();
});

test('свиток дня: без выученных заклинаний он пуст и подсказывает, что делать', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } })));
  await page.goto('/#/daily');
  await expect(page.getByRole('heading', { name: 'Свиток пока пуст' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Развернуть свиток' })).toHaveCount(0);
});

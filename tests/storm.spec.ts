import { expect, test, type Page } from '@playwright/test';

async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(code);
}

test('хаос-тест: раскладка «на глаз» держит основную сцену, но не шторм; настоящая — держит обе', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light', look: 'noir' }));
    localStorage.setItem('cascadia.stats.v1', JSON.stringify({ seen: { 'prologue:game': true } }));
  });
  await page.goto('/#/level/flex-03');
  await expect(page.getByRole('heading', { name: 'Равновесие' })).toBeVisible();

  // Под основной сценой — шторм с другим числом кристаллов, и Лорд Дефолт предупреждает о нём
  await expect(page.getByText('Обычная сцена')).toBeVisible();
  await expect(page.getByText('Шторм · кристаллов стало пять')).toBeVisible();
  await expect(page.getByText(/Лорд Дефолт грозит штормом/)).toBeVisible();
  await expect(page.locator('.scene__frame')).toHaveCount(2);

  // «Промежуток на глаз» под три кристалла даёт те же места, что и space-between, но при пяти кристаллах они сожмутся и сдвинутся
  const sizes = await page
    .frameLocator('.scene__frame')
    .first()
    .locator('.island')
    .evaluate((island) => ({ island: island.getBoundingClientRect().width, crystal: (island.querySelector('.crystal') as HTMLElement).getBoundingClientRect().width }));
  const gap = (sizes.island - 3 * sizes.crystal) / 2;
  await typeCode(page, `.island {
  display: flex;
  gap: ${gap}px;
}
`);
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание не сработало')).toBeVisible();
  await expect(page.locator('.result__list')).toContainText('Шторм «кристаллов стало пять»');

  // space-between растягивает любое число кристаллов поровну
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: space-between;\n}\n');
  await expect(page.getByText(/На месте: (\d+) из \1$/)).toBeVisible();
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
});

import { expect, test, type Page } from '@playwright/test';

const SCREENS = 'test-results/screens';

async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').fill(code);
}

test('ученик проходит первый уровень', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Пробуждение' })).toBeVisible();
  // В стартовом коде на месте только первый кристалл
  await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/01-start.png`, fullPage: true });

  await typeCode(page, '.island {\n  display: flex;\n}\n');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByRole('img', { name: '3 из 3 звёзд' }).last()).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/02-success.png`, fullPage: true });

  await page.getByRole('button', { name: 'Дальше →' }).click();
  await expect(page.getByRole('heading', { name: 'Попутный ветер' })).toBeVisible();
});

test('опечатка в значении объясняется по-человечески', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Уровень 2/ }).click();
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: centre;\n}\n');
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText(/Может, center\?/)).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/03-typo.png`, fullPage: true });
});

test('промах: подсказываем, куда сдвинуть кристалл', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Уровень 2/ }).click();
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: center;\n}\n');
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Аметист: нужно на 132px правее.')).toBeVisible();
});

test('чужая магия запрещена, подсказки снимают звёзды', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Уровень 3/ }).click();
  await typeCode(page, '.island {\n  display: flex;\n  padding-left: 100px;\n}\n');
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText(/только магия Flexbox: padding-left не подойдёт/)).toBeVisible();

  await page.getByRole('button', { name: /Подсказка 1 из 3/ }).click();
  await expect(page.getByText('Снова распределяем кристаллы', { exact: false })).toBeVisible();
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: space-between;\n}\n');
  await page.getByRole('button', { name: /Сотворить/ }).click();
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByText('1 подсказка: −1 ★')).toBeVisible();
});

test.describe('на телефоне', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('сцена и редактор помещаются по ширине', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    // Если страница шире экрана — перечисляем, что вылезает за правый край
    const offenders = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${el.className} → ${Math.round(el.getBoundingClientRect().right)}px`),
    );
    expect(overflow, offenders.join(', ')).toBeLessThanOrEqual(0);
    await page.locator('.code-editor').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENS}/04-phone.png`, fullPage: true });
  });
});

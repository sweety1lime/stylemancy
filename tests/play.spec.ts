import { expect, test, type Page } from '@playwright/test';

const SCREENS = 'test-results/screens';

async function openLevel(page: Page, n: number) {
  await page.goto(`/#/level/flex-${String(n).padStart(2, '0')}`);
}

async function typeCode(page: Page, code: string) {
  await page.locator('.cm-content').fill(code);
}

async function cast(page: Page) {
  await page.getByRole('button', { name: /Сотворить/ }).click();
}

/** Сколько элементов вылезает за правый край экрана — для проверки на телефоне. */
async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const offenders = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('body *'))
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className} → ${Math.round(el.getBoundingClientRect().right)}px`),
  );
  expect(overflow, offenders.join(', ')).toBeLessThanOrEqual(0);
}

test('путь от карты до первого уровня и победа', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/00-map.png`, fullPage: true });

  await page.getByRole('link', { name: /Парящие земли/ }).click();
  await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/00-trail.png`, fullPage: true });

  await page.getByRole('link', { name: 'Уровень 1: Пробуждение' }).click();
  await expect(page.getByRole('heading', { name: 'Пробуждение' })).toBeVisible();
  // В стартовом коде на месте только первый кристалл
  await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/01-start.png`, fullPage: true });

  // Курсор уже в редакторе, а заготовка-комментарий выделена — можно сразу печатать
  await page.keyboard.type('display: flex;');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByRole('img', { name: '3 из 3 звёзд' }).last()).toBeVisible();
  await expect(page.getByText('+25 XP')).toBeVisible();
  await expect(page.locator('.rank__xp')).toHaveText('25 XP');
  await page.screenshot({ path: `${SCREENS}/02-success.png`, fullPage: true });

  await page.getByRole('button', { name: 'Дальше →' }).click();
  await expect(page.getByRole('heading', { name: 'Попутный ветер' })).toBeVisible();

  // Пройденный уровень отмечен на тропе, а на карте появилась кнопка «Продолжить»
  await page.goto('/#/land/floating-lands');
  await expect(page.getByRole('img', { name: '3 из 3 звёзд' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Продолжить: Попутный ветер' })).toBeVisible();
});

test('опечатка в значении объясняется по-человечески', async ({ page }) => {
  await openLevel(page, 2);
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: centre;\n}\n');
  await cast(page);
  await expect(page.getByText(/Может, center\?/)).toBeVisible();
  await page.screenshot({ path: `${SCREENS}/03-typo.png`, fullPage: true });
});

test('промах: одинаковый сдвиг всех кристаллов — одной фразой', async ({ page }) => {
  await openLevel(page, 2);
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: center;\n}\n');
  await cast(page);
  await expect(page.getByText('Все кристаллы смещены одинаково — нужно на 132px правее.')).toBeVisible();
});

test('чужая магия запрещена, подсказки снимают звёзды', async ({ page }) => {
  await openLevel(page, 3);
  await typeCode(page, '.island {\n  display: flex;\n  padding-left: 100px;\n}\n');
  await cast(page);
  await expect(page.getByText(/только магия Flexbox: padding-left не подойдёт/)).toBeVisible();

  await page.getByRole('button', { name: /Подсказка 1 из 3/ }).click();
  await expect(page.getByText('Снова распределяем кристаллы', { exact: false })).toBeVisible();
  await typeCode(page, '.island {\n  display: flex;\n  justify-content: space-between;\n}\n');
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByText('1 подсказка: −1 ★')).toBeVisible();
});

test('порядок в строю: нужен order, разворот ряда запрещён', async ({ page }) => {
  await openLevel(page, 10);
  // Разворот ряда даёт ту же картинку, но уровень учит order
  await typeCode(page, '.island {\n  display: flex;\n  flex-direction: row-reverse;\n  justify-content: center;\n  align-items: center;\n}\n');
  await expect(page.getByText('На месте: 3 из 3')).toBeVisible();
  await cast(page);
  await expect(page.getByText('В этом испытании нельзя использовать flex-direction.')).toBeVisible();

  await typeCode(
    page,
    '.island {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.ruby {\n  order: -1;\n}\n\n.amethyst {\n  order: 1;\n}\n',
  );
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
});

test('сжатые кристаллы: одна понятная фраза вместо девяти', async ({ page }) => {
  await openLevel(page, 9);
  await cast(page);
  await expect(page.getByText('Все кристаллы не того размера — каждому нужно шире на 13px.')).toBeVisible();
});

test('после последнего уровня — итог района и дорога на тропу', async ({ page }) => {
  await openLevel(page, 13);
  await typeCode(
    page,
    '.island {\n  display: flex;\n  justify-content: center;\n  align-items: flex-end;\n  gap: 16px;\n}\n\n.sapphire {\n  align-self: flex-start;\n}\n',
  );
  await cast(page);
  await expect(page.getByText('Заклинание сработало!')).toBeVisible();
  await expect(page.getByText(/Пройдено уровней: 1 из 13/)).toBeVisible();
  await page.getByRole('link', { name: '← К тропе' }).click();
  await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
});

test.describe('на телефоне', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('карта, тропа и уровень помещаются по ширине', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.screenshot({ path: `${SCREENS}/04-phone-map.png`, fullPage: true });

    await page.goto('/#/land/floating-lands');
    await expect(page.getByRole('heading', { name: 'Парящие острова' })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await openLevel(page, 1);
    await expect(page.getByText('На месте: 1 из 3')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.locator('.code-editor').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENS}/04-phone-level.png`, fullPage: true });
  });
});

test.describe('достижения', () => {
  test('своё решение и первое заклинание', async ({ page }) => {
    await openLevel(page, 2);
    // flex-end у наставника, а end — другой верный путь
    await typeCode(page, '.island {\n  display: flex;\n  justify-content: end;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await expect(page.locator('.result__achievements')).toContainText('Свой путь');
    await expect(page.locator('.result__achievements')).toContainText('Первое заклинание');
  });

  test('секрет Лорда Дефолта и страница достижений', async ({ page }) => {
    await openLevel(page, 1);
    await typeCode(page, '.island {\n  display: flex;\n  font-family: "Times New Roman";\n}\n');
    await cast(page);
    await expect(page.locator('.toast')).toContainText('Заклинание Лорда Дефолта');

    await page.goto('/#/achievements');
    await expect(page.getByRole('heading', { name: 'Достижения' })).toBeVisible();
    await expect(page.getByText(/Получено 1 из \d+/)).toBeVisible();
    // Остальные секретные скрыты
    await expect(page.getByText('???').first()).toBeVisible();
    await page.screenshot({ path: `${SCREENS}/05-achievements.png`, fullPage: true });
  });
});

test.describe('гримуар', () => {
  test('запись, живой пример, заметка и шпаргалка для печати', async ({ page }) => {
    await openLevel(page, 1);
    await typeCode(page, '.island {\n  display: flex;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();

    await page.goto('/#/grimoire');
    await expect(page.getByRole('heading', { name: 'Гримуар' })).toBeVisible();
    await expect(page.getByText(/Изучено 1 из \d+ заклинаний/)).toBeVisible();
    await expect(page.getByRole('heading', { name: '???' }).first()).toBeVisible();

    // Живой пример: кнопка значения меняет мини-сцену и код
    await page.getByRole('button', { name: 'block', exact: true }).click();
    await expect(page.locator('.example__code').first()).toContainText('display: block;');
    // При display: block блоки встают друг под другом — проверяем саму мини-сцену
    const stacked = await page
      .locator('.example__preview')
      .first()
      .evaluate((frame: HTMLIFrameElement) => {
        const items = frame.contentDocument?.querySelectorAll('.item') ?? [];
        return items.length > 1 && items[1].getBoundingClientRect().top > items[0].getBoundingClientRect().top;
      });
    expect(stacked).toBe(true);

    await page.getByRole('textbox').first().fill('Флекс выстраивает детей в ряд');
    await page.reload();
    await expect(page.getByRole('textbox').first()).toHaveValue('Флекс выстраивает детей в ряд');
    await page.screenshot({ path: `${SCREENS}/06-grimoire.png`, fullPage: true });

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.example__chips').first()).toBeHidden();
    await expect(page.getByText('Мои заметки: Флекс выстраивает детей в ряд')).toBeVisible();
    await page.screenshot({ path: `${SCREENS}/07-grimoire-print.png`, fullPage: true });
  });

  test('вопрос на повторение после второго нового уровня', async ({ page }) => {
    await openLevel(page, 1);
    await typeCode(page, '.island {\n  display: flex;\n}\n');
    await cast(page);
    await expect(page.getByText('Заклинание сработало!')).toBeVisible();
    await expect(page.getByText('Вопрос на повторение', { exact: false })).toHaveCount(0);

    await page.getByRole('button', { name: 'Дальше →' }).click();
    await typeCode(page, '.island {\n  display: flex;\n  justify-content: flex-end;\n}\n');
    await cast(page);
    await expect(page.getByText(/Вопрос на повторение/)).toBeVisible();
    await page.getByRole('button', { name: 'Выстраивает их вдоль главной оси — по умолчанию в ряд' }).click();
    await expect(page.getByText(/Верно! \+5 XP/)).toBeVisible();
    await expect(page.locator('.rank__xp')).toHaveText('55 XP');
    await page.screenshot({ path: `${SCREENS}/08-review.png`, fullPage: true });
  });
});
